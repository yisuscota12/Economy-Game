# v1.7r (etapa C): prueba de navegador de box y MMA a fondo.  python3 herramientas/pw_17r.py imperio.html [idioma] [box|mma]
# Partida en México a los 18: recorre las 7 pestañas del peleador, hace bloques (3 intensidades) y sesiones, adopta un estilo, abre gimnasio y promotora,
# contrata, busca talento, firma, negocia televisión, organiza una función en pantalla; programa una pelea con campamento por bloques y análisis de video,
# y la pelea round por round revisando las estadísticas en vivo y el resultado; abre fichas con radar; se retira y entra a sus negocios desde Carrera.
# Con idioma ≠ es, envuelve I18.T y lista lo que sale idéntico y parece español (como pw_jb.py). Capturas en herramientas/capturas/c17_<idioma>_<deporte>_*.png
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';SPS=sys.argv[3:] or ['box','mma']
SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
PRE=r"""(LANG)=>{window.__miss={};window.__out=new Set();window.__ctx='';const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’]*/g,''));};
 if(LANG!=='es'&&typeof I18!=='undefined'&&I18&&!I18.__w){const T0=I18.T;I18.__w=1;I18.T=function(v){const r=T0(v);if(r!==v){__out.add(String(r).trim());return r;}if(es(v)&&!__out.has(String(v).trim())){const t=String(v).trim();(__miss[t]=__miss[t]||[]).length<2&&__miss[t].push(__ctx);}return r;};}}"""
async def run(b,sp):
    pg=await b.new_page(viewport={'width':414,'height':896});perr=[]
    pg.on('pageerror',lambda e: perr.append(str(e)[:220]))
    pg.on('console',lambda m: perr.append('console: '+m.text[:200]) if m.type=='error' else None)
    await pg.add_init_script("(()=>{let s=4242;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,tutDone:1,help:1,lang:'"+LANG+"'}))")
    await pg.goto(URL);await pg.wait_for_timeout(3500)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='18';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate(PRE,LANG)
    await pg.evaluate(f"()=>{{try{{CFG.tut=1;CFG.tutDone=1;saveCfg();}}catch(e){{}}document.querySelectorAll('.tutDim,.tutBox,#tut').forEach(e=>e.remove());dlgRoll=function(){{return 0}};P.event=null;P.dlg=null;hideModal();P.age=18;P.s.salud=85;P.dinero=U(P)*60;fcStart(P,'{sp}');save();render();}}")
    shot=lambda n: pg.screenshot(path=f'{SH}/c17_{LANG}_{sp}_{n}.png')
    JS=r"""async([sp])=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const errs=[];const R={tabs:{},blk:0,ses:0,neg:{},fight:{}};const boost=()=>{P.ft=400;P.dinero=Math.max(P.dinero,U(P)*60);P.s.salud=85;P.fc.inj=0;P.event=null;P.dlg=null;};
     const click=async(sel,root)=>{const el=(root||document).querySelector(sel);if(el&&!el.disabled){el.click();await W(60);return true;}return false;};
     const closeAll=()=>{try{hideModal();}catch(e){}};
     try{
     // amateur: combates y un torneo para llenar el historial
     for(let i=0;i<5;i++){boost();__ctx='amateur';cbAmFight(P);}boost();cbTourney(P,0);
     // pestañas
     for(const t of ['pel','ent','pre','rk','tra','esc','neg']){boost();__ctx='tab '+t;CBV.tab=t;showCB();await W(120);R.tabs[t]=document.querySelectorAll('#sheetIn .item,#sheetIn .cb7card').length;}
     // bloques en las tres intensidades
     for(let it=0;it<3;it++){boost();P.fc.cb.fat=0;CBV.tab='ent';CB7.int=it;showCB();await W(60);const bs=[...document.querySelectorAll('#sheetIn [data-x7^="bk"]:not([disabled])')];for(const x of bs.slice(0,4)){__ctx='bloque';boost();P.fc.cb.fat=0;x.click();R.blk++;await W(60);closeAll();CBV.tab='ent';showCB();await W(40);break;}}
     for(let j=0;j<cbBlkL(sp).length;j++){boost();P.fc.cb.fat=10;CBV.tab='ent';showCB();await W(40);__ctx='bloque '+j;const x=document.querySelector(`#sheetIn [data-x7="bk${j}"]`);if(x&&!x.disabled){x.click();R.blk++;await W(50);closeAll();}}
     // sesiones (sin pelea: el análisis de video sale bloqueado)
     for(const S of CB_SES){if(S[6]&&S[6]!==sp)continue;boost();P.fc.cb.ses={};CBV.tab='ent';showCB();await W(40);__ctx='sesión '+S[0];const x=document.querySelector(`#sheetIn [data-x7="se${S[0]}"]`);if(x&&!x.disabled){x.click();R.ses++;await W(50);closeAll();}}
     // estilo: fuerza afinidad y adopta
     boost();const c=P.fc.cb;const j=(c.st+1)%CB_ST[sp].length;c.sa[j]=75;CBV.tab='esc';showCB();await W(60);__ctx='estilo';const ab=document.querySelector(`#sheetIn [data-st7="${j}"]`);if(ab){ab.click();await W(80);const ok=document.querySelector('#modal.on .btn.gold,#modal.on button.gold');if(ok)ok.click();await W(80);}R.style=c.st===j;
     // negocios
     boost();CBV.tab='neg';showCB();await W(60);__ctx='abrir gimnasio';await click('#sheetIn [data-x7="og0"]');closeAll();R.neg.gym=!!(P.cbo&&P.cbo.g);
     if(P.cbo&&P.cbo.g){for(let i=0;i<2;i++){CBV.tab='neg';showCB();await W(40);__ctx='contratar';await click('#sheetIn [data-x7^="ogh"]');}
       CBV.tab='neg';showCB();await W(40);__ctx='talento';await click('#sheetIn [data-x7="ogs"]');closeAll();CBV.tab='neg';showCB();await W(40);__ctx='firmar';await click('#sheetIn [data-x7^="ogk"]');
       CBV.tab='neg';showCB();await W(40);await click('#sheetIn [data-fm7="1.4"]');CBV.tab='neg';showCB();await W(40);__ctx='entrenar aquí';await click('#sheetIn [data-x7="ogt"]');
       CBV.tab='neg';showCB();await W(40);__ctx='equipo';await click('#sheetIn [data-x7="oge"]');R.neg.co=P.cbo.g.co.length;R.neg.F=P.cbo.g.F.length;}
     boost();CBV.tab='neg';showCB();await W(60);__ctx='abrir promotora';await click('#sheetIn [data-x7="opo"]');closeAll();R.neg.pr=!!(P.cbo&&P.cbo.pr);
     if(P.cbo&&P.cbo.pr){for(let i=0;i<4;i++){boost();CBV.tab='neg';showCB();await W(40);__ctx='firmar a promotora';await click('#sheetIn [data-x7^="ops"]');}
       CBV.tab='neg';showCB();await W(40);__ctx='tv';if(await click('#sheetIn [data-x7="opt"]')){await W(900);await click('#tvOk');}
       // función: avanza el mundo para que los peleadores estén disponibles
       for(const x of P.cbo.pr.F){const f=G.cb.F[x.i];if(f)f.lf=cbNow()-120;}boost();CBV.tab='neg';showCB();await W(40);__ctx='función';
       if(await click('#sheetIn [data-x7="ope"]')){await W(120);R.neg.plan=!!document.querySelector('#modal.on .fin');await click('#modal.on [data-tk7="2"]');await W(60);__ctx='presentar';await click('#opG');await W(150);R.neg.ev=P.cbo.pr.h.length;await click('#opK');}
       R.neg.prF=P.cbo.pr.F.length;}
     // pelea con campamento por bloques y análisis de video
     boost();c.pro=true;if(!c.prom){cbPromOffers(P,true);if(c.po.length)cbSignProm(P,c.po.length-1);}c.offers=[];cbOffersGen(P,2,false);CBV.tab='pre';showCB();await W(80);__ctx='ofertas';R.fight.offers=c.offers.length;
     const rad=document.querySelector('#sheetIn .ofr details');R.fight.offerRadar=!!rad;
     if(c.offers.length){boost();cbAccept(P,0);}R.fight.ok=!!c.fight;
     if(c.fight){const L=cbBlkL(sp);for(const t of ['f','t','s','a']){const j=L.findIndex(b=>b[6]===t);boost();P.fc.cb.fat=0;CBV.tab='ent';showCB();await W(40);__ctx='campamento';await click(`#sheetIn [data-x7="bk${j}"]`);closeAll();}
       boost();P.fc.cb.ses={};CBV.tab='ent';showCB();await W(40);__ctx='video';await click('#sheetIn [data-x7="sevid"]');closeAll();R.fight.camp=cbCampScore(c.fight);R.fight.vid=!!c.fight.vid;
       CBV.tab='pre';showCB();await W(60);__ctx='tarjeta de pelea';R.fight.card=!!document.querySelector('#sheetIn .cb7card');
       c.fight.dt=absDay();closeSheet();__ctx='noche';cbNight();await W(120);
       for(let k=0;k<12;k++){const m=document.querySelector('#modal.on');if(!m)break;if(m.querySelector('[data-k]'))break;if(c.fight&&c.fight.step==='plan'&&!c.live)R.fight.planInfo=!!m.querySelector('.cb7card');
         const opt=m.querySelector('[data-c="1"],[data-w="0"]');if(opt){opt.click();await W(80);continue;}const go=m.querySelector('#go');if(go){go.click();await W(120);continue;}const b=m.querySelector('.btn.gold');if(b){b.click();await W(80);}else break;}
       let rounds=0;for(let k=0;k<14;k++){const m=document.querySelector('#modal.on');if(!m)break;const cor=m.querySelector('[data-k]');if(!cor)break;__ctx='round';cor.click();rounds++;await W(90);const lv=document.querySelector('#modal.on .cb7lv');if(lv)R.fight.live=1;}
       R.fight.rounds=rounds;await W(150);R.fight.result=!!document.querySelector('#modal.on .dlg.fn .big');R.fight.chart=!!document.querySelector('#modal.on .dlg.fn svg');R.fight.cs=P.fc.cb.cs.f;
       const t=document.querySelector('#modal.on [data-t]');if(t)t.click();await W(80);}
     // ficha con radar
     closeAll();const id=Object.keys(G.cb.F)[3];__ctx='ficha';cbFighterCard(id);await W(80);R.cardRadar=!!document.querySelector('#modal.on .cb7rad');closeAll();
     // amateur: un combate y un torneo para llenar el historial (en una copia)
     // retiro y acceso a negocios
     if(!NORET_){boost();__ctx='retiro';fcRetire(P);}render();const it=careerOptions().find(o=>/negocios del combate/.test(o.t));R.retiro=!!it;if(it){showCBO();await W(120);R.retiroSheet=document.querySelectorAll('#sheetIn .item').length;}
     }catch(e){errs.push(e.message+' '+(e.stack||'').split('\n')[1]);}
     if(typeof I18!=='undefined'&&I18&&LANG_!=='es'){__ctx='registro';for(const e of P.log.slice(-60))I18.T(e.t);}
     return {R,errs,miss:window.__miss};}""".replace('LANG_',json.dumps(LANG)).replace('NORET_',('1' if os.environ.get('NORET') else '0'))
    try: res=await pg.evaluate(JS,[sp])
    except Exception as e:
        print(sp,'ERROR',str(e)[:400]);await pg.close();return {}
    print(f"{sp}: {json.dumps(res['R'],ensure_ascii=False)}")
    for e in (res['errs']+perr)[:10]:print('   !',e)
    for t in ['pel','ent','esc','tra','neg']:
        await pg.evaluate(f"()=>{{try{{hideModal();}}catch(e){{}}if(P.fc&&P.fc.cb){{CBV.tab='{t}';showCB();}}else showCBO();}}");await pg.wait_for_timeout(500);await shot(t)
    for t in ['pre']:
        await pg.evaluate(f"()=>{{try{{hideModal();}}catch(e){{}}if(P.fc&&P.fc.cb){{P.fc.cb.offers=[];cbOffersGen(P,2,false);CBV.tab='{t}';showCB();}}}}");await pg.wait_for_timeout(400);await shot(t)
    if os.environ.get('NORET'):
        await pg.evaluate("()=>{try{hideModal();closeSheet();}catch(e){}const c=P.fc.cb;c.offers=[];cbOffersGen(P,1,false);if(c.offers.length&&!c.fight)cbAccept(P,0);if(c.fight){c.fight.dt=absDay();c.fight.step='fight';c.live=cbSetup(P);cbRound(c.live,'sigue');cbRound(c.live,'sigue');cbRound(c.live,'sigue');cbRoundUI();}}");await pg.wait_for_timeout(600);await shot('round')
    await pg.close();return res.get('miss',{})
async def main():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for sp in SPS:
            m=await run(b,sp)
            for s,w in (m or {}).items():out.setdefault(s,[]).extend(w)
        await b.close()
    if LANG!='es':
        json.dump(out,open(f'/tmp/c17_{LANG}.json','w'),ensure_ascii=False,indent=0);print(f'TOTAL {LANG}: {len(out)} textos sin traducir')
        for s,w in list(out.items())[:int(os.environ.get('NES','40'))]:print(' ·',s[:150],' ⟵',w[0])
asyncio.run(main())
