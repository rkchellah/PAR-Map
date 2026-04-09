// ─── src/lib/supabase.ts ──────────────────────────────────────────────────────
// Two clients:
//   supabase      → browser/SSR client   (anon key, respects RLS)
//   supabaseAdmin → server-only client   (service role, bypasses RLS)
//                   NEVER import this in pages/ or components/

import { createClient } from '@supabase/supabase-js'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!  // never sent to browser

// Browser / SSR client — safe to import anywhere
export const supabase = createClient(URL, ANON)

// Admin client — import ONLY inside /api/** route handlers
export const supabaseAdmin = createClient(URL, SVC, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'user'
  avatar_url: string | null
}