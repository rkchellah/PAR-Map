import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must not be called in the browser')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!svcKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
