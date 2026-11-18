# v1.7o (B6 parte 2, economía): recorre en pantalla las hojas de economía y lista el texto que la capa de traducción deja en español.
#   python3 herramientas/pw_b6p2_economia.py imperio.html <idioma>
# Método (igual que pw_b6p2_fama.py): se envuelve I18.T y se anota toda cadena que sale idéntica a la entrada y todavía «parece
# español» (quitando las palabras en mayúscula inicial quedan 3+ minúsculas seguidas); se descartan las traducciones idénticas
# al español de b6p2/*.tsv.
# Partida en México a los 35 años con título, mucho dinero, carrera de finanzas con mesa de operaciones, fondo propio y banco propio.
# Hojas: Bolsa (cada pestaña y la ficha de una empresa), Mis empresas (abrir cada uno de los 28 giros, ficha de cada empresa con
# sus decisiones), Bancos y fondos (4 pestañas), mesa y fondo, Servicios, barra de cotizaciones, menú Carrera (servicio público,
# corporativo y finanzas), y como gobernante las pestañas Economía y Gabinete de la vista País (cada botón y cada hoja que abre:
# candidatos, directivas, moneda, reservas, banca). Se pulsa cada botón habilitado (salvo cerrar o vender todo) y se recorre cada
# ventana que se abre. Después se avanzan NMES meses (por omisión 12) y se pasan por I18.T el registro, las noticias y la cinta.
# Salida: /tmp/economia_<idioma>.json con {texto: [paso, …]} y un resumen en pantalla.
import asyncio,os,sys,re,glob,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2];NMES=int(os.environ.get('NMES','12'))
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
JS=r"""async([IG,NMES])=>{
 const W=ms=>new Promise(r=>setTimeout(r,ms));const IGS=new Set(IG);const miss={};let ctx='';
 const es=s=>{s=String(s==null?'':s).trim();if(s.length<3||IGS.has(s))return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’]*/g,''));};
 const OUT=new Set();const T0=I18.T;I18.T=function(v){const r=T0(v);if(r!==v){OUT.add(String(r).trim());return r;}if(es(v)&&!OUT.has(String(v).trim())){const t=String(v).trim();(miss[t]=miss[t]||[]).length<3&&miss[t].push(ctx);}return r;};
 const BAD=/abdic|renunc|golpe|declarar|guerra|nueva partida|retirarte|liquidar todo|cerrar la empresa|vender el banco|cerrar el fondo/i;
 const errs=[];const quiet=()=>{P.event=null;P.dlg=null;};window.confirm=()=>true;
 const boost=()=>{P.dinero=Math.max(P.dinero,4000*U(P));P.ft=240;P.actions=9;try{P.s.salud=90;P.s.inteligencia=90;P.s.influencia=80;}catch(e){}const n=natOf(P);n.treas=Math.max(n.treas||0,n.gdp*.2);P.nat=5;};
 const settle=async(tag)=>{for(let i=0;i<25;i++){await W(30);const m=document.querySelector('#modal.on');
     if(!m)break;ctx=tag+'/v'+i;const bs=[...m.querySelectorAll('button:not([disabled])')].filter(b=>!BAD.test(b.textContent));
     if(!bs.length){try{hideModal();}catch(e){}break;}
     try{bs[i%bs.length].click();}catch(e){errs.push(tag+': '+e.message);}await W(50);}
   if(document.querySelector('#modal.on')){try{hideModal();}catch(e){}}quiet();};
 const roots=sel=>[...document.querySelectorAll(sel)];
 const btns=sel=>roots(sel).flatMap(r=>[...r.querySelectorAll('button:not([disabled])')]).filter(b=>!BAD.test(b.textContent)&&!b.closest('.tabs,.ftabs')&&!/Menú principal|Atrás|←/.test(b.textContent));
 // abre una vista, pulsa cada botón; si el botón abre otra hoja, pulsa también cada botón de esa hoja (un nivel)
 const view=async(tag,open,sel='#sheetIn',deep=true)=>{let n=0;for(let i=0;i<70;i++){try{hideModal();closeSheet();}catch(e){}boost();quiet();
     ctx=tag;try{open();}catch(e){errs.push(tag+' open: '+e.message);return n;}await W(40);
     const bs=btns(sel);if(i>=bs.length)break;const lab=bs[i].textContent.trim().slice(0,28);ctx=tag+'#'+i+' '+lab;
     const before=(document.querySelector('#sheetIn')||{}).innerHTML;
     try{bs[i].click();}catch(e){errs.push(ctx+': '+e.message);}n++;await W(70);await settle(tag+'#'+i);
     const sh=document.querySelector('#sheetIn');
     if(deep&&sh&&sh.innerHTML!==before&&document.body.classList.contains('sheet')!==false){const bs2=btns('#sheetIn');
       for(let j=0;j<Math.min(bs2.length,14);j++){try{hideModal();closeSheet();}catch(e){}boost();quiet();try{open();}catch(e){break;}await W(30);
         const b1=btns(sel)[i];if(!b1)break;try{b1.click();}catch(e){break;}await W(50);await settle(tag+'#'+i);
         const b2=btns('#sheetIn')[j];if(!b2)break;ctx=tag+'#'+i+'.'+j+' '+b2.textContent.trim().slice(0,24);try{b2.click();}catch(e){errs.push(ctx+': '+e.message);}n++;await W(60);await settle(ctx);}}}
   return n;};
 const t0=performance.now();boost();ensureV13();ensureV14();try{bkEnsure(P);}catch(e){}
 P.edu.degree=P.edu.degree||'Economía';P.career={track:'fin',rank:4,years:0};
 try{log(fundOpen(P)||'fondo','good');}catch(e){errs.push('fundOpen: '+e.message);}
 try{log(bankFound(P,'local','Banco Prueba')||'banco','good');}catch(e){errs.push('bankFound: '+e.message);}
 boost();try{save();render();}catch(e){}await settle('inicio');
 const cl={};const r0=P.r;
 cl.bznew=await view('bznew',()=>showBizNew(r0),'#sheetIn',false);
 cl.biz=await view('biz',()=>showBiz());
 const nb=(typeof bzList==='function'?bzList(P):[]).length;for(let i=0;i<nb;i++)cl['bz'+i]=await view('bz'+i,()=>showBizD(i),'#sheetIn',false);
 for(const [k] of MKTABS)cl['mk_'+k]=await view('mk_'+k,()=>showMarket(k),'#sheetIn',false);
 try{const id=Object.keys(G.mk.C)[0];cl.stock=await view('stock',()=>showStock(id),'#sheetIn',false);}catch(e){errs.push('stock: '+e.message);}
 for(const k of ['acc','cr','mf','own'])cl['bk_'+k]=await view('bk_'+k,()=>showBanks(k),'#sheetIn',false);
 cl.desk=await view('desk',()=>showDesk('desk'),'#sheetIn',false);cl.fund=await view('fund',()=>showDesk('fund'),'#sheetIn',false);
 cl.serv=await view('serv',()=>showServices(),'#sheetIn',false);cl.tick=await view('tick',()=>showTickCfg(),'#sheetIn',false);
 cl.econ=await view('econV',()=>showEconomyV(),'#sheetIn',false);
 // gobernante: pestañas Economía y Gabinete de la vista País
 P.ruler=true;try{render();}catch(e){}
 for(const t of ['eco','gab'])cl['pa_'+t]=await view('pa_'+t,()=>{setView('pa');setTab(t);render();},'#natBody, #natTop',true);
 P.ruler=false;try{setView('pe');render();}catch(e){}
 // carrera: servicio público, corporativo, finanzas (cada opción cambia la carrera)
 P.career={track:null,rank:0,years:0};cl.car=await view('carrera',()=>$('nCar').click(),'#sheetIn',false);
 P.career={track:'gob',rank:5,years:0,min:'def'};cl.gob=await view('carrera_gob',()=>$('nCar').click(),'#sheetIn',false);
 const L0=P.log.length,N0=(G.nw||[]).length;P.career={track:'fin',rank:4,years:0};
 for(let m=0;m<NMES;m++){try{hideModal();closeSheet();}catch(e){}boost();quiet();ctx='mes'+m;
   try{advanceUnit('m');}catch(e){errs.push('mes'+m+': '+e.message);}await W(60);await settle('mes'+m);}
 ctx='registro';for(const e of P.log)I18.T(e.t);
 ctx='noticias';for(const e of (G.nw||[]))I18.T(typeof e==='string'?e:(e.t||e[1]||''));
 I18.T=T0;try{hideModal();closeSheet();}catch(e){}
 return {ms:Math.round(performance.now()-t0),clicks:cl,miss,errs:errs.slice(0,20),log:P.log.length-L0,nw:(G.nw||[]).length-N0};}"""
async def main():
    IG=iguales(LANG)
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896});perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:160]))
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'"+LANG+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(3500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='35';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=35;G.mode='realista';}")
        r=await pg.evaluate(JS,[IG,NMES])
        await b.close()
    print(f"{LANG}: {r['ms']} ms, clics {sum(r['clicks'].values())} {r['clicks']}, registro +{r['log']}, noticias +{r['nw']}, sin traducir {len(r['miss'])}, errores {len(r['errs'])+len(perr)}",flush=True)
    for e in (r['errs']+perr)[:8]: print('   !',e)
    OF=f'/tmp/economia_{LANG}.json';json.dump(r['miss'],open(OF,'w'),ensure_ascii=False,indent=0)
    print(f'TOTAL {LANG}: {len(r["miss"])} textos distintos sin traducir → {OF}')
    for s,w in list(r['miss'].items())[:int(os.environ.get('NES','80'))]: print(' ·',s[:150],'  ⟵',w[0])
asyncio.run(main())
