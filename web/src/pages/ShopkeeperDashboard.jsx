// web/src/pages/ShopkeeperDashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function ShopkeeperDashboard() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [queue, setQueue] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("all");
  const [form, setForm] = useState({
    name: "",
    price: "",
    unit: "pcs",
    description: "",
    whyPurchase: "",
    stock: "",
    isAvailable: true
  });

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      unit: "pcs",
      description: "",
      whyPurchase: "",
      stock: "",
      isAvailable: true
    });
    setImage(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  // Load approved shops
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
    try {
      await api.put(`/tokens/${tokenId}/status`, { status });
      if (selectedShop) {
        const res = await api.get(`/tokens/${selectedShop}`);
        setQueue(res.data);
      }
    } catch (err) {
      console.error("Status update error", err);
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

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterAvailable === "all" || 
      (filterAvailable === "available" ? p.isAvailable : !p.isAvailable);
    return matchSearch && matchFilter;
  });

  // Stats Cards
  const StatsCard = ({ icon, label, value, color }) => (
    <div className={`rounded-xl border ${color} bg-white/5 p-4 backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${color.split("border-")[1]?.split(" ")[0] === "blue" ? "text-blue-400" : color.split("border-")[1]?.split(" ")[0] === "emerald" ? "text-emerald-400" : color.split("border-")[1]?.split(" ")[0] === "amber" ? "text-amber-400" : "text-purple-400"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );

  const renderTab = () => {
    if (activeTab === "queue") {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-2xl">📋</span> Live Queue Management
          </h2>
          {queue.length === 0 ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center backdrop-blur-sm">
              <p className="text-amber-300">No tokens in queue yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {queue.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm hover:border-blue-500/50 transition-all"
                >
                  <div className="flex-1">
                    <p className="text-lg font-bold text-blue-300">
                      Token #{t.tokenNumber}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-3 py-1 rounded-full border ${
                        t.status === "pending" ? "border-amber-500/40 bg-amber-500/10 text-amber-300" :
                        t.status === "called" ? "border-blue-500/40 bg-blue-500/10 text-blue-300" :
                        t.status === "served" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" :
                        "border-red-500/40 bg-red-500/10 text-red-300"
                      }`}>
                        {t.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(t._id, "called")}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all active:scale-95"
                    >
                      Call
                    </button>
                    <button
                      onClick={() => handleStatus(t._id, "served")}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all active:scale-95"
                    >
                      Serve
                    </button>
                    <button
                      onClick={() => handleStatus(t._id, "cancelled")}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "products") {
      return (
        <div className="space-y-6">
          {/* Product Form */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-2xl">{editingProduct ? "✏️" : "➕"}</span>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g., Fresh Milk"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Unit *</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="pcs, kg, liter, service, etc."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Details about this product or service"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Why Purchase? (Highlight)</label>
                <textarea
                  value={form.whyPurchase}
                  onChange={(e) => setForm({ ...form, whyPurchase: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g., Best quality • Fast delivery • Great reviews"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Product Image</label>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="flex-1 text-sm text-slate-300 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 accent-blue-500"
                  />
                  <span className="text-sm text-slate-300">Available for customers</span>
                </label>

                <div className="flex gap-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all active:scale-95"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span className="text-2xl">📦</span> Your Products
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <select
                  value={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="all">All Products</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-8 text-slate-400">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center backdrop-blur-sm">
                <p className="text-amber-300">
                  {products.length === 0 ? "No products yet. Add your first product above!" : "No products match your search."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-blue-500/50 transition-all"
                  >
                    {p.imageUrl && (
                      <img
                        src={`http://localhost:5000${p.imageUrl}`}
                        alt={p.name}
                        className="w-full h-40 rounded-lg object-cover mb-3 border border-white/10"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-100">{p.name}</h3>
                        {!p.isAvailable && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 whitespace-nowrap">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {p.price > 0 && (
                        <p className="text-lg font-bold text-blue-400">
                          ₹{p.price} <span className="text-xs text-slate-400">/ {p.unit || "unit"}</span>
                        </p>
                      )}

                      {p.stock && (
                        <p className={`text-sm font-medium ${
                          p.stock > 10 ? "text-emerald-400" : 
                          p.stock > 0 ? "text-amber-400" : 
                          "text-red-400"
                        }`}>
                          📦 Stock: {p.stock} {p.unit}
                        </p>
                      )}

                      {p.whyPurchase && (
                        <p className="text-xs text-emerald-300 italic">💡 {p.whyPurchase}</p>
                      )}

                      {p.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                      )}

                      <div className="flex gap-2 pt-3 border-t border-white/10">
                        <button
                          onClick={() => startEdit(p)}
                          className="flex-1 px-3 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm font-medium transition-all border border-blue-500/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 text-sm font-medium transition-all border border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Shopkeeper Dashboard
          </h1>
          <p className="text-slate-400">Manage your shops, products, and customer queue</p>
        </div>

        {/* Shop Selector */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Select Your Shop</h2>
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {shops.map((shop) => (
                <button
                  key={shop._id}
                  onClick={() => shop.status !== "rejected" && setSelectedShop(shop._id)}
                  disabled={shop.status === "rejected"}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all border flex items-center gap-2 ${
                    shop.status === "rejected"
                      ? "border-red-500/40 bg-red-500/10 text-red-400 cursor-not-allowed opacity-60"
                      : selectedShop === shop._id
                      ? "border-blue-500 bg-blue-600/30 text-blue-100 shadow-lg shadow-blue-500/20"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span>{shop.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    shop.status === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                    shop.status === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                    "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}>
                    {shop.status === "pending" ? "⏳ Pending" : shop.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                  </span>
                </button>
              ))}
            </div>
            {shops.length === 0 && (
              <p className="text-amber-300">⏳ No shops yet. Create one from your profile.</p>
            )}
          </div>
        </div>

        {!selectedShop ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 text-center backdrop-blur-sm">
            <p className="text-amber-300 font-medium">👆 Select a shop above to get started</p>
          </div>
        ) : (() => {
          const currentShop = shops.find(s => s._id === selectedShop);
          
          return (
            <div className="space-y-6">
              {/* Shop Status Banner */}
              {currentShop?.status === "pending" && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-4 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <h3 className="font-semibold text-amber-300">Shop Awaiting Approval</h3>
                    <p className="text-sm text-amber-200 mt-1">Your shop is under review by the admin. You can add products, but customers will only see your shop once it's approved.</p>
                  </div>
                </div>
              )}

              {currentShop?.status === "rejected" && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/15 p-4 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-300">Shop Rejected</h3>
                    <p className="text-sm text-red-200 mt-1">Unfortunately, your shop application was rejected. Contact admin for details.</p>
                  </div>
                </div>
              )}

              {currentShop?.status === "approved" && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-emerald-300">Shop Active & Approved</h3>
                    <p className="text-sm text-emerald-200 mt-1">Your shop is approved! Customers can see you and access your products through the queue system.</p>
                  </div>
                </div>
              )}

              {currentShop?.status === "rejected" ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-sm">
                  <p className="text-red-300 font-medium">This shop has been rejected and cannot be used.</p>
                </div>
              ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatsCard
                icon="📦"
                label="Total Products"
                value={products.length}
                color="border-blue-500/30"
              />
              <StatsCard
                icon="📋"
                label="Queue Length"
                value={queue.length}
                color="border-amber-500/30"
              />
              <StatsCard
                icon="✅"
                label="Available"
                value={products.filter(p => p.isAvailable).length}
                color="border-emerald-500/30"
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
              {[
                { id: "products", label: "📦 Products Management", icon: "Products" },
                { id: "queue", label: "📋 Queue Management", icon: "Queue" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {renderTab()}
          </div>
              )}
            </div>
          );
        })()}
      </div>
    </main>
  );
}
