# PAR Map — Architecture

## Overview

PAR Map is a client-side Next.js app for ECS Fintech Lusaka field teams.
It visualizes weekly loan portfolio data on an interactive map of Lusaka.
Zero backend, zero login, zero installation — just a shared Vercel link.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/map` |
| `/map` | Interactive map — customer dots + KMZ boundary layers |
| `/admin` | Password-gated admin dashboard — sidebar nav, 5 sections |

## Component Tree

```
App
├── pages/index.tsx           → Dashboard page
├── pages/map.tsx             → Map page shell (dynamic import only)
├── components/
│   ├── Map.tsx               → Leaflet map (client-side only, ssr:false)
│   ├── CustomerLayer.tsx     → PAR dots rendered as Leaflet CircleMarkers
│   ├── KMZLayer.tsx          → GeoJSON polygon layer from parsed KMZ
│   ├── FilterBar.tsx         → Area / Agent / PAR status / Priority filters
│   ├── LayerPanel.tsx        → Right panel: layer list, toggles, delete
│   ├── StatsPanel.tsx        → PAR bucket counts + priority count
│   └── CustomerPopup.tsx     → Popup content when a dot is clicked
├── lib/
│   ├── supabase.ts           → Supabase client initialisation
│   └── layerService.ts       → fetchLayers, uploadLayer, deleteLayer,
│                                toggleLayerVisibility, updateLayerColor,
│                                renameLayer (Supabase kmz_layers table)
├── utils/
│   ├── kmzParser.ts          → JSZip + DOMParser: KMZ/KML File → GeoJSON
│   └── parHelpers.ts         → Color logic, priority flag, stats compute
├── types/
│   └── par.ts                → All TypeScript types and interfaces
└── data/
    └── customers.ts          → Weekly PAR data — replace this each week

## Admin Dashboard (`/admin`)

```
AdminPage
├── Password gate (session-gated, orange brand login)
├── Left sidebar (220px)
│   ├── Logo: MapPin + "AREA CIRCLE MAP"
│   ├── Nav: Overview | Customer Data | Boundary Layers | Buffer Circles | Map Themes
│   └── Footer: Back to Map | Logout
└── Main content (flex-1, bg-gray-50)
    ├── Overview    → 5 stat cards + Area Circle table (Risk % badges)
    ├── Customer Data → CSV upload + customers.ts generator + deploy instructions
    ├── Boundary Layers → KMZ/KML upload + shared & local layer management
    ├── Buffer Circles  → CSV → geodesic GeoJSON upload + buffer layer list
    └── Map Themes → 6-theme info grid (read-only)
```
```

## Data Flow

### KMZ Boundaries
```
User drags KMZ file
  → kmzParser.ts unpacks zip, parses KML XML
  → Returns GeoJSON FeatureCollection
  → Stored in React state as KMZLayer[]
  → KMZLayer.tsx renders each as Leaflet GeoJSON
  → LayerPanel shows toggle + delete per layer
```

### Weekly Customer Data
```
Data analyst updates src/data/customers.ts
  → Replaces CUSTOMERS array with new week export
  → isPriorityVisit() auto-flags serious overdue + no purchase
  → CustomerLayer.tsx renders CircleMarkers colored by PAR status
  → Priority customers render as red dot with yellow ring
```

### Filters
```
FilterBar.tsx holds filter state
  → Passes filtered Customer[] down to CustomerLayer + StatsPanel
  → Filters: Area Circle, Collection Agent, PAR Status, Priority toggle, Contract search
```

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| No SSR on map | `dynamic import ssr:false` | Leaflet uses `window` — breaks on server |
| No backend | Client-only | Zero server costs, instant Vercel deploy |
| KMZ in browser | JSZip + DOMParser | No upload endpoint needed |
| Tiles | OpenStreetMap | Free, no API key, works in Zambia |
| Charts | Recharts | Lightweight, works with Tailwind |
| Styling | Tailwind CSS | Fast, consistent, mobile-friendly |

## Deployment

- **Host:** Vercel (free tier)
- **Trigger:** Push to `main` branch on GitHub
- **Build:** `next build` (static export compatible)
- **URL:** Shared with field teams via WhatsApp
- **Update cycle:** Weekly — analyst updates `customers.ts` and pushes

## Constraints

- Must load fast on mobile in Lusaka (low bandwidth)
- No login required — the link is the access control
- No database — all data is in the codebase
- Leaflet must **never** be imported at the top level of any page
