import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { NIGHTLIFE_LOCATIONS } from "@/data/nightlifeLocations";
import { GOOGLE_DATA } from "@/data/googleData";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";
import type { LocationStats } from "@/lib/ratings";
import { Star, GitCompare, X } from "lucide-react";

type Row = (typeof NIGHTLIFE_LOCATIONS)[number] & {
  entry: RatedEntry;
  stats: LocationStats | null;
};

function RatioBar({ male, female }: { male: number; female: number }) {
  const total = male + female;
  if (total === 0) return null;
  const mPct = Math.round((male / total) * 100);
  const fPct = 100 - mPct;
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>{mPct}% M</span>
        <span>{fPct}% F</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden flex">
        <div className="h-full bg-blue-500" style={{ width: `${mPct}%` }} />
        <div className="h-full bg-pink-400" style={{ width: `${fPct}%` }} />
      </div>
    </div>
  );
}

function CompareCard({ row }: { row: Row }) {
  const s = row.stats;
  const google = GOOGLE_DATA[row.id] ?? null;
  const count = s?.checkinCount ?? 0;
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-border bg-surface p-4 space-y-3">
      <div>
        <p className="font-display font-bold text-base text-foreground leading-tight">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.category}</p>
      </div>
      {row.entry.emoji && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{row.entry.emoji}</span>
          <span className="text-xs text-muted-foreground capitalize">{row.entry.phase}</span>
        </div>
      )}
      {count >= 10 && s && (
        <>
          <div className="flex items-center gap-2">
            {s.dominantVibe && <span className="text-xl">{s.dominantVibe}</span>}
            <div>
              <p className="font-display font-bold text-lg text-foreground leading-none">{count}</p>
              <p className="text-[10px] text-muted-foreground">interested</p>
            </div>
          </div>
          <RatioBar male={s.maleCount} female={s.femaleCount} />
        </>
      )}
      {google && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{google.googleRating}</span>
          <span>({google.googleReviewCount.toLocaleString()})</span>
        </div>
      )}
    </div>
  );
}

const Ratings = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const comparing = compareIds.length === 2;

  useEffect(() => {
    const ratedMap = getRatedLocationIds();
    if (ratedMap.size === 0) { setRows([]); return; }

    const ratedLocs = NIGHTLIFE_LOCATIONS.filter((l) => ratedMap.has(l.id))
      .sort((a, b) => {
        const ta = ratedMap.get(a.id)?.ratedAt ?? 0;
        const tb = ratedMap.get(b.id)?.ratedAt ?? 0;
        return tb - ta;
      });

    setRows(ratedLocs.map((l) => ({ ...l, entry: ratedMap.get(l.id)!, stats: null })));

    import("@/lib/ratings").then(({ getLocationStats }) => {
      Promise.all(ratedLocs.map((l) => getLocationStats(l.id))).then((allStats) => {
        setRows(ratedLocs.map((l, i) => ({ ...l, entry: ratedMap.get(l.id)!, stats: allStats[i] })));
      });
    });
  }, []);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  }

  const compareRows = compareIds.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Row[];

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-background p-4 pb-20 md:p-8 md:pb-12 text-left">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">My Ratings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {rows.length === 0 ? "No ratings yet" : `${rows.length} spot${rows.length !== 1 ? "s" : ""} rated`}
              </p>
            </div>
            {rows.length >= 2 && (
              <button
                onClick={() => setCompareIds([])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  compareIds.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare
                {compareIds.length > 0 && (
                  <span className="ml-1 bg-primary-foreground/20 rounded-full px-1.5">{compareIds.length}/2</span>
                )}
              </button>
            )}
          </div>

          {/* Compare panel */}
          {comparing && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-display font-semibold text-primary uppercase tracking-wide">Comparing</p>
                <button onClick={() => setCompareIds([])} className="p-1 rounded hover:bg-surface-hover">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex gap-3">
                {compareRows.map((row) => <CompareCard key={row.id} row={row} />)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {rows.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-display font-semibold text-foreground">No ratings yet</p>
              <p className="text-sm mt-1">Tap a spot on the map to check in</p>
            </div>
          )}

          {/* Location list */}
          {rows.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              {rows.map((row, i) => {
                const s = row.stats;
                const count = s?.checkinCount ?? 0;
                const google = GOOGLE_DATA[row.id] ?? null;
                const isSelected = compareIds.includes(row.id);

                return (
                  <div
                    key={row.id}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                      i < rows.length - 1 ? "border-b border-border" : ""
                    } ${isSelected ? "bg-primary/5" : ""}`}
                  >
                    {/* Personal emoji or vibe */}
                    <span className="text-2xl w-8 text-center flex-shrink-0">
                      {row.entry.emoji || s?.dominantVibe || "—"}
                    </span>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">{row.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{row.category}</span>
                        {google && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            {google.googleRating}
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          row.entry.phase === "reviewed"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {row.entry.phase === "reviewed" ? "Reviewed" : "Checked in"}
                        </span>
                      </div>
                    </div>

                    {/* Stats + compare */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                      {count >= 10 && (
                        <p className="font-display font-bold text-foreground text-sm">
                          {count} <span className="font-normal text-xs text-muted-foreground">going</span>
                        </p>
                      )}
                      {rows.length >= 2 && (
                        <button
                          onClick={() => toggleCompare(row.id)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {isSelected ? "✓ Selected" : "Compare"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Ratings;
