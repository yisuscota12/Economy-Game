/* ===== UI ===== */
const $=id=>document.getElementById(id);
const SAVE_KEY='imperioVida_v3';
let lastR=null;
let saveT=0;function saveNow(){clearTimeout(saveT);saveT=0;try{const pl=Object.assign({},P);delete pl._paper;localStorage.setItem(SAVE_KEY,JSON.stringify({G:packG(G),P:pl}));}catch(e){}}
function save(){if(!saveT)saveT=setTimeout(saveNow,600);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&saveT)saveNow();});window.addEventListener('pagehide',()=>{if(saveT)saveNow();});
function load(){try{const s=localStorage.getItem(SAVE_KEY);if(!s)return false;const d=JSON.parse(s);if(!d||!d.G||!d.P||d.G.ver!==3)return false;G=unpackG(d.G);P=d.P;invalidate();migrateP(P);natTotals();return true;}catch(e){return false;}}
/* ----- panel de selección ----- */
function natFacts(n,short){
  const d=N0[n.id],real=G&&isReal();const war=warsOf(n.id).map(w=>G.nations[enemyIn(w,n.id)].name);
  let h=`${n.gov==='dictadura'?'Dictadura':'República'} · gobierna ${n.leader}<br>`+
   `Población ${fmtPop(n.pop)} · PIB ${fmtN(n.gdp)} · por persona ${fmtN(gdppc(n))}<br>`+
   (`Crecimiento ${pct(n.g)}`+(real?` · Inflación ${pct(n.infl)}`:'')+` · Estabilidad ${Math.round(n.stab)} · Ejército ${Math.round(n.army)}`);
  if(!short)h+=`<br>Desempleo ${pct(d.unemp)} · Esperanza de vida ${d.le} años · Gasto militar inicial ${fmtN(d.milx)}${d.est?' <span class="pill">estimado</span>':''}`;
  if(war.length)h+=`<br><span class="pill war">En guerra con ${war.join(', ')}</span>`;
  if(n.allies.length)h+=`<br>Aliados: ${n.allies.map(a=>G.nations[a].name).join(', ')}`;
  return h;
}
function renderSel(){
  const box=$('selInfo');if(!G.sel||!RG[G.sel]){box.innerHTML='Toca una provincia del mapa para ver sus datos. Arrastra para moverte; pellizca o usa +/− para acercar; ⛶ abre el mapa en pantalla completa.';return;}
  const rd=RG[G.sel],r=G.regions[G.sel],nat=G.nations[r.o];
  const bi=bldIcons(G.sel),myInv=P?P.inv.filter(v=>v.r===G.sel):[];
  let h=`${flag(nat.id,13)} <b>${rd.nm}</b> · ${r.o!==r.w0?`territorio de <b>${nat.name}</b> (antes ${N0[r.w0].nm})`:`<b>${nat.name}</b>`}`+(bi?`<div class="mem">Edificios: ${bi}</div>`:'')+(myInv.length||P&&P.biz&&P.biz.r===G.sel?`<div class="mem">Tus intereses aquí: ${myInv.map(v=>INV[v.t].n+' '+fmt(v.val)).join(', ')}${P.biz&&P.biz.r===G.sel?' · tu '+BIZT[P.biz.t].n.toLowerCase():''}</div>`:'')+
   (rd.mem.length>1?`<div class="mem">Une: ${rd.mem.join(', ')}${rd.mem.length>=12?'…':''}</div>`:'')+
   `<div class="mem">Provincia: ${fmtPop(r.pop)} hab.${rd.wp>0?'':' (est.)'} · PIB ${fmtN(r.gdp)} (est.) · ${rd.area.toLocaleString('es-MX')} km²</div>`+natFacts(nat,true);
  h+=provActionsHTML(G.sel);
  h+=(typeof provNatHTML==='function'?provNatHTML(G.sel):'')+natSelHTML(nat)+armySelHTML(G.sel);
  box.innerHTML=h;
  bindSel(box,nat);
  box.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>provAction(G.sel,b.dataset.pa));
}
const STAT_UI=[['salud','Salud','#47c26b'],['felicidad','Felicidad','#f2c14e'],['inteligencia','Inteligencia','#5aa2f0'],['apariencia','Apariencia','#e07ad8'],['influencia','Influencia','#f08a4b']];
const LG={ref:null,n:0};
function renderLog(p){const lg=$('log');const L=p.log;const ref=L.length?L[0]:null;const row=x=>`<div class="lg ${x.c==='age'?'age':x.c}">${x.t}</div>`;
  if(LG.ref!==ref||L.length<LG.n||L.length-LG.n>120){lg.innerHTML=L.slice(-120).map(row).join('');}
  else if(L.length>LG.n){lg.insertAdjacentHTML('beforeend',L.slice(LG.n).map(x=>row(x).replace('class="lg','class="lg new')).join(''));while(lg.childElementCount>160)lg.firstElementChild.remove();}
  LG.ref=ref;LG.n=L.length;lg.scrollTop=lg.scrollHeight;}
function tweenMoney(el,v){const from=el._v==null?v:el._v;el._v=v;if(el._raf)cancelAnimationFrame(el._raf);if(Math.abs(v-from)<1){el.textContent=fmt(v);return;}const t0=performance.now();
  const go=t=>{const e=Math.min(1,(t-t0)/600),k=1-Math.pow(1-e,3);el.textContent=fmt(from+(v-from)*k);if(e<1)el._raf=requestAnimationFrame(go);};el._raf=requestAnimationFrame(go);}
function render(){
  if(!P)return;syncMando();const p=P,n=natOf(p),real=isReal();
  if(lastR&&lastR!==p.r)centerOn(p.r,Math.min(vb.w,1400),1);lastR=p.r;
  const fk=[p.first,p.age,Math.round(p.s.felicidad/10),p.ruler,p.alive,outfitOf(p)].join('|');if($('pAv')._k!==fk){$('pAv')._k=fk;$('pAv').innerHTML=face(p,54,{mood:p.s.felicidad,crown:p.ruler,dead:!p.alive});}$('pName').textContent=fullName(p)+(p.gen>1?` · Gen. ${p.gen}`:'');
  $('pSub').innerHTML=`${p.age} ${p.age===1?'año':'años'} · ${flag(n.id,11)} ${RG[p.r].nm}, ${n.name}${atWar(p)?' · <span class="neg">en guerra</span>':''}${p.amb?` · ⭐ ${AMB[p.amb].n}${p.ambOk?' ✓':''}`:''}`;
  const tc=$('pTitle');tc.textContent=careerTitle(p);tc.className='title-chip'+(p.ruler?' ruler':'');
  $('pMode').textContent='Modo '+MODES[G.mode];
  const mv=$('pMoney');tweenMoney(mv,p.dinero);mv.className='v'+(p.dinero<0?' neg':'');
  const yr=$('pYear');if(yr._y!==G.year){if(yr._y)yr.classList.remove('flash'),void yr.offsetWidth,yr.classList.add('flash');yr._y=G.year;}yr.textContent=typeof dateStr==='function'?dateStr():'Año '+G.year;
  const net=netIncome(p),T=U(p);
  let st=STAT_UI.map(([k,l,c])=>`<div class="stat"><div class="lab"><span>${ico(STAT_IC[k],13,c)} ${l}</span><span>${p.s[k]}</span></div><div class="bar"><i style="width:${p.s[k]}%;background:${c}"></i></div></div>`).join('')+
    `<div class="stat"><div class="lab"><span>Ingreso neto/año</span><span>${fmt(net)}</span></div><div class="bar"><i style="width:${clamp(net/T*50,0,100)}%;background:#3fb6a8"></i></div></div>`;
  if(real){const debt=p.debts.reduce((s,d)=>s+d.bal,0);st+=`<div class="stat wide"><div class="lab"><span>Patrimonio neto ${p.house?'(con casa)':''}</span><span>${fmt(netWorth(p))}</span></div><div class="lab"><span>Deudas</span><span class="${debt?'neg':''}">${fmt(debt)}</span></div>${p.cond.length?`<div class="lab"><span>Salud crónica</span><span>${p.cond.map(c=>COND[c.k].n+(c.t?'':' (sin tratar)')).join(', ')}</span></div>`:''}${p.ruler?`<div class="lab"><span>Aprobación / Congreso</span><span>${Math.round(n.approval)} % / ${Math.round(n.congress)} %</span></div>`:''}</div>`;}
  $('stats').innerHTML=st;
  renderLog(p);
  $('actBadge').textContent=typeof FTY==='function'?Math.floor(p.ft||0)+'d':p.actions;
  const ab=$('ageBtn');ab.disabled=!!p.event||!p.alive;ab.textContent=p.alive?(mandoActive()?'+1 MES':'+1 AÑO'):'FIN';ab.disabled=ab.disabled||!!(G.offer||G.calls&&G.calls.length);
  const nk=p.ruler?'crown':'col';if($('nNat')._k!==nk){$('nNat')._k=nk;$('nNat').querySelector('.ic').innerHTML=ico(nk,22);}
  const sg=stageOf(p);if($('stageBg')._s!==sg){$('stageBg')._s=sg;$('stageBg').innerHTML=stageArt(sg);}
  refreshMap();renderSel();renderCmd();if(typeof renderView==='function')renderView();
  $('ffBtn').disabled=!!p.event||!p.alive;
  if(paperDue())showPaper();else if(p.event)showEvent();else if(p.dlg&&p.alive&&typeof showDialog==='function')showDialog();else if(p.alive&&(G.offer||(G.calls&&G.calls.length)||(mandoActive()&&!G.mhelp)))showMandoPrompt();else if(!p.alive)showDeath();else hideModal();
}

/* ----- acciones ----- */
function useAct(fn,t){if(P.event||!P.alive)return;let dim=1,s0=null;if(typeof actCost==='function'){const c=actCost(t);if(!canAfford(t)){toast('⏳ Sin tiempo libre',`Esto toma ${c} días y te quedan ${Math.floor(P.ft)}. Avanza el reloj para recuperar tiempo.`);return;}P.ft-=c;syncActs(P);dim=actDim(P,t);s0=Object.assign({},P.s);}else{if(P.actions<=0)return;P.actions--;}const r=fn();if(s0&&dim<1)for(const k in s0)if(typeof P.s[k]==='number')P.s[k]=s0[k]+(P.s[k]-s0[k])*dim;if(r)log(r);fix(P);if(P.s.salud<=0)die(P.deathCause||'por problemas de salud');
  if(P._dx&&!P.event){const e=EV.find(x=>x.id==='diagnostico');setEvent(P,e);}save();render();}
function useNat(it){if(P.nat<=0||!P.ruler||P.event)return;P.nat--;const n=natOf(P);let r;
  if(isReal()&&it.vote&&n.gov==='democracia'&&!chance(congressVote(n))){r=`El congreso rechaza tu propuesta: “${it.t}”. (Apoyo en el congreso: ${Math.round(n.congress)} %)`;log(r,'bad');}
  else{r=it.fn();if(r)log(r);}
  n.stab=clamp(n.stab,0,100);n.approval=clamp(n.approval,3,95);fix(P);flushNews();save();render();}
function doDeclare(t){useNat({fn:()=>{const n=natOf(P);declareWar(n.id,t);n.stab-=5;if(isReal())n.approval-=4;return null;}});}
function doAlliance(t){useNat({fn:()=>{const n=natOf(P),T=G.nations[t];const c=clamp(.35+(power(n.id)>power(t)?.2:0)+P.s.influencia/400,.05,.9);if(chance(c)){n.allies.push(t);T.allies.push(n.id);return `${T.name} acepta la alianza.`;}return `${T.name} rechaza la alianza.`;}});}
function doPeace(t){useNat({fn:()=>{const n=natOf(P),w=warBetween(n.id,t);if(!w)return null;const s=w.a===n.id?w.score:-w.score;const c=clamp(.3+s/200+.1*w.years,.05,.95);
  if(chance(c)){if(s>=-20&&regionsOf(t).length){setTimeout(()=>conference(w,t),0);return `${G.nations[t].name} acepta negociar la paz.`;}makePeace(w);n.stab+=3;return `${G.nations[t].name} acepta la paz. No obtienes territorio.`;}return `${G.nations[t].name} rechaza la paz.`;}});}
// Conferencia de paz: eliges qué provincias te quedas (deben tocar tu territorio o lo que ya elegiste)
function conference(w,foe){const me=natOf(P).id,budget=peaceBudget(w,me);const chosen=[];
  const draw=()=>{const opts=claimable(me,foe,chosen).sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,40);
    openSheet(`<h3>Conferencia de paz con ${G.nations[foe].name}</h3><div class="hint">Puedes reclamar ${budget} provincia(s); llevas ${chosen.length}. Solo provincias que toquen tu territorio o lo que ya elegiste. La capital enemiga cuesta estabilidad.</div>`+
     (chosen.length?`<div class="sect">Elegidas</div>`+chosen.map(r=>`<div class="item"><span><div class="t">✓ ${RG[r].nm}</div><div class="s">${fmtPop(G.regions[r].pop)} hab.</div></span></div>`).join(''):'')+
     `<button class="btn gold" id="cfOk" style="width:100%;margin:6px 0 10px">Firmar la paz${chosen.length?' y anexar '+chosen.length:''}</button>`+
     `<div class="sect">Provincias disponibles</div>`+opts.map((r,i)=>`<button class="item" data-i="${i}" ${chosen.length>=budget?'disabled':''}><span><div class="t">${RG[r].nm}${RG[r].cap&&RG[r].n===foe?' ★ capital':''}</div><div class="s">${fmtPop(G.regions[r].pop)} hab. · PIB ${fmtN(G.regions[r].gdp)}</div></span></button>`).join(''),
     b=>{b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const r=opts[+x.dataset.i];chosen.push(r);G.sel=r;centerOn(r,Math.min(vb.w,1400));draw();});
      b.querySelector('#cfOk').onclick=()=>{const L=G.nations[foe];chosen.forEach(r=>{if(RG[r].cap&&r===capitalOf(foe))L.stab-=10;transfer(r,me);});checkGone(foe);if(G.wars.includes(w))makePeace(w,true);
        log(chosen.length?`Firmas la paz con ${L.name} y anexas ${chosen.length} provincia(s): ${chosen.map(r=>RG[r].nm).join(', ')}.`:`Firmas la paz con ${L.name} sin anexar territorio.`,'big');
        natOf(P).stab+=chosen.length?2:4;flushNews();save();closeSheet();render();};});};
  draw();}

/* ----- hojas ----- */
function openSheetRaw(html,bind){$('sheetIn').innerHTML=html;$('ov').classList.add('on');$('sheet').classList.add('on');$('sheet').scrollTop=0;if(bind)bind($('sheetIn'));}
function closeSheet(){$('ov').classList.remove('on');$('sheet').classList.remove('on');}
$('ov').onclick=()=>{if(!$('modal').classList.contains('on'))closeSheet();};
function listHTML(items,secKey){let h='',last=null;items.forEach((it,i)=>{if(secKey&&it[secKey]!==last){last=it[secKey];h+=`<div class="sect">${last}</div>`;}h+=`<button class="item" data-i="${i}" ${it.can?'':'disabled'}><span><div class="t">${it.t}</div>${it.s?`<div class="s">${it.s}</div>`:''}</span>${it.r?`<span class="r">${it.r}</span>`:''}</button>`;});return h;}
$('nAct').onclick=()=>{if(!P||!P.alive)return;const items=personalActions();items.forEach(it=>{it.can=it.can&&(typeof canAfford==='function'?canAfford(it.t):P.actions>0)&&!P.event;if(typeof actCost==='function')it.s=(`⏳ ${actCost(it.t)} días`+(P._acted&&P._acted[it.t]?` · ya la hiciste ${P._acted[it.t]}× este año (rinde menos)`:'')+' · ')+(it.s||'');});
  openSheet(`<h3>Acciones</h3><div class="hint">${typeof FTY==='function'?`Tiempo libre: <b>${Math.floor(P.ft)} de ${FTY(P)} días</b> (se recupera ~${Math.round(FTY(P)/12)} días por mes). Repetir una acción en el mismo año rinde menos.`:`Te quedan ${P.actions} de ${P.prison?1:3} acciones este año.`}${P.prison?' Estás en prisión: solo puedes estudiar, leer o hacer ejercicio.':''} Precios en dólares de tu región.</div>`+listHTML(items),b=>b.querySelectorAll('.item').forEach(x=>x.onclick=()=>{useAct(items[+x.dataset.i].fn,items[+x.dataset.i].t);if(!P.event)$('nAct').click();else closeSheet();}));};
$('nCar').onclick=()=>{if(!P||!P.alive)return;const items=careerOptions();items.forEach(it=>{if(it.act){it.can=it.can&&(typeof canAfford==='function'?canAfford(it.t):P.actions>0);if(typeof actCost==='function')it.s=`⏳ ${actCost(it.t)} días · `+(it.s||'');}it.can=it.can&&!P.event;});
  const p=P;let info=`<b>${careerTitle(p)}</b>`;
  if(p.career.track){const T=TRACKS[p.career.track];info+=` · ${T.name} · ${p.career.years|0} año(s) en el puesto · ${fmt(trackPay(p))}/año`;if(p.career.rank<T.ranks.length-1)info+=`<br>Próximo ascenso: ${T.ranks[p.career.rank+1]} (${T.yrs[p.career.rank]} años, Influencia ${T.inf[p.career.rank]}, Inteligencia ${T.int[p.career.rank]}${T.money&&T.money[p.career.rank]?', '+fmt(T.money[p.career.rank]*U(p))+' ahorrados':''})`;}
  if(p.job)info+=` · ${fmt(jobPay(p))}/año`;
  if(p.edu.degree)info+=`<br>Título: ${p.edu.degree}`;
  const d=N0[regOf(p).w0];info+=`<br><span class="src">Sueldos: ${d.wsrc} para ${d.nm}, ajustados por la economía de tu región.</span>`;
  openSheet(`<h3>Carrera</h3><div class="hint">${info}${items.length?'':'<br>Aún no hay opciones de carrera a tu edad.'}</div>`+listHTML(items,'sec'),b=>b.querySelectorAll('.item').forEach(x=>x.onclick=()=>{const it=items[+x.dataset.i];if(it.act){useAct(it.fn,it.t);}else{const r=it.fn();if(r)log(r);fix(P);if(P.s.salud<=0)die(P.deathCause||'');save();render();}closeSheet();}));};
$('nNat').onclick=()=>{if(!P)return;const n=natOf(P),real=isReal();const wars=warsOf(n.id);
  let h=`<h3>${flag(n.id,18)} ${n.name}</h3><div class="hint">${natFacts(n)}</div>`;
  if(real)h+=`<div class="hint">Mandato: ${n.term} años · ${RULE_TXT[n.rule]} · próximas elecciones: ${n.gov==='democracia'?n.nextElec:'canceladas'}${P.ruler?`<br>Aprobación ${Math.round(n.approval)} % · Apoyo en el congreso ${Math.round(n.congress)} % (probabilidad de aprobar una ley: ${Math.round(congressVote(n)*100)} %)`:''}${n.sanc?`<br><span class="pill war">Sanciones comerciales: ${n.sanc} año(s)</span>`:''}${n.trade?`<br>Tratado comercial vigente: ${n.trade} año(s)`:''}</div>`;
  if(wars.length)h+=`<div class="sect">Guerras</div>`+wars.map(w=>{const s=w.a===n.id?w.score:-w.score;const mo=w.a===n.id?w.ma:w.mb;return `<div class="item"><span><div class="t">vs ${G.nations[enemyIn(w,n.id)].name}</div><div class="s">${w.years} año(s) · frente ${Math.round(s)} (±100 = tomar ${batchSize(w,s>=0?enemyIn(w,n.id):n.id)} provincia(s))${real?` · moral ${Math.round((mo||1)*100)} %`:''}</div></span></div>`;}).join('');
  let items=[];
  if(P.ruler&&P.alive){h+=`<div class="hint">💰 Tesoro nacional para obras: <b>${fmtN(n.treas||0)}</b> (+${fmtN(treasuryIncome(n))}/año). Toca una provincia tuya → 🏗️ Construir.</div>`;items=natActions();items.forEach(it=>it.can=it.can&&P.nat>0&&!P.event);h+=`<div class="sect">Acciones de gobierno (${P.nat} de 2)</div>`+listHTML(items.map(it=>({...it,s:it.s+(real&&it.vote&&n.gov==='democracia'?' · requiere votación':'')})))+`<div class="hint">Para guerra, paz o alianzas: toca una provincia de otro país en el mapa.</div>`;}
  else h+=`<div class="hint">Llega a gobernar (Presidente por elección, Dictador por golpe militar) para tomar decisiones de nación.</div>`;
  const rank=Object.values(G.nations).filter(x=>x.alive).sort((a,b)=>power(b.id)-power(a.id)).slice(0,10);
  h+=`<div class="sect">Potencias militares</div>`+rank.map((x,i)=>`<div class="item"><span><div class="t">${i+1}. ${x.name}</div><div class="s">${regionsOf(x.id).length} provincia(s) · Ejército ${Math.round(x.army)} · PIB ${fmtN(x.gdp)}</div></span>${warsOf(x.id).length?'<span class="pill war">guerra</span>':''}</div>`).join('');
  openSheet(h,b=>b.querySelectorAll('button.item[data-i]').forEach(x=>x.onclick=()=>{useNat(items[+x.dataset.i]);$('nNat').click();}));};
$('nMore').onclick=()=>{const real=isReal();openSheet(`<h3>Más</h3>
  <button class="item" id="mFam"><span><div class="t">👥 Personas</div><div class="s">Familia, amigos, rivales y jefe: interactúa con cada uno</div></span></button>
  <button class="item" id="mAss"><span><div class="t">💼 Bienes y negocios</div><div class="s">Tu negocio, inversiones, autos y casa</div></span></button>
  <button class="item" id="mAch"><span><div class="t">🏅 Ambición y logros</div></span></button>
  <button class="item" id="mFin"><span><div class="t">Finanzas${real?' y préstamos':''}</div><div class="s">${real?'Impuestos, préstamos, hipoteca, bancarrota':'Ingresos y gastos del año'}</div></span></button>
  <button class="item" id="mSrc"><span><div class="t">Datos reales y fuentes</div><div class="s">De dónde sale cada número del juego</div></span></button>
  <button class="item" id="mLite"><span><div class="t">Mapa: ${mapMode==='gl'?'detallado (WebGL)':'ligero'}</div><div class="s">Toca para cambiar a ${mapMode==='gl'?'ligero (para computadoras lentas)':'detallado'}; recarga la página</div></span></button>
  <button class="item" disabled><span><div class="t">Modo Live (TikTok)</div><div class="s">En pausa: vuelve cuando el juego esté completo</div></span></button>
  <button class="item" id="mCfg"><span><div class="t">⚙️ Ajustes</div><div class="s">Sonido, periódico</div></span></button>
  <button class="item" id="mNew"><span><div class="t">Nueva partida</div><div class="s">Borra la partida guardada</div></span></button>`,b=>{
  b.querySelector('#mFam').onclick=showPeople;b.querySelector('#mAss').onclick=showAssets;b.querySelector('#mAch').onclick=showAch;b.querySelector('#mCfg').onclick=showSettings;b.querySelector('#mFin').onclick=showFinance;b.querySelector('#mSrc').onclick=showSources;b.querySelector('#mNew').onclick=()=>{closeSheet();showStart(true);};b.querySelector('#mLite').onclick=()=>{try{localStorage.setItem('imperioLite',mapMode==='gl'?'1':'0');}catch(e){}save();location.reload();};});};
function achHTML(p){const got=ACH.filter(a=>p.ach.includes(a[0]));return `<div class="sect">Legado: ${legacy(p)} puntos</div>`+(p.amb?`<div class="hint">Ambición: ${AMB[p.amb].n} — ${p.ambOk?'cumplida en '+p.ambOk+' ✓':'no cumplida'}</div>`:'')+(got.length?`<div class="achs">${got.map(a=>`<span class="ach">🏅 ${a[1]}</span>`).join('')}</div>`:'<div class="hint">Sin logros en esta vida.</div>');}
function showAch(){const p=P;openSheet(`<h3>Ambición y logros</h3>`+achHTML(p)+`<div class="sect">Todos los logros</div>`+ACH.map(a=>`<div class="item"><span><div class="t">${p.ach.includes(a[0])?'🏅':(G.ach&&G.ach[a[0]]?'🥈':'⬜')} ${a[1]}</div><div class="s">${a[2]}${!p.ach.includes(a[0])&&G.ach&&G.ach[a[0]]?' · lo logró un antepasado':''}</div></span></div>`).join(''));}
function showFamily(){const p=P;const row=(t,s,r)=>`<div class="item"><span><div class="t">${t}</div><div class="s">${s}</div></span>${r!=null?`<span class="r">Relación ${Math.round(r)}</span>`:''}</div>`;
  let h='<h3>Familia</h3>';
  h+='<div class="sect">Padres</div>'+(p.parents.map(x=>row(x.name,`${x.role} · ${x.alive?x.age+' años':'fallecido'}`,x.alive?x.rel:null)).join('')||'<div class="hint">—</div>');
  h+='<div class="sect">Pareja</div>'+(p.partner?row(p.partner.name,p.married?'Cónyuge':'Pareja',p.partner.rel):'<div class="hint">Sin pareja. Usa “Buscar pareja” en Acciones.</div>');
  h+='<div class="sect">Hijos (herederos)</div>'+(p.children.map(c=>row(c.name,`${c.sex==='F'?'Hija':'Hijo'} · ${c.age} años`)).join('')||'<div class="hint">Sin hijos. Si mueres sin hijos, termina tu dinastía.</div>');
  if(p.siblings.length)h+='<div class="sect">Hermanos</div>'+p.siblings.map(c=>row(c.name,`${c.sex==='F'?'Hermana':'Hermano'} · ${c.age} años`)).join('');
  openSheet(h);}
function showFinance(){const p=P,real=isReal(),n=natOf(p),g=grossIncome(p),tax=taxOf(p,g),liv=livingCost(p),dp=real?debtPay(p):0;
  const row=(a,b,c)=>`<div class="frow ${c||''}"><span>${a}</span><span>${b}</span></div>`;
  let h=`<h3>Finanzas</h3><div class="hint">Salario medio en tu región: ${fmt(U(p))}/año (${N0[regOf(p).w0].wsrc}).${real?` Índice de precios de ${n.name}: ${(n.price).toFixed(2)} (inflación ${pct(n.infl)}).`:''}</div>`;
  h+=`<div class="fin">`+row('Ingreso bruto',fmt(g))+(real?row(`Impuestos (recaudación del país: ${N0[regOf(p).w0].tax} % del PIB)`,'−'+fmt(tax)):'')+row('Gastos de vida','−'+fmt(liv))+(real?row('Pagos de préstamos','−'+fmt(dp)):'')+row('Neto del año',fmt(g-tax-liv-dp),'tot')+`</div>`;
  if(!real){openSheet(h+`<div class="hint">En modo Rápido el sueldo y los gastos son automáticos. Impuestos, inflación, préstamos e hipotecas están en modo Realista.</div>`);return;}
  if(p.house)h+=`<div class="hint">🏠 Tu casa vale ${fmt(p.house.val)}.</div>`;
  if(p.bankrupt)h+=`<div class="hint"><span class="pill war">Bancarrota: sin crédito ${p.bankrupt} año(s)</span></div>`;
  if(p.late)h+=`<div class="hint"><span class="pill war">${p.late} año(s) de atraso en pagos</span></div>`;
  const items=financeOptions();items.forEach(it=>it.can=it.can&&!P.event&&P.alive);
  h+=listHTML(items,'sec')+`<div class="hint">Tasas basadas en la tasa de préstamos real del país (${pct(n.rate)}, Banco Mundial). Si te quedas en números rojos, el banco cobra la tasa de tarjeta de crédito (${pct(n.rate+12)}). Con más de ${fmt(1.5*U(p))} en contra durante 2 años, te demandan.</div>`;
  openSheet(h,b=>b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const r=items[+x.dataset.i].fn();if(r)log(r);fix(P);save();render();showFinance();}));}
function showSources(){const d=N0[regOf(P).w0];
  openSheet(`<h3>Datos reales (Mundo 2026)</h3><div class="hint">Foto fechada del mundo actual. Los valores iniciales de ${d.nm} y de cada país vienen de:</div>
  <div class="fin stack">
  <div class="frow"><span>Fronteras de países y provincias, relieve, ríos y lagos</span><span>Natural Earth</span></div>
  <div class="frow"><span>Población de cada provincia (dato más reciente)</span><span>Wikidata (85 % de las provincias)</span></div>
  <div class="frow"><span>Población, PIB, inflación, desempleo, esperanza de vida, natalidad, recaudación, tasa de préstamos</span><span>Banco Mundial (WDI) · último año disponible (${d.yr})</span></div>
  <div class="frow"><span>Gasto militar y tamaño de las fuerzas armadas</span><span>SIPRI e IISS vía Banco Mundial</span></div>
  <div class="frow"><span>Estabilidad política inicial</span><span>Banco Mundial, Worldwide Governance Indicators</span></div>
  <div class="frow"><span>Deuda pública</span><span>FMI (World Economic Outlook)</span></div>
  <div class="frow"><span>Salarios por ocupación (ISCO-08)</span><span>OIT, ILOSTAT · ${d.wsrc}</span></div>
  <div class="frow"><span>Mortalidad por edad y sexo</span><span>OMS, tablas de vida GHO (${d.mort.y||'mediana mundial'})</span></div>
  <div class="frow"><span>Duración de mandatos y reelección</span><span>Constituciones vigentes (resumen)</span></div>
  </div>
  <div class="hint">Lo que es estimado: el PIB de cada provincia (proporcional a su población), la población del 15 % de provincias sin dato en Wikidata (según sus ciudades y superficie), las provincias diminutas unidas a su vecina, los sueldos de los países sin datos de la OIT, y los datos de Taiwán, Corea del Norte, Eritrea y Sáhara Occidental, que el Banco Mundial no publica. Los líderes, partidos y bloques son ficticios.</div>`);}

/* ----- regalos (Modo Live: en pausa, código conservado) ----- */
function onGift(user,gift,coins){/* apagado hasta después de la v0.6 */}

/* ----- toast y modales ----- */
const tq=[];let tBusy=false;
function toast(u,r){tq.push([u,r]);if(!tBusy)nextToast();}
function nextToast(){const x=tq.shift();if(!x){tBusy=false;return;}tBusy=true;$('tU').textContent=x[0];$('tR').textContent=x[1];$('toast').classList.add('on');setTimeout(()=>{$('toast').classList.remove('on');setTimeout(nextToast,350);},3600);}
function hideModal(){$('modal').classList.remove('on');if(!$('sheet').classList.contains('on'))$('ov').classList.remove('on');}
function showModal(html,bind){const m=$('modal');m.innerHTML=html;m.classList.add('on');$('ov').classList.add('on');$('sheet').classList.remove('on');m.scrollTop=0;if(bind)bind(m);}
function showEvent(){const e=P.event;const [ik,icc]=evIcon(e.id,e.text);showModal(`<div class="evh"><span class="evi" style="color:${icc};border-color:${icc}">${ico(ik,26)}</span><h2>${P.age} años · ${G.year}</h2></div><p class="evt">${e.text}</p>`+e.opts.map((t,i)=>`<button class="opt" data-i="${i}">${t}</button>`).join(''),m=>m.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{resolveEvent(+b.dataset.i);if(P._dx&&!P.event&&P.alive)setEvent(P,EV.find(x=>x.id==='diagnostico'));save();render();}));}
function showDeath(){const h=heir(P);const best=P.ruler?'gobernante':careerTitle(P);const d=N0[regOf(P).w0];const le=P.sex==='F'?d.lef:d.lem;
  showModal(`<div class="pp">${face(P,64,{dead:1,crown:P.ruler})}<div><h2>Fin de una vida</h2><p>${fullName(P)} murió a los ${P.age} años en ${G.year}. Último cargo: ${best}. Patrimonio: ${fmt(netWorth(P))}.</p></div></div><p class="src">Esperanza de vida real en ${d.nm} para ${P.sex==='F'?'mujeres':'hombres'}: ${le} años.</p>`+achHTML(P)+
   (h?`<button class="opt" id="dH">Continuar como ${h.name} (${h.age} años)</button>`:`<p>No dejaste herederos. Tu dinastía termina aquí.</p>`)+
   (typeof gmode==='function'&&gmode()==='lider'?`<button class="opt" id="dL">Continuar como el siguiente líder de ${natOf(P).name}</button>`:'')+
   `<button class="opt" id="dN">Nueva vida en este mismo mundo</button><button class="opt" id="dW">Mundo nuevo</button>`,m=>{
   if(h)m.querySelector('#dH').onclick=()=>{continueAsHeir();save();render();};
   const dl=m.querySelector('#dL');if(dl)dl.onclick=()=>{continueAsLeader();hideModal();save();render();};
   m.querySelector('#dN').onclick=()=>showStart(false,true);m.querySelector('#dW').onclick=()=>showStart(true);});}
function showStart(fresh,keepWorld){
  const world=keepWorld&&G?G:null;
  const nats=Object.values(world?world.nations:N0).map(x=>world?x:{id:Object.keys(N0).find(k=>N0[k]===x),name:x.nm,alive:true}).filter(x=>x.alive).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const opts=nats.map(c=>`<option value="${c.id}" ${c.id==='MEX'?'selected':''}>${c.name}</option>`).join('');
  const can=!fresh&&!keepWorld&&P&&P.alive;let mode=world?world.mode:'rapido';
  showModal(`<h2>Imperio de una Vida <small>v${VERSION}</small></h2><p class="src">Vive año por año en el mundo real de 2026, sube hasta el poder y redibuja el mapa.</p>
   ${can?'<button class="opt" id="sC">Continuar partida</button><div class="sect">O empieza una nueva vida</div>':''}
   ${world?`<div class="hint">Mismo mundo · modo ${MODES[mode]}</div>`:`<div class="sect">Modo de juego</div><div class="modes">
     <button class="mode on" data-m="rapido"><b>Rápido</b><span>Sueldo y gastos automáticos, guerras de una batalla al año, elecciones directas. Una vida: 10–15 min.</span></button>
     <button class="mode" data-m="realista"><b>Realista</b><span>Impuestos, inflación, préstamos, hipoteca y bancarrota. Guerras mes a mes, mortalidad real de la OMS y enfermedades, mandatos reales, congreso, encuestas y juicios. Una vida: 30–60 min.</span></button></div>
     <div class="hint">El modo se elige al crear la partida y no cambia a mitad.</div>`}
   <div class="sect">Tipo de partida</div><div class="modes gms">${Object.entries(typeof GMODES!=='undefined'?GMODES:{}).map(([k,v])=>`<button class="mode gm${k==='hib'?' on':''}" data-g="${k}"><b>${v.n}</b><span>${v.d}</span></button>`).join('')}</div>
   <div class="row2"><div><label class="f">Nombre</label><input id="sF" maxlength="20"></div><div><label class="f">Apellido</label><input id="sS" maxlength="20"></div></div>
   <div class="row2"><div><label class="f">Sexo</label><select id="sX"><option value="M">Hombre</option><option value="F">Mujer</option></select></div>
   <div><label class="f">Empezar a los</label><select id="sA"><option value="0">0 años (vida completa)</option><option value="18">18 años</option></select></div></div>
   <label class="f">País de nacimiento</label><select id="sP">${opts}</select>
   <label class="f">Provincia / estado</label><select id="sR"></select>
   <button class="btn gold" id="sGo" style="width:100%;margin-top:14px;padding:12px">Comenzar vida</button>`,m=>{
   if(can)m.querySelector('#sC').onclick=()=>{hideModal();render();};
   let gm='hib';m.querySelectorAll('.mode:not(.gm)').forEach(b=>b.onclick=()=>{mode=b.dataset.m;m.querySelectorAll('.mode:not(.gm)').forEach(x=>x.classList.toggle('on',x===b));});
   m.querySelectorAll('.gm').forEach(b=>b.onclick=()=>{gm=b.dataset.g;m.querySelectorAll('.gm').forEach(x=>x.classList.toggle('on',x===b));m.querySelector('#sA').disabled=gm==='lider';m.querySelector('#sGo').textContent=gm==='lider'?'Asumir el gobierno':'Comenzar vida';});
   const setNames=()=>{const c=cultOf(m.querySelector('#sP').value);m.querySelector('#sF').value=rndFirst(m.querySelector('#sX').value,c);m.querySelector('#sS').value=rndSur(c);};
   const setRegs=()=>{const nid=m.querySelector('#sP').value;const own=world?Object.keys(world.regions).filter(r=>world.regions[r].o===nid):Object.keys(RG).filter(r=>RG[r].n===nid);
     own.sort((a,b)=>RG[a].nm.localeCompare(RG[b].nm,'es'));m.querySelector('#sR').innerHTML='<option value="">Al azar (según población)</option>'+own.map(r=>`<option value="${r}">${RG[r].nm}${RG[r].mem.length>1?' (+'+(RG[r].mem.length-1)+')':''}</option>`).join('');};
   setNames();setRegs();
   m.querySelector('#sX').onchange=setNames;m.querySelector('#sP').onchange=()=>{setNames();setRegs();};
   m.querySelector('#sGo').onclick=()=>{
     if(!world){G=newWorld(mode);invalidate();natTotals();}
     const nid=m.querySelector('#sP').value;let r=m.querySelector('#sR').value;
     if(!r){const own=Object.keys(G.regions).filter(x=>G.regions[x].o===nid);let tot=own.reduce((s,x)=>s+G.regions[x].pop,0),k=Math.random()*tot;r=own[0];for(const x of own){k-=G.regions[x].pop;if(k<=0){r=x;break;}}}
     const c=cultOf(nid);
     P=newPlayer({first:clean(m.querySelector('#sF').value.trim()).slice(0,20)||rndFirst('M',c),surname:clean(m.querySelector('#sS').value.trim()).slice(0,20)||rndSur(c),sex:m.querySelector('#sX').value,r,age:+m.querySelector('#sA').value});
     G.gm=gm;if(typeof ensureClock==='function'){G.day=G.day||0;ensureClock();ensureFt(P);syncActs(P);}
     if(gm==='lider'){r=capitalOf(nid)||r;P.r=r;setupLeader(P);}
     G.sel=r;centerOn(r,1100);lastR=r;const n=natOf(P);if(G.mode&&!G.ach)G.ach={};
     if(gm!=='lider')log(P.age?`Tienes 18 años y vives en ${RG[r].nm}, ${n.name}. Es ${G.year}. Modo ${MODES[G.mode]}.`:`Naces en ${RG[r].nm}, ${n.name}, en ${G.year}. Tus padres: ${P.parents.map(x=>x.name).join(' y ')}. Modo ${MODES[G.mode]}.`,'big');
     log(`${n.name}: ${fmtPop(n.pop)} habitantes, PIB por persona ${fmtN(gdppc(n))}, salario medio ${fmt(U(P))} al año.`,'news');
     save();hideModal();render();};});}

$('ageBtn').onclick=()=>advanceTurn();
$('ffBtn').onclick=()=>fastForward(5);
const hadSave=load()&&P;if(!hadSave){G=newWorld('rapido');natTotals();}
showStart(!hadSave);
initMap().then(()=>{if(P){centerOn(P.r,1100);lastR=P.r;}else{vb.x=0;vb.y=0;vb.w=MW;setVB();}refreshMap();if(P&&!$('modal').classList.contains('on'))render();})
 .catch(e=>{$('selInfo').textContent='No se pudo cargar el mapa: '+e.message;});
