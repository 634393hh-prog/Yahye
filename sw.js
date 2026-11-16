const V='whoissmarter-v6';
const CORE=['./','index.html','style.css','app.js','questions.json','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(V).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==V).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const isNavigation=request.mode==='navigate';
 const isCore=['/index.html','/app.js','/style.css','/questions.json','/manifest.webmanifest'].some(path=>url.pathname.endsWith(path))||url.pathname.endsWith('/');
 if(!isNavigation&&!isCore)return;
 event.respondWith((async()=>{
   const cache=await caches.open(V);
   try{
     const fresh=await fetch(request,{cache:'no-store'});
     if(fresh&&fresh.ok)await cache.put(isNavigation?'./':request,fresh.clone());
     return fresh;
   }catch(error){
     const cached=await cache.match(isNavigation?'./':request);
     if(cached)return cached;
     if(isNavigation)return (await cache.match('index.html'))||Response.error();
     throw error;
   }
 })());
});
