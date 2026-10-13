/* The publishable key identifies the project; it is not an administrator key. */
(function(root){
  const config={url:'https://ztuboafotonykidnywoq.supabase.co',key:'sb_publishable_RZf6bf2gMGOWfNscz5CzBA_BniciHal'};
  const sessionKey='glossix-auth-'+config.url;
  const authLinks=typeof module!=='undefined'?require('./auth-links.js'):root.GlossixAuthLinks;
  function defaultStorage(){
    let local=null;try{local=root.localStorage}catch{}
    if(!root.desktop?.authStorage)return local;
    const secure=root.desktop.authStorage;
    return {getItem:key=>{let encrypted=null;try{encrypted=secure.getItem(key)}catch{}if(encrypted)return encrypted;let legacy=null;try{legacy=local?.getItem(key)}catch{}if(legacy){try{secure.setItem(key,legacy);if(secure.getItem(key)===legacy)local?.removeItem(key)}catch{}}return legacy;},setItem:(key,value)=>{secure.setItem(key,value);try{local?.removeItem(key)}catch{}},removeItem:key=>{secure.removeItem(key);try{local?.removeItem(key)}catch{}}};
  }
  function createClient(fetchImpl=fetch,storage=defaultStorage()){
    let session=null,refreshing=null,saved=false,updating=false,recovery=null,recoverySerial=0;
    function persist(){try{if(storage){if(session)storage.setItem(sessionKey,JSON.stringify(session));else storage.removeItem(sessionKey);saved=!!session;}else saved=false;}catch{saved=false;}}
    try{const stored=JSON.parse(storage?.getItem(sessionKey)||'null');if(stored&&typeof stored.access_token==='string'&&typeof stored.refresh_token==='string'&&typeof stored.user?.id==='string'&&Number.isFinite(stored.expires_at)){session=stored;saved=true;}else if(stored)storage?.removeItem(sessionKey);}catch{/* A temporary storage read error must not delete a saved session. */}
    async function request(path,body,token,method='POST'){
      let response;
      try{response=await fetchImpl(config.url+'/auth/v1/'+path,{method,headers:{apikey:config.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)})}
      catch{throw Error('Could not reach your account service. Check your internet connection and try again.')}
      const data=await response.json().catch(()=>({}));
      if(!response.ok){const error=Error(data.msg||data.error_description||data.message||'Account request failed. Please try again.');error.status=response.status;error.code=data.error_code||data.code;throw error;}
      return data;
    }
    function accept(data){if(data.access_token&&data.user){session={access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+(data.expires_in||3600)*1000};persist();}return data;}
    async function token(){
      try{const fresh=JSON.parse(storage?.getItem(sessionKey)||'null');if(fresh?.user?.id===session?.user?.id&&fresh?.refresh_token&&fresh.expires_at>session.expires_at){session=fresh;saved=true;}}catch{}
      if(!session)throw Error('Please sign in first.');
      if(!updating&&session.expires_at<Date.now()+60000){
        const refreshingSession=session;
        refreshing ||= request('token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(data=>{if(session===refreshingSession)accept(data);}).catch(e=>{if(session===refreshingSession&&['refresh_token_not_found','refresh_token_already_used','session_not_found','user_not_found','user_banned'].includes(e.code)){let latest=null;try{latest=JSON.parse(storage?.getItem(sessionKey)||'null')}catch{}if(latest?.user?.id===session.user.id&&latest.refresh_token&&latest.refresh_token!==refreshingSession.refresh_token){session=latest;saved=true;refreshing=null;return token();}session=null;persist();}throw e}).finally(()=>{refreshing=null});
        await refreshing;
      }
      if(!session)throw Error('Please sign in first.');return session.access_token;
    }
    return {
      user:()=>session?.user||null,
      sessionSaved:()=>saved,
      prepareUpdate:async()=>{updating=true;try{if(refreshing)await refreshing.catch(()=>{});persist();if(session&&!saved)throw Error('Could not save sign-in before updating.');return true;}catch(error){updating=false;throw error;}},
      signIn:async(email,password)=>accept(await request('token?grant_type=password',{email,password})),
      signUp:async(email,password,name)=>accept(await request('signup',{email,password,data:{display_name:name}})),
      verify:async(email,code)=>accept(await request('verify',{email,token:code,type:'signup'})),
      requestPasswordReset:email=>request('recover?redirect_to='+encodeURIComponent(authLinks.redirect),{email}),
      cancelPasswordRecovery:()=>{recovery=null;recoverySerial++},
      beginPasswordRecovery:async payload=>{
        const serial=++recoverySerial;recovery=null;
        if(!payload||!['session','token'].includes(payload.kind)||!['recovery','confirmation'].includes(payload.purpose))throw Error('This account link is not supported. Request a new password-reset email.');
        let accessToken=payload.accessToken,expiresIn=payload.expiresIn;
        try{
          if(payload.kind==='token'){
            if(!/^[A-Za-z0-9_-]{16,256}$/.test(payload.tokenHash||'')||!['recovery','signup','email'].includes(payload.type)||(payload.purpose==='recovery')!==(payload.type==='recovery'))throw Error('Invalid account link.');
            const verified=await request('verify',{token_hash:payload.tokenHash,type:payload.type});accessToken=verified.access_token;expiresIn=verified.expires_in;
          }
          if(typeof accessToken!=='string'||!accessToken||accessToken.length>12000)throw Error('Invalid account link.');
          const user=await request('user',null,accessToken,'GET');
          if(!user?.id||typeof user.email!=='string')throw Error('Invalid account link.');
          if(serial!==recoverySerial)throw Error('This account link was cancelled.');
          if(payload.purpose==='confirmation')return {kind:'confirmation',email:user.email};
          recovery={accessToken,user,expiresAt:Date.now()+Math.min(Math.max(Number(expiresIn)||3600,1),3600)*1000,updating:false};
          return {kind:'recovery',email:user.email};
        }catch(error){if([400,401,403,422].includes(error.status))throw Error('This reset link has expired or has already been used. Request a new password-reset email.');throw error}
      },
      updateRecoveryPassword:async password=>{
        const current=recovery,serial=recoverySerial;
        if(!current||current.expiresAt<=Date.now()){recovery=null;throw Error('This reset link has expired. Request a new password-reset email.')}
        if(current.updating)throw Error('A password update is already in progress.');
        if(typeof password!=='string'||password.length<8||password.length>200)throw Error('Use a password between 8 and 200 characters.');
        current.updating=true;
        try{
          await request('user',{password},current.accessToken,'PUT');
          if(session?.user.id===current.user.id){session=null;persist()}
          if(serial===recoverySerial){recovery=null;recoverySerial++}
          // Discard the recovery session; the user signs in with the new password.
          await request('logout?scope=local',null,current.accessToken).catch(()=>{});
          return {email:current.user.email};
        }catch(error){
          if([401,403].includes(error.status)){if(recovery===current)recovery=null;throw Error('This reset link has expired. Request a new password-reset email.')}
          throw error;
        }finally{current.updating=false}
      },
      status:()=>request('settings',null,null,'GET'),
      signOut:async()=>{const previous=session;session=null;persist();let error;try{if(previous)await request('logout?scope=local',null,previous.access_token)}catch(e){error=e}return {error};},
      rpc:async(name,body={})=>{
        if(!/^glossix_[a-z_]+$/.test(name))throw Error('Unknown account action.');
        const access=await token();let response;
        try{response=await fetchImpl(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)})}
        catch{throw Error('Could not reach the leaderboard service. Check your connection and try again.')}
        const data=await response.json().catch(()=>null);
        if(!response.ok){
          if(data?.code==='PGRST202'||data?.code==='42P01')throw Error('Online features need database setup. Run the updated SUPABASE-SOCIAL.sql for all features, or SUPABASE-ITALIAN-UPDATE.sql after the long-course update, then refresh this page.');
          throw Error(data?.message||'Online request failed. Please try again.');
        }
        return data;
      },
      token
    };
  }
  if(typeof module!=='undefined')module.exports={createClient,config};
  else {root.GlossixOnline=createClient();root.desktop?.authStorage?.beforeUpdate?.(()=>root.GlossixOnline.prepareUpdate());}
})(typeof window!=='undefined'?window:globalThis);

