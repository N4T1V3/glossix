const {app,BrowserWindow,ipcMain,session,dialog,safeStorage}=require('electron');
const path=require('node:path');
const {execFile}=require('node:child_process');
ipcMain.handle('speech',async(_,payload)=>{
 if(!_.senderFrame||_.senderFrame!==_.sender.mainFrame||_.senderFrame.url.split('#')[0]!==require('node:url').pathToFileURL(path.join(__dirname,'index.html')).href)throw Error('Speech request is not allowed.');
 const text=String(payload?.text||'').trim(),language=payload?.language||'ru';
 if(!text||text.length>400||!['ru','it'].includes(language)||!(language==='ru'?/[а-яё]/i:/[a-zàèéìòù]/i).test(text))throw new Error('Choose a supported language word or phrase to hear.');
 return require('./speech-engine.cjs').synthesize({text,language,slow:!!payload.slow},__dirname,process.resourcesPath);
});
// Retain the established profile directory so the rename preserves desktop progress.
app.setPath('userData',path.join(app.getPath('appData'),'lingua-studio'));
app.whenReady().then(()=>{
 if(app.requestSingleInstanceLock&&!app.requestSingleInstanceLock()){app.quit();return;}
 const win=new BrowserWindow({width:1360,height:900,minWidth:420,minHeight:650,title:'Glossix · Language studio',icon:path.join(__dirname,'assets','glossix-icon.png'),backgroundColor:'#f5f4ee',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 const security=require('./security.cjs').setupSecurity({app,ipcMain,session:session.defaultSession,dialog,safeStorage,getWindow:()=>win});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 app.on('second-instance',()=>{if(win.isMinimized())win.restore();win.focus();});
 win.webContents.on('will-navigate',(event,url)=>{if(!security.trustedUrl(url))event.preventDefault();});
 win.loadFile('index.html');
 require('./updater.cjs').setupUpdater({app,ipcMain,dialog,getWindow:()=>win});
});
app.on('window-all-closed',()=>app.quit());
