/* ===== v0.7: capa Mando — ejércitos por provincia, meses de guerra, ocupación, diplomacia completa ===== */
const MES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const fmtK=v=>v>=1e6?(v/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M':v>=1e4?Math.round(v/1e3)+' mil':v>=1e3?(v/1e3).toLocaleString('es-MX',{maximumFractionDigits:1})+' mil':String(Math.round(v));
const h32=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};

/* ----- autoridad ----- */
const isGeneral=p=>!!(p&&p.alive&&!p.prison&&p.career&&p.career.track==='militar'&&p.career.rank===6);
const hasCommand=p=>!!(p&&p.alive&&!p.prison&&(p.ruler||isGeneral(p)));
const cmdNat=()=>hasCommand(P)?natOf(P).id:null;
const mandoWars=()=>G.wars.filter(w=>w.mando);
const mandoActive=()=>{const me=cmdNat();return !!me&&G.wars.some(w=>w.mando&&(w.a===me||w.b===me));};
function ensureV07(){if(typeof ensureIdeoAll==='function'){ensureIdeoAll();ensureProvAll();}if(!G.armies)G.armies=[];if(!G.occ)G.occ={};if(!G.sg)G.sg={};if(G.month==null)G.month=0;if(!G.aid)G.aid=1;
  if(!G.dip)G.dip={nap:{},acc:{},guar:{},vas:{},op:{},opFor:null,cb:{},imp:{}};if(!G.calls)G.calls=[];}

/* ----- relaciones entre países ----- */
const pk=(a,b)=>a<b?a+'|'+b:b+'|'+a;
const napOf=(a,b)=>G.dip&&G.dip.nap[pk(a,b)]>G.year?G.dip.nap[pk(a,b)]:0;
const accessOK=(nid,o)=>!!(G.dip&&G.dip.acc[o+'>'+nid]);
const overlordOf=nid=>G.dip&&G.dip.vas[nid]||null;
const vassalsOf=nid=>G.dip?Object.keys(G.dip.vas).filter(v=>G.dip.vas[v]===nid&&G.nations[v]&&G.nations[v].alive):[];
const guarBy=(g,t)=>!!(G.dip&&G.dip.guar[g+'>'+t]);
function friendsOf(nid){const C=CACHE.fr||(CACHE.fr={});return C[nid]||(C[nid]=friendsRaw(nid));}
function friendsRaw(nid){const n=G.nations[nid];const s=new Set([nid]);if(!n)return s;n.allies.forEach(a=>s.add(a));
  if(G.dip){vassalsOf(nid).forEach(v=>s.add(v));const o=overlordOf(nid);if(o)s.add(o);}return s;}
const hostile=(a,b)=>{if(a===b)return false;if(!CACHE.wk){CACHE.wk=new Set();G.wars.forEach(w=>CACHE.wk.add(pk(w.a,w.b)));}return CACHE.wk.has(pk(a,b));};
const ctrlOf=r=>(G.occ&&G.occ[r])||G.regions[r].o;
const isCap=r=>{const o=G.regions[r].o;return capitalOf(o)===r;};
function opBase(t,me){const n=G.nations[t];let v=(h32(t+me)%21)-10;if(n.allies.includes(me))v+=45;if(cultOf(t)===cultOf(me))v+=10;if(neighborsOf(me).includes(t))v-=5;if(warBetween(t,me))v-=60;if(overlordOf(t)===me)v+=10;if(typeof ideoOp==='function')v+=ideoOp(t,me);return v;}
function opOf(t){ensureV07();const me=P&&P.alive?natOf(P).id:null;if(!me)return 0;const D=G.dip;if(D.opFor!==me){D.op={};D.opFor=me;}if(D.op[t]==null)D.op[t]=opBase(t,me);return D.op[t];}
function addOp(t,d){opOf(t);G.dip.op[t]=clamp(G.dip.op[t]+d,-100,100);}

/* ----- grafo: vecinos por tierra y estrechos ----- */
let SEAADJ=null;function seaAdj(r){if(!SEAADJ){SEAADJ={};(MAP.sea||[]).forEach(s=>{const [a,b]=s.split('|');if(!RG[a]||!RG[b])return;(SEAADJ[a]||(SEAADJ[a]=[])).push(b);(SEAADJ[b]||(SEAADJ[b]=[])).push(a);});}return SEAADJ[r]||[];}
const hasCoast=nid=>regionsOf(nid).some(r=>RG[r].co);
const seaNeighbor=(a,b)=>regionsOf(a).some(r=>seaAdj(r).some(x=>G.regions[x]&&G.regions[x].o===b));
const canReach=(a,b)=>neighborsOf(a).includes(b)||seaNeighbor(a,b)||(hasCoast(a)&&hasCoast(b));
const mapDist=(a,b)=>{const p=RG[a].c,q=RG[b].c;let dx=Math.abs(p[0]-q[0]);dx=Math.min(dx,MAP.W-dx);return Math.hypot(dx,p[1]-q[1]);};
function passable(nid,r){const o=G.regions[r].o,c=ctrlOf(r);if(o===nid||c===nid)return true;const f=friendsOf(nid);
  return f.has(o)||f.has(c)||accessOK(nid,o)||hostile(nid,o)||hostile(nid,c);}
const friendlyCtrl=(nid,r)=>{const c=ctrlOf(r);return c===nid||friendsOf(nid).has(c)||(accessOK(nid,c)&&!hostile(nid,c));};
// costo de entrar a una provincia (2 puntos de movimiento por mes): propia o aliada 1, enemiga 2, estrecho 2
function stepCost(nid,from,to,strait){if(strait)return 2;return (friendlyCtrl(nid,to)?1:2)+(typeof terrMove==='function'?terrMove(to):0);}
function routeMap(a,maxC){const nid=a.o,src=a.r,dist={},prev={},B=[[src]];dist[src]=0;
  for(let c=0;c<B.length&&c<=maxC;c++){const q=B[c];if(!q)continue;for(let i=0;i<q.length;i++){const r=q[i];if(dist[r]!==c)continue;
    const relax=(x,st)=>{if(!RG[x]||!G.regions[x]||!passable(nid,x))return;const nc=c+stepCost(nid,r,x,st);if(nc>maxC)return;if(dist[x]==null||nc<dist[x]){dist[x]=nc;prev[x]=r;(B[nc]||(B[nc]=[])).push(x);}};
    RG[r].adj.forEach(x=>relax(x,0));seaAdj(r).forEach(x=>relax(x,1));}}
  return {dist,prev};}
function pathFrom(rm,dest){if(rm.dist[dest]==null)return null;const p=[];let x=dest;while(rm.prev[x]!=null){p.unshift(x);x=rm.prev[x];}return p;}
const navalETA=(a,b)=>1+Math.ceil(mapDist(a,b)/500);
const navCap=nid=>{const d=N0[nid];return d?Math.max(1500,d.milx/1e9*6000):1500;};
// guarnición local: el resto del personal militar, repartido por población (no hay en provincias ya ocupadas)
function garOf(r){const o=G.regions[r].o;if(ctrlOf(r)!==o)return 0;const n=G.nations[o];return fieldOf(o)/.6*.4*G.regions[r].pop/Math.max(1,n.pop);}
function siegeNeed(r,a){const o=G.regions[r].o;const g=garOf(r)*qualOf(o)*(1+.5*bl(r,'fort'));const ratio=g/Math.max(1,a.n*a.q);return 1+bl(r,'fort')+(isCap(r)?1:0)+(TRN(r)[0]===2?1:0)+clamp(Math.floor(ratio*8),0,4);}
// ruta a un destino: por tierra (y estrechos) o por mar si ambos son costeros y es más rápido
function routeFor(a,dest){if(a.r===dest)return {path:[],months:0};const rm=routeMap(a,240);const p=pathFrom(rm,dest);const lm=p?Math.ceil(rm.dist[dest]/2):Infinity;
  if(RG[a.r].co&&RG[dest].co&&(passable(a.o,dest))&&a.n<=navCap(a.o)){const nm=Math.max(1,navalETA(a.r,dest)-(bl(a.r,'puerto')?1:0));if(nm+1<lm)return {sea:{to:dest,eta:nm},months:nm};}
  if(!p)return null;return {path:p,months:lm};}

/* ----- ejércitos ----- */
const perSoldier=nid=>{const d=N0[nid]||N0[G.regions[capitalOf(nid)].w0];return Math.max(4000,d.milx/Math.max(1000,d.milp));};
const qualOf=nid=>clamp(Math.pow(perSoldier(nid)/25000,.35),.35,2.2)*(typeof techQ==='function'?techQ(nid):1);
const fieldOf=nid=>{const n=G.nations[nid],d=N0[nid];if(!d)return 20000;return Math.max(2000,d.milp*.6*(n.army/Math.max(1.5,armyIdx(d.milx))));};
const armiesOf=nid=>(G.armies||[]).filter(a=>a.o===nid);
const soldiersOf=nid=>armiesOf(nid).reduce((s,a)=>s+a.n,0);
const armyStr=a=>a.n*a.q*(.35+.65*a.m)*(.5+.5*a.s);
function mpCap(n){return n.pop*(isReal()?.012:.02);}
function ensureMP(n){if(n.mp==null)n.mp=mpCap(n)*.5;}
function newArmy(nid,r,n,o){const a={id:G.aid++,o:nid,r,n:Math.round(n),max:Math.round(n),m:o&&o.m!=null?o.m:1,s:1,q:qualOf(nid),path:[],from:null};if(o&&o.train)a.train=o.train;G.armies.push(a);return a;}
function spawnArmies(nid,foe){const n=G.nations[nid];if(!n||!n.alive)return;const tot=fieldOf(nid);ensureMP(n);
  const k=clamp(Math.round(tot/70000),1,isReal()?6:5);const rs=regionsOf(nid);if(!rs.length)return;const cap=capitalOf(nid);
  let spots=[];if(foe){const fr=new Set(regionsOf(foe));spots=rs.filter(r=>RG[r].adj.some(x=>fr.has(x))||seaAdj(r).some(x=>fr.has(x))).sort((x,y)=>G.regions[y].pop-G.regions[x].pop);}
  if(!spots.length)spots=rs.slice().sort((x,y)=>G.regions[y].pop-G.regions[x].pop);
  const uniq=[];if(k>=3&&cap)uniq.push(cap);spots.forEach(r=>{if(!uniq.includes(r))uniq.push(r);});
  for(let i=0;i<k;i++)newArmy(nid,uniq[i%uniq.length],tot/k);
  n.fs0=soldiersOf(nid);n.ar0=n.army;n._as=n.army;}
function syncArmyIdx(nid){const n=G.nations[nid];if(!n||!n.fs0)return;const t=soldiersOf(nid);n.army=clamp(n.ar0*t/n.fs0,1.5,100);n._as=n.army;}
function rescaleArmies(nid){const n=G.nations[nid];if(!n||!n._as)return;const f=n.army/n._as;if(Math.abs(f-1)<.01)return;armiesOf(nid).forEach(a=>{a.n*=f;a.max*=f;});n.fs0=n.fs0||soldiersOf(nid);n._as=n.army;}
function removeArmiesOf(nid){if(!G.armies)return;G.armies=G.armies.filter(a=>a.o!==nid);}

/* ----- entrar y salir del modo Mando ----- */
function startMando(w){w.mando=true;w.bat=clamp((w.score||0)*.5,-35,35);[w.a,w.b].forEach(x=>{if(!armiesOf(x).length)spawnArmies(x,enemyIn(w,x));armiesOf(x).forEach(a=>{if(!a.man)a.auto=true;});});
  if(P&&isGeneral(P)&&!G.armies.some(a=>a.id===P.lead)){const mine=armiesOf(natOf(P).id).sort((x,y)=>y.n-x.n);P.lead=mine.length?mine[0].id:null;}
  updateScore(w);}
function endMando(w){w.mando=false;[w.a,w.b].forEach(x=>{for(const r in G.occ)if(G.occ[r]===x&&(G.regions[r].o===w.a||G.regions[r].o===w.b))delete G.occ[r];});}
function syncMando(){if(!G)return;ensureV07();const me=cmdNat();if(P&&P.dip==null)P.dip=3;
  if(me&&!armiesOf(me).length)spawnArmies(me,null);G.wars.forEach(w=>{if(!w.mando)startMando(w);});
  const keep=new Set();if(me)keep.add(me);G.wars.forEach(w=>{if(w.mando){keep.add(w.a);keep.add(w.b);}});
  if(G.armies.some(a=>!keep.has(a.o)))G.armies=G.armies.filter(a=>keep.has(a.o));
  if(P&&isGeneral(P)&&!G.armies.some(a=>a.id===P.lead)){const mine=armiesOf(natOf(P).id).sort((x,y)=>y.n-x.n);P.lead=mine.length?mine[0].id:null;}}
// en paz: reubicar un ejército dentro de tu territorio es inmediato
function redeploy(a,dest){if(G.regions[dest].o!==a.o||ctrlOf(dest)!==a.o)return 'Solo puedes reubicar dentro de tu territorio.';const rm=routeMap(a,400);if(rm.dist[dest]==null)return 'No hay paso por tierra hasta ahí.';a.r=dest;a.path=[];a.from=null;return `Ejército reubicado en ${RG[dest].nm}.`;}
function orderMove(a,dest){if(!mandoActive())return redeploy(a,dest);const r=routeFor(a,dest);
  if(!r){if(RG[a.r].co&&RG[dest].co&&a.n>navCap(a.o))return `Tu marina solo transporta ${fmtK(navCap(a.o))} soldados: divide el ejército para embarcarlo.`;if(!RG[a.r].co&&RG[dest].co)return 'Sin ruta por tierra. Lleva el ejército a una provincia costera para embarcarlo.';return 'No hay ruta: necesitas acceso militar o estar en guerra con ese país.';}
  if(typeof orderCost==='function'&&a.o===cmdNat()){const c=orderCost(a,r);if(G.mpt==null)G.mpt=mptMax(a.o);if(G.mpt<c)return `Sin puntos de movimiento este mes (tienes ${G.mpt}, la orden cuesta ${c}).`;G.mpt-=c;}
  a.path=r.path||[];a.nav=r.sea||null;a.auto=false;a.man=1;return r.sea?`Embarca hacia ${RG[dest].nm}: llega en ${r.months} mes(es).`:`En marcha hacia ${RG[dest].nm}: ${r.months} mes(es).`;}

/* ----- marcador de guerra por ocupación ----- */
function occScore(by,owner){const rs=regionsOf(owner);if(!rs.length)return 0;let pop=0;rs.forEach(r=>pop+=G.regions[r].pop);const cap=capitalOf(owner);let s=0;
  rs.forEach(r=>{if(G.occ[r]===by)s+=70*G.regions[r].pop/Math.max(1,pop)+30/rs.length+(r===cap?15:0);});return s;}
function updateScore(w){w.score=clamp(occScore(w.a,w.b)-occScore(w.b,w.a)+(w.bat||0),-100,100);}
const occBy=(by,owner)=>regionsOf(owner).filter(r=>G.occ[r]===by);

/* ----- un mes de guerra ----- */
function armyIndex(){const m={};G.armies.forEach(a=>{if(a.sea)return;(m[a.r]||(m[a.r]=[])).push(a);});return m;}
function supF(nid,foe){const w=warBetween(nid,foe);if(!w)return 1;return 1+Math.min(.35,allyPower(nid,w)/Math.max(1,power(nid)+power(foe))*.5);}
function mcap(nid){const n=G.nations[nid];let c=(isReal()?clamp(.55+n.stab/220,.6,1):1)-(typeof natEx==='function'?natEx(nid)/250:0);if(playerRules(nid)&&(n.treas||0)<0)c=Math.min(c,.6);return c;}
function friendlyDist(nid,src,lim){if(friendlyCtrl(nid,src))return 0;const seen=new Set([src]);let fr=[src];
  for(let d=1;d<=lim;d++){const nx=[];for(const r of fr){for(const x of RG[r].adj.concat(seaAdj(r))){if(seen.has(x)||!G.regions[x])continue;if(friendlyCtrl(nid,x))return d;seen.add(x);nx.push(x);}}fr=nx;if(!fr.length)break;}return lim+1;}
function retreatSpot(a,bad){const opts=RG[a.r].adj.concat(seaAdj(a.r)).filter(x=>G.regions[x]&&passable(a.o,x)&&!bad(x));
  const fr=opts.filter(x=>friendlyCtrl(a.o,x));if(a.from&&fr.includes(a.from))return a.from;if(fr.length)return fr.sort((x,y)=>G.regions[y].pop-G.regions[x].pop)[0];
  const nh=opts.filter(x=>!hostile(a.o,ctrlOf(x)));return nh[0]||null;}
function fight(r,A,D,rep){const pw=(arr,def)=>arr.reduce((s,a)=>s+armyStr(a)*(a.amph&&!def?.7:1)*(def&&typeof homeB==='function'?homeB(a,r):1),0);const nA=A.reduce((s,a)=>s+a.n,0),nD=D.reduce((s,a)=>s+a.n,0);
  const oa=A[0].o,od=D[0].o;const fort=G.regions[r].o===od?bl(r,'fort'):0;
  const gA=bigOf(A),gD=bigOf(D);
  const pa=pw(A)*supF(oa,od)*R(.85,1.15)*genMul(gA,0,r),pd=pw(D,1)*supF(od,oa)*R(.85,1.15)*(1.1+.25*fort+(isCap(r)&&G.regions[r].o===od?.1:0)+(G.regions[r].o===od?.1*bl(r,'torre'):0))*terrDef(r)*genMul(gD,1,r);
  const ratio=pa/(pa+pd),k=isReal()?.08:.11;
  const lA=Math.min(nA*k*2*(1-ratio)*R(.8,1.2),nA*.7),lD=Math.min(nD*k*2*ratio*R(.8,1.2),nD*.7);
  A.forEach(a=>a.n-=lA*a.n/nA);D.forEach(a=>a.n-=lD*a.n/nD);G._loss=G._loss||{};G._loss[oa]=(G._loss[oa]||0)+lA;G._loss[od]=(G._loss[od]||0)+lD;
  const winA=ratio>=.5,W=winA?A:D,L=winA?D:A,sw=Math.abs(ratio-.5)*2;
  W.forEach(a=>a.m=Math.min(mcap(a.o),a.m+.05));L.forEach(a=>a.m=Math.max(0,a.m-(.18+.3*sw)));
  const lo=L[0].o,wo=W[0].o;const up=genWin(winA?gA:gD);
  logBattle({y:G.year,m:G.month%12,r,a:oa,d:od,na:Math.round(nA),nd:Math.round(nD),la:Math.round(lA),ld:Math.round(lD),w:wo,ga:genOf(gA).n+' ('+TRAITS[genOf(gA).t].n+')',gd:genOf(gD).n+' ('+TRAITS[genOf(gD).t].n+')',t:terrName(r),amph:A.some(a=>a.amph)?1:0,up:up?genOf(winA?gA:gD).n:0});const bad=x=>(G._idx[x]||[]).some(y=>hostile(lo,y.o)&&y.n>0);
  L.forEach(a=>{if(a.n<300||a.m<.05){a.n=0;return;}const s=retreatSpot(a,bad);if(!s){a.n=0;a.cap=1;return;}a.from=a.r;a.r=s;a.path=[];a.nav=null;});
  const w=warBetween(oa,od);if(w){const lost=winA?lD:lA,tot=Math.max(1,soldiersOf(lo)+lost);const pts=clamp(3+12*lost/tot,3,15);w.bat=clamp((w.bat||0)+(wo===w.a?pts:-pts),-35,35);}
  const me=P&&P.alive?natOf(P).id:null;const mine=oa===me||od===me;
  const txt=`Batalla en ${RG[r].nm}: ${G.nations[wo].name} vence a ${G.nations[lo].name}. Bajas ${fmtK(winA?lA:lD)} contra ${fmtK(winA?lD:lA)}.`;
  rep.push({t:txt,c:mine?(wo===me?'good':'bad'):'news',big:mine,r});
  if(mine&&P&&isGeneral(P)){const led=A.concat(D).find(a=>a.id===P.lead);if(led){if(wo===me){P.s.influencia+=2;}else{P.s.influencia-=1;if(chance(isReal()?.03:.015)){P.s.salud=0;P.deathCause='en combate, al frente de sus tropas';}else if(chance(.1)){P.s.salud-=10;rep.push({t:'Te hieren durante la batalla.',c:'bad',big:1});}}}}
  return winA;}
function occupy(r,by,rep){const o=G.regions[r].o;const me=P&&P.alive?natOf(P).id:null;
  if(o===by||friendsOf(by).has(o)){delete G.occ[r];rep.push({t:`${G.nations[by].name} libera ${RG[r].nm}.`,c:o===me||by===me?'good':'news',big:o===me||by===me,r});return;}
  G.occ[r]=by;if(isCap(r)){G.nations[o].stab=clamp(G.nations[o].stab-8,0,100);}
  rep.push({t:`${G.nations[by].name} ocupa ${RG[r].nm}${isCap(r)?' (capital)':''}.`,c:by===me?'good':o===me?'bad':'news',big:by===me||o===me,r});}

/* ----- IA de ejércitos ----- */
function aiOrders(nid,onlyAuto){const mine=armiesOf(nid).filter(a=>!a.sea&&!(a.train>0)&&(!onlyAuto||a.auto));if(!mine.length)return;
  const foes=new Set(warsOf(nid).filter(w=>w.mando).map(w=>enemyIn(w,nid)));if(!foes.size)return;
  const idx=G._idx||armyIndex();const fpop={};foes.forEach(f=>{let s=0;regionsOf(f).forEach(r=>s+=G.regions[r].pop);fpop[f]=Math.max(1,s);});
  const myPop=Math.max(1,regionsOf(nid).reduce((s,r)=>s+G.regions[r].pop,0));const claim={};
  const strAt=(r,pred)=>(idx[r]||[]).filter(pred).reduce((s,a)=>s+armyStr(a),0);
  mine.sort((x,y)=>y.n-x.n).forEach(a=>{
    if(a.path&&a.path.length&&a.s>=.35&&((G.month||0)+a.id)%3!==0)return; // en marcha: recalcula cada 3 meses
    if(a.s<.35&&!friendlyCtrl(nid,a.r)){const rm=routeMap(a,12);let b=null,bd=1e9;for(const r in rm.dist)if(friendlyCtrl(nid,r)&&rm.dist[r]<bd){bd=rm.dist[r];b=r;}if(b){a.path=pathFrom(rm,b);return;}}
    const rm=routeMap(a,isReal()?14:16);let best=null,bv=0;const my=armyStr(a);
    for(const r in rm.dist){const d=rm.dist[r];const ctl=ctrlOf(r),own=G.regions[r].o;let v=0;
      const es=strAt(r,x=>hostile(nid,x.o));const fs=strAt(r,x=>x.o===nid&&x!==a);
      if(es>0){if(my+fs>es*1.15)v=60+Math.min(40,es/Math.max(1,my)*25);else if(own===nid&&my+fs>es*.75)v=45;else continue;}
      else if(foes.has(ctl)||(own===nid&&G.occ[r]&&foes.has(G.occ[r]))){v=own===nid?55+70*G.regions[r].pop/myPop:18+110*G.regions[r].pop/(fpop[own]||1e12);if(isCap(r))v+=own===nid?60:45;if(r===a.r)v+=40;}
      else continue;
      const sc=v/(1+d*.55)-(claim[r]||0)*12;if(sc>bv){bv=sc;best=r;}}
    if(best){claim[best]=(claim[best]||0)+1;a.path=best===a.r?[]:pathFrom(rm,best);a.nav=null;return;}
    // sin objetivo por tierra: desembarco en la costa enemiga
    if(RG[a.r].co&&!a.nav){let tb=null,tv=0;foes.forEach(f=>regionsOf(f).forEach(r=>{if(!RG[r].co||G.occ[r]===nid)return;const v=(G.regions[r].pop/fpop[f]+(isCap(r)?.3:0))/navalETA(a.r,r);if(v>tv){tv=v;tb=r;}}));
      if(tb&&a.n>3000&&a.n<=navCap(nid)&&chance(.6)){a.nav={to:tb,eta:navalETA(a.r,tb)};a.path=[];}}
    else if(!friendlyCtrl(nid,a.r)&&!a.path.length){}});}
function aiReinforce(nid){const n=G.nations[nid];ensureMP(n);if(playerRules(nid))return;
  if(soldiersOf(nid)<fieldOf(nid)*.5&&n.mp>5000&&chance(.25)){const cap=capitalOf(nid);if(cap&&ctrlOf(cap)===nid){const add=Math.min(n.mp*.3,fieldOf(nid)*.25);if(add>2000){n.mp-=add;newArmy(nid,cap,add,{m:.5,train:isReal()?2:1});n.fs0=(n.fs0||0);}}}}

/* ----- el mes ----- */
function monthTick(auto){ensureV07();const rep=[];const wars=mandoWars();const me=cmdNat();G._loss={};if(me&&typeof mptMax==='function')G.mpt=mptMax(me);
  if(!wars.length){G.month=(G.month||0)+1;return {rep,yearEnd:G.month>=12};}
  const sides=new Set();wars.forEach(w=>{sides.add(w.a);sides.add(w.b);});
  G._idx=armyIndex();
  sides.forEach(nid=>{if(nid===me&&!auto)aiOrders(nid,true);else aiOrders(nid,false);aiReinforce(nid);});
  // movimiento
  G.armies.forEach(a=>{a.amph=0;if(a.train>0){a.train--;return;}
    if(a.nav&&!a.sea){a.sea=a.nav;a.sea.t=a.sea.eta;a.nav=null;a.path=[];a.from=a.r;}
    if(a.sea){a.sea.eta--;if(a.sea.eta<=0){a.r=a.sea.to;a.amph=1;a.sea=null;}return;}
    let mp=genOf(a).t==='ve'?3:2;const hostAt=r=>(G._idx[r]||[]).some(x=>hostile(a.o,x.o));
    while(a.path&&a.path.length&&mp>0){const nx=a.path[0];if(!G.regions[nx]||!passable(a.o,nx)){a.path=[];break;}
      const st=seaAdj(a.r).includes(nx)&&!RG[a.r].adj.includes(nx);const c=stepCost(a.o,a.r,nx,st);if(c>mp&&mp<2)break;
      mp-=c;a.from=a.r;a.r=nx;a.path.shift();if(st)a.amph=1;if(hostAt(nx)||hostile(a.o,ctrlOf(nx)))break;}});
  G._idx=armyIndex();
  // batallas
  for(const r in G._idx){for(let it=0;it<3;it++){const L=(G._idx[r]||[]).filter(a=>a.n>0&&a.r===r&&!a.sea);let A=null,D=null;
      for(const x of L){const e=L.find(y=>hostile(x.o,y.o));if(e){const c=ctrlOf(r);const xd=x.o===c||friendsOf(x.o).has(c);const sx=L.filter(y=>y.o===x.o),se=L.filter(y=>y.o===e.o);if(xd){D=sx;A=se;}else{D=se;A=sx;}break;}}
      if(!A)break;fight(r,A,D,rep);G._idx=armyIndex();}}
  G.armies=G.armies.filter(a=>{if(a.n<300){if(a.o===me)rep.push({t:(a.cap?`Tu ejército de ${RG[a.r].nm} queda destruido (rodeado, se rinde).`:`Tu ejército de ${RG[a.r].nm} queda destruido.`),c:'bad',big:1});return false;}return true;});
  G._idx=armyIndex();
  // asedios y ocupación
  const besieged=new Set();
  G.armies.forEach(a=>{if(a.sea||a.train>0)return;const r=a.r;if((G._idx[r]||[]).some(x=>hostile(a.o,x.o)))return;const c=ctrlOf(r);if(!hostile(a.o,c))return;
    if(besieged.has(r))return;besieged.add(r);const s=G.sg[r]&&G.sg[r].by===a.o?G.sg[r]:(G.sg[r]={by:a.o,t:0});s.t++;
    const g=garOf(r);if(g>0)a.n-=Math.min(a.n*.03,g*qualOf(G.regions[r].o)*.12);
    if(s.t>=siegeNeed(r,a)){delete G.sg[r];occupy(r,a.o,rep);}});
  for(const r in G.sg)if(!besieged.has(r))delete G.sg[r];
  // abastecimiento, desgaste, moral, refuerzos
  G.armies.forEach(a=>{if(a.sea){a.n*=.996;return;}const gt=genOf(a).t;const d=friendlyDist(a.o,a.r,6);const dep=[a.r].concat(RG[a.r].adj).some(x=>bl(x,'sumi')&&friendlyCtrl(a.o,x));const tgt=d===0||dep?1:clamp(1-.17*d+(gt==='lo'?.1:0),.25,1);a.s+=(tgt-a.s)*.55;
    const cap=Math.max(15000,G.regions[a.r].pop*.04),over=a.n>cap?(a.n-cap)/a.n*.03:0;
    a.n-=a.n*((isReal()?.004:.002)+(1-a.s)*(isReal()?.05:.03)+over+terrAttr(a.r))*(gt==='lo'?.65:1);
    const mc=mcap(a.o);a.m=clamp(a.m+(d===0?.1:.03)*(gt==='ca'?2:1)-(a.s<.4?.05:0),0,mc);
    const n=G.nations[a.o];ensureMP(n);if(d===0&&G.regions[a.r].o===a.o&&a.n<a.max&&n.mp>0){const add=Math.min(a.max*.06,a.max-a.n,n.mp);a.n+=add;n.mp-=add;}});
  sides.forEach(syncArmyIdx);
  exhaustionTick(wars);G._idx=armyIndex();guerrillaTick(rep);if(typeof mobilizeTick==='function')mobilizeTick(wars,rep);aiExhaustPeace(wars,rep);
  // marcadores, capitulación, ofertas
  wars.forEach(w=>{if(!G.wars.includes(w))return;updateScore(w);
    for(const [win,lose] of [[w.a,w.b],[w.b,w.a]]){const rs=regionsOf(lose);if(!rs.length)continue;const cap=capitalOf(lose);const sc=win===w.a?w.score:-w.score;
      if(typeof capitCheck==='function'?capitCheck(w,win,lose,sc):(rs.every(r=>hostile(lose,ctrlOf(r)))||(G.occ[cap]===win&&sc>=85))){capitulate(w,win,lose,rep);break;}}
    if(!G.wars.includes(w)||G.offer)return;const mine=playerRules(w.a)?w.a:playerRules(w.b)?w.b:null;if(!mine)return;
    const foe=enemyIn(w,mine),s=mine===w.a?w.score:-w.score,tm=G.year*12+G.month;if(w.offT&&tm<w.offT)return;
    const fe=exOf(w,foe);if(fe>=60&&s>=-15&&s<45&&chance(.1)){G.offer={kind:s>=15&&occBy(mine,foe).length?'cede':'white',foe,rs:s>=15?occBy(mine,foe):[],war:pk(w.a,w.b)};w.offT=tm+5;}
    else if(s>=45&&chance(.12+(s-45)/250)){const rs=occBy(mine,foe);if(rs.length){G.offer={kind:'cede',foe,rs,war:pk(w.a,w.b)};w.offT=tm+4;}}
    else if(s<=-50&&chance(.15)){const rs=occBy(foe,mine);if(rs.length){G.offer={kind:'demand',foe,rs,war:pk(w.a,w.b)};w.offT=tm+4;}}
    else if(w.years>=2&&Math.abs(s)<30&&chance(.07)){G.offer={kind:'white',foe,rs:[],war:pk(w.a,w.b)};w.offT=tm+6;}});
  G.month=(G.month||0)+1;G._idx=null;
  if(P&&P.alive){rep.forEach(x=>{if(x.big)log(`${MES[(G.month-1)%12]}: ${x.t}`,x.c);});fix(P);if(P.s.salud<=0)die(P.deathCause||'en combate');}
  return {rep,yearEnd:G.month>=12};}
function capitulate(w,win,lose,rep){const me=P&&P.alive?natOf(P).id:null;
  if(playerRules(win)){G.offer={kind:'capit',foe:lose,rs:[],war:pk(w.a,w.b)};return;}
  w.win=win;const rs=occBy(win,lose);rs.forEach(r=>transfer(r,win));if(playerRules(win)||(P&&P.alive&&natOf(P).id===win&&isGeneral(P)))P.s.influencia+=10;
  rep.push({t:`${G.nations[lose].name} capitula ante ${G.nations[win].name} y cede ${rs.length} provincia(s).`,c:win===me?'good':lose===me?'bad':'news',big:win===me||lose===me});
  pushNews(`${G.nations[lose].name} capitula y cede ${rs.length} provincia(s) a ${G.nations[win].name}.`,lose===me?'bad':'news');
  checkGone(lose);if(G.wars.includes(w))makePeace(w,true);}
const warByKey=k=>G.wars.find(w=>pk(w.a,w.b)===k);
function acceptOffer(){const o=G.offer;G.offer=null;if(!o)return '';const w=warByKey(o.war);if(!w)return '';const me=natOf(P).id;
  if(o.kind==='cede'){w.win=me;const rs=o.rs.filter(r=>G.regions[r].o===o.foe);rs.forEach(r=>transfer(r,me));checkGone(o.foe);if(G.wars.includes(w))makePeace(w,true);natOf(P).stab+=2;flushNews();return `Firmas la paz con ${G.nations[o.foe].name}: te cede ${rs.length} provincia(s) ocupada(s).`;}
  if(o.kind==='demand'){w.win=o.foe;const rs=o.rs.filter(r=>G.regions[r].o===me);rs.forEach(r=>transfer(r,o.foe));if(G.wars.includes(w))makePeace(w,true);natOf(P).stab-=4;flushNews();return `Firmas la paz con ${G.nations[o.foe].name} y cedes ${rs.length} provincia(s).`;}
  if(o.kind==='white'){makePeace(w,true);natOf(P).stab+=3;flushNews();return `Firmas una paz blanca con ${G.nations[o.foe].name}: cada quien conserva su territorio.`;}
  return '';}
function rejectOffer(){const o=G.offer;G.offer=null;return o?`Rechazas la propuesta de ${G.nations[o.foe].name}. La guerra continúa.`:'';}
// paz decidida por la IA en guerras con Mando (cuando eres General y no gobiernas)
function mandoAIPeace(w){const win=w.score>=0?w.a:w.b,lose=enemyIn(w,win);if(Math.abs(w.score)>=25){w.win=win;const rs=occBy(win,lose);rs.forEach(r=>transfer(r,win));if(rs.length)pushNews(`Paz: ${G.nations[lose].name} cede ${rs.length} provincia(s) ocupada(s) a ${G.nations[win].name}.`);checkGone(lose);}
  if(G.wars.includes(w))makePeace(w);}

/* ----- ganchos del motor ----- */
function onPeace(w){if(!G.occ)return;if(!w.link&&typeof settleLinked==='function')settleLinked(w);for(const r in G.occ){const o=G.regions[r].o,c=G.occ[r];if((o===w.a&&c===w.b)||(o===w.b&&c===w.a))delete G.occ[r];}
  for(const r in G.sg)delete G.sg[r];
  [w.a,w.b].forEach(x=>armiesOf(x).forEach(a=>{if(!friendlyCtrl(x,a.r)||a.sea){a.sea=null;a.nav=null;const cap=capitalOf(x);if(cap){const near=regionsOf(x).filter(r=>ctrlOf(r)===x).sort((p,q)=>mapDist(p,a.r)-mapDist(q,a.r))[0];a.r=near||cap;}}a.path=[];}));
  if(G.offer&&G.offer.war===pk(w.a,w.b))G.offer=null;syncMando();}
function onGone(nid){removeArmiesOf(nid);touchDip();if(!G.dip)return;const D=G.dip;for(const k in D.nap)if(k.split('|').includes(nid))delete D.nap[k];
  for(const k in D.acc)if(k.split('>').includes(nid))delete D.acc[k];for(const k in D.guar)if(k.split('>').includes(nid))delete D.guar[k];
  delete D.vas[nid];for(const v in D.vas)if(D.vas[v]===nid)delete D.vas[v];for(const r in G.occ)if(G.occ[r]===nid)delete G.occ[r];}
function aiMayAttack(a,b){if(!G.dip)return true;if(napOf(a,b))return false;if(overlordOf(a)===b||overlordOf(b)===a)return false;
  const me=P&&P.alive?natOf(P).id:null;if(!me)return true;
  if(b===me&&opOf(a)>40&&chance(.7))return false;
  const prot=overlordOf(b)===me||guarBy(me,b);if(prot&&power(me)>power(a)*.8&&chance(.8))return false;return true;}
function onWarDeclared(a,b){ensureV07();const w0=warBetween(a,b);if(w0&&!w0.mando)startMando(w0);if(w0&&typeof callCoalition==='function')callCoalition(w0);const me=P&&P.alive?natOf(P).id:null;if(!me||a===me||b===me)return;if(G.calls.some(c=>c.ally===b&&c.foe===a))return;
  const prot=overlordOf(b)===me?'vas':guarBy(me,b)?'guar':null;if(!prot)return;
  if(playerRules(me)){G.calls.push({kind:prot,ally:b,foe:a});return;}
  if(chance(.6)){declareWar(me,a);pushNews(`${G.nations[me].name} entra a la guerra para defender a ${G.nations[b].name}.`);}}
function answerCall(i,join){const c=G.calls.splice(i,1)[0];if(!c)return '';const me=natOf(P).id,n=natOf(P);
  if(!G.nations[c.foe].alive||!G.nations[c.ally].alive)return '';
  if(join){const main=warBetween(c.foe,c.ally);if(!warBetween(me,c.foe)){if(main)joinWar(me,c.foe,main,c.ally);else declareWar(me,c.foe);}addOp(c.ally,20);syncMando();flushNews();return `Cumples tu palabra: ${n.name} entra a la guerra contra ${G.nations[c.foe].name} para defender a ${G.nations[c.ally].name}.`;}
  n.stab-=5;if(isReal())n.approval-=4;Object.keys(G.nations).forEach(t=>{if(t!==me&&G.nations[t].alive)addOp(t,-6);});
  if(c.kind==='guar')delete G.dip.guar[me+'>'+c.ally];else if(c.kind==='ally'){n.allies=n.allies.filter(x=>x!==c.ally);G.nations[c.ally].allies=G.nations[c.ally].allies.filter(x=>x!==me);addOp(c.ally,-30);}else{delete G.dip.vas[c.ally];}touchDip();
  return `No acudes a defender a ${G.nations[c.ally].name}. ${c.kind==='vas'?'Tu vasallo se declara libre de tu tutela.':c.kind==='ally'?'La alianza se rompe.':'Retiras tu garantía.'} Tu palabra pierde peso en el mundo.`;}

/* ----- diplomacia (acciones del gobernante) ----- */
function dipOdds(k,t){const me=natOf(P).id,o=opOf(t),pr=power(me)/Math.max(1,power(t));
  switch(k){case 'ally':return clamp(.12+o/140+(pr>1?.12:0)+P.s.influencia/500,.03,.92);
   case 'nap':return clamp(.35+o/120+(pr>1.3?.15:0),.05,.95);
   case 'acc':return clamp(.2+o/100+(pr>2?.1:0),.03,.9);
   case 'ultp':return clamp((pr-1.5)*.22+o/300,0,.9);
   case 'ultv':return clamp((pr-3)*.13+o/300,0,.75);
   default:return 1;}}
function dipActionsBase(t){const me=natOf(P).id,T=G.nations[t],n=natOf(P);const a=[],ok=P.ruler&&P.alive&&!P.event&&(P.dip||0)>0&&T.alive;
  const add=(k,txt,s,can,fn)=>a.push({k,t:txt,s,can:ok&&can,fn});const pc=k=>Math.round(dipOdds(k,t)*100)+' %';
  const war=warBetween(me,t),ally=n.allies.includes(t),nap=napOf(me,t),acc=accessOK(me,t),gu=guarBy(me,t),vas=overlordOf(t)===me,over=overlordOf(me)===t;
  const imp=G.dip.imp[t]===G.year;
  add('imp','Mejorar relaciones','Embajada y visitas oficiales · +opinión',!war&&!imp,()=>{const d=RI(10,18);addOp(t,d);G.dip.imp[t]=G.year;return `Mejoran las relaciones con ${T.name} (+${d}).`;});
  if(!war&&!vas){if(!ally)add('ally','Proponer alianza',`Probabilidad ${pc('ally')} · sus fuerzas te apoyan en guerra`,true,()=>{if(chance(dipOdds('ally',t))){n.allies.push(t);T.allies.push(me);addOp(t,8);return `${T.name} acepta la alianza.`;}addOp(t,-3);return `${T.name} rechaza la alianza.`;});
   else add('unally','Romper la alianza','Pierdes su apoyo · −opinión',true,()=>{n.allies=n.allies.filter(x=>x!==t);T.allies=T.allies.filter(x=>x!==me);addOp(t,-25);return `Rompes la alianza con ${T.name}.`;});}
  if(!war&&!nap&&!vas)add('nap','Pacto de no agresión (10 años)',`Probabilidad ${pc('nap')} · no podrán atacarse sin romperlo`,true,()=>{if(chance(dipOdds('nap',t))){G.dip.nap[pk(me,t)]=G.year+10;addOp(t,6);return `Firmas un pacto de no agresión con ${T.name} hasta ${G.year+10}.`;}return `${T.name} no quiere comprometerse.`;});
  if(!war&&!acc&&!vas)add('acc','Pedir acceso militar',`Probabilidad ${pc('acc')} · tus ejércitos pueden cruzar su territorio`,true,()=>{if(chance(dipOdds('acc',t))){G.dip.acc[t+'>'+me]=1;return `${T.name} te concede acceso militar.`;}addOp(t,-2);return `${T.name} niega el paso a tus tropas.`;});
  if(acc)add('unacc','Renunciar al acceso militar','',true,()=>{delete G.dip.acc[t+'>'+me];return `Renuncias al acceso militar en ${T.name}.`;});
  if(!war&&!gu&&!vas&&!over)add('guar','Garantizar su independencia','Siempre aceptan · si alguien los ataca, te llamarán a defenderlos',true,()=>{G.dip.guar[me+'>'+t]=1;addOp(t,15);return `Garantizas la independencia de ${T.name}.`;});
  if(gu)add('unguar','Retirar la garantía','−opinión',true,()=>{delete G.dip.guar[me+'>'+t];addOp(t,-15);return `Retiras tu garantía a ${T.name}.`;});
  if(!war&&!vas&&!over&&!nap&&canReach(me,t)){const prov=ultProvince(me,t);
    if(prov)add('ultp',`Ultimátum: exigir ${RG[prov].nm}`,`Aceptan: ${pc('ultp')} · si se niegan, ganas motivo de guerra (declararla no baja la estabilidad)`,true,()=>{if(chance(dipOdds('ultp',t))){transfer(prov,me);checkGone(t);addOp(t,-30);flushNews();return `${T.name} cede ${RG[prov].nm} ante tu ultimátum.`;}G.dip.cb[t]=G.year+1;addOp(t,-20);return `${T.name} rechaza el ultimátum. Tienes motivo de guerra hasta ${G.year+1}.`;});
    add('ultv','Ultimátum: exigir vasallaje',`Aceptan: ${pc('ultv')} · el vasallo paga tributo y lucha a tu lado`,true,()=>{if(chance(dipOdds('ultv',t))){makeVassal(t,me);addOp(t,-15);return `${T.name} acepta ser tu vasallo.`;}G.dip.cb[t]=G.year+1;addOp(t,-20);return `${T.name} rechaza el vasallaje. Tienes motivo de guerra hasta ${G.year+1}.`;});}
  if(vas){const yrs=G.year-(G.dip.vy&&G.dip.vy[t]||G.year);add('integ','Integrar al vasallo',`Anexas todo su territorio · requiere 5 años de vasallaje (llevas ${yrs}) y opinión 40+`,yrs>=5&&opOf(t)>=40,()=>{regionsOf(t).slice().forEach(r=>transfer(r,me));delete G.dip.vas[t];checkGone(t);n.stab-=3;flushNews();return `Integras a ${T.name} a tu nación.`;});
    add('free','Liberar al vasallo','+opinión',true,()=>{delete G.dip.vas[t];addOp(t,30);return `${T.name} vuelve a ser independiente.`;});}
  return a;}
function ultProvince(me,t){const mine=new Set(regionsOf(me));const c=regionsOf(t).filter(r=>r!==capitalOf(t)&&(RG[r].adj.some(x=>mine.has(x))||seaAdj(r).some(x=>mine.has(x))));return c.sort((x,y)=>G.regions[y].pop-G.regions[x].pop)[0]||null;}
function makeVassal(t,me){ensureV07();touchDip();G.dip.vas[t]=me;(G.dip.vy||(G.dip.vy={}))[t]=G.year;const T=G.nations[t];T.allies=T.allies.filter(x=>x!==me);const n=G.nations[me];n.allies=n.allies.filter(x=>x!==t);
  G.wars.filter(w=>(w.a===t||w.b===t)).forEach(w=>{if(enemyIn(w,t)===me)makePeace(w,true);});}
function canDeclare(t){const me=natOf(P).id;return canReach(me,t)&&!warBetween(me,t)&&overlordOf(t)!==me&&overlordOf(me)!==t;}
function warPenalty(t){const me=natOf(P).id;const cb=G.dip&&G.dip.cb[t]>=G.year;const nap=napOf(me,t);return {cb,nap};}

/* ----- reclutamiento (gobernante) ----- */
function recruitOpts(rid){const me=natOf(P).id,n=natOf(P);ensureMP(n);const f=fieldOf(me);const unit=Math.max(2000,Math.round(f/12/1000)*1000);const c=perSoldier(me)*.5;
  return [1,3,8].map(k=>{const s=unit*k;return {s,cost:s*c,ok:P.ruler&&(n.treas||0)>=s*c&&n.mp>=s&&ctrlOf(rid)===me&&G.regions[rid].o===me};});}
function recruit(rid,s,cost){const me=natOf(P).id,n=natOf(P);n.treas-=cost;n.mp-=s;if(!n.fs0){n.fs0=soldiersOf(me)||s;n.ar0=n.army;}
  const ex=G.armies.find(a=>a.o===me&&a.r===rid&&!a.sea);if(ex){const m=(ex.m*ex.n+(isReal()?.4:.7)*s)/(ex.n+s);ex.n+=s;ex.max+=s;ex.m=m;}else{const na=newArmy(me,rid,s,{m:isReal()?.4:.7,train:isReal()?2:1});na.q*=1+.05*bl(rid,'armeria');}
  syncArmyIdx(me);return `Reclutas ${fmtK(s)} soldados en ${RG[rid].nm} (${fmt(cost)} del tesoro).`;}
function disband(a){const n=G.nations[a.o];ensureMP(n);n.mp=Math.min(mpCap(n),n.mp+a.n*.8);G.armies=G.armies.filter(x=>x!==a);syncArmyIdx(a.o);return `Disuelves el ejército de ${RG[a.r].nm} (${fmtK(a.n)} soldados vuelven a casa).`;}
function splitArmy(a){if(a.n<4000||a.sea)return null;const h=a.n/2;a.n=h;a.max/=2;const b=newArmy(a.o,a.r,h,{m:a.m});b.max=a.max;b.s=a.s;b.q=a.q;return b;}
function mergeAt(rid,nid){const L=G.armies.filter(a=>a.o===nid&&a.r===rid&&!a.sea&&!(a.train>0));if(L.length<2)return null;const m=L[0];
  L.slice(1).forEach(b=>{m.m=(m.m*m.n+b.m*b.n)/(m.n+b.n);m.s=(m.s*m.n+b.s*b.n)/(m.n+b.n);m.n+=b.n;m.max+=b.max;if(P&&P.lead===b.id)P.lead=m.id;});G.armies=G.armies.filter(a=>!L.slice(1).includes(a));return m;}
function upkeepOf(nid){const n=G.nations[nid];if(!n.fs0)return 0;return Math.max(0,soldiersOf(nid)-n.fs0)*perSoldier(nid)*(isReal()?1:.5);}

/* ----- turno anual ----- */
function yearV07(p){ensureV07();const real=isReal();
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;if(n.mp!=null)n.mp=Math.min(mpCap(n),n.mp+n.pop*(real?.002:.004));if(armiesOf(id).length)rescaleArmies(id);}
  for(const r in G.occ){const x=G.regions[r];if(x)x.gdp*=.97;}
  mandoWars().forEach(w=>w.years++);
  const me=p&&p.alive?natOf(p).id:null;
  if(me&&playerRules(me)){const n=G.nations[me];const up=Math.max(0,upkeepOf(me)-(n._milBud||0));if(up>0){n.treas=(n.treas||0)-up;if(n.treas<0)log(`El tesoro no alcanza para pagar a las tropas extra (${fmtN(up)} al año). La moral cae.`,'bad');}
    vassalsOf(me).forEach(v=>{n.treas=(n.treas||0)+treasuryIncome(G.nations[v])*.25;});}
  const D=G.dip;for(const k in D.nap)if(D.nap[k]<=G.year)delete D.nap[k];for(const t in D.cb)if(D.cb[t]<G.year)delete D.cb[t];
  if(me)for(const t in D.op){if(!G.nations[t]||!G.nations[t].alive){delete D.op[t];continue;}D.op[t]+=(opBase(t,me)-D.op[t])*.08;}
  // vasallos que se rebelan
  for(const v in D.vas){const o=D.vas[v];if(!G.nations[v]||!G.nations[v].alive||!G.nations[o]||!G.nations[o].alive){delete D.vas[v];continue;}
    const op=o===me?opOf(v):30;if(op<-30&&power(v)>power(o)*.5&&chance(.2)){delete D.vas[v];declareWar(v,o);pushNews(`${G.nations[v].name} se rebela contra ${G.nations[o].name} y declara su independencia.`,'bad');}}
  // paces militares de la IA: acceso revocado si la opinión es muy mala
  if(me)for(const k in D.acc){const [g,to]=k.split('>');if(to===me&&opOf(g)<-25){delete D.acc[k];log(`${G.nations[g].name} te retira el acceso militar.`,'bad');}}
}
