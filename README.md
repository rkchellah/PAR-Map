# PAR Map — Supamoto Field Dashboard

Interactive loan portfolio map for ECS Fintech Lusaka field teams.
Visualises weekly PAR data on a Mapbox map with boundary layers, buffer circles, and an admin dashboard backed by Supabase.

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `.env.local` in the project root (never commit this file):

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox Dashboard → Access Tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |

---

## Pages

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Main map — customer dots, filters, boundary layers |
| `/login` | Public | Email/password + Google OAuth sign-in |
| `/register` | Public | Self-registration (role request) |
| `/admin` | Admin only | Dashboard — customer data, layers, buffer circles |
| `/auth/callback` | Internal | OAuth redirect handler |
| `/forgot-password` | Public | Password reset |

---

## Project Structure

```
src/
├── components/          # Shared UI components and icons
├── data/
│   └── customers.ts     # Weekly PAR data — replace this each week
├── lib/
│   ├── supabase.ts      # Supabase client + Profile type
│   ├── useAuth.ts       # Auth hook — user, profile, isAdmin, loading
│   └── layerService.ts  # fetchLayers, uploadLayer, deleteLayer, etc.
├── pages/
│   ├── index.tsx        # Map dashboard (public)
│   ├── admin.tsx        # Admin dashboard (admin role required)
│   ├── login.tsx        # Sign in page
│   ├── register.tsx     # Registration page
│   ├── auth/
│   │   └── callback.tsx # OAuth callback
│   └── api/
│       └── userauth.ts  # Server-side auth API route
├── types/
│   └── par.ts           # TypeScript types and PAR helpers
└── utils/
    └── kmzParser.ts     # KMZ/KML → GeoJSON parser (JSZip + DOMParser)
middleware.ts             # Edge middleware — protects /admin route
```

---

## Authentication

- **Public users** — no login needed. View map, search customers, toggle layers.
- **Admin users** — must have `role = 'admin'` in the `profiles` table.
- Auth is handled by Supabase (email/password + Google OAuth).
- The Edge middleware protects `/admin` by checking for a valid session cookie.
- Role enforcement happens in `useAuth()` inside `admin.tsx`.

### Promoting a user to admin

Run in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
```

---

## Weekly Data Update

Each week the data analyst replaces `src/data/customers.ts`:

1. Export the PAR CSV from the loan system
2. Run the conversion script:
   ```bash
   python scripts/csv_to_ts.py
   ```
3. Replace `src/data/customers.ts` with the generated file
4. Commit and push — Vercel redeploys automatically

---

## Supabase Setup

### Database

Run `supabase/migrations/001_initial.sql` in the Supabase SQL Editor to create:
- `profiles` table (id, full_name, role, avatar_url)
- `kmz_layers` table (id, name, color, locked, visible, file_path)
- Row-level security policies
- Trigger to auto-create a profile row on sign-up

### Storage

Create a storage bucket called `kmz-files` and set it to **Public**.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + TypeScript |
| Map | Leaflet + React-Leaflet |
| Tiles | Mapbox |
| Auth & DB | Supabase |
| Charts | Recharts |
| CSV parsing | PapaParse |
| KMZ parsing | JSZip + DOMParser |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Deployment

1. Push to `main` on GitHub
2. Vercel picks up the push and runs `next build`
3. Add all `.env.local` variables to Vercel → Project → Environment Variables
4. Share the Vercel URL with field teams

---

## Key Constraints

- Must load fast on mobile in Lusaka (low bandwidth)
- Leaflet must never be imported at the top level of any page (use `dynamic` with `ssr: false`)
- `.env.local` is gitignored — never commit real keys