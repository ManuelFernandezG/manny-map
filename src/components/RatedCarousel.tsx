import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_COLORS, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import type { RatedEntry } from "@/lib/userId";

interface RatedCarouselProps {
  locations: Location[];
  activeIndex: number;
  ratedLocationIds: Map<string, RatedEntry>;
  userGender: string | null;
  onLocationTap: (location: Location) => void;
  onRate: (location: Location) => void;
  onActiveChange: (index: number) => void;
}

function getActionLabel(locId: string, ratedLocationIds: Map<string, RatedEntry>, userGender: string | null): string {
  const entry = ratedLocationIds.get(locId);
  const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  if (entry?.phase === "checkin") return labels?.phase2 || "Review";
  if (entry?.phase === "reviewed") return labels?.phase2 || "Re-rate";
  return labels?.phase1 || "Check In";
}

const RatedCarousel = ({
  locations,
  activeIndex,
  ratedLocationIds,
  userGender,
  onLocationTap,
  onRate,
  onActiveChange,
}: RatedCarouselProps) => {
  if (locations.length === 0) return null;

  const loc = locations[activeIndex];
  const userEmoji = ratedLocationIds.get(loc.id)?.emoji || loc.dominantEmoji;
  const categoryClass = CATEGORY_COLORS[loc.category] || CATEGORY_COLORS["Other"];

  return (
    <div className="w-full px-3 sm:px-6">
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          onClick={() => onActiveChange(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="bg-lime-400 hover:bg-lime-500 disabled:bg-gray-600 disabled:cursor-not-allowed p-1.5 rounded-full transition flex-shrink-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-black" />
        </button>

        {/* Card */}
        <button
          className="flex-1 min-w-0 flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 card-shadow text-left transition hover:scale-[1.01]"
          onClick={() => onLocationTap(loc)}
        >
          <span className="text-3xl flex-shrink-0">{userEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-foreground truncate">{loc.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryClass}`}>
                {loc.category}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {loc.totalRatings} ratings
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRate(loc);
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-xs hover:opacity-90 transition-opacity glow-lime-sm flex-shrink-0"
          >
            {getActionLabel(loc.id, ratedLocationIds, userGender)}
          </button>
        </button>

        {/* Next */}
        <button
          onClick={() => onActiveChange(activeIndex + 1)}
          disabled={activeIndex === locations.length - 1}
          className="bg-lime-400 hover:bg-lime-500 disabled:bg-gray-600 disabled:cursor-not-allowed p-1.5 rounded-full transition flex-shrink-0"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Dots + counter */}
      {locations.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => onActiveChange(i)}
              className={`w-1.5 h-1.5 rounded-full transition ${
                i === activeIndex ? "bg-lime-400" : "bg-gray-600"
              }`}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">
            {activeIndex + 1}/{locations.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default RatedCarousel;
