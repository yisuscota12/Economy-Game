/* ===== v2.3d — interfaz: mapa a pantalla completa en horizontal, burbujas superiores, bolsa fuera de la pantalla principal =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB. Se carga al final (después de ui_v22f.js).
   Modo «v3m» = el riel horizontal de la v2.2f (html.rail: body.land y alto <= 520 px, iPhone en horizontal):
   1) Reloj (#clk) en una burbuja superior pequeña y semitransparente con el periodo actual; al tocarla se despliega (Día…5 años,
      fecha y avance automático) y se pliega sola al elegir o al tocar fuera.
   2) Arriba a la izquierda la burbuja «👤 Personaje» y a la derecha «🏛️ País»: cada una abre un panel con su vista (.app sin el mapa).
      Las capas del mapa (.mmodes) van en una tercera burbuja discreta en la esquina inferior derecha del mapa.
   3) El mapa ocupa toda la pantalla (la tarjeta del mapa sale de .app a <body>; el motor del mapa no cambia). Zoom en la esquina
      inferior izquierda; la ficha de provincia/ciudad (#cmdBar + #selInfo) flota como panel pequeño a la derecha y se minimiza.
   4) Noticias (#tick) en el margen superior, delgada; sin noticia nueva se reduce a un punto.
   5) La barra «Tu bolsa» (#mtick) sale de la pantalla principal: va dentro de la Bolsa. Ajustes → «📈 Activos en la pantalla
      principal» elige qué activos se ven en una burbuja pequeña (CFG.stk; por omisión ninguno).
   7) Botones con toque de 44 px, pestañas en una fila, barras de desplazamiento finas.
   Textos nuevos traducidos a los 13 idiomas (b6p2/interfaz23_es.tsv + v23_<idioma>.tsv). */
(function(){const st=document.createElement('style');st.id='st23d';st.textContent=`
:root{--v3g:rgba(12,18,26,.72)}
@supports (background:color-mix(in srgb,red 50%,transparent)){:root{--v3g:color-mix(in srgb,var(--glass,#0c121a) 74%,transparent)}}
/* --- 7) generales: toque de 44 px, barras finas, transiciones cortas --- */
*{scrollbar-width:thin;scrollbar-color:var(--line2,#2b3a4e) transparent}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--line2,#2b3a4e);border-radius:5px}
:is(.btn,.item,.ntabs button,.mkt button,.chips button,.mpb button,.nwt button,.vtabs button,.seg button,.tfs button,.pla button,#clk .in button){min-height:44px;touch-action:manipulation}
:is(.ntabs,.mkt,.chips){flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
:is(.ntabs,.mkt,.chips)::-webkit-scrollbar{display:none}
:is(.ntabs,.mkt) button{white-space:nowrap}
#mtick{display:none!important}
/* barra de cotizaciones dentro de la Bolsa */
.mtk{margin:2px 0 8px;border:1px solid var(--line);border-radius:10px;background:#070c12;overflow:hidden;white-space:nowrap;font:600 12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#d7dee8;position:relative;height:44px;cursor:pointer}
.mtk .lb{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;background:#0f5132;color:#d1fae5;font:800 10.5px system-ui;padding:0 9px;letter-spacing:.06em}
.mtk .rl{display:inline-block;padding:14px 0 0 100%;animation:tk 55s linear infinite}.mtk .rl span{margin-right:22px}.mtk .u{color:#3ccf8e}.mtk .d{color:#f0565d}.mtk .nw{color:#f2c14e}
@media (prefers-reduced-motion:reduce){.mtk .rl{animation:none;padding-left:120px}}
/* burbuja de activos elegidos (pantalla principal) */
#v3stk[hidden]{display:none!important}
.v3bb{position:relative;flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:18px;border:1px solid var(--line2,#2b3a4e);background:var(--v3g);color:var(--ink,#e8eef6);font-size:13px;font-weight:700;line-height:1;white-space:nowrap;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent;opacity:.88;box-shadow:0 2px 8px rgba(0,0,0,.22);transition:opacity .16s ease,transform .16s cubic-bezier(.2,.8,.2,1),background-color .16s ease}
.v3bb::after{content:'';position:absolute;inset:-4px -2px}
.v3bb:active{transform:scale(.95)}
.v3bb.on{opacity:1;background:var(--act,var(--gold));color:var(--act-ink,#1a1405);border-color:var(--act,var(--gold))}
.v3bb .v3n{min-width:18px;height:18px;line-height:18px;border-radius:9px;padding:0 4px;text-align:center;font-size:11px;background:#ff8a3d;color:#1a1004}
.v3bb .u{color:#3ccf8e}.v3bb .d{color:#f0565d}.v3bb small{font-size:11px;opacity:.75}
.app>#v3stk{margin:6px 0 0}
#v3stk .v3sl{position:absolute;top:42px;left:0;z-index:30;min-width:230px;max-height:60vh;overflow-y:auto;padding:6px;border-radius:14px;border:1px solid var(--line2,#2b3a4e);background:var(--glass,#0c121a);box-shadow:0 10px 26px rgba(0,0,0,.4);cursor:default;
 opacity:0;visibility:hidden;transform:translateY(-6px);pointer-events:none;transition:opacity .16s ease,transform .2s cubic-bezier(.2,.8,.2,1),visibility 0s linear .2s}
#v3stk.v3o .v3sl{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition-delay:0s}
#v3stk .v3sr{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;min-height:36px;padding:0 6px;font:600 12.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border-bottom:1px solid var(--line)}
#v3stk .v3sg{display:flex;align-items:center;justify-content:flex-end;min-height:44px;padding:0 6px;color:var(--gold);font-size:13px;cursor:pointer}
/* ajustes: lista de activos */
.v3sb .mpb{max-height:180px;overflow-y:auto}.v3sb .mpb button small{opacity:.7;font-weight:500}.v3sb .s2{margin:8px 0 2px;font-size:12px;font-weight:800;color:var(--mut)}
/* elementos del modo horizontal: ocultos fuera de él */
#v3top,html:not(.v3m) .v3cl,html:not(.v3m) .v3lt,html:not(.v3m) #v3sx{display:none}
@keyframes v3in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}

/* ===== modo horizontal v3m (iPhone en horizontal) ===== */
html.v3m{--v3l:calc(94px + env(safe-area-inset-left));--v3r:calc(8px + env(safe-area-inset-right));--v3t:calc(4px + env(safe-area-inset-top));--v3bt:calc(8px + env(safe-area-inset-bottom))}
html.v3m,html.v3m body{height:100%;overflow:hidden;overscroll-behavior:none}
html.v3m body::after{display:none}
/* 3) mapa a pantalla completa (la tarjeta del mapa vive en <body>) */
html.v3m body>.card.mapcard{position:fixed;z-index:4;top:calc(var(--v3t) + 50px);right:var(--v3r);bottom:calc(var(--v3bt) + 54px);left:auto;width:min(330px,38vw);height:auto!important;margin:0!important;padding:0!important;display:flex!important;flex-direction:column;gap:8px;background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;pointer-events:none;overflow:visible!important}
html.v3m body>.mapcard>#mapWrap{position:fixed!important;inset:0!important;left:0!important;top:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important;border-radius:0!important;border:0!important;margin:0!important;z-index:0;pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
html.v3m #mapWrap canvas,html.v3m #mapWrap svg{touch-action:none}
html.v3m #zFull{display:none!important}
html.v3m #mapWrap .zoom{position:absolute;left:var(--v3l);right:auto;top:auto;bottom:var(--v3bt);display:flex;flex-direction:column;gap:6px;z-index:3}
html.v3m #mapWrap .zoom button{width:44px;height:44px;min-height:44px;border-radius:12px;opacity:.78;background:var(--v3g);border:1px solid var(--line2,#2b3a4e);font-size:18px;color:var(--ink);transition:opacity .15s,transform .15s}
html.v3m #mapWrap .zoom button:active{opacity:1;transform:scale(.93)}
html.v3m #mapWrap .mleg{left:calc(var(--v3l) + 52px);right:auto;bottom:var(--v3bt);max-width:min(44vw,420px);opacity:.88;background:var(--v3g);border-color:var(--line2,#2b3a4e)}
/* capas del mapa: tercera burbuja discreta (esquina inferior derecha) */
html.v3m #mapWrap .mmodes{position:absolute;left:auto;top:auto;right:var(--v3r);bottom:var(--v3bt);width:auto;max-width:none;display:grid;grid-template-columns:repeat(6,44px);gap:5px;overflow:visible;padding:0;margin:0;background:none;border:0;pointer-events:none;z-index:3}
html.v3m #mapWrap .mmodes>button{width:44px;height:44px;min-height:44px;border-radius:12px;font-size:17px;background:var(--glass,#0c121a);opacity:0;visibility:hidden;transform:translateY(10px) scale(.9);pointer-events:none;transition:opacity .16s ease,transform .2s cubic-bezier(.2,.8,.2,1),visibility 0s linear .2s}
html.v3m #mapWrap .mmodes.v3o>button{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition-delay:0s}
html.v3m #mapWrap .mmodes>.v3lt{grid-column:6;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:22px;border:1px solid var(--line2,#2b3a4e);background:var(--v3g);color:var(--ink);font-size:17px;opacity:.82;cursor:pointer;pointer-events:auto;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:opacity .15s,transform .15s}
html.v3m #mapWrap .mmodes>.v3lt:active{transform:scale(.93)}
html.v3m #mapWrap .mmodes.v3o>.v3lt{opacity:1;border-color:var(--gold)}
/* ficha flotante: #cmdBar + #selInfo en una columna pequeña a la derecha */
html.v3m body>.mapcard>:is(#cmdBar,#selInfo){position:relative;z-index:1;pointer-events:auto;margin:0!important;min-height:0;overflow-y:auto!important;overscroll-behavior:contain;background:var(--glass,#0c121a);border:1px solid var(--line);border-radius:14px;padding:10px 12px;box-shadow:0 6px 18px rgba(0,0,0,.3);transition:opacity .18s ease,transform .2s cubic-bezier(.2,.8,.2,1),visibility 0s linear 0s}
html.v3m body>.mapcard>#cmdBar{flex:0 0 auto;max-height:38%}
html.v3m body>.mapcard>#selInfo{flex:0 1 auto;max-height:none!important}
html.v3m body>.mapcard>#selInfo:empty{display:none}
html.v3m.v3sm body>.mapcard>:is(#cmdBar,#selInfo),html.v3m body:has(#mapWrap .mpop) .mapcard>:is(#cmdBar,#selInfo,#v3sx){opacity:0;visibility:hidden;transform:translateX(18px);pointer-events:none;transition:opacity .18s ease,transform .2s cubic-bezier(.2,.8,.2,1),visibility 0s linear .2s}
html.v3m #v3sx{position:absolute;z-index:3;top:-10px;right:-6px;display:flex;align-items:center;justify-content:center;gap:5px;min-width:30px;height:30px;padding:0 8px;border-radius:15px;border:1px solid var(--line2,#2b3a4e);background:var(--glass,#0c121a);color:var(--ink);font-size:13px;font-weight:700;cursor:pointer;pointer-events:auto;user-select:none;-webkit-user-select:none;box-shadow:0 2px 8px rgba(0,0,0,.3);-webkit-tap-highlight-color:transparent}
html.v3m #v3sx::after{content:'';position:absolute;inset:-7px}
html.v3m #v3sx[hidden]{display:none}
html.v3m.v3sm #v3sx{top:0;right:0;height:36px;border-radius:18px;padding:0 12px;opacity:.88;background:var(--v3g);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* riel de la izquierda semitransparente sobre el mapa */
html.v3m body.land .bottom{z-index:10;background:rgba(10,14,20,.8)!important;border-right:1px solid var(--line2,#2b3a4e)}
@supports (background:color-mix(in srgb,red 50%,transparent)){html.v3m body.land .bottom{background:color-mix(in srgb,var(--bg) 80%,transparent)!important}}
/* barra superior: Personaje · reloj · noticias · activos · País */
html.v3m #v3top{position:fixed;z-index:12;top:var(--v3t);left:var(--v3l);right:var(--v3r);height:44px;display:flex;align-items:flex-start;gap:6px;pointer-events:none}
html.v3m #v3top>*{pointer-events:auto}
html.v3m #v3top>.v3bb{margin-top:4px}
html.v3m #v3pa{margin-left:auto}
html.v3m body.gmvida #v3pa{display:none}
html.v3m #v3stk .v3sl{left:auto;right:0}
/* 1) reloj en burbuja */
html.v3m #v3top #clk{position:relative!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:6px!important;margin:0!important;padding:4px 0 0!important;flex:none;border-radius:16px;max-width:calc(100vw - 200px)}
html.v3m #clk:not(.v3o)>:not(.v3cl){display:none!important}
html.v3m #clk.v3o{padding:4px 6px 6px!important;background:var(--glass,#0c121a);border:1px solid var(--line2,#2b3a4e);box-shadow:0 10px 26px rgba(0,0,0,.4)}
html.v3m #clk.v3o>:not(.v3cl){animation:v3in .18s cubic-bezier(.2,.8,.2,1)}
html.v3m #clk.v3o>.v3cl{opacity:1;border-color:var(--gold)}
html.v3m #clk .cirow{max-width:100%;flex-wrap:wrap}html.v3m #clk .ci{white-space:normal}
html.v3m #clk .in{flex-wrap:wrap;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
html.v3m #clk .in button{min-height:44px;padding:0 13px!important}
html.v3m #clk .ap button{min-height:36px;min-width:40px}
html.v3m .v3cl.run{box-shadow:0 0 0 2px var(--teal,#3ccf8e)}
/* 4) noticias: delgada y semitransparente; sin noticia nueva, un punto (el borde transparente da 44 px de toque) */
html.v3m #v3top #tick{flex:1 1 auto;min-width:0;height:44px;margin:0;border:9px solid transparent;background-clip:padding-box;background-color:var(--v3g);border-radius:22px;opacity:.85;transition:opacity .2s ease}
html.v3m #v3top #tick .lb{padding:5px 8px;font-size:10px;border-radius:13px 0 0 13px}
html.v3m #v3top #tick .rl{padding-top:5px}
html.v3m #v3top #tick.v3dot{flex:0 0 44px;width:44px;border-width:16px;border-radius:50%;background-color:var(--mut,#7b8794);opacity:.55}
html.v3m #v3top #tick.v3dot>*{display:none}
/* 2) paneles Personaje (izquierda) y País (derecha): .app sin el mapa */
html.v3m #viewTabs{display:none!important}
html.v3m body.land .app{position:fixed;z-index:14;top:calc(var(--v3t) + 46px);bottom:0;left:var(--v3l);right:auto;width:min(440px,52vw);max-width:none;margin:0;display:block!important;padding:8px 8px calc(12px + env(safe-area-inset-bottom))!important;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
 background:rgba(10,14,20,.9);border:1px solid var(--line2,#2b3a4e);border-bottom:0;border-radius:16px 16px 0 0;box-shadow:0 10px 30px rgba(0,0,0,.4);
 opacity:0;visibility:hidden;pointer-events:none;transform:translateX(-18px);transition:opacity .18s ease,transform .22s cubic-bezier(.2,.8,.2,1),visibility 0s linear .22s}
@supports (background:color-mix(in srgb,red 50%,transparent)){html.v3m body.land .app{background:color-mix(in srgb,var(--bg) 92%,transparent)}}
html.v3m.v3pr body.land .app{left:auto;right:var(--v3r);transform:translateX(18px)}
html.v3m.v3p body.land .app{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition-delay:0s}
html.v3m body.land .app>.card{margin-left:0;margin-right:0}
/* 8) hojas y ventanas en horizontal */
html.v3m body.land .sheet{top:0!important;bottom:0;right:0;left:auto;width:min(540px,60vw);max-height:none!important;padding:calc(10px + env(safe-area-inset-top)) calc(12px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) 14px;overscroll-behavior:contain}
html.v3m body.land .modal{max-height:calc(100vh - 16px)!important;max-height:calc(100dvh - 16px)!important;overscroll-behavior:contain}
html.v3m #mnx{left:50%;bottom:var(--v3bt);translate:-50% 0;max-width:40vw}
html.v3m .ff{display:none}
/* pixel (html[data-px=p2]) */
html[data-px=p2] .v3bb,html[data-px=p2].v3m #mapWrap .mmodes>.v3lt,html[data-px=p2].v3m #v3sx{border-radius:0;border:2px solid var(--px-edge);font-family:var(--pxf);box-shadow:inset 2px 2px 0 var(--px-hi),inset 0 -3px 0 var(--px-lo);transition:transform 60ms steps(2,end)}
html[data-px=p2].v3m #v3top #tick{border-radius:0}html[data-px=p2].v3m #v3top #tick.v3dot{border-radius:0}
html[data-px=p2].v3m #clk.v3o,html[data-px=p2].v3m body.land .app,html[data-px=p2] #v3stk .v3sl{border-radius:0;border:2px solid var(--px-edge);box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo),0 3px 0 var(--px-slab,rgba(0,0,0,.4))}
@media (prefers-reduced-motion:reduce){.v3bb,#v3stk .v3sl,html.v3m body.land .app,html.v3m #mapWrap .mmodes>button,html.v3m body>.mapcard>:is(#cmdBar,#selInfo){transition:none!important}html.v3m #clk.v3o>*{animation:none!important}}
`;document.head.appendChild(st);})();

const V3={on:false,mk:{},mc:null,nk:null,nw:null,nt:0,sel:undefined,sx:null};
const v3E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const v3H=()=>document.documentElement;

/* ---------- barra superior y cambio de modo ---------- */
function v3Bubble(id,v){const b=document.createElement('div');b.className='v3bb';b.id=id;b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('data-noi18n','');
  const go=e=>{e.stopPropagation();v3Open(v);};b.onclick=go;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go(e);}};return b;}
function v3Top(){let t=$('v3top');if(t)return t;t=document.createElement('div');t.id='v3top';
  t.appendChild(v3Bubble('v3pj','pj'));t.appendChild(v3Bubble('v3pa','pa'));document.body.appendChild(t);v3Bub();return t;}
function v3Mark(el,k){if(V3.mk[k]&&V3.mk[k].parentNode)return;const c=document.createComment('v23d:'+k);el.parentNode.insertBefore(c,el);V3.mk[k]=c;}
function v3MapCard(){const w=$('mapWrap');return V3.mc||(w?w.closest('.card'):null);}
function v3Place(){const s=$('v3stk');
  if(!V3.on){if(s){const tk=$('tick'),vt=$('viewTabs');const ref=tk||vt;if(ref&&ref.parentNode&&ref.nextSibling!==s)ref.parentNode.insertBefore(s,ref.nextSibling);}return;}
  const t=v3Top(),pa=$('v3pa');
  const clk=$('clk');if(clk&&clk.parentNode!==t){v3Mark(clk,'clk');t.insertBefore(clk,$('v3pj').nextSibling);v3ClkPrep(clk);}
  const tk=$('tick');if(tk&&tk.parentNode!==t){v3Mark(tk,'tick');t.insertBefore(tk,s&&s.parentNode===t?s:pa);v3NewsPrep(tk);}
  if(s&&s.parentNode!==t)t.insertBefore(s,pa);
  const mc=v3MapCard();if(mc&&mc.parentNode!==document.body){V3.mc=mc;v3Mark(mc,'map');document.body.insertBefore(mc,document.body.firstChild);}
  v3SxPrep(mc);v3LayPrep();}
function v3Restore(){for(const k of ['map','tick','clk']){const c=V3.mk[k];const el=k==='map'?V3.mc:$(k);if(c&&c.parentNode&&el&&c.previousSibling!==el)c.parentNode.insertBefore(el,c);}
  const clk=$('clk');if(clk)clk.classList.remove('v3o');const mm=document.querySelector('#mapWrap .mmodes');if(mm)mm.classList.remove('v3o');v3Place();}
function v3Fit(){setTimeout(()=>{try{if(mapReady){fitCanvas();setVB();drawOverlay();}}catch(e){}},40);}
function v3Mode(){const on=v3H().classList.contains('rail');if(on===V3.on){if(on)v3Place();return;}V3.on=on;const h=v3H();
  if(on){h.classList.add('v3m','v3sm');document.body.classList.remove('mapfull');v3Place();}
  else{h.classList.remove('v3m','v3p','v3pl','v3pr','v3sm');v3Restore();}
  try{v3Labels();}catch(e){}v3Fit();}
{const _ru=railUpdate;railUpdate=function(){const r=_ru.apply(this,arguments);try{v3Mode();}catch(e){console.warn('v23d modo',e);}return r;};}

/* ---------- 2) paneles Personaje / País ---------- */
function v3Bub(){const h=v3H(),open=h.classList.contains('v3p');const a=$('v3pj'),b=$('v3pa');const v=typeof VIEW!=='undefined'?VIEW.v:'pj';
  if(a){a.classList.toggle('on',open&&v!=='pa');a.setAttribute('aria-expanded',open&&v!=='pa'?'true':'false');}
  if(b){b.classList.toggle('on',open&&v==='pa');b.setAttribute('aria-expanded',open&&v==='pa'?'true':'false');}}
function v3Show(v){const h=v3H();h.classList.add('v3p');h.classList.toggle('v3pl',v!=='pa');h.classList.toggle('v3pr',v==='pa');const a=document.querySelector('.app');if(a)a.scrollTop=0;v3Bub();}
function v3Open(v){if(!P||!G)return;const h=v3H();if(h.classList.contains('v3p')&&VIEW.v===v){v3Close();return;}
  V3.busy=1;try{if(VIEW.v!==v)setView(v);}finally{V3.busy=0;}v3Show(v);}
function v3Close(){v3H().classList.remove('v3p');v3Bub();}
// cualquier otro camino a la vista País o Personaje (p. ej. «Ver tu país» en la ficha del lugar) abre su panel en horizontal
{const _sv=setView;setView=function(v){const r=_sv.apply(this,arguments);try{if(V3.on&&!V3.busy)v3Show(v);else v3Bub();}catch(e){}return r;};}
function v3Labels(){const L=(v,id)=>{const s=document.querySelector(`#viewTabs button[data-v="${v}"]`),b=$(id);if(s&&b&&b._h!==s.innerHTML){b._h=s.innerHTML;b.innerHTML=s.innerHTML;}};L('pj','v3pj');L('pa','v3pa');}

/* ---------- 1) reloj en burbuja ---------- */
function v3ClkClose(){const c=$('clk');if(c&&c.classList.contains('v3o')){c.classList.remove('v3o');const b=c.querySelector('.v3cl');if(b)b.setAttribute('aria-expanded','false');}}
function v3ClkPrep(c){if(c.querySelector('.v3cl'))return;const b=document.createElement('div');b.className='v3bb v3cl';b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-expanded','false');b.setAttribute('data-noi18n','');
  c.insertBefore(b,c.firstChild);const tog=e=>{e.stopPropagation();const o=!c.classList.contains('v3o');c.classList.toggle('v3o',o);b.setAttribute('aria-expanded',o?'true':'false');};
  b.onclick=tog;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}};
  c.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.in button'))setTimeout(v3ClkClose,0);},true);v3ClkLbl();}
function v3ClkLbl(){const b=document.querySelector('#clk .v3cl');if(!b)return;const on=document.querySelector('#clk .in button.on');const n=P&&P.alive&&P.dq?P.dq.length:0;const run=typeof AUTO!=='undefined'&&AUTO&&AUTO.on;
  const t=on?on.textContent.trim():'';const k=t+'|'+n+'|'+run;if(b._k===k)return;b._k=k;
  b.innerHTML=`<span aria-hidden="true">⏱</span><span>${v3E(t)}</span>${n?`<span class="v3n">${n}</span>`:''}`;b.classList.toggle('run',!!run);}
{const _c=clockUI;clockUI=function(){const r=_c.apply(this,arguments);try{v3ClkLbl();}catch(e){}return r;};}
if(typeof autoUI==='function'){const _a=autoUI;autoUI=function(){const r=_a.apply(this,arguments);try{v3ClkLbl();}catch(e){}return r;};}

/* ---------- 4) noticias: delgada; un punto si no hay noticia nueva ---------- */
function v3NewsKey(){const L=(G&&G.nw)||[];const x=L[L.length-1];return x?[x.y,x.d,x.t].join('|'):'';}
function v3NewsPrep(t){if(t._v3)return;t._v3=1;t.addEventListener('click',()=>{V3.nk=v3NewsKey();t.classList.add('v3dot');},true);}
function v3News(){const t=$('tick');if(!t||!G)return;v3NewsPrep(t);const k=v3NewsKey();if(V3.nk==null)V3.nk=k;const nw=k!==V3.nk;t.classList.toggle('v3dot',!nw);
  if(nw&&V3.nw!==k){V3.nw=k;clearTimeout(V3.nt);V3.nt=setTimeout(()=>{V3.nk=k;const e=$('tick');if(e)e.classList.add('v3dot');},18000);}}
{const _t=tickerUI;tickerUI=function(){const r=_t.apply(this,arguments);try{v3News();}catch(e){}return r;};}

/* ---------- 3) capas del mapa: tercera burbuja ---------- */
function v3LayClose(){const mm=document.querySelector('#mapWrap .mmodes');if(mm&&mm.classList.contains('v3o')){mm.classList.remove('v3o');const t=mm.querySelector('.v3lt');if(t)t.setAttribute('aria-expanded','false');}}
function v3LayPrep(){const mm=document.querySelector('#mapWrap .mmodes');if(!mm||mm.querySelector('.v3lt'))return;const t=document.createElement('div');t.className='v3lt';t.setAttribute('role','button');t.tabIndex=0;
  t.setAttribute('aria-label','Capas del mapa');t.setAttribute('aria-expanded','false');t.setAttribute('data-noi18n','');mm.appendChild(t);
  const tog=e=>{e.stopPropagation();const o=!mm.classList.contains('v3o');mm.classList.toggle('v3o',o);t.setAttribute('aria-expanded',o?'true':'false');};
  t.addEventListener('click',tog);t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}};
  // los botones de modo detienen la propagación: se escucha en captura para plegar después de elegir
  mm.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))setTimeout(v3LayClose,0);},true);v3LayLbl();}
function v3LayLbl(){const t=document.querySelector('#mapWrap .mmodes .v3lt');if(!t)return;const b=document.querySelector('#mapWrap .mmodes button.on');const h=b?b.innerHTML:'🗺️';if(t._h!==h){t._h=h;t.innerHTML=h;}}
{const _sm=setMapMode;setMapMode=function(){const r=_sm.apply(this,arguments);try{v3LayLbl();}catch(e){}return r;};}

/* ---------- 3) ficha flotante: minimizar y volver a abrir ---------- */
function v3SxPrep(mc){if(!mc||$('v3sx'))return;const x=document.createElement('div');x.id='v3sx';x.setAttribute('role','button');x.tabIndex=0;x.setAttribute('data-noi18n','');
  mc.insertBefore(x,mc.firstChild);const tog=e=>{e.stopPropagation();v3H().classList.toggle('v3sm');v3SxLbl();};x.onclick=tog;x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}};v3SxLbl();}
function v3SxLbl(){const x=$('v3sx');if(!x)return;const min=v3H().classList.contains('v3sm');const cb=$('cmdBar');const cmd=!!(cb&&cb.style.display!=='none'&&cb.innerHTML);
  const has=!!(G&&G.sel&&typeof RG!=='undefined'&&RG[G.sel]);x.hidden=!has&&!cmd;
  const k=min+'|'+(has?G.sel:'');if(x._k===k)return;x._k=k;
  if(min){x.innerHTML=`<span aria-hidden="true">📍</span><span>${has?v3E(RG[G.sel].nm):''}</span>`;x.setAttribute('aria-label',has?RG[G.sel].nm:'');x.setAttribute('aria-expanded','false');}
  else{x.innerHTML='<span aria-hidden="true">✕</span>';x.setAttribute('aria-label','Cerrar');x.setAttribute('aria-expanded','true');}}
// al tocar una provincia en el mapa la ficha vuelve a abrirse
if(typeof onMapPick==='function'){const _p=onMapPick;onMapPick=function(){const r=_p.apply(this,arguments);try{if(V3.on){v3H().classList.remove('v3sm');v3SxLbl();}}catch(e){}return r;};}
{const _rs=renderSel;renderSel=function(){const r=_rs.apply(this,arguments);try{const s=G&&G.sel||null;if(V3.sel!==undefined&&s!==V3.sel&&V3.on)v3H().classList.remove('v3sm');V3.sel=s;v3SxLbl();}catch(e){}return r;};}

/* ---------- 5) bolsa: barra dentro de la Bolsa y burbuja de activos elegidos ---------- */
function v3MtkFill(t){if(!G||!G.mk||!P)return;const it=tkItems();const tfl=(CFG.mt==='fx'||CFG.mt==='cm')&&(CFG.mtf==='d'||CFG.mtf==='s')?'1 mes':MTF[CFG.mtf];const key=it.join('')+CFG.mt+CFG.mtf;if(t._k===key)return;t._k=key;
  t.innerHTML=`<div class="lb">${MT[CFG.mt].toUpperCase()} · ${tfl}</div><div class="rl">${it.join('')}</div>`;}
function v3MtkSheet(){const b=$('sheetIn');if(!b||!G||!G.mk||!P)return;let t=b.querySelector('#mtickS');
  if(!t){t=document.createElement('div');t.id='mtickS';t.className='mtk';t.setAttribute('role','button');t.onclick=showTickCfg;const h=b.querySelector('h3');if(h)h.after(t);else b.prepend(t);}v3MtkFill(t);}
{const _sm=showMarket;showMarket=function(){const r=_sm.apply(this,arguments);try{v3MtkSheet();}catch(e){console.warn('v23d bolsa',e);}return r;};}
// la barra de la pantalla principal ya no se dibuja (antes #mtick debajo de las noticias): solo la de la Bolsa y la burbuja
{const _mt=mtickUI;mtickUI=function(){try{const o=$('mtick');if(o)o.remove();}catch(e){}try{v3StkUI();}catch(e){}try{const s=$('mtickS');if(s)v3MtkFill(s);}catch(e){}};void _mt;}
function v3StkIds(){return Array.isArray(CFG.stk)?CFG.stk.filter(x=>typeof x==='string'&&x):[];}
function v3StkRow(id){const M=G.mk,tf=CFG.mtf||'d';
  if(id.slice(0,3)==='ix:'){const x=id.slice(3);if(!M.X[x]||typeof EXCH0==='undefined'||!EXCH0[x])return null;return {n:EXCH0[x].ix,v:lvF(M.X[x].lv),c:tkChg(x,tf)};}
  const c=M.C[id];if(!c||c.dead)return null;return {n:id,v:fmtPx(c.p,coCur(id)),c:tkChg(id,tf)};}
function v3StkClose(){const b=$('v3stk');if(b)b.classList.remove('v3o');}
function v3StkUI(){let b=$('v3stk');const ids=v3StkIds();if(!G||!G.mk||!P||!ids.length){if(b){b.hidden=true;b.classList.remove('v3o');}return;}
  if(!b){b=document.createElement('div');b.id='v3stk';b.className='v3bb';b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('data-noi18n','');
    b.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest&&e.target.closest('.v3sl')){v3StkClose();showMarket('mk');return;}b.classList.toggle('v3o');});
    b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.classList.toggle('v3o');}};const ref=$('tick')||$('viewTabs');if(ref)ref.parentNode.insertBefore(b,ref.nextSibling);else document.body.appendChild(b);v3Place();}
  const R=[];for(const id of ids){try{const x=v3StkRow(id);if(x&&isFinite(x.c))R.push(x);}catch(e){}}
  if(!R.length){b.hidden=true;return;}b.hidden=false;
  const ch=x=>`<b class="${x.c>=0?'u':'d'}">${x.c>=0?'▲':'▼'}${Math.abs(x.c*100).toFixed(2)}%</b>`;const f=R[0];
  const h=`<span aria-hidden="true">📈</span><span>${v3E(f.n)}</span>${ch(f)}${R.length>1?`<small>+${R.length-1}</small>`:''}<div class="v3sl">${R.map(x=>`<div class="v3sr"><span>${v3E(x.n)}</span><span>${x.v}</span>${ch(x)}</div>`).join('')}<div class="v3sg">Abrir la Bolsa ›</div></div>`;
  if(b._h!==h){b._h=h;b.innerHTML=h;}}
// Ajustes → lista de activos (los que ya existen en la bolsa) para la burbuja de la pantalla principal; por omisión ninguno
const V3_STK_MAX=8;
function v3StkSet(box){if(!G||!G.mk||!P||typeof EXCH0==='undefined'){box.innerHTML='<div class="hint">Empieza o carga una partida para elegir activos.</div>';return;}
  const M=G.mk,sel=new Set(v3StkIds());const ex=V3.sx&&EXCH0[V3.sx]&&M.X[V3.sx]?V3.sx:homeEx();
  const chip=(id,h)=>`<button data-v3a="${v3E(id)}" class="${sel.has(id)?'on':''}">${h}</button>`;
  const cos=Object.keys(M.C).filter(id=>M.C[id].x===ex&&!M.C[id].dead).sort((a,b)=>M.C[b].p*M.C[b].sh-M.C[a].p*M.C[a].sh);
  box.innerHTML=`<div class="s2">Índices</div><div class="mpb">${Object.keys(EXCH0).filter(x=>M.X[x]).map(x=>chip('ix:'+x,`${flag(EXCH0[x].n,13)} ${v3E(EXCH0[x].ix)}`)).join('')}</div>
    <div class="s2">Empresas</div><div class="chips">${Object.keys(EXCH0).filter(x=>M.X[x]).map(q=>`<button data-v3x="${q}" class="${q===ex?'on':''}">${flag(EXCH0[q].n,13)} ${v3E(EXCH0[q].ix)}</button>`).join('')}</div>
    <div class="mpb">${cos.map(id=>chip(id,`${v3E(id)} <small>${v3E(M.C[id].nm)}</small>`)).join('')}</div>
    <div class="mpb"><button data-v3a="">✕ Ninguno</button></div>`;
  box.querySelectorAll('[data-v3x]').forEach(x=>x.onclick=()=>{V3.sx=x.dataset.v3x;v3StkSet(box);});
  box.querySelectorAll('[data-v3a]').forEach(x=>x.onclick=()=>{const id=x.dataset.v3a;let L=v3StkIds();
    if(!id)L=[];else if(L.includes(id))L=L.filter(y=>y!==id);else{if(L.length>=V3_STK_MAX){toast('📈',`Máximo ${V3_STK_MAX} activos.`);return;}L.push(id);}
    CFG.stk=L;saveCfg();if(!id)box.querySelectorAll('[data-v3a].on').forEach(y=>y.classList.remove('on'));else x.classList.toggle('on',L.includes(id));try{v3StkUI();}catch(e){}});}
{const _ss=showSettings;showSettings=function(){_ss.apply(this,arguments);try{const b=$('sheetIn');if(!b||b.querySelector('[data-v3stk]'))return;
  const x=document.createElement('div');x.className='item';x.style.display='block';x.dataset.v3stk='1';
  x.innerHTML='<div class="t">📈 Activos en la pantalla principal</div><div class="s">Elige qué activos de la bolsa se ven en una burbuja pequeña en la pantalla principal. Por omisión, ninguno. La barra completa de cotizaciones está dentro de la Bolsa.</div><div class="v3sb"></div>';
  b.appendChild(x);v3StkSet(x.querySelector('.v3sb'));}catch(e){console.warn('v23d ajustes',e);}};}

/* ---------- 6) pestaña de ciudad: la vista pixel se abre desde aquí (un solo acceso «🏙️ Ciudad» en la ficha) ---------- */
{const _sp=showPlace;showPlace=function(){const r=_sp.apply(this,arguments);try{v3PlPx();}catch(e){}return r;};}
function v3PlPx(){if(PL.tab!=='ci'||CFG.px3===0||typeof ctyShow!=='function'||PL.city==null)return;const b=$('sheetIn');const pa=b&&b.querySelector('.plcy .pla');if(!pa||pa.querySelector('[data-v3px]'))return;
  const rid=PL.rid,ci=PL.city;const x=document.createElement('button');x.dataset.v3px='1';x.innerHTML='<i>🧱</i><span>Vista pixel</span>';x.onclick=()=>ctyShow(rid,ci);pa.appendChild(x);}

/* ---------- cierre al tocar fuera y redibujo ---------- */
document.addEventListener('pointerdown',e=>{const t=e.target;if(!t||!t.closest)return;
  if(!t.closest('#clk'))v3ClkClose();if(!t.closest('.mmodes'))v3LayClose();if(!t.closest('#v3stk'))v3StkClose();
  if(V3.on&&v3H().classList.contains('v3p')&&t.closest('#mapWrap'))v3Close();},true);
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{v3Place();v3Labels();v3Bub();v3ClkLbl();v3SxLbl();v3LayLbl();}catch(e){console.warn('v23d',e);}return r;};}
try{v3Mode();}catch(e){console.warn('v23d inicio',e);}
