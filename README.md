# PAR Map - Interactive Geospatial Dashboard

> High-performance loan portfolio visualisation and territory management for field teams in Lusaka, Zambia.

Built with **Next.js 15** and **Supabase** — designed for real-time PAR status tracking, boundary layer management, and field-ready geographic intelligence.

---

## Design System: Luminous Curator

A professional, high-contrast light-mode theme built for field visibility:

| Principle | Implementation |
|-----------|---------------|
| **Clarity** | Tonal sidebars and glassmorphic navbar — metrics scannable in high-glare environments |
| **Typography** | `Manrope` for map UI · `Inter` for admin tasks · `DM Mono` for technical data |
| **Status Encoding** | Color-coded markers by PAR bucket · Priority Visit flags with red dot + yellow ring |

---

## Features

- **Real-Time Portfolio Tracking** - Monitor On-Time and At-Risk (PAR 1-30 through PAR 90+) metrics across areas including Chilenje, Matero, Ngombe, Kanyama, and more
- **Advanced Layer Management** - Upload, rename, recolor, and lock KMZ / KML / GeoJSON boundary layers
- **Buffer Circle Generator** - Create geodesic polygons (e.g. 1 km / 2 km warehouse buffers) from CSV coordinates
- **Team Grouping** - Assign boundary layers to area circle field teams
- **Role-Based Access** - `/admin` dashboard protected by Supabase Auth + middleware route guards
- **High Performance** - Canvas renderer (`preferCanvas: true`) handles thousands of markers smoothly on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (Pages Router) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Mapping | Mapbox GL + Leaflet + React-Leaflet v5 |
| File Parsing | JSZip (KMZ) · PapaParse (CSV) · DOMParser (KML) |
| Styling | Tailwind CSS + Luminous Design Tokens |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── Map.tsx              # Dynamic Leaflet map (SSR disabled, canvas renderer)
│   └── NavIcons.tsx         # Luminous UI icon components
├── lib/
│   ├── supabase.ts          # Browser client + server admin client
│   ├── useAuth.ts           # Auth hook with profile fetch + race condition fix
│   ├── layerService.ts      # KMZ layer persistence and visibility logic
│   └── customerService.ts   # Paginated customer fetch + DB sync
├── pages/
│   ├── index.tsx            # Main map page
│   ├── admin.tsx            # Admin dashboard (auth-guarded)
│   ├── login.tsx            # Email auth
│   └── auth/callback.tsx    # OAuth PKCE exchange handler
├── utils/
│   └── kmzParser.ts         # Client-side KMZ/KML/GeoJSON conversion
├── types/
│   └── par.ts               # Customer interface, PAR colors, stats helpers
└── middleware.ts             # Edge middleware — session cookie + route protection
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...        # Server-only — never expose to browser
```

---

## Setup & Deployment

### 1. Install dependencies
```bash
npm install
```

### 2. Run database migrations

Execute the following in your **Supabase SQL Editor** (in order):

```sql
-- 1. User profiles + role system
CREATE TABLE profiles ( ... );

-- 2. KMZ boundary layers
CREATE TABLE kmz_layers ( ... );

-- 3. Customer PAR data
CREATE TABLE customers ( ... );

-- 4. Teams
CREATE TABLE teams ( ... );
```

> Full migration scripts are in `/supabase/migrations/`.

### 3. Create a storage bucket

In your Supabase dashboard → **Storage** → create a public bucket named `kmz-files`.

### 4. Promote a user to admin

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```

### 5. Deploy to Vercel

Connect your repository to Vercel and add all four environment variables from `.env.local` to your project settings. Pushes to `main` deploy automatically.

---

## Weekly Data Update Workflow

1. Export the latest PAR CSV from your loan management system (PayGops / internal export)
2. Log in to the **Admin Portal** → Customer Data
3. Drop the CSV into the upload zone and click **Sync to Database**
4. The map reloads automatically — new markers, updated PAR buckets, and refreshed portfolio stats

---

## PAR Status Colour Reference

| Status | Color | Meaning |
|--------|-------|---------|
| ONTIME | 🟢 Green | Current — no arrears |
| PAR 1-30 | 🟡 Yellow-Green | 1–30 days past due |
| PAR 31-60 | 🟠 Amber | 31–60 days past due |
| PAR 61-90 | 🔴 Orange-Red | 61–90 days past due |
| PAR 90+ | 🔴 Deep Red | 90+ days past due — critical |

---

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can read customer and layer data
- Only `role = 'admin'` profiles can write, delete, or manage data
- Service role key is never exposed to the browser
- Middleware guards the `/admin` route server-side

---

## Author

**Chella Kamina**
