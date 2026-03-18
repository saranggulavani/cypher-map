import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      <div className="relative flex flex-col items-center gap-4">
        {/* Pulsing Outer Ring */}
        <div className="absolute h-20 w-20 animate-ping rounded-full border-2 border-primary/20" />

        {/* Spinning Icon */}
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          strokeWidth={3}
        />

        <div className="flex flex-col items-center">
          <span className="font-sans text-xs font-black uppercase tracking-[0.3em] text-primary">
            Initializing Map
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-text-muted">
            Fetching Terrain Data...
          </span>
        </div>
      </div>
    </motion.div>
  );
}
