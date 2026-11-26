# v1.7k (B6 parte 2): extrae la narrativa sin traducir del código a b6p2/<bloque>_es.tsv.
# Uso:  cd herramientas/i18n && npm i --no-save acorn acorn-walk   (una vez)
#       python3 extract_b6p2.py            (corre narr_medir.js y reescribe b6p2/<bloque>_es.tsv)
# Formato de cada fila: id<TAB>D|T<TAB>español   (id = primeros 6 hex del SHA-1 del español exacto; saltos de línea como \n literal)
#   D = frase fija → diccionario por hash (I18X);  T = plantilla con {0}, {1}… (cada ${…} del código) → I18T con índice por palabra fija.
# Las traducciones viven en b6p2/<bloque>_<idioma>.tsv (id<TAB>traducción) y no se tocan: como el id sale del texto, sobreviven a cada extracción.
# b6p2/excluir.tsv (id<TAB>motivo): textos que no se traducen (nombres propios, cadenas internas, fragmentos que ya no se muestran solos).
# b6p2/extra_es.tsv: filas agregadas a mano (mismo formato), por ejemplo nombres con artículo que el código arma en tiempo de ejecución.
import json,hashlib,os,subprocess,sys,re,collections
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(H));OUT=H+'/b6p2'
os.makedirs(OUT,exist_ok=True)
src=sys.argv[1] if len(sys.argv)>1 else None
if src:A=json.load(open(src,encoding='utf8'))
else:A=json.loads(subprocess.run(['node',H+'/narr_medir.js',ROOT],capture_output=True,text=True,check=True).stdout)
BLOQ=['eventos','dialogos','fama','economia','noticias','motor','empleo','combate','manager','comodidad','rendimiento']
def grp(a):
    f=a['f']
    if f.startswith('events_'):return 0
    if f.startswith(('engine_v13','engine_v14','engine_v15','data_v13','data_v14','data_v15','ui_v13','ui_v14','ui_v15')):return 3
    if f in('engine_v16e.js','data_v16e.js','ui_v16e.js'):return 6  # v1.7p: vida de las carreras comunes
    if f in('engine_v17r.js','data_v17r.js','ui_v17r.js'):return 7  # v1.7r: box y MMA a fondo (etapa C)
    if f in('engine_v17s.js','data_v17s.js','ui_v17s.js'):return 8  # v1.7s: fútbol mánager (etapa D)
    if f in('engine_v18a.js','data_v18a.js','ui_v18a.js'):return 9  # v1.8a: fase 1 de la ruta 9d (base y comodidad)
    if f in('engine_v18b.js','ui_v18b.js'):return 10  # v1.8b: cierre de la fase 1 (rendimiento: worker de guardado y troceo)
    if f.startswith(('engine_v16','data_v16','ui_v16')):return 2
    if a['call'] in('mkNews','pushNews','ftNews','archiveNews','cbNews'):return 4  # v1.7k: antes de diálogos (los reportes anuales de engine_v12 son noticias)
    if f in('engine_v12b.js','engine_v12.js','ui_v12b.js','ui_v12.js'):return 1
    return 5
sid=lambda s:hashlib.sha1(s.encode('utf8')).hexdigest()[:6]
U=[a for a in A if not a['tr'] and '<' not in a['t']]
# Cada literal se parte como la capa de traducción parte el texto en pantalla: por « · » y « | » (cada parte se traduce sola), sin espacios
# al principio ni al final; los marcadores se renumeran {0}, {1}… dentro de cada parte. Las partes sin letras (solo datos) se descartan.
def piezas(t):
    for q in re.split(r' [·|] ',t):
        q=q.strip().strip('·').strip()
        if not re.search(r'[A-Za-zÁ-úñ]{2}',re.sub(r'\{\d+\}','',q)):continue
        m={};q=re.sub(r'\{(\d+)\}',lambda x:'{%d}'%m.setdefault(x.group(1),len(m)),q)
        yield q
best={}
for a in sorted(U,key=lambda a:(grp(a),a['f'],a['line'])):
    for t in piezas(a['t']):
        if t not in best:best[t]=(grp(a),'T' if re.search(r'\{\d\}',t) else 'D',a['f'],a['line'])
rows=collections.defaultdict(list);ids={}
for t,(g,k,f,l) in best.items():
    i=sid(t)
    if i in ids and ids[i]!=t:i=hashlib.sha1(t.encode('utf8')).hexdigest()[:8]   # v2.5f: colisión de 6 hex → 8 hex (solo ese texto)
    assert i not in ids or ids[i]==t,f'colisión de id {i}'
    ids[i]=t;rows[g].append((f,l,i,k,t))
for g,b in enumerate(BLOQ):
    with open(f'{OUT}/{b}_es.tsv','w',encoding='utf8') as o:
        for f,l,i,k,t in sorted(rows[g]):o.write(f"{i}\t{k}\t{t.replace(chr(10),'\\n')}\n")
    print(f'{b}: {len(rows[g])} textos ({sum(1 for r in rows[g] if r[3]=="T")} plantillas)')
