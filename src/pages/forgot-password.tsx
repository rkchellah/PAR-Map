// ─── src/pages/forgot-password.tsx ──────────────────────────────────────────
// Forgot Password — Luminous Curator · Premium Light Theme

import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { IconLogoMark } from '../components/icons'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setError(''); setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1200))
      setSuccess(true)
    } catch { setError('An error occurred. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>Reset Password — Supamoto</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body { font-family: 'Inter', sans-serif; background: #ffffff; color: #18181b; -webkit-font-smoothing: antialiased; }
          input { font-family: inherit; outline: none; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes up { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          .up { animation: up 0.35s cubic-bezier(0.16,1,0.3,1) both; }
          .fi {
            width: 100%; height: 48px; padding: 0 14px;
            background: #f4f4f5; border: 1px solid transparent; border-radius: 8px;
            font-size: 14px; color: #09090b; transition: all 0.15s;
          }
          .fi:focus { background: #ffffff; border-color: #18181b; box-shadow: 0 0 0 3px rgba(24,24,27,0.06); }
          .submit-btn {
            width: 100%; height: 50px; background: #18181b; border: none; border-radius: 8px;
            color: #ffffff; font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
            cursor: pointer; transition: all 0.15s; letter-spacing: -0.01em;
          }
          .submit-btn:hover:not(:disabled) { background: #27272a; transform: translateY(-1px); }
          .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        `}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="up" style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <IconLogoMark size={40} color="#111111" />
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#18181b', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 }}>Forgot password?</h1>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.6 }}>
              {success ? `We've sent reset instructions to your email.` : `No worries, we'll send you reset instructions.`}
            </p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center' }}>
               <div style={{ padding: '12px 14px', borderRadius: 8, background: '#ecfdf5', border: '1px solid #6ee7b7', marginBottom: 32, fontSize: 13, color: '#065f46', fontWeight: 600 }}>Check your inbox for <span style={{ color: '#111827' }}>{email}</span></div>
               <Link href="/login" style={{ display: 'inline-block', width: '100%', padding: '14px 0', borderRadius: 8, background: '#18181b', color: '#ffffff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Back to sign in</Link>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fda4af', marginBottom: 20, fontSize: 13, color: '#be123c', fontWeight: 500 }}>{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3f3f46', marginBottom: 8 }}>Email address</label>
                  <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@abc.com" autoComplete="email" />
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} /> : 'Send instructions'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link href="/login" style={{ fontSize: 14, color: '#18181b', fontWeight: 600, textDecoration: 'none' }}>← Back to sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
