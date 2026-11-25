/* ===== v2.5i — interfaz: 🏢 agencia de comercio y 🛃 aduana en «Obras» (misma pantalla que ✈️ aeropuerto de la v2.4c),
   más una línea con el efecto de las obras de esta provincia en los envíos (motor en engine_v25i.js). Textos en español. */
function lgObBuildDo(rid,k){const n=natOf(P);const x=G.regions[rid];if(!P.ruler||!x||x.o!==n.id)return 'Solo quien gobierna construye en provincias de su país.';
  const ok=lgObCan(rid,k);if(!ok.ok)return ok.why;const c=bldCost(rid,k);if((n.treas||0)<c)return `El tesoro no alcanza (${fmtN(c)}).`;
  n.treas-=c;build(rid,k);P.built=(P.built||0)+1;try{sfx('coin');}catch(e){}return `Construyes ${BLD[k].ic} ${BLD[k].n.toLowerCase()} en ${RG[rid].nm}: ahora es de nivel ${bl(rid,k)}.`;}
function lgObOpt(rid){const B=$('sheetIn');if(!B||B.querySelector('#lgob'))return;const n=natOf(P);const x=G.regions[rid];if(!x)return;
  const d=document.createElement('div');d.id='lgob';let h='';
  ['agcom','aduana'].forEach(k=>{const b=BLD[k],l=bl(rid,k),ok=lgObCan(rid,k),c=bldCost(rid,k);const can=ok.ok&&P.ruler&&x.o===n.id&&(n.treas||0)>=c;
    h+=`<button class="item" data-lgob="${k}" ${can?'':'disabled'}><span><div class="t">${b.ic} <span>${b.n}</span> ${l?`(<span>nivel</span> ${l} → ${l+1})`:''}</div><div class="s">${ok.ok?`${b.d} · ${fmtN(c)}`:ok.why}</div></span></button>`;});
  // efecto de las obras de esta provincia en un envío que sale o llega aquí (solo esta punta)
  const pc=v=>(v>=0?'+':'−')+Math.abs(Math.round(v*1000)/10)+' %';const ag=bl(rid,'agcom'),ad=bl(rid,'aduana'),pu=bl(rid,'puerto'),ae=bl(rid,'aero');const L=[];
  if(ag)L.push(`🏢 <span>flete</span> ${pc(-.015*ag)}, <span>retrasos</span> ${pc(-.025*ag)}`);
  if(ad)L.push(`🛃 <span>internacionales: flete</span> ${pc(.01*ad)}, <span>retrasos</span> ${pc(.02*ad)}, <span>pérdidas</span> ${pc(-.08*ad)}`);
  if(pu)L.push(`⚓ <span>marítimos: flete</span> ${pc(-.02*pu)}, <span>retrasos</span> ${pc(-.03*pu)}`);
  if(ae)L.push(`✈️ <span>aéreos: flete</span> ${pc(-.015*ae)}, <span>retrasos</span> ${pc(-.025*ae)}`);
  h+=`<div class="hint">📦 <span>Envíos que salen o llegan aquí</span>: ${L.length?L.join(' · '):'<span>sin obras de logística todavía (agencia, aduana, puerto o aeropuerto construido por ti)</span>'}</div>`;
  d.innerHTML=h;B.append(d);
  d.querySelectorAll('[data-lgob]').forEach(el=>el.onclick=()=>{const t=lgObBuildDo(rid,el.dataset.lgob);log(t,'good');save();render();showBuild(rid);});}
(function(){if(typeof showBuild!=='function'||typeof lgObCan!=='function')return;
  const _sb=showBuild;showBuild=function(rid,...a){const r=_sb(rid,...a);try{lgObOpt(rid);}catch(e){console.warn('v25i obras',e);}return r;};})();
