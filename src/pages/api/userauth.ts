// ─── src/lib/useAuth.ts ───────────────────────────────────────────────────────
// React hook — gives any component the current user + profile + role.
//
// Usage:
//   const { user, profile, isAdmin, loading, signOut } = useAuth()

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './supabase'

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', uid)
      .single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    // Load existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    // Subscribe to login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else { setProfile(null) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    signOut: () => supabase.auth.signOut(),
  }
}