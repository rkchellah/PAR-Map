# Bug Log — PAR Map

Problems that came up while building PAR Map, explained simply. Written down so I don't hit the same wall twice, and so anyone else working on this codebase doesn't either.

---

## The map crashed the server, but only sometimes

**What happened:** Leaflet, the mapping library this app uses, expects to run in a web browser. It reaches for the browser's `window` object right away. Next.js, though, builds pages on the server first before sending them to the browser — and on the server, there is no `window`. The build would fail.

**The fix:** Load the map component "lazily," telling Next.js explicitly: don't try to build this one on the server, only load it once it's in the browser.

```typescript
const Map = dynamic(() => import('../components/Map'), { ssr: false })
```

**Rule going forward:** Never import Leaflet, or anything that touches Leaflet, at the top of a page. It always has to load this lazy way.

---

## The map got sluggish with a few hundred customers on it

**What happened:** By default, Leaflet draws every dot on the map as its own little shape in the page (SVG). That's fine for a handful of dots. With 500+ customers, especially on a phone, it visibly slows down.

**The fix:** Tell the map to draw using a single canvas instead — like painting one picture instead of placing hundreds of individual stickers. One setting change:

```typescript
const map = L.map('map', { preferCanvas: true })
```

This was the single biggest performance improvement in the whole app.

---

## The admin page would flash "please log in" even when you were already logged in

**What happened:** The login system fires two separate signals when the page loads: one saying "here's whatever session already exists," and another, separate check that also confirms the session. They didn't always agree on timing — the page would sometimes act on the first, incomplete signal and briefly kick a logged-in admin back to the login screen before catching up.

**The fix:** Ignore that first, premature signal. Wait for the proper session check to finish, and only trust that one when the page first loads.

```typescript
const initialized = useRef(false)

supabase.auth.onAuthStateChange((_event, session) => {
  if (!initialized.current) return // ignore the early, unreliable signal
})

supabase.auth.getSession().then(({ data: { session } }) => {
  initialized.current = true
  // now it's safe to trust the session
})
```

---

## Logging in didn't always stick

**What happened:** After typing a password and hitting sign in, the app would sometimes redirect to the admin page too fast — before the browser had actually saved the "you're logged in" cookie. The very next check (the one guarding the admin page) would see no cookie and bounce the user straight back to login.

**The fix:** Use a full page reload to go to the admin page after login, instead of an in-app instant redirect. That extra half-second of a full reload gives the browser time to save the cookie first.

---

## The database's master key almost had a way to leak into the browser

**What happened:** This app uses a database "service role" key on the server — a key that can read or write anything, ignoring all the normal permission rules. That's necessary for some admin tasks. But if that key were ever accidentally included in code that runs in the visitor's browser, anyone could open their browser's developer tools and steal it, giving them full access to the database.

**The fix:** Keep that key behind a function that refuses to run anywhere except the server, and make it fail loudly — not silently — if it's ever called from the browser by mistake.

```typescript
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() must not be called in the browser')
  }
  return createClient(url, serviceRoleKey)
}
```

**Rule going forward:** Nothing that touches the service role key gets imported into a page or a component a visitor's browser can see.

---

## Other things worth knowing

- **KMZ boundary files (the territory outlines) are unzipped and read entirely in the browser** — no server upload step needed. KMZ is just a ZIP file containing a map outline (KML); the browser can unzip and read it directly.
- **The login cookie's name depends on which Supabase project you're using.** If the project ever changes, the cookie name changes with it — so the code reads it from the project's web address automatically instead of it being typed in by hand.
- **Mapbox was chosen over the free alternative (OpenStreetMap)** because map detail around Lusaka was noticeably better — for field agents relying on this to find real addresses, that mattered more than saving money.

---

## What I'd do differently next time

- Build the login system in from day one, rather than adding it after most of the app already existed — retrofitting it took longer than building it in from the start would have.
- Use a proper shared state tool (like Zustand or React Context) for things like "which map layers are turned on," instead of tracking that separately in several different components.
- Write the database structure carefully up front — it changed shape too many times as the app grew.
