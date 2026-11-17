/* Cloud mirror for what's still browser-only: prefs, notifications,
   tracking (external_actions), settings, and the "active plan" pointer.
   Plans/items/saved/feedback/history moved to real Supabase tables
   (see js/cloud-user.js + js/api.js) — mirroring them here too would
   just create two disagreeing copies of the same data, so they're
   deliberately left out of this shelf now. */
(function(){
function uid(){ var u=window.__MTP_USER; return (u&&u.id)?String(u.id):null; }
function sb(){ return window.__MTP_SB||null; }
function readShelf(){ var u=uid(); if(!u) return null;
  var all=MTPStorage.get('mbt_preferences',{}), alln=MTPStorage.get('mbt_notifications',{});
  return { tracking:MTPStorage.get(MTPStorage.forUser('tracking',u),[]), settings:MTPStorage.get(MTPStorage.forUser('settings',u),{}),
    appnotif:MTPStorage.get(MTPStorage.forUser('appnotif',u),[]),
    prefs:all[u]||null, notif:alln[u]||null }; }
function writeShelf(sh){ var u=uid(); if(!u||!sh) return;
  var set=function(k,v){ MTPStorage.set(MTPStorage.forUser(k,u),v); };
  set('tracking',sh.tracking||[]); set('settings',sh.settings||{}); set('appnotif',sh.appnotif||[]);
  var all=MTPStorage.get('mbt_preferences',{}); if(sh.prefs){all[u]=sh.prefs;} MTPStorage.set('mbt_preferences',all);
  var alln=MTPStorage.get('mbt_notifications',{}); if(sh.notif){alln[u]=sh.notif;} MTPStorage.set('mbt_notifications',alln); }
var t=null; function schedule(){ if(!uid()||!sb())return; clearTimeout(t); t=setTimeout(push,900); }
async function push(){ var u=uid(),c=sb(); if(!u||!c)return; try{
  await c.from('private_shelf').upsert([{user_id:u, shelf:readShelf(), updated_at:new Date().toISOString()}],{onConflict:'user_id'});
  MTPStorage.setText('mbt_sync_ts::'+u,new Date().toISOString()); }catch(e){ console.warn('push',e); } }
async function pull(){ var u=uid(),c=sb(); if(!u||!c)return; try{
  var r=await c.from('private_shelf').select('*').eq('user_id',u).maybeSingle();
  var ts=MTPStorage.getText('mbt_sync_ts::'+u,'');
  if(r.data&&r.data.shelf&&(!ts||(r.data.updated_at||'')>ts)){ writeShelf(r.data.shelf); MTPStorage.setText('mbt_sync_ts::'+u,r.data.updated_at||new Date().toISOString()); }
  else { await push(); } }catch(e){ console.warn('pull',e); } }
window.__MTP_SYNC={schedule:schedule,pull:pull,push:push};
})();
