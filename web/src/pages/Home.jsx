import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-sm font-medium text-blue-300">✨ Live Token Tracking</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-slate-100">Skip the line,</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  not the service
                </span>
                <span className="text-slate-100">.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                Join queues remotely, track your token in real-time, and let your exact location power smarter ETAs. Built for shops, clinics, salons, and service centers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/register" 
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 text-center"
              >
                👤 I'm a Customer
              </Link>
              <Link 
                to="/register?role=shopkeeper" 
                className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 hover:border-blue-500/50 active:scale-95 text-center backdrop-blur-sm"
              >
                🏪 I'm a Shopkeeper
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-300">3x</p>
                <p className="text-sm text-slate-400">Faster check-ins</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-cyan-300">24/7</p>
                <p className="text-sm text-slate-400">Cloud hosted</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-emerald-300">100%</p>
                <p className="text-sm text-slate-400">Privacy secure</p>
              </div>
            </div>
          </div>

          {/* Right: Demo Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
            
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 backdrop-blur-xl space-y-6 hover:border-blue-500/30 transition-all duration-300">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-3xl">📋</span> Live Token Preview
                </h2>
                <p className="text-sm text-slate-400">See how it works in real-time</p>
              </div>

              {/* Token Display */}
              <div className="space-y-4">
                {/* Main Token */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-purple-600/20 border border-blue-500/30 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-slate-400">Your Token</p>
                      <p className="text-5xl font-bold text-slate-100">A-23</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-slate-400">Wait Time</p>
                      <p className="text-3xl font-bold text-emerald-300">12 min</p>
                    </div>
                  </div>
                </div>

                {/* Status Cards Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1 hover:border-blue-500/40 transition-all">
                    <p className="text-xs text-slate-400">Ahead</p>
                    <p className="text-2xl font-bold text-slate-100">4</p>
                    <p className="text-[10px] text-slate-500">persons</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1 hover:border-blue-500/40 transition-all">
                    <p className="text-xs text-slate-400">Distance</p>
                    <p className="text-2xl font-bold text-cyan-300">0.8 km</p>
                    <p className="text-[10px] text-slate-500">away</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1 hover:border-blue-500/40 transition-all">
                    <p className="text-xs text-slate-400">Speed</p>
                    <p className="text-2xl font-bold text-emerald-300">📍</p>
                    <p className="text-[10px] text-slate-500">tracking</p>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 space-y-2">
                  <p className="text-xs font-semibold text-blue-300 flex items-center gap-2">
                    <span>🔒</span> Privacy Guaranteed
                  </p>
                  <p className="text-xs text-blue-200">
                    Your location is shared only with the shopkeeper while your token is active and never with other customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100">
              Why Choose Token<span className="text-blue-400">.io</span>?
            </h2>
            <p className="text-lg text-slate-400">Everything you need for smarter queue management</p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Real-time Updates",
                description: "Get instant notifications about your queue position and wait time estimates"
              },
              {
                icon: "📍",
                title: "Location Awareness",
                description: "Smart ETAs based on your location with optional privacy protection"
              },
              {
                icon: "📱",
                title: "Mobile First",
                description: "Seamless experience on all devices with offline support"
              },
              {
                icon: "🔐",
                title: "Privacy First",
                description: "Your data is encrypted and shared only with your consent"
              },
              {
                icon: "💰",
                title: "Free to Use",
                description: "No hidden fees for customers. Simple pricing for businesses"
              },
              {
                icon: "🚀",
                title: "Scalable",
                description: "Works for a single shop or an entire retail chain"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="relative space-y-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-purple-600/10 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-transparent to-purple-500/0 opacity-50"></div>
            
            <div className="relative space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100">
                Ready to <span className="text-blue-300">skip the line?</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Join thousands of happy customers and shopkeepers using Token.io
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link 
                  to="/register" 
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  Get Started Free
                </Link>
                <Link 
                  to="/shops" 
                  className="px-8 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 hover:border-blue-500/50 backdrop-blur-sm"
                >
                  Browse Shops
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer stats */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-blue-300">10K+</p>
            <p className="text-sm text-slate-400">Active Users</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-cyan-300">500+</p>
            <p className="text-sm text-slate-400">Businesses</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-emerald-300">42K+</p>
            <p className="text-sm text-slate-400">Tokens Served</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-purple-300">99.9%</p>
            <p className="text-sm text-slate-400">Uptime</p>
          </div>
        </div>
      </section>
    </main>
  );
}
