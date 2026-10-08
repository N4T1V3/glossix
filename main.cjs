const {app,BrowserWindow,ipcMain,session,dialog}=require('electron');
const path=require('node:path');
const {execFile}=require('node:child_process');
ipcMain.handle('speech',async(_,payload)=>{
 const text=String(payload?.text||'').trim(),language=payload?.language||'ru';
 if(!text||text.length>400||!['ru','it'].includes(language)||!(language==='ru'?/[а-яё]/i:/[a-zàèéìòù]/i).test(text))throw new Error('Choose a supported language word or phrase to hear.');
 const base=path.join(__dirname.endsWith('app.asar')?path.join(process.resourcesPath,'app.asar.unpacked'):__dirname,'third-party','espeak-ng');
 return new Promise((resolve,reject)=>execFile(path.join(base,'espeak-ng.exe'),['--path='+base,'-v',language,'-s',payload.slow?'105':'145','-b','1','--stdout',text],{windowsHide:true,encoding:'buffer',timeout:12000,maxBuffer:8000000},(error,stdout)=>{
   if(error||stdout?.subarray(0,4).toString()!=='RIFF')return reject(new Error('Offline speech could not start. Check the bundled speech engine files, or enable a system voice for your language.'));
   resolve(stdout.toString('base64'));
 }));
});
// Retain the established profile directory so the rename preserves desktop progress.
app.setPath('userData',path.join(app.getPath('appData'),'lingua-studio'));
app.whenReady().then(()=>{
 if(app.requestSingleInstanceLock&&!app.requestSingleInstanceLock()){app.quit();return;}
 session.defaultSession.setPermissionRequestHandler((wc,permission,callback)=>callback(permission==='media'));
 const win=new BrowserWindow({width:1360,height:900,minWidth:420,minHeight:650,title:'Glossix · Language studio',icon:path.join(__dirname,'assets','glossix-icon.png'),backgroundColor:'#f5f4ee',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 app.on('second-instance',()=>{if(win.isMinimized())win.restore();win.focus();});
 win.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('file://'))event.preventDefault();});
 win.loadFile('index.html');
 require('./updater.cjs').setupUpdater({app,ipcMain,dialog,getWindow:()=>win});
});
app.on('window-all-closed',()=>app.quit());
