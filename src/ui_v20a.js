/* ===================== v2.0a: fase 3 de la ruta 9d, parte 1 — niveles y modo Fácil =====================
   - Un solo selector al crear la partida: 🌱 Fácil (Rápido + dificultad Fácil), ⚖️ Medio (Rápido + Medio) y 🎓 Realista (Realista + Medio).
     Cualquier otra combinación es «Personalizado»; los dos selectores de antes quedan en «⚙️ Más opciones».
   - El nivel NO se guarda: se deduce de G.mode y G.dif (lvlOf). Así las partidas viejas quedan clasificadas solas y un cambio de dificultad
     en Ajustes cambia el nivel sin migraciones.
   - Modo Fácil (G.ez): menú Más con las opciones avanzadas que se abren con el avance (o «Mostrar todo»), una explicación la primera vez
     que abres cada pantalla (con un «¿Sabías que…?» del tema), «Te conviene: …» con el siguiente paso, resumen del año con causa y efecto,
     avisos antes de pérdidas grandes en bancos y glosario con términos subrayados en las pantallas de dinero y del país.
   - 📖 Glosario en Más para todos los niveles. */

const LVLS={f:{ic:'🌱',n:'Fácil',mode:'rapido',dif:'f',d:'Para quien no conoce el juego ni cómo funciona la economía: reglas simples y más margen; las opciones avanzadas se abren poco a poco y cada pantalla se explica la primera vez. Una vida: 10–15 min.'},
 m:{ic:'⚖️',n:'Medio',mode:'rapido',dif:'m',d:'Calibrado con datos reales y con reglas simples: sueldo y gastos automáticos, guerras de una batalla al año, todo a la vista. Una vida: 10–15 min.'},
 r:{ic:'🎓',n:'Realista',mode:'realista',dif:'m',d:'Todas las mecánicas: impuestos, inflación, préstamos, guerras mes a mes, enfermedades, congreso y juicios. Una vida: 30–60 min.'}};
function lvlFrom(mode,dif){for(const k in LVLS){const L=LVLS[k];if(L.mode===mode&&L.dif===(dif||'m'))return k;}return 'p';}
function lvlOf(g){g=g||G;if(!g)return 'm';return lvlFrom(g.mode,g.dif||'m');}
function lvlName(g){const k=lvlOf(g);return k==='p'?'Personalizado':LVLS[k].n;}
function ezOn(){return !!(G&&P&&lvlOf()==='f');}
function ezEnsure(){if(!G)return null;if(!G.ez)G.ez={all:0,tips:1,next:1,seen:{},tx:{},ulk:null,bw:{},sb:0};const z=G.ez;z.seen=z.seen||{};z.tx=z.tx||{};z.bw=z.bw||{};return z;}
const V20={cur:null,ffy:0};

/* ---------- 1) pantalla de inicio: nivel ---------- */
{const _st=showStart;showStart=function(f,k){_st(f,k);try{v20Start();}catch(e){console.warn('v20 inicio',e);}};}
function v20Start(){const m=$('modal');if(!m||!m.classList.contains('on'))return;const go=m.querySelector('#sGo');if(!go||m.querySelector('#v20lv'))return;
  const mb=[...m.querySelectorAll('.mode[data-m]')],db=[...m.querySelectorAll('.mode.df')];if(!db.length)return;
  const fixed=mb.length?null:(G&&G.mode)||'rapido';
  const S={mode:fixed||(mb.find(b=>b.classList.contains('on'))||mb[0]).dataset.m,dif:(db.find(b=>b.classList.contains('on'))||db[1]||db[0]).dataset.d};
  const sectOf=el=>{let p=el&&el.previousElementSibling;return p&&p.classList.contains('sect')?p:null;};
  const modesBox=mb.length?mb[0].parentNode:null,difsBox=db[0].parentNode;
  const box=document.createElement('div');box.id='v20lv';
  box.innerHTML=`<div class="sect">Nivel</div><div class="modes lvls">${Object.entries(LVLS).map(([k,L])=>`<button class="lv" data-lv="${k}"${fixed&&L.mode!==fixed?' disabled':''}><b>${L.ic} ${L.n}</b><span>${L.d}</span></button>`).join('')}</div>
   <div class="hint" id="v20pz" style="display:none"></div>
   <details class="v20mo" id="v20mo"><summary>⚙️ Más opciones (personalizado)</summary><div class="v20moi"></div></details>`;
  const anchor=modesBox?(sectOf(modesBox)||modesBox):(m.querySelector('.hint')||m.querySelector('.gms'));
  if(anchor)anchor.parentNode.insertBefore(box,anchor);else go.parentNode.insertBefore(box,go);
  const inner=box.querySelector('.v20moi');
  if(modesBox){const s=sectOf(modesBox),h=modesBox.nextElementSibling&&modesBox.nextElementSibling.classList.contains('hint')?modesBox.nextElementSibling:null;if(s)inner.appendChild(s);inner.appendChild(modesBox);if(h)inner.appendChild(h);}
  {const s=sectOf(difsBox);if(s)inner.appendChild(s);inner.appendChild(difsBox);}
  const paint=()=>{mb.forEach(b=>b.classList.toggle('on',b.dataset.m===S.mode));db.forEach(b=>b.classList.toggle('on',b.dataset.d===S.dif));const lv=lvlFrom(S.mode,S.dif);
    box.querySelectorAll('.lv').forEach(b=>b.classList.toggle('on',b.dataset.lv===lv));const pz=box.querySelector('#v20pz');
    if(lv==='p'){pz.style.display='';pz.innerHTML=`<b>Personalizado</b> · <span>${MODES[S.mode]}</span> · <span>${DIFS[S.dif].ic} ${DIFS[S.dif].n}</span>`;}else pz.style.display='none';V20.lv=lv;};
  mb.forEach(b=>b.addEventListener('click',()=>{S.mode=b.dataset.m;setTimeout(paint,0);}));
  db.forEach(b=>b.addEventListener('click',()=>{S.dif=b.dataset.d;setTimeout(paint,0);}));
  const pickLv=k=>{const L=LVLS[k];if(!L||(fixed&&L.mode!==fixed))return;const a=mb.find(b=>b.dataset.m===L.mode);if(a)a.click();const d=db.find(b=>b.dataset.d===L.dif);if(d)d.click();S.mode=fixed||L.mode;S.dif=L.dif;paint();};
  box.querySelectorAll('.lv').forEach(b=>b.onclick=()=>pickLv(b.dataset.lv));
  let k0=CFG.lastLvl||(CFG.lastDif?lvlFrom('rapido',CFG.lastDif):'f');if(fixed&&k0!=='p'&&LVLS[k0]&&LVLS[k0].mode!==fixed)k0=fixed==='realista'?'r':'f';
  if(k0==='p'){const lm=CFG.lastMode||'rapido';const a=mb.find(b=>b.dataset.m===lm);if(a){a.click();S.mode=lm;}const d=db.find(b=>b.dataset.d===(CFG.lastDif||'m'));if(d){d.click();S.dif=d.dataset.d;}paint();box.querySelector('#v20mo').open=true;}
  else pickLv(k0);
  const prev=go.onclick;go.onclick=async ev=>{await prev(ev);try{if(!G||!P)return;const lv=lvlOf();CFG.lastLvl=lv;CFG.lastMode=G.mode;saveCfg();if(lv==='f'){const z=ezEnsure();z.ulk=ezUnlocked();z.nw=netWorth(P);}save();render();}catch(e){console.warn('v20 go',e);}};}

/* ---------- 2) Ajustes: nivel, ayudas del modo Fácil y más opciones ---------- */
{const _ss=showSettings;showSettings=function(){_ss();try{v20Settings();}catch(e){console.warn('v20 ajustes',e);}};}
function v20Settings(){const b=$('sheetIn');if(!b||!G||!P)return;const sect=[...b.querySelectorAll('.sect')].find(s=>/^🎯 Dificultad de esta partida/.test(s.textContent));if(!sect)return;
  const seg=sect.nextElementSibling,hint=seg&&seg.nextElementSibling&&seg.nextElementSibling.classList.contains('hint')?seg.nextElementSibling:null;
  const lv=lvlOf(),L=LVLS[lv],z=lv==='f'?ezEnsure():null;const box=document.createElement('div');box.id='v20cf';
  const yn=v=>v?'Sí':'No';
  box.innerHTML=`<div class="sect">🎯 Nivel de esta partida</div>
   <div class="v20lvc"><b>${L?L.ic+' '+L.n:'⚙️ Personalizado'}</b>${L?`<span>${L.d}</span>`:`<span><span>${MODES[G.mode]}</span> · <span>${DIFS[G.dif||'m'].ic} ${DIFS[G.dif||'m'].n}</span></span>`}</div>
   ${z?`<button class="item" data-ez="all"><span><div class="t">👀 Mostrar todas las opciones</div><div class="s"><span>${yn(z.all)}</span> · <span>${z.all?'Todo el menú Más está a la vista.':'Las opciones avanzadas se abren con tu avance.'}</span></div></span></button>
   <button class="item" data-ez="tips"><span><div class="t">💡 Explicaciones de primera vez</div><div class="s"><span>${yn(z.tips)}</span> · <span>Una tarjeta corta la primera vez que abres cada pantalla.</span></div></span></button>
   <button class="item" data-ez="next"><span><div class="t">🧭 Sugerencia del siguiente paso</div><div class="s"><span>${yn(z.next)}</span> · <span>«Te conviene: …» arriba del mapa.</span></div></span></button>
   <button class="item" data-ez="rs"><span><div class="t">↺ Volver a ver las explicaciones</div><div class="s">Las tarjetas de primera vez aparecen otra vez.</div></span></button>`:''}
   <details class="v20mo"${lv==='p'?' open':''}><summary>⚙️ Más opciones (personalizado)</summary><div class="v20moi"><div class="hint">El modo (Rápido o Realista) se elige al crear la partida y no cambia a mitad; la dificultad sí.</div></div></details>`;
  sect.parentNode.insertBefore(box,sect);const inner=box.querySelector('.v20moi');inner.appendChild(sect);if(seg)inner.appendChild(seg);if(hint)inner.appendChild(hint);
  if(seg)seg.querySelectorAll('[data-df]').forEach(x=>x.addEventListener('click',()=>{try{if(lvlOf()==='f'){const z=ezEnsure();if(!z.ulk)z.ulk=ezUnlocked();}render();}catch(e){}}));
  box.querySelectorAll('[data-ez]').forEach(x=>x.onclick=()=>{const k=x.dataset.ez;if(k==='rs'){z.seen={};toast('💡','Las explicaciones de primera vez aparecerán otra vez.');}else{z[k]=z[k]?0:1;if(k==='all'&&!z.all)z.ulk=ezUnlocked();}save();render();showSettings();});}

/* ---------- 3) menú Más: opciones que se abren con el avance ---------- */
const EZ_LOCK=[
 ['bk',/^🏦 Bancos y fondos/,p=>p.age>=18||accValue(p)>0||!!p.bank,'a los 18 años'],
 ['biz',/^🏪 Mis empresas/,p=>p.age>=18||bzList(p).length>0,'a los 18 años'],
 ['bn',/^💼 Bienes y negocios/,p=>p.age>=18,'a los 18 años'],
 ['mk',/^📈 Bolsa de valores/,p=>(p.age>=18&&p.dinero+accValue(p)>=U(p))||ezHasPos(p),'a los 18 años, con ahorros de un año de salario medio'],
 ['fx',/^💱 Monedas/,p=>(p.age>=18&&p.dinero+accValue(p)>=U(p))||ezHasPos(p),'a los 18 años, con ahorros de un año de salario medio'],
 ['svc',/^🧑‍💼 Servicios/,p=>netWorth(p)>=5*U(p)||(p.svc&&Object.keys(p.svc).length>0),'con un patrimonio de 5 años de salario medio'],
 ['din',/^👑 Dinastía y herencia/,p=>p.age>=30||(p.children||[]).length>0,'a los 30 años o al tener hijos'],
 ['ord',/^🎯 Órdenes rápidas/,p=>!!p.ruler||(p.career&&p.career.track==='militar'),'al gobernar o entrar al ejército'],
 ['spd',/^⏱ Prueba de velocidad/,p=>false,'herramienta técnica: está en «Mostrar todo»']];
function ezHasPos(p){return !!((p.bk&&p.bk.pos&&Object.keys(p.bk.pos).length)||(p.mf&&Object.keys(p.mf).length));}
function ezUnlocked(){const o={};if(!P)return o;for(const [k,,f] of EZ_LOCK){try{o[k]=f(P)?1:0;}catch(e){o[k]=1;}}return o;}
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();try{v20More();}catch(e){console.warn('v20 más',e);}};})();
function v20More(){const b=$('sheetIn');if(!b||!P)return;
  const gx=document.createElement('button');gx.className='item';gx.id='v20gl';gx.innerHTML=`<span><div class="t">📖 Glosario</div><div class="s">${GLOS.length} términos de economía y finanzas, explicados</div></span>`;gx.onclick=showGlossary;
  const guia=[...b.querySelectorAll('.item')].find(x=>/^📘/.test((x.querySelector('.t')||x).textContent));if(guia)guia.after(gx);else b.appendChild(gx);
  if(!ezOn()||ezEnsure().all)return;const U0=ezUnlocked(),hid=[];
  b.querySelectorAll('.item').forEach(x=>{const t=((x.querySelector('.t')||x).textContent||'').trim();const e=EZ_LOCK.find(l=>l[1].test(t));if(e&&!U0[e[0]]){x.style.display='none';x.dataset.ezl=e[0];hid.push([t.replace(/:.*$/,''),e[3]]);}});
  if(!hid.length)return;const lk=document.createElement('button');lk.className='item ezlk';lk.id='v20lk';
  lk.innerHTML=`<span><div class="t">🔒 <span>Se abren más adelante</span> (${hid.length})</div><div class="s">${hid.map(([n,c])=>`<div><span>${n}</span>: <span>${c}</span></div>`).join('')}<div class="ezall">Toca para mostrar todo ahora</div></div></span>`;
  lk.onclick=()=>{ezEnsure().all=1;save();toast('👀 Mostrar todo','Todas las opciones del menú Más están a la vista. Puedes volver a ocultarlas en Ajustes.');$('nMore').click();};
  const cfg=[...b.querySelectorAll('.item')].find(x=>/^⚙/.test((x.querySelector('.t')||x).textContent));if(cfg)cfg.before(lk);else b.appendChild(lk);}

/* ---------- 4) tarjeta de primera vez (con «¿Sabías que…?» del tema) ---------- */
const EZ_SCR=[
 ['bk',/^🏦 Bancos y fondos/,'fin','Guardar dinero en un banco lo protege y le paga intereses (la tasa de depósito). Los bancos chicos pagan más porque quiebran más seguido; si uno quiebra, el seguro de depósitos de tu país te devuelve hasta un tope por banco. Aquí también pides créditos: el interés depende de tu historial crediticio.'],
 ['mk',/^📈 Bolsa de valores/,'fin','Una acción es una pequeña parte de una empresa. Si a la empresa le va bien, el precio sube y algunas reparten dividendos; si le va mal, puedes perder. Comprar empresas de sectores distintos (diversificar) reduce el daño de que una sola caiga.'],
 ['biz',/^🏪 Mis empresas/,'eco','Una empresa vende cada mes y paga insumos, sueldos, renta, impuestos y deudas; lo que queda es la utilidad, y lo que reparte llega a tu dinero. Empezar chico y reinvertir es más seguro que endeudarse para crecer rápido.'],
 ['svc',/^🧑‍💼 Servicios/,'eco','Servicios que pagas cada mes: protección, salud, ayuda en casa. Mejoran tu vida o bajan riesgos (por ejemplo, el de secuestro cuando tienes mucho dinero), pero son un gasto fijo: contrátalos cuando tu ingreso los aguante.'],
 ['fin',/^Finanzas/,'fin','Tu dinero del año: ingreso bruto menos gastos de vida (y, en Realista, impuestos y pagos de préstamos) da tu neto. Si el neto es negativo, gastas más de lo que ganas y tus ahorros bajan.'],
 ['act',/^Acciones/,'pob','Aquí decides en qué usas tu tiempo. Cada actividad cuesta tiempo o dinero y mueve tus estadísticas: estudiar sube la inteligencia; el gimnasio, la salud; la familia, la felicidad. Esas estadísticas deciden qué puertas se abren después.'],
 ['car',/^Carrera/,'eco','Tu forma de ganarte la vida. Un empleo da sueldo desde ya; la universidad cuesta años, pero abre empleos mejor pagados; las carreras hacia el poder (política, ejército, negocios) llevan a gobernar. Los sueldos salen del salario medio real de tu país.'],
 ['bn',/^Bienes y negocios/,'eco','Lo que tienes: casa, autos y otros bienes. Tu patrimonio es todo lo que posees (efectivo, cuentas, inversiones y bienes) menos lo que debes.'],
 ['ppl',/^Personas/,'pob','Tus relaciones: familia, pareja, amigos y contactos. Se enfrían si no les dedicas tiempo; los contactos te abren empleos y negocios.'],
 ['amb',/^Ambición y logros/,'pob','Tu ambición es la meta que elegiste para esta vida: aquí ves cuánto te falta y los logros que ya conseguiste.'],
 ['pais',/^<img class="flag"/,'geo','Cada país con datos reales de 2026: población, economía, ejército y relaciones con otros países. Lo que pase en el tuyo (guerras, crisis, sueldos) también te afecta a ti.']];
function ezScr(h){const i=h.indexOf('<h3');if(i<0||i>400)return null;const j=h.indexOf('>',i);const t=h.slice(j+1,j+200);return EZ_SCR.find(e=>e[1].test(t))||null;}
function ezSabias(th){if(typeof SABIAS==='undefined')return null;const L=SABIAS.map((f,i)=>[f,i]).filter(x=>x[0][2]===th);if(!L.length)return null;const z=ezEnsure();z.sb=(z.sb||0)+1;return L[z.sb%L.length][0];}
{const _or=openSheetRaw;openSheetRaw=function(h,bd){let card=null;try{if(ezOn()&&typeof h==='string'){const z=ezEnsure();const e=ezScr(h);
      if(e&&z.tips&&(!z.seen[e[0]]||V20.cur===e[0])){z.seen[e[0]]=1;V20.cur=e[0];const f=ezSabias(e[2]);
        card=`<div class="ezc" id="ezc"><div class="ezh"><span>🌱 Primera vez aquí</span><button class="ezx" data-ezok aria-label="Entendido">✕</button></div><p>${e[3]}</p>${f?`<div class="ezsb"><span>💡 </span><span>¿Sabías que…?</span> <span>${f[0]}</span> <small><span>Fuente:</span> <span>${f[1]}</span></small></div>`:''}<button class="btn" data-ezok>Entendido</button></div>`;
        const k=h.indexOf('</h3>');h=k>=0?h.slice(0,k+5)+card+h.slice(k+5):card+h;}else if(!e||V20.cur!==e[0])V20.cur=null;}}catch(x){console.warn('v20 tarjeta',x);}
    const r=_or(h,bd);
    if(card){const b=$('sheetIn');b.querySelectorAll('[data-ezok]').forEach(x=>x.onclick=ev=>{ev.stopPropagation();V20.cur=null;const c=$('ezc');if(c)c.remove();save();});}
    if(ezOn())setTimeout(()=>{try{glsMark($('sheetIn'),h);}catch(x){}},40);
    return r;};}
{const _cs=closeSheet;closeSheet=function(){V20.cur=null;return _cs();};}

/* ---------- 5) «Te conviene: …» (siguiente paso) ---------- */
const EZ_TIPS=[
 ['salud',p=>p.age>=2&&p.s.salud<40,'🩺 Tu salud está baja: ve al médico o al gimnasio.','act'],
 ['feliz',p=>p.age>=6&&p.s.felicidad<35,'🌴 Tu felicidad está baja: pasa tiempo con tu familia o toma vacaciones.','act'],
 ['estudia',p=>p.age>=6&&p.age<18&&p.s.inteligencia<70,'📚 Estudia: la inteligencia sube tus calificaciones y abre mejores carreras.','act'],
 ['empleo',p=>p.age>=18&&!p.job&&!(p.career&&p.career.track)&&!(p.edu&&p.edu.uni)&&!p.prison&&!p.ruler&&!p.fc,'💼 Busca empleo o entra a la universidad: es tu primera fuente de ingresos.','car'],
 ['gasto',p=>p.age>=18&&!!p.job&&grossIncome(p)<livingCost(p),'📉 Gastas más de lo que ganas: busca un empleo mejor pagado o prepárate más.','car'],
 ['cuenta',p=>p.age>=18&&p.dinero>=1.5*U(p)&&accValue(p)<=0,'🏦 Tienes efectivo sin rendir: en una cuenta de banco gana intereses.','bk'],
 ['divers',p=>p.age>=18&&accValue(p)+p.dinero>=4*U(p)&&!ezHasPos(p),'📈 Diversifica: pon una parte de tus ahorros en un fondo de inversión.','mf'],
 ['empresa',p=>p.age>=22&&netWorth(p)>=8*U(p)&&!bzList(p).length,'🏪 Ya podrías emprender: una empresa puede darte más que un sueldo.','biz']];
function ezTip(){if(!ezOn())return null;const z=ezEnsure();if(!z.next||!P.alive||P.ruler)return null;for(const t of EZ_TIPS){if(z.tx[t[0]]===G.year)continue;try{if(t[1](P))return t;}catch(e){}}return null;}
function ezGo(k){if(k==='act')$('nAct').click();else if(k==='car')$('nCar').click();else if(k==='bk')showBanks('acc');else if(k==='mf')showBanks('mf');else if(k==='biz')showBiz();}
function ezTipPaint(){let el=$('ezTip');const t=ezTip();const tc=$('topCard');if(!t){if(el)el.style.display='none';return;}
  if(!el){if(!tc)return;el=document.createElement('div');el.id='ezTip';tc.after(el);}
  if(el.dataset.k!==t[0]){el.dataset.k=t[0];el.innerHTML=`<button class="ezgo"><span class="ezl">Te conviene:</span> <span>${t[2]}</span></button><button class="ezx" aria-label="Ahora no">✕</button>`;
    el.querySelector('.ezgo').onclick=()=>ezGo(t[3]);el.querySelector('.ezx').onclick=()=>{ezEnsure().tx[t[0]]=G.year;save();ezTipPaint();};}
  el.style.display='';}
{const _r=render;render=function(...a){const r=_r(...a);try{if(G&&P){const pm=$('pMode');const k=lvlOf();if(pm)pm.textContent=k==='p'?'⚙️ Personalizado':LVLS[k].ic+' '+LVLS[k].n;}ezTipPaint();}catch(e){}return r;};}

/* ---------- 6) cada año en Fácil: resumen con causa y efecto, opciones nuevas, avisos y «¿Sabías que…?» ---------- */
{const _au=ageUp;ageUp=function(){const p=P;const on=ezOn();let z=null,nw0=0,inc=0,liv=0;
  if(on&&p&&p.alive&&!p.event){z=ezEnsure();try{nw0=z.nw!=null?z.nw:netWorth(p);inc=grossIncome(p);liv=livingCost(p);}catch(e){}}
  _au();
  if(!z||p!==P||!p.alive)return;
  try{const nw1=netWorth(p);z.nw=nw1;const quiet=typeof FF_ON!=='undefined'&&FF_ON;
    if(!quiet&&p.age>=19){log(`📘 Tu año en números: ingresos de ${fmt(inc)} y gastos de vida de ${fmt(liv)}; tu patrimonio pasó de ${fmt(nw0)} a ${fmt(nw1)}.`,'news');
      const d=nw1-nw0,net=inc-liv,u=U(p);
      if(inc>0&&net<0)log('📘 Gastaste más de lo que ganaste: tus ahorros cubrieron la diferencia.','news');
      else if(d>Math.max(net,0)*1.5+.2*u)log('📘 Tu patrimonio creció más que tu sueldo neto: tus cuentas, inversiones o empresas también te dieron dinero.','news');
      else if(d<Math.min(net,0)-.2*u)log('📘 Tu patrimonio bajó más que por tus gastos: alguna inversión, empresa o compra perdió valor.','news');}
    if(!z.all){const U1=ezUnlocked(),U0=z.ulk||{};for(const [k] of EZ_LOCK){if(U1[k]&&!U0[k]&&k!=='spd'){const nm=EZ_NM[k];if(nm){log(`🔓 Se abre en Más: ${nm}`,'good');if(!quiet)toast('🔓 Nueva opción en Más',nm);}}}z.ulk=U1;}
    ezBankWarn(p,quiet);
    if(!quiet&&p.age>=8&&p.age%2===0&&typeof SABIAS!=='undefined'){const th=['eco','fin','pob','com','nat','geo'][(p.age/2)%6];const f=ezSabias(th);if(f)log(`💡 ¿Sabías que…? ${f[0]} (Fuente: ${f[1]})`,'news');}
  }catch(e){console.warn('v20 año',e);}};}
const EZ_NM={bk:'🏦 Bancos y fondos',biz:'🏪 Mis empresas',bn:'💼 Bienes y negocios',mk:'📈 Bolsa de valores',fx:'💱 Monedas',svc:'🧑‍💼 Servicios',din:'👑 Dinastía y herencia',ord:'🎯 Órdenes rápidas'};
function ezBankWarn(p,quiet){const acc=p.acc;if(!acc)return;const z=ezEnsure();const u=U(p);const di=bnkEnsure(natOf(p)).di;const cap=di?25*u:0;
  for(const id in acc){if(id==='P:own')continue;const b=bkInfo(id);if(!b)continue;const T=BTIER[b.t];const n=G.nations[b.n];const risk=T.fail*(bnkEnsure(n).cr>0?25:1)*(bankHealth(b)<30?3:1);
    const un=acc[id]-cap;if(un<=.5*u||risk<.004){continue;}const last=z.bw[id]||0;if(last&&Math.abs(acc[id]-last)<.2*last)continue;z.bw[id]=acc[id];
    const msg=di?`⚠️ Tienes ${fmt(acc[id])} en ${b.nm}: el seguro de depósitos cubre hasta ${fmt(cap)} por banco. Si ese banco quiebra, puedes perder la diferencia; repartir tu dinero en varios bancos reduce el riesgo.`
      :`⚠️ Tienes ${fmt(acc[id])} en ${b.nm} y tu país no tiene seguro de depósitos: si el banco quiebra, puedes perderlo todo. Repartir tu dinero en varios bancos grandes reduce el riesgo.`;
    log(msg,'bad');if(!quiet)toast('⚠️ Riesgo en tu banco','Revisa el aviso en tu historial.');}}

/* ---------- 7) glosario ---------- */
const GLOS=[
 ['Inflación','Subida general de los precios en un año. Con 5 % de inflación, lo que costaba $100 cuesta $105: si tu sueldo no sube igual, puedes comprar menos.',['inflación']],
 ['PIB','Producto interno bruto: el valor de todo lo que un país produce en un año. Mide el tamaño de su economía.',['PIB']],
 ['PIB por persona','El PIB dividido entre los habitantes. Sirve para comparar qué tan rico es, en promedio, cada país.',['PIB por persona']],
 ['Salario medio','El sueldo anual típico de un trabajador del país. El juego lo usa como base de sueldos y precios.',['salario medio']],
 ['Tasa de interés','El precio del dinero en el tiempo, en % al año: lo que te paga el banco por guardar tu dinero o lo que te cobra por prestártelo.',['tasa de interés','tasas']],
 ['Seguro de depósitos','Garantía del gobierno: si tu banco quiebra, te devuelve tus depósitos hasta un tope por banco. Lo que pase del tope se puede perder.',['seguro de depósitos']],
 ['Acción (bolsa)','Una pequeña parte de una empresa que se compra y vende en la bolsa. Su precio sube o baja según lo que se espera de la empresa.',['acción','acciones']],
 ['Dividendo','La parte de las ganancias que una empresa reparte entre quienes tienen sus acciones.',['dividendo','dividendos']],
 ['Diversificar','Repartir tu dinero entre varias inversiones distintas para que la caída de una sola no te afecte demasiado.',['diversificar']],
 ['Utilidad','Lo que queda de las ventas después de pagar todos los costos. Si es negativa, la empresa pierde dinero.',['utilidad']],
 ['Patrimonio','Todo lo que tienes (efectivo, cuentas, inversiones y bienes) menos todo lo que debes.',['patrimonio']],
 ['Historial crediticio','Calificación de qué tan buen pagador eres. Con un buen historial te prestan más y con menos interés.',['historial crediticio']],
 ['Impuestos','Lo que pagas al gobierno sobre tus ingresos y compras. Con eso se pagan escuelas, hospitales, ejército y obras.',['impuestos']],
 ['Quiebra','Cuando una empresa o un banco no puede pagar lo que debe y cierra o es intervenido.',['quiebra','quiebran']]];
function showGlossary(){let h=`<h3>📖 Glosario</h3><div class="hint">Términos de economía y finanzas que usa el juego. En el modo Fácil aparecen subrayados en las pantallas de dinero y del país: tócalos para ver qué significan.</div><div class="glsl">`;
  GLOS.forEach(([t,d])=>{h+=`<div class="glsi"><b>${t}</b><p>${d}</p></div>`;});openSheet(h+'</div>');}
const GLS_SCR=/^(🏦 Bancos y fondos|📈 Bolsa de valores|🏪 Mis empresas|🧑‍💼 Servicios|Finanzas|Bienes y negocios|<img class="flag")/;
function glsTerms(){if(V20.gt&&V20.gtl===LANG)return V20.gt;const tr=s=>{try{return (typeof I18!=='undefined'&&I18)?I18.T(s):s;}catch(e){return s;}};const L=[];
  GLOS.forEach(([t],i)=>{const vs=(typeof LANG==='undefined'||LANG==='es')?GLOS[i][2]:[tr(t).replace(/\s*[(（][^)）]*[)）]\s*$/,'')];vs.forEach(v=>{if(v&&v.length>=2)L.push([v,i]);});});L.sort((a,b)=>b[0].length-a[0].length);V20.gt=L;V20.gtl=typeof LANG==='undefined'?'es':LANG;return L;}
function glsMark(root,h){if(!root||!ezOn())return;const i=h.indexOf('<h3');const j=h.indexOf('>',i);if(i<0||!GLS_SCR.test(h.slice(j+1,j+200)))return;if(root.querySelector('.gls'))return;
  const terms=glsTerms(),used=new Set();const cjk=typeof LANG!=='undefined'&&/^(zh|ja|ko)$/.test(LANG);
  const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const e=n.parentElement;if(!e||e.closest('button,a,input,select,textarea,h3,.ib,.gls,.ezc,label,summary'))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim().length>3?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[];let n;while((n=W.nextNode())&&nodes.length<400)nodes.push(n);let cnt=0;
  for(const nd of nodes){if(cnt>=5)break;const tx=nd.nodeValue,lo=tx.toLocaleLowerCase();
    for(const [v,gi] of terms){if(used.has(gi))continue;const vl=v.toLocaleLowerCase();let k=lo.indexOf(vl);
      while(k>=0&&!cjk){const a=k?lo[k-1]:' ',b=lo[k+vl.length]||' ';if(!/[\p{L}\p{N}]/u.test(a)&&!/[\p{L}\p{N}]/u.test(b))break;k=lo.indexOf(vl,k+1);}
      if(k<0)continue;used.add(gi);cnt++;const sp=document.createElement('span');sp.className='gls';sp.dataset.g=gi;sp.setAttribute('data-noi18n','');sp.setAttribute('role','button');sp.textContent=tx.slice(k,k+v.length);
      const rest=nd.splitText(k);rest.nodeValue=rest.nodeValue.slice(v.length);rest.parentNode.insertBefore(sp,rest);
      sp.onclick=ev=>{ev.stopPropagation();const g=GLOS[+sp.dataset.g];toast('📖 '+g[0],g[1]);};break;}}}

/* ---------- 8) ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Nivel','🎯 Niveles','Aprender por niveles (andamiaje) es como se enseña casi todo: primero lo esencial con apoyo, después más variables y menos ayuda. Así se entiende cada pieza antes de juntarlas.','🌱 Fácil: reglas simples, más margen y ayudas; las opciones avanzadas se abren con tu avance. ⚖️ Medio: datos reales con reglas simples. 🎓 Realista: todas las mecánicas. En «Más opciones» puedes combinar modo y dificultad a tu gusto.'],
 ['Glosario','📖 Glosario','Entender unas pocas palabras (inflación, interés, patrimonio) basta para seguir la mayoría de las noticias de economía y tomar mejores decisiones con tu dinero.','Cada término trae una definición corta y precisa. En el modo Fácil, los términos aparecen subrayados en las pantallas de dinero y del país: tócalos para leerla.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🌱 Niveles y modo Fácil',`<b>Al crear la partida eliges un nivel:</b> 🌱 Fácil, ⚖️ Medio o 🎓 Realista. En «⚙️ Más opciones» puedes combinar el modo (Rápido o Realista) y la dificultad como antes: eso aparece como «Personalizado».
<ul><li><b>Fácil:</b> el menú Más muestra primero lo básico y abre lo demás con tu avance (Bancos y empresas a los 18 años, la Bolsa con ahorros de un año de salario medio…); el aviso «🔓» te dice cuándo. En Ajustes puedes mostrar todo desde el inicio.</li>
<li><b>Primera vez:</b> cada pantalla importante se explica con una tarjeta corta y un «¿Sabías que…?» con fuente.</li>
<li><b>Te conviene:</b> arriba del mapa aparece el siguiente paso sugerido; tócalo para ir a la pantalla, o ✕ para ocultarlo este año.</li>
<li><b>Tu año en números:</b> cada año el historial resume ingresos, gastos y cómo cambió tu patrimonio, y explica por qué.</li>
<li><b>Avisos:</b> si tienes en un banco riesgoso más de lo que cubre el seguro de depósitos, te avisa antes de que pase algo.</li>
<li><b>📖 Glosario</b> (Más): términos de economía y finanzas; en Fácil aparecen subrayados en las pantallas de dinero y del país.</li></ul>`];
 const gi=GUIA.findIndex(g=>/^💾/.test(g[0]));GUIA.splice(gi>=0?gi+1:0,0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v20a',e);}}

(function(){const st=document.createElement('style');st.id='v20acss';st.textContent=`
.modes.lvls .lv{display:block;width:100%;text-align:start;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:0 0 8px;color:var(--fg,inherit);font:inherit;cursor:pointer}
.modes.lvls .lv b{display:block;font-size:15px;margin-bottom:2px}.modes.lvls .lv span{display:block;font-size:12.5px;color:var(--mut);line-height:1.35}
.modes.lvls .lv.on{border-color:var(--act);background:var(--sel-bg,var(--card2));box-shadow:0 0 0 1px var(--act) inset}
.modes.lvls .lv[disabled]{opacity:.45;cursor:not-allowed}
details.v20mo{margin:6px 0 4px;border:1px dashed var(--line);border-radius:10px;padding:6px 10px}
details.v20mo>summary{cursor:pointer;font-size:13px;color:var(--mut);padding:4px 0;list-style-position:inside}
details.v20mo[open]>summary{margin-bottom:6px}
.v20lvc{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:4px 0 8px}
.v20lvc b{display:block;font-size:15px}.v20lvc>span{display:block;font-size:12.5px;color:var(--mut);margin-top:2px;line-height:1.35}
.ezlk .s>div{margin-top:2px}.ezlk .ezall{color:var(--act);margin-top:4px}
.ezc{background:var(--card2);border:1px solid var(--act);border-radius:12px;padding:10px 12px;margin:8px 0 10px}
.ezc .ezh{display:flex;align-items:center;justify-content:space-between;font-weight:700;font-size:13.5px;color:var(--act)}
.ezc p{margin:6px 0;font-size:13.5px;line-height:1.45}
.ezc .ezsb{font-size:12.5px;color:var(--mut);border-top:1px solid var(--line);padding-top:6px;margin:6px 0;line-height:1.4}
.ezc .ezsb small{display:block;margin-top:2px;opacity:.85}
.ezc .btn{margin-top:4px;padding:6px 14px}
.ezx{background:none;border:0;color:var(--mut);font-size:15px;padding:2px 6px;cursor:pointer}
#ezTip{display:flex;align-items:center;gap:4px;background:var(--card2);border:1px solid var(--line);border-inline-start:3px solid var(--act);border-radius:10px;margin:8px 0 0;padding:2px 4px 2px 8px}
#ezTip .ezgo{flex:1;background:none;border:0;color:inherit;text-align:start;font:inherit;font-size:13px;padding:6px 0;cursor:pointer;line-height:1.35}
#ezTip .ezl{color:var(--act);font-weight:700}
.gls{text-decoration:underline dotted;text-decoration-color:var(--act);text-underline-offset:3px;cursor:help}
.glsl .glsi{border-bottom:1px solid var(--line);padding:8px 0}.glsl .glsi p{margin:3px 0 0;font-size:13.5px;color:var(--mut);line-height:1.4}
`;document.head.appendChild(st);})();
