import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LocationConsentModal from "../components/LocationConsentModal";
import { getHighAccuracyLocation } from "../utils/location";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationModal, setLocationModal] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops");

        if (Array.isArray(res.data)) {
          setShops(res.data);
        } else if (Array.isArray(res.data.shops)) {
          setShops(res.data.shops);
        } else {
          setShops([]);
        }
      } catch (e) {
        console.error("Failed to load shops", e);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const handleAllowLocation = async (exact) => {
    setLocationModal(false);
    try {
      if (exact) {
        const loc = await getHighAccuracyLocation();
        await api.post("/location/update", {
          ...loc,
          enabled: true
        });
      }
    } catch (err) {
      console.error("Location error", err);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-100">
          Nearby shops
        </h1>
        <button
          className="btn-ghost text-xs"
          onClick={() => setLocationModal(true)}
        >
          Update location
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-300">Loading shops...</p>
      ) : shops.length === 0 ? (
        <p className="text-sm text-slate-400">
          No shops found yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop._id}
              to={`/shops/${shop._id}`}
              className="glass-card p-4 hover:border-primary-500/60 transition-colors"
            >
              <h2 className="text-sm font-semibold text-slate-100">
                {shop.name}
              </h2>

              {shop.category && (
                <p className="text-xs text-primary-200 mt-1">
                  {shop.category}
                </p>
              )}

              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {shop.description || "No description provided"}
              </p>

              <p className="text-[11px] text-slate-500 mt-2">
                Status:{" "}
                <span className="uppercase tracking-wide">
                  {shop.status || "pending"}
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}

      <LocationConsentModal
        open={locationModal}
        onClose={() => setLocationModal(false)}
        onAllow={handleAllowLocation}
      />
    </main>
  );
}
