import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";

import Header from "./components/Header";
import LoadingScreen from "./components/LoadingScreen";
import MapNavigator from "./components/MapNavigator";
import MissionHint from "./components/MissionHint";
import RideDrawer from "./components/RideDrawer";
import RideList from "./components/RideList";
import RideMap from "./components/RideMap";

import { useRides } from "./hooks/useRides";
import RoamingRides from "./pages/RoamingRides";
import type { Ride } from "./types";

export default function App() {
  const { rides, loading: dbLoading, error } = useRides();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isListOpen, setIsListOpen] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [path, setPath] = useState(window.location.pathname);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const isInitialSync = useRef(true);

  const isAppLoading = dbLoading || isMapLoading;

  // Sync Path for simple routing
  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Sync Hint Interaction
  useEffect(() => {
    if (activeRide || isListOpen) {
      setHasInteracted(true);
    }
  }, [activeRide, isListOpen]);

  // --- 1. DEEP LINKING LOGIC (Fixed) ---
  useEffect(() => {
    // GUARD: Only run if DB is loaded AND we haven't synced yet
    if (dbLoading || rides.length === 0 || !isInitialSync.current) return;

    const params = new URLSearchParams(window.location.search);
    const rideId = params.get("ride");

    if (rideId) {
      const matchedRide = rides.find((r) => r.id === rideId);
      if (matchedRide) {
        // Reduced timeout so it feels snappier
        setTimeout(() => setActiveRide(matchedRide), 500);
      }
    }

    // LOCK THE GATE: Never run this initial sync again
    isInitialSync.current = false;

    // CRITICAL: Removed activeRide from dependencies so it doesn't loop
  }, [dbLoading, rides]);

  // URL State Sync
  useEffect(() => {
    if (isInitialSync.current || dbLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (activeRide) {
      params.set("ride", activeRide.id);
      document.title = `Cypher Map | ${activeRide.title}`;
    } else {
      params.delete("ride");
      document.title = "Cypher Map";
    }
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`,
    );
  }, [activeRide, dbLoading]);

  // Route: Mission Control
  if (path === "/roaming-rides") {
    return <RoamingRides />;
  }

  // Error State
  if (error)
    return (
      <div className="bg-black text-primary p-10 font-mono h-screen flex items-center justify-center">
        SYSTEM_FAILURE: {error}
      </div>
    );

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
      <AnimatePresence>
        {isAppLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <Header
        onToggleList={() => setIsListOpen(!isListOpen)}
        isListOpen={isListOpen}
      />

      {/* interaction logic is safe here now */}
      <MissionHint active={!isAppLoading && !hasInteracted} />

      <AnimatePresence>
        {isListOpen && (
          <RideList
            rides={rides}
            onClose={() => setIsListOpen(false)}
            onSelect={(r) => {
              setActiveRide(r);
              setIsListOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {!isAppLoading && (
        <MapNavigator
          bearing={bearing}
          onReset={() => mapRef.current?.easeTo({ bearing: 0, duration: 1000 })}
        />
      )}

      <RideMap
        activeRide={activeRide}
        setActiveRide={setActiveRide}
        rides={rides}
        onReady={() => setIsMapLoading(false)}
        setBearing={setBearing}
        mapRef={mapRef}
      />

      <RideDrawer ride={activeRide} setActiveRide={setActiveRide} />
    </main>
  );
}
