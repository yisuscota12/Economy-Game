/* ===== v2.5e — jugabilidad: la bolsa recalcula sus empresas según el PIB actual (pendiente E) =====
   Hasta v2.4c, el número de empresas que cotizan por país (mrCounts) usaba el PIB de los datos y era fijo.
   Ahora mrCounts usa el PIB vivo de cada país (G.nations), y al cambiar el año la bolsa revisa si faltan empresas:
   solo agrega (nunca quita) las que correspondan. Así, un país que crece mucho gana empresas que cotizan.
   Reutiliza la generación de mrEnsure (h21, sin Math.random); sin cambios en el cálculo de precios, reglas, guardado o imperioCfg.
   Sin calibrar con simulación todavía. Se carga al final de engine (después de engine_v25d.js). */
(function(){
  if(typeof mrCounts!=='function'||typeof mrEnsure!=='function'||typeof MR_A==='undefined')return;
  const live=nid=>{const n=G.nations&&G.nations[nid];return (n&&n.alive&&n.gdp>0)?n.gdp:((N0[nid]&&N0[nid].gdp)||1);};
  mrCounts=function(){
    const ns=Object.keys(EXN).filter(n=>N0[n]);
    const S=ns.reduce((s,n)=>s+Math.pow(live(n),MR_A),0);
    const o={};ns.forEach(n=>o[n]=clamp(Math.round(MR_T*Math.pow(live(n),MR_A)/S),MR_MIN,MR_MAX));return o;
  };
  const _me=mrEnsure;
  mrEnsure=function(){
    const M=G&&G.mk;
    if(M&&M.rp&&M.ry!==G.year)M.rp=0;   // año nuevo: la bolsa vuelve a revisar sus empresas
    if(M&&!M.rp)M.ry=G.year;
    return _me();
  };
})();
