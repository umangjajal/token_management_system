import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Shops() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Get unique categories
  const categories = ["all", ...new Set(shops.map(s => s.category?.toLowerCase()))].filter(Boolean);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shops");
      setShops(res.data || []);
    } catch (err) {
      console.error("Failed to load shops:", err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort shops
  useEffect(() => {
    let filtered = shops.filter(shop => {
      const matchSearch = shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === "all" || 
        shop.category?.toLowerCase() === selectedCategory;
      return matchSearch && matchCategory;
    });

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "popular") {
      // Could sort by rating or queue length if available
      filtered.sort((a, b) => (b.counters || 0) - (a.counters || 0));
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredShops(filtered);
  }, [shops, searchTerm, selectedCategory, sortBy]);

  const handleJoinQueue = (shopId) => {
    navigate(`/queue/${shopId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Available Shops
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl">
            Browse and join queues at your favorite shops. Skip waiting in line with instant queue management.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search shops by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-3.5 text-slate-400">🔍</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="newest" className="bg-slate-900">Newest First</option>
            <option value="popular" className="bg-slate-900">Most Popular</option>
            <option value="alphabetical" className="bg-slate-900">A to Z</option>
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-medium">
            <span className="font-bold">{filteredShops.length}</span> shops found
          </div>
          <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium">
            ✅ All approved & ready to serve
          </div>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto"></div>
              <p className="text-slate-400">Loading shops...</p>
            </div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4 max-w-md">
              <div className="text-6xl">🏪</div>
              <h3 className="text-2xl font-semibold text-slate-100">No shops found</h3>
              <p className="text-slate-400 text-lg">
                {shops.length === 0 
                  ? "No shops available yet. Check back soon!" 
                  : "Try adjusting your search filters"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop._id}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative p-6 space-y-4 h-full flex flex-col">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                        {shop.name}
                      </h3>
                      <span className="text-2xl flex-shrink-0">🏪</span>
                    </div>
                    <span className="inline-block text-sm text-slate-100 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-medium">
                      {shop.category || "General"}
                    </span>
                  </div>

                  {/* Description */}
                  {shop.description && (
                    <p className="text-sm text-slate-300 line-clamp-2 flex-1 min-h-10">
                      {shop.description}
                    </p>
                  )}

                  {/* Info */}
                  <div className="space-y-2 text-xs text-slate-400">
                    {shop.address && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">📍</span>
                        <span className="line-clamp-1 pt-0.5">{shop.address}</span>
                      </div>
                    )}

                    {shop.openingHours && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">🕒</span>
                        <span className="line-clamp-1 pt-0.5">{shop.openingHours}</span>
                      </div>
                    )}

                    {shop.contactPhone && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">📞</span>
                        <a 
                          href={`tel:${shop.contactPhone}`}
                          className="text-blue-400 hover:text-blue-300 truncate pt-0.5"
                        >
                          {shop.contactPhone}
                        </a>
                      </div>
                    )}

                    {shop.website && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">🌐</span>
                        <a 
                          href={shop.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate pt-0.5"
                        >
                          Visit
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Queue indicator */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <span className="text-lg">👥</span>
                    <span className="text-xs text-slate-400">{shop.counters || 1} counter{(shop.counters || 1) > 1 ? "s" : ""}</span>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinQueue(shop._id)}
                    className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/50 active:scale-95"
                  >
                    Join Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {shops.length === 0 && !loading && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-amber-300">No shops available yet</h3>
            <p className="text-amber-200 max-w-md mx-auto text-lg">
              It looks like shopkeepers haven't set up their queues yet. Contact your local service providers to get them on the platform!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
