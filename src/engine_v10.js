/* ===== v1.0: provincias divididas — migración de partidas guardadas de la v0.9 ===== */
// SPLIT: provincia original → [la misma provincia (pieza principal), piezas nuevas…]
function migrateSplit(g){if(typeof SPLIT==='undefined')return;const B=regionBase();let n=0;
  for(const par in SPLIT){const kids=SPLIT[par],pr=g.regions[par];if(!pr||kids.every(k=>g.regions[k]))continue;
    const sg=kids.reduce((s,k)=>s+(B[k]?B[k][0]:0),0)||1,sp=kids.reduce((s,k)=>s+(B[k]?B[k][1]:0),0)||1;const G0=pr.gdp,P0=pr.pop;
    kids.forEach(k=>{const b=B[k]||[0,0];const q=k===par?pr:(g.regions[k]={o:pr.o,w0:RG[k]?RG[k].n:pr.w0});
      q.gdp=G0*b[0]/sg;q.pop=P0*b[1]/sp;q.g0=b[0];q.p0=b[1];
      if(k!==par){if(pr.hap!=null)q.hap=pr.hap;if(pr.dev!=null)q.dev=pr.dev;if(pr.cores)q.cores=pr.cores.slice();if(pr.cq!=null)q.cq=pr.cq;if(g.occ&&g.occ[par])g.occ[k]=g.occ[par];n++;}});}
  if(n)g._ov=(g._ov||0)+1;return n;}
