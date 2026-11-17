# Database

## Tables in real use, and their RLS status

| Table | Used for | RLS | Policy shape |
|---|---|---|---|
| `destinations`, `providers`, `service_categories`, `amenities`, `service_amenities`, `service_variants`, `restaurant_details`, `services`, `packages`, `package_inclusions`, `package_days` | Public catalog (`CAT`) | Public read | No owner check — this is meant to be visible to everyone, logged in or not |
| `profiles` | Name/phone/country | Owner-only | `auth.uid() = user_id` |
| `travel_plans` | Plans | Owner-only | `auth.uid() = user_id`, all 4 operations |
| `plan_items` | Items within a plan | Owner-only, via parent | No `user_id` column — every policy checks `plan_id in (select plan_id from travel_plans where user_id = auth.uid())` |
| `saved_items` | Favorites | Owner-only | `auth.uid() = user_id` (no update policy — only insert/select/delete) |
| `feedback` | Dislike reasons | Owner-only | `auth.uid() = user_id`; delete is a soft-delete (`deleted_at`), not a real row delete |
| `history_events` | Activity log | Owner-only, select + insert only | No update/delete policy — a log should not be editable by the client |
| `notifications` | Real, event-driven notifications | Owner-only | `auth.uid() = user_id`, all 4 operations |
| `service_reactions` | Public like/dislike | **Public read**, owner write | Reads are public on purpose — even a logged-out visitor should see "24 people liked this" |

**Not yet used by the app:** `user_preferences`, `user_preferred_destinations`,
`external_actions`, `private_shelf` (the last one is a legacy blob
mirror for the handful of fields still local-only — see
`ARCHITECTURE.md`).

Migration SQL for everything above lives in the project's chat history
under these filenames — re-run any of them is safe (uses
`create policy` guarded by table existence; re-running a policy that
already exists will error harmlessly, drop it first if re-applying):
`real_persistence_migration.sql`, `notifications_migration.sql`,
`service_reactions_migration.sql`.

## Field mapping — app shape ↔ DB columns

This is the exact translation `js/api.js` (writing) and
`js/cloud-user.js` (reading) perform. If a page-level bug looks like
"the right data went in but the wrong thing came back out," check
here first before touching page code.

### `travel_plans` ↔ plan object
| App field | DB column | Notes |
|---|---|---|
| `id` | `plan_id` | |
| `name` | `plan_name` | |
| `destination` | `destination_id` | **slug ↔ uuid** — see ARCHITECTURE.md |
| `startDate` / `endDate` | `start_date` / `end_date` | |
| `travelers` | `traveler_count` | |
| `budget` | `total_budget` | |
| `travelGroup` | `group_type` | |
| `purpose` | `purpose` | |
| `status` | `status` | |

### `plan_items` ↔ item object
| App field | DB column | Notes |
|---|---|---|
| `id` | `plan_item_id` | |
| `refId` | `service_id` or `package_id` | **uuid ↔ slug**, resolved via `_refByUuid` |
| `name` | `service_name_snapshot` | |
| `category` | `category_snapshot` | |
| `qty` / `quantity` | `quantity` | For hotels: **rooms**, not nights — see BUSINESS_RULES.md |
| `selectedUnitPrice` | `selected_unit_price` | |
| `selectedTotalPrice` | `selected_total_price` | Always explicitly computed and sent — never left to the DB's naive `quantity × unit_price` default, which doesn't know about nights |
| `direction` | `leg` | `'out'` / `'back'` only; schema also allows `'stay'`/`'visit'`, unused so far |
| `date` | `planned_date` | Hotel check-in date |
| `startTime` / `endTime` | `start_time` / `end_time` | **TIME columns — time of day only.** Never write a date here. Hotels leave both null. |
| — | `notes` | Hotels only: `"nights=N"`. Parsed by `Compute.itemNights()`, nowhere else. |
| `variant_id` | `variant_id` | Raw uuid, already correct from `CAT` — no conversion needed |

### `saved_items` ↔ saved array
A flat array of slugs app-side (`USER_DATA.saved`). On write, item type
(`destination`/`service`/`package`) is detected by checking which
`CAT` list the id belongs to (`_savedItemType()` in `js/api.js`), then
the matching uuid column is populated and the other two left null.

### `feedback` ↔ feedback object
`refName` is **not** a stored column — there's no snapshot field for
it in this table. It's resolved live from `CAT` at read time
(`_mapFeedbackRow`). If you ever see a blank feedback name after a
service is removed from the catalog, that's why — expected, not a bug.

### `notifications` ↔ notification object
`kind` (used by the bell UI: info/warning/offer) doesn't exist in the
DB — every real trigger this app fires is plan-related, so
`_mapNotifRow` always maps to `kind: 'warning'` (the "Plan Updates"
tab). If a genuinely different kind of notification is ever added,
extend the mapping there, not by inventing a new DB column.
