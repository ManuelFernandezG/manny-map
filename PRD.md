# Manny Map - Full Documentation

---

## Recent Updates & New Changes

- **Nightlife-first scope:** Focus on Bar, Club, and nightlife events first; Food, Outdoors, Events will be added incrementally as core features stabilize.
- **Firebase quota exceeded:** Project hit Firestore free-tier limits. Strategy updated to minimize Firestore usage (see [Firebase Quota & Cost](#firebase-quota--cost-strategy) and [Location Data Strategy](#location-data-strategy)).
- **Static locations:** All map locations from `src/data/nightlifeLocations.ts`; `useLocations` filters by city only (no Firestore reads for locations).
- **Precise coordinates:** Ottawa nightlife locations use high-precision lat/lng (right-click-on-map method). Canonical list in `src/data/nightlifeLocations.ts`. See [Location coordinates and precision](#location-coordinates-and-precision).
- **App layout:** Sidebar (desktop) + BottomNav (mobile) for Map, Ratings, Profile. Ratings at `/ratings` with metrics, Rating Trends, Recent Activity, Top Rated Locations table + Export (mock data for now).
- **Create location disabled:** Map click does not open create flow; LocationDrawer not used on Index.

---

## Pre-Development Phase

For development without Firebase (avoids quota, works offline, ideal for new GitHub contributors):

1. **Environment:** Locations are **always** loaded from static data; `useLocations` reads from `src/data/nightlifeLocations.ts` only (no Firestore reads for locations). No `VITE_USE_MOCK_DATA` flag is used for location loading.
2. **Data source:** `src/data/nightlifeLocations.ts` â€” Bar/Club only, filtered by city in `useLocations`.
3. **Reviews:** Still require Firebase when submitting check-ins/reviews; stored in Firestore. For fully offline dev, rating flows would need to check a future env flag.
4. **Aggregation:** Run via Firebase (client or Cloud Functions); no aggregation when using static locations only.

You can run the app and use the map, ratings, and profile without Firebase; only check-in/review submission needs Firebase.

---

## Firebase Quota & Cost Strategy

### Free Tier Limits (Spark / No Billing)

| Resource      | Daily Limit |
|---------------|-------------|
| Document reads | 50,000      |
| Document writes | 20,000    |
| Document deletes | 20,000   |
| Stored data   | 1 GiB       |
| Outbound data | 10 GiB/month |

### Approximate Usage per Action

| Action                 | Reads     | Writes    |
|------------------------|-----------|-----------|
| Load map (locations)   | 0 (static data)           | 0 |
| City switch            | 0 (static, in-memory filter) | 0 |
| Submit check-in        | 0         | 1         |
| Submit review          | ~1â€“5 (find user's check-in) | 1â€“2 |
| Aggregation (per location) | All ratings in location | 1 (update location) |

### When You Start Paying

- **Reads:** 50,000/day free. At ~$0.03/100k reads, ~1.6M reads/month â‰ˆ $0.50.
- **Writes:** 20,000/day free. At ~$0.09/100k writes, ~600k writes/month â‰ˆ $0.50.

**Reviews:** Each review â‰ˆ 2â€“3 writes (rating + maybe aggregation). On the free tier you can support roughly **6,000â€“10,000 reviews/day** before hitting write limits, depending on aggregation. The main cost is **location reads** if locations live in Firestore: every user loading the map = N reads (N = locations in city). Moving locations to static data removes those reads (see [Location Data Strategy](#location-data-strategy)).

---

## Location Data Strategy

### Current (Static Only)

- **Locations:** Loaded from `src/data/nightlifeLocations.ts` via `useLocations`; filtered by city in memory. No Firestore reads for locations.

### Recommended (Static Locations + Firebase for Reviews)

- **Locations:** Bundled JSON or TypeScript constants (e.g. `src/data/nightlifeLocations.ts`).
- **Firebase:** Only for `ratings` (and optionally a small `locationStats` or aggregates collection).
- **Benefits:** Zero Firestore reads for locations; no quota usage from map loads; faster initial load.
- **Tradeoffs:** Updating locations requires a code deploy; no OSM auto-import unless you run it locally and commit the JSON.

### Is Static Location Data Bad for Speed?

No. Static locations are usually **faster** because:

- No network round-trip for location data.
- Bundled JSON is cached by the browser; small JSON (e.g. 50â€“200 nightlife spots) adds minimal bundle size.
- Heatmap, Supercluster, and markers still run client-side on the in-memory list; performance is unchanged or better.

Regenerating/re-fetching locations from Firestore on each visit is what burns quota and can slow load times; static data avoids both.

### Location coordinates and precision

- **Source of truth:** `src/data/nightlifeLocations.ts` â€” all nightlife locations (Bar, Club) with `loc(id, name, category, city, lat, lng, neighborhood, ...)`.
- **How to get precise coordinates:** Right-click the **exact spot** on the map (e.g. Google Maps or OSM, satellite view) and copy the coordinates. Do **not** use the business/POI marker or label â€” those often return a building centroid and can be several meters off. For best match with the appâ€™s Esri tiles, you can use the same spot in an Esri-based viewer, or accept minor shift from Google.
- **Precision:** Use full decimal precision from the map (e.g. 45.4291035420482, -75.69345368407755). Sub-meter precision is sufficient; no need to round.
- **Reference format when bulk-updating:** Name | Latitude | Longitude (pipe-separated table). Example:

  | Name                          | Latitude           | Longitude          |
  | ----------------------------- | ------------------ | ------------------ |
  | Heart and Crown               | 45.4291035420482   | -75.69345368407755 |
  | Sky Lounge                    | 45.42876073695236  | -75.69210954507004 |
  | â€¦                             | â€¦                  | â€¦                  |

  Ottawaâ€™s 12 nightlife venues are maintained in this format; when expanding to more cities, add entries to `nightlifeLocations.ts` (or future per-city JSON) with the same precision approach.

---

## Safari Performance Notes

These features are most likely to cause slowness on Safari (especially iOS):

| Feature / Component       | Why it can be slow on Safari |
|---------------------------|------------------------------|
| **Canvas markers** (Leaflet circle markers) | Canvas-based; Safari's canvas can be slower than Chrome. |
| **Large bundle** (main chunk) | Slower parse/compile on mobile Safari. |
| **Modal animations** | Layout recalculation can jank on Safari. |

**Mitigations:** Keep nightlife dataset small; reduce marker count with stricter viewport filtering; enable code splitting for profile.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS (dark theme, lime accent)
- **Maps:** Leaflet + Esri World Imagery (satellite) tiles; circle markers (no heatmap or clustering in current build)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication (guest mode supported)
- **Caching:** TanStack React Query (app default 30 min stale, 60 min GC; `useLocations` uses `staleTime`/`gcTime` Infinity for static location data)
- **Hosting:** Vercel (SPA routing, edge CDN)
- **Fonts:** Outfit (display), Inter (body) in Tailwind; Instrument Serif (headings on Dashboard), DM Sans (nav/brand)

---

## Features

### Map & Display
- Interactive Leaflet map with **Esri World Imagery** (satellite) tiles
- **Circle markers** for all locations (green fill, white halo); canvas rendering (`preferCanvas: true`)
- City switching with fly-to animation (Ottawa, Toronto, Montreal, Guelph)
- Viewport-based location filtering sorted by distance from center (feeds drawer/carousel context)
- **Layout:** Main app uses `Sidebar` (desktop) + `BottomNav` (mobile) for navigation; Map, Ratings, Profile

### Check-In System (Phase 1)
- Demographic gate on first use (age group + gender, stored in localStorage)
- Travel time selection: <5 min, 5-15 min, 15-30 min, 30+ min
- Group size: Solo, 2-3, 4-6, 7+
- Companion type: Friends, Date, Family, Mixed (hidden if solo)
- Recent trends display (last 7 days of check-ins)
- Gender-specific labels ("Pre/Afters" for Male, "Plans/Debrief" for Female)
- Success animation on submit

### Review System (Phase 2)
- Category-specific emoji-word rating dimensions (1-4 scale, 4 = best)
- **Nightlife** (Bar, Club): Vibe
- **Food** (Restaurant, Cafe): Taste, Price, Service
- **Outdoors** (Gym, Beach, Trail): Crowd
- **Events** (Run Club, Festival, Concert): Vibe
- Multi-dimensional per category (1-3 dimensions)
- Prevents submission until all dimensions filled

### Rating Emoji Options
| Dimension | 1 | 2 | 3 | 4 |
|-----------|---|---|---|---|
| Vibe | Dead | Slow | Fire | Crazy |
| Taste | Nasty | Mid | Fire | Unreal |
| Price | Ripoff | Pricey | Fair | Steal |
| Service | Rude | Mid | Good | Great |
| Crowd | Empty | Quiet | Busy | Packed |

### Location Drawer
- **Not currently used on Index.** Component exists at `src/components/LocationDrawer.tsx`. Location selection is via map click, search, or RatedCarousel; detail is shown in `LocationDetailModal`.
- Original spec: bottom sheet with snap points, nearby list grouped by category, Check In / Review actions.

### Rated Carousel
- Horizontal carousel of user's previously rated locations
- Previous/Next navigation with dot indicators
- Shows user's emoji or location dominant emoji
- Quick re-rate access

### Search
- Real-time text filtering (name, category, address, neighborhood)
- Recent searches (max 1, localStorage-backed)
- Top suggestions: top 3 highest-rated locations when search is empty
- Max 10 results displayed
- Click-outside to dismiss

### Category Filter
- **Current UI:** Single group "Nightlife" only (checkbox, Select All / Deselect All, active count)
- Data layer supports groups: Nightlife, Food, Outdoors, Events (for future use)

### Location Creation
- **Not in app.** Map click is no-op. No `CreateLocationModal` component in codebase; Firestore rules disallow client location create.

### Location Details (LocationDetailModal)
- Overall vibe chart (top 6 emoji-word pairs, custom bar UI)
- Age group breakdown with dominant emoji per group
- Divergence flag warning when age groups disagree
- Address, hours, description display
- "Rate this spot" primary action (no suggestion form in current modal)

### Signup Prompt
- Triggers after 3rd rating
- Feature showcase: Personalized Feed, Track Your Ratings, Exclusive Features (save favorites, notifications)
- "Create Free Account" and "Maybe later"; shows once per user (localStorage flag)

### OSM Import (tooling / not in app UI)
- Overpass API queries for restaurants, bars, parks, gyms, cafes, nightclubs
- Duplicate detection (exact name + city match)
- Category mapping: restaurant/cafe/bar/pub/nightclub/park/gym -> app categories
- Batch creation with 10-import delay to avoid Firebase throttling
- Progress tracking with stage display
- **Quota note:** OSM import writes many docs; use sparingly. For nightlife-first, import once, export to JSON, then use static data. Avoid re-running imports.

### Deep Linking
- `/?review={locationId}` - Opens review modal for a location
- `/?rate={locationId}` - Opens check-in/review flow

### Ratings Page (`/ratings`)
- **Ratings overview** (nav label: "Ratings"): Overview title, metric cards (Total Ratings, Avg. Rating, Locations Rated, Ratings This Week), Rating Trends bar chart, Recent Activity feed, **Top Rated Locations** table with **Export** button
- Uses static mock data for now (METRICS, BARS, ACTIVITY, LOCATIONS). Fonts: Instrument Serif (headings), Inter (body), DM Sans (nav)
- Layout: `Sidebar` + main content + `BottomNav`; lazy-loaded route

### Profile Page (`/profile`)
- Rating history grouped by category; each item shows phase (check-in vs reviewed), time ago, re-rate/review links with deep links to `/?review=id` or `/?rate=id`
- Header: "Create Profile" button (toast placeholder), "Delete Account" (clears localStorage/sessionStorage and redirects to map)
- Empty state: "No ratings yet" with "Back to Map"
- Uses `Sidebar` + `BottomNav`; lazy-loaded route

---

## Algorithms

### Rating Aggregation
**File:** `src/lib/ratings.ts` | **Function:** `aggregateRatings(locationId)`

1. Fetch all ratings subcollection for location
2. Separate reviewed ratings from check-ins
3. Extract emoji-word-score tuples (supports multiple backward-compatible formats)
4. Group by age group ("18-22", "23-28", "29-35", "36+") and gender ("Male", "Female")
5. Count frequency of each emoji-word pair per group
6. Determine dominant pair (most frequent) per group
7. Calculate average score across all reviewed ratings
8. Calculate divergence score
9. Write aggregated fields back to location document

### Divergence Detection
- Only considers "active groups" = age groups with 5+ ratings
- Calculates average score per active group
- Finds max difference between any two group averages
- `divergenceScore = maxDiff / 3` (normalized 0-1)
- `divergenceFlagged = true` if score >= 0.5 AND 2+ active groups
- Purpose: surfaces locations where age groups disagree on vibe

### Viewport Filtering
```
visibleLocations = filteredLocations
  .filter(inBounds)
  .sort(byDistanceFromCenter)
```

### Category Grouping
**File:** `src/lib/groupByCategory.ts`
- Groups locations by category maintaining CATEGORIES array order
- Supports priority categories (appear first)
- Returns `CategoryGroup[]` with `isPriority` flag

---

## User Flows

### Flow 1: First-Time Rating
1. Land on map -> view map + markers
2. Tap location (map or search/carousel) -> LocationDetailModal
3. "Rate this spot" -> CheckinModal
4. First time: age group + gender gate (saved to localStorage)
5. Select travel time, group size, companion -> submit check-in (Phase 1)
6. Visit location IRL
7. Return to app, tap same location -> ReviewModal
8. Select emoji for each dimension -> submit review (Phase 2)
9. Aggregation runs, location stats update
10. Location appears in RatedCarousel
11. After 3rd rating -> SignupPrompt

### Flow 2: City Switch
1. Tap CitySelector -> pick city
2. Map flies to city coordinates
3. `useLocations` returns locations for new city from static `nightlifeLocations.ts` (React Query cache, `staleTime`/`gcTime` Infinity)
4. Carousel, search, and map markers update

### Flow 3: Create Location
- **Not implemented.** Map click is no-op; create flow disabled to avoid Firestore writes.

### Flow 4: Suggest Correction
- **Backend/spec only.** LocationDetailModal may expose "Suggest a change"; no in-app review UI.

---

## Database (Firestore)

**Strategy:** Prefer static locations (bundled JSON) to avoid Firestore reads. Use Firestore mainly for reviews/ratings. See [Location Data Strategy](#location-data-strategy).

### Collection: `locations/{locationId}` (Optional â€” use static data to save quota)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Location name (max 200) |
| `category` | string | Restaurant, Nightclub, Park, Gym, Run Route, Event, Bar, Cafe, Other |
| `city` | string | Ottawa, Toronto, Montreal, Guelph |
| `coordinates` | map | `{ lat, lng }` |
| `address` | string | Street address (max 500) |
| `neighborhood` | string | Neighborhood name |
| `hours` | string | Operating hours (max 200) |
| `description` | string | Description (max 1000) |
| `isUserCreated` | boolean | User-created vs imported |
| `isPending` | boolean | Pending approval |
| `totalRatings` | number | Total rating count |
| `ratingsByAgeGroup` | map | Per age group: `{ dominant: { emoji, word, count }, totalRatings, topPairs[] }` |
| `ratingsByGender` | map | Per gender: same structure as above |
| `divergenceScore` | number | 0-1, age group disagreement |
| `divergenceFlagged` | boolean | True if divergence >= 0.5 with 2+ active groups |
| `dominantEmoji` | string | Most common emoji overall |
| `dominantWord` | string | Most common word overall |
| `averageScore` | number | Average rating score |
| `checkinCount` | number | Total check-ins |
| `createdAt` | timestamp | Creation time |
| `lastAggregated` | timestamp | Last aggregation run |

### Subcollection: `locations/{locationId}/ratings/{ratingId}`
| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Anonymous user ID (max 100) |
| `ageGroup` | string | 18-22, 23-28, 29-35, 36+ |
| `gender` | string | Male, Female |
| `phase` | string | "checkin" or "reviewed" |
| `timestamp` | timestamp | Rating time |
| `travelTime` | string | Check-in: <5 min, 5-15 min, 15-30 min, 30+ min |
| `groupSize` | string | Check-in: Solo, 2-3, 4-6, 7+ |
| `companion` | string | Check-in: Friends, Date, Family, Mixed |
| `checkinAt` | timestamp | Check-in time |
| `vibe` | ReviewScore | Nightlife/events: `{ emoji, word, score }` |
| `taste` | ReviewScore | Food: `{ emoji, word, score }` |
| `price` | ReviewScore | Food: `{ emoji, word, score }` |
| `service` | ReviewScore | Food: `{ emoji, word, score }` |
| `crowd` | ReviewScore | Outdoors: `{ emoji, word, score }` |
| `reviewedAt` | timestamp | Review submission time |

### Collection: `suggestions/{suggestionId}` (not in current Firestore rules)
| Field | Type | Description |
|-------|------|-------------|
| `locationId` | string | Target location |
| `locationName` | string | Current name |
| `suggestedName` | string | Corrected name |
| `suggestedCategory` | string | Corrected category |
| `message` | string | User message |
| `userId` | string | Submitter |
| `createdAt` | timestamp | Submission time |

### Security Rules (current)
- **Locations:** read only; create `false`; update only for aggregation fields (same name/category/city/coordinates); no delete
- **Ratings:** read; create/update if valid structure (`userId`, `ageGroup`, `pairs`, etc.)
- All other collections (including `suggestions`) denied by catch-all

### Local Storage Keys
| Key | Purpose |
|-----|---------|
| `mannymap_user_id` | Anonymous user ID |
| `mannymap_age_group` | User's age group |
| `mannymap_gender` | User's gender |
| `mannymap_rated_locations` | Map of rated locations (emoji, phase, timestamp) |
| `mannymap_rating_count` | Total ratings submitted |
| `mannymap_signup_prompt_seen` | Signup prompt shown flag |
| `mannymap_recent_searches` | Recent search terms (max 1) |

### User ID Generation
```
user_{Date.now()}_{random 9-char base36}
```

---

## UI Component Map

### Pages
| Component | Path | Route |
|-----------|------|-------|
| Index | `src/pages/Index.tsx` | `/` (Map) |
| Ratings | `src/pages/Dashboard.tsx` | `/ratings` (Ratings overview, lazy) |
| Profile | `src/pages/Profile.tsx` | `/profile` (lazy) |
| NotFound | `src/pages/NotFound.tsx` | `*` |

### Layout & Navigation
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar | `src/components/Sidebar.tsx` | Desktop nav: Map, Ratings, Profile (01â€“03); green theme |
| BottomNav | `src/components/BottomNav.tsx` | Mobile bottom nav: Map, Ratings, Profile |

### Map Components
| Component | File | Purpose |
|-----------|------|---------|
| MapView | `src/components/MapView.tsx` | Leaflet map + heatmap + markers |
| LocationDrawer | `src/components/LocationDrawer.tsx` | Exists but not used on Index; bottom sheet with nearby locations |
| RatedCarousel | `src/components/RatedCarousel.tsx` | Horizontal carousel of rated spots |
| LocationCard | `src/components/LocationCard.tsx` | Location card in lists |

### Modals
| Component | File | Purpose |
|-----------|------|---------|
| CheckinModal | `src/components/CheckinModal.tsx` | Phase 1 check-in flow |
| ReviewModal | `src/components/ReviewModal.tsx` | Phase 2 emoji review |
| LocationDetailModal | `src/components/LocationDetailModal.tsx` | Full location stats |
| CreateLocationModal | â€” | Not in codebase |
| SignupPrompt | `src/components/SignupPrompt.tsx` | Post-3rd-rating signup |
| ReviewImportModal | `src/components/ReviewImportModal.tsx` | Seed reviews for a location (no in-app entry point) |

### Filters & Navigation
| Component | File | Purpose |
|-----------|------|---------|
| LocationSearch | `src/components/LocationSearch.tsx` | Text search + autocomplete |
| CategoryFilter | `src/components/CategoryFilter.tsx` | Multi-select category filter |
| CitySelector | `src/components/CitySelector.tsx` | City dropdown switcher |

### Hooks
| Hook | File | Purpose |
|------|------|---------|
| useLocations | `src/hooks/useLocations.ts` | Returns locations from static `NIGHTLIFE_LOCATIONS` filtered by city; React Query with `staleTime`/`gcTime` Infinity |
| useMobile | `src/hooks/use-mobile.tsx` | Mobile viewport detection |
| useToast | `src/hooks/use-toast.ts` | Toast notifications |

### Libraries
| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase init + Firestore export |
| `src/lib/ratings.ts` | Aggregation algorithm + helpers |
| `src/lib/userId.ts` | Anonymous user ID management |
| `src/lib/overpassImport.ts` | OSM Overpass import logic |
| `src/lib/groupByCategory.ts` | Category grouping utility |
| `src/lib/utils.ts` | General utilities |
| `src/data/mockData.ts` | Constants, categories, cities, review configs |

---

## Constants

### Categories
```
Bar, Club, Restaurant, Cafe, Gym, Beach, Trail, Run Club, Festival, Concert
```

### Category Groups (Nightlife-First Scope)

- **Phase 1 (Current):** Nightlife â€” Bar, Club
- **Phase 2 (Later):** Events â€” Run Club, Festival, Concert
- **Phase 3 (Later):** Food â€” Restaurant, Cafe
- **Phase 4 (Later):** Outdoors â€” Gym, Beach, Trail

Food, Outdoors, and Events categories will be enabled incrementally as core features (reviews, check-ins, map performance) are stable.

### Cities
| City | Lat | Lng | Zoom |
|------|-----|-----|------|
| Ottawa | 45.4215 | -75.6972 | 13 |
| Toronto | 43.6532 | -79.3832 | 13 |
| Montreal | 45.5017 | -73.5673 | 13 |
| Guelph | 43.5448 | -80.2482 | 13 |

### Age Groups
```
18-22, 23-28, 29-35, 36+
```

---

## GitHub Quick Start (For New Contributors)

1. **Clone:** `git clone https://github.com/YOUR_USERNAME/manny-map.git` (replace with your repo URL)
2. **Install:** `npm install`
3. **Run:** `npm run dev` â€” app at http://localhost:5173 (or 8080). Map and Dashboard work with static data; no Firebase required for viewing.
4. **Firebase (optional):** Required only for check-in/review submission. Add Firebase config when testing those flows.
5. **Branch:** `git checkout -b your-feature` â€” work on a branch, don't commit to `main` directly
6. **Commit & push:** `git add .` â†’ `git commit -m "Your message"` â†’ `git push origin your-feature`
7. **Pull request:** Open a PR on GitHub to merge into `main`

---

## Testing

- **File:** `src/lib/ratings.test.ts` (11 tests via Vitest)
- **Coverage:** aggregation logic only (empty, single, multi-rating, age groups, divergence)
- **Missing:** component tests, E2E tests

---

## Build & Deploy

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (port 8080) |
| `npm run build` | Production build |
| `npm run build:dev` | Dev mode build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest tests |
| `npm run setup` | Pull env vars from Vercel |

**Cost:** Everything on free tier (Firebase, Overpass API, Vercel).

---

## Known Issues

### Critical
- **Firebase quota exceeded:** Project hit free-tier limits. Locations are static; Firestore used for reviews only (see [Firebase Quota](#firebase-quota--cost-strategy)).
- **Scaling:** no viewport-based Firestore queries; static list is small (e.g. 12 Ottawa nightlife); geohashing needed for 1000+ locations if locations move back to DB

### Moderate
- **Search:** client-side only, no fuzzy matching, `MAX_RECENT = 1`
- **Bundle:** 848KB main chunk (above 500KB threshold), needs code splitting
- **TypeScript:** strict mode disabled (`noImplicitAny: false`, `strictNullChecks: false`)
- **Data model:** `coordinates` uses `{lat, lng}` on user-created but top-level `lat`/`lng` on OSM imports
- **Security:** anonymous userId spoofable, no rate limiting

### Nice-to-Have
- Component and E2E tests
- Cloud Functions for server-side aggregation
- Fuzzy search (Meilisearch/Typesense)
- More cities (Toronto, Montreal, Guelph in CITIES but nightlife list is Ottawa-only in `nightlifeLocations.ts`)
- PostGIS migration for spatial queries at scale
- Wire Dashboard Top Rated Locations and Export to real data; currently static mock
- Re-enable Create Location flow if product needs it

---

## Possible Additions

Features or specs that are **not** in the current app but could be added later. PRD body above has been aligned to current code; this section captures the delta.

### Map & display
- **Heatmap layer** (e.g. leaflet.heat): intensity by rating count, freeze during pan/zoom, green–yellow gradient. Algorithm in PRD (intensity = min(1, 0.2 + totalRatings/30)).
- **OpenStreetMap or dark inverted tiles** (current map uses Esri World Imagery only).
- **Emoji markers** for rated locations with zoom-based scaling; **marker icon caching** (current map uses uniform green circle markers).
- **Supercluster clustering** for large location sets (current map renders all locations as circle markers).

### Location & suggestions
- **CreateLocationModal** and **create-location flow**: click empty map → form (name, category, address, hours, description) → Firestore doc `isPending: true` → auto-open check-in. Would require Firestore rules and client create.
- **Suggestion submission** in LocationDetailModal: “Suggest a change” form (corrected name/category + message) → `suggestions/{id}`. Firestore rules currently deny suggestions; would need rule + UI.
- **LocationDrawer** on Index: bottom sheet with snap points, nearby list by category, Check In / Review actions (component exists, not used).

### Category filter
- **Food, Outdoors, Events** groups in the filter UI (data and `REVIEW_CONFIG` already support them; UI currently shows Nightlife only).

### Admin & tooling
- **Admin dashboard** (`/admin`): password gate, Analytics (totals, top locations), Locations table, ReviewImportModal per row. Removed from app; could be re-added.
- **ImportTool** in UI: OSM Overpass import with city/radius, progress, duplicate detection (component exists; no route).
- **Suggestions review UI**: approve/dismiss user suggestions (no collection in current Firestore rules).

### Components not in PRD UI map
- **NavLink** (`src/components/NavLink.tsx`): React Router NavLink wrapper; not referenced by Sidebar/BottomNav (they use buttons + `navigate`).
- **ImportTool**, **ReviewImportModal**: no in-app entry point after admin removal.
