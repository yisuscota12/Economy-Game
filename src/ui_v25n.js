/* ===== v2.5n — interfaz (último pendiente de la lista de métricas): récord en box y MMA =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Mismo patrón que ui_v25f.js y ui_v25j.js: una tira de métricas (.v4mt) debajo de las pestañas.
   Carrera de box o MMA (showCB): récord profesional y nocauts si ya eres profesional; si eres amateur,
   el récord amateur. Además, la fama y el nivel. Se carga después de ui_v25j.js. */
(function(){
  if(typeof v4Met!=='function'||typeof v4Ctx!=='function'||typeof fcFama!=='function'||typeof cbSp!=='function')return;
  const _m=v4Met;
  v4Met=function(k,a){
    const L=_m(k,a);
    try{
      if(k==='cb'&&P&&P.fc&&P.fc.cb){
        const c=P.fc.cb;
        if(c.pro&&typeof cbRec==='function'){
          L.push(['🥊','Récord',cbRec(c),'profesional','']);
          L.push(['💥','Nocauts',String(c.ko||0),'profesional','']);
        }else if(c.am){
          L.push(['🥊','Amateur',`${c.am.w}-${c.am.l}`,'récord','']);
        }
        L.push(['⭐','Fama',Math.round(fcFama(P.fc)),'hoy','']);
      }
    }catch(e){}
    return L;
  };
  v4Ctx('showCB','cb');
})();
