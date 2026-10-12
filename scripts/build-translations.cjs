const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../data/translations');
const manifestPath=path.join(root,'manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!Array.isArray(manifest.languages))throw Error('Translation manifest must list enabled languages.');
const summaries=[];
for(const entry of manifest.languages){
 const code=typeof entry==='string'?entry:entry.language;
 if(typeof code!=='string'||!/^([a-z]{2})(-[a-z]{2})?$/.test(code))throw Error('Invalid translation language in manifest.');
 const source=path.join(root,code+'.json');
 if(!fs.existsSync(source))throw Error('Enabled translation '+code+' is missing: '+source);
 const data=JSON.parse(fs.readFileSync(source,'utf8'));
 if(!data||Array.isArray(data)||typeof data!=='object'||!Object.values(data).every(v=>typeof v==='string'&&v.trim()))throw Error('Invalid translation in '+code);
 fs.writeFileSync(path.join(root,code+'.js'),'window.GLOSSIX_TRANSLATIONS ||= {};window.GLOSSIX_TRANSLATIONS['+JSON.stringify(code)+']=JSON.parse('+JSON.stringify(JSON.stringify(data))+');\n');
 summaries.push({language:code,translatedStrings:Object.keys(data).length,status:'machine-translated draft'});
}
if(summaries.length)fs.writeFileSync(manifestPath,JSON.stringify({...manifest,languages:summaries},null,2)+'\n');
console.log(summaries.length?'Built '+summaries.length+' enabled offline translation bundles.':'English explanations only: no additional translation bundles are enabled.');
