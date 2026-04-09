// ─── src/pages/auth/callback.tsx ─────────────────────────────────────────────
// Supabase redirects here after Google OAuth or email confirmation.
// Must live at /auth/callback to match the Supabase redirect URL.

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }

      // Fetch role so we can redirect to the right place
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const next = (router.query.next as string) || '/'

      // If the user requested /admin but isn't an admin, send them home
      if (next.startsWith('/admin') && profile?.role !== 'admin') {
        router.replace('/')
      } else {
        router.replace(next)
      }
    })
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
