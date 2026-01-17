// web/src/pages/Auth.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import api from "../services/api";

export default function Auth({ mode, onLogin, onRegister }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const defaultRole = params.get("role") || "customer";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: defaultRole
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================
     HANDLERS
  ===================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await onLogin(form.email, form.password);
        navigate("/");
      } else {
        await onRegister(form);

        if (form.role === "shopkeeper") navigate("/onboard/shop");
        else if (form.role === "admin") navigate("/dashboard/admin");
        else navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
     GOOGLE LOGIN
  ===================== */
  const handleGoogleLogin = async () => {
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await api.post("/auth/google", {
        email: user.email,
        name: user.displayName,
        googleId: user.uid
      });

      localStorage.setItem("tms_token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error("Google login failed", err);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-lg font-semibold text-slate-100">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "login"
              ? "Login to continue"
              : "Sign up to get started"}
          </p>
        </div>

        {/* ROLE SELECT */}
        {mode === "register" && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {["customer", "shopkeeper", "admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role }))}
                className={`py-2 rounded-xl border transition ${
                  form.role === role
                    ? "border-primary-500 bg-primary-600/30 text-primary-100"
                    : "border-white/5 bg-white/5 text-slate-300"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                className="input"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex-1 h-px bg-white/10" />
          OR
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border border-white/10 py-2 text-sm
                     text-slate-200 hover:bg-white/5 transition"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
