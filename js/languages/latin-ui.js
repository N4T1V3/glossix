// Latin macrons are optional in written recall; other languages are unchanged.
document.addEventListener('submit',e=>{if(activeLanguage!=='la'||!['learning-answer-form','spelling-form','learned-conversation-form'].includes(e.target.id))return;const input=e.target.querySelector('input');if(input)input.value=input.value.normalize('NFD').replace(/\u0304/g,'').normalize('NFC');},true);
