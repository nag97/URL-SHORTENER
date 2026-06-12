"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface ClickEvent {
  id: string
  country: string
  city: string
  device: string
  browser: string
  referrer: string
  clicked_at: string
}

interface ShortLink {
  id: string
  code: string
  original_url: string
  title: string
  created_at: string
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-white/10 rounded-xl p-5 text-center hover:border-white/20 transition-colors">
      <p className="text-4xl font-bold tracking-tight">{value}</p>
      <p className="text-white/40 text-sm mt-1">{label}</p>
    </div>
  )
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  return (
    <div className="border border-white/10 rounded-xl p-4">
      <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">{title}</h2>
      <div className="flex flex-col gap-2">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/80 capitalize">{label}</span>
                <span className="text-white/40">{count}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/30 rounded-full"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default function LinkPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [link, setLink] = useState<ShortLink | null>(null)
  const [clicks, setClicks] = useState<ClickEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth')

      const { data: linkData } = await supabase
        .from('short_links')
        .select('*')
        .eq('id', id)
        .single()

      if (!linkData) return router.push('/dashboard')
      setLink(linkData)

      const { data: clickData } = await supabase
        .from('click_events')
        .select('*')
        .eq('link_id', id)
        .order('clicked_at', { ascending: false })

      setClicks(clickData || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!link) return null

  const shortUrl = `${window.location.origin}/${link.code}`

  // Location: show "City, Country" when city is available
  const byLocation = clicks.reduce((acc, c) => {
    const key = c.city && c.city !== 'Unknown' && c.city !== ''
      ? `${c.city}, ${c.country}`
      : c.country || 'Unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byDevice = clicks.reduce((acc, c) => {
    acc[c.device || 'desktop'] = (acc[c.device || 'desktop'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byBrowser = clicks.reduce((acc, c) => {
    acc[c.browser || 'unknown'] = (acc[c.browser || 'unknown'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueCountries = new Set(clicks.map(c => c.country)).size

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="font-semibold text-lg tracking-tight">shortify</Link>
        <span className="text-white/20">/</span>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-white/40 hover:text-white transition-colors">
          Dashboard
        </button>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/60 truncate max-w-xs">{link.title}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Link card */}
        <div className="border border-white/10 rounded-xl p-5 mb-8 flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold mb-1">{link.title}</h1>
            <p className="text-blue-400 text-sm font-mono mb-1">{shortUrl}</p>
            <p className="text-white/30 text-xs truncate max-w-sm">{link.original_url}</p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 text-xs border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors px-3 py-1.5 rounded-md"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard value={clicks.length} label="Total Clicks" />
          <StatCard value={uniqueCountries} label="Countries" />
          <StatCard value={Object.keys(byDevice).length} label="Device Types" />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <BreakdownCard title="Device" data={byDevice} />
          <BreakdownCard title="Browser" data={byBrowser} />
        </div>
        <div className="mb-3">
          <BreakdownCard title="Location" data={byLocation} />
        </div>

        {/* Recent clicks */}
        <div className="border border-white/10 rounded-xl p-4">
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">Recent Clicks</h2>
          {clicks.length === 0 && (
            <p className="text-white/20 text-sm text-center py-4">No clicks yet</p>
          )}
          {clicks.slice(0, 15).map(click => (
            <div key={click.id} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-white/80">
                  {click.city && click.city !== 'Unknown' && click.city !== ''
                    ? `${click.city}, ${click.country}`
                    : click.country || 'Unknown'}
                </span>
                <span className="text-xs text-white/30 capitalize">
                  {click.device || 'desktop'} · {click.browser || 'unknown'}
                  {click.referrer ? ` · from ${new URL(click.referrer).hostname}` : ''}
                </span>
              </div>
              <span className="text-xs text-white/20 shrink-0 ml-4">
                {new Date(click.clicked_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}