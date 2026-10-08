import csv,json,pathlib,re,collections
base=pathlib.Path('outputs/lingua/app/data')
old=json.loads(base.joinpath('dictionary.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
oldmap={(w['ru'].lower(),w['group']):w for w in old}
mapping=dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя',['a','b','v','g','d','ye','yo','zh','z','ee','y','k','l','m','n','o','p','r','s','t','oo','f','kh','ts','ch','sh','shch','','y','','e','yu','ya']))
def guide(s):
 s=s.lower();out=[]
 for i,ch in enumerate(s):
  if ch in "'\u0301":continue
  x=mapping.get(ch,ch)
  if ch=='ё' or i+1<len(s) and s[i+1] in "'\u0301":x=x.upper()
  out.append(x)
 return ''.join(out)
translations=collections.defaultdict(list)
for r in csv.DictReader(open('work/translations-current.csv',encoding='utf-8-sig',newline='')):
 if r['lang']=='en' and r['tl'].strip():translations[r['word_id']].append((int(r['position'] or 0),r['tl'].strip()))
words=[];seen=set();missing=0
for r in csv.DictReader(open('work/words-current.csv',encoding='utf-8-sig',newline='')):
 ru=r['bare'].replace("'",'').replace('\u0301','').strip();pos=r['type'] or 'other';key=(ru.lower(),pos)
 if r['disabled']=='1' or not re.search('[а-яё]',ru,re.I) or key in seen:continue
 seen.add(key);tl=list(dict.fromkeys(t for _,t in sorted(translations[r['id']])))
 prior=oldmap.get(key);en='; '.join(tl) if tl else prior['en'] if prior else 'English translation not supplied in this source'
 if not tl and not prior:missing+=1
 words.append(dict(id=prior['id'] if prior else 'dict-open-'+r['id'],ru=ru,en=en,hint=guide(r['accented'] or ru),group=pos,source='OpenRussian',sourceId=r['id'],translated=bool(tl or prior)))
# Retain saved reference IDs and meanings from the previous snapshot.
ids={w['id'] for w in words}
for w in old:
 if w['id'] not in ids:words.append(w)
words.sort(key=lambda w:w['ru'].lower())
base.joinpath('dictionary.js').write_text('window.RUSSIAN_DICTIONARY='+json.dumps(words,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
meta=dict(entries=len(words),untranslated=missing,exportDate='2026-10-08',source='OpenRussian public database',courseEntries=742,visualScenes=50,guidedScenarios=62)
base.joinpath('content-meta.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
print(meta)
