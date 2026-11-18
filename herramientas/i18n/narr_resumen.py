# v1.7j: resumen de /tmp/narr.json (salida de narr_medir.js): textos únicos, plantillas y palabras por bloque de B6 parte 2,
# y las plantillas con gramática armada en el código (texto dentro de ?: o sufijos de género/plural) que hay que partir antes de traducir.
import json,collections,re,sys
A=json.load(open(sys.argv[1] if len(sys.argv)>1 else '/tmp/narr.json'));U=[a for a in A if not a['tr'] and '<' not in a['t']]
def grp(a):
    f=a['f']
    if f.startswith('events_'):return '1 Eventos de vida'
    if f in('engine_v12b.js','engine_v12.js','ui_v12b.js','ui_v12.js'):return '2 Diálogos'
    if f.startswith(('engine_v16','data_v16','ui_v16')):return '3 Fama, box/MMA, fútbol'
    if f.startswith(('engine_v13','engine_v14','engine_v15','data_v13','data_v14','data_v15','ui_v13','ui_v14','ui_v15')):return '4 Economía, bolsa, bancos, monedas'
    if a['call'] in('mkNews','pushNews','ftNews','archiveNews','cbNews'):return '5 Noticias'
    return '6 Motor base'
G=collections.defaultdict(list)
for a in U:G[grp(a)].append(a)
for k in sorted(G):
    uq={a['t'] for a in G[k]};w=sum(len(re.sub(r'\{\d+\}','',t).split()) for t in uq)
    print(f"{k}: {len(uq)} únicos ({len({a['t'] for a in G[k] if a['kind']=='tpl'})} plantillas) · {w} palabras")
print('total únicos',len({a['t'] for a in U}))
gram=[a for a in U if a['kind']=='tpl' and any(re.search(r"\?\s*'[a-z]{0,2}'\s*:\s*'[a-z]{0,2}'",e) or ('?' in e and re.search(r"'[^']*[a-záéíóúñ]{3}[^']*'|`",e)) for e in a['ex'])]
print('plantillas con gramática en el código:',len(gram))
for a in gram[:int(sys.argv[2]) if len(sys.argv)>2 else 0]:print(' ',a['f'],a['line'],a['t'][:120])
