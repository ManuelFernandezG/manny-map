# Scaling Plan for 1000+ Locations

## 🔴 Critical Changes Needed

### 1. **Viewport-Based Loading** (Most Important)
Instead of loading all locations, only fetch what's visible on the map:

```typescript
// Query Firebase based on map bounds
const bounds = map.getBounds();
const q = query(
  collection(db, "locations"),
  where("lat", ">=", bounds.getSouth()),
  where("lat", "<=", bounds.getNorth()),
  where("lng", ">=", bounds.getWest()),
  where("lng", "<=", bounds.getEast()),
  limit(100)
);
```

**Requires:** Composite index in Firebase on `[lat, lng, city]`

### 2. **Geohashing for Efficient Queries**
Use geohash library to partition locations spatially:

```bash
npm install geofire-common
```

Store geohash in Firebase:
```typescript
import { geohashForLocation } from 'geofire-common';

const location = {
  ...data,
  geohash: geohashForLocation([lat, lng])
};
```

Query by geohash (much faster):
```typescript
const bounds = geohashQueryBounds([centerLat, centerLng], radiusInMeters);
```

### 3. **Pagination for Carousel**
Replace dot navigation with:
- Search bar (Algolia or Firebase search)
- Category filters
- "Nearby" sorting
- Infinite scroll with 20 items at a time

### 4. **Add Search Component**
```tsx
// src/components/LocationSearch.tsx already exists!
// Implement Algolia search or Firebase text search
```

### 5. **Firebase Optimization**

#### Index Strategy:
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "locations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "city", "order": "ASCENDING" },
        { "fieldPath": "geohash", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "locations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "city", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "totalRatings", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### Data Structure:
```typescript
// Separate ratings into subcollection
locations/{locationId}/ratings/{ratingId}

// Keep aggregated data on location doc
locations/{locationId}
  - dominantEmoji
  - dominantWord
  - totalRatings
  - ratingsByAgeGroup (aggregated only)
```

## 🟡 UI/UX Improvements

### Replace Bottom Carousel:
```tsx
// Instead of carousel, show:
<BottomSheet>
  <SearchBar />
  <FilterButtons categories={CATEGORIES} />
  <LocationList> {/* Virtual scroll */}
    {visibleLocations.map(...)}
  </LocationList>
</BottomSheet>
```

### Add Map Controls:
- Search bar on top
- Filter chips (category, rating, distance)
- "Recenter" button
- Current location button

### Loading Strategy:
```tsx
const [visibleLocations, setVisibleLocations] = useState([]);

map.on('moveend', () => {
  fetchLocationsInViewport(map.getBounds());
});
```

## 🟢 Performance Wins

### 1. **React Query for Caching**
```typescript
// Already using @tanstack/react-query!
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['locations', city, bounds],
  queryFn: () => fetchLocationsByViewport(city, bounds),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 2. **Virtualization**
```bash
npm install @tanstack/react-virtual
```

### 3. **Web Workers for Clustering**
Move clustering logic to web worker to keep UI responsive

## 📊 Cost Optimization

Current approach: **1 read per location** = 1000 reads per page load
New approach: **~50-100 reads** (only visible area)

**Savings:** 90% reduction in Firebase costs

## 🎯 Implementation Priority

1. ✅ Fix crash (DONE)
2. 🔥 Add viewport-based loading (CRITICAL)
3. 🔥 Implement geohashing
4. 📝 Add search/filter UI
5. 🎨 Replace carousel with bottom sheet
6. ⚡ Add React Query caching
7. 📈 Monitor performance with Firebase Analytics

## Next Steps

Want me to implement any of these? I recommend starting with #2 (viewport loading) + #4 (search UI).
