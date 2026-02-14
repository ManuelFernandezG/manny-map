import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, Sparkles } from "lucide-react";
import type { Location } from "@/data/mockData";
import { CATEGORIES } from "@/data/mockData";

interface LocationSearchProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onCategorySelect?: (category: string) => void;
  placeholder?: string;
}

const RECENT_SEARCHES_KEY = "mannymap_recent_searches";
const MAX_RECENT = 1;

const LocationSearch = ({
  locations,
  onLocationSelect,
  onCategorySelect,
  placeholder = "Search locations..."
}: LocationSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const locationIds = JSON.parse(stored) as string[];
        const recent = locationIds
          .map(id => locations.find(l => l.id === id))
          .filter(Boolean) as Location[];
        setRecentSearches(recent.slice(0, MAX_RECENT));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, [locations]);

  // Get top 3 suggestions (highest rated locations)
  const topSuggestions = locations
    .filter(l => l.totalRatings > 0)
    .sort((a, b) => b.totalRatings - a.totalRatings)
    .slice(0, 3);

  // Filter locations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = locations.filter((loc) =>
      loc.name.toLowerCase().includes(term) ||
      loc.category.toLowerCase().includes(term) ||
      loc.address.toLowerCase().includes(term) ||
      loc.neighborhood.toLowerCase().includes(term)
    ).slice(0, 10); // Limit to 10 results

    setFilteredResults(results);
  }, [searchTerm, locations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const saveToRecent = (location: Location) => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const existing = stored ? JSON.parse(stored) : [];

      // Remove if already exists and add to front
      const filtered = existing.filter((id: string) => id !== location.id);
      const updated = [location.id, ...filtered].slice(0, MAX_RECENT);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches([location, ...recentSearches.filter(l => l.id !== location.id)].slice(0, MAX_RECENT));
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  const handleSelect = (location: Location) => {
    saveToRecent(location);
    onLocationSelect(location);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredResults([]);
  };

  const showSuggestions = isOpen && !searchTerm && (recentSearches.length > 0 || topSuggestions.length > 0);
  const showResults = isOpen && searchTerm && filteredResults.length > 0;
  const showNoResults = isOpen && searchTerm && filteredResults.length === 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions (Recent + Top) */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-card border border-border shadow-xl z-[1001] overflow-hidden">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-2 flex items-center gap-2 bg-surface/50">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent</p>
              </div>
              {recentSearches.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{location.dominantEmoji}</span>
                    <span className="font-display font-semibold text-foreground text-sm group-hover:text-primary">
                      {location.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Top Suggestions */}
          {topSuggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 bg-surface/50">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggestions</p>
              </div>
              {topSuggestions.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-hover transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base">{location.dominantEmoji}</span>
                      <span className="font-display font-semibold text-foreground text-sm group-hover:text-primary truncate">
                        {location.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      <TrendingUp className="h-3 w-3" />
                      <span>{location.totalRatings}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-card border border-border shadow-xl z-[1001] max-h-96 overflow-y-auto">
          {filteredResults.map((location) => (
            <button
              key={location.id}
              onClick={() => handleSelect(location)}
              className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border last:border-b-0 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{location.dominantEmoji}</span>
                    <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary">
                      {location.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-surface text-xs font-medium">
                      {location.category}
                    </span>
                    <span>{location.dominantWord}</span>
                    <span>•</span>
                    <span>{location.totalRatings} ratings</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-card border border-border shadow-xl z-[1001] px-4 py-3">
          <p className="text-sm text-muted-foreground">No locations found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
