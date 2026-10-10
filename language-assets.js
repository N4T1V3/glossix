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

GlossixLanguages.register('zh',{course:COURSES.zh,curriculum:CHINESE_CURRICULUM,visuals:CHINESE_VISUALS,dictionary:()=>window.CHINESE_DICTIONARY||[],dictionaryPath:'data/chinese-dictionary.js?v=0.2.53.40',alphabet:{icon:'字',title:'Characters & pinyin',description:'Read Simplified Chinese characters and practise tones with pinyin.'}});

GlossixLanguages.register('ko',{course:COURSES.ko,curriculum:KOREAN_CURRICULUM,visuals:KOREAN_VISUALS,dictionary:()=>window.KOREAN_DICTIONARY||[],dictionaryPath:'data/korean-dictionary.js?v=0.2.53.40',alphabet:{icon:'한',title:'Hangul & sounds',description:'Read Korean consonants, vowels and syllable blocks.'}});
