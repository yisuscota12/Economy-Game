# v1.9b: medición del cierre de mes con la CPU frenada (×4 por omisión ≈ la Toshiba con Celeron).  python3 herramientas/pw_19b_mes.py imperio.html [cpu]
# Partida madura (México, 3 años jugados), luego 12 cierres de mes con «+1 mes» (advanceUnit('m')): tiempo de la simulación,
# del redibujo (render + mapa en el cuadro siguiente) y tareas largas del navegador. Además, el costo de abrir una pantalla con y sin GSAP.
import asyncio,os,sys,json,statistics as st
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);CPU=float(sys.argv[2]) if len(sys.argv)>2 else 4
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:200]))
        await pg.add_init_script("(()=>{let s=777;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'es'}))")
        await pg.goto(URL);await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='22';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1200)
        await pg.evaluate("()=>{document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();render();}")
        # madurar: 3 años (mundos de fútbol y bolsa ya en marcha)
        await pg.evaluate("()=>{for(let i=0;i<3;i++){P.event=null;P.dlg=null;G.offer=null;G.calls=[];advanceUnit('a');P.event=null;P.dlg=null;hideModal();}render();}");await pg.wait_for_timeout(800)
        cdp=await pg.context.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':CPU})
        await pg.evaluate("()=>{window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())__lt.push(e.duration);}).observe({entryTypes:['longtask']});}")
        R=await pg.evaluate("""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const sim=[],tot=[];
          // simulación pura de un cierre de mes: mkMonthEnd + mes del motor, sin redibujo
          const _r=render;
          for(let i=0;i<12;i++){P.event=null;P.dlg=null;G.offer=null;G.calls=[];hideModal();
            render=function(){};const t0=performance.now();advanceUnit('m');const t1=performance.now();render=_r;
            const t2=performance.now();render();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const t3=performance.now();
            sim.push(t1-t0);tot.push(t1-t0+(t3-t2));await W(120);}
          return {sim,tot};}""")
        lt=await pg.evaluate("()=>__lt.slice()")
        # abrir una pantalla (Acciones) con GSAP y sin GSAP
        sh={}
        for m in ['off','on']:
            v=await pg.evaluate(f"""async()=>{{CFG.dsa='{m}';const o=[];for(let i=0;i<5;i++){{const t=performance.now();$('nAct').click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));o.push(performance.now()-t);closeSheet();await new Promise(r=>setTimeout(r,450));}}CFG.dsa='auto';return o;}}""")
            sh[m]=round(st.median(v),1)
        out={'cpu':CPU,'cierre_mes_sim_ms':{'mediana':round(st.median(R['sim']),1),'max':round(max(R['sim']),1)},
             'cierre_mes_con_redibujo_ms':{'mediana':round(st.median(R['tot']),1),'max':round(max(R['tot']),1)},
             'tareas_largas':{'n':len(lt),'max':round(max(lt),1) if lt else 0},'abrir_pantalla_ms':sh,'errores':perr[:5]}
        print(json.dumps(out,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
