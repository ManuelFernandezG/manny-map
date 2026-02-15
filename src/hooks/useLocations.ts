import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import type { Location } from "@/data/mockData";

async function fetchLocationsByCity(city: string): Promise<Location[]> {
  const q = query(
    collection(db, "locations"),
    where("city", "==", city)
  );

  const querySnapshot = await getDocs(q);

  const fetchedLocations: Location[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

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
      recentTrendsLast7d: data.recentTrendsLast7d ?? undefined,
    };

    fetchedLocations.push(location);
  });

  console.log(`✅ Fetched ${fetchedLocations.length} locations from Firebase for ${city}`);
  return fetchedLocations;
}

interface UseLocationsProps {
  city?: string;
}

export function useLocations({ city = "Ottawa" }: UseLocationsProps = {}) {
  const { data: locations = [], isLoading: loading, error } = useQuery({
    queryKey: ["locations", city],
    queryFn: () => fetchLocationsByCity(city),
  });

  return {
    locations,
    loading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch locations") : null,
  };
}
