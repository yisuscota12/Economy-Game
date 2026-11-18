/* ===== v1.3: monedas reales, banco central, reformas monetarias y bolsa de valores =====
   Unidad interna del dinero personal: la moneda de tu país dividida entre su tipo de cambio de 2026 (n.D = unidades locales por unidad interna).
   Tipo de cambio de cada moneda = base × (precios de su zona / precios de EE. UU.) × e^q  (paridad de poder de compra + desvío real q).
   El PIB y el tesoro siguen en dólares de 2026 (fmtN); el dinero de las personas se muestra en su moneda (fmt). */
const gz=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const ZT=new Float64Array(8192);{let q=0;for(let i=0;i<4096;i++){const z=gz();ZT[2*i]=z;ZT[2*i+1]=-z;q+=z*z;}const k=Math.sqrt(4096/q);for(let i=0;i<8192;i++)ZT[i]*=k;} // tabla simétrica: media 0 y varianza 1 exactas
const gq=()=>ZT[(Math.random()*8192)|0];
const gzt=()=>{const r=Math.random();const z=ZT[(r*1e6|0)&8191];return r<.03?clamp(z*1.9,-5,5):z;}; // colas gruesas: días extremos más frecuentes que en una normal
function mkH(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mkU(a,b){let x=(Math.imul(a^0x9e3779b9,0x85ebca6b)^Math.imul(b+0x632be5ab,0xc2b2ae35))>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return (x>>>0)/4294967296;}
const mkZ=(a,b)=>(mkU(a,b)+mkU(a,b+7919)+mkU(a,b+15731)-1.5)*2; // casi normal, determinista
const rp=x=>+(+x).toPrecision(5);
let CURV='loc'; // 'loc' = moneda local · 'usd' = dólares (lo cambia Ajustes)
const CC0=['CHN','VEN','IRN','CUB','PRK','MMR','ETH']; // controles de capital vigentes en 2026 (aprox.)
const CGT={MEX:.10,USA:.15,CHE:0,SGP:0,ARE:0,SAU:0,QAT:0,KWT:0,BHR:0,OMN:0,KOR:0,TWN:0,NZL:0,BEL:0,BRA:.15,ARG:0,DEU:.26,FRA:.30,GBR:.20,JPN:.20,CAN:.25,ESP:.21,ITA:.26,IND:.125,NLD:.30,SWE:.30,AUS:.23,CHN:.20,COL:.15,CHL:.20};
const OLD_CUR={DEU:['DEM','DM','marco alemán'],FRA:['FRF','F','franco francés'],ITA:['ITL','L.','lira italiana'],ESP:['ESP','Pts','peseta'],PRT:['PTE','Esc','escudo portugués'],GRC:['GRD','Dr','dracma'],NLD:['NLG','ƒ','florín'],
  BEL:['BEF','FB','franco belga'],AUT:['ATS','S','chelín austriaco'],IRL:['IEP','IR£','libra irlandesa'],FIN:['FIM','mk','marco finlandés'],LUX:['LUF','F','franco luxemburgués'],SVN:['SIT','SIT','tólar'],SVK:['SKK','Sk','corona eslovaca'],
  EST:['EEK','kr','corona estonia'],LVA:['LVL','Ls','lats'],LTU:['LTL','Lt','litas'],CYP:['CYP','£C','libra chipriota'],MLT:['MTL','Lm','lira maltesa'],HRV:['HRK','kn','kuna'],BGR:['BGN','лв','lev'],MNE:['MNP','€','perper'],
  XKX:['XKD','din','dinar kosovar'],ECU:['ECS','S/.','sucre'],SLV:['SVC','₡','colón salvadoreño'],PAN:['PAB','B/.','balboa'],TLS:['TLE','Esc','escudo timorense']};

/* ===================== MONEDAS ===================== */
const cxOf=n=>G.cx[n.cur];
const fxOf=c=>(G.cx[c]||{fx:1}).fx;
function ensureV13(){if(!G)return;if(!G.cx){G.cx={};
    for(const c in CUR0){const d=CUR0[c];const [rg,anc]=d[3].split(':');G.cx[c]={sym:d[0],nm:d[1],fx:d[2],b:d[2],cp:1,q:0,reg:rg,anc:anc||null,v:d[4]!=null?d[4]:.08,pr:d[5]!=null?d[5]:null,h:[],y0:2026,rd:[]};}
    for(const c in G.cx){const x=G.cx[c];if(x.anc)x.peg=x.fx/G.cx[x.anc].fx;}
    const mem={};for(const id in G.nations)(mem[NCUR[id]||'USD']=mem[NCUR[id]||'USD']||[]).push(id);
    for(const c in G.cx){const x=G.cx[c],m=mem[c]||[];x.iss=c==='USD'?'USA':['EUR','XOF','XAF'].includes(c)?null:c==='HKD'?'CHN':m.length?m.slice().sort((a,b)=>G.nations[b].gdp-G.nations[a].gdp)[0]:null;
      if(x.pr==null){const ns=m.map(i=>N0[i]).filter(Boolean);const inf=ns.length?ns.reduce((s,d)=>s+d.infl,0)/ns.length:3,ld=ns.length?ns.reduce((s,d)=>s+d.lend,0)/ns.length:8;
        x.pr=x.anc?null:Math.round(clamp(Math.min(inf+2,ld-2),.5,60)*4)/4;}}
    for(const c in G.cx){const x=G.cx[c];if(x.pr==null)x.pr=(G.cx[x.anc].pr||3)+1;}}
  for(const id in G.nations){const n=G.nations[id];if(n.cur)continue;const d=N0[id]||{lend:8};n.cur=NCUR[id]||'USD';n.D=G.cx[n.cur].b;
    const x=G.cx[n.cur];n.spr=Math.max(.5,(d.lend||8)-x.pr);n.cbA=true;n.mpr=0;n.cc=CC0.includes(id);n._pt=0;
    if(G.year===2026&&INFL26[id]!=null&&isReal())n.infl=INFL26[id];}
  ensureMk();if(P&&!P._cur)P._cur=natOf(P).id;}
let CXM=null;const cxDirty=()=>{CXM=null;};
function cxMembers(c){if(!CXM||CXM.g!==G){CXM={g:G,m:{}};for(const id in G.nations){const n=G.nations[id];if(n.alive)(CXM.m[n.cur]||(CXM.m[n.cur]=[])).push(n);}}return CXM.m[c]||[];}
// el dinero de una persona vale (en dólares) dinero × D / tipo de cambio
const usdPerInt=n=>n.D/fxOf(n.cur);
function intConv(from,to){return usdPerInt(from)/usdPerInt(to);}
// convierte los ahorros cuando la persona cambia de país (emigrar, anexión, sucesión)
function curSync(p){if(!p||!G||!G.cx)return;const n=natOf(p);if(!p._cur){p._cur=n.id;return;}if(p._cur===n.id)return;
  const from=G.nations[p._cur];p._cur=n.id;if(!from||!from.D)return;const k=intConv(from,n);if(!isFinite(k)||Math.abs(k-1)<1e-6)return;
  const c0=cxOf(from),c1=cxOf(n);const before=fmtC(p.dinero*from.D,from.cur);p.dinero*=k;(p.debts||[]).forEach(d=>{d.bal*=k;d.pay*=k;});if(p.house)p.house.val*=k;(p.assets||[]).forEach(a=>a.val*=k);
  (p.inv||[]).forEach(v=>{v.val*=k;v.amt*=k;});if(p.biz&&p.biz.last)p.biz.last*=k;if(p.bk)p.bk.loan*=k,p.bk.rl*=k;
  if(from.cur!==n.cur&&Math.abs(p.dinero)>1)log(`Cambio de moneda: tus ahorros de ${before} (${c0.nm}) ahora son ${fmt(p.dinero)} (${c1.nm}), al tipo de cambio del día.`,'');}
/* ----- formato de dinero ----- */
const _fmt0=fmt;
const SYM_SUF=new Set(['kr','Kč','zł','Ft','lei',"so'm",'ден','дин','лв','Fr.','с','m','Sk','Lt','Ls','mk','din','Dr']);
function fmtAmt(v,sym){const s=_fmt0(v).replace('$','');const suf=SYM_SUF.has(sym);
  return suf?s.replace('-','−')+' '+sym:(s[0]==='-'?'−':'')+sym+s.replace('-','');}
function fmtC(v,c){const x=G&&G.cx&&G.cx[c];let sym=x?x.sym:'$';if(sym==='$'&&P&&G.nations[P._cur]&&G.nations[P._cur].cur!==c)sym=c==='USD'?'US$':c.slice(0,2)+'$';return fmtAmt(v,sym);}
fmt=function(v){if(!G||!G.cx||!P)return _fmt0(v);const n=G.nations[P._cur]||natOf(P);if(!n||!n.D)return _fmt0(v);
  if(CURV==='usd')return fmtAmt(v*usdPerInt(n),'US$');if(n.cur==='USD')return _fmt0(v*n.D);return fmtC(v*n.D,n.cur);};
function fmtPx(v,c){const x=G.cx[c];let sym=x?x.sym:'$';if(sym==='$'&&P&&G.nations[P._cur]&&G.nations[P._cur].cur!==c)sym=c==='USD'?'US$':c.slice(0,2)+'$';const a=Math.abs(v),d=a>=10000?0:a>=1?2:4;const t=a.toLocaleString('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d});return SYM_SUF.has(sym)?t+' '+sym:sym+t;}
let fmtN=v=>{const s=_fmt0(v);return s.replace("$","US$");}; // cifras nacionales: dólares de 2026 (v1.8a: let, para la divisa de visualización)
const curLabel=n=>{const x=cxOf(n);return `${x.nm} (${n.cur})`;};
/* ----- banco central y tipo de cambio: cada mes ----- */
const CXORD=c=>c==='USD'?0:['EUR','ZAR','INR'].includes(c)?1:G.cx[c].anc?2:1;
function cxInfl(m){const w=m.reduce((s,n)=>s+n.gdp,0)||1;return m.reduce((s,n)=>s+(isReal()?n.infl:0)*n.gdp,0)/w;}
function cxGrowth(m){const w=m.reduce((s,n)=>s+n.gdp,0)||1;return m.reduce((s,n)=>s+(n.g||0)*n.gdp,0)/w;}
const cxPlayer=c=>{const x=G.cx[c];return x&&x.iss&&playerRules(x.iss)&&!G.nations[x.iss].cbA;};
function cxSetRate(c,v,why){const x=G.cx[c];const d=Math.round((v-x.pr)*4)/4;if(!d)return 0;x.pr=Math.max(c==='CHF'||c==='JPY'?-.75:0,Math.round(v*4)/4);
  cxMembers(c).forEach(n=>{n.rate=Math.max(1,x.pr+n.spr+(n.cur!==c?0:0));});mkRate(c,d,why);return d;}
function cxMonth(){ensureV13();cxDirty();const cs=Object.keys(G.cx).sort((a,b)=>CXORD(a)-CXORD(b));const us=G.cx.USD,usM=cxMembers('USD');
  const real=isReal();
  for(const c of cs){const x=G.cx[c];const m=cxMembers(c);if(!m.length&&c!=='USD'&&c!=='HKD'){x.dead=1;continue;}x.dead=0;
    const mm=c==='HKD'?[G.nations.CHN].filter(n=>n&&n.alive):m;const pi=mm.length?cxInfl(mm):2,g=mm.length?cxGrowth(mm):2;x.pi=pi;
    if(real)x.cp*=Math.pow(1+pi/100,1/12);
    // tasa de interés: regla de Taylor (bancos autónomos); los tipos fijos siguen al ancla con prima de riesgo
    if(x.reg==='fijo'||x.reg==='caja'){const a=G.cx[x.anc];const mis=Math.log((x.b*(x.cp/us.cp)*Math.exp(x.q))/x.fx);x.mis=mis;
      if(!cxPlayer(c)){const t=a.pr+(x.reg==='caja'?.5:1)+Math.max(0,mis)*8;if(Math.abs(t-x.pr)>=.5)cxSetRate(c,x.pr+clamp(t-x.pr,-1,1),'ancla');}}
    else if(real&&!cxPlayer(c)){const adv=mm.length&&mm.reduce((s,n)=>s+gdppc(n),0)/mm.length>25000;const tgt=adv?2:3.5;
      const t=clamp(1+pi+.5*(pi-tgt)+.25*(g-2.5),c==='JPY'||c==='CHF'?-.5:0,180);const d=clamp(.2*(t-x.pr),-1.5,1.5);if(Math.abs(d)>=.25)cxSetRate(c,x.pr+d,'taylor');}
    if(c==='USD'){x.fx=1;continue;}
    // desvío real: vuelve poco a poco a la paridad; lo mueven el diferencial de tasas, la impresión de dinero y los choques
    const rr=x.pr-pi,rrUS=us.pr-(us.pi||2);const mp=m.reduce((s,n)=>s+(n.mpr||0),0)/Math.max(1,m.length);const sh=x._sh||0;x._sh=0;
x.q+=-.025*x.q+x.v/Math.sqrt(12)*gzt()-.0012*clamp(rr-rrUS,-15,15)+mp*.004+sh+(m.some(n=>n.stab<25)?.008:0);
    const fxF=x.b*(x.cp/us.cp)*Math.exp(x.q);const f0=x.fx;
    if(x.reg==='flot')x.fx=fxF;else if(x.reg==='adm')x.fx=x.fx*Math.pow(fxF/x.fx,.35);else if(x.anc){x.fx=x.peg*G.cx[x.anc].fx;cxCrisisCheck(c,fxF);}
    x.h.push(x.fx);if(x.h.length>132)x.h.splice(0,12);}
  cxAI();}
function cxCrisisCheck(c,fxF){const x=G.cx[c];const mis=Math.log(fxF/x.fx);const m=cxMembers(c);const war=m.some(n=>warsOf(n.id).length);
  const p=(x.reg==='caja'?.0002:.0006)+Math.max(0,mis-(x.reg==='caja'?.35:.15))*.5+(war?.004:0)+(m.some(n=>n.stab<25)?.003:0);
  if(!chance(p))return;const ruled=m.find(n=>playerRules(n.id));
  if(ruled&&P&&P.alive&&!P.event){G._atk={c,fxF};const e=EV.find(e=>e.id==='m_ataque');if(e)setEvent(P,e);return;}
  cxDevalue(c,fxF*1.12,chance(.5)?'flot':x.reg,'ataque especulativo');}
function cxDevalue(c,nf,reg,why){const x=G.cx[c];const f0=x.fx;const pc=Math.round((nf/f0-1)*100);if(pc<=0)return;
  x.fx=nf;if(reg&&reg!==x.reg){x.reg=reg;if(reg==='flot'||reg==='adm'){x.anc=null;x.peg=null;}}if(x.anc)x.peg=nf/G.cx[x.anc].fx;
  x.q=Math.log(nf/(x.b*(x.cp/G.cx.USD.cp)));const m=cxMembers(c);
  m.forEach(n=>{n._pt=(n._pt||0)+25*Math.log(nf/f0);if(isReal())n.rec=Math.max(n.rec||0,1);n.stab=clamp(n.stab-RI(5,10),0,100);if(isReal())n.approval=clamp(n.approval-RI(4,9),3,95);mkLocalShock(n.id,-R(.18,.32),RI(6,14),'crisis cambiaria');});
  const who=m.length?m.map(n=>n.name).slice(0,3).join(', '):(x.nm==='dólar de Hong Kong'?'Hong Kong':((G.nations[x.iss]||{}).name||x.nm)); /* v1.7o: el HKD no tiene país miembro (antes «Crisis cambiaria en : …») */mkNews((why==='ataque especulativo'?(x.reg==='flot'?`Crisis cambiaria en ${who}: tras un ataque especulativo, ${elC(x.nm)} se devalúa ${pc} % (${rp(f0)} → ${rp(nf)} por dólar) y pasa a flotar.`:`Crisis cambiaria en ${who}: tras un ataque especulativo, ${elC(x.nm)} se devalúa ${pc} % (${rp(f0)} → ${rp(nf)} por dólar).`):(x.reg==='flot'?`Crisis cambiaria en ${who}: ${elC(x.nm)} se devalúa ${pc} % (${rp(f0)} → ${rp(nf)} por dólar) y pasa a flotar.`:`Crisis cambiaria en ${who}: ${elC(x.nm)} se devalúa ${pc} % (${rp(f0)} → ${rp(nf)} por dólar).`)),true);}
/* ----- reformas ----- */
function cxRedenom(c,zeros,nm){const x=G.cx[c];const f=Math.pow(10,zeros);const old=x.nm;
  x.b/=f;x.fx/=f;if(x.peg)x.peg/=f;x.h=x.h.map(v=>rp(v/f));for(const k in G.cx){const y=G.cx[k];if(y.anc===c&&y.peg)y.peg*=f;}
  cxMembers(c).forEach(n=>n.D/=f);for(const id in G.nations){const n=G.nations[id];if(!n.alive&&n.cur===c)n.D/=f;}
  if(nm)x.nm=nm;x.rd.push({y:G.year,z:zeros,a:old});mkCurScale(c,1/f);
  mkNews(((w_,u_)=>zeros===1?(nm?`Reforma monetaria: ${w_} quita un cero a su moneda; nace ${elC(nm)}. Cada ${x.nm} equivale a ${u_} unidades de la moneda anterior.`:`Reforma monetaria: ${w_} quita un cero a su moneda. Cada ${x.nm} equivale a ${u_} unidades de la moneda anterior.`):(nm?`Reforma monetaria: ${w_} quita ${zeros} ceros a su moneda; nace ${elC(nm)}. Cada ${x.nm} equivale a ${u_} unidades de la moneda anterior.`:`Reforma monetaria: ${w_} quita ${zeros} ceros a su moneda. Cada ${x.nm} equivale a ${u_} unidades de la moneda anterior.`))(cxMembers(c).map(n=>n.name).slice(0,2).join(', ')||'el emisor',f.toLocaleString('es-MX')),true);}
function natAdopt(nid,c,why){const n=G.nations[nid];const old=n.cur;if(old===c)return;const k=fxOf(c)/fxOf(old);n.D*=k;n.cur=c;n.mpr=0;cxDirty();
  const x=G.cx[c];n.spr=Math.max(.5,n.spr);n.rate=Math.max(1,x.pr+n.spr);mkExCur(nid,old,c);
  if(P&&P.alive&&natOf(P).id===nid&&P._cur===nid)log(`Tu país cambia de moneda: ahora usas ${elC(x.nm)}. Tu dinero se convierte al tipo del día (${rp(1/k)} ${G.cx[old].nm} por ${x.nm}).`,'big');
  mkNews(((a_,b_,c_)=>({'para frenar la hiperinflación':`${a_} adopta ${b_} para frenar la hiperinflación. ${c_} deja de circular.`,'tras cumplir los criterios de Maastricht':`${a_} adopta ${b_} tras cumplir los criterios de Maastricht. ${c_} deja de circular.`,'como miembro de la zona euro':`${a_} adopta ${b_} como miembro de la zona euro. ${c_} deja de circular.`,'como moneda propia':`${a_} adopta ${b_} como moneda propia. ${c_} deja de circular.`})[why]||(why?`${a_} adopta ${b_} ${why}. ${c_} deja de circular.`:`${a_} adopta ${b_}. ${c_} deja de circular.`))(n.name,elC(x.nm),ElC(G.cx[old].nm)),true);}
function natNewCur(nid,nm,sym){const n=G.nations[nid];const old=n.cur,o=G.cx[old];const oc=OLD_CUR[nid];let code=oc?oc[0]:nid.slice(0,2)+'N';while(G.cx[code]&&!G.cx[code].dead)code=code.slice(0,2)+String.fromCharCode(65+RI(0,25));
  const fx=o.fx;G.cx[code]={sym:sym||(oc?oc[1]:'$'),nm:nm||(oc?oc[2]:`nueva moneda de ${n.name}`),fx,b:fx/(o.cp/G.cx.USD.cp),cp:o.cp,q:0,reg:'flot',anc:null,v:.14,pr:o.pr+2,h:[rp(fx)],y0:G.year,rd:[],iss:nid};
  natAdopt(nid,code,'como moneda propia');G.cx[code].q=.25;n.stab=clamp(n.stab-10,0,100);if(isReal())n.rec=Math.max(n.rec||0,1);mkLocalShock(nid,-.25,10,'salida de la unión monetaria');return code;}
function cxSetRegime(c,reg,anc){const x=G.cx[c];x.reg=reg;if(reg==='fijo'||reg==='caja'){x.anc=anc;x.peg=x.fx/G.cx[anc].fx;x.pegY=G.year;}else{x.anc=null;x.peg=null;}
  {const w_=cxMembers(c).map(n=>n.name)[0]||x.nm;mkNews(reg==='flot'?`${w_}: ${elC(x.nm)} pasa a flotar libremente.`:reg==='adm'?`${w_}: ${elC(x.nm)} pasa a flotación administrada.`:reg==='caja'?`${w_}: ${elC(x.nm)} queda en caja de conversión contra ${elC(G.cx[anc].nm)} (${rp(x.peg)} por unidad).`:`${w_}: ${elC(x.nm)} queda fijo contra ${elC(G.cx[anc].nm)} (${rp(x.peg)} por unidad).`,false);}}
function euroOK(n){const ez=G.cx.EUR;ensureEco(n);const pi=isReal()?n.infl:2;return pi<=(ez.pi||2)+1.5&&n.debtR<=.9&&(cxOf(n).anc==='EUR'?(G.year-(cxOf(n).pegY||0)>=2):false)&&n.stab>=40;}
/* ----- IA: reformas que ocurren solas (con causa) ----- */
function cxAI(){const real=isReal();const mo=G.mk?G.mk.mo:0;
  const SC=G.sch||(G.sch={});CUR_SCHED.forEach(s=>{if(!SC[s.c+s.y]&&G.year>=s.y&&G.cx[s.c]&&!G.cx[s.c].dead&&!(G.cx[s.c].iss&&playerRules(G.cx[s.c].iss))){SC[s.c+s.y]=1;cxRedenom(s.c,Math.round(Math.log10(s.f)),s.nm);}});
  for(const c in G.cx){const x=G.cx[c];if(x.dead||c==='USD')continue;const m=cxMembers(c);if(!m.length)continue;const iss=x.iss&&G.nations[x.iss];if(iss&&playerRules(iss.id))continue;
    if(CUR_SCHED.some(s=>s.c===c&&!SC[s.c+s.y]))continue;
    const pi=x.pi||0;
    if(x.fx>=1e5&&pi>20&&chance(.015)){cxRedenom(c,Math.max(3,Math.floor(Math.log10(x.fx))-1),chance(.4)?nuevoC(x.nm):null);continue;}
    if(real&&m.length===1&&m[0].infl>150){const n=m[0];n._hy=(n._hy||0)+1;if(n._hy>=12&&chance(.04)){n._hy=0;
      if(['ECU','SLV','PAN','GTM','HND','NIC','BOL','VEN','ZWE','CUB','HTI','LBR'].includes(n.id)&&chance(.35)){natAdopt(n.id,'USD','para frenar la hiperinflación');}
      else{n.sp=3;n.mpr=0;cxSetRate(c,x.pr+10,'plan');const z=Math.max(3,Math.floor(Math.log10(x.fx))-1);cxRedenom(c,z,nuevoC(x.nm));
        mkNews(`${n.name} lanza un plan de estabilización: recorte del gasto, fin de la emisión de dinero y tasas al alza.`,true);}}}else m.forEach(n=>n._hy=0);
    if(c==='EUR')continue;}
  for(const id in G.nations){const n=G.nations[id];if(!n.alive||playerRules(id))continue;
    const ws=warsOf(id);if(ws.length&&ws.some(w=>(w.years||0)>=2)&&n.stab<35&&!n.mpr&&chance(.02)){n.mpr=3;mkNews(`${n.name} financia la guerra imprimiendo dinero.`,false);}
    else if(!ws.length&&n.mpr&&chance(.08))n.mpr=0;
    if(mo%12===0&&EU_IN.includes(id)&&id!=='DNK'&&n.cur!=='EUR'){const x=cxOf(n);if(x.reg!=='fijo'&&x.reg!=='caja'&&chance(.06)&&n.stab>45){cxSetRegime(n.cur,'fijo','EUR');}
      else if(euroOK(n)&&chance(.3))natAdopt(id,'EUR','tras cumplir los criterios de Maastricht');}}}
/* ----- inflación y crecimiento con política monetaria (se aplica al cerrar el año) ----- */
{const _sw=simWorld;simWorld=function(){ensureV13();const real=isReal();const before={};if(real)for(const id in G.nations)before[id]=G.nations[id].infl;
  _sw();if(!real)return;const us=G.cx.USD,ez=G.cx.EUR;
  // traspaso a precios: la depreciación del año por encima del diferencial de inflación (umbral de 5 %) sube la inflación
  for(const c in G.cx){const x=G.cx[c];if(x.dead)continue;const f0=x.fy||x.fx;x.fy=x.fx;const dep=Math.log(x.fx/f0)-((x.pi||2)-(us.pi||2))/100;if(dep>.05)cxMembers(c).forEach(n=>n._pt=(n._pt||0)+25*(dep-.05));}
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;const x=cxOf(n);const i0=n.infl;let e=0;
    const rr=x.pr-i0;e+=-.25*clamp(rr-1,-30,30);e+=(n.mpr||0)*(2+Math.max(0,i0)/50);e+=Math.min(60,n._pt||0);n._pt=0;if(!n.cbA)e+=1;
    const iss=x.iss===id||(x.iss==null&&false);
    if(!iss&&(n.cur==='USD'||n.cur==='EUR'||x.reg==='union'))e+=.6*(((n.cur==='USD'?us.pi:n.cur==='EUR'?ez.pi:x.pi)||2)-i0);
    else if(x.reg==='caja')e+=.5*((G.cx[x.anc].pi||2)-i0);else if(x.reg==='fijo')e+=.3*((G.cx[x.anc].pi||2)-i0);
    if(n.sp>0){e-=.35*Math.max(0,i0);n.sp--;}
    if(n.mpr&&playerRules(id))n.treas=(n.treas||0)+n.gdp*n.mpr/100; // señoreaje: lo impreso entra al tesoro
    n.infl=clamp(i0+e,-3,5000);if(before[id]!=null)n.price*=(1+n.infl/100)/(1+i0/100);}};}
{const _eb=ecoBonus;ecoBonus=function(n){let b=_eb(n);if(!G||!G.cx||!n.cur)return b;const x=cxOf(n);const rr=x.pr-(isReal()?n.infl:2);
  b+=clamp(-.15*(rr-1),-2.5,1);if(n.cc)b-=.4;if(isReal()&&n.infl>12)b-=clamp((n.infl-12)*.03,0,5);if(x.mis>.2)b-=clamp((x.mis-.2)*4,0,2);return b;};}
function mpLabel(v){return ['ninguna','1 % del PIB al año','3 % del PIB al año','6 % del PIB al año','10 % del PIB al año'][[0,1,3,6,10].indexOf(v)]||v+' % del PIB';}

/* ===================== BOLSA DE VALORES ===================== */
const EXN={};for(const k in EXCH0)(EXN[EXCH0[k].n]=EXN[EXCH0[k].n]||[]).push(k);
const RHO={US:.9,CA:.75,UK:.75,DE:.75,FR:.75,NL:.75,CH:.7,ES:.7,IT:.7,SE:.7,JP:.6,AU:.65,SG:.6,HK:.55,TW:.6,KR:.6,IN:.5,ID:.45,MX:.6,BR:.55,CL:.55,CO:.5,AR:.35,PL:.6,TR:.4,ZA:.55,SA:.4,IL:.6,CN:.3,RU:.2,NG:.2,EG:.3};
function ensureMk(){if(G.mk)return;const M={v:1,t:0,dc:0,doy:G.day||0,wk:0,mo:0,gs:0,cr:null,X:{},C:{},ev:[]};G.mk=M;
  for(const k in EXCH0){const e=EXCH0[k];M.X[k]={lv:e.lv,s:0,h:[e.lv],w:[e.lv],m:[e.lv],cur:e.cur||NCUR[e.n]||'USD',lc:null,sub:(e.sub||[]).map(s=>({lv:s[1],h:[s[1]],w:[s[1]],m:[s[1]]}))};}
  CO0.forEach(c=>{const [id,nm,x,sec,p,cap,pe,dy,b,v]=c;const cur=M.X[x].cur;const sh=cap*1e9*G.cx[cur].fx/p;
    M.C[id]={nm,x,sec,p,eps:p/pe,pe0:pe,sh,dy,b,v,d:gz()*.02,q:mkH(id)%63,h:[p],w:[p],m:[p]};});
  mkBackfill(M);}
// historia previa a 2026 (5 años) para que las gráficas tengan datos desde el primer día: caminata aleatoria hacia atrás que termina en el precio real de inicio
function mkBackfill(M){const back=(o,vol,mu)=>{const N=1260,a=new Array(N);let v=o.h[o.h.length-1];a[N-1]=v;const sd=vol/TD;
    for(let i=N-2;i>=0;i--){v/=Math.exp(mu/252+sd*gzt()-sd*sd/2);a[i]=v;}o.h=a.slice(-130);o.w=[];for(let i=N-1;i>=0;i-=5)o.w.unshift(a[i]);o.w=o.w.slice(-60);o.m=[];for(let i=N-1;i>=0;i-=21)o.m.unshift(a[i]);o.m=o.m.slice(-60);};
  for(const k in M.X){const e=EXCH0[k],d=N0[e.n]||{gdpg:2,infl:3};const mu=(d.gdpg*.8+clamp(d.infl,0,40)+1.5)/100;back(M.X[k],e.vol,mu);M.X[k].sub.forEach((s,i)=>back(s,e.vol*e.sub[i][2],mu));}
  for(const id in M.C){const c=M.C[id],e=EXCH0[c.x];const d=N0[e.n]||{gdpg:2,infl:3};back(c,Math.sqrt(Math.pow(c.b*e.vol,2)+c.v*c.v),(d.gdpg*.8+clamp(d.infl,0,40)+1.5+SECT[c.sec][1])/100);}
  for(const k in G.cx){const x=G.cx[k];if(k==='USD')continue;const d=(x.iss&&N0[x.iss])||{infl:3};const us=N0.USA.infl;let v=x.fx;const a=[v];for(let i=0;i<24;i++){v/=Math.exp((clamp(d.infl,-2,60)-us)/1200+x.v/Math.sqrt(12)*gz()*.6);a.unshift(v);}
    if(x.reg==='fijo'||x.reg==='caja'||x.v<.015)x.h=a.map(()=>x.fx);else x.h=a;}}
// macro de la bolsa: crecimiento nominal esperado del país donde cotiza
function mkMu(k){const e=EXCH0[k]||{n:'USA'};const n=G.nations[e.n];if(!n||!n.alive)return 0;const real=isReal();return clamp((n.g||2)*.8+(real?n.infl:0)+1.5,-20,400)/100;}
function mkVol(k){const M=G.mk,x=M.X[k],e=EXCH0[k];let v=e.vol;const n=G.nations[e.n];if(n&&warsOf(n.id).length)v*=1.15;if(M.cr)v*=1.8;if(x.lc)v*=1.6;if(n&&!n.alive)v*=1.5;return v;}
function mkNews(t,big,k){if(!G.mk)return;const M=G.mk;M.ev.push({y:G.year,d:M.doy||0,t,k:k||''});if(M.ev.length>80)M.ev.shift();if(big&&typeof archiveNews==='function'){archiveNews(t,'news','int');const A=G.nw;const z=A&&A[A.length-1];if(z&&z.t===t){z.y=G.year;z.d=Math.min(364,M.doy||0);}}}
function mkLocalShock(nid,amt,days,why){const ks=EXN[nid];if(!ks||!G.mk)return;ks.forEach(k=>{const x=G.mk.X[k];x.lc={left:days,dd:amt/days,why};});
  if(Math.abs(amt)>=.1)mkNews((amt<0?`${EXCH0[ks[0]].ix}: caída fuerte por ${why} en ${G.nations[nid].name}.`:`${EXCH0[ks[0]].ix}: alza fuerte por ${why} en ${G.nations[nid].name}.`),false);}
function mkSectorShock(sec,amt,nid){const M=G.mk;for(const id in M.C){const c=M.C[id];if(c.dead||c.sec!==sec)continue;const loc=nid&&EXCH0[c.x].n===nid;c.p*=Math.exp(amt*(loc?1:.35));}}
function mkRate(c,d,why){if(!G.mk)return;const M=G.mk;for(const k in M.X){const x=M.X[k];if(x.cur!==c)continue;const imp=-.012*d;x.s+=imp;x.lv*=Math.exp(imp);x.sub.forEach(s=>s.lv*=Math.exp(imp));
    for(const id in M.C){const co=M.C[id];if(co.x!==k||co.dead)continue;co.p*=Math.exp(imp*co.b+.006*d*(SECT[co.sec][2]));}}
  const x=G.cx[c];const imp=['USD','EUR','JPY','GBP','CNY'].includes(c)||(P&&G.nations[P._cur]&&G.nations[P._cur].cur===c);if(Math.abs(d)>=.75&&why!=='ancla'&&imp){const who=cbName(c).replace(/^./,q=>q.toUpperCase());
    mkNews((d>0?`${who} sube su tasa ${Math.abs(d).toFixed(2)} puntos, a ${x.pr.toFixed(2)} %. Las bolsas lo resienten.`:`${who} baja su tasa ${Math.abs(d).toFixed(2)} puntos, a ${x.pr.toFixed(2)} %. Las bolsas lo celebran.`),true);}}
// cuando una moneda quita ceros o se cambia, los precios en esa moneda se reescalan
function mkCurScale(c,f){const M=G.mk;if(!M)return;for(const k in M.X){if(M.X[k].cur!==c)continue;for(const id in M.C){const co=M.C[id];if(co.x!==k)continue;co.p*=f;co.eps*=f;if(co.ix)co.k*=f;['h','w','m'].forEach(a=>co[a]=co[a].map(v=>rp(v*f)));
      if(P&&P.bk){const ps=P.bk.pos[id];if(ps)ps.c*=f;P.bk.ord.forEach(o=>{if(o.id===id&&o.px)o.px*=f;});}}}}
function mkExCur(nid,old,c){const M=G.mk;if(!M)return;(EXN[nid]||[]).forEach(k=>{const x=M.X[k];if(x.cur!==old)return;x.cur=c;const f=fxOf(c)/fxOf(old);
  for(const id in M.C){const co=M.C[id];if(co.x!==k)continue;co.p*=f;co.eps*=f;if(co.ix)co.k*=f;['h','w','m'].forEach(a=>co[a]=co[a].map(v=>rp(v*f)));if(P&&P.bk){const ps=P.bk.pos[id];if(ps)ps.c*=f;P.bk.ord.forEach(o=>{if(o.id===id&&o.px)o.px*=f;});}}});}
/* ----- un día de mercado ----- */
const TD=Math.sqrt(252);
function mkDay(k){const M=G.mk;M.dc++;const wd=(M.dc+3)%7;M.doy++;
  if(k){if(wd===5)mkTrade(5,5);}else if(wd!==0&&wd!==6)mkTrade(wd,1);
  const m=monthOfDay(Math.min(364,M.doy-1));if(M.doy>=MCUM[m+1]||M.doy>=365){mkMonthEnd();if(M.doy>=365)M.doy=0;}}
// avance de muchos días: lo lejano se simula por semanas (más rápido) y los últimos ~6 meses día por día, para que las velas diarias sean reales
function mkRun(n){const M=G.mk;let i=0;while(i<n){const wd=(M.dc+1+3)%7;if(n-i>200&&wd===1&&n-i>=7){for(let d=0;d<7;d++)mkDay(1);i+=7;}else{mkDay();i++;}}}
let MKL=null;function mkLists(){const M=G.mk;if(!MKL||MKL.m!==M||MKL.n!==Object.keys(M.C).length){MKL={m:M,n:Object.keys(M.C).length,ids:Object.keys(M.C),xs:Object.keys(M.X)};MKL.cs=MKL.ids.map(i=>M.C[i]);}return MKL;}
function mkTrade(wd,K){K=K||1;const M=G.mk;const t0=M.t;M.t+=K;const t=M.t;const real=isReal();const LL=mkLists();const sK=Math.sqrt(K);
  // crac mundial: más probable cuando las valuaciones de Wall Street están infladas
  if(!M.cr){const sU=M.X.US.s;if(Math.random()<K*(.025+.25*Math.max(0,sU-.15))/252){const tot=-R(.15,.32),d=RI(15,50);M.cr={left:d,dd:tot/d};M.ncr=(M.ncr||0)+1;mkNews((sU>.2?'Crac bursátil: Wall Street entra en pánico tras años de valuaciones infladas; los mercados del mundo caen.':'Crac bursátil: Wall Street entra en pánico por una ola de ventas; los mercados del mundo caen.'),true);}}
  const zg=gzt();const crd=M.cr?M.cr.dd*Math.min(K,M.cr.left):0;if(M.cr&&(M.cr.left-=K)<=0)M.cr=null;const XI={};
  for(const k in M.X){const x=M.X[k],e=EXCH0[k];const n=G.nations[e.n];const mu=mkMu(k),v=mkVol(k),rho=RHO[k]||.5;
    const kap=x.s<-.2?.6:.3;const ld=x.lc?x.lc.dd*Math.min(K,x.lc.left):0;if(x.lc&&(x.lc.left-=K)<=0)x.lc=null;const cf=crd*(.4+rho*.7);
    const noise=v*sK/TD*(rho*zg+Math.sqrt(1-rho*rho)*gzt());const dr=noise+cf+ld-kap*K*x.s/252;const r=mu*K/252+dr;
    x.s+=dr;x.r=r;x.lv*=Math.exp(r);x.h.push(x.lv);if(x.h.length>150)x.h.splice(0,20);
    for(let i=0;i<x.sub.length;i++){const s=x.sub[i],b=e.sub[i][2];s.lv*=Math.exp(r*b+(1-b)*mu*K/252+v*sK/TD*.25*gq());s.h.push(s.lv);if(s.h.length>150)s.h.splice(0,20);}
    XI[k]={mu,dev:x.r-mu*K/252,s:x.s,gN:n&&n.alive?((n.g||2)+(real?n.infl:0)):0,rec:n&&n.rec>0};}
  const secZ={};for(const k in SECT)secZ[k]=gq()*.006*sK;
  for(let j=0;j<LL.cs.length;j++){const c=LL.cs[j],id=LL.ids[j];if(c.dead)continue;const xi=XI[c.x];
    if(c.ix){const [xk,si]=c.ix.split(':');const s0=si!=null?M.X[xk].sub[+si]:M.X[xk];c.p=s0.lv*c.k;if(((c.q-t0-1)%63+63)%63<K&&c.dy)mkDiv(c,id,c.dy/400*c.p);c.h.push(c.p);if(c.h.length>150)c.h.splice(0,20);continue;}const S=SECT[c.sec];
    const ge=(xi.gN+S[1]+c.d*100)/100;c.eps*=Math.exp(ge*K/252);
    const gap=Math.log(c.p/(c.eps*c.pe0))-xi.s;
    let r=(ge+.02)*K/252+c.b*xi.dev+secZ[c.sec]+c.v*sK/TD*gzt()-.35*K*gap/252;
    if(((c.q-t0-1)%63+63)%63<K){const sur=gq()*(.035+c.v*.08)+(xi.rec?-.03:0);c.eps*=Math.exp(sur);r+=sur*1.2;c.d=clamp(.7*c.d+gq()*.025,-.12,.15);
      const dv=c.dy/400*c.p;if(dv>0){c.p-=dv;mkDiv(c,id,dv);}
      if(Math.abs(sur)>.09)mkNews((sur>0?`${c.nm} supera sus resultados trimestrales: utilidades +${Math.round(sur*100)} % frente a lo esperado. La acción sube ${Math.abs(Math.round(sur*120))} %.`:`${c.nm} decepciona en sus resultados trimestrales: utilidades ${Math.round(sur*100)} % frente a lo esperado. La acción cae ${Math.abs(Math.round(sur*120))} %.`),false,'e');}
    c.p*=Math.exp(r);c.r=r;if(c.p<c.eps*c.pe0*.02&&c.pl==null&&Math.random()<.002*K){c.dead=1;mkNews(`${c.nm} se declara en quiebra y deja de cotizar.`,true);if(P&&P.bk&&P.bk.pos[id])bkWipe(id);continue;}
    c.h.push(c.p);if(c.h.length>150)c.h.splice(0,20);}
  if(wd===5){M.wk++;for(const k in M.X){const x=M.X[k];x.w.push(x.lv);if(x.w.length>60)x.w.splice(0,8);x.sub.forEach(s=>{s.w.push(s.lv);if(s.w.length>60)s.w.splice(0,8);});}
    for(const id in M.C){const c=M.C[id];if(c.dead)continue;c.w.push(c.p);if(c.w.length>60)c.w.splice(0,8);}}
  if(P&&P.bk)bkDay();}
function mkMonthEnd(){const M=G.mk;M.mo++;for(const k in M.X){const x=M.X[k];x.m.push(x.lv);if(x.m.length>180)x.m.shift();x.sub.forEach(s=>{s.m.push(s.lv);if(s.m.length>180)s.m.shift();});}
  for(const id in M.C){const c=M.C[id];if(c.dead)continue;c.m.push(c.p);if(c.m.length>180)c.m.shift();}
  cxMonth();mkWatch();if(P&&P.bk)bkMonth();}
// vigila lo que pasa en el mundo y lo traduce en movimientos de bolsa (con causa)
function mkWatch(){for(const nid in EXN){const n=G.nations[nid];if(!n)continue;const w=warsOf(nid).length,rec=n.rec>0?1:0,sc=n.sanc>0?1:0,gov=n.gov,al=n.alive;
  const o=n._mk||(n._mk={w,rec,sc,gov,al});
  const cs=G.cx[n.cur],own=cs&&(cs.iss===nid||cxMembers(n.cur).length===1);const csh=v=>{if(own)cs._sh=(cs._sh||0)+v;};
  if(w>o.w)csh(.07);if(rec>o.rec)csh(.03);if(sc>o.sc)csh(.08);if(gov!==o.gov&&gov==='dictadura')csh(.06);
  if(w>o.w){const big=power(nid)>=Math.max(...warsOf(nid).map(x=>power(enemyIn(x,nid))));mkLocalShock(nid,-(big?R(.05,.1):R(.12,.22)),RI(5,12),'el estallido de una guerra');mkSectorShock('def',.08,nid);mkSectorShock('trans',-.06,nid);mkSectorShock('ener',.04,nid);}
  if(rec>o.rec)mkLocalShock(nid,-R(.08,.15),RI(10,20),'la recesión');
  if(sc>o.sc)mkLocalShock(nid,-R(.08,.14),RI(5,10),'las sanciones internacionales');
  if(gov!==o.gov&&gov==='dictadura')mkLocalShock(nid,-R(.1,.18),RI(4,8),'el golpe de Estado');
  if(!al&&o.al)mkLocalShock(nid,-R(.3,.45),RI(8,15),'la ocupación del país');
  n._mk={w,rec,sc,gov,al};}}
/* ----- velas: abre, máximo y mínimo se derivan del cierre y de una semilla fija por día ----- */
function mkSeries(id,tf){const M=G.mk;const c=M.C[id];if(c)return {s:c[tf],v:c.v*(c.b||1)*.8+.12,k:mkH(id)};const [k,i]=id.split(':');const x=M.X[k];const s=i!=null?x.sub[+i]:x;return {s:s[tf],v:EXCH0[k].vol,k:mkH(id)};}
function mkCandles(id,tf,n){const M=G.mk;const {s,v,k}=mkSeries(id,tf);const per=tf==='h'?1:tf==='w'?5:21;const sd=v/TD*Math.sqrt(per);const end=tf==='h'?M.t:tf==='w'?M.wk:M.mo;
  const L=[];const st=Math.max(1,s.length-n);for(let i=st;i<s.length;i++){const ix=end-(s.length-1-i);const C=s[i],Pv=s[i-1];const O=tf==='h'?Pv*Math.exp(sd*.22*mkZ(k,ix)):Pv;
    const H=Math.max(O,C)*Math.exp(sd*.45*Math.abs(mkZ(k,ix+99991))),Lo=Math.min(O,C)*Math.exp(-sd*.45*Math.abs(mkZ(k,ix+77773)));
    const vol=(M.C[id]?M.C[id].sh*.004:1e9)*per*(1+18*Math.abs(Math.log(C/Pv))/Math.sqrt(per))*(.7+.6*mkU(k,ix+31337));L.push({o:O,h:H,l:Lo,c:C,v:vol,i:ix});}
  return L;}
function mkMA(arr,n){const out=[];let s=0;for(let i=0;i<arr.length;i++){s+=arr[i];if(i>=n)s-=arr[i-n];out.push(i>=n-1?s/n:null);}return out;}
function mkChg(id,days){const {s}=mkSeries(id,'h');if(s.length<2)return 0;const a=s[Math.max(0,s.length-1-days)];return s[s.length-1]/a-1;}
function mkYtd(id){const {s}=mkSeries(id,'m');const M=G.mk;const back=M.mo%12;const a=s[Math.max(0,s.length-1-back)];const cur=mkSeries(id,'h').s;return cur[cur.length-1]/a-1;}

/* ===================== CUENTA DE CORRETAJE ===================== */
function bkEnsure(p){if(!p.bk)p.bk={pos:{},loan:0,ord:[],tr:[],mg:false,rl:0,dv:0};return p.bk;}
const homeN=()=>G.nations[P._cur]||natOf(P);
function toInt(a,cur){const h=homeN();return a/fxOf(cur)*fxOf(h.cur)/h.D;}
function fromInt(a,cur){const h=homeN();return a*h.D/fxOf(h.cur)*fxOf(cur);}
const coCur=id=>G.mk.X[G.mk.C[id].x].cur;
function bkVals(){const b=P.bk;let L=0,S=0;for(const id in b.pos){const ps=b.pos[id],c=G.mk.C[id];if(!c)continue;const v=toInt(Math.abs(ps.q)*c.p,coCur(id));if(ps.q>0)L+=v;else S+=v;}
  return {L,S,E:P.dinero+L-S-b.loan};}
function bkFee(id,gross){const cur=coCur(id);const fx=cur!==homeN().cur?.0025:0;return Math.max(toInt(1,'USD'),gross*.001)+gross*fx;}
function bkCanTrade(id,side){const c=G.mk.C[id];if(!c||c.dead)return 'Esta empresa ya no cotiza.';const e=EXCH0[c.x];const me=natOf(P);
  if(P.age<18)return 'Necesitas 18 años para abrir una cuenta de corretaje.';if(P.prison)return 'Desde prisión no puedes operar.';
  if(side==='b'||side==='ss'){if(e.n!==me.id&&me.cc)return `Tu país tiene controles de capital: no puedes comprar acciones extranjeras.`;
    if(warBetween(e.n,me.id))return `Estás en guerra con ${G.nations[e.n].name}: su bolsa está cerrada para ti.`;
    if(c.x==='RU'&&me.id!=='RUS'&&warsOf('RUS').length)return 'La Bolsa de Moscú está cerrada a extranjeros por las sanciones.';}
  if(side==='ss'&&!P.bk.mg)return 'Para vender en corto necesitas una cuenta de margen.';
  if(side==='s'||side==='bc'){const ps=P.bk.pos[id];if(ps&&ps.lk>G.mk.t)return `Tus acciones están bloqueadas ${ps.lk-G.mk.t} días de bolsa más (periodo de bloqueo de la salida a bolsa).`;}
  return null;}
// ejecuta una operación a un precio dado; side: b compra · s vende · ss venta en corto · bc recompra de corto
function bkExec(id,side,q,px,auto){const b=P.bk,c=G.mk.C[id];const cur=coCur(id);q=Math.floor(q);if(q<=0)return 'Cantidad inválida.';
  const ps=b.pos[id]||(b.pos[id]={q:0,c:0});const gross=toInt(q*px,cur),fee=bkFee(id,gross);
  if(side==='b'||side==='bc'){if(side==='bc')q=Math.min(q,-ps.q);if(side==='b'&&ps.q<0)return 'Primero recompra tu posición en corto.';if(q<=0)return 'No tienes cortos que recomprar.';
    const cost=toInt(q*px,cur)+fee;const V=bkVals();
    if(!auto){if(!b.mg&&P.dinero<cost)return `No te alcanza: necesitas ${fmt(cost)}.`;
      if(b.mg){const after=V.E-fee;const L2=V.L+(side==='b'?toInt(q*px,cur):0),S2=V.S-(side==='bc'?toInt(q*px,cur):0);if(side==='b'&&after<.5*(L2+S2))return `Margen insuficiente: con margen puedes comprar hasta el doble de tu capital (${fmt(Math.max(0,V.E))}).`;}}
    if(P.dinero>=cost)P.dinero-=cost;else{const have=Math.max(0,P.dinero);P.dinero-=have;b.loan+=cost-have;}
    if(side==='b'){ps.c=(ps.c*ps.q+px*q)/(ps.q+q);ps.q+=q;}else{const pl=toInt((ps.c-px)*q,cur);b.rl+=pl;ps.q+=q;if(ps.q===0)ps.c=0;}}
  else{if(side==='s'){if(ps.q<=0)return 'No tienes acciones de esta empresa.';q=Math.min(q,ps.q);const pl=toInt((px-ps.c)*q,cur);b.rl+=pl;ps.q-=q;}
    else{if(ps.q>0)return 'Primero vende tus acciones de esta empresa.';const V=bkVals();const val=toInt(q*px,cur);if(!auto&&V.E-fee<.5*(V.L+V.S+val))return `Margen insuficiente para ese corto (capital ${fmt(Math.max(0,V.E))}).`;
      ps.c=(ps.c*(-ps.q)+px*q)/(-ps.q+q);ps.q-=q;}
    let cash=toInt(q*px,cur)-fee;if(b.loan>0&&side==='s'){const r=Math.min(b.loan,cash);b.loan-=r;cash-=r;}P.dinero+=cash;}
  if(ps.q===0)delete b.pos[id];if(c.pl!=null&&P.biz&&P.biz.pub===id){P.biz.own=Math.max(0,(b.pos[id]?b.pos[id].q:0)/c.sh);if(P.biz.own<=0){P.biz=null;log(`Vendes tu última acción de ${c.nm}: la empresa ya no es tuya.`,'big');}}
  const nm={b:'Compra',s:'Venta',ss:'Venta en corto',bc:'Recompra'}[side];b.tr.unshift({y:G.year,d:G.day||0,id,s:side,q,px});if(b.tr.length>40)b.tr.pop();
  return `${nm}: ${q.toLocaleString('es-MX')} acciones de ${c.nm} a ${fmtPx(px,cur)} (comisión ${fmt(fee)}).`;}
function bkTrade(id,side,q,ty,px){const P0=P;bkEnsure(P0);const err=bkCanTrade(id,side);if(err)return {err};const c=G.mk.C[id];
  if(ty==='mkt'){const sl=(side==='b'||side==='bc')?1.0005:.9995;const r=bkExec(id,side,q,c.p*sl);return /^(Compra|Venta|Recompra)/.test(r)?{ok:r}:{err:r};}
  if(!(px>0))return {err:'Precio inválido.'};P0.bk.ord.push({id,s:side,q:Math.floor(q),ty,px,t0:G.mk.t});return {ok:((q_,p_)=>({lim:{b:`Orden límite registrada: comprar ${q_} a ${p_}. Vence en 90 días de bolsa.`,s:`Orden límite registrada: vender ${q_} a ${p_}. Vence en 90 días de bolsa.`,ss:`Orden límite registrada: vender en corto ${q_} a ${p_}. Vence en 90 días de bolsa.`,bc:`Orden límite registrada: recomprar ${q_} a ${p_}. Vence en 90 días de bolsa.`},stop:{b:`Orden stop registrada: comprar ${q_} a ${p_}. Vence en 90 días de bolsa.`,s:`Orden stop registrada: vender ${q_} a ${p_}. Vence en 90 días de bolsa.`,ss:`Orden stop registrada: vender en corto ${q_} a ${p_}. Vence en 90 días de bolsa.`,bc:`Orden stop registrada: recomprar ${q_} a ${p_}. Vence en 90 días de bolsa.`}})[ty==='lim'?'lim':'stop'][side])(Math.floor(q),fmtPx(px,coCur(id)))};}
function bkDay(){const b=P.bk,M=G.mk;if(!P.alive)return;
  if(b.ord.length){const keep=[];for(const o of b.ord){const c=M.C[o.id];if(!c||c.dead||M.t-o.t0>90){continue;}const cd=mkCandles(o.id,'h',1)[0];if(!cd){keep.push(o);continue;}
      const buy=o.s==='b'||o.s==='bc';let fill=null;
      if(o.ty==='lim'){if(buy&&cd.l<=o.px)fill=Math.min(cd.o,o.px);if(!buy&&cd.h>=o.px)fill=Math.max(cd.o,o.px);}
      else{if(buy&&cd.h>=o.px)fill=Math.max(cd.o,o.px);if(!buy&&cd.l<=o.px)fill=Math.min(cd.o,o.px);}
      if(fill!=null&&!bkCanTrade(o.id,o.s)){const r=bkExec(o.id,o.s,o.q,fill);if(/^(Compra|Venta|Recompra)/.test(r))log('📈 Orden ejecutada. '+r,'good');else keep.push(o);}else keep.push(o);}b.ord=keep;}
  if(b.loan>0){const h=homeN();b.loan*=1+(cxOf(h).pr+3)/36500;}
  const V=bkVals();if((b.loan>0||V.S>0)&&V.E<.25*V.L+.3*V.S){let k=0;const ids=Object.keys(b.pos).sort((x,y)=>toInt(Math.abs(b.pos[y].q)*M.C[y].p,coCur(y))-toInt(Math.abs(b.pos[x].q)*M.C[x].p,coCur(x)));
    for(const id of ids){const ps=b.pos[id];bkExec(id,ps.q>0?'s':'bc',Math.abs(ps.q),M.C[id].p*(ps.q>0?.995:1.005),true);k++;const W=bkVals();if(W.E>=.35*(W.L+W.S)||(W.L===0&&W.S===0))break;}
    log(`⚠️ Llamada de margen: tu corredor vende ${k} posición(es) para cubrir la garantía.`,'bad');pushNews('Llamada de margen en tu cuenta de bolsa.','bad');}}
function bkMonth(){const b=P.bk;let fee=0;for(const id in b.pos){const ps=b.pos[id];if(ps.q<0){const c=G.mk.C[id];fee+=toInt(-ps.q*c.p,coCur(id))*(c.v>.4?.04:.01)/12;}}if(fee>0)P.dinero-=fee;}
function mkDiv(c,id,dv){if(!P||!P.bk)return;const ps=P.bk.pos[id];if(!ps)return;const a=toInt(ps.q*dv,coCur(id));P.dinero+=a;if(a>0)P.bk.dv+=a;}
function bkWipe(id){const ps=P.bk.pos[id];if(!ps)return;if(ps.q>0){P.bk.rl-=toInt(ps.q*ps.c,coCur(id));log(`Pierdes tu inversión en ${G.mk.C[id].nm}: la empresa quebró.`,'bad');}else{log(`Tu corto en ${G.mk.C[id].nm} gana todo: la empresa quebró.`,'good');}delete P.bk.pos[id];}
function bkYear(){const p=P;if(!p||!p.bk)return;const b=p.bk;if(isReal()&&b.rl>0){const n=natOf(p);const r=CGT[n.id]!=null?CGT[n.id]:.15;const tax=b.rl*r;if(tax>0){p.dinero-=tax;log(`Impuesto a las ganancias de bolsa (${Math.round(r*100)} %): ${fmt(tax)} sobre ${fmt(b.rl)} ganados.`);}}
  if(b.dv>0)log(`Dividendos cobrados en el año: ${fmt(b.dv)}.`);b.rl=0;b.dv=0;}
/* ----- salida a bolsa (OPI) de tu negocio ----- */
const IPO_SEC=['cons','retail','auto','tec'],IPO_NM=['Alimentos','Comercial','Servicios Automotrices','Tecnologías'];
function ipoInfo(p){const b=p.biz;if(!b||b.pub)return null;const reg=G.regions[b.r];const gl=(reg&&reg.gl)||.02;const pe=clamp(10+300*gl,8,22)*(!b.v14&&b.t===3?1.6:1);
  const val=(b.last||bizRevenue(p))*pe*(b.v14&&/tec|ecom|medios|semi/.test(bzSecOf(b))?1.6:1)/(b.v14?1:1);const me=natOf(p);const ex=(EXN[me.id]||['US'])[0];return {pe,val,ex,ok:b.lvl>=2&&p.age>=18&&(b.last||0)>0};}
function ipoDo(f){const p=P;const I=ipoInfo(p);if(!I||!I.ok)return 'Tu negocio aún no puede salir a bolsa (necesita ser empresa grande con utilidades).';bkEnsure(p);const M=G.mk;
  const bk2=p.biz.v14?bzT(p.biz):null;const inm=bk2?bk2.n:IPO_NM[p.biz.t||0];let id=(p.surname.normalize('NFD').replace(/[^A-Za-z]/g,'').toUpperCase()+'XXX').slice(0,3)+inm.normalize('NFD').replace(/[^A-Za-z]/g,'')[0].toUpperCase();while(M.C[id])id=id.slice(0,3)+String.fromCharCode(65+RI(0,25));
  const cur=M.X[I.ex].cur;const valL=fromInt(I.val,cur);const px=rp(Math.pow(10,Math.round(Math.log10(Math.max(1,valL/2e6)))));const sh=Math.round(valL/px);
  M.C[id]={nm:bk2?p.biz.n:`${p.surname} ${IPO_NM[p.biz.t||0]}`,x:I.ex,sec:bk2?bk2.sec:IPO_SEC[p.biz.t||0],p:px,eps:px/I.pe,pe0:I.pe,sh,dy:0,b:1.2,v:.45,d:.03,q:M.t%63,h:[px],w:[px],m:[px],pl:1};
  const fee=.07,cash=I.val*f*(1-fee);p.dinero+=cash;p.bk.pos[id]={q:Math.round(sh*(1-f)),c:px,lk:M.t+126};p.biz.pub=id;p.biz.own=1-f;
  mkNews(`${M.C[id].nm} sale a bolsa en ${EXCH0[I.ex].nm}: coloca ${Math.round(f*100)} % de sus acciones y vale ${fmtN(I.val*usdPerInt(natOf(p)))}.`,true);
  return `¡Tu empresa sale a bolsa! Vendes ${Math.round(f*100)} % y recibes ${fmt(cash)} (comisiones de colocación del 7 %). Conservas ${Math.round((1-f)*100)} % con bloqueo de 6 meses.`;}
function ipoYear(p,net,noCash){const b=p.biz;if(!b||!b.pub||!G.mk)return;const c=G.mk.C[b.pub];if(!c||c.dead){b.pub=null;b.own=1;return;}
  if(!noCash)p.dinero-=net*(1-(b.own||0));const cur=coCur(b.pub);const e2=Math.max(1e-9,fromInt(net,cur)/c.sh);const sur=clamp(Math.log(e2/c.eps),-1,1);c.eps=e2;c.p*=Math.exp(sur*.6);}


/* ----- guardado compacto: las series de precios se guardan como cambios logarítmicos en base 64 (~2 bytes por dato, error < 0.02 %) ----- */
const B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',SQ=.0004;const B64I={};for(let i=0;i<64;i++)B64I[B64[i]]=i;
function serEnc(a){if(!a||!a.length)return '';const v0=+(+a[0]).toPrecision(7);let s=v0+'|',prev=Math.log(v0);
  for(let i=1;i<a.length;i++){let d=Math.round((Math.log(Math.max(1e-12,a[i]))-prev)/SQ);if(d>-2048&&d<2048){const u=d+2048;s+=B64[u>>6]+B64[u&63];}
    else{d=clamp(d,-8388607,8388607);const u=d+8388608;s+='~'+B64[(u>>18)&63]+B64[(u>>12)&63]+B64[(u>>6)&63]+B64[u&63];}prev+=d*SQ;}return s;}
function serDec(s){if(typeof s!=='string')return s||[];if(!s)return [];const k=s.indexOf('|');const v0=+s.slice(0,k);const out=[v0];let prev=Math.log(v0),i=k+1;
  while(i<s.length){let d;if(s[i]==='~'){d=((B64I[s[i+1]]<<18)|(B64I[s[i+2]]<<12)|(B64I[s[i+3]]<<6)|B64I[s[i+4]])-8388608;i+=5;}else{d=((B64I[s[i]]<<6)|B64I[s[i+1]])-2048;i+=2;}prev+=d*SQ;out.push(Math.exp(prev));}return out;}
function serMap(o,f){const r=Object.assign({},o);['h','w','m'].forEach(k=>{if(k in r)r[k]=f(r[k]);});if(r.sub)r.sub=r.sub.map(x=>serMap(x,f));return r;}
{const _pk=packG;packG=function(g){const o=_pk(g);if(g.mk){const M=Object.assign({},g.mk);M.X={};for(const k in g.mk.X)M.X[k]=serMap(g.mk.X[k],serEnc);M.C={};for(const k in g.mk.C)M.C[k]=serMap(g.mk.C[k],serEnc);o.mk=M;}
  if(g.cx){o.cx={};for(const k in g.cx)o.cx[k]=serMap(g.cx[k],serEnc);}return o;};}
{const _up=unpackG;unpackG=function(o){const g=_up(o);if(g.mk){for(const k in g.mk.X)g.mk.X[k]=serMap(g.mk.X[k],serDec);for(const k in g.mk.C)g.mk.C[k]=serMap(g.mk.C[k],serDec);}
  if(g.cx)for(const k in g.cx)g.cx[k]=serMap(g.cx[k],serDec);return g;};}
// si el negocio que cotiza deja de ser tuyo (lo vendes o cierra), la empresa sigue en bolsa o quiebra
function ipoGuard(p,closed){if(!G.mk)return;for(const id in G.mk.C){const c=G.mk.C[id];if(c.pl!==1||c.dead)continue;if(p.biz&&p.biz.pub===id)continue;
  if(closed){c.dead=1;mkNews(`${c.nm} cierra por pérdidas y deja de cotizar.`,true);if(p.bk&&p.bk.pos[id])bkWipe(id);}else c.pl=0;}}
{const e=EV.find(x=>x.id==='oferta_negocio');if(e){const w=e.when;e.when=p=>w(p)&&!(p.biz&&p.biz.pub);}}

/* ===================== ENGANCHES ===================== */
{const _dh=typeof dayHook==='function'?dayHook:null;dayHook=function(step){if(_dh)_dh(step);if(!G||!P)return;ensureV13();const d0=((G.day-step)%365+365)%365;if(G.mk.doy!==d0)G.mk.doy=d0;if(MKF&&MKF.left>200){mkRun(step);MKF.left-=step;}else{for(let i=0;i<step;i++)mkDay();if(MKF)MKF.left-=step;}curSync(P);};}
let MKF=null;{const _ca=clockAdvance;clockAdvance=function(n,opt){if(G&&P)ensureV13();MKF={left:n};try{return _ca(n,opt);}finally{MKF=null;}};}
{const _au=ageUp;ageUp=function(){if(!G||!P||!P.alive||P.event){_au();return;}ensureV13();const miss=Math.max(0,365-(G.day||0));mkRun(miss);
  const net0=P.biz?P.biz.last:null,pub0=P.biz&&P.biz.pub;const y0=G.year;_au();G.mk.doy=G.day||0;if(G.year===y0)return;if(P.biz&&P.biz.pub&&!P.biz.v14&&P.biz.last!==net0)ipoYear(P,P.biz.last);
  if(pub0&&!(P.biz&&P.biz.pub===pub0))ipoGuard(P,!P.biz);bkYear();curSync(P);};}
{const _nw=netWorth;netWorth=function(p){let v=_nw(p);if(p&&p.bk&&G&&G.mk){const V=(()=>{const b=p.bk;let L=0,S=0;const h=G.nations[p._cur]||natOf(p);for(const id in b.pos){const ps=b.pos[id],c=G.mk.C[id];if(!c)continue;const a=Math.abs(ps.q)*c.p/fxOf(coCur(id))*fxOf(h.cur)/h.D;if(ps.q>0)L+=a;else S+=a;}return L-S-b.loan;})();v+=V;
  if(p.biz&&p.biz.pub)v-=(p.biz.last||0)*3;}return v;};}
{const _ch=continueAsHeir;continueAsHeir=function(){const old=P;const ok=_ch();if(ok&&old.bk&&P!==old){const kids=old.children.length,law=(old.dyn&&old.dyn.law)||'igual',share=law==='primo'?(kids>1?.7:1):1/Math.max(1,kids);
  P._cur=old._cur;const b=bkEnsure(P);for(const id in old.bk.pos){const q=Math.trunc(old.bk.pos[id].q*share);if(q)b.pos[id]={q,c:old.bk.pos[id].c};}b.loan=old.bk.loan*share;b.mg=old.bk.mg;curSync(P);}return ok;};}
{const _np=newPlayer;newPlayer=function(o){const p=_np(o);if(G&&G.cx)p._cur=natOf(p).id;return p;};}

/* ----- evento: ataque especulativo contra tu moneda (solo si gobiernas) ----- */
E('m_ataque',0,()=>false,p=>{const a=G._atk;const x=G.cx[a.c];return `Ataque especulativo contra ${elC(x.nm)}: los mercados apuestan a que no podrás sostener el tipo de ${rp(x.fx)} por dólar (el valor de equilibrio ronda ${rp(a.fxF)}). El tesoro y las reservas están bajo presión.`;},p=>{const a=G._atk,x=G.cx[a.c],n=natOf(p);return [
  ['Defenderlo: subir la tasa 8 puntos y vender reservas',p=>{const mis=Math.log(a.fxF/x.fx);const cost=n.gdp*.02;n.treas=(n.treas||0)-cost;cxSetRate(a.c,x.pr+8,'defensa');const ok=chance(clamp(.75-mis*1.5+((n.treas||0)>0?.1:-.2),.1,.85));
    if(ok){x.q-=.08;return `Resistes el ataque: gastas ${fmtN(cost)} de reservas y la tasa sube a ${x.pr.toFixed(1)} %. La economía se enfría, pero el tipo se mantiene.`;}cxDevalue(a.c,a.fxF*1.25,'flot','ataque especulativo');return 'Pierdes la apuesta: se agotan las reservas y la moneda se desploma más de lo que habría caído con una devaluación ordenada.';}],
  ['Devaluar de forma ordenada y mantener el tipo fijo en el nuevo nivel',p=>{cxDevalue(a.c,a.fxF*1.03,x.reg,'devaluación ordenada');return 'Anuncias una devaluación ordenada. Duele, pero el mercado se calma.';}],
  ['Dejar flotar la moneda',p=>{cxDevalue(a.c,a.fxF*1.08,'flot','flotación');return 'Dejas flotar la moneda. Se ajusta de golpe y el banco central recupera su autonomía para fijar tasas.';}]];},{prio:1});

/* ===================== POLÍTICA MONETARIA DEL JUGADOR (cuando gobiernas) ===================== */
const CBN={USD:'la Reserva Federal',EUR:'el Banco Central Europeo',MXN:'Banxico',BRL:'el Banco Central de Brasil',GBP:'el Banco de Inglaterra',JPY:'el Banco de Japón',CNY:'el Banco Popular de China',ARS:'el BCRA',CAD:'el Banco de Canadá',
  CHF:'el Banco Nacional Suizo',INR:'el Banco de la Reserva de la India',RUB:'el Banco de Rusia',TRY:'el Banco Central de Turquía',KRW:'el Banco de Corea',AUD:'el Banco de la Reserva de Australia',CLP:'el Banco Central de Chile',
  COP:'el Banco de la República',ZAR:'el Banco de la Reserva de Sudáfrica',XOF:'el BCEAO',XAF:'el BEAC',PEN:'el BCRP',HKD:'la Autoridad Monetaria de Hong Kong'};
const cbName=c=>CBN[c]||`el banco central ${delC(G.cx[c].nm)}`;
const cbDe=c=>{const s=cbName(c);return /^(el|la) /.test(s)?s.replace(/^el /,'del ').replace(/^la /,'de la '):'de '+s;},cbA=c=>{const s=cbName(c);return /^(el|la) /.test(s)?s.replace(/^el /,'al ').replace(/^la /,'a la '):'a '+s;}; // v1.7k: «a Banxico», «de Banxico» (antes «Devuelves la autonomía Banxico»)
// ¿quién decide la tasa? solo el emisor de la moneda
const mpIssuer=n=>{const x=cxOf(n);return x.iss===n.id;};
const mpShared=n=>!mpIssuer(n);
function mpAuto(n,on){n.cbA=on;if(!on&&isReal())n.approval-=2;return on?`Devuelves la autonomía ${cbA(n.cur)}: vuelve a fijar las tasas con su regla (inflación y crecimiento).`:`Tomas el control ${cbDe(n.cur)}. Ahora fijas tú la tasa; los mercados desconfían (+1 punto de inflación al año mientras dure).`;}
function mpRate(n,d){const x=cxOf(n);const v=x.pr+d;const dd=cxSetRate(n.cur,v,'gobierno');return `Fijas la tasa de referencia en ${x.pr.toFixed(2)} % (${dd>=0?'+':''}${dd.toFixed(2)}). ${dd>0?'El crédito se encarece: frena la inflación y el crecimiento, y fortalece la moneda.':'El crédito se abarata: impulsa el crecimiento, pero sube la inflación y debilita la moneda.'}`;}
function mpRegime(n,reg,anc){const x=cxOf(n);if(reg==='caja'&&(n.treas||0)<n.gdp*.05)return 'Para una caja de conversión necesitas reservas: un tesoro de al menos el 5 % del PIB.';
  cxSetRegime(n.cur,reg,anc||null);if(reg==='flot'||reg==='adm')n.cbA=n.cbA;return reg==='flot'?`${ElC(x.nm)} flota libremente: el mercado fija el tipo de cambio y absorbe los choques.`:reg==='adm'?`Flotación administrada: el banco central suaviza los movimientos ${delC(x.nm)}.`:
    (reg==='caja'?`${ElC(x.nm)} queda en caja de conversión en ${rp(x.peg)} por ${G.cx[anc].nm}. Tu tasa seguirá a la del ancla; si tu inflación supera a la del ancla, el tipo fijo se vuelve vulnerable a un ataque especulativo.`:`${ElC(x.nm)} queda fijo en ${rp(x.peg)} por ${G.cx[anc].nm}. Tu tasa seguirá a la del ancla; si tu inflación supera a la del ancla, el tipo fijo se vuelve vulnerable a un ataque especulativo.`);}
function mpPrint(n,v){const o=n.mpr||0;n.mpr=v;if(isReal()&&v>o)n.approval+=2;return v?`Ordenas financiar al gobierno imprimiendo dinero: ${mpLabel(v)} entra al tesoro cada año. Espera más inflación y una moneda más débil.`:'Dejas de imprimir dinero para el gobierno.';}
function mpRedenom(n,z,nm){const x=cxOf(n);if(x.fx<Math.pow(10,z))return 'La moneda no tiene tantos ceros que quitar.';n.treas=(n.treas||0)-n.gdp*.0005;cxRedenom(n.cur,z,nm||null);return `Quitas ${z} ceros: 1 ${x.nm} = ${Math.pow(10,z).toLocaleString("es-MX")} unidades antiguas. Los precios y sueldos se reescriben; el poder de compra no cambia.`;}
function mpStabilize(n,nm){const x=cxOf(n);n.sp=3;n.mpr=0;n.cbA=true;cxSetRate(n.cur,x.pr+8,'plan');if(isReal()){n.approval-=8;}n.stab=clamp(n.stab-3,0,100);
  const z=x.fx>=1000?Math.max(3,Math.floor(Math.log10(x.fx))-1):0;if(z)cxRedenom(n.cur,z,nm||nuevoC(x.nm));else if(nm){x.nm=nm;}
  mkNews((z?`${n.name} lanza un plan de estabilización con nueva moneda: fin de la emisión, banco central autónomo y tasas al alza.`:`${n.name} lanza un plan de estabilización: fin de la emisión, banco central autónomo y tasas al alza.`),true);
  return (z?`Plan de estabilización: dejas de imprimir, el banco central recupera su autonomía y sube la tasa 8 puntos; nace ${elC(x.nm)}. La inflación caerá con fuerza en los próximos 3 años; el costo es una recesión y menos aprobación.`:'Plan de estabilización: dejas de imprimir, el banco central recupera su autonomía y sube la tasa 8 puntos. La inflación caerá con fuerza en los próximos 3 años; el costo es una recesión y menos aprobación.');}
function mpAdopt(n,c){const hi=isReal()&&n.infl>30;const nm=G.cx[c].nm;natAdopt(n.id,c,c==='EUR'?'como miembro de la zona euro':'');if(isReal()){n.approval+=hi?3:-4;}if(hi)n.stab=clamp(n.stab+5,0,100);
  return (c==='USD'?`${n.name} adopta ${elC(nm)}. Tu inflación convergerá a la de EE. UU., pero pierdes la política monetaria y el señoreaje.`:`${n.name} adopta ${elC(nm)}. Tu inflación convergerá a la de la zona euro, pero pierdes la política monetaria y el señoreaje.`);}
function mpExit(n,nm,sym){const old=cxOf(n).nm;const code=natNewCur(n.id,nm,sym);const x=G.cx[code];return `Abandonas ${elC(old)} y lanzas ${elC(x.nm)} (${code}). Recuperas la política monetaria, pero la transición asusta: fuga de capitales, recesión y una moneda que nace débil.`;}
function mpCC(n,on){n.cc=on;if(isReal())n.approval+=on?1:-1;return on?'Impones controles de capital: menos ataques especulativos y fugas, pero crece menos la economía y nadie puede comprar acciones en el extranjero.':'Levantas los controles de capital: el dinero entra y sale libremente.';}
function euroWhy(n){const ez=G.cx.EUR;ensureEco(n);const x=cxOf(n);const L=[];const pi=isReal()?n.infl:2;
  L.push([pi<=(ez.pi||2)+1.5,`Inflación ≤ ${((ez.pi||2)+1.5).toFixed(1)} % (tienes ${pi.toFixed(1)} %)`]);L.push([n.debtR<=.9,`Deuda ≤ 90 % del PIB (tienes ${Math.round(n.debtR*100)} %)`]);
  L.push([x.anc==='EUR'&&G.year-(x.pegY||0)>=2,('Dos años fijo al euro (MTC II)'+(x.anc==='EUR'?(x.pegY?` · desde ${x.pegY}`:' · desde antes de 2026'):''))]);L.push([n.stab>=40,`Estabilidad ≥ 40 (tienes ${Math.round(n.stab)})`]);return L;}
/* ----- artículos según el género de la moneda (la libra, el peso) ----- */
const FEM_RX=/^(nuev[oa] )?(libra|rupia|lira|corona|grivna|kina|lempira|kuna|peseta|dracma|uguiya|moneda)/i; // v1.7k: + «moneda» («la nueva moneda de X»)
const elC=nm=>(FEM_RX.test(nm)?'la ':'el ')+nm,ElC=nm=>(FEM_RX.test(nm)?'La ':'El ')+nm,delC=nm=>(FEM_RX.test(nm)?'de la ':'del ')+nm,alC=nm=>(FEM_RX.test(nm)?'a la ':'al ')+nm;
const nuevoC=nm=>{const b=nm.replace(/^nuev[oa] /,'');return (FEM_RX.test(b)?'nueva ':'nuevo ')+b;};
