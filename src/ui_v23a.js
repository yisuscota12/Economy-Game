/* ===================== v2.3a: fase 5 de la ruta 9d (naturaleza y recursos), parte 1 — interfaz =====================
   🌿 Naturaleza: pestaña en la ficha de la provincia (bioma, medidores de ecosistema, agua dulce y seguridad alimentaria con sus
   causas, tierra cultivable, cosechas, riesgo de sequía, cultivos y recursos, resumen del país con su escasez de recursos) y en la
   vista País (medidores, efectos en los sectores, escasez de cada recurso, provincias con sequía y con menos agua); línea en la
   ficha de abajo del mapa; modo de mapa 🌿 (salud del ecosistema); glosario (+6, categoría nueva), ⓘ, Guía y «¿Sabías que…?».
   Textos solo en español por ahora (pendiente: traducciones con el flujo de herramientas/i18n, ver CONTEXTO_IA.md). */

const NT_CL={dens:'Población por km²',ind:'Industria y ciudades',agro:'Tierra convertida en cultivos',rio:'Río grande',reg:'Desarrollo y regulación ambiental',
  ocup:'Ocupación militar',guerra:'Guerra',sequia:'Sequía este año',sequia2:'Sequía en la provincia',clima:'Lluvia y clima',pais:'Agua del resto del país',
  pob:'Crecimiento de la población',infra:'Presas, pozos y redes de agua',auto:'Tierra cultivable por persona',imp:'Capacidad de importar alimentos',
  precio:'Precio mundial de los granos',local:'Cosechas de la provincia'};
HZ_CLX.nat=NT_CL;
Object.assign(SH_CL,{nali:'Alimentos importados y su precio',nseq:'Sequía (contra un año normal)',nagua:'Menos agua por persona',nene:'Energía importada y su precio'});
const NT_RCL=['var(--red)','#f08a4b','var(--gold)','#3ccf8e'];
const ntNum=v=>Math.round(v).toLocaleString(typeof LOC!=='undefined'&&LOC||'es-MX');
const ntKm3=v=>v>=100?ntNum(v):v>=1?v.toFixed(1):v.toFixed(2);
const ntPct=v=>(v*100).toFixed(v<.1?1:0)+' %';
function ntLrn(...k){try{v21bLrn(...k);}catch(e){}}
function ntPill(st){return `<span class="ntst" style="color:${NT_RCL[st]};border-color:${NT_RCL[st]}">${NT_RST[st]}</span>`;}
function ntResRows(nid,max){const L=ntRes(nid).filter(e=>e.pr>0||e.need>0).sort((a,b)=>b.need*resVal(b.k)-a.need*resVal(a.k)).slice(0,max||20);
  return `<div class="ntrs">${L.map(e=>{const w=Math.min(100,e.r*50);return `<div class="ntr"><span class="ntrn">${RES0[e.k][1]} <span>${RES0[e.k][0]}</span></span>${ntPill(e.st)}<span class="ntrb"><i style="width:${w}%;background:${NT_RCL[e.st]}"></i><u></u></span><small>${e.r>=10?'×'+Math.round(e.r):Math.round(e.r*100)+' %'}</small></div>`;}).join('')}</div>
   <div class="hint">La barra compara lo que produce con lo que consume (la raya marca el 100 %). El consumo se estima con su peso en la economía y en la población del mundo.</div>`;}
/* ---------- 🌿 en la ficha de la provincia ---------- */
function ntPlaceHTML(rid){ntFresh();const x=G.regions[rid],o=ntProv(rid);if(!o)return '';const n=G.nations[x.o];const N=ntNat(x.o);const B=NT_BIO[o.k];
  const E=o.eco,W=ntWater(rid),F=ntFood(rid);const fed=o.fed*N.fk;const ex=!!CFG.pexp;const pr=ntExpD(rid)/.675/(o.b.riv?.7:1);
  let h=`<div id="ntpl"><div class="ntbio"><span class="ntbi">${B[1]}</span><div><b>${B[0]}</b><small>${terrName(rid)} · ${ntNum(o.b.a)} km²</small></div>${o.sq?`<span class="ntsq">🌵 <span>Sequía este año</span></span>`:''}</div>`;
  h+=hzMeter('nte'+rid,'🌿','Salud del ecosistema',E,'nat',{note:'Qué tan conservada está la naturaleza: baja con la población, la industria, los cultivos, la guerra y la sequía.'});
  h+=hzMeter('ntw'+rid,'💧','Agua dulce',W,'nat',{sub:`<b>${ntNum(o.wpc)}</b> <span>m³ por persona al año en la provincia</span> · <b>${ntKm3(o.W)}</b> <span>km³ se renuevan</span>`,note:'Con menos de 1,700 m³ por persona al año hay estrés hídrico; con menos de 1,000, escasez.'});
  h+=hzMeter('ntf'+rid,'🌾','Seguridad alimentaria',F,'nat',{sub:`<span>Sus cosechas alimentan a</span> <b>${fmtPop(fed)}</b> <span>personas</span> (<b>${ntPct(fed/o.pop)}</b> <span>de su población</span>)`});
  h+=v19Tiles([['Tierra cultivable',ntNum(o.b.ar)+' km²',ntPct(o.b.fr)+' de la superficie'],['Agua por persona',ntNum(o.wpc)+' m³','al año'],
    ['Alimentos',fmtPop(fed),'personas alimentadas'],['Riesgo de sequía',ntPct(pr),'por año']],2);
  const d=typeof DEP!=='undefined'&&DEP?DEP[rid]:null;const ag=d?Object.keys(d).filter(k=>RES0[k][5]==='agr'):[];const mi=d?Object.keys(d).filter(k=>RES0[k][5]!=='agr'):[];
  if(ag.length)h+=`<div class="sect">🌾 <span>Cultivos principales</span></div><div class="plr">${ag.map(k=>`<span class="pill">${RES0[k][1]} <span>${RES0[k][0]}</span> · ${resQty(k,d[k]*(1-.45*o.sq))}</span>`).join(' ')}</div>`;
  if(mi.length)h+=`<div class="sect">⛏️ <span>Recursos del subsuelo</span></div><div class="plr">${mi.map(k=>`<span class="pill">${RES0[k][1]} <span>${RES0[k][0]}</span></span>`).join(' ')}</div>`;
  h+=`<div class="sect">${flag(n.id,14)} <span>${n.name}</span></div><div class="hz2">`+hzMeter('ntxe'+n.id,'🌿','Ecosistema',ntEcoN(n.id),'nat')+hzMeter('ntxw'+n.id,'💧','Agua',ntWaterN(n.id),'nat')+hzMeter('ntxf'+n.id,'🌾','Alimentos',ntFoodN(n.id),'nat')+
    v19Tile('Agua por persona',ntNum(N.wpc)+' m³')+`</div>`;
  h+=`<div class="sect">⚖️ <span>Escasez de recursos de ${n.name}</span></div>`+ntResRows(n.id,8);
  if(ex)h+=`<div class="sect">¿Qué significa?</div><div class="plex">`+[['Bioma','Gran región natural con un clima, una vegetación y una fauna parecidos: selva, sabana, desierto, taiga…','Define cuánta lluvia escurre, cuánta tierra se puede cultivar y qué tan seguido hay sequías.'],
    ['Agua dulce renovable','El agua de lluvia que escurre por ríos y se filtra a los acuíferos cada año, más la que traen los ríos de aguas arriba.','Con poca agua por persona, la sequía pega más fuerte a las cosechas, los servicios públicos y la felicidad.'],
    ['Seguridad alimentaria','Que la población tenga suficientes alimentos: produciéndolos o pudiendo comprarlos fuera.','Un país que importa mucha comida sufre cuando los granos se encarecen en el mundo.']].map(e=>`<div class="ple"><b>${e[0]}</b><span>${e[1]}</span> <span>${e[2]}</span></div>`).join('')+`</div>`;
  if(x.o===natOf(P).id)h+=`<div class="pla"><button data-ntv="1"><i>🌿</i><span>Naturaleza de tu país</span></button></div>`;
  return h+`</div>`;}
function ntPlace(rid){const B=$('sheetIn');if(!B)return;const tb=B.querySelector('.pltabs');if(!tb)return;let el=tb.nextSibling;while(el){const nx=el.nextSibling;el.remove();el=nx;}
  tb.insertAdjacentHTML('afterend',ntPlaceHTML(rid));hzBind(B);B.querySelectorAll('[data-ntv]').forEach(x=>x.onclick=()=>{closeSheet();VIEW.tab='nat';CFG.vtab='nat';saveCfg();setView('pa');});
  ntLrn('Bioma','Agua renovable','Seguridad alimentaria');}
function ntTabBtn(rid){const B=$('sheetIn');if(!B)return;const tb=B.querySelector('.pltabs');if(!tb)return;let b=tb.querySelector('[data-plt="na"]');
  if(!b){b=document.createElement('button');b.dataset.plt='na';b.innerHTML='🌿 <span>Naturaleza</span>';b.onclick=()=>{PL.tab='na';PL.city=null;showPlace(rid);};tb.appendChild(b);}
  tb.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.plt===PL.tab));}
{const _sp=showPlace;showPlace=function(rid,tab){const want=tab||PL.tab;let r;
  if(want==='na'){r=_sp(rid,'pr');PL.tab='na';try{ntPlace(PL.rid);}catch(e){console.warn('v23a provincia',e);}}else r=_sp(rid,tab);
  try{ntTabBtn(PL.rid);}catch(e){}return r;};}
/* ---------- 🌿 en la vista País ---------- */
NTABS.push(['nat','🌿 Naturaleza']);
if(typeof SB_TAB!=='undefined')SB_TAB.nat=['nat'];
function ntNatHTML(nid){ntFresh();const n=G.nations[nid];const N=ntNat(nid);if(!N)return '';const W=ntWaterN(nid),F=ntFoodN(nid),E=ntEcoN(nid);
  let h=`<div id="ntpa"><div class="sect">🌿 <span>Naturaleza y recursos de ${n.name}</span></div>`+
   v19Tiles([['Agua por persona',ntNum(N.wpc)+' m³','al año'],['Autosuficiencia alimentaria',ntPct(N.ss)],['Tierra cultivable',ntPct(N.ar/Math.max(1,N.area)),ntNum(N.ar)+' km²'],
     ['Provincias con sequía',`${N.nd} / ${N.nr}`,N.nd?ntPct(N.dsh)+' de la población':'']],2)+
   hzMeter('npe'+nid,'🌿','Salud del ecosistema',E,'nat',{note:'Promedio de sus provincias según su superficie.'})+
   hzMeter('npw'+nid,'💧','Agua dulce',W,'nat',{sub:`<b>${ntKm3(N.W)}</b> <span>km³ de agua renovable al año</span> · <b>${ntNum(N.wpc)}</b> <span>m³ por persona</span>`,note:'Umbral de Falkenmark: menos de 1,700 m³ por persona al año es estrés hídrico; menos de 1,000, escasez; menos de 500, escasez absoluta.'})+
   hzMeter('npf'+nid,'🌾','Seguridad alimentaria',F,'nat',{sub:`<span>Produce alimentos para</span> <b>${fmtPop(N.fed)}</b> <span>personas</span> (<b>${ntPct(N.ss)}</b> <span>de su población</span>)`});
  try{const S=['cons','serv','ind'].map(k=>[k,shParts(n,k).filter(([c])=>/^n(ali|seq|agua|ene)$/.test(c))]).filter(e=>e[1].length);
    if(S.length)h+=`<div class="sect">🏭 <span>Lo que la naturaleza mueve en la economía</span></div>`+S.map(([k,L])=>`<div class="v21sr v21sx"><div class="h"><span>${SECT[k][0]}</span><span>${shBar(shOf(nid,k))} <b>${Math.round(shOf(nid,k))}</b></span></div><div class="v21cs">${L.map(([c,v])=>`<span class="v21cz"><span>${SH_CL[c]}</span> <b class="${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('')}</div></div>`).join('');}catch(e){}
  h+=`<div class="sect">⚖️ <span>Escasez de recursos</span></div>`+ntResRows(nid);
  const rs=regionsOf(nid).map(r=>[r,ntProv(r)]).filter(e=>e[1]);
  if(N.dr.length)h+=`<div class="sect">🌵 <span>Provincias con sequía este año</span></div>`+N.dr.slice(0,12).map(r=>`<button class="item" data-ntr="${r}"><span><div class="t">${RG[r].nm}</div><div class="s"><span>Severidad</span> <b>${Math.round(ntProv(r).sq*100)} %</b></div></span>›</button>`).join('');
  const dry=rs.slice().sort((a,b)=>a[1].wpc-b[1].wpc).slice(0,5);
  if(rs.length>1)h+=`<div class="sect">💧 <span>Provincias con menos agua por persona</span></div>`+dry.map(([r,o])=>`<button class="item" data-ntr="${r}"><span><div class="t">${NT_BIO[o.k][1]} ${RG[r].nm}</div><div class="s"><b>${ntNum(o.wpc)}</b> <span>m³ por persona</span> · <span>ecosistema</span> <b>${o.eco.v}</b></div></span>›</button>`).join('');
  return h+`<div class="hint">Toca una provincia en el mapa y abre la pestaña 🌿 Naturaleza de su ficha para ver el detalle. El modo de mapa 🌿 pinta la salud del ecosistema en todo el mundo.</div></div>`;}
{const _rv=renderView;renderView=function(...a){const on=P&&G&&VIEW.v==='pa'&&VIEW.tab==='nat';if(on){try{$('natBody').innerHTML=ntNatHTML(natOf(P).id);}catch(e){console.warn('v23a país',e);}}
  const r=_rv(...a);if(on){try{const body=$('natBody');hzBind(body);body.querySelectorAll('[data-ntr]').forEach(x=>x.onclick=()=>{PL.tab='na';showPlace(x.dataset.ntr,'na');});ntLrn('Estrés hídrico','Seguridad alimentaria');}catch(e){}}return r;};}
/* ---------- ficha de abajo del mapa ---------- */
{const _rs=renderSel;renderSel=function(){_rs();try{if(!G||!G.sel||!RG[G.sel]||!G.regions[G.sel])return;const box=$('selInfo');if(!box||box.querySelector('.v23m'))return;const o=ntProv(G.sel);if(!o)return;
  const W=ntWater(G.sel);const h=`<div class="mem v23m">${NT_BIO[o.k][1]} <span>${NT_BIO[o.k][0]}</span> · <span>Agua</span> <b style="color:${shCol(W.v)}">${W.v}</b> · <span>Ecosistema</span> <b style="color:${shCol(o.eco.v)}">${o.eco.v}</b>${o.sq?' · 🌵 <span>Sequía</span>':''}</div>`;
  const m=box.querySelector('.v21m')||[...box.querySelectorAll('.mem')].find(x=>/Provincia:/.test(x.textContent));if(m)m.insertAdjacentHTML('afterend',h);}catch(e){console.warn('v23a ficha',e);}};}
/* ---------- modo de mapa 🌿 ---------- */
MODES_MAP.nat={n:'Salud del ecosistema',ic:'🌿',mix:.72,lo:'degradado',hi:'sano'};
(function(){const mm=document.querySelector('.mmodes');if(!mm)return;const x=document.createElement('button');x.dataset.mm='nat';x.title='Salud del ecosistema';x.textContent='🌿';x.onclick=e=>{e.stopPropagation();setMapMode('nat');};mm.appendChild(x);})();
{const _pc=provColor;provColor=function(id){if(MMODE!=='nat'||!G)return _pc(id);const x=G.regions[id];if(!x||!G.nations[x.o]||!G.nations[x.o].alive)return [58,63,71];const o=ntProv(id);return o?ramp(clamp((o.eco.v-20)/60,0,1)):[58,63,71];};}
/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
GLC.push('Naturaleza y recursos');
(function(){const c=GLC.length-1;GLOS.push(
 ['Bioma','Gran región natural con clima, plantas y animales parecidos: selva, sabana, desierto, estepa, bosque, taiga, tundra o montaña.',['bioma'],c],
 ['Agua renovable','Agua dulce que la lluvia repone cada año en ríos y acuíferos. Se mide en metros cúbicos por persona al año.',['agua renovable'],c],
 ['Estrés hídrico','Cuando hay menos de 1,700 m³ de agua renovable por persona al año. Bajo 1,000 es escasez y bajo 500, escasez absoluta (umbral de Falkenmark).',['estrés hídrico'],c],
 ['Tierra cultivable','Parte del territorio que se puede sembrar. Depende del clima, del relieve y del agua, y crece con el riego.',['tierra cultivable'],c],
 ['Seguridad alimentaria','Que toda la población tenga alimentos suficientes, ya sea porque los produce o porque puede comprarlos a otros países.',['seguridad alimentaria'],c],
 ['Sequía','Un año con mucha menos lluvia de lo normal. Reduce las cosechas y el agua disponible, y pega más a los países que dependen del campo.',['sequía'],c]);})();
(function(){const H=[
 ['Salud del ecosistema','🌿 Salud del ecosistema','Los ecosistemas se degradan con la población, las ciudades, la industria, la conversión de bosques en cultivos, la guerra y la sequía. Las leyes ambientales y el desarrollo ayudan a conservarlos.','0–100 desde la base del bioma (selva 78, taiga 82, desierto 62…): población por km² (hasta −30), PIB por km² (hasta −14), tierra cultivada (hasta −10), río grande +3, desarrollo (−4 a +6), ocupación −12 o guerra −4 y sequía hasta −10.'],
 ['Agua dulce','💧 Agua dulce','Cada lugar recibe agua con la lluvia y con los ríos que bajan de otras zonas. Con más gente y la misma agua, toca menos por persona.','0–100 con 1,700 m³ por persona al año = 50 (cada vez que el agua por persona se multiplica por 10, +56). En la provincia pesa 40 % su propia agua y 60 % la del país. Suman las presas y redes (desarrollo) y restan la sequía (hasta −12) y el crecimiento de la población. Una sequía también baja la salud de los Servicios públicos.'],
 ['Seguridad alimentaria','🌾 Seguridad alimentaria','Un país puede alimentarse produciendo o comprando fuera. Depender de importaciones es riesgoso cuando los granos se encarecen o hay prohibiciones de exportar.','0–100: autosuficiencia (produce lo que come = 60, el doble = 95), capacidad de importar según su riqueza, precio mundial de los granos contra su tendencia, sequía y guerra. Si importa comida y los granos suben, baja la salud de Consumo básico y la felicidad.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🌿 Naturaleza y recursos',`<b>Cada provincia tiene su naturaleza: un bioma, agua, tierra para cultivar y años buenos y malos.</b>
<ul><li><b>🌿 Ficha:</b> toca una provincia y abre la pestaña 🌿 Naturaleza: su bioma, la salud del ecosistema, el agua dulce, la seguridad alimentaria (con lo que las sube y las baja), cultivos y recursos, y el resumen del país.</li>
<li><b>🏛️ País → 🌿 Naturaleza:</b> agua por persona, autosuficiencia alimentaria, escasez de cada recurso (petróleo, metales, granos…), provincias con sequía y las que tienen menos agua.</li>
<li><b>🌵 Sequías:</b> cada año algunas provincias tienen sequía: bajan sus cosechas y su PIB (se recupera casi todo al año siguiente), su felicidad y la salud de Consumo básico y Servicios públicos.</li>
<li><b>⚖️ Escasez:</b> si tu país importa alimentos o energía, sufre cuando suben los granos o el petróleo; si los exporta, gana.</li>
<li><b>🗺️ Mapa:</b> el modo 🌿 pinta la salud del ecosistema en todo el mundo.</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🩺 Salud de la economía/.test(g[0]));GUIA.splice(gi>=0?gi+1:GUIA.length,0,T);})();
SABIAS.push(
 ['La agricultura usa cerca del 70 % del agua dulce que se extrae en el mundo.','FAO, AQUASTAT','nat'],
 ['Un país con menos de 1,700 m³ de agua renovable por persona al año vive estrés hídrico. Bajo 1,000 m³ hay escasez y bajo 500, escasez absoluta.','Falkenmark (1989); ONU-Agua','nat'],
 ['Solo cerca del 11 % de la superficie terrestre del planeta es tierra cultivable.','FAO; Banco Mundial','nat'],
 ['En 2022, varios países prohibieron exportar alimentos tras la invasión de Ucrania, uno de los mayores exportadores de trigo y maíz del mundo.','IFPRI; FAO','nat']);
if(typeof shWrapAll==='function')shWrapAll();

(function(){const st=document.createElement('style');st.id='v23acss';st.textContent=`
.ntbio{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:12px;background:var(--card2);padding:8px 10px;margin:4px 0 6px}
.ntbio>div{flex:1;display:flex;flex-direction:column}.ntbio small{color:var(--mut);font-size:12px}.ntbi{font-size:28px;line-height:1}
.ntsq{font-size:12px;font-weight:700;color:#f08a4b;border:1px solid #f08a4b66;border-radius:10px;padding:2px 8px;white-space:nowrap}
.ntrs{display:flex;flex-direction:column;gap:4px;margin:4px 0}
.ntr{display:grid;grid-template-columns:minmax(0,1.3fr) auto minmax(50px,1fr) 44px;align-items:center;gap:6px;font-size:12.5px}
.ntrn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ntr small{color:var(--mut);text-align:end}
.ntst{font-size:10.5px;font-weight:700;border:1px solid;border-radius:9px;padding:0 6px;white-space:nowrap}
.ntrb{position:relative;height:7px;border-radius:4px;background:var(--line);overflow:hidden}.ntrb i{display:block;height:100%}.ntrb u{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--ink);opacity:.6}
@media (max-width:360px){.ntr{grid-template-columns:minmax(0,1fr) auto 40px}.ntr .ntrb{display:none}}
`;document.head.appendChild(st);})();
