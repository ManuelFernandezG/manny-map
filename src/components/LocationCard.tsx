import { AlertTriangle } from "lucide-react";
import type { Location } from "@/data/mockData";
import { CATEGORY_COLORS } from "@/data/mockData";

interface LocationCardProps {
  location: Location;
  userAgeGroup: string | null;
  onTap: () => void;
  onRate: () => void;
}

const LocationCard = ({ location, userAgeGroup, onTap, onRate }: LocationCardProps) => {
  const userGroup = userAgeGroup && location.ratingsByAgeGroup?.[userAgeGroup];
  const otherGroupKey = location.ratingsByAgeGroup ? Object.keys(location.ratingsByAgeGroup).find(
    (k) => k !== userAgeGroup && location.ratingsByAgeGroup[k]?.totalRatings > 20
  ) : null;
  const otherGroup = otherGroupKey && location.ratingsByAgeGroup ? location.ratingsByAgeGroup[otherGroupKey] : null;

  const categoryClass = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Other"];

  return (
    <div
      className="flex-shrink-0 w-[calc(100vw-48px)] sm:w-[340px] rounded-xl bg-card border border-border p-5 card-shadow cursor-pointer select-none transition-transform duration-200 hover:scale-[1.01]"
      onClick={onTap}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-lg text-foreground truncate">{location.name}</h3>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
            {location.category}
          </span>
        </div>
        {location.isPending && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">
            Pending
          </span>
        )}
      </div>

      {/* Dominant rating */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{userGroup?.dominant?.emoji || location.dominantEmoji}</span>
        <div>
          <p className="font-display font-bold text-xl text-foreground">
            {userGroup?.dominant?.word || location.dominantWord}
          </p>
          {userAgeGroup && (
            <p className="text-xs text-muted-foreground">{userAgeGroup} crowd</p>
          )}
        </div>
      </div>

      {/* Other age group comparison */}
      {otherGroup && otherGroupKey && (
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <span>vs</span>
          <span className="text-lg">{otherGroup.dominant.emoji}</span>
          <span>{otherGroup.dominant.word}</span>
          <span className="text-xs">({otherGroupKey})</span>
        </div>
      )}

      {/* Divergence warning */}
      {location.divergenceFlagged && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
          <p className="text-xs text-warning">
            Age groups disagree on this spot
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground">{location.totalRatings} ratings</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRate();
          }}
          className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity glow-lime-sm"
        >
          Rate
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
