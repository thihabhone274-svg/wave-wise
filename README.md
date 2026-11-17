# Wave Wise

An AI-assisted travel-planning prototype built with HTML, CSS, JavaScript, and Supabase. Explore destinations and services, compare options, and build a trip around dates, travellers, and a budget.

**Status:** learning prototype. This was the project owner's first experience connecting an application to a hosted backend. Live database configuration and end-to-end workflows have not been verified for this repository preparation.

## Project contribution and learning

The project was developed using multiple free AI tools to support implementation. The owner directed requirements and UI/UX iterations and is learning to understand and maintain the generated code. Areas explored include user workflows, explicit pricing rules, database integration, testing, and evaluating AI-generated solutions. This is not a claim of independent mastery of every implementation detail.

## Features represented in the source

- Destination, service, and package browsing with filtering and comparison.
- Guest browsing and Supabase account authentication.
- Trip planning with dates, travellers, and budget.
- Hotel pricing that distinguishes rooms from nights.
- Activity timing and overlap checks.
- Saved items, feedback, history, and plan notifications.
- Mobile navigation, guided interactions, and visual themes.

These are implemented code paths, not a guarantee that every live workflow is currently operational.

## Technology

Vanilla JavaScript, HTML, CSS, Supabase JavaScript SDK, and Leaflet. Dependencies are loaded from CDNs; internet access is required. No frontend build step is configured.

## Run locally

1. Download or clone the repository and preserve its folders.
2. Supply a Supabase project URL and **publishable** key in `js/cloud.js`, replacing the placeholders. Never put a secret/service-role key in browser code.
3. The backend must contain the tables and access policies described in [docs/DATABASE.md](docs/DATABASE.md). **The original SQL migrations are missing from this source package**, so a complete independent backend setup is not yet reproducible from this repository alone.
4. Serve the folder using a local static server, for example VS Code Live Server, or run `python -m http.server 8000` and open `http://localhost:8000`.
5. Explore as a guest or use an account on your configured backend.

Without a configured backend, the interface can load but the catalog and account features will not be fully available. No offline demo dataset is included.

## File map

| Path | Responsibility |
| --- | --- |
| `index.html` | App shell and script loading |
| `css/ui-theme.css` | Styling and responsive rules |
| `js/tidewell-ui.js` | Current navigation, screens, interactions, and startup |
| `js/api.js` | Application data operations and authentication |
| `js/cloud.js` | Supabase configuration and catalog loading |
| `js/cloud-user.js` | Mapping and caching account data |
| `js/store.js` | Planner state, pricing, and scheduling calculations |
| `js/sync.js`, `js/core/storage.js` | Supporting persistence utilities |
| `js/interactions/reactions.js` | Service reactions |
| `assets/` | Brand and interface images |
| `docs/` | Design rules and technical notes |
| `tests/` | Activity timing regression tests |

## Tests

With Node.js installed:

```sh
node --test tests/planner_activity_timing.test.js
```

The included tests cover activity time normalisation and overlap detection. They do not cover authentication, database policies, pricing, or complete user journeys.

## Known limitations

- SQL migrations and sample catalog data need to be recovered for reproducible setup.
- Live Supabase access policies have not been verified from this code package.
- The contact form currently shows a success notification without sending a message.
- Terms and privacy links are placeholders.
- The large UI file would benefit from gradual modularisation.
- Some original documentation describes an older file layout. Use the map above for this version.
- Recommendation logic uses rules and budget ranges; it is not a machine-learning model.

## Next improvements

Recover backend setup scripts, add fictional demo data and screenshots, verify a complete planning workflow, improve error/empty states, and extend tests around budget calculations and account data separation.
