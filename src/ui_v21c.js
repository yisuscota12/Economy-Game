/* ===================== v2.1c: fase 4 de la ruta 9d (economía conectada), parte 3 — interfaz (cierra la fase 4) =====================
   🩺 Salud de la economía (Más, Mis empresas, ficha de empresa, País → Economía): medidores 0–100 con causas en 5 pestañas —
   Empresas (financiera y social de cada empresa, grupos, cartera), Bancos (del país, tus cuentas, tu banco), Gobierno (salud fiscal
   y social), Organizaciones (FMI y sistema mundial, Banco Mundial, tu banco, club, gimnasio y promotora) y Riesgo (riesgo sistémico,
   cadena de contagio, vecinos en crisis, países con más riesgo). Medidores también en la ficha de cada empresa; sector y riesgo de
   recorte en 💼 Tu empleo; sector y estado de empleo de familia y amigos en Personas y Familia; «Ayudar con dinero»; modo de mapa 🩺;
   «Te conviene» (Fácil) cuando el sector de una empresa tuya baja de 40; «¿Sabías que…?» de crisis reales; glosario, Guía y ⓘ. */

const HZ_LVN=['Crítica','Frágil','Estable','Sana'],HZ_RKN=['Bajo','Moderado','Alto','Muy alto'];
const HZ_CL={mg:'Margen de utilidad',rep:'Reputación',gr:'Crecimiento de las ventas',deuda:'Deuda frente a ventas',sueldo:'Sueldos frente al mercado',carga:'Carga de trabajo',
  perd:'Pérdidas que amenazan empleos',sector:'Salud de su sector',prov:'Demanda de la provincia',fin:'Salud de sus empresas',div:'Diversificación',apal:'Endeudamiento',dir:'Director',
  deud:'Sus deudores',rev:'Recuperación natural',reg:'Regulación',rec:'Recesión',tasa:'Alza de tasas',stab:'Estabilidad política',aus:'Programa de austeridad',cap:'Capital frente a préstamos',
  costo:'Costo de la deuda frente al crecimiento',tes:'Tesoro',res:'Reservas internacionales',inf:'Inflación',fmi:'Programa del FMI',war:'Guerra',apr:'Aprobación del gobierno',
  hap:'Felicidad de la población',hog:'Consumo de los hogares',crec:'Crecimiento mundial',crb:'Países en crisis bancaria',recs:'Países en recesión',oil:'Precio del petróleo',
  bk:'Bancos débiles',cr:'Crisis bancaria activa',sec:'Sectores frágiles',conc:'Economía concentrada',cont:'Contagio de vecinos',flujo:'Ingresos frente a gastos',caja:'Caja',afi:'Ánimo de la afición'};
const HZ_CLX={fisc:{deuda:'Deuda pública'},risk:{deuda:'Deuda pública alta',res:'Reservas que amortiguan',hog:'Hogares en apuros'},world:{fmi:'Programas del FMI activos'}};
const HZV={tab:'emp',nid:null,open:{}};
const hzCol=(v,inv)=>shCol(inv?100-v:v);
const hzSecN=k=>k==='gob'?'Gobierno':(SECT[k]?SECT[k][0]:k);
function hzCz(M,ty,inv,max){return M.L.slice().sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,max||10).map(([k,v])=>`<span class="v21cz"><span>${(HZ_CLX[ty]&&HZ_CLX[ty][k])||HZ_CL[k]||k}</span> <b class="${(v>=0)!==!!inv?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('');}
// medidor: id (para recordar si está abierto), ícono, título, M={v,L}, ty (tipo de causas), o={inv (riesgo), sub, note}
function hzMeter(id,ic,title,M,ty,o){o=o||{};const v=M.v,inv=!!o.inv;const col=hzCol(v,inv);const lv=inv?HZ_RKN[hzRk(v)]:HZ_LVN[hzLv(v)];const cls=inv?['ok','mid','low','bad'][hzRk(v)]:['bad','low','mid','ok'][hzLv(v)];
  const op=HZV.open[id];const cz=M.L&&M.L.length?hzCz(M,ty,inv):`<span class="v21cz"><span>${M.nd?'Aún no cierra su primer mes.':'Todo en su nivel normal.'}</span></span>`;
  return `<div class="hzm${op?' open':''}" data-hz="${id}"><button class="hzh"><span class="hzt">${ic} <span>${title}</span></span><span class="hzv"><b style="color:${col}">${v}</b><small>/100</small> <span class="hzp ${cls}">${lv}</span></span></button>
   <div class="hzb"><i style="width:${v}%;background:${col}"></i></div>${o.sub?`<div class="hzs">${o.sub}</div>`:''}<div class="hzc">${o.note?`<div class="hzn">${o.note}</div>`:''}<div class="v21cs">${cz}</div></div></div>`;}
function hzBind(B){B.querySelectorAll('.hzm .hzh').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=b.closest('.hzm');const id=m.dataset.hz;HZV.open[id]=!HZV.open[id];m.classList.toggle('open',!!HZV.open[id]);});}
function hzLrn(...k){try{v21bLrn(...k);}catch(e){}}
function hzCountries(){const home=natOf(P).id;const s=new Set([home]);bzList(P).forEach(b=>{const x=G.regions[b.r];if(x&&G.nations[x.o]&&G.nations[x.o].alive)s.add(x.o);});
  (neighborsOf(home)||[]).slice(0,3).forEach(id=>{if(G.nations[id]&&G.nations[id].alive)s.add(id);});Object.values(G.nations).filter(n=>n.alive).sort((a,b)=>b.gdp-a.gdp).slice(0,6).forEach(n=>s.add(n.id));return [...s];}
function hzChips(nid){const cs=hzCountries();if(!cs.includes(nid))cs.push(nid);
  return `<div class="chips v21cc">${cs.map(id=>`<button data-hzn="${id}" class="${id===nid?'on':''}">${flag(id,14)} <span>${G.nations[id].name}</span></button>`).join('')}<select id="hzsel"><option value="">🌍 …</option>${Object.values(G.nations).filter(n=>n.alive).sort((a,b)=>a.name.localeCompare(b.name)).map(n=>`<option value="${n.id}">${n.name}</option>`).join('')}</select></div>`;}
const hzPct=v=>(v*100).toFixed(v<.1?1:0)+' %';

/* ---------- 🩺 pantalla principal ---------- */
function showHealth(tab,nid){if(!P||!G)return;ensureV14();shEnsure();if(tab)HZV.tab=tab;if(nid)HZV.nid=nid;const home=natOf(P).id;let id=HZV.nid||home;if(!G.nations[id]||!G.nations[id].alive)id=home;HZV.nid=id;const n=G.nations[id];
  const T=HZV.tab;let h=`<h3>🩺 Salud de la economía</h3><div class="ntabs">${[['emp','Empresas'],['bk','Bancos'],['gob','Gobierno'],['org','Mundo'],['rs','Riesgo']].map(([k,t])=>`<button data-hzt="${k}" class="${T===k?'on':''}">${t}</button>`).join('')}</div>
   <div class="hint"><span>Cada medidor va de 0 a 100 y muestra lo que lo sube y lo que lo baja.</span> <span>Toca un medidor para ver sus causas.</span></div>`;
  if(T==='bk'||T==='gob'||T==='rs')h+=hzChips(id);
  h+=T==='emp'?hzTabEmp():T==='bk'?hzTabBank(n):T==='gob'?hzTabGov(n):T==='org'?hzTabOrg():hzTabRisk(n);
  openSheetRaw(h,B=>{B.querySelectorAll('[data-hzt]').forEach(x=>x.onclick=()=>showHealth(x.dataset.hzt));B.querySelectorAll('[data-hzn]').forEach(x=>x.onclick=()=>showHealth(null,x.dataset.hzn));
    const sl=B.querySelector('#hzsel');if(sl)sl.onchange=()=>{if(sl.value)showHealth(null,sl.value);};hzBind(B);
    B.querySelectorAll('[data-hzbz]').forEach(x=>x.onclick=()=>showBizD(+x.dataset.hzbz));B.querySelectorAll('[data-hzgo]').forEach(x=>x.onclick=()=>{const k=x.dataset.hzgo;if(k==='biz')showBiz();else if(k==='bk')showBanks();else if(k==='grp')showGroups();});});
  hzLrn(...(T==='rs'?['Riesgo sistémico','Contagio financiero']:T==='bk'?['Solvencia','Requerimiento de capital']:T==='emp'?['Liquidez','Diversificar']:T==='gob'?['Deuda pública','Déficit']:['Rescate bancario']));}

function hzTabEmp(){const L=bzList(P).filter(b=>b.v14);if(!L.length)return `<div class="hint">Aún no tienes empresas. Ábrelas desde 🏪 Mis empresas: aquí verás su salud.</div><button class="btn" data-hzgo="biz" style="width:100%">🏪 <span>Mis empresas</span></button>`;
  const Pf=hzPort(P);let h=v19Tiles([['Empresas',String(Pf.n)],['Sectores distintos',String(Pf.secs)],['Sector más débil',Pf.weak?SECT[Pf.weak][0]:'—',Pf.weak?`${Math.round(Pf.wh)}/100`:'',Pf.weak?shCol(Pf.wh):null]],2);
  if(Pf.n>=2&&Pf.secs<3)h+=`<div class="hint v21w">⚠️ <span>Tus empresas dependen de pocos sectores: si uno cae, caen juntas.</span> <span>Diversificar en otros giros reparte el riesgo.</span></div>`;
  h+=`<div class="hint"><span>Financiera: margen, reputación, crecimiento y deuda (la misma que usan los compradores).</span> <span>Social: sueldos, carga de trabajo, reputación, pérdidas, su sector y su provincia.</span> <span>Bajo 30 hay malestar y la reputación cae cada mes.</span></div>`;
  L.forEach(b=>{const i=bzList(P).indexOf(b);const T=bzT(b);const F=hzBizFin(b),S=hzBizSoc(b);const c=hzBizCash(b);
    h+=`<div class="hzk"><button class="hzkh" data-hzbz="${i}"><b>${T.ic} <span data-noi18n>${clean(b.n)}</span></b><small><span>${SECT[T.sec][0]}</span> · <span>${RG[b.r].nm}</span></small></button>
     <div class="hz2">${hzMeter('bf'+i,'💵','Salud financiera',F,'biz')}${hzMeter('bs'+i,'👥','Salud social',S,'bsoc')}</div>${c!=null?`<div class="hzs"><span>Caja</span>: <b>${c>=24?'24+':c.toFixed(1)}</b> <span>meses de gastos</span></div>`:''}</div>`;});
  (P.grp||[]).forEach(g=>{const M=hzGrp(P,g);if(M.nd)return;h+=hzMeter('g'+g.id,'🏛️',`${grpNm(g)}`,M,'grp');});
  if((P.grp||[]).length)h+=`<button class="btn" data-hzgo="grp" style="width:100%">🏛️ <span>Grupos</span></button>`;
  return h;}

function hzTabBank(n){const B=hzBank(n);const home=natOf(P).id;let h=`<div class="sect">🏦 <span>Bancos de ${n.name}</span></div>`;
  h+=hzMeter('bk'+n.id,'🏦','Salud de los bancos',B,'bank',{sub:B.cr?`<b class="dn">Crisis bancaria en curso</b>`:`<span>Riesgo de crisis bancaria este año: ${hzPct(B.p)}</span>`,note:'Lo que la mueve este año (puntos por año):'});
  h+=`<div class="hint"><span>Los bancos prestan el dinero de los ahorradores a empresas y hogares.</span> <span>Si sus deudores dejan de pagar, pierden capital.</span> <span>Con poco capital, una ola de impagos se vuelve crisis y el crédito se congela.</span></div>`;
  if(n.id===home){const A=P.acc||{};const ks=Object.keys(A).filter(k=>A[k]>0&&k!=='P:own');if(ks.length){h+=`<div class="sect">💳 <span>Tus cuentas</span></div>`;
    ks.forEach(k=>{const b=bkInfo(k);if(!b)return;const v=Math.round(bankHealth(b));h+=`<div class="v21sr v21sx"><div class="h"><span data-noi18n>${clean(b.nm)}</span><span>${shBar(v)} <b>${v}</b></span></div><div class="s"><span>Saldo</span>: <b>${fmt(A[k])}</b></div></div>`;});
    h+=`<div class="hint">🛟 <span>Si un banco quiebra, el seguro de depósitos de tu país te devuelve hasta un tope por banco: repartir tus ahorros en varios bancos protege más.</span></div>`;}}
  const O=hzOwnBank(P);if(O&&n.id===home){h+=`<div class="sect">🏦 <span>Tu banco</span></div>`+hzMeter('own','🏦',clean(P.bank.nm),O,'own',{sub:`<span>Capital frente a préstamos: ${(O.r*100).toFixed(1)} %</span>`})+
    v19Tiles([['Reputación',String(Math.round(O.rep||0))],['Depósitos',fmt(O.D||0)]],2)+`<div class="hint"><span>Las reglas internacionales de Basilea III piden a los bancos un capital de alta calidad de al menos 7 % de sus activos ponderados por riesgo.</span> <span>En el juego, 20 % de capital frente a préstamos es salud 100.</span></div>`;}
  return h;}

function hzTabGov(n){ensureEco(n);const F=hzFisc(n),S=hzSoc(n);let h=v19Tiles([['Deuda pública',Math.round(n.debtR*100)+' % del PIB'],['Tasa de los bonos',(bondRate(n)*100).toFixed(1)+' %'],
    ['Inflación',(n.infl||0).toFixed(1)+' %'],['Aprobación',Math.round(n.approval!=null?n.approval:50)+' %']],2);
  h+=`<div class="sect">💰 <span>Salud fiscal</span></div>`+hzMeter('gf'+n.id,'💰','Salud fiscal',F,'fisc');
  h+=`<div class="hint"><span>Un gobierno sano paga su deuda sin ahogarse: poca deuda, tasas por debajo de su crecimiento y reservas para emergencias.</span> <span>Si la salud fiscal baja de 35, los empleados públicos se quedan sin aumentos.</span> <span>Bajo 15 hay recortes de plazas.</span></div>`;
  h+=`<div class="sect">🤝 <span>Salud social</span></div>`+hzMeter('gs'+n.id,'🤝','Salud social',S,'soc');
  h+=`<div class="hint"><span>La salud social junta aprobación, estabilidad, felicidad, consumo e inflación.</span> <span>Baja con guerras, recesiones y austeridad, y una sociedad en apuros consume menos.</span></div>`;
  return h;}

function hzTabOrg(){const W=hzWorld();let h=`<div class="sect">🌍 <span>FMI y sistema financiero mundial</span></div>`+hzMeter('world','🌍','Sistema financiero mundial',W,'world')+
  v19Tiles([['Crecimiento mundial',W.gr.toFixed(1)+' %'],['Países en crisis bancaria',String(W.crN)],['Países en recesión',String(W.reN)],['Programas del FMI',String(W.imf)]],2);
  h+=`<div class="hint"><span>El FMI presta a países en crisis a cambio de un programa de ajuste.</span> <span>El Banco Mundial financia proyectos de desarrollo.</span> <span>Cuando muchas economías caen a la vez, el contagio se alimenta solo.</span></div>`;
  if(W.N.length)h+=`<div class="v21cs">${W.N.map(id=>`<span class="v21cz">${flag(id,12)} <span>${G.nations[id].name}</span></span>`).join('')}</div>`;
  h+=`<div class="sect">🏗️ <span>Banco Mundial</span></div><div class="hint"><span>Países con proyectos del Banco Mundial: ${W.wb}.</span></div>`;
  const O=hzOrgs(P);h+=`<div class="sect">🏢 <span>Tus organizaciones</span></div>`;
  if(!O.length)h+=`<div class="hint">Cuando tengas un banco, un club o un gimnasio propios, su salud aparece aquí.</div>`;
  O.forEach((o,i)=>{const ic={bank:'🏦',club:'⚽',gym:'🥊',prom:'📣'}[o.k];const t={bank:'Tu banco',club:'Tu club',gym:'Tu gimnasio',prom:'Tu promotora'}[o.k];h+=hzMeter('o'+i,ic,t,o,'org',{sub:o.n?`<span data-noi18n>${clean(o.n)}</span>`:''});});
  return h;}

function hzTabRisk(n){const R=hzRisk(n);let h=`<div class="sect">🧨 <span>Riesgo sistémico</span></div>`+hzMeter('rs'+n.id,'🧨',`Riesgo sistémico de ${n.name}`,R,'risk',{inv:1});
  h+=`<div class="hint"><span>Riesgo sistémico es la probabilidad de que la caída de una parte arrastre a todo el sistema.</span> <span>Aquí 0 es tranquilo y 100 es una crisis a punto de estallar.</span></div>`;
  h+=`<div class="sect">🔗 <span>Cadena de contagio</span></div><div class="hzch">`;
  if(R.wk)h+=`<div class="v21sr v21sx"><div class="h"><span>🏭 <span>${SECT[R.wk][0]}</span></span><span>${shBar(R.wv)} <b>${Math.round(R.wv)}</b></span></div><div class="s"><span>El cliente más débil de los bancos</span></div></div><div class="hzar">↓</div>`;
  h+=`<div class="v21sr v21sx"><div class="h"><span>🏦 <span>Salud de los bancos</span></span><span>${shBar(R.bk)} <b>${Math.round(R.bk)}</b></span></div></div><div class="hzar">↓</div>
   <div class="v21sr v21sx"><div class="h"><span>🛒 <span>Consumo de los hogares</span></span><span>${shBar(R.hog)} <b>${Math.round(R.hog)}</b></span></div></div></div>`;
  if(R.wk)h+=`<div class="hint"><span>Si ${SECT[R.wk][0]} sigue cayendo, sus deudas impagas golpean a los bancos.</span> <span>Con menos crédito, los hogares consumen menos y eso golpea a todos los sectores: así se contagia una crisis.</span></div>`;
  h+=`<div class="sect">🗺️ <span>Vecinos en crisis</span></div>`;
  h+=R.nb.length?`<div class="v21cs">${R.nb.map(([id,k])=>`<span class="v21cz">${flag(id,12)} <span>${G.nations[id].name}</span> · <b class="dn">${k==='cr'?'Crisis bancaria':'Recesión'}</b></span>`).join('')}</div>`:`<div class="hint">Ningún vecino está en crisis bancaria ni en recesión.</div>`;
  h+=`<div class="hint"><span>Cuando estalla una crisis bancaria, los bancos de los países vecinos reciben un golpe proporcional al tamaño de esa economía.</span> <span>Si es una economía muy grande, lo siente todo el mundo.</span></div>`;
  const top=hzRiskTop(8);h+=`<div class="sect">🌍 <span>Países con más riesgo</span></div>`+top.map(([id,v],i)=>`<div class="v21sr v21sx"><div class="h"><span>${i+1}. ${flag(id,12)} <span>${G.nations[id].name}</span></span><span>${shBar(100-v)} <b>${v}</b></span></div></div>`).join('');
  return h;}

/* ---------- 🩺 en la ficha de cada empresa ---------- */
{const _sd=showBizD;showBizD=function(i,...a){const r=_sd(i,...a);try{hzBizD(i);}catch(e){console.warn('v21c empresa',e);}return r;};showBizD._shk=1;}
function hzBizD(i){const B=$('sheetIn');const b=bzList(P)[i];if(!B||!b||!b.v14||B.querySelector('#hzbd'))return;const F=hzBizFin(b),S=hzBizSoc(b);const c=hzBizCash(b);
  const d=document.createElement('div');d.id='hzbd';d.innerHTML=`<div class="sect">🩺 <span>Salud de la empresa</span></div><div class="hz2">${hzMeter('bf'+i,'💵','Salud financiera',F,'biz')}${hzMeter('bs'+i,'👥','Salud social',S,'bsoc')}</div>`+
   (c!=null?`<div class="hzs"><span>Caja</span>: <b>${c>=24?'24+':c.toFixed(1)}</b> <span>meses de gastos</span></div>`:'')+`<button class="btn" id="hzbdgo" style="width:100%">🩺 <span>Salud de todas tus empresas</span></button>`;
  const e=B.querySelector('#v21e');if(e)e.before(d);else{const t=B.querySelector('table.ist');if(t)t.before(d);else B.append(d);}hzBind(d);d.querySelector('#hzbdgo').onclick=()=>showHealth('emp');}

/* ---------- Mis empresas y País → Economía ---------- */
{const _sb=showBiz;showBiz=function(...a){const r=_sb(...a);try{const B=$('sheetIn');if(B&&P&&!B.querySelector('#hzbz')&&bzList(P).some(b=>b.v14)){const x=document.createElement('button');x.className='btn';x.id='hzbz';x.style.width='100%';
  x.innerHTML='🩺 <span>Salud de tus empresas</span>';x.onclick=()=>showHealth('emp');const a2=B.querySelector('#v21ba');if(a2)a2.append(x);else{const nb=B.querySelector('#bzNew');if(nb)nb.before(x);else B.append(x);}}}catch(e){console.warn('v21c empresas',e);}return r;};showBiz._shk=1;}
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(VIEW.v==='pa'&&VIEW.tab==='eco'){const body=$('natBody');if(body&&!body.querySelector('#hzpa')){const n=natOf(P);const R=hzRisk(n),F=hzFisc(n);
  const d=document.createElement('div');d.id='hzpa';d.innerHTML=`<div class="sect">🩺 <span>Salud y riesgo</span></div>`+v19Tiles([['Salud fiscal',`${F.v}/100`,'',hzCol(F.v)],['Riesgo sistémico',`${R.v}/100`,HZ_RKN[hzRk(R.v)],hzCol(R.v,1)]],2)+
   `<button class="btn" style="width:100%">🩺 <span>Salud de la economía</span></button>`;body.append(d);d.querySelector('button').onclick=()=>showHealth('gob',n.id);}}}catch(e){console.warn('v21c país',e);}return r;};}

/* ---------- Más → 🩺 Salud de la economía ---------- */
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();try{const b=$('sheetIn');if(!b||!P||b.querySelector('#hzmo'))return;if(typeof ezOn==='function'&&ezOn()&&!(ezEnsure().all)&&P.age<18)return;
  const x=document.createElement('button');x.className='item';x.id='hzmo';x.innerHTML=`<span><div class="t">🩺 Salud de la economía</div><div class="s">Empresas, bancos, gobierno, organizaciones y riesgo de contagio</div></span>`;x.onclick=()=>showHealth();
  const gl=b.querySelector('#v20gl');if(gl)gl.after(x);else b.appendChild(x);}catch(e){console.warn('v21c más',e);}};})();

/* ---------- 💼 Tu empleo: tu sector y el riesgo de recorte ---------- */
{const _sj=showJob;showJob=function(...a){const r=_sj(...a);try{hzJobUI();}catch(e){console.warn('v21c empleo',e);}return r;};showJob._shk=1;}
function hzJobUI(){const B=$('sheetIn');if(!B||!P||!P.job||!P.job.w||JBV.tab!=='pue'||B.querySelector('#hzjb'))return;const k=hzJobSec(P);if(!k)return;const n=natOf(P);const h=hzSecH(n.id,k);
  const r=hzJobRisk(P);const ya=1-Math.pow(1-r,12);const gob=k==='gob';const d=document.createElement('div');d.id='hzjb';d.className='v21bh';
  d.innerHTML=`<div class="h"><span>${gob?`<span>Tu empleador: el gobierno</span> · <span>salud fiscal</span>`:`<span>Tu sector</span> · <b>${SECT[k][0]}</b>`}</span><span>${shBar(h)} <b>${Math.round(h)}</b>/100${gob?'':' '+shArrow(n,k)}</span></div>
   <div class="s">${ya>0?`<span>Riesgo de recorte: ${(ya*100).toFixed(1)} % al año</span>`:`<span>Sin riesgo de recorte por ahora</span>`}</div>
   <div class="s">${h<35?`<span>Aumentos congelados mientras siga bajo 35.</span>`:h>65?`<span>Buen momento: cada evaluación suma hasta ${((h-65)/30*1.5).toFixed(1)} % extra.</span>`:`<span>Aumentos normales.</span>`}</div>`;
  const kv=B.querySelector('.kv');if(kv)kv.after(d);else B.append(d);}

/* ---------- Personas y Familia: sector y empleo de cada quien ---------- */
function hzPpTxt(x){const e=hzEc(P,x);if(!e)return '';if(e.e<0)return `<span>${(x.sex||(x.role==='Madre'?'F':'M'))==='F'?'Jubilada':'Jubilado'}</span>`;const nid=natOf(P).id;const h=hzSecH(nid,e.s);
  const bar=`${shBar(h)} <b>${Math.round(h)}</b>`;if(e.e===1)return `💼 <span>${e.s==='gob'?'Trabaja en el gobierno':`Trabaja en ${SECT[e.s][0]}`}</span> ${bar}`;
  return `🔎 <span>${e.m<1?'Busca empleo':e.m===1?'Busca empleo desde hace 1 mes':`Busca empleo desde hace ${e.m} meses`}</span> · <span>${hzSecN(e.s)}</span> ${bar}`;}
{const _sp=showPeople;showPeople=function(...a){const r=_sp(...a);try{const B=$('sheetIn');if(!B||!P)return r;const all=allPeople(P);B.querySelectorAll('.item.per[data-i]').forEach(el=>{const it=all[+el.dataset.i];if(!it||el.querySelector('.hzps'))return;const t=hzPpTxt(it.ref);
  if(t){const s=el.querySelector('span .s')||el.querySelector('.s');if(s)s.insertAdjacentHTML('afterend',`<div class="s hzps">${t}</div>`);}});}catch(e){console.warn('v21c personas',e);}return r;};showPeople._shk=1;}
{const _pp=showPerson;showPerson=function(it,...a){const r=_pp(it,...a);try{const B=$('sheetIn');const t=it&&it.ref?hzPpTxt(it.ref):'';if(B&&t&&!B.querySelector('.hzps')){const hn=B.querySelector('.pp .hint');if(hn)hn.insertAdjacentHTML('beforeend',`<div class="hzps">${t}</div>`);
  const e=it.ref.ec;if(e&&e.e===0)hzLrn('Desempleo');}}catch(e){console.warn('v21c persona',e);}return r;};}
{const _sf=showFamily;showFamily=function(...a){const r=_sf(...a);try{const B=$('sheetIn');if(!B||!P)return r;const L=hzPeople(P).filter(([,g])=>g==='fam').map(([x])=>x);
  B.querySelectorAll('.item').forEach(el=>{const tt=el.querySelector('.t');if(!tt||el.querySelector('.hzps'))return;const x=L.find(z=>z.name===tt.textContent.trim());if(!x)return;const t=hzPpTxt(x);if(t){const s=el.querySelector('.s');if(s)s.insertAdjacentHTML('afterend',`<div class="s hzps">${t}</div>`);}});}catch(e){console.warn('v21c familia',e);}return r;};showFamily._shk=1;}

/* ---------- modo de mapa 🩺: riesgo sistémico por país ---------- */
MODES_MAP.rsk={n:'Riesgo sistémico por país',ic:'🩺',mix:.72,lo:'alto',hi:'bajo'};
(function(){const mm=document.querySelector('.mmodes');if(!mm)return;const x=document.createElement('button');x.dataset.mm='rsk';x.title='Riesgo sistémico por país';x.textContent='🩺';x.onclick=e=>{e.stopPropagation();setMapMode('rsk');};mm.appendChild(x);})();
const HZM={t:-1,g:null,v:{}};
function hzMapVal(nid){const t=G.year*12+monthOfDay(G.day||0);if(HZM.t!==t||HZM.g!==G){HZM.t=t;HZM.g=G;HZM.v={};}if(HZM.v[nid]==null){const n=G.nations[nid];HZM.v[nid]=n&&n.alive?hzRisk(n).v:-1;}return HZM.v[nid];}
{const _pc=provColor;provColor=function(id){if(MMODE!=='rsk'||!G||!G.sh)return _pc(id);const x=G.regions[id];if(!x||!G.nations[x.o]||!G.nations[x.o].alive)return [58,63,71];const v=hzMapVal(x.o);if(v<0)return [58,63,71];return ramp(clamp((75-v)/60,0,1));};}

/* ---------- Fácil: «Te conviene» cuando el sector de una empresa tuya está débil ---------- */
EZ_TIPS.push(['hzsec',p=>{if(p.age<18||!G.sh)return false;const Pf=hzPort(p);return Pf.n>=1&&Pf.wh!=null&&Pf.wh<40&&Pf.secs<3;},'🏭 El sector de una de tus empresas está débil: diversifica en otro giro y revisa su salud en 🩺.','hz']);
{const _go=ezGo;ezGo=function(k){if(k==='hz'){showHealth('emp');return;}return _go(k);};}

/* ---------- «¿Sabías que…?», tarjeta de primera vez, glosario, ayuda ⓘ y Guía ---------- */
SABIAS.push(
 ['El 15 de septiembre de 2008 quebró el banco de inversión Lehman Brothers. En 2009 la economía mundial se contrajo por primera vez desde la Segunda Guerra Mundial.','Fondo Monetario Internacional','cri'],
 ['En la crisis de 1994–1995 («efecto tequila») el PIB de México cayó cerca de 6 % en 1995, y la crisis se contagió a otros mercados de América Latina.','INEGI; Banco Mundial','cri'],
 ['La crisis asiática empezó el 2 de julio de 1997, cuando Tailandia dejó flotar su moneda. Se contagió a Indonesia, Corea del Sur y Malasia, y el PIB de Indonesia cayó más de 13 % en 1998.','Banco Mundial','cri'],
 ['Tras la crisis de 2008, el desempleo de Estados Unidos llegó a 10 % en octubre de 2009.','Oficina de Estadísticas Laborales de EE. UU.','cri'],
 ['Las reglas de Basilea III piden a los bancos un capital de alta calidad de al menos 7 % de sus activos ponderados por riesgo (4.5 % mínimo más 2.5 % de colchón).','Banco de Pagos Internacionales','cri'],
 ['En Estados Unidos el seguro de depósitos cubre hasta 250,000 dólares por persona en cada banco. En México el IPAB cubre hasta 400,000 UDIS.','FDIC; IPAB','cri'],
 ['Un banco es «sistémico» cuando su quiebra arrastraría a todo el sistema financiero. Por eso a los más grandes del mundo se les exige más capital.','Consejo de Estabilidad Financiera','cri']);
SB_SCR.unshift(['hz',/^🩺 Salud de la economía/,['cri']]);
['bk','eco'].forEach(k=>{const e=SB_SCR.find(x=>x[0]===k);if(e&&Array.isArray(e[2])&&!e[2].includes('cri'))e[2].push('cri');});
EZ_SCR.push(['hz',/^🩺 Salud de la economía/,'cri','Aquí ves qué tan sanas están tus empresas, los bancos, el gobierno y el mundo. Si un sector cae, arrastra a sus proveedores, a los bancos que le prestaron y a quienes trabajan en él: así se contagia una crisis.']);
GLOS.push(
 ['Riesgo sistémico','Riesgo de que la caída de una empresa, un banco o un sector arrastre a todo el sistema económico, porque todos están conectados por créditos, ventas y empleos.',['riesgo sistémico'],4],
 ['Contagio financiero','Cuando la crisis de un país, un banco o un sector se transmite a otros: por deudas que no se pagan, pánico de los inversionistas o menos comercio.',['contagio'],4],
 ['Rescate bancario','Cuando el gobierno (o el FMI) pone dinero para salvar a bancos en problemas y evitar que el crédito se congele. Lo pagan los contribuyentes.',['rescate'],1],
 ['Solvencia','Capacidad de pagar todas tus deudas con lo que tienes. Una empresa o banco es insolvente cuando debe más de lo que vale.',['solvencia','insolvente'],1],
 ['Liquidez','Dinero disponible para pagar ya. Una empresa puede ser rentable y aun así quebrar si se queda sin efectivo para pagar sueldos y proveedores.',['liquidez'],3],
 ['Requerimiento de capital','Parte de sus activos que un banco debe tener con dinero propio (no prestado) para absorber pérdidas sin quebrar.',['requerimiento de capital'],1],
 ['Desempleo','Personas que quieren trabajar y buscan empleo pero no lo tienen. Sube cuando los sectores donde trabajan entran en crisis.',['desempleo','desempleado'],4]);
V20.gt=null;
(function(){const H=[
 ['Salud financiera','💵 Salud financiera','Una empresa sana gana dinero (margen), crece, tiene buena reputación y debe poco frente a lo que vende. La liquidez —efectivo para pagar— importa tanto como la utilidad: muchas empresas rentables quiebran por quedarse sin caja.','0–100, con 50 de base: margen × 150, (reputación − 50) × 0.5, crecimiento de ventas × 60 y deuda frente a ventas × −15. Es la misma salud que usan los compradores al ofrecer por tu empresa. Abajo ves cuántos meses de gastos cubre su caja.'],
 ['Salud social','👥 Salud social','Los empleados mal pagados o sobrecargados rinden menos, se van o protestan, y eso daña la reputación. Una empresa también depende de la salud de su sector y de su ciudad.','0–100, con 55 de base: sueldos (±12), carga de trabajo (−8 al tope, −6 con poco trabajo), reputación, pérdidas recientes (hasta −10), salud de su sector y demanda de la provincia. Bajo 30 hay malestar: la reputación baja 0.5 cada mes.'],
 ['Salud fiscal','💰 Salud fiscal','Un gobierno puede endeudarse sin problema mientras su economía crezca más rápido que el costo de su deuda. Con mucha deuda y tasas altas, cada vez más impuestos se van en intereses.','0–100, con 60 de base: deuda pública (−35 a +15), costo de la deuda contra crecimiento más inflación, tesoro, reservas, inflación alta, programa del FMI, guerra y recesión. Bajo 35 se congelan los aumentos de los empleados públicos; bajo 15 hay recortes de plazas.'],
 ['Riesgo sistémico','🧨 Riesgo sistémico','Bancos, empresas y hogares están conectados por créditos, ventas y empleos: si un eslabón cae, puede arrastrar a los demás. Por eso los reguladores vigilan a los bancos grandes y exigen más capital.','0–100 (más es peor), con 20 de base: bancos débiles, crisis activa (+25), deuda pública alta, sectores bajo 35, hogares en apuros, economía concentrada en un sector, vecinos en crisis o recesión y reservas que amortiguan. Cuando estalla una crisis bancaria, los bancos de los vecinos reciben un golpe proporcional al tamaño de esa economía.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🩺 Salud de la economía y contagio',`<b>Todo está conectado: una crisis empieza en un lugar y se contagia.</b>
<ul><li><b>🩺 Medidores:</b> en Más → 🩺 Salud de la economía cada empresa, banco, gobierno y organización tiene un medidor de 0 a 100 con lo que lo sube y lo que lo baja. Tócalo para ver sus causas.</li>
<li><b>💵 Empresas:</b> salud financiera (margen, reputación, crecimiento, deuda) y social (sueldos, carga de trabajo, pérdidas, sector y provincia), y cuántos meses de gastos cubre su caja.</li>
<li><b>🏦 Bancos:</b> lo que mueve su salud este año y la probabilidad de una crisis bancaria.</li>
<li><b>💰 Gobierno:</b> salud fiscal (deuda, tasas, reservas) y social (aprobación, estabilidad, felicidad, consumo).</li>
<li><b>🧨 Riesgo:</b> el riesgo sistémico de cada país, su cadena de contagio y los vecinos en crisis. El modo de mapa 🩺 lo pinta en todo el mundo.</li>
<li><b>👨‍👩‍👧 Personas:</b> tu familia, tus amigos y tú trabajan en un sector: si cae, hay recortes y despidos; si va bien, aumentos. Puedes ayudar con dinero a quien busca empleo.</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🌐 Economía conectada/.test(g[0]));GUIA.splice(gi>=0?gi+1:0,0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v21c',e);}}
if(typeof shWrapAll==='function')shWrapAll();

(function(){const st=document.createElement('style');st.id='v21ccss';st.textContent=`
.hzm{border:1px solid var(--line);border-radius:12px;background:var(--card2);margin:6px 0;padding:0 10px 6px}
.hzh{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;background:none;border:0;color:var(--ink);padding:8px 0 4px;text-align:start;font-size:13.5px;min-height:36px}
.hzt{font-weight:700}.hzv b{font-size:17px}.hzv small{color:var(--mut);font-size:11px}
.hzp{display:inline-block;font-size:11px;font-weight:700;border-radius:10px;padding:1px 7px;margin-inline-start:4px;border:1px solid var(--line)}
.hzp.ok{color:#3ccf8e;border-color:#3ccf8e66}.hzp.mid{color:var(--gold);border-color:var(--line)}.hzp.low{color:#f08a4b;border-color:#f08a4b66}.hzp.bad{color:var(--red);border-color:var(--red)}
.hzb{height:8px;border-radius:5px;background:var(--line);overflow:hidden}.hzb i{display:block;height:100%;border-radius:5px}
.hzs{font-size:12px;color:var(--mut);margin:4px 0}.hzs b{color:var(--ink)}.hzn{font-size:12px;color:var(--mut);margin-top:6px}
.hzc{display:none}.hzm.open .hzc{display:block}.hzm .v21cs{margin-top:6px}
.hz2{display:grid;grid-template-columns:1fr 1fr;gap:6px}.hz2 .hzm{margin:3px 0}.hz2 .hzh{font-size:12.5px}.hz2 .hzv b{font-size:15px}
.hzk{border-top:1px solid var(--line);padding-top:6px;margin-top:8px}.hzkh{display:flex;flex-direction:column;gap:2px;width:100%;background:none;border:0;color:var(--ink);text-align:start;padding:2px 0}
.hzkh small{color:var(--mut)}.hzch{margin:4px 0}.hzar{text-align:center;color:var(--mut);font-size:14px;line-height:1}
.hzps{font-size:12px;color:var(--mut);margin-top:2px}
@media (max-width:360px){.hz2{grid-template-columns:1fr}}
`;document.head.appendChild(st);})();
