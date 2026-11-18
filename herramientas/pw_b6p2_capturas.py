# v1.7k: capturas de la narrativa traducida (noticias, registro, cinta, Bolsa).  python3 herramientas/pw_b6p2_capturas.py imperio.html herramientas/capturas <idiomas…>
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];os.makedirs(OUT,exist_ok=True)
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();m.querySelector('#sA').value='30';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.ruler=true;try{ensureV13();ensureV14();}catch(e){}}")
    for _ in range(2):
        await pg.evaluate("()=>{P.event=null;P.dlg=null;hideModal();try{advanceUnit('a');}catch(e){}}");await pg.wait_for_timeout(2500)
    # noticias de economía de muestra en el archivo (para que salgan en el portal aunque el azar no las produzca)
    await pg.evaluate("""()=>{const n=natOf(P).name;[`La Reserva Federal sube su tasa 0.75 puntos, a 4.50 %. Las bolsas lo resienten.`,`${n}: el peso argentino pasa a flotación administrada.`,`Crac bursátil: Wall Street entra en pánico por una ola de ventas; los mercados del mundo caen.`,`Crisis bancaria en ${n}: el gobierno rescata a los bancos con el 4 % del PIB.`].forEach(t=>archiveNews(t,'news','int'));
      log(`Compras bonos a 10 años de Brasil por $120,000: rinden 13.25 % al año en real brasileño.`);log(`Abres puesto de comida en Buenos Aires: inviertes $50,000 en local y equipo y $10,000 de capital de trabajo.`);P.event=null;P.dlg=null;hideModal();render();}""")
    await pg.wait_for_timeout(800);await pg.screenshot(path=f'{OUT}/b6p2_{L}_principal.png')
    await pg.evaluate("()=>{try{showNews();}catch(e){}}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'{OUT}/b6p2_{L}_noticias.png')
    await pg.evaluate("()=>{closeSheet();hideModal();try{showBolsa?showBolsa():null}catch(e){}}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'{OUT}/b6p2_{L}_bolsa.png')
    print(L,'capturas listas · errores',errs[:3]);await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for L in sys.argv[3:]:await run(b,L)
        await b.close()
asyncio.run(main())
