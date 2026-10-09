let socialSerial=0,socialBusy=false,boardScope='global',boardPeriod='weekly',socialProfile=null,pointsWarning=false;
function socialError(message){const target=$('#social-status');if(target){target.className='feedback error';target.textContent=message;}}
function profileForm(p){return '<div class="card"><h2>'+ (p?'Your profile':'Create your learning profile')+'</h2><p>Choose a friendly username, region, hobbies and avatar on your profile page.</p><button data-page="profile">Open profile</button></div>';}
async function renderSocial(){
  const serial=++socialSerial,user=GlossixOnline.user();socialProfile=null;
  $('#view').innerHTML=title('A LITTLE FRIENDLY COMPETITION',page==='friends'?'Learn with friends':'Your leaderboards',page==='friends'?'Find a friend by username and practise together.':'Celebrate your progress, around the world or with your friends.')+`<div class="workspace"><div id="social-content">${user?glossixLoading('Loading your leaderboard and friends…'):'<div class="card empty"><h2>Sign in to join in</h2><p>Create a free Glossix account to add friends and see the leaderboards.</p><button data-page="account">Open account</button></div>'}</div><div id="social-status" role="status" aria-live="polite"></div></div>`;
  if(!user)return;
  try{
    let p=await GlossixOnline.rpc('glossix_profile');
    if(serial!==socialSerial||!['friends','leaderboard'].includes(page)||GlossixOnline.user()?.id!==user.id)return;
    if(p&&profileRoot().pendingLanguage){p=await GlossixOnline.rpc('glossix_language_set',{p_language:activeLanguage,p_active:true});delete profileRoot().pendingLanguage;save();}socialProfile=p;
    if(!p){$('#social-content').innerHTML=profileForm(null);return;}
    if(page==='friends'){
      const rows=await GlossixOnline.rpc('glossix_friends_languages');if(serial!==socialSerial||page!=='friends'||GlossixOnline.user()?.id!==user.id)return;
      const sections=[['incoming','Friend requests'],['outgoing','Requests you sent'],['friend','Your friends']];
      renderCompactFriends(p,rows);
    }else{
      const rows=await GlossixOnline.rpc('glossix_leaderboard_languages',{p_scope:boardScope,p_period:boardPeriod});try{const owners=new Set(await GlossixOnline.rpc('glossix_owner_badges',{p_user_ids:rows.map(r=>r.user_id)}));rows.forEach(r=>r.owner_badge=owners.has(r.user_id));}catch{rows.forEach(r=>r.owner_badge=false);}if(serial!==socialSerial||page!=='leaderboard'||GlossixOnline.user()?.id!==user.id)return;
      renderCompactBoard(p,rows);
    }
  }catch(e){if(serial===socialSerial&&['friends','leaderboard'].includes(page)){$('#social-content').innerHTML='<button class="secondary" id="social-refresh">Try again</button>';socialError(e.message);}}
}
// Capture the signed-in user before queuing; never send one user's points to another account.
let pointsQueue=Promise.resolve();
function awardOnline(activity,undo=false){
  const user=GlossixOnline.user();if(!user||!activity)return;
  pointsQueue=pointsQueue.catch(()=>{}).then(async()=>{
    if(GlossixOnline.user()?.id!==user.id)return;
    try{const earned=await GlossixOnline.rpc('glossix_award',{p_activity:activity,p_undo:undo});if(earned>0&&GlossixOnline.user()?.id===user.id){toast(`+${earned} leaderboard points`);window.refreshLearningPoints?.();}}
    catch{if(!pointsWarning&&GlossixOnline.user()?.id===user.id){pointsWarning=true;toast('Leaderboard points could not be saved. Check the Leaderboards page. Local learning progress is saved.');}}
  });
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.boardOpen){boardScope=b.dataset.boardOpen;}
  if(b.id==='social-refresh'){renderSocial();return;}
  if(b.dataset.boardScope&&!socialBusy){boardScope=b.dataset.boardScope;renderSocial();return;}
  if(b.dataset.friendAction&&!socialBusy){socialBusy=true;b.disabled=true;try{await GlossixOnline.rpc('glossix_friend_action',{p_action:b.dataset.friendAction,p_user_id:b.dataset.userId});if(page==='friends')await renderSocial();}catch(e){if(page==='friends')socialError(e.message);}finally{socialBusy=false;if(b.isConnected)b.disabled=false;}}
});
document.addEventListener('change',e=>{if(e.target.id==='board-period'){boardPeriod=e.target.value;renderSocial();}});
document.addEventListener('submit',async e=>{
  if(!['social-profile-form','friend-request-form'].includes(e.target.id))return;e.preventDefault();if(socialBusy)return;
  socialBusy=true;const button=e.target.querySelector('button');button.disabled=true;const startPage=page;
  try{
    if(e.target.id==='social-profile-form')await GlossixOnline.rpc('glossix_profile',{p_username:$('#social-username').value.trim().toLowerCase(),p_display_name:$('#social-username').value.trim(),p_global_visible:$('#social-visible').checked});
    else await GlossixOnline.rpc('glossix_friend_action',{p_action:'request',p_username:$('#friend-username').value.trim().replace(/^@/,'').toLowerCase()});
    if(page===startPage){await renderSocial();toast(e.target.id==='social-profile-form'?'Profile saved':'Friend request sent');}
  }catch(e){if(page===startPage)socialError(e.message);}finally{socialBusy=false;if(button.isConnected)button.disabled=false;}
});
