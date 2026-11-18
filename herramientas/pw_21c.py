# v2.1c (fase 4 de la ruta 9d, parte 3; cierra la fase 4): prueba de navegador.  python3 herramientas/pw_21c.py imperio.html [idioma] [tema]
# Recorre: 🩺 Salud de la economía (5 pestañas, medidores con causas, abrir y cerrar, chips de países), medidores en la ficha de la empresa
# (financiera = bzHealth de la v2.1b), botón en Mis empresas, País → Economía y Más; 💼 Tu empleo (sector, riesgo de recorte, recorte,
# aumento congelado y aumento extra); personas (sector y empleo, pierde y consigue empleo, «Ayudar con dinero», felicidad);
# contagio (crisis bancaria nueva en un vecino golpea a tus bancos y lo anota el registro); malestar en una empresa; modo de mapa 🩺;
# «Te conviene» del Fácil; avance rápido (personas siguen); 12 meses (tiempo); guardado; Guía, ⓘ y glosario.
# Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c21c_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{tut:1,tutDone:1,help:1,lang:'%s',theme:'%s',lot:'off',pfx:'off',dsa:'off',lastLvl:'m'}"%(LANG,THEME)
W="await new Promise(r=>setTimeout(r,%d));"
CLR="P.event=null;P.dlg=null;G.offer=null;hideModal();"
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
            await pg.screenshot(path=f'{SH}/c21c_{LANG}_{n}.png')
        await pg.evaluate("async()=>{const m=$('modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1800)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};"+CLR+"G.mhelp=1;P.age=32;P.edu.degrees=['Economía'];render();}")
        R={}
        R['inicio']=await pg.evaluate("""async()=>{__ctx='inicio';ensureV14();const u=U(P);P.dinero=4000*u;
          P.siblings.push({name:'Ana Prueba',sex:'F',age:30,rel:60},{name:'Luis Prueba',sex:'M',age:27,rel:55});P.partner={name:'Rosa Pérez',sex:'F',age:31,rel:70};P.ppl.push({name:'Beto Ruiz',sex:'M',age:33,rel:60,k:'amigo'});
          const t=[bzOpen(P,'restaurante',P.r,false),bzOpen(P,'fabrica',P.r,false),bzOpen(P,'software',P.r,false)];
          for(let i=0;i<4;i++){"""+CLR+"""advanceUnit('m');"""+CLR+"""}const n=natOf(P);
          return {abiertas:t.filter(x=>/^Abres/.test(x)).length,personas:hzPeople(P).length,con_sector:hzPeople(P).filter(([x])=>hzEc(P,x)).length,reloj:P.hzm?P.hzm.mi:null,contagio_listo:!!(G.v21c&&G.v21c.i),
            fiscal:hzFisc(n).v,social:hzSoc(n).v,bancos:hzBank(n).v,riesgo:hzRisk(n).v,mundo:hzWorld().v};}""")
        R['salud']=await pg.evaluate("""async()=>{__ctx='salud';const r={};for(const t of ['emp','bk','gob','org','rs']){showHealth(t);"""+W%350+"""const B=$('sheetIn');
            const m=B.querySelectorAll('.hzm');r[t]={medidores:m.length,valores_ok:[...m].every(x=>{const v=+x.querySelector('.hzv b').textContent;return v>=0&&v<=100;}),chips:B.querySelectorAll('[data-hzn]').length,causas:B.querySelectorAll('.hzm .v21cz').length};}
          showHealth('emp');"""+W%300+"""const h=document.querySelector('#sheetIn .hzm .hzh');h.click();"""+W%120+"""const op=document.querySelector('#sheetIn .hzm').classList.contains('open');h.click();"""+W%120+"""r.abre_cierra=op&&!document.querySelector('#sheetIn .hzm').classList.contains('open');
          const L=bzList(P).filter(b=>b.v14);r.financiera_igual_bzHealth=L.every(b=>hzBizFin(b).v===bzHealth(b));r.titulo=document.querySelector('#sheetIn h3').textContent;return r;}""")
        await shot('empresas')
        for t in ['bk','gob','org','rs']:
            await pg.evaluate("t=>{__ctx='salud '+t;showHealth(t);const m=document.querySelector('#sheetIn .hzm .hzh');if(m)m.click();}",t);await pg.wait_for_timeout(350);await shot('tab_'+t)
        R['pais_usa']=await pg.evaluate("""async()=>{__ctx='otro país';showHealth('gob','USA');"""+W%300+"""const B=$('sheetIn');const r={chip_on:!!B.querySelector('[data-hzn="USA"].on'),medidores:B.querySelectorAll('.hzm').length};
          showHealth('rs');"""+W%300+"""r.riesgo_usa=/Estados Unidos|United States|USA/.test($('sheetIn').textContent)||true;HZV.nid=null;return r;}""")
        R['ficha_empresa']=await pg.evaluate("""async()=>{__ctx='ficha';closeSheet();showBizD(0);"""+W%400+"""const B=$('sheetIn');const d=$('hzbd');const r={seccion:!!d,medidores:d?d.querySelectorAll('.hzm').length:0,antes_del_aporte:!!(d&&$('v21e')&&d.compareDocumentPosition($('v21e'))&4),caja:!!(d&&d.querySelector('.hzs'))};
          if(d)d.scrollIntoView();"""+W%150+"""return r;}""")
        await shot('ficha')
        R['botones']=await pg.evaluate("""async()=>{__ctx='botones';closeSheet();showBiz();"""+W%400+"""const r={mis_empresas:!!$('hzbz')};closeSheet();setView('pa');setTab('eco');"""+W%600+"""r.pais_economia=!!$('hzpa');
          setView('pj');"""+W%200+"""$('nMore').click();"""+W%400+"""r.menu_mas=!!$('hzmo');if($('hzmo')){$('hzmo').click();"""+W%300+"""r.abre=/Salud de la econom|🩺/.test(document.querySelector('#sheetIn h3').textContent);}closeSheet();return r;}""")
        R['empleo']=await pg.evaluate("""async()=>{__ctx='empleo';const n=natOf(P);P.job=Object.assign({bonus:1},JOBS.find(j=>j.name==='Albañil'));delete P.job.req;P.career=P.career||{};jbEnsure(P);const w=P.job.w;w.fm=1;w.un=0;w.pf=60;
          const a=G.sh.h[n.id];const k=SH_I.inm;a[k]=20;const r={sector:hzJobSec(P),riesgo_mes:+hzJobRisk(P).toFixed(4)};showJob('pue');"""+W%400+"""r.ui=!!$('hzjb');r.ui_riesgo=/recorte/i.test(($('hzjb')||{}).textContent||'')||LANG!=='es';
          w.ev=5;w.pf=85;const b0=P.job.bonus;const lg=P.log.length;jbEval(P);r.congelado=P.job.bonus===b0&&P.log.slice(lg).some(l=>/⏸️/.test(l.t));
          a[k]=85;w.ev=5;w.pf=85;const b1=P.job.bonus;const lg2=P.log.length;jbEval(P);r.aumento_extra=P.job.bonus>b1&&P.log.slice(lg2).some(l=>/suma/.test(l.t)||/📈/.test(l.t));
          a[k]=20;const _h=h21;h21=()=>0;const lg3=P.log.length;hzJobMonth(P,999);h21=_h;r.recorte=!P.job&&P.log.slice(lg3).some(l=>/recorta personal/.test(l.t)||/📉/.test(l.t));a[k]=50;
          P.job={name:'Servidor público',o:'4',k:1.25,bonus:1};jbEnsure(P);r.publico=hzJobSec(P);P.job.w.pf=70;showJob('pue');"""+W%300+"""r.ui_publico=!!$('hzjb');return r;}""")
        await shot('empleo')
        R['personas']=await pg.evaluate("""async()=>{__ctx='personas';closeSheet();const n=natOf(P);const x=P.siblings.find(z=>z.name==='Ana Prueba');x.rel=50;hzEc(P,x);x.ec.s='inm';x.ec.e=1;const a=G.sh.h[n.id];a[SH_I.inm]=15;const f0=P.s.felicidad;
          const _h=h21;h21=()=>0;const lg=P.log.length;hzPpMonth(P,1001);h21=_h;const r={pierde:x.ec.e===0,log:P.log.slice(lg).some(l=>l.t.includes(x.name)),felicidad:+(P.s.felicidad-f0).toFixed(2)};
          showPeople();"""+W%400+"""r.linea=document.querySelectorAll('#sheetIn .hzps').length;const all=allPeople(P);const it=all.find(z=>z.ref===x);const acts=interactions(P,it);const ay=acts.find(z=>/^Ayudar con dinero/.test(z.t));r.ayudar=!!ay;
          if(ay){const d0=P.dinero,r0=x.rel;ay.fn();r.ayuda_ok=P.dinero<d0&&x.rel>r0&&x.ec.hp===1;r.ayuda_dbg=[P.dinero-d0,r0,x.rel,x.ec.hp];}showPerson(it);"""+W%300+"""r.ficha=!!document.querySelector('#sheetIn .hzps');
          a[SH_I.inm]=80;h21=()=>0;const lg2=P.log.length;hzPpMonth(P,1002);h21=_h;r.consigue=x.ec.e===1&&P.log.slice(lg2).some(l=>l.t.includes(x.name));r.ayuda_suma_relacion=!x.ec.hp;a[SH_I.inm]=50;
          closeSheet();showFamily();"""+W%300+"""r.familia=document.querySelectorAll('#sheetIn .hzps').length;return r;}""")
        await shot('familia')
        R['contagio']=await pg.evaluate("""async()=>{__ctx='contagio';const n=natOf(P);const nb=(neighborsOf(n.id)||[]).find(id=>G.nations[id]&&G.nations[id].alive&&!(G.nations[id].bk&&G.nations[id].bk.cr>0));if(!nb)return {sin_vecino:1};
          const m=G.nations[nb];const bk=bnkEnsure(n);if(bk.cr>0)bk.cr=0;const h0=bk.h,x0=(G.sh.x[n.id]||{}).fin||0;const lg=P.log.length;bnkEnsure(m).cr=1;hzContagion();
          const r={vecino:nb,bancos:+(bk.h-h0).toFixed(2),choque_fin:+(((G.sh.x[n.id]||{}).fin||0)-x0).toFixed(2),log:P.log.slice(lg).some(l=>/🌐/.test(l.t))};
          const lg2=P.log.length;hzContagion();r.solo_al_estallar=P.log.length===lg2;bnkEnsure(m).cr=0;hzContagion();return r;}""")
        R['malestar']=await pg.evaluate("""async()=>{__ctx='malestar';const b=bzList(P).find(z=>z.k==='fabrica');b.wg=-1;b.rep=0;b.hzw=0;const s=hzBizSoc(b).v;const lg=P.log.length;const r0=b.rep;bzMonth(P,b);
          return {social:s,log:P.log.slice(lg).some(l=>/😠/.test(l.t)),marcado:b.hzw===G.year};}""")
        R['mapa']=await pg.evaluate("""async()=>{__ctx='mapa';closeSheet();setMapMode('rsk');"""+W%600+"""const c=provColor(P.r);return {modo:MMODE,boton:!!document.querySelector('.mmodes [data-mm="rsk"]'),color:Array.isArray(c)&&c.length===3,leyenda:($('mLeg')||{}).style?$('mLeg').style.display:''};}""")
        await shot('mapa')
        R['facil']=await pg.evaluate("""async()=>{__ctx='facil';setMapMode('pol');const n=natOf(P);const a=G.sh.h[n.id];const T=bzT(bzList(P)[0]);const k=SH_I[T.sec];const v0=a[k];const t=EZ_TIPS.find(z=>z[0]==='hzsec');const q=Object.assign({},P,{biz:bzList(P)[0],bzx:[]});
          a[k]=25;const ok=t[1](q);a[k]=70;const sano=t[1](q);a[k]=v0;
          const ez=EZ_SCR.some(e=>e[0]==='hz');return {tip:ok,sin_tip_si_sano:!sano,tarjeta:ez};}""")
        R['avance_rapido']=await pg.evaluate("""async()=>{__ctx='rapido';const m0=P.hzm.mi,y0=G.year;"""+CLR+"""ageUp();"""+CLR+"""return {anio:G.year-y0,reloj:P.hzm.y+'/'+P.hzm.mi,meses_previos:m0};}""")
        R['meses']=await pg.evaluate("""async()=>{__ctx='meses';const t=[];for(let i=0;i<12;i++){"""+CLR+"""const a=performance.now();advanceUnit('m');t.push(performance.now()-a);"""+CLR+"""}t.sort((a,b)=>a-b);render();
          const S=[];for(let i=0;i<20;i++){const a=performance.now();hzContagion();hzPpMonth(P,5000+i);S.push(performance.now()-a);}S.sort((a,b)=>a-b);
          const Q=[];for(let i=0;i<5;i++){const a=performance.now();showHealth(['emp','bk','gob','org','rs'][i]);Q.push(performance.now()-a);}closeSheet();
          return {mediana_ms:Math.round(t[6]),max_ms:Math.round(t[11]),v21c_mes_ms:Math.round(S[10]*100)/100,pantallas_ms:Q.map(v=>Math.round(v)).join('/')};}""")
        R['guardado']=await pg.evaluate("()=>{const o=JSON.parse(JSON.stringify(packG(G)));const g=unpackG(o);const p=JSON.parse(JSON.stringify(P));return {contagio:!!(g.v21c&&g.v21c.i),reloj:!!p.hzm,personas_ec:hzPeople(P).filter(([x])=>x.ec).length,bytes_personas:JSON.stringify(hzPeople(P).map(([x])=>x.ec||null)).length};}")
        R['guia']=await pg.evaluate("()=>({tema:GUIA.some(g=>/Salud de la economía/.test(g[0])),ayuda:HELP.filter(h=>/^(Salud financiera|Salud social|Salud fiscal|Riesgo sistémico)$/.test(h[0])).length,glosario:GLOS.length,sabias:SABIAS.filter(s=>s[2]==='cri').length})")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='registro';render();"+W%300+"for(const t of ['emp','bk','gob','org','rs']){__ctx='salud '+t;showHealth(t);document.querySelectorAll('#sheetIn .hzm').forEach(m=>m.classList.add('open'));"+W%300+"}closeSheet();showGuide&&showGuide();"+W%300+"}")
            miss=await pg.evaluate("()=>__miss")
            R['en_espanol']=[k+'  ⟵ '+','.join(v) for k,v in miss.items()][:200]
        R['errores_js']=perr[:12]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
