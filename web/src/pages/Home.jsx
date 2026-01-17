import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live token tracking · Location aware
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-100">
            Skip the line, not the{" "}
            <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-accent-400 bg-clip-text text-transparent">
              service
            </span>
            .
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-lg">
            Join queues remotely, track your token in real-time, and let your exact
            location power smarter ETAs. Built for shops, clinics, salons, and
            service centers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              I&apos;m a customer
            </Link>
            <Link to="/register?role=shopkeeper" className="btn-ghost">
              I&apos;m a shopkeeper
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-xs text-slate-300 max-w-xs">
            <div>
              <dt className="text-lg font-semibold text-slate-100">3x</dt>
              <dd>Faster check-ins</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-slate-100">24/7</dt>
              <dd>Cloud hosted</dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-slate-100">Privacy</dt>
              <dd>Location with consent</dd>
            </div>
          </dl>
        </section>
        <section className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-medium text-slate-100 flex items-center gap-2">
            Realtime token preview
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </h2>
          <div className="grid gap-3 text-xs">
            <div className="rounded-xl bg-gradient-to-r from-primary-600/40 via-indigo-600/40 to-accent-500/40 p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-200/80">
                  Your token
                </p>
                <p className="text-2xl font-semibold text-slate-50">A-23</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-100/80">Estimated wait</p>
                <p className="text-sm font-medium text-slate-50">12 min</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] text-slate-400">Ahead of you</p>
                <p className="text-lg font-semibold text-slate-100">4</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] text-slate-400">Distance</p>
                <p className="text-lg font-semibold text-slate-100">0.8 km</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] text-slate-400">Mode</p>
                <p className="text-lg font-semibold text-slate-100">Walk</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Your exact location is used only while your token is active and is never
              shared with other customers.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
