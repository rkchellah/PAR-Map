// ─── src/lib/supabase.ts ──────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client — uses cookies so middleware can read the session ──────────
export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON)

// ── Admin client — lazy, server-only ─────────────────────────────────────────
// NOT created at module load time so it never runs in the browser.
// Import and call getSupabaseAdmin() ONLY inside /api/** route handlers.
export function getSupabaseAdmin() {
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!svcKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(SUPABASE_URL, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'user'
  avatar_url: string | null
}