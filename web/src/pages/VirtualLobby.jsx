import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import api from "../services/api";

const socket = io(import.meta.env.VITE_API_URL);

export default function VirtualLobby() {
  const { tokenId } = useParams();
  const [lobby, setLobby] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    api.get(`/lobby/${tokenId}`).then(res => setLobby(res.data));

    socket.on("queueUpdate", data => {
      if (data.tokenId === tokenId) setLobby(data);
    });

    socket.on("START_HEADING", msg => setNotification(msg.message));
    socket.on("TOKEN_CALLED", msg => setNotification(msg.message));

    return () => socket.disconnect();
  }, [tokenId]);

  if (!lobby) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white shadow rounded-xl p-5 text-center">
        <h1 className="text-xl font-bold">Virtual Lobby</h1>
        <p className="text-gray-600">
          You are <span className="font-bold">{lobby.position}</span> in line
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

      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-2">Shop Specials</h2>
        <div className="grid grid-cols-2 gap-3">
          {lobby.products.map(p => (
            <div key={p._id} className="border p-2 rounded">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-gray-500">{p.whyPurchase}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="font-semibold mb-2">Nearby Deals (15 min visit)</h2>
        {lobby.nearbyDeals.map(shop => (
          <p key={shop.shopId} className="text-sm">
            {shop.name} • {shop.waitTime} min wait
          </p>
        ))}
      </div>
    </div>
  );
}
