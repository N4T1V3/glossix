// Bot-only aggregate lookup. Deploy with verify_jwt=false; authenticate using
// a dedicated shared secret, never the project's service key on the bot host.
async function sameSecret(a:string,b:string){
 const digest=async(s:string)=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [x,y]=await Promise.all([digest(a),digest(b)]);let mismatch=0;
 for(let i=0;i<x.length;i++)mismatch|=x[i]^y[i];return mismatch===0;
}
Deno.serve(async req=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const secret=Deno.env.get('GLOSSIX_STATS_BOT_KEY');
 if(!secret||secret.length<32)return reply({error:'Statistics key not configured'},503);
 const supplied=req.headers.get('x-glossix-stats-key')||'';
 if(supplied.length>256||!await sameSecret(supplied,secret))return reply({error:'Access denied'},403);
 try{
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!key)return reply({error:'Server configuration missing'},503);
  const result=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/glossix_activity_stats',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
  if(!result.ok)return reply({error:'Statistics unavailable; check SQL setup'},503);
  return reply(await result.json());
 }catch{return reply({error:'Statistics unavailable'},503);}
});
