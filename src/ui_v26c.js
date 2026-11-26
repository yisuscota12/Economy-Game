/* ===== v2.6c: «Programas nucleares» en la pestaña Ejército de la vista País =====
   Usa engine_v26c.js. Muestra tu país (fase y años de cada rama, costo anual, requisitos de la fase siguiente, restricciones) y un
   resumen mundial (potencias, programas detectados, países fuera del tratado, reactores en obra). Los programas militares ajenos solo
   se ven si ya los detectaron o si el país hizo su prueba. Si gobiernas: iniciar o detener cada rama, firmar o dejar el TNP y permitir
   la inversión privada. Como persona: invertir tu dinero en el consorcio civil. Se agrega debajo de «Divisiones y armamento». */
(function(){const st=document.createElement('style');st.textContent=`
#nk26pa{margin-top:10px}
.nk26r{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:3px 0;border-bottom:1px solid var(--line)}
.nk26r span:last-child{color:var(--mut);text-align:right}
.nk26ok{color:var(--teal)}.nk26no{color:var(--red,#e5484d)}
.nk26p{height:5px;border-radius:3px;background:var(--line);overflow:hidden;margin:4px 0 6px}.nk26p i{display:block;height:100%;background:var(--gold)}
.nk26b{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.nk26b .btn{font-size:12.5px;padding:8px 6px;min-height:40px}
.nk26w{font-size:12px;line-height:1.5}
html.v4lt .nk26p{display:none}`;document.head.appendChild(st);})();
if(typeof SH_CL!=='undefined')Object.assign(SH_CL,{nuc:'Energía nuclear'});
function nk26Ph(br,e){const f=br==='c'?e.c:e.m,a=br==='c'?e.ca:e.ma;const T=(br==='c'?NK_C:NK_M)[f];return {f,a,T};}
function nk26Branch(nid,br,e,mine){const {f,a,T}=nk26Ph(br,e);const tot=br==='c'?4:5;const L=br==='c'?NK_C:NK_M;
  let h=`<div class="card" style="padding:8px 10px"><b>${br==='c'?'⚡ Energía nuclear civil':'💣 Armamento nuclear'}</b> · <small>fase ${f} de ${tot}</small>`;
  if(!f){h+=`<div class="hint">${br==='c'?(e.ab?`Cerró sus reactores en ${e.ab}.`:'Sin programa.'):'Sin programa.'}</div>`;}
  else{h+=`<div style="margin-top:3px">${T.n}${T.y?` · año ${a} de ${T.y}`:''}</div>`;if(T.y&&!nkLite())h+=`<div class="nk26p"><i style="width:${Math.round(a/T.y*100)}%"></i></div>`;
    const co=nkCost(nid,br,f);h+=`<div class="nk26r"><span>Costo anual</span><span>${fmtN(co.tot)}${co.pv?` (privados ${fmtN(co.pv)})`:''}</span></div>`;
    if(br==='c'&&f===4)h+=`<div class="nk26r"><span>Reactores · parte de la electricidad</span><span>${e.nr} · ~${Math.round(nkShare(nid)*100)} %</span></div><div class="nk26r"><span>Energía más barata</span><span>${e.ok?nkEner(nid).toFixed(1)+' %':'sin mantenimiento pagado'}</span></div>`;
    if(br==='m'&&f===5)h+=`<div class="nk26r"><span>Ojivas (estimado)</span><span>${e.w||'—'}</span></div>`;
    if(br==='m'&&e.frz>0)h+=`<div class="hint"><span class="neg">Congelado ${e.frz} meses tras ser detectado.</span></div>`;}
  const target=f?(T&&T.y?f:0):1;
  if(target&&L[target]){const R=nkReqs(nid,br,target);h+=`<div style="margin-top:6px"><small>Requisitos de «${L[target].n}»</small></div>`+
    R.map(([t,ok,d])=>`<div class="nk26r"><span class="${ok?'nk26ok':'nk26no'}">${ok?'✓':'✗'} ${t}</span><span>${d}</span></div>`).join('');}
  return h+'</div>';}
function nkLite(){try{return document.documentElement.classList.contains('v4lt');}catch(e){return false;}}
function nk26World(meId){const P0=G.nk.P;const arm=[],mil=[],out=[],obra=[];let op=0,nr=0;
  for(const id in P0){const e=P0[id],n=G.nations[id];if(!n||!n.alive)continue;const nm=n.name;
    if(e.m===5)arm.push([e.w||0,`${nm}${e.w?' ('+ar26K(e.w)+')':''}`]);else if(e.m&&(e.det||id===meId))mil.push(`${nm} (${NK_M[e.m].n.toLowerCase()})`);
    if(!e.npt)out.push(nm);if(e.c===4){op++;nr+=e.nr;}else if(e.c===3)obra.push(nm);}
  arm.sort((a,b)=>b[0]-a[0]);
  return `<div class="nk26w"><b>Potencias nucleares:</b> ${arm.map(x=>x[1]).join(', ')||'ninguna'}<br>`+
    `<b>Programas militares conocidos:</b> ${mil.join(', ')||'ninguno'}<br><b>Fuera del Tratado de No Proliferación:</b> ${out.join(', ')||'nadie'}<br>`+
    `<b>Energía nuclear:</b> ${op} países operan ${nr} reactores · construyendo: ${obra.join(', ')||'nadie'}</div>`;}
function nk26HTML(nid){const e=nkOf(nid);if(!e)return '';const n=G.nations[nid];const mine=nkMine(nid);
  let h=`<div class="sect">☢️ <span>Programas nucleares</span></div>`;
  const K=nkK(nid);const tnp=NK_NWS.has(nid)?'Potencia reconocida':e.npt?'Firmante':'No firmante';
  const L=[['Capacidad técnica','',String(Math.round(K)),'de 100'],['Tratado (TNP)','',tnp,e.npt?'sin armas nucleares':'puede armarse, con sanciones'],
    ['Reactores','',String(e.c===4?e.nr:0),e.c===4?'en operación':'ninguno operando'],['Arsenal','',e.m===5?(e.w?ar26K(e.w)+' ojivas':'sí'):'no',NUKE.has(nid)?'potencia nuclear':'—']];
  h+=typeof v4MtHTML==='function'?v4MtHTML(L):(typeof v19Tiles==='function'?v19Tiles(L.map(x=>[x[0],x[2],x[3]])):'');
  h+=nk26Branch(nid,'c',e,mine)+nk26Branch(nid,'m',e,mine);
  if(mine){const B=[];
    B.push(e.c?['c0','Detener la rama civil']:['c1','Iniciar energía nuclear']);
    B.push(e.m?['m0',e.m===5?'Desmantelar el arsenal':'Cancelar el programa militar']:['m1','Iniciar programa militar']);
    if(!NK_NWS.has(nid))B.push(e.npt?['t0','Retirarse del TNP']:['t1','Firmar el TNP']);
    B.push(e.priv?['p0','Prohibir inversión privada']:['p1','Permitir inversión privada']);
    h+=`<div class="nk26b">${B.map(([k,t])=>`<button class="btn" data-nk26="${k}">${t}</button>`).join('')}</div>`;}
  const I=P&&P.nkInv;const canInv=e.c>=3&&nkPrivOk(nid);
  if(canInv||I){h+=`<div style="margin-top:6px"><small>Tu inversión privada en el consorcio civil${I?`: ${fmt(I.amt)} en ${G.nations[I.nid]?G.nations[I.nid].name:I.nid} · cobrado ${fmt(I.got||0)}`:''}</small></div><div class="nk26b">`+
    (canInv?`<button class="btn" data-nk26="i1">Invertir 10 % de tu dinero</button><button class="btn" data-nk26="i2">Invertir 25 %</button>`:'')+
    (I?`<button class="btn" data-nk26="iv">Vender participación</button>`:'')+`</div>`;}
  h+=`<div class="hint">Reglas: un firmante del TNP no puede tener armas (salvo EE. UU., Rusia, China, Francia y Reino Unido). Quien no firma puede, pero cada avance trae sanciones y la prueba, tres años de sanciones. Los inspectores pueden descubrir un programa militar (fases 1–3): sanciones y un año congelado. Las potencias no venden tecnología, y solo los firmantes compran combustible. Los privados pueden financiar reactores con permiso del gobierno (un régimen comunista lo prohíbe); en armas, nadie privado invierte. Con sanciones, los socios privados se van.</div>`;
  h+=nk26World(nid);
  return h;}
function nk26Act(k){const nid=natOf(P).id;let r;
  if(k==='c1')r=nkStart(nid,'c');else if(k==='m1')r=nkStart(nid,'m');else if(k==='c0')r=nkStop(nid,'c');else if(k==='m0')r=nkStop(nid,'m');
  else if(k==='t1')r=nkNPT(nid,true);else if(k==='t0')r=nkNPT(nid,false);else if(k==='p1')r=nkSetPriv(nid,true);else if(k==='p0')r=nkSetPriv(nid,false);
  else if(k==='i1')r=nkInvest(.1);else if(k==='i2')r=nkInvest(.25);else if(k==='iv')r=nkDivest();
  if(!r)return;if(r.err){try{toast('☢️',r.err);}catch(e){}return;}
  log(r.ok,'good');try{toast('☢️',r.ok);}catch(e){}try{save();}catch(e){}try{render();}catch(e){}try{renderView();}catch(e){}}
function nk26Put(){try{if(!P||!G||VIEW.v!=='pa'||VIEW.tab!=='arm'||!nkOn())return;const body=$('natBody');if(!body||body.querySelector('#nk26pa'))return;
  const d=document.createElement('div');d.id='nk26pa';d.innerHTML=nk26HTML(natOf(P).id);body.append(d);
  d.querySelectorAll('[data-nk26]').forEach(b=>b.onclick=()=>nk26Act(b.dataset.nk26));}catch(e){console.warn('v26c nuclear',e);}}
(function(){if(typeof renderView!=='function')return;const _rv=renderView;renderView=function(...a){const r=_rv.apply(this,a);nk26Put();return r;};})();
(function(){if(typeof showArmies!=='function')return;const _sa=showArmies;showArmies=function(...a){const r=_sa.apply(this,a);nk26Put();return r;};})();
