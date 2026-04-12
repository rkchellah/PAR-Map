// ─── src/pages/auth/callback.tsx ─────────────────────────────────────────────
// Supabase redirects here after Google OAuth or email confirmation.
// Must live at /auth/callback to match the Supabase redirect URL.

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // router.query is not populated on first render in Next.js pages router
    if (!router.isReady) return

    const code = router.query.code as string | undefined
    const next = (router.query.next as string) || '/'

    async function exchange() {
      try {
        if (code) {
          // PKCE flow: exchange the authorization code for a session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            // Fallback: some Supabase SDK versions auto-exchange the code before
            // exchangeCodeForSession is called. Check if a session already exists.
            if (exchangeError.message?.toLowerCase().includes('code verifier')) {
              const { data: { session }, error: sessionError } = await supabase.auth.getSession()
              if (sessionError || !session) throw exchangeError
              // session was auto-exchanged — fall through to the profile check below
            } else {
              throw exchangeError
            }
          }
        } else {
          // Implicit flow / email confirmation: session arrives via URL hash.
          // getSession() will parse the fragment and hydrate the session.
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) throw error
          if (!session) {
            router.replace('/login?error=no_session')
            return
          }
        }

        // Fetch role so we can enforce admin-only redirect protection
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/login?error=no_user'); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (next.startsWith('/admin') && profile?.role !== 'admin') {
          router.replace('/')
        } else {
          router.replace(next)
        }
      } catch (e: unknown) {
        console.error('OAuth exchange failed:', e instanceof Error ? e.message : e)
        router.replace('/login?error=oauth_failed')
      }
    }

    exchange()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif',
      background: '#ffffff',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          border: '2.5px solid #e4e4e7', borderTopColor: '#18181b',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 14, color: '#71717a' }}>Signing you in…</span>
      </div>
    </div>
  )
}
