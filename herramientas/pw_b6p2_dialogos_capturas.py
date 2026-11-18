# v1.7m: capturas de diálogos traducidos.
#   python3 herramientas/pw_b6p2_dialogos_capturas.py imperio.html herramientas/capturas <idiomas…>
# Por idioma: (1) nodo de un diálogo con nombre («hermano_prestamo»), (2) pantalla de resultado con dado («asalto», opción
# «resistir» forzada a éxito), (3) registro con la línea «💬 título: opción → resultado».
import asyncio,os,sys
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);OUT=sys.argv[2];LS=sys.argv[3:]
SETUP=r"""()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=35;
 const kd=(name,sex,age)=>({name,sex,age,rel:60,alive:true});P.siblings=(P.siblings||[]).concat([kd('Paula','F',33)]);
 P.money=Math.max(P.money||0,200000);P.job=P.job||{name:'Oficinista',o:'4',k:1,bonus:1};}"""
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896})
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate(SETUP)
    await pg.evaluate("()=>{startDialog(P,DLG.find(d=>d.id==='hermano_prestamo'));showDialog();}");await pg.wait_for_timeout(600)
    await pg.screenshot(path=f'{OUT}/v17m_{L}_1_dialogo.png')
    await pg.evaluate("()=>{hideModal();P.dlg=null;startDialog(P,DLG.find(d=>d.id==='asalto'),{py:.05,roll:40});const MR=Math.random;Math.random=()=>0;try{dlgChoose(1);}finally{Math.random=MR;}showDialog();}");await pg.wait_for_timeout(1500)
    await pg.screenshot(path=f'{OUT}/v17m_{L}_2_resultado.png')
    await pg.evaluate("()=>{dlgNext();hideModal();render();const l=document.querySelector('#log');if(l)l.scrollIntoView();}");await pg.wait_for_timeout(800)
    await pg.screenshot(path=f'{OUT}/v17m_{L}_3_registro.png')
    await pg.close()
async def main():
    os.makedirs(OUT,exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for L in LS:await run(b,L)
        await b.close()
asyncio.run(main())
