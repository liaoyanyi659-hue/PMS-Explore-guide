/* Additive navigation: existing page controllers and backend remain unchanged. */
(() => {
  'use strict';
  if (document.getElementById('pms-navigation-menu')) return;
  const header = document.querySelector('body > header');
  if (!header || !window.HTMLDialogElement) return;
  const labels = {
    en:['Menu','Close menu','Campus services','Forum','Facility complaint ↗','Lost & Found','Info & Events','Explore PMS','Campus map','New students','Campus life','Discover PMS','Account','Community account','Language','Admin dashboard'],
    ms:['Menu','Tutup menu','Perkhidmatan kampus','Forum','Aduan Fasiliti ↗','Lost & Found','Info & Acara','Terokai PMS','Peta kampus','Pelajar baharu','Kehidupan kampus','Kenali PMS','Akaun','Akaun komuniti','Bahasa','Panel pentadbir'],
    zh:['菜单','关闭菜单','校园服务','论坛','设施报修 ↗','失物招领','资讯与活动','探索 PMS','校园地图','新生指南','校园生活','认识 PMS','账号','社区账号','语言','管理后台']
  };
  const existingLanguage = document.querySelector('#language-select, #forum-language, #campus-language');
  let lang='en';
  try { lang=localStorage.getItem('pms-language') || existingLanguage?.value || 'en'; } catch (_) { lang=existingLanguage?.value || 'en'; }
  if (!labels[lang]) lang='en';
  const text=(n)=>`<span data-nav-label="${n}">${labels[lang][n]}</span>`;
  const actions=document.createElement('div');
  actions.className='pms-navigation-actions'; actions.setAttribute('data-no-translate','');
  actions.innerHTML=`<a class="pms-forum-direct" href="community.html">${text(3)}</a><button type="button" class="pms-menu-trigger" aria-controls="pms-navigation-menu" aria-expanded="false" aria-label="${labels[lang][0]}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>`;
  header.classList.add('pms-navigation-header');
  if (document.getElementById('language-select')) header.classList.add('pms-guide-header');
  header.append(actions);
  const dialog=document.createElement('dialog');
  dialog.id='pms-navigation-menu'; dialog.setAttribute('aria-labelledby','pms-menu-title'); dialog.setAttribute('data-no-translate','');
  dialog.innerHTML=`<div class="pms-menu-heading"><div><small>PMS EXPLORE</small><h2 id="pms-menu-title">${text(0)}</h2></div><button class="pms-menu-close" type="button" aria-label="${labels[lang][1]}" autofocus>×</button></div><nav class="pms-menu-links" aria-label="${labels[lang][0]}"><h3>${text(2)}</h3><a href="community.html">${text(3)}</a><a href="http://app.pms.edu.my/ecomplaint/" target="_blank" rel="noopener noreferrer">${text(4)}</a><a href="community.html?category=lost_found">${text(5)}</a><a href="campus.html">${text(6)}</a><h3>${text(7)}</h3>${['explore','guide','life','about'].map((page,i)=>`<a href="index.html#${page}" data-menu-page="${page}">${text(8+i)}</a>`).join('')}<h3>${text(12)}</h3><a href="community.html#member-card">${text(13)}</a><a href="admin.html" id="pms-menu-admin" hidden>${text(15)}</a></nav><label class="pms-menu-language">${text(14)}<select id="pms-menu-language"><option value="en">English</option><option value="ms">Bahasa Melayu</option><option value="zh">中文</option></select></label>`;
  document.body.append(dialog);
  const trigger=actions.querySelector('button'), selector=dialog.querySelector('select');
  selector.value=lang;
  let savedScroll=0, oldStyles=null;
  function close(){if(dialog.open)dialog.close();}
  trigger.addEventListener('click',()=>{
    savedScroll=window.scrollY;
    oldStyles={position:document.body.style.position,top:document.body.style.top,width:document.body.style.width};
    dialog.showModal();
    document.body.style.position='fixed'; document.body.style.top=`-${savedScroll}px`; document.body.style.width='100%';
    document.documentElement.classList.add('pms-menu-open'); trigger.setAttribute('aria-expanded','true');
  });
  dialog.querySelector('.pms-menu-close').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.addEventListener('close',()=>{
    document.documentElement.classList.remove('pms-menu-open'); trigger.setAttribute('aria-expanded','false');
    if(oldStyles){Object.assign(document.body.style,oldStyles);oldStyles=null;window.scrollTo(0,savedScroll);}
  });
  const pages=['explore','guide','life','about'];
  function showPage(page){const b=header.querySelector(`nav button[data-page="${page}"]`);if(b){b.click();return true;}return false;}
  dialog.addEventListener('click',e=>{
    const link=e.target.closest('a'); if(!link)return;
    close();
    if(link.dataset.menuPage && header.querySelector('nav button[data-page]')){
      e.preventDefault();history.pushState(null,'','#'+link.dataset.menuPage);showPage(link.dataset.menuPage);
    }
  });
  function fromHash(){const page=location.hash.slice(1);if(pages.includes(page))showPage(page);}
  window.addEventListener('hashchange',fromHash);window.addEventListener('popstate',fromHash);fromHash();
  function applyLanguage(value){
    if(!labels[value])return;lang=value;
    [dialog,actions].forEach(root=>root.querySelectorAll('[data-nav-label]').forEach(el=>{el.textContent=labels[lang][Number(el.dataset.navLabel)];}));
    trigger.setAttribute('aria-label',labels[lang][0]);dialog.querySelector('nav').setAttribute('aria-label',labels[lang][0]);dialog.querySelector('.pms-menu-close').setAttribute('aria-label',labels[lang][1]);selector.value=lang;
  }
  selector.addEventListener('change',()=>{applyLanguage(selector.value);if(existingLanguage){existingLanguage.value=lang;existingLanguage.dispatchEvent(new Event('change',{bubbles:true}));}else{try{localStorage.setItem('pms-language',lang);}catch(_){}}});
  existingLanguage?.addEventListener('change',()=>applyLanguage(existingLanguage.value));
  window.addEventListener('storage',e=>{if(e.key==='pms-language')applyLanguage(e.newValue);});
  let token='';try{token=sessionStorage.getItem('pms-forum-token')||'';}catch(_){}
  // This link is only a convenience. The existing server still authorizes every admin action.
  if(token && window.PMS_FORUM_CONFIG?.api){
    const url=new URL(window.PMS_FORUM_CONFIG.api);url.searchParams.set('action','me');
    const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),8000);
    fetch(url,{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',signal:controller.signal})
      .then(r=>r.ok?r.json():null).then(r=>{if(r?.ok && r.user?.role==='admin')dialog.querySelector('#pms-menu-admin').hidden=false;}).catch(()=>{}).finally(()=>clearTimeout(timer));
  }
})();
