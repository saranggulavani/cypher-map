import { motion } from "motion/react";
import { MapPin, ChevronRight } from "lucide-react";
import type { Ride } from "../types";

interface RideListProps {
  rides: Ride[];
  onSelect: (ride: Ride) => void;
  onClose: () => void;
}

export default function RideList({ rides, onSelect, onClose }: RideListProps) {
  return (
    <>
      {/* Background Overlay - Closes drawer when clicked */}
      <div className="fixed inset-0 z-[55] bg-black/20" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="fixed left-6 top-24 bottom-24 z-[60] flex w-80 flex-col rounded-3xl border border-white/10 bg-surface/90 p-6 backdrop-blur-xl shadow-2xl"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Ride Index
          </h2>
          <p className="text-[10px] text-primary uppercase font-bold mt-1 tracking-widest">
            Select Destination
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
          {rides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-20">
              <MapPin size={24} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                No Missions Logged
              </span>
            </div>
          ) : (
            <>
              {rides.map((ride) => (
                <button
                  key={ride.id}
                  onClick={() => onSelect(ride)}
                  className="group w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-textMuted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {ride.title}
                    </h3>
                    <p className="text-[10px] text-textMuted mt-0.5">
                      {ride.bike}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-white/10 group-hover:text-primary transition-colors"
                  />
                </button>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
