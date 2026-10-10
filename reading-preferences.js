const READING_MODE_KEY='glossix-reading-friendly-v1';
function applyReadingMode(enabled){document.documentElement.classList.toggle('reading-friendly',enabled);const toggle=document.querySelector('#reading-friendly-toggle');if(toggle)toggle.checked=enabled;}
try{applyReadingMode(localStorage.getItem(READING_MODE_KEY)==='true');}catch{applyReadingMode(false);}
document.addEventListener('change',e=>{if(e.target.id!=='reading-friendly-toggle')return;const enabled=e.target.checked;applyReadingMode(enabled);try{localStorage.setItem(READING_MODE_KEY,String(enabled));}catch{}const status=document.querySelector('#reading-friendly-status');if(status)status.textContent=enabled?'Reading-friendly mode is on.':'Reading-friendly mode is off.';});
window.addEventListener('storage',e=>{if(e.key===READING_MODE_KEY)applyReadingMode(e.newValue==='true');});
