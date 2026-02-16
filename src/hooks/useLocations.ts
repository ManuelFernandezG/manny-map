import { useQuery } from "@tanstack/react-query";
import { NIGHTLIFE_LOCATIONS } from "@/data/nightlifeLocations";
import type { Location } from "@/data/mockData";

async function fetchLocationsByCity(city: string): Promise<Location[]> {
  const filtered = NIGHTLIFE_LOCATIONS.filter((loc) => loc.city === city);
  return Promise.resolve(filtered);
}

interface UseLocationsProps {
  city?: string;
}

// Bump version to bust cache when nightlifeLocations changes
export const LOCATIONS_QUERY_VERSION = 2;

export function useLocations({ city = "Ottawa" }: UseLocationsProps = {}) {
  const { data: locations = [], isLoading: loading, error } = useQuery({
    queryKey: ["locations", LOCATIONS_QUERY_VERSION, city],
    queryFn: () => fetchLocationsByCity(city),
    // Static data: no network, instant; keep cache for consistency with other hooks
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    locations,
    loading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch locations") : null,
  };
}
