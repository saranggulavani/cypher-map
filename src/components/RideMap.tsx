import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Ride } from "../types";

interface RideMapProps {
  activeRide: Ride | null;
  setActiveRide: (ride: Ride | null) => void;
  rides: Ride[];
  onReady: () => void;
  setBearing: (bearing: number) => void;
  mapRef: React.RefObject<maplibregl.Map | null>;
}

export default function RideMap({
  activeRide,
  setActiveRide,
  rides,
  onReady,
  setBearing,
  mapRef,
}: RideMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]); // Track markers to clear them

  const HOME_BASE: [number, number] = [73.80736063585866, 18.50744535043496];
  const flipCoords = (coords: [number, number]): [number, number] => [
    coords[1],
    coords[0],
  ];

  // --- 1. INITIALIZATION (Run once) ---
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: HOME_BASE,
      zoom: 11,
      pitch: 45,
      attributionControl: false,
    });

    mapRef.current.once("idle", () => onReady());

    mapRef.current.on("load", () => {
      // Setup empty sources first
      mapRef.current?.addSource("ride-paths", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      mapRef.current?.addSource("ride-glow-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Add layers (styles stay same as before)
      mapRef.current?.addLayer({
        id: "path-glow",
        type: "line",
        source: "ride-paths",
        paint: {
          "line-color": "#ffc20e",
          "line-width": 2,
          "line-opacity": 0.15,
          "line-blur": 3,
        },
      });
      mapRef.current?.addLayer({
        id: "path-core",
        type: "line",
        source: "ride-paths",
        paint: {
          "line-color": "#ffc20e",
          "line-width": 1,
          "line-opacity": 0.3,
        },
      });
      mapRef.current?.addLayer({
        id: "ride-glow-layer",
        type: "circle",
        source: "ride-glow-source",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            7,
            15,
            10,
            40,
            13,
            125,
          ],
          "circle-color": "#ffc20e",
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            0.15,
            14,
            0.02,
          ],
          "circle-blur": 1,
        },
      });

      // Add Home Marker once
      const homeEl = document.createElement("div");
      homeEl.className = "relative flex h-10 w-10 items-center justify-center";
      homeEl.innerHTML = `<div class="relative flex h-12 w-12 items-center justify-center"><div class="absolute h-10 w-10 rounded-full border border-primary/20 animate-[ping_3s_linear_infinite]"></div><div class="absolute h-6 w-6 rounded-full border border-primary/40 bg-primary/5"></div><div class="relative h-3 w-3 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,194,14,0.6)]"><div class="h-1 w-1 rounded-full bg-white animate-pulse"></div></div></div>`;
      new maplibregl.Marker({ element: homeEl })
        .setLngLat(HOME_BASE)
        .addTo(mapRef.current!);
    });

    mapRef.current.on("rotate", () =>
      setBearing(mapRef.current?.getBearing() || 0),
    );
    mapRef.current.on("click", () => setActiveRide(null));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // --- 2. DATA WATCHER (Atomic Sync) ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const syncMissions = () => {
      // 1. Verify custom sources exist. If not, wait for the 'load' event!
      if (!map.getSource("ride-paths")) {
        console.log(
          "SYNC_PAUSED: Waiting for core map layers to initialize...",
        );
        map.once("load", syncMissions);
        return;
      }

      // 2. Clear stale markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (rides.length === 0) return;

      // 3. Update GeoJSON Sources (Lines and Auras)
      const pathSource = map.getSource(
        "ride-paths",
      ) as maplibregl.GeoJSONSource;
      const glowSource = map.getSource(
        "ride-glow-source",
      ) as maplibregl.GeoJSONSource;

      if (pathSource) {
        pathSource.setData({
          type: "FeatureCollection",
          features: rides.map((r) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [HOME_BASE, flipCoords(r.coordinates)],
            },
            properties: {},
          })),
        });
      }

      if (glowSource) {
        glowSource.setData({
          type: "FeatureCollection",
          features: rides.map((r) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: flipCoords(r.coordinates) },
            properties: {},
          })),
        });
      }

      // 4. Force Marker Deployment
      rides.forEach((ride) => {
        const el = document.createElement("div");
        el.className =
          "group relative flex h-6 w-4 items-center justify-center cursor-pointer";
        el.innerHTML = `
        <div class="absolute bottom-0 h-1 w-1 rounded-full bg-primary/40 blur-[1px] animate-pulse"></div>
        <div class="relative transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
          <svg width="14" height="18" viewBox="0 0 24 32" fill="none">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#ffc20e" />
            <circle cx="12" cy="12" r="5" fill="#0D0D0D" />
          </svg>
        </div>
      `;

        el.onclick = (e) => {
          e.stopPropagation();
          setActiveRide(ride);
        };

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(flipCoords(ride.coordinates))
          .addTo(map);

        markersRef.current.push(marker);
      });

      console.log(`MISSION_SYNC_COMPLETE: ${rides.length} MARKERS ACTIVE`);
    };

    syncMissions();
  }, [rides, setActiveRide]); // Re-runs every time Supabase returns a fresh 'rides' array// Re-runs every time 'rides' array updates from Supabase

  // --- 3. CAMERA MOVEMENT ---
  useEffect(() => {
    if (!activeRide || !mapRef.current) return;
    mapRef.current.flyTo({
      center: flipCoords(activeRide.coordinates),
      zoom: 14,
      pitch: 65,
      speed: 0.8,
      essential: true,
    });
  }, [activeRide, mapRef]);

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
