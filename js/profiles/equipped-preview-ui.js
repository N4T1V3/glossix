(()=>{
 let applying=null;
 const choices=[['data-avatar-id','avatar'],['data-banner-id','banner'],['data-design-id','design'],['data-avatar-border','avatar-border'],['data-board-design','leaderboard']];
 const baseSummary=profileSummary;
 profileSummary=function(p){window.glossixEquippedProfile={...p};return baseSummary(p);};
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||b.disabled||applying===b)return;
  const choice=choices.find(([attr])=>b.hasAttribute(attr));if(!choice)return;
  // Device-only avatar selection has no online profile to preview.
  if(choice[1]==='avatar'&&b.closest('[data-avatar-mode="device"]'))return;
  e.preventDefault();e.stopImmediatePropagation();
  const user=GlossixOnline.user();if(!user)return;
  const dialog=document.createElement('dialog');dialog.className='equipped-preview-dialog';
  dialog.innerHTML='<button class="secondary" data-dismiss>Close</button><p role="status">Loading your equipped items…</p>';
  document.body.append(dialog);dialog.showModal();
  const close=()=>{dialog.close();dialog.remove();};
  dialog.addEventListener('cancel',()=>dialog.remove());dialog.querySelector('[data-dismiss]').onclick=close;
  try{
   let saved=await GlossixOnline.rpc('glossix_profile_view',{p_user_id:user.id});
   const extras=await Promise.allSettled([GlossixOnline.rpc('glossix_cosmetics_get',{p_user_id:user.id}),GlossixOnline.rpc('glossix_profile_extras_get',{p_user_id:user.id}),GlossixOnline.rpc('glossix_owner_badge',{p_user_id:user.id})]);
   for(const r of extras.slice(0,2))if(r.status==='fulfilled')saved={...saved,...r.value};
   saved.owner_badge=extras[2].status==='fulfilled'&&extras[2].value===true;
   if(!dialog.isConnected||!saved||GlossixOnline.user()?.id!==user.id)return;
   const next=glossixPreviewProfile(saved,{kind:choice[1],cosmetic_id:b.getAttribute(choice[0])});
   let art=profileSummary(next);
   // Render a row using the same avatar, frame and row classes as the leaderboard.
   if(choice[1]==='leaderboard')art='<section class="card compact-board"><h2>Your leaderboard row</h2><table class="compact-board-table"><thead><tr><th>Rank</th><th>Player</th><th>Lifetime level</th><th>Weekly points</th></tr></thead><tbody><tr class="'+leaderboardRowClass(next)+'"><td>—</td><td>'+profileAvatar(next)+' <strong>@'+esc(next.username)+'</strong></td><td>'+esc(next.level||1)+'</td><td>—</td></tr></tbody></table><p class="note">Rank and weekly points depend on the current leaderboard.</p></section>';
   dialog.innerHTML='<button class="secondary" data-dismiss>Close</button><div class="equipped-preview-content">'+art+'</div><p class="note">Only the selected item is changed in this preview.</p><button data-apply>Use this item</button>';
   dialog.querySelector('[data-dismiss]').onclick=close;
   dialog.querySelector('[data-apply]').onclick=async()=>{if(GlossixOnline.user()?.id!==user.id)return;if(b.getAttribute(choice[0]).startsWith('shop-')){const apply=dialog.querySelector('[data-apply]');apply.disabled=true;try{await GlossixOnline.rpc('glossix_shop_equip',{p_item:choice[1]+':'+b.getAttribute(choice[0])});close();if(page==='profile')await renderPublicProfile();}catch(error){apply.disabled=false;apply.textContent=error.message;}return;}close();applying=b;try{b.click();}finally{applying=null;}};
   window.glossixEquippedProfile={...saved};
  }catch{if(dialog.isConnected)dialog.querySelector('[role="status"]').textContent='Your profile could not be loaded. Close and try again.';}
 },true);
})();
