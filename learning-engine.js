(function(root){
 const DAY=86400000;
 const day=now=>new Date(now).toISOString().slice(0,10);
 const normalize=s=>String(s).normalize('NFC').replace(/\u0301/g,'').replace(/[’‘]/g,"'").toLowerCase().replace(/ё/g,'е').replace(/[.!?,]/g,'').trim().replace(/\s+/g,' ');
 function blank(){return {unlocked:0,items:{},points:'0',awards:{},daily:{},completedLessons:[]};}
 function level(points){const xp=BigInt(points||0),threshold=l=>100n*l*(l-1n)/2n;let lo=1n,hi=2n;while(threshold(hi)<=xp){lo=hi;hi*=2n;}while(hi-lo>1n){const m=(hi+lo)/2n;if(threshold(m)<=xp)lo=m;else hi=m;}return {level:lo.toString(),points:xp.toString(),into:(xp-threshold(lo)).toString(),needed:(100n*lo).toString(),remaining:(threshold(lo+1n)-xp).toString(),percent:Number((xp-threshold(lo))*10000n/(100n*lo))/100};}
 function stats(state,now){return state.daily[day(now)]||{attempts:0,correct:0,successIds:[],spacedIds:[],challenges:[]};}
 function unlock(state,curriculum){while(state.unlocked<curriculum.lessons.length&&curriculum.lessons[state.unlocked].items.every(w=>state.items[w.id]?.successes>=1))state.unlocked++;return state;}
 function answer(state,curriculum,id,answerText,now=Date.now(),assisted=false){
  unlock(state,curriculum);const item=curriculum.lessons.flatMap(l=>l.items).find(w=>w.id===id);if(!item||item.lesson>state.unlocked)throw Error('Finish the earlier lesson reviews first.');
  const correct=normalize(answerText)===normalize(item.ru);if(assisted)return {correct,assisted:true,earned:0,state};
  const date=day(now),daily=state.daily[date] ||= {attempts:0,correct:0,successIds:[],spacedIds:[],challenges:[]};daily.attempts++;if(correct)daily.correct++;
  const p=state.items[id] ||= {successes:0,lastSuccess:null,due:0,interval:0,attempts:0,mistakes:0};p.attempts++;let earned=0;
  const award=(key,points)=>{if(state.awards[key])return;state.awards[key]=true;earned+=points;state.points=(BigInt(state.points)+BigInt(points)).toString();};
  if(correct){const spaced=p.lastSuccess!==null&&day(p.lastSuccess)!==date&&now-p.lastSuccess>=20*3600000;if(p.lastSuccess===null||spaced){p.successes++;p.interval=p.successes<2?1:Math.min(30,2**Math.min(p.successes-1,5));p.lastSuccess=now;p.due=now+p.interval*DAY;}
   if(!daily.successIds.includes(id)){daily.successIds.push(id);award(`recall:${id}:${date}`,5);}if(spaced&&!daily.spacedIds.includes(id))daily.spacedIds.push(id);
   const lesson=curriculum.lessons[item.lesson];if(lesson.items.every(w=>state.items[w.id]?.successes>=1)&&!state.completedLessons.includes(lesson.id)){state.completedLessons.push(lesson.id);award('lesson:'+lesson.id,50);}
   if(item.lesson===state.unlocked&&lesson.items.every(w=>state.items[w.id]?.successes>=1))state.unlocked=Math.min(curriculum.lessons.length,state.unlocked+1);
  }else{p.mistakes++;p.successes=0;p.lastSuccess=null;p.interval=0;p.due=now+10*60000;}
  if(daily.successIds.length>=5)award('daily-practice:'+date,20);
  for(const [id,done] of [['vocabulary',daily.successIds.length>=10],['accuracy',daily.successIds.length>=5&&daily.correct*100>=daily.attempts*80],['memory',daily.spacedIds.length>=5]])if(done&&!daily.challenges.includes(id)){daily.challenges.push(id);award('challenge:'+id+':'+date,25);}
  return {correct,assisted:false,earned,state};
 }
 const api={DAY,day,normalize,blank,level,stats,answer,unlock};if(typeof module!=='undefined')module.exports=api;else root.GlossixLearning=api;
})(typeof window!=='undefined'?window:globalThis);
