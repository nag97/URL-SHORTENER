import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-lg tracking-tight">shortify</span>
        <div className="flex gap-3">
          <Link
            href="/auth"
            className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link
            href="/auth"
            className="text-sm bg-white text-black font-medium px-3 py-1.5 rounded-md hover:bg-white/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3 py-1 text-xs text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Redis-cached redirects · QStash async analytics
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-2xl">
          Short links.
          <br />
          <span className="text-white/40">Fast redirects.</span>
        </h1>

        <p className="mt-6 text-white/50 text-lg max-w-md leading-relaxed">
          Create short links that redirect in milliseconds. Track every click
          with real-time analytics.
        </p>

        <div className="mt-10 flex gap-3">
          <Link
            href="/auth"
            className="bg-white text-black font-medium px-5 py-2.5 rounded-md hover:bg-white/90 transition-colors text-sm"
          >
            Start shortening →
          </Link>
          <a
            href="https://github.com/nag97/URL-SHORTENER"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors font-medium px-5 py-2.5 rounded-md text-sm"
          >
            View source
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-12 border-t border-white/10 pt-12">
          {[
            { value: "~3ms", label: "Redirect latency" },
            { value: "24h", label: "Redis TTL cache" },
            { value: "Async", label: "Click tracking" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-semibold">{stat.value}</span>
              <span className="text-sm text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/30">
        Built with Next.js · Supabase · Upstash Redis + QStash · Vercel
      </footer>
    </div>
  );
}