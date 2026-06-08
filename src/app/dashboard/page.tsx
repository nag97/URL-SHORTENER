"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");
      setUser(user);

      const { data } = await supabase
        .from("short_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setUrls(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Links</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm border px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </div>

      <CreateLink
        onCreated={() => {
          supabase
            .from("short_links")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => setUrls(data || []));
        }}
        userId={user.id}
      />

      <div className="mt-8 flex flex-col gap-4">
        {urls.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No links yet. Create your first one!
          </p>
        )}
        {urls.map((url) => (
          <LinkCard
            key={url.id}
            url={url}
            onDeleted={() =>
              setUrls((prev) => prev.filter((u) => u.id !== url.id))
            }
          />
        ))}
      </div>
    </div>
  );
}

function CreateLink({
  onCreated,
  userId,
}: {
  onCreated: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleCreate() {
    if (!title || !originalUrl) return;
    setLoading(true);

    const code = customCode || Math.random().toString(36).substring(2, 8);

    const { error } = await supabase.from("short_links").insert({
      user_id: userId,
      code,
      original_url: originalUrl,
      title,
    });

    if (!error) {
      setTitle("");
      setOriginalUrl("");
      setCustomCode("");
      onCreated();
    }

    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-6">
      <h2 className="font-semibold mb-4">Create New Link</h2>
      <div className="flex flex-col gap-3">
        <input
          placeholder="Title (e.g. My Portfolio)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder="Long URL (e.g. https://google.com)"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          placeholder="Custom code (optional, e.g. mylink)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Short Link"}
        </button>
      </div>
    </div>
  );
}

function LinkCard({
  url,
  onDeleted,
}: {
  url: ShortLink;
  onDeleted: () => void;
}) {
  const supabase = createClient();
  const router = useRouter();
  const shortUrl = `${window.location.origin}/${url.code}`;

  async function handleDelete() {
    await supabase.from("short_links").delete().eq("id", url.id);
    onDeleted();
  }

  return (
    <div className="border rounded-lg p-4 flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{url.title}</p>
        <p className="text-blue-500 text-sm">{shortUrl}</p>
        <p className="text-gray-400 text-xs truncate max-w-sm">
          {url.original_url}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(shortUrl)}
          className="text-xs border px-2 py-1 rounded"
        >
          Copy
        </button>
        <button
          onClick={() => router.push(`/link/${url.id}`)}
          className="text-xs border px-2 py-1 rounded"
        >
          Stats
        </button>
        <button
          onClick={handleDelete}
          className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
