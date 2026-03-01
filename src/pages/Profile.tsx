import { useMemo, useState, useCallback, lazy, Suspense } from "react";
import { RefreshCw, Loader, Trash2, UserPlus, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import CitySelector from "@/components/CitySelector";
import CategoryFilter from "@/components/CategoryFilter";
import { getRatedLocationIds } from "@/lib/userId";
import type { RatedEntry } from "@/lib/userId";
import { PHASE_LABELS, CATEGORY_GROUPS } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { useLocations } from "@/hooks/useLocations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AuthModal = lazy(() => import("@/components/AuthModal"));

function getPhaseLabel(phase: string, userGender: string | null): { text: string; color: string } {
  const labels = userGender && PHASE_LABELS[userGender as keyof typeof PHASE_LABELS];
  if (phase === "checkin") {
    return { text: `${labels?.phase1 || "Checked in"} — tap for ${labels?.phase2 || "review"}`, color: "text-amber-500" };
  }
  return { text: labels?.phase2 || "Reviewed", color: "text-primary" };
}

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
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [city, setCity] = useState("Ottawa");
  const GROUPS = useMemo(() => ["nightlife"] as const, []);
  const [activeGroups, setActiveGroups] = useState<Set<string>>(() => new Set(GROUPS));

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

  // Match rated IDs to location data and filter by city and active groups
  const ratedLocations = useMemo(() => {
    return ratedIds
      .map((id) => {
        const loc = allLocations.find((l) => l.id === id);
        const entry = ratedLocationIds.get(id);
        if (!loc || !entry) return null;
        // Filter by city and active category groups
        if (loc.city !== city) return null;
        const group = CATEGORY_GROUPS[loc.category];
        if (!group || !activeGroups.has(group)) return null;
        return { location: loc, entry };
      })
      .filter(Boolean) as { location: Location; entry: RatedEntry }[];
  }, [ratedIds, allLocations, ratedLocationIds, city, activeGroups]);

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

  const handleGroupToggle = useCallback((groupId: string) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleGroupToggleAll = useCallback(() => {
    setActiveGroups((prev) =>
      prev.size === GROUPS.length ? new Set<string>() : new Set(GROUPS)
    );
  }, [GROUPS]);

  const ratedCountByGroup = useMemo(() => {
    const count: Record<string, number> = {};
    allLocations.forEach((loc) => {
      if (!ratedLocationIds.has(loc.id) || loc.city !== city) return;
      const group = CATEGORY_GROUPS[loc.category];
      if (group) count[group] = (count[group] ?? 0) + 1;
    });
    return count;
  }, [allLocations, ratedLocationIds, city]);

  const handleDeleteAccount = () => {
    if (!window.confirm("Are you sure you want to delete your account? This will clear all your local data and cannot be undone.")) return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Account data deleted");
      navigate("/map");
    } catch {
      toast.error("Failed to delete account data");
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-background p-4 pb-20 md:p-8 md:pb-12 text-left">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {/* Page Header */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? (
                <span className="flex items-center gap-1"><Loader className="h-3.5 w-3.5 animate-spin" /> Loading...</span>
              ) : (
                <>{ratedLocations.length} place{ratedLocations.length !== 1 ? "s" : ""} rated &middot;{" "}
                {ratedLocations.filter((r) => r.entry.phase === "checkin").length} awaiting review</>
              )}
            </p>
          </div>

          {/* City Selector and Category Filter */}
          <div className="flex flex-col gap-3">
            {/* Mobile: dropdown selector */}
            <div className="md:hidden">
              <CitySelector selectedCity={city} onCityChange={setCity} />
            </div>
            {/* Desktop: pill buttons */}
            <div className="hidden md:flex items-center gap-2">
              {["Ottawa", "Toronto", "Montreal", "Guelph"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`h-8 px-3.5 rounded-full text-[13px] font-medium transition-colors ${
                    city === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <CategoryFilter
              activeGroups={activeGroups}
              onToggle={handleGroupToggle}
              onToggleAll={handleGroupToggleAll}
              ratedCountByGroup={ratedCountByGroup}
            />
          </div>

          {/* Ratings List */}
          {sortedRatings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">📍</p>
              <p className="font-display font-semibold text-foreground">No ratings yet</p>
              <p className="text-sm mt-1">Go explore the map and rate some spots!</p>
              <button
                onClick={() => navigate("/map")}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity rounded-lg"
              >
                Back to Map
              </button>
            </div>
          ) : (
            groupedRatings.map((group) => (
              <div key={group.category} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg text-foreground">{group.category}</h2>
                  <span className="text-xs text-muted-foreground">{group.items.length} rated</span>
                </div>
                <div className="rounded-xl border border-border overflow-hidden">
                  {group.items.map(({ location, entry }, i) => {
                    const phaseInfo = getPhaseLabel(entry.phase, userGender);
                    const needsReview = entry.phase === "checkin";
                    return (
                      <div
                        key={location.id}
                        className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                          i < group.items.length - 1 ? "border-b border-border" : ""
                        } ${needsReview ? "border-l-4 border-l-amber-400" : ""}`}
                      >
                        <span className="text-2xl w-8 text-center flex-shrink-0">
                          {entry.emoji || location.dominantVibe || "🔥"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-foreground truncate">
                            {location.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.ratedAt > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(entry.ratedAt)}
                              </span>
                            )}
                            <span className={`text-xs ${phaseInfo.color}`}>
                              {phaseInfo.text}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {needsReview ? (
                            <button
                              onClick={() => navigate(`/map?review=${location.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                              {PHASE_LABELS[userGender as keyof typeof PHASE_LABELS]?.phase2 || "Review"}
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/map?rate=${location.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg transition-colors"
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

          {/* Appearance */}
          <div className="flex flex-col gap-3 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Appearance</p>
            <div className="flex gap-2">
              {([
                { value: "dark", label: "Dark", Icon: Moon },
                { value: "light", label: "Light", Icon: Sun },
                { value: "system", label: "System", Icon: Monitor },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center pt-6 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  )}
                  <span>{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={async () => { await logout(); toast.success("Signed out"); }}
                  className="flex items-center justify-center gap-1.5 bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center justify-center gap-1.5 bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity rounded-lg"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}
            <button
              onClick={handleDeleteAccount}
              className="flex items-center justify-center gap-1.5 bg-surface px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors border border-border rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </button>
          </div>

          {/* Auth Modal */}
          <Suspense fallback={null}>
            {showAuthModal && (
              <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
          </Suspense>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
