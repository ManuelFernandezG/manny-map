import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CitySelector from "@/components/CitySelector";
import CategoryFilter from "@/components/CategoryFilter";
import LocationSearch from "@/components/LocationSearch";
import { CITIES, CATEGORIES, CATEGORY_GROUPS, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import type { CheckinData, ReviewData } from "@/lib/ratings";
import { toast } from "sonner";
import { useLocations, LOCATIONS_QUERY_VERSION } from "@/hooks/useLocations";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";

// Lazy-load heavy components that aren't needed for first paint
const MapView = lazy(() => import("@/components/MapView"));
const RatedCarousel = lazy(() => import("@/components/RatedCarousel"));
const CheckinModal = lazy(() => import("@/components/CheckinModal"));
const ReviewModal = lazy(() => import("@/components/ReviewModal"));
const LocationDetailModal = lazy(() => import("@/components/LocationDetailModal"));
const AuthModal = lazy(() => import("@/components/AuthModal"));

const Index = () => {
  const [city, setCity] = useState("Ottawa");
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);
  const [ratedActiveIndex, setRatedActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkinLocation, setCheckinLocation] = useState<Location | null>(null);
  const [reviewLocation, setReviewLocation] = useState<Location | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [hasSeenSignupPrompt, setHasSeenSignupPrompt] = useState(() => {
    try {
      return localStorage.getItem("mannymap_signup_prompt_seen") === "true";
    } catch {
      return false;
    }
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /** Nightlife-first: only Nightlife category group */
  const GROUPS = useMemo(() => ["nightlife"] as const, []);
  const [activeGroups, setActiveGroups] = useState<Set<string>>(() => new Set(GROUPS));
  const [ratedLocationIds, setRatedLocationIds] = useState<Map<string, RatedEntry>>(() => getRatedLocationIds());
  const { locations, loading, error } = useLocations({ city });

  const [userAgeGroup, setUserAgeGroup] = useState<string | null>(() => {
    try { return localStorage.getItem("mannymap_age_group"); } catch { return null; }
  });
  const [userGender, setUserGender] = useState<string | null>(() => {
    try { return localStorage.getItem("mannymap_gender"); } catch { return null; }
  });

  // Handle deep-link params from Profile (/?review=xxx or /?rate=xxx)
  useEffect(() => {
    if (locations.length === 0) return;
    const reviewId = searchParams.get("review");
    const rateId = searchParams.get("rate");
    if (reviewId) {
      const loc = locations.find((l) => l.id === reviewId);
      if (loc) {
        setReviewLocation(loc);
        setSearchParams({}, { replace: true });
      }
    } else if (rateId) {
      const loc = locations.find((l) => l.id === rateId);
      if (loc) {
        handleLocationAction(loc);
        setSearchParams({}, { replace: true });
      }
    }
  }, [locations, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const cityConfig = CITIES[city];
  const cityCenter = useMemo<[number, number]>(
    () => [cityConfig.lat, cityConfig.lng],
    [cityConfig.lat, cityConfig.lng]
  );

  // Use higher zoom for mobile devices (especially for Ottawa)
  const isMobile = window.innerWidth < 768;
  const cityZoom = useMemo(() => {
    if (city === "Ottawa" && isMobile) {
      return 15.5; // Tighter view for iPhone
    }
    return cityConfig.zoom;
  }, [city, cityConfig.zoom, isMobile]);
  const filteredLocations = useMemo(
    () => locations.filter((l) => l.city === city),
    [locations, city]
  );

  const inViewLocations = useMemo(() => {
    if (!mapBounds) return filteredLocations;
    const [west, south, east, north] = mapBounds;
    const centerLat = (south + north) / 2;
    const centerLng = (west + east) / 2;
    return filteredLocations
      .filter((l) => {
        const { lat, lng } = l.coordinates;
        return lat >= south && lat <= north && lng >= west && lng <= east;
      })
      .sort((a, b) => {
        const distA = (a.coordinates.lat - centerLat) ** 2 + (a.coordinates.lng - centerLng) ** 2;
        const distB = (b.coordinates.lat - centerLat) ** 2 + (b.coordinates.lng - centerLng) ** 2;
        return distA - distB;
      });
  }, [filteredLocations, mapBounds]);

  const visibleLocations = useMemo(() => {
    return inViewLocations.filter((l) => {
      const group = CATEGORY_GROUPS[l.category];
      return group && activeGroups.has(group);
    });
  }, [inViewLocations, activeGroups]);

  const locationsForMap = useMemo(
    () =>
      filteredLocations.filter((l) => {
        const group = CATEGORY_GROUPS[l.category];
        return group && activeGroups.has(group);
      }),
    [filteredLocations, activeGroups]
  );

  const activeCategories = useMemo(
    () => new Set(CATEGORIES.filter((c) => activeGroups.has(CATEGORY_GROUPS[c] ?? ""))),
    [activeGroups]
  );

  const ratedCountByGroup = useMemo(() => {
    const count: Record<string, number> = {};
    filteredLocations.forEach((loc) => {
      if (!ratedLocationIds.has(loc.id)) return;
      const group = CATEGORY_GROUPS[loc.category];
      if (group) count[group] = (count[group] ?? 0) + 1;
    });
    return count;
  }, [filteredLocations, ratedLocationIds]);

  const ratedLocations = useMemo(
    () =>
      filteredLocations.filter(
        (l) => ratedLocationIds.has(l.id) && activeGroups.has(CATEGORY_GROUPS[l.category] ?? "")
      ),
    [filteredLocations, ratedLocationIds, activeGroups]
  );

  const safeRatedIndex = Math.min(ratedActiveIndex, Math.max(0, ratedLocations.length - 1));

  // Helper: determine what action a location needs
  const getLocationAction = useCallback((loc: Location): "checkin" | "review" => {
    const entry = ratedLocationIds.get(loc.id);
    if (entry && entry.phase === "checkin") return "review";
    return "checkin";
  }, [ratedLocationIds]);

  // Handle the generic "action" button (Pre/Plans or Afters/Debrief)
  const handleLocationAction = useCallback((loc: Location) => {
    const action = getLocationAction(loc);
    if (action === "review") {
      setReviewLocation(loc);
    } else {
      setCheckinLocation(loc);
    }
  }, [getLocationAction]);

  const handleGroupToggle = useCallback((groupId: string) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleGroupToggleAll = useCallback(() => {
    setActiveGroups((prev) =>
      prev.size === GROUPS.length ? new Set<string>() : new Set(GROUPS)
    );
  }, [GROUPS]);

  const handleLocationClick = useCallback((loc: Location) => {
    setSelectedLocation(loc);
  }, []);

  const handleMapClick = useCallback((_lat: number, _lng: number) => {
    // Map click no longer opens create-location (non-review Firestore writes removed)
  }, []);

  // --- Check-in mutation ---
  const checkinMutation = useMutation({
    mutationFn: async ({ locationId, data }: { locationId: string; data: CheckinData }) => {
      const { submitCheckin } = await import("@/lib/ratings");
      return submitCheckin(locationId, data);
    },
    onSuccess: (_result, { data }) => {
      setUserAgeGroup(data.ageGroup);
      localStorage.setItem("mannymap_age_group", data.ageGroup);
      setUserGender(data.gender);
      localStorage.setItem("mannymap_gender", data.gender);
      setRatedLocationIds(getRatedLocationIds());

      const labels = PHASE_LABELS[data.gender as keyof typeof PHASE_LABELS];
      toast.success(
        data.gender === "Female"
          ? "Locked in! Debrief after."
          : "You're set! Come back for afters.",
        { duration: 3000 }
      );
      setTimeout(() => setCheckinLocation(null), 1500);
    },
    onError: () => {
      toast.error("Failed to check in. Please try again.");
    },
  });

  const handleCheckinSubmit = (data: CheckinData) => {
    if (!checkinLocation) return;
    checkinMutation.mutate({ locationId: checkinLocation.id, data });
  };

  // --- Review mutation ---
  const reviewMutation = useMutation({
    mutationFn: async ({ locationId, review }: { locationId: string; review: ReviewData }) => {
      const { submitReview } = await import("@/lib/ratings");
      return submitReview(locationId, review);
    },
    onSuccess: () => {
      // Optimistic update: bump totalRatings so list feels instant
      queryClient.setQueryData<Location[]>(["locations", LOCATIONS_QUERY_VERSION, city], (old) => {
        if (!old || !reviewLocation) return old;
        return old.map((loc) =>
          loc.id === reviewLocation.id
            ? { ...loc, totalRatings: loc.totalRatings + 1 }
            : loc
        );
      });
      queryClient.invalidateQueries({ queryKey: ["locations", LOCATIONS_QUERY_VERSION, city] });
      // Delayed refetch so Firestore trigger has time to run and we get fresh aggregates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["locations", LOCATIONS_QUERY_VERSION, city] });
      }, 1800);

      setRatedLocationIds(getRatedLocationIds());

      import("@/lib/userId").then(({ incrementRatingCount }) => {
        const newCount = incrementRatingCount();
        if (newCount === 3 && !hasSeenSignupPrompt) {
          setTimeout(() => setShowSignupPrompt(true), 2000);
        }
      });

      const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
      toast.success(`${labels?.phase2 || "Review"} saved!`, { duration: 3000 });
      setTimeout(() => setReviewLocation(null), 1500);
    },
    onError: () => {
      toast.error("Failed to save review. Please try again.");
    },
  });

  const handleReviewSubmit = (review: ReviewData) => {
    if (!reviewLocation) return;
    reviewMutation.mutate({ locationId: reviewLocation.id, review });
  };

  return (
    <div className="flex h-screen min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden overflow-y-hidden bg-background">
      <Sidebar />
      <div className="relative min-w-0 flex-1 overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full bg-muted animate-pulse" />}>
          <MapView
            locations={locationsForMap}
            center={cityCenter}
            zoom={cityZoom}
            ratedLocationIds={ratedLocationIds}
            onLocationClick={handleLocationClick}
            onMapClick={handleMapClick}
            onBoundsChange={setMapBounds}
          />
        </Suspense>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3 bg-white/95 backdrop-blur-md px-6 py-4 border border-[#E0E0E0] card-shadow">
            <Loader className="h-6 w-6 text-[#2D5F2D] animate-spin" />
            <p className="text-[#333333] font-['Inter'] font-medium text-sm">Loading locations...</p>
          </div>
        </div>
      )}

      {/* Error banner — non-blocking */}
      {error && !loading && (
        <div className="absolute bottom-16 left-4 right-4 z-[999] flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 py-3 border border-[#E0E0E0] card-shadow">
          <p className="text-sm text-[#333333] font-['Inter'] truncate">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 px-3 py-1.5 bg-[#2D5F2D] text-white text-sm font-['Inter'] font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1001] pt-6 pb-2 px-2 sm:pt-8 sm:pb-4 sm:px-4">
        <div className="flex justify-center">
          <LocationSearch
            locations={filteredLocations}
            ratedLocationIds={ratedLocationIds}
            onLocationSelect={(loc) => setSelectedLocation(loc)}
          />
        </div>
      </div>


      {/* Rated locations carousel */}
      {!loading && ratedLocations.length > 0 && (
        <div className="absolute bottom-[72px] left-0 right-0 z-[400] pb-2 pointer-events-none">
          <Suspense fallback={null}>
            <RatedCarousel
              locations={ratedLocations}
              activeIndex={safeRatedIndex}
              ratedLocationIds={ratedLocationIds}
              userGender={userGender}
              onLocationTap={(loc) => setSelectedLocation(loc)}
              onRate={handleLocationAction}
              onActiveChange={setRatedActiveIndex}
            />
          </Suspense>
        </div>
      )}

      {/* Modals — each wrapped in Suspense since they're lazy-loaded */}
      <Suspense fallback={null}>
        {selectedLocation && (
          <LocationDetailModal
            location={selectedLocation}
            userAgeGroup={userAgeGroup}
            onClose={() => setSelectedLocation(null)}
            onRate={() => {
              const loc = selectedLocation;
              setSelectedLocation(null);
              handleLocationAction(loc);
            }}
          />
        )}

        {checkinLocation && (
          <CheckinModal
            location={checkinLocation}
            userAgeGroup={userAgeGroup}
            userGender={userGender}
            onSubmit={handleCheckinSubmit}
            onClose={() => setCheckinLocation(null)}
          />
        )}

        {reviewLocation && (
          <ReviewModal
            location={reviewLocation}
            userGender={userGender}
            onSubmit={handleReviewSubmit}
            onClose={() => setReviewLocation(null)}
          />
        )}

        {showSignupPrompt && (
          <AuthModal
            onClose={() => {
              setShowSignupPrompt(false);
              setHasSeenSignupPrompt(true);
              try { localStorage.setItem("mannymap_signup_prompt_seen", "true"); } catch {}
            }}
            onSuccess={() => {
              setRatedLocationIds(getRatedLocationIds());
            }}
          />
        )}
      </Suspense>

      <BottomNav />
      </div>
    </div>
  );
};

export default Index;
