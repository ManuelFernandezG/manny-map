# Manny App (poppin') - Feature Evaluation

## Overview

**poppin'** is a map-based social discovery app where users rate local spots (restaurants, bars, cafes, parks, gyms) using emoji-word pairs, segmented by age group. It targets Canadian cities (Ottawa, Toronto, Montreal) and features divergence detection when age groups disagree on a location's vibe.

**Tech stack:** React 18 + TypeScript + Vite + Tailwind CSS + Firebase (Firestore) + Leaflet maps + shadcn/ui

---

## Build & Tooling Status

| Check | Result |
|-------|--------|
| `npm run build` | Passes (~10s) |
| `npm run test` | 11 tests passing (aggregation logic) |
| Bundle size | 848 KB main + 19 KB admin chunk (code-split) |

---

## Feature Ratings

### 1. Map & Location Display - 8/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Leaflet map rendering | Working | Tile layer from OpenStreetMap |
| Emoji markers | Working | Custom `divIcon` with dominant emoji per location |
| Zoom-based clustering | Working | 3 tiers: aggressive (<13), loose (13-15), none (15+) |
| City switching | Working | Ottawa, Toronto, Montreal with animated pan |
| Click-to-create location | Working | Proximity check avoids conflicts with existing markers |

**Strengths:** Clustering logic is well-tuned with three zoom breakpoints. Emoji markers are visually distinctive.

**Gaps:** Cluster popup click-handler relies on fragile DOM index matching (`locationDivs[idx]`). No loading state for tile layers.

---

### 2. Rating System - 9/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Emoji+word pair selection | Working | 1-3 pairs from 6 categories |
| Age group gate | Working | Persisted to localStorage |
| Firebase persistence | Working | Writes to `locations/{id}/ratings` subcollection |
| Duplicate prevention | Working | Queries by userId, updates existing doc |
| Input validation | Working | Whitelist of valid emoji:word pairs, age group enum check |

**Strengths:** Clean UX flow -- tap to rate, pick emojis, pick words, submit. Predefined suggestion buttons prevent free-text abuse. Server-side (Firestore rules) and client-side validation are aligned.

**Gaps:** Anonymous userId is client-generated (spoofable via localStorage). No server-side rate limiting.

---

### 3. Aggregation Algorithm - 9/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Per-age-group top pairs | Working | Counts frequency, sorts, takes top 10 |
| Overall dominant pair | Working | Aggregates across all age groups |
| Divergence score | Working | `(uniqueDominants - 1) / (activeGroups - 1)` |
| Divergence flagging | Working | Flags when score >= 0.5 and 2+ active groups |
| Minimum threshold | Working | 5 ratings per group before counting for divergence |
| Test coverage | 11 tests | Covers edge cases: empty, single, multi-pair, partial divergence |

**Strengths:** Divergence formula is elegant -- normalizes unique dominants against group count. The 5-rating minimum prevents noise from small samples.

**Gaps:** Client-side aggregation re-fetches all ratings on every submission. At scale (1000+ ratings/location) this will be slow. Cloud Functions would be more efficient.

---

### 4. Location Creation - 8/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Modal UI | Working | Clean form with name, category, address, hours, description |
| Firebase persistence | Working | `addDoc` with `serverTimestamp` |
| Input validation | Working | Length limits matching Firestore rules |
| Coordinate validation | Working | Bounds check (-90..90, -180..180) |
| Category selection | Working | Constrained to 10 predefined categories |

**Strengths:** Locations persist to Firebase immediately with the real Firestore doc ID, so ratings work seamlessly after creation.

**Gaps:** No geocoding/reverse-geocoding to auto-fill address from coordinates. `isPending` field is set but no moderation workflow exists.

---

### 5. Search - 7/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Text search | Working | Filters by name, category, address, neighborhood |
| Recent searches | Working | Persisted to localStorage (max 1) |
| Top suggestions | Working | Sorted by totalRatings |
| Click-outside dismiss | Working | Uses mousedown event listener |

**Strengths:** Responsive dropdown with clear visual hierarchy (recent vs. suggested).

**Gaps:** Search is client-side only -- filters the already-fetched location array. No fuzzy matching. `MAX_RECENT = 1` is very low.

---

### 6. Admin Dashboard - 5/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Password auth | Working | But client-side only -- bypassable via DevTools |
| Analytics tab | Working | Total locations, ratings, avg per location, top 10 |
| Locations table | Working | Shows first 50 with name, category, city, ratings |
| Import tool | Working | OSM/Overpass integration |
| Code splitting | Working | Lazy-loaded via `React.lazy()`, separate 19KB chunk |

**Strengths:** Code-split properly so admin code doesn't burden regular users. Analytics give a quick pulse on the dataset.

**Weaknesses:** Auth is purely cosmetic -- `sessionStorage.setItem("admin_auth", "true")` bypasses it. No pagination beyond first 50 locations. No CRUD operations (can't edit/delete locations). Password is embedded in the client bundle via `VITE_ADMIN_PASSWORD`.

---

### 7. OSM Import - 7/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Overpass API query | Working | Restaurants, cafes, bars, parks, gyms |
| Duplicate detection | Working | Checks by name + city before importing |
| Progress callback | Working | Reports current/total to UI |
| Radius cap | Working | Clamped to 100m-10km |
| Batch delay | Working | 500ms pause every 10 records |

**Strengths:** Good category mapping from OSM tags. Geohash generation for future geo-queries. Duplicate check prevents re-imports.

**Gaps:** Duplicate check is by exact name + city (no fuzzy match). Way/relation parks only get center coordinates, not boundaries.

---

### 8. Security - 7/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Firestore rules | Implemented | Category whitelist, coordinate bounds, length limits |
| XSS prevention | Fixed | `escapeHtml()` on all user content in map popups |
| Input validation | Implemented | Client + server-side alignment |
| Rating pair whitelist | Implemented | Only predefined emoji+word combos accepted |
| Aggregation update guard | Implemented | Cannot change name/category/city/coordinates via update |
| Admin auth | Weak | Client-side password check, no real server auth |
| User identity | Weak | Anonymous localStorage IDs, spoofable |

**Strengths:** Firestore rules are well-structured with layered validation. XSS is mitigated in the most critical injection point (Leaflet popups). Rating input is properly whitelisted.

**Weaknesses:** No Firebase Authentication integration. Admin dashboard auth is purely cosmetic. No rate limiting at the Firestore or application level.

---

### 9. Data Model - 8/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Location schema | Solid | All needed fields present |
| Rating subcollection | Solid | Clean parent-child relationship |
| Type definitions | Good | TypeScript interfaces for Location, Rating, AgeGroupData, EmojiWord |
| Geohash support | Partial | Generated on import, not used for queries yet |

**Strengths:** The `ratingsByAgeGroup` denormalization pattern is efficient for reads -- no need to query subcollections for display.

**Gaps:** `coordinates` uses `{lat, lng}` on user-created locations but top-level `lat`/`lng` fields on OSM imports -- inconsistent schema.

---

### 10. Build & Testing - 7/10

| Aspect | Status | Notes |
|--------|--------|-------|
| Vite build | Working | Production output ~848KB main + 19KB admin chunk |
| TypeScript | Working | But strict mode disabled |
| Vitest setup | Working | jsdom environment, React testing library |
| Test coverage | Partial | 11 tests for aggregation logic, no component tests |
| Code splitting | Working | Admin page lazy-loaded |

**Strengths:** Vitest configuration is solid. Aggregation tests cover all edge cases thoroughly.

**Gaps:** No component/integration tests. Main bundle is 848KB (above the 500KB warning threshold). TypeScript strict mode is off (`noImplicitAny: false`, `strictNullChecks: false`).

---

## Summary Scorecard

| Feature | Rating | Priority Fix |
|---------|--------|-------------|
| Map & Display | 8/10 | -- |
| Rating System | 9/10 | -- |
| Aggregation | 9/10 | Move to Cloud Functions at scale |
| Location Creation | 8/10 | Add moderation workflow |
| Search | 7/10 | Add fuzzy matching |
| Admin Dashboard | 5/10 | Replace with real server-side auth |
| OSM Import | 7/10 | Add fuzzy duplicate detection |
| Security | 7/10 | Add Firebase Auth, server-side admin |
| Data Model | 8/10 | Normalize coordinate schema |
| Build & Testing | 7/10 | Enable strict TS, add component tests |

**Overall: 7.5/10** -- A well-architected frontend with solid rating mechanics. The main remaining gaps are server-side authentication and scaling the aggregation pipeline.
