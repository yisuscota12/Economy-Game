# v1.7i (B6). Capturas: Guía, burbuja ⓘ y los 4 párrafos de la vista País en el idioma pedido.
# Uso: python3 herramientas/pw_b6_capturas.py imperio.html herramientas/capturas ar [en …]
import asyncio,sys,os
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];os.makedirs(OUT,exist_ok=True)
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True,locale='es-MX');errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sP').value='MEX';m.querySelector('#sA').value='30';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.ruler=true;for(const f of ['ensureV13','ensureV14','ensureV15','ensureV15b'])if(typeof window[f]==='function')window[f]();render();}")
    async def shot(nm,js,wait=700):
        await pg.evaluate("()=>{closeSheet();hideModal();hlpHide&&hlpHide();}");await pg.wait_for_timeout(150)
        await pg.evaluate(f"async()=>{{{js}}}");await pg.wait_for_timeout(wait)
        await pg.screenshot(path=os.path.join(OUT,f'b6_{L}_{nm}.png'))
    await shot('guia_1',"showGuide();")
    await shot('guia_bolsa',"showGuide();const d=[...document.querySelectorAll('#sheetIn details')];d.forEach(x=>x.open=false);d[6].open=true;d[6].scrollIntoView();")
    await shot('guia_guerra',"showGuide();const d=[...document.querySelectorAll('#sheetIn details')];d.forEach(x=>x.open=false);d[18].open=true;d[18].scrollIntoView();")
    i=await pg.evaluate("()=>HELP.findIndex(h=>/^Inflaci/i.test(h[0])||/inflación/i.test(h[1]))")
    await shot('ayuda_inflacion',f"hlpShow({max(i,0)},null);")
    await shot('ayuda_box',"const i=HELP.findIndex(h=>h[2]&&h[2].length>180&&/MMA/.test(h[3]));hlpShow(i<0?0:i,null);")
    await shot('pais_recursos',"openSheet('<h3>⛏️</h3>'+rzHTML(natOf(P)));")
    await shot('pais_reservas',"openSheet('<h3>🏦</h3>'+rvHTML(natOf(P)));")
    await shot('pais_banca',"openSheet('<h3>🏛️</h3>'+bnkHTML(natOf(P)));")
    await shot('pais_guerra',"showWarLogV();")
    print(L,'capturas listas · errores',errs[:3]);await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for L in sys.argv[3:]:await run(b,L)
        await b.close()
asyncio.run(main())
