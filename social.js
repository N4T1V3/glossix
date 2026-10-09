let socialSerial=0,socialBusy=false,boardScope='global',boardPeriod='weekly',socialProfile=null,pointsWarning=false;
function socialError(message){const target=$('#social-status');if(target){target.className='feedback error';target.textContent=message;}}
function profileForm(p){return '<div class="card"><h2>'+ (p?'Your profile':'Create your learning profile')+'</h2><p>Choose a friendly username, region, hobbies and avatar on your profile page.</p><button data-page="profile">Open profile</button></div>';}
async function renderSocial(){
  const serial=++socialSerial,user=GlossixOnline.user();socialProfile=null;
  $('#view').innerHTML=title('A LITTLE FRIENDLY COMPETITION',page==='friends'?'Learn with friends':'Your leaderboards',page==='friends'?'Find a friend by username and practise together.':'Celebrate your progress, around the world or with your friends.')+`<div class="workspace"><div id="social-content">${user?'<p>Loading your online profile…</p>':'<div class="card empty"><h2>Sign in to join in</h2><p>Create a free Glossix account to add friends and see the leaderboards.</p><button data-page="account">Open account</button></div>'}</div><div id="social-status" role="status" aria-live="polite"></div></div>`;
  if(!user)return;
  try{
    let p=await GlossixOnline.rpc('glossix_profile');
    if(serial!==socialSerial||!['friends','leaderboard'].includes(page)||GlossixOnline.user()?.id!==user.id)return;
    if(p&&profileRoot().pendingLanguage){p=await GlossixOnline.rpc('glossix_language_set',{p_language:activeLanguage,p_active:true});delete profileRoot().pendingLanguage;save();}socialProfile=p;
    if(!p){$('#social-content').innerHTML=profileForm(null);return;}
    if(page==='friends'){
      const rows=await GlossixOnline.rpc('glossix_friends_languages');if(serial!==socialSerial||page!=='friends'||GlossixOnline.user()?.id!==user.id)return;
      const sections=[['incoming','Friend requests'],['outgoing','Requests you sent'],['friend','Your friends']];
      $('#social-content').innerHTML=`<div class="card"><span class="pill">Your username: @${esc(p.username)}</span><h2>Add a friend</h2><form id="friend-request-form" class="chat-form"><input id="friend-username" aria-label="Friend username" placeholder="Their exact username" required maxlength="20"><button>Send request</button></form><p class="note">Friendships start when the other learner accepts your request.</p></div>${sections.map(([type,label])=>`<div class="card social-section"><h2>${label}</h2>${rows.filter(r=>r.relationship===type).map(r=>`<div class="friend-row"><div>${avatarImage(r.avatar_id,true)} <strong>${esc(r.username)}</strong> ${languageFlags(r)}<p class="note">@${esc(r.username)}</p>${type==='friend'?`<button class="plain" data-view-profile="${esc(r.user_id)}">View profile</button>`:''}</div><div class="actions">${type==='incoming'?`<button data-friend-action="accept" data-user-id="${esc(r.user_id)}">Accept</button><button class="secondary" data-friend-action="decline" data-user-id="${esc(r.user_id)}">Decline</button>`:`<button class="secondary" data-friend-action="${type==='outgoing'?'cancel':'remove'}" data-user-id="${esc(r.user_id)}">${type==='outgoing'?'Cancel request':'Remove friend'}</button>`}</div></div>`).join('')||'<p class="note">None yet.</p>'}</div>`).join('')}<div class="actions"><button data-page="leaderboard" data-board-open="friends">Friends leaderboard →</button><button class="secondary" id="social-refresh">Refresh</button></div><details class="social-section"><summary>Edit your profile</summary>${profileForm(p)}</details>`;
    }else{
      const rows=await GlossixOnline.rpc('glossix_leaderboard_languages',{p_scope:boardScope,p_period:boardPeriod});try{const owners=new Set(await GlossixOnline.rpc('glossix_owner_badges',{p_user_ids:rows.map(r=>r.user_id)}));rows.forEach(r=>r.owner_badge=owners.has(r.user_id));}catch{rows.forEach(r=>r.owner_badge=false);}if(serial!==socialSerial||page!=='leaderboard'||GlossixOnline.user()?.id!==user.id)return;
      $('#social-content').innerHTML=`<div class="row board-controls"><div class="actions"><button data-board-scope="global" class="${boardScope==='global'?'':'secondary'}">Global leaderboard</button><button data-board-scope="friends" class="${boardScope==='friends'?'':'secondary'}">Friends leaderboard</button></div><label class="board-period-label">Points period<select id="board-period" aria-label="Leaderboard period"><option value="weekly" ${boardPeriod==='weekly'?'selected':''}>Weekly points</option><option value="alltime" ${boardPeriod==='alltime'?'selected':''}>All-time points</option></select></label></div><p class="note">Course recall earns 5 points per distinct target per UTC day; first lesson completion earns 50. Daily practice earns 20 and each challenge earns 25. Other eligible exercises earn 10. There is no daily or lifetime points cap. Weekly rankings count only points earned since Monday at 00:00 UTC. Levels always use lifetime points. Tied scores share a rank.</p>${boardScope==='global'&&!p.global_visible?'<div class="feedback">You have not joined the global leaderboard. You can still view it. Turn on “Join the global leaderboard” below to appear.</div>':''}<div class="card board-card"><h2>${boardScope==='global'?'Global':'Friends'} · ${boardPeriod==='weekly'?'This week':'All time'}</h2>${rows.length?`<div class="board-scroll"><table class="board-table"><thead><tr><th>Rank</th><th>Username</th><th>Lifetime level</th><th>${boardPeriod==='weekly'?'Weekly points':'All-time points'}</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.is_you?'board-you':''} ${leaderboardRowClass(r)}"><td>${esc(r.rank_position)}</td><td>${profileAvatar(r)} <strong>${ownerCrown(r)}${esc(r.display_name)}${r.is_you?' · You':''}</strong> ${languageFlags(r,true)}<small>@${esc(r.username)}</small><button class="plain" data-view-profile="${esc(r.user_id)}">View profile</button></td><td>${esc(r.account_level)}</td><td>${esc(r.points)}</td></tr>`).join('')}</tbody></table></div>`:'<p>No users here yet. Invite a friend or join the global leaderboard to get started.</p>'}</div><p class="note">Shows the top 100 and your own rank if you are below them. Points count for the selected language’s course flashcards (Hard or Got it), correct spelling, completed scenarios, all 50 visual scenes and letters marked practised. Saved reference dictionary words and pronunciation playback do not earn points. Sign in and choose a username before earning points; offline device points are separate from account points. Course memory progress is saved to your signed-in account.</p><div class="actions"><button class="secondary" id="social-refresh">Refresh rankings</button><button data-page="friends">Manage friends</button></div><details class="social-section"><summary>Your profile & visibility</summary>${profileForm(p)}</details>`;
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
