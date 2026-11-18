# v1.9b (fase 2 de la ruta 9d, parte 2): prueba de navegador.  python3 herramientas/pw_19b.py imperio.html [idioma] [tema]
# Recorre: provincia de cada ciudad (CITY_RG igual al mapa de identificadores), clubes con provincia y migración de partidas viejas,
# ficha del lugar y de club (ubicación y «Ver en el mapa»), burbuja con ejércitos, ejército enemigo en camino y asedio, portada con
# «¿Sabías que…?» (rotar, tocar, fuente), sistema de diseño (tokens, pestañas, estados), temas, GSAP (interruptor y movimiento reducido)
# y vista horizontal. Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c19b_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,covTest:1,lang:'"+LANG+"',theme:'"+THEME+"'}))")
        await pg.goto(URL);await pg.wait_for_timeout(600)
        await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c19b_{LANG}_{n}.png')
        R={}
        # --- portada: «¿Sabías que…?»
        R['sabias']=await pg.evaluate("()=>{const f=document.querySelector('#cover .cv-fact');return f?{t:f.querySelector('.cv-ft').textContent.length>20,src:!!f.querySelector('.cv-fs').textContent,n:typeof SABIAS!=='undefined'?SABIAS.length:0}:null}")
        await shot('portada_sabias')
        R['sabias_toca']=await pg.evaluate("async()=>{const f=document.querySelector('#cover .cv-fact');if(!f)return null;const a=f.querySelector('.cv-ft').textContent;f.click();await new Promise(r=>setTimeout(r,700));return a!==f.querySelector('.cv-ft').textContent;}")
        R['sabias_todos']=await pg.evaluate("()=>{if(typeof SABIAS==='undefined')return null;const bad=SABIAS.filter(x=>!x[0]||!x[1]||x[0].length>190);return {n:SABIAS.length,malos:bad.length};}")
        for s in ['planeta','atlas']:
            await pg.evaluate(f"()=>{{__ctx='portada {s}';document.querySelector('[data-cvs={s}]').click();}}");await pg.wait_for_timeout(700);await shot('portada_'+s)
        await pg.evaluate("()=>{document.querySelector('[data-cvs=noche]').click();}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{$('cvNew').click();}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=30;P.dinero=5e6;render();}")
        await pg.wait_for_timeout(600)
        # --- 1) provincia de cada ciudad: CITY_RG igual al mapa de identificadores
        R['ciudades_iguales']=await pg.evaluate("""()=>{decodeIds();if(!IDS)return 'sin IDS';let same=0,diff=[];for(let j=0;j<CITIES.length;j++){const c=CITIES[j];const mx=Math.floor(c[0]),my=Math.floor(c[1]);let k=(mx>=0&&my>=0&&mx<MW&&my<MH)?IDS[my*MW+mx]:0;
            for(let d=1;d<=4&&!k;d++)for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){const x=mx+dx,y=my+dy;if(x>=0&&y>=0&&x<MW&&y<MH&&IDS[y*MW+x]){k=IDS[y*MW+x];break;}}
            const r=k?IDX2RID[k]:null;if(r==cityReg(j)||(!r&&!cityReg(j)))same++;else diff.push(c[3]+':'+r+'/'+cityReg(j));}return {same,diff:diff.length,ej:diff.slice(0,5)};}""")
        R['clubes']=await pg.evaluate("()=>{ftEnsure();const C=Object.values(G.ft.C);return {total:C.length,con_provincia:C.filter(c=>c.rg).length,mismo_pais:C.filter(c=>c.rg&&RG[c.rg].n===c.c).length};}")
        R['migracion']=await pg.evaluate("()=>{const C=Object.values(G.ft.C);const o={};C.forEach(c=>{o[c.i]=c.rg;c.rg=null;});G.ft.rg19=0;ftEnsure();return C.filter(c=>c.rg===o[c.i]).length+' de '+C.length;}")
        R['jalisco']=await pg.evaluate("()=>{const rid=Object.keys(RG).find(k=>RG[k].n==='MEX'&&RG[k].nm==='Jalisco');return plClubs(rid).map(c=>c.n);}")
        R['ciudad_gdl']=await pg.evaluate("()=>{const i=CITIES.findIndex(c=>c[3]==='Guadalajara');return plClubs(cityReg(i),'Guadalajara').map(c=>c.n);}")
        R['ciudad_toluca']=await pg.evaluate("()=>{const i=CITIES.findIndex(c=>c[3]==='Toluca de Lerdo');return plClubs(cityReg(i),'Toluca de Lerdo').map(c=>c.n);}")
        JS=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const R={};__ctx='ficha club';
          const rid=Object.keys(RG).find(k=>RG[k].n==='MEX'&&RG[k].nm==='Jalisco');PL.city=null;showPlace(rid,'ci');await W(250);const b=document.querySelector('#sheetIn [data-plc]');R.ficha_tiene_clubes=!!b;
          if(b){b.click();await W(300);R.ubicacion=(document.querySelector('#modal .cbloc')||{}).textContent||null;}
          return R;}"""
        R.update(await pg.evaluate(JS));await shot('club_ubicacion')
        R['ver_en_mapa']=await pg.evaluate("async()=>{const z=document.querySelector('#modal [data-cbz]');if(!z)return null;z.click();await new Promise(r=>setTimeout(r,500));return !$('modal').classList.contains('on')&&RG[G.sel].nm;}")
        # --- 2) burbuja con ejércitos y asedio (guerra con Estados Unidos)
        R['guerra']=await pg.evaluate("""()=>{__ctx='burbuja guerra';P.ruler=true;declareWar('USA','MEX');syncMando();const rid=Object.keys(RG).find(k=>RG[k].n==='MEX'&&RG[k].nm==='Chihuahua');
            const nb=RG[rid].adj.find(k=>RG[k].n==='USA')||Object.keys(RG).find(k=>RG[k].n==='USA'&&RG[k].nm==='Texas');
            G.armies=G.armies.filter(a=>a.r!==rid);const a=newArmy('USA',rid,42000);G.sg[rid]={by:'USA',t:1};newArmy('MEX',rid,15000);
            const b=newArmy('USA',nb,30000);b.path=[rid];syncArmyIdx&&syncArmyIdx('USA');syncArmyIdx&&syncArmyIdx('MEX');CACHE.wk=null;CACHE.fr=null;G._myAt=null;
            G.sel=rid;renderSel();const w=$('mapWrap');vb.w=900;vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=RG[rid].c[0]-vb.w/2;vb.y=RG[rid].c[1]-vb.h/2;setVB();drawOverlay();window.__rid=rid;return rid;}""")
        await pg.wait_for_timeout(400)
        xy=await pg.evaluate("()=>{const c=RG[__rid].c;const b=$('mapWrap').getBoundingClientRect();return [b.left+(c[0]-vb.x)/vb.w*b.width,b.top+(c[1]-vb.y)/vb.h*b.height]}")
        await pg.touchscreen.tap(xy[0],xy[1]);await pg.wait_for_timeout(500)
        R['burbuja_militar']=await pg.evaluate("()=>{const p=document.querySelector('.mpop');if(!p)return null;return {asedio:!!p.querySelector('.mps'),barra:p.querySelector('.mpbar b')&&p.querySelector('.mpbar b').style.width,bandos:[...p.querySelectorAll('.mpm .mpc small')].map(x=>x.textContent),en_camino:(p.querySelector('.mpw')||{}).textContent||null,texto:p.querySelector('.mps')&&p.querySelector('.mps').textContent};}")
        await shot('burbuja_guerra')
        await pg.evaluate("()=>{mpopHide();}")
        # --- 4) sistema de diseño, temas, GSAP, vista horizontal
        R['diseno']=await pg.evaluate("()=>{const cs=getComputedStyle(document.documentElement);return {tokens:!!cs.getPropertyValue('--fs-3').trim(),gsap:typeof gsap!=='undefined',anim:typeof DS!=='undefined'?DS.anim():null};}")
        R['contraste']=await pg.evaluate("()=>typeof dsContrast==='function'?dsContrast():null")
        R['temas_aa']=await pg.evaluate("()=>{const o={};const t0=CFG.theme;for(const k of Object.keys(THEMES)){CFG.theme=k;applyTheme();const c=dsContrast();o[k]=c.min+(c.aa?' ✓':' ✗');}CFG.theme=t0;applyTheme();return o;}")
        R['gsap_pantalla']=await pg.evaluate("async()=>{CFG.dsa='on';$('nAct').click();await new Promise(r=>setTimeout(r,60));const mid=[...$('sheetIn').children].some(e=>e.style.opacity!=='');await new Promise(r=>setTimeout(r,900));const left=[...$('sheetIn').children].filter(e=>e.style.opacity!==''||e.style.transform!=='').length;closeSheet();await new Promise(r=>setTimeout(r,300));return {animando:mid,restos:left};}")
        R['gsap_pestana']=await pg.evaluate("async()=>{showPlace(P.r,'pr');await new Promise(r=>setTimeout(r,500));document.querySelector('[data-plt=pa]').click();await new Promise(r=>setTimeout(r,40));const mid=[...$('sheetIn').querySelectorAll('*')].some(e=>e.style&&e.style.transform&&e.style.transform.indexOf('translate')>=0);await new Promise(r=>setTimeout(r,700));const left=[...$('sheetIn').querySelectorAll('*')].filter(e=>e.style&&(e.style.opacity!==''&&e.style.opacity!=='1')).length;closeSheet();CFG.dsa='auto';await new Promise(r=>setTimeout(r,300));return {animando:mid,restos:left};}")
        await pg.evaluate("()=>{__ctx='acciones';$('nAct').click();}");await pg.wait_for_timeout(600);await shot('acciones')
        await pg.evaluate("()=>{closeSheet();__ctx='ajustes';showSettings&&showSettings();}");await pg.wait_for_timeout(600);await shot('ajustes')
        R['ajuste_anim']=await pg.evaluate("()=>!!document.querySelector('#sheetIn [data-dsa]')")
        await pg.evaluate("()=>closeSheet()");await pg.wait_for_timeout(300)
        for th in ['claro','amigable','medieval','neon']:
            await pg.evaluate(f"()=>{{CFG.theme='{th}';applyTheme();render();showPlace(P.r,'pr');}}");await pg.wait_for_timeout(500);await shot('tema_'+th)
        await pg.evaluate("()=>{closeSheet();CFG.theme='"+THEME+"';applyTheme();render();}");await pg.wait_for_timeout(300)
        await pg.set_viewport_size({'width':896,'height':414});await pg.wait_for_timeout(800)
        R['horizontal']=await pg.evaluate("()=>document.body.classList.contains('land')")
        await shot('horizontal')
        await pg.evaluate("()=>{$('nAct').click();}");await pg.wait_for_timeout(600);await shot('horizontal_hoja')
        R['errores_js']=perr[:12]
        if LANG!='es':
            R['en_espanol']=await pg.evaluate("()=>Object.entries(__miss).slice(0,60).map(([t,c])=>t.slice(0,90)+' ['+c.join(',')+']')")
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
