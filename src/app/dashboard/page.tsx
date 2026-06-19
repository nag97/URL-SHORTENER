"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ShortLink {
  id: string;
  code: string;
  original_url: string;
  title: string;
  created_at: string;
  expires_at: string | null;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  async function loadLinks(userId: string) {
    const { data } = await supabase
      .from("short_links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setUrls(data || []);
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");
      setUser(user);
      await loadLinks(user.id);
      setLoading(false);
    }
    load();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8ed] border-t-[#0071e3] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed]">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex justify-between items-center">
          <Link href="/" className="font-semibold text-[17px] tracking-tight">Shortify</Link>
          <div className="flex items-center gap-5">
            <span className="text-[12px] text-[#86868b] hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="text-[12px] text-[#0071e3] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[980px] mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-[40px] font-semibold tracking-tight">Your links</h1>
          <p className="text-[#86868b] text-[17px] mt-1">{urls.length} link{urls.length !== 1 ? "s" : ""}</p>
        </div>

        <CreateLink onCreated={() => loadLinks(user.id)} />

        <div className="mt-10 flex flex-col gap-3">
          {urls.length === 0 ? (
            <div className="text-center py-20 bg-[#f5f5f7] rounded-2xl">
              <p className="text-[#86868b] text-[17px]">No links yet. Create your first one above.</p>
            </div>
          ) : (
            urls.map((url) => (
              <LinkCard
                key={url.id}
                url={url}
                onDeleted={() => setUrls((prev) => prev.filter((u) => u.id !== url.id))}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function CreateLink({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!title || !originalUrl) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/links/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        original_url: originalUrl,
        code: customCode || undefined,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setTitle("");
      setOriginalUrl("");
      setCustomCode("");
      setExpiresAt("");
      onCreated();
    }

    setLoading(false);
  }

  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-7">
      <h2 className="text-[20px] font-semibold mb-5">Create a new link</h2>
      <div className="flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white border border-transparent rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] transition-colors"
          />
          <input
            placeholder="Custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="bg-white border border-transparent rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] transition-colors"
          />
        </div>
        <input
          placeholder="https://your-long-url.com"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="bg-white border border-transparent rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] transition-colors"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-[#86868b]">Expires (optional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="bg-white border border-transparent rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] transition-colors"
          />
        </div>
        {error && <p className="text-[#d70015] text-[13px]">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading || !title || !originalUrl}
          className="bg-[#0071e3] text-white font-medium py-3 rounded-xl text-[15px] hover:bg-[#0077ed] transition-colors disabled:opacity-40 self-start px-6 mt-1"
        >
          {loading ? "Creating…" : "Create link"}
        </button>
      </div>
    </div>
  );
}

function LinkCard({ url, onDeleted }: { url: ShortLink; onDeleted: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${url.code}`;
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpired = url.expires_at && new Date(url.expires_at) < new Date();

  async function handleDelete() {
    setDeleting(true);
    await supabase.from("short_links").delete().eq("id", url.id);
    await fetch("/api/cache-invalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: url.code }),
    }).catch(() => {});
    onDeleted();
    setDeleting(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`rounded-2xl px-6 py-5 flex justify-between items-center gap-4 transition-colors border ${isExpired ? "border-[#f5d4d4] bg-[#fff5f5]" : "border-[#e8e8ed] hover:border-[#0071e3]/30"}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[17px]">{url.title}</p>
          {isExpired && (
            <span className="text-[11px] bg-[#fde8e8] text-[#d70015] px-2 py-0.5 rounded-full font-medium">
              Expired
            </span>
          )}
        </div>
        <p className="text-[#0071e3] text-[14px]">{shortUrl.replace(/^https?:\/\//, '')}</p>
        <p className="text-[#86868b] text-[13px] truncate max-w-xs">{url.original_url}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="text-[13px] text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors px-3.5 py-2 rounded-full font-medium"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={() => router.push(`/link/${url.id}`)}
          className="text-[13px] text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors px-3.5 py-2 rounded-full font-medium"
        >
          Stats
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[13px] text-[#d70015] bg-[#fde8e8] hover:bg-[#fad6d6] transition-colors px-3.5 py-2 rounded-full font-medium disabled:opacity-40"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
