import { useEffect, useRef, useCallback, useState } from "react";
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

function createClusterIcon(count: number, zoom: number) {
  const baseSize = 40;
  const scaleFactor = Math.max(1, (zoom - 10) / 3);
  const size = Math.round(baseSize + scaleFactor * 20);
  const fontSize = Math.round(12 + scaleFactor * 4);

  return L.divIcon({
    className: "cluster-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        font-weight: bold;
        font-size: ${fontSize}px;
        border: 3px solid #facc15;
        box-shadow: 0 4px 12px rgba(132, 204, 22, 0.4), inset 0 1px 0 rgba(255,255,255,0.3);
        font-family: 'Outfit', sans-serif;
      ">
        ${count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

interface Cluster {
  lat: number;
  lng: number;
  locations: Location[];
}

function getClustersForZoom(locations: Location[], zoom: number): Cluster[] {
  if (zoom >= 15) {
    // High zoom - no clustering
    return locations.map((loc) => ({
      lat: loc.coordinates.lat,
      lng: loc.coordinates.lng,
      locations: [loc],
    }));
  }

  if (zoom >= 13) {
    // Medium zoom - loose clustering
    const clusters: Cluster[] = [];
    const processed = new Set<string>();

    locations.forEach((location) => {
      const key = location.id;
      if (processed.has(key)) return;

      const cluster: Cluster = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        locations: [location],
      };

      locations.forEach((other) => {
        if (other.id === location.id) return;
        if (processed.has(other.id)) return;

        const latDiff = Math.abs(other.coordinates.lat - location.coordinates.lat);
        const lngDiff = Math.abs(other.coordinates.lng - location.coordinates.lng);

        if (latDiff < 0.005 && lngDiff < 0.005) {
          cluster.locations.push(other);
          processed.add(other.id);
        }
      });

      clusters.push(cluster);
      processed.add(key);
    });

    return clusters;
  }

  // Low zoom - aggressive clustering
  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  locations.forEach((location) => {
    const key = location.id;
    if (processed.has(key)) return;

    const cluster: Cluster = {
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
      locations: [location],
    };

    locations.forEach((other) => {
      if (other.id === location.id) return;
      if (processed.has(other.id)) return;

      const latDiff = Math.abs(other.coordinates.lat - location.coordinates.lat);
      const lngDiff = Math.abs(other.coordinates.lng - location.coordinates.lng);

      if (latDiff < 0.015 && lngDiff < 0.015) {
        cluster.locations.push(other);
        processed.add(other.id);
      }
    });

    clusters.push(cluster);
    processed.add(key);
  });

  return clusters;
}

const MapView = ({ locations, center, zoom, onLocationClick, onMapClick }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const lastCenterRef = useRef(center);
  const lastZoomRef = useRef(zoom);

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

    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;
    lastCenterRef.current = center;
    lastZoomRef.current = zoom;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center/zoom only when city changes
  useEffect(() => {
    if (mapRef.current && (center !== lastCenterRef.current || zoom !== lastZoomRef.current)) {
      mapRef.current.setView(center, zoom, { animate: true, duration: 0.5 });
      lastCenterRef.current = center;
      lastZoomRef.current = zoom;
      setCurrentZoom(zoom);
    }
  }, [center, zoom]);

  // Update markers with clustering
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Get clusters for current zoom
    const clusters = getClustersForZoom(locations, currentZoom);

    // Add markers
    clusters.forEach((cluster) => {
      let marker: L.Marker;

      if (cluster.locations.length === 1) {
        // Single location - show emoji
        const loc = cluster.locations[0];
        const emojiSize = Math.max(30, Math.min(50, 30 + (currentZoom - 10) * 3));

        marker = L.marker([cluster.lat, cluster.lng], {
          icon: createEmojiIcon(loc.dominantEmoji, emojiSize),
          title: loc.name,
        })
          .addTo(mapRef.current!)
          .bindPopup(
            `<div style="font-family: Outfit, sans-serif; font-weight: 600; color: #000;">${escapeHtml(loc.name)}</div>
             <div style="font-size: 13px; color: #666;">${escapeHtml(loc.dominantEmoji)} ${escapeHtml(loc.dominantWord)} · ${loc.totalRatings} ratings</div>`
          )
          .on("click", () => onLocationClick(loc));
      } else {
        // Multiple locations - show cluster
        marker = L.marker([cluster.lat, cluster.lng], {
          icon: createClusterIcon(cluster.locations.length, currentZoom),
          title: `${cluster.locations.length} locations`,
        })
          .addTo(mapRef.current!)
          .bindPopup(
            `<div style="font-family: Outfit, sans-serif;">
              <strong>${cluster.locations.length} locations nearby</strong>
              <div style="margin-top: 8px; max-height: 150px; overflow-y: auto;">
                ${cluster.locations
                  .map(
                    (loc) =>
                      `<div style="padding: 4px; border-bottom: 1px solid #eee; cursor: pointer; font-size: 12px;">
                        <strong>${escapeHtml(loc.name)}</strong><br/>
                        <span style="color: #999;">${escapeHtml(loc.category)}</span>
                      </div>`
                  )
                  .join("")}
              </div>
            </div>`
          );

        // Allow clicking on individual locations in cluster popup
        marker.on("popupopen", () => {
          setTimeout(() => {
            const popup = marker.getPopup();
            if (popup) {
              const content = popup.getContent();
              // Check if content is an HTMLElement (not a string)
              if (content && typeof content !== 'string' && content instanceof HTMLElement) {
                const locationDivs = content.querySelectorAll(
                  'div[style*="padding: 4px"]'
                );
                locationDivs.forEach((div, idx) => {
                  (div as HTMLElement).style.cursor = "pointer";
                  (div as HTMLElement).onclick = () => {
                    onLocationClick(cluster.locations[idx]);
                  };
                });
              }
            }
          }, 0);
        });
      }

      markersRef.current.push(marker);
    });
  }, [locations, currentZoom, onLocationClick]);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default MapView;