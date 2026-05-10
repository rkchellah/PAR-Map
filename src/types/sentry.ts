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
    latitude?: number
    longitude?: number
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

export interface BoothLocation {
  name: string
  latitude: number
  longitude: number
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