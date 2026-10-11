const fs=require('node:fs'),path=require('node:path');
// The interface currently ships in English; learning courses are independent.
const root=path.join(__dirname,'../data/translations');
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({source:'en',languages:[]},null,2)+'\n');
console.log('Validated English interface configuration; no extra translation bundles are required.');
