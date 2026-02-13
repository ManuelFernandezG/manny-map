# Implementation Plan

## Phase 1: Rating System (30 min)
✅ Fix rating persistence
✅ Add aggregation algorithm
✅ Track rating count in localStorage (show signup after 3)

## Phase 2: Admin Dashboard (45 min)
✅ Create `/admin` route (password: in .env.local)
✅ Location management UI
✅ Import tools section
✅ Analytics dashboard

## Phase 3: Google/OSM Import (30 min)
✅ Overpass API integration (FREE)
✅ Google Places API integration (optional, paid)
✅ Batch import UI in admin

## Phase 4: Search Feature (20 min)
✅ Search bar component (already exists at LocationSearch.tsx!)
✅ Show 1 recent + 3 suggestions
✅ Filter by category

## Phase 5: Signup Flow (15 min)
✅ Track ratings in localStorage
✅ Show signup modal after 3rd rating
✅ "Skip" option (continue as guest)
✅ Firebase Auth integration

---

## Tech Stack

### Free Options:
- **Overpass API** (OpenStreetMap) - FREE, unlimited
- **Firebase Auth** - FREE up to 50k users/month
- **Firestore** - FREE up to 50k reads/day

### Paid Options (if needed later):
- **Google Places API** - $200/month free credit
- **Algolia Search** - Better search, $1/month for hobby

---

## Cost Estimate

**Current (Free Tier):**
- Firebase: $0/month (under limits)
- Overpass API: $0 (free forever)
- Hosting: $0 (Vercel/Netlify free tier)

**With Google Places (optional):**
- Import 1,000 locations: $0 (within free credit)
- Import 10,000 locations: ~$100 one-time

**Recommendation:** Start 100% free, upgrade only if needed.
