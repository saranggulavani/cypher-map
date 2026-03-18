import { Github, Instagram, Youtube, Map as MapIcon } from "lucide-react";

interface HeaderProps {
  onToggleList: () => void;
  isListOpen: boolean;
}

export default function Header({ onToggleList, isListOpen }: HeaderProps) {
  return (
    <header className="fixed top-6 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-md rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 backdrop-blur-md shadow-2xl pointer-events-auto">
        <button
          onClick={onToggleList}
          className="flex items-center gap-2 group transition-colors cursor-pointer"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
              isListOpen
                ? "bg-white text-background scale-110"
                : "bg-primary text-background"
            }`}
          >
            <MapIcon size={18} strokeWidth={3} />
          </div>
          <span className="font-bold tracking-tight text-white">
            roamingcypher
          </span>
        </button>

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
    </header>
  );
}
