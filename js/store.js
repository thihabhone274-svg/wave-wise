/* ============================================================
REACTIVE STORE + PURE COMPUTE ENGINES
Budget math nets out dropped items (item_status = failed /
disliked). Recommendations suppress disliked services and tag
liked-category picks. Folds in former patch2 + patch5 logic.
============================================================ */
const CAT_ICON = { Hotel:'building', Transport:'bus', Restaurant:'utensils', Activity:'waves', Package:'box' };
const CAT_COLOR = { Hotel:'#1565a8', Transport:'#8b5cf6', Restaurant:'#ff6b4a', Activity:'#13a39b', Package:'#7c3aed' };

function _pad(n) { return String(n).padStart(2, '0'); }
function _d(s) { var parts = String(s).split('-').map(Number); return new Date(parts[0], parts[1] - 1, parts[2]); }
function diffDays(a, b) { if (!a || !b) return 0; return Math.round((_d(b) - _d(a)) / 86400000); }
function addDays(s, n) { var dt = _d(s); dt.setDate(dt.getDate() + n); return dt.getFullYear() + '-' + _pad(dt.getMonth() + 1) + '-' + _pad(dt.getDate()); }
function _isActive(i) { var st = i && i.item_status; return st !== 'failed' && st !== 'disliked'; }
function _clockToMinutes(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  var s = String(value).trim();
  if (!s) return null;
  var direct = s.match(/^(\d{1,2})(?::?(\d{2}))?$/);
  if (direct) {
    var hh = Number(direct[1]);
    var mm = Number(direct[2] || '0');
    return hh * 60 + mm;
  }
  var mer = s.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);
  if (mer) {
    var hh2 = Number(mer[1]);
    var mm2 = Number(mer[2]);
    var ampm = mer[3].toLowerCase();
    if (ampm === 'pm' && hh2 < 12) hh2 += 12;
    if (ampm === 'am' && hh2 === 12) hh2 = 0;
    return hh2 * 60 + mm2;
  }
  return null;
}
function _durationToMinutes(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  var s = String(value).trim().toLowerCase();
  if (!s) return null;
  var simple = s.match(/^(\d+)\s*(m|min|mins|minute|minutes)$/i);
  if (simple) return Number(simple[1]);
  var hours = s.match(/^(\d+)\s*(h|hr|hrs|hour|hours)$/i);
  if (hours) return Number(hours[1]) * 60;
  var mixed = s.match(/^(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:ute)?s?)?$/i);
  if (mixed) return Number(mixed[1]) * 60 + Number(mixed[2]);
  var compact = s.match(/^(\d+)\s*(?:h|hr|hrs|hour|hours)\s*(\d+)$/i);
  if (compact) return Number(compact[1]) * 60 + Number(compact[2]);
  return null;
}
function _formatMinutesToClock(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return null;
  var total = Math.max(0, Math.round(minutes));
  var hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
  var mm = String(total % 60).padStart(2, '0');
  return hh + ':' + mm;
}
function _resolveActivityWindow(item) {
  var start = _clockToMinutes(item && item.startTime != null ? item.startTime : (item && item.start_time != null ? item.start_time : null));
  var end = _clockToMinutes(item && item.endTime != null ? item.endTime : (item && item.end_time != null ? item.end_time : null));
  var duration = _durationToMinutes(item && item.duration != null ? item.duration : (item && item.duration_minutes != null ? item.duration_minutes : null));
  var derivedEnd = (start != null && duration != null) ? start + duration : null;
  return { start: start, end: end != null ? end : derivedEnd };
}
function _activityWindowsOverlap(a, b) {
  var left = _resolveActivityWindow(a);
  var right = _resolveActivityWindow(b);
  if (left.start == null || left.end == null || right.start == null || right.end == null) return false;
  return left.start < right.end && right.start < left.end;
}
function normalizePlannerItem(item) {
  if (!item) return item;
  var selectedVariant = item.selectedVariant || item.selected_variant || item.variant || item.option || null;
  var selectedUnitPrice = item.selectedUnitPrice != null ? item.selectedUnitPrice : (
    item.selected_unit_price != null ? item.selected_unit_price : (
      item.selectedPrice != null ? item.selectedPrice : (
        item.selected_price != null ? item.selected_price : null
      )
    )
  );
  var qtySource = item.quantity != null ? item.quantity : (item.qty != null ? item.qty : 1);
  var qty = Number.isFinite(Number(qtySource)) && Number(qtySource) > 0 ? Number(qtySource) : 1;
  var selectedTotalPrice = item.selectedTotalPrice != null ? item.selectedTotalPrice : (
    item.selected_total_price != null ? item.selected_total_price : (
      selectedUnitPrice != null ? Number(selectedUnitPrice) * qty : null
    )
  );
  var variantName = item.variant_name_snapshot != null ? item.variant_name_snapshot : (
    item.variantLabel != null ? item.variantLabel : (
      item.variant_name != null ? item.variant_name : (
        selectedVariant && (selectedVariant.name || selectedVariant.variant_name || selectedVariant.variantLabel || selectedVariant.label) || null
      )
    )
  );
  var startTime = item.startTime != null ? item.startTime : (
    item.start_time != null ? item.start_time : (
      selectedVariant && (
        selectedVariant.startTime || selectedVariant.start_time || selectedVariant.departureTime || selectedVariant.departure_time || selectedVariant.time || selectedVariant.departure
      ) || null
    )
  );
  var endTime = item.endTime != null ? item.endTime : (
    item.end_time != null ? item.end_time : (
      selectedVariant && (selectedVariant.endTime || selectedVariant.end_time || selectedVariant.arrivalTime || selectedVariant.arrival_time) || null
    )
  );
  var duration = item.duration != null ? item.duration : (
    item.duration_minutes != null ? item.duration_minutes : (
      selectedVariant && (selectedVariant.duration || selectedVariant.durationHours || selectedVariant.duration_hours || selectedVariant.durationMinutes || selectedVariant.duration_minutes) || null
    )
  );
  var derivedEndTime = (endTime != null && String(endTime).trim()) ? endTime : ((startTime != null && duration != null) ? _formatMinutesToClock(_clockToMinutes(startTime) + _durationToMinutes(duration)) : null);
  var departureTime = item.departure_time != null ? item.departure_time : (
    item.departureTime != null ? item.departureTime : (
      selectedVariant && (selectedVariant.departure_time || selectedVariant.departureTime || selectedVariant.startTime || selectedVariant.time || selectedVariant.departure) || null
    )
  );
  var serviceId = item.service_id != null ? item.service_id : (selectedVariant && (selectedVariant.service_id || selectedVariant.serviceId) || null);
  var operator = item.operator != null ? item.operator : (selectedVariant && selectedVariant.operator) || null;
  var vehicleType = item.vehicleType != null ? item.vehicleType : (selectedVariant && selectedVariant.vehicleType) || null;
  var normalized = Object.assign({}, item, {
    selectedVariant: selectedVariant || null,
    selectedUnitPrice: selectedUnitPrice != null ? Number(selectedUnitPrice) : 0,
    selected_unit_price: selectedUnitPrice != null ? Number(selectedUnitPrice) : 0,
    selectedPrice: selectedUnitPrice != null ? Number(selectedUnitPrice) : 0,
    selected_price: selectedUnitPrice != null ? Number(selectedUnitPrice) : 0,
    qty: qty,
    quantity: qty,
    selectedTotalPrice: selectedTotalPrice != null ? Number(selectedTotalPrice) : (selectedUnitPrice != null ? Number(selectedUnitPrice) * qty : 0),
    selected_total_price: selectedTotalPrice != null ? Number(selectedTotalPrice) : (selectedUnitPrice != null ? Number(selectedUnitPrice) * qty : 0),
    variant_name_snapshot: variantName || null,
    variantLabel: variantName || null,
    variant_id: item.variant_id != null ? item.variant_id : (selectedVariant && (selectedVariant.variant_id || selectedVariant.id || selectedVariant.variantId) || null),
    departure_time: departureTime || null,
    departureTime: departureTime || null,
    startTime: startTime || null,
    start_time: startTime || null,
    endTime: derivedEndTime || null,
    end_time: derivedEndTime || null,
    duration: duration || null,
    service_id: serviceId,
    operator: operator,
    vehicleType: vehicleType
  });
  if (normalized.category === 'Transport' && !normalized.variant_name_snapshot && normalized.name) {
    normalized.variant_name_snapshot = normalized.name;
    normalized.variantLabel = normalized.name;
  }
  return normalized;
}
function _normalizedItems(items) { return (items || []).map(normalizePlannerItem); }
function _active(items) { return _normalizedItems(items).filter(_isActive); }
function _itemPrice(i) { var n = normalizePlannerItem(i); return Number(n.selectedUnitPrice || 0); }
function _itemQty(i) { var n = normalizePlannerItem(i); return Number(n.qty || 1); }
/* A hotel room is priced PER NIGHT — qty is how many rooms, not how many
   nights, so nights must be applied as its own multiplier everywhere money
   is totalled. If the item has its own check-in/check-out set, use that;
   otherwise the realistic default is that the room is booked for the whole
   trip (that's what "add this hotel to my 5-night trip" means until the
   UI supports splitting a stay across multiple hotels). Every other
   category is already qty-only (tickets, participants, a private car). */
function _itemNights(item, plan) {
  if (item.category !== 'Hotel') return 1;
  if (item.date && item.endTime) { var n = diffDays(item.date, item.endTime); if (n > 0) return n; }
  if (item.notes) { var m = /nights=(\d+)/.exec(item.notes); if (m) { var nn = parseInt(m[1], 10); if (nn > 0) return nn; } }
  return plan ? Compute.tripDays(plan) : 1;
}
function _itemLineTotal(item, plan) { return _itemPrice(item) * _itemQty(item) * _itemNights(item, plan); }

var Compute = {
  /* Same room-capacity guess the planner drawer uses when Supabase has
     no explicit capacity for a room type — kept here too so scoring and
     the drawer's own quantity default agree on the same assumption. */
  guessCapacityFallback: function(name) { var n = (name || '').toLowerCase();
    if (/\b(single|solo)\b/.test(n)) return 1;
    if (/\b(triple|family|quad)\b/.test(n)) return 4;
    if (/\b(suite|villa)\b/.test(n)) return 3;
    return 2; },
  total: function(items, plan) { return _active(items).reduce(function(sum, item) { return sum + _itemLineTotal(item, plan); }, 0); },
  tripDays: function(plan) { return plan && plan.startDate && plan.endDate ? Math.max(1, diffDays(plan.startDate, plan.endDate)) : 1; },
  dailyBreakdown: function(plan) {
    if (!plan || !plan.items || !plan.items.length || !plan.startDate || !plan.endDate) return [];
    var map = {};
    function add(date, amt) { if (!date) return; map[date] = (map[date] || 0) + amt; }
    _active(plan.items).forEach(function(item) {
      var price = _itemPrice(item);
      var qty = _itemQty(item);
      if (item.category === 'Hotel') {
        var nights = _itemNights(item, plan);
        var checkIn = (item.date && item.endTime) ? item.date : plan.startDate;
        for (var k = 0; k < nights; k++) add(addDays(checkIn, k), price * qty);
      } else {
        add(item.date || plan.startDate, price * qty);
      }
    });
    var days = [];
    var n = diffDays(plan.startDate, plan.endDate);
    for (var k = 0; k <= n; k++) {
      var d = addDays(plan.startDate, k);
      days.push({ date: d, total: map[d] || 0 });
    }
    return days;
  },
  budgetState: function(items, budget, plan) {
    var total = Compute.total(items, plan);
    var left = budget - total;
    return { total: total, budget: budget, left: left, over: left < 0, pct: budget ? Math.min(100, Math.round(total / budget * 100)) : 0 };
  },
  /* Exposed so every page shows the SAME number for the same line item —
     one formula, reused, instead of each page re-deriving "price × qty"
     on its own and quietly disagreeing with the sidebar total. */
  itemNights: function(item, plan) { return _itemNights(item, plan); },
  itemLineTotal: function(item, plan) { return _itemLineTotal(item, plan); },
  warnings: function(plan) {
    var w = [];
    var items = plan.items || [];
    var active = _active(items);
    var bs = Compute.budgetState(items, plan.budget || 0, plan);
    if (items.length === 0) w.push({ sev: 'info', ico: 'compass', title: 'Empty plan', msg: 'Add services to start building your trip.', action: { label: 'Browse services', route: '#/build?step=2' } });
    if (bs.over) w.push({ sev: 'high', ico: 'wallet', title: 'Budget exceeded', msg: 'Estimated cost is ' + Math.abs(bs.left).toLocaleString() + ' MMK above your budget.', action: { label: 'Review plan', route: '#/build?step=3' } });
    var transport = active.filter(function(i) { return i.category === 'Transport'; });
    if (transport.length === 0) w.push({ sev: 'info', ico: 'bus', title: 'No transportation', msg: 'You haven’t added any transport yet.', action: { label: 'Add transport', route: '#/build?step=2' } });
    else if (!transport.some(function(i) { return i.direction === 'back'; })) w.push({ sev: 'info', ico: 'bus', title: 'Add return transportation', msg: 'You have an outbound trip but no return yet.', action: { label: 'Add return', route: '#/build?step=2' } });
    if (!active.some(function(i) { return i.category === 'Hotel'; })) w.push({ sev: 'high', ico: 'bed', title: 'No accommodation', msg: 'No confirmed or planned hotel for your stay.', action: { label: 'Find hotels', route: '#/build?step=2' } });
    var seen = {};
    active.forEach(function(i) { var k = i.refId + '|' + (i.direction || ''); seen[k] = (seen[k] || 0) + 1; });
    if (Object.keys(seen).some(function(k) { return seen[k] > 1; })) w.push({ sev: 'medium', ico: 'copy', title: 'Duplicate service', msg: 'The same service appears more than once.', action: null });
    var acts = active.filter(function(i) { return i.category === 'Activity' && i.date; });
    for (var a = 0; a < acts.length; a++) {
      for (var b = a + 1; b < acts.length; b++) {
        if (acts[a].date === acts[b].date && _activityWindowsOverlap(acts[a], acts[b])) {
          w.push({ sev: 'medium', ico: 'clock', title: 'Time overlap', msg: '“' + acts[a].name + '” and “' + acts[b].name + '” overlap on ' + acts[a].date + '.', action: { label: 'Adjust', route: '#/build?step=2' } });
        }
      }
    }
    return w;
  },
  /* Recommendations use a rough budget SPLIT to steer suggestions toward
     a realistically-sized trip — not a hard rule, a starting point the
     traveller can always override themselves.
       Hotel — the real cost that matters isn't the trip's total budget,
       it's what that leaves per person, per night (budget / (nights x
       travellers)) — a room that sleeps `capacity` people costs each of
       them price/capacity per night, and that should land in the
       35–60% band of that per-person-per-night budget.
       Transport  ~12–32% of the whole budget, round trip, every traveller
       Activity   ~8–20% of the whole budget, PER activity (not the total)
     Worked example: a couple, 400,000 MMK, 3 nights = 66,667/person/night.
     A 70,000/night double room (35,000/person/night, 52.5%) matches; a
     25,000/person/way bus (100,000 round trip for two, 25%) matches. */
  recommendations: function(services, ctx) {
    ctx = ctx || {};
    var L = window.__MTP_LIKES || {};
    var disliked = Object.keys(L).filter(function(id) { return L[id] && L[id].mine === 'down'; });
    var liked = Object.keys(L).filter(function(id) { return L[id] && L[id].mine === 'up'; });
    var likedCats = {};
    liked.forEach(function(id) { var s = API.services.get(id); if (s) likedCats[s.category] = true; });
    var group = (ctx.group || '').toLowerCase();
    var budgetPer = ctx.budgetPer || Infinity;
    var budget = Number(ctx.budget) || 0;
    var travelers = Math.max(1, Number(ctx.travelers) || 1);
    var nights = Math.max(1, Number(ctx.nights) || 1);
    var budgetPerPersonPerNight = budget / (nights * travelers);
    var hotelBand = [budgetPerPersonPerNight * 0.35, budgetPerPersonPerNight * 0.60];
    var transportBand = [budget * 0.12, budget * 0.32];
    var activityBand = [budget * 0.08, budget * 0.20];
    var scored = (services || []).filter(function(s) { return disliked.indexOf(s.id) < 0; }).map(function(s) {
      var score = 0;
      var labels = [];
      if (!ctx.destination || s.destination === ctx.destination) score += 3;
      var within, fitLabel;
      if (budget > 0 && s.category === 'Hotel') {
        // Which room this service would actually book by default: the
        // cheapest listed room type, or the base price if none are listed.
        var rooms = s.roomTypes || [];
        var cheapest = rooms.length ? rooms.reduce(function(a, b) { return (Number(b.price) || 0) < (Number(a.price) || 0) ? b : a; }) : null;
        var roomPrice = cheapest ? (Number(cheapest.price) || s.price) : s.price;
        var cap = cheapest && cheapest.capacity ? Number(cheapest.capacity) : Compute.guessCapacityFallback(cheapest && cheapest.name);
        var perPersonPerNight = roomPrice / Math.max(1, cap);
        within = perPersonPerNight >= hotelBand[0] && perPersonPerNight <= hotelBand[1];
        fitLabel = 'Fits Your Budget';
      } else if (budget > 0 && s.category === 'Transport') {
        var roundTrip = s.price * travelers * 2; // there and back, everyone
        within = roundTrip >= transportBand[0] && roundTrip <= transportBand[1];
        fitLabel = 'Fits Your Budget';
      } else if (budget > 0 && s.category === 'Activity') {
        within = s.price >= activityBand[0] && s.price <= activityBand[1];
        fitLabel = 'Fits Your Budget';
      } else {
        within = s.price <= budgetPer;
        fitLabel = 'Within Budget';
      }
      if (within) { score += 2; labels.push(fitLabel); }
      score += s.rating;
      if (s.rating >= 4.5) labels.push('Highly Rated');
      var tags = (s.tags || []).join(' ').toLowerCase();
      if (group.indexOf('family') >= 0 && (tags.indexOf('family') >= 0 || (s.facilities || []).join(' ').toLowerCase().indexOf('family') >= 0)) { score += 2; labels.push('Family Friendly'); }
      /* A big group (5+) needs room/activity capacity that fits, whether or
         not "Family" was picked as the travel style — a group of 5 friends
         needs the same larger room a family of 5 would. */
      if (travelers >= 5) {
        if (s.category === 'Hotel' && (s.roomTypes || []).some(function(r) { return Number(r.capacity) >= Math.ceil(travelers / 2); })) { score += 2; labels.push('Fits Your Group'); }
        if (s.category === 'Activity' && tags.indexOf('family') >= 0) score += 1;
      }
      if (ctx.purpose && tags.indexOf(ctx.purpose.toLowerCase()) >= 0) score += 1;
      if (likedCats[s.category]) labels.unshift('Because you liked');
      if (score >= 6) labels.unshift('Best Match');
      else if (score >= 4) labels.push('Recommended');
      if (labels.length === 0) labels.push('Suitable for this trip');
      return { service: s, labels: labels, score: score };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored;
  }
};

var Store = {
  _subs: [],
  _named: {},
  _plan: null,
  subscribe: function(fn) { this._subs.push(fn); return function() { this._subs = this._subs.filter(function(s) { return s !== fn; }); }.bind(this); },
  subscribeNamed: function(key, fn) { if (this._named[key]) this._named[key](); if (!fn) { delete this._named[key]; return; } this._named[key] = this.subscribe(fn); },
  _emit: function() { var snap = this.snapshot(); this._subs.forEach(function(fn) { try { fn(snap); } catch (e) { console.error(e); } }); },
  load: function(planId) { this._plan = API.plans.get(planId || API.plans.activeId()) || null; this._emit(); return this._plan; },
  reload: function() { if (this._plan) this._plan = API.plans.get(this._plan.id); this._emit(); },
  snapshot: function() {
    var plan = this._plan;
    if (!plan) return { plan: null, items: [], activeItems: [], total: 0, budget: 0, left: 0, over: false, pct: 0, warnings: [], byCategory: {} };
    var items = _normalizedItems(plan.items || []);
    var active = _active(items);
    var bs = Compute.budgetState(items, plan.budget, plan);
    var byCategory = {};
    active.forEach(function(i) { byCategory[i.category] = (byCategory[i.category] || 0) + _itemLineTotal(i, plan); });
    return { plan: plan, items: items, activeItems: active, total: bs.total, budget: bs.budget, left: bs.left, over: bs.over, pct: bs.pct, warnings: Compute.warnings(plan), byCategory: byCategory };
  },
  add: async function(ref, opts) { if (!this._plan) return; await API.plans.addItem(this._plan.id, ref, opts); this.reload(); },
  remove: async function(itemId) { if (!this._plan) return; await API.plans.removeItem(this._plan.id, itemId); this.reload(); },
  setPlan: function(id) { API.plans.setActive(id); this.load(id); },
  setItemStatus: async function(itemId, status) {
    var plan = this._plan; if (!plan) return;
    var it = (plan.items || []).find(function(i) { return i.id === itemId; });
    if (!it) return;
    it.item_status = status;
    var uid = (window.__MTP_USER && window.__MTP_USER.id) || '';
    var key = MTPStorage.forUser('plans', uid);
    var plans = MTPStorage.get(key, []);
    var idx = plans.findIndex(function(p) { return p.id === plan.id; });
    if (idx >= 0) { plans[idx] = plan; MTPStorage.set(key, plans); if (window.__MTP_SYNC) window.__MTP_SYNC.schedule(); }
    this._emit();
  }
};

window.Store = Store;
window.Compute = Compute;
window.CAT_ICON = CAT_ICON;
window.CAT_COLOR = CAT_COLOR;
window.normalizePlannerItem = normalizePlannerItem;
