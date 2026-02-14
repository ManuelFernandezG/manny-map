import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { geohashForLocation } from 'geofire-common';

/**
 * Overpass API - Free OpenStreetMap data
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

export interface OverpassPlace {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    leisure?: string;
    sport?: string;
    cuisine?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'opening_hours'?: string;
    phone?: string;
    website?: string;
  };
}

const CATEGORY_MAPPING: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bar: 'Bar',
  pub: 'Bar',
  nightclub: 'Nightclub',
  park: 'Park',
  sports_centre: 'Gym',
  fitness_centre: 'Gym',
  fitness_station: 'Gym',
  gym: 'Gym',
  // Add more mappings as needed
};

/**
 * Build Overpass query for a city
 */
const MAX_RADIUS = 10000; // 10km cap

function buildOverpassQuery(city: string, lat: number, lng: number, radius: number = 5000): string {
  const safeRadius = Math.max(100, Math.min(Math.round(radius), MAX_RADIUS));
  radius = safeRadius;
  // Query for various amenities and places
  return `
    [out:json][timeout:25];
    (
      // Restaurants and cafes
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
      node["amenity"="bar"](around:${radius},${lat},${lng});
      node["amenity"="pub"](around:${radius},${lat},${lng});
      node["amenity"="nightclub"](around:${radius},${lat},${lng});

      // Parks and leisure
      node["leisure"="park"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});

      // Sports and fitness
      node["leisure"="sports_centre"](around:${radius},${lat},${lng});
      node["leisure"="fitness_centre"](around:${radius},${lat},${lng});
      node["sport"](around:${radius},${lat},${lng});
    );
    out center;
  `;
}

/**
 * Fetch places from Overpass API
 */
export async function fetchFromOverpass(
  city: string,
  lat: number,
  lng: number,
  radius: number = 5000
): Promise<OverpassPlace[]> {
  const query = buildOverpassQuery(city, lat, lng, radius);
  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching from Overpass:', error);
    throw error;
  }
}

/**
 * Map category from OSM tags to our categories
 */
function mapCategory(tags: OverpassPlace['tags']): string {
  const amenity = tags.amenity || '';
  const leisure = tags.leisure || '';

  return CATEGORY_MAPPING[amenity] ||
         CATEGORY_MAPPING[leisure] ||
         'Other';
}

/**
 * Check if location already exists in Firebase
 */
async function locationExists(name: string, city: string, lat: number, lng: number): Promise<boolean> {
  try {
    const locationsRef = collection(db, 'locations');
    const q = query(
      locationsRef,
      where('name', '==', name),
      where('city', '==', city)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking location existence:', error);
    return false;
  }
}

/**
 * Import locations from Overpass to Firebase
 */
export async function importLocationsToFirebase(
  places: OverpassPlace[],
  city: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const locationsRef = collection(db, 'locations');

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    onProgress?.(i + 1, places.length);

    try {
      // Skip if no name
      if (!place.tags.name) {
        skipped++;
        continue;
      }

      // Check if already exists
      const exists = await locationExists(
        place.tags.name,
        city,
        place.lat,
        place.lon
      );

      if (exists) {
        skipped++;
        console.log(`⏭️  Skipped ${place.tags.name} (already exists)`);
        continue;
      }

      // Create location document
      const category = mapCategory(place.tags);
      const address = [
        place.tags['addr:housenumber'],
        place.tags['addr:street'],
        place.tags['addr:city'] || city
      ]
        .filter(Boolean)
        .join(' ');

      const locationData = {
        name: place.tags.name,
        category,
        address: address || '',
        neighborhood: '',
        city,
        lat: place.lat,
        lng: place.lon,
        geohash: geohashForLocation([place.lat, place.lon]),
        hours: place.tags.opening_hours || '',
        description: '',
        phone: place.tags.phone || '',
        website: place.tags.website || '',
        isUserCreated: false,
        isPending: false,
        totalRatings: 0,
        ratingsByAgeGroup: {
          '18-22': {
            dominant: { emoji: '🔥', word: 'New', count: 0 },
            totalRatings: 0,
            topPairs: []
          },
          '23-28': {
            dominant: { emoji: '🔥', word: 'New', count: 0 },
            totalRatings: 0,
            topPairs: []
          },
          '29-35': {
            dominant: { emoji: '🔥', word: 'New', count: 0 },
            totalRatings: 0,
            topPairs: []
          },
          '36+': {
            dominant: { emoji: '🔥', word: 'New', count: 0 },
            totalRatings: 0,
            topPairs: []
          }
        },
        divergenceScore: 0,
        divergenceFlagged: false,
        dominantEmoji: '🔥',
        dominantWord: 'New',
        createdAt: serverTimestamp(),
        source: 'osm',
        osmId: place.id
      };

      await addDoc(locationsRef, locationData);
      imported++;
      console.log(`✅ Imported ${place.tags.name}`);

    } catch (error) {
      console.error(`❌ Error importing ${place.tags.name}:`, error);
      errors++;
    }

    // Add delay to avoid overwhelming Firebase
    if (i % 10 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { imported, skipped, errors };
}

/**
 * Main import function - combines fetch and import
 */
export async function importFromOSM(
  city: string,
  lat: number,
  lng: number,
  radius: number = 5000,
  onProgress?: (current: number, total: number, stage: string) => void
): Promise<{ imported: number; skipped: number; errors: number; total: number }> {
  try {
    // Stage 1: Fetch from Overpass
    onProgress?.(0, 100, 'Fetching from OpenStreetMap...');
    const places = await fetchFromOverpass(city, lat, lng, radius);

    console.log(`📡 Fetched ${places.length} places from Overpass API`);

    // Stage 2: Import to Firebase
    onProgress?.(0, places.length, 'Importing to Firebase...');
    const result = await importLocationsToFirebase(places, city, (current, total) => {
      onProgress?.(current, total, 'Importing to Firebase...');
    });

    return {
      ...result,
      total: places.length
    };
  } catch (error) {
    console.error('Error in OSM import:', error);
    throw error;
  }
}
