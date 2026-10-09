const spokenLanguages=[["en","English"]];
const nativeSupported=new Set(['en']);
for(const lesson of ITALIAN_CURRICULUM.lessons)for(const question of lesson.checks||[])question.choicesLanguage=/^What does /.test(question.prompt)?'explanation':'target';
const originalContent={courses:COURSES,ruDictionary:window.RUSSIAN_DICTIONARY,itDictionary:window.ITALIAN_DICTIONARY,ruVisuals:RUSSIAN_VISUALS,itVisuals:ITALIAN_VISUALS,ruCurriculum:RUSSIAN_CURRICULUM,itCurriculum:ITALIAN_CURRICULUM};
const nativePronunciationHints=new Set();(function collect(v,k=''){if(typeof v==='string'&&(k==='hint'||k==='ipa'))nativePronunciationHints.add(v);else if(Array.isArray(v)){if(k==='letters')v.forEach(x=>nativePronunciationHints.add(x[2]));v.forEach(x=>collect(x,k));}else if(v&&typeof v==='object')Object.entries(v).forEach(([key,x])=>collect(x,key));})(originalContent);
let nativePack={},nativeApplied='en',nativeSerial=0,nativeLoading=false,nativeNumberMap=new Map();
const nativeTextKeys=new Set(['en','translation','title','intro','prompt','note','explanation','meaning','description','group','unit','module','why','replyEn','goal','summary','instruction','instructions','objectives','duration','topic']);
function spokenLanguageKey(){return 'glossix-spoken-language-'+(GlossixOnline.user()?.id||('device-'+store.active));}
function spokenLanguage(){return "en";}
function translateNativeContent(value,key='',path=''){
 // Reference meanings belong to a word and language, not a global English-string lookup.
 if(value&&typeof value==='object'&&!Array.isArray(value)&&value.source&&value.meanings){
  const language=nativeApplied,meaning=value.meanings[language]||value.meanings.en||'Translation unavailable — check the source';
  return {...value,en:meaning,dictionaryExcluded:!!value.dictionaryExcluded||(value.language==='it'&&!value.meanings[language]),translationLanguage:value.meanings[language]?language:'en',translationFallback:language!=='en'&&!value.meanings[language],translated:!value.dictionaryExcluded&&(value.language==='it'?!!value.meanings[language]:value.translated!==false&&!!(value.meanings[language]||value.meanings.en))};
 }

 if(typeof value==='string')return nativeTextKeys.has(key)&&Object.hasOwn(nativePack,value)?nativePack[value]:value;
 if(Array.isArray(value))return value.map((v,i)=>{if(key==='choices'&&path.includes('checks')&&typeof v==='string')return /[А-Яа-яЁё]/.test(v)&&!/[A-Za-z]/.test(v)?v:(nativePack[v]||v);if(key==='letters'&&Array.isArray(v))return v.map((x,j)=>j===3?(nativePack[x]||x):x);return translateNativeContent(v,key,path+'['+i+']');});
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='choices'&&value.choicesLanguage==='target'?v.slice():translateNativeContent(v,k,path+'.'+k)]));return value;
}
function resetNativeCourse(){
 const code=activeLanguage;course=COURSES[code];activeVisuals=code==='it'?ITALIAN_VISUALS:RUSSIAN_VISUALS;languageName=course.name;languageLocale=course.locale||(code==='ru'?'ru-RU':'it-IT');dictionary=(code==='it'?window.ITALIAN_DICTIONARY:window.RUSSIAN_DICTIONARY)||[];wordIndex=new Map([...dictionary,...course.words].map(w=>[w.id,w]));referenceWords=[...course.words,...dictionary];searchIndex=referenceWords.map(w=>({w,key:searchKey(w.ru+' '+w.en+' '+(w.reviewMeaning||'')+' '+w.hint)}));curriculum=code==='it'?ITALIAN_CURRICULUM:RUSSIAN_CURRICULUM;learningItems=curriculum.lessons.flatMap(l=>l.items);courseModules=[...new Set(curriculum.lessons.map(l=>l.module))];for(const w of learningItems)if(!wordIndex.has(w.wordId))wordIndex.set(w.wordId,{...w,id:w.wordId,source:'authored'});
 learningSerial++;learningQuiz=null;learningLesson=null;learningKey='';learningReady=false;learningError='';learningState=GlossixLearning.blank();learningModule='';learningSearch='';selectedScene=null;visualQuiz=null;queue=[];index=0;flipped=false;scenario=0;step=0;sessionDone=false;render();refreshLearningPoints();
}
function nativeLookup(text){if(Object.hasOwn(nativePack,text))return nativePack[text];const nums=text.match(/\d+(?:\.\d+)?/g);if(nums){const record=nativeNumberMap.get(text.replace(/\d+(?:\.\d+)?/g,'#'));if(record){let i=0;return record.replace(/\d+(?:\.\d+)?/g,()=>nums[i++]||'');}}return text;}
const nativeNodes=new WeakMap();
function localizeVisibleText(){if(nativeApplied==='en')return;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){
 if(node.parentElement.closest('script,style,[lang="ru"],[lang="it"],#spoken-language,.username,[data-native-preserve]'))continue;
 const raw=node.textContent,known=nativeNodes.get(node),source=known&&raw===known.output?known.source:raw;const trimmed=source.trim();if(nativePronunciationHints.has(trimmed)||(trimmed.includes(': ')&&nativePronunciationHints.has(trimmed.slice(trimmed.indexOf(': ')+2))))continue;const translated=nativeLookup(trimmed);const output=translated===trimmed?source:source.replace(trimmed,translated);nativeNodes.set(node,{source,output});if(node.textContent!==output)node.textContent=output;
 }
 document.querySelectorAll('[placeholder],[aria-label]').forEach(el=>{for(const key of ['placeholder','aria-label']){const source=el.getAttribute('data-native-'+key)||el.getAttribute(key);if(!source)continue;el.setAttribute('data-native-'+key,source);const text=nativeLookup(source);if(el.getAttribute(key)!==text)el.setAttribute(key,text);}});
}
function loadNativePack(){return Promise.resolve({});}
async function applySpokenLanguage(){nativeApplied='en';nativePack={};document.documentElement.lang='en';try{localStorage.setItem(spokenLanguageKey(),'en');}catch{}}
function spokenLanguagePanel(){return '<section class="card"><h2>Translations &amp; explanations</h2><p>Glossix provides translations and explanations in English.</p><p class="note">Lesson words, answers and pronunciation use the language you are learning.</p></section>';}
const nativeSettingsBase=renderSettings;renderSettings=function(){nativeSettingsBase();$('#view .workspace').insertAdjacentHTML('afterbegin',spokenLanguagePanel());};
const nativeProfileEditorBase=profileEditor;profileEditor=function(p){return spokenLanguagePanel()+nativeProfileEditorBase(p);};
const nativeAccountBase=renderAccount;renderAccount=function(){nativeAccountBase();if(GlossixOnline.user())$('.account-card')?.insertAdjacentHTML('beforeend',spokenLanguagePanel());};
let nativeIdentity=spokenLanguageKey();
document.addEventListener('change',async e=>{if(!['spoken-language','spoken-language-sidebar'].includes(e.target.id)||!spokenLanguages.some(x=>x[0]===e.target.value))return;const code=e.target.value;try{localStorage.setItem(spokenLanguageKey(),code);await applySpokenLanguage(code);if(GlossixOnline.user()){try{await GlossixOnline.rpc('glossix_spoken_language_set',{p_language:code});}catch{toast('Language saved on this device. Account synchronization is not available right now.');}}}catch{toast('Your language preference could not be saved.');}});
const nativeObserver=new MutationObserver(()=>{const identity=spokenLanguageKey();if(identity!==nativeIdentity){nativeIdentity=identity;restoreSpokenLanguage();return;}localizeVisibleText();});nativeObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
async function restoreSpokenLanguage(){await applySpokenLanguage();}
const spokenSidebar=document.createElement('div');spokenSidebar.className='header-spoken-language';spokenSidebar.innerHTML='<span class="sidebar-language-label">Translations</span><span>English</span>';document.querySelector('header > div').insertBefore(spokenSidebar,document.querySelector('header .level'));
restoreSpokenLanguage();
