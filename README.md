# PAR Map — Field Intelligence Dashboard

> Interactive geospatial dashboard for visualising loan portfolio health and managing field collection teams.

Built with **Next.js 15** and **Supabase** — designed for fintech and clean energy companies that need real-time PAR status tracking, boundary layer management, and geographic field intelligence.

---

## What It Does

Field collection teams need to know where to go and who to visit first. PAR Map solves that by putting every customer on a map, colour-coded by how overdue they are, with boundary overlays showing territory assignments and buffer zones around key locations.

This is a demo version using anonymised dummy data. The production version runs weekly with live portfolio exports from a loan management system.

---

## Design System: Luminous Curator

A high-contrast light-mode theme built for field visibility in high-glare environments:

| Principle | Implementation |
|-----------|---------------|
| **Clarity** | Tonal sidebars and glassmorphic navbar |
| **Typography** | `Manrope` for map UI · `Inter` for admin · `DM Mono` for data values |
| **Status Encoding** | Colour-coded markers by PAR bucket · Priority Visit flags with red dot + yellow ring |

---

## Features

- **Real-Time Portfolio Tracking** — Monitor On-Time and At-Risk customers (PAR 1-30 through PAR 90+) across geographic areas
- **Advanced Layer Management** — Upload, rename, recolor, and lock KMZ / KML / GeoJSON boundary layers
- **Buffer Circle Generator** — Create geodesic polygons (e.g. 1km / 2km radius buffers) from CSV coordinates
- **Team Grouping** — Assign boundary layers to named field teams
- **Role-Based Access** — `/admin` dashboard protected by Supabase Auth + middleware route guards
- **High Performance** — Canvas renderer handles thousands of markers smoothly on mobile and low-bandwidth connections
- **Priority Visit Flags** — Automatically surfaces the highest-risk customers for immediate action

---

## PAR Status Colour Reference

| Status | Colour | Meaning |
|--------|--------|---------|
| ONTIME | 🟢 Green | Current — no arrears |
| PAR 1-30 | 🟡 Yellow-Green | 1–30 days past due |
| PAR 31-60 | 🟠 Amber | 31–60 days past due |
| PAR 61-90 | 🔴 Orange-Red | 61–90 days past due |
| PAR 90+ | 🔴 Deep Red | 90+ days past due — critical |

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

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/rkchellah/Map.git
cd Map
npm install
```

### 2. Set up Supabase

Create a new project at [supabase.com](https://supabase.com) and run the following migrations in your Supabase SQL Editor:

```sql
-- User profiles + role system
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'user',
  avatar_url text,
  PRIMARY KEY (id)
);

-- KMZ boundary layers
CREATE TABLE kmz_layers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  color text DEFAULT '#4a4bd7',
  locked boolean DEFAULT false,
  visible boolean DEFAULT true,
  file_path text,
  team_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Customer PAR data
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer text,
  contract_reference text,
  gender text,
  area text,
  par_category text,
  par_status text,
  latitude float,
  longitude float,
  contact_number text,
  last_purchase_date date,
  days_since_last_purchase int,
  is_priority_visit boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Teams
CREATE TABLE teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 3. Create a storage bucket

In your Supabase dashboard → **Storage** → create a public bucket named `kmz-files`.

### 4. Promote a user to admin

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```

### 5. Set environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 6. Run locally

```bash
npm run dev
```

### 7. Deploy to Vercel

Connect your repository to Vercel and add all four environment variables. Pushes to `main` deploy automatically.

---

## Demo Data

This repo ships with anonymised dummy data covering realistic PAR structures across Lusaka. All customer names, phone numbers, and locations are fictional.

To load your own data: log into the Admin Portal → Customer Data → upload your PAR CSV.

---

## Weekly Data Update Workflow (Production)

1. Export the latest PAR CSV from your loan management system
2. Log in to the **Admin Portal** → Customer Data
3. Drop the CSV into the upload zone and click **Sync to Database**
4. The map reloads automatically with updated markers and portfolio stats

---

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can read customer and layer data
- Only `role = 'admin'` profiles can write, delete, or manage data
- Service role key is never exposed to the browser
- Middleware guards the `/admin` route server-side

---

## Project Background

Built as an internal field intelligence tool for a clean energy company managing a loan portfolio across Zambia. Grew from a QGIS-based static map into a full web application after the field team needed real-time updates and mobile access.

Submitted to [Hack Trek 2026](https://devpost.com) as part of an ongoing portfolio of production tools built at the intersection of data and software.

---

## Author

**Chella Kamina** — [GitHub](https://github.com/rkchellah) · [LinkedIn](https://linkedin.com/in/rkchellah) · [Dev.to](https://dev.to/rkchellah)