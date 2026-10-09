// The owner JWT is forwarded to the RPC; the database checks owner identity.
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, apikey','Access-Control-Allow-Methods':'POST, OPTIONS'};
Deno.serve(async(req)=>{
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
 const authorization=req.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return reply({error:'Sign in required'},401);
 const {thread_user}=await req.json();if(typeof thread_user!=='string'||!/^[0-9a-f-]{36}$/i.test(thread_user))return reply({error:'Invalid conversation'},400);
 const result=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/rpc/glossix_support_export',{method:'POST',headers:{Authorization:authorization,apikey:Deno.env.get('SUPABASE_ANON_KEY'),'Content-Type':'application/json'},body:JSON.stringify({p_thread_user:thread_user})});
 if(!result.ok)return reply({error:'Owner access and a closed conversation are required'},403);
 const log=await result.json();
 const hook=Deno.env.get('DISCORD_SUPPORT_WEBHOOK');if(!hook)return reply({error:'Webhook not configured'},503);
 const url=new URL(hook);if(url.origin!=='https://discord.com'||!/^\/api\/webhooks\/\d+\/[^/]+$/.test(url.pathname))return reply({error:'Invalid webhook configuration'},503);url.searchParams.set('wait','true');
 const text='Glossix support log\nAccount: '+log.username+'\nAccount ID: '+log.user_id+'\nExported: '+new Date().toISOString()+'\n\n'+log.messages.map(m=>'['+m.sent_at+'] '+m.username+':\n'+m.body).join('\n\n');
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});if(blob.size>7*1024*1024)return reply({error:'Log too large for Discord; download it in Glossix'},413);
 const form=new FormData();form.append('payload_json',JSON.stringify({content:'Closed Glossix support conversation. Full transcript attached.',allowed_mentions:{parse:[]}}));form.append('files[0]',blob,'Glossix-support-'+thread_user+'.txt');
 const sent=await fetch(url,{method:'POST',body:form,signal:AbortSignal.timeout(30000)});if(!sent.ok)return reply({error:'Discord delivery failed; original log remains saved'},502);
 return reply({archived:true});
 }catch{return reply({error:'Archive failed; original log remains saved'},500);}
});
