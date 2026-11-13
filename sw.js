const V='arbeitszeit-v2';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png','apple-touch-icon.png','apple-touch-icon-152.png','apple-touch-icon-167.png'];
const XLSX_URL='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await c.addAll(CORE);
    try{await c.add(XLSX_URL)}catch(_){}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    await self.clients.claim();
  })());
});

/* Zuerst aus dem Speicher (offline-fähig), im Hintergrund aktualisieren */
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>null);
    if(hit)return hit;
    const res=await net;
    if(res)return res;
    return r.mode==='navigate'?(await c.match('index.html')||Response.error()):Response.error();
  })());
});
