import { Github, Instagram, Map as MapIcon, Youtube } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import AdminGate from "./AdminGate";

interface HeaderProps {
  onToggleList: () => void;
  isListOpen: boolean;
  onOpenGate: () => void;
}

export default function Header({
  onToggleList,
  isListOpen,
  onOpenGate,
}: HeaderProps) {
  // 1. Create a reference to hold our timer
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  // 2. Start the countdown when pressed/clicked
  const handlePressStart = () => {
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      if (sessionStorage.getItem("vault_access") === "granted") {
        window.location.href = "/roaming-rides";
      } else {
        onOpenGate();
      }
    }, 2500); // 2.5 Seconds
  };

  const handlePressCancel = () => {
    setIsPressing(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-md rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 backdrop-blur-md shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* 1. LIST TOGGLE (Map Icon Only) */}
          <button
            onClick={onToggleList}
            title={isListOpen ? "Close List" : "View Rides"}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 ${
              isListOpen
                ? "bg-white text-black scale-110"
                : "bg-primary text-black hover:scale-105"
            }`}
          >
            <MapIcon size={18} strokeWidth={3} />
          </button>

          {/* 2. ADMIN PORTAL (Text Only - Option 2) */}
          <div
            onPointerDown={handlePressStart}
            onPointerUp={handlePressCancel}
            onPointerLeave={handlePressCancel}
            onPointerCancel={handlePressCancel}
            className="relative cursor-pointer py-1"
            style={{
              WebkitTouchCallout: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span className="font-bold tracking-tight text-white select-none">
              roamingcypher
            </span>

            {/* Option 2: The Glowing Underline Progress Bar */}
            <AnimatePresence>
              {isPressing && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-[2px] bg-primary shadow-[0_0_12px_rgba(255,255,0,0.8)]"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4 text-textMuted">
          <a
            href="https://youtube.com/@roamingcypher"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Youtube size={18} />
          </a>
          <a
            href="https://instagram.com/roamingcypher"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://github.com/saranggulavani"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
      <AdminGate
        isOpen={isGateOpen}
        onClose={() => setIsGateOpen(false)}
        onOpenVault={() => (window.location.href = "/roaming-rides")}
      />
    </header>
  );
}
