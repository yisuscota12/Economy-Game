/* ===== v0.7: interfaz de Mando — ejércitos en el mapa, meses, diplomacia ===== */
const MO={sel:null,ord:null,rep:[]};
const myArmies=()=>{const me=cmdNat();return me?armiesOf(me):[];};
const armyById=id=>G.armies&&G.armies.find(a=>a.id===id);
const kShort=v=>v>=1e6?(v/1e6).toFixed(v>=1e7?0:1)+'M':v>=1000?Math.round(v/1000)+'k':String(Math.round(v));
const pctI=v=>Math.round(v*100)+' %';
const opCol=v=>v>=30?'#47c26b':v>=-10?'#f2c14e':'#f0565d';

/* ----- avanzar: mes durante la guerra, año en paz ----- */
function blockedTurn(){return !P||P.event||G.offer||(G.calls&&G.calls.length);}
function advanceTurn(){if(!P)return;if(!P.alive){showDeath();return;}if(blockedTurn()){render();return;}
  if(mandoActive()){const res=monthTick(false);afterMonth(res);return;}
  ageUp();syncMando();save();sfx(P.event?'bad':'year');render();pulseConquests();}
function afterMonth(res){MO.rep=res.rep.filter(x=>x.big).slice(-4);const war=res.rep.some(x=>x.big&&/Batalla/.test(x.t));
  if(res.yearEnd&&P.alive&&!G.offer){ageUp();syncMando();pulseConquests();}
  if(MO.sel&&!armyById(MO.sel))MO.sel=null;save();sfx(war?'war':'click');render();
  const cap=res.rep.find(x=>x.big&&/capital|capitula|destruido/.test(x.t));if(cap)toast('⚔️ '+MES[(G.month+11)%12],cap.t);}
function autoRest(){if(!P||!P.alive||blockedTurn())return;let n=0;
  while(mandoActive()&&G.month<12&&P.alive&&!G.offer&&!(G.calls&&G.calls.length)&&n<12){const r=monthTick(true);MO.rep=r.rep.filter(x=>x.big).slice(-4);n++;}
  if(P.alive&&!G.offer&&!(G.calls&&G.calls.length)){ageUp();syncMando();}
  save();sfx('year');render();pulseConquests();}
function fastForward(n){if(!P||!P.alive||blockedTurn())return;let last=null;
  for(let i=0;i<n;i++){let k=0;while(mandoActive()&&G.month<12&&P.alive&&!G.offer&&!(G.calls&&G.calls.length)&&k<12){monthTick(true);k++;}
    if(!P.alive||G.offer||(G.calls&&G.calls.length))break;ageUp();syncMando();if(P._paper&&P._paper.imp)last=P._paper;
    if(P.event&&CFG.ff!=='todo'){const e=EV.find(x=>x.id===P.event.id);if(e&&!e.prio&&P.event.id!=='diagnostico'){resolveEvent(Math.floor(Math.random()*P.event.opts.length),'Avance rápido');if(P._dx&&P.alive)setEvent(P,EV.find(x=>x.id==='diagnostico'));}}
    if(!P.alive||P.event)break;}
  P._paper=P.event||!P.alive?null:last;save();sfx('year');render();pulseConquests();}

/* ----- barra de Mando ----- */
function renderCmd(){const box=$('cmdBar');if(!box)return;if(!P||!hasCommand(P)){box.innerHTML='';box.style.display='none';return;}box.style.display='block';
  const me=natOf(P).id,n=natOf(P),wars=warsOf(me).filter(w=>w.mando);const mine=armiesOf(me);ensureMP(n);
  let h=`<div class="cmd-h">${ico('sword',15,'#f2c14e')} <b>Mando</b> · ${P.ruler?careerTitle(P):'General'} · ${mandoActive()?`${MES[G.month%12]} ${G.year}`+' · '+`mes ${G.month+1} de 12`:'en paz'}</div>`;
  if(wars.length)h+=wars.map(w=>{const foe=enemyIn(w,me),s=w.a===me?w.score:-w.score;const fs=soldiersOf(foe);
    return `<div class="cmd-w"><span>vs ${flag(foe,11)} <b>${G.nations[foe].name}</b></span><span class="${s>=0?'pos':'neg'}">frente ${s>0?'+':''}${Math.round(s)}</span>
      <div class="cmd-bar"><i style="width:${clamp(50+s/2,0,100)}%"></i></div>
      <div class="cmd-s">Tus tropas ${fmtK(soldiersOf(me))} · enemigo ${fmtK(fs)} · ocupas ${occBy(me,foe).length} · te ocupan ${occBy(foe,me).length} prov.</div></div>`;}).join('');
  else h+=`<div class="cmd-s">${mine.length} ejército(s) · ${fmtK(soldiersOf(me))} soldados · reserva ${fmtK(n.mp||0)}${P.ruler?` · tesoro ${fmtN(n.treas||0)}`:''}. Las guerras se juegan mes a mes con tus ejércitos.</div>`;
  if(MO.ord){const a=armyById(MO.ord);h+=`<div class="cmd-ord">🎯 Toca en el mapa la provincia destino del ejército de ${a?RG[a.r].nm:''}. <button class="btn" id="cOrdX">Cancelar</button></div>`;}
  if(MO.rep.length&&mandoActive())h+=`<div class="cmd-rep">${MO.rep.map(x=>`<div class="${x.c}">${x.t}</div>`).join('')}</div>`;
  h+=`<div class="mini-actions"><button class="btn" id="cArm">🪖 Ejércitos</button>${P.ruler?`<button class="btn" id="cDip">🤝 Diplomacia <span class="badge2">${P.dip||0}</span></button>`:''}${mandoActive()?`<button class="btn" id="cAuto" ${blockedTurn()?'disabled':''}>⏩ Resto del año (IA)</button>`:''}</div>`;
  box.innerHTML=h;
  box.querySelector('#cArm').onclick=showArmies;if(P.ruler)box.querySelector('#cDip').onclick=showDiplomacy;
  const au=box.querySelector('#cAuto');if(au)au.onclick=autoRest;const ox=box.querySelector('#cOrdX');if(ox)ox.onclick=()=>{MO.ord=null;render();};}

/* ----- ejércitos en el mapa ----- */
function drawArmies(ov,u){if(!G||!G.armies||!G.armies.length)return;const me=cmdNat();const groups={};
  G.armies.forEach(a=>{const k=a.sea?'s'+a.id:a.r;(groups[k]||(groups[k]=[])).push(a);});
  const sel=armyById(MO.sel);
  if(sel&&!sel.sea&&(sel.path.length||sel.nav)){const pts=[sel.r].concat(sel.path).map(r=>RG[r].c);
    if(sel.path.length)el('polyline',{points:pts.map(c=>c.join(',')).join(' '),fill:'none',stroke:'#f2c14e','stroke-width':2.2*u,'stroke-dasharray':`${5*u} ${3*u}`,'stroke-linecap':'round'},ov);
    if(sel.nav){const c0=RG[sel.r].c,c1=RG[sel.nav.to].c;el('line',{x1:c0[0],y1:c0[1],x2:c1[0],y2:c1[1],stroke:'#7cc4ff','stroke-width':2*u,'stroke-dasharray':`${2*u} ${4*u}`},ov);}
    const d=sel.nav?RG[sel.nav.to].c:pts[pts.length-1];el('circle',{cx:d[0],cy:d[1],r:5*u,fill:'none',stroke:'#f2c14e','stroke-width':2*u},ov);}
  // asedios en curso
  for(const r in (G.sg||{})){const c=RG[r]&&RG[r].c;if(!c)continue;el('circle',{cx:c[0],cy:c[1],r:9*u,fill:'none',stroke:'#ff8a5c','stroke-width':1.6*u,'stroke-dasharray':`${3*u} ${2*u}`},ov);}
  for(const k in groups){const L=groups[k];L.forEach((a,i)=>{let c=RG[a.r].c;
      if(a.sea){const t=a.sea.t||a.sea.eta+1,f=clamp(1-a.sea.eta/t,0,1),c1=RG[a.sea.to].c;c=[c[0]+(c1[0]-c[0])*f,c[1]+(c1[1]-c[1])*f];}
      const w=32*u,h=13*u,x=c[0]-w/2,y=c[1]-h*1.6-i*h*1.25;const mineA=a.o===me,host=me&&hostile(me,a.o),isSel=a.id===MO.sel;
      const col=rgbOf(G.nations[a.o].color).map(v=>Math.round(v*.55));
      el('rect',{x,y,width:w,height:h,rx:3*u,fill:`rgb(${col})`,stroke:isSel?'#fff':mineA?'#f2c14e':host?'#ff5050':'#0b1118','stroke-width':(isSel?2.4:1.3)*u},ov);
      el('rect',{x:x+1.5*u,y:y+h-2.4*u,width:(w-3*u)*clamp(a.m,0,1),height:1.6*u,fill:a.m>.6?'#47c26b':a.m>.3?'#f2c14e':'#f0565d'},ov);
      const t=el('text',{x:c[0],y:y+h*.68,'text-anchor':'middle','font-size':8.6*u,'font-weight':700,fill:'#fff'},ov);
      t.textContent=(a.sea?'⛵':a.train>0?'⏳':P&&P.lead===a.id?'★':'')+kShort(a.n);});}}
/* ----- tocar el mapa: órdenes y selección ----- */
function onMapPick(id){if(MO.ord){const a=armyById(MO.ord);MO.ord=null;if(a){const r=orderMove(a,id);MO.rep=[{t:r,c:/No hay|Sin ruta|Solo/.test(r)?'bad':'good'}];MO.sel=a.id;}G.sel=id;save();render();return true;}
  const mine=myArmies().filter(a=>a.r===id&&!a.sea);if(mine.length){const i=mine.findIndex(a=>a.id===MO.sel);MO.sel=G.sel===id&&i>=0?mine[(i+1)%mine.length].id:mine[0].id;}
  return false;}

/* ----- panel de la provincia: ejércitos y relaciones ----- */
function armyLine(a,me){const st=a.sea?`⛵ en el mar, llega a ${RG[a.sea.to].nm} en ${a.sea.eta} mes(es)`:a.nav?`embarcará hacia ${RG[a.nav.to].nm}`:a.train>0?`⏳ entrenando (${a.train} mes(es))`:a.path.length?`en marcha a ${RG[a.path[a.path.length-1]].nm} (${a.path.length} prov.)`:G.sg[a.r]&&G.sg[a.r].by===a.o?'asediando':'en posición';
  const g=genOf(a);return `${flag(a.o,11)} <b>${fmtK(a.n)}</b> soldados · moral ${pctI(a.m)} · abasto ${pctI(a.s)} · calidad ${a.q.toFixed(2)}${a.o===me&&a.auto?' · 🤖 automático':''}<br><span class="src">${g.me?'★ Lo comandas tú':'Gral. '+g.n} · ${TRAITS[g.t].n} (${TRAITS[g.t].d})${g.lv>1?' · nivel '+g.lv:''}<br>${st}</span>`;}
function armySelHTML(rid){if(!G.armies||!RG[rid])return '';const me=cmdNat();const here=G.armies.filter(a=>a.r===rid&&!a.sea&&armyVisible(a));let h=`<div class="mem">⛰️ Terreno: ${terrName(rid)} · defensa ×${terrDef(rid).toFixed(2)}${TRN(rid)[0]?'':''}</div>`;
  const oc=G.occ&&G.occ[rid];if(oc)h+=`<div class="mem">⚑ Ocupada por <b>${G.nations[oc].name}</b>${oc!==G.regions[rid].o?' · se decide en la conferencia de paz':''}</div>`;
  const sg=G.sg&&G.sg[rid];if(sg){const ba=G.armies.find(a=>a.r===rid&&a.o===sg.by);const need=ba?siegeNeed(rid,ba):1;h+=`<div class="mem">🔥 Asedio de ${G.nations[sg.by].name}: ${sg.t} de ~${need} mes(es)</div>`;}
  if(!here.length)return h;
  const myHere=here.filter(a=>a.o===me),foeHere=here.filter(a=>me&&hostile(me,a.o));
  h+=`<div class="sect" style="position:static">Ejércitos aquí</div>`;
  here.forEach(a=>{const mine=a.o===me,isSel=a.id===MO.sel;h+=`<div class="army ${mine?'mine':''} ${isSel?'on':''}">${armyLine(a,me)}`;
    if(mine&&hasCommand(P)&&!blockedTurn()){h+=`<div class="mini-actions"><button class="btn gold" data-ar="mv" data-id="${a.id}">🎯 ${mandoActive()?'Mover':'Reubicar'}</button>`+
      (mandoActive()?`<button class="btn" data-ar="auto" data-id="${a.id}">${a.auto?'🤖 Auto: sí':'🤖 Auto: no'}</button>`:'')+
      `<button class="btn" data-ar="split" data-id="${a.id}" ${a.n<4000?'disabled':''}>✂️ Dividir</button>`+(myHere.length>1?`<button class="btn" data-ar="merge" data-id="${a.id}">🔗 Unir aquí</button>`:'')+
      (P.ruler?`<button class="btn red" data-ar="dis" data-id="${a.id}">Disolver</button>`:'')+(typeof armyExtraBtns==='function'?armyExtraBtns(a):'')+`</div>`;}
    h+=`</div>`;});
  if(myHere.length&&foeHere.length){const ms=myHere.reduce((s,a)=>s+armyStr(a),0),fs=foeHere.reduce((s,a)=>s+armyStr(a),0);h+=`<div class="hint">Fuerza relativa aquí: tú ${pctI(ms/(ms+fs))}</div>`;}
  return h;}
function natSelHTML(nat){if(!P||!P.alive)return '';const me=natOf(P).id;let h='';const ov=overlordOf(nat.id);
  if(ov)h+=`<div class="mem">👑 Vasallo de ${G.nations[ov].name}</div>`;
  if(!P.ruler||nat.id===me||!nat.alive)return h;const o=opOf(nat.id);
  h+=`<div class="mem">Opinión hacia ti: <b style="color:${opCol(o)}">${Math.round(o)}</b> ${relChips(nat.id)}</div><div class="mini-actions">`;
  const w=warBetween(me,nat.id),dis=P.nat<=0||blockedTurn()?'disabled':'';
  if(!w&&canDeclare(nat.id))h+=`<button class="btn red" data-na="war" ${dis}>Declarar guerra</button>`;
  if(w)h+=`<button class="btn" data-na="peace" ${dis}>Proponer paz</button>`;
  h+=`<button class="btn" data-na="dip">🤝 Diplomacia</button></div>`;return h;}
function relChips(t){const me=natOf(P).id,n=natOf(P);const c=[];if(n.allies.includes(t))c.push('aliado');const nap=napOf(me,t);if(nap)c.push('no agresión hasta '+nap);
  if(accessOK(me,t))c.push('te da acceso');if(guarBy(me,t))c.push('garantizado');if(overlordOf(t)===me)c.push('tu vasallo');if(G.dip&&G.dip.cb[t]>=G.year)c.push('motivo de guerra');if(warBetween(me,t))c.push('en guerra');
  return c.map(x=>`<span class="pill${x==='en guerra'?' war':''}">${x}</span>`).join(' ');}
function bindSelV7(box,nat){box.querySelectorAll('[data-na]').forEach(b=>b.onclick=()=>{const t=nat.id,k=b.dataset.na;if(k==='war'){doDeclare(t);sfx('war');}else if(k==='peace')doPeace(t);else showNationDip(t);});
  box.querySelectorAll('[data-ar]').forEach(b=>b.onclick=()=>{const a=armyById(+b.dataset.id);if(!a)return;const k=b.dataset.ar;MO.sel=a.id;
    if(k==='mv'){MO.ord=a.id;render();return;}
    if(k==='auto'){a.auto=!a.auto;a.man=a.auto?0:1;if(a.auto){a.path=[];a.nav=null;}}
    if(k==='split'){const nb=splitArmy(a);if(nb)MO.rep=[{t:`Divides el ejército: dos de ${fmtK(a.n)}.`,c:'good'}];}
    if(k==='merge'){const m=mergeAt(a.r,a.o);if(m){MO.sel=m.id;MO.rep=[{t:`Unes tus tropas en ${RG[a.r].nm}: ${fmtK(m.n)} soldados.`,c:'good'}];}}
    if(k==='dis'){log(disband(a));MO.sel=null;}
    save();render();});}

/* ----- hoja de ejércitos y reclutamiento ----- */
function showArmiesV(){if(!P||!hasCommand(P))return;const me=natOf(P).id,n=natOf(P);ensureMP(n);const L=armiesOf(me).slice().sort((a,b)=>b.n-a.n);
  let h=`<h3>${flag(me,16)} Ejércitos de ${n.name}</h3><div class="hint">${fmtK(soldiersOf(me))} soldados en ${L.length} ejército(s) · reserva de reclutas ${fmtK(n.mp)} (población movilizable) · calidad ${qualOf(me).toFixed(2)} (gasto por soldado ${fmtN(perSoldier(me))}/año, SIPRI)`+
    (P.ruler?`<br>Tesoro ${fmtN(n.treas||0)} · costo de tropas extra ${fmtN(upkeepOf(me))}/año`:'<br>Como General mueves las tropas; reclutar y disolver lo decide el gobierno.')+`</div>`;
  h+=`<div class="sect">Tus ejércitos</div>`+L.map((a,i)=>`<button class="item" data-i="${i}"><span><div class="t">${RG[a.sea?a.sea.to:a.r].nm}${a.sea?' (en el mar)':''}${P.lead===a.id?' ★':''}</div><div class="s">${fmtK(a.n)} · moral ${pctI(a.m)} · abasto ${pctI(a.s)}${a.auto?' · 🤖':''}${a.path.length?' · en marcha':''}${a.train>0?' · entrenando':''}</div></span></button>`).join('');
  if(mandoActive()&&L.length)h+=`<div class="mini-actions" style="margin:8px 0"><button class="btn" id="aAllOn">🤖 Todos en automático</button><button class="btn" id="aAllOff">✋ Todos manuales</button></div>`;
  let rec=[];if(P.ruler){let rid=G.sel&&G.regions[G.sel]&&G.regions[G.sel].o===me&&ctrlOf(G.sel)===me?G.sel:capitalOf(me);rec=recruitOpts(rid);
    h+=`<div class="sect">Reclutar en ${RG[rid].nm}</div><div class="hint">Para reclutar en otra provincia, tócala en el mapa antes de abrir esta hoja. Los reclutas entrenan ${isReal()?2:1} mes(es) y empiezan con moral baja.</div>`+
      rec.map((o,i)=>`<button class="item" data-r="${i}" ${o.ok&&!blockedTurn()?'':'disabled'}><span><div class="t">Reclutar ${fmtK(o.s)} soldados</div><div class="s">${fmtN(o.cost)} del tesoro · reserva ${fmtK(n.mp)}</div></span></button>`).join('');rec.rid=rid;}
  openSheet(h,b=>{b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const a=L[+x.dataset.i];MO.sel=a.id;G.sel=a.sea?a.sea.to:a.r;centerOn(G.sel,Math.min(vb.w,900),1);closeSheet();render();});
    b.querySelectorAll('.item[data-r]').forEach(x=>x.onclick=()=>{const o=rec[+x.dataset.r];log(recruit(rec.rid,o.s,o.cost),'good');sfx('coin');save();render();showArmies();});
    const on=b.querySelector('#aAllOn'),off=b.querySelector('#aAllOff');if(on)on.onclick=()=>{L.forEach(a=>{a.auto=true;a.man=0;a.path=[];a.nav=null;});save();render();showArmies();};if(off)off.onclick=()=>{L.forEach(a=>{a.auto=false;a.man=1;});save();render();showArmies();};});}

/* ----- diplomacia ----- */
function showDiplomacyV(){if(!P||!P.ruler)return;ensureV07();const me=natOf(P).id,n=natOf(P);
  const rel=[];n.allies.forEach(t=>rel.push([t,'Aliado']));Object.keys(G.dip.nap).forEach(k=>{const [a,b]=k.split('|');if((a===me||b===me)&&G.dip.nap[k]>G.year)rel.push([a===me?b:a,'No agresión hasta '+G.dip.nap[k]]);});
  Object.keys(G.dip.acc).forEach(k=>{const [g,to]=k.split('>');if(to===me)rel.push([g,'Te da acceso militar']);});Object.keys(G.dip.guar).forEach(k=>{const [g,t]=k.split('>');if(g===me)rel.push([t,'Garantizas su independencia']);});
  vassalsOf(me).forEach(t=>rel.push([t,`Tu vasallo (tributo ${fmtN(treasuryIncome(G.nations[t])*.25)}/año)`]));
  const seen=new Set();const list=[];const push=t=>{if(t===me||seen.has(t)||!G.nations[t]||!G.nations[t].alive)return;seen.add(t);list.push(t);};
  warsOf(me).forEach(w=>push(enemyIn(w,me)));rel.forEach(([t])=>push(t));neighborsOf(me).forEach(push);
  Object.values(G.nations).filter(x=>x.alive&&seaNeighbor(me,x.id)).forEach(x=>push(x.id));
  Object.values(G.nations).filter(x=>x.alive).sort((a,b)=>power(b.id)-power(a.id)).slice(0,12).forEach(x=>push(x.id));
  let h=`<h3>🤝 Diplomacia</h3><div class="hint"><span>Te quedan ${P.dip||0} de 3 acciones diplomáticas este año.</span> <span>La opinión de cada país sube con embajadas y tratados y baja con ultimátums y guerras.</span></div>`;
  if(rel.length)h+=`<div class="sect">Tratados vigentes</div>`+rel.map(([t,s])=>`<div class="item"><span><div class="t">${flag(t,12)} ${G.nations[t].name}</div><div class="s">${s}</div></span></div>`).join('');
  h+=`<div class="sect">Países</div>`+list.map((t,i)=>{const o=opOf(t);return `<button class="item" data-i="${i}"><span><div class="t">${flag(t,12)} ${G.nations[t].name}</div><div class="s">Opinión <b style="color:${opCol(o)}">${Math.round(o)}</b> · poder ${pctI(power(t)/Math.max(1,power(me)))} del tuyo ${relChips(t)}</div></span></button>`;}).join('');
  openSheet(h,b=>b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>showNationDip(list[+x.dataset.i])));}
function showNationDipV(t){if(!P)return;const me=natOf(P).id,T=G.nations[t];if(!T)return;const items=P.ruler?dipActions(t):[];const o=P.ruler?opOf(t):0;
  const w=warBetween(me,t);const extra=[];
  if(P.ruler&&!w&&canDeclare(t)){const pen=warPenalty(t);extra.push({t:'Declarar guerra',s:pen.nap?'⚠️ Rompe el pacto de no agresión: −10 estabilidad y todos desconfían':pen.cb?'Tienes motivo de guerra: no pierdes estabilidad':'−5 estabilidad · usa una acción de gobierno',can:P.nat>0&&!blockedTurn(),fn:()=>{closeSheet();doDeclare(t);sfx('war');}});}
  if(P.ruler&&w)extra.push({t:'Proponer paz',s:'Usa una acción de gobierno',can:P.nat>0&&!blockedTurn(),fn:()=>{closeSheet();doPeace(t);}});
  const all=items.concat(extra);
  let h=`<h3>${flag(t,18)} ${T.name}</h3><div class="hint">${natFacts(T,true)}${P.ruler?`<br>Opinión hacia ti: <b style="color:${opCol(o)}">${Math.round(o)}</b> · su poder es ${pctI(power(t)/Math.max(1,power(me)))} del tuyo<br>${relChips(t)}`:''}</div>`;
  h+=P.ruler?`<div class="sect">Acciones (${P.dip||0} diplomáticas, ${P.nat} de gobierno)</div>`+listHTML(all):'<div class="hint">Solo quien gobierna hace diplomacia.</div>';
  openSheet(h,b=>b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const it=all[+x.dataset.i];if(!it.can)return;
    if(it.k){P.dip--;const r=it.fn();log(r,/rechaza|no quiere|niega/.test(r)?'bad':'good');flushNews();save();render();showNationDip(t);}else it.fn();}));}

/* ----- guerra y paz con Mando ----- */
function doDeclare(t){const pen=warPenalty(t),me=natOf(P).id;
  const go=()=>useNat({fn:()=>{const n=natOf(P);declareWar(me,t);if(!pen.cb){const k=typeof warPenOf==='function'?warPenOf(n):1;n.stab-=5*k;if(isReal())n.approval-=4*k;}else delete G.dip.cb[t];
    if(pen.nap){delete G.dip.nap[pk(me,t)];n.stab-=10;if(isReal())n.approval-=6;Object.keys(G.nations).forEach(x=>{if(x!==me&&G.nations[x].alive)addOp(x,-12);});log(`Rompes el pacto de no agresión con ${G.nations[t].name}. El mundo desconfía de tu palabra.`,'bad');}
    else Object.keys(G.nations).forEach(x=>{if(x!==me&&x!==t&&G.nations[x].alive&&neighborsOf(x).includes(t))addOp(x,-4);});
    syncMando();return `Declaras la guerra a ${G.nations[t].name}. Empieza el Mando: cada turno es un mes.`;}});
  if(pen.nap){showModal(`<h2>Pacto de no agresión</h2><p>Tienes un pacto con ${G.nations[t].name} hasta ${pen.nap}. Romperlo cuesta 10 de estabilidad${isReal()?' y 6 de aprobación':''}, y todos los países confiarán menos en ti.</p><button class="opt" id="nY">Romper el pacto y declarar la guerra</button><button class="opt" id="nN">Cancelar</button>`,
    m=>{m.querySelector('#nY').onclick=()=>{hideModal();go();};m.querySelector('#nN').onclick=()=>{hideModal();render();};});return;}
  go();}
function doPeace(t){useNat({fn:()=>{const me=natOf(P).id,w=warBetween(me,t);if(!w)return null;const T=G.nations[t];const s=w.a===me?w.score:-w.score;const c=clamp(.3+s/200+.1*w.years,.05,.95);
  if(!chance(c))return `${T.name} rechaza la paz.`;
  if(s>=-20&&regionsOf(t).length){setTimeout(()=>conference(w,t),0);return `${T.name} acepta negociar la paz.`;}
  const rs=w.mando?occBy(t,me):[];if(rs.length){G.offer={kind:'demand',foe:t,rs,war:pk(w.a,w.b)};return `${T.name} acepta la paz si le cedes las ${rs.length} provincia(s) que ocupa.`;}
  makePeace(w);natOf(P).stab+=3;return `${T.name} acepta la paz. No obtienes territorio.`;}});}
// Conferencia de paz: las provincias que ocupas se pueden reclamar sin importar dónde estén
function conference(w,foe,capit){const me=natOf(P).id;const occ=w.mando?occBy(me,foe):[];const s=w.a===me?w.score:-w.score;
  const budget=capit?999:Math.max(peaceBudget(w,me),occ.length);const chosen=[];let vas=false;const canVas=capit||s>=60;
  const draw=()=>{const occL=occ.filter(r=>!chosen.includes(r)&&G.regions[r].o===foe);const adj=claimable(me,foe,chosen).filter(r=>!occ.includes(r)).sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,30);const opts=occL.concat(adj);
    const full=chosen.length>=budget;
    openSheet(`<h3>Conferencia de paz con ${flag(foe,16)} ${G.nations[foe].name}</h3><div class="hint">${capit?'<b>El enemigo capituló:</b> puedes tomar todo lo que ocupas y más.':`Puedes reclamar ${budget} provincia(s); llevas ${chosen.length}.`} Las provincias que ocupas (⚑) se reclaman sin importar dónde estén; las demás deben tocar tu territorio. La capital enemiga cuesta estabilidad.</div>`+
     (chosen.length?`<div class="sect">Elegidas</div>`+chosen.map(r=>`<div class="item"><span><div class="t">✓ ${RG[r].nm}</div><div class="s">${fmtPop(G.regions[r].pop)} hab.</div></span></div>`).join(''):'')+
     (vas?`<div class="hint">👑 ${G.nations[foe].name} será tu vasallo.</div>`:'')+
     `<button class="btn gold" id="cfOk" style="width:100%;margin:6px 0">Firmar la paz${chosen.length?' y anexar '+chosen.length:''}${vas?' + vasallaje':''}</button>`+
     (occL.length>1&&!full?`<button class="btn" id="cfAll" style="width:100%;margin:0 0 6px">Tomar todas las ocupadas (${Math.min(occL.length,budget-chosen.length)})</button>`:'')+
     (canVas&&!vas?`<button class="btn" id="cfVas" style="width:100%;margin:0 0 10px">👑 Convertirlo en vasallo</button>`:'')+
     `<div class="sect">Provincias disponibles</div>`+opts.map((r,i)=>`<button class="item" data-i="${i}" ${full?'disabled':''}><span><div class="t">${occ.includes(r)?'⚑ ':''}${RG[r].nm}${RG[r].cap&&RG[r].n===foe?' ★ capital':''}</div><div class="s">${fmtPop(G.regions[r].pop)} hab. · PIB ${fmtN(G.regions[r].gdp)}</div></span></button>`).join(''),
     b=>{b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const r=opts[+x.dataset.i];chosen.push(r);G.sel=r;centerOn(r,Math.min(vb.w,1400));draw();});
      const all=b.querySelector('#cfAll');if(all)all.onclick=()=>{occL.slice(0,budget-chosen.length).forEach(r=>chosen.push(r));draw();};
      const vb_=b.querySelector('#cfVas');if(vb_)vb_.onclick=()=>{vas=true;draw();};
      b.querySelector('#cfOk').onclick=()=>{const L=G.nations[foe];chosen.forEach(r=>{if(RG[r].cap&&r===capitalOf(foe))L.stab-=10;transfer(r,me);});checkGone(foe);
        if(vas&&L.alive)makeVassal(foe,me);if(G.wars.includes(w))makePeace(w,true);
        log((chosen.length?`Firmas la paz con ${L.name} y anexas ${chosen.length} provincia(s): ${chosen.map(r=>RG[r].nm).join(', ')}.`:`Firmas la paz con ${L.name} sin anexar territorio.`)+(vas&&L.alive?` ${L.name} queda como tu vasallo.`:''),'big');
        natOf(P).stab+=chosen.length?2:4;addOp(foe,-10);flushNews();syncMando();save();closeSheet();render();};});};
  draw();}

/* ----- avisos: ofertas de paz, capitulación, garantías ----- */
function showMandoPrompt(){if(!G.offer&&!(G.calls&&G.calls.length)&&!G.mhelp){showMandoHelp();return;}if(G.calls&&G.calls.length){const c=G.calls[0];const A=G.nations[c.ally],F=G.nations[c.foe];
    showModal(`<div class="evh"><span class="evi" style="color:#f0565d;border-color:#f0565d">${ico('sword',26)}</span><h2>Llamado a las armas</h2></div><p class="evt">${F.name} atacó a ${A.name}, ${c.kind==='vas'?'tu vasallo':c.kind==='ally'?'tu aliado':'a quien garantizaste su independencia'}. ¿Entras a la guerra?</p><button class="opt" id="gY">Defender a ${A.name}</button><button class="opt" id="gN">No intervenir (−5 estabilidad, todos desconfían)</button>`,
      m=>{m.querySelector('#gY').onclick=()=>{log(answerCall(0,true),'big');save();hideModal();render();};m.querySelector('#gN').onclick=()=>{log(answerCall(0,false),'bad');save();hideModal();render();};});return;}
  const o=G.offer;if(!o)return;o.rs=o.rs||[];const F=G.nations[o.foe];if(!F){G.offer=null;return;}const names=o.rs.slice(0,8).map(r=>RG[r].nm).join(', ')+(o.rs.length>8?'…':'');
  if(o.kind==='capit'){showModal(`<div class="evh"><span class="evi" style="color:#f2c14e;border-color:#f2c14e">${ico('crown',26)}</span><h2>${F.name} capitula</h2></div><p class="evt">Su gobierno se rinde. Tú decides las condiciones de la paz.</p><button class="opt" id="oC">Abrir la conferencia de paz</button>`,
    m=>m.querySelector('#oC').onclick=()=>{const w=warByKey(o.war);G.offer=null;hideModal();if(w)conference(w,o.foe,true);else render();});return;}
  const txt=o.kind==='cede'?`${F.name} ofrece la paz y te cede las ${o.rs.length} provincia(s) que ocupas: ${names}.`:o.kind==='demand'?`${F.name} exige las ${o.rs.length} provincia(s) que ocupa a cambio de la paz: ${names}.`:`${F.name} propone una paz blanca: cada quien conserva su territorio y las ocupaciones se devuelven.`;
  showModal(`<div class="evh"><span class="evi" style="color:#5aa2f0;border-color:#5aa2f0">${ico('globe',26)}</span><h2>Propuesta de paz</h2></div><p class="evt">${txt}</p><button class="opt" id="oY">Aceptar</button><button class="opt" id="oN">Seguir la guerra</button>`,
    m=>{m.querySelector('#oY').onclick=()=>{log(acceptOffer(),'big');syncMando();save();hideModal();render();pulseConquests();};m.querySelector('#oN').onclick=()=>{log(rejectOffer());save();hideModal();render();};});}

/* ----- primera vez en Mando ----- */
function showMandoHelp(){showModal(`<div class="evh"><span class="evi" style="color:#f2c14e;border-color:#f2c14e">${ico('sword',26)}</span><h2>Capa Mando</h2></div>
  <p class="evt">Mientras dure la guerra, cada turno es <b>un mes</b>.</p>
  <div class="fin stack"><div class="frow"><span>🪖 Tus ejércitos</span><span>Toca una provincia con tus tropas para verlas; 🎯 Mover y luego toca el destino. Por mar viajan solos si la ruta es costera.</span></div>
  <div class="frow"><span>🤖 Automático</span><span>Los ejércitos sin órdenes pelean solos. Al darle una orden a uno, pasa a tu control.</span></div>
  <div class="frow"><span>⚑ Ocupación</span><span>Entra a una provincia enemiga y asédiala; la guarnición local y las fortalezas la hacen más lenta.</span></div>
  <div class="frow"><span>⚖️ Moral y abasto</span><span>Lejos de tu territorio el abasto baja y el desgaste sube; la estabilidad del país limita la moral.</span></div>
  <div class="frow"><span>🕊️ Paz</span><span>Lo que ocupas se reclama en la conferencia de paz. Si el enemigo pierde todo o su capital, capitula.</span></div></div>
  <button class="opt" id="mhOk">Entendido</button>`,m=>m.querySelector('#mhOk').onclick=()=>{G.mhelp=1;save();hideModal();render();});}
