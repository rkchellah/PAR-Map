import React from 'react'
import { Customer } from '../types/par'
import { getMarkerColor } from '../utils/parHelpers'

interface PopupCardProps {
  customer: Customer
}

const T = {
  onSurface:   '#2d3335',
  variant:     '#41484d',
  muted:       '#8a9199',
  primary:     '#4a4bd7',
} as const

const PAR_BADGE: Record<string, { bg: string; text: string }> = {
  'ONTIME': { bg: 'rgba(22,163,74,0.10)', text: '#16a34a' },
  'PAR 1-30': { bg: 'rgba(101,163,13,0.10)', text: '#65a30d' },
  'PAR 31-60': { bg: 'rgba(217,119,6,0.10)', text: '#d97706' },
  'PAR 61-90': { bg: 'rgba(234,88,12,0.10)', text: '#ea580c' },
  'PAR 90+': { bg: 'rgba(220,38,38,0.10)', text: '#dc2626' },
}

export const PopupCard: React.FC<PopupCardProps> = ({ customer }) => {
  const color = getMarkerColor(customer)
  const badge = PAR_BADGE[customer.par_status] || PAR_BADGE['ONTIME']

  return (
    <div style={{ padding: '20px', width: '280px', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingRight: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
          <span style={{
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            color: '#1a1c20',
            letterSpacing: '-0.02em'
          }}>
            {customer.contract_ref}
          </span>
        </div>
        <span style={{
          background: badge.bg,
          color: badge.text,
          padding: '3px 10px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {customer.par_status}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { label: 'Name',           value: customer.name             || '-' },
          { label: 'Phone',          value: customer.phone            || '-' },
          { label: 'Area',           value: customer.area             || '-' },
          { label: 'Lead Generator', value: customer.lead_generate_name || '-' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              color: T.muted,
              fontSize: '9px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              flexShrink: 0,
              width: '96px',
            }}>
              {row.label}
            </span>
            <span style={{
              color: T.variant,
              fontWeight: 600,
              fontSize: '13px',
              flex: 1,
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
