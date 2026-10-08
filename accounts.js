let accountMode='signin',accountBusy=false,accountNotice='';
function accountMessage(text,error=false){const el=$('#account-message');if(el){el.className='feedback'+(error?' error':'');el.textContent=text;}}
function renderAccount(){
  const user=GlossixOnline.user();
  $('#view').innerHTML=title('YOUR GLOSSIX ACCOUNT','Learn together, step by step','Sign in to your online account, or keep practising on this device.')+`<div class="workspace card account-card"><span class="pill">Supabase account service</span>${user?`<h2>Welcome, learner</h2><p>Signed in as ${esc(user.email)}</p><div class="feedback">${GlossixOnline.sessionSaved()?'Your sign-in is saved on this device. You can close and reopen Glossix without signing in again.':'Your sign-in could not be saved on this device. You may need to sign in again after reopening.'} Your beginner-course memory progress and account points are saved online. Choose a username on your Profile page before starting the online course. Other practice-mode progress stays on this device.</div><div class="actions"><button id="account-signout">Sign out</button><button data-page="profile">Open your profile</button><button class="secondary" data-page="leaderboard">Leaderboards</button><button class="secondary" data-page="home">Continue learning</button></div>`:`<div class="actions account-tabs"><button type="button" data-account-mode="signin" class="${accountMode==='signin'?'':'secondary'}">Sign in</button><button type="button" data-account-mode="signup" class="${accountMode==='signup'?'':'secondary'}">Create account</button><button type="button" data-account-mode="verify" class="${accountMode==='verify'?'':'secondary'}">Confirm email</button></div><h2>${accountMode==='signup'?'Start your Glossix account':accountMode==='verify'?'Confirm your email':'Welcome back'}</h2><form id="account-form"><label for="account-email">Email address</label><input id="account-email" type="email" autocomplete="email" required maxlength="254">${accountMode==='verify'?`<label for="account-code">Email confirmation code</label><input id="account-code" type="text" inputmode="numeric" autocomplete="one-time-code" required maxlength="20"><p class="note">If your email contains a confirmation link, open that link, then return here and sign in. Use this form only if your email contains a code.</p>`:`<label for="account-password">Password</label><input id="account-password" type="password" autocomplete="${accountMode==='signup'?'new-password':'current-password'}" required ${accountMode==='signup'?'minlength="8"':''} maxlength="200">${accountMode==='signup'?'<p class="note">Use at least 8 characters. Supabase may require a stronger password.</p>':''}`}<button id="account-submit" type="submit">${accountMode==='signup'?'Create account':accountMode==='verify'?'Confirm email':'Sign in'}</button></form><p class="note">Your email ${accountMode==='verify'?'and confirmation code':'and password'} are sent securely to Glossix’s Supabase project when you submit. Passwords are never saved by Glossix. Your sign-in is remembered on this device when you close or reopen the app, until you sign out or your session is revoked.</p>`}<div id="account-message" role="status" aria-live="polite"></div><p class="note">Offline exercises are available without an account.</p></div>`;
  if(accountNotice)accountMessage(accountNotice);
  if(accountBusy)$('#account-submit')?.setAttribute('disabled','');
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.accountMode&&!accountBusy){accountMode=b.dataset.accountMode;accountNotice='';renderAccount();}
  if(b.id==='account-signout'&&!accountBusy){accountBusy=true;b.disabled=true;try{const result=await GlossixOnline.signOut();accountNotice=result.error?'Signed out on this device. The service could not be reached to revoke this session; it will expire automatically.':'You have signed out.';}finally{accountBusy=false;if(page==='account')renderAccount();}}
});
document.addEventListener('submit',async e=>{
  if(e.target.id!=='account-form')return;e.preventDefault();if(accountBusy)return;
  const mode=accountMode,email=$('#account-email').value.trim(),password=$('#account-password')?.value,name='Learner',code=$('#account-code')?.value.trim();
  accountBusy=true;$('#account-submit').disabled=true;accountMessage('Connecting…');
  try{
    if(mode==='signup'){
      const data=await GlossixOnline.signUp(email,password,name);
      accountNotice=data.access_token?'Your account is ready.':'Check your email for confirmation. If an account already exists, sign in instead. After confirming, return to Glossix and sign in.';
      if(!data.access_token)accountMode='signin';
    }else if(mode==='verify'){await GlossixOnline.verify(email,code);accountNotice='Email confirmed. You are signed in.';}
    else{await GlossixOnline.signIn(email,password);accountNotice='You are signed in.';}
    if(page==='account')renderAccount();
  }catch(err){if(page==='account'){accountMessage(err.message,true);if($('#account-password'))$('#account-password').value='';}}
  finally{accountBusy=false;if(page==='account'&&$('#account-submit'))$('#account-submit').disabled=false;}
});
