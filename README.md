# Manny Map

Anonymous nightlife rating app. Check in to a bar or club before going, then leave an emoji review after your visit. Ratings are aggregated by age group and gender — with divergence detection when groups disagree on a vibe.

**Live city: Ottawa.** Four cities exist in the code (Ottawa, Toronto, Montreal, Guelph) but only Ottawa has venues.

---

## Pages

### `/` — Landing
Public marketing page. Entry point before accessing the app.

### `/map` — Map (main)
The core experience. Satellite map (Esri World Imagery) with circle markers for bars and clubs.

- **Top bar:** Location search by name or neighborhood. Selecting a result pans the map to that location at zoom 17. Recent searches cached (max 1).
- **Top Location Card:** Floating pill below the search bar showing tonight's hottest venue (most interested tonight) — vibe emoji, name, count. Tap to view detail; X to dismiss for the session.
- **Markers:** Canvas-rendered circles; tap any marker to open the location detail sheet.
- **Location Detail Sheet:** Name, category, Google rating + review count (labeled "Google Reviews"), address, hours, description. If 10+ check-ins or any tonight activity: live stats — **TONIGHT** count featured prominently, "+ X from last week" as secondary, M/F ratio bar, dominant vibe. Falls back to **THIS WEEK** all-time data when no tonight activity. "I'm Interested" CTA routes to the correct phase (check-in or review).
- **Rated Carousel:** Horizontal strip above the bottom nav showing all your rated locations. Each card shows the vibe emoji + phase status. Tap to view detail; tap the rate button to continue to the next phase.
- **Bottom Nav:** Links to Map, Ratings, Profile.

### `/ratings` — My Ratings
Dashboard for all your rated locations.

- List sorted by most recent, showing personal emoji, location name, category, Google rating, phase badge.
- **Compare mode:** Select any 2 rated locations for a side-by-side breakdown — vibe, interested count, M/F ratio, Google rating.
- Loads live stats from Firestore for each rated location.

### `/profile` — Profile
Your full rating history + account settings.

- Grouped by category (Bar, Club), sorted by most recent.
- Cards with an amber left border = checked in but not yet reviewed.
- **Review** button → deep-links to `/map?review={id}`.
- **Re-rate** button → deep-links to `/map?rate={id}`.
- **Appearance:** Dark / Light / System theme toggle.
- **Account:** Sign In, Sign Out, Delete Account (clears all local data).

### `/splash` — Splash Screen
1.8s animated splash, then redirects to `/`.

---

## Rating Flow

### Phase 1 — Check-in (before visiting)

1. Tap a marker → Location Detail → "I'm Interested"
2. First-time only: select age group (`18-22 / 23-28 / 29-35 / 36+`) and gender (`Male / Female`) — stored permanently in localStorage
3. Select group size (`Solo / 2-3 / 4-6 / 7+`) and who you're going with (`Friends / Date / Family / Mixed`) — hidden when Solo
4. Tap **"I'm Going"** → check-in saved to Firestore

### Phase 2 — Review (after visiting)

1. Return to the app; app routes you to the review screen automatically from any entry point
2. Pick a vibe: `💀 Dead / 😴 Slow / 🔥 Fire / 🤯 Crazy`
3. Pick wait time: `No wait / <15 min / 15-30 min / 30+ min`
4. Submit → Cloud Function aggregates all ratings and writes stats back to the location doc

### After 3 Reviews
A sign-up prompt appears once, offering account creation to preserve your history.

### Gender-Specific Language
| Gender | Phase 1 | Phase 2 | Check-in modal message |
|--------|---------|---------|----------------------|
| Male | Pre | Afters | "You're set! Come back for afters." |
| Female | Plans | Debrief | "Locked in! Debrief after." |

---

## Features

- Anonymous by default — Firebase Auth UID preferred; falls back to localStorage UUID
- 2-phase rating enforces a check-in before a review
- Live stats per location: tonight count featured, last-week count secondary, M/F ratio, dominant vibe, age breakdown (shown at 10+ check-ins or any tonight activity)
- Tonight sub-aggregate: computed from 8pm America/Toronto; stored as `checkinCountTonight` / `maleCountTonight` / `femaleCountTonight` / `dominantVibeTonight` on the location doc
- City leaderboard: `meta/leaderboard` Firestore doc tracks tonight's top venue; shown as a floating pill on the map
- Map pans to selected search result at zoom 17
- Divergence detection when age groups strongly disagree on vibe
- Compare any 2 rated locations side-by-side
- Search by name or neighborhood
- Rated locations carousel for quick re-rating
- Deep linking: `/map?review={id}` and `/map?rate={id}` for direct phase entry
- Dark / Light / System theme support

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS (dark theme, forest green accent) |
| Maps | Leaflet + Esri World Imagery satellite tiles |
| State | TanStack React Query (30min stale / 60min gc) |
| Database | Firebase Firestore — ratings subcollection only |
| Aggregation | Firebase Cloud Functions — `onRatingWritten` trigger |
| Auth | Firebase Auth (optional — anonymous fallback) |
| Hosting | Vercel |

---

## Data Model

**Locations:** Static TypeScript array in `src/data/nightlifeLocations.ts`. Never read from Firestore (quota protection).

**Google data:** Static object in `src/data/googleData.ts` — `{ [locationId]: { googleRating, googleReviewCount } }`.

**Ratings:** Firestore subcollection `locations/{locationId}/ratings/{ratingId}`.
- Phase 1 fields: `userId`, `ageGroup`, `gender`, `phase: "checkin"`, `groupSize`, `companion`, `checkinAt`, `timestamp`
- Phase 2 adds: `phase: "reviewed"`, `vibe { emoji, word }`, `waitTime`, `reviewedAt`

**Aggregates** (written to location doc by Cloud Function): `checkinCount`, `maleCount`, `femaleCount`, `dominantVibe`, `ratingsByAgeGroup`, `lastAggregated`, `checkinCountTonight`, `maleCountTonight`, `femaleCountTonight`, `dominantVibeTonight`

**Leaderboard** (`meta/leaderboard`): updated on every rating write — `topLocationId`, `checkinCountTonight`, `dominantVibeTonight`, `lastUpdated`

---

## Seed Data (Dev / Demo)

Seed 1000 fake Saturday-night check-ins to populate the map for screenshots or demos.

```sh
# Dry run — prints the distribution, no writes
node scripts/seed-saturday-night.js

# Actually write to Firestore
node scripts/seed-saturday-night.js --execute
```

Every seeded doc is tagged `isSeedData: true` + `seedBatch: "saturday-night-2026-02-28"`. Delete cleanly when done:

```sh
node scripts/delete-seed-data.js --execute
# or via npm
npm run delete-seed -- --execute
```

Requires a Firebase service account key at `scripts/serviceAccountKey.json`.
Get it: Firebase Console → Project Settings → Service Accounts → Generate new private key.

**Mock/offline mode:** Set `VITE_MOCK_STATS=true` in `.env.local` to load stats from `src/data/seedStats.ts` instead of Firestore — useful for screenshots and offline dev.

---

## Getting Started

```sh
npm install
```

**Pull env vars from Vercel (recommended):**

```sh
npm i -g vercel && vercel link && npm run setup
```

**Or manually:** copy `.env.example` to `.env.local` and fill in Firebase config.

```sh
npm run dev        # dev server at localhost:8080
npm run build      # production build
npm run test       # run Vitest tests
```
