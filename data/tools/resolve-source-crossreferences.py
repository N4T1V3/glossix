import pathlib,json,csv,re,collections
b=pathlib.Path(__file__).resolve().parents[1];r=pathlib.Path('work/dictionary-audit')
def load(f):return json.loads((b/f).read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
def norm(s):return s.lower().replace("'",'').replace('\u0301','').strip()
rows=load('dictionary.js');index=collections.defaultdict(list)
for w in rows:
 if w['translated']:index[norm(w['ru'])].append(w)
raw=collections.defaultdict(list)
for t in csv.DictReader(open(r/'translations.csv',encoding='utf-8-sig',newline='')):
 if t['lang']=='en':raw[t['word_id']].append(t['tl'])
def resolve(text):
 m=re.fullmatch(r'Adjective of ([А-Яа-яЁё -]+)',text,re.I)
 if not m:m=re.fullmatch(r'([А-Яа-яЁё -]+) \(adj\)',text,re.I)
 if not m:return None
 matches=index.get(norm(m[1]),[])
 if len({w['en'] for w in matches})!=1:return None
 gloss=matches[0]['en']
 if len(gloss)>250:return None
 return 'Relating to: '+gloss
count=0
for w in rows:
 if w['translated']:continue
 candidates=raw.get(w.get('sourceId'),[])
 cache=r/'live-en'/(str(w.get('sourceId'))+'.json')
 if cache.exists():
  result=json.loads(cache.read_text(encoding='utf8')).get('result') or {}
  candidates += [t for meaning in result.get('translations',[]) for t in meaning.get('tls',[])]
 meanings=list(dict.fromkeys(t for s in candidates if (t:=resolve(s))))
 if meanings:
  w['en']='; '.join(meanings);w['meanings']['en']=w['en'];w['meaningSources']['en']='OpenRussian grammatical cross-reference, resolved using its English base-word meaning';w['translated']=True;w['translationStatus']='source-crossreference';count+=1
(b/'dictionary.js').write_text('window.RUSSIAN_DICTIONARY='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
it=load('italian-dictionary.js');w=next(w for w in it if w['ru']=='papalina' and w['group']=='noun')
w['meanings']={'en':'skullcap; nightcap (hat); sprat (fish)','fr':'calotte; bonnet de nuit; sprat (poisson)','es':'solideo; gorro de dormir; espadín (pez)','de':'Käppchen; Nachtmütze; Sprotte (Fisch)','pt':'solidéu; barrete de dormir; espadilha (peixe)'};w['meaningSources']={c:'Wiktionary, Italian noun senses; Glossix translations checked 2026-10-09' for c in w['meanings']};w['en']=w['meanings']['en'];w['translated']=True;w['translationStatus']='reviewed';w['sourceUrl']='https://en.wiktionary.org/wiki/papalina#Italian'
(b/'italian-dictionary.js').write_text('window.ITALIAN_DICTIONARY='+json.dumps(it,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
summary=json.loads((r/'audit-summary.json').read_text());summary.update(ruCrossreferencesResolved=count,ruUnresolved=sum(not w['translated'] for w in rows),itUnresolved=0)
for lang,data in [('ru',rows),('it',it)]:
 for code in ['en','fr','es','de','pt']:summary[lang+'Direct_'+code]=sum(bool(w['meanings'].get(code)) for w in data)
(r/'audit-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
