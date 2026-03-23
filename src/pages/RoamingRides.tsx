import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  Save,
  Loader2,
  Map as MapIcon,
  Video,
  CheckCircle2,
  Plus,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  Undo2,
} from "lucide-react";
import { useRides } from "../hooks/useRides";

export default function RoamingRides() {
  // Tab & Core State
  const [activeTab, setActiveTab] = useState<"add" | "manage">("add");
  const [editingRide, setEditingRide] = useState<any | null>(null);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Manage States
  const { rides, refetch, loading: ridesLoading } = useRides();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // --- DELETE LOGIC ---
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from("rides").delete().eq("id", id);
      if (error) throw error;
      await refetch();
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert("Failed to delete ride.");
    } finally {
      setDeletingId(null);
    }
  };

  // --- EDIT LOGIC (Setup & Cleanup) ---
  const handleEditSetup = (ride: any) => {
    setEditingRide(ride);
    setActiveTab("add");
    setStatus("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setStatus("idle");
    setEditingRide(null);
    setActiveTab("manage");
  };

  // BUG FIX: Properly clear the success modal when returning to the list
  const handleFinishEdit = () => {
    setStatus("idle");
    setEditingRide(null);
    setActiveTab("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- ADD / UPDATE LOGIC ---
  const handleResetForm = () => {
    setStatus("idle");
    setEditingRide(null);
    if (formRef.current) formRef.current.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);

    // Construct the payload
    const rideData = {
      title: formData.get("title"),
      bike: formData.get("bike") || "Super Meteor 650",
      google_map_url: formData.get("googleMapUrl"),
      coordinates: [
        parseFloat(formData.get("lat") as string),
        parseFloat(formData.get("lng") as string),
      ],
      stats: {
        distance: formData.get("distance"),
        duration: formData.get("duration"),
        type: formData.get("type"),
      },
      waypoints: (formData.get("waypoints") as string)
        ? (formData.get("waypoints") as string).split(",").map((s) => s.trim())
        : [],
      links: {
        ...(formData.get("igLink") && { instagram: formData.get("igLink") }),
        ...(formData.get("ytLink") && { youtube: formData.get("ytLink") }),
      },
      content_type: {
        ...(formData.get("igType") && { instagram: formData.get("igType") }),
        ...(formData.get("ytType") && { youtube: formData.get("ytType") }),
      },
    };

    try {
      if (editingRide) {
        // UPDATE Existing
        const { error: updateError } = await supabase
          .from("rides")
          .update(rideData)
          .eq("id", editingRide.id);
        if (updateError) throw updateError;
      } else {
        // INSERT New
        const { error: insertError } = await supabase
          .from("rides")
          .insert([rideData]);
        if (insertError) throw insertError;
      }

      setStatus("success");
      await refetch(); // Ensure the Manage tab has the fresh data
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] h-screen w-full overflow-y-auto bg-[#0a0a0a] text-white/90 antialiased custom-scrollbar">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ride Manager
            </h1>
            {editingRide && (
              <p className="text-primary text-xs font-medium mt-1 uppercase tracking-widest">
                Editing Ride
              </p>
            )}
          </div>
          <a
            href="/"
            title="Close and return to map"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white hover:rotate-90"
          >
            <X size={18} strokeWidth={2.5} className="transition-transform" />
          </a>
        </header>

        {/* TAB SWITCHER */}
        {!editingRide && (
          <div className="mb-8 flex w-full rounded-xl bg-white/[0.02] p-1 ring-1 ring-white/10">
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === "add" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
            >
              Add Ride
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === "manage" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
            >
              Manage Rides
            </button>
          </div>
        )}

        {/* --- TAB VIEW: ADD/EDIT RIDE --- */}
        {activeTab === "add" && (
          <form
            key={editingRide ? editingRide.id : "new-form"}
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-sm font-medium text-white/40 mb-4">
                General Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Title
                  </label>
                  <input
                    required
                    name="title"
                    defaultValue={editingRide?.title || ""}
                    className="input-field"
                    placeholder="e.g. Jungle Jetty"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Motorcycle
                  </label>
                  <input
                    name="bike"
                    defaultValue={editingRide?.bike || "Super Meteor 650"}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Distance
                  </label>
                  <input
                    required
                    name="distance"
                    defaultValue={editingRide?.stats?.distance || ""}
                    className="input-field"
                    placeholder="163 km"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Duration
                  </label>
                  <input
                    required
                    name="duration"
                    defaultValue={editingRide?.stats?.duration || ""}
                    className="input-field"
                    placeholder="4h 24m"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Conditions
                  </label>
                  <input
                    required
                    name="type"
                    defaultValue={editingRide?.stats?.type || ""}
                    className="input-field"
                    placeholder="Sunny / Rain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-sm font-medium text-white/40 flex items-center gap-2 mb-4">
                <MapIcon size={16} /> Location & Routing
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Lat
                  </label>
                  <input
                    required
                    name="lat"
                    type="number"
                    step="any"
                    defaultValue={editingRide?.coordinates?.[0] || ""}
                    className="input-field no-spin"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="18.279"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Lng
                  </label>
                  <input
                    required
                    name="lng"
                    type="number"
                    step="any"
                    defaultValue={editingRide?.coordinates?.[1] || ""}
                    className="input-field no-spin"
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="72.992"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Waypoints
                </label>
                <textarea
                  required
                  name="waypoints"
                  rows={2}
                  defaultValue={editingRide?.waypoints?.join(", ") || ""}
                  className="input-field resize-none"
                  placeholder="Pune, Tamhini Ghat..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">
                  Maps URL
                </label>
                <input
                  name="googleMapUrl"
                  type="url"
                  defaultValue={
                    editingRide?.googleMapUrl ||
                    editingRide?.google_map_url ||
                    ""
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h2 className="text-sm font-medium text-white/40 flex items-center gap-2 mb-4">
                <Video size={16} /> Media Links
              </h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Insta URL
                  </label>
                  <input
                    name="igLink"
                    type="url"
                    defaultValue={editingRide?.links?.instagram || ""}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Format
                  </label>
                  <select
                    name="igType"
                    defaultValue={editingRide?.contentType?.instagram || "Reel"}
                    className="input-field cursor-pointer appearance-none select-chevron"
                  >
                    <option value="Reel">Reel</option>
                    <option value="Post">Post</option>
                    <option value="Highlight">Highlight</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    YouTube URL
                  </label>
                  <input
                    name="ytLink"
                    type="url"
                    defaultValue={editingRide?.links?.youtube || ""}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">
                    Format
                  </label>
                  <select
                    name="ytType"
                    defaultValue={editingRide?.contentType?.youtube || "Video"}
                    className="input-field cursor-pointer appearance-none select-chevron"
                  >
                    <option value="Video">Video</option>
                    <option value="Shorts">Shorts</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {editingRide && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  <Undo2 size={18} /> Cancel
                </button>
              )}
              <button
                disabled={isSubmitting}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-black transition-all hover:bg-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting
                  ? "Saving..."
                  : editingRide
                    ? "Update Ride"
                    : "Save Ride"}
              </button>
            </div>
          </form>
        )}

        {/* --- TAB VIEW: MANAGE RIDES --- */}
        {activeTab === "manage" && (
          <div className="space-y-3 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {ridesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-white/20" />
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-sm">
                No rides found.
              </div>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride.id}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex-1 overflow-hidden pr-4">
                    <h3 className="truncate font-medium text-white/90">
                      {ride.title}
                    </h3>
                    <p className="truncate text-xs text-white/40 mt-1">
                      {ride.bike} • {ride.stats?.distance || "N/A"}
                    </p>
                  </div>

                  {confirmDeleteId === ride.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(ride.id)}
                        disabled={deletingId === ride.id}
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === ride.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditSetup(ride)}
                        title="Edit Ride"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(ride.id)}
                        title="Delete Ride"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* --- OVERLAY: ACTION SUCCESS --- */}
        {status !== "idle" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <div className="px-8 pb-6 pt-10 text-center">
                <div className="mb-6 flex justify-center">
                  {status === "success" ? (
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                      <div className="absolute inset-0 rounded-full border border-green-500/20 animate-[ping_2s_ease-in-out_infinite]" />
                      <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                      <AlertCircle size={32} className="text-red-500" />
                    </div>
                  )}
                </div>
                <h2 className="mb-2 text-xl font-semibold tracking-tight">
                  {status === "success"
                    ? editingRide
                      ? "Ride Updated"
                      : "Ride Saved"
                    : "Action Failed"}
                </h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  {status === "success"
                    ? "Your ride data has been successfully saved."
                    : errorMessage}
                </p>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/5 bg-white/[0.02] p-4">
                {status === "success" ? (
                  <>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-white/90"
                    >
                      <MapIcon size={16} /> Return to Map
                    </button>

                    {/* BUG FIX: Routes correctly back to list if editing, or resets form if adding */}
                    <button
                      onClick={editingRide ? handleFinishEdit : handleResetForm}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
                    >
                      {editingRide ? (
                        "Back to Rides"
                      ) : (
                        <>
                          <Plus size={16} /> Add Another
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setStatus("idle")}
                    className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    Review & Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .input-field { width: 100%; border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); background-color: rgba(255, 255, 255, 0.03); padding: 0.625rem 1rem; font-size: 0.875rem; color: white; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: rgba(255, 255, 255, 0.3); background-color: rgba(255, 255, 255, 0.05); }
        .input-field::placeholder { color: rgba(255, 255, 255, 0.2); }
        .select-chevron { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
        .select-chevron option { background-color: #111; color: white; }
        .no-spin::-webkit-outer-spin-button, .no-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spin[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
