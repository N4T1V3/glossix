const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
function setupSecurity({app,ipcMain,session,dialog,safeStorage,getWindow}){
 const entry=pathToFileURL(path.join(__dirname,'index.html')).href;
 const trustedUrl=url=>{try{const u=new URL(url);u.hash='';u.search='';return u.href===entry}catch{return false}};
 const trusted=e=>{const w=getWindow();return !!w&&e.sender===w.webContents&&e.senderFrame===w.webContents.mainFrame&&trustedUrl(e.senderFrame.url)};
 const target=path.join(app.getPath('userData'),'session.encrypted');
 ipcMain.on('auth:storage',(event,action,value)=>{
  event.returnValue={ok:false};if(!trusted(event))return;
  try{if(action==='remove'){fs.rmSync(target,{force:true});event.returnValue={ok:true};return;}
   if(!safeStorage.isEncryptionAvailable())return;
   if(action==='get'){event.returnValue={ok:true,value:fs.existsSync(target)?safeStorage.decryptString(fs.readFileSync(target)):null};return;}
   if(action==='set'&&typeof value==='string'&&value.length<65536){const data=JSON.parse(value);if(typeof data.access_token!=='string'||typeof data.refresh_token!=='string'||typeof data.user?.id!=='string'||!Number.isFinite(data.expires_at))return;
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target+'.tmp',safeStorage.encryptString(value));fs.renameSync(target+'.tmp',target);event.returnValue={ok:true};}
  }catch{event.returnValue={ok:false};}
 });
 let approved=false;
 session.setPermissionCheckHandler((wc,permission,origin,details)=>{const w=getWindow();return !!w&&wc===w.webContents&&permission==='media'&&details.mediaType==='audio'&&trustedUrl(details.requestingUrl||wc.getURL());});
 session.setPermissionRequestHandler(async(wc,permission,callback,details)=>{
  const w=getWindow();if(!w||wc!==w.webContents||permission!=='media'||!details.isMainFrame||!trustedUrl(details.requestingUrl)||!details.mediaTypes?.length||details.mediaTypes.some(t=>t!=='audio')){callback(false);return;}
  if(!approved){try{const result=await dialog.showMessageBox(w,{type:'question',title:'Allow microphone?',message:'Allow Glossix to record your pronunciation?',detail:'Recordings are played back on this device. Camera access is disabled.',buttons:['Allow microphone','Cancel'],defaultId:1,cancelId:1,noLink:true});approved=result.response===0}catch{approved=false}}
  callback(approved);
 });
 return {trustedUrl};
}
module.exports={setupSecurity};
