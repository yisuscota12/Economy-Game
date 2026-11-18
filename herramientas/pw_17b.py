# Prueba de la v1.7b: reloj de 12 h, acciones por franja, desvelo, dormir, día y noche
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));SH=os.path.join(H,'capturas','');os.makedirs(SH,exist_ok=True)
URL='file://'+os.path.abspath(os.path.join(H,'..','imperio.html'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True);errs=[]
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'es'}))")
        await pg.goto(URL); await pg.wait_for_timeout(3500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();m.querySelector('#sA').value='18';document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(2000)
        await pg.evaluate("()=>{dlgRoll=function(){return 0};P.dinero=5e5;P.ft=200;P.s.salud=80;P.s.felicidad=60;save();render();}")
        st=lambda: pg.evaluate("()=>[dateStr(),hhmm(G.min),franjaOf()[0],document.querySelector('#clkInfo').textContent,P.s.salud,P.s.felicidad,P._desv||0,Math.floor(P.ft)]")
        print('inicio',await st())
        # botón Hora
        await pg.evaluate("()=>{document.querySelector('#clk button[data-u=h]').click();}"); await pg.wait_for_timeout(200)
        print('boton',await pg.evaluate("()=>document.querySelector('#ageBtn').textContent"))
        for i in range(3): await pg.click('#ageBtn'); await pg.wait_for_timeout(150)
        print('+3h',await st())
        # acciones de día: médico disponible, salir de noche bloqueado
        await pg.evaluate("()=>{document.querySelector('#nAct').click();}"); await pg.wait_for_timeout(300)
        print('menu dia',await pg.evaluate("()=>[...document.querySelectorAll('#sheetIn .item')].map(x=>(x.disabled?'x ':'')+x.querySelector('.t').textContent.slice(0,26)+' | '+x.querySelector('.s').textContent.slice(-40))"))
        await pg.screenshot(path=SH+'b_01_acciones_dia.png')
        await pg.evaluate("()=>{const it=[...document.querySelectorAll('#sheetIn .item')].find(x=>/gimnasio/.test(x.textContent));it.click();}"); await pg.wait_for_timeout(400)
        print('gimnasio',await st(),await pg.evaluate("()=>[sheetIsOpen(),shKey()]"))
        # llevar el reloj a las 8 p. m.
        await pg.evaluate("()=>{G.min=20*60;render();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{closeSheet();document.querySelector('#nAct').click();}"); await pg.wait_for_timeout(300)
        print('menu noche',await pg.evaluate("()=>[...document.querySelectorAll('#sheetIn .item')].filter(x=>/Dormir|Salir de noche|médico|Correr/.test(x.textContent)).map(x=>(x.disabled?'x ':'')+x.querySelector('.t').textContent.slice(0,26))"))
        await pg.screenshot(path=SH+'b_02_acciones_noche.png')
        await pg.evaluate("()=>{const it=[...document.querySelectorAll('#sheetIn .item')].find(x=>/Salir de noche/.test(x.textContent));it.click();}"); await pg.wait_for_timeout(400)
        await pg.evaluate("()=>{const it=[...document.querySelectorAll('#sheetIn .item')].find(x=>/Estudiar/.test(x.textContent));it.click();}"); await pg.wait_for_timeout(400)
        print('tras salir y estudiar (cruza medianoche)',await st(), await pg.evaluate("()=>P.log.slice(-3).map(l=>l.t.slice(0,90))"))
        await pg.evaluate("()=>{closeSheet();hideModal();}"); await pg.wait_for_timeout(500); await pg.screenshot(path=SH+'b_03_madrugada.png')
        await pg.evaluate("()=>{document.querySelector('#nAct').click();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const it=[...document.querySelectorAll('#sheetIn .item')].find(x=>/Dormir/.test(x.textContent));it.click();}"); await pg.wait_for_timeout(400)
        print('dormir',await st())
        # unidades: Día conserva la hora, Mes también; cruce de año
        await pg.evaluate("()=>{closeSheet();CFG.tu='d';}"); await pg.click('#ageBtn'); await pg.wait_for_timeout(300); print('+1 día',await st())
        await pg.evaluate("()=>{CFG.tu='m';}"); await pg.click('#ageBtn'); await pg.wait_for_timeout(700); await pg.evaluate("()=>{if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();}"); print('+1 mes',await st())
        for hh,name in [(6,'alba'),(13,'dia'),(19,'ocaso'),(23,'noche')]:
            await pg.evaluate(f"()=>{{G.min={hh}*60;render();}}"); await pg.wait_for_timeout(1400); await pg.screenshot(path=SH+f'b_luz_{hh}.png')
        print('ERRS',errs[:10]); await b.close()
asyncio.run(main())
