const {app,BrowserWindow,ipcMain,session,dialog,safeStorage}=require('electron');
const path=require('node:path');
const {execFile}=require('node:child_process');
ipcMain.handle('speech',async(_,payload)=>{
 if(!_.senderFrame||_.senderFrame!==_.sender.mainFrame||_.senderFrame.url.split('#')[0]!==require('node:url').pathToFileURL(path.join(require('node:path').resolve(__dirname,'..'),'index.html')).href)throw Error('Speech request is not allowed.');
 const text=String(payload?.text||'').trim(),language=payload?.language||'ru';
 if(!text||text.length>400||!['ru','it','es','fr','de','zh','ko','pt-br','pt-pt'].includes(language)||!(language==='ru'?/[а-яё]/i:language==='zh'?/[\p{Script=Han}]/u:language==='ko'?/[\p{Script=Hangul}]/u:/[a-zà-ÿœ]/i).test(text))throw new Error('Choose a supported language word or phrase to hear.');
 return require('./speech-engine.cjs').synthesize({text,language,slow:!!payload.slow},require('node:path').resolve(__dirname,'..'),process.resourcesPath);
});
// Retain the established profile directory so the rename preserves desktop progress.
app.setPath('userData',path.join(app.getPath('appData'),'lingua-studio'));
// Chromium may alter second-instance commandLine; preserve the original link explicitly.
const accountLink=process.argv.find(value=>typeof value==='string'&&value.startsWith('glossix:')&&value.length<=16384);
const hasInstanceLock=!app.requestSingleInstanceLock||app.requestSingleInstanceLock({accountLink:accountLink||''});
let mainWindow=null;
const authProtocol=hasInstanceLock?require('./auth-protocol.cjs').setupAuthProtocol({app,ipcMain,getWindow:()=>mainWindow}):null;
if(!hasInstanceLock)app.quit();
app.whenReady().then(()=>{
 if(!hasInstanceLock)return;
 if(app.isPackaged)app.setAsDefaultProtocolClient('glossix');
 const win=new BrowserWindow({width:1360,height:900,minWidth:420,minHeight:650,title:'Glossix · Language studio',icon:path.join(require('node:path').resolve(__dirname,'..'),'assets','glossix-icon.png'),backgroundColor:'#f5f4ee',webPreferences:{preload:path.join(require('node:path').resolve(__dirname,'..'),'desktop/preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 mainWindow=win;authProtocol.bindWindow(win);
 const security=require('./security.cjs').setupSecurity({app,ipcMain,session:session.defaultSession,dialog,safeStorage,getWindow:()=>win});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(!security.trustedUrl(url))event.preventDefault();});
 win.loadFile('index.html');
 require('./updater.cjs').setupUpdater({app,ipcMain,dialog,getWindow:()=>win});
});
app.on('window-all-closed',()=>app.quit());
