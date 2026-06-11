import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RESERVED = ['dashboard', 'auth', 'api', 'link', '_next', 'favicon.ico', 'public']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const code = pathname.split('/')[1]

  // ─── Short-link redirect: rewrite to API route which handles Redis + QStash
  // The API route runs in Node.js runtime where outgoing fetch is fully supported
  if (code && !RESERVED.includes(code)) {
    return NextResponse.rewrite(new URL(`/api/redirect/${code}`, request.url))
  }

  // ─── Auth session handling ────────────────────────────────────────────────
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)',],
}