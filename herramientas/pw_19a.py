# v1.9a (fase 2 de la ruta 9d, parte 1): prueba de navegador.  python3 herramientas/pw_19a.py imperio.html [idioma]
# Recorre: portada (4 estilos, Créditos, Nueva partida → formulario con «Volver a la portada», Continuar), burbuja del mapa (provincia y ciudad,
# botones que llaman a los de la ficha de abajo), ficha del lugar (3 pestañas, Explicar, acciones, ciudad, club), ✏️ en club/bolsa/empresa/país,
# barra del mes y lo próximo con el avance automático, indicador 👥, ajustes nuevos, Guía y ⓘ. Con idioma ≠ es lista lo que sale en español.
# Capturas en herramientas/capturas/c19a_<idioma>_*.png
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
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,covTest:1,lang:'"+LANG+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(600)
        await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c19a_{LANG}_{n}.png')
        R={}
        R['portada_al_abrir']=await pg.evaluate("()=>CV.on&&!!document.querySelector('#cover .cv-logo')&&!$('modal').classList.contains('on')")
        for s in ['noche','planeta','mercados','atlas']:
            await pg.evaluate(f"()=>{{__ctx='portada {s}';document.querySelector('[data-cvs={s}]').click();}}");await pg.wait_for_timeout(900)
            await shot('portada_'+s)
        R['estilo_guardado']=await pg.evaluate("()=>CFG.cover")
        await pg.evaluate("()=>{__ctx='créditos';$('cvCr').click();}");await pg.wait_for_timeout(200);await shot('creditos')
        R['creditos']=await pg.evaluate("()=>$('cover').classList.contains('cr')");await pg.evaluate("()=>$('cvCrX').click()")
        await pg.evaluate("()=>{__ctx='nueva partida';$('cvNew').click();}");await pg.wait_for_timeout(400)
        R['formulario_con_volver']=await pg.evaluate("()=>!!document.querySelector('#modal #sCv')&&!CV.on&&/ECONOMY/.test(document.querySelector('#modal h2').textContent)")
        await pg.evaluate("()=>document.querySelector('#sCv').click()");await pg.wait_for_timeout(300)
        R['volver_a_portada']=await pg.evaluate("()=>CV.on")
        await pg.evaluate("()=>{$('cvNew').click();}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=30;P.dinero=5e6;P.partner={name:'Ana López',rel:72,sex:'F',age:29,alive:true};render();}")
        await pg.wait_for_timeout(600)
        R['titulo']=await pg.evaluate("()=>document.title")
        # portada desde Ajustes: Continuar → vuelve al juego
        await pg.evaluate("()=>{coverShow(true);}");await pg.wait_for_timeout(500);await shot('portada_continuar')
        R['continuar']=await pg.evaluate("()=>{const b=$('cvGo');if(!b)return false;b.click();return !CV.on;}")
        await pg.wait_for_timeout(400)
        # burbuja: toca una provincia
        await pg.evaluate("()=>{__ctx='burbuja';const r=RG[P.r];const w=$('mapWrap');vb.w=900;vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=RG['MEX10'].c[0]-vb.w/2;vb.y=RG['MEX10'].c[1]-vb.h/2;setVB();drawOverlay();}");await pg.wait_for_timeout(500)
        xy=await pg.evaluate("()=>{const c=RG['MEX10'].c;const b=$('mapWrap').getBoundingClientRect();return [b.left+(c[0]-vb.x)/vb.w*b.width,b.top+(c[1]-vb.y)/vb.h*b.height]}")
        await pg.touchscreen.tap(xy[0],xy[1]);await pg.wait_for_timeout(500)
        R['burbuja']=await pg.evaluate("()=>{const p=document.querySelector('.mpop');return p?[...p.querySelectorAll('[data-mp]')].map(x=>x.dataset.mp).join(' | '):null}")
        await shot('burbuja')
        # un botón de la burbuja llama al de la ficha de abajo (Invertir abre su pantalla)
        R['burbuja_invertir']=await pg.evaluate("async()=>{const b=document.querySelector('.mpop [data-mp=\\'[data-pa=\"inv\"]\\']');if(!b)return 'sin botón';b.click();await new Promise(r=>setTimeout(r,250));const ok=sheetIsOpen()&&/Invest|Invertir|投|Inves|Инвест|यत|투자|استثم|निवेश/.test($('sheetIn').textContent);closeSheet();return ok;}")
        # ciudad: Ciudad de México
        await pg.evaluate("()=>{__ctx='burbuja ciudad';const c=CITIES.find(c=>c[3]==='Ciudad de México');const w=$('mapWrap');vb.w=500;vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=c[0]-vb.w/2;vb.y=c[1]-vb.h/2;setVB();drawOverlay();}");await pg.wait_for_timeout(500)
        xy=await pg.evaluate("()=>{const c=CITIES.find(c=>c[3]==='Ciudad de México');const b=$('mapWrap').getBoundingClientRect();return [b.left+(c[0]-vb.x)/vb.w*b.width,b.top+(c[1]-vb.y)/vb.h*b.height]}")
        await pg.touchscreen.tap(xy[0],xy[1]);await pg.wait_for_timeout(500)
        R['burbuja_ciudad']=await pg.evaluate("()=>PL.city!=null&&CITIES[PL.city][3]")
        await shot('burbuja_ciudad')
        # arrastrar el mapa la cierra
        mb=await pg.evaluate("()=>{const b=$('mapWrap').getBoundingClientRect();const q=document.querySelector('.mpop');const pr=q?q.getBoundingClientRect():null;for(const [fx,fy] of [[.92,.9],[.92,.2],[.1,.25],[.5,.95]]){const x=b.left+b.width*fx,y=b.top+b.height*fy;if(!pr||x<pr.left||x>pr.right||y<pr.top||y>pr.bottom)return [x,y];}return [b.left+5,b.top+b.height/2]}");await pg.mouse.move(mb[0],mb[1]);await pg.mouse.down();await pg.mouse.move(mb[0]-60,mb[1]-20,steps=6);await pg.mouse.up();await pg.wait_for_timeout(200)
        R['arrastre_cierra']=await pg.evaluate("()=>!document.querySelector('.mpop')")
        # ficha del lugar
        JS=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const R={};
          __ctx='ficha provincia';CFG.pexp=0;showPlace(P.r,'pr');await W(200);R.ficha_tiles=document.querySelectorAll('#sheetIn .plt').length;R.ficha_acciones=document.querySelectorAll('#sheetIn [data-pli]').length;
          __ctx='ficha explicar';$('plE').click();await W(200);R.explicar=document.querySelectorAll('#sheetIn .ple').length;
          __ctx='ficha país';document.querySelector('[data-plt=pa]').click();await W(200);R.pais_botones=[...document.querySelectorAll('#sheetIn .pla button')].length;
          __ctx='ficha ciudades';document.querySelector('[data-plt=ci]').click();await W(200);R.ciudades=document.querySelectorAll('#sheetIn [data-pcy]').length;
          const cy=document.querySelector('#sheetIn [data-pcy]');if(cy){cy.click();await W(200);}R.ciudad_detalle=!!document.querySelector('#sheetIn .plcy');
          // acción desde la ficha: Mudarte (abre su pantalla)
          showPlace('MEX10','pr');await W(200);const mv=[...document.querySelectorAll('#sheetIn [data-pli]')].find(x=>/🏠/.test(x.textContent));if(mv){mv.click();await W(200);R.ficha_mudarte=sheetIsOpen()&&!!document.querySelector('#sheetIn .item[data-i]');}
          CFG.pexp=0;closeSheet();
          // clubes de la provincia (si hay mundo del fútbol)
          try{ftEnsure();}catch(e){}const cl=Object.values(G.ft&&G.ft.C||{}).find(c=>c.c==='MEX');let rid=null;if(cl){for(const r in RG){if(RG[r].n==='MEX'&&plClubs(r).some(x=>x.i===cl.i)){rid=r;break;}}}
          R.club_en_ficha=!!rid;if(rid){__ctx='ficha clubes';PL.city=null;showPlace(rid,'ci');await W(200);const b=document.querySelector('#sheetIn [data-plc]');if(b){b.click();await W(250);R.ficha_club=$('modal').classList.contains('on');}}
          // ✏️ en ficha de club
          __ctx='renombrar club';const rb=document.querySelector('#modal .renb');R.renb_club=!!rb;if(rb){const id=document.querySelector('#modal [data-ren]').dataset.ren;rb.click();await W(200);document.querySelector('#akT').value='Club Prueba';document.querySelector('#akY').click();await W(300);R.club_renombrado=G.ft.C[id.split(':')[1]].n;hideModal();}
          // ✏️ en empresa de bolsa
          __ctx='renombrar bolsa';ensureV13();bkEnsure(P);const sid=Object.keys(G.mk.C).find(k=>!G.mk.C[k].dead);showStock(sid);await W(200);R.renb_bolsa=!!document.querySelector('#sheetIn .renb');
          // ✏️ país desde la ficha
          __ctx='renombrar país';showPlace(P.r,'pa');await W(200);document.querySelector('#sheetIn [data-ren]').click();await W(200);document.querySelector('#akT').value='República del Sol';document.querySelector('#akY').click();await W(300);R.pais_renombrado=natOf(P).name;renReset('nat:MEX');closeSheet();render();
          // avance automático: barra del mes y lo próximo
          __ctx='avance automático';P.dq=[{id:'x',node:'a',ref:null,c:{},cat:'familia',t:absDay(),exp:absDay()+9}];CFG.asp=5;autoUI();$('apB').click();await W(1300);R.mnx_visible=$('mnx').classList.contains('on');R.mnx=$('mnx').textContent;R.mnx_barra=parseFloat($('mnx').querySelector('i').style.width);
          autoStop();await W(100);R.mnx_oculta=!$('mnx').classList.contains('on');P.dq=[];
          // 👥
          __ctx='vida social';clockUI();R.vs=$('vsB')&&$('vsB').className;$('vsB').click();await W(200);R.vs_abre_bandeja=sheetIsOpen();closeSheet();
          // ajustes
          __ctx='ajustes';showSettings();await W(200);R.ajustes=!!$('cfCover')+!!$('cfMpop');
          $('cfMpop').click();await W(150);R.burbuja_apagada=CFG.mpop===0;CFG.mpop=1;saveCfg();closeSheet();
          // Guía y ⓘ
          __ctx='guía';showGuide();await W(200);const g=[...document.querySelectorAll('#sheetIn summary')].find(x=>/🗺/.test(x.textContent));R.guia=!!g;if(g){g.click();await W(200);R.guia_texto=g.parentNode.querySelector('.gb').textContent.slice(0,60);}closeSheet();
          return R;}"""
        R.update(await pg.evaluate(JS))
        await pg.evaluate("()=>{showPlace(P.r,'pr');}");await pg.wait_for_timeout(300);await shot('ficha')
        await pg.evaluate("()=>{CFG.pexp=1;showPlace(P.r,'pr');}");await pg.wait_for_timeout(300);await shot('ficha_explicar')
        await pg.evaluate("()=>{CFG.pexp=0;showPlace(P.r,'pa');}");await pg.wait_for_timeout(300);await shot('ficha_pais')
        await pg.evaluate("()=>{closeSheet();P.dq=[{id:'x',node:'a',ref:null,c:{},cat:'familia',t:absDay(),exp:absDay()+9}];$('apB').click();}");await pg.wait_for_timeout(1200);await shot('avance');await pg.evaluate("()=>{autoStop();P.dq=[];}")
        miss=await pg.evaluate("()=>window.__miss")
        print(json.dumps(R,ensure_ascii=False,indent=1))
        if LANG!='es':
            print('En español (%d):'%len(miss))
            for k,v in list(miss.items())[:60]: print(' ',k[:110],'←',v)
        print('Errores JS:',perr[:10])
        await b.close()
asyncio.run(main())
