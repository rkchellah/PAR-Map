// src/pages/agent.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabaseAgent as supabase } from '../lib/supabaseAgent'
import { IconLogoMark, IconEye, IconEyeOff } from '../components/icons'

const LOCATIONS = [
  'Cairo Road Shoprite', 'City Market', 'Down Town Lusaka', 'Mtendere Market',
  'Lumumba Road', 'Town Centre Lusaka', 'Chilenje Market', 'Kalingalinga',
  'Chibolya', 'Kanyama', 'Other',
]

const VERDICT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  SAFE:    { bg: '#f0fdf4', color: '#16a34a', label: 'SAFE' },
  CAUTION: { bg: '#fffbeb', color: '#d97706', label: 'CAUTION' },
  STOP:    { bg: '#fff1f2', color: '#be123c', label: 'STOP' },
}

interface BoothAgent {
  id: string
  name: string
  phone: string
  primary_location: string
}

interface CheckResult {
  verdict: string
  narration: string
  phone_number: string
}

export default function AgentPage() {
  const [authLoading, setAuthLoading]     = useState(true)
  const [agent, setAgent]                 = useState<BoothAgent | null>(null)

  // Login form
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError,    setLoginError]    = useState('')
  const [loginLoading,  setLoginLoading]  = useState(false)
  const [showPwd,       setShowPwd]       = useState(false)

  // Check form
  const [checkPhone,    setCheckPhone]    = useState('')
  const [checkLocation, setCheckLocation] = useState(LOCATIONS[0])
  const [checking,      setChecking]      = useState(false)
  const [result,        setResult]        = useState<CheckResult | null>(null)
  const [checkError,    setCheckError]    = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setAuthLoading(false), 3000)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(timeout)
        if (!session) { setAuthLoading(false); return }
        await loadAgent(session.user.id)
        setAuthLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        setAuthLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) { setAgent(null); return }
      await loadAgent(session.user.id)
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  async function loadAgent(userId: string) {
    const { data } = await supabase
      .from('booth_agents')
      .select('id, name, phone, primary_location')
      .eq('user_id', userId)
      .single()
    if (data) {
      setAgent(data)
      setCheckLocation(data.primary_location)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    console.log('sign in clicked')
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) {
      setLoginError(error.message ?? 'Incorrect email or password')
      setLoginLoading(false)
      return
    }
    // on success onAuthStateChange fires → loadAgent sets agent
    setLoginLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setAgent(null)
    setResult(null)
    setCheckPhone('')
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!checkPhone || checking || !agent) return
    setChecking(true)
    setResult(null)
    setCheckError('')
    try {
      const apiBase = process.env.NEXT_PUBLIC_MOMO_SENTRY_API ?? 'https://momo-sentry-production.up.railway.app'
      const res = await fetch(`${apiBase}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: checkPhone,
          location: checkLocation,
          agent_location: checkLocation,
          agent_id: agent.id,
          agent_name: agent.name,
        }),
      })
      if (!res.ok) throw new Error('Check failed')
      const data = await res.json()
      setResult(data)
      setCheckPhone('')
    } catch (err) {
      console.error(err)
      setCheckError('Failed to perform fraud check. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const styles = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: 'Inter', sans-serif; background: #f4f4f5; color: #18181b; -webkit-font-smoothing: antialiased; }
    input, select { font-family: inherit; outline: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .up { animation: up 0.35s cubic-bezier(0.16,1,0.3,1) both; }
    .field-input {
      width: 100%; height: 48px; padding: 0 14px;
      background: #f4f4f5; border: 1px solid transparent; border-radius: 8px;
      font-size: 14px; color: #09090b; transition: all 0.15s;
    }
    .field-input:focus { background: #ffffff; border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.06); }
    .submit-btn {
      width: 100%; height: 50px; background: #18181b; border: none; border-radius: 8px;
      color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
      cursor: pointer; transition: all 0.15s;
    }
    .submit-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  `

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <Head><title>Agent — MoMo Sentry</title><style>{styles}</style></Head>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #e4e4e7', borderTopColor: '#18181b', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </>
    )
  }

  // ── Login form ───────────────────────────────────────────────────────────────
  if (!agent) {
    return (
      <>
        <Head>
          <title>Agent Sign In — MoMo Sentry</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <style>{styles}</style>
        </Head>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
          <div className="up" style={{ width: '100%', maxWidth: 400 }}>

            <div style={{ marginBottom: 32 }}>
              <IconLogoMark size={44} color="#111111" />
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181b', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>
              Agent sign in
            </h1>
            <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32, lineHeight: 1.6 }}>
              Sign in to your MoMo Sentry booth agent account.
            </p>

            {loginError && (
              <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', marginBottom: 20, fontSize: 13, color: '#be123c', fontWeight: 500 }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  className="field-input"
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="mail@abc.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field-input"
                    type={showPwd ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
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

              <button className="submit-btn" type="submit" disabled={loginLoading}>
                {loginLoading
                  ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
                  : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#a1a1aa' }}>
              No account?{' '}
              <Link href="/agent-register" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>
                Register as an agent
              </Link>
            </p>
          </div>
        </div>
      </>
    )
  }

  // ── Agent check interface ────────────────────────────────────────────────────
  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] ?? { bg: '#f4f4f5', color: '#18181b', label: result.verdict }) : null

  return (
    <>
      <Head>
        <title>Agent — MoMo Sentry</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{styles}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px' }}>
        <div className="up" style={{ width: '100%', maxWidth: 420 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <IconLogoMark size={36} color="#111111" />
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#18181b', letterSpacing: '-0.02em', marginTop: 16, lineHeight: 1.2 }}>
                Welcome, {agent.name}
              </h1>
              <p style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>{agent.primary_location}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ marginTop: 4, height: 34, padding: '0 14px', background: 'none', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 13, color: '#71717a', cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#18181b'; e.currentTarget.style.color = '#18181b' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.color = '#71717a' }}
            >
              Sign out
            </button>
          </div>

          {/* Check card */}
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', marginBottom: 20, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
              Fraud Check
            </p>

            <form onSubmit={handleCheck}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                  Phone number
                </label>
                <input
                  className="field-input"
                  type="tel"
                  value={checkPhone}
                  onChange={e => setCheckPhone(e.target.value)}
                  placeholder="+99999991000"
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                  Location
                </label>
                <select
                  className="field-input"
                  value={checkLocation}
                  onChange={e => setCheckLocation(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <button className="submit-btn" type="submit" disabled={checking}>
                {checking ? 'Checking…' : 'Check Number'}
              </button>
            </form>
          </div>

          {/* Error */}
          {checkError && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', fontSize: 13, color: '#be123c', fontWeight: 500 }}>
              {checkError}
            </div>
          )}

          {/* Result */}
          {result && verdictStyle && (
            <div className="up" style={{ background: verdictStyle.bg, borderRadius: 12, padding: 20, border: `1px solid ${verdictStyle.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a' }}>
                  Result
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: verdictStyle.color }}>
                  {verdictStyle.label}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#3f3f46', lineHeight: 1.6 }}>{result.narration}</p>
              <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8 }}>{result.phone_number}</p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
