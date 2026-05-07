import { FraudCheck } from '../types/sentry'

export async function generateNarration(check: FraudCheck): Promise<string> {
    const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            verdict: check.verdict,
            score: check.score,
            signals: check.signals,
            sim_swapped: check.sim_swapped,
            device_swapped: check.device_swapped,
            device_roaming: check.device_roaming,
            device_connectivity: check.device_connectivity,
            agent_location: check.agent_location,
        }),
    })
    if (!res.ok) throw new Error(`narrate: ${res.status}`)
    const { narration } = await res.json()
    return narration as string
}
