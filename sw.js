// Service Worker — منصة إدارة حلقة التحفيظ (نسخة Firebase)
// نستخدم استراتيجية "الشبكة أولًا" لملفات التطبيق حتى لا يُخدَّم كود قديم للمصادقة/القاعدة،
// مع نسخة احتياطية من الذاكرة المؤقتة عند انقطاع الاتصال.
const CACHE = "halaqa-cache-v2";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./firebase-init.js", "./auth.js", "./store.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e)=>{
  const url = e.request.url;
  // لا نتدخّل في طلبات Firebase (مصادقة/قاعدة بيانات) — تُترك للشبكة مباشرة
  if(url.includes("googleapis.com") || url.includes("firebaseio.com") || url.includes("gstatic.com")) return;

  e.respondWith(
    fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy));
      return res;
    }).catch(()=> caches.match(e.request).then(cached=> cached || caches.match("./index.html")))
  );
});
