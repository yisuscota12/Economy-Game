import re,sys,json,collections,glob,os
root=sys.argv[1]
files=sorted(glob.glob(root+'/src/ui*.js'))+[root+'/src/body.html']+sorted(glob.glob(root+'/src/data_v1*.js'))+sorted(glob.glob(root+'/src/engine*.js'))
cnt=collections.Counter();where={}
SP=re.compile(r'[a-záéíóúñ]{3,}',re.I)
def add(t,f):
    t=re.sub(r'\s+',' ',t).strip()
    # quitar prefijos de iconos/números
    t=re.sub(r'^[^A-Za-zÁÉÍÓÚÑáéíóúñ¿¡]+','',t).strip()
    t=re.sub(r'[\s·:,(]+$','',t)
    if len(t)<2 or len(t)>90: return
    if not SP.search(t): return
    if re.search(r'[{}<>=;]|=>|\\|function|\(\)|\.\w+\(|^[a-z]+[A-Z]|^[a-z_]+$',t): return
    if not re.search(r'[áéíóúñ¿¡]|\b(de|la|el|los|las|y|en|con|para|por|tu|tus|sin|del|al|año|años|días|Más|Ajustes)\b',t) and not re.match(r'^[A-ZÁÉÍÓÚ][a-záéíóúñ]+( [a-záéíóúñ]+){0,3}$',t): return
    cnt[t]+=1;where.setdefault(t,set()).add(os.path.basename(f))
for f in files:
    s=open(f,encoding='utf8').read()
    # trozos estáticos de cadenas: entre comillas y backticks, separados por ${...} y etiquetas HTML
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`",s):
        body=m.group(1) or m.group(2) or m.group(3) or ''
        body=re.sub(r'\$\{[^{}]*(\{[^{}]*\}[^{}]*)*\}','\n',body)
        for part in re.split(r'<[^>]*>|\n|\$\{',body):
            for seg in re.split(r' · ',part): add(seg,f)
ui=[t for t in cnt if any(w.startswith('ui') or w=='body.html' for w in where[t])]
print('total',len(cnt),'en ui',len(ui))
json.dump({t:sorted(where[t]) for t in cnt},open('/home/claude/tools/strings.json','w'),ensure_ascii=False,indent=0)
L=sorted(ui,key=lambda t:(-cnt[t],len(t)))
print(sum(len(t) for t in ui),'caracteres en ui')
print('\n'.join(L[:60]))
