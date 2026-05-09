import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseAgent = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-agent-auth-token',
    autoRefreshToken: true,
    persistSession: true,
  }
})
