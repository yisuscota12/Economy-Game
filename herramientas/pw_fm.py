# Prueba en navegador de la v1.6d: python3 herramientas/pw_fm.py [carrera]   (música por omisión)
import asyncio,os,sys
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));SH=os.path.join(H,'capturas','');os.makedirs(SH,exist_ok=True)
K=sys.argv[1] if len(sys.argv)>1 else 'musica'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},device_scale_factor=2,is_mobile=True,has_touch=True)
        errs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'es'}))")
        await pg.goto('file://'+os.path.abspath(os.path.join(H,'..','imperio.html'))); await pg.wait_for_timeout(4000)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='22';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}"); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("(k)=>{P.age=22;P.s.salud=85;P.dinero=4e6;dlgRoll=function(){return 0};const t0=performance.now();const r=fcStart(P,k);log(r,'big');const fm=fmOf(P);fm.at=fm.at.map(v=>v+30);P.fc.sk=fmOvr(fm,FM[k]);P.fc.fans={loc:9e4,nac:4e5,int:6e4};P.ft=120;save();render();return [Math.round(performance.now()-t0),r]}",K)
        print('start',r)
        shot=lambda n: pg.screenshot(path=SH+f'd_{K}_{n}.png')
        await pg.evaluate("()=>{showFame();}"); await pg.wait_for_timeout(500); await shot('01_per')
        # banco: pedir crédito
        await pg.evaluate("()=>{showBanks('cr');}"); await pg.wait_for_timeout(300)
        d0=await pg.evaluate("()=>P.debts.length"); bt=await pg.query_selector('#sheetIn [data-ln]:not([disabled])')
        if bt: await pg.evaluate("e=>e.click()",bt); await pg.wait_for_timeout(300)
        print('credito: deudas',d0,'->',await pg.evaluate("()=>P.debts.length"),'| hoja abierta',await pg.evaluate("()=>sheetIsOpen()")); await shot('02_banco')
        # obras: proyecto / audición
        await pg.evaluate("()=>{FMV.tab='obr';showFM();}"); await pg.wait_for_timeout(300); await shot('03_obr')
        for i in range(8):
            ok=await pg.evaluate("()=>{const F=fmOf(P);if(F.proj)return 1;P.ft=120;const b=document.querySelector('#sheetIn [data-a^=aud]:not([disabled]),#sheetIn [data-a^=new]:not([disabled])');if(b)b.click();return 0}")
            await pg.wait_for_timeout(1100); await pg.evaluate("()=>{const o=document.querySelector('#modal #nOk');if(o)o.click();}"); await pg.wait_for_timeout(250)
            if ok: break
        await pg.evaluate("()=>{P.ft=200;const b=document.querySelector('#sheetIn [data-a=all]');if(b)b.click();}"); await pg.wait_for_timeout(500); await shot('04_proy')
        print('proyecto',await pg.evaluate("()=>{const F=fmOf(P);return F.proj?[F.proj.t,F.proj.n]:null}"),'| hoja',await pg.evaluate("()=>[sheetIsOpen(),FMV.tab]"))
        await pg.evaluate("()=>{P.ft=200;const b=document.querySelector('#sheetIn [data-a=rel]');if(b)b.click();}"); await pg.wait_for_timeout(500); await shot('05_lanzado')
        print('catalogo',await pg.evaluate("()=>fmOf(P).cat.map(w=>[w.t,w.q,w.cr,w.pu])"))
        # industria: ofertas y negociación
        await pg.evaluate("()=>{P.ft=200;FMV.tab='ind';fmOffersGen(P,true)||fmOffersGen(P,true)||fmOffersGen(P,true);showFM();}"); await pg.wait_for_timeout(300); await shot('06_ind')
        await pg.evaluate("()=>{const b=document.querySelector('#sheetIn [data-of=ng]');if(b)b.click();}"); await pg.wait_for_timeout(1100); await shot('07_dado')
        await pg.evaluate("()=>{const o=document.querySelector('#modal #nOk');if(o)o.click();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const b=document.querySelector('#sheetIn [data-of=ok]');if(b)b.click();}"); await pg.wait_for_timeout(400)
        print('contrato',await pg.evaluate("()=>{const F=fmOf(P);return F.co?[fmCo(P).n,F.co.roy,F.co.rec]:null}"))
        # escena
        for sub in ['lis','rnk','pre','not','col']:
            await pg.evaluate(f"()=>{{FMV.tab='esc';FMV.sub='{sub}';showFM();}}"); await pg.wait_for_timeout(250); await shot('08_esc_'+sub)
        await pg.evaluate("()=>{const r=document.querySelector('#sheetIn [data-ar]');if(r)r.click();}"); await pg.wait_for_timeout(300); await shot('09_ficha')
        await pg.evaluate("()=>{P.ft=200;const r=document.querySelector('#modal [data-x=meet]');if(r)r.click();}"); await pg.wait_for_timeout(1100)
        await pg.evaluate("()=>{const o=document.querySelector('#modal #nOk');if(o)o.click();}"); await pg.wait_for_timeout(300)
        # en vivo: presentación
        await pg.evaluate("()=>{P.ft=200;FMV.tab='viv';showFM();}"); await pg.wait_for_timeout(300); await shot('10_viv')
        await pg.evaluate("()=>{const b=document.querySelector('#sheetIn [data-a=gig1]:not([disabled]),#sheetIn [data-a=gig0]:not([disabled])');if(b)b.click();}"); await pg.wait_for_timeout(500); await shot('11_show')
        for i in range(6):
            o=await pg.query_selector('#modal [data-mo]')
            if not o: break
            await pg.evaluate("e=>e.click()",o); await pg.wait_for_timeout(250)
        await shot('12_show_fin'); await pg.evaluate("()=>{const o=document.querySelector('#modal #ok');if(o)o.click();}"); await pg.wait_for_timeout(400)
        print('show',await pg.evaluate("()=>{const F=fmOf(P);return [F.st8.sh,F.st8.att,!!F.gig,sheetIsOpen(),FMV.tab]}"))
        # gira y avance del reloj con la hoja abierta (debe volver a la misma pestaña)
        await pg.evaluate("()=>{P.ft=200;const b=document.querySelector('#sheetIn [data-a=tour1]:not([disabled]),#sheetIn [data-a=tour0]:not([disabled])');if(b)b.click();}"); await pg.wait_for_timeout(400)
        for i in range(4):
            await pg.evaluate("()=>{P.dlg=null;P.event=null;CFG.tu='m';document.querySelector('#ageBtn').click();}"); await pg.wait_for_timeout(900)
            st=await pg.evaluate("()=>{const F=fmOf(P);return {fecha:dateStr(),gira:F.tour?F.tour.i+'/'+F.tour.d.length:null,gig:!!F.gig,gala:!!F.gala,modal:modalOn(),hoja:sheetIsOpen(),tab:FMV.tab}}"); print('mes',st)
            if st['gig']:
                await shot('13_gira_noche')
                for j in range(6):
                    o=await pg.query_selector('#modal [data-mo]')
                    if not o: break
                    await pg.evaluate("e=>e.click()",o); await pg.wait_for_timeout(250)
                await pg.evaluate("()=>{const o=document.querySelector('#modal #ok');if(o)o.click();}"); await pg.wait_for_timeout(400)
            elif st['modal']: await pg.evaluate("()=>{P.dlg=null;P.event=null;hideModal();render();}"); await pg.wait_for_timeout(300)
        await shot('14_viv_gira')
        # ceremonia forzada
        await pg.evaluate("()=>{hideModal();closeSheet();const F=fmOf(P),D=FM[P.fc.k],W=fmW(P.fc.k);F.gig=null;const A=Object.values(W.A).slice(0,4);F.gala={y:G.year,st:0,cats:D.aw[2].map(([n],i)=>({n,noms:[[fullName(P),F.cat[0]?F.cat[0].t:'',1]].concat(A.map(a=>[a.n,'Obra',0])),w:i%2?1:0}))};save();render();}"); await pg.wait_for_timeout(600); await shot('15_gala')
        await pg.evaluate("()=>{const o=document.querySelector('#modal [data-c]');if(o)o.click();}"); await pg.wait_for_timeout(300); await shot('16_gala_sobres')
        await pg.evaluate("()=>{const o=document.querySelector('#modal [data-s]');if(o)o.click();}"); await pg.wait_for_timeout(300); await shot('17_gala_fin')
        await pg.evaluate("()=>{const o=document.querySelector('#modal #ok');if(o)o.click();}"); await pg.wait_for_timeout(400)
        print('gala',await pg.evaluate("()=>{const F=fmOf(P);return [!!F.gala,F.lastGala&&F.lastGala.wins,P.fc.aw.length]}"))
        # trayectoria, Carrera (debe quedarse abierta tras elegir) y avance de un año
        await pg.evaluate("()=>{FMV.tab='tra';showFM();}"); await pg.wait_for_timeout(300); await shot('18_tra')
        await pg.evaluate("()=>{closeSheet();document.querySelector('#nCar').click();}"); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{P.ft=200;const S=document.querySelector('#sheet');S.scrollTop=300;const it=[...document.querySelectorAll('#sheetIn .item:not([disabled])')].find(x=>/curso|Leer|Estudiar|empleo|Buscar/i.test(x.textContent))||document.querySelectorAll('#sheetIn .item:not([disabled])')[1];window._t=it?it.textContent.slice(0,40):'';if(it)it.click();}"); await pg.wait_for_timeout(500)
        print('carrera tras accion',await pg.evaluate("()=>[window._t,sheetIsOpen(),shKey(),document.querySelector('#sheet').scrollTop,modalOn()]")); await shot('19_carrera')
        await pg.evaluate("()=>{P.dlg=null;P.event=null;hideModal();closeSheet();CFG.tu='a';advanceUnit('a');}"); await pg.wait_for_timeout(3000)
        print('año',await pg.evaluate("()=>{const F=fmOf(P);return {fecha:dateStr(),modal:modalOn(),off:F.off.length,rk:F.rk,fans:Math.round(fcFans(P.fc)),KB:Math.round(JSON.stringify(G.fm).length/1024)}}"))
        await shot('20_fin')
        print('ERRS',errs[:20])
        await b.close()
asyncio.run(main())
