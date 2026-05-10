# PAR Map

Territory management and loan portfolio tracking tools like Google Maps, QGIS, and Google Earth were either too limited or too heavy for what I needed. Google Maps polygons worked but couldn't be shared reliably. QGIS produced good output but required installation on every machine. A Python script generating KMZ files got closer but created more workflows than it solved.

I needed one tool, in a browser, that anyone could open without installing anything.

So I built PAR Map.

---

## What it does

Log in and you see Lusaka. Every customer is a dot on the map coloured by their PAR status — green means on time, yellow is 1-30 days overdue, orange is 31-60, red is 61-90, dark red is over 90 days. You see the full picture at a glance without opening a single spreadsheet.

Filter by PAR status to focus on what matters. Search by name, phone number, or contract reference. Territory boundaries and area circles sit on the same map so field agents know exactly where they're working. Upload a new PAR CSV and the map updates — no Excel, no email chains, no one waiting for a report.

---

## MoMo Sentry

The `/sentry` page runs a separate project built for the Africa Ignite Hackathon 2026. Mobile money booth agents in Lusaka face a specific fraud problem — SIM swap. Someone replaces a customer's SIM card, then walks to a booth and withdraws everything before anyone notices. MoMo Sentry uses Nokia's Network as Code CAMARA APIs to check whether a SIM was recently swapped before cash is released. Every check gets logged and plotted on the same Lusaka map.

Same infrastructure, same city, different problem.

[MoMo-Sentry](https://github.com/rkchellah/MoMo-Sentry)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (Pages Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Map | Mapbox + Leaflet + React-Leaflet |
| File parsing | JSZip (KMZ), PapaParse (CSV) |
| Deployment | Vercel |

---

## Project structure

```
src/
├── components/
│   ├── Map.tsx              # Leaflet map — canvas renderer for performance
│   ├── PopupCard.tsx        # Customer detail popup
│   ├── FraudPopupCard.tsx   # Fraud check popup (MoMo Sentry)
│   └── NavIcons.tsx         # Icon components
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── useAuth.ts           # Auth hook
│   ├── layerService.ts      # KMZ layer persistence
│   ├── customerService.ts   # Customer data fetch
│   └── fraudService.ts      # Fraud checks fetch (MoMo Sentry)
├── pages/
│   ├── index.tsx            # PAR portfolio map
│   ├── sentry.tsx           # Fraud detection map (MoMo Sentry)
│   ├── agent.tsx            # Booth agent check screen (MoMo Sentry)
│   ├── admin.tsx            # Admin dashboard
│   └── login.tsx            # Auth
├── types/
│   ├── par.ts               # Customer types and PAR colour system
│   └── sentry.ts            # Fraud check types (MoMo Sentry)
└── utils/
    └── kmzParser.ts         # KMZ/KML/GeoJSON parsing
```

---

## Environment variables

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MOMO_SENTRY_API=
```

---

## Running locally

```bash
npm install
npm run dev
```