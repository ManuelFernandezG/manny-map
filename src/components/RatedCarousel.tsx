import { PHASE_LABELS } from "@/data/mockData";
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
  if (entry?.phase === "checkin") return labels?.phase2 || "Debrief";
  if (entry?.phase === "reviewed") return labels?.phase2 || "Debrief";
  return labels?.phase1 || "Plans";
}

function isDebriefPhase(locId: string, ratedLocationIds: Map<string, RatedEntry>): boolean {
  const entry = ratedLocationIds.get(locId);
  return entry?.phase === "checkin" || entry?.phase === "reviewed";
}

function getVibeTag(loc: Location): string {
  const femaleCount = loc.ratingsByGender?.["Female"]?.totalRatings ?? 0;
  const maleCount = loc.ratingsByGender?.["Male"]?.totalRatings ?? 0;
  const total = femaleCount + maleCount;
  const femaleRatio = total > 0 ? Math.round((femaleCount / total) * 100) : null;
  const base = `${loc.dominantEmoji} ${loc.dominantWord}`;
  return femaleRatio !== null ? `${base} · ${femaleRatio}% F` : base;
}

const RatedCarousel = ({
  locations,
  ratedLocationIds,
  userGender,
  onLocationTap,
  onRate,
}: RatedCarouselProps) => {
  if (locations.length === 0) return null;

  return (
    <div className="w-full pointer-events-auto overflow-x-auto no-scrollbar">
      <div className="flex gap-2.5 px-4 pb-1">
        {locations.map((loc) => {
          const label = getActionLabel(loc.id, ratedLocationIds, userGender);
          const debrief = isDebriefPhase(loc.id, ratedLocationIds);
          const vibeTag = getVibeTag(loc);

          return (
            <button
              key={loc.id}
              onClick={() => onLocationTap(loc)}
              className="shrink-0 w-[180px] h-[84px] rounded-md bg-[#1A3A2A] dark:bg-[#1A3A2A] flex flex-col justify-between p-[10px_12px] text-left transition-opacity hover:opacity-90"
            >
              <div className="flex flex-col gap-1 min-w-0 w-full">
                <p className="font-['DM_Sans'] text-[13px] font-semibold text-[#FEFEFB] truncate leading-tight">
                  {loc.name}
                </p>
                <p className="font-['DM_Sans'] text-[11px] text-[#8FBF8F] leading-tight truncate">
                  {vibeTag}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRate(loc); }}
                className={`self-start h-6 px-2.5 rounded font-['DM_Sans'] text-[11px] font-medium transition-opacity hover:opacity-90 ${
                  debrief
                    ? "bg-[#8B5E00] text-[#FFD580]"
                    : "bg-[#2D5F2D] text-[#FEFEFB]"
                }`}
              >
                {label}
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatedCarousel;
