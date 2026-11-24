# Genera src/data_i18n.js con los diccionarios de traducción.
# Fuentes: tr_*.tsv (índice → ui_list.json), tr0_extra.tsv, tr2_ui.tsv, tr3_fama.tsv, tr4_pant.tsv, tr5_extra.tsv, tpl.tsv
# Columnas: español → inglés → portugués → francés → alemán → italiano → ruso → turco → indonesio → chino → japonés → coreano (v1.7d agregó fr, de, it; v1.7e ru, tr, id; v1.7f zh, ja, ko).
# Para agregar un idioma: añade una columna a los .tsv (en el mismo orden que LANGS en ui_i18n.js) y su código aquí.
import json,glob,re,os,collections
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(H))
CODES=['en','pt','fr','de','it','ru','tr','id','zh','ja','ko','ar','hi']
ui=json.load(open(H+'/ui_list.json',encoding='utf8'))
D={c:{} for c in CODES}
def put(es,vals):
    if re.search(r"fmt|kv\(|\*/",es): return
    for c,v in zip(CODES,vals):
        if v and v!=es: D[c][es]=v
        elif v: D[c].setdefault(es,v)
for f in sorted(glob.glob(H+'/tr_*.tsv')):
    for line in open(f,encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)==1+len(CODES): put(ui[int(p[0])],p[1:])
for name in ['tr2_ui.tsv','tr3_fama.tsv','tr4_pant.tsv','tr5_extra.tsv','tr0_extra.tsv','tr6_b6.tsv','tr7_v17q.tsv','tr8_v23.tsv']:
    for line in open(H+'/'+name,encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)==1+len(CODES): put(p[0],p[1:])
TPL={c:[] for c in CODES}
for line in open(H+'/tpl.tsv',encoding='utf8'):
    p=line.rstrip('\n').split('\t')
    if len(p)==1+len(CODES):
        for c,v in zip(CODES,p[1:]): TPL[c].append([p[0],v])
# v1.7j (B5b): pantallas del gobernante. b5b/b5b_es.tsv (id, D|T, español) + b5b/b5b_<idioma>.tsv (id → traducción).
# D = frase fija (diccionario); T = plantilla con {0}, {1}… Se verifica que cada plantilla conserve sus marcadores.
B5ES={};B5K={}
for line in open(H+'/b5b/b5b_es.tsv',encoding='utf8'):
    p=line.rstrip('\n').split('\t')
    if len(p)==3:B5ES[p[0]]=p[2];B5K[p[0]]=p[1]
B5=[{} for c in CODES]
for j,c in enumerate(CODES):
    for line in open(H+f'/b5b/b5b_{c}.tsv',encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)==2 and p[0] in B5ES:B5[j][p[0]]=p[1]
    assert len(B5[j])==len(B5ES),f'B5b {c}: {len(B5[j])} de {len(B5ES)}'
for i,es in B5ES.items():
    vals=[B5[j][i] for j in range(len(CODES))]
    if B5K[i]=='D':put(es,vals)
    else:
        ph=sorted(re.findall(r'\{\d\}',es))
        for c,v in zip(CODES,vals):
            assert sorted(re.findall(r'\{\d\}',v))==ph,f'B5b {c} {i}: marcadores {v}'
            TPL[c].append([es,v])
print('B5b (gobernante):',sum(1 for k in B5K.values() if k=='D'),'frases +',sum(1 for k in B5K.values() if k=='T'),'plantillas ×',len(CODES),'idiomas')
# v1.7i (B6): Guía y cuerpo de las burbujas ⓘ. b6/b6_es.tsv (id → español) + b6/b6_<idioma>*.tsv (id → traducción).
# Clave = FNV-1a de 32 bits del español exacto sobre unidades UTF-16 (igual que en ui_i18n.js), en base 36.
# Cada idioma va como cadena JSON: el navegador solo parsea el idioma activo.
def fnv(s):
    b=s.encode('utf-16-le');x=0x811c9dc5
    for i in range(0,len(b),2):x=((x^(b[i]|b[i+1]<<8))*0x01000193)&0xffffffff
    return x
def b36(n):
    d='0123456789abcdefghijklmnopqrstuvwxyz';o=''
    while True:
        n,r=divmod(n,36);o=d[r]+o
        if not n:return o
def rdb6(f):
    o={}
    for line in open(f,encoding='utf8'):
        m=re.match(r'([0-9a-f]{6})[\t ](.+)$',line.rstrip('\n'))
        if m:o[m.group(1)]=m.group(2).replace('\\n','\n')
    return o
B6ES=rdb6(H+'/b6/b6_es.tsv');HK={i:b36(fnv(s)) for i,s in B6ES.items()}
assert len(set(HK.values()))==len(HK),'colisión FNV en B6'
B6={}
for c in CODES:
    T={}
    for f in sorted(glob.glob(H+f'/b6/b6_{c}_*.tsv'))+sorted(glob.glob(H+f'/b6/b6_{c}.tsv')):T.update(rdb6(f))
    T={HK[i]:v for i,v in T.items() if i in HK and v!=B6ES[i]}
    if T:B6[c]=json.dumps(T,ensure_ascii=False,separators=(',',':'))
# v1.7k (B6 parte 2): narrativa. b6p2/<bloque>_es.tsv (id, D|T, español) + b6p2/<bloque>_<idioma>.tsv (id → traducción); b6p2/extra_es.tsv a mano.
# D → I18X (diccionario por hash: FNV-1a en base 36 + «.» + longitud en unidades UTF-16 en base 36; una cadena JSON por idioma).
# T → I18T (se verifica que cada plantilla conserve sus marcadores). b6p2/excluir.tsv: ids que no se traducen.
P2ES={};P2K={};P2B={}
for f in sorted(glob.glob(H+'/b6p2/*_es.tsv')):
    b=os.path.basename(f)[:-7]
    for line in open(f,encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)==3 and re.fullmatch(r'[0-9a-f]{6}',p[0]):P2ES[p[0]]=p[2].replace('\\n','\n');P2K[p[0]]=p[1];P2B[p[0]]=b
P2X=set()
if os.path.exists(H+'/b6p2/excluir.tsv'):
    for line in open(H+'/b6p2/excluir.tsv',encoding='utf8'):
        m=re.match(r'([0-9a-f]{6})\b',line)
        if m:P2X.add(m.group(1))
def xk(s):return b36(fnv(s))+'.'+b36(len(s.encode('utf-16-le'))//2)
XK={i:xk(s) for i,s in P2ES.items() if P2K[i]=='D'}
assert len(set(XK.values()))==len(XK),'colisión de clave en B6 parte 2'
X={};P2COV=collections.Counter()
for c in CODES:
    Tx={}
    for f in sorted(glob.glob(H+f'/b6p2/*_{c}.tsv')):
        for line in open(f,encoding='utf8'):
            p=line.rstrip('\n').split('\t')
            if len(p)==2 and p[0] in P2ES and p[0] not in P2X and p[1]:Tx[p[0]]=p[1].replace('\\n','\n')
    o={}
    for i,v in Tx.items():
        es=P2ES[i];P2COV[(c,P2B[i])]+=1
        if P2K[i]=='D':
            o[XK[i]]=v  # también si es igual al español: así una palabra que no cambia (siglas, nombres) cuenta como traducida dentro de una plantilla
        else:
            assert sorted(re.findall(r'\{\d\}',v))==sorted(re.findall(r'\{\d\}',es)),f'B6p2 {c} {i}: marcadores «{v}»'
            TPL[c].append([es,v])
    if o:X[c]=json.dumps(o,ensure_ascii=False,separators=(',',':'))
iso=json.load(open(H+'/iso2.json'));iso['XKX']='XK'
# v1.7p: cada idioma va comprimido (deflate «raw» nivel 9 + base64) en I18Z[idioma]=[bytes sin comprimir, base64]; al arrancar, i18Load(LANG)
# (en ui_i18n.js) descomprime solo el idioma activo con inflate.js y llena I18N, I18T, I18B e I18X de ese idioma. Antes los 13 iban en claro (~5.8 MB).
import zlib,base64
Z={};RAW=0
for c in CODES:
    o={'N':D[c],'T':TPL[c]}
    if c in B6:o['B']=B6[c]
    if c in X:o['X']=X[c]
    raw=json.dumps(o,ensure_ascii=False,separators=(',',':')).encode('utf8');RAW+=len(raw)
    co=zlib.compressobj(9,zlib.DEFLATED,-15);z=co.compress(raw)+co.flush()
    Z[c]=[len(raw),base64.b64encode(z).decode('ascii')]
js='/* Traducciones de la interfaz. Generado por herramientas/i18n/build_i18n.py: no editar a mano. */\n'
js+='const I18Z='+json.dumps(Z,separators=(',',':'))+';\n'
js+='const I18N={},I18T={},I18B={},I18X={};\n'
js+=open(H+'/inflate.js',encoding='utf8').read().replace("if(typeof module!=='undefined')module.exports={inflateRaw};",'')+'\n'
js+="function i18Load(l){const z=I18Z[l];if(!z||I18N[l])return;const b=atob(z[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);const o=JSON.parse(new TextDecoder('utf-8').decode(inflateRaw(u,z[0])));I18N[l]=o.N;I18T[l]=o.T;if(o.B)I18B[l]=o.B;if(o.X)I18X[l]=o.X;}\n"
js+='const ISO2='+json.dumps(iso,separators=(',',':'))+';\n'
open(ROOT+'/src/data_i18n.js','w',encoding='utf8').write(js)
print({c:len(D[c]) for c in CODES},len(js)//1024,'KB','(sin comprimir',RAW//1024,'KB)')
print('B6 (Guía + ⓘ):',{c:len(json.loads(B6[c])) for c in B6},'de',len(B6ES))
tot=collections.Counter(P2B[i] for i in P2ES if i not in P2X)
print('B6 parte 2 (narrativa):',', '.join(f"{b} {min(P2COV[(c,b)] for c in CODES)}/{n}" for b,n in sorted(tot.items())),'(mínimo entre idiomas / textos por traducir)')
