const score=value=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(100,value)):null;
function feedback(data){
 if(data.RecognitionStatus!=='Success'||!data.NBest?.length)throw new Error('No clear speech was detected. Check your microphone, listen to the example, and try again.');
 if(typeof data.SNR==='number'&&data.SNR<5)throw new Error('The recording has too much background noise to assess reliably. Move somewhere quieter and try again.');
 const best=data.NBest[0],assessment=best.PronunciationAssessment||best;
 const accuracy=score(assessment.AccuracyScore),overall=score(assessment.PronScore)??accuracy;
 if(accuracy===null||overall===null)throw new Error('The service returned a transcript without pronunciation scores. Please try again.');
 const words=(best.Words||[]).map(w=>{const a=w.PronunciationAssessment||w;return {word:String(w.Word||'').slice(0,100),accuracy:score(a.AccuracyScore),error:String(a.ErrorType||'None'),sounds:(w.Phonemes||[]).map((p,i)=>({position:i+1,label:typeof p.Phoneme==='string'?p.Phoneme:null,accuracy:score((p.PronunciationAssessment||p).AccuracyScore)})).filter(p=>p.accuracy!==null&&p.accuracy<70)}});
 const issues=[];
 for(const w of words){if(w.error==='Omission')issues.push({word:w.word,reason:'This word was not detected. Say the complete word or phrase and try again.'});else if(w.error==='Insertion')issues.push({word:w.word,reason:'An extra word was detected. Say only the word or phrase shown above.'});else if(w.error==='Mispronunciation'||w.sounds.length||(w.accuracy!==null&&w.accuracy<70))issues.push({word:w.word,reason:w.sounds.length?`Sounds at position${w.sounds.length>1?'s':''} ${w.sounds.map(p=>p.position).join(', ')} scored below the practice target. Listen to the example and practise this word slowly.`:'The sounds in this word scored below the practice target. Listen to the example and compare your recording. The service did not identify a more specific cause.'});}
 const completeness=score(assessment.CompletenessScore);
 if(completeness!==null&&completeness<90&&!issues.some(i=>i.reason.startsWith('This word')))issues.push({word:'Phrase completeness',reason:'Part of the expected phrase may be missing. Say the whole phrase, without adding words.'});
 const passed=overall>=80&&accuracy>=80&&(completeness===null||completeness>=90)&&!issues.length;
 if(!passed&&!issues.length)issues.push({word:'Overall pronunciation',reason:'Your pronunciation is below the practice target of 80/100. Listen to the example and repeat more clearly. The service did not identify a specific sound error.'});
 return {passed,overall:Math.round(overall),accuracy:Math.round(accuracy),fluency:score(assessment.FluencyScore),completeness,transcript:String(best.Display||data.DisplayText||'').slice(0,2000),words,issues};
}
function validateWav(value){
 if(!(value instanceof Uint8Array)&&!Buffer.isBuffer(value))throw new Error('Please record a new attempt.');
 const wav=Buffer.from(value);if(wav.length<8044||wav.length>960044||wav.toString('ascii',0,4)!=='RIFF'||wav.toString('ascii',8,12)!=='WAVE'||wav.toString('ascii',12,16)!=='fmt '||wav.readUInt32LE(16)!==16||wav.readUInt16LE(20)!==1||wav.readUInt16LE(22)!==1||wav.readUInt32LE(24)!==16000||wav.readUInt32LE(28)!==32000||wav.readUInt16LE(32)!==2||wav.readUInt16LE(34)!==16||wav.toString('ascii',36,40)!=='data'||wav.readUInt32LE(40)!==wav.length-44||wav.readUInt32LE(4)!==wav.length-8||(wav.length-44)%2)throw new Error('The recording must be a 0.25–30 second mono PCM recording. Please try again.');
 return wav;
}
function createAssessor({env=process.env,fetchImpl=fetch}={}){
 return {status:()=>({configured:!!(env.AZURE_SPEECH_KEY&&env.AZURE_SPEECH_REGION)}),assess:async payload=>{
  if(!env.AZURE_SPEECH_KEY||!env.AZURE_SPEECH_REGION)throw new Error('Pronunciation scoring is not connected. Configure AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, then restart Glossix.');
  const region=env.AZURE_SPEECH_REGION;if(!/^[a-z][a-z0-9]{1,40}$/.test(region))throw new Error('The Azure Speech region is invalid. Check your connection settings.');
  const reference=String(payload?.reference||'').trim();if(!reference||reference.length>400||!/[а-яё]/i.test(reference))throw new Error('Choose a Russian word or short phrase to practise.');
  const wav=validateWav(payload.audio);
  const config=Buffer.from(JSON.stringify({ReferenceText:reference,GradingSystem:'HundredMark',Granularity:'Phoneme',Dimension:'Comprehensive',EnableMiscue:true})).toString('base64');
  let response;try{response=await fetchImpl(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=ru-RU&format=detailed`,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':env.AZURE_SPEECH_KEY,'Pronunciation-Assessment':config,'Content-Type':'audio/wav; codecs=audio/pcm; samplerate=16000',Accept:'application/json'},body:wav,signal:AbortSignal.timeout(30000)});}catch{throw new Error('Could not reach the pronunciation service. Check your internet connection and try this recording again.');}
  if(!response.ok)throw new Error(response.status===401||response.status===403?'The pronunciation connection was rejected. Check your Azure Speech key and region.':response.status===429?'Pronunciation assessment is temporarily busy or its quota is exhausted. Try again shortly.':`Pronunciation assessment failed (${response.status}). Your recording can be retried.`);
  let data;try{data=await response.json()}catch{throw new Error('The pronunciation service returned an unreadable result. Please try again.');}return feedback(data);
 }};
}
module.exports={createAssessor,feedback,validateWav};
