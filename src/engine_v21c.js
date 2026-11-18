/* ===================== v2.1c: fase 4 de la ruta 9d (economía conectada), parte 3 — motor (cierra la fase 4) =====================
   - Medidores de salud 0–100 con causas (cada causa = puntos que suma o resta): tus empresas (financiera = la misma fórmula que
     bzHealth de la v2.1b; social = sueldos, carga de trabajo, reputación, pérdidas, sector y provincia), tus grupos, los bancos de
     cada país (lo que mueve su salud este año y la probabilidad de crisis), tu banco, el gobierno (salud fiscal y salud social),
     el sistema financiero mundial (FMI) y tus organizaciones (club, gimnasio, promotora).
   - Riesgo sistémico por país (0–100): bancos débiles, crisis activa, deuda, sectores frágiles, hogares, concentración de la
     economía, contagio de vecinos y reservas que amortiguan.
   - Contagio (efecto real y acotado): cuando estalla una crisis bancaria en un país, sus vecinos reciben un golpe en el sector
     financiero (shHit) y en la salud de sus bancos, proporcional al tamaño de la economía en crisis; si es una economía grande
     (> 8 % del PIB mundial), todo el mundo recibe un golpe leve. Solo al estallar (no cada mes).
   - Personas: familia y amigos adultos trabajan en un sector (x.ec); si el sector cae bajo 35 pueden perder el empleo, si está
     desempleado lo busca (más fácil si el sector está sano) y si el sector pasa de 70 reciben aumentos. Tu propio empleo común:
     recortes de personal si tu sector cae bajo 32, aumentos congelados bajo 35 y más aumento sobre 65 (los públicos dependen de
     la salud fiscal del gobierno). El desempleo de tu familia baja tu felicidad cada mes.
   - Azar SIN Math.random: h21(texto) es un hash determinista (nombre + mes + etiqueta), así no se mueve la secuencia del juego
     ni las pruebas con semilla. */

function h21(s){let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}x^=x>>>15;x=Math.imul(x,0x2c1b3c6d)>>>0;x^=x>>>12;x=Math.imul(x,0x297a2d39)>>>0;x^=x>>>15;return (x>>>0)/4294967296;}
function hzPack(base,L,lo,hi){const s=L.reduce((a,x)=>a+x[1],0);return {v:Math.round(clamp(base+s,lo==null?0:lo,hi==null?100:hi)),L:L.filter(x=>x[1]>=.5||x[1]<=-.5)};}
const hzLv=v=>v>=65?3:v>=45?2:v>=30?1:0;     // 3 sana · 2 estable · 1 frágil · 0 crítica
const hzRk=v=>v>=70?3:v>=50?2:v>=30?1:0;     // riesgo: 3 muy alto · 2 alto · 1 moderado · 0 bajo
const hzUSD=v=>fromInt(v,'USD')/(isReal()?(G.cx.USD.cp||1):1);

/* ---------- tus empresas ---------- */
// financiera: misma fórmula que bzHealth (v2.1b), separada en causas
function hzBizFin(b){const L=(b.m||[]).slice(-12);if(!L.length)return {v:50,L:[],nd:1};const rev=L.reduce((s,z)=>s+z.rev,0),net=L.reduce((s,z)=>s+z.net,0);const mg=rev>0?net/rev:0;
  const h1=L.slice(-6).reduce((s,z)=>s+z.rev,0),h0=L.slice(0,L.length-6).reduce((s,z)=>s+z.rev,0);const gr=L.length>=10&&h0>0?h1/h0*(L.length-6)/6-1:0;
  return hzPack(50,[['mg',mg*150],['rep',(b.rep-50)*.5],['gr',gr*60],['deuda',-b.debt/Math.max(1,rev)*15]],5,95);}
function hzBizSoc(b){const T=bzT(b);const x=G.regions[b.r];const L=(b.m||[]).slice(-3);const m=L[L.length-1];const rev=L.reduce((s,z)=>s+z.rev,0),net=L.reduce((s,z)=>s+z.net,0);const mg=rev>0?net/rev:0;
  const util=m?m.util:.8;const lx=G.lx&&G.lx[b.r];
  return hzPack(55,[['sueldo',(b.wg||0)*12],['carga',!m||T.out?0:util>.98?-8:util<.5?-6:0],['rep',(b.rep-50)*.3],['perd',!m?0:mg<-.05?-10:mg<0?-4:0],
    ['sector',x&&G.sh?(shOf(x.o,T.sec)-50)*.2:0],['prov',lx?lx[0]*100*.4:0]]);}
// meses de gastos que cubre la caja (liquidez)
function hzBizCash(b){const L=(b.m||[]).slice(-3);if(!L.length)return null;const c=L.reduce((s,z)=>s+z.cogs+z.pay+z.rent+z.mkt+z.int,0)/L.length;return c>0?b.cash/c:99;}
function hzGrp(p,g){const M=grpMembers(p,g);if(!M.length)return {v:50,L:[],nd:1};let w=0,s=0,rev=0,debt=0;const sec=new Set();
  M.forEach(b=>{const r=Math.max(1,(b.m||[]).slice(-12).reduce((a,z)=>a+z.rev,0));w+=r;s+=hzBizFin(b).v*r;rev+=r;debt+=b.debt;sec.add(bzT(b).sec);});
  return hzPack(50,[['fin',s/w-50],['div',Math.min(12,(sec.size-1)*4)],['apal',-clamp(debt/Math.max(1,rev)*10,0,20)],['dir',g.dir?(g.dir.q-50)*.12:-3]]);}
// cartera: cuántos sectores distintos y cuál es el más débil
function hzPort(p){const L=bzList(p).filter(b=>b.v14);const sec={};L.forEach(b=>{const x=G.regions[b.r];if(!x)return;const k=bzT(b).sec;const h=G.sh?shOf(x.o,k):50;if(sec[k]==null||h<sec[k])sec[k]=h;});
  const ks=Object.keys(sec);let wk=null;ks.forEach(k=>{if(wk==null||sec[k]<sec[wk])wk=k;});return {n:L.length,secs:ks.length,weak:wk,wh:wk?sec[wk]:null};}

/* ---------- bancos ---------- */
// lo que mueve la salud de los bancos de un país este año (puntos por año), con las mismas fórmulas del motor (bnkYear y shMonth)
function hzBank(n){const b=bnkEnsure(n);const pr=cxOf(n).pr;const dr=pr-(b.pr0!=null?b.pr0:pr);
  const L=[['deud',G.sh?shLoans(n)*.048:0],['rev',(62-b.h)*.15],['reg',(b.reg-1)*3],['rec',n.rec>0?-4:0],['tasa',-Math.max(0,dr)*1.5],['stab',(n.stab-50)/25],['aus',n.aus>0?1:0]];
  return {v:Math.round(b.h),L:L.filter(x=>x[1]>=.5||x[1]<=-.5),cr:b.cr>0,p:b.cr>0?null:Math.max(0,46-b.h)/140+(n.rec>0?.006:0)};}
function hzOwnBank(p){const B=p.bank;if(!B)return null;const r=B.K/Math.max(1,B.L);return {v:Math.round(clamp(r*500,0,100)),r,rep:B.rep,D:B.D,L:[['cap',clamp(r*500,0,100)-50]]};}

/* ---------- gobierno ---------- */
function hzFisc(n){ensureEco(n);const real=isReal();const br=bondRate(n)*100;const g=n.g!=null&&isFinite(n.g)?n.g:2;const rv=rvValue(n)/Math.max(1,n.gdp);
  return hzPack(60,[['deuda',clamp(-(n.debtR-.6)*35,-35,15)],['costo',clamp(-(br-g-(n.infl!=null&&isFinite(n.infl)?n.infl:2))*2,-15,8)],['tes',clamp((n.treas||0)/Math.max(1,n.gdp)*150,-15,12)],
    ['res',clamp((rv-.1)*60,-10,8)],['inf',real?-Math.max(0,(n.infl||0)-6)*.8:0],['fmi',n.imf?-6:0],['war',warsOf(n.id).length?-6:0],['rec',n.rec>0?-5:0]]);}
function hzHap(n){let s=0,w=0;regionsOf(n.id).forEach(r=>{const x=G.regions[r];if(!x)return;if(x.hap==null)ensureProv(x);s+=x.hap*x.pop;w+=x.pop;});return w?s/w:50;}
function hzSoc(n){const real=isReal();const war=warsOf(n.id).length>0;
  return hzPack(50,[['apr',((n.approval!=null?n.approval:50)-50)*.4],['stab',(n.stab-50)*.35],['hap',(hzHap(n)-50)*.3],['hog',G.sh?(shHog(n,war)-50)*.3:0],
    ['inf',real?-Math.max(0,(n.infl||0)-5)*.7:0],['war',war?-8:0],['rec',n.rec>0?-6:0],['aus',n.aus>0?-4:0]]);}

/* ---------- sistema mundial (FMI) y Banco Mundial ---------- */
function hzWorld(){let gw=0,gs=0,crG=0,reG=0,crN=0,reN=0,imf=0,lent=0,wb=0;const N=[];
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;const g=n.gdp;gw+=g;gs+=g*(n.g!=null&&isFinite(n.g)?n.g:2);
    if(n.bk&&n.bk.cr>0){crG+=g;crN++;}if(n.rec>0){reG+=g;reN++;}if(n.imf){imf++;lent+=n.imf.left||0;N.push(id);}if(n.wb>0)wb++;}
  const oil=G.sh?Math.abs(Math.log(shRef('oil'))):0;const gr=gw?gs/gw:2;
  const R=hzPack(50,[['crec',clamp((gr-2.5)*4,-20,12)],['crb',-clamp(crG/Math.max(1,gw)*80,0,30)],['recs',-clamp(reG/Math.max(1,gw)*40,0,20)],['oil',-clamp(oil*15,0,10)],['fmi',-Math.min(8,imf)]]);
  return Object.assign(R,{gr,crN,reN,imf,lent,wb,N});}

/* ---------- tus organizaciones: club, gimnasio, promotora ---------- */
function hzFlow(inc,cost,base){const m=inc>0?(inc-cost)/inc:cost>0?-1:0;return clamp(m*120,-40,30);}
function hzOrgs(p){const O=[];
  if(p.bank){const B=hzOwnBank(p);O.push({k:'bank',n:p.bank.nm,v:B.v,L:B.L});}
  const o=p.ftc;if(o&&o.h){const L=o.h.slice(-12);const inc=L.reduce((s,z)=>s+(z[2]||0),0),cost=L.reduce((s,z)=>s+(z[3]||0),0);const mc=cost/Math.max(1,L.length);
    O.push(Object.assign({k:'club',n:o.n||o.nm||''},hzPack(50,[['flujo',hzFlow(inc,cost)],['caja',clamp(((o.caja||0)/Math.max(1,mc)-3)*3,-15,15)],['afi',((o.mood!=null?o.mood:50)-50)*.3]])));}
  const g=p.cbo&&p.cbo.g;if(g&&g.h){const L=g.h.slice(-12);const inc=L.reduce((s,z)=>s+(z[2]||0),0),cost=L.reduce((s,z)=>s+(z[3]||0),0);O.push(Object.assign({k:'gym',n:g.n||g.nm||''},hzPack(50,[['flujo',hzFlow(inc,cost)]])));}
  const pr=p.cbo&&p.cbo.pr;if(pr&&pr.h&&pr.h.length){const L=pr.h.slice(-6);const inc=L.reduce((s,z)=>s+(z.inc||0),0),cost=L.reduce((s,z)=>s+(z.cost||0),0);O.push(Object.assign({k:'prom',n:pr.n||pr.nm||''},hzPack(50,[['flujo',hzFlow(inc,cost)]])));}
  return O;}

/* ---------- riesgo sistémico por país ---------- */
const HZ={C:null,cg:null,mix:{},mt:{}};
function hzMix(nid){const t=G.year*12+monthOfDay(G.day||0);if(HZ.mix[nid]&&HZ.mt[nid]===t&&HZ.cg===G)return HZ.mix[nid];
  if(!HZ.C||HZ.cg!==G){const f=wmwFeat();HZ.C=wmwComp(f.F,f.N,SH_K.length,SH_K);HZ.K=f.K;HZ.I={};f.K.forEach((k,i)=>HZ.I[k]=i);HZ.cg=G;HZ.mix={};}
  const S=SH_K.length;const m=new Array(S).fill(0);let w=0;regionsOf(nid).forEach(r=>{const i=HZ.I[r];const x=G.regions[r];if(i==null||!x)return;const g=Math.max(1,x.gdp);w+=g;for(let s=0;s<S;s++)m[s]+=HZ.C[i*S+s]*g;});
  if(w)for(let s=0;s<S;s++)m[s]/=w;HZ.mix[nid]=m;HZ.mt[nid]=t;return m;}
function hzNb(nid){const L=[];(neighborsOf(nid)||[]).forEach(id=>{const m=G.nations[id];if(!m||!m.alive)return;const cr=m.bk&&m.bk.cr>0,re=m.rec>0;if(cr||re)L.push([id,cr?'cr':'rec']);});return L;}
function hzRisk(n){const b=bnkEnsure(n);ensureEco(n);const a=G.sh&&G.sh.h[n.id];const frag=a?a.filter(v=>v<35).length/a.length:0;const hog=G.sh?shHog(n):50;
  const mix=hzMix(n.id);const top=Math.max(...mix);const nb=hzNb(n.id);const ncr=nb.filter(x=>x[1]==='cr').length,nre=nb.length-ncr;const rv=rvValue(n)/Math.max(1,n.gdp);
  const R=hzPack(20,[['bk',Math.max(0,60-b.h)*.8],['cr',b.cr>0?25:0],['deuda',clamp((n.debtR-.8)*30,0,20)],['sec',frag*40],['hog',Math.max(0,45-hog)*.6],
    ['conc',clamp((top-.15)*100,0,15)],['cont',Math.min(18,ncr*6)+Math.min(9,nre*3)],['res',-Math.min(10,rv*50)]]);
  // eslabón más débil de la cadena hacia los bancos: el cliente de los bancos con peor salud
  let wk=null,wv=999;if(a)SH_IO.fin.forEach(([k])=>{if(k==='hog')return;const v=a[SH_I[k]];if(v<wv){wv=v;wk=k;}});
  return Object.assign(R,{nb,wk,wv:wk?wv:null,hog,bk:b.h,top});}
function hzRiskTop(k){return Object.values(G.nations).filter(n=>n.alive&&n.gdp>0).map(n=>[n.id,hzRisk(n).v]).sort((a,b)=>b[1]-a[1]).slice(0,k||8);}

/* ---------- contagio: al estallar una crisis bancaria ---------- */
function hzContagion(){const S=G.v21c||(G.v21c={cr:{}});if(!S.cr)S.cr={};const first=!S.i;S.i=1;let gw=0;for(const id in G.nations){const n=G.nations[id];if(n.alive)gw+=n.gdp;}
  const home=P&&P.alive?natOf(P).id:null;
  for(const id in G.nations){const n=G.nations[id];if(!n.alive){delete S.cr[id];continue;}const c=n.bk&&n.bk.cr>0?1:0;const was=S.cr[id]||0;if(c)S.cr[id]=1;else delete S.cr[id];
    if(first||!c||was)continue;const gx=n.gdp;
    (neighborsOf(id)||[]).forEach(y=>{const m=G.nations[y];if(!m||!m.alive)return;const w=gx/(gx+m.gdp);shHit(y,'fin',-clamp(4*w,.3,2));const bk=bnkEnsure(m);if(!(bk.cr>0))bk.h=clamp(bk.h-clamp(2*w,.2,1.5),0,100);
      if(y===home)log(`🌐 Contagio: la crisis bancaria de ${n.name} golpea a los bancos de ${m.name}.`,'bad');});
    const sh=gx/Math.max(1,gw);if(sh>.08){for(const y in G.nations){const m=G.nations[y];if(!m.alive||y===id)continue;shHit(y,'fin',-clamp(sh*10,.3,1));}
      mkNews(`Contagio mundial: la crisis bancaria de ${n.name} golpea a los bancos de todo el mundo.`,true);}}}

/* ---------- personas: el sector donde trabajan ---------- */
const HZ_JOB={'Mesero':'retail','Mesero (medio tiempo)':'retail','Obrero':'ind','Vendedor':'retail','Albañil':'inm','Campesino':'cons','Oficinista':'fin','Servidor público':'gob','Policía':'gob',
  'Técnico':'ind','Profesor':'gob','Programador':'tec','Ingeniero':'ind','Abogado':'fin','Médico':'salud'};
const HZ_EMP=[['retail',.16],['cons',.13],['ind',.13],['gob',.11],['inm',.08],['salud',.07],['trans',.06],['fin',.05],['serv',.04],['tec',.04],['auto',.03],['tel',.02],['medios',.02],['ener',.02],['ecom',.02],['min',.01],['lujo',.01],['semi',.005],['def',.005]];
function hzSecH(nid,k){const n=G.nations[nid];if(!n)return 50;return k==='gob'?hzFisc(n).v:G.sh?shOf(nid,k):50;}
function hzPeople(p){const L=[];(p.parents||[]).forEach(x=>x.alive!==false&&L.push([x,'fam']));if(p.partner)L.push([p.partner,'fam']);(p.children||[]).forEach(x=>L.push([x,'fam']));
  (p.siblings||[]).forEach(x=>L.push([x,'fam']));(p.ppl||[]).forEach(x=>{if(x&&x.name&&x.k!=='rival')L.push([x,'ami']);});return L;}
function hzEc(p,x){if(!x||x.age==null||x.age<18||!x.name)return null;
  if(!x.ec){const n=N0[natOf(p).id]||{};const rich=clamp(Math.log10(Math.max(500,(n.gdp||1e10)/Math.max(1,n.pop||1e6)))/1.2-2.6,0,1);
    const W=HZ_EMP.map(([k,w])=>[k,w*(k==='cons'?1.6-rich:/tec|fin|semi|ecom|medios/.test(k)?.4+rich:1)]);const t=W.reduce((s,e)=>s+e[1],0);let u=h21(x.name+'|sec')*t,k=W[0][0];
    for(const e of W){u-=e[1];if(u<=0){k=e[0];break;}}x.ec={s:k,e:x.age>=65?-1:h21(x.name+'|emp')<.06?0:1,m:0,y:0};}
  const e=x.ec;if(e.e!==-1&&x.age>=65){e.e=-1;delete e.hp;}return e;}
function hzPpMonth(p,t){if(!p||!p.alive||!G.sh)return;const nid=natOf(p).id;let un=0;
  hzPeople(p).forEach(([x,g])=>{const e=hzEc(p,x);if(!e||e.e<0)return;const h=hzSecH(nid,e.s);const r=h21(x.name+'|'+t);const gob=e.s==='gob';
    if(e.e===1){const risk=h<35?(35-h)/35*.03*(gob?.3:1):0;
      if(r<risk){e.e=0;e.m=0;log(gob?`🏛️ ${x.name} se queda sin empleo en el gobierno: la salud fiscal está en ${Math.round(h)}/100.`:`📉 ${x.name} pierde su empleo en ${SECT[e.s][0]}: el sector está en ${Math.round(h)}/100.`,'bad');}
      else if(h>70&&e.y!==G.year&&r>1-(h-70)/30*.05){e.y=G.year;x.rel=clamp((x.rel||50)+1,0,100);log(gob?`📈 ${x.name} recibe un aumento: al gobierno le alcanza (salud fiscal ${Math.round(h)}/100).`:`📈 ${x.name} recibe un aumento: a ${SECT[e.s][0]} le va bien (${Math.round(h)}/100).`,'good');}}
    else{e.m++;const f=.08+Math.max(0,h-40)/60*.15;
      if(r<f){e.e=1;if(e.hp){x.rel=clamp((x.rel||50)+3,0,100);delete e.hp;}const mm=e.m;e.m=0;
        log(gob?(mm===1?`💼 ${x.name} consigue empleo en el gobierno después de 1 mes.`:`💼 ${x.name} consigue empleo en el gobierno después de ${mm} meses.`):(mm===1?`💼 ${x.name} consigue empleo en ${SECT[e.s][0]} después de 1 mes.`:`💼 ${x.name} consigue empleo en ${SECT[e.s][0]} después de ${mm} meses.`),'good');}}
    if(e.e===0&&g==='fam')un++;});
  if(un)p.s.felicidad=clamp(p.s.felicidad-Math.min(.75,.25*un),0,100);}
// ayudar con dinero a quien busca empleo
const HZ_HELP=.15;
{const _it=interactions;interactions=function(p,it){const a=_it(p,it);try{const x=it.ref;const e=x&&x.ec;if(e&&e.e===0&&p.age>=18&&!p.prison){const T=U(p),c=HZ_HELP*T;const done=x.iy===G.year;
  a.push({t:`Ayudar con dinero (${fmt(c)})`,s:'+Relación, mientras busca empleo',can:!done&&p.dinero>=c,fn:()=>{p.dinero-=c;x.iy=G.year;x.rel=clamp((x.rel||50)+RI(6,10),0,100);p.s.felicidad=clamp(p.s.felicidad+1,0,100);e.hp=1;return `Le das ${fmt(c)} a ${x.name} mientras busca empleo.`;}});}}catch(e){console.warn('v21c ayudar',e);}return a;};}

/* ---------- tu empleo común ---------- */
function hzJobSec(p){return p&&p.job&&HZ_JOB[p.job.name]||null;}
function hzJobRisk(p){const k=hzJobSec(p);const w=p.job&&p.job.w;if(!k||!w)return 0;const h=hzSecH(natOf(p).id,k);
  if(k==='gob')return h<15?.004:0;if(h>=32)return 0;return (32-h)/32*.025*(w.fm?1:1.4)*(w.un?.6:1)*(w.pf>75?.5:w.pf<45?1.6:1);}
function hzJobMonth(p,t){const w=p&&p.job&&p.job.w;if(!w||p.prison||p.ruler)return;const k=hzJobSec(p);if(!k)return;const r=hzJobRisk(p);
  if(r>0&&h21(w.nm+'|rec|'+t)<r){const h=Math.round(hzSecH(natOf(p).id,k));log(k==='gob'?`📉 El gobierno recorta plazas: su salud fiscal está en ${h}/100.`:`📉 ${w.nm} recorta personal: ${SECT[k][0]} está en ${h}/100.`,'bad');jbFire(p,'rec');}}
{const _ev=jbEval;jbEval=function(p){const w=p&&p.job&&p.job.w;const b0=p&&p.job?(p.job.bonus||1):1;const n0=w?w.evs.length:0;const e0=w?w.evs[w.evs.length-1]:null;_ev(p);
  try{if(!w||!p.job||p.job.w!==w)return;const e=w.evs[w.evs.length-1];if(!e||e===e0&&w.evs.length===n0)return;const k=hzJobSec(p);if(!k)return;const h=Math.round(hzSecH(natOf(p).id,k));
    if(h<35&&e.fx>0){p.job.bonus=b0;const f=e.fx;e.fx=0;e.fz=1;log(k==='gob'?`⏸️ El gobierno congela los sueldos públicos: su salud fiscal está en ${h}/100 y se revierte tu aumento de ${f} %.`:`⏸️ ${w.nm} congela los aumentos: ${SECT[k][0]} está en ${h}/100 y se revierte tu aumento de ${f} %.`,'bad');}
    else if(h>65&&(e.r==='e'||e.r==='b'||e.r==='r')){const x=Math.round((h-65)/30*1.5*10)/10;if(x>=.1){p.job.bonus=(p.job.bonus||1)*(1+x/100);e.fx=Math.round(((e.fx||0)+x)*10)/10;
      log(k==='gob'?`📈 La buena salud fiscal del gobierno (${h}/100) suma ${x} % a tu sueldo.`:`📈 El buen momento de ${SECT[k][0]} (${h}/100) suma ${x} % a tu sueldo.`,'good');}}}catch(er){console.warn('v21c evaluación',er);}};}

/* ---------- malestar en tus empresas (salud social muy baja) ---------- */
{const _bm=bzMonth;bzMonth=function(p,b){_bm(p,b);try{if(p!==P||!b||!b.v14||!G.sh||!bzList(p).includes(b))return;const s=hzBizSoc(b).v;
  if(s<30){b.rep=clamp(b.rep-.5,0,100);if(b.hzw!==G.year){b.hzw=G.year;log(`😠 Malestar en ${b.n}: sueldos bajos o exceso de trabajo dañan su reputación.`,'bad');}}}catch(e){console.warn('v21c malestar',e);}};}

/* ---------- reloj propio de las personas (el avance rápido llama ageUp sin cierres de mes) ---------- */
function hzTick(p){const c=p.hzm||(p.hzm={y:G.year,mi:monthOfDay(G.day||0)});if(c.y!==G.year){c.y=G.year;c.mi=0;}if(c.mi>=12)return;const t=G.year*12+c.mi;c.mi++;hzPpMonth(p,t);hzJobMonth(p,t);}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(!G||!G.mk||!G.sh)return;hzContagion();if(P&&P.alive)hzTick(P);}catch(e){console.warn('v21c mes',e);}};}
{const _au=ageUp;ageUp=function(){const p=P;if(G&&p&&p.alive&&!p.event&&G.sh){try{if(!p.hzm)p.hzm={y:G.year,mi:monthOfDay(G.day||0)};for(let i=0;i<12;i++){const c=p.hzm;if(!p.alive||c.y===G.year&&c.mi>=12)break;hzTick(p);}}catch(e){console.warn('v21c año',e);}}
  _au();try{if(G&&G.sh)hzContagion();}catch(e){console.warn('v21c contagio',e);}};}
