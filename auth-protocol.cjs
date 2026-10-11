const {parse}=require('./auth-links.js');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
function setupAuthProtocol({app,ipcMain,getWindow,argv=process.argv}){
  const entry=pathToFileURL(path.join(__dirname,'index.html')).href;
  let pending=null;
  function notify(){const win=getWindow();if(pending&&win&&!win.isDestroyed())win.webContents.send('auth:recovery');}
  function trusted(event){const win=getWindow();if(!win||event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame)return false;try{const url=new URL(event.senderFrame.url);url.hash='';url.search='';return url.href===entry}catch{return false}}
  function receive(value){
    if(typeof value!=='string'||!value.startsWith('glossix:')||value.length>16384)return false;
    const payload=parse(value)||{kind:'error',message:'Glossix opened, but this account link is incomplete or unsupported. Request a fresh reset email from Settings → Account.'};
    pending=payload;notify();return true;
  }
  for(const value of argv)receive(value);
  app.on('open-url',(event,url)=>{event.preventDefault();receive(url)});
  app.on('second-instance',(_event,commandLine,_workingDirectory,additionalData)=>{
    if(!receive(additionalData?.accountLink))for(const value of commandLine||[])receive(value);
    const win=getWindow();if(win){if(win.isMinimized())win.restore();win.show();win.focus()}
  });
  ipcMain.handle('auth:recovery:take',event=>{if(!trusted(event))throw Error('Account callback is not allowed.');const payload=pending;pending=null;return payload});
  // Keep links queued until the renderer explicitly takes them. Loading and
  // in-app navigation must not permanently disable delivery to a running app.
  return {bindWindow(win){win.webContents.on('did-finish-load',notify);win.on('focus',notify)}};
}
module.exports={setupAuthProtocol};
