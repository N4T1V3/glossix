/* Aggregate usage: no typed text, messages or individual browsing history. */
(function(){
 let lastInteraction=0,lastSent=0,lastUser='',pending=false;
 const learningPages=new Set(['course','cards','spelling','daily','scenarios','pronunciation','visual','alphabet']);
 async function pulse(){
  const user=GlossixOnline.user();
  if(!user){lastUser='';lastInteraction=0;return;}
  if(user.id!==lastUser){lastUser=user.id;lastSent=0;lastInteraction=0;return;}
  const now=Date.now();
  if(document.visibilityState!=='visible'||now-lastInteraction>60000||now-lastSent<60000||pending)return;
  pending=true;lastSent=now;
  try{await GlossixOnline.rpc('glossix_activity_ping',{p_learning:learningPages.has(page)});}catch{/* Stats must never interrupt learning, including before SQL is installed. */}
  finally{pending=false;}
 }
 function interact(e){const user=GlossixOnline.user();if(!e.isTrusted||!user)return;if(user.id!==lastUser){lastUser=user.id;lastSent=0;}lastInteraction=Date.now();pulse();}
 for(const type of ['pointerdown','keydown','wheel','touchstart'])document.addEventListener(type,interact,{passive:true});
 setInterval(pulse,15000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')lastInteraction=0;});
 document.addEventListener('click',async e=>{
  if(!e.target.closest('#owner-app-stats'))return;
  const button=e.target.closest('button');button.disabled=true;
  try{
   const user=GlossixOnline.user();const data=await GlossixOnline.rpc('glossix_activity_stats');
   if(GlossixOnline.user()?.id!==user?.id||page!=='support')return;
   document.querySelector('#owner-stats-dialog')?.remove();const d=document.createElement('dialog');d.id='owner-stats-dialog';d.className='compact-dialog';
   d.innerHTML='<div class="row"><h2>Player activity</h2><button class="secondary" data-close-dialog>Done</button></div><p>Signed-in accounts with recent interaction. Active now uses a five-minute window.</p><div class="stats">'+[['Active now',data.active_now],['In learning sections',data.learning_now],['Today · UTC',data.daily_active],['Last 7 days · UTC',data.weekly_active]].map(([label,n])=>'<div><strong>'+Number(n).toLocaleString()+'</strong><span>'+label+'</span></div>').join('')+'</div><p class="note">Updated '+esc(new Date(data.as_of).toLocaleString())+'. Tracking starts with this update. Idle windows and signed-out visitors are excluded.</p>';
   d.addEventListener('close',()=>d.remove(),{once:true});document.querySelector('#view').append(d);d.showModal();
  }catch{toast('Activity statistics unavailable. Check the activity SQL update and owner account.');}finally{if(button.isConnected)button.disabled=false;}
 });
})();
