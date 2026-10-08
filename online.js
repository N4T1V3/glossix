/* The publishable key identifies the project; it is not an administrator key. */
(function(root){
  const config={url:'https://ztuboafotonykidnywoq.supabase.co',key:'sb_publishable_RZf6bf2gMGOWfNscz5CzBA_BniciHal'};
  const sessionKey='glossix-auth-'+config.url;
  function defaultStorage(){try{if(root.desktop?.authStorage){const secure=root.desktop.authStorage;const legacy=root.localStorage?.getItem(sessionKey);if(legacy){try{if(!secure.getItem(sessionKey))secure.setItem(sessionKey,legacy);}finally{root.localStorage.removeItem(sessionKey);}}return secure;}return root.localStorage||null}catch{return null}}
  function createClient(fetchImpl=fetch,storage=defaultStorage()){
    let session=null,refreshing=null,saved=false;
    function persist(){try{if(storage){if(session)storage.setItem(sessionKey,JSON.stringify(session));else storage.removeItem(sessionKey);saved=!!session;}else saved=false;}catch{saved=false;}}
    try{const stored=JSON.parse(storage?.getItem(sessionKey)||'null');if(stored&&typeof stored.access_token==='string'&&typeof stored.refresh_token==='string'&&typeof stored.user?.id==='string'&&Number.isFinite(stored.expires_at)){session=stored;saved=true;}else if(stored)storage?.removeItem(sessionKey);}catch{try{storage?.removeItem(sessionKey)}catch{}}
    async function request(path,body,token,method='POST'){
      let response;
      try{response=await fetchImpl(config.url+'/auth/v1/'+path,{method,headers:{apikey:config.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)})}
      catch{throw Error('Could not reach your account service. Check your internet connection and try again.')}
      const data=await response.json().catch(()=>({}));
      if(!response.ok){const error=Error(data.msg||data.error_description||data.message||'Account request failed. Please try again.');error.status=response.status;throw error;}
      return data;
    }
    function accept(data){if(data.access_token&&data.user){session={access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+(data.expires_in||3600)*1000};persist();}return data;}
    async function token(){
      if(!session)throw Error('Please sign in first.');
      if(session.expires_at<Date.now()+60000){
        const refreshingSession=session;
        refreshing ||= request('token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(data=>{if(session===refreshingSession)accept(data);}).catch(e=>{if(session===refreshingSession&&[400,401,403].includes(e.status)){session=null;persist();}throw e}).finally(()=>{refreshing=null});
        await refreshing;
      }
      if(!session)throw Error('Please sign in first.');return session.access_token;
    }
    return {
      user:()=>session?.user||null,
      sessionSaved:()=>saved,
      signIn:async(email,password)=>accept(await request('token?grant_type=password',{email,password})),
      signUp:async(email,password,name)=>accept(await request('signup',{email,password,data:{display_name:name}})),
      verify:async(email,code)=>accept(await request('verify',{email,token:code,type:'signup'})),
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
  else root.GlossixOnline=createClient();
})(typeof window!=='undefined'?window:globalThis);
