import { useState, useEffect } from "react";
import { Lock, MapPin, TrendingUp, Users, Upload } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Location } from "@/data/mockData";
import { toast } from "sonner";
import ImportTool from "@/components/ImportTool";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "locations" | "import">("analytics");
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalRatings: 0,
    avgRatingsPerLocation: 0,
    topLocations: [] as Location[]
  });

  useEffect(() => {
    // Check if already authenticated
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
      // Fetch all locations
      const locationsSnap = await getDocs(collection(db, "locations"));
      const locs = locationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];

      setLocations(locs);

      // Calculate stats
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
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load data");
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
              { id: "import", label: "Import", icon: Upload }
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
            {/* Stats Grid */}
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

            {/* Top Locations */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Top Rated Locations</h2>
              <div className="space-y-3">
                {stats.topLocations.map((loc, idx) => (
                  <div key={loc.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-display font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
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
                  </tr>
                </thead>
                <tbody>
                  {locations.slice(0, 50).map(loc => (
                    <tr key={loc.id} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{loc.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{loc.category}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{loc.city}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{loc.totalRatings}</td>
                      <td className="py-3 px-4 text-sm">
                        {loc.dominantEmoji} {loc.dominantWord}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {locations.length > 50 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Showing 50 of {locations.length} locations
              </p>
            )}
          </div>
        )}

        {activeTab === "import" && <ImportTool />}
      </div>
    </div>
  );
};

export default Admin;
