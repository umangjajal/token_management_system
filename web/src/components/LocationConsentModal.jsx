import { useState } from "react";

export default function LocationConsentModal({ open, onClose, onAllow }) {
  const [exact, setExact] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="glass-card max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="h-8 w-8 rounded-xl bg-primary-600/20 flex items-center justify-center">
            📍
          </span>
          Share your location
        </h2>
        <p className="text-sm text-slate-300">
          We use your location to show nearby shops, estimate your wait time, and
          update your token&apos;s ETA in real-time.
        </p>
        <div className="space-y-2 text-xs text-slate-400">
          <p>Choose how you want to share:</p>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="loc"
              checked={exact}
              onChange={() => setExact(true)}
            />
            <span>
              <span className="font-medium text-slate-200">Exact location</span> –
              best for accurate ETA and nearby shop discovery.
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="loc"
              checked={!exact}
              onChange={() => setExact(false)}
            />
            <span>
              <span className="font-medium text-slate-200">
                Approximate location
              </span>{" "}
              – less precise, more privacy.
            </span>
          </label>
        </div>
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Not now
          </button>
          <button
            onClick={() => onAllow(exact)}
            className="btn-primary text-xs px-5"
          >
            Allow location
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          You can change this anytime from Settings. We never share your location
          with other customers and only show it to the shop you joined, while your
          token is active.
        </p>
      </div>
    </div>
  );
}
