(function(root){
 const key=s=>String(s).normalize('NFC').toLocaleLowerCase().trim().replace(/[.!?]/g,'');
 function pool(words){const a=new Set(),b=new Set();return words.filter(w=>{if(!w.ru||!w.en||w.translated===false)return false;const x=key(w.ru),y=key(w.en);if(a.has(x)||b.has(y)||x===y)return false;a.add(x);b.add(y);return true;});}
 function shuffle(a,random=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function create(words,random=Math.random){const selected=shuffle(pool(words),random).slice(0,10);if(selected.length!==10)throw Error('Learn at least 10 different words in this category first.');return {words:selected,remaining:new Set(selected.map(w=>w.id)),correct:[],failed:[],attempts:[],mistakes:0};}
 function match(state,a,b){if(a.side===b.side||!state.remaining.has(a.id)||!state.remaining.has(b.id))return null;const correct=a.id===b.id,ids=[...new Set([a.id,b.id])];state.attempts.push({a:a.id,b:b.id});for(const id of ids){state.remaining.delete(id);(correct?state.correct:state.failed).push(id);}if(!correct)state.mistakes++;return {correct,ids,done:state.remaining.size===0,points:state.correct.length*2};}
 const api={pool,shuffle,create,match};if(typeof module!=='undefined')module.exports=api;else root.GlossixPairs=api;
})(typeof window!=='undefined'?window:globalThis);
