import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { CategoryGroup } from "@/data/mockData";

/** Nightlife-first scope: only Nightlife group shown */
const GROUPS: { id: CategoryGroup; label: string }[] = [
  { id: "nightlife", label: "Nightlife" },
];

interface CategoryFilterProps {
  activeGroups: Set<string>;
  onToggle: (group: string) => void;
  onToggleAll: () => void;
  ratedCountByGroup?: Record<string, number>;
}

const CategoryFilter = ({ activeGroups, onToggle, onToggleAll, ratedCountByGroup = {} }: CategoryFilterProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allActive = activeGroups.size === GROUPS.length;
  const noneActive = activeGroups.size === 0;

  const label = allActive
    ? "All Categories"
    : noneActive
      ? "No Categories"
      : `${activeGroups.size} Selected`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGroupClick = (groupId: string) => {
    onToggle(groupId);
  };

  return (
    <div ref={ref} className="relative w-fit">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-[#E0E0E0] text-sm font-['DM_Sans'] font-medium text-[#333] hover:border-[#2D5F2D] transition-colors rounded-lg"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 text-[#888] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-[#E0E0E0] shadow-lg rounded-lg z-[1002] overflow-hidden">
          <button
            onClick={onToggleAll}
            className="w-full text-left px-3 py-2 text-xs font-['DM_Sans'] font-medium text-[#888] hover:bg-[#F5F5F5] transition-colors border-b border-[#E0E0E0]"
          >
            {allActive ? "Deselect All" : "Select All"}
          </button>

          <div className="py-1">
            {GROUPS.map(({ id, label: groupLabel }) => {
              const isActive = activeGroups.has(id);
              const ratedCount = ratedCountByGroup[id] ?? 0;

              return (
                <button
                  key={id}
                  onClick={() => handleGroupClick(id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  <span className={`w-4 h-4 flex items-center justify-center border rounded transition-colors ${
                    isActive ? "bg-[#2D5F2D] border-[#2D5F2D]" : "border-[#CCC]"
                  }`}>
                    {isActive && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className="font-['DM_Sans'] font-medium text-[#333] flex-1 text-left">
                    {groupLabel}
                  </span>
                  <span className="text-[10px] text-[#888]">
                    {ratedCount} rated
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
