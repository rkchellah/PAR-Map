import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.split('https://')[1]
    ?.split('.supabase.co')[0]
  const cookieName = `sb-${projectRef}-auth-token`

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      cookieOptions: {
        name: cookieName,
      },
    }
  )

  // Refresh the session cookie and get the current user in one call
  const { data: { user } } = await supabase.auth.getUser()

  // Server-side guard for /admin — requires a valid session cookie.
  // This only works correctly because supabase.ts uses createBrowserClient
  // (cookie-based), so the middleware and browser share the same session.
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Optimized: Runs on all routes EXCEPT static assets/images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
