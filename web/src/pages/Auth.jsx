import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { useAuth } from "../hooks/useAuth";

export default function Auth({ mode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();

  // Role can come from URL (e.g., ?role=shopkeeper) or default to customer
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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (selectedRole) => {
    setForm((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
        navigate("/");
      } else {
        await register(form);
        // Redirecting to login for email verification flow
        navigate("/login?verified=false"); 
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================
      GOOGLE LOGIN
  ===================== */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Firebase Client-side Popup
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // 2. Send Google Data + Current Selected Role to Backend
      const res = await googleLogin({
        email: googleUser.email,
        name: googleUser.displayName,
        googleId: googleUser.uid,
        role: form.role // Sends the role selected in the UI
      });

      // 3. Conditional Onboarding Logic
      // res.user contains the user record from the backend
      if (!res.user.phone) {
        // Redirect to profile to add missing info
        navigate("/profile?onboarding=true"); 
      } else {
        // Navigate based on role if profile is already complete
        if (res.user.role === "shopkeeper") {
          navigate("/onboard/shop");
        } else if (res.user.role === "admin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Google login error:", err);
      
      if (err.message && err.message.includes("Network Error") || !err.response) {
        setError("Cannot connect to server. Check your internet or backend CORS configuration.");
      } else {
        setError(err.response?.data?.message || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="glass-card w-full max-w-md p-8 space-y-6 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {mode === "login" ? "Enter your credentials to continue" : "Join the Token Management System"}
          </p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          {["customer", "shopkeeper", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                form.role === r 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1">
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number (+91...)"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
          )}

          <div className="space-y-1">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-white/10 py-3 rounded-xl text-slate-200 hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.48,16.68 6.48,13.5C6.48,10.31 9.03,7.74 12.19,7.74C13.9,7.74 15.6,8.36 16.67,9.35L18.73,7.35C17.21,5.97 14.8,5.01 12.19,5.01C7.5,5.01 3.75,8.81 3.75,13.5C3.75,18.19 7.5,21.99 12.19,21.99C16.88,21.99 21.62,18.75 21.62,13.5C21.62,12.63 21.48,11.85 21.35,11.1Z" />
          </svg>
          Google
        </button>

        <p className="text-center text-xs text-slate-500">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => navigate(mode === "login" ? "/register" : "/login")}
            className="text-blue-400 hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </main>
  );
}