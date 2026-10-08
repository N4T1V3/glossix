import csv,json,pathlib,re
target=pathlib.Path(__file__).resolve().parent
mapping={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'ye','ё':'yo','ж':'zh','з':'z','и':'ee','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'oo','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'}
def hint(accented):
    s=accented.lower();result=[]
    for i,ch in enumerate(s):
        if ch in "'\u0301":continue
        sound=mapping.get(ch,ch)
        if ch=='ё' or (i+1<len(s) and s[i+1] in "'\u0301"):sound=sound.upper()
        result.append(sound)
    return ''.join(result)
entries={}
for filename,pos in [('nouns.csv','noun'),('verbs.csv','verb'),('adjectives.csv','adjective'),('others.csv','other')]:
    with pathlib.Path('work/dictionary',filename).open(encoding='utf8',newline='') as f:
        for row in csv.DictReader(f,delimiter='\t'):
            ru=row['bare'].replace("'",'').replace('\u0301','').strip();en=row['translations_en'].strip()
            if not ru or not en or not re.search('[а-яё]',ru,re.I):continue
            key=(ru.lower(),pos)
            if key in entries:
                if en not in entries[key]['en']:entries[key]['en']+='; '+en
                continue
            entries[key]=dict(id='dict-'+str(len(entries)+1),ru=ru,en=en,hint=hint(row['accented'] or ru),group=pos,source='OpenRussian')
words=sorted(entries.values(),key=lambda w:w['ru'].lower())
target.joinpath('dictionary.js').write_text('window.RUSSIAN_DICTIONARY='+json.dumps(words,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
target.joinpath('ATTRIBUTION.md').write_text('''# Russian dictionary data

Source: OpenRussian.org / Badestrand, https://github.com/Badestrand/russian-dictionary (CSV backup snapshot downloaded 8 October 2026).
Original sources acknowledged by OpenRussian include Wiktionary and community contributions. See https://en.openrussian.org/dictionary-data.

License: Creative Commons Attribution–ShareAlike 4.0 International, https://creativecommons.org/licenses/by-sa/4.0/. Full license included in OPENRUSSIAN-LICENSE.txt.

Adaptations by Glossix: selected Russian–English entries; combined repeated entries of the same word and part of speech; removed instructional stress markers from Russian display forms; added identifiers and approximate Latin letter guides. Modified dictionary.js data and the conversion script are provided under CC BY-SA 4.0. Dictionary translations are unreviewed imported reference content. The data snapshot is an older public backup, not the latest live OpenRussian database. No OpenRussian recordings were downloaded or bundled.

The Latin guide is transliteration with uppercase stressed vowels where source stress was available; it is not IPA or a precise phonetic transcription. Russian й and ё remain intact. This dictionary is large but is not every Russian word or every inflected form.
''',encoding='utf8')
print(f'{len(words)} dictionary entries')
