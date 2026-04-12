import type { GeoJSONFeatureCollection } from '../utils/kmzParser'

export type PARStatus = 'ONTIME' | 'PAR 1-30' | 'PAR 31-60' | 'PAR 61-90' | 'PAR 90+'
export type PARMovement = 'Improving' | 'Worsening' | 'Static' | 'Curing' | 'Declining'

export interface Customer {
  contract_ref: string
  name: string
  phone: string
  phone2: string
  area: string
  par_status: PARStatus
  lead_generate: string
  lead_generate_name: string
  latitude: number
  longitude: number
}

export interface KMZLayer {
  id: string
  name: string
  color: string
  visible: boolean
  locked?: boolean
  file_path?: string
  geojson: GeoJSONFeatureCollection
  isBuffer?: boolean  // true for buffer_layers rows, false/undefined for kmz_layers
}

export const PAR_COLORS: Record<string, string> = {
  'ONTIME':    '#22c55e',
  'PAR 1-30':  '#facc15',
  'PAR 31-60': '#f97316',
  'PAR 61-90': '#ef4444',
  'PAR 90+':   '#7f1d1d',
}

export const PAR_RING_COLOR = 'transparent'

export function isPriorityVisit(customer: Customer): boolean {
  return customer.par_status === 'PAR 90+'
}

export interface PARStats {
  ontime: number
  par30: number
  par60: number
  par90: number
  par90p: number
  priority: number
  total: number
}

export function computeStats(customers: Customer[]): PARStats {
  const stats: PARStats = { ontime: 0, par30: 0, par60: 0, par90: 0, par90p: 0, priority: 0, total: customers.length }
  for (const c of customers) {
    if (isPriorityVisit(c)) stats.priority++
    switch (c.par_status) {
      case 'ONTIME':    stats.ontime++; break
      case 'PAR 1-30':  stats.par30++;  break
      case 'PAR 31-60': stats.par60++;  break
      case 'PAR 61-90': stats.par90++;  break
      case 'PAR 90+':   stats.par90p++; break
    }
  }
  return stats
}