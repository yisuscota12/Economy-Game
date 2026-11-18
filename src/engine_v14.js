/* ===== v1.4: recursos estratégicos, empresas con operación y estado de resultados, fondos, bonos y materias primas ===== */
SECT.fondo=['Fondo indexado',0,0,0,0];
// los tipos nuevos se agregan a BIZT para que los textos viejos (eventos, panel de provincia) los nombren bien
BZ.forEach(b=>{if(!BZ_OLD.includes(b.k))BIZT.push({n:b.n,ic:b.ic,k:b.k});else BIZT[BZ_OLD.indexOf(b.k)].k=b.k;});
const bzT=b=>BZ[BZK[b.k]]||BZ[0];
const bzTi=k=>BIZT.findIndex(x=>x.k===k);

/* ===================== YACIMIENTOS (por provincia, según el terreno; se calculan al cargar) ===================== */
const DEP={};const RESP={};// DEP[provincia][recurso] = unidades al año · RESP[país][recurso] = producción base
(function(){const byN={};for(const r in RG)(byN[RG[r].n]=byN[RG[r].n]||[]).push(r);
  const fit={oil:t=>[1,.5,.15][t[0]]*(t[1]==='d'?1.6:t[1]==='s'?.8:1),coal:t=>[1,1.2,.6][t[0]]*(t[1]==='d'?.5:1),min:t=>[.35,1,1.5][t[0]]*(t[1]==='d'?1.3:t[1]==='s'?.8:1),
    lith:t=>(t[1]==='d'?2:1)*[.6,1,1.4][t[0]],grain:t=>[1.4,.8,.2][t[0]]*(t[1]==='d'?.15:t[1]==='f'?.05:t[1]==='s'?.6:1)*(t[2]?1.3:1),
    rice:t=>(Math.abs(t[3])<40?1:.1)*[1.4,.7,.2][t[0]]*(t[1]==='s'?1.3:t[1]==='d'?.1:1)*(t[2]?1.5:1),coffee:t=>(Math.abs(t[3])<25?1:.05)*[.4,1.3,1.5][t[0]]*(t[1]==='d'?.05:1)};
  for(const k in RES0){const R=RES0[k];const f=fit[R[6]];R[9].split(',').forEach(s=>{const [nid,v]=s.split(':');const rs=byN[nid];if(!rs)return;const tot=+v*R[7];(RESP[nid]=RESP[nid]||{})[k]=tot;
    const sc=rs.map(r=>[r,f(TRN(r))*Math.pow(RG[r].area||1,.4)*(.6+.8*mkU(mkH(r),mkH(k)))]).sort((a,b)=>b[1]-a[1]);
    const kk=Math.max(1,Math.min(rs.length,R[5]==='agr'?Math.ceil(rs.length/2.5):Math.ceil(rs.length/4),R[5]==='agr'?12:6));const top=sc.slice(0,kk);const S=top.reduce((a,b)=>a+b[1],0)||1;
    top.forEach(([r,w])=>{(DEP[r]=DEP[r]||{})[k]=tot*w/S;});});}})();
const resVal=k=>G.rs?G.rs[k].p:RES0[k][3];
function resNat(){if(RESN.g===G&&RESN.m===(G.mk?G.mk.mo:0))return RESN.d;const d={},S={};const occ=G.occ||{};
  for(const r in DEP){const x=G.regions[r];if(!x)continue;const n=G.nations[x.o];if(!n||!n.alive)continue;const war=warsOf(n.id).length?.9:1;const o=occ[r]?0:war;
    for(const k in DEP[r]){const u=DEP[r][k]*o;(d[n.id]=d[n.id]||{})[k]=(d[n.id][k]||0)+u;}}
  for(const nid in d){const n=G.nations[nid];for(const k in d[nid]){const ban=n.ban&&n.ban[k];S[k]=(S[k]||0)+d[nid][k]*(ban?.3:1);}}
  RESN.g=G;RESN.m=G.mk?G.mk.mo:0;RESN.d=d;RESN.S=S;return d;}
const RESN={};
const resWorld=k=>{resNat();return RESN.S[k]||1;};
const RESW0={};for(const k in RES0){let s=0;for(const n in RESP)s+=RESP[n][k]||0;RESW0[k]=s||1;}
// valor de la producción de un país (US$ de hoy) y su peso en el PIB
function resValue(nid,k){const d=resNat()[nid];return d&&d[k]?d[k]*resVal(k):0;}
function resShareGDP(n){let v=0;for(const k in RES0)v+=resValue(n.id,k);return v/Math.max(1,n.gdp*(isReal()?1:1));}

/* ===================== PRECIOS DE MATERIAS PRIMAS (cada mes) ===================== */
function ensureV14(){if(!G)return;ensureV13();if(!G.rs){G.rs={};for(const k in RES0){const R=RES0[k];const o={p:R[3],p0:R[3],py:R[3],h:[]};let v=R[3];const a=[v];
      for(let i=0;i<60;i++){v/=Math.exp(R[4]/Math.sqrt(12)*gz()*.8);v=v*.92+R[3]*.08;a.unshift(v);}o.h=a;G.rs[k]=o;}}
  const M=G.mk;ETF0.forEach(([id,ix,k,dy,nm])=>{if(M.C[id])return;const [x,si]=ix.split(':');const s=si!=null?M.X[x].sub[+si]:M.X[x];const f=v=>v*k;
    M.C[id]={nm,x,sec:'fondo',ix,k,p:s.lv*k,eps:s.lv*k/18,pe0:18,sh:1e9,dy,b:1,v:0,d:0,q:mkH(id)%63,h:s.h.map(f),w:s.w.map(f),m:s.m.map(f)};});
  if(P){bzMigrate(P);bkEnsure(P);const b=P.bk;b.cm=b.cm||{};b.bd=b.bd||[];}}
const ETF0=[['FSP5','US',.1,1.3,'Fondo indexado S&P 500'],['FNDQ','US:0',.02,.7,'Fondo indexado Nasdaq-100'],['FIPC','MX',.001,3,'Fondo indexado IPC México'],['FBOV','BR',.001,6,'Fondo indexado Ibovespa'],
  ['FFTS','UK',.01,3.5,'Fondo indexado FTSE 100'],['FDAX','DE',.01,2.8,'Fondo indexado DAX'],['FNIK','JP',.01,2,'Fondo indexado Nikkei 225'],['FSSE','CN',.01,2.5,'Fondo indexado Shanghái'],['FNIF','IN',.01,1.2,'Fondo indexado Nifty 50'],['FKOS','KR',1,2,'Fondo indexado KOSPI']];
const RES_LINK={MGER:'iron',SCMN:'iron',MPAC:'copper',LAND:'lith',LGLD:'gold',HVGL:'gold'};
function rsMonth(){const real=isReal();const us=G.cx.USD;resNat();const war=G.wars.length;
  const wg=(()=>{const N=Object.values(G.nations).filter(n=>n.alive);const w=N.reduce((s,n)=>s+n.gdp,0)||1;return N.reduce((s,n)=>s+(n.g||0)*n.gdp,0)/w;})();
  for(const k in G.rs){const R=RES0[k],o=G.rs[k];const S=RESN.S[k]||RESW0[k];const sup=clamp(RESW0[k]/S,.5,3);
    let tgt=o.p0*(real?us.cp:1)*Math.pow(sup,R[5]==='ene'?4:R[5]==='pre'?1:2.5);if(R[5]!=='agr'&&R[5]!=='pre'&&wg<1)tgt*=.88;if(k==='gold')tgt*=1+(G.mk.cr?.15:0)+Math.min(.3,war*.01);
    if(R[5]==='agr'&&wg>3)tgt*=1.03;const p0=o.p;
    o.p=Math.exp(Math.log(o.p)+.14*(Math.log(tgt)-Math.log(o.p))+R[4]/Math.sqrt(12)*gzt());o.h.push(o.p);if(o.h.length>180)o.h.shift();
    const ch=o.p/p0-1;o.lc=ch;const big=Math.abs(Math.log(1+ch))>2.3*R[4]/Math.sqrt(12);
    if(big&&((ch>0&&sup>1.08)||Math.abs(ch)>.25||(k==='gold'&&war>8&&ch>0))){const why=ch>0&&sup>1.08?`la caída de la oferta (${rsSupplyWhy(k)})`:ch>0&&k==='gold'&&(G.mk.cr||war>8)?'la búsqueda de refugio ante la incertidumbre':ch<0&&wg<1&&R[5]!=='agr'?'el freno de la economía mundial':ch<0&&sup>1.08?'la toma de ganancias tras el alza':'la especulación en los mercados';
      mkNews((ch>0?`${R[0]} sube ${Math.abs(Math.round(ch*100))} % en el mes por ${why}: ${rsFmt(k,o.p)}.`:`${R[0]} cae ${Math.abs(Math.round(ch*100))} % en el mes por ${why}: ${rsFmt(k,o.p)}.`),Math.abs(ch)>.22);}
    // empresas ligadas a la materia prima
    for(const id in G.mk.C){const c=G.mk.C[id];if(c.dead||c.ix)continue;const lk=RES_LINK[id]||(c.sec==='ener'?'oil':null);let e=lk===k?(c.sec==='ener'?.7:.9):0;
      if(k==='oil'&&c.sec==='trans')e=-.25;if(k==='oil'&&id==='GNGA')e=.35;if(e){const f=Math.exp(e*Math.log(1+ch));c.eps*=f;c.p*=Math.pow(f,.6);}}}
  // la IA prohíbe exportar alimentos cuando su precio se dispara (como India con el arroz en 2023) y lo levanta cuando baja
  for(const k of ['wheat','rice','corn']){const o=G.rs[k];const hi=o.p>o.p0*(real?us.cp:1)*1.35;
    for(const nid in RESN.d){const n=G.nations[nid];if(playerRules(nid)||!RESN.d[nid][k])continue;const sh=RESN.d[nid][k]/(RESN.S[k]||1);if(sh<.04)continue;n.ban=n.ban||{};
      if(hi&&!n.ban[k]&&n.stab<60&&chance(.08)){n.ban[k]=1;mkNews(`${n.name} prohíbe exportar ${R0n(k)} para contener sus precios internos: produce el ${Math.round(sh*100)} % del mundo.`,true);}
      else if(!hi&&n.ban[k]&&chance(.15)){delete n.ban[k];mkNews(`${n.name} levanta la prohibición de exportar ${R0n(k)}.`,false);}}}}
const R0n=k=>RES0[k][0].toLowerCase();
function rsSupplyWhy(k){const d=resNat();const L=[];for(const nid in RESP){const base=RESP[nid][k];if(!base)continue;const now=(d[nid]&&d[nid][k])||0;const n=G.nations[nid];const lost=base-now*(n&&n.ban&&n.ban[k]?.3:1);
  if(lost/RESW0[k]>.01)L.push([n?n.name:nid,lost/RESW0[k],n&&warsOf(nid).length?'guerra':n&&n.ban&&n.ban[k]?'prohibición de exportar':'pérdida de territorio']);}
  L.sort((a,b)=>b[1]-a[1]);return L.slice(0,2).map(x=>`${x[2]} en ${x[0]}, ${Math.round(x[1]*100)} % del mundo`).join('; ')||'interrupciones de producción';}
function resPl(k){const u=RES0[k][2];return u.replace(/^(\S+)/,w=>w==='barril'?'barriles':w==='millón'?'millones':w+'s');}
function resQty(k,u){const a=Math.abs(u);const t=a>=1e9?(u/1e9).toLocaleString('es-MX',{maximumFractionDigits:1})+' mil M':a>=1e6?(u/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M':a>=1e4?Math.round(u/1e3).toLocaleString('es-MX')+' mil':Math.round(u).toLocaleString('es-MX');return t+' '+resPl(k);}
function rsFmt(k,v){const R=RES0[k];return `US$${v.toLocaleString('es-MX',{maximumFractionDigits:v<100?2:0})} por ${R[2]}`;}
/* ----- efectos en la economía al cerrar el año ----- */
{const _eb=ecoBonus;ecoBonus=function(n){let b=_eb(n);if(!G||!G.rs)return b;let e=0;for(const k in RES0){const v=resValue(n.id,k);if(!v)continue;const o=G.rs[k];e+=v/Math.max(1,n.gdp)*Math.log(o.p/o.py)*100*.35;}
  if(n.nz)e-=.3;if(n.ban)for(const k in n.ban)e-=resValue(n.id,k)/Math.max(1,n.gdp)*100*.5;return b+clamp(e,-6,6);};}
{const _sw=simWorld;simWorld=function(){ensureV14();const real=isReal();_sw();if(!G.rs)return;const oil=G.rs.oil,fd=['wheat','corn','rice'].reduce((s,k)=>s+Math.log(G.rs[k].p/G.rs[k].py),0)/3;
  const dOil=Math.log(oil.p/oil.py)*100,dFd=fd*100;
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;if(real){const e=.03*dOil+.02*dFd+(n.ban&&(n.ban.wheat||n.ban.rice||n.ban.corn)?-.5:0);const i0=n.infl;n.infl=clamp(n.infl+e,-3,5000);n.price*=(1+n.infl/100)/(1+i0/100);}
    if(playerRules(id)){let roy=0;for(const k in RES0)roy+=resValue(id,k)*(n.nz?.35:.1);n.treas=(n.treas||0)+roy*(isReal()?1:.6);n._roy=roy;}}
  for(const k in G.rs)G.rs[k].py=G.rs[k].p;};}

/* ===================== EMPRESAS DEL JUGADOR ===================== */
const MAXBZ=5;
function bzList(p){const L=[];if(p.biz)L.push(p.biz);(p.bzx||[]).forEach(b=>L.push(b));return L;}
// salario medio local (ocupación) de la provincia, en la unidad del dinero del jugador
function bzWage(r,oc){const x=G.regions[r];const nd=N0[x.w0]||N0[RG[r].n];const n=G.nations[x.o];const w=(nd.w[oc]||nd.w.T)*prosp(x)*(isReal()?n.price:1);return P&&G.cx?w*intConv(n,homeN()):w;}
const bzU=r=>bzWage(r,'T');
// ventas anuales de una sucursal (en salarios medios locales) a partir del personal y del peso de la nómina
function bzRv(T,r){const x=G.regions[r];const nd=N0[x.w0]||N0[RG[r].n];const wm=(nd.w[T.oc]||nd.w.T)/nd.w.T;return T.st*wm*1.3/T.L;}
function bzMigrate(p){bzList(p).forEach(b=>{if(!b.r||!G.regions[b.r])b.r=p.r;if(b.v14)return;const k=b.k||BZ_OLD[b.t]||'comida';const T=BZ[BZK[k]];const br=[1,2,4,8][b.lvl||0]||1;const U0=bzU(b.r),rv=bzRv(T,b.r)*U0;
  Object.assign(b,{v14:1,k,t:bzTi(k),n:b.n||`${T.n} ${p.surname}`,br,st:T.st*br,pr:0,q:0,wg:0,mk:2,py:60,rep:50+((b.luck||1)-1)*40,cash:rv*.08*br,debt:0,assets:T.K*rv*br*.7,lc:0,comp:1,m:[],ya:[],_lv:b.lvl||0,luck:1});});}
function bzDep(r,cat){const d=DEP[r];if(!d)return null;let best=null,bv=0;for(const k in d){if(RES0[k][5]!==cat&&!(cat==='met'&&(RES0[k][5]==='pre'||k==='coal'||k==='uran'))&&!(cat==='ene'&&(k==='oil'||k==='gas')))continue;
  if(cat==='ene'&&k!=='oil'&&k!=='gas')continue;const v=d[k]*resVal(k);if(v>bv){bv=v;best=k;}}return best;}
function bzCanOpen(p,k,r){const T=BZ[BZK[k]];if(p.age<(k==='comida'?16:18))return 'Necesitas 18 años (16 para un puesto de comida).';if(p.prison)return 'Desde prisión no puedes abrir negocios.';
  if(bzList(p).length>=MAXBZ)return `Ya tienes ${MAXBZ} empresas: vende o cierra una primero.`;if(T.ed&&!(p.edu&&(p.edu.degree||(p.edu.degrees||[]).length)))return 'Requiere estudios universitarios.';
  if(T.out==='met'&&!bzDep(r,'met'))return 'En esta provincia no hay yacimientos minerales. Busca una con ⛏️ en el mapa de recursos.';
  if(T.out==='ene'&&!bzDep(r,'ene'))return 'En esta provincia no hay petróleo ni gas.';if(warBetween(G.regions[r].o,natOf(p).id))return 'No puedes invertir en un país con el que estás en guerra.';return null;}
function bzOpenCost(k,r){const T=BZ[BZK[k]];const rv=bzRv(T,r)*bzU(r);return {cap:T.K*rv,wc:rv*((1-T.gm)*1.5+T.L*2+T.rs)/12};}
function bzOpen(p,k,r,loan){const err=bzCanOpen(p,k,r);if(err)return err;const T=BZ[BZK[k]];const {cap,wc}=bzOpenCost(k,r);const tot=cap+wc;const debt=loan?tot*.5:0;if(p.dinero<tot-debt)return `Te faltan ${fmt(tot-debt-p.dinero)}.`;
  p.dinero-=tot-debt;const res=T.out==='agr'?bzDep(r,'agr')||'corn':T.out?bzDep(r,T.out):null;
  const b={v14:1,k,t:bzTi(k),n:`${T.n} ${p.surname}`,r,br:1,st:T.st,pr:0,q:0,wg:0,mk:2,py:50,rep:45,cash:wc,debt,assets:cap,lc:0,comp:1,m:[],ya:[],lvl:0,_lv:0,luck:1,y:G.year,last:0,res,dq:res&&DEP[r]&&DEP[r][res]?clamp(.9+Math.log10(1+DEP[r][res]*resVal(res)/1e8)*.12,.9,1.25):res?.8:1};
  if(!p.biz)p.biz=b;else (p.bzx=p.bzx||[]).push(b);return (debt?`Abres ${T.n.toLowerCase()} en ${RG[r].nm}: inviertes ${fmt(cap)} en local y equipo y ${fmt(wc)} de capital de trabajo (crédito bancario de ${fmt(debt)}).`:`Abres ${T.n.toLowerCase()} en ${RG[r].nm}: inviertes ${fmt(cap)} en local y equipo y ${fmt(wc)} de capital de trabajo.`);}
const PM=[.85,1,1.15],QC=[.85,1,1.22],WGM=[.85,1,1.2];
function bzMonth(p,b){const T=bzT(b);const x=G.regions[b.r];if(!x)return;const no=G.nations[x.o];const real=isReal();const mo=G.mk?((G.mk.doy?monthOfDay(Math.min(364,G.mk.doy-1)):11)):0;
  // eventos de la vida viejos cambian la "suerte": se convierte en reputación; los que suben de nivel regalan una sucursal
  if(b.luck!==1){b.rep=clamp(b.rep+(b.luck-1)*40,0,100);b.luck=1;}if((b.lvl||0)>(b._lv||0)){b.br=Math.min(T.mx,b.br+1);b.st+=T.st;}
  const Uw=bzU(b.r);const rvB=bzRv(T,b.r)*Uw;const base=b.br*rvB/12;const stNeed=T.st*b.br,sr=b.st/Math.max(1,stNeed);const capF=Math.pow(Math.min(1.15,sr),.8);
  let D=1;const g=no.g||2,rec=no.rec>0;D*=1+.02*(g-2);if(rec)D*=T.rc===1?1.02:T.rc===-1?.85:.93;
  if(T.d==='pop')D*=clamp(Math.pow(x.pop/1e6,.06),.85,1.15);if(T.d==='tour')D*=(typeof tourF==='function'?tourF(no):1)*(warsOf(no.id).length?.6:1)*Math.pow(clamp(no.stab,10,100)/60,.3)*clamp(Math.pow(x.pop/1e6,.1),.8,1.3);
  if(T.d==='b2b')D*=1+.04*(g-2);if(T.d==='tech'){ensureEco(no);D*=1+.05*(no.tech.c||0);}if(T.d==='nat')D*=clamp(Math.pow(no.pop/5e7,.1),.7,1.4);
  if(T.rate)D*=clamp(1-.02*(cxOf(no).pr-5),.6,1.25);
  D*=1-1.3*(PM[b.pr+1]-1);D*=[.92,1,1.08][b.q+1];D*=.86+.3*Math.log(1+b.mk)/Math.log(11);D*=.65+.7*b.rep/100;D*=b.comp;b.comp=Math.min(1,b.comp+.01);
  D*=1/(1+.03*(b.br-1));if(mo===11&&/retail|cons|lujo/.test(T.sec))D*=1.2;if(T.d==='tour'&&mo>=5&&mo<=7)D*=1.15;D*=Math.exp(.06*gq());if(T.hit)D*=b.hit||1;
  let sold,rev,cogs;const cap=base*capF*1.1;
  if(T.out){const rk=b.res||'corn';const o=G.rs[rk];const pf=o.p/(o.p0*(real?G.cx.USD.cp:1));sold=base*capF*(b.dq||1)*Math.exp(.04*gq())*(warsOf(no.id).length?.85:1)*(G.occ&&G.occ[b.r]?0:1);rev=sold*pf;D=1;}
  else{sold=Math.min(base*D,cap);rev=sold*PM[b.pr+1];}
  let inF=1;(T.in||[]).forEach(([rk,w])=>{const o=G.rs[rk];inF+=w*(o.p/(o.p0*(real?G.cx.USD.cp:1))-1);});
  cogs=sold*(1-T.gm)*QC[b.q+1]*inF;const pay=b.st*bzWage(b.r,T.oc)/12*WGM[b.wg+1]*(real?1.3:1.15);const rent=b.br*T.rs*rvB/12+rev*(T.roy||0);const mkt=rev*b.mk/100;
  const dep=T.fin?0:T.re?b.assets*.02/12:b.assets/120;if(T.re)b.assets*=1+(real?no.infl:0)/1200+((x.gl||.02))/12;else if(!T.fin)b.assets-=dep;
  if(T.fin&&rec)cogs+=b.assets*.03/12;
  const int=b.debt*(Math.max(1,no.rate)+2)/1200;const ebt=rev-cogs-pay-rent-mkt-dep-int;let tax=0;
  if(real){if(ebt<0)b.lc+=-ebt;else{const tx=Math.max(0,ebt-b.lc);b.lc=Math.max(0,b.lc-ebt);tax=tx*(CIT[x.o]!=null?CIT[x.o]:25)/100;}}
  const net=ebt-tax;b.cash+=net+(T.re?0:dep);let paid=0;
  if(net>0&&b.py){const d=Math.min(b.cash,net*b.py/100);b.cash-=d;const own=(p.biz===b&&b.pub)?(b.own||0):1;paid=d*own;p.dinero+=paid;}
  if(b.cash<0){b.debt+=-b.cash;b.cash=0;}
  const costs=cogs+pay+rent+mkt;if(b.debt>0&&b.cash>costs*3){const r2=Math.min(b.debt,b.cash-costs*2);b.debt-=r2;b.cash-=r2;}
  const util=cap>0?Math.min(base*D,cap)/cap:0;
  if(T.fin)b.assets=Math.max(b.assets,b.br*T.K*rvB*.5);
  const tgt=50+15*b.q+8*b.wg+(b.pr===-1?6:b.pr===1?-6:0)+(sr>1.1?5:sr<.85?-12:0)+(util>.98&&!T.out?-6:0);b.rep=clamp(b.rep+(tgt-b.rep)*.08+gq()*1.5,0,100);
  b.m.push({y:G.year,mo,rev,cogs,pay,rent,mkt,dep,int,tax,net,paid,util,dem:base*D/Math.max(1,cap)});if(b.m.length>24)b.m.shift();
  const L12=b.m.slice(-12);const ar=L12.reduce((s,z)=>s+z.rev,0)*12/L12.length;const U1=bzU(b.r);b.lvl=ar<3*U1?0:ar<10*U1?1:ar<40*U1?2:3;b._lv=b.lvl;b.last=L12.reduce((s,z)=>s+z.net,0)*12/L12.length;
  if(b.debt>Math.max(b.assets*1.3,ar*2)&&b.debt>U1){bzBankrupt(p,b);}}
function bzBankrupt(p,b){const T=bzT(b);log(`💥 ${b.n} quiebra: las deudas (${fmt(b.debt)}) superan lo que vale. Cierras ${T.n.toLowerCase()} y pierdes lo invertido.`,'bad');p.s.felicidad-=8;
  if(p.biz===b){const pub=b.pub;p.biz=null;if(pub)ipoGuard(p,true);}else p.bzx=(p.bzx||[]).filter(z=>z!==b);if(isReal())p.late=(p.late||0)+1;}
function bzValue(b){const T=bzT(b);const pe=T.out?5:/tec|ecom|medios/.test(T.sec)?9:6;return Math.max(0,b.cash-b.debt+b.assets*(T.re?1:.6)+Math.max(0,b.last||0)*pe);}
function bzYear(p){bzList(p).forEach(b=>{if(!b.v14)return;const L=b.m.slice(-12);const s=k=>L.reduce((a,z)=>a+(z[k]||0),0);
  b.ya.push({y:G.year-1,rev:s('rev'),cogs:s('cogs'),pay:s('pay'),rent:s('rent'),mkt:s('mkt'),dep:s('dep'),int:s('int'),tax:s('tax'),net:s('net'),paid:s('paid'),br:b.br,st:b.st,rep:Math.round(b.rep)});if(b.ya.length>15)b.ya.shift();
  if(bzT(b).hit)b.hit=Math.exp(gz()*.6);});}
/* ----- decisiones (las llama la interfaz) ----- */
function bzSet(b,f,v){b[f]=v;return '';}
function bzBranch(p,b,d){const T=bzT(b);const U0=bzU(b.r);if(d>0){if(b.br>=T.mx)return `Llegaste al máximo de sucursales para este giro (${T.mx}).`;const c=T.K*bzRv(T,b.r)*U0;if(b.cash>=c)b.cash-=c;else if(p.dinero>=c-b.cash){p.dinero-=c-b.cash;b.cash=0;}else return `Necesitas ${fmt(c)} (caja de la empresa + tu dinero).`;
    b.br++;b.st+=T.st;b.assets+=c;return `Abres la sucursal ${b.br} de ${b.n} (${fmt(c)}) y contratas ${T.st} empleados.`;}
  if(b.br<=1)return 'Es tu única sucursal: para cerrarla, cierra la empresa.';const rec=b.assets/b.br*.4;b.assets-=b.assets/b.br;b.br--;b.cash+=rec;const fire=Math.max(0,b.st-T.st*b.br);if(fire)bzStaff(p,b,-fire);return `Cierras una sucursal y recuperas ${fmt(rec)} al vender el equipo.`;}
function bzStaff(p,b,d){const T=bzT(b);if(d>0){b.st+=d;return `Contratas ${d} empleado(s).`;}const n=Math.min(-d,b.st-1);if(n<=0)return 'No puedes quedarte sin personal.';const sev=isReal()?n*bzWage(b.r,T.oc)/12*3:0;b.cash-=sev;b.st-=n;
  if(b.cash<0){b.debt+=-b.cash;b.cash=0;}b.rep=clamp(b.rep-n*.5,0,100);return sev?`Despides a ${n} empleado(s) y pagas ${fmt(sev)} de indemnización (3 meses de sueldo).`:`Despides a ${n} empleado(s).`;}
function bzLoan(p,b,d){const no=G.nations[G.regions[b.r].o];const L12=b.m.slice(-12);const ebitda=L12.reduce((s,z)=>s+z.net+z.dep+z.int+z.tax,0)*12/Math.max(1,L12.length);
  if(d>0){const lim=Math.max(0,Math.max(ebitda*2.5,b.assets*.5)-b.debt);if(lim<=0)return 'El banco no te presta más: tu deuda ya es alta para lo que gana la empresa.';const a=Math.min(lim,d);b.debt+=a;b.cash+=a;return `El banco presta ${fmt(a)} a ${b.n} al ${(Math.max(1,no.rate)+2).toFixed(1)} % anual.`;}
  const a=Math.min(b.debt,b.cash,-d);if(a<=0)return 'No hay caja para pagar deuda.';b.debt-=a;b.cash-=a;return `Pagas ${fmt(a)} de deuda.`;}
function bzInject(p,b,a){a=Math.min(a,Math.max(0,p.dinero));if(a<=0)return 'No tienes dinero para aportar.';p.dinero-=a;b.cash+=a;return `Aportas ${fmt(a)} a la caja de ${b.n}.`;}
function bzWithdraw(p,b,a){a=Math.min(a,b.cash);if(a<=0)return 'La empresa no tiene caja.';b.cash-=a;p.dinero+=a;return `Retiras ${fmt(a)} de la caja de ${b.n}.`;}
function bzSell(p,b){if(p.biz===b&&b.pub)return 'Tu empresa cotiza en bolsa: vende tus acciones desde 📈 Bolsa.';const v=bzValue(b)*R(.85,1.12);p.dinero+=v;if(p.biz===b)p.biz=null;else p.bzx=p.bzx.filter(z=>z!==b);return `Vendes ${b.n} por ${fmt(v)} (después de pagar sus deudas).`;}
function bzClose(p,b){if(p.biz===b&&b.pub)return 'Una empresa en bolsa no se puede cerrar así: vende tus acciones.';const T=bzT(b);const v=b.cash+b.assets*.3-b.debt;p.dinero+=v;const sev=isReal()?b.st*bzWage(b.r,T.oc)/12*3:0;p.dinero-=sev;
  if(p.biz===b)p.biz=null;else p.bzx=p.bzx.filter(z=>z!==b);return `Cierras ${b.n}: rematas el equipo, pagas deudas e indemnizaciones (${fmt(sev)}). Te quedan ${fmt(v-sev)}.`;}
// el motor viejo (v0.4) sumaba la ganancia del negocio una vez al año; ahora la empresa reparte cada mes
let BZ_AGE=false;{const _br=bizRevenue;bizRevenue=function(p){const b=p&&p.biz;if(b&&b.v14)return BZ_AGE?0:Math.max(0,b.last||0);return _br(p);};}

/* ===================== INVERSIONES: materias primas y bonos ===================== */
function cmTrade(k,q,buy){const b=bkEnsure(P);for(const j in b.cm)if(!(b.cm[j].q>0)||!isFinite(b.cm[j].c))delete b.cm[j]; /* v1.7o: limpia posiciones vacías o con costo NaN (comprar 0 dividía 0/0) */
  const o=G.rs[k];const px=o.p*(buy?1.005:.995);q=+q||0;if(!(q>0))return {err:buy?'Cantidad inválida.':'No tienes de esa materia prima.'};const amt=toInt(px*Math.abs(q),'USD');
  if(buy&&P.dinero<amt)return {err:`Necesitas ${fmt(amt)}.`};const ps=b.cm[k]||(b.cm[k]={q:0,c:0});
  if(buy){P.dinero-=amt;ps.c=(ps.c*ps.q+px*q)/(ps.q+q);ps.q+=q;return {ok:`Compras ${resQty(k,q)} de ${R0n(k)} a ${rsFmt(k,px)} (${fmt(amt)}).`};}
  q=Math.min(q,ps.q);if(q<=0)return {err:'No tienes de esa materia prima.'};const v=toInt(px*q,'USD');P.dinero+=v;b.rl+=toInt((px-ps.c)*q,'USD');ps.q-=q;if(ps.q<=0)delete b.cm[k];return {ok:`Vendes ${resQty(k,q)} de ${R0n(k)} por ${fmt(v)}.`};}
function cmValue(p){const b=p.bk;if(!b||!b.cm||!G.rs)return 0;let v=0;for(const k in b.cm)v+=b.cm[k].q*G.rs[k].p/fxOf('USD')*fxOf((G.nations[p._cur]||natOf(p)).cur)/(G.nations[p._cur]||natOf(p)).D;return v;}
const BOND_N=['USA','DEU','JPN','GBR','FRA','ITA','ESP','CAN','CHE','AUS','CHN','IND','BRA','MEX','ARG','TUR','ZAF','IDN','KOR','COL','CHL','EGY','NGA','SAU','POL'];
function bondY(n){ensureEco(n);const x=cxOf(n);const rsv=['USD','EUR','JPY','GBP','CHF'].includes(n.cur)?.5:1;let y=x.pr+.6+Math.max(0,n.debtR-.9)*3*rsv+(n.stab<30?3:0)+(n.rec>0?.5:0)+(warsOf(n.id).length?1:0)+(n.dft&&G.year-n.dft<6?5:0);if(n.cur==='EUR')y=Math.max(y,G.cx.EUR.pr+.5+Math.max(0,n.debtR-.9)*4);return Math.max(.1,y);}
function bondPx(z){const n=G.nations[z.nid];if(!n||!n.alive)return .3;return clamp(1-7*(bondY(n)-z.y)/100,.2,1.6);}
function bondValue(p){const b=p.bk;if(!b||!b.bd)return 0;return b.bd.reduce((s,z)=>s+toInt(z.f*bondPx(z),z.cur),0);}
function bondBuy(nid,amt){const b=bkEnsure(P);const n=G.nations[nid];if(amt>P.dinero)return {err:'No te alcanza.'};if(warBetween(nid,natOf(P).id))return {err:'No puedes comprar deuda de un país con el que estás en guerra.'};
  if(nid!==natOf(P).id&&natOf(P).cc)return {err:'Tu país tiene controles de capital.'};const y=bondY(n);const f=fromInt(amt*.997,n.cur);P.dinero-=amt;b.bd.push({nid,cur:n.cur,f,y,mat:G.year+10,hc:n.dft===G.year?1:0});
  return {ok:`Compras bonos a 10 años de ${n.name} por ${fmt(amt)}: rinden ${y.toFixed(2)} % al año en ${G.cx[n.cur].nm}.`};}
function bondSell(i){const b=P.bk;const z=b.bd[i];if(!z)return {err:''};const v=toInt(z.f*bondPx(z)*.997,z.cur);P.dinero+=v;b.bd.splice(i,1);return {ok:`Vendes tus bonos de ${G.nations[z.nid].name} por ${fmt(v)}.`};}
function invMonth(p){const b=p.bk;if(!b)return;let fee=0;for(const k in b.cm||{})fee+=b.cm[k].q*G.rs[k].p*(k==='gold'?.0025:.01)/12;if(fee)p.dinero-=toInt(fee,'USD');
  (b.bd||[]).forEach(z=>{const n=G.nations[z.nid];if(z.cur!==(n&&n.cur)&&n&&n.alive){z.f=z.f*fxOf(n.cur)/fxOf(z.cur);z.cur=n.cur;}
    if(n&&n.alive&&!(n.dft&&G.year-n.dft<1)){ensureEco(n);const risk=n.debtR>1.3&&(n.stab<30||n.rec>0||warsOf(n.id).length)?.004:0;
      if(risk&&chance(risk)){n.dft=G.year;n.debtR*=.7;mkNews(`${n.name} declara la moratoria de su deuda: los tenedores de bonos recuperan cerca del 45 %.`,true);}}
    if(n&&n.dft===G.year&&!z.hc){z.f*=.45;z.hc=1;log(`Tus bonos de ${n.name} sufren una quita del 55 % por la moratoria.`,'bad');}
    p.dinero+=toInt(z.f*z.y/1200,z.cur);});
  b.bd=(b.bd||[]).filter(z=>{if(G.year>=z.mat){p.dinero+=toInt(z.f,z.cur);log(`Vencen tus bonos de ${G.nations[z.nid].name}: recibes ${fmt(toInt(z.f,z.cur))}.`);return false;}const n=G.nations[z.nid];if(!n||!n.alive){p.dinero+=toInt(z.f*.3,z.cur);log(`${n?n.name:'Un país'} desaparece: sus bonos se pagan al 30 %.`,'bad');return false;}return true;});}

/* ===================== ACCIONES DEL GOBERNANTE ===================== */
function rzNation(n,on){n.nz=on;if(on){if(isReal())n.approval+=5;mkSectorShock('ener',-.25,n.id);mkSectorShock('min',-.25,n.id);mkNews(`${n.name} nacionaliza el petróleo y la minería: el Estado se queda con una parte mayor de la renta.`,true);
    return 'Nacionalizas el petróleo y la minería: las regalías al tesoro suben del 10 % al 35 % del valor producido, pero baja la inversión (−0.3 % de crecimiento al año) y las empresas del sector caen en bolsa.';}
  if(isReal())n.approval-=3;n.treas=(n.treas||0)+(()=>{let v=0;for(const k in RES0)v+=resValue(n.id,k);return v*.05;})();return 'Reprivatizas el sector: vendes concesiones (5 % del valor anual al tesoro) y la inversión vuelve; las regalías regresan al 10 %.';}
function rzBan(n,k,on){n.ban=n.ban||{};if(on){n.ban[k]=1;if(isReal()&&RES0[k][5]==='agr')n.approval+=2;mkNews(`${n.name} prohíbe exportar ${R0n(k)}.`,true);return `Prohíbes exportar ${R0n(k)}: el precio mundial sube y el mercado interno se abastece, pero pierdes divisas (frena tu crecimiento).`;}
  delete n.ban[k];return `Levantas la prohibición de exportar ${R0n(k)}.`;}

/* ===================== ENGANCHES ===================== */
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();ensureV14();rsMonth();if(P&&P.alive){bzList(P).forEach(b=>{if(!b.v14)bzMigrate(P);bzMonth(P,b);});invMonth(P);}};}
{const _au=ageUp;ageUp=function(){if(!G||!P||!P.alive||P.event){_au();return;}ensureV14();const L=bzList(P).map(b=>[b,b.last]);BZ_AGE=true;try{_au();}finally{BZ_AGE=false;}
  L.forEach(([b,l])=>{if(b.v14){b.last=l;b.luck=1;}});if(P.alive){bzYear(P);if(P.biz&&P.biz.v14&&P.biz.pub)ipoYear(P,P.biz.last,true);}};}
{const _nw=netWorth;netWorth=function(p){let v=_nw(p);if(!p||!G||!G.mk)return v;const b=p.biz;if(b&&b.v14&&!b.pub)v+=bzValue(b)-(b.last||0)*3;(p.bzx||[]).forEach(z=>v+=bzValue(z));v+=cmValue(p)+bondValue(p);return v;};}
// la OPI usa el giro de la empresa (sector y nombre) del catálogo nuevo
function bzSecOf(b){return b&&b.v14?bzT(b).sec:null;}
