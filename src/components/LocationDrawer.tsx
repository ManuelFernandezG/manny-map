import { useState, useMemo } from "react";
import { MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { CATEGORY_COLORS, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import type { RatedEntry } from "@/lib/userId";
import { groupByCategory } from "@/lib/groupByCategory";

interface LocationDrawerProps {
  locations: Location[];
  userAgeGroup: string | null;
  userGender: string | null;
  ratedLocationIds: Map<string, RatedEntry>;
  activeCategories: Set<string>;
  onLocationTap: (location: Location) => void;
  onAction: (location: Location) => void;
}

function getActionLabel(locId: string, ratedLocationIds: Map<string, RatedEntry>, userGender: string | null): string {
  const entry = ratedLocationIds.get(locId);
  const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  if (entry?.phase === "checkin") return labels?.phase2 || "Review";
  if (entry?.phase === "reviewed") return labels?.phase2 || "Re-rate";
  return labels?.phase1 || "Check In";
}

const LocationDrawer = ({
  locations,
  userAgeGroup,
  userGender,
  ratedLocationIds,
  activeCategories,
  onLocationTap,
  onAction,
}: LocationDrawerProps) => {
  const [expanded, setExpanded] = useState(false);
  const topLocation = locations[0] ?? null;
  const groups = useMemo(() => groupByCategory(locations, activeCategories), [locations, activeCategories]);

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-[1000] flex flex-col">
      {/* Handle + header */}
      <div
        className="bg-card/95 backdrop-blur-md border-t border-border px-5 pt-2 pb-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-base font-bold">
              {locations.length} spot{locations.length !== 1 ? "s" : ""} in view
            </span>
          </div>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Collapsed preview */}
        {!expanded && topLocation && (
          <button
            className="flex items-center gap-3 mt-2 w-full text-left rounded-lg bg-background/60 border border-border px-4 py-3 transition hover:bg-background/80"
            onClick={(e) => { e.stopPropagation(); onLocationTap(topLocation); }}
          >
            <span className="text-3xl">{ratedLocationIds.get(topLocation.id)?.emoji || topLocation.dominantEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-foreground truncate">
                {topLocation.name}
              </p>
              <p className="text-xs max-[320px]:text-[10px] text-muted-foreground">
                {topLocation.category} &middot; {topLocation.totalRatings} ratings
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onAction(topLocation); }}
              className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              {getActionLabel(topLocation.id, ratedLocationIds, userGender)}
            </button>
          </button>
        )}
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="bg-card/95 backdrop-blur-md border-t border-border px-4 pb-6 overflow-y-auto max-h-[50vh] space-y-4">
          {locations.length === 0 ? (
            <p className="text-center text-muted-foreground font-display py-8">
              No spots found in this area
            </p>
          ) : (
            groups.map((group) => {
              const groupCategoryClass =
                CATEGORY_COLORS[group.category] || CATEGORY_COLORS["Other"];
              return (
                <div key={group.category} className={group.isPriority ? "" : "opacity-50"}>
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${groupCategoryClass}`}>
                      {group.category}
                    </span>
                    <span className="text-xs max-[320px]:text-[10px] text-muted-foreground">
                      {group.locations.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.locations.map((loc) => {
                      const userGroup =
                        userAgeGroup && loc.ratingsByAgeGroup?.[userAgeGroup];
                      return (
                        <button
                          key={loc.id}
                          className="flex items-center gap-3 w-full text-left rounded-xl bg-background/60 border border-border px-4 py-3 transition hover:bg-background/80"
                          onClick={() => onLocationTap(loc)}
                        >
                          <span className="text-2xl flex-shrink-0">
                            {ratedLocationIds.get(loc.id)?.emoji || userGroup?.dominant?.emoji || loc.dominantEmoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-foreground truncate">
                              {loc.name}
                            </p>
                            <span className="text-[10px] max-[320px]:text-[8px] text-muted-foreground">
                              {loc.totalRatings} ratings
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); onAction(loc); }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-xs hover:opacity-90 transition-opacity flex-shrink-0"
                          >
                            {getActionLabel(loc.id, ratedLocationIds, userGender)}
                          </button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LocationDrawer;
