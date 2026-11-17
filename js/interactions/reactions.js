/* ============================================================
   PUBLIC REACTIONS (like / dislike) — real Supabase table.

   Design:
   - Anyone can SEE counts, even a logged-out visitor.
   - Only a signed-in user can react, and only to their own row
     (enforced by the database itself via RLS — see
     service_reactions_migration.sql).
   - The DETAILED reason for a dislike ("price", "unavailable"...)
     is separate, private product feedback, and still goes to the
     existing `feedback` table via API.feedback.create().

   This module keeps the exact same HTML contract that
   components.js already renders (.thumb-row / .thumb-up /
   .thumb-down / .count / .dislike-pop / .chip / [data-dp-submit]
   / [data-dp-cancel]) — so nothing else in the app needed to
   change. Swap the data source in, keep the UI the same: that's
   the whole point of having a template layer.
   ============================================================ */
(function () {

  function sb() {
    if (window.__MTP_SB) return window.__MTP_SB;
    try {
      if (window.supabase && typeof supabaseConfigured === 'function' && supabaseConfigured()) {
        window.__MTP_SB = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        return window.__MTP_SB;
      }
    } catch (e) {}
    return null;
  }

  window.__MTP_LIKES = window.__MTP_LIKES || {}; // refId(slug) -> {up, down, mine}
  var _uuidCache = {};

  function serviceUuid(refId) {
    if (_uuidCache[refId]) return _uuidCache[refId];
    var s = (typeof API !== 'undefined' && API.services && API.services.get) ? API.services.get(refId) : null;
    var uuid = s && s.service_uuid;
    if (uuid) _uuidCache[refId] = uuid;
    return uuid || null;
  }

  function currentUser() {
    try { return (typeof API !== 'undefined' && API.getCurrentUser) ? API.getCurrentUser() : null; } catch (e) { return null; }
  }

  async function loadCounts(refId) {
    var client = sb(), uuid = serviceUuid(refId);
    if (!client || !uuid) return { up: 0, down: 0, mine: null };
    var res = await client.from('service_reactions').select('user_id,is_like').eq('service_id', uuid);
    if (res.error || !res.data) return { up: 0, down: 0, mine: null };
    var me = currentUser(), up = 0, down = 0, mine = null;
    res.data.forEach(function (r) {
      if (r.is_like) up++; else down++;
      if (me && r.user_id === me.id) mine = r.is_like ? 'up' : 'down';
    });
    return { up: up, down: down, mine: mine };
  }

  function refreshThumb(refId) {
    var state = window.__MTP_LIKES[refId] || { up: 0, down: 0, mine: null };
    document.querySelectorAll('.thumb-row[data-ref="' + refId + '"]').forEach(function (row) {
      var up = row.querySelector('.thumb-up'), down = row.querySelector('.thumb-down');
      if (up) { up.classList.toggle('active', state.mine === 'up'); var cu = up.querySelector('.count'); if (cu) cu.textContent = state.up; }
      if (down) { down.classList.toggle('active', state.mine === 'down'); var cd = down.querySelector('.count'); if (cd) cd.textContent = state.down; }
    });
  }

  // Only fetch counts for cards actually on screen right now — cheap,
  // and it means adding new pages never requires touching this file.
  async function hydrateVisible() {
    if (!sb()) return; // not configured yet / offline — leave zeros showing
    var rows = document.querySelectorAll('.thumb-row[data-ref]');
    var ids = Array.from(new Set(Array.from(rows).map(function (r) { return r.dataset.ref; })));
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      window.__MTP_LIKES[id] = await loadCounts(id);
      refreshThumb(id);
    }
  }

  async function setReaction(refId, isLike) {
    var client = sb(), me = currentUser();
    if (!client) return;
    if (!me) {
      showToast('Log in to rate a service', 'info');
      if (typeof Auth !== 'undefined' && Auth.showAuth) Auth.showAuth('login');
      return;
    }
    var uuid = serviceUuid(refId);
    if (!uuid) return;

    var state = window.__MTP_LIKES[refId] || { up: 0, down: 0, mine: null };
    var already = state.mine === (isLike ? 'up' : 'down');

    try {
      if (already) {
        await client.from('service_reactions').delete().eq('service_id', uuid).eq('user_id', me.id);
      } else {
        await client.from('service_reactions').upsert(
          [{ service_id: uuid, user_id: me.id, is_like: isLike, updated_at: new Date().toISOString() }],
          { onConflict: 'service_id,user_id' }
        );
      }
    } catch (e) {
      showToast('Could not save your rating — try again', 'error');
      return;
    }

    window.__MTP_LIKES[refId] = await loadCounts(refId);
    refreshThumb(refId);
    if (!already) {
      showToast(isLike ? "Thanks — this helps other travellers" : 'Noted, thanks for the honest rating', isLike ? 'success' : 'info');
    }
  }

  // Detailed "why" -> private product feedback (existing feedback table),
  // completely separate from the public like/dislike count above.
  async function submitDislikeReason(refId, reasons) {
    try {
      var s = (typeof API !== 'undefined' && API.services && API.services.get) ? API.services.get(refId) : null;
      if (!s || typeof API === 'undefined' || !API.feedback) return;
      await API.feedback.create({ refId: refId, refName: s.name, reasons: reasons, comment: '' });
    } catch (e) {}
  }

  /* ---- floating "what didn't work?" popover — ONE shared instance,
     appended to <body> and positioned by coordinates, instead of one
     copy nested inside every single card. Nesting it in the card was
     the actual bug: every card wrapper uses overflow:hidden for its
     rounded corners, which silently clipped the popover the moment it
     tried to appear above the card edge — display:block doesn't help
     if the parent is cutting it off. A floating, positioned popover
     can never be clipped by a card again, and it also means the page
     carries one popover element total instead of one per card. */
  var POP_ID = 'dislikePopRoot';
  function popRoot() {
    var el = document.getElementById(POP_ID);
    if (!el) {
      el = document.createElement('div'); el.id = POP_ID;
      el.innerHTML = '<div class="dislike-pop" role="dialog"><h5>What didn\'t work?</h5><div class="reasons">'
        + '<span class="chip" data-r="price">Price</span><span class="chip" data-r="info">Info wrong</span>'
        + '<span class="chip" data-r="unavailable">Unavailable</span><span class="chip" data-r="not-for-me">Not for me</span></div>'
        + '<div class="dp-acts"><button class="btn btn-ghost btn-sm" data-dp-cancel type="button">Skip</button>'
        + '<button class="btn btn-primary btn-sm" data-dp-submit type="button">Submit</button></div></div>';
      document.body.appendChild(el);
    }
    return el;
  }

  function openReasonPopover(refId, anchorBtn) {
    var root = popRoot();
    root.dataset.pop = refId;
    var pop = root.querySelector('.dislike-pop');
    pop.querySelectorAll('.chip.sel').forEach(function (c) { c.classList.remove('sel'); });
    var r = anchorBtn.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 296)) + 'px';
    var top = r.top - pop.offsetHeight - 10;
    if (top < 8) top = r.bottom + 10; // flip below if there's no room above
    pop.style.top = top + 'px';
    root.classList.add('show');
  }

  function closeReasonPopover() {
    var root = document.getElementById(POP_ID);
    if (root) root.classList.remove('show');
  }

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('.thumb');
    if (thumb) {
      var row = thumb.closest('.thumb-row');
      if (!row) return;
      e.stopPropagation();
      if (thumb.dataset.act === 'down') {
        var root = document.getElementById(POP_ID);
        var wasOpenForThis = root && root.classList.contains('show') && root.dataset.pop === row.dataset.ref;
        closeReasonPopover();
        if (!wasOpenForThis) openReasonPopover(row.dataset.ref, thumb);
        return;
      }
      closeReasonPopover();
      setReaction(row.dataset.ref, true);
      return;
    }

    var chip = e.target.closest('#' + POP_ID + ' .chip');
    if (chip) { chip.classList.toggle('sel'); e.stopPropagation(); return; }

    if (e.target.closest('[data-dp-cancel]')) {
      e.stopPropagation();
      closeReasonPopover(); // Skip just closes — no reaction is recorded
      return;
    }

    if (e.target.closest('[data-dp-submit]')) {
      e.stopPropagation();
      var root2 = document.getElementById(POP_ID);
      var refId = root2 && root2.dataset.pop;
      if (!refId) return;
      var reasons = Array.from(root2.querySelectorAll('.chip.sel')).map(function (c) { return c.dataset.r; });
      setReaction(refId, false);
      submitDislikeReason(refId, reasons);
      closeReasonPopover();
      return;
    }

    if (!e.target.closest('#' + POP_ID)) closeReasonPopover();
  });

  window.addEventListener('scroll', closeReasonPopover, true);
  window.addEventListener('resize', closeReasonPopover);

  window.MTPReactions = { hydrateVisible: hydrateVisible, refreshThumb: refreshThumb };
})();
