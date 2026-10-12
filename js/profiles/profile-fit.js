/* Fit complete profiles and cosmetic dialogs without internal scrolling. */
(()=>{
 let queued=false;
 function fit(){queued=false;
  const dialog=document.querySelector('#coin-shop-detail[open],.equipped-preview-dialog[open]');
  if(dialog){dialog.style.zoom='1';const r=dialog.getBoundingClientRect();dialog.style.zoom='1';dialog.style.maxHeight='calc(100dvh - 32px)';dialog.style.overflowY='auto';}

 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(fit)}};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
 addEventListener('resize',schedule);addEventListener('hashchange',schedule);document.addEventListener('load',schedule,true);schedule();
})();
