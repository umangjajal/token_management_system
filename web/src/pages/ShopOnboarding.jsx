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
        if (res.data.length > 0) {
          setHasShop(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Try to capture coordinates for the shop address as initial location
      let coordinates = undefined;
      try {
        const loc = await getHighAccuracyLocation();
        coordinates = { lat: loc.lat, lng: loc.lng };
      } catch (e) {
        // ignore if user denies
      }

      await api.post("/shops", {
        ...form,
        coordinates
      });

      setHasShop(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-slate-300">Checking your shop status...</p>
      </main>
    );
  }

  if (hasShop) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <div className="glass-card p-6 space-y-3">
          <h1 className="text-lg font-semibold text-slate-100">
            Your shop is submitted
          </h1>
          <p className="text-sm text-slate-300">
            Your shop details have been sent for admin approval. Once approved,
            it will appear in your Shopkeeper dashboard and customers will be
            able to see it.
          </p>
          <button
            className="btn-primary text-xs"
            onClick={() => navigate("/dashboard/shopkeeper")}
          >
            Go to shopkeeper dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="glass-card p-6 space-y-5 text-sm">
        <h1 className="text-xl font-semibold text-slate-100">
          Set up your business
        </h1>
        <p className="text-xs text-slate-300">
          Tell us about your shop so customers and admins can clearly understand
          your services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                Shop name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                Category *
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                placeholder="Salon, Clinic, Service Center..."
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Address</label>
            <textarea
              name="address"
              rows={2}
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Street, area, city, pincode"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">
              Opening hours
            </label>
            <input
              name="openingHours"
              value={form.openingHours}
              onChange={handleChange}
              placeholder="Mon–Sat, 10:00 AM – 8:00 PM"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                Business registration number
              </label>
              <input
                name="businessRegistrationNumber"
                value={form.businessRegistrationNumber}
                onChange={handleChange}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                GST number
              </label>
              <input
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                Contact email
              </label>
              <input
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">
                Contact phone
              </label>
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">
              About your shop
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="What services do you offer? What makes your shop special?"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-400 pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs mt-2"
          >
            {saving ? "Submitting..." : "Submit shop for approval"}
          </button>
        </form>
      </div>
    </main>
  );
}
