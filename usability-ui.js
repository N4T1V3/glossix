let collectionPage=0,collectionIdentity='';
renderCollection=function(){
 registerPracticeWords();const identity=learningIdentity();if(identity!==collectionIdentity){collectionPage=0;collectionIdentity=identity;}
 const words=learner().saved.map(id=>wordIndex.get(id)).filter(w=>w&&!w.dictionaryExcluded&&w.translated!==false&&hasWordPronunciation(w)),size=6,last=Math.max(0,Math.ceil(words.length/size)-1);
 collectionPage=Math.min(last,Math.max(0,collectionPage));
 $('#view').innerHTML=title('KEEP WHAT MATTERS','Your word collection','Your saved words, a page at a time.')+'<div class="row collection-pagination"><span>'+words.length+' saved words · Page '+(collectionPage+1)+' / '+(last+1)+'</span><div class="actions"><button class="secondary" data-collection-page="-1" '+(!collectionPage?'disabled':'')+'>← Previous</button><button class="secondary" data-collection-page="1" '+(collectionPage===last?'disabled':'')+'>Next →</button></div></div><div class="workspace card">'+(words.length?words.slice(collectionPage*size,(collectionPage+1)*size).map(w=>'<div class="saved-word"><div><h3 lang="'+activeLanguage+'">'+esc(w.ru)+'</h3><span class="note" data-native-preserve>'+esc(w.en)+' · '+esc(w.hint||'')+'</span></div><div>'+soundButton(w)+' <button class="secondary" data-remove="'+esc(w.id)+'" aria-label="Remove '+esc(w.en)+'">×</button></div></div>').join(''):'<div class="empty"><h2>A home for your new words</h2><button data-page="dictionary">Explore the dictionary</button></div>')+'</div>';
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-collection-page]');if(b){collectionPage+=Number(b.dataset.collectionPage);renderCollection();pageTop();}});
document.addEventListener('change',e=>{if(e.target.id!=='note-keyboard-language')return;let label=document.querySelector('#selected-note-keyboard');if(!label){label=document.createElement('p');label.id='selected-note-keyboard';label.className='note';e.target.after(label);}label.textContent='Selected: '+e.target.selectedOptions[0].textContent;});
if(GlossixOnline.user()&&location.hash==='#account'){location.hash='home';}else if(page==='collection')renderCollection();

// Give every in-app dialog the same dismissal controls.
function setupPopupDismissal(){document.querySelectorAll('dialog').forEach(dialog=>{
 if(dialog.dataset.dismissReady)return;dialog.dataset.dismissReady='true';
 const close=document.createElement('button');close.type='button';close.className='popup-close';close.dataset.popupClose='';close.setAttribute('aria-label','Close popup');close.textContent='×';close.addEventListener('click',()=>dialog.close());if(!dialog.classList.contains('profile-inline-dialog'))dialog.prepend(close);
 let outsideStart=false;const outside=e=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
 dialog.addEventListener('pointerdown',e=>{outsideStart=outside(e);});dialog.addEventListener('click',e=>{if(outsideStart&&outside(e))dialog.close();outsideStart=false;});
 });}
new MutationObserver(setupPopupDismissal).observe(document.body,{childList:true,subtree:true});setupPopupDismissal();
