// Small, progressive enhancements for the student guide.
(()=>{
const dateFor=name=>['图书馆','Cafe Koi','包裹中心','Bizz Mall 旁洗衣服务','学术区食堂','食堂','Café Siber'].includes(name)?'2026-10-04':['学术区食堂','学生宿舍区'].includes(name)?'2026-10-03':'2026-10-02';
const overview=document.createElement('section');overview.className='guide-block';overview.id='open-now';
document.querySelector('#life .outing-entry').after(overview);
function refreshHours(){
 const names=['Coop Mart','学术区食堂','食堂','Café Siber','体育综合设施','游泳池','图书馆','Cafe Koi','包裹中心'];
 overview.innerHTML='<h2>现在有开吗？</h2><p class="hours-sort-note">依次显示：开放时段、非开放时段、时间待确认。</p><p>按马来西亚时间与已提供的常规时间表推算，非现场实时状态。假期及临时调整请向店家或工作人员确认。</p><div class="opening-grid">'+names.map(name=>({name,t:todaySchedule(name)})).sort((a,b)=>({open:0,closed:1,unknown:2}[a.t.state]-{open:0,closed:1,unknown:2}[b.t.state])).map(({name,t})=>{return `<article class="opening-card ${t.state}"><h3>${name}</h3><strong>${t.state==='unknown'?'今日营业安排待确认':t.status}</strong><p>${t.slots.map(s=>s.a+'–'+s.b+(s.label?' · '+s.label:'')).join('<br>')||(t.state==='closed'?'今日无开放时段':'今天的时段待确认')}</p>${t.state==='unknown'&&lifeByName.get(name)?.hours?.some(h=>/\d{2}:\d{2}/.test(h[1]))?'<div class="known-hours"><h4>已知营业时间</h4>'+lifeByName.get(name).hours.map(h=>'<p>'+h[0]+'<br>'+h[1]+'</p>').join('')+'</div>':''}${name==='游泳池'?'<p>'+t.note+'</p>':''}<small>资料更新：${dateFor(name)}</small></article>`;
 }).join('')+'</div><p class="detail-source">马来西亚时间 · '+new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kuala_Lumpur',dateStyle:'medium',timeStyle:'short'}).format(new Date())+'</p>';
}
refreshHours();setInterval(refreshHours,60000);
// Add source dates where people read the details, rather than only in the footer.
function stamp(root,date){if(root&&!root.querySelector(':scope > .updated-meta')){const el=document.createElement('p');el.className='updated-meta';el.textContent='资料更新：'+date;root.append(el)}}
document.querySelectorAll('#guide .guide-block,#outing-guide .outing-area,#outing-guide .outing-feature').forEach(el=>stamp(el,'2026-10-03'));
document.querySelectorAll('#life > .lifegrid > .article').forEach(el=>stamp(el,el.textContent.includes('Cafe Akademik')?'2026-10-03':'2026-10-02'));
const toast=document.createElement('div');toast.className='copy-toast';toast.setAttribute('role','status');document.body.append(toast);let toastTimer;
function copyButtons(){document.querySelectorAll('a[href^="tel:"],.outing-place a[href*="google.com/maps"],#outing-chinese-food a[href*="google.com/maps"]').forEach(a=>{
 if(a.dataset.copyReady)return;a.dataset.copyReady='true';const phone=a.href.startsWith('tel:');const value=phone?a.getAttribute('href').slice(4):a.closest('#outing-chinese-food')?'33G9+8J, 26700 Muadzam Shah, Pahang':new URL(a.href).searchParams.get('query');if(!value)return;
 const b=document.createElement('button');b.type='button';b.className='soft-button copy-button';b.dataset.copyText=value;b.textContent=phone?'复制号码':'复制定位';a.after(b);
});}
copyButtons();new MutationObserver(copyButtons).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy-text]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copyText);toast.textContent=tr('已复制');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.textContent='',2500)}catch{window.prompt(tr('请长按或选取以下资料复制'),b.dataset.copyText)}});
const links=Array.from(document.querySelectorAll('.scenery-gallery a'));if(!links.length)return;
const dialog=document.createElement('dialog');dialog.className='gallery-viewer';dialog.setAttribute('aria-label','校园实景相册');dialog.innerHTML='<button type="button" class="gallery-close" aria-label="关闭相册">×</button><img alt=""><p class="gallery-caption"></p><div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="上一张">←</button><span class="gallery-count" data-no-translate></span><button type="button" data-gallery-step="1" aria-label="下一张">→</button></div>';document.body.append(dialog);
let position=0,previousOverflow='',touchX=null;
function show(index){position=(index+links.length)%links.length;const source=links[position].querySelector('img'),img=dialog.querySelector('img');img.src=links[position].href;img.alt=source.alt;dialog.querySelector('.gallery-caption').textContent=source.alt;dialog.querySelector('.gallery-count').textContent=(position+1)+' / '+links.length;}
links.forEach((a,i)=>{a.setAttribute('aria-label','放大查看校园照片');a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();show(i);previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal()})});
dialog.querySelector('.gallery-close').onclick=()=>dialog.close();dialog.querySelectorAll('[data-gallery-step]').forEach(b=>b.onclick=()=>show(position+Number(b.dataset.galleryStep)));
dialog.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();show(position+(e.key==='ArrowLeft'?-1:1))}});
dialog.addEventListener('touchstart',e=>{touchX=e.touches.length===1?e.touches[0].clientX:null},{passive:true});dialog.addEventListener('touchend',e=>{if(touchX!==null&&Math.abs(e.changedTouches[0].clientX-touchX)>60)show(position+(e.changedTouches[0].clientX<touchX?1:-1));touchX=null},{passive:true});
dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;links[position].focus()});
})();
