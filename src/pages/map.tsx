// ─── src/pages/index.tsx ─────────────────────────────────────────────────────
// Only change from the hydration-fixed version:
//   - Removed handleAuthSubmit / authPwd / authErr / authLoading state
//   - Replaced sessionStorage admin check with useAuth()
//   - Admin button → /login if not logged in, /admin if admin
//   - Removed the inline auth modal entirely (now a real /login page)

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { KMZLayer, PAR_COLORS, computeStats } from '../types/par'
import { parseKmz } from '../utils/kmzParser'
import { fetchLayers, toggleLayerVisibility } from '../lib/layerService'
import { getCustomers } from '../lib/customerService'
import { useAuth } from '../lib/useAuth'
import { NavLogo, IconAdmin, IconSearch, IconX } from '../components/NavIcons'
import {
  IconZoomOut, IconZoomIn, IconBarChart, IconSliders,
  IconLayers, IconLock, IconEye, IconEyeOff, IconMap, IconPin,
  IconChevronUp, IconChevronDown, IconClose, IconUsers
} from '../components/icons'

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false })

const T = {
  canvas: '#f8f9fa',
  low: '#f1f4f5',
  container: '#ebeef0',
  card: '#ffffff',
  high: '#dee3e6',
  primary: '#4a4bd7',
  primaryDim: 'rgba(74,75,215,0.08)',
  primaryRing: 'rgba(74,75,215,0.22)',
  primaryMid: '#7073ff',
  onSurface: '#2d3335',
  variant: '#41484d',
  muted: '#8a9199',
  ghost: 'rgba(173,179,181,0.18)',
  error: '#a8364b',
  errorDim: 'rgba(168,54,75,0.08)',
  shadow: '0 4px 20px rgba(45,51,53,0.05), 0 12px 40px rgba(45,51,53,0.08)',
  shadowSm: '0 2px 8px rgba(45,51,53,0.06), 0 4px 16px rgba(45,51,53,0.06)',
} as const

const PAR_BADGE: Record<string, { bg: string; text: string }> = {
  'ONTIME':    { bg: 'rgba(22,163,74,0.10)',   text: '#16a34a' },
  'PAR 1-30':  { bg: 'rgba(101,163,13,0.10)',  text: '#65a30d' },
  'PAR 31-60': { bg: 'rgba(217,119,6,0.10)',   text: '#d97706' },
  'PAR 61-90': { bg: 'rgba(234,88,12,0.10)',   text: '#ea580c' },
  'PAR 90+':   { bg: 'rgba(220,38,38,0.10)',   text: '#dc2626' },
}

const MAP_STYLES = [
  { id: 'light',     label: 'Light',     style: 'mapbox/light-v11' },
  { id: 'streets',   label: 'Streets',   style: 'mapbox/streets-v12' },
  { id: 'outdoors',  label: 'Outdoors',  style: 'mapbox/outdoors-v12' },
  { id: 'dark',      label: 'Dark',      style: 'mapbox/dark-v11' },
  { id: 'night',     label: 'Night',     style: 'mapbox/navigation-night-v1' },
  { id: 'satellite', label: 'Satellite', style: 'mapbox/satellite-streets-v12' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res((r.result as string).split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })
}
function base64ToFile(b64: string, name: string): File {
  try { return new File([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], name, { type: 'application/vnd.google-earth.kmz' }) }
  catch { return new File([], name) }
}
type StoredLayer = { id: string; name: string; color: string; visible: boolean; b64: string }

export default function MapPage() {
  const { isAdmin } = useAuth()

  const [kmzLayers, setKmzLayers] = useState<KMZLayer[]>([])
  const [layersLoading, setLayersLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Safe SSR defaults — hydrated in useEffect below
  const [parFilter, setParFilter]     = useState<string>('')
  const [mapStyle, setMapStyle]       = useState<string>('mapbox/streets-v12')
  const [section, setSection]         = useState<'portfolio' | 'filters' | 'layers' | 'teams' | 'theme' | null>('portfolio')
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true)

  const [zoom, setZoom]     = useState(13)
  const [pinned, setPinned] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [teams, setTeams]   = useState<{ id: string; name: string; color: string; layerIds: string[] }[]>([])
  const hoverRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [customers, setCustomers]   = useState<any[]>([])
  const [weekLabel, setWeekLabel]   = useState('')

  useEffect(() => {
    getCustomers().then(data => {
      setCustomers(data)
      if (data[0]?.week_label) setWeekLabel(data[0].week_label)
    }).catch(console.error)
  }, [])

  // Hydrate localStorage state client-side (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const savedParFilter  = localStorage.getItem('par-map:parFilter')
      const savedMapStyle   = localStorage.getItem('par-map:mapStyle')
      const savedSection    = localStorage.getItem('par-map:section')
      const savedBoundaries = localStorage.getItem('par-map:showBoundaries')
      if (savedParFilter  !== null) setParFilter(savedParFilter)
      if (savedMapStyle   !== null) setMapStyle(savedMapStyle)
      if (savedSection    !== null) setSection((savedSection as any) || 'portfolio')
      if (savedBoundaries !== null) setShowBoundaries(savedBoundaries === 'true')
    } catch {}
  }, [])

  const filteredCustomers = useMemo<any[]>(() => {
    const q = search.toLowerCase()
    let r = customers
    if (q) r = r.filter((c: any) =>
      (c.contract_ref ?? '').toLowerCase().includes(q) ||
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.phone2 ?? '').toLowerCase().includes(q))
    if (parFilter) r = r.filter((c: any) => c.par_status === parFilter)
    return r.filter((c: any) => c.latitude >= -90 && c.latitude <= 90 && c.longitude >= -180 && c.longitude <= 180 && !(c.latitude === 0 && c.longitude === 0))
  }, [customers, search, parFilter])

  const stats   = useMemo(() => computeStats(filteredCustomers), [filteredCustomers])
  const focused = search.trim() && filteredCustomers.length === 1 ? filteredCustomers[0] : null
  const panelVisible = pinned || hovered

  useEffect(() => {
    ;(async () => {
      setLayersLoading(true)
      try {
        const sb = await fetchLayers()
        const stored = localStorage.getItem('par-map:kmz-layers')
        let local: KMZLayer[] = []
        if (stored) {
          const parsed = JSON.parse(stored) as StoredLayer[]
          local = await Promise.all(parsed.filter(l => l.b64).map(async l => ({
            id: l.id, name: l.name, color: l.color, visible: l.visible,
            geojson: await parseKmz(base64ToFile(l.b64, l.name + '.kmz')),
          })))
        }
        setKmzLayers([...sb, ...local])
        try { const t = localStorage.getItem('par-map:teams'); setTeams(t ? JSON.parse(t) : []) }
        catch { setTeams([]) }
      } catch (e) { console.error(e) } finally { setLayersLoading(false) }
    })()
  }, [])

  // Persist UI state
  useEffect(() => { try { localStorage.setItem('par-map:mapStyle',       mapStyle)           } catch {} }, [mapStyle])
  useEffect(() => { try { localStorage.setItem('par-map:section',        section ?? '')       } catch {} }, [section])
  useEffect(() => { try { localStorage.setItem('par-map:parFilter',      parFilter)           } catch {} }, [parFilter])
  useEffect(() => { try { localStorage.setItem('par-map:showBoundaries', String(showBoundaries)) } catch {} }, [showBoundaries])

  const saveLocal = useCallback((layers: KMZLayer[], b64Map: Record<string, string>) => {
    try {
      const ex: StoredLayer[] = JSON.parse(localStorage.getItem('par-map:kmz-layers') ?? '[]')
      const exB64 = Object.fromEntries(ex.map(l => [l.id, l.b64]))
      localStorage.setItem('par-map:kmz-layers', JSON.stringify(
        layers.filter(l => b64Map[l.id] || exB64[l.id]).map(l => ({ id: l.id, name: l.name, color: l.color, visible: l.visible, b64: b64Map[l.id] || exB64[l.id] || '' }))
      ))
    } catch {}
  }, [])

  const handleKMZDrop = useCallback(async (file: File) => {
    try {
      const [geojson, b64] = await Promise.all([parseKmz(file), fileToBase64(file)])
      const layer: KMZLayer = { id: crypto.randomUUID(), name: file.name.replace(/\.kmz$/i, ''), color: T.primary, visible: true, geojson }
      setKmzLayers(prev => { const next = [...prev, layer]; saveLocal(next, { [layer.id]: b64 }); return next })
    } catch (e) { console.error(e) }
  }, [saveLocal])

  const handleToggle = useCallback(async (layer: KMZLayer) => {
    const next = !layer.visible
    setKmzLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: next } : l))
    if (layer.locked !== undefined) {
      try { await toggleLayerVisibility(layer.id, next) }
      catch { setKmzLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: layer.visible } : l)) }
    } else { saveLocal(kmzLayers.map(l => l.id === layer.id ? { ...l, visible: next } : l), {}) }
  }, [kmzLayers, saveLocal])

  const onPanelEnter = () => { if (hoverRef.current) clearTimeout(hoverRef.current); setHovered(true) }
  const onPanelLeave = () => { if (!pinned) hoverRef.current = setTimeout(() => setHovered(false), 200) }
  const onStripEnter = () => { if (!pinned) { if (hoverRef.current) clearTimeout(hoverRef.current); setHovered(true) } }

  return (
    <>
      <Head>
        <title>Supamoto Map</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0;}
          body{overflow:hidden;background:${T.canvas};font-family:'Manrope',sans-serif;-webkit-font-smoothing:antialiased;}
          ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}
          ::-webkit-scrollbar-thumb{background:${T.container};border-radius:4px;}
          ::-webkit-scrollbar-thumb:hover{background:${T.high};}
          .leaflet-control-zoom{display:none!important;}
          .leaflet-interactive{outline:none!important;}
          path.leaflet-interactive{outline:none!important;cursor:default!important;}
          .par-popup .leaflet-popup-content-wrapper{background:#fff!important;border-radius:14px!important;box-shadow:0 4px 20px rgba(45,51,53,0.06),0 12px 40px rgba(45,51,53,0.10)!important;padding:0!important;overflow:hidden!important;width:280px!important;border:none!important;}
          .leaflet-popup{margin-bottom:35px!important;z-index:1000!important;}
          .par-popup .leaflet-popup-content{margin:0!important;width:280px!important;min-height:100px;line-height:inherit!important;display:block!important;}
          .par-popup .leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none;background:none;}
          @keyframes spin{to{transform:rotate(360deg);}}
        `}</style>
      </Head>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <MapComponent customers={filteredCustomers} kmzLayers={kmzLayers} onKMZDrop={handleKMZDrop} mapStyle={mapStyle} focusedCustomer={focused} onZoomChange={setZoom} showBoundaries={showBoundaries} />
      </div>

      {/* ZOOM PILL */}
      <div style={{ position: 'fixed', right: 16, bottom: 28, zIndex: 800, background: T.card, borderRadius: 22, boxShadow: T.shadowSm, display: 'flex', alignItems: 'center', height: 34, overflow: 'hidden' }}>
        <button onClick={() => (document.querySelector('.leaflet-control-zoom-out') as HTMLElement)?.click()} style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.variant, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = 'none'}><IconZoomOut size={16} /></button>
        <div style={{ width: 1, height: 16, background: T.ghost }} />
        <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: T.muted, padding: '0 12px', userSelect: 'none' }}>z{zoom}</div>
        <div style={{ width: 1, height: 16, background: T.ghost }} />
        <button onClick={() => (document.querySelector('.leaflet-control-zoom-in') as HTMLElement)?.click()} style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.variant, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = T.low} onMouseLeave={e => e.currentTarget.style.background = 'none'}><IconZoomIn size={16} /></button>
      </div>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 1000, background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.ghost}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <NavLogo />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', maxWidth: 460, height: 34, background: T.low, borderRadius: 9, padding: '0 14px', cursor: 'text', transition: 'box-shadow 0.15s' }}
            onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${T.primaryRing}`} onBlur={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ color: T.muted }}><IconSearch /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contract reference, name or phone number…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: T.onSurface, fontFamily: 'Manrope' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 0, display: 'flex' }}><IconX size={11} /></button>}
          </label>
        </div>
        <div style={{ width: 200, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <div style={{ fontFamily: 'DM Mono', fontSize: 10.5, color: T.onSurface, fontWeight: 600 }}>{filteredCustomers.length.toLocaleString()} Customers</div>
          <div style={{ width: 1, height: 20, background: T.ghost }} />
          {/* Admin button — goes to /login or /admin depending on auth state */}
          <button
            onClick={() => window.location.href = isAdmin ? '/admin' : '/login'}
            title={isAdmin ? 'Admin Dashboard' : 'Sign in'}
            style={{ width: 'auto', height: 'auto', background: 'none', backgroundColor: 'transparent', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAdmin ? '#111111' : T.muted, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#111111' }}
            onMouseLeave={e => { e.currentTarget.style.color = isAdmin ? '#111111' : T.muted }}
          >
            <IconAdmin />
          </button>
        </div>
      </nav>

      {!pinned && !hovered && <div onMouseEnter={onStripEnter} style={{ position: 'fixed', left: 0, top: 52, bottom: 0, width: 14, zIndex: 900, cursor: 'e-resize' }} />}

      {/* SIDE PANEL */}
      <aside onMouseEnter={onPanelEnter} onMouseLeave={onPanelLeave} style={{ position: 'fixed', left: 0, top: 52, bottom: 0, width: 268, zIndex: 900, background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', transform: panelVisible ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)', boxShadow: !pinned ? '8px 0 40px rgba(45,51,53,0.10)' : 'none' }}>
        <div style={{ height: 50, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.onSurface }}>SUPAMOTO</div>
          <button onClick={() => { setPinned(v => !v); if (pinned) setHovered(false) }} style={{ width: 'auto', height: 'auto', background: 'none', backgroundColor: 'transparent', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pinned ? '#111111' : T.muted, transition: 'all 0.15s' }}>
            {pinned ? <IconPin size={16} /> : <IconLayers size={16} />}
          </button>
        </div>
        <div style={{ height: 1, background: T.ghost, margin: '0 16px', flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 16px' }}>
          <SB icon={<IconBarChart size={16} />} label="Portfolio" open={section === 'portfolio'} onToggle={() => setSection(s => s === 'portfolio' ? null : 'portfolio')} />
          {section === 'portfolio' && (
            <div className="sIn" style={{ padding: '8px 16px 14px' }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: T.low, marginBottom: 14 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Showing</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 22, color: T.onSurface, letterSpacing: '-0.02em' }}>{filteredCustomers.length.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>of {customers.length.toLocaleString()}</span>
                </div>
              </div>
              {([
                ['ONTIME',    stats.ontime,  '#22c55e', '#16a34a'],
                ['PAR 1-30',  stats.par30,   '#84cc16', '#65a30d'],
                ['PAR 31-60', stats.par60,   '#f59e0b', '#d97706'],
                ['PAR 61-90', stats.par90,   '#f97316', '#ea580c'],
                ['PAR 90+',   stats.par90p,  '#ef4444', '#dc2626'],
              ] as [string, number, string, string][]).map(([label, count, dot, bar]) => {
                const pct = filteredCustomers.length > 0 ? (count / filteredCustomers.length) * 100 : 0
                return (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: T.variant, fontWeight: 500 }}>{label}</span>
                      </div>
                      <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: T.onSurface }}>{count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 3, background: T.container, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: bar, borderRadius: 3, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <SB icon={<IconSliders size={16} />} label="Filter Status" open={section === 'filters'} onToggle={() => setSection(s => s === 'filters' ? null : 'filters')} />
          {section === 'filters' && (
            <div className="sIn" style={{ padding: '6px 12px 12px' }}>
              {[
                { label: 'All customers', value: '',         count: customers.length },
                { label: 'ONTIME',        value: 'ONTIME',   count: stats.ontime },
                { label: 'PAR 1-30',      value: 'PAR 1-30', count: stats.par30 },
                { label: 'PAR 31-60',     value: 'PAR 31-60',count: stats.par60 },
                { label: 'PAR 61-90',     value: 'PAR 61-90',count: stats.par90 },
                { label: 'PAR 90+',       value: 'PAR 90+',  count: stats.par90p },
              ].map(item => {
                const active = parFilter === item.value
                const badge  = PAR_BADGE[item.value] ?? { bg: T.primaryDim, text: T.primary }
                return (
                  <button key={item.value} onClick={() => setParFilter(item.value)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: active ? T.card : 'transparent', border: 'none', boxShadow: active ? T.shadowSm : 'none', transition: 'all 0.12s', textAlign: 'left' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.low }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: item.value ? (PAR_COLORS[item.value as keyof typeof PAR_COLORS] ?? T.muted) : T.high }} />
                      <span style={{ fontSize: 12, color: active ? T.onSurface : T.variant, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                    </div>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: active && item.value ? badge.bg : T.low, color: active && item.value ? badge.text : T.muted }}>{item.count.toLocaleString()}</span>
                  </button>
                )
              })}
            </div>
          )}

          <SB icon={<IconLayers size={16} />} label="Boundary Layers" open={section === 'layers'} onToggle={() => setSection(s => s === 'layers' ? null : 'layers')} />
          {section === 'layers' && (
            <div className="sIn" style={{ padding: '6px 12px 12px' }}>
              {layersLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 6px' }}>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', border: `2px solid ${T.container}`, borderTopColor: T.primary, animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: 11.5, color: T.muted }}>Syncing layers…</span>
                </div>
              ) : kmzLayers.length === 0 ? (
                <div style={{ padding: '16px 12px', borderRadius: 8, background: T.low, textAlign: 'center', fontSize: 11.5, color: T.muted, lineHeight: 1.6 }}>
                  Drop a .kmz onto the map<br /><span style={{ fontSize: 10, opacity: 0.7 }}>or upload via Admin → Boundary Layers</span>
                </div>
              ) : (() => {
                const LRow = (layer: typeof kmzLayers[0]) => (
                  <div key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, marginBottom: 3, background: T.card, boxShadow: T.shadowSm }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2.5, background: layer.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: T.variant, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{layer.name}</span>
                      {layer.locked && <IconLock size={11} color={T.muted} />}
                    </div>
                    {!layer.locked && (
                      <button onClick={() => handleToggle(layer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: layer.visible ? '#111111' : T.muted, padding: 0, display: 'flex', transition: 'color 0.12s' }}>
                        {layer.visible ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                      </button>
                    )}
                  </div>
                )
                const kmzIds = new Set(kmzLayers.map(l => l.id))
                const teamsWithLayers = teams.filter(t => t.layerIds.some(id => kmzIds.has(id)))
                const allTeamIds = new Set(teamsWithLayers.flatMap(t => t.layerIds))
                const ungrouped = kmzLayers.filter(l => !allTeamIds.has(l.id))
                if (teamsWithLayers.length === 0) return <>{kmzLayers.map(LRow)}</>
                return (
                  <>
                    {teamsWithLayers.map(team => {
                      const tLayers = kmzLayers.filter(l => team.layerIds.includes(l.id))
                      return (
                        <div key={team.id} style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 4px 5px', marginBottom: 2 }}>
                            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: team.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: T.variant, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
                          </div>
                          {tLayers.map(LRow)}
                        </div>
                      )
                    })}
                    {ungrouped.map(LRow)}
                  </>
                )
              })()}
            </div>
          )}

          <SB icon={<IconUsers size={16} />} label="Area Circle Teams" open={section === 'teams'} onToggle={() => setSection(s => s === 'teams' ? null : 'teams')} />
          {section === 'teams' && (
            <div className="sIn" style={{ padding: '6px 12px 12px' }}>
              {teams.length === 0 ? (
                <div style={{ padding: '14px 12px', borderRadius: 8, background: T.low, textAlign: 'center', fontSize: 11.5, color: T.muted, lineHeight: 1.6 }}>
                  No teams yet<br /><span style={{ fontSize: 10, opacity: 0.7 }}>Create teams via Admin → Boundary Layers</span>
                </div>
              ) : teams.map(team => {
                const count = team.layerIds.filter(id => kmzLayers.find(l => l.id === id)).length
                return (
                  <div key={team.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, marginBottom: 3, background: T.card, boxShadow: T.shadowSm }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: team.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11.5, color: T.variant, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</span>
                    </div>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: T.muted, flexShrink: 0 }}>{count} layer{count !== 1 ? 's' : ''}</span>
                  </div>
                )
              })}
            </div>
          )}

          <SB icon={<IconMap size={16} />} label="Map Theme" open={section === 'theme'} onToggle={() => setSection(s => s === 'theme' ? null : 'theme')} />
          {section === 'theme' && (
            <div className="sIn" style={{ padding: '6px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
              {MAP_STYLES.map(s => {
                const active = mapStyle === s.style
                return (
                  <button key={s.id} onClick={() => setMapStyle(s.style)}
                    style={{ height: 38, borderRadius: 8, border: 'none', background: active ? '#111111' : T.low, color: active ? '#ffffff' : T.variant, fontSize: 11, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'Manrope', boxShadow: active ? '0 0 0 1.5px rgba(0,0,0,0.15)' : 'none' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.container }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = T.low }}
                  >{s.label}</button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'DM Mono', fontSize: 9.5, color: T.muted, letterSpacing: '0.02em' }}>ECS Fintech · Lusaka</span>
          {parFilter && (
            <button onClick={() => setParFilter('')}
              style={{ fontSize: 10.5, color: T.primary, background: T.primaryDim, border: 'none', borderRadius: 5, padding: '3px 9px', cursor: 'pointer', fontFamily: 'Manrope', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 1.5px ${T.primaryRing}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <IconClose size={12} /> Clear filter
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

function SB({ icon, label, open, onToggle }: { icon: React.ReactNode; label: string; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      style={{ width: '100%', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.background = T.low}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: open ? '#111111' : T.muted }}>
        {icon}
        <span style={{ fontSize: 12, fontFamily: 'Manrope', fontWeight: open ? 700 : 500, color: open ? T.onSurface : T.variant }}>{label}</span>
      </div>
      <div style={{ color: T.muted }}>{open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</div>
    </button>
  )
}