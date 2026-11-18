# v1.7n (B6 parte 2, fama): recorre en pantalla las 11 carreras de fama y lista el texto que la capa de traducción deja en español.
#   python3 herramientas/pw_b6p2_fama.py imperio.html <idioma> [carrera…]      (por omisión, las 11)
# Método: se envuelve I18.T y se anota toda cadena que sale idéntica a la entrada y todavía «parece español» (quitando las palabras
# en mayúscula inicial, quedan al menos 3 letras minúsculas seguidas); se descartan las traducciones idénticas al español de b6p2/*.tsv.
# Por carrera: partida nueva en México a los 22 años, fcStart(P,k), nivel 60, fans y dinero altos; se abren la ficha de fama y
# todas las pestañas de la carrera (música y afines: per/obr/ind/viv/esc; box y MMA: pel/ent/pre/rk; fútbol: jug/clu/fic/tor y
# el mundo del fútbol) y se pulsa cada botón habilitado (salvo retirarse y rescindir); cada ventana que se abre se recorre
# pulsando sus botones (rotando la elección) hasta cerrarla. Después se avanzan NMES meses (por omisión 18) y se recorren los
# diálogos, noches de pelea, conciertos y finales que salgan. Al final se pasa por I18.T cada línea nueva del registro.
# Salida: /tmp/fama_<idioma>.json con {texto: [carrera/paso, …]} y un resumen en pantalla.
import asyncio,os,sys,re,glob,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2];KS=sys.argv[3:] or ['musica','actuacion','creador','modelo','comedia','escritor','chef','dj','box','mma','futbol']
NMES=int(os.environ.get('NMES','18'))
def iguales(L):
    I=os.path.join(os.path.dirname(os.path.abspath(__file__)),'i18n','b6p2');ES={};o=[]
    for f in glob.glob(I+'/*_es.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==3:ES[p[0]]=p[2]
    for f in glob.glob(I+f'/*_{L}.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==2 and p[0] in ES and ES[p[0]]==p[1]:o.append(p[1])
    return o
JS=r"""async([k,IG,NMES])=>{
 const W=ms=>new Promise(r=>setTimeout(r,ms));const IGS=new Set(IG);const miss={};let ctx='';
 const es=s=>{s=String(s==null?'':s).trim();if(s.length<3||IGS.has(s))return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’]*/g,''));};
 const OUT=new Set();const T0=I18.T;I18.T=function(v){const r=T0(v);if(r!==v){OUT.add(String(r).trim());return r;}if(es(v)&&!OUT.has(String(v).trim())){const t=String(v).trim();(miss[t]=miss[t]||[]).length<3&&miss[t].push(k+'/'+ctx);}return r;};
 const BAD=/retir|rescind|romper contrato|cuelgas|resign|terminate|quit/i;
 const errs=[];const quiet=()=>{P.event=null;P.dlg=null;};
 const boost=()=>{P.money=Math.max(P.money||0,5e6);P.dinero=P.money;P.ft=240;try{P.s.salud=90;}catch(e){}const f=P.fc;if(f){f.sk=Math.max(f.sk||0,60);f.img=Math.max(f.img||0,70);f.fans={loc:Math.max(f.fans.loc,2e5),nac:Math.max(f.fans.nac,1.2e6),int:Math.max(f.fans.int,4e5)};}};
 // recorre la ventana que esté abierta pulsando botones, rotando la elección
 const settle=async(tag)=>{for(let i=0;i<30;i++){await W(30);const m=document.querySelector('#modal.on');
     if(!m)break;ctx=tag+'/v'+i;const bs=[...m.querySelectorAll('button:not([disabled])')].filter(b=>!BAD.test(b.textContent));
     if(!bs.length){try{hideModal();}catch(e){}break;}
     try{bs[i%bs.length].click();}catch(e){errs.push(tag+': '+e.message);}
     await W(60);}
   if(document.querySelector('#modal.on')){try{hideModal();}catch(e){}}quiet();};
 // abre una vista y pulsa uno a uno sus botones habilitados
 const view=async(tag,open)=>{let n=0;for(let i=0;i<60;i++){try{hideModal();closeSheet();}catch(e){}boost();quiet();
     ctx=tag;try{open();}catch(e){errs.push(tag+' open: '+e.message);return;}await W(40);
     const root=document.querySelector('#sheetIn')||document.body;
     const bs=[...root.querySelectorAll('button:not([disabled])')].filter(b=>!BAD.test(b.textContent)&&!b.closest('.tabs,.ftabs'));
     if(i>=bs.length)break;ctx=tag+'#'+i+' '+bs[i].textContent.trim().slice(0,24);
     try{bs[i].click();}catch(e){errs.push(ctx+': '+e.message);}n++;await W(80);await settle(tag+'#'+i);}
   return n;};
 const t0=performance.now();boost();let r0='';try{r0=fcStart(P,k);log(r0,'big');}catch(e){errs.push('fcStart: '+e.message);}
 boost();try{save();render();}catch(e){}await settle('inicio');
 const cl={};cl.fame=await view('ficha',()=>showFame());
 if(typeof FM!=='undefined'&&FM[k]){for(const t of ['per','obr','ind','viv','esc'])cl[t]=await view(t,()=>{FMV.tab=t;showFM();});}
 else if(k==='box'||k==='mma'){for(const t of ['ent','pel','pre','rk'])cl[t]=await view(t,()=>{CBV.tab=t;showCB();});}
 else if(k==='futbol'){for(const t of ['jug','clu','fic','tor'])cl[t]=await view(t,()=>{FBV.tab=t;if(t==='fic')try{fbOffersGen(P,true);}catch(e){}showFB();});
   for(const w of ['cop','lig','con','sel','his'])cl['w'+w]=await view('mundo/'+w,()=>showFTWorld(w));}
 const L0=P.log.length;
 for(let m=0;m<NMES;m++){try{hideModal();closeSheet();}catch(e){}boost();quiet();ctx='mes'+m;
   try{advanceUnit('m');}catch(e){errs.push('mes'+m+': '+e.message);}await W(60);await settle('mes'+m);
   if(m%6===5){if(typeof FM!=='undefined'&&FM[k])await view('obr+'+m,()=>{FMV.tab='obr';showFM();});else if(k==='futbol')await view('jug+'+m,()=>{FBV.tab='jug';showFB();});else await view('pel+'+m,()=>{CBV.tab='pel';showCB();});}}
 ctx='registro';for(const e of P.log.slice(0))I18.T(e.t);
 I18.T=T0;try{hideModal();closeSheet();}catch(e){}
 return {k,ms:Math.round(performance.now()-t0),clicks:cl,miss,errs:errs.slice(0,20),log:P.log.length-L0};}"""
async def main():
    IG=iguales(LANG);out={};tot={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for k in KS:
            pg=await b.new_page(viewport={'width':414,'height':896});perr=[]
            pg.on('pageerror',lambda e: perr.append(str(e)[:160]))
            await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'"+LANG+"'}))")
            await pg.goto(URL);await pg.wait_for_timeout(3500)
            await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='22';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();}")
            try: r=await pg.evaluate(JS,[k,IG,NMES])
            except Exception as e: print(k,'ERROR',str(e)[:300]);await pg.close();continue
            print(f"{k}: {r['ms']} ms, clics {r['clicks']}, registro +{r['log']}, sin traducir {len(r['miss'])}, errores {len(r['errs'])+len(perr)}",flush=True)
            for e in (r['errs']+perr)[:6]: print('   !',e)
            for s,w in r['miss'].items(): out.setdefault(s,[]).extend(w)
            await pg.close()
        await b.close()
    OF=f'/tmp/fama_{LANG}'+('_'+'_'.join(sys.argv[3:]) if sys.argv[3:] else '')+'.json';json.dump(out,open(OF,'w'),ensure_ascii=False,indent=0)
    print(f'TOTAL {LANG}: {len(out)} textos distintos sin traducir → {OF}')
    for s,w in list(out.items())[:60]: print(' ·',s[:140],'  ⟵',w[0])
asyncio.run(main())
