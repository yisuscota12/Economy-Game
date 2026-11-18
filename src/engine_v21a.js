/* ===================== v2.1a: fase 4 de la ruta 9d (economía conectada), parte 1 — motor =====================
   - Empresas sin límite fijo: el tope de 5 pasa a ser un límite de atención. Sin grupo, desde la 6.ª empresa que diriges en persona
     todas pierden reputación cada mes (no te alcanza el tiempo); un grupo con director lo resuelve.
   - Empresas en venta (G.bzm): negocios privados generados en tu país con 12 meses de historia real (mismo motor que las tuyas),
     precio pedido, vendedor con prisa, resultados maquillados y deudas ocultas que solo revela una auditoría (due diligence).
     Oferta al 80/90/100 % con probabilidad visible y dado; compra de contado o con 50 % de crédito que queda en la empresa (apalancada).
   - Control de empresas en bolsa: oferta pública de adquisición (OPA) por el 51 % con prima de 20/30/40 %; con el control eliges
     estrategia (crecer, eficiencia, dividendos) y director; si bajas del 50 % pierdes el control.
   - Grupos (P.grp, b.g): conglomerados con director (estilo y calidad), sueldo repartido entre sus empresas, sinergias por giro,
     barrer caja hacia ti y préstamo interno. */

const BZ_ATT=5;              // empresas que puedes dirigir en persona sin perder atención
function bzCanOpen(p,k,r){const T=BZ[BZK[k]];if(p.age<(k==='comida'?16:18))return 'Necesitas 18 años (16 para un puesto de comida).';if(p.prison)return 'Desde prisión no puedes abrir negocios.';
  if(T.ed&&!(p.edu&&(p.edu.degree||(p.edu.degrees||[]).length)))return 'Requiere estudios universitarios.';
  if(T.out==='met'&&!bzDep(r,'met'))return 'En esta provincia no hay yacimientos minerales. Busca una con ⛏️ en el mapa de recursos.';
  if(T.out==='ene'&&!bzDep(r,'ene'))return 'En esta provincia no hay petróleo ni gas.';if(warBetween(G.regions[r].o,natOf(p).id))return 'No puedes invertir en un país con el que estás en guerra.';return null;}
function bzSelf(p){return bzList(p).filter(b=>b.v14&&!grpOf(p,b)).length;}
function grpOf(p,b){if(!b||b.g==null||!p.grp)return null;return p.grp.find(g=>g.id===b.g)||null;}
function bzCosts(m){return m?(m.cogs+m.pay+m.rent+m.mkt):0;}

/* ---------- grupos ---------- */
const GRP_ST={cre:['Crecimiento','Abre sucursales cuando hay caja y la empresa vende a tope.'],efi:['Eficiencia','Recorta costos: la utilidad sube con la calidad del director.'],con:['Conservador','Paga deudas primero y guarda caja para las crisis.']};
function grpEnsure(p){p.grp=p.grp||[];return p.grp;}
function grpNew(p,n){const L=grpEnsure(p);const id=L.reduce((m,g)=>Math.max(m,g.id),0)+1;L.push({id,n:n||`Grupo ${p.surname}`,dir:null,y:G.year});return id;}
function grpMembers(p,g){return bzList(p).filter(b=>b.v14&&b.g===g.id);}
function grpCands(p,g){const n=natOf(p),c=cultOf(n.id);const k=Math.max(1,grpMembers(p,g).length);const L=[];
  for(let i=0;i<3;i++){const q=RI(40,92);const st=['cre','efi','con'][i];const sex=chance(.4)?'F':'M';
    L.push({n:rndFirst(sex,c)+' '+rndSur(c),sex,q,st,sal:U(p)*(1.5+q/25)*(1+.1*k)});}
  g.cand=L;return L;}
function grpHire(p,g,i){const c=(g.cand||[])[i];if(!c)return '';g.dir={n:c.n,q:c.q,st:c.st,sal:c.sal,y:G.year};g.cand=null;return `${c.n} dirige ${g.n} (${GRP_ST[c.st][0].toLowerCase()}, capacidad ${c.q}). Sueldo: ${fmt(c.sal)} al año, a cargo de las empresas del grupo.`;}
function grpFire(p,g){if(!g.dir)return '';const n=g.dir.n;const sev=g.dir.sal*.25;const M=grpMembers(p,g);M.forEach(b=>b.cash-=sev/Math.max(1,M.length));g.dir=null;return `Despides a ${n}: la indemnización (${fmt(sev)}) sale de la caja de las empresas del grupo.`;}
function grpSweep(p,g){let t=0;grpMembers(p,g).forEach(b=>{const m=b.m[b.m.length-1];const keep=bzCosts(m)*3;const x=Math.max(0,b.cash-keep);if(x>0){b.cash-=x;t+=x;}});p.dinero+=t;
  return t>0?`Barres la caja de ${g.n}: ${fmt(t)} pasan a tu dinero. Cada empresa conserva 3 meses de costos.`:`Ninguna empresa de ${g.n} tiene caja de sobra (cada una necesita 3 meses de costos).`;}
function grpLend(p,g){const M=grpMembers(p,g);if(M.length<2)return 'Se necesitan al menos 2 empresas en el grupo.';const need=b=>bzCosts(b.m[b.m.length-1])*3-b.cash+b.debt*.2;
  M.sort((a,b)=>need(a)-need(b));const rich=M[0],poor=M[M.length-1];const ex=Math.max(0,rich.cash-bzCosts(rich.m[rich.m.length-1])*3);if(ex<=0||need(poor)<=0)return 'No hace falta mover caja: ninguna empresa la necesita o ninguna tiene de sobra.';
  const a=Math.min(ex,Math.max(need(poor),0));rich.cash-=a;poor.cash+=a;const pay=Math.min(poor.debt,a*.5);poor.debt-=pay;poor.cash-=pay;
  return `Préstamo interno: ${rich.n} pasa ${fmt(a)} a ${poor.n}${pay>0?`, que paga ${fmt(pay)} de deuda bancaria`:''}.`;}
function grpDel(p,g){grpMembers(p,g).forEach(b=>delete b.g);p.grp=p.grp.filter(x=>x!==g);return `Disuelves ${g.n}: sus empresas vuelven a depender de ti.`;}
function grpSum(p,g){const M=grpMembers(p,g);let rev=0,net=0,val=0,st=0,debt=0,cash=0;M.forEach(b=>{const m=b.m[b.m.length-1]||{};rev+=m.rev||0;net+=m.net||0;val+=bzValue(b);st+=b.st;debt+=b.debt;cash+=b.cash;});return {n:M.length,rev,net,val,st,debt,cash};}

/* cada mes: atención (sin grupo), director, sinergias */
{const _bm=bzMonth;bzMonth=function(p,b){_bm(p,b);try{if(!p||!b||!b.v14||!bzList(p).includes(b))return;const m=b.m[b.m.length-1];if(!m)return;const g=grpOf(p,b);
    if(!g){const n=bzSelf(p);if(n>BZ_ATT){const d=.6*(n-BZ_ATT);b.rep=clamp(b.rep-d,0,100);m.att=-d;}return;}
    const M=grpMembers(p,g);const T=bzT(b);
    if(g.dir){const D=g.dir,k=(D.q-50)/50;const c=D.sal/12/Math.max(1,M.length);b.cash-=c;m.gc=c;
      b.rep=clamp(b.rep+.15*k,0,100);
      if(D.st==='efi'){const s=bzCosts(m)*.02*Math.max(0,k+.3);b.cash+=s;m.ef=s;}
      else if(D.st==='cre'){if(m.util>.97&&b.br<T.mx&&b.cash>T.K*bzRv(T,b.r)*bzU(b.r)*1.3&&chance(.04+.06*Math.max(0,k))){bzBranch(p,b,1);m.nb=1;}}
      else if(D.st==='con'){if(b.debt>0&&b.cash>bzCosts(m)*2){const r=Math.min(b.debt,(b.cash-bzCosts(m)*2)*.5);b.debt-=r;b.cash-=r;m.pd=r;}}}
    const peers=M.filter(x=>x!==b&&bzT(x).sec===T.sec).length;if(peers){const s=m.rev*.01*Math.min(4,peers);b.cash+=s;m.syn=s;}
  }catch(e){console.warn('v21a mes',e);}};}

/* ---------- empresas en venta ---------- */
function bzmNow(){return G.year*12+monthOfDay(G.day||0);}
function bzmEnsure(p){if(!G.bzm||G.bzm.n!==natOf(p).id||bzmNow()-G.bzm.t>=6||!G.bzm.L.length)bzmGen(p);return G.bzm;}
function bzmGen(p){const n=natOf(p);const rs=regionsOf(n.id).filter(r=>G.regions[r]&&G.regions[r].pop>0).sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,30);
  const pool=[p.r].concat(rs);const L=[];const lg=log;log=function(){};
  try{for(let i=0,tries=0;L.length<6&&tries<30;tries++){const r=i===0?p.r:pick(pool);const T=pick(BZ.filter(t=>!(t.out==='met'&&!bzDep(r,'met'))&&!(t.out==='ene'&&!bzDep(r,'ene'))));
      const o=bzmMake(p,T,r);if(o){L.push(o);i++;}}}finally{log=lg;}
  G.bzm={n:n.id,t:bzmNow(),L,k:(G.bzm&&G.bzm.k||0)+L.length};return G.bzm;}
function bzmMake(p,T,r){const k=T.k;const U0=bzU(r);const rv=bzRv(T,r)*U0;const br=Math.min(T.mx,RI(1,4));const cap=T.K*rv*br,wc=rv*br*((1-T.gm)*1.5+T.L*2+T.rs)/12;
  const res=T.out==='agr'?bzDep(r,'agr')||'corn':T.out?bzDep(r,T.out):null;const c=cultOf(G.regions[r].o||natOf(p).id);
  const b={v14:1,k,t:bzTi(k),n:`${T.n} ${rndSur(c)}`,r,br,st:T.st*br,pr:0,q:RI(-1,1),wg:0,mk:RI(1,4),py:0,rep:RI(30,80),cash:wc*R(.6,1.6),debt:cap*R(0,.5),assets:cap*R(.7,1),lc:0,comp:1,m:[],ya:[],lvl:0,_lv:0,luck:1,y:G.year-RI(2,25),last:0,res,
    dq:res&&DEP[r]&&DEP[r][res]?clamp(.9+Math.log10(1+DEP[r][res]*resVal(res)/1e8)*.12,.9,1.25):res?.8:1};
  const dp={dinero:0,biz:null,bzx:[b],s:{felicidad:50},surname:'',age:40,edu:{}};
  for(let i=0;i<12;i++){bzMonth(dp,b);if(!dp.bzx.includes(b))return null;}
  b.py=50;b.m=b.m.slice(-12);const val=bzValue(b);if(!(val>U0*.3))return null;
  const urg=chance(.25),hd=chance(.3)?val*R(.1,.35):0;const ask=val*R(1.05,1.35)*(urg?.92:1);
  return {id:(G.bzm&&G.bzm.k||0)+Math.floor(R(1,1e6)),b,ask,hd,inf:hd?R(1.1,1.3):1,urg,neg:0,aud:0};}
function bzmDecl(o){const L=o.b.m.slice(-12);const k=o.aud?1:o.inf;const rev=L.reduce((s,z)=>s+z.rev,0)*12/Math.max(1,L.length),net=L.reduce((s,z)=>s+z.net,0)*12/Math.max(1,L.length);
  return {rev:rev*k,net:net>0?net*k:net,debt:o.b.debt+(o.aud?o.hd:0),cash:o.b.cash};}
function bzmAuditCost(p,o){return Math.max(.05*U(p),o.ask*.015);}
function bzmAudit(p,id){const o=G.bzm&&G.bzm.L.find(x=>x.id===id);if(!o||o.aud)return '';const c=bzmAuditCost(p,o);if(p.dinero<c)return `Te faltan ${fmt(c-p.dinero)} para la auditoría.`;p.dinero-=c;o.aud=1;
  return o.hd?`La auditoría de ${o.b.n} (${fmt(c)}) encuentra una deuda oculta de ${fmt(o.hd)} y resultados inflados: las ventas reales son ${Math.round((1/o.inf)*100)} % de lo que declaraba el vendedor.`
    :`La auditoría de ${o.b.n} (${fmt(c)}) confirma las cifras del vendedor: no hay deudas ocultas.`;}
const BZM_PCT=[[.8,25],[.9,55],[1,95]];
function bzmChance(o,i){return clamp(BZM_PCT[i][1]+(o.urg?20:0)-15*o.neg,5,98);}
function bzmPrice(o,i,loan){const pr=o.ask*BZM_PCT[i][0];return {pr,cash:loan?pr*.5:pr,debt:loan?pr*.5:0};}
function bzmOffer(p,id,i,loan){const M=G.bzm;const o=M&&M.L.find(x=>x.id===id);if(!o)return {t:''};const P2=bzmPrice(o,i,loan);if(p.dinero<P2.cash)return {t:`Te faltan ${fmt(P2.cash-p.dinero)}.`};
  if(p.age<18)return {t:'Necesitas 18 años.'};const pc=bzmChance(o,i),roll=RI(1,100);
  if(roll>pc){o.neg++;if(o.neg>=2){M.L=M.L.filter(x=>x!==o);return {t:`El vendedor rechaza tu oferta por ${o.b.n} y la retira del mercado.`,roll,pc,ok:false};}
    return {t:`El vendedor rechaza ${fmt(P2.pr)} por ${o.b.n}. Puedes volver a intentarlo una vez más.`,roll,pc,ok:false};}
  p.dinero-=P2.cash;const b=o.b;b.debt+=P2.debt;b.y0=G.year;M.L=M.L.filter(x=>x!==o);
  if(!p.biz)p.biz=b;else (p.bzx=p.bzx||[]).push(b);let t=`Compras ${b.n} por ${fmt(P2.pr)}${P2.debt?` (pagas ${fmt(P2.cash)}; ${fmt(P2.debt)} de crédito quedan como deuda de la empresa)`:''}.`;
  if(!o.aud&&o.hd){b.debt+=o.hd;t+=` Al revisar los libros descubres una deuda oculta de ${fmt(o.hd)}: no hiciste auditoría.`;}
  return {t,roll,pc,ok:true};}

/* ---------- control de empresas en bolsa (OPA) ---------- */
const OPA_P=[[.2,45],[.3,70],[.4,90]];
function opaOk(id){const c=G.mk&&G.mk.C[id];return !!(c&&!c.dead&&!c.ix&&c.pl==null&&c.sec!=='fondo');}
function opaInfo(p,id){const c=G.mk.C[id];const cur=coCur(id);const own=(p.bk&&p.bk.pos[id]&&p.bk.pos[id].q>0)?p.bk.pos[id].q:0;const need=Math.max(0,Math.ceil(c.sh*.51)-own);
  return {c,cur,own,need,pct:own/c.sh,ctl:!!c.ctl,tried:c.opaY===G.year,opts:OPA_P.map(([pr,pc])=>{const px=c.p*(1+pr);const cost=toInt(need*px,cur)*1.01;return {pr,pc,px,cost,ok:p.dinero>=cost};})};}
function opaDo(p,id,i){if(!opaOk(id))return {t:'Esta empresa no se puede comprar por OPA.'};const I=opaInfo(p,id),o=I.opts[i];const c=I.c;if(I.ctl)return {t:'Ya controlas esta empresa.'};
  if(I.tried)return {t:'Ya lanzaste una oferta por esta empresa este año: los accionistas no aceptan otra hasta el próximo.'};if(!o.ok)return {t:`Te faltan ${fmt(o.cost-p.dinero)}.`};
  const roll=RI(1,100);c.opaY=G.year;
  if(roll>o.pc){const fee=o.cost*.005;p.dinero-=fee;c.p*=1+o.pr*.3;return {t:`Los accionistas de ${c.nm} rechazan tu oferta de ${fmtPx(o.px,I.cur)} por acción. Pagas ${fmt(fee)} a los asesores y la acción sube por la especulación.`,roll,pc:o.pc,ok:false};}
  bkEnsure(p);const ps=p.bk.pos[id]||(p.bk.pos[id]={q:0,c:0});ps.c=(ps.c*ps.q+o.px*I.need)/(ps.q+I.need);ps.q+=I.need;p.dinero-=o.cost;
  c.ctl={y:G.year,st:'eq',dir:null,dy0:c.dy};c.p*=1+o.pr*.6;mkNews(`${fullName(p)} toma el control de ${c.nm} con una oferta pública: compra el 51 % de las acciones con una prima de ${Math.round(o.pr*100)} %.`,true);
  return {t:`Tomas el control de ${c.nm}: compras ${fmtK(I.need)} acciones a ${fmtPx(o.px,I.cur)} (${fmt(o.cost)} con comisiones). Ahora eliges su estrategia y su director.`,roll,pc:o.pc,ok:true};}
const CTL_ST={eq:['Equilibrada','Sigue como estaba.',0,1],cre:['Crecer','Reinvierte casi todo: las utilidades crecen más rápido y reparte menos dividendos.',.025,.4],
  efi:['Eficiencia','Recorta costos: utilidades algo mayores y la acción se mueve menos.',.012,1],div:['Dividendos','Reparte más: dividendos mucho mayores, pero crece menos.',-.008,1.7]};
function ctlSet(id,st){const c=G.mk.C[id];if(!c||!c.ctl)return '';c.ctl.st=st;c.dy=(c.ctl.dy0||0)*CTL_ST[st][3];return `${c.nm} cambia de estrategia: ${CTL_ST[st][0].toLowerCase()}.`;}
function ctlCands(p,id){const c=G.mk.C[id];const cu=cultOf(EXCH0[c.x].n||natOf(p).id);const L=[];for(let i=0;i<3;i++){const sex=chance(.35)?'F':'M';L.push({n:rndFirst(sex,cu)+' '+rndSur(cu),q:RI(42,94)});}c.ctl.cand=L;return L;}
function ctlHire(id,i){const c=G.mk.C[id];const d=c.ctl&&c.ctl.cand&&c.ctl.cand[i];if(!d)return '';c.ctl.dir={n:d.n,q:d.q,y:G.year};c.ctl.cand=null;return `${d.n} es la nueva directora o director general de ${c.nm} (capacidad ${d.q}).`;}
function ctlBias(c){const S=CTL_ST[c.ctl.st]||CTL_ST.eq;let b=S[2];if(c.ctl.dir){const k=(c.ctl.dir.q-50)/50;b+=k*.015-k*k*.004;}return b;}
{const _mt=mkTrade;mkTrade=function(wd,K){const r=_mt(wd,K);try{const M=G.mk;if(!M||!P)return r;K=K||1;
    for(const id in M.C){const c=M.C[id];if(!c.ctl||c.dead)continue;const ps=P.bk&&P.bk.pos[id];
      if(!ps||ps.q<c.sh*.5){c.dy=c.ctl.dy0!=null?c.ctl.dy0:c.dy;delete c.ctl;log(`Bajas del 50 % de las acciones de ${c.nm}: pierdes el control de la empresa.`,'bad');continue;}
      c.eps*=Math.exp(ctlBias(c)*K/252);if(c.ctl.st==='efi')c.v=Math.max(.08,c.v*Math.pow(.9995,K));}}catch(e){console.warn('v21a bolsa',e);}return r;};}
function ctlList(p){const M=G.mk;if(!M)return [];return Object.keys(M.C).filter(id=>M.C[id].ctl&&!M.C[id].dead);}
