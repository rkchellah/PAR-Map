import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin'

const BATCH = 500

const CUSTOMER_COLUMNS = [
  'customer',
  'contract_reference',
  'area',
  'par_status',
  'par_category',
  'arrears_total_days',
  'last_purchase_date',
  'days_since_last_purchase',
  'contact_number',
  'alt_contact_number',
  'is_priority_visit',
  'latitude',
  'longitude',
] as const

type CustomerDbRow = Record<(typeof CUSTOMER_COLUMNS)[number], string | number | boolean | null>

async function requireAdmin(req: NextApiRequest) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Not authenticated')

  const admin = getSupabaseAdmin()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) throw new Error('Not authenticated')

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') throw new Error('Admin access required')
  return admin
}

function toCustomerDbRow(row: Record<string, unknown>): CustomerDbRow {
  const last = typeof row.last_purchase_date === 'string' && row.last_purchase_date.trim()
    ? row.last_purchase_date.trim()
    : null

  return {
    customer: String(row.customer ?? row.name ?? ''),
    contract_reference: String(row.contract_reference ?? row.contract_ref ?? ''),
    area: String(row.area ?? ''),
    par_status: String(row.par_status ?? ''),
    par_category: String(row.par_category ?? ''),
    arrears_total_days: Number(row.arrears_total_days) || 0,
    last_purchase_date: last,
    days_since_last_purchase: Number(row.days_since_last_purchase) || 0,
    contact_number: String(row.contact_number ?? row.phone ?? ''),
    alt_contact_number: String(row.alt_contact_number ?? row.phone2 ?? ''),
    is_priority_visit: Boolean(row.is_priority_visit),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }
}

async function deleteAllCustomers(admin: ReturnType<typeof getSupabaseAdmin>) {
  for (let i = 0; i < 200; i++) {
    const { data, error } = await admin.from('customers').select('id').limit(BATCH)
    if (error) throw new Error(error.message)
    if (!data?.length) return
    const { error: delErr } = await admin.from('customers').delete().in('id', data.map((row) => row.id as string))
    if (delErr) throw new Error(delErr.message)
  }
  throw new Error('Delete stopped after too many batches')
}

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const admin = await requireAdmin(req)
    const incoming = Array.isArray(req.body?.rows) ? req.body.rows as Record<string, unknown>[] : []
    const rows = incoming.map(toCustomerDbRow)

    await deleteAllCustomers(admin)

    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH)
      const { error } = await admin.from('customers').insert(chunk)
      if (error) throw new Error(`Insert failed at row ${i}: ${error.message}`)
    }

    return res.status(200).json({ ok: true, inserted: rows.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Sync failed'
    const status = message === 'Not authenticated' ? 401
      : message === 'Admin access required' ? 403
      : 500
    return res.status(status).json({ error: message })
  }
}
