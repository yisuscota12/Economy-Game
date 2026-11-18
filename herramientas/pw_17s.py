# v1.7s (etapa D): prueba de navegador del fútbol mánager.  python3 herramientas/pw_17s.py imperio.html [idioma]
# Partida en México a los 35: recorre ⚽ Fútbol mundial (las 5 pestañas, ficha de club desde la tabla, mercado), compra un club desde la ficha,
# recorre las 6 pestañas de ⚽ Tu club y hace cada acción (masa salarial, boletos, obras con permiso, academia, capital, DT, licencias, dirigir
# tú mismo y cambiar de estilo, fichar, vender, aceptar una oferta), avanza 4 meses, vende el club y funda otro con nombre propio.
# Después, una carrera de futbolista para ver el DT y el encaje táctico en Jugador y Club.
# Con idioma ≠ es envuelve I18.T y lista lo que sale idéntico y parece español. Capturas en herramientas/capturas/c17s_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896});perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'"+LANG+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(3500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='35';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate(PRE,LANG)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=35;P.s.salud=85;P.dinero=toInt(3e9,'USD');save();render();}")
        shot=lambda n: pg.screenshot(path=f'{SH}/c17s_{LANG}_{n}.png')
        JS=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const errs=[];const R={mundo:{},club:{},acc:{},fb:{}};const boost=()=>{P.ft=400;P.dinero=Math.max(P.dinero,toInt(3e9,'USD'));P.s.salud=85;P.event=null;P.dlg=null;};
         const click=async(sel,root)=>{const el=(root||document).querySelector(sel);if(el&&!el.disabled){el.click();await W(70);return true;}return false;};
         const yes=async()=>{await W(40);return click('#akY');};const closeAll=()=>{try{hideModal();}catch(e){}};
         try{
         ftEnsure();for(const t of ['lig','cop','sel','mer','his']){__ctx='mundo '+t;FBV.wtab=t;showFTWorld();await W(120);R.mundo[t]=document.querySelectorAll('#sheetIn tr,#sheetIn .item').length;}
         FBV.wtab='lig';FBV.lg='ESP1';showFTWorld();await W(100);__ctx='ficha de club';const td=document.querySelector('#sheetIn td[data-ftc]');if(td){td.click();await W(120);}R.mundo.ficha=!!document.querySelector('#modal.on .cb7card');
         // comprar desde la ficha
         __ctx='comprar desde la ficha';if(await click('#ccB')){await yes();await W(120);}R.club.compra=!!P.ftc;
         if(!P.ftc){const L=G.ft.L.ESP1;ftcBuy(P,L.cl[8]);}
         const o=P.ftc,c=G.ft.C[o.c];G.ft.cm=6;
         for(const t of ['res','pla','mer','ins','fin','lic']){boost();__ctx='club '+t;showFTC(t);await W(120);R.club[t]=document.querySelectorAll('#sheetIn .item,#sheetIn .cb7card,#sheetIn tr').length;}
         // acciones
         boost();showFTC('pla');await W(60);__ctx='masa salarial';await click('#sheetIn [data-wk7="4"]');R.acc.wk=o.wk;
         showFTC('fin');await W(60);__ctx='boletos';await click('#sheetIn [data-pr7="0"]');R.acc.pr=o.pr;
         showFTC('fin');await W(60);__ctx='aportar';await click('#sheetIn [data-f7="in2"]');R.acc.caja=Math.round(o.caja/1e6);showFTC('fin');await W(60);__ctx='retirar';await click('#sheetIn [data-f7="wd0"]');
         showFTC('ins');await W(60);__ctx='estadio';await click('#sheetIn [data-f7="st1"]');R.acc.permiso=!!o.pm;showFTC('ins');await W(60);__ctx='academia';await click('#sheetIn [data-f7="aca"]');R.acc.aca=o.aca;
         showFTC('pla');await W(60);__ctx='contratar DT';if(await click('#sheetIn [data-f7^="dt:"]'))await yes();await W(80);R.acc.dt=(G.ft.D[c.dt]||{}).n;
         // licencias y dirigir tú mismo
         P.ftl={lv:3,y:G.year-2,q:60,xp:0};boost();showFTC('lic');await W(60);__ctx='licencia pro';await click('#sheetIn [data-f7="lic4"]');R.acc.lic=P.ftl.lv;closeAll();
         showFTC('pla');await W(60);__ctx='dirigir';if(await click('#sheetIn [data-f7="self"]'))await yes();await W(80);R.acc.self=!!(G.ft.D[c.dt]&&G.ft.D[c.dt].me);
         showFTC('pla');await W(60);__ctx='estilo';await click('#sheetIn [data-sty7="pre"]');R.acc.sty=ftCSty(c);
         // mercado: fichar, vender y oferta
         boost();o.caja+=5e8;showFTC('mer');await W(60);__ctx='fichar';await click('#sheetIn [data-f7^="bs:"]');R.acc.fichadas=ftStarsOf(c.i).length;
         showFTC('mer');await W(60);__ctx='vender';await click('#sheetIn [data-f7^="ss:"]');await W(80);R.acc.ofertaVenta=!!o.so;__ctx='vender confirmar';await click('#sheetIn [data-f7="soy"]');
         const s=ftStarsOf(c.i)[0];if(s){o.bids.push({s:s.i,cl:G.ft.L.GBR1.cl[0],fee:ftSV(s)*1.3});showFTC('mer');await W(60);__ctx='oferta recibida';R.acc.ofertaVista=!!document.querySelector('#sheetIn [data-f7="ba0"]');await click('#sheetIn [data-f7="ba0"]');}
         // avanza 4 meses
         closeAll();closeSheet();for(let i=0;i<4;i++){boost();__ctx='mes';ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;}R.acc.meses=o.h.length;
         for(const t of ['res','fin']){__ctx='club '+t+' 2';showFTC(t);await W(100);}
         // ficha de tu club y menú carrera
         __ctx='ficha propia';ftClubCard(c.i);await W(80);closeAll();R.acc.carrera=!!careerOptions().find(x=>/Tu club de fútbol/.test(x.t));
         // vender y fundar
         showFTC('res');await W(60);__ctx='vender club';if(await click('#sheetIn [data-f7="sell"]'))await yes();await W(80);R.acc.vendido=!P.ftc;
         boost();showFTC('fun');await W(80);__ctx='fundar';await click('#sheetIn [data-c17="5"]');showFTC('fun');await W(40);if(await click('#sheetIn [data-f7="found"]')){await W(60);const i=document.querySelector('#akT');if(i)i.value='Atlético Prueba';await click('#akY');await W(120);}
         R.acc.fundado=P.ftc?G.ft.C[P.ftc.c].n:null;if(P.ftc){for(const t of ['res','ins','fin']){__ctx='fundado '+t;showFTC(t);await W(100);}}
         }catch(e){errs.push(e.message+' '+(e.stack||'').split('\n')[1]);}
         if(typeof I18!=='undefined'&&I18&&LANG_!=='es'){__ctx='registro';for(const e of P.log.slice(-60))I18.T(e.t);for(const e of G.ft.ev.slice(-30))I18.T(e.t);}
         return {R,errs};}""".replace('LANG_',json.dumps(LANG))
        res=await pg.evaluate(JS)
        print(json.dumps(res['R'],ensure_ascii=False))
        for e in (res['errs']+perr)[:12]:print('   !',e)
        for n,js in [('mundo_mer',"FBV.wtab='mer';showFTWorld()"),('ficha',"ftClubCard(G.ft.L.GBR1.cl[0])"),('fun_res',"showFTC('res')"),('fun_ins',"showFTC('ins')")]:
            await pg.evaluate("()=>{try{hideModal();}catch(e){}"+js+"}");await pg.wait_for_timeout(500);await shot(n)
        # club comprado: capturas de cada pestaña
        await pg.evaluate("()=>{try{hideModal();}catch(e){}if(P.ftc)ftcSellClub(P);P.dinero=toInt(3e9,'USD');ftcBuy(P,G.ft.L.GBR1.cl[6]);G.ft.cm=6;const o=P.ftc;o.caja+=3e8;for(let i=0;i<3;i++){ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;}G.ft.cm=6;}")
        for t in ['res','pla','mer','ins','fin','lic']:
            await pg.evaluate(f"()=>{{try{{hideModal();}}catch(e){{}}showFTC('{t}');}}");await pg.wait_for_timeout(450);await shot('club_'+t)
        # futbolista: DT y encaje
        fbres=await pg.evaluate(r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const R={};try{if(P.ftc)ftcSellClub(P);P.age=19;P.fc=null;fcStart(P,'futbol');const fb=fbOf(P);if(!fb.cl||fb.youth){const C=Object.values(G.ft.C).filter(c=>c.c===natOf(P).id&&c.l).sort((a,b)=>a.r-b.r);fbSign(P,C[3].i,0,1e5,3,'rot');}
            fb.pos=4;__ctx='futbolista jug';FBV.tab='jug';showFB();await W(150);R.jug=[...document.querySelectorAll('#sheetIn .kv span')].some(x=>/Encaje|encaje|Estilo del DT/.test(x.textContent)||x.textContent.length>0);
            __ctx='futbolista club';FBV.tab='clu';showFB();await W(150);R.clu=!!document.querySelector('#sheetIn .cb7card');const c=G.ft.C[fb.cl];__ctx='DT nuevo';ftDTSet(c,ftDTPick(c));R.log=P.log.slice(-1)[0].t;
            if(typeof I18!=='undefined'&&I18)I18.T(R.log);}catch(e){R.err=e.message+' '+(e.stack||'').split('\n')[1];}return R;}""")
        print('futbolista:',json.dumps(fbres,ensure_ascii=False))
        for t in ['jug','clu']:
            await pg.evaluate(f"()=>{{try{{hideModal();}}catch(e){{}}FBV.tab='{t}';showFB();}}");await pg.wait_for_timeout(450);await shot('fb_'+t)
        miss=await pg.evaluate("()=>window.__miss")
        for e in perr[:8]:print('   !',e)
        if LANG!='es':
            json.dump(miss,open(f'/tmp/c17s_{LANG}.json','w'),ensure_ascii=False,indent=0);print(f'TOTAL {LANG}: {len(miss)} textos sin traducir')
            for s,w in list(miss.items())[:int(os.environ.get('NES','40'))]:print(' ·',s[:150],' ⟵',w[0])
        await b.close()
asyncio.run(main())
