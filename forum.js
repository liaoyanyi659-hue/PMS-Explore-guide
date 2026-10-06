'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const apiBase = window.PMS_FORUM_CONFIG.api;
  const labels = {campus:'校园见闻',scenery:'校园美景',help:'求助问答',vent:'吐槽交流',lost_found:'失物招领'};
  const state = {token:'',user:null,category:'',q:'',page:1,posts:new Map(),current:null,authMode:'login',editing:null,report:null,previews:[],feedRequest:0,hiddenPage:1};
  try { state.token = sessionStorage.getItem('pms-forum-token') || ''; } catch (_) {}
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = s => {const d=new Date(String(s).replace(' ','T')+'Z');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat(window.PMS_FORUM_I18N.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kuala_Lumpur'}).format(d);};
  const url = (action,params={}) => { const u=new URL(apiBase);u.searchParams.set('action',action);for(const [k,v] of Object.entries(params))if(v!==''&&v!=null)u.searchParams.set(k,String(v));return u.href; };
  let toastTimer;
  function toast(message){$('#toast').textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').textContent='',5000);}
  function connection(message,bad=false){$('#connection').textContent=message;$('#connection').classList.toggle('error',bad);}
  function setToken(token){state.token=token;try{if(token)sessionStorage.setItem('pms-forum-token',token);else sessionStorage.removeItem('pms-forum-token');}catch(_) {}}
  function updateAccount(){
    $('#account-button').toggleAttribute('data-no-translate',!!state.user);$('#account-button').textContent=state.user?state.user.nickname:'登录 / 注册';
    const card=$('#member-card');card.hidden=!state.user;
    if(state.user)card.innerHTML=`<h3><span data-no-translate>${esc(state.user.nickname)}</span></h3><p>已登录 · ${state.user.role==='admin'?'管理员':'社区成员'}</p>${state.user.role==='admin'?'<button data-action="admin">管理社区</button>':''}<button class="quiet" data-action="logout">退出登录</button>`;
  }
  async function api(action,{method='GET',data,params={},publicRequest=false}={}){
    const headers={};if(state.token&&!publicRequest)headers.Authorization='Bearer '+state.token;
    let body;if(data instanceof FormData)body=data;else if(data!==undefined){headers['Content-Type']='application/json';body=JSON.stringify(data);}
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
    try {
      const res=await fetch(url(action,params),{method,headers,body,signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      const raw=await res.text();let result;try{result=JSON.parse(raw);}catch(_){throw new Error('后台没有返回正确资料，请检查 campus-api 文件是否安装完成。');}
      if(!res.ok||!result.ok){if(res.status===401&&action!=='login'){setToken('');state.user=null;updateAccount();}throw new Error(result.error||'操作失败，请重试。');}
      return result;
    } catch(e){if(e.name==='AbortError')throw new Error('连接超时，请稍后重试。');if(e instanceof TypeError)throw new Error('暂时连不到论坛，请检查网络、后台地址或跨域配置。');throw e;}
    finally{clearTimeout(timer);}
  }
  function openDialog(id){const d=$(id);if(!d.open)d.showModal();const error=d.querySelector('.form-error');if(error)error.textContent='';}
  function authTab(mode){state.authMode=mode;$('#nickname-label').hidden=mode!=='register';$('#nickname-label input').required=mode==='register';$('#auth-title').textContent=mode==='register'?'加入校园社区':'欢迎回来';$('#auth-submit').textContent=mode==='register'?'注册并登录':'登录';$('#auth-form [name=password]').autocomplete=mode==='register'?'new-password':'current-password';document.querySelectorAll('[data-action="auth-tab"]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));$('#auth-form .form-error').textContent='';}
  function needUser(){if(state.user)return true;authTab('login');openDialog('#auth-dialog');toast('请先登录，再继续操作。');return false;}
  function photos(p){return p.images?.length?`<div class="photos ${p.images.length===1?'single':''}">${p.images.map(id=>`<a href="${esc(url('image',{id}))}" target="_blank" rel="noopener noreferrer"><img src="${esc(url('image',{id}))}" alt="${esc(p.title)}" data-no-translate loading="lazy" decoding="async"></a>`).join('')}</div>`:'';}
  function card(p,detail=false){
    const own=p.is_owner===true||(state.user&&Number(state.user.id)===Number(p.user_id)), admin=state.user?.role==='admin';
    return `<article class="${detail?'post-full':'post-card'}"><div class="post-meta"><span class="avatar" aria-hidden="true">${p.is_anonymous?'?':esc([...p.nickname][0]||'P')}</span><strong>${p.is_anonymous?'<span>匿名同学</span>':'<span data-no-translate>'+esc(p.nickname)+'</span>'}</strong>${p.is_anonymous&&admin?'<span data-no-translate>'+esc(p.nickname)+'</span>':''}<span class="date"><time data-date="${esc(p.created_at)}">${esc(date(p.created_at))}</time></span><span class="badge">${esc(labels[p.category])}</span>${p.is_pinned?'<span class="badge pinned">置顶</span>':''}${p.status==='hidden'?'<span class="badge">已隐藏</span>':''}</div>${detail?`<h2><span data-no-translate>${esc(p.title)}</span></h2>`:`<button class="post-title" data-action="open" data-id="${p.id}"><span data-no-translate>${esc(p.title)}</span></button>`}<p class="post-text ${detail?'':'preview'}"><span data-no-translate>${esc(p.body)}</span></p>${p.category==='lost_found'?`<p class="lost-meta"><span>${p.lf_kind==='found'?'捡到':'遗失'}</span> · <span data-no-translate>${esc(p.lf_location)}</span> · <span data-no-translate>${esc(p.lf_date)}</span> · <strong>${p.lf_resolved?'已找回 / 已归还':'仍在寻找 / 待认领'}</strong></p>`:''}${p.status==='published'?photos(p):''}<div class="post-actions">${p.status==='published'?`<button data-action="like" data-id="${p.id}" class="${p.liked?'liked':''}" aria-pressed="${!!p.liked}">${p.liked?'♥':'♡'} ${p.like_count}</button><button data-action="open" data-id="${p.id}">评论 ${p.comment_count}</button>`:''}${(own||admin)&&p.category==='lost_found'&&p.status==='published'?`<button data-action="resolve-lost" data-id="${p.id}">${p.lf_resolved?'重新开放':'标记已找回 / 已归还'}</button>`:''}${own&&p.status==='published'?`<button data-action="edit" data-id="${p.id}">编辑</button>`:''}${own||admin?`<button data-action="delete" data-id="${p.id}">删除</button>`:''}${admin?`<button data-action="pin" data-id="${p.id}">${p.is_pinned?'取消置顶':'置顶'}</button><button data-action="hide" data-id="${p.id}">${p.status==='hidden'?'恢复公开':'隐藏'}</button>`:''}${p.status==='published'?`<button class="report" data-action="report" data-id="${p.id}">举报</button>`:''}</div></article>`;
  }
  function renderFeed(){const posts=[...state.posts.values()];$('#feed').innerHTML=posts.length?posts.map(p=>card(p)).join(''):`<div class="empty"><h3>${state.q?'没有找到相关帖子':'这里还很安静。'}</h3><p>${state.q?'试试其他关键词，或清空搜索。':'来分享第一张校园照片，或问一个新生问题吧。'}</p><button class="primary" data-action="compose">＋ 写一篇帖子</button></div>`;}
  async function loadFeed(append=false){
    const request=++state.feedRequest;const page=append?state.page+1:1;
    if(!append){$('#feed').innerHTML='<div class="empty">正在读取分享…</div>';$('#load-more').hidden=true;}
    try{const r=await api('posts',{params:{page,category:state.category,q:state.q}});if(request!==state.feedRequest)return;
      if(!append)state.posts.clear();r.posts.forEach(p=>state.posts.set(Number(p.id),p));state.page=page;renderFeed();$('#load-more').hidden=!r.has_more;connection('校园见闻 · 校园美景 · 求助问答 · 吐槽交流');
    }catch(e){if(request!==state.feedRequest)return;connection(e.message,true);if(!append)$('#feed').innerHTML='<div class="empty"><h3>暂时无法读取帖子</h3><p>如果是第一次安装，请先完成 Hostinger 后台配置。</p><button data-action="refresh">重新连接</button></div>';throw e;}
  }
  function commentHTML(c){const own=state.user&&Number(state.user.id)===Number(c.user_id),admin=state.user?.role==='admin';return `<article class="comment"><div class="post-meta"><strong><span data-no-translate>${esc(c.nickname)}</span></strong><span><time data-date="${esc(c.created_at)}">${esc(date(c.created_at))}</time></span></div><p><span data-no-translate>${esc(c.body)}</span></p><div class="comment-actions">${own||admin?`<button class="quiet" data-action="delete-comment" data-id="${Number(c.id)}">删除</button>`:''}<button class="quiet" data-action="report-comment" data-id="${Number(c.id)}">举报</button></div></article>`;}
  let postRequest=0;
  async function openPost(id,appendComments=false){
    const request=++postRequest;
    if(!appendComments){state.current=null;$('#post-detail').textContent='正在读取…';$('#comments').textContent='';$('#comments-more').hidden=true;openDialog('#post-dialog');}
    const after=appendComments?state.current.lastComment:0;
    const r=await api('post',{params:{id,after}});if(request!==postRequest)return;
    state.current={...r.post,lastComment:after};
    if(state.posts.has(Number(id)))state.posts.set(Number(id),r.post);
    $('#post-detail').innerHTML=card(r.post,true);
    if(appendComments)$('#comments').insertAdjacentHTML('beforeend',r.comments.map(commentHTML).join(''));
    else $('#comments').innerHTML=r.comments.length?r.comments.map(commentHTML).join(''):'<p class="small">还没有评论，来聊两句吧。</p>';
    if(r.comments.length)state.current.lastComment=Number(r.comments.at(-1).id);
    $('#comments-more').hidden=!r.comments_more;$('#comment-form').hidden=r.post.status!=='published';
  }
  function clearPreviews(){state.previews.forEach(URL.revokeObjectURL);state.previews=[];$('#photo-preview').replaceChildren();}
  function compose(edit=null){if(!needUser())return;state.editing=edit;$('#compose-form').reset();$('#compose-form').elements.is_anonymous.checked=!!edit?.is_anonymous;$('#compose-form').elements.is_anonymous.disabled=!!edit;clearPreviews();$('#compose-title').textContent=edit?'编辑帖子':'分享校园日常';$('#publish-button').textContent=edit?'保存修改':'发布';$('#photo-input-wrap').hidden=!!edit;$('#edit-photo-note').hidden=!edit;
    if(edit)for(const key of ['category','title','body'])$('#compose-form').elements[key].value=edit[key];if(edit){for(const key of ['lf_kind','lf_location','lf_date'])$('#compose-form').elements[key].value=edit[key]||'';$('#compose-form').elements.lf_resolved.checked=!!edit.lf_resolved;}syncLost();openDialog('#compose-dialog');}
  function syncLost(){const f=$('#compose-form');const on=f.elements.category.value==='lost_found';$('#lost-fields').hidden=!on;$('#lost-fields').disabled=!on;const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(new Date());f.elements.lf_date.max=today;if(on&&!f.elements.lf_date.value)f.elements.lf_date.value=today;}
  $('#compose-form').elements.category.addEventListener('change',syncLost);
  async function compress(file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('只支持 JPG、PNG、WebP 照片。');
    if(file.size>20*1024*1024)throw new Error('原图过大，请选择小于 20 MB 的照片。');
    const src=URL.createObjectURL(file);const img=new Image();
    try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('照片无法读取，请换成 JPG 或 PNG。'));img.src=src;});
      const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.8));if(!blob)throw new Error('照片压缩失败。');return blob;
    }finally{URL.revokeObjectURL(src);}
  }
  async function submit(form,work){const button=form.querySelector('[type=submit]');if(button.disabled)return;const error=form.querySelector('.form-error');error.textContent='';button.disabled=true;try{await work();}catch(e){error.textContent=e.message;}finally{button.disabled=false;}}
  $('#auth-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{const data=Object.fromEntries(new FormData(e.currentTarget));const r=await api(state.authMode,{method:'POST',data});setToken(r.token);state.user=r.user;updateAccount();$('#auth-dialog').close();$('#auth-form').reset();toast('登录成功，可以开始分享了。');await loadFeed();if(state.current&&$('#post-dialog').open)await openPost(state.current.id);});});
  $('#compose-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{
    const form=e.currentTarget;let id;if(form.elements.category.value==='lost_found'){const h=await api('health');if(!h.campus_services)throw new Error('请先完成校园服务后台升级。');}if(!state.editing&&form.elements.is_anonymous.checked){const health=await api('health');if(health.anonymous_posts!==true)throw new Error('匿名投稿功能尚未在服务器启用，请先完成后端升级。');}
    if(state.editing){const data=Object.fromEntries(new FormData(form));data.id=state.editing.id;await api('edit_post',{method:'POST',data});id=state.editing.id;}
    else{const data=new FormData(form);const files=[...$('#photos').files];if(files.length>3)throw new Error('每篇最多三张照片。');for(const [i,file] of files.entries())data.append('photos[]',await compress(file),'photo-'+i+'.jpg');const r=await api('create_post',{method:'POST',data});id=r.id;}
    $('#compose-dialog').close();clearPreviews();state.editing=null;toast('已保存。');await loadFeed();await openPost(id);
  });});
  $('#photos').addEventListener('change',()=>{clearPreviews();const files=[...$('#photos').files];if(files.length>3){$('#photos').value='';$('#compose-form .form-error').textContent='每篇最多三张照片。';return;}$('#compose-form .form-error').textContent='';for(const f of files){const src=URL.createObjectURL(f);state.previews.push(src);const img=document.createElement('img');img.src=src;img.alt='待上传照片预览';$('#photo-preview').append(img);}});
  $('#comment-form').addEventListener('submit',e=>{e.preventDefault();if(!needUser())return;submit(e.currentTarget,async()=>{if(!state.current)throw new Error('请重新打开帖子。');await api('comment',{method:'POST',data:{post_id:state.current.id,body:$('#comment-text').value}});$('#comment-text').value='';await openPost(state.current.id);renderFeed();});});
  $('#report-form').addEventListener('submit',e=>{e.preventDefault();submit(e.currentTarget,async()=>{await api('report',{method:'POST',data:{...state.report,reason:e.currentTarget.elements.reason.value}});$('#report-dialog').close();toast('举报已提交，等待管理员查看。');});});
  $('#search-form').addEventListener('submit',e=>{e.preventDefault();state.q=$('#search').value.trim();loadFeed().catch(e=>toast(e.message));});
  async function loadAdmin(append=false){
    if(!append){openDialog('#admin-dialog');$('#reports').textContent='正在读取…';state.hiddenPage=1;const r=await api('admin_reports');$('#reports').innerHTML=r.reports.length?r.reports.map(v=>`<article class="admin-item"><h4><span data-no-translate>${esc(v.title)}</span></h4><p>举报原因：<span data-no-translate>${esc(v.reason)}</span></p>${v.comment_id?`<p>被举报评论：<span data-no-translate>${esc(v.comment_body)}</span></p>`:''}<button data-action="open" data-id="${Number(v.post_id)}">查看帖子</button>${v.comment_id?`<button data-action="hide-comment" data-id="${Number(v.comment_id)}">隐藏评论</button>`:`<button data-action="hide-reported" data-id="${Number(v.post_id)}">隐藏帖子</button>`}<button data-action="resolve" data-id="${Number(v.id)}" data-status="resolved">标记已处理</button><button data-action="resolve" data-id="${Number(v.id)}" data-status="dismissed">驳回举报</button></article>`).join(''):'<p class="small">没有待处理举报。</p>';}else state.hiddenPage++;
    const hidden=await api('admin_posts',{params:{page:state.hiddenPage}});const content=hidden.posts.map(p=>`<article class="admin-item"><h4><span data-no-translate>${esc(p.title)}</span></h4><p><span data-no-translate>${esc(p.nickname)}</span> · <time data-date="${esc(p.created_at)}">${esc(date(p.created_at))}</time></p><button data-action="open" data-id="${p.id}">查看内容</button><button data-action="restore" data-id="${p.id}" data-pin="${p.is_pinned}">恢复公开</button></article>`).join('');
    if(append)$('#hidden-posts').insertAdjacentHTML('beforeend',content);else $('#hidden-posts').innerHTML=content||'<p class="small">没有隐藏帖子。</p>';$('#hidden-more').hidden=!hidden.has_more;
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;const id=Number(b.dataset.id);const p=state.current?.id===id?state.current:state.posts.get(id);
    if(a==='close'){b.closest('dialog').close();return;}
    if(a==='auth-tab'){authTab(b.dataset.mode);return;}
    if(a==='compose'){compose();return;}
    if(a==='account'){if(!state.user){authTab('login');openDialog('#auth-dialog');}else{if(state.user.role==='admin'){loadAdmin().catch(e=>toast(e.message));}else{$('#member-card').scrollIntoView({behavior:'smooth',block:'center'});}}return;}
    if(a==='edit'){if(p)compose(p);return;}
    if(a==='report'||a==='report-comment'){if(!needUser())return;state.report={post_id:a==='report'?id:state.current?.id};if(a==='report-comment')state.report.comment_id=id;$('#report-form').reset();openDialog('#report-dialog');return;}
    if(['resolve-lost','like','delete','delete-comment','pin','hide','hide-comment','hide-reported','restore','resolve','admin','hidden-more'].includes(a)&&!needUser())return;
    b.disabled=true;
    try{
      if(a==='category'){state.category=b.dataset.category;document.querySelectorAll('[data-action="category"]').forEach(x=>{const selected=x===b;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected));});await loadFeed();}
      else if(a==='refresh')await loadFeed();
      else if(a==='more')await loadFeed(true);
      else if(a==='open')await openPost(id);
      else if(a==='comments-more'&&state.current)await openPost(state.current.id,true);
      else if(a==='logout'){try{await api('logout',{method:'POST',data:{}});}finally{setToken('');state.user=null;updateAccount();document.querySelectorAll('dialog[open]').forEach(d=>d.close());await loadFeed();toast('已退出登录。');}}
      else if(a==='resolve-lost'&&p){await api('resolve_lost',{method:'POST',data:{id,resolved:!p.lf_resolved}});await loadFeed();if(state.current?.id===id)await openPost(id);}
      else if(a==='like'&&p){await api('like',{method:'POST',data:{post_id:id,liked:!p.liked}});p.like_count+=p.liked?-1:1;p.liked=!p.liked;if(state.posts.has(id))state.posts.set(id,p);renderFeed();if(state.current?.id===id)$('#post-detail').innerHTML=card(p,true);}
      else if(a==='delete'){if(!confirm(window.PMS_FORUM_I18N.t('删除这篇帖子及照片？此操作无法撤销。')))return;await api('delete_post',{method:'POST',data:{id}});$('#post-dialog').close();state.current=null;await loadFeed();toast('帖子已删除。');}
      else if(a==='delete-comment'){if(!confirm(window.PMS_FORUM_I18N.t('删除这条评论？')))return;await api('delete_comment',{method:'POST',data:{id}});await openPost(state.current.id);renderFeed();}
      else if(a==='admin')await loadAdmin();
      else if(a==='hidden-more')await loadAdmin(true);
      else if(a==='pin'||a==='hide'){if(!p)return;const status=a==='hide'?(p.status==='hidden'?'published':'hidden'):p.status;await api('moderate_post',{method:'POST',data:{id,status,is_pinned:a==='pin'?!p.is_pinned:!!p.is_pinned}});await openPost(id);await loadFeed();toast('帖子状态已更新。');}
      else if(a==='hide-reported'||a==='restore'){await api('moderate_post',{method:'POST',data:{id,status:a==='restore'?'published':'hidden',is_pinned:a==='restore'?!!Number(b.dataset.pin):false}});await loadAdmin();await loadFeed();toast('已更新。');}
      else if(a==='hide-comment'){await api('moderate_comment',{method:'POST',data:{id}});toast('评论已隐藏，可将举报标记为已处理。');}
      else if(a==='resolve'){await api('resolve_report',{method:'POST',data:{id,status:b.dataset.status,note:''}});await loadAdmin();}
    }catch(error){toast(error.message);}finally{b.disabled=false;}
  });
  $('#compose-dialog').addEventListener('close',clearPreviews);
  async function start(){
    if(new URL(location.href).searchParams.get('category')==='lost_found'){state.category='lost_found';document.querySelectorAll('[data-action="category"]').forEach(b=>{const selected=b.dataset.category==='lost_found';b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}
    updateAccount();
    try{const health=await api('health',{publicRequest:true});if(!health.images_ready)toast('文字功能可用；照片上传需要开启 GD 扩展。');
      if(state.token){try{const r=await api('me');state.user=r.user;updateAccount();}catch(_){setToken('');state.user=null;updateAccount();}}
      await loadFeed();
    }catch(e){connection(e.message,true);$('#feed').innerHTML='<div class="empty"><h3>论坛正在准备中</h3><p>后台连接成功后，这里会显示同学的分享。</p><button data-action="refresh">重新连接</button></div>';}
  }
  start();
})();
