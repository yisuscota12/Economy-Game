/* ===================== v2.5l — LA IA INVIERTE: AEROPUERTOS Y EMPRESAS ESTATALES =====================
   1) Aeropuertos de la IA: una vez al año (al cerrar el año de las estatales, envolviendo seAIYear) cada país de la IA con
      finanzas sanas y PIB ≥ 20 mil M puede ampliar UN aeropuerto (build(r,'aero'), igual que el jugador) si su conectividad
      (aeIdx actual) queda bajo el 85 % de la que pide su población e ingreso (nivel deseado por provincia elegible: 1; 2 con
      4 M de habitantes o ciudad ≥ 2 M e ingreso ≥ 4 mil; 3 con 10 M o ciudad ≥ 8 M e ingreso ≥ 12 mil). Probabilidad 20 % al
      año (h21), tope de 4 niveles construidos por la IA en cada país y obra ≤ 0.4 % del PIB del país (aeCost).
   2) Estatales con el tesoro de la IA: la IA no lleva n.treas (solo el país del jugador), así que su «tesoro» es su espacio
      fiscal: deuda ≤ 90 % del PIB, sin recesión ni crisis bancaria, inflación < 12 %, estabilidad ≥ 40, sin guerra, sin moratoria
      reciente ni programa del FMI. Lo que gasta se paga con deuda (n.debtR += gasto / PIB, como el préstamo del Banco Mundial).
      Con 12 % al año (h21): amplía su estatal más rentable (margen ≥ 5 %, no en quiebra; +25 % de capital y +3 de eficiencia) o,
      si no tiene ninguna así y le quedan cupos (< 4), funda la del giro con mejor margen esperado (≥ 4 %; seCalc de prueba)
      con capital pequeño (0.03 % del PIB). Tope de estatales: 0.15 % del PIB al año.
   Tope total de gasto de la IA por país: 0.5 % del PIB al año. Azar solo con h21; no se guarda nada nuevo (los niveles van
   en x.b.aero como los del jugador; las estatales en G.se). Interruptor: AIL.on (false = la IA vuelve a no invertir). */
const AIL={on:true,ae:0,sf:0,si:0,gasto:0,y:0};   // contadores de diagnóstico (no se guardan)
const AIL_K={aeP:.2,aeMax:4,aeObra:.004,seP:.12,seTope:.0015,tope:.005,deuda:.9};
function ailFisc(n){if(!n||!n.alive||playerRules(n.id)||n.gdp<2e10)return false;ensureEco(n);
  if(n.debtR>AIL_K.deuda||n.rec>0||(n.bk&&n.bk.cr>0)||n.stab<40||n.imf||(n.dft&&G.year-n.dft<6))return false;
  if(n.infl!=null&&isFinite(n.infl)&&n.infl>=12)return false;if(warsOf(n.id).length)return false;return true;}
function ailPay(n,c){ensureEco(n);n.debtR+=c/Math.max(1,n.gdp);AIL.gasto+=c;}
// nivel de aeropuerto que pide la provincia (población, ciudad principal e ingreso)
function ailAeTgt(r){const x=G.regions[r];if(!x||!aeElig(r))return 0;const C=aeCityPop();const cp=C[r]?C[r][0]:0;const pc=x.gdp/Math.max(1,x.pop);
  let t=1;if((x.pop>=4e6||cp>=2e6)&&pc>=4000)t=2;if((x.pop>=1e7||cp>=8e6)&&pc>=12000)t=3;return t;}
function ailAeYear(n,Y,left){const nid=n.id;if(h21(nid+'|'+Y+'|aia')>=AIL_K.aeP)return 0;
  const rs=regionsOf(nid).filter(r=>!(G.occ&&G.occ[r]));let ai=0,want=0;
  for(const r of rs){ai+=bl(r,'aero');const t=ailAeTgt(r);if(t)want+=t*Math.sqrt(Math.max(.05,G.regions[r].pop/1e6));}
  if(ai>=AIL_K.aeMax||want<=0||aeIdx(nid,false)>=want*.85)return 0;
  let best=null,bv=0;for(const r of rs){const d=ailAeTgt(r)-aeLvl(r);if(d<=0||!aeCan(r).ok)continue;const c=aeCost(r);if(c>n.gdp*AIL_K.aeObra||c>left)continue;
    const x=G.regions[r];const v=d*Math.sqrt(x.pop)*Math.sqrt(Math.max(1,x.gdp/Math.max(1,x.pop)));if(v>bv){bv=v;best=r;}}
  if(!best)return 0;const c=aeCost(best);build(best,'aero');ailPay(n,c);AIL.ae++;
  try{mkNews(`${n.name} amplía el aeropuerto de ${RG[best].nm} (${fmtN(c)}).`,false);}catch(q){}
  try{if(P&&P.alive&&G.regions[P.r]&&natOf(P).id===nid)log(`✈️ El gobierno amplía el aeropuerto de ${RG[best].nm}: ahora es de nivel ${aeLvl(best)}.`,'good');}catch(q){}
  return c;}
const AIL_SE=['transporte','financiera','fabrica','aerocarga','constructora','hotel','granja','petrolera','mina','farmacia'];
function ailSeYear(S,n,Y,left){const nid=n.id;if(h21(nid+'|'+Y+'|ait')>=AIL_K.seP)return 0;const lim=Math.min(left,n.gdp*AIL_K.seTope);if(lim<=0)return 0;
  const mine=S.L.filter(e=>e.n===nid&&!e.dead&&!e.qb);let best=null,bm=.05;mine.forEach(e=>{if(e.ail===Y)return;const m=e.m||0;if(m>=bm){bm=m;best=e;}});
  if(best){const c=Math.min(best.cap*.25,lim);if(c<=0)return 0;best.cap+=c;best.ef=clamp(best.ef+.03,.6,1.15);best.ail=Y;ailPay(n,c);AIL.si++;S.ch=(S.ch||0)+1;return c;}
  if(n.gdp<5e10||S.L.filter(e=>e.n===nid&&!e.dead).length>=4)return 0;const cap=n.gdp*SE_SZ[0][1];if(cap>lim)return 0;
  const R=shRefs();let bk=null,bkm=.04;for(const k of AIL_SE){if(seCan(nid,k)||S.L.some(e=>e.n===nid&&e.k===k&&!e.dead))continue;const r=seProv(nid,k);if(!r)continue;
    const c=seCalc({id:'T'+nid+k+Y,n:nid,k,r,cap,ef:.9},R);if(c&&isFinite(c.m)&&c.m>=bkm){bkm=c.m;bk=k;}}
  if(!bk)return 0;const e=seNew(S,nid,bk,cap,{ai:1,ail:Y});if(!e)return 0;ailPay(n,cap);AIL.sf++;S.ch=(S.ch||0)+1;
  try{mkNews(`${n.name} funda ${e.nm} con ${fmtN(cap)} de dinero público.`,false);}catch(q){}return cap;}
function ailYear(S){if(!AIL.on||!G||!S)return;const Y=G.year;if(AIL.y===Y&&AIL.g===G)return;AIL.y=Y;AIL.g=G;
  for(const nid in G.nations){const n=G.nations[nid];if(!ailFisc(n))continue;let left=n.gdp*AIL_K.tope;
    left-=ailAeYear(n,Y,left);if(left>0)ailSeYear(S,n,Y,left);}}
(function(){if(typeof seAIYear!=='function')return;const _o=seAIYear;seAIYear=function(S){_o(S);try{ailYear(S);}catch(e){console.warn('v25l año',e);}};})();
