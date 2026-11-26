/* ===== v2.5c — jugabilidad: carga aérea del jugador para las rutas de pasajeros (pendiente E) =====
   Las rutas aéreas (aeRoutes, v2.4c) reparten pasajeros por gravedad entre aeropuertos. Hasta ahora tu carga aérea
   (empresa «Carga aérea», v2.4a) no contaba para los pasajeros. Esta versión: en cada ruta cuyo extremo (aeropuerto de
   provincia) tiene tu empresa de carga aérea, los pasajeros suben +8 % por empresa, con tope de +24 % (3 empresas).
   Solo cambia la cifra de pasajeros de la ruta (campo pax); no toca rutas, aeropuertos, PIB, precios, guardado ni imperioCfg.
   La cache de aeRoutes no se muta: se devuelve una copia con los pasajeros ajustados. Sin calibrar con simulación todavía. */
(function(){
  if(typeof aeRoutes!=='function'||typeof bzList!=='function')return;
  const _ar=aeRoutes;
  aeRoutes=function(){
    const R=_ar();
    let cnt={};
    try{
      if(P&&P.alive&&G.regions[P.r]){
        bzList(P).forEach(b=>{if(b&&b.k==='aerocarga'&&b.r!=null&&G.regions[b.r]&&!b.closed)cnt[b.r]=(cnt[b.r]||0)+1;});
      }
    }catch(e){cnt={};}
    if(!Object.keys(cnt).length)return R;
    return R.map(f=>{
      const n=Math.min(3,(cnt[f.a]||0)+(cnt[f.b]||0));
      return n?Object.assign({},f,{pax:Math.round(f.pax*(1+.08*n))}):f;
    });
  };
})();
