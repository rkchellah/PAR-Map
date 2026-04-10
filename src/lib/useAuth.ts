// ─── src/lib/useAuth.ts ───────────────────────────────────────────────────────
import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from './supabase'

export function useAuth() {
  const [user, setUser]           = useState<User | null>(null)
  const [profile, setProfile]     = useState<Profile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const initialized = useRef(false)

  async function fetchProfile(uid: string): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .eq('id', uid)
      .single()

    if (error) {
      console.error('Profile fetch failed:', error.message)
      setAuthError('Could not load your profile. Please refresh or contact support.')
      setProfile(null)
      return
    }
    setAuthError(null)
    setProfile(data)
  }

  useEffect(() => {
    // Step 1: Subscribe FIRST so we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Skip the initial INITIAL_SESSION event — handled by getSession() below
        if (!initialized.current) return

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    // Step 2: Load the initial session once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialized.current = true
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    authError,
    signOut: () => supabase.auth.signOut(),
  }
}