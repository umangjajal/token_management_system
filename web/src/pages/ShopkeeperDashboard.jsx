// web/src/pages/ShopkeeperDashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";




export default function ShopkeeperDashboard() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [queue, setQueue] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "pcs",
    description: "",
    whyPurchase: "",
    stock: "",
    isAvailable: true
  });

  const resetForm = () =>
    setForm({
      name: "",
      price: "",
      unit: "pcs",
      description: "",
      whyPurchase: "",
      stock: "",
      isAvailable: true
    });

  // Load approved shops (for now, from /shops and filter client side)
  useEffect(() => {
    api
      .get("/shops/mine")
      .then((res) => setShops(res.data))
      .catch((e) => console.error(e));
  }, []);


  // Load queue + products when shop changes
  useEffect(() => {
    if (!selectedShop) return;
    api.get(`/tokens/${selectedShop}`).then((res) => setQueue(res.data));
    loadProducts(selectedShop);
  }, [selectedShop]);

  const loadProducts = async (shopId) => {
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products/${shopId}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Load products error", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleStatus = async (tokenId, status) => {
    await api.put(`/tokens/${tokenId}/status`, { status });
    if (selectedShop) {
      const res = await api.get(`/tokens/${selectedShop}`);
      setQueue(res.data);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;

    try {
      const fd = new FormData();


      fd.append("name", form.name);
      fd.append("price", form.price ? Number(form.price) : 0);
      fd.append("unit", form.unit);
      fd.append("stock", form.stock ? Number(form.stock) : 0);
      fd.append("description", form.description);
      fd.append("whyPurchase", form.whyPurchase);
      fd.append("isAvailable", form.isAvailable);

      if (image) {
        fd.append("image", image);
      }

      if (editingProduct) {
        await api.put(`/products/item/${editingProduct._id}`, fd);
      } else {
        await api.post(`/products/${selectedShop}`, fd);
      }


      resetForm();
      setEditingProduct(null);
      setImage(null);
      setImagePreview(null);

      await loadProducts(selectedShop);
    } catch (err) {
      console.error("Save product error", err);
    }
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      price: p.price ?? "",
      unit: p.unit || "pcs",
      description: p.description || "",
      whyPurchase: p.whyPurchase || "",
      stock: p.stock ?? "",
      isAvailable: p.isAvailable
    });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/item/${id}`);
      await loadProducts(selectedShop);
    } catch (err) {
      console.error("Delete product error", err);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-5">
      <h1 className="text-xl font-semibold text-slate-100">
        Shopkeeper dashboard
      </h1>

      {/* Shop selector */}
      <section className="glass-card p-4 space-y-3 text-sm">
        <h2 className="text-slate-200 text-sm font-medium">
          Your approved shops
        </h2>
        <div className="flex gap-3 flex-wrap">
          {shops.map((shop) => (
            <button
              key={shop._id}
              onClick={() => setSelectedShop(shop._id)}
              className={`px-3 py-2 rounded-xl border text-xs ${selectedShop === shop._id
                ? "border-primary-500 bg-primary-600/30 text-primary-100"
                : "border-white/5 bg-white/5 text-slate-200"
                }`}
            >
              {shop.name}
            </button>
          ))}
          {shops.length === 0 && (
            <p className="text-xs text-slate-400">
              No approved shops yet. Wait for admin approval.
            </p>
          )}
        </div>
      </section>

      {!selectedShop ? (
        <p className="text-xs text-slate-400">
          Select a shop above to see queue and manage products.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Queue management */}
          <section className="glass-card p-4 space-y-3 text-sm">
            <h2 className="text-slate-200 text-sm font-medium">
              Live queue
            </h2>
            {queue.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-slate-100 text-sm">
                    Token #{t.tokenNumber}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Status: {t.status}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => handleStatus(t._id, "called")}
                    className="btn-primary px-3 py-1 text-xs"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => handleStatus(t._id, "served")}
                    className="btn-ghost px-3 py-1 text-xs"
                  >
                    Serve
                  </button>
                  <button
                    onClick={() => handleStatus(t._id, "cancelled")}
                    className="btn-ghost px-3 py-1 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {queue.length === 0 && (
              <p className="text-xs text-slate-400">No tokens yet.</p>
            )}
          </section>

          {/* Product management */}
          <section className="glass-card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-200 text-sm font-medium">
                Products / services
              </h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Cancel edit
                </button>
              )}
            </div>

            {/* Product form */}
            <form
              onSubmit={handleProductSubmit}
              className="space-y-2 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 text-[11px]">
                    Name *
                  </label>
                  <input
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 text-[11px]">
                    Price
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 text-[11px]">
                    Unit
                  </label>
                  <input
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    placeholder="pcs / service / kg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 text-[11px]">
                    Stock
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    min="0"
                  />
                </div>
              </div>
              {/* Product image */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px]">
                  Product image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                  className="w-full text-[11px] text-slate-300"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 h-20 w-20 rounded-lg object-cover border border-white/10"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 text-[11px]">
                  Description
                </label>
                <textarea
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Short details about this product / service"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 text-[11px]">
                  Why purchase this? (highlight)
                </label>
                <textarea
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={2}
                  value={form.whyPurchase}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, whyPurchase: e.target.value }))
                  }
                  placeholder="e.g. Best seller • 30 min service • Great for students"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isAvailable: e.target.checked
                      }))
                    }
                  />
                  <span>Available for customers</span>
                </label>

                <button
                  type="submit"
                  className="btn-primary text-[11px] px-4 py-1.5"
                >
                  {editingProduct ? "Update product" : "Add product"}
                </button>
              </div>
            </form>

            {/* Product list */}
            <div className="border-t border-white/5 pt-3 space-y-2">
              <p className="text-[11px] text-slate-400">
                {loadingProducts
                  ? "Loading products..."
                  : `Total products: ${products.length}`}
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-start justify-between rounded-xl bg-white/5 px-3 py-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {p.imageUrl && (
                          <img
                            src={`http://localhost:5000${p.imageUrl}`}
                            alt={p.name}
                            className="h-12 w-12 rounded-md object-cover border border-white/10"
                          />
                        )}

                        <p className="text-xs font-medium text-slate-100">
                          {p.name}
                        </p>
                        {!p.isAvailable && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/40">
                            Unavailable
                          </span>
                        )}
                      </div>
                      {p.price > 0 && (
                        <p className="text-[11px] text-primary-200">
                          ₹{p.price} / {p.unit || "unit"}
                        </p>
                      )}
                      {p.whyPurchase && (
                        <p className="text-[11px] text-emerald-300">
                          {p.whyPurchase}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="btn-ghost px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p._id)}
                        className="btn-ghost px-2 py-1 text-red-300 border-red-500/40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && !loadingProducts && (
                  <p className="text-[11px] text-slate-400">
                    No products yet. Add your first product above.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
