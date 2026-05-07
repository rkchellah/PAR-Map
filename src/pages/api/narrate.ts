import type { NextApiRequest, NextApiResponse } from 'next'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const SYSTEM = `You are a mobile money fraud analyst in Lusaka, Zambia. \
Explain a fraud check verdict in clear, plain English. \
Speak directly as the analyst using first person ("I"). \
Reference the specific signals that drove the verdict. \
Keep it to 2–3 sentences. Do not use bullet points or headers. \
Always start with the verdict word (SAFE, CAUTION, or STOP) followed by a colon.`

function buildPrompt(body: Record<string, unknown>): string {
    const signals = (body.signals as string[] | undefined ?? []).join(', ') || 'none'
    return [
        `Verdict: ${body.verdict}`,
        `Score: ${body.score}/100`,
        `Signals: ${signals}`,
        `SIM swapped recently: ${body.sim_swapped}`,
        `Device swapped recently: ${body.device_swapped}`,
        `Device roaming: ${body.device_roaming}`,
        `Connectivity: ${body.device_connectivity}`,
        `Agent location: ${body.agent_location}`,
    ].join('\n')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set' })

    const groqRes = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM },
                { role: 'user', content: buildPrompt(req.body) },
            ],
            max_tokens: 120,
            temperature: 0.4,
        }),
    })

    if (!groqRes.ok) {
        const err = await groqRes.text()
        return res.status(502).json({ error: err })
    }

    const data = await groqRes.json()
    const narration: string = data.choices?.[0]?.message?.content?.trim() ?? ''
    res.status(200).json({ narration })
}
