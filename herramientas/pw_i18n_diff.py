# Prueba complementaria de idiomas: python3 herramientas/pw_i18n_diff.py fr  (o en, pt, de, it)
# Recorre las mismas pantallas que pw_i18n.py en español y en el idioma pedido, con la misma semilla de azar,
# y lista los textos que salen idénticos en ambos: son textos sin traducir (o nombres propios y palabras iguales en los dos idiomas).
# No depende de palabras clave, así que también encuentra textos sin acentos ni artículos (por ejemplo «Activista» o «abogado»).
import asyncio,os,sys,json
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__))
URL='file://'+os.path.abspath(os.path.join(H,'..','imperio.html'));L=sys.argv[1] if len(sys.argv)>1 else 'en'
GRAB="""()=>{const r=document.querySelector('#modal.on')||document.querySelector('#sheet.on')||document.body;const o=[];const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const v=n.nodeValue.trim();if(v.length<3||!/[a-záéíóúñ]{3}/i.test(v))continue;if(n.parentNode.closest('[data-noi18n],script,style'))continue;o.push(v);}return o}"""
SEED="""(()=>{let s=12345;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();"""
SCREENS=[('acciones',"document.querySelector('#nAct').click()"),('carrera',"document.querySelector('#nCar').click()"),('nacion',"document.querySelector('#nNat').click()"),('mas',"document.querySelector('#nMore').click()"),('ajustes',"showSettings()"),('bancos',"showBanks('cr')"),('bolsa',"showMarket()"),('partidas',"showSlots()"),('servicios',"typeof showServices==='function'&&showServices()"),('guia',"typeof showGuide==='function'&&showGuide()")]
async def run(p,lang):
    b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True,locale='es-MX')
    await pg.add_init_script(SEED+f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{lang}'}}))")
    await pg.goto(URL); await pg.wait_for_timeout(3500); R={}
    R['inicio']=await pg.evaluate(GRAB)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();m.querySelector('#sA').value='18';document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();render();}"); await pg.wait_for_timeout(500)
    R['principal']=await pg.evaluate(GRAB)
    for nm,js in SCREENS:
        await pg.evaluate("()=>{closeSheet();hideModal();}"); await pg.wait_for_timeout(150)
        try: await pg.evaluate(f"()=>{{{js};}}")
        except Exception as e: pass
        await pg.wait_for_timeout(500); R[nm]=await pg.evaluate(GRAB)
    await pg.evaluate("()=>{closeSheet();P.age=22;fcStart(P,'musica');P.fc.fans={loc:9e4,nac:4e5,int:6e4};showFame();}"); await pg.wait_for_timeout(600)
    R['fama']=await pg.evaluate(GRAB); await b.close(); return R
async def main():
    async with async_playwright() as p:
        ES=await run(p,'es'); X=await run(p,L)
    same={};tot=0
    for k in ES:
        s=sorted(set(ES[k])&set(X.get(k,[])));tot+=len(s)
        if s: same[k]=s
    for k,v in same.items(): print('==',k,len(v)); [print('  ',t[:150]) for t in v]
    print('TOTAL iguales',tot); json.dump(same,open('/tmp/same_'+L+'.json','w'),ensure_ascii=False)
asyncio.run(main())
