import { NextRequest, NextResponse } from 'next/server'
import { getCachedLink, setCachedLink } from '@/lib/redis'
import { createClient } from '@/lib/supabase/server'
import { publishClickEvent } from '@/lib/qstash'

/**
 * GET /api/redirect/[code]
 *
 * Cache-first redirect with async click tracking via QStash:
 * 1. Check Redis cache → hit: redirect immediately (~3ms)
 * 2. Miss: query Supabase, populate cache, redirect
 * 3. Publish click event to QStash (fire-and-forget, non-blocking)
 *    QStash delivers to /api/track asynchronously
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const origin = request.nextUrl.origin

  const clickMeta = {
    country: request.headers.get('x-vercel-ip-country') || 'XX',
    city: request.headers.get('x-vercel-ip-city') || 'Unknown',
    device: request.headers.get('user-agent') || '',
    referrer: request.headers.get('referer') || '',
  }

  // 1. Cache hit
  const cached = await getCachedLink(code)
  if (cached) {
    // Publish to QStash async — doesn't block redirect
    publishClickEvent(origin, { link_id: cached.id, ...clickMeta }).catch(() => {})
    return NextResponse.redirect(cached.original_url, { status: 307 })
  }

  // 2. Cache miss → Supabase
  const supabase = await createClient()
  const { data: link } = await supabase
    .from('short_links')
    .select('id, original_url')
    .eq('code', code)
    .single()

  if (!link) {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 })
  }

  // Populate cache + publish event (both non-blocking)
  setCachedLink(code, { id: link.id, original_url: link.original_url }).catch(() => {})
  publishClickEvent(origin, { link_id: link.id, ...clickMeta }).catch(() => {})

  return NextResponse.redirect(link.original_url, { status: 307 })
}