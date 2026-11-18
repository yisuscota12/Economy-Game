/* ===== v0.8: terreno, invierno, cansancio, coaliciones, generales, mundo vivo, economía nacional ===== */
/* ----- terreno por provincia (calculado del relieve de Natural Earth): [relieve, clima, río, latitud] ----- */
const TRN=r=>(typeof TERR!=='undefined'&&TERR[r])||[0,'',0,0];
const RELIEVE=['llano','colinas','montaña'],CLIMA={'':'templado',d:'desierto',s:'selva',f:'frío'};
function isWinter(r){const lat=TRN(r)[3],m=(G.month||0)%12;if(lat>=35)return m===11||m<=1;if(lat<=-35)return m>=5&&m<=7;return false;}
function terrDef(r){const t=TRN(r);return 1+(t[0]===2?.4:t[0]===1?.15:0)+(t[1]==='s'?.15:0)+(t[2]?.15:0);}
function terrMove(r){const t=TRN(r);return (t[0]===2||t[1]==='s'?1:0)+(isWinter(r)&&(t[0]===2||t[1]==='f')?1:0);}
function terrAttr(r){const t=TRN(r);let x=0;if(t[1]==='d')x+=.015;if(t[1]==='s')x+=.01;if(t[0]===2)x+=.006;if(isWinter(r))x+=t[1]==='f'||t[0]===2?.03:.008;return x;}
function terrName(r){const t=TRN(r);return RELIEVE[t[0]]+(t[1]?' · '+CLIMA[t[1]]:'')+(t[2]?' · río grande':'')+(isWinter(r)?' · invierno':'');}

/* ----- generales ----- */
const TRAITS={of:{n:'Ofensivo',d:'+15 % al atacar'},de:{n:'Defensivo',d:'+15 % al defender'},lo:{n:'Logístico',d:'−35 % de desgaste y mejor abasto'},ve:{n:'Veloz',d:'+1 de movimiento al mes'},
  ca:{n:'Carismático',d:'la moral se recupera el doble'},mo:{n:'Montañés',d:'+25 % en montaña y colinas'},in:{n:'Inexperto',d:'−10 % en batalla; aprende rápido'}};
function newGen(nid){return {n:rndName(nid),t:pick(['of','de','lo','ve','ca','mo','of','de','in']),lv:1,w:0};}
function playerGen(){const p=P;const t=p.s.inteligencia>=70?'lo':p.s.influencia>=60?'ca':p.s.salud>=75?'ve':'of';return {n:fullName(p),t,lv:1,w:0,me:1};}
function genOf(a){const lead=P&&P.alive&&isGeneral(P)&&a.id===P.lead;if(lead){if(!a.gen||!a.gen.me)a.gen=playerGen();}else if(!a.gen||a.gen.me)a.gen=newGen(a.o);return a.gen;}
function genMul(a,def,r){const g=genOf(a);let m=1+.05*(g.lv-1);if(g.t==='of'&&!def)m*=1.15;if(g.t==='de'&&def)m*=1.15;if(g.t==='in')m*=.9;if(g.t==='mo'&&TRN(r)[0]>=1)m*=1.25;return m;}
function genWin(a){const g=genOf(a);g.w=(g.w||0)+1;if(g.lv<3&&g.w>=g.lv*2){g.lv++;if(g.t==='in')g.t=pick(['of','de','lo']);return true;}return false;}
const bigOf=L=>L.reduce((b,a)=>!b||a.n>b.n?a:b,null);

/* ----- cansancio de guerra (0–100 por bando) ----- */
const exOf=(w,nid)=>nid===w.a?(w.exA||0):nid===w.b?(w.exB||0):0;
function addEx(w,nid,d){if(nid===w.a)w.exA=clamp((w.exA||0)+d,0,100);else if(nid===w.b)w.exB=clamp((w.exB||0)+d,0,100);}
const natEx=nid=>warsOf(nid).reduce((m,w)=>Math.max(m,exOf(w,nid)),0);
function occShare(nid){const rs=regionsOf(nid);if(!rs.length)return 0;let t=0,o=0;rs.forEach(r=>{const p=G.regions[r].pop;t+=p;if(ctrlOf(r)!==nid)o+=p;});return o/Math.max(1,t);}
function exhaustionTick(wars){const L=G._loss||{};wars.forEach(w=>{if(!G.wars.includes(w))return;[w.a,w.b].forEach(x=>{const d=.6+40*(L[x]||0)/Math.max(1,fieldOf(x))+3*occShare(x);addEx(w,x,d);
    const n=G.nations[x];const e=exOf(w,x);n.stab=clamp(n.stab-e/600,0,100);if(playerRules(x)&&isReal())n.approval=clamp(n.approval-e/400,3,95);});});}
// paz por agotamiento entre países de la IA
function aiExhaustPeace(wars,rep){wars.forEach(w=>{if(!G.wars.includes(w)||w.link||playerRules(w.a)||playerRules(w.b))return;const e=Math.max(w.exA||0,w.exB||0);
  if(e>45&&chance((e-45)/300)){const me=P&&P.alive?natOf(P).id:null;const mine=w.a===me||w.b===me;mandoAIPeace(w);if(mine)rep.push({t:`Tu gobierno firma la paz con ${G.nations[enemyIn(w,me)].name} por el cansancio de la guerra.`,c:'news',big:1});}});}

/* ----- coaliciones: aliados, vasallos y señores entran con sus propios ejércitos ----- */
function joinWar(x,foe,main,side){if(!G.nations[x]||!G.nations[x].alive||!G.nations[foe]||!G.nations[foe].alive||x===foe||warBetween(x,foe))return null;
  const w={a:x,b:foe,score:0,years:0,ma:1,mb:1,na0:regionsOf(x).length,nb0:regionsOf(foe).length,link:pk(main.a,main.b),mando:true,bat:0};G.wars.push(w);CACHE.wk=null;
  G.nations[x].allies=G.nations[x].allies.filter(y=>y!==foe);G.nations[foe].allies=G.nations[foe].allies.filter(y=>y!==x);touchDip();
  if(!armiesOf(x).length)spawnArmies(x,foe);if(!armiesOf(foe).length)spawnArmies(foe,x);
  pushNews(`${G.nations[x].name} entra a la guerra contra ${G.nations[foe].name} del lado de ${G.nations[side].name}.`,'news');return w;}
function callCoalition(w){const me=P&&P.alive?natOf(P).id:null;if(w.link)return;
  const defs=[...friendsOf(w.b)].filter(x=>x!==w.b&&x!==w.a&&G.nations[x]&&G.nations[x].alive);const atks=[...friendsOf(w.a)].filter(x=>x!==w.a&&x!==w.b&&G.nations[x]&&G.nations[x].alive);
  defs.forEach(x=>{if(x===me&&playerRules(me)){if(!G.calls.some(c=>c.ally===w.b&&c.foe===w.a))G.calls.push({kind:overlordOf(w.b)===me?'vas':'ally',ally:w.b,foe:w.a});return;}
    const c=overlordOf(x)===w.b||overlordOf(w.b)===x?1:isReal()?.6:.7;if(chance(c))joinWar(x,w.a,w,w.b);});
  atks.forEach(x=>{if(x===me&&playerRules(me))return;const c=overlordOf(x)===w.a?1:w.a===me?clamp(.35+opOf(x)/200,.1,.85):.35;if(chance(c))joinWar(x,w.b,w,w.a);});}
// al terminar la guerra principal: los aliados del ganador se quedan con lo que ocupan del perdedor
function settleLinked(w){const key=pk(w.a,w.b);const L=G.wars.filter(x=>x.link===key);if(w.win){const lose=enemyIn(w,w.win);
    L.forEach(x=>{if(x.a!==lose&&x.b!==lose)return;const ally=enemyIn(x,lose);if(!friendsOf(w.win).has(ally)&&ally!==w.win)return;const rs=occBy(ally,lose);if(rs.length){rs.forEach(r=>transfer(r,ally));pushNews(`${G.nations[ally].name} se queda con ${rs.length} provincia(s) de ${G.nations[lose].name}.`);}});checkGone(lose);}
  L.forEach(x=>{if(G.wars.includes(x))makePeace(x,true);});}
function touchDip(){if(typeof CACHE!=='undefined')CACHE.fr=null;}

/* ----- guerrillas en provincias ocupadas ----- */
function guerrillaTick(rep){const me=P&&P.alive?natOf(P).id:null;const idx=G._idx||armyIndex();
  for(const r in G.occ){const by=G.occ[r];if(!G.regions[r]||!G.nations[by])continue;const here=(idx[r]||[]).filter(a=>a.o===by);const t=TRN(r);
    const x0=G.regions[r],home=x0.w0===x0.o;const p=(.02+(x0.pop>1e6?.02:0)+(t[0]===2||t[1]==='s'?.03:0))*(isReal()?1:.7)*(home?1.35:.8)*(1+(typeof occShare==='function'?occShare(x0.o):0));
    if(here.length){here.forEach(a=>a.n-=a.n*R(.003,.012));continue;}
    if(chance(p)){const o=G.regions[r].o;delete G.occ[r];if(o===me||by===me)rep.push({t:`La guerrilla expulsa a ${G.nations[by].name} de ${RG[r].nm}.`,c:o===me?'good':'bad',big:1,r});}}}

/* ----- rebeliones de independencia en territorio conquistado ----- */
function rebellionsYear(){const me=P&&P.alive?natOf(P).id:null;const done=new Set();
  for(const r in G.regions){const x=G.regions[r];if(x.o===x.w0||x.cq==null||done.has(x.w0))continue;if(G.occ&&G.occ[r])continue;const own=G.nations[x.o],old=G.nations[x.w0];if(!own||!old)continue;
    const age=G.year-x.cq,fade=Math.max(.15,1-age/40),pr=.0035*fade*(1+Math.max(0,50-own.stab)/20)*(x.o===me?1.2:1);if(!chance(pr))continue;
    if(!old.alive){const rs=Object.keys(G.regions).filter(k=>G.regions[k].o===x.o&&G.regions[k].w0===x.w0&&(k===r||chance(.5)));
      old.alive=true;old.leader=rndName(x.w0);old.gov='democracia';old.stab=40;old.allies=[];old.army=Math.max(1.5,armyIdx(N0[x.w0].milx)*.3);old.nextElec=G.year+old.term;
      rs.forEach(k=>transfer(k,x.w0));done.add(x.w0);declareWar(x.w0,x.o);
      pushNews(`Rebelión: ${old.name} declara su independencia de ${own.name} en ${rs.length} provincia(s).`,x.o===me?'bad':'news');}
    else{own.stab=clamp(own.stab-3,0,100);x.gdp*=.97;if(x.o===me)pushNews(`Disturbios en ${RG[r].nm}: parte de la población no acepta el gobierno de ${own.name}.`,'bad');}}}

/* ----- mundo vivo: los meses de guerra de todo el mundo corren dentro del año ----- */
function worldMonths(){ensureV07();syncMando();let k=0;while((G.month||0)<12&&k<12){monthTick(true);k++;}}

/* ----- economía nacional ----- */
function ensureEco(n){if(!n)return;if(n.debtR==null){const d=N0[n.id];n.debtR=((d&&d.debt)||50)/100;}if(n.taxL==null)n.taxL=0;if(!n.tech)n.tech={c:0,m:0};if(n.bonds==null)n.bonds=0;}
const TAXL={'-1':{n:'Bajos',k:.75,g:.4,ap:4},'0':{n:'Normales',k:1,g:0,ap:0},'1':{n:'Altos',k:1.3,g:-.4,ap:-5}};
function tradeBonus(nid){if(!G.dip||!G.dip.tr)return 0;let b=0;const n=G.nations[nid];for(const k in G.dip.tr){if(G.dip.tr[k]<=G.year)continue;const [x,y]=k.split('|');if(x!==nid&&y!==nid)continue;const o=G.nations[x===nid?y:x];if(!o||!o.alive)continue;b+=Math.min(.6,2*o.gdp/(n.gdp+o.gdp))*.5;}return Math.min(1.5,b);}
function embargoHit(nid){if(!G.dip||!G.dip.emb)return 0;let h=0;const n=G.nations[nid];for(const k in G.dip.emb){const [x,y]=k.split('>');const o=G.nations[x===nid?y:x];if(!o||!o.alive)continue;
  if(y===nid)h+=Math.min(1,o.gdp/(n.gdp+o.gdp))*1.2;else if(x===nid)h+=Math.min(.4,o.gdp/(n.gdp+o.gdp))*.4;}return Math.min(2.5,h);}
function ecoBonus(n){ensureEco(n);let b=.25*n.tech.c+TAXL[n.taxL].g+tradeBonus(n.id)-embargoHit(n.id);if(n.debtR>1.2)b-=(n.debtR-1.2)*.6;return b;}
const techQ=nid=>{const n=G.nations[nid];return (1+.06*((n&&n.tech&&n.tech.m)||0))*(typeof ideoMil==='function'?ideoMil(nid):1);};
function bondRate(n){ensureEco(n);return Math.max(1,n.rate)/100*(1+Math.max(0,n.debtR-.9)*1.5);}
function researchCost(n,k){ensureEco(n);return n.gdp*.0015*(1+n.tech[k]*.5);}
function ecoYear(){const me=P&&P.alive?natOf(P).id:null;
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;ensureEco(n);
    if(!playerRules(id)){const k=clamp(gdppc(n)/30000,.1,2);n.tech.c=Math.min(10,n.tech.c+.03*k);n.tech.m=Math.min(10,n.tech.m+.03*k*clamp(N0[id]?N0[id].milx/Math.max(1,N0[id].gdp)*60:1,.3,2.5));continue;}
    n.debtR=Math.max(0,n.debtR/(1+(n.g||0)/100)+(isReal()?.01:0));
    if(n.bonds>0){const i=n.bonds*bondRate(n);n.treas=(n.treas||0)-i;if(i>treasuryIncome(n)*.3)log(`Los intereses de tus bonos se comen ${fmtN(i)} del tesoro este año.`,'bad');}
    if(isReal()&&n.debtR>1.3&&chance(.12)){n.rec=Math.max(n.rec,2);n.stab=clamp(n.stab-8,0,100);n.approval=clamp(n.approval-8,3,95);log(`Crisis de deuda: los mercados dudan de que ${n.name} pueda pagar (${Math.round(n.debtR*100)} % del PIB). Recesión.`,'bad');}}
  if(G.dip&&G.dip.tr)for(const k in G.dip.tr)if(G.dip.tr[k]<=G.year){const [x,y]=k.split('|');if(me&&(x===me||y===me))log(`Vence el tratado comercial con ${G.nations[x===me?y:x].name}.`);delete G.dip.tr[k];}}
function issueBonds(n){ensureEco(n);const amt=n.gdp*.01;n.treas=(n.treas||0)+amt;n.bonds+=amt;n.debtR+=amt/Math.max(1,n.gdp);return `Emites bonos por ${fmtN(amt)} a una tasa de ${pct(bondRate(n)*100)}. La deuda pública sube a ${Math.round(n.debtR*100)} % del PIB.`;}
function repayBonds(n){ensureEco(n);const amt=Math.min(n.bonds,Math.max(0,n.treas||0));n.treas-=amt;n.bonds-=amt;n.debtR=Math.max(0,n.debtR-amt/Math.max(1,n.gdp));return `Pagas ${fmtN(amt)} de bonos.`;}
function research(n,k){const c=researchCost(n,k);n.treas-=c;n.tech[k]=Math.min(10,Math.floor(n.tech[k])+1);if(k==='m')armiesOf(n.id).forEach(a=>a.q=qualOf(n.id));return (k==='m'?`Tu país alcanza el nivel ${n.tech[k]} de tecnología militar (${fmt(c)}).`:`Tu país alcanza el nivel ${n.tech[k]} de tecnología civil (${fmt(c)}).`);}
// treasuryIncome (v0.4) con el nivel de impuestos
function treasuryIncome(n){ensureEco(n);return n.gdp*.006*(isReal()?clamp(N0[n.id].tax/15,.5,1.6):1)*TAXL[n.taxL].k;}

/* ----- diplomacia ampliada: comercio y embargos ----- */
function dipActionsV8(t){const a=dipActionsBase(t);const me=natOf(P).id,T=G.nations[t];ensureV07();G.dip.tr=G.dip.tr||{};G.dip.emb=G.dip.emb||{};
  const ok=P.ruler&&P.alive&&!P.event&&(P.dip||0)>0&&T.alive,war=warBetween(me,t),tr=G.dip.tr[pk(me,t)]>G.year,emb=G.dip.emb[me+'>'+t];
  const odds=clamp(.3+opOf(t)/120+(G.nations[me].gdp>T.gdp?.1:0),.05,.95);
  if(!war&&!tr&&!emb)a.push({k:'tr',t:'Tratado comercial (10 años)',s:`Probabilidad ${Math.round(odds*100)} % · ambos crecen más (+${(Math.min(.6,2*T.gdp/(G.nations[me].gdp+T.gdp))*.5).toFixed(2)} % al año para ti)`,can:ok,fn:()=>{if(chance(odds)){G.dip.tr[pk(me,t)]=G.year+10;addOp(t,8);return `Firmas un tratado comercial con ${T.name} hasta ${G.year+10}.`;}return `${T.name} no quiere el tratado comercial.`;}});
  if(tr)a.push({k:'untr',t:'Cancelar el tratado comercial',s:'−opinión',can:ok,fn:()=>{delete G.dip.tr[pk(me,t)];addOp(t,-15);return `Cancelas el tratado comercial con ${T.name}.`;}});
  if(!emb)a.push({k:'emb',t:'Embargo comercial',s:`Su economía pierde ~${(Math.min(1,G.nations[me].gdp/(G.nations[me].gdp+T.gdp))*1.2).toFixed(1)} % al año; tú también pierdes un poco · −30 opinión`,can:ok,fn:()=>{G.dip.emb[me+'>'+t]=1;delete G.dip.tr[pk(me,t)];addOp(t,-30);return `Impones un embargo comercial a ${T.name}.`;}});
  else a.push({k:'unemb',t:'Levantar el embargo',s:'+opinión',can:ok,fn:()=>{delete G.dip.emb[me+'>'+t];addOp(t,10);return `Levantas el embargo a ${T.name}.`;}});
  a.forEach(x=>{const f=x.fn;x.fn=()=>{const r=f();touchDip();return r;};});return a;}

/* ----- registro de batallas (parte de guerra) ----- */
function logBattle(o){G.blog=G.blog||[];G.blog.push(o);if(G.blog.length>60)G.blog.splice(0,G.blog.length-60);}

/* ----- la IA forma y rompe alianzas (amenazas comunes, cultura) ----- */
function aiAlliancesYear(){const me=P&&P.alive?natOf(P).id:null;const alive=Object.values(G.nations).filter(n=>n.alive);
  alive.forEach(n=>{if(n.id===me&&playerRules(me))return;if(n.allies.length>=2||!chance(.025))return;
    const nb=neighborsOf(n.id).filter(x=>G.nations[x].alive&&x!==me&&!n.allies.includes(x)&&!warBetween(n.id,x)&&G.nations[x].allies.length<2&&!overlordOf(x)&&!overlordOf(n.id));if(!nb.length)return;
    const threat=t=>neighborsOf(t).some(z=>power(z)>2*power(t)&&warsOf(z).length);
    const c=nb.filter(x=>cultOf(x)===cultOf(n.id)||threat(x)||threat(n.id));const t=c.length?pick(c):null;if(!t)return;
    n.allies.push(t);G.nations[t].allies.push(n.id);touchDip();if(me&&neighborsOf(me).includes(t))pushNews(`${n.name} y ${G.nations[t].name} firman una alianza militar.`);});
  alive.forEach(n=>{if(n.id===me&&playerRules(me))return;n.allies.slice().forEach(t=>{if(t===me)return;if(chance(.01)){n.allies=n.allies.filter(x=>x!==t);G.nations[t].allies=G.nations[t].allies.filter(x=>x!==n.id);touchDip();}});});}

/* ----- turno anual v0.8 ----- */
function yearV08(p){ecoYear();rebellionsYear();aiAlliancesYear();if(G.blog)G.blog=G.blog.filter(b=>G.year-b.y<=3);}
