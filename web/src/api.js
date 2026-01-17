import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000, // prevents hanging requests
  headers: {
    "Content-Type": "application/json"
  }
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   RESPONSE INTERCEPTOR
============================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error / backend down
      console.error("Network error or server not reachable");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Token expired → force logout
    if (status === 401 && data?.code === "TOKEN_EXPIRED") {
      localStorage.removeItem("token");

      // Prevent redirect loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
