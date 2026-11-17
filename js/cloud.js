/* ============================================================
   CLOUD CATALOG LOADER  —  reads the v3 catalog from Supabase
   and reshapes it into the EXACT shape the screens expect, so
   no page changes. Pure data; no UI, no templates.
   ------------------------------------------------------------
   PASTE YOUR VALUES INTO THE TWO LINES BELOW (step 5):
     - SUPABASE_URL            = your Project URL
     - SUPABASE_PUBLISHABLE_KEY = the "Publishable" key (sb_publishable_...)
   NEVER put the secret key here (browsers block it now anyway).
   ============================================================ */
var SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL';
var SUPABASE_PUBLISHABLE_KEY = 'PASTE_YOUR_PUBLISHABLE_KEY';

function supabaseConfigured(){
  return !!(SUPABASE_URL && SUPABASE_URL.indexOf('PASTE_') < 0 &&
            SUPABASE_PUBLISHABLE_KEY && SUPABASE_PUBLISHABLE_KEY.indexOf('PASTE_') < 0);
}

/* presentation metadata the v3 schema doesn't store (tiny fixed sets) */
var DEST_BESTFOR = { 'ngwe-saung':'Relaxation, Family', 'chaung-tha':'Family, Friends', 'ngapali':'Relaxation, Luxury' };
var SLUG_TO_UI_CAT = { accommodation:'Hotel', transportation:'Transport', restaurant:'Restaurant', activity:'Activity', guide:'Guide', shopping:'Shopping' };

/* one network call per table, all in parallel; fails fast on any error */
async function loadCloudCatalog(sb){
  var R = await Promise.all([
    sb.from('service_categories').select('*'),
    sb.from('destinations').select('*'),
    sb.from('providers').select('*'),
    sb.from('amenities').select('*'),
    sb.from('service_amenities').select('*'),
    sb.from('service_variants').select('*'),
    sb.from('restaurant_details').select('*'),
    sb.from('services').select('*'),
    sb.from('packages').select('*'),
    sb.from('package_inclusions').select('*'),
    sb.from('package_days').select('*')
  ]);
  for (var i=0;i<R.length;i++){ if (R[i] && R[i].error) throw new Error(R[i].error.message); }
  var catR=R[0], destR=R[1], provR=R[2], amenR=R[3], saR=R[4], varR=R[5], rdR=R[6], svcR=R[7], pkgR=R[8], incR=R[9], dayR=R[10];

  /* uuid -> useful value lookups */
  var catUuid2slug={};  (catR.data||[]).forEach(function(r){ catUuid2slug[r.category_id]=r.slug; });
  var destUuid2={};     (destR.data||[]).forEach(function(r){ destUuid2[r.destination_id]={slug:r.slug,name:r.name}; });
  var provUuid2slug={}; (provR.data||[]).forEach(function(r){ provUuid2slug[r.provider_id]=r.slug; });
  var amenUuid2name={}; (amenR.data||[]).forEach(function(r){ amenUuid2name[r.amenity_id]=r.name; });
  var svcAmen={};  (saR.data||[]).forEach(function(r){ (svcAmen[r.service_id]=svcAmen[r.service_id]||[]).push(amenUuid2name[r.amenity_id]); });
  var svcVar={};   (varR.data||[]).forEach(function(r){ (svcVar[r.service_id]=svcVar[r.service_id]||[]).push(r); });
  var svcRest={};  (rdR.data||[]).forEach(function(r){ svcRest[r.service_id]=r; });
  var incByPkg={}; (incR.data||[]).forEach(function(r){ (incByPkg[r.package_id]=incByPkg[r.package_id]||[]).push(r); });
  var dayByPkg={}; (dayR.data||[]).forEach(function(r){ (dayByPkg[r.package_id]=dayByPkg[r.package_id]||[]).push(r); });
  var num=function(v){ return v==null?null:Number(v); };

  /* a destination's stored name sometimes carries its region as a prefix
   ("Ayeyarwady Region ,Ngwe Saung"). Strip it once, here, so EVERY
   screen — Explore, Builder, dropdowns, plan cards — shows the clean name. */
function cleanDestName(r){
  var n = (r && r.name) || '';
  var reg = (r && r.region) || '';
  if (reg){
    var v = [reg + ' ,', reg + ',', reg + ' - ', reg + ' -', reg + '  ', reg + ' '];
    for (var i = 0; i < v.length; i++){ if (n.indexOf(v[i]) === 0){ n = n.slice(v[i].length); break; } }
  }
  n = n.replace(/^[\s,]+/, '').trim();
  return n || ((r && r.name) || '');
}
var destinations = (destR.data||[]).map(function(r){
  return { id:r.slug, destination_uuid:r.destination_id, name:cleanDestName(r), region:r.region, bestFor:DEST_BESTFOR[r.slug]||'Beach travel',
    description:r.description||'', lat:num(r.map_center_lat), lng:num(r.map_center_lng), image:r.cover_image_url||'' };
});
  /* providers */
  var providers = (provR.data||[]).map(function(r){ return { id:r.slug, name:r.provider_name, type:r.provider_type }; });
  /* services (+ rooms, amenities, menu) */
  var services = (svcR.data||[]).map(function(row){
    var uiCat = SLUG_TO_UI_CAT[catUuid2slug[row.category_id]] || catUuid2slug[row.category_id] || 'Activity';
    var dest  = destUuid2[row.destination_id] || {};
    var facs  = (svcAmen[row.service_id]||[]).filter(Boolean);
    var vars  = (svcVar[row.service_id]||[]).slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); })
                .map(function(v){ return {
                  id:v.variant_id || v.id || v.variantId || '',
                  variant_id:v.variant_id || v.id || v.variantId || '',
                  service_id:row.service_id || row.slug || '',
                  name:v.variant_name || v.name || '',
                  price:Number(v.price)||0,
                  beds:v.description||'',
                  capacity:v.capacity!=null?Number(v.capacity):null,
                  variant_type:v.variant_type || 'room',
                  startTime:v.start_time||v.departure_time||v.departure||'',
                  endTime:v.end_time||v.arrival_time||v.arrival||'',
                  operator:v.operator_name || v.operator || v.company || v.provider_name || '',
                  vehicleType:v.vehicle_type || v.vehicle_name || v.vehicle || v.variant_type || '',
                  duration:v.duration || v.duration_hours || v.duration_minutes || '',
                  departureTime:v.start_time||v.departure_time||v.departure||'',
                  arrivalTime:v.end_time||v.arrival_time||v.arrival||''
                }; });
    var rest  = svcRest[row.service_id];
    var out = {
      id:row.slug, service_uuid:row.service_id, name:row.service_name, category:uiCat, destination:dest.slug||'', provider:provUuid2slug[row.provider_id]||'',
      description:row.long_description||row.short_description||'', price:Number(row.price_from)||0, priceUnit:row.price_unit||'',
      officialUrl:row.official_url||'', location:row.location_text||'', lat:num(row.latitude), lng:num(row.longitude),
      rating:num(row.rating_avg)||0, reviews:row.review_count||0, image:row.cover_image_url||'',
      pricing_type:row.pricing_type||'', tags:facs.slice(), facilities:facs.slice()
    };
    if (vars.length) {
      out.roomTypes = vars;
      if (uiCat === 'Transport') out.officialSchedules = vars;
    }
    if (rest){ out.cuisine=rest.cuisine||undefined; out.priceNote=rest.price_note||undefined; if (rest.menu) out.menu=rest.menu; }
    return out;
  });
  /* packages (+ inclusions, day plan, synthesized trip details) */
  var packages = (pkgR.data||[]).map(function(row){
    var dest = destUuid2[row.destination_id] || {};
    var incs = (incByPkg[row.package_id]||[]).slice().sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); }).map(function(x){ return x.label; });
    var days = (dayByPkg[row.package_id]||[]).slice().sort(function(a,b){ return (a.day_no||0)-(b.day_no||0); }).map(function(d){ return { day:d.day_no, title:d.title, desc:d.description||'' }; });
    var bestFor = row.badge_label || 'Travelers';
    return {
      id:row.slug, package_uuid:row.package_id, name:row.package_name, provider:provUuid2slug[row.provider_id]||'', destination:dest.slug||'',
      badge:row.badge_label||'', description:row.long_description||row.short_description||'', price:Number(row.price_from)||0, priceUnit:row.price_unit||'',
      duration:(row.duration_days||1)+' Days', nights:row.duration_nights||0, rating:num(row.rating_avg)||0, reviews:row.review_count||0, image:row.cover_image_url||'',
      tags:row.badge_label?[row.badge_label]:[], includedServices:incs, itinerary:days, officialUrl:row.official_url||'',
      tripDetails:{ duration:(row.duration_days||1)+' Days '+(row.duration_nights||0)+' Nights', destination:dest.name||'', startFrom:'Yangon', bestFor:bestFor }
    };
  });


/* photo fallback: a service/package with no cover borrows its beach photo,
   so a tile is never a flat gradient — one fix, every screen. */
var _destImg={}; destinations.forEach(function(d){ _destImg[d.id]=d.image||''; });
services.forEach(function(s){ if(!s.image && s.destination) s.image=_destImg[s.destination]||''; });
packages.forEach(function(p){ if(!p.image && p.destination) p.image=_destImg[p.destination]||''; });
return { destinations:destinations, providers:providers, services:services, packages:packages };}