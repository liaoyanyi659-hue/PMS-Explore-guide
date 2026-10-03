// Keep every place visible; leader lines retain the original map location.
function layoutPlacePins(items, width, height) {
  const gap = 44;
  const pins = items.map(({p, i}) => ({p, i, anchorX:p[2]*width/100, anchorY:p[3]*height/100, x:p[2]*width/100, y:p[3]*height/100-20}));
  for (let pass=0; pass<180; pass++) {
    let moved=false;
    for(let a=0;a<pins.length;a++) for(let b=a+1;b<pins.length;b++) {
      const first=pins[a],second=pins[b];
      let dx=second.x-first.x,dy=second.y-first.y,d=Math.hypot(dx,dy);
      if(d>=gap) continue;
      if(d<0.01){dx=1;dy=0;d=1;}
      const shift=(gap-d)/2+0.05;
      first.x-=dx/d*shift;first.y-=dy/d*shift;
      second.x+=dx/d*shift;second.y+=dy/d*shift;moved=true;
    }
    pins.forEach(pin=>{pin.x=Math.max(24,Math.min(width-24,pin.x));pin.y=Math.max(24,Math.min(height-24,pin.y));});
    if(!moved)break;
  }
  return pins;
}
function renderMapPins(visible) {
  const canvas=document.getElementById('canvas'),width=canvas.clientWidth||600,height=canvas.clientHeight||width*1469/1071;
  const pins=layoutPlacePins(visible.filter(({p})=>p[2]!==null),width,height);
  const lines=pins.map(pin=>`<line x1="${pin.anchorX}" y1="${pin.anchorY}" x2="${pin.x}" y2="${pin.y}"/><circle cx="${pin.anchorX}" cy="${pin.anchorY}" r="3"/>`).join('');
  document.getElementById('pins').innerHTML=`<svg class="pin-guides" width="${width}" height="${height}" aria-hidden="true">${lines}</svg>`+pins.map(({p,i,x,y})=>`<button class="pin place-pin ${i===selected?'selected':''}" style="left:${x}px;top:${y}px" aria-label="查看${p[0]}" aria-pressed="${i===selected}" data-id="${i}">${i+1}<span>${p[0]}</span></button>`).join('');
}
