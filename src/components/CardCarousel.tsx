import { useRef, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    if (children[activeIndex]) {
      (children[activeIndex] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 340;
    const gap = 16;
    const newIndex = Math.round(scrollLeft / (cardWidth + gap));
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < locations.length) {
      onActiveChange(newIndex);
    }
  };

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground font-display">No spots found in this area</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {locations.map((loc, i) => (
        <div key={loc.id} className="snap-center flex-shrink-0">
          <LocationCard
            location={loc}
            userAgeGroup={userAgeGroup}
            onTap={() => onLocationTap(loc)}
            onRate={() => onRate(loc)}
          />
        </div>
      ))}
    </div>
  );
};

export default CardCarousel;
