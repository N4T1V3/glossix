import pathlib,json,csv,collections
b=pathlib.Path('outputs/lingua');file=b/'russian-word-review.json';d=json.loads(file.read_text(encoding='utf8'));f=b/'app/data/dictionary.js';a=json.loads(f.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));byid={w['id']:w for w in a};index={w['ru'].lower():w for w in a if w['translated']}
fixes={
 'адзін':('one (Belarusian, not a Russian headword)','Names and places'),
 'бечь':('to run; obsolete or dialectal form of бежать','Processes and actions'),
 'въяве':('in reality; while awake; openly (archaic)','Other meanings to review'),
 'долив':('topping up; adding more liquid','Processes and actions'),
 'воловий':('ox-related; of an ox','Nature and materials'),
 'литсотрудник':('literary or editorial staff member','Work and business'),
 'мавка':('a female forest or nature spirit in Ukrainian folklore','History and religion'),
 'ляшка':('a Polish woman (old-fashioned; may be derogatory)','People and occupations'),
 'лучемёт':('a fictional ray gun or beam weapon','Science and technology'),
 'напряжный':('stressful; taxing; awkward (colloquial)','Ideas and behaviour'),
 'отрисовка':('drawing or rendering, especially computer graphics','Science and technology'),
 'отрисовывать':('to draw or render an image','Science and technology'),
 'непротиворечиво':('consistently; without contradiction','Ideas and behaviour'),
 'оптимистичность':('optimism; the quality of being optimistic','Ideas and behaviour'),
 'мешковидный':('sac-shaped; bag-shaped','Nature and materials'),
 'припухание':('swelling; becoming swollen','Everyday life'),
 'репортёрский':('reporter-related; relating to journalism','Work and business'),
 'ролевик':('a role-player; a participant in role-playing games','People and occupations'),
 'ржачка':('something very funny; laughter (slang)','Ideas and behaviour'),
 'сервак':('a server (computer/gaming slang)','Science and technology'),
 'пионербол':('a volleyball-like ball game for children, using catches and throws','Everyday life'),
 'строковой':('string-related (computing); relating to a line of text','Science and technology'),
 'физичка':('a female physics teacher (colloquial)','People and occupations'),
 'читабельность':('readability; legibility','Everyday life'),
 'квантованный':('quantized; restricted to discrete values','Science and technology'),
 'полосчатый':('striped; banded','Nature and materials'),
 'удобренный':('fertilized; supplied with fertilizer','Nature and materials'),
 'флейтовый':('flute-related; relating to a flute','Everyday life'),
 'шашлычник':('a person who prepares or sells shashlik (grilled meat)','People and occupations'),
 'завкафедрой':('head of an academic department','Work and business'),
 'взасос':('deeply or passionately, especially of kissing (colloquial)','Everyday life'),
 'во весь опор':('at full speed; as fast as possible','Processes and actions'),
 'дальнейшее':('what follows; further developments','Everyday life'),
 'заживление':('healing, especially of a wound','Everyday life'),
 'затруднение':('difficulty; complication; a predicament','Everyday life'),
 'и пр.':('and so on; etc. (abbreviation of и прочее)','Everyday life'),
 'интим':('intimacy; intimate or sexual matters (colloquial)','Everyday life'),
 'инфраструктурный':('infrastructure-related','Work and business'),
 'католичество':('Catholicism','History and religion'),
 'китовый':('whale-related; of a whale','Nature and materials'),
 'классификационный':('classification-related','Science and technology'),
 'грабительский':('predatory; robbery-like; exploitative','Ideas and behaviour'),
 'долговечный':('long-lasting; durable','Everyday life'),
 'вентиляционный':('ventilation-related','Everyday life'),
 'возрастать':('to increase; to grow','Processes and actions'),
 'возрасти':('to increase; to rise','Processes and actions'),
 'жанровый':('genre-related','Language and grammar'),
 'карстовый':('karst-related; involving limestone erosion and underground drainage','Nature and materials'),
 'категорический':('categorical; emphatic; unconditional','Ideas and behaviour'),
 'казачий':('Cossack-related; of the Cossacks','History and religion'),
 'голосующий':('voting; a person who is voting','Politics and society'),
 'верящий':('believing; a person who believes','Ideas and behaviour'),
 'города-мама':('No reliable interpretation yet','Other meanings to review'),
 'больше нег':('No reliable interpretation yet — apparently truncated source text','Other meanings to review')}
protect={'отрисовка','отрисовывать','непротиворечиво','оптимистичность','мешковидный','припухание','репортёрский','ролевик','ржачка','сервак','читабельность','квантованный','полосчатый','удобренный','флейтовый','шашлычник','строковой'}
variants={'бечь':'бежать','заслуженый':'заслуженный','видить':'видеть','беспокоица':'беспокоиться'}
for row in d['entries']:
 w=byid[row['id']];term=row['word']
 if term in fixes:
  row['proposedMeaning'],row['topic']=fixes[term];row['meaningStatus']='Glossix interpretation; review required'
 if term in protect:
  row['action']='Keep for meaning review';row['reason']='Useful domain or everyday vocabulary; sparse headword frequency is insufficient to remove it.'
 if term in variants and variants[term] in index:
  alt=index[variants[term]];row.update(action='Archive variant',alternative=alt['ru'],alternativeMeaning=alt['en'],reason='Older/regional form or apparent spelling error; canonical translated entry is available.');w['replacementId']=alt['id']
 if term=='адзін':
  alt=index.get('один');row.update(action='Archive non-Russian entry',alternative='один',alternativeMeaning=alt['en'] if alt else 'one',reason='Wiktionary identifies this headword as Belarusian.');w['replacementId']=alt['id'] if alt else None;row['sourceUrl']='https://en.wiktionary.org/wiki/адзін'
 if row['action'].startswith('Archive'):w['dictionaryExcluded']=True;w['exclusionReason']=row['reason']
 else:
  w.pop('dictionaryExcluded',None);w.pop('exclusionReason',None);w.pop('replacementId',None)
 w['reviewMeaning']=row['proposedMeaning'];w['reviewMeaningMethod']=row['meaningStatus'];w['reviewTopic']=row['topic']
d['summary']['actions']=dict(collections.Counter(x['action'] for x in d['entries']));d['summary']['glossixInterpretations']=sum(x['meaningStatus'].startswith('Glossix') or x['meaningStatus'].startswith('Interpretation drafted') for x in d['entries']);d['summary']['remainingEntries']=sum(not x['action'].startswith('Archive') for x in d['entries']);file.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
with (b/'Russian-word-review.csv').open('w',encoding='utf-8-sig',newline='') as h:
 c=csv.DictWriter(h,fieldnames=list(d['entries'][0]));c.writeheader();c.writerows(d['entries'])
archived=[w for w in a if w.get('dictionaryExcluded')];(b/'Removed-Russian-entries-archive.json').write_text(json.dumps(archived,ensure_ascii=False,indent=2),encoding='utf8');f.write_text('window.RUSSIAN_DICTIONARY='+json.dumps(a,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print(json.dumps(d['summary']))
