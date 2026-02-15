import { useMemo } from "react";
import { ArrowLeft, RefreshCw, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";
import { CATEGORIES, CATEGORY_COLORS, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { useLocations } from "@/hooks/useLocations";

function getPhaseLabel(phase: string, userGender: string | null): { text: string; color: string } {
  const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  if (phase === "checkin") {
    return { text: `${labels?.phase1 || "Checked in"} — tap for ${labels?.phase2 || "review"}`, color: "text-amber-400" };
  }
  return { text: labels?.phase2 || "Reviewed", color: "text-lime-400" };
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const Profile = () => {
  const navigate = useNavigate();
  const ratedLocationIds = useMemo(() => getRatedLocationIds(), []);
  const ratedIds = useMemo(() => [...ratedLocationIds.keys()], [ratedLocationIds]);
  const userGender = useMemo(() => {
    try { return localStorage.getItem("mannymap_gender"); } catch { return null; }
  }, []);

  // Load locations for all cities the user might have rated in
  const { locations: ottawaLocs, loading: l1 } = useLocations({ city: "Ottawa" });
  const { locations: torontoLocs, loading: l2 } = useLocations({ city: "Toronto" });
  const { locations: montrealLocs, loading: l3 } = useLocations({ city: "Montreal" });
  const { locations: guelphLocs, loading: l4 } = useLocations({ city: "Guelph" });
  const loading = l1 || l2 || l3 || l4;

  const allLocations = useMemo(
    () => [...ottawaLocs, ...torontoLocs, ...montrealLocs, ...guelphLocs],
    [ottawaLocs, torontoLocs, montrealLocs, guelphLocs]
  );

  // Match rated IDs to location data
  const ratedLocations = useMemo(() => {
    return ratedIds
      .map((id) => {
        const loc = allLocations.find((l) => l.id === id);
        const entry = ratedLocationIds.get(id);
        if (!loc || !entry) return null;
        return { location: loc, entry };
      })
      .filter(Boolean) as { location: Location; entry: RatedEntry }[];
  }, [ratedIds, allLocations, ratedLocationIds]);

  // Sort by most recent first
  const sortedRatings = useMemo(
    () => [...ratedLocations].sort((a, b) => b.entry.ratedAt - a.entry.ratedAt),
    [ratedLocations]
  );

  // Group by category (maintaining recency sort within each group)
  const groupedRatings = useMemo(() => {
    const map = new Map<string, { location: Location; entry: RatedEntry }[]>();
    sortedRatings.forEach((item) => {
      const list = map.get(item.location.category) || [];
      list.push(item);
      map.set(item.location.category, list);
    });
    return CATEGORIES
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: map.get(cat)! }));
  }, [sortedRatings]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">My Ratings</h1>
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <span className="flex items-center gap-1"><Loader className="h-3 w-3 animate-spin" /> Loading...</span>
              ) : (
                <>{ratedLocations.length} place{ratedLocations.length !== 1 ? "s" : ""} &middot;{" "}
                {ratedLocations.filter((r) => r.entry.phase === "checkin").length} awaiting review</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Ratings list */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {sortedRatings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📍</p>
            <p className="font-display font-bold text-foreground mb-1">No ratings yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Go explore the map and rate some spots!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90"
            >
              Back to Map
            </button>
          </div>
        ) : (
          groupedRatings.map((group) => {
            const groupCategoryClass =
              CATEGORY_COLORS[group.category] || CATEGORY_COLORS["Other"];
            return (
              <div key={group.category} className="space-y-2">
                <div className="flex items-center gap-2 pt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${groupCategoryClass}`}>
                    {group.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length} rated
                  </span>
                </div>
                {group.items.map(({ location, entry }) => {
                  const phaseInfo = getPhaseLabel(entry.phase, userGender);
                  const needsReview = entry.phase === "checkin";
                  return (
                    <div
                      key={location.id}
                      className={`flex items-center gap-3 rounded-xl bg-card border px-4 py-3 ${needsReview ? "border-amber-500/40" : "border-border"}`}
                    >
                      <span className="text-2xl flex-shrink-0">
                        {entry.emoji || location.dominantEmoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-foreground truncate">
                          {location.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {entry.ratedAt > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(entry.ratedAt)}
                            </span>
                          )}
                          <span className={`text-[10px] ${phaseInfo.color}`}>
                            {needsReview ? phaseInfo.text : phaseInfo.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {needsReview ? (
                          <button
                            onClick={() => navigate(`/?review=${location.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-xs hover:opacity-90 transition animate-pulse"
                          >
                            {PHASE_LABELS[userGender as keyof typeof PHASE_LABELS]?.phase2 || "Review"}
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/?rate=${location.id}`)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-foreground font-display font-semibold text-xs transition"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Re-rate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Profile;
