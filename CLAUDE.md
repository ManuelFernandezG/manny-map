# Manny Map — Claude Code Rules

## Project
Nightlife-first anonymous rating app. Users check in to bars/clubs before going, then leave an emoji review after. Ratings are aggregated by age group and gender, with divergence detection when groups disagree.
Ottawa only for live venue data (4 cities exist in code but only Ottawa has locations).

## Stack
- **Frontend:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Maps:** Leaflet + Esri World Imagery satellite tiles; circle markers (canvas)
- **Backend:** Firebase Firestore (reviews only) + Cloud Functions (`onRatingWritten` trigger)
- **Auth:** Firebase Auth — Google sign-in only; anonymous fallback via localStorage
- **Cache:** TanStack React Query (`staleTime` 30min / `gcTime` 60min for location stats)
- **Hosting:** Vercel (manual deploys via deploy hook script)

## Architecture
- **Locations are static:** `src/data/nightlifeLocations.ts` — no Firestore reads (quota protection)
- **Firebase for reviews only:** subcollection `locations/{locationId}/ratings/{ratingId}`
- **Nightlife-first:** Only Bar + Club active; `CategoryFilter` hardcoded to show Nightlife group only
- **Anonymous users:** prefers Firebase Auth UID; fallback to `mannymap_user_id` in localStorage (`user_{timestamp}_{random}`)
- **Auth migration:** On Google sign-in, `AuthContext` batch-updates all existing Firestore ratings from the old anonymous `mannymap_user_id` to the new Firebase Auth UID (runs once per account, tracked by `mannymap_auth_migrated`)
- **2-phase rating:** Phase 1 = check-in (demographics + travel/group data) → Phase 2 = emoji review
- **Aggregation:** Cloud Function `onRatingWritten` fires on every write — re-reads all ratings for location, runs `computeAggregates()`, writes back to location doc (1 read + 1 write per event)

## Routes
| Route | Component | Notes |
|-------|-----------|-------|
| `/` | `Landing` | Public landing page |
| `/map` | `Index` | Main map page — satellite map + all modals |
| `/ratings` | `Ratings` | Personal ratings dashboard with compare mode |
| `/profile` | `Profile` | Rating history, theme, account actions |
| `/splash` | `Splash` | 1.8s loading splash → redirects to `/` |

## Key Files
- `src/data/nightlifeLocations.ts` — source of truth for all location data
- `src/data/mockData.ts` — constants: `VIBE_EMOJIS`, `PHASE_LABELS`, `AGE_GROUPS`, `GENDERS`, `GROUP_SIZE_OPTIONS`, `COMPANION_OPTIONS`, `WAIT_TIME_OPTIONS`, `CITIES`, `CATEGORY_GROUPS`, `CATEGORY_COLORS`
- `src/data/googleData.ts` — static Google ratings/review counts per location ID
- `src/data/seedStats.ts` — static mock stats; loaded by `getLocationStats()` when `VITE_MOCK_STATS=true` (dev/screenshot mode, no Firestore reads)
- `src/lib/ratings.ts` — `submitCheckin()`, `submitReview()`, `getLocationStats()`, `getLeaderboard()`, `getUserRating()`; all Firebase writes; user rating cache via `mannymap_user_ratings_cache`
- `src/lib/userId.ts` — anonymous user ID + rating count + rated location tracking (localStorage)
- `src/contexts/AuthContext.tsx` — Firebase Auth context (`useAuth` hook); Google sign-in via popup; anonymous → auth UID migration on sign-in
- `src/hooks/useLocations.ts` — returns static locations filtered by city (React Query)
- `src/hooks/useTheme.ts` — dark/light/system theme; reads/writes `mannymap_theme` in localStorage
- `src/pages/Index.tsx` — main map page; owns all modal state; handles deep-linking (`?review=`, `?rate=`); lazy-loads heavy components; loads leaderboard on mount; map pans to selected search result; renders `TopLocationCard` below search bar
- `src/pages/Ratings.tsx` — ratings dashboard; reads `NIGHTLIFE_LOCATIONS` directly + Firestore stats; compare mode
- `src/pages/Profile.tsx` — user rating history; city selector + category filter; uses `useAuth`; links to AuthModal
- `src/components/MapView.tsx` — Leaflet map with circle markers
- `src/components/Sidebar.tsx` — desktop-only (`hidden md:flex`) sidebar; logo + nav (Map/Ratings/Profile) + user avatar (Google photo or generic icon)
- `src/components/BottomNav.tsx` — mobile-only (`md:hidden`) bottom nav; dark green `#1A3A2A` bg; tabs: Map/Ratings/Profile
- `src/components/LocationSearch.tsx` — search bar overlay on map; shows Recent (max 1) + Suggestions (top 3 by checkin count); filters by name/category/address/neighborhood
- `src/components/CheckinModal.tsx` — Phase 1 check-in flow
- `src/components/ReviewModal.tsx` — Phase 2 emoji review
- `src/components/LocationDetailModal.tsx` — location info + live stats (tonight-aware: "TONIGHT" label with `checkinCountTonight` featured, "+ X from last week" secondary; falls back to "THIS WEEK" all-time data) + age breakdown + "I'm Interested" CTA
- `src/components/TopLocationCard.tsx` — floating pill below the search bar showing tonight's top venue (emoji + name + count); X to dismiss (persisted in `sessionStorage`); tapping opens `LocationDetailModal`
- `src/components/RatedCarousel.tsx` — horizontal strip of rated location cards at bottom of map; dark green cards (`#1A3A2A`), 180×84px
- `src/components/AuthModal.tsx` — Google sign-in modal; triggered after 3rd rating or from Profile
- `src/components/CategoryFilter.tsx` — dropdown filter for category groups (Nightlife only); used on Profile page; shows rated count per group
- `src/components/CitySelector.tsx` — mobile city dropdown (Ottawa/Toronto/Montreal/Guelph); used on Profile page
- `functions/src/index.ts` — Cloud Function: `onRatingWritten` trigger; writes tonight sub-aggregates to location doc; updates `meta/leaderboard` doc
- `functions/src/aggregate.ts` — `computeAggregates(ratings, tonightStartMs?)` and `getTonightStartUtcMs()` (8pm America/Toronto in UTC ms)

---

## App Flow (detailed)

### Phase 1 — Check-in

1. User opens `/map`. Satellite map loads with circle markers for Ottawa bars/clubs.
2. User taps a marker → `handleLocationClick` → `setSelectedLocation` → `LocationDetailModal` opens.
   - Shows: name, category badge, Google rating + review count (from `GOOGLE_DATA`), address, hours, description.
   - If `checkinCount >= 10` (or `checkinCountTonight > 0`): shows stats block. If tonight data exists: **"TONIGHT"** label + `checkinCountTonight` as big number + "+ X from last week" secondary. Falls back to **"THIS WEEK"** all-time data. M/F ratio bar and dominant vibe use tonight data when available. A separate **Age Breakdown** section below shows per-age-group bars; user's own age group is highlighted in primary color.
3. User taps **"I'm Interested"** → `handleLocationAction(loc)` is called.
   - Checks `ratedLocationIds` (localStorage): if `phase === "checkin"` → opens `ReviewModal`; otherwise → opens `CheckinModal`.
4. `CheckinModal` opens for a new check-in:
   - **Demographics gate** (first use only — skipped if `mannymap_age_group` + `mannymap_gender` already set):
     - Age group: `18-22 / 23-28 / 29-35 / 36+`
     - Gender: `Male / Female`
   - **Group size:** `Solo / 2-3 / 4-6 / 7+`
   - **Who with** (hidden when Solo): `Friends / Date / Family / Mixed`
   - Submit button: **"I'm Going"** (disabled until all required fields filled).
5. On submit: `submitCheckin(locationId, data)` → Firestore `addDoc` to `locations/{id}/ratings/{newId}` with `phase: "checkin"`. localStorage updated via `addCheckinLocationId`.
6. Success state: checkmark animation + gender-specific message shown inside the modal only (no bottom-right Sonner toast).
   - Male: *"You're set! / Come back for afters."*
   - Female: *"Locked in! / Debrief after your visit."*
7. Modal closes after 1.5s. `ratedLocationIds` state refreshes. Location marker updates on map.

---

### Phase 2 — Review (after visiting)

1. User returns to the app after visiting the venue.
2. Entry points (all lead to `ReviewModal`):
   - **Map marker** → `LocationDetailModal` → "I'm Interested" → `getLocationAction` sees `phase: "checkin"` → opens `ReviewModal` directly.
   - **Rated carousel** (bottom strip) → tap rate button → same `handleLocationAction` routing.
   - **Deep link** `/map?review={id}` (from Profile) → `useEffect` in `Index` finds location, calls `setReviewLocation`.
3. `ReviewModal` shows:
   - **Vibe grid** (4 options, grid-cols-4): `💀 Dead / 😴 Slow / 🔥 Fire / 🤯 Crazy`
   - **Wait to get in**: `No wait / <15 min / 15-30 min / 30+ min`
   - Submit button label is gender-specific via `phase2Label`: Males → **"Submit Afters"** / Females → **"Submit Debrief"**
4. On submit: `submitReview(locationId, review)` → queries Firestore for user's latest `checkin` doc → `updateDoc` to `phase: "reviewed"`, adds `vibe`, `waitTime`, `reviewedAt`. Falls back to `addDoc` if no checkin doc found.
5. Cloud Function `onRatingWritten` fires → `computeAggregates()` re-reads all ratings → writes aggregated fields back to location doc.
6. React Query invalidates then refetches location stats after 1.8s (Cloud Function delay buffer).
7. localStorage updated: `mannymap_rated_locations[id] = { phase: "reviewed", emoji, ratedAt }`.
8. **After 3rd total rating**: `incrementRatingCount()` returns `3`, and if `mannymap_signup_prompt_seen !== "true"` → `AuthModal` opens 2s later. Shown once ever.

---

### Gender-Specific Language

The app uses different language depending on `mannymap_gender`:
| Gender | Phase 1 label | Phase 2 label | Check-in modal | Review toast |
|--------|--------------|--------------|----------------|-------------|
| Male | Pre | Afters | "You're set! / Come back for afters." | "Afters saved!" |
| Female | Plans | Debrief | "Locked in! / Debrief after your visit." | "Debrief saved!" |

---

### Deep Link Flow

- `/map?review={id}` — `Index` `useEffect` fires when locations load, finds location by ID, calls `setReviewLocation(loc)` → `ReviewModal` opens directly. Clears param via `setSearchParams({}, { replace: true })`.
- `/map?rate={id}` — same but calls `handleLocationAction(loc)` → routes to `CheckinModal` or `ReviewModal` based on current phase.
- Both deep links are used by Profile page: **"Review"** (phase2 label) button → `?review=`, **"Re-rate"** button → `?rate=`.

---

### Rated Carousel

- Rendered at bottom of `/map` page (72px above bottom, i.e. above `BottomNav`) when `ratedLocations.length > 0`.
- Horizontal scrollable strip of dark green (`#1A3A2A`) cards, 180×84px each.
- Each card: location name + vibe/count subtitle + action button.
  - Action button color: checked-in phase → amber bg + yellow text; reviewed phase → dark green bg + white text.
  - Action label: uses gender-specific phase2 label for both checkin and reviewed phases.
- Tap card body → `setSelectedLocation` → `LocationDetailModal`.
- Tap action button → `handleLocationAction` → routes to correct phase modal.

---

### Ratings Dashboard (`/ratings`)

- Reads `getRatedLocationIds()` from localStorage to find rated locations.
- Loads `NIGHTLIFE_LOCATIONS` directly (no hook) and filters by rated IDs; sorted by most recent `ratedAt`.
- Fetches live `getLocationStats()` from Firestore for each rated location (async, updates rows when done).
- Each row: personal emoji or dominant vibe, location name + category, Google rating, phase badge (Reviewed / Checked in). Shows count if `checkinCount >= 10`.
- **Compare mode**: when 2+ locations rated, shows Compare button. Select up to 2 locations → side-by-side `CompareCard` panel with vibe, count, M/F ratio, Google rating.

---

### Profile Page (`/profile`)

- Uses `useAuth()` to get current Firebase user.
- Loads all 4 cities' locations (Ottawa, Toronto, Montreal, Guelph) to match any rated IDs.
- Filters by selected city (mobile: `CitySelector` dropdown; desktop: pill buttons) + active category group (`CategoryFilter`).
- Shows ratings grouped by category, sorted by most recent.
- Cards with amber left border = awaiting review (phase: `checkin`).
- **"Review"** button (gender-specific label) → navigates to `/map?review={id}`.
- **"Re-rate"** button (RefreshCw icon) → navigates to `/map?rate={id}`.
- **Appearance**: Dark / Light / System theme toggle.
- **Account**: When signed in — shows Google photo + display name/email + Sign Out. When anonymous — shows Sign In (opens `AuthModal`). Delete Account always visible (clears all localStorage + navigates to `/map`).

---

## Navigation Layout

### Desktop (`md` and above)
- **Sidebar** (`Sidebar.tsx`): 240px fixed left column; white/dark-green bg; logo at top; nav items (Map, Ratings, Profile); user avatar + name at bottom.

### Mobile (below `md`)
- **BottomNav** (`BottomNav.tsx`): fixed bottom bar; dark green `#1A3A2A/95` bg; Map/Ratings/Profile tabs.

---

## Firestore Schema

**Subcollection:** `locations/{locationId}/ratings/{ratingId}`

Rating fields: `userId`, `ageGroup`, `gender`, `phase`, `timestamp`, `groupSize`, `companion`, `checkinAt`, `vibe { emoji, word }`, `waitTime`, `reviewedAt`

Aggregated fields (written by Cloud Function to location doc): `checkinCount`, `maleCount`, `femaleCount`, `dominantVibe`, `ratingsByAgeGroup`, `lastAggregated`, `checkinCountTonight`, `maleCountTonight`, `femaleCountTonight`, `dominantVibeTonight`

**Meta document:** `meta/leaderboard` — updated on every rating write when the location beats (or ties) the current leader:
- `topLocationId` — location with most tonight check-ins
- `checkinCountTonight` — tonight check-in count for that location
- `dominantVibeTonight` — dominant vibe emoji for that location tonight
- `lastUpdated` — server timestamp

---

## LocalStorage Keys
| Key | Purpose |
|-----|---------|
| `mannymap_user_id` | Anonymous user ID fallback (cleared after Google sign-in migration) |
| `mannymap_age_group` | User's age group (set on first check-in) |
| `mannymap_gender` | User's gender (set on first check-in) |
| `mannymap_rated_locations` | Map of rated locations `{ [id]: { phase, emoji, positive, ratedAt } }` |
| `mannymap_rating_count` | Total completed reviews (Phase 2) — triggers signup prompt at 3 |
| `mannymap_signup_prompt_seen` | `"true"` once AuthModal has been shown |
| `mannymap_recent_searches` | Recent search terms as location IDs (max 1) |
| `mannymap_theme` | Theme preference: `"dark"` / `"light"` / `"system"` |
| `mannymap_auth_migrated` | Firebase Auth UID of last completed anonymous-to-auth migration |
| `mannymap_user_ratings_cache` | Per-location user rating cache `{ [locationId]: Rating }` (invalidated on review) |

## SessionStorage Keys
| Key | Purpose |
|-----|---------|
| `mannymap_leader_dismissed` | `"true"` once user dismisses the `TopLocationCard` for this session |

---

## Seed / Test Data

Scripts for seeding fake Saturday-night data and cleaning it up:

| Script | npm command | Purpose |
|--------|------------|---------|
| `scripts/seed-saturday-night.js` | `npm run seed:saturday` | Generates 1000 fake check-ins distributed randomly across Ottawa venues (weighted by popularity). Dry run by default; pass `--execute` to write. Marks every doc with `isSeedData: true` + `seedBatch: "saturday-night-2026-02-28"`. |
| `scripts/delete-seed-data.js` | `npm run delete-seed` | Deletes all docs with `isSeedData: true`. Can scope to a specific `--batch`. Re-aggregates each location after deletion so stats reflect only real users. |

**Seed data details:**
- Each of 1000 "people" independently picks a venue via weighted random (clubs > bars)
- ~55% complete a Phase 2 review; 45% stay at Phase 1 (checked in, not reviewed)
- Timestamps: Sat 2026-02-28 10 PM → Sun 3 AM EST
- Demographics: 55% M / 45% F; 28/42/22/8% across age groups 18-22/23-28/29-35/36+
- Club vibes skew 🔥 Fire (45%) + 🤯 Crazy (35%); Bar vibes skew 🔥 Fire (40%) + 😴 Slow (30%)
- After writing all docs, script writes final aggregates directly to each location doc

**Requires:** `scripts/serviceAccountKey.json` (or `GOOGLE_APPLICATION_CREDENTIALS` env var)

## Design Reference
UX/UI: `mannymap.pen` — use `pencil` MCP tools to read/edit, NOT Read/Grep/Write

## Keeping CLAUDE.md Current
After any code change, update this file to reflect the new state. Specifically:
- **Remove** references to deleted files, components, hooks, or scripts
- **Add** any new files, hooks, routes, localStorage keys, or scripts introduced
- **Update** flow descriptions if modal logic, routing, or phase behavior changes
- **No ghost references** — every file listed in Key Files must exist; every flow described must match the actual code

## Deployment Rules
- **NEVER run `npm run deploy:prod`** unless user explicitly says "deploy to production"
- **NEVER run `delete-locations` or `delete-all-data` scripts** without explicit user confirmation
- Firebase is live — Firestore changes affect real users
- Local dev: `npm run dev` (port 8080)
