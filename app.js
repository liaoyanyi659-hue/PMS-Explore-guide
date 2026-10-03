const places=[
['行政办公室','校园设施',63.3,26.5,'Pejabat Admin','根据设施参考图的 PEJABAT ADMIN 标注，对照原校园底图定位。具体办公入口请以现场标示为准。'],
['旅游与酒店管理系','教学区域',58,47.8,'JPH','根据设施参考图的 JPH 标注，对照原校园底图定位。具体办公室或课室入口仍需确认。'],
['伊斯兰中心','校园设施',60,52,'Pusat Islam','根据原图 Pusat Islam Politeknik Muadzam Shah 标记定位。'],
['体育综合设施','校园生活',25,73,'Kompleks Sukan','根据原图左下方体育设施图钉定位，附近可见运动场。'],
['发展与维修单位','校园设施',85,3.5,'Unit Pembangunan dan Senggaraan','根据原图顶部文字与图钉标注；该区域靠近图片上边缘。'],
['田径场','校园生活',37,68,'运动场区域','根据原图中可见的椭圆形跑道标注，正式场地名称与入口待确认。'],
['图书馆','教学区域',70.7,40.0,'Mini Library · UIDM 楼上','位于 UIDM 楼上。建筑位置由维护者于 2026年10月2日根据圈选地图确认；请从楼内前往图书馆。'],
['Coop Mart','校园生活',79.6,53.0,'Coop Mart','位于宿舍区内、食堂旁的小型建筑区域。位置根据维护者圈选地图标注。'],
['Cafe Koi','校园生活',64.7,40.0,'Cafe Koi','位于校园中心环形教学区域南侧、UIDM 旁的建筑。位置根据维护者圈选地图标注。'],
['包裹中心','校园设施',91.7,43.6,'Pusat Parcel · Bizz Mall','位于 Bizz Mall。位置根据维护者圈选地图确认；可通过下方报表查询包裹，领取时间待补充。']];
const lifeByName=new Map(lifeEntries.map(e=>[e.name,e]));
lifeEntries.forEach(e=>{if(!places.some(p=>p[0]===e.name))places.push([e.name,'校园生活',null,null,e.ms,e.desc])});
function placeNamed(name){return places.find(p=>p[0]===name)}
placeNamed('食堂')[2]=74.4;placeNamed('食堂')[3]=52.9;
placeNamed('食堂')[5]+=' 位置对照参考图中 CAFE 区域；此处不作为 Cafe Koi 的确认位置。';
places.push(
 ['机械工程系','教学区域',77.4,13.2,'JKM','根据设施参考图中的 JKM 区域标注。'],
 ['JRKV 教学区域','教学区域',84.6,27.8,'JRKV','根据设施参考图中的 JRKV 标注；具体办公室及课室资料待补充。'],
 ['资讯与通讯科技系','教学区域',78.4,38.3,'JTMK','根据设施参考图中的 JTMK 区域标注。'],
 ['学生事务处','校园设施',66.6,30.7,'HEP','根据设施参考图中校园中心的 HEP 标注。与行政办公室分开标示。'],
 ['JP / JPA / JMSK 教学区域','教学区域',57.5,35.5,'JP / JPA / JMSK','参考图将这一区域标为 JP / JPA / JMSK，具体部门入口待补充。'],
 ['学术区食堂','校园生活',75,21.6,'Cafe Akademik','根据参考图中的 CAFE AKADEMIK 标注。营业时间为星期一至五 08:00–17:00。'],
 ['学生宿舍区','校园生活',83.2,47.8,'Kamsis','男生宿舍：Block 1–5。女生宿舍：Block A–E。报到时先确认自己的 Block 和房号，再跟着现场标示找宿舍。地图目前标示宿舍区域，尚未逐栋定位。']
);

placeNamed('Café Siber')[2]=66.6;placeNamed('Café Siber')[3]=30.7;
placeNamed('Café Siber')[4]='Café Siber / Cyber Café · HEP 楼下';
placeNamed('Café Siber')[5]='位于学生事务处（HEP）楼下。可购买文具和日常小食，也可复印文件。';
placeNamed('Bizz Mall')[2]=91.7;placeNamed('Bizz Mall')[3]=43.6;
placeNamed('Bizz Mall')[5]='校园购物区域，Pusat Parcel 包裹中心位于这里，洗衣服务在 Bizz Mall 旁边。';
const laundryParents={'宿舍洗衣服务':'学生宿舍区','Bizz Mall 旁洗衣服务':'Bizz Mall'};
for(const [service,parent] of Object.entries(laundryParents)){const p=placeNamed(service),area=placeNamed(parent);p[2]=area[2];p[3]=area[3]}
const confirmedPositions=new Set(['图书馆','Coop Mart','Cafe Koi','包裹中心','Café Siber','Bizz Mall','宿舍洗衣服务','Bizz Mall 旁洗衣服务']);
const poolEntry={"name": "游泳池", "ms": "Kolam Renang PMS", "desc": "位于旅游与酒店管理系（JPH）旁，地图位置依据你提供的圈选区域标注。", "hours": [["周一至周四 · JPH 教学（PdP）", "09:00–17:00；13:00–14:00 休息"], ["周一 · 女性教职员", "17:00–19:00"], ["周二 · 男性教职员", "17:00–19:00"], ["周三 · 男学生", "17:00–19:00"], ["周四 · 女学生", "17:00–19:00"], ["周五", "关闭：维护与清洁"], ["周六 · PMS 男性教职员及男学生", "09:00–18:00"], ["周日 · PMS 女性教职员及女学生", "09:00–18:00"]], "sections": [["入场与服装条规", "<ul><li>必须佩戴泳帽（swimming cap）。</li><li>学生须出示学生卡（Kad Matrik），并按柜台告示将卡留在柜台。</li><li>学生须自备毛巾。</li><li>禁止穿棉质（cotton）衣物；须遵守泳池张贴的泳装规范。</li><li>禁止携带食物和甜饮，矿泉水除外。</li></ul>"], ["清洁与临时关闭", "<p>时间表注明，开放日 08:00–09:00 为清洁时段。若当周有课程／教学活动（kursus / PdP），周六及周日将关闭。</p>"], ["两张告示的时间差异", "<p>手写告示写明一般开放时间为 09:00–18:00，13:00–14:00 休息；详细时间表另列周一至周四指定人群可使用至 19:00。上方按详细时间表整理，两张告示的生效日期未注明，请到访前向泳池柜台确认当天安排。</p>"]]};
places.push([poolEntry.name,"校园生活",50.4,38.7,poolEntry.ms,"位于旅游与酒店管理系（JPH）旁；根据维护者圈选的泳池区域标注，具体入口以现场为准。"]);
lifeByName.set(poolEntry.name,poolEntry);
confirmedPositions.add(poolEntry.name);
const akademikEntry={"name": "学术区食堂", "ms": "Cafe Akademik", "desc": "星期一至五营业，早上 8 点到下午 5 点。", "hours": [["周一至周五", "08:00–17:00"], ["周六、周日及公共假期", "开放安排待确认"]], "sections": []};
lifeByName.set(akademikEntry.name,akademikEntry);
lifeEntries.push(akademikEntry);
let selected=0,filter='all',zoom=1,searchQuery='';
const locationPhotos={'Coop Mart':['photos/coop-mart.jpeg','Coop Mart 店面'],'Café Siber':['photos/cyber-cafe.jpeg','Cyber Café 店面与小食'],'包裹中心':['photos/pusat-parcel.jpeg','Pusat Parcel 包裹柜台'],'游泳池':['photos/swimming-pool.png','游泳池实景（已移除叠加文字）'],'体育综合设施':['photos/sports-complex.jpeg','Kompleks Sukan 体育综合设施外观'],'田径场':['photos/athletics-track.jpeg','田径场跑道与草地'],'机械工程系':['photos/jkm.png','JKM 活动合照'],'资讯与通讯科技系':['photos/jtmk.png','JTMK 教学楼走廊与中庭'],'伊斯兰中心':['photos/pusat-islam.jpeg','Pusat Islam 伊斯兰中心外观与湖畔'],'Cafe Koi':['photos/cafe-koi.jpeg','Cafe Koi 店面与入口'],'食堂':['photos/cafeteria.jpeg','校园食堂的摊位与用餐区']};
const poolNotices=[['photos/pool-schedule.jpeg','游泳池使用时间表（原告示）'],['photos/pool-rules.jpeg','游泳池条规及一般开放时间（原告示）']];
function poolPhotoMarkup(){return poolNotices.map(([src,caption])=>`<figure class="location-photo"><a href="${src}" target="_blank" rel="noopener noreferrer" aria-label="查看${caption}（新窗口）"><img src="${src}" alt="${caption}" loading="lazy" decoding="async"></a><figcaption>${caption} · 点击查看原图</figcaption></figure>`).join('')}
function photoMarkup(name){const photo=locationPhotos[name];return photo?`<figure class="location-photo"><a href="${photo[0]}" target="_blank" rel="noopener noreferrer" aria-label="查看${name}完整照片（新窗口）"><img src="${photo[0]}" alt="${photo[1]}" loading="lazy" decoding="async"></a><figcaption>${photo[1]} · 点击查看原图${locationHints[name]?`<span class="photo-location-hint">${locationHints[name]}</span>`:''}</figcaption></figure>`:'';}
const operating='https://tbm2.my.canva.site/pmsoperating';
const parcel='https://datastudio.google.com/reporting/deb24628-453a-47b0-ab08-ba9ecd11f483/page/cwv3C';
function selectPlace(i){selected=i;render();const p=places[i];if(p[2]!==null){const viewport=document.getElementById('mapviewport'),canvas=document.getElementById('canvas');viewport.scrollTo({left:canvas.clientWidth*p[2]/100-viewport.clientWidth/2,top:canvas.clientHeight*p[3]/100-viewport.clientHeight/2,behavior:'smooth'});}}
function render(){
 const visible=places.map((p,i)=>({p,i})).filter(({p})=>(filter==='all'||p[1]===filter)&&matchesPlace(p,searchQuery));
 document.getElementById('search-count').textContent=`找到 ${visible.length} 个地点`;
 renderMapPins(visible);
 document.getElementById('directory').innerHTML=visible.map(({p,i})=>`<button data-id="${i}" aria-pressed="${selected===i}"><span class="place-index">${String(i+1).padStart(2,'0')}</span><span class="place-title">${p[0]}<small>${p[4]}</small></span></button>`).join('');

 if(!visible.length){document.getElementById('directory').innerHTML='<p class="empty-state">没有找到地点。试试“打印”“洗衣”或 JTMK，或清除筛选。</p>';document.getElementById('detail').innerHTML='<h2>没有匹配的地点</h2><p>请修改关键词或清除筛选。</p>';return;}
 if(!visible.some(x=>x.i===selected)){selected=visible[0].i;return render();}
 const p=places[selected],sports=selected===3||selected===5,isShop=selected>=6&&selected<=8,isParcel=selected===9;
 const nearby=places.map((v,i)=>({v,i})).filter(({v,i})=>i!==selected&&p[2]!==null&&v[2]===p[2]&&v[3]===p[3]);
 const entry=lifeByName.get(p[0])||null;
 let hours=sports?'每日 08:00–19:00':isShop?'请查看原营业时间页面，具体时段尚未录入。':'待补充 / 待校方确认';
 let rules=sports?'<ul><li>提供羽毛球、排球、乒乓球、跑道、篮球及射箭设施。</li><li>柜台可购买饮用水，并提供运动器材租借服务。</li><li>提供的指南注明阴天禁止户外运动；具体安排以现场指示为准。</li><li>傍晚 18:00–19:00 可欣赏夕阳，视天气而定。</li></ul>':'<p>请以现场告示及校方通知为准；详细条例待补充。</p>';
 document.getElementById('detail').innerHTML=`<div class="detail-top"><span class="tag">${p[1]}</span><button class="back-map" onclick="document.getElementById('mapviewport').scrollIntoView({behavior:'smooth',block:'center'})">返回地图</button></div><h2>${p[0]}</h2><p lang="ms">${p[4]}</p>${photoMarkup(p[0])}<p>${p[5]}</p>${placeExtras(p)}${nearby.length?`<div class="colocated"><h3>区域与相关服务</h3>${nearby.map(({v,i})=>`<button data-id="${i}">查看${v[0]}</button>`).join('')}</div>`:''}<div class="detail"><h3>◷ 开放时间</h3>${entry?hoursMarkup(entry):`<p>${hours}</p>`}${p[0]==='游泳池'?'<p class="detail-source">来源：维护者提供的泳池现场告示照片 · 2026年10月2日整理。</p>':p[0]==='学术区食堂'?'<p class="detail-source">营业时间由同学于 2026年10月3日提供。</p>':(sports||entry)?'<p class="detail-source">来源：维护者提供的生活指南 · 2026年10月2日录入，尚未向校方核实。</p>':''}${isShop?`<a class="external" href="${operating}" target="_blank" rel="noopener noreferrer">查看营业时间（Canva）</a>`:''}${isParcel?`<a class="external" href="${parcel}" target="_blank" rel="noopener noreferrer">打开包裹查询报表</a>`:''}</div><div class="detail">${entry?sectionsMarkup(entry):`<h3>${sports?'设施与注意事项':'使用条例'}</h3>${rules}`}</div>${p[0]==='游泳池'?poolPhotoMarkup():''}<div class="note">${p[2]===null?'地图位置待确认，暂未放置标记。':laundryParents[p[0]]?(p[0]==='宿舍洗衣服务'?'洗衣服务设在宿舍内，地图使用宿舍区标记。':'洗衣服务设在 Bizz Mall 旁边，地图使用 Bizz Mall 区域标记，不代表洗衣机的精确位置。'):confirmedPositions.has(p[0])?'位置由维护者于 2026年10月2日确认；图钉表示建筑区域，楼层请见地点说明。':'地图沿用原底图，设施位置对照补充参考图作约略标注，不代表具体入口。'} 时间与规定可能调整，请以校方及现场通知为准。</div>${reportButton(p[0])}`; document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{selectPlace(Number(b.dataset.id));if(b.closest('#directory')||window.matchMedia('(max-width: 850px)').matches)document.getElementById('detail').scrollIntoView({behavior:'smooth',block:'start'})});
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});if(filter!=='all'&&places[selected][1]!==filter)selected=places.findIndex(p=>p[1]===filter);render()});document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-page]').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===b.dataset.page));document.querySelectorAll('[data-page]').forEach(x=>x.setAttribute('aria-current',x===b?'page':'false'));window.scrollTo({top:0,behavior:'smooth'})});function setZoom(n){zoom=Math.min(2.5,Math.max(1,n));document.getElementById('canvas').style.width=`${zoom*100}%`;document.getElementById('minus').disabled=zoom===1;document.getElementById('plus').disabled=zoom===2.5;render()}document.getElementById('plus').onclick=()=>setZoom(zoom+.25);document.getElementById('minus').onclick=()=>setZoom(zoom-.25);document.getElementById('reset').onclick=()=>{setZoom(1);document.getElementById('mapviewport').scrollTo(0,0)};render();setZoom(1);

document.getElementById('daily-services').innerHTML=lifeEntries.map(e=>`<article class="article"><span class="tag">餐饮 · 购物 · 洗衣</span><h2>${e.name}</h2>${photoMarkup(e.name)}<p>${e.ms}</p><p>${e.desc}</p>${todayMarkup(e.name)}${hoursMarkup(e)}${sectionsMarkup(e)}</article>`).join('');

document.getElementById("pool-guide").innerHTML=`<span class="tag">运动与休闲</span><h2>游泳池 · Kolam Renang PMS</h2>${photoMarkup(poolEntry.name)}<p>位于 JPH 旁，按日期及使用人群分时开放。</p>${todayMarkup(poolEntry.name)}${hoursMarkup(poolEntry)}${sectionsMarkup(poolEntry)}<p class="detail-source">来源：泳池现场告示照片 · 2026年10月2日整理。</p>${poolPhotoMarkup()}`;
