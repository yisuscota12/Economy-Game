/* ===================== v2.3c: fase 5 de la ruta 9d (naturaleza y recursos), parte 3 — motor =====================
   1) Conservación: 🌳 reforestación (hasta 2 niveles), 🏞️ área protegida (1; solo el gobierno) y 🚰 planta de tratamiento de aguas
      (hasta 2; la v2.3b no tenía proyecto de tratamiento, se agrega aquí). Mismo patrón que los proyectos de la v2.3b: entradas en
      NT_PJ (para reutilizar ntPjCan, ntPjCost, ntPjPay, ntPjBuild, ntPjStart, ntPjLeft e ntPjIncome) guardadas en G.np, pero FUERA
      de NT_PJK (NT_CVK): así la IA de la v2.3b y su regla de «un proyecto a la vez» no cambian. Costo recurrente (mantenimiento al
      año, del tesoro o de tu dinero; si no alcanza, el proyecto se suspende ese año y no da efecto). Efecto modesto y medido en
      ntProv (envoltorio): ecosistema +3 por nivel de reforestación y +5 el área protegida; agua renovable +1.5 % por nivel y +2 %.
      Los gobiernos de la IA los declaran con h21 (12 % por año si su ecosistema está 6 puntos bajo lo normal; uno a la vez; gratis
      como en la v2.3b). Turismo: la demanda de tus hoteles, bares y joyerías (tourF) sube o baja con la naturaleza de la provincia.
   2) Contaminación de empresas (causa 'cont' del ecosistema): tus fábricas, minas, pozos, constructoras, talleres y transportes, las
      empresas industriales de la bolsa (sede en una de las 3 provincias más pobladas de su país, elegida con h21; tamaño = la mitad
      de su valor de mercado frente al PIB del país) y la extracción de minerales y energía de los yacimientos (DEP; log2(1 + 10 ×
      valor extraído / PIB de la provincia)) restan ecosistema en su provincia en proporción a su tamaño (tus empresas: 40 × raíz
      de sus ventas frente al PIB de la provincia; tope 8 por fuente y 14 en total). Cada nivel de planta de tratamiento compensa la mitad.
   3) Sequía y empresas agrícolas: la sequía de la v2.3a baja la cosecha de tus granjas (−45 % × severidad, como los cultivos) y la
      producción de tus ranchos (−25 % × severidad) en esa provincia. No toca el PIB base (solo lo que vende tu empresa).
   4) Avance científico «💧 Tecnología del agua» (sistema de investigación de la v0.8: tecnología civil n.tech.c y researchCost):
      lo obtiene cualquier país al llegar a tecnología civil 3, o tu gobierno lo financia desde el nivel 1. Abarata 20 % el costo y
      el mantenimiento de todos los proyectos de agua, alimentos y conservación. Se guarda en G.nav[país] = año.
   Sin Math.random: todo es determinista (h21) para no mover el azar del juego ni las pruebas con semilla. */

/* ---------- 4) avance científico ---------- */
const NT_AVP=.20,NT_AVT=3,NT_AVT0=1;          // descuento, nivel civil que lo da solo, nivel desde el que se puede financiar
const ntAvHas=nid=>!!(G.nav&&G.nav[nid]);
function ntAvCost(n){ensureEco(n);return researchCost(n,'c')*1.2;}
function ntAvCan(n){ensureEco(n);if(ntAvHas(n.id))return 'Tu país ya tiene este avance.';if((n.tech.c||0)<NT_AVT0)return `Necesitas tecnología civil ${NT_AVT0} (tienes ${Math.floor(n.tech.c||0)}).`;
  if((n.treas||0)<ntAvCost(n))return 'No alcanza el tesoro nacional.';return '';}
function ntAvBuy(){const n=natOf(P);if(!playerRules(n.id))return 'Solo el gobierno puede financiar la investigación.';const e=ntAvCan(n);if(e)return e;const c=ntAvCost(n);n.treas-=c;
  G.nav=G.nav||{};G.nav[n.id]=G.year;return `🔬 Tus universidades logran el avance «Tecnología del agua» (${fmtN(c)}): los proyectos de agua, alimentos y conservación cuestan ${Math.round(NT_AVP*100)} % menos.`;}
function ntAvYear(){const me=P&&P.alive?natOf(P).id:null;for(const id in G.nations){const n=G.nations[id];if(!n.alive||ntAvHas(id))continue;ensureEco(n);
  if((n.tech.c||0)>=NT_AVT){G.nav=G.nav||{};G.nav[id]=G.year;if(id===me)pushNews(`🔬 ${n.name} logra el avance «Tecnología del agua»: los proyectos de agua y conservación cuestan ${Math.round(NT_AVP*100)} % menos.`,'good');}}}
{const _c=ntPjCost;ntPjCost=function(rid,k){const v=_c(rid,k);const x=G.regions[rid];return x&&ntAvHas(x.o)?v*(1-NT_AVP):v;};}

/* ---------- 1) conservación: nuevos proyectos (fuera de NT_PJK) ---------- */
Object.assign(NT_PJ,{
 refor:{n:'Reforestación',ic:'🌳',c:.005,cm:.0003,max:2,m:24,ty:'eco',d:'+3 de salud del ecosistema y +1.5 % de agua renovable por nivel (el bosque retiene la lluvia). Ayuda al turismo.',req:'bosq',r:.02},
 aprot:{n:'Área protegida',ic:'🏞️',c:.004,cm:.0004,max:1,m:12,ty:'eco',d:'+5 de salud del ecosistema y +2 % de agua renovable (cuencas protegidas). Atrae turismo. Solo la declara el gobierno.',gov:1},
 trat:{n:'Planta de tratamiento de aguas',ic:'🚰',c:.008,cm:.0005,max:2,m:18,ty:'eco',d:'Compensa la mitad de la contaminación de las empresas de la provincia por nivel (+1 si no hay industria: aguas negras de las ciudades).',r:.05}});
const NT_CVK=['refor','aprot','trat'];
const ntCvUpkeep=(rid,k)=>{const x=G.regions[rid];const J=NT_PJ[k];if(!x||!J.cm)return 0;return x.gdp*J.cm*Math.max(1,ntPjLv(rid,k))*(ntAvHas(x.o)?1-NT_AVP:1);};
{const _c=ntPjCan;ntPjCan=function(rid,k){const J=NT_PJ[k];if(J&&J.req==='bosq'&&G.regions[rid]){const b=ntBase(rid);if(b.k==='desierto'||b.k==='tundra')return {ok:false,why:'No se puede reforestar un desierto o una tundra.'};}return _c(rid,k);};}
{const _p=ntPjPay;ntPjPay=function(rid,k){const r=_p(rid,k);if(r&&!r.ok&&k==='aprot'&&/presa/.test(r.why||''))r.why='Solo el gobierno puede declarar un área protegida.';return r;};}
// suspendido = el mantenimiento de este año no se pagó (e.s = año)
const ntCvOn=(e)=>e&&e.l>0&&e.s!==G.year;
/* ---------- 2) contaminación de empresas ---------- */
const NT_CWB={fabrica:1,mina:1.2,petrolera:1.3,constructora:.35,taller:.15,transporte:.25};    // tus empresas: peso por giro
const NT_CWS={ind:1,auto:.8,semi:.6,min:1.2,ener:1.3};                                          // empresas de bolsa: peso por sector
const NT_XN={US:'USA',MX:'MEX',BR:'BRA',AR:'ARG',CL:'CHL',CO:'COL',CA:'CAN',UK:'GBR',DE:'DEU',FR:'FRA',NL:'NLD',CH:'CHE',ES:'ESP',IT:'ITA',SE:'SWE',PL:'POL',
  JP:'JPN',CN:'CHN',HK:'CHN',TW:'TWN',KR:'KOR',IN:'IND',ID:'IDN',SG:'SGP',AU:'AUS',SA:'SAU',IL:'ISR',TR:'TUR',RU:'RUS',ZA:'ZAF',NG:'NGA',EG:'EGY'};
const ntCw=(w,s,k)=>-clamp(w*Math.sqrt(Math.max(0,s))*(k||40),0,8); // tamaño (peso en la economía) → puntos de ecosistema
const ntCwD=s=>-clamp(Math.log2(1+10*Math.max(0,s)),0,8);          // yacimientos de minerales y energía (valor extraído / PIB de la provincia)
// sede de cada empresa de bolsa: una de las 3 provincias más pobladas de su país (datos fijos del mapa, h21 con su clave)
const NTHQ={};
function ntHq(id,nid){if(NTHQ[id]!==undefined)return NTHQ[id];const rs=Object.keys(RG).filter(r=>RG[r].n===nid).sort((a,b)=>(RG[b].pop||0)-(RG[a].pop||0)).slice(0,3);
  return NTHQ[id]=rs.length?rs[Math.floor(h21(id+'|hq')*rs.length)]:null;}
// fuentes de la IA por provincia (bolsa y yacimientos), en caché por año
const NT3={g:null,y:-1,m:{}};
function ntCvAI(){if(NT3.g===G&&NT3.y===G.year)return NT3.m;const M={};NT3.g=G;NT3.y=G.year;NT3.m=M;
  try{const C=G.mk&&G.mk.C;if(C)for(const id in C){const c=C[id];const w=NT_CWS[c.sec];if(!w||!(c.p>0)||!c.sh)continue;const X=G.mk.X[c.x];const nid=NT_XN[c.x];if(!X||!nid)continue;
    const r=ntHq(id,nid);const x=r&&G.regions[r];const n=x&&G.nations[x.o];if(!x||!n||!(n.gdp>0))continue;const usd=c.p*c.sh/Math.max(1e-9,fxOf(X.cur))*.5;const v=ntCw(w,usd/n.gdp,25);
    if(v<=-.1)(M[r]=M[r]||[]).push(['bolsa',c.nm,v]);}}catch(e){}
  try{for(const r in DEP){const x=G.regions[r];if(!x||!(x.gdp>0)||(G.occ&&G.occ[r]))continue;let usd=0;for(const k in DEP[r])if(RES0[k][5]!=='agr')usd+=DEP[r][k]*resVal(k);
    if(usd>0){const v=ntCwD(usd/x.gdp);if(v<=-.1)(M[r]=M[r]||[]).push(['dep','Minas y pozos de la provincia',v]);}}}catch(e){}
  return M;}
// tus empresas: tamaño = ventas de los últimos 12 meses en US$
function ntCvMine(rid){const L=[];if(!P||!P.alive)return L;const x=G.regions[rid];if(!x||!(x.gdp>0))return L;let k1=0;try{k1=toInt(1,'USD');}catch(e){}if(!(k1>0))return L;
  try{bzList(P).forEach(b=>{if(!b||!b.v14||b.r!==rid)return;const w=NT_CWB[b.k];if(!w)return;const M=(b.m||[]).slice(-12);if(!M.length)return;
    const rev=M.reduce((s,z)=>s+(z.rev||0),0)*12/M.length/k1;const v=ntCw(w,rev/x.gdp);if(v<=-.1)L.push(['tuya',b.n||bzT(b).n,v]);});}catch(e){}
  return L;}
// contaminación de la provincia: fuentes, total y lo que compensa el tratamiento
function ntCont(rid){const R=G.np&&G.np[rid];const tl=R&&ntCvOn(R.trat)?R.trat.l:0;const S=(ntCvAI()[rid]||[]).concat(ntCvMine(rid)).sort((a,b)=>a[2]-b[2]);
  const raw=Math.max(-14,S.reduce((s,e)=>s+e[2],0));const comp=-raw*Math.min(1,.5*tl);return {S,raw,comp,v:raw+comp,tl};}
/* efecto en ntProv (después del de la v2.3b): contaminación, tratamiento, reforestación y áreas protegidas */
{const _p=ntProv;ntProv=function(rid,Y){const o=_p(rid,Y);if(!o||o._cv)return o;o._cv=1;try{const R=G.np&&G.np[rid];const add=[];let dW=0;
  const C=ntCont(rid);o.cont=C;if(C.raw<=-.5)add.push(['cont',C.raw]);if(C.comp>=.5)add.push(['trat',C.comp]);else if(C.tl&&C.raw>-.5)add.push(['trat',1*C.tl]);
  if(R){const W0=o.b.Wr+o.b.Wv;if(ntCvOn(R.refor)){add.push(['refor',3*R.refor.l]);dW+=W0*.015*R.refor.l*(1-.35*o.sq);}
    if(ntCvOn(R.aprot)){add.push(['aprot',5]);dW+=W0*.02*(1-.35*o.sq);}}
  if(dW){o.W+=dW;o.wpc=o.W*1e9/o.pop;o.cvW=dW;}
  if(add.length){let d=0;add.forEach(e=>{o.eco.L.push(e);d+=e[1];});o.eco.v=Math.round(clamp(o.eco.v+d,3,97));}}catch(e){}return o;};}
{const _n=ntNat;ntNat=function(nid){const N=_n(nid);if(!N||N._cv)return N;N._cv=1;let w=0;regionsOf(nid).forEach(r=>{const o=ntProv(r);if(o&&o.cvW)w+=o.cvW;});N.cvW=w;return N;};}
// causa visible en el medidor de agua
{const _w=ntWater;ntWater=function(rid){const M=_w(rid);try{const o=ntProv(rid);if(M&&o&&o.cvW){const d=.4*(ntWSr(o.W*1e9/o.p0)-ntWSr(Math.max(1e-6,o.W-o.cvW)*1e9/o.p0));
  if(d>=.5){M.L.push(['cvag',d]);M.v=Math.round(clamp(M.v+d,2,98));}}}catch(e){}return M;};}
{const _w=ntWaterN;ntWaterN=function(nid){const M=_w(nid);try{const N=ntNat(nid);if(M&&N&&N.cvW){const d=ntWSr(N.W*1e9/N.p0)-ntWSr(Math.max(1e-6,N.W-N.cvW)*1e9/N.p0);
  if(d>=.5){M.L.push(['cvag',d]);M.v=Math.round(clamp(M.v+d,2,98));}}}catch(e){}return M;};}
// las especies que sufren la industria también sufren la contaminación de las empresas
Object.values(NT_SP).forEach(L=>L.forEach(s=>{if(s[4].includes('ind')&&!s[4].includes('cont'))s[4].push('cont');}));if(!NT_SPR[4].includes('cont'))NT_SPR[4].push('cont');
NT_SPC.cont='Contaminación de fábricas, minas y pozos';
/* turismo: la naturaleza de la provincia (o del país) mueve la demanda de tus hoteles, bares y joyerías */
function ntTourR(rid){const o=ntProv(rid);if(!o)return 1;const R=G.np&&G.np[rid];let f=1+(o.eco.v-o.eco.base)*.004;
  if(R){if(ntCvOn(R.aprot))f+=.06;if(ntCvOn(R.refor))f+=.02*R.refor.l;}return clamp(f,.85,1.15);}
function ntTourN(nid){const E=ntEcoN(nid);let k=0;regionsOf(nid).forEach(r=>{const R=G.np&&G.np[r];if(R&&ntCvOn(R.aprot))k++;});return clamp(1+(E.v-E.base)*.003+Math.min(.06,.02*k),.9,1.1);}
const NTZ={b:null};
{const _t=tourF;tourF=function(n){let f=_t(n);try{const b=NTZ.b;if(b&&G.regions[b.r]&&G.regions[b.r].o===n.id)f*=ntTourR(b.r);else if(!b)f*=ntTourN(n.id);}catch(e){}return f;};}
/* ---------- 3) sequía en tus granjas y ranchos ---------- */
{const _bm=bzMonth;bzMonth=function(p,b){if(!b||!b.v14||!G||!G.regions[b.r])return _bm(p,b);const T=bzT(b);let sq=0;
  try{if(b.k==='granja'||b.k==='rancho')sq=ntProv(b.r).sq||0;}catch(e){}
  const f=sq?(b.k==='granja'?1-.45*sq:1-.25*sq):1;const d0=b.dq,c0=b.comp,n0=b.m?b.m.length:0;NTZ.b=b;
  if(f<1){if(T.out)b.dq=(d0||1)*f;else b.comp=(c0==null?1:c0)*f;}
  try{_bm(p,b);}finally{NTZ.b=null;
    if(f<1){if(T.out){if(d0===undefined)delete b.dq;else b.dq=d0;}else if(b.comp!=null)b.comp=Math.min(1,b.comp+(c0==null?1:c0)*(1-f));
      const m=b.m&&b.m[b.m.length-1];if(m&&b.m.length>=n0)m.sq=1-f;
      if(p===P&&b.sqy!==G.year&&G.regions[b.r]){b.sqy=G.year;try{log(`🌵 Sequía en ${RG[b.r].nm}: ${b.n||T.n} produce ${Math.round((1-f)*100)} % menos este año.`,'bad');}catch(e){}}}}};}
/* ---------- quién declara proyectos de conservación ---------- */
// la IA: con h21, 12 % por año si el ecosistema del país está 6 puntos bajo lo normal; un proyecto de conservación a la vez
function ntCvAIBuild(){const Y=G.year;for(const id in G.nations){const n=G.nations[id];if(!n.alive||playerRules(id))continue;if(h21(id+'|'+Y+'|cv')>=.12)continue;
  const rs=regionsOf(id);if(!rs.length)continue;let E;try{E=ntEcoN(id);}catch(e){continue;}if(!(E.v<E.base-6))continue;
  if(rs.some(r=>{const R=G.np&&G.np[r];return R&&NT_CVK.some(k=>R[k]&&R[k].q);}))continue;
  const dv=devFromPc(n.gdp/Math.max(1,n.pop));const L=rs.map(r=>[r,ntProv(r)]).filter(e=>e[1]);let pick0=null;
  const pol=L.filter(e=>e[1].cont&&e[1].cont.raw<=-4).sort((a,b)=>a[1].cont.raw-b[1].cont.raw).slice(0,4);
  if(dv>=4)for(const [r] of pol)if(ntPjCan(r,'trat').ok){pick0=[r,'trat'];break;}
  if(!pick0){const gap=L.sort((a,b)=>(b[1].eco.base-b[1].eco.v)-(a[1].eco.base-a[1].eco.v)).slice(0,6);
    for(const [r] of gap){if(dv>=3.5&&ntPjCan(r,'aprot').ok){pick0=[r,'aprot'];break;}if(ntPjCan(r,'refor').ok){pick0=[r,'refor'];break;}}}
  if(pick0)ntPjStart(pick0[0],pick0[1],'ia',0);}}
// mantenimiento de lo que pagó el jugador (solo en provincias de su país): tesoro si lo pagó el gobierno, tu dinero si fue privado
function ntCvUpkeepYear(){if(!P||!P.alive||!G.np)return;const me=natOf(P);const n=G.nations[me.id];let tg=0,tp=0;const off=[];
  for(const r in G.np){const x=G.regions[r];if(!x||x.o!==me.id)continue;for(const k of NT_CVK){const e=G.np[r][k];if(!e||!e.l||(e.b!=='g'&&e.b!=='p'))continue;const c=ntCvUpkeep(r,k);
    if(e.b==='g'){if(playerRules(me.id)&&(n.treas||0)>=c){n.treas-=c;tg+=c;delete e.s;}else if(playerRules(me.id)){e.s=G.year;off.push(NT_PJ[k].n+' ('+RG[r].nm+')');}else delete e.s;}
    else{const loc=toInt(c,'USD');if(P.dinero>=loc){P.dinero-=loc;tp+=loc;delete e.s;}else{e.s=G.year;off.push(NT_PJ[k].n+' ('+RG[r].nm+')');}}}}
  try{if(tg)log(`🌳 Mantenimiento de reforestación, áreas protegidas y tratamiento de aguas: ${fmtN(tg)} del tesoro.`);if(tp)log(`🌳 Mantenimiento de tus proyectos de conservación: ${fmt(tp)}.`);
    if(off.length)log(`⚠️ Sin dinero para el mantenimiento: ${off.join(', ')} quedan suspendidos este año (sin efecto).`,'bad');}catch(e){}
  if(off.length)NTC.g=null;}
// noticias propias al terminar una obra de conservación (la v2.3b diría «más alimentos»)
{const _t=ntPjTick;ntPjTick=function(){if(G.np){const now=ntMonthKey();const me=P&&P.alive?natOf(P).id:null;let c=0;
  for(const r in G.np){const R=G.np[r];for(const k of NT_CVK){const e=R[k];if(!e||!e.q||e.q>now)continue;e.q=0;e.l++;c++;const x=G.regions[r];
    if(me&&x&&x.o===me&&RG[r])pushNews(`${NT_PJ[k].ic} ${k==='aprot'?'Se declara área protegida':'Termina '+NT_PJ[k].n.toLowerCase()+' en'} ${RG[r].nm}${NT_PJ[k].max>1?' (nivel '+e.l+')':''}: mejora la salud del ecosistema.`,'good');}}
  if(c)NTC.g=null;}return _t();};}
{const _py=provYear;provYear=function(){_py();try{ntCvAIBuild();ntCvUpkeepYear();ntAvYear();}catch(e){}};}
