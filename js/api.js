/* ============================================================
   API / REPOSITORY LAYER
   - Catalog  -> in-memory CAT from the cloud (read-only).
   - Auth     -> REAL Supabase; signed-in user cached in
                 window.__MTP_USER (sync reads).
   - Plans / plan items / saved / feedback / history -> REAL
                 Supabase tables, cached in-memory as USER_DATA
                 (js/cloud-user.js) once per login so reads stay
                 synchronous everywhere else in the app.
   - Tracking / notifications / preferences -> still browser-only
                 for now (out of scope for this pass — see chat).
   ============================================================ */
const K = { prefs:'mbt_preferences', notif:'mbt_notifications', contact:'mbt_contact_messages' };

let CAT = {
  destinations: (window.SEED&&SEED.destinations)||[],
  providers:    (window.SEED&&SEED.providers)||[],
  services:     (window.SEED&&SEED.services)||[],
  packages:     (window.SEED&&SEED.packages)||[]
};

/* ---- per-account shelf: still used for tracking + notifications,
   which remain browser-only until a later pass ---- */
function _uid(){ var u=window.__MTP_USER; return (u&&u.id)?String(u.id):null; }
function _pkey(k){ return MTPStorage.forUser(k,_uid()); }
const P = {
  get:(k,d)=>{ if(!_uid()) return (d===undefined?[]:d); return MTPStorage.get(_pkey(k), (d===undefined?null:d)); },
  set:(k,v)=>{ if(!_uid()) return; MTPStorage.set(_pkey(k),v); if(window.__MTP_SYNC) window.__MTP_SYNC.schedule(); }
};
function _ensureSeeded(){
  var u=_uid(); if(!u) return;
  if(MTPStorage.get('mbt_priv_seeded::'+u)) return;
  P.set('tracking',[]);
  MTPStorage.set('mbt_priv_seeded::'+u,true);
}

/* ---- uuid <-> slug helpers used by the plans/saved/feedback rewrite
   below (js/cloud-user.js has the read-side equivalents) ---- */
function _destUuidBySlug(slug){ return (window.UserData&&UserData.destUuidBySlug)?UserData.destUuidBySlug(slug):null; }
function _providerNameBySlug(slug){ return (window.UserData&&UserData.providerNameBySlug)?UserData.providerNameBySlug(slug):''; }
function _savedItemType(id){
  if((CAT.destinations||[]).some(d=>d.id===id)) return 'destination';
  if((CAT.packages||[]).some(p=>p.id===id)) return 'package';
  return 'service';
}
function _uuidsForRefId(refId){
  var s=(CAT.services||[]).find(x=>x.id===refId); if(s) return {service_id:s.service_uuid||null,package_id:null};
  var p=(CAT.packages||[]).find(x=>x.id===refId); if(p) return {service_id:null,package_id:p.package_uuid||null};
  return {service_id:null,package_id:null};
}

/* ---- the single shared Supabase client (auth + catalog) ---- */
function _sb(){
  if (window.__MTP_SB) return window.__MTP_SB;
  try { if (window.supabase && typeof supabaseConfigured==='function' && supabaseConfigured()){
    window.__MTP_SB = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY); return window.__MTP_SB; } } catch(e){}
  return null;
}
function _needSb(){ var c=_sb(); if(!c) throw new Error('Supabase is not connected yet — open via Live Server (Go Live) and check the two keys at the top of js/cloud.js.'); return c; }

const API = {
  setCatalog(obj){ if(obj){ CAT={ destinations:obj.destinations||[], providers:obj.providers||[], services:obj.services||[], packages:obj.packages||[] }; } },
  isCloud(){ return window.__MTP_CLOUD===true; },
  async bootstrap(){ /* private seeding is now per-account & lazy; nothing global to do */ },

  /* ================= AUTH (real Supabase) ================= */
  _userFromAuth(u,p){ p=p||{}; var md=u.user_metadata||{}; var em=u.email||'';
    return { id:u.id, email:em, full_name:p.full_name||md.full_name||(em?em.split('@')[0]:'Traveller'),
      phone:p.phone||md.phone||'', country:p.country||md.country||'Myanmar', avatar_url:p.avatar_url||md.avatar_url||'' }; },
  _scheduleShelfSync(){ if(window.__MTP_SYNC && typeof window.__MTP_SYNC.schedule==='function'){ window.__MTP_SYNC.schedule(); } },
  _setSessionUser(u){ window.__MTP_USER = u||null; if(!u && window.USER_DATA){ window.USER_DATA={ plans:[], saved:[], feedback:[], history:[], notifications:[] }; } },
  getCurrentUser(){ return window.__MTP_USER||null; },

  async _loadSessionUser(){
    var c=_sb(); if(!c){ this._setSessionUser(null); return null; }
    var s; try { s = await c.auth.getSession(); } catch(e){ s={data:{session:null}}; }
    var sess = s.data && s.data.session;
    if(!sess){ this._setSessionUser(null); return null; }
    /* Refresh the access token on every boot so a wrong device clock (or any
       expiry) can't leave us waving a stale card the server rejects as 401. */
    try { var r = await c.auth.refreshSession(); sess = (r.data && r.data.session) || sess; }
    catch(e){ try{ await c.auth.signOut({scope:'local'}); }catch(_){} this._setSessionUser(null); return null; }
    var u = sess.user; if(!u){ this._setSessionUser(null); return null; }
    var md=u.user_metadata||{}; var em=u.email||'';
    var pr=null;
    try{
      var rr=await c.from('profiles').select('*').eq('user_id',u.id).maybeSingle(); if(!rr.error) pr=rr.data;
      if(!pr){
        var profileData={ user_id:u.id, full_name:md.full_name||em.split('@')[0]||'Traveller', phone:md.phone||'', country:md.country||'Myanmar' };
        var ir=await c.from('profiles').insert([profileData]).single(); if(!ir.error) pr=ir.data; else pr=profileData;
      }
    }catch(e){}
    var obj=this._userFromAuth(u,pr); this._setSessionUser(obj);
    if(window.__MTP_SYNC && typeof window.__MTP_SYNC.pull==='function'){
      window.__MTP_SYNC.pull().catch(function(e){ console.warn('sync',e); });
    }
    return obj;
  },
  async register(d){
    var c=_needSb();
    var r=await c.auth.signUp({ email:d.email, password:d.password, options:{ data:{ full_name:d.full_name, phone:d.phone||'', country:d.country||'Myanmar' } } });
    if(r.error) throw new Error(r.error.message);
    if(!r.data.session) throw new Error('Check your email to confirm your address, then log in.');
    await this._loadSessionUser(); return { user:window.__MTP_USER };
  },
  async login(cred){
    var c=_needSb();
    var r=await c.auth.signInWithPassword({ email:cred.email, password:cred.password });
    if(r.error) throw new Error('Incorrect email or password');
    await this._loadSessionUser(); return { user:window.__MTP_USER };
  },
  async logout(){
    if(window.__MTP_SYNC){ try{ await window.__MTP_SYNC.push(); }catch(e){} }
    var c=_sb(); if(c){ try{ await c.auth.signOut(); }catch(e){} } this._setSessionUser(null);
  },

  /* ================= PROFILE / SECURITY ================= */
  async updateProfile(id,data){
    var c=_sb();
    if(c){ try{ await c.from('profiles').update({ full_name:data.full_name||null, phone:data.phone||null, country:data.country||null }).eq('user_id',id); }catch(e){}
           try{ await c.auth.updateUser({ data:{ full_name:data.full_name } }); }catch(e){} }
    if(window.__MTP_USER){ window.__MTP_USER = Object.assign({}, window.__MTP_USER, data); }
    return window.__MTP_USER;
  },
  async changePassword(id,cur,nw){ var c=_needSb(); var r=await c.auth.updateUser({ password:nw }); if(r.error) throw new Error(r.error.message); return true; },
  async deleteAccount(id){ var c=_sb(); if(c){ try{ await c.auth.signOut(); }catch(e){} } this._setSessionUser(null); showToast('Signed out. To fully erase the account, delete it in Supabase → Authentication → Users.','info'); return true; },

  /* ================= PREFERENCES / NOTIFICATIONS / CONTACT ================= */
  async savePreferences(id,p){ const all=MTPStorage.get(K.prefs,{}); all[id]={...p,updated_at:new Date().toISOString()}; MTPStorage.set(K.prefs,all); this._scheduleShelfSync(); return all[id]; },
  async getPreferences(id){ return (MTPStorage.get(K.prefs,{}))[id]||null; },
  async saveNotifications(id,n){ const all=MTPStorage.get(K.notif,{}); all[id]={...n,updated_at:new Date().toISOString()}; MTPStorage.set(K.notif,all); this._scheduleShelfSync(); return all[id]; },
  async getNotifications(id){ return (MTPStorage.get(K.notif,{}))[id]||{email:true,reminders:true,price:true,packages:false}; },
  async saveSettings(id,s){ const cur=P.get('settings',{}); const next={...cur,...s,updated_at:new Date().toISOString()}; P.set('settings',next); this._scheduleShelfSync(); return next; },
  async getSettings(id){ return P.get('settings',{}); },
  async sendContactMessage(m){ const all=MTPStorage.get(K.contact,[]); all.push({...m,id:Date.now(),created_at:new Date().toISOString()}); MTPStorage.set(K.contact,all); return {success:true}; },

  /* ================= CATALOG (cloud via CAT) ================= */
  destinations:{ list:()=>CAT.destinations.slice(), get:id=>CAT.destinations.find(d=>d.id===id)||null },
  providers:{ list:()=>CAT.providers.slice(), get:id=>CAT.providers.find(p=>p.id===id)||null },
  services:{
    get:id=>CAT.services.find(s=>s.id===id)||null,
    list:(f)=>{ f=f||{}; let r=CAT.services.slice();
      if(f.category&&f.category!=='All') r=r.filter(s=>s.category===f.category);
      if(f.destination) r=r.filter(s=>s.destination===f.destination);
      if(f.maxPrice!=null) r=r.filter(s=>s.price<=f.maxPrice);
      if(f.facilities&&f.facilities.length) r=r.filter(s=>f.facilities.every(fc=>(s.facilities||[]).indexOf(fc)>=0));
      if(f.q){ const q=f.q.toLowerCase(); r=r.filter(s=>(s.name+' '+s.description+' '+(s.tags||[]).join(' ')).toLowerCase().indexOf(q)>=0); }
      if(f.sort==='price-asc') r.sort((a,b)=>a.price-b.price);
      else if(f.sort==='price-desc') r.sort((a,b)=>b.price-a.price);
      else if(f.sort==='rating') r.sort((a,b)=>b.rating-a.rating);
      return r; }
  },
  packages:{
    get:id=>CAT.packages.find(p=>p.id===id)||null,
    list:(f)=>{ f=f||{}; let r=CAT.packages.slice();
      if(f.badge&&f.badge!=='All') r=r.filter(p=>p.badge===f.badge);
      if(f.destination) r=r.filter(p=>p.destination===f.destination);
      if(f.q){ const q=f.q.toLowerCase(); r=r.filter(p=>(p.name+' '+p.description).toLowerCase().indexOf(q)>=0); }
      return r; }
  },
  any(id){ return API.services.get(id)||API.packages.get(id)||null; },

  /* ================= PRIVATE DATA — real Supabase tables ================= */
  /* USER_DATA (js/cloud-user.js) is loaded once per login and cached in
     memory — reads here are synchronous against that cache, exactly like
     every render call in this app already assumes; writes go to Supabase
     first, and only update the cache once the write actually succeeds. */
  plans:{
    list:()=>USER_DATA.plans,
    get:id=>USER_DATA.plans.find(p=>p.id===id)||null,
    activeId:()=>{ if(USER_DATA._activeId && USER_DATA.plans.some(p=>p.id===USER_DATA._activeId)) return USER_DATA._activeId;
      const fallback=USER_DATA.plans.find(p=>p.status==='draft'||p.status==='active'); return fallback?fallback.id:null; },
    setActive:id=>{ USER_DATA._activeId=id; },
    async create(meta){
      const c=_needSb(); const u=window.__MTP_USER; if(!u) throw new Error('Please log in to start a trip.');
      const row={ user_id:u.id, destination_id:_destUuidBySlug(meta.destination), plan_name:meta.name||'My Travel Plan',
        start_date:meta.startDate, end_date:meta.endDate, traveler_count:meta.travelers||2, group_type:meta.travelGroup||'Friends',
        purpose:meta.purpose||'Relaxation', total_budget:meta.budget||500000, status:'draft' };
      const r=await c.from('travel_plans').insert([row]).select().single();
      if(r.error) throw new Error(r.error.message);
      const p=UserData.mapPlanRow(r.data,[]); USER_DATA.plans.unshift(p); USER_DATA._activeId=p.id;
      API.history.append({type:'plan_created',label:'Plan Created',target:p.name,planId:p.id}); return p; },
    async addItem(planId,ref,opts){ opts=opts||{}; const c=_needSb(); const p=USER_DATA.plans.find(x=>x.id===planId); if(!p) throw new Error('Plan not found');
      const dir=opts.direction||null;
      const selectedVariant=opts.selectedVariant||null;
      const variantId=(selectedVariant&&(selectedVariant.variant_id||selectedVariant.id||selectedVariant.variantId))||null;
      const variantName=(selectedVariant&&(selectedVariant.name||selectedVariant.variant_name||selectedVariant.label))||null;
      const variantPrice=(selectedVariant&&selectedVariant.price!=null)?Number(selectedVariant.price):null;
      const isPackage=!!ref.duration; /* packages carry a duration string ("3 Days"); services don't */
      const serviceUuid=isPackage?null:(ref.service_uuid||null);
      const packageUuid=isPackage?(ref.package_uuid||null):null;
      const departureTime=(selectedVariant&&(selectedVariant.departure_time||selectedVariant.departureTime||selectedVariant.startTime||selectedVariant.time||selectedVariant.departure||''))||'';
      const selectedUnitPriceValue=opts.selectedUnitPrice!=null?Number(opts.selectedUnitPrice):(selectedVariant&&selectedVariant.selected_unit_price!=null?Number(selectedVariant.selected_unit_price):(selectedVariant&&selectedVariant.selectedUnitPrice!=null?Number(selectedVariant.selectedUnitPrice):(variantPrice!=null?variantPrice:(ref.price!=null?Number(ref.price):0))));
      const selectedPrice=opts.selectedPrice!=null?Number(opts.selectedPrice):selectedUnitPriceValue;
      const startTimeValue=opts.startTime!=null?opts.startTime:(selectedVariant&&(selectedVariant.startTime||selectedVariant.start_time||selectedVariant.departureTime||selectedVariant.departure_time||selectedVariant.time||selectedVariant.departure||''))||'';
      const endTimeValue=opts.endTime!=null?opts.endTime:(selectedVariant&&(selectedVariant.endTime||selectedVariant.end_time||selectedVariant.arrivalTime||selectedVariant.arrival_time))||'';
      /* start_time/end_time are TIME-of-day columns in the database — a
         hotel check-in/out is a DATE concept (already captured in
         planned_date + notes' nights=N), never a clock time, so these
         must never reach a Hotel row even if a room variant happened to
         carry a stray value in one of the fallback fields above. */
      const isHotelRow=(ref.category==='Hotel');
      if(p.items.some(i=>i.refId===ref.id && (i.direction||null)===dir && (i.variant_id||'')===(variantId||''))) return p;
      const ppl=Math.max(1,p.travelers||1);
      const explicitQty=opts.quantity!=null?Number(opts.quantity):null;
      let qty=explicitQty!=null?explicitQty:(opts.qty!=null?Number(opts.qty):1);
      /* Default quantity follows pricing_type, not a blind nights×people multiply —
         a hotel room is priced per room per night, not per person per night. Nights
         are applied at total-cost time via Compute, not baked into quantity here.
         These are only used when nobody picked a quantity explicitly (e.g. via the
         planning drawer, which always sends an explicit qty). */
      if(!explicitQty && !opts.qty){
        const pt=ref.pricing_type||'';
        if(pt==='per_way_per_person'||pt==='per_person'||pt==='free') qty=ppl;
        else qty=1;
      }
      if(!Number.isFinite(qty)||qty<1) qty=1;
      const selectedTotalPriceValue=opts.selectedTotalPrice!=null?Number(opts.selectedTotalPrice):(selectedVariant&&selectedVariant.selected_total_price!=null?Number(selectedVariant.selected_total_price):(selectedVariant&&selectedVariant.selectedTotalPrice!=null?Number(selectedVariant.selectedTotalPrice):(Number(selectedPrice||0)*Number(qty||1))));
      const totalPrice=Number(selectedTotalPriceValue!=null?selectedTotalPriceValue:(Number(selectedPrice||0)*Number(qty||1)));
      const row={ plan_id:planId, service_id:serviceUuid, package_id:packageUuid, variant_id:variantId, leg:dir,
        added_via:'manual', service_name_snapshot:ref.name, provider_name_snapshot:_providerNameBySlug(ref.provider)||ref.provider||'Provider',
        category_snapshot:ref.category||'Package', variant_name_snapshot:variantName,
        planned_date:opts.date||null, start_time:isHotelRow?null:(startTimeValue||null), end_time:isHotelRow?null:(endTimeValue||null),
        /* selected_total_price is a GENERATED column on this database —
           Postgres rejects any explicit value at all, even a correct
           one ("cannot insert a non-default value into column"). The
           DB computes it as quantity × selected_unit_price, with no
           idea about hotel nights — cloud-user.js corrects that back
           to the real total (nights included) when reading the row
           back, so every display path still shows the right number. */
        quantity:qty, selected_unit_price:selectedUnitPriceValue,
        item_status:opts.item_status||'planned', image_url:ref.image||null, official_url:ref.officialUrl||null, notes:opts.notes||null };
      const r=await c.from('plan_items').insert([row]).select().single();
      if(r.error) throw new Error(r.error.message);
      const totalBefore=(window.Compute?Compute.total(p.items,p):0);
      const item=UserData.mapItemRow(r.data); p.items.push(item);
      API.history.append({type:'item_added',label:'Service Added',target:ref.name,planId:p.id,refId:ref.id});
      if(window.Compute && p.budget>0){
        const totalAfter=Compute.total(p.items,p);
        if(totalAfter>p.budget && totalBefore<=p.budget){
          API.notifications._create(p.id,'budget_exceeded','Over budget',
            '“'+p.name+'” is now '+Math.round(totalAfter-p.budget).toLocaleString()+' MMK over your '+p.budget.toLocaleString()+' MMK budget.');
        }
      }
      return p; },
    async removeItem(planId,itemId){ const c=_needSb(); const p=USER_DATA.plans.find(x=>x.id===planId); if(!p) return;
      const it=p.items.find(i=>i.id===itemId);
      const r=await c.from('plan_items').delete().eq('plan_item_id',itemId); if(r.error) throw new Error(r.error.message);
      p.items=p.items.filter(i=>i.id!==itemId);
      if(it) API.history.append({type:'item_removed',label:'Service Removed',target:it.name,planId:p.id,refId:it.refId}); return p; },
    /* Patches one plan_item row directly (item_status, quantity, or notes —
       the same columns addItem writes on insert) and re-derives the cached
       copy with UserData.mapItemRow, so it matches a fresh reload exactly —
       including the hotel-nights total correction that column mapping
       already does. No pricing/recommendation logic lives here; this is
       the same insert/delete pattern as addItem/removeItem, just an update. */
    async updateItem(planId,itemId,patch){ const c=_needSb(); const p=USER_DATA.plans.find(x=>x.id===planId); if(!p) return;
      const idx=p.items.findIndex(i=>i.id===itemId); if(idx<0) return;
      const r=await c.from('plan_items').update(patch).eq('plan_item_id',itemId).select().single();
      if(r.error) throw new Error(r.error.message);
      p.items[idx]=UserData.mapItemRow(r.data);
      return p; },
    async updateStatus(planId,status){ const c=_needSb(); const p=USER_DATA.plans.find(x=>x.id===planId); if(!p) return;
      const wasActive=(p.status==='active'||p.status==='confirmed'||p.status==='completed');
      const r=await c.from('travel_plans').update({status:status}).eq('plan_id',planId); if(r.error) throw new Error(r.error.message);
      p.status=status;
      const nowActive=(status==='completed'||status==='confirmed'||status==='active');
      if(nowActive){
        API.history.append({type:'plan_confirmed',label:'Plan Confirmed',target:p.name,planId:p.id});
        if(!wasActive) API.notifications._create(p.id,'plan_confirmed','Trip confirmed',
          '“'+p.name+'” is locked in — '+(p.items||[]).length+' item'+((p.items||[]).length===1?'':'s')+', ready whenever you are.');
      }
      return p; }
  },
  saved:{
    list:()=>USER_DATA.saved,
    has:id=>USER_DATA.saved.indexOf(id)>=0,
    async toggle(item){ const c=_needSb(); const u=window.__MTP_USER; if(!u) throw new Error('Please log in to save this.');
      const already=USER_DATA.saved.indexOf(item.id)>=0;
      if(already){
        const type=_savedItemType(item.id);
        const col=type==='destination'?'destination_id':type==='package'?'package_id':'service_id';
        const uuid=type==='destination'?_destUuidBySlug(item.id):(item.service_uuid||item.package_uuid||null);
        const r=await c.from('saved_items').delete().eq('user_id',u.id).eq(col,uuid); if(r.error) throw new Error(r.error.message);
        USER_DATA.saved=USER_DATA.saved.filter(x=>x!==item.id); return false;
      } else {
        const type=_savedItemType(item.id);
        const row={ user_id:u.id, item_type:type,
          destination_id:type==='destination'?_destUuidBySlug(item.id):null,
          service_id:type==='service'?(item.service_uuid||null):null,
          package_id:type==='package'?(item.package_uuid||null):null };
        const r=await c.from('saved_items').insert([row]); if(r.error) throw new Error(r.error.message);
        USER_DATA.saved.push(item.id); return true;
      } }
  },
  tracking:{
    list:()=>{ _ensureSeeded(); return P.get('tracking',[]); },
    async recordVisit(ref){ _ensureSeeded(); let t=P.get('tracking',[]); let row=t.find(x=>x.refId===ref.id);
      if(!row){ row={id:'tr-'+Date.now(),refId:ref.id,name:ref.name,provider:ref.providerName||'',officialUrl:ref.officialUrl,status:'pending',visitedAt:new Date().toISOString()}; t.unshift(row); }
      else { row.visitedAt=new Date().toISOString(); if(row.status==='notvisited') row.status='pending'; }
      P.set('tracking',t); API.history.append({type:'official_clicked',label:'Official Website Clicked',target:ref.name,refId:ref.id}); return row; },
    async setStatus(refId,status){ _ensureSeeded(); const t=P.get('tracking',[]); const row=t.find(x=>x.refId===refId); if(!row) return;
      row.status=status; P.set('tracking',t); const map={confirmed:'success',failed:'failed',disliked:'disliked'};
      if(map[status]) API.history.append({type:map[status],label:'Marked '+status,target:row.name,refId:refId}); return row; }
  },
  feedback:{
    list:(f)=>{ f=f||{}; let r=USER_DATA.feedback; if(f.refId) r=r.filter(x=>x.refId===f.refId); return r; },
    async create(o){ const c=_needSb(); const u=window.__MTP_USER; if(!u) throw new Error('Please log in to leave feedback.');
      const uuids=_uuidsForRefId(o.refId);
      const row={ user_id:u.id, service_id:uuids.service_id||null, package_id:uuids.package_id||null,
        feedback_type:'dislike', reason_codes:o.reasons||[], comment:o.comment||'' };
      const r=await c.from('feedback').insert([row]).select().single(); if(r.error) throw new Error(r.error.message);
      const fb={ id:r.data.feedback_id, refId:o.refId, refName:o.refName, reasons:r.data.reason_codes||[], comment:r.data.comment||'', createdAt:r.data.created_at };
      USER_DATA.feedback.unshift(fb);
      API.history.append({type:'feedback_submitted',label:'Feedback Submitted',target:o.refName,refId:o.refId}); return fb; },
    async update(id,o){ const c=_needSb();
      const patch={}; if(o.reasons) patch.reason_codes=o.reasons; if(o.comment!=null) patch.comment=o.comment;
      const r=await c.from('feedback').update(patch).eq('feedback_id',id); if(r.error) throw new Error(r.error.message);
      const i=USER_DATA.feedback.findIndex(x=>x.id===id); if(i>=0){ USER_DATA.feedback[i]={...USER_DATA.feedback[i],...o}; } return USER_DATA.feedback[i]; },
    async delete(id){ const c=_needSb();
      const r=await c.from('feedback').update({deleted_at:new Date().toISOString()}).eq('feedback_id',id); if(r.error) throw new Error(r.error.message);
      USER_DATA.feedback=USER_DATA.feedback.filter(x=>x.id!==id); return true; }
  },
  history:{
    list:(f)=>{ f=f||{}; let r=USER_DATA.history; if(f.type) r=r.filter(x=>x.type===f.type); return r; },
    append(ev){ const c=_sb(); const u=window.__MTP_USER; if(!c||!u) return;
      const row={ user_id:u.id, event_type:ev.type, description:ev.label, metadata:{target:ev.target||'',planId:ev.planId||null,refId:ev.refId||null} };
      c.from('history_events').insert([row]).select().single().then(function(r){
        if(!r.error && r.data) USER_DATA.history.unshift(UserData.mapHistoryRow(r.data));
      }).catch(function(e){ console.warn('history.append',e); }); }
  },
  notifications:{
    list:()=>USER_DATA.notifications,
    unreadCount:()=>USER_DATA.notifications.filter(n=>!n.is_read).length,
    async markAllRead(){ const c=_sb(); const u=window.__MTP_USER; if(!c||!u) return;
      USER_DATA.notifications.forEach(n=>{ n.is_read=true; });
      try{ await c.from('notifications').update({is_read:true,read_at:new Date().toISOString()}).eq('user_id',u.id).eq('is_read',false); }catch(e){} },
    async clear(){ const c=_sb(); const u=window.__MTP_USER; if(!c||!u) return [];
      try{ await c.from('notifications').delete().eq('user_id',u.id); }catch(e){}
      USER_DATA.notifications=[]; return []; },
    /* Fires the notification itself. Internal — call through the three
       trigger points below (plan confirmed, budget exceeded, trip
       readiness), not directly from a page. */
    _create(planId,type,title,message){
      const c=_sb(); const u=window.__MTP_USER; if(!c||!u) return;
      const row={ user_id:u.id, plan_id:planId||null, notification_type:type, title:title, message:message };
      c.from('notifications').insert([row]).select().single().then(function(r){
        if(!r.error && r.data) USER_DATA.notifications.unshift(UserData.mapNotifRow(r.data));
      }).catch(function(e){ console.warn('notifications._create',e); }); },
    /* Trip starting soon but still missing a hotel or a return leg — the
       one genuinely useful reminder, since it can save an actual mistake.
       Called once after login/data load, across every plan at once; a
       plan is only ever notified about a given gap once (checked against
       what's already in the cache, not re-sent on every visit). */
    checkTripReadiness(){
      const today=new Date(); today.setHours(0,0,0,0);
      (USER_DATA.plans||[]).forEach(p=>{
        if(!p.startDate||(p.status!=='draft'&&p.status!=='active')) return;
        const start=new Date(p.startDate); const daysOut=Math.round((start-today)/86400000);
        if(daysOut<0||daysOut>3) return;
        const active=(p.items||[]).filter(i=>i.item_status!=='failed'&&i.item_status!=='disliked');
        const missingHotel=!active.some(i=>i.category==='Hotel');
        const missingReturn=active.some(i=>i.category==='Transport')&&!active.some(i=>i.category==='Transport'&&i.direction==='back');
        if(!missingHotel&&!missingReturn) return;
        const already=USER_DATA.notifications.some(n=>n.notification_type==='trip_readiness'&&n.plan_id===p.id);
        if(already) return;
        const gap=missingHotel?'a hotel':'your return transport';
        API.notifications._create(p.id,'trip_readiness','Trip starting soon',
          '“'+p.name+'” starts in '+(daysOut===0?'today':daysOut+' day'+(daysOut===1?'':'s'))+' and still has no '+gap+' — worth a look before you go.');
      });
    }
  },
  stats(){ const plans=API.plans.list();
    return { destinations:CAT.destinations.length, services:CAT.services.length, packages:CAT.packages.length, activePlans:plans.filter(p=>p.status==='active'||p.status==='draft').length }; }
};
