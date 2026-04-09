// ─── src/components/NavIcons.tsx ──────────────────────────────────────────
// Drop-in icon replacements for index.tsx navbar
// Use these custom SVGs that are not Lucide-generic.

import React from 'react'
import { 
  IconLogoMark, 
  IconSignIn, 
  IconUser,
  IconSearch as IconSearchBase, 
  IconClose,
  IconCollapsePanel
} from './icons'

// ── 1. LOGO & BRAND ─────────────────────────────────────────────────────────
export function NavLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <IconLogoMark size={22} color="#111111" />
      <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '-0.02em', color: '#111111' }}>
        MAP
      </span>
    </div>
  )
}

// ── 2. ADMIN BUTTON ICON — Login / Door Enter ──────────────────────────────
export function IconAdmin() {
  return <IconUser size={16} />
}

// ── 3. SEARCH & UI HELPERS ──────────────────────────────────────────────────
export function IconSearch() {
  return <IconSearchBase size={16} />
}

export function IconX({ size = 14 }: { size?: number }) {
  return <IconClose size={size} />
}

export function IconIndent() {
  return <IconCollapsePanel size={12} />
}
