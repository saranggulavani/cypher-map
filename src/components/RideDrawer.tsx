import {
  Activity,
  ChevronUp,
  Clock,
  Instagram,
  Navigation,
  Share2,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useEffect, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";
import TacticalRoute from "./TacticalRoute";
import type { Ride } from "../types";

const TOP_SAFE_AREA = 105;
const DRAWER_PEEK_HEIGHT = 380;

export default function RideDrawer({
  ride,
  setActiveRide,
}: {
  ride: Ride | null;
  setActiveRide: (r: Ride | null) => void;
}) {
  const controls = useAnimation();
  const [displayRide, setDisplayRide] = useState<Ride | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [snapState, setSnapState] = useState<"standard" | "expanded">(
    "standard",
  );

  useEffect(() => {
    if (ride) {
      setDisplayRide(ride);
      setSnapState("standard");
      controls.start("standard");
    } else {
      controls.start("closed").then(() => setDisplayRide(null));
    }
  }, [ride, controls]);

  const handleShare = async () => {
    if (!displayRide) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?ride=${displayRide.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `RoamingCypher | ${displayRide.title}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback for Desktop/Non-supported browsers
    if (await copyToClipboard(shareUrl)) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const isExpanding = info.offset.y < -60 || info.velocity.y < -500;
    const isCollapsing = info.offset.y > 60 || info.velocity.y > 500;

    if (snapState === "standard") {
      isExpanding
        ? (setSnapState("expanded"), controls.start("expanded"))
        : isCollapsing
          ? setActiveRide(null)
          : controls.start("standard");
    } else {
      isCollapsing
        ? (setSnapState("standard"), controls.start("standard"))
        : controls.start("expanded");
    }
  };

  return (
    <>
      <AnimatePresence>
        {ride && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveRide(null)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={{
          closed: { y: "100%", opacity: 0 },
          standard: {
            y: `calc(100vh - ${DRAWER_PEEK_HEIGHT}px)`,
            opacity: 0.95,
          },
          expanded: { y: TOP_SAFE_AREA, opacity: 1 },
        }}
        initial="closed"
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[2.5rem] border-t border-white/5 p-6 md:mx-auto md:max-w-md shadow-[0_-20px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500
          ${snapState === "expanded" ? "bg-[#0D0D0D]" : "bg-[#0D0D0D]/95 backdrop-blur-3xl"}
        `}
        style={{ height: `calc(100vh - ${TOP_SAFE_AREA}px)` }}
      >
        {/* DRAG HANDLE & HUD HINT */}
        <div className="flex flex-col items-center mb-6 shrink-0">
          <AnimatePresence>
            {snapState === "standard" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex flex-col items-center gap-1 mb-2"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
                  Swipe for Details
                </span>
                <ChevronUp size={10} className="text-white animate-bounce" />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-1 w-12 rounded-full bg-white/10" />
        </div>

        {displayRide && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0 relative">
              {/* TOAST FALLBACK */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ opacity: 1, y: -20, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                    className="absolute -top-12 left-1/2 z-[100] rounded-full bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-background shadow-[0_10px_30px_rgba(255,194,14,0.4)]"
                  >
                    Copied to Clipboard
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-white tracking-tight truncate uppercase leading-none">
                    {displayRide.title}
                  </h2>
                  <p className="text-primary text-[9px] font-black mt-2 uppercase tracking-[0.25em] opacity-80">
                    {displayRide.bike}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all text-white/40 hover:text-white"
                  >
                    <Share2 size={15} />
                  </button>
                  {displayRide.googleMapUrl && (
                    <a
                      href={displayRide.googleMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg"
                        alt="Maps"
                        className="w-5 h-5"
                      />
                    </a>
                  )}
                </div>
              </div>

              {/* HUD STATS */}
              <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-5 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <Navigation size={14} className="text-white/20" />
                  <span className="text-[10px] font-bold text-white/90">
                    {displayRide.stats.distance}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 border-x border-white/5">
                  <Clock size={14} className="text-white/20" />
                  <span className="text-[10px] font-bold text-white/90">
                    {displayRide.stats.duration}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Activity size={14} className="text-white/20" />
                  <span className="text-[10px] font-bold text-white/90 uppercase">
                    {displayRide.stats.type}
                  </span>
                </div>
              </div>
            </div>

            {/* EXPANDED CONTENT */}
            <div
              className={`flex-1 overflow-y-auto pt-4 pb-32 custom-scrollbar transition-opacity duration-300 ${snapState === "standard" ? "opacity-10 pointer-events-none" : "opacity-100"}`}
            >
              <div className="space-y-12">
                <TacticalRoute waypoints={displayRide.waypoints} />

                {/* CALLS TO ACTION */}
                <div className="flex flex-col gap-2.5 pb-10">
                  {displayRide.links?.instagram && (
                    <a
                      href={displayRide.links.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.03] border border-white/5 py-4 text-[10px] font-black tracking-widest text-white/40 hover:text-white uppercase"
                    >
                      <Instagram size={14} /> Watch{" "}
                      {/* Added ?. to safely read the type, fallback to "Reel" */}
                      {displayRide.contentType?.instagram || "Reel"}
                    </a>
                  )}
                  {displayRide.links?.youtube && (
                    <a
                      href={displayRide.links.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.03] border border-white/5 py-4 text-[10px] font-black tracking-widest text-white/40 hover:text-white uppercase"
                    >
                      <Youtube size={14} /> Full{" "}
                      {/* Added ?. to safely read the type, fallback to "Video" */}
                      {displayRide.contentType?.youtube || "Video"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
