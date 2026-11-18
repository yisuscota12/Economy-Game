# v2.0b (fase 3 de la ruta 9d, parte 2): prueba de navegador.  python3 herramientas/pw_20b.py imperio.html [idioma] [tema]
# Recorre: partida Realista (cada año: 📘 resumen, 📊 inflación con «lo que más pesó», ingreso contra precios, impuestos con tasa efectiva,
# rendimiento real de cuentas y costo real de créditos, 🏦 movimiento del banco central; Finanzas → «🔎 Por qué» con tramos, precios y tasas
# reales; nada en avance rápido), «💡 ¿Sabías que…?» por pantalla (sale, tocar cambia el dato, plegar se recuerda, mismo dato al redibujar,
# apagado en Ajustes), pestañas de la vista País con dato, glosario (39 términos, 7 categorías, buscador), términos subrayados (Realista
# apagado por omisión, se enciende en Ajustes; Medio encendido), partida Medio (resumen sin 📊, «Por qué» corto), partida Fácil (tarjetas
# de primera vez en Diplomacia, Parte de guerra y pestañas de la vista País; retos: franja, cumplir «cuenta», logro, sección en Ambición),
# fin de vida («📚 Lo que aprendiste»: decisiones, conceptos que abren su definición, cifras, consejo), Ajustes → 🎓 Aprender y cuánto
# tarda un año en Realista.  Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c20b_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{tut:1,tutDone:1,help:1,lang:'%s',theme:'%s',lot:'off',pfx:'off',dsa:'off',lastLvl:'r'}"%(LANG,THEME)
W="await new Promise(r=>setTimeout(r,%d));"
CLEAN="()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;G.offer=null;G.mhelp=1;hideModal();render();}"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify("+CFG0+"))")
        await pg.goto(URL);await pg.wait_for_timeout(600);await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c20b_{LANG}_{n}.png')
        async def nueva(lv,age=25):
            await pg.evaluate("()=>{try{closeSheet();hideModal();}catch(e){}if(typeof CV!=='undefined'&&CV.on){const n=$('cvNew');n&&n.click();}else showStart(true);}");await pg.wait_for_timeout(500)
            await pg.evaluate("async()=>{const m=$('modal');m.querySelector('[data-lv=%s]').click();"%lv+W%80+"m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1700)
            await pg.evaluate(CLEAN);await pg.wait_for_timeout(300)
            await pg.evaluate("(a)=>{P.age=a;const j=(typeof JOBS!=='undefined'&&JOBS.find(x=>x.o==='2'))||{name:'Analista',o:'2',k:1};P.job={name:j.name,o:j.o,k:j.k,bonus:1};P.event=null;render();}",age)
            return await pg.evaluate("()=>({nivel:lvlOf(),modo:G.mode,dif:G.dif})")
        R={}
        # ===== Realista
        R['realista']=await nueva('r')
        R['anio_realista']=await pg.evaluate("""async()=>{__ctx='año realista';const u=U(P);P.dinero=3*u;const L=bankList(P).filter(x=>x.id!=='P:own');P.acc={};P.acc[L[0].id]=4*u;
          P.debts=[{type:'Crédito '+L[0].nm,bal:2*u,rate:.18,pay:annuity(2*u,.18,5),years:5,bk:L[0].id}];
          const n0=P.log.length;P.event=null;ageUp();P.event=null;P.dlg=null;const n1=P.log.length;ageUp();P.event=null;P.dlg=null;const A=P.log.slice(n0).map(l=>l.t);
          const S=v20bSnap(P);const x=cxOf(natOf(P));S.pr=x.pr-1.5;const k0=P.log.length;v20bYear(P,S);const B=P.log.slice(k0).map(l=>l.t);
          FF_ON=true;const n2=P.log.length;ageUp();P.event=null;P.dlg=null;FF_ON=false;const C=P.log.slice(n2).map(l=>l.t);render();const has=(L,rx)=>L.some(t=>rx.test(t));
          return {resumen:has(A,/^📘 Tu año en números/),inflacion:has(A,/^📊 Inflación en .+ Lo que más pesó: .+\\.$/),ingreso:has(A,/^📊 Tu ingreso cambió/),impuestos:has(A,/^📊 Impuestos del año: .+tasa efectiva/),
            cuentas:has(A,/^📊 Tus cuentas rindieron/),creditos:has(A,/^📊 Tus créditos cuestan/),banco_central:has(B,/^🏦 .+ (subió|bajó|movió) su tasa de/),rapido_callado:!has(C,/^📘|^📊|^🏦/),
            muestra:A.filter(t=>/^📊/.test(t)).slice(0,2),causa:(A.find(t=>/Lo que más pesó/.test(t))||'').replace(/^.*Lo que más pesó: /,''),bc:B.find(t=>/^🏦/.test(t))||''};}""")
        await pg.evaluate("async()=>{hideModal();$('nAct').click();"+W%200+"closeSheet();"+W%300+"}");await shot('historial_realista')
        R['por_que']=await pg.evaluate("""async()=>{__ctx='finanzas';hideModal();P.event=null;P.job={name:P.job?P.job.name:'Profesor',o:'2',k:1,bonus:1};showFinance();"""+W%500+"""const w=document.querySelector('#sheetIn .why');const r={hay:!!w,secciones:w?w.querySelectorAll('.whyh').length:0,
          tramo_actual:!!(w&&w.querySelector('.frow.cur')),tasas:w?w.querySelectorAll('.frow').length:0,dato:!!document.querySelector('#sheetIn .sbx'),orden:!!(w&&document.querySelector('#sheetIn .fin').compareDocumentPosition(w)&4),ingreso:Math.round(grossIncome(P))};return r;}""")
        await shot('finanzas_por_que');await pg.evaluate("()=>{document.querySelector('#sheetIn .why').scrollIntoView();}");await pg.wait_for_timeout(150);await shot('finanzas_por_que2')
        await pg.evaluate("()=>closeSheet()")
        # ===== ¿Sabías que…? por pantalla
        R['sabias']=await pg.evaluate("""async()=>{__ctx='sabías';hideModal();showBanks('acc');"""+W%500+"""const d=document.querySelector('#sheetIn .sbx');const r={sale:!!d,abierto:d&&d.open,despues_del_titulo:!!(d&&d.previousElementSibling&&d.previousElementSibling.tagName==='H3')};
          const t0=d.querySelector('.sbt').textContent;d.querySelector('.sbt').click();"""+W%150+"""r.cambia=d.querySelector('.sbt').textContent!==t0;const t1=d.querySelector('.sbt').textContent;
          showBanks('acc');"""+W%400+"""r.mismo_al_redibujar=document.querySelector('#sheetIn .sbx .sbt').textContent===t1;
          const d2=document.querySelector('#sheetIn .sbx');d2.open=false;"""+W%120+"""r.plegado_guardado=CFG.sbc===1;closeSheet();"""+W%200+"""showMarket('mk');"""+W%500+"""r.plegado_en_otra=!!document.querySelector('#sheetIn .sbx')&&!document.querySelector('#sheetIn .sbx').open;
          document.querySelector('#sheetIn .sbx').open=true;"""+W%120+"""r.desplegado=CFG.sbc===0;closeSheet();"""+W%200+"""
          const scr={};for(const [k,fn] of [['acciones',()=>$('nAct').click()],['carrera',()=>$('nCar').click()],['empresas',()=>showBiz()],['servicios',()=>showServices()],['bienes',()=>showAssets()],['familia',()=>showFamily()],['logros',()=>showAch()],['pais',()=>$('nNat').click()]]){try{fn();"""+W%350+"""scr[k]=!!document.querySelector('#sheetIn .sbx');}catch(e){scr[k]='err '+e.message;}closeSheet();"""+W%200+"""}
          r.pantallas=scr;r.datos=SABIAS.length;r.temas=[...new Set(SABIAS.map(f=>f[2]))].sort().join(',');return r;}""")
        await pg.evaluate("async()=>{hideModal();showBanks('acc');"+W%400+"}");await shot('sabias_banco');await pg.evaluate("()=>closeSheet()")
        R['vista_pais']=await pg.evaluate("""async()=>{__ctx='vista país';setView('pa');"""+W%300+"""const r={};for(const t of ['res','prov','eco','war','rank']){setTab(t);"""+W%250+"""r[t]=!!document.querySelector('#natBody .sbx');}setView('pj');"""+W%200+"""return r;}""")
        # ===== glosario
        R['glosario']=await pg.evaluate("""async()=>{__ctx='glosario';hideModal();showGlossary();"""+W%400+"""const b=$('sheetIn');const r={terminos:b.querySelectorAll('.glsi').length,categorias:b.querySelectorAll('.glc').length,buscador:!!b.querySelector('#glq')};
          const q=b.querySelector('#glq');q.value=(typeof LANG==='undefined'||LANG==='es')?'tasa':b.querySelector('.glsi b').textContent.slice(0,4);q.dispatchEvent(new Event('input'));"""+W%100+"""
          r.filtra=[...b.querySelectorAll('.glsi')].filter(x=>x.style.display!=='none').length;q.value='zzzqqq';q.dispatchEvent(new Event('input'));"""+W%100+"""r.sin_resultado=b.querySelector('.glno').style.display==='';
          q.value='';q.dispatchEvent(new Event('input'));"""+W%100+"""r.todo_de_nuevo=[...b.querySelectorAll('.glsi')].filter(x=>x.style.display!=='none').length;return r;}""")
        await shot('glosario');await pg.evaluate("()=>closeSheet()")
        R['subrayado_realista']=await pg.evaluate("""async()=>{__ctx='subrayado';const u=U(P);showBanks('acc');"""+W%500+"""const r={apagado_por_omision:!document.querySelector('#sheetIn .gls')};closeSheet();"""+W%200+"""
          showSettings();"""+W%400+"""const bl=$('v20bl');r.ajustes=bl?bl.querySelectorAll('[data-v2]').length:0;bl.querySelector('[data-v2=gl]').click();"""+W%400+"""r.encendido=edEnsure().gl===1;closeSheet();"""+W%200+"""
          showBanks('acc');"""+W%600+"""r.aparece=document.querySelectorAll('#sheetIn .gls').length;const g=document.querySelector('#sheetIn .gls');let t='';if(g){const _t=toast;toast=(a,b)=>{t=a;};g.click();toast=_t;}r.definicion=!!t;closeSheet();"""+W%200+"""
          showSettings();"""+W%400+"""$('v20bl').querySelector('[data-v2=sbs]').click();"""+W%300+"""r.sabias_apagado=CFG.sbs===0;closeSheet();"""+W%200+"""showBanks('acc');"""+W%400+"""r.sin_dato=!document.querySelector('#sheetIn .sbx');closeSheet();"""+W%200+"""
          CFG.sbs=1;saveCfg();edEnsure().gl=null;return r;}""")
        R['tiempo_anio_realista_ms']=await pg.evaluate("()=>{const t=[];for(let i=0;i<4;i++){P.event=null;const a=performance.now();ageUp();t.push(performance.now()-a);P.event=null;P.dlg=null;}return Math.round(t.reduce((s,x)=>s+x,0)/t.length);}")
        # ===== fin de vida
        R['fin_de_vida']=await pg.evaluate("""async()=>{__ctx='fin de vida';P.house=P.house||{val:5*U(P)};lrnTrack(P);die('de causas naturales');showDeath();"""+W%400+"""const m=$('modal');const l=m.querySelector('.lrnb');const r={hay:!!l,decisiones:l?l.querySelectorAll('.lrnd li').length:0,conceptos:l?l.querySelectorAll('[data-gl]').length:0,
          cifras:l?l.querySelectorAll('.lrns>div').length:0,consejo:!!(l&&l.querySelector('.lrnt')),antes_de_botones:!!(l&&l.nextElementSibling&&l.nextElementSibling.classList.contains('opt'))};
          let t='';const _t=toast;toast=(a,b)=>{t=a;};const c=l&&l.querySelector('[data-gl]');if(c)c.click();toast=_t;r.concepto_abre=!!t;r.muestra=l?[...l.querySelectorAll('.lrnd li')].slice(0,3).map(x=>x.textContent):[];return r;}""")
        await shot('fin_de_vida')
        # ===== Medio
        R['medio']=await nueva('m')
        R['anio_medio']=await pg.evaluate("""async()=>{__ctx='año medio';P.dinero=2*U(P);const n0=P.log.length;P.event=null;ageUp();P.event=null;P.dlg=null;ageUp();P.event=null;P.dlg=null;const A=P.log.slice(n0).map(l=>l.t);render();
          showFinance();"""+W%500+"""const w=document.querySelector('#sheetIn .why');const r={resumen:A.some(t=>/^📘 Tu año en números/.test(t)),sin_realista:!A.some(t=>/^📊|^🏦/.test(t)),por_que_corto:!!w&&!w.querySelector('.whyh'),parrafos:w?w.querySelectorAll('p').length:0};closeSheet();"""+W%200+"""
          showBanks('acc');"""+W%600+"""r.subrayado_medio=document.querySelectorAll('#sheetIn .gls').length;closeSheet();"""+W%200+"""showSettings();"""+W%400+"""r.ajustes=$('v20bl')?$('v20bl').querySelectorAll('[data-v2]').length:0;
          $('v20bl').querySelector('[data-v2=ys]').click();"""+W%300+"""const n1=P.log.length;ageUp();P.event=null;P.dlg=null;r.resumen_apagado=!P.log.slice(n1).some(l=>/^📘/.test(l.t));edEnsure().ys=1;closeSheet();return r;}""")
        await shot('medio')
        # ===== Fácil
        R['facil']=await nueva('f',17)
        R['facil_tarjetas']=await pg.evaluate("""async()=>{__ctx='tarjetas fácil';const z=ezEnsure();z.seen={};const r={};
          P.ruler=1;natOf(P).leader=fullName(P);render();showDiplomacyV();"""+W%400+"""r.diplomacia=!!$('ezc')&&/opinión/.test($('ezc').textContent)||!!$('ezc');r.sin_dato_con_tarjeta=!document.querySelector('#sheetIn .sbx');closeSheet();"""+W%200+"""
          showWarLogV();"""+W%400+"""r.parte_guerra=!!$('ezc');closeSheet();"""+W%200+"""setView('pa');"""+W%300+"""setTab('prov');"""+W%300+"""r.pestana_provincias=!!$('ezcv');r.sigue_al_redibujar=(render(),!!$('ezcv'));
          $('ezcv').querySelector('.btn[data-ezok]').click();"""+W%100+"""r.entendido=!$('ezcv');render();"""+W%100+"""r.una_vez=!$('ezcv')&&!!document.querySelector('#natBody .sbx');setTab('eco');"""+W%300+"""r.pestana_economia=!!$('ezcv');
          setView('pj');P.ruler=0;render();"""+W%200+"""return r;}""")
        await pg.evaluate("async()=>{setView('pa');setTab('gab');"+W%300+"}");await shot('facil_pestana');await pg.evaluate("()=>{setView('pj');render();}")
        R['retos']=await pg.evaluate("""async()=>{__ctx='retos';const r={};P.age=17;render();"""+W%100+"""r.oculto_menor=!$('ezRet')||$('ezRet').style.display==='none';P.age=18;P.job=null;P.career={track:null,rank:0,years:0};P.acc={};P.dinero=.5*U(P);render();"""+W%150+"""
          const e=$('ezRet');r.visible=!!e&&e.style.display!=='none';r.primero=e&&e.textContent;const n0=P.log.length;const b=bankList(P).find(x=>x.id!=='P:own');P.acc[b.id]=.2*U(P);P.dinero-=.2*U(P);render();"""+W%150+"""
          r.cumplido=P.log.slice(n0).some(l=>/^🎯 Reto cumplido: /.test(l.t));r.siguiente=$('ezRet').textContent!==r.primero;r.cuenta=$('ezRet').querySelector('.rtc').textContent;
          P.dinero=.3*U(P);P.acc={};P.acc[b.id]=.1*U(P);P.job={name:'x',o:'2',k:1,bonus:1};render();"""+W%100+"""const e2=$('ezRet');r.barra=!!e2.querySelector('.rtb');
          $('ezRet').querySelector('.ezgo').click();"""+W%400+"""r.lleva=!!document.querySelector('#sheet.on');closeSheet();"""+W%200+"""showAch();"""+W%400+"""r.en_logros=document.querySelectorAll('#v20rt .item').length;closeSheet();"""+W%200+"""
          showSettings();"""+W%400+"""r.ajustes=$('v20bl')?$('v20bl').querySelectorAll('[data-v2]').length:0;$('v20bl').querySelector('[data-v2=ret]').click();"""+W%300+"""r.apagar=!$('ezRet')||$('ezRet').style.display==='none';ezEnsure().ret=1;closeSheet();render();return r;}""")
        await shot('retos')
        if LANG!='es':
            miss=await pg.evaluate("()=>__miss")
            R['en_espanol']=[k for k in miss][:60]
        R['errores_js']=perr[:12]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
