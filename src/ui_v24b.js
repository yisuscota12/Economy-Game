/* ===== v2.4b — interfaz: fase 1 de la lista del dueño (horizontal, iPhone 11) =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB; no agrega campos a imperioCfg
   (usa CFG.lgv de la v2.4a). Se carga al final (después de ui_v24a.js). Casi todo se aplica en el modo horizontal (html.v3m).
   A) Ficha de ciudad sin desplazarse: encabezado y cifras compactos; «Otras ciudades» y «Clubes» detrás de subpestañas;
      las acciones del lugar en una barra fija abajo (al alcance del pulgar). La pestaña Provincia también lleva su barra abajo.
   B) Botón de envíos (CFG.lgv) fuera de la burbuja de capas: va junto a los botones principales de la ficha flotante (#selInfo
      .plfx) y en la barra de acciones de la ficha del lugar, con un icono vectorial de línea (barco de Tabler, set IVI «Línea»).
   C) Riel izquierdo: cada botón es una gota de cristal líquido; agrupados por categoría (Tú · Mundo · Juego); el activo brilla
      y crece un poco. Al tocar uno, sus submenús brotan a su lado como gotas pequeñas unidas a él (#v4dr).
   D) Barra de submenús de todas las hojas: misma familia de cristal, compacta; «‹ Atrás» con el nombre de la pantalla anterior
      y un segundo paso «‹‹»; métricas con su tiempo (último mes, hace 3 meses, este año, plazo de la bolsa) en Carrera, País,
      Bancos/Finanzas, Bolsa, Mis empresas y la ficha de cada empresa; filas largas con barra fina que se arrastra, arrastre con
      ratón sin retraso e inercia suave (en el iPhone el desplazamiento nativo ya tiene inercia).
   E) Burbuja del mapa (ciudad o provincia): acciones y cifras según el tipo de mapa (Política, Economía, Naturaleza, Logística,
      Bolsa), con una tira para cambiar de tipo sin salir de la burbuja.
   Textos nuevos solo en español (pendientes de traducir; ver CONTEXTO_IA.md, v2.4b). */
(function(){const st=document.createElement('style');st.id='st24b';st.textContent=`
:root{--v4rim:rgba(255,255,255,.2);--v4gb:rgba(16,24,34,.62);--v4gr:radial-gradient(130% 120% at 28% 16%,rgba(255,255,255,.26),rgba(255,255,255,.07) 42%,rgba(0,0,0,.12) 100%);
 --v4sh:inset 0 1px 1px rgba(255,255,255,.34),inset 0 -4px 8px rgba(0,0,0,.22),0 5px 12px rgba(0,0,0,.32);--v4on:var(--act,var(--gold));--v4glow:rgba(242,193,78,.5)}
@supports (background:color-mix(in srgb,red 50%,transparent)){:root{--v4gb:color-mix(in srgb,var(--glass,#0c121a) 62%,transparent);--v4glow:color-mix(in srgb,var(--act,#f2c14e) 50%,transparent)}}
.v4i{width:1.2em;height:1.2em;vertical-align:-.22em;flex:none}
/* ---------- gota de cristal líquido (luz arriba a la izquierda, brillo especular pequeño, sombra suave abajo) ---------- */
.v4d,.v4cc,.v4m,#v4dr .v4dn,html.v3m body.land .bottom>.in>.nav,html.v3m body.land .shx button,html.v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button,html.v3m .abx>.btn:not(.gold),html.v3m .abt{
 position:relative;border:1px solid var(--v4rim)!important;background:var(--v4gr),var(--v4gb)!important;box-shadow:var(--v4sh)!important;color:var(--ink)}
.v4d::before,.v4cc::before,html.v3m body.land .bottom>.in>.nav::before{content:'';position:absolute;left:19%;top:8%;width:30%;height:17%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.72),rgba(255,255,255,0));pointer-events:none}
html:not(.v4lt) .v4d,html.v3m:not(.v4lt) body.land .bottom>.in>.nav{-webkit-backdrop-filter:blur(9px) saturate(1.5);backdrop-filter:blur(9px) saturate(1.5)}

/* ---------- C) riel: gotas por categoría ---------- */
.v4cat{display:none}
html.v3m:not(.v3rc) body.land .bottom{width:72px;left:calc(4px + env(safe-area-inset-left));padding:4px!important;background:transparent!important;border-color:transparent!important;box-shadow:none!important}
html.v3m body.land .bottom{z-index:22}
html.v3m body.land .bottom>.in{gap:4px!important;align-items:center!important}
html.v3m body.land .bottom>.in>*{order:8}
html.v3m body.land .bottom>.in>#v3rt{order:0;align-self:stretch}
html.v3m body.land .bottom>.in>.v4cat[data-c=tu]{order:1}html.v3m body.land .bottom>.in>#nAct{order:2}html.v3m body.land .bottom>.in>#nCar{order:3}
html.v3m body.land .bottom>.in>.v4cat[data-c=mu]{order:4}html.v3m body.land .bottom>.in>#nNat{order:5}
html.v3m body.land .bottom>.in>.v4cat[data-c=ju]{order:6}html.v3m body.land .bottom>.in>#nMore{order:7}html.v3m body.land .bottom>.in>#ageBtn{order:9}
html.v3m:not(.v3rc) body.land .bottom>.in>.v4cat{display:block;align-self:stretch;margin:3px 0 -2px;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-align:center;color:var(--ink);opacity:.75;text-shadow:0 1px 3px rgba(0,0,0,.85);pointer-events:none;white-space:nowrap;overflow:hidden}
html.v3m body.land .bottom>.in>.nav{width:56px!important;height:56px;min-height:56px!important;flex:none!important;padding:3px 2px 0!important;border-radius:50%!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:1px!important;
 font-size:8.5px!important;line-height:1.05!important;overflow:visible!important;animation:none!important;transition:transform .24s cubic-bezier(.3,1.4,.5,1),box-shadow .2s ease,border-color .2s ease}
html.v3m body.land .bottom>.in>.nav .ic{font-size:19px!important}
html.v3m body.land .bottom>.in>.nav .badge{top:-3px!important;right:-4px!important}
html.v3m body.land .bottom>.in>.nav:active{transform:scale(.92)}
html.v3m body.land .bottom>.in>.nav.on{border-color:var(--v4on)!important;color:var(--ink)!important;transform:scale(1.08);z-index:1;
 box-shadow:0 0 0 1.5px var(--v4on),0 0 14px var(--v4glow),inset 0 1px 1px rgba(255,255,255,.42),0 5px 12px rgba(0,0,0,.32)!important}
html.v3m:not(.v3rc) body.land .bottom>.in>#ageBtn{width:62px!important;margin-top:6px!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.18),0 5px 12px rgba(0,0,0,.35)!important}
/* submenús que brotan del botón tocado */
#v4dr{position:fixed;z-index:23;display:flex;align-items:center;height:62px;pointer-events:none}
#v4dr[hidden]{display:none}
#v4dr .v4dn{flex:none;width:16px;height:24px;margin-right:-6px;border-radius:50%;opacity:0;transform:scale(.3);transition:opacity .16s ease,transform .26s cubic-bezier(.3,1.4,.5,1)}
#v4dr .v4dt{display:flex;align-items:center;gap:6px;padding:5px 8px 5px 6px;border-radius:31px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x;pointer-events:auto;background:rgba(10,14,20,.25)}
#v4dr .v4dt::-webkit-scrollbar{display:none}
.v4d{flex:none;width:50px;height:50px;border-radius:50%!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px 3px 0;font-size:8.5px;font-weight:700;line-height:1.05;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
 opacity:0;transform:translateX(calc(var(--n,0) * -56px)) scale(.35);transition:transform .34s cubic-bezier(.3,1.35,.5,1) calc(var(--n,0) * 28ms),opacity .18s ease calc(var(--n,0) * 28ms)}
.v4d i{font-style:normal;font-size:18px;line-height:1}.v4d span{max-width:46px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#v4dr.v4o .v4dn{opacity:1;transform:none}#v4dr.v4o .v4d{opacity:1;transform:none}
.v4d:active{transform:scale(.92)!important}
.v4d.on{border-color:var(--v4on)!important;box-shadow:0 0 0 1.5px var(--v4on),0 0 10px var(--v4glow),var(--v4sh)!important}
.sect.v4gh{display:flex;align-items:center;gap:6px}.sect.v4gh.v4fl{animation:v4fl .9s ease}
@keyframes v4fl{0%,100%{color:inherit}30%{color:var(--v4on)}}

/* ---------- D) barra de submenús: cristal compacto, atrás con historial, métricas con su tiempo, filas que se arrastran ---------- */
html.v3m body.land .shx{justify-content:flex-start;height:34px;gap:5px;margin:-4px 0 6px}
html.v3m body.land .shx button{height:32px;padding:0 12px;border-radius:16px!important;font-size:12px;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
html.v3m body.land .shx .hm{margin-left:auto}html.v3m body.land .shx .v4ck{opacity:.8;font-size:11px;max-width:30%}
.shx .bk,.shx .v4ck{max-width:44%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
html.v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt){gap:5px;border-bottom:0!important;padding:3px 2px 6px;margin:2px 0 4px}
html.v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button{flex:0 0 auto!important;height:34px;min-height:34px!important;padding:0 13px!important;border-radius:17px!important;color:var(--mut)!important;font-size:12.5px}
html.v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button::after{display:none}
html.v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button.on{color:var(--ink)!important;border-color:var(--v4on)!important;box-shadow:0 0 0 1px var(--v4on),0 0 10px var(--v4glow),inset 0 1px 1px rgba(255,255,255,.36)!important}
html.v3m .abt{border-color:var(--gold)!important;color:var(--gold)}
html.v3m .abx{scroll-behavior:auto;scroll-snap-type:none}
html.v3m .abx>.btn{border-radius:22px!important}
.v4mt{display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;margin:2px 0 8px;padding:2px 1px 5px;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x}
.v4mt::-webkit-scrollbar{display:none}
.v4m{flex:none;display:flex;flex-direction:column;min-width:86px;padding:5px 11px;border-radius:14px!important;line-height:1.2}
.v4m small{font-size:10.5px;color:var(--mut);white-space:nowrap}.v4m b{font-size:14px;white-space:nowrap}.v4m em{font-style:normal;font-size:10px;color:var(--mut);white-space:nowrap}
.v4m b.u{color:var(--teal,#3ccf8e)}.v4m b.d{color:var(--red,#f0565d)}
.app #v4np{margin:0 0 8px}
/* barra fina para desplazar una fila larga (se puede agarrar y arrastrar) */
.v4th{position:relative;height:14px;margin:-9px 4px 2px;touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}
.v4th[hidden]{display:none}
.v4th>i{position:absolute;left:0;top:5px;height:3px;min-width:24px;border-radius:3px;background:var(--mut,#7b8794);opacity:.4;transition:opacity .15s ease,height .15s ease,top .15s ease}
.v4th:hover>i,.v4th.v4g>i{opacity:.85;height:5px;top:4px}

/* ---------- A) ficha de ciudad y de provincia sin desplazarse (horizontal) ---------- */
.v4cs[hidden]{display:none!important}
html.v3m body.land #sheetIn.v4pl .plh{gap:8px}
html.v3m body.land #sheetIn.v4pl .plh h3{font-size:17px;margin:0}
html.v3m body.land #sheetIn.v4pl .plh .pln small{font-size:11.5px}
html.v3m body.land #sheetIn.v4pl .plh>img{width:22px;height:auto}
html.v3m body.land #sheetIn.v4pl .plx{padding:5px 9px;font-size:12px}
html.v3m body.land #sheetIn.v4pl>.mpt{margin:3px 0 0;font-size:11px}
html.v3m body.land #sheetIn.v4pl .pltabs{margin:4px 0 4px}
html.v3m body.land #sheetIn.v4pl .plg{grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:5px;margin:4px 0 6px}
html.v3m body.land #sheetIn.v4pl .plt{padding:4px 8px}html.v3m body.land #sheetIn.v4pl .plt b{font-size:14px}
html.v3m body.land #sheetIn.v4pl .plcy{padding:7px 9px;margin-bottom:6px}
html.v3m body.land #sheetIn.v4pl .plcy h4{font-size:15px}
html.v3m body.land #sheetIn.v4pl .plcy .plg{margin:5px 0 0}
html.v3m body.land #sheetIn.v4pl .sect.v4as{display:none}
html.v3m body.land #sheetIn.v4pl .v4ct{margin:2px 0 6px}
html.v3m body.land #sheetIn.v4pl .pla.v4ab{position:sticky;bottom:0;z-index:5;margin:8px -4px 0;padding:6px 5px;border-radius:16px;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));
 background:var(--glass,#0c121a);border:1px solid var(--line2,#2b3a4e);box-shadow:0 -6px 16px rgba(0,0,0,.28)}
html.v3m body.land #sheetIn.v4pl .pla.v4ab button{min-height:50px;padding:5px 2px 4px}
/* ---------- B) botón de envíos ---------- */
.mmodes button.lgt{display:none!important}
#selInfo .plfx .btn.v4lgb{flex:0 0 46px;min-width:46px;padding:0;display:flex;align-items:center;justify-content:center;font-size:17px}
[data-v4lg].on{color:var(--teal,#3ccf8e)!important;border-color:var(--teal,#3ccf8e)!important}
[data-v4lg]:not(.on){color:var(--mut)}
/* ---------- E) burbuja del mapa por tipo de mapa ---------- */
.mpop .v4mc{display:flex;gap:4px;margin:7px 0 3px}
.v4cc{flex:1 1 0;min-width:0;height:32px;border-radius:16px!important;display:flex;align-items:center;justify-content:center;gap:4px;padding:0 6px;color:var(--mut);font-size:11px;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:flex-grow .2s ease}
.v4cc i{font-style:normal;font-size:15px;line-height:1}.v4cc span{display:none}
.v4cc.on{flex:2.6 1 0;color:var(--ink);border-color:var(--v4on)!important;box-shadow:0 0 0 1px var(--v4on),0 0 8px var(--v4glow),var(--v4sh)!important}
.v4cc.on span{display:inline;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mpop .v4mm{display:flex;flex-wrap:wrap;gap:3px 10px;margin:4px 0 2px;font-size:12px}
.v4mm b{font-weight:800}.v4mm small{color:var(--mut)}.v4mm em{font-style:normal;color:var(--mut);font-size:10.5px}
.mpop .mpa.v4m6{grid-template-columns:repeat(3,1fr)}
/* ---------- pixel y movimiento reducido ---------- */
html[data-px=p2] :is(.v4d,.v4cc,.v4m,#v4dr .v4dn,#v4dr .v4dt),html[data-px=p2].v3m body.land .bottom>.in>.nav,html[data-px=p2].v3m body.land .shx button{border-radius:0!important;background:var(--card2)!important;border:2px solid var(--px-edge)!important;
 box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
html[data-px=p2] :is(.v4d,.v4cc)::before,html[data-px=p2].v3m body.land .bottom>.in>.nav::before{display:none}
html[data-px=p2].v3m body.land .bottom>.in>.nav.on,html[data-px=p2] :is(.v4d,.v4cc).on{box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold)),inset 2px 2px 0 var(--px-hi)!important;transform:none}
html[data-px=p2].v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button{border-radius:0!important;border:0!important;background:none!important;box-shadow:none!important}
html[data-px=p2].v3m body.land :is(.sheet,.app) :is(.ntabs,.mkt,.nwt) button.on{box-shadow:inset 0 -4px 0 var(--c-lit,var(--gold))!important}
html[data-px=p2] #v4dr .v4d,html[data-px=p2] #v4dr .v4dn{transition:opacity 80ms steps(2,end),transform 80ms steps(2,end)}
@media (prefers-reduced-motion:reduce){.v4d,#v4dr .v4dn,.v4cc,html.v3m body.land .bottom>.in>.nav{transition:none!important}.sect.v4gh.v4fl{animation:none}}
`;document.head.appendChild(st);})();

const V4={cx:[],dn:null,dk:null,cat:null,cm:null,mp:null,ct:null,ctc:null,gr:null};
const V4_SHIP='<path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1"/><path d="M4 18l-1 -5h18l-2 4"/><path d="M5 13v-6h8l4 6"/><path d="M7 7v-4h-1"/>';
// icono de línea (trazo 2, puntas redondas, 24×24: el mismo estilo que el set IVI «Línea», que sale de Tabler Icons, MIT)
function v4Svg(p,off){return `<svg class="v4i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}${off?'<path d="M3 3l18 18"/>':''}</svg>`;}
const v4E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function v4Lite(){try{document.documentElement.classList.toggle('v4lt',typeof mapMode!=='undefined'&&mapMode==='lite');}catch(e){}}

/* ---------- B) envíos: un solo interruptor (CFG.lgv) en la ficha ---------- */
function v4LgOn(){try{return typeof lgOn==='function'?lgOn():CFG.lgv!==0;}catch(e){return true;}}
function v4LgTitle(on){return on?'Envíos en el mapa: visibles (tocar para ocultar)':'Envíos en el mapa: ocultos (tocar para mostrar)';}
function v4LgHTML(kind){const on=v4LgOn();const a=`data-v4lg="1" aria-pressed="${on}" title="${v4LgTitle(on)}" aria-label="${v4LgTitle(on)}"`;
  return kind==='btn'?`<button type="button" class="btn v4lgb${on?' on':''}" ${a}>${v4Svg(V4_SHIP,!on)}</button>`:`<button type="button" class="v4lgp${on?' on':''}" ${a}><i>${v4Svg(V4_SHIP,!on)}</i><span>Envíos</span></button>`;}
function v4LgSync(){const on=v4LgOn();document.querySelectorAll('[data-v4lg]').forEach(b=>{if(b._on===on)return;b._on=on;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.title=v4LgTitle(on);b.setAttribute('aria-label',v4LgTitle(on));
  const s=b.querySelector('svg');if(s)s.outerHTML=v4Svg(V4_SHIP,!on);});}
function v4LgTog(){CFG.lgv=v4LgOn()?0:1;saveCfg();try{lgBtn();}catch(e){}try{lgKick();}catch(e){}v4LgSync();}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-v4lg]');if(!b)return;e.preventDefault();e.stopPropagation();v4LgTog();},true);
if(typeof lgBtn==='function'){const _lb=lgBtn;lgBtn=function(){const r=_lb.apply(this,arguments);try{v4LgSync();}catch(e){}return r;};}
try{const o=document.querySelector('.mmodes button.lgt');if(o)o.remove();}catch(e){}
function v4SelLg(){const box=$('selInfo');if(!box||!G||!G.sel||!P)return;const d=box.querySelector('.plfx');if(!d||d.querySelector('[data-v4lg]'))return;d.insertAdjacentHTML('beforeend',v4LgHTML('btn'));}
{const _rs=renderSel;renderSel=function(){const r=_rs.apply(this,arguments);try{v4SelLg();}catch(e){console.warn('v24b ficha',e);}return r;};}

/* ---------- A) ficha del lugar: ciudad y provincia sin desplazarse ---------- */
function v4Place(){const B=$('sheetIn');if(!B||!B.querySelector('.pltabs'))return;B.classList.add('v4pl');const T=PL.tab;
  const bar=T==='ci'?(B.querySelector('.plcy .pla')):T==='pr'?([...B.querySelectorAll('.pla')].find(x=>x.querySelector('[data-plz]'))):null;
  if(bar){if(!bar.querySelector('[data-v4lg]'))bar.insertAdjacentHTML('beforeend',v4LgHTML('pla'));bar.classList.add('v4ab');
    const sc=bar.previousElementSibling;if(sc&&sc.classList.contains('sect'))sc.classList.add('v4as');}
  if(!V3.on){return;}
  if(T==='ci'){const cy=B.querySelector('.plcy');if(cy){if(V4.ctc!==PL.city){V4.ctc=PL.city;V4.ct=null;}
      const clubs=[...cy.querySelectorAll('.item[data-plc]')];const list=[...B.children].filter(x=>x.matches('.item[data-pcy]'));
      const tabs=[];const ins=[];
      if(list.length){const w=document.createElement('div');w.className='v4cs';w.dataset.k='ci';list[0].before(w);list.forEach(x=>w.appendChild(x));ins.push(w);tabs.push(['ci','🏙️',`Otras ciudades (${list.length})`]);}
      if(clubs.length){const w=document.createElement('div');w.className='v4cs';w.dataset.k='cl';const sh=clubs[0].previousElementSibling;if(sh&&sh.classList.contains('sect'))w.appendChild(sh);clubs.forEach(x=>w.appendChild(x));ins.push(w);tabs.push(['cl','⚽',`Clubes (${clubs.length})`]);}
      if(tabs.length){const ct=document.createElement('div');ct.className='chips v4ct';ct.innerHTML=tabs.map(([k,ic,t])=>`<button type="button" data-v4ct="${k}" aria-expanded="false">${ic} ${t}</button>`).join('');cy.after(ct);
        let ref=ct;ins.forEach(w=>{ref.after(w);ref=w;});
        const sync=()=>{ins.forEach(w=>w.hidden=w.dataset.k!==V4.ct);ct.querySelectorAll('[data-v4ct]').forEach(b=>{const o=b.dataset.v4ct===V4.ct;b.classList.toggle('on',o);b.setAttribute('aria-expanded',o?'true':'false');});};
        ct.querySelectorAll('[data-v4ct]').forEach(b=>b.onclick=e=>{e.stopPropagation();V4.ct=V4.ct===b.dataset.v4ct?null:b.dataset.v4ct;sync();});sync();}}}
  if(bar)B.appendChild(bar);}
{const _sp=showPlace;const w=function(){const r=_sp.apply(this,arguments);try{v4Place();}catch(e){console.warn('v24b lugar',e);}return r;};w._shk=1;showPlace=w;}

/* ---------- D) barra de submenús: historial, métricas y filas que se arrastran ---------- */
function v4Tl(o){const t=((o&&o.key)||'').split('|')[0].trim();return t||'Atrás';}
function v4Crumbs(B){const x=B&&B.querySelector('.shx');if(!x||typeof SHK==='undefined')return;const S=SHK.stack||[];const bk=x.querySelector('.bk');if(!bk||!S.length)return;
  bk.textContent='‹ '+v4Tl(S[S.length-1]);bk.title='Volver a: '+v4Tl(S[S.length-1]);
  if(S.length>=2&&!x.querySelector('.v4ck')){const c=document.createElement('button');c.type='button';c.className='v4ck';c.textContent='‹‹ '+v4Tl(S[S.length-2]);c.title='Volver dos pantallas: '+v4Tl(S[S.length-2]);
    c.onclick=ev=>{ev.stopPropagation();SHK.stack.pop();shGoBack();};bk.after(c);}}
function v4MtHTML(L,id){if(!L||!L.length)return '';return `<div class="v4mt"${id?` id="${id}"`:''} role="list">${L.map(x=>`<span class="v4m" role="listitem"><small>${x[0]} ${v4E(x[1])}</small><b data-noi18n${x[4]?` class="${x[4]}"`:''}>${x[2]}</b><em>${x[3]}</em></span>`).join('')}</div>`;}
const v4Sg=v=>(v>=0?'+':'−')+Math.abs(v*100).toFixed(2)+' %';
function v4Met(k,a){const L=[];const f=(ic,l,v,t,c)=>L.push([ic,l,v,t,c||'']);if(!P||!G)return L;
  try{if(k==='car'){if(P.job&&typeof jobPay==='function')f('💵','Sueldo',fmt(jobPay(P)/12),'por mes');const ni=netIncome(P);f('💰','Neto',fmt(ni),'este año',ni<0?'d':'');if(typeof FTY==='function')f('⏳','Tiempo libre',`${Math.floor(P.ft||0)} / ${FTY(P)}`,'días este año');}
    else if(k==='pais'){const n=natOf(P);f('📈','Crecimiento',pct(n.g||0),'este año',(n.g||0)<0?'d':'u');if(isReal()&&n.infl!=null)f('🏷️','Inflación',pct(n.infl),'este año');f('⚖️','Estabilidad',Math.round(n.stab),'hoy');if(n.approval!=null)f('👍','Aprobación',Math.round(n.approval)+' %','hoy');f('🏛️','PIB',fmtN(n.gdp),'este año');}
    else if(k==='ban'){f('💵','Efectivo',fmt(P.dinero),'hoy',P.dinero<0?'d':'');f('🏛️','Patrimonio',fmt(netWorth(P)),'hoy');const dt=(P.debts||[]).reduce((s,d)=>s+(d.bal||0),0);f('💳','Deudas',fmt(dt),'hoy',dt>0?'d':'');}
    else if(k==='bol'){const x=homeEx();if(G.mk&&G.mk.X&&G.mk.X[x]&&EXCH0[x]){const tf=CFG.mtf||'m';const c=tkChg(x,tf);f('📈',EXCH0[x].ix,lvF(G.mk.X[x].lv),'hoy');if(isFinite(c))f(c>=0?'▲':'▼','Cambio',v4Sg(c),'en '+MTF[tf],c>=0?'u':'d');}f('💵','Efectivo',fmt(P.dinero),'hoy');}
    else if(k==='emp'){const b=bzList(P)[a&&a[0]];if(b&&b.m&&b.m.length){const m=b.m[b.m.length-1];f('🧾','Ventas',fmt(m.rev),'último mes');f('💰','Utilidad',fmt(m.net),'último mes',m.net<0?'d':'u');
        if(b.m.length>=4){const o=b.m[b.m.length-4];f('🕒','Utilidad',fmt(o.net),'hace 3 meses',o.net<0?'d':'');}}}
    else if(k==='empl'){const Lb=bzList(P);if(Lb.length){let s=0,v=0;Lb.forEach(b=>{const m=b.m&&b.m[b.m.length-1];if(m){s+=m.net||0;v+=m.rev||0;}});f('🏪','Empresas',Lb.length,'hoy');f('🧾','Ventas',fmt(v),'último mes');f('💰','Utilidad',fmt(s),'último mes',s<0?'d':'u');}}
  }catch(e){}return L;}
function v4MetPut(B,c){if(!B||B.querySelector(':scope>.v4mt'))return;const h=v4MtHTML(v4Met(c[0],c[1]));if(!h)return;
  const kids=[...B.children].slice(0,6);const tr=kids.find(x=>x.matches('.ntabs,.mkt,.nwt'));const h3=kids.find(x=>x.tagName==='H3');const ref=tr||h3||B.querySelector(':scope>.shx');
  if(ref)ref.insertAdjacentHTML('afterend',h);else B.insertAdjacentHTML('afterbegin',h);}
function v4Ctx(n,k){const f=window[n];if(typeof f!=='function')return;const w=function(...a){V4.cx.push([k,a]);try{return f.apply(this,a);}finally{V4.cx.pop();}};w._shk=1;window[n]=w;}
[['showMarket','bol'],['showBizD','emp'],['showBiz','empl'],['showBanks','ban'],['showFinance','ban'],['showJob','car'],['showEconomy','pais']].forEach(([n,k])=>{try{v4Ctx(n,k);}catch(e){}});
{const _o=openSheetRaw;openSheetRaw=function(){const r=_o.apply(this,arguments);try{const B=$('sheetIn');v4Crumbs(B);const c=V4.cx[V4.cx.length-1];if(c)v4MetPut(B,c);v4RowScan(true);}catch(e){console.warn('v24b hoja',e);}return r;};}
// País (panel en horizontal): métricas debajo de las pestañas
{const _rv=renderView;renderView=function(){const r=_rv.apply(this,arguments);try{v4Lite();if(P&&G&&VIEW.v==='pa'){const t=$('natTabs');if(t){const h=v4MtHTML(v4Met('pais'),'v4np');let e=$('v4np');
    if(!e){t.insertAdjacentHTML('afterend',h);}else if(e._h!==h){e.outerHTML=h;}e=$('v4np');if(e)e._h=h;}}v4RowScan();}catch(e){console.warn('v24b país',e);}return r;};}
// filas largas: barra fina que se agarra y arrastra; con ratón, arrastre directo con inercia suave
const V4_ROW='.ntabs,.mkt,.nwt,.chips:not(.ivs),.tfs,.v4mt,.abx';
function v4Thumb(r){let t=r._v4t;const ov=r.clientWidth>0&&r.scrollWidth>r.clientWidth+2;
  if(!t){if(!ov)return;t=document.createElement('div');t.className='v4th';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i>';r.after(t);r._v4t=t;
    r.addEventListener('scroll',()=>v4ThumbPos(r),{passive:true});
    t.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const w=t.clientWidth||1;const k=r.scrollWidth/w;const i=t.firstChild;const ib=i.getBoundingClientRect();const tb=t.getBoundingClientRect();
      if(e.clientX<ib.left||e.clientX>ib.right)r.scrollLeft=(e.clientX-tb.left-ib.width/2)*k;const x0=e.clientX,s0=r.scrollLeft;t.classList.add('v4g');try{t.setPointerCapture(e.pointerId);}catch(_){}
      const mv=ev=>{r.scrollLeft=s0+(ev.clientX-x0)*k;};const up=()=>{t.classList.remove('v4g');t.removeEventListener('pointermove',mv);t.removeEventListener('pointerup',up);t.removeEventListener('pointercancel',up);};
      t.addEventListener('pointermove',mv);t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up);});}
  t.hidden=!ov;if(ov)v4ThumbPos(r);}
function v4ThumbPos(r){const t=r._v4t;if(!t)return;const i=t.firstChild;const k=r.clientWidth/Math.max(1,r.scrollWidth);i.style.width=(k*100)+'%';i.style.transform=`translateX(${r.scrollLeft/Math.max(1,r.clientWidth)*100}%)`;}
function v4Drag(r){if(r._v4d)return;r._v4d=1;let d=null,raf=0;
  r.addEventListener('click',e=>{if(r._v4k&&performance.now()-r._v4k<350){e.preventDefault();e.stopPropagation();r._v4k=0;}},true);
  r.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||r.scrollWidth<=r.clientWidth+2)return;cancelAnimationFrame(raf);const now=performance.now();d={x:e.clientX,s:r.scrollLeft,lx:e.clientX,lt:now,v:0,mv:false};
    const mv=ev=>{if(!d)return;const dx=ev.clientX-d.x;if(!d.mv&&Math.abs(dx)>4){d.mv=true;r.style.scrollBehavior='auto';r.style.scrollSnapType='none';}if(!d.mv)return;r.scrollLeft=d.s-dx;const t=performance.now();const dt=Math.max(1,t-d.lt);d.v=d.v*.6+((ev.clientX-d.lx)/dt)*.4;d.lx=ev.clientX;d.lt=t;};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(!d)return;const o=d;d=null;if(!o.mv)return;r._v4k=performance.now();
      let v=-o.v*16;const step=()=>{v*=.92;r.scrollLeft+=v;if(Math.abs(v)>.4)raf=requestAnimationFrame(step);else{r.style.scrollBehavior='';r.style.scrollSnapType='';}};if(Math.abs(v)>.6)raf=requestAnimationFrame(step);else{r.style.scrollBehavior='';r.style.scrollSnapType='';}};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});}
function v4Rows(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll(V4_ROW).forEach(r=>{v4Drag(r);if(!r.classList.contains('abx'))v4Thumb(r);});}
let V4_Q=0,V4_RS=0;function v4RowScan(force){const now=performance.now();if(!force&&now-V4_RS<600)return;V4_RS=now;if(V4_Q)return;V4_Q=requestAnimationFrame(()=>{V4_Q=0;try{v4Rows($('sheetIn'));v4Rows(document.querySelector('.app'));v4Rows($('selInfo'));v4Rows($('cmdBar'));}catch(e){}});}
addEventListener('resize',()=>v4RowScan(true));

/* ---------- C) riel de gotas: categorías y submenús que brotan ---------- */
const V4G=[['din','💰','Dinero',/🏦|📈|🏪|💼|💳|💰|🪙|🧾|🚗|Banco|Bolsa|empresa|Finanzas|Bienes|negocio|Servicios|Impuesto|Lotería|Cripto/i],
 ['vid','👥','Tu vida',/👥|🏅|❤|💍|👶|🩺|⭐|🎭|Personas|Familia|Ambición|logro|Salud|Fama|Dinast|Amig/i],
 ['mun','🌍','Mundo',/📰|🌍|🗺|⚽|🎸|🚚|🌿|⚔|🛡|🏛|Noticias|Periódico|Mundo|Fútbol|Club|Banda|Grupo|Logística|Naturaleza|Guerra|País/i],
 ['apr','📘','Aprender',/📘|📖|🎓|📚|💡|Guía|Glosario|Aprender|Fuentes|Sabías/i],
 ['sis','⚙️','Juego',/⚙|💾|⏱|🎯|🔄|🗂|📤|🔒|Ajustes|Guardar|Partida|Ranura|velocidad|Órdenes|Recorrido|Copia/i]];
const V4_OTR=['otr','✨','Otros'];
function v4Title(x){return ((x.querySelector('.t')||x).textContent||'').trim();}
function v4Group(B){if(!B||B.querySelector('.v4gh'))return V4.gr||[];const its=[...B.children].filter(x=>x.matches&&x.matches('.item'));if(its.length<7)return [];
  const by={};its.forEach(x=>{const t=v4Title(x);let k='otr';for(const g of V4G)if(g[3].test(t)){k=g[0];break;}(by[k]=by[k]||[]).push(x);});
  const keys=V4G.map(g=>g[0]).concat('otr').filter(k=>by[k]);const vis=k=>by[k].some(x=>x.style.display!=='none');if(keys.filter(vis).length<2)return [];
  const an=document.createComment('v24b');its[0].before(an);const fr=document.createDocumentFragment();const out=[];
  keys.forEach(k=>{const g=V4G.find(z=>z[0]===k)||V4_OTR;const h=document.createElement('div');h.className='sect v4gh';h.dataset.g=k;h.textContent=g[1]+' '+g[2];if(!vis(k))h.style.display='none';else out.push({k,ic:g[1],lab:g[2]});fr.appendChild(h);by[k].forEach(x=>fr.appendChild(x));});
  an.replaceWith(fr);V4.gr=out;return out;}
function v4DropsClose(){const d=$('v4dr');if(d){d.classList.remove('v4o');d.hidden=true;}V4.dn=null;}
function v4Sprout(id){const nav=$(id);if(!V3.on||document.documentElement.classList.contains('v3rc')||!nav||!sheetIsOpen()){v4DropsClose();return;}
  const B=$('sheetIn');if(!B)return;let L=[];
  if(id==='nMore'){const gr=B.querySelector('.v4gh')?(V4.gr||[]):v4Group(B);L=gr.map(g=>({ic:g.ic,lab:g.lab,k:'g:'+g.k}));}
  if(!L.length)L=[...B.querySelectorAll('.item')].filter(x=>!x.disabled&&x.style.display!=='none'&&!x.classList.contains('ezlk')&&x.offsetParent!==null).slice(0,6).map(x=>{const t=v4Title(x);const [ic,tx]=plSplit(t);return {ic:ic||'•',lab:(tx||t).replace(/[:(].*$/,'').trim(),k:'i:'+t};});
  if(!L.length){v4DropsClose();return;}
  let d=$('v4dr');if(!d){d=document.createElement('div');d.id='v4dr';d.hidden=true;document.body.appendChild(d);
    d.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.v4d');if(!b)return;e.stopPropagation();v4DropGo(b.dataset.k);});}
  const same=V4.dn===id&&!d.hidden;V4.dn=id;if(!same)V4.dk=null;
  d.innerHTML=`<i class="v4dn" aria-hidden="true"></i><div class="v4dt" role="menu" aria-label="${v4E((nav.textContent||'').replace(/\d+/g,'').trim())}">${L.map((x,n)=>`<button type="button" class="v4d${V4.dk===x.k?' on':''}" role="menuitem" style="--n:${n}" data-k="${v4E(x.k)}" title="${v4E(x.lab)}"><i>${x.ic}</i><span>${v4E(x.lab)}</span></button>`).join('')}</div>`;
  const nb=nav.getBoundingClientRect();const sh=$('sheet');const sl=sh&&sheetIsOpen()?sh.getBoundingClientRect().left:innerWidth;const left=Math.round(nb.right+4);
  d.style.left=left+'px';d.style.top=Math.round(nb.top+nb.height/2-31)+'px';d.querySelector('.v4dt').style.maxWidth=Math.max(120,sl-left-26)+'px';
  d.hidden=false;v4Drag(d.querySelector('.v4dt'));if(same)d.classList.add('v4o');else{d.classList.remove('v4o');void d.offsetWidth;requestAnimationFrame(()=>d.classList.add('v4o'));}}
function v4DropGo(k){const n=V4.dn;if(!n)return;V4.dk=k;const run=()=>{const B=$('sheetIn');if(!B)return;
    if(k.slice(0,2)==='g:'){const h=B.querySelector(`.v4gh[data-g="${k.slice(2)}"]`);const S=$('sheet');if(h&&S){const top=S.scrollTop+h.getBoundingClientRect().top-S.getBoundingClientRect().top-48;S.scrollTo({top:Math.max(0,top),behavior:'smooth'});h.classList.remove('v4fl');void h.offsetWidth;h.classList.add('v4fl');}}
    else{const t=k.slice(2);const x=[...B.querySelectorAll('.item')].find(y=>v4Title(y)===t);if(x&&!x.disabled)x.click();}
    document.querySelectorAll('#v4dr .v4d').forEach(b=>b.classList.toggle('on',b.dataset.k===k));};
  const B=$('sheetIn');const root=B&&sheetIsOpen()&&B.querySelector(`.v4rm[data-n="${n}"]`);if(!root){const b=$(n);if(b)b.click();setTimeout(run,30);}else run();}
function v4RootMark(id){const B=$('sheetIn');if(!B||!sheetIsOpen()||B.querySelector('.v4rm'))return;const m=document.createElement('i');m.className='v4rm';m.hidden=true;m.dataset.n=id;B.appendChild(m);}
(function(){const inn=document.querySelector('.bottom>.in');if(inn&&!inn.querySelector('.v4cat')){[['tu','Tú'],['mu','Mundo'],['ju','Juego']].forEach(([c,t])=>{const e=document.createElement('div');e.className='v4cat';e.dataset.c=c;e.setAttribute('aria-hidden','true');e.textContent=t;inn.appendChild(e);});}
  [['nAct',null],['nCar','car'],['nNat','pais'],['nMore',null]].forEach(([id,k])=>{const b=$(id);if(!b||typeof b.onclick!=='function')return;const prev=b.onclick;
    b.onclick=function(){if(k)V4.cx.push([k,[]]);let r;try{r=prev.apply(this,arguments);}finally{if(k)V4.cx.pop();}
      try{if(id==='nMore'&&V3.on&&sheetIsOpen())v4Group($('sheetIn'));v4RootMark(id);}catch(e){console.warn('v24b menú',e);}setTimeout(()=>{try{v4Sprout(id);}catch(e){}},0);return r;};});})();
{const _c=closeSheet;closeSheet=function(){const r=_c.apply(this,arguments);setTimeout(()=>{if(!sheetIsOpen())v4DropsClose();},80);return r;};}
if(typeof v3eRailSet==='function'){const _rs=v3eRailSet;v3eRailSet=function(){const r=_rs.apply(this,arguments);v4DropsClose();return r;};}
addEventListener('resize',()=>v4DropsClose());
document.addEventListener('pointerdown',e=>{const t=e.target;if(!t||!t.closest)return;if(t.closest('#mapWrap')&&!sheetIsOpen())v4DropsClose();},true);

/* ---------- E) burbuja del mapa: acciones y cifras según el tipo de mapa ---------- */
const V4C=[['pol','🏛️','Política'],['eco','💰','Economía'],['nat','🌿','Naturaleza'],['log',null,'Logística'],['bol','📈','Bolsa']];
function v4CatOf(m){return /^(ric|pob|des|dev|emp|res)$/.test(m)?'eco':/^(ter|nat)$/.test(m)?'nat':m==='rsk'?'bol':'pol';}
function v4Cat(){const m=typeof MMODE!=='undefined'?MMODE:'pol';if(V4.cm!==m){V4.cm=m;V4.cat=null;}return V4.cat||v4CatOf(m);}
function v4SelB(q){const box=$('selInfo');const b=box&&box.querySelector(q);return b&&!b.disabled?b:null;}
function v4MpActs(rid,ci,cat,noMv){const r=G.regions[rid],nat=G.nations[r.o],me=natOf(P).id,c=ci!=null?CITIES[ci]:null;const A=[];const seen=new Set();
  const add=(ic,t,fn)=>{if(!t||seen.has(t))return;seen.add(t);A.push({ic,t,fn});};
  const leg=(q,ic0)=>{const b=v4SelB(q);if(!b)return;const [ic,t]=plSplit(b.textContent);add(ic||ic0,t.replace(/ ·.*$/,''),()=>plPress(q));};
  const ficha=()=>add('📋','Ficha',()=>{mpopHide();showPlace(rid,ci!=null?'ci':'pr');});
  const city=()=>{if(c&&plClubs(rid,c[3]).length)add('⚽','Clubes',()=>{mpopHide();PL.tab='ci';showPlace(rid,'ci');});};
  if(cat==='pol'){ficha();if(!noMv)leg('[data-ar="mv"]','🎯');if(r.o===me)add('🏛️','Ver tu país',()=>{mpopHide();setView('pa');});else if(P.ruler&&nat.alive)add('🤝','Diplomacia',()=>{mpopHide();showNationDip(nat.id);});
    leg('[data-na="war"]','⚔️');leg('[data-na="peace"]','🕊️');if(r.o!==me&&!(P.ruler&&nat.alive))leg('[data-na="dip"]','🤝');leg('[data-pa="move"]','🏠');}
  else if(cat==='eco'){leg('[data-pa="biz"]','🌮');leg('[data-pa="inv"]','💼');leg('[data-pa="build"]','🏗️');try{if(bzList(P).length)add('🏪','Mis empresas',()=>{mpopHide();showBiz();});}catch(e){}ficha();}
  else if(cat==='nat'){add('🌿','Naturaleza',()=>{mpopHide();showPlace(rid,'na');});if(r.o===me)add('🗺️','Naturaleza de tu país',()=>{mpopHide();VIEW.tab='nat';CFG.vtab='nat';saveCfg();setView('pa');});ficha();leg('[data-pa="build"]','🏗️');}
  else if(cat==='log'){const on=v4LgOn();add(v4Svg(V4_SHIP,!on),on?'Ocultar envíos':'Ver envíos',()=>{v4LgTog();mpopShow(V4.mp[0],V4.mp[1]);});
    if(typeof showLogi==='function'){add('🚚','Red logística',()=>{mpopHide();showLogi('red');});add('🚛','Transportistas',()=>{mpopHide();showLogi('emp');});}ficha();}
  else if(cat==='bol'){const ex=(typeof EXN!=='undefined'&&EXN[nat.id])||[];if(ex.length)add('📈',EXCH0[ex[0]].nm||'Bolsa',()=>{mpopHide();MKV.ex=ex[0];showMarket('mk');});else add('📈','Bolsa',()=>{mpopHide();showMarket('mk');});
    if(typeof showBanks==='function')add('🏦','Bancos',()=>{mpopHide();showBanks();});ficha();}
  city();const out=A.slice(0,5);
  out.push({ic:'🔍',t:'Acercar',fn:()=>{mpopHide();const w=$('mapWrap');const p=c||RG[rid].c;const nw=clamp(vb.w*.45,ZMIN,MW*1.1),nh=nw*w.clientHeight/w.clientWidth;tweenVB(p[0]-nw/2,p[1]-nh/2,nw,300);}});return out;}
function v4MpMet(rid,cat){const r=G.regions[rid],nat=G.nations[r.o];const M=[];const m=(ic,l,v,t,col)=>M.push(`<span${col?` style="color:${col}"`:''}>${ic} <small>${l}</small> <b data-noi18n>${v}</b> <em>${t}</em></span>`);
  try{if(cat==='pol'){m('😊','Felicidad',Math.round(r.hap),'hoy');m('⚖️','Estabilidad',Math.round(nat.stab),'hoy');}
    else if(cat==='eco'){const pc=r.pop>0?r.gdp/r.pop:0;m('💰','PIB por persona',fmtN(pc),'este año');m('📈','Crecimiento',pct((r.gl||0)*100),'este año');if(G.sh&&typeof placeEco==='function'){const E=placeEco(rid);if(E)m('🏢','Actividad',Math.round(E.a)+'/100','este mes');}}
    else if(cat==='nat'){const o=typeof ntProv==='function'?ntProv(rid):null;if(o)m('🌿','Ecosistema',o.eco.v,'hoy');const W=typeof ntWater==='function'?ntWater(rid):null;if(W)m('💧','Agua',W.v,'hoy');}
    else if(cat==='log'){if(typeof lgNat==='function'){const o=lgNat(nat.id);m(v4Svg(V4_SHIP),'Eficiencia',o.sc+'/100','este año');m('📦','Flete',(o.D>=0?'+':'−')+Math.abs(o.D*100).toFixed(1)+' %','contra lo normal');}}
    else if(cat==='bol'){const ex=(typeof EXN!=='undefined'&&EXN[nat.id])||[];const x=ex[0];if(x&&G.mk&&G.mk.X&&G.mk.X[x]){const tf=CFG.mtf||'m';const c=tkChg(x,tf);m('📈',EXCH0[x].ix,lvF(G.mk.X[x].lv),isFinite(c)?`${v4Sg(c)} en ${MTF[tf]}`:'hoy');}else m('📈','Bolsa','—','sin bolsa propia');}
  }catch(e){}return M.length?`<div class="v4mm">${M.join('')}</div>`:'';}
function v4MpBody(rid,ci,noMv){const cat=v4Cat();V4.acts=v4MpActs(rid,ci,cat,noMv);
  const strip=`<div class="v4mc" role="tablist" aria-label="Tipo de mapa">${V4C.map(([k,ic,t])=>`<button type="button" class="v4cc${k===cat?' on':''}" role="tab" aria-selected="${k===cat}" data-v4cat="${k}" title="${t}"><i>${ic||v4Svg(V4_SHIP)}</i><span>${t}</span></button>`).join('')}</div>`;
  return strip+v4MpMet(rid,cat)+`<div class="mpa v4mpa${V4.acts.length>4?' v4m6':''}">${V4.acts.map((a,i)=>`<button type="button" data-v4a="${i}"><i>${a.ic}</i><span>${v4E(a.t)}</span></button>`).join('')}</div>`;}
{const _mh=mpopHTML;mpopHTML=function(rid,ci){let h=_mh(rid,ci);try{const i=h.lastIndexOf('<div class="mpa">');if(i<0)return h;const j=h.indexOf('</div>',i);if(j<0)return h;const noMv=h.indexOf('data-mpar')>=0;
  h=h.slice(0,i)+v4MpBody(rid,ci,noMv)+h.slice(j+6);}catch(e){console.warn('v24b burbuja',e);}return h;};}
{const _ms=mpopShow;mpopShow=function(cx,cy){V4.mp=[cx,cy];const r=_ms.apply(this,arguments);try{const p=document.querySelector('#mapWrap .mpop');if(p){
  p.querySelectorAll('[data-v4a]').forEach(b=>b.onclick=e=>{e.stopPropagation();const a=V4.acts&&V4.acts[+b.dataset.v4a];if(a)a.fn();});
  p.querySelectorAll('[data-v4cat]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(V4.cat===b.dataset.v4cat&&v4Cat()===b.dataset.v4cat)return;V4.cm=typeof MMODE!=='undefined'?MMODE:'pol';V4.cat=b.dataset.v4cat;mpopShow(V4.mp[0],V4.mp[1]);});}}catch(e){console.warn('v24b burbuja',e);}return r;};}

{const _r=render;render=function(){const r=_r.apply(this,arguments);try{v4Lite();v4LgSync();}catch(e){}return r;};}
try{v4Lite();v4SelLg();}catch(e){}
