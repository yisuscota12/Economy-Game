/* ===== v2.6c: programas nucleares — energía civil y armamento, con restricciones mundiales (no proliferación) =====
   Interruptor: NUKE_SYS.on=false apaga todo el sistema (no se crea G.nk, no hay efectos ni decisiones de la IA).
   Estado (se guarda con la partida): G.nk={v:1,y:año procesado,s:sal,P:{país:{c,ca,m,ma,npt,frz,det,priv,nr,w,ab,ok}}}
   - c / ca: fase y años cumplidos de la rama civil (0 nada · 1 investigación · 2 combustible · 3 construcción de reactores · 4 operación)
   - m / ma: fase y años de la rama militar (0 nada · 1 investigación · 2 enriquecimiento alto · 3 diseño · 4 prueba · 5 arsenal)
   - npt: firmó el Tratado de No Proliferación (TNP) · frz: meses de congelamiento tras una detección · det: veces detectado
   - priv: el gobierno permite inversión privada en la rama civil · nr: reactores en operación · w: ojivas (solo informativo)
   Capacidad K (0–100) = 100 × (0.40·ingreso + 0.25·capital humano + 0.25·tamaño + 0.10·tecnología), con
     ingreso = PIB por persona en escala log (1 mil → 0, 50 mil US$ → 1), capital humano = esperanza de vida (55 → 0, 82 años → 1;
     el juego no tiene datos de escolaridad por país), tamaño = PIB total en escala log (10 mil millones → 0, 10 billones → 1) y
     tecnología = (n.tech.c + n.tech.m)/6.
   Costo anual de cada fase = máx(porcentaje del PIB, mínimo absoluto). Presupuesto: el costo que paga el Estado no puede pasar de
     40 % (civil) o 60 % (militar) del ingreso del tesoro (treasuryIncome). Si gobiernas, se descuenta de tu tesoro cada año; sin fondos,
     la fase se detiene ese año. A la IA no le cuesta PIB (el sistema no cambia el crecimiento salvo por los efectos de abajo).
   Uranio: la rama civil necesita producción propia (resNat) o comprar en el mercado (solo firmantes del TNP sin sanciones: el Grupo de
     Proveedores Nucleares no vende a quien no firma). La militar necesita uranio propio o reactores operando (ruta del plutonio).
   Restricciones: un firmante del TNP no puede tener rama militar (salvo las cinco potencias reconocidas). Quien no firma puede, pero cada
     fase que avanza le cuesta estabilidad y sanciones; la prueba nuclear trae sanciones de 3 años. Vigilancia mensual: un programa
     militar en fases 1–3 puede ser detectado (probabilidad con h21, sin Math.random): sanciones de 3 años, −5 de estabilidad y 12 meses
     congelado. Las potencias nucleares no venden tecnología (no hay atajos de compra). Las sanciones ahuyentan a los socios privados.
   Sector privado: con permiso del gobierno (los regímenes comunistas lo prohíben) financia 35 % de la construcción y la operación de
     reactores (15 % con sanciones). En la rama militar nadie privado invierte. Tú puedes invertir tu dinero en el consorcio civil.
   Efectos acotados: con reactores operando, la energía cuesta r = 1–3 % menos (según la parte nuclear estimada de la electricidad):
     +0.02·r puntos de crecimiento al año (ecoBonus) y +0.6·r en la salud del sector Energía (término «nuc»). El armamento no toca el PIB:
     solo sanciones (que el motor ya cobra: −2 puntos de crecimiento por año de sanción) y estabilidad. Al llegar a arsenal el país entra
     en NUKE (disuasión en la guerra y nivel de armamento de la v2.6a). */
const NUKE_SYS={on:false};   // v2.6c: apagado por defecto hasta confirmar el balance de las crisis bancarias (ver RETOMAR_SESION.md)
const NK_NWS=new Set(['USA','RUS','CHN','FRA','GBR']);           // potencias reconocidas por el TNP (probaron antes de 1967)
const NK_NONPT=new Set(['IND','PAK','ISR','PRK','SSD']);         // fuera del TNP (Corea del Norte se retiró en 2003)
const NK_BASE=[...NUKE];
// ojivas estimadas (SIPRI 2025), solo para mostrar
const NK_W0={USA:5177,RUS:5459,CHN:600,FRA:290,GBR:225,IND:180,PAK:170,ISR:90,PRK:50};
// reactores en operación (OIEA, 2025, aproximado)
const NK_R0={USA:94,FRA:57,CHN:58,RUS:36,KOR:26,IND:21,CAN:17,UKR:15,JPN:14,GBR:9,ESP:7,SWE:6,CZE:6,PAK:6,FIN:5,SVK:5,BEL:4,HUN:4,CHE:4,ARE:4,
  ARG:3,BRA:2,ZAF:2,MEX:2,ROU:2,BGR:2,BLR:2,SVN:1,ARM:1,IRN:1,NLD:1};
// programas en marcha en 2026: [fase civil, años cumplidos]
const NK_C0={TUR:[3,5],EGY:[3,3],BGD:[3,5],POL:[2,1],UZB:[1,1],KAZ:[1,0],SAU:[1,1],PHL:[1,0],GHA:[1,0],VNM:[1,0],IDN:[1,0]};
const NK_AB={DEU:2023,ITA:1990};                                   // cerraron sus reactores
const NK_C=[null,
  {n:'Investigación nuclear civil',y:2,pct:.0001,min:5e7,K:30},
  {n:'Combustible: enriquecimiento de bajo nivel (3–5 %)',y:3,pct:.0002,min:1.5e8,K:35,ur:1},
  {n:'Construcción de reactores',y:6,pct:.0006,min:8e8,K:38,ur:1,priv:1},
  {n:'Operación de reactores',y:0,pct:.00005,min:1e8,K:0,ur:1,priv:1}];
const NK_M=[null,
  {n:'Investigación militar',y:3,pct:.0003,min:1e8,K:40},
  {n:'Enriquecimiento de alto nivel (90 %)',y:4,pct:.0008,min:4e8,K:45,ur:1,civ:2},
  {n:'Diseño del arma',y:2,pct:.0006,min:3e8,K:48},
  {n:'Prueba nuclear',y:1,pct:.0005,min:2e8,K:50},
  {n:'Arsenal',y:0,pct:.0003,min:1.5e8,K:0}];
const NK_CAP={c:.4,m:.6};                       // tope del costo estatal frente al ingreso del tesoro
const NK_DET=[0,.003,.010,.006,0];              // probabilidad mensual de detección por fase militar
const NKC={g:null};
function nkOn(){return NUKE_SYS.on&&typeof G!=='undefined'&&G&&G.nations;}
function nkSyncNuke(){NUKE.clear();if(!G.nk){NK_BASE.forEach(x=>NUKE.add(x));return;}for(const id in G.nk.P)if(G.nk.P[id].m===5)NUKE.add(id);}
function nkEnsure(){if(!nkOn())return null;if(G.nk&&NKC.g===G)return G.nk;
  if(!G.nk){const s=h21(Object.keys(G.nations).slice(0,12).map(k=>G.nations[k].leader||k).join('|')+G.year);const P0={};
    for(const id in G.nations){const r=NK_R0[id]||0,c0=NK_C0[id];const nuc=NK_BASE.includes(id);
      P0[id]={c:r?4:c0?c0[0]:0,ca:r?0:c0?c0[1]:0,m:nuc?5:0,ma:0,npt:!NK_NONPT.has(id),frz:0,det:0,priv:true,nr:r,w:NK_W0[id]||0,ab:NK_AB[id]||0,ok:1};}
    G.nk={v:1,y:G.year,s,P:P0};}
  for(const id in G.nations)if(!G.nk.P[id])G.nk.P[id]={c:0,ca:0,m:0,ma:0,npt:true,frz:0,det:0,priv:true,nr:0,w:0,ab:0,ok:1};
  NKC.g=G;nkSyncNuke();return G.nk;}
function nkOf(nid){const N=nkEnsure();return N?N.P[nid]||null:null;}
function nkRoll(tag){const N=nkEnsure();return h21('nk|'+(N?N.s:0)+'|'+tag);}
/* ---------- capacidad, presupuesto y requisitos ---------- */
function nkK(nid){const n=G.nations[nid];if(!n||!n.alive)return 0;const d=N0[nid]||{};const pc=gdppc(n);
  const a=clamp((Math.log10(Math.max(1,pc))-3)/1.7,0,1),h=clamp(((d.le||65)-55)/27,0,1),s=clamp((Math.log10(Math.max(1,n.gdp))-10)/3,0,1);
  const t=n.tech?clamp(((n.tech.c||0)+(n.tech.m||0))/6,0,1):0;const k=100*(.4*a+.25*h+.25*s+.1*t);return isFinite(k)?k:0;}
function nkTI(nid){const n=G.nations[nid];try{const v=treasuryIncome(n);return isFinite(v)&&v>0?v:n.gdp*.006;}catch(e){return n.gdp*.006;}}
function nkUran(nid){try{const d=resNat()[nid];return !!(d&&d.uran>0);}catch(e){return false;}}
function nkPrivOk(nid){const n=G.nations[nid];const e=nkOf(nid);if(!e||!e.priv)return false;try{return ideoOf(n)!=='com';}catch(e2){return true;}}
function nkPrivSh(nid){if(!nkPrivOk(nid))return 0;const n=G.nations[nid];return n.sanc>0?.15:.35;}
/* costo anual total de una fase y la parte que paga el Estado */
function nkCost(nid,br,f){const T=(br==='c'?NK_C:NK_M)[f];const n=G.nations[nid];if(!T||!n)return {tot:0,st:0,pv:0};
  const tot=Math.max(n.gdp*T.pct,T.min);const pv=T.priv&&br==='c'?tot*nkPrivSh(nid):0;return {tot,st:tot-pv,pv};}
/* requisitos de la fase f de la rama br: [[texto, cumple, detalle]] */
function nkReqs(nid,br,f){const n=G.nations[nid];const e=nkOf(nid);const T=(br==='c'?NK_C:NK_M)[f];if(!n||!e||!T)return [];const L=[];
  const K=nkK(nid);if(T.K)L.push(['Capacidad técnica',K>=T.K,`${Math.round(K)} de ${T.K} necesarios`]);
  const co=nkCost(nid,br,f),ti=nkTI(nid),cap=NK_CAP[br]*ti;L.push(['Presupuesto',co.st<=cap,`${fmtN(co.st)} al año; tope ${Math.round(NK_CAP[br]*100)} % del ingreso del tesoro (${fmtN(cap)})`]);
  if(T.ur){const own=nkUran(nid);
    if(br==='c'){const mk=e.npt&&!(n.sanc>0);L.push(['Uranio',own||mk,own?'producción propia':mk?'compra en el mercado (firmante del TNP)':'sin uranio propio y sin acceso al mercado (no firma el TNP o tiene sanciones)']);}
    else{const pu=e.c>=4;L.push(['Material fisible',own||pu,own?'uranio propio':pu?'plutonio de sus reactores':'sin uranio propio ni reactores: nadie le vende']);}}
  if(br==='c'&&f===3)L.push(['Red eléctrica',n.gdp>=6e10,n.gdp>=6e10?'suficiente para un reactor':'la economía es pequeña para un reactor (PIB mínimo: 60 mil millones)']);
  if(T.civ)L.push(['Infraestructura de enriquecimiento',e.c>=T.civ,e.c>=T.civ?'tiene la rama civil en combustible o más':'necesita la rama civil en fase 2 (combustible)']);
  if(br==='m'){const legal=!e.npt||NK_NWS.has(nid);L.push(['Tratado de No Proliferación',legal,e.npt?(NK_NWS.has(nid)?'potencia reconocida por el tratado':'firmante: no puede tener armas nucleares'):'no firmante']);}
  L.push(['Estabilidad',n.stab>=25,`${Math.round(n.stab)} (mínimo 25)`]);
  return L;}
function nkCan(nid,br,f){const L=nkReqs(nid,br,f);const why=L.filter(x=>!x[1]).map(x=>x[0]+': '+x[2]);return {ok:L.length>0&&!why.length,why,L};}
/* parte nuclear estimada de la electricidad (≈7.5 TWh por reactor; ≈0.25 TWh por cada mil millones de PIB) y rebaja del costo de energía (%) */
function nkShare(nid){const e=nkOf(nid),n=G.nations[nid];if(!e||!n||e.c<4||!e.nr)return 0;return clamp(e.nr*7.5/Math.max(1,n.gdp/1e9*.25),0,1);}
function nkEner(nid){const e=nkOf(nid);if(!e||e.c<4||!e.nr||!e.ok)return 0;return clamp(1+4*nkShare(nid),1,3);}
function nkMine(nid){return typeof playerRules==='function'&&playerRules(nid);}
function nkNews(t,cls,nid){try{pushNews(t,cls);}catch(e){}try{if(P&&P.alive&&natOf(P).id===nid)log(t,cls==='good'?'good':cls==='bad'?'bad':'');}catch(e){}}
/* ---------- año ---------- */
function nkPay(nid,br,f){const co=nkCost(nid,br,f);const n=G.nations[nid];
  if(nkMine(nid)){if((n.treas||0)<co.st)return false;n.treas-=co.st;return true;}return co.st<=NK_CAP[br]*nkTI(nid);}
function nkAdvance(nid,br){const e=nkOf(nid),n=G.nations[nid];
  if(br==='c'){e.c++;e.ca=0;
    if(e.c===4){const add=clamp(Math.round(n.gdp/4e11),1,4)+(nkPrivSh(nid)>=.3?1:0);e.nr+=add;e.ok=1;nkNews(`${n.name} conecta ${add} reactor${add>1?'es':''} nuclear${add>1?'es':''} a la red.`,'good',nid);}
    else nkNews(`${n.name} avanza su programa nuclear civil: ${NK_C[e.c].n.toLowerCase()}.`,'news',nid);return;}
  e.m++;e.ma=0;
  if(e.m===5){e.w=Math.max(e.w,6);NUKE.add(nid);n.sanc=Math.max(n.sanc||0,3);n.stab=clamp(n.stab+3,0,100);
    nkNews(`${n.name} realiza una prueba nuclear y se declara potencia nuclear. El mundo responde con sanciones.`,'bad',nid);return;}
  n.stab=clamp(n.stab-2,0,100);n.sanc=Math.max(n.sanc||0,1);
  nkNews(`${n.name} avanza su programa de armas nucleares (${NK_M[e.m].n.toLowerCase()}). Hay sanciones y protestas.`,'bad',nid);}
function nkStep(nid,br){const e=nkOf(nid);const f=br==='c'?e.c:e.m;const T=(br==='c'?NK_C:NK_M)[f];if(!T)return;
  if(T.y===0){// fase permanente: operación o arsenal
    const paid=nkPay(nid,br,f);if(br==='c')e.ok=paid?1:0;else if(paid&&e.w<60&&!NK_W0[nid])e.w+=3;return;}
  if(br==='m'&&e.frz>0)return;if(!nkCan(nid,br,f).ok)return;if(!nkPay(nid,br,f))return;
  if(br==='c'){e.ca++;if(e.ca>=T.y)nkAdvance(nid,br);}else{e.ma++;if(e.ma>=T.y)nkAdvance(nid,br);}}
function nkAI(nid){const e=nkOf(nid),n=G.nations[nid];if(nkMine(nid))return;const war=warsOf(nid);const Y=G.year;
  if(e.c===0&&!e.ab&&!war.length&&n.stab>=35&&n.gdp>=1.5e11&&nkK(nid)>=32&&nkCan(nid,'c',1).ok&&nkRoll('c|'+nid+'|'+Y)<.006){e.c=1;e.ca=0;nkNews(`${n.name} anuncia un programa de energía nuclear civil.`,'news',nid);}
  if(e.m!==0)return;const K=nkK(nid);let dict=false;try{dict=IDEO[ideoOf(n)].gov==='dictadura';}catch(x){}
  const vsNuke=war.some(w=>NUKE.has(w.a===nid?w.b:w.a));
  if(e.npt&&!NK_NWS.has(nid)&&dict&&vsNuke&&K>=45&&nkRoll('w|'+nid+'|'+Y)<.04){e.npt=false;n.sanc=Math.max(n.sanc||0,3);n.stab=clamp(n.stab-6,0,100);
    nkNews(`${n.name} se retira del Tratado de No Proliferación Nuclear.`,'bad',nid);}
  if(!e.npt&&(vsNuke||dict)&&nkCan(nid,'m',1).ok&&nkRoll('m|'+nid+'|'+Y)<(vsNuke?.3:.02)){e.m=1;e.ma=0;}}
function nkPlayerYear(){if(!P||!P.alive||!P.nkInv)return;const I=P.nkInv;const e=nkOf(I.nid);
  if(!e||!G.nations[I.nid]||!G.nations[I.nid].alive){P.dinero+=I.amt*.5;log(`El consorcio nuclear desaparece: recuperas ${fmt(I.amt*.5)}.`,'bad');P.nkInv=null;return;}
  if(e.c===4&&e.ok){const d=I.amt*.06;P.dinero+=d;I.got=(I.got||0)+d;log(`Dividendo del consorcio nuclear de ${G.nations[I.nid].name}: ${fmt(d)}.`,'good');}}
function nkYear(){const N=nkEnsure();if(!N||N.y===G.year)return;N.y=G.year;
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;const e=N.P[id];if(!e)continue;
    if(e.c>0)nkStep(id,'c');if(e.m>0)nkStep(id,'m');nkAI(id);}
  try{nkPlayerYear();}catch(x){console.warn('v26c inversión',x);}nkSyncNuke();}
/* ---------- mes: vigilancia internacional y congelamiento ---------- */
function nkDetP(nid){const e=nkOf(nid);if(!e||e.m<1||e.m>3||e.frz>0)return 0;return NK_DET[e.m];}
function nkMonth(){const N=nkEnsure();if(!N)return;const mo=(G.mk&&G.mk.mo)||0;
  for(const id in N.P){const e=N.P[id],n=G.nations[id];if(!n||!n.alive)continue;if(e.frz>0){e.frz--;continue;}
    const p=nkDetP(id);if(p<=0)continue;if(nkRoll('d|'+id+'|'+G.year+'|'+mo)<p){e.det++;e.frz=12;n.sanc=Math.max(n.sanc||0,3);n.stab=clamp(n.stab-5,0,100);
      nkNews(`Los inspectores internacionales descubren el programa de armas nucleares de ${n.name}: sanciones y programa congelado un año.`,'bad',id);}}}
/* ---------- decisiones del gobierno del jugador (y del jugador como inversionista) ---------- */
function nkStart(nid,br){if(!nkMine(nid))return {err:'Solo el gobierno puede decidirlo.'};const e=nkOf(nid);if(!e)return {err:'Sistema nuclear apagado.'};
  if((br==='c'?e.c:e.m)>0)return {err:'El programa ya está en marcha.'};const c=nkCan(nid,br,1);if(!c.ok)return {err:'No cumples: '+c.why.join('; ')};
  const n=G.nations[nid];if(br==='c'){e.c=1;e.ca=0;e.ab=0;return {ok:'Inicias el programa de energía nuclear civil. Empieza la investigación.'};}
  e.m=1;e.ma=0;n.stab=clamp(n.stab-2,0,100);return {ok:'Inicias en secreto un programa de armas nucleares. Los inspectores pueden descubrirlo.'};}
function nkStop(nid,br){if(!nkMine(nid))return {err:'Solo el gobierno puede decidirlo.'};const e=nkOf(nid);if(!e)return {err:'Sistema nuclear apagado.'};const n=G.nations[nid];
  if(br==='c'){if(!e.c)return {err:'No hay programa civil.'};const op=e.c===4;e.c=0;e.ca=0;e.nr=0;e.ab=op?G.year:0;
    return {ok:op?'Cierras tus reactores nucleares: la energía se encarece.':'Cancelas el programa nuclear civil.'};}
  if(!e.m)return {err:'No hay programa militar.'};const ars=e.m===5;e.m=0;e.ma=0;e.frz=0;if(!NK_W0[nid]||ars)e.w=0;NUKE.delete(nid);n.stab=clamp(n.stab+1,0,100);
  return {ok:ars?'Desmantelas tu arsenal nuclear, como Sudáfrica en 1991.':'Cancelas el programa de armas nucleares.'};}
function nkNPT(nid,join){if(!nkMine(nid))return {err:'Solo el gobierno puede decidirlo.'};const e=nkOf(nid);if(!e)return {err:'Sistema nuclear apagado.'};const n=G.nations[nid];
  if(join){if(e.npt)return {err:'Ya firmaste el tratado.'};if(e.m>0)return {err:'Primero cancela o desmantela el programa militar.'};e.npt=true;n.stab=clamp(n.stab+2,0,100);
    return {ok:'Firmas el Tratado de No Proliferación: el mercado de combustible nuclear se te abre.'};}
  if(!e.npt)return {err:'No eres parte del tratado.'};if(NK_NWS.has(nid))return {err:'Eres potencia reconocida: retirarte no te da nada.'};
  e.npt=false;n.sanc=Math.max(n.sanc||0,3);n.stab=clamp(n.stab-6,0,100);return {ok:'Te retiras del Tratado de No Proliferación. Llegan sanciones por tres años.'};}
function nkSetPriv(nid,v){if(!nkMine(nid))return {err:'Solo el gobierno puede decidirlo.'};const e=nkOf(nid);if(!e)return {err:'Sistema nuclear apagado.'};
  let com=false;try{com=ideoOf(G.nations[nid])==='com';}catch(x){}if(v&&com)return {err:'Tu régimen (economía planificada) prohíbe la inversión privada.'};
  e.priv=!!v;return {ok:v?'Permites que empresas privadas inviertan en reactores.':'Prohíbes la inversión privada en reactores.'};}
function nkInvest(frac){if(!P||!P.alive)return {err:'—'};const nid=natOf(P).id;const e=nkOf(nid);if(!e)return {err:'Sistema nuclear apagado.'};
  if(e.c<3)return {err:'Solo se invierte en la construcción u operación de reactores.'};if(!nkPrivOk(nid))return {err:'El gobierno no permite inversión privada.'};
  if(P.nkInv&&P.nkInv.nid!==nid)return {err:'Ya tienes una participación en otro país.'};const amt=Math.floor(P.dinero*frac);if(amt<10000)return {err:'Necesitas al menos $10,000 para invertir.'};
  P.dinero-=amt;if(!P.nkInv)P.nkInv={nid,amt:0,got:0};P.nkInv.amt+=amt;return {ok:`Inviertes ${fmt(amt)} en el consorcio nuclear civil. Pagará 6 % al año mientras los reactores operen.`};}
function nkDivest(){if(!P||!P.nkInv)return {err:'No tienes participación.'};const I=P.nkInv;const e=nkOf(I.nid);const v=I.amt*(e&&e.c===4?.95:.8);P.dinero+=v;P.nkInv=null;
  return {ok:`Vendes tu participación por ${fmt(v)}.`};}
/* ---------- efectos acotados: energía más barata ---------- */
{const _eb=ecoBonus;ecoBonus=function(n){const b=_eb(n);if(!nkOn())return b;try{const r=nkEner(n.id);return r?b+.02*r:b;}catch(e){return b;}};}
{const _c=shCtx;shCtx=function(n){const c=_c(n);try{c.nk=nkOn()?nkEner(n.id):0;}catch(e){c.nk=0;}return c;};}
{const _t=shTerms;shTerms=function(c,R,k,L){let t=_t(c,R,k,L);if(k!=='ener'||!c||!c.nk)return t;const v=clamp(.6*c.nk,0,2);if(v>=.5){t+=v;if(L)L.push(['nuc',v]);}return t;};}
/* ---------- ganchos: año (después de simWorld) y mes (fin de mes del mercado) ---------- */
{const _sw=simWorld;simWorld=function(){const r=_sw.apply(this,arguments);try{nkYear();}catch(e){console.warn('v26c año',e);}return r;};}
{const _me=mkMonthEnd;mkMonthEnd=function(...a){const r=_me(...a);try{if(nkOn())nkMonth();}catch(e){console.warn('v26c mes',e);}return r;};}
