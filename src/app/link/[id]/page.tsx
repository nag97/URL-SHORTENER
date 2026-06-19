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

function cleanDevice(device: string): string {
  if (!device || device === 'desktop') return 'Desktop'
  if (device.length <= 2 || /^[A-Z0-9\-]+$/.test(device)) return 'Android'
  return device.charAt(0).toUpperCase() + device.slice(1)
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[56px] font-semibold tracking-tight leading-none">{value}</p>
      <p className="text-[#86868b] text-[14px] mt-1">{label}</p>
    </div>
  )
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-6">
      <h2 className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider mb-4">{title}</h2>
      <div className="flex flex-col gap-3">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <div key={label}>
              <div className="flex justify-between text-[15px] mb-1.5">
                <span className="text-[#1d1d1f] capitalize">{label}</span>
                <span className="text-[#86868b]">{count}</span>
              </div>
              <div className="h-[3px] bg-[#e8e8ed] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0071e3] rounded-full transition-all"
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8ed] border-t-[#0071e3] rounded-full animate-spin" />
      </div>
    )
  }

  if (!link) return null

  const shortUrl = `${window.location.origin}/${link.code}`

  const byLocation = clicks.reduce((acc, c) => {
    const city = c.city && c.city !== 'Unknown' && c.city !== '' ? c.city : null
    const key = city ? `${city}, ${c.country}` : c.country || 'Unknown'
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
    acc[c.browser || 'Unknown'] = (acc[c.browser || 'Unknown'] || 0) + 1
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
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed]">
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px]">
            <Link href="/" className="font-semibold text-[17px] tracking-tight mr-2">Shortify</Link>
            <button onClick={() => router.push('/dashboard')} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              Dashboard
            </button>
            <span className="text-[#d2d2d7]">›</span>
            <span className="text-[#1d1d1f] truncate max-w-[160px]">{link.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#86868b] hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="text-[12px] text-[#0071e3] hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[980px] mx-auto px-6 py-16">
        {/* Link header */}
        <div className="flex justify-between items-start gap-4 mb-12">
          <div className="min-w-0">
            <h1 className="text-[40px] font-semibold tracking-tight mb-1">{link.title}</h1>
            <p className="text-[#0071e3] text-[17px]">{shortUrl.replace(/^https?:\/\//, '')}</p>
            <p className="text-[#86868b] text-[14px] mt-1 truncate max-w-md">{link.original_url}</p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 text-[13px] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors px-4 py-2 rounded-full font-medium"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        {/* Big stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12 py-10 bg-[#f5f5f7] rounded-2xl">
          <StatBlock value={clicks.length} label="Total clicks" />
          <StatBlock value={uniqueCountries} label="Countries" />
          <StatBlock value={Object.keys(byDevice).length} label="Device types" />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <BreakdownCard title="Device" data={byDevice} />
          <BreakdownCard title="Browser" data={byBrowser} />
        </div>
        <div className="mb-4">
          <BreakdownCard title="Location" data={consolidatedLocation} />
        </div>

        {/* Recent clicks */}
        <div className="bg-[#f5f5f7] rounded-2xl p-6">
          <h2 className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider mb-4">Recent clicks</h2>
          {clicks.length === 0 && (
            <p className="text-[#86868b] text-[15px] text-center py-6">No clicks yet</p>
          )}
          {clicks.slice(0, 15).map(click => (
            <div key={click.id} className="flex justify-between items-center py-3 border-b border-[#e8e8ed] last:border-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] text-[#1d1d1f]">
                  {click.city && click.city !== 'Unknown' && click.city !== ''
                    ? `${click.city}, ${click.country}`
                    : click.country || 'Unknown'}
                </span>
                <span className="text-[13px] text-[#86868b] capitalize">
                  {cleanDevice(click.device)} · {click.browser || 'Unknown'}
                  {click.referrer ? ` · ${(() => { try { return new URL(click.referrer).hostname } catch { return click.referrer } })()}` : ''}
                </span>
              </div>
              <span className="text-[13px] text-[#86868b] shrink-0 ml-4">
                {new Date(click.clicked_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
