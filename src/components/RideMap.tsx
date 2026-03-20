import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Ride } from "../data/rides";

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
  const markersAdded = useRef(false);

  // Home Base Coordinates (Pune)
  const HOME_BASE: [number, number] = [73.80736063585866, 18.50744535043496];

  // Helper: Google [Lat, Lng] -> MapLibre [Lng, Lat]
  const flipCoords = (coords: [number, number]): [number, number] => [
    coords[1],
    coords[0],
  ];

  // --- 1. INITIALIZATION ---
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
      if (markersAdded.current || !mapRef.current) return;
      markersAdded.current = true;

      // --- A. HUB AND SPOKE PATHS ---
      mapRef.current.addSource("ride-paths", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: rides.map((ride) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [HOME_BASE, flipCoords(ride.coordinates)],
            },
            properties: {},
          })),
        },
      });

      // Path Glow (Neon Effect)
      mapRef.current.addLayer({
        id: "path-glow",
        type: "line",
        source: "ride-paths",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#ffc20e",
          "line-width": 2,
          "line-opacity": 0.15,
          "line-blur": 3,
        },
      });

      // Path Core (Sharp line)
      mapRef.current.addLayer({
        id: "path-core",
        type: "line",
        source: "ride-paths",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#ffc20e",
          "line-width": 1,
          "line-opacity": 0.3,
        },
      });

      // --- B. RIDE GLOW (10KM Aura) ---
      mapRef.current.addSource("ride-glow-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: rides.map((ride) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: flipCoords(ride.coordinates),
            },
            properties: {},
          })),
        },
      });

      mapRef.current.addLayer({
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

      // --- C. MARKERS (Home + Rides) ---
      // 1. HOME BASE MARKER (PUNE HUB)
      const homeEl = document.createElement("div");
      // Footprint is slightly larger than destination pins to anchor the lines
      homeEl.className = "relative flex h-10 w-10 items-center justify-center";

      homeEl.innerHTML = `
  <div class="relative flex h-12 w-12 items-center justify-center">
    <div class="absolute h-10 w-10 rounded-full border border-primary/20 animate-[ping_3s_linear_infinite]"></div>
    
    <div class="absolute h-6 w-6 rounded-full border border-primary/40 bg-primary/5"></div>
    
    <div class="relative h-3 w-3 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(255,194,14,0.6)]">
      <div class="h-1 w-1 rounded-full bg-white animate-pulse"></div>
    </div>
  </div>
`;

      new maplibregl.Marker({ element: homeEl })
        .setLngLat(HOME_BASE)
        .addTo(mapRef.current!);
      // Ride Markers
      rides.forEach((ride) => {
        const el = document.createElement("div");
        // Reduced container size to match the new 14px pins
        el.className =
          "group relative flex h-6 w-4 items-center justify-center cursor-pointer";

        el.innerHTML = `
    <div class="absolute bottom-0 h-1 w-1 rounded-full bg-primary/40 blur-[1px] animate-pulse"></div>
    
    <div class="relative transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110">
      <svg width="14" height="18" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" 
          fill="#ffc20e" 
        />
        <circle cx="12" cy="12" r="5" fill="#0D0D0D" />
      </svg>
    </div>
  `;

        el.onclick = (e) => {
          e.stopPropagation();
          setActiveRide(ride);
        };

        new maplibregl.Marker({
          element: el,
          anchor: "bottom", // Keeps the sharp tip exactly on the coordinate
        })
          .setLngLat(flipCoords(ride.coordinates))
          .addTo(mapRef.current!);
      });

      mapRef.current.on("rotate", () =>
        setBearing(mapRef.current?.getBearing() || 0),
      );
      mapRef.current.on("click", () => setActiveRide(null));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersAdded.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. CAMERA MOVEMENT ---
  useEffect(() => {
    if (!activeRide || !mapRef.current) return;

    const performFly = () => {
      mapRef.current?.flyTo({
        center: flipCoords(activeRide.coordinates),
        zoom: 14,
        pitch: 65,
        speed: 0.8, // Slightly slower for that "Cinematic Arrival" feel
        curve: 1.42,
        essential: true,
      });
    };

    // If map is already loaded, fly immediately
    if (mapRef.current.loaded()) {
      performFly();
    } else {
      // If not loaded (Deep-link case), wait for the 'load' event
      mapRef.current.once("load", performFly);
    }
  }, [activeRide, mapRef]);

  return (
    <div className="relative h-full w-full bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
