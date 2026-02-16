import { X, AlertTriangle, MapPin, Clock } from "lucide-react";
import type { Location } from "@/data/mockData";
import { CATEGORY_COLORS, AGE_GROUPS } from "@/data/mockData";

interface LocationDetailModalProps {
  location: Location;
  userAgeGroup: string | null;
  onClose: () => void;
  onRate: () => void;
}

const LocationDetailModal = ({ location, userAgeGroup, onClose, onRate }: LocationDetailModalProps) => {
  const categoryClass = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Other"];

  const emojiCounts: Record<string, { emoji: string; word: string; count: number }> = {};
  if (location.ratingsByAgeGroup && typeof location.ratingsByAgeGroup === 'object') {
    Object.values(location.ratingsByAgeGroup).forEach((group) => {
      if (group?.topPairs && Array.isArray(group.topPairs)) {
        group.topPairs.forEach((pair) => {
          if (pair?.emoji && pair?.word) {
            const key = `${pair.emoji}${pair.word}`;
            if (!emojiCounts[key]) emojiCounts[key] = { ...pair, count: 0 };
            emojiCounts[key].count += pair.count;
          }
        });
      }
    });
  }
  const sortedEmojis = Object.values(emojiCounts).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCount = sortedEmojis[0]?.count || 1;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[560px] max-h-[90vh] overflow-y-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl card-shadow animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md z-10 p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl text-foreground">{location.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
                  {location.category}
                </span>
                <span className="text-sm max-[320px]:text-xs text-muted-foreground">{location.totalRatings} ratings</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-2">
            {location.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{location.address}, {location.neighborhood}</span>
              </div>
            )}
            {location.hours && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{location.hours}</span>
              </div>
            )}
            {location.description && (
              <p className="text-sm text-secondary-foreground mt-2">{location.description}</p>
            )}
          </div>

          {location.divergenceFlagged && (
            <div className="flex items-start gap-3 rounded-xl bg-warning/10 border border-warning/20 px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-display font-semibold text-warning">Age groups disagree</p>
                <p className="text-xs text-warning/70 mt-0.5">
                  Different age groups have different vibes about this spot
                </p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Overall Vibe</h3>
            <div className="space-y-2">
              {sortedEmojis.map((item) => (
                <div key={`${item.emoji}${item.word}`} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground w-24 truncate">{item.word}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs max-[320px]:text-[10px] text-muted-foreground w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">By Age Group</h3>
            <div className="grid grid-cols-2 gap-3">
              {AGE_GROUPS.map((ag) => {
                const group = location.ratingsByAgeGroup[ag];
                if (!group || group.totalRatings === 0) return null;
                return (
                  <div
                    key={ag}
                    className={`rounded-xl p-3.5 border transition-colors ${
                      ag === userAgeGroup
                        ? "bg-primary/5 border-primary/30"
                        : "bg-surface border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs max-[320px]:text-[10px] font-display font-semibold text-muted-foreground">{ag}</span>
                      <span className="text-xs max-[320px]:text-[10px] text-muted-foreground">{group.totalRatings}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{group.dominant.emoji}</span>
                      <span className="font-display font-bold text-foreground">{group.dominant.word}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {group.topPairs.slice(1, 3).map((pair) => (
                        <span
                          key={`${pair.emoji}${pair.word}`}
                          className="text-xs text-muted-foreground bg-surface-hover rounded px-1.5 py-0.5"
                        >
                          {pair.emoji} {pair.word}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onRate}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity"
          >
            Rate this spot
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;
