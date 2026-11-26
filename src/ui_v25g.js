/* ===== v2.5g — interfaz heredada (pendiente G): recorrido guiado y botones de mapa en horizontal =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Se carga después de ui_v25b.js (después de ui_v11.js, que define TOUR y startTour).
   1) Recorrido guiado: algunos pasos apuntaban a elementos que en horizontal están ocultos o plegados (la ficha de
      personaje #topCard, el riel cuando está plegado). Al empezar, cada paso usa su alternativa visible: #topCard → burbuja
      Personaje (#v3pj); los botones del riel → el riel (.bottom); #clk y #tick → la barra superior (#v3top).
   2) Botones del mapa (modos, .mmodes) suben de 32 px a 44 px en horizontal, para tocarlos con el pulgar.
   Los pasos que no tienen alternativa se quedan igual (el recorte muestra el centro de la pantalla). */
(function(){
  const st=document.createElement('style');st.id='st25g';st.textContent=`
html.v3m body.land .mmodes button{width:44px!important;height:44px!important;min-width:44px;border-radius:12px}
html.v3m body.land .mmodes{gap:6px}
`;
  document.head.appendChild(st);
  if(typeof TOUR==='undefined'||typeof startTour!=='function')return;
  const FB={'#topCard':'#v3pj','#nAct':'.bottom','#nCar':'.bottom','#nNat':'.bottom','#nMore':'.bottom','#ageBtn':'.bottom','#clk':'#v3top','#tick':'#v3top'};
  const ORIG=TOUR.map(s=>s[0]);
  const visible=sel=>{if(!sel)return true;const el=document.querySelector(sel);if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
  const fixTour=()=>TOUR.forEach((s,i)=>{const o=ORIG[i];if(!o)return;s[0]=visible(o)?o:((FB[o]&&visible(FB[o]))?FB[o]:o);});
  const _st=startTour;
  startTour=function(){try{fixTour();}catch(e){}return _st();};
})();
