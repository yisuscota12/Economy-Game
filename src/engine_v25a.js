/* ===== v2.5a — jugabilidad: las navieras en venta solo salen en provincias con costa =====
   Corrige el pendiente F (naviera en venta podía salir tierra adentro). bzmGen elige la provincia al azar entre la del
   jugador y las de su país; bzmMake no revisaba costa, a diferencia de bzCanOpen. Ahora una naviera en provincia sin costa
   no genera oferta (la búsqueda de bzmGen reintenta con otra). No cambia el resto de ofertas ni reglas, guardado o imperioCfg.
   Se carga al final de engine (después de engine_v24c.js). */
(function(){
  if(typeof bzmMake!=='function'||typeof RG==='undefined')return;
  const _mk=bzmMake;
  bzmMake=function(p,T,r){
    if(T&&T.k==='naviera'&&RG[r]&&!RG[r].co)return null;
    return _mk(p,T,r);
  };
})();
