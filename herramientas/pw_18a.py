# v1.8a (fase 1 de la ruta 9d): prueba de navegador de la base y comodidad.  python3 herramientas/pw_18a.py imperio.html [idioma]
# Partida en México a los 30 con pareja, amistad y empleo. Recorre: avance automático (×1/×2/×5, pausa ante diálogo), diálogo que ya no te regresa al inicio
# (pantalla de Bancos con pestaña), divisa (selector, ajuste, conversión de dinero y cifras nacionales), Renombrar (cada categoría, renombrar y restaurar),
# bandeja 💬 (abrir, «Más tarde», plazo vencido con «Ignorar»), vida social, Guía y las 4 burbujas ⓘ nuevas.
# Con idioma ≠ es envuelve I18.T y lista lo que sale idéntico y parece español. Capturas en herramientas/capturas/c18a_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'"+LANG+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(3500)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate(PRE,LANG)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());window._dr0=dlgRoll;dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=30;P.s.salud=85;P.partner={name:'Ana López',rel:35,sex:'F',age:29};P.ppl.push({name:'Luis Mora',k:'amigo',rel:75,sex:'M',age:31});save();render();}")
        shot=lambda n: pg.screenshot(path=f'{SH}/c18a_{LANG}_{n}.png')
        R={}
        # 1) diálogo al avanzar con una pantalla abierta → vuelves a esa pantalla
        await pg.evaluate("()=>{closeSheet();showBanks();}");await pg.wait_for_timeout(300)
        tabs=await pg.query_selector_all('#sheetIn .ntabs button, #sheetIn .mkt button, #sheetIn .vtabs button')
        if len(tabs)>1: await tabs[1].click(); await pg.wait_for_timeout(250)
        k0=await pg.evaluate("()=>SHK.key")
        await pg.evaluate("()=>{CFG.tu='m';__ctx='diálogo forzado';dlgRoll=function(days){dlgRoll=function(){return 0};const n=natOf(P);const d=DLG.find(x=>x.cat==='política'||x.cat==='salud')||DLG.find(x=>!x.luck);P.dLast=null;if(startDialog(P,d))return 1;return 0;};}")
        await pg.click('#ageBtn');await pg.wait_for_timeout(600)
        R['dlg_abierto']=await pg.evaluate("()=>!!P.dlg&&$('modal').classList.contains('on')")
        for _ in range(8):
            if not await pg.evaluate("()=>!!P.dlg"): break
            btn=await pg.query_selector('#modal .opt:not([disabled]), #modal #dGo')
            if not btn: break
            await btn.click();await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(400)
        R['vuelve_a_pantalla']=await pg.evaluate("(k0)=>sheetIsOpen()&&SHK.key===k0",k0)
        JS=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const R={};
         // 2) avance automático
         closeSheet();__ctx='avance automático';CFG.asp=5;autoUI();const d0=absDay();$('apB').click();await W(2300);R.auto_dias=absDay()-d0;R.auto_on=AUTO.on;
         dlgRoll=function(days){dlgRoll=function(){return 0};const d=DLG.find(x=>x.cat==='política'||x.cat==='salud')||DLG.find(x=>!x.luck);P.dLast=null;if(startDialog(P,d))return 1;return 0;};await W(900);
         R.auto_pausa_dialogo=!AUTO.on&&!!P.dlg;P.dlg=null;hideModal();$('apS').click();R.vel=CFG.asp;
         // 3) divisa
         __ctx='divisa';const m0=fmt(P.dinero),n0=fmtN(1e12);showCurView();await W(150);R.monedas=document.querySelectorAll('#sheetIn [data-cv]').length;
         document.querySelector('#sheetIn [data-cv="EUR"]').click();await W(150);R.eur=[m0,fmt(P.dinero),n0,fmtN(1e12),$('pCur').textContent];
         showSettings();await W(120);__ctx='ajustes';R.ajuste=[...document.querySelectorAll('#sheetIn .item .t')].some(t=>/💱/.test(t.textContent));
         CURV='loc';CFG.curv='loc';saveCfg();render();
         // 4) renombrar
         __ctx='renombrar';$('nMore').click();await W(150);showRename(null);await W(120);const cats=[...document.querySelectorAll('#sheetIn [data-rc]')].map(x=>x.dataset.rc);R.categorias=cats.length;
         for(const c of cats){__ctx='renombrar '+c;showRename(c);await W(90);}
         showRename('nat');await W(80);const it=document.querySelector('#sheetIn [data-rk^="nat:MEX"]')||document.querySelector('#sheetIn [data-rk]');it.click();await W(120);
         const inp=document.querySelector('#akT');inp.value='República del Sol';document.querySelector('#akY').click();await W(250);R.renombrado=natOf(P).name;
         showRename('nat');await W(80);const q=document.querySelector('#renQ');q.value='Sol';q.oninput();await W(400);const rr=document.querySelector('#sheetIn [data-rr]');R.restaurar_visible=!!rr;if(rr){rr.click();await W(150);}R.restaurado=natOf(P).name;
         // 5) bandeja
         __ctx='bandeja';closeSheet();const n=natOf(P);const d=DLG.find(x=>DQ_CAT.has(x.cat)&&(!x.npc||x.npc(P,n))&&x.w(P,n)>0);startDialog(P,d);const D=P.dlg;P.dlg=null;const c=Object.assign({},D.c);delete c.npc;
         P.dq=[{id:D.id,node:D.node,ref:D.ref,c,cat:d.cat,t:absDay(),exp:absDay()+12}];DQ_NOTE=d.title;render();await W(200);R.chip=$('dqB').textContent;
         $('dqB').click();await W(200);R.bandeja=document.querySelectorAll('#sheetIn [data-dq]').length;document.querySelector('#sheetIn [data-dq]').click();await W(350);
         R.mas_tarde=!!document.querySelector('#modal .dqx');document.querySelector('#modal .dqx').click();await W(450);R.regresa_bandeja=sheetIsOpen()&&(P.dq||[]).length===1;
         closeSheet();P.dq[0].exp=absDay()+2;P.dLast=null;dlgRoll=window._dr0;CFG.tu='s';advanceUnit('s');await W(450);R.vence_aparece=!!(P.dlg&&P.dlg.due);
         R.ignorar=!!document.querySelector('#modal .dqx');if(R.ignorar){document.querySelector('#modal .dqx').click();await W(300);}R.log=P.log.slice(-1)[0].t;dlgRoll=function(){return 0};
         showInbox();await W(150);R.social=!!document.querySelector('#sheetIn .sect');
         // 6) Guía y ayuda
         __ctx='guía';const gi=GUIA.findIndex(g=>/⏩/.test(g[0]));R.guia=gi>=0;
         __ctx='ayuda';for(const k of ['Conversaciones pendientes','Tu vida social','Divisa para ver el dinero','Renombrar']){const h=HELP.find(e=>e[0]===k);if(h&&typeof I18!=='undefined'&&I18){I18.T(h[1]);}}
         return R;}"""
        R.update(await pg.evaluate(JS))
        await pg.evaluate("()=>{showCurView();}");await pg.wait_for_timeout(500);await shot('divisa')
        await pg.evaluate("()=>{showRename('club');}");await pg.wait_for_timeout(500);await shot('renombrar')
        await pg.evaluate("()=>{showInbox();}");await pg.wait_for_timeout(500);await shot('bandeja')
        await pg.evaluate("()=>{closeSheet();const n=natOf(P);const d=DLG.find(x=>DQ_CAT.has(x.cat)&&(!x.npc||x.npc(P,n))&&x.w(P,n)>0);startDialog(P,d);P.dlg.q={t:absDay(),exp:absDay()+9,cat:d.cat};showDialog();}");await pg.wait_for_timeout(600);await shot('dialogo')
        await pg.evaluate("()=>{P.dlg=null;hideModal();CFG.asp=2;autoStart();}");await pg.wait_for_timeout(1200);await shot('reloj');await pg.evaluate("()=>autoStop()")
        miss=await pg.evaluate("()=>window.__miss")
        print(json.dumps(R,ensure_ascii=False))
        print('errores JS:',len(perr),perr[:5])
        if LANG!='es':
            print('sin traducir:',len(miss))
            for t,c in list(miss.items())[:40]: print('  ·',t[:110],'|',c)
        await b.close()
asyncio.run(main())
