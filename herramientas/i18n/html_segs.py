# v1.7n: extrae los trozos de texto de las plantillas HTML (literales con «<») de los archivos dados, que narr_medir.js no mide.
#   python3 herramientas/i18n/html_segs.py src/ui_v16.js src/ui_v16b.js … > /tmp/html_segs.json
# Cada literal (comillas simples, dobles o acento grave) se corta por etiquetas <…>, entidades y ${…} (con llaves anidadas);
# se guardan los trozos con 3+ letras seguidas. Las expresiones ${…} se recorren también, por si contienen literales con texto.
# Salida: [[archivo, línea, texto, tiene_hueco]] donde tiene_hueco indica que el trozo estaba pegado a un ${…} (texto parcial).
import sys,re,json
def lits(src):
    i=0;n=len(src)
    while i<n:
        c=src[i]
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i);i=n if j<0 else j;continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2);i=n if j<0 else j+2;continue
        if c in '\'"`':
            j=i+1;parts=[];cur='';q=c
            while j<n and src[j]!=q:
                if src[j]=='\\':cur+=src[j:j+2];j+=2;continue
                if q=='`' and src[j]=='$' and j+1<n and src[j+1]=='{':
                    d=1;k=j+2
                    while k<n and d:
                        if src[k]=='{':d+=1
                        elif src[k]=='}':d-=1
                        elif src[k] in '\'"`':
                            # salta literales anidados
                            qq=src[k];k+=1
                            while k<n and src[k]!=qq:
                                if src[k]=='\\':k+=1
                                elif qq=='`' and src[k]=='$' and k+1<n and src[k+1]=='{':
                                    dd=1;k+=2
                                    while k<n and dd:
                                        if src[k]=='{':dd+=1
                                        elif src[k]=='}':dd-=1
                                        k+=1
                                    continue
                                k+=1
                        k+=1
                    parts.append(cur);cur='\x00';yield from ((ln,s) for ln,s in lits_inner(src,j+2,k-1));j=k;continue
                cur+=src[j];j+=1
            parts.append(cur);yield (src.count('\n',0,i)+1,''.join(parts));i=j+1;continue
        i+=1
def lits_inner(src,a,b):
    off=src.count('\n',0,a)
    for ln,s in lits(src[a:b]):yield (ln+off,s)
out=[];seen=set()
for f in sys.argv[1:]:
    src=open(f,encoding='utf8').read()
    for ln,s in lits(src):
        if '<' not in s:continue
        for seg in re.split(r'<[^>]*>|&[a-z#0-9]+;',s):
            for k,piece in enumerate(seg.split('\x00')):
                t=piece.replace('\\n',' ').strip()
                if not re.search(r'[A-Za-zÁ-úñ]{3}',t) or re.fullmatch(r'[\w\-]+=?',t) and not re.search(r'[áéíóúñ]',t) and t.lower()==t and len(t)<4:continue
                if re.search(r'^[a-z\-]+(:|=)|class=|style=|data-|function|=>|\bconst\b|\bsetAttribute\b',t):continue
                hole=len(seg.split('\x00'))>1
                key=(t,hole)
                if key in seen:continue
                seen.add(key);out.append([f.split('/')[-1],ln,t,hole])
json.dump(out,sys.stdout,ensure_ascii=False,indent=0)
