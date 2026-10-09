import pathlib,json,urllib.request,urllib.parse,re,concurrent.futures,collections
b=pathlib.Path(__file__).resolve().parents[1];r=pathlib.Path('work/dictionary-audit');f=b/'dictionary.js';a=json.loads(f.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));root=r/'live-pages';root.mkdir(exist_ok=True)
def norm(s):return s.lower().replace("'",'').replace('\u0301','').strip()
candidates=[w for w in a if not w['translated'] and (not w.get('sourceId') or not (r/'live-en'/(w['sourceId']+'.json')).exists())]
def recover(w):
 dest=root/(w['id']+'.json')
 try:
  if dest.exists():words=json.loads(dest.read_text(encoding='utf8'))
  else:
   s=urllib.request.urlopen('https://en.openrussian.org/ru/'+urllib.parse.quote(w['ru']),timeout=25).read().decode()
   m=re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',s);words=json.loads(m[1])['props']['pageProps']['info'].get('words',[])
   words=[{'bare':x['bare'],'type':x.get('type'),'translations':x.get('translations',[])} for x in words];dest.write_text(json.dumps(words,ensure_ascii=False),encoding='utf8')
  matches=[x for x in words if norm(x['bare'])==norm(w['ru']) and (x.get('type')==w['group'] or w['group']=='other')]
  tls=list(dict.fromkeys(t for x in matches for m in x['translations'] for t in m['tls'] if t.strip() and not re.search('[А-Яа-яЁё]',t)))
  if tls:
   w['en']='; '.join(tls);w['meanings']['en']=w['en'];w['meaningSources']['en']='OpenRussian live word page, checked 2026-10-09';w['translated']=True;w['translationStatus']='source';return True
 except Exception:pass
 return False
print('Retrying',len(candidates),'stale/missing source IDs by word page',flush=True)
count=0
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as p:
 for i,ok in enumerate(p.map(recover,candidates),1):
  count+=bool(ok)
  if i%50==0:print('Page check',i,'recovered',count,flush=True)
f.write_text('window.RUSSIAN_DICTIONARY='+json.dumps(a,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
d=json.loads((r/'audit-summary.json').read_text());d.update(livePageRecovered=count,ruUnresolved=sum(not w['translated'] for w in a),ruDirect_en=sum(bool(w['meanings'].get('en')) for w in a));(r/'audit-summary.json').write_text(json.dumps(d,indent=2));print(json.dumps(d),flush=True)
