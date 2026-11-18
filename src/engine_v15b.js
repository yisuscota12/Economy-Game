/* ===== v1.5b: bancos para personas, fondos, tu propio banco, sistema financiero nacional (crisis, rescates, FMI, Banco Mundial) y secretarías de Estado ===== */
// rendimientos del mes de cada activo (una sola vez por mes: lo usan la mesa, los fondos y los bancos)
{const _dr=deskRet;deskRet=function(){const mo=G.mk?G.mk.mo:0;if(G._drc&&G._drc.mo===mo)return G._drc.R;const R=_dr();G._drc={mo,R};return R;};}

/* ===================== BANCOS PARA PERSONAS ===================== */
function bankList(p){const n=natOf(p),cap=capitalOf(n.id);const L=[];const add=(id,nm,t,nid,tk)=>L.push({id,nm,t,n:nid,tk});
  add('L:'+p.r,`Caja Popular ${RG[p.r].nm}`,'local',n.id);const big=regionsOf(n.id).filter(r=>r!==cap).sort((a,b)=>G.regions[b].pop-G.regions[a].pop)[0]||cap;add('R:'+big,`Banco Regional de ${RG[big].nm}`,'regional',n.id);
  add('N:'+n.id,`Banco Nacional de ${n.name}`,'nacional',n.id);const ex=(EXN[n.id]||[])[0];if(ex&&G.mk)Object.keys(G.mk.C).filter(id=>G.mk.C[id].x===ex&&G.mk.C[id].sec==='fin'&&!G.mk.C[id].dead&&!GBANKS.some(g=>g[4]===id)).forEach(id=>add('C:'+id,G.mk.C[id].nm,'nacional',n.id,id));
  if(p.bank)add('P:own',p.bank.nm,p.bank.t,n.id);
  GBANKS.forEach(([k,nm,t,nid,tk])=>{if(G.nations[nid]&&G.nations[nid].alive&&!(tk&&G.mk.C[tk]&&G.mk.C[tk].dead))add('G:'+k,nm,t,nid,tk);});return L;}
function bkInfo(id){const p=P;return bankList(p).find(b=>b.id===id)||null;}
function bnkEnsure(n){if(!n.bk)n.bk={h:clamp(55+(n.stab-50)*.4,20,85),reg:1,di:true,cr:0};return n.bk;}
function bankHealth(b){const n=G.nations[b.n];const h=bnkEnsure(n).h;let x=h;if(b.tk&&G.mk.C[b.tk]){const s=mkSeries(b.tk,'w').s;if(s.length>52&&s[s.length-1]/s[s.length-53]<.5)x-=30;}if(b.id==='P:own'&&p0bank())x=clamp(P.bank.K/Math.max(1,P.bank.L)*500,0,100);return clamp(x,0,100);}
const p0bank=()=>P&&P.bank;
function depRate(b){const T=BTIER[b.t];const pr=cxOf(homeN()).pr;const h=bankHealth(b);return Math.max(0,pr+T.dep+(h<40?(40-h)/20:0)+(b.id==='P:own'?P.bank.dp:0));}
function csOf(p){let s=620+clamp(Math.log10(Math.max(1,netWorth(p)/U(p)))*60,-80,160)+Math.min(60,(p.age-18)*2)-(p.late||0)*90-(p.bankrupt?200:0)+((p.cs_ok||0)*8);return Math.round(clamp(s,300,850));}
function loanRate(b,p){const T=BTIER[b.t];const n=natOf(p);return Math.max(1,cxOf(n).pr+T.loan+(700-csOf(p))/40);}
function loanMax(p,b){const inc=Math.max(grossIncome(p),bzList(p).reduce((s,z)=>s+Math.max(0,z.last||0),0));const cs=csOf(p);const k=cs>=750?6:cs>=680?4:cs>=600?2.5:1;const pv=Math.max(0,netWorth(p))*(b.t==='privada'?.5:b.t==='local'?.1:.2)*(cs>=600?1:.3);
  return Math.max(0,inc*k+pv-p.debts.reduce((s,d)=>s+d.bal,0));}
function accDeposit(id,a){const b=bkInfo(id);if(!b)return 'Banco no disponible.';const T=BTIER[b.t];const acc=P.acc||(P.acc={});const nw=netWorth(P);if(T.min&&nw<T.min*U(P)&&!acc[id])return `${b.nm} pide un patrimonio de ${fmt(T.min*U(P))} para abrirte cuenta.`;
  a=Math.min(a,Math.max(0,P.dinero));if(a<=0)return 'No tienes efectivo para depositar.';P.dinero-=a;acc[id]=(acc[id]||0)+a;if(id==='P:own'){P.bank.D+=a;}return `Depositas ${fmt(a)} en ${b.nm} (${depRate(b).toFixed(2)} % anual).`;}
function accWithdraw(id,a){const acc=P.acc||{};const have=acc[id]||0;a=Math.min(a,have);if(a<=0)return 'No tienes saldo ahí.';acc[id]-=a;if(acc[id]<1e-6)delete acc[id];P.dinero+=a;if(id==='P:own')P.bank.D=Math.max(0,P.bank.D-a);return `Retiras ${fmt(a)}.`;}
function bankLoan(id,amt,yrs){const b=bkInfo(id);if(!b)return 'Banco no disponible.';if(P.age<18)return 'Necesitas 18 años.';if(P.bankrupt)return 'Estás en bancarrota: ningún banco te presta.';const mx=loanMax(P,b);if(amt>mx)return `${b.nm} te presta hasta ${fmt(mx)} con tu historial (puntaje ${csOf(P)}).`;
  const r=loanRate(b,P)/100;P.dinero+=amt;P.debts.push({type:`Crédito ${b.nm}`,bal:amt,rate:r,pay:annuity(amt,r,yrs),years:yrs,bk:id});return `${b.nm} te presta ${fmt(amt)} a ${yrs} años al ${(r*100).toFixed(1)} % (pago ${fmt(annuity(amt,r,yrs))} al año).`;}
function accValue(p){let v=0;for(const k in p.acc||{})v+=p.acc[k];return v;}
function accMonth(p){const acc=p.acc;if(!acc)return;for(const id in acc){const b=bkInfo(id);if(!b){p.dinero+=acc[id];delete acc[id];continue;}const T=BTIER[b.t];acc[id]*=1+depRate(b)/1200;
    if(T.min&&acc[id]<T.min*U(p)*.2)acc[id]-=.004*U(p);
    const n=G.nations[b.n];const cr=bnkEnsure(n).cr>0?25:1;const pf=(T.fail/12)*cr*(bankHealth(b)<30?3:1);
    if(id!=='P:own'&&chance(pf)){const ins=bnkEnsure(natOf(p)).di?Math.min(acc[id],25*U(p)):0;const lost=acc[id]-ins;p.dinero+=ins;delete acc[id];
      log(`💥 Quiebra ${b.nm}. ${ins?`El seguro de depósitos te devuelve ${fmt(ins)}`:'No hay seguro de depósitos'}${lost>0?`; pierdes ${fmt(lost)}`:''}.`,'bad');mkNews(`Quiebra ${b.nm}: ${n.name} interviene el banco.`,true);}}}
/* ----- fondos de inversión ----- */
function mfBuy(k,a){const f=MFUNDS.find(x=>x.k===k);if(f.min&&netWorth(P)<f.min*U(P))return `Inversión mínima: patrimonio de ${fmt(f.min*U(P))} (banca privada).`;a=Math.min(a,Math.max(0,P.dinero));if(a<=0)return 'Sin efectivo.';P.dinero-=a;const m=P.mf||(P.mf={});const o=m[k]||(m[k]={v:0,c:0,hwm:1,nav:1});o.v+=a;o.c+=a;return `Inviertes ${fmt(a)} en ${f.n}.`;}
function mfSell(k){const m=P.mf||{};const o=m[k];if(!o)return 'No tienes ese fondo.';P.dinero+=o.v;const g=o.v-o.c;if(P.bk)P.bk.rl+=g;delete m[k];return (g>=0?`Retiras ${fmt(o.v)} del fondo (ganancia de ${fmt(Math.abs(g))}).`:`Retiras ${fmt(o.v)} del fondo (pérdida de ${fmt(Math.abs(g))}).`);}
function mfMonth(p){const m=p.mf;if(!m)return;const R=deskRet();for(const k in m){const f=MFUNDS.find(x=>x.k===k),o=m[k];let r;if(!f.w)r=(cxOf(homeN()).pr-f.fee)/1200;else{r=-f.fee/1200;for(const a in f.w)r+=f.w[a]/100*(R[a]||0);}
  o.v*=1+r;o.nav*=1+r;}}
function mfYear(p){const m=p.mf;if(!m)return;for(const k in m){const f=MFUNDS.find(x=>x.k===k),o=m[k];if(f.perf&&o.nav>o.hwm){const fee=o.v*(1-o.hwm/o.nav)*f.perf/100;o.v-=fee;o.hwm=o.nav;}}}
function mfValue(p){let v=0;for(const k in p.mf||{})v+=p.mf[k].v;return v;}

/* ===================== TU PROPIO BANCO ===================== */
const BK_MINCAP={local:100,regional:1000,nacional:10000};
function bankFound(p,t,nm){const cap=BK_MINCAP[t]*U(p);if(p.dinero<cap)return `Un banco ${BTIER[t].n.toLowerCase()} necesita un capital mínimo de ${fmt(cap)}.`;const n=natOf(p);const reg=bnkEnsure(n).reg;
  const ok=chance(clamp(.45+p.s.influencia/200+(skEnsure(p).fin/300)-(reg-1)*.15,.1,.95));if(!ok){p.dinero-=cap*.01;return `El regulador de ${n.name} rechaza tu licencia bancaria (gastas ${fmt(cap*.01)} en el trámite). Sube tu influencia o experiencia financiera e intenta otra vez.`;}
  p.dinero-=cap;p.bank={nm:nm||`Banco ${p.surname}`,t,K:cap,D:cap*2,L:cap*1.8,dp:0,lp:0,rk:1,py:30,rep:50,m:[],y:G.year};return `¡Obtienes la licencia! Fundas ${p.bank.nm} (${BTIER[t].n.toLowerCase()}) con ${fmt(cap)} de capital.`;}
function bankMonth(p){const B=p.bank;if(!B)return;const n=natOf(p),T=BTIER[B.t];const pr=cxOf(n).pr;const dr=Math.max(0,pr+T.dep+B.dp),lr=pr+T.loan+B.lp;const rec=n.rec>0,cr=bnkEnsure(n).cr>0;
  const att=clamp(1+.3*B.dp+(B.rep-50)/100,.3,2);const Dt=B.K*T.lev*att;B.D+=(Dt-B.D)*.05;const ltd=[.6,.75,.9][B.rk];const dem=clamp(1-.1*B.lp+((n.g||2)-2)/20,.4,1.4);B.L+=(B.D*ltd*dem-B.L)*.06;
  const pd=[.01,.02,.04][B.rk]*(rec?2.5:1)*(cr?2:1)*(1+Math.max(0,B.lp)*.1);const ii=B.L*lr/1200,ie=B.D*dr/1200,op=(B.D+B.L)*.012/12,prov=B.L*pd/12;const ebt=ii-ie-op-prov;
  const tax=isReal()?Math.max(0,ebt)*(CIT[n.id]!=null?CIT[n.id]:25)/100:0;const net=ebt-tax;B.K+=net;let paid=0;if(net>0&&B.py){paid=net*B.py/100;B.K-=paid;p.dinero+=paid;}
  B.rep=clamp(B.rep+(B.K/Math.max(1,B.L)>.12?.3:-.5)+gq()*.8,0,100);B.m.push({y:G.year,ii,ie,op,prov,tax,net,paid,D:B.D,L:B.L,K:B.K});if(B.m.length>24)B.m.shift();
  const usd=(B.D+B.K)*usdPerInt(homeN());const i=BTO.indexOf(B.t);if(i>=0&&i<5&&usd>T.up){B.t=BTO[i+1];log(`🏦 ${B.nm} crece y ahora es un banco ${BTIER[B.t].n.toLowerCase()}.`,'big');mkNews(`${B.nm} se convierte en banco ${BTIER[B.t].n.toLowerCase()}.`,true);}
  const ratio=B.K/Math.max(1,B.L);if((ratio<.04||(B.rep<20&&chance(.05)))&&!p.event){G._run=1;const e=EV.find(e=>e.id==='b_corrida');if(e)setEvent(p,e);}}
E('b_corrida',0,()=>false,p=>`Corrida bancaria en ${p.bank.nm}: los ahorradores hacen fila para retirar su dinero. Tu capital cubre ${(p.bank.K/Math.max(1,p.bank.L)*100).toFixed(1)} % de los préstamos.`,p=>{const B=p.bank;const need=Math.max(0,B.L*.1-B.K);return [
  [`Inyectar capital propio (${fmt(need)})`,p=>{if(p.dinero<need){B.D*=.7;B.rep-=15;return 'No te alcanza: el banco pierde 30 % de sus depósitos y su reputación cae.';}p.dinero-=need;B.K+=need;B.rep+=5;return 'Inyectas capital y la fila se disuelve.';}],
  ['Pedir liquidez al banco central',p=>{B.K-=B.L*.01;B.D*=.9;B.rep-=8;return 'El banco central te presta a tasa de castigo; sobrevives con menos depósitos.';}],
  ['Vender el banco a un competidor',p=>{const v=Math.max(0,B.K)*.5;p.dinero+=v;p.bank=null;if(p.acc)delete p.acc['P:own'];return `Vendes el banco por ${fmt(v)}.`;}]];},{prio:1});
function bankSell(p){const B=p.bank;const v=Math.max(0,B.K)*1.2;p.dinero+=v;p.bank=null;if(p.acc&&p.acc['P:own']){p.dinero+=p.acc['P:own'];delete p.acc['P:own'];}return `Vendes ${B.nm} por ${fmt(v)} (1.2 veces su capital).`;}

/* ===================== SISTEMA FINANCIERO NACIONAL ===================== */
function bnkYear(){for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;const b=bnkEnsure(n);const dr=(cxOf(n).pr-(b.pr0??cxOf(n).pr));b.pr0=cxOf(n).pr;
  b.h=clamp(b.h+(62-b.h)*.15+(b.reg-1)*3-(n.rec>0?4:0)-Math.max(0,dr)*1.5+(n.stab-50)/25+(n.aus>0?1:0)+R(-4,4),0,100);if(b.cr>0){b.cr--;continue;}
  const p=Math.max(0,46-b.h)/140+(n.rec>0?.006:0);if(!chance(p))continue;b.cr=1;n.rec=Math.max(n.rec||0,1);n.stab=clamp(n.stab-8,0,100);mkSectorShock('fin',-.3,id);mkLocalShock(id,-R(.12,.25),RI(8,15),'la crisis bancaria');
  if(playerRules(id)&&P&&P.alive&&!P.event){G._bcr=id;const e=EV.find(e=>e.id==='b_crisis');if(e)setEvent(P,e);}
  else{if(chance(.7)){ensureEco(n);n.debtR+=.04;b.h+=25;mkNews(`Crisis bancaria en ${n.name}: el gobierno rescata a los bancos con el 4 % del PIB.`,true);}else{n.rec=2;mkNews(`Crisis bancaria en ${n.name}: el gobierno deja quebrar a varios bancos y la recesión se agrava.`,true);}}}}
E('b_crisis',0,()=>false,p=>`Crisis bancaria en ${natOf(p).name}: varios bancos no pueden pagar a sus ahorradores y el crédito se congela.`,p=>{const n=natOf(p);return [
  ['Rescatar a los bancos (4 % del PIB)',p=>{ensureEco(n);n.treas=(n.treas||0)-n.gdp*.02;n.debtR+=.02;bnkEnsure(n).h+=25;if(isReal())n.approval-=5;return 'Rescatas al sistema: el crédito vuelve, pero los contribuyentes pagan la cuenta.';}],
  ['Dejar quebrar a los bancos insolventes',p=>{n.rec=2;bnkEnsure(n).h+=10;n.stab=clamp(n.stab-6,0,100);if(isReal())n.approval-=8;return 'Dejas quebrar a los peores bancos: el sistema se limpia, pero la recesión será más larga.';}],
  ['Pedir un rescate al FMI',p=>imfLoan(n)]];},{prio:1});
function imfOK(n){ensureEco(n);const r=rvEnsure(n);return !n.imf&&(bnkEnsure(n).cr>0||n.debtR>.9||rvValue(n)<n.gdp*.05||(isReal()&&n.infl>40)||(cxOf(n).mis||0)>.2);}
function imfLoan(n){const a=n.gdp*.03;n.treas=(n.treas||0)+a*.5;rvEnsure(n).fx+=a*.5;ensureEco(n);n.debtR+=a/n.gdp;n.imf={left:a,y:G.year};n.aus=3;n.mpr=0;n.cbA=true;bnkEnsure(n).h+=10;
  if(isReal())n.approval-=6;n.stab=clamp(n.stab-2,0,100);mkNews(`El FMI aprueba un crédito de ${fmtN(a)} para ${n.name} a cambio de un programa de austeridad.`,true);
  return `El FMI presta ${fmtN(a)} (mitad al tesoro, mitad a reservas). Condiciones: 3 años de austeridad (menos crecimiento y aprobación), sin imprimir dinero y banco central autónomo.`;}
function wbLoan(n){const a=n.gdp*.01;ensureEco(n);n.debtR+=a/n.gdp;n.wb=(n.wb||0)+5;regionsOf(n.id).slice().sort((x,y)=>G.regions[x].gdp/G.regions[x].pop-G.regions[y].gdp/G.regions[y].pop).slice(0,10).forEach(r=>{const x=G.regions[r];ensureProv(x);x.dev=Math.min(10,x.dev+.5);});
  return `El Banco Mundial presta ${fmtN(a)} para infraestructura: +0.5 de desarrollo en tus 10 provincias más pobres y más crecimiento por 5 años.`;}
function devBank(n){const c=n.gdp*.005;if((n.treas||0)<c)return `Necesitas ${fmtN(c)} en el tesoro.`;n.treas-=c;n.bdes=(n.bdes||0)+3;regionsOf(n.id).slice().sort((x,y)=>G.regions[x].gdp/G.regions[x].pop-G.regions[y].gdp/G.regions[y].pop).slice(0,10).forEach(r=>{const x=G.regions[r];ensureProv(x);x.dev=Math.min(10,x.dev+.3);});
  return `La banca de desarrollo presta ${fmtN(c)} a empresas de las provincias más pobres: +desarrollo y algo más de crecimiento por 3 años.`;}
function bnkNz(n,on){n.bnz=on;mkSectorShock('fin',on?-.4:.15,n.id);if(isReal())n.approval+=on?4:-2;return on?'Nacionalizas la banca: el Estado decide a quién prestar. Los bancos caen en bolsa y el crédito se vuelve menos eficiente (−0.3 % de crecimiento al año).':'Reprivatizas la banca: vuelve la competencia.';}
{const _eb=ecoBonus;ecoBonus=function(n){let b=_eb(n);if(!n.bk)return b;b+=[.3,0,-.2][n.bk.reg]+(n.bk.cr>0?-2:0)+(n.bnz?-.3:0)+(n.aus>0?-.4:0)+(n.wb>0?.15:0)+(n.bdes>0?.1:0);return b+minGrowth(n);};}

/* ===================== SECRETARÍAS DE ESTADO ===================== */
function minCand(n,k){const t=pick(['tec','pol','hon','mix']);const c=t==='tec'?RI(65,90):t==='pol'?RI(35,60):RI(50,75),h=t==='hon'?RI(75,95):t==='pol'?RI(20,60):RI(45,85),l=t==='pol'?RI(70,95):t==='tec'?RI(30,60):RI(45,80);
  return {nm:rndName(n.id),c,h,l,y:G.year,tp:{tec:'técnico',pol:'político leal',hon:'reformista honesto',mix:'perfil mixto'}[t]};}
function minEnsure(n){if(n.min)return n.min;n.min={};const base=clamp(n.stab,20,80);MINS.forEach(m=>{const c=minCand(n,m.k);c.c=clamp(Math.round(c.c*.5+base*.5),10,95);n.min[m.k]=c;});n.dv=n.dv||{};return n.min;}
const minC=(n,k)=>{if(!n.min)return 50;const m=n.min[k];if(!m)return 35;if(m.pl&&P)return clamp(P.s.inteligencia*.6+P.s.influencia*.4,10,100);return m.c;};
const dvOn=(n,k)=>n.dv&&n.dv[k]&&n.dv[k]>=G.year;
function minGrowth(n){if(!n.min)return 0;return (minC(n,'eco')-50)/100*.3+(minC(n,'inf')-50)/100*.1+(dvOn(n,'eco0')?.4:0)+(dvOn(n,'eco1')?.2:0)+(dvOn(n,'rex1')?.3:0)+(dvOn(n,'inf0')?.2:0)+(dvOn(n,'tra0')?-.1:0)+(dvOn(n,'tra1')?.1:0)+(dvOn(n,'amb1')?-.1:0);}
{const _ti=treasuryIncome;treasuryIncome=function(n){let t=_ti(n);if(!n.min)return t;const m=n.min.hac;t*=.92+minC(n,'hac')/600;if(m&&!m.pl)t*=1-(100-m.h)/1000;if(dvOn(n,'hac0'))t*=1.08;if(dvOn(n,'hac1'))t*=1.05;return t;};}

{const _cr=crimeRisk;crimeRisk=function(p,k){const n=natOf(p);let r=_cr(p,k);if(n.min)r*=1.3-minC(n,'seg')/170;if(dvOn(n,'seg0'))r*=.75;if(n.dv&&n.dv.seg1)r*=.85;return r;};}
function tourF(n){return (n.min?.9+minC(n,'tur')/500:1)*(dvOn(n,'tur0')?1.2:1);}
function minYear(){for(const id in G.nations){const n=G.nations[id];if(!n.alive||!n.min)continue;
  n.army=Math.min(100,n.army+(minC(n,'def')-50)/100+(dvOn(n,'def0')?1.5:0));
  n.stab=clamp(n.stab+(minC(n,'gob')-50)/50+(dvOn(n,'gob0')?6:0)+(dvOn(n,'gob1')?-1:0),0,100);
  const rs=regionsOf(id);const hapD=(minC(n,'sal')-50)/50+(minC(n,'tra')-50)/80+(dvOn(n,'sal0')?2:0)+(dvOn(n,'eco1')?1:0)+(dvOn(n,'tra0')?2:0)+(dvOn(n,'amb0')?1:0)+(dvOn(n,'amb1')?1:0)+(dvOn(n,'ene1')?1:0);
  const devD=(minC(n,'edu')-50)/500+(dvOn(n,'edu0')?.1:0)+(dvOn(n,'inf0')?.1:0);
  rs.forEach(r=>{const x=G.regions[r];ensureProv(x);x.hap=clamp(x.hap+hapD,0,100);x.dev=Math.min(10,x.dev+devD);});
  // escándalos de corrupción: secretarios poco honestos
  for(const k in n.min){const m=n.min[k];if(m.pl)continue;if(chance((100-m.h)/1000)){n.stab=clamp(n.stab-2,0,100);if(isReal())n.approval-=3;n.treas=(n.treas||0)-n.gdp*.001;m.h=Math.max(0,m.h-10);
    if(P&&P.alive&&natOf(P).id===id)mkNews(`Escándalo en la Secretaría de ${MINS[MINK[k]].n} de ${n.name}: ${m.nm} es acusado de desviar fondos.`,true);}}
  for(const k in n.dv)if(n.dv[k]<G.year-1)delete n.dv[k];}}
function minAppoint(n,k,c){const old=n.min[k];if(old&&old.pl&&P&&P.career.track==='gob'){P.career={track:null,rank:0,years:0};log('El gobierno te remueve de la secretaría.','bad');}if(old&&!old.pl&&old.l>75)n.stab=clamp(n.stab-2,0,100);n.min[k]=Object.assign({},c,{y:G.year});return `Nombras a ${c.nm} (${c.tp}) en la Secretaría de ${MINS[MINK[k]].n}.`;}
function minDirective(n,k,i,byPlayer,free){const m=MINS[MINK[k]];const [t,cost]=m.dir[i];const c=n.gdp*cost/100;if(!free){if((n.treas||0)<c)return `El tesoro no alcanza (${fmtN(c)}).`;n.treas-=c;}const key=k+i;n.dv=n.dv||{};const yrs=/permanente/.test(m.dir[i][2])?99:/5 años/.test(m.dir[i][2])?5:3;n.dv[key]=G.year+yrs-1;
  if(key==='rex0'&&playerRules(n.id))neighborsOf(n.id).forEach(o=>addOp(o,10));if(key==='hac0'&&isReal())n.approval-=2;if(key==='hac1'&&isReal())n.approval-=3;if(key==='seg0'&&isReal())n.approval+=3;if(key==='def1')n.army=Math.min(100,n.army+2);
  if(key==='edu1'||key==='sal1'||key==='inf1')regionsOf(n.id).slice().sort((a,b)=>key==='sal1'?G.regions[b].pop-G.regions[a].pop:G.regions[a].gdp/G.regions[a].pop-G.regions[b].gdp/G.regions[b].pop).slice(0,8).forEach(r=>{const x=G.regions[r];ensureProv(x);if(key==='sal1')x.hap=Math.min(100,x.hap+6);else x.dev=Math.min(10,x.dev+.5);});
  if(byPlayer)P.s.influencia=clamp(P.s.influencia+3,0,100);mkNews(`${n.name}: la Secretaría de ${m.n} lanza «${t}» (${fmtN(c)}).`,false);return `Secretaría de ${m.n}: «${t}». Costo ${fmtN(c)}. ${m.dir[i][2]}.`;}
// producción de recursos y agricultura según Energía y Agricultura
{const _rn=resNat;resNat=function(){const d=_rn();if(RESN._mb===RESN.m&&RESN._g===G)return d;RESN._mb=RESN.m;RESN._g=G;for(const nid in d){const n=G.nations[nid];if(!n||!n.dv)continue;const fe=dvOn(n,'ene0')?1.1:1,fa=(dvOn(n,'agr0')?1.1:1)*(dvOn(n,'agr1')?1.15:1);
  for(const k in d[nid]){const f=RES0[k][5]==='agr'?fa:fe;if(f!==1){const add=d[nid][k]*(f-1);d[nid][k]+=add;RESN.S[k]=(RESN.S[k]||0)+add*(n.ban&&n.ban[k]?.3:1);}}}return d;};}
/* ----- carrera en el servicio público (puedes llegar a Secretario) ----- */
TRACKS.gob={name:'Servicio público',ranks:GOBR,k:[.8,1.2,1.8,2.6,3.5,5],base:'2',yrs:[1,2,2,3,3],inf:[0,5,12,20,30],int:[40,45,50,55,58],bonus:'Derecho'};
{const _co=careerOptions;careerOptions=function(){const p=P,a=_co();const add=(sec,t,s,can,fn,act)=>a.push({sec,t,s,can,fn,act});const n=natOf(p);
  const busy=p.ruler||p.career.track||p.job||p.edu.uni||p.prison;
  if(!busy&&p.age>=21&&p.edu.degree)MINS.forEach(m=>add('Servicio público',`${m.ic} Entrar a la Secretaría de ${m.n}`,`${GOBR[0]} · ${fmt(W(p,'2')*.8)}/año · ${m.d.toLowerCase()} · puedes llegar a Secretario`,true,()=>{if(!chance(.6+p.s.inteligencia/300))return 'No pasas el concurso de ingreso.';p.career={track:'gob',rank:0,years:0,min:m.k,emp:`Secretaría de ${m.n}`};return `Entras a la Secretaría de ${m.n} como ${GOBR[0]}.`;}));
  const c=p.career;if(c.track==='gob'&&c.rank===5){const m=MINS[MINK[c.min]];minEnsure(n);if(c.dir!==G.year)m.dir.forEach(([t,cost,s],i)=>add(`Como Secretario de ${m.n} (una directiva al año)`,t,`${s} · ${fmtN(n.gdp*cost/100)} del presupuesto de la secretaría`,true,()=>{c.dir=G.year;return minDirective(n,c.min,i,true,!playerRules(n.id));},true));}
  return a;};}
{const _ct=careerTitle;careerTitle=function(p){const c=p.career;if(c.track==='gob'&&c.emp)return `${GOBR[c.rank]} · ${c.emp}`;return _ct(p);};}
function gobYear(p){const c=p.career;if(c.track!=='gob')return;const n=natOf(p);minEnsure(n);if(c.rank===5){const m=n.min[c.min];if(!m||!m.pl){n.min[c.min]={nm:fullName(p),pl:1,c:0,h:80,l:70,y:G.year,tp:'tú'};log(`Juras como Secretario de ${MINS[MINK[c.min]].n} de ${n.name}. Tus decisiones mueven al país.`,'big');}
    if(n.leader!==c.boss){if(c.boss&&chance(.5)){p.career={track:null,rank:0,years:0};n.min[c.min]=minCand(n,c.min);log('Llega un nuevo gobierno y nombra a otro Secretario: dejas el cargo.','bad');}c.boss=n.leader;}}}

/* ===================== ENGANCHES ===================== */
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();if(P&&P.alive){accMonth(P);mfMonth(P);bankMonth(P);}};}
{const _sw=simWorld;simWorld=function(){_sw();bnkYear();minYear();for(const id in G.nations){const n=G.nations[id];if(n.aus>0)n.aus--;if(n.wb>0)n.wb--;if(n.bdes>0)n.bdes--;
  if(n.imf){const pay=n.imf.left/Math.max(1,5-(G.year-n.imf.y));n.imf.left-=pay;if(playerRules(id))n.treas=(n.treas||0)-pay;if(n.imf.left<=1)n.imf=null;}
  if(n.aus>0&&isReal()&&playerRules(id))n.approval-=2;}};}
{const _au=ageUp;ageUp=function(){if(!G||!P||!P.alive||P.event){_au();return;}const late0=P.late||0;_au();if(!P.alive)return;if(!P.late)P.cs_ok=(P.cs_ok||0)+1;else P.cs_ok=0;mfYear(P);gobYear(P);};}
{const _nw=netWorth;netWorth=function(p){let v=_nw(p);if(!p||!G||!G.cx)return v;v+=accValue(p)+mfValue(p);if(p.bank)v+=Math.max(0,p.bank.K);return v;};}
