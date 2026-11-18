/* ===== v0.9: provincias completas, presupuesto, ideologías, naciones formables, guerra y paz completas ===== */
/* ----- edificios de Age of History 2 ----- */
Object.assign(BLD,{
 granja:{n:'Granja',ic:'🌾',c:.025,max:3,d:'+0.25 % de crecimiento de población y +3 de felicidad por nivel'},
 taller:{n:'Taller',ic:'🔨',c:.035,max:3,d:'+0.4 % de crecimiento económico y más desarrollo por nivel'},
 biblio:{n:'Biblioteca',ic:'📚',c:.03,max:2,d:'+desarrollo y más investigación para todo el país'},
 armeria:{n:'Armería',ic:'🛡️',c:.04,max:2,d:'+reserva de reclutas; quien se recluta aquí sale mejor equipado'},
 torre:{n:'Torre de vigía',ic:'🗼',c:.015,max:1,d:'Ves ejércitos enemigos a 3 provincias y +10 % de defensa'},
 sumi:{n:'Depósito de suministros',ic:'📦',c:.02,max:1,d:'Abasto completo para tus tropas aquí y en provincias vecinas'}
});

/* ----- provincias: felicidad, desarrollo, crecimiento, núcleos ----- */
const devFromPc=pc=>clamp(Math.log10(Math.max(300,pc)/500)*3.3,.3,10);
const pcFromDev=d=>500*Math.pow(10,d/3.3);
function ensureProv(x){if(x.hap==null){const n=G.nations[x.o];x.hap=clamp(35+(n?n.stab:50)*.5+R(-8,8),5,95);}if(x.dev==null)x.dev=devFromPc(x.gdp/Math.max(1,x.pop));}
function ensureProvAll(){if(G.pv9)return;for(const r in G.regions)ensureProv(G.regions[r]);G.pv9=1;}
const coresOf=x=>x.cores||[x.w0];
const isCore=(r,nid)=>coresOf(G.regions[r]).includes(nid);
function addCore(r,nid){const x=G.regions[r];const c=coresOf(x).slice();if(!c.includes(nid))c.push(nid);x.cores=c;}
function provBonus9(r,x){ensureProv(x);let b=(x.hap-50)/10000;const pc=x.gdp/Math.max(1,x.pop);if(x.dev>devFromPc(pc)+.3)b+=Math.min(.01,(x.dev-devFromPc(pc))*.004);if(!isCore(r,x.o))b-=.003;
  // freno de convergencia: las provincias ya muy ricas crecen menos (evita economías desbocadas por edificios)
  const lim=typeof FPC==='function'?FPC()*1.3:50000;if(pc>lim)b-=Math.log2(pc/lim)*.03;return b;}
function provPop9(x){ensureProv(x);let g=.25*((x.b&&x.b.granja)||0)+(x.gwu&&x.gwu>=G.year?.3:0)+(x.hap-50)/50*.1;return 1+g/100;}
function provYear(){const me=P&&P.alive?natOf(P).id:null;const NB={};
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;NB[id]=50+IDEO[ideoOf(n)].hap+(n.stab-50)/3+(playerRules(id)?(n.budHap||0):0)-(warsOf(id).length?5:0)+(n.taxL===1?-6:n.taxL===-1?5:0);}
  for(const r in G.regions){const x=G.regions[r];const n=G.nations[x.o];if(!n||!n.alive)continue;ensureProv(x);const core=isCore(r,x.o);const bb=x.b;
    if(NB[x.o]==null){const m=G.nations[x.o];NB[x.o]=50+IDEO[ideoOf(m)].hap+(m.stab-50)/3;}
    let t=NB[x.o]+(core?0:-20)+(bb?3*(bb.granja||0)+2*(bb.hosp||0):0)+(x.hb||0)-(G.occ&&G.occ[r]?15:0)-(x.cq!=null&&G.year-x.cq<5?10:0);
    x.hap=clamp(x.hap+(t-x.hap)*.3+R(-2,2),0,100);if(x.hb)x.hb=Math.max(0,x.hb-5);
    x.dev=clamp(x.dev+(bb?.05*(bb.biblio||0)+.04*(bb.taller||0):0)+Math.max(0,devFromPc(x.gdp/Math.max(1,x.pop))-x.dev)*.04,.3,10);
    if(!core&&x.hap>65&&x.cq!=null&&G.year-x.cq>=20&&chance(.05))addCore(r,x.o);
    if(x.hap<20&&chance(.03)){if(!core&&G.nations[x.w0]&&!G.nations[x.w0].alive&&!(G.occ&&G.occ[r]))revolt(r);else{n.stab=clamp(n.stab-1.5,0,100);x.gdp*=.97;if(x.o===me)pushNews(`Disturbios en ${RG[r].nm}: la felicidad está en ${Math.round(x.hap)}.`,'bad');}}}}
function revolt(r){const x=G.regions[r],own=G.nations[x.o],old=G.nations[x.w0];if(!old||old.alive)return;
  const rs=Object.keys(G.regions).filter(k=>G.regions[k].o===x.o&&G.regions[k].w0===x.w0&&(k===r||(G.regions[k].hap<40&&chance(.6))));
  old.alive=true;old.leader=rndName(x.w0);old.gov='democracia';old.ideo='rep';old.stab=40;old.allies=[];old.army=Math.max(1.5,armyIdx(N0[x.w0].milx)*.3);old.nextElec=G.year+old.term;
  rs.forEach(k=>transfer(k,x.w0));declareWar(x.w0,x.o);pushNews(`Rebelión en ${RG[r].nm}: ${old.name} declara su independencia de ${own.name}.`,'bad');}
const provCost={dev:x=>x.gdp*.04*(1+x.dev/5),grow:x=>x.gdp*.02,fest:x=>x.gdp*.01,assim:x=>x.gdp*.06};
function provAct(r,k){const x=G.regions[r],n=G.nations[x.o];ensureProv(x);const c=provCost[k](x);n.treas=(n.treas||0)-c;
  if(k==='dev'){x.dev=Math.min(10,x.dev+.5);x.gdp*=1.02;return `Inviertes ${fmtN(c)} en ${RG[r].nm}: desarrollo ${x.dev.toFixed(1)}.`;}
  if(k==='grow'){x.gwu=G.year+10;return `Programa de crecimiento en ${RG[r].nm} por 10 años (${fmtN(c)}).`;}
  if(k==='fest'){x.hb=Math.min(30,(x.hb||0)+15);x.hap=Math.min(100,x.hap+8);return `Festival en ${RG[r].nm}: la gente celebra (${fmtN(c)}).`;}
  if(k==='assim'){addCore(r,x.o);x.hap=Math.max(0,x.hap-10);return `${RG[r].nm} se vuelve provincia núcleo de ${n.name} (${fmtN(c)}).`;}}
function liberate(dead,rs,by,asVassal){const D=G.nations[dead];if(!D||D.alive)return '';D.alive=true;D.leader=rndName(dead);D.gov='democracia';D.ideo='rep';D.stab=50;D.allies=[];D.army=Math.max(1.5,armyIdx(N0[dead].milx)*.4);D.nextElec=G.year+D.term;
  rs.forEach(k=>transfer(k,dead));if(asVassal)makeVassal(dead,by);ensureV07();G.dip.op=G.dip.op||{};if(P&&P.alive&&natOf(P).id===by)addOp(dead,40);touchDip();
  pushNews((asVassal?`${D.name} recupera su independencia como vasallo de ${G.nations[by].name}.`:`${D.name} recupera su independencia.`),'good');return asVassal?`Liberas a ${D.name} (${rs.length} provincia(s)) como tu vasallo.`:`Liberas a ${D.name} (${rs.length} provincia(s)).`;}

/* ----- ideologías y sistemas de gobierno ----- */
const IDEO={
 rep:{n:'República democrática',gov:'democracia',t:['Presidente','Presidenta'],col:[70,130,220],g:.2,stab:0,res:.15,mil:0,mp:1,hap:5,tax:1,war:1.2,d:'Elecciones; +crecimiento e investigación; declarar guerras cuesta más'},
 mon:{n:'Monarquía parlamentaria',gov:'democracia',t:['Primer Ministro','Primera Ministra'],col:[150,90,200],g:.1,stab:6,res:.1,mil:0,mp:1,hap:4,tax:1,war:1,d:'Elecciones de primer ministro; la corona da estabilidad'},
 tec:{n:'Tecnocracia',gov:'democracia',t:['Canciller','Canciller'],col:[60,190,180],g:.4,stab:-2,res:.35,mil:0,mp:.9,hap:-2,tax:1,war:1.2,d:'Gobierno de expertos: mucha investigación y crecimiento'},
 aut:{n:'República autoritaria',gov:'dictadura',t:['Presidente','Presidenta'],col:[110,110,140],g:0,stab:2,res:0,mil:.03,mp:1.1,hap:-3,tax:1.1,war:.8,d:'Sin elecciones reales; algo más de impuestos y control'},
 abs:{n:'Monarquía absoluta',gov:'dictadura',t:['Rey','Reina'],col:[120,50,150],g:-.1,stab:4,res:0,mil:.05,mp:1.1,hap:-3,tax:1.15,war:.7,d:'El trono se hereda; impuestos altos'},
 com:{n:'Comunismo',gov:'dictadura',t:['Secretario General','Secretaria General'],col:[200,40,40],g:-.2,stab:3,res:.1,mil:.04,mp:1.4,hap:-4,tax:1.25,war:.8,d:'Economía planificada: gran reserva de reclutas e impuestos altos'},
 fas:{n:'Fascismo',gov:'dictadura',t:['Caudillo','Caudilla'],col:[95,75,55],g:-.1,stab:2,res:0,mil:.12,mp:1.5,hap:-8,tax:1.1,war:.4,d:'Ejército fuerte y guerras baratas; poca felicidad y rechazo mundial'},
 teo:{n:'Teocracia',gov:'dictadura',t:['Líder Supremo','Líder Suprema'],col:[215,190,80],g:-.3,stab:8,res:-.2,mil:.03,mp:1.2,hap:2,tax:1.05,war:.7,d:'Mucha estabilidad; poca investigación'},
 mil:{n:'Junta militar',gov:'dictadura',t:['Jefe de la Junta','Jefa de la Junta'],col:[80,110,60],g:-.4,stab:-3,res:-.1,mil:.08,mp:1.25,hap:-5,tax:1.05,war:.6,d:'Ejército mejor; economía y estabilidad débiles'}};
const IDEO0={mon:'GBR ESP NLD BEL SWE NOR DNK JPN THA LUX MYS KHM LSO BTN JOR MAR',abs:'SAU OMN BRN SWZ QAT ARE KWT BHR',com:'CHN VNM LAO CUB PRK',teo:'IRN AFG',mil:'MMR MLI BFA NER GIN SDN TCD GAB',aut:'RUS BLR TKM TJK UZB AZE ERI SYR VEN NIC EGY RWA KAZ'};
function ensureIdeoAll(){if(G.iv9)return;const M={};for(const k in IDEO0)IDEO0[k].split(' ').forEach(c=>M[c]=k);
  for(const id in G.nations){const n=G.nations[id];if(n.ideo)continue;if(playerRules(id)){n.ideo=n.gov==='democracia'?(M[id]==='mon'?'mon':'rep'):'aut';continue;}n.ideo=M[id]||'rep';n.gov=IDEO[n.ideo].gov;if(n.gov==='democracia'&&!n.nextElec)n.nextElec=G.year+n.term;}G.iv9=1;}
function ideoOf(n){if(!n.ideo)n.ideo=n.gov==='democracia'?'rep':'aut';syncIdeo(n);return n.ideo;}
function syncIdeo(n){const I=IDEO[n.ideo];if(!I){n.ideo='rep';return;}if(n.gov==='democracia'&&I.gov!=='democracia')n.ideo='rep';else if(n.gov==='dictadura'&&I.gov==='democracia')n.ideo=playerRules(n.id)?'aut':'mil';}
function rulerTitle(p,n){const I=IDEO[ideoOf(n)];return I.t[p.sex==='F'?1:0];}
const ideoMil=nid=>{const n=G.nations[nid];return n?1+IDEO[ideoOf(n)].mil:1;};
const warPenOf=n=>IDEO[ideoOf(n)].war;
function ideoOp(t,me){const a=G.nations[t],b=G.nations[me];if(!a||!b)return 0;const x=ideoOf(a),y=ideoOf(b);let v=x===y?15:0;const dem=k=>IDEO[k].gov==='democracia';if((x==='fas')!==(y==='fas'))v-=10;else if(dem(x)!==dem(y))v-=5;return v;}
function canChangeIdeo(n){return !n.ideoY||G.year-n.ideoY>=4;}
function changeIdeo(n,k){const I=IDEO[k],old=IDEO[ideoOf(n)];const flip=I.gov!==old.gov;n.ideo=k;n.ideoY=G.year;n.gov=I.gov;n.stab=clamp(n.stab-(flip?25:15),0,100);
  if(isReal())n.approval=clamp(n.approval-10,3,95);if(I.gov==='democracia'){n.nextElec=G.year+n.term;n.congress=clamp(n.approval+R(-8,12),20,80);}
  if(flip&&I.gov==='dictadura'){Object.keys(G.nations).forEach(t=>{const T=G.nations[t];if(T.alive&&t!==n.id&&IDEO[ideoOf(T)].gov==='democracia')addOp(t,-10);});if(isReal())n.sanc=Math.max(n.sanc||0,3);}
  return `${n.name} adopta el sistema: ${I.n}. ${flip?'El cambio sacude al país (−25 estabilidad).':'Estabilidad −15 mientras se adapta.'}`;}
function mpCap(n){const I=IDEO[ideoOf(n)];let a=0;regionsOf(n.id).forEach(r=>{const k=bl(r,'armeria');if(k)a+=G.regions[r].pop*.005*k;});return (n.pop*(isReal()?.012:.02))*I.mp+a;}

/* ----- naciones formables ----- */
const FORMS=[
 {id:'gcol',n:'Gran Colombia',m:['COL','VEN','ECU','PAN']},{id:'ccam',n:'República Federal de Centroamérica',m:['GTM','HND','SLV','NIC','CRI']},
 {id:'inca',n:'Confederación Andina',m:['PER','BOL','ECU']},{id:'plat',n:'Provincias Unidas del Río de la Plata',m:['ARG','URY','PRY','BOL']},
 {id:'usam',n:'Unión Sudamericana',m:['BRA','ARG','COL','PER','VEN','CHL','ECU','BOL','PRY','URY']},{id:'nam',n:'Unión Norteamericana',m:['USA','CAN','MEX']},
 {id:'iber',n:'Unión Ibérica',m:['ESP','PRT']},{id:'scan',n:'Unión Escandinava',m:['SWE','NOR','DNK','FIN','ISL']},{id:'benl',n:'Benelux Unido',m:['BEL','NLD','LUX']},
 {id:'eur',n:'Estados Unidos de Europa',m:['DEU','FRA','ITA','ESP','POL','NLD','BEL','AUT','PRT','GRC']},{id:'rome',n:'Nuevo Imperio Romano',m:['ITA','GRC','TUR','EGY','TUN','ESP','FRA']},
 {id:'yug',n:'Unión de Eslavos del Sur',m:['SRB','HRV','BIH','SVN','MNE','MKD']},{id:'balt',n:'Federación Báltica',m:['EST','LVA','LTU']},
 {id:'ussr',n:'Unión Euroasiática',m:['RUS','UKR','BLR','KAZ','UZB']},{id:'kor',n:'Corea Unificada',m:['KOR','PRK']},{id:'raj',n:'Federación del Indostán',m:['IND','PAK','BGD']},
 {id:'arab',n:'Unión Árabe',m:['EGY','SAU','IRQ','SYR','JOR']},{id:'magh',n:'Gran Magreb',m:['MAR','DZA','TUN','LBY']},{id:'eaf',n:'Federación del África Oriental',m:['KEN','TZA','UGA','RWA','BDI']},
 {id:'saf',n:'Unión del África Austral',m:['ZAF','NAM','BWA','ZWE','MOZ']},{id:'aus',n:'Mancomunidad de Oceanía',m:['AUS','NZL','PNG']},{id:'indo',n:'Gran Nusantara',m:['IDN','MYS','PHL']}];
const CAPP={};const capProv=c=>CAPP[c]!==undefined?CAPP[c]:(CAPP[c]=Object.keys(RG).find(r=>RG[r].cap&&RG[r].n===c)||null);
function formStatus(nid,f){const ms=f.m.filter(c=>N0[c]);const caps=ms.map(capProv).filter(Boolean);const own=caps.filter(r=>G.regions[r]&&G.regions[r].o===nid).length;return {own,need:caps.length,ok:ms.includes(nid)&&own===caps.length&&!(G.formed&&G.formed[f.id])};}
function formsFor(nid){return FORMS.filter(f=>f.m.includes(nid)&&!(G.formed&&G.formed[f.id]));}
function formNation(nid,f){const n=G.nations[nid];G.formed=G.formed||{};G.formed[f.id]=nid;const old=n.name;n.name=f.n;n.formed=f.id;n.stab=clamp(n.stab+10,0,100);
  for(const r in G.regions){const x=G.regions[r];if(f.m.includes(x.w0)&&x.o===nid)addCore(r,nid);}
  pushNews(`${old} se proclama ${f.n}.`,'good');return `¡Proclamas ${f.n}! Todas sus provincias pasan a ser núcleo y la estabilidad sube.`;}
function aiFormYear(){for(const f of FORMS){if(G.formed&&G.formed[f.id])continue;for(const c of f.m){const n=G.nations[c];if(!n||!n.alive||playerRules(c))continue;if(formStatus(c,f).ok&&chance(.5)){formNation(c,f);break;}}}}

/* ----- presupuesto (porcentajes del ingreso del tesoro) ----- */
const BUD={inv:{n:'Inversión',d:'desarrollo de provincias y crecimiento'},res:{n:'Investigación',d:'tecnología civil y militar'},mil:{n:'Ejército',d:'paga tropas extra, moral y reclutas'},bie:{n:'Bienestar',d:'felicidad y estabilidad'}};
function ensureBud(n){if(!n.bud)n.bud={inv:20,res:10,mil:15,bie:15};}
const budSum=n=>{ensureBud(n);return Object.values(n.bud).reduce((s,v)=>s+v,0);};
function budgetYear(n){ensureBud(n);ensureEco(n);const I=treasuryIncome(n),b=n.bud,sh=k=>I*b[k]/100;
  n.treas=(n.treas||0)+I*(1-budSum(n)/100);
  const inv=sh('inv');n.budInv=inv/Math.max(1,n.gdp)*100*40;const rs=regionsOf(n.id);let pop=0;rs.forEach(r=>pop+=G.regions[r].pop);
  rs.forEach(r=>{const x=G.regions[r];ensureProv(x);const a=inv*x.pop/Math.max(1,pop);x.dev=Math.min(10,x.dev+.5*a/Math.max(1,x.gdp*.03));});
  const res=sh('res')*(1+IDEO[ideoOf(n)].res);n.tech.c=Math.min(10,n.tech.c+.6*res/researchCost(n,'c'));n.tech.m=Math.min(10,n.tech.m+.4*res/researchCost(n,'m'));armiesOf(n.id).forEach(a=>a.q=qualOf(n.id));
  n._milBud=sh('mil');const extra=Math.max(0,n._milBud-upkeepOf(n.id));if(n.mp!=null)n.mp=Math.min(mpCap(n),n.mp+extra/Math.max(1,perSoldier(n.id))*.5);
  const bie=sh('bie');n.budHap=Math.min(15,bie/Math.max(1,I*.15)*5);n.stab=clamp(n.stab+Math.min(3,n.budHap/5),0,100);}

/* ----- economía: crecimiento con ideología e inversión; ingresos con núcleos ----- */
function ecoBonus(n){ensureEco(n);let b=.25*n.tech.c+TAXL[n.taxL].g+tradeBonus(n.id)-embargoHit(n.id)+IDEO[ideoOf(n)].g;if(n.debtR>1.2)b-=(n.debtR-1.2)*.6;if(playerRules(n.id)&&n.budInv)b+=Math.min(.8,n.budInv);return b;}
function treasuryIncome(n){ensureEco(n);let nc=0;regionsOf(n.id).forEach(r=>{if(!isCore(r,n.id))nc+=G.regions[r].gdp;});const eff=1-.5*nc/Math.max(1,n.gdp);
  return n.gdp*.006*(isReal()?clamp(N0[n.id].tax/15,.5,1.6):1)*TAXL[n.taxL].k*IDEO[ideoOf(n)].tax*eff;}

/* ----- puntos de movimiento por turno (mes de guerra) ----- */
const mptMax=nid=>clamp(6+Math.floor(regionsOf(nid).length/10),6,30);
function orderCost(a,r){return r.sea?2:1+Math.floor(((r.path&&r.path.length)||0)/6);}

/* ----- guerra: saqueo y reagrupar ----- */
function canPlunder(a){const r=a.r,x=G.regions[r];return !a.sea&&G.occ&&G.occ[r]===a.o&&x.o!==a.o&&x.plY!==G.year;}
function plunder(a){const x=G.regions[a.r],n=G.nations[a.o];const loot=x.gdp*.03;x.gdp*=.9;x.pop*=.99;ensureProv(x);x.hap=Math.max(0,x.hap-25);x.plY=G.year;
  if(playerRules(a.o))n.treas=(n.treas||0)+loot;else if(P&&P.alive&&isGeneral(P)&&natOf(P).id===a.o){P.dinero+=loot*.001;P.s.influencia+=1;}
  const w=warBetween(a.o,x.o);if(w)addEx(w,x.o,3);Object.keys(G.nations).forEach(t=>{if(G.nations[t].alive&&t!==a.o&&chance(.3))addOp(t,-2);});
  return (playerRules(a.o)?`Saqueas ${RG[a.r].nm}: ${fmtN(loot)} para el tesoro. La provincia queda devastada.`:`Saqueas ${RG[a.r].nm}: ${fmtN(loot)}. La provincia queda devastada.`);}
function regroupTo(rid,nid){const L=armiesOf(nid).filter(a=>!a.sea&&!(a.train>0)&&a.r!==rid);let k=0;L.forEach(a=>{const rm=routeMap(a,8);if(rm.dist[rid]!=null){a.path=pathFrom(rm,rid);a.nav=null;a.auto=false;a.man=1;k++;}});return k;}

/* ----- ranking de naciones ----- */
function ranking(){const key=G.year+'|'+G.month;if(CACHE.rk&&CACHE.rk.k===key)return CACHE.rk.L;const A=Object.values(G.nations).filter(n=>n.alive);
  const mg=Math.max(...A.map(n=>n.gdp)),mp=Math.max(...A.map(n=>n.pop)),mw=Math.max(...A.map(n=>power(n.id)));
  const L=A.map(n=>({id:n.id,s:40*n.gdp/mg+30*n.pop/mp+30*power(n.id)/mw})).sort((a,b)=>b.s-a.s);CACHE.rk={k:key,L};return L;}
const rankOf=nid=>ranking().findIndex(x=>x.id===nid)+1;

/* ----- reparaciones de guerra ----- */
function addReparations(loser,winner,years){ensureV07();G.dip.repa=G.dip.repa||{};const a=G.nations[loser].gdp*.01;G.dip.repa[loser+'>'+winner]={a,u:G.year+years};return a;}
function reparationsYear(){if(!G.dip||!G.dip.repa)return;for(const k in G.dip.repa){const [l,w]=k.split('>'),o=G.dip.repa[k];const L=G.nations[l],W=G.nations[w];
  if(!L||!W||!L.alive||!W.alive||G.year>o.u){delete G.dip.repa[k];continue;}if(playerRules(w))W.treas=(W.treas||0)+o.a;if(playerRules(l))L.treas=(L.treas||0)-o.a;else shockGDP(l,1-Math.min(.02,o.a/Math.max(1,L.gdp)));}}

/* ----- diplomacia ampliada: regalos, insultos, llamado a las armas, unión ----- */
function dipActions(t){const a=dipActionsV8(t);const me=natOf(P).id,T=G.nations[t],n=natOf(P);ensureV07();const ok=P.ruler&&P.alive&&!P.event&&(P.dip||0)>0&&T.alive;const o=opOf(t);
  const gift=Math.max(1e8,n.gdp*.0004);
  a.push({k:'gift',t:`Enviar un regalo (${fmtN(gift)})`,s:'+15 a +25 de opinión',can:ok&&(n.treas||0)>=gift&&!warBetween(me,t),fn:()=>{n.treas-=gift;const d=RI(15,25);addOp(t,d);return `Envías un regalo a ${T.name} (+${d} de opinión).`;}});
  a.push({k:'insult',t:'Insultar a su gobierno',s:'−30 de opinión; si son más fuertes, pueden declararte la guerra',can:ok,fn:()=>{addOp(t,-30);n.stab=clamp(n.stab+1,0,100);if(power(t)>power(me)*1.3&&chance(.25)){declareWar(t,me);flushNews();return `${T.name} responde al insulto declarándote la guerra.`;}return `Insultas al gobierno de ${T.name}. Tu pueblo aplaude; ellos no olvidan.`;}});
  const myWars=warsOf(me).filter(w=>!warBetween(t,enemyIn(w,me)));
  if(n.allies.includes(t)&&myWars.length){const w=myWars[0],foe=enemyIn(w,me),c=clamp(.4+o/150,.1,.9);a.push({k:'cta',t:`Llamar a las armas contra ${G.nations[foe].name}`,s:`Probabilidad ${Math.round(c*100)} % · entra con sus ejércitos`,can:ok,fn:()=>{if(chance(c)){joinWar(t,foe,w,me);flushNews();return `${T.name} entra a la guerra a tu lado.`;}addOp(t,-5);return `${T.name} no quiere entrar a la guerra.`;}});}
  if(!warBetween(me,t)&&!overlordOf(me)){const same=cultOf(t)===cultOf(me)||ideoOf(T)===ideoOf(n);const c=clamp((o-75)/50+.2,0,.8);
    a.push({k:'union',t:'Proponer una unión de naciones',s:`Requiere opinión 75+, misma cultura o sistema y que sean más débiles · probabilidad ${Math.round((same&&o>=75&&power(t)<power(me)*.7?c:0)*100)} %`,can:ok&&same&&o>=75&&power(t)<power(me)*.7,fn:()=>{if(!chance(c)){addOp(t,-5);return `${T.name} prefiere seguir independiente.`;}
      regionsOf(t).slice().forEach(r=>{transfer(r,me);addCore(r,me);});checkGone(t);touchDip();flushNews();return `${T.name} se une a ${n.name} por voluntad propia.`;}});}
  return a;}

/* ----- turno anual v0.9 ----- */
function yearV09(p){ensureProvAll();ensureIdeoAll();for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;syncIdeo(n);const I=IDEO[n.ideo];n.stab=clamp(n.stab+I.stab/10,0,100);
    if(!playerRules(id)&&n.tech){n.tech.c=Math.min(10,n.tech.c+.03*I.res);let lib=0;regionsOf(id).forEach(r=>lib+=bl(r,'biblio'));n.tech.c=Math.min(10,n.tech.c+lib*.01);}
    if(!playerRules(id)&&n.gov==='dictadura'&&chance(.004)){const k=pick(['com','fas','teo','mil','aut','abs']);n.ideo=k;n.gov=IDEO[k].gov;if(P&&P.alive&&neighborsOf(natOf(P).id).includes(id))pushNews(`Revolución en ${n.name}: el nuevo régimen es ${IDEO[k].n.toLowerCase()}.`);}}
  if(p&&p.ruler&&p.alive){const n=natOf(p);let lib=0;regionsOf(n.id).forEach(r=>lib+=bl(r,'biblio'));if(lib){ensureEco(n);n.tech.c=Math.min(10,n.tech.c+lib*.01);}}
  provYear();reparationsYear();aiFormYear();}
