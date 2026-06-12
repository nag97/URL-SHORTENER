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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-semibold text-lg tracking-tight">shortify</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors px-3 py-1.5 rounded-md"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Your links</h1>
          <p className="text-white/40 text-sm mt-1">{urls.length} link{urls.length !== 1 ? "s" : ""} total</p>
        </div>

        <CreateLink onCreated={() => loadLinks(user.id)} userId={user.id} />

        <div className="mt-8 flex flex-col gap-3">
          {urls.length === 0 ? (
            <div className="text-center py-16 border border-white/10 rounded-xl border-dashed">
              <p className="text-white/30 text-sm">No links yet. Create your first one above.</p>
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

function CreateLink({ onCreated, userId }: { onCreated: () => void; userId: string }) {
  const [title, setTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  const supabase = createClient();

  async function handleCreate() {
    if (!title || !originalUrl) return;
    setLoading(true);
    setError("");

    const code = customCode || Math.random().toString(36).substring(2, 8);

    const { error } = await supabase.from("short_links").insert({
      user_id: userId,
      code,
      original_url: originalUrl,
      title,
    });

    if (error) {
      setError(error.message.includes("duplicate") ? "That custom code is already taken." : error.message);
    } else {
      setTitle("");
      setOriginalUrl("");
      setCustomCode("");
      onCreated();
    }

    setLoading(false);
  }

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-medium text-sm">New link</span>
        <span className="text-white/30 text-lg leading-none">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-white/10 pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
            <input
              placeholder="Custom code (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <input
            placeholder="https://your-long-url.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading || !title || !originalUrl}
            className="bg-white text-black font-medium py-2 rounded-md text-sm hover:bg-white/90 transition-colors disabled:opacity-40 self-start px-5"
          >
            {loading ? "Creating..." : "Create link"}
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
    <div className="border border-white/10 rounded-xl px-5 py-4 flex justify-between items-center gap-4 hover:border-white/20 transition-colors group">
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="font-medium text-sm">{url.title}</p>
        <p className="text-blue-400 text-xs font-mono">/{url.code}</p>
        <p className="text-white/30 text-xs truncate max-w-xs">{url.original_url}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="text-xs border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors px-2.5 py-1.5 rounded-md"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={() => router.push(`/link/${url.id}`)}
          className="text-xs border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors px-2.5 py-1.5 rounded-md"
        >
          Stats
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-colors px-2.5 py-1.5 rounded-md disabled:opacity-40"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}