# v1.7o: capturas de las hojas de economía en cada idioma.  python3 herramientas/pw_b6p2_economia_capturas.py imperio.html herramientas/capturas <idiomas…>
# 10 capturas por idioma: abrir negocio, ficha de empresa, Bolsa → Materias (con posición), Bolsa → Divisas, Bancos → Fondos, Bancos → Tu banco,
# Servicios, mesa de operaciones, País → Gabinete (gobernante) y hoja de directivas de Defensa Nacional.
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];LS=sys.argv[3:] or ['ar']
os.makedirs(OUT,exist_ok=True)
SHOTS=[('01_abrir',"showBizNew(P.r)"),('02_empresa',"showBizD(0)"),('03_materias',"RSEL.k='copper';showMarket('cm')"),('04_divisas',"showMarket('fx')"),
       ('05_fondos',"showBanks('mf')"),('06_tubanco',"showBanks('own')"),('07_servicios',"showServices()"),('08_mesa',"showDesk('desk')"),
       ('09_gabinete',"P.ruler=true;setView('pa');setTab('gab');render();setTimeout(()=>{const e=document.querySelector('#natBody');if(e)e.scrollIntoView();},100)"),('10_directivas',"P.ruler=true;setView('pa');setTab('gab');render();document.querySelector('[data-dv=def]').click()")]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for L in LS:
            pg=await b.new_page(viewport={'width':414,'height':896})
            await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'"+L+"'}))")
            await pg.goto(URL);await pg.wait_for_timeout(3500)
            await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='35';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
            await pg.evaluate("""()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=35;G.mode='realista';P.edu.degree=P.edu.degree||'Economía';
              P.dinero=4000*U(P);ensureV13();ensureV14();bkEnsure(P);P.career={track:'fin',rank:4,years:0};try{fundOpen(P);}catch(e){}try{bankFound(P,'local','Banco Prueba');}catch(e){}
              try{bzOpen(P,'panaderia',P.r,false);}catch(e){}try{cmTrade('copper',20,true);}catch(e){}try{mfBuy('bal',P.dinero*.05);}catch(e){}
              try{advanceUnit('m');}catch(e){}P.event=null;P.dlg=null;hideModal();}""");await pg.wait_for_timeout(800)
            for nm,js in SHOTS:
                try:
                    await pg.evaluate(f"()=>{{try{{hideModal();closeSheet();}}catch(e){{}}P.ruler=false;try{{setView('pe');}}catch(e){{}}{js};}}");await pg.wait_for_timeout(900)
                    await pg.screenshot(path=f'{OUT}/eco_{L}_{nm}.png')
                except Exception as e:print(L,nm,'ERROR',str(e)[:120])
            print(L,'ok');await pg.close()
        await b.close()
asyncio.run(main())
