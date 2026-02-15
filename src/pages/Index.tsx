import { useState, useCallback, useMemo, useEffect } from "react";
import { Flame, Loader, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MapView from "@/components/MapView";
import LocationDrawer from "@/components/LocationDrawer";
import RatedCarousel from "@/components/RatedCarousel";
import CitySelector from "@/components/CitySelector";
import CategoryFilter from "@/components/CategoryFilter";
import LocationSearch from "@/components/LocationSearch";
import CheckinModal from "@/components/CheckinModal";
import ReviewModal from "@/components/ReviewModal";
import LocationDetailModal from "@/components/LocationDetailModal";
import CreateLocationModal from "@/components/CreateLocationModal";
import SignupPrompt from "@/components/SignupPrompt";
import { CITIES, CATEGORIES, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import type { CheckinData, ReviewData } from "@/lib/ratings";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useLocations";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Index = () => {
  const [city, setCity] = useState("Ottawa");
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);
  const [ratedActiveIndex, setRatedActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [checkinLocation, setCheckinLocation] = useState<Location | null>(null);
  const [reviewLocation, setReviewLocation] = useState<Location | null>(null);
  const [createCoords, setCreateCoords] = useState<{ lat: number; lng: number } | null>(null);
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

  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => new Set(CATEGORIES));
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
  const filteredLocations = useMemo(
    () => locations.filter((l) => l.city === city),
    [locations, city]
  );

  const visibleLocations = useMemo(() => {
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

  const ratedLocations = useMemo(
    () => filteredLocations.filter((l) => ratedLocationIds.has(l.id)),
    [filteredLocations, ratedLocationIds]
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

  const handleCategoryToggle = useCallback((category: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleCategoryToggleAll = useCallback(() => {
    setActiveCategories((prev) =>
      prev.size === CATEGORIES.length ? new Set<string>() : new Set(CATEGORIES)
    );
  }, []);

  const handleLocationClick = useCallback((loc: Location) => {
    setSelectedLocation(loc);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    const nearby = filteredLocations.some(
      (l) =>
        Math.abs(l.coordinates.lat - lat) < 0.001 &&
        Math.abs(l.coordinates.lng - lng) < 0.001
    );
    if (!nearby) setCreateCoords({ lat, lng });
  }, [filteredLocations]);

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
    onSuccess: (updatedFields) => {
      queryClient.setQueryData<Location[]>(["locations", city], (old) => {
        if (!old || !reviewLocation) return old;
        return old.map((loc) =>
          loc.id === reviewLocation.id ? { ...loc, ...updatedFields } : loc
        );
      });

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

  // --- Create location ---
  const handleCreateLocation = async (data: {
    name: string;
    category: string;
    address: string;
    hours: string;
    description: string;
  }) => {
    if (!createCoords) return;
    if (createCoords.lat < -90 || createCoords.lat > 90 || createCoords.lng < -180 || createCoords.lng > 180) {
      toast.error("Invalid coordinates.");
      return;
    }

    const locationData = {
      name: data.name,
      category: data.category,
      address: data.address,
      neighborhood: "",
      city,
      coordinates: createCoords,
      hours: data.hours || "",
      description: data.description || "",
      isUserCreated: true,
      isPending: true,
      totalRatings: 0,
      ratingsByAgeGroup: {},
      divergenceScore: 0,
      divergenceFlagged: false,
      dominantEmoji: "📍",
      dominantWord: "New",
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "locations"), locationData);
      const newLoc: Location = {
        id: docRef.id,
        ...locationData,
        hours: data.hours || undefined,
        description: data.description || undefined,
      };

      queryClient.setQueryData<Location[]>(["locations", city], (old) =>
        old ? [...old, newLoc] : [newLoc]
      );

      setCreateCoords(null);
      toast.success(`${data.name} created! Check in now.`);
      setTimeout(() => setCheckinLocation(newLoc), 500);
    } catch (err) {
      console.error("Error creating location:", err);
      toast.error("Failed to create location. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <MapView
          locations={filteredLocations}
          center={cityCenter}
          zoom={cityConfig.zoom}
          ratedLocationIds={ratedLocationIds}
          onLocationClick={handleLocationClick}
          onMapClick={handleMapClick}
          onBoundsChange={setMapBounds}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-8 w-8 text-primary animate-spin" />
            <p className="text-foreground font-display font-semibold">Loading locations...</p>
            <p className="text-sm text-muted-foreground">Fetching data from Firebase</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 text-center max-w-sm">
            <p className="text-red-400 font-display font-semibold mb-2">Error loading locations</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display font-semibold hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1001] p-2 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-md rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-border">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="font-display font-bold text-foreground text-sm sm:text-lg">Manny Map</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1 sm:gap-2 bg-primary text-primary-foreground rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 font-display font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Profile
            </button>
            <CitySelector selectedCity={city} onCityChange={setCity} />
          </div>
        </div>

        <div className="flex justify-center">
          <LocationSearch
            locations={filteredLocations}
            ratedLocationIds={ratedLocationIds}
            onLocationSelect={(loc) => setSelectedLocation(loc)}
          />
        </div>

        <CategoryFilter
          activeCategories={activeCategories}
          onToggle={handleCategoryToggle}
          onToggleAll={handleCategoryToggleAll}
        />
      </div>

      {/* Location count badge */}
      {!loading && (
        <div className="absolute top-40 right-4 z-[999] bg-card/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border">
          <p className="text-sm font-display font-semibold text-foreground">
            {visibleLocations.length} of {filteredLocations.length} spots in view
          </p>
        </div>
      )}

      {/* Rated locations carousel */}
      {!loading && ratedLocations.length > 0 && (
        <div className="absolute bottom-[160px] left-0 right-0 z-[999] pb-2">
          <RatedCarousel
            locations={ratedLocations}
            activeIndex={safeRatedIndex}
            ratedLocationIds={ratedLocationIds}
            userGender={userGender}
            onLocationTap={(loc) => setSelectedLocation(loc)}
            onRate={handleLocationAction}
            onActiveChange={setRatedActiveIndex}
          />
        </div>
      )}

      {/* Location drawer at bottom */}
      {!loading && (
        <LocationDrawer
          locations={visibleLocations}
          userAgeGroup={userAgeGroup}
          userGender={userGender}
          ratedLocationIds={ratedLocationIds}
          activeCategories={activeCategories}
          onLocationTap={(loc) => setSelectedLocation(loc)}
          onAction={handleLocationAction}
        />
      )}

      {/* Modals */}
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

      {createCoords && (
        <CreateLocationModal
          lat={createCoords.lat}
          lng={createCoords.lng}
          onSubmit={handleCreateLocation}
          onClose={() => setCreateCoords(null)}
        />
      )}

      {showSignupPrompt && (
        <SignupPrompt
          onClose={() => {
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try { localStorage.setItem("mannymap_signup_prompt_seen", "true"); } catch {}
          }}
          onSignup={() => {
            toast.info("Signup feature coming soon!");
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try { localStorage.setItem("mannymap_signup_prompt_seen", "true"); } catch {}
          }}
          onSkip={() => {
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try { localStorage.setItem("mannymap_signup_prompt_seen", "true"); } catch {}
          }}
        />
      )}
    </div>
  );
};

export default Index;
