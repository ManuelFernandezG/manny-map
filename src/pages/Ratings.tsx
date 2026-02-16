import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const METRICS = [
  { label: "Gender ratio", value: "50% Women · 50% Men", change: null, positive: null },
];

// Vibe from afters: nightlife scale 💀 Dead, 😴 Slow, 🔥 Fire, 🤯 Crazy (word only in Avg column). All 12 from nightlifeLocations.
const LOCATIONS = [
  { name: "Heart and Crown", category: "Bar", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Sky Lounge", category: "Club", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Room 104", category: "Club", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "The Show", category: "Club", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Lieutenant's Pump", category: "Bar", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Happy Fish Elgin", category: "Bar", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "City at Night", category: "Club", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "TOMO Restaurant", category: "Bar", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Berlin Nightclub", category: "Club", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "Back to Brooklyn Restaurant", category: "Bar", vibeEmoji: "🤯", vibeWord: "Crazy", vibeScore: 4, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "El Furniture Warehouse Ottawa", category: "Bar", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
  { name: "La P'tite Grenouille Gatineau", category: "Bar", vibeEmoji: "🔥", vibeWord: "Fire", vibeScore: 3, ratio: "50% F / 50% M", ratioFemale: 50 },
];

type SortKey = "name" | "category" | "avg" | "ratio";
type SortDir = "asc" | "desc";

const Dashboard = () => {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedLocations = useMemo(() => {
    const list = [...LOCATIONS];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "avg":
          cmp = a.vibeScore - b.vibeScore;
          break;
        case "ratio":
          cmp = a.ratioFemale - b.ratioFemale;
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-4 pb-20 md:p-8 md:pb-12 text-left">
        <div className="flex flex-col gap-5 md:gap-8 max-w-full">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-['Instrument_Serif'] text-4xl md:text-[64px] italic leading-none text-black">
                Ratings
              </h1>
              <p className="font-['Inter'] text-sm md:text-base text-[#666666]">
                Track ratings and location engagement
              </p>
            </div>
          </div>

          {/* Metric: Gender ratio only (totals removed until real data) */}
          <div className="grid grid-cols-1 max-w-md gap-4 md:gap-6">
            {METRICS.map((m) => (
              <div key={m.label} className="flex flex-col gap-3 md:gap-5 bg-white p-5 md:p-7">
                <span className="font-['Inter'] text-[13px] text-[#888888]">{m.label}</span>
                <span className="font-['Instrument_Serif'] text-2xl md:text-3xl max-[320px]:text-xl italic leading-none text-black">
                  {m.value}
                </span>
                {m.change != null && (
                  <span className={`font-['Inter'] text-sm max-[320px]:text-xs font-medium ${m.positive ? "text-[#2D5F2D]" : "text-[#888888]"}`}>
                    {m.change}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Data Table - full width, left-aligned, spread columns */}
          <div className="flex flex-col gap-3 bg-white p-4 md:p-5 overflow-x-auto w-full">
            <h2 className="font-['Instrument_Serif'] text-xl md:text-2xl italic text-black">Top Rated Locations</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="py-2 text-left pr-3 min-w-[140px]">
                    <button type="button" onClick={() => handleSort("name")} className="flex items-center gap-1 font-['Inter'] text-xs max-[320px]:text-[10px] font-medium text-black hover:text-[#2D5F2D]">
                      Location <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="py-2 text-left pr-3 min-w-[90px]">
                    <button type="button" onClick={() => handleSort("category")} className="flex items-center gap-1 font-['Inter'] text-xs max-[320px]:text-[10px] font-medium text-black hover:text-[#2D5F2D]">
                      Category <SortIcon column="category" />
                    </button>
                  </th>
                  <th className="py-2 text-left pr-3 min-w-[90px]">
                    <button type="button" onClick={() => handleSort("avg")} className="flex items-center gap-1 font-['Inter'] text-xs max-[320px]:text-[10px] font-medium text-black hover:text-[#2D5F2D]">
                      Avg <SortIcon column="avg" />
                    </button>
                  </th>
                  <th className="py-2 text-left pr-3 min-w-[130px] whitespace-nowrap">
                    <button type="button" onClick={() => handleSort("ratio")} className="flex items-center gap-1 font-['Inter'] text-xs max-[320px]:text-[10px] font-medium text-black hover:text-[#2D5F2D]">
                      Ratio <SortIcon column="ratio" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLocations.map((loc, i) => (
                  <tr key={loc.name} className={i < sortedLocations.length - 1 ? "border-b border-[#F0F0F0]" : ""}>
                    <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs font-medium text-black">{loc.name}</td>
                    <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-[#666666]">{loc.category}</td>
                    <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-black">
                      <span className="mr-1" aria-hidden>{loc.vibeEmoji}</span>
                      {loc.vibeWord}
                    </td>
                    <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-[#666666] whitespace-nowrap">{loc.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
