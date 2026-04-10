// ─── src/lib/supabase.ts ──────────────────────────────────────────────────────
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SVC  = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client — uses cookies, syncs with middleware, supports PKCE
export const supabase = createBrowserClient(URL, ANON)

// Admin client — server only, never import in pages/ or components/
export const supabaseAdmin = createClient(URL, SVC, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export interface Profile {
  id: string
  full_name: string | null
  role: 'admin' | 'user'
  avatar_url: string | null
}