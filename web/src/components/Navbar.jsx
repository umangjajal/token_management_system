import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path ? "text-primary-400" : "text-slate-300";

  return (
    <header className="sticky top-0 z-20 bg-bg-dark/70 backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto max-w-6xl flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-primary-500 via-indigo-500 to-accent-500 flex items-center justify-center shadow-glow">
            <span className="text-xs font-bold">TMS</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-100">
              Token Management
            </span>
            <span className="text-xs text-slate-400">Smart queues, less wait</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/shops" className={isActive("/shops")}>
            Shops
          </Link>
          {user?.role === "shopkeeper" && (
            <Link
              to="/dashboard/shopkeeper"
              className={isActive("/dashboard/shopkeeper")}
            >
              Shopkeeper
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/dashboard/admin" className={isActive("/dashboard/admin")}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-100">{user.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
              </div>
              <button onClick={onLogout} className="btn-ghost text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-xs">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-xs">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
