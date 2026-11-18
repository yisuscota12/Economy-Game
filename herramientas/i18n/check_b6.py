# v1.7i: revisa las traducciones de b6/: ids que faltan o sobran, mismas etiquetas HTML que el español y mismas cifras.
# Uso: python3 herramientas/i18n/check_b6.py [idioma…]
import re,glob,os,sys,collections
H=os.path.dirname(os.path.abspath(__file__))
def rd(f):
    o={}
    for line in open(f,encoding='utf8'):
        m=re.match(r'([0-9a-f]{6})[\t ](.+)$',line.rstrip('\n'))
        if m:o[m.group(1)]=m.group(2).replace('\\n','\n')
    return o
ES=rd(H+'/b6/b6_es.tsv')
tags=lambda s:collections.Counter(re.findall(r'</?[a-z]+',s))
def nums(s):
    s=re.sub(r'<[^>]+>','',s)
    return collections.Counter(n.replace(',','').replace('.','').replace('\u202f','').replace(' ','').lstrip('0') or '0' for n in re.findall(r'\d[\d.,\u202f ]*\d|\d',s))
L=sys.argv[1:] or ['en','pt','fr','de','it','ru','tr','id','zh','ja','ko','ar','hi']
for c in L:
    T={}
    for f in sorted(glob.glob(H+f'/b6/b6_{c}*.tsv')):T.update(rd(f))
    miss=[k for k in ES if k not in T];extra=[k for k in T if k not in ES];bad=[]
    for k,v in T.items():
        if k not in ES:continue
        if tags(v)!=tags(ES[k]):bad.append((k,'html',dict(tags(ES[k])-tags(v)),dict(tags(v)-tags(ES[k]))))
        a,b=nums(ES[k]),nums(v)
        if a!=b:bad.append((k,'cifras',dict(a-b),dict(b-a)))
    print(f'{c}: {len(T)}/{len(ES)} · faltan {len(miss)} · sobran {extra} · avisos {len(bad)}')
    for x in bad[:40]:print('  ',x)
    if miss and len(miss)<15:print('   faltan:',miss)
