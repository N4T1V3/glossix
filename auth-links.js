/* Recovery credentials stay in memory; never navigate the renderer to this URL. */
(function(root){
  const redirect='glossix://auth/recovery';
  function parse(value){
    if(typeof value!=='string'||value.length>16384)return null;
    let url;try{url=new URL(value)}catch{return null}
    if(url.protocol!=='glossix:'||url.hostname!=='auth'||url.username||url.password||url.port||!['/recovery','/callback'].includes(url.pathname))return null;
    const query=new URLSearchParams(url.search),fragment=new URLSearchParams(url.hash.slice(1)),params=new Map();
    for(const [key,value] of [...query,...fragment]){if(params.has(key)||params.size>32)return null;params.set(key,value)}
    if(params.has('error')||params.has('error_code'))return {kind:'error',message:'This reset link has expired or has already been used. Request a new password-reset email.'};
    if(!params.size)return {kind:'request'};
    const type=params.get('type');
    if(type!=='recovery'&&!(url.pathname==='/callback'&&['signup','email'].includes(type)))return null;
    const purpose=type==='recovery'?'recovery':'confirmation';
    if(params.has('token_hash')){
      const tokenHash=params.get('token_hash');
      if(!/^[A-Za-z0-9_-]{16,256}$/.test(tokenHash)||params.has('access_token')||params.has('refresh_token'))return null;
      return {kind:'token',purpose,type,tokenHash};
    }
    const accessToken=params.get('access_token'),refreshToken=params.get('refresh_token');
    if(!accessToken||accessToken.length>12000||!refreshToken||refreshToken.length>4096||/\s/.test(accessToken+refreshToken))return null;
    const expires=Number(params.get('expires_in')||3600);
    if(!Number.isFinite(expires)||expires<=0)return null;
    return {kind:'session',purpose,accessToken,expiresIn:Math.min(expires,3600)};
  }
  const api=Object.freeze({redirect,parse});
  if(typeof module!=='undefined')module.exports=api;else root.GlossixAuthLinks=api;
})(typeof window!=='undefined'?window:globalThis);
