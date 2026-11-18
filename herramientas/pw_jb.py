# v1.7p (v1.6e del plan): prueba de navegador de la vida de las carreras comunes.  python3 herramientas/pw_jb.py imperio.html [idioma] [oficio…]
# Por oficio: partida en México a los 24, consigue el empleo desde el menú Carrera (reintenta si no lo contratan), abre «💼 Tu empleo», recorre las
# 4 pestañas y pulsa cada botón habilitado (horas, acciones, comer con compañeros), fuerza vacante y oferta y las resuelve en pantalla, avanza NMES meses
# con el botón de mes (cuenta las pausas del reloj y los avisos), recorre los diálogos de trabajo que salgan y toma capturas.
# Con idioma ≠ es, envuelve I18.T y lista lo que sale idéntico y parece español (como pw_b6p2_fama.py).
import asyncio,os,sys,json,re
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);LANG=sys.argv[2] if len(sys.argv)>2 else 'es';KS=sys.argv[3:] or ['Obrero','Médico','Programador','Campesino']
NMES=int(os.environ.get('NMES','14'));SH=os.path.join(os.path.dirname(os.path.abspath(__file__)),'capturas');os.makedirs(SH,exist_ok=True)
JS=r"""async([k,NMES,LANG])=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const errs=[],miss={};let ctx='';const OUT=new Set();
 const es=s=>{s=String(s==null?'':s).trim();if(s.length<3)return false;return /[a-záéíóúñ]{3}/.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü'’]*/g,''));};
 let T0=null;if(LANG!=='es'&&typeof I18!=='undefined'&&I18){T0=I18.T;I18.T=function(v){const r=T0(v);if(r!==v){OUT.add(String(r).trim());return r;}if(es(v)&&!OUT.has(String(v).trim())){const t=String(v).trim();(miss[t]=miss[t]||[]).length<3&&miss[t].push(k+'/'+ctx);}return r;};}
 const quiet=()=>{P.event=null;P.dlg=null;};const boost=()=>{P.ft=240;P.dinero=Math.max(P.dinero,60*U(P));P.s.salud=85;};
 const settle=async(tag)=>{for(let i=0;i<20;i++){await W(30);const m=document.querySelector('#modal.on');if(!m)break;ctx=tag+'/m'+i;const bs=[...m.querySelectorAll('button:not([disabled])')];if(!bs.length){hideModal();break;}try{bs[i%bs.length].click();}catch(e){errs.push(tag+': '+e.message);}await W(50);}if(document.querySelector('#modal.on'))hideModal();quiet();};
 const r={k,hired:0,clicks:0,stops:{},toasts:[],dlg:[],tabs:{}};
 // conseguir el empleo desde el menú Carrera
 for(let t=0;t<12&&!P.job;t++){boost();quiet();const items=careerOptions();const it=items.find(o=>o.sec==='Empleos'&&o.t===k);if(!it){errs.push('sin opción '+k);break;}if(!it.can){P.edu.degree={Médico:'Medicina',Abogado:'Derecho',Ingeniero:'Ingeniería'}[k]||'Economía';P.s.inteligencia=75;continue;}try{log(it.fn(),'');}catch(e){errs.push('contratar: '+e.message);}}
 r.hired=P.job?1:0;if(!P.job)return {r,errs,miss};jbEnsure(P);
 const view=async(tab)=>{let n=0;for(let i=0;i<40;i++){try{hideModal();closeSheet();}catch(e){}boost();quiet();ctx=tab;showJob(tab);await W(40);const bs=[...document.querySelectorAll('#sheetIn button:not([disabled])')].filter(b=>!b.closest('.ntabs')&&!/Menú principal|Atrás|←/.test(b.textContent));if(i>=bs.length)break;ctx=tab+'#'+i+' '+bs[i].textContent.trim().slice(0,20);try{bs[i].click();}catch(e){errs.push(ctx+': '+e.message);}n++;await W(70);await settle(ctx);}return n;};
 for(const t of ['pue','equ','con','tra'])r.tabs[t]=await view(t);
 // vacante y oferta forzadas, resueltas en pantalla
 const w=P.job.w;if(w.rk<jbOfi(P).rk.length-1){jbVacOpen(P);w.pf=75;r.tabs.vac=await view('pue');}
 if(P.job){jbOffer(P);JB_NOTE=null;showJob('pue');await W(60);const b=[...document.querySelectorAll('#sheetIn [data-a="or"]')][0];if(b){b.click();r.offerUI=1;}await W(60);}
 // avanzar meses con el reloj (pausas por evaluación, vacante, oferta)
 const L0=P.log.length;let toasts=0;const _t=toast;window.toast=function(a,b){r.toasts.push(String(a).slice(0,30));return _t(a,b);};
 for(let m=0;m<NMES;m++){try{hideModal();closeSheet();}catch(e){}boost();quiet();ctx='mes'+m;if(!P.job){P.job={name:k,o:'4',k:1,bonus:1};jbEnsure(P);}
   try{const res=clockAdvance(31,{});if(res&&res.stop)r.stops[res.stop]=(r.stops[res.stop]||0)+1;render();}catch(e){errs.push('mes'+m+': '+e.message);}await W(120);
   if(document.querySelector('#modal.on')){const tt=(document.querySelector('#modal.on h3')||{}).textContent||'';if(P.dlg)r.dlg.push(P.dlg.id||tt.slice(0,30));}await settle('mes'+m);}
 window.toast=_t;
 // diálogos de trabajo, uno por uno
 for(const id of ['jb_turno','jb_recorte','jb_trato','jb_chisme','jb_proyecto']){try{const d=DLG.find(x=>x.id===id);if(!d)continue;if(!P.job){P.job={name:k,o:'4',k:1,bonus:1};jbEnsure(P);}if(id==='jb_trato')jbBoss(P).rel=20;
   ctx='dlg/'+id;P.dseen={};startDialog(P,d);}catch(e){errs.push(id+': '+e.message);}if(P.dlg){showDialog();await W(80);r.dlg.push(id);await settle('dlg/'+id);}}
 ctx='registro';if(T0){for(const e of P.log)I18.T(e.t);I18.T=T0;}
 r.log=P.log.slice(L0).map(l=>l.t).filter(t=>/Evaluación|Vacante|ascienden|despiden|Aguinaldo|sindicato|ofrece/.test(t)).slice(0,6);
 return {r,errs:errs.slice(0,12),miss};}"""
async def main():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for k in KS:
            pg=await b.new_page(viewport={'width':414,'height':896});perr=[]
            pg.on('pageerror',lambda e: perr.append(str(e)[:200]))
            await pg.add_init_script("(()=>{let s=777;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();localStorage.setItem('imperioCfg',JSON.stringify({lastLvl:'m',tut:1,help:1,lang:'"+LANG+"'}))")
            await pg.goto(URL);await pg.wait_for_timeout(3500)
            await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sA').value='24';const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.age=24;}")
            try: res=await pg.evaluate(JS,[k,NMES,LANG])
            except Exception as e: print(k,'ERROR',str(e)[:300]);continue
            r=res['r'];print(f"{k}: contratado {r['hired']} · pestañas {r['tabs']} · oferta en pantalla {r.get('offerUI',0)} · pausas {r['stops']} · avisos {len(r['toasts'])} {sorted(set(r['toasts']))[:5]} · diálogos {r['dlg']} · errores {len(res['errs'])+len(perr)}",flush=True)
            for e in (res['errs']+perr)[:6]:print('   !',e)
            for t in r.get('log',[]):print('   ·',t[:120])
            for s,w in res['miss'].items():out.setdefault(s,[]).extend(w)
            for t in ['pue','equ','con','tra']:
                await pg.evaluate(f"()=>{{try{{hideModal();closeSheet();}}catch(e){{}}if(P.job)showJob('{t}');}}");await pg.wait_for_timeout(500);await pg.screenshot(path=f'{SH}/jb_{LANG}_{k}_{t}.png')
            await pg.close()
        await b.close()
    if LANG!='es':
        json.dump(out,open(f'/tmp/jb_{LANG}.json','w'),ensure_ascii=False,indent=0);print(f'TOTAL {LANG}: {len(out)} textos sin traducir')
        for s,w in list(out.items())[:int(os.environ.get('NES','60'))]:print(' ·',s[:140],' ⟵',w[0])
asyncio.run(main())
