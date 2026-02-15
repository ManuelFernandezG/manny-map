import { useState, useEffect } from "react";
import { Lock, MapPin, TrendingUp, Users, Upload, Pencil, Check, X, MessageSquare, Plus } from "lucide-react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/data/mockData";
import type { Location } from "@/data/mockData";
import { toast } from "sonner";
import ImportTool from "@/components/ImportTool";
import ReviewImportModal from "@/components/ReviewImportModal";

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

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "locations" | "import" | "suggestions">("analytics");
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 card-shadow">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter password to access admin controls
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage locations, imports, and analytics</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_auth");
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 rounded-lg bg-surface text-foreground hover:bg-surface-hover transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {[
              { id: "analytics", label: "Analytics", icon: TrendingUp },
              { id: "locations", label: "Locations", icon: MapPin },
              { id: "import", label: "Import", icon: Upload },
              { id: "suggestions", label: `Suggestions${suggestions.length ? ` (${suggestions.length})` : ""}`, icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-display">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Total Locations</p>
                </div>
                <p className="text-3xl font-display font-bold text-foreground">{stats.totalLocations}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Total Ratings</p>
                </div>
                <p className="text-3xl font-display font-bold text-foreground">{stats.totalRatings}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Avg Ratings/Location</p>
                </div>
                <p className="text-3xl font-display font-bold text-foreground">
                  {stats.avgRatingsPerLocation.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Top Rated Locations</h2>
              <div className="space-y-3">
                {stats.topLocations.map((loc, idx) => (
                  <div key={loc.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-display font-bold text-muted-foreground">#{idx + 1}</span>
                      <div>
                        <p className="font-display font-semibold text-foreground">{loc.name}</p>
                        <p className="text-sm text-muted-foreground">{loc.category} · {loc.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold text-foreground">
                        {loc.dominantEmoji} {loc.dominantWord}
                      </p>
                      <p className="text-sm text-muted-foreground">{loc.totalRatings} ratings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "locations" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">All Locations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">City</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ratings</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Dominant</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => (
                    <tr key={loc.id} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {editingId === loc.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                          />
                        ) : loc.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {editingId === loc.id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="px-2 py-1 rounded bg-background border border-border text-foreground text-sm"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : loc.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{loc.city}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{loc.totalRatings}</td>
                      <td className="py-3 px-4 text-sm">
                        {loc.dominantEmoji} {loc.dominantWord}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          {editingId === loc.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(loc.id)}
                                disabled={saving}
                                className="p-1.5 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                title="Save"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1.5 rounded bg-surface hover:bg-surface-hover text-foreground"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(loc)}
                                className="p-1.5 rounded bg-surface hover:bg-surface-hover text-foreground"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setImportLocation(loc)}
                                className="p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary"
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
          </div>
        )}

        {activeTab === "import" && <ImportTool />}

        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">User Suggestions</h2>
            {suggestions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No suggestions yet</p>
              </div>
            ) : (
              suggestions.map((sug) => (
                <div key={sug.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground">{sug.locationName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Location ID: {sug.locationId}</p>

                      {sug.suggestedName && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Name →</span>
                          <span className="font-semibold text-primary">{sug.suggestedName}</span>
                        </div>
                      )}
                      {sug.suggestedCategory && (
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Category →</span>
                          <span className="font-semibold text-primary">{sug.suggestedCategory}</span>
                        </div>
                      )}
                      {sug.message && (
                        <p className="mt-2 text-sm text-secondary-foreground bg-surface rounded-lg px-3 py-2">
                          "{sug.message}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => approveSuggestion(sug)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-xs hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => dismissSuggestion(sug.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-foreground font-display font-semibold text-xs"
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

      {/* Review import modal */}
      {importLocation && (
        <ReviewImportModal
          location={importLocation}
          onClose={() => setImportLocation(null)}
          onImported={loadData}
        />
      )}
    </div>
  );
};

export default Admin;
