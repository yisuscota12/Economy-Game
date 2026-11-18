# v1.7l: capturas de eventos de vida traducidos.  python3 herramientas/pw_b6p2_eventos_capturas.py imperio.html <carpeta> <idiomas…>
# Por idioma: (1) modal de un evento con plantilla y nombre («Te haces amigo de …»: se resuelve una opción antes para llenar el registro),
# (2) modal de un evento de guerra, (3) pantalla principal con el registro («opción → resultado»).
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];LS=sys.argv[3:];os.makedirs(OUT,exist_ok=True)
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896})
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();m.querySelector('#sA').value='30';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("""()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();
      for(const id of ['primer_dia','dibujo','bici','consola','mudanza_dep']){const e=EV.find(x=>x.id===id);if(!e)continue;setEvent(P,e);resolveEvent(0);}
      render();const e=EV.find(x=>x.id==='hermanito');setEvent(P,e);showEvent();}""");await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/eventos_{L}_modal.png')
    await pg.evaluate("()=>{hideModal();const e=EV.find(x=>x.id==='w_protesta')||EV.find(x=>x.id==='refugiados');setEvent(P,e);showEvent();}");await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/eventos_{L}_guerra.png')
    await pg.evaluate("()=>{hideModal();P.event=null;render();const l=document.getElementById('log');if(l)l.scrollIntoView({block:'center'});}");await pg.wait_for_timeout(900)
    await pg.screenshot(path=f'{OUT}/eventos_{L}_registro.png')
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for L in LS:await run(b,L)
        await b.close()
asyncio.run(main())
