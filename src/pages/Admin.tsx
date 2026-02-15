import { useState, useEffect } from "react";
import { Lock, MapPin, TrendingUp, Users, Pencil, Check, X, MessageSquare, Plus } from "lucide-react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { toast } from "sonner";
import ReviewImportModal from "@/components/ReviewImportModal";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

interface Suggestion {
  id: string;
  locationId: string;
  locationName: string;
  suggestedName?: string;
  suggestedCategory?: string;
  message: string;
  userId: string;
  createdAt: any;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

const TABS = [
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "suggestions", label: "Suggestions", icon: MessageSquare },
] as const;

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "locations" | "suggestions">("analytics");
  const [locations, setLocations] = useState<Location[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalRatings: 0,
    avgRatingsPerLocation: 0,
    topLocations: [] as Location[]
  });

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);

  // Review import modal
  const [importLocation, setImportLocation] = useState<Location | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      toast.success("Welcome, admin!");
      loadData();
    } else {
      toast.error("Invalid password");
    }
  };

  const loadData = async () => {
    try {
      const locationsSnap = await getDocs(collection(db, "locations"));
      const locs = locationsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Location[];

      setLocations(locs);

      const totalRatings = locs.reduce((sum, loc) => sum + (loc.totalRatings || 0), 0);
      const topLocs = [...locs]
        .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
        .slice(0, 10);

      setStats({
        totalLocations: locs.length,
        totalRatings,
        avgRatingsPerLocation: locs.length > 0 ? totalRatings / locs.length : 0,
        topLocations: topLocs
      });

      // Load suggestions
      const sugSnap = await getDocs(collection(db, "suggestions"));
      const sugs = sugSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Suggestion[];
      setSuggestions(sugs.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)));
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load data");
    }
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditCategory(loc.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCategory("");
  };

  const saveEdit = async (locId: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "locations", locId), {
        name: editName.trim(),
        category: editCategory,
      });
      setLocations((prev) =>
        prev.map((l) => l.id === locId ? { ...l, name: editName.trim(), category: editCategory } : l)
      );
      setEditingId(null);
      toast.success("Location updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const approveSuggestion = async (sug: Suggestion) => {
    try {
      const updates: Record<string, string> = {};
      if (sug.suggestedName) updates.name = sug.suggestedName;
      if (sug.suggestedCategory) updates.category = sug.suggestedCategory;

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "locations", sug.locationId), updates);
        setLocations((prev) =>
          prev.map((l) => l.id === sug.locationId ? { ...l, ...updates } : l)
        );
      }

      await deleteDoc(doc(db, "suggestions", sug.id));
      setSuggestions((prev) => prev.filter((s) => s.id !== sug.id));
      toast.success("Suggestion approved & applied");
    } catch {
      toast.error("Failed to apply suggestion");
    }
  };

  const dismissSuggestion = async (sugId: string) => {
    try {
      await deleteDoc(doc(db, "suggestions", sugId));
      setSuggestions((prev) => prev.filter((s) => s.id !== sugId));
      toast.success("Suggestion dismissed");
    } catch {
      toast.error("Failed to dismiss");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F5] p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-8" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#2D5F2D]/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-[#2D5F2D]" />
                </div>
              </div>
              <h1 className="font-['Instrument_Serif'] text-3xl italic text-center text-black mb-2">
                Admin Dashboard
              </h1>
              <p className="font-['Inter'] text-sm text-[#888888] text-center mb-6">
                Enter password to access admin controls
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E0E0E0] text-black font-['Inter'] text-sm placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#2D5F2D] transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-[#2D5F2D] text-white font-['Inter'] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-6 pb-20 md:p-12 md:pb-12">
        <div className="flex flex-col gap-8 md:gap-14">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="font-['Instrument_Serif'] text-4xl md:text-[64px] italic leading-none text-black">
                Admin
              </h1>
              <p className="font-['Inter'] text-sm md:text-base text-[#666666]">
                Manage locations, imports, and analytics
              </p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_auth");
                setIsAuthenticated(false);
              }}
              className="flex items-center gap-2.5 bg-white px-4 py-3 font-['Inter'] text-sm text-[#333333] hover:bg-[#F0F0F0] transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white p-1.5 overflow-x-auto">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const label = tab.id === "suggestions" && suggestions.length
                ? `${tab.label} (${suggestions.length})`
                : tab.label;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 font-['Inter'] text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#2D5F2D] text-white font-medium"
                      : "text-[#666666] hover:text-black"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="flex flex-col gap-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="flex flex-col gap-3 bg-white p-5 md:p-7">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#888888]" />
                    <span className="font-['Inter'] text-[13px] text-[#888888]">Total Locations</span>
                  </div>
                  <span className="font-['Instrument_Serif'] text-3xl md:text-[44px] italic leading-none text-black">
                    {stats.totalLocations}
                  </span>
                </div>
                <div className="flex flex-col gap-3 bg-white p-5 md:p-7">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#888888]" />
                    <span className="font-['Inter'] text-[13px] text-[#888888]">Total Ratings</span>
                  </div>
                  <span className="font-['Instrument_Serif'] text-3xl md:text-[44px] italic leading-none text-black">
                    {stats.totalRatings}
                  </span>
                </div>
                <div className="flex flex-col gap-3 bg-white p-5 md:p-7">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#888888]" />
                    <span className="font-['Inter'] text-[13px] text-[#888888]">Avg Ratings / Location</span>
                  </div>
                  <span className="font-['Instrument_Serif'] text-3xl md:text-[44px] italic leading-none text-black">
                    {stats.avgRatingsPerLocation.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Top Rated Locations */}
              <div className="flex flex-col gap-6 bg-white p-5 md:p-7 overflow-x-auto">
                <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">Top Rated Locations</h2>
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[#F0F0F0]">
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">#</th>
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Location</th>
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Category</th>
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">City</th>
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Ratings</th>
                      <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Dominant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topLocations.map((loc, idx) => (
                      <tr key={loc.id} className={idx < stats.topLocations.length - 1 ? "border-b border-[#F0F0F0]" : ""}>
                        <td className="py-4 font-['Inter'] text-sm text-[#888888]">{idx + 1}</td>
                        <td className="py-4 font-['Inter'] text-sm font-medium text-black">{loc.name}</td>
                        <td className="py-4 font-['Inter'] text-sm text-[#666666]">{loc.category}</td>
                        <td className="py-4 font-['Inter'] text-sm text-[#666666]">{loc.city}</td>
                        <td className="py-4 font-['Inter'] text-sm text-black">{loc.totalRatings}</td>
                        <td className="py-4 font-['Inter'] text-sm text-black">
                          {loc.dominantEmoji} {loc.dominantWord}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="flex flex-col gap-6 bg-white p-5 md:p-7 overflow-x-auto">
              <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">All Locations</h2>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#F0F0F0]">
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Name</th>
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Category</th>
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">City</th>
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Ratings</th>
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Dominant</th>
                    <th className="py-3.5 text-left font-['Inter'] text-xs font-medium text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, i) => (
                    <tr key={loc.id} className={`${i < locations.length - 1 ? "border-b border-[#F0F0F0]" : ""} hover:bg-[#FAFAFA] transition-colors`}>
                      <td className="py-4 pr-4 font-['Inter'] text-sm font-medium text-black">
                        {editingId === loc.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-[#F5F5F5] border border-[#E0E0E0] text-black font-['Inter'] text-sm focus:outline-none focus:border-[#2D5F2D]"
                          />
                        ) : loc.name}
                      </td>
                      <td className="py-4 pr-4 font-['Inter'] text-sm text-[#666666]">
                        {editingId === loc.id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="px-2 py-1 bg-[#F5F5F5] border border-[#E0E0E0] text-black font-['Inter'] text-sm"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : loc.category}
                      </td>
                      <td className="py-4 pr-4 font-['Inter'] text-sm text-[#666666]">{loc.city}</td>
                      <td className="py-4 pr-4 font-['Inter'] text-sm text-black">{loc.totalRatings}</td>
                      <td className="py-4 pr-4 font-['Inter'] text-sm text-black">
                        {loc.dominantEmoji} {loc.dominantWord}
                      </td>
                      <td className="py-4 font-['Inter'] text-sm">
                        <div className="flex items-center gap-1.5">
                          {editingId === loc.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(loc.id)}
                                disabled={saving}
                                className="p-1.5 bg-[#2D5F2D] text-white hover:opacity-90 disabled:opacity-50"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333]"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(loc)}
                                className="p-1.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333]"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setImportLocation(loc)}
                                className="p-1.5 bg-[#2D5F2D]/10 hover:bg-[#2D5F2D]/20 text-[#2D5F2D]"
                                title="Import reviews"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === "suggestions" && (
            <div className="flex flex-col gap-4">
              <h2 className="font-['Instrument_Serif'] text-2xl italic text-black">User Suggestions</h2>
              {suggestions.length === 0 ? (
                <div className="bg-white p-8 text-center">
                  <MessageSquare className="h-8 w-8 text-[#AAAAAA] mx-auto mb-3" />
                  <p className="font-['Inter'] text-sm text-[#888888]">No suggestions yet</p>
                </div>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} className="bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-['Inter'] text-sm font-medium text-black">{sug.locationName}</p>
                        <p className="font-['Inter'] text-xs text-[#AAAAAA] mt-0.5">Location ID: {sug.locationId}</p>

                        {sug.suggestedName && (
                          <div className="mt-2 flex items-center gap-2 font-['Inter'] text-sm">
                            <span className="text-[#888888]">Name →</span>
                            <span className="font-medium text-[#2D5F2D]">{sug.suggestedName}</span>
                          </div>
                        )}
                        {sug.suggestedCategory && (
                          <div className="mt-1 flex items-center gap-2 font-['Inter'] text-sm">
                            <span className="text-[#888888]">Category →</span>
                            <span className="font-medium text-[#2D5F2D]">{sug.suggestedCategory}</span>
                          </div>
                        )}
                        {sug.message && (
                          <p className="mt-2 font-['Inter'] text-sm text-[#333333] bg-[#F5F5F5] px-3 py-2">
                            "{sug.message}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveSuggestion(sug)}
                          className="px-3 py-1.5 bg-[#2D5F2D] text-white font-['Inter'] text-xs font-medium hover:opacity-90"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => dismissSuggestion(sug.id)}
                          className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#333333] font-['Inter'] text-xs font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Review import modal */}
      {importLocation && (
        <ReviewImportModal
          location={importLocation}
          onClose={() => setImportLocation(null)}
          onImported={loadData}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Admin;
