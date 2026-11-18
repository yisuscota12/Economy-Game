/* ===== v1.9c (fase 2 de la ruta 9d, parte 3) — interfaz =====
   1) Íconos coherentes: set «Juego» (game-icons.net, CC BY 3.0) dibujado en la misma fuente IVI (ivi_font.js: IVJ_B64).
      Ajustes → 🎨 Íconos: Juego (nuevo, por omisión) · Línea (el de la v1.7q) · Emoji del sistema. Créditos con los autores en la portada.
   2) Animaciones Lottie (lottie-web «light», solo SVG) en los momentos clave: logro, ascenso y victoria. Las animaciones son propias
      (lot_anim.js, generadas por herramientas/lottie/build_lottie.py) y toman el color de acento del tema. Interruptor en Ajustes
      (Automático / Sí / No); en automático se apagan con «reducir movimiento», el mapa ligero o un equipo de 2 núcleos.
   3) Ejércitos desde la burbuja del mapa: cada ejército tuyo en la provincia es un botón; al tocarlo queda seleccionado y la burbuja
      muestra sus órdenes (Mover, Automático, Dividir, Unir, Saquear, Reagrupar). Las órdenes «tocan» los mismos botones de la ficha
      de abajo (#selInfo), así que hacen exactamente lo mismo. Mientras eliges el destino, un aviso flota sobre el mapa.
   4) Estilo nuevo en las pantallas viejas: Bolsa y gobierno (Resumen, Ejército, Economía, Diplomacia, Gabinete, Ranking) con
      tarjetas de datos, medidores alineados y las pestañas del sistema de diseño. */

/* ---------- 1) íconos: set «Juego» ---------- */
if(CFG.ivs===undefined)CFG.ivs='j';
const IVS=()=>CFG.ivi?(CFG.ivs==='l'?'l':'j'):'e';
if(typeof IVI_ON!=='undefined'&&IVI_ON&&CFG.ivs!=='l'&&typeof IVJ_B64!=='undefined'){const st=$('ivif');
  if(st)st.textContent=`@font-face{font-family:IVI;src:url(data:font/woff2;base64,${IVJ_B64}) format("woff2");unicode-range:${IVI_UR};font-display:block}`;}
try{document.documentElement.dataset.ivs=IVS();}catch(e){}
// vista previa de los dos sets en Ajustes (fuentes con otro nombre; se agregan solo al abrir Ajustes)
function ivsPreviewCSS(){if($('ivsprev')||typeof IVJ_B64==='undefined')return;const st=document.createElement('style');st.id='ivsprev';
  st.textContent=`@font-face{font-family:IVIPJ;src:url(data:font/woff2;base64,${IVJ_B64}) format("woff2");unicode-range:${IVI_UR}}@font-face{font-family:IVIPL;src:url(data:font/woff2;base64,${IVI_B64}) format("woff2");unicode-range:${IVI_UR}}`;document.head.appendChild(st);}
const IVS_SAMPLE='⭐🏆⚔️🏦📈';
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b)return;const old=[...b.querySelectorAll('.item')].find(x=>!x.dataset.ivs&&/🎨/.test(x.textContent)&&!x.querySelector('[data-ivs]'));
    ivsPreviewCSS();const cur=IVS();const x=document.createElement('div');x.className='item';x.id='cfIvs';x.style.display='block';
    x.innerHTML=`<div class="t">🎨 Íconos</div><div class="s"><span>Juego: dibujos rellenos con estilo de juego de estrategia.</span> <span>Línea: trazos finos y sobrios.</span> <span>Emoji del sistema: los de tu teléfono o computadora.</span></div>
     <div class="chips ivs" style="margin-top:6px"><button data-ivs="j" class="${cur==='j'?'on':''}"><span class="ivp j" data-noi18n>${IVS_SAMPLE}</span><span>Juego</span></button><button data-ivs="l" class="${cur==='l'?'on':''}"><span class="ivp l" data-noi18n>${IVS_SAMPLE}</span><span>Línea</span></button><button data-ivs="e" class="${cur==='e'?'on':''}"><span class="ivp e" data-noi18n>${IVS_SAMPLE}</span><span>Emoji del sistema</span></button></div>`;
    if(old)old.replaceWith(x);else{const h3=b.querySelector('h3');h3?h3.after(x):b.prepend(x);}
    x.querySelectorAll('[data-ivs]').forEach(y=>y.onclick=()=>{const k=y.dataset.ivs;if(k===IVS())return;CFG.ivi=k==='e'?0:1;if(k!=='e')CFG.ivs=k;saveCfg();try{if(G&&P)saveNow();}catch(e){}location.reload();});}catch(e){console.warn('ivs',e);}};}

/* créditos de la portada: game-icons.net (con sus autores), Tabler, Lottie y GSAP */
{const _ch=coverHTML;coverHTML=function(){let h=_ch();try{const aut=typeof IVJ_AUT!=='undefined'?IVJ_AUT.join(', '):'Lorc, Delapouite';
  const ic=`<p><b>Íconos</b><br><span>Set «Juego»: game-icons.net, licencia CC BY 3.0.</span> <span class="cv-aut" data-noi18n>${aut}.</span><br><span>Set «Línea»: Tabler Icons, licencia MIT.</span> <span>Íconos propios del juego.</span></p>
   <p><b>Animaciones y librerías</b><br><span>Lottie (lottie-web, licencia MIT) con animaciones propias del juego.</span> <span>GSAP (licencia estándar de GSAP).</span></p>`;
  h=h.replace(/<p><b>Íconos<\/b><br><span>[^<]*<\/span><\/p>/,ic);}catch(e){}return h;};}

/* ---------- 2) Lottie en los momentos clave ---------- */
if(CFG.lot===undefined)CFG.lot='auto';
const LOTX={best:0,t:0,last:0,lastK:0,el:null,an:null,to:0,cache:{},mute:0,n:0};
const LOT_K=['','logro','ascenso','victoria'];
const LOT_TXT={logro:'¡Logro!',ascenso:'¡Ascenso!',victoria:'¡Victoria!'};
function lotOn(){const m=CFG.lot||'auto';if(m==='off'||typeof lottie==='undefined'||typeof LOT_ANIM==='undefined')return false;if(m==='on')return true;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}
  try{if(typeof mapMode!=='undefined'&&mapMode&&mapMode!=='gl')return false;if(CFG.mfx===0)return false;}catch(e){}
  return (navigator.hardwareConcurrency||4)>2;}
// textos del registro (en español, antes de traducir) que marcan cada momento; gana la victoria sobre el ascenso y el ascenso sobre el logro
const LOT_RX=[[3,/^🥊 Ganas contra|¡Ganas la elección|Ganas el referéndum|¡Campe[oó]n|¡Campeones|Campeón mundial|^🏆|^🥇 |¡GANAS|Ganas el torneo|Ganas el concurso|Ganas el primer lugar|Ganas el título/],
 [2,/^¡Ascenso|Te ascienden|^Ascenso a gerente|asciende a la |entra a la |^Ahora gobiernas|te nombran secretari|^⚽ Te ficha|Debutas con el primer equipo|crece y ahora es un banco/],
 [1,/^🏅 Logro:|^⭐ Cumpliste tu ambición|^🏅 Te convocan/]];
function lotKind(s){s=String(s||'');for(const [k,rx] of LOT_RX)if(rx.test(s))return k;return 0;}
{const _lg=log;log=function(t,c){const r=_lg(t,c);try{if(!LOTX.mute&&!(typeof FF_ON!=='undefined'&&FF_ON)){const k=lotKind(t);if(k)lotQueue(k);}}catch(e){}return r;};}
// al empezar una partida en modo Líder (setupLeader → «Ahora gobiernas…») no hay nada que celebrar todavía
{const _sl=setupLeader;setupLeader=function(...a){LOTX.mute++;try{return _sl(...a);}finally{LOTX.mute--;}};}
function lotQueue(k){LOTX.best=Math.max(LOTX.best,k);clearTimeout(LOTX.t);LOTX.t=setTimeout(lotFlush,380);}
function lotFlush(){const k=LOTX.best;LOTX.best=0;if(!k||!lotOn())return;try{if(document.hidden)return;}catch(e){}
  if(performance.now()-LOTX.last<2400&&k<=LOTX.lastK)return;lotPlay(LOT_K[k]);}
// color de acento del tema (relleno de lo que actúa) → los rellenos «A» de la animación
function lotAcc(){try{const c=dsColor(getComputedStyle(document.documentElement).getPropertyValue('--act').trim()||'#f2c14e');const m=c.match(/\d+(\.\d+)?/g).map(Number);return [m[0]/255,m[1]/255,m[2]/255,1];}catch(e){return [.949,.757,.306,1];}}
function lotData(name){const acc=lotAcc();const key=name+'|'+acc.map(v=>v.toFixed(3)).join(',');if(LOTX.cache[key])return LOTX.cache[key];
  const d=JSON.parse(JSON.stringify(LOT_ANIM[name]));const walk=o=>{if(Array.isArray(o)){o.forEach(walk);return;}if(!o||typeof o!=='object')return;if((o.ty==='fl'||o.ty==='st')&&o.nm==='A'&&o.c)o.c.k=acc.slice();for(const k in o)if(o[k]&&typeof o[k]==='object')walk(o[k]);};walk(d);
  LOTX.cache={};LOTX.cache[key]=d;return d;}
function lotPlay(name){try{if(!LOT_ANIM[name]||typeof lottie==='undefined')return false;lotStop(false);const el=document.createElement('div');el.id='lotfx';el.className='lot-'+name;el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="lot-bg"></div><div class="lot-c"></div><div class="lot-t">${LOT_TXT[name]||''}</div>`;document.body.appendChild(el);
  const an=lottie.loadAnimation({container:el.querySelector('.lot-c'),renderer:'svg',loop:false,autoplay:true,animationData:lotData(name),rendererSettings:{progressiveLoad:false,preserveAspectRatio:'xMidYMid meet'}});
  LOTX.el=el;LOTX.an=an;LOTX.last=performance.now();LOTX.lastK=LOT_K.indexOf(name);LOTX.n++;LOTX.played=name;requestAnimationFrame(()=>el.classList.add('on'));
  an.addEventListener('complete',()=>lotStop(true));LOTX.to=setTimeout(()=>lotStop(true),2700);return true;}catch(e){console.warn('lottie',e);return false;}}
function lotStop(fade){clearTimeout(LOTX.to);const el=LOTX.el,an=LOTX.an;LOTX.el=null;LOTX.an=null;if(!el)return;
  const kill=()=>{try{an&&an.destroy();}catch(e){}el.remove();};if(fade){el.classList.remove('on');el.classList.add('off');setTimeout(kill,260);}else kill();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lotStop(false);});
// Ajustes → 🎬 Animaciones de momentos clave (Automático / Sí / No) + Probar
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b||b.querySelector('[data-lot]'))return;const m=CFG.lot||'auto';const lab={auto:'Automático',on:'Sí',off:'No'};
  const x=document.createElement('div');x.className='item';x.style.display='block';x.id='cfLot';
  x.innerHTML=`<div class="t">🎬 Animaciones de momentos clave</div><div class="s"><span>Una animación corta al conseguir un logro, un ascenso o una victoria.</span> <span>En automático se apagan con «reducir movimiento», el mapa ligero o un equipo de 2 núcleos.</span></div><div class="chips" style="margin-top:6px">${['auto','on','off'].map(k=>`<button data-lot="${k}" class="${m===k?'on':''}">${lab[k]}</button>`).join('')}<button data-lotp="1">▶️ Probar</button></div><div class="s" style="margin-top:4px">${lotOn()?'Ahora: encendidas':'Ahora: apagadas'}</div>`;
  const ref=b.querySelector('[data-dsa]');const it=ref&&ref.closest('.item');(it?it.after(x):b.appendChild(x));
  x.querySelectorAll('[data-lot]').forEach(y=>y.onclick=()=>{CFG.lot=y.dataset.lot;saveCfg();showSettings();});
  x.querySelector('[data-lotp]').onclick=()=>{const L=['logro','ascenso','victoria'];lotPlay(L[LOTX.n%3]);};}catch(e){}};}

/* ---------- 3) ejércitos desde la burbuja ---------- */
const MPA={x:0,y:0};
const MPA_ORD=[['mv','🎯'],['auto','🤖'],['split','✂️'],['merge','🔗'],['plu','💰'],['reg','🧲']];
function mpaBtn(k,id){const box=$('selInfo');return box?box.querySelector(`[data-ar="${k}"][data-id="${id}"]`):null;}
function mpArmies(rid){try{if(!P||!P.alive||!G.armies||!hasCommand(P))return '';const me=cmdNat();if(!me)return '';
  const mine=G.armies.filter(a=>a.r===rid&&!a.sea&&a.o===me&&armyVisible(a));if(!mine.length)return '';
  let sel=mine.find(a=>a.id===MO.sel)||null;if(!sel&&mine.length===1)sel=mine[0];
  let h=`<div class="mpar">`+mine.map(a=>{const st=a.train>0?'⏳':a.path&&a.path.length?'➡️':a.auto?'🤖':'';
    return `<button class="mparm${sel&&a.id===sel.id?' on':''}" data-mpar="${a.id}" aria-pressed="${sel&&a.id===sel.id?'true':'false'}"><i>🪖</i><b>${fmtK(a.n)}</b><s class="mpmo" title="moral ${pctI(a.m)}"><u style="width:${Math.round(clamp(a.m,0,1)*100)}%;background:${a.m>.6?'#47c26b':a.m>.3?'#f2c14e':'#f0565d'}"></u></s>${st?`<em>${st}</em>`:''}</button>`;}).join('')+`</div>`;
  if(sel&&!blockedTurn()){if(sel.id!==MO.sel){MO.sel=sel.id;}const o=MPA_ORD.map(([k,ic])=>[k,ic,mpaBtn(k,sel.id)]).filter(x=>x[2]);
    if(o.length)h+=`<div class="mpa mpord">`+o.map(([k,ic,b])=>{const [i2,t]=plSplit(b.textContent);return `<button data-mpo="${k}" ${b.disabled?'disabled':''}><i>${i2||ic}</i><span>${t}</span></button>`;}).join('')+`</div>`;}
  else if(!sel)h+=`<div class="mph">Toca un ejército para darle órdenes.</div>`;
  return h;}catch(e){return '';}}
{const _mh=mpopHTML;mpopHTML=function(rid,ci){let h=_mh(rid,ci);const a=mpArmies(rid);if(!a)return h;
  h=h.replace(/<button data-mp="\[data-ar=&quot;mv&quot;\]">[\s\S]*?<\/button>/,'');
  h=h.replace(/<span class="mpc" style="color:var\(--gold\)">[\s\S]*?<\/small><\/span>/,'');   // el total «propios» ya se ve ejército por ejército   // «Mover» genérico (movía el primer ejército): ahora va con el ejército elegido
  // lo que se puede hacer va primero: antes de los avisos de guerra (asedio, totales, ejército en camino) y de las acciones del lugar
  const ks=['<div class="mps','<div class="mpcs mpm','<div class="mpw','<div class="mpa">'].map(x=>h.indexOf(x)).filter(x=>x>=0);const k=ks.length?Math.min(...ks):-1;return k<0?h+a:h.slice(0,k)+a+h.slice(k);};}
{const _ms=mpopShow;mpopShow=function(cx,cy){MPA.x=cx;MPA.y=cy;_ms(cx,cy);try{const p=document.querySelector('#mapWrap .mpop');if(!p)return;
  p.querySelectorAll('[data-mpar]').forEach(b=>b.onclick=e=>{e.stopPropagation();MO.sel=+b.dataset.mpar;try{renderSel();drawOverlay();}catch(_){}mpopShow(MPA.x,MPA.y);});
  p.querySelectorAll('[data-mpo]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.mpo,id=MO.sel;const t=mpaBtn(k,id);if(!t||t.disabled)return;
    const rid=G.sel;if(k==='mv'){mpopHide();t.click();return;}t.click();setTimeout(()=>{if(G.sel===rid&&!modalOn()&&!sheetIsOpen())mpopShow(MPA.x,MPA.y);},0);});}catch(e){}};}
// aviso flotante mientras eliges el destino (también en pantalla completa, donde la barra de Mando no se ve)
function mpOrdHint(){try{const w=$('mapWrap');if(!w)return;let d=w.querySelector('.mpordh');const a=MO&&MO.ord?armyById(MO.ord):null;
  if(!a){if(d)d.remove();return;}if(!d){d=document.createElement('div');d.className='mpordh';w.appendChild(d);}
  d.innerHTML=`<span>🎯 </span><span>Toca en el mapa la provincia destino</span> <button class="btn sm" data-mpox="1">Cancelar</button>`;
  d.querySelector('[data-mpox]').onclick=e=>{e.stopPropagation();MO.ord=null;render();};d.addEventListener('pointerdown',e=>e.stopPropagation());}catch(e){}}
{const _rd=render;render=function(...a){const r=_rd(...a);mpOrdHint();return r;};}

/* ---------- 4) estilo nuevo en Bolsa y gobierno ---------- */
function v19Tile(lab,val,sub,col){return `<div class="plt"><small>${lab}</small><b${col?` style="color:${col}"`:''}>${val}</b>${sub?`<i>${sub}</i>`:''}</div>`;}
function v19Tiles(L,cols){return `<div class="plg v19g${cols===2?' c2':''}">${L.filter(Boolean).map(x=>v19Tile(...x)).join('')}</div>`;}
const v19Sign=v=>(v>=0?'+':'')+v;
const V19S={scr:null};
// cada pantalla marca qué es antes de dibujarse; openSheet (vista País o pantalla) recibe el HTML y lo transforma
function v19Mark(fn,scr){return function(...a){const o=V19S.scr;V19S.scr=scr;try{return fn.apply(this,a);}finally{V19S.scr=o;}};}
showArmiesV=v19Mark(showArmiesV,'arm');showEconomyV=v19Mark(showEconomyV,'eco');showEconomy=v19Mark(showEconomy,'eco');   /* showEconomy arma su pantalla con lo que dibuja showEconomyV */
showNationDipV=v19Mark(showNationDipV,'ndip');showDiplomacyV=v19Mark(showDiplomacyV,'dip');
// reemplaza el primer <div class="hint">…</div> que sigue al <h3>
function v19RepHint(h,rep){const i=h.indexOf('</h3>');if(i<0)return h;const j=h.indexOf('<div class="hint">',i);if(j<0||j-i>40)return h;let d=0,k=j;
  const re=/<div\b|<\/div>/g;re.lastIndex=j;let m;while((m=re.exec(h))){d+=m[0]==='</div>'?-1:1;if(d===0){k=m.index+6;break;}}return h.slice(0,j)+rep+h.slice(k);}
function v19Xform(h){const s=V19S.scr;if(!s||!P||!G)return h;try{const n=natOf(P),me=n.id;
  if(s==='arm'){const L=armiesOf(me);const t=v19Tiles([['Soldados',fmtK(soldiersOf(me)),`${L.length} ejército(s)`],['Reserva de reclutas',fmtK(n.mp||0),'población movilizable'],
      ['Calidad',qualOf(me).toFixed(2),'SIPRI'],['Gasto por soldado',fmtN(perSoldier(me)),'al año'],P.ruler?['Tesoro',fmtN(n.treas||0)]:null,P.ruler?['Costo de tropas extra',fmtN(upkeepOf(me)),'al año']:null]);
    return v19RepHint(h,t+(P.ruler?'':`<div class="hint">Como General mueves las tropas; reclutar y disolver lo decide el gobierno.</div>`));}
  if(s==='eco'&&P.ruler){const real=isReal();const eb=ecoBonus(n);const g=n.g||0;
    const t=v19Tiles([['PIB',fmtN(n.gdp)],['Crecimiento',pct(g),`bono de política ${v19Sign(eb.toFixed(2))} %`,g<0?'var(--red)':'var(--green)'],real?['Inflación',pct(n.infl),'',n.infl>8?'var(--red)':'']:null,
      ['Deuda pública',Math.round(n.debtR*100)+' %','del PIB',n.debtR>1?'var(--red)':''],['Tasa de tus bonos',pct(bondRate(n)*100)]]);
    return v19RepHint(h,t);}
  if(s==='ndip'){const T=G.nations[(h.match(/data-ndt="([A-Z0-9]+)"/)||[])[1]]||V19S.t&&G.nations[V19S.t];if(!T)return h;const o=P.ruler?opOf(T.id):null;const pw=power(T.id)/Math.max(1,power(me));
    const war=warsOf(T.id).map(w=>G.nations[enemyIn(w,T.id)].name);
    const t=`<div class="v19gov"><span>${T.gov==='dictadura'?'Dictadura':'República'}</span> · <span>gobierna ${T.leader}</span></div>`+v19Tiles([['Población',fmtPop(T.pop)],['PIB',fmtN(T.gdp)],['Por persona',fmtN(gdppc(T))],
      ['Crecimiento',pct(T.g||0),'',(T.g||0)<0?'var(--red)':''],['Estabilidad',Math.round(T.stab),'',T.stab<30?'var(--red)':''],['Ejército',Math.round(T.army)],
      o!=null?['Opinión hacia ti',Math.round(o),'',opCol(o)]:null,P.ruler?['Su poder',pctI(pw),'del tuyo',pw>1.5?'var(--red)':pw<.67?'var(--green)':'']:null])+
      (war.length?`<div class="hint"><span class="neg">En guerra con ${war.join(', ')}</span></div>`:'')+(P.ruler?`<div class="mpt v19rel">${relChips(T.id)}</div>`:'');
    return v19RepHint(h,t);}
  if(s==='dip'&&P.ruler){const d=P.dip||0;const pips=[0,1,2].map(i=>`<i class="${i<d?'on':''}"></i>`).join('');
    return v19RepHint(h,`<div class="v19dip"><div class="v19pip">${pips}</div><div><b>Te quedan ${d} de 3 acciones diplomáticas este año.</b><span>La opinión de cada país sube con embajadas y tratados y baja con ultimátums y guerras.</span></div></div>`);}
  }catch(e){console.warn('v19Xform',e);}return h;}
{const _sd=showNationDipV;showNationDipV=function(t){V19S.t=t;return _sd(t);};}
{const _op=openSheet;openSheet=function(h,b){return _op(v19Xform(h),b);};}
// Resumen del país: relaciones como etiquetas
{const _rs=relSummary;relSummary=function(n){try{const me=n.id;const al=n.allies.map(t=>G.nations[t].name),vs=vassalsOf(me).map(t=>G.nations[t].name),ws=warsOf(me).map(w=>G.nations[enemyIn(w,me)].name);const ov=overlordOf(me);
  return (ws.length?`<div class="hint"><span class="neg">En guerra con ${ws.join(', ')}</span></div>`:'')+`<div class="mpt v19rel"><span>🤝 Aliados: ${al.join(', ')||'ninguno'}</span><span>👑 Vasallos: ${vs.join(', ')||'ninguno'}</span>${ov?`<span>⚑ Eres vasallo de ${G.nations[ov].name}</span>`:''}</div>`;}catch(e){return _rs(n);}};}
// Gabinete: tarjeta por secretaría con medidores alineados (etiqueta · barra · número)
const v19Meter=(lab,v,col)=>`<div class="mnm"><span>${lab}</span><i class="mb2"><b style="width:${Math.round(clamp(v,0,100))}%;background:${col}"></b></i><em>${Math.round(v)}</em></div>`;
cabTab=function(body,n){minEnsure(n);const rule=P.ruler&&natOf(P)===n;const me=P.career.track==='gob'?P.career.min:null;
  let h=`<div class="hint"><span>${rule?'Tú nombras a los secretarios y das directivas (cada nombramiento o directiva usa una acción de gobierno).':`Gabinete de ${n.leader}.`}</span> <span>La capacidad mejora el área de cada secretaría, la honestidad baja la corrupción y la lealtad evita crisis al removerlos.</span>${me?` <span>Tú trabajas en la Secretaría de ${MINS[MINK[me]].n}.</span>`:''}</div>`;
  h+=MINS.map(m=>{const x=n.min[m.k];const c=minC(n,m.k);const act=Object.keys(n.dv||{}).filter(k=>k.startsWith(m.k)&&dvOn(n,k)).map(k=>m.dir[+k.slice(3)][0]);
    return `<div class="mn v19mn"><div class="ic">${m.ic}</div><div class="tt"><b><span>${m.n}</span></b><div class="mnw">${x?x.nm:'vacante'}${x&&x.pl?' (tú)':''}${x&&x.tp?` · <span>${x.tp}</span>`:''}</div>
      <div class="mnms">${v19Meter('Capacidad',c,'#3ccf8e')+v19Meter('Honestidad',x?x.h:0,'#5aa2f0')+v19Meter('Lealtad',x?x.l:0,'#f2c14e')}</div>${act.length?`<div class="mnw"><span>En marcha: ${act.join(', ')}</span></div>`:''}
      ${rule?`<div class="mini-actions">${!(x&&x.pl)?`<button class="btn" data-ap="${m.k}">Nombrar</button>`:''}<button class="btn" data-dv="${m.k}">Directivas</button></div>`:''}</div></div>`;}).join('');
  body.innerHTML=h;
  body.querySelectorAll('[data-ap]').forEach(x=>x.onclick=()=>{const k=x.dataset.ap;const C=[minCand(n,k),minCand(n,k),minCand(n,k)];
    openSheetRaw(`<h3>${MINS[MINK[k]].ic} Secretaría de ${MINS[MINK[k]].n}</h3><div class="hint">${MINS[MINK[k]].d}. Candidatos:</div>`+C.map((c,i)=>`<button class="item" data-cd="${i}"><span><div class="t">${c.nm} · ${c.tp}</div><div class="s">Capacidad ${c.c} · honestidad ${c.h} · lealtad ${c.l}</div></span></button>`).join(''),
      b=>b.querySelectorAll('[data-cd]').forEach(y=>y.onclick=()=>{closeSheet();useNat({t:'Nombramiento',fn:()=>minAppoint(n,k,C[+y.dataset.cd])});renderView();}));});
  body.querySelectorAll('[data-dv]').forEach(x=>x.onclick=()=>{const k=x.dataset.dv,m=MINS[MINK[k]];
    openSheetRaw(`<h3>${m.ic} Directivas de ${m.n}</h3><div class="hint">Se pagan del tesoro (${fmtN(n.treas||0)}).</div>`+m.dir.map(([t,c,s],i)=>`<button class="item" data-di="${i}" ${(n.treas||0)>=n.gdp*c/100&&P.nat>0?'':'disabled'}><span><div class="t">${t}</div><div class="s">${s} · ${fmtN(n.gdp*c/100)}</div></span></button>`).join(''),
      b=>b.querySelectorAll('[data-di]').forEach(y=>y.onclick=()=>{closeSheet();useNat({t:'Directiva',fn:()=>minDirective(n,k,+y.dataset.di)});renderView();}));});};
// Ranking: tu lugar como tarjeta y medallas para los tres primeros
{const _rk=rankTab;rankTab=function(b,n){_rk(b,n);try{const L=ranking();const i=L.findIndex(x=>x.id===n.id);const hn=b.querySelector('.hint');
  if(hn){const d=document.createElement('div');d.innerHTML=v19Tiles([['Tu lugar','#'+(i+1),`de ${L.length} países`,'var(--gold)'],['Puntaje',Math.round(L[i]?L[i].s:0),'pts']],2);hn.before(d.firstChild);}
  b.querySelectorAll('.item .t').forEach((t,k)=>{if(k<3)t.closest('.item').classList.add('rk'+(k+1));});}catch(e){}};}

(function(){const st=document.createElement('style');st.id='v19ccss';st.textContent=`
/* íconos: vista previa en Ajustes */
.chips.ivs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.chips.ivs button{display:grid;gap:2px;justify-items:center;padding:7px 4px;min-height:56px}
.ivp{font-size:14px;letter-spacing:.5px;white-space:nowrap;line-height:1.2;max-width:100%;overflow:hidden}.chips.ivs button>span:last-child{white-space:normal;line-height:1.15;font-size:12px}.ivp.j{font-family:IVIPJ,system-ui!important}.ivp.l{font-family:IVIPL,system-ui!important}.ivp.e{--emo:system-ui,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;font-family:var(--emo)!important}
.cv-aut{color:#a9b6c6;font-size:11.5px}
/* Lottie */
#lotfx{position:fixed;left:50%;top:34%;width:min(58vw,250px);aspect-ratio:1;transform:translate(-50%,-50%) scale(.92);opacity:0;pointer-events:none;z-index:9990;transition:opacity .18s ease,transform .3s var(--ease,ease)}
#lotfx.on{opacity:1;transform:translate(-50%,-50%) scale(1)}#lotfx.off{opacity:0;transform:translate(-50%,-56%) scale(.96)}
.lot-bg{position:absolute;inset:16%;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--card) 88%,transparent) 0,color-mix(in srgb,var(--card) 50%,transparent) 55%,transparent 72%)}
.lot-c{position:absolute;inset:0}.lot-c svg{display:block}
.lot-t{position:absolute;left:0;right:0;bottom:-2%;text-align:center;font-weight:900;font-size:var(--fs-6,20px);letter-spacing:.02em;color:var(--gold);text-shadow:0 2px 10px color-mix(in srgb,var(--bg) 85%,transparent),0 0 2px var(--bg)}
/* ejércitos en la burbuja */
.mpar{display:flex;gap:5px;flex-wrap:wrap;margin:5px 0 2px}
.mparm{width:auto!important;flex:0 0 auto;display:inline-flex!important;align-items:center;gap:4px;min-height:34px;padding:3px 9px 3px 7px;border-radius:var(--r-p,999px);border:1px solid var(--line);background:var(--card2);color:var(--ink);font-size:12.5px}
.mparm i{font-style:normal;font-size:14px}.mpmo{display:block;width:22px;height:5px;border-radius:3px;background:var(--well);overflow:hidden;text-decoration:none}.mpmo u{display:block;height:100%;border-radius:3px}.mparm em{font-style:normal;font-size:12px}
.mparm.on{border-color:var(--sel-line);background:var(--sel-bg);box-shadow:inset 0 -2px 0 var(--act)}.mparm.on b{color:var(--gold)}
.mpa.mpord{margin-top:4px}.mpa.mpord button:first-child{background:var(--act);color:var(--act-ink);border-color:var(--act)}.mpa.mpord button:first-child span,.mpa.mpord button:first-child i{color:var(--act-ink)}
.mph{font-size:12px;color:var(--mut);margin:3px 0 1px}
.mpordh{position:absolute;left:8px;right:8px;top:8px;margin:0 auto;width:fit-content;z-index:6;display:flex;align-items:center;gap:6px;background:var(--glass);border:1px solid var(--sel-line);color:var(--ink);border-radius:var(--r-m,12px);padding:5px 6px 5px 10px;font-size:12.5px;box-shadow:var(--sh-2)}
.mpordh .btn.sm{min-height:30px;padding:3px 10px;font-size:12px}
body.mapfull .mpordh{top:calc(54px + env(safe-area-inset-top))}
/* tarjetas de datos en las pantallas viejas */
.v19g{grid-template-columns:repeat(3,1fr)}.v19g .plt small{white-space:normal;line-height:1.2;overflow:visible}.v19g .plt i{display:block;line-height:1.25}.v19g .plt b{font-size:14.5px;white-space:normal;overflow-wrap:anywhere;line-height:1.2}.v19g.c2{grid-template-columns:1fr 1fr}
@media (max-width:360px){.v19g{grid-template-columns:1fr 1fr}}
.v19gov{font-size:12.5px;color:var(--mut);margin:-2px 0 6px}
.mpt.v19rel{display:flex;flex-wrap:wrap;gap:5px;margin:2px 0 8px}.mpt.v19rel>span,.mpt.v19rel .pill{font-size:12px;padding:3px 9px;border-radius:var(--r-p,999px);border:1px solid var(--line);background:var(--card2);color:var(--ink2)}
.v19dip{display:flex;gap:12px;align-items:center;background:var(--card2);border:1px solid var(--line);border-radius:var(--r-m,12px);padding:8px 10px;margin:4px 0 8px}
.v19dip b{display:block;font-size:13.5px;color:var(--ink)}.v19dip span{display:block;font-size:12px;color:var(--mut);margin-top:2px}
.v19pip{display:flex;gap:4px;flex:0 0 auto}.v19pip i{width:12px;height:12px;border-radius:50%;border:2px solid var(--sel-line);background:transparent}.v19pip i.on{background:var(--act);border-color:var(--act)}
/* Resumen del país: mismas tarjetas que la ficha del lugar */
.ngrid{gap:6px}.nst{border-radius:11px;padding:7px 9px;gap:1px}.nst>span{font-size:11px;color:var(--mut)}.nst b{font-size:15px;font-weight:700;background:none!important;padding:0!important;text-align:start!important}
.nst b.pos{color:var(--green)}.nst b.neg{color:var(--red)}
.ideo{border-width:1px 1px 1px 4px;border-radius:var(--r-m,12px);padding:9px 11px}
/* presupuesto */
.bud{border-radius:var(--r-m,12px);padding:8px 10px}.bctl .btn{min-width:var(--tap,40px);min-height:36px}.hb{background:var(--well);height:6px}
/* gabinete */
.v19mn{align-items:flex-start}.v19mn .ic{font-size:24px;padding-top:2px}.v19mn .tt>b{font-size:14px}.mnw{font-size:12px;color:var(--mut);margin:1px 0 4px}
.mnms{display:grid;gap:3px;margin:2px 0 4px}.mnm{display:grid;grid-template-columns:minmax(76px,auto) 1fr 28px;align-items:center;gap:8px;font-size:11.5px;color:var(--mut)}
.mnm em{font-style:normal;text-align:right;color:var(--ink);font-weight:700;font-size:12px}.mb2{display:block;height:6px;border-radius:3px;background:var(--well);overflow:hidden}.mb2 b{display:block;height:100%;border-radius:3px}
.v19mn .mini-actions{margin-top:4px}.v19mn .mini-actions .btn{min-height:34px;padding:5px 12px;font-size:12.5px}
/* ranking */
.item.rk1 .t,.item.rk2 .t,.item.rk3 .t{font-weight:800}.item.rk1{border-color:color-mix(in srgb,#e6b422 55%,var(--line))}.item.rk2{border-color:color-mix(in srgb,#b8c2cc 55%,var(--line))}.item.rk3{border-color:color-mix(in srgb,#c47a3a 55%,var(--line))}
.item.mine{border-color:var(--sel-line);background:var(--sel-bg)}
/* Bolsa: pestañas y tarjetas con el sistema de diseño */
.mkt{gap:5px}.mkt button{border-radius:var(--r-p,999px);border-color:var(--line);background:var(--card2);color:var(--mut);min-height:34px;padding:6px 10px;font-weight:700}
.mkt button.on{background:var(--sel-bg);color:var(--gold);border-color:var(--sel-line);box-shadow:inset 0 -2px 0 var(--act)}
.fin{border-radius:var(--r-m,12px);background:var(--card2)}.frow{min-height:34px;align-items:center}
.sheet h3 small{font-weight:600}
html[dir=rtl] .mnm em{text-align:left}
`;document.head.appendChild(st);})();

/* ---------- ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Íconos','🎨 Íconos','Los juegos usan un solo estilo de íconos para que cada cosa se reconozca de un vistazo, sin leer. game-icons.net es una colección libre de más de 4,000 íconos hechos por artistas voluntarios y se usa en muchos juegos de estrategia.','Juego (rellenos, por omisión), Línea (trazos finos) o los emoji de tu sistema. Al cambiar, la página se recarga y tu partida se guarda antes.'],
 ['Animaciones de momentos clave','🎬 Animaciones de momentos clave','Una señal inmediata al lograr algo refuerza la sensación de avance: es una idea básica del diseño de juegos y de la psicología del aprendizaje.','Aparecen al conseguir un logro, un ascenso o una victoria. No detienen el juego ni tapan los botones; en automático se apagan en equipos lentos o con «reducir movimiento».']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 GUIA.splice(Math.min(2,GUIA.length),0,['🪖 Órdenes desde el mapa',`<b>Tus ejércitos en la burbuja:</b> toca una provincia donde tengas tropas y cada ejército tuyo aparece como un botón, con sus soldados y una barra de moral (verde, ámbar o roja). Tócalo para elegirlo: queda marcado también en el mapa.
<ul><li><b>Órdenes:</b> debajo aparecen las del ejército elegido: 🎯 Mover, 🤖 Automático, ✂️ Dividir, 🔗 Unir aquí, 💰 Saquear y 🧲 Reagrupar. Son las mismas de la ficha de abajo del mapa.</li>
<li><b>🎯 Mover:</b> la burbuja se cierra y un aviso arriba del mapa te pide tocar la provincia destino; «Cancelar» lo deshace.</li>
<li><b>Íconos y animaciones:</b> en Ajustes eliges el estilo de íconos (Juego, Línea o emoji del sistema) y si quieres una animación corta al conseguir un logro, un ascenso o una victoria.</li></ul>`]);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v19c',e);}}

/* pantallas nuevas registran cómo reabrirse (↩ Atrás y volver tras una ventana) */
try{if(typeof shWrapAll==='function')shWrapAll();}catch(e){}
