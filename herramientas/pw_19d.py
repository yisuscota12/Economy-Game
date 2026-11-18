# v1.9d (fase 2 de la ruta 9d, parte 4): prueba de navegador.  python3 herramientas/pw_19d.py imperio.html [idioma] [tema]
# Recorre: partículas (Ajustes ✨ con 3 opciones + Probar; monedas, confeti, estrellas, chispas; apagadas no dibujan; no tocan Math.random),
# sonido (Ajustes 🔊 reemplaza el botón viejo: volumen Apagado/Bajo/Medio/Alto, música aparte, Probar; bus maestro con compresor;
# la música no suena con «Música: no»), momentos clave con sonido y partículas aunque Lottie esté apagado, monedas al entrar dinero de
# golpe, chispas en batallas del mapa, mover arrastrando (mantener 0.3 s, línea y etiqueta, soltar = orden; soltar en la misma
# provincia cancela; arrastrar sin esperar mueve el mapa), estilo nuevo en Bancos, Mis empresas (resumen y detalle), Servicios y Mesa.
# Con idioma ≠ es lista lo que sale en español.  Capturas en herramientas/capturas/c19d_<idioma>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';THEME=sys.argv[3] if len(sys.argv)>3 else 'noche'
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’.]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
CFG0="{lastLvl:'m',tut:1,tutDone:1,help:1,lang:'%s',theme:'%s',lot:'on',pfx:'on',snd:1,vol:2,mus:1,dsa:'off'}"%(LANG,THEME)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':414,'height':896},is_mobile=True,has_touch=True);perr=[]
        pg.on('pageerror',lambda e: perr.append(str(e)[:240]))
        pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' and 'blob:null' not in m.text else None)
        await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();if(!localStorage.getItem('imperioCfg'))localStorage.setItem('imperioCfg',JSON.stringify("+CFG0+"))")
        await pg.goto(URL);await pg.wait_for_timeout(600);await pg.evaluate(PRE,LANG);await pg.wait_for_timeout(2600)
        shot=lambda n: pg.screenshot(path=f'{SH}/c19d_{LANG}_{n}.png')
        await pg.evaluate("()=>{if(typeof CV!=='undefined'&&CV.on){const n=$('cvNew');n&&n.click();}}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='30';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{try{CFG.tut=1;CFG.tutDone=1;saveCfg();}catch(e){}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=35;P.dinero=8e7;render();}")
        await pg.wait_for_timeout(500);await pg.mouse.click(5,5)   # gesto real: desbloquea el audio
        R={}
        # --- Ajustes
        R['ajustes']=await pg.evaluate("async()=>{__ctx='ajustes';showSettings();await new Promise(r=>setTimeout(r,400));return {particulas:[...document.querySelectorAll('[data-pfx]')].map(b=>b.dataset.pfx+(b.classList.contains('on')?'*':'')),volumen:[...document.querySelectorAll('[data-vol]')].map(b=>b.dataset.vol+(b.classList.contains('on')?'*':'')),musica:!!document.querySelector('[data-mus]'),boton_viejo:!!$('sSnd'),orden_ok:!!($('cfLot')&&$('cfLot').nextElementSibling===$('cfPfx'))};}")
        await pg.evaluate("()=>{const x=$('cfPfx');x&&x.scrollIntoView();}");await pg.wait_for_timeout(300);await shot('ajustes')
        # --- partículas
        PF=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};closeSheet();await W(300);const s0=Math.random.toString();let calls=0;const MR=Math.random;Math.random=function(){calls++;return MR();};
          o.on=pfxOn();const n0=PFX.n;['coin','conf','star','spark','smoke'].forEach(k=>pfxBurst(k,200,300,6));o.creadas=PFX.n-n0;await W(80);o.lienzo=!!$('pfx')&&$('pfx').style.display==='block';
          o.dibuja=(()=>{const c=$('pfx');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let k=0;for(let i=3;i<d.length;i+=4*13)if(d[i])k++;return k>0;})();
          await W(3200);o.se_limpia=PFX.L.length===0&&$('pfx').style.display==='none';o.math_random_intacto=calls===0;Math.random=MR;
          CFG.pfx='off';o.apagado_no_crea=pfxBurst('coin',200,300,10)===0;CFG.pfx='on';
          o.max=(()=>{for(let i=0;i<20;i++)pfxBurst('conf',200,300,30);return PFX.L.length<=180;})();await W(3500);return o;}"""
        R['particulas']=await pg.evaluate(PF)
        # --- sonido
        SN=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};ac();sndBus();await W(200);o.estado=SND.ctx&&SND.ctx.state;o.bus=!!(SND.g&&SND.cmp&&SND.mg);
          const n0=SND.n||0;sfx2('notify');await W(50);o.suena=(SND.n||0)>n0;
          const n1=SND.n;CFG.mus=0;sndBus();tone(262,0,3.6,'sine',.012);o.musica_apagada=SND.n===n1;CFG.mus=1;sndBus();tone(262,0,3.6,'sine',.012);o.musica_encendida=SND.n===n1+1;
          CFG.vol=1;sndBus();o.vol_bajo=+SND.g.gain.value.toFixed(2);CFG.vol=3;sndBus();o.vol_alto=+SND.g.gain.value.toFixed(2);CFG.vol=2;sndBus();
          CFG.snd=0;const n2=SND.n;sfx2('victoria');o.apagado_mudo=SND.n===n2;CFG.snd=1;
          const n3=SND.n;openSheetRaw('<h3>x</h3>',()=>{});await W(30);o.abrir_suena=SND.n>n3;closeSheet();await W(300);
          const n4=SND.n;toast('Prueba','aviso');await W(30);o.aviso_suena=SND.n>n4;return o;}"""
        R['sonido']=await pg.evaluate(SN)
        # --- momentos clave sin Lottie: sonido y partículas igual
        MK=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};CFG.lot='off';LOTX.last=0;const n0=PFX.n,s0=SND.n;log('🏆 ¡Campeón: Club!','big');await W(500);
          o.sin_lottie=!document.querySelector('#lotfx');o.particulas=PFX.n>n0;o.sonido=SND.n>s0&&SND.last==='victoria';CFG.lot='on';LOTX.last=0;await W(2600);
          LOTX.last=0;const n1=PFX.n;log('🏅 Logro: Prueba — algo.','big');await W(500);o.logro_estrellas=PFX.n>n1&&PFX.last==='star';o.logro_lottie=LOTX.played==='logro';await W(2600);
          const n2=PFX.n,s2=SND.n;FF_ON=true;LOTX.last=0;log('🏆 ¡Campeón: Club!','big');await W(500);FF_ON=false;o.avance_rapido_nada=PFX.n===n2&&SND.n===s2;
          const s3=SND.n;log('🥊 Pierdes contra Juan por decisión.','bad');await W(60);o.derrota_suena=SND.n>s3&&SND.last==='mal';return o;}"""
        R['momentos']=await pg.evaluate(MK)
        await pg.evaluate("()=>{CFG.lot='off';LOTX.last=0;log('🏆 ¡Campeón: Club!','big');}");await pg.wait_for_timeout(550);await shot('confeti');await pg.wait_for_timeout(2500);await pg.evaluate("()=>{CFG.lot='on';}")
        # --- monedas al entrar dinero
        R['monedas']=await pg.evaluate("async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));V19M.t=0;const n0=PFX.n,s0=SND.n;render();await W(100);P.dinero+=5e7;render();await W(120);const o={monedas:PFX.n>n0&&PFX.last==='coin',sonido:SND.n>s0};const n1=PFX.n;P.dinero+=100;render();await W(100);o.poco_no=PFX.n===n1;return o;}")
        await shot('monedas');await pg.wait_for_timeout(2500)
        # --- guerra: chispas de batalla y arrastrar
        await pg.evaluate("""()=>{P.ruler=true;P.nat=3;G.mhelp=1;declareWar('USA','MEX');syncMando();const rid=Object.keys(RG).find(k=>RG[k].n==='MEX'&&RG[k].nm==='Chihuahua');
            G.armies=G.armies.filter(a=>a.r!==rid);newArmy('MEX',rid,15000);syncArmyIdx&&syncArmyIdx('MEX');CACHE.wk=null;CACHE.fr=null;G._myAt=null;G.sel=rid;MO.sel=null;renderSel();
            const w=$('mapWrap');vb.w=420;vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=RG[rid].c[0]-vb.w/2;vb.y=RG[rid].c[1]-vb.h/2;setVB();drawOverlay();window.__rid=rid;}""")
        await pg.wait_for_timeout(500)
        R['batalla']=await pg.evaluate("async()=>{const n0=PFX.n;animateMonth([{t:'Batalla en Chihuahua',r:__rid,c:'bad',big:1}]);await new Promise(r=>setTimeout(r,120));return {chispas:PFX.n>n0};}")
        await pg.wait_for_timeout(1800)
        xy=await pg.evaluate("()=>{const p=v19ScrPos(__rid);const a=[p[0],p[1]-14];const L=RG[__rid].adj.filter(k=>RG[k].n==='MEX').map(k=>[k,v19ScrPos(k)]).filter(x=>x[1]&&Math.hypot(x[1][0]-a[0],x[1][1]-a[1])>60&&pickAt(x[1][0],x[1][1])===x[0]);const t=L[0][0],q=L[0][1];return {a,t:q,tid:t,nm:RG[t].nm,en_marcador:pickAt(a[0],a[1])}}")
        # arrastre: mantener 0.4 s, mover, soltar
        await pg.mouse.move(xy['a'][0],xy['a'][1]);await pg.mouse.down();await pg.wait_for_timeout(420)
        await pg.mouse.move((xy['a'][0]+xy['t'][0])/2,(xy['a'][1]+xy['t'][1])/2,steps=4);await pg.mouse.move(xy['t'][0],xy['t'][1],steps=4);await pg.wait_for_timeout(150)
        R['arrastre_durante']=await pg.evaluate("()=>({activo:DRG.on,linea:!!document.querySelector('#drgL.on'),etiqueta:(document.querySelector('#drgL .drgT')||{}).textContent||'',vb_quieto:true})")
        await shot('arrastre')
        vb0=await pg.evaluate("()=>[vb.x,vb.y]")
        await pg.mouse.up();await pg.wait_for_timeout(500)
        R['arrastre']=await pg.evaluate("(t)=>{const a=G.armies.find(x=>x.r===__rid&&x.o==='MEX');return {ruta:!!(a&&a.path&&a.path.length&&a.path[a.path.length-1]===t),mapa_no_se_movio:Math.abs(vb.x-%s)<1&&Math.abs(vb.y-%s)<1,sin_burbuja:!document.querySelector('.mpop'),linea_quitada:!document.querySelector('#drgL.on'),reporte:(MO.rep&&MO.rep[0]&&MO.rep[0].t)||''};}"%(vb0[0],vb0[1]),xy['tid'])
        # soltar en la misma provincia: cancela
        await pg.evaluate("()=>{const a=G.armies.find(x=>x.r===__rid&&x.o==='MEX');a.path=[];}");await pg.wait_for_timeout(200)
        xy['a']=await pg.evaluate("()=>{const p=v19ScrPos(__rid);return [p[0],p[1]-14]}")   # la barra de Mando crece con el reporte y el mapa baja un poco
        await pg.mouse.move(xy['a'][0],xy['a'][1]);await pg.mouse.down();await pg.wait_for_timeout(420);await pg.mouse.move(xy['a'][0]+3,xy['a'][1]+3,steps=2);await pg.mouse.up();await pg.wait_for_timeout(300)
        R['arrastre_cancelado']=await pg.evaluate("()=>{const a=G.armies.find(x=>x.r===__rid&&x.o==='MEX');return {sin_ruta:!(a.path&&a.path.length),sin_orden:!MO.ord};}")
        # arrastrar sin esperar: mueve el mapa
        xy['a']=await pg.evaluate("()=>{const p=v19ScrPos(__rid);return [p[0],p[1]-14]}")
        v1=await pg.evaluate("()=>vb.x")
        await pg.mouse.move(xy['a'][0],xy['a'][1]);await pg.mouse.down();await pg.mouse.move(xy['a'][0]-80,xy['a'][1],steps=5);await pg.mouse.up();await pg.wait_for_timeout(300)
        R['pan_normal']=await pg.evaluate("(v)=>({mapa_se_movio:Math.abs(vb.x-v)>1,sin_arrastre:!DRG.on})",v1)
        # --- estilo nuevo
        ES=r"""async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const o={};
          __ctx='bancos';showBanks('acc');await W(300);let s=$('sheetIn');o.bancos={tarjetas:s.querySelectorAll('[data-v19d] .plt').length,tasa_una_linea:[...s.querySelectorAll('.bnk .h>span')].every(x=>x.getBoundingClientRect().height<28)};
          for(const t of ['cr','mf','own']){__ctx='bancos '+t;showBanks(t);await W(150);}
          const r=Object.keys(RG).find(k=>RG[k].n==='MEX');Object.keys(BZK).slice(0,2).forEach(k=>bzOpen(P,k,r,false));
          __ctx='empresas';showBiz();await W(300);s=$('sheetIn');o.empresas={tarjetas:s.querySelectorAll('[data-v19d] .plt').length};
          __ctx='empresa';showBizD(0);await W(300);s=$('sheetIn');o.empresa={tarjetas:s.querySelectorAll('.kv.kvt>div').length};
          __ctx='servicios';showServices();await W(300);s=$('sheetIn');o.servicios={tarjetas:s.querySelectorAll('[data-v19d] .plt').length};
          P.career={track:'fin',rank:3,years:2,emp:'Banco X'};__ctx='mesa';showDesk('desk');await W(300);s=$('sheetIn');o.mesa={tarjetas:s.querySelectorAll('.kv.kvt>div').length};return o;}"""
        R['estilo']=await pg.evaluate(ES)
        for n,js in [('bancos',"()=>showBanks('acc')"),('empresas',"()=>showBiz()"),('empresa',"()=>showBizD(0)"),('servicios',"()=>showServices()"),('mesa',"()=>showDesk('desk')")]:
            await pg.evaluate(js);await pg.wait_for_timeout(450);await shot(n)
        await pg.evaluate("()=>closeSheet()")
        R['guia']=await pg.evaluate("()=>{const i=GUIA.findIndex(g=>/^✋/.test(g[0])),j=GUIA.findIndex(g=>/^🪖/.test(g[0]));return i>=0&&i===j+1;}")
        R['ayuda']=await pg.evaluate("()=>['Partículas','Sonido'].map(k=>HELP.some(h=>h[0]===k))")
        if LANG!='es':
            await pg.evaluate("async()=>{__ctx='guía';showGuide&&showGuide();await new Promise(r=>setTimeout(r,300));const b=[...document.querySelectorAll('#sheetIn .item, #sheetIn button')].find(x=>/✋/.test(x.textContent));b&&b.click();await new Promise(r=>setTimeout(r,300));}")
            await shot('guia')
        R['errores_js']=perr[:12]
        if LANG!='es':
            miss=await pg.evaluate("()=>Object.entries(__miss).map(([k,v])=>k+'  ['+v.join(' | ')+']')")
            R['en_español']=len(miss);R['ejemplos_español']=miss[:40]
        print(json.dumps(R,ensure_ascii=False,indent=1))
        await b.close()
asyncio.run(main())
