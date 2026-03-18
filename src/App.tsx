import { useState, useRef, useCallback, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import maplibregl from "maplibre-gl";
import Header from "./components/Header";
import RideMap from "./components/RideMap";
import RideDrawer from "./components/RideDrawer";
import LoadingScreen from "./components/LoadingScreen";
import MapNavigator from "./components/MapNavigator";
import RideList from "./components/RideList";
import { rides, type Ride } from "./data/rides";

export default function App() {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListOpen, setIsListOpen] = useState(false);
  const [bearing, setBearing] = useState(0);

  const mapRef = useRef<maplibregl.Map | null>(null);

  // Memoize data to prevent RideMap from thinking the source changed
  const memoizedRides = useMemo(() => rides, []);

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
