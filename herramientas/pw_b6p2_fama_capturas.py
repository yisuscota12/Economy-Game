# v1.7n: capturas de fama en un idioma (para revisar a ojo, sobre todo árabe de derecha a izquierda).
#   python3 herramientas/pw_b6p2_fama_capturas.py imperio.html herramientas/capturas <idioma…>
# Por idioma: música (ficha de fama, pestaña Obras con la gráfica, noticias de la industria, un momento de concierto),
# box (pestaña Pelear y el ranking) y fútbol (Jugador y el mundo del fútbol, ligas). Partida en México a los 22, nivel 60.
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];LS=sys.argv[3:] or ['ar']
SET="""async([k])=>{const W=ms=>new Promise(r=>setTimeout(r,ms));P.money=P.dinero=5e6;P.ft=240;fcStart(P,k);const f=P.fc;f.sk=60;f.img=70;f.fans={loc:2e5,nac:1.2e6,int:4e5};
 for(let m=0;m<8;m++){P.ft=240;P.event=null;P.dlg=null;try{advanceUnit('m');}catch(e){}await W(30);try{hideModal();}catch(e){}}P.event=null;P.dlg=null;save();render();}"""
async def shot(pg,name):
    await pg.wait_for_timeout(500);await pg.screenshot(path=os.path.join(OUT,name));print(' ',name)
async def main():
    os.makedirs(OUT,exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for L in LS:
            for k in ['musica','box','futbol']:
                pg=await b.new_page(viewport={'width':414,'height':896})
                await pg.add_init_script("(()=>{let s=77;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'"+L+"'}))")
                await pg.goto(URL);await pg.wait_for_timeout(3500)
                await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='22';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
                await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();}")
                await pg.evaluate(SET,[k])
                if k=='musica':
                    await pg.evaluate("()=>showFame()");await shot(pg,f'fama_{L}_1_ficha.png')
                    await pg.evaluate("()=>{FMV.tab='obr';showFM();}");await shot(pg,f'fama_{L}_2_obras.png')
                    await pg.evaluate("()=>{FMV.tab='esc';showFM();}");await shot(pg,f'fama_{L}_3_escena.png')
                    await pg.evaluate("()=>{closeSheet();FMV.tab='viv';showFM();const b=[...document.querySelectorAll('#sheetIn button:not([disabled])')].find(x=>/data-gv|gig/i.test(x.outerHTML));if(b)b.click();}")
                    await pg.wait_for_timeout(400)
                    await pg.evaluate("()=>{const m=document.querySelector('#modal.on');if(m){const o=m.querySelector('button.opt,button:not([disabled])');if(o)o.click();}}")
                    await shot(pg,f'fama_{L}_4_concierto.png')
                elif k=='box':
                    await pg.evaluate("()=>{hideModal();CBV.tab='pel';showCB();}");await shot(pg,f'fama_{L}_5_box.png')
                    await pg.evaluate("()=>{CBV.tab='rk';showCB();}");await shot(pg,f'fama_{L}_6_ranking.png')
                else:
                    await pg.evaluate("()=>{hideModal();FBV.tab='jug';showFB();}");await shot(pg,f'fama_{L}_7_futbol.png')
                    await pg.evaluate("()=>{closeSheet();showFTWorld('lig');}");await shot(pg,f'fama_{L}_8_ligas.png')
                    await pg.evaluate("()=>{closeSheet();render();}");await shot(pg,f'fama_{L}_9_registro.png')
                await pg.close()
        await b.close()
asyncio.run(main())
