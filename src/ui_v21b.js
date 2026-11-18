/* ===================== v2.1b: fase 4 de la ruta 9d (economía conectada), parte 2 — interfaz =====================
   🌐 Aporte a la economía local y 🔗 cadena de suministro en la ficha de cada empresa; resumen en Mis empresas;
   🤝 vender tu empresa negociando; 🛒 empresas en venta en otros países; 🏭 salud de los sectores en País → Economía;
   🏭 economía local en la ficha de la provincia; modo de mapa 🏢 (actividad económica + tus empresas y grupos);
   Web Worker del mundo de la IA (WMW) con respaldo síncrono y ajuste en Ajustes. */

const SH_CL={g:'Crecimiento del país',rec:'Recesión',tasa:'Tasas de interés',guerra:'Guerra',petr:'Precio del petróleo',met:'Precio de los metales',crisis:'Crisis bancaria',
  banco:'Salud de los bancos',cli:'Sus clientes (cadena)',hog:'Consumo de los hogares',qb:'Quiebras recientes',tend:'Tendencia del sector'};
const SH_DL={pop:'Hogares de la provincia',tour:'Turistas',b2b:'Otras empresas del país',tech:'Empresas y hogares que adoptan tecnología',nat:'Hogares de todo el país',ex:'Mercado mundial: vendes a precio internacional'};
const LX_W={qb:'por la quiebra de una empresa',cl:'por el cierre de una empresa'};
const V21B={mk:null,open:{}};
const shCol=h=>`rgb(${ramp(clamp((h-20)/60,0,1))})`;
const pctV=v=>(v>=0?'+':'−')+Math.abs(v*100).toFixed(1)+' %';
function shareTxt(x){const v=x*100;return v<=0?'0 %':v<.001?'< 0.001 %':v<.01?v.toFixed(4)+' %':v<1?v.toFixed(3)+' %':v.toFixed(1)+' %';}
function shArrow(n,k){const t=shTarget(n,k),h=shOf(n.id,k);return t>h+1?'<b class="up">▲</b>':t<h-1?'<b class="dn">▼</b>':'<b class="v21eq">▬</b>';}
function shBar(h){return `<span class="v21hb"><i style="width:${Math.round(h)}%;background:${shCol(h)}"></i></span>`;}
function shCauses(n,k,max){return shParts(n,k).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,max||12).map(([c,v])=>`<span class="v21cz"><span>${SH_CL[c]}</span> <b class="${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('');}
function v21bLrn(...k){try{const L=lrnEnsure(P);k.forEach(c=>L.c[c]=L.c[c]||G.year);}catch(e){}}

/* ---------- Web Worker del mundo de la IA ---------- */
const WMW={w:null,ok:null,act:null,top:null,ms:null,msMain:null,mode:'',busy:false,pend:false,sent:0,got:0,why:''};
const wmwOn=()=>typeof Worker!=='undefined'&&CFG.wmw!==0;
const WMW_SRC=`${wmwComp.toString()}\n${wmwKernel.toString()}\nlet C=null,S=0,N=0;onmessage=e=>{const d=e.data;const t=performance.now();if(d.F){N=d.N;S=d.S;C=wmwComp(d.F,d.N,d.S,d.SK);}
 const r=wmwKernel(C,d.own,d.h,d.lx,N,S);postMessage({act:r.act,top:r.top,ms:performance.now()-t},[r.act.buffer,r.top.buffer]);};`;
function wmwSync(){const t=performance.now();if(!WMW.C){const f=wmwFeat();WMW.C=wmwComp(f.F,f.N,SH_K.length,SH_K);}const I=wmwInputs();const r=wmwKernel(WMW.C,I.own,I.h,I.lx,I.N,I.S);
  WMW.act=r.act;WMW.top=r.top;WMW.g=G;WMW.msMain=performance.now()-t;WMW.mode='sync';return r;}
function wmwDown(why){try{WMW.w&&WMW.w.terminate();}catch(e){}WMW.w=null;WMW.ok=false;WMW.busy=false;WMW.why=why||'';}
function wmwRun(){if(!G||!G.sh)return;if(!wmwOn()||WMW.ok===false){wmwSync();if(MMODE==='emp')refreshMap();return;}
  if(WMW.busy&&performance.now()-WMW.sent<4000){WMW.pend=true;return;}WMW.pend=false;const t=performance.now();const I=wmwInputs();const msg={own:I.own,h:I.h,lx:I.lx};
  try{if(!WMW.w){const url=URL.createObjectURL(new Blob([WMW_SRC],{type:'text/javascript'}));const w=new Worker(url);WMW.w=w;
      w.onmessage=e=>{const d=e.data;WMW.busy=false;WMW.got++;WMW.act=d.act;WMW.top=d.top;WMW.g=G;WMW.ms=d.ms;WMW.ok=true;WMW.mode='worker';if(WMW.pend){WMW.pend=false;wmwRun();return;}if(typeof MMODE!=='undefined'&&MMODE==='emp')refreshMap();};
      w.onerror=e=>{wmwDown('error');wmwSync();if(MMODE==='emp')refreshMap();};
      const f=wmwFeat();Object.assign(msg,{F:f.F,N:f.N,S:SH_K.length,SK:SH_K});w.postMessage(msg,[f.F.buffer,I.own.buffer,I.h.buffer,I.lx.buffer]);}
    else WMW.w.postMessage(msg,[I.own.buffer,I.h.buffer,I.lx.buffer]);WMW.busy=true;WMW.sent=performance.now();WMW.msMain=WMW.sent-t;}
  catch(e){wmwDown('no disponible');wmwSync();}}
function wmwAct(rid){if(!WMW.act||WMW.g!==G)wmwSync();const i=WMWI.RI&&WMWI.RI[rid];return i==null?null:{a:WMW.act[i],top:SH_K[WMW.top[i]]};}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(G&&G.sh)wmwRun();}catch(e){console.warn('v21b mundo',e);}};}
// la mezcla de sectores de una provincia (para su ficha), sin esperar al worker
function wmwOne(rid){const i=WMWI.RI?WMWI.RI[rid]:null;const S=SH_K.length;if(WMW.C&&i!=null)return Array.from(WMW.C.subarray(i*S,i*S+S));
  const x=G.regions[rid],rd=RG[rid];const F=new Float32Array(7);F[0]=Math.max(1,x.pop);F[1]=Math.max(1e6,x.gdp);F[2]=Math.max(1,rd.area||1);F[3]=rd.cap?1:0;
  const cat={oil:4,gas:4,coal:4,uran:4,iron:5,copper:5,lith:5,ree:5,gold:5,wheat:6,corn:6,soy:6,rice:6,coffee:6};const d=DEP[rid];if(d)for(const k in d){const c=cat[k];if(c)F[c]+=d[k]*(RES0[k]?RES0[k][3]:0);}
  return Array.from(wmwComp(F,1,S,SH_K));}
function placeEco(rid){const x=G.regions[rid];if(!x||!G.sh)return null;const C=wmwOne(rid);let a=0;SH_K.forEach((k,s)=>a+=C[s]*shOf(x.o,k));const L=G.lx&&G.lx[rid];if(L)a+=L[0]*100;
  const top=SH_K.map((k,s)=>[k,C[s]]).sort((p,q)=>q[1]-p[1]);return {a:clamp(a,0,100),top,L};}

/* ---------- 🌐 aporte y 🔗 cadena en la ficha de la empresa ---------- */
function v21bEcoHTML(b,i){const T=bzT(b);const E=bzEco(b);const x=G.regions[b.r];const n=G.nations[x.o];let h=`<div class="sect" id="v21e">🌐 <span>Aporte a la economía local</span></div>`;
  if(!E.months)h+=`<div class="hint">Aún no cierra su primer mes.</div>`;
  else{h+=v19Tiles([['Valor agregado al año',fmt(E.va)],['Con proveedores y sueldos',fmt(E.tot),`×${E.mult.toFixed(2)}`],['Empleos',`${E.jobs} + ${E.jInd}`,'directos + indirectos'],
      ['Impuestos y cuotas',fmt(E.taxes),'al año'],['PIB de la provincia',shareTxt(E.shP)],['PIB del país',shareTxt(E.shN)]],2);
    h+=`<div class="hint"><span>Valor agregado = ventas − insumos: lo que tu empresa suma a la economía.</span> <span>Sus compras a proveedores y los sueldos que tus empleados gastan generan más actividad (multiplicador).</span> <span>Cada año ese aporte entra al PIB de ${RG[b.r].nm}.</span></div>`;}
  h+=`<div class="sect">🔗 <span>Cadena de suministro</span></div>`;const V=bzViSrc(P,b);
  if(T.out){const rk=b.res||'corn';const o=G.rs[rk];h+=`<div class="v21bi">🏭 <span>Vendes ${R0n(rk)} a precio mundial: ${rsFmt(rk,o.p)}.</span></div>`;}
  if((T.in||[]).length)h+=`<div class="v21bi"><b>Insumos</b></div>`+T.in.map(([rk,w])=>{const ch=shRef(rk)-1;const s=V.find(v=>v[0]===rk);
    return `<div class="v21bi v21in">${RES0[rk][1]} <span>${RES0[rk][0]}</span> · <span>${Math.round(w*100)} % del costo</span> · <span>precio desde 2026</span> <b class="${ch>.05?'dn':ch<-.05?'up':''}">${pctV(ch)}</b>${s?`<div class="s">✅ <span>Lo produce tu empresa</span> <b data-noi18n>${clean(s[2].n)}</b> <span>(10 % más barato)</span></div>`:''}</div>`;}).join('');
  const m=b.m[b.m.length-1];if(m&&m.vi)h+=`<div class="hint">🔗 <span>Integración vertical: ahorras ${fmt(m.vi)} al mes en insumos.</span></div>`;
  if(!T.out){h+=`<div class="v21bi"><b>Clientes</b> · <span>${SH_DL[T.d]||SH_DL.pop}</span></div>`;
    if(T.d==='b2b'||T.d==='tech')h+=`<div class="v21bi v21in">`+(SH_IO[T.sec]||[]).filter(([c])=>c!=='hog').map(([c])=>`<span class="v21cz"><span>${SECT[c][0]}</span> ${shBar(shOf(n.id,c))}</span>`).join('')+`</div>`;}
  const hs=shOf(n.id,T.sec);h+=`<div class="v21bh"><div class="h"><span><span>Salud de tu sector</span> · <b>${SECT[T.sec][0]}</b></span><span>${shBar(hs)} <b>${Math.round(hs)}</b>/100 ${shArrow(n,T.sec)}</span></div>
    <div class="v21cs">${shCauses(n,T.sec,4)}</div>${T.out?'':`<div class="s"><span>Efecto en tu demanda</span> <b class="${(m&&m.shf||1)>=1?'up':'dn'}">${pctV(((m&&m.shf)||bzShF(b))-1)}</b></div>`}</div>`;
  const L=G.lx&&G.lx[b.r];if(L)h+=`<div class="hint v21w">📉 <span>Demanda de la provincia</span> <b>${pctV(L[0])}</b> · <span>${LX_W[L[2]]||LX_W.qb}</span> · <span>${L[1]} meses</span></div>`;
  return h;}
{const _sd=showBizD;showBizD=function(i,...a){const r=_sd(i,...a);try{v21bBizD(i);}catch(e){console.warn('v21b empresa',e);}return r;};showBizD._shk=1;}
function v21bBizD(i){const B=$('sheetIn');const b=bzList(P)[i];if(!B||!b||!b.v14||B.querySelector('#v21e'))return;const d=document.createElement('div');d.innerHTML=v21bEcoHTML(b,i);
  const t=B.querySelector('table.ist');const s=t&&t.previousElementSibling&&t.previousElementSibling.classList.contains('sect')?t.previousElementSibling:t;if(s)s.before(...d.childNodes);else B.append(...d.childNodes);
  const sl=B.querySelector('[data-ac="sell:1"]');if(sl&&!sl.disabled)sl.onclick=e=>{e.stopPropagation();showBzSell(i);};
  if(b.m.length)v21bLrn('Valor agregado','Multiplicador económico','Cadena de suministro');const m=b.m[b.m.length-1];if(m&&m.vi)v21bLrn('Integración vertical');}

/* ---------- Mis empresas: tu aporte total y mapa; empresas en venta con país ---------- */
{const _sb=showBiz;showBiz=function(...a){const r=_sb(...a);try{v21bBiz();}catch(e){console.warn('v21b empresas',e);}return r;};showBiz._shk=1;}
function v21bBiz(){const B=$('sheetIn');if(!B||!P||B.querySelector('#v21ba'))return;const L=bzList(P).filter(b=>b.v14);if(!L.length)return;const A=bzEcoSum(P);const d=document.createElement('div');d.id='v21ba';
  d.innerHTML=`<div class="sect">🌐 <span>Tu aporte a la economía</span></div>`+v19Tiles([['Valor agregado al año',fmt(A.va)],['Empleos',`${A.jobs} + ${A.jInd}`,'directos + indirectos'],['Impuestos y cuotas',fmt(A.taxes),'al año'],['PIB de tu país',shareTxt(A.shN)]],2)+
   `<button class="btn" id="v21map" style="width:100%">🗺️ <span>Ver tus empresas en el mapa</span></button>`;
  const a=B.querySelector('#v21b');if(a)a.after(d);else{const nb=B.querySelector('#bzNew');if(nb)nb.before(d);else B.append(d);}
  d.querySelector('#v21map').onclick=v21bMapShow;}
function v21bMapShow(){try{SHK.under=null;}catch(e){}closeSheet();setMapMode('emp');const L=bzList(P).filter(b=>b.v14&&RG[b.r]);if(L.length){const r=L[0].r;G.sel=r;try{centerOn(r,Math.min(vb.w,1600),1);renderSel();}catch(e){}}
  try{window.scrollTo({top:$('mapWrap').getBoundingClientRect().top+window.scrollY-60,behavior:'smooth'});}catch(e){}}

showBzMarket=function(nid){if(!P||!G)return;ensureV14();const home=natOf(P).id;nid=nid||V21B.mk||home;if(!G.nations[nid]||!G.nations[nid].alive)nid=home;V21B.mk=nid;
  const err=bzmErrN(P,nid);const M=err?{L:[]}:bzmMk(P,nid);const fx=nid!==home;const cs=bzmCountries(P);if(!cs.includes(nid))cs.push(nid);
  let h=`<button class="btn" id="v21bk" style="margin-bottom:6px">← Mis empresas</button><h3>🛒 Empresas en venta</h3>
  <div class="chips v21cc">${cs.map(id=>`<button data-mkn="${id}" class="${id===nid?'on':''}">${flag(id,14)} <span>${G.nations[id].name}</span></button>`).join('')}<select id="v21sel"><option value="">🌍 …</option>${Object.values(G.nations).filter(n=>n.alive).sort((a,b)=>a.name.localeCompare(b.name)).map(n=>`<option value="${n.id}">${n.name}</option>`).join('')}</select></div>
  <div class="hint"><span>Negocios de ${G.nations[nid].name} cuyos dueños quieren vender. Las cifras son las que declara el vendedor: pueden estar maquilladas.</span> <span>Una auditoría revisa libros y deudas antes de comprar.</span> <span>La lista se renueva cada 6 meses.</span>${fx?` <span>Comprar en otro país es inversión extranjera directa: pagas ${Math.round(IED_FEE*100)} % de trámites y la empresa opera con los sueldos, impuestos y crisis de ese país.</span>`:''}</div>`;
  if(err)h+=`<div class="hint v21w">${err}</div>`;else if(!M.L.length)h+=`<div class="hint">Por ahora no hay empresas en venta.</div>`;
  M.L.forEach(o=>{const b=o.b,T=bzT(b),D=bzmDecl(o);
    h+=`<div class="bzc v21o"><div class="h"><b>${T.ic} ${b.n}</b><span>${fmt(o.ask)}</span></div>
     <div class="s"><span>${T.n}</span> · <span>${RG[b.r].nm}</span> · <span>${b.br} ${b.br>1?'sucursales':'sucursal'}</span> · <span>${b.st} empleados</span> · <span>reputación ${Math.round(b.rep)}</span></div>
     <div class="kv kvt"><div><span>Ventas al año</span><b>${fmt(D.rev)}</b></div><div><span>Utilidad al año</span><b style="color:${D.net<0?'var(--red)':'var(--green)'}">${fmt(D.net)}</b></div><div><span>Deuda</span><b>${fmt(D.debt)}</b></div><div><span>Caja</span><b>${fmt(D.cash)}</b></div></div>
     <div class="v21tags">${o.aud?`<span class="pill">🔍 Auditada</span>`:''}${o.aud&&o.hd?`<span class="pill war">⚠️ Deuda oculta: ${fmt(o.hd)}</span>`:''}${o.urg?`<span class="pill">⏳ Vendedor con prisa</span>`:''}${o.neg?`<span class="pill">Ofertas rechazadas: ${o.neg}</span>`:''}${fx?`<span class="pill">🌐 Trámites: ${fmt(o.ask*IED_FEE)}</span>`:''}</div>
     ${o.aud?'':`<button class="btn" data-aud="${o.id}">🔍 <span>Auditar (${fmt(bzmAuditCost(P,o))})</span></button>`}
     <div class="v21of">${BZM_PCT.map(([f],i)=>{const pr=bzmPrice(o,i,false);return `<button class="btn${i===2?' gold':''}" data-of="${o.id}:${i}" ${P.dinero<pr.cash*.5?'disabled':''}><b>${Math.round(f*100)} %</b><small>${fmt(pr.pr)}</small><small>${bzmChance(o,i)} %</small></button>`;}).join('')}</div>
     <label class="v21ln"><input type="checkbox" data-ln="${o.id}"> <span>Con crédito: pagas la mitad y la otra mitad queda como deuda de la empresa</span></label></div>`;});
  openSheetRaw(h,B=>{B.querySelector('#v21bk').onclick=showBiz;B.querySelectorAll('[data-mkn]').forEach(x=>x.onclick=()=>showBzMarket(x.dataset.mkn));
    const sl=B.querySelector('#v21sel');if(sl)sl.onchange=()=>{if(sl.value)showBzMarket(sl.value);};
    B.querySelectorAll('[data-aud]').forEach(x=>x.onclick=()=>{const r=bzmAudit(P,+x.dataset.aud);if(r){log(r,'news');save();toast('🔍 Auditoría',r);}showBzMarket(nid);});
    B.querySelectorAll('[data-of]').forEach(x=>x.onclick=()=>{const s=x.dataset.of,k=s.lastIndexOf(':');const id=+s.slice(0,k),i=+s.slice(k+1);const ln=B.querySelector(`[data-ln="${id}"]`);
      const r=bzmOffer(P,id,i,!!(ln&&ln.checked));if(r.ok){const L=lrnEnsure(P);['Patrimonio','Utilidad'].forEach(c=>L.c[c]=L.c[c]||G.year);if(ln&&ln.checked)L.c['Compra apalancada']=L.c['Compra apalancada']||G.year;if(fx)v21bLrn('Inversión extranjera directa');}
      if(r.roll==null&&r.t){toast('🛒',r.t);return;}v21Res(r,r.ok?showBiz:()=>showBzMarket(nid));});});};

/* ---------- 🤝 vender tu empresa negociando ---------- */
const BZS_N={comp:['Competidor del mismo giro','Paga más si la empresa está sana: le suma clientes y sucursales.'],fondo:['Fondo de capital privado','Solo compra empresas con utilidades; paga según sus flujos.'],
  ind:['Inversionista individual','Ofrece menos, pero compra casi cualquier empresa.']};
function showBzSell(i){const b=bzList(P)[i];if(!b)return showBiz();const T=bzT(b);if(P.biz===b&&b.pub){toast('🤝','Tu empresa cotiza en bolsa: vende tus acciones desde 📈 Bolsa.');return;}const S=bzsEnsure(P,b);
  let h=`<button class="btn" id="v21sb" style="margin-bottom:6px">← ${T.ic} <span data-noi18n>${clean(b.n)}</span></button><h3>🤝 <span>Vender la empresa</span></h3>`+
   v19Tiles([['Valor estimado',fmt(bzValue(b))],['Salud de la empresa',`${S.h}/100`,'',shCol(S.h)]],2)+
   `<div class="hint"><span>Cada comprador ofrece según la salud de la empresa: margen, reputación, crecimiento y deuda.</span> <span>Puedes aceptar o pedir más: si se niega, baja un poco su oferta; a la segunda negativa se retira.</span> <span>Las ofertas se renuevan cada 3 meses.</span></div>`;
  if(!S.L.length)h+=`<div class="hint">Por ahora no hay compradores interesados.</div>`;
  S.L.forEach((o,k)=>{h+=`<div class="bzc v21o"><div class="h"><b>${o.k==='ind'?'👤':o.k==='fondo'?'💼':'🏢'} <span data-noi18n>${clean(o.n)}</span></b><span>${fmt(o.px)}</span></div><div class="s"><span>${BZS_N[o.k][0]}</span> · <span>${BZS_N[o.k][1]}</span></div>
    ${o.neg?`<div class="v21tags"><span class="pill">Ya rechazó pagar más: ${o.neg}</span></div>`:''}
    <div class="v21of">${BZS_M.map((mu,j)=>`<button class="btn${j===0?' gold':''}" data-sl="${k}:${j}"><b>${j?`+${Math.round((mu-1)*100)} %`:'Aceptar'}</b><small>${fmt(o.px*mu)}</small><small>${bzsChance(o,j,S.h)} %</small></button>`).join('')}</div></div>`;});
  openSheetRaw(h,B=>{B.querySelector('#v21sb').onclick=()=>showBizD(i);
    B.querySelectorAll('[data-sl]').forEach(x=>x.onclick=()=>{const s=x.dataset.sl,c=s.lastIndexOf(':');const k=+s.slice(0,c),j=+s.slice(c+1);const r=bzsDo(P,b,k,j);if(r.ok){v21bLrn('Múltiplo de valuación');sfx('coin');}
      if(r.roll==null&&!r.ok){toast('🤝',r.t);return;}v21Res(r,r.ok?showBiz:()=>{const ii=bzList(P).indexOf(b);if(ii>=0)showBzSell(ii);else showBiz();});});});}

/* ---------- 🏭 salud de los sectores en País → Economía ---------- */
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(VIEW.v==='pa'&&VIEW.tab==='eco')v21bSectors();}catch(e){console.warn('v21b sectores',e);}return r;};}
function v21bSectors(){const body=$('natBody');if(!body||!G||!G.sh||body.querySelector('#v21sh'))return;shEnsure();const n=natOf(P);const bk=bnkEnsure(n);const L=SH_K.map(k=>[k,shOf(n.id,k)]).sort((a,b)=>b[1]-a[1]);
  const hg=shHog(n),ln=shLoans(n);const d=document.createElement('div');d.id='v21sh';
  d.innerHTML=`<div class="sect">🏭 <span>Salud de los sectores</span></div><div class="hint"><span>50 es lo normal.</span> <span>Cada sector depende de sus clientes: si la construcción cae, la industria y la minería lo sienten después (cadena de suministro).</span> <span>Toca un sector para ver sus causas.</span></div>
   <div class="v21sr v21sx"><div class="h"><span>🛒 <span>Consumo de los hogares</span></span><span>${shBar(hg)} <b>${Math.round(hg)}</b></span></div></div>
   <div class="v21sr v21sx"><div class="h"><span>🏦 <span>Salud de los bancos</span></span><span>${shBar(bk.h)} <b>${Math.round(bk.h)}</b></span></div><div class="s"><span>Sus deudores</span> <b class="${ln>=0?'up':'dn'}">${ln>=0?'+':'−'}${Math.abs(ln).toFixed(1)}</b>${bk.cr>0?` · <b class="dn">Crisis bancaria</b>`:''}</div></div>`+
   L.map(([k,h])=>`<button class="v21sr${V21B.open[k]?' open':''}" data-shk="${k}"><div class="h"><span>${SECT[k][0]}</span><span>${shBar(h)} <b>${Math.round(h)}</b> ${shArrow(n,k)}</span></div><div class="v21cs">${shCauses(n,k)}</div></button>`).join('');
  body.append(d);d.querySelectorAll('[data-shk]').forEach(x=>x.onclick=()=>{const k=x.dataset.shk;V21B.open[k]=!V21B.open[k];x.classList.toggle('open',!!V21B.open[k]);});v21bLrn('Cadena de suministro');}

/* ---------- 🏭 economía local en la ficha de la provincia y en la ficha de abajo del mapa ---------- */
{const _sp=showPlace;showPlace=function(rid,tab){const r=_sp(rid,tab);try{if(PL.tab==='pr')v21bPlace(PL.rid);}catch(e){console.warn('v21b provincia',e);}return r;};}
function v21bPlace(rid){const B=$('sheetIn');if(!B||!G.sh||B.querySelector('#v21pl'))return;const E=placeEco(rid);if(!E)return;const x=G.regions[rid];const mine=bzList(P).filter(b=>b.v14&&b.r===rid);
  const d=document.createElement('div');d.id='v21pl';
  d.innerHTML=`<div class="sect">🏭 <span>Economía local</span></div>`+v19Tiles([['Actividad económica',`${Math.round(E.a)}/100`,'',shCol(E.a)],['Sector principal',SECT[E.top[0][0]][0]]],2)+
   `<div class="v21pl">${E.top.slice(0,5).map(([k,c])=>`<div class="v21sr v21sx"><div class="h"><span>${SECT[k][0]}</span><span><span>${Math.round(c*100)} % de la economía</span> ${shBar(shOf(x.o,k))}</span></div></div>`).join('')}</div>`+
   (E.L?`<div class="hint v21w">📉 <span>Demanda de la provincia</span> <b>${pctV(E.L[0])}</b> · <span>${LX_W[E.L[2]]||LX_W.qb}</span> · <span>${E.L[1]} meses</span></div>`:'')+
   (mine.length?mine.map(b=>{const Q=bzEco(b);return `<button class="item" data-v21bz="${bzList(P).indexOf(b)}"><span><div class="t">${bzT(b).ic} <span data-noi18n>${clean(b.n)}</span></div><div class="s"><span>PIB de la provincia</span>: <b>${shareTxt(Q.shP)}</b> · <span>Empleos</span>: <b>${Q.jobs} + ${Q.jInd}</b></div></span></button>`;}).join(''):'');
  const s=[...B.querySelectorAll('.sect')].find(el=>/Tus intereses aquí|Acciones aquí/.test(el.textContent));if(s)s.before(d);else B.append(d);
  d.querySelectorAll('[data-v21bz]').forEach(e=>e.onclick=()=>showBizD(+e.dataset.v21bz));}
{const _rs=renderSel;renderSel=function(){_rs();try{if(!G||!G.sel||!G.sh||!RG[G.sel]||!G.regions[G.sel])return;const box=$('selInfo');if(!box||box.querySelector('.v21m'))return;const E=placeEco(G.sel);if(!E)return;
  const mem=[...box.querySelectorAll('.mem')].find(x=>/Provincia:/.test(x.textContent));const h=`<div class="mem v21m"><span>Actividad económica</span>: <b style="color:${shCol(E.a)}">${Math.round(E.a)}/100</b> · <span>${SECT[E.top[0][0]][0]}</span></div>`;
  if(mem)mem.insertAdjacentHTML('afterend',h);}catch(e){console.warn('v21b ficha',e);}};}

/* ---------- 🏢 modo de mapa: actividad económica + tus empresas y grupos ---------- */
MODES_MAP.emp={n:'Economía local y tus empresas',ic:'🏢',mix:.72,lo:'débil',hi:'fuerte'};
(function(){const mm=document.querySelector('.mmodes');if(!mm)return;const x=document.createElement('button');x.dataset.mm='emp';x.title='Economía local y tus empresas';x.textContent='🏢';x.onclick=e=>{e.stopPropagation();setMapMode('emp');};mm.appendChild(x);})();
{const _pc=provColor;provColor=function(id){if(MMODE!=='emp'||!G||!G.sh)return _pc(id);if(!WMW.act||WMW.g!==G)wmwSync();const i=WMWI.RI?WMWI.RI[id]:null;if(i==null)return [58,63,71];
  const x=G.regions[id];if(!x||!G.nations[x.o]||!G.nations[x.o].alive)return [58,63,71];return ramp(clamp((WMW.act[i]-25)/50,0,1));};}
{const _sm=setMapMode;setMapMode=function(k){if(k==='emp'&&G&&G.sh&&(!WMW.act||WMW.g!==G))wmwSync();_sm(k);try{if(k==='emp'){const lg=$('mLeg');if(lg){lg.insertAdjacentHTML('beforeend',`<div class="v21lg"><span class="v21mk">🏢</span> <span>Tus empresas</span></div>`);lg.style.display='block';}}}catch(e){}};}
const GRP_COL=['#f2c14e','#5aa2f0','#3ccf8e','#e86fb4','#f08a4b','#a98bf5'];
{const _do=drawOverlay;drawOverlay=function(){_do();try{if(MMODE!=='emp'||!P||!G)return;const ov=$('mapOv');if(!ov)return;const u=upp();const by={};
  bzList(P).forEach(b=>{if(!b.v14||!RG[b.r])return;(by[b.r]=by[b.r]||[]).push(b);});const g=el('g',{},ov);const x0=vb.x,x1=vb.x+vb.w,y0=vb.y,y1=vb.y+vb.h;
  for(const r in by){const c=RG[r].c;if(c[0]<x0-40*u||c[0]>x1+40*u||c[1]<y0-40*u||c[1]>y1+40*u)continue;const L=by[r];const gp=grpOf(P,L[0]);const col=gp?GRP_COL[(gp.id-1)%GRP_COL.length]:'#f2c14e';
    const s=13*u,w=L.length>1?s*2.3:s*1.5;el('rect',{x:c[0]-w/2,y:c[1]-s*1.9,width:w,height:s*1.35,rx:s*.4,fill:'rgba(12,18,26,.85)',stroke:col,'stroke-width':1.6*u},g);
    const t=el('text',{x:c[0]-(L.length>1?s*.45:0),y:c[1]-s*.88,'text-anchor':'middle','font-size':s*.9},g);t.textContent=bzT(L[0]).ic;
    if(L.length>1){const q=el('text',{x:c[0]+s*.55,y:c[1]-s*.9,'text-anchor':'middle','font-size':s*.7,'font-weight':800,fill:col},g);q.textContent=String(L.length);}}}catch(e){console.warn('v21b mapa',e);}};}

/* ---------- Ajustes: economía del mundo en otro hilo ---------- */
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';const on=wmwOn();
  const st=!on?'La actividad económica de las provincias se calcula en el hilo principal.':WMW.ok===false?'No disponible en este navegador: se calcula en el hilo principal.':'La actividad económica de las 3,422 provincias se calcula en otro hilo cada mes.';
  x.innerHTML=`<span><div class="t">${on?'⚙️ Economía del mundo en segundo plano: activada':'⚙️ Economía del mundo en segundo plano: desactivada'}</div><div class="s">${st}</div></span>`;
  x.onclick=()=>{CFG.wmw=on?0:1;saveCfg();if(CFG.wmw===0)wmwDown('apagado');else WMW.ok=null;showSettings();};
  const f=[...b.querySelectorAll('.item')].find(el=>/Guardado en segundo plano/.test(el.textContent));if(f)f.after(x);else b.append(x);};}

/* ---------- glosario, ayuda ⓘ y Guía ---------- */
GLOS.push(
 ['Valor agregado','Lo que una empresa suma a la economía: sus ventas menos lo que compra a otras empresas (insumos). La suma del valor agregado de todas las empresas es el PIB.',['valor agregado'],3],
 ['Multiplicador económico','Cada peso que una empresa gasta en proveedores y sueldos se vuelve a gastar en otros negocios; por eso su efecto total en la economía es mayor que sus propias ventas.',['multiplicador'],3],
 ['Cadena de suministro','Red de empresas que se venden entre sí: si un cliente importante entra en crisis, sus proveedores lo sienten después, y así en cadena.',['cadena de suministro','cadena'],3],
 ['Integración vertical','Ser dueño de tu propio proveedor (o cliente): el insumo te sale más barato y no dependes de otros, pero concentras el riesgo.',['integración vertical'],3],
 ['Inversión extranjera directa','Comprar o abrir empresas en otro país. Trae empleos y capital al país que la recibe; el inversionista asume sus crisis, sus impuestos y su moneda.',['inversión extranjera directa','inversión extranjera'],3],
 ['Múltiplo de valuación','Cuántas veces su utilidad anual se paga por una empresa. Un comprador paga más múltiplo si la empresa crece, tiene buen margen y poca deuda.',['múltiplo'],3]);
V20.gt=null;
(function(){const H=[
 ['Aporte a la economía local','🌐 Aporte a la economía local','El PIB de un lugar es la suma del valor agregado de sus empresas. Una empresa además compra a proveedores y paga sueldos que se gastan en otros negocios: es el efecto multiplicador.','Valor agregado = ventas − insumos de los últimos 12 meses. «Con proveedores y sueldos» suma la mitad de los insumos que se compran en la región y 35 % de los sueldos. Cada año, el cambio de ese aporte entra al PIB de la provincia (70 %: el resto lo habría hecho la competencia) y mueve su PIB por persona, que a su vez mueve los sueldos de la provincia; si la empresa quiebra o cierra, se resta.'],
 ['Cadena de suministro','🔗 Cadena de suministro','Las empresas se venden entre sí. Por eso una crisis en un sector viaja a sus proveedores, y la quiebra de una empresa grande deja deudas impagas en los bancos y desempleo en su ciudad.','Tus insumos siguen el precio mundial de sus materias primas. Si una empresa tuya produce el insumo de otra tuya en el mismo país, ese insumo sale 10 % más barato (integración vertical). Si quiebras, la provincia pierde empleos y demanda por 12 meses y los bancos del país pierden 60 % de tu deuda.'],
 ['Salud de los sectores','🏭 Salud de los sectores','Los sectores no se mueven igual: con tasas altas sufren la construcción y la tecnología; en recesión, el lujo; el petróleo caro ayuda a las petroleras y daña al transporte.','Cada mes cada sector de cada país se mueve hacia un objetivo: 50 + crecimiento, recesión, tasas, guerra, materias primas, bancos, quiebras y la salud de sus clientes. Mueve hasta ±12 % la demanda de tus empresas, las utilidades de las empresas de bolsa del país y la salud de sus bancos.'],
 ['Vender la empresa','🤝 Vender la empresa','Una empresa vale lo que alguien paga por ella: un competidor paga más porque gana clientes (sinergias); un fondo paga por los flujos; un particular suele ofrecer menos.','Tres compradores ofrecen según la salud de la empresa (margen, reputación, crecimiento y deuda). Aceptar es seguro; pedir +10 o +20 % tiene probabilidad visible. Si se niega, baja 3 % su oferta; a la segunda negativa se retira. Al venderla, su aporte al PIB se queda en la provincia.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🌐 Economía conectada',`<b>Tus empresas mueven la economía y la economía mueve a tus empresas.</b>
<ul><li><b>🌐 Aporte:</b> en la ficha de cada empresa ves su valor agregado (ventas − insumos), el efecto en proveedores y sueldos (multiplicador), los empleos, los impuestos y qué parte del PIB de la provincia y del país representa. Cada año ese aporte entra al PIB de la provincia.</li>
<li><b>🔗 Cadena:</b> tus insumos siguen el precio mundial; si una empresa tuya produce el insumo de otra tuya, te sale 10 % más barato. Una quiebra deja desempleo en la provincia y pérdidas en los bancos.</li>
<li><b>🏭 Sectores:</b> en País → Economía cada sector tiene su salud (50 = normal) con sus causas; mueve la demanda de tus empresas y la Bolsa.</li>
<li><b>🤝 Vender:</b> en la ficha de tu empresa, «Vender» abre la negociación con tres compradores.</li>
<li><b>🛒 Otros países:</b> en Empresas en venta elige el país; pagas 3 % de trámites.</li>
<li><b>🏢 Mapa:</b> el modo 🏢 pinta la actividad económica de cada provincia y marca tus empresas (el color del marco es su grupo).</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🏢 Comprar empresas/.test(g[0]));GUIA.splice(gi>=0?gi+1:0,0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v21b',e);}}
if(typeof shWrapAll==='function')shWrapAll();

(function(){const st=document.createElement('style');st.id='v21bcss';st.textContent=`
.v21hb{display:inline-block;width:56px;height:7px;border-radius:4px;background:var(--line);overflow:hidden;vertical-align:middle}.v21hb i{display:block;height:100%}
.v21bi{font-size:13px;margin:4px 0;line-height:1.35}.v21in{padding-inline-start:10px}.v21in .s{color:var(--mut);font-size:12px;margin-top:2px}
.v21bh{border:1px solid var(--line);border-radius:10px;padding:6px 10px;margin:8px 0;background:var(--card2)}.v21bh .h{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px}.v21bh .s{font-size:12.5px;margin-top:4px}
.v21cs{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12px;color:var(--mut);margin-top:4px}.v21cz{white-space:nowrap}
.v21sr{display:block;width:100%;text-align:start;border:1px solid var(--line);border-radius:10px;padding:6px 10px;margin:4px 0;background:var(--card2);color:var(--ink)}
.v21sr .h{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}.v21sr .s{font-size:12px;color:var(--mut);margin-top:3px}
button.v21sr .v21cs{display:none}button.v21sr.open .v21cs{display:flex}.v21eq{color:var(--mut)}
.v21cc{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 6px}.v21cc select{max-width:120px;border-radius:14px;background:var(--card2);color:var(--ink);border:1px solid var(--line);padding:3px 6px}
.v21lg{margin-top:4px}.v21mk{display:inline-block;border:1.5px solid #f2c14e;border-radius:5px;padding:0 3px;font-size:11px}
`;document.head.appendChild(st);})();
