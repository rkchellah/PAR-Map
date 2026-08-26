// ─── src/pages/register.tsx ──────────────────────────────────────────────────
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { IconLogoMark, IconEye, IconEyeOff, IconChevronDown } from '../components/icons'

function PwdStrength({ pwd }: { pwd: string }) {
  const checks = [
    { label: '8+ characters', pass: pwd.length >= 8 },
    { label: 'Number',        pass: /\d/.test(pwd) },
    { label: 'Uppercase',     pass: /[A-Z]/.test(pwd) },
  ]
  const score = checks.filter(c => c.pass).length
  if (!pwd) return null
  const colors = ['#e4e4e7', '#f59e0b', '#f59e0b', '#16a34a']
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i < score ? colors[score] : '#f4f4f5', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {checks.map(c => (
          <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: c.pass ? '#16a34a' : '#a1a1aa' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.pass ? '#16a34a' : '#d4d4d8'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [role,     setRole]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password || !role) { setError('Please fill in all fields'); return }
    if (password !== confirm)    { setError('Passwords do not match'); return }
    if (password.length < 8)     { setError('Password must be at least 8 characters'); return }

    setError(''); setLoading(true)
    try {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // These are stored in auth.users.raw_user_meta_data
          // The trigger we created picks them up and saves to profiles
          data: { full_name: fullName, role_request: role },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpErr) throw signUpErr
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────
  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('Google sign-in failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', marginBottom: 12 }}>Account created!</h1>
          <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 32 }}>
            Your account is ready. You can now sign in with your email and password.
          </p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 8, background: '#18181b', color: '#ffffff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Create account — PAR Map</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body { font-family: 'Inter', sans-serif; background: #ffffff; color: #18181b; -webkit-font-smoothing: antialiased; }
          input, select { font-family: inherit; outline: none; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          .up { animation: up 0.35s cubic-bezier(0.16,1,0.3,1) both; }
          .fi {
            width: 100%; height: 48px; padding: 0 14px;
            background: #f4f4f5; border: 1px solid transparent; border-radius: 8px;
            font-size: 14px; color: #09090b; transition: all 0.15s;
          }
          .fi:focus { background: #ffffff; border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.06); }
          select.fi { appearance: none; cursor: pointer; }
          .submit-btn {
            width: 100%; height: 50px; background: #18181b; border: none; border-radius: 8px;
            color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
            cursor: pointer; transition: all 0.15s; letter-spacing: -0.01em;
          }
          .submit-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
          .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
          .google-btn {
            width: 100%; height: 48px; background: #ffffff; border: 1px solid #e4e4e7;
            border-radius: 8px; display: flex; align-items: center; justify-content: center;
            gap: 10px; font-size: 14px; font-weight: 500; color: #18181b;
            cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
          }
          .google-btn:hover { background: #fafafa; border-color: #d4d4d8; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="up" style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <IconLogoMark size={44} color="#111111" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181b', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>Create account</h1>
          <p style={{ fontSize: 15, color: '#a1a1aa', marginBottom: 32 }}>Join the PAR Map dashboard.</p>

          {/* Google */}
          <button className="google-btn" type="button" onClick={handleGoogle} style={{ marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18Z" fill="#34A853" />
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: '#f4f4f5' }} />
            <span style={{ fontSize: 12, color: '#a1a1aa' }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: '#f4f4f5' }} />
          </div>

          {error && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', marginBottom: 20, fontSize: 13, color: '#be123c', fontWeight: 500 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Full name</label>
              <input className="fi" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Banda" autoComplete="name" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Email</label>
              <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@abc.com" autoComplete="email" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Role</label>
              <div style={{ position: 'relative' }}>
                <select className="fi" value={role} onChange={e => setRole(e.target.value)} required>
                  <option value="" disabled>Select your role…</option>
                  <option value="field_agent">Field Agent</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="analyst">Analyst</option>
                  <option value="other">Other</option>
                </select>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#a1a1aa' }}>
                  <IconChevronDown size={14} color="#a1a1aa" />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="fi" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"
                  autoComplete="new-password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0 }}>
                  {showPwd ? <IconEyeOff size={16} color="#a1a1aa" /> : <IconEye size={16} color="#a1a1aa" />}
                </button>
              </div>
              <PwdStrength pwd={password} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input className="fi" type={showConf ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="••••••••••••"
                  autoComplete="new-password"
                  style={{ paddingRight: 44, borderColor: confirm && confirm !== password ? '#fda4af' : undefined }} />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0 }}>
                  {showConf ? <IconEyeOff size={16} color="#a1a1aa" /> : <IconEye size={16} color="#a1a1aa" />}
                </button>
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#a1a1aa' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}