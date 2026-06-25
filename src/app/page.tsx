"use client"

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";

function ComingSoonBadge() {
  return (
    <span className="text-[9px] bg-[#00ff41]/10 text-[#00ff41] px-1.5 py-0.5 rounded border border-[#00ff41]/20 ml-1.5 tracking-wide">
      SOON
    </span>
  );
}

export default function LandingPage() {
  const [toast, setToast] = useState<string | null>(null);

  function showComingSoon(label: string) {
    setToast(`${label} — coming soon`);
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <div className="bg-black min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a] border border-[#00ff41]/30 text-[#00ff41] text-[13px] px-4 py-2 rounded font-mono">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#00ff41]/15">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-7 text-[13px]">
            <button onClick={() => showComingSoon("About")} className="text-[#00b32d] hover:text-[#00ff41] transition-colors flex items-center">
              about<ComingSoonBadge />
            </button>
            <button onClick={() => showComingSoon("Pricing")} className="text-[#00b32d] hover:text-[#00ff41] transition-colors flex items-center">
              pricing<ComingSoonBadge />
            </button>
            <Link href="/auth" className="text-[#00b32d] hover:text-[#00ff41] transition-colors">
              sign_in
            </Link>
            <Link
              href="/auth"
              className="bg-[#00ff41] text-black px-4 py-1.5 rounded font-semibold hover:bg-[#00e63b] transition-colors"
            >
              get_started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 border border-[#00ff41]/20 rounded px-3 py-1 text-[11px] text-[#00b32d] mb-8 bg-[#00ff41]/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
          redis://cache · qstash://async-queue
        </div>

        <h1 className="text-[52px] sm:text-[76px] font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto text-[#00ff41]">
          every redirect.
          <br />
          <span className="text-white/90">cached &amp; instant.</span>
        </h1>

        <p className="mt-6 text-[16px] sm:text-[18px] text-[#00b32d] max-w-lg mx-auto leading-relaxed">
          cachelink resolves short links from an edge cache in milliseconds,
          and tracks every click through an async event pipeline.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth"
            className="text-[15px] bg-[#00ff41] text-black px-6 py-2.5 rounded font-semibold hover:bg-[#00e63b] transition-colors"
          >
            start_shortening →
          </Link>
          <a
            href="https://github.com/nag97/URL-SHORTENER"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] border border-[#00ff41]/30 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/60 transition-colors px-6 py-2.5 rounded font-medium"
          >
            view_source
          </a>
        </div>

        {/* Terminal-style stat block */}
        <div className="mt-20 max-w-md mx-auto border border-[#00ff41]/20 rounded-lg bg-[#0a0a0a] overflow-hidden text-left">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#00ff41]/15 bg-[#00ff41]/5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="text-[11px] text-[#00b32d] ml-2">cachelink — redirect.log</span>
          </div>
          <div className="p-4 text-[13px] space-y-1.5">
            <p className="text-[#00b32d]">$ curl -I cachelink.dev/abc123</p>
            <p className="text-white/70">cache: <span className="text-[#00ff41]">HIT</span></p>
            <p className="text-white/70">latency: <span className="text-[#00ff41] font-bold">2.8ms</span></p>
            <p className="text-white/70">queue: <span className="text-[#00ff41]">published → qstash</span></p>
            <p className="text-[#00b32d] cursor-blink">_</p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 px-6 border-t border-[#00ff41]/10">
        <div className="max-w-[1100px] mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { tag: "01", title: "edge cache", body: "Redis-backed lookups serve repeat redirects without touching the database." },
            { tag: "02", title: "async events", body: "Click data is queued and processed in the background — never blocking the redirect." },
            { tag: "03", title: "rate limited", body: "Sliding-window limits on Redis protect both redirects and link creation from abuse." },
          ].map((f) => (
            <div key={f.tag} className="border border-[#00ff41]/15 rounded-lg p-6 hover:border-[#00ff41]/40 transition-colors bg-[#00ff41]/[0.02]">
              <span className="text-[11px] text-[#00b32d]">{f.tag}</span>
              <h3 className="text-[18px] font-semibold mt-2 mb-2 text-[#00ff41]">{f.title}</h3>
              <p className="text-[13px] text-white/60 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-[#00ff41]/10">
        <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight text-[#00ff41]">
          ./start_shortening
        </h2>
        <p className="text-[15px] text-[#00b32d] mt-2">free · no credit card · 10 seconds</p>
        <Link
          href="/auth"
          className="inline-block mt-7 text-[15px] bg-[#00ff41] text-black px-7 py-3 rounded font-semibold hover:bg-[#00e63b] transition-colors"
        >
          create_account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00ff41]/10 py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-[#00663a]">
          <p>next.js · supabase · upstash redis + qstash · vercel</p>
          <p>© 2026 cachelink</p>
        </div>
      </footer>
    </div>
  );
}
