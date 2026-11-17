# Myanmar Travel Planner — Documentation

This folder is the source of truth for how this project is *meant* to
work. It exists so that any future change — by you, by an AI assistant,
by anyone — can be checked against a real rule instead of guessed at.

**If a change conflicts with something written here, the rule wins.**
Update the rule deliberately, in its own step, before changing code to
match — don't let code drift silently away from what's documented.

## Files in this folder

| File | What it's for |
|---|---|
| `ARCHITECTURE.md` | How data actually flows: catalog vs. user data, the cache pattern, which files own what |
| `BUSINESS_RULES.md` | The product rules — what each page is allowed to do, pricing/quantity math, recommendation logic, notifications |
| `DATABASE.md` | The real Supabase schema, RLS status per table, and the exact app-field ↔ DB-column mapping |
| `DO_NOT_BREAK.md` | A specific list of bugs that were found and fixed once already — read this before touching the areas it names |

## The one-paragraph mental model

Three separate things live in this codebase, and they must stay
separate: the **catalog** (destinations/services/packages — read-only,
public, loaded once at boot from Supabase into `CAT`); **your own data**
(plans/items/saved/feedback/history/notifications — private, loaded
once at login into `USER_DATA`, read synchronously from that cache,
written through real Supabase inserts/updates); and **local-only
UI state** (a handful of preferences that still live in the browser,
listed explicitly in `ARCHITECTURE.md` — everything else moved off
localStorage on purpose).
