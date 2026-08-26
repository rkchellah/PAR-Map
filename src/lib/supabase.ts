// ─── src/lib/supabase.ts ──────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client — guaranteed singleton so the PKCE code verifier cookie
//    written during signInWithOAuth is still in scope when callback.tsx calls
//    exchangeCodeForSession (re-instantiating createBrowserClient loses it).
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    const projectRef = SUPABASE_URL?.split('https://')[1]?.split('.supabase.co')[0]
    const cookieName = `sb-${projectRef}-auth-token`
    _supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON, {
      cookieOptions: {
        name: cookieName,
      },
    })
  }
  return _supabase
}

export const supabase = getSupabase()

export { getSupabaseAdmin } from './supabaseAdmin'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'user'
  avatar_url: string | null
}