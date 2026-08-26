// ─── src/pages/login.tsx ─────────────────────────────────────────────────────
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { IconLogoMark, IconEye, IconEyeOff } from '../components/icons'

export default function LoginPage() {
  const router = useRouter()
  const next = (router.query.next as string) || '/admin'
  const queryError = router.query.error as string | undefined
  const queryErrorMessage =
    queryError === 'admin_required'
      ? 'You are signed in, but this Google account is not an admin.'
      : queryError === 'oauth_failed'
        ? 'Google sign-in failed. Try again.'
        : queryError === 'no_session' || queryError === 'no_user'
          ? 'Sign-in did not complete. Try again.'
          : ''

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Read values directly from the form in case autofill didn't fire onChange
    const form = e.target as HTMLFormElement
    const emailVal    = (form.elements.namedItem('email')    as HTMLInputElement)?.value || email
    const passwordVal = (form.elements.namedItem('password') as HTMLInputElement)?.value || password

    if (!emailVal || !passwordVal) { setError('Please fill in all fields'); return }

    setError('')
    setLoading(true)

    // Step 1: Sign in
    const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    })

    if (signInErr) {
      setError(signInErr.message ?? 'Incorrect email or password')
      setLoading(false)
      return
    }

    // Step 2: Check role for admin routes
    if (next.startsWith('/admin')) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileErr || profile?.role !== 'admin') {
        await supabase.auth.signOut()
        setError(profileErr ? `Profile error: ${profileErr.message}` : 'You do not have admin access.')
        setLoading(false)
        return
      }
    }

    window.location.href = next
  }

  async function handleGoogle() {
    setGLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setError('Google sign-in failed. Please try again.')
      setGLoading(false)
    }
    // On success: page is redirecting to Google — don't reset gLoading
  }

  return (
    <>
      <Head>
        <title>Sign In — PAR Map</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body { font-family: 'Inter', sans-serif; background: #ffffff; color: #18181b; -webkit-font-smoothing: antialiased; }
          input { font-family: inherit; outline: none; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          .up { animation: up 0.35s cubic-bezier(0.16,1,0.3,1) both; }
          .field-input {
            width: 100%; height: 48px; padding: 0 14px;
            background: #f4f4f5; border: 1px solid transparent; border-radius: 8px;
            font-size: 14px; color: #09090b; transition: all 0.15s;
          }
          .field-input:focus { background: #ffffff; border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.06); }
          .google-btn {
            width: 100%; height: 48px; background: #ffffff; border: 1px solid #e4e4e7;
            border-radius: 8px; display: flex; align-items: center; justify-content: center;
            gap: 10px; font-size: 14px; font-weight: 500; color: #18181b;
            cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
          }
          .google-btn:hover:not(:disabled) { background: #fafafa; border-color: #d4d4d8; }
          .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .submit-btn {
            width: 100%; height: 50px; background: #18181b; border: none; border-radius: 8px;
            color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
            cursor: pointer; transition: all 0.15s;
          }
          .submit-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
          .submit-btn:active { transform: translateY(0); }
          .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
          .checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
          .checkbox-wrap input[type="checkbox"] { width: 16px; height: 16px; accent-color: #18181b; cursor: pointer; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div className="up" style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 32 }}>
            <IconLogoMark size={44} color="#111111" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181b', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32, lineHeight: 1.6 }}>
            Access the PAR Map dashboard.
          </p>

          {/* Google SSO */}
          <button className="google-btn" type="button" disabled={gLoading} onClick={handleGoogle} style={{ marginBottom: 20 }}>
            {gLoading ? (
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc', borderTopColor: '#555', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18Z" fill="#34A853" />
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58Z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: '#f4f4f5' }} />
            <span style={{ fontSize: 12, color: '#a1a1aa', letterSpacing: '0.03em' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: '#f4f4f5' }} />
          </div>

          {/* Error */}
          {(error || queryErrorMessage) && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', marginBottom: 20, fontSize: 13, color: '#be123c', fontWeight: 500 }}>
              {error || queryErrorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Email address
              </label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={e => setEmail(e.target.value)}
                placeholder="mail@abc.com"
                autoComplete="email"
                name="email"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="field-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  name="password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', padding: 0 }}
                >
                  {showPwd ? <IconEyeOff size={16} color="#a1a1aa" /> : <IconEye size={16} color="#a1a1aa" />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <label className="checkbox-wrap">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span style={{ fontSize: 13, color: '#71717a' }}>Remember me</span>
              </label>
              <Link href="/forgot-password" style={{ fontSize: 13, color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
              ) : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#a1a1aa' }}>
            Not registered yet?{' '}
            <Link href="/register" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>

        </div>
      </div>
    </>
  )
}