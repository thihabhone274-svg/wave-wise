# Do Not Break This Again

Every item here was a real bug, found and fixed once already. Each
one cost real debugging time. This file exists so the next change
doesn't quietly undo the fix.

## Data & money correctness

- **Hotel cost must include nights.** `price × rooms` alone is wrong —
  it was the very first bug reported on this project (a multi-night
  stay budgeted as if it were one night). The only correct formula is
  `price × rooms × nights`, via `Compute.itemLineTotal()`. Never
  recompute a line total inline anywhere else.
- **Never write a date into `start_time`/`end_time`.** Those are TIME
  columns. A hotel checkout date going into `end_time` fails silently
  from the UI's perspective — the insert throws, the item never saves,
  and `plan_items` just stays empty with no obvious cause. This exact
  bug happened once already.
- **`window.X` is not the same as a bare `X` for `const`/`let`
  declarations.** `API`, `Store`, `Compute` etc. are all declared with
  `const` at the top of their files — bare `API.foo()` works
  everywhere, but `window.API` is `undefined`, always, silently. This
  caused a "log in to rate" bug that fired even when logged in. Check
  for `typeof X !== 'undefined'`, never `window.X`, when guarding
  against a script not having loaded yet.

## UI structure

- **A popover nested inside a card can't be fixed with CSS alone** if
  the card uses `overflow:hidden` (every card does, for its rounded
  corners). `display:block` doesn't help if the parent is clipping it.
  Any new popover/tooltip that needs to escape a card's bounds must be
  a floating, `position:fixed` element appended to `<body>` and
  positioned by coordinates — see `js/interactions/reactions.js`'s
  dislike-reason popover for the pattern.
- **A sidebar with `overflow:hidden` will silently eat its own bottom
  content** if it ever grows taller than expected — including its own
  primary action button. Any fixed/sticky panel with variable-height
  content needs `overflow-y:auto` and a `max-height`, not
  `overflow:hidden`.
- **Don't duplicate a whole markup block "to be safe."** Four separate
  bugs this project hit (`Pages.plans` defined twice, a recommendation
  card defined twice, a compare-listing helper defined twice, a
  sidebar's budget section rendered twice) were all the same root
  cause: an edit appended new content instead of replacing old content
  in place. If a function looks like it has two copies of the same
  block back to back, that's a bug, not intentional redundancy.

## Loading order

- **`UserData.load()` cannot run before `CAT` is loaded.** Its
  uuid↔slug lookups are built from the catalog. See
  `ARCHITECTURE.md`'s loading-order section before touching boot
  sequencing in `js/app.js`.
- **A brand new account should have zero plans.** The old local-only
  version seeded every new login with a fake demo trip. That seeding
  was deliberately removed — don't reintroduce a "starter plan" for
  new users.

## Product scope

- **Browse pages never get plan-mutation buttons.** This was reverted
  back into place once already after an over-broad change accidentally
  turned the Destination page into a second planner. See
  BUSINESS_RULES.md §1 — Browse and Plan are two modes, and a page
  belongs to exactly one.
- **Don't remove a working flow to replace it with a "better" one
  without confirming first.** The Build My Trip wizard was once
  replaced wholesale with a destination-page-based flow in the same
  breath as removing its nav link — the user only asked for the nav
  link gone. Small, explicitly-scoped asks stay small.
- **Notifications need a real trigger or they don't get built.** See
  BUSINESS_RULES.md §4. It's tempting to add a plausible-sounding
  notification for a feature that doesn't actually fire one — don't.
