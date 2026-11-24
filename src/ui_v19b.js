/* ===== v1.9b (fase 2 de la ruta 9d, parte 2) — interfaz =====
   1) Clubes en su provincia exacta (con engine_v19b.js): la ficha del lugar y la burbuja usan c.rg; la ficha del club dice dónde está
      y lleva «Ver en el mapa». La provincia de cada ciudad ya no se calcula leyendo el mapa de identificadores: viene en CITY_RG.
   2) La burbuja del mapa muestra los ejércitos que hay en la provincia (propios, aliados, enemigos, neutrales), el ejército enemigo
      que viene en camino y el asedio en curso con su avance.
   3) Portada: «¿Sabías que…?» con un dato real y su fuente (tabla SABIAS, que reutilizará la fase 3).
   4) Sistema de diseño: escala tipográfica, espaciado, botones y pestañas con estados claros, temas recoloreados con contraste AA
      medido (herramientas/contraste.js), transiciones con GSAP (con interruptor y modo ligero) y vistas vertical y horizontal. */

/* ---------- 1) clubes en su provincia ---------- */
// cityReg (v1.9a) leía el mapa de identificadores la primera vez (~4,600 ciudades); ahora la provincia viene precalculada
{const _cr=cityReg;cityReg=function(i){if(!CREG.a&&typeof CITY_RG!=='undefined'&&CITY_RG&&typeof cityRid==='function'){CREG.a=new Array(CITIES.length);CREG.by={};
    for(let j=0;j<CITIES.length;j++){const r=cityRid(j);CREG.a[j]=r;if(r)(CREG.by[r]=CREG.by[r]||[]).push(j);}}return CREG.a?CREG.a[i]:_cr(i);};}
const FTCK={};
// ciudad del club: el nombre de ciudad (de la lista del país) que lleva en su nombre
function ftClubCity(c){try{const L=FTCK[c.c]||(FTCK[c.c]=ftCities(c.c).map(x=>x[0]).sort((a,b)=>b.length-a.length));return L.find(n=>c.n.indexOf(n)>=0)||null;}catch(e){return null;}}
plClubs=function(rid,city){try{const W=G.ft;if(!W||!W.C||!RG[rid])return [];const nid=RG[rid].n;const C=Object.values(W.C).filter(c=>c.c===nid&&(c.rg===rid||!c.rg));let L;
    if(city){const q=ftNK(city);L=C.filter(c=>{const k=ftClubCity(c);if(k){const kk=ftNK(k);return q===kk||q.startsWith(kk+' ');}return c.n.indexOf(city)>=0;});}
    else{const names=citiesOf(rid).map(i=>CITIES[i][3]);L=C.filter(c=>c.rg===rid||names.some(n=>c.n.indexOf(n)>=0));}
    return L.sort((a,b)=>(W.L[a.l]?W.L[a.l].t||9:9)-(W.L[b.l]?W.L[b.l].t||9:9)||b.r-a.r).slice(0,12);}catch(e){return [];}};
{const _cc=ftClubCard;ftClubCard=function(cid){const r=_cc(cid);try{const W=FTW();const c=W&&W.C[cid];const m=$('modal');const hd=m&&m.querySelector('.cbh');
    if(c&&c.rg&&RG[c.rg]&&hd&&!m.querySelector('.cbloc')){const d=document.createElement('div');d.className='cbloc';
      d.innerHTML=`<span>📍 <b>${RG[c.rg].nm}</b></span><button class="btn sm" data-cbz="1">🔍 Ver en el mapa</button>`;hd.after(d);
      d.querySelector('[data-cbz]').onclick=()=>{SHK.under=null;hideModal();closeSheet();if(G.regions[c.rg]){G.sel=c.rg;try{requestDraw();drawOverlay();renderSel();}catch(e){}}centerOn(c.rg,Math.min(vb.w,520),1);};}}catch(e){}return r;};}

/* ---------- 2) ejércitos y asedios en la burbuja ---------- */
// bando de un ejército respecto a ti: propio (tu país), aliado, enemigo (en guerra con tu país) o neutral
function mpSide(o,me){if(!me)return 'neu';if(o===me)return 'own';if(hostile(me,o))return 'foe';return friendsOf(me).has(o)?'ally':'neu';}
const MP_SIDE={own:['propios','var(--gold)'],ally:['aliados','var(--teal)'],foe:['enemigos','var(--red,#f0565d)'],neu:['neutrales','var(--mut)']};
function mpopMil(rid){try{if(!G.armies||!RG[rid])return '';const me=P&&P.alive?natOf(P).id:null;const r=G.regions[rid];let h='';
  const sg=G.sg&&G.sg[rid];
  if(sg&&G.nations[sg.by]){const ba=G.armies.find(a=>a.r===rid&&a.o===sg.by);const need=Math.max(1,ba?siegeNeed(rid,ba):1);const pc=clamp(sg.t/need,0,1);const side=mpSide(sg.by,me);
    h+=`<div class="mps ${side}"><div><span>🔥 </span><span>${need-sg.t<=1?`Asedio de ${G.nations[sg.by].name}: la provincia puede caer el próximo mes`:`Asedio de ${G.nations[sg.by].name}: mes ${sg.t} de ~${need}`}</span></div><i class="mpbar"><b style="width:${Math.round(pc*100)}%"></b></i></div>`;}
  const here=G.armies.filter(a=>a.r===rid&&!a.sea&&armyVisible(a));
  const atWar=warsOf(r.o).length>0||(me&&warsOf(me).length>0);
  const tot={};here.forEach(a=>{const s=mpSide(a.o,me);(tot[s]=tot[s]||{n:0,o:{}}).n+=a.n;tot[s].o[a.o]=1;});
  const show=sg||tot.foe||(atWar&&here.length)||(tot.own&&hasCommand(P));
  if(show&&here.length){h+='<div class="mpcs mpm">'+['own','ally','foe','neu'].filter(s=>tot[s]).map(s=>{const os=Object.keys(tot[s].o);
      return `<span class="mpc" style="color:${MP_SIDE[s][1]}">${os.length===1?flag(os[0],11)+' ':''}🪖 <b>${fmtK(tot[s].n)}</b> <small>${MP_SIDE[s][0]}</small></span>`;}).join('')+'</div>';}
  // ejército enemigo que se dirige aquí (su ruta termina en esta provincia o pasa por ella)
  if(me){const inc=G.armies.filter(a=>a.r!==rid&&hostile(me,a.o)&&armyVisible(a)&&((a.path&&a.path.indexOf(rid)>=0)||(a.sea&&a.sea.to===rid)));
    if(inc.length){const n=inc.reduce((s,a)=>s+a.n,0);const eta=Math.min(...inc.map(a=>mpEta(a,rid)));
      h+=`<div class="mpw"><span>⚠️ </span><span>${eta<=1?`Ejército enemigo en camino: ${fmtK(n)} soldados, llega el próximo mes`:`Ejército enemigo en camino: ${fmtK(n)} soldados, llega en ~${eta} meses`}</span></div>`;}}
  return h;}catch(e){return '';}}
// meses estimados para que un ejército llegue a una provincia de su ruta (mismo costo por paso y puntos de movimiento que el motor)
function mpEta(a,rid){try{if(a.sea)return Math.max(1,a.sea.eta);const k=a.path.indexOf(rid);if(k<0)return 99;const mp=genOf(a).t==='ve'?3:2;let m=1,left=mp,at=a.r;
  for(let i=0;i<=k;i++){const nx=a.path[i];const st=seaAdj(at).includes(nx)&&!RG[at].adj.includes(nx);const c=Math.min(mp,stepCost(a.o,at,nx,st));if(c>left&&left<2){m++;left=mp;}left-=c;at=nx;}
  return m+(a.train>0?a.train:0);}catch(e){return Math.max(1,Math.ceil((a.path.indexOf(rid)+1)/2));}}
{const _mh=mpopHTML;mpopHTML=function(rid,ci){let h=_mh(rid,ci);const m=mpopMil(rid);if(!m)return h;h=h.replace(/<span>⚔️ En guerra<\/span>/,'<span class="mpwar">⚔️ En guerra</span>');const k=h.lastIndexOf('<div class="mpa">');return k<0?h+m:h.slice(0,k)+m+h.slice(k);};}

// si la burbuja no cabe en el mapa (mapa chico con guerra), se recorta y se desplaza por dentro
{const _ms=mpopShow;mpopShow=function(cx,cy){_ms(cx,cy);try{const p=document.querySelector('#mapWrap .mpop'),w=$('mapWrap');if(p&&w&&p.offsetHeight>w.clientHeight-8){p.style.maxHeight=(w.clientHeight-8)+'px';p.style.overflowY='auto';p.style.top='4px';p.classList.add('fit');}}catch(e){}};}
/* estilos de las partes 1 y 2 */
(function(){const st=document.createElement('style');st.textContent=`
.cbloc{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-2px 0 8px;font-size:12.5px;color:var(--mut)}.cbloc b{color:var(--ink)}
.cbloc .btn.sm{padding:5px 10px;font-size:12px;min-height:32px}
.mps{margin:4px 0 2px;font-size:12px;color:var(--ink2,#cbd5e1)}.mps>div{display:flex;gap:2px}.mps.foe{color:#ffb4a8}.mps.own{color:var(--gold)}
.mpbar{display:block;height:5px;border-radius:3px;background:var(--card2);margin-top:4px;overflow:hidden}.mpbar b{display:block;height:100%;background:linear-gradient(90deg,#e8590c,#f0565d);border-radius:3px}
.mps.own .mpbar b{background:linear-gradient(90deg,var(--gold),#e8a33b)}
.mpm{margin-top:2px}.mpop.fit::after{display:none}.mpw{display:flex;gap:2px;margin:3px 0 2px;font-size:12px;color:#ffcf8a;background:rgba(240,86,93,.12);border:1px solid rgba(240,86,93,.35);border-radius:8px;padding:4px 7px}
.mpop:has(.mpm,.mps,.mpw) .mpa button{min-height:40px;padding:4px 2px 3px;gap:1px;font-size:10.5px;min-width:0}
.mpop:has(.mpm,.mps,.mpw) .mpa button i{font-size:15px}.mpop:has(.mpm,.mps,.mpw) .mpa button span{-webkit-line-clamp:1;white-space:nowrap}
.mpop:has(.mpm,.mps,.mpw) .mpt .mpwar{display:none}
html[data-theme=claro] .mpw,html[data-theme=amigable] .mpw,html[data-theme=medieval] .mpw{color:#8a3b00}
html[data-theme=claro] .mps.foe,html[data-theme=amigable] .mps.foe,html[data-theme=medieval] .mps.foe{color:#a61b1b}
`;document.head.appendChild(st);})();

/* ---------- 3) portada: «¿Sabías que…?» ----------
   Datos reales con su fuente. [texto, fuente, tema]. La fase 3 (modos educativos) reutilizará esta tabla por tema
   (pob población, eco economía, fin finanzas, com comercio, geo geografía, nat naturaleza, dep deporte). */
const SABIAS=[
 ['India superó a China en 2023 como el país más poblado del mundo.','ONU','pob'],
 ['Desde 2007 vive más gente en ciudades que en el campo.','ONU','pob'],
 ['La esperanza de vida mundial pasó de unos 46 años en 1950 a más de 73 hoy.','ONU','pob'],
 ['En los años sesenta cada mujer tenía en promedio unos 5 hijos; hoy el promedio mundial ronda los 2.2.','ONU','pob'],
 ['Corea del Sur tiene la fecundidad más baja del mundo: menos de 0.8 hijos por mujer.','Oficina de Estadística de Corea, 2024','pob'],
 ['En Japón casi 3 de cada 10 personas tienen 65 años o más.','Oficina de Estadística de Japón, 2024','pob'],
 ['México es el país con más hablantes nativos de español: más de 120 millones.','Instituto Cervantes, 2024','pob'],
 ['La economía mundial produce unos 110 billones de dólares al año.','FMI, 2024','eco'],
 ['Estados Unidos y China generan juntos más del 40 % del PIB mundial.','FMI, 2024','eco'],
 ['México es el segundo país que más remesas recibe en el mundo, después de India.','Banco Mundial, 2024','eco'],
 ['En México, 99 de cada 100 empresas son micro, pequeñas o medianas.','INEGI','eco'],
 ['El mercado de divisas mueve más de 9 billones de dólares al día.','BPI, 2025','fin'],
 ['El dólar participa en casi 9 de cada 10 operaciones de divisas del mundo.','BPI, 2025','fin'],
 ['En Hungría, en 1946, los precios llegaron a duplicarse cada 15 horas: la peor hiperinflación registrada.','Universidad Johns Hopkins','fin'],
 ['Zimbabue imprimió en 2009 un billete de 100 billones de dólares zimbabuenses.','Banco de la Reserva de Zimbabue','fin'],
 ['El banco central más antiguo que sigue funcionando es el de Suecia, fundado en 1668.','Banco de Suecia','fin'],
 ['La primera bolsa de valores moderna nació en Ámsterdam en 1602.','Euronext Ámsterdam','fin'],
 ['Más del 80 % del comercio mundial, medido por volumen, viaja por mar.','UNCTAD','com'],
 ['China produce más de la mitad del acero del mundo.','Asociación Mundial del Acero, 2024','com'],
 ['Venezuela tiene las mayores reservas probadas de petróleo del planeta.','OPEP','com'],
 ['La agricultura usa cerca del 70 % del agua dulce que se extrae en el mundo.','FAO','nat'],
 ['Los océanos cubren alrededor del 71 % de la superficie de la Tierra.','NOAA','nat'],
 ['El río Amazonas aporta cerca de una quinta parte de toda el agua dulce que los ríos del mundo llevan al mar.','Enciclopedia Británica','nat'],
 ['Islandia genera casi toda su electricidad con energía hidroeléctrica y geotérmica.','Agencia Internacional de Energía','nat'],
 ['Rusia abarca 11 husos horarios.','Gobierno de Rusia','geo'],
 ['Canadá tiene la costa más larga del mundo: más de 200,000 km.','CIA World Factbook','geo'],
 ['El Estadio Azteca es el primero en recibir partidos de tres Copas del Mundo: 1970, 1986 y 2026.','FIFA','dep']];
const SB={i:-1,to:0};
function sbHTML(i){const f=SABIAS[i];return `<span class="cv-fl"><span>💡 </span><span>¿Sabías que…?</span></span><span class="cv-ft">${f[0]}</span><span class="cv-fs"><span>Fuente:</span><span>${f[1]}</span></span>`;}
function sbNext(c,step){const box=c&&c.querySelector('.cv-fact');if(!box)return;SB.i=(SB.i+(step||1)+SABIAS.length)%SABIAS.length;
  const put=()=>{box.innerHTML=sbHTML(SB.i);};if(DS.anim()&&typeof gsap!=='undefined'){gsap.to(box.children,{opacity:0,y:-4,duration:.18,onComplete:()=>{put();gsap.from(box.children,{opacity:0,y:6,duration:.32,stagger:.05,ease:'power2.out'});}});}else put();}
function sbTimer(c){clearInterval(SB.to);SB.to=setInterval(()=>{if(!CV.on||document.hidden){if(!CV.on)clearInterval(SB.to);return;}sbNext($('cover'));},9000);}
{const _ch=coverHTML;coverHTML=function(){const h=_ch();if(SB.i<0)SB.i=Math.floor(Math.random()*SABIAS.length);const k=h.indexOf('<div class="cv-act">');if(k<0)return h;
  const card=`<button class="cv-fact" id="cvFact" aria-live="polite">${sbHTML(SB.i)}</button>`;const e=k+'<div class="cv-act">'.length;let o=h.slice(0,e)+card+h.slice(e);
  const cr=`<p><b>¿Sabías que…?</b><br><span>Cada dato muestra su fuente: ONU, FMI, Banco Mundial, BPI, INEGI, FAO, NOAA y otras.</span></p><p><b>Animaciones</b><br><span>GSAP 3.15 (licencia estándar de GSAP, sin costo).</span></p>`;
  const j=o.indexOf('<button class="cv-b" id="cvCrX">');if(j>0)o=o.slice(0,j)+cr+o.slice(j);return o;};}
{const _cb=coverBind;coverBind=function(c){_cb(c);const f=c.querySelector('#cvFact');if(f){f.onclick=()=>{sbNext(c);sbTimer(c);};sbTimer(c);}};}
{const _hd=coverHide;coverHide=function(){clearInterval(SB.to);return _hd();};}

/* ---------- 4) sistema de diseño ----------
   Tokens: escala tipográfica (--fs-1…7), espaciado (--sp-1…5), radios, sombras y tiempos de movimiento.
   Color con psicología: superficies de lectura en tonos calmos; --act (cálido) solo para rellenar lo que actúa (+1 AÑO, botón
   principal, pestaña elegida); --gold es el acento de texto; --red solo para peligro o pérdidas. Cada tema cumple contraste AA
   (≥ 4.5:1 en texto normal; lo mide herramientas/contraste.js y dsContrast() en el juego). */
const DS_PAL={
 noche:{bg:'#0b1118',card:'#131b26',card2:'#1a2432',line:'#2a3647',ink:'#e8edf4',ink2:'#cbd5e1',mut:'#97a3b4',gold:'#f2c14e',act:'#f2c14e',actInk:'#1a1405',teal:'#45bfb1',red:'#f4737a',green:'#4cc873',blue:'#6aaef4',selBg:'#2b2410',selLine:'#7a5a10',well:'#0e151e',line2:'#283243',glass:'rgba(16,24,36,.96)'},
 deportivo:{bg:'#0a1a36',card:'#10244a',card2:'#163059',line:'#2b4a7e',ink:'#eef3fb',ink2:'#d4def0',mut:'#a6b8d6',gold:'#f6b93b',act:'#f6b93b',actInk:'#1a1405',teal:'#45cfdf',red:'#ff8a8f',green:'#5fd98a',blue:'#7cb8ff',selBg:'#2a2a1c',selLine:'#8a6a1a',well:'#0c1f42',line2:'#2c4c80',glass:'rgba(14,32,66,.96)'},
 claro:{bg:'#eef2f7',card:'#ffffff',card2:'#f4f6fa',line:'#d3dae4',ink:'#172033',ink2:'#2d3748',mut:'#56637a',gold:'#8a5a08',act:'#e8a530',actInk:'#1f1503',teal:'#156d66',red:'#b42323',green:'#226b45',blue:'#1f5ea8',selBg:'#fbf0da',selLine:'#e0b55c',well:'#eef2f7',line2:'#cbd5e0',glass:'rgba(255,255,255,.96)'},
 amigable:{bg:'#fff6ec',card:'#ffffff',card2:'#fff0e0',line:'#efd5bb',ink:'#3b2a1e',ink2:'#4a3626',mut:'#735640',gold:'#a14a00',act:'#f39237',actInk:'#2a1400',teal:'#1b7066',red:'#b02a3a',green:'#27713f',blue:'#2b62b5',selBg:'#ffe6cc',selLine:'#f0a560',well:'#fff3e6',line2:'#ecd2b8',glass:'rgba(255,255,255,.96)'},
 retro:{bg:'#040904',card:'#081208',card2:'#0d1c0d',line:'#1e4a1e',ink:'#b6f7ae',ink2:'#a4e89c',mut:'#68b861',gold:'#ffcc33',act:'#ffcc33',actInk:'#120d00',teal:'#4be0c0',red:'#ff6b6b',green:'#7dff6e',blue:'#6ec3ff',selBg:'#1c1a06',selLine:'#6e5a12',well:'#061006',line2:'#1b401b',glass:'rgba(6,16,6,.96)'},
 medieval:{bg:'#e8dbbd',card:'#f4ead2',card2:'#ecdfbf',line:'#c4ab7c',ink:'#3a2814',ink2:'#4a3620',mut:'#5f4a2f',gold:'#6e4204',act:'#c08a2c',actInk:'#1f1406',teal:'#2f5a4b',red:'#8e1f1f',green:'#35591f',blue:'#2c4f7c',selBg:'#e6cf9c',selLine:'#a8792a',well:'#efe2c4',line2:'#c9b183',glass:'rgba(244,234,210,.97)'},
 neon:{bg:'#09051a',card:'#120b28',card2:'#1a1036',line:'#3a2470',ink:'#f3edff',ink2:'#e2d8ff',mut:'#ad9dd9',gold:'#ff4fae',act:'#ff4fae',actInk:'#1a0010',teal:'#22e1ff',red:'#ff6b85',green:'#3dffb0',blue:'#22e1ff',selBg:'#2c0f33',selLine:'#a0306e',well:'#0d0820',line2:'#3c2775',glass:'rgba(18,11,40,.96)'}};
const DS={anim(){let m='auto';try{m=CFG.dsa||'auto';}catch(e){}if(m==='off'||typeof gsap==='undefined')return false;if(m==='on')return true;
    try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}
    try{if(typeof mapMode!=='undefined'&&mapMode&&mapMode!=='gl')return false;if(CFG.mfx===0)return false;}catch(e){}
    return (navigator.hardwareConcurrency||4)>2;},
  lite(){return !DS.anim();}};
(function(){const v=(k,t)=>`--bg:${t.bg};--card:${t.card};--card2:${t.card2};--line:${t.line};--ink:${t.ink};--ink2:${t.ink2};--mut:${t.mut};--gold:${t.gold};--act:${t.act};--act-ink:${t.actInk};--teal:${t.teal};--red:${t.red};--green:${t.green};--blue:${t.blue};--sel-bg:${t.selBg};--sel-line:${t.selLine};--well:${t.well};--line2:${t.line2};--glass:${t.glass}`;
  const pal=Object.entries(DS_PAL).map(([k,t])=>(k==='noche'?':root,html[data-theme=noche]':`html[data-theme=${k}]`)+`{${v(k,t)}}`).join('\n');
  const st=document.createElement('style');st.id='dscss';st.textContent=pal+`
:root{--fs-1:11px;--fs-2:12.5px;--fs-3:13.5px;--fs-4:15px;--fs-5:17px;--fs-6:20px;--fs-7:26px;--sp-1:4px;--sp-2:8px;--sp-3:12px;--sp-4:16px;--sp-5:24px;
 --r-s:9px;--r-m:12px;--r-l:16px;--r-p:999px;--sh-1:0 1px 2px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.12);--sh-2:0 10px 30px rgba(0,0,0,.35);
 --dur-1:.12s;--dur-2:.2s;--dur-3:.32s;--ease:cubic-bezier(.2,.8,.2,1);--tap:40px;--focus:var(--teal)}
html,body{font-size:var(--fs-4);line-height:1.45;-webkit-font-smoothing:antialiased}
.sheet h3{font-size:var(--fs-5);font-weight:800;letter-spacing:.1px}.modal h2{font-size:var(--fs-6);font-weight:800}
.sheet .hint,.hint{line-height:1.45}.sect{font-size:11.5px;letter-spacing:.08em;font-weight:700}
/* botones: tamaño mínimo de toque, estados claros (presionado, foco, desactivado) */
.btn,.item,.opt,.ntabs button,.vtabs button,.seg button,.chips button,.mkt button,.nav,#ageBtn,.cv-b,.mpa button,.pla button,.bt button{transition:background-color var(--dur-2) var(--ease),border-color var(--dur-2) var(--ease),color var(--dur-2) var(--ease),transform var(--dur-1) var(--ease),box-shadow var(--dur-2) var(--ease)}
.btn{min-height:38px;border-radius:var(--r-s);font-weight:600}
.btn:not(:disabled):active,.item:not(:disabled):active,.opt:active,.ntabs button:active,.vtabs button:active,.seg button:active,.chips button:active,.mkt button:active,.nav:active,.cv-b:active{transform:scale(.97)}
.btn.gold,.seg button.on,.vtabs button.on,.badge2{background:var(--act)!important;color:var(--act-ink)!important;border-color:var(--act)!important}
#ageBtn{background:var(--act);color:var(--act-ink);box-shadow:0 6px 20px color-mix(in srgb,var(--act) 30%,transparent)}
#clk button.on{background:var(--act)!important;color:var(--act-ink)!important}
.btn.red{border-color:var(--red);color:var(--red)}
.btn:disabled,.item:disabled,.opt:disabled,.nav:disabled{opacity:.45;filter:saturate(.6);cursor:not-allowed}
:where(button,[role=button],select,input,a):focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.item{min-height:48px}.item:not(:disabled):hover{border-color:var(--line2)}
.item .s,.item .r{color:var(--mut)}
/* pestañas: la elegida con fondo tenue y el acento; las demás sin ruido */
.ntabs button{min-height:34px;color:var(--mut)}.ntabs button.on{background:var(--sel-bg);color:var(--gold);border-color:var(--sel-line);box-shadow:inset 0 -2px 0 var(--act)}
.chips button.on{background:var(--sel-bg);border-color:var(--sel-line);color:var(--gold)}
.mkt button.on{border-color:var(--sel-line)}
.nav.on{box-shadow:inset 0 0 0 1px var(--sel-line)}
.card{box-shadow:var(--sh-1)}.modal,.sheet{box-shadow:var(--sh-2)}
.lg.bad{color:var(--red)}.lg.good{color:var(--green)}
/* tarjeta «¿Sabías que…?» de la portada */
.cv-fact{display:grid;gap:3px;width:100%;text-align:left;padding:10px 13px 9px;border-radius:var(--r-m);border:1px solid rgba(242,193,78,.35);background:rgba(10,16,24,.72);color:#e8eef6;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(0,0,0,.35);margin-bottom:2px;min-height:86px}
.cv-fl{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#f2c14e}.cv-ft{font-size:14px;line-height:1.38}.cv-fs{font-size:11.5px;color:#a9b6c6}.cv-fs span+span{margin-inline-start:.35em}html[lang^=zh] .cv-fs span+span,html[lang=ja] .cv-fs span+span{margin-inline-start:.1em}
.cv-planeta .cv-fact{border-color:rgba(120,190,255,.35)}.cv-planeta .cv-fl{color:#8fc8ff}.cv-mercados .cv-fact{border-color:rgba(76,200,115,.4)}.cv-mercados .cv-fl{color:#6be38f}
.cv-atlas .cv-fact{background:rgba(250,240,214,.86);border-color:#a8792a;color:#2c1d0b;box-shadow:0 4px 14px rgba(60,40,10,.25)}.cv-atlas .cv-fl{color:#7a4a06}.cv-atlas .cv-fs{color:#5f4a2f}
/* vista horizontal: el mapa ocupa el alto disponible (la ficha de abajo se desplaza por dentro) y la barra de abajo cabe completa */
body.land .app>.mapcard{display:flex;flex-direction:column;height:calc(100vh - var(--navh) - 16px);overflow:hidden}
body.land .app>.mapcard #mapWrap{flex:1 1 auto;height:auto!important;min-height:0}
body.land .app>.mapcard #selInfo{flex:0 1 auto;max-height:32%;overflow-y:auto;overscroll-behavior:contain}
body.land .bottom .in{grid-template-columns:repeat(5,minmax(92px,132px))!important;max-width:820px}
body.land .nav{white-space:nowrap;min-width:0}body.land .nav .badge{font-size:11.5px}
body.land #clk .seg button,body.land #clk button{padding-top:4px;padding-bottom:4px}
body.land .sheet{top:6px;border-radius:var(--r-l) 0 0 var(--r-l)}
@media (orientation:landscape) and (max-height:440px){body.land .bottom{padding-top:2px}body.land .nav{padding:5px 4px}body.land #ageBtn{padding:7px 4px}}
`;document.head.appendChild(st);})();
// contraste del tema activo (texto normal sobre tarjetas): lo usa la prueba y Ajustes → Tema
function dsLum(c){const m=String(c).match(/\d+(\.\d+)?/g);if(!m)return 0;const v=m.slice(0,3).map(x=>{x=+x/255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function dsRatio(a,b){const x=dsLum(a),y=dsLum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function dsColor(v){const d=document.createElement('i');d.style.color=v;document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c;}
function dsContrast(){const cs=getComputedStyle(document.documentElement);const g=k=>dsColor(cs.getPropertyValue(k).trim());const o={};let min=99;
  for(const f of ['--ink','--mut','--gold','--teal','--red','--green']){const r=Math.min(dsRatio(g(f),g('--card')),dsRatio(g(f),g('--card2')));o[f.slice(2)]=+r.toFixed(2);min=Math.min(min,r);}
  o.act=+dsRatio(g('--act-ink'),g('--act')).toFixed(2);min=Math.min(min,o.act);o.min=+min.toFixed(2);o.aa=min>=4.5;return o;}
{const _at=applyTheme;applyTheme=function(){_at();try{const mc=document.querySelector('meta[name=theme-color]');if(mc)mc.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();}catch(e){}};}
try{applyTheme();}catch(e){}

/* transiciones con GSAP: entrada de cada pantalla, cambio de pestaña y vista Personaje/País. Solo opacidad y desplazamiento,
   con clearProps al terminar (nada se queda escrito en el estilo); con «movimiento reducido», el modo ligero o el ajuste apagado, no corre. */
const DSA={k:null};
function dsKey(){const b=$('sheetIn');if(!b)return '';const h=b.querySelector('h3,h2');return (h?h.textContent.slice(0,40):'')+'|'+[...b.querySelectorAll('.ntabs button.on,.mkt button.on,.chips button.on,.pltabs button.on')].map(x=>x.textContent.trim()).join('/');}
function dsIn(els,o){if(!els||!els.length)return;try{gsap.killTweensOf(els);gsap.from(els,Object.assign({opacity:0,y:8,duration:.26,stagger:.022,ease:'power2.out',clearProps:'opacity,transform'},o||{}));}catch(e){}}
{const _os=openSheetRaw;openSheetRaw=function(h,b){const was=sheetIsOpen(),k0=DSA.k;const r=_os(h,b);try{const k1=dsKey();DSA.k=k1;if(!DS.anim())return r;const box=$('sheetIn');if(!box)return r;
    if(!was||k0==null||k0.split('|')[0]!==k1.split('|')[0])dsIn([...box.children].slice(0,12));
    else if(k0!==k1){const t=box.querySelector('.ntabs,.pltabs,.mkt');const after=[];let n=t?t.nextElementSibling:null;while(n&&after.length<10){after.push(n);n=n.nextElementSibling;}dsIn(after,{y:0,x:10,duration:.2,stagger:.015});}}catch(e){}return r;};}
{const _cl=closeSheet;closeSheet=function(){DSA.k=null;return _cl();};}
{const _rv=renderView;let lastV=null,lastT=null;renderView=function(){const r=_rv();try{if(DS.anim()&&VIEW&&(VIEW.v!==lastV||VIEW.tab!==lastT)&&lastV!=null){const c=$('viewPane')||document.querySelector('#viewTabs+*');if(c)dsIn([...c.children].slice(0,8),{y:6,duration:.22});}lastV=VIEW.v;lastT=VIEW.tab;}catch(e){}return r;};}

/* Ajustes → ✨ Animaciones de la interfaz (Automático / Sí / No) */
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b||b.querySelector('[data-dsa]'))return;const m=CFG.dsa||'auto';
  const lab={auto:'Automático',on:'Sí',off:'No'};const x=document.createElement('div');x.className='item';x.style.display='block';
  x.innerHTML=`<div class="t">✨ Animaciones de la interfaz</div><div class="s">Transiciones suaves al abrir pantallas y cambiar de pestaña. En automático se apagan con «reducir movimiento», el mapa ligero o un equipo de 2 núcleos.</div><div class="chips" style="margin-top:6px">${['auto','on','off'].map(k=>`<button data-dsa="${k}" class="${m===k?'on':''}">${lab[k]}</button>`).join('')}</div><div class="s" style="margin-top:4px">${DS.anim()?'Ahora: encendidas':'Ahora: apagadas'}</div>`;
  const ref=b.querySelector('#sMfx');(ref?ref.after(x):b.appendChild(x));x.querySelectorAll('[data-dsa]').forEach(y=>y.onclick=()=>{CFG.dsa=y.dataset.dsa;saveCfg();showSettings();});}catch(e){}};}

/* ---------- v2.2b — Prueba 2: estilo pixel integral (Ajustes → 🕹️ Estilo pixel) ----------
   CFG.pxui ('' = actual, 'p2' = pixel) pone html[data-px=p2]; los estilos están en style.css. html[data-pxf] activa además el pixelado
   de retratos, escudos, trofeos, logos y portadas (filtros SVG de ui_v16f_gx.js); se omite con el mapa ligero para no cargar equipos lentos.
   El mapa (map.js) se dibuja a 1 px por px CSS con escalado pixelado y fronteras del mismo grosor; la portada (ui_v19a.js), a 1/3 con tramado. */
/* ---------- v2.2c — tema Pixel con desbloqueo (locked / preview / unlocked) y modo desarrollador ----------
   Estado guardado en CFG.th.pixel (localStorage 'imperioCfg'): {st:'locked'|'preview'|'unlocked', pvEnd, pvLast, src}.
   · locked: el estilo Actual es el único disponible (es el predeterminado al iniciar por primera vez).
   · preview: vista previa de PXT.PV minutos, una vez cada PXT.CD horas; al vencer vuelve sola a 'locked' y a Actual.
   · unlocked: para siempre; thUnlock('pixel','compra'|'logro'|…) es el gancho para la tienda o los logros (sin ventajas de juego).
   Modo desarrollador/tester: CFG.devMode=1 (persistente) desbloquea el tema sin restricciones. Se activa tocando 5 veces
   el texto de versión al final de Ajustes, o abriendo el juego con ?devMode=1 en la dirección. pxOn() (map.js) se redefine aquí
   para que el tema bloqueado nunca se aplique aunque CFG.pxui siga en 'p2'. */
const PXT={PV:10,CD:20};
function thState(id){let t=CFG.th;if(!t||typeof t!=='object')t=CFG.th={};let x=t[id];
  if(!x||typeof x!=='object')x=t[id]={st:'locked',pvEnd:0,pvLast:0,src:''};
  if(!['locked','preview','unlocked'].includes(x.st))x.st='locked';
  if(x.st==='preview'&&!(x.pvEnd>Date.now())){x.st='locked';try{saveCfg();}catch(e){}}
  return x;}
function thUnlock(id,src){const x=thState(id);x.st='unlocked';x.src=src||'';x.pvEnd=0;saveCfg();if(id==='pixel')pxRefresh();return x;}
function pxDev(){try{const q=/[?&]devMode=(1|0)\b/.exec(location.search||'');if(q&&(+q[1])!==(+!!CFG.devMode)){CFG.devMode=+q[1];saveCfg();}}catch(e){}return !!CFG.devMode;}
function pxAccess(){if(pxDev())return 'unlocked';return thState('pixel').st;}
function pxPreviewLeft(){const x=thState('pixel');return Math.max(0,x.pvLast+PXT.CD*3600e3-Date.now());}
function pxPreview(){if(pxAccess()!=='locked')return true;if(pxPreviewLeft()>0)return false;const x=thState('pixel'),now=Date.now();
  x.st='preview';x.pvLast=now;x.pvEnd=now+PXT.PV*60e3;CFG.pxui='p2';saveCfg();pxRefresh();return true;}
pxOn=function(){try{return CFG.pxui==='p2'&&pxAccess()!=='locked';}catch(e){return false;}};
function pxRefresh(){pxUI();try{if(typeof navH==='function')setTimeout(navH,30);}catch(e){}try{if(mapReady){fitCanvas();refreshMap();}}catch(e){}try{if(typeof CV!=='undefined'&&CV.on)cvStart();}catch(e){}}
/* destello en 2 pasos al cambiar una cifra clave (dinero/PIB/tesoro en la barra de arriba; valores de la vista País) */
const PXFL={mo:null,raf:0,last:new Map(),sel:'.money .v,.money .y,.nst b'};
function pxFlashScan(){PXFL.raf=0;const now=new Map();document.querySelectorAll(PXFL.sel).forEach((el,i)=>{
  const lab=el.matches('.nst b')&&el.previousElementSibling?'n:'+el.previousElementSibling.textContent:'s'+i;
  let k=lab,j=0;while(now.has(k))k=lab+'#'+(++j);const v=el.textContent;now.set(k,v);const o=PXFL.last.get(k);
  if(o!=null&&o!==v){el.classList.remove('pxfl');void el.offsetWidth;el.classList.add('pxfl');}});PXFL.last=now;}
function pxFlashWatch(){const on=!!document.documentElement.dataset.pxa;
  if(on&&!PXFL.mo&&document.body&&typeof MutationObserver!=='undefined'){PXFL.mo=new MutationObserver(()=>{if(!PXFL.raf)PXFL.raf=requestAnimationFrame(pxFlashScan);});
    PXFL.mo.observe(document.body,{childList:true,subtree:true,characterData:true});pxFlashScan();}
  else if(!on&&PXFL.mo){PXFL.mo.disconnect();PXFL.mo=null;PXFL.last=new Map();}}
function pxUI(){const h=document.documentElement;if(pxOn()){h.dataset.px='p2';const lite=typeof mapMode!=='undefined'&&mapMode==='lite';if(!lite)h.dataset.pxf='1';else delete h.dataset.pxf;
  /* v2.2c: micro-animaciones (aparición escalonada y destello) solo fuera del modo ligero, sin «reducir movimiento» y con Animaciones ≠ No */
  let rm=false;try{rm=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}if(!lite&&!rm&&CFG.dsa!=='off')h.dataset.pxa='1';else delete h.dataset.pxa;}
  else{delete h.dataset.px;delete h.dataset.pxf;delete h.dataset.pxa;}try{pxFlashWatch();}catch(e){}}
function pxUISet(k){if(k==='p2'&&pxAccess()==='locked')return;CFG.pxui=k;saveCfg();pxRefresh();}
try{pxUI();}catch(e){}
/* al vencer la vista previa (o al apagar el modo desarrollador) se vuelve sola a Actual */
setInterval(()=>{try{const want=pxOn(),has=document.documentElement.dataset.px==='p2';if(want===has)return;pxRefresh();
  if(!want&&CFG.pxui==='p2')toast('🕹️ Terminó la vista previa','El estilo pixel volvió a Actual. Desbloquéalo para usarlo siempre.');}catch(e){}},5000);
{const _ss=showSettings;showSettings=function(){_ss();try{pxUI();const b=$('sheetIn');if(!b||b.querySelector('[data-pxui]'))return;
  const acc=pxAccess(),dev=pxDev(),m=pxOn()?'p2':'',x=document.createElement('div');x.className='item';x.style.display='block';x.id='cfPxUI';
  const th=thState('pixel'),cd=pxPreviewLeft();
  const st=acc==='unlocked'?(dev?'🛠️ desbloqueado (modo desarrollador)':'🔓 desbloqueado'):acc==='preview'?`⏳ vista previa: quedan ${Math.max(1,Math.ceil((th.pvEnd-Date.now())/60000))} min`:'🔒 bloqueado';
  x.innerHTML=`<div class="t">🕹️ Estilo pixel <span class="pxst">${st}</span></div><div class="s"><span>Toda la interfaz en pixel art: bordes 16-bit, botones que se hunden, barras en bloques, letra pixel, retratos y escudos pixelados.</span> <span>El mapa se dibuja a 1 px por punto y conserva el grosor de las fronteras.</span></div><div class="chips" style="margin-top:6px"><button data-pxui="" class="${m===''?'on':''}">Actual</button><button data-pxui="p2" class="${m==='p2'?'on':''}"${acc==='locked'?' disabled':''}>${acc==='locked'?'🔒 ':''}Pixel</button>${acc==='locked'?`<button data-pxpv${cd>0?' disabled':''}>${cd>0?`👁️ Otra vista previa en ${Math.ceil(cd/3600e3)} h`:`👁️ Probar ${PXT.PV} min`}</button>`:''}</div>`;
  const ref=b.querySelector('#sMfx');(ref?ref.after(x):b.insertBefore(x,b.querySelector('.item')||null));
  x.querySelectorAll('[data-pxui]').forEach(y=>y.onclick=()=>{pxUISet(y.dataset.pxui);showSettings();});
  const pv=x.querySelector('[data-pxpv]');if(pv)pv.onclick=()=>{if(pxPreview())toast('🕹️ Vista previa del estilo pixel',`Tienes ${PXT.PV} minutos para probarlo.`);showSettings();};
  /* texto de versión: 5 toques en menos de 3 s activan o apagan el modo desarrollador/tester (gratis, sin restricciones) */
  const v=document.createElement('div');v.className='s pxver';v.setAttribute('data-noi18n','');v.textContent=`ECONOMY v${VERSION} · interfaz v2.3d`+(dev?' · 🛠️ modo desarrollador':'');
  let n=0,t0=0;v.onclick=()=>{const now=Date.now();if(now-t0>3000)n=0;t0=now;if(++n<5)return;n=0;CFG.devMode=CFG.devMode?0:1;saveCfg();pxRefresh();
    toast(CFG.devMode?'🛠️ Modo desarrollador activado':'🛠️ Modo desarrollador apagado',CFG.devMode?'El estilo pixel queda desbloqueado para tus pruebas.':'Los temas vuelven a su estado normal (bloqueado, vista previa o desbloqueado).');showSettings();};
  b.appendChild(v);}catch(e){console.warn('v22c ajustes',e);}};}

