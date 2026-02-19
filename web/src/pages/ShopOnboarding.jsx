import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getHighAccuracyLocation } from "../utils/location";

export default function ShopOnboarding({ user }) {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingShops, setExistingShops] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    address: "",
    openingHours: "",
    businessRegistrationNumber: "",
    gstNumber: "",
    contactEmail: "",
    contactPhone: "",
    website: ""
  });

  useEffect(() => {
    if (!user || user.role !== "shopkeeper") {
      navigate("/");
      return;
    }

    api
      .get("/shops/mine")
      .then((res) => {
        console.log("[SHOPKEEPER] Shops fetched:", res.data);
        setExistingShops(res.data || []);
        if (res.data && res.data.length > 0) {
          setHasShop(true);
        }
      })
      .catch((err) => {
        console.error("[SHOPKEEPER] Error fetching shops:", err);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      console.log("[SHOPKEEPER] Submitting shop form:", form);
      
      // Try to capture coordinates for the shop address as initial location
      let coordinates = undefined;
      try {
        const loc = await getHighAccuracyLocation();
        coordinates = { lat: loc.lat, lng: loc.lng };
      } catch (e) {
        console.warn("Location capture skipped:", e.message);
      }

      const response = await api.post("/shops", {
        ...form,
        coordinates
      });
      
      console.log("[SHOPKEEPER] Shop created successfully:", response.data);
      setSuccess(true);
      setForm({
        name: "",
        category: "",
        description: "",
        address: "",
        openingHours: "",
        businessRegistrationNumber: "",
        gstNumber: "",
        contactEmail: "",
        contactPhone: "",
        website: ""
      });
      
      // Reload shops list
      setTimeout(() => {
        api.get("/shops/mine")
          .then((res) => {
            setExistingShops(res.data || []);
            setHasShop(true);
          })
          .catch(console.error);
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create shop";
      console.error("[SHOPKEEPER] Error creating shop:", errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Checking your shop status...</p>
        </div>
      </main>
    );
  }

  if (hasShop && existingShops.length > 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-8 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-5xl">✅</span>
              <div className="space-y-2 flex-1">
                <h1 className="text-2xl font-bold text-emerald-300">
                  Shop(s) Registered
                </h1>
                <p className="text-emerald-200">
                  Your shop details have been submitted for admin approval. Once approved, customers will be able to see your shop and join your queue.
                </p>
              </div>
            </div>

            {/* Existing shops display */}
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-emerald-300">Your Shops:</h3>
              {existingShops.map((shop) => (
                <div key={shop._id} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                  <p className="font-semibold text-slate-100">{shop.name}</p>
                  <p className="text-sm text-slate-400">{shop.category}</p>
                  <div className="flex items-center gap-2 text-xs pt-2">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      shop.status === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                      shop.status === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                      "bg-red-500/20 text-red-300 border border-red-500/40"
                    }`}>
                      {shop.status === "pending" ? "⏳ Pending" : shop.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all mt-4"
              onClick={() => navigate("/dashboard/shopkeeper")}
            >
              Go to Shopkeeper Dashboard
            </button>
          </div>

          {/* Option to add another shop */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Add Another Shop</h2>
            <p className="text-slate-300 mb-6 text-sm">You can manage multiple shops. Fill the form below to add another one.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Shop name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Your Shop Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Category *</label>
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Salon, Clinic, Store, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="What services do you offer?"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Phone</label>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Email</label>
                  <input
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-emerald-300 text-sm">✅ Shop added successfully!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Add This Shop"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-100">Register Your Shop</h1>
          <p className="text-slate-400 text-lg">Get started by adding your business details</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Shop name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Your Shop Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Category *</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Salon, Clinic, Store, Barber..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Address</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Street, Area, City, Pincode"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Opening Hours</label>
              <input
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Mon–Sat, 10:00 AM – 8:00 PM"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contact Phone</label>
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contact Email</label>
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="What services do you offer? What makes your shop special?"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">GST Number (optional)</label>
                <input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="27AAPCU1234H1Z0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Website (optional)</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="https://yourshop.com"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-300 text-sm"><strong>Error:</strong> {error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-emerald-300 text-sm">✅ Shop created successfully! Reloading...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all active:scale-95 disabled:opacity-50 text-lg"
            >
              {saving ? "Submitting..." : "Submit Shop for Approval"}
            </button>

            <p className="text-xs text-slate-400 text-center">
              ⏳ Your shop will be reviewed by our admin team. You'll be notified once it's approved.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
