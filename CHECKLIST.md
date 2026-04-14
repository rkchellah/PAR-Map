# PAR Map — Build Checklist

## Phase 1 — Foundation
- [x] Next.js app initialized with TypeScript
- [x] Tailwind CSS configured
- [x] `jszip`, `leaflet`, `react-leaflet`, `recharts`, `papaparse` installed
- [x] `src/utils/kmzParser.ts` created
- [x] `src/types/par.ts` created
- [x] `src/data/customers.ts` created (W13 · Mar 2026)
- [x] Data automation script (`scripts/csv_to_ts.py`) created
- [x] GitHub repo created and pushed
- [ ] Deployed to Vercel

## Phase 2 — Map Page
- [x] Map component (dynamic import, no SSR)
- [x] Mapbox Streets tiles rendering
- [x] KMZ drag-and-drop working
- [x] KMZ parses and renders as polygon layer
- [x] KMZ layer persistence (localStorage)
- [x] Floating UI redesign (search bar only, filters in sidebar)
- [x] Mapbox theme switcher (6 themes)
- [x] Sidebar PAR status filters (clickable rows with active state)
- [x] Canvas rendering (`preferCanvas: true`)
- [x] Customer dots rendering + colored by PAR status
- [x] Customer popup on click
- [x] Search by contract reference, name, or phone
- [x] Live sidebar stats (`computeStats`)

## Phase 3 — Refinement & Performance
- [x] Full UI redesign of map page
- [x] Performance: memoized marker layer, reduced marker radii
- [x] PAR status filtering (exact match)
- [x] Mobile responsive layout
- [x] Fast load on low bandwidth
- [x] README complete

## Phase 4 — Final UX Polish
- [x] Left sidebar redesign (280px, tonal)
- [x] Expandable navigation sections
- [x] Sidebar pin / hide / show tab
- [x] Map theme grid (3×2, 6 themes including Satellite)
- [x] Search bar refinement
- [x] Card-based layout for Portfolio and Layers
- [x] Count badges with status-colored backgrounds
- [x] Removed layer delete from map view (show/hide only)

## Phase 5 — Deployment Ready
- [x] Next.js redirects configured
- [x] Custom 404 auto-redirect page
- [x] Fixed marker popup data labels
- [x] Final visual verification complete

## Phase 6 — Admin Data Management
- [x] Supabase client and layer service (`layerService.ts`)
- [x] Persistent boundary storage (KMZ / KML / GeoJSON in Supabase Storage)
- [x] `kmz_layers` table with RLS policies
- [x] Admin dashboard (`/admin`) — customer data, layers, buffer circles
- [x] Buffer circle generator (CSV → geodesic GeoJSON → Supabase)
- [x] Managed vs local layers integrated on public map
- [x] Lock functionality (prevent field users toggling official layers)
- [x] Weekly customer data CSV uploader and TS generator in Admin
- [x] KML file support added
- [x] Area circle stats section (per-area totals, risk% table)
- [x] Layer rename (inline input, pencil icon)
- [x] Layer recolor (swatch picker per layer)
- [x] Team grouping for layers (assign layers to named field teams)

## Phase 7 — Admin Premium Redesign
- [x] Full inline-style redesign of `admin.tsx` (no Tailwind dependency)
- [x] Left sidebar (268px): logo, 3 nav items, back-to-map, logout
- [x] Sections: Customer Data, Boundary Layers, Buffer Circles
- [x] Customer Data: CSV upload + live registry table
- [x] Boundary Layers: upload form + teams + unassigned layers
- [x] Buffer Circles: CSV form + buffer layer list
- [x] All existing logic preserved

## Phase 8 — Light Mode Transition
- [x] Light-mode design tokens across map page and admin
- [x] Glassmorphism navbar and side panel
- [x] Clean Leaflet popup styles
- [x] Typography: Manrope (map) + Inter (admin) + DM Mono (monospace values)

## Phase 9 — Supabase Auth
- [x] Supabase Auth enabled (email/password + Google OAuth)
- [x] `profiles` table with `role` column ('admin' | 'user')
- [x] Trigger: auto-create profile row on sign-up
- [x] `useAuth()` hook (user, profile, isAdmin, loading, signOut)
- [x] Login page (`/login`) — email form + Google SSO
- [x] Register page (`/register`) — full name, email, role request, password
- [x] OAuth callback handler (`/auth/callback`) — profile upsert + redirect
- [x] Admin guard in `admin.tsx` — waits for loading before redirecting
- [x] Auth race condition fixed with `initialized` ref in `useAuth`
- [x] Edge middleware (`middleware.ts`) — session cookie check for /admin
- [x] Middleware uses direct cookie read (no async, no external dependencies)
- [x] `supabase.ts` — lazy `getSupabaseAdmin()` (server-only, never in browser)
- [x] GitHub repo pushed (`.env.local` gitignored)
- [ ] `.env.local` populated with real Supabase URL and keys
- [x] Login redirect loop resolved (middleware cookie name verified)
- [ ] Deployed to Vercel with env vars set