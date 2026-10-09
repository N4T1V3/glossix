import urllib.request,json,pathlib,concurrent.futures
root=pathlib.Path('work/dictionary-audit');base='https://worker.togetherdb.com'
def get(table):
 url=base+'/connections/fwoedz5fvtwvq03v/databases/openrussian_public/tables/'+table+'/export?format=csv&separator=%2C'
 d=json.load(urllib.request.urlopen(urllib.request.Request(url,data=b'',method='POST'),timeout=60))
 key=d['result']['exportKey']
 raw=urllib.request.urlopen(base+'/exports/'+key,timeout=120).read()
 (root/(table+'.csv')).write_bytes(raw)
 print(table,len(raw),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:list(p.map(get,['words','translations']))
