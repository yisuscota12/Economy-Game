/* ===== v1.7s (etapa D del plan): fútbol mánager — interfaz =====
   Ficha de club (toca cualquier club en una tabla), pestañas Mercado y Tu club en ⚽ Fútbol mundial, DT y encaje táctico en el panel del futbolista,
   y el panel ⚽ Tu club: comprar o fundar, resumen, plantilla y DT, mercado, instalaciones, finanzas y licencias de entrenador. */
(function(){const st=document.createElement('style');st.textContent=`
.ft7t{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}.ft7t td,.ft7t th{padding:3px 4px;border-bottom:1px solid #1f2b3a;text-align:left}.ft7t th{color:var(--mut);font-weight:600;font-size:11px}.ft7t td.r,.ft7t th.r{text-align:right}
.ft7t .s{font-size:11px;color:var(--mut)}[data-ftc]{cursor:pointer}span[data-ftc]{text-decoration:underline dotted rgba(255,255,255,.35)}
.ft7sw{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 8px}.ft7sw button{width:28px;height:28px;border-radius:50%;border:2px solid #334155;padding:0}.ft7sw button.on{border-color:#f2c14e;box-shadow:0 0 0 2px #f2c14e55}
.ft7chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.ft7chips span{font-size:11.5px;border:1px solid var(--line);border-radius:10px;padding:2px 7px}
.ft7chips span.ok{border-color:#3ccf8e;color:#3ccf8e}.ft7chips span.no{border-color:#ff7b6b;color:#ff7b6b}
`;document.head.appendChild(st);})();
const FT7={tab:'res',lg:null,mf:'al',c1:0,c2:2,sh:0};
const ft7it=(code,s,ok,lab,lock)=>`<button class="item" data-f7="${code}" ${ok?'':'disabled'}><span><div class="t">${lab}</div><div class="s">${s}${!ok&&lock?` · 🔒 ${lock}`:''}</div></span></button>`;
const ft7kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;
const ft7bar=(v,col)=>`<div class="cb7bar"><i style="width:${clamp(v,0,100)}%;background:${col||'#5fa8ff'}"></i></div>`;
function ft7days(t){const k=actCost(t);return k===1?`⏳ ${k} día`:`⏳ ${k} días`;}

/* ----- tablas de liga: el nombre del club abre su ficha ----- */
ftTableHTML=function(L,me){const T=ftTable(L);const n=T.length;const W=FTW();
  return `<table class="ftt"><tr><th></th><th>${L.n}${L.f==='mx'&&L.tor?' · '+L.tor:''}</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr>${T.map((c,i)=>{const t=L.tb[c]||[0,0,0,0,0,0,0];
    const z=L.f==='mx'?(i<8?'z1':''):L.t===1&&i<(L.c==='GBR'||L.c==='ESP'||L.c==='ITA'||L.c==='DEU'?4:L.c==='FRA'||L.c==='PRT'?3:L.c==='NLD'?2:L.c==='BRA'?6:L.c==='ARG'?5:0)?'z1':L.dn&&i>=n-3?'z3':L.up&&i<3?'z2':'';
    return `<tr class="${z}${c===me||ftcMine(c)?' me':''}"><td>${i+1}</td><td data-ftc="${c}">${crest(c)}${W.C[c].n}</td><td>${t[0]}</td><td>${t[1]}</td><td>${t[2]}</td><td>${t[3]}</td><td>${t[4]-t[5]>0?'+':''}${t[4]-t[5]}</td><td><b>${t[6]}</b></td></tr>`;}).join('')}</table>
    <div class="hint" style="font-size:11px;margin-top:4px">${L.f==='mx'?'Verde: liguilla (los 8 primeros).':'Verde: copa continental'+(L.dn?' · Rojo: descenso':'')+(L.up?' · Azul: ascenso':'')+'.'}${L.ph==='off'?' Temporada terminada.':L.ph==='lig'?' En liguilla.':''} <span>Toca un club para ver su ficha.</span></div>`;};
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-ftc]');if(!t||!FTW()||!FTW().C[t.dataset.ftc])return;e.preventDefault();e.stopPropagation();ftClubCard(t.dataset.ftc);},true);

/* ----- ficha de un club ----- */
function ftDTCardHTML(c,d,fit){const S=ftStyK(d.s);const q=Math.round(ftDTq(d));let h=`<div class="cb7card"><h4>👤 ${d.me?'Tú':d.n} ${d.me?'':flag(d.c,11)}</h4><div class="kv">`+
    ft7kv('Estilo',S[1])+ft7kv('Formación habitual',S[3])+ft7kv('Calidad del DT',String(q))+(d.me?'':ft7kv('Edad',String(d.g)))+ft7kv('En el cargo desde',String(d.y0))+ft7kv('Récord (G-E-P)',`${d.w}-${d.e}-${d.l}`)+`</div><div class="s" style="margin-top:4px">${S[2]}</div>`;
  if(fit){const v=fbFitV(P);const w=S[5].map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]).slice(0,2);h+=`<div class="cb7g" style="margin-top:6px"><span>Encaje táctico</span><b style="color:${v>=.5?'#3ccf8e':v<=-.5?'#ff7b6b':'inherit'}">${fbFitN(v)}</b></div><div class="s">Atributos que más valora:</div><div class="ft7chips">${w.map(([x,i])=>`<span>${FT_ATI[i]} ${FT_AT[i]}</span>`).join('')}</div><div class="s">Un buen encaje te acerca a la titularidad.</div>`;}
  return h+'</div>';}
function ftClubCard(cid){const W=FTW();const c=W.C[cid];if(!c)return;const L=W.L[c.l];const d=W.D&&W.D[c.dt];const S=ftStarsOf(cid);const mo=FT_MO[c.mo]||FT_MO.equ;const mine=ftcMine(cid);
  if(!$('modal').classList.contains('on'))FT7.sh=$('sheet').classList.contains('on')?1:0;
  let h=`<div class="cbh">${crest(cid,true)}<div style="flex:1"><h3 style="margin:0">${c.n}</h3><small>${flag(c.c)} ${L?L.n:'Categorías regionales'}</small>${mine?'<small>💼 Tu club</small>':''}</div></div>`;
  h+=`<div class="kv">${ft7kv('Fuerza',String(Math.round(c.r)))+ft7kv('Modelo de negocio',mo[0])+ft7kv('Estadio (lugares)',fmtK(c.st))+ft7kv('Aficionados',fmtK(c.fa*1e6))+(L?ft7kv('Ingresos estimados al año',ftUSD(ftcRev(c).t)):'')+(L?ft7kv('Valor del club',ftUSD(ftcVal(c))):'')}</div><div class="hint" style="font-size:11.5px">${mo[1]}</div>`;
  if(d)h+=ftDTCardHTML(c,d,false);
  if(S.length)h+=`<div class="sect" style="position:static">Figuras del plantel</div><table class="ft7t"><tr><th></th><th></th><th>Edad</th><th>Media</th><th class="r">Valor</th></tr>${S.slice().sort((a,b)=>b.r-a.r).map(s=>`<tr><td>${FT_POS[s.po][0]}</td><td>${flag(s.c,11)} ${s.n}</td><td>${s.g}</td><td>${Math.round(s.r)}</td><td class="r">${ftUSD(ftSV(s))}</td></tr>`).join('')}</table>`;
  const M=(W.mk||[]).filter(x=>x[7]===cid||x[8]===cid).slice(-6).reverse();if(M.length)h+=`<div class="sect" style="position:static">Fichajes recientes</div><table class="ft7t">${M.map(x=>`<tr><td>${x[0]}</td><td>${x[2]}<div class="s">${x[8]===cid?`Llega de ${x[10]}`:`Se va a ${x[11]}`}</div></td><td class="r">${ftUSD(x[9]*1e6)}</td></tr>`).join('')}</table>`;
  if(c.tr.length)h+=`<div class="sect" style="position:static">Palmarés del club</div><div class="hint">${c.tr.slice(-6).reverse().map(t=>`🏆 ${t.y} · ${t.t}`).join('<br>')}</div>`;
  const canB=!mine&&c.l&&P&&!P.ftc&&!ftcCanOwn(P);if(canB){const pr=toInt(ftcAsk(c),'USD');h+=`<button class="btn gold" id="ccB" style="width:100%;padding:11px;margin-top:6px" ${P.dinero>=pr?'':'disabled'}>💼 Comprar el club · ${fmt(pr)}</button>`;}
  h+=`<button class="btn" id="ccX" style="width:100%;padding:11px;margin-top:6px">Cerrar</button>`;
  showModal(h,m=>{m.querySelector('#ccX').onclick=()=>ft7close();const b=m.querySelector('#ccB');if(b)b.onclick=()=>askText('¿Comprar este club?',null,()=>{const r=ftcBuy(P,cid);if(r){log(r,'big');toast('💼',r);}save();render();FT7.sh=0;showFTC('res');},'Comprar');});}
function ft7close(){hideModal();if(FT7.sh){$('sheet').classList.add('on');$('ov').classList.add('on');}FT7.sh=0;}

/* ----- ⚽ Fútbol mundial: pestañas Mercado y Tu club ----- */
showFTWorld=function(tab){const W=ftEnsure();if(!W)return;if(tab)FBV.wtab=tab;const Ls=Object.values(W.L);if(!FBV.lg||!W.L[FBV.lg]){const me=P?natOf(P).id:null;const fb=fbOf(P);FBV.lg=fb&&fb.cl&&W.C[fb.cl].l?W.C[fb.cl].l:(Ls.find(L=>L.c===me&&L.t===1)||Ls[0]).i;}
  if(FBV.wtab==='due'){FBV.wtab='lig';showFTC();return;}
  let h=`<h3>⚽ Fútbol mundial</h3><div class="ntabs">${[['lig','Ligas'],['cop','Copas'],['sel','Selecciones'],['mer','Mercado'],['his','Historial'],['due','Tu club']].map(([k,n])=>`<button data-wt="${k}" class="${FBV.wtab===k?'on':''}">${n}</button>`).join('')}</div>`;h+=ftWorldBody(FBV.wtab);
  openSheetRaw(h,b=>{b.querySelectorAll('[data-wt]').forEach(x=>x.onclick=()=>{if(x.dataset.wt==='due'){showFTC();return;}showFTWorld(x.dataset.wt);});b.querySelectorAll('[data-lg]').forEach(x=>x.onclick=()=>{FBV.lg=x.dataset.lg;showFTWorld();});});};
{const _b=ftWorldBody;ftWorldBody=function(t){if(t==='mer')return ftMktHTML();return _b(t);};}
function ftMktHTML(){const W=FTW();const M=(W.mk||[]).slice().reverse();const mi=W.cy*12+W.cm;let h=`<div class="hint">${fbWindow()}.</div>`;
  h+=`<div class="sect" style="position:static">Últimos fichajes</div>`+(M.length?`<table class="ft7t">${M.slice(0,20).map(x=>`<tr><td>${x[0]}</td><td>${flag(x[3],11)} ${x[2]} <span class="s">${FT_POS[x[4]][0]} · ${x[5]} · ${x[6]}</span><div class="s"><span data-ftc="${x[7]}">${x[10]}</span> → <span data-ftc="${x[8]}">${x[11]}</span></div></td><td class="r"><b>${ftUSD(x[9]*1e6)}</b></td></tr>`).join('')}</table>`:'<div class="hint">Todavía no hay fichajes registrados.</div>');
  const net={};for(const x of W.mk||[]){if(x[0]*12+x[1]<mi-12)continue;net[x[7]]=(net[x[7]]||0)+x[9];net[x[8]]=(net[x[8]]||0)-x[9];}const E=Object.entries(net).filter(([k])=>W.C[k]);
  const sp=E.slice().sort((a,b)=>a[1]-b[1]).filter(e=>e[1]<0).slice(0,5),se=E.slice().sort((a,b)=>b[1]-a[1]).filter(e=>e[1]>0).slice(0,5);
  const row=([k,v])=>`<tr><td data-ftc="${k}">${crest(k)}${W.C[k].n}<div class="s">${(FT_MO[W.C[k].mo]||FT_MO.equ)[0]}</div></td><td class="r" style="color:${v<0?'#ff7b6b':'#3ccf8e'}">${ftUSD(Math.abs(v)*1e6)}</td></tr>`;
  if(sp.length)h+=`<div class="sect" style="position:static">Los que más gastaron (12 meses)</div><table class="ft7t">${sp.map(row).join('')}</table>`;
  if(se.length)h+=`<div class="sect" style="position:static">Los que más vendieron (12 meses)</div><table class="ft7t">${se.map(row).join('')}</table>`;
  const S=Object.values(W.S).filter(s=>W.C[s.cl]).map(s=>[s,ftSV(s)]).sort((a,b)=>b[1]-a[1]).slice(0,15);
  h+=`<div class="sect" style="position:static">Los jugadores más valiosos</div><table class="ft7t"><tr><th></th><th></th><th>Edad</th><th>Media</th><th class="r">Valor</th></tr>${S.map(([s,v])=>`<tr><td>${FT_POS[s.po][0]}</td><td>${flag(s.c,11)} ${s.n}<div class="s" data-ftc="${s.cl}">${W.C[s.cl].n}</div></td><td>${s.g}</td><td>${Math.round(s.r)}</td><td class="r">${ftUSD(v)}</td></tr>`).join('')}</table>`;
  h+=`<div class="sect" style="position:static">Valores por liga</div><table class="ft7t"><tr><th>Liga</th><th class="r">Ingreso medio</th><th class="r">TV por club</th><th class="r">Figura más cara</th></tr>${Object.values(W.L).map(L=>{const cs=L.cl.map(x=>W.C[x]).filter(Boolean);const rv=cs.reduce((a,c)=>a+ftcRev(c).t,0)/Math.max(1,cs.length);const tv=cs.length?ftTVBase(cs[0]):0;
    const mx=Object.values(W.S).filter(s=>L.cl.includes(s.cl)).reduce((a,s)=>Math.max(a,ftSV(s)),0);return `<tr><td>${flag(L.c,11)} ${L.n}</td><td class="r">${ftUSD(rv)}</td><td class="r">${ftUSD(tv)}</td><td class="r">${mx?ftUSD(mx):'—'}</td></tr>`;}).join('')}</table><div class="hint" style="font-size:11px">Los valores de mercado siguen la media, la edad, la liga y el potencial, como en los portales de traspasos.</div>`;
  return h;}

/* ----- panel del futbolista: DT y encaje táctico ----- */
{const _s=showFB;showFB=function(tab){_s(tab);try{const fb=fbOf(P);if(!fb||!fb.cl)return;const W=FTW();const c=W.C[fb.cl];const d=c&&W.D&&W.D[c.dt];if(!d)return;const b=$('sheetIn');
  if(FBV.tab==='jug'){const kv=b.querySelector('.kv');const v=fbFitV(P);if(kv)kv.insertAdjacentHTML('beforeend',ft7kv('Estilo del DT',ftStyN(d.s))+`<div><span>Encaje táctico</span><b style="color:${v>=.5?'#3ccf8e':v<=-.5?'#ff7b6b':'inherit'}">${fbFitN(v)}</b></div>`);}
  else if(FBV.tab==='clu'){const hs=b.querySelectorAll('.cbh');const hd=hs[1];if(hd)hd.insertAdjacentHTML('afterend',ftDTCardHTML(c,d,true));}}catch(e){if(typeof console!=='undefined')console.warn('ft7 fb',e);}};}

/* ===================== ⚽ TU CLUB ===================== */
function showFTC(tab){if(!P)return;const W=ftEnsure();if(!W)return;if(P.ftc&&!W.C[P.ftc.c])P.ftc=null;const o=P.ftc;const c=o&&W.C[o.c];
  const tabs=o?[['res','Resumen'],['pla','Plantilla'],['mer','Mercado'],['ins','Instalaciones'],['fin','Finanzas'],['lic','Licencias']]:[['com','Comprar'],['fun','Fundar'],['lic','Licencias']];
  if(tab)FT7.tab=tab;if(!tabs.some(t=>t[0]===FT7.tab))FT7.tab=tabs[0][0];
  let h=o?`<div class="cbh">${crest(c.i,true)}<div style="flex:1"><h3 style="margin:0">${c.n}</h3><small>${flag(c.c)} ${c.l?W.L[c.l].n:'Liga regional'}</small><small>💼 Tu club</small></div></div>`:`<h3>⚽ Ser dueño de un club</h3>`;
  h+=`<div class="ntabs">${tabs.map(([k,n])=>`<button data-t7="${k}" class="${FT7.tab===k?'on':''}">${n}${k==='mer'&&o&&(o.bids.length||o.so)?' •':''}</button>`).join('')}</div>`;
  const t=FT7.tab;h+=t==='com'?ftcBuyHTML():t==='fun'?ftcFoundHTML():t==='lic'?ftcLicHTML():t==='res'?ftcResHTML(o,c):t==='pla'?ftcSquadHTML(o,c):t==='mer'?ftcMktHTML(o,c):t==='ins'?ftcInsHTML(o,c):ftcFinHTML(o,c);
  openSheetRaw(h,b=>ftcBind(b));}
function ftcBuyHTML(){const W=FTW();const e=ftcCanOwn(P);const Ls=Object.values(W.L);if(!FT7.lg||!W.L[FT7.lg]){const me=natOf(P).id;FT7.lg=(Ls.find(L=>L.c===me&&L.t===1)||Ls[0]).i;}
  let h=`<div class="hint">Compras el club completo: su estadio, su plantel y su lugar en la liga. Luego decides la masa salarial, los fichajes, las obras y quién dirige al equipo. Tu dinero: <b>${fmt(P.dinero)}</b>.</div>`;
  if(e)h+=`<div class="hint" style="color:var(--red)">${e}</div>`;
  h+=`<div class="chips" style="margin-bottom:8px">${Ls.map(L=>`<button data-lg7="${L.i}" class="${FT7.lg===L.i?'on':''}">${flag(L.c,11)} ${L.n}</button>`).join('')}</div>`;
  const L=W.L[FT7.lg];h+=L.cl.map(x=>W.C[x]).sort((a,b)=>b.r-a.r).map(c=>{const pr=toInt(ftcAsk(c),'USD');return `<div class="cb7card"><div class="tp" style="display:flex;gap:8px;align-items:center"><span data-ftc="${c.i}">${crest(c.i,true)}</span><div style="flex:1"><b data-ftc="${c.i}">${c.n}</b><div class="s"><span>Fuerza</span> <b>${Math.round(c.r)}</b> · <span>${(FT_MO[c.mo]||FT_MO.equ)[0]}</span> · <span>Estadio (lugares)</span> <b>${fmtK(c.st)}</b></div></div></div>
    <button class="btn" data-f7="buy:${c.i}" style="width:100%;margin-top:6px;padding:8px" ${!e&&P.dinero>=pr?'':'disabled'}>💼 Comprar · ${fmt(pr)}</button></div>`;}).join('');
  return h;}
function ftcFoundHTML(){const W=FTW();const e=ftcCanOwn(P);const nid=natOf(P).id;const L=ftcLowest(nid);const k=ftcFoundCost(nid);const tot=toInt(k.reg+k.cap,'USD');
  let h=`<div class="hint">Fundas un club en tu ciudad. Empieza en la liga regional con un campo municipal rentado; para entrar a la liga profesional necesitas seis meses de competencia y la licencia (un estadio con suficientes lugares y, en primera división, un centro de entrenamiento).</div>`;
  if(e)h+=`<div class="hint" style="color:var(--red)">${e}</div>`;
  h+=`<div class="kv">${ft7kv('Registro ante la federación',ftUSD(k.reg))+ft7kv('Capital inicial (caja del club)',ftUSD(k.cap))+ft7kv('Total',fmt(tot))}</div>`;
  if(L)h+=`<div class="kv">${ft7kv('Liga de entrada',L.n)+ft7kv('Estadio mínimo para la licencia',fmtK(ftcLicMin(L)))}</div>${L.t===1?'<div class="hint">Tu país no tiene segunda división simulada: además de la licencia necesitas comprar una plaza (franquicia) antes de entrar.</div>':''}`;
  else h+='<div class="hint">Tu país aún no tiene una liga simulada: se crea al fundar el club.</div>';
  h+=`<div class="hint">Colores del club:</div><div class="ft7sw">${FT_COLS.map((x,i)=>`<button data-c17="${i}" class="${FT7.c1===i?'on':''}" style="background:${x}"></button>`).join('')}</div><div class="ft7sw">${FT_COLS.map((x,i)=>`<button data-c27="${i}" class="${FT7.c2===i?'on':''}" style="background:${x}"></button>`).join('')}</div>`;
  h+=ft7it('found',`${fmt(tot)} · eliges el nombre en el siguiente paso`,!e&&P.dinero>=tot,'🏟️ Fundar un club',e||`Necesitas ${fmt(tot)}`);return h;}
function ftcLicHTML(){const f=ftlEnsure(P);let h=`<div class="hint">Las licencias de entrenador (como las de la UEFA y las federaciones) se sacan en orden: C, B, A y Pro. Con la B dirige un club regional, con la A uno de segunda división y con la Pro uno de primera.${ftlEx(P)?' <span>Como exfutbolista profesional haces los cursos en la mitad del tiempo.</span>':''}</div>`;
  h+=`<div class="kv">${ft7kv('Tu licencia',FTL[f.lv][0])+ft7kv('Tu fuerza como DT',String(Math.round(f.q)))+ft7kv('Máximo con esta licencia',String(FTL[f.lv][3]))+ft7kv('Meses dirigiendo',String(f.xp||0))}</div>`;
  for(let lv=1;lv<FTL.length;lv++){const rq=ftlReq(P,lv);const lab=ftlLabel(P,lv);h+=ft7it('lic'+lv,f.lv>=lv?'Aprobada':`${ft7days(lab)} · ${fmt(toInt(FTL[lv][1],'USD'))} · fuerza máxima ${FTL[lv][3]}`,!rq&&canAfford(lab)&&!P.event,`${f.lv>=lv?'✅':'🎓'} ${FTL[lv][0]}`,rq&&f.lv<lv?rq:'');}
  return h+'<div class="hint" style="font-size:11.5px">Tu fuerza como DT sube cada mes que diriges, más rápido con buenos resultados, hasta el máximo de tu licencia.</div>';}
function ftcResHTML(o,c){const W=FTW();const L=W.L[c.l];const d=W.D[c.dt];const y=o.h.slice(-12);const y12=y.reduce((a,x)=>a+x[2]-x[3],0);let h='';
  h+=`<div class="kv">${(L?ft7kv('Lugar en la tabla',String(ftPosIdx(c)+1)):'')+ft7kv('Fuerza',String(Math.round(c.r)))+ft7kv('Fuerza objetivo',String(Math.round(ftcTgt(o,c))))+ft7kv('Entrenador',d?(d.me?'Tú':d.n):'—')+ft7kv('Estilo',d?ftStyN(d.s):'—')+
    ft7kv('Caja del club',`<span style="color:${o.caja>=0?'#3ccf8e':'#ff5a5a'}">${ftUSD(o.caja)}</span>`)+ft7kv('Resultado de 12 meses',`<span style="color:${y12>=0?'#3ccf8e':'#ff5a5a'}">${ftUSD(y12)}</span>`)+ft7kv('Valor del club',ftUSD(ftcVal(c)))}</div>${cbNetChart(o.h)}`;
  h+=`<div class="cb7g"><span>Ánimo de la afición</span><b>${Math.round(o.mood)}/100</b></div>${ft7bar(o.mood,o.mood>=60?'#3ccf8e':o.mood>=35?'#f2c14e':'#ff7b6b')}`;
  if(o.ob)h+=`<div class="hint">🎯 Objetivo de la temporada: <b>${FTC_OB[o.ob.k]}</b></div>`;
  if(o.obh.length)h+=`<div class="sect">Temporadas</div><table class="ft7t">${o.obh.slice().reverse().map(x=>`<tr><td>${x.y}</td><td>${x.L}<div class="s">${FTC_OB[x.k]}</div></td><td class="r">${x.i}.º</td><td class="r">${x.ok?'✅':'❌'}</td></tr>`).join('')}</table>`;
  if(L){h+=`<div class="sect">Tabla</div>`+ftTableHTML(L,c.i);}
  else{const g=o.rg||{pj:0,w:0,e:0,l:0,gf:0,ga:0};const LL=ftcLowest(c.c);h+=`<div class="sect">Liga regional</div><div class="kv">${ft7kv('Partidos',String(g.pj))+ft7kv('Récord (G-E-P)',`${g.w}-${g.e}-${g.l}`)+ft7kv('Goles',`${g.gf}-${g.ga}`)+ft7kv('Meses en la liga regional',String(o.reg))}</div>`;
    if(LL){h+=`<div class="hint">Para entrar a la ${LL.n} al terminar su temporada:</div><div class="ft7chips"><span class="${o.reg>=6?'ok':'no'}">${o.reg>=6?'✅':'⏳'} Seis meses en la liga regional</span><span class="${c.st>=ftcLicMin(LL)?'ok':'no'}">🏟️ Estadio mínimo para la licencia: ${fmtK(ftcLicMin(LL))}</span>${LL.t===1?`<span class="${o.cen>=1?'ok':'no'}">🏋️ Centro de entrenamiento</span><span class="${o.fran?'ok':'no'}">📋 Plaza (franquicia)</span>`:''}</div>`;}}
  h+=`<div class="sect">Vender</div>`+ft7it('sell',`Recibes alrededor de ${ftUSD((c.l?ftcVal(c):o.inv*.5)+o.caja)} (incluye la caja del club)`,true,'💰 Vender el club');return h;}
function ftcSquadHTML(o,c){const W=FTW();const d=W.D[c.dt];const f=ftlEnsure(P);const need=ftcLicNeed(c);let h=`<div class="sect">Entrenador</div>`;
  if(d)h+=ftDTCardHTML(c,d,false);if(d&&!d.me)h+=`<div class="hint" style="font-size:11.5px"><span>Sueldo del DT</span>: <b>${ftUSD(ftcDTSal(c))}</b></div>`;
  if(d&&d.me){h+=`<div class="hint">Tu estilo de juego (cambiarlo pide unos meses de adaptación):</div><div class="chips">${FT_STY.map(S=>`<button data-sty7="${S[0]}" class="${d.s===S[0]?'on':''}">${S[1]}</button>`).join('')}</div>`;if(c.af<1)h+=`<div class="cb7g"><span>Adaptación del plantel</span><b>${Math.round((c.af||1)*100)} %</b></div>${ft7bar((c.af||1)*100)}`;}
  else h+=ft7it('self',f.lv>=need?`Dejas de pagar sueldo de DT · tu fuerza como DT: ${Math.round(f.q)}`:`Necesitas la ${FTL[need][0]}`,f.lv>=need&&!fbOf(P),'📣 Dirigir tú mismo',f.lv<need?FTL[need][0]:'');
  h+=`<div class="hint" style="font-size:11.5px">Candidatos (libres y de otros clubes; a los que tienen contrato hay que pagarles un año de indemnización a su club):</div>`;
  h+=ftcDTCands(c).map(x=>{const comp=ftcDTComp(x);const oc=x.cl&&W.C[x.cl];return ft7it('dt:'+x.i,`${ftStyN(x.s)} · calidad ${Math.round(x.q)} · ${x.g} años · pide ${ftUSD(ftcDTAsk(x,c))} al año`+(oc?` · ${oc.n} · indemnización ${ftUSD(comp)}`:' · libre'),true,`👤 ${x.n}`);}).join('');
  h+=`<div class="sect">Masa salarial</div><div class="seg">${FTC_WK.map((w,i)=>`<button data-wk7="${i}" class="${o.wk===i?'on':''}">${w[0]}</button>`).join('')}</div>`;
  h+=`<div class="kv">${ft7kv('Sueldos del plantel al año',ftUSD(ftcBase(o,c)))+ft7kv('Sueldos de las figuras',ftUSD(ftcStarW(c)))+ft7kv('Fuerza objetivo',String(Math.round(ftcTgt(o,c))))+ft7kv('Fuerza actual',String(Math.round(c.r)))}</div><div class="hint" style="font-size:11.5px">La masa salarial te coloca en la tabla de gasto de tu liga: la fuerza del equipo se acerca poco a poco a la que paga.</div>`;
  const S=ftStarsOf(c.i).slice().sort((a,b)=>b.r-a.r);h+=`<div class="sect">Figuras del plantel</div>`;
  h+=S.length?`<table class="ft7t"><tr><th></th><th></th><th>Edad</th><th>Media</th><th class="r">Valor</th></tr>${S.map(s=>`<tr><td>${FT_POS[s.po][0]}</td><td>${flag(s.c,11)} ${s.n}<div class="s">${fbStarsTxt(s.pt)} · ${ftUSD(ftSW(s,c))}</div></td><td>${s.g}</td><td>${Math.round(s.r)}</td><td class="r">${ftUSD(ftSV(s))}</td></tr>`).join('')}</table><div class="hint" style="font-size:11px">Debajo de cada nombre: potencial y sueldo al año.</div>`:'<div class="hint">Tu club no tiene figuras. Fíchalas en Mercado o forma juveniles en tu academia.</div>';
  return h;}
function ftcMktHTML(o,c){const W=FTW();const open=ftWinOpen();let h=`<div class="hint"><span>${fbWindow()}.</span> <span>Caja del club:</span> <b>${ftUSD(o.caja)}</b></div>`;
  if(o.so){const s=W.S[o.so.s],to=W.C[o.so.cl];if(s&&to)h+=`<div class="ofr"><div class="k">OFERTA POR TU FIGURA</div><div class="hint" style="margin:4px 0">${to.n} ofrece ${ftUSD(o.so.fee)} por ${s.n}.</div><div class="bt"><button class="g" data-f7="soy">✍️ Vender</button><button data-f7="son">Rechazar</button></div></div>`;}
  if(o.bids.length)h+=`<div class="sect">Ofertas por tus figuras</div>`+o.bids.map((b,i)=>{const s=W.S[b.s],to=W.C[b.cl];if(!s||!to)return '';return `<div class="ofr"><div class="tp">${crest(b.cl,true)}<div style="flex:1"><b>${to.n}</b><div class="s" style="font-size:12px;color:var(--mut)">${s.n} · ${FT_POS[s.po][0]} · ${Math.round(s.r)}</div></div><b>${ftUSD(b.fee)}</b></div><div class="hint" style="margin:4px 0 0">Valor de mercado: ${ftUSD(ftSV(s))}</div><div class="bt"><button class="g" data-f7="ba${i}">✍️ Aceptar</button><button data-f7="br${i}">Rechazar</button></div></div>`;}).join('');
  const S=ftStarsOf(c.i);if(S.length)h+=`<div class="sect">Vender una figura</div>`+S.map(s=>ft7it('ss:'+s.i,`${FT_POS[s.po][0]} · ${s.g} años · media ${Math.round(s.r)} · valor ${ftUSD(ftSV(s))}`,open,`💰 ${s.n}`,'Mercado cerrado')).join('');
  h+=`<div class="sect">Fichar</div><div class="chips">${[['al','A tu alcance'],['to','Todos']].map(([k,n])=>`<button data-mf7="${k}" class="${FT7.mf===k?'on':''}">${n}</button>`).join('')}</div>`;
  const L=ftcMktList(c,FT7.mf==='al'?'al':'').slice(0,25);h+=L.map(s=>{const fee=ftcFee(s,c);const sc=W.C[s.cl];const far=s.r>c.r+12;return ft7it('bs:'+s.i,`${FT_POS[s.po][0]} · ${s.g} años · media ${Math.round(s.r)} · ${sc.n} · traspaso ${ftUSD(fee)} · sueldo ${ftUSD(ftSW(s,c))}`,open&&!far&&o.caja>=fee,`${flag(s.c,11)} ${s.n}`,!open?'Mercado cerrado':far?'No le interesa tu proyecto':'Falta caja');}).join('');
  return h;}
function ftcInsHTML(o,c){const W=FTW();const L=W.L[c.l]||ftcLowest(c.c);const rc=ftRc(c);const busy=o.pm||o.bd;const mi=W.cy*12+W.cm;let h='';
  if(o.pm)h+=`<div class="hint">📋 Permiso de obra en trámite: el ayuntamiento responde en ${Math.max(1,o.pm.t-mi)} mes(es).</div>`;
  if(o.bd)h+=`<div class="hint">🏗️ Obra en marcha: termina en ${Math.max(1,o.bd.t-mi)} mes(es).</div>`;
  h+=`<div class="sect">Estadio</div><div class="kv">${ft7kv('Lugares',fmtK(c.st))+ft7kv('Asistencia del último mes',fmtK(o.att||0))+(L?ft7kv('Estadio mínimo para la licencia',fmtK(ftcLicMin(L))):'')}</div>`;
  if(L&&L.up&&W.L[L.up])h+=`<div class="hint" style="font-size:11.5px">Para ascender a la ${W.L[L.up].n} necesitas ${fmtK(ftcLicMin(W.L[L.up]))} lugares y un centro de entrenamiento.</div>`;
  h+=FTC_STX.map(([v,mo],i)=>{const cost=ftcStCost(c,v);return ft7it('st'+i,`${ftUSD(cost)} · permiso ${ftUSD(cost*.01)} · ${mo} meses de obra`,!busy&&o.caja>=cost*1.01&&c.st+v<=100000,`🏟️ Ampliar ${fmtK(v)} lugares`,busy?'Ya hay una obra':'Falta caja');}).join('');
  const nc=o.cen+1;h+=`<div class="sect">Centro de entrenamiento</div><div class="kv">${ft7kv('Nivel',FTC_CEN[o.cen][0])+ft7kv('Mantenimiento al año',ftUSD(FTC_CEN[o.cen][2]*1e6*(.4+.6*rc)))}</div><div class="hint" style="font-size:11.5px">Cada nivel suma medio punto a la fuerza objetivo; en primera división hace falta al menos un centro básico.</div>`;
  if(nc<FTC_CEN.length){const cost=FTC_CEN[nc][1]*1e6*(.4+.6*rc);h+=ft7it('cen',`${ftUSD(cost)} · ${FTC_CEN[nc][3]?'necesita permiso de obra':'3 meses de obra'}`,!busy&&o.caja>=cost,`🏋️ Construir: ${FTC_CEN[nc][0]}`,busy?'Ya hay una obra':'Falta caja');}
  const na=o.aca+1;h+=`<div class="sect">Academia</div><div class="kv">${ft7kv('Nivel',FTC_ACA[o.aca][0])+ft7kv('Mantenimiento al año',ftUSD(FTC_ACA[o.aca][2]*1e6*(.4+.6*rc)))}</div><div class="hint" style="font-size:11.5px">Cada año la academia puede promover a un juvenil: más nivel, más probabilidad y más potencial.</div>`;
  if(na<FTC_ACA.length){const cost=FTC_ACA[na][1]*1e6*(.4+.6*rc);h+=ft7it('aca',`${ftUSD(cost)} · abre de inmediato`,o.caja>=cost,`🌱 Abrir: ${FTC_ACA[na][0]}`,'Falta caja');}
  return h;}
function ftcFinHTML(o,c){const y=o.h.slice(-12);const s=k=>y.reduce((a,x)=>a+(x[k]||0),0);const row=(a,v,neg)=>`<div class="frow"><span>${a}</span><span class="${neg?'neg':''}">${neg?'−':''}${ftUSD(Math.abs(v))}</span></div>`;
  const inc=s(4)+s(5)+s(6)+s(7)+s(8),cost=s(9)+s(10)+s(11);const rev=Math.max(1e5,ftcRev(c,{mood:o.mood,pr:o.pr}).t);
  let h=`<div class="kv">${ft7kv('Caja del club',`<span style="color:${o.caja>=0?'#3ccf8e':'#ff5a5a'}">${ftUSD(o.caja)}</span>`)+ft7kv('Invertido por ti',ftUSD(o.inv))}</div>`;
  h+=`<div class="sect">Últimos 12 meses</div><div class="fin">${row('Boletos',s(4))+row('Televisión',s(5))+row('Patrocinios y tienda',s(6))+row('Premios',s(7))+row('Venta de jugadores',s(8))+row('Sueldos',s(9),1)+row('Operación y mantenimiento',s(10),1)+row('Fichajes y obras',s(11),1)}<div class="frow tot"><span>Resultado</span><span class="${inc-cost<0?'neg':''}">${inc-cost<0?'−':''}${ftUSD(Math.abs(inc-cost))}</span></div></div>`;
  h+=`<div class="sect">Boletos</div><div class="seg">${FTC_PR.map((p,i)=>`<button data-pr7="${i}" class="${o.pr===i?'on':''}">${p[0]}</button>`).join('')}</div><div class="kv">${ft7kv('Precio promedio del boleto',ftUSD(ftcPrice(c,o.pr)))+ft7kv('Asistencia del último mes',fmtK(o.att||0))}</div><div class="hint" style="font-size:11.5px">Los boletos baratos llenan el estadio y alegran a la afición; los caros dejan lugares vacíos.</div>`;
  const am=[.05,.2,.5].map(f=>Math.max(1e5,Math.round(rev*f/1e5)*1e5));
  h+=`<div class="sect">Capital</div><div class="hint" style="font-size:11.5px">Si la caja queda en números rojos, la cubres de tu bolsillo; si no puedes, el club entra en administración.</div>`+am.map((v,i)=>ft7it('in'+i,`De tu dinero a la caja del club`,P.dinero>=toInt(v,'USD'),`➕ Aportar ${ftUSD(v)}`,'No te alcanza')).join('')+am.map((v,i)=>ft7it('wd'+i,`De la caja del club a tu dinero`,o.caja>=v,`💵 Retirar ${ftUSD(v)}`,'Falta caja')).join('');
  if(!c.l){const LL=ftcLowest(c.c);if(LL&&LL.t===1){const f=ftcFranCost(c);h+=`<div class="sect">Plaza en la liga</div>`+ft7it('fran',o.fran?'Ya la compraste':`${ftUSD(f)} · entras al terminar la temporada si cumples la licencia`,!o.fran&&o.caja>=f,`📋 Comprar una plaza en la ${LL.n}`,o.fran?'':'Falta caja');}}
  return h;}
function ftcBind(b){const re=()=>showFTC();const R7=(r,ic)=>{if(r){log(r);toast(ic||'⚽',r);}save();render();re();};
  b.querySelectorAll('[data-t7]').forEach(x=>x.onclick=()=>showFTC(x.dataset.t7));b.querySelectorAll('[data-lg7]').forEach(x=>x.onclick=()=>{FT7.lg=x.dataset.lg7;re();});
  b.querySelectorAll('[data-c17]').forEach(x=>x.onclick=()=>{FT7.c1=+x.dataset.c17;re();});b.querySelectorAll('[data-c27]').forEach(x=>x.onclick=()=>{FT7.c2=+x.dataset.c27;re();});
  b.querySelectorAll('[data-mf7]').forEach(x=>x.onclick=()=>{FT7.mf=x.dataset.mf7;re();});b.querySelectorAll('[data-wk7]').forEach(x=>x.onclick=()=>{P.ftc.wk=+x.dataset.wk7;save();re();});
  b.querySelectorAll('[data-pr7]').forEach(x=>x.onclick=()=>{P.ftc.pr=+x.dataset.pr7;save();re();});b.querySelectorAll('[data-sty7]').forEach(x=>x.onclick=()=>R7(ftcSelf(P,x.dataset.sty7)));
  b.querySelectorAll('[data-f7]').forEach(x=>x.onclick=()=>{const a=x.dataset.f7;const o=P.ftc;
    if(/^buy:/.test(a))askText('¿Comprar este club?',null,()=>{const r=ftcBuy(P,a.slice(4));if(r)log(r,'big');toast('💼',r);save();render();showFTC('res');},'Comprar');
    else if(a==='found'){const nid=natOf(P).id;const sug=ftClubNames(nid,1,FT_LANG[cultOf(nid)]||'xx')[0][0];askText('Nombre del club',sug,v=>{const r=ftcFound(P,v,[FT_COLS[FT7.c1],FT_COLS[FT7.c2]]);if(r)log(r,'big');toast('🏟️',r);save();render();showFTC('res');},'Fundar');}
    else if(a==='sell')askText('¿Vender tu club?',null,()=>{const r=ftcSellClub(P);log(r,'big');toast('💰',r);save();render();showFTC();},'Vender');
    else if(/^dt:/.test(a))askText('¿Contratar a este entrenador?',null,()=>R7(ftcHireDT(P,a.slice(3)),'👤'),'Contratar');
    else if(a==='self')askText('¿Dirigir tú mismo al equipo?',null,()=>R7(ftcSelf(P),'📣'),'Sí');
    else if(/^st\d$/.test(a))R7(ftcBuild(P,'st',+a.slice(2)),'🏟️');else if(a==='cen')R7(ftcBuild(P,'cen'),'🏋️');else if(a==='aca')R7(ftcBuild(P,'aca'),'🌱');
    else if(/^(in|wd)\d$/.test(a)){const c=FTW().C[o.c];const rev=Math.max(1e5,ftcRev(c,{mood:o.mood,pr:o.pr}).t);const v=Math.max(1e5,Math.round(rev*[.05,.2,.5][+a.slice(2)]/1e5)*1e5);R7(a[0]==='i'?ftcInject(P,v):ftcWithdraw(P,v),'💵');}
    else if(a==='fran')R7(ftcFran(P),'📋');
    else if(/^bs:/.test(a))R7(ftcBuyStar(P,a.slice(3)),'✍️');
    else if(/^ss:/.test(a)){const r=ftcSellAsk(P,a.slice(3));if(!r.to){if(r.t)toast('💰',r.t);re();return;}save();FT7.tab='mer';re();}
    else if(a==='soy'||a==='son')R7(ftcSellDo(P,a==='soy'),'💰');
    else if(/^b[ar]\d$/.test(a))R7(ftcBidAns(+a.slice(2),a[1]==='a'),'✍️');
    else if(/^lic\d$/.test(a)){const lv=+a.slice(3);useAct(()=>ftlCourse(P,lv),ftlLabel(P,lv));save();render();re();}});}

/* ----- ayuda ⓘ y Guía ----- */
(function(){const H=[
 ['Estilo del DT','Estilo del DT','Cada entrenador tiene una idea de juego: posesión, presión alta, contragolpe, bloque bajo o juego directo. Unos estilos neutralizan a otros: la presión alta incomoda a los equipos de posesión, pero deja espacio para el contragolpe.','El choque de estilos y la calidad del DT mueven poco la fuerza de cada partido. Cuando cambia el estilo, el plantel tarda unos meses en adaptarse. Toca un club en cualquier tabla para ver a su DT.'],
 ['Encaje táctico','Encaje táctico','Un jugador puede brillar con un entrenador y quedarse en la banca con otro: cada sistema pide cualidades distintas.','Compara tus atributos con los que más valora el estilo de tu DT. Un buen encaje te acerca a la titularidad; cuando llega un DT nuevo, su confianza en ti empieza de cero.'],
 ['Modelo de negocio','Modelos de negocio','Los clubes grandes compran figuras y venden caro; muchos clubes de Portugal, Países Bajos o Sudamérica viven de vender jugadores a las ligas ricas; otros apuestan por su cantera.','El modelo decide qué tan fácil vende un club, a qué precio y quién compra en cada ventana. Los clubes de cantera sacan juveniles con más potencial.'],
 ['Masa salarial','Masa salarial','En el fútbol la fuerza del equipo sigue muy de cerca a lo que paga en sueldos: los estudios sobre las ligas europeas encuentran que la masa salarial explica la mayor parte de la posición en la tabla.','La masa salarial te coloca en la tabla de gasto de tu liga y la fuerza del equipo se acerca poco a poco a la que paga. Los sueldos de las figuras cuentan.'],
 ['Estadio mínimo para la licencia','Licencia de la liga','Las ligas piden requisitos para competir: aforo mínimo del estadio, instalaciones de entrenamiento y finanzas en orden.','En primera división hace falta un centro de entrenamiento. Si tu club termina en zona de ascenso sin licencia, sube el siguiente; en primera, la liga te multa cada temporada.'],
 ['Tu licencia','Licencias de entrenador','Para dirigir en las ligas profesionales se exige una licencia: en Europa la UEFA C, B, A y Pro, con cursos de varios meses.','Con la B diriges un club regional, con la A uno de segunda y con la Pro uno de primera. Tu fuerza como DT sube cada mes que diriges.'],
 ['Permiso de obra','Permisos de obra','Las obras grandes, como ampliar un estadio, necesitan permiso del ayuntamiento y pueden tardar o ser rechazadas.','El permiso cuesta 1 % de la obra y tarda de 2 a 4 meses; 15 % de las veces se rechaza. Solo puede haber una obra a la vez.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const gi=GUIA.findIndex(g=>/Fútbol/.test(g[0]));GUIA.splice(gi>=0?gi+1:GUIA.length,0,['⚽ Fútbol mánager',`<b>Entrenadores:</b> cada club tiene un DT con estilo (posesión, presión alta, contragolpe, bloque bajo, juego directo o equilibrado) y calidad. Los destituyen por malos resultados y los clubes grandes se llevan a los que destacan.
<ul><li><b>Encaje táctico:</b> si eres futbolista, tus atributos se comparan con los que pide el estilo de tu DT.</li>
<li><b>Mercado:</b> clubes compradores, vendedores, de cantera y equilibrados; ventanas en verano (junio a agosto) y en enero. En ⚽ Fútbol mundial → Mercado ves fichajes, valores y el dinero de cada liga.</li>
<li><b>Tu club:</b> cómpralo o fúndalo desde el menú Carrera o desde ⚽ Fútbol mundial. Decides la masa salarial, el precio de los boletos, los fichajes y quién dirige.</li>
<li><b>Instalaciones:</b> amplía el estadio (con permiso de obra), construye el centro de entrenamiento y abre una academia.</li>
<li><b>Licencias:</b> con la licencia adecuada puedes dirigir tú mismo a tu club.</li></ul>`]);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v17s',e);}}
