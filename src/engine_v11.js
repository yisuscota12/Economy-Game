/* ===== v1.1: balance de guerra — resistencia, movilización general, ayuda extranjera, disuasión nuclear ===== */
const NUKE=new Set(['USA','RUS','CHN','FRA','GBR','IND','PAK','ISR','PRK']);
// ¿se rinde? perder la capital ya no basta: hace falta perder buena parte del país o estar agotado
function capitCheck(w,win,lose,sc){const rs=regionsOf(lose);if(rs.every(r=>hostile(lose,ctrlOf(r))))return true;const cap=capitalOf(lose);if(G.occ[cap]!==win||sc<85)return false;
  const os=occShare(lose),ex=exOf(w,lose);if(NUKE.has(lose))return os>=.8;return os>=.55||(ex>=70&&os>=.3);}
// bono de defensa en territorio propio (núcleo): +20 %
function homeB(a,r){const x=G.regions[r];return x&&x.w0===a.o&&x.o===a.o?1.2:1;}
// movilización general y ayuda de potencias rivales
function mobilizeTick(wars,rep){const me=P&&P.alive?natOf(P).id:null;const seen=new Set();
  wars.forEach(w=>{if(!G.wars.includes(w))return;[w.a,w.b].forEach(x=>{if(seen.has(x))return;seen.add(x);const n=G.nations[x];if(!n||!n.alive)return;ensureMP(n);
    const os=occShare(x);if(os<.04)return;const cap=mpCap(n);n.mp=Math.min(cap,n.mp+cap*.03*(1+2*os));
    if(!w.mob)w.mob={};if(!w.mob[x]){w.mob[x]=1;const t=`${n.name} decreta la movilización general.`;pushNews(t,x===me?'bad':'news');if(x===me)rep.push({t,c:'bad',big:1});}
    // la IA forma nuevas divisiones de reclutas cada 3 meses si su ejército se encoge
    if(!playerRules(x)&&(G.month%3===0)&&soldiersOf(x)<fieldOf(x)*.85&&n.mp>3000){const own=regionsOf(x).filter(r=>ctrlOf(r)===x).sort((p,q)=>G.regions[q].pop-G.regions[p].pop);
      if(own.length){const s=Math.min(n.mp,fieldOf(x)*.25);n.mp-=s;const a=newArmy(x,own[0],s,{m:.7});a.q*=.85;a.auto=true;}}
    // ayuda extranjera: una potencia rival del agresor envía armas y voluntarios (una vez por guerra y por potencia)
    const foe=enemyIn(w,x),F=G.nations[foe];if(!F||F.gdp<n.gdp*2||!chance(.12))return;if(!w.aid)w.aid={};
    const big=Object.values(G.nations).filter(o=>o.alive&&o.id!==x&&o.id!==foe&&!friendsOf(foe).has(o.id)&&!warBetween(o.id,x)&&!(w.aid[x]||[]).includes(o.id)).sort((p,q)=>q.gdp-p.gdp).slice(0,10);
    if(!big.length)return;const o=big[Math.floor(Math.random()*Math.min(4,big.length))];(w.aid[x]=w.aid[x]||[]).push(o.id);
    n.treas=(n.treas||0)+Math.min(o.gdp*.002,n.gdp*.05);n.mp=Math.min(cap*1.2,n.mp+cap*.08);armiesOf(x).forEach(a=>a.m=Math.min(1.2,a.m+.08));
    const t=`${o.name} envía armas, dinero y voluntarios a ${n.name} contra ${F.name}.`;pushNews(t,x===me?'good':foe===me?'bad':'news');if(x===me||foe===me)rep.push({t,c:x===me?'good':'bad',big:1});});});}

/* ===== v1.1: economía — convergencia condicional y transición demográfica =====
   PIB por habitante: frontera +1.4 %/año; los países lejos de la frontera crecen más según su estabilidad (tope +3 %);
   el impulso real de hoy (Banco Mundial) se desvanece en ~12 años. Población: tiende a −0.2 %/año con vida media de ~40 años. */
const Y0=2026,FPC=()=>80000*Math.pow(1.014,Math.max(0,G.year-Y0));
function econG(n,d){const yrs=Math.max(0,G.year-Y0),pc=n.gdp/Math.max(1,n.pop),f=FPC();const inst=clamp(n.stab/60,.35,1.15);
  const conv=g0=>1.4+Math.min(3,1.0*g0*Math.log(Math.max(1,f/Math.max(300,pc))));
  const pc0=d.gdp/Math.max(1,d.pop),real=clamp(d.gdpg,-2,8)-clamp(d.popg,-1,4.5),mom=(real-(1.4+Math.min(3,clamp((d.stab||50)/60,.35,1.15)*Math.log(Math.max(1,80000/Math.max(300,pc0))))))*Math.exp(-yrs/12);
  return conv(inst)+clamp(mom,-4,5)+R(-1.2,1.2);}
function popG(n,d){const yrs=Math.max(0,G.year-Y0),pc=n.gdp/Math.max(1,n.pop),tgt=pc>40000?-.3:-.15;return tgt+(clamp(d.popg,-1,3.5)-tgt)*Math.exp(-yrs/(pc>25000?14:40));}

/* ===== v1.1: dinastía y herencia ===== */
const RASGOS={genio:{n:'Genio',ic:'🧠',d:'+15 inteligencia',int:15},atleta:{n:'Atlético',ic:'💪',d:'+12 salud',sal:12},caris:{n:'Carismático',ic:'✨',d:'+15 apariencia, +5 influencia',apa:15,inf:5},
  ambic:{n:'Ambicioso',ic:'🔥',d:'+8 influencia al heredar',inf:8},astuto:{n:'Astuto',ic:'🦊',d:'+8 inteligencia, mejor en negocios',int:8},leal:{n:'Leal',ic:'🤝',d:'La corte y el ejército lo aceptan: herencia del poder más segura'},
  enfermizo:{n:'Enfermizo',ic:'🤒',d:'−15 salud',sal:-15},rebelde:{n:'Rebelde',ic:'⚡',d:'−5 felicidad de joven, +5 influencia',inf:5}};
const EDU_K=[{n:'Pública',c:0,g:.3},{n:'Privada',c:.25,g:1.1},{n:'Élite / internado',c:1,g:2.3}];
// impuesto a la herencia: [exención en USD, tasa marginal máxima aproximada] (datos 2024–2025; el resto de países: 0 %)
const INH={USA:[1.4e7,.40],JPN:[3.6e5,.55],KOR:[4e5,.50],FRA:[1e5,.45],GBR:[4e5,.40],DEU:[4e5,.30],ESP:[1e5,.34],BEL:[5e4,.30],CHL:[1e5,.25],IRL:[3.5e5,.33],NLD:[2.5e4,.20],ITA:[1e6,.04],BRA:[0,.08],FIN:[2e4,.19],DNK:[4e4,.15],ISL:[0,.10],GRC:[1.5e5,.20],POL:[1e4,.07],PHL:[0,.06],TWN:[4e5,.20],ECU:[7e4,.35],VEN:[0,.25],COL:[0,.15],TUR:[0,.10],THA:[3e6,.10],ZAF:[2e5,.20],CHE:[0,.07]};
function inhTax(nid,amt){const t=INH[nid];if(!t)return 0;const pr=isReal()&&G.nations[nid]?G.nations[nid].price||1:1;return Math.max(0,amt-t[0]*pr)*t[1];}
function kidInit(c,p){if(c.st)return;const pa=p.partner||{},ps=p.s||{};const mix=k=>clamp(Math.round(((ps[k]||50)+(pa.s&&pa.s[k]!=null?pa.s[k]:R(25,75)))/2+R(-15,15)),5,100);
  c.st={int:mix('inteligencia'),apa:mix('apariencia'),sal:RI(70,98)};c.tr=p.trait&&chance(.35)?p.trait:chance(.65)?pick(Object.keys(RASGOS)):null;c.edu=c.edu||0;
  const T=c.tr&&RASGOS[c.tr];if(T){c.st.int=clamp(c.st.int+(T.int||0),5,100);c.st.apa=clamp(c.st.apa+(T.apa||0),5,100);c.st.sal=clamp(c.st.sal+(T.sal||0),5,100);}}
function heir(p){(p.children||[]).forEach(c=>kidInit(c,p));if(p.heirN){const c=p.children.find(x=>x.name===p.heirN);if(c)return c;}return heir0(p);}
function eduCost(p,k){return U(p)*EDU_K[k].c;}
function dynYear(p){if(!p||!p.alive)return;(p.children||[]).forEach(c=>{kidInit(c,p);if(c.age>=4&&c.age<=22&&c.edu){const k=c.edu,cost=eduCost(p,k);if(p.dinero>=cost){p.dinero-=cost;c.st.int=clamp(c.st.int+EDU_K[k].g*R(.6,1.4),5,100);}else{c.edu=0;log(`No alcanza el dinero para la escuela ${EDU_K[k].n.toLowerCase()} de ${c.name}: pasa a la pública.`,'bad');}}
    else if(c.age>=4&&c.age<=22)c.st.int=clamp(c.st.int+EDU_K[0].g*R(.3,1.7),5,100);});
  if(p.regentTo&&G.year>=p.regentTo){const n=natOf(p);delete p.regentTo;if(n.gov==='dictadura'&&chance(clamp(.72+(p.trait==='leal'?.18:0)+(n.stab-50)/300,.3,.97))){p.ruler=true;p.rulerYears=0;p.terms=1;n.leader=fullName(p);log(`Cumples la mayoría de edad: termina la regencia y asumes el poder de ${n.name}.`,'big');}
    else log('El regente se niega a entregarte el poder. Tendrás que recuperarlo por tu cuenta.','bad');}}
{const _yv11=yearV04;yearV04=function(p){_yv11(p);dynYear(p);};}
function continueAsHeir(){const old=P,h=heir(old);if(!h)return false;kidInit(h,old);
  const n0=natOf(old),kids=old.children.length,law=(old.dyn&&old.dyn.law)||'igual',share=law==='primo'?(kids>1?.7:1):1/Math.max(1,kids);
  const cash=old.dinero,houseV=old.house?old.house.val:0,assetsV=(old.assets||[]).reduce((s,a)=>s+a.val,0),debt=old.debts.reduce((s,d)=>s+d.bal,0);
  const gross=Math.max(0,netWorth(old))*share,tax=inhTax(n0.id,gross);const wasRuler=old.ruler,ideo=typeof ideoOf==='function'?ideoOf(n0):null;
  if(!continueAsHeir0())return false;const np=P;
  np.s.inteligencia=clamp(Math.round(h.st.int+Math.min(np.age,18)*.25),0,100);np.s.apariencia=h.st.apa;np.s.salud=clamp(h.st.sal,10,100);np.trait=h.tr||null;
  const T=np.trait&&RASGOS[np.trait];
  // bienes: la casa, los negocios y los autos pasan al heredero principal; las inversiones se reparten
  np.inv=(old.inv||[]).map(v=>Object.assign({},v,{amt:v.amt*share,val:v.val*share}));
  if(share>=.5){np.house=old.house;np.assets=(old.assets||[]).slice();np.biz=old.biz?Object.assign({},old.biz):null;np.debts=old.debts.map(d=>Object.assign({},d));np.dinero=cash*share;}
  else{np.dinero=(cash+houseV+assetsV-debt)*share;}
  np.dinero-=tax;if(np.dinero<0&&np.inv.length){let need=-np.dinero;np.inv.forEach(v=>{const t=Math.min(v.val,need);v.val-=t;need-=t;});np.inv=np.inv.filter(v=>v.val>1);np.dinero=-need;}
  if(typeof FL==='function'&&typeof fama==='function'&&fama(old)>0)FL(np,'fama',Math.round(fama(old)*.25));
  const prev=old.dyn||{name:'Casa '+old.surname,prest:0,tree:[],law:'igual',y0:old.startYear||G.year-old.age};
  const cargo=wasRuler?((typeof IDEO!=='undefined'&&ideo&&IDEO[ideo])?IDEO[ideo].t[old.sex==='F'?1:0]:'Gobernante')+' de '+n0.name:careerTitle(old);
  np.dyn=Object.assign({},prev,{law,tree:prev.tree.concat([{n:fullName(old),y:G.year-old.age,d:G.year,c:cargo,w:Math.round(netWorth(old)),l:legacy(old),tr:old.trait||null}]).slice(-40),prest:Math.round(prev.prest+legacy(old))});
  np.s.influencia=clamp(np.s.influencia+Math.round(np.dyn.prest/15)+(T&&T.inf||0),0,100);
  // poder político
  if(wasRuler&&n0.gov==='dictadura'&&!np.ruler){np.regentTo=G.year+(18-np.age);const rg=old.partner?old.partner.name:rndName(n0.id);n0.leader=`Regencia de ${rg}`;log(`Eres menor de edad: ${rg} gobierna como regente hasta que cumplas 18.`,'big');}
  if(wasRuler&&n0.gov==='democracia'){np.s.influencia=clamp(np.s.influencia+10,0,100);log('Creces en una familia política: tu apellido abre puertas (+10 influencia).','good');}
  if(np.ruler&&np.trait==='leal')n0.stab=clamp(n0.stab+5,0,100);
  {const pc=Math.round(share*100),net=fmt(Math.max(0,gross-tax));log(law==='primo'?(tax>0?`Herencia (heredero principal, ${pc} %): recibes ${net} tras pagar ${fmt(tax)} de impuesto a la herencia.`:`Herencia (heredero principal, ${pc} %): recibes ${net}.`):(tax>0?`Herencia (reparto igual, ${pc} %): recibes ${net} tras pagar ${fmt(tax)} de impuesto a la herencia.`:`Herencia (reparto igual, ${pc} %): recibes ${net}.`),'big');}
  return true;}
