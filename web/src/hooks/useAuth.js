import { useState, useEffect } from "react";
import api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD USER FROM TOKEN
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("tms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/user/profile")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("tms_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     LOGIN
  ========================= */
  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password
    });

    localStorage.setItem("tms_token", res.data.token);
    setUser(res.data.user);
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);

    localStorage.setItem("tms_token", res.data.token);
    setUser(res.data.user);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("tms_token");
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
