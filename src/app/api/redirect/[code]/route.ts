import { NextRequest, NextResponse } from 'next/server'
import { getCachedLink, setCachedLink } from '@/lib/redis'
import { createClient } from '@/lib/supabase/server'
import { publishClickEvent } from '@/lib/qstash'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Redirects are high-volume — generous limit, short window
const REDIRECT_LIMIT = 60       // requests
const REDIRECT_WINDOW_MS = 60_000 // per 1 minute per IP

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const origin = request.nextUrl.origin
  const ip = getClientIp(request)

  // Rate limit by IP — protects against scraping/abuse without affecting normal users
  const { allowed } = await rateLimit(`ratelimit:redirect:${ip}`, REDIRECT_LIMIT, REDIRECT_WINDOW_MS)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const clickMeta = {
    country: request.headers.get('x-vercel-ip-country') || 'XX',
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    device: request.headers.get('user-agent') || '',
    referrer: request.headers.get('referer') || '',
  }

  // 1. Cache hit
  const cached = await getCachedLink(code)
  if (cached) {
    // Check expiry even on cache hit (cache stores expires_at too)
    if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/?expired=1', request.url), { status: 307 })
    }
    await publishClickEvent(origin, { link_id: cached.id, ...clickMeta })
    return NextResponse.redirect(cached.original_url, { status: 307 })
  }

  // 2. Cache miss → Supabase
  const supabase = await createClient()
  const { data: link } = await supabase
    .from('short_links')
    .select('id, original_url, expires_at')
    .eq('code', code)
    .single()

  if (!link) {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 })
  }

  // Enforce expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/?expired=1', request.url), { status: 307 })
  }

  await setCachedLink(code, {
    id: link.id,
    original_url: link.original_url,
    expires_at: link.expires_at,
  })
  await publishClickEvent(origin, { link_id: link.id, ...clickMeta })

  return NextResponse.redirect(link.original_url, { status: 307 })
}
