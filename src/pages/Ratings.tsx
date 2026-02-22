import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import PopularTimesBar from "@/components/PopularTimesBar";
import { NIGHTLIFE_LOCATIONS } from "@/data/nightlifeLocations";
import { GOOGLE_DATA } from "@/data/googleData";
import type { DayPopularTimes } from "@/data/googleData";

// --- Mock pregame demographics (will be wired to real Firestore data later) ---

const PREGAME_STATS = {
  ageDistribution: { "18-22": 30, "23-28": 40, "29-35": 20, "36+": 10 } as Record<string, number>,
  genderDistribution: { Female: 60, Male: 40 } as Record<string, number>,
  waitTimeDistribution: { "<5 min": 15, "5-15 min": 45, "15-30 min": 30, "30+ min": 10 } as Record<string, number>,
  groupSizeDistribution: { Solo: 10, "2-3": 50, "4-6": 30, "7+": 10 } as Record<string, number>,
};

// --- Mock vibe data (varied, not all "Crazy") ---

const MOCK_VIBES: Record<string, { emoji: string; word: string; score: number; ratioFemale: number }> = {
  "bar-heart-and-crown-ottawa": { emoji: "🔥", word: "Fire", score: 3, ratioFemale: 55 },
  "club-sky-lounge-ottawa": { emoji: "😴", word: "Slow", score: 2, ratioFemale: 45 },
  "club-room-104-ottawa": { emoji: "🤯", word: "Crazy", score: 4, ratioFemale: 40 },
  "club-the-show-ottawa": { emoji: "😴", word: "Slow", score: 2, ratioFemale: 35 },
  "bar-lieutenant-pump-ottawa": { emoji: "🔥", word: "Fire", score: 3, ratioFemale: 50 },
  "bar-happy-fish-elgin-ottawa": { emoji: "🔥", word: "Fire", score: 3, ratioFemale: 55 },
  "club-city-at-night-ottawa": { emoji: "🤯", word: "Crazy", score: 4, ratioFemale: 45 },
  "bar-tomo-restaurant-ottawa": { emoji: "🔥", word: "Fire", score: 3, ratioFemale: 60 },
  "club-berlin-nightclub-ottawa": { emoji: "🤯", word: "Crazy", score: 4, ratioFemale: 40 },
  "bar-back-to-brooklyn-ottawa": { emoji: "💀", word: "Dead", score: 1, ratioFemale: 50 },
  "bar-el-furniture-warehouse-ottawa": { emoji: "🔥", word: "Fire", score: 3, ratioFemale: 55 },
  "bar-la-ptite-grenouille-ottawa": { emoji: "🤯", word: "Crazy", score: 4, ratioFemale: 35 },
};

// --- Distribution bar component ---

function DistributionBar({ data, color }: { data: Record<string, number>; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(data).map(([label, pct]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="font-['Inter'] text-[11px] text-[#666] w-16 text-right shrink-0">{label}</span>
          <div className="flex-1 h-3 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <span className="font-['Inter'] text-[10px] text-[#999] w-8">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

// --- Fri/Sat busyness score (average % across 8pm–2am for Fri+Sat) ---

function getFriSatScore(popularTimes: DayPopularTimes[] | null): number {
  if (!popularTimes) return -1;
  const hours = [20, 21, 22, 23, 0, 1, 2];
  let total = 0;
  let count = 0;
  for (const d of popularTimes) {
    if (d.day !== 5 && d.day !== 6) continue;
    for (const h of d.popular_times ?? []) {
      if (hours.includes(h.hour)) { total += h.percentage; count++; }
    }
  }
  return count > 0 ? total / count : -1;
}

// --- Table sorting ---

type SortKey = "name" | "google" | "vibe" | "ratio" | "frisat";
type SortDir = "asc" | "desc";

type ViewMode = "history" | "lastWeek";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("history");
  const [sortKey, setSortKey] = useState<SortKey>("google");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pregameLocation, setPregameLocation] = useState<string>("all");

  const locations = useMemo(() => {
    return NIGHTLIFE_LOCATIONS.map((loc) => {
      const google = GOOGLE_DATA[loc.id];
      const vibe = MOCK_VIBES[loc.id] ?? { emoji: "🔥", word: "New", score: 0, ratioFemale: 50 };
      const friSatScore = getFriSatScore(google?.popularTimes ?? null);
      return { ...loc, google, vibe, friSatScore };
    });
  }, []);

  const sortedLocations = useMemo(() => {
    const list = [...locations];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "google": cmp = (a.google?.googleRating ?? 0) - (b.google?.googleRating ?? 0); break;
        case "vibe": cmp = a.vibe.score - b.vibe.score; break;
        case "ratio": cmp = a.vibe.ratioFemale - b.vibe.ratioFemale; break;
        case "frisat": cmp = a.friSatScore - b.friSatScore; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [locations, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };


  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-4 pb-20 md:p-8 md:pb-12 text-left">
        <div className="flex flex-col gap-5 md:gap-8 max-w-full">
          {/* Page Header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-['Instrument_Serif'] text-4xl md:text-[64px] italic leading-none text-black">
              Ratings
            </h1>
            <p className="font-['Inter'] text-sm md:text-base text-[#666666]">
              Track ratings and location engagement
            </p>
          </div>

          {/* Section A: Pregame Summary */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-['Instrument_Serif'] text-xl md:text-2xl italic text-black">Pregame</h2>
              <div className="relative">
                <select
                  value={pregameLocation}
                  onChange={(e) => setPregameLocation(e.target.value)}
                  className="appearance-none bg-white border border-[#E0E0E0] rounded-lg px-3 py-1.5 pr-8 font-['Inter'] text-base text-black cursor-pointer hover:border-[#999] transition-colors"
                >
                  <option value="all">All Locations</option>
                  {NIGHTLIFE_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#888] pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 flex flex-col gap-2">
                <span className="font-['Inter'] text-[13px] text-[#888]">Age</span>
                <DistributionBar data={PREGAME_STATS.ageDistribution} color="#2D5F2D" />
              </div>
              <div className="bg-white p-4 flex flex-col gap-2">
                <span className="font-['Inter'] text-[13px] text-[#888]">Gender</span>
                <DistributionBar data={PREGAME_STATS.genderDistribution} color="#6B4C9A" />
              </div>
              <div className="bg-white p-4 flex flex-col gap-2">
                <span className="font-['Inter'] text-[13px] text-[#888]">Wait time</span>
                <DistributionBar data={PREGAME_STATS.waitTimeDistribution} color="#1a6b8a" />
              </div>
              <div className="bg-white p-4 flex flex-col gap-2">
                <span className="font-['Inter'] text-[13px] text-[#888]">Group size</span>
                <DistributionBar data={PREGAME_STATS.groupSizeDistribution} color="#b07d3a" />
              </div>
            </div>
          </div>

          {/* Section B: Location Table (with inline Popular Times) */}
          <div className="flex flex-col gap-3 bg-white p-4 md:p-5 overflow-x-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="font-['Instrument_Serif'] text-xl md:text-2xl italic text-black">All Locations</h2>
              <div className="flex bg-[#F0F0F0] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("history")}
                  className={`px-3 py-1.5 rounded-md font-['Inter'] text-xs font-medium transition-all ${
                    viewMode === "history"
                      ? "bg-white text-black shadow-sm"
                      : "text-[#888] hover:text-black"
                  }`}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("lastWeek")}
                  className={`px-3 py-1.5 rounded-md font-['Inter'] text-xs font-medium transition-all ${
                    viewMode === "lastWeek"
                      ? "bg-white text-black shadow-sm"
                      : "text-[#888] hover:text-black"
                  }`}
                >
                  Last Week
                </button>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  {([
                    ["name", "Location", "130px"],
                    ...(viewMode === "history" ? [["google", "Google", "100px"]] as [SortKey, string, string][] : []),
                    ...(viewMode === "lastWeek" ? [["vibe", "Vibe", "80px"]] as [SortKey, string, string][] : []),
                    ...(viewMode === "lastWeek" ? [["ratio", "Ratio", "90px"]] as [SortKey, string, string][] : []),
                    ...(viewMode === "history" ? [["frisat", "Fri/Sat", "300px"]] as [SortKey, string, string][] : []),
                  ] as [SortKey, string, string][]).map(([key, label, minW]) => (
                    <th key={key} className="py-2 text-left pr-3" style={{ minWidth: minW }}>
                      <button
                        type="button"
                        onClick={() => handleSort(key)}
                        className="flex items-center gap-1 font-['Inter'] text-xs max-[320px]:text-[10px] font-medium text-black hover:text-[#2D5F2D]"
                      >
                        {label} <SortIcon column={key} />
                        {key === "frisat" && <span className="font-['Inter'] text-[8px] text-[#BBB] ml-0.5">8p–2a</span>}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedLocations.map((loc, i) => {
                  const g = loc.google;
                  const v = loc.vibe;
                  return (
                    <tr key={loc.id} className={i < sortedLocations.length - 1 ? "border-b border-[#F0F0F0]" : ""}>
                      <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs font-medium text-black">{loc.name}</td>
                      {viewMode === "history" && (
                        <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-black whitespace-nowrap">
                          {g ? (
                            <>
                              {g.googleRating} <span className="text-amber-500">★</span>{" "}
                              <span className="text-[#999] text-xs">({g.googleReviewCount.toLocaleString()})</span>
                            </>
                          ) : "—"}
                        </td>
                      )}
                      {viewMode === "lastWeek" && (
                        <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-black">
                          <span className="mr-1" aria-hidden>{v.emoji}</span>
                          {v.word}
                        </td>
                      )}
                      {viewMode === "lastWeek" && (
                        <td className="py-2.5 font-['Inter'] text-sm max-[320px]:text-xs text-[#666] whitespace-nowrap">
                          {v.ratioFemale}% F / {100 - v.ratioFemale}% M
                        </td>
                      )}
                      {viewMode === "history" && (
                        <td className="py-2.5">
                          <PopularTimesBar popularTimes={g?.popularTimes ?? null} />
                        </td>
                      )}
                    </tr>
                  );
                })}
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
