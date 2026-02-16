import { useMemo } from "react";
import { RefreshCw, Loader, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";
import { CATEGORY_COLORS, PHASE_LABELS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { useLocations } from "@/hooks/useLocations";
import { toast } from "sonner";

function getPhaseLabel(phase: string, userGender: string | null): { text: string; color: string } {
  const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  if (phase === "checkin") {
    return { text: `${labels?.phase1 || "Checked in"} — tap for ${labels?.phase2 || "review"}`, color: "text-amber-500" };
  }
  return { text: labels?.phase2 || "Reviewed", color: "text-[#2D5F2D]" };
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
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [sortedRatings]);

  const handleDeleteAccount = () => {
    if (!window.confirm("Are you sure you want to delete your account? This will clear all your local data and cannot be undone.")) return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Account data deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete account data");
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-6 pb-20 md:p-12 md:pb-12">
        <div className="flex flex-col gap-8 md:gap-14">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-['Instrument_Serif'] text-4xl md:text-[64px] italic leading-none text-black">
                Profile
              </h1>
              <p className="font-['Inter'] text-sm md:text-base text-[#666666]">
                {loading ? (
                  <span className="flex items-center gap-1"><Loader className="h-3.5 w-3.5 animate-spin" /> Loading...</span>
                ) : (
                  <>{ratedLocations.length} place{ratedLocations.length !== 1 ? "s" : ""} rated &middot;{" "}
                  {ratedLocations.filter((r) => r.entry.phase === "checkin").length} awaiting review</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast("Create Profile coming soon!")}
                className="flex items-center gap-2.5 bg-[#2D5F2D] px-5 py-3 font-['Inter'] text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                <UserPlus className="h-4 w-4" />
                Create Profile
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2.5 bg-white px-4 py-3 font-['Inter'] text-sm text-[#CC3333] hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>

          {/* Ratings List */}
          {sortedRatings.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-4xl mb-3">📍</p>
              <p className="font-['Instrument_Serif'] text-2xl italic text-black mb-1">No ratings yet</p>
              <p className="font-['Inter'] text-sm text-[#888888] mb-4">
                Go explore the map and rate some spots!
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-3 bg-[#2D5F2D] text-white font-['Inter'] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to Map
              </button>
            </div>
          ) : (
            groupedRatings.map((group) => (
              <div key={group.category} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">{group.category}</h2>
                  <span className="font-['Inter'] text-[13px] text-[#888888]">
                    {group.items.length} rated
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {group.items.map(({ location, entry }) => {
                    const phaseInfo = getPhaseLabel(entry.phase, userGender);
                    const needsReview = entry.phase === "checkin";
                    return (
                      <div
                        key={location.id}
                        className={`flex items-center gap-4 bg-white px-5 py-4 ${needsReview ? "border-l-4 border-l-amber-400" : ""}`}
                      >
                        <span className="text-2xl flex-shrink-0">
                          {entry.emoji || location.dominantEmoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-['Inter'] text-sm font-medium text-black truncate">
                            {location.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.ratedAt > 0 && (
                              <span className="font-['Inter'] text-xs text-[#AAAAAA]">
                                {timeAgo(entry.ratedAt)}
                              </span>
                            )}
                            <span className={`font-['Inter'] text-xs ${phaseInfo.color}`}>
                              {phaseInfo.text}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {needsReview ? (
                            <button
                              onClick={() => navigate(`/?review=${location.id}`)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#2D5F2D] text-white font-['Inter'] text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              {PHASE_LABELS[userGender as keyof typeof PHASE_LABELS]?.phase2 || "Review"}
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/?rate=${location.id}`)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333] font-['Inter'] text-xs font-medium transition-colors"
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
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
