# Manny Map

A map-based social discovery app where users rate local spots using emoji-word pairs, segmented by age group. Features divergence detection when different age groups disagree on a location's vibe.

## Features

- Interactive map with emoji markers and zoom-based clustering
- Rate locations with emoji-word pairs across 6 categories (Energy, Price, Crowd, Food, Service, Location)
- Age group segmentation with divergence detection
- City switching (Ottawa, Toronto, Montreal, Guelph)
- Search and filter locations by name, category, or neighborhood
- Admin dashboard with analytics and OSM import tool
- Firebase Auth with guest mode

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap tiles
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Hosting:** Vercel

## Getting Started

```sh
npm install
```

### Environment Setup

**Option A — Pull from Vercel (recommended):**

```sh
npm i -g vercel
vercel link
npm run setup
```

**Option B — Manual:**

Copy `.env.example` to `.env.local` and fill in your Firebase config.

### Run

```sh
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint with ESLint |
| `npm run setup` | Pull env vars from Vercel |

## Roadmap

- [x] Emoji-word rating UI with age group segmentation
- [x] Map with clustering and city switching
- [x] Search and filter locations
- [x] Admin dashboard with OSM import
- [ ] **Persist ratings to Firebase** — currently localStorage only, need Firestore writes with duplicate prevention
- [ ] Rating aggregation pipeline (client-side first, Cloud Functions later)
- [ ] Viewport-based loading for 1000+ locations
- [ ] Geohash spatial queries
- [ ] Migrate location data to PostGIS (Supabase) for scale
- [ ] Add fuzzy search (Meilisearch/Typesense)
- [ ] Expand to more cities
