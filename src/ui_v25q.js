/* ===== v2.5q — interfaz: pantalla de elegir vida sin desplazarse, riel más compacto y portada «Facetas» más viva =====
   Solo interfaz: no toca reglas, motor, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB. Se carga después de ui_v25p.js.
   1) Elegir vida (showStart): los mismos controles (mismos ids, valores y manejadores; solo se mueven de sitio) en dos columnas:
      👤 Personaje (nombre, apellido, sexo, edad, país y provincia) y 🎯 Partida (nivel y tipo, en botones compactos con la
      descripción del elegido debajo). Lo avanzado (modo, dificultad y ranura de guardado) va en el acordeón «⚙️ Más opciones».
      El botón «Comenzar vida» queda fijo abajo con un resumen de lo elegido. Cabe en horizontal en el iPhone 11 sin desplazar.
   2) Riel izquierdo: botones más juntos (sin filas infladas), barra continua con brillo suave y separada de los bordes.
   3) Portada «🔷 Facetas»: las facetas se desplazan despacio en tres capas (solo transform, en la GPU), una franja de luz cruza el
      fondo y un brillo pasa por las letras del logo. Apagado en el modo ligero (html.v4lt) y con movimiento reducido. */
(function(){const st=document.createElement('style');st.id='st25q';st.textContent=`
/* ---------- 1) elegir vida ---------- */
.modal.v5ng{padding:10px 14px 0}
.v5ng .v5h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px}
.v5ng .v5h>h2{margin:0;flex:1 1 auto;font-size:18px;line-height:1.2}
.v5ng .v5ht{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.v5ng .v5ht>div{margin:0!important}.v5ng .v5ht select{width:auto;padding:5px 8px;font-size:13px}.v5ng .v5ht label.f{display:none}
.v5ng #sCv{width:auto;margin:0;padding:6px 10px;font-size:12.5px}
.v5ng>p.src{margin:2px 0 6px;font-size:12px}
.v5ng .v5c{display:flex;gap:6px;margin:4px 0 6px}.v5ng .v5c>.opt{flex:1;margin:0;padding:8px 10px;font-size:13.5px}
.v5ng .sect{position:static;margin:6px 0 4px;font-size:11px}
.v5ng .v5g{display:grid;gap:4px 14px}
.v5ng .v5a .row2{gap:6px}
.v5ng label.f{margin:4px 0 2px;font-size:11.5px}
.v5ng .v5a input,.v5ng .v5a select{padding:7px 9px;min-height:36px}
.v5ng .modes.lvls,.v5ng .modes.gms{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.v5ng .modes.lvls .lv,.v5ng .modes.gms .mode{margin:0;padding:7px 4px;min-height:40px;text-align:center;border-radius:11px}
.v5ng .modes.lvls .lv b,.v5ng .modes.gms .mode b{font-size:13.5px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v5ng .modes.lvls .lv span,.v5ng .modes.gms .mode span{display:none}
.v5ng .v5ds{font-size:11.5px;line-height:1.3;color:var(--mut);margin:4px 1px 2px;min-height:2.6em;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.v5ng #v20lv>.sect:first-child{display:none}.v5ng #v20mo{display:none}
.v5ng #v20pz{margin:4px 0 0;padding:5px 8px;font-size:12px}
.v5ng details.v5mo{margin:8px 0 0;border:1px dashed var(--line);border-radius:10px;padding:5px 10px}
.v5ng details.v5mo>summary{cursor:pointer;font-weight:700;font-size:13.5px;padding:3px 0;list-style-position:inside}
.v5ng details.v5mo>summary small{color:var(--mut);font-weight:600;font-size:11.5px}
.v5ng details.v5mo .modes{gap:6px}.v5ng details.v5mo .mode{padding:7px 10px}.v5ng details.v5mo .mode span{font-size:11.5px}
.v5ng .v5ft{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;gap:10px;margin:8px -14px 0;padding:8px 14px calc(10px + env(safe-area-inset-bottom));background:var(--card);border-top:1px solid var(--line);box-shadow:0 -6px 12px rgba(0,0,0,.18)}
.v5ng .v5ft .v5sum{flex:1 1 auto;min-width:0;font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v5ng .v5ft #sGo{width:auto!important;flex:0 0 auto;margin:0!important;padding:11px 22px!important}
@media (max-width:520px){.v5ng .v5ft{flex-wrap:wrap}.v5ng .v5ft .v5sum{flex-basis:100%}.v5ng .v5ft #sGo{flex:1 1 auto}}
@media (orientation:landscape) and (min-width:600px){
 html body .modal.v5ng{width:min(calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right)),860px)!important;left:50%!important;top:50%!important;
  max-height:calc(100vh - 12px)!important;max-height:calc(100dvh - 12px)!important}
 .v5ng .v5g{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
 .v5ng>p.src{display:none}}
@media (orientation:landscape) and (max-height:430px){.v5ng .sect{margin:4px 0 3px}.v5ng label.f{margin:2px 0 1px}.v5ng .v5a input,.v5ng .v5a select{padding:5px 8px;min-height:32px}.v5ng .v5ds{min-height:0}}

/* ---------- 2) riel: botones juntos, barra continua y separada de los bordes ---------- */
html.v3m body.land .bottom.bottom{left:calc(10px + env(safe-area-inset-left))!important;top:calc(var(--v3t) + 4px)!important;max-height:calc(100% - var(--v3t) - var(--v3bt) - 8px)!important;padding:5px!important;border-radius:24px!important;
 background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.02) 22%,rgba(255,255,255,0) 70%,rgba(0,0,0,.14)),var(--v6bar)!important}
html.v3m:not(.v3rc) body.land .bottom{width:94px!important}
html.v3m body.land .bottom>.in{gap:2px!important;grid-auto-rows:auto!important;align-content:start!important;height:auto!important}
html.v3m body.land .bottom>.in>.nav{height:42px;min-height:42px!important;margin:0!important;border-radius:13px!important}
html.v3m body.land .bottom>.in>.nav:not(.on):hover{background:rgba(255,255,255,.06)!important}
html.v3m #v3rt{height:20px;margin:0 0 1px}
html.v3m:not(.v3rc) body.land #v5per{margin:3px 2px!important;padding:4px 0!important;gap:2px!important;border-color:rgba(255,255,255,.1)!important}
html.v3m body.land #v5per>button{height:34px;min-height:34px}
@media (min-height:400px){html.v3m body.land #v5per>button{height:38px;min-height:38px}}
html.v3m:not(.v3rc) body.land .bottom>.in>#ageBtn{min-height:44px;margin-top:2px!important}
@media (max-height:350px){html.v3m body.land .bottom>.in>.nav{height:38px;min-height:38px!important}html.v3m body.land #v5per>button{height:31px;min-height:31px}}

/* ---------- 3) portada «Facetas» viva ---------- */
#cover.cv-facetas{overflow:hidden}
.cv-fac.v5qf{inset:-5%;width:110%;height:110%;will-change:transform;backface-visibility:hidden}
.cv-fac.v5qf g{animation:none!important}
.v5qf1{animation:v5qF1 38s ease-in-out infinite alternate}
.v5qf2{animation:v5qF2 29s ease-in-out infinite alternate}
.v5qf3{animation:v5qF3 23s ease-in-out infinite alternate}
@keyframes v5qF1{from{transform:translate3d(-10px,-6px,0) scale(1.01)}to{transform:translate3d(12px,7px,0) scale(1.03)}}
@keyframes v5qF2{from{transform:translate3d(14px,-8px,0) rotate(-.4deg)}to{transform:translate3d(-12px,9px,0) rotate(.4deg)}}
@keyframes v5qF3{from{transform:translate3d(-16px,10px,0)}to{transform:translate3d(18px,-10px,0)}}
.v5qsw{position:absolute;top:0;bottom:0;left:-100%;width:200%;pointer-events:none;will-change:transform;
 background:linear-gradient(104deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.13) 47%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.13) 53%,rgba(255,255,255,0) 62%);
 animation:v5qSw 13s cubic-bezier(.45,0,.55,1) infinite;transform:translate3d(-30%,0,0)}
@keyframes v5qSw{0%{transform:translate3d(-30%,0,0)}55%,100%{transform:translate3d(55%,0,0)}}
.cv-facetas .cv-logo span{background:linear-gradient(105deg,#fff 0%,#fff 40%,#b8ecff 46%,#fff 50%,#b8ecff 54%,#fff 60%,#fff 100%);background-size:320% 100%;background-position:100% 0;
 -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
 animation:cvIn .7s cubic-bezier(.2,.8,.2,1) both,v5qSh 7s ease-in-out infinite;animation-delay:calc(var(--i)*70ms + 120ms),calc(var(--i)*90ms + 1.6s)}
@keyframes v5qSh{0%{background-position:100% 0}28%,100%{background-position:0% 0}}
html.v4lt .v5qf,html.v4lt .v5qsw{animation:none!important}html.v4lt .v5qsw{display:none}
html.v4lt .cv-facetas .cv-logo span{animation:cvIn .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*70ms + 120ms)}
@media (prefers-reduced-motion:reduce){.v5qf,.v5qsw,.cv-facetas .cv-logo span{animation:none!important}.v5qsw{display:none}}
`;document.head.appendChild(st);})();

/* ---------- 1) elegir vida: reorganiza los mismos controles ---------- */
function v5qStart(){const m=$('modal');if(!m||!m.classList.contains('on'))return;const go=m.querySelector('#sGo');if(!go||m.querySelector('.v5g'))return;
  const sF=m.querySelector('#sF'),sX=m.querySelector('#sX'),sP=m.querySelector('#sP'),sR=m.querySelector('#sR');if(!sF||!sX||!sP||!sR)return;
  const top=el=>{while(el&&el.parentNode!==m)el=el.parentNode;return el;};
  const prevLab=el=>{const p=el&&el.previousElementSibling;return p&&p.matches('label.f')?p:null;};
  const h2=m.querySelector(':scope>h2'),src=m.querySelector(':scope>p.src'),cv=m.querySelector('#sCv'),lang=top(m.querySelector('#stLang'));
  const sC=m.querySelector('#sC'),sLd=m.querySelector('#sLd');
  const lv=m.querySelector('#v20lv'),gms=m.querySelector('.modes.gms');const gmS=gms&&gms.previousElementSibling&&gms.previousElementSibling.classList.contains('sect')?gms.previousElementSibling:null;
  const sl=m.querySelector('#sSl'),slBox=sl?top(sl):null;
  // cabecera
  const hd=document.createElement('div');hd.className='v5h';if(h2)hd.appendChild(h2);const ht=document.createElement('div');ht.className='v5ht';if(lang&&lang!==slBox)ht.appendChild(lang);if(cv)ht.appendChild(cv);hd.appendChild(ht);
  // continuar / cargar
  let cc=null;if(sC||sLd){cc=document.createElement('div');cc.className='v5c';const after=(sLd||sC).nextElementSibling;if(sC)cc.appendChild(sC);if(sLd)cc.appendChild(sLd);
    if(after&&after.parentNode===m&&after.classList.contains('sect'))after.style.display='none';}
  // columnas
  const g=document.createElement('div');g.className='v5g';
  const a=document.createElement('section');a.className='v5a';a.innerHTML='<div class="sect">👤 Personaje</div>';
  [top(sF),top(sX)].forEach(x=>{if(x&&x.parentNode===m)a.appendChild(x);});
  const r3=document.createElement('div');r3.className='row2';[[sP],[sR]].forEach(([s])=>{const d=document.createElement('div');const l=prevLab(s);if(l)d.appendChild(l);d.appendChild(s);r3.appendChild(d);});a.appendChild(r3);
  const b=document.createElement('section');b.className='v5b';
  if(lv){b.insertAdjacentHTML('beforeend','<div class="sect">🎯 Nivel</div>');b.appendChild(lv);lv.insertAdjacentHTML('beforeend','<div class="v5ds" id="v5dl"></div>');}
  if(gms){if(gmS){gmS.textContent='🧭 '+gmS.textContent.trim();b.appendChild(gmS);}else b.insertAdjacentHTML('beforeend','<div class="sect">🧭 Tipo de partida</div>');b.appendChild(gms);b.insertAdjacentHTML('beforeend','<div class="v5ds" id="v5dg"></div>');}
  g.append(a,b);
  // más opciones: modo, dificultad y ranura (lo que estaba en «Más opciones» de la v2.0a y la ranura de la v1.7a)
  const mo=document.createElement('details');mo.className='v5mo';mo.innerHTML='<summary>⚙️ Más opciones <small>· modo, dificultad y ranura de guardado</small></summary><div class="v5moi"></div>';
  const moi=mo.querySelector('.v5moi');const old=m.querySelector('#v20mo');
  if(old){const inn=old.querySelector('.v20moi');if(inn)[...inn.childNodes].forEach(n=>moi.appendChild(n));if(old.open)mo.open=true;}
  if(slBox&&slBox.parentNode===m)moi.appendChild(slBox);
  // lo que no se reconozca (de otras versiones) también va a «Más opciones», para no perderlo
  const ft=document.createElement('div');ft.className='v5ft';ft.innerHTML='<div class="v5sum" id="v5sum"></div>';
  const keep=new Set([hd,cc,g,mo,ft,src,go].filter(Boolean));const hints=[];
  [...m.children].forEach(x=>{if(keep.has(x)||x===h2||x===lang||x===cv||x.style.display==='none')return;if(x.classList.contains('hint')&&!x.id){hints.push(x);return;}moi.appendChild(x);});
  ft.appendChild(go);
  m.innerHTML='';[hd,...hints,src,cc,g,mo,ft].forEach(x=>{if(x)m.appendChild(x);});
  m.classList.add('v5ng');
  const txt=el=>el?(el.textContent||'').replace(/\s+/g,' ').trim():'';
  const sync=()=>{try{const L=m.querySelector('.lvls .lv.on'),T=m.querySelector('.gms .mode.on');const dl=m.querySelector('#v5dl'),dg=m.querySelector('#v5dg');
    if(dl)dl.textContent=txt(L&&L.querySelector('span'));if(dg)dg.textContent=txt(T&&T.querySelector('span'));
    const pz=m.querySelector('#v20pz');const lvT=pz&&pz.style.display!=='none'?txt(pz):txt(L&&L.querySelector('b'));
    const o=sP.options[sP.selectedIndex];const s=m.querySelector('#v5sum');if(s)s.textContent=[lvT,txt(T&&T.querySelector('b')),o?o.textContent:''].filter(Boolean).join(' · ');}catch(e){}};
  m.addEventListener('click',()=>setTimeout(sync,0));sP.addEventListener('change',sync);sync();m.scrollTop=0;}
(function(){if(typeof showStart!=='function')return;const _st=showStart;showStart=function(){const r=_st.apply(this,arguments);try{v5qStart();}catch(e){console.warn('v25q inicio',e);}return r;};})();
// cualquier otra ventana que use #modal vuelve al diseño normal
(function(){if(typeof showModal!=='function')return;const _sm=showModal;showModal=function(){try{const m=$('modal');if(m)m.classList.remove('v5ng');}catch(e){}return _sm.apply(this,arguments);};})();

/* ---------- 3) portada «Facetas»: tres capas de facetas que se desplazan y una franja de luz ---------- */
(function(){if(typeof coverHTML!=='function'||typeof cvStyle!=='function')return;
  const LAY=[[0,1,8],[3,4,5,9],[2,6,7,10]];
  const _ch=coverHTML;coverHTML=function(){let h=_ch.apply(this,arguments);try{if(cvStyle()!=='facetas')return h;const i=h.indexOf('<svg class="cv-fac"');if(i<0)return h;const j=h.indexOf('</svg>',i);if(j<0)return h;
    const svg=h.slice(i,j+6);const P=svg.match(/<polygon[^>]*\/>/g)||[];if(P.length<3)return h;const vb=(svg.match(/viewBox="[^"]*"/)||['viewBox="0 0 1600 900"'])[0];
    const used=new Set();const lay=LAY.map(ix=>ix.filter(k=>k<P.length).map(k=>{used.add(k);return P[k];}));P.forEach((p,k)=>{if(!used.has(k))lay[0].push(p);});
    const out=lay.map((L,n)=>`<svg class="cv-fac v5qf v5qf${n+1}" ${vb} preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${L.join('')}</g></svg>`).join('')+'<div class="v5qsw" aria-hidden="true"></div>';
    h=h.slice(0,i)+out+h.slice(j+6);}catch(e){}return h;};})();
