// src/types/sentry.ts
// Types for MoMo Sentry fraud checks
import type { PARStatus } from './par'

export type Verdict = 'SAFE' | 'CAUTION' | 'STOP'

export interface FraudCheck {
    id: string
    phone_number: string
    verdict: Verdict
    score: number
    signals: string[]
    narration: string
    sim_swapped: boolean
    last_sim_change: string | null
    device_swapped: boolean
    last_device_change: string | null
    device_connectivity: string
    device_roaming: boolean
    agent_location: string
    checked_at: string
    // Resolved from agent_location via LUSAKA_COORDS lookup
    latitude: number
    longitude: number
}

export interface FraudStats {
    safe: number
    caution: number
    stop: number
    total: number
}

export function computeFraudStats(checks: FraudCheck[]): FraudStats {
    const stats: FraudStats = { safe: 0, caution: 0, stop: 0, total: checks.length }
    for (const c of checks) {
        switch (c.verdict) {
            case 'SAFE': stats.safe++; break
            case 'CAUTION': stats.caution++; break
            case 'STOP': stats.stop++; break
        }
    }
    return stats
}

// Lusaka neighbourhood coordinates
// Used to plot fraud checks on the map by agent_location name
export const LUSAKA_COORDS: Record<string, { lat: number; lng: number }> = {
    'Kanyama': { lat: -15.4167, lng: 28.2833 },
    'Matero': { lat: -15.3833, lng: 28.3000 },
    'Chilenje': { lat: -15.4333, lng: 28.3167 },
    'Chilenje Market': { lat: -15.4333, lng: 28.3167 },
    'Ngombe': { lat: -15.3667, lng: 28.3333 },
    'Kalingalinga': { lat: -15.4000, lng: 28.3500 },
    'Chawama': { lat: -15.4500, lng: 28.3000 },
    'Mandevu': { lat: -15.3833, lng: 28.2833 },
    'Kabwata': { lat: -15.4167, lng: 28.3333 },
    'Cairo Road Shoprite': { lat: -15.4170, lng: 28.2830 },
    'City Market': { lat: -15.4150, lng: 28.2760 },
    'Down Town Lusaka': { lat: -15.4210, lng: 28.2860 },
    'Mtendere Market': { lat: -15.3920, lng: 28.3410 },
    'Lumumba Road': { lat: -15.4080, lng: 28.2720 },
    'Town Centre Lusaka': { lat: -15.4185, lng: 28.2825 },
    'Chibolya': { lat: -15.4280, lng: 28.2710 },
    'Unknown': { lat: -15.4166, lng: 28.2833 },
    'Other': { lat: -15.4100, lng: 28.3100 },
}

// Verdict colours — maps directly to PAR_COLORS keys
// so the existing Map component renders them without any changes
export const VERDICT_TO_PAR: Record<Verdict, PARStatus> = {
    'SAFE': 'ONTIME',    // green
    'CAUTION': 'PAR 31-60', // amber
    'STOP': 'PAR 90+',   // deep red
}

export const VERDICT_COLORS: Record<Verdict, string> = {
    'SAFE': '#22c55e',
    'CAUTION': '#f59e0b',
    'STOP': '#ef4444',
}