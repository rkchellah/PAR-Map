// src/components/FraudPopupCard.tsx
// Popup card for fraud checks on the MoMo Sentry map.
// Same design as PopupCard — same layout, fonts, spacing.
// Only the fields change: phone, verdict, narration, time.

import React from 'react'
import { FraudCheck, VERDICT_COLORS } from '../types/sentry'

interface FraudPopupCardProps {
    check: FraudCheck
    narration?: string
}

const T = {
    onSurface: '#2d3335',
    variant: '#41484d',
    muted: '#8a9199',
} as const

const VERDICT_BADGE: Record<string, { bg: string; text: string }> = {
    'SAFE': { bg: 'rgba(22,163,74,0.10)', text: '#16a34a' },
    'CAUTION': { bg: 'rgba(217,119,6,0.10)', text: '#d97706' },
    'STOP': { bg: 'rgba(220,38,38,0.10)', text: '#dc2626' },
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        })
    } catch {
        return iso
    }
}

export const FraudPopupCard: React.FC<FraudPopupCardProps> = ({ check, narration }) => {
    const color = VERDICT_COLORS[check.verdict] ?? '#8a9199'
    const badge = VERDICT_BADGE[check.verdict] ?? VERDICT_BADGE['CAUTION']

    return (
        <div style={{ padding: '20px', width: '280px', fontFamily: 'Manrope, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingRight: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1a1c20', letterSpacing: '-0.02em' }}>
                        {check.phone_number}
                    </span>
                </div>
                <span style={{ background: badge.bg, color: badge.text, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {check.verdict}
                </span>
            </div>

            {/* Narration */}
            <div style={{ fontSize: '12px', color: T.variant, lineHeight: 1.6, marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                {narration === ''
                    ? <span style={{ color: T.muted, letterSpacing: '0.12em' }}>generating <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⋯</span></span>
                    : (narration ?? check.narration)}
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                    { label: 'Area', value: check.agent_location },
                    { label: 'Checked', value: formatTime(check.checked_at) },
                ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ color: T.muted, fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, width: '96px' }}>
                            {row.label}
                        </span>
                        <span style={{ color: T.variant, fontWeight: 600, fontSize: '13px', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}