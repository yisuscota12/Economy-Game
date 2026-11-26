/* ===== v2.5o — interfaz: portada «Facetas», riel unido con periodos de tiempo, plegado con solo «avanzar» y gotas más vivas =====
   Solo interfaz: no toca reglas, motor, guardado (imperioVida_v3), worker ni IndexedDB. En imperioCfg solo el campo opcional
   CFG.cv6 (1 = ya se mostró una vez la portada nueva como estilo elegido). Se carga al final (después de ui_v25k.js).
   1) Portada «🔷 Facetas»: fondo azul con facetas geométricas claras (SVG fijo, sin canvas ni imagen) y el logo ECONOMY en
      blanco y grueso. Es un estilo más de la portada de la v1.9a (mismos botones y flujo de inicio); queda elegido la primera vez.
   2) Riel izquierdo (horizontal, html.v3m): una sola barra de cristal con separadores finos; Acciones, Carrera, Nación y Más en
      una rejilla de 2×2, debajo los periodos y al final el botón de avanzar, integrado en la barra.
   3) Plegado (html.v3rc): solo queda el botón de avanzar arriba a la izquierda, donde empezaba el riel, con una pestaña «›»
      pegada para volver a abrirlo.
   4) Periodos en el riel: Hora, Día, Semana, Mes, Año y 5 años (los mismos del reloj #clk, CFG.tu); tocar uno lo elige y el
      botón de avanzar usa ese periodo.
   5) Medidas: el riel, la barra superior (Personaje, reloj, noticias, País), el zoom, la leyenda y el panel se apoyan en las
      mismas variables (--v3l, --v3zl, --v3pl) para no encimarse; toques de 44 px; safe-area con env().
   6) Gotas más vivas: el cristal de ui_v25b.js toma el matiz del tema (--act), más brillo y reflejo; sin desenfoque nuevo
      (el riel unido incluso quita el de cada botón). En el modo ligero (html.v4lt) sin brillos extra. */
(function(){const st=document.createElement('style');st.id='st25o';st.textContent=`
/* ---------- 6) gotas más vivas: matiz del tema, más brillo, reflejo marcado ---------- */
:root{--v5rim:rgba(255,255,255,.38);--v5gb:rgba(18,40,70,.5);
 --v5gr:radial-gradient(120% 110% at 30% 10%,rgba(255,255,255,.46),rgba(255,255,255,.13) 36%,rgba(255,255,255,0) 58%,rgba(0,0,0,.14) 100%),linear-gradient(165deg,rgba(110,190,255,.22),rgba(110,190,255,0) 60%);
 --v5sh:inset 0 1.5px 1px rgba(255,255,255,.62),inset 0 -6px 10px rgba(0,0,0,.2),inset 0 0 0 1px rgba(255,255,255,.07),0 6px 14px rgba(0,0,0,.28);
 --v6rim:rgba(255,255,255,.26);--v6bar:rgba(12,22,36,.66)}
@supports (background:color-mix(in srgb,red 50%,transparent)){:root{
 --v5gb:color-mix(in srgb,var(--act,#f2c14e) 16%,var(--glass,#0c121a) 36%);
 --v5rim:color-mix(in srgb,var(--act,#f2c14e) 38%,rgba(255,255,255,.62));
 --v5gr:radial-gradient(120% 110% at 30% 10%,rgba(255,255,255,.46),rgba(255,255,255,.13) 36%,rgba(255,255,255,0) 58%,rgba(0,0,0,.14) 100%),linear-gradient(165deg,color-mix(in srgb,var(--act,#f2c14e) 34%,transparent),transparent 62%);
 --v4glow:color-mix(in srgb,var(--act,#f2c14e) 62%,transparent);
 --v6rim:color-mix(in srgb,var(--act,#f2c14e) 26%,rgba(255,255,255,.34));
 --v6bar:color-mix(in srgb,var(--act,#f2c14e) 8%,var(--glass,#0c121a) 64%)}}
.v4d::before,html.v3m #v3top>.v3bb::before{background:radial-gradient(closest-side,rgba(255,255,255,.98),rgba(255,255,255,0))!important}
.v4d::before{left:18%;top:7%;width:38%;height:22%}
html.v3m #v3top>.v3bb{position:relative}
html.v3m:not(.v4lt) #v3top>.v3bb::before{content:'';position:absolute;left:10%;top:6%;width:26%;height:30%;border-radius:50%;pointer-events:none;opacity:.55}
html.v4lt{--v5gr:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,0) 55%);--v5sh:inset 0 1px 0 rgba(255,255,255,.4),0 3px 8px rgba(0,0,0,.3)}
html.v4lt .v4d::before{display:none}

/* ---------- 2) riel unido: una barra de cristal común ---------- */
#v5per{display:none}
html.v3m{--v3l:calc(110px + env(safe-area-inset-left));--v3zl:var(--v3l);--v3pl:var(--v3l)}
html.v3m.v3rc{--v3l:calc(110px + env(safe-area-inset-left));--v3zl:calc(8px + env(safe-area-inset-left));--v3pl:var(--v3l)}
html.v3m body.land .bottom.bottom{left:calc(6px + env(safe-area-inset-left))!important;top:var(--v3t)!important;padding:4px!important;border:1px solid var(--v6rim)!important;background:var(--v6bar)!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 0 0 1px rgba(255,255,255,.04),0 8px 20px rgba(0,0,0,.32)!important;border-radius:22px!important}
html.v3m:not(.v3rc) body.land .bottom{width:98px!important}
html.v3m body.land .bottom>.in{display:grid!important;grid-template-columns:1fr 1fr;gap:2px!important;align-items:stretch!important}
html.v3m body.land .bottom>.in>:is(#v3rt,#v5per,#ageBtn){grid-column:1/-1}
html.v3m body.land .bottom>.in>.v4cat{display:none!important}
html.v3m body.land .bottom>.in>#v5per{order:8}
html.v3m #v3rt{height:24px;border-radius:10px}
/* botones del riel: celdas planas dentro de la barra (sin gota propia ni desenfoque) */
html.v3m body.land .bottom>.in>.nav{width:auto!important;height:44px;min-height:44px!important;padding:3px 1px 1px!important;border:0!important;border-radius:12px!important;
 background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;transform:none;font-size:8.5px!important;gap:1px!important;overflow:hidden!important}
html.v3m body.land .bottom>.in>.nav::before,html.v3m body.land .bottom>.in>.nav::after{display:none!important}
html.v3m body.land .bottom>.in>.nav .ic{font-size:18px!important}
html.v3m body.land .bottom>.in>.nav .badge{top:1px!important;right:2px!important}
html.v3m body.land .bottom>.in>.nav:active{background:rgba(255,255,255,.1)!important;transform:scale(.95)!important}
html.v3m body.land .bottom>.in>.nav.on{transform:none!important;color:var(--ink)!important;background:rgba(242,193,78,.2)!important;box-shadow:inset 0 0 0 1px var(--v4on),inset 0 1px 0 rgba(255,255,255,.3)!important}
@supports (background:color-mix(in srgb,red 50%,transparent)){html.v3m body.land .bottom>.in>.nav.on,html.v3m body.land #v5per>button.on{background:color-mix(in srgb,var(--act,#f2c14e) 24%,transparent)!important}}
/* 4) periodos: rejilla de 2×3 entre separadores finos */
html.v3m:not(.v3rc) body.land #v5per{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin:3px 0;padding:4px 0;border-top:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14)}
html.v3m body.land #v5per>button{height:38px;min-height:38px;margin:0;padding:1px 0 0;border:0;border-radius:10px;background:rgba(255,255,255,.05);color:var(--ink2,var(--ink));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
 font:700 8.5px/1.05 system-ui,-apple-system,'Segoe UI',sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;overflow:hidden;transition:background-color .14s ease,transform .14s ease}
html.v3m body.land #v5per>button b{font-size:14px;line-height:1;font-weight:800}
html.v3m body.land #v5per>button small{font-size:8.5px;max-width:44px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.85}
html.v3m body.land #v5per>button:active{transform:scale(.94)}
html.v3m body.land #v5per>button.on{color:var(--ink);background:rgba(242,193,78,.22);box-shadow:inset 0 0 0 1px var(--v4on),0 0 8px var(--v4glow)}
html.v3m body.land #v5per>button.on small{opacity:1}
/* botón de avanzar integrado al pie de la barra (siempre visible: pegado abajo si la barra se desplaza) */
html.v3m:not(.v3rc) body.land .bottom>.in>#ageBtn{width:auto!important;min-height:46px;margin:0!important;border-radius:16px;position:sticky;bottom:0;z-index:1;
 box-shadow:inset 0 1px 1px rgba(255,255,255,.55),inset 0 -4px 8px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.3)!important}
/* pantallas bajas (Safari con barras): todo cabe sin desplazarse */
@media (max-height:350px){html.v3m body.land .bottom>.in>.nav{height:40px;min-height:40px!important}html.v3m body.land #v5per>button{height:34px;min-height:34px}html.v3m #v3rt{height:20px}html.v3m:not(.v3rc) body.land .bottom>.in>#ageBtn{min-height:42px}}
@media (min-height:400px){html.v3m body.land #v5per>button{height:44px;min-height:44px}}
/* ---------- 3) plegado: solo el botón de avanzar (donde empezaba el riel) y una pestaña para abrir ---------- */
html.v3m.v3rc body.land .bottom.bottom{width:auto!important;max-width:calc(var(--v3l) - 10px - env(safe-area-inset-left));border-radius:26px!important}
html.v3m.v3rc body.land .bottom>.in{grid-template-columns:62px 24px}
html.v3m.v3rc body.land .bottom>.in>:is(.nav,#v5per){display:none!important}
html.v3m.v3rc body.land .bottom>.in>#ageBtn{grid-column:1;order:1;width:62px!important;min-height:46px;margin:0!important;border-radius:22px;font-size:10.5px!important}
html.v3m.v3rc body.land .bottom>.in>#v3rt{grid-column:2;order:2;height:auto;align-self:stretch;font-size:0;border-radius:12px;background:rgba(255,255,255,.06)}
html.v3m.v3rc body.land .bottom>.in>#v3rt::before{content:'›';font-size:20px;font-weight:800;line-height:1;color:var(--ink)}
html.v3m.v3rc #v3rt::after{inset:-6px -10px -6px -4px}
/* pixel */
html[data-px=p2].v3m body.land .bottom.bottom{border-radius:0!important;border:2px solid var(--px-edge)!important;background:var(--card)!important;box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo),0 3px 0 var(--px-slab,rgba(0,0,0,.4))!important}
html[data-px=p2].v3m body.land .bottom>.in>.nav,html[data-px=p2].v3m body.land #v5per>button,html[data-px=p2].v3m body.land .bottom>.in>#ageBtn{border-radius:0!important}
html[data-px=p2].v3m body.land .bottom>.in>.nav.on,html[data-px=p2].v3m body.land #v5per>button.on{box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important;background:var(--card2)!important}
html[data-px=p2].v3m body.land #v5per>button{font-family:var(--pxf);font-size:7px;transition:none}
/* modo ligero: barra opaca y sin brillos */
html.v4lt.v3m body.land .bottom.bottom{background:var(--glass,#0c121a)!important;box-shadow:0 3px 10px rgba(0,0,0,.35)!important}
html.v4lt.v3m body.land #v5per>button.on{box-shadow:inset 0 0 0 1px var(--v4on)}
@media (prefers-reduced-motion:reduce){html.v3m body.land #v5per>button{transition:none}}

/* ---------- 5) medidas: nada se encima ---------- */
html.v3m #v3top{min-width:0}
html.v3m body>.mapcard{max-width:calc(100vw - var(--v3l) - var(--v3r) - 60px)}

/* ---------- 1) portada «Facetas» ---------- */
#cover.cv-facetas{--cvf0:#0794e4;--cvf1:#0a86d6;--cvfk:#0a6fc2;background:linear-gradient(160deg,var(--cvf0),var(--cvf1));color:#fff}
.cv-facetas #cvC{display:none}
.cv-fac{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.cv-fac g{animation:cvFa 28s ease-in-out infinite alternate;transform-origin:50% 50%}
@keyframes cvFa{from{transform:translate(-6px,-4px) scale(1.04)}to{transform:translate(6px,4px) scale(1.05)}}
.cv-facetas .cv-shade{background:linear-gradient(180deg,rgba(0,40,96,0) 0%,rgba(0,40,96,0) 55%,rgba(0,40,96,.38) 100%)}
.cv-facetas .cv-logo{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:#fff;-webkit-text-fill-color:#fff;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-weight:900;letter-spacing:.05em;padding-left:.05em;
 font-size:clamp(44px,13vw,92px);filter:drop-shadow(0 4px 0 rgba(0,52,112,.26))}
.cv-facetas .cv-glb{stroke:#fff;stroke-width:8;filter:none}
.cv-facetas .cv-tag{color:#eef8ff;font-weight:600;text-shadow:0 1px 2px rgba(0,50,110,.45)}
.cv-facetas .cv-b{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.55);color:#fff}
.cv-facetas .cv-b.gold,.cv-facetas .cv-cont{background:#fff;border-color:#fff;color:var(--cvfk);box-shadow:0 6px 18px rgba(0,50,110,.3)}
.cv-facetas .cv-fact{background:rgba(0,56,120,.42);border-color:rgba(255,255,255,.4);color:#fff}
.cv-facetas .cv-sl,.cv-facetas .cv-foot,.cv-facetas .cv-lang .f{color:#e2f4ff}
.cv-facetas .cv-lang select{background:rgba(0,56,120,.4);border-color:rgba(255,255,255,.5);color:#fff}
.cv-facetas .cv-chips button{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.45);color:#fff}
.cv-facetas .cv-chips button.on{background:#fff;border-color:#fff;color:var(--cvfk);box-shadow:none}
.cv-facetas .cv-cr{background:rgba(4,58,120,.96)}.cv-facetas .cv-cr b{color:#bfeaff}
html.v4lt .cv-fac g{animation:none}
@media (prefers-reduced-motion:reduce){.cv-fac g{animation:none}}
`;document.head.appendChild(st);})();

/* ---------- 1) portada «Facetas» ---------- */
(function(){
  if(typeof COVERS!=='object'||typeof coverHTML!=='function'||typeof cvStart!=='function'||typeof cvStyle!=='function')return;
  // el estilo nuevo va primero en la lista de estilos
  const old=Object.entries(COVERS);old.forEach(([k])=>delete COVERS[k]);COVERS.facetas=['🔷','Facetas'];old.forEach(([k,v])=>{if(k!=='facetas')COVERS[k]=v;});
  // la primera vez se elige solo (campo opcional CFG.cv6); después se respeta lo que elija el jugador
  try{if(CFG.cv6!==1){CFG.cover='facetas';CFG.cv6=1;saveCfg();}}catch(e){}
  const SVG=`<svg class="cv-fac" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>
<polygon points="0,0 430,0 0,300" fill="#45cffb"/>
<polygon points="430,0 700,0 0,520 0,300" fill="#22b2f1"/>
<polygon points="0,0 150,0 0,120" fill="#9fe8ff"/>
<polygon points="920,0 1330,0 1170,250" fill="#ffffff" fill-opacity=".08"/>
<polygon points="1330,0 1600,0 1600,660 1450,560" fill="#a8ecff"/>
<polygon points="1450,560 1600,660 1600,900 1520,900" fill="#5fd8ff"/>
<polygon points="1500,0 1600,0 1600,150" fill="#3fc6f8"/>
<polygon points="0,520 230,610 0,700" fill="#6fdfff"/>
<polygon points="0,700 1600,830 1600,900 0,900" fill="#38d2ff"/>
<polygon points="0,760 280,900 0,900" fill="#b6f1ff"/>
<polygon points="620,900 1100,860 1250,900" fill="#ffffff" fill-opacity=".12"/>
</g></svg>`;
  {const _ch=coverHTML;coverHTML=function(){const h=_ch.apply(this,arguments);if(cvStyle()!=='facetas')return h;const k='<div class="cv-shade"></div>';return h.indexOf(k)<0?SVG+h:h.replace(k,SVG+k);};}
  // sin canvas ni imagen de relieve: el fondo es el SVG fijo (más ligero en el iPhone y en la Toshiba)
  {const _cs=cvStart;cvStart=function(){if(cvStyle()==='facetas'){try{cancelAnimationFrame(CV.raf);clearTimeout(CV.to);}catch(e){}return;}return _cs.apply(this,arguments);};}
})();

/* ---------- 4) periodos de tiempo dentro del riel (mismos de #clk y CFG.tu) ---------- */
function v5PerLbl(u){const b=document.querySelector(`#clk .in button[data-u="${u}"]`);let t=((b&&b.textContent)||(typeof TUN!=='undefined'&&TUN[u]?TUN[u][0]:u)).trim();
  if(u==='5')t=t.replace(/^\s*5\s*/,'')||t;return t;}
function v5PerUI(){const inn=document.querySelector('.bottom>.in');if(!inn||typeof CFG==='undefined')return;let w=document.getElementById('v5per');
  if(!w){w=document.createElement('div');w.id='v5per';w.setAttribute('role','radiogroup');w.setAttribute('aria-label','Periodo de avance');w.setAttribute('data-noi18n','');
    const ab=document.getElementById('ageBtn');inn.insertBefore(w,ab&&ab.parentNode===inn?ab:null);
    w.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-u]');if(!b)return;e.stopPropagation();
      if(CFG.tu===b.dataset.u)return;CFG.tu=b.dataset.u;saveCfg();clockUI();});}
  const L=(typeof TUO!=='undefined'&&TUO.length?TUO:['h','d','s','m','a','5']).filter(u=>typeof TUN==='undefined'||TUN[u]);
  if(w._k!==L.join()){w._k=L.join();w.innerHTML=L.map(u=>`<button type="button" role="radio" data-u="${u}"><b>${u==='5'?'5':'1'}</b><small></small></button>`).join('');}
  w.querySelectorAll('button[data-u]').forEach(b=>{const u=b.dataset.u,on=u===CFG.tu,t=v5PerLbl(u),s=b.lastChild;
    if(s&&s.textContent!==t){s.textContent=t;b.title=(u==='5'?'5 ':'1 ')+t;}
    if(b.classList.contains('on')!==on){b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false');}});}
(function(){if(typeof clockUI!=='function')return;
  {const _c=clockUI;clockUI=function(){const r=_c.apply(this,arguments);try{v5PerUI();}catch(e){}return r;};}
  try{v5PerUI();}catch(e){}})();

/* ---------- 2) submenús que brotan: salen del borde derecho de la barra (no tapan la otra columna) ---------- */
(function(){if(typeof v4Sprout!=='function')return;const _s=v4Sprout;
  v4Sprout=function(){const r=_s.apply(this,arguments);try{const d=document.getElementById('v4dr'),bt=document.querySelector('.bottom');
    if(d&&!d.hidden&&bt){const left=Math.round(bt.getBoundingClientRect().right+4);d.style.left=left+'px';const sh=document.getElementById('sheet');
      const sl=sh&&typeof sheetIsOpen==='function'&&sheetIsOpen()?sh.getBoundingClientRect().left:innerWidth;const t=d.querySelector('.v4dt');if(t)t.style.maxWidth=Math.max(120,sl-left-26)+'px';}}catch(e){}return r;};})();
