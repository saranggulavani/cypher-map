import { motion, AnimatePresence } from "motion/react";

export default function MissionHint({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ y: 20, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 20, opacity: 0, x: "-50%" }}
          className="fixed bottom-12 left-1/2 z-30 flex items-center gap-2.5 rounded-full border border-white/5 bg-black/60 px-4 py-1.5 backdrop-blur-xl pointer-events-none shadow-2xl whitespace-nowrap"
        >
          {/* Micro Tactical Pin */}
          <div className="relative flex h-3 w-2.5 shrink-0 items-center justify-center">
            {/* Subtle Static Shadow (No pulse to keep it steady at this size) */}
            <div className="absolute bottom-0 h-0.5 w-0.5 rounded-full bg-primary/30 blur-[1px]" />

            <svg
              width="8"
              height="11"
              viewBox="0 0 24 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z"
                fill="#ffc20e"
              />
              <circle cx="12" cy="12" r="5" fill="#0D0D0D" />
            </svg>
          </div>

          <span className="text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/50 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            READY | TAP MARKER
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
