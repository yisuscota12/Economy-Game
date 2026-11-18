/* ===== v0.9: menú de vistas (Personaje / País), provincias completas, gobierno, formables, conferencia ampliada, modos de mapa ===== */
const VIEW={v:CFG.view||'pj',tab:CFG.vtab||'res',want:null,force:false,sub:null,sort:'pop'};
const sheetIsOpen=()=>$('sheet').classList.contains('on');
// las hojas pueden dibujarse dentro de la pestaña activa de la Vista País
function openSheet(h,bind){const k=VIEW.want;VIEW.want=null;const inl=k&&VIEW.v==='pa'&&VIEW.tab===k&&(VIEW.force||!sheetIsOpen());
  if(inl){const b=$('natBody');VIEW.force=false;b.innerHTML=h;if(bind)bind(b);}else openSheetRaw(h,bind);}
function showArmies(){VIEW.want='arm';showArmiesV();}
function showDiplomacy(){VIEW.want='dip';VIEW.sub=null;showDiplomacyV();}
function showNationDip(t){const inl=VIEW.v==='pa'&&VIEW.tab==='dip'&&(VIEW.force||!sheetIsOpen());VIEW.want='dip';showNationDipV(t);
  if(inl){VIEW.sub=t;const b=$('natBody');b.insertAdjacentHTML('afterbegin','<button class="btn" id="dipBack" style="margin-bottom:6px">← Todos los países</button>');b.querySelector('#dipBack').onclick=()=>{VIEW.sub=null;showDiplomacy();};}}
function showWarLog(){VIEW.want='war';showWarLogV();}

/* ----- estructura de la vista ----- */
(function(){const top=$('topCard');const vt=document.createElement('div');vt.id='viewTabs';vt.className='vtabs';
  vt.innerHTML='<button data-v="pj">👤 Personaje</button><button data-v="pa">🏛️ País</button>';top.parentNode.insertBefore(vt,top.nextSibling);
  vt.querySelectorAll('button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
  const nt=document.createElement('div');nt.id='natTop';top.appendChild(nt);
  const mapCard=$('mapWrap').parentNode;const nv=document.createElement('div');nv.className='card';nv.id='natView';
  nv.innerHTML='<div class="ntabs" id="natTabs"></div><div id="natBody"></div>';mapCard.parentNode.insertBefore(nv,mapCard.nextSibling);
  document.body.classList.toggle('vpa',VIEW.v==='pa');})();
const NTABS=[['res','Resumen'],['prov','Provincias'],['arm','Ejército'],['eco','Economía'],['dip','Diplomacia'],['war','Guerra'],['rank','Ranking']];
function setView(v){VIEW.v=v;CFG.view=v;saveCfg();document.body.classList.toggle('vpa',v==='pa');if(mapReady){fitCanvas();setVB();drawOverlay();}render();window.scrollTo({top:0,behavior:'smooth'});}
function setTab(k){VIEW.tab=k;CFG.vtab=k;saveCfg();VIEW.sub=null;renderView();}
function renderView(){if(!P||!G)return;document.querySelectorAll('#viewTabs button').forEach(b=>b.classList.toggle('on',b.dataset.v===VIEW.v));if(VIEW.v!=='pa')return;
  const n=natOf(P),me=n.id,I=IDEO[ideoOf(n)];const rk=rankOf(me);
  $('natTop').innerHTML=`<div class="ntop"><div class="nflag">${flag(me,44)}</div><div class="nwho"><div class="name">${n.name}</div>
    <div class="sub">${I.n} · ${P.ruler?`gobiernas tú (${careerTitle(P)})`:`gobierna ${n.leader}`}</div>
    <span class="title-chip">#${rk} del mundo</span> <span class="title-chip mode-chip">${mandoActive()?MES[G.month%12]+' ':''}${G.year}</span></div>
    <div class="money"><div class="v">${P.ruler?fmtN(n.treas||0):fmtN(n.gdp)}</div><div class="y">${P.ruler?'tesoro':'PIB'}</div></div></div>`;
  $('natTabs').innerHTML=NTABS.map(([k,t])=>`<button data-t="${k}" class="${VIEW.tab===k?'on':''}">${t}</button>`).join('');
  $('natTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
  const body=$('natBody');const k=VIEW.tab;
  if(k==='res')body.innerHTML=resumenHTML(n),bindResumen(body,n);
  else if(k==='prov')provTab(body,n);
  else if(k==='rank')rankTab(body,n);
  else if(k==='arm'){if(hasCommand(P)){VIEW.force=true;showArmies();}else body.innerHTML=`<div class="hint">Mandan las tropas el gobierno y los Generales. Tu país tiene ${fmtK(armiesOf(me).length?soldiersOf(me):fieldOf(me))} soldados en campaña; calidad ${qualOf(me).toFixed(2)}.</div>`;}
  else if(k==='eco'){VIEW.force=true;showEconomy();}
  else if(k==='dip'){if(!P.ruler){body.innerHTML=`<div class="hint">Solo quien gobierna hace diplomacia.</div>`+relSummary(n);return;}VIEW.force=true;if(VIEW.sub&&G.nations[VIEW.sub])showNationDip(VIEW.sub);else showDiplomacy();}
  else if(k==='war'){VIEW.force=true;showWarLog();}}
const stat2=(a,b,c)=>`<div class="nst"><span>${a}</span><b class="${c||''}">${b}</b></div>`;
function avgHap(nid){let s=0,p=0;regionsOf(nid).forEach(r=>{const x=G.regions[r];ensureProv(x);s+=x.hap*x.pop;p+=x.pop;});return p?s/p:50;}
function relSummary(n){const me=n.id;const al=n.allies.map(t=>G.nations[t].name),vs=vassalsOf(me).map(t=>G.nations[t].name),ws=warsOf(me).map(w=>G.nations[enemyIn(w,me)].name);const ov=overlordOf(me);
  return `<div class="hint">${ws.length?`<span class="neg">En guerra con ${ws.join(', ')}</span><br>`:''}Aliados: ${al.join(', ')||'ninguno'} · Vasallos: ${vs.join(', ')||'ninguno'}${ov?` · Eres vasallo de ${G.nations[ov].name}`:''}</div>`;}
function resumenHTML(n){const me=n.id,real=isReal(),I=IDEO[ideoOf(n)];ensureEco(n);const rs=regionsOf(me);const cores=rs.filter(r=>isCore(r,me)).length;
  let h=`<div class="ngrid">`+stat2('Población',fmtPop(n.pop))+stat2('PIB',fmtN(n.gdp))+stat2('Por persona',fmtN(gdppc(n)))+stat2('Crecimiento',pct(n.g||0),(n.g||0)<0?'neg':'pos')+
    (real?stat2('Inflación',pct(n.infl)):'')+stat2('Estabilidad',Math.round(n.stab),n.stab<30?'neg':'')+(real&&P.ruler?stat2('Aprobación',Math.round(n.approval)+' %'):'')+stat2('Felicidad',Math.round(avgHap(me)))+
    stat2('Provincias',`${rs.length} (${cores} núcleo)`)+stat2('Ejército',armiesOf(me).length?fmtK(soldiersOf(me)):Math.round(n.army))+stat2('Tecnología',`civil ${Math.floor(n.tech.c)} · militar ${Math.floor(n.tech.m)}`)+stat2('Deuda',Math.round(n.debtR*100)+' % del PIB')+`</div>`;
  h+=relSummary(n);
  h+=`<div class="sect">Sistema de gobierno</div><div class="ideo" style="border-color:rgb(${I.col})"><b>${I.n}</b><div class="s">${I.d}</div><div class="s">Crecimiento ${I.g>=0?'+':''}${I.g} % · investigación ${I.res>=0?'+':''}${Math.round(I.res*100)} % · ejército +${Math.round(I.mil*100)} % · reclutas ×${I.mp} · impuestos ×${I.tax} · felicidad ${I.hap>=0?'+':''}${I.hap}</div>`+
    (P.ruler?`<button class="btn" id="rIdeo" ${P.nat>0&&canChangeIdeo(n)&&!blockedTurn()?'':'disabled'}>Cambiar de sistema${canChangeIdeo(n)?'':' (espera '+(4-(G.year-n.ideoY))+' año(s))'}</button>`:'')+`</div>`;
  const F=formsFor(me);if(F.length){h+=`<div class="sect">Naciones que puedes formar</div>`+F.map((f,i)=>{const st=formStatus(me,f);return `<div class="item"><span><div class="t">${f.n}</div><div class="s">Controla las capitales de ${f.m.filter(c=>N0[c]).map(c=>G.nations[c]?G.nations[c].name:c).join(', ')} · tienes ${st.own} de ${st.need}</div></span>${P.ruler&&st.ok?`<button class="btn gold" data-f="${i}">Proclamar</button>`:''}</div>`;}).join('');}
  h+=`<div class="mini-actions" style="margin-top:8px"><button class="btn" id="rNat">🏛️ Acciones de gobierno</button>${P.ruler?'<button class="btn" id="rEco">📊 Presupuesto</button>':''}</div>`;
  if(!P.ruler)h+=`<div class="hint">Llega a gobernar para decidir. Mientras, ves tu país desde dentro.</div>`;return h;}
function bindResumen(b,n){const F=formsFor(n.id);
  const ri=b.querySelector('#rIdeo');if(ri)ri.onclick=showIdeo;b.querySelector('#rNat').onclick=()=>$('nNat').click();const re=b.querySelector('#rEco');if(re)re.onclick=()=>setTab('eco');
  b.querySelectorAll('[data-f]').forEach(x=>x.onclick=()=>{log(formNation(n.id,F[+x.dataset.f]),'big');flushNews();sfx('good');save();render();});}
function showIdeo(){const n=natOf(P),cur=ideoOf(n);const items=Object.entries(IDEO).filter(([k])=>k!==cur).map(([k,I])=>({t:I.n,s:`${I.d} · ${I.gov!==IDEO[cur].gov?'cambio de régimen: −25 estabilidad':'−15 estabilidad'}`,can:P.nat>0&&canChangeIdeo(n)&&!blockedTurn(),k}));
  openSheetRaw(`<h3>Cambiar de sistema de gobierno</h3><div class="hint">Usa una acción de gobierno. Se puede cambiar cada 4 años. Pasar de democracia a otro régimen enfría la relación con las democracias y puede traer sanciones.</div>`+listHTML(items),
    b=>b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const it=items[+x.dataset.i];if(!it.can)return;closeSheet();useNat({t:it.t,fn:()=>changeIdeo(n,it.k)});}));}
function provTab(b,n){const me=n.id;const rs=regionsOf(me).map(r=>{const x=G.regions[r];ensureProv(x);return r;});
  const S={pop:(a,c)=>G.regions[c].pop-G.regions[a].pop,hap:(a,c)=>G.regions[a].hap-G.regions[c].hap,dev:(a,c)=>G.regions[c].dev-G.regions[a].dev,core:(a,c)=>(isCore(a,me)?1:0)-(isCore(c,me)?1:0)};
  const L=rs.slice().sort(S[VIEW.sort]).slice(0,60);
  b.innerHTML=`<div class="mini-actions">${[['pop','Población'],['hap','Menos felices'],['dev','Desarrollo'],['core','No núcleo']].map(([k,t])=>`<button class="btn ${VIEW.sort===k?'gold':''}" data-s="${k}">${t}</button>`).join('')}</div><div class="hint">Toca una provincia para verla en el mapa y usar sus acciones.</div>`+
    L.map(r=>{const x=G.regions[r];const ic=x.b?Object.entries(x.b).filter(([,v])=>v).map(([k])=>BLD[k]?BLD[k].ic:'').join(''):'';
      return `<button class="item prow" data-r="${r}"><span><div class="t">${RG[r].nm}${isCap(r)?' ★':''}${isCore(r,me)?'':' <span class="pill">no núcleo</span>'}${G.occ&&G.occ[r]?' <span class="pill war">ocupada</span>':''}</div>
        <div class="s">${fmtPop(x.pop)} hab. · desarrollo ${x.dev.toFixed(1)} · crecimiento ${pct((x.gl||0)*100)} ${ic}</div><div class="hb"><i style="width:${x.hap}%;background:rgb(${ramp(x.hap/100)})"></i></div></span><span class="hv">${Math.round(x.hap)}</span></button>`;}).join('')+(rs.length>60?`<div class="hint">Mostrando 60 de ${rs.length}.</div>`:'');
  b.querySelectorAll('[data-s]').forEach(x=>x.onclick=()=>{VIEW.sort=x.dataset.s;provTab(b,n);});
  b.querySelectorAll('.prow').forEach(x=>x.onclick=()=>{G.sel=x.dataset.r;centerOn(G.sel,Math.min(vb.w,900),1);renderSel();drawOverlay();requestDraw();window.scrollTo({top:$('mapWrap').getBoundingClientRect().top+window.scrollY-60,behavior:'smooth'});});}
function rankTab(b,n){const L=ranking();const me=n.id;const i=L.findIndex(x=>x.id===me);
  b.innerHTML=`<div class="hint">Puntaje: 40 % economía, 30 % población, 30 % poder militar. Tu país está en el lugar <b>#${i+1}</b> de ${L.length}.</div>`+
    L.slice(0,40).map((x,k)=>{const N=G.nations[x.id];return `<div class="item ${x.id===me?'mine':''}"><span><div class="t">${k+1}. ${flag(x.id,12)} ${N.name}</div><div class="s">${Math.round(x.s)} pts · PIB ${fmtN(N.gdp)} · ${regionsOf(x.id).length} prov. · ${IDEO[ideoOf(N)].n}</div></span>${warsOf(x.id).length?'<span class="pill war">en guerra</span>':''}</div>`;}).join('')+
    (i>=40?`<div class="item mine"><span><div class="t">${i+1}. ${flag(me,12)} ${n.name}</div></span></div>`:'');}

/* ----- economía: presupuesto en porcentajes + lo de la v0.8 ----- */
function showEconomy(){if(!P)return;const n=natOf(P);if(!P.ruler){VIEW.want='eco';openSheet(`<div class="ngrid">${stat2('PIB',fmtN(n.gdp))+stat2('Crecimiento',pct(n.g||0))+stat2('Deuda',Math.round((n.debtR||.5)*100)+' % del PIB')+stat2('Impuestos',TAXL[n.taxL||0].n)}</div><div class="hint">El presupuesto lo decide quien gobierna.</div>`);return;}
  ensureBud(n);const inForce=VIEW.force;VIEW.want='eco';const I=treasuryIncome(n);
  const bh=`<div class="sect">Presupuesto del tesoro (${fmtN(I)} al año)</div><div class="hint">Lo que no asignes se ahorra en el tesoro: <b>${100-budSum(n)} %</b> (${fmtN(I*(1-budSum(n)/100))}).</div>`+
    Object.entries(BUD).map(([k,B])=>`<div class="bud"><div><b>${B.n}</b> <span class="s">${B.d}</span></div><div class="bctl"><button class="btn" data-b="${k}" data-d="-5">−</button><span>${n.bud[k]} %</span><button class="btn" data-b="${k}" data-d="5" ${budSum(n)>=100?'disabled':''}>+</button></div><div class="hb"><i style="width:${n.bud[k]}%;background:#3fb6a8"></i></div></div>`).join('');
  const prevOpen=openSheet;let captured=null;openSheet=(h,bind)=>{captured=[h,bind];};try{showEconomyV();}finally{openSheet=prevOpen;}
  if(!captured)return;const [h,bind]=captured;const i=h.indexOf('<div class="fin">');const html=i>=0?h.slice(0,i)+bh+h.slice(i):bh+h;
  VIEW.want='eco';VIEW.force=inForce;openSheet(html,b=>{bind&&bind(b);b.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>{const k=x.dataset.b,d=+x.dataset.d;n.bud[k]=clamp(n.bud[k]+d,0,100);if(budSum(n)>100)n.bud[k]-=budSum(n)-100;save();VIEW.force=VIEW.v==='pa'&&VIEW.tab==='eco'&&!sheetIsOpen();showEconomy();});});}

/* ----- panel de provincia: felicidad, desarrollo, núcleo y acciones del gobierno ----- */
function provNatHTML(rid){if(!G||!RG[rid])return '';const x=G.regions[rid];ensureProv(x);const me=P&&P.alive?natOf(P).id:null;const own=x.o;const core=isCore(rid,own);
  let h=`<div class="mem">😊 Felicidad <b style="color:rgb(${ramp(x.hap/100)})">${Math.round(x.hap)}</b> · 📈 Desarrollo ${x.dev.toFixed(1)} · crecimiento ${pct((x.gl||0)*100)} · ${core?'🎯 núcleo':'<span class="neg">no es núcleo</span> (−20 felicidad, la mitad de impuestos)'}${x.cq!=null?` · conquistada en ${x.cq}`:''}</div>`;
  if(!(P&&P.alive&&P.ruler&&own===me&&!blockedTurn()))return h;const n=natOf(P),t=n.treas||0;
  const B=(k,ic,txt,ok)=>{const c=provCost[k](x);return `<button class="btn" data-pn="${k}" ${ok&&t>=c?'':'disabled'}>${ic} ${txt} · ${fmtN(c)}</button>`;};
  h+=`<div class="mini-actions">`+B('dev','📈','Desarrollo',x.dev<10)+B('grow','👶','Crecimiento',!(x.gwu>=G.year))+B('fest','🎉','Festival',true)+(!core?B('assim','🎯','Asimilar',x.cq==null||G.year-x.cq>=3):'');
  const D=G.nations[x.w0];if(x.w0!==me&&D&&!D.alive)h+=`<button class="btn" data-pn="libv">🕊️ Liberar ${D.name} como vasallo</button><button class="btn" data-pn="libi">Liberar ${D.name}</button>`;
  return h+`</div>`;}
function bindSel(box,nat){bindSelV7(box,nat);
  box.querySelectorAll('[data-pn]').forEach(b=>b.onclick=()=>{const k=b.dataset.pn,r=G.sel,x=G.regions[r],me=natOf(P).id;
    if(k==='libv'||k==='libi'){const rs=regionsOf(me).filter(q=>G.regions[q].w0===x.w0);log(liberate(x.w0,rs,me,k==='libv'),'big');natOf(P).stab+=3;flushNews();}
    else log(provAct(r,k),'good');sfx('coin');save();render();});
  box.querySelectorAll('[data-ar="plu"],[data-ar="reg"]').forEach(b=>b.onclick=()=>{const a=armyById(+b.dataset.id);if(!a)return;MO.sel=a.id;
    if(b.dataset.ar==='plu'){log(plunder(a),'good');sfx('coin');}else{const k=regroupTo(a.r,a.o);MO.rep=[{t:k?`${k} ejército(s) marchan a reagruparse en ${RG[a.r].nm}.`:'No hay ejércitos cerca para reagrupar.',c:k?'good':'bad'}];sfxWar('march');}
    save();render();});}
function armyExtraBtns(a){let h='';if(canPlunder(a))h+=`<button class="btn" data-ar="plu" data-id="${a.id}">💰 Saquear</button>`;if(mandoActive()&&armiesOf(a.o).length>1)h+=`<button class="btn" data-ar="reg" data-id="${a.id}">🧲 Reagrupar aquí</button>`;return h;}

/* ----- conferencia de paz: provincias, reparaciones, liberar países, vasallaje ----- */
function conference(w,foe,capit){const me=natOf(P).id;const occ=w.mando?occBy(me,foe):[];const s=w.a===me?w.score:-w.score;
  const budget=capit?999:Math.max(peaceBudget(w,me),occ.length);const chosen=[];let vas=false,rep=false;const libs=[];const canVas=capit||s>=60;
  const deadOf=()=>{const m={};regionsOf(foe).forEach(r=>{const d=G.regions[r].w0;if(d!==foe&&d!==me&&G.nations[d]&&!G.nations[d].alive)(m[d]||(m[d]=[])).push(r);});return m;};
  const used=()=>chosen.length+(rep?2:0)+libs.length;
  const draw=()=>{const full=used()>=budget;const occL=occ.filter(r=>!chosen.includes(r)&&G.regions[r].o===foe);const adj=claimable(me,foe,chosen).filter(r=>!occ.includes(r)).sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,30);const opts=occL.concat(adj);const DM=deadOf();
    openSheetRaw(`<h3>Conferencia de paz con ${flag(foe,16)} ${G.nations[foe].name}</h3><div class="hint">${capit?'<b>El enemigo capituló:</b> puedes tomar todo lo que ocupas y más.':`Puntos de paz: ${budget}; usados ${used()}.`} Cada provincia cuesta 1 punto, liberar un país 1 y las reparaciones 2. Las provincias ocupadas (⚑) se reclaman estén donde estén.</div>`+
     (chosen.length?`<div class="sect">Elegidas</div>`+chosen.map(r=>`<div class="item"><span><div class="t">✓ ${RG[r].nm}</div><div class="s">${fmtPop(G.regions[r].pop)} hab.</div></span></div>`).join(''):'')+
     (vas?`<div class="hint">👑 ${G.nations[foe].name} será tu vasallo.</div>`:'')+(rep?`<div class="hint">💰 Pagará reparaciones: ${fmtN(G.nations[foe].gdp*.01)} al año por 10 años.</div>`:'')+(libs.length?`<div class="hint">🕊️ Liberas a: ${libs.map(d=>G.nations[d].name).join(', ')} (como tus vasallos).</div>`:'')+
     `<button class="btn gold" id="cfOk" style="width:100%;margin:6px 0">Firmar la paz</button>`+
     (occL.length>1&&!full?`<button class="btn" id="cfAll" style="width:100%;margin:0 0 6px">Tomar todas las ocupadas (${Math.min(occL.length,budget-used())})</button>`:'')+
     (canVas&&!vas?`<button class="btn" id="cfVas" style="width:100%;margin:0 0 6px">👑 Convertirlo en vasallo</button>`:'')+
     (!rep&&budget-used()>=2?`<button class="btn" id="cfRep" style="width:100%;margin:0 0 6px">💰 Exigir reparaciones de guerra (2 puntos)</button>`:'')+
     Object.keys(DM).filter(d=>!libs.includes(d)).map(d=>`<button class="btn" data-lib="${d}" style="width:100%;margin:0 0 6px" ${full?'disabled':''}>🕊️ Liberar ${G.nations[d].name} (${DM[d].length} prov., 1 punto)</button>`).join('')+
     `<div class="sect">Provincias disponibles</div>`+opts.map((r,i)=>`<button class="item" data-i="${i}" ${full?'disabled':''}><span><div class="t">${occ.includes(r)?'⚑ ':''}${RG[r].nm}${RG[r].cap&&RG[r].n===foe?' ★ capital':''}</div><div class="s">${fmtPop(G.regions[r].pop)} hab. · PIB ${fmtN(G.regions[r].gdp)}</div></span></button>`).join(''),
     b=>{b.querySelectorAll('.item[data-i]').forEach(x=>x.onclick=()=>{const r=opts[+x.dataset.i];chosen.push(r);G.sel=r;centerOn(r,Math.min(vb.w,1400));draw();});
      const all=b.querySelector('#cfAll');if(all)all.onclick=()=>{occL.slice(0,budget-used()).forEach(r=>chosen.push(r));draw();};
      const v=b.querySelector('#cfVas');if(v)v.onclick=()=>{vas=true;draw();};const rp=b.querySelector('#cfRep');if(rp)rp.onclick=()=>{rep=true;draw();};
      b.querySelectorAll('[data-lib]').forEach(x=>x.onclick=()=>{libs.push(x.dataset.lib);draw();});
      b.querySelector('#cfOk').onclick=()=>{const L=G.nations[foe];w.win=me;const DM2=deadOf();
        chosen.forEach(r=>{if(RG[r].cap&&r===capitalOf(foe))L.stab-=10;transfer(r,me);});
        const freed=[];libs.forEach(d=>{const rs=(DM2[d]||[]).filter(r=>G.regions[r].o===foe);if(rs.length){liberate(d,rs,me,true);freed.push(d);}});
        let ra=0;if(rep&&L.alive)ra=addReparations(foe,me,10);checkGone(foe);if(vas&&L.alive)makeVassal(foe,me);if(G.wars.includes(w))makePeace(w,true);
        log(((chosen.length?`Firmas la paz con ${L.name} y anexas ${chosen.length} provincia(s).`:`Firmas la paz con ${L.name}.`)+(vas&&L.alive?` ${L.name} queda como tu vasallo.`:'')+(ra?` Te pagará ${fmtN(ra)} al año por 10 años.`:'')+(freed.length?` Liberas a ${freed.map(d=>G.nations[d].name).join(', ')}.`:'')),'big');
        natOf(P).stab+=chosen.length?2:4;addOp(foe,rep?-25:-10);flushNews();syncMando();save();closeSheet();render();sfxWar('victory');};});};
  draw();}

/* ----- colores del modo Diplomacia ----- */
function dipColor(x,id){const me=P&&P.alive?natOf(P).id:null;const o=(G.occ&&G.occ[id])||x.o;if(!me)return rgbOf(G.nations[o].color);
  if(o===me)return [242,193,78];if(hostile(me,o))return [235,80,80];if(overlordOf(o)===me)return [60,190,170];if(overlordOf(me)===o)return [170,110,220];
  if(G.nations[me].allies.includes(o))return [71,194,107];if(napOf(me,o))return [90,160,240];const v=opOf(o);
  return v>=0?[150-v*.4,150+v*.2,150-v*.2].map(Math.round):[150-v*.3,150+v*.6,150+v*.6].map(Math.round);}
const LEG={dip:[['#f2c14e','tú'],['#47c26b','aliados'],['#3cbeaa','tus vasallos'],['#5aa0f0','no agresión'],['#eb5050','en guerra'],['#aa6edc','tu señor']],
  core:[['#50aa64','núcleo'],['#eb963c','no núcleo'],['#dc4646','ocupada']],
  mil:[['#6eaf5a','llano'],['#cdb45a','colinas'],['#8c5f3c','montaña'],['#dec478','desierto'],['#1e6e32','selva'],['#e1ebf5','frío']]};
function setMapMode(k){MMODE=k;document.querySelectorAll('.mmodes button').forEach(b=>b.classList.toggle('on',b.dataset.mm===k));const md=MODES_MAP[k];
  const sw=(c,t)=>`<span class="mlk"><i style="background:${c}"></i>${t}</span>`;
  if(LEG[k])$('mLeg').innerHTML=`<span>${md.n}</span>`+LEG[k].map(([c,t])=>sw(c,t)).join('');
  else if(k==='ideo')$('mLeg').innerHTML=`<span>${md.n}</span>`+Object.values(IDEO).map(I=>sw(`rgb(${I.col})`,I.n.replace('República ','Rep. ').replace('Monarquía ','Mon. '))).join('');
  else $('mLeg').innerHTML=md.lo?`<span>${md.n}</span><div class="lg-bar"></div><div class="lg-lab"><span>${md.lo}</span><span>${md.hi}</span></div>`:'';
  $('mLeg').style.display=$('mLeg').innerHTML?'block':'none';refreshMap();}
