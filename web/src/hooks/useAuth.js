import { useState, useEffect } from "react";
import api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
      LOAD USER FROM TOKEN
  ========================= */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("tms_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Ensure the API instance has the token for the initial check
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.get("/user/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Session restoration failed:", err);
        localStorage.removeItem("tms_token");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* =========================
      LOGIN (EMAIL + PASSWORD)
  ========================= */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    
    const { token, user: userData } = res.data;
    localStorage.setItem("tms_token", token);
    
    // Set global header for subsequent requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return res.data;
  };

  /* =========================
      REGISTER
  ========================= */
  const register = async (payload) => {
    // Backend returns a message; user must verify email before logging in
    const res = await api.post("/auth/register", payload);
    return res.data;
  };

  /* =========================
      GOOGLE LOGIN
  ========================= */
  const googleLogin = async (googlePayload) => {
    try {
      const res = await api.post("/auth/google", googlePayload);
      
      const { token, user: userData } = res.data;
      localStorage.setItem("tms_token", token);
      
      // Update global API header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      
      // Return res.data so caller can check profile completeness (e.g., phone)
      return res.data;
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        throw new Error("Cannot connect to backend. Check CORS configuration on Railway.");
      }
      throw err;
    }
  };

  /* =========================
      LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("tms_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return {
    user,
    setUser, // Added to allow updating user state after profile edits
    loading,
    login,
    register,
    googleLogin,
    logout
  };
}