"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"

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

  if (loading) return <div className="p-8">Loading...</div>
  if (!link) return null

  const shortUrl = `${window.location.origin}/${link.code}`

  // Count by country
  const byCountry = clicks.reduce((acc, c) => {
    acc[c.country] = (acc[c.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count by device
  const byDevice = clicks.reduce((acc, c) => {
    acc[c.device] = (acc[c.device] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Count by browser
  const byBrowser = clicks.reduce((acc, c) => {
    acc[c.browser] = (acc[c.browser] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-sm text-gray-500 mb-6 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      <div className="border rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{link.title}</h1>
        <p className="text-blue-500 text-sm mb-1">{shortUrl}</p>
        <p className="text-gray-400 text-xs">{link.original_url}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{clicks.length}</p>
          <p className="text-gray-500 text-sm">Total Clicks</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{Object.keys(byCountry).length}</p>
          <p className="text-gray-500 text-sm">Countries</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{Object.keys(byDevice).length}</p>
          <p className="text-gray-500 text-sm">Device Types</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">By Device</h2>
          {Object.entries(byDevice).map(([device, count]) => (
            <div key={device} className="flex justify-between py-1 text-sm">
              <span className="capitalize">{device}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">By Browser</h2>
          {Object.entries(byBrowser).map(([browser, count]) => (
            <div key={browser} className="flex justify-between py-1 text-sm">
              <span>{browser}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">By Country</h2>
        {Object.entries(byCountry).map(([country, count]) => (
          <div key={country} className="flex justify-between py-1 text-sm">
            <span>{country}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-4 mt-6">
        <h2 className="font-semibold mb-3">Recent Clicks</h2>
        {clicks.slice(0, 10).map(click => (
          <div key={click.id} className="flex justify-between py-2 text-sm border-b last:border-0">
            <span>{click.country} · {click.device} · {click.browser}</span>
            <span className="text-gray-400">
              {new Date(click.clicked_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}