import { useState } from "react";
import { X, Check } from "lucide-react";
import { EMOJI_CATEGORIES, AGE_GROUPS } from "@/data/mockData";
import type { Location } from "@/data/mockData";

interface EmojiRatingModalProps {
  location: Location;
  userAgeGroup: string | null;
  onSubmit: (emojiWords: { emoji: string; word: string }[], ageGroup: string) => void;
  onClose: () => void;
}

type SelectedEmoji = {
  emoji: string;
  word: string;
  suggestions: string[];
};

const EmojiRatingModal = ({ location, userAgeGroup, onSubmit, onClose }: EmojiRatingModalProps) => {
  const [activeTab, setActiveTab] = useState("Energy");
  const [selected, setSelected] = useState<SelectedEmoji[]>([]);
  const [ageGroup, setAgeGroup] = useState(userAgeGroup || "");
  const [showAgeGate, setShowAgeGate] = useState(!userAgeGroup);
  const [submitted, setSubmitted] = useState(false);

  const tabs = Object.keys(EMOJI_CATEGORIES);

  const toggleEmoji = (emoji: string, suggestions: string[]) => {
    if (selected.find((s) => s.emoji === emoji)) {
      setSelected(selected.filter((s) => s.emoji !== emoji));
    } else if (selected.length < 3) {
      setSelected([...selected, { emoji, word: suggestions[0], suggestions }]);
    }
  };

  const updateWord = (emoji: string, word: string) => {
    setSelected(selected.map((s) => (s.emoji === emoji ? { ...s, word } : s)));
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    if (!ageGroup) {
      setShowAgeGate(true);
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(
        selected.map((s) => ({ emoji: s.emoji, word: s.word })),
        ageGroup
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:w-[520px] max-h-[90vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden card-shadow animate-slide-up">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 animate-scale-in">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">Rating saved!</h3>
            <p className="text-sm text-muted-foreground text-center">
              This helps others discover what's poppin'.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">{location.name}</h3>
                <p className="text-sm text-muted-foreground">What's your vibe?</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Selected emojis */}
              {selected.length > 0 && (
                <div className="px-5 pt-4 space-y-3">
                  {selected.map((s) => (
                    <div key={s.emoji} className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2.5">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1 flex gap-2 flex-wrap">
                        {s.suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => updateWord(s.emoji, sug)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              s.word === sug
                                ? "bg-primary text-primary-foreground"
                                : "bg-surface-hover text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => toggleEmoji(s.emoji, s.suggestions)}
                        className="p-1 rounded hover:bg-surface-active transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    {3 - selected.length} more emoji{3 - selected.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 px-5 pt-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Emoji grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-5">
                {EMOJI_CATEGORIES[activeTab as keyof typeof EMOJI_CATEGORIES]?.map(({ emoji, suggestions }) => {
                  const isSelected = selected.some((s) => s.emoji === emoji);
                  const isDisabled = !isSelected && selected.length >= 3;
                  return (
                    <button
                      key={emoji}
                      onClick={() => !isDisabled && toggleEmoji(emoji, suggestions)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/15 border-2 border-primary scale-105"
                          : isDisabled
                          ? "opacity-30 cursor-not-allowed border-2 border-transparent"
                          : "bg-surface hover:bg-surface-hover border-2 border-transparent hover:scale-105"
                      }`}
                    >
                      <span className="text-3xl">{emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{suggestions[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Age gate */}
              {showAgeGate && !ageGroup && (
                <div className="px-5 pb-3">
                  <p className="text-sm font-display font-semibold text-foreground mb-2">How old are you?</p>
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

              {/* Submit */}
              <div className="p-5 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={selected.length === 0}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 glow-lime"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiRatingModal;
