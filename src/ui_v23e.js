/* ===== v2.3e — interfaz: pestañas más simples, riel plegable y pantalla completa en horizontal, sensibilidad del mapa =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3), worker ni IndexedDB. En imperioCfg solo agrega campos nuevos y opcionales:
   CFG.rlc (1 = riel plegado), CFG.msens ('s'|'n'|'a') y CFG.minr (0 = sin inercia); sin ellos todo queda como antes.
   Se carga al final (después de ui_v23d.js).
   1) Pestañas (.ntabs, .mkt, .nwt) en una sola fila, sin relleno: la activa se marca con un trazo inferior; subpestañas (.chips, .tfs)
      más pequeñas; opciones (.seg, .vtabs) con un tinte leve y trazo. Si la fila no cabe, se desliza (sin barra) con un desvanecido a la
      derecha y la pestaña activa queda a la vista. La ⓘ de cada fila de pestañas queda sola, sin la etiqueta «Pestaña: …».
   2) Riel izquierdo en horizontal (html.v3m): flotante, semitransparente y angosto (64 px); se pliega (html.v3rc) a una burbuja con
      solo el botón dorado de avanzar y se abre al tocar ☰. El estado se recuerda.
   3) Pantalla completa: el mapa queda libre; zoom, paneles y barra superior se recolocan según el riel; hojas más compactas.
   4) Ajustes → «🖐️ Mapa: sensibilidad» (el manejo del mapa vive en map.js: umbral de toque, pellizco, doble toque e inercia).
   Textos nuevos traducidos a los 13 idiomas (b6p2/interfaz23_es.tsv + v23_<idioma>.tsv). */
(function(){const st=document.createElement('style');st.id='st23e';st.textContent=`
/* ---------- 1) pestañas: una fila, trazo en la activa ---------- */
body :is(.ntabs,.mkt,.nwt){position:relative;display:flex;flex-wrap:nowrap;gap:0;margin:2px 0 10px;padding:0;overflow-x:auto;overflow-y:hidden;border:0;border-bottom:1px solid var(--line);border-radius:0;background:none;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
body :is(.ntabs,.mkt,.nwt)::-webkit-scrollbar{display:none}
body :is(.ntabs,.mkt,.nwt) button{position:relative;flex:1 0 auto;min-height:42px;margin:0;padding:0 12px;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;color:var(--mut)!important;font-size:13px;font-weight:650;white-space:nowrap;transition:color .16s ease}
body :is(.ntabs,.mkt,.nwt) button::after{content:'';position:absolute;left:10px;right:10px;bottom:0;height:2px;border-radius:2px 2px 0 0;background:var(--act,var(--gold));opacity:0;transform:scaleX(.3);transition:transform .2s cubic-bezier(.2,.8,.2,1),opacity .16s ease;pointer-events:none}
body :is(.ntabs,.mkt,.nwt) button.on{color:var(--ink)!important}
body :is(.ntabs,.mkt,.nwt) button.on::after{opacity:1;transform:none}
body :is(.ntabs,.mkt,.nwt) button:not(.on):active{color:var(--ink)!important}
/* subpestañas: pequeñas y ligeras */
body .chips:not(.ivs){position:relative;gap:5px;margin:2px 0 8px;padding:1px 0 3px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
body .chips:not(.ivs) button{min-height:34px;padding:0 10px;border:1px solid var(--line);background:transparent;border-radius:999px;font-size:12px;font-weight:600;color:var(--mut)}
body .chips:not(.ivs) button.on{color:var(--ink);border-color:var(--act,var(--gold));background:color-mix(in srgb,var(--act,#f2c14e) 13%,transparent)}
body .tfs{position:relative;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;gap:3px}
body .tfs::-webkit-scrollbar,body .chips::-webkit-scrollbar{display:none}
body .tfs button{flex:none;min-height:32px;padding:0 9px;border-color:transparent;background:transparent;font-size:11.5px;color:var(--mut)}
body .tfs button.on{color:var(--ink);border-color:transparent;box-shadow:inset 0 -2px 0 var(--act,var(--gold))}
/* opciones (.seg) y Personaje/País (.vtabs): grupo con tinte leve, sin relleno pesado */
body :is(.seg,.vtabs){gap:2px;padding:2px;border:1px solid var(--line);border-radius:11px;background:var(--card2)}
body :is(.seg,.vtabs) button{min-height:40px;border:0!important;border-radius:9px;background:transparent!important;color:var(--mut)!important;box-shadow:none}
body :is(.seg,.vtabs) button.on{background:color-mix(in srgb,var(--act,#f2c14e) 17%,transparent)!important;color:var(--ink)!important;box-shadow:inset 0 -2px 0 var(--act,var(--gold))!important}
body .seg button.on.sell{background:color-mix(in srgb,var(--red,#f0565d) 18%,transparent)!important;box-shadow:inset 0 -2px 0 var(--red,#f0565d)!important}
body .seg button:disabled{opacity:.35}
/* la fila que no cabe: desvanecido a la derecha mientras quede algo por ver */
body .v3ov:not(.v3ve){-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 22px),transparent)}
/* ⓘ de la pestaña: solo el botón, discreto */
.ibrow{margin:-4px 0 4px;min-height:0}.ibrow>span:first-child{display:none!important}
@media (prefers-reduced-motion:reduce){body :is(.ntabs,.mkt,.nwt) button::after{transition:none}}
/* pixel: trazo de 4 px (ventana encendida), sin bisel en las pestañas */
html[data-px=p2] body :is(.ntabs,.mkt,.nwt){border-bottom:2px solid var(--px-edge)}
html[data-px=p2] body :is(.ntabs,.mkt,.nwt) button{border:0!important;clip-path:none;box-shadow:none!important;background:none!important;min-height:42px;padding:0 10px;font-family:var(--pxf);font-size:12px}
html[data-px=p2] body :is(.ntabs,.mkt,.nwt) button::after{display:none}
html[data-px=p2] body :is(.ntabs,.mkt,.nwt) button.on{color:var(--ink)!important;box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important}
html[data-px=p2] body :is(.ntabs,.mkt,.nwt) button:not(:disabled):active{transform:translateY(1px)!important;filter:none}
html[data-px=p2] body .chips:not(.ivs) button{min-height:36px;padding:0 8px;background:transparent;box-shadow:none!important}
html[data-px=p2] body .chips:not(.ivs) button.on{background:color-mix(in srgb,var(--c-lit,#ffd166) 14%,transparent);box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important}
html[data-px=p2] body :is(.seg,.vtabs){border:2px solid var(--px-edge);border-radius:0;padding:2px}
html[data-px=p2] body :is(.seg,.vtabs) button{clip-path:none;border:0!important;border-radius:0;min-height:40px;box-shadow:none!important}
html[data-px=p2] body :is(.seg,.vtabs) button.on{box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important}
html[data-px=p2] body .seg button.on.sell{box-shadow:inset 0 -4px 0 var(--red,#f0565d)!important}
html[data-px=p2] body .tfs button{clip-path:none;box-shadow:none!important;border:0!important;min-height:32px}
html[data-px=p2] body .tfs button.on{box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important}

/* ---------- 2) riel izquierdo en horizontal: flotante, angosto y plegable ---------- */
#v3rt{display:none}
html.v3m{--v3l:calc(80px + env(safe-area-inset-left));--v3zl:var(--v3l);--v3pl:var(--v3l)}
html.v3m.v3rc{--v3l:calc(8px + env(safe-area-inset-left));--v3zl:calc(70px + env(safe-area-inset-left));--v3pl:calc(70px + env(safe-area-inset-left))}
html.v3m body.land .bottom{top:var(--v3t);bottom:auto;left:calc(6px + env(safe-area-inset-left));right:auto;width:66px;height:auto;max-height:calc(100% - var(--v3t) - var(--v3bt));padding:5px!important;
 border:1px solid var(--line2,#2b3a4e)!important;border-radius:20px;background:rgba(10,14,20,.56)!important;box-shadow:0 6px 18px rgba(0,0,0,.28);overflow-x:hidden;overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain;
 transition:top .22s cubic-bezier(.2,.8,.2,1),width .2s cubic-bezier(.2,.8,.2,1),border-radius .2s ease}
@supports (background:color-mix(in srgb,red 50%,transparent)){html.v3m body.land .bottom{background:color-mix(in srgb,var(--bg) 58%,transparent)!important}}
html.v3m body.land .bottom::-webkit-scrollbar{display:none}
html.v3m body.land .bottom>.in{display:flex!important;flex-direction:column;align-items:stretch;gap:3px;height:auto;max-width:none!important}
html.v3m #v3rt{position:relative;display:flex;align-items:center;justify-content:center;flex:none;height:34px;border-radius:12px;color:var(--mut);font-size:16px;font-weight:800;line-height:1;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:color .15s,transform .15s}
html.v3m #v3rt::after{content:'';position:absolute;inset:-5px -5px 0}
html.v3m #v3rt:active{transform:scale(.92);color:var(--ink)}
html.v3m body.land .bottom .nav{position:relative;flex:none;width:100%;min-height:46px;padding:4px 0 3px!important;gap:2px;border:0!important;border-radius:12px;background:transparent!important;box-shadow:none!important;clip-path:none;
 font-size:9.5px;font-weight:700;letter-spacing:.01em;line-height:1.1;color:var(--ink2,var(--ink));white-space:nowrap;overflow:hidden;text-overflow:clip;animation:v3ein .18s cubic-bezier(.2,.8,.2,1)}
html.v3m body.land .bottom .nav .ic{font-size:20px;line-height:1;opacity:.95}
html.v3m body.land .bottom .nav .ic svg{width:21px;height:21px}
html.v3m body.land .bottom .nav:active{background:rgba(255,255,255,.08)!important;transform:scale(.95)}
html.v3m body.land .bottom .nav.on{box-shadow:inset 3px 0 0 var(--act,var(--gold))!important;color:var(--ink)}
html.v3m body.land .bottom .nav .badge{position:absolute;top:3px;right:5px;min-width:15px;height:15px;line-height:15px;padding:0 3px;border-radius:8px;background:var(--gold);color:#1a1405;font-size:9.5px;font-weight:800}
html.v3m body.land .bottom .nav .badge:empty{display:none}
html.v3m body.land #ageBtn{flex:none;width:100%;min-height:52px;margin:1px 0;padding:4px 2px;border-radius:15px;font-size:11px!important;font-weight:800;line-height:1.1;white-space:normal;letter-spacing:-.01em;overflow-wrap:anywhere;box-shadow:0 3px 10px rgba(0,0,0,.3)}
@keyframes v3ein{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
/* plegado: una burbuja con ☰ y el botón dorado, debajo de la burbuja Personaje */
html.v3m.v3rc body.land .bottom{top:calc(var(--v3t) + 50px);width:58px;padding:4px!important;border-radius:29px}
html.v3m.v3rc body.land .bottom .nav{display:none}
html.v3m.v3rc #v3rt{height:30px}
html.v3m.v3rc body.land #ageBtn{min-height:48px;border-radius:24px;font-size:10.5px!important}
/* lo que se apoya en el riel */
html.v3m body.land .app{left:var(--v3pl)}
html.v3m #mapWrap .zoom{left:var(--v3zl)}
html.v3m #mapWrap .mleg{left:calc(var(--v3zl) + 52px)}
html.v3m #mapWrap .zoom,html.v3m #mapWrap .mleg,html.v3m #v3top{transition:left .2s cubic-bezier(.2,.8,.2,1)}
html.v3m #mapWrap .mmodes>button.on{border-color:var(--act,var(--gold));box-shadow:inset 0 -2px 0 var(--act,var(--gold))}
/* pixel */
html[data-px=p2].v3m body.land .bottom{border:2px solid var(--px-edge)!important;border-radius:0;box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo),0 3px 0 var(--px-slab,rgba(0,0,0,.4))}
html[data-px=p2].v3m body.land .bottom .nav{font-size:8px;border-radius:0;background-image:none}
html[data-px=p2].v3m body.land .bottom .nav.on{box-shadow:inset 4px 0 0 var(--c-lit,var(--gold))!important}
html[data-px=p2].v3m body.land .bottom .nav .badge{border-radius:0;font-size:8px}
html[data-px=p2].v3m body.land #ageBtn{font-size:8px!important;line-height:1.35;border-radius:0}
html[data-px=p2].v3m #v3rt{border-radius:0;font-family:var(--pxf);font-size:12px}
html[data-px=p2].v3m body.land .bottom,html[data-px=p2].v3m #mapWrap .zoom,html[data-px=p2].v3m #v3top{transition:none}

/* ---------- 3) pantalla completa en horizontal: hojas compactas (la información importante sin desplazarse) ---------- */
html.v3m body.land .sheet h3{margin:0 0 6px;font-size:16px;line-height:1.25}
html.v3m body.land .sheet .item{padding-top:7px;padding-bottom:7px}
html.v3m body.land .sheet .hint{font-size:12px}
html.v3m body.land .sheet .card{margin-bottom:8px}
@media (prefers-reduced-motion:reduce){html.v3m body.land .bottom,html.v3m body.land .bottom .nav,html.v3m #mapWrap .zoom,html.v3m #v3top{transition:none!important;animation:none!important}}
`;document.head.appendChild(st);})();

/* ---------- 1) filas de pestañas: desvanecido si no caben y la activa a la vista ---------- */
const V3E_ROW='.ntabs,.mkt,.nwt,.chips:not(.ivs),.tfs';
function v3eEnd(r){r.classList.toggle('v3ve',r.scrollLeft+r.clientWidth>=r.scrollWidth-4);}
function v3eTabs(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll(V3E_ROW).forEach(r=>{if(!r.clientWidth)return;const ov=r.scrollWidth>r.clientWidth+2;r.classList.toggle('v3ov',ov);if(!ov)return;
  if(!r._v3e){r._v3e=1;r.addEventListener('scroll',()=>v3eEnd(r),{passive:true});
    const on=r.querySelector('button.on');if(on){const L=on.offsetLeft,R=L+on.offsetWidth;if(L<r.scrollLeft||R>r.scrollLeft+r.clientWidth)r.scrollLeft=Math.max(0,L-(r.clientWidth-on.offsetWidth)/2);}}
  v3eEnd(r);});}
let V3E_Q=0;function v3eScan(){if(V3E_Q)return;V3E_Q=requestAnimationFrame(()=>{V3E_Q=0;try{v3eTabs($('sheetIn'));v3eTabs(document.querySelector('.app'));v3eTabs(document.querySelector('.modal.on')||$('modal'));}catch(e){}});}
{const _os=openSheetRaw;openSheetRaw=function(){const r=_os.apply(this,arguments);v3eScan();return r;};}
{const _rv=renderView;renderView=function(){const r=_rv.apply(this,arguments);v3eScan();return r;};}
{const _sm=showModal;showModal=function(){const r=_sm.apply(this,arguments);v3eScan();return r;};}
addEventListener('resize',()=>v3eScan());

/* ---------- 2) riel plegable (solo se ve en el modo horizontal v3m) ---------- */
function v3eRailLbl(){const t=$('v3rt');if(!t)return;const c=document.documentElement.classList.contains('v3rc');const k=c?'1':'0';if(t._k===k)return;t._k=k;
  t.textContent=c?'☰':'‹';t.setAttribute('aria-label',c?'Abrir menú':'Plegar menú');t.setAttribute('aria-expanded',c?'false':'true');}
function v3eRailSet(c){document.documentElement.classList.toggle('v3rc',!!c);CFG.rlc=c?1:0;saveCfg();v3eRailLbl();
  setTimeout(()=>{try{if(typeof drawOverlay==='function'&&mapReady)drawOverlay();}catch(e){}},240);}
function v3eRail(){const inn=document.querySelector('.bottom>.in');if(!inn)return;if(!$('v3rt')){const t=document.createElement('div');t.id='v3rt';t.setAttribute('role','button');t.tabIndex=0;t.setAttribute('data-noi18n','');
    inn.insertBefore(t,inn.firstChild);const tog=e=>{e.stopPropagation();v3eRailSet(!document.documentElement.classList.contains('v3rc'));};t.onclick=tog;t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}};}
  document.documentElement.classList.toggle('v3rc',CFG.rlc===1);v3eRailLbl();}

/* ---------- 4) Ajustes → sensibilidad del mapa (CFG.msens, CFG.minr) ---------- */
function v3eSensSet(){const b=$('sheetIn');if(!b||b.querySelector('[data-v3ms]')||typeof mapSens!=='function')return;const S=mapSens();
  const x=document.createElement('div');x.className='item';x.style.display='block';x.dataset.v3ms='1';
  x.innerHTML=`<div class="t">🖐️ Mapa: sensibilidad</div><div class="s">Suave: hay que mover más el dedo para arrastrar (los toques se aciertan más). Ágil: el mapa responde antes y se desliza más al soltarlo.</div>
    <div class="seg">${[['s','Suave'],['n','Normal'],['a','Ágil']].map(([v,t])=>`<button data-v3mk="${v}" class="${S.k===v?'on':''}">${t}</button>`).join('')}</div>
    <div class="seg">${[[1,'Con inercia'],[0,'Sin inercia']].map(([v,t])=>`<button data-v3mi="${v}" class="${S.inr===v?'on':''}">${t}</button>`).join('')}</div>`;
  b.appendChild(x);
  x.querySelectorAll('[data-v3mk]').forEach(y=>y.onclick=()=>{CFG.msens=y.dataset.v3mk;saveCfg();x.querySelectorAll('[data-v3mk]').forEach(z=>z.classList.toggle('on',z===y));});
  x.querySelectorAll('[data-v3mi]').forEach(y=>y.onclick=()=>{CFG.minr=+y.dataset.v3mi;saveCfg();x.querySelectorAll('[data-v3mi]').forEach(z=>z.classList.toggle('on',z===y));});}
{const _ss=showSettings;showSettings=function(){const r=_ss.apply(this,arguments);try{v3eSensSet();}catch(e){console.warn('v23e ajustes',e);}v3eScan();return r;};}

try{v3eRail();}catch(e){console.warn('v23e riel',e);}
