# LEARNINGS.md — PAR Map

Things I figured out building this, documented so I don't forget and so anyone forking this doesn't hit the same walls.

---

## Leaflet + Next.js SSR

Leaflet uses `window` directly. If you import it at the top level of any page it will crash on the server during build.

**Fix:** Always use dynamic imports with SSR disabled for any component that touches Leaflet.

```typescript
const Map = dynamic(() => import('../components/Map'), { ssr: false })
```

Never import `leaflet` or `react-leaflet` at the top level of a page. Ever.

---

## Canvas Renderer for Large Datasets

Default Leaflet renders markers as SVG. With 500+ customers on the map this becomes noticeably slow, especially on mobile.

**Fix:** Pass `preferCanvas: true` when initialising the map. Switches rendering to Canvas and handles thousands of markers without lag.

```typescript
const map = L.map('map', { preferCanvas: true })
```

---

## Supabase Auth Race Condition

`onAuthStateChange` fires immediately on mount with the current session, which races with `getSession()`. This caused the admin page to redirect to login briefly before realising the user was actually authenticated.

**Fix:** Use an `initialized` ref to skip the initial duplicate event from `onAuthStateChange` and let `getSession()` be the single source of truth on mount.

```typescript
const initialized = useRef(false)

supabase.auth.onAuthStateChange((_event, session) => {
  if (!initialized.current) return // skip the initial fire
  // handle subsequent auth changes
})

supabase.auth.getSession().then(({ data: { session } }) => {
  initialized.current = true
  // set user state here
})
```

---

## Middleware Cookie Name

Supabase's Edge middleware reads a cookie named `sb-<PROJECT_REF>-auth-token`. The project ref is the subdomain part of your Supabase URL.

If you change Supabase projects, the cookie name changes. Always extract the project ref dynamically from `NEXT_PUBLIC_SUPABASE_URL` rather than hardcoding it.

---

## Service Role Key in Browser

The Supabase service role key bypasses RLS entirely. If it ever reaches the browser, any user can read or write anything in your database.

**Fix:** Never import a module that uses `SUPABASE_SERVICE_ROLE_KEY` from a page or component. Keep it in server-only files and use a lazy getter function so it fails loudly if accidentally called client-side.

```typescript
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must not be called in the browser')
  }
  return createClient(url, serviceRoleKey)
}
```

---

## KMZ Parsing in the Browser

KMZ files are ZIP archives containing KML. You can parse them entirely in the browser using JSZip to unzip and DOMParser to parse the KML XML — no upload endpoint needed.

This keeps the architecture simple and avoids a server round-trip for file parsing.

---

## Full Navigation on Login

After `supabase.auth.signInWithPassword()` succeeds, using `router.push('/admin')` from Next.js router doesn't always set the session cookie before the middleware runs. The middleware then sees no cookie and redirects back to login.

**Fix:** Use `window.location.href = '/admin'` instead of `router.push()`. This forces a full page navigation which ensures the cookie is present before the middleware runs.

---

## Mapbox vs OpenStreetMap

OSM tiles are free but the quality around Lusaka is noticeably lower than Mapbox. For a tool being used by field teams on the ground, map quality matters — roads and landmarks need to be recognisable.

Mapbox free tier covers well over enough requests for a field team of this size.

---

## Performance on Low Bandwidth

Field teams open this on phones in Lusaka on mobile data. Two things that helped most:

1. Canvas renderer (above) — biggest single performance win
2. Memoizing the marker layer so it doesn't re-render on every state change

```typescript
const markerLayer = useMemo(() => {
  return customers.map(c => renderMarker(c))
}, [customers])
```

---

## What I'd Do Differently

- Start with Supabase auth from day one instead of adding it in Phase 9. Retrofitting auth into an existing app always creates more work than building it in from the start.
- Use a proper state management approach (Zustand or React Context) for layer visibility instead of local state scattered across components.
- Write the migration SQL properly from the start — the schema evolved too many times through development.