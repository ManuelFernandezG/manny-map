import { useState, useCallback, useMemo } from "react";
import { Flame } from "lucide-react";
import MapView from "@/components/MapView";
import CardCarousel from "@/components/CardCarousel";
import CitySelector from "@/components/CitySelector";
import EmojiRatingModal from "@/components/EmojiRatingModal";
import LocationDetailModal from "@/components/LocationDetailModal";
import CreateLocationModal from "@/components/CreateLocationModal";
import { mockLocations, CITIES } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { toast } from "sonner";

const Index = () => {
  const [city, setCity] = useState("Ottawa");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [ratingLocation, setRatingLocation] = useState<Location | null>(null);
  const [createCoords, setCreateCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locations, setLocations] = useState(mockLocations);

  // Stored age from localStorage
  const [userAgeGroup, setUserAgeGroup] = useState<string | null>(() => {
    try {
      return localStorage.getItem("poppin_age_group");
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

  const handleRatingSubmit = (
    emojiWords: { emoji: string; word: string }[],
    ageGroup: string
  ) => {
    // Store age
    setUserAgeGroup(ageGroup);
    try {
      localStorage.setItem("poppin_age_group", ageGroup);
    } catch {}

    toast.success("Rating saved! Swipe to continue.", {
      duration: 3000,
    });

    setTimeout(() => {
      setRatingLocation(null);
    }, 1500);
  };

  const handleCreateLocation = (data: {
    name: string;
    category: string;
    address: string;
    hours: string;
    description: string;
  }) => {
    if (!createCoords) return;
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      name: data.name,
      category: data.category,
      address: data.address,
      neighborhood: "",
      city,
      coordinates: createCoords,
      hours: data.hours || undefined,
      description: data.description || undefined,
      isUserCreated: true,
      isPending: true,
      totalRatings: 0,
      ratingsByAgeGroup: {},
      divergenceScore: 0,
      divergenceFlagged: false,
      dominantEmoji: "📍",
      dominantWord: "New",
    };
    setLocations([...locations, newLoc]);
    setCreateCoords(null);
    toast.success(`${data.name} created! Rate it now.`);
    setTimeout(() => setRatingLocation(newLoc), 500);
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

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-foreground text-lg">poppin'</span>
          </div>
        </div>
        <CitySelector selectedCity={city} onCityChange={setCity} />
      </div>

      {/* Card carousel at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] pb-6 pt-2">
        <CardCarousel
          locations={filteredLocations}
          activeIndex={activeIndex}
          userAgeGroup={userAgeGroup}
          onLocationTap={(loc) => setSelectedLocation(loc)}
          onRate={(loc) => setRatingLocation(loc)}
          onActiveChange={setActiveIndex}
        />
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
    </div>
  );
};

export default Index;
