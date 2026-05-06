# PAR Map

One of my responsibilities at work involves territory management and loan portfolio tracking for a field team operating across Lusaka. For a long time that meant spreadsheets, Google Maps links shared over WhatsApp, and area circle boundaries that existed only in people's heads.

I needed something I could actually use. So I built it.

The first version was hand-drawn polygons on Google Maps. It worked well enough to show the concept but wasn't something I could maintain or share reliably. Then I tried QGIS — better output quality but required everyone to have it installed. Then a Python script that took coordinates copied from Google Maps and generated KMZ files for Google Earth. Three tools, three workflows, all friction.

After three hackathons where I was learning how to build proper web apps, I had enough to build something real. A map in a browser. Anyone opens it, logs in, sees what they need. No installs, no lost access.

Around the same time I was sending PAR reports by email. Some people on the team didn't use Excel confidently. I thought if I'm building the territory map anyway I might as well put the portfolio data on the same map. One tool instead of two.

It worked. My manager liked it.

---

## What it does

Log in and see Lusaka. Every customer is a dot coloured by PAR status — green is on time, the deeper the red the more overdue. Filter by status, search by name or number, see territory boundaries on the same map.

Upload a PAR CSV weekly. The map updates. No Excel, no email.

---

## MoMo Sentry integration

The `/sentry` page is part of a separate project — MoMo Sentry — built for the Africa Ignite Hackathon 2026. It uses the same Supabase project and the same Lusaka map to plot fraud check results from mobile money booth agents.

Same city, same infrastructure, different problem.

MoMo Sentry: https://github.com/rkchellah/MoMo-Sentry

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
```

---

## Running locally

```bash
npm install
npm run dev
```

---

## Author

Chella Kamina — data analyst, Lusaka, Zambia.