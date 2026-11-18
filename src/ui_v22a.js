/* v2.2a — Prueba 1 de estilo pixel (sección 9e): mapa mundial plano y limpio, tipo Plague Inc.
   - El mapa se dibuja a menor resolución (cada «pixel» del mapa mide f px CSS) y el navegador lo agranda sin suavizar
     (los lienzos ya llevan image-rendering:pixelated en build.js). Menos píxeles = menos trabajo de la GPU.
   - En WebGL, el shader cuantiza cada canal a q niveles con tramado ordenado 2×2 (uniform uPx de map.js).
   - En el modo ligero (Canvas 2D) solo baja la resolución: sin cuantizar, para no sumar un pase por píxel en equipos lentos.
   - El toque usa las coordenadas del mapa (vb) y el tamaño CSS del contenedor, no los píxeles del lienzo: no cambia la provincia elegida.
   - Se guarda en CFG.px ('' = actual, 'p1' = pixel fino, 'p1g' = pixel grueso). No toca partidas ni motores. */
const PX_PAL={
  p1:{n:'Pixel 1 · fino',f:2,q:6,lw:.25},   // 2 px CSS por pixel (4×4 en iPhone 11), 6 niveles por canal
  p1g:{n:'Pixel 1 · grueso',f:3,q:5,lw:.2}  // 3 px CSS por pixel, 5 niveles por canal
};
function pxSty(){return PX_PAL[CFG.px]||null;}
function pxApply(){const s=pxSty();PXQ=s&&mapMode==='gl'?s.q:0;PXDPR=s?s.lw:0;}
{const _fc=fitCanvas;fitCanvas=function(){pxApply();const s=pxSty();if(!s)return _fc();
  const w=wrap(),cw=Math.max(1,Math.round(w.clientWidth/s.f)),ch=Math.max(1,Math.round(w.clientHeight/s.f));
  ['glc','lc'].forEach(id=>{const c=$(id);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}});
  const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2;vb.h=vb.w*w.clientHeight/Math.max(1,w.clientWidth);vb.y=cy-vb.h/2;vb.x=cx-vb.w/2;};}
function pxSet(k){CFG.px=k;saveCfg();if(mapReady){fitCanvas();refreshMap();}}
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b||b.querySelector('[data-px]'))return;const m=CFG.px&&PX_PAL[CFG.px]?CFG.px:'';
  const x=document.createElement('div');x.className='item';x.style.display='block';x.id='cfPx';
  x.innerHTML=`<div class="t">🟪 Estilo del mapa (prueba)</div><div class="s"><span>Prueba 1 de estilo pixel: mapa plano con paleta reducida.</span> <span>Dibuja menos píxeles, así que también aligera el mapa.</span>${mapMode==='lite'?' <span>En el mapa ligero solo cambia la resolución.</span>':''}</div><div class="chips" style="margin-top:6px"><button data-px="" class="${m===''?'on':''}">Actual</button>${Object.keys(PX_PAL).map(k=>`<button data-px="${k}" class="${m===k?'on':''}">${PX_PAL[k].n}</button>`).join('')}</div>`;
  const ref=b.querySelector('#sMfx');(ref?ref.after(x):b.appendChild(x));
  x.querySelectorAll('[data-px]').forEach(y=>y.onclick=()=>{pxSet(y.dataset.px);showSettings();});}catch(e){console.warn('v22a ajustes',e);}};}
