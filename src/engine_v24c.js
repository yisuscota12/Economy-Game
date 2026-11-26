/* ===================== v2.4c: fase 2 de la lista del dueño (economía) — motor =====================
   1) Logística aérea: ✈️ aeropuertos como obra de provincia (BLD.aero, NO enumerable: aiBuild elige con Object.keys(BLD) y una clave
      más cambiaría lo que construye la IA, ver trampa 98). Cada provincia tiene un nivel base que sale de los datos (capitales y
      ciudades grandes; no se guarda) y el jugador que gobierna suma niveles (x.b.aero, hasta 3 en total). Rutas aéreas entre
      aeropuertos por gravedad (población × ingreso / distancia), calculadas cada año (caché AEC, no se guarda). Tránsito corto y
      costo alto (flete aéreo de la v2.4a × precio del petróleo contra su tendencia). Efectos: término «naer» en la salud de
      Comercio minorista y Lujo (lo perecedero y caro que llega en avión: el petróleo lo encarece; más aeropuertos lo abaratan),
      insumos sensibles al tiempo más caros para tus cafeterías, restaurantes, hoteles, joyerías, farmacias y clínicas, y más
      turistas (parte 3).
   2) Secretaría de inversiones: empresas estatales (G.se) de cualquier giro de BZ que el país pueda sostener. Capital inicial del
      tesoro, presupuesto anual (bajo/normal/alto), empleo, ventas, costo y resultado que va al tesoro (solo el del país del jugador
      toca n.treas: el tesoro de la IA no se usa). Efecto en la salud de su sector (término «est», centrado en la rentabilidad),
      en el empleo y en el PIB de su provincia (valor agregado × 0.5, solo los cambios: las estatales iniciales de la IA ya están en
      los datos). Quiebra tras 2 años con margen < −5 %: rescatar, cerrar o privatizar (a un privado o al jugador). Pueden cotizar.
      La IA tiene estatales iniciales (países con tradición estatal) y funda o privatiza con h21.
   3) Secretaría de turismo: llegadas y gasto por país (datos aprox. de la OMT y el Banco Mundial, 2019, para ~50 países; el resto
      estimado) repartidos entre provincias por atractivos que ya existen (ciudad más grande, capital, costa, bioma, aeropuerto,
      área protegida y reforestación de la v2.3c). Reemplaza el efecto de la naturaleza de la v2.3c y la campaña ×1.2 de la v1.5b en
      tourF por: intensidad turística de la provincia contra su país × políticas (campaña, visado, tasa, aeropuertos)^0.6 × ecosistema.
      Las políticas del jugador mueven el PIB (gasto extra × 0.5) y la tasa entra al tesoro.
   4) Bolsa según el PIB: cada país con bolsa tiene N = clamp(round(170 × PIB^0.75 / Σ PIB^0.75), 2, 40) empresas que cotizan (las 105
      de siempre se quedan; se agregan las que faltan, ~73, con h21: sin Math.random). Cada una representa su sector: participación
      del sector en el PIB / empresas del sector, normalizada para que las del país sumen el 100 % de su PIB. Su utilidad sigue la
      salud de su sector (el doble que las demás).
   Azar del motor: solo h21 (nada de Math.random, R() ni pick()). */

/* ===================== 1) LOGÍSTICA AÉREA ===================== */
Object.defineProperty(BLD,'aero',{value:{n:'Aeropuerto',ic:'✈️',c:.06,max:3,d:'Más vuelos: turistas y carga rápida; +0.3 % de crecimiento por nivel que construyas'},enumerable:false,writable:true,configurable:true});
const AE_KM=40075/((typeof MAP!=='undefined'&&MAP.W)||4096);   // km por px del mapa (ecuador)
const AE={b:null,cp:null};
// ciudad más grande de cada provincia [población, nombre] (CITIES + CITY_RG; datos fijos)
function aeCityPop(){if(AE.cp)return AE.cp;const M={};if(typeof CITIES!=='undefined'&&typeof cityRid==='function')CITIES.forEach((c,i)=>{const r=cityRid(i);if(r&&(!M[r]||c[2]>M[r][0]))M[r]=[c[2],c[3]];});return AE.cp=M;}
// nivel base (datos): capital = 1 (2 si el país tiene PIB ≥ 200 mil M o la ciudad ≥ 5 M); ciudad ≥ 1 M = 1, ≥ 5 M = 2, ≥ 10 M en país grande = 3
function aeBaseAll(){if(AE.b)return AE.b;const B={},C=aeCityPop();for(const r in RG){const g=RG[r],cp=C[r]?C[r][0]:0,big=((N0[g.n]||{}).gdp||0)>=2e11;let l=0;
  if(g.cap)l=big||cp>=5e6?2:1;if(cp>=5e6)l=Math.max(l,2);else if(cp>=1e6)l=Math.max(l,1);if(cp>=1e7&&big)l=3;if(l)B[r]=l;}return AE.b=B;}
const aeBase=r=>aeBaseAll()[r]||0;
const aeLvl=r=>Math.min(3,aeBase(r)+bl(r,'aero'));
function aeElig(r){const g=RG[r],x=G.regions[r];if(!g||!x)return false;const C=aeCityPop();return !!(g.cap||aeBase(r)||(C[r]&&C[r][0]>=5e5)||x.pop>=2e6);}
function aeCan(r){if(!aeElig(r))return {ok:false,why:'Solo en capitales, provincias con una ciudad de 500 mil habitantes o más, o con 2 millones de habitantes.'};
  if(aeLvl(r)>=3)return {ok:false,why:'Ya tiene el aeropuerto más grande (nivel 3).'};return {ok:true,why:''};}
function aeCost(r){const x=G.regions[r];return x?x.gdp*BLD.aero.c*(1+aeLvl(r)*.6):0;}
{const _cb=canBuild;canBuild=function(r,k){if(k==='aero')return aeCan(r).ok;return _cb(r,k);};}
{const _b=build;build=function(r,k){const o=_b(r,k);if(k==='aero'){AEC.N=null;AEC.R=null;AEC.ix={};TUS.v++;}return o;};}
{const _p9=provBonus9;provBonus9=function(r,x){let b=_p9(r,x);if(x&&x.b&&x.b.aero)b+=.003*x.b.aero;return b;};}   // solo lo que construye el jugador (la IA no construye aeropuertos)

/* ---------- petróleo, costo y tiempo ---------- */
// desviación del petróleo contra su tendencia: residuo del último mes contra la recta (mínimos cuadrados) de los últimos 60 meses de log(precio).
// Contra la media simple salía sesgada hacia arriba (~+0.08: con inflación el precio siempre va delante de su media atrasada). Sin tocar la caché de
// la naturaleza (trampa 123); caché por mes.
const AEO={k:'',v:0};
function aeOilDev(){const o=G&&G.rs&&G.rs.oil;if(!o||!o.h||o.h.length<3)return 0;const key=G.year+'|'+(G.mk?G.mk.mo:0)+'|'+o.h.length+'|'+o.p;if(AEO.k===key)return AEO.v;
  const h=o.h,n=Math.min(60,h.length),b=h.length-n;let sx=0,sy=0,sxx=0,sxy=0;for(let i=0;i<n;i++){const y=Math.log(h[b+i]);sx+=i;sy+=y;sxx+=i*i;sxy+=i*y;}
  const d=n*sxx-sx*sx,sl=d?(n*sxy-sx*sy)/d:0,a=(sy-sl*sx)/n;AEO.k=key;return AEO.v=Math.log(o.p)-(a+sl*(n-1));}
const aeOilF=()=>clamp(Math.exp(.6*aeOilDev()),.7,1.5);
const aeTc=d=>(LG_M.aer.tc+LG_M.aer.td*Math.min(2,d/2000))*aeOilF();
const aeHours=d=>1.5+d*AE_KM/800;                 // ~800 km/h más 1.5 h en tierra
const aeSeaDays=d=>2+d*AE_KM*1.3/900;             // buque: rodeo de 30 % y ~900 km al día
const aeLandDays=d=>1+d*AE_KM*1.2/600;            // camión o tren: ~600 km al día

/* ---------- nodos y rutas (caché por año) ---------- */
const AEC={g:null,y:-1,N:null,R:null,ix:{}};
function aeCache(){if(AEC.g!==G||AEC.y!==G.year){AEC.g=G;AEC.y=G.year;AEC.N=null;AEC.R=null;AEC.ix={};}return AEC;}
function aeNodes(){const C=aeCache();if(C.N)return C.N;const L=[];for(const r in G.regions){const l=aeLvl(r);if(!l)continue;const x=G.regions[r],n=G.nations[x.o];if(!n||!n.alive||(G.occ&&G.occ[r]))continue;
  const pc=x.gdp/Math.max(1,x.pop);L.push({r,o:x.o,l,w:l*Math.sqrt(Math.max(.05,x.pop/1e6))*Math.sqrt(clamp(pc/1e4,.05,8))});}C.N=L;return L;}
const AE_PAX=3e6;   // pasajeros al año por unidad de gravedad
function aeRoutes(){const C=aeCache();if(C.R)return C.R;const N=aeNodes();const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const W={};const atW=o=>W[o]!=null?W[o]:(W[o]=warsOf(o).length>0);
  const seen=new Set(),cand=[];
  for(let i=0;i<N.length;i++){const a=N[i];let t=[];for(let j=0;j<N.length;j++){if(i===j)continue;const b=N[j];const d=lgDist(a.r,b.r);if(d<120)continue;const dom=a.o===b.o;
      if(!dom&&atW(a.o)&&atW(b.o)&&warBetween(a.o,b.o))continue;const s=a.w*b.w/Math.pow(d+300,1.1)*(dom?1.4:1);
      if(t.length<3||s>t[t.length-1][0]){t.push([s,j,d]);t.sort((x,y)=>y[0]-x[0]);if(t.length>3)t.length=3;}}
    t.forEach(([s,j,d])=>{const k=i<j?i+'|'+j:j+'|'+i;if(seen.has(k))return;seen.add(k);const p=i<j?[a,N[j]]:[N[j],a];cand.push([s,p[0],p[1],d]);});}
  cand.sort((x,y)=>y[0]-x[0]);const R=[];let ni=0,nd=0,nm=0;
  for(const [s,a,b,d] of cand){const dom=a.o===b.o;const mine=me&&(a.o===me||b.o===me);let ok=false;
    if(dom){if(nd<40){nd++;ok=true;}}else if(ni<90){ni++;ok=true;}if(!ok&&mine&&nm<16){nm++;ok=true;}if(!ok)continue;
    const id='A'+a.r+'>'+b.r;R.push({id,a:a.r,b:b.r,na:a.o,nb:b.o,m:'aer',d,dom:dom?1:0,pax:Math.round(s*AE_PAX),c:lgCarrierAI('aer',a.r,id),air:1});}
  C.R=R;return R;}
// conectividad aérea de un país contra la de sus aeropuertos base (1 = sin obras del jugador)
function aeIdx(nid,base){let s=0;for(const r of regionsOf(nid)){const l=base?aeBase(r):aeLvl(r);if(l)s+=l*Math.sqrt(Math.max(.05,G.regions[r].pop/1e6));}return s;}
function aeRel(nid){const C=aeCache();if(C.ix[nid]!=null)return C.ix[nid];const b=aeIdx(nid,true),c=aeIdx(nid,false);return C.ix[nid]=b>0?c/b:(c>0?1.3:1);}
function aeHub(nid){let best=null,bv=-1;for(const r of regionsOf(nid)){const l=aeLvl(r);if(!l)continue;const v=l*1e10+G.regions[r].pop;if(v>bv){bv=v;best=r;}}return best;}

/* ---------- efecto en la salud de los sectores: lo perecedero y caro que llega en avión ---------- */
const AE_KR=1.2,AE_KL=5;
{const _c=shCtx;shCtx=function(n){const c=_c(n);try{const o=lgNat(n.id);c.ae={dep:o?o.dep:0,rel:aeRel(n.id)};}catch(e){c.ae=null;}try{c.se=seSect(n.id);}catch(e){c.se=null;}return c;};}
{const _r=shRefs;shRefs=function(){const R=_r();try{R.aoil=aeOilDev();}catch(e){R.aoil=0;}return R;};}
{const _t=shTerms;shTerms=function(c,R,k,L){let t=_t(c,R,k,L);if(!c)return t;let v;
  const z=c.ae;if(z&&(k==='retail'||k==='lujo')){const K=k==='lujo'?AE_KL:AE_KR;v=clamp(-K*z.dep*clamp(R.aoil||0,-.5,.5)+K*.6*(z.rel-1),-1.5,1.5);if(v>=.5||v<=-.5){t+=v;if(L)L.push(['naer',v]);}}
  const s=c.se&&c.se[k];if(s){v=clamp(s,-2,2);if(v>=.5||v<=-.5){t+=v;if(L)L.push(['est',v]);}}return t;};}

/* ---------- tus empresas: insumos sensibles al tiempo (llegan en avión) y demanda ligada al turismo ---------- */
const AE_TS={cafeteria:.3,restaurante:.12,hotel:.08,joyeria:.25,farmacia:.2,clinica:.15,bar:.06};
function aeBizPrem(b){const ts=AE_TS[b.k];if(!ts)return 0;const x=G.regions[b.r];if(!x)return 0;return ts*aeTc(1500)/Math.sqrt(Math.max(.5,aeRel(x.o)));}
function tuBizF(b){const x=G.regions[b.r];if(!x)return 1;if(b.k==='taxis'){const o=tuProvF(b.r);return clamp(Math.pow(o,.4),.92,1.1);}
  if(b.k==='aerocarga'){const h=aeHub(x.o);return clamp(1+.03*((h?aeLvl(h):0)-1)+.05*(aeRel(x.o)-1),.95,1.1);}return 1;}
{const _bm=bzMonth;bzMonth=function(p,b){if(!b||!b.v14||!G||!G.regions[b.r])return _bm(p,b);const T=bzT(b);let fr=0,tf=1;
  try{fr=aeBizPrem(b);tf=tuBizF(b);}catch(e){fr=0;tf=1;}const g0=T.gm,c0=b.comp,n0=b.m?b.m.length:0;if(fr)T.gm=1-(1-g0)*(1+fr);if(tf!==1)b.comp=(c0==null?1:c0)*tf;
  try{_bm(p,b);}finally{T.gm=g0;if(tf!==1)b.comp=Math.min(1,(c0==null?1:c0)+.01);const m=b.m&&b.m[b.m.length-1];if(m&&b.m.length>=n0){if(fr)m.aef=fr;if(tf!==1)m.tuf=tf;}}};}

/* ===================== 3) TURISMO ===================== */
// Llegadas internacionales (millones) e ingresos por turismo internacional (miles de millones de US$), 2019 (antes de la pandemia).
// Cifras aprox., redondeadas: OMT (Barómetro del Turismo Mundial / Tourism Statistics Database) y Banco Mundial (ST.INT.ARVL, ST.INT.RCPT.CD).
const TU_SRC='OMT y Banco Mundial (ST.INT.ARVL, ST.INT.RCPT.CD), 2019, aprox.';
const TU_REAL={FRA:[89.4,63.8],ESP:[83.5,79.7],USA:[79.3,193.3],CHN:[65.7,35.8],ITA:[64.5,49.6],TUR:[51.2,29.8],MEX:[45.0,24.6],THA:[39.8,60.5],
 DEU:[39.6,41.6],GBR:[39.4,52.7],AUT:[31.9,23.0],JPN:[31.9,46.1],GRC:[31.3,20.3],MYS:[26.1,19.8],RUS:[24.4,11.0],PRT:[24.6,20.6],CAN:[22.1,21.9],
 POL:[21.2,14.0],NLD:[20.1,18.5],ARE:[21.6,38.4],SAU:[17.5,16.4],VNM:[18.0,11.8],IND:[17.9,30.0],HRV:[17.4,11.8],HUN:[16.9,7.3],KOR:[17.5,20.7],
 SGP:[19.1,20.1],MAR:[12.9,8.2],IDN:[15.5,16.9],EGY:[13.0,13.0],CHE:[11.8,17.6],CZE:[10.9,7.4],AUS:[9.5,45.7],ZAF:[10.2,8.4],BRA:[6.4,6.0],
 ARG:[7.4,5.2],DOM:[6.4,7.5],PHL:[8.3,9.9],NZL:[3.7,11.0],IRL:[10.9,13.7],BEL:[9.3,9.3],DNK:[12.7,9.0],SWE:[7.6,14.0],ISR:[4.6,8.6],
 TUN:[9.4,2.0],JOR:[4.5,5.8],CRI:[3.1,4.0],PER:[4.4,3.9],COL:[4.5,6.8],CHL:[4.5,3.5],CUB:[4.3,2.6],UKR:[13.4,2.3],KEN:[2.0,1.5],TZA:[1.5,2.6]};
const TU_BIO={selva:.6,montana:.5,taiga:.25,tundra:.2,desierto:.3,sabana:.35,subtrop:.3,templado:.25,pradera:.15,estepa:.15};
const TUS={s:{},co:null,w0:0,c:null,ck:'',v:0};   // parte fija por provincia, costa por país, PIB mundial base, caché
function tuStatic(r){let o=TUS.s[r];if(o)return o;const g=RG[r]||{};const C=aeCityPop();const cp=C[r]?C[r][0]:0;let bk='templado',al=40;try{bk=ntBase(r).k;al=Math.abs(TRN(r)[3]||40);}catch(e){}
  o={city:Math.log10(1+cp/2e5)*.9,cap:g.cap?.8:0,beach:g.co?(/selva|sabana|subtrop|desierto/.test(bk)?1:al<45&&!/taiga|tundra/.test(bk)?.7:.3):0,nat:TU_BIO[bk]||.2,pop:Math.max(0,.15*Math.log10(Math.max(1,g.pop||g.wp||1e5)/1e5)),bk,cn:C[r]?C[r][1]:null};
  TUS.s[r]=o;return o;}
function tuAttr(r){const s=tuStatic(r);const R=G.np&&G.np[r];let pr=0,rf=0;if(R&&typeof ntCvOn==='function'){if(ntCvOn(R.aprot))pr=.4;if(ntCvOn(R.refor))rf=.1*R.refor.l;}
  const air=.35*aeLvl(r);const v=(s.city+s.cap+s.beach+s.nat+s.pop+air+pr+rf)*(G.occ&&G.occ[r]?.3:1);return {v:Math.max(.05,v),air,pr,rf,s};}
function tuCoast(nid){if(!TUS.co){TUS.co={};for(const r in RG)if(RG[r].co)TUS.co[RG[r].n]=1;}return !!TUS.co[nid];}
function tuW0(){if(TUS.w0)return TUS.w0;let s=0;for(const k in N0)s+=N0[k].gdp||0;return TUS.w0=s||1;}
// llegadas base (personas al año) y gasto por llegada (US$) con los datos de 2019; estimado si el país no está en la tabla
function tuBase0(nid){const R=TU_REAL[nid];if(R)return [R[0]*1e6,R[1]*1e9/(R[0]*1e6),1];const d=N0[nid]||{};const pc=(d.gdp||1e9)/Math.max(1,d.pop||1e6);
  const a=1.6e6*Math.pow(Math.max(.01,(d.pop||1e6)/2e7),.45)*clamp(Math.pow(pc/8000,.35),.35,2)*(tuCoast(nid)?1.15:.8);return [a,850*clamp(Math.pow(pc/12000,.25),.5,1.6),0];}
function tuEnsure(nid){G.tu=G.tu||{};return G.tu[nid]||(G.tu[nid]={v:1,t:0,ga:0});}
const TU_VISA=[['Libre',1.06],['Normal',1],['Estricto',.85]],TU_TAX=[['Sin tasa',1,0],['Tasa baja',.98,.015],['Tasa alta',.94,.04]];
// políticas (lo que decide un gobierno) y condiciones (guerra, sanciones, estabilidad)
function tuPol(nid){const n=G.nations[nid];const T=(G.tu&&G.tu[nid])||{v:1,t:0};let k=0;regionsOf(nid).forEach(r=>{const R=G.np&&G.np[r];if(R&&typeof ntCvOn==='function'&&ntCvOn(R.aprot))k++;});
  const camp=n&&dvOn(n,'tur0')?1.12:1,visa=TU_VISA[T.v][1],tax=TU_TAX[T.t][1],air=Math.pow(aeRel(nid),.35),prot=1+Math.min(.06,.015*k);
  return {camp,visa,tax,air,prot,k,pol:camp*visa*tax,all:camp*visa*tax*air*prot};}
function tuNat(nid){const key=G.year+'|'+(G.mk?G.mk.mo:0)+'|'+TUS.v;if(TUS.ck!==key||TUS.g!==G){TUS.ck=key;TUS.g=G;TUS.c={};let w=0;for(const id in G.nations){const m=G.nations[id];if(m.alive)w+=m.gdp;}TUS.wf=Math.pow(Math.max(.2,w/tuW0()),.8);}
  if(TUS.c[nid])return TUS.c[nid];const n=G.nations[nid];if(!n||!n.alive)return TUS.c[nid]={arr:0,rec:0,sp:0,P:{},L:[],pol:1,all:1,po:tuPol(nid),cond:1,real:0};
  const [a0,sp0,real]=tuBase0(nid);const po=tuPol(nid);const war=warsOf(nid).length?.45:1,sanc=n.sanc>0?.85:1,stab=clamp(Math.pow(Math.max(5,n.stab)/Math.max(10,n.stab0||50),.4),.6,1.25);
  const cond=war*sanc*stab;const pf=clamp(Math.pow((n.gdp/Math.max(1,n.pop))/Math.max(1,(N0[nid]||{}).gdp/Math.max(1,(N0[nid]||{}).pop||1)||1),.2),.7,1.5);
  const arr=a0*TUS.wf*po.all*cond,sp=sp0*pf,rec=arr*sp;
  const rs=regionsOf(nid);let S=0;const A=rs.map(r=>{const t=tuAttr(r);const w=Math.pow(t.v,1.5);S+=w;return [r,t,w];});const Pm={},L=[];
  A.forEach(([r,t,w])=>{const f=S>0?w/S:0;const e={r,a:arr*f,rec:rec*f,at:t};Pm[r]=e;L.push(e);});L.sort((x,y)=>y.a-x.a);
  return TUS.c[nid]={arr,rec,sp,P:Pm,L,pol:po.pol,all:po.all,po,cond,real};}
// factor de la provincia para tus empresas de turismo: intensidad turística contra su país (0.8–1.3) × políticas^0.6 (0.85–1.2)
function tuProvF(r){const x=G.regions[r];if(!x)return 1;const o=tuNat(x.o);const e=o.P[r];if(!e)return 1;const n=G.nations[x.o];
  const ir=e.rec/Math.max(1,x.gdp),inn=o.rec/Math.max(1,n.gdp);const L=clamp(Math.pow(Math.max(1e-7,ir)/Math.max(1e-7,inn),.2),.8,1.3);
  return L*clamp(Math.pow(o.po.all,.6),.85,1.2);}
// ecosistema (lo único de la v2.3c que no está en los atractivos): solo en el camino de tus empresas y en la interfaz
function tuEcoR(r){try{const o=ntProv(r);return clamp(1+(o.eco.v-o.eco.base)*.004,.9,1.1);}catch(e){return 1;}}
function tuEcoN(nid){try{const E=ntEcoN(nid);return clamp(1+(E.v-E.base)*.003,.92,1.08);}catch(e){return 1;}}
// tourF: quita la naturaleza de la v2.3c y la campaña ×1.2 de la v1.5b (ahora están dentro del modelo) y aplica el modelo nuevo
{const _t=tourF;tourF=function(n){let f=_t(n);try{const b=NTZ.b;let nat=1,r=null;
   if(b&&G.regions[b.r]&&G.regions[b.r].o===n.id){nat=ntTourR(b.r);r=b.r;}else if(!b)nat=ntTourN(n.id);
   f=f/Math.max(.5,nat)/(dvOn(n,'tur0')?1.2:1);f*=r?tuProvF(r)*tuEcoR(r):clamp(Math.pow(tuNat(n.id).po.all,.6),.85,1.2)*tuEcoN(n.id);}catch(e){}return f;};}
// cada año: lo que cambian las políticas del jugador (gasto extra × 0.5 al PIB de las provincias) y la tasa turística al tesoro
function tuYear(){if(!G.tu)return;for(const nid in G.tu){const T=G.tu[nid];const n=G.nations[nid];if(!n||!n.alive)continue;const o=tuNat(nid);
  const tgt=o.rec*(1-1/Math.max(.5,o.po.pol))*.5;const d=tgt-(T.ga||0);if(Math.abs(d)>1){const S=o.rec||1;o.L.forEach(e=>{const x=G.regions[e.r];if(!x)return;const dd=clamp(d*e.rec/S,-x.gdp*.05,x.gdp*.05);x.gdp+=dd;n.gdp+=dd;});T.ga=tgt;}
  if(playerRules(nid)){const tx=o.rec*TU_TAX[T.t][2];if(tx>0){n.treas=(n.treas||0)+tx;T.ty=Math.round(tx);}else T.ty=0;if(T.v===2)n.stab=clamp(n.stab+.5,0,100);}}}
function tuSet(nid,f,v){const T=tuEnsure(nid);T[f]=v;TUS.v++;const n=G.nations[nid];
  if(f==='v')return `Visado para turistas: ${TU_VISA[v][0].toLowerCase()}. Llegadas ${tuPct(TU_VISA[v][1]-1)}${v===2?'; +0.5 de estabilidad al año':''}.`;
  return `Tasa turística: ${TU_TAX[v][0].toLowerCase()}. Llegadas ${tuPct(TU_TAX[v][1]-1)}; al tesoro ${Math.round(TU_TAX[v][2]*1000)/10} % del gasto de los turistas.`;}
const tuPct=v=>(v>=0?'+':'−')+Math.abs(Math.round(v*100))+' %';

/* ===================== 2) EMPRESAS ESTATALES ===================== */
const SE_SZ=[['Pequeña',.0003],['Mediana',.001],['Grande',.003]];   // capital inicial como fracción del PIB del país
const SE_BUD=[['Bajo',0,-.03],['Normal',.03,-.005],['Alto',.06,.02]];  // [nombre, fracción del capital al año, cambio de eficiencia al año]
const SE_NM={petrolera:'Petróleos Nacionales',mina:'Minera Nacional',aerocarga:'Aerolínea Nacional de Carga',naviera:'Naviera Nacional',transporte:'Ferrocarriles y Carga del Estado',
  taxis:'Transporte Urbano del Estado',financiera:'Banco Nacional de Fomento',fabrica:'Industrias del Estado',hotel:'Hoteles del Estado',constructora:'Constructora del Estado',
  inmobiliaria:'Vivienda del Estado',clinica:'Clínicas del Estado',farmacia:'Farmacias del Bienestar',granja:'Granjas del Estado',rancho:'Ganadera del Estado',software:'Tecnologías del Estado',
  escuela:'Escuelas Técnicas del Estado',abarrotes:'Tiendas del Bienestar',ecommerce:'Correos y Comercio Digital del Estado',agencia:'Agencia de Medios del Estado',videojuegos:'Estudio Digital del Estado'};
// países de la IA con estatales al empezar (tradición de empresas del Estado; nombres genéricos)
const SE_AI0='CHN RUS SAU VNM CUB IRN DZA EGY ETH VEN NOR ARE QAT KWT MEX BRA IND IDN MYS AGO NGA KAZ AZE BOL'.split(' ');
function seEnsure(){if(!G)return null;let S=G.se;if(!S||S.v!==1){S=G.se={v:1,k:0,L:[],t:{}};seAI0(S);}return S;}
function seDev(nid){const rs=regionsOf(nid);let d=0,p=0;rs.forEach(r=>{const x=G.regions[r];d+=(x.dev!=null?x.dev:devFromPc(x.gdp/Math.max(1,x.pop)))*x.pop;p+=x.pop;});return p?d/p:0;}
// lo que el país puede sostener: yacimientos, costa, estudios y tamaño
function seCan(nid,k){const T=BZ[BZK[k]];const n=G.nations[nid];if(!T||!n||!n.alive)return 'Giro desconocido.';if(n.gdp<2e9)return 'La economía del país es demasiado pequeña.';
  const rs=regionsOf(nid);if(T.out==='ene'&&!rs.some(r=>bzDep(r,'ene')))return 'El país no tiene petróleo ni gas.';if(T.out==='met'&&!rs.some(r=>bzDep(r,'met')))return 'El país no tiene yacimientos minerales.';
  if(k==='naviera'&&!rs.some(r=>RG[r]&&RG[r].co))return 'Una naviera necesita costa.';if(T.ed&&seDev(nid)<3.2)return 'El país necesita más desarrollo (universidades y técnicos) para este giro.';return null;}
function seProv(nid,k){const T=BZ[BZK[k]];let best=null,bv=-1;for(const r of regionsOf(nid)){const x=G.regions[r];if(!RG[r]||(G.occ&&G.occ[r]))continue;let v;
    if(T.out==='ene'||T.out==='met'){const d=DEP[r];if(!bzDep(r,T.out))continue;v=0;for(const q in d||{})v+=(d[q]||0)*resVal(q);}else if(k==='naviera'){if(!RG[r].co)continue;v=x.gdp;}
    else if(T.d==='tour'){v=tuAttr(r).v*1e12+x.gdp;}else v=x.gdp;if(v>bv){bv=v;best=r;}}return best;}
function seName(nid,k){const T=BZ[BZK[k]];const n=G.nations[nid];return `${SE_NM[k]||T.n+' del Estado'} de ${n?n.name:nid}`;}
function seNew(S,nid,k,cap,o){const r=seProv(nid,k);if(!r)return null;const e=Object.assign({id:'E'+(++S.k),n:nid,k,r,nm:seName(nid,k),y0:G.year,cap,c0:cap,bud:1,ef:.9,h:[],emp:0,rev:0,res:0,m:0,lq:0,qb:0,gA:0},o||{});S.L.push(e);return e;}
function seAI0(S){for(const nid of SE_AI0){const n=G.nations[nid];if(!n||!n.alive||playerRules(nid))continue;const add=(k,f)=>{if(!seCan(nid,k)&&!S.L.some(e=>e.n===nid&&e.k===k))seNew(S,nid,k,n.gdp*f,{gA:null,ai:1});};
  let ene=0;try{for(const q in RES0)if(RES0[q][5]==='ene'||q==='coal')ene+=resValue(nid,q);}catch(e){}
  if(ene/Math.max(1,n.gdp)>.015)add('petrolera',.004);if(n.gdp>=1e11)add('aerocarga',.0008);if(n.ideo==='com'||n.ideo==='abs'||n.ideo==='teo'){add('financiera',.002);add('fabrica',.0015);}else if(h21(nid+'|se0')<.5)add('transporte',.001);}}
// ventas, margen, resultado y empleo de un año (US$; azar con h21)
function seCalc(e,R){const T=BZ[BZK[e.k]];const x=G.regions[e.r];const n=G.nations[e.n];if(!T||!x||!n)return null;R=R||shRefs();
  const sh=shOf(e.n,T.sec);const dem=clamp(1+(sh-50)/50*.15,.8,1.2)*clamp(Math.pow(prosp(x),.3),.8,1.25)*(T.d==='tour'?clamp(Math.pow(tuNat(e.n).po.all,.6),.85,1.2):1);
  const rev=e.cap/Math.max(.15,T.K)*dem*Math.sqrt(e.ef)*(e.cutE||1);
  let m=clamp(.06+.25*(T.gm-T.L-T.rs-.25),.02,.2)-.04+.3*(e.ef-1)+.1*(sh-50)/50;
  if(T.out==='ene')m+=.3*R.oil;else if(T.out==='met')m+=.3*R.met;if(warsOf(e.n).length)m-=.04;if(e.cut===G.year||e.cut===G.year-1)m+=.03;m+=(h21(e.id+'|'+G.year+'|se')-.5)*.06;
  const w=(N0[e.n]&&N0[e.n].w&&(N0[e.n].w[T.oc]||N0[e.n].w.T))||5000;const emp=Math.max(5,Math.round(rev*T.L/(w*Math.max(.3,prosp(x)))));
  return {rev,m,res:rev*m,emp,dem,sh};}
function seValue(e){const c=seCalc(e);return e.cap*clamp(.5+5*(c?c.m:0),.15,1.5);}
// efecto en la salud de los sectores del país: centrado en la rentabilidad (una estatal que gana ayuda; una que pierde estorba)
const SEC_={k:'',M:null};
function seSect(nid){const S=G.se;if(!S||!S.L.length)return null;const key=G.year+'|'+(G.mk?G.mk.mo:0)+'|'+S.L.length+'|'+(S.ch||0);
  if(SEC_.k!==key){SEC_.k=key;const M={};S.L.forEach(e=>{const T=BZ[BZK[e.k]];const n=G.nations[e.n];if(!T||!n||!e.rev)return;const z=M[e.n]||(M[e.n]={});z[T.sec]=(z[T.sec]||0)+3000*(e.rev/Math.max(1,n.gdp))*(e.m-.03);});SEC_.M=M;}
  return SEC_.M[nid]||null;}
function seYear(){const S=seEnsure();if(!S)return;const Y=G.year,R=shRefs();const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;S.t={};
  for(const e of S.L){const n=G.nations[e.n],x=G.regions[e.r];if(!n||!n.alive||!x||x.o!==e.n){e.dead=1;if(e.n===me)try{log(`🏛️ ${e.nm} deja de operar: el país perdió ${RG[e.r]?RG[e.r].nm:'su provincia'}.`,'bad');}catch(q){}continue;}
    const c=seCalc(e,R);if(!c)continue;const B=SE_BUD[e.bud||0];const bud=e.cap*B[1];e.rev=c.rev;e.res=c.res;e.emp=c.emp;e.m=c.m;
    e.cap+=bud*.7;e.ef=clamp(e.ef+B[2],.6,1.15);const toT=c.res*(e.mk?.7:1)-bud;
    if(playerRules(e.n))n.treas=(n.treas||0)+toT;
    const t=S.t[e.n]||(S.t[e.n]=[0,0,0,0,0]);t[0]+=toT;t[1]+=bud;t[2]+=c.emp;t[3]+=c.rev;t[4]++;
    e.h=(e.h||[]).concat([[Y-1,Math.round(c.rev),Math.round(c.res),Math.round(bud),c.emp]]).slice(-10);
    const T=BZ[BZK[e.k]];const va=Math.max(0,c.rev*(T.L+Math.max(0,c.m)+.05))*.5;
    if(e.gA==null)e.gA=va;else{const d=clamp(va-e.gA,-x.gdp*.05,x.gdp*.05);x.gdp+=d;n.gdp+=d;e.gA+=d;}
    e.lq=c.m<-.05?(e.lq||0)+1:0;
    if(e.mk&&G.mk&&G.mk.C[e.mk]){const co=G.mk.C[e.mk];const fx=G.cx[G.mk.X[co.x].cur].fx;co.eps=Math.max(co.eps*.3,.6*co.eps+.4*c.res*fx/Math.max(1,co.sh));}
    if(e.qb&&!e.lq)e.qb=0;
    else if(e.qb&&Y-e.qb>=2){if(e.n===me){try{log(`🏛️ ${e.nm} sigue en quiebra: el gobierno la cierra y vende lo que queda.`,'bad');}catch(q){}seClose(e,1);}else sePriv(e,'x',1);}
    else if(!e.qb&&e.lq>=2){e.qb=Y;if(e.n===me)try{log(`⚠️ ${e.nm} está en quiebra (2 años con pérdidas grandes): rescátala, privatízala o ciérrala en la Secretaría de inversiones.`,'bad');}catch(q){}}}
  S.L=S.L.filter(e=>!e.dead);S.ch=(S.ch||0)+1;seAIYear(S);}
// la IA: funda (3 % al año con tradición estatal, 1 % el resto con PIB ≥ 50 mil M; hasta 4) con h21
function seAIYear(S){const Y=G.year;const cnt={};S.L.forEach(e=>cnt[e.n]=(cnt[e.n]||0)+1);const ks=['transporte','financiera','fabrica','aerocarga','constructora','hotel','granja','petrolera','mina','farmacia'];
  for(const nid in G.nations){const n=G.nations[nid];if(!n.alive||playerRules(nid)||n.gdp<5e10)continue;const st=SE_AI0.includes(nid)||n.ideo==='com';if(h21(nid+'|'+Y+'|sef')>=(st?.03:.01)||(cnt[nid]||0)>=4)continue;
    const k=ks[Math.floor(h21(nid+'|'+Y+'|sek')*ks.length)];if(seCan(nid,k)||S.L.some(e=>e.n===nid&&e.k===k))continue;seNew(S,nid,k,n.gdp*SE_SZ[1][1],{ai:1});}}
/* ---------- acciones del gobierno del jugador ---------- */
function seFound(nid,k,sz){const S=seEnsure();const n=G.nations[nid];const err=seCan(nid,k);if(err)return err;if(S.L.some(e=>e.n===nid&&e.k===k&&!e.dead))return 'Ya tienes una empresa estatal de ese giro: invierte en ella.';
  const cap=n.gdp*SE_SZ[sz][1];if((n.treas||0)<cap)return `El tesoro no alcanza: hacen falta ${fmtN(cap)}.`;const e=seNew(S,nid,k,cap,{pl:1});if(!e)return 'No hay una provincia adecuada.';n.treas-=cap;S.ch=(S.ch||0)+1;
  try{mkNews(`${n.name} funda ${e.nm} con ${fmtN(cap)} del tesoro.`,false);}catch(q){}return `Fundas ${e.nm} en ${RG[e.r].nm} con ${fmtN(cap)} del tesoro.`;}
function seInvest(e){const n=G.nations[e.n];const c=e.cap*.25;if((n.treas||0)<c)return `El tesoro no alcanza: hacen falta ${fmtN(c)}.`;n.treas-=c;e.cap+=c;e.ef=clamp(e.ef+.05,.6,1.15);if(e.qb){e.qb=0;e.lq=0;}
  return `Inviertes ${fmtN(c)} en ${e.nm}: más capacidad y +5 de eficiencia.`;}
function seCut(e){if(e.cut===G.year)return 'Ya recortaste esta empresa este año.';const n=G.nations[e.n];const x=G.regions[e.r];const back=e.cap*.15*.5;e.cap*=.85;e.cutE=(e.cutE||1)*.85;e.ef=clamp(e.ef+.04,.6,1.15);e.cut=G.year;
  n.treas=(n.treas||0)+back;if(x){ensureProv(x);x.hap=clamp(x.hap-1,0,100);}try{shHit(e.n,BZ[BZK[e.k]].sec,-1);}catch(q){}
  return `Recortas ${e.nm}: vendes activos (${fmtN(back)} al tesoro), baja la plantilla y sube la eficiencia; −1 de felicidad en ${RG[e.r].nm}.`;}
function seBudget(e,l){e.bud=l;return `Presupuesto de ${e.nm}: ${SE_BUD[l][0].toLowerCase()} (${Math.round(SE_BUD[l][1]*100)} % de su capital al año).`;}
function seRemove(e){const S=G.se;if(S)S.L=S.L.filter(z=>z!==e);if(S)S.ch=(S.ch||0)+1;}
function seClose(e,auto){const n=G.nations[e.n];const x=G.regions[e.r];const back=e.cap*.25;if(playerRules(e.n))n.treas=(n.treas||0)+back;
  if(x){const d=Math.min(e.gA||0,x.gdp*.05);x.gdp-=d;n.gdp-=d;ensureProv(x);x.hap=clamp(x.hap-2,0,100);}try{shHit(e.n,BZ[BZK[e.k]].sec,-2);}catch(q){}
  if(e.mk&&G.mk&&G.mk.C[e.mk]){G.mk.C[e.mk].se=null;}seRemove(e);return `Cierras ${e.nm}: recuperas ${fmtN(back)} al vender sus activos; ${fmtK(e.emp||0)} personas pierden su empleo.`;}
// privatizar: a un privado (el tesoro recibe el 90 % de su valor; la actividad sigue) o al jugador (pagas su valor y pasa a Mis empresas)
function sePriv(e,to,auto){const n=G.nations[e.n];const v=seValue(e);
  if(to==='p'){const T=BZ[BZK[e.k]];const r=e.r;const rv1=bzRv(T,r)*bzU(r);const capL=toInt(e.cap,'USD');const br=clamp(Math.round(capL/Math.max(1,T.K*rv1)),1,T.mx);const fr=Math.min(1,br*T.K*rv1/Math.max(1,capL));
    const price=toInt(v*fr,'USD');if(P.dinero<price)return `Te faltan ${fmt(price-P.dinero)} para comprarla.`;P.dinero-=price;if(playerRules(e.n))n.treas=(n.treas||0)+v*fr+v*(1-fr)*.9;
    const res=T.out==='agr'?bzDep(r,'agr')||'corn':T.out?bzDep(r,T.out):null;
    const b={v14:1,k:e.k,t:bzTi(e.k),n:clean(e.nm.replace(/ del Estado| Nacionales?| Nacional/g,'').replace(/ de .*$/,'')+' '+P.surname),r,br,st:T.st*br,pr:0,q:0,wg:0,mk:2,py:50,rep:55,cash:Math.round(capL*fr*.04),debt:0,assets:capL*fr,lc:0,comp:1,m:[],ya:[],lvl:0,_lv:0,luck:1,y:G.year,last:0,res,
      dq:res&&DEP[r]&&DEP[r][res]?clamp(.9+Math.log10(1+DEP[r][res]*resVal(res)/1e8)*.12,.9,1.25):res?.8:1,gA:0};
    if(!P.biz)P.biz=b;else (P.bzx=P.bzx||[]).push(b);if(e.mk&&G.mk&&G.mk.C[e.mk])G.mk.C[e.mk].se=null;seRemove(e);
    return `Compras ${e.nm} por ${fmt(price)}${fr<1?` (la parte que tu empresa puede operar: ${br} sucursal(es); el resto se vende a privados)`:''}. Ahora es ${b.n}.`;}
  if(playerRules(e.n))n.treas=(n.treas||0)+v*.9;if(e.mk&&G.mk&&G.mk.C[e.mk])G.mk.C[e.mk].se=null;seRemove(e);
  if(!auto||e.n===(P&&P.alive?natOf(P).id:null))try{mkNews(`${n.name} privatiza ${e.nm} por ${fmtN(v*.9)}.`,false);}catch(q){}
  return `Privatizas ${e.nm}: un grupo privado paga ${fmtN(v*.9)} al tesoro y la empresa sigue operando.`;}
// sacar a bolsa: el Estado vende el 30 % (al tesoro) y se queda con el 70 % de sus resultados
function seIPO(e){const M=G.mk;if(!M)return 'No hay bolsa.';const xs=EXN[e.n];if(!xs||!xs.length)return 'Tu país no tiene bolsa de valores.';if(e.mk)return 'Ya cotiza.';const c=seCalc(e);if(!c||c.m<=0)return 'Solo una empresa con ganancias puede salir a bolsa.';
  const x=xs[0],cur=M.X[x].cur,fx=G.cx[cur].fx;const v=seValue(e);const id=mrTicker(e.nm,e.n,'E');const p=Math.round(25*Math.max(1,fx/20)*100)/100;const sh=v*fx/p;const eps=Math.max(p/30,c.res*fx/sh);
  const H=mrHist(id,p,.25,.04);M.C[id]=Object.assign({nm:e.nm,x,sec:BZ[BZK[e.k]].sec,p,eps,pe0:p/eps,sh,dy:3,b:.8,v:.2,d:0,q:mkH(id)%63,rp:1,se:e.id},H);e.mk=id;
  const n=G.nations[e.n];if(playerRules(e.n))n.treas=(n.treas||0)+v*.3;try{mkNews(`${e.nm} sale a la bolsa (${id}): ${n.name} vende el 30 % por ${fmtN(v*.3)}.`,true);}catch(q){}
  return `${e.nm} sale a la bolsa con la clave ${id}: el tesoro recibe ${fmtN(v*.3)} por el 30 % y el Estado conserva el 70 %.`;}

/* ===================== 4) BOLSA SEGÚN EL PIB ===================== */
// participación aproximada de cada sector en el PIB sin gobierno (estructura media del mundo, ajustada por ingreso y por recursos); suma 1
const MR_W={ind:.16,retail:.11,cons:.10,inm:.12,fin:.08,salud:.06,tec:.05,trans:.05,ener:.04,serv:.05,tel:.03,medios:.02,auto:.03,ecom:.02,min:.02,lujo:.01,semi:.01,def:.01};
const MR_T=170,MR_A=.75,MR_MIN=2,MR_MAX=40;
const MRS={};
function mrShares(nid){if(MRS[nid])return MRS[nid];const d=N0[nid]||{};const pc=(d.gdp||1)/Math.max(1,d.pop||1);const rich=clamp(Math.log10(pc/1500)/1.6,0,1);let ene=0,met=0;
  try{const P0=RESP[nid]||{};for(const k in RES0){const v=(P0[k]||0)*RES0[k][3];const c=RES0[k][5];if(c==='ene'||k==='coal'||k==='uran')ene+=v;else if(c==='met'||c==='pre')met+=v;}}catch(e){}
  const S={};let t=0;for(const k in MR_W){if(!SECT[k])continue;let w=MR_W[k];if(k==='cons')w*=1.7-rich;else if(/tec|fin|semi|ecom|medios/.test(k))w*=.4+1.2*rich;else if(k==='salud')w*=.6+.6*rich;
    if(k==='ener')w+=.6*ene/Math.max(1,d.gdp||1);if(k==='min')w+=.6*met/Math.max(1,d.gdp||1);S[k]=w;t+=w;}for(const k in S)S[k]/=t;return MRS[nid]=S;}
// N = clamp(round(170 × PIB^0.75 / Σ PIB^0.75), 2, 40) con el PIB de los datos (fijo: las empresas no aparecen ni desaparecen con el PIB)
function mrCounts(){const ns=Object.keys(EXN).filter(n=>N0[n]);const S=ns.reduce((s,n)=>s+Math.pow(N0[n].gdp||1,MR_A),0);const o={};ns.forEach(n=>o[n]=clamp(Math.round(MR_T*Math.pow(N0[n].gdp||1,MR_A)/S),MR_MIN,MR_MAX));return o;}
const MR_ES={tec:'Tecnologías',semi:'Semiconductores',ecom:'Comercio Digital',fin:'Financiera',ener:'Energía',min:'Minera',cons:'Alimentos',retail:'Comercial',lujo:'Lujo',auto:'Automotriz',salud:'Salud',tel:'Telecom',ind:'Industrial',def:'Aeroespacial',inm:'Constructora',serv:'Servicios Públicos',trans:'Transportes',medios:'Medios'};
const MR_EN={tec:'Technologies',semi:'Semiconductor',ecom:'Digital Commerce',fin:'Financial',ener:'Energy',min:'Mining',cons:'Foods',retail:'Retail',lujo:'Luxury',auto:'Motors',salud:'Health',tel:'Telecom',ind:'Industries',def:'Aerospace',inm:'Construction',serv:'Utilities',trans:'Logistics',medios:'Media'};
const MR_SC={tec:'T',semi:'S',ecom:'D',fin:'F',ener:'E',min:'M',cons:'A',retail:'C',lujo:'L',auto:'V',salud:'H',tel:'K',ind:'I',def:'X',inm:'B',serv:'U',trans:'R',medios:'Q'};
function mrCities(nid){const L=[];if(typeof CITIES!=='undefined'&&typeof cityRid==='function')CITIES.forEach((c,i)=>{const r=cityRid(i);if(r&&RG[r]&&RG[r].n===nid)L.push([c[2],c[3]]);});L.sort((a,b)=>b[0]-a[0]);return L.map(z=>z[1]);}
function mrTicker(nm,nid,sc){const M=G.mk;const base=(nm.normalize('NFD').replace(/[^A-Za-z]/g,'').toUpperCase()+'XXX').slice(0,3);let id=base+(sc||'Z');let i=0;
  while(M.C[id]||(typeof EXCH0!=='undefined'&&EXCH0[id])){const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';id=base.slice(0,2)+A[Math.floor(h21(nm+'|'+nid+'|'+i)*26)]+A[Math.floor(h21(nm+'|t|'+i)*26)];i++;if(i>200)break;}return id;}
// historia de precios previa (5 años) con una caminata determinista (h21), como mkBackfill pero sin Math.random
function mrHist(id,p,vol,mu){const N=1260,a=new Array(N);let v=p;a[N-1]=v;const sd=vol/TD;let s=mkH(id)||1;const rn=()=>{s=(Math.imul(s,1103515245)+12345)>>>0;return (s>>>8)/16777216;};
  const gn=()=>{const u=Math.max(1e-9,rn()),w=rn();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*w);};for(let i=N-2;i>=0;i--){v/=Math.exp(mu/252+sd*gn()-sd*sd/2);a[i]=v;}
  const h=a.slice(-130),w=[],m=[];for(let i=N-1;i>=0;i-=5)w.unshift(a[i]);for(let i=N-1;i>=0;i-=21)m.unshift(a[i]);return {h,w:w.slice(-60),m:m.slice(-60)};}
function mrEnsure(){const M=G&&G.mk;if(!M||M.rp)return;M.rp=1;const C=mrCounts();
  for(const nid in C){const xs=EXN[nid];if(!xs||!xs.length||!M.X[xs[0]])continue;const S=mrShares(nid);const cnt={};let have=0;
    for(const id in M.C){const c=M.C[id];if(c.ix||!EXCH0[c.x]||EXCH0[c.x].n!==nid)continue;cnt[c.sec]=(cnt[c.sec]||0)+1;have++;}
    const need=C[nid]-have;if(need<=0)continue;const cities=mrCities(nid);const x=xs[0],cur=M.X[x].cur,fx=G.cx[cur]?G.cx[cur].fx:1;const d=N0[nid]||{};const es=(d.cult==='hisp'||nid==='BRA');
    for(let i=0;i<need;i++){let bk=null,bv=-1e9;for(const k in S){const v=S[k]*C[nid]-(cnt[k]||0);if(v>bv){bv=v;bk=k;}}if(!bk)break;cnt[bk]=(cnt[bk]||0)+1;
      const city=cities.length?cities[i%cities.length]:(G.nations[nid]?G.nations[nid].name:nid);const nm=es?`${MR_ES[bk]} ${city}`:`${city} ${MR_EN[bk]}`;const id=mrTicker(city,nid,MR_SC[bk]);const h=k=>h21(id+'|'+k);
      const cap=clamp(S[bk]*(d.gdp||1e10)*.1/Math.max(1,cnt[bk])*(.6+.8*h('c')),1.5e9,4e11);const p=Math.round((15+135*h('p'))*Math.max(1,fx/20)*100)/100;
      const pe=Math.round(clamp(15*(1+SECT[bk][1]*.07),7,35)*(.85+.3*h('e'))*10)/10;const dy=/fin|serv|tel|ener/.test(bk)?3.5+1.5*h('d'):/tec|semi/.test(bk)?.5+.8*h('d'):1.5+1.5*h('d');
      const vol=Math.sqrt(Math.pow((.8+.5*h('b'))*(EXCH0[x].vol||.2),2)+Math.pow(.15+.15*h('v'),2));const mu=((d.gdpg||2)*.8+clamp(d.infl||3,0,40)+1.5+SECT[bk][1])/100;
      M.C[id]=Object.assign({nm,x,sec:bk,p,eps:p/pe,pe0:pe,sh:cap*fx/p,dy:Math.round(dy*10)/10,b:Math.round((.8+.5*h('b'))*100)/100,v:Math.round((.15+.15*h('v'))*100)/100,d:(h('g')-.5)*.04,q:mkH(id)%63,rp:1},mrHist(id,p,vol,mu));}}
  try{MKL=null;}catch(e){}}
{const _e=ensureV14;ensureV14=function(...a){const r=_e(...a);try{if(G&&G.mk&&!G.mk.rp)mrEnsure();}catch(e){console.warn('v24c bolsa',e);}return r;};}
// representación: participación del sector en el PIB / empresas vivas del sector, normalizada para que las del país sumen el 100 %
const MRC={k:'',M:null};
function mrRep(id){const M=G.mk;const c=M&&M.C[id];if(!c||c.ix||!EXCH0[c.x]||!SECT[c.sec])return null;const nid=EXCH0[c.x].n;const key=G.year+'|'+M.mo+'|'+Object.keys(M.C).length;
  if(MRC.k!==key){MRC.k=key;const Q={};for(const j in M.C){const z=M.C[j];if(z.ix||z.dead||!EXCH0[z.x])continue;const n=EXCH0[z.x].n;const q=Q[n]||(Q[n]={c:{},N:0});q.c[z.sec]=(q.c[z.sec]||0)+1;q.N++;}
    for(const n in Q){const S=mrShares(n);let cov=0;for(const k in Q[n].c)cov+=S[k]||0;Q[n].cov=cov;}MRC.M=Q;}
  const q=MRC.M[nid];const S=mrShares(nid);if(!q||c.dead)return {nid,sec:S[c.sec]||0,rep:0,cov:q?q.cov:0,N:q?q.N:0,n:0};const n=q.c[c.sec]||1;return {nid,sec:S[c.sec]||0,rep:(S[c.sec]||0)/n/Math.max(.01,q.cov),cov:q.cov,N:q.N,n};}
// la utilidad de las representativas sigue la salud de su sector (el doble que las demás: +0.01 por mes con salud 100)
{const _sm=shMonth;shMonth=function(...a){const r=_sm(...a);try{const M=G.mk,S=G.sh;if(M&&S)for(const id in M.C){const c=M.C[id];if(!c.rp||c.dead||c.ix||!EXCH0[c.x])continue;const a2=S.h[EXCH0[c.x].n];if(a2&&SH_I[c.sec]!=null)c.eps*=Math.exp((a2[SH_I[c.sec]]-50)/50*.01);}}catch(e){console.warn('v24c bolsa mes',e);}return r;};}

/* ===================== cierre de año ===================== */
{const _au=ageUp;ageUp=function(...a){const r=_au(...a);try{if(G&&G.regions){seYear();tuYear();}}catch(e){console.warn('v24c año',e);}return r;};}
