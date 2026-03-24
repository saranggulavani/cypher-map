import maplibregl from "maplibre-gl";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

import AdminGate from "./components/AdminGate"; // ADDED
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
  const [isGateOpen, setIsGateOpen] = useState(false); // ADDED
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
    if (activeRide) {
      setHasInteracted(true);
    }
  }, [activeRide]);

  // --- 1. DEEP LINKING LOGIC ---
  useEffect(() => {
    if (dbLoading || rides.length === 0 || !isInitialSync.current) return;
    const params = new URLSearchParams(window.location.search);
    const rideId = params.get("ride");
    if (rideId) {
      const matchedRide = rides.find((r) => r.id === rideId);
      if (matchedRide) {
        setTimeout(() => setActiveRide(matchedRide), 500);
      }
    }
    isInitialSync.current = false;
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

  // --- 2. PROTECTED ROUTE CHECK ---
  if (path === "/roaming-rides") {
    const hasAccess = sessionStorage.getItem("vault_access") === "granted";

    // If no access, force the path back to home and return nothing
    if (!hasAccess) {
      window.location.pathname = "/";
      return null;
    }

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
        onOpenGate={() => setIsGateOpen(true)} // ADDED: Pass this to your Header
      />

      <AdminGate
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onOpenVault={() => {
          setIsGateOpen(false);
          setPath("/roaming-rides");
          window.history.pushState(null, "", "/roaming-rides");
        }}
      />

      <MissionHint active={!isAppLoading && !hasInteracted && !isListOpen} />

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
