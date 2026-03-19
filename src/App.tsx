import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import Header from "./components/Header";
import RideMap from "./components/RideMap";
import RideDrawer from "./components/RideDrawer";
import LoadingScreen from "./components/LoadingScreen";
import MapNavigator from "./components/MapNavigator";
import RideList from "./components/RideList";
import { rides, type Ride } from "./data/rides";
import MissionHint from "./components/MissionHint";

export default function App() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListOpen, setIsListOpen] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const isInitialSync = useRef(true);

  const memoizedRides = useMemo(() => rides, []);

  // --- 1. DEEP LINKING LOGIC ---

  // Sync URL to State (Initial Load)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rideId = params.get("ride");

    if (rideId && !activeRide) {
      const matchedRide = memoizedRides.find((r) => r.id === rideId);
      if (matchedRide) {
        // Increase timeout slightly to ensure MapLibre is in the DOM
        const timer = setTimeout(() => {
          setActiveRide(matchedRide);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }

    isInitialSync.current = false;
  }, [memoizedRides]);

  // Sync State to URL & Document Title
  useEffect(() => {
    // CRITICAL: If we haven't finished checking the URL on mount,
    // do NOT update the history yet.
    if (isInitialSync.current) return;

    const params = new URLSearchParams(window.location.search);

    if (activeRide) {
      params.set("ride", activeRide.id);
      document.title = `Cypher Map | ${activeRide.title}`;
    } else {
      params.delete("ride");
      document.title = "Cypher Map";
    }

    const newURL = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;

    // Use replaceState to keep history clean
    window.history.replaceState(null, "", newURL);
  }, [activeRide]);

  // Logic: Hide hint once a ride is selected or list is opened
  useEffect(() => {
    if (activeRide || isListOpen) {
      setHasInteracted(true);
    }
  }, [activeRide, isListOpen]);

  const toggleList = useCallback(() => {
    setIsListOpen((prev) => !prev);
  }, []);

  const handleRideSelect = useCallback((ride: Ride) => {
    setIsListOpen(false);
    setActiveRide(ride);
  }, []);

  const resetNorth = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, duration: 1000 });
  }, []);

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <Header onToggleList={toggleList} isListOpen={isListOpen} />

      <MissionHint active={!isLoading && !hasInteracted} />

      <AnimatePresence>
        {isListOpen && (
          <RideList
            rides={memoizedRides}
            onClose={() => setIsListOpen(false)}
            onSelect={handleRideSelect}
          />
        )}
      </AnimatePresence>

      {!isLoading && <MapNavigator bearing={bearing} onReset={resetNorth} />}

      <RideMap
        activeRide={activeRide}
        setActiveRide={setActiveRide}
        rides={memoizedRides}
        onReady={() => setIsLoading(false)}
        setBearing={setBearing}
        mapRef={mapRef}
      />

      <RideDrawer ride={activeRide} setActiveRide={setActiveRide} />
    </main>
  );
}
