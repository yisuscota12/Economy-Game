import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=1,is_mobile=True,has_touch=True)
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'es'}))")
        await pg.goto('file://'+__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","imperio.html"))+''); await pg.wait_for_timeout(4000)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='USA';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(1500)
        # normal life: advance by month, week, year
        for u in ['d','s','m','a','a']:
            await pg.evaluate(f"()=>{{P.dlg=null;P.event=null;hideModal();advanceUnit('{u}');}}"); await pg.wait_for_timeout(500)
        # simulate v1.6 save with box career (no cb). v1.7g: también se guarda la ranura activa, que es de donde el juego se recupera si tras recargar falta la partida principal
        r=await pg.evaluate("""async()=>{P.dlg=null;P.event=null;hideModal();fcStart(P,'mma');delete P.fc.cb;P.fc.rec=[5,1,3];P.fc.rk=40;save();saveNow();await slSave(CFG.slot,null,true);return localStorage.getItem('imperioVida_v3').length}""")
        print('save bytes',r)
        await pg.wait_for_timeout(1500)  # v1.7e: deja terminar la escritura asíncrona en IndexedDB antes de recargar (sin esto fallaba ~1 de 3 veces)
        await pg.reload()
        # v1.7f: sondeo explícito hasta que la partida esté cargada (wait_for_function fallaba de forma intermitente; la partida sí se restauraba)
        for _ in range(60):
            await pg.wait_for_timeout(500)
            if await pg.evaluate("()=>typeof P!=='undefined'&&!!P&&!!P.fc"): break
        await pg.wait_for_timeout(500)
        info=await pg.evaluate("()=>({k:P.fc&&P.fc.k,cb:!!(P.fc&&P.fc.cb)})"); print('after reload',info,'| desde ranura:',await pg.evaluate("()=>SL.recovered||0"))
        await pg.evaluate("()=>{P.dlg=null;hideModal();showFame();}"); await pg.wait_for_timeout(500)
        info=await pg.evaluate("()=>({cb:!!P.fc.cb,pro:P.fc.cb&&P.fc.cb.pro,rec:P.fc.cb&&[P.fc.cb.w,P.fc.cb.l],world:G.cb&&Object.keys(G.cb.F).length,sp:G.cb&&G.cb.sp})"); print('migrated',info)
        # fast forward 5 years with signed contract & accepted fight
        await pg.evaluate("()=>{const c=P.fc.cb;cbPromOffers(P,true);cbSignProm(P,0);P.ft=120;cbSeek(P);if(c.offers.length)cbAccept(P,0);closeSheet();CFG.tu='5';advanceUnit('5');}"); await pg.wait_for_timeout(15000)
        info=await pg.evaluate("()=>({ev:P.event&&P.event.id,dlg:P.dlg&&P.dlg.id,logs:P.log.slice(-6).map(x=>x.y+' '+x.t.slice(0,90)),y:G.year,age:P.age,rec:[P.fc.cb.w,P.fc.cb.l],fight:!!P.fc.cb.fight,hist:P.fc.cb.hist.length,ff:typeof FF_ON!=='undefined'?FF_ON:null,save:(localStorage.getItem('imperioVida_v3')||'').length})"); print('after 5y',info)
        await pg.evaluate("()=>{P.dlg=null;P.event=null;hideModal();CFG.tu='a';for(let i=0;i<3;i++){P.dlg=null;P.event=null;advanceUnit('a');if(cbDue()){cbAutoFight(P);}}}"); await pg.wait_for_timeout(2000)
        info=await pg.evaluate("()=>({y:G.year,rec:[P.fc.cb.w,P.fc.cb.l],news:(G.nw||[]).filter(x=>/campeón|vence/.test(x.t)).slice(-3).map(x=>x.t)})"); print('later',info)
        await pg.screenshot(path=__import__('os').path.join(__import__('os').path.dirname(__file__),'20_smoke.png'))
        print('ERRS',errs[:15])
        await b.close()
asyncio.run(main())
