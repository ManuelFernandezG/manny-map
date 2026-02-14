import { useState, useCallback, useMemo } from "react";
import { Flame, Loader, UserPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import MapView from "@/components/MapView";
import CardCarousel from "@/components/CardCarousel";
import CitySelector from "@/components/CitySelector";
import LocationSearch from "@/components/LocationSearch";
import EmojiRatingModal from "@/components/EmojiRatingModal";
import LocationDetailModal from "@/components/LocationDetailModal";
import CreateLocationModal from "@/components/CreateLocationModal";
import SignupPrompt from "@/components/SignupPrompt";
import { CITIES } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useLocations";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Index = () => {
  const [city, setCity] = useState("Ottawa");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [ratingLocation, setRatingLocation] = useState<Location | null>(null);
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

  // Fetch real locations from Firebase (cached per city by React Query)
  const { locations, loading, error } = useLocations({ city });

  // Stored age from localStorage
  const [userAgeGroup, setUserAgeGroup] = useState<string | null>(() => {
    try {
      return localStorage.getItem("mannymap_age_group");
    } catch {
      return null;
    }
  });

  const cityConfig = CITIES[city];
  const filteredLocations = useMemo(
    () => locations.filter((l) => l.city === city),
    [locations, city]
  );

  const handleLocationClick = useCallback(
    (loc: Location) => {
      const idx = filteredLocations.findIndex((l) => l.id === loc.id);
      if (idx >= 0) setActiveIndex(idx);
    },
    [filteredLocations]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      // Check if click is near an existing location
      const nearby = filteredLocations.some(
        (l) =>
          Math.abs(l.coordinates.lat - lat) < 0.001 &&
          Math.abs(l.coordinates.lng - lng) < 0.001
      );
      if (!nearby) {
        setCreateCoords({ lat, lng });
      }
    },
    [filteredLocations]
  );

  const ratingMutation = useMutation({
    mutationFn: async ({ locationId, emojiWords, ageGroup }: {
      locationId: string;
      emojiWords: { emoji: string; word: string }[];
      ageGroup: string;
    }) => {
      const { submitRating } = await import("@/lib/ratings");
      return submitRating(locationId, emojiWords, ageGroup);
    },
    onSuccess: (updatedFields, { ageGroup }) => {
      // Patch only the rated location in the cache (no full refetch)
      queryClient.setQueryData<Location[]>(["locations", city], (old) => {
        if (!old || !ratingLocation) return old;
        return old.map((loc) =>
          loc.id === ratingLocation.id ? { ...loc, ...updatedFields } : loc
        );
      });

      setUserAgeGroup(ageGroup);
      localStorage.setItem("mannymap_age_group", ageGroup);

      import("@/lib/userId").then(({ incrementRatingCount }) => {
        const newCount = incrementRatingCount();
        console.log(`✅ User has submitted ${newCount} ratings`);
        if (newCount === 3 && !hasSeenSignupPrompt) {
          setTimeout(() => setShowSignupPrompt(true), 2000);
        }
      });

      toast.success("Rating saved! Swipe to continue.", { duration: 3000 });
      setTimeout(() => setRatingLocation(null), 1500);
    },
    onError: (error) => {
      console.error("❌ Error submitting rating:", error);
      toast.error("Failed to save rating. Please try again.");
    },
  });

  const handleRatingSubmit = (
    emojiWords: { emoji: string; word: string }[],
    ageGroup: string
  ) => {
    if (!ratingLocation) return;
    ratingMutation.mutate({
      locationId: ratingLocation.id,
      emojiWords,
      ageGroup,
    });
  };

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

      // Add to React Query cache (no separate state needed)
      queryClient.setQueryData<Location[]>(["locations", city], (old) =>
        old ? [...old, newLoc] : [newLoc]
      );

      setCreateCoords(null);
      toast.success(`${data.name} created! Rate it now.`);
      setTimeout(() => setRatingLocation(newLoc), 500);
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <MapView
          locations={filteredLocations}
          center={[cityConfig.lat, cityConfig.lng]}
          zoom={cityConfig.zoom}
          onLocationClick={handleLocationClick}
          onMapClick={handleMapClick}
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
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground text-lg">Manny Map</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSignupPrompt(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-3 py-2 font-display font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
            <CitySelector selectedCity={city} onCityChange={setCity} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <LocationSearch
            locations={filteredLocations}
            onLocationSelect={(loc) => {
              setSelectedLocation(loc);
              const idx = filteredLocations.findIndex((l) => l.id === loc.id);
              if (idx >= 0) setActiveIndex(idx);
            }}
          />
        </div>
      </div>

      {/* Location count badge */}
      {!loading && (
        <div className="absolute top-32 right-4 z-[999] bg-card/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border">
          <p className="text-sm font-display font-semibold text-foreground">
            {filteredLocations.length} spots
          </p>
        </div>
      )}

      {/* Card carousel at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] pb-6 pt-2">
        {filteredLocations.length > 0 ? (
          <CardCarousel
            locations={filteredLocations}
            activeIndex={activeIndex}
            userAgeGroup={userAgeGroup}
            onLocationTap={(loc) => setSelectedLocation(loc)}
            onRate={(loc) => setRatingLocation(loc)}
            onActiveChange={setActiveIndex}
          />
        ) : (
          !loading && (
            <div className="px-6 py-8 text-center">
              <p className="text-muted-foreground font-display">No locations in this city yet</p>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          userAgeGroup={userAgeGroup}
          onClose={() => setSelectedLocation(null)}
          onRate={() => {
            setRatingLocation(selectedLocation);
            setSelectedLocation(null);
          }}
        />
      )}

      {ratingLocation && (
        <EmojiRatingModal
          location={ratingLocation}
          userAgeGroup={userAgeGroup}
          onSubmit={handleRatingSubmit}
          onClose={() => setRatingLocation(null)}
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

      {/* Signup Prompt */}
      {showSignupPrompt && (
        <SignupPrompt
          onClose={() => {
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try {
              localStorage.setItem("mannymap_signup_prompt_seen", "true");
            } catch {}
          }}
          onSignup={() => {
            toast.info("Signup feature coming soon!");
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try {
              localStorage.setItem("mannymap_signup_prompt_seen", "true");
            } catch {}
          }}
          onSkip={() => {
            setShowSignupPrompt(false);
            setHasSeenSignupPrompt(true);
            try {
              localStorage.setItem("mannymap_signup_prompt_seen", "true");
            } catch {}
          }}
        />
      )}
    </div>
  );
};

export default Index;
