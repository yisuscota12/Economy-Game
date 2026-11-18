# v1.8b (cierre de la fase 1 de la ruta 9d: rendimiento): prueba de navegador.  python3 herramientas/pw_18b.py imperio.html [idioma] [cpu]
# Partida en México a los 30, 30 meses jugados y registro lleno. Revisa: worker de guardado (responde, guardado rápido igual al de siempre,
# ranura comprimida idéntica a slPayload y recuperable), «+1 año» por meses (la fecha corre, termina el año, detener a medias deja G.clkRem
# y volver a tocar lo completa), registro incremental (líneas nuevas, tope de 160, partida nueva), mapa diferido (una sola actualización
# por ráfaga de render), ajuste «Guardado en segundo plano» (apagar → guardado de siempre; encender) y mide las tareas largas
# (PerformanceObserver «longtask») con la CPU frenada ×cpu (4 por omisión ≈ la Toshiba) en: «+1 año», avance automático ×5, guardar y ranura.
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';CPU=float(sys.argv[3]) if len(sys.argv)>3 else 4
FUN=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const R={};for(let i=0;i<30&&!SWK.ok;i++)await W(100);R.worker=[SWK.ok,SWK.cs,SWK.why];
 // guardado rápido por el worker = mismo contenido que saveNow
 log('marca v18b');const n0=SWK.n;save();for(let i=0;i<40&&SWK.n===n0;i++)await W(100);await W(1200);
 const pl=Object.assign({},P);delete pl._paper;const ref=JSON.stringify({G:packG(G),P:pl});R.rapido_igual=localStorage.getItem(SAVE_KEY)===ref;
 // ranura: comprimida en el worker, idéntica a slPayload()
 const ok=await slSave(CFG.slot,null,true);const b=await slGet(CFG.slot);const txt=await slUnzip(b);R.ranura=[ok,txt===slPayload(),SL.meta[CFG.slot].kb];
 // un guardado viejo no pisa uno más nuevo
 const seq=++SWK.seq;saveNow();swkApplyLs(seq,'{"viejo":1}');R.no_pisa=localStorage.getItem(SAVE_KEY)!=='{"viejo":1}';
 // +1 año por meses
 P.event=null;P.dlg=null;G.offer=null;hideModal();render();await W(300);CFG.tu='a';clockUI();const y0=G.year,d0=absDay(),fechas=new Set();
 $('ageBtn').click();R.ocupado=CLK.busy;for(let i=0;i<300&&CLK.busy;i++){fechas.add(G.day);await W(15);}await W(500);R.anio=[G.year-y0,absDay()-d0,fechas.size>1];
 if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();await W(300);
 const d1=absDay();$('ageBtn').click();await W(40);$('ageBtn').click();for(let i=0;i<200&&CLK.busy;i++)await W(15);await W(600);
 R.detener=[absDay()-d1>0&&absDay()-d1<365,G.clkRem&&G.clkRem.u==='a'&&G.clkRem.n===365-(absDay()-d1)];
 if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();await W(300);$('ageBtn').click();for(let i=0;i<300&&CLK.busy;i++)await W(15);await W(600);
 for(let k=0;k<4&&G.clkRem;k++){if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();await W(300);$('ageBtn').click();for(let i=0;i<300&&CLK.busy;i++)await W(15);await W(600);}
 R.completar=[absDay()-d1===365,G.clkRem];
 // registro incremental
 if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();log('línea A');log('línea B');renderLog(P);R.reg1=$('log').lastElementChild.textContent==='línea B';
 for(let i=0;i<400;i++)log('relleno '+i);renderLog(P);R.reg2=[$('log').childElementCount<=160,$('log').lastElementChild.textContent==='relleno 399'];
 log('última');renderLog(P);R.reg3=$('log').lastElementChild.textContent==='última'&&$('log').lastElementChild.classList.contains('new');
 // mapa: una ráfaga de render → una actualización después de pintar
 let k=0;const ul=updateLut;updateLut=function(){k++;return ul.apply(this,arguments);};for(let i=0;i<5;i++)render();R.mapa_dentro=k;await W(400);R.mapa_despues=k;updateLut=ul;
 // ajuste
 showSettings();await W(250);const it=()=>[...document.querySelectorAll('#sheetIn .item')].find(x=>/⚙/.test(x.textContent));R.ajuste=!!it();
 it().click();await W(500);R.apagado=[CFG.swk,SWK.ok];const n1=SWK.n;save();await W(1500);R.apagado_guarda=SWK.n===n1&&localStorage.getItem(SAVE_KEY)!=null;
 it().click();for(let i=0;i<40&&!SWK.ok;i++)await W(100);R.encendido=[CFG.swk,SWK.ok];closeSheet();return R;}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'"+LANG+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(3500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};for(let i=0;i<30;i++){P.event=null;P.dlg=null;G.offer=null;G.calls=[];clockAdvance(MCUM[monthOfDay(G.day)+1]-G.day);}P.event=null;P.dlg=null;hideModal();for(let i=0;i<150;i++)log('relleno '+i);render();}")
        R=await pg.evaluate(FUN)
        # tareas largas con la CPU frenada
        await pg.evaluate("()=>{window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())__lt.push(Math.round(e.duration));}).observe({type:'longtask'});}")
        cdp=await pg.context.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':CPU})
        LT={}
        for name,js,wait in [('anio',"async()=>{if(P.event)resolveEvent(0);P.dlg=null;G.clkRem=null;hideModal();render();await new Promise(r=>setTimeout(r,400));__lt=[];CFG.tu='a';window.__d0=absDay();$('ageBtn').click();while(CLK.busy)await new Promise(r=>setTimeout(r,20));}",4000),
                             ('auto_x5',"async()=>{if(P.event)resolveEvent(0);P.dlg=null;G.clkRem=null;hideModal();window.__d0=absDay();render();await new Promise(r=>setTimeout(r,400));__lt=[];CFG.asp=5;autoStart();await new Promise(r=>setTimeout(r,12000));autoStop();}",2500),
                             ('guardar',"async()=>{__lt=[];save();}",3000),('ranura',"async()=>{__lt=[];await slSave(CFG.slot,null,true);}",2000)]:
            await pg.evaluate(js);await pg.wait_for_timeout(wait);lt=await pg.evaluate("()=>__lt.slice()");dd=await pg.evaluate("()=>window.__d0!=null?absDay()-__d0:null")
            LT[name]={'max_ms':max(lt) if lt else 0,'suma_ms':sum(lt),'mayores_100':sum(1 for x in lt if x>100),'tareas':len(lt),'dias':dd}
            await pg.evaluate("()=>{window.__d0=null;}")
        print(json.dumps(R,ensure_ascii=False));print('tareas largas (CPU ×%g):'%CPU,json.dumps(LT));print('errores JS:',len(perr),perr[:5])
        await b.close()
asyncio.run(main())
