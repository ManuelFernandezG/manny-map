import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { Location } from "@/data/mockData";

// Extend Leaflet types for the heat plugin
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
  ratedLocationIds: Set<string>;
  onLocationClick: (location: Location) => void;
  onMapClick: (lat: number, lng: number) => void;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function createEmojiIcon(emoji: string, size: number = 40) {
  return L.divIcon({
    className: "emoji-marker",
    html: `<div style="font-size: ${size}px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const MapView = ({
  locations,
  center,
  zoom,
  ratedLocationIds,
  onLocationClick,
  onMapClick,
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<(L.Marker | L.CircleMarker)[]>([]);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const lastCenterRef = useRef<[number, number]>(center);
  const lastZoomRef = useRef(zoom);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapState, setMapState] = useState<{
    zoom: number;
    bounds: [number, number, number, number] | null;
  }>({ zoom, bounds: null });

  // Zoom threshold: heatmap below this, individual circles at or above
  const CIRCLE_ZOOM_THRESHOLD = 15;

  // Split locations into rated and unrated
  const { ratedLocations, unratedLocations, heatPoints } = useMemo(() => {
    const rated: Location[] = [];
    const unrated: Location[] = [];
    const heat: [number, number, number][] = [];

    locations.forEach((loc) => {
      if (ratedLocationIds.has(loc.id)) {
        rated.push(loc);
      } else {
        unrated.push(loc);
      }
      // All locations contribute to the heatmap
      const intensity = Math.min(1, 0.3 + (loc.totalRatings / 20));
      heat.push([loc.coordinates.lat, loc.coordinates.lng, intensity]);
    });

    return { ratedLocations: rated, unratedLocations: unrated, heatPoints: heat };
  }, [locations, ratedLocationIds]);

  // Debounced update of map state (bounds + zoom) after user stops moving
  const scheduleUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      const b = map.getBounds();
      setMapState({
        zoom: map.getZoom(),
        bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      });
    }, 300);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    map.on("moveend", scheduleUpdate);
    map.on("zoomend", scheduleUpdate);

    mapRef.current = map;
    lastCenterRef.current = center;
    lastZoomRef.current = zoom;

    // Set initial bounds
    const b = map.getBounds();
    setMapState({
      zoom: map.getZoom(),
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update center/zoom only when city actually changes (value comparison, not reference)
  useEffect(() => {
    if (!mapRef.current) return;
    const [prevLat, prevLng] = lastCenterRef.current;
    const [newLat, newLng] = center;
    const zoomChanged = zoom !== lastZoomRef.current;
    const centerChanged = newLat !== prevLat || newLng !== prevLng;

    if (centerChanged || zoomChanged) {
      mapRef.current.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
      lastCenterRef.current = center;
      lastZoomRef.current = zoom;
    }
  }, [center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update heatmap layer when locations change; hide when zoomed in past threshold
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old heat layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Don't show heatmap at street-level zoom — circles take over
    if (heatPoints.length === 0 || (mapState.bounds && mapState.zoom >= CIRCLE_ZOOM_THRESHOLD)) return;

    // Lime-green gradient matching the app's brand
    const heat = L.heatLayer(heatPoints, {
      radius: 18,
      blur: 15,
      maxZoom: 15,
      minOpacity: 0.2,
      gradient: {
        0.0: "#00000000",
        0.2: "#84cc1640",
        0.4: "#84cc1680",
        0.6: "#a3e635b0",
        0.8: "#facc15d0",
        1.0: "#facc15",
      },
    });

    heat.addTo(mapRef.current);
    heatLayerRef.current = heat;
  }, [heatPoints, mapState.zoom]);

  // Render rated emoji markers always; render unrated circles only when zoomed in past threshold
  useEffect(() => {
    if (!mapRef.current || !mapState.bounds) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const [west, south, east, north] = mapState.bounds;
    const isInViewport = (lat: number, lng: number) =>
      lat >= south && lat <= north && lng >= west && lng <= east;

    // Rated locations: always show as emoji markers
    ratedLocations.forEach((loc) => {
      const { lat, lng } = loc.coordinates;
      if (!isInViewport(lat, lng)) return;

      const emojiSize = Math.max(36, Math.min(56, 36 + (mapState.zoom - 10) * 4));
      const marker = L.marker([lat, lng], {
        icon: createEmojiIcon(loc.dominantEmoji, emojiSize),
        title: loc.name,
        zIndexOffset: 100,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-family: Outfit, sans-serif; font-weight: 600; color: #000;">${escapeHtml(loc.name)}</div>
           <div style="font-size: 13px; color: #666;">${escapeHtml(loc.dominantEmoji)} ${escapeHtml(loc.dominantWord)} · ${loc.totalRatings} ratings</div>`
        )
        .on("click", () => onLocationClick(loc));

      markersRef.current.push(marker);
    });

    // Unrated locations: show as circles only when zoomed in (heatmap handles zoomed-out view)
    if (mapState.zoom >= CIRCLE_ZOOM_THRESHOLD) {
      unratedLocations.forEach((loc) => {
        const { lat, lng } = loc.coordinates;
        if (!isInViewport(lat, lng)) return;

        // Scale circle size with zoom: 5px at zoom 15, +2px per zoom level
        const circleRadius = 5 + (mapState.zoom - CIRCLE_ZOOM_THRESHOLD) * 2;
        const circle = L.circleMarker([lat, lng], {
          radius: circleRadius,
          fillColor: "#84cc16",
          fillOpacity: 0.7,
          color: "#facc15",
          weight: 2,
        })
          .addTo(mapRef.current!)
          .bindPopup(
            `<div style="font-family: Outfit, sans-serif; font-weight: 600; color: #000;">${escapeHtml(loc.name)}</div>
             <div style="font-size: 13px; color: #666;">${escapeHtml(loc.category)}</div>`
          )
          .on("click", () => onLocationClick(loc));

        markersRef.current.push(circle);
      });
    }
  }, [ratedLocations, unratedLocations, mapState, onLocationClick]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;
