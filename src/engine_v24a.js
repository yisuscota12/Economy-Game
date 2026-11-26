/* ===================== v2.4a: fase 6 de la ruta 9d (logística), parte 1 — motor =====================
   1) Empresas de transporte como un giro más del sistema de empresas (v1.4/v2.1): el «Transporte de carga» de siempre es la flota
      terrestre y se agregan 🚢 Naviera (solo en provincias con costa) y ✈️ Carga aérea. Se fundan desde «Abrir negocio» y salen en
      «Empresas en venta» (bzmGen elige de BZ). Cada una tiene flota (sucursales × unidades), rutas (flujos reales de la red, abajo)
      y costo operativo (el estado de resultados de siempre). La IA tiene 20 transportistas: 4 de la bolsa (Northern Rail,
      Aérocontinental, Alas Turcas, Aeropuertos del Golfo) y 16 privados ficticios.
   2) Red de envíos: cada año, los países que exportan un recurso (ntRes de la v2.3a, «Exporta») abastecen a los que lo importan
      («Escaso» / «Depende de importaciones»), y dentro de cada país las provincias con cosechas de sobra abastecen a las que no
      se alimentan solas (ntProv). Modo: terrestre si hay camino por tierra (vecinos por tierra a ≤ 4 fronteras y cerca),
      marítimo puerto a puerto si ambos tienen costa, aéreo para el oro o si no hay otra vía. Sin datos externos: costa, puertos
      (edificio «puerto»), capitales y vecinos salen de MAP/RG; la ruta marítima la traza la interfaz sobre el mapa de identificadores.
   3) Efecto económico modesto: el flete de las importaciones de cada país depende de la eficiencia de sus transportistas contra la
      media de su modo (centrado: la media mundial no mueve nada) y de la guerra; entra como causa «nlog» en la salud de Comercio
      minorista e Industria (ponderado por cuánto importa ese país) y en el costo de los insumos importados de tus empresas.
      Retrasos y pérdidas (azar h21, sin Math.random) restan eficiencia al transportista de la IA, o reputación y caja a tu empresa.
   Nada nuevo en la ficha de provincia (packG): todo vive en G.lg y en b.lg de cada empresa tuya. */

/* ---------- 1) giros nuevos ---------- */
const LG_M={ter:{n:'Terrestre',ic:'🚚',u:'camiones',per:12,tc:.05,td:.06,sp:900},mar:{n:'Marítimo',ic:'🚢',u:'buques',per:2,tc:.03,td:.03,sp:1700},aer:{n:'Aéreo',ic:'✈️',u:'aviones de carga',per:1,tc:.10,td:.04,sp:4200}};
(function(){const t=BZ[BZK.transporte];if(t)t.lg='ter';
  BZ.push({k:'naviera',n:'Naviera',ic:'🚢',sec:'trans',gm:.48,L:.14,rs:.03,K:1.8,st:14,oc:'8',in:[['oil',.5]],d:'b2b',mx:8,rc:-1,lg:'mar'},
          {k:'aerocarga',n:'Carga aérea',ic:'✈️',sec:'trans',gm:.5,L:.2,rs:.04,K:1.5,st:10,oc:'3',in:[['oil',.55]],d:'b2b',ed:1,mx:6,rc:-1,lg:'aer'});
  BZ.forEach((b,i)=>BZK[b.k]=i);['naviera','aerocarga'].forEach(k=>{if(!BIZT.some(x=>x.k===k)){const T=BZ[BZK[k]];BIZT.push({n:T.n,ic:T.ic,k});}});
  if(typeof NT_CWB!=='undefined'){NT_CWB.naviera=.35;NT_CWB.aerocarga=.3;}})();
const lgMode=b=>b&&b.v14?bzT(b).lg||null:null;
{const _co=bzCanOpen;bzCanOpen=function(p,k,r){const e=_co(p,k,r);if(e)return e;if(k==='naviera'&&RG[r]&&!RG[r].co)return 'Una naviera necesita una provincia con costa para su puerto.';return null;};}

/* ---------- transportistas de la IA (ficticios; 4 cotizan en bolsa) ---------- */
// [id, nombre, modo, país sede, color, clave de bolsa]
const LG_AI=[
 ['ncr','Northern Rail','ter','CAN','#c0392b','NRAL'],['cno','Caminos del Norte','ter','MEX','#e67e22'],['pra','Pradera Freight','ter','USA','#d35400'],
 ['eur','EuroRuta','ter','DEU','#2980b9'],['sed','Seda Exprés','ter','CHN','#c0392b'],['vol','Volga Logística','ter','RUS','#8e44ad'],
 ['ind','IndoCarga','ter','IND','#f39c12'],['and','TransAndes','ter','ARG','#16a085'],['sah','Sahel Carga','ter','NGA','#b9770e'],
 ['mpa','Mareas del Pacífico','mar','CHN','#1abc9c'],['atl','Atlántica Naviera','mar','NLD','#3498db'],['idc','Ruta del Índico','mar','IND','#e74c3c'],
 ['ndm','Nordmar Cargo','mar','DNK','#5dade2'],['gol','Naviera del Golfo','mar','MEX','#27ae60'],['ant','Antípodas Shipping','mar','AUS','#48c9b0'],
 ['aer','Aérocontinental','aer','FRA','#9b59b6','AERC'],['thy','Alas Turcas','aer','TUR','#e74c3c','THYW'],['agl','Aeropuertos del Golfo','aer','MEX','#f1c40f','AGOL'],
 ['cdr','Cóndor Carga','aer','BRA','#2ecc71'],['alp','Ala del Pacífico','aer','SGP','#ec7063']];
const LGA={};LG_AI.forEach(a=>LGA[a[0]]=a);
const LG_PC='#f2c14e';   // color de tus empresas (si no tienen grupo)

/* ---------- geografía: vecinos por tierra, capitales, puertos ---------- */
const LGS={land:null,comp:null,cap:{}};
function lgLand(){if(LGS.land)return LGS.land;const sea=new Set((MAP.sea||[]));const A={};const C={};
  for(const r in RG){const n=RG[r].n;(A[n]||(A[n]=new Set()));(RG[r].adj||[]).forEach(a=>{if(!RG[a]||sea.has(r<a?r+'|'+a:a+'|'+r))return;const o=RG[a].n;if(o!==n)A[n].add(o);});}
  // componentes por tierra dentro de cada país de los datos (islas: Japón, Indonesia, Filipinas…)
  let k=0;for(const r in RG){if(C[r]!=null)continue;const n=RG[r].n;const q=[r];C[r]=k;while(q.length){const u=q.pop();(RG[u].adj||[]).forEach(a=>{if(C[a]!=null||!RG[a]||RG[a].n!==n||sea.has(u<a?u+'|'+a:a+'|'+u))return;C[a]=k;q.push(a);});}k++;}
  LGS.land=A;LGS.comp=C;return A;}
function lgLandPath(a,b){if(a===b)return true;const A=lgLand();let F=[a];const seen=new Set([a]);for(let d=0;d<4;d++){const nx=[];for(const u of F)for(const v of (A[u]||[])){if(v===b)return true;if(!seen.has(v)){seen.add(v);nx.push(v);}}F=nx;if(!F.length)break;}return false;}
const lgDist=(a,b)=>{const p=RG[a].c,q=RG[b].c;let dx=Math.abs(p[0]-q[0]);dx=Math.min(dx,MAP.W-dx);return Math.hypot(dx,p[1]-q[1]);};
function lgCapStatic(nid){if(LGS.cap[nid]!==undefined)return LGS.cap[nid];let best=null,bp=-1;for(const r in RG){if(RG[r].n!==nid)continue;const v=(RG[r].cap?1e12:0)+(RG[r].pop||0);if(v>bp){bp=v;best=r;}}return LGS.cap[nid]=best;}
function lgHubs(){const C=lgCache();if(C.hub)return C.hub;const H={},Pt={};
  for(const r in G.regions){const x=G.regions[r],o=x.o;if(!G.nations[o]||!G.nations[o].alive)continue;const g=RG[r];
    const vh=(g.cap&&g.n===o?1e12:0)+(x.pop||0);if(!H[o]||vh>H[o][1])H[o]=[r,vh];
    if(g.co){const vp=((x.b&&x.b.puerto)||0)*1e10+(x.pop||0);if(!Pt[o]||vp>Pt[o][1])Pt[o]=[r,vp];}}
  const hub={},port={};for(const o in H)hub[o]=H[o][0];for(const o in Pt)port[o]=Pt[o][0];C.hub={hub,port};return C.hub;}

/* ---------- caché por año (flujos) y por mes (eficiencia) ---------- */
const LGC={g:null,y:-1,F:null,hub:null,byN:null,nat:{},nt:-1,pm:null};
function lgCache(){if(LGC.g!==G||LGC.y!==G.year){LGC.g=G;LGC.y=G.year;LGC.F=null;LGC.hub=null;LGC.byN=null;LGC.nat={};LGC.nt=-1;LGC.pm=null;}return LGC;}
function lgEnsure(){if(!G)return null;let L=G.lg;if(!L||L.v!==1)L=G.lg={v:1,ai:{},c:null,k:0,ev:[],dl:[],em:{ter:1,mar:1,aer:1},t:0};
  LG_AI.forEach(a=>{if(!L.ai[a[0]])L.ai[a[0]]={e:1,y:G.year,ok:0,dl:0,ls:0};});return L;}
function lgTcBase(m,d){const M=LG_M[m];return M.tc+M.td*Math.min(2,d/2000);}

/* ---------- 2) flujos de la red ---------- */
// Copia de ntRes (v2.3a) que NO escribe en la caché de la naturaleza (NTC): llenarla antes de tiempo (p. ej. justo después de
// ageUp, con otras guerras y ocupaciones que en enero) cambiaba los efectos de la v2.3a y movía el PIB mundial (ver trampa 123).
function lgRes(nid,W){const d=resNat()[nid]||{};const n=G.nations[nid];if(!W){let g=0,p=0;for(const id in G.nations){const m=G.nations[id];if(m.alive){g+=m.gdp;p+=m.pop;}}W=[g||1,p||1];}
  const gs=n.gdp/W[0],ps=n.pop/W[1];const L=[];
  for(const k in RES0){const R=RES0[k];const S=(RESN.S&&RESN.S[k])||RESW0[k];const sh=R[5]==='agr'?.6*ps+.4*gs:.75*gs+.25*ps;const need=S*sh;const pr=d[k]||0;
    const r=need>0?pr/need:0;L.push({k,pr,need,r,st:r>=1.25?3:r>=.8?2:r>=.2?1:0});}return L;}
function lgSrcProv(nid,k,hub){let best=null,bv=0;if(typeof DEP==='undefined')return hub;for(const r of regionsOf(nid)){const d=DEP[r];const v=d&&d[k];if(v>bv&&!(G.occ&&G.occ[r])){bv=v;best=r;}}return best||hub;}
function lgPickMode(na,nb,k,ra,rb,hp){if(RES0[k]&&RES0[k][5]==='pre')return 'aer';const d=lgDist(ra,rb);
  if(d<480&&lgLandPath(na,nb))return 'ter';if(hp.port[na]&&hp.port[nb])return 'mar';if(lgLandPath(na,nb))return 'ter';return 'aer';}
function lgCarrierAI(m,r,id){let best=null,bd=1e18;LG_AI.forEach(a=>{if(a[2]!==m)return;const h=lgCapStatic(a[3]);if(!h)return;const d=lgDist(h,r)+h21(id+'|'+a[0])*120;if(d<bd){bd=d;best=a[0];}});return best;}
function lgFlows(){const C=lgCache();if(C.F)return C.F;lgEnsure();const hp=lgHubs();const F=[];const alive=Object.keys(G.nations).filter(id=>G.nations[id].alive&&hp.hub[id]);
  // internacionales: recursos de los que exportan hacia los que importan
  if(typeof RES0!=='undefined'){const RS={};let wg=0,wp=0;for(const id in G.nations){const m=G.nations[id];if(m.alive){wg+=m.gdp;wp+=m.pop;}}const W=[wg||1,wp||1];alive.forEach(id=>{RS[id]=lgRes(id,W);});const cand=[];
    for(const k in RES0){const val=resVal(k);if(!(val>0))continue;const E=[],I=[];
      alive.forEach(id=>{const e=RS[id].find(z=>z.k===k);if(!e||!(e.need>0||e.pr>0))return;if(e.st===3)E.push([id,e.pr-e.need]);else if(e.st<=1&&e.need>e.pr)I.push([id,e.need-e.pr]);});
      if(!E.length)continue;
      I.forEach(([ni,dv])=>{const v=dv*val;if(!(v>0))return;let be=null,bs=-1;const hi=hp.hub[ni];
        E.forEach(([ne,sv])=>{if(warBetween(ne,ni))return;const s=sv/(lgDist(hp.hub[ne],hi)+300);if(s>bs){bs=s;be=ne;}});if(be)cand.push([v,be,ni,k]);});}
    cand.sort((a,b)=>b[0]-a[0]);const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;let n=0,nm=0;
    for(const [v,ne,ni,k] of cand){const mine=me&&(ne===me||ni===me);if(n>=120&&!(mine&&nm<20))continue;if(n<120)n++;else nm++;
      const m0=lgPickMode(ne,ni,k,hp.hub[ne],hp.hub[ni],hp);const a=m0==='mar'?hp.port[ne]:m0==='ter'?lgSrcProv(ne,k,hp.hub[ne]):hp.hub[ne];const b=m0==='mar'?hp.port[ni]:hp.hub[ni];
      if(!a||!b||a===b)continue;const id=a+'>'+b+'|'+k;const d=lgDist(a,b);F.push({id,a,b,na:ne,nb:ni,k,m:m0,v,d,tc0:lgTcBase(m0,d),c:lgCarrierAI(m0,a,id)});}}
  // internos: cosechas de las provincias con sobra hacia las que no se alimentan solas
  if(typeof ntProv==='function'){lgLand();const dom=[];
    alive.forEach(id=>{const rs=regionsOf(id);if(rs.length<3)return;const S=[],D=[];
      rs.forEach(r=>{const o=ntProv(r,G.year);if(!o||!RG[r])return;const s=o.fed/Math.max(1,o.pop);if(s>1.25)S.push([r,(s-1)*o.pop]);else if(s<.75)D.push([r,(1-s)*o.pop]);});
      if(!S.length||!D.length)return;D.sort((a,b)=>b[1]-a[1]);
      D.slice(0,2).forEach(([rd,need])=>{let be=null,bs=-1;S.forEach(([rs2,sp])=>{const s=sp/(lgDist(rs2,rd)+50);if(s>bs){bs=s;be=rs2;}});if(!be)return;
        const same=LGS.comp[be]===LGS.comp[rd];const m0=same?'ter':RG[be].co&&RG[rd].co?'mar':'aer';dom.push([need*250,be,rd,id,m0]);});});
    dom.sort((a,b)=>b[0]-a[0]);dom.slice(0,160).forEach(([v,a,b,nid,m0])=>{if(v<2e7)return;const id=a+'>'+b+'|food';const d=lgDist(a,b);F.push({id,a,b,na:nid,nb:nid,k:'food',m:m0,v,d,tc0:lgTcBase(m0,d),c:lgCarrierAI(m0,a,id),dom:1});});}
  const byN={};F.forEach(f=>{(byN[f.nb]||(byN[f.nb]=[])).push(f);if(f.na!==f.nb)(byN[f.na]||(byN[f.na]=[])).push(f);});
  C.F=F;C.byN=byN;C.pm=null;lgSyncBiz();return F;}
const lgFlowById=id=>{const F=lgFlows();for(const f of F)if(f.id===id)return f;return null;};

/* ---------- tus empresas de transporte: flota, rutas, eficiencia ---------- */
function lgBiz(b){const m=lgMode(b);if(!m)return null;const L=lgEnsure();if(!b.lg)b.lg={id:'P'+(++L.k),au:1,rt:[],y:{y:G.year,ok:0,dl:0,ls:0}};if(!b.lg.y||b.lg.y.y!==G.year)b.lg.y={y:G.year,ok:0,dl:0,ls:0};return b.lg;}
const lgSlots=b=>Math.min(8,Math.max(1,b.br||1));
const lgFleet=b=>{const m=lgMode(b);return m?(b.br||1)*LG_M[m].per:0;};
const lgEffBiz=b=>clamp(.8+.4*(b.rep==null?50:b.rep)/100,.7,1.2);
function lgCand(b){const m=lgMode(b);if(!m||!G.regions[b.r])return [];lgFlows();const nid=G.regions[b.r].o;return (LGC.byN[nid]||[]).filter(f=>f.m===m).sort((a,c)=>c.v-a.v).slice(0,12);}
function lgSyncBiz(){if(!P||!P.alive)return;const used=new Set();const L=bzList(P).filter(b=>lgMode(b));
  L.forEach(b=>{const g=lgBiz(b);const ok=new Set(lgCand(b).map(f=>f.id));g.rt=g.rt.filter(id=>ok.has(id)&&!used.has(id)).slice(0,lgSlots(b));g.rt.forEach(id=>used.add(id));});
  L.forEach(b=>{const g=b.lg;if(!g.au)return;for(const f of lgCand(b)){if(g.rt.length>=lgSlots(b))break;if(!used.has(f.id)){g.rt.push(f.id);used.add(f.id);}}});LGC.pm=null;}
function lgToggle(b,id){const g=lgBiz(b);if(!g)return '';const i=g.rt.indexOf(id);g.au=0;
  if(i>=0){g.rt.splice(i,1);LGC.pm=null;return 'Dejas esa ruta: otro transportista la cubrirá.';}
  if(g.rt.length>=lgSlots(b))return `Tu flota cubre ${lgSlots(b)} ruta(s): abre otra sucursal o deja una ruta.`;
  if(bzList(P).some(z=>z!==b&&z.lg&&z.lg.rt.includes(id)))return 'Otra de tus empresas ya cubre esa ruta.';g.rt.push(id);LGC.pm=null;return 'Tomas la ruta: tu flota llevará esos envíos.';}
function lgAuto(b){const g=lgBiz(b);if(!g)return;g.au=1;g.rt=[];lgSyncBiz();}
function lgPMap(){const C=lgCache();if(C.pm)return C.pm;const M={};if(P&&P.alive)bzList(P).forEach(b=>{if(b.lg&&lgMode(b))b.lg.rt.forEach(id=>M[id]=b);});C.pm=M;return M;}
function lgCarrier(f){const b=lgPMap()[f.id];return b?{p:1,b,id:b.lg.id,e:lgEffBiz(b)}:{p:0,id:f.c,e:(G.lg&&G.lg.ai[f.c]?G.lg.ai[f.c].e:1)};}
function lgBizF(b){const g=b.lg;if(!g)return .92;const n=g.rt.length,s=lgSlots(b);if(!n)return .92;const F=g.rt.map(lgFlowById).filter(Boolean);
  const vf=F.length?clamp(1+.08*Math.log10(F.reduce((a,f)=>a+f.v,0)/F.length/1e9),.85,1.15):1;return clamp(.92+.16*Math.min(1,n/s)*vf,.9,1.12);}

/* ---------- eficiencia de la red de un país y efecto en precios ---------- */
const LG_WAR=1.1,LG_KR=30,LG_KI=15,LG_CAP=1.5;
function lgNat(nid){const C=lgCache();const t=G.lg?G.lg.t:0;if(C.nt!==t){C.nt=t;C.nat={};}if(C.nat[nid])return C.nat[nid];lgFlows();const n=G.nations[nid];
  const em=(G.lg&&G.lg.em)||{ter:1,mar:1,aer:1};const war=!!(n&&warsOf(nid).length);let sv=0,sd=0,st=0,s0=0,nI=0;const I=[];
  (C.byN[nid]||[]).forEach(f=>{if(f.nb!==nid||f.dom)return;const c=lgCarrier(f);const cf=(em[f.m]||1)/Math.max(.5,c.e)*(war?LG_WAR:1);sv+=f.v;sd+=f.v*(cf-1);st+=f.v*f.tc0*cf;s0+=f.v*f.tc0;nI++;I.push(f);});
  let dep=0;try{let a=0,q=0;lgRes(nid).forEach(e=>{const v=resVal(e.k);a+=Math.max(0,e.need-e.pr)*v;q+=e.need*v;});dep=q>0?clamp(a/q,0,1):0;}catch(e){}
  const D=sv?sd/sv:0;const o={nid,n:nI,I,dep,D,tc:sv?st/sv:0,tc0:sv?s0/sv:0,war,v:sv,sc:Math.round(clamp(50-250*D,0,100))};C.nat[nid]=o;return o;}
function lgSect(n){const o=lgNat(n.id);if(!o||!o.n)return null;return {r:-clamp(LG_KR*o.dep*o.D,-LG_CAP,LG_CAP),i:-clamp(LG_KI*o.dep*o.D,-LG_CAP,LG_CAP)};}
{const _c=shCtx;shCtx=function(n){const c=_c(n);try{c.lg=lgSect(n);}catch(e){c.lg=null;}return c;};}
{const _t=shTerms;shTerms=function(c,R,k,L){let t=_t(c,R,k,L);const z=c&&c.lg;if(!z)return t;let v=k==='retail'?z.r:k==='ind'?z.i:0;
  if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nlog',v]);}return t;};}

/* ---------- 3) cada mes: envíos a tiempo, retrasados o perdidos ---------- */
function lgMonth(t){const L=lgEnsure();const F=lgFlows();L.t=(L.t||0)+1;const dl=[];const em={ter:[0,0],mar:[0,0],aer:[0,0]};const Y=G.year;
  const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const warN={};const isW=id=>warN[id]!=null?warN[id]:(warN[id]=warsOf(id).length>0);
  const nc={};for(const f of F){const c=lgCarrier(f);if(!c.p)nc[c.id]=(nc[c.id]||0)+1;}
  for(const f of F){const c=lgCarrier(f);const w=isW(f.na)||isW(f.nb)?1.8:1;const sc=(1+2*Math.max(0,1-c.e))*w;const pl=.005*sc,pd=.035*sc;const u=h21(f.id+'|'+t+'|lg');
    const ev=u<pl?2:u<pl+pd?1:0;
    if(c.p){const b=c.b;const g=lgBiz(b);const m=b.m&&b.m[b.m.length-1];const rv=m?m.rev:0;
      if(ev===2){g.y.ls++;b.cash=Math.max(0,(b.cash||0)-.03*rv);b.rep=clamp((b.rep||50)-1.5,0,100);if(b.lg.lw!==t){b.lg.lw=t;try{log(`📦 ${b.n} pierde un envío de ${lgGood(f.k)} en la ruta ${RG[f.a].nm} → ${RG[f.b].nm}: pagas el seguro y baja tu reputación.`,'bad');}catch(e){}}}
      else if(ev===1){g.y.dl++;b.rep=clamp((b.rep||50)-.3,0,100);}else g.y.ok++;}
    else{const a=L.ai[c.id];if(a){if(a.y!==Y){a.y=Y;a.ok=0;a.dl=0;a.ls=0;}const q=1/(nc[c.id]||1);if(ev===2){a.ls++;a.e-=.3*q;}else if(ev===1){a.dl++;a.e-=.08*q;}else a.ok++;}}
    if(ev){dl.push([f.id,ev]);if(me&&(f.na===me||f.nb===me)&&(ev===2||c.p))L.ev.push([t,f.id,ev,c.id]);}}
  for(const id in L.ai){const a=L.ai[id];a.e=clamp(a.e+(1.07-a.e)*.06+(h21(id+'|'+t+'|e')-.5)*.02,.6,1.25);const m=LGA[id]&&LGA[id][2];if(m){em[m][0]+=a.e;em[m][1]++;}}
  for(const m in em)L.em[m]=em[m][1]?em[m][0]/em[m][1]:1;
  L.dl=dl.slice(0,60);if(L.ev.length>14)L.ev.splice(0,L.ev.length-14);}
function lgTick(){const L=lgEnsure();if(!L)return;const c=L.c||(L.c={y:G.year,mi:monthOfDay(G.day||0)});if(c.y!==G.year){c.y=G.year;c.mi=0;}if(c.mi>=12)return;const t=G.year*12+c.mi;c.mi++;lgMonth(t);}
const LG_GOOD={food:'alimentos'};
function lgGood(k){return LG_GOOD[k]||(RES0[k]?RES0[k][0].toLowerCase():k);}
{const _me=mkMonthEnd;mkMonthEnd=function(...a){const r=_me(...a);try{if(G&&G.regions)lgTick();}catch(e){console.warn('v24a mes',e);}return r;};}
{const _au=ageUp;ageUp=function(...a){if(G&&G.lg){try{for(let i=0;i<12;i++){const c=G.lg.c;if(!c||c.y===G.year&&c.mi>=12)break;lgTick();}}catch(e){console.warn('v24a año',e);}}
  return _au(...a);};}

/* ---------- tus empresas: demanda según las rutas y flete de los insumos importados ---------- */
function lgImpFreight(b){const T=bzT(b);const x=G.regions[b.r];if(!x||!(T.in||[]).length)return 0;const o=lgNat(x.o);if(!o.n)return 0;
  const R=lgRes(x.o);let w=0;T.in.forEach(([rk,wt])=>{const e=R.find(z=>z.k===rk);if(e&&e.st<=1)w+=wt;});return w*(o.tc-o.tc0);}
{const _bm=bzMonth;bzMonth=function(p,b){if(!b||!b.v14||!G||!G.regions[b.r])return _bm(p,b);const T=bzT(b);let f=1,fr=0;
  try{if(T.lg&&p===P){lgBiz(b);f=lgBizF(b);}fr=lgImpFreight(b);}catch(e){f=1;fr=0;}
  const c0=b.comp,g0=T.gm,n0=b.m?b.m.length:0;if(f!==1)b.comp=(c0==null?1:c0)*f;if(fr)T.gm=1-(1-g0)*(1+fr);
  try{_bm(p,b);}finally{T.gm=g0;if(f!==1)b.comp=Math.min(1,(c0==null?1:c0)+.01);const m=b.m&&b.m[b.m.length-1];if(m&&b.m.length>=n0){if(f!==1)m.lgf=f;if(fr)m.lgfr=fr;}}};}
