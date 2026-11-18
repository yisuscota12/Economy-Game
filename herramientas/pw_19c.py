# v1.9c (fase 2 de la ruta 9d, parte 3): prueba de navegador.  python3 herramientas/pw_19c.py imperio.html [idioma] [tema]
# Recorre: créditos de la portada (game-icons.net con autores, Lottie), set de íconos «Juego» (fuente, Ajustes con 3 opciones, cambiar a
# Línea y a emoji del sistema con recarga, volver a Juego), animaciones Lottie (logro, ascenso, victoria; prioridad; avance rápido y
# modo Líder sin animación; apagadas; «Probar»), ejércitos desde la burbuja (lista, elegir, dividir, automático, mover con aviso y
# destino), estilo nuevo en gobierno y Bolsa (tarjetas en Ejército, Economía, ficha de país, Diplomacia, Ranking y Gabinete; pestañas
# de la Bolsa). Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c19c_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{lastLvl:'m',tut:1,tutDone:1,help:1,covTest:1,lang:'%s',theme:'%s',lot:'on',dsa:'off'}"%(LANG,THEME)
NEWGAME="""()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}"""
CLEAN="""()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=30;P.dinero=5e6;render();}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify("+CFG0+"))")
        await pg.goto(URL);await pg.wait_for_timeout(600)
        await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c19c_{LANG}_{n}.png')
        async def nav(js):   # ejecuta algo que recarga la página y espera la navegación de verdad (con la CPU ocupada tarda más de 3 s)
            r=None
            try:
                async with pg.expect_navigation(wait_until='load',timeout=40000):
                    try: r=await pg.evaluate(js)
                    except Exception: pass
            except Exception: pass
            return r
        async def recarga():
            for _ in range(120):
                await pg.wait_for_timeout(300)
                try:
                    if await pg.evaluate("()=>!window.__viejo&&typeof IVS==='function'&&typeof P!=='undefined'&&document.readyState==='complete'"):break
                except Exception:pass
            await pg.wait_for_timeout(1500);await pg.evaluate(PRE,LANG)
        R={}
        # --- portada: créditos
        R['creditos']=await pg.evaluate("""()=>{const c=document.querySelector('#cover #cvCrB');if(!c)return null;const t=c.textContent;
            return {gameicons:/game-icons\\.net/.test(t),autores:(c.querySelector('.cv-aut')||{}).textContent||'',lottie:/Lottie/.test(t),tabler:/Tabler/.test(t),gsap:/GSAP/.test(t)};}""")
        await pg.evaluate("()=>{__ctx='créditos';$('cvCr').click();}");await pg.wait_for_timeout(500);await shot('creditos')
        await pg.evaluate("()=>{$('cvCrX').click();$('cvNew').click();}");await pg.wait_for_timeout(300)
        await pg.evaluate(NEWGAME);await pg.wait_for_timeout(1500)
        await pg.evaluate(CLEAN);await pg.wait_for_timeout(600)
        # --- 1) íconos: set «Juego»
        R['iconos']=await pg.evaluate("()=>({set:IVS(),dataset:document.documentElement.dataset.ivs,juego:$('ivif')?$('ivif').textContent.indexOf(IVJ_B64.slice(0,60))>0:false,autores:IVJ_AUT.length,game_icons:IVJ_N,fuentes_distintas:IVJ_B64!==IVI_B64})")
        await shot('principal')
        R['ajustes_iconos']=await pg.evaluate("async()=>{__ctx='ajustes';showSettings();await new Promise(r=>setTimeout(r,400));const x=$('cfIvs');if(!x)return null;const old=[...document.querySelectorAll('#sheetIn .item')].filter(i=>/🎨/.test(i.textContent)&&i!==x).length;return {opciones:[...x.querySelectorAll('[data-ivs]')].map(b=>b.dataset.ivs+(b.classList.contains('on')?'*':'')),boton_viejo:old,lot:!!$('cfLot')};}")
        await shot('ajustes')
        await pg.evaluate("()=>{const x=$('cfLot');x&&x.scrollIntoView();}");await pg.wait_for_timeout(300);await shot('ajustes_lottie')
        # cambiar a Línea (recarga) y comprobar la fuente
        await pg.evaluate("async()=>{showSettings();await new Promise(r=>setTimeout(r,500));}")
        R['clic_linea']=await nav("()=>{const b=document.querySelector('#cfIvs [data-ivs=l]');if(!b)return 'sin botón';window.__viejo=1;setTimeout(()=>b.click(),0);return 'ok';}") or 'ok'
        await recarga()
        R['cambio_linea']=await pg.evaluate("()=>({cfg:(localStorage.getItem('imperioCfg').match(/\"ivs\":\"\\w\"/)||['?'])[0],set:IVS(),linea:$('ivif')?$('ivif').textContent.indexOf(IVI_B64.slice(0,60))>0:false,partida:!!(P&&P.alive)})")
        await nav("()=>{window.__viejo=1;CFG.ivi=0;saveCfg();saveNow();setTimeout(()=>location.reload(),0);}")
        await recarga()
        R['cambio_emoji']=await pg.evaluate("()=>({set:IVS(),sin_fuente:!$('ivif'),partida:!!(P&&P.alive)})")
        await nav("()=>{window.__viejo=1;CFG.ivi=1;CFG.ivs='j';saveCfg();saveNow();setTimeout(()=>location.reload(),0);}")
        await recarga()
        R['vuelta_juego']=await pg.evaluate("()=>IVS()")
        await pg.evaluate("()=>{if($('cover')&&CV.on){const g=$('cvGo');g&&g.click();}}");await pg.wait_for_timeout(400)
        await pg.evaluate(CLEAN);await pg.wait_for_timeout(400)
        # --- 2) Lottie
        L=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};LOTX.last=0;LOTX.lastK=0;
          o.encendido=lotOn();
          log('🏅 Logro: Prueba — algo.','big');await W(450);o.logro=LOTX.played;o.svg=!!document.querySelector('#lotfx svg');o.texto=(document.querySelector('#lotfx .lot-t')||{}).textContent||'';await W(2800);o.cerrada=!document.querySelector('#lotfx');
          LOTX.last=0;log('¡Ascenso! Ahora eres Gerente.','good');await W(450);o.ascenso=LOTX.played;await W(2800);
          LOTX.last=0;log('🏅 Logro: Otro — algo.','big');log('🏆 ¡Campeón: Club!','big');await W(450);o.prioridad=LOTX.played;await W(2800);
          LOTX.last=0;const n0=LOTX.n;FF_ON=true;log('🏆 ¡Campeón: Club!','big');await W(450);FF_ON=false;o.avance_rapido_sin=LOTX.n===n0;
          const n1=LOTX.n;LOTX.mute++;log('Ahora gobiernas México como Presidente.','big');LOTX.mute--;await W(450);o.lider_sin=LOTX.n===n1;
          LOTX.last=0;CFG.lot='off';const n2=LOTX.n;log('🏆 ¡Campeón: Club!','big');await W(450);o.apagado_sin=LOTX.n===n2;CFG.lot='on';
          LOTX.last=0;const n3=LOTX.n;log('Pierdes la elección.','bad');await W(450);o.nada_con_otro_texto=LOTX.n===n3;
          o.colores_tema=(()=>{const d=lotData('victoria');let k=0;const w=x=>{if(Array.isArray(x))return x.forEach(w);if(x&&typeof x==='object'){if(x.nm==='A'&&x.c)k++;for(const y in x)w(x[y]);}};w(d);return k;})();
          return o;}"""
        R['lottie']=await pg.evaluate(L)
        await pg.evaluate("()=>{LOTX.last=0;lotPlay('victoria');}");await pg.wait_for_timeout(700);await shot('lottie_victoria');await pg.wait_for_timeout(2600)
        await pg.evaluate("()=>{LOTX.last=0;lotPlay('ascenso');}");await pg.wait_for_timeout(700);await shot('lottie_ascenso');await pg.wait_for_timeout(2600)
        # --- 3) ejércitos desde la burbuja (guerra con Estados Unidos)
        await pg.evaluate("""()=>{__ctx='burbuja ejércitos';P.ruler=true;P.nat=3;G.mhelp=1;declareWar('USA','MEX');syncMando();const rid=Object.keys(RG).find(k=>RG[k].n==='MEX'&&RG[k].nm==='Chihuahua');
            G.armies=G.armies.filter(a=>a.r!==rid);newArmy('MEX',rid,15000);newArmy('MEX',rid,9000);const nb=RG[rid].adj.find(k=>RG[k].n==='USA');newArmy('USA',nb,30000).path=[rid];
            syncArmyIdx&&syncArmyIdx('MEX');syncArmyIdx&&syncArmyIdx('USA');CACHE.wk=null;CACHE.fr=null;G._myAt=null;G.sel=rid;MO.sel=null;renderSel();const w=$('mapWrap');vb.w=900;vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=RG[rid].c[0]-vb.w/2;vb.y=RG[rid].c[1]-vb.h/2;setVB();drawOverlay();window.__rid=rid;}""")
        await pg.wait_for_timeout(400)
        xy=await pg.evaluate("()=>{const c=RG[__rid].c;const b=$('mapWrap').getBoundingClientRect();return [b.left+(c[0]-vb.x)/vb.w*b.width,b.top+(c[1]-vb.y)/vb.h*b.height]}")
        await pg.touchscreen.tap(xy[0],xy[1]);await pg.wait_for_timeout(600)
        R['burbuja']=await pg.evaluate("()=>{const p=document.querySelector('.mpop');if(!p)return null;return {ejercitos:[...p.querySelectorAll('[data-mpar]')].map(x=>x.textContent.trim()+(x.classList.contains('on')?' *':'')),ordenes:[...p.querySelectorAll('[data-mpo]')].map(x=>x.dataset.mpo),mover_generico:!!p.querySelector('[data-mp*=mv]'),total_propios_repetido:[...p.querySelectorAll('.mpc')].some(x=>/var\\(--gold\\)/.test(x.getAttribute('style')||''))}}")
        await shot('burbuja_ejercitos')
        R['elegir']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const L=[...document.querySelectorAll('.mpop [data-mpar]')];const id=+L[1].dataset.mpar;L[1].click();await W(300);const p=document.querySelector('.mpop');return {sel_ok:MO.sel===id,marcado:!!(p&&p.querySelector(`[data-mpar=\"${id}\"].on`)),ficha_marcada:!!document.querySelector('#selInfo .army.on')};}")
        R['automatico']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const a=armyById(MO.sel);const v=a.auto;document.querySelector('.mpop [data-mpo=auto]').click();await W(300);return {cambia:armyById(MO.sel).auto!==v,burbuja_sigue:!!document.querySelector('.mpop')};}")
        await pg.evaluate("async()=>{const a=armyById(MO.sel);if(a.auto){document.querySelector('.mpop [data-mpo=auto]').click();await new Promise(r=>setTimeout(r,300));}}")
        R['dividir']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const n0=document.querySelectorAll('.mpop [data-mpar]').length;document.querySelector('.mpop [data-mpo=split]').click();await W(350);return {antes:n0,despues:document.querySelectorAll('.mpop [data-mpar]').length};}")
        R['mover']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const id=MO.sel;document.querySelector('.mpop [data-mpo=mv]').click();await W(300);return {orden:MO.ord===id,aviso:!!document.querySelector('.mpordh'),burbuja_cerrada:!document.querySelector('.mpop'),id};}")
        await shot('aviso_destino')
        nb=await pg.evaluate("()=>{const t=RG[__rid].adj.find(k=>RG[k].n==='MEX');const c=RG[t].c;const b=$('mapWrap').getBoundingClientRect();return [b.left+(c[0]-vb.x)/vb.w*b.width,b.top+(c[1]-vb.y)/vb.h*b.height,t]}")
        await pg.touchscreen.tap(nb[0],nb[1]);await pg.wait_for_timeout(500)
        R['destino']=await pg.evaluate("(t)=>{const a=armyById(MO.sel);return {sin_orden_pendiente:!MO.ord,aviso_quitado:!document.querySelector('.mpordh'),ruta:a&&a.path&&a.path.length?a.path[a.path.length-1]===t:false};}",nb[2])
        R['cancelar']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const a=myArmies()[0];MO.ord=a.id;render();await W(100);const b=document.querySelector('.mpordh [data-mpox]');if(!b)return null;b.click();await W(150);return {cancelado:!MO.ord,aviso_quitado:!document.querySelector('.mpordh')};}")
        # --- 4) estilo nuevo: vista País y Bolsa
        TABS=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};closeSheet();setView('pa');
          for(const t of ['res','arm','eco','dip','rank','gab']){__ctx='país '+t;setTab(t);await W(350);const b=$('natBody');
            o[t]={tarjetas:b.querySelectorAll('.v19g .plt').length,etiquetas:b.querySelectorAll('.v19rel>span').length,pips:b.querySelectorAll('.v19pip i').length,medidores:b.querySelectorAll('.mnm').length,medallas:b.querySelectorAll('.rk1,.rk2,.rk3').length};}
          __ctx='ficha país';setTab('dip');await W(200);showNationDip('USA');await W(350);const nb=VIEW.tab==='dip'&&$('natBody').querySelector('.v19gov')?$('natBody'):$('sheetIn');o.ficha_pais={tarjetas:nb.querySelectorAll('.v19g .plt').length,gobierno:!!nb.querySelector('.v19gov')};
          setTab('res');setView('pe');await W(200);__ctx='bolsa';showMarket('mk');await W(350);const tb=[...document.querySelectorAll('#sheetIn .mkt button')];const cs=tb.length?getComputedStyle(tb[0]).borderRadius:'';
          o.bolsa={pestanas:tb.length,redondas:parseFloat(cs)>=20};for(const t of ['pf','or','fx','cm','bd']){__ctx='bolsa '+t;showMarket(t);await W(250);}closeSheet();return o;}"""
        R['estilo']=await pg.evaluate(TABS)
        for t in ['arm','eco','gab']:
            await pg.evaluate("(t)=>{closeSheet();setView('pa');setTab(t);const x=$('natTabs');x&&x.scrollIntoView();}",t);await pg.wait_for_timeout(500);await shot('pais_'+t)
        await pg.evaluate("()=>{showNationDip('USA');const x=$('natTabs');x&&x.scrollIntoView();}");await pg.wait_for_timeout(500);await shot('ficha_pais')
        await pg.evaluate("()=>{setTab('res');setView('pe');showMarket('mk');}");await pg.wait_for_timeout(500);await shot('bolsa')
        # --- Guía y ⓘ nuevos
        R['guia']=await pg.evaluate("()=>GUIA.some(g=>/🪖/.test(g[0]))")
        R['ayuda']=await pg.evaluate("()=>['Íconos','Animaciones de momentos clave'].map(k=>HELP.some(h=>h[0]===k))")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='guía';showGuide&&showGuide();await new Promise(r=>setTimeout(r,300));const b=[...document.querySelectorAll('#sheetIn .item, #sheetIn button')].find(x=>/🪖/.test(x.textContent));b&&b.click();await new Promise(r=>setTimeout(r,300));}")
            await shot('guia')
        R['errores_js']=perr[:12]
        if LANG!='es':
            miss=await pg.evaluate("()=>Object.entries(__miss).map(([k,v])=>k+'  ['+v.join(' | ')+']')")
            R['en_español']=len(miss);R['ejemplos_español']=miss[:40]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
