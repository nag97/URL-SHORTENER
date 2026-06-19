import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed]">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <span className="font-semibold text-[17px] tracking-tight">Shortify</span>
          <div className="flex items-center gap-8">
            <Link href="/auth" className="text-[12px] text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth"
              className="text-[12px] bg-[#0071e3] text-white px-4 py-1.5 rounded-full hover:bg-[#0077ed] transition-colors font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 text-center">
        <h1 className="text-[56px] sm:text-[80px] font-semibold tracking-tight leading-[1.05] max-w-3xl mx-auto">
          Every link.
          <br />
          <span className="text-[#86868b]">Beautifully short.</span>
        </h1>
        <p className="mt-6 text-[21px] sm:text-[24px] text-[#86868b] max-w-xl mx-auto leading-snug font-normal">
          Shortify turns long links into short ones, redirects in milliseconds,
          and shows you exactly who clicked.
        </p>
        <div className="mt-9 flex items-center justify-center gap-5">
          <Link
            href="/auth"
            className="text-[17px] bg-[#0071e3] text-white px-6 py-2.5 rounded-full hover:bg-[#0077ed] transition-colors font-medium"
          >
            Get started
          </Link>
          <a
            href="https://github.com/nag97/URL-SHORTENER"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[17px] text-[#0071e3] hover:underline flex items-center gap-1"
          >
            View source <span aria-hidden>›</span>
          </a>
        </div>
      </section>

      {/* Big stat callout — Apple spec-sheet style */}
      <section className="bg-[#f5f5f7] py-24 px-6">
        <div className="max-w-[980px] mx-auto text-center">
          <p className="text-[19px] text-[#86868b] mb-2">Redirect speed</p>
          <p className="text-[120px] sm:text-[160px] font-semibold tracking-tight leading-none">
            3<span className="text-[#86868b] text-[60px] sm:text-[80px] font-medium">ms</span>
          </p>
          <p className="text-[19px] text-[#86868b] mt-4 max-w-md mx-auto">
            Every click is served from a Redis cache at the edge,
            so the database never slows you down.
          </p>
        </div>
      </section>

      {/* Three feature cards */}
      <section className="py-24 px-6">
        <div className="max-w-[980px] mx-auto grid sm:grid-cols-3 gap-4">
          {[
            {
              title: "Instant redirects",
              body: "Links resolve from cache in milliseconds, falling back gracefully when needed.",
            },
            {
              title: "Async analytics",
              body: "Every click is queued and processed in the background — your redirects never wait.",
            },
            {
              title: "Built-in protection",
              body: "Rate limiting and link expiry keep your links safe from abuse, automatically.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#f5f5f7] rounded-2xl p-8">
              <h3 className="text-[22px] font-semibold mb-2">{f.title}</h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="py-24 px-6 text-center border-t border-[#e8e8ed]">
        <h2 className="text-[40px] sm:text-[48px] font-semibold tracking-tight">
          Start shortening today.
        </h2>
        <p className="text-[19px] text-[#86868b] mt-3">It takes about ten seconds.</p>
        <Link
          href="/auth"
          className="inline-block mt-8 text-[17px] bg-[#0071e3] text-white px-7 py-3 rounded-full hover:bg-[#0077ed] transition-colors font-medium"
        >
          Create your first link
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e8ed] py-8 px-6">
        <div className="max-w-[980px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[12px] text-[#86868b]">
            Built with Next.js, Supabase, and Upstash.
          </p>
          <p className="text-[12px] text-[#86868b]">© 2026 Shortify</p>
        </div>
      </footer>
    </div>
  );
}
