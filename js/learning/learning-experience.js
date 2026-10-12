/* Context clues, durable practice queues, and explicit review explanations. */
function glossixContextHint(w){
 const target=String(w.ru||'').trim(),meaning=String(w.en||'').toLowerCase();
 const clues=[[/coffee|tea|juice|water|milk/,'You might order this as a drink at a café.'],[/bread|croissant|cake|rice|apple|food/,'Look for this when choosing something to eat.'],[/hello|good morning|good evening|good afternoon|hi$/,'Use this when you meet someone.'],[/goodbye|bye/,'Use this when you are leaving a conversation.'],[/thank/,'Use this to acknowledge someone’s help or kindness.'],[/please/,'Use this to make a request more polite.'],[/sorry|excuse/,'Use this to apologise or politely get attention.'],[/name|called/,'Use this while introducing yourself or meeting someone new.'],[/umbrella/,'You would take this outside when rain is expected.'],[/train|bus|ticket|station/,'Think about getting somewhere using public transport.'],[/book|read|library/,'Think about something you could find in a library.'],[/doctor|hospital|pain/,'Think about asking for help when you feel unwell.'],[/where|direction|left|right/,'Use this when finding your way around an unfamiliar place.'],[/how much|price|cost|money/,'Use this while paying for something in a shop.'],[/room|hotel|reservation/,'Think about arranging somewhere to stay.'],[/family|mother|father|sister|brother/,'Use this when talking about people in your family.']];
 for(const [pattern,clue] of clues)if(pattern.test(meaning))return clue;
 if(target.length>2&&typeof curriculum!=='undefined')for(const lesson of curriculum.lessons||[])for(const turn of lesson.dialogue||[])for(const sentence of [turn.ru,turn.reply])if(sentence&&sentence.includes(target)&&sentence!==target)return 'Complete this example in '+languageName+': '+sentence.split(target).join('____');
 const group=String(w.group||'everyday conversation');const topic=meaning.length>2&&group.toLowerCase().includes(meaning)?'everyday conversation':group;
 return 'Think about the situation in this topic: '+topic+'. Recall how you would use it, rather than how it sounds.';
}
function glossixFeedbackDetail(feedback){
 if(feedback.querySelector('.learning-explanation'))return;
 let html='';const pair=(label,text,meaning)=>'<p><strong>'+label+':</strong> <span lang="'+activeLanguage+'">'+esc(text||'')+'</span>'+(meaning?' — '+esc(meaning):'')+'</p>';
 if(page==='scenarios'&&typeof learnedConversation!=='undefined'&&feedback.id==='learned-conversation-feedback'){
  const t=learnedConversation?.turns[learnedConversation.position];if(t)html=pair('Question',t.prompt,t.en)+pair('Suitable reply',t.reply,t.replyEn)+(t.context?'<p>'+esc(t.context)+'</p>':'');
 }else if(page==='scenarios'){
  const t=course.scenarios[scenario]?.steps[step],reply=t?.choiceDetails?.[t.answer];
  if(t&&reply){html=pair('Question',t.prompt,t.translation)+pair('Suitable reply',reply.ru,reply.en);const chosen=t.choiceDetails[glossixLastScenarioChoice];if(chosen&&chosen!==reply)html+=pair('Your reply',chosen.ru,chosen.en);if(t.note)html+='<p>'+esc(t.note)+'</p>';}
 }else if(['course','daily'].includes(page)&&learningQuiz){
  const current=learningQuiz.items[learningQuiz.position],w=current?.item;if(w)html=pair('Meaning',w.ru,w.en)+'<p>'+esc(glossixContextHint(w))+'</p>';
 }else if(page==='spelling'){
  const w=spellingWords()[0];if(w)html=pair('Meaning',w.ru,w.en)+'<p>'+esc(glossixContextHint(w))+'</p>';
 }
 if(html){const detail=document.createElement('div');detail.className='learning-explanation';detail.innerHTML=html;feedback.insertBefore(detail,feedback.querySelector('.actions,#next-word,#next-step,#learning-next,#learned-conversation-next'));}
}
let glossixLastScenarioChoice=-1;
const reviewBeforeRecall=review;
review=function(rating){if((rating==='again'||rating==='hard')&&queue[index])queue.push(queue[index]);reviewBeforeRecall(rating);};
const cardsBeforeClues=renderCards;
renderCards=function(){cardsBeforeClues();const hint=document.querySelector('.study-card .hint'),w=queue[index];if(hint&&w){hint.textContent='';hint.hidden=true;if(!flipped){const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent='Show hint';button.addEventListener('click',()=>{hint.textContent=glossixContextHint(w);hint.hidden=false;button.hidden=true;});hint.after(button);}}const note=document.querySelector('.workspace>p.note');if(note)note.textContent='Again and Hard bring this word back for another meaning check before spelling.';};
function glossixSpellingSession(){
 practiceSelection();const p=learner();p.spellingSessions=p.spellingSessions||{};let s=p.spellingSessions[practiceTopic];
 if(!s){const ids=shufflePractice(practiceSelection()).map(w=>w.id);s=p.spellingSessions[practiceTopic]={remaining:ids,correct:[],total:ids.length};save();}return s;
}
spellingWords=function(){const s=glossixSpellingSession();const byId=new Map(practiceSelection().map(w=>[w.id,w]));return s.remaining.map(id=>byId.get(id)).filter(Boolean);};
renderSpelling=function(){index=0;const s=glossixSpellingSession(),words=spellingWords();
 if(!words.length){$('#view').innerHTML=practiceToolbar()+title('PRACTICE SAVED','Spelling complete','Every word in this section has been spelled correctly.')+'<section class="card"><h2>'+s.correct.length+' words remembered</h2><p>Correct words stay out of the retry queue. Start a fresh round whenever you want.</p><button id="spelling-new-round">Start a new round</button></section>';return;}
 spellingBeforeSections();$('#view').insertAdjacentHTML('afterbegin',practiceToolbar());$('#practice-section').value=practiceTopic;
 $('#view .study-card .eyebrow').textContent=s.correct.length+' / '+s.total+' correct · '+words.length+' remaining';
};
let glossixSpellingResult=null;
checkSpelling=function(){if($('#next-word'))return;const w=spellingWords()[0];if(!w)return;const ok=normalize($('#answer').value)===normalize(w.ru);glossixSpellingResult={id:w.id,ok};
 const s=glossixSpellingSession();s.remaining=s.remaining.filter(id=>id!==w.id);if(ok){if(!s.correct.includes(w.id))s.correct.push(w.id);complete('spelling:'+w.id);}else s.remaining.push(w.id);save();
 const f=$('#feedback');f.className='feedback'+(ok?'':' error');f.innerHTML=(ok?'Correct! ':'Not quite. ')+'<strong lang="'+activeLanguage+'">'+esc(w.ru)+'</strong> means '+esc(w.en)+'.<p>'+esc(glossixContextHint(w))+'</p>'+(ok?'':'<p>This word will return after the remaining words.</p>')+'<div class="actions"><button id="next-word">Continue →</button></div>';
 // The answered word has already left the queue; keep its explanation attached to this result.
 const detail=document.createElement('div');detail.className='learning-explanation';f.append(detail);
};
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.choice!==undefined)glossixLastScenarioChoice=Number(b.dataset.choice);
 if(b.id==='next-word'){e.preventDefault();e.stopImmediatePropagation();glossixSpellingResult=null;index=0;renderSpelling();}
 if(b.id==='spelling-new-round'){e.preventDefault();e.stopImmediatePropagation();delete learner().spellingSessions[practiceTopic];save();renderSpelling();}
 if(b.id==='practice-shuffle'&&page==='spelling'){delete learner().spellingSessions?.[practiceTopic];save();}
 if(b.id==='account-not-now'){try{localStorage.setItem('glossix-guest-choice','later');}catch{}location.hash='home';}
},true);
if(!GlossixOnline.user()&&!localStorage.getItem('glossix-guest-choice')&&!document.querySelector('#password-recovery-form')&&!/recovery|access_token|error_description/.test(location.hash))location.hash='account';
if(page==='cards')renderCards();else if(page==='spelling')renderSpelling();
