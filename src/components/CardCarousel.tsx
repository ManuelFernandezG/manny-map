import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LocationCard from "./LocationCard";
import type { Location } from "@/data/mockData";

interface CardCarouselProps {
  locations: Location[];
  activeIndex: number;
  userAgeGroup: string | null;
  onLocationTap: (location: Location) => void;
  onRate: (location: Location) => void;
  onActiveChange: (index: number) => void;
}

const CardCarousel = ({
  locations,
  activeIndex,
  userAgeGroup,
  onLocationTap,
  onRate,
  onActiveChange,
}: CardCarouselProps) => {
  const handlePrevious = () => {
    if (activeIndex > 0) {
      onActiveChange(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < locations.length - 1) {
      onActiveChange(activeIndex + 1);
    }
  };

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground font-display">No spots found in this area</p>
      </div>
    );
  }

  const currentLocation = locations[activeIndex];

  return (
    <div className="w-full space-y-4">
      {/* Show Only Current Card */}
      <div className="px-6">
        <LocationCard
          location={currentLocation}
          userAgeGroup={userAgeGroup}
          onTap={() => onLocationTap(currentLocation)}
          onRate={() => onRate(currentLocation)}
        />
      </div>

      {/* Controls: Buttons + Dots */}
      <div className="flex items-center justify-between px-6">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={activeIndex === 0}
          className="bg-lime-400 hover:bg-lime-500 disabled:bg-gray-400 disabled:cursor-not-allowed p-2 rounded-full transition"
          aria-label="Previous location"
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2">
          {locations.map((_, index) => (
            <button
              key={index}
              onClick={() => onActiveChange(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === activeIndex ? "bg-lime-400" : "bg-gray-600"
              }`}
              aria-label={`Go to location ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={activeIndex === locations.length - 1}
          className="bg-lime-400 hover:bg-lime-500 disabled:bg-gray-400 disabled:cursor-not-allowed p-2 rounded-full transition"
          aria-label="Next location"
        >
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Card Counter */}
      <div className="text-center text-sm text-gray-500">
        {activeIndex + 1} / {locations.length}
      </div>
    </div>
  );
};

export default CardCarousel;