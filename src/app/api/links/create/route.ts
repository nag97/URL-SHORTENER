import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Link creation is low-volume but needs stricter abuse protection
const CREATE_LIMIT = 10          // links
const CREATE_WINDOW_MS = 60_000  // per 1 minute per user

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit by user ID (more reliable than IP for authenticated actions)
    const { allowed, remaining } = await rateLimit(
      `ratelimit:create:${user.id}`,
      CREATE_LIMIT,
      CREATE_WINDOW_MS
    )

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many links created. Please wait a minute and try again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { title, original_url, code, expires_at } = await request.json()

    if (!title || !original_url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    // Basic URL validation
    try {
      new URL(original_url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const finalCode = code || Math.random().toString(36).substring(2, 8)

    const { data, error } = await supabase
      .from('short_links')
      .insert({
        user_id: user.id,
        code: finalCode,
        original_url,
        title,
        expires_at: expires_at || null,
      })
      .select()
      .single()

    if (error) {
      const message = error.message.includes('duplicate')
        ? 'That custom code is already taken.'
        : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, link: data, remaining })
  } catch (err) {
    console.error('[links/create] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
