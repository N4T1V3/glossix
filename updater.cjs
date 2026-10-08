const fs=require('node:fs'),path=require('node:path');
function setupUpdater({app,ipcMain,dialog,getWindow,platform=process.platform,resourcesPath=process.resourcesPath,loadUpdater=()=>require('electron-updater').autoUpdater}){
 let updater,busy=false,installBusy=false,state={status:'unavailable',version:app.getVersion(),message:'Automatic updates are available in the installed Windows app.'};
 const emit=patch=>{state={...state,...patch};const win=getWindow();if(win&&!win.isDestroyed())win.webContents.send('updates:status',state);return {...state};};
 const trusted=event=>{const win=getWindow();if(!win||event.sender!==win.webContents||event.senderFrame&&event.senderFrame!==win.webContents.mainFrame)throw Error('Update request is not allowed.');};
 const check=async()=>{if(!updater||busy||state.status==='downloaded'||state.status==='downloading')return {...state};busy=true;try{await updater.checkForUpdates();}catch{emit({status:'error',message:'Updates could not be checked. Check your connection and try again.'});}finally{busy=false;}return {...state};};
 let config={};try{config=JSON.parse(fs.readFileSync(path.join(__dirname,'update-config.json'),'utf8'));}catch{}
 if(!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(config.owner||'')||!/^[a-zA-Z0-9_.-]{1,100}$/.test(config.repo||''))emit({status:'not-configured',message:'Automatic updates are not connected yet. A GitHub release repository must be configured.'});
 else if(platform==='win32'&&app.isPackaged&&resourcesPath&&fs.existsSync(path.join(resourcesPath,'app-update.yml'))&&app.getPath?.('exe')&&fs.existsSync(path.join(path.dirname(app.getPath('exe')),'Uninstall Glossix.exe'))){
  try{updater=loadUpdater();updater.autoDownload=true;updater.autoInstallOnAppQuit=false;updater.allowPrerelease=false;updater.allowDowngrade=false;
   updater.on('checking-for-update',()=>emit({status:'checking',message:'Checking for updates…'}));
   updater.on('update-not-available',()=>emit({status:'current',message:'Glossix is up to date.'}));
   updater.on('update-available',info=>emit({status:'downloading',nextVersion:String(info.version),percent:0,message:'A new version is downloading. You can keep learning.'}));
   updater.on('download-progress',p=>emit({status:'downloading',percent:Math.max(0,Math.min(100,Number(p.percent)||0)),message:'Downloading the update…'}));
   updater.on('update-downloaded',info=>emit({status:'downloaded',nextVersion:String(info.version),percent:100,message:'Update ready. Restart Glossix when you are ready to install it.'}));
   updater.on('error',()=>emit({status:'error',message:'The update could not be completed. Your current version is still available. Try again later.'}));
   emit({status:'ready',message:'Glossix checks for updates automatically.'});const initial=setTimeout(check,8000);initial.unref?.();const recurring=setInterval(check,4*60*60*1000);recurring.unref?.();app.once('before-quit',()=>{clearTimeout(initial);clearInterval(recurring);});
  }catch{emit({status:'error',message:'The updater could not start. Reinstall Glossix using the latest installer.'});}
 }else if(config.owner)emit({status:'unavailable',message:'Use the Glossix Windows installer to enable automatic updates. Browser previews and portable copies do not install updates.'});
 ipcMain.handle('updates:status',event=>{trusted(event);return {...state};});
 ipcMain.handle('updates:check',event=>{trusted(event);return check();});
 ipcMain.handle('updates:install',async event=>{trusted(event);if(!updater||state.status!=='downloaded'||installBusy)return {...state};installBusy=true;try{const win=getWindow();const answer=await dialog.showMessageBox(win,{type:'question',title:'Install Glossix update',message:`Restart and install Glossix ${state.nextVersion}?`,detail:'Finish your current activity first. Glossix will close and reopen after the update.',buttons:['Restart and install','Later'],defaultId:1,cancelId:1,noLink:true});if(answer.response===0&&state.status==='downloaded'){updater.quitAndInstall(false,true);}return {...state};}finally{installBusy=false;}});
 return {getState:()=>({...state}),check};
}
module.exports={setupUpdater};
