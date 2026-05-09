// src/lib/fraudService.ts
// Fetches fraud checks from the fraud_checks Supabase table.
// Same pattern as customerService.ts — paginated fetch, same client.

import { supabase } from './supabase'
import { FraudCheck, LUSAKA_COORDS } from '../types/sentry'

export async function getFraudChecks(): Promise<FraudCheck[]> {
    const PAGE = 1000
    const all: FraudCheck[] = []
    let from = 0

    while (true) {
        const { data, error } = await supabase
            .from('fraud_checks')
            .select('*')
            .order('checked_at', { ascending: false })
            .range(from, from + PAGE - 1)

        if (error) throw error

        const resolved = (data ?? []).map(row => {
            const coords = LUSAKA_COORDS[row.agent_location] ?? LUSAKA_COORDS['Unknown']
            // Add a small random offset so stacked markers from the same area spread out
            const jitter = () => (Math.random() - 0.5) * 0.012
            return {
                ...row,
                latitude: coords.lat + jitter(),
                longitude: coords.lng + jitter(),
            } as FraudCheck
        })

        all.push(...resolved)
        if ((data?.length ?? 0) < PAGE) break
        from += PAGE
    }

    return all
}

// Fetch only flagged checks (CAUTION + STOP) for the map overlay
export async function getFlaggedChecks(): Promise<FraudCheck[]> {
    const { data, error } = await supabase
        .from('fraud_checks')
        .select('*')
        .in('verdict', ['CAUTION', 'STOP'])
        .order('checked_at', { ascending: false })
        .limit(200)

    if (error) throw error

    return (data ?? []).map(row => {
        const coords = LUSAKA_COORDS[row.agent_location] ?? LUSAKA_COORDS['Unknown']
        const jitter = () => (Math.random() - 0.5) * 0.012
        return {
            ...row,
            latitude: coords.lat + jitter(),
            longitude: coords.lng + jitter(),
        } as FraudCheck
    })
}