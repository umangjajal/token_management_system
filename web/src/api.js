import axios from "axios";

const api = axios.create({
  // Prioritizes the production URL from your environment variables
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
api.interceptors.request.use(
  (config) => {
    // Synchronized with localStorage key used in Auth.jsx and useAuth.js
    const token = localStorage.getItem("tms_token");

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
    // Handle cases where the server is down or CORS blocks the request
    if (!error.response) {
      console.error("Connection Error: The server is unreachable or CORS is blocking the request.");
      return Promise.reject({
        ...error,
        message: "Unable to connect to the server. Please check your internet or CORS settings."
      });
    }

    const { status, data } = error.response;

    // Handle unauthorized access or expired tokens
    if (status === 401) {
      localStorage.removeItem("tms_token");
      
      // Only redirect to login if the user isn't already trying to authenticate
      const isAuthPage = window.location.pathname.includes("/login") || 
                         window.location.pathname.includes("/register");
                         
      if (!isAuthPage) {
        window.location.href = "/login?session=expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;