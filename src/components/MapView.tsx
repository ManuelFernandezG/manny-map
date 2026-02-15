import { useEffect, useRef, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { Location } from "@/data/mockData";
import type { RatedEntry } from "@/lib/userId";

declare module "leaflet" {
  function heatLayer(
    latlngs: (L.LatLngExpression | [number, number, number])[],
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}

interface MapViewProps {
  locations: Location[];
  center: [number, number];
  zoom: number;
  ratedLocationIds: Map<string, RatedEntry>;
  onLocationClick: (location: Location) => void;
  onMapClick: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
}

// Pre-create reusable icon cache
const iconCache = new Map<string, L.DivIcon>();
function getEmojiIcon(emoji: string, size: number): L.DivIcon {
  const key = `${emoji}-${size}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: "emoji-marker",
      html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

const MapView = ({
  locations,
  center,
  zoom,
  ratedLocationIds,
  onLocationClick,
  onMapClick,
  onBoundsChange,
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCenterRef = useRef<[number, number]>(center);
  const lastZoomRef = useRef(zoom);
  const rafRef = useRef<number>(0);

  // Layer group for rated markers only
  const ratedGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const heatLayerRef = useRef<L.Layer | null>(null);
  const heatVisibleRef = useRef(true);

  // Refs for callbacks — prevents effect re-runs on handler identity changes
  const onLocationClickRef = useRef(onLocationClick);
  onLocationClickRef.current = onLocationClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  // Compute heat points once when locations change
  const heatPoints = useMemo(() => {
    return locations.map((loc) => {
      const intensity = Math.min(1, 0.2 + loc.totalRatings / 30);
      return [loc.coordinates.lat, loc.coordinates.lng, intensity] as [number, number, number];
    });
  }, [locations]);

  // Emit bounds to parent via rAF (fires on next paint, no setTimeout overhead)
  const emitBounds = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const map = mapRef.current;
      if (!map) return;
      const b = map.getBounds();
      onBoundsChangeRef.current?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    });
  }, []);

  // Update emoji scale CSS variable based on zoom level
  const updateEmojiScale = useCallback(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;
    const z = map.getZoom();
    const scale = Math.max(0.6, Math.min(1.6, 0.6 + (z - 10) * 0.12));
    container.style.setProperty("--emoji-scale", scale.toFixed(2));
  }, []);

  // Hide heatmap instantly during interaction (no canvas redraws while panning)
  const hideHeat = useCallback(() => {
    const map = mapRef.current;
    const heat = heatLayerRef.current;
    if (!map || !heat || !heatVisibleRef.current) return;
    map.removeLayer(heat);
    heatVisibleRef.current = false;
  }, []);

  // Show heatmap after interaction ends
  const showHeat = useCallback(() => {
    const map = mapRef.current;
    const heat = heatLayerRef.current;
    if (!map || !heat || heatVisibleRef.current) return;
    map.addLayer(heat);
    heatVisibleRef.current = true;
  }, []);

  // Initialize map (once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    // Freeze heatmap during interaction for smooth panning
    map.on("movestart", hideHeat);
    map.on("zoomstart", hideHeat);
    map.on("moveend", () => { showHeat(); emitBounds(); });
    map.on("zoomend", () => { showHeat(); updateEmojiScale(); emitBounds(); });

    // Set initial emoji scale
    updateEmojiScale();

    // Add rated markers layer group
    ratedGroupRef.current.addTo(map);

    mapRef.current = map;
    lastCenterRef.current = center;
    lastZoomRef.current = zoom;

    // Initial bounds
    const b = map.getBounds();
    onBoundsChangeRef.current?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);

    return () => {
      cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly to new city
  useEffect(() => {
    if (!mapRef.current) return;
    const [prevLat, prevLng] = lastCenterRef.current;
    const [newLat, newLng] = center;
    if (newLat !== prevLat || newLng !== prevLng || zoom !== lastZoomRef.current) {
      mapRef.current.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
      lastCenterRef.current = center;
      lastZoomRef.current = zoom;
    }
  }, [center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild heatmap only when location data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
      heatVisibleRef.current = false;
    }

    if (heatPoints.length === 0) return;

    const heat = L.heatLayer(heatPoints, {
      radius: 14,
      blur: 12,
      maxZoom: 15,
      minOpacity: 0.12,
      gradient: {
        0.0: "#00000000",
        0.3: "#84cc1625",
        0.5: "#84cc1650",
        0.7: "#a3e63580",
        0.9: "#facc15a0",
        1.0: "#facc15c0",
      },
    });

    heatLayerRef.current = heat;
    heat.addTo(map);
    heatVisibleRef.current = true;
  }, [heatPoints]);

  // Rebuild rated markers only when data changes (NOT on zoom/pan)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    ratedGroupRef.current.clearLayers();

    locations.forEach((loc) => {
      const entry = ratedLocationIds.get(loc.id);
      if (!entry) return; // Skip unrated — heatmap covers them

      const { lat, lng } = loc.coordinates;

      if (entry.positive) {
        const marker = L.marker([lat, lng], {
          icon: getEmojiIcon("🔥", 28),
          title: loc.name,
          zIndexOffset: 100,
        });
        marker.on("click", () => onLocationClickRef.current(loc));
        ratedGroupRef.current.addLayer(marker);
      } else {
        const circle = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: "#84cc16",
          fillOpacity: 0.7,
          color: "#facc15",
          weight: 1.5,
        });
        circle.on("click", () => onLocationClickRef.current(loc));
        ratedGroupRef.current.addLayer(circle);
      }
    });
  }, [locations, ratedLocationIds]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;
