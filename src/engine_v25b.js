/* ===== v2.5b — jugabilidad: turismo interno (pendiente E) =====
   Hasta v2.4c solo había turismo internacional (llegadas de otros países). Esta versión agrega un ajuste leve por el
   turismo de los propios habitantes: las provincias con más atractivos (tuAttr) y población pesan un poco más para tus
   empresas de turismo. Se aplica dentro de tourF, justo después del factor de la provincia (tuProvF × tuEcoR).
   Rango acotado 0.97–1.08 para no romper el balance: sin calibrar con simulación (pendiente: nat23test/ec21test).
   No cambia el PIB, los impuestos, el tesoro ni el guardado; no toca imperioCfg. Se carga al final de engine. */
(function(){
  if(typeof tourF!=='function'||typeof tuAttr!=='function'||typeof G==='undefined')return;
  const _tf=tourF;
  tourF=function(n){
    let f=_tf(n);
    try{
      const b=NTZ.b;
      if(b&&G.regions[b.r]&&G.regions[b.r].o===n.id){
        const r=b.r,x=G.regions[r];
        const pop=Math.max(1,x.pop||0);
        const attr=tuAttr(r).v;                       // atractivos de la provincia (~0.05 a 3)
        const k=clamp(1+0.02*Math.log10(1+pop/1e5)*(attr-1),0.97,1.08);
        f*=k;
      }
    }catch(e){}
    return f;
  };
})();
