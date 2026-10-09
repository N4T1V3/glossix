import urllib.request,pathlib,concurrent.futures,re
root=pathlib.Path('work/dictionary-audit');root.mkdir(exist_ok=True)
def get(pair):
 url='https://download.wikdict.com/dictionaries/stardict/wikdict-'+pair+'.zip'
 dest=root/(pair+'.zip')
 if not dest.exists():dest.write_bytes(urllib.request.urlopen(url,timeout=60).read())
 print(pair,dest.stat().st_size,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for result in pool.map(get,[a+'-'+b for a in ['ru','it'] for b in ['en','fr','es','de','pt']]):pass
