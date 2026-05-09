// src/pages/agent-register.tsx
import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabaseAgent as supabase } from '../lib/supabaseAgent'
import { IconLogoMark, IconEye, IconEyeOff } from '../components/icons'

const LOCATIONS = [
  'Cairo Road Shoprite', 'City Market', 'Down Town Lusaka', 'Mtendere Market',
  'Lumumba Road', 'Town Centre Lusaka', 'Chilenje Market', 'Kalingalinga',
  'Chibolya', 'Kanyama', 'Other',
]

export default function AgentRegisterPage() {
  const router = useRouter()

  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [phone,           setPhone]           = useState('')
  const [location,        setLocation]        = useState(LOCATIONS[0])
  const [showPwd,         setShowPwd]         = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !phone) {
      setError('Please fill in all fields')
      return
    }

    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data?.user) {
      setError(error?.message ?? 'Registration failed')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase
      .from('booth_agents')
      .insert({ user_id: data.user.id, name, phone, primary_location: location })

    if (insertErr) {
      setError(insertErr.message ?? 'Failed to save agent profile')
      setLoading(false)
      return
    }

    router.push('/agent')
  }

  return (
    <>
      <Head>
        <title>Agent Registration — MoMo Sentry</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body { font-family: 'Inter', sans-serif; background: #ffffff; color: #18181b; -webkit-font-smoothing: antialiased; }
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
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div className="up" style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 32 }}>
            <IconLogoMark size={44} color="#111111" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181b', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>
            Register as an agent
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32, lineHeight: 1.6 }}>
            Create your MoMo Sentry booth agent account.
          </p>

          {error && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', marginBottom: 20, fontSize: 13, color: '#be123c', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Full name
              </label>
              <input
                className="field-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Banda"
                autoComplete="name"
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Email address
              </label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mail@abc.com"
                autoComplete="email"
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
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Phone number
              </label>
              <input
                className="field-input"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+260 97 000 0000"
                autoComplete="tel"
                required
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>
                Primary booth location
              </label>
              <select
                className="field-input"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
              ) : 'Register as Agent'}
            </button>
          </form>

        </div>
      </div>
    </>
  )
}
