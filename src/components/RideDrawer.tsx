import { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "motion/react";
import {
  Youtube,
  Instagram,
  Navigation,
  Clock,
  Activity,
  Share2,
} from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";
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
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (ride) {
      setDisplayRide(ride);
      controls.start({ y: 0 });
    } else {
      controls.start({ y: "100%" }).then(() => setDisplayRide(null));
    }
  }, [ride, controls]);

  const handleShare = async () => {
    if (!displayRide) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?ride=${displayRide.id}`;

    // Data for the native share sheet
    const shareData = {
      title: `RoamingCypher | ${displayRide.title}`,
      text: `Check out this ride: ${displayRide.title} on the ${displayRide.bike}`,
      url: shareUrl,
    };

    // 1. Try Native Share API (iOS/Android/Safari)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return; // Success! The OS handles the UI, so no toast needed.
      } catch (err) {
        // If user simply cancelled the share sheet, do nothing
        if ((err as Error).name === "AbortError") return;
        console.error("Native share failed:", err);
      }
    }

    // 2. Fallback: Clipboard Utility
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[4px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: "100%" }}
        animate={controls}
        drag="y"
        dragConstraints={{ top: 0, bottom: 500 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => info.offset.y > 80 && setActiveRide(null)}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[2.5rem] border-t border-white/5 bg-[#0D0D0D]/95 p-6 backdrop-blur-3xl md:mx-auto md:max-w-md pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
      >
        <div
          onClick={() => setActiveRide(null)}
          className="mx-auto mb-8 h-1 w-10 rounded-full bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
        />

        {displayRide && (
          <div className="flex flex-col relative">
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: "-50%" }}
                  animate={{ opacity: 1, y: -20, x: "-50%" }}
                  exit={{ opacity: 0, y: 10, x: "-50%" }}
                  className="absolute -top-12 left-1/2 z-[100] rounded-full bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-background shadow-[0_10px_30px_rgba(255,194,14,0.4)] whitespace-nowrap"
                >
                  Link Copied!
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all hover:bg-white/10 active:scale-90 text-white/40 hover:text-white"
                >
                  <Share2 size={15} />
                </button>

                {displayRide.googleMapUrl && (
                  <a
                    href={displayRide.googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all hover:bg-white/10 active:scale-90"
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

            <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-5 mb-8">
              <div className="flex flex-col items-center gap-2">
                <Navigation size={14} className="text-white/20" />
                <span className="text-[10px] font-bold text-white/90 tabular-nums">
                  {displayRide.stats.distance}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 border-x border-white/5">
                <Clock size={14} className="text-white/20" />
                <span className="text-[10px] font-bold text-white/90 tabular-nums">
                  {displayRide.stats.duration}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Activity size={14} className="text-white/20" />
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">
                  {displayRide.stats.type}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {displayRide.links.instagram && (
                <a
                  href={displayRide.links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.03] border border-white/5 py-4 text-[10px] font-black tracking-widest text-white/40 transition-all hover:bg-white/10 hover:text-white active:scale-95 uppercase"
                >
                  <Instagram size={14} className="opacity-40" />
                  Watch {displayRide.contentType.instagram ?? "Reel"}
                </a>
              )}

              {displayRide.links.youtube && (
                <a
                  href={displayRide.links.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 rounded-2xl bg-white/[0.03] border border-white/5 py-4 text-[10px] font-black tracking-widest text-white/40 transition-all hover:bg-white/10 hover:text-white active:scale-95 uppercase"
                >
                  <Youtube size={14} className="opacity-40" />
                  Full {displayRide.contentType.youtube ?? "POV"}
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
