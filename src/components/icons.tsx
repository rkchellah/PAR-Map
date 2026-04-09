// ─── src/components/icons.tsx ────────────────────────────────────────────────
// PAR Map icon set — 40 icons, all 24×24 viewBox, 1.8px stroke
// Usage: <IconSearch size={16} color="#111" />

import React from 'react'

interface IconProps {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

const defaults = {
  size: 24,
  color: 'currentColor',
}

// ── NAVIGATION & BRAND ────────────────────────────────────────────────────────

export function IconLogoMark({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="7" cy="7" r="1.8" fill={color}/>
      <circle cx="17" cy="7" r="1.8" fill={color}/>
      <circle cx="7" cy="17" r="1.8" fill={color}/>
      <circle cx="17" cy="17" r="1.8" fill={color}/>
      <circle cx="12" cy="12" r="1.2" fill={color} opacity="0.3"/>
    </svg>
  )
}

export function IconCollapsePanel({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="9" y1="4" x2="9" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="14,9 11,12 14,15" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconExpandPanel({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="9" y1="4" x2="9" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="11,9 14,12 11,15" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconBack({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="20" y1="12" x2="4" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="10,6 4,12 10,18" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconSignOut({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M10 4H5C4 4 3 5 3 6V18C3 19 4 20 5 20H10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="17,8 21,12 17,16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconAdminShield({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9,12 11,14 16,10" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── SEARCH & INTERACTION ──────────────────────────────────────────────────────

export function IconSearch({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.8"/>
      <line x1="15.5" y1="15.5" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconClose({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconFilter({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M3 5H21L14 13V19L10 21V13L3 5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconChevronDown({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <polyline points="6,9 12,15 18,9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconChevronUp({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <polyline points="6,15 12,9 18,15" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconSliders({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="3" y1="7" x2="21" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="3" y1="17" x2="21" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="7" r="2.5" fill="white" stroke={color} strokeWidth="1.8"/>
      <circle cx="15" cy="12" r="2.5" fill="white" stroke={color} strokeWidth="1.8"/>
      <circle cx="10" cy="17" r="2.5" fill="white" stroke={color} strokeWidth="1.8"/>
    </svg>
  )
}

// ── MAP CONTROLS ──────────────────────────────────────────────────────────────

export function IconZoomIn({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconZoomOut({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconLayers({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <polygon points="12,2 22,8 12,14 2,8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="2,14 12,20 22,14" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="2,19 12,24 22,19" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconPin({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M12 2C8.7 2 6 4.7 6 8C6 13 12 22 12 22C12 22 18 13 18 8C18 4.7 15.3 2 12 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="8" r="2.5" stroke={color} strokeWidth="1.8"/>
    </svg>
  )
}

export function IconEye({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M2 12C4 7 8 4 12 4C16 4 20 7 22 12C20 17 16 20 12 20C8 20 4 17 2 12Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="1.2" fill={color}/>
    </svg>
  )
}

export function IconEyeOff({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M2 12C4 7 8 4 12 4C16 4 20 7 22 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 16.5C8 18.5 10 20 12 20C16 20 20 17 22 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8"/>
      <line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// ── DATA & LAYERS ─────────────────────────────────────────────────────────────

export function IconUpload({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="12" y1="16" x2="12" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="7,9 12,4 17,9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 17V19C4 20 5 21 6 21H18C19 21 20 20 20 19V17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconDownload({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="12" y1="4" x2="12" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="7,11 12,16 17,11" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 17V19C4 20 5 21 6 21H18C19 21 20 20 20 19V17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconTrash({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 6V4H16V6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 6L6 20H18L19 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconEdit({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M4 20L8 19L20 7L17 4L5 16L4 20Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="17" y1="4" x2="20" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconLock({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 11V7C8 5 10 3 12 3C14 3 16 5 16 7V11" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill={color}/>
    </svg>
  )
}

export function IconRefresh({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M20 8C18.5 5 15.5 3 12 3C7 3 3 7 3 12C3 17 7 21 12 21C16 21 19.5 18.5 21 15" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="20,3 20,8 15,8" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── STATUS & ALERTS ───────────────────────────────────────────────────────────

export function IconCheckCircle({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <polyline points="8,12 11,15 17,9" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconWarning({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="10" x2="12" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.8" fill={color}/>
    </svg>
  )
}

export function IconXCircle({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="8" x2="8" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconInfo({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="0.8" fill={color}/>
    </svg>
  )
}

export function IconFlag({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="6" y1="3" x2="6" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 4L20 9L6 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
    </svg>
  )
}

export function IconMapDot({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="3.5" fill={color}/>
    </svg>
  )
}

// ── PEOPLE & AUTH ─────────────────────────────────────────────────────────────

export function IconUser({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8"/>
      <path d="M4 21C4 17.5 7.6 15 12 15C16.4 15 20 17.5 20 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconUsers({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="1.8"/>
      <path d="M2 21C2 17.5 5.1 15 9 15C10.8 15 12.4 15.7 13.6 16.8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="9" r="3" stroke={color} strokeWidth="1.8"/>
      <path d="M14 21C14 18.5 15.3 17 17 17C19.2 17 21 18.5 21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconSignIn({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M10 4H5C4 4 3 5 3 6V18C3 19 4 20 5 20H10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="17,8 21,12 17,16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconRegister({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="9" cy="8" r="4" stroke={color} strokeWidth="1.8"/>
      <path d="M2 21C2 17.5 5.1 15 9 15C11 15 12.8 15.8 14.1 17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="19" y1="14" x2="19" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="15.5" y1="17.5" x2="22.5" y2="17.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBarChart({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="3" y="14" width="5" height="7" rx="1" stroke={color} strokeWidth="1.8"/>
      <rect x="9.5" y="9" width="5" height="12" rx="1" stroke={color} strokeWidth="1.8"/>
      <rect x="16" y="4" width="5" height="17" rx="1" stroke={color} strokeWidth="1.8"/>
      <line x1="2" y1="21" x2="22" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBufferZone({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" strokeDasharray="3 2.5"/>
      <circle cx="12" cy="12" r="1.5" fill={color}/>
    </svg>
  )
}

// ── MAP THEMES ────────────────────────────────────────────────────────────────

export function IconStreets({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.8"/>
      <line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="1.8"/>
      <line x1="9" y1="3" x2="9" y2="21" stroke={color} strokeWidth="1.8"/>
      <line x1="15" y1="3" x2="15" y2="21" stroke={color} strokeWidth="1.8"/>
    </svg>
  )
}

export function IconSatellite({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke={color} strokeWidth="1.8"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8"/>
      <line x1="4" y1="8" x2="20" y2="8" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="4" y1="16" x2="20" y2="16" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

export function IconNight({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <path d="M14 4C10 5 7 9 7 13C7 18 11 22 16 22C18 22 20 21 21 20C17 20 14 17 14 13C14 10 15 7 17 5C16 4.5 15 4 14 4Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconOutdoors({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <polyline points="2,20 7,8 12,14 17,4 22,20" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17" cy="5.5" r="2" stroke={color} strokeWidth="1.8"/>
      <line x1="15.5" y1="3.5" x2="18.5" y2="3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── BONUS: extras used in admin ───────────────────────────────────────────────

export function IconCircleDot({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="2.5" fill={color}/>
    </svg>
  )
}

export function IconArrowRight({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="14,6 20,12 14,18" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconMap({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <polyline points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" y1="2" x2="8" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="6" x2="16" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export function IconAlertCircle({ size = defaults.size, color = defaults.color, ...p }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
      <line x1="12" y1="8" x2="12" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="0.8" fill={color}/>
    </svg>
  )
}
