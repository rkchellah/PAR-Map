// src/lib/fraudService.ts
// Fetches fraud checks from the fraud_checks Supabase table.
// Same pattern as customerService.ts — paginated fetch, same client.

import { supabase } from './supabase'
import { FraudCheck, BoothLocation } from '../types/sentry'

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
        all.push(...((data ?? []) as FraudCheck[]))
        if ((data?.length ?? 0) < PAGE) break
        from += PAGE
    }

    return all
}

export async function getFlaggedChecks(): Promise<FraudCheck[]> {
    const { data, error } = await supabase
        .from('fraud_checks')
        .select('*')
        .in('verdict', ['CAUTION', 'STOP'])
        .order('checked_at', { ascending: false })
        .limit(200)

    if (error) throw error
    return (data ?? []) as FraudCheck[]
}

export async function getBoothLocations(): Promise<BoothLocation[]> {
    const { data, error } = await supabase
        .from('booth_locations')
        .select('name, latitude, longitude')
        .order('name')
    if (error) {
        console.error('Supabase error fetching booth_locations:', error)
        throw error
    }
    return (data ?? []) as BoothLocation[]
}