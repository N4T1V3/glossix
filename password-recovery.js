(function(root){
  let dialog=null,screen='request',serial=0,email='';
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function clear(){serial++;root.GlossixOnline.cancelPasswordRecovery()}
  function close(){clear();dialog?.close()}
  function show(content){
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='auth-recovery-dialog';dialog.className='auth-recovery-dialog';dialog.setAttribute('aria-labelledby','auth-recovery-title');
      dialog.addEventListener('cancel',clear);
      dialog.addEventListener('close',clear);
      dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()});
      document.body.append(dialog);
    }
    dialog.innerHTML='<button type="button" id="auth-recovery-close" class="plain auth-recovery-close" aria-label="Close password reset">×</button><span class="eyebrow">GLOSSIX · YOUR ACCOUNT</span>'+content;
    if(!dialog.open)dialog.showModal();
  }
  function message(text,error=false){const node=document.querySelector('#auth-recovery-message');if(node){node.textContent=text;node.className=error?'feedback error':'feedback'}}
  function requestForm(){clear();screen='request';email=root.GlossixOnline.user()?.email||email;
    show('<h2 id="auth-recovery-title">Reset your password</h2><p>We’ll email you a link that opens Glossix so you can choose a new password.</p><form id="auth-recovery-request"><label for="auth-recovery-email">Email address</label><input id="auth-recovery-email" type="email" autocomplete="email" required maxlength="254" value="'+escape(email)+'"><button type="submit">Send reset email</button></form><div id="auth-recovery-message" role="status" aria-live="polite"></div>');
  }
  async function handle(payload){
    if(!payload)return;if(payload.kind==='request'){requestForm();return}
    clear();const current=serial;screen='checking';
    show('<h2 id="auth-recovery-title">Checking your account link</h2><p id="auth-recovery-message" role="status">Please wait…</p>');
    try{
      if(payload.kind==='error')throw Error(payload.message);
      const result=await root.GlossixOnline.beginPasswordRecovery(payload);if(current!==serial)return;email=result.email;
      if(result.kind==='confirmation'){screen='success';show('<h2 id="auth-recovery-title">Email confirmed</h2><p>Your email address is confirmed. Return to Glossix’s account screen and sign in.</p><button type="button" id="auth-recovery-done">Done</button>');return}
      screen='password';show('<h2 id="auth-recovery-title">Choose a new password</h2><p>Resetting the password for <strong>'+escape(email)+'</strong>.</p><form id="auth-password-form"><label for="auth-new-password">New password</label><input id="auth-new-password" type="password" autocomplete="new-password" minlength="8" maxlength="200" required><label for="auth-confirm-password">Confirm new password</label><input id="auth-confirm-password" type="password" autocomplete="new-password" minlength="8" maxlength="200" required><p class="note">Use at least 8 characters. Your account service may require a stronger password.</p><button type="submit">Save new password</button></form><div id="auth-recovery-message" role="status" aria-live="polite"></div>');
    }catch(error){if(current!==serial)return;screen='error';show('<h2 id="auth-recovery-title">We couldn’t open that link</h2><div id="auth-recovery-message" role="status"></div><button type="button" data-recovery-request>Request a new link</button>');message(error.message,true)}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.id==='account-password-reset'||button.hasAttribute('data-recovery-request'))requestForm();if(button.id==='auth-recovery-close'||button.id==='auth-recovery-done')close()});
  document.addEventListener('submit',async event=>{
    if(!['auth-recovery-request','auth-password-form'].includes(event.target.id))return;event.preventDefault();
    const form=event.target,button=form.querySelector('button[type="submit"]');if(button.disabled)return;const current=serial;
    if(form.id==='auth-password-form'&&document.querySelector('#auth-new-password').value!==document.querySelector('#auth-confirm-password').value){message('The passwords do not match. Please enter them again.',true);return}
    button.disabled=true;message('Connecting…');
    try{
      if(form.id==='auth-recovery-request'){
        email=document.querySelector('#auth-recovery-email').value.trim();await root.GlossixOnline.requestPasswordReset(email);if(current!==serial)return;
        screen='sent';show('<h2 id="auth-recovery-title">Check your email</h2><p>If an account exists for that address, a reset email will arrive shortly. Open the newest link on a Windows device with the updated Glossix app installed.</p><button type="button" id="auth-recovery-done">Done</button>');
      }else{
        await root.GlossixOnline.updateRecoveryPassword(document.querySelector('#auth-new-password').value);if(current!==serial)return;
        screen='success';show('<h2 id="auth-recovery-title">Password updated</h2><p>Your new password is ready. Sign in to Glossix with your email address and new password.</p><button type="button" id="auth-recovery-done">Done</button>');
        if(typeof renderAccount==='function'&&typeof page!=='undefined'&&page==='account')renderAccount();
      }
    }catch(error){if(current===serial)message(error.message,true)}finally{if(button.isConnected)button.disabled=false}
  });
  if(root.desktop?.authRecovery){
    let draining=false,again=false;
    async function drain(){
      if(draining){again=true;return}draining=true;
      try{do{again=false;const payload=await root.desktop.authRecovery.take();if(payload)await handle(payload)}while(again)}
      catch{await handle({kind:'error',message:'Glossix could not receive the account link. Close Glossix completely, then open a fresh reset email.'})}
      finally{draining=false}
    }
    root.desktop.authRecovery.subscribe(drain);
    root.addEventListener('focus',drain);
    root.addEventListener('pageshow',drain);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')drain()});
    drain();
  }
  root.GlossixRecoveryUI=Object.freeze({open:requestForm,handle});
})(window);
