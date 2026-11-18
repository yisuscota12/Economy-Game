/* ===================== v2.1b: fase 4 de la ruta 9d (economía conectada), parte 2 — motor =====================
   - Salud de los sectores por país (G.sh): 18 sectores (los de la Bolsa) con un índice 0–100 (50 = normal) que cada mes se mueve
     hacia un objetivo calculado con causas visibles: crecimiento, recesión, tasas, guerra, petróleo, metales, bancos, quiebras,
     tendencia del sector y la CADENA: cada sector depende de la salud de sus clientes (SH_IO) y del consumo de los hogares.
     Sin Math.random: no mueve la secuencia del juego ni las pruebas con semilla.
   - Efectos: la demanda de tus empresas (±12 %), las utilidades de las empresas de bolsa del país, la salud de los bancos.
   - Aporte de cada empresa tuya a la economía local (bzEco): valor agregado (ventas − insumos), efecto indirecto en proveedores
     y efecto inducido por los sueldos que se gastan (multiplicador), empleos directos e indirectos, impuestos y cuotas, % del PIB
     de la provincia y del país. Cada año, el cambio de tu aporte se suma al PIB de la provincia (70 %: el resto lo habría hecho
     la competencia); al quebrar o cerrar, se resta.
   - Quiebras en cadena: tu quiebra deja desempleo y menos demanda en la provincia (G.lx), pérdidas a los bancos del país y un
     golpe al sector; una empresa de bolsa que quiebra golpea a su sector y a los bancos de su país.
   - Integración vertical: si una empresa tuya produce el insumo de otra tuya en el mismo país, ese insumo sale 10 % más barato.
   - Vender tus empresas negociando (b.so): 3 compradores (competidor, fondo, inversionista) con oferta según la salud de la
     empresa; puedes pedir 10 o 20 % más con probabilidad visible y dado.
   - Empresas en venta en otros países (G.bzmx): mismo mercado que el de tu país, con 3 % de trámites de inversión extranjera.
   - Núcleo del mundo de la IA (wmwKernel): actividad económica de las 3,422 provincias según su mezcla de sectores; corre en un
     Web Worker (ui_v21b.js) y aquí tiene su versión síncrona para las pruebas y el respaldo. Solo informa (mapa y fichas). */

const SH_K=['tec','semi','ecom','fin','ener','min','cons','retail','lujo','auto','salud','tel','ind','def','inm','serv','trans','medios'].filter(k=>SECT[k]);const SH_I={};SH_K.forEach((k,i)=>SH_I[k]=i);
/* clientes de cada sector: de quién depende su demanda ('hog' = consumo de los hogares) */
const SH_IO={ind:[['auto',.25],['inm',.25],['ener',.1],['def',.1],['hog',.3]],min:[['ind',.45],['inm',.2],['semi',.1],['ener',.1],['hog',.15]],
  ener:[['trans',.3],['ind',.3],['serv',.15],['hog',.25]],trans:[['retail',.3],['ind',.25],['ecom',.15],['cons',.1],['hog',.2]],
  fin:[['inm',.3],['ind',.2],['retail',.15],['cons',.1],['hog',.25]],inm:[['fin',.35],['hog',.65]],medios:[['retail',.25],['cons',.25],['tec',.15],['hog',.35]],
  tec:[['fin',.25],['ind',.15],['retail',.15],['medios',.1],['hog',.35]],semi:[['tec',.5],['auto',.3],['def',.2]],tel:[['tec',.2],['hog',.8]],
  auto:[['hog',.7],['trans',.3]],ecom:[['hog',.85],['trans',.15]],serv:[['hog',.6],['ind',.4]],def:[['hog',1]],cons:[['hog',1]],retail:[['hog',1]],lujo:[['hog',1]],salud:[['hog',1]]};
function shRef(k){const o=G.rs&&G.rs[k];if(!o)return 1;return o.p/(o.p0*(isReal()?(G.cx.USD.cp||1):1));}
function shEnsure(){if(!G||!G.mk)return null;ensureV14();let S=G.sh;if(!S||S.v!==1)S=G.sh={v:1,h:{},x:{},pr:{}};
  for(const id in G.nations){const n=G.nations[id];if(!n.alive||S.h[id])continue;S.h[id]=SH_K.map(()=>50);S.pr[id]=cxOf(n).pr;}
  if(!S.dd){S.dd=1;for(const id in G.mk.C){const c=G.mk.C[id];if(c.dead)c._x21=1;}}   // las quiebras viejas no cuentan como nuevas
  G.lx=G.lx||{};return S;}
const shG=n=>{const d=N0[n.id]||{};const g=n.g!=null&&isFinite(n.g)?n.g:null;if(g==null)return 0;return g-(.5*clamp(d.gdpg||2.2,-2,7)+1.1+clamp(d.popg||1,-1,4));}  /* crecimiento contra el ritmo habitual del país */
function shHog(n,war){const S=G.sh;const x=S&&S.x[n.id];if(war==null)war=warsOf(n.id).length>0;return clamp(50+clamp(shG(n)*3,-18,12)-(n.rec>0?10:0)-(war?6:0)-(isReal()?Math.max(0,(n.infl||0)-8)*.6:0)+(x&&x.hog||0),5,95);}
function shOf(nid,k){const S=G&&G.sh;const a=S&&S.h[nid];return a&&SH_I[k]!=null?a[SH_I[k]]:50;}
// lo que no cambia entre sectores de un país (se calcula una vez por país y por mes)
function shCtx(n){const S=G.sh;const war=warsOf(n.id).length>0;const pr=cxOf(n).pr;return {g:shG(n),rec:n.rec>0,dpr:pr-(S.pr[n.id]!=null?S.pr[n.id]:pr),war,bk:n.bk,hog:shHog(n,war),x:S.x[n.id]||null,a:S.h[n.id]};}
function shRefs(){return {oil:Math.log(shRef('oil')),met:(Math.log(shRef('copper'))+Math.log(shRef('iron'))+Math.log(shRef('gold'))+Math.log(shRef('lith')))/4};}
/* causas del objetivo de un sector: devuelve la suma; si recibe L, anota [clave, puntos] (la interfaz pone el nombre). Solo cuentan las de ±0.5 o más */
function shTerms(c,R,k,L){const sc=SECT[k];let t=0,v;
  v=c.g*2.5;v=(v<-15?-15:v>12?12:v)*(1+sc[1]*.08);if(v>=.5||v<=-.5){t+=v;if(L)L.push(['g',v]);}
  if(c.rec){v=16*sc[4];if(v>=.5||v<=-.5){t+=v;if(L)L.push(['rec',v]);}}
  v=c.dpr*sc[2]*2;v=v<-14?-14:v>14?14:v;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['tasa',v]);}
  if(c.war){v=14*sc[3];if(v>=.5||v<=-.5){t+=v;if(L)L.push(['guerra',v]);}}
  if(k==='ener'||k==='trans'){v=k==='ener'?clamp(22*R.oil,-20,20):clamp(-12*R.oil,-12,12);if(v>=.5||v<=-.5){t+=v;if(L)L.push(['petr',v]);}}
  if(k==='min'){v=clamp(22*R.met,-20,20);if(v>=.5||v<=-.5){t+=v;if(L)L.push(['met',v]);}}
  const bk=c.bk;if(bk){v=bk.cr>0?(k==='fin'?-25:k==='inm'?-14:-6):k==='fin'?clamp((bk.h-55)*.4,-14,10):0;if(v>=.5||v<=-.5){t+=v;if(L)L.push([bk.cr>0?'crisis':'banco',v]);}}
  const io=SH_IO[k]||SH_HOG,a=c.a;let cl=0,hg=0;for(let i=0;i<io.length;i++){const e=io[i];if(e[0]==='hog')hg+=e[1]*(c.hog-50);else cl+=e[1]*((a?a[SH_I[e[0]]]:50)-50);}
  v=cl*.3;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['cli',v]);}v=hg*.3;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['hog',v]);}
  if(c.x&&c.x[k]){v=c.x[k];if(v>=.5||v<=-.5){t+=v;if(L)L.push(['qb',v]);}}
  if(sc[1]){v=sc[1]*1.2;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['tend',v]);}}return t;}
const SH_HOG=[['hog',1]];
function shParts(n,k){const L=[];shTerms(shCtx(n),shRefs(),k,L);return L;}
function shLoans(n){const c=shCtx(n);let v=0;SH_IO.fin.forEach(([k,w])=>{v+=w*((k==='hog'?c.hog:(c.a?c.a[SH_I[k]]:50))-50);});return v;}
function shTarget(n,k){return clamp(50+shTerms(shCtx(n),shRefs(),k,null),5,95);}
function shHit(nid,k,v){const S=G.sh;if(!S)return;const x=S.x[nid]||(S.x[nid]={});x[k]=clamp((x[k]||0)+v,-25,15);}
function lxAdd(rid,d,m,why){if(!G.regions[rid])return;G.lx=G.lx||{};const L=G.lx[rid];if(L){L[0]=clamp(L[0]+d,-.3,.2);L[1]=Math.max(L[1],m);L[2]=why;}else G.lx[rid]=[clamp(d,-.3,.2),m,why];}
function shMonth(){const S=shEnsure();if(!S)return;const nw={},CX={};const R=shRefs();const K=SH_K.length;
  for(const id in S.h){const n=G.nations[id];if(!n||!n.alive)continue;const a=S.h[id];const c=shCtx(n);CX[id]=c;const o=new Array(K);
    for(let i=0;i<K;i++){let t=50+shTerms(c,R,SH_K[i],null);t=t<5?5:t>95?95:t;o[i]=Math.round((a[i]+(t-a[i])*.25)*10)/10;}nw[id]=o;}
  S.h=nw;
  for(const id in S.x){const x=S.x[id];for(const k in x){x[k]*=.85;if(Math.abs(x[k])<.5)delete x[k];}if(!Object.keys(x).length)delete S.x[id];}
  const FI=SH_IO.fin;for(const id in nw){const n=G.nations[id];const b=bnkEnsure(n);if(b.cr>0)continue;const a=nw[id],hg=CX[id].hog;let v=0;for(let i=0;i<FI.length;i++)v+=FI[i][1]*((FI[i][0]==='hog'?hg:a[SH_I[FI[i][0]]])-50);b.h=clamp(b.h+v*.004,0,100);}  // = shLoans con la salud nueva   // los bancos ganan o pierden según la salud de quienes les deben (no la suya: evita el círculo)
  const M=G.mk;for(const cid in M.C){const c=M.C[cid];if(c.ix||c.sec==='fondo'||SH_I[c.sec]==null)continue;const nid=EXCH0[c.x]&&EXCH0[c.x].n;
    if(c.dead){if(!c._x21){c._x21=1;if(nid&&G.nations[nid]&&G.nations[nid].alive){shHit(nid,c.sec,-6);const b=bnkEnsure(G.nations[nid]);b.h=clamp(b.h-1.5,0,100);}}continue;}
    if(nid&&nw[nid])c.eps*=Math.exp((nw[nid][SH_I[c.sec]]-50)/50*.005);}
  for(const rid in G.lx){const L=G.lx[rid];L[1]--;L[0]*=.9;if(L[1]<=0||Math.abs(L[0])<.004)delete G.lx[rid];}}

/* ---------- tus empresas: demanda según su sector y su provincia, integración vertical ---------- */
function bzShF(b){const T=bzT(b);if(T.out||!G.sh)return 1;const x=G.regions[b.r];if(!x)return 1;let f=1+(shOf(x.o,T.sec)-50)/50*.12;const L=G.lx&&G.lx[b.r];if(L)f*=1+L[0];return clamp(f,.7,1.25);}
function bzViSrc(p,b){const T=bzT(b);if(!T.in||!T.in.length||!p||!p.bzx&&!p.biz)return [];const x=G.regions[b.r];if(!x)return [];const L=[];
  T.in.forEach(([rk,w])=>{const s=bzList(p).find(z=>z!==b&&z.v14&&bzT(z).out&&z.res===rk&&G.regions[z.r]&&G.regions[z.r].o===x.o);if(s)L.push([rk,w,s]);});return L;}
{const _bm=bzMonth;bzMonth=function(p,b){if(!b||!b.v14||!G||!G.sh)return _bm(p,b);const f=bzShF(b);const c0=b.comp,m0=b.m[b.m.length-1];b.comp=c0*f;
  try{_bm(p,b);}finally{b.comp=Math.min(1,(c0==null?1:c0)+.01);}
  try{const m=b.m[b.m.length-1];if(!m||m===m0)return;m.shf=f;const V=bzViSrc(p,b);if(V.length){const w=V.reduce((s,v)=>s+v[1],0);const T=bzT(b);const sh=w/((T.in||[]).reduce((s,v)=>s+v[1],0)+1);
      const d=m.cogs*sh*.1;if(d>0){b.cash+=d;m.vi=d;m.net+=d;}}}catch(e){console.warn('v21b mes',e);}};}

/* ---------- aporte a la economía local ---------- */
const BZ_DISP=.7;   // parte del aporte que es actividad nueva (el resto lo habría hecho la competencia)
function bzEco(b){const T=bzT(b);const L=(b.m||[]).slice(-12);const k=L.length?12/L.length:0;const s=f=>L.reduce((a,z)=>a+(z[f]||0),0)*k;const real=isReal();
  const rev=s('rev'),cogs=s('cogs'),pay=s('pay'),tax=s('tax');const roy=rev*(T.roy||0);const cuo=pay*(real?.3/1.3:.15/1.15);
  const va=Math.max(0,rev-cogs);const ind=cogs*(T.out?.35:.5)*.5,indu=pay*.35,tot=va+ind+indu;const w=Math.max(1,bzU(b.r));
  const cv=v=>fromInt(v,'USD')/(real?(G.cx.USD.cp||1):1);const x=G.regions[b.r];const n=x?G.nations[x.o]:null;const ut=cv(tot);
  return {rev,cogs,pay,va,ind,indu,tot,mult:va>0?tot/va:1,jobs:b.st,jInd:Math.round((ind+indu)*.45/w),tax,roy,cuo,taxes:tax+roy+cuo,usd:ut,
    shP:x&&x.gdp>0?ut/x.gdp:0,shN:n&&n.gdp>0?ut/n.gdp:0,months:L.length};}
function bzEcoSum(p){const A={va:0,tot:0,jobs:0,jInd:0,taxes:0,usd:0,n:0,shN:0};const home=natOf(p).id;bzList(p).filter(b=>b.v14).forEach(b=>{const E=bzEco(b);A.va+=E.va;A.tot+=E.tot;A.jobs+=E.jobs;A.jInd+=E.jInd;A.taxes+=E.taxes;A.usd+=E.usd;A.n++;
  if(G.regions[b.r]&&G.regions[b.r].o===home)A.shN+=E.shN;});return A;}
function bzGdpYear(p){bzList(p).forEach(b=>{if(!b.v14||!b.m||!b.m.length)return;const E=bzEco(b);const tgt=E.usd*BZ_DISP;const x=G.regions[b.r];if(!x)return;
  if(b.gA==null)b.gA=tgt;else{const d=clamp(tgt-b.gA,-x.gdp*.2,x.gdp*.2);x.gdp+=d;const n=G.nations[x.o];if(n)n.gdp+=d;b.gA+=d;}
  b.gh=(b.gh||[]).concat([[G.year-1,Math.round(E.usd),Math.round(E.shP*1e5)/1e3]]).slice(-10);});}
{const _au=ageUp;ageUp=function(){const run=!!(G&&P&&P.alive&&!P.event);_au();if(!run||!P||!P.alive)return;try{bzGdpYear(P);}catch(e){console.warn('v21b PIB',e);}};}

/* ---------- quiebras y cierres en cadena ---------- */
function bzChain(p,b,kind){const x=G.regions[b.r];if(!x)return null;const n=G.nations[x.o];const T=bzT(b);ensureProv(x);
  const rm=Math.min(Math.max(0,b.gA||0),x.gdp*.5);x.gdp-=rm;if(n)n.gdp-=rm;b.gA=0;
  const jobs=b.st||0,share=jobs/Math.max(1,x.pop*.45);const d=-clamp(share*(kind==='qb'?8:4),.005,.15);lxAdd(b.r,d,12,kind);x.hap=clamp(x.hap-clamp(share*300,0,6),0,100);
  const R2={jobs,d,rm,loss:0};
  if(kind==='qb'&&n){const cv=v=>fromInt(v,'USD')/(isReal()?(G.cx.USD.cp||1):1);const loss=b.debt*.6;const lp=cv(loss)/Math.max(1,n.gdp);const bk=bnkEnsure(n);const hit=clamp(lp*3000,.2,8);
    bk.h=clamp(bk.h-hit,0,100);shHit(n.id,'fin',-clamp(lp*3000,.2,6));shHit(n.id,T.sec,-clamp(cv(bzEco(b).tot)/Math.max(1,n.gdp)*2000,.3,6));R2.loss=loss;
    log(`La quiebra de ${b.n} deja sin empleo a ${jobs} personas en ${RG[b.r].nm}; los bancos de ${n.name} pierden ${fmt(loss)} en créditos que no se pagarán.`,'bad');}
  else if(kind==='cl'&&jobs>0)log(`Al cerrar ${b.n}, ${jobs} personas se quedan sin empleo en ${RG[b.r].nm} y la demanda de la provincia baja unos meses.`,'bad');
  return R2;}
{const _bk=bzBankrupt;bzBankrupt=function(p,b){_bk(p,b);try{if(p===P&&G.sh)bzChain(p,b,'qb');}catch(e){console.warn('v21b quiebra',e);}};}
{const _cl=bzClose;bzClose=function(p,b){const had=bzList(p).includes(b);const r=_cl(p,b);try{if(p===P&&had&&!bzList(p).includes(b)&&G.sh)bzChain(p,b,'cl');}catch(e){console.warn('v21b cierre',e);}return r;};}
{const _op=bzOpen;bzOpen=function(p,k,r,loan){const n0=bzList(p).length;const t=_op(p,k,r,loan);const L=bzList(p);if(L.length>n0){const b=L[L.length-1];b.gA=0;}return t;};}

/* ---------- vender tus empresas negociando ---------- */
const BZS_K={comp:[.95,.25],fondo:[.85,.18],ind:[.75,.18]};
function bzHealth(b){const L=(b.m||[]).slice(-12);if(!L.length)return 50;const rev=L.reduce((s,z)=>s+z.rev,0),net=L.reduce((s,z)=>s+z.net,0);const mg=rev>0?net/rev:0;
  const h1=L.slice(-6).reduce((s,z)=>s+z.rev,0),h0=L.slice(0,L.length-6).reduce((s,z)=>s+z.rev,0);const gr=L.length>=10&&h0>0?h1/h0*(L.length-6)/6-1:0;
  return Math.round(clamp(50+mg*150+(b.rep-50)*.5+gr*60-b.debt/Math.max(1,rev)*15,5,95));}
function bzsEnsure(p,b){if(b.so&&bzmNow()-b.so.t<3&&b.so.L.length)return b.so;const v=Math.max(bzValue(b),bzU(b.r)*.2),h=bzHealth(b);const c=cultOf(G.regions[b.r].o);const T=bzT(b);const L=[];
  ['comp','fondo','ind'].forEach(k=>{if(k==='fondo'&&!((b.last||0)>0))return;const [a,s]=BZS_K[k];const px=v*(a+s*h/100)*R(.95,1.05);
    const n=k==='comp'?`${T.n} ${rndSur(c)}`:k==='fondo'?`Fondo ${rndSur(c)} Capital`:`${rndFirst(chance(.35)?'F':'M',c)} ${rndSur(c)}`;L.push({k,n,px,neg:0});});
  b.so={t:bzmNow(),h,L};return b.so;}
const BZS_M=[1,1.1,1.2];
function bzsChance(o,j,h){return j===0?100:j===1?clamp(Math.round(40+h*.35-20*o.neg),5,90):clamp(Math.round(15+h*.3-20*o.neg),3,75);}
function bzsDo(p,b,i,j){if(p.biz===b&&b.pub)return {t:'Tu empresa cotiza en bolsa: vende tus acciones desde 📈 Bolsa.'};const S=b.so;const o=S&&S.L[i];if(!o)return {t:''};
  const pc=bzsChance(o,j,S.h);let roll=null;if(j>0){roll=RI(1,100);if(roll>pc){o.neg++;if(o.neg>=2){S.L.splice(i,1);return {t:`${o.n} se retira: no acepta pagar más por ${b.n}.`,roll,pc,ok:false};}
      o.px*=.97;return {t:`${o.n} rechaza pagar más y baja su oferta a ${fmt(o.px)}. Puedes aceptarla o intentarlo una vez más.`,roll,pc,ok:false};}}
  const price=o.px*BZS_M[j];p.dinero+=price;if(p.biz===b)p.biz=null;else p.bzx=(p.bzx||[]).filter(z=>z!==b);delete b.g;b.so=null;
  return {t:`Vendes ${b.n} a ${o.n} por ${fmt(price)}${j?` (${Math.round((BZS_M[j]-1)*100)} % más que su oferta)`:''}. La empresa sigue operando con su nuevo dueño.`,roll,pc,ok:true,price};}

/* ---------- empresas en venta en otros países ---------- */
const IED_FEE=.03;
function bzmErrN(p,nid){if(nid===natOf(p).id)return null;const n=G.nations[nid];if(!n||!n.alive)return 'Ese país ya no existe.';if(warBetween(nid,natOf(p).id))return 'No puedes invertir en un país con el que estás en guerra.';
  if(natOf(p).cc)return 'Tu país tiene controles de capital.';return null;}
function bzmMk(p,nid){const home=natOf(p).id;if(!nid||nid===home)return bzmEnsure(p);G.bzmx=G.bzmx||{};let M=G.bzmx[nid];
  if(!M||bzmNow()-M.t>=6||!M.L.length){const keep=G.bzm;try{bzmGen(Object.assign({},p,{r:capitalOf(nid)}));M=G.bzm;}finally{G.bzm=keep;}G.bzmx[nid]=M;const ks=Object.keys(G.bzmx);if(ks.length>3){ks.sort((a,b)=>G.bzmx[a].t-G.bzmx[b].t);ks.filter(k=>k!==nid).slice(0,ks.length-3).forEach(k=>delete G.bzmx[k]);}}return M;}   /* guarda a lo más 3 mercados extranjeros (cada uno pesa ~10–20 KB) */
function bzmFind(id){if(G.bzm&&G.bzm.L.some(o=>o.id===id))return null;for(const nid in G.bzmx||{}){const M=G.bzmx[nid];if(M.L.some(o=>o.id===id))return [nid,M];}return null;}
function bzmCountries(p){const home=natOf(p).id;const own=new Set(bzList(p).map(b=>G.regions[b.r]&&G.regions[b.r].o).filter(Boolean));
  const top=Object.values(G.nations).filter(n=>n.alive&&n.id!==home).sort((a,b)=>b.gdp-a.gdp).slice(0,9).map(n=>n.id);const nb=(neighborsOf(home)||[]).filter(id=>G.nations[id]&&G.nations[id].alive).slice(0,3);
  return [home,...new Set([...own].filter(x=>x!==home).concat(nb,top))];}
{const _of=bzmOffer;bzmOffer=function(p,id,i,loan){const F=bzmFind(id);if(!F){const r=_of(p,id,i,loan);if(r&&r.ok)try{const L=bzList(p);const b=L[L.length-1];b.gA=bzEco(b).usd*BZ_DISP;}catch(e){}return r;}
  const [nid,M]=F;const err=bzmErrN(p,nid);if(err)return {t:err};const o=M.L.find(x=>x.id===id);const P2=bzmPrice(o,i,loan);const fee=P2.pr*IED_FEE;if(p.dinero<P2.cash+fee)return {t:`Te faltan ${fmt(P2.cash+fee-p.dinero)}.`};
  const keep=G.bzm;G.bzm=M;let r;try{r=_of(p,id,i,loan);}finally{G.bzm=keep;}
  if(r&&r.ok){p.dinero-=fee;r.t+=` Trámites de inversión extranjera: ${fmt(fee)}.`;try{const L=bzList(p);const b=L[L.length-1];b.gA=bzEco(b).usd*BZ_DISP;b.ied=1;}catch(e){}}return r;};}
{const _au2=bzmAudit;bzmAudit=function(p,id){const F=bzmFind(id);if(!F)return _au2(p,id);const keep=G.bzm;G.bzm=F[1];try{return _au2(p,id);}finally{G.bzm=keep;}};}

/* ---------- núcleo del mundo de la IA: actividad económica por provincia (también corre en el Web Worker) ---------- */
// rasgos de cada provincia para su mezcla de sectores (hilo principal, una vez por sesión): población, PIB, área, capital y peso de sus recursos
const WMW_SK=['tec','semi','ecom','fin','ener','min','cons','retail','lujo','auto','salud','tel','ind','def','inm','serv','trans','medios'];  // mismo orden que SH_K
function wmwFeat(){const K=Object.keys(RG),N=K.length;const F=new Float32Array(N*7);const cat={oil:4,gas:4,coal:4,uran:4,iron:5,copper:5,lith:5,ree:5,gold:5,wheat:6,corn:6,soy:6,rice:6,coffee:6};
  for(let r=0;r<N;r++){const id=K[r],x=G.regions[id],rd=RG[id];const o=r*7;F[o]=Math.max(1,x?x.pop:rd.pop);F[o+1]=Math.max(1e6,x?x.gdp:1e6);F[o+2]=Math.max(1,rd.area||1);F[o+3]=rd.cap?1:0;
    const d=DEP[id];if(d)for(const k in d){const c=cat[k];if(c)F[o+c]+=d[k]*(RES0[k]?RES0[k][3]:0);}}
  return {F,N,K};}
// núcleo puro (sin G ni DOM; también corre dentro del Web Worker): rasgos → mezcla de sectores N×S
function wmwComp(F,N,S,SK){const C=new Float32Array(N*S);const cl=(v,a,b)=>v<a?a:v>b?b:v;const w={};
  for(let r=0;r<N;r++){const o=r*7,pop=F[o],gdp=F[o+1];const rich=cl(Math.log10(gdp/pop/2000)/1.7,0,1),dens=cl(Math.log10(pop/F[o+2]+1)/3.5,0,1),cap=F[o+3];
    const e=Math.min(.6,F[o+4]/gdp),m=Math.min(.6,F[o+5]/gdp),a=Math.min(.6,F[o+6]/gdp);
    w.tec=.01+.05*rich+.02*cap;w.semi=.003+.015*rich;w.ecom=.01+.02*rich;w.fin=.03+.04*rich+.04*cap;w.ener=.01+.6*e;w.min=.005+.6*m;w.cons=.12+.6*a-.03*rich;w.retail=.13;w.lujo=.004+.02*rich+.01*cap;
    w.auto=.02+.03*dens*rich;w.salud=.05+.03*rich;w.tel=.03;w.ind=.06+.08*dens;w.def=.008;w.inm=.07;w.serv=.08+.03*(1-rich);w.trans=.05;w.medios=.015+.02*rich+.01*cap;
    let t=0;for(let s=0;s<S;s++)t+=w[SK[s]];for(let s=0;s<S;s++)C[r*S+s]=w[SK[s]]/t;}
  return C;}
// núcleo puro: mezcla N×S, own N (índice del país, −1 = nadie), h países×S, lx (pares índice, choque) → act N (0–100), top N (sector principal)
function wmwKernel(C,own,h,lx,N,S){const act=new Float32Array(N),top=new Uint8Array(N);
  for(let r=0;r<N;r++){const o=own[r];let a=0,bv=-1,bi=0;const b=r*S;for(let s=0;s<S;s++){const c=C[b+s];if(c>bv){bv=c;bi=s;}a+=c*(o>=0?h[o*S+s]:50);}act[r]=a;top[r]=bi;}
  for(let i=0;i<lx.length;i+=2){const r=lx[i];act[r]+=lx[i+1]*100;}for(let r=0;r<N;r++)act[r]=act[r]<0?0:act[r]>100?100:act[r];
  return {act,top};}
// entradas del núcleo (baratas: el dueño de cada provincia solo se recalcula si cambió el mapa)
const WMWI={ov:-1,nl:'',own:null,ix:null,K:null,RI:null};
function wmwInputs(){const S=SH_K.length;if(!WMWI.K){WMWI.K=Object.keys(RG);WMWI.RI={};WMWI.K.forEach((k,i)=>WMWI.RI[k]=i);}const K=WMWI.K,N=K.length;const NL=Object.keys(G.sh.h);const nl=NL.join();
  if(WMWI.ov!==(G._ov||0)||WMWI.nl!==nl||WMWI.g!==G){const ix={};NL.forEach((id,i)=>ix[id]=i);const own=new Int16Array(N);for(let r=0;r<N;r++){const x=G.regions[K[r]];own[r]=x&&ix[x.o]!=null?ix[x.o]:-1;}
    WMWI.own=own;WMWI.ov=G._ov||0;WMWI.nl=nl;WMWI.g=G;}
  const h=new Float32Array(NL.length*S);NL.forEach((id,i)=>{const a=G.sh.h[id];for(let s=0;s<S;s++)h[i*S+s]=a[s];});
  const L=[];for(const rid in G.lx||{}){const i=WMWI.RI[rid];if(i!=null)L.push(i,G.lx[rid][0]);}
  return {own:WMWI.own.slice(),h,lx:new Float32Array(L),N,S,K};}

{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(G&&G.mk)shMonth();}catch(e){console.warn('v21b sectores',e);}};}
