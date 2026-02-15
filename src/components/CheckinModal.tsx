import { useState, useEffect } from "react";
import { X, Check, TrendingUp } from "lucide-react";
import {
  AGE_GROUPS,
  GENDERS,
  TRAVEL_TIME_OPTIONS,
  GROUP_SIZE_OPTIONS,
  COMPANION_OPTIONS,
  CATEGORY_COLORS,
  PHASE_LABELS,
} from "@/data/mockData";
import type { Location } from "@/data/mockData";
import type { CheckinData } from "@/lib/ratings";
import type { RecentTrends } from "@/lib/ratings";

interface CheckinModalProps {
  location: Location;
  userAgeGroup: string | null;
  userGender: string | null;
  onSubmit: (data: CheckinData) => void;
  onClose: () => void;
}

const CheckinModal = ({
  location,
  userAgeGroup,
  userGender,
  onSubmit,
  onClose,
}: CheckinModalProps) => {
  const genderLabel = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  const phase1Label = genderLabel?.phase1 || "Check In";

  const [ageGroup, setAgeGroup] = useState(userAgeGroup || "");
  const [gender, setGender] = useState(userGender || "");
  const [travelTime, setTravelTime] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [companion, setCompanion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trends, setTrends] = useState<RecentTrends | null>(null);

  const needsAgeGate = !userAgeGroup;
  const needsGenderGate = !userGender;
  const isSolo = groupSize === "Solo";

  // Fetch recent trends
  useEffect(() => {
    import("@/lib/ratings").then(({ getRecentTrends }) => {
      getRecentTrends(location.id).then(setTrends);
    });
  }, [location.id]);

  const canSubmit = ageGroup && gender && travelTime && groupSize && (isSolo || companion);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit({
        ageGroup,
        gender,
        travelTime,
        groupSize,
        ...(!isSolo && { companion }),
      });
    }, 1200);
  };

  const categoryColor = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Bar"];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[420px] max-h-[90vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden card-shadow animate-slide-up">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 animate-scale-in">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              {gender === "Female" ? "Locked in!" : "You're set!"}
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {gender === "Female"
                ? "Debrief after your visit."
                : "Come back for afters."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    {location.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColor}`}>
                    {location.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{phase1Label}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-5 py-5 space-y-5">
              {/* Recent trends */}
              {trends && trends.ratingCount > 0 && (
                <div className="rounded-lg bg-surface border border-border px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-display font-semibold text-foreground">This week</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {trends.dominantEmoji && (
                      <span className="text-lg">{trends.dominantEmoji}</span>
                    )}
                    {trends.avgScore > 0 && (
                      <span>{trends.avgScore}/4 avg</span>
                    )}
                    <span>{trends.ratingCount} visits</span>
                    {trends.topCompanion && (
                      <span>Most go with {trends.topCompanion}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Demographics gate */}
              {(needsAgeGate || needsGenderGate) && (
                <div className="space-y-4">
                  {needsAgeGate && (
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground mb-2">Age</p>
                      <div className="flex gap-2">
                        {AGE_GROUPS.map((ag) => (
                          <button
                            key={ag}
                            onClick={() => setAgeGroup(ag)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              ageGroup === ag
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {ag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {needsGenderGate && (
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground mb-2">Gender</p>
                      <div className="flex gap-2">
                        {GENDERS.map((g) => (
                          <button
                            key={g}
                            onClick={() => setGender(g)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              gender === g
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Travel time */}
              <div>
                <p className="text-sm font-display font-semibold text-foreground mb-2">Travel time</p>
                <div className="flex gap-2">
                  {TRAVEL_TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTravelTime(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        travelTime === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group size */}
              <div>
                <p className="text-sm font-display font-semibold text-foreground mb-2">Group size</p>
                <div className="flex gap-2">
                  {GROUP_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setGroupSize(opt);
                        if (opt === "Solo") setCompanion("");
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        groupSize === opt
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Who with (hidden when Solo) */}
              {groupSize && !isSolo && (
                <div>
                  <p className="text-sm font-display font-semibold text-foreground mb-2">Who with</p>
                  <div className="flex gap-2">
                    {COMPANION_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCompanion(opt)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          companion === opt
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 glow-lime"
              >
                {phase1Label}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckinModal;
