'use strict';
// No cached API responses, auth tokens, or stale announcements.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let data={};try{data=event.data?event.data.json():{};}catch{}
 const target=new URL(data.url||'./campus.html',self.registration.scope);
 const root=new URL(self.registration.scope);
 const safe=target.origin===root.origin&&target.pathname.startsWith(root.pathname)?target.href:new URL('campus.html',root).href;
 event.waitUntil(self.registration.showNotification(String(data.title||'PMS Explore').slice(0,120),{body:String(data.body||'Ada info baharu di PMS Explore.').slice(0,250),icon:new URL('icons/pms-192.png',root).href,badge:new URL('icons/pms-192.png',root).href,tag:String(data.tag||'pms-update'),data:{url:safe}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=event.notification.data.url;const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){if(client.url===url){await client.focus();return;}}await self.clients.openWindow(url);})());});
