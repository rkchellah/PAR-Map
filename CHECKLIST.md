# PAR Map — Build Checklist

## Phase 1 — Foundation
- [x] `src/utils/kmzParser.ts` created
- [x] `src/types/par.ts` created
- [x] `src/utils/parHelpers.ts` created (+ `normalizePARStatus` added)
- [x] `src/data/customers.ts` created (W13 · Mar 2026 Ready)
- [x] Next.js app initialized with TypeScript
- [x] Tailwind CSS configured
- [x] `jszip` and `@types/jszip` installed
- [x] `leaflet`, `react-leaflet` installed
- [x] `recharts` installed
- [x] `papaparse` and `@types/papaparse` installed
- [x] Data Automation Script (`scripts/csv_to_ts.py`) created
- [ ] GitHub repo created and pushed
- [ ] Deployed to Vercel

## Phase 2 — Map Page
- [x] Map component created (dynamic import, no SSR)
- [x] Mapbox Streets tiles rendering (requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`)
- [x] OSM base tiles rendering (replaced by Mapbox)
- [x] KMZ drag-and-drop working
- [x] KMZ parses and renders as polygon layer
- [x] KMZ layer persistence (localStorage) implemented
- [x] Floating UI Redesign (Search bar only, filters moved to sidebar)
- [x] Mapbox Theme Switcher (Day, Dusk, Dawn, Night)
- [x] Sidebar PAR Status Filters (Clickable rows with active state)
- [x] Performance: Canvas rendering enabled (`preferCanvas: true`)
- [x] Global Resets: Fixed blue glow and edge overflow
- [x] Color Sync: PAR colors match exactly with requested hex codes
- [x] Live Sidebar Stats (computeStats)
- [x] Zambian phone numbers added (+260 9X XXXXXXX)
- [x] Customer dots rendering (via `src/data/customers.ts`)
- [x] Customer dots colored by PAR status
- [x] Priority Visit visual treatment REMOVED
- [x] Customer popup on click working
- [x] Search by Contract Reference, Name, or Phone working
- [ ] Dashboard page created at `/`

### Phase 3 — Refinement & Performance [WIP]
- [x] Full UI redesign of `/map`
- [x] Clean sidebar with PAR filters
- [x] Performance: Enable `preferCanvas` for markers
- [x] Performance: Memoize marker layer
- [x] Performance: Reduce marker radii
- [x] Bug: Fix PAR Status filtering (exact match)
- [x] UI: Add 1px black outline to markers
- [ ] Implement root dashboard (`/`)
- [ ] Add "Export View" to sidebar
- [ ] Performance: Web Worker for KMZ parsing
- [ ] Multi-select team/area filters
- [ ] Advanced Search (by contract status, etc.)
- [x] Mobile responsive (Tailwind Absolute Layout)
- [x] Fast load on low bandwidth
- [ ] Deployed to Vercel
- [ ] Shared link tested on mobile
- [x] README complete (and scripts/README.md)
- [x] Zambian phone numbers (+260 9X XXXXXXX) added

## Phase 4 — Final UX Polish [DONE]
- [x] Revert PAR colors to original palette
- [x] Left Sidebar Redesign (280px, Tonal)
- [x] Lucide Icon Integration (MapPin, Layers, etc.)
- [x] Expandable Navigation Sections
- [x] Sidebar Interactivity (Pin / Hide / Show Tab)
- [x] Map Theme Grid (3x2) with 6 themes
- [x] Satellite Theme Integration
- [x] Search bar refinement
- [x] Renamed "On Time" to "ONTIME" consistently across UI
- [x] Sidebar Typography Refinement (10px, 12px, 14px)
- [x] Card-based layout for Portfolio and Layers
- [x] Count badges with status-colored backgrounds
- [x] Typographic active state for Nav Items (removed boxy layout)
- [x] Replaced Sidebar Pin with Anchor icon
- [x] Renamed Sidebar to "AREA CIRCLE MAP"
- [x] Removed Layer Delete functionality from Map view (restricted to Show/Hide)

### Phase 6: Admin Data Management
- [x] Setup Supabase client and layer service
- [x] Implement persistent boundary storage (KMZ / KML)
- [x] Create password-authenticated Admin Dashboard (`/admin`)
- [x] Clean, flat visual redesign of Admin Dashboard (removed cards)
- [x] Admin Layout Two-Column & CSV Data Previews
- [x] Fixed admin two-column layout
- [x] Add discreet, stealth-login icon (`UserCircle`) modal to public Map nav
- [x] Implement Buffer Circle generator (CSV to GeoJSON/KML)
- [x] Integrate managed vs local layers on public Map
- [x] Added "Lock" functionality to prevent deletion of official layers
- [x] Documentation for weekly Customer data updates
- [x] Interactive Weekly Data CSV Uploader & TS Generator
- [x] KML file support added (parseKml in kmzParser.ts, layerService extension detection, admin drop zone accept)
- [x] Area Circle Stats section added to Admin Dashboard (per-area totals, ONTIME/overdue/PAR90+/risk% table, sorted by risk)

## Phase 5 — Deployment Ready [DONE]
- [x] Configured Next.js redirects (/ to /map)
- [x] Created custom 404 auto-redirect page
- [x] Fixed marker popup data labels
- [x] Simplified Map component (Marker outline only)
- [x] Final visual verification complete

## Phase 7 — Admin Premium Redesign [DONE]
- [x] Full Tailwind CSS redesign of `src/pages/admin.tsx` (no inline styles except dynamic values)
- [x] Left sidebar navigation (220px): logo, 5 nav items, back-to-map, logout
- [x] 5 sections: Overview, Customer Data, Boundary Layers, Buffer Circles, Map Themes
- [x] Overview: 5 stat cards grid + Area Circle portfolio table with Risk % badges
- [x] Area table sorted by PAR 90+ descending with TOTAL summary row
- [x] Customer Data: two-column layout — upload form + dark deployment instructions panel
- [x] Boundary Layers: upload form + shared layers list + local layers list side by side
- [x] Buffer Circles: CSV form + buffer-only layer list (filtered by name prefix)
- [x] Map Themes: 6-theme info grid (read-only)
- [x] Inline rename for both Supabase and local layers (click pencil → input auto-focus)
- [x] `renameLayer(id, name)` added to `src/lib/layerService.ts`
- [x] Color picker per layer (click swatch to expand)
- [x] Password gate redesigned to match primary brand color
- [x] All existing logic preserved (geodesic buffers, CSV generation, uploadLayer, deleteLayer)

## Phase 8 — Light Mode Transition [DONE]
- [x] Refactored `src/pages/map.tsx` with light-mode design tokens (void: #f0f2f5, surface: #ffffff)
- [x] Implemented light-mode glassmorphism on Navbar and Side Panel
- [x] Updated all UI surfaces (cards, buttons, inputs) for high-contrast legibility
- [x] Overrode Leaflet popup styles for a clean light aesthetic
- [x] Verified build stability with `npm run build`
- [x] Fixed `admin.tsx` type mismatches to restore build parity
- [x] Updated Typography to **Roboto** (matched YouTube interface per request)
