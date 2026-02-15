# Manny Map (poppin') - Full Documentation

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS (dark theme, lime accent)
- **Maps:** Leaflet + OpenStreetMap tiles + leaflet.heat + Supercluster
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication (guest mode supported)
- **Caching:** TanStack React Query (5 min stale, 30 min GC)
- **Hosting:** Vercel (SPA routing, edge CDN)
- **Fonts:** Outfit (display), Inter (body)

---

## Features

### Map & Display
- Interactive Leaflet map with dark inverted tiles
- Heatmap layer (intensity scales with rating count, freezes during pan/zoom)
- Emoji markers for rated locations with zoom-based scaling
- Marker icon caching for performance
- Canvas rendering mode for large datasets
- City switching with fly-to animation (Ottawa, Toronto, Montreal, Guelph)
- Viewport-based location filtering sorted by distance from center

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
- Bottom sheet with snap points (collapsed 148px, expanded 55%)
- Collapsed: shows top nearby location
- Expanded: scrollable list grouped by category
- Action buttons: Check In / Review / Re-rate per location
- Category badges with color coding

### Rated Carousel
- Horizontal carousel of user's previously rated locations
- Previous/Next navigation with dot indicators
- Shows user's emoji or location dominant emoji
- Quick re-rate access

### Search
- Real-time text filtering (name, category, address, neighborhood)
- Recent searches (max 1, localStorage-backed)
- Top suggestions (highest rated locations)
- Max 10 results displayed
- Click-outside to dismiss

### Category Filter
- Grouped categories: Nightlife, Food, Outdoors, Events
- Multi-select with checkbox + indeterminate state
- Select all / deselect all per group
- Active filter count display

### Location Creation
- Click empty map area to create
- Name (required, max 200 chars), category (button grid)
- Optional: address, hours, description
- Created as `isPending: true`, `isUserCreated: true`
- Auto-opens check-in modal after creation

### Location Details
- Overall vibe chart (top 6 emoji-word pairs)
- Age group breakdown with dominant emoji per group
- Divergence flag warning when age groups disagree
- Suggestion submission form (name/category correction + message)
- Address, hours, description display

### Signup Prompt
- Triggers after 3rd rating
- Feature showcase: personalized feed, tracking, exclusives
- "Create Account" or "Maybe Later"
- Shows once per user (localStorage flag)

### Admin Dashboard (`/admin`)
- Client-side password gate (VITE_ADMIN_PASSWORD)
- **Analytics tab:** total locations, ratings, avg ratings/location, top 10 table
- **Locations tab:** full table, inline edit (name, category), import reviews button
- **Import tab:** OSM import with city/radius selection, progress bar, results summary
- **Suggestions tab:** review/approve/dismiss user suggestions

### OSM Import
- Overpass API queries for restaurants, bars, parks, gyms, cafes, nightclubs
- Duplicate detection (exact name + city match)
- Category mapping: restaurant/cafe/bar/pub/nightclub/park/gym -> app categories
- Batch creation with 10-import delay to avoid Firebase throttling
- Progress tracking with stage display

### Deep Linking
- `/?review={locationId}` - Opens review modal for a location
- `/?rate={locationId}` - Opens check-in/review flow

### Profile Page (`/profile`)
- User's rating history
- Lazy-loaded route

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

### Heatmap Intensity
```
intensity = min(1, 0.2 + totalRatings / 30)
```
- Base intensity 0.2, maxes out at 30 ratings
- Custom gradient: green to yellow
- Layer hidden during map interaction for performance

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
1. Land on map -> view heatmap + markers
2. Tap location (map or drawer) -> LocationDetailModal
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
3. `useLocations` hook fetches locations for new city (React Query cached)
4. Drawer, carousel, search all update

### Flow 3: Create Location
1. Tap empty map area -> CreateLocationModal
2. Fill name + category (address/hours/description optional)
3. Submit -> Firestore doc created (`isPending: true`)
4. CheckinModal auto-opens

### Flow 4: Suggest Correction
1. Open LocationDetailModal -> "Suggest a change"
2. Fill corrected name/category + message
3. Submit -> creates `/suggestions/{id}` doc
4. Admin reviews in dashboard

---

## Database (Firestore)

### Collection: `locations/{locationId}`
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Document ID |
| `name` | string | Location name (max 200) |
| `category` | string | Restaurant, Nightclub, Park, Gym, Run Route, Event, Pop-up, Bar, Cafe, Other |
| `city` | string | Ottawa, Toronto, Montreal, Guelph |
| `coordinates` | map | `{ lat, lng }` |
| `address` | string | Street address (max 500) |
| `neighborhood` | string | Neighborhood name |
| `hours` | string | Operating hours (max 200) |
| `description` | string | Description (max 1000) |
| `isUserCreated` | boolean | User-created vs imported |
| `isPending` | boolean | Pending admin approval |
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

### Collection: `suggestions/{suggestionId}`
| Field | Type | Description |
|-------|------|-------------|
| `locationId` | string | Target location |
| `locationName` | string | Current name |
| `suggestedName` | string | Corrected name |
| `suggestedCategory` | string | Corrected category |
| `message` | string | User message |
| `userId` | string | Submitter |
| `createdAt` | timestamp | Submission time |

### Security Rules
- **Locations:** public read, validated create, aggregation-only updates, no deletes
- **Ratings:** public read, validated create with structure checking, user can update own
- **Suggestions:** user-created documents
- All other collections denied

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
| Index | `src/pages/Index.tsx` | `/` |
| Admin | `src/pages/Admin.tsx` | `/admin` (lazy) |
| Profile | `src/pages/Profile.tsx` | `/profile` (lazy) |
| NotFound | `src/pages/NotFound.tsx` | `*` |

### Map Components
| Component | File | Purpose |
|-----------|------|---------|
| MapView | `src/components/MapView.tsx` | Leaflet map + heatmap + markers |
| LocationDrawer | `src/components/LocationDrawer.tsx` | Bottom sheet with nearby locations |
| RatedCarousel | `src/components/RatedCarousel.tsx` | Horizontal carousel of rated spots |
| LocationCard | `src/components/LocationCard.tsx` | Location card in lists |

### Modals
| Component | File | Purpose |
|-----------|------|---------|
| CheckinModal | `src/components/CheckinModal.tsx` | Phase 1 check-in flow |
| ReviewModal | `src/components/ReviewModal.tsx` | Phase 2 emoji review |
| LocationDetailModal | `src/components/LocationDetailModal.tsx` | Full location stats |
| CreateLocationModal | `src/components/CreateLocationModal.tsx` | New location form |
| SignupPrompt | `src/components/SignupPrompt.tsx` | Post-3rd-rating signup |
| ReviewImportModal | `src/components/ReviewImportModal.tsx` | Admin: seed reviews |

### Filters & Navigation
| Component | File | Purpose |
|-----------|------|---------|
| LocationSearch | `src/components/LocationSearch.tsx` | Text search + autocomplete |
| CategoryFilter | `src/components/CategoryFilter.tsx` | Multi-select category filter |
| CitySelector | `src/components/CitySelector.tsx` | City dropdown switcher |

### Admin
| Component | File | Purpose |
|-----------|------|---------|
| ImportTool | `src/components/ImportTool.tsx` | OSM batch import UI |

### Hooks
| Hook | File | Purpose |
|------|------|---------|
| useLocations | `src/hooks/useLocations.ts` | Fetch + cache locations per city |
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

### Category Groups
- **Nightlife:** Bar, Club
- **Food:** Restaurant, Cafe
- **Outdoors:** Gym, Beach, Trail
- **Events:** Run Club, Festival, Concert

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
- **Admin auth is cosmetic:** client-side password check only, `VITE_ADMIN_PASSWORD` in bundle
- **Scaling:** no viewport-based Firestore queries, needs geohashing for 1000+ locations

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
- More cities
- PostGIS migration for spatial queries at scale
