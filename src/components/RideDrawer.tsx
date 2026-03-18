import { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { Youtube, Instagram, Navigation, Clock, Activity } from "lucide-react";
import type { Ride } from "../data/rides";

export default function RideDrawer({
  ride,
  setActiveRide,
}: {
  ride: Ride | null;
  setActiveRide: (r: Ride | null) => void;
}) {
  const controls = useAnimation();
  const [displayRide, setDisplayRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (ride) {
      setDisplayRide(ride);
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "100%" });
    }
  }, [ride, controls]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0, bottom: 500 }}
      onDragEnd={(_, info) => info.offset.y > 100 && setActiveRide(null)}
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl border-t border-white/10 bg-surface/90 p-6 backdrop-blur-xl md:mx-auto md:max-w-md pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
    >
      <div
        onClick={() => setActiveRide(null)}
        className="mx-auto mb-6 h-1 w-12 rounded-full bg-white/20 cursor-pointer"
      />

      {displayRide && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {displayRide.title}
            </h2>
            <p className="text-primary text-sm font-medium mt-1 uppercase tracking-wider">
              {displayRide.bike}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-4">
            <div className="flex flex-col items-center gap-1">
              <Navigation size={18} className="text-text-muted" />
              <span className="text-xs font-bold">
                {displayRide.stats.distance}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-white/5">
              <Clock size={18} className="text-text-muted" />
              <span className="text-xs font-bold">
                {displayRide.stats.duration}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Activity size={18} className="text-text-muted" />
              <span className="text-xs font-bold">
                {displayRide.stats.type}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {displayRide.links.instagram && (
              <a
                href={displayRide.links.instagram}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-background transition-transform active:scale-95"
              >
                <Instagram size={18} strokeWidth={3} /> Watch Reel
              </a>
            )}
            {displayRide.links.youtube && (
              <a
                href={displayRide.links.youtube}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-white transition-transform active:scale-95"
              >
                <Youtube size={18} strokeWidth={3} /> Full POV
              </a>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
