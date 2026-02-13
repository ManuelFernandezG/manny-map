# Manny App (poppin') - Evaluation

## Overview

**poppin'** is a map-based social discovery app where users rate local spots (restaurants, bars, cafes, parks, gyms) using emoji-word pairs, segmented by age group. It targets Canadian cities (Ottawa, Toronto, Montreal) and features divergence detection when age groups disagree on a location's vibe.

**Tech stack:** React 18 + TypeScript + Vite + Tailwind CSS + Firebase (Firestore) + Leaflet maps + shadcn/ui

---

## Build & Tooling Status

| Check | Result |
|-------|--------|
| `npm run build` | Passes (12s) |
| `npm run lint` | 8 errors, 8 warnings |
| `npm run test` | No test files exist |
| `npm audit` | 8 vulnerabilities (4 moderate, 4 high) |
| Bundle size | **867 KB** main chunk (gzip: 245 KB) - exceeds 500 KB warning |

---

## Strengths

### 1. Clear Product Concept
The emoji + age-group rating model is distinctive. Divergence detection (flagging when age groups disagree) is a genuinely interesting social signal that differentiates this from standard review apps.

### 2. Solid Project Structure
Clean separation of concerns: pages, components, hooks, lib, data. Path aliasing (`@/`) is configured. Consistent naming conventions throughout.

### 3. Good UI Component Foundation
The shadcn/ui integration provides a comprehensive, accessible component library (40+ primitives). Tailwind theming with CSS variables supports future dark/light mode.

### 4. Working Firebase Integration
Real-time data fetching, rating submission with duplicate prevention, server-side timestamps, and aggregation logic are all functional.

### 5. OSM Import Pipeline
The Overpass API integration for bulk-importing locations is well-implemented with progress callbacks, duplicate checking, rate limiting, and category mapping.

---

## Issues

### Critical

**1. No Tests**
Zero test files exist despite Vitest being configured. The rating aggregation logic (`ratings.ts`), divergence calculation, and data transformation in `useLocations.ts` are complex enough to warrant unit tests. This is the single biggest gap.

**2. Client-Side Aggregation is a Scaling Bottleneck**
`aggregateRatings()` in `ratings.ts:68` fetches *all* ratings for a location, recalculates everything client-side, then writes back to the location document. This creates:
- Race conditions if two users rate simultaneously (last write wins, potentially dropping data)
- Increasing latency as ratings grow (fetching hundreds/thousands of docs per rating)
- Unnecessary Firestore reads (cost implications)

This should be a Cloud Function triggered on rating writes.

**3. Admin Auth is Client-Side Only**
`Admin.tsx:9` compares a password against `VITE_ADMIN_PASSWORD` which is bundled into the client JavaScript. Anyone can extract this from the built bundle. The admin dashboard loads all locations from Firestore with no server-side access control - Firestore security rules are the real gate, but the password check provides false confidence.

### High

**4. No Firestore Security Rules Visible**
There are no `firestore.rules` in the repo. Without rules, the database may be open to arbitrary reads/writes. Any user could modify location documents, delete ratings, or import fake data directly via the Firestore API.

**5. User-Created Locations are Client-Side Only**
`handleCreateLocation` in `Index.tsx:121` creates a `Location` object in React state but never writes it to Firebase. These locations disappear on page refresh. The `isPending: true` flag suggests admin approval was intended but not implemented.

**6. Bundle Size (867 KB)**
The main JS chunk is 867 KB (245 KB gzip). Primary contributors are likely Recharts, the full Radix UI suite, and Leaflet. Code-splitting the admin page and detail modal via `React.lazy()` would help significantly since most users never visit `/admin`.

**7. Lint Errors**
8 ESLint errors including:
- `no-explicit-any` in `ratings.ts:21` (Rating timestamp typed as `any`)
- `no-empty` in `Index.tsx:294,302,309` (empty catch blocks in localStorage calls)
- `no-empty-object-type` in `textarea.tsx:5`
- `no-require-imports` in `tailwind.config.ts:114`

### Medium

**8. `useLocations` Doesn't Use React Query**
The hook (`useLocations.ts`) manually manages `loading`/`error`/`data` state with `useEffect` + `useState`, despite React Query being installed and configured in `App.tsx`. This misses out on caching, deduplication, background refetching, and stale-while-revalidate. The data goes stale after a rating until the user switches cities.

**9. Clustering Algorithm is O(n^2)**
`getClustersForZoom()` in `MapView.tsx:62` uses a nested loop comparing every location to every other location. With 1000+ locations (which the SCALING_PLAN.md anticipates), this becomes expensive on every zoom change.

**10. Anonymous User ID is Easily Spoofable**
`userId.ts:17` generates IDs stored in localStorage. A user can clear localStorage to get a new ID and re-rate locations, bypassing the duplicate rating check. The `submitRating` duplicate check queries by this client-generated ID.

**11. Hardcoded Age Groups**
Age groups are hardcoded in multiple places: `ratings.ts:82-87`, `overpassImport.ts:200-219`, `useLocations.ts:50-71`, and `mockData.ts`. Changing or adding an age group requires edits in 4+ files.

**12. Console Logging in Production**
Emoji-prefixed `console.log` statements throughout the codebase (`ratings.ts`, `useLocations.ts`, `overpassImport.ts`, `Index.tsx`). These should be removed or gated behind a debug flag for production.

### Low

**13. `onMapClick` Handler Has a Stale Closure Risk**
In `MapView.tsx:164`, the `onMapClick` callback is captured in the initial `useEffect` (which runs once due to `[]` deps). If the parent re-renders with a new `onMapClick`, the map still fires the old one. This is partially mitigated by `useCallback` in the parent, but the `filteredLocations` dependency means it recreates on data changes.

**14. Import Runs Sequentially**
`importLocationsToFirebase` in `overpassImport.ts:149` processes locations one at a time with a `for` loop and individual `locationExists` checks. Batched writes and parallel existence checks would improve import speed.

**15. Location Table Has No Pagination**
`Admin.tsx:236` hard-caps at 50 locations with `locations.slice(0, 50)`. No pagination, sorting, or filtering controls exist.

---

## Architecture Recommendations

1. **Add Firestore security rules** - This is the most urgent security need. Restrict writes to authenticated users, prevent direct location document modification, and scope admin operations.

2. **Move aggregation to a Cloud Function** - A Firestore `onWrite` trigger on the ratings subcollection eliminates race conditions and client-side cost.

3. **Write tests for core logic** - At minimum: `aggregateRatings`, divergence calculation, `mapCategory`, and `getUserId`. These are pure or near-pure functions that are straightforward to test.

4. **Code-split the admin route** - `React.lazy(() => import('./pages/Admin'))` immediately cuts the bundle for regular users.

5. **Use React Query in `useLocations`** - Replace the manual `useEffect` with `useQuery` to get caching, refetching after mutations, and loading states for free.

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **Functionality** | 7/10 | Core rating flow works. User-created locations don't persist. Signup is a stub. |
| **Code Quality** | 6/10 | Clean structure, but lint errors, `any` types, no tests, console logging. |
| **Security** | 4/10 | Client-side admin auth, no visible Firestore rules, spoofable user IDs. |
| **Performance** | 6/10 | Oversized bundle, O(n^2) clustering, client-side aggregation. Works fine at current scale. |
| **Scalability** | 5/10 | Loads all locations per city, client-side aggregation, sequential imports. Scaling plan exists but isn't implemented. |
| **Testing** | 1/10 | Infrastructure configured, zero tests written. |
| **UX/Design** | 8/10 | Polished UI, good use of shadcn/ui, responsive layout, clear user flows. |
| **Overall** | 5.5/10 | Solid prototype with a strong product concept. Needs security hardening, tests, and server-side aggregation before production use. |
