# Manny Map (poppin') - Development Notes

## Overall Score: 7.5/10

Solid frontend with great rating UX. Main gaps: server-side auth, scaling aggregation, and bundle size.

---

## Implementation Status

All phases complete:
1. Rating system (persistence, aggregation, localStorage tracking)
2. Admin dashboard (`/admin` route, analytics, location management)
3. OSM import (Overpass API, batch UI, duplicate detection)
4. Search (text filter by name/category/address, recent searches)
5. Signup flow (localStorage tracking, Firebase Auth, guest skip)

**Cost:** Everything on free tier (Firebase, Overpass API, Vercel).

---

## Known Issues & TODOs

### Critical: Rating Persistence
- `handleRatingSubmit` in `src/pages/Index.tsx` must write to Firebase — currently only sets localStorage and shows a toast
- Need: individual rating docs at `locations/{id}/ratings/{ratingId}`, aggregation logic, duplicate prevention
- Long-term: migrate aggregation to Firebase Cloud Functions

### Admin Auth is Cosmetic
- Password check is client-side only (`sessionStorage.setItem("admin_auth", "true")` bypasses it)
- `VITE_ADMIN_PASSWORD` is embedded in the client bundle
- Fix: use Firebase Authentication with admin claims

### Scaling (1000+ locations)
- Implement viewport-based loading (only fetch visible map area) — reduces reads ~90%
- Use geohashing (`geofire-common` already installed) for spatial queries
- Add composite Firebase indexes on `[city, geohash]` and `[city, category, totalRatings]`
- Replace carousel with searchable bottom sheet + infinite scroll
- Consider `@tanstack/react-virtual` for list virtualization

### Other Gaps
- **Search:** client-side only, no fuzzy matching, `MAX_RECENT = 1` is low
- **Bundle:** 848KB main chunk (above 500KB threshold) — needs code splitting
- **TypeScript:** strict mode disabled (`noImplicitAny: false`, `strictNullChecks: false`)
- **Testing:** 11 tests for aggregation only, no component tests
- **Data model:** `coordinates` uses `{lat, lng}` on user-created locations but top-level `lat`/`lng` on OSM imports — inconsistent
- **Security:** anonymous userId is spoofable, no rate limiting

---

## Feature Scores

| Feature | Score | Key Note |
|---------|-------|----------|
| Map & Display | 8/10 | Clustering well-tuned, emoji markers distinctive |
| Rating System | 9/10 | Clean UX, predefined pairs prevent abuse |
| Aggregation | 9/10 | Divergence formula elegant, 5-rating minimum |
| Location Creation | 8/10 | No geocoding, no moderation workflow |
| Search | 7/10 | Client-side only, no fuzzy match |
| Admin Dashboard | 5/10 | Auth bypassable, no CRUD, first 50 only |
| OSM Import | 7/10 | Good category mapping, exact-match dedup only |
| Security | 7/10 | Firestore rules solid, auth layer weak |
| Data Model | 8/10 | Good denormalization, schema inconsistency |
| Build & Testing | 7/10 | Needs strict TS, component tests |
