/* ===================== v2.3c: fase 5 de la ruta 9d (naturaleza y recursos), parte 3 — interfaz =====================
   En la pestaña 🌿 Naturaleza de la provincia: 🏭 Contaminación de empresas (cada fuente con lo que resta: tus empresas, empresas
   de la bolsa con sede ahí y minas y pozos; lo que compensa el tratamiento) y 🌳 Conservación (reforestación, área protegida y
   planta de tratamiento con costo, mantenimiento al año, tiempo y botón Construir; efecto en el turismo; avance «💧 Tecnología del
   agua» con su botón si gobiernas). En País → 🌿 Naturaleza: proyectos de conservación del país, provincias más contaminadas, el
   avance y el turismo. Textos solo en español (pendiente: traducciones con el flujo de herramientas/i18n). */

Object.assign(NT_CL,{cont:'Contaminación de empresas (fábricas, minas, pozos)',trat:'Plantas de tratamiento de aguas',refor:'Reforestación',aprot:'Área protegida',
  cvag:'Reforestación y áreas protegidas'});
const ntPm=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(Math.abs(v)<10?1:0);
/* ---------- 🏭 contaminación ---------- */
function ntContHTML(rid){const o=ntProv(rid);const C=o&&o.cont;if(!C||(!C.S.length&&!C.tl))return '';const who={tuya:'Tu empresa',bolsa:'Empresa de bolsa',dep:'Extracción'};
  let h=`<div class="sect">🏭 <span>Contaminación de empresas</span></div>`;
  if(C.S.length)h+=`<div class="ntcl">${C.S.slice(0,8).map(([t,n,v])=>`<div class="ntcr"><span><b>${n}</b><small>${who[t]}</small></span><b class="dn">${ntPm(v)}</b></div>`).join('')}</div>`;
  h+=`<div class="hint"><span>Restan</span> <b>${ntPm(C.raw)}</b> <span>a la salud del ecosistema (según su tamaño frente a la economía de la provincia).</span>${C.tl?` <span>El tratamiento de aguas (nivel ${C.tl}) compensa</span> <b>${ntPm(C.comp)}</b>.`:C.raw<=-1?' <span>Una planta de tratamiento de aguas compensa la mitad por nivel.</span>':''}</div>`;
  return h;}
/* ---------- 🌳 conservación ---------- */
function ntAvHTML(nid,btn){const n=G.nations[nid];ensureEco(n);const has=ntAvHas(nid);const rule=playerRules(nid)&&nid===natOf(P).id;const why=rule&&!has?ntAvCan(n):'';
  return `<div class="ntpj"><div class="ntph"><span class="ntpi">🔬</span><div><b>Avance: tecnología del agua</b><small>${has?`<span>Logrado en</span> ${G.nav[nid]} · <span>proyectos</span> −${Math.round(NT_AVP*100)} %`:`<span>Tecnología civil</span> ${Math.floor(n.tech.c||0)} · <span>llega solo con el nivel</span> ${NT_AVT}`}</small></div>${btn&&rule&&!has?`<button class="btn" data-ntav="1"${why?' disabled':''}>Investigar</button>`:''}</div>
    <div class="ntpd">Membranas, riego por goteo y viveros más baratos: abarata ${Math.round(NT_AVP*100)} % el costo y el mantenimiento de todos los proyectos de agua, alimentos y conservación.</div>${btn&&rule&&!has?`<div class="ntpc"><span>Costo</span> <b>${fmtN(ntAvCost(n))}</b> <span>(del tesoro)</span>${why?` · <span class="ntpw">${why}</span>`:''}</div>`:''}</div>`;}
function ntCvHTML(rid){const x=G.regions[rid];const mine=x.o===natOf(P).id;const rule=playerRules(x.o);
  let h=`<div class="sect">🌳 <span>Conservación</span></div><div class="ntpjs">`+NT_CVK.map(k=>{const J=NT_PJ[k],e=ntPjOf(rid,k),lv=e?e.l:0,left=ntPjLeft(rid,k);const c=ntPjCan(rid,k);let pay=null,why='';
    if(mine){pay=ntPjPay(rid,k);if(!c.ok)why=c.why;else if(!pay.ok)why=pay.why;}else why=c.ok?'Solo puedes construir en provincias de tu país.':c.why;
    const priv=pay&&pay.by==='p';const cost=priv?fmt(pay.loc):fmtN(ntPjCost(rid,k));const up=ntCvUpkeep(rid,k);const upS=priv||(e&&e.b==='p')?fmt(toInt(up,'USD')):fmtN(up);
    const who=e&&e.b?{g:'tu gobierno',p:'tú',ia:'el gobierno'}[e.b]:'';const off=e&&e.l&&e.s===G.year;
    return `<div class="ntpj"><div class="ntph"><span class="ntpi">${J.ic}</span><div><b>${J.n}</b><small><span>Nivel</span> ${lv}/${J.max}${left?` · 🏗️ <span>en construcción: faltan</span> ${left} <span>meses</span>`:''}${who&&(lv||left)?` · <span>Pagado por:</span> ${who}`:''}${off?` · <span class="ntpw">suspendido este año</span>`:''}</small></div>${mine?`<button class="btn" data-ntcv="${k}"${why?' disabled':''}>Construir</button>`:''}</div>
     <div class="ntpd">${J.d}</div><div class="ntpc"><span>Costo</span> <b>${cost}</b> · <span>Mantenimiento</span> <b>${upS}</b> <span>al año</span> · <span>Tarda</span> <b>${J.m} <span>meses</span></b>${why&&!left?` · <span class="ntpw">${why}</span>`:''}</div></div>`;}).join('')+(mine?ntAvHTML(x.o,1):'')+`</div>`;
  const t=ntTourR(rid);h+=`<div class="hint">🏨 <span>Turismo de la provincia:</span> <b class="${t>=1?'up':'dn'}">${t>=1?'+':'−'}${Math.abs(Math.round((t-1)*100))} %</b> <span>de demanda en hoteles, bares y joyerías por su naturaleza y sus áreas protegidas.</span>`+
    (mine?` ${rule?'<span>Si gobiernas, el tesoro paga la obra y el mantenimiento; si no alcanza, el proyecto se suspende ese año.</span>':'<span>Sin gobernar puedes pagar la reforestación y el tratamiento como inversión privada (rinden un poco: bonos de carbono y tarifas); el mantenimiento sale de tu dinero. El área protegida solo la declara el gobierno.</span>'}`:'')+`</div>`;
  return h;}
{const _h=ntPlaceHTML;ntPlaceHTML=function(rid){let h=_h(rid);try{const x=G.regions[rid];if(!x||!h)return h;const add=ntContHTML(rid)+ntCvHTML(rid);
  const mk=`<div class="sect">${flag(x.o,14)}`;const i=h.indexOf(mk);h=i>=0?h.slice(0,i)+add+h.slice(i):h.replace(/<\/div>$/,add+'</div>');}catch(e){console.warn('v23c provincia',e);}return h;};}
function ntAvBind(B,again){B.querySelectorAll('[data-ntav]').forEach(b=>b.onclick=()=>{const n=natOf(P);askText(`🔬 ¿Investigar la tecnología del agua? <small>${fmtN(ntAvCost(n))}</small>`,null,()=>{const m=ntAvBuy();log(m,'good');try{sfx('coin');}catch(e){}save();render();again();},'Investigar');});}
{const _p=ntPlace;ntPlace=function(rid){_p(rid);try{const B=$('sheetIn');if(!B)return;const again=()=>{PL.tab='na';showPlace(rid,'na');};
  B.querySelectorAll('[data-ntcv]').forEach(b=>b.onclick=()=>{const k=b.dataset.ntcv,J=NT_PJ[k];const p=ntPjPay(rid,k);
    askText(`${J.ic} ¿${J.n} en ${RG[rid].nm}? <small>${p.by==='p'?fmt(p.loc):fmtN(p.usd)} · ${J.m} meses · mantenimiento al año</small>`,null,()=>{const m=ntPjBuild(rid,k);log(m,'good');try{sfx('coin');}catch(e){}save();render();again();},'Construir');});
  ntAvBind(B,again);ntLrn('Área protegida','Reforestación','Contaminación industrial');}catch(e){console.warn('v23c botones',e);}};}
/* ---------- País → 🌿 Naturaleza ---------- */
function ntNatCvHTML(nid){const rs=regionsOf(nid);const L=[];rs.forEach(r=>{const R=G.np&&G.np[r];if(!R)return;NT_CVK.forEach(k=>{const e=R[k];if(e&&(e.l||e.q))L.push([r,k,e]);});});
  let h=`<div class="sect">🌳 <span>Conservación</span></div>`;
  h+=L.length?L.sort((a,b)=>(b[2].q?1:0)-(a[2].q?1:0)).slice(0,12).map(([r,k,e])=>`<button class="item" data-ntr="${r}"><span><div class="t">${NT_PJ[k].ic} ${NT_PJ[k].n}${NT_PJ[k].max>1?' · '+e.l+'/'+NT_PJ[k].max:''}</div><div class="s">${RG[r].nm}${e.q?` · 🏗️ <span>faltan</span> ${ntPjLeft(r,k)} <span>meses</span>`:''}${e.l&&e.s===G.year?' · <span>suspendido</span>':''}</div></span>›</button>`).join('')
    :`<div class="hint"><span>No hay reforestación, áreas protegidas ni plantas de tratamiento. Ábrelas desde la pestaña 🌿 Naturaleza de cada provincia.</span></div>`;
  const P2=rs.map(r=>[r,ntProv(r)]).filter(e=>e[1]&&e[1].cont&&e[1].cont.raw<=-1).sort((a,b)=>a[1].cont.v-b[1].cont.v).slice(0,5);
  if(P2.length)h+=`<div class="sect">🏭 <span>Provincias más contaminadas por empresas</span></div>`+P2.map(([r,o])=>`<button class="item" data-ntr="${r}"><span><div class="t">${RG[r].nm}</div><div class="s"><span>Ecosistema</span> <b>${ntPm(o.cont.v)}</b> · ${o.cont.S.slice(0,2).map(e=>e[1]).join(', ')}${o.cont.tl?` · 🚰 <span>tratamiento</span> ${o.cont.tl}`:''}</div></span>›</button>`).join('');
  const t=ntTourN(nid);h+=ntAvHTML(nid,1)+`<div class="hint">🏨 <span>Turismo del país por su naturaleza y sus áreas protegidas:</span> <b class="${t>=1?'up':'dn'}">${t>=1?'+':'−'}${Math.abs(Math.round((t-1)*100))} %</b> <span>de demanda.</span></div>`;
  return h;}
{const _h=ntNatHTML;ntNatHTML=function(nid){let h=_h(nid);try{const add=ntNatCvHTML(nid);const i=h.lastIndexOf('<div class="hint">Toca una provincia');h=i>=0?h.slice(0,i)+add+h.slice(i):h+add;}catch(e){console.warn('v23c país',e);}return h;};}
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(P&&G&&VIEW.v==='pa'&&VIEW.tab==='nat'){const body=$('natBody');if(body)ntAvBind(body,()=>{});}}catch(e){}return r;};}
/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
(function(){const c=GLC.indexOf('Naturaleza y recursos');GLOS.push(
 ['Área protegida','Zona donde la ley limita la caza, la tala, la construcción y la agricultura para conservar la naturaleza. Protege especies y cuencas de agua y atrae turismo.',['área protegida','áreas protegidas'],c],
 ['Reforestación','Volver a plantar árboles donde hubo bosque. El bosque retiene la lluvia, recarga los acuíferos y devuelve el hábitat a muchas especies; tarda años en dar efecto.',['reforestación','reforestar'],c],
 ['Contaminación industrial','Desechos que fábricas, minas y pozos petroleros echan al aire, al agua y al suelo. Las plantas de tratamiento limpian parte del agua antes de devolverla a los ríos.',['contaminación industrial','contaminación'],c]);})();
(function(){const H=[
 ['Contaminación de empresas','🏭 Contaminación de empresas','Las fábricas, minas y pozos dejan desechos en el aire, el agua y el suelo; las plantas de tratamiento limpian el agua residual antes de devolverla a los ríos.','Tus fábricas, minas, pozos, constructoras, talleres y transportes, las empresas industriales de la bolsa (sede en una de las 3 provincias más pobladas de su país) y la extracción de los yacimientos restan ecosistema según su tamaño frente al PIB de la provincia (tope 8 por fuente y 14 en total). Cada nivel de planta de tratamiento compensa la mitad.'],
 ['Conservación','🌳 Conservación','Muchos países protegen bosques y cuencas con parques nacionales y reforestación; Costa Rica casi duplicó su cobertura de bosque desde los años 80 y vive del ecoturismo.','Reforestación: +3 de ecosistema y +1.5 % de agua por nivel (hasta 2; 24 meses). Área protegida: +5 de ecosistema y +2 % de agua (1; 12 meses; solo el gobierno). Planta de tratamiento: compensa la mitad de la contaminación por nivel (hasta 2; 18 meses). Tienen mantenimiento cada año (PIB de la provincia × 0.03–0.05 % por nivel, entre 6 y 10 % de lo que costó la obra); si no se paga, se suspenden ese año. El turismo de tus hoteles, bares y joyerías sube o baja hasta 15 % con la naturaleza de la provincia. El avance «Tecnología del agua» abarata 20 % todos los proyectos.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const g=GUIA.find(x=>/^🌿 Naturaleza y recursos/.test(x[0]));if(g)g[1]=g[1].replace('</ul>',`<li><b>🌳 Conservación:</b> reforesta, declara áreas protegidas o construye plantas de tratamiento desde la pestaña 🌿 de cada provincia. Suben la salud del ecosistema y un poco el agua, atraen turismo y cuestan mantenimiento cada año.</li>
<li><b>🏭 Contaminación:</b> tus fábricas, minas y pozos, las empresas industriales de la bolsa y los yacimientos restan ecosistema en su provincia según su tamaño.</li>
<li><b>🌵 Sequía y tus granjas:</b> en un año de sequía tus granjas cosechan menos (hasta 45 %) y tus ranchos producen menos (hasta 25 %).</li>
<li><b>🔬 Tecnología del agua:</b> con tecnología civil 3 tu país la logra solo; si gobiernas puedes financiarla antes. Abarata 20 % los proyectos.</li></ul>`);})();
SABIAS.push(
 ['Costa Rica pasó de cerca de 21 % de su territorio con bosque en 1987 a más de 50 % hoy, con pagos a los dueños de tierras por conservarlo.','SINAC; FAO, Evaluación de los Recursos Forestales','nat'],
 ['Las áreas protegidas cubren cerca de 17 % de la tierra firme del mundo.','UNEP-WCMC y UICN, Protected Planet Report 2020','nat']);
(function(){const st=document.createElement('style');st.id='v23ccss';st.textContent=`
.ntcl{display:flex;flex-direction:column;gap:4px;margin:4px 0}
.ntcr{display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:10px;background:var(--card2);padding:6px 10px}
.ntcr>span{display:flex;flex-direction:column;min-width:0}.ntcr>span b{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ntcr small{color:var(--mut);font-size:11px}
.ntcr .dn{color:var(--red);flex:0 0 auto}
`;document.head.appendChild(st);})();
