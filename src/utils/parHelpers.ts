import { Customer, PARMovement, PARStatus, PAR_COLORS } from '../types/par'

// PAR_RING_COLOR is imported for use by consumers of this module
export { PAR_RING_COLOR } from '../types/par'

// ─── Marker Color ─────────────────────────────────────────────────────────────

/**
 * Priority overrides the PAR-status color so priority dots stand out on the map.
 */
export function getMarkerColor(customer: Customer): string {
  return PAR_COLORS[customer.par_status]
}

// ─── Marker Radius ────────────────────────────────────────────────────────────

const RADIUS_MAP: Record<string, number> = {
  'ONTIME':    4,
  'PAR 1-30':  5,
  'PAR 31-60': 5,
  'PAR 61-90': 6,
  'PAR 90+':   6,
  'PRIORITY':  9,
}

/**
 * Priority customers render larger so they are immediately visible on the map.
 */
export function getMarkerRadius(customer: Customer): number {
  return RADIUS_MAP[customer.par_status] ?? 5
}

// ─── Movement Label ───────────────────────────────────────────────────────────

const MOVEMENT_LABELS: Record<PARMovement, string> = {
  Improving:  '↑ Improving',
  Curing:     '↑ Curing',
  Worsening:  '↓ Worsening',
  Declining:  '↓ Declining',
  Static:     '→ Static',
}

export function getMovementLabel(movement: PARMovement): string {
  return MOVEMENT_LABELS[movement]
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Converts an ISO date string to dd/MM/yyyy for display.
 * Falls back to the raw string if parsing fails — avoids silent blanks.
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return isoDate
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return isoDate
  }
}
// ─── PAR Status Normalization ────────────────────────────────────────────────

// CSV exports use inconsistent range labels — map them to the canonical union.
const PAR_STATUS_MAP: Record<string, PARStatus> = {
  // On Time variants
  'ONTIME':    'ONTIME',
  'ON TIME':   'ONTIME',
  'ON-TIME':   'ONTIME',
  
  // PAR 1-30
  'PAR 1-30':  'PAR 1-30',
  '1-30':      'PAR 1-30',
  
  // PAR 31-60
  'PAR 30-60': 'PAR 31-60',
  'PAR 31-60': 'PAR 31-60',
  '31-60':     'PAR 31-60',
  
  // PAR 61-90
  'PAR 60-90': 'PAR 61-90',
  'PAR 61-90': 'PAR 61-90',
  '61-90':     'PAR 61-90',
  
  // PAR 90+
  'PAR 90+':   'PAR 90+',
  'PAR 90':    'PAR 90+',
  '90+':       'PAR 90+',
}

/**
 * Normalizes a raw PAR status string from a CSV export to a valid PARStatus.
 * Trims whitespace before lookup. Falls back to 'ONTIME' for unrecognized values.
 */
export function normalizePARStatus(raw: string): PARStatus {
  const upper = raw.trim().toUpperCase()
  return PAR_STATUS_MAP[upper] ?? 'ONTIME'
}
