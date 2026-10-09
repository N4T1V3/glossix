import pathlib,json,csv,re,sys,collections,time
sys.path[:0]=[str(pathlib.Path('work/frequency-runtime').resolve()),str(pathlib.Path('work/translation-runtime').resolve())]
from wordfreq import zipf_frequency
import ctranslate2,sentencepiece
r=pathlib.Path('work/dictionary-audit');b=pathlib.Path('outputs/lingua');f=b/'app/data/dictionary.js';a=json.loads(f.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));u=[w for w in a if not w['translated']];source={x['id']:x for x in csv.DictReader(open(r/'words.csv',encoding='utf-8-sig',newline=''))}
model=next(p for p in pathlib.Path('work/translation-models/ru-en').iterdir() if p.is_dir());sp=sentencepiece.SentencePieceProcessor(model_file=str(model/'sentencepiece.model'));t=ctranslate2.Translator(str(model/'model'),device='cpu',compute_type='int8',intra_threads=4)
cachefile=r/'interpreted-meanings.json';cache=json.loads(cachefile.read_text(encoding='utf8')) if cachefile.exists() else {};missing=list(dict.fromkeys(w['ru'] for w in u if w['ru'] not in cache))
for i in range(0,len(missing),64):
 batch=missing[i:i+64];result=t.translate_batch([sp.encode(s,out_type=str) for s in batch],beam_size=4,max_batch_size=64,max_decoding_length=60,no_repeat_ngram_size=3)
 for s,o in zip(batch,result):cache[s]=sp.decode(o.hypotheses[0]).replace('▁',' ').strip()
 cachefile.write_text(json.dumps(cache,ensure_ascii=False),encoding='utf8');print('Draft meanings',min(i+64,len(missing)),'/',len(missing),flush=True)
curated={
 'абсурдизация':('making something absurd; absurdization','Ideas and behaviour'),
 'адаптирование':('adaptation; the process of adapting','Processes and actions'),
 'ампераж':('amperage; electric current measured in amperes','Science and technology'),
 'анафорический':('anaphoric; referring back to an earlier word or phrase','Language and grammar'),
 'анафорный':('anaphoric; relating to anaphora','Language and grammar'),
 'антифашизм':('anti-fascism','Politics and society'),
 'апологетика':('apologetics; systematic defence of a doctrine or faith','History and religion'),
 'аргоновый':('argon-related; containing or using argon','Science and technology'),
 'аргументик':('a little argument; a diminutive or dismissive form of argument','Ideas and behaviour'),
 'арендный':('rental; lease-related','Everyday life'),
 'ассистентский':('assistant-related; relating to an assistant','People and occupations'),
 'атлетский':('athlete-related; athletic','People and occupations'),
 'аутсорсер':('an outsourcing provider; an outsourced contractor','Work and business'),
 'афро-американец':('an African American man','People and occupations'),
 'аффиксальный':('affixal; relating to affixes','Language and grammar'),
 'ахроматичный':('achromatic; without colour','Science and technology'),
 'аэрофотоизображение':('an aerial photographic image','Science and technology'),
 'бабайка':('a bogeyman; an imaginary frightening creature (colloquial)','People and occupations'),
 'бдить':('to keep watch; to stay vigilant (old-fashioned/colloquial)','Processes and actions'),
 'бегание':('running; the activity of running','Processes and actions'),
 'бегивать':('to run from time to time or habitually (old-fashioned)','Processes and actions'),
 'безинициативный':('lacking initiative; unenterprising','Ideas and behaviour'),
 'берёзовый':('birch-related; made of birch','Nature and materials'),
 'бесспиртовой':('alcohol-free; containing no alcohol','Everyday life'),
 'бесшёрстный':('hairless; without fur or wool','Nature and materials'),
 'бетонка':('a concrete road (colloquial)','Everyday life'),
 'битность':('bit depth; the number of bits used to represent a value','Science and technology'),
 'бледно-красный':('pale red','Nature and materials'),
 'блейд-сервер':('a blade server','Science and technology'),
 'близнецовый':('twin-related; relating to twins','People and occupations'),
 'бобовый':('leguminous; relating to beans or legumes','Nature and materials'),
 'бозонный':('bosonic; relating to bosons','Science and technology'),
 'бомболюк':('a bomb-bay hatch','Science and technology'),
 'бомбосбрасыватель':('a bomb-release mechanism','Science and technology'),
 'брачующийся':('a person getting married; marrying','Everyday life')}
alternatives={'адаптирование':'адаптация','аргументик':'аргумент','атлетский':'атлетический','афро-американец':'афроамериканец','ахроматичный':'ахроматический','бегивать':'бегать','бесспиртовой':'безалкогольный'}
index=collections.defaultdict(list)
for w in a:
 if w['translated']:index[w['ru'].lower()].append(w)
def frequency(term):
 forms={term,term.replace('ё','е')}
 if term.endswith(('ый','ой')):
  root=term[:-2];forms.update(root+end for end in ['ая','ое','ые','ого','ому','ым','ыми','ую','ой'])
 elif term.endswith('ий'):
  root=term[:-2]
  ends=['ая','ое','ие','ого','ому','им','ими','ую','ой'] if root.endswith(('к','г','х')) else ['ая','ее','ие','его','ему','им','ими','ую','ей'] if root.endswith(('ж','ч','ш','щ')) else ['яя','ее','ие','его','ему','им','ими','юю','ей']
  forms.update(root+end for end in ends)
 values=[(zipf_frequency(s,'ru'),s) for s in forms];score,form=max(values)
 if score==0:form=term
 return score,form
def topic(word,meaning):
 if re.search('electric|chemical|physics|quantum|server|algorithm|protein|enzyme|molecule|mathemat|computer|optical|radiat|magnet|chromat|amper|boson|gluon|hydro|isotope|phonon',meaning,re.I):return 'Science and technology'
 if re.search('grammar|linguist|suffix|prefix|anaphor|affix|phonetic|syllab|pronoun',meaning,re.I):return 'Language and grammar'
 if re.search('religio|church|priest|bishop|monast|heres|ancient|histor|sect|theolog',meaning,re.I):return 'History and religion'
 if re.search('plant|animal|bird|tree|wood|fur|fish|birch|colour|color|red|blue|green',meaning,re.I):return 'Nature and materials'
 if re.search('name|surname|resident|inhabitant|citizen',meaning,re.I):return 'Names and places'
 return 'Other meanings to review'
rows=[];archived=[]
for w in u:
 term=w['ru'];score,form=frequency(term);record=source.get(w.get('sourceId'),{});rank=int(record['rank']) if record.get('rank','').isdigit() else None
 meaning,category=curated.get(term,(cache.get(term,''),''));method='Interpretation drafted by Glossix; review required' if term in curated else 'Offline machine interpretation; review required'
 if not meaning or re.search('[А-Яа-яЁё]',meaning) or re.sub('[^a-z]','',meaning.lower())==re.sub('[^a-z]','',term.lower()):meaning='No reliable interpretation yet';method='Needs manual lookup'
 # Do not let a translation model promote an invented name into a definition.
 if record.get('type')=='properName' or w['meanings'].get('de')=='Eigenname':meaning='Proper name; exact identity needs review';method='Source indicates a proper name'
 category=category or topic(term,meaning)
 alternative=alternatives.get(term);matches=index.get(alternative or '',[])
 if not matches:
  for spelling in [term.replace('ё','е'),term.replace('-','')]:
   if spelling!=term and index.get(spelling.lower()):alternative=spelling;matches=index[spelling.lower()];break
 alternative=alternative if matches else '';altmeaning=matches[0]['en'] if matches else '';altscore=frequency(alternative)[0] if alternative else None
 action='Keep for meaning review';reason='No sufficient evidence for automatic removal.'
 if alternative and (score==0 or altscore is not None and altscore>=score+.7):action='Archive variant';reason='Verified translated alternative is available; uncommon/duplicate variant.'
 elif 0<score<1.5 and rank and rank>=50000:action='Archive very rare entry';reason='Observed very low corpus frequency plus low OpenRussian rank.'
 elif score==0 and rank and rank>=50000:action='Removal candidate';reason='Not listed in wordfreq and low OpenRussian rank; absence alone does not prove rarity.'
 elif score>0 and score<2:action='Removal candidate';reason='Low observed frequency; inspect its usefulness before removing.'
 if term in ['берёзовый','арендный','антифашизм','бетонка','битность','бобовый','бесшёрстный','бегание','безинициативный'] and not alternative:action='Keep for meaning review';reason='Useful ordinary or domain vocabulary; do not remove merely because its imported meaning was missing.'
 if action.startswith('Archive'):
  w['dictionaryExcluded']=True;w['exclusionReason']=reason;w['replacementId']=matches[0]['id'] if matches else None;archived.append(w.copy())
 w['reviewMeaning']=meaning;w['reviewMeaningMethod']=method;w['reviewTopic']=category or 'Other meanings to review'
 rows.append({'id':w['id'],'word':term,'action':action,'proposedMeaning':meaning,'meaningStatus':method,'topic':w['reviewTopic'],'wordType':w['group'],'zipf':score,'frequencyForm':form,'sourceRank':rank,'alternative':alternative,'alternativeMeaning':altmeaning,'alternativeZipf':altscore,'reason':reason,'sourceMeaning':w['meanings'].get('de',''),'sourceUrl':'https://en.openrussian.org/ru/'+__import__('urllib.parse',fromlist=['quote']).quote(term)})
summary={'total':len(rows),'actions':dict(collections.Counter(x['action'] for x in rows)),'frequencySource':'wordfreq 3.1.1, data through approximately 2021','frequencyRule':'Zipf is estimated frequency, not a guarantee. Zero means absent from corpus, not never used. Adjective inflections and е/ё spellings are checked.','status':'Draft interpretations must be reviewed before becoming practice answers.'}
(b/'russian-word-review.json').write_text(json.dumps({'summary':summary,'entries':rows},ensure_ascii=False,indent=2),encoding='utf8')
with (b/'Russian-word-review.csv').open('w',encoding='utf-8-sig',newline='') as h:
 c=csv.DictWriter(h,fieldnames=list(rows[0]));c.writeheader();c.writerows(rows)
(b/'Removed-Russian-entries-archive.json').write_text(json.dumps(archived,ensure_ascii=False,indent=2),encoding='utf8')
f.write_text('window.RUSSIAN_DICTIONARY='+json.dumps(a,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps(summary),flush=True)
