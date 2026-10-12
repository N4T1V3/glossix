GlossixLanguages.register('ru',{
  course:COURSES.ru,curriculum:RUSSIAN_CURRICULUM,visuals:RUSSIAN_VISUALS,
  dictionary:()=>window.RUSSIAN_DICTIONARY||[],dictionaryPath:'data/dictionary.js?v=0.2.53.40',
  alphabet:{icon:'Д',title:'Cyrillic letters',description:'Get to know the 33 letters of Russian.'}
});
GlossixLanguages.register('it',{
  course:COURSES.it,curriculum:ITALIAN_CURRICULUM,visuals:ITALIAN_VISUALS,
  dictionary:()=>window.ITALIAN_DICTIONARY||[],dictionaryPath:'data/italian-dictionary.js?v=0.2.53.40',
  alphabet:{icon:'A',title:'Italian letters',description:'Learn Italian letter names, accents and sounds.'}
});

GlossixLanguages.register('es',{
  course:COURSES.es,curriculum:SPANISH_CURRICULUM,visuals:SPANISH_VISUALS,
  dictionary:()=>window.SPANISH_DICTIONARY||[],dictionaryPath:'data/spanish-dictionary.js?v=0.2.53.40',
  alphabet:{icon:'Ñ',title:'Spanish letters',description:'Learn the 27 Spanish letters, accents and regional sounds.'}
});

GlossixLanguages.register('fr',{
 course:COURSES.fr,curriculum:FRENCH_CURRICULUM,visuals:FRENCH_VISUALS,
 dictionary:()=>window.FRENCH_DICTIONARY||[],dictionaryPath:'data/french-dictionary.js?v=0.2.53.40',
 alphabet:{icon:'Ç',title:'French letters',description:'Learn French letters, accents, elision and pronunciation.'}
});

GlossixLanguages.register('de',{course:COURSES.de,curriculum:GERMAN_CURRICULUM,visuals:GERMAN_VISUALS,dictionary:()=>window.GERMAN_DICTIONARY||[],dictionaryPath:'data/german-dictionary.js?v=0.2.53.40',alphabet:{icon:'Ä',title:'German letters',description:'Learn German letter names, umlauts, ß and sounds.'}});





GlossixLanguages.register("pt-br",{course:COURSES["pt-br"],curriculum:PORTUGUESE_BR_CURRICULUM,visuals:PORTUGUESE_BR_VISUALS,dictionary:()=> (window.PORTUGUESE_DICTIONARY||[]).map(w=>({...w,id:"pt-br-"+w.id,language:"pt-br"})),dictionaryPath:"data/portuguese-dictionary.js?v=0.2.53.43",alphabet:{icon:"Ã",title:"Portuguese letters",description:"Learn the alphabet, accents and nasal vowels."}});

GlossixLanguages.register("pt-pt",{course:COURSES["pt-pt"],curriculum:PORTUGUESE_PT_CURRICULUM,visuals:PORTUGUESE_PT_VISUALS,dictionary:()=> (window.PORTUGUESE_DICTIONARY||[]).map(w=>({...w,id:"pt-pt-"+w.id,language:"pt-pt"})),dictionaryPath:"data/portuguese-dictionary.js?v=0.2.53.43",alphabet:{icon:"Ã",title:"Portuguese letters",description:"Learn the alphabet, accents and nasal vowels."}});
