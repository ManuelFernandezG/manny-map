import { useState } from "react";
import { X, Plus } from "lucide-react";
import {
  CATEGORY_GROUPS,
  REVIEW_CONFIG,
  CATEGORY_COLORS,
  AGE_GROUPS,
  GENDERS,
} from "@/data/mockData";
import type { Location, CategoryGroup, ReviewEmoji } from "@/data/mockData";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface ReviewImportModalProps {
  location: Location;
  onClose: () => void;
  onImported: () => void;
}

const ReviewImportModal = ({ location, onClose, onImported }: ReviewImportModalProps) => {
  const group: CategoryGroup = CATEGORY_GROUPS[location.category] || "nightlife";
  const dimensions = REVIEW_CONFIG[group];
  const categoryColor = CATEGORY_COLORS[location.category] || CATEGORY_COLORS["Bar"];

  const [selections, setSelections] = useState<Record<string, ReviewEmoji | null>>({});
  const [ageGroup, setAgeGroup] = useState("23-28");
  const [gender, setGender] = useState("Male");
  const [importCount, setImportCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const allDimensionsFilled = dimensions.every((dim) => selections[dim.key]);

  const handleSelect = (dimKey: string, emoji: ReviewEmoji) => {
    setSelections((prev) => ({
      ...prev,
      [dimKey]: prev[dimKey]?.emoji === emoji.emoji ? null : emoji,
    }));
  };

  const handleAdd = async () => {
    if (!allDimensionsFilled || submitting) return;
    setSubmitting(true);

    try {
      const ratingsRef = collection(db, `locations/${location.id}/ratings`);
      const ratingDoc: Record<string, any> = {
        userId: "admin_import",
        ageGroup,
        gender,
        phase: "reviewed",
        checkinAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        timestamp: serverTimestamp(),
      };

      for (const dim of dimensions) {
        const sel = selections[dim.key];
        if (sel) {
          ratingDoc[dim.key] = { emoji: sel.emoji, word: sel.word, score: sel.score };
        }
      }

      await addDoc(ratingsRef, ratingDoc);

      // Increment totalRatings on the location
      const locationRef = doc(db, "locations", location.id);
      await updateDoc(locationRef, {
        totalRatings: (location.totalRatings || 0) + importCount + 1,
      });

      setImportCount((c) => c + 1);
      setSelections({});
      toast.success(`Review #${importCount + 1} added`);
    } catch (err) {
      console.error("Error importing review:", err);
      toast.error("Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (importCount > 0) onImported();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full sm:w-[460px] max-h-[90vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden card-shadow animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-lg text-foreground">
                Import Review
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColor}`}>
                {location.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {location.name} &middot; {importCount} added this session
            </p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-5 py-5 space-y-5">
          {/* Demographics */}
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs font-display font-semibold text-muted-foreground mb-1.5">Age</p>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-base"
              >
                {AGE_GROUPS.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs font-display font-semibold text-muted-foreground mb-1.5">Gender</p>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-base"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

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
                      <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {e.word}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!allDimensionsFilled || submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Add Review #{importCount + 1}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewImportModal;
