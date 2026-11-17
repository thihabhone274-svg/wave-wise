# Architecture

## The two caches, and why reads are synchronous

Almost every render function in this app reads plan/service data with
a plain, synchronous call (`API.plans.get(id)`, `CAT.services`, etc.) —
nothing awaits a network call mid-render. This is deliberate, not an
oversight, and it must stay true for any future change:

- **`CAT`** (`js/cloud.js`) — the public catalog: destinations,
  providers, services, service variants, packages. Loaded once at boot
  via `loadCloudCatalog()`. Read-only from every page.
- **`USER_DATA`** (`js/cloud-user.js`) — the signed-in user's own data:
  plans, plan items, saved items, feedback, history, notifications.
  Loaded once right after login via `UserData.load()`, *after* `CAT`
  is ready (the mapping below depends on it — see "Loading order").

Every page reads from these two objects directly and synchronously.
**Writes** (`API.plans.create`, `.addItem`, `API.saved.toggle`, etc.)
are `async`, hit Supabase first, and only update the cache after the
write succeeds — so a failed write never silently corrupts what's on
screen.

If you ever need a plan/service list to reflect something not yet in
the cache, the fix is to make the write update the cache correctly —
**not** to make a render function `await` a fresh fetch. That would
require rewriting every caller, and defeats the whole point of this
pattern.

## Loading order (why it's not the obvious order)

```
1. Supabase client created
2. Session restored (window.__MTP_USER set, if logged in)
3. Router.init() — FIRST paint happens here, possibly before CAT/USER_DATA exist
4. CAT loaded from Supabase (loadCloudCatalog) → Router.resolve() (repaint)
5. USER_DATA loaded (UserData.load) — only if step 2 found a user,
   and only now because the uuid↔slug lookups it needs are built
   from CAT, which didn't exist until step 4 → Router.resolve() (repaint)
```

`UserData.load()` cannot run before `CAT` is populated — the
uuid-to-slug lookups (`_refByUuid`, `_destSlugByUuid`) are built by
scanning `CAT.services`/`CAT.destinations`/`CAT.packages`. Moving the
call earlier will make every plan/item silently map to blank names.

## uuid ↔ slug: why both exist, and where

The app's own code uses readable slugs everywhere (`'ngwe-saung'`,
`'thande-beach-ngapali'`) — they're what's in every URL and every
`refId`. Supabase's actual foreign keys are UUIDs. Both directions are
needed:

- Every service/destination/package object in `CAT` carries **both**:
  `id` (slug, used throughout the UI) and `service_uuid` /
  `destination_uuid` / `package_uuid` (the real Supabase primary key,
  used only when writing a row).
- `js/cloud-user.js` builds the **reverse** lookups (uuid → slug) used
  when *reading* rows back from Supabase, so a `plan_items.service_id`
  (uuid) becomes a `refId` (slug) the rest of the app already knows
  how to use.

If you add a new catalog table or a new place that writes to Supabase,
follow this same pattern — don't invent a third id format.

## Field mapping is intentional — see DATABASE.md

`js/api.js` and `js/cloud-user.js` translate between the app's
camelCase field names (`startDate`, `selectedUnitPrice`, `qty`) and
the database's snake_case columns (`start_date`,
`selected_unit_price`, `quantity`) at the boundary, in one place. Page
code never sees a raw DB row — this is what let the entire real-data
migration happen without touching `build.js`, `engage.js`, or the
planner drawer at all. Keep it that way: if a new field is needed,
add it to the mapping functions, not to render code.

## What's still local-only, on purpose

Not everything moved to Supabase — these are deliberately still
browser-only (localStorage via `js/core/storage.js`), and were left
that way rather than migrated blind:

- **`tracking`** (official-website-click history) — maps to the
  unused `external_actions` table; not migrated yet.
- A handful of **preferences/settings** values in Settings.

If you migrate these, follow the exact same pattern as
`plans`/`saved`/`feedback`/`history`/`notifications`: add RLS, add a
mapper in `cloud-user.js`, rewrite the `api.js` methods, leave every
calling page untouched.

## File map

| File | Owns |
|---|---|
| `js/cloud.js` | Loading the public catalog (`CAT`) |
| `js/cloud-user.js` | Loading + mapping the user's own Supabase data (`USER_DATA`) |
| `js/api.js` | Every read/write the rest of the app calls — the only file that should contain a Supabase query |
| `js/store.js` | Budget/total math (`Compute`), the active-plan snapshot used by every sidebar |
| `js/components.js` | Shared card-building blocks (`serviceCard`, `serviceRow`, `_saveHeartBtn`, `_ratingPill`, `_thumbRow`) |
| `js/interactions/reactions.js` | Public like/dislike (its own Supabase table, `service_reactions`) |
| `js/interactions/planner-drawer.js` | The "view details + set quantity" panel used only inside Build My Trip |
| `js/pages/*.js` | One file per route; should call `API.*`/`Compute.*`, never touch Supabase or localStorage directly |
