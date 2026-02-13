import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/data/mockData";

interface MapViewProps {
  locations: Location[];
  center: [number, number];
  zoom: number;
  onLocationClick: (location: Location) => void;
  onMapClick: (lat: number, lng: number) => void;
}

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    className: "emoji-marker",
    html: emoji,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

const MapView = ({ locations, center, zoom, onLocationClick, onMapClick }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center/zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((loc) => {
      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
        icon: createEmojiIcon(loc.dominantEmoji),
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-family: Outfit, sans-serif; font-weight: 600;">${loc.name}</div>
           <div style="font-size: 13px;">${loc.dominantEmoji} ${loc.dominantWord} · ${loc.totalRatings} ratings</div>`
        )
        .on("click", () => onLocationClick(loc));

      markersRef.current.push(marker);
    });
  }, [locations, onLocationClick]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;
