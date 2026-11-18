import asyncio
from playwright.async_api import async_playwright
SH=__import__('os').path.join(__import__('os').path.dirname(__file__),'capturas','');__import__('os').makedirs(SH,exist_ok=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True)
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'es'}))")
        await pg.goto('file://'+__import__("os").path.abspath(__import__("os").path.join(__import__("os").path.dirname(__file__),"..","imperio.html"))+''); await pg.wait_for_timeout(4000)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(1500)
        t=await pg.evaluate("()=>{const t0=performance.now();P.s.salud=85;dlgRoll=function(){return 0};const r=fcStart(P,'futbol');log(r,'big');const fb=fbOf(P);fb.at=fb.at.map(v=>v+25);fb.ovr=fbOvr(fb);fbPlace(P);save();render();return [performance.now()-t0,r]}")
        print('start ms',t)
        await pg.evaluate("()=>{showFame();}"); await pg.wait_for_timeout(600); await pg.screenshot(path=SH+'f01_jug.png')
        for tb in ['clu','fic','tor','tra']:
            await pg.evaluate(f"()=>{{FBV.tab='{tb}';if('{tb}'==='fic'){{fbOffersGen(P,true);}}showFB();}}"); await pg.wait_for_timeout(500); await pg.screenshot(path=SH+f'f02_{tb}.png')
        await pg.evaluate("()=>{FBV.tab='tor';FBV.wtab='sel';showFB();}"); await pg.wait_for_timeout(400); await pg.screenshot(path=SH+'f03_sel.png')
        await pg.evaluate("()=>{closeSheet();showFTWorld('cop');}"); await pg.wait_for_timeout(400); await pg.screenshot(path=SH+'f04_world_cop.png')
        # advance months
        await pg.evaluate("()=>{closeSheet();for(let i=0;i<3;i++){P.dlg=null;P.event=null;hideModal();advanceUnit('m');}}"); await pg.wait_for_timeout(1500)
        info=await pg.evaluate("()=>{const fb=fbOf(P);return {date:dateStr(),sy:fb.sy,role:fb.role,off:fb.off.length,big:!!fb.big}}"); print('after 3m',info)
        # force a final
        await pg.evaluate("()=>{hideModal();closeSheet();const W=FTW(),fb=fbOf(P);const other=Object.values(W.C).find(c=>c.c==='ESP'&&c.l&&c.r>80).i;W.K.cwc={k:'cwc',n:'Mundial de Clubes',sf:[],y:W.cy};fb.big={comp:'cwc',a:fb.cl,b:other,nat:false,label:'Final del Mundial de Clubes',neu:true,mine:'a'};save();render();}"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=SH+'f05_final_intro.png')
        g=await pg.query_selector('#modal #go')
        if g: await pg.evaluate("e=>e.click()",g); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SH+'f06_moment.png')
        for i in range(14):
            o=await pg.query_selector('#modal [data-mo], #modal [data-pk]')
            if not o: break
            await pg.evaluate("e=>e.click()",o); await pg.wait_for_timeout(250)
        await pg.screenshot(path=SH+'f07_end.png')
        info=await pg.evaluate("()=>{const fb=fbOf(P);return {big:!!fb.big,last:fb.lastFinal,cwc:FTW().hist.cwc.slice(-1)}}"); print('final',info)
        await pg.evaluate("()=>{hideModal();CFG.tu='a';advanceUnit('a');}"); await pg.wait_for_timeout(2500)
        info=await pg.evaluate("()=>{const fb=fbOf(P);return {date:dateStr(),off:fb.off.length,big:!!fb.big,modal:document.querySelector('#modal').classList.contains('on'),sheet:sheetIsOpen(),sy:fb.sy.pj}}"); print('year',info)
        await pg.screenshot(path=SH+'f08_year.png')
        print('ERRS',errs[:20])
        await b.close()
asyncio.run(main())
