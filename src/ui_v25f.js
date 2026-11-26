/* ===== v2.5f — interfaz (pendiente F): métricas en Salud y Familia, y 6 meses de historial en la ficha de empresa =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Usa el mismo patrón de ui_v24b.js: una tira de métricas (.v4mt) debajo de las pestañas de la pantalla.
   1) Salud (showHealth): salud, felicidad y el tiempo libre en el año.
   2) Familia (showFamily): familiares vivos, felicidad y tu cónyuge o pareja, si la hay.
   3) Ficha de empresa: utilidad de hace 6 meses, además de «el último mes» y «hace 3 meses».
   Las carreras especiales (fama, box y MMA) quedan para otra versión. Se carga después de ui_v25g.js. */
(function(){
  if(typeof v4Met!=='function'||typeof v4Ctx!=='function')return;
  const _m=v4Met;
  v4Met=function(k,a){
    const L=_m(k,a);
    try{
      const f=(ic,l,v,t,c)=>L.push([ic,l,v,t,c||'']);
      if(k==='sal'&&P){
        f('❤️','Salud',Math.round(P.s.salud||0),'hoy',(P.s.salud||0)<35?'d':'');
        f('😊','Felicidad',Math.round(P.s.felicidad||0),'hoy',(P.s.felicidad||0)<35?'d':'');
        if(typeof FTY==='function')f('⏳','Tiempo libre',`${Math.floor(P.ft||0)} / ${FTY(P)}`,'días este año');
      }
      if(k==='fam'&&P){
        const hijos=(P.children||[]).filter(x=>x&&x.alive!==false).length;
        const padres=(P.parents||[]).filter(x=>x&&x.alive!==false).length;
        f('👨‍👩‍👧','Familiares',padres+hijos+(P.partner?1:0),'vivos');
        if(P.partner)f('💍','Pareja',P.partner.name||'—','hoy');
        f('😊','Felicidad',Math.round((P.s&&P.s.felicidad)||0),'hoy');
      }
      if(k==='emp'&&a){
        const b=bzList(P)[a[0]];
        if(b&&b.m&&b.m.length>=7){const o=b.m[b.m.length-7];f('🗓️','Utilidad',fmt(o.net),'hace 6 meses',o.net<0?'d':'');}
      }
    }catch(e){}
    return L;
  };
  v4Ctx('showHealth','sal');
  v4Ctx('showFamily','fam');
})();
