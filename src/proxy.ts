import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RESERVED = ['dashboard', 'auth', 'api', 'link', '_next', 'favicon.ico']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const code = pathname.split('/')[1]

  if (code && !RESERVED.includes(code)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: link } = await supabase
      .from('short_links')
      .select('id, original_url')
      .eq('code', code)
      .single()

    if (link) {
      fetch(`${request.nextUrl.origin}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_id: link.id,
          country: request.headers.get('x-vercel-ip-country') || 'XX',
          city: request.headers.get('x-vercel-ip-city') || 'Unknown',
          device: request.headers.get('user-agent') || '',
          referrer: request.headers.get('referer') || ''
        })
      }).catch(() => {})

      return NextResponse.redirect(link.original_url)
    }
  }

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/link'))) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user && pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}