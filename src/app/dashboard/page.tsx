"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#00ff41]/15">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#00b32d] hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="text-[12px] border border-[#00ff41]/20 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/50 transition-colors px-3 py-1.5 rounded"
            >
              sign_out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#00ff41]">your_links</h1>
          <p className="text-[#00b32d] text-[13px] mt-1">{urls.length} link{urls.length !== 1 ? "s" : ""} total</p>
        </div>

        <CreateLink onCreated={() => loadLinks(user.id)} />

        <div className="mt-8 flex flex-col gap-3">
          {urls.length === 0 ? (
            <div className="text-center py-16 border border-[#00ff41]/15 rounded-lg border-dashed">
              <p className="text-[#00663a] text-[13px]">no links yet. create your first one above.</p>
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
  const [open, setOpen] = useState(true);

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
      setError(data.error || "something went wrong");
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
    <div className="border border-[#00ff41]/20 rounded-lg overflow-hidden bg-[#0a0a0a]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-3.5 text-left hover:bg-[#00ff41]/5 transition-colors border-b border-[#00ff41]/10"
      >
        <span className="font-semibold text-[13px] text-[#00ff41]">./create_link</span>
        <span className="text-[#00b32d] text-lg leading-none">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-5 flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black border border-[#00ff41]/20 rounded px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff41]/60 transition-colors"
            />
            <input
              placeholder="custom_code (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="bg-black border border-[#00ff41]/20 rounded px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff41]/60 transition-colors"
            />
          </div>
          <input
            placeholder="https://your-long-url.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="bg-black border border-[#00ff41]/20 rounded px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff41]/60 transition-colors"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#00b32d]">expires_at (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-black border border-[#00ff41]/20 rounded px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#00ff41]/60 transition-colors [color-scheme:dark]"
            />
          </div>
          {error && <p className="text-[#ff5f56] text-[12px]">error: {error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading || !title || !originalUrl}
            className="bg-[#00ff41] text-black font-semibold py-2 rounded text-[13px] hover:bg-[#00e63b] transition-colors disabled:opacity-30 self-start px-5 mt-1"
          >
            {loading ? "creating..." : "create_link →"}
          </button>
        </div>
      )}
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
    <div className={`border rounded-lg px-5 py-4 flex justify-between items-center gap-4 transition-colors bg-[#0a0a0a] ${isExpired ? "border-[#ff5f56]/30" : "border-[#00ff41]/15 hover:border-[#00ff41]/40"}`}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[14px] text-white">{url.title}</p>
          {isExpired && (
            <span className="text-[9px] bg-[#ff5f56]/10 text-[#ff5f56] px-1.5 py-0.5 rounded border border-[#ff5f56]/30">
              EXPIRED
            </span>
          )}
        </div>
        <p className="text-[#00ff41] text-[12px]">/{url.code}</p>
        <p className="text-[#00663a] text-[11px] truncate max-w-xs">{url.original_url}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="text-[11px] border border-[#00ff41]/20 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/50 transition-colors px-2.5 py-1.5 rounded"
        >
          {copied ? "copied" : "copy"}
        </button>
        <button
          onClick={() => router.push(`/link/${url.id}`)}
          className="text-[11px] border border-[#00ff41]/20 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/50 transition-colors px-2.5 py-1.5 rounded"
        >
          stats
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[11px] border border-[#ff5f56]/30 text-[#ff5f56]/70 hover:text-[#ff5f56] hover:border-[#ff5f56]/60 transition-colors px-2.5 py-1.5 rounded disabled:opacity-40"
        >
          {deleting ? "..." : "delete"}
        </button>
      </div>
    </div>
  );
}
