import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

interface AdminGateProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVault: () => void;
}

export default function AdminGate({
  isOpen,
  onClose,
  onOpenVault,
}: AdminGateProps) {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<
    "IDLE" | "LOADING" | "SUCCESS" | "ERROR"
  >("IDLE");

  // NEW: State for secret visibility
  const [isSecretVisible, setIsSecretVisible] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("LOADING");
    // Hide visibility when submitting
    setIsSecretVisible(false);

    // Calling the Secure Function in Supabase
    const { data: isAuthorized, error } = await supabase.rpc(
      "verify_admin_vault",
      {
        input_pass: passcode,
      },
    );

    if (!error && isAuthorized) {
      setStatus("SUCCESS");
      // Brief delay to show the success animation before redirecting
      setTimeout(() => {
        sessionStorage.setItem("vault_access", "granted");
        onOpenVault();
      }, 1200);
    } else {
      setStatus("ERROR");
      setPasscode("");
      setTimeout(() => setStatus("IDLE"), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div
        className={`w-full max-w-sm overflow-hidden rounded-[2rem] border transition-all duration-300 ${
          status === "ERROR"
            ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            : status === "SUCCESS"
              ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
              : "border-white/10 shadow-2xl"
        } bg-[#111]`}
      >
        <div className="relative px-8 pb-8 pt-10 text-center">
          <button
            onClick={onClose}
            className="absolute cursor-pointer right-6 top-6 text-white/20 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex justify-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-500 ${
                status === "ERROR"
                  ? "bg-red-500/10 text-red-500"
                  : status === "SUCCESS"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {status === "ERROR" ? (
                <AlertCircle size={28} />
              ) : status === "SUCCESS" ? (
                <CheckCircle2 size={28} className="animate-in zoom-in" />
              ) : (
                <Lock size={28} />
              )}
            </div>
          </div>

          <h2 className="mb-2 text-xl font-semibold tracking-tight">
            Identity Verification
          </h2>
          <p className="mb-8 text-sm text-white/40">
            Enter the secret key to unlock the Ride Manager.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* UPDATED: Input field with visibility toggle */}
            <div className="relative">
              <input
                autoFocus
                type={isSecretVisible ? "text" : "password"} // Dynamic type
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                disabled={status === "LOADING" || status === "SUCCESS"}
                // Updated padding to make room for the eye button
                className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-4 pr-12 text-center text-lg tracking-[0.5em] text-white outline-none focus:border-primary/50 transition-all disabled:opacity-50"
              />
              {/* Secret visibility toggle button */}
              <button
                type="button"
                onClick={() => setIsSecretVisible(!isSecretVisible)}
                disabled={
                  status === "LOADING" || status === "SUCCESS" || !passcode
                }
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-white/20 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-0"
                title={isSecretVisible ? "Hide key" : "Show key"}
              >
                {isSecretVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* <button
              disabled={
                status === "LOADING" || status === "SUCCESS" || !passcode
              }
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all duration-300 ${
                status === "SUCCESS"
                  ? "bg-green-500 text-white"
                  : "bg-white text-black hover:bg-white/90"
              } disabled:opacity-50`}
            >
              {status === "LOADING" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : status === "SUCCESS" ? (
                <>
                  <span className="mr-1">Access Granted</span>
                </>
              ) : status === "ERROR" ? (
                "Invalid Key"
              ) : (
                // NEW simplified text and icon
                <>
                  <span className="mr-1">Unlock</span> <Unlock size={16} />
                </>
              )}
            </button> */}
            <button
              disabled={
                status === "LOADING" || status === "SUCCESS" || !passcode
              }
              className={`group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold tracking-wide transition-all duration-300 ${
                status === "SUCCESS"
                  ? "bg-green-500 text-white"
                  : status === "ERROR"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-white text-black hover:bg-white/90"
              } disabled:opacity-50`}
            >
              {status === "LOADING" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : status === "SUCCESS" ? (
                <div className="flex items-center gap-2">
                  <span>Authorized</span>
                  <CheckCircle2 size={16} />
                </div>
              ) : status === "ERROR" ? (
                "Try Again"
              ) : (
                <div className="flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
