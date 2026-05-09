// src/pages/sentry.tsx
// MoMo Sentry fraud map page.
//
// Same layout, same design tokens, same Map component as index.tsx.
// Only the data source and sidebar labels change.
// SUPAMOTO → MOMO SENTRY
// PAR statuses → SAFE / CAUTION / STOP
// customers → fraud checks

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'

import { FraudCheck, FraudStats, computeFraudStats, VERDICT_COLORS, VERDICT_TO_PAR, LUSAKA_COORDS } from '../types/sentry'
import { FraudPopupCard } from '../components/FraudPopupCard'
import { getFraudChecks } from '../lib/fraudService'
import { useAuth } from '../lib/useAuth'
import { NavLogo, IconAdmin } from '../components/NavIcons'
import {
    IconZoomOut, IconZoomIn, IconBarChart, IconSliders,
    IconMap, IconPin, IconLayers,
    IconChevronUp, IconChevronDown, IconClose,
} from '../components/icons'

// Same Map component — fraud checks are converted to Customer shape below
const MapComponent = dynamic(() => import('../components/Map'), { ssr: false })

// Same design tokens as index.tsx — no UI changes
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

const MAP_STYLES = [
    { id: 'light', label: 'Light', style: 'mapbox/light-v11' },
    { id: 'streets', label: 'Streets', style: 'mapbox/streets-v12' },
    { id: 'outdoors', label: 'Outdoors', style: 'mapbox/outdoors-v12' },
    { id: 'dark', label: 'Dark', style: 'mapbox/dark-v11' },
    { id: 'night', label: 'Night', style: 'mapbox/navigation-night-v1' },
    { id: 'satellite', label: 'Satellite', style: 'mapbox/satellite-streets-v12' },
]

const LOCATIONS = [
    'Cairo Road Shoprite', 'City Market', 'Down Town Lusaka', 'Mtendere Market',
    'Lumumba Road', 'Town Centre Lusaka', 'Chilenje Market', 'Kalingalinga',
    'Chibolya', 'Kanyama', 'Other'
]

// Convert FraudCheck to Customer shape so the existing Map component
// renders markers without any modifications.
// Verdict maps to par_status so PAR_COLORS picks the right colour.
function toCustomer(check: FraudCheck) {
    return {
        contract_ref: check.id,
        name: check.narration,
        phone: check.phone_number,
        phone2: '',
        area: check.agent_location,
        par_status: VERDICT_TO_PAR[check.verdict],
        lead_generate: '',
        lead_generate_name: '',
        latitude: check.latitude,
        longitude: check.longitude,
    }
}

export default function SentryPage() {
    const { isAdmin } = useAuth()

    const [checks, setChecks] = useState<FraudCheck[]>([])
    const [loading, setLoading] = useState(true)
    const [verdictFilter, setVerdictFilter] = useState<string>('')
    const [mapStyle, setMapStyle] = useState('mapbox/streets-v12')
    const [section, setSection] = useState<'overview' | 'filters' | 'theme' | null>('overview')
    const [zoom, setZoom] = useState(13)
    const [pinned, setPinned] = useState(true)
    const [hovered, setHovered] = useState(false)
    const hoverRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [checkPhone, setCheckPhone] = useState('')
    const [checkLocation, setCheckLocation] = useState(LOCATIONS[0])
    const [checking, setChecking] = useState(false)

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!checkPhone || checking) return
        setChecking(true)
        try {
            const apiBase = process.env.NEXT_PUBLIC_MOMO_SENTRY_API ?? "https://momo-sentry-production.up.railway.app"
            const res = await fetch(`${apiBase}/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: checkPhone, location: checkLocation })
            })
            if (!res.ok) throw new Error('Check failed')
            const raw = await res.json()

            // Ensure the location matches what the user selected if backend didn't specify
            const loc = raw.agent_location || checkLocation
            const coords = LUSAKA_COORDS[loc] ?? LUSAKA_COORDS['Unknown']
            const jitter = () => (Math.random() - 0.5) * 0.012
            const newCheck: FraudCheck = {
                ...raw,
                agent_location: loc,
                latitude: coords.lat + jitter(),
                longitude: coords.lng + jitter()
            }

            setChecks(prev => [newCheck, ...prev])
            setCheckPhone('')
        } catch (err) {
            console.error(err)
            alert('Failed to perform fraud check')
        } finally {
            setChecking(false)
        }
    }

    // Auto-refresh every 30 seconds
    useEffect(() => {
        let isFirst = true
        const load = () => {
            if (isFirst) setLoading(true)
            getFraudChecks()
                .then(data => {
                    // Update checks, but keep local-only checks if they haven't synced yet
                    setChecks(prev => {
                        const existingIds = new Set(data.map(c => c.id))
                        const localOnly = prev.filter(c => !existingIds.has(c.id) && (Date.now() - new Date(c.checked_at).getTime() < 60_000))
                        return [...localOnly, ...data]
                    })
                })
                .catch(console.error)
                .finally(() => {
                    setLoading(false)
                    isFirst = false
                })
        }
        load()
        const interval = setInterval(load, 30_000)
        return () => clearInterval(interval)
    }, [])

    // Persist map style
    useEffect(() => {
        try { const s = localStorage.getItem('sentry:mapStyle'); if (s) setMapStyle(s) } catch { }
    }, [])
    useEffect(() => {
        try { localStorage.setItem('sentry:mapStyle', mapStyle) } catch { }
    }, [mapStyle])

    const filtered = useMemo(() => {
        let r = checks
        if (verdictFilter) r = r.filter(c => c.verdict === verdictFilter)
        return r.filter(c =>
            typeof c.latitude === 'number' && !isNaN(c.latitude) &&
            typeof c.longitude === 'number' && !isNaN(c.longitude)
        )
    }, [checks, verdictFilter])

    const stats: FraudStats = useMemo(() => computeFraudStats(filtered), [filtered])
    const customers = useMemo(() => filtered.map(toCustomer), [filtered])
    const checksById = useMemo(() => {
        const map = new Map<string, FraudCheck>()
        filtered.forEach(c => map.set(c.id, c))
        return map
    }, [filtered])
    const panelVisible = pinned || hovered

    const onPanelEnter = () => { if (hoverRef.current) clearTimeout(hoverRef.current); setHovered(true) }
    const onPanelLeave = () => { if (!pinned) hoverRef.current = setTimeout(() => setHovered(false), 200) }
    const onStripEnter = () => { if (!pinned) { if (hoverRef.current) clearTimeout(hoverRef.current); setHovered(true) } }

    return (
        <>
            <Head>
                <title>MoMo Sentry</title>
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
          .leaflet-popup-close-button{top:14px!important;right:14px!important;color:${T.muted}!important;font-size:16px!important;font-weight:300!important;}
          .leaflet-popup-close-button:hover{color:#111!important;background:none!important;}
          @keyframes spin{to{transform:rotate(360deg);}}
          @keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
        `}</style>
            </Head>

            {/* MAP */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                <MapComponent
                    customers={customers}
                    kmzLayers={[]}
                    onKMZDrop={() => { }}
                    mapStyle={mapStyle}
                    focusedCustomer={null}
                    onZoomChange={setZoom}
                    showBoundaries={false}
                    showBufferPins={false}
                    renderPopup={(customer) => {
                        const check = checksById.get(customer.contract_ref)
                        if (!check) return <div style={{ padding: 16 }}>{customer.phone}</div>
                        return <FraudPopupCard check={check} narration={check.narration || undefined} />
                    }}
                />
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
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, minHeight: 52, zIndex: 1000, background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.ghost}`, display: 'flex', alignItems: 'center', padding: '8px 20px', gap: 16 }}>
                <NavLogo />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleCheck} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input value={checkPhone} onChange={e => setCheckPhone(e.target.value)}
                            placeholder="Phone number"
                            required
                            style={{ width: 150, height: 34, background: T.low, border: 'none', borderRadius: 9, padding: '0 12px', fontSize: 12, outline: 'none', fontFamily: 'Manrope' }} />
                        <select value={checkLocation} onChange={e => setCheckLocation(e.target.value)}
                            style={{ height: 34, background: T.low, border: 'none', borderRadius: 9, padding: '0 10px', fontSize: 12, outline: 'none', fontFamily: 'Manrope', cursor: 'pointer' }}>
                            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <button type="submit" disabled={checking}
                            style={{ height: 34, padding: '0 16px', background: T.primary, color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: checking ? 0.6 : 1, boxShadow: '0 2px 8px rgba(74,75,215,0.25)', transition: 'opacity 0.15s' }}>
                            {checking ? 'Checking…' : 'Check'}
                        </button>
                    </form>
                </div>
                <div style={{ width: 200, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                    <div style={{ fontFamily: 'DM Mono', fontSize: 10.5, color: T.onSurface, fontWeight: 600 }}>{filtered.length.toLocaleString()} Checks</div>
                    <div style={{ width: 1, height: 20, background: T.ghost }} />
                    <button
                        onClick={() => window.location.href = isAdmin ? '/admin' : '/login'}
                        title={isAdmin ? 'Admin Dashboard' : 'Sign in'}
                        style={{ width: 'auto', height: 'auto', background: 'none', backgroundColor: 'transparent', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAdmin ? '#111111' : T.muted, transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#111111' }}
                        onMouseLeave={e => { e.currentTarget.style.color = isAdmin ? '#111111' : T.muted }}>
                        <IconAdmin />
                    </button>
                </div>
            </nav>

            {!pinned && !hovered && <div onMouseEnter={onStripEnter} style={{ position: 'fixed', left: 0, top: 52, bottom: 0, width: 14, zIndex: 900, cursor: 'e-resize' }} />}

            {/* SIDE PANEL */}
            <aside onMouseEnter={onPanelEnter} onMouseLeave={onPanelLeave} style={{ position: 'fixed', left: 0, top: 52, bottom: 0, width: 268, zIndex: 900, background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', transform: panelVisible ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)', boxShadow: !pinned ? '8px 0 40px rgba(45,51,53,0.10)' : 'none' }}>

                {/* Panel header */}
                <div style={{ height: 50, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: T.onSurface }}>MOMO SENTRY</div>
                    <button onClick={() => { setPinned(v => !v); if (pinned) setHovered(false) }} style={{ width: 'auto', height: 'auto', background: 'none', backgroundColor: 'transparent', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pinned ? '#111111' : T.muted, transition: 'all 0.15s' }}>
                        {pinned ? <IconPin size={16} /> : <IconLayers size={16} />}
                    </button>
                </div>
                <div style={{ height: 1, background: T.ghost, margin: '0 16px', flexShrink: 0 }} />

                <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 16px' }}>

                    {/* Overview section */}
                    <SB icon={<IconBarChart size={16} />} label="Overview" open={section === 'overview'} onToggle={() => setSection(s => s === 'overview' ? null : 'overview')} />
                    {section === 'overview' && (
                        <div style={{ padding: '8px 16px 14px' }}>
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: T.low, marginBottom: 14 }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>
                                    {loading ? 'Loading…' : 'Showing'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span style={{ fontFamily: 'DM Mono', fontSize: 22, color: T.onSurface, letterSpacing: '-0.02em' }}>{filtered.length.toLocaleString()}</span>
                                    <span style={{ fontSize: 11, color: T.muted }}>of {checks.length.toLocaleString()}</span>
                                </div>
                            </div>

                            {([
                                ['SAFE', stats.safe, '#22c55e', '#16a34a'],
                                ['CAUTION', stats.caution, '#f59e0b', '#d97706'],
                                ['STOP', stats.stop, '#ef4444', '#dc2626'],
                            ] as [string, number, string, string][]).map(([label, count, dot, bar]) => {
                                const pct = filtered.length > 0 ? (count / filtered.length) * 100 : 0
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

                    {/* Filter section */}
                    <SB icon={<IconSliders size={16} />} label="Filter Verdict" open={section === 'filters'} onToggle={() => setSection(s => s === 'filters' ? null : 'filters')} />
                    {section === 'filters' && (
                        <div style={{ padding: '6px 12px 12px' }}>
                            {[
                                { label: 'All checks', value: '', count: checks.length, color: T.high },
                                { label: 'SAFE', value: 'SAFE', count: stats.safe, color: '#22c55e' },
                                { label: 'CAUTION', value: 'CAUTION', count: stats.caution, color: '#f59e0b' },
                                { label: 'STOP', value: 'STOP', count: stats.stop, color: '#ef4444' },
                            ].map(item => {
                                const active = verdictFilter === item.value
                                return (
                                    <button key={item.value} onClick={() => setVerdictFilter(item.value)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: active ? T.card : 'transparent', border: 'none', boxShadow: active ? T.shadowSm : 'none', transition: 'all 0.12s', textAlign: 'left' }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.low }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: item.color }} />
                                            <span style={{ fontSize: 12, color: active ? T.onSurface : T.variant, fontWeight: active ? 600 : 400 }}>{item.label}</span>
                                        </div>
                                        <span style={{ fontFamily: 'DM Mono', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: T.low, color: T.muted }}>{item.count.toLocaleString()}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Map theme section */}
                    <SB icon={<IconMap size={16} />} label="Map Theme" open={section === 'theme'} onToggle={() => setSection(s => s === 'theme' ? null : 'theme')} />
                    {section === 'theme' && (
                        <div style={{ padding: '6px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                            {MAP_STYLES.map(s => {
                                const active = mapStyle === s.style
                                return (
                                    <button key={s.id} onClick={() => setMapStyle(s.style)}
                                        style={{ height: 38, borderRadius: 8, border: 'none', background: active ? '#111111' : T.low, color: active ? '#ffffff' : T.variant, fontSize: 11, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'Manrope', boxShadow: active ? '0 0 0 1.5px rgba(0,0,0,0.15)' : 'none' }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.container }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = T.low }}>
                                        {s.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Panel footer */}
                <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 9.5, color: T.muted, letterSpacing: '0.02em' }}>MoMo Sentry · Lusaka</span>
                    {verdictFilter && (
                        <button onClick={() => setVerdictFilter('')}
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