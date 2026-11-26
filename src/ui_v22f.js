/* ===== v2.2f — interfaz: vista horizontal con riel, botones de 44 px, barras de acciones en burbujas y ficha de provincia/ciudad =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB. Usa las clases y textos que ya existen:
   el único texto nuevo es el aria-label «Acciones» de la burbuja (en español; pendiente de traducir, ver CONTEXTO_IA.md 9e).
   1) Riel horizontal: con body.land y alto <=520 px (iPhone en horizontal) la barra de abajo pasa a columna a la izquierda, el mapa
      ocupa todo el alto (100dvh) y la ficha de la provincia sube a la columna derecha. Respeta env(safe-area-inset-*).
   2) Botones: toque mínimo de 44 px; en estilo pixel (html[data-px=p2]) diseño limpio con bisel; el tema Actual conserva su aspecto.
   3) Burbujas: cada .mini-actions de #selInfo y #cmdBar se pliega en un botón redondo (icono + cuántas); al tocarlo se abre una pista
      con desplazamiento horizontal (transform/opacity/clip-path); se cierra al tocar fuera o al elegir una acción.
   4) Ficha de provincia/ciudad (#selInfo): encabezado (bandera, nombre, país), cifras clave, acción principal y la losa isométrica pixel. */
(function(){const st=document.createElement('style');st.id='st22f';st.textContent=`
/* --- seguridad de pantalla (viewport-fit=cover) --- */
.app{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}
body.land .app{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}
.bottom{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}
/* --- 2) toque mínimo de 44 px (sin cambiar el aspecto del tema Actual) --- */
.mini-actions .btn,.abx .btn,.plfx .btn{min-height:44px;touch-action:manipulation}
.btn,.item,.nav,#ageBtn{touch-action:manipulation}
.item{min-height:44px}
/* --- 3) burbujas de acciones --- */
.mini-actions.abub{position:relative;display:block;height:44px;margin-top:8px}
.abt{position:absolute;left:0;top:0;z-index:2;display:inline-flex;align-items:center;gap:5px;height:44px;min-width:44px;padding:0 12px;border-radius:22px;border:1px solid var(--gold);background:var(--card2);color:var(--gold);font-weight:800;font-size:15px;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;box-shadow:0 3px 10px rgba(0,0,0,.28);transition:transform .16s cubic-bezier(.2,.8,.2,1),background .16s}
.abt:active{transform:scale(.94)}
.abt .abn{font-size:11.5px;font-weight:800;min-width:18px;height:18px;line-height:18px;text-align:center;border-radius:9px;background:var(--gold);color:#1a1405;padding:0 4px}
.abt .abc{display:inline-block;font-size:13px;line-height:1;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.abub.open .abt{background:var(--gold);color:#1a1405}.abub.open .abt .abn{background:#1a1405;color:var(--gold)}
.abx{position:absolute;left:var(--abw,64px);right:0;top:0;height:44px;display:flex;flex-wrap:nowrap;align-items:center;gap:6px;padding:0 10px 0 6px;overflow-x:auto;overflow-y:hidden;scroll-behavior:smooth;scroll-snap-type:x proximity;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:none;
 opacity:0;transform:translateX(-14px);clip-path:inset(0 100% 0 0);visibility:hidden;pointer-events:none;transition:opacity .18s ease,transform .22s cubic-bezier(.2,.8,.2,1),clip-path .24s cubic-bezier(.2,.8,.2,1),visibility 0s linear .24s;
 -webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 22px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 22px),transparent)}
.abx::-webkit-scrollbar{display:none}
.abx>.btn,.abx>button{flex:0 0 auto;scroll-snap-align:start;white-space:nowrap}
.abub.open .abx{opacity:1;transform:none;clip-path:inset(0 0 0 0);visibility:visible;pointer-events:auto;transition-delay:0s}
/* --- 4) ficha de provincia/ciudad --- */
#selInfo.sil{background:var(--card2);border:1px solid var(--line);border-radius:14px;padding:10px 12px;box-shadow:0 6px 18px rgba(0,0,0,.26)}
#selInfo .sih{display:flex;align-items:center;gap:9px;margin-bottom:8px}
#selInfo .sitl{display:none}
#selInfo .sif{height:22px;width:auto;flex:none;border-radius:3px}
#selInfo .sit{flex:1;min-width:0;line-height:1.25;font-size:12px;color:var(--mut)}
#selInfo .sit .sin{display:block;font-size:17px;font-weight:800;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#selInfo .sik{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}
#selInfo .sic{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-size:13px;color:var(--ink)}
#selInfo .sic b{font-weight:800}
#selInfo.sil .mem{font-size:12px}
#selInfo .plfx{display:flex;gap:6px;margin:0 0 8px}
#selInfo .plfx .btn{flex:1 1 0;min-width:0}
#selInfo .plfx .btn.gold{flex:2 1 0}
.mpop{border-radius:16px}
@media (prefers-reduced-motion:reduce){.abt,.abx,.abt .abc{transition:none!important}}
/* --- 1) vista horizontal con riel (iPhone en horizontal) --- */
html.rail{--navh:0px!important}
html.rail body.land .bottom{left:0;right:auto;top:0;bottom:0;width:calc(86px + env(safe-area-inset-left));padding:calc(6px + env(safe-area-inset-top)) 6px calc(6px + env(safe-area-inset-bottom)) calc(6px + env(safe-area-inset-left));background:var(--bg);border-right:1px solid var(--line);box-shadow:none}
html.rail body.land .bottom .in{max-width:none!important;height:100%;grid-template-columns:1fr!important;grid-auto-rows:minmax(44px,1fr);gap:5px;align-items:stretch;justify-content:stretch}
html.rail body.land #ageBtn{grid-column:auto;padding:6px 2px;font-size:13px;border-radius:14px;box-shadow:none}
html.rail body.land .nav{flex-direction:column;justify-content:center;gap:1px;padding:3px 2px;font-size:11px;min-height:44px;line-height:1.1}
html.rail body.land .nav .ic{font-size:17px}
html.rail body.land .app{grid-template-columns:minmax(0,1fr) minmax(300px,38vw);padding:calc(8px + env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(96px + env(safe-area-inset-left))}
html.rail body.land:not(.mapfull) .app>.mapcard{display:contents}
html.rail body.land:not(.mapfull) .app>.mapcard #mapWrap{grid-column:1;grid-row:1/span 30;position:sticky;top:calc(8px + env(safe-area-inset-top));align-self:start;flex:none;height:calc(100vh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;height:calc(100dvh - 16px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important;border:1px solid var(--line)}
html.rail body.land:not(.mapfull) #cmdBar,html.rail body.land:not(.mapfull) #selInfo{grid-column:2;margin:0 0 10px}
html.rail body.land:not(.mapfull) #selInfo{max-height:none;overflow:visible}
html.rail body.mapfull #mapWrap{left:calc(86px + env(safe-area-inset-left));bottom:0}
html.rail body.mapfull #selInfo{left:calc(96px + env(safe-area-inset-left));right:calc(8px + env(safe-area-inset-right));bottom:calc(8px + env(safe-area-inset-bottom));max-width:48vw;max-height:46vh;max-height:46dvh}
html.rail .ff{right:calc(12px + env(safe-area-inset-right));bottom:calc(10px + env(safe-area-inset-bottom))}
html.rail #mnx{left:calc(96px + env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom))}
html.rail body.land .sheet{top:calc(6px + env(safe-area-inset-top));bottom:0;max-height:none!important;padding-right:calc(12px + env(safe-area-inset-right));padding-bottom:calc(14px + env(safe-area-inset-bottom))}
html.rail body.land .modal{left:calc(50% + 43px);max-height:calc(100vh - 16px)!important;max-height:calc(100dvh - 16px)!important;top:50%!important;width:min(calc(100vw - 120px),460px)}
/* --- estilo pixel (html[data-px=p2]) --- */
html[data-px=p2] :is(.mini-actions,.abx,.plfx) .btn{min-height:44px;padding:0 14px;font-family:var(--pxf);font-size:12.5px;letter-spacing:.02em;font-weight:700;background-color:var(--card2);box-shadow:inset 2px 2px 0 var(--px-hi),inset 0 -3px 0 var(--px-lo)!important}
html[data-px=p2] :is(.mini-actions,.abx,.plfx) .btn.gold{background:var(--gold);color:#1a1405;border-color:color-mix(in srgb,var(--gold) 45%,#000)!important;box-shadow:inset 2px 2px 0 rgba(255,255,255,.45),inset 0 -3px 0 rgba(0,0,0,.35)!important}
html[data-px=p2] :is(.mini-actions,.abx,.plfx) .btn.red{border-color:var(--red)!important}
html[data-px=p2] :is(.mini-actions,.abx,.plfx) .btn:disabled{opacity:.45;filter:saturate(.4)}
html[data-px=p2] .abt{border:2px solid var(--px-edge);clip-path:var(--px-cut);border-radius:0;box-shadow:inset 2px 2px 0 var(--px-hi),inset 0 -3px 0 var(--px-lo);font-family:var(--pxf);transition:transform 60ms steps(2,end)}
html[data-px=p2] .abt:active{transform:translateY(2px);filter:brightness(.92)}
html[data-px=p2] .abx{clip-path:inset(0 100% 0 0)}html[data-px=p2] .abub.open .abx{clip-path:inset(0 0 0 0)}
html[data-px=p2] #selInfo.sil{border:2px solid var(--px-edge);border-radius:0;background-color:var(--card2);box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo),0 3px 0 var(--px-slab,rgba(0,0,0,.4))}
html[data-px=p2] #selInfo .sic{border:2px solid var(--px-edge);border-radius:0;font-family:var(--pxn);font-size:12px;background:var(--card);box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo)}
html[data-px=p2] #selInfo .sit .sin{font-family:var(--pxf);font-size:15px;letter-spacing:.02em}
html[data-px=p2] #selInfo .sih{border-bottom:2px solid var(--px-edge);padding-bottom:8px;margin-bottom:8px}
html[data-px=p2] #selInfo .sif{border-radius:0;image-rendering:pixelated}
/* losa isométrica (la misma que el barrio de la prueba 3): cara de césped, canto de tierra y remate de tejado */
html[data-px=p2] #selInfo .sitl{display:block;position:relative;flex:none;width:30px;height:20px}
html[data-px=p2] #selInfo .sitl::before,html[data-px=p2] #selInfo .sitl::after{content:'';position:absolute;left:0;width:30px;height:16px;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)}
html[data-px=p2] #selInfo .sitl::before{top:4px;background:var(--c-roof,#a8473b)}
html[data-px=p2] #selInfo .sitl::after{top:0;background:linear-gradient(135deg,var(--c-grass,#5f9a3e) 0 50%,var(--c-grass2,#548b37) 50%)}
html[data-px=p2] .mpop{box-shadow:inset 2px 2px 0 var(--px-hi),inset -2px -2px 0 var(--px-lo),0 3px 0 var(--px-slab,rgba(0,0,0,.4))!important}
html[data-px=p2] .mpop::after{display:none}
html[data-px=p2].rail body.land .bottom,html[data-px=p2].rail body.land .bottom .in{background-image:none}
html[data-px=p2] .mpa button:first-child{box-shadow:inset 0 0 0 2px var(--gold),inset -2px -4px 0 var(--px-lo)!important}
`;document.head.appendChild(st);})();

/* ---------- riel horizontal: se activa con body.land y alto <= 520 px ---------- */
function railUpdate(){try{const on=document.body.classList.contains('land')&&innerHeight<=520;const h=document.documentElement;if(h.classList.contains('rail')===on)return;h.classList.toggle('rail',on);
  try{navH();}catch(e){}setTimeout(()=>{try{if(typeof resizeMap==='function')resizeMap();else dispatchEvent(new Event('resize'));}catch(e){}},60);}catch(e){}}
{const _ao=applyOrient;applyOrient=function(){_ao.apply(this,arguments);railUpdate();};}
addEventListener('resize',()=>{clearTimeout(railUpdate._t);railUpdate._t=setTimeout(railUpdate,170);});addEventListener('orientationchange',()=>setTimeout(railUpdate,350));
railUpdate();

/* ---------- 3) barras de acciones plegadas en burbujas ---------- */
function abClose(except){document.querySelectorAll('.abub.open').forEach(b=>{if(b!==except){b.classList.remove('open');const t=b.querySelector('.abt');if(t)t.setAttribute('aria-expanded','false');}});}
function abMake(m){if(m.dataset.bub||m.classList.contains('plfx'))return;const bs=[...m.children].filter(x=>x.tagName==='BUTTON');if(bs.length<2)return;m.dataset.bub='1';
  const ic=(String(bs[0].textContent||'').trim().match(/^(\p{Extended_Pictographic}️?)/u)||['','⚡'])[1]||'⚡';
  const t=document.createElement('div');t.className='abt';t.setAttribute('role','button');t.tabIndex=0;t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Acciones');t.setAttribute('data-noi18n','');
  t.innerHTML=`<span>${ic}</span><span class="abn">${bs.length}</span><span class="abc" aria-hidden="true">›</span>`;
  const x=document.createElement('div');x.className='abx';bs.forEach(b=>x.appendChild(b));m.classList.add('abub');m.insertBefore(t,m.firstChild);m.appendChild(x);
  const tog=e=>{e.stopPropagation();const open=!m.classList.contains('open');abClose(m);m.classList.toggle('open',open);t.setAttribute('aria-expanded',open?'true':'false');t.querySelector('.abc').style.transform=open?'rotate(180deg)':'';
    if(open){x.scrollLeft=0;requestAnimationFrame(()=>{m.style.setProperty('--abw',(t.offsetWidth+6)+'px');});}};
  m.style.setProperty('--abw','64px');t.onclick=tog;t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}};
  x.addEventListener('click',e=>{if(e.target.closest('button')){setTimeout(()=>abClose(),0);}});
  requestAnimationFrame(()=>m.style.setProperty('--abw',(t.offsetWidth+6)+'px'));}
function abScan(){['selInfo','cmdBar'].forEach(id=>{const b=document.getElementById(id);if(b)b.querySelectorAll('.mini-actions:not([data-bub])').forEach(abMake);});}
(function(){let q=0;const run=()=>{q=0;try{abScan();}catch(e){}};const mo=new MutationObserver(()=>{if(!q)q=requestAnimationFrame(run);});
  ['selInfo','cmdBar'].forEach(id=>{const b=document.getElementById(id);if(b)mo.observe(b,{childList:true,subtree:true});});run();
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.abub'))abClose();},true);
  addEventListener('scroll',()=>abClose(),{passive:true});})();

/* ---------- 4) ficha de provincia/ciudad: jerarquía ---------- */
function selDecor(){try{const box=$('selInfo');if(!box)return;if(!G||!G.sel||!RG[G.sel]||!P||!G.regions[G.sel]){box.classList.remove('sil');return;}
  if(box.querySelector('.sih'))return;const rid=G.sel,r=G.regions[rid];const lead=[];for(const n of [...box.childNodes]){if(n.nodeType===1&&n.tagName==='DIV')break;lead.push(n);}if(!lead.length)return;
  const hd=document.createElement('div');hd.className='sih';const tile=document.createElement('i');tile.className='sitl';tile.setAttribute('aria-hidden','true');hd.appendChild(tile);
  const fl=lead.find(n=>n.nodeType===1&&n.tagName==='IMG');if(fl){fl.classList.add('sif');fl.style.height='';hd.appendChild(fl);}
  const tt=document.createElement('div');tt.className='sit';const nm=lead.find(n=>n.nodeType===1&&n.tagName==='B');if(nm){nm.classList.add('sin');tt.appendChild(nm);}
  lead.forEach(n=>{if(n!==fl&&n!==nm)tt.appendChild(n);});hd.appendChild(tt);
  const pc=r.pop>0?r.gdp/r.pop:0;const ch=(i,v,c)=>`<span class="sic"${c?` style="color:${c}"`:''}>${i} <b>${v}</b></span>`;
  const ks=document.createElement('div');ks.className='sik';ks.innerHTML=ch('👥',fmtPop(r.pop))+ch('💰',fmtN(pc))+ch('😊',Math.round(r.hap),'rgb('+ramp(r.hap/100)+')');
  box.insertBefore(ks,box.firstChild);box.insertBefore(hd,ks);
  const pf=box.querySelector('.plfx');if(pf){ks.after(pf);const g=pf.querySelector('[data-plf]');if(g)g.classList.add('gold');}
  box.classList.add('sil');}catch(e){}}
{const _rs=renderSel;renderSel=function(){_rs.apply(this,arguments);selDecor();};}
try{selDecor();}catch(e){}
