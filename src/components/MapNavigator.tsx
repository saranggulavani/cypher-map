import { Compass } from "lucide-react";
import { motion } from "motion/react";

interface MapNavigatorProps {
  bearing: number;
  onReset: () => void;
}

export default function MapNavigator({ bearing, onReset }: MapNavigatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-6 top-24 z-50 flex flex-col gap-2"
    >
      <button
        onClick={onReset}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-surface/80 backdrop-blur-md text-white shadow-xl transition-all active:scale-90 hover:bg-surface"
      >
        <div
          style={{ transform: `rotate(${bearing * -1}deg)` }}
          className="transition-transform duration-200"
        >
          <Compass
            size={20}
            className={bearing === 0 ? "text-textMuted" : "text-primary"}
          />
        </div>
      </button>
    </motion.div>
  );
}
