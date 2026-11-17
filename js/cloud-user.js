/* ============================================================
   USER DATA — real Supabase persistence for the user's own
   plans, plan items, saved items, feedback, and history.

   Same architecture as cloud.js already uses for the catalog:
   fetch once (here, on login), cache in memory, keep every READ
   in the app synchronous (nothing else in this codebase expects
   to await a plan lookup mid-render) — only WRITES touch the
   network, and every write updates this cache immediately after
   it succeeds so the very next render already reflects it.

   window.USER_DATA is the cache. api.js reads from it directly;
   api.js's create/addItem/etc. write to Supabase, then call the
   small _apply* helpers below to keep this cache in sync.
   ============================================================ */
window.USER_DATA = { plans: [], saved: [], feedback: [], history: [], notifications: [] };

/* ---- uuid <-> slug lookups, built from the catalog already in CAT ---- */
function _refByUuid(uuid){
  if (!uuid) return null;
  var s = (CAT.services||[]).find(function(x){ return x.service_uuid===uuid; });
  if (s) return s;
  return (CAT.packages||[]).find(function(x){ return x.package_uuid===uuid; }) || null;
}
function _destSlugByUuid(uuid){
  var d = (CAT.destinations||[]).find(function(x){ return x.destination_uuid===uuid; });
  return d ? d.id : '';
}
function _destUuidBySlug(slug){
  var d = (CAT.destinations||[]).find(function(x){ return x.id===slug; });
  return d ? d.destination_uuid : null;
}
function _providerNameBySlug(slug){
  var p = (CAT.providers||[]).find(function(x){ return x.id===slug; });
  return p ? p.name : '';
}

/* ---- row -> app-shape mapping (field names match exactly what the
   rest of the app already reads — see js/api.js addItem for the
   canonical shape this mirrors) ---- */
function _mapItemRow(row){
  var ref = _refByUuid(row.service_id) || _refByUuid(row.package_id);
  var category = row.category_snapshot;
  var unitPrice = Number(row.selected_unit_price || 0);
  var qty = row.quantity || 1;
  /* selected_total_price is a database-GENERATED column here — it's
     always just quantity × selected_unit_price, with no knowledge of
     hotel nights (see js/api.js addItem for why). Correct it back to
     the real total on the way in, so every reader of this field sees
     the right number without needing to know that detail. */
  var total = row.selected_total_price != null ? Number(row.selected_total_price) : null;
  if (category === 'Hotel' && row.notes) {
    var m = /nights=(\d+)/.exec(row.notes);
    if (m) { var nights = parseInt(m[1], 10); if (nights > 0) total = unitPrice * qty * nights; }
  }
  return {
    id: row.plan_item_id, refType: row.package_id ? 'package' : 'service',
    refId: ref ? ref.id : (row.service_id || row.package_id || ''),
    name: row.service_name_snapshot, category: category, image: row.image_url || '',
    service_id: row.service_id || null, variant_id: row.variant_id || null,
    variant_name_snapshot: row.variant_name_snapshot || null, variantLabel: row.variant_name_snapshot || null,
    selectedPrice: unitPrice, selectedUnitPrice: unitPrice, selected_unit_price: unitPrice,
    selectedTotalPrice: total, selected_total_price: total,
    qty: qty, quantity: qty,
    direction: (row.leg === 'out' || row.leg === 'back') ? row.leg : null, leg: row.leg || null,
    date: row.planned_date || null, startTime: row.start_time || null, endTime: row.end_time || null,
    officialUrl: row.official_url || '', item_status: row.item_status || 'planned',
    addedAt: row.created_at, package_id: row.package_id || null, plan_id: row.plan_id, notes: row.notes || null
  };
}
function _mapPlanRow(row, items){
  return {
    id: row.plan_id, name: row.plan_name, destination: _destSlugByUuid(row.destination_id),
    startDate: row.start_date, endDate: row.end_date, travelers: row.traveler_count,
    budget: Number(row.total_budget || 0), travelGroup: row.group_type, purpose: row.purpose,
    status: row.status, createdAt: row.created_at, items: items || []
  };
}
function _mapSavedRow(row){
  if (row.item_type === 'destination') return _destSlugByUuid(row.destination_id);
  var ref = _refByUuid(row.service_id) || _refByUuid(row.package_id);
  return ref ? ref.id : null;
}
function _mapFeedbackRow(row){
  var ref = _refByUuid(row.service_id) || _refByUuid(row.package_id);
  return { id: row.feedback_id, refId: ref ? ref.id : (row.service_id || row.package_id || ''), refName: ref ? ref.name : '', reasons: row.reason_codes || [], comment: row.comment || '', createdAt: row.created_at };
}
function _mapHistoryRow(row){
  var meta = row.metadata || {};
  return { id: row.history_event_id, at: row.created_at, type: row.event_type, label: row.description, target: meta.target || '', planId: meta.planId || null, refId: meta.refId || null };
}
/* Notification "kind" (used by the existing bell UI: info/warning/offer)
   is derived from notification_type — every real trigger this app fires
   is plan-related, so they all land on the "Plan Updates" tab (kind
   'warning') rather than inventing fake System/Offer content. */
function _mapNotifRow(row){
  return { id: row.notification_id, kind: 'warning', title: row.title, message: row.message, at: row.created_at, is_read: !!row.is_read, plan_id: row.plan_id || null, notification_type: row.notification_type };
}

/* ---- the one-time load, called right after login ---- */
async function loadUserData(){
  window.USER_DATA = { plans: [], saved: [], feedback: [], history: [], notifications: [] };
  var c = window.__MTP_SB, u = window.__MTP_USER;
  if (!c || !u) return window.USER_DATA;
  try {
    var plansR = await c.from('travel_plans').select('*').eq('user_id', u.id).order('created_at', { ascending: false });
    if (plansR.error) throw new Error(plansR.error.message);
    var planRows = plansR.data || [];
    var planIds = planRows.map(function(p){ return p.plan_id; });

    var itemsR = planIds.length ? await c.from('plan_items').select('*').in('plan_id', planIds) : { data: [] };
    var savedR = await c.from('saved_items').select('*').eq('user_id', u.id);
    var fbR = await c.from('feedback').select('*').eq('user_id', u.id).is('deleted_at', null).order('created_at', { ascending: false });
    var histR = await c.from('history_events').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(200);
    var notifR = await c.from('notifications').select('*').eq('user_id', u.id).order('created_at', { ascending: false }).limit(100);

    var itemsByPlan = {};
    (itemsR.data || []).forEach(function(row){ (itemsByPlan[row.plan_id] = itemsByPlan[row.plan_id] || []).push(_mapItemRow(row)); });

    window.USER_DATA = {
      plans: planRows.map(function(row){ return _mapPlanRow(row, itemsByPlan[row.plan_id] || []); }),
      saved: (savedR.data || []).map(_mapSavedRow).filter(Boolean),
      feedback: (fbR.data || []).map(_mapFeedbackRow),
      history: (histR.data || []).map(_mapHistoryRow),
      notifications: (notifR.data || []).map(_mapNotifRow)
    };
  } catch (e) { console.warn('loadUserData', e); }
  return window.USER_DATA;
}

window.UserData = {
  load: loadUserData,
  refByUuid: _refByUuid, destSlugByUuid: _destSlugByUuid, destUuidBySlug: _destUuidBySlug,
  providerNameBySlug: _providerNameBySlug, mapItemRow: _mapItemRow, mapPlanRow: _mapPlanRow,
  mapFeedbackRow: _mapFeedbackRow, mapHistoryRow: _mapHistoryRow, mapNotifRow: _mapNotifRow
};
