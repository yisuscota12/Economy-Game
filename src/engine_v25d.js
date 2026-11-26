/* ===== v2.5d — jugabilidad: el empleo de las empresas estatales llega a tu red de personas (pendiente E) =====
   Hasta v2.4c, las empresas estatales (G.se) solo contaban en la salud de su sector y en el PIB. Ahora, cada mes, una persona
   de tu red (familia y amigos) que está sin empleo (y no es del gobierno) puede conseguir trabajo en una empresa estatal de su
   país. La probabilidad mensual es share × 2, con tope de 5 %, donde share = empleo de las estatales del país / (población × 0.45).
   Usa h21 (nada de Math.random), se suma después de hzPpMonth (lógica de v2.1c) y no cambia su código ni guardado ni imperioCfg. */
(function(){
  if(typeof hzPpMonth!=='function'||typeof hzPeople!=='function'||typeof hzEc!=='function')return;
  const _hp=hzPpMonth;
  hzPpMonth=function(p,t){
    _hp(p,t);
    try{
      if(!p||!p.alive||!G.sh||!G.se||!G.se.L||!G.se.L.length)return;
      const nid=natOf(p).id;const n=G.nations[nid];if(!n||!n.alive)return;
      let jobs=0;G.se.L.forEach(e=>{if(e&&e.n===nid&&!e.dead&&e.emp>0)jobs+=e.emp;});
      if(jobs<=0)return;
      const share=jobs/Math.max(1,(n.pop||0)*.45);
      const pr=clamp(share*2,0,.05);
      if(pr<=0)return;
      hzPeople(p).forEach(([x,g])=>{
        const e=hzEc(p,x);if(!e||e.e!==0||e.s==='gob')return;
        if(h21(x.name+'|se|'+t)<pr){
          e.e=1;const mm=e.m||0;e.m=0;
          x.rel=clamp((x.rel||50)+2,0,100);
          log(`💼 ${x.name} consigue empleo en una empresa estatal de ${n.name} después de ${mm||1} ${mm>1?'meses':'mes'}.`,'good');
        }
      });
    }catch(e){}
  };
})();
