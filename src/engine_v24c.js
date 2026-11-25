/* ===================== v2.4c: fase 6 de la ruta 9d (logística), parte 2 — motor =====================
   1) Estrechos y canales: cada puerto cae en una cuenca (Atlántico de América, Atlántico de Europa y África, Mediterráneo, mar Negro
      y Caspio, mar Rojo, Índico, golfo Pérsico, Pacífico de Sudamérica, Asia y Oceanía, y los países con dos costas). Una ruta
      marítima va por el camino más corto entre cuencas (grafo de 10 nodos, LG_SEA); los pasos con nombre son Suez, Panamá, Bósforo,
      Ormuz, Malaca y Bab el-Mandeb. Si un paso se cierra la ruta da la vuelta (Cabo de Buena Esperanza, Cabo de Hornos, Sonda) y el
      flete sube; si no hay otra vía (golfo Pérsico sin Ormuz, mar Negro sin Bósforo) la carga queda bloqueada (flete ×1.8).
   2) Eventos (azar h21, sin Math.random): cierres por guerra del país que custodia el paso (20 %/mes mientras está en guerra),
      buque encallado (Suez), sequía (Panamá), tensión (Ormuz, Bósforo), piratería (Bab el-Mandeb, Malaca: el paso sigue abierto pero
      cuesta más y se pierde más) y huelgas portuarias por país (0.2 %/mes). Duran 1–5 meses; se guardan en G.lg.ck y G.lg.hs.
   3) Obras de logística (mismo sistema de obras con plazo de la v2.3b, fuera de NT_PJK para no cambiar lo que construye la IA):
      🏗️ Terminal de contenedores (costa) y 🛫 Aeropuerto de carga. Abaratan el flete y bajan los retrasos de las rutas que salen o
      llegan a esa provincia; el efecto está centrado en la media del mundo (la media mundial no se mueve).
   Todo entra por un envoltorio de lgCarrier: la eficiencia del transportista se divide entre el factor de la ruta (k), así que el
   flete (lgNat), los retrasos y las pérdidas (lgMonth) y la ficha de cada ruta lo ven sin tocar la v2.4a. */

/* ---------- 1) cuencas y pasos ---------- */
const LG_CK={
 suez:{a:'el ',n:'Canal de Suez',ic:'⛴️',g:['EGY'],x:2401,y:629,ev:'enc',p:.006,d:[1,2]},
 pan:{a:'el ',n:'Canal de Panamá',ic:'⛴️',g:['PAN'],x:1146,y:905,ev:'seq',p:.008,d:[2,4]},
 bos:{a:'el ',n:'Estrecho del Bósforo',ic:'🌉',g:['TUR'],x:2350,y:493,ev:'ten',p:.003,d:[1,2]},
 orm:{a:'el ',n:'Estrecho de Ormuz',ic:'🛢️',g:['IRN','OMN'],x:2680,y:705,ev:'ten',p:.003,d:[1,2]},
 mal:{a:'el ',n:'Estrecho de Malaca',ic:'🏝️',g:['MYS','IDN','SGP'],x:3215,y:990,ev:'pir',p:.012,d:[3,5]},
 bab:{a:'',n:'Bab el-Mandeb',ic:'⚓',g:['YEM','DJI','ERI'],x:2537,y:853,ev:'pir',p:.012,d:[3,5]}};
const LG_CKK=Object.keys(LG_CK);
const lgCkN=k=>LG_CK[k].a+LG_CK[k].n;   // con artículo: «el Canal de Suez», «Bab el-Mandeb»
const LG_CKC={guerra:'guerra en la costa',enc:'un buque encallado bloquea el paso',seq:'la sequía baja el agua del canal',ten:'tensión militar',pir:'piratería'};
const LG_ZN={ATLA:'Atlántico de América',ATLE:'Atlántico de Europa y África',MED:'Mediterráneo',BLK:'Mar Negro y Caspio',RED:'Mar Rojo',IND:'Océano Índico',
 GULF:'Golfo Pérsico',PACA:'Pacífico de Sudamérica',ASIA:'Asia y Oceanía',DUAL:'Dos océanos'};
// [cuenca, cuenca, costo, paso o ''] — el costo es relativo (semanas de navegación aproximadas)
const LG_SEA=[['ATLA','ATLE',6,''],['ATLE','MED',3,''],['MED','BLK',1,'bos'],['MED','RED',2,'suez'],['RED','IND',2,'bab'],['IND','GULF',2,'orm'],
 ['IND','ASIA',4,'mal'],['IND','ASIA',6.5,''],['ATLE','IND',13,''],['ATLA','PACA',4,'pan'],['ATLA','PACA',14,''],['ATLA','ASIA',15,'pan'],['PACA','ASIA',11,''],
 ['DUAL','ATLA',1,''],['DUAL','ATLE',7,''],['DUAL','PACA',2,''],['DUAL','ASIA',10,'']];
const LG_PACA=['CHL','PER','ECU'],LG_DUAL=['USA','CAN','MEX','COL','PAN','CRI','NIC','GTM','HND','SLV'],LG_CASP=['AZE','TKM','KAZ'];
const LGZ={};
function lgZone(r){if(LGZ[r])return LGZ[r];const g=RG[r];if(!g)return 'ATLE';const n=g.n,x=g.c[0],y=g.c[1];let z;
  if(LG_PACA.includes(n))z='PACA';else if(LG_DUAL.includes(n))z='DUAL';else if(LG_CASP.includes(n))z='BLK';else if(x<1600)z='ATLA';
  else if(x>=2550&&x<=2690&&y>=600&&y<=712)z='GULF';else if(x>=2300&&x<=2520&&y>=395&&y<=490&&n!=='TUR')z='BLK';
  else if(x>=1990&&x<=2460&&y>=430&&y<=640)z='MED';else if(x>=2400&&x<=2530&&y>640&&y<=860)z='RED';
  else if(y>1250&&x<2560)z='ATLE';else if(x<2380)z='ATLE';else if(x<3150)z='IND';else z='ASIA';return LGZ[r]=z;}
// camino más corto entre cuencas con el estado de los pasos: cl = pasos cerrados, pr = pasos con piratería (+2 de costo)
const LGX={sig:'',m:{},t:-1,pf:null,v:0};
function lgSeaPath(za,zb,cl,pr){if(za===zb)return {c:2,ck:[]};const D={},Pv={},Q=new Set(Object.keys(LG_ZN));for(const z of Q)D[z]=Infinity;D[za]=0;
  while(Q.size){let u=null;for(const z of Q)if(u===null||D[z]<D[u])u=z;if(D[u]===Infinity)break;Q.delete(u);if(u===zb)break;if(u==='DUAL'&&u!==za)continue;   // los países de dos costas no son paso (no hay puente terrestre)
    for(const [a,b,c,k] of LG_SEA){const v=a===u?b:b===u?a:null;if(!v||!Q.has(v))continue;if(k&&cl&&cl[k])continue;const w=c+(k&&pr&&pr[k]?2:0);if(D[u]+w<D[v]){D[v]=D[u]+w;Pv[v]=[u,k];}}}
  if(D[zb]===Infinity)return null;const ck=[];let z=zb;while(z!==za){const [u,k]=Pv[z];if(k)ck.push(k);z=u;}return {c:2+D[zb],ck:ck.reverse()};}
function lgCkState(){const L=G.lg;const cl={},pr={};if(!L||!L.ck)return {cl,pr,sig:''};const t=lgNowT();let s='';
  for(const k in L.ck){const e=L.ck[k];if(!e||e.e<=t)continue;if(e.c==='pir')pr[k]=1;else cl[k]=1;s+=k+(e.c==='pir'?'p':'c');}return {cl,pr,sig:s};}
const lgNowT=()=>{const c=G.lg&&G.lg.c;return c?c.y*12+c.mi:G.year*12+monthOfDay(G.day||0);};
function lgRouteSea(f){const za=lgZone(f.a),zb=lgZone(f.b);const S=lgCkState();if(LGX.sig!==S.sig){LGX.sig=S.sig;LGX.m={};}const key=za+'>'+zb;
  let o=LGX.m[key];if(o)return o;const p0=lgSeaPath(za,zb,null,null),p1=lgSeaPath(za,zb,S.cl,S.pr);
  o={za,zb,ck:p0?p0.ck:[],now:p1?p1.ck:[],c0:p0?p0.c:2,c1:p1?p1.c:0,bl:!p1};o.k=o.bl?1.8:clamp(1+.5*(o.c1/o.c0-1),1,1.6);LGX.m[key]=o;return o;}

/* ---------- 3) obras de logística ---------- */
Object.assign(NT_PJ,{
 termi:{n:'Terminal de contenedores',ic:'🏗️',c:.014,max:2,m:24,ty:'log',d:'Grúas y muelles para contenedores: −5 % de flete y menos retrasos por nivel en las rutas marítimas que salen o llegan a esta provincia. Rinde por tarifas de puerto.',req:'co',r:.05},
 aerop:{n:'Aeropuerto de carga',ic:'🛫',c:.011,max:2,m:20,ty:'log',d:'Pista larga y almacenes refrigerados: −6 % de flete y menos retrasos por nivel en las rutas aéreas que salen o llegan a esta provincia. Rinde por tarifas de carga.',r:.05}});
const NT_LGK=['termi','aerop'];
// el avance «Tecnología del agua» (v2.3c) abarata todo NT_PJ: estas obras no son de agua
{const _c=ntPjCost;ntPjCost=function(rid,k){const v=_c(rid,k);if(NT_LGK.includes(k)){const x=G.regions[rid];if(x&&typeof ntAvHas==='function'&&ntAvHas(x.o))return v/(1-NT_AVP);}return v;};}
const lgObLv=(r,k)=>{const e=G.np&&G.np[r]&&G.np[r][k];return e&&e.l?e.l:0;};
function lgObRaw(f){if(f.m==='mar')return 1-.05*(lgObLv(f.a,'termi')+lgObLv(f.b,'termi'));if(f.m==='aer')return 1-.06*(lgObLv(f.a,'aerop')+lgObLv(f.b,'aerop'));return 1;}
// media del mundo por modo (ponderada por valor), cada mes: así el efecto de las obras está centrado
function lgObMean(){const t=G.lg?G.lg.t:0;if(LGX.t===t&&LGX.pf&&LGX.g===G&&LGX.pv===LGX.v)return LGX.pf;const F=lgFlows();const s={mar:[0,0],aer:[0,0]};
  for(const f of F){if(!s[f.m])continue;s[f.m][0]+=f.v*lgObRaw(f);s[f.m][1]+=f.v;}LGX.t=t;LGX.g=G;LGX.pv=LGX.v;LGX.pf={mar:s.mar[1]?s.mar[0]/s.mar[1]:1,aer:s.aer[1]?s.aer[0]/s.aer[1]:1,ter:1};return LGX.pf;}
const lgHsOn=nid=>{const h=G.lg&&G.lg.hs&&G.lg.hs[nid];return !!(h&&h.e>lgNowT());};
// factor de la ruta (≥ 1 encarece): estrechos y canales, huelgas y obras
function lgK(f){let k=1;const o={k:1,sea:null,hs:0,ob:1};if(!G||!G.lg)return o;
  if(f.m==='mar'){const s=lgRouteSea(f);o.sea=s;k*=s.k;if(lgHsOn(f.na)||lgHsOn(f.nb)){k*=1.25;o.hs=1;}}
  if(f.m==='mar'||f.m==='aer'){const pm=lgObMean()[f.m]||1;o.ob=lgObRaw(f)/pm;k*=o.ob;}o.k=k;return o;}
{const _c=lgCarrier;lgCarrier=function(f){const c=_c(f);try{const z=lgK(f);if(z.k!==1){c.e=c.e/z.k;c.k=z.k;}}catch(e){}return c;};}

/* ---------- 2) eventos: cierres, piratería y huelgas ---------- */
function lgEvPush(t,ty,k,c,d){const L=G.lg;L.nw=L.nw||[];L.nw.push([t,ty,k,c,d]);L.nc=L.nc||{};L.nc[ty]=(L.nc[ty]||0)+1;if(L.nw.length>12)L.nw.splice(0,L.nw.length-12);}
function lgMyFlows(pred){const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;if(!me)return 0;lgFlows();return (LGC.byN[me]||[]).filter(pred).length;}
// t = mes de la v2.4a (azar); T = mes «actual» de los pasos (lgNowT, ya avanzado por lgTick): un evento de d meses dura de T a T+d−1
// sal de la partida: sin ella, h21(clave|mes) daría los mismos cierres y huelgas en todas las partidas. El mundo inicial es igual en todas
// las partidas, así que sale del personaje (nombre, provincia, sexo), del PIB y del año en que empieza la red; no usa Math.random
function lgSalt(L){if(!L.sd){let g=0;for(const id in G.nations)g+=(G.nations[id].gdp||0)%1e9;const p=P?(P.first||'')+(P.surname||'')+(P.r||'')+(P.sex||''):'';L.sd=(h21(p+'|'+Math.round(g%1e7)+'|'+G.year)*1e9).toString(36);}return L.sd;}
function lgEvTick(t0){const L=lgEnsure();L.ck=L.ck||{};L.hs=L.hs||{};const T=lgNowT();const t=lgSalt(L)+'|'+t0;
  // pasos: terminan los vencidos y se abren eventos nuevos
  for(const k of LG_CKK){const C=LG_CK[k];const e=L.ck[k];
    if(e&&e.e<=T){delete L.ck[k];lgEvPush(T,'ab',k,e.c,0);
      try{pushNews(`${C.ic} ${C.n}: ${e.c==='pir'?'termina la ola de piratería':'se reabre el paso'}; los barcos vuelven a su ruta normal.`,'good');}catch(x){}continue;}
    if(e)continue;
    const war=C.g.some(id=>G.nations[id]&&G.nations[id].alive&&warsOf(id).length>0);let c=null,dur=0;
    if(war&&h21(k+'|'+t+'|ckw')<.2){c='guerra';dur=2+Math.floor(h21(k+'|'+t+'|ckd')*3);}
    else if(h21(k+'|'+t+'|ck')<C.p){c=C.ev;dur=C.d[0]+Math.floor(h21(k+'|'+t+'|ckd')*(C.d[1]-C.d[0]+1));}
    if(!c)continue;L.ck[k]={c,s:T,e:T+dur};lgEvPush(T,c==='pir'?'pi':'ce',k,c,dur);LGX.sig='~';
    const mine=lgMyFlows(f=>f.m==='mar'&&!f.dom&&(lgRouteSea(f).ck.includes(k)));
    try{pushNews(c==='pir'?`🏴‍☠️ Piratería en ${lgCkN(k)}: los barcos que pasan pagan más seguro y algunos envíos se pierden (${dur} meses).${mine?` Afecta ${mine} ruta(s) de tu país.`:''}`
      :`${C.ic} Se cierra ${lgCkN(k)} por ${LG_CKC[c]} (${dur} ${dur>1?'meses':'mes'}): los barcos dan la vuelta y sube el flete.${mine?` Afecta ${mine} ruta(s) de tu país.`:''}`,'bad');}catch(x){}}
  // huelgas portuarias: solo países con rutas marítimas en la red (los lagos cuentan como «costa» en RG)
  const MS=new Set();lgFlows().forEach(f=>{if(f.m==='mar'){MS.add(f.na);MS.add(f.nb);}});for(const id in L.hs)if(L.hs[id].e<=T)delete L.hs[id];
  for(const id of MS){if(L.hs[id]||!G.nations[id]||!G.nations[id].alive)continue;if(h21(id+'|'+t+'|hs')>=.002)continue;const dur=1+Math.floor(h21(id+'|'+t+'|hsd')*2);
    L.hs[id]={s:T,e:T+dur};lgEvPush(T,'hs',id,'',dur);const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;
    if(id===me)try{pushNews(`⚓ Huelga en los puertos de ${G.nations[id].name} (${dur} ${dur>1?'meses':'mes'}): los barcos esperan y sube el flete de lo que llega por mar.`,'bad');}catch(x){}}}
{const _m=lgMonth;lgMonth=function(t){try{lgEvTick(t);}catch(e){console.warn('v24c eventos',e);}return _m(t);};}
// tus empresas navieras con rutas por un paso cerrado o con piratería: aviso una vez por evento
{const _m=lgMonth;lgMonth=function(t){const r=_m(t);try{if(P&&P.alive&&G.lg.ck){bzList(P).forEach(b=>{if(lgMode(b)!=='mar'||!b.lg)return;const hit=new Set();
  b.lg.rt.forEach(id=>{const f=lgFlowById(id);if(!f)return;const s=lgRouteSea(f);s.ck.forEach(k=>{if(G.lg.ck[k]&&G.lg.ck[k].e>lgNowT())hit.add(k);});});
  hit.forEach(k=>{const e=G.lg.ck[k];const key=k+e.s;b.lg.ckw=b.lg.ckw||[];if(b.lg.ckw.includes(key))return;b.lg.ckw.push(key);if(b.lg.ckw.length>8)b.lg.ckw.shift();
    try{log(`${LG_CK[k].ic} ${b.n}: ${e.c==='pir'?'tus buques cruzan '+lgCkN(k)+' con piratería (más pérdidas)':'tus buques dan la vuelta porque '+lgCkN(k)+' está cerrado (más retrasos)'}.`,'bad');}catch(x){}});});}}catch(e){}return r;};}

/* ---------- obras: noticias, IA y lo que muestra la interfaz ---------- */
{const _t=ntPjTick;ntPjTick=function(){if(G.np){const now=ntMonthKey();const me=P&&P.alive?natOf(P).id:null;
  for(const r in G.np){const R=G.np[r];for(const k of NT_LGK){const e=R[k];if(!e||!e.q||e.q>now)continue;e.q=0;e.l++;LGX.v++;const x=G.regions[r];
    if(me&&x&&x.o===me&&RG[r])pushNews(`${NT_PJ[k].ic} Termina ${NT_PJ[k].n.toLowerCase()} en ${RG[r].nm} (nivel ${e.l}): baja el flete de ${k==='termi'?'los barcos':'los aviones'} que llegan y salen de ahí.`,'good');}}}
  return _t();};}
// la IA: con h21, 8 % por año en países de ingreso medio o alto; una obra de logística a la vez, en su puerto o en su ciudad principal
function lgObAI(){const Y=G.year;let hp;try{hp=lgHubs();lgFlows();}catch(e){return;}
  for(const id in G.nations){const n=G.nations[id];if(!n.alive||playerRules(id))continue;if(h21(id+'|'+Y+'|lgob'+((G.lg&&G.lg.sd)||''))>=.08)continue;
    if(devFromPc(n.gdp/Math.max(1,n.pop))<3.5)continue;const F=LGC.byN[id]||[];
    const rs=[hp.port[id],hp.hub[id]].filter(Boolean);if(rs.some(r=>{const R=G.np&&G.np[r];return R&&NT_LGK.some(k=>R[k]&&R[k].q);}))continue;
    const vm=F.filter(f=>f.m==='mar').reduce((s,f)=>s+f.v,0),va=F.filter(f=>f.m==='aer').reduce((s,f)=>s+f.v,0);
    const L=vm>=va?[[hp.port[id],'termi'],[hp.hub[id],'aerop']]:[[hp.hub[id],'aerop'],[hp.port[id],'termi']];
    for(const [r,k] of L){if(r&&ntPjCan(r,k).ok){ntPjStart(r,k,'ia',0);break;}}}}
{const _py=provYear;provYear=function(){_py();try{lgObAI();}catch(e){}};}
// provincias donde conviene cada obra en tu país (puertos y ciudades con más carga de la red)
function lgObSites(nid){lgFlows();const F=LGC.byN[nid]||[];const S={termi:{},aerop:{}};
  F.forEach(f=>{[f.a,f.b].forEach(r=>{if(!G.regions[r]||G.regions[r].o!==nid)return;if(f.m==='mar')S.termi[r]=(S.termi[r]||0)+f.v;if(f.m==='aer')S.aerop[r]=(S.aerop[r]||0)+f.v;});});
  const hp=lgHubs();if(hp.port[nid]&&!S.termi[hp.port[nid]])S.termi[hp.port[nid]]=0;if(hp.hub[nid]&&!S.aerop[hp.hub[nid]])S.aerop[hp.hub[nid]]=0;
  const o={};for(const k in S)o[k]=Object.entries(S[k]).sort((a,b)=>b[1]-a[1]).slice(0,3);return o;}
// pasos: cuántas rutas de la red (y de tu país) cruzan cada uno con el estado de hoy
function lgCkUse(){const F=lgFlows();const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const U={};LG_CKK.forEach(k=>U[k]={n:0,v:0,me:0});
  F.forEach(f=>{if(f.m!=='mar')return;const s=lgRouteSea(f);s.ck.forEach(k=>{U[k].n++;U[k].v+=f.v;if(me&&(f.na===me||f.nb===me))U[k].me++;});});return U;}
