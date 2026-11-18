/* ===== v1.5a: carreras corporativa y de finanzas, mesa de operaciones y fondo propio, servicios, forex y reservas internacionales ===== */

/* ===================== CARRERAS ===================== */
TRACKS.corp={name:'Corporativo',ranks:['Becario','Analista','Coordinador','Gerente','Director','Vicepresidente','Director general'],k:[.5,1,1.4,2.2,4,8,18],base:'2',yrs:[1,2,2,3,3,4],inf:[0,4,10,18,28,38],int:[40,45,50,54,58,62],bonus:'Economía'};
TRACKS.fin={name:'Finanzas',ranks:['Analista junior','Analista','Asociado','Trader','Trader senior','Jefe de mesa','Director de inversiones'],k:[.7,1,1.5,2.2,3.2,5,8],base:'2',yrs:[1,2,2,2,3,3],inf:[0,0,5,10,18,28],int:[45,50,55,58,62,66],bonus:'Economía'};
MAJORS.push({n:'MBA (escuela de negocios)',y:2,int:55,pg:1});
const DESK_CAP=[0,0,0,5e6,25e6,150e6,1e9]; // capital en US$ que administra cada rango de finanzas
function skEnsure(p){p.sk=p.sk||{neg:0,fin:0};return p.sk;}
// empleador: una empresa que cotiza en la bolsa de tu país (o una privada si no hay bolsa)
function corpPick(p,fin){const ex=(EXN[natOf(p).id]||[])[0];const M=G.mk;let L=[];if(ex)L=Object.keys(M.C).filter(id=>M.C[id].x===ex&&!M.C[id].dead&&!M.C[id].ix&&!M.C[id].pl&&(!fin||M.C[id].sec==='fin'));
  if(fin&&(!L.length||chance(.4)))return {nm:pick(FUNDS0)};if(!L.length)return {nm:`Grupo ${pick(['Industrial','Comercial','Empresarial','Corporativo'])} ${natOf(p).name}`};const id=pick(L);return {id,nm:M.C[id].nm};}
{const _tp=trackPay;trackPay=function(p){const c=p.career;if(c.track==='corp'){const T=TRACKS.corp;let k=T.k[c.rank];const co=c.co&&G.mk&&G.mk.C[c.co];
    if(co&&c.rank>=4){const cap=co.p*co.sh/fxOf(coCur(c.co));k*=clamp(Math.pow(cap/1e10,.25),.6,4);}return W(p,T.base)*k;}
  if(c.track==='fin')return W(p,'2')*TRACKS.fin.k[c.rank];return _tp(p);};}
{const _ct=careerTitle;careerTitle=function(p){const t=_ct(p);const c=p.career;if((c.track==='corp'||c.track==='fin')&&c.emp)return `${TRACKS[c.track].ranks[c.rank]} en ${c.emp}`;return t;};}
{const _co=careerOptions;careerOptions=function(){const p=P,a=_co();const add=(sec,t,s,can,fn,act)=>a.push({sec,t,s,can,fn,act});const deg=!!p.edu.degree,mba=(p.edu.degrees||[]).includes('MBA (escuela de negocios)');skEnsure(p);
  // el MBA solo para quien ya tiene licenciatura
  for(let i=a.length-1;i>=0;i--)if(/^MBA/.test(a[i].t)&&(!deg||a[i].sec!=='Universidad'))a.splice(i,1);else if(/^MBA/.test(a[i].t))a[i].s+=` · posgrado · colegiatura ${fmt(1.2*U(p))}/año · entras como Gerente o Asociado`;
  const busy=p.ruler||p.career.track||p.job||p.edu.uni||p.prison;
  if(!busy&&p.age>=18&&p.age<=45){const r0=mba?3:0;
    add('Negocios y finanzas',mba?'Entrar a un corporativo como Gerente (MBA)':'Programa de becarios corporativos',(`${TRACKS.corp.ranks[r0]} · ${fmt(W(p,'2')*TRACKS.corp.k[r0])}/año · `+(deg?'':'requiere licenciatura · ')+'la carrera sube hasta Director general'),deg,()=>{const e=corpPick(p);if(!chance(clamp(.45+p.s.inteligencia/200+(mba?.2:0),.2,.95)))return 'No pasas el proceso de selección. Intenta el próximo año o fortalece tu perfil.';
      p.career={track:'corp',rank:r0,years:0,co:e.id||null,emp:e.nm};return `Entras a ${e.nm} como ${TRACKS.corp.ranks[r0]}.`;});
    const r1=mba?2:0;const ok=deg&&(['Economía','Ingeniería'].includes(p.edu.degree)||mba||p.cfa>=1);
    add('Negocios y finanzas',mba?'Banca de inversión como Asociado (MBA)':'Analista financiero junior',`${TRACKS.fin.ranks[r1]} · ${fmt(W(p,'2')*TRACKS.fin.k[r1])}/año · requiere Economía, Ingeniería, MBA o certificación · desde Trader administras dinero de verdad`,ok,()=>{const e=corpPick(p,true);
      if(!chance(clamp(.35+p.s.inteligencia/180+(mba?.2:0)+(p.cfa||0)*.08,.15,.95)))return 'No pasas las entrevistas técnicas.';p.career={track:'fin',rank:r1,years:0,co:e.id||null,emp:e.nm};return `Entras a ${e.nm} como ${TRACKS.fin.ranks[r1]}.`;});}
  // cursos y certificaciones (no te quitan el trabajo; cuestan tiempo y dinero)
  if(p.age>=18&&!p.prison){const T=U(p);
    if((p.cfa||0)<3&&deg)add('Cursos y certificaciones',`Certificación de analista financiero: nivel ${(p.cfa||0)+1} de 3 (${fmt(.12*T)})`,`Examen anual · aprobación ~${Math.round(clamp(.25+(p.s.inteligencia-50)/100+p.sk.fin/300,.1,.8)*100)} % · abre la carrera de finanzas y mejora tus ascensos`,p.dinero>=.12*T&&p.cfaY!==G.year,()=>{p.dinero-=.12*T;p.cfaY=G.year;
      if(chance(clamp(.25+(p.s.inteligencia-50)/100+p.sk.fin/300,.1,.8))){p.cfa=(p.cfa||0)+1;p.sk.fin+=8;p.s.inteligencia+=1;return `Apruebas el nivel ${p.cfa} de la certificación.`;}return 'Repruebas el examen: el próximo año puedes volver a presentarlo.';},true);
    add('Cursos y certificaciones',`Curso de trading y mercados (${fmt(.04*T)})`,'+habilidad financiera (mejora tu mesa de operaciones y tus decisiones de inversión)',p.dinero>=.04*T,()=>{p.dinero-=.04*T;p.sk.fin=Math.min(100,p.sk.fin+5);return 'Terminas el curso: lees mejor el mercado.';},true);
    add('Cursos y certificaciones',`Diplomado en dirección de empresas (${fmt(.15*T)})`,'+habilidad de negocios (ascensos corporativos y tus empresas)',p.dinero>=.15*T,()=>{p.dinero-=.15*T;p.sk.neg=Math.min(100,p.sk.neg+8);p.s.inteligencia+=1;return 'Terminas el diplomado.';},true);}
  // decisiones del director general
  const c=p.career;if(c.track==='corp'&&c.rank===6&&c.co&&G.mk.C[c.co]&&!G.mk.C[c.co].dead&&c.dec!==G.year)CEO_DEC.forEach(d=>add(`Dirección general de ${c.emp} (una decisión al año)`,d.t,d.s,true,()=>{c.dec=G.year;return d.fn(p,G.mk.C[c.co]);},true));
  if(c.track==='fin'&&c.rank>=3)add('Tu trabajo','📊 Mesa de operaciones',`Administras ${fmtN(DESK_CAP[c.rank])} de ${c.emp}`,true,()=>{if(typeof showDesk==='function')setTimeout(()=>showDesk('desk'),0);return null;});
  if(!p.fund&&p.age>=25&&(c.track==='fin'&&c.rank>=4||netWorth(p)>200*U(p)&&p.sk.fin>=30))add('Negocios y finanzas','Fundar tu propio fondo de inversión',`Inversionistas te confían capital; cobras 2 % de administración y 20 % de las ganancias · aportas ${fmt(20*U(p))}`,p.dinero>=20*U(p),()=>fundOpen(p),true);
  if(p.fund)add('Negocios y finanzas',`📈 Tu fondo: ${p.fund.nm}`,`Administra ${fmtN(p.fund.aum)}`,true,()=>{if(typeof showDesk==='function')setTimeout(()=>showDesk('fund'),0);return null;});
  return a;};}
const CEO_DEC=[
 {t:'Expansión agresiva',s:'+crecimiento de utilidades por 3 años; si sale mal, cae la acción',fn:(p,c)=>{const ok=chance(.5+p.sk.neg/250);c.d+=ok?.04:-.02;c.p*=ok?1.04:.9;return ok?'El mercado premia tu plan de expansión.':'La expansión cuesta más de lo previsto: la acción cae.';}},
 {t:'Recorte de costos',s:'+utilidades este año; baja la moral y la reputación',fn:(p,c)=>{c.eps*=1.06;c.p*=1.03;p.s.influencia-=2;return 'Recortas costos: suben las utilidades y la acción, pero el ambiente interno empeora.';}},
 {t:'Recompra de acciones',s:'Sube el precio por acción; usa caja de la empresa',fn:(p,c)=>{c.sh*=.96;c.eps*=1.04;c.p*=1.04;return 'Recompras 4 % de las acciones: sube la utilidad por acción.';}},
 {t:'Subir el dividendo',s:'Atrae inversionistas de largo plazo',fn:(p,c)=>{c.dy=Math.min(8,c.dy+1);c.p*=1.02;return `El dividendo sube a ${c.dy.toFixed(1)} %.`;}},
 {t:'Invertir en innovación (I+D)',s:'Cuesta utilidades hoy, más crecimiento después',fn:(p,c)=>{c.eps*=.97;c.d+=.03;return 'Apuestas por la innovación: menos utilidad hoy, más crecimiento mañana.';}},
 {t:'Comprar a un competidor',s:'Utilidades +12 %; riesgo de pagar de más',fn:(p,c)=>{const ok=chance(.45+p.sk.neg/200);c.eps*=ok?1.12:1.03;c.p*=ok?1.06:.88;c.sh*=1.05;return ok?'La adquisición funciona: ganas mercado.':'Pagaste de más por la adquisición: la acción se castiga.';}}];
/* ----- mesa de operaciones (finanzas) y fondo propio: repartes el capital entre activos; el resultado sale de los precios del juego ----- */
const DESK_A=[['US','🇺🇸 Acciones EE. UU. (S&P 500)'],['DE','🇪🇺 Acciones Europa (DAX)'],['JP','🇯🇵 Acciones Japón'],['CN','🇨🇳 Acciones China'],['EM','🌎 Emergentes (Ibovespa, Nifty, IPC)'],
  ['oil','🛢️ Petróleo'],['gold','🥇 Oro'],['copper','🟠 Cobre'],['EUR','💶 Euro'],['JPY','💴 Yen'],['BUS','🏛️ Bonos EE. UU. a 10 años']];
const DESK_PRE={conservador:{BUS:60,gold:10,US:30},balanceado:{US:40,DE:15,EM:15,BUS:25,gold:5},crecimiento:{US:50,EM:30,JP:10,copper:10},macro:{oil:30,gold:30,JPY:-30,EM:20,BUS:20},cobertura:{gold:40,BUS:60,US:-30}};
function deskRet(){const M=G.mk,out={};const ch=s=>s&&s.length>1?s[s.length-1]/s[s.length-2]-1:0;
  ['US','DE','JP','CN'].forEach(k=>out[k]=ch(M.X[k].m));out.EM=(ch(M.X.BR.m)+ch(M.X.IN.m)+ch(M.X.MX.m))/3;['oil','gold','copper'].forEach(k=>out[k]=ch(G.rs[k].h));
  ['EUR','JPY'].forEach(c=>{const h=G.cx[c].h;out[c]=h.length>1?h[h.length-2]/h[h.length-1]-1+(G.cx[c].pr-G.cx.USD.pr)/1200:0;});
  const us=G.cx.USD;const dr=(us.pr-(us._pr0??us.pr));us._pr0=us.pr;out.BUS=(us.pr+.6)/1200-.07*dr;return out;}
function deskStep(o,skill){const R=deskRet();let r=0,gross=0;for(const k in o.w){const w=o.w[k]/100;r+=w*(R[k]||0);gross+=Math.abs(w);}r+=gross*((skill-40)/50*.002+gq()*.003)-gross*.0004;o.mh=(o.mh||[]).concat([r]).slice(-36);o.ytd=(o.ytd||0)+r;return r;}
function fundOpen(p){const T=U(p);const own=20*T;p.dinero-=own;const ownUSD=own*usdPerInt(homeN());p.fund={nm:`${p.surname} Capital`,aum:ownUSD*5,mine:ownUSD,w:Object.assign({},DESK_PRE.balanceado),ytd:0,hwm:1,nav:1,mh:[],y0:G.year};
  return `Fundas ${p.fund.nm}: pones ${fmt(own)} y tus primeros inversionistas aportan cuatro veces más. Cobras 2 % anual de administración y 20 % de las ganancias.`;}
function deskMonth(p){const c=p.career;skEnsure(p);if(c.track==='fin'&&c.rank>=3){const d=p.desk||(p.desk={w:Object.assign({},DESK_PRE.balanceado),ytd:0,mh:[]});const r=deskStep(d,p.s.inteligencia*.6+p.sk.fin*.4);if(chance(.3))p.sk.fin=Math.min(100,p.sk.fin+.5);
    if(d.ytd<-.12){log(`💥 Pierdes ${Math.round(-d.ytd*100)} % del capital de la mesa en el año: ${c.emp} te despide.`,'bad');p.career={track:null,rank:0,years:0};p.desk=null;p.s.felicidad-=10;}}
  const f=p.fund;if(f){const r=deskStep(f,p.s.inteligencia*.6+p.sk.fin*.4);f.nav*=1+r;f.aum*=1+r;const mgmt=f.aum*.02/12;f.aum-=mgmt;f.nav*=1-.02/12;const mineShare=f.mine/Math.max(1,f.aum);
    p.dinero+=toInt(mgmt*(1-mineShare),'USD');f.mine*=1+r-.02/12;
    // los inversionistas siguen al desempeño: entran si ganas, se van si pierdes
    const mom=(f.mh.slice(-12).reduce((s,x)=>s+x,0));f.aum*=1+clamp(mom*.08,-.05,.04);if(f.aum<f.mine*1.05){f.aum=f.mine*1.05;}
    if(f.aum<2e6){log(`Tu fondo ${f.nm} cierra: los inversionistas retiraron casi todo. Recuperas ${fmt(toInt(f.mine,'USD'))}.`,'bad');p.dinero+=toInt(f.mine,'USD');p.fund=null;}}}
function deskYear(p){const c=p.career;if(c.track==='fin'&&c.rank>=3&&p.desk){const d=p.desk;const cap=DESK_CAP[c.rank];const pnl=cap*d.ytd;const share=[0,0,0,.05,.05,.03,.015][c.rank];
    if(pnl>0){const b=toInt(pnl*share,'USD');p.dinero+=b;log(`Tu mesa ganó ${(d.ytd*100).toFixed(1)} % (${fmtN(pnl)}). Bono: ${fmt(b)}.`,'good');}else log(`Tu mesa cerró el año en ${(d.ytd*100).toFixed(1)} %: sin bono.`,d.ytd<0?'bad':'');d.last=d.ytd;d.ytd=0;}
  const f=p.fund;if(f){if(f.nav>f.hwm){const perf=(f.nav/f.hwm-1)*f.aum*.2;const mineShare=f.mine/Math.max(1,f.aum);p.dinero+=toInt(perf*(1-mineShare),'USD');f.aum-=perf;f.hwm=f.nav;
      log(`${f.nm} rindió ${(f.ytd*100).toFixed(1)} % en el año: cobras ${fmt(toInt(perf*(1-mineShare),'USD'))} de comisión de desempeño.`,'good');}else if(f.ytd)log(`${f.nm} rindió ${(f.ytd*100).toFixed(1)} % en el año.`,f.ytd<0?'bad':'');f.ytd=0;}}
// el director general responde ante el consejo: si la acción va peor que el índice dos años seguidos, lo despiden (con indemnización)
function ceoYear(p){const c=p.career;if(c.track!=='corp')return;skEnsure(p);p.sk.neg=Math.min(100,p.sk.neg+2);if(c.rank<6||!c.co)return;const co=G.mk.C[c.co];if(!co||co.dead){p.career={track:null,rank:0,years:0};log('Tu empresa desaparece: te quedas sin puesto.','bad');return;}
  const rel=mkYtdLike(c.co)-mkYtdLike(co.x);c.under=rel<-.1?(c.under||0)+1:0;const bon=Math.max(0,rel)*W(p,'2')*30;if(bon>0){p.dinero+=bon;log(`El consejo te paga un bono de ${fmt(bon)}: la acción le ganó al índice por ${(rel*100).toFixed(0)} puntos.`,'good');}
  if(c.under>=2){const sev=trackPay(p)*1.5;p.dinero+=sev;log(`El consejo de ${c.emp} te destituye: la acción quedó por debajo del mercado dos años seguidos. Te vas con ${fmt(sev)} de indemnización.`,'bad');p.career={track:null,rank:0,years:0};}}
function mkYtdLike(id){const {s}=mkSeries(id,'m');return s.length>12?s[s.length-1]/s[s.length-13]-1:0;}

/* ===================== SERVICIOS ===================== */
const svcL=(p,k)=>p&&p.svc&&p.svc[k]!=null?p.svc[k]:-1;
const svcV=(p,k)=>{const t=svcL(p,k);return t<0?0:SVC[SVCK[k]].v[t];};
function svcCost(p,k,t){return SVC[SVCK[k]].c[t]*U(p);}
function svcSet(p,k,t){p.svc=p.svc||{};if(t<0){delete p.svc[k];return `Cancelas el servicio de ${SVC[SVCK[k]].n.toLowerCase()}.`;}p.svc[k]=t;return `Contratas ${SVC[SVCK[k]].n.toLowerCase()} (${SVT[t].toLowerCase()}): ${fmt(svcCost(p,k,t))} al año.`;}
function svcMonth(p){if(!p.svc)return;let c=0;for(const k in p.svc)c+=svcCost(p,k,p.svc[k])/12;p.dinero-=c;}
function svcYear(p){if(!p.svc)return;const v=k=>svcV(p,k);p.s.salud+=v('entrenador')+v('nutriologo')+v('chef')*.5;p.s.apariencia+=v('entrenador')*.5;p.s.felicidad+=v('chef')*.5+v('domestico')*25;p.s.influencia+=v('publicista');
  if(p.dinero>0&&v('asesor')){const n=natOf(p);p.dinero*=1+v('asesor')*Math.max(0,n.rate)*.45/100;}}
{const _tx=taxOf;taxOf=function(p,inc){return _tx(p,inc)*(1-svcV(p,'contador'));};}
{const _ac=actCost;actCost=function(t){const c=_ac(t);if(!P)return c;return Math.max(1,Math.round(c*(1-svcV(P,'asistente')-svcV(P,'chofer')-svcV(P,'domestico')*.5)));};}
{const _se=sentence;sentence=function(p){const v=svcV(p,'abogado');if(v&&chance(v))return 'Tu abogado encuentra fallas en el proceso: te absuelven.';return _se(p);};}
// riesgo de delitos según tu riqueza y la violencia real del país (homicidios por 100 mil, ONUDD)
function crimeRisk(p,k){const d=N0[regOf(p).w0]||{homi:5};const rich=Math.max(0,Math.log10(Math.max(1,netWorth(p)/U(p))));return clamp((d.homi||5)/20,.1,3)*rich;}
E('secuestro',0,p=>p.age>=18&&netWorth(p)>30*U(p),p=>`Un grupo armado te intercepta y te secuestra. Piden ${fmt(Math.max(5*U(p),netWorth(p)*.1))} por tu liberación.`,p=>{const r=Math.max(5*U(p),netWorth(p)*.1);return [
  [`Pagar el rescate (${fmt(r)})`,p=>{p.dinero-=r;p.s.felicidad-=15;return 'Pagas y te liberan a los pocos días. La experiencia te marca.';}],
  ['Negociar con un especialista (cuesta la mitad, más riesgo)',p=>{p.dinero-=r*.5;if(chance(.8)){p.s.felicidad-=18;return 'El negociador consigue tu liberación por la mitad.';}p.s.salud-=30;p.s.felicidad-=25;return 'La negociación se complica: te liberan herido.';}],
  ['Esperar a la policía',p=>{if(chance(.45)){p.s.felicidad-=12;return 'Un operativo te rescata.';}p.s.salud-=40;p.s.felicidad-=30;return 'El operativo sale mal: sobrevives con heridas graves.';}]];},{prio:1});
E('extorsion',0,p=>bzList(p).length>0,p=>`Un grupo criminal exige “cuota” mensual a ${bzList(p)[0].n}.`,p=>{const b=bzList(p)[0];const q=Math.max(.3*U(p),((b.m.slice(-1)[0]||{}).rev||U(p))*.08);return [
  [`Pagar la cuota (${fmt(q)} al mes, un año)`,p=>{p.dinero-=q*12;return 'Pagas. El negocio sigue abierto, pero ganas menos.';}],
  ['Denunciar',p=>{if(chance(.4)){p.s.influencia+=3;return 'La policía detiene a los extorsionadores.';}b.rep=Math.max(0,b.rep-20);b.comp=.7;return 'Toman represalias: atacan tu local y espantan a los clientes.';}],
  ['Cerrar temporalmente',p=>{b.comp=.5;return 'Cierras unas semanas hasta que baja la presión.';}]];},{prio:1});
(function(){const R={secuestro:p=>.004*crimeRisk(p)*(1-svcV(p,'escoltas'))*(1-svcV(p,'seguridad')*.3),extorsion:p=>.02*clamp(((N0[regOf(p).w0]||{homi:5}).homi||5)/10,.1,3)*(1-svcV(p,'seguridad')),
    asalto:p=>null,robo_casa:p=>null,robo_cel:p=>null,atentado:p=>null};
  for(const e of EV){if(!(e.id in R))continue;const base=e.pr,f=R[e.id];Object.defineProperty(e,'pr',{get(){if(!P)return base;const v=f(P);if(v!=null)return v;
    const s=e.id==='atentado'?svcV(P,'escoltas'):svcV(P,'seguridad')*(e.id==='robo_cel'?.5:1);return base*(1-s);},configurable:true});}})();

/* ===================== FOREX (divisas del jugador) ===================== */
function fxSpread(c){return ['USD','EUR','JPY','GBP','CHF','CAD','AUD','CNY','MXN'].includes(c)?.003:.01;}
function fxTrade(c,amtInt,buy){const b=bkEnsure(P);b.fx=b.fx||{};const h=homeN();if(c===h.cur)return {err:'Esa ya es tu moneda.'};
  if(buy){if(h.cc&&c!==h.cur)return {err:'Tu país tiene controles de capital: no puedes comprar divisas.'};if(amtInt>P.dinero||amtInt<=0)return {err:'No te alcanza.'};const got=fromInt(amtInt,c)*(1-fxSpread(c));P.dinero-=amtInt;b.fx[c]=(b.fx[c]||0)+got;
    (b.fxc=b.fxc||{})[c]=((b.fxc[c]||0)+amtInt);return {ok:`Compras ${fmtC(got,c)} (${G.cx[c].nm}) por ${fmt(amtInt)}.`};}
  const have=b.fx[c]||0;const sell=Math.min(have,fromInt(amtInt,c));if(sell<=0)return {err:'No tienes esa divisa.'};const v=toInt(sell,c)*(1-fxSpread(c));const f=sell/have;b.rl+=v-(b.fxc&&b.fxc[c]||0)*f;if(b.fxc)b.fxc[c]=(b.fxc[c]||0)*(1-f);
  b.fx[c]=have-sell;if(b.fx[c]<1e-9)delete b.fx[c];P.dinero+=v;return {ok:`Vendes ${fmtC(sell,c)} y recibes ${fmt(v)}.`};}
function fxValue(p){const b=p.bk;if(!b||!b.fx)return 0;const h=G.nations[p._cur]||natOf(p);let v=0;for(const c in b.fx)v+=b.fx[c]/fxOf(c)*fxOf(h.cur)/h.D;return v;}
function fxMonth(p){const b=p.bk;if(!b||!b.fx)return;for(const c in b.fx){const x=G.cx[c];if(!x||x.dead){const n=Object.values(G.nations).find(n=>n.alive&&NCUR[n.id]===c);delete b.fx[c];continue;}b.fx[c]*=1+(x.pr-.5)/1200;}}
{const _rd=cxRedenom;cxRedenom=function(c,z,nm){_rd(c,z,nm);const f=Math.pow(10,z);if(P&&P.bk&&P.bk.fx&&P.bk.fx[c])P.bk.fx[c]/=f;
  for(const id in G.nations){const n=G.nations[id];if(n.cur===c&&n.rv)n.rv.loc=(n.rv.loc||0)/f;}};}
{const _na=natAdopt;natAdopt=function(nid,c,why){const old=G.nations[nid].cur;const k=fxOf(c)/fxOf(old);_na(nid,c,why);if(P&&P.bk&&P.bk.fx&&P.bk.fx[old]&&!cxMembers(old).length){P.bk.fx[c]=(P.bk.fx[c]||0)+P.bk.fx[old]*k;delete P.bk.fx[old];}};}

/* ===================== RESERVAS INTERNACIONALES ===================== */
function rvEnsure(n){if(n.rv)return n.rv;const d=RSV0[n.id];const lowInc=gdppc(n)<4000;n.rv={fx:d?d[0]*1e9:n.gdp*(lowInc?.04:.09),au:d?d[1]:0,oil:d?d[2]*1e6:0};return n.rv;}
const goldOz=t=>t*32150.7;
function rvValue(n){const r=rvEnsure(n);const gp=G.rs?G.rs.gold.p:RES0.gold[3],op=G.rs?G.rs.oil.p:RES0.oil[3];return r.fx+goldOz(r.au)*gp+r.oil*op;}
function rvMonth(){for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;const r=rvEnsure(n);r.fx*=1+(G.cx.USD.pr-.5)/1200;
  if(!playerRules(id)&&['CHN','RUS','POL','IND','TUR','KAZ','UZB','CZE','SGP'].includes(id)&&chance(.25)){const t=R(1,6);const cost=goldOz(t)*G.rs.gold.p;if(r.fx>cost*3){r.fx-=cost;r.au+=t;}}}
  // las compras de oro de los bancos centrales sostienen su precio
  G.rs.gold.p*=1+.0005;}
// las reservas hacen creíble un tipo fijo: más reservas, menos ataques especulativos
{const _cc=cxCrisisCheck;cxCrisisCheck=function(c,fxF){const m=cxMembers(c);if(m.length){const cov=m.reduce((s,n)=>s+rvValue(n),0)/Math.max(1,m.reduce((s,n)=>s+n.gdp,0));if(chance(clamp(cov*3,0,.85)))return;}return _cc(c,fxF);};}
{const _dv=cxDevalue;cxDevalue=function(c,nf,reg,why){cxMembers(c).forEach(n=>{const r=rvEnsure(n);if(cxMembers(c).length===1)r.fx*=.7;});return _dv(c,nf,reg,why);};}
// acciones del gobernante
function rvIntervene(n,dir){const r=rvEnsure(n);const x=cxOf(n);if(x.iss!==n.id)return 'Tu país no emite su moneda: no puede intervenir en el tipo de cambio.';
  if(dir>0){const a=r.fx*.15;if(a<=0)return 'No tienes reservas en divisas.';r.fx-=a;x.q-=a/Math.max(1,n.gdp)*3;x.fx*=Math.exp(-a/Math.max(1,n.gdp)*3);mkNews(`${cbName(n.cur).replace(/^./,q=>q.toUpperCase())} vende ${fmtN(a)} de reservas para fortalecer ${elC(x.nm)}.`,false);return `Vendes ${fmtN(a)} de reservas: ${elC(x.nm)} se fortalece.`;}
  const a=n.gdp*.01;r.fx+=a;x.q+=a/Math.max(1,n.gdp)*3;n._pt=(n._pt||0)+1;return `Compras ${fmtN(a)} en dólares emitiendo moneda: ${elC(x.nm)} se debilita (más competitividad, algo más de inflación) y crecen tus reservas.`;}
function rvGold(n,dir){const r=rvEnsure(n);const t=dir>0?50:Math.min(r.au,50);const v=goldOz(t)*G.rs.gold.p;if(dir>0){if((n.treas||0)<v&&r.fx<v)return `Necesitas ${fmtN(v)} en el tesoro o en reservas.`;if(r.fx>=v)r.fx-=v;else n.treas-=v;r.au+=t;G.rs.gold.p*=1.004;return `Compras ${t} toneladas de oro (${fmtN(v)}).`;}
  if(t<=0)return 'No tienes oro.';r.au-=t;r.fx+=v;G.rs.gold.p*=.996;return `Vendes ${t.toFixed(0)} toneladas de oro: tus reservas en divisas suben ${fmtN(v)}.`;}
function rvOil(n,dir){const r=rvEnsure(n);const o=G.rs.oil;const b=50e6;const v=b*o.p;if(dir>0){if((n.treas||0)<v)return `Necesitas ${fmtN(v)} en el tesoro.`;n.treas-=v;r.oil+=b;o.p*=1.02;return `Compras ${resQty('oil',b)} para tu reserva estratégica (${fmtN(v)}).`;}
  const q=Math.min(r.oil,b);if(q<=0)return 'Tu reserva estratégica está vacía.';r.oil-=q;n.treas=(n.treas||0)+q*o.p;o.p*=1-clamp(q/resWorld('oil')*12,0,.12);mkNews(`${n.name} libera ${resQty('oil',q)} de su reserva estratégica: el crudo baja.`,true);return `Liberas ${resQty('oil',q)}: entran ${fmtN(q*o.p)} al tesoro y baja el precio mundial.`;}
// defender el tipo fijo usa reservas (antes salía del tesoro)
{const e=EV.find(e=>e.id==='m_ataque');if(e){const _o=e.opts;e.opts=p=>{const L=_o(p);const n=natOf(p);const r=rvEnsure(n);L[0].t=`Defenderlo: tasa +8 y vender reservas (tienes ${fmtN(r.fx)})`;const g=L[0].go;L[0].go=p=>{const t0=n.treas;const out=g(p);n.treas=t0;const use=Math.min(r.fx,n.gdp*.03);r.fx-=use;return out+` Gastas ${fmtN(use)} de reservas.`;};return L;};}}

/* ===================== ENGANCHES ===================== */
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();rvMonth();if(P&&P.alive){deskMonth(P);svcMonth(P);fxMonth(P);}};}
{const _au=ageUp;ageUp=function(){if(!G||!P||!P.alive||P.event){_au();return;}const c=P.career;skEnsure(P);let blk=null;
  // en finanzas solo asciendes si tu mesa gana dinero
  if(c.track==='fin'&&c.rank>=3&&P.desk&&P.desk.ytd<=0){blk=c.years;c.years=-99;}const rank0=c.rank,tr0=c.track;
  if(P.edu.uni==='MBA (escuela de negocios)'&&isReal())P.dinero-=1.2*U(P);
  _au();if(!P.alive)return;if(blk!=null&&P.career.track==='fin')P.career.years=blk+1;
  if(P.career.track==='fin'&&P.career.rank>=3&&rank0<3)log(`Ahora administras ${fmtN(DESK_CAP[P.career.rank])}: abre 📊 Mesa de operaciones en Carrera.`,'big');
  if(P.career.track===tr0&&P.career.rank===rank0&&(tr0==='corp'||tr0==='fin')){const T=TRACKS[tr0];const sk=tr0==='corp'?P.sk.neg:P.sk.fin;
    if(rank0<T.ranks.length-1&&P.career.years>=T.yrs[rank0]&&chance(sk/250+(P.cfa||0)*.04)){P.career.rank++;P.career.years=0;log(`¡Ascenso por tu preparación! Ahora eres ${T.ranks[P.career.rank]}.`,'good');}}
  if(P.career.track==='corp')P.sk.neg=Math.min(100,P.sk.neg+1);deskYear(P);ceoYear(P);svcYear(P);fix(P);};}
{const _nw=netWorth;netWorth=function(p){let v=_nw(p);if(!p||!G||!G.cx)return v;v+=fxValue(p);if(p.fund)v+=toInt(p.fund.mine,'USD');return v;};}
