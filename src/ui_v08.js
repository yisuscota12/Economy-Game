/* ===== v0.8: interfaz — ejércitos animados, batallas, niebla de guerra, órdenes rápidas, parte de guerra, economía, velocidad ===== */
if(CFG.quick==null)CFG.quick=1;
const ANIM={prev:null,t0:0,on:false,fx:[]};
let ARMYG=null;

/* ----- niebla de guerra: los ejércitos enemigos se ven solo cerca de tu territorio o tus tropas ----- */
function armyVisible(a){if(!P||!P.alive)return true;const me=natOf(P).id;if(!hostile(me,a.o))return true;if(a.sea)return false;
  const fr=friendsOf(me);const mine=r=>fr.has(ctrlOf(r))||(G._myAt&&G._myAt.has(r));
  if(!G._myAt||G._myAtK!==G.month+'|'+G.year+'|'+G.armies.length){G._myAt=new Set(G.armies.filter(x=>fr.has(x.o)&&!x.sea).map(x=>x.r));G._myAtK=G.month+'|'+G.year+'|'+G.armies.length;}
  if(mine(a.r))return true;for(const x of RG[a.r].adj){if(mine(x))return true;for(const y of RG[x].adj)if(mine(y))return true;}return false;}

/* ----- capa de ejércitos (se redibuja sola durante las animaciones) ----- */
function armyPos(a){if(a.sea){const c=RG[a.r].c,c1=RG[a.sea.to].c,t=a.sea.t||a.sea.eta+1,f=clamp(1-a.sea.eta/t,0,1);return [c[0]+(c1[0]-c[0])*f,c[1]+(c1[1]-c[1])*f];}return RG[a.r].c;}
function drawArmies(ov,u){ARMYG=el('g',{id:'armyG'},ov);renderArmies(1);}
function renderArmies(k){const g=ARMYG;if(!g||!G)return;while(g.firstChild)g.removeChild(g.firstChild);if(!G.armies)return;const u=upp(),me=cmdNat()||(P&&P.alive?natOf(P).id:null);
  if(typeof drawFrontArrows==='function')drawFrontArrows(g,u);
  const e=k>=1?1:1-Math.pow(1-k,3);
  // ruta del ejército seleccionado
  const sel=armyById(MO.sel);
  if(sel&&!sel.sea&&(sel.path.length||sel.nav)){const pts=[sel.r].concat(sel.path).map(r=>RG[r].c);
    if(sel.path.length)el('polyline',{points:pts.map(c=>c.join(',')).join(' '),fill:'none',stroke:'#f2c14e','stroke-width':2.2*u,'stroke-dasharray':`${5*u} ${3*u}`,'stroke-linecap':'round'},g);
    if(sel.nav){const c0=RG[sel.r].c,c1=RG[sel.nav.to].c;el('line',{x1:c0[0],y1:c0[1],x2:c1[0],y2:c1[1],stroke:'#7cc4ff','stroke-width':2*u,'stroke-dasharray':`${2*u} ${4*u}`},g);}
    const d=sel.nav?RG[sel.nav.to].c:pts[pts.length-1];el('circle',{cx:d[0],cy:d[1],r:5*u,fill:'none',stroke:'#f2c14e','stroke-width':2*u},g);}
  for(const r in (G.sg||{})){const c=RG[r]&&RG[r].c;if(!c)continue;el('circle',{cx:c[0],cy:c[1],r:9*u,fill:'none',stroke:'#ff8a5c','stroke-width':1.6*u,'stroke-dasharray':`${3*u} ${2*u}`},g);}
  // agrupa marcadores que se encimarían en pantalla (misma nación)
  const cell=36*u,groups={};
  G.armies.forEach(a=>{if(!armyVisible(a))return;let p=armyPos(a);const pv=ANIM.prev&&ANIM.prev[a.id];if(pv&&e<1)p=[pv[0]+(p[0]-pv[0])*e,pv[1]+(p[1]-pv[1])*e];
    const key=a.id===MO.sel?'s'+a.id:a.o+'|'+Math.round(p[0]/cell)+'|'+Math.round(p[1]/cell);const G_=groups[key]||(groups[key]={L:[],x:0,y:0});G_.L.push(a);G_.x+=p[0];G_.y+=p[1];});
  const stack={};
  Object.values(groups).forEach(gr=>{const L=gr.L,n=L.reduce((s,a)=>s+a.n,0),a0=bigOf(L);const cx=gr.x/L.length,cy=gr.y/L.length;const sk=Math.round(cx/cell)+'|'+Math.round(cy/cell);const i=stack[sk]=(stack[sk]||0)+1;
    const w=(L.length>1?40:32)*u,h=13*u,x=cx-w/2,y=cy-h*1.6-(i-1)*h*1.25;const mineA=a0.o===me,host=me&&hostile(me,a0.o),isSel=L.some(a=>a.id===MO.sel);
    const col=rgbOf(G.nations[a0.o].color).map(v=>Math.round(v*.55));const m=L.reduce((s,a)=>s+a.m*a.n,0)/Math.max(1,n);
    el('rect',{x,y,width:w,height:h,rx:3*u,fill:`rgb(${col})`,stroke:isSel?'#fff':mineA?'#f2c14e':host?'#ff5050':'#0b1118','stroke-width':(isSel?2.4:1.3)*u},g);
    el('rect',{x:x+1.5*u,y:y+h-2.4*u,width:(w-3*u)*clamp(m,0,1),height:1.6*u,fill:m>.6?'#47c26b':m>.3?'#f2c14e':'#f0565d'},g);
    const t=el('text',{x:cx,y:y+h*.68,'text-anchor':'middle','font-size':8.6*u,'font-weight':700,fill:'#fff'},g);
    t.textContent=(L.length>1?L.length+'× ':'')+(a0.sea?'⛵':a0.train>0?'⏳':P&&P.lead===a0.id?'★':'')+kShort(n);});
  // destellos de batalla
  const now=performance.now();ANIM.fx=ANIM.fx.filter(f=>now-f.t0<1600);
  ANIM.fx.forEach(f=>{const c=RG[f.r]&&RG[f.r].c;if(!c)return;const q=(now-f.t0)/1600;
    el('circle',{cx:c[0],cy:c[1],r:(6+22*q)*u,fill:'none',stroke:f.c,'stroke-width':(3*(1-q)+.5)*u,opacity:1-q},g);
    const t=el('text',{x:c[0],y:c[1]+5*u,'text-anchor':'middle','font-size':14*u,opacity:1-q*.8},g);t.textContent='⚔️';});}
function animateMonth(rep){ANIM.t0=performance.now();ANIM.fx=rep.filter(x=>x.r&&/Batalla|ocupa|libera|guerrilla/i.test(x.t)).slice(0,8).map(x=>({r:x.r,t0:ANIM.t0,c:/Batalla/.test(x.t)?'#ff6a3d':x.c==='bad'?'#f0565d':'#f2c14e'}));
  if(ANIM.on)return;ANIM.on=true;const step=()=>{const k=(performance.now()-ANIM.t0)/650;renderArmies(Math.min(1,k));if(k<1||ANIM.fx.length)requestAnimationFrame(step);else{ANIM.on=false;ANIM.prev=null;renderArmies(1);}};requestAnimationFrame(step);}
function snapPositions(){const m={};(G.armies||[]).forEach(a=>m[a.id]=armyPos(a).slice());return m;}

/* ----- sonidos de guerra ----- */
function sfxWar(k){if(!CFG.snd)return;try{if(k==='battle'){[0,.07,.15,.26].forEach((t,i)=>tone(55+i*9,t,.35,'sawtooth',.05));tone(110,.05,.5,'square',.03);}
  else if(k==='march'){[0,.22,.44,.55].forEach(t=>tone(95,t,.12,'triangle',.07));}
  else if(k==='victory'){[392,523,659,784].forEach((f,i)=>tone(f,i*.11,.35,'triangle',.05));}}catch(e){}}

/* ----- avanzar ----- */
function afterMonth(res){MO.rep=res.rep.filter(x=>x.big).slice(-4);const war=res.rep.some(x=>x.big&&/Batalla/.test(x.t));
  if(res.yearEnd&&P.alive&&!G.offer){ageUp();syncMando();pulseConquests();}
  if(MO.sel&&!armyById(MO.sel))MO.sel=null;save();render();animateMonth(res.rep);
  if(war)sfxWar('battle');else sfxWar('march');
  const cap=res.rep.find(x=>x.big&&/capital|capitula|destruido/.test(x.t));if(cap)toast('⚔️ '+MES[(G.month+11)%12],cap.t);}
function advanceTurn(){if(!P)return;if(!P.alive){showDeath();return;}if(blockedTurn()){render();return;}
  if(mandoActive()){ANIM.prev=snapPositions();const res=monthTick(false);afterMonth(res);return;}
  ageUp();syncMando();save();sfx(P.event?'bad':'year');render();pulseConquests();}
// avance rápido repartido entre cuadros: la pantalla no se congela en equipos lentos
let FF_ON=false;
function fastForward(n){if(FF_ON||!P||!P.alive||blockedTurn())return;FF_ON=true;let i=0,last=null;const btn=$('ffBtn');const lbl=btn.textContent;btn.disabled=true;$('ageBtn').disabled=true;
  const stepYear=()=>{let k=0;while(mandoActive()&&G.month<12&&P.alive&&!G.offer&&!(G.calls&&G.calls.length)&&k<12){monthTick(true);k++;}
    if(!P.alive||G.offer||(G.calls&&G.calls.length))return false;ageUp();syncMando();if(P._paper&&P._paper.imp)last=P._paper;
    if(P.event&&CFG.ff!=='todo'){const e=EV.find(x=>x.id===P.event.id);if(e&&!e.prio&&P.event.id!=='diagnostico'){resolveEvent(Math.floor(Math.random()*P.event.opts.length),'Avance rápido');if(P._dx&&P.alive)setEvent(P,EV.find(x=>x.id==='diagnostico'));}}
    return P.alive&&!P.event;};
  const tick=()=>{const ok=stepYear();i++;btn.textContent=`⏳ ${i}/${n}`;if(ok&&i<n){setTimeout(tick,16);return;}
    FF_ON=false;btn.textContent=lbl;P._paper=P.event||!P.alive?null:last;save();sfx('year');render();pulseConquests();};
  setTimeout(tick,16);}
function autoRest(){if(!P||!P.alive||blockedTurn())return;let n=0;const all=[];ANIM.prev=snapPositions();
  while(mandoActive()&&G.month<12&&P.alive&&!G.offer&&!(G.calls&&G.calls.length)&&n<12){const r=monthTick(true);all.push(...r.rep);MO.rep=r.rep.filter(x=>x.big).slice(-4);n++;}
  if(P.alive&&!G.offer&&!(G.calls&&G.calls.length)){ageUp();syncMando();}
  save();sfx('year');render();pulseConquests();animateMonth(all.filter(x=>x.big));}

/* ----- órdenes rápidas: toca tu ejército y luego el destino ----- */
function onMapPick(id){const me=cmdNat();
  if(MO.ord){const a=armyById(MO.ord);MO.ord=null;if(a){const r=orderMove(a,id);MO.rep=[{t:r,c:/No hay|Sin ruta|Solo|marina/.test(r)?'bad':'good'}];MO.sel=a.id;sfxWar('march');}G.sel=id;save();render();return true;}
  const mine=me?armiesOf(me).filter(a=>a.r===id&&!a.sea):[];const sel=armyById(MO.sel);
  if(mine.length){if(sel&&sel.r===id&&G.sel===id){const i=mine.findIndex(a=>a.id===MO.sel);if(i===mine.length-1){MO.sel=null;}else MO.sel=mine[i+1].id;}else MO.sel=mine[0].id;return false;}
  if(CFG.quick&&sel&&sel.o===me&&hasCommand(P)&&!blockedTurn()&&!sel.sea&&!(sel.train>0)){const r=orderMove(sel,id);MO.rep=[{t:r,c:/No hay|Sin ruta|Solo|marina/.test(r)?'bad':'good'}];G.sel=id;sfxWar('march');save();render();return true;}
  return false;}

/* ----- barra de Mando ----- */
function renderCmd(){const box=$('cmdBar');if(!box)return;if(!P||!hasCommand(P)){box.innerHTML='';box.style.display='none';return;}box.style.display='block';
  const me=natOf(P).id,n=natOf(P),wars=warsOf(me);const mine=armiesOf(me);ensureMP(n);
  let h=`<div class="cmd-h">${ico('sword',15,'#f2c14e')} <b>Mando</b> · ${P.ruler?careerTitle(P):'General'} · ${mandoActive()?`${MES[G.month%12]} ${G.year}`+' · '+`mes ${G.month+1} de 12`+' · 🎯 movimiento '+(G.mpt==null?mptMax(me):G.mpt)+'/'+mptMax(me):'en paz'}</div>`;
  if(wars.length)h+=wars.map(w=>{const foe=enemyIn(w,me),s=w.a===me?w.score:-w.score;const fs=soldiersOf(foe);const lk=w.link?' <span class="pill">coalición</span>':'';
    return `<div class="cmd-w"><span>vs ${flag(foe,11)} <b>${G.nations[foe].name}</b>${lk}</span><span class="${s>=0?'pos':'neg'}">frente ${s>0?'+':''}${Math.round(s)}</span>
      <div class="cmd-bar"><i style="width:${clamp(50+s/2,0,100)}%"></i></div>
      <div class="cmd-s">Tus tropas ${fmtK(soldiersOf(me))} · enemigo ${fmtK(fs)} · ocupas ${occBy(me,foe).length} · te ocupan ${occBy(foe,me).length} prov.<br>Cansancio: tú ${Math.round(exOf(w,me))} % · ellos ${Math.round(exOf(w,foe))} %${G.wars.filter(x=>x.link===pk(w.a,w.b)).length?` · en coalición: ${G.wars.filter(x=>x.link===pk(w.a,w.b)).map(x=>G.nations[x.a].name).join(', ')}`:''}</div></div>`;}).join('');
  else h+=`<div class="cmd-s">${mine.length} ejército(s) · ${fmtK(soldiersOf(me))} soldados · reserva ${fmtK(n.mp||0)}${P.ruler?` · tesoro ${fmtN(n.treas||0)}`:''}. Las guerras se juegan mes a mes con tus ejércitos.</div>`;
  const sel=armyById(MO.sel);
  if(MO.ord){const a=armyById(MO.ord);h+=`<div class="cmd-ord">🎯 Toca en el mapa la provincia destino del ejército de ${a?RG[a.r].nm:''}. <button class="btn" id="cOrdX">Cancelar</button></div>`;}
  else if(sel&&sel.o===me&&CFG.quick&&hasCommand(P))h+=`<div class="cmd-ord">🎯 Ejército de ${RG[sel.sea?sel.sea.to:sel.r].nm} (${fmtK(sel.n)}) listo: toca el destino en el mapa. <button class="btn" id="cSelX">Soltar</button></div>`;
  if(MO.rep.length)h+=`<div class="cmd-rep">${MO.rep.map(x=>`<div class="${x.c}">${x.t}</div>`).join('')}</div>`;
  h+=`<div class="mini-actions"><button class="btn" id="cArm">🪖 Ejércitos</button>${P.ruler?`<button class="btn" id="cDip">🤝 Diplomacia <span class="badge2">${P.dip||0}</span></button><button class="btn" id="cEco">📊 Economía</button>`:''}<button class="btn" id="cLog">📜 Parte de guerra</button>${mandoActive()?`<button class="btn" id="cAuto" ${blockedTurn()?'disabled':''}>⏩ Resto del año (IA)</button>`:''}</div>`;
  box.innerHTML=h;
  box.querySelector('#cArm').onclick=showArmies;box.querySelector('#cLog').onclick=showWarLog;if(P.ruler){box.querySelector('#cDip').onclick=showDiplomacy;box.querySelector('#cEco').onclick=showEconomy;}
  const au=box.querySelector('#cAuto');if(au)au.onclick=autoRest;const ox=box.querySelector('#cOrdX');if(ox)ox.onclick=()=>{MO.ord=null;render();};const sx=box.querySelector('#cSelX');if(sx)sx.onclick=()=>{MO.sel=null;render();};}

/* ----- parte de guerra ----- */
function showWarLogV(){const me=P&&P.alive?natOf(P).id:null;const L=(G.blog||[]).slice().reverse();const mine=L.filter(b=>b.a===me||b.d===me||friendsOf(me).has(b.a)||friendsOf(me).has(b.d)),world=L.filter(b=>!mine.includes(b));
  const row=b=>{const won=b.w===me||(me&&friendsOf(me).has(b.w));const cls=b.a===me||b.d===me?(won?'good':'bad'):'';
    return `<div class="item"><span><div class="t ${cls}">${MES[b.m]} ${b.y} · ${RG[b.r]?RG[b.r].nm:''} — gana ${G.nations[b.w]?G.nations[b.w].name:''}</div>
      <div class="s">${flag(b.a,10)} <span>${G.nations[b.a]?G.nations[b.a].name:''}</span> <span>${fmtK(b.na)}</span> (<span>bajas ${fmtK(b.la)}</span>) ⚔️ ${flag(b.d,10)} <span>${G.nations[b.d]?G.nations[b.d].name:''}</span> <span>${fmtK(b.nd)}</span> (<span>bajas ${fmtK(b.ld)}</span>)<br>Terreno: ${b.t}${b.amph?' · desembarco':''} · Generales: ${b.ga} contra ${b.gd}${b.up?` · ${b.up} sube de nivel`:''}</div></span></div>`;};
  openSheet(`<h3>📜 Parte de guerra</h3><div class="hint">Las batallas de los últimos 3 años. El defensor recibe bonos por montaña (+40 %), colinas (+15 %), selva (+15 %), ríos grandes (+15 %), fortalezas y capital.</div>`+
    `<div class="sect">Tus batallas y las de tus aliados</div>`+(mine.length?mine.slice(0,25).map(row).join(''):'<div class="hint">Sin batallas recientes.</div>')+
    `<div class="sect">En el mundo</div>`+(world.length?world.slice(0,20).map(row).join(''):'<div class="hint">El mundo está en calma.</div>'));}

/* ----- economía nacional ----- */
function showEconomyV(){if(!P||!P.ruler)return;const n=natOf(P),me=n.id;ensureEco(n);ensureV07();const real=isReal();const inc=treasuryIncome(n),bi=n.bonds*bondRate(n),up=upkeepOf(me),trib=vassalsOf(me).reduce((s,v)=>s+treasuryIncome(G.nations[v])*.25,0);
  const row=(a,b,c)=>`<div class="frow ${c||''}"><span>${a}</span><span>${b}</span></div>`;
  const trs=Object.keys(G.dip.tr||{}).filter(k=>G.dip.tr[k]>G.year&&k.split('|').includes(me)).map(k=>{const t=k.split('|').find(x=>x!==me);return `${G.nations[t].name} (hasta ${G.dip.tr[k]})`;});
  const embs=Object.keys(G.dip.emb||{}).filter(k=>k.split('>').includes(me)).map(k=>{const [x,y]=k.split('>');return x===me?`impones a ${G.nations[y].name}`:`${G.nations[x].name} te lo impone`;});
  let h=`<h3>📊 Economía de ${n.name}</h3><div class="hint">PIB ${fmtN(n.gdp)} · crecimiento ${pct(n.g||0)} (bono de política económica ${(ecoBonus(n)>=0?'+':'')+ecoBonus(n).toFixed(2)} %)${real?` · inflación ${pct(n.infl)}`:''}<br>Deuda pública ${Math.round(n.debtR*100)} % del PIB (punto de partida: FMI) · tasa de tus bonos ${pct(bondRate(n)*100)}</div>`;
  h+=`<div class="fin">`+row('Ingresos del tesoro (impuestos '+TAXL[n.taxL].n.toLowerCase()+')','+'+fmtN(inc))+(trib?row('Tributo de vasallos','+'+fmtN(trib)):'')+(bi?row('Intereses de tus bonos','−'+fmtN(bi)):'')+(up?row('Tropas extra','−'+fmtN(up)):'')+row('Saldo anual',fmtN(inc+trib-bi-up),'tot')+row('Tesoro hoy',fmtN(n.treas||0))+`</div>`;
  const items=[];const busy=P.event||blockedTurn();
  [-1,0,1].forEach(k=>{if(k===n.taxL)return;const T=TAXL[k];items.push({sec:real&&n.gov==='democracia'?'Impuestos (usa una acción de gobierno, requiere votación)':'Impuestos (usa una acción de gobierno)',t:`Impuestos ${T.n.toLowerCase()}`,s:`Ingresos ×${T.k} · crecimiento ${T.g>0?'+':''}${T.g} % · aprobación ${T.ap>0?'+':''}${T.ap}`,can:!busy&&P.nat>0,nat:1,fn:()=>{n.taxL=k;if(real)n.approval+=T.ap;return `Fijas los impuestos en nivel ${T.n.toLowerCase()}.`;}});});
  items.push({sec:'Deuda',t:`Emitir bonos por ${fmtN(n.gdp*.01)}`,s:`Tasa ${pct(bondRate(n)*100)} al año · los mercados no compran si la deuda pasa de 160 % del PIB`,can:!busy&&n.debtR<1.6,fn:()=>issueBonds(n)});
  if(n.bonds>0)items.push({sec:'Deuda',t:`Pagar bonos (${fmtN(Math.min(n.bonds,Math.max(0,n.treas||0)))})`,s:`Debes ${fmtN(n.bonds)} en bonos propios`,can:!busy&&(n.treas||0)>0,fn:()=>repayBonds(n)});
  [['c','civil','+0.25 % de crecimiento por nivel'],['m','militar','+6 % de calidad de tus tropas por nivel']].forEach(([k,nm,d])=>{const c=researchCost(n,k);items.push({sec:'Tecnología',t:`Investigación ${nm}: nivel ${Math.floor(n.tech[k])} → ${Math.floor(n.tech[k])+1}`,s:`${fmtN(c)} · ${d}`,can:!busy&&n.tech[k]<10&&(n.treas||0)>=c,fn:()=>research(n,k)});});
  h+=listHTML(items,'sec')+`<div class="sect">Comercio</div><div class="hint">Tratados: ${trs.join(', ')||'ninguno'} (+${tradeBonus(me).toFixed(2)} % al año)<br>Embargos: ${embs.join(', ')||'ninguno'}${embargoHit(me)?` (−${embargoHit(me).toFixed(2)} % al año)`:''}<br>Firma tratados o impón embargos desde 🤝 Diplomacia.</div>`;
  openSheet(h,b=>b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const it=items[+x.dataset.i];if(!it.can)return;if(it.nat){useNat({t:it.t,vote:1,fn:it.fn});}else{log(it.fn(),'good');save();render();}showEconomy();}));}

/* ----- leyenda del mapa militar ----- */
function setMapMode(k){MMODE=k;document.querySelectorAll('.mmodes button').forEach(b=>b.classList.toggle('on',b.dataset.mm===k));const md=MODES_MAP[k];
  if(k==='mil'){$('mLeg').innerHTML=`<span>${md.n}</span>`+[['#6eaf5a','llano'],['#cdb45a','colinas'],['#8c5f3c','montaña'],['#dec478','desierto'],['#1e6e32','selva'],['#e1ebf5','frío']].map(([c,t])=>`<span class="mlk"><i style="background:${c}"></i>${t}</span>`).join('');$('mLeg').style.display='block';}
  else{$('mLeg').innerHTML=md.lo?`<span>${md.n}</span><div class="lg-bar"></div><div class="lg-lab"><span>${md.lo}</span><span>${md.hi}</span></div>`:'';$('mLeg').style.display=md.lo?'block':'none';}refreshMap();}

/* ----- prueba de velocidad (para la Toshiba) ----- */
function speedTest(){if(!G||!P)return;const snap=JSON.stringify({G:packG(G),P:Object.assign({},P,{_paper:null})});const g0=G,p0=P;let res=null;
  try{G=unpackG(JSON.parse(snap).G);P=JSON.parse(snap).P;invalidate();natTotals();ensureV07();
    if(!G.wars.length){const nb=Object.keys(G.nations).filter(k=>G.nations[k].alive&&neighborsOf(k).length).sort((a,b)=>G.nations[b].gdp-G.nations[a].gdp);const a=nb[0];const b=neighborsOf(a).find(x=>G.nations[x].alive);if(a&&b)declareWar(a,b);}
    syncMando();let t=performance.now();for(let i=0;i<24;i++)monthTick(true);const mMes=(performance.now()-t)/24;G.month=0;
    t=performance.now();for(let i=0;i<5;i++){P.event=null;if(!P.alive)break;ageUp();}const mAno=(performance.now()-t)/5;
    t=performance.now();for(let i=0;i<5;i++)drawOverlay();const mMap=(performance.now()-t)/5;res={mMes,mAno,mMap};}
  catch(e){res={err:e.message};}
  G=g0;P=p0;invalidate();natTotals();refreshMap();news.length=0;return res;}
function showSpeed(){openSheet('<h3>⏱️ Prueba de velocidad</h3><div class="hint">Midiendo… tarda unos segundos.</div>');setTimeout(()=>{const r=speedTest();
  if(!r||r.err){openSheet(`<h3>⏱️ Prueba de velocidad</h3><div class="hint">No se pudo medir: ${r&&r.err}</div>`);return;}
  const v=r.mAno<150?'Fluido: este equipo juega sin problema.':r.mAno<450?'Aceptable: si el mapa se siente lento, cambia a mapa ligero en Más.':'Lento: usa el mapa ligero y evita el avance de 5 años en guerras grandes.';
  openSheet(`<h3>⏱️ Prueba de velocidad</h3><div class="fin">`+[['Un mes de guerra',r.mMes],['Un año completo (con todas las guerras del mundo)',r.mAno],['Dibujar el mapa y los ejércitos',r.mMap]].map(([a,b])=>`<div class="frow"><span>${a}</span><span>${Math.round(b)} ms</span></div>`).join('')+`</div><div class="hint"><b>${v}</b><br>Mapa actual: ${mapMode==='gl'?'detallado (WebGL)':'ligero'}. La prueba corre sobre una copia del mundo: tu partida no cambia.</div>`);},60);}
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');const x=document.createElement('button');x.className='item';x.innerHTML='<span><div class="t">⏱️ Prueba de velocidad</div><div class="s">Mide cuánto tarda este equipo en calcular la guerra y el mapa</div></span>';x.onclick=showSpeed;
  const cfg=b.querySelector('#mCfg');if(cfg)cfg.parentNode.insertBefore(x,cfg);else b.appendChild(x);
  const q=document.createElement('button');q.className='item';q.innerHTML=`<span><div class="t">🎯 Órdenes rápidas: ${CFG.quick?'sí':'no'}</div><div class="s">Con un ejército seleccionado, tocar otra provincia lo manda ahí</div></span>`;q.onclick=()=>{CFG.quick=CFG.quick?0:1;saveCfg();$('nMore').click();};b.insertBefore(q,x);};})();
