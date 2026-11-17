
/* ================================================================
   TIDEWELL — UI CONCEPT (front-end only, simulated sample data)
   No backend, no network calls, no persistence beyond this tab.
   Mirrors the real product's business rules (see project docs):
   - Browse pages (Explore/Destination/Services/Packages/Compare/
     Restaurants) never mutate a plan — no qty, no "Add to Trip".
   - Only Build My Trip adds items, via a drawer that sets an
     explicit, editable quantity (never a silent nights×travelers).
   - Hotels get two independent numbers: Rooms and Nights.
   - Restaurants are reference-only and never enter a budget.
   - Notifications are event-driven (3 kinds), not decorative.
   ================================================================ */
"use strict";

/* ---------------- ICONS (single inline SVG source, painted via data-icon) ---------------- */
const ICONS = {
compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
chevronL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
chevronR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
chevronD:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
arrowR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
arrowL:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 5 5 12 12 19"/></svg>',
pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/><path d="M18 12a2 2 0 0 0 0 4h3v-4Z"/></svg>',
building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="12" x2="9" y2="12.01"/><line x1="15" y1="12" x2="15" y2="12.01"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
bus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/><path d="M3 11h18"/></svg>',
waves:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0"/><path d="M2 12c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0"/><path d="M2 18c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0"/></svg>',
sunwave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9.5" r="4"/><path d="M2 16.5c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0"/><path d="M2 20.5c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0 3.5-1.5 5 0 3.5 1.5 5 0"/></svg>',
utensils:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2s2-.9 2-2V2M5 11v11M17 2v20M17 2c-2.5 0-4 2-4 5s1.5 5 4 5"/></svg>',
box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
star:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
bookmark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4-6 4V4.5a1 1 0 0 1 1-1Z"/></svg>',
check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
minus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
external:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8.01"/></svg>',
help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>',
compare:'<img src="assets/compare-icon.png" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">',
alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17.01"/></svg>',
map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
clipboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
history:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>',
sliders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
sparkles:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>',
target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>',
layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>',
logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
bed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>',
wifi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>',
pool:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c1.5 0 1.5 1.5 3 1.5S6.5 18 8 18s1.5 1.5 3 1.5S12.5 18 14 18s1.5 1.5 3 1.5 1.5-1.5 3-1.5"/><path d="M7 14V6a2 2 0 0 1 4 0"/></svg>',
snow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 7 12 13 22 7"/></svg>',
globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>',
clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.99.36 1.96.68 2.9a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.18-1.18a2 2 0 0 1 2.11-.45c.94.32 1.91.55 2.9.68A2 2 0 0 1 22 16.92Z"/></svg>',
badge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><path d="M12 3c1.2 0 2.4.6 3 1.7 1.3-.3 2.7.1 3.6 1.1 1 1 1.4 2.3 1.1 3.6C20.9 9.9 21 11.2 21 12c0 1.2-.6 2.4-1.7 3 .3 1.3-.1 2.7-1.1 3.6-1 1-2.3 1.4-3.6 1.1-.6 1.1-1.8 1.7-3 1.7s-2.4-.6-3-1.7c-1.3.3-2.7-.1-3.6-1.1-1-1-1.4-2.3-1.1-3.6C3.6 14.4 3 13.2 3 12c0-1.2.6-2.4 1.7-3-.3-1.3.1-2.7 1.1-3.6C6.9 4.4 8.2 4 9.6 4.3 10.2 3.2 11.2 3 12 3Z"/></svg>',
tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13 21l-9-9V3h9l7.59 7.59a2 2 0 0 1 0 2.82Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>',
eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>',
eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.7 18.7 0 0 1 4.22-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
thumbUp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>',
thumbDown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>',
};
function paintIcons(root){ (root||document).querySelectorAll('[data-icon]').forEach(function(el){ var n=el.getAttribute('data-icon'); if(ICONS[n]) el.innerHTML=ICONS[n]; }); }
function ic(name,cls){ return '<i data-icon="'+name+'" class="'+(cls||'')+'"></i>'; }
/* js/interactions/reactions.js (real engine, untouched) calls a global
   showToast(msg,kind) on the login-required and save-error paths —
   that function only ever existed in the old UI. Aliasing it to this
   UI's own UI.toast (same signature) so those two real code paths
   don't throw a ReferenceError instead of showing a message. */
window.showToast=function(msg,kind){ UI.toast(msg,kind); };

/* ---------------- animated wave background (slow, seamless-tiling) ---------------- */
function _waveD(period,amp,baseline,height){ var pts=[],step=40;
  for(var x=0;x<=2*period;x+=step){ var y=baseline+amp*Math.sin((x/period)*2*Math.PI); pts.push(x.toFixed(0)+','+y.toFixed(1)); }
  return 'M0,'+height+' L'+pts.join(' L')+' L'+(2*period)+','+height+' L0,'+height+' Z'; }
function waveBG(){
  var P=1440,H=200;
  return '<div class="wave-bg" aria-hidden="true">'
    +'<svg class="w3" viewBox="0 0 '+(2*P)+' '+H+'" preserveAspectRatio="none"><path class="w3" d="'+_waveD(P,26,150,H)+'"/></svg>'
    +'<svg class="w2" viewBox="0 0 '+(2*P)+' '+H+'" preserveAspectRatio="none"><path class="w2" d="'+_waveD(P,18,165,H)+'"/></svg>'
    +'<svg class="w1" viewBox="0 0 '+(2*P)+' '+H+'" preserveAspectRatio="none"><path class="w1" d="'+_waveD(P,14,178,H)+'"/></svg>'
    +'</div>';
}

/* ---------------- illustrated beach scene (self-contained, no photos) ----------------
   Layered flat-illustration: sky gradient, sun/glow, sea gradient, distant hills,
   palm silhouette, longtail boat, gulls. Used only on hero-level surfaces
   (Explore hero, Auth panels) so those pages read as "beach", not app chrome. */
var _sceneSeq=0;
function beachScene(variant,opts){
  opts=opts||{}; _sceneSeq++;
  var uid='sc'+_sceneSeq;
  var PAL={
    dusk:   {sky:['#12202f','#5c3c56','#d97a4e','#ffbb66'], sea:['#0a2f3d','#1c6c78'],  sun:'#ffd98a', glow:'#ff9a5a', hill:'#0d3446', wave:'rgba(255,255,255,.20)', palm:'#0a1d27', boat:'#0a1d27', sunY:270},
    dusk2:  {sky:['#0e1b28','#4a3552','#c96a4e','#f2a35c'], sea:['#082a37','#155a68'],  sun:'#ffe0a0', glow:'#ff8a5a', hill:'#0a2b39', wave:'rgba(255,255,255,.18)', palm:'#0a1a24', boat:'#0a1a24', sunY:255},
    midday: {sky:['#8fd0e6','#c9ecf2','#eef9fb'],           sea:['#0f6e86','#4bc2cf'],  sun:'#fff8e0', glow:'#ffe9a8', hill:'#0d5468', wave:'rgba(255,255,255,.40)', palm:'#0d3446', boat:'#123244', sunY:110},
    dawn:   {sky:['#1a2a3d','#3d4f6e','#e8b08a','#ffe1b0'], sea:['#123049','#2c7f8c'],  sun:'#fff1c9', glow:'#ffcf8a', hill:'#0f3a4d', wave:'rgba(255,255,255,.22)', palm:'#0c2230', boat:'#0c2230', sunY:230}
  };
  var p=PAL[variant]||PAL.dusk;
  var W=900,H=560,seaTop=H*0.52;
  var sky=p.sky.map(function(c,i){ return '<stop offset="'+(i/(p.sky.length-1)*100).toFixed(0)+'%" stop-color="'+c+'"/>'; }).join('');
  var sea=p.sea.map(function(c,i){ return '<stop offset="'+(i/(p.sea.length-1)*100).toFixed(0)+'%" stop-color="'+c+'"/>'; }).join('');
  var sunCx=opts.sunRight?W*0.78:W*0.32, sunCy=p.sunY;
  var glowRings=[150,110,74,44].map(function(r,i){ return '<circle cx="'+sunCx+'" cy="'+sunCy+'" r="'+r+'" fill="'+p.glow+'" opacity="'+(0.06+i*0.055).toFixed(2)+'"/>'; }).join('');
  // animated rings that expand outward from the sun and fade — new layer emerges as the
  // last dissolves, staggered so the light reads as continuously radiating, not static
  var sunRays=[0,1.3,2.6,3.9].map(function(delay,i){ return '<circle class="sun-ray" cx="'+sunCx+'" cy="'+sunCy+'" r="'+(30+i)+'" stroke="'+p.sun+'" style="animation-delay:'+delay+'s"/>'; }).join('');
  var birdColor='rgba(255,255,255,.82)';
  var birds=[[W*0.16,88,6.4,0,.98],[W*0.25,66,7.1,.9,.84]].map(function(b){
    var cx=b[0],cy=b[1],glideDur=b[2],glideDelay=b[3],scale=b[4],flapDur=(.82+ (b[3]*.18)).toFixed(2);
    return '<g class="bird-glide" style="animation-duration:'+glideDur+'s;animation-delay:'+glideDelay+'s"><g transform="translate('+cx+','+cy+') scale('+scale+')">'
      +'<ellipse cx="0" cy="0" rx="3" ry="1.8" fill="'+birdColor+'"/>'
      +'<path class="bird-wing-l" d="M0,0 C-9,-8 -18,-8 -27,-2" stroke="'+birdColor+'" stroke-width="2.6" fill="none" stroke-linecap="round" style="animation-duration:'+flapDur+'s"/>'
      +'<path class="bird-wing-r" d="M0,0 C9,-8 18,-8 27,-2" stroke="'+birdColor+'" stroke-width="2.6" fill="none" stroke-linecap="round" style="animation-duration:'+flapDur+'s"/>'
      +'</g></g>'; }).join('');
  // sun's shimmering reflection column on the water — the classic sunset-over-sea cue
  var reflect=Array.from({length:10},function(_,i){
    var yy=seaTop+16+i*((H-seaTop-20)/10), w=14+i*9, xOff=(i%2?7:-7)*(1-i/14);
    var op=(0.55-i*0.05).toFixed(2);
    return '<rect x="'+(sunCx-w/2+xOff).toFixed(0)+'" y="'+yy.toFixed(0)+'" width="'+w.toFixed(0)+'" height="5" rx="2.5" fill="'+p.sun+'" opacity="'+Math.max(.06,op)+'"/>'; }).join('');
  // wave bands on the sea (static, layered under the animated .wave-bg foam on top)
  var bands=[0,1,2].map(function(i){ var yy=seaTop+40+i*46, amp=10-i*2;
    var d='M0,'+yy+' '+Array.from({length:10},function(_,k){ var x=k*W/9; var y=yy+Math.sin(k)*amp; return 'L'+x.toFixed(0)+','+y.toFixed(0); }).join(' ');
    return '<g class="sea-band-g" style="animation-duration:'+(5+i*1.1)+'s;animation-delay:'+(i*.6)+'s"><path class="sea-wave-line" d="'+d+'" stroke="'+p.wave+'" stroke-width="2" fill="none" style="animation-duration:'+(6.5+i*1.4)+'s'+(i%2?';animation-direction:reverse':'')+'"/></g>'; }).join('');
  // small twinkling glints where the sun catches the moving water
  var glints=Array.from({length:7},function(_,i){
    var gx=(sunCx+(i-3)*44+(i%2?18:-10)+W)%W, gy=seaTop+30+((i*37)%(H-seaTop-40));
    return '<circle class="sea-glint" cx="'+gx.toFixed(0)+'" cy="'+gy.toFixed(0)+'" r="'+(1.4+(i%3)*.5).toFixed(1)+'" style="animation-duration:'+(2.6+(i%4)*.5)+'s;animation-delay:'+(i*.45)+'s"/>'; }).join('');
  // palm silhouette (trunk + 5 fronds) bottom-left
  var palmX=opts.palmRight?W*0.86:W*0.1, palmBase=H-4;
  var fronds=[-70,-35,0,35,70].map(function(a){ var rad=a*Math.PI/180;
    var x2=palmX+Math.sin(rad)*95, y2=(palmBase-150)-Math.cos(rad)*70;
    return '<path d="M'+palmX+','+(palmBase-150)+' Q'+(palmX+Math.sin(rad)*55)+','+((palmBase-150)-Math.cos(rad)*95)+' '+x2.toFixed(0)+','+y2.toFixed(0)+'" stroke="'+p.palm+'" stroke-width="9" fill="none" stroke-linecap="round"/>'; }).join('');
  var palm='<path d="M'+palmX+','+palmBase+' C'+(palmX-6)+','+(palmBase-70)+' '+(palmX+18)+','+(palmBase-110)+' '+palmX+','+(palmBase-150)+'" stroke="'+p.palm+'" stroke-width="14" fill="none" stroke-linecap="round"/>'+fronds;
  // longtail boat silhouette on the water
  var boatX=opts.boatX||W*0.56, boatY=seaTop+90;
  var boat='<g transform="translate('+boatX+','+boatY+')">'
    +'<path d="M-58,10 Q0,32 70,8 L64,20 Q0,40 -52,22 Z" fill="'+p.boat+'"/>'
    +'<line x1="6" y1="10" x2="6" y2="-46" stroke="'+p.boat+'" stroke-width="3"/>'
    +'<line x1="6" y1="-40" x2="46" y2="-58" stroke="'+p.boat+'" stroke-width="3"/>'
    +'</g>';
  return '<div class="beach-scene" aria-hidden="true"><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice">'
    +'<defs><linearGradient id="'+uid+'sky" x1="0" y1="0" x2="0" y2="1">'+sky+'</linearGradient>'
    +'<linearGradient id="'+uid+'sea" x1="0" y1="0" x2="0" y2="1">'+sea+'</linearGradient></defs>'
    +'<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="url(#'+uid+'sky)"/>'
    +glowRings+sunRays+'<circle cx="'+sunCx+'" cy="'+sunCy+'" r="38" fill="'+p.sun+'"/>'
    +birds
    +'<path d="M0,'+(seaTop+18)+' Q'+(W*0.25)+','+(seaTop-6)+' '+(W*0.5)+','+(seaTop+10)+' T'+W+','+(seaTop+4)+' V'+H+' H0 Z" fill="'+p.hill+'" opacity=".55"/>'
    +'<rect x="0" y="'+seaTop+'" width="'+W+'" height="'+(H-seaTop)+'" fill="url(#'+uid+'sea)"/>'
    +reflect+bands+glints+boat+palm
    +'</svg></div>';
}

/* ================================================================
   SAMPLE / SIMULATED DATA — stands in for the real Supabase catalog
   (CAT) and per-user data (USER_DATA). Shapes mirror the real field
   names (pricing_type, roomTypes/officialSchedules, etc.) so the
   layouts below reflect real system logic, not invented structure.
   ================================================================ */
/* CAT_ICON/CAT_COLOR intentionally not declared here — using the real
   ones from js/store.js (window.CAT_ICON / window.CAT_COLOR), which
   are identical in shape and, for CAT_ICON, identical values too. */
const CAT_VAR  = {Hotel:'Hotel',Transport:'Transport',Restaurant:'Restaurant',Activity:'Activity',Package:'Package'};

function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
function money(n){ n=Math.round(Number(n)||0); return n.toLocaleString('en-US'); }

/* ================================================================
   REAL DATA SHIM — the design concept below was built against a
   hardcoded sample catalog with the exact field shape cloud.js
   already produces from Supabase (see docs/UI_INTEGRATION.md).
   These four names are consumed as plain arrays everywhere below,
   so instead of touching every call site we just make the names
   themselves resolve to the live catalog. No page template changes.
   ================================================================ */
function DESTINATIONS_(){ return API.destinations.list(); }
function SERVICES_(){ return API.services.list(); }
function PACKAGES_(){ return API.packages.list(); }
Object.defineProperty(window,'DESTINATIONS',{get:function(){ return API.destinations.list(); }});
Object.defineProperty(window,'SERVICES',{get:function(){ return API.services.list(); }});
Object.defineProperty(window,'PACKAGES',{get:function(){ return API.packages.list(); }});
/* end shim — deleted-below: the old SERVICES=[...] sample array */

function svcById(id){ return SERVICES.find(s=>s.id===id); }
function pkgById(id){ return PACKAGES.find(p=>p.id===id); }
function destById(id){ return DESTINATIONS.find(d=>d.id===id) || {id:id||'',name:'Unknown destination',region:'',bestFor:'',description:''}; }
/* Compute (js/store.js, real engine) has total/budgetState/warnings/
   itemLineTotal but no snapshot(plan) — only Store.snapshot() does,
   and only for whichever plan Store currently has loaded. Several
   pages need a full snapshot for an arbitrary plan, so this wraps
   the exact same real primitives (no formula reimplemented) into the
   same shape Store.snapshot() returns. */
function computeSnapshot(plan){
  if(!plan) return {plan:null,items:[],activeItems:[],total:0,budget:0,left:0,over:false,pct:0,warnings:[],byCategory:{}};
  const items=plan.items||[];
  const active=items.filter(i=>i.item_status!=='failed'&&i.item_status!=='disliked');
  const bs=Compute.budgetState(items,plan.budget||0,plan);
  const byCategory={};
  active.forEach(i=>{ byCategory[i.category]=(byCategory[i.category]||0)+Compute.itemLineTotal(i,plan); });
  return {plan,items,activeItems:active,total:bs.total,budget:bs.budget,left:bs.left,over:bs.over,pct:bs.pct,warnings:Compute.warnings(plan),byCategory};
}
function anyById(id){ return svcById(id)||pkgById(id)||null; }
function providerName(k){ var p=API.providers.get(k); return p?p.name:''; }

/* ================================================================
   REAL USER STATE SHIM. The concept below was written against a
   fake in-memory `State` object standing in for USER_DATA. Every
   page still says "State.plans", "State.saved" etc. — untouched —
   these getters/setters just make those names point at the live,
   Supabase-backed API/Store/Compute engine (js/api.js, js/store.js)
   instead of local sample data. `Compute` and `CAT_ICON`/`CAT_COLOR`
   are intentionally NOT redeclared here — the real ones from
   js/store.js (loaded earlier) are used as-is, business-rule math
   untouched, matching js/store.js exactly.
   ================================================================ */
const State = { compare:new Set(), compareKind:'services', theme:'night' };
Object.defineProperties(State,{
  isGuest:{ get:function(){ return !API.getCurrentUser(); } },
  plans:{ get:function(){ return API.plans.list(); } },
  activePlanId:{ get:function(){ return API.plans.activeId(); }, set:function(id){ API.plans.setActive(id); Store.load(id); } },
  saved:{ get:function(){ return API.saved.list(); } },
  feedback:{ get:function(){ return API.feedback.list(); } },
  history:{ get:function(){ return API.history.list(); } },
  notifications:{ get:function(){ return API.notifications.list(); } }
});
function activePlan(){ return API.plans.get(API.plans.activeId()); }
/* Jump to whatever a history/notification entry is actually about —
   a plan, a service, a restaurant or a package — used so History and
   Notifications rows are real links back into the app, not dead text. */
function goToRef(refId){
  if(!refId) return false;
  const s=svcById(refId); if(s){ Nav.go(s.category==='Restaurant'?'restaurant':'service',refId); return true; }
  const p=pkgById(refId); if(p){ Nav.go('package',refId); return true; }
  return false;
}
function goToEntry(e){
  if(!e) return;
  const pid=e.planId||e.plan_id;
  if(pid && State.plans.some(p=>p.id===pid)){ Nav.go('plan',pid); return; }
  if(e.refId && goToRef(e.refId)) return;
  UI.toast('That item is no longer available','info');
}

/* ================================================================
   UI HELPERS — toasts, poster media, stars, badges, shared cards
   ================================================================ */
const UI = {
  toast(msg,kind){ kind=kind||'info'; const host=document.getElementById('toastHost');
    const el=document.createElement('div'); el.className='toast '+kind;
    const iconName=kind==='success'?'check':(kind==='error'?'alert':'info');
    el.innerHTML=ic(iconName)+'<span>'+esc(msg)+'</span>'; host.appendChild(el); paintIcons(el);
    setTimeout(()=>{ el.style.transition='opacity .35s,transform .35s'; el.style.opacity='0'; el.style.transform='translateY(8px)'; setTimeout(()=>el.remove(),350); },3200); },
  toggleSidebar(){ const sb=document.getElementById('sidebar'); sb.classList.toggle('collapsed');
    const collapsed=sb.classList.contains('collapsed');
    try{ localStorage.setItem('tidewell-sidebar', collapsed?'collapsed':'open'); }catch(e){} },
  toggleSidebarMobile(){ this.toast('Open the bottom navigation to switch sections','info'); },
  setTheme(mode){ document.documentElement.setAttribute('data-theme',mode); State.theme=mode;
    try{ localStorage.setItem('tidewell-theme',mode); }catch(e){}
    Nav.refresh();
    this.toast(mode==='day'?'Switched to Day mode':'Switched to Night mode','success'); },
  stars(rating){ const r=Math.round((+rating||0)); let h=''; for(let i=0;i<5;i++){ h+='<span class="rate-star" style="color:'+(i<r?'var(--warn)':'var(--line-2)')+'">'+ICONS.star+'</span>'; } return '<span class="rate-stars">'+h+'</span>'; },
  ratingRow(item,size){ const has=!!item.rating; const style=size==='sm'?'font-size:.78rem':'font-size:.8rem';
    return '<div style="display:flex;align-items:center;gap:6px;'+style+';font-weight:700">'+this.stars(item.rating)
      +(has?'<span>'+item.rating+'</span><span style="color:var(--faint);font-weight:600">('+(item.reviews||0)+')</span>'
           :'<span style="color:var(--faint);font-weight:600">No ratings yet</span>')+'</div>'; },
  catBadge(cat){ return '<span class="badge badge-cat" style="background:'+(CAT_COLOR[cat]||'#64748b')+'">'+ic(CAT_ICON[cat]||'tag')+esc(cat)+'</span>'; },
  price(p,unit){ return '<span class="price">'+money(p)+' <small>'+esc(unit||'MMK')+'</small></span>'; },
  posterWM(cat){ return {Hotel:'building',Transport:'bus',Activity:'waves',Restaurant:'utensils',Package:'box',Destination:'pin'}[cat]||'pin'; },
  poster(item,catOverride,heightCss){
    const cat=catOverride||item.category||'Destination';
    const wm=this.posterWM(cat);
    const img=item&&item.image;
    if(img){
      return '<div class="poster poster-cat-'+cat+'" style="'+(heightCss||'height:100%')+'">'
        +'<img src="'+esc(img)+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'poster-noimg\')">'
        +'<span class="poster-wm poster-wm-sm">'+ICONS[wm]+'</span><div class="poster-scrim"></div></div>';
    }
    return '<div class="poster poster-cat-'+cat+'" style="'+(heightCss||'height:100%')+'">'
      +'<span class="poster-wm">'+ICONS[wm]+'</span><div class="poster-scrim"></div></div>';
  },
  ratingPill(s){ return s.rating?('<span class="svc-rate-pill">'+ic('star')+s.rating+'</span>'):''; },
  saveHeart(id){ const on=State.saved.indexOf(id)>=0; return '<button class="save-btn'+(on?' on':'')+'" data-saveheart="'+id+'" title="'+(on?'Remove from saved':'Save')+'" onclick="event.stopPropagation();App.toggleSave(\''+id+'\')">'+ic('bookmark')+'</button>'; },
  saveTextBtn(id,label){ const on=State.saved.indexOf(id)>=0; const lbl=label||'Save';
    return '<button class="btn '+(on?'btn-save-on':'btn-ghost')+'" data-savetoggle="'+id+'" data-savelabel="'+esc(lbl)+'" onclick="App.toggleSave(\''+id+'\')">'+ic('bookmark')+' <span data-savetext>'+(on?'Saved':lbl)+'</span></button>'; },
  compareToggleBtn(item){ if(!item) return '';
    const on=State.compare.has(item.id);
    return '<button class="cmp-toggle-btn'+(on?' on':'')+'" data-cmptoggle="'+item.id+'" title="'+(on?'Remove from compare':'Add to compare')+'" onclick="event.stopPropagation();CompareMode.toggleItem(\''+item.id+'\')">'+ic(on?'check':'compare')+'</button>'; },
  amenityIcons(list){ const map={'Wi-Fi':'wifi','Pool':'pool','Air Conditioning':'snow','Restaurant':'utensils','Parking':'building','Beachfront':'waves'};
    return (list||[]).slice(0,4).map(f=>'<span title="'+esc(f)+'">'+ic(map[f]||'tag')+'</span>').join(''); },
  likeDislike(item){ if(!item) return '';
    // Real engine: js/interactions/reactions.js drives every .thumb-row
    // on the page via one delegated click-listener + live Supabase
    // counts. It expects exactly this markup (data-ref + .thumb-up/
    // .thumb-down each holding a .count) — it fills the numbers and
    // the .active state itself once the page is in the DOM, so no
    // counts or click handlers are wired here.
    // No stopPropagation here on purpose: reactions.js listens for
    // thumb clicks via ONE delegated document-level listener, so
    // stopping the click from bubbling past this row would silently
    // stop it from ever reaching that listener — the exact bug that
    // made these buttons look clickable but do nothing. Card
    // navigation is already blocked correctly by z-index (.svc-body>*
    // sits above .card-link), not by stopping propagation.
    return '<div class="react-row thumb-row" data-ref="'+item.id+'">'
    +'<button type="button" class="react-btn thumb thumb-up" data-act="up" title="Helpful">'+ic('thumbUp')+'<span class="count">0</span></button>'
    +'<button type="button" class="react-btn thumb thumb-down" data-act="down" title="Not helpful">'+ic('thumbDown')+'<span class="count">0</span></button>'
    +'</div>'; },

  /* ---- service card (browse contexts: grid) ---- */
  serviceCard(s,opts){ opts=opts||{};
    return '<article class="svc-card reveal" data-service="'+s.id+'">'
      +'<a class="card-link" href="javascript:void(0)" onclick="Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')" aria-label="'+esc(s.name)+'"></a>'
      +'<div class="svc-media">'+this.poster(s)
      +'<div class="svc-overlay-top">'+this.ratingPill(s)+'<div style="display:flex;gap:8px">'+this.compareToggleBtn(s)+this.saveHeart(s.id)+'</div></div></div>'
      +'<div class="svc-body">'
      +'<div style="display:flex;justify-content:space-between;align-items:center">'+this.catBadge(s.category)+'<span class="svc-loc">'+ic('pin')+esc((s.location||'').split(',')[0]||'')+'</span></div>'
      +'<div class="svc-title">'+esc(s.name)+'</div>'
      +(s.rating?'<div style="display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700">'+this.stars(s.rating)+'<span>'+s.rating+'</span><span style="color:var(--faint);font-weight:600">('+s.reviews+')</span></div>':'<div style="font-size:.78rem;color:var(--faint);font-weight:600">No ratings yet</div>')
      +'<div class="svc-amen">'+this.amenityIcons(s.facilities)+'</div>'
      +this.likeDislike(s)
      +'<div class="svc-foot">'+this.price(s.price,s.category==='Restaurant'?'menu':s.priceUnit)+
      '<div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')">'+ic('external')+' View</button></div></div>'
      +'</div></article>'; },

  /* ---- service row (list layout, used by Filter Services) ---- */
  serviceRow(s){
    return '<article class="svc-card reveal" style="flex-direction:row" data-service="'+s.id+'">'
    +'<a class="card-link" href="javascript:void(0)" onclick="Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')"></a>'
    +'<div class="svc-media" style="width:200px;height:auto;flex:none">'+this.poster(s)+'<div class="svc-overlay-top">'+this.ratingPill(s)+'</div></div>'
    +'<div class="svc-body" style="flex:1">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div>'+this.catBadge(s.category)+'<div class="svc-title" style="margin-top:6px">'+esc(s.name)+'</div>'
    +(s.rating?'<div style="display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;margin-top:3px">'+this.stars(s.rating)+'<span>'+s.rating+'</span><span style="color:var(--faint);font-weight:600">('+s.reviews+')</span></div>':'<div style="font-size:.78rem;color:var(--faint);font-weight:600;margin-top:3px">No ratings yet</div>')
    +'<div class="svc-loc" style="margin-top:4px">'+ic('pin')+esc(s.location||'')+' \u00b7 '+esc(destById(s.destination).name)+'</div></div><div style="display:flex;gap:8px">'+this.compareToggleBtn(s)+this.saveHeart(s.id)+'</div></div>'
    +'<div class="svc-amen">'+this.amenityIcons(s.facilities)+'</div>'
    +this.likeDislike(s)
    +'<div class="svc-foot">'+this.price(s.price,s.category==='Restaurant'?'menu':s.priceUnit)
    +'<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')">'+ic('external')+' View</button></div>'
    +'</div></article>'; },

  /* ---- destination postcard ---- */
  destCard(d){ const sv=SERVICES.filter(s=>s.destination===d.id); const pk=PACKAGES.filter(p=>p.destination===d.id);
    const cnt=sv.length+pk.length; const avg=sv.length?(sv.reduce((a,s)=>a+(+s.rating||0),0)/sv.length):0;
    return '<article class="dest-card reveal" onclick="Nav.go(\'destination\',\''+d.id+'\')" style="cursor:pointer">'
    +this.poster(d,'Destination','height:100%')
    +'<div class="dest-card-body">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-weight:800;font-size:1.05rem;font-family:var(--font-display)">'+esc(d.name)+'</div>'
    +'<div class="svc-loc" style="margin-top:4px">'+ic('pin')+esc(d.region)+'</div></div>'+this.saveHeart(d.id)+'</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">'
    +(avg?('<span style="font-size:.8rem;font-weight:700">'+this.stars(avg)+' '+avg.toFixed(1)+'</span>'):'<span></span>')
    +'<span class="fact-chip">'+ic('layers')+cnt+' listed</span></div></div></article>'; },

  /* ---- package card ---- */
  packageCard(p){ const d=destById(p.destination);
    return '<article class="svc-card reveal" onclick="Nav.go(\'package\',\''+p.id+'\')" style="cursor:pointer">'
    +'<div class="svc-media" style="height:160px">'+this.poster(p,'Package')+'<div class="svc-overlay-top"><span class="badge badge-rec">'+esc(p.badge)+'</span><div style="display:flex;gap:8px">'+this.compareToggleBtn(p)+this.saveHeart(p.id)+'</div></div></div>'
    +'<div class="svc-body"><div class="svc-loc">'+ic('pin')+esc(d.name)+'</div><div class="svc-title">'+esc(p.name)+'</div>'
    +'<div style="display:flex;gap:14px;align-items:center" class="fact-chip"><span>'+ic('calendar')+esc(p.duration)+'</span><span style="display:flex;align-items:center;gap:4px">'+this.stars(p.rating)+(p.rating?' '+p.rating:' <span style="color:var(--faint)">No ratings yet</span>')+'</span></div>'
    +this.likeDislike(p)
    +'<div class="svc-foot">'+this.price(p.price,'MMK / person')+'<button class="btn btn-ghost btn-sm">'+ic('arrowR')+' View</button></div></div></article>'; },

  waveDivider(fromColor,toColor){ return '<div class="wave-divider"><svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0 30C220 60 420 4 720 26C1010 47 1230 6 1440 30V60H0Z" fill="'+(toColor||'var(--pearl)')+'"/></svg></div>'; },
  reveal(root){ (root||document).querySelectorAll('.reveal').forEach((el,i)=>{ el.style.opacity='0'; el.style.transform='translateY(14px)';
    setTimeout(()=>{ el.style.transition='opacity .5s var(--ease),transform .5s var(--ease)'; el.style.opacity='1'; el.style.transform='none'; },30+i*28); }); },

  donut(byCategory,total){ const bc=Object.keys(byCategory); total=total||1; let acc=0,parts=[];
    bc.forEach(c=>{ const pct=byCategory[c]/total*100; parts.push(CAT_COLOR[c]+' '+acc+'% '+(acc+pct)+'%'); acc+=pct; });
    if(!parts.length) parts.push('var(--line) 0% 100%'); else parts.push('var(--line) '+acc+'% 100%');
    return 'conic-gradient('+parts.join(',')+')'; },
};

/* ================================================================
   NAV — dual chrome (topnav-hero on Explore only; sidebar app-shell
   everywhere else), mirroring the real router's layout split.
   ================================================================ */
const SB_SECTIONS = [
 {label:'Browse',items:[['explore','compass','Explore'],['packages','box','Packages'],['services','sliders','Filter Services'],['map','map','Map']]},
 {label:'Plan & Trips',items:[['build','sparkles','Build My Trip'],['plans','clipboard','My Plans'],['saved','bookmark','Saved'],['history','history','History'],['notifications','bell','Notifications']]},
 {label:'Account',items:[['settings','gear','Settings']]}
];
const BOTTOM_NAV=[['explore','compass','Explore'],['services','sliders','Services'],['build','sparkles','Plan'],['plans','clipboard','Trips'],['saved','bookmark','Saved']];
const SIDEBAR_GROUP_MAP={destination:'explore',service:'services',restaurant:'services',restaurants:'services',package:'packages',plan:'plans',settings:'settings',help:'settings',contact:'settings'};
const GUEST_LOCKED=['build','plans','saved','history','notifications'];
const GUEST_LOCK_LABEL={build:'build a trip',plans:'view your plans',saved:'save your favourites',history:'see your planning history',notifications:'get plan notifications'};

/* Compare cluster markup — one persistent set of nodes reused across renders so
   CSS transitions (expand/collapse) actually play. Built fresh only on full page
   navigation; toggled in place the rest of the time via Nav.updateCompareUI(). */
function compareClusterHTML(){
  const active=CompareMode.active, n=State.compare.size;
  return '<div class="cmp-cluster'+(active?' active':'')+'" id="cmpCluster">'
    +'<button class="icon-slot" id="cmpToggleTop" onclick="CompareMode.toggle()" title="'+(active?'Exit compare mode':'Compare services')+'">'+ic('compare')+'</button>'
    +'<div class="cmp-actions" id="cmpActions">'
      +'<button class="icon-slot cmp-clear-btn" onclick="CompareMode.clear()" title="Clear comparison">'+ic('x')+'</button>'
      +'<button class="btn btn-primary btn-sm cmp-view-btn'+(n<2?' disabled':'')+'" id="cmpViewBtn" onclick="CompareDialog.tryOpen()">'+ic('compare')+' View <span id="cmpViewCount">'+n+'</span></button>'
    +'</div></div>';
}

const Nav = {
  page:'explore',param:null,searchQuery:'',
  onGlobalSearch(v){ this.searchQuery=(v||'').trim().toLowerCase(); this.refresh(); },
  go(page,param){
    if(State.isGuest && GUEST_LOCKED.indexOf(page)>=0){ Auth.gate(GUEST_LOCK_LABEL[page]||'do that'); return; }
    this.page=page; this.param=param||null;
    document.querySelectorAll('.sb-item').forEach(a=>a.classList.toggle('active',a.dataset.p===page||SIDEBAR_GROUP_MAP[page]===a.dataset.p));
    document.querySelectorAll('.bottom-nav a').forEach(a=>a.classList.toggle('active',a.dataset.p===page||SIDEBAR_GROUP_MAP[page]===a.dataset.p));
    const host=document.getElementById('viewHost');
    host.innerHTML='';
    const fn=Pages[page]; if(fn) fn(host,param); else Pages.explore(host);
    window.scrollTo({top:0,behavior:'instant'});
    paintIcons(host); UI.reveal(host);
    if(window.MTPReactions) MTPReactions.hydrateVisible();
    this.renderSidebarPlanCard();
    this.updateGuestUI();
  },
  /* Lightweight re-render for small state changes (toggling a save, marking an
     item's status, submitting feedback, switching theme). Re-runs the current
     page's render function in place — no scroll reset, no entrance-animation
     replay, no full reload feel for what is really a one-field update. */
  refresh(){
    const host=document.getElementById('viewHost'); if(!host) return;
    const fn=Pages[this.page]; if(fn) fn(host,this.param);
    paintIcons(host);
    if(window.MTPReactions) MTPReactions.hydrateVisible();
    this.renderSidebarPlanCard();
  },
  renderSidebarPlanCard(){ const box=document.getElementById('sbPlanCard'); if(!box) return;
    if(State.isGuest){ box.innerHTML='<div class="sb-plan-card" style="cursor:pointer" onclick="Auth.gate(\'build a trip\')"><span class="k">'+ic('lock')+' Guest mode</span><b>Sign in to plan</b><p style="font-size:.76rem;opacity:.7;margin-top:4px">Create a free account to start building a trip.</p></div>'; paintIcons(box); return; }
    const p=activePlan(); if(!p){ box.innerHTML=''; return; }
    const snap=computeSnapshot(p);
    box.innerHTML='<div class="sb-plan-card" style="cursor:pointer" onclick="Nav.go(\'build\')"><span class="k">Active plan</span><b>'+esc(p.name)+'</b>'
      +'<div class="sb-plan-meter"><i style="width:'+Math.min(100,snap.pct)+'%;'+(snap.over?'background:linear-gradient(90deg,var(--dawn),#ff4d4d)':'')+'"></i></div>'
      +'<div class="sb-plan-foot"><span>'+money(snap.total)+' MMK</span><span>'+snap.pct+'%</span></div></div>'; },
  updateGuestUI(){
    const help='<button class="icon-slot" onclick="Guide.open()" title="How Wave Wise works">'+ic('help')+'</button>';
    const hasUnread=!State.isGuest&&State.notifications.some(function(n){return !n.is_read;});
    const bell='<button class="icon-slot" onclick="'+(State.isGuest?"Auth.gate('get plan notifications')":"Nav.go('notifications')")+'" title="Notifications">'+ic('bell')+(hasUnread?'<span class="dot"></span>':'')+'</button>';
    const cmp=compareClusterHTML();
    if(State.isGuest){
      const chipT='<span class="guest-chip">'+ic('info')+' Guest</span>';
      const signInBtn='<button class="btn btn-primary btn-sm" onclick="Auth.showAuth(\'login\')">'+ic('users')+' Sign In</button>';
      document.getElementById('miniAvatarSlot').innerHTML=cmp+help+bell+chipT+signInBtn;
      document.getElementById('sbUserSlot').innerHTML='<div class="sb-user" style="cursor:pointer" onclick="Auth.showAuth(\'login\')"><span class="avatar-ini" style="background:linear-gradient(135deg,var(--faint),var(--mist))">'+ic('users')+'</span><div><b>Browsing as guest</b><small>Tap to sign in</small></div></div>';
    } else {
      const me=API.getCurrentUser()||{full_name:'Traveller',email:''};
      const initials=(me.full_name||'?').split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase()||'?';
      document.getElementById('miniAvatarSlot').innerHTML=cmp+help+bell+'<button class="avatar-chip" onclick="Nav.go(\'settings\')"><span class="avatar-ini">'+esc(initials)+'</span><b>'+esc((me.full_name||'').split(' ')[0]||'Account')+'</b></button>';
      document.getElementById('sbUserSlot').innerHTML='<div class="sb-user"><span class="avatar-ini">'+esc(initials)+'</span><div><b>'+esc(me.full_name||'Traveller')+'</b><small>'+esc(me.email||'')+'</small></div></div>';
    }
    paintIcons(document.getElementById('miniAvatarSlot')); paintIcons(document.getElementById('sbUserSlot'));
  },
  /* Lightweight refresh for the compare cluster only — used when toggling compare
     mode or adding/removing a selection, so the expand/collapse animation actually
     plays (a full updateGuestUI() rebuild would destroy and recreate the nodes,
     killing the transition) and no page content needs to re-render at all. */
  updateCompareUI(){
    const cluster=document.getElementById('cmpCluster'); if(!cluster) return;
    cluster.classList.toggle('active',CompareMode.active);
    const n=State.compare.size;
    const countEl=document.getElementById('cmpViewCount'); if(countEl) countEl.textContent=n;
    const viewBtn=document.getElementById('cmpViewBtn'); if(viewBtn) viewBtn.classList.toggle('disabled',n<2);
    const topBtn=document.getElementById('cmpToggleTop'); if(topBtn) topBtn.title=CompareMode.active?'Exit compare mode':'Compare services';
  }
};

function navLink(n,cls){ const locked=State.isGuest&&GUEST_LOCKED.indexOf(n[0])>=0;
  return '<a class="'+cls+(locked?' locked':'')+'" data-p="'+n[0]+'" title="'+esc(n[2])+'" onclick="'+(locked?'Auth.gate(\''+(GUEST_LOCK_LABEL[n[0]]||'do that')+'\')':'Nav.go(\''+n[0]+'\')')+'">'+ic(n[1])+'<span>'+n[2]+'</span>'+(locked?ic('lock','lock-ic'):'')+'</a>'; }
function buildShellNav(){
  document.getElementById('sidebar').style.display='flex';
  document.getElementById('topbarMini').style.display='flex';
  document.getElementById('sbNav').innerHTML=SB_SECTIONS.map(sec=>'<div class="sb-label">'+sec.label+'</div>'+sec.items.map(n=>navLink(n,'sb-item')).join('')).join('<div class="sb-divider"></div>');
  document.getElementById('bottomNav').innerHTML=BOTTOM_NAV.map(n=>navLink(n,'')).join('');
  document.getElementById('mobileMenuBtn').onclick=function(){ UI.toggleSidebar(); };
  document.getElementById('sidebarWaveSlot').innerHTML=waveBG();
  var savedSb='collapsed'; try{ savedSb=localStorage.getItem('tidewell-sidebar')||'collapsed'; }catch(e){}
  const sb=document.getElementById('sidebar'); sb.classList.toggle('collapsed',savedSb==='collapsed');
  Nav.updateGuestUI();
  paintIcons(document);
}

/* ================================================================
   AUTH — wired to the real engine (js/api.js -> Supabase auth).
   Same screen, same tabs, same "skip as guest" — only the login/
   signup buttons now call the real API instead of always succeeding.
   ================================================================ */
const Auth = {
  toggle(which){
    document.getElementById('authLoginPane').style.display=which==='login'?'block':'none';
    document.getElementById('authSignupPane').style.display=which==='signup'?'block':'none';
    document.getElementById('authTabLogin').classList.toggle('active',which==='login');
    document.getElementById('authTabSignup').classList.toggle('active',which==='signup');
  },
  togglePw(id,btn){ const inp=document.getElementById(id); const show=inp.type==='password';
    inp.type=show?'text':'password'; btn.innerHTML=ic(show?'eyeOff':'eye'); paintIcons(btn); },
  checkStrength(v){ const bars=document.querySelectorAll('#pwMeter i'); let score=0;
    if(v.length>=6) score++; if(v.length>=10) score++; if(/[A-Z]/.test(v)&&/[0-9]/.test(v)) score++; if(/[^A-Za-z0-9]/.test(v)) score++;
    const strong=score>=3;
    bars.forEach((b,i)=>{ b.className=i<score?(strong?'on strong':'on'):''; });
    document.getElementById('pwHint').textContent=v.length===0?'Use 6+ characters':(strong?'Strong password':(score>=2?'Good — add a symbol for extra strength':'Use 6+ characters'));
  },
  showAuth(which){ GateModal.close(); document.getElementById('app').style.display='none'; document.getElementById('authScreen').style.display='grid';
    document.getElementById('authWaveSlot').innerHTML=waveBG(); this.paintScenes(); paintIcons(document.getElementById('authScreen')); this.toggle(which||'login'); },
  paintScenes(){ const day=State.theme==='day';
    document.getElementById('authScene1').innerHTML=beachScene(day?'midday':'dusk2',{sunRight:true,palmRight:false});
    const dc=document.getElementById('authStatDest'), sc=document.getElementById('authStatSvc'), pc=document.getElementById('authStatPkg');
    if(dc) dc.textContent=DESTINATIONS.length; if(sc) sc.textContent=SERVICES.filter(s=>s.category!=='Restaurant').length+'+'; if(pc) pc.textContent=PACKAGES.length; },
  async login(){
    const email=(document.getElementById('loginEmail')||{}).value||'';
    const password=(document.getElementById('loginPassword')||{}).value||'';
    if(!email||!password){ UI.toast('Enter your email and password','error'); return; }
    const btn=document.querySelector('#loginForm button[type=submit]'); if(btn){ btn.disabled=true; btn.style.opacity=.6; }
    try{ await API.login({email:email,password:password}); }
    catch(e){ UI.toast(e.message||'Could not sign in','error'); if(btn){ btn.disabled=false; btn.style.opacity=1; } return; }
    if(btn){ btn.disabled=false; btn.style.opacity=1; }
    document.getElementById('authScreen').style.display='none'; document.getElementById('app').style.display='block';
    buildShellNav(); Nav.go('explore'); UI.toast('Welcome back!','success'); },
  async signup(){
    const name=(document.getElementById('signupName')||{}).value||'';
    const email=(document.getElementById('signupEmail')||{}).value||'';
    const password=(document.getElementById('signupPassword')||{}).value||'';
    if(!name||!email||!password){ UI.toast('Fill in your name, email and password','error'); return; }
    if(password.length<6){ UI.toast('Password needs to be at least 6 characters','error'); return; }
    const btn=document.querySelector('#authSignupPane button[type=submit]'); if(btn){ btn.disabled=true; btn.style.opacity=.6; }
    try{ await API.register({email:email,password:password,full_name:name}); }
    catch(e){ UI.toast(e.message||'Could not create your account','error'); if(btn){ btn.disabled=false; btn.style.opacity=1; } return; }
    if(btn){ btn.disabled=false; btn.style.opacity=1; }
    document.getElementById('authScreen').style.display='none'; document.getElementById('app').style.display='block';
    buildShellNav(); Nav.go('explore'); UI.toast('Welcome, '+name.split(' ')[0]+'!','success'); },
  skip(){ document.getElementById('authScreen').style.display='none'; document.getElementById('app').style.display='block';
    buildShellNav(); Nav.go('explore'); UI.toast('Browsing as a guest — sign in anytime to save & plan','info'); },
  async logout(){ await API.logout(); document.getElementById('app').style.display='none'; this.showAuth('login'); },
  gate(actionLabel){ GateModal.open(actionLabel); }
};

/* ---------------- guest action-gate modal ---------------- */
const GateModal = {
  open(actionLabel){ document.getElementById('gateText').textContent='Create a free account to '+(actionLabel||'do that')+'. It takes under a minute — your browsing stays exactly as it is.';
    document.getElementById('gateScrim').classList.add('show'); document.getElementById('gateModal').style.display='block'; },
  close(){ document.getElementById('gateScrim').classList.remove('show'); document.getElementById('gateModal').style.display='none'; }
};

/* ================================================================
   USER GUIDE — a short, visual walkthrough of how the site works.
   Opens from the "?" button beside search, and from Help & FAQ.
   ================================================================ */
const Guide = {
  step:0,
  SECTIONS:[
    {ic:'compass',color:'linear-gradient(135deg,var(--lagoon),var(--lagoon-2))',eyebrow:'Look around',title:'Browse freely \u2014 no account needed',
     body:'Explore, Filter Services, Compare and the Map are open to everyone. Look up stays, rides and activities on your own budget \u2014 nothing\u2019s added to a plan until you say so.',
     cta:{label:'Start exploring',page:'explore',icon:'arrowR'}},
    {ic:'sparkles',color:'linear-gradient(135deg,var(--dawn),var(--dawn-2))',eyebrow:'Two steps',title:'Build a trip in two steps',
     body:'Step 1 sets destination, dates, travelers and budget. Step 2 adds services \u2014 tap a card to set a quantity (hotels track rooms & nights separately, so the total\u2019s never a guess).',
     cta:{label:'Try Build My Trip',page:'build',icon:'arrowR'}},
    {ic:'check',color:'linear-gradient(135deg,var(--ok),#0d9488)',eyebrow:'How booking works',title:'Confirm here, book on the official site',
     body:'Wave Wise never takes payment or bookings itself. Every service links to its operator\u2019s own site \u2014 confirming a plan just locks in your list so you can work through those links.',
     cta:{label:'See My Plans',page:'plans',icon:'arrowR'}},
    {ic:'map',color:'linear-gradient(135deg,var(--c-transport),#6d28d9)',eyebrow:'Getting around',title:'The map has two views',
     body:'\u201cAll Services\u201d pins everything on the coast, filterable by category. \u201cMy Plan\u201d pins only what\u2019s in your trip. Tap a pin, or its row in the list, to open the same info card.',
     cta:{label:'Open the map',page:'map',icon:'arrowR'}},
    {ic:'bookmark',color:'linear-gradient(135deg,var(--lagoon),#0d9488)',eyebrow:'Two different things',title:'Save vs. like / dislike',
     body:'The bookmark saves a place to your personal shortlist (needs an account). Thumbs up/down are public reactions on every service \u2014 anyone can use them, account or not.',
     cta:{label:'View Saved',page:'saved',icon:'arrowR'}},
    {ic:'users',color:'linear-gradient(135deg,var(--violet),#5b21b6)',eyebrow:'No pressure',title:'Guest mode',
     body:'Skip sign-in to browse everything above. Saving, planning, feedback and notifications need a free account \u2014 you\u2019ll be prompted right when you need it, and nothing you\u2019ve browsed is lost.',
     final:true}
  ],
  FINAL_LINKS:[
    ['sparkles','Build My Trip','build'],['map','Open Map','map'],
    ['clipboard','My Plans','plans'],['bookmark','Saved','saved']
  ],
  open(){ this.step=0; this.render(true);
    document.getElementById('guideScrim').classList.add('show'); document.getElementById('guideDialog').classList.add('show'); },
  close(){ document.getElementById('guideScrim').classList.remove('show'); document.getElementById('guideDialog').classList.remove('show'); },
  go(delta){ const n=this.step+delta; if(n<0||n>=this.SECTIONS.length) return; this.step=n; this.render(); },
  jump(i){ this.step=i; this.render(); },
  finish(page){ this.close(); if(page) Nav.go(page); },
  render(first){
    const s=this.SECTIONS[this.step], last=this.step===this.SECTIONS.length-1;
    document.getElementById('guideEyebrow').textContent=s.eyebrow||'New here?';
    document.getElementById('guideRailFill').style.width=Math.round(((this.step+1)/this.SECTIONS.length)*100)+'%';
    const stage='<div class="guide-stage enter" id="guideStage">'
      +'<span class="ic-orb" style="background:'+s.color+'">'+ic(s.ic)+'</span>'
      +'<h4>'+esc(s.title)+'</h4><p>'+s.body+'</p>'
      +(s.final
        ? '<div class="guide-final-grid">'+this.FINAL_LINKS.map(l=>'<button onclick="Guide.finish(\''+l[2]+'\')"><span class="gf-ic">'+ic(l[0])+'</span><b style="font-size:.86rem">'+l[1]+'</b></button>').join('')+'</div>'
        : (s.cta?'<button class="btn btn-secondary btn-sm guide-try" onclick="Guide.finish(\''+s.cta.page+'\')">'+ic(s.cta.icon||'arrowR')+' '+s.cta.label+'</button>':''))
      +'</div>';
    document.getElementById('guideBody').innerHTML=stage;
    document.getElementById('guideDots').innerHTML=this.SECTIONS.map((x,i)=>'<button class="guide-dot'+(i===this.step?' active':(i<this.step?' done':''))+'" onclick="Guide.jump('+i+')" aria-label="Step '+(i+1)+'"></button>').join('');
    document.getElementById('guideNav').innerHTML='<div class="guide-nav">'
      +'<button class="guide-arrow" onclick="Guide.go(-1)" '+(this.step===0?'disabled':'')+'>'+ic('chevronL')+'</button>'
      +'<span class="guide-count">Step '+(this.step+1)+' of '+this.SECTIONS.length+'</span>'
      +(last?'<button class="btn btn-primary btn-sm" onclick="Guide.finish()">'+ic('check')+' Done</button>'
            :'<button class="guide-arrow" onclick="Guide.go(1)">'+ic('chevronR')+'</button>')
      +'</div>';
    paintIcons(document.getElementById('guideBody'));
    paintIcons(document.getElementById('guideNav'));
  }
};

/* ================================================================
   COMPARE — lives in the top bar (beside the guide "?"), on every
   page, never a separate page. Turning it on reveals the compact,
   clearly-coloured add/remove control already sitting (hidden) on
   every service & package card — a body class flip, not a re-render.
   Exiting compare mode is only ever done via the Clear button up
   top — the dialog's own Done/close never touch the mode.
   ================================================================ */
const CompareMode = {
  active:false,
  toggle(){ this.active?this.clear():this.turnOn(); },
  turnOn(){ if(this.active) return;
    this.active=true;
    document.body.classList.add('compare-mode');
    Nav.updateCompareUI();
    UI.toast('Compare mode on \u2014 tap a card\u2019s square to add it','info'); },
  clear(){ this.active=false; State.compare.clear();
    document.body.classList.remove('compare-mode');
    document.querySelectorAll('[data-cmptoggle]').forEach(btn=>{ btn.classList.remove('on'); btn.innerHTML=ICONS.compare; btn.title='Add to compare'; });
    Nav.updateCompareUI();
    UI.toast('Compare mode off','info'); },
  toggleItem(id){ if(State.compare.has(id)) State.compare.delete(id); else State.compare.add(id);
    const on=State.compare.has(id);
    document.querySelectorAll('[data-cmptoggle="'+id+'"]').forEach(btn=>{ btn.classList.toggle('on',on); btn.innerHTML=on?ICONS.check:ICONS.compare; btn.title=on?'Remove from compare':'Add to compare'; });
    Nav.updateCompareUI(); }
};
const CAT_PLURAL={Hotel:'Hotels',Transport:'Transport',Activity:'Activities',Restaurant:'Restaurants',Package:'Packages'};
const CompareDialog = {
  tryOpen(){ if(State.compare.size<2){ UI.toast('Add at least 2 services to compare','info'); return; } this.open(); },
  open(){ this.render();
    document.getElementById('compareScrim').classList.add('show'); document.getElementById('compareDialog').classList.add('show'); },
  close(){ document.getElementById('compareScrim').classList.remove('show'); document.getElementById('compareDialog').classList.remove('show'); },
  render(){ const ids=Array.from(State.compare); const items=ids.map(id=>anyById(id)).filter(Boolean);
    const body=document.getElementById('compareDialogBody');
    if(!items.length){ body.innerHTML='<div class="trip-empty">'+ic('copy')+'<h3 style="margin:12px 0 4px;color:var(--ink)">Nothing selected</h3><p>Tap the + on a couple of services to add them here.</p></div>'; paintIcons(body); return; }
    const groups={}; items.forEach(i=>{ const key=i.duration?'Package':i.category; (groups[key]=groups[key]||[]).push(i); });
    let html='';
    Object.keys(groups).forEach(key=>{ const list=groups[key]; const isPkg=key==='Package';
      const lowestPrice=Math.min.apply(null,list.map(i=>i.price));
      const highestRating=Math.max.apply(null,list.map(i=>i.rating||0));
      const cell=(val,best)=>'<td'+(best?' class="cmp-best"':'')+'>'+(best?'<span class="cmp-crown">Best</span>':'')+val+'</td>';
      html+='<div style="margin-bottom:24px"><h4 style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'+ic(CAT_ICON[key]||'box')+' '+(CAT_PLURAL[key]||key)+' <span class="badge badge-soft">'+list.length+'</span></h4>'
      +'<div class="tbl-wrap"><table class="cmp"><thead><tr><th>Side-by-side</th>'+list.map(i=>'<th><div class="cmp-head-card">'+UI.poster(i,isPkg?'Package':i.category)+'<b>'+esc(i.name)+'</b>'+(i.rating?UI.stars(i.rating):'')+'<button class="btn btn-ghost btn-sm" onclick="CompareMode.toggleItem(\''+i.id+'\');CompareDialog.render()">'+ic('x')+' Remove</button></div></th>').join('')+'</tr></thead><tbody>'
      +'<tr><td>Price</td>'+list.map(i=>cell(money(i.price)+' MMK',i.price===lowestPrice)).join('')+'</tr>'
      +(isPkg?'<tr><td>Destination</td>'+list.map(i=>'<td>'+esc(destById(i.destination).name)+'</td>').join('')+'</tr>':'<tr><td>Location</td>'+list.map(i=>'<td>'+esc(i.location||'\u2014')+'</td>').join('')+'</tr>')
      +(list.some(i=>i.rating)?'<tr><td>Rating</td>'+list.map(i=>i.rating?cell(i.rating+' ('+i.reviews+')',i.rating===highestRating):'<td>\u2014</td>').join('')+'</tr>':'')
      +(isPkg?'<tr><td>Duration</td>'+list.map(i=>'<td>'+esc(i.duration)+' \u00b7 '+i.nights+'N</td>').join('')+'</tr>':'')
      +'<tr><td>Action</td>'+list.map(i=>'<td><button class="btn btn-primary btn-sm" onclick="App.openOfficial(\''+i.id+'\')">'+ic('external')+' Official Site</button></td>').join('')+'</tr>'
      +'</tbody></table></div></div>'; });
    body.innerHTML=html; paintIcons(body); }
};

/* ================================================================
   TRIP DIALOG — a big, flexible modal that shows exactly what's in
   the trip, lets you edit quantity or remove right there, and
   confirm — replaces the old separate Trip Summary page.
   ================================================================ */
const TripDialog = {
  open(){ const plan=activePlan(); if(!plan) return;
    this.render();
    document.getElementById('tripScrim').classList.add('show');
    document.getElementById('tripDialog').classList.add('show'); },
  close(){ document.getElementById('tripScrim').classList.remove('show'); document.getElementById('tripDialog').classList.remove('show'); },
  render(){
    const plan=activePlan(); if(!plan) return; const snap=computeSnapshot(plan);
    document.getElementById('tripDialogTitle').textContent=plan.name;
    const body=document.getElementById('tripDialogBody');
    if(!snap.items.length){ body.innerHTML='<div class="trip-empty">'+ic('layers')+'<h3 style="margin:12px 0 4px;color:var(--ink)">Nothing added yet</h3><p>Close this and tap any service to set a quantity.</p></div>'; paintIcons(body); return; }
    const bc=Object.keys(snap.byCategory);
    const list=snap.items.map(it=>this.itemCard(it,plan)).join('');
    const summary='<div class="trip-summary-card">'
      +'<span class="eyebrow">Budget</span>'
      +'<div style="display:flex;gap:14px;align-items:center"><div class="donut" style="width:84px;height:84px;flex:none;background:'+UI.donut(snap.byCategory,snap.total)+'"><div class="ctr"><b style="font-size:.95rem">'+snap.pct+'%</b><small>used</small></div></div>'
      +'<div><div class="mono-num" style="font-size:1.15rem;font-weight:800">'+money(snap.total)+'<small style="font-size:.66rem;color:var(--mist);font-weight:600"> MMK</small></div>'
      +'<div style="font-size:.74rem;font-weight:700;color:'+(snap.over?'var(--danger)':'var(--ok)')+'">'+(snap.over?'Over by '+money(Math.abs(snap.left)):money(snap.left)+' left')+'</div></div></div>'
      +'<div class="tide-meter" style="height:9px"><i class="'+(snap.over?'over':'')+'" style="width:'+Math.min(100,snap.pct)+'%"></i></div>'
      +(bc.length?'<div>'+bc.map(c=>'<div class="legend-row" style="padding:3px 0"><span class="dot" style="background:'+CAT_COLOR[c]+'"></span>'+c+'<b>'+money(snap.byCategory[c])+'</b></div>').join('')+'</div>':'')
      +'<div class="sb-divider" style="background:var(--line);margin:2px 0"></div>'
      +'<button class="btn btn-primary" onclick="Pages._confirmPlan()">'+ic('check')+' Confirm Plan</button>'
      +'<button class="btn btn-ghost" onclick="TripDialog.close()">'+ic('arrowL')+' Keep Browsing</button>'
      +'</div>';
    body.innerHTML='<div class="trip-dialog-grid"><div>'+list+'</div>'+summary+'</div>';
    paintIcons(body);
  },
  itemCard(it,plan){
    const dropped=it.item_status==='failed'||it.item_status==='disliked';
    const nights=Compute.itemNights(it,plan); const tot=Compute.itemLineTotal(it,plan); const isHotel=it.category==='Hotel';
    return '<div class="trip-item-card'+(dropped?' dropped':'')+'">'
    +'<div class="trip-item-media">'+UI.poster({category:it.category})+'</div>'
    +'<div style="flex:1;min-width:0">'
    +'<div style="display:flex;justify-content:space-between;gap:10px"><div>'+UI.catBadge(it.category)+'<b style="display:block;font-size:.9rem;margin-top:4px">'+esc(it.name)+'</b>'
    +(it.variant_name_snapshot||it.direction?'<div style="font-size:.74rem;color:var(--mist)">'+(it.variant_name_snapshot?esc(it.variant_name_snapshot):'')+(it.direction?' \u00b7 '+(it.direction==='out'?'Outbound':'Return'):'')+'</div>':'')+'</div>'
    +'<b class="mono-num" style="font-size:.92rem;white-space:nowrap">'+money(tot)+' MMK</b></div>'
    +'<div class="trip-item-qty-row">'
    +(isHotel?('<div class="qty-block"><label>Rooms</label>'+this.stepper(it.id,'qty',it.qty)+'</div><div class="qty-block"><label>Nights</label>'+this.stepper(it.id,'nights',nights)+'</div>')
      :'<div class="qty-block"><label>Qty</label>'+this.stepper(it.id,'qty',it.qty)+'</div>')
    +'<div style="margin-left:auto;display:flex;gap:6px;align-self:flex-end">'
    +'<button class="iconbtn" style="width:30px;height:30px" title="Official site" onclick="App.openOfficial(\''+it.refId+'\')">'+ic('external')+'</button>'
    +'<button class="iconbtn" style="width:30px;height:30px;color:var(--danger)" title="Remove" onclick="TripDialog.remove(\''+plan.id+'\',\''+it.id+'\')">'+ic('trash')+'</button>'
    +'</div></div></div></div>';
  },
  stepper(itemId,field,val){ return '<div class="qty-stepper" style="width:fit-content"><button type="button" onclick="TripDialog.step(\''+itemId+'\',\''+field+'\',-1)">'+ICONS.minus+'</button><span style="width:26px;text-align:center;font-weight:800;font-size:.82rem;display:inline-block">'+val+'</span><button type="button" onclick="TripDialog.step(\''+itemId+'\',\''+field+'\',1)">'+ICONS.plus+'</button></div>'; },
  async step(itemId,field,delta){
    const plan=activePlan(); const it=plan.items.find(x=>x.id===itemId); if(!it) return;
    const patch={};
    if(field==='qty'){ patch.quantity=Math.max(1,it.qty+delta); }
    else if(field==='nights'){ const cur=Compute.itemNights(it,plan); patch.notes='nights='+Math.max(1,cur+delta); }
    else return;
    try{ await API.plans.updateItem(plan.id,itemId,patch); }
    catch(e){ UI.toast(e.message||'Could not update quantity','error'); return; }
    this.render(); this.sync(); },
  async remove(planId,itemId){ try{ await API.plans.removeItem(planId,itemId); }
    catch(e){ UI.toast(e.message||'Could not remove item','error'); return; }
    UI.toast('Removed from your trip','info');
    const p=API.plans.get(planId); if(!p||!p.items.length) this.close(); else this.render();
    this.sync(); },
  sync(){ if(Nav.page==='build'){ const host=document.getElementById('viewHost'); Pages.build(host); paintIcons(host); if(window.MTPReactions) MTPReactions.hydrateVisible(); } Nav.renderSidebarPlanCard(); }
};

/* ================================================================
   APP — cross-page interactions (save, official-site link, itinerary
   status). Wired to the real engine: js/api.js does the Supabase
   read/write, js/store.js does the price math; nothing here recomputes
   either. toggleReaction is gone on purpose — public like/dislike is
   now handled entirely by js/interactions/reactions.js's own
   delegated click-listener (see UI.likeDislike above).
   ================================================================ */
const App = {
  async toggleSave(id){ if(!API.getCurrentUser()){ Auth.gate('save favourites'); return; }
    const item=anyById(id)||{id:id}; let on;
    try{ on=await API.saved.toggle(item); }
    catch(e){ UI.toast(e.message||'Could not update favourites','error'); return; }
    UI.toast(on?'Saved to favourites':'Removed from favourites',on?'success':'info');
    document.querySelectorAll('[data-saveheart="'+id+'"]').forEach(b=>{ b.classList.toggle('on',on); b.title=on?'Remove from saved':'Save'; });
    document.querySelectorAll('[data-savetoggle="'+id+'"]').forEach(b=>{ b.classList.toggle('btn-save-on',on); b.classList.toggle('btn-ghost',!on);
      const t=b.querySelector('[data-savetext]'); if(t) t.textContent=on?'Saved':(b.dataset.savelabel||'Save'); });
    if(Nav.page==='saved') Nav.refresh(); },
  openOfficial(id){ const ref=anyById(id); if(!ref) return;
    window.open(ref.officialUrl||'#','_blank','noopener');
    API.history.append({type:'official_clicked',label:'Visited an official website',target:ref.name||''}); },
  /* Real endpoint now: js/api.js#updateItem patches item_status on the
     actual plan_items row (added this pass — same insert/delete pattern
     as addItem/removeItem, no pricing logic touched). */
  async setItemStatus(planId,itemId,status){
    const lab={planned:'kept in plan',confirmed:'confirmed',failed:'marked unavailable \u2014 removed from estimate',disliked:'marked not suitable \u2014 removed from estimate'}[status]||'updated';
    try{ await API.plans.updateItem(planId,itemId,{item_status:status}); }
    catch(e){ UI.toast(e.message||'Could not update this item','error'); return; }
    UI.toast('Item '+lab,(status==='failed'||status==='disliked')?'info':'success'); Nav.refresh(); },
  async removeItem(planId,itemId){ try{ await API.plans.removeItem(planId,itemId); }
    catch(e){ UI.toast(e.message||'Could not remove item','error'); return; }
    UI.toast('Removed from your trip','info'); Nav.refresh(); }
};

/* ================================================================
   PAGES — one render function per route. Every page reads only
   from DESTINATIONS / SERVICES / PACKAGES / State (no network).
   ================================================================ */
const Pages = {};

/* ---------------- EXPLORE (landing) ---------------- */
Pages.explore = function(root){
  const dests=DESTINATIONS;
  const recs=Compute.recommendations(SERVICES.filter(s=>s.category!=='Restaurant'),{budgetPer:500000}).slice(0,8);
  root.innerHTML =
  '<section class="hero">'
   +beachScene(State.theme==='day'?'midday':'dusk',{sunRight:true,palmRight:false})
   +waveBG()
   +'<div class="hero-content">'
   +'<span class="hero-eyebrow">Plan your perfect</span>'
   +'<h1>Find Your Wave</h1>'
   +'<div class="hero-sub">'+ic('waves')+' Across the Myanmar coast '+ic('waves')+'</div>'
   +'<span class="energy-tag" style="margin:6px 0">'+ic('sparkles')+' Fresh coastal escapes, all summer</span>'
   +'<div class="hero-console">'
   +'<div class="hc-field"><label>Destination</label><select id="exDest">'+dests.map(d=>'<option value="'+d.id+'">'+esc(d.name)+'</option>').join('')+'</select></div>'
   +'<div class="hc-field"><label>Dates</label><div style="display:flex;align-items:center;gap:4px"><input id="exDateStart" type="date" value="2026-11-12" style="font-size:.78rem;min-width:0"><span style="color:#6d8791;flex:none">\u2192</span><input id="exDateEnd" type="date" value="2026-11-16" style="font-size:.78rem;min-width:0"></div></div>'
   +'<div class="hc-field"><label>Travelers</label><input id="exPax" type="number" min="1" value="2"></div>'
   +'<div class="hc-field"><label>Budget / person</label><select id="exBudget"><option value="300000">300,000 MMK</option><option value="500000" selected>500,000 MMK</option><option value="800000">800,000 MMK</option></select></div>'
   +'<button class="hc-go" onclick="Pages._exBuild()">'+ic('sparkles')+' Build My Trip</button>'
   +'</div>'
   +'<div class="hero-pop">'+dests.map(d=>'<button onclick="document.getElementById(\'exDest\').value=\''+d.id+'\'">'+esc(d.name)+'</button>').join('')+'</div>'
   +'<div class="hero-strip">'
   +'<span>'+ic('pin')+DESTINATIONS.length+' shores</span><span>'+ic('building')+SERVICES.length+' services</span><span>'+ic('box')+PACKAGES.length+' packages</span>'
   +'<span>'+ic('check')+' Live availability</span></div>'
   +'</div>'
   +'<svg class="hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0 40C240 90 480 0 720 30C960 60 1200 10 1440 45V90H0Z" fill="var(--pearl)"/></svg>'
   +'</section>'

   +'<div class="page-pad container">'
   +'<section class="section reveal">'
   +'<div class="sec-head"><div><span class="eyebrow">Two ways to plan</span><h2>Plan Your Trip Your Way</h2></div></div>'
   +'<div class="grid grid-2">'
   +'<article class="card-surface plan-way-card" style="padding:28px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden">'
   +'<span class="plan-way-wm" style="color:var(--lagoon)">'+ICONS.compass+'</span>'
   +'<div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,var(--lagoon),var(--lagoon-2));display:flex;align-items:center;justify-content:center;color:#fff;position:relative;z-index:1">'+ic('sparkles')+'</div>'
   +'<h3 style="font-size:1.2rem;position:relative;z-index:1">Build My Own Trip</h3>'
   +'<ul style="list-style:none;display:flex;flex-direction:column;gap:8px;font-size:.88rem;color:var(--ink-soft);position:relative;z-index:1">'
   +'<li>\ud83c\udfd6\ufe0f Pick a beach, set your dates &amp; budget</li>'
   +'<li>\ud83d\udecf\ufe0f Add exactly the rooms, rides &amp; activities you want</li>'
   +'<li>\ud83d\udd22 Quantity always visible \u2014 never guessed</li>'
   +'</ul>'
   +'<button class="btn btn-secondary" style="align-self:flex-start;margin-top:auto;position:relative;z-index:1" onclick="Nav.go(\'build\')">Start Planning '+ic('arrowR')+'</button></article>'
   +'<article class="card-surface plan-way-card" style="padding:28px;display:flex;flex-direction:column;gap:14px;position:relative;overflow:hidden">'
   +'<span class="plan-way-wm" style="color:var(--dawn)">'+ICONS.box+'</span>'
   +'<div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,var(--dawn),var(--dawn-2));display:flex;align-items:center;justify-content:center;color:#fff;position:relative;z-index:1">'+ic('box')+'</div>'
   +'<h3 style="font-size:1.2rem;position:relative;z-index:1">Full Travel Packages</h3>'
   +'<ul style="list-style:none;display:flex;flex-direction:column;gap:8px;font-size:.88rem;color:var(--ink-soft);position:relative;z-index:1">'
   +'<li>\ud83e\uddf3 Curated, all-inclusive trips</li>'
   +'<li>\u2705 Built by official operators</li>'
   +'<li>\ud83d\udd17 Compare a few, then book directly on their site</li>'
   +'</ul>'
   +'<button class="btn btn-primary" style="align-self:flex-start;margin-top:auto" onclick="Nav.go(\'packages\')">Browse Packages '+ic('arrowR')+'</button></article>'
   +'</div></section>'

   +'<section class="section reveal">'
   +'<div class="sec-head"><div><span class="eyebrow">The coast, one shore at a time</span><h2>Popular Beach Destinations</h2></div><button class="link" onclick="Nav.go(\'services\')">View all '+ic('arrowR')+'</button></div>'
   +'<div class="grid grid-4">'+dests.map(d=>UI.destCard(d)).join('')+'</div></section>'

   +'<section class="section reveal">'
   +'<div class="sec-head"><div><span class="eyebrow">Picked for you</span><h2>Available Now</h2></div><button class="link" onclick="Nav.go(\'services\')">View all '+ic('arrowR')+'</button></div>'
   +'<div class="grid grid-4">'+recs.slice(0,4).map(r=>UI.serviceCard(r.service)).join('')+'</div></section>'

   +'<section class="section reveal" style="background:linear-gradient(135deg,var(--abyss),var(--abyss-3));border-radius:var(--r-xl);padding:36px;color:#fff">'
   +'<div class="grid grid-4">'
   +['calendar,No booking, just planning,100% free to plan \u2014 booking happens on provider sites',
     'external,Official provider links,Every service routes to its operator website',
     'shield,Honest reference prices,Provider estimates \u2014 always confirm before you go',
     'lock,Private by default,Plans, saves and feedback are yours alone'].map(x=>{ const [i,t,d]=x.split(','); return '<div style="display:flex;gap:12px;align-items:flex-start"><span style="width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;flex:none">'+ic(i)+'</span><div><b style="display:block;margin-bottom:3px">'+t+'</b><small style="color:rgba(255,255,255,.65);font-size:.8rem">'+d+'</small></div></div>'; }).join('')
   +'</div></section>'
   +'</div>';
};
Pages._exBuild=async function(){
  if(State.isGuest){ Auth.gate('build a trip'); return; }
  const g=id=>document.getElementById(id);
  const meta={ name:'My New Trip',
    destination:(g('exDest')||{}).value||(DESTINATIONS[0]||{}).id||'',
    startDate:(g('exDateStart')||{}).value||'2026-11-12',
    endDate:(g('exDateEnd')||{}).value||'2026-11-16',
    travelers:+((g('exPax')||{}).value)||2,
    budget:+((g('exBudget')||{}).value)||500000,
    travelGroup:'Friends',purpose:'Relaxation' };
  let p;
  try{ p=await API.plans.create(meta); }
  catch(e){ UI.toast(e.message||'Could not start a trip','error'); return; }
  API.plans.setActive(p.id);
  if(Pages._build) Pages._build.step=1;
  Nav.go('build'); UI.toast('Trip started \u2014 add your services','success');
};

/* ---------------- DESTINATION DETAIL (pure browse — no plan actions) ---------------- */
Pages.destination = function(root,id){
  const d=destById(id)||DESTINATIONS[0];
  const sv=SERVICES.filter(s=>s.destination===d.id&&s.category!=='Restaurant');
  const rests=SERVICES.filter(s=>s.destination===d.id&&s.category==='Restaurant');
  const pk=PACKAGES.filter(p=>p.destination===d.id);
  const all=sv.concat(rests);
  const avg=all.length?all.reduce((a,s)=>a+(+s.rating||0),0)/all.length:0;
  const counts={Hotel:0,Transport:0,Activity:0}; sv.forEach(s=>{ if(counts[s.category]!=null) counts[s.category]++; });
  const others=DESTINATIONS.filter(x=>x.id!==d.id).slice(0,3);
  const catSection=(cat,label)=>{ const list=sv.filter(s=>s.category===cat); if(!list.length) return '';
    return '<div style="margin-bottom:30px"><h3 style="font-size:1.05rem;display:flex;align-items:center;gap:8px;margin-bottom:14px">'+ic(CAT_ICON[cat])+label+' <span class="badge badge-soft">'+list.length+'</span></h3><div class="grid grid-3">'+list.map(s=>UI.serviceCard(s)).join('')+'</div></div>'; };
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
   +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'explore\')">'+ic('arrowL')+' Back to Explore</button>'
   +'<div class="reveal" style="position:relative;border-radius:var(--r-xl);overflow:hidden;height:340px;margin-bottom:-40px">'
   +UI.poster(d,'Destination','height:100%')
   +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:32px;color:#fff">'
   +'<span class="energy-tag" style="width:fit-content;margin-bottom:10px">'+ic('waves')+' Myanmar beach destination</span>'
   +'<h1 style="color:#fff;font-size:clamp(1.8rem,4vw,2.6rem)">'+esc(d.name)+'</h1>'
   +'<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;color:rgba(255,255,255,.9);font-size:.86rem;font-weight:600">'
   +'<span>'+ic('pin')+esc(d.region)+'</span><span>'+ic('sparkles')+'Best for '+esc(d.bestFor)+'</span>'+(avg?'<span>'+UI.stars(avg)+' '+avg.toFixed(1)+'</span>':'')+'</div>'
   +'<div style="display:flex;gap:10px;margin-top:16px">'
   +'<button class="btn btn-glass" onclick="document.getElementById(\'destSvc\').scrollIntoView({behavior:\'smooth\'})">'+ic('building')+' Explore services</button>'
   +'<button class="btn btn-glass" onclick="Nav.go(\'map\')">'+ic('map')+' View on Map</button>'
   +UI.saveHeart(d.id)
   +'</div></div></div>'
   +'<div class="reveal" style="position:relative;z-index:3;margin:0 20px 40px;background:var(--card);border-radius:var(--r-lg);box-shadow:var(--shadow-lg);display:flex;flex-wrap:wrap">'
   +[['building','Hotel','Hotels'],['bus','Transport','Transport'],['waves','Activity','Activities']].map(x=>'<div style="flex:1;min-width:120px;padding:18px;text-align:center;border-right:1px solid var(--line)"><div style="color:var(--lagoon)">'+ic(x[0])+'</div><b style="font-size:1.3rem;font-family:var(--font-data)">'+counts[x[1]]+'</b><div style="font-size:.76rem;color:var(--mist)">'+x[2]+'</div></div>').join('')
   +'<div style="flex:1;min-width:120px;padding:18px;text-align:center;border-right:1px solid var(--line)"><div style="color:var(--dawn)">'+ic('utensils')+'</div><b style="font-size:1.3rem;font-family:var(--font-data)">'+rests.length+'</b><div style="font-size:.76rem;color:var(--mist)">Dining</div></div>'
   +'<div style="flex:1;min-width:120px;padding:18px;text-align:center"><div style="color:var(--violet)">'+ic('box')+'</div><b style="font-size:1.3rem;font-family:var(--font-data)">'+pk.length+'</b><div style="font-size:.76rem;color:var(--mist)">Packages</div></div>'
   +'</div>'
   +'<section class="section reveal card-surface" style="padding:26px 28px">'
   +'<h2 style="font-size:1.3rem;margin-bottom:10px">About '+esc(d.name)+'</h2><p style="color:var(--mist);line-height:1.7">'+esc(d.description)+'</p></section>'
   +'<section class="section reveal" id="destSvc"><div class="sec-head"><div><span class="eyebrow">Browse only \u2014 build a trip to add these</span><h2>Stay, travel &amp; things to do</h2></div></div>'
   +catSection('Hotel','Hotels')+catSection('Transport','Transport')+catSection('Activity','Activities')
   +'</section>'
   +(pk.length?'<section class="section reveal"><div class="sec-head"><div><h2>Packages for '+esc(d.name)+'</h2></div><button class="link" onclick="Nav.go(\'packages\')">Browse packages '+ic('arrowR')+'</button></div><div class="grid grid-3">'+pk.map(p=>UI.packageCard(p)).join('')+'</div></section>':'')
   +(rests.length?'<section class="section reveal"><div class="sec-head"><div><span class="eyebrow">Reference only \u2014 never added to your estimate</span><h2>Where to eat</h2></div><button class="link" onclick="Nav.go(\'restaurants\',\''+d.id+'\')">Dining guide '+ic('arrowR')+'</button></div><div class="grid grid-3">'+rests.map(s=>Pages._restaurantCard(s)).join('')+'</div></section>':'')
   +'<section class="section reveal"><h2 style="margin-bottom:18px">Keep exploring</h2><div class="grid grid-3">'+others.map(o=>UI.destCard(o)).join('')+'</div></section>'
   +'</div>';
};

/* ---------------- SERVICES LISTING (Filter Services — browse) ---------------- */
Pages._svcState={cat:'All',maxP:250000,facs:[],q:'',sort:'top'};
Pages.services = function(root){
  const st=Pages._svcState;
  const CATS=[['All','layers','All Services'],['Hotel','building','Hotels'],['Transport','bus','Transport'],['Activity','waves','Activities'],['Restaurant','utensils','Restaurants']];
  const getList=()=>{ let list=SERVICES.filter(s=>(st.cat==='All'?s.category!=='Restaurant':s.category===st.cat) && s.price<=st.maxP && (!st.q||s.name.toLowerCase().indexOf(st.q.toLowerCase())>=0) && (!st.facs.length||st.facs.every(f=>(s.facilities||[]).indexOf(f)>=0)));
    if(st.sort==='price-asc') list.sort((a,b)=>a.price-b.price); else if(st.sort==='price-desc') list.sort((a,b)=>b.price-a.price); else list.sort((a,b)=>b.rating-a.rating);
    return list; };
  const facOpts=['Wi-Fi','Pool','Restaurant','Parking','Air Conditioning'];
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="margin-bottom:26px"><span class="eyebrow">Services \u00b7 official providers</span><h1 style="font-size:clamp(1.6rem,3vw,2.1rem)">Search &amp; filter every service</h1></div>'
  +'<div style="display:grid;grid-template-columns:270px 1fr;gap:26px;align-items:flex-start" id="svcLayout">'
  +'<aside class="card-surface reveal" style="padding:20px;position:sticky;top:96px;display:flex;flex-direction:column;gap:20px">'
  +'<div class="field"><label>Search</label><input id="svcSearch" placeholder="Search by name\u2026" value="'+esc(st.q)+'"></div>'
  +'<div><label style="font-size:.78rem;font-weight:700;color:var(--ink-soft);display:block;margin-bottom:8px">Category</label><div style="display:flex;flex-direction:column;gap:6px">'+CATS.map(c=>'<button class="tab-btn" style="justify-content:flex-start" data-svccat="'+c[0]+'">'+ic(c[1])+c[2]+'</button>').join('')+'</div></div>'
  +'<div class="field"><label>Max price <span style="color:var(--faint);font-weight:500">(per night / way)</span></label><input type="range" id="svcPrice" min="0" max="250000" step="5000" value="'+st.maxP+'"><div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--mist)"><span>0</span><span id="svcPriceV">'+money(st.maxP)+' MMK</span></div></div>'
  +'<div><label style="font-size:.78rem;font-weight:700;color:var(--ink-soft);display:block;margin-bottom:8px">Facilities</label><div style="display:flex;flex-direction:column;gap:8px">'+facOpts.map(f=>'<label style="display:flex;gap:8px;align-items:center;font-size:.84rem"><input type="checkbox" class="svcFac" value="'+f+'"> '+esc(f)+'</label>').join('')+'</div></div>'
  +'<div class="field"><label>Sort by</label><select id="svcSort"><option value="top">Top Rated</option><option value="price-asc">Price: Low \u2192 High</option><option value="price-desc">Price: High \u2192 Low</option></select></div>'
  +'<button class="link" onclick="Pages._svcClear()">'+ic('x')+' Clear all filters</button>'
  +'</aside>'
  +'<div>'
  +'<div class="reveal" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px"><span style="font-size:.88rem;color:var(--mist)">Showing <b id="svcCount" style="color:var(--ink)">0</b> services</span></div>'
  +'<div id="svcResults" class="grid grid-3"></div>'
  +'</div></div></div>';
  const render=()=>{ const list=getList(); root.querySelector('#svcCount').textContent=list.length;
    root.querySelector('#svcResults').innerHTML=list.length?list.map(s=>UI.serviceCard(s)).join(''):'<div class="empty-state" style="grid-column:1/-1"><div class="ic">'+ic('search')+'</div><h3>No services match these filters</h3><p>Try widening the price range or clearing a facility.</p></div>';
    paintIcons(root); if(window.MTPReactions) MTPReactions.hydrateVisible(); UI.reveal(root.querySelector('#svcResults'));
    root.querySelectorAll('[data-svccat]').forEach(b=>b.classList.toggle('active',b.dataset.svccat===st.cat));
  };
  root.querySelectorAll('[data-svccat]').forEach(b=>b.onclick=()=>{ st.cat=b.dataset.svccat; render(); });
  root.querySelector('#svcSearch').oninput=e=>{ st.q=e.target.value; render(); };
  root.querySelector('#svcPrice').oninput=e=>{ st.maxP=+e.target.value; root.querySelector('#svcPriceV').textContent=money(st.maxP)+' MMK'; render(); };
  root.querySelector('#svcSort').onchange=e=>{ st.sort=e.target.value; render(); };
  root.querySelectorAll('.svcFac').forEach(c=>c.onchange=()=>{ st.facs=[].slice.call(root.querySelectorAll('.svcFac:checked')).map(x=>x.value); render(); });
  render();
};
Pages._svcClear=function(){ Pages._svcState={cat:'All',maxP:250000,facs:[],q:'',sort:'top'}; Nav.go('services'); };

/* ---------------- SERVICE DETAIL (browse — reference options, no add) ---------------- */
Pages.service = function(root,id){
  const s=svcById(id); if(!s){ root.innerHTML='<div class="page-pad page-pad-top container empty-state">Service not found.</div>'; return; }
  const d=destById(s.destination); const prov=providerName(s.provider);
  const PRICE_LABEL={per_night:'per night',per_stay:'per stay',per_way_per_person:'per way / person',per_person:'per person',per_dish_reference:'per dish \u00b7 reference'};
  const variants=s.roomTypes||s.officialSchedules||[];
  let optionsSection='';
  if(variants.length){ const isHotel=s.category==='Hotel';
    optionsSection='<section class="section reveal card-surface" style="padding:24px 26px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="color:var(--lagoon)">'+ic(isHotel?'bed':(s.category==='Transport'?'bus':'waves'))+'</span><div><span class="eyebrow">Reference</span><h3 style="font-size:1.1rem">'+(isHotel?'Room types &amp; pricing':(s.category==='Transport'?'Official departure schedules':'Activity options'))+'</h3></div></div>'
    +'<p style="color:var(--mist);font-size:.85rem;margin-bottom:16px">For comparison \u2014 build a trip to add this to your own plan.</p>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'+variants.map(v=>{
      const metaBits=[]; if(v.beds) metaBits.push(esc(v.beds)); if(v.capacity) metaBits.push('Sleeps '+v.capacity); if(v.departureTime) metaBits.push('Departs '+esc(v.departureTime)); if(v.operator) metaBits.push(esc(v.operator)); if(v.duration) metaBits.push('Duration '+esc(v.duration)); if(v.startTime) metaBits.push('Starts '+esc(v.startTime));
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border:1px solid var(--line);border-radius:14px;flex-wrap:wrap;gap:10px"><div><b>'+esc(v.name)+'</b>'+(metaBits.length?'<div style="font-size:.78rem;color:var(--mist);margin-top:3px">'+metaBits.join(' \u00b7 ')+'</div>':'')+'</div>'+UI.price(v.price,PRICE_LABEL[s.pricing_type]||'MMK')+'</div>'; }).join('')
    +'</div></section>'; }
  let cuisineSection='';
  if(s.category==='Restaurant'){ cuisineSection='<section class="section reveal card-surface" style="padding:24px 26px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="color:var(--c-restaurant)">'+ic('utensils')+'</span><div><span class="eyebrow">Reference only</span><h3 style="font-size:1.1rem">'+esc(s.cuisine||'Menu')+'</h3></div></div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">'+(s.menu||[]).map(m=>'<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed var(--line)"><span>'+esc(m.name)+'</span><b class="mono-num">'+money(m.price)+' MMK</b></div>').join('')+'</div>'
    +'<div class="note-box note-info">'+ic('info')+'<span>'+esc(s.priceNote||'Reference only \u2014 not added to your estimate.')+'</span></div></section>'; }
  const related=SERVICES.filter(x=>x.destination===s.destination&&x.id!==s.id&&x.category!=='Restaurant').slice(0,3);
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go('+(s.category==='Restaurant'?'\'restaurants\'':'\'services\'')+')">'+ic('arrowL')+' Back</button>'
  +'<div class="reveal" style="display:grid;grid-template-columns:1.1fr .9fr;gap:0;border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--shadow-lg)">'
  +'<div style="position:relative;min-height:320px">'+UI.poster(s)+'<div style="position:absolute;top:16px;left:16px">'+UI.catBadge(s.category)+'</div><div style="position:absolute;top:16px;right:16px">'+UI.saveHeart(s.id)+'</div></div>'
  +'<div style="padding:30px;background:var(--card);display:flex;flex-direction:column">'
  +'<h1 style="font-size:1.7rem;margin-bottom:8px">'+esc(s.name)+'</h1>'
  +'<div style="display:flex;gap:14px;flex-wrap:wrap;color:var(--mist);font-size:.85rem;font-weight:600;margin-bottom:16px">'
  +'<span>'+ic('pin')+esc(s.location)+'</span>'+(prov?'<span>'+ic('building')+esc(prov)+'</span>':'')+(s.rating?'<span>'+UI.stars(s.rating)+' '+s.rating+' ('+s.reviews+')</span>':'')+'</div>'
  +UI.likeDislike(s)
  +'<p style="color:var(--ink-soft);line-height:1.7;margin:16px 0 20px">'+esc(s.description)+'</p>'
  +'<div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--line)">'
  +'<span class="eyebrow">Starting from</span><div style="font-size:1.7rem;font-weight:800;font-family:var(--font-data);margin:4px 0 16px">'+money(s.price)+' <small style="font-size:.9rem;color:var(--mist);font-weight:600">'+esc(PRICE_LABEL[s.pricing_type]||s.priceUnit)+'</small></div>'
  +'<div style="display:flex;gap:10px;flex-wrap:wrap">'
  +'<button class="btn btn-primary" onclick="App.openOfficial(\''+s.id+'\')">'+ic('external')+' Visit Official Website</button>'
  +'<button class="btn btn-ghost" onclick="FB.open(\''+s.id+'\',\''+esc(s.name).replace(/'/g,"\\'")+'\')">'+ic('chat')+' Feedback</button>'
  +'</div></div></div></div>'
  +optionsSection+cuisineSection
  +(s.facilities&&s.facilities.length?'<section class="section reveal"><h3 style="margin-bottom:12px">What stands out</h3><div style="display:flex;flex-wrap:wrap;gap:8px">'+s.facilities.map(f=>'<span class="chip">'+esc(f)+'</span>').join('')+'</div></section>':'')
  +(related.length?'<section class="section reveal"><div class="sec-head"><h2>More from '+esc(d.name)+'</h2></div><div class="grid grid-3">'+related.map(x=>UI.serviceCard(x)).join('')+'</div></section>':'')
  +'</div>';
};

/* ---------------- RESTAURANTS GUIDE + card + detail (reference-only) ---------------- */
Pages._restaurantCard = function(s){
  const saved=State.saved.indexOf(s.id)>=0;
  return '<div class="svc-card reveal" style="cursor:pointer" onclick="Nav.go(\'restaurant\',\''+s.id+'\')">'
  +'<div class="svc-media">'+UI.poster(s)+'<div class="svc-overlay-top"><span class="badge badge-ref">'+ic('info')+' Reference</span><div style="display:flex;gap:8px">'+UI.compareToggleBtn(s)+UI.saveHeart(s.id)+'</div></div></div>'
  +'<div class="svc-body"><div style="display:flex;justify-content:space-between"><b>'+esc(s.name)+'</b>'+UI.stars(s.rating)+'</div>'
  +'<div class="svc-loc">'+ic('pin')+esc(s.location)+'</div>'
  +'<div style="font-size:.8rem;color:var(--mist)">'+esc(s.cuisine)+' \u00b7 '+(s.menu||[]).length+' dishes listed</div>'
  +UI.likeDislike(s)
  +'<div class="svc-foot"><span class="fact-chip">'+ic('utensils')+' Pay per dish</span><button class="btn btn-ghost btn-sm">'+ic('list')+' Menu</button></div></div></div>';
};
Pages.restaurants = function(root,destId){
  const list=SERVICES.filter(s=>s.category==='Restaurant'&&(!destId||s.destination===destId));
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'explore\')">'+ic('arrowL')+' Back</button>'
  +'<div class="reveal" style="margin-bottom:20px"><span class="eyebrow">Reference only</span><h1 style="font-size:1.9rem">Dining Guide</h1><p style="color:var(--mist);max-width:60ch;margin-top:6px">Menus, locations &amp; official sites. Restaurant costs depend on what you order, so they are never added to your trip estimate.</p></div>'
  +'<div class="grid grid-3">'+(list.map(s=>Pages._restaurantCard(s)).join('')||'<div class="empty-state">No restaurants.</div>')+'</div></div>';
};
Pages.restaurant = function(root,id){
  const s=svcById(id); if(!s){ root.innerHTML='<div class="page-pad page-pad-top container empty-state">Not found.</div>'; return; }
  const d=destById(s.destination);
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'restaurants\')">'+ic('arrowL')+' Back to Dining</button>'
  +'<div class="reveal" style="position:relative;height:280px;border-radius:var(--r-xl);overflow:hidden">'+UI.poster(s,'Restaurant','height:100%')
  +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;color:#fff"><span class="badge badge-ref" style="width:fit-content;margin-bottom:8px">Reference only</span><h1 style="color:#fff">'+esc(s.name)+'</h1>'
  +'<div style="display:flex;gap:14px;color:rgba(255,255,255,.85);font-size:.85rem;margin-top:6px">'+UI.stars(s.rating)+'<span>'+s.rating+' ('+s.reviews+')</span><span>'+ic('pin')+esc(s.location)+'</span></div></div></div>'
  +'<div class="grid" style="grid-template-columns:1.6fr 1fr;gap:24px;margin-top:26px">'
  +'<div>'
  +'<section class="section reveal card-surface" style="padding:24px"><h3 style="margin-bottom:8px">About</h3><p style="color:var(--mist);line-height:1.7">'+esc(s.description)+'</p></section>'
  +'<section class="section reveal card-surface" style="padding:24px"><h3 style="margin-bottom:14px">Popular Menu</h3><div style="display:flex;flex-direction:column;gap:8px">'+(s.menu||[]).map(m=>'<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px dashed var(--line)"><span>'+esc(m.name)+'</span><b class="mono-num">'+money(m.price)+' MMK</b></div>').join('')+'</div>'
  +'<div class="note-box note-info" style="margin-top:14px">'+ic('info')+'<span>'+esc(s.priceNote)+'</span></div></section>'
  +'</div>'
  +'<aside class="card-surface reveal" style="padding:24px;height:fit-content;display:flex;flex-direction:column;gap:12px">'
  +'<button class="btn btn-secondary" onclick="App.openOfficial(\''+s.id+'\')">'+ic('external')+' Visit Official Website</button>'
  +'<button class="btn btn-ghost" onclick="Nav.go(\'map\',{focus:\''+s.id+'\'})">'+ic('map')+' View on Map</button>'
  +UI.saveTextBtn(s.id,'Save')
  +'<button class="btn btn-ghost" onclick="FB.open(\''+s.id+'\',\''+esc(s.name).replace(/'/g,"\\'")+'\')">'+ic('chat')+' Give feedback</button>'
  +'</aside></div></div>';
};

/* ---------------- PACKAGES + PACKAGE DETAIL ---------------- */
Pages.packages = function(root){
  let badge='All';
  const render=()=>{ const q=Nav.searchQuery;
    let list=badge==='All'?PACKAGES:PACKAGES.filter(p=>p.badge===badge);
    if(q) list=list.filter(p=>p.name.toLowerCase().indexOf(q)>=0||destById(p.destination).name.toLowerCase().indexOf(q)>=0||providerName(p.provider).toLowerCase().indexOf(q)>=0);
    root.querySelector('#pkgGrid').innerHTML=list.length?list.map(p=>UI.packageCard(p)).join(''):('<div class="empty-state">'+(q?'No packages match \u201c'+esc(Nav.searchQuery)+'\u201d.':'No packages.')+'</div>'); paintIcons(root); if(window.MTPReactions) MTPReactions.hydrateVisible(); UI.reveal(root.querySelector('#pkgGrid')); };
  const pills=['All','Best Seller','Family Friendly','Luxury','Budget'];
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'explore\')">'+ic('arrowL')+' Back</button>'
  +'<div class="reveal" style="margin-bottom:20px"><span class="eyebrow">Pick a package, skip the planning</span><h1 style="font-size:1.9rem">Full Travel Packages</h1></div>'
  +'<div class="tabs-row reveal" style="margin-bottom:22px">'+pills.map(b=>'<button class="tab-btn" data-b="'+b+'">'+esc(b)+'</button>').join('')+'</div>'
  +'<div class="grid grid-3" id="pkgGrid"></div></div>';
  root.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ badge=b.dataset.b; root.querySelectorAll('[data-b]').forEach(x=>x.classList.toggle('active',x===b)); render(); });
  root.querySelector('[data-b="All"]').classList.add('active');
  render();
};
Pages.package = function(root,id){
  const p=pkgById(id); if(!p){ root.innerHTML='<div class="page-pad page-pad-top container empty-state">Not found.</div>'; return; }
  const d=destById(p.destination); const prov=providerName(p.provider);
  const related=PACKAGES.filter(x=>x.destination===p.destination&&x.id!==p.id);
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'packages\')">'+ic('arrowL')+' Back to Packages</button>'
  +'<div class="reveal" style="position:relative;height:300px;border-radius:var(--r-xl);overflow:hidden">'+UI.poster(p,'Package','height:100%')
  +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:30px;color:#fff">'
  +'<div style="display:flex;gap:8px;margin-bottom:8px"><span class="badge badge-rec">'+esc(p.badge)+'</span><span class="badge badge-soft" style="background:rgba(255,255,255,.2);color:#fff">'+esc(prov)+'</span></div>'
  +'<h1 style="color:#fff;font-size:clamp(1.6rem,3vw,2.3rem)">'+esc(p.name)+'</h1>'
  +'<div style="display:flex;gap:16px;color:rgba(255,255,255,.88);font-size:.86rem;margin-top:8px;flex-wrap:wrap"><span>'+ic('calendar')+esc(p.duration)+'</span><span>'+ic('bed')+p.nights+' Nights</span><span>'+ic('pin')+esc(d.name)+'</span><span>'+UI.stars(p.rating)+' '+(p.rating?p.rating+' ('+p.reviews+')':'No ratings yet')+'</span></div></div></div>'
  +'<div class="grid" style="grid-template-columns:1.6fr 1fr;gap:24px;margin-top:26px">'
  +'<div>'
  +'<div class="reveal" style="margin-bottom:14px">'+UI.likeDislike(p)+'</div>'
  +'<section class="section reveal card-surface" style="padding:24px"><span class="eyebrow">Overview</span><h3 style="margin-bottom:10px">About this trip</h3><p style="color:var(--mist);line-height:1.7">'+esc(p.description)+'</p>'
  +'<div class="grid grid-3" style="margin-top:16px">'+Object.keys(p.tripDetails).map(k=>'<div style="padding:12px;background:var(--pearl-2);border-radius:12px"><div style="font-size:.7rem;text-transform:uppercase;color:var(--mist);font-weight:700">'+esc(k.replace(/([A-Z])/g,' $1'))+'</div><b>'+esc(p.tripDetails[k])+'</b></div>').join('')+'</div></section>'
  +'<section class="section reveal card-surface" style="padding:24px"><span class="eyebrow">Included</span><h3 style="margin-bottom:14px">What this package covers</h3><div style="display:flex;flex-direction:column;gap:9px">'+p.includedServices.map(x=>'<div style="display:flex;gap:8px;align-items:center;font-size:.88rem"><span style="color:var(--ok)">'+ic('check')+'</span>'+esc(x)+'</div>').join('')+'</div></section>'
  +'<section class="section reveal card-surface" style="padding:24px"><span class="eyebrow">Itinerary</span><h3 style="margin-bottom:14px">Day by day</h3><div style="display:flex;flex-direction:column">'+p.itinerary.map(dday=>'<div style="display:flex;gap:16px;padding:12px 0;border-bottom:1px dashed var(--line)"><span style="width:32px;height:32px;border-radius:50%;background:var(--lagoon);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex:none">'+dday.day+'</span><div><b>'+esc(dday.title)+'</b><p style="color:var(--mist);font-size:.85rem;margin-top:2px">'+esc(dday.desc)+'</p></div></div>').join('')+'</div></section>'
  +'</div>'
  +'<aside class="card-surface reveal" style="padding:24px;height:fit-content;display:flex;flex-direction:column;gap:12px">'
  +'<span class="eyebrow">From</span><div style="font-size:1.6rem;font-weight:800;font-family:var(--font-data)">'+money(p.price)+' <small style="font-size:.85rem;color:var(--mist);font-weight:600">MMK / person</small></div>'
  +'<button class="btn btn-primary" onclick="App.openOfficial(\''+p.id+'\')">'+ic('external')+' Visit Official Website</button>'
  +UI.saveTextBtn(p.id,'Save Package')
  +'<button class="btn btn-ghost" onclick="FB.open(\''+p.id+'\',\''+esc(p.name).replace(/'/g,"\\'")+'\')">'+ic('chat')+' Give feedback</button>'
  +'</aside></div>'
  +(related.length?'<section class="section reveal" style="margin-top:36px"><h2 style="margin-bottom:16px">More for '+esc(d.name)+'</h2><div class="grid grid-3">'+related.map(x=>UI.packageCard(x)).join('')+'</div></section>':'')
  +'</div>';
};


/* ================================================================
   BUILD MY TRIP — the ONLY place that adds items to a plan. Uses
   the planner drawer to set an explicit qty (hotels: Rooms AND
   Nights, two independent numbers) per BUSINESS_RULES.md.
   ================================================================ */
Pages._build={step:1,tab:'hotel'};
Pages._buildRefresh=function(){ const host=document.getElementById('viewHost'); Pages.build(host); paintIcons(host); if(window.MTPReactions) MTPReactions.hydrateVisible(); Nav.renderSidebarPlanCard(); };
Pages.build = function(root){
  const b=Pages._build;
  if(State.isGuest){ root.innerHTML='<div class="page-pad page-pad-top container">'
    +'<div class="card-surface reveal" style="padding:52px 32px;text-align:center;max-width:480px;margin:40px auto">'
    +'<div style="width:56px;height:56px;border-radius:50%;background:var(--pearl-2);display:flex;align-items:center;justify-content:center;color:var(--lagoon);margin:0 auto 18px">'+ic('sparkles')+'</div>'
    +'<h2 style="margin-bottom:8px">Build a trip</h2><p style="color:var(--mist);margin-bottom:22px">Sign in to start planning \u2014 your trips save as you go.</p>'
    +'<button class="btn btn-primary" onclick="Auth.gate(\'build a trip\')">'+ic('arrowR')+' Sign in</button></div></div>'; return; }
  let plan=activePlan();
  if(!plan){
    const draft=State.plans.find(p=>p.status==='draft'||p.status==='active');
    if(draft){ plan=draft; State.activePlanId=draft.id; }
  }
  if(!plan){
    root.innerHTML='<div class="page-pad page-pad-top container">'
    +'<div class="card-surface reveal" style="padding:52px 32px;text-align:center;max-width:480px;margin:40px auto">'
    +'<div style="width:56px;height:56px;border-radius:50%;background:var(--pearl-2);display:flex;align-items:center;justify-content:center;color:var(--lagoon);margin:0 auto 18px">'+ic('sparkles')+'</div>'
    +'<h2 style="margin-bottom:8px">No trip yet</h2><p style="color:var(--mist);margin-bottom:22px">Start a new trip to pick a beach, dates and a budget \u2014 then add services to it.</p>'
    +'<button class="btn btn-primary" onclick="Pages._newPlan()">'+ic('sparkles')+' Start a trip</button></div></div>'; return; }
  const snap=computeSnapshot(plan);
  const destName=destById(plan.destination).name;
  const STEPS=[['Trip Info','Where & when','info'],['Choose & Confirm','Add services, then lock it in','layers']];
  const fillPct=b.step===1?0:100;
  const stepper='<div class="tide-steps reveal"><div class="fill" style="width:'+fillPct+'%"></div>'
    +STEPS.map((m,i)=>{ const n=i+1; const done=b.step>n; const active=b.step===n;
      return '<div class="tide-stone '+(active?'active':(done?'done':''))+'" onclick="Pages._build.step='+n+';Nav.go(\'build\')" style="cursor:pointer"><div class="tide-dot">'+(done?ic('check'):n)+'</div><b>'+m[0]+'</b><small>'+m[1]+'</small></div>'; }).join('')+'</div>';

  const tripHero='<div class="card-surface reveal" style="padding:18px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:22px">'
    +'<span style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--lagoon),var(--lagoon-2));color:#fff;display:flex;align-items:center;justify-content:center;flex:none">'+ic('compass')+'</span>'
    +'<div><b id="tripHeroName">'+esc(plan.name)+'</b><div id="tripHeroDest" style="font-size:.8rem;color:var(--mist)">'+esc(destName)+'</div></div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:auto">'
    +'<span class="fact-chip fact-chip-edit" id="tripHeroDate">'+ic('calendar')+'<input type="date" value="'+plan.startDate+'" onchange="Pages._buildSetField(\'startDate\',this.value)"><span>\u2192</span><input type="date" value="'+plan.endDate+'" onchange="Pages._buildSetField(\'endDate\',this.value)"></span>'
    +'<span class="fact-chip" id="tripHeroTrav">'+ic('users')+plan.travelers+' \u00b7 '+esc(plan.travelGroup)+'</span>'
    +'<span class="fact-chip" id="tripHeroBudget">'+ic('wallet')+'Budget '+money(plan.budget)+' MMK</span>'
    +'<span class="status-pill status-'+plan.status+'" id="tripHeroStatus">'+esc(plan.status)+'</span></div></div>';

  let body='', fab='';
  if(b.step===1){
    body='<div class="card-surface reveal" style="padding:26px">'
    +'<div style="display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:16px;margin-bottom:22px;background:linear-gradient(120deg,var(--abyss),var(--abyss-3));color:#fff">'
    +'<span style="width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;flex:none">'+ic('waves')+'</span>'
    +'<div><b style="font-family:var(--font-display);font-size:1.05rem">Where\'s the shore this time?</b><div style="font-size:.8rem;color:rgba(255,255,255,.75);margin-top:2px">Pick a beach or fix any detail below \u2014 it saves instantly, nothing to submit.</div></div>'
    +'</div>'
    +'<div class="reveal" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:22px">'+DESTINATIONS.map(d=>'<button type="button" class="chip'+(d.id===plan.destination?' active':'')+'" data-dest="'+d.id+'" style="white-space:nowrap" onclick="Pages._buildPickDest(\''+d.id+'\')">'+ic('pin')+esc(d.name)+'</button>').join('')+'</div>'
    +'<div class="grid grid-2">'
    +'<div class="field"><label>Trip Name</label><input value="'+esc(plan.name)+'" onchange="Pages._buildSetField(\'name\',this.value)"></div>'
    +'<div class="field"><label>Destination</label><select id="fldDest" onchange="Pages._buildSetField(\'destination\',this.value)">'+DESTINATIONS.map(d=>'<option value="'+d.id+'"'+(d.id===plan.destination?' selected':'')+'>'+esc(d.name)+'</option>').join('')+'</select></div>'
    +'<div class="field"><label>Start Date</label><input type="date" value="'+plan.startDate+'" onchange="Pages._buildSetField(\'startDate\',this.value)"></div>'
    +'<div class="field"><label>End Date</label><input type="date" value="'+plan.endDate+'" onchange="Pages._buildSetField(\'endDate\',this.value)"></div>'
    +'<div class="field"><label>Travelers</label><input type="number" min="1" value="'+plan.travelers+'" onchange="Pages._buildSetField(\'travelers\',this.value)"></div>'
    +'<div class="field"><label>Budget (MMK)</label><input type="number" min="0" value="'+plan.budget+'" onchange="Pages._buildSetField(\'budget\',this.value)"></div>'
    +'</div>'
    +'<button class="btn btn-primary" style="margin-top:22px" onclick="Pages._build.step=2;Nav.go(\'build\')">Save &amp; Choose Services '+ic('arrowR')+'</button>'
    +'</div>';
  } else {
    const destServices=SERVICES.filter(s=>s.destination===plan.destination&&s.category!=='Restaurant');
    const recs=Compute.recommendations(destServices,{nights:Compute.tripDays(plan),travelers:plan.travelers,budget:plan.budget,destination:plan.destination,group:plan.travelGroup,purpose:plan.purpose,budgetPer:plan.budget/Math.max(1,plan.travelers)}).slice(0,6);
    const TABS=[['hotel','Hotels','building','Hotel'],['out','Outbound','bus','Transport'],['activity','Activities','waves','Activity'],['dining','Dining','utensils','Restaurant']];
    const tabBar=TABS.map(t=>{ const cnt=SERVICES.filter(s=>s.destination===plan.destination&&s.category===t[3]).length;
      return '<button class="tab-btn'+(b.tab===t[0]?' active':'')+'" onclick="Pages._build.tab=\''+t[0]+'\';Pages._buildRefresh()">'+ic(t[2])+t[1]+' <span class="cnt">'+cnt+'</span></button>'; }).join('');
    const tabCat={hotel:'Hotel',out:'Transport',activity:'Activity',dining:'Restaurant'}[b.tab];
    const tabServices=SERVICES.filter(s=>s.destination===plan.destination&&s.category===tabCat);
    body='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><b style="font-family:var(--font-display)">'+ic('sparkles')+' Picked for '+esc(destName)+'</b><span style="font-size:.78rem;color:var(--mist)">your budget shapes this list</span></div>'
    +'<div class="reveal" style="display:flex;gap:16px;overflow-x:auto;padding-bottom:14px;margin-bottom:24px">'+recs.map(r=>Pages._recCard(r.service,plan)).join('')+'</div>'
    +'<div class="tabs-row reveal" style="margin-bottom:20px">'+tabBar+'</div>'
    +'<div class="grid grid-3">'+tabServices.map(s=>Pages._planCard(s,plan)).join('')+'</div>';
    fab=Pages._summaryFab(snap);
  }
  root.innerHTML='<div class="page-pad page-pad-top container"><div class="reveal" style="margin-bottom:6px"><span class="eyebrow">'+(b.step===1?'Step 1 of 2':'Step 2 of 2')+'</span><h1 style="font-size:1.7rem">'+(b.step===1?'Plan a New Trip':esc(plan.name))+'</h1></div>'
  +stepper+tripHero+body+'</div>'+fab;
};
Pages._buildPickDest=function(id){
  const plan=activePlan(); if(!plan) return;
  plan.destination=id;
  const sel=document.getElementById('fldDest'); if(sel) sel.value=id;
  document.querySelectorAll('[data-dest]').forEach(function(el){ el.classList.toggle('active', el.getAttribute('data-dest')===id); });
  Pages._buildUpdateHero(plan);
};
Pages._buildSetField=function(key,val){
  const plan=activePlan(); if(!plan) return;
  if(key==='travelers') val=Math.max(1,Math.round(+val||1));
  else if(key==='budget') val=Math.max(0,Math.round(+val||0));
  plan[key]=val;
  if(key==='destination'){ document.querySelectorAll('[data-dest]').forEach(function(el){ el.classList.toggle('active', el.getAttribute('data-dest')===val); }); }
  Pages._buildUpdateHero(plan);
};
Pages._buildUpdateHero=function(plan){
  plan=plan||activePlan(); if(!plan) return;
  const set=function(id,html){ const el=document.getElementById(id); if(el) el.innerHTML=html; };
  set('tripHeroName',esc(plan.name));
  set('tripHeroDest',esc(destById(plan.destination).name));
  set('tripHeroDate',ic('calendar')+esc(plan.startDate)+' \u2192 '+esc(plan.endDate));
  set('tripHeroTrav',ic('users')+plan.travelers+' \u00b7 '+esc(plan.travelGroup));
  set('tripHeroBudget',ic('wallet')+'Budget '+money(plan.budget)+' MMK');
  paintIcons(document.getElementById('viewHost')||document);
  Nav.renderSidebarPlanCard();
};

/* floating button while browsing — opens the Trip dialog; count badge tracks items */
Pages._summaryFab=function(snap){
  if(!snap.items.length) return '';
  return '<button class="reveal build-fab" onclick="TripDialog.open()" title="View your trip">'
  +ic('list')+'<span class="build-fab-badge">'+snap.items.length+'</span></button>';
};

Pages._confirmPlan=async function(){ const p=activePlan(); if(!p) return;
  try{ await API.plans.updateStatus(p.id,'active'); }
  catch(e){ UI.toast(e.message||'Could not confirm this plan','error'); return; }
  UI.toast('Plan confirmed \u2014 visit each official site to complete your bookings','success');
  TripDialog.close(); Nav.go('plan',p.id); };
Pages._recCard=function(s,plan){ const inPlan=plan.items.some(i=>i.refId===s.id);
  return '<div class="svc-card reveal" style="min-width:220px;max-width:220px;flex:none;cursor:pointer" onclick="Drawer.open(\''+s.id+'\')">'
  +'<div class="svc-media" style="height:110px">'+UI.poster(s)+'<div class="svc-overlay-top">'+UI.ratingPill(s)+(inPlan?'<span class="badge" style="background:var(--ok);color:#fff">'+ic('check')+'</span>':'')+'</div></div>'
  +'<div class="svc-body" style="padding:12px 14px"><b style="font-size:.86rem">'+esc(s.name)+'</b><div class="svc-foot" style="margin-top:6px">'+UI.price(s.price,s.priceUnit)+'<span class="fact-chip">'+ic('layers')+' Set qty</span></div></div></div>'; };
Pages._planCard=function(s,plan){ const inPlan=plan.items.some(i=>i.refId===s.id);
  if(s.category==='Restaurant') return Pages._restaurantCard(s);
  return '<div class="plan-svc-card reveal" style="cursor:pointer" onclick="Drawer.open(\''+s.id+'\')">'
  +'<div class="plan-svc-media">'+UI.poster(s)+'<div class="svc-overlay-top">'+UI.ratingPill(s)+(inPlan?'<span class="badge" style="background:var(--ok);color:#fff">'+ic('check')+' Added</span>':'')+'</div></div>'
  +'<div class="plan-svc-body"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><b class="svc-title">'+esc(s.name)+'</b>'+UI.catBadge(s.category)+'</div>'
  +'<div class="svc-loc">'+ic('pin')+esc(s.location)+(s.rating?' \u00b7 '+UI.stars(s.rating)+' '+s.rating:'')+'</div>'
  +'<p class="plan-svc-desc">'+esc(s.description)+'</p>'
  +'<div class="plan-svc-facts">'+(s.facilities||[]).slice(0,3).map(f=>'<span class="fact-chip" style="background:var(--pearl-2);padding:3px 8px;border-radius:99px">'+esc(f)+'</span>').join('')+'</div>'
  +UI.likeDislike(s)
  +'<div class="svc-foot">'+UI.price(s.price,s.priceUnit)+'<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();Drawer.open(\''+s.id+'\')">'+ic('plus')+' Set qty</button></div></div></div>'; };
Pages._tripItemRow=function(it,plan){ const dropped=it.item_status==='failed'||it.item_status==='disliked';
  const nights=Compute.itemNights(it,plan); const tot=Compute.itemLineTotal(it,plan);
  const qtyLabel='Qty '+it.qty+(it.category==='Hotel'?(' room'+(it.qty===1?'':'s')+' \u00b7 '+nights+' night'+(nights===1?'':'s')):'');
  return '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line)'+(dropped?';opacity:.5':'')+'">'
  +'<span style="width:30px;height:30px;border-radius:9px;background:'+CAT_COLOR[it.category]+';color:#fff;display:flex;align-items:center;justify-content:center;flex:none">'+ic(CAT_ICON[it.category])+'</span>'
  +'<div style="flex:1;min-width:0"><b style="font-size:.82rem">'+esc(it.name)+'</b><div style="font-size:.72rem;color:var(--mist)">'+(it.variant_name_snapshot?esc(it.variant_name_snapshot)+' \u00b7 ':'')+qtyLabel+(it.direction?' \u00b7 '+(it.direction==='out'?'Outbound':'Return'):'')+'</div>'
  +'<div style="display:flex;align-items:center;gap:8px;margin-top:5px"><b class="mono-num" style="font-size:.82rem">'+money(tot)+' MMK</b>'
  +'<button class="iconbtn" style="width:26px;height:26px" title="Official site" onclick="App.openOfficial(\''+it.refId+'\')">'+ic('external')+'</button>'
  +'<button class="iconbtn" style="width:26px;height:26px;color:var(--danger)" title="Remove" onclick="App.removeItem(\''+plan.id+'\',\''+it.id+'\')">'+ic('trash')+'</button></div></div></div>'; };

/* ---- honest sequence: outbound -> stay -> do -> return ---- */
Pages._itinerary=function(plan){
  const items=plan.items;
  if(!items.length) return '<div class="empty-state"><div class="ic">'+ic('list')+'</div><h3>No services yet</h3><p>Go back and add stays, rides and activities.</p></div>';
  const BUCKET=it=>it.category==='Transport'?(it.direction==='back'?'back':'out'):(it.category==='Hotel'?'stay':'do');
  const RANK={out:0,stay:1,do:2,back:3};
  const ordered=items.slice().sort((a,b)=>RANK[BUCKET(a)]-RANK[BUCKET(b)]);
  let h='<div style="display:flex;flex-direction:column;gap:14px">';
  ordered.forEach((it,idx)=>{ const dropped=it.item_status==='failed'||it.item_status==='disliked';
    const nights=Compute.itemNights(it,plan); const tot=Compute.itemLineTotal(it,plan);
    const dirLabel=it.category==='Transport'?(it.direction==='out'?'Outbound':'Return'):(it.category==='Hotel'?(nights+' night'+(nights>1?'s':'')):it.category);
    h+='<div class="card-surface reveal" style="padding:16px 18px;display:flex;gap:14px;align-items:flex-start'+(dropped?';opacity:.55':'')+'">'
    +'<span style="width:38px;height:38px;border-radius:50%;background:'+CAT_COLOR[it.category]+';color:#fff;display:flex;align-items:center;justify-content:center;flex:none;font-weight:800">'+(idx+1)+'</span>'
    +'<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="fact-chip" style="text-transform:uppercase;font-weight:800;letter-spacing:.06em;color:var(--faint)">Step '+(idx+1)+'</span>'
    +'<h4 style="font-size:1rem;margin-top:2px">'+esc(it.name)+(dropped?' <span class="badge badge-soft" style="color:var(--danger)">Removed from estimate</span>':'')+'</h4>'
    +'<div style="margin-top:4px">'+UI.catBadge(it.category)+' <span class="fact-chip">'+esc(dirLabel)+'</span></div></div><b class="price">'+money(tot)+'</b></div>'
    +'<div style="display:flex;gap:10px;margin-top:10px;align-items:center;flex-wrap:wrap">'
    +'<select class="field" style="width:auto;padding:8px 12px;border-radius:99px;font-size:.78rem;background:var(--card);border:1.5px solid var(--line);color:var(--ink-soft);font-weight:700" onchange="App.setItemStatus(\''+plan.id+'\',\''+it.id+'\',this.value)">'
    +['planned','confirmed','failed','disliked'].map(v=>'<option value="'+v+'"'+((it.item_status||'planned')===v?' selected':'')+'>'+({planned:'Planned',confirmed:'Confirmed',failed:'Unavailable',disliked:'Not suitable'}[v])+'</option>').join('')
    +'</select>'
    +'<button class="iconbtn" title="Official site" onclick="App.openOfficial(\''+it.refId+'\')">'+ic('external')+'</button>'
    +'<button class="iconbtn" style="color:var(--danger);margin-left:auto" onclick="App.removeItem(\''+plan.id+'\',\''+it.id+'\')">'+ic('trash')+'</button>'
    +'</div></div></div>'; });
  h+='</div>'; return h;
};

/* ================================================================
   PLANNER DRAWER — the only UI that sets quantity. Defaults follow
   pricing_type; hotels get two independent numbers (Rooms, Nights);
   everything is a plain, editable number, never a silent guess.
   ================================================================ */
const Drawer = {
  service:null,
  /* Room-capacity guess now lives in Compute (js/store.js) so the
     drawer's quantity default and the recommendation engine's budget
     scoring always agree on the same assumption. */
  defaultQty(service,variant){ const plan=activePlan(); const travelers=Math.max(1,plan.travelers||2); const pt=service.pricing_type||'';
    if(pt==='per_night'){ const cap=(variant&&variant.capacity)?+variant.capacity:Compute.guessCapacityFallback(variant&&variant.name); return Math.max(1,Math.ceil(travelers/cap)); }
    if(pt==='per_way_per_person'||pt==='per_person') return travelers;
    return 1; },
  defaultNights(){ const plan=activePlan(); if(plan.startDate&&plan.endDate){ const n=Math.round((new Date(plan.endDate)-new Date(plan.startDate))/86400000); return Math.max(1,n||1); } return 1; },
  unitLabel(pt){ return {per_night:'MMK / room / night',per_stay:'MMK / stay',per_way_per_person:'MMK / person',per_person:'MMK / person'}[pt]||'MMK'; },
  open(id){ const s=svcById(id); if(!s) return; this.service=s;
    const plan=activePlan();
    const variants=(s.category==='Transport'?(s.officialSchedules||[]):(s.roomTypes||[])).length?(s.category==='Transport'?s.officialSchedules:s.roomTypes):[{id:'base',name:'Standard',price:s.price}];
    document.getElementById('drawerHead').innerHTML='<div><h3>'+esc(s.name)+'</h3><div class="fact-chip">'+UI.catBadge(s.category)+'</div></div><button class="iconbtn drawer-close" onclick="Drawer.close()">'+ic('x')+'</button>';
    const infoPanel='<div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--pearl-2);border-radius:16px">'
      +'<div style="display:flex;gap:14px">'
      +'<div class="poster" style="width:88px;height:88px;border-radius:12px;flex:none">'+UI.poster(s)+'</div>'
      +'<div style="flex:1;min-width:0"><div class="fact-chip">'+ic('pin')+esc(s.location)+'</div>'
      +(s.rating?'<div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:.8rem;font-weight:700">'+UI.stars(s.rating)+' '+s.rating+' <span style="color:var(--mist);font-weight:500">('+s.reviews+' reviews)</span></div>':'')
      +(providerName(s.provider)?'<div class="fact-chip" style="margin-top:4px">'+ic('building')+esc(providerName(s.provider))+'</div>':'')
      +'</div></div>'
      +'<p style="color:var(--mist);font-size:.83rem;line-height:1.6;margin:0">'+esc(s.description||'')+'</p>'
      +(s.facilities&&s.facilities.length?'<div class="drawer-facility-row" style="margin-top:0">'+s.facilities.map(f=>'<span class="chip" style="font-size:.72rem;padding:5px 10px">'+esc(f)+'</span>').join('')+'</div>':'')
      +'</div>';
    document.getElementById('drawerBody').innerHTML=infoPanel
      +'<div style="display:flex;align-items:center;gap:8px;margin-top:4px"><b style="font-size:.86rem">'+ic('layers')+' Choose an option &amp; quantity</b></div>'
      +variants.map((v,i)=>this.variantRow(s,v,i)).join('');
    paintIcons(document.getElementById('drawerBody')); paintIcons(document.getElementById('drawerHead'));
    document.getElementById('drawerScrim').classList.add('show'); document.getElementById('plannerDrawer').classList.add('show');
    this.wire(); },
  close(){ document.getElementById('drawerScrim').classList.remove('show'); document.getElementById('plannerDrawer').classList.remove('show'); },
  variantRow(service,v,idx){ const price=+v.price||0; const isHotel=service.category==='Hotel';
    const subBits=[]; if(v.capacity) subBits.push(ic('users')+' Sleeps '+v.capacity); if(v.departureTime) subBits.push(ic('clock')+' '+esc(v.departureTime)); if(v.beds) subBits.push(esc(v.beds)); if(v.duration) subBits.push('Duration '+esc(v.duration));
    if(isHotel){ const dRooms=this.defaultQty(service,v), dNights=this.defaultNights();
      return '<div class="variant-row" data-vidx="'+idx+'" data-price="'+price+'" data-hotel="1">'
      +'<div class="variant-top"><div><b>'+esc(v.name)+'</b>'+(subBits.length?'<div class="variant-sub">'+subBits.join(' \u00b7 ')+'</div>':'')+'</div>'+UI.price(price,'MMK/room/night')+'</div>'
      +'<div class="qty-row"><div class="qty-block"><label>Rooms</label>'+this.stepper(idx,'rooms',dRooms,1)+'</div><div class="qty-block"><label>Nights</label>'+this.stepper(idx,'nights',dNights,1)+'</div></div>'
      +'<div class="variant-total"><span style="font-size:.82rem;color:var(--mist)">Total</span><b class="mono-num" data-total="'+idx+'">'+money(price*dRooms*dNights)+' MMK</b></div>'
      +'<button class="btn btn-primary btn-sm" onclick="Drawer.add('+idx+')">'+ic('plus')+' Add this room</button></div>'; }
    const dq=this.defaultQty(service,v);
    return '<div class="variant-row" data-vidx="'+idx+'" data-price="'+price+'">'
    +'<div class="variant-top"><div><b>'+esc(v.name)+'</b>'+(subBits.length?'<div class="variant-sub">'+subBits.join(' \u00b7 ')+'</div>':'')+'</div>'+UI.price(price,this.unitLabel(service.pricing_type))+'</div>'
    +'<div class="qty-block"><label>'+(service.category==='Transport'?'Tickets':'Participants')+'</label>'+this.stepper(idx,'qty',dq,1)+'</div>'
    +'<div class="variant-total"><span style="font-size:.82rem;color:var(--mist)">Total</span><b class="mono-num" data-total="'+idx+'">'+money(price*dq)+' MMK</b></div>'
    +'<button class="btn btn-primary btn-sm" onclick="Drawer.add('+idx+')">'+ic('plus')+' Add</button></div>'; },
  stepper(idx,field,val,min){ return '<div class="qty-stepper" data-idx="'+idx+'" data-field="'+field+'"><button type="button" data-step="-1">'+ICONS.minus+'</button><input type="number" min="'+(min||1)+'" value="'+val+'"><button type="button" data-step="1">'+ICONS.plus+'</button></div>'; },
  wire(){ const body=document.getElementById('drawerBody');
    body.querySelectorAll('.qty-stepper').forEach(st=>{ const input=st.querySelector('input');
      const recalc=()=>{ const row=st.closest('.variant-row'); const idx=row.dataset.vidx; const price=+row.dataset.price;
        const rooms=row.dataset.hotel?+row.querySelector('[data-field="rooms"] input').value:1;
        const nights=row.dataset.hotel?+row.querySelector('[data-field="nights"] input').value:1;
        const qty=row.dataset.hotel?1:+row.querySelector('[data-field="qty"] input').value;
        const total=row.dataset.hotel?price*rooms*nights:price*qty;
        row.querySelector('[data-total="'+idx+'"]').textContent=money(total)+' MMK'; };
      st.querySelectorAll('button').forEach(b=>b.onclick=()=>{ const d=+b.dataset.step; input.value=Math.max(+input.min||1,+input.value+d); recalc(); });
      input.oninput=recalc; }); },
  async add(idx){ const s=this.service; const row=document.querySelector('.variant-row[data-vidx="'+idx+'"]'); if(!row) return;
    const plan=activePlan(); if(!plan) return;
    const price=+row.dataset.price;
    const variants=(s.category==='Transport'?s.officialSchedules:s.roomTypes)||[{id:'base',name:'Standard',price:s.price}];
    const v=variants[idx]||{name:'Standard'};
    const btn=row.querySelector('button.btn-primary'); if(btn){ btn.disabled=true; }
    try{
      if(row.dataset.hotel){
        const rooms=+row.querySelector('[data-field="rooms"] input').value; const nights=+row.querySelector('[data-field="nights"] input').value;
        await API.plans.addItem(plan.id,s,{ quantity:rooms, notes:'nights='+nights, selectedUnitPrice:price, selectedTotalPrice:price*rooms*nights, selectedVariant:v.name!=='Standard'?v:null });
        UI.toast('Added \u201c'+s.name+' \u00b7 '+v.name+'\u201d \u2014 '+rooms+' room'+(rooms===1?'':'s')+', '+nights+' night'+(nights===1?'':'s'),'success');
      } else {
        const qty=+row.querySelector('[data-field="qty"] input').value;
        const opts={ quantity:qty, selectedUnitPrice:price, selectedTotalPrice:price*qty, selectedVariant:v.name!=='Standard'?v:null };
        if(s.category==='Transport'){ opts.direction=(plan.items.some(i=>i.refId===s.id&&i.direction==='out'))?'back':'out'; }
        await API.plans.addItem(plan.id,s,opts);
        UI.toast('Added \u201c'+s.name+'\u201d \u2014 qty '+qty,'success');
      }
    }catch(e){ UI.toast(e.message||'Could not add this to your trip','error'); if(btn) btn.disabled=false; return; }
    this.close(); Nav.go('build'); }
};

/* ================================================================
   FEEDBACK MODAL — like/dislike reasons, shared across pages.
   ================================================================ */
const FB = {
  ctx:null,
  REASONS:{price:'Price was different',info:'Information was incorrect',unavailable:'Service was unavailable',link:'Website/Link did not work',dislike:'Didn\u2019t like the service',other:'Other'},
  selected:new Set(),
  open(refId,name){ if(State.isGuest){ Auth.gate('leave feedback'); return; }
    this.ctx={refId,name}; this.selected=new Set();
    document.getElementById('fbTarget').textContent=name;
    document.getElementById('fbReasons').innerHTML=Object.keys(this.REASONS).map(k=>'<button class="chip" data-r="'+k+'">'+esc(this.REASONS[k])+'</button>').join('');
    document.getElementById('fbComment').value='';
    document.querySelectorAll('#fbReasons .chip').forEach(c=>c.onclick=()=>{ c.classList.toggle('active'); if(this.selected.has(c.dataset.r)) this.selected.delete(c.dataset.r); else this.selected.add(c.dataset.r); });
    document.getElementById('fbScrim').style.display='block'; document.getElementById('fbScrim').classList.add('show'); document.getElementById('fbModal').style.display='block'; },
  close(){ document.getElementById('fbScrim').classList.remove('show'); document.getElementById('fbScrim').style.display='none'; document.getElementById('fbModal').style.display='none'; },
  async submit(){ try{ await API.feedback.create({refId:this.ctx.refId,refName:this.ctx.name,reasons:Array.from(this.selected),comment:document.getElementById('fbComment').value.trim()}); }
    catch(e){ UI.toast(e.message||'Could not submit feedback','error'); return; }
    UI.toast('Thanks \u2014 feedback recorded','success'); this.close(); if(Nav.page==='history') Nav.refresh(); }
};

/* ---------------- MY PLANS ---------------- */
Pages.plans = function(root){
  const plans=State.plans;
  const nActive=plans.filter(p=>p.status==='active').length, nDraft=plans.filter(p=>p.status==='draft').length;
  const destCount=new Set(plans.map(p=>p.destination)).size;
  const stats=[['clipboard',plans.length,'Total plans','var(--lagoon)'],['sparkles',nActive,'Active trips','var(--dawn)'],['pin',destCount,'Destinations','var(--c-hotel)'],['pencil',nDraft,'Drafts','var(--warn)']];
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;flex-wrap:wrap;gap:12px"><div><span class="eyebrow">Your trips</span><h1 style="font-size:1.9rem">My Travel Plans</h1></div><button class="btn btn-primary" onclick="Pages._newPlan()">'+ic('plus')+' New Plan</button></div>'
  +'<div class="grid grid-4 reveal" style="margin-bottom:26px">'+stats.map(s=>'<div class="stat-tile"><span class="ic" style="background:'+s[3]+'">'+ic(s[0])+'</span><div><b>'+s[1]+'</b><span>'+s[2]+'</span></div></div>').join('')+'</div>'
  +'<div class="grid grid-3">'+plans.map(p=>{ const d=destById(p.destination); const t=Compute.total(p.items,p); const pct=p.budget?Math.min(100,Math.round(t/p.budget*100)):0; const over=p.budget&&t>p.budget;
    return '<article class="plan-card reveal" onclick="Nav.go(\'plan\',\''+p.id+'\')"><div class="plan-cover">'+UI.poster(d,'Destination','height:100%')+'<span class="status-pill status-'+p.status+'">'+esc(p.status)+'</span></div>'
    +'<div style="padding:16px 18px"><div style="display:flex;justify-content:space-between;align-items:flex-start"><h3 style="font-size:1.02rem">'+esc(p.name)+'</h3>'+ic('arrowR')+'</div>'
    +'<div style="display:flex;gap:12px;flex-wrap:wrap;margin:6px 0 12px" class="fact-chip"><span>'+ic('pin')+esc(d.name)+'</span><span>'+ic('calendar')+esc(p.startDate)+'</span><span>'+ic('users')+p.travelers+'</span></div>'
    +'<div class="tide-meter" style="height:8px"><i class="'+(over?'over':'')+'" style="width:'+pct+'%"></i></div>'
    +'<div style="display:flex;justify-content:space-between;margin-top:10px"><span class="price">'+money(t)+' <small>MMK</small></span><span class="fact-chip">'+pct+'% \u00b7 '+p.items.length+' item'+(p.items.length===1?'':'s')+'</span></div></div></article>'; }).join('')+'</div></div>';
};
Pages._newPlan=async function(){ if(State.isGuest){ Auth.gate('start planning a trip'); return; }
  let p; try{ p=await API.plans.create({name:'My New Trip',destination:(DESTINATIONS[0]||{}).id||'',startDate:'2026-12-01',endDate:'2026-12-04',travelers:2,budget:500000,travelGroup:'Friends',purpose:'Relaxation'}); }
  catch(e){ UI.toast(e.message||'Could not start a trip','error'); return; }
  API.plans.setActive(p.id); Pages._build.step=1; Nav.go('build'); };

/* ---------------- PLAN DETAIL ---------------- */
Pages.plan = function(root,id){
  const p=State.plans.find(x=>x.id===id); if(!p){ root.innerHTML='<div class="page-pad page-pad-top container empty-state">Plan not found.</div>'; return; }
  if(p.status==='draft'){ State.activePlanId=p.id; Pages._build.step=1; Nav.go('build'); return; }
  const d=destById(p.destination); const snap=computeSnapshot(p);
  const nights=Compute.tripDays(p); const bc=Object.keys(snap.byCategory);
  const STATUS_NOTE={completed:'This trip is wrapped \u2014 kept here for reference and future planning.',cancelled:'This plan was cancelled and is kept for reference.'};
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<button class="link" style="margin-bottom:16px" onclick="Nav.go(\'plans\')">'+ic('arrowL')+' My Plans</button>'
  +'<div class="reveal" style="position:relative;height:260px;border-radius:var(--r-xl);overflow:hidden">'+UI.poster(d,'Destination','height:100%')
  +'<div style="position:absolute;top:16px;right:16px"><span class="status-pill status-'+p.status+'">'+esc(p.status)+'</span></div>'
  +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;color:#fff"><span class="energy-tag" style="width:fit-content;margin-bottom:8px">Your escape</span><h1 style="color:#fff;font-size:clamp(1.6rem,3vw,2.2rem)">'+esc(p.name)+'</h1>'
  +'<div style="display:flex;gap:14px;flex-wrap:wrap;color:rgba(255,255,255,.88);font-size:.85rem;margin-top:6px"><span>'+ic('pin')+esc(d.name)+'</span><span>'+ic('calendar')+esc(p.startDate)+' \u2192 '+esc(p.endDate)+'</span><span>'+ic('users')+p.travelers+' travellers</span><span>'+ic('wallet')+money(p.budget)+' MMK</span></div></div></div>'
  +'<div class="grid grid-4 reveal" style="margin:20px 0">'
  +[['badge',p.status,'Status'],['bed',nights,'Nights'],['layers',snap.items.length,'Items'],['wallet',money(snap.budget)+' MMK','Budget']].map(x=>'<div class="stat-tile"><span class="ic" style="background:var(--lagoon)">'+ic(x[0])+'</span><div><b>'+x[1]+'</b><span>'+x[2]+'</span></div></div>').join('')
  +'</div>'
  +'<div class="grid" style="grid-template-columns:1.6fr 1fr;gap:24px">'
  +'<div>'+(STATUS_NOTE[p.status]?'<div class="note-box note-info reveal" style="margin-bottom:18px">'+ic('info')+'<span>'+STATUS_NOTE[p.status]+'</span></div>':'')
  +'<div class="reveal" style="margin-bottom:14px"><h3>Your trip, in order</h3><p style="color:var(--mist);font-size:.86rem">Outbound \u2192 stay \u2192 the good stuff \u2192 home.</p></div>'
  +Pages._itinerary(p)+'</div>'
  +'<aside class="card-surface reveal" style="padding:22px;position:sticky;top:96px;height:fit-content;display:flex;flex-direction:column;gap:16px">'
  +'<span class="eyebrow">Budget</span><h4>At a glance</h4>'
  +'<div style="display:flex;gap:16px;align-items:center"><div class="donut" style="background:'+UI.donut(snap.byCategory,snap.total)+'"><div class="ctr"><b>'+snap.pct+'%</b><small>used</small></div></div>'
  +'<div><div class="mono-num" style="font-size:1.3rem;font-weight:800">'+money(snap.total)+'<small style="font-size:.7rem;color:var(--mist);font-weight:600"> MMK spent</small></div>'
  +'<div style="font-size:.8rem;font-weight:700;color:'+(snap.over?'var(--danger)':'var(--ok)')+'">'+(snap.over?'Over by '+money(Math.abs(snap.left)):money(snap.left)+' left')+'</div></div></div>'
  +'<div class="tide-meter"><i class="'+(snap.over?'over':'')+'" style="width:'+Math.min(100,snap.pct)+'%"></i></div>'
  +(bc.length?bc.map(c=>'<div class="legend-row"><span class="dot" style="background:'+CAT_COLOR[c]+'"></span>'+c+'<b>'+money(snap.byCategory[c])+'</b></div>').join(''):'')
  +(p.status==='active'?'<button class="btn btn-outline" onclick="State.activePlanId=\''+p.id+'\';Pages._build.step=2;Nav.go(\'build\')">'+ic('pencil')+' Edit plan</button>':'')
  +'<button class="btn btn-primary" onclick="Nav.go(\'map\',{mode:\'plan\'})">'+ic('map')+' View on Map</button>'
  +'</aside></div></div>';
};

/* ---------------- SAVED ---------------- */
Pages.saved = function(root){ let tab='All';
  const TABS=[['All','All','layers'],['Hotel','Hotels','building'],['Transport','Transport','bus'],['Activity','Activities','waves'],['Restaurant','Dining','utensils'],['Packages','Packages','box'],['Destination','Beaches','pin']];
  const items=()=>State.saved.map(id=>anyById(id)||destById(id)).filter(Boolean);
  const kindOf=i=>i.duration?'Packages':(i.region?'Destination':i.category);
  const draw=()=>{ const list=items().filter(i=>tab==='All'||kindOf(i)===tab);
    root.querySelector('#savedGrid').innerHTML=list.length?list.map(i=>{ const k=kindOf(i);
      if(k==='Destination') return UI.destCard(i);
      if(k==='Packages') return UI.packageCard(i);
      if(i.category==='Restaurant') return Pages._restaurantCard(i);
      return UI.serviceCard(i); }).join(''):'<div class="empty-state" style="grid-column:1/-1"><div class="ic">'+ic('bookmark')+'</div><h3>Nothing saved here yet</h3><p>Tap the bookmark on any beach, stay, ride or dish.</p></div>';
    paintIcons(root); if(window.MTPReactions) MTPReactions.hydrateVisible(); UI.reveal(root.querySelector('#savedGrid')); };
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="margin-bottom:20px"><span class="eyebrow">Your shortlist</span><h1 style="font-size:1.9rem">Saved for later</h1></div>'
  +'<div class="tabs-row reveal" style="margin-bottom:22px">'+TABS.map(t=>'<button class="tab-btn" data-t="'+t[0]+'">'+ic(t[2])+t[1]+'</button>').join('')+'</div>'
  +'<div class="grid grid-3" id="savedGrid"></div></div>';
  root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ tab=b.dataset.t; root.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('active',x===b)); draw(); });
  root.querySelector('[data-t="All"]').classList.add('active');
  draw();
};

/* ---------------- HISTORY ---------------- */
Pages._historyOpen=function(idx){ goToEntry(State.history[idx]); };
Pages._feedbackOpen=function(idx){ const f=State.feedback[idx]; if(!f) return; if(!goToRef(f.refId)) UI.toast('That listing is no longer available','info'); };
Pages.history = function(root){ let type='';
  const ICO={plan_created:'calendar',item_added:'plus',official_clicked:'external',feedback_submitted:'chat',plan_confirmed:'badge'};
  const draw=()=>{ const el=root.querySelector('#histList');
    if(type==='feedback'){ el.innerHTML=State.feedback.length?State.feedback.map((f,i)=>{ const linkable=!!f.refId;
        return '<div class="card-surface reveal'+(linkable?' click-row':'')+'" style="padding:16px 18px;display:flex;gap:14px;margin-bottom:12px"'+(linkable?' onclick="Pages._feedbackOpen('+i+')"':'')+'><span style="color:var(--lagoon)">'+ic('chat')+'</span><div style="flex:1"><b>'+esc(f.refName)+'</b><div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">'+(f.reasons||[]).map(r=>'<span class="badge badge-soft">'+esc(FB.REASONS[r]||r)+'</span>').join('')+'</div>'+(f.comment?'<p style="font-size:.85rem;color:var(--mist);font-style:italic">\u201c'+esc(f.comment)+'\u201d</p>':'')+'<small style="color:var(--faint)">'+new Date(f.createdAt).toLocaleDateString()+'</small></div>'+(linkable?'<span class="go-arrow">View '+ic('arrowR')+'</span>':'')+'</div>'; }).join(''):'<div class="empty-state"><div class="ic">'+ic('chat')+'</div><h3>No feedback yet</h3></div>';
      paintIcons(el); return; }
    const list=type?State.history.filter(h=>h.type===type):State.history;
    el.innerHTML=list.length?list.map(h=>{ const idx=State.history.indexOf(h); const linkable=!!(h.planId||h.refId);
      return '<div class="card-surface reveal'+(linkable?' click-row':'')+'" style="padding:14px 18px;display:flex;gap:14px;align-items:center;margin-bottom:10px"'+(linkable?' onclick="Pages._historyOpen('+idx+')"':'')+'><span style="width:36px;height:36px;border-radius:50%;background:var(--pearl-2);display:flex;align-items:center;justify-content:center;color:var(--lagoon);flex:none">'+ic(ICO[h.type]||'info')+'</span><div style="flex:1"><b style="font-size:.88rem">'+esc(h.label)+'</b>'+(h.target?'<div class="fact-chip">'+ic('pin')+esc(h.target)+'</div>':'')+'</div><small style="color:var(--faint);white-space:nowrap">'+new Date(h.at).toLocaleDateString()+'</small>'+(linkable?'<span class="go-arrow">'+ic('arrowR')+'</span>':'')+'</div>'; }).join(''):'<div class="empty-state"><div class="ic">'+ic('history')+'</div><h3>No history here yet</h3></div>';
    paintIcons(el); };
  const cnt=t=>t?State.history.filter(h=>h.type===t).length:(t===''?State.history.length:0);
  const tabs=[['','All',State.history.length],['plan_created','Plans',State.history.filter(h=>h.type==='plan_created'||h.type==='plan_confirmed').length],['item_added','Added',State.history.filter(h=>h.type==='item_added').length],['official_clicked','Visited',State.history.filter(h=>h.type==='official_clicked').length],['feedback','Feedback',State.feedback.length]];
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="margin-bottom:20px"><span class="eyebrow">Trip recap</span><h1 style="font-size:1.9rem">Your planning trail</h1></div>'
  +'<div class="tabs-row reveal" style="margin-bottom:22px">'+tabs.map(t=>'<button class="tab-btn" data-t="'+t[0]+'">'+esc(t[1])+' <span class="cnt">'+t[2]+'</span></button>').join('')+'</div>'
  +'<div id="histList"></div></div>';
  root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ type=b.dataset.t; root.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('active',x===b)); draw(); });
  root.querySelector('[data-t=""]').classList.add('active');
  draw();
};

/* ---------------- NOTIFICATIONS (3 real event-driven kinds only) ---------------- */
Pages._notifOpen=function(idx){ goToEntry(State.notifications[idx]); };
Pages._saveProfile=async function(){
  const me=API.getCurrentUser(); if(!me) return;
  const data={ full_name:(document.getElementById('profFullName')||{}).value||me.full_name,
    phone:(document.getElementById('profPhone')||{}).value||'', country:(document.getElementById('profCountry')||{}).value||'Myanmar' };
  try{ await API.updateProfile(me.id,data); me.full_name=data.full_name; me.phone=data.phone; me.country=data.country;
    UI.toast('Profile updated!','success'); Nav.updateGuestUI(); }
  catch(e){ UI.toast(e.message||'Could not update profile','error'); }
};
Pages._clearNotifs=async function(){ try{ await API.notifications.clear(); }catch(e){} Nav.go('notifications'); };
Pages.notifications = function(root){ let tab='All';
  API.notifications.markAllRead().catch(function(){});
  const map={All:'',Warnings:'warning'};
  const draw=()=>{ const list=State.notifications.filter(n=>!map[tab]||n.kind===map[tab]);
    root.querySelector('#notifList').innerHTML=list.length?list.map(n=>{ const idx=State.notifications.indexOf(n); const linkable=!!(n.plan_id||n.refId);
      return '<div class="card-surface reveal'+(linkable?' click-row':'')+'" style="padding:16px 18px;display:flex;gap:14px;margin-bottom:12px;border-left:4px solid var(--dawn)"'+(linkable?' onclick="Pages._notifOpen('+idx+')"':'')+'><span style="color:var(--dawn)">'+ic('alert')+'</span><div style="flex:1"><span class="badge badge-soft" style="margin-bottom:6px">Plan update</span><b style="display:block">'+esc(n.title)+'</b><p style="color:var(--mist);font-size:.86rem;margin-top:3px">'+esc(n.message)+'</p><small style="color:var(--faint)">'+new Date(n.at).toLocaleString()+'</small></div>'+(linkable?'<span class="go-arrow">View '+ic('arrowR')+'</span>':'')+'</div>'; }).join(''):'<div class="empty-state"><div class="ic">'+ic('bell')+'</div><h3>No notifications</h3></div>';
    paintIcons(root.querySelector('#notifList')); };
  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px"><div><span class="eyebrow">Reminders &amp; updates</span><h1 style="font-size:1.9rem">Notifications</h1></div>'
  +'<button class="btn btn-ghost btn-sm" onclick="Pages._clearNotifs()">'+ic('x')+' Clear All</button></div>'
  +'<div id="notifList"></div></div>';
  draw();
};

/* ---------------- MAP (stylized, offline-safe) ---------------- */
/* ---------------- MAP — two modules: all-service pins, and "what's in my plan" ---------------- */
Pages._mapState={mode:'all',cats:{Hotel:true,Transport:true,Activity:true,Restaurant:true},active:null};
Pages._mapTileMode=Pages._mapTileMode||'street';
Pages._mapGetItems=function(){
  const st=Pages._mapState; const plan=activePlan();
  let list;
  if(st.mode==='plan') list=(plan?plan.items:[]).map(it=>{ const s=svcById(it.refId); return s?Object.assign({},s,{_qty:it.qty,_item:it}):null; }).filter(Boolean);
  else list=SERVICES.filter(s=>st.cats[s.category]);
  return list.filter(s=>s.lat&&s.lng); // a real map can only pin what has real coordinates
};
Pages.map = function(root,param){
  const st=Pages._mapState;
  if(param&&param.mode) st.mode=param.mode;
  if(param&&param.focus) st.active=param.focus;
  const CATS=['Hotel','Transport','Activity','Restaurant'];
  const items=Pages._mapGetItems();
  const active=items.find(s=>s.id===st.active)||null;

  const modeToggle='<div class="mood-toggle reveal"><button class="'+(st.mode==='all'?'active':'')+'" onclick="Pages._mapSetMode(\'all\')">'+ic('layers')+' All Services</button><button class="'+(st.mode==='plan'?'active':'')+'" onclick="Pages._mapSetMode(\'plan\')">'+ic('clipboard')+' My Plan</button></div>';
  const catPills=st.mode==='all'?'<div class="tabs-row reveal" style="margin-top:14px">'+CATS.map(c=>'<label class="chip'+(st.cats[c]?' active':'')+'" style="cursor:pointer"><input type="checkbox" style="display:none" '+(st.cats[c]?'checked':'')+' onchange="Pages._mapToggleCat(\''+c+'\')">'+ic(CAT_ICON[c])+' '+c+'</label>').join('')+'</div>':'';
  const tileToggle='<div class="map-sat-toggle"><button class="mst-seg'+(Pages._mapTileMode==='street'?' active':'')+'" data-mode="street" onclick="Pages._mapSat(\'street\')">'+ic('layers')+' Standard</button><button class="mst-seg'+(Pages._mapTileMode==='sat'?' active':'')+'" data-mode="sat" onclick="Pages._mapSat(\'sat\')">'+ic('compass')+' Satellite</button></div>';

  root.innerHTML =
  '<div class="page-pad page-pad-top container">'
  +'<div class="reveal" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:14px;margin-bottom:6px"><div><span class="eyebrow">The coast, mapped</span><h1 style="font-size:1.9rem">Map view</h1></div>'
  +'<button class="btn btn-outline btn-sm" onclick="Guide.open()">'+ic('help')+' How this works</button></div>'
  +modeToggle+catPills
  +'<div class="grid" style="grid-template-columns:2.2fr 1fr;gap:24px;margin-top:20px">'
  +'<div class="reveal" id="mapStage" style="position:relative;height:min(86vh,860px);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--shadow-lg)">'
  +(items.length?'<div id="leafletMap" style="position:absolute;inset:0"></div>'+tileToggle
    :'<div class="trip-empty" style="position:relative;padding-top:180px;background:var(--pearl-2);height:100%">'+ic('clipboard')+'<h3 style="margin:12px 0 4px;color:var(--ink)">'+(st.mode==='plan'?'Nothing in your plan yet':'No places match this filter')+'</h3><p>'+(st.mode==='plan'?'Build a trip to see your chosen services here.':'Tick a category above, or switch to \u201cAll Services\u201d.')+'</p>'+(st.mode==='plan'?'<button class="btn btn-primary" style="margin-top:14px" onclick="Nav.go(\'build\')">'+ic('sparkles')+' Build My Trip</button>':'')+'</div>')
  +'<div id="mapInfoCardSlot">'+(active?Pages._mapInfoCard(active):'')+'</div>'
  +(items.length?Pages._mapLegend():'')
  +'</div>'
  +'<aside class="card-surface reveal" style="padding:20px;max-height:min(86vh,860px);overflow-y:auto"><h4 style="margin-bottom:14px">'+items.length+' place'+(items.length===1?'':'s')+(st.mode==='plan'?' in this plan':'')+'</h4>'
  +(items.length?items.map(s=>{ const isActive=active&&active.id===s.id;
      return '<div class="map-list-row'+(isActive?' active':'')+'" data-sid="'+s.id+'" onclick="Pages._mapSelect(\''+s.id+'\')"><span style="width:32px;height:32px;border-radius:9px;background:'+CAT_COLOR[s.category]+';color:#fff;display:flex;align-items:center;justify-content:center;flex:none">'+ic(CAT_ICON[s.category])+'</span><div style="flex:1;min-width:0"><b style="font-size:.84rem">'+esc(s.name)+'</b><div class="fact-chip">'+ic('pin')+esc(destById(s.destination).name)+(s._qty?' \u00b7 Qty '+s._qty:'')+'</div></div><span style="color:var(--faint)">'+ic('chevronR')+'</span></div>'; }).join('')
    :'<div style="text-align:center;padding:30px 10px;color:var(--mist);font-size:.85rem">'+(st.mode==='plan'?'Nothing added yet.':'No places match this filter.')+'</div>')
  +'</aside></div></div>';
  if(items.length) Pages._mapDraw(items,active);
};
/* ---- real Leaflet map: same tile sources & marker-cluster behaviour
   as the project's original map (Voyager street tiles + Esri World
   Imagery satellite tiles), just re-skinned popups/pins to match this
   UI. Reuses each service/destination's real lat/lng from Supabase —
   nothing here recomputes location or pricing. ---- */
Pages._mapDraw=function(items,active){
  const host=document.getElementById('leafletMap'); if(!host) return;
  if(Pages._mapInstance){ try{ Pages._mapInstance.remove(); }catch(e){} Pages._mapInstance=null; }
  if(typeof L==='undefined'){ host.parentElement.innerHTML='<div class="trip-empty" style="padding-top:180px;background:var(--pearl-2);height:100%">'+ic('map')+'<h3 style="margin:12px 0 4px;color:var(--ink)">Map library needs internet</h3><p>'+items.length+' place'+(items.length===1?'':'s')+' would be pinned here.</p></div>'; return; }
  const center=active?[active.lat,active.lng]:[items[0].lat,items[0].lng];
  const map=L.map('leafletMap',{zoomControl:false,scrollWheelZoom:false,attributionControl:true}).setView(center,active?13:9);
  Pages._mapInstance=map;
  L.control.zoom({position:'topright'}).addTo(map);
  window.__MTP_MAP=map;
  window.__MTP_STREET=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'\u00a9 OpenStreetMap contributors',maxZoom:19});
  if(Pages._mapTileMode==='sat'){ Pages._mapSatLayer().addTo(map); }
  else { window.__MTP_STREET.addTo(map); }
  const cluster=(typeof L.markerClusterGroup==='function')?L.markerClusterGroup({maxClusterRadius:46,showCoverageOnHover:false,disableClusteringAtZoom:15}):null;
  const markers={}; const pts=[]; let focusMarker=null;
  items.forEach(function(s,idx){ const color=CAT_COLOR[s.category]||'#1565a8'; const catIc=CAT_ICON[s.category]||'pin';
    const icon=L.divIcon({className:'mpin-host',html:'<button class="mpin mpin--'+(s.category||'').toLowerCase()+'" data-sid="'+s.id+'" style="--c:'+color+';--d:'+(idx*32)+'ms" aria-label="'+esc(s.name)+'"><span class="mpin-pulse"></span><span class="mpin-ic">'+ic(catIc)+'</span></button>',iconSize:[32,40],iconAnchor:[16,39],popupAnchor:[0,-34]});
    const mk=L.marker([s.lat,s.lng],{icon:icon,riseOnHover:true});
    const price='<span class="price">'+money(s.price)+' <small>'+esc(s.priceUnit||'MMK')+'</small></span>';
    mk.bindPopup('<div class="map-pop"><b style="display:block;margin-bottom:4px">'+esc(s.name)+'</b>'
      +'<div class="fact-chip" style="margin-bottom:8px">'+ic('pin')+esc(s.location||'')+'</div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">'+price
      +'<button class="btn btn-primary btn-sm" onclick="Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')">'+ic('arrowR')+' View</button></div></div>',{maxWidth:240,minWidth:200,className:'mpin-pop'});
    mk.on('click',function(){ Pages._mapSelect(s.id); });
    if(cluster) cluster.addLayer(mk); else mk.addTo(map);
    markers[s.id]=mk; pts.push([s.lat,s.lng]); if(active&&active.id===s.id) focusMarker=mk; });
  Pages._mapMarkers=markers;
  if(cluster) map.addLayer(cluster);
  Pages._mapFly=function(sid){ const m=markers[sid]; if(!m) return; map.flyTo(m.getLatLng(),Math.max(map.getZoom(),14),{duration:.6}); m.openPopup(); };
  if(focusMarker){ setTimeout(()=>{ map.flyTo(focusMarker.getLatLng(),14,{duration:.6}); focusMarker.openPopup(); },150); }
  else if(pts.length>1) map.fitBounds(pts,{padding:[60,60],maxZoom:14});
  else if(pts.length===1) map.setView(pts[0],13);
  setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} },200);
};
/* Creates (once) the satellite tile layer and wires a graceful
   fallback: if these tiles ever fail to load (network block, provider
   change, etc.) it warns once and switches back to Standard instead
   of leaving broken/grey tiles on screen. */
Pages._mapSatLayer=function(){
  if(window.__MTP_SAT) return window.__MTP_SAT;
  let failed=false;
  const layer=L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',{attribution:'Sentinel-2 cloudless \u00a9 EOX IT Services (Contains modified Copernicus Sentinel data)',maxZoom:18});
  layer.on('tileerror',function(){
    if(failed) return; failed=true;
    UI.toast('Satellite imagery is unavailable right now \u2014 showing Standard view','info');
    Pages._mapSat('street');
  });
  window.__MTP_SAT=layer; return layer;
};
/* Switch basemap without re-drawing markers/clusters. */
Pages._mapSat=function(mode){ Pages._mapTileMode=mode; const map=Pages._mapInstance;
  if(map&&window.__MTP_STREET){
    if(mode==='sat'){ try{map.removeLayer(window.__MTP_STREET);}catch(e){} Pages._mapSatLayer().addTo(map); }
    else { if(window.__MTP_SAT){try{map.removeLayer(window.__MTP_SAT);}catch(e){}} try{window.__MTP_STREET.addTo(map);}catch(e){} }
  }
  document.querySelectorAll('.map-sat-toggle .mst-seg').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
};
Pages._mapLegend=function(){
  const CATS=['Hotel','Transport','Activity','Restaurant'];
  return '<div class="map-legend"><b>Pin colour</b>'+CATS.map(c=>'<div><span class="dot" style="background:'+CAT_COLOR[c]+'"></span>'+c+'</div>').join('')+'</div>';
};
Pages._mapRefresh=function(){ const host=document.getElementById('viewHost'); Pages.map(host); paintIcons(host); };
Pages._mapSetMode=function(m){ Pages._mapState.mode=m; Pages._mapState.active=null; Pages._mapRefresh(); };
Pages._mapToggleCat=function(c){ const st=Pages._mapState; st.cats[c]=!st.cats[c]; if(st.active){ const s=svcById(st.active); if(s&&!st.cats[s.category]) st.active=null; } Pages._mapRefresh(); };
Pages._mapSelect=function(id){
  const st=Pages._mapState; st.active=(st.active===id?null:id);
  document.querySelectorAll('.map-list-row').forEach(r=>r.classList.toggle('active',r.dataset.sid===st.active));
  const slot=document.getElementById('mapInfoCardSlot');
  if(slot){ const item=st.active?Pages._mapGetItems().find(s=>s.id===st.active):null;
    slot.innerHTML=item?Pages._mapInfoCard(item):''; paintIcons(slot); }
  if(st.active&&Pages._mapFly) Pages._mapFly(st.active);
};
Pages._mapInfoCard=function(s){
  return '<div class="map-info-card reveal" style="left:16px;top:16px">'
  +'<button class="iconbtn" style="position:absolute;top:8px;right:8px;width:26px;height:26px;background:var(--card);z-index:2" onclick="event.stopPropagation();Pages._mapSelect(\''+s.id+'\')">'+ic('x')+'</button>'
  +'<div style="display:flex;gap:12px">'
  +'<div style="width:58px;height:58px;border-radius:12px;flex:none;overflow:hidden">'+UI.poster(s)+'</div>'
  +'<div style="min-width:0;padding-right:20px">'+UI.catBadge(s.category)+'<b style="display:block;font-size:.9rem;margin-top:4px;line-height:1.25">'+esc(s.name)+'</b>'
  +'<div class="fact-chip" style="margin-top:3px">'+ic('pin')+esc(s.location)+'</div></div></div>'
  +'<div style="margin-top:8px;font-size:.8rem;font-weight:700">'+UI.stars(s.rating)+' '+(s.rating?s.rating+' <span style="color:var(--mist);font-weight:500">('+s.reviews+')</span>':'<span style="color:var(--mist);font-weight:500">No ratings yet</span>')+'</div>'
  +'<div class="svc-foot" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">'+UI.price(s.price,s.category==='Restaurant'?'menu':s.priceUnit)
  +'<button class="btn btn-primary btn-sm" onclick="Nav.go(\''+(s.category==='Restaurant'?'restaurant':'service')+'\',\''+s.id+'\')">'+ic('arrowR')+' View</button></div>'
  +'</div>';
};

/* ---------------- SETTINGS ---------------- */
Pages._settingsTab='profile';
Pages.settings = function(root){
  const GUEST_TABS=['profile','preferences','security','notification'];
  let tab=Pages._settingsTab;
  if(State.isGuest && GUEST_TABS.indexOf(tab)>=0) tab='appearance';
  const NAVI=[['appearance','Appearance','sliders'],['profile','Profile','users'],['preferences','Preferences','heart'],['security','Security','lock'],['notification','Notifications','bell'],['language','Language','globe'],['help','Help & FAQ','info'],['contact','Contact','mail']];
  const shell=(title,sub,content)=>
    '<div style="display:grid;grid-template-columns:220px 1fr;gap:26px;align-items:flex-start">'
    +'<aside class="card-surface reveal" style="padding:10px">'+NAVI.map(n=>{ const locked=State.isGuest&&GUEST_TABS.indexOf(n[0])>=0;
      return '<button class="settings-nav-item'+(n[0]===tab?' active':'')+'" onclick="Pages._settingsTab=\''+n[0]+'\';Nav.go(\'settings\')">'+ic(n[2])+'<span>'+n[1]+'</span>'+(locked?ic('lock','lock-ic'):'')+'</button>'; }).join('')+'</aside>'
    +'<div><div class="reveal" style="margin-bottom:18px"><span class="eyebrow">'+esc(sub)+'</span><h2 style="font-size:1.5rem">'+esc(title)+'</h2></div>'+content+'</div></div>';
  const lockedCard=(what)=>'<div class="card-surface reveal" style="padding:44px 32px;text-align:center"><div class="ic" style="width:52px;height:52px;border-radius:50%;background:var(--pearl-2);display:flex;align-items:center;justify-content:center;color:var(--faint);margin:0 auto 16px">'+ic('lock')+'</div>'
    +'<h3 style="margin-bottom:6px">Sign in to manage '+esc(what)+'</h3><p style="color:var(--mist);font-size:.88rem;max-width:38ch;margin:0 auto 20px">You\u2019re browsing as a guest \u2014 create a free account to unlock this section.</p>'
    +'<div style="display:flex;gap:10px;justify-content:center"><button class="btn btn-primary" onclick="Auth.showAuth(\'signup\')">'+ic('sparkles')+' Create account</button><button class="btn btn-outline" onclick="Auth.showAuth(\'login\')">'+ic('users')+' Sign in</button></div></div>';
  let content='';
  if(tab==='appearance'){
    content='<div class="card-surface reveal" style="padding:26px"><h4 style="margin-bottom:6px">Mood</h4><p style="color:var(--mist);font-size:.86rem;margin-bottom:16px">Switch between a bright sea-blue day look and the deep-ocean night look \u2014 applies everywhere, instantly.</p>'
    +'<div class="mood-toggle"><button class="'+(State.theme!=='day'?'active':'')+'" onclick="UI.setTheme(\'night\')">'+ic('moon')+' Night</button><button class="'+(State.theme==='day'?'active':'')+'" onclick="UI.setTheme(\'day\')">'+ic('sun')+' Day</button></div></div>'
    +'<div class="grid grid-2" style="margin-top:20px">'
    +'<div class="card-surface reveal" style="padding:20px"><div class="poster poster-auth-1" style="height:90px;border-radius:12px;margin-bottom:12px"></div><b style="font-size:.86rem">Night mood</b><p style="color:var(--mist);font-size:.78rem;margin-top:3px">Deep ocean glass, glowing accents \u2014 the default.</p></div>'
    +'<div class="card-surface reveal" style="padding:20px"><div class="poster poster-auth-2" style="height:90px;border-radius:12px;margin-bottom:12px;filter:brightness(1.25) saturate(.8)"></div><b style="font-size:.86rem">Day mood</b><p style="color:var(--mist);font-size:.78rem;margin-top:3px">Bright, white &amp; sea-blue \u2014 easier to read in daylight.</p></div>'
    +'</div>';
  } else if(tab==='profile'){
    if(State.isGuest){ content=lockedCard('your profile'); }
    else{
    const me=API.getCurrentUser()||{full_name:'Traveller',email:'',phone:'',country:'Myanmar'};
    const initials=(me.full_name||'?').split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase()||'?';
    content='<div class="card-surface reveal" style="padding:26px;display:flex;gap:18px;align-items:center;margin-bottom:20px"><span class="avatar-ini" style="width:60px;height:60px;font-size:1.3rem">'+esc(initials)+'</span>'
    +'<div><b style="font-size:1.1rem">'+esc(me.full_name||'Traveller')+'</b><div style="color:var(--mist);font-size:.86rem">'+esc(me.email||'')+'</div><span class="badge badge-soft" style="margin-top:6px">'+ic('shield')+' Verified account</span></div></div>'
    +'<div class="card-surface reveal" style="padding:24px"><div class="grid grid-2">'
    +'<div class="field"><label>Full name</label><input id="profFullName" value="'+esc(me.full_name||'')+'"></div>'
    +'<div class="field"><label>Email</label><input value="'+esc(me.email||'')+'" disabled></div>'
    +'<div class="field"><label>Phone</label><input id="profPhone" value="'+esc(me.phone||'')+'"></div>'
    +'<div class="field"><label>Country</label><input id="profCountry" value="'+esc(me.country||'Myanmar')+'"></div></div>'
    +'<button class="btn btn-primary" style="margin-top:18px" onclick="Pages._saveProfile()">Save changes</button></div>'; }
  } else if(tab==='preferences'){
    if(State.isGuest){ content=lockedCard('your preferences'); }
    else{
    content='<div class="card-surface reveal" style="padding:24px"><div class="grid grid-2">'
    +'<div class="field"><label>Typical budget / person</label><select><option>300,000 MMK</option><option selected>500,000 MMK</option><option>800,000 MMK</option></select></div>'
    +'<div class="field"><label>Travel style</label><select><option selected>Relaxation</option><option>Adventure</option><option>Cultural</option></select></div>'
    +'<div class="field"><label>Usual group</label><select><option>Solo</option><option selected>Couple</option><option>Family</option><option>Friends</option></select></div></div>'
    +'<label style="font-size:.78rem;font-weight:700;color:var(--ink-soft);display:block;margin:18px 0 8px">Favourite destinations</label>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'+DESTINATIONS.slice(0,2).map(d=>'<span class="chip active">'+esc(d.name)+' '+ic('x')+'</span>').join('')+'</div>'
    +'<button class="btn btn-primary" style="margin-top:18px" onclick="UI.toast(\'Preferences saved!\',\'success\')">Save preferences</button></div>'; }
  } else if(tab==='security'){
    if(State.isGuest){ content=lockedCard('security settings'); }
    else{
    content='<div class="card-surface reveal" style="padding:24px;margin-bottom:18px"><h4 style="margin-bottom:16px">Change password</h4>'
    +'<div class="grid grid-2"><div class="field"><label>Current password</label><input type="password"></div><div></div><div class="field"><label>New password</label><input type="password"></div><div class="field"><label>Confirm new password</label><input type="password"></div></div>'
    +'<button class="btn btn-primary" style="margin-top:16px" onclick="UI.toast(\'Password changed!\',\'success\')">Change password</button></div>'
    +'<div class="card-surface reveal" style="padding:24px;margin-bottom:18px"><div style="display:flex;justify-content:space-between;align-items:center"><div><h4>Two-factor authentication</h4><small style="color:var(--mist)">Add an extra step when signing in.</small></div><button class="toggle" onclick="this.classList.toggle(\'on\')"></button></div></div>'
    +'<div class="card-surface reveal" style="padding:24px;border-color:var(--danger-soft)"><h4 style="color:var(--danger);margin-bottom:8px">Danger zone</h4><p style="color:var(--mist);font-size:.86rem;margin-bottom:14px">Deleting your account removes your plans, saves and feedback.</p><button class="btn btn-danger-line" onclick="UI.toast(\'Please contact support to permanently delete your account.\',\'info\')">Delete Account</button></div>'; }
  } else if(tab==='notification'){
    if(State.isGuest){ content=lockedCard('notification settings'); }
    else{
    const rows=[['Email updates','notifEmail',true],['Trip reminders','notifReminders',true],['Price changes','notifPrice',false],['New packages','notifPackages',false]];
    content='<div class="card-surface reveal" style="padding:24px">'
    +rows.map(r=>'<div class="kv-row"><span>'+r[0]+'</span><button class="toggle'+(r[2]?' on':'')+'" onclick="this.classList.toggle(\'on\');UI.toast(\'Notification setting updated\',\'success\')"></button></div>').join('')+'</div>'; }
  } else if(tab==='language'){
    content='<div class="card-surface reveal" style="padding:24px">'
    +'<div class="field" style="max-width:320px"><label>Display language</label><select><option>English</option><option>\u1019\u103c\u1014\u103a\u1019\u102c (Myanmar)</option></select></div>'
    +'<button class="btn btn-primary" style="margin-top:16px" onclick="UI.toast(\'Display language preference saved\',\'success\')">Save</button></div>';
  } else if(tab==='help'){
    const faqs=[['How does budget tracking work?','Every service you add to a trip has an explicit quantity you set yourself \u2014 hotels track rooms and nights separately, so your total is always price \u00d7 rooms \u00d7 nights, never a hidden guess.'],
      ['Can I book directly through Wave Wise?','No \u2014 Wave Wise is a planning and discovery tool. Every service links to the operator\u2019s own official website to complete a booking.'],
      ['Why don\u2019t restaurants count toward my budget?','What you spend at a restaurant depends entirely on what you order, so dining stays reference-only and never enters your trip estimate.'],
      ['What can I do without an account?','You can browse every destination, service and package, compare, and check the map freely. Saving favourites, building a trip and feedback need a free account.']];
    content='<button class="btn btn-secondary reveal" style="margin-bottom:16px" onclick="Guide.open()">'+ic('help')+' Take the guided tour</button>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'+faqs.map(f=>'<details class="card-surface reveal" style="padding:16px 18px"><summary style="cursor:pointer;font-weight:700">'+f[0]+'</summary><p style="color:var(--mist);margin-top:10px;font-size:.88rem;line-height:1.6">'+f[1]+'</p></details>').join('')+'</div>';
  } else if(tab==='contact'){
    content='<div class="card-surface reveal" style="padding:24px">'
    +'<div class="field" style="margin-bottom:14px"><label>Subject</label><select><option>General question</option><option>Report an issue</option><option>Partnership</option></select></div>'
    +'<div class="field"><label>Message</label><textarea placeholder="How can we help?"></textarea></div>'
    +'<button class="btn btn-primary" style="margin-top:16px" onclick="UI.toast(\'Message sent \u2014 we\u2019ll get back to you soon\',\'success\')">Send message</button></div>';
  }
  const footBtn=State.isGuest
    ?'<button class="btn btn-primary" onclick="Auth.showAuth(\'login\')">'+ic('users')+' Sign In</button>'
    :'<button class="btn btn-outline" onclick="Auth.logout()">'+ic('logout')+' Sign out</button>';
  root.innerHTML='<div class="page-pad page-pad-top container">'+(State.isGuest?'<div class="note-box note-info reveal" style="margin-bottom:20px">'+ic('info')+'<span>You\u2019re browsing as a guest. '+ic('users')+' <button class="link" style="display:inline" onclick="Auth.showAuth(\'signup\')">Create a free account</button> to unlock the rest of Settings.</span></div>':'')
    +shell(NAVI.find(n=>n[0]===tab)[1],'Account',content)
    +'<div style="margin-top:30px">'+footBtn+'</div></div>';
};

/* ================================================================
   BOOT — real engine bootstrapping (Supabase client, session
   restore, cloud catalog, user data, live auth-state listener) is
   copied as-is from the project's own js/app.js; only the last step
   of each phase — which screen to draw — now calls into this UI's
   own Nav/Auth instead of the old Router.
   ================================================================ */
function withTimeout(p, ms, label){
  return new Promise(function(res, rej){
    const t=setTimeout(()=>rej(new Error((label||'operation')+' timed out after '+Math.round(ms/1000)+'s')), ms);
    p.then(v=>{clearTimeout(t);res(v);}, e=>{clearTimeout(t);rej(e);});
  });
}
function _enterApp(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('app').style.display='block';
  buildShellNav(); Nav.go(Nav.page||'explore');
}
(function(){ try{ const savedTheme=localStorage.getItem('tidewell-theme'); if(savedTheme==='day'){ document.documentElement.setAttribute('data-theme','day'); State.theme='day'; } }catch(e){} })();
document.getElementById('loginForm').addEventListener('submit',e=>e.preventDefault());
document.getElementById('authWaveSlot').innerHTML=waveBG();
Auth.paintScenes();
paintIcons(document);

(async function boot(){
  await API.bootstrap();

  const configured=(typeof supabaseConfigured==='function')&&supabaseConfigured();
  let sb=null;
  if(window.supabase&&configured){ sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY); window.__MTP_SB=sb; }
  if(sb){
    try{ await withTimeout(API._loadSessionUser(),8000,'session'); }
    catch(e){ console.warn('Session check failed, showing login:',(e&&e.message)||e); API._setSessionUser(null); }
  }

  if(sb){
    try{
      const cloud=await withTimeout(loadCloudCatalog(sb),30000,'cloud catalog');
      if(cloud){ API.setCatalog(cloud); window.__MTP_CLOUD=true; }
    }catch(e){ console.warn('Cloud catalog unavailable, keeping local:',(e&&e.message)||e); }
    if(window.__MTP_USER && window.UserData){
      try{ await withTimeout(UserData.load(),15000,'user data'); if(API.notifications) API.notifications.checkTripReadiness(); }
      catch(e){ console.warn('User data unavailable:',(e&&e.message)||e); }
    }
    sb.auth.onAuthStateChange(function(event,session){
      if(event==='SIGNED_OUT'){ API._setSessionUser(null); return; }
      if((event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED')&&session&&session.user){
        const u=session.user;
        const finish=pr=>{ API._setSessionUser(API._userFromAuth(u,pr));
          const afterSync=()=>{ if(API.notifications) API.notifications.checkTripReadiness();
            if(window.Store && typeof window.Store.reload==='function'){ window.Store.reload(); }
            if(document.getElementById('app').style.display!=='none') Nav.refresh(); };
          if(window.__MTP_SYNC && typeof window.__MTP_SYNC.pull==='function'){ window.__MTP_SYNC.pull().catch(()=>{}); }
          if(window.UserData){ UserData.load().then(afterSync).catch(afterSync); } else { afterSync(); }
        };
        sb.from('profiles').select('*').eq('user_id',u.id).maybeSingle()
          .then(rr=>finish(rr&&!rr.error?rr.data:null)).catch(()=>finish(null));
      }
    });
  }

  try{ Store.subscribe(()=>Nav.renderSidebarPlanCard()); }catch(e){}

  if(API.getCurrentUser()){ _enterApp(); } // real session restored — skip the auth screen
  // else: leave the auth screen showing (its default state) for login / signup / skip-as-guest
})();


