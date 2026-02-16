import { useState } from "react";
import { X, Check } from "lucide-react";
import {
  CATEGORY_GROUPS,
  REVIEW_CONFIG,
  CATEGORY_COLORS,
  PHASE_LABELS,
} from "@/data/mockData";
import type { Location, CategoryGroup, ReviewEmoji } from "@/data/mockData";
import type { ReviewData, ReviewScore } from "@/lib/ratings";

interface ReviewModalProps {
  location: Location;
  userGender: string | null;
  onSubmit: (data: ReviewData) => void;
  onClose: () => void;
}

const ReviewModal = ({
  location,
  userGender,
  onSubmit,
  onClose,
}: ReviewModalProps) => {
  const group: CategoryGroup = CATEGORY_GROUPS[location.category] || "nightlife";
  const dimensions = REVIEW_CONFIG[group];
  const genderLabel = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  const phase2Label = genderLabel?.phase2 || "Review";

  const [selections, setSelections] = useState<Record<string, ReviewEmoji | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const allDimensionsFilled = dimensions.every((dim) => selections[dim.key]);
  const categoryColor = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Bar"];

  const handleSelect = (dimKey: string, emoji: ReviewEmoji) => {
    setSelections((prev) => ({
      ...prev,
      [dimKey]: prev[dimKey]?.emoji === emoji.emoji ? null : emoji,
    }));
  };

  const handleSubmit = () => {
    if (!allDimensionsFilled) return;
    setSubmitted(true);

    const review: ReviewData = {};
    for (const dim of dimensions) {
      const sel = selections[dim.key];
      if (sel) {
        const score: ReviewScore = { emoji: sel.emoji, word: sel.word, score: sel.score };
        (review as any)[dim.key] = score;
      }
    }

    setTimeout(() => onSubmit(review), 1200);
  };

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
              {phase2Label} saved!
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              This helps others discover great spots on Manny Map.
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
                <p className="text-sm text-muted-foreground">How was it?</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="px-5 py-6 space-y-6">
              {/* Emoji dimensions */}
              {dimensions.map((dim) => (
                <div key={dim.key}>
                  {dimensions.length > 1 && (
                    <p className="text-sm font-display font-semibold text-foreground mb-3">
                      {dim.label}
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-3">
                    {dim.emojis.map((e) => {
                      const isSelected = selections[dim.key]?.emoji === e.emoji;
                      return (
                        <button
                          key={e.emoji}
                          onClick={() => handleSelect(dim.key, e)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150 ${
                            isSelected
                              ? "bg-primary/15 border-2 border-primary scale-105"
                              : "bg-surface hover:bg-surface-hover border-2 border-transparent hover:scale-105"
                          }`}
                        >
                          <span className="text-3xl sm:text-4xl">{e.emoji}</span>
                          <span
                            className={`text-xs font-medium ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {e.word}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!allDimensionsFilled}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              >
                Submit {phase2Label}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
