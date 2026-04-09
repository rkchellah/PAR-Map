# PAR Map — Project Rules

## Code
- TypeScript only. Strict typing enforced.
- No `any` types without a comment explaining why.
- Clean, well-structured code.
- Comments only when necessary — explain *why*, never *what*.

## Data
- Weekly PAR data lives in `src/data/customers.ts`
- Replace the `CUSTOMERS` array each week by running `python scripts/csv_to_ts.py`
- Never rename or move source files

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript |
| Map | Leaflet + React-Leaflet |
| Charts | Recharts |
| CSV parsing | PapaParse |
| KMZ parsing | JSZip + DOMParser |
| Styling | Tailwind CSS |
| Deployment | Vercel |

> [!IMPORTANT]
> A Mapbox token is required in `.env.local` as `NEXT_PUBLIC_MAPBOX_TOKEN`.

## Authentication
- **Public access:** No login required. Standard users can only view managed layers and add local ones.
- **Admin access:** Managed via `/admin` with a password gate.
- **Password:** Must be set in `.env.local` as `ADMIN_PASSWORD`.

## Infrastructure
| Service | Requirement |
|---------|-------------|
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Storage Bucket | `kmz-files` (must be set to **Public**) |

## Philosophy
- Field teams open this on a phone — **performance is not optional**
- One link, zero logins, zero installations for field users
- Persistent boundaries managed by admin; temporary boundaries for users
- Shipping beats perfection
- Every layer must be toggleable and deletable (unless locked by Admin)
