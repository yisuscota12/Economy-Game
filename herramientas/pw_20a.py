# v2.0a (fase 3 de la ruta 9d, parte 1): prueba de navegador.  python3 herramientas/pw_20a.py imperio.html [idioma] [tema]
# Recorre: pantalla de inicio con 3 niveles (Fácil por omisión) y «Más opciones» con modo + dificultad (Personalizado), partida en Fácil
# (G.ez, etiqueta del nivel), «Te conviene» (lleva a la pantalla, ✕ lo oculta el año), tarjeta de primera vez (sale una vez, sigue si la
# pantalla se redibuja, «Entendido» la quita), menú Más con opciones cerradas + fila 🔒 + «Mostrar todo», 📖 Glosario (pantalla y términos
# subrayados que abren su definición), cada año: resumen con causa y efecto, 🔓 opciones nuevas, aviso de banco riesgoso (una sola vez),
# «¿Sabías que…?» con fuente, nada en avance rápido; Ajustes (nivel, 4 ayudas, dificultad en «Más opciones»: pasar a Medio quita las
# ayudas), partidas nuevas en Medio, Realista y Personalizado, y cuánto tarda un año en Fácil.
# Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c20a_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{tut:1,tutDone:1,help:1,lang:'%s',theme:'%s',lot:'off',pfx:'off',dsa:'off'}"%(LANG,THEME)
W="await new Promise(r=>setTimeout(r,%d));"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify("+CFG0+"))")
        await pg.goto(URL);await pg.wait_for_timeout(600);await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c20a_{LANG}_{n}.png')
        await pg.evaluate("()=>{if(typeof CV!=='undefined'&&CV.on){const n=$('cvNew');n&&n.click();}}");await pg.wait_for_timeout(400)
        R={}
        # --- inicio
        R['inicio']=await pg.evaluate("""async()=>{__ctx='inicio';const m=$('modal');const lv=[...m.querySelectorAll('.lv')];const r={tres:lv.length===3,facil_por_omision:lv[0]&&lv[0].classList.contains('on'),
          mas_opciones:!!m.querySelector('#v20mo [data-m]')&&!!m.querySelector('#v20mo .df'),cerrado:!m.querySelector('#v20mo').open};
          m.querySelector('#v20mo').open=true;m.querySelector('[data-m=realista]').click();"""+W%60+"""r.personalizado=$('v20pz').style.display===''&&!m.querySelector('.lv.on');
          m.querySelector('[data-lv=m]').click();"""+W%60+"""r.medio=[m.querySelector('[data-m].on').dataset.m,m.querySelector('.df.on').dataset.d].join('+');
          m.querySelector('[data-lv=r]').click();"""+W%60+"""r.realista=[m.querySelector('[data-m].on').dataset.m,m.querySelector('.df.on').dataset.d].join('+');
          m.querySelector('[data-lv=f]').click();"""+W%60+"""r.facil=[m.querySelector('[data-m].on').dataset.m,m.querySelector('.df.on').dataset.d].join('+');m.querySelector('#v20mo').open=false;return r;}""")
        await shot('inicio')
        await pg.evaluate("()=>{const m=$('modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1800)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;G.offer=null;hideModal();render();}")
        await pg.wait_for_timeout(400)
        R['partida']=await pg.evaluate("()=>({nivel:lvlOf(),modo:G.mode,dif:G.dif,ez:!!G.ez,etiqueta:$('pMode').textContent,ultimo:CFG.lastLvl})")
        # --- Te conviene
        R['conviene']=await pg.evaluate("async()=>{__ctx='conviene';const t=$('ezTip');const r={visible:!!t&&t.style.display!=='none',k:t&&t.dataset.k};t.querySelector('.ezgo').click();"+W%400+"r.abre=!!document.querySelector('#sheet.on');r.tarjeta=!!$('ezc');return r;}")
        await shot('conviene_tarjeta')
        R['tarjeta']=await pg.evaluate("async()=>{__ctx='tarjeta';$('nCar').click();"+W%300+"const sigue=!!$('ezc');const ok=document.querySelector('#ezc .btn[data-ezok]');ok.click();"+W%100+"const quita=!$('ezc');closeSheet();"+W%300+"$('nCar').click();"+W%300+"const una=!$('ezc');closeSheet();"+W%300+"return {sigue_al_redibujar:sigue,entendido_la_quita:quita,sale_una_vez:una,vistas:Object.keys(G.ez.seen)};}")
        R['conviene_x']=await pg.evaluate("async()=>{const t=$('ezTip');const k=t.dataset.k;t.querySelector('.ezx').click();"+W%100+"const t2=$('ezTip');return {oculto_o_otro:t2.style.display==='none'||t2.dataset.k!==k,guardado:G.ez.tx[k]===G.year};}")
        # --- menú Más
        R['mas']=await pg.evaluate("async()=>{__ctx='más';$('nMore').click();"+W%300+"const hid=[...document.querySelectorAll('#sheetIn .item[data-ezl]')].map(x=>x.dataset.ezl).sort();const lk=$('v20lk');const r={cerradas:hid,fila:!!lk,glosario:!!$('v20gl')};return r;}")
        await shot('mas')
        R['mostrar_todo']=await pg.evaluate("async()=>{$('v20lk').click();"+W%400+"const r={todo:G.ez.all===1,sin_cerradas:!document.querySelector('#sheetIn .item[data-ezl]')&&!$('v20lk')};G.ez.all=0;G.ez.ulk=ezUnlocked();closeSheet();"+W%300+"return r;}")
        # --- glosario
        R['glosario']=await pg.evaluate("async()=>{__ctx='glosario';showGlossary();"+W%300+"const n=document.querySelectorAll('#sheetIn .glsi').length;closeSheet();"+W%300+"P.dinero=3*U(P);showBanks('acc');"+W%500+"const g=[...document.querySelectorAll('#sheetIn .gls')];let t='';if(g[0]){const _t=toast;toast=function(x,y){t=x+' | '+y;return _t(x,y);};g[0].click();toast=_t;}closeSheet();"+W%300+"return {terminos:n,subrayados:g.length,ejemplo:g.map(x=>x.textContent).slice(0,4),toast:t.slice(0,90)};}")
        await pg.evaluate("async()=>{showBanks('acc');"+W%500+"}");await shot('banco');await pg.evaluate("()=>closeSheet()")
        # --- cada año
        R['anio']=await pg.evaluate("""async()=>{__ctx='año';const u=U(P);P.dinero=2*u;const b=bankList(P).find(x=>x.t==='local');P.acc={};P.acc[b.id]=40*u;G.ez.bw={};const n0=P.log.length;
          P.event=null;ageUp();P.event=null;P.dlg=null;const L1=P.log.slice(n0).map(l=>l.t);const n1=P.log.length;ageUp();P.event=null;P.dlg=null;const L2=P.log.slice(n1).map(l=>l.t);
          FF_ON=true;const n2=P.log.length;ageUp();P.event=null;P.dlg=null;FF_ON=false;const L3=P.log.slice(n2).map(l=>l.t);render();
          const has=(L,rx)=>L.some(t=>rx.test(t));
          return {resumen:has(L1,/^📘 Tu año en números/),causa:L1.filter(t=>/^📘/.test(t)).length>=1,abre:L1.filter(t=>/^🔓/.test(t)),aviso_banco:has(L1,/^⚠️ Tienes/),aviso_una_vez:!has(L2,/^⚠️ Tienes/),
            sabias:has(L1.concat(L2),/^💡 ¿Sabías que…\\? .+ \\(Fuente: .+\\)$/),rapido_callado:!has(L3,/^📘|^💡 ¿Sabías/),edad:P.age};}""")
        await pg.evaluate("async()=>{$('nAct').click();"+W%200+"closeSheet();"+W%300+"}")
        await shot('historial')
        # --- Ajustes
        R['ajustes']=await pg.evaluate("""async()=>{__ctx='ajustes';showSettings();"""+W%400+"""const b=$('v20cf');const r={bloque:!!b,ayudas:b?b.querySelectorAll('[data-ez]').length:0,dificultad_dentro:!!(b&&b.querySelector('details [data-df]'))};
          b.querySelector('[data-ez=next]').click();"""+W%300+"""r.sin_conviene=!G.ez.next&&(!$('ezTip')||$('ezTip').style.display==='none');$('v20cf').querySelector('[data-ez=next]').click();"""+W%300+"""return r;}""")
        await shot('ajustes')
        R['a_medio']=await pg.evaluate("async()=>{const d=document.querySelector('#v20cf [data-df=m]');d.click();"+W%400+"const r={nivel:lvlOf(),etiqueta:$('pMode').textContent,sin_conviene:!$('ezTip')||$('ezTip').style.display==='none'};closeSheet();"+W%300+"$('nMore').click();"+W%300+"r.mas_completo=!$('v20lk')&&!document.querySelector('#sheetIn .item[data-ezl]');closeSheet();"+W%300+"G.dif='f';save();render();return r;}")
        # --- tiempo de un año en Fácil (sin los avisos)
        R['tiempo_anio_ms']=await pg.evaluate("()=>{const t=[];for(let i=0;i<4;i++){P.event=null;const a=performance.now();ageUp();t.push(performance.now()-a);P.event=null;P.dlg=null;}return Math.round(t.reduce((s,x)=>s+x,0)/t.length);}")
        # --- partidas nuevas en Medio, Realista y Personalizado
        async def nueva(js):
            await pg.evaluate("()=>{closeSheet();hideModal();showStart(true);}");await pg.wait_for_timeout(400)
            await pg.evaluate("async()=>{const m=$('modal');"+js+W%80+"m.querySelector('#sA').value='18';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());P.event=null;P.dlg=null;G.offer=null;hideModal();render();}");await pg.wait_for_timeout(300)
            return await pg.evaluate("()=>({nivel:lvlOf(),modo:G.mode,dif:G.dif,ez:!!G.ez,conviene:!!$('ezTip')&&$('ezTip').style.display!=='none',etiqueta:$('pMode').textContent})")
        R['nueva_medio']=await nueva("m.querySelector('[data-lv=m]').click();")
        R['nueva_realista']=await nueva("m.querySelector('[data-lv=r]').click();")
        R['nueva_personalizado']=await nueva("m.querySelector('#v20mo').open=true;m.querySelector('[data-m=realista]').click();m.querySelector('.df[data-d=f]').click();")
        R['recuerda_personalizado']=await pg.evaluate("async()=>{closeSheet();hideModal();showStart(true);"+W%400+"const m=$('modal');const r={abierto:m.querySelector('#v20mo').open,modo:(m.querySelector('[data-m].on')||{}).dataset.m,dif:(m.querySelector('.df.on')||{}).dataset.d};return r;}")
        R['partidas_viejas']=await pg.evaluate("()=>[lvlFrom('rapido','f'),lvlFrom('rapido','m'),lvlFrom('realista','m'),lvlFrom('realista','d'),lvlFrom('rapido',undefined)].join(',')")
        await pg.evaluate("()=>{hideModal();}")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='guía';showGuide&&showGuide();"+W%300+"const b=[...document.querySelectorAll('#sheetIn .item, #sheetIn button')].find(x=>/🌱/.test(x.textContent));b&&b.click();"+W%300+"}")
            await shot('guia')
        R['ayuda']=await pg.evaluate("()=>['Nivel','Glosario'].map(k=>HELP.some(h=>h[0]===k))")
        R['errores_js']=perr[:12]
        if LANG!='es':
            miss=await pg.evaluate("()=>Object.entries(__miss).map(([k,v])=>k+'  ['+v.join(' | ')+']')")
            R['en_español']=len(miss);R['ejemplos_español']=miss[:40]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
