import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  fetchLayers, uploadLayer, deleteLayer,
  toggleLayerVisibility, updateLayerColor, renameLayer,
  fetchBufferLayers, uploadBufferLayer, deleteBufferLayer,
  toggleBufferLayerVisibility, updateBufferLayerColor, renameBufferLayer,
} from '../lib/layerService'
import { useAuth } from '../lib/useAuth'
import { syncCustomers, getCustomers } from '../lib/customerService'
import { supabase } from '../lib/supabase'
import { Customer, isPriorityVisit, PAR_COLORS } from '../types/par'
import type { KMZLayer } from '../types/par'
import Papa from 'papaparse'
import OnboardingGuide from '../components/OnboardingGuide'
import {
  IconUsers, IconLayers, IconBufferZone, IconCheckCircle, IconXCircle,
  IconUpload, IconChevronUp, IconChevronDown, IconSignOut, IconLogoMark,
  IconAlertCircle, IconLock, IconTrash, IconEye, IconEyeOff,
  IconBack, IconDownload, IconRefresh, IconEdit,
} from '../components/icons'

const T = {
  canvas: '#f7f7f7', card: '#ffffff', low: '#f0f0f0', container: '#e8e8e8',
  border: '#e2e2e2', ink: '#111111', mid: '#555555', muted: '#999999',
  error: '#c0392b', errorDim: 'rgba(192,57,43,0.06)', success: '#1a7a4a',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
} as const

const LAYER_COLORS = [
  '#111111','#374151','#64748b','#1e40af','#2563eb','#3d3fcc','#0e7490',
  '#166534','#1a7a4a','#059669','#7f1d1d','#c0392b','#dc2626','#be185d',
  '#9a3412','#d97706','#ca8a04','#6b21a8','#7c3aed','#a21caf','#0f766e','#0891b2',
]

type Section = 'customers' | 'layers' | 'buffers'
type Status = { type: 'idle' | 'loading' | 'ok' | 'err'; msg: string }
interface Team { id: string; name: string; color: string; layerIds: string[] }

const NAV: { id: Section; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'customers', label: 'Customer Data',    Icon: ({ size }) => <IconUsers size={size} /> },
  { id: 'layers',    label: 'Boundary Layers',  Icon: ({ size }) => <IconLayers size={size} /> },
  { id: 'buffers',   label: 'Buffer Circles',   Icon: ({ size }) => <IconBufferZone size={size} /> },
]

function geodesicPoint(lat: number, lon: number, radiusM: number, angleDeg: number): [number, number] {
  const R = 6371000, b = (angleDeg * Math.PI) / 180
  const latR = (lat * Math.PI) / 180, lonR = (lon * Math.PI) / 180, d = radiusM / R
  const lat2 = Math.asin(Math.sin(latR) * Math.cos(d) + Math.cos(latR) * Math.sin(d) * Math.cos(b))
  const lon2 = lonR + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(latR), Math.cos(d) - Math.sin(latR) * Math.sin(lat2))
  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]
}

function parBadgeStyle(st: string): React.CSSProperties {
  if (st === 'ONTIME' || st === 'PAR 1-30') return { background: '#f0fdf4', color: '#15803d' }
  if (st === 'PAR 31-60') return { background: '#fff7ed', color: '#c2410c' }
  if (st === 'PAR 61-90') return { background: '#fef2f2', color: '#dc2626' }
  return { background: '#fef2f2', color: '#991b1b' }
}

function Btn({ children, onClick, disabled, variant = 'primary', size = 'md' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md'
}) {
  const s: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    fontFamily: 'Inter,system-ui,sans-serif', fontWeight: 600, border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition: 'all 0.12s', borderRadius: size === 'sm' ? 9 : 10, letterSpacing: '-0.01em',
    height: size === 'sm' ? 36 : 46, padding: size === 'sm' ? '0 14px' : '0 20px',
    fontSize: size === 'sm' ? 12.5 : 13.5,
  }
  const v: Record<string, React.CSSProperties> = {
    primary:   { background: '#111', color: '#fff' },
    secondary: { background: T.card, color: T.ink, border: `1.5px solid ${T.border}` },
    ghost:     { background: 'transparent', color: T.mid },
    danger:    { background: T.errorDim, color: T.error, border: `1.5px solid rgba(192,57,43,0.15)` },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...s, ...v[variant] }}
      onMouseEnter={e => {
        if (disabled) return; const el = e.currentTarget as HTMLElement
        if (variant === 'primary')   el.style.background = '#333'
        if (variant === 'secondary') el.style.borderColor = '#aaa'
        if (variant === 'ghost')     el.style.background = T.low
        if (variant === 'danger')    el.style.background = 'rgba(192,57,43,0.12)'
      }}
      onMouseLeave={e => {
        if (disabled) return; const el = e.currentTarget as HTMLElement
        if (variant === 'primary')   el.style.background = '#111'
        if (variant === 'secondary') el.style.borderColor = T.border
        if (variant === 'ghost')     el.style.background = 'transparent'
        if (variant === 'danger')    el.style.background = T.errorDim
      }}
    >{children}</button>
  )
}
function StatusMsg({ s }: { s: Status }) {
  if (s.type === 'idle' || !s.msg) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: s.type === 'ok' ? T.success : s.type === 'loading' ? T.muted : T.error, fontFamily: 'Inter,system-ui,sans-serif' }}>
      {s.type === 'ok' ? <IconCheckCircle size={14} /> : s.type === 'err' ? <IconXCircle size={14} /> : null}{s.msg}
    </div>
  )
}
function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted, marginBottom: 6, fontFamily: 'Inter,system-ui,sans-serif' }}>{children}</label>
}
function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: '100%', height: 42, padding: '0 14px', background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14, color: T.ink, fontFamily: 'Inter,system-ui,sans-serif', outline: 'none', transition: 'border-color 0.15s', ...props.style }}
    onFocus={e => { e.currentTarget.style.borderColor = '#111'; props.onFocus?.(e) }}
    onBlur={e => { e.currentTarget.style.borderColor = T.border; props.onBlur?.(e) }} />
}
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: T.card, borderRadius: 16, border: `1.5px solid ${T.border}`, overflow: 'hidden', ...style }}>{children}</div>
}
function CardHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1.5px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em', fontFamily: 'Inter,system-ui,sans-serif' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2, fontFamily: 'Inter,system-ui,sans-serif' }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}
function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />
}
function Swatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [hex, setHex] = React.useState(value)
  React.useEffect(() => setHex(value), [value])
  const isValidHex = (h: string) => /^#[0-9a-fA-F]{6}$/.test(h)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {LAYER_COLORS.map(c => (
          <button key={c} onClick={() => { onChange(c); setHex(c) }}
            style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', boxShadow: value === c ? `0 0 0 2px white,0 0 0 4px ${c}` : 'none', transform: value === c ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.12s', flexShrink: 0 }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: isValidHex(hex) ? hex : value, flexShrink: 0, border: `1.5px solid ${T.border}` }} />
        <input type="text" value={hex} onChange={e => { setHex(e.target.value); if (isValidHex(e.target.value)) onChange(e.target.value) }} placeholder="#000000"
          style={{ width: 88, height: 30, padding: '0 8px', background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 6, fontSize: 12, color: T.ink, fontFamily: 'DM Mono,monospace', outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => e.currentTarget.style.borderColor = '#111'} onBlur={e => e.currentTarget.style.borderColor = T.border} />
        <span style={{ fontSize: 11, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif' }}>custom hex</span>
      </div>
    </div>
  )
}
function Toggle({ on, onToggle, label, hint }: { on: boolean; onToggle: () => void; label: string; hint: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ width: 38, height: 22, borderRadius: 11, background: on ? '#111' : T.container, position: 'relative', transition: 'background 0.15s', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 2, left: on ? 18 : 2, transition: 'left 0.15s', boxShadow: T.shadowSm }} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: T.ink, fontFamily: 'Inter,system-ui,sans-serif' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 1, fontFamily: 'Inter,system-ui,sans-serif' }}>{hint}</div>
      </div>
    </div>
  )
}
function DZ({ file, label, hint, accept, id, onSel }: { file: File | null; label: string; hint: string; accept: string; id: string; onSel: (f: File) => void }) {
  const [drag, setDrag] = useState(false)
  return (
    <div onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onSel(f) }}
      onClick={() => document.getElementById(id)?.click()}
      style={{ width: '100%', height: 100, borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: drag ? 'rgba(0,0,0,0.03)' : T.low, border: `1.5px dashed ${file || drag ? '#111' : '#ccc'}`, transition: 'all 0.12s' }}>
      {file ? (<><span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: 'Inter,system-ui,sans-serif' }}>{file.name}</span><span style={{ fontSize: 11, color: T.muted }}>{(file.size / 1024).toFixed(0)} KB</span></>) : (<><IconUpload size={16} color={T.muted} /><span style={{ fontSize: 13, fontWeight: 500, color: T.mid, fontFamily: 'Inter,system-ui,sans-serif' }}>{label}</span><span style={{ fontSize: 11, color: T.muted }}>{hint}</span></>)}
      <input type="file" id={id} accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onSel(f) }} />
    </div>
  )
}
function PrevTable({ data, cols }: { data: Record<string, string>[]; cols: string[] }) {
  if (!data.length) return null
  return (
    <div style={{ marginTop: 10, borderRadius: 8, border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: T.low }}>{cols.map(h => <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.muted, fontFamily: 'Inter,system-ui,sans-serif', position: 'sticky', top: 0, background: T.low }}>{h}</th>)}</tr></thead>
          <tbody>{data.slice(0, 10).map((r, i) => (<tr key={i} style={{ background: i % 2 === 0 ? T.card : 'transparent' }}>{cols.map(k => <td key={k} style={{ padding: '7px 12px', fontSize: 12, color: T.mid, fontFamily: 'Inter,system-ui,sans-serif', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r[k] ?? '-'}</td>)}</tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
function LayerRow({ layer, onToggle, onDelete, onAssign, onUnassign, showUnassign = false, editColorOpen, onColorEdit, onColorChange, editRenameOpen, onRenameEdit, onRenameSubmit }: {
  layer: KMZLayer; onToggle: () => void; onDelete?: () => void; onAssign?: () => void; onUnassign?: () => void; showUnassign?: boolean
  editColorOpen: boolean; onColorEdit: () => void; onColorChange: (c: string) => void
  editRenameOpen?: boolean; onRenameEdit?: () => void; onRenameSubmit?: (name: string) => void
}) {
  const [renameVal, setRenameVal] = React.useState(layer.name)
  React.useEffect(() => { setRenameVal(layer.name) }, [layer.name, editRenameOpen])
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 20px', transition: 'background 0.1s', cursor: 'default' }}
        onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
          <button onClick={onColorEdit} title="Change color" style={{ width: 12, height: 12, borderRadius: '50%', background: layer.color, border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: editColorOpen ? `0 0 0 2px white,0 0 0 4px ${layer.color}` : 'none', transition: 'box-shadow 0.12s' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter,system-ui,sans-serif' }}>{layer.name}</span>
          {layer.locked && <IconLock size={10} color={T.muted} style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {onRenameEdit && !layer.locked && (<button onClick={onRenameEdit} title="Rename" style={{ background: 'none', border: 'none', cursor: 'pointer', color: editRenameOpen ? T.ink : T.muted, display: 'flex', padding: 4, borderRadius: 4, transition: 'color 0.1s' }} onMouseEnter={e => e.currentTarget.style.color = T.ink} onMouseLeave={e => e.currentTarget.style.color = editRenameOpen ? T.ink : T.muted}><IconEdit size={13} /></button>)}
          {onAssign && (<button onClick={onAssign} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: `1px solid ${T.border}`, background: T.card, color: T.mid, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif', transition: 'border-color 0.1s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#888'} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>Assign</button>)}
          {showUnassign && onUnassign && (<button onClick={onUnassign} style={{ fontSize: 11, padding: '3px 6px', borderRadius: 5, border: 'none', background: 'transparent', color: T.muted, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif' }} onMouseEnter={e => e.currentTarget.style.color = T.error} onMouseLeave={e => e.currentTarget.style.color = T.muted}>Remove</button>)}
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: layer.visible ? T.ink : T.muted, display: 'flex', padding: 4, borderRadius: 4 }}>{layer.visible ? <IconEye size={13} /> : <IconEyeOff size={13} />}</button>
          {onDelete && !layer.locked && (<button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex', padding: 4, borderRadius: 4, transition: 'color 0.1s' }} onMouseEnter={e => e.currentTarget.style.color = T.error} onMouseLeave={e => e.currentTarget.style.color = T.muted}><IconTrash size={13} /></button>)}
        </div>
      </div>
      {editRenameOpen && onRenameSubmit && (
        <div style={{ padding: '10px 20px 12px 44px', background: T.low, borderTop: `1px solid ${T.border}` }}>
          <form onSubmit={e => { e.preventDefault(); if (renameVal.trim()) onRenameSubmit(renameVal.trim()) }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)} style={{ flex: 1, height: 34, padding: '0 10px', background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 7, fontSize: 13, color: T.ink, fontFamily: 'Inter,system-ui,sans-serif', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#111'} onBlur={e => e.currentTarget.style.borderColor = T.border} />
            <button type="submit" disabled={!renameVal.trim() || renameVal.trim() === layer.name} style={{ height: 34, padding: '0 12px', borderRadius: 7, border: 'none', background: '#111', color: '#fff', fontSize: 12, fontWeight: 600, cursor: !renameVal.trim() || renameVal.trim() === layer.name ? 'not-allowed' : 'pointer', opacity: !renameVal.trim() || renameVal.trim() === layer.name ? 0.4 : 1, fontFamily: 'Inter,system-ui,sans-serif' }}>Save</button>
            <button type="button" onClick={onRenameEdit} style={{ height: 34, padding: '0 10px', borderRadius: 7, border: `1.5px solid ${T.border}`, background: T.card, color: T.mid, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif' }}>Cancel</button>
          </form>
        </div>
      )}
      {editColorOpen && (<div style={{ padding: '12px 24px 14px 44px', background: T.low, marginTop: 0, borderTop: `1px solid ${T.border}` }}><Swatches value={layer.color} onChange={onColorChange} /></div>)}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading, authError, signOut } = useAuth()

  useEffect(() => {
    if (!authLoading && !authError && !isAdmin) router.replace('/login?next=/admin')
  }, [authLoading, authError, isAdmin, router])

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid #e8e8e8', borderTopColor: '#111', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  )

  if (authError) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ maxWidth: 360, textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 13, color: T.error, background: T.errorDim, border: `1px solid rgba(192,57,43,0.15)`, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>{authError}</div>
        <button onClick={() => window.location.reload()} style={{ fontSize: 13, fontWeight: 600, color: T.ink, background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  )

  if (!isAdmin) return null
  return <AdminContent signOut={signOut} />
}

function AdminContent({ signOut }: { signOut: () => void }) {
  const [active, setActive]   = useState<Section>('customers')
  const [visible, setVisible] = useState(true)
  const [layers, setLayers]   = useState<KMZLayer[]>([])
  const [layersLoading, setLayersLoading] = useState(true)
  const [editColorId, setEditColorId]     = useState<string | null>(null)
  const [editRenameId, setEditRenameId]   = useState<string | null>(null)
  const [editBufColorId, setEditBufColorId]   = useState<string | null>(null)
  const [editBufRenameId, setEditBufRenameId] = useState<string | null>(null)

  const [kmzFile, setKmzFile]         = useState<File | null>(null)
  const [layerName, setLayerName]     = useState('')
  const [layerColor, setLayerColor]   = useState(LAYER_COLORS[1])
  const [layerLocked, setLayerLocked] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<Status>({ type: 'idle', msg: '' })

  const [teams, setTeams]             = useState<Team[]>([])
  const [newTeamName, setNewTeamName]   = useState('')
  const [newTeamColor, setNewTeamColor] = useState(LAYER_COLORS[0])
  const [showNewTeam, setShowNewTeam]   = useState(false)
  const [teamOpen, setTeamOpen]         = useState<Record<string, boolean>>({})
  const [assignModal, setAssignModal]   = useState<{ layerId: string; layerName: string } | null>(null)

  const [csvFile, setCsvFile]     = useState<File | null>(null)
  const [radius, setRadius]       = useState('100')
  const [unit, setUnit]           = useState<'m' | 'km'>('m')
  const [bufColor, setBufColor]   = useState(LAYER_COLORS[7])
  const [bufLocked, setBufLocked] = useState(false)
  const [bufStatus, setBufStatus] = useState<Status>({ type: 'idle', msg: '' })
  const [prev2, setPrev2]         = useState<Record<string, string>[]>([])
  const [bufferLayers, setBufferLayers] = useState<KMZLayer[]>([])

  const [parCsv, setParCsv]               = useState<File | null>(null)
  const [parStatus, setParStatus]         = useState<Status>({ type: 'idle', msg: '' })
  const [prev3, setPrev3]                 = useState<Record<string, string>[]>([])
  const [liveCustomers, setLiveCustomers] = useState<Customer[]>([])

  useEffect(() => {
    getCustomers().then(data => {
      setLiveCustomers(data)
    }).catch(() => {})
  }, [])

  const loadLayers = useCallback(async () => {
    setLayersLoading(true)
    const [fetchedLayers, fetchedBuffers, teamsResult] = await Promise.all([
      fetchLayers(), fetchBufferLayers(), supabase.from('teams').select('*'),
    ])
    setLayers(fetchedLayers)
    setBufferLayers(fetchedBuffers)
    setTeams((teamsResult.data ?? [] as Array<{ id: string; name: string; color: string; layer_ids?: string[] }>).map(r => ({ id: r.id, name: r.name, color: r.color, layerIds: r.layer_ids ?? [] })))
    setLayersLoading(false)
  }, [])

  useEffect(() => { loadLayers() }, [loadLayers])

  function navigate(s: Section) { if (s === active) return; setVisible(false); setTimeout(() => { setActive(s); setVisible(true) }, 120) }
  async function handleLogout() { await signOut(); window.location.href = '/login' }

  async function createTeam() {
    if (!newTeamName.trim()) return
    const t: Team = { id: crypto.randomUUID(), name: newTeamName.trim(), color: newTeamColor, layerIds: [] }
    const { error } = await supabase.from('teams').insert({ id: t.id, name: t.name, color: t.color, layer_ids: t.layerIds })
    if (!error) { setTeams(prev => [...prev, t]); setNewTeamName(''); setShowNewTeam(false) }
  }
  async function deleteTeam(id: string) {
    if (!confirm('Delete team?')) return
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (!error) setTeams(prev => prev.filter(t => t.id !== id))
  }
  async function assignToTeam(teamId: string, layerId: string) {
    const updated = teams.map(t => {
      if (t.id === teamId && !t.layerIds.includes(layerId)) return { ...t, layerIds: [...t.layerIds, layerId] }
      if (t.id !== teamId && t.layerIds.includes(layerId)) return { ...t, layerIds: t.layerIds.filter(i => i !== layerId) }
      return t
    })
    const changed = updated.filter((t, i) => t !== teams[i])
    await Promise.all(changed.map(t => supabase.from('teams').update({ layer_ids: t.layerIds }).eq('id', t.id)))
    setTeams(updated); setAssignModal(null)
  }
  async function removeFromTeam(teamId: string, layerId: string) {
    const updatedIds = teams.find(t => t.id === teamId)?.layerIds.filter(i => i !== layerId) ?? []
    await supabase.from('teams').update({ layer_ids: updatedIds }).eq('id', teamId)
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, layerIds: updatedIds } : t))
  }
  async function handleLayerColorChange(id: string, color: string) {
    try { await updateLayerColor(id, color); loadLayers() } catch {}
    setEditColorId(null)
  }
  async function handleLayerRename(id: string, name: string) {
    try { await renameLayer(id, name); loadLayers() } catch {}
    setEditRenameId(null)
  }
  async function handleBufferColorChange(id: string, color: string) {
    setBufferLayers(prev => prev.map(l => l.id === id ? { ...l, color } : l))
    setEditBufColorId(null)
    try { await updateBufferLayerColor(id, color) } catch {}
  }
  async function handleBufferRename(id: string, name: string) {
    setBufferLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l))
    setEditBufRenameId(null)
    try { await renameBufferLayer(id, name) } catch {}
  }
  async function handleUpload() {
    if (!kmzFile || !layerName.trim()) return
    setUploadStatus({ type: 'loading', msg: '' })
    try { await uploadLayer(kmzFile, layerName, layerColor, layerLocked); setUploadStatus({ type: 'ok', msg: 'Layer uploaded' }); setKmzFile(null); setLayerName(''); loadLayers() }
    catch { setUploadStatus({ type: 'err', msg: 'Upload failed' }) }
  }
  async function handleDelete(id: string, filePath?: string) {
    if (!filePath || !confirm('Delete this layer?')) return
    await deleteLayer(id, filePath); loadLayers()
    const affected = teams.filter(t => t.layerIds.includes(id))
    await Promise.all(affected.map(t => supabase.from('teams').update({ layer_ids: t.layerIds.filter(i => i !== id) }).eq('id', t.id)))
    setTeams(prev => prev.map(t => ({ ...t, layerIds: t.layerIds.filter(i => i !== id) })))
  }
  async function handleToggle(layer: KMZLayer) { await toggleLayerVisibility(layer.id, !layer.visible); loadLayers() }
  async function handleToggleBuffer(layer: KMZLayer) {
    await toggleBufferLayerVisibility(layer.id, !layer.visible)
    setBufferLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !layer.visible } : l))
  }
  async function handleDeleteBuffer(id: string, filePath?: string) {
    if (!confirm('Delete this buffer layer?')) return
    await deleteBufferLayer(id, filePath ?? '')
    setBufferLayers(prev => prev.filter(l => l.id !== id))
  }

  function downloadTemplate() {
    const csv = [
      'Contract Reference,Name,Area,Latitude,Longitude,PAR Status,Phone,Phone 2,Lead Generate,Lead Generator Name',
      'ECS-0001,Customer Name,Area Name,-15.3580,28.3250,ONTIME,+260970000000,,CP001,Agent Name'
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'PAR_Map_Template.csv'; a.click()
  }

  function onParCsvSelect(f: File) {
    setParCsv(f); setParStatus({ type: 'idle', msg: '' })
    Papa.parse(f, { header: true, skipEmptyLines: true, complete: r => {
      const normalized = (r.data as Record<string, string>[]).slice(0, 10).map(row => {
        const n: Record<string, string> = {}
        Object.keys(row).forEach(k => { n[k.toLowerCase().trim()] = row[k] })
        return n
      })
      setPrev3(normalized)
    }})
  }

  async function handleGenerateCustomers() {
    if (!parCsv) return
    setParStatus({ type: 'loading', msg: 'Syncing to database...' })
    Papa.parse(parCsv, { header: true, skipEmptyLines: true, complete: async (res) => {
      const rows: Record<string, unknown>[] = []; let skipped = 0
      const formatPhone = (val: string) => {
        if (!val) return ''
        const trimmed = val.trim()
        if (trimmed.includes('E+') || trimmed.includes('e+')) { const num = parseFloat(trimmed); if (!isNaN(num)) return Math.round(num).toString() }
        return trimmed
      }
      for (const row of res.data as Record<string, string>[]) {
        const r: Record<string, string> = {}
        Object.keys(row).forEach(k => { r[k.toLowerCase().trim()] = row[k] })
        const lat = parseFloat(r['latitude']), lon = parseFloat(r['longitude'])
        if (!r['latitude'] || !r['longitude'] || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0 || Math.abs(lat) > 90 || Math.abs(lon) > 180) { skipped++; continue }
        rows.push({ contract_ref: r['contract reference'] || r['code'] || '', name: r['name'] ?? '', phone: formatPhone(r['phone'] ?? ''), phone2: formatPhone(r['phone 2'] ?? ''), area: r['area'] ?? '', par_status: r['par status'] ?? '', lead_generate: r['lead generate'] ?? '', lead_generate_name: r['lead generator name'] ?? '', latitude: lat, longitude: lon })
      }
      try {
        await syncCustomers(rows)
        setParStatus({ type: 'ok', msg: `${rows.length} records synced. ${skipped} skipped.` })
        setParCsv(null); setPrev3([])
        getCustomers().then(data => { setLiveCustomers(data) }).catch(() => {})
      } catch (e: unknown) { setParStatus({ type: 'err', msg: e instanceof Error ? e.message : 'Sync failed' }) }
    }, error: () => setParStatus({ type: 'err', msg: 'Failed to parse CSV' }) })
  }

  function handleGenerateBuffers() {
    if (!csvFile) return
    setBufStatus({ type: 'loading', msg: '' })
    const radM = unit === 'km' ? parseFloat(radius) * 1000 : parseFloat(radius)
    Papa.parse(csvFile, { header: true, skipEmptyLines: true, complete: async res => {
      try {
        const features: object[] = []
        for (const row of res.data as Record<string, string>[]) {
          const lat = parseFloat(row.Latitude ?? row.latitude ?? row.Lat ?? row.lat)
          const lon = parseFloat(row.Longitude ?? row.longitude ?? row.Lon ?? row.lon ?? row.Lng ?? row.lng)
          if (isNaN(lat) || isNaN(lon)) continue
          const coords: [number, number][] = []
          for (let i = 0; i < 36; i++) coords.push(geodesicPoint(lat, lon, radM, i * 10))
          coords.push(coords[0])
          features.push({ type: 'Feature', properties: { name: row.Name ?? row.name ?? 'Buffer' }, geometry: { type: 'Polygon', coordinates: [coords] } })
        }
        if (!features.length) throw new Error('No valid coordinates')
        const blob = new Blob([JSON.stringify({ type: 'FeatureCollection', features })], { type: 'application/json' })
        await uploadBufferLayer(new File([blob], `buffers_${Date.now()}.geojson`), `${csvFile.name.replace(/\.csv$/i, '')} (${radius}${unit})`, bufColor, bufLocked)
        setBufStatus({ type: 'ok', msg: `${features.length} buffers uploaded` })
        setCsvFile(null); setPrev2([]); loadLayers()
      } catch (e: unknown) { setBufStatus({ type: 'err', msg: e instanceof Error ? e.message : 'Failed' }) }
    }, error: () => setBufStatus({ type: 'err', msg: 'CSV parse error' }) })
  }

  const assignedIds     = new Set(teams.flatMap(t => t.layerIds))
  const ungroupedLayers = layers.filter(l => !assignedIds.has(l.id))
  const rowProps = (layer: KMZLayer) => ({
    layer, onToggle: () => handleToggle(layer), onDelete: () => handleDelete(layer.id, layer.file_path),
    editColorOpen: editColorId === layer.id, onColorEdit: () => { setEditColorId(editColorId === layer.id ? null : layer.id); setEditRenameId(null) }, onColorChange: (c: string) => handleLayerColorChange(layer.id, c),
    editRenameOpen: editRenameId === layer.id, onRenameEdit: () => { setEditRenameId(editRenameId === layer.id ? null : layer.id); setEditColorId(null) }, onRenameSubmit: (name: string) => handleLayerRename(layer.id, name),
  })
  const bufRowProps = (layer: KMZLayer) => ({
    layer, onToggle: () => handleToggleBuffer(layer), onDelete: () => handleDeleteBuffer(layer.id, layer.file_path),
    editColorOpen: editBufColorId === layer.id, onColorEdit: () => { setEditBufColorId(editBufColorId === layer.id ? null : layer.id); setEditBufRenameId(null) }, onColorChange: (c: string) => handleBufferColorChange(layer.id, c),
    editRenameOpen: editBufRenameId === layer.id, onRenameEdit: () => { setEditBufRenameId(editBufRenameId === layer.id ? null : layer.id); setEditBufColorId(null) }, onRenameSubmit: (name: string) => handleBufferRename(layer.id, name),
  })

  return (
    <>
      <Head>
        <title>Admin — PAR Map</title>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{font-family:'Inter',system-ui,sans-serif;background:${T.canvas};color:${T.ink};-webkit-font-smoothing:antialiased;}
          ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}
          ::-webkit-scrollbar-thumb{background:${T.container};border-radius:4px;}
          input::placeholder{color:${T.muted};}select{outline:none;font-family:inherit;}
          @keyframes fadeIn{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:translateY(0);}}
          @keyframes spin{to{transform:rotate(360deg);}}
          .fi{animation:fadeIn 0.14s ease;}
        `}</style>
      </Head>

      {/* Onboarding guide — first visit only */}
      <OnboardingGuide />

      {/* Assign modal */}
      {assignModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setAssignModal(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.card, borderRadius: 14, width: 340, border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>Assign to team</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{assignModal.layerName}</div>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {teams.length === 0 ? (
                <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 13, color: T.muted }}>No teams yet — create one first</div>
              ) : teams.map(team => {
                const assigned = team.layerIds.includes(assignModal.layerId)
                return (
                  <button key={team.id} onClick={() => assigned ? removeFromTeam(team.id, assignModal.layerId) : assignToTeam(team.id, assignModal.layerId)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: assigned ? T.low : 'transparent', marginBottom: 2, transition: 'background 0.1s', fontFamily: 'Inter,system-ui,sans-serif' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = assigned ? T.low : 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Dot color={team.color} size={10} /><span style={{ fontSize: 13, fontWeight: 500, color: T.ink }}>{team.name}</span></div>
                    {assigned && <span style={{ fontSize: 11, color: T.muted, background: T.container, padding: '2px 8px', borderRadius: 4 }}>assigned ✓</span>}
                  </button>
                )
              })}
            </div>
            <div style={{ padding: '10px 20px 16px', borderTop: `1.5px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end' }}>
              <Btn variant="secondary" size="sm" onClick={() => setAssignModal(null)}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <aside style={{ width: 268, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column', background: T.card, borderRight: `1.5px solid ${T.border}` }}>
          <div style={{ padding: '18px 18px 14px', borderBottom: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconLogoMark size={24} color={T.ink} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>PAR Map</div>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: 'DM Mono', letterSpacing: '0.02em', marginTop: 1 }}>Admin</div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: '6px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {NAV.map(({ id, label, Icon }) => {
              const a = active === id
              return (
                <button key={id} onClick={() => navigate(id)}
                  style={{ width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: a ? T.ink : T.muted }}>
                    <Icon size={14} />
                    <span style={{ fontSize: 12, fontFamily: 'Inter,system-ui,sans-serif', fontWeight: a ? 700 : 500, color: a ? T.ink : T.mid }}>{label}</span>
                  </div>
                  <div style={{ color: T.muted }}>{a ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</div>
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '10px 8px 14px', borderTop: `1.5px solid ${T.border}` }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif', transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.low }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <IconBack size={13} />Back to Map
            </Link>
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: 13, color: T.muted, background: 'transparent', fontFamily: 'Inter,system-ui,sans-serif', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = T.errorDim; e.currentTarget.style.color = T.error }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.muted }}>
              <IconSignOut size={13} />Sign out
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: T.canvas }}>
          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '36px 36px', opacity: visible ? 1 : 0, transition: 'opacity 0.12s' }}>

            {active === 'customers' && (
              <div className="fi">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 21, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>Customer Data</h1>
                  <p style={{ fontSize: 13, color: T.muted, marginTop: 5, lineHeight: 1.6 }}>Upload weekly PAR CSV to sync customer data to the database</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                  <Card>
                    <CardHeader title="Upload CSV" sub="Replace weekly customer data" />
                    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div>
                        <Btn variant="secondary" size="sm" onClick={downloadTemplate}><IconDownload size={13} /> Download template</Btn>
                        <p style={{ fontSize: 12, color: T.muted, marginTop: 7 }}>Template has dummy data — replace with your export</p>
                      </div>
                      <DZ file={parCsv} label="Drop .csv file here" hint="CSV only" accept=".csv" id="par-csv" onSel={onParCsvSelect} />
                      {prev3.length > 0 && <PrevTable data={prev3} cols={['contract reference', 'area', 'par status']} />}
                      <Btn onClick={handleGenerateCustomers} disabled={!parCsv}><IconUpload size={14} /> Sync to Database</Btn>
                      <StatusMsg s={parStatus} />
                      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, marginTop: 4 }}>
                        <Btn variant="danger" size="sm" onClick={async () => {
                          if (!confirm('Delete all customer data? This cannot be undone.')) return
                          setParStatus({ type: 'loading', msg: 'Deleting...' })
                          const { error } = await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
                          if (error) setParStatus({ type: 'err', msg: error.message })
                          else { setParStatus({ type: 'ok', msg: 'All customer data deleted.' }); setLiveCustomers([]) }
                        }}><IconTrash size={13} /> Clear all customer data</Btn>
                      </div>
                    </div>
                  </Card>
                  <div style={{ background: T.card, borderRadius: '16px 16px 10px 10px', border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
                    <CardHeader title="Customers" right={<span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: T.low, color: T.mid, fontFamily: 'DM Mono' }}>{liveCustomers.length.toLocaleString()}</span>} />
                    <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                      {liveCustomers.map((c, i) => (
                        <div key={c.contract_ref || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderBottom: `1px solid ${T.border}`, transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <Dot color={PAR_COLORS[c.par_status] ?? '#ccc'} />
                            {isPriorityVisit(c) && <IconAlertCircle size={10} color={T.error} />}
                          </div>
                          <span style={{ fontSize: 11, fontFamily: 'DM Mono', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.ink }}>{c.contract_ref}</span>
                          <span style={{ fontSize: 11, color: T.muted, flexShrink: 0, marginRight: 6 }}>{c.area}</span>
                          <span style={{ ...parBadgeStyle(c.par_status), fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, padding: '2px 7px', borderRadius: 4, fontFamily: 'DM Mono' }}>{c.par_status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'layers' && (
              <div className="fi">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 21, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>Boundary Layers</h1>
                  <p style={{ fontSize: 13, color: T.muted, marginTop: 5, lineHeight: 1.6 }}>Upload, recolor, group into teams, and manage KMZ boundaries</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                  <Card>
                    <CardHeader title="Upload Layer" />
                    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <DZ file={kmzFile} label="Drop .kmz / .kml here" hint="KMZ, KML or GeoJSON" accept=".kmz,.kml,.geojson" id="kmz-input" onSel={f => { setKmzFile(f); if (!layerName) setLayerName(f.name.replace(/\.[^/.]+$/, '')) }} />
                      <div><FL>Layer name</FL><FI value={layerName} onChange={e => setLayerName(e.target.value)} placeholder="e.g. Ngombe Boundary" /></div>
                      <div><FL>Layer colour</FL><Swatches value={layerColor} onChange={setLayerColor} /></div>
                      <Toggle on={layerLocked} onToggle={() => setLayerLocked(v => !v)} label="Lock layer" hint="Field users can't hide locked layers" />
                      <Btn onClick={handleUpload} disabled={!kmzFile || !layerName.trim()}><IconUpload size={14} /> Upload Layer</Btn>
                      <StatusMsg s={uploadStatus} />
                    </div>
                  </Card>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <Card>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1.5px solid ${T.border}` }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em', fontFamily: 'Inter,system-ui,sans-serif' }}>Teams</div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 1, fontFamily: 'Inter,system-ui,sans-serif' }}>{teams.length} team{teams.length !== 1 ? 's' : ''} · group layers by field team</div>
                        </div>
                        <Btn variant="secondary" size="sm" onClick={() => setShowNewTeam(v => !v)}>{showNewTeam ? 'Cancel' : '+ New team'}</Btn>
                      </div>
                      {showNewTeam && (
                        <div style={{ padding: '12px 18px', borderBottom: `1.5px solid ${T.border}`, background: 'rgba(0,0,0,0.015)' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
                            <div style={{ flex: 1 }}><FL>Team name</FL><FI value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Ngombe Circle" style={{ height: 38 }} onKeyDown={e => { if (e.key === 'Enter') createTeam() }} /></div>
                            <Btn size="sm" onClick={createTeam} disabled={!newTeamName.trim()}>Create</Btn>
                          </div>
                          <FL>Team colour</FL><Swatches value={newTeamColor} onChange={setNewTeamColor} />
                        </div>
                      )}
                      {teams.length === 0 ? (
                        <div style={{ padding: '18px 20px', fontSize: 13, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif' }}>No teams yet. Create a team to group layers by area circle.</div>
                      ) : teams.map(team => {
                        const tls = layers.filter(l => team.layerIds.includes(l.id))
                        const isOpen = teamOpen[team.id] !== false
                        return (
                          <div key={team.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', cursor: 'pointer' }} onClick={() => setTeamOpen(o => ({ ...o, [team.id]: !isOpen }))}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <Dot color={team.color} size={9} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: 'Inter,system-ui,sans-serif' }}>{team.name}</span>
                                <span style={{ fontSize: 11, color: T.muted, background: T.low, padding: '2px 8px', borderRadius: 4, fontFamily: 'DM Mono' }}>{tls.length}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button onClick={e => { e.stopPropagation(); deleteTeam(team.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex', padding: 3, borderRadius: 4, transition: 'color 0.1s' }} onMouseEnter={e => e.currentTarget.style.color = T.error} onMouseLeave={e => e.currentTarget.style.color = T.muted}><IconTrash size={12} /></button>
                                {isOpen ? <IconChevronUp size={12} color={T.muted} /> : <IconChevronDown size={12} color={T.muted} />}
                              </div>
                            </div>
                            {isOpen && (
                              <div style={{ paddingBottom: 6 }}>
                                {tls.length === 0 ? <div style={{ padding: '6px 20px 10px', fontSize: 12, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif' }}>No layers — click Assign on a layer below</div>
                                  : tls.map(layer => <LayerRow key={layer.id} {...rowProps(layer)} onAssign={() => setAssignModal({ layerId: layer.id, layerName: layer.name })} onUnassign={() => removeFromTeam(team.id, layer.id)} showUnassign />)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </Card>
                    <Card>
                      <CardHeader title={`Unassigned (${ungroupedLayers.length})`} sub="Assign to a team or leave ungrouped" />
                      {layersLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px' }}>
                          <div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${T.container}`, borderTopColor: T.ink, animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ fontSize: 12, color: T.muted }}>Loading…</span>
                        </div>
                      ) : ungroupedLayers.length === 0 ? <div style={{ padding: '16px 20px', fontSize: 13, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif' }}>All layers are assigned to teams</div>
                        : ungroupedLayers.map(layer => <LayerRow key={layer.id} {...rowProps(layer)} onAssign={() => setAssignModal({ layerId: layer.id, layerName: layer.name })} />)}
                      <div style={{ padding: '8px 20px 12px' }}>
                        <button onClick={loadLayers} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: T.muted, padding: 3, borderRadius: 4, fontFamily: 'Inter,system-ui,sans-serif', transition: 'color 0.1s' }} onMouseEnter={e => e.currentTarget.style.color = T.ink} onMouseLeave={e => e.currentTarget.style.color = T.muted}><IconRefresh size={11} /> Refresh</button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {active === 'buffers' && (
              <div className="fi">
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: 21, fontWeight: 700, color: T.ink, letterSpacing: '-0.03em' }}>Buffer Circles</h1>
                  <p style={{ fontSize: 13, color: T.muted, marginTop: 5, lineHeight: 1.6 }}>Generate geodesic buffer zones — stored separately from boundary layers</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                  <Card>
                    <CardHeader title="Generate Buffers" />
                    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <DZ file={csvFile} label="Drop .csv here" hint="Name, Latitude, Longitude" accept=".csv" id="csv-buf" onSel={f => { setCsvFile(f); Papa.parse(f, { header: true, skipEmptyLines: true, complete: r => setPrev2((r.data as Record<string, string>[]).slice(0, 10)) }) }} />
                      {prev2.length > 0 && <PrevTable data={prev2} cols={['Name', 'Latitude', 'Longitude']} />}
                      <div>
                        <FL>Radius</FL>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <FI type="number" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: 90 }} />
                          <select value={unit} onChange={e => setUnit(e.target.value as 'm' | 'km')} style={{ height: 42, padding: '0 12px', borderRadius: 8, background: T.card, border: `1.5px solid ${T.border}`, fontSize: 13.5, color: T.ink, cursor: 'pointer' }}>
                            <option value="m">Meters</option>
                            <option value="km">Km</option>
                          </select>
                        </div>
                      </div>
                      <div><FL>Buffer colour</FL><Swatches value={bufColor} onChange={setBufColor} /></div>
                      <Toggle on={bufLocked} onToggle={() => setBufLocked(v => !v)} label="Lock layer" hint="Field users can't hide locked layers" />
                      <Btn onClick={handleGenerateBuffers} disabled={!csvFile || !radius}><IconBufferZone size={14} /> Generate Buffers</Btn>
                      <StatusMsg s={bufStatus} />
                    </div>
                  </Card>
                  <Card>
                    <CardHeader title={`Buffer Layers (${bufferLayers.length})`} sub="Click the colour dot to recolor, pencil to rename" />
                    {layersLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px' }}>
                        <div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${T.container}`, borderTopColor: T.ink, animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: 12, color: T.muted }}>Loading…</span>
                      </div>
                    ) : bufferLayers.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: T.muted, fontFamily: 'Inter,system-ui,sans-serif' }}>No buffer layers yet</div>
                    ) : bufferLayers.map(layer => (
                      <LayerRow key={layer.id} {...bufRowProps(layer)} />
                    ))}
                  </Card>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}