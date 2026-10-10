function shuffleLesson(items,random=Math.random){const copy=items.slice();for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function lessonCheckpointKey(){return 'glossix-session-v1:'+learningIdentity();}
function saveLessonCheckpoint(includeDraft=true){
 if(learningKey!==learningIdentity())return;
 try{if(!learningQuiz&&learningLesson===null)return;const input=document.querySelector('#learning-answer');const draft=includeDraft&&input?.dataset.sessionPosition===String(learningQuiz?.position)?input.value:'';localStorage.setItem(lessonCheckpointKey(),JSON.stringify({lesson:learningLesson,quiz:learningQuiz,draft,savedAt:Date.now()}));}catch{}
}
function clearLessonCheckpoint(){try{localStorage.removeItem(lessonCheckpointKey());}catch{}}
function restoreLessonCheckpoint(destination){
 if(learningQuiz||!['course','daily'].includes(destination))return;
 try{const saved=JSON.parse(localStorage.getItem(lessonCheckpointKey())||'null');if(!saved)return;
  const q=saved.quiz;if(q&&((q.source==='lesson'&&destination!=='course')||(q.source!=='lesson'&&destination!=='daily')))return;
  if(saved.lesson!==null&&(!Number.isInteger(saved.lesson)||!curriculum.lessons[saved.lesson]))return;
  if(q){if(!Array.isArray(q.items)||!q.items.length||!Number.isInteger(q.position)||q.position<0||q.position>=q.items.length)return;
   const ids=new Set(learningItems.map(w=>w.id));if(q.items.some(x=>x.item&&!ids.has(x.item.id)))return;
   if(q.answered){q.position++;q.answered=false;q.assisted=false;saved.draft='';}
   learningQuiz=q;
  }
  learningLesson=saved.lesson;lessonRestoredDraft=saved.draft||'';
 }catch{}
}
let lessonRestoredDraft='';
document.addEventListener('input',e=>{if(e.target.id==='learning-answer')saveLessonCheckpoint();});
window.addEventListener('beforeunload',saveLessonCheckpoint);
