# PAR Map

One map, in a browser, for tracking who's overdue and where they are.

Territory management and loan portfolio tracking tools like Google Maps, QGIS, and Google Earth were either too limited or too heavy for what I needed. Google Maps polygons worked but couldn't be shared reliably. QGIS produced good output but required installation on every machine. A Python script generating KMZ files got closer but created more workflows than it solved.

I needed one tool, in a browser, that anyone could open without installing anything.

So I built PAR Map.

---

## What it does

Open the app and you see Lusaka. Every customer is a dot on the map, coloured by their PAR status (how overdue their loan is):

- **Green** — on time
- **Yellow** — 1 to 30 days overdue
- **Orange** — 31 to 60 days overdue
- **Red** — 61 to 90 days overdue
- **Dark red** — over 90 days overdue

You see the whole portfolio at a glance, without opening a single spreadsheet.

From there you can:

- **Filter** by PAR status to focus on just the customers who need attention
- **Search** by name, phone number, or contract reference to find one customer instantly
- **See territory boundaries and area circles** on the same map, so field agents know exactly where they're working
- **Upload a new PAR CSV** each week and the map updates for everyone — no Excel files emailed around, no one waiting on a report

Signing in unlocks the **admin dashboard**, where an admin can upload boundary layers, manage buffer circles, and refresh the weekly customer data.

---

## Running locally

```bash
git clone <this-repo>
cd PAR-Map

npm install

cp .env.example .env.local
# fill in the values — see "Environment variables" below

npm run dev
# app runs at http://localhost:3000, and redirects straight to /map
```

## Deploying

The app is built to deploy on Vercel:

- Connect the repo to a Vercel project
- Add all four environment variables under Project → Environment Variables
- Every push to `main` triggers a new build automatically

---

## How sign-in works

Only the `/admin` page needs a login. The map itself is public.

When someone visits `/admin`, a small piece of code called **middleware** runs first, before the page loads. It checks the visitor's browser for a valid Supabase session cookie:

- **No cookie** → sent to `/login`, and back to `/admin` automatically after signing in
- **Valid cookie** → the admin page loads

Sign-in itself supports email/password or "Continue with Google." Either way, once Supabase confirms who you are, the app checks your role in the database — only accounts marked `admin` can actually use the dashboard; everyone else is treated as a regular user.

This check happens twice, on purpose: once quickly at the edge (middleware, "is there a session at all?") and once properly inside the admin page itself ("is this session actually an admin?"). That split keeps the site fast for everyone while still keeping the dashboard locked down.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (Pages Router) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Map | Mapbox + Leaflet + React-Leaflet |
| File parsing | JSZip (KMZ), PapaParse (CSV) |
| Deployment | Vercel |

---

## What I learned building this

A handful of bugs weren't obvious and took real time to track down — things like Leaflet crashing the server build, an auth check firing before the login had actually finished, and a service-role database key that could have accidentally shipped to the browser.

The full write-up, in plain English, is in [`BUG_LOG.md`](./BUG_LOG.md).

---

## Project structure

```
src/
├── components/
│   ├── Map.tsx              # Leaflet map — canvas renderer for performance
│   ├── PopupCard.tsx        # Customer detail popup
│   ├── OnboardingGuide.tsx  # First-time user walkthrough
│   └── NavIcons.tsx         # Icon components
├── lib/
│   ├── supabase.ts          # Supabase client (browser + lazy admin client)
│   ├── useAuth.ts           # Auth hook — user, profile, isAdmin
│   ├── layerService.ts      # KMZ boundary layer persistence
│   └── customerService.ts   # Customer data fetch
├── pages/
│   ├── map.tsx               # PAR portfolio map (the app's home page)
│   ├── admin.tsx              # Admin dashboard
│   ├── login.tsx              # Sign-in
│   ├── register.tsx           # Self-registration
│   ├── forgot-password.tsx    # Password reset
│   └── auth/callback.tsx      # Google OAuth redirect handler
├── middleware.ts             # Edge session check that guards /admin
├── types/
│   └── par.ts                # Customer types and PAR colour system
└── utils/
    ├── kmzParser.ts           # KMZ/KML/GeoJSON parsing
    └── parHelpers.ts          # PAR status helpers
```

---

## Environment variables

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service role key is only ever used on the server — never import it into a page or component. See `BUG_LOG.md` for why that matters.
