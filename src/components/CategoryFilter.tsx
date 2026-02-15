import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Minus } from "lucide-react";
import { CATEGORIES } from "@/data/mockData";

const GROUP_DISPLAY = [
  { group: "nightlife", label: "Nightlife", categories: ["Bar", "Club"] },
  { group: "food", label: "Food", categories: ["Restaurant", "Cafe"] },
  { group: "outdoors", label: "Outdoors", categories: ["Gym", "Beach", "Trail"] },
  { group: "events", label: "Events", categories: ["Run Club", "Festival", "Concert"] },
] as const;

interface CategoryFilterProps {
  activeCategories: Set<string>;
  onToggle: (category: string) => void;
  onToggleAll: () => void;
}

const CategoryFilter = ({ activeCategories, onToggle, onToggleAll }: CategoryFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allActive = activeCategories.size === CATEGORIES.length;
  const noneActive = activeCategories.size === 0;

  const label = allActive
    ? "All Categories"
    : noneActive
      ? "No Categories"
      : `${activeCategories.size} Selected`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGroupToggle = (categories: readonly string[]) => {
    const allGroupActive = categories.every((c) => activeCategories.has(c));
    // If all active, remove all; otherwise add all
    for (const cat of categories) {
      if (allGroupActive) {
        if (activeCategories.has(cat)) onToggle(cat);
      } else {
        if (!activeCategories.has(cat)) onToggle(cat);
      }
    }
  };

  return (
    <div ref={ref} className="relative w-fit">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border text-sm font-display font-semibold text-foreground hover:border-primary/40 transition-colors"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-lg bg-card border border-border shadow-xl z-[1002] overflow-hidden">
          {/* Select All / None */}
          <button
            onClick={onToggleAll}
            className="w-full text-left px-3 py-2 text-xs font-display font-semibold text-muted-foreground hover:bg-surface-hover transition-colors border-b border-border"
          >
            {allActive ? "Deselect All" : "Select All"}
          </button>

          <div className="py-1">
            {GROUP_DISPLAY.map(({ group, label: groupLabel, categories }) => {
              const activeCount = categories.filter((c) => activeCategories.has(c)).length;
              const allGroupActive = activeCount === categories.length;
              const someActive = activeCount > 0 && !allGroupActive;

              return (
                <button
                  key={group}
                  onClick={() => handleGroupToggle(categories)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-surface-hover transition-colors"
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    allGroupActive
                      ? "bg-primary border-primary"
                      : someActive
                        ? "bg-primary/50 border-primary/50"
                        : "border-border"
                  }`}>
                    {allGroupActive && <Check className="h-3 w-3 text-primary-foreground" />}
                    {someActive && <Minus className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <span className="font-display font-semibold text-foreground flex-1 text-left">
                    {groupLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {activeCount}/{categories.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
