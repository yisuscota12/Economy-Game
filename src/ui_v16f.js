/* ===== v1.7q (v1.6f del plan): gráficos e íconos vectoriales =====
   1) Fuente «IVI» (src/ivi_font.js, generada con herramientas/iconos/build_iconos.py): cada emoji del juego se dibuja con un ícono vectorial propio.
      No cambia ningún texto: build.js antepone «IVI» a todas las listas de fuentes y la regla @font-face lleva unicode-range solo con esos caracteres,
      así que la fuente principal (métricas, altura de línea) sigue siendo la del sistema. Ajustes → Íconos vectoriales la apaga (vuelven los emoji del sistema).
   2) Safari/WebKit ignora la fuente cuando el carácter lleva el selector U+FE0F (⚠️, ⚔️, 🏛️…): se quita ese selector en pantalla, después de traducir. */
if(CFG.ivi===undefined)CFG.ivi=1;
const IVI_ON=!!CFG.ivi&&typeof IVI_B64!=='undefined';
if(IVI_ON){const st=document.createElement('style');st.id='ivif';st.textContent=`@font-face{font-family:IVI;src:url(data:font/woff2;base64,${IVI_B64}) format("woff2");unicode-range:${IVI_UR};font-display:block}`;document.head.appendChild(st);}
function iviStrip(n){const v=n.nodeValue;if(v&&v.indexOf('️')>=0){IVI_VS.lastIndex=0;const r=v.replace(IVI_VS,'$1');if(r!==v)n.nodeValue=r;}}
function iviTree(root){if(!root)return;if(root.nodeType===3){iviStrip(root);return;}if(root.nodeType!==1||/^(SCRIPT|STYLE)$/.test(root.nodeName))return;
  if(root.id==='mapOv'||root.id==='mapWrap')return; /* el mapa se redibuja seguido: sus íconos de edificios ya vienen sin selector (abajo) */
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))iviStrip(n);}
if(IVI_ON){const Q=new Set();let pend=0;const flush=()=>{pend=0;const L=[...Q];Q.clear();L.forEach(iviTree);};
  /* se registra después del observador de idiomas (ui_i18n.js), así que corre después de traducir */
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')Q.add(m.target);else m.addedNodes.forEach(n=>Q.add(n));}if(!pend){pend=1;Promise.resolve().then(flush);}})
    .observe(document.body,{childList:true,subtree:true,characterData:true});
  iviTree(document.body);
  try{if(typeof BLD!=='undefined')for(const k in BLD)if(BLD[k]&&BLD[k].ic)BLD[k].ic=BLD[k].ic.replace(IVI_VS,'$1');}catch(e){}}
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';
  x.innerHTML=`<span><div class="t">🎨 Íconos vectoriales: ${CFG.ivi?'activados':'desactivados'}</div><div class="s">Dibujos propios que se ven iguales en cualquier teléfono o computadora. Desactívalos para ver los emoji del sistema.</div></span>`;
  x.onclick=()=>{CFG.ivi=CFG.ivi?0:1;saveCfg();try{if(G&&P)saveNow();}catch(e){}location.reload();};const h3=b.querySelector('h3');if(h3)h3.after(x);};}
