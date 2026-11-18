# v1.7l (B6 parte 2, eventos de vida): dispara cada evento de EV en pantalla y comprueba la traducción.
#   python3 herramientas/pw_b6p2_eventos.py imperio.html <idiomas…>
# Por idioma: partida en Argentina (30 años; se agregan pareja, 2 hijos, 1 hermano, padres y una amiga), y para cada evento:
#  1) setEvent(P,e) + showEvent(): se espera a la capa (MutationObserver) y se lee el texto del modal; cuenta como «español»
#     si el texto o algún botón del modal sigue idéntico al original en español y la capa no tiene traducción
#     (las traducciones idénticas al español, como «Correr» en portugués, no cuentan).
#  2) Para cada opción: se restaura P desde una copia, se resuelve la opción y se traduce con I18.T el resultado y la línea
#     del registro tal como se muestra («opción → resultado»).
# Solo entran los eventos definidos en events_*.js y engine_v13/v15/v15b (bloques traducidos).
# Los eventos cuyo texto depende de datos que la partida no tiene (lanzan excepción) se cuentan aparte.
import asyncio,os,sys,re,glob,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LS=[a for a in sys.argv[2:] if not a.startswith('--')];NES=int(os.environ.get('NES','15'))
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src')
# solo los eventos de los bloques ya traducidos: events_*.js (eventos) y engine_v13/v15/v15b (economía)
IDS=sorted(set(i for f in glob.glob(R+'/events_*.js')+[R+'/engine_v13.js',R+'/engine_v15.js',R+'/engine_v15b.js'] for i in re.findall(r"\bE\('([a-z0-9_]+)'",open(f,encoding='utf8').read())))
JS=r"""async([IDS,IG])=>{
 const IGR=IG.map(x=>new RegExp(x));const same=s=>IGR.some(r=>r.test(s));
 const W=()=>new Promise(r=>setTimeout(r,0));const L=/[a-záéíóúñ]{3}/i;
 dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();
 // familia mínima para los eventos que la usan
 const mk=(k,role,name,sex,age)=>({k,role,name,sex,age,rel:60,alive:true,id:Math.random()});
 P.ppl=P.ppl||[];if(!P.ppl.some(x=>x.role==='Madre'))P.ppl.push(mk('padre','Madre','María','F',58));if(!P.ppl.some(x=>x.role==='Padre'))P.ppl.push(mk('padre','Padre','Juan','M',60));
 const kd=(name,sex,age)=>({name,sex,age,rel:60,alive:true});
 P.children=(P.children||[]).concat([kd('Lucía','F',12),kd('Tomás','M',25)]);P.siblings=(P.siblings||[]).concat([kd('Pablo','M',28)]);
 P.ppl.push(mk('amigo','Amigo','Carla','F',45));if(!P.partner)P.partner=Object.assign(kd('Sofía','F',30),{s:{}});
 const snap=JSON.stringify(P);const out={n:EV.length,shown:0,skip:[],esShow:[],esRes:[],res:0,errs:[]};
 const realLog=log;
 const S=new Set(IDS);out.n=0;
 for(const e of EV){if(!S.has(e.id))continue;out.n++;
   let ev;P=JSON.parse(snap);
   try{setEvent(P,e);ev=P.event;}catch(x){out.skip.push(e.id);continue;}
   try{showEvent();}catch(x){out.errs.push(e.id+': '+x.message);continue;}
   await W();await W();
   const m=document.querySelector('#modal');const txt=m?m.innerText:'';out.shown++;
   const bad=[ev.text,...ev.opts].filter(s=>L.test(s)&&!same(s)&&I18.T(s)===s&&txt.includes(s));
   if(bad.length)out.esShow.push([e.id,bad[0]]);
   hideModal();
   for(let i=0;i<ev.opts.length;i++){
     P=JSON.parse(snap);let r,line=null;
     try{setEvent(P,e);log=(t)=>{line=t;};r=resolveEvent(i);}catch(x){log=realLog;out.errs.push(e.id+'#'+i+': '+x.message);continue;}
     log=realLog;out.res++;
     for(const s of [r,line])if(s&&L.test(s)&&!same(s)&&I18.T(s)===s){out.esRes.push([e.id,s]);break;}
   }
 }
 P=JSON.parse(snap);return out;}"""
def iguales(L):
    # textos cuya traducción es idéntica al español («Correr» en portugués, «Comprarlo ({0})» en italiano): no cuentan como «en español»
    I=os.path.join(os.path.dirname(os.path.abspath(__file__)),'i18n','b6p2');ES={}
    for f in glob.glob(I+'/*_es.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==3:ES[p[0]]=p[2]
    o=[]
    for f in glob.glob(I+f'/*_{L}.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==2 and p[0] in ES and ES[p[0]]==p[1]:o.append('^'+re.escape(p[1]).replace('\\{0\\}','.+').replace('\\{1\\}','.+')+'$')
    return o
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();m.querySelector('#sA').value='30';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    o=await pg.evaluate(JS,[IDS,iguales(L)])
    print(f"{L}: {o['n']} eventos · mostrados {o['shown']} · sin datos {len(o['skip'])} · resultados {o['res']} · modal en español {len(o['esShow'])} · resultados en español {len(o['esRes'])} · errores JS {len(o['errs'])+len(errs)}")
    for x in o['esShow'][:NES]:print('   modal:',x[0],'|',x[1][:110])
    for x in o['esRes'][:NES]:print('   resultado:',x[0],'|',x[1][:110])
    for x in (o['errs']+errs)[:5]:print('   error:',x[:140])
    if o['skip']:print('   sin datos:',' '.join(o['skip'][:20]))
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for L in LS:await run(b,L)
        await b.close()
asyncio.run(main())
