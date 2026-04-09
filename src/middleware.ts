// ─── src/middleware.ts ────────────────────────────────────────────────────────
// Edge middleware — runs before every matched request.
// Checks for an active Supabase session cookie to protect /admin.
// Full role enforcement (admin-only) lives inside admin.tsx via useAuth().

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Supabase v2 stores the session in:  sb-<projectRef>-auth-token
// Extract the project ref from the env URL at build time.
const PROJECT_REF =
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .replace('https://', '')
    .split('.')[0]

function hasSession(req: NextRequest): boolean {
  const cookieName = `sb-${PROJECT_REF}-auth-token`
  // Supabase sometimes splits large JWTs across .0 / .1 chunks
  return !!(
    req.cookies.get(cookieName)?.value ||
    req.cookies.get(`${cookieName}.0`)?.value
  )
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const loggedIn = hasSession(req)

  // Block unauthenticated access to /admin
  if (req.nextUrl.pathname.startsWith('/admin') && !loggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Prevent logged-in users from reaching /login or /register
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') && loggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
}