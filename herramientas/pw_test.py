import asyncio, sys
from playwright.async_api import async_playwright
SH=__import__('os').path.join(__import__('os').path.dirname(__file__),'capturas','');__import__('os').makedirs(SH,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True)
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type in('error',) else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'es'}))")
        await pg.goto('file://'+__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","imperio.html"))+'')
        await pg.wait_for_timeout(4000)
        sk=sys.argv[1] if len(sys.argv)>1 else 'box'
        await pg.evaluate("""()=>{const m=document.querySelector('#modal');const a=m.querySelector('#sA');if(a){a.value='18';}const sp=m.querySelector('#sP');if(sp){sp.value='MEX';sp.onchange&&sp.onchange();}}""")
        await pg.evaluate("()=>{document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());}")
        await pg.evaluate(f"""()=>{{P.s.salud=85;P.dinero=U(P)*5;const r=fcStart(P,'{sk}');log(r,'big');P.fc.cb.at=P.fc.cb.at.map(v=>v+30);cbSync(P);cbGoPro(P);if(P.fc.cb.po.length)cbSignProm(P,P.fc.cb.po.length-1);dlgRoll=function(){{return 0}};save();render();}}""")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=SH+'01_main.png')
        await pg.evaluate("()=>{showFame();}"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SH+'02_peleador.png')
        for t in ['ent','pre','rk','tra']:
            await pg.evaluate(f"()=>{{CBV.tab='{t}';if('{t}'==='pre'){{P.ft=120;cbSeek(P);cbOffersGen(P,2,false);}}showCB();}}"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=SH+f'03_{t}.png',full_page=False)
        # sheet scrolled for offers
        await pg.evaluate("()=>{CBV.tab='pre';showCB();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{document.querySelector('#sheet').scrollTop=500}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SH+'03_pre_scroll.png')
        # accept, then advance clock to fight day
        await pg.evaluate("()=>{const r=cbAccept(P,0);log(r);save();closeSheet();render();}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SH+'04_clock.png')
        await pg.evaluate("()=>{CFG.tu='a';advanceUnit('a');}"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=SH+'05_press.png')
        info=await pg.evaluate("()=>({due:cbDue(),day:absDay(),dt:P.fc.cb.fight&&P.fc.cb.fight.dt,modal:document.querySelector('#modal').classList.contains('on')})")
        print('INFO',info)
        # press -> weigh -> plan -> fight
        for i in range(3):
            btn=await pg.query_selector('#modal [data-c="1"], #modal #go, #modal [data-w="0"]')
            if btn: await btn.click(); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SH+'06_plan.png')
        g=await pg.query_selector('#modal #go')
        if g: await g.click(); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SH+'07_round0.png')
        for i in range(3):
            k=await pg.query_selector('#modal [data-k]')
            if not k: break
            await k.click(); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SH+'08_round3.png')
        s=await pg.query_selector('#modal #simR')
        if s: await s.click(); await pg.wait_for_timeout(800)
        await pg.screenshot(path=SH+'09_result.png')
        await pg.evaluate("()=>{document.querySelector('#modal').scrollTop=600}"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SH+'10_result2.png')
        t=await pg.query_selector('#modal [data-t="0"]')
        if t: await t.click(); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SH+'11_after.png')
        # clock visible with sheet open
        await pg.evaluate("()=>{CBV.tab='rk';showCB();}"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SH+'12_rank_clock.png')
        await pg.evaluate("()=>{closeSheet();hideModal();P.fc.cb.susp=0;P.fc.inj=0;P.fc.cb.offers=[];CFG.tu='a';advanceUnit('a');}"); await pg.wait_for_timeout(1200)
        info=await pg.evaluate("()=>({date:dateStr(),offers:P.fc.cb.offers.length,sheet:sheetIsOpen(),ev:P.event&&P.event.id,dlg:P.dlg&&P.dlg.id,due:cbDue(),fight:!!P.fc.cb.fight,modal:document.querySelector('#modal').classList.contains('on'),log:P.log.slice(-3).map(x=>x.t.slice(0,80))})"); print("PAUSE",info)
        await pg.screenshot(path=SH+'13_pause.png')
        print('ERRS',errs[:20])
        await b.close()
asyncio.run(main())
