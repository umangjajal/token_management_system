import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ShopDetails() {
  const { shopId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;

    setLoading(true);

    api
      .get(`/products/${shopId}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [shopId]);

  if (loading) {
    return (
      <p className="text-center text-slate-400 mt-10">
        Loading products...
      </p>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-white mb-6">
        Available Products
      </h1>

      {products.length === 0 ? (
        <p className="text-slate-400">No products available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p._id}
              className="rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#020617]
                         border border-white/10 shadow-lg overflow-hidden
                         hover:shadow-primary-600/30 transition"
            >
              {/* IMAGE */}
              {p.imageUrl ? (
                <img
                  src={`http://localhost:5000${p.imageUrl}`}
                  alt={p.name}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 flex items-center justify-center bg-black/30 text-slate-500 text-sm">
                  No image
                </div>
              )}

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {p.name}
                </h3>

                {p.price > 0 && (
                  <p className="text-primary-300 text-sm font-medium">
                    ₹{p.price} / {p.unit || "unit"}
                  </p>
                )}

                {p.whyPurchase && (
                  <p className="text-emerald-400 text-xs">
                    ⭐ {p.whyPurchase}
                  </p>
                )}

                {p.description && (
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {p.description}
                  </p>
                )}

                <button
                  disabled={!p.isAvailable}
                  className={`mt-3 w-full rounded-xl text-sm py-2 transition ${
                    p.isAvailable
                      ? "bg-primary-600 hover:bg-primary-500 text-white"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {p.isAvailable ? "Add to Cart" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
