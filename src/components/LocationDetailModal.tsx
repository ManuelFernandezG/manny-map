import { useEffect, useState } from "react";
import { X, MapPin, Clock, Star } from "lucide-react";
import type { Location } from "@/data/mockData";
import { CATEGORY_COLORS, AGE_GROUPS } from "@/data/mockData";
import type { LocationStats } from "@/lib/ratings";
import { GOOGLE_DATA } from "@/data/googleData";

interface LocationDetailModalProps {
  location: Location;
  userAgeGroup: string | null;
  onClose: () => void;
  onRate: () => void;
}

const LocationDetailModal = ({ location, userAgeGroup, onClose, onRate }: LocationDetailModalProps) => {
  const categoryClass = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Bar"];
  const google = GOOGLE_DATA[location.id] ?? null;
  const [stats, setStats] = useState<LocationStats | null>(null);

  useEffect(() => {
    import("@/lib/ratings").then(({ getLocationStats }) => {
      getLocationStats(location.id).then(setStats);
    });
  }, [location.id]);

  const total = stats ? stats.checkinCount : 0;

  // Tonight-aware display values
  const tonightCount = stats?.checkinCountTonight ?? 0;
  const hasTonight = tonightCount > 0;
  const displayCount = hasTonight ? tonightCount : total;
  const displayVibe = hasTonight
    ? (stats?.dominantVibeTonight || stats?.dominantVibe)
    : stats?.dominantVibe;
  const displayMale = hasTonight ? (stats?.maleCountTonight ?? stats?.maleCount ?? 0) : (stats?.maleCount ?? 0);
  const displayFemale = hasTonight ? (stats?.femaleCountTonight ?? stats?.femaleCount ?? 0) : (stats?.femaleCount ?? 0);
  const displayLabel = hasTonight ? "TONIGHT" : "THIS WEEK";
  const historyCount = hasTonight ? total - tonightCount : 0;

  const genderTotal = displayMale + displayFemale;
  const malePercent = genderTotal > 0 ? Math.round((displayMale / genderTotal) * 100) : null;
  const femalePercent = genderTotal > 0 ? 100 - malePercent! : null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[480px] max-h-[90vh] overflow-y-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl card-shadow animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md z-10 p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl text-foreground">{location.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
                  {location.category}
                </span>
                {google && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{google.googleRating}</span>
                    <span>· {google.googleReviewCount.toLocaleString()} Google Reviews</span>
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Location info */}
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

          {/* Live stats — only shown at 10+ checkins */}
          {total >= 10 && (
            <div className="rounded-xl bg-surface border border-border p-4 space-y-4">
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wide">{displayLabel}</p>

              {/* Headline: checkin count + vibe */}
              <div className="flex items-center gap-3">
                {displayVibe && (
                  <span className="text-3xl">{displayVibe}</span>
                )}
                <div>
                  <p className="font-display font-bold text-2xl text-foreground">{displayCount}</p>
                  <p className="text-xs text-muted-foreground">interested</p>
                  {hasTonight && historyCount > 0 && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">+{historyCount} from last week</p>
                  )}
                </div>
              </div>

              {/* Gender ratio */}
              {malePercent !== null && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{malePercent}% M</span>
                    <span>{femalePercent}% F</span>
                  </div>
                  <div className="h-2 rounded-full bg-border overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${malePercent}%` }}
                    />
                    <div
                      className="h-full bg-pink-400 transition-all duration-500"
                      style={{ width: `${femalePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Age breakdown — only shown at 10+ checkins */}
          {stats?.ratingsByAgeGroup && total >= 10 && (
            <div>
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Age Breakdown</h3>
              <div className="space-y-2">
                {AGE_GROUPS.map((ag) => {
                  const group = stats.ratingsByAgeGroup?.[ag];
                  if (!group || group.count === 0) return null;
                  return (
                    <div key={ag} className={`flex items-center gap-3 ${ag === userAgeGroup ? "opacity-100" : "opacity-80"}`}>
                      <span className={`text-xs font-display font-semibold w-12 text-right ${ag === userAgeGroup ? "text-primary" : "text-muted-foreground"}`}>
                        {ag}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${ag === userAgeGroup ? "bg-primary" : "bg-primary/50"}`}
                          style={{ width: `${group.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{group.percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={onRate}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity"
          >
            I'm Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailModal;
