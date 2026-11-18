# Prueba de la v1.7a: python3 herramientas/pw_17a.py  (temas, vista horizontal, ranuras, dificultad)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));SH=os.path.join(H,'capturas','');os.makedirs(SH,exist_ok=True)
URL='file://'+os.path.abspath(os.path.join(H,'..','imperio.html'))
async def newgame(pg,dif='f',slot=None):
    await pg.evaluate("(d)=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();const b=m.querySelector('.df[data-d='+d+']');if(b)b.click();}",dif)
    if slot is not None: await pg.evaluate("(k)=>{document.querySelector('#sSl').value=String(k);}",slot)
    await pg.evaluate("()=>document.querySelector('#sGo').click()"); await pg.wait_for_timeout(2000)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        ctx=await b.new_context(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await ctx.new_page();errs=[]
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script("if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'es'}))")
        await pg.goto(URL); await pg.wait_for_timeout(3500)
        await pg.screenshot(path=SH+'a_00_inicio.png')
        await newgame(pg,'f',0)
        print('partida1',await pg.evaluate("()=>[G.dif,CFG.slot,fullName(P),chkPct(P,'carisma',50)]"))
        await pg.wait_for_timeout(1500)
        print('ranuras',await pg.evaluate("()=>SL.meta.map(m=>m&&[m.n,m.kb,m.dif])"))
        # avanzar un año y comprobar autoguardado
        await pg.evaluate("()=>{dlgRoll=function(){return 0};P.age=20;CFG.tu='a';}"); await pg.click('#ageBtn'); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();CFG.tu='a';}"); await pg.click('#ageBtn'); await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{if(P.event)resolveEvent(0);P.dlg=null;hideModal();render();}")
        print('tras año',await pg.evaluate("()=>[dateStr(),SL.meta[0]&&SL.meta[0].y]"))
        # segunda partida en la ranura 2 (desde Más → Nueva partida)
        await pg.evaluate("()=>{closeSheet();showStart(true);}"); await pg.wait_for_timeout(500); await pg.screenshot(path=SH+'a_01_nueva.png')
        await newgame(pg,'d',1); await pg.wait_for_timeout(1500)
        print('partida2',await pg.evaluate("()=>[G.dif,CFG.slot,fullName(P),chkPct(P,'carisma',50),SL.meta.map(m=>m&&m.n)]"))
        await pg.evaluate("()=>showSlots()"); await pg.wait_for_timeout(400); await pg.screenshot(path=SH+'a_02_ranuras.png')
        # cargar la ranura 1
        await pg.evaluate("()=>{document.querySelector('#sheetIn [data-sl=load][data-i=\"0\"]').click();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>document.querySelector('#modal #akY').click()"); await pg.wait_for_timeout(2500)
        print('cargada1',await pg.evaluate("()=>[G.dif,CFG.slot,fullName(P),dateStr()]"))
        # exportar e importar
        await pg.evaluate("()=>showSlots()"); await pg.wait_for_timeout(300)
        await ctx.grant_permissions(['clipboard-read','clipboard-write'])
        await pg.evaluate("()=>document.querySelector('#sheetIn [data-sl=exp][data-i=\"1\"]').click()"); await pg.wait_for_timeout(1500)
        txt=await pg.evaluate("async()=>{try{return await navigator.clipboard.readText()}catch(e){return document.querySelector('#slIn').value}}")
        print('export KB',len(txt)//1024, txt[:12])
        await pg.evaluate("(t)=>{document.querySelector('#slIn').value=t;document.querySelector('#sheetIn [data-sl=imp]').click();}",txt); await pg.wait_for_timeout(2000)
        print('import',await pg.evaluate("()=>SL.meta.map(m=>m&&m.n)"))
        # recargar la página: ¿se conservan ranuras y partida?
        print('claves',await pg.evaluate("()=>Object.keys(localStorage).map(k=>k+':'+localStorage.getItem(k).length)"))
        await pg.reload(); await pg.wait_for_timeout(4000)
        print('claves2',await pg.evaluate("()=>Object.keys(localStorage).map(k=>k+':'+localStorage.getItem(k).length)"))
        print('recarga',await pg.evaluate("()=>[!!document.querySelector('#modal.on'),CFG.slot,P&&fullName(P),SL.meta.filter(Boolean).length,!!document.querySelector('#sLd')]"))
        await pg.screenshot(path=SH+'a_03_recarga.png')
        await pg.evaluate("()=>{const c=document.querySelector('#sC');if(c)c.click();else hideModal();}"); await pg.wait_for_timeout(600)
        # temas
        for t in ['noche','deportivo','claro','amigable','retro','medieval','neon']:
            await pg.evaluate("(t)=>{CFG.theme=t;applyTheme();closeSheet();showSettings();}",t); await pg.wait_for_timeout(350)
            await pg.screenshot(path=SH+f'a_th_{t}.png')
        await pg.evaluate("()=>{CFG.theme='claro';applyTheme();closeSheet();document.querySelector('#nAct').click();}"); await pg.wait_for_timeout(400); await pg.screenshot(path=SH+'a_th_claro_acc.png')
        await pg.evaluate("()=>{closeSheet();hideModal();}"); await pg.wait_for_timeout(300); await pg.screenshot(path=SH+'a_th_claro_main.png')
        # vista horizontal
        await pg.set_viewport_size({'width':896,'height':414}); await pg.wait_for_timeout(900)
        print('horizontal',await pg.evaluate("()=>[document.body.classList.contains('land'),innerWidth,innerHeight]"))
        await pg.evaluate("()=>{CFG.theme='deportivo';applyTheme();}"); await pg.wait_for_timeout(300); await pg.screenshot(path=SH+'a_land_main.png')
        await pg.evaluate("()=>{document.querySelector('#nCar').click();}"); await pg.wait_for_timeout(500); await pg.screenshot(path=SH+'a_land_sheet.png')
        await pg.set_viewport_size({'width':1280,'height':720}); await pg.wait_for_timeout(900); await pg.screenshot(path=SH+'a_land_laptop.png')
        await pg.evaluate("()=>{CFG.theme='noche';applyTheme();saveCfg();}")
        print('ERRS',errs[:12]); await b.close()
asyncio.run(main())
