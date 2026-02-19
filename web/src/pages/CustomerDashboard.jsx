import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

/**
 * CUSTOMER DASHBOARD
 * Shows active tokens with real-time tracking
 */
export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    if (user?.role !== "customer") {
      navigate("/login");
      return;
    }
    fetchMyTokens();
    const interval = setInterval(fetchMyTokens, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const fetchMyTokens = async () => {
    try {
      const res = await api.get("/tokens/my-tokens");
      setTokens(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async (shopId) => {
    try {
      await api.post(`/tokens/${shopId}/leave`);
      fetchMyTokens();
    } catch (err) {
      alert("Failed to leave queue");
    }
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Queue Dashboard</h1>
          <p className="text-slate-400">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* ACTIVE TOKENS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {loading ? (
          <div className="text-center text-slate-400">Loading...</div>
        ) : tokens.length > 0 ? (
          tokens.map((token) => (
            <div
              key={token._id}
              className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                selectedToken?._id === token._id
                  ? "bg-blue-600/20 border-blue-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
              onClick={() => setSelectedToken(token)}
            >
              {/* Token Number - Prominent */}
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-400">
                  {token.tokenNumber}
                </div>
                <div className="text-sm text-slate-400 mt-1">Your Token Number</div>
              </div>

              {/* Shop Info */}
              <div className="mb-4 pb-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">
                  {token.shopId?.name}
                </h3>
                <p className="text-sm text-slate-400">{token.shopId?.address}</p>
              </div>

              {/* Status */}
              <div className="mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    token.status === "called"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-yellow-600/20 text-yellow-400"
                  }`}
                >
                  {token.status === "called" ? "🎤 Your turn!" : "⏳ Waiting"}
                </span>
              </div>

              {/* Key Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Position in Queue:</span>
                  <span className="text-white font-semibold">
                    #{token.positionInQueue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Wait Time:</span>
                  <span className="text-white font-semibold">
                    {token.estimatedWaitTime || 0} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Travel Time:</span>
                  <span className="text-white font-semibold">
                    {token.estimatedTravelTime?.seconds
                      ? Math.ceil(token.estimatedTravelTime.seconds / 60)
                      : 0}{" "}
                    mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Arrival Time:</span>
                  <span className="text-white font-semibold">
                    {formatTime(token.estimatedArrivalTime)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveQueue(token.shopId._id);
                }}
                className="w-full mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
              >
                Leave Queue
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400 text-lg">No active tokens</p>
            <button
              onClick={() => navigate("/shops")}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Browse Shops
            </button>
          </div>
        )}
      </div>

      {/* DETAILED VIEW */}
      {selectedToken && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Token Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Booking Time</p>
              <p className="text-white font-semibold">
                {formatTime(selectedToken.bookingTime)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Estimated Arrival</p>
              <p className="text-white font-semibold">
                {formatTime(selectedToken.estimatedArrivalTime)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Travel Mode</p>
              <p className="text-white font-semibold capitalize">
                {selectedToken.estimatedTravelTime?.mode || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Distance</p>
              <p className="text-white font-semibold">
                {selectedToken.estimatedTravelTime?.distance?.toFixed(2) || 0} km
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Group Size</p>
              <p className="text-white font-semibold">
                {selectedToken.groupSize} people
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <p className="text-white font-semibold capitalize">
                {selectedToken.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
