// web/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Product form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    unit: "pcs",
    description: "",
    whyPurchase: "",
    stock: "",
    isAvailable: true,
    shopId: ""
  });

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    console.log("\n📊 [ADMIN-DASHBOARD] Starting data load...");
    
    try {
      const token = localStorage.getItem("tms_token");
      console.log(`🔑 [ADMIN-DASHBOARD] Token present: ${token ? "YES" : "NO"}`);
      
      const responses = await Promise.allSettled([
        api.get("/admin/users"),
        api.get("/shops/all"),
        api.get("/products/all")
      ]);

      const [usersRes, shopsRes, productsRes] = responses;

      // Users
      if (usersRes.status === "fulfilled") {
        console.log(`✅ [ADMIN-DASHBOARD] Users loaded: ${usersRes.value.data?.length || 0}`);
        setUsers(usersRes.value.data || []);
      } else {
        console.error("❌ [ADMIN-DASHBOARD] Failed to load users");
        console.error(`   Error: ${usersRes.reason?.response?.status} - ${usersRes.reason?.response?.data?.message}`);
        setUsers([]);
      }

      // Shops - CRITICAL
      if (shopsRes.status === "fulfilled") {
        const shopCount = shopsRes.value.data?.length || 0;
        console.log(`✅ [ADMIN-DASHBOARD] Shops loaded: ${shopCount}`);
        if (shopCount > 0) {
          console.log(`   Shop names: ${shopsRes.value.data.map(s => `${s.name} (${s.status})`).join(", ")}`);
        } else {
          console.warn(`   ⚠️  No shops returned from API`);
        }
        setShops(shopsRes.value.data || []);
      } else {
        const statusCode = shopsRes.reason?.response?.status;
        const errorMsg = shopsRes.reason?.response?.data?.message;
        const errorDetails = shopsRes.reason?.message;
        console.error(`❌ [ADMIN-DASHBOARD] Failed to load shops`);
        console.error(`   Status: ${statusCode}`);
        console.error(`   Message: ${errorMsg}`);
        console.error(`   Details: ${errorDetails}`);
        console.error(`   Full error:`, shopsRes.reason);
        setShops([]);
      }

      // Products
      if (productsRes.status === "fulfilled") {
        console.log(`✅ [ADMIN-DASHBOARD] Products loaded: ${productsRes.value.data?.length || 0}`);
        setProducts(productsRes.value.data || []);
      } else {
        console.error("❌ [ADMIN-DASHBOARD] Failed to load products");
        console.error(`   Error: ${productsRes.reason?.response?.status} - ${productsRes.reason?.response?.data?.message}`);
        setProducts([]);
      }

      // Load analytics
      api
        .get("/admin/analytics")
        .then((res) => {
          console.log(`✅ [ADMIN-DASHBOARD] Analytics loaded`);
          setAnalytics(res.data);
        })
        .catch((err) => {
          console.error("❌ [ADMIN-DASHBOARD] Failed to load analytics:", err);
          setAnalytics(null);
        });
    } catch (err) {
      console.error("❌ [ADMIN-DASHBOARD] Critical load error", err);
    } finally {
      setLoading(false);
      console.log(`\n📊 [ADMIN-DASHBOARD] Data load complete`);
    }
  };

  // Search & Filter
  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShops = shops.filter((s) =>
    filterStatus === "all" ? true : s.status === filterStatus
  );

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Product CRUD
  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      unit: "pcs",
      description: "",
      whyPurchase: "",
      stock: "",
      isAvailable: true,
      shopId: ""
    });
    setEditingProduct(null);
    setImage(null);
    setImagePreview(null);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.shopId) {
      alert("Select a shop");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", productForm.name);
      fd.append("price", Number(productForm.price) || 0);
      fd.append("unit", productForm.unit);
      fd.append("stock", Number(productForm.stock) || 0);
      fd.append("description", productForm.description);
      fd.append("whyPurchase", productForm.whyPurchase);
      fd.append("isAvailable", productForm.isAvailable);

      if (image) fd.append("image", image);

      if (editingProduct) {
        await api.put(`/products/item/${editingProduct._id}`, fd);
      } else {
        await api.post(`/products/${productForm.shopId}`, fd);
      }

      resetProductForm();
      loadAllData();
    } catch (err) {
      console.error("Product save error", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/item/${id}`);
      loadAllData();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      loadAllData();
    } catch (err) {
      console.error("Role update error", err);
    }
  };

  const updateShopStatus = async (shopId, status) => {
    try {
      await api.put(`/shops/${shopId}/status`, { status });
      loadAllData();
    } catch (err) {
      console.error("Shop status error", err);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone."))
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadAllData();
    } catch (err) {
      console.error("Delete user error", err);
    }
  };

  // Stats cards
  const StatsCard = ({ label, value, color = "blue" }) => (
    <div
      className={`glass-card p-4 rounded-xl border ${
        color === "blue"
          ? "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent"
          : color === "green"
            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent"
            : color === "amber"
              ? "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent"
              : "border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent"
      }`}
    >
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p
        className={`text-3xl font-bold mt-2 ${
          color === "blue"
            ? "text-blue-300"
            : color === "green"
              ? "text-emerald-300"
              : color === "amber"
                ? "text-amber-300"
                : "text-purple-300"
        }`}
      >
        {value || 0}
      </p>
    </div>
  );

  // Tab content
  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-100">
              Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard label="Total Users" value={users.length} color="blue" />
              <StatsCard label="Total Shops" value={shops.length} color="green" />
              <StatsCard
                label="Total Products"
                value={products.length}
                color="amber"
              />
              <StatsCard
                label="Pending Shops"
                value={shops.filter((s) => s.status === "pending").length}
                color="purple"
              />
            </div>

            {analytics && (
              <div className="glass-card p-6 rounded-xl border border-white/10 space-y-4">
                <h3 className="text-sm font-medium text-slate-200">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Customers</p>
                    <p className="text-xl font-semibold text-blue-300">
                      {analytics.totalCustomers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Shopkeepers</p>
                    <p className="text-xl font-semibold text-green-300">
                      {analytics.totalShopkeepers || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Admins</p>
                    <p className="text-xl font-semibold text-purple-300">
                      {analytics.totalAdmins || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-100">
              Product Management
            </h2>

            {/* Add/Edit Product Form */}
            <div className="glass-card p-6 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                {editingProduct && (
                  <button
                    onClick={resetProductForm}
                    className="text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                {/* Shop Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Select Shop *
                  </label>
                  <select
                    value={productForm.shopId}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        shopId: e.target.value
                      }))
                    }
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  >
                    <option value="">Choose a shop...</option>
                    {shops.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          name: e.target.value
                        }))
                      }
                      className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="e.g., Coffee, Juice, Snacks"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          price: e.target.value
                        }))
                      }
                      className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={productForm.unit}
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          unit: e.target.value
                        }))
                      }
                      className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="pcs / kg / service"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Stock Available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          stock: e.target.value
                        }))
                      }
                      className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Product Image
                  </label>
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
                    className="w-full text-sm text-slate-400 file:rounded-lg file:border-0 file:bg-blue-500/20 file:px-4 file:py-2 file:text-xs file:font-medium file:text-blue-300 hover:file:bg-blue-500/30 transition"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg object-cover border border-white/10"
                      />
                    </div>
                  )}
                </div>

                {/* Description & Why Purchase */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        description: e.target.value
                      }))
                    }
                    rows={2}
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="Product details..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Why Purchase? (Highlight)
                  </label>
                  <textarea
                    value={productForm.whyPurchase}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        whyPurchase: e.target.value
                      }))
                    }
                    rows={2}
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="e.g., Best seller • Fresh daily • 30 min service"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isAvailable}
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          isAvailable: e.target.checked
                        }))
                      }
                      className="w-4 h-4 rounded border-white/10 bg-black/30 cursor-pointer"
                    />
                    <span>Available for customers</span>
                  </label>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition active:scale-95"
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="glass-card p-6 rounded-xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">
                  All Products ({products.length})
                </h3>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/8 transition"
                    >
                      <div className="flex gap-4 flex-1">
                        {product.imageUrl && (
                          <img
                            src={`http://localhost:5000${product.imageUrl}`}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover border border-white/10"
                          />
                        )}

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-100">
                              {product.name}
                            </p>
                            {!product.isAvailable && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/40 text-xs">
                                Unavailable
                              </span>
                            )}
                          </div>

                          {product.price > 0 && (
                            <p className="text-xs font-medium text-emerald-400">
                              ₹{product.price} / {product.unit || "unit"}
                            </p>
                          )}

                          {product.whyPurchase && (
                            <p className="text-xs text-amber-400">
                              ⭐ {product.whyPurchase}
                            </p>
                          )}

                          {product.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {product.description}
                            </p>
                          )}

                          <p className="text-xs text-slate-500">
                            Stock: {product.stock || 0} | Shop:{" "}
                            {shops.find((s) => s._id === product.shopId)?.name ||
                              "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-xs">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name || "",
                              price: product.price ?? "",
                              unit: product.unit || "pcs",
                              description: product.description || "",
                              whyPurchase: product.whyPurchase || "",
                              stock: product.stock ?? "",
                              isAvailable: product.isAvailable,
                              shopId: product.shopId || ""
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {searchTerm ? "No products found" : "No products yet"}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "shops":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Shop Management
              </h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="all">All Shops</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <div
                    key={shop._id}
                    className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <h3 className="text-sm font-semibold text-slate-100">
                          {shop.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {shop.category} · Owner:{" "}
                          {shop.ownerId?.name || "Unknown"}
                        </p>
                        {shop.address && (
                          <p className="text-xs text-slate-500">
                            📍 {shop.address}
                          </p>
                        )}
                        <div className="flex gap-2 items-center pt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              shop.status === "approved"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : shop.status === "rejected"
                                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {shop.status?.charAt(0).toUpperCase() +
                              shop.status?.slice(1)}
                          </span>
                        </div>
                      </div>

                      {shop.status === "pending" && (
                        <div className="flex flex-col gap-2 text-xs">
                          <button
                            onClick={() =>
                              updateShopStatus(shop._id, "approved")
                            }
                            className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateShopStatus(shop._id, "rejected")
                            }
                            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No shops found
                </p>
              )}
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                User Management
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="text-sm font-semibold text-slate-100">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-slate-500">
                          📞 {user.phone}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : user.role === "shopkeeper"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                : "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.emailVerified && (
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Email ✓
                          </span>
                        )}
                        {user.phoneVerified && (
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Phone ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      {user.role !== "admin" && (
                        <>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateUserRole(user._id, e.target.value)
                            }
                            className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          >
                            <option value="customer">Customer</option>
                            <option value="shopkeeper">Shopkeeper</option>
                          </select>

                          <button
                            onClick={() => deleteUser(user._id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {user.role === "admin" && (
                        <span className="text-slate-500 px-3 py-1.5">
                          Admin User
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No users found
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete system management hub
            </p>
          </div>
          <button
            onClick={loadAllData}
            className={`px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-sm font-medium transition ${
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh All"}
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 p-2 rounded-xl bg-black/30 border border-white/10 w-fit">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "products", label: "📦 Products" },
            { id: "shops", label: "🏪 Shops" },
            { id: "users", label: "👥 Users" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {loading && activeTab !== "overview" ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : (
            renderTab()
          )}
        </div>
      </div>
    </main>
  );
}
