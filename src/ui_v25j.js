/* ===== v2.5j — interfaz (pendiente final de F): métricas en la carrera de fama y el icono 🛃 =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Usa el mismo patrón de ui_v25f.js: una tira de métricas (.v4mt) debajo de las pestañas de la pantalla.
   1) Carrera de fama (showFame): fama actual y nivel. Si no hay carrera, la pantalla no cambia.
   Box y MMA quedan para otra versión (su pantalla de carrera tiene otra estructura).
   Se carga después de ui_v25i.js. */
(function(){
  if(typeof v4Met!=='function'||typeof v4Ctx!=='function'||typeof fcFama!=='function'||typeof fcTier!=='function')return;
  const _m=v4Met;
  v4Met=function(k,a){
    const L=_m(k,a);
    try{
      if(k==='fama'&&P&&P.fc){
        L.push(['⭐','Fama',Math.round(fcFama(P.fc)),'hoy','']);
        L.push(['🏅','Nivel',String(fcTier(P.fc)),'hoy','']);
      }
    }catch(e){}
    return L;
  };
  v4Ctx('showFame','fama');
})();
