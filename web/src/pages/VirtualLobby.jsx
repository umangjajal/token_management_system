import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function VirtualLobby() {
  const { tokenId } = useParams();

  const [lobby, setLobby] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ======================
     FETCH LOBBY DATA
  ====================== */
  const fetchLobby = async () => {
    try {
      const res = await api.get(`/lobby/${tokenId}`);
      setLobby(res.data);

      // optional backend-driven messages
      if (res.data?.notification) {
        setNotification(res.data.notification);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to load lobby", err);
      setError("Unable to load lobby data");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     INITIAL LOAD + POLLING
  ====================== */
  useEffect(() => {
    fetchLobby();

    // Poll every 5 seconds (safe replacement for sockets)
    const interval = setInterval(fetchLobby, 5000);

    return () => clearInterval(interval);
  }, [tokenId]);

  /* ======================
     STATES
  ====================== */
  if (loading) {
    return <p className="text-center mt-10">Loading lobby...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  if (!lobby) {
    return <p className="text-center mt-10">Lobby not found</p>;
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* LOBBY STATUS */}
      <div className="bg-white shadow rounded-xl p-5 text-center">
        <h1 className="text-xl font-bold">Virtual Lobby</h1>

        <p className="text-gray-600 mt-2">
          You are{" "}
          <span className="font-bold text-lg">{lobby.position}</span> in line
        </p>

        <p className="text-sm text-gray-500">
          Estimated wait: {lobby.estimatedWait} minutes
        </p>

        {notification && (
          <div className="mt-4 bg-yellow-100 text-yellow-800 p-3 rounded">
            {notification}
          </div>
        )}
      </div>

      {/* SHOP SPECIALS */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-2">Shop Specials</h2>

        {lobby.products?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {lobby.products.map((p) => (
              <div key={p._id} className="border p-2 rounded">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.whyPurchase}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No specials available</p>
        )}
      </div>

      {/* NEARBY DEALS */}
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-2">Nearby Deals (15 min visit)</h2>

        {lobby.nearbyDeals?.length > 0 ? (
          lobby.nearbyDeals.map((shop) => (
            <p key={shop.shopId} className="text-sm">
              {shop.name} • {shop.waitTime} min wait
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-400">No nearby deals</p>
        )}
      </div>
    </div>
  );
}
