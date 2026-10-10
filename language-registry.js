// Course assets must be registered explicitly. Never substitute another language.
window.GlossixLanguages = (() => {
  const catalog = Object.freeze({
    ru: {name:'Russian',native:'Русский',locale:'ru-RU',direction:'ltr',status:'available'},
    it: {name:'Italian',native:'Italiano',locale:'it-IT',direction:'ltr',status:'available'},
    es: {name:'Spanish',native:'Español',locale:'es-ES',direction:'ltr',status:'preview',priority:1},
    fr: {name:'French',native:'Français',locale:'fr-FR',direction:'ltr',status:'preview'},
    zh: {name:'Mandarin Chinese',native:'普通话',locale:'zh-CN',direction:'ltr',status:'preview',script:'Simplified Chinese'},
    de: {name:'German',native:'Deutsch',locale:'de-DE',direction:'ltr',status:'preview'},
    ko: {name:'Korean',native:'한국어',locale:'ko-KR',direction:'ltr',status:'preview'},
    ar: {name:'Modern Standard Arabic',native:'العربية الفصحى',locale:'ar',direction:'rtl',status:'planned'},
    'ar-eg': {name:'Egyptian Arabic',native:'العربية المصرية',locale:'ar-EG',direction:'rtl',status:'planned'},
    'ar-levant': {name:'Levantine Arabic',native:'العربية الشامية',locale:'ar',direction:'rtl',status:'planned'},
    'ar-gulf': {name:'Gulf Arabic',native:'العربية الخليجية',locale:'ar',direction:'rtl',status:'planned'},
    'pt-br': {name:'Brazilian Portuguese',native:'Português brasileiro',locale:'pt-BR',direction:'ltr',status:'planned'},
    'pt-pt': {name:'European Portuguese',native:'Português europeu',locale:'pt-PT',direction:'ltr',status:'planned'},
    ja: {name:'Japanese',native:'日本語',locale:'ja-JP',direction:'ltr',status:'planned'},
    hi: {name:'Hindi',native:'हिन्दी',locale:'hi-IN',direction:'ltr',status:'planned'}
  });
  Object.values(catalog).forEach(Object.freeze);
  const assets = new Map();
  function register(code, pack) {
    if (!catalog[code]) throw Error('Unknown learning language: '+code);
    if (assets.has(code)) throw Error('Language already registered: '+code);
    if (!pack.course?.words?.length || !pack.course?.letters?.length ||
        !pack.curriculum?.lessons?.length || pack.curriculum.language!==code ||
        typeof pack.dictionary!=='function' || !pack.dictionaryPath || !pack.visuals ||
        !pack.alphabet?.title || !pack.alphabet?.description || !pack.alphabet?.icon) {
      throw Error('Incomplete learning language: '+code);
    }
    assets.set(code,Object.freeze(pack));
  }
  function get(code) {
    const pack=assets.get(code);
    if (!pack) throw Error('Learning language is not ready: '+code);
    return pack;
  }
  return Object.freeze({catalog,register,get,has:code=>assets.has(code),available:()=>[...assets.keys()]});
})();
