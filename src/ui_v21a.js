/* ===================== v2.1a: fase 4 de la ruta 9d (economía conectada), parte 1 — interfaz =====================
   Mis empresas sin tope (aviso de atención), 🛒 Empresas en venta (auditoría, oferta con dado, compra apalancada),
   🏛️ Grupos (director, sinergias, barrer caja, préstamo interno), control de empresas en bolsa (OPA, estrategia, director). */

const V21={grp:null};
const grpNm=g=>g.n===`Grupo ${P.surname}`?g.n:`<span data-noi18n>${clean(g.n)}</span>`; /* un nombre escrito por el jugador no se traduce */
function v21Dice(r){return r&&r.pc!=null?`<div class="dice v21d"><span>🎲 ${r.roll}</span> <span>Necesitabas ${r.pc} o menos.</span></div>`:'';}
function v21Res(r,back){if(!r)return;const t=typeof r==='string'?r:r.t;if(!t){back&&back();return;}log(t,r.ok===false?'bad':r.ok?'good':'');save();render();
  if(r&&r.roll!=null){showModal(`<h2>${r.ok?'✅':'❌'}</h2><p>${t}</p>${v21Dice(r)}<button class="opt" id="v21ok">Continuar</button>`,m=>m.querySelector('#v21ok').onclick=()=>{hideModal();back&&back();});}else{toast('🏢',t);back&&back();}}

/* ---------- Mis empresas: sin tope, aviso de atención y accesos nuevos ---------- */
{const _sb=showBiz;showBiz=function(...a){const r=_sb(...a);try{v21Biz();}catch(e){console.warn('v21 empresas',e);}return r;};showBiz._shk=1;}
function v21Biz(){const B=$('sheetIn');if(!B||!P||!B.querySelector('#bzNew')||B.querySelector('#v21b'))return;const L=bzList(P).filter(b=>b.v14);const self=bzSelf(P);
  const nb=B.querySelector('#bzNew');nb.disabled=false;
  const h0=[...B.querySelectorAll('.hint')].find(x=>/Máximo/.test(x.textContent));if(h0)h0.innerHTML=`<span>Cada mes tu empresa vende, paga insumos, nómina, renta, impuestos y deudas; lo que reparte llega a tu dinero.</span> <span>Puedes dirigir en persona hasta ${BZ_ATT} empresas; más allá, agrúpalas con un director.</span>`;
  B.querySelectorAll('.plt').forEach(t=>{const s=t.querySelector('small');if(s&&s.textContent.trim()==='Empresas'){const b=t.querySelector('b');if(b)b.textContent=String(L.length);let i=t.querySelector('i');if(!i){i=document.createElement('i');t.appendChild(i);}i.textContent=`${self} en persona`;}});
  B.querySelectorAll('[data-bi]').forEach(x=>{const b=bzList(P)[+x.dataset.bi];const g=b&&grpOf(P,b);if(g){const s=x.querySelector('.s');if(s)s.insertAdjacentHTML('afterbegin',`<span class="v21g">🏛️ ${grpNm(g)}</span> `);}});
  const d=document.createElement('div');d.id='v21b';const G2=grpEnsure(P),C=ctlList(P);
  d.innerHTML=(self>BZ_ATT?`<div class="hint v21w"><span>⚠️ Diriges ${self} empresas en persona: no te alcanza el tiempo y cada mes todas pierden ${(.6*(self-BZ_ATT)).toFixed(1)} puntos de reputación.</span> <span>Crea un grupo con director para recuperarla.</span></div>`:'')+
   `<div class="v21row"><button class="btn" id="v21m">🛒 <span>Empresas en venta</span></button><button class="btn" id="v21g">🏛️ <span>Grupos</span> (${G2.length})</button></div>`+
   (C.length?`<div class="sect">📈 Controladas en bolsa</div>`+C.map(id=>{const c=G.mk.C[id];const ps=P.bk.pos[id];return `<button class="bzc" data-ctl="${id}"><div class="h"><b>${gxLogo(c.nm,c.sec,20)} ${c.nm}</b><span>${Math.round(ps.q/c.sh*100)} %</span></div><div class="s"><span>${SECT[c.sec][0]}</span> · <span>Estrategia: ${CTL_ST[c.ctl.st][0]}</span>${c.ctl.dir?` · <span>${c.ctl.dir.n}</span>`:''}</div></button>`;}).join(''):'');
  nb.before(d);d.querySelector('#v21m').onclick=showBzMarket;d.querySelector('#v21g').onclick=()=>showGroups();d.querySelectorAll('[data-ctl]').forEach(x=>x.onclick=()=>showStock(x.dataset.ctl));}

/* ---------- 🛒 Empresas en venta ---------- */
function showBzMarket(){if(!P||!G)return;ensureV14();const M=bzmEnsure(P);let h=`<button class="btn" id="v21bk" style="margin-bottom:6px">← Mis empresas</button><h3>🛒 Empresas en venta</h3>
  <div class="hint"><span>Negocios de ${natOf(P).name} cuyos dueños quieren vender. Las cifras son las que declara el vendedor: pueden estar maquilladas.</span> <span>Una auditoría revisa libros y deudas antes de comprar.</span> <span>La lista se renueva cada 6 meses.</span></div>`;
  if(!M.L.length)h+=`<div class="hint">Por ahora no hay empresas en venta.</div>`;
  M.L.forEach(o=>{const b=o.b,T=bzT(b),D=bzmDecl(o);
    h+=`<div class="bzc v21o"><div class="h"><b>${T.ic} ${b.n}</b><span>${fmt(o.ask)}</span></div>
     <div class="s"><span>${T.n}</span> · <span>${RG[b.r].nm}</span> · <span>${b.br} ${b.br>1?'sucursales':'sucursal'}</span> · <span>${b.st} empleados</span> · <span>reputación ${Math.round(b.rep)}</span></div>
     <div class="kv kvt"><div><span>Ventas al año</span><b>${fmt(D.rev)}</b></div><div><span>Utilidad al año</span><b style="color:${D.net<0?'var(--red)':'var(--green)'}">${fmt(D.net)}</b></div><div><span>Deuda</span><b>${fmt(D.debt)}</b></div><div><span>Caja</span><b>${fmt(D.cash)}</b></div></div>
     <div class="v21tags">${o.aud?`<span class="pill">🔍 Auditada</span>`:''}${o.aud&&o.hd?`<span class="pill war">⚠️ Deuda oculta: ${fmt(o.hd)}</span>`:''}${o.urg?`<span class="pill">⏳ Vendedor con prisa</span>`:''}${o.neg?`<span class="pill">Ofertas rechazadas: ${o.neg}</span>`:''}</div>
     ${o.aud?'':`<button class="btn" data-aud="${o.id}">🔍 <span>Auditar (${fmt(bzmAuditCost(P,o))})</span></button>`}
     <div class="v21of">${BZM_PCT.map(([f],i)=>{const pr=bzmPrice(o,i,false);return `<button class="btn${i===2?' gold':''}" data-of="${o.id}:${i}" ${P.dinero<pr.cash*.5?'disabled':''}><b>${Math.round(f*100)} %</b><small>${fmt(pr.pr)}</small><small>${bzmChance(o,i)} %</small></button>`;}).join('')}</div>
     <label class="v21ln"><input type="checkbox" data-ln="${o.id}"> <span>Con crédito: pagas la mitad y la otra mitad queda como deuda de la empresa</span></label></div>`;});
  openSheetRaw(h,B=>{B.querySelector('#v21bk').onclick=showBiz;
    B.querySelectorAll('[data-aud]').forEach(x=>x.onclick=()=>{const r=bzmAudit(P,+x.dataset.aud);if(r){log(r,'news');save();toast('🔍 Auditoría',r);}showBzMarket();});
    B.querySelectorAll('[data-of]').forEach(x=>x.onclick=()=>{const s=x.dataset.of,k=s.lastIndexOf(':');const id=+s.slice(0,k),i=+s.slice(k+1);const ln=B.querySelector(`[data-ln="${id}"]`);
      const r=bzmOffer(P,id,i,!!(ln&&ln.checked));if(r.ok){const L=lrnEnsure(P);['Patrimonio','Utilidad'].forEach(c=>L.c[c]=L.c[c]||G.year);if(ln&&ln.checked)L.c['Compra apalancada']=L.c['Compra apalancada']||G.year;}
      if(r.roll==null&&r.t){toast('🛒',r.t);return;}v21Res(r,r.ok?showBiz:showBzMarket);});});}

/* ---------- 🏛️ Grupos ---------- */
function showGroups(gid){if(!P||!G)return;ensureV14();const G2=grpEnsure(P);if(gid!=null){const g=G2.find(x=>x.id===gid);if(g)return showGroup(g);}
  let h=`<button class="btn" id="v21bk" style="margin-bottom:6px">← Mis empresas</button><h3>🏛️ Grupos</h3><div class="hint"><span>Un grupo (conglomerado) reúne varias de tus empresas bajo un director.</span> <span>Así puedes tener todas las que quieras sin perder atención, y las del mismo giro comparten clientes y proveedores (sinergias).</span></div>`;
  G2.forEach(g=>{const S=grpSum(P,g);h+=`<button class="bzc" data-g="${g.id}"><div class="h"><b>🏛️ ${grpNm(g)}</b><span class="chg ${S.net>=0?'up':'dn'}">${fmt(S.net)}/mes</span></div><div class="s"><span>${S.n} empresas</span> · <span>${S.st} empleados</span> · <span>${g.dir?g.dir.n:'Sin director'}</span> · <span>valor ${fmt(S.val)}</span></div></button>`;});
  h+=`<button class="btn gold" id="v21new" style="width:100%;margin-top:8px">➕ <span>Crear un grupo</span></button>`;
  openSheetRaw(h,B=>{B.querySelector('#v21bk').onclick=showBiz;B.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>showGroups(+x.dataset.g));
    B.querySelector('#v21new').onclick=()=>askText('Nombre del grupo',`Grupo ${P.surname}`,v=>{const id=grpNew(P,(v||'').trim()||`Grupo ${P.surname}`);save();hideModal();showGroups(id);});});}
function showGroup(g){const S=grpSum(P,g),M=grpMembers(P,g),free=bzList(P).filter(b=>b.v14&&!grpOf(P,b));
  let h=`<button class="btn" id="v21bk" style="margin-bottom:6px">← Grupos</button><h3>🏛️ ${grpNm(g)}</h3>`+
   v19Tiles([['Empresas',String(S.n)],['Ventas al mes',fmt(S.rev)],['Utilidad al mes',fmt(S.net),'',S.net<0?'var(--red)':'var(--green)'],['Valor estimado',fmt(S.val)],['Caja',fmt(S.cash)],['Deuda',fmt(S.debt)]],2);
  h+=`<div class="sect">👔 Director</div>`;
  if(g.dir)h+=`<div class="item"><span><div class="t">${g.dir.n}</div><div class="s"><span>${GRP_ST[g.dir.st][0]}</span> · <span>capacidad ${g.dir.q}</span> · <span>${fmt(g.dir.sal)} al año</span></div><div class="s">${GRP_ST[g.dir.st][1]}</div></span></div><button class="btn" id="v21fire">❌ <span>Despedir</span></button>`;
  else{const C=g.cand||grpCands(P,g);h+=`<div class="hint">Sin director, las empresas del grupo no reciben sus mejoras. Su sueldo lo pagan las empresas del grupo.</div>`+C.map((c,i)=>`<button class="item" data-hire="${i}"><span><div class="t">${c.n}</div><div class="s"><span>${GRP_ST[c.st][0]}</span> · <span>capacidad ${c.q}</span> · <span>${fmt(c.sal)} al año</span></div><div class="s">${GRP_ST[c.st][1]}</div></span></button>`).join('');}
  h+=`<div class="sect">🏪 Empresas del grupo</div>`+(M.length?M.map(b=>{const m=b.m[b.m.length-1]||{};const T=bzT(b);return `<div class="item"><span><div class="t">${T.ic} ${b.n}</div><div class="s"><span>${fmt(m.net||0)}/mes</span>${m.syn?` · <span>sinergias ${fmt(m.syn)}/mes</span>`:''}${m.ef?` · <span>ahorros ${fmt(m.ef)}/mes</span>`:''}</div></span><button class="btn" data-out="${bzList(P).indexOf(b)}">↩ <span>Sacar</span></button></div>`;}).join(''):`<div class="hint">Aún no tiene empresas.</div>`);
  if(free.length)h+=`<div class="sect">➕ Agregar al grupo</div>`+free.map(b=>`<button class="item" data-in="${bzList(P).indexOf(b)}"><span><div class="t">${bzT(b).ic} ${b.n}</div><div class="s">${bzT(b).n} · ${RG[b.r].nm}</div></span></button>`).join('');
  h+=`<div class="sect">⚙️ Acciones</div><div class="v21row"><button class="btn" id="v21sw">💰 <span>Barrer caja</span></button><button class="btn" id="v21ln">🔁 <span>Préstamo interno</span></button></div>
   <div class="v21row"><button class="btn" id="v21rn">✏️ <span>Renombrar</span></button><button class="btn" id="v21del">🗑️ <span>Disolver</span></button></div>`;
  openSheetRaw(h,B=>{const re=()=>{save();render();showGroup(g);};B.querySelector('#v21bk').onclick=()=>showGroups();
    const f=B.querySelector('#v21fire');if(f)f.onclick=()=>{const r=grpFire(P,g);log(r);re();};
    B.querySelectorAll('[data-hire]').forEach(x=>x.onclick=()=>{const r=grpHire(P,g,+x.dataset.hire);log(r,'good');lrnEnsure(P).c['Conglomerado']=lrnEnsure(P).c['Conglomerado']||G.year;re();});
    B.querySelectorAll('[data-out]').forEach(x=>x.onclick=()=>{const b=bzList(P)[+x.dataset.out];if(b)delete b.g;re();});
    B.querySelectorAll('[data-in]').forEach(x=>x.onclick=()=>{const b=bzList(P)[+x.dataset.in];if(b)b.g=g.id;re();});
    B.querySelector('#v21sw').onclick=()=>{const r=grpSweep(P,g);log(r);toast('💰',r);re();};B.querySelector('#v21ln').onclick=()=>{const r=grpLend(P,g);log(r);toast('🔁',r);re();};
    B.querySelector('#v21rn').onclick=()=>askText('Nombre del grupo',g.n,v=>{if((v||'').trim())g.n=v.trim();hideModal();re();});
    B.querySelector('#v21del').onclick=()=>{const r=grpDel(P,g);log(r);save();render();showGroups();};});}

/* ---------- control de empresas en bolsa ---------- */
{const _ss=showStock;showStock=function(id,...a){const r=_ss(id,...a);try{v21Stock(id);}catch(e){console.warn('v21 bolsa',e);}return r;};showStock._shk=1;}
function v21Stock(id){const B=$('sheetIn');if(!B||!P||!G.mk||!opaOk(id)||B.querySelector('#v21c'))return;const I=opaInfo(P,id),c=I.c;const d=document.createElement('div');d.id='v21c';
  let h=`<div class="sect">🏢 Control de la empresa</div>`;
  if(I.ctl){h+=v19Tiles([['Tus acciones',pctI(I.pct)],['Estrategia',CTL_ST[c.ctl.st][0]],['Dividendo al año',pct(c.dy)],['Director',c.ctl.dir?c.ctl.dir.n:'—',c.ctl.dir?`capacidad ${c.ctl.dir.q}`:'']],2);
    h+=`<div class="hint"><span>Controlas ${c.nm}: decides su estrategia y su director. Si vendes acciones y bajas del 50 %, pierdes el control.</span></div><div class="v21of v21st">`+Object.entries(CTL_ST).map(([k,S])=>`<button class="btn${c.ctl.st===k?' gold':''}" data-st="${k}"><b>${S[0]}</b><small>${S[1]}</small></button>`).join('')+`</div>`;
    const C=c.ctl.cand;h+=C?C.map((x,i)=>`<button class="item" data-dh="${i}"><span><div class="t">${x.n}</div><div class="s">capacidad ${x.q}</div></span></button>`).join(''):`<button class="btn" id="v21dc">👔 <span>${c.ctl.dir?'Cambiar de director':'Elegir director'}</span></button>`;}
  else{h+=`<div class="hint"><span>Con más del 50 % de las acciones controlas la empresa. Una oferta pública de adquisición (OPA) compra a todos los accionistas que quieran vender con una prima sobre el precio de hoy: a más prima, más aceptan.</span></div>`+
     v19Tiles([['Tus acciones',pctI(I.pct)],['Te faltan',fmtK(I.need)+' acc.'],['Valor de mercado',fmt(toInt(c.p*c.sh,I.cur))]],2);
    if(I.tried)h+=`<div class="hint">Ya lanzaste una oferta este año: los accionistas no aceptan otra hasta el próximo.</div>`;
    h+=`<div class="v21of">`+I.opts.map((o,i)=>`<button class="btn${i===1?' gold':''}" data-opa="${i}" ${!o.ok||I.tried?'disabled':''}><b><span>Prima</span> ${Math.round(o.pr*100)} %</b><small>${fmt(o.cost)}</small><small>${o.pc} %</small></button>`).join('')+`</div>`;}
  d.innerHTML=h;B.appendChild(d);
  d.querySelectorAll('[data-opa]').forEach(x=>x.onclick=()=>{const r=opaDo(P,id,+x.dataset.opa);if(r.ok){const L=lrnEnsure(P);['Oferta pública de adquisición','Prima de control'].forEach(k=>L.c[k]=L.c[k]||G.year);}if(r.roll==null){toast('🏢',r.t);return;}v21Res(r,()=>showStock(id));});
  d.querySelectorAll('[data-st]').forEach(x=>x.onclick=()=>{const r=ctlSet(id,x.dataset.st);log(r);save();showStock(id);});
  const dc=d.querySelector('#v21dc');if(dc)dc.onclick=()=>{ctlCands(P,id);showStock(id);};
  d.querySelectorAll('[data-dh]').forEach(x=>x.onclick=()=>{const r=ctlHire(id,+x.dataset.dh);log(r,'good');save();showStock(id);});}

/* ---------- glosario, ayuda ⓘ y Guía ---------- */
GLOS.push(
 ['Oferta pública de adquisición','Oferta para comprar las acciones de una empresa en bolsa a todos sus accionistas, a un precio fijo, para tomar el control. Se conoce por sus siglas, OPA.',['oferta pública de adquisición','OPA'],3],
 ['Prima de control','Lo que se paga por encima del precio de mercado para convencer a los accionistas de vender y quedarse con el control.',['prima'],3],
 ['Auditoría (due diligence)','Revisión de los libros, contratos y deudas de una empresa antes de comprarla, para no pagar de más por cifras maquilladas.',['auditoría','due diligence'],3],
 ['Compra apalancada','Comprar una empresa con mucho dinero prestado que después paga la propia empresa con sus utilidades. Multiplica la ganancia y el riesgo.',['compra apalancada','apalancada'],3],
 ['Conglomerado','Grupo de empresas de giros distintos bajo un mismo dueño y una dirección común.',['conglomerado'],3],
 ['Sinergia','Ahorro o venta extra que aparece al juntar empresas que comparten clientes, proveedores o procesos.',['sinergia','sinergias'],3]);
V20.gt=null;
(function(){const H=[
 ['Empresas en venta','🛒 Empresas en venta','Comprar una empresa que ya funciona ahorra el arranque, pero el comprador sabe menos que el vendedor (información asimétrica): por eso existen las auditorías y por eso se negocia el precio.','Cada 6 meses aparecen negocios de tu país con 12 meses de historia real. Las cifras pueden estar maquilladas y algunas esconden deudas: la auditoría las revela. Ofreces 80, 90 o 100 % del precio con probabilidad visible; con prisa del vendedor sube la probabilidad. Con crédito pagas la mitad y la otra mitad queda como deuda de la empresa.'],
 ['Grupos','🏛️ Grupos','Los conglomerados reúnen empresas bajo una dirección común: ahorran costos y comparten clientes (sinergias), pero un mal director afecta a todas a la vez.','Puedes dirigir en persona hasta 5 empresas; desde la 6.ª, todas pierden reputación cada mes. En un grupo con director no: él cobra un sueldo (lo pagan las empresas) y, según su estilo, abre sucursales, recorta costos o paga deudas. Las empresas del mismo giro suman sinergias.'],
 ['Control de la empresa','🏢 Control en bolsa','Quien tiene más de la mitad de las acciones con voto nombra al consejo y decide la estrategia. Para conseguirla se lanza una oferta pública con una prima sobre el precio.','Con el 51 % eliges estrategia (crecer, eficiencia o dividendos) y director. Crecer sube las utilidades y baja los dividendos; dividendos hace lo contrario. Si bajas del 50 %, pierdes el control. Solo un intento de OPA por empresa al año.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🏢 Comprar empresas y grupos',`<b>Ya no hay tope de empresas</b>, pero sí de atención: puedes dirigir en persona hasta 5; desde la 6.ª, todas pierden reputación cada mes hasta que las agrupes.
<ul><li><b>🛒 Empresas en venta</b> (Mis empresas): negocios de tu país con historia real. Revisa las cifras con una <b>auditoría</b> antes de ofrecer: algunas esconden deudas o inflan sus ventas. Ofreces 80, 90 o 100 % del precio y el dado decide; puedes pagar la mitad con crédito (queda como deuda de la empresa).</li>
<li><b>🏛️ Grupos:</b> reúne empresas, contrata un director (crecimiento, eficiencia o conservador) y aprovecha las sinergias entre empresas del mismo giro. Barre la caja de sobra hacia tu dinero o muévela a la empresa que la necesite.</li>
<li><b>🏢 Control en bolsa:</b> en la ficha de una empresa de la Bolsa, lanza una <b>OPA</b> por el 51 % con prima de 20, 30 o 40 %. Con el control eliges su estrategia y su director; los dividendos llegan a tu dinero.</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🎓 Aprender/.test(g[0]));GUIA.splice(gi>=0?gi+1:0,0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v21a',e);}}
if(typeof shWrapAll==='function')shWrapAll();

(function(){const st=document.createElement('style');st.id='v21acss';st.textContent=`
.v21row{display:flex;gap:6px;margin:6px 0}.v21row .btn{flex:1}
.v21w{border-inline-start:3px solid var(--red);padding-inline-start:8px}
.v21g{color:var(--teal);font-weight:600}
.v21o{cursor:default}.v21o .kv{margin:6px 0}
.v21tags{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
.v21of{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}.v21of .btn{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 4px}
.v21of .btn small{font-size:11.5px;opacity:.85}.v21st{grid-template-columns:repeat(2,1fr)}.v21st .btn small{text-align:center;line-height:1.25}
.v21ln{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--mut);margin:4px 0 2px;text-align:start}.v21ln span{flex:1;text-align:start}.v21ln input{margin-top:2px}
.v21d{margin:8px 0;font-size:14px}
`;document.head.appendChild(st);})();
