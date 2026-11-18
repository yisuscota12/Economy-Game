# v2.1a (fase 4 de la ruta 9d, parte 1): prueba de navegador.  python3 herramientas/pw_21a.py imperio.html [idioma] [tema]
# Recorre: 7 empresas sin tope (botón activo, mosaico con «en persona», aviso y castigo de atención desde la 6.ª), grupos (crear, director,
# agregar, sin castigo, sinergias del mismo giro, ahorros del director de eficiencia, barrer caja, préstamo interno, renombrar, disolver),
# empresas en venta (6 ofertas con 12 meses de historia, cifras declaradas vs reales, auditoría que revela la deuda oculta, oferta con dado,
# compra con crédito, deuda oculta al comprar sin auditar, retiro tras 2 rechazos, renovación a los 6 meses), control en bolsa (OPA con
# probabilidad, rechazo cobra asesores y bloquea el año, éxito con 51 %, estrategia y dividendo, director, sesgo de utilidades, pérdida
# del control al vender), pantallas (Mis empresas, Empresas en venta, Grupos, ficha de grupo, ficha de bolsa), 12 meses con 9 empresas
# (tiempo), Guía y ⓘ.  Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c21a_<idioma>_*.png
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
        shot=lambda n: pg.screenshot(path=f'{SH}/c21a_{LANG}_{n}.png')
        await pg.evaluate("async()=>{const m=$('modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1800)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;G.offer=null;G.mhelp=1;hideModal();P.age=32;P.edu.degrees=['Economía'];render();}")
        R={}
        R['sin_tope']=await pg.evaluate("""async()=>{__ctx='empresas';ensureV14();const u=U(P);P.dinero=400*u;const ks=['comida','abarrotes','comida','abarrotes','comida','abarrotes','comida'];const out=[];
          ks.forEach(k=>out.push(bzOpen(P,k,P.r,false)));const n=bzList(P).length;showBiz();"""+W%400+"""const nb=$('bzNew');const t=[...document.querySelectorAll('#sheetIn .plt')].find(x=>/Empresas|Companies|^/.test(x.textContent));
          const r={abiertas:n,boton_activo:!!nb&&!nb.disabled,aviso:!!document.querySelector('#v21b .v21w'),mosaico:t?t.textContent.replace(/\\s+/g,' ').trim():'',errores:out.filter(x=>!/^Abres/.test(x))};
          const L=bzList(P);L.forEach(b=>b.rep=60);mkMonthEnd();r.castigo=L.every(b=>(b.m[b.m.length-1].att||0)<0);r.rep_baja=Math.round(L[0].rep*10)/10;return r;}""")
        await shot('empresas')
        R['grupos']=await pg.evaluate("""async()=>{__ctx='grupos';closeSheet();const gid=grpNew(P,'Grupo Prueba');const g=grpEnsure(P).find(x=>x.id===gid);const C=grpCands(P,g);const ef=C.findIndex(c=>c.st==='efi');grpHire(P,g,ef);
          bzList(P).forEach(b=>b.g=g.id);bzList(P).forEach(b=>b.rep=60);const c0=bzList(P).reduce((s,b)=>s+b.cash,0);mkMonthEnd();const L=bzList(P);const m=L.map(b=>b.m[b.m.length-1]);
          const r={sin_castigo:m.every(x=>!x.att),director:!!g.dir,sueldo:m.every(x=>x.gc>0),sinergias:m.every(x=>x.syn>0),ahorros:m.some(x=>x.ef>0),reputacion:Math.round(L[0].rep*10)/10};
          L[0].cash+=50*U(P);L[1].cash=0;r.prestamo=/^Préstamo interno/.test(grpLend(P,g));L[0].cash+=50*U(P);const d0=P.dinero;r.barrer=grpSweep(P,g).length>0&&P.dinero>d0;
          showGroups();"""+W%300+"""r.lista=document.querySelectorAll('#sheetIn [data-g]').length;showGroups(g.id);"""+W%400+"""r.ficha=!!document.querySelector('#v21sw')&&document.querySelectorAll('#sheetIn [data-out]').length===L.length;return r;}""")
        await shot('grupo')
        R['grupo_ui']=await pg.evaluate("""async()=>{const b0=document.querySelector('#sheetIn [data-out]');b0.click();"""+W%300+"""const g=P.grp[0];const r={sacar:grpMembers(P,g).length===bzList(P).length-1};
          document.querySelector('#sheetIn [data-in]').click();"""+W%300+"""r.agregar=grpMembers(P,g).length===bzList(P).length;closeSheet();"""+W%200+"""showBiz();"""+W%300+"""r.etiqueta=document.querySelectorAll('#sheetIn .v21g').length;r.sin_aviso=!document.querySelector('#v21b .v21w');closeSheet();return r;}""")
        R['venta']=await pg.evaluate("""async()=>{__ctx='en venta';const M=bzmEnsure(P);const r={ofertas:M.L.length,historia:M.L.every(o=>o.b.m.length===12),con_oculta:M.L.filter(o=>o.hd>0).length};
          const o=M.L.find(x=>x.hd>0)||M.L[0];const d=bzmDecl(o);r.maquillada=o.hd>0?d.rev>o.b.m.reduce((s,z)=>s+z.rev,0)*1.01:true;showBzMarket();"""+W%400+"""r.pantalla=document.querySelectorAll('#sheetIn .v21o').length;
          const pre=o.hd>0?bzmDecl(o).debt:0;const ta=bzmAudit(P,o.id);r.auditoria=!!ta&&o.aud===1;r.revela=o.hd>0?bzmDecl(o).debt>pre:true;
          let ok=null,tries=0;const nb0=bzList(P).length;while(!ok&&tries<6){o.neg=0;o.urg=true;const x=bzmOffer(P,o.id,2,true);tries++;if(x.ok)ok=x;}r.compra=!!ok&&bzList(P).length===nb0+1;r.dado=!!ok&&ok.roll!=null&&ok.pc>=95;
          const b=bzList(P)[bzList(P).length-1];r.credito=b.debt>0;
          const o2=G.bzm.L.find(x=>x.hd>0&&!x.aud);if(o2){o2.urg=true;o2.neg=0;let k=null;for(let i=0;i<6&&!k;i++){o2.neg=0;const x=bzmOffer(P,o2.id,2,false);if(x.ok)k=x;}r.oculta_sin_auditar=!!k&&/deuda oculta/.test(k.t);}else r.oculta_sin_auditar='sin oferta';
          P.dinero=1e12;const o3=G.bzm.L[0];if(o3){o3.urg=false;o3.neg=0;let n=0;for(let i=0;i<2;i++){const x=bzmOffer(P,o3.id,0,false);if(!x.ok)n++;else break;}r.retiro=n<2||!G.bzm.L.includes(o3);}
          G.bzm.t-=6;const k0=G.bzm.k;bzmEnsure(P);r.renueva=G.bzm.k>k0&&G.bzm.L.length>0;return r;}""")
        await pg.evaluate("async()=>{showBzMarket();"+W%400+"}");await shot('en_venta');await pg.evaluate("()=>closeSheet()")
        R['opa']=await pg.evaluate("""async()=>{__ctx='opa';const M=G.mk;const ids=Object.keys(M.C).filter(id=>opaOk(id)&&M.C[id].x===(EXN.MEX||[])[0]).sort((a,b)=>M.C[a].p*M.C[a].sh-M.C[b].p*M.C[b].sh);const id=ids[0];const c=M.C[id];
          let I=opaInfo(P,id);P.dinero=I.opts[2].cost*3;const r={empresa:c.nm,opciones:I.opts.length,prob:I.opts.map(o=>o.pc).join('/')};
          const _mr=Math.random;Math.random=()=>.9999;const x1=opaDo(P,id,0);Math.random=_mr;r.rechazo=x1.ok===false&&c.opaY===G.year;const x2=opaDo(P,id,2);r.bloqueo_anual=/este año/.test(x2.t);
          c.opaY=null;Math.random=()=>0;const x3=opaDo(P,id,2);Math.random=_mr;r.control=!!c.ctl&&P.bk.pos[id].q>=c.sh*.5;r.dy0=c.dy;r.estrategia=/dividendos/.test(ctlSet(id,'div'))&&c.dy>r.dy0;ctlSet(id,'cre');r.crecer_menos_div=c.dy<r.dy0;
          ctlCands(P,id);r.director=/capacidad/.test(ctlHire(id,0));const e0=c.eps;const b0=ctlBias(c);r.sesgo=Math.round(b0*1000)/1000;
          showStock(id);"""+W%500+"""r.ficha=!!document.querySelector('#v21c [data-st]');closeSheet();"""+W%200+"""showBiz();"""+W%300+"""r.en_mis_empresas=!!document.querySelector('#sheetIn [data-ctl]');closeSheet();
          const ps=P.bk.pos[id];bkExec(id,'s',Math.ceil(ps.q*.4),c.p,true);mkTrade(1,1);r.pierde_control=!c.ctl;window.__opa=id;return r;}""")
        await pg.evaluate("async()=>{const id=Object.keys(G.mk.C).find(i=>opaOk(i)&&!G.mk.C[i].ctl&&G.mk.C[i].x===(EXN.MEX||[])[0]);showStock(id);"+W%500+"const e=$('v21c');if(e)e.scrollIntoView();"+W%150+"}");await shot('bolsa')
        R['meses']=await pg.evaluate("""async()=>{__ctx='meses';const t=[];for(let i=0;i<12;i++){P.event=null;P.dlg=null;G.offer=null;const a=performance.now();advanceUnit('m');t.push(performance.now()-a);P.event=null;P.dlg=null;hideModal();}
          t.sort((a,b)=>a-b);render();return {empresas:bzList(P).length,mediana_ms:Math.round(t[6]),max_ms:Math.round(t[11]),vivas:bzList(P).length};}""")
        R['guia']=await pg.evaluate("()=>({tema:GUIA.some(g=>/Comprar empresas/.test(g[0])),ayuda:HELP.filter(h=>/^(Empresas en venta|Grupos|Control de la empresa)$/.test(h[0])).length,glosario:GLOS.length})")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='pantallas';showBiz();"+W%400+"closeSheet();showBzMarket();"+W%400+"closeSheet();showGroups();"+W%300+"showGroups(P.grp[0].id);"+W%400+"closeSheet();showStock(window.__opa);"+W%400+"closeSheet();}")
            miss=await pg.evaluate("()=>__miss")
            R['en_espanol']=[k for k in miss][:60]
        R['errores_js']=perr[:12]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
