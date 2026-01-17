// web/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const res = await api.get("/shops/all");
    setShops(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/shops/${id}/status`, { status });
    load();
  };

  const filtered = shops.filter((s) =>
    filter === "all" ? true : s.status === filter
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">
          Admin dashboard
        </h1>
        <select
          className="rounded-xl bg-black/40 border border-white/10 px-3 py-1 text-xs text-slate-100"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All shops</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="glass-card p-4 space-y-3 text-sm">
        <h2 className="text-slate-200 text-sm font-medium">
          Shop approvals
        </h2>

        {filtered.map((shop) => (
          <div
            key={shop._id}
            className="flex justify-between border-b border-white/5 pb-2"
          >
            <div>
              <p className="text-slate-100 text-sm">{shop.name}</p>
              <p className="text-[11px] text-slate-400">
                {shop.category} · {shop.status}
              </p>
              {shop.address && (
                <p className="text-[11px] text-slate-500">
                  {shop.address}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => updateStatus(shop._id, "approved")}
                className="btn-primary px-3 py-1"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(shop._id, "rejected")}
                className="btn-ghost px-3 py-1"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-xs text-slate-400">No shops found.</p>
        )}
      </div>
    </main>
  );
}
