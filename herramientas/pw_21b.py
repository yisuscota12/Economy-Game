# v2.1b (fase 4 de la ruta 9d, parte 2): prueba de navegador.  python3 herramientas/pw_21b.py imperio.html [idioma] [tema]
# Recorre: salud de los sectores (rango, causas, cadena), Web Worker del mundo de la IA (modo worker, 3,422 provincias, tiempos y respaldo síncrono),
# 🌐 aporte y 🔗 cadena en la ficha de la empresa (integración vertical con tu granja), resumen en Mis empresas, PIB de la provincia al cerrar el año,
# 🤝 venta negociada (rechazo con dado, baja la oferta, aceptar), 🛒 empresas en otros países (chips, compra con trámites, empresa en el extranjero),
# 🏭 sectores en País → Economía (18 filas, abrir causas), 🏭 economía local en la ficha de la provincia y en la ficha de abajo del mapa,
# modo de mapa 🏢 (colores, marcadores y leyenda), quiebra y cierre en cadena (desempleo, bancos, choque local), ajuste del worker,
# 12 meses (tiempo), Guía, ⓘ y glosario.  Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c21b_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{tut:1,tutDone:1,help:1,lang:'%s',theme:'%s',lot:'off',pfx:'off',dsa:'off',lastLvl:'m'}"%(LANG,THEME)
W="await new Promise(r=>setTimeout(r,%d));"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4243;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify("+CFG0+"))")
        await pg.goto(URL);await pg.wait_for_timeout(600);await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        async def shot(n):
            await pg.evaluate("()=>{try{const m=$('modal');if(m&&m.classList.contains('on')&&m.querySelector('.paper'))hideModal();}catch(e){}}");await pg.wait_for_timeout(150)
            await pg.screenshot(path=f'{SH}/c21b_{LANG}_{n}.png')
        await pg.evaluate("async()=>{const m=$('modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1800)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;G.offer=null;G.mhelp=1;hideModal();P.age=32;P.edu.degrees=['Economía'];render();}")
        R={}
        R['sectores']=await pg.evaluate("""async()=>{__ctx='sectores';ensureV14();const u=U(P);P.dinero=3000*u;
          const rg=Object.keys(DEP).filter(r=>G.regions[r]&&G.regions[r].o==='MEX'&&bzDep(r,'agr')).sort((a,b)=>G.regions[b].pop-G.regions[a].pop)[0]||P.r;window.__rg=rg;
          const ag=bzDep(rg,'agr');const cl=ag==='coffee'?'cafeteria':ag==='wheat'?'panaderia':ag==='corn'?'comida':'restaurante';window.__cli=cl;
          const t=[bzOpen(P,'granja',rg,false),bzOpen(P,cl,rg,false),bzOpen(P,'fabrica',rg,false),bzOpen(P,'software',rg,false)];
          for(let i=0;i<3;i++){P.event=null;P.dlg=null;G.offer=null;advanceUnit('m');P.event=null;P.dlg=null;hideModal();}
          const S=G.sh;const all=[];for(const id in S.h)S.h[id].forEach(v=>all.push(v));all.sort((a,b)=>a-b);const n=natOf(P);
          return {abiertas:t.filter(x=>/^Abres/.test(x)).length,insumo:ag,cliente:cl,paises:Object.keys(S.h).length,sectores:SH_K.length,min:all[0],mediana:all[all.length>>1],max:all[all.length-1],nan:all.filter(v=>!isFinite(v)).length,
            causas_ind:shParts(n,'ind').map(([k,v])=>k+' '+v.toFixed(1)).join(', '),hogares:Math.round(shHog(n)),bancos:Math.round(bnkEnsure(n).h)};}""")
        await pg.wait_for_timeout(600)
        R['worker']=await pg.evaluate("""async()=>{__ctx='worker';wmwRun();"""+W%600+"""const r={modo:WMW.mode,ok:WMW.ok,recibidos:WMW.got,provincias:WMW.act?WMW.act.length:0,ms_worker:WMW.ms!=null?Math.round(WMW.ms*10)/10:null,ms_hilo_principal:WMW.msMain!=null?Math.round(WMW.msMain*10)/10:null};
          const a=Array.from(WMW.act||[]);a.sort((x,y)=>x-y);r.act=a.length?[a[0],a[a.length>>1],a[a.length-1]].map(v=>Math.round(v)).join('/'):'';
          const w0=Array.from(WMW.act);const t=performance.now();wmwSync();r.ms_sincrono=Math.round((performance.now()-t)*10)/10;r.igual_al_worker=w0.every((v,i)=>Math.abs(v-WMW.act[i])<1e-3);
          const L=[];for(let i=0;i<5;i++){const t2=performance.now();wmwSync();L.push(performance.now()-t2);}L.sort((a,b)=>a-b);r.ms_sincrono_mediana=Math.round(L[2]*10)/10;return r;}""")
        R['empresa']=await pg.evaluate("""async()=>{__ctx='empresa';const L=bzList(P);const i=L.findIndex(b=>b.k===window.__cli);const b=L[i];const m=b.m[b.m.length-1];
          showBizD(i);"""+W%500+"""const B=$('sheetIn');const r={seccion:!!B.querySelector('#v21e'),mosaicos:B.querySelectorAll('#v21e ~ .v19g .plt, .v19g .plt').length,insumos:B.querySelectorAll('.v21in').length,
            integracion:!!m.vi&&m.vi>0,ve_integracion:/Lo produce tu empresa|✅/.test(B.textContent),salud:!!B.querySelector('.v21bh'),shf:m.shf,E:(()=>{const E=bzEco(b);return {va:Math.round(E.va/U(P)*10)/10,mult:E.mult.toFixed(2),empleos:E.jobs+'+'+E.jInd,pib_prov:shareTxt(E.shP)};})()};
          const e=$('v21e');if(e)e.scrollIntoView();"""+W%200+"""return r;}""")
        await shot('empresa')
        R['mis_empresas']=await pg.evaluate("""async()=>{__ctx='mis empresas';closeSheet();showBiz();"""+W%400+"""const r={resumen:!!document.querySelector('#v21ba'),boton_mapa:!!document.querySelector('#v21map')};
          const A=bzEcoSum(P);r.empleos=A.jobs+'+'+A.jInd;r.pib_pais=shareTxt(A.shN);const e=$('v21ba');if(e)e.scrollIntoView();"""+W%150+"""return r;}""")
        await shot('mis_empresas')
        R['pib_anual']=await pg.evaluate("""async()=>{__ctx='año';const L=bzList(P);const x=G.regions[window.__rg];const g0=x.gdp;const a0=L.map(b=>b.gA);
          for(let i=0;i<12;i++){P.event=null;P.dlg=null;G.offer=null;advanceUnit('m');P.event=null;P.dlg=null;hideModal();}
          return {gA_antes:a0.map(v=>Math.round(v||0)).join('/'),gA_despues:bzList(P).map(b=>Math.round(b.gA||0)).join('/'),historial:bzList(P).every(b=>(b.gh||[]).length>=1),pib_prov_cambio_pct:+((x.gdp/g0-1)*100).toFixed(2)};}""")
        R['venta']=await pg.evaluate("""async()=>{__ctx='venta';hideModal();closeSheet();const L=bzList(P);const i=L.findIndex(b=>b.k==='software');const b=L[i];showBizD(i);"""+W%400+"""
          const sl=document.querySelector('#sheetIn [data-ac="sell:1"]');sl.click();"""+W%400+"""const r={pantalla:!!document.querySelector('#v21sb'),compradores:document.querySelectorAll('#sheetIn [data-sl]').length/3};
          const S=b.so;r.salud=S.h;r.prob=[0,1,2].map(j=>bzsChance(S.L[0],j,S.h)).join('/');const px0=S.L[0].px;
          const _mr=Math.random;Math.random=()=>.9999;document.querySelector('#sheetIn [data-sl="0:2"]').click();Math.random=_mr;"""+W%400+"""r.rechazo_dado=!!document.querySelector('.v21d');r.baja_oferta=b.so&&b.so.L[0]&&b.so.L[0].px<px0;
          const ok=$('v21ok');if(ok)ok.click();"""+W%400+"""return r;}""")
        await shot('venta')
        R['venta2']=await pg.evaluate("""async()=>{const n0=bzList(P).length,d0=P.dinero;const x=document.querySelector('#sheetIn [data-sl="0:0"]');if(!x)return {sin_boton:1};x.click();"""+W%400+"""
          const ok=$('v21ok');if(ok)ok.click();"""+W%300+"""return {vendida:bzList(P).length===n0-1,dinero:P.dinero>d0};}""")
        R['extranjero']=await pg.evaluate("""async()=>{__ctx='extranjero';closeSheet();showBzMarket();"""+W%400+"""const r={chips:document.querySelectorAll('#sheetIn [data-mkn]').length,selector:!!document.querySelector('#v21sel')};
          const usa=document.querySelector('#sheetIn [data-mkn="USA"]');if(usa)usa.click();"""+W%500+"""r.pais=V21B.mk;r.ofertas=document.querySelectorAll('#sheetIn .v21o').length;r.tramites=/Trámites|🌐/.test(document.querySelector('#sheetIn .v21o')?.textContent||'');
          const M=G.bzmx&&G.bzmx.USA;const o=M&&M.L[0];if(o){P.dinero=Math.max(P.dinero,o.ask*3);o.urg=true;const n0=bzList(P).length;let k=null;const _mr=Math.random;Math.random=()=>0;try{k=bzmOffer(P,o.id,2,false);}finally{Math.random=_mr;}
            r.compra=!!k&&k.ok&&bzList(P).length===n0+1;r.texto_tramites=k?/extranjera/.test(k.t):false;const b=bzList(P)[bzList(P).length-1];r.en_usa=G.regions[b.r].o==='USA';r.mercado_casa_intacto=!G.bzm||G.bzm.n==='MEX';}
          showBzMarket('USA');"""+W%400+"""return r;}""")
        await shot('extranjero')
        R['pais']=await pg.evaluate("""async()=>{__ctx='pais';hideModal();closeSheet();setView('pa');setTab('eco');"""+W%600+"""const d=$('v21sh');const r={seccion:!!d,filas:d?d.querySelectorAll('[data-shk]').length:0};
          const f=d&&d.querySelector('[data-shk]');if(f){f.click();"""+W%150+"""r.abre_causas=f.classList.contains('open')&&f.querySelectorAll('.v21cz').length>0;}if(d)d.scrollIntoView();"""+W%200+"""return r;}""")
        await shot('sectores')
        R['provincia']=await pg.evaluate("""async()=>{__ctx='provincia';setView('pj');"""+W%300+"""showPlace(window.__rg,'pr');"""+W%500+"""const d=$('v21pl');const r={seccion:!!d,filas:d?d.querySelectorAll('.v21sr').length:0,empresas:d?d.querySelectorAll('[data-v21bz]').length:0};
          if(d)d.scrollIntoView();"""+W%200+"""return r;}""")
        await shot('provincia')
        R['mapa']=await pg.evaluate("""async()=>{__ctx='mapa';hideModal();closeSheet();"""+W%200+"""document.querySelector('#v21map')||showBiz();"""+W%300+"""const bt=$('v21map');if(bt)bt.click();"""+W%900+"""
          const r={modo:MMODE,leyenda:!!document.querySelector('#mLeg .v21lg'),boton:!!document.querySelector('.mmodes [data-mm="emp"]')};const ov=$('mapOv');r.marcadores=ov?[...ov.querySelectorAll('rect')].filter(x=>/2\\.?\\d*/.test(x.getAttribute('rx')||'')).length:0;
          const c=provColor(window.__rg);r.color=Array.isArray(c)&&c.length===3;r.ficha=!!document.querySelector('#selInfo .v21m');return r;}""")
        await shot('mapa')
        R['cadena']=await pg.evaluate("""async()=>{__ctx='cadena';closeSheet();setMapMode('pol');const L=bzList(P);const b=L.find(z=>z.k==='fabrica');const x=G.regions[b.r];const bk=bnkEnsure(natOf(P));const h0=bk.h,g0=x.gdp,lg=P.log.length;
          b.debt=b.assets*6+1e10;bzMonth(P,b);const r={quebro:!bzList(P).includes(b),log:P.log.slice(lg).some(l=>/La quiebra de/.test(l.t)),bancos:+(bk.h-h0).toFixed(2),pib_prov:Math.round(x.gdp-g0),choque:G.lx[b.r]?+G.lx[b.r][0].toFixed(3):null};
          const c=bzList(P).find(z=>z.k===window.__cli);const lg2=P.log.length;if(c){bzClose(P,c);r.cierre_log=P.log.slice(lg2).some(l=>/Al cerrar/.test(l.t));}return r;}""")
        R['ajuste']=await pg.evaluate("""async()=>{__ctx='ajustes';showSettings();"""+W%300+"""const x=[...document.querySelectorAll('#sheetIn .item')].find(e=>/Economía del mundo en segundo plano|⚙️/.test(e.textContent)&&/segundo plano/.test(e.textContent)&&!/Guardado/.test(e.textContent));
          const r={existe:!!x};if(x){x.click();"""+W%300+"""r.apagado=CFG.wmw===0&&WMW.w===null;wmwRun();r.sincrono=WMW.mode==='sync';const y=[...document.querySelectorAll('#sheetIn .item')].find(e=>/desactivada/.test(e.textContent)&&/Econom/.test(e.textContent));if(y)y.click();"""+W%200+"""wmwRun();"""+W%400+"""r.reactivado=WMW.mode==='worker';}closeSheet();return r;}""")
        R['meses']=await pg.evaluate("""async()=>{__ctx='meses';const t=[];for(let i=0;i<12;i++){P.event=null;P.dlg=null;G.offer=null;const a=performance.now();advanceUnit('m');t.push(performance.now()-a);P.event=null;P.dlg=null;hideModal();}
          t.sort((a,b)=>a-b);render();const S=[];for(let i=0;i<12;i++){const a=performance.now();shMonth();S.push(performance.now()-a);}S.sort((a,b)=>a-b);
          return {empresas:bzList(P).length,mediana_ms:Math.round(t[6]),max_ms:Math.round(t[11]),sectores_ms:Math.round(S[6]*10)/10,worker_ms:WMW.ms!=null?Math.round(WMW.ms*10)/10:null,envio_ms:WMW.msMain!=null?Math.round(WMW.msMain*10)/10:null};}""")
        R['guardado']=await pg.evaluate("()=>{const o=JSON.parse(JSON.stringify(packG(G)));const g=unpackG(o);return {sectores:!!(g.sh&&g.sh.h&&Object.keys(g.sh.h).length>100),choques:g.lx!=null,mercados:Object.keys(g.bzmx||{}).length,kb_sh:Math.round(JSON.stringify(G.sh).length/1024),kb_mercados:Math.round(JSON.stringify(G.bzmx||{}).length/1024),kb_partida:Math.round(JSON.stringify(o).length/1024)};}")
        R['guia']=await pg.evaluate("()=>({tema:GUIA.some(g=>/Economía conectada/.test(g[0])),ayuda:HELP.filter(h=>/^(Aporte a la economía local|Cadena de suministro|Salud de los sectores|Vender la empresa)$/.test(h[0])).length,glosario:GLOS.length})")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='pantallas';showBiz();"+W%400+"const i=bzList(P).findIndex(b=>b.v14);showBizD(i);"+W%400+"closeSheet();showBzSell(i);"+W%400+"closeSheet();showBzMarket('USA');"+W%400+"closeSheet();setView('pa');setTab('eco');"+W%500+"setView('pj');showPlace(window.__rg,'pr');"+W%400+"closeSheet();setMapMode('emp');"+W%300+"showGuide&&0;}")
            miss=await pg.evaluate("()=>__miss")
            R['en_espanol']=[k for k in miss][:60]
        R['errores_js']=perr[:12]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
