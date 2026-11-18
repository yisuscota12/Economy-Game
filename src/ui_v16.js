/* ===== v1.6: barra de abajo siempre visible, burbujas de ayuda ⓘ y panel de fama ===== */
(function(){const st=document.createElement('style');st.textContent=`
:root{--navh:76px}
.bottom{z-index:40}
body:has(.sheet.on) .bottom{background:var(--bg);padding-top:8px;border-top:1px solid var(--line);box-shadow:0 -6px 18px rgba(0,0,0,.35)}
.sheet{bottom:var(--navh);max-height:calc(86vh - var(--navh));border-radius:16px 16px 0 0}
.sheet:not(.on){transform:translateY(calc(100% + var(--navh) + 30px))}
.modal{z-index:60}#toast{z-index:70}
.nav.on{border-color:var(--gold);background:#2a2412;color:var(--gold)}
.nav,#ageBtn{-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
.ib{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;border:1px solid #4b5d75;color:#9fb3cc;font:700 11px/1 Georgia,serif;font-style:italic;margin-left:6px;vertical-align:middle;cursor:pointer;flex:none;background:#101824;text-transform:none;letter-spacing:0}
.ib:active{background:#f2c14e;color:#1a1405;border-color:#f2c14e}
.item .ib{margin:0 0 0 8px;width:20px;height:20px;font-size:12px}
.kv span.hx,.stat .lab span.hx{text-decoration:underline dotted #5b6f88;text-underline-offset:3px;cursor:help}
.ibrow{display:flex;justify-content:flex-end;margin:-4px 0 4px}.ibrow .ib{margin:0}
#hlp{position:fixed;z-index:95;left:8px;right:8px;max-width:440px;margin:0 auto;background:#101a27;border:1px solid #f2c14e;border-radius:14px;padding:12px 14px 10px;box-shadow:0 12px 40px rgba(0,0,0,.6);display:none;font-size:13.5px;line-height:1.45}
#hlp.on{display:block}#hlp h4{margin:0 0 6px;font-size:15px;color:#f2c14e;padding-right:26px}#hlp .w{margin:0 0 6px}#hlp .g{margin:0;color:#c9d6e6}#hlp .w b,#hlp .g b{color:#e6edf6}
#hlp .x{position:absolute;right:8px;top:6px;border:0;background:transparent;color:#9fb3cc;font-size:20px;padding:2px 6px}
.fbar{height:8px;border-radius:5px;background:#0e141c;overflow:hidden;margin:3px 0 8px}.fbar i{display:block;height:100%;border-radius:5px}
.fterr{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}.fterr div{border:1px solid var(--line);background:var(--card2);border-radius:10px;padding:6px 8px;text-align:center}.fterr b{display:block;font-size:15px}.fterr span{font-size:11px;color:var(--mut)}
.fch{display:inline-block;padding:1px 7px;border-radius:999px;border:1px solid #f2c14e;color:#f2c14e;font-size:11.5px;font-weight:700;margin-left:4px}`;document.head.appendChild(st);})();

/* ----- barra de navegación persistente ----- */
const NAVS={k:null,root:false,click:false};
function navH(){const b=document.querySelector('.bottom');if(b)document.documentElement.style.setProperty('--navh',b.offsetHeight+'px');}
window.addEventListener('resize',navH);setTimeout(navH,50);
function navMark(){document.querySelectorAll('.bottom .nav').forEach(b=>b.classList.toggle('on',sheetIsOpen()&&b.id===NAVS.k));}
document.querySelector('.bottom').addEventListener('click',e=>{const ab=e.target.closest('#ageBtn');if(ab){if(sheetIsOpen())closeSheet();return;}
  const b=e.target.closest('.nav');if(!b)return;if(sheetIsOpen()&&NAVS.k===b.id&&NAVS.root){e.stopImmediatePropagation();e.preventDefault();closeSheet();return;}
  NAVS.k=b.id;NAVS.click=true;setTimeout(()=>{NAVS.click=false;},0);},true);
{const _o=openSheetRaw;openSheetRaw=function(h,bind){_o(h,bind);NAVS.root=NAVS.click;NAVS.click=false;navH();navMark();helpScan();};}
{const _c=closeSheet;closeSheet=function(){_c();navMark();hlpHide();};}

/* ----- burbujas de ayuda ⓘ ----- */
if(CFG.help==null)CFG.help=1;
const HN=t=>(t||'').replace(/ⓘ/g,'').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,'').replace(/\s+/g,' ').trim().replace(/\s*\(\d[^)]*\)$/,'').replace(/\s+\d+$/,'');
function helpFind(t,kv){const s=HN(t);if(!s)return -1;for(let i=0;i<HELP.length;i++){const isKv=HELP[i][0].startsWith('kv:');if(isKv&&!kv)continue;if(HELP_RX[i].test(s)){if(!isKv&&kv&&HELP.some((h,j)=>j>i&&h[0].startsWith('kv:')&&HELP_RX[j].test(s)))continue;return i;}}return -1;}
function hlpEl(){let d=$('hlp');if(!d){d=document.createElement('div');d.id='hlp';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target.closest('.x'))hlpHide();});}return d;}
function hlpHide(){const d=$('hlp');if(d)d.classList.remove('on');}
function hlpShow(i,anchor){const h=HELP[i];if(!h)return;const d=hlpEl();d.innerHTML=`<button class="x" aria-label="Cerrar">×</button><h4>ⓘ ${h[1]}</h4><p class="w"><b>En el mundo real:</b> ${h[2]}</p><p class="g"><b>En el juego:</b> ${h[3]}</p>`;d.classList.add('on');
  const H=window.innerHeight,r=anchor&&anchor.getBoundingClientRect?anchor.getBoundingClientRect():null;const dh=d.offsetHeight;let top=r?(r.bottom+8+dh<H-70?r.bottom+8:Math.max(8,r.top-dh-8)):H*.25;d.style.top=top+'px';}
// toque en ⓘ: se atiende en fase de captura para que no dispare el botón que la contiene
document.addEventListener('click',e=>{const ib=e.target.closest&&e.target.closest('.ib,.hx');if(ib&&ib.dataset.h!=null){e.preventDefault();e.stopPropagation();hlpShow(+ib.dataset.h,ib);return;}
  const d=$('hlp');if(d&&d.classList.contains('on')&&!e.target.closest('#hlp'))hlpHide();},true);
// mantener presionado cualquier pestaña o botón muestra su ayuda
(function(){let tm=null,sx=0,sy=0,fired=false;const sel='.nav,#ageBtn,.vtabs button,.ntabs button,.mkt button,.mmodes button,.item,.seg button,.fterr div';
  document.addEventListener('touchstart',e=>{if(!CFG.help)return;const el=e.target.closest&&e.target.closest(sel);if(!el)return;const t=e.touches[0];sx=t.clientX;sy=t.clientY;fired=false;
    tm=setTimeout(()=>{const txt=el.title||(el.querySelector('.t')||el).textContent;const i=helpFind(txt,false);if(i>=0){fired=true;hlpShow(i,el);if(navigator.vibrate)navigator.vibrate(15);}},520);},{passive:true});
  document.addEventListener('touchmove',e=>{const t=e.touches[0];if(Math.abs(t.clientX-sx)+Math.abs(t.clientY-sy)>10)clearTimeout(tm);},{passive:true});
  document.addEventListener('touchend',e=>{clearTimeout(tm);if(fired){e.preventDefault();fired=false;}},{passive:false});
  document.addEventListener('contextmenu',e=>{const el=e.target.closest&&e.target.closest(sel);if(el&&CFG.help){const i=helpFind(el.title||(el.querySelector('.t')||el).textContent,false);if(i>=0){e.preventDefault();hlpShow(i,el);}}});})();
function ibHTML(i){return `<span class="ib" data-h="${i}" role="button" aria-label="Ayuda">i</span>`;}
function helpDecorate(root){if(!CFG.help||!root)return;
  root.querySelectorAll('h3,.sect').forEach(el=>{if(el.dataset.hx)return;el.dataset.hx=1;const i=helpFind(el.textContent,false);if(i>=0)el.insertAdjacentHTML('beforeend',ibHTML(i));});
  root.querySelectorAll('.item').forEach(el=>{if(el.dataset.hx||el.disabled)return;el.dataset.hx=1;const t=el.querySelector('.t');if(!t)return;const i=helpFind(t.textContent,false);if(i>=0)el.insertAdjacentHTML('beforeend',ibHTML(i));});
  root.querySelectorAll('.kv span,.stat .lab span:first-child').forEach(el=>{if(el.dataset.hx)return;el.dataset.hx=1;const i=helpFind(el.textContent,true);if(i>=0){el.classList.add('hx');el.dataset.h=i;}});
  // filas de pestañas: una ⓘ al final explica la pestaña activa
  root.querySelectorAll('.mkt,.ntabs,.vtabs').forEach(row=>{const on=row.querySelector('button.on');const nx=row.nextElementSibling;const old=nx&&nx.classList.contains('ibrow')?nx:null;
    const i=on?helpFind(on.textContent,false):-1;if(old){if(old.dataset.i==String(i))return;old.remove();}if(i<0)return;const d=document.createElement('div');d.className='ibrow';d.dataset.i=i;d.innerHTML=`<span style="font-size:11px;color:var(--mut);margin-right:6px">Pestaña: ${HELP[i][1]}</span>`+ibHTML(i);row.after(d);});}
let HS=0;function helpScan(){if(HS)return;HS=requestAnimationFrame(()=>{HS=0;helpDecorate($('sheetIn'));helpDecorate($('natView'));helpDecorate($('statsCard'));helpDecorate($('topCard'));const vt=$('viewTabs');if(vt)helpDecorate(vt.parentNode);});}
{const _r=render;render=function(){_r();helpScan();};}
{const _rv=renderView;renderView=function(){_rv();helpScan();};}
(function(){try{const mo=new MutationObserver(()=>helpScan());['sheetIn','natBody','stats'].forEach(id=>{const el=$(id);if(el)mo.observe(el,{childList:true});});}catch(e){}})();
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');const x=document.createElement('button');x.className='item';
  x.innerHTML=`<span><div class="t">Burbujas de ayuda ⓘ: ${CFG.help?'visibles':'ocultas'}</div><div class="s">Explican qué es cada pestaña y opción en el mundo real y para qué sirve en el juego. También puedes mantener presionado cualquier botón.</div></span>`;
  x.onclick=()=>{CFG.help=CFG.help?0:1;saveCfg();if(!CFG.help)document.querySelectorAll('.ib,.ibrow').forEach(e=>e.remove());document.querySelectorAll('[data-hx]').forEach(e=>{delete e.dataset.hx;e.classList.remove('hx');});showSettings();render();};const h3=b.querySelector('h3');if(h3)h3.after(x);};}

/* ----- panel de fama ----- */
const FV={};
function fmtUSD(v){return fmt(toInt(v,'USD'));}
function showFame(){const p=P;const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;if(!p||!p.fc){toast('⭐','Aún no tienes una carrera de fama. Empieza una en Carrera → Fama y espectáculo.');return;}const f=p.fc,C=FC[f.k];const tier=fcTier(f),fama=fcFama(f);const blk=fcCanAct(p);
  const days=t=>{const c=actCost(t);return (c===1?`⏳ ${c} día`:`⏳ ${c} días`);};const can=t=>!blk&&!p.event&&canAfford(t);
  let h=`<h3>${C.ic} ${C.n}<span class="fch">${FTIT[tier]}</span></h3>`;
  h+=`<div class="hint">Fama ${fama}/100<div class="fbar"><i style="width:${fama}%;background:linear-gradient(90deg,#f2c14e,#e88a3a)"></i></div>${fcFull(p)?'Te dedicas de <b>tiempo completo</b>: cada actividad toma la mitad de días.':'Tienes otro trabajo o estudias: cada actividad toma el doble de días que si te dedicaras de tiempo completo.'} Tiempo libre: ${Math.floor(p.ft||0)} días.${blk?`<br><b style="color:var(--red)">${blk}</b>`:''}</div>`;
  h+=`<div class="sect">Fans</div><div class="fterr"><div><b>${fmtK(f.fans.loc)}</b><span>en ${RG[p.r].nm}</span></div><div><b>${fmtK(f.fans.nac)}</b><span>en ${natOf(p).name}</span></div><div><b>${fmtK(f.fans.int)}</b><span>en el mundo</span></div></div>`;
  h+=`<div class="kv">${kv('Nivel',`${f.sk.toFixed(1)}/100`)+kv('Talento natural',`×${f.tal}`)+kv('Imagen',`${Math.round(f.img)}/100`)+kv('Ingreso del año pasado',fmtUSD(f.earnY||0))+kv('Contrato',f.ct?`${f.ct.who.split(' (')[0]} · ${f.ct.yrs-(G.year-f.ct.y)} año(s)`:'Independiente')+kv('Premios',String(f.aw.length))}${C.sp===2?kv('Récord',`${f.rec[0]}-${f.rec[1]} (${f.rec[2]} KO)`)+kv('Ranking mundial','#'+f.rk):''}${C.sp===1?kv('Equipo',fcTeam(p))+kv('Selección',f.sel===G.year?'Convocado':'—'):''}</div>`;
  const it=(code,t,s,ok,lab)=>`<button class="item" data-fa="${code}" ${ok?'':'disabled'}><span><div class="t">${lab||t}</div><div class="s">${s}</div></span></button>`;
  // entrenar
  h+=`<div class="sect">Entrenamiento</div>`+it('tr','⭐ Entrenar',`${days('⭐ Entrenar')} · con ${COACH[f.coach][0].toLowerCase()} · cada vez rinde un poco menos en el año`,can('⭐ Entrenar'),'🏋️ Entrenar');
  if(C.sp===2){h+=`<div class="sect">Peleas</div>`+FIGHT_OPP.map(([nm],o)=>it('fi'+o,'⭐ Pelea',`${days('⭐ Pelea')} · probabilidad de ganar ~${Math.round(fcOdds(p,o)*100)} % · bolsa ×${FIGHT_OPP[o][2]}`,can('⭐ Pelea'),`🥊 Pelear contra ${nm}`)).join('')+
    it('ti','⭐ Pelea por el título',`${days('⭐ Pelea por el título')} · solo top 3 del ranking · bolsa enorme`,can('⭐ Pelea por el título')&&f.rk<=3,'🏆 Pelear por el título mundial');}
  else if(C.sp===1){h+=`<div class="sect">Temporada</div><div class="hint">Juegas cada mes con ${fcTeam(p)} y cobras sueldo cada año. Si tu nivel supera el de tu liga, te fichan equipos más grandes (${FUT_TEAMS.join(' → ')}). Con nivel 72+ en primera división te pueden convocar a la selección.</div>`;}
  else{h+=`<div class="sect">Obras</div>`+C.obra.map((o,i)=>it('wk'+i,i?'⭐ Obra grande':'⭐ Obra',`${days(i?'⭐ Obra grande':'⭐ Obra')}${i?` · producción ${fmt(toInt(BIGC[Math.min(3,tier>>1)],'USD'))} · más alcance`:''}${f.k==='actuacion'||(f.k==='modelo'&&i)?' · depende de que te escojan':''}`,can(i?'⭐ Obra grande':'⭐ Obra'),`🎨 ${o}`)).join('');
    h+=`<div class="sect">Presentaciones</div>`+VEN.map(([nm,minF,,,where],v)=>{const t=['⭐ Show local','⭐ Show nacional','⭐ Show internacional'][v];return it('sh'+v,t,`${days(t)} · requiere ${fmtK(minF)} fans ${where}`,can(t),`🎟️ ${C.show}: ${nm}`);}).join('');}
  h+=`<div class="sect">Redes, marcas e imagen</div>`+it('so0','⭐ Redes',`${days('⭐ Redes')} · seguro, mejora tu imagen`,can('⭐ Redes'),'📱 Publicar en redes')+it('so1','⭐ Redes',`${days('⭐ Redes')} · más alcance, riesgo de escándalo`,can('⭐ Redes'),'🔥 Publicar algo provocador')+
    it('sp','⭐ Patrocinio',`${days('⭐ Patrocinio')} · una vez al año · fama 35+ e imagen 45+`,can('⭐ Patrocinio')&&f.spY!==G.year,'💼 Buscar patrocinio')+it('ch','⭐ Causa',`${days('⭐ Causa')} · dona y recupera imagen`,can('⭐ Causa'),'🤲 Apoyar una causa social');
  if(f.off&&f.off.length)h+=`<div class="sect">Ofertas de contrato</div>`+f.off.map((o,i)=>`<button class="item" data-sg="${i}"><span><div class="t">✍️ ${o.who}</div><div class="s">Anticipo ${fmtUSD(o.adv)} · regalías ${Math.round(o.roy*100)} % · ${o.yrs} años · alcance ×${o.boost}</div></span></button>`).join('')+`<div class="hint">Firmar una oferta descarta las demás.</div>`;
  h+=`<div class="sect">Equipo</div><div class="hint" style="margin-bottom:4px">Entrenador (costo anual y eficacia):</div><div class="seg">${COACH.map(([n,c,e],i)=>`<button data-co="${i}" class="${f.coach===i?'on':''}">${n.split(' (')[0]}<br><small>${c?fmt(c*U(p)):'gratis'} · ×${e}</small></button>`).join('')}</div>
    <div class="hint" style="margin:6px 0 4px">Agente (comisión sobre tus ingresos de fama · alcance):</div><div class="seg">${AGENT.map(([n,c,e],i)=>`<button data-ag="${i}" class="${f.ag===i?'on':''}" ${i&&tier<i?'disabled':''}>${n.replace('Agencia ','Ag. ')}<br><small>${Math.round(c*100)} % · ×${e}</small></button>`).join('')}</div>
    <div class="hint">Las agencias aceptan clientes según su fama: local desde Promesa, nacional desde Figura local, internacional desde Figura nacional. Publicista y abogado: Más → 🧑‍💼 Servicios.</div>`;
  if(f.aw.length)h+=`<div class="sect">Premios</div><div class="hint">${f.aw.slice(-12).reverse().map(a=>`🏆 ${a.y} · ${a.t}`).join('<br>')}</div>`;
  const ws=f.works.slice(-5).reverse();if(ws.length)h+=`<div class="sect">Obras</div><div class="hint">${ws.map(w=>`${w.y} · ${w.t} · calidad ${w.q}${w.hit?' · ⭐ éxito':''}`).join('<br>')}</div>`;
  if(f.sc)h+=`<div class="sect">Escándalos</div><div class="hint">${f.sc} escándalo(s) en tu carrera. Cada uno costó fans e imagen.</div>`;
  h+=`<button class="item" id="fcRet"><span><div class="t">🎬 Retirarte</div><div class="s">Terminas esta carrera; tu fama se irá apagando poco a poco</div></span></button>`;
  openSheetRaw(h,b=>{const go=(t,fn)=>{useAct(fn,t);if(P&&P.fc)showFame();};
    b.querySelectorAll('[data-fa]').forEach(x=>x.onclick=()=>{const c=x.dataset.fa,k=c.slice(0,2),i=+c.slice(2)||0;
      if(k==='tr')go('⭐ Entrenar',()=>fcTrain(P));else if(k==='fi')go('⭐ Pelea',()=>fcFight(P,i));else if(k==='ti')go('⭐ Pelea por el título',()=>fcTitle(P));
      else if(k==='wk')go(i?'⭐ Obra grande':'⭐ Obra',()=>fcWork(P,i));else if(k==='sh')go(['⭐ Show local','⭐ Show nacional','⭐ Show internacional'][i],()=>fcShow(P,i));
      else if(k==='so')go('⭐ Redes',()=>fcSocial(P,i===1));else if(k==='sp')go('⭐ Patrocinio',()=>fcSponsor(P));else if(k==='ch')go('⭐ Causa',()=>fcCharity(P));});
    b.querySelectorAll('[data-sg]').forEach(x=>x.onclick=()=>{const r=fcSign(P,+x.dataset.sg);log(r,'good');toast('✍️',r);save();render();showFame();});
    b.querySelectorAll('[data-co]').forEach(x=>x.onclick=()=>{P.fc.coach=+x.dataset.co;save();showFame();});
    b.querySelectorAll('[data-ag]').forEach(x=>x.onclick=()=>{P.fc.ag=+x.dataset.ag;save();showFame();});
    const rt=b.querySelector('#fcRet');if(rt)rt.onclick=()=>askText(`¿Retirarte de ${C.n.toLowerCase()}?`,null,()=>{const r=fcRetire(P);log(r);save();render();closeSheet();},'Retirarme');});}
// accesos: Más y el registro
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();if(!P||!P.fc)return;const b=$('sheetIn');const first=b.querySelector('.item');const x=document.createElement('button');x.className='item';
  x.innerHTML=`<span><div class="t">⭐ Tu carrera: ${FC[P.fc.k].n}</div><div class="s">${FTIT[fcTier(P.fc)]} · ${fmtK(fcFans(P.fc))} fans · nivel ${Math.round(P.fc.sk)}</div></span>`;x.onclick=()=>showFame();if(first)b.insertBefore(x,first);else b.append(x);};})();
GUIA.splice(7,0,['⭐ Carreras de fama',`<b>Cómo empezar:</b> Carrera → Fama y espectáculo. Hay 11 carreras: música, actuación, fútbol, box, MMA, creador de contenido, modelaje, comedia, escritura, cocina y DJ. Cada una usa un atributo clave (apariencia, salud o inteligencia).
<ul><li><b>Fans por territorio:</b> primero tu provincia, luego tu país y al final el mundo. Cada nivel tiene un techo (su población) y sin actividad los fans se van.</li>
<li><b>Nivel y talento:</b> entrenar sube tu nivel; el talento natural (×0.7 a ×1.35) lo multiplica. Los primeros puntos son rápidos y los últimos muy lentos.</li>
<li><b>Equipo:</b> entrenador gratis, regular, profesional o de élite (calidad-precio) y agente local, nacional o internacional (comisión de 10–20 %).</li>
<li><b>Contratos:</b> llegan ofertas cada año según tu fama: anticipo, regalías, duración y alcance. Los escándalos pueden cancelarlos.</li>
<li><b>Escándalos con causa:</b> publicaciones provocadoras, declaraciones, cancelar por agotamiento o plagio. El publicista (Servicios) reduce el daño; las causas sociales recuperan tu imagen.</li>
<li><b>Premios y torneos:</b> Gramófono de Oro, Estatuilla Dorada, Pluma de Oro, Balón Dorado, cinturones mundiales, campeonatos de liga y la selección nacional.</li>
<li><b>Tiempo completo:</b> sin otro empleo ni escuela, cada actividad de fama toma la mitad de días.</li></ul>`]);
GUIA.splice(0,0,['ⓘ Burbujas de ayuda y barra de abajo',`La barra de abajo (Acciones, Carrera, avanzar, Nación, Más) está <b>siempre visible</b>, aunque tengas una pantalla abierta: el botón iluminado indica en qué sección estás; tócalo otra vez para cerrar.
Toca cualquier <b>ⓘ</b> o una etiqueta <u style="text-decoration-style:dotted">subrayada</u> para ver qué es en el mundo real y para qué sirve en el juego. También puedes <b>mantener presionado</b> cualquier pestaña o botón. Puedes ocultarlas en Ajustes.`]);
