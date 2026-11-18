/* ===== v1.7a: dificultad (Fácil, Medio, Difícil) =====
   Se elige al crear la partida y se puede cambiar en Ajustes. Diseño:
   - Fácil: aprender sin frustración. Más margen en cada tirada (+12 puntos), +15 % de ingresos, gastos de vida −10 %, la IA declara menos guerras a tu país,
     sugerencias y burbujas de ayuda encendidas. Ideal para descubrir los sistemas.
   - Medio: el juego calibrado con datos reales (lo que había hasta la v1.6d).
   - Difícil: la realidad sin colchón. −10 puntos en cada tirada, −10 % de ingresos, gastos de vida +10 %, la IA es más agresiva con tu país
     (a veces un aliado del agresor se suma). */
const DIFS={f:{n:'Fácil',ic:'🌱',dice:12,inc:1.15,cost:.9,war:.55,d:'Para aprender: más margen en cada tirada, más ingresos, menos gastos y menos guerras contra tu país. Ayudas encendidas.'},
 m:{n:'Medio',ic:'⚖️',dice:0,inc:1,cost:1,war:1,d:'El juego calibrado con datos reales: así funcionan las cosas.'},
 d:{n:'Difícil',ic:'🔥',dice:-10,inc:.9,cost:1.1,war:1.4,d:'Sin colchón: menos margen en las tiradas, menos ingresos, más gastos y una IA más agresiva: a veces los aliados del agresor se suman.'}};
const difOf=()=>DIFS[(G&&G.dif)||'m']||DIFS.m;
{const _ck=chkPct;chkPct=function(p,s,dc,b){const v=_ck(p,s,dc,b);const d=difOf().dice;return d?clamp(v+d,3,97):v;};}
{const _gi=grossIncome;grossIncome=function(p){const v=_gi(p);return p===P?v*difOf().inc:v;};}
{const _lc=livingCost;livingCost=function(p){const v=_lc(p);return p===P?v*difOf().cost:v;};}
{const _dw=declareWar;declareWar=function(a,b){try{if(P&&P.alive&&G.dif&&G.dif!=='m'){const me=natOf(P).id;const toMe=b===me&&a!==me;const k=difOf().war;
    if(toMe&&k<1&&Math.random()>k)return; // en Fácil, parte de las declaraciones contra tu país no ocurren
    if(toMe&&k>1&&G.wars.length&&!G._difW){/* en Difícil, un aliado del agresor puede sumarse */const al=(G.nations[a].allies||[]).filter(x=>x!==me&&G.nations[x]&&!warBetween(x,me));if(al.length&&Math.random()<k-1){G._difW=1;_dw(a,b);_dw(al[0],me);G._difW=0;return;}}}}catch(e){}
  return _dw(a,b);};}
