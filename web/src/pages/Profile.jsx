import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isOnboarding = searchParams.get("onboarding") === "true";
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Sync form with user data when it loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put("/user/profile", form);
      setUser(res.data.user); // Update global state
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // If they just finished onboarding, send them home after a delay
      if (isOnboarding) {
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
        <p className="text-slate-400 text-sm mb-6">
          {isOnboarding ? "Please complete your details to continue." : "Manage your account settings."}
        </p>

        {isOnboarding && (
          <div className="mb-6 p-3 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-200 text-xs">
            👋 Welcome! We just need a few more details to get your account ready.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Email (Read-only)</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          {message.text && (
            <p className={`text-sm text-center ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}