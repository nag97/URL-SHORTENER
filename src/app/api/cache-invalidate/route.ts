import { NextRequest, NextResponse } from 'next/server'
import { deleteCachedLink } from '@/lib/redis'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/cache-invalidate
 * Body: { code: string }
 *
 * Called by the dashboard when a link is deleted.
 * Removes the short code from Redis so stale redirects don't happen.
 * Requires an authenticated session — users can only invalidate their own links.
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    // Verify the user owns this link before invalidating
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: link } = await supabase
      .from('short_links')
      .select('id')
      .eq('code', code)
      .eq('user_id', user.id)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    await deleteCachedLink(code)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cache invalidate error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}