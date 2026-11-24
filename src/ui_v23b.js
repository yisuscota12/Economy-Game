/* ===================== v2.3b: fase 5 de la ruta 9d (naturaleza y recursos), parte 2 — interfaz =====================
   En la pestaña 🌿 Naturaleza de la provincia: 🦋 Flora y fauna (5–7 especies del bioma con su ícono del set de la casa —propios,
   en herramientas/iconos/propios—, su estado y la causa si están en riesgo) y 🏗️ Proyectos de agua y alimentos (nivel, obra en
   curso, costo, tiempo, lo que aportan hoy y botón Construir). En País → 🌿 Naturaleza: proyectos del país y especies en riesgo.
   Modo de mapa 🌿: los ríos principales (ya dibujados en el relieve) se resaltan en azul (WebGL en map.js con uRiv; en el modo
   ligero, este envoltorio de composeLite). Los lagos ya se ven como agua en todos los modos (huecos del mapa de identificadores).
   Textos traducidos a los 13 idiomas (ver ui_v23a.js). */

Object.assign(NT_CL,{proy:'Proyectos de agua (desalinización, presas, riego)',presa:'Presa que corta el río',riego:'Agua desviada para riego',desal:'Salmuera de la desalinización'});
MODES_MAP.nat.n='Salud del ecosistema (ríos en azul)';
const NT_SPCOL=['#3ccf8e','var(--gold)','var(--red)'];
/* ---------- 🦋 flora y fauna ---------- */
function ntSpHTML(rid){const L=ntSpecies(rid);if(!L||!L.length)return '';const o=ntProv(rid);const nr=L.filter(s=>s.st).length;
  return `<div class="sect">🦋 <span>Flora y fauna</span></div><div class="ntsp">${L.map(s=>`<div class="ntsi"><span class="ntse">${s.e}</span><div class="ntsn"><b>${s.n}</b><small>${s.t==='a'?'Animal':'Planta'} · <span>${['','muy sensible','sensible','resistente'][s.s]}</span></small>${s.st?`<small class="ntsc">⚠️ <span>${s.c}</span></small>`:''}</div><span class="ntss" style="color:${NT_SPCOL[s.st]};border-color:${NT_SPCOL[s.st]}">${NT_SPS[s.st]}</span></div>`).join('')}</div>
  <div class="hint"><span>Las especies dependen de la salud del ecosistema (${o.eco.v}/100).</span> <span>${nr?`${nr} de ${L.length} están en riesgo: la causa es lo que más le resta al ecosistema entre sus amenazas.`:'Ninguna está en riesgo por ahora.'}</span> <span>No cambian la economía.</span></div>`;}
/* ---------- 🏗️ proyectos de agua y alimentos ---------- */
function ntPjHTML(rid){const x=G.regions[rid];const mine=x.o===natOf(P).id;const o=ntProv(rid);const N=ntNat(x.o);const rule=playerRules(x.o);
  let h=`<div class="sect">🏗️ <span>Proyectos de agua y alimentos</span></div>`;
  if(o.pjW||o.pjF||o.pjA){const T=[];if(o.pjW)T.push(`💧 <b>${o.pjW>=0?'+':'−'}${ntKm3(Math.abs(o.pjW))}</b> <span>km³ de agua al año</span> (<b>${o.pjW>=0?'+':'−'}${ntNum(Math.abs(o.pjW)*1e9/o.pop)}</b> <span>m³ por persona</span>)`);
    if(o.pjA)T.push(`🌾 <b>+${ntNum(o.pjA)}</b> <span>km² cultivables</span>`);if(o.pjF)T.push(`🍽️ <span>alimentos para</span> <b>+${fmtPop(o.pjF*N.fk)}</b> <span>personas</span>`);
    h+=`<div class="ntpt"><span>Hoy aportan:</span> ${T.join(' · ')}</div>`;}
  h+=`<div class="ntpjs">`+NT_PJK.map(k=>{const J=NT_PJ[k],e=ntPjOf(rid,k),lv=e?e.l:0,left=ntPjLeft(rid,k);const c=ntPjCan(rid,k);let pay=null,why='';
    if(mine){pay=ntPjPay(rid,k);if(!c.ok)why=c.why;else if(!pay.ok)why=pay.why;}else why=c.ok?'Solo puedes construir en provincias de tu país.':c.why;
    const cost=pay&&pay.by==='p'?fmt(pay.loc):fmtN(ntPjCost(rid,k));const who=e&&e.b?{g:'tu gobierno',p:'tú',ia:'el gobierno'}[e.b]:'';
    return `<div class="ntpj"><div class="ntph"><span class="ntpi">${J.ic}</span><div><b>${J.n}</b><small><span>Nivel</span> ${lv}/${J.max}${left?` · 🏗️ <span>en construcción: faltan</span> ${left} <span>meses</span>`:''}${who&&(lv||left)?` · <span>Pagado por:</span> ${who}`:''}</small></div>${mine?`<button class="btn" data-ntpj="${k}"${why?' disabled':''}>Construir</button>`:''}</div>
     <div class="ntpd">${J.d}</div><div class="ntpc"><span>Costo</span> <b>${cost}</b>${pay&&pay.by==='p'?' <span>(de tu dinero)</span>':pay&&pay.by==='g'?' <span>(del tesoro)</span>':''} · <span>Tarda</span> <b>${J.m} <span>meses</span></b>${why&&!left?` · <span class="ntpw">${why}</span>`:''}</div></div>`;}).join('')+`</div>`;
  if(mine)h+=`<div class="hint">${rule?`<span>Gobiernas: las obras se pagan con el tesoro nacional (${fmtN(G.nations[x.o].treas||0)}).</span>`:'<span>No gobiernas: puedes pagarlas tú como inversión privada; rinden cada año (agua y cosechas que se venden). La presa solo la construye el gobierno.</span>'} <span>Los efectos son medidos y pequeños: suben el agua y la tierra cultivable de la provincia, y con eso un poco la autosuficiencia del país.</span></div>`;
  return h;}
{const _h=ntPlaceHTML;ntPlaceHTML=function(rid){let h=_h(rid);try{const x=G.regions[rid];if(!x||!h)return h;const add=ntSpHTML(rid)+ntPjHTML(rid);
  const mk=`<div class="sect">${flag(x.o,14)}`;const i=h.indexOf(mk);h=i>=0?h.slice(0,i)+add+h.slice(i):h.replace(/<\/div>$/,add+'</div>');}catch(e){console.warn('v23b provincia',e);}return h;};}
{const _p=ntPlace;ntPlace=function(rid){_p(rid);try{const B=$('sheetIn');if(!B)return;B.querySelectorAll('[data-ntpj]').forEach(b=>b.onclick=()=>{const k=b.dataset.ntpj,J=NT_PJ[k];const p=ntPjPay(rid,k);
  askText(`${J.ic} ¿${J.n} en ${RG[rid].nm}? <small>${p.by==='p'?fmt(p.loc):fmtN(p.usd)} · ${J.m} meses</small>`,null,()=>{const m=ntPjBuild(rid,k);log(m,'good');try{sfx('coin');}catch(e){}save();render();PL.tab='na';showPlace(rid,'na');},'Construir');});
  ntLrn('Desalinización','Riego','Especie en riesgo');}catch(e){console.warn('v23b botones',e);}};}
/* ---------- País → 🌿 Naturaleza ---------- */
function ntNatPjHTML(nid){const L=[];regionsOf(nid).forEach(r=>{const R=G.np&&G.np[r];if(!R)return;NT_PJK.forEach(k=>{const e=R[k];if(e&&(e.l||e.q))L.push([r,k,e]);});});
  const S=ntSpeciesN(nid);let h='';
  if(L.length){h+=`<div class="sect">🏗️ <span>Proyectos de agua y alimentos</span></div>`+L.sort((a,b)=>(b[2].q?1:0)-(a[2].q?1:0)).slice(0,14).map(([r,k,e])=>`<button class="item" data-ntr="${r}"><span><div class="t">${NT_PJ[k].ic} ${NT_PJ[k].n}${NT_PJ[k].max>1?' · '+e.l+'/'+NT_PJ[k].max:''}</div><div class="s">${RG[r].nm}${e.q?` · 🏗️ <span>faltan</span> ${ntPjLeft(r,k)} <span>meses</span>`:''}</div></span>›</button>`).join('');
    const N=ntNat(nid);if(N.pjW||N.pjF)h+=`<div class="hint"><span>En total aportan</span> <b>${N.pjW>=0?'+':'−'}${ntKm3(Math.abs(N.pjW))}</b> <span>km³ de agua al año y alimentos para</span> <b>${fmtPop(N.pjF*N.fk)}</b> <span>personas.</span></div>`;}
  else h+=`<div class="sect">🏗️ <span>Proyectos de agua y alimentos</span></div><div class="hint"><span>Tu país no tiene proyectos. Ábrelos desde la pestaña 🌿 Naturaleza de cada provincia.</span></div>`;
  if(S.L.length)h+=`<div class="sect">🦋 <span>Especies en riesgo</span></div><div class="hint"><span>${S.risk} de ${S.tot} poblaciones de plantas y animales en tus provincias están en riesgo.</span></div>`+
    S.L.slice(0,8).map(a=>`<div class="ntsi"><span class="ntse">${a.e}</span><div class="ntsn"><b>${a.n}</b><small><span>En riesgo en</span> ${a.k} <span>provincias</span>${a.p?` (<span>en peligro en</span> ${a.p})`:''}</small><small class="ntsc">⚠️ <span>${a.cc}</span></small></div></div>`).join('');
  return h;}
{const _h=ntNatHTML;ntNatHTML=function(nid){let h=_h(nid);try{const add=ntNatPjHTML(nid);const i=h.lastIndexOf('<div class="hint">Toca una provincia');h=i>=0?h.slice(0,i)+add+h.slice(i):h+add;}catch(e){console.warn('v23b país',e);}return h;};}
/* ---------- mapa ligero (Canvas 2D): ríos en azul en el modo 🌿 ----------
   El relieve trae los ríos de Natural Earth (escala ≤ 5) en azul; a media resolución se reconocen por el tono (b > r + 35). */
{const _cl=composeLite;composeLite=function(){_cl();try{if(MMODE!=='nat'||!LITE.img||!LITE.rel)return;if(!LITE.riv){const {w,h,ids,rel}=LITE;const a=[];
  for(let i=0;i<w*h;i++){if(!ids[i])continue;const j=i*4,r=rel[j],g=rel[j+1],b=rel[j+2];if(b>r+35&&b>g+8&&b>90)a.push(i);}LITE.riv=Int32Array.from(a);}
  const o=LITE.img.data;for(let n=0;n<LITE.riv.length;n++){const j=LITE.riv[n]*4;o[j]=64;o[j+1]=153;o[j+2]=242;}LITE.off.getContext('2d').putImageData(LITE.img,0,0);}catch(e){}};}
/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
(function(){const c=GLC.indexOf('Naturaleza y recursos');GLOS.push(
 ['Desalinización','Quitar la sal al agua de mar para volverla potable. Da agua aunque no llueva, pero gasta mucha energía y deja salmuera que daña la costa.',['desalinización','desalinizadora'],c],
 ['Riego','Llevar agua a los cultivos con canales, pozos o goteo. Permite sembrar donde llueve poco y cosechar más, pero usa gran parte del agua dulce.',['riego'],c],
 ['Especie en riesgo','Planta o animal cuya población baja tanto que podría desaparecer de un lugar. La causa más común es la pérdida de su hábitat.',['especie en riesgo','especies en riesgo','en peligro'],c]);})();
(function(){const H=[
 ['Flora y fauna','🦋 Flora y fauna','Cada bioma tiene sus plantas y animales. Cuando la naturaleza se degrada —ciudades, cultivos, industria, guerra, sequía o presas— las especies más sensibles son las primeras en desaparecer.','Cada especie tiene un umbral: la salud base del bioma menos 10 (muy sensible), 20 (sensible) o 32 (resistente). Si el ecosistema de la provincia baja de su umbral queda «En riesgo»; 12 puntos más abajo, «En peligro». La causa es la que más le resta al ecosistema entre sus amenazas. No cambian la economía.'],
 ['Proyectos de agua y alimentos','🏗️ Proyectos de agua y alimentos','Los países con poca agua o poca tierra la producen: desalinizan agua de mar (Israel, Arabia Saudita), riegan (India, Egipto), cultivan en invernaderos (Países Bajos) o guardan agua en presas.','Desalinizadora (costa): +35 m³ por persona al año por nivel, hasta 3. Riego: +12 % de tierra cultivable y 10–20 % más cosechas por nivel, usa 4 % del agua, hasta 2. Invernaderos: alimentos para 3 % más de la población por nivel, aun con sequía, hasta 3. Presa (río o cerros): +8 % de agua y la sequía le quita la mitad, +4 % de tierra; baja 6 la salud del ecosistema. Costo: PIB de la provincia × 0.6–2 % (más en cada nivel). Los gobiernos de la IA las construyen cuando su agua o sus alimentos están bajos.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const g=GUIA.find(x=>/^🌿 Naturaleza y recursos/.test(x[0]));if(g)g[1]=g[1].replace('</ul>',`<li><b>🦋 Flora y fauna:</b> en la ficha de cada provincia ves sus plantas y animales; si el ecosistema se degrada, verás cuáles están en riesgo y por qué.</li>
<li><b>🏗️ Proyectos:</b> desalinizadoras, riego, invernaderos y presas suben el agua y los alimentos de una provincia. Tardan de 12 a 36 meses. Si gobiernas los paga el tesoro; si no, puedes invertir tú y te rinden cada año.</li>
<li><b>🗺️ Ríos:</b> en el modo 🌿 del mapa los ríos principales se ven en azul.</li></ul>`);})();
SABIAS.push(
 ['Israel obtiene cerca de 70 % de su agua potable de plantas desalinizadoras en la costa del Mediterráneo.','Autoridad del Agua de Israel','nat'],
 ['Los Países Bajos son el segundo exportador de alimentos del mundo por valor, gracias en buena parte a sus invernaderos.','FAO; Universidad de Wageningen','nat'],
 ['Cerca de un millón de especies de plantas y animales están en peligro de extinción, sobre todo por la pérdida de su hábitat.','IPBES (2019)','nat']);

(function(){const st=document.createElement('style');st.id='v23bcss';st.textContent=`
.ntsp{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:4px 0}
.ntsi{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:12px;background:var(--card2);padding:6px 8px;min-width:0}
.ntse{font-size:24px;line-height:1;flex:0 0 auto}.ntsn{flex:1;min-width:0;display:flex;flex-direction:column}.ntsn b{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ntsn small{color:var(--mut);font-size:11px}.ntsn .ntsc{color:#f08a4b}
.ntss{font-size:10.5px;font-weight:700;border:1px solid;border-radius:9px;padding:0 6px;white-space:nowrap;flex:0 0 auto}
.ntpjs{display:flex;flex-direction:column;gap:6px;margin:4px 0}
.ntpj{border:1px solid var(--line);border-radius:12px;background:var(--card2);padding:8px 10px}
.ntph{display:flex;align-items:center;gap:8px}.ntph>div{flex:1;display:flex;flex-direction:column;min-width:0}.ntph small{color:var(--mut);font-size:11.5px}
.ntpi{font-size:22px;line-height:1}.ntph .btn{min-height:44px;padding:0 12px;flex:0 0 auto}.ntph .btn:disabled{opacity:.45}
.ntpd{font-size:12px;color:var(--mut);margin:4px 0 2px}.ntpc{font-size:12px}.ntpw{color:var(--red)}
.ntpt{font-size:12.5px;border:1px dashed var(--line);border-radius:10px;padding:6px 8px;margin:4px 0}
@media (max-width:360px){.ntsp{grid-template-columns:1fr}}
`;document.head.appendChild(st);})();
