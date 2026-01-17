// web/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Shops from "./pages/Shops";
import ShopDetails from "./pages/ShopDetails";
import Cart from "./pages/Cart";
import VirtualLobby from "./pages/VirtualLobby";

import AdminDashboard from "./pages/AdminDashboard";
import ShopkeeperDashboard from "./pages/ShopkeeperDashboard";
import ShopOnboarding from "./pages/ShopOnboarding";
import AddProduct from "./pages/AddProduct";

export default function App() {
  const { user, loading, login, register, logout } = useAuth();

  /* =========================
     GLOBAL LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:shopId" element={<ShopDetails />} />

        {/* ================= AUTH ================= */}
        <Route
          path="/login"
          element={<Auth mode="login" onLogin={login} />}
        />
        <Route
          path="/register"
          element={<Auth mode="register" onRegister={register} />}
        />

        {/* ================= CUSTOMER ================= */}
        <Route
          path="/cart/:shopId"
          element={user ? <Cart /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/lobby/:tokenId"
          element={user ? <VirtualLobby /> : <Navigate to="/login" replace />}
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/dashboard/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= SHOPKEEPER ================= */}
        <Route
          path="/dashboard/shopkeeper"
          element={
            user?.role === "shopkeeper" ? (
              <ShopkeeperDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/onboard/shop"
          element={
            user?.role === "shopkeeper" ? (
              <ShopOnboarding user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/shopkeeper/add-product/:shopId"
          element={
            user?.role === "shopkeeper" ? (
              <AddProduct />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
