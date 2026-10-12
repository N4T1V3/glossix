/* Continue the rendered bottom edge, then fade it into the profile below. */
(()=>{
 const observed=new WeakSet();
 function update(cover){
  const summary=cover.closest('.profile-summary');if(!summary)return;
  let blend=summary.querySelector(':scope > .banner-edge-blend');
  if(!blend){blend=document.createElement('div');blend.className='banner-edge-blend';blend.setAttribute('aria-hidden','true');blend.append(document.createElement('div'));cover.after(blend);}
  const css=getComputedStyle(cover),rect=cover.getBoundingClientRect();
  const layer=blend.firstElementChild;
  Object.assign(layer.style,{height:rect.height+'px',backgroundImage:css.backgroundImage,backgroundColor:css.backgroundColor,backgroundSize:css.backgroundSize,backgroundPosition:css.backgroundPosition,backgroundRepeat:css.backgroundRepeat,backgroundOrigin:css.backgroundOrigin});
  blend.style.top=(cover.offsetTop+cover.offsetHeight)+'px';
 }
 const resize=new ResizeObserver(entries=>entries.forEach(e=>update(e.target)));
 let pending=false;
 function scan(){pending=false;document.querySelectorAll('.profile-summary > .profile-cover').forEach(cover=>{if(!observed.has(cover)){observed.add(cover);resize.observe(cover);}update(cover);});}
 const mutation=new MutationObserver(changes=>{if(changes.every(c=>c.target.closest?.('.banner-edge-blend')))return;if(!pending){pending=true;requestAnimationFrame(scan);}});
 mutation.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 scan();
})();
