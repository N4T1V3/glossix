import pathlib,json,re,csv,zipfile,struct,html,unicodedata,collections,urllib.request,concurrent.futures,time
root=pathlib.Path('work/dictionary-audit');base=pathlib.Path(__file__).resolve().parents[1];codes=['en','fr','es','de','pt']
def load(name):return json.loads((base/name).read_text(encoding='utf8').split('=',1)[1].rstrip(';\r\n'))
def norm(s):return unicodedata.normalize('NFC',s).lower().replace("'",'').replace('\u0301','').strip()
def clean(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
def valid(s,code):return bool(s.strip()) and not re.search('[А-Яа-яЁё]',s) and not re.search(r'not supplied|translation unavailable|translation missing',s,re.I)
def wikdict(pair):
 z=zipfile.ZipFile(root/(pair+'.zip'));idx=z.read(next(n for n in z.namelist() if n.endswith('.idx')));data=z.read(next(n for n in z.namelist() if n.endswith('.dict')));pos=0;out={}
 while pos<len(idx):
  end=idx.index(0,pos);term=idx[pos:end].decode();offset,size=struct.unpack('>II',idx[end+1:end+9]);pos=end+9;s=data[offset:offset+size].decode()
  meanings=list(dict.fromkeys(clean(t) for t in re.findall(r'<div>([^<>]+)</div>',s) if clean(t)))
  grammar=clean(re.search(r'class="grammar"[^>]*>([^<]+)',s)[1]) if re.search(r'class="grammar"[^>]*>([^<]+)',s) else 'other'
  if meanings:out.setdefault(norm(term),[]).append({'group':grammar,'text':'; '.join(meanings)})
 return out
maps={lang:{code:wikdict(lang+'-'+code) for code in codes} for lang in ['ru','it']}
ru=load('dictionary.js');it=load('italian-dictionary.js')
words=list(csv.DictReader(open(root/'words.csv',encoding='utf-8-sig',newline='')))
tls=collections.defaultdict(lambda:collections.defaultdict(list))
for r in csv.DictReader(open(root/'translations.csv',encoding='utf-8-sig',newline='')):
 if r['lang'] in codes and valid(r['tl'],r['lang']):tls[r['word_id']][r['lang']].append((int(r['position'] or 0),r['tl']))
wordkeys=collections.defaultdict(list)
for r in words:wordkeys[(norm(r['bare']),r['type'] or 'other')].append(r)
def direct(lang,code,w):
 matches=maps[lang][code].get(norm(w['ru']),[])
 exact=[r for r in matches if r['group']==w['group']]
 # Do not attach a noun sense to a verb/adjective homograph.
 chosen=exact or (matches if len({r['group'] for r in matches})<=1 and (w['group'] in ['other','Reference'] or not matches or matches[0]['group']==w['group']) else [])
 return '; '.join(dict.fromkeys(r['text'] for r in chosen if valid(r['text'],code)))
pending=[];stats=collections.Counter()
for w in ru:
 original=w['en'];w['meanings']={};w['meaningSources']={}
 for code in codes:
  texts=[t for r in wordkeys[(norm(w['ru']),w['group'])] for _,t in sorted(tls[r['id']][code])]
  meaning='; '.join(dict.fromkeys(texts))
  if meaning:w['meanings'][code]=meaning;w['meaningSources'][code]='OpenRussian export'
  elif direct('ru',code,w):w['meanings'][code]=direct('ru',code,w);w['meaningSources'][code]='WikDict / Wiktionary'
 if not w['meanings'].get('en') and valid(original,'en'):w['meanings']['en']=original;w['meaningSources']['en']='OpenRussian previous export'
 if not valid(original,'en') or not w['meanings'].get('en'):pending.append(w)
cache=root/'live-en';cache.mkdir(exist_ok=True)
def recover(w):
 candidates=wordkeys.get((norm(w['ru']),w['group'])) or [r for r in words if norm(r['bare'])==norm(w['ru'])]
 key=w.get('sourceId') or (candidates[0].get('id') if candidates else None)
 if not key:return None
 file=cache/(str(key)+'.json')
 try:
  if file.exists():d=json.loads(file.read_text(encoding='utf8'))
  else:
   url='https://en.openrussian.org/_api/api/words/'+str(key)+'?lang=en'
   d=json.load(urllib.request.urlopen(url,timeout=25));file.write_text(json.dumps(d,ensure_ascii=False),encoding='utf8')
  result=d.get('result') or {}
  if norm(result.get('bare',''))!=norm(w['ru']):return None
  text='; '.join(dict.fromkeys(t for r in result.get('translations',[]) for t in r.get('tls',[]) if valid(t,'en')))
  if text:w['meanings']['en']=text;w['meaningSources']['en']='OpenRussian live, checked 2026-10-09';return True
 except Exception as e:stats['fetchErrors']+=1
 return False
print('Checking live meanings for',len(pending),'incomplete/mixed-language Russian entries',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,result in enumerate(pool.map(recover,pending),1):
  stats['liveRecovered']+=bool(result)
  if i%100==0:print('Live check',i,'/',len(pending),'recovered',stats['liveRecovered'],flush=True)
for w in it:
 old=w['en'];w['meanings']={};w['meaningSources']={}
 for code in codes:
  text=direct('it',code,w)
  if text:w['meanings'][code]=text;w['meaningSources'][code]='WikDict / Wiktionary'
 if not w['meanings'].get('en') and valid(old,'en'):w['meanings']['en']=old;w['meaningSources']['en']='WikDict previous import'
for lang,rows,file,var in [('ru',ru,'dictionary.js','RUSSIAN_DICTIONARY'),('it',it,'italian-dictionary.js','ITALIAN_DICTIONARY')]:
 for w in rows:
  w['en']=w['meanings'].get('en','Translation unavailable — check the source');w['translated']=bool(w['meanings'].get('en'))
  w['translationStatus']='source' if w['translated'] else 'unresolved'
 (base/file).write_text('window.'+var+'='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
 stats[lang+'Entries']=len(rows);stats[lang+'Unresolved']=sum(not w['translated'] for w in rows)
 for code in codes:stats[lang+'Direct_'+code]=sum(bool(w['meanings'].get(code)) for w in rows)
(root/'audit-summary.json').write_text(json.dumps(stats,indent=2),encoding='utf8');print(json.dumps(stats),flush=True)
