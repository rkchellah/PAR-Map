import { supabase } from './supabase'
import type { Customer, PARStatus } from '../types/par'

export interface CustomerInsert {
  customer: string
  contract_reference: string
  area: string
  par_status: string
  par_category: string
  arrears_total_days: number
  last_purchase_date: string | null
  days_since_last_purchase: number
  contact_number: string
  alt_contact_number: string
  is_priority_visit: boolean
  latitude: number
  longitude: number
}

interface CustomerDbRow {
  customer?: string | null
  contract_reference?: string | null
  contact_number?: string | null
  alt_contact_number?: string | null
  area?: string | null
  par_status?: string | null
  latitude?: number | null
  longitude?: number | null
}

const HEADER_ALIASES: Record<string, string> = {
  'contract reference': 'contract_reference',
  contract_ref: 'contract_reference',
  code: 'contract_reference',
  name: 'customer',
  'par status': 'par_status',
  'par category': 'par_category',
  'last purchase date': 'last_purchase_date',
  'lead generate': 'lead_generate',
  'lead generate name': 'lead_generate_name',
  'phone 2': 'alt_contact_number',
}

const PHONE_HEADERS = new Set([
  'phone numbers',
  'phone',
  'phone2',
  'contact_number',
  'alt_contact_number',
  'phone 2',
])

export function createCsvHeaderTransformer(): (header: string) => string {
  const phoneSlot = { n: 0 }
  return (header: string) => {
    const h = header.toLowerCase().trim()
    if (PHONE_HEADERS.has(h)) {
      phoneSlot.n += 1
      return phoneSlot.n === 1 ? 'contact_number' : 'alt_contact_number'
    }
    return HEADER_ALIASES[h] ?? h.replace(/\s+/g, '_')
  }
}

function formatPhone(val: string): string {
  if (!val) return ''
  const trimmed = val.trim()
  if (trimmed.includes('E+') || trimmed.includes('e+')) {
    const num = parseFloat(trimmed)
    if (!Number.isNaN(num)) return Math.round(num).toString()
  }
  return trimmed
}

export function csvRecordToInsert(r: Record<string, string>): CustomerInsert | null {
  const lat = parseFloat(r.latitude)
  const lon = parseFloat(r.longitude)
  if (!r.latitude || !r.longitude || Number.isNaN(lat) || Number.isNaN(lon) || lat === 0 || lon === 0 || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null
  }

  const contract_reference = (r.contract_reference || r.contract_ref || r.code || '').trim()
  const par_status = (r.par_status || '').trim()

  return {
    customer: (r.customer || r.name || '').trim(),
    contract_reference,
    area: (r.area || '').trim(),
    par_status,
    par_category: (r.par_category || '').trim(),
    arrears_total_days: parseInt(r.arrears_total_days || '0', 10) || 0,
    last_purchase_date: r.last_purchase_date?.trim() ? r.last_purchase_date.trim() : null,
    days_since_last_purchase: parseInt(r.days_since_last_purchase || '0', 10) || 0,
    contact_number: formatPhone(r.contact_number || r.phone || ''),
    alt_contact_number: formatPhone(r.alt_contact_number || r.phone2 || ''),
    is_priority_visit: r.is_priority_visit === 'true' || par_status === 'PAR 90+',
    latitude: lat,
    longitude: lon,
  }
}

export function dbRowToCustomer(row: CustomerDbRow): Customer {
  return {
    contract_ref: row.contract_reference ?? '',
    name: row.customer ?? '',
    phone: row.contact_number ?? '',
    phone2: row.alt_contact_number ?? '',
    area: row.area ?? '',
    par_status: (row.par_status as PARStatus) || 'ONTIME',
    lead_generate: '',
    lead_generate_name: '',
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
  }
}

async function adminAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}` }
}

export async function clearCustomers(): Promise<number> {
  const res = await fetch('/api/customers/clear', {
    method: 'DELETE',
    headers: await adminAuthHeader(),
  })
  const body = await res.json().catch(() => ({ error: 'Delete failed' })) as { error?: string; deleted?: number }
  if (!res.ok) throw new Error(body.error ?? 'Delete failed')
  return body.deleted ?? 0
}

export async function syncCustomers(rows: CustomerInsert[]) {
  const res = await fetch('/api/customers/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await adminAuthHeader()),
    },
    body: JSON.stringify({ rows }),
  })
  const body = await res.json().catch(() => ({ error: 'Sync failed' })) as { error?: string }
  if (!res.ok) throw new Error(body.error ?? 'Sync failed')
  return { success: true }
}

export async function getCustomers(): Promise<Customer[]> {
  const PAGE = 1000
  const all: Customer[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .range(from, from + PAGE - 1)

    if (error) throw error

    all.push(...((data ?? []) as CustomerDbRow[]).map(dbRowToCustomer))

    if ((data?.length ?? 0) < PAGE) break
    from += PAGE
  }

  return all
}
