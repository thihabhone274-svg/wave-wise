# Business Rules

These are decisions, not defaults — each one was chosen deliberately
over an alternative. Changing one is fine; changing one *by accident*
while working on something else is what this file exists to prevent.

## 1. What each page is allowed to do

The site has exactly two modes, and a page belongs to one or the
other — never both:

| Mode | Pages | Allowed | Never |
|---|---|---|---|
| **Browse** | Explore, Destination, Filter Services, Package, Compare, Restaurant guide | View, like/dislike, save, compare, link to official site | "Add to Trip", quantity, any plan mutation |
| **Plan** | Build My Trip only (`#/build`) | Everything in Browse, plus adding services with quantity, via the planner drawer | — |

A Destination page is **pure browse** — it does not show a trip
banner, a "start planning" CTA, or a recommendation rail tied to an
active plan. That was tried and deliberately reverted. If you want a
plan-aware destination page again, that's a real product decision to
make explicitly, not a side effect of another change.

**Packages** are pre-made trips from providers — compare and link to
their official site only. They are never part of "build your own
trip" and never mixed into the individual-services filter page.

## 2. Quantity is never guessed silently

Every quantity field is a real, editable number the traveller sets —
never a hidden multiply the UI doesn't show. What "quantity" *means*
is derived from the service's `pricing_type` (already in the schema),
not hardcoded per category:

| `pricing_type` | Quantity means | Default suggestion |
|---|---|---|
| `per_night` (hotels) | Number of **rooms** | `ceil(travelers ÷ room capacity)` |
| `per_way_per_person` | Number of tickets, one leg | Number of travelers |
| `per_person` | Number of participants | Number of travelers |
| `per_stay` / other | A single unit (private car, etc.) | 1 |

**Hotels get a second, separate field: Nights.** Rooms × Nights are
two different numbers a traveller sets independently — never combine
them into one "quantity" input. A hotel line's real cost is:

```
price (per room per night) × rooms × nights
```

Nights default to the whole trip length, but can be set shorter (a
partial stay). The chosen night count is stored in `plan_items.notes`
as `nights=N` (see DATABASE.md for why — `end_time` is a TIME column
and cannot hold a checkout date). `Compute.itemNights()` is the only
place that should ever parse this — don't re-derive nights anywhere
else.

**Never reintroduce `qty = nights × travelers`.** That formula was
the original bug report that started this project's audit — it
overcharges by a factor of trip length. `Compute.itemLineTotal()` and
`Compute.itemNights()` in `js/store.js` are the single source of truth
for what a plan item actually costs; every page that shows a total
must call through them, not recompute price × qty inline.

## 3. Recommendations are budget-percentage-driven, not personality-driven

`Compute.recommendations()` in `js/store.js` scores services against a
rough spend split — a *starting point*, never a hard rule the
traveller can't override:

- **Hotel**: ~40–60% of the whole budget, across the whole stay
  (`price × nights`, assuming one room — the common case)
- **Transport**: ~12–32% of the whole budget, round trip, every
  traveller (`price × travelers × 2`)
- **Activity**: ~8–20% of the whole budget, *per activity* (not the
  trip total)

These bands were calibrated against a worked example (a couple,
400,000 MMK, 3 nights) and should be re-validated against a real
example like that one if you change them, not tuned by feel.

Traveller count also affects hotel matching directly: a group of 5+
gets boosted toward rooms whose `capacity` (from `service_variants`)
actually fits — checked by capacity, not by whether "Family" was
picked as the trip style. A group of 5 friends needs the same room a
family of 5 would.

## 4. Notifications are event-driven, or they don't exist

There are exactly three triggers, defined in `API.notifications` in
`js/api.js`, and no others:

1. **Trip confirmed** — fires once, when a plan's status first becomes
   active/confirmed (checked against its previous status).
2. **Budget exceeded** — fires once, on the exact addition that pushes
   the plan's real total (via `Compute.total`, nights-aware) over
   budget — not on every add while already over.
3. **Trip starting soon** — a plan starting within 3 days that's still
   missing a hotel or a return leg. De-duplicated per plan so it
   doesn't repeat every login.

**Do not add a notification "just to fill out the feature."** The
project's own history includes an entire fake notification system —
seeded once with demo content, no real trigger, silently never
updated — that looked complete and wasn't. If a new trigger is
genuinely useful, it needs a real, specific event to fire on, exactly
like the three above.

## 5. One card component per context, not five

Card rendering is intentionally consolidated:

- `UI.serviceCard` / `UI.serviceRow` (`js/components.js`) — browse
  contexts (grid vs. row layout)
- The Build wizard's own card (`js/pages/build.js`) — planning
  context (variants, quantity affordance)
- The restaurant card and the recommendation-rail card — their own
  layouts, for real structural reasons (menu accordion; horizontal
  scroll rail)

All of them share `_saveHeartBtn()` and `_ratingPill()`
(`js/components.js`) for the save-heart and rating badge — **never
inline that markup again**. Two near-identical copies of the same
button already drifted out of sync once (one silently missing
`event.stopPropagation()`) before this consolidation caught it.
