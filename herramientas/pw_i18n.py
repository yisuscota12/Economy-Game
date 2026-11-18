# Prueba de idiomas: python3 herramientas/pw_i18n.py en|pt|fr|de|it|ru|tr|id|zh|ja|ko  (capturas y textos que siguen en español por pantalla)
# Detector de español por idioma: se quitan de la lista las palabras y acentos que también son válidos en el idioma probado
# (por ejemplo «de», «la», «en» en francés; «con», «una» en italiano), para no contar falsos positivos.
# Además cuenta como «sin traducir» cualquier texto que exista tal cual como clave del diccionario con otra traducción.
import asyncio,os,sys,re
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));SH=os.path.join(H,'capturas','');os.makedirs(SH,exist_ok=True)
URL='file://'+os.path.abspath(os.path.join(H,'..','imperio.html'));L=sys.argv[1] if len(sys.argv)>1 else 'en'
W0=['de','la','el','los','las','y','en','con','para','por','tu','tus','del','al','años','días','que','una','un']
OVL={'en':([],''),'pt':(['de','que','para','por'],'áéíóú'),'fr':(['de','la','en','un','que','tu'],'é'),'de':([],''),'it':(['la','con','una','un','del','al','tu'],'é'),'ru':([],''),'tr':(['de','en','al','un'],''),'id':(['para'],''),'zh':([],''),'ja':([],''),'ko':([],''),'ar':([],''),'hi':([],'')}
ow,oc=OVL.get(L,([],''))
WRX='\\b('+'|'.join(w for w in W0 if w not in ow)+')\\b|['+''.join(c for c in 'ñáéíóú' if c not in oc)+']'
COUNT="""()=>{const sp=new RegExp('"""+WRX+"""','i');const D=(typeof I18!=='undefined'&&I18&&I18.D)||{};const r=document.querySelector('#modal.on')||document.querySelector('#sheet.on')||document.body;let tot=0,es=0,ej=[];const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const v=n.nodeValue.trim();if(v.length<4||!/\\p{L}/u.test(v))continue;if(n.parentNode.closest('[data-noi18n],script,style'))continue;tot++;if(sp.test(v)||(D[v]!=null&&D[v]!==v)){es++;ej.push(v);}}return [tot,es,ej]}"""
ALL=[]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True,locale='es-MX');errs=[]
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
        await pg.goto(URL); await pg.wait_for_timeout(4000)
        r=await pg.evaluate(COUNT);ALL.extend(r[2]);print('inicio',r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_00_inicio.png')
        await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();m.querySelector('#sA').value='18';document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();render();}"); await pg.wait_for_timeout(500)
        r=await pg.evaluate(COUNT);ALL.extend(r[2]);print('principal',r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_01_principal.png')
        for nm,js in [('acciones',"document.querySelector('#nAct').click()"),('carrera',"document.querySelector('#nCar').click()"),('nacion',"document.querySelector('#nNat').click()"),('mas',"document.querySelector('#nMore').click()"),('ajustes',"showSettings()"),('bancos',"showBanks('cr')"),('bolsa',"showMarket()"),('partidas',"showSlots()")]:
            await pg.evaluate("()=>{closeSheet();hideModal();}"); await pg.wait_for_timeout(150)
            await pg.evaluate(f"()=>{{{js};}}"); await pg.wait_for_timeout(500)
            r=await pg.evaluate(COUNT);ALL.extend(r[2]);print(nm,r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_{nm}.png')
        await pg.evaluate("()=>{closeSheet();P.age=22;fcStart(P,'musica');P.fc.fans={loc:9e4,nac:4e5,int:6e4};showFame();}"); await pg.wait_for_timeout(600)
        r=await pg.evaluate(COUNT);ALL.extend(r[2]);print('fama',r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_fama.png')
        # v1.7g: vista País, pestaña por pestaña (antes no se recorría)
        for k in ['res','prov','arm','eco','dip','war','rank']:
            await pg.evaluate(f"()=>{{closeSheet();hideModal();hlpHide&&hlpHide();setView('pa');setTab('{k}');render();}}"); await pg.wait_for_timeout(600)
            r=await pg.evaluate(COUNT);ALL.extend(r[2]);print('pais_'+k,r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_pais_{k}.png')
        # v1.7j: modo gobernante (B5b). Pestañas de País, cada botón de cada pestaña (máx. 40) y las hojas de recursos, reservas y banca.
        await pg.evaluate("()=>{closeSheet();hideModal();P.ruler=true;P.nat=5;ensureV13&&ensureV13();ensureV14&&ensureV14();window.confirm=()=>false;render();}"); await pg.wait_for_timeout(400)
        for k in ['res','prov','arm','eco','dip','war','rank']:
            go=f"closeSheet();hideModal();hlpHide&&hlpHide();setView('pa');setTab('{k}');render();"
            await pg.evaluate(f"()=>{{{go}}}"); await pg.wait_for_timeout(400)
            r=await pg.evaluate(COUNT);ALL.extend(r[2]);ne=r[1]; await pg.screenshot(path=SH+f'i_{L}_gob_{k}.png')
            n=await pg.evaluate("()=>document.querySelectorAll('#natBody button, #natTop button').length")
            for i in range(min(n,40)):
                await pg.evaluate(f"()=>{{{go}}}"); await pg.wait_for_timeout(120)
                ok=await pg.evaluate(f"()=>{{const x=[...document.querySelectorAll('#natBody button, #natTop button')][{i}];if(!x||/Nueva|Retirar|Declarar|guerra|Abdic|Golpe|Renunc/i.test(x.dataset.k||''))return 0;x.click();return 1;}}")
                if ok: await pg.wait_for_timeout(250); r=await pg.evaluate(COUNT);ALL.extend(r[2]);ne+=r[1]
            print('gob_'+k,n,'botones',ne)
        for nm,js in [('recursos','rzHTML'),('reservas','rvHTML'),('banca','bnkHTML')]:
            await pg.evaluate(f"()=>{{closeSheet();hideModal();openSheet('<h3>·</h3>'+{js}(natOf(P)));}}"); await pg.wait_for_timeout(400)
            r=await pg.evaluate(COUNT);ALL.extend(r[2]);print('gob_'+nm,r[0],r[1]); await pg.screenshot(path=SH+f'i_{L}_gob_{nm}.png')
        await pg.evaluate("()=>{closeSheet();P.ruler=false;setView('pj');render();}")
        print('ERRS',errs[:10]);open('/tmp/es_rest.json','w').write(__import__('json').dumps(ALL,ensure_ascii=False));open(f'/tmp/es_rest_{L}.json','w').write(__import__('json').dumps(sorted(set(ALL)),ensure_ascii=False,indent=0)); await b.close()
asyncio.run(main())
