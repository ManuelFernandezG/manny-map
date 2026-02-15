import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/data/mockData";
import type { RatedEntry } from "@/lib/userId";

interface MapViewProps {
  locations: Location[];
  center: [number, number];
  zoom: number;
  ratedLocationIds: Map<string, RatedEntry>;
  onLocationClick: (location: Location) => void;
  onMapClick: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
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

  // Layer group for all markers
  const markersGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Refs for callbacks
  const onLocationClickRef = useRef(onLocationClick);
  onLocationClickRef.current = onLocationClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;

  // Emit bounds to parent via rAF
  const emitBounds = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const map = mapRef.current;
      if (!map) return;
      const b = map.getBounds();
      onBoundsChangeRef.current?.([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    });
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

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: '&copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    map.on("moveend", emitBounds);
    map.on("zoomend", emitBounds);

    // Add markers layer group
    markersGroupRef.current.addTo(map);

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

  // Rebuild markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersGroupRef.current.clearLayers();

    locations.forEach((loc) => {
      const { lat, lng } = loc.coordinates;
      const entry = ratedLocationIds.get(loc.id);
      const isRated = !!entry;

      const circle = L.circleMarker([lat, lng], {
        radius: isRated ? 7 : 5,
        fillColor: isRated ? "#8FBF8F" : "#84cc16",
        fillOpacity: isRated ? 0.9 : 0.5,
        color: isRated ? "#C5DFC5" : "#2D5F2D",
        weight: isRated ? 2 : 1,
      });
      circle.on("click", () => onLocationClickRef.current(loc));
      markersGroupRef.current.addLayer(circle);
    });
  }, [locations, ratedLocationIds]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;
