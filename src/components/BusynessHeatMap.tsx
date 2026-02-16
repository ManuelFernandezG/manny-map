import { useMemo } from "react";
import type { DayPopularTimes } from "@/data/googleData";

/** Hours: 8pm through 2am */
const HOURS = [20, 21, 22, 23, 0, 1, 2];

function segColor(pct: number): string {
  if (pct === 0) return "#F0F0F0";
  if (pct <= 20) return "#E8F5E9";
  if (pct <= 40) return "#A5D6A7";
  if (pct <= 60) return "#FFF59D";
  if (pct <= 80) return "#FFB74D";
  return "#EF5350";
}

interface MiniBarProps {
  popularTimes: DayPopularTimes[] | null;
}

/**
 * Compact inline Fri/Sat stacked bar (8pm–2am).
 * Renders two thin rows of colored segments — one per night.
 */
export default function PopularTimesBar({ popularTimes }: MiniBarProps) {
  const grid = useMemo(() => {
    if (!popularTimes) return null;
    const dayMap = new Map<number, Map<number, number>>();
    for (const d of popularTimes) {
      if (typeof d.day !== "number") continue;
      const hm = new Map<number, number>();
      for (const h of d.popular_times ?? []) hm.set(h.hour, h.percentage);
      dayMap.set(d.day, hm);
    }
    return dayMap;
  }, [popularTimes]);

  if (!grid) return <span className="text-[#ccc]">—</span>;

  const friMap = grid.get(5);
  const satMap = grid.get(6);

  // If neither night has any data at all
  if (!friMap?.size && !satMap?.size) return <span className="text-[#ccc]">—</span>;

  return (
    <div className="flex flex-col gap-[2px] w-[84px]">
      {([["F", friMap], ["S", satMap]] as const).map(([label, hm]) => (
        <div key={label} className="flex items-center gap-[3px]">
          <span className="font-['Inter'] text-[8px] text-[#AAA] w-[8px] shrink-0">{label}</span>
          <div className="flex gap-px flex-1">
            {HOURS.map((hour) => {
              const pct = hm?.get(hour) ?? 0;
              return (
                <div
                  key={hour}
                  className="flex-1 h-[6px] first:rounded-l-sm last:rounded-r-sm group relative"
                  style={{ backgroundColor: segColor(pct) }}
                  title={pct > 0 ? `${pct}%` : ""}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-black text-white text-[8px] font-['Inter'] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {pct > 0 ? `${pct}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
