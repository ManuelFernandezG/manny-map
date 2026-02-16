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
    <div className="w-full max-w-md px-3 pointer-events-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onActiveChange(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="bg-[#2D5F2D] hover:bg-[#3A7A4A] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed p-1.5 rounded-full transition flex-shrink-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          className="flex-1 min-w-0 flex items-center gap-3 bg-white border border-[#E0E0E0] px-4 py-3 card-shadow text-left transition hover:bg-[#FAFAFA]"
          onClick={() => onLocationTap(loc)}
        >
          <span className="text-3xl flex-shrink-0">{userEmoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-['Inter'] text-sm font-medium text-black truncate">{loc.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] max-[320px]:text-[8px] font-medium ${categoryClass}`}>
                {loc.category}
              </span>
              <span className="text-[10px] max-[320px]:text-[8px] text-[#888888]">
                {loc.totalRatings} ratings
              </span>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRate(loc); }}
            className="px-3 py-1.5 bg-[#2D5F2D] text-white font-['Inter'] text-xs font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            {getActionLabel(loc.id, ratedLocationIds, userGender)}
          </button>
        </button>

        <button
          onClick={() => onActiveChange(activeIndex + 1)}
          disabled={activeIndex === locations.length - 1}
          className="bg-[#2D5F2D] hover:bg-[#3A7A4A] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed p-1.5 rounded-full transition flex-shrink-0"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {locations.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => onActiveChange(i)}
              className={`w-1.5 h-1.5 rounded-full transition ${
                i === activeIndex ? "bg-[#2D5F2D]" : "bg-[#CCCCCC]"
              }`}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
          <span className="text-[10px] max-[320px]:text-[8px] text-[#888888] ml-1">
            {activeIndex + 1}/{locations.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default RatedCarousel;
