/* ===== v2.6a: «Divisiones y armamento» en la pestaña Ejército de la vista País =====
   Solo lectura: usa ar26Of (engine_v26a.js), que se recalcula por año y fuerza. Se agrega debajo de lo que ya muestra la pestaña
   (la hoja de ejércitos si mandas tropas, o el aviso si no). Si gobiernas, también se ve el presupuesto militar.
   Modo ligero (html.v4lt): sin barras de reparto. */
(function(){const st=document.createElement('style');st.textContent=`
#ar26pa{margin-top:10px}
.ar26t{width:100%;border-collapse:collapse;font-size:12.5px;margin:4px 0 6px}
.ar26t th{color:var(--mut);font-weight:600;font-size:11px;text-align:right;padding:3px 4px;border-bottom:1px solid var(--line)}
.ar26t th:first-child,.ar26t td:first-child{text-align:left}
.ar26t td{padding:4px 4px 1px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.ar26t td small{display:block;color:var(--mut);font-size:10.5px;font-weight:400}
.ar26t tr.eq td{white-space:normal;text-align:left;color:var(--mut);font-size:11.5px;padding:0 4px 6px;border-bottom:1px solid var(--line)}
.ar26b{height:4px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:3px}.ar26b i{display:block;height:100%;background:var(--teal)}
.ar26l{display:inline-block;min-width:18px;padding:0 5px;border-radius:8px;border:1px solid var(--line);font-size:11px;text-align:center}
.ar26l.l4,.ar26l.l5{border-color:var(--gold);color:var(--gold)}
html.v4lt .ar26b{display:none}`;document.head.appendChild(st);})();
function ar26Lite(){try{return document.documentElement.classList.contains('v4lt');}catch(e){return false;}}
function ar26K(v){return typeof fmtK==='function'?fmtK(v):String(Math.round(v));}
function ar26HTML(nid){const A=ar26Of(nid);if(!A)return '';const n=G.nations[nid];const me=P&&natOf(P)&&natOf(P).id===nid;const gob=me&&P.ruler;
  let h=`<div class="sect">🪖 <span>Divisiones y armamento</span></div>`;
  if(A.dead)return h+`<div class="hint">Este país ya no existe: no tiene fuerzas armadas.</div>`;
  const pc=v=>(v*100).toFixed(v<.01?2:1)+' %';
  const L=[['Efectivos activos','',ar26K(A.total),pc(A.actPct)+' de la población'],['Divisiones','',String(A.div),A.sinFA?'sin fuerzas armadas':'y unidades menores'],
    ['Armamento','',`${A.lvl} de 5`,A.nivel],['Reservistas','',ar26K(A.res),pc(A.resPct)+' de la población']];
  if(gob)L.push(['Presupuesto militar','',fmtN(A.bud),pc(A.budPct)+' del PIB'+(A.est?' (estimado)':'')]);
  h+=typeof v4MtHTML==='function'?v4MtHTML(L):(typeof v19Tiles==='function'?v19Tiles(L.map(x=>[x[0],x[2],x[3]])):'');
  if(A.sinFA)h+=`<div class="hint">${n.name} no tiene fuerzas armadas: su seguridad está a cargo de la policía${A.costa?' y los guardacostas':''}.</div>`;
  if(A.guerra)h+=`<div class="hint"><span class="neg">En guerra con ${A.wars.map(w=>G.nations[w]?G.nations[w].name:w).join(', ')}</span>${A.enArmas?' · los efectivos salen de las tropas en campaña':''}</div>`;
  const lite=ar26Lite();
  h+=`<div class="card" style="padding:6px 8px"><table class="ar26t"><thead><tr><th>Tipo</th><th>Divisiones</th><th>Efectivos</th><th>Nivel</th></tr></thead><tbody>`+
    A.tipos.filter(t=>t.ef>0).map(t=>`<tr><td><b>${t.n}</b><small>${A.sinFA?'unidades menores':t.u}</small></td><td>${t.menor?'<small>menor</small>':t.div}</td><td>${ar26K(t.ef)}<small>${(t.share*100).toFixed(0)} %</small></td><td><span class="ar26l l${t.lvl}">${t.lvl}</span></td></tr>`+
      `<tr class="eq"><td colspan="4">${t.eq}${lite?'':`<div class="ar26b"><i style="width:${Math.max(2,Math.round(t.share*100))}%"></i></div>`}</td></tr>`).join('')+`</tbody></table></div>`;
  if(!A.costa&&!A.sinFA)h+=`<div class="hint">Sin salida al mar: no tiene flota.</div>`;
  h+=`<div class="kv"><div><span>Gasto por soldado</span><b>${typeof perSoldier==='function'?fmtN(perSoldier(nid)):'—'}</b></div><div><span>Tecnología militar</span><b>${Math.floor((n.tech&&n.tech.m)||0)}</b></div></div>`;
  h+=`<div class="hint">«Menor»: menos de media división (brigadas o batallones). El nivel de armamento sale del gasto por soldado, el PIB por persona, el gasto militar total y la tecnología militar. Personal y gasto: Banco Mundial y SIPRI, ajustados a la fuerza actual.</div>`;
  return h;}
function ar26Put(){try{if(!P||!G||VIEW.v!=='pa'||VIEW.tab!=='arm')return;const body=$('natBody');if(!body||body.querySelector('#ar26pa'))return;
  const d=document.createElement('div');d.id='ar26pa';d.innerHTML=ar26HTML(natOf(P).id);body.append(d);}catch(e){console.warn('v26a ejército',e);}}
(function(){if(typeof renderView!=='function')return;const _rv=renderView;renderView=function(...a){const r=_rv.apply(this,a);ar26Put();return r;};})();
(function(){if(typeof showArmies!=='function')return;const _sa=showArmies;showArmies=function(...a){const r=_sa.apply(this,a);ar26Put();return r;};})();
