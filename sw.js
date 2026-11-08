const CACHE="maryam-v62";
const CORE=["./","index.html","en.html","fr.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url), same=u.origin===location.origin;
  if(!same && !u.hostname.startsWith("fonts.g")) return;
  const html=r.mode==="navigate"||u.pathname.endsWith(".html")||u.pathname.endsWith("/");
  e.respondWith(caches.open(CACHE).then(async c=>{
    if(html){
      try{ const res=await fetch(r,{cache:"no-cache"}); if(res&&res.ok) c.put(r,res.clone()); return res; }
      catch(_){ return (await c.match(r,{ignoreSearch:true}))||(await c.match("index.html")); }
    }
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{ if(res&&res.ok) c.put(r,res.clone()); return res; }).catch(()=>hit);
    return hit||net;
  }));
});
