"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { Logo } from "@/components/Logo"

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

function cleanDevice(device: string): string {
  if (!device || device === 'desktop') return 'desktop'
  if (device.length <= 2 || /^[A-Z0-9\-]+$/.test(device)) return 'android'
  return device.toLowerCase()
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[44px] font-bold tracking-tight leading-none text-[#00ff41]">{value}</p>
      <p className="text-[#00b32d] text-[12px] mt-1">{label}</p>
    </div>
  )
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  return (
    <div className="border border-[#00ff41]/15 rounded-lg p-5 bg-[#0a0a0a]">
      <h2 className="text-[11px] font-medium text-[#00b32d] uppercase tracking-widest mb-4">{title}</h2>
      <div className="flex flex-col gap-3">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <div key={label}>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-white/80">{label}</span>
                <span className="text-[#00b32d]">{count}</span>
              </div>
              <div className="h-[3px] bg-[#00ff41]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ff41] rounded-full transition-all"
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
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth')
      setUser(user)

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin" />
      </div>
    )
  }

  if (!link) return null

  const shortUrl = `${window.location.origin}/${link.code}`

  const byLocation = clicks.reduce((acc, c) => {
    const city = c.city && c.city !== 'Unknown' && c.city !== '' ? c.city : null
    const key = city ? `${city}, ${c.country}` : c.country || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const consolidatedLocation: Record<string, number> = {}
  for (const [key, count] of Object.entries(byLocation)) {
    const hasCityEntry = Object.keys(byLocation).some(k => k !== key && k.endsWith(`, ${key}`))
    if (hasCityEntry) {
      const cityKey = Object.keys(byLocation).find(k => k !== key && k.endsWith(`, ${key}`))!
      consolidatedLocation[cityKey] = (consolidatedLocation[cityKey] || byLocation[cityKey]) + count
    } else {
      consolidatedLocation[key] = (consolidatedLocation[key] || 0) + count
    }
  }

  const byDevice = clicks.reduce((acc, c) => {
    const d = cleanDevice(c.device)
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byBrowser = clicks.reduce((acc, c) => {
    acc[(c.browser || 'unknown').toLowerCase()] = (acc[(c.browser || 'unknown').toLowerCase()] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueCountries = new Set(clicks.map(c => c.country)).size

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#00ff41]/15">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-[#00663a]">/</span>
            <button onClick={() => router.push('/dashboard')} className="text-[12px] text-[#00b32d] hover:text-[#00ff41] transition-colors">
              dashboard
            </button>
            <span className="text-[#00663a]">/</span>
            <span className="text-[12px] text-white/70 truncate max-w-[140px]">{link.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#00663a] hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="text-[11px] border border-[#00ff41]/20 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/50 transition-colors px-3 py-1.5 rounded">
              sign_out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-6 py-12">
        {/* Link header */}
        <div className="border border-[#00ff41]/15 rounded-lg p-5 mb-8 flex justify-between items-start gap-4 bg-[#0a0a0a]">
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-white mb-1">{link.title}</h1>
            <p className="text-[#00ff41] text-[13px] font-mono mb-1">{shortUrl.replace(/^https?:\/\//, '')}</p>
            <p className="text-[#00663a] text-[11px] truncate max-w-sm">{link.original_url}</p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 text-[11px] border border-[#00ff41]/30 text-[#00b32d] hover:text-[#00ff41] hover:border-[#00ff41]/60 transition-colors px-3 py-1.5 rounded"
          >
            {copied ? "copied" : "copy_link"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 border border-[#00ff41]/15 rounded-lg py-6 bg-[#0a0a0a]">
          <StatBlock value={clicks.length} label="total_clicks" />
          <StatBlock value={uniqueCountries} label="countries" />
          <StatBlock value={Object.keys(byDevice).length} label="device_types" />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <BreakdownCard title="device" data={byDevice} />
          <BreakdownCard title="browser" data={byBrowser} />
        </div>
        <div className="mb-3">
          <BreakdownCard title="location" data={consolidatedLocation} />
        </div>

        {/* Recent clicks */}
        <div className="border border-[#00ff41]/15 rounded-lg p-5 bg-[#0a0a0a]">
          <h2 className="text-[11px] font-medium text-[#00b32d] uppercase tracking-widest mb-4">recent_clicks</h2>
          {clicks.length === 0 && (
            <p className="text-[#00663a] text-[13px] text-center py-4">no clicks yet</p>
          )}
          {clicks.slice(0, 15).map(click => (
            <div key={click.id} className="flex justify-between items-center py-2.5 border-b border-[#00ff41]/10 last:border-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-white/80">
                  {click.city && click.city !== 'Unknown' && click.city !== ''
                    ? `${click.city}, ${click.country}`
                    : click.country || 'unknown'}
                </span>
                <span className="text-[11px] text-[#00663a]">
                  {cleanDevice(click.device)} · {(click.browser || 'unknown').toLowerCase()}
                  {click.referrer ? ` · ${(() => { try { return new URL(click.referrer).hostname } catch { return click.referrer } })()}` : ''}
                </span>
              </div>
              <span className="text-[11px] text-[#00663a] shrink-0 ml-4">
                {new Date(click.clicked_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
