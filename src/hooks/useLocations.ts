import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Location } from "@/data/mockData";

interface UseLocationsProps {
  city?: string;
}

export function useLocations({ city = "Ottawa" }: UseLocationsProps = {}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);

      // Query Firebase for locations in the selected city
      const q = query(
        collection(db, "locations"),
        where("city", "==", city)
      );

      const querySnapshot = await getDocs(q);

      const fetchedLocations: Location[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Transform Firebase data to Location format
        // Support both top-level lat/lng (OSM imports) and nested coordinates (user-created)
        const location: Location = {
          id: doc.id,
          name: data.name || "",
          category: data.category || "Other",
          address: data.address || "",
          neighborhood: data.neighborhood || city,
          city: data.city || city,
          coordinates: {
            lat: data.coordinates?.lat ?? data.lat ?? 45.4215,
            lng: data.coordinates?.lng ?? data.lng ?? -75.6972,
          },
          hours: data.hours || undefined,
          description: data.description || undefined,
          isUserCreated: data.isUserCreated || false,
          isPending: data.isPending || false,
          totalRatings: data.totalRatings || 0,
          ratingsByAgeGroup: data.ratingsByAgeGroup || {
            "18-22": {
              dominant: { emoji: "🔥", word: "New", count: 0 },
              totalRatings: 0,
              topPairs: [],
            },
            "23-28": {
              dominant: { emoji: "🔥", word: "New", count: 0 },
              totalRatings: 0,
              topPairs: [],
            },
            "29-35": {
              dominant: { emoji: "🔥", word: "New", count: 0 },
              totalRatings: 0,
              topPairs: [],
            },
            "36+": {
              dominant: { emoji: "🔥", word: "New", count: 0 },
              totalRatings: 0,
              topPairs: [],
            },
          },
          divergenceScore: data.divergenceScore || 0,
          divergenceFlagged: data.divergenceFlagged || false,
          dominantEmoji: data.dominantEmoji || "🔥",
          dominantWord: data.dominantWord || "New",
        };

        fetchedLocations.push(location);
      });

      console.log(`✅ Fetched ${fetchedLocations.length} locations from Firebase for ${city}`);
      setLocations(fetchedLocations);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching locations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, loading, error, refetch: fetchLocations };
}
