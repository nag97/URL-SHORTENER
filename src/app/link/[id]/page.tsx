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

export default function LinkPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [link, setLink] = useState<ShortLink | null>(null)
  const [clicks, setClicks] = useState<ClickEvent[]>([])
  const [loading, setLoading] = useState(true)

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

  const byCountry = clicks.reduce((acc, c) => {
    const key = c.city && c.city !== 'Unknown' ? `${c.city}, ${c.country}` : c.country
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byDevice = clicks.reduce((acc, c) => {
    acc[c.device] = (acc[c.device] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byBrowser = clicks.reduce((acc, c) => {
    acc[c.browser] = (acc[c.browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueLocations = new Set(clicks.map(c => c.country)).size

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg tracking-tight">shortify</Link>
        <span className="text-white/20">/</span>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Dashboard
        </button>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/60">{link.title}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Link info */}
        <div className="border border-white/10 rounded-xl p-5 mb-8">
          <h1 className="text-xl font-semibold mb-1">{link.title}</h1>
          <p className="text-blue-400 text-sm font-mono mb-1">{shortUrl}</p>
          <p className="text-white/30 text-xs truncate">{link.original_url}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { value: clicks.length, label: "Total Clicks" },
            { value: uniqueLocations, label: "Countries" },
            { value: Object.keys(byDevice).length, label: "Device Types" },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/10 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Device + Browser */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Device</h2>
            {Object.entries(byDevice).map(([device, count]) => (
              <div key={device} className="flex justify-between py-1.5 text-sm border-b border-white/5 last:border-0">
                <span className="capitalize text-white/80">{device}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <div className="border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Browser</h2>
            {Object.entries(byBrowser).map(([browser, count]) => (
              <div key={browser} className="flex justify-between py-1.5 text-sm border-b border-white/5 last:border-0">
                <span className="text-white/80">{browser}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location — now shows city */}
        <div className="border border-white/10 rounded-xl p-4 mb-3">
          <h2 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Location</h2>
          {Object.entries(byCountry)
            .sort((a, b) => b[1] - a[1])
            .map(([location, count]) => (
              <div key={location} className="flex justify-between py-1.5 text-sm border-b border-white/5 last:border-0">
                <span className="text-white/80">{location}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
        </div>

        {/* Recent clicks */}
        <div className="border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Recent Clicks</h2>
          {clicks.slice(0, 10).map(click => (
            <div key={click.id} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
              <span className="text-white/60">
                {click.city && click.city !== 'Unknown' ? `${click.city}, ` : ''}{click.country}
                <span className="text-white/30 mx-1">·</span>
                {click.device}
                <span className="text-white/30 mx-1">·</span>
                {click.browser}
              </span>
              <span className="text-white/30 text-xs">
                {new Date(click.clicked_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}