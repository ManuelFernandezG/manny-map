import { useState } from "react";
import { Upload, Loader, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { CITIES } from "@/data/mockData";
import { importFromOSM } from "@/lib/overpassImport";
import { toast } from "sonner";

const ImportTool = () => {
  const [selectedCity, setSelectedCity] = useState<string>("Ottawa");
  const [radius, setRadius] = useState<number>(5000);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 100, stage: '' });
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: number; total: number } | null>(null);

  const handleImport = async () => {
    const cityConfig = CITIES[selectedCity];
    if (!cityConfig) {
      toast.error("Invalid city selected");
      return;
    }

    setIsImporting(true);
    setResult(null);
    setProgress({ current: 0, total: 100, stage: 'Starting...' });

    try {
      const importResult = await importFromOSM(
        selectedCity,
        cityConfig.lat,
        cityConfig.lng,
        radius,
        (current, total, stage) => {
          setProgress({ current, total, stage });
        }
      );

      setResult(importResult);

      if (importResult.imported > 0) {
        toast.success(`Successfully imported ${importResult.imported} locations!`);
      } else {
        toast.info("No new locations to import");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import locations. Check console for details.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-display font-semibold text-foreground mb-1">
              Free OpenStreetMap Import
            </p>
            <p className="text-xs text-muted-foreground">
              Import locations from OpenStreetMap (OSM) - completely free, no API keys needed.
              This will fetch restaurants, cafes, bars, parks, and gyms from the selected area.
            </p>
          </div>
        </div>
      </div>

      {/* Import Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-display font-bold text-foreground mb-4">Import Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={isImporting}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            >
              {Object.keys(CITIES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Search Radius: {radius}m ({(radius / 1000).toFixed(1)}km)
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={isImporting}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1km</span>
              <span>5.5km</span>
              <span>10km</span>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import from OpenStreetMap
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      {isImporting && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">{progress.stage}</p>
              <p className="text-sm text-muted-foreground">
                {progress.current} / {progress.total}
              </p>
            </div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isImporting && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-display font-bold text-foreground mb-4">Import Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-surface rounded-lg">
              <p className="text-2xl font-display font-bold text-foreground mb-1">
                {result.total}
              </p>
              <p className="text-xs text-muted-foreground">Fetched</p>
            </div>

            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-2xl font-display font-bold text-green-500">
                  {result.imported}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Imported</p>
            </div>

            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-2xl font-display font-bold text-yellow-500 mb-1">
                {result.skipped}
              </p>
              <p className="text-xs text-muted-foreground">Skipped</p>
            </div>

            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-2xl font-display font-bold text-red-500">
                  {result.errors}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>

          {result.imported > 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              ✅ Refresh the main page to see newly imported locations
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportTool;
