import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { UAParser } from 'ua-parser-js'

/**
 * POST /api/track
 * Receives click events from QStash (async) or direct calls.
 * Uses service role key — no cookies needed, works with QStash delivery.
 */
export async function POST(request: NextRequest) {
  try {
    const { link_id, country, city, device, referrer } = await request.json()

    if (!link_id) {
      return NextResponse.json({ error: 'missing link_id' }, { status: 400 })
    }

    const parser = new UAParser(device)
    const result = parser.getResult()

    // Use service role client — bypasses RLS, works without session cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('click_events').insert({
      link_id,
      country: country || 'XX',
      city: city || 'Unknown',
      device: result.device.type || 'desktop',
      browser: result.browser.name || 'unknown',
      referrer: referrer || '',
    })

    if (error) {
      console.error('[track] supabase insert error:', error.message)
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[track] error:', err)
    return NextResponse.json({ success: false })
  }
}