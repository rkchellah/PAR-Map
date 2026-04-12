import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'par-map:onboarded'

const T = {
  card: '#ffffff', border: '#e2e2e2', ink: '#111111',
  mid: '#555555', muted: '#999999', low: '#f0f0f0', container: '#e8e8e8',
}

const STEPS = [
  {
    icon: '🗂️',
    title: 'Upload Boundary Layers',
    desc: 'Go to Boundary Layers → Upload Layer. Drop your .kmz or .kml file, give it a name and colour, then click Upload. These draw the area circles on the map.',
  },
  {
    icon: '👥',
    title: 'Create Field Teams',
    desc: 'In Boundary Layers → Teams, click + New team. Name it after your area circle (e.g. Ngombe Circle), pick a colour, then click Create.',
  },
  {
    icon: '📌',
    title: 'Assign Layers to Teams',
    desc: 'Each boundary layer in the Unassigned list has an Assign button. Click it and pick the team it belongs to. This groups layers by field team on the map.',
  },
  {
    icon: '⭕',
    title: 'Generate Buffer Circles',
    desc: 'Go to Buffer Circles. Prepare a CSV with columns: Name, Latitude, Longitude. Set your radius (e.g. 1km for LG buffers, 2km for warehouses), then click Generate Buffers.',
  },
  {
    icon: '📊',
    title: 'Sync Customer Data',
    desc: 'Go to Customer Data → Upload CSV. Download the template first to check the column format, then upload your weekly PAR export and click Sync to Database. The map updates automatically.',
  },
]

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try { if (!localStorage.getItem(STORAGE_KEY)) setVisible(true) } catch {}
  }, [])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  const isLast = step === STEPS.length - 1

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) dismiss() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter,system-ui,sans-serif',
      }}
    >
      <div style={{
        background: T.card, borderRadius: 20, width: 460,
        border: `1.5px solid ${T.border}`, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 18px', borderBottom: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em' }}>Welcome to PAR Map Admin</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>Here&apos;s how to set everything up in 5 steps</div>
          </div>
          <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = T.ink} onMouseLeave={e => e.currentTarget.style.color = T.muted}>×</button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, padding: '16px 28px 0', alignItems: 'center' }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 20 : 7, height: 7, borderRadius: 4, padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: i === step ? T.ink : i < step ? '#888' : T.container,
              transition: 'all 0.2s',
            }} />
          ))}
          <span style={{ fontSize: 11, color: T.muted, marginLeft: 6, fontFamily: 'DM Mono,monospace' }}>{step + 1} / {STEPS.length}</span>
        </div>

        {/* Step content */}
        <div style={{ padding: '20px 28px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>{STEPS[step].icon}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 10, letterSpacing: '-0.01em' }}>{STEPS[step].title}</div>
          <div style={{ fontSize: 13.5, color: T.mid, lineHeight: 1.7 }}>{STEPS[step].desc}</div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px 20px', borderTop: `1.5px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            style={{ height: 36, padding: '0 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: step === 0 ? T.muted : T.ink, fontSize: 13, fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer', opacity: step === 0 ? 0.4 : 1, fontFamily: 'Inter,system-ui,sans-serif' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={dismiss} style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.color = T.ink} onMouseLeave={e => e.currentTarget.style.color = T.muted}>
              Skip guide
            </button>
            <button onClick={() => isLast ? dismiss() : setStep(s => s + 1)}
              style={{ height: 36, padding: '0 20px', borderRadius: 8, border: 'none', background: T.ink, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#333'} onMouseLeave={e => e.currentTarget.style.background = T.ink}>
              {isLast ? "Let's go →" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}