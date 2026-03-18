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
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
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
  const HOME_BASE: [number, number] = [73.81491388052238, 18.50748744146906];

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
      // Home Base Marker
      const homeEl = document.createElement("div");
      homeEl.className = "flex h-10 w-10 items-center justify-center";
      homeEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-8 w-8 rounded-full bg-primary/20 animate-ping"></div>
          <div class="relative h-4 w-4 rounded-full bg-white border-4 border-primary shadow-2xl"></div>
        </div>
      `;
      new maplibregl.Marker({ element: homeEl })
        .setLngLat(HOME_BASE)
        .addTo(mapRef.current!);

      // Ride Markers
      rides.forEach((ride) => {
        const el = document.createElement("div");
        el.className =
          "relative flex h-8 w-8 items-center justify-center cursor-pointer";
        el.innerHTML = `
          <div class="absolute inset-0 rounded-full bg-primary/40 animate-ping-slow"></div>
          <div class="relative h-3 w-3 rounded-full bg-primary border-2 border-background shadow-lg"></div>
        `;
        el.onclick = (e) => {
          e.stopPropagation();
          setActiveRide(ride);
        };
        new maplibregl.Marker({ element: el })
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

    mapRef.current.flyTo({
      center: flipCoords(activeRide.coordinates),
      zoom: 14.5,
      pitch: 60,
      speed: 1.2,
      curve: 1.42,
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
