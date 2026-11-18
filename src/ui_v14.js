/* ===== v1.4: Mis empresas (operación y estado de resultados), abrir negocio, recursos en el mapa, materias primas y bonos, recursos del país ===== */
(function(){const st=document.createElement('style');st.textContent=`
.bzc{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--card2);border-radius:12px;padding:10px 12px;margin:6px 0}
.bzc .h{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.bzc .h b{font-size:15px}.bzc .s{font-size:12px;color:var(--mut);margin-top:2px}
.ubar{height:6px;border-radius:4px;background:#0e141c;overflow:hidden;margin-top:6px}.ubar i{display:block;height:100%;background:linear-gradient(90deg,#3fb6a8,#f2c14e,#f0565d)}
.ist{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums;margin:6px 0}.ist td{padding:4px 4px;border-bottom:1px solid #1e2a3a;text-align:right}.ist td:first-child{text-align:left;color:var(--mut)}
.ist tr.tot td{color:var(--ink);font-weight:700;border-top:1px solid #33465e}.ist tr.sub td{color:var(--ink);font-weight:600}.ist th{font-size:11px;color:var(--mut);text-align:right;font-weight:600;padding:4px}.ist th:first-child{text-align:left}
.dec{margin:6px 0}.dec .lb{font-size:12px;color:var(--mut);margin-bottom:2px}.tip2{font-size:12.5px;border-left:3px solid var(--gold);padding:4px 8px;margin:6px 0;background:rgba(242,193,78,.06);border-radius:0 8px 8px 0}
.rsr{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1px solid var(--line);background:var(--card2);border-radius:10px;padding:8px 10px;margin:5px 0}.rsr .ic{font-size:20px;width:26px;text-align:center}.rsr .nm{flex:1}.rsr .nm b{display:block;font-size:13.5px}.rsr .nm span{font-size:11.5px;color:var(--mut)}.rsr .px{text-align:right;font-size:12.5px;font-variant-numeric:tabular-nums}`;document.head.appendChild(st);})();
const SEGB=(lab,key,opts,cur)=>`<div class="dec"><div class="lb">${lab}</div><div class="seg">${opts.map(([v,t])=>`<button data-bz="${key}:${v}" class="${cur===v?'on':''}">${t}</button>`).join('')}</div></div>`;
function drawBars(wrap,rows,cols,fmtV){const cv=wrap.querySelector('canvas'),tip=wrap.querySelector('.tip');const dpr=Math.min(2,window.devicePixelRatio||1);const W=wrap.clientWidth||320,H=170;cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);const n=rows.length;if(!n){g.fillStyle='#8d98a8';g.font='12px system-ui';g.fillText('Aún no hay meses de operación: avanza el reloj.',10,30);return;}
  let hi=0,lo=0;rows.forEach(r=>cols.forEach(([k])=>{hi=Math.max(hi,r[k]);lo=Math.min(lo,r[k]);}));const padR=56,Y=v=>8+(hi-v)/((hi-lo)||1)*(H-24);const bw=(W-padR)/n;
  g.strokeStyle='#1e2a3a';g.fillStyle='#8d98a8';g.font='10.5px system-ui';[hi,(hi+lo)/2,lo,0].forEach(v=>{g.beginPath();g.moveTo(0,Y(v));g.lineTo(W-padR,Y(v));g.stroke();g.fillText(fmtV(v),W-padR+4,Y(v)+3);});
  rows.forEach((r,i)=>cols.forEach(([k,col],j)=>{const v=r[k];g.fillStyle=typeof col==='function'?col(v):col;const x=i*bw+bw*(.12+j*.4);const y0=Y(Math.max(0,v)),y1=Y(Math.min(0,v));g.fillRect(x,y0,bw*.36,Math.max(1,y1-y0));}));
  const lbl=i=>{const r=rows[i];return `${MES[r.mo]} ${r.y} · `+cols.map(([k,,nm])=>`${nm} ${fmtV(r[k])}`).join(' · ');};tip.textContent=lbl(n-1);
  cv.onpointermove=cv.onpointerdown=e=>{const rc=cv.getBoundingClientRect();const i=clamp(Math.floor((e.clientX-rc.left)/bw),0,n-1);tip.textContent=lbl(i);};}

/* ----- lista de empresas ----- */
function showBiz(){if(!P||!G)return;ensureV14();const L=bzList(P);let h=`<h3>🏪 Mis empresas</h3><div class="hint">Cada mes tu empresa vende, paga insumos, nómina, renta, impuestos y deudas; lo que reparte llega a tu dinero. Máximo ${MAXBZ} empresas.</div>`;
  h+=L.length?L.map((b,i)=>{if(!b.v14)return '';const T=bzT(b);const m=b.m[b.m.length-1]||{rev:0,net:0,util:0};return `<button class="bzc" data-bi="${i}"><div class="h"><b>${T.ic} ${b.n}${b.pub?' ⭐':''}</b><span class="chg ${m.net>=0?'up':'dn'}">${fmt(m.net)}/mes</span></div>
    <div class="s">${T.n} · ${RG[b.r].nm} · ${b.br} ${b.br>1?'sucursales':'sucursal'} · ${b.st} empleados · reputación ${Math.round(b.rep)} · ventas ${fmt(m.rev)}/mes</div><div class="ubar"><i style="width:${Math.round(Math.min(1,m.util||0)*100)}%"></i></div></button>`;}).join(''):'<div class="hint">Aún no tienes negocios.</div>';
  h+=`<button class="btn gold" id="bzNew" style="width:100%;margin-top:8px" ${L.length>=MAXBZ?'disabled':''}>➕ Abrir un negocio en ${RG[P.r].nm}</button><div class="hint">Para abrir en otra provincia, tócala en el mapa → Abrir negocio. El modo ⛏️ del mapa muestra dónde hay minas, petróleo y cultivos.</div>`;
  openSheetRaw(h,B=>{B.querySelectorAll('[data-bi]').forEach(x=>x.onclick=()=>showBizD(+x.dataset.bi));B.querySelector('#bzNew').onclick=()=>showBizNew(P.r);});}
/* ----- abrir negocio ----- */
function showBizNew(r){ensureV14();const U0=bzU(r);let h=`<button class="btn" id="bkB" style="margin-bottom:6px">← Mis empresas</button><h3>Abrir negocio en ${RG[r].nm}</h3><div class="hint">Salario medio local: ${fmt(U0)}/año · tienes ${fmt(P.dinero)}. Con crédito, el banco pone la mitad (tasa ${(Math.max(1,G.nations[G.regions[r].o].rate)+2).toFixed(1)} %).</div>`;
  const dep=DEP[r]?Object.keys(DEP[r]).map(k=>RES0[k][1]+' '+RES0[k][0]).join(', '):'';if(dep)h+=`<div class="tip2">Yacimientos aquí: ${dep}</div>`;
  h+=BZ.map(T=>{const {cap,wc}=bzOpenCost(T.k,r);const rv=bzRv(T,r)*U0;const err=bzCanOpen(P,T.k,r);const tot=cap+wc;const mg=Math.round((T.gm-T.L-T.rs-.02-(T.re?.24:T.fin?0:T.K/10)-(T.roy||0))*100);
    return `<div class="bzc"><div class="h"><b>${T.ic} ${T.n}</b><span>${fmt(tot)}</span></div><div class="s">Ventas ~${fmt(rv)}/año · margen típico ${mg} % · ${T.st} empleados · ${SECT[T.sec][0]}${T.in&&T.in.length?' · insumos: '+T.in.map(([k])=>RES0[k][0].toLowerCase()).join(', '):''}${T.out?' · vende a precio mundial':''}${T.rc===1?' · resiste recesiones':T.rc===-1?' · sufre en recesiones':''}</div>
      ${err?`<div class="s" style="color:#ff9aa0">${err}</div>`:`<div class="mpb"><button data-op="${T.k}:0" ${P.dinero>=tot?'':'disabled'}>Abrir con mi dinero</button><button data-op="${T.k}:1" ${P.dinero>=tot*.5&&P.age>=18?'':'disabled'}>Con crédito (${fmt(tot*.5)})</button></div>`}</div>`;}).join('');
  openSheetRaw(h,B=>{B.querySelector('#bkB').onclick=showBiz;B.querySelectorAll('[data-op]').forEach(x=>x.onclick=()=>{const [k,l]=x.dataset.op.split(':');
    const go=()=>{const r2=bzOpen(P,k,r,l==='1');log(r2,/Abres/.test(r2)?'good':'bad');sfx('coin');fix(P);save();render();if(/Abres/.test(r2))showBizD(bzList(P).length-1);else toast('⚠️',r2);};
    if(typeof useAct==='function'&&typeof actCost==='function'&&!canAfford('negocio')){toast('⏳ Sin tiempo libre','Abrir un negocio toma 10 días de tu tiempo.');return;}
    if(typeof useAct==='function')useAct(()=>{go();return null;},'Abrir negocio');else go();});});}
/* ----- detalle de una empresa ----- */
function showBizD(i){const b=bzList(P)[i];if(!b)return showBiz();const T=bzT(b);const m=b.m[b.m.length-1];const L12=b.m.slice(-12);const S=k=>L12.reduce((s,z)=>s+(z[k]||0),0);const ya=b.ya[b.ya.length-1];
  const need=T.st*b.br;const val=bzValue(b);let inF=1;(T.in||[]).forEach(([rk,w])=>{const o=G.rs[rk];inF+=w*(o.p/(o.p0*(isReal()?G.cx.USD.cp:1))-1);});
  let h=`<button class="btn" id="bkB" style="margin-bottom:6px">← Mis empresas</button><h3 style="margin:2px 0">${T.ic} ${b.n}${b.pub?' ⭐':''} <button class="btn" id="bzRn" style="padding:2px 8px;font-size:11px">Renombrar</button></h3>
    <div class="hint">${T.n} · ${RG[b.r].nm}, ${G.nations[G.regions[b.r].o].name} · desde ${b.y||G.year}${b.pub?` · cotiza en bolsa (tienes ${Math.round((b.own||0)*100)} %)`:''}</div>`;
  const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;
  h+=`<div class="kv">${kv('Ventas (12 meses)',fmt(S('rev')))+kv('Utilidad neta',`<span class="${S('net')>=0?'up':'dn'}">${fmt(S('net'))}</span>`)+kv('Margen neto',S('rev')?(S('net')/S('rev')*100).toFixed(1)+' %':'—')+kv('Te repartió',fmt(S('paid')))+
    kv('Caja',fmt(b.cash))+kv('Deuda',fmt(b.debt))+kv('Valor estimado',fmt(val))+kv('Reputación',Math.round(b.rep)+' / 100')+kv('Empleados',`${b.st} (necesita ${need})`)+kv('Sucursales',`${b.br} / ${T.mx}`)+
    kv('Uso de capacidad',m?Math.round(Math.min(1,m.util)*100)+' %':'—')+kv('Demanda / capacidad',m&&!T.out?Math.round(m.dem*100)+' %':'—')}</div>`;
  h+=chartBox('bzCv').replace('class="cv"','class="cv" style="margin-top:8px"')+`<div class="lg2"><span><i style="background:#5aa2f0"></i>Ventas</span><span><i style="background:#3ccf8e"></i>Utilidad neta</span></div>`;
  // consejos con causa
  const tips=[];if(m){if(m.dem>1.08&&m.util>.97)tips.push('Hay más clientes de los que puedes atender: abre otra sucursal, contrata o sube precios.');if(b.st<need*.9)tips.push(`Te faltan empleados (${need-b.st}): pierdes capacidad y reputación.`);
    if(m.util<.7&&!T.out)tips.push('Te sobra capacidad: baja precios, invierte en mercadotecnia o cierra una sucursal.');if(b.rep<35)tips.push('Reputación baja: sube la calidad o los sueldos (la rotación de personal hunde el servicio).');
    if(inF>1.12)tips.push(`Tus insumos cuestan ${Math.round((inF-1)*100)} % más que a inicios de 2026 (${T.in.map(([k])=>RES0[k][0].toLowerCase()).join(', ')}).`);if(T.out){const o=G.rs[b.res||'corn'];tips.push(`Vendes ${R0n(b.res||'corn')} a precio mundial: ${rsFmt(b.res||'corn',o.p)}.`);}
    if(b.debt>0&&m.int>m.net&&m.net>0)tips.push('Los intereses ya pesan más que tu utilidad: paga deuda.');if(G.nations[G.regions[b.r].o].rec>0)tips.push('El país está en recesión: la demanda baja.');}
  h+=tips.map(t=>`<div class="tip2">${t}</div>`).join('');
  // estado de resultados
  const row=(lab,k,cl,neg)=>{const a=m?m[k]||0:0,c=S(k),d=ya?ya[k]||0:null;const f=v=>(neg&&v?'−':'')+fmt(Math.abs(v));return `<tr class="${cl||''}"><td>${lab}</td><td>${f(a)}</td><td>${f(c)}</td>${ya?`<td>${f(d)}</td>`:''}</tr>`;};
  const row2=(lab,fn,cl)=>{const a=m?fn(m):0,c=fn({rev:S('rev'),cogs:S('cogs'),pay:S('pay'),rent:S('rent'),mkt:S('mkt'),dep:S('dep'),int:S('int'),tax:S('tax'),net:S('net')}),d=ya?fn(ya):null;return `<tr class="${cl}"><td>${lab}</td><td>${fmt(a)}</td><td>${fmt(c)}</td>${ya?`<td>${fmt(d)}</td>`:''}</tr>`;};
  h+=`<div class="sect">Estado de resultados</div><table class="ist"><tr><th></th><th>Último mes</th><th>12 meses</th>${ya?`<th>${ya.y}</th>`:''}</tr>`+row('Ventas','rev','sub')+row('Costo de ventas (insumos)','cogs','',1)+row2('Utilidad bruta',z=>z.rev-z.cogs,'sub')+
    row('Nómina y prestaciones','pay','',1)+row((T.roy?'Renta y servicios + regalías':'Renta y servicios'),'rent','',1)+row('Mercadotecnia','mkt','',1)+row('Depreciación','dep','',1)+row2('Utilidad de operación',z=>z.rev-z.cogs-z.pay-z.rent-z.mkt-z.dep,'sub')+
    row('Intereses','int','',1)+row(`Impuestos (${isReal()?(CIT[G.regions[b.r].o]!=null?CIT[G.regions[b.r].o]:25)+' %':'Rápido: sin ISR'})`,'tax','',1)+row('Utilidad neta','net','tot')+row('Reparto al dueño','paid','')+`</table>`;
  // decisiones
  h+=`<div class="sect">Decisiones</div>`+SEGB('Precio','pr',[[-1,'Bajo −15 %'],[0,'Normal'],[1,'Alto +15 %']],b.pr)+SEGB('Calidad de insumos','q',[[-1,'Económica'],[0,'Estándar'],[1,'Premium']],b.q)+
    SEGB('Sueldos','wg',[[-1,'Bajos'],[0,'De mercado'],[1,'Altos']],b.wg)+SEGB('Mercadotecnia (de las ventas)','mk',[[0,'0 %'],[2,'2 %'],[5,'5 %'],[10,'10 %']],b.mk)+SEGB('Reparto de utilidades al dueño','py',[[0,'0 %'],[25,'25 %'],[50,'50 %'],[100,'100 %']],b.py);
  const brc=T.K*bzRv(T,b.r)*bzU(b.r);
  h+=`<div class="dec"><div class="lb">Personal y sucursales</div><div class="mpb"><button data-ac="st:-1">− 1 empleado</button><button data-ac="st:1">+ 1</button><button data-ac="st:${Math.max(1,need-b.st)}">Contratar lo necesario</button>
    <button data-ac="br:1" ${b.br<T.mx?'':'disabled'}>Abrir sucursal (${fmt(brc)})</button><button data-ac="br:-1" ${b.br>1?'':'disabled'}>Cerrar sucursal</button></div></div>
    <div class="dec"><div class="lb">Dinero de la empresa</div><div class="mpb"><button data-ac="ln:1">Pedir préstamo</button><button data-ac="ln:-1" ${b.debt>0&&b.cash>0?'':'disabled'}>Pagar deuda</button><button data-ac="in:1">Aportar ${fmt(Math.max(0,P.dinero)*.2)}</button><button data-ac="wd:1" ${b.cash>0?'':'disabled'}>Retirar caja</button></div></div>
    <div class="mpb"><button data-ac="sell:1" ${b.pub?'disabled':''}>Vender (~${fmt(val)})</button><button data-ac="close:1" ${b.pub?'disabled':''}>Cerrar</button>${!b.pub&&P.biz===b&&ipoInfo(P)?'<button data-ac="ipo:1">🔔 Salir a bolsa</button>':''}</div>
    <div class="hint">Precio alto = más margen pero menos clientes (la demanda responde 1.3 veces). Calidad y sueldos altos suben la reputación, que atrae clientes. Despedir cuesta 3 meses de sueldo (Realista).</div>`;
  openSheetRaw(h,B=>{B.querySelector('#bkB').onclick=showBiz;
    B.querySelector('#bzRn').onclick=()=>askText('Nuevo nombre de la empresa',b.n,nm=>{if(nm){b.n=nm;save();}showBizD(i);},'Guardar');
    B.querySelectorAll('[data-bz]').forEach(x=>x.onclick=()=>{const [k,v]=x.dataset.bz.split(':');b[k]=+v;save();showBizD(i);});
    B.querySelectorAll('[data-ac]').forEach(x=>x.onclick=()=>{const [k,v]=x.dataset.ac.split(':');let r='';
      if(k==='st')r=bzStaff(P,b,+v);else if(k==='br')r=bzBranch(P,b,+v);else if(k==='ln')r=+v>0?bzLoan(P,b,1e15):bzLoan(P,b,-1e15);else if(k==='in')r=bzInject(P,b,Math.max(0,P.dinero)*.2);else if(k==='wd')r=bzWithdraw(P,b,b.cash);
      else if(k==='ipo'){showMarket('pf');return;}
      else if(k==='sell'||k==='close'){askText(k==='sell'?`¿Vender ${b.n} por ~${fmt(val)}?`:`¿Cerrar ${b.n}?`,null,()=>{const r2=k==='sell'?bzSell(P,b):bzClose(P,b);log(r2);sfx('coin');fix(P);save();render();showBiz();},k==='sell'?'Vender':'Cerrar');return;}
      if(r){log(r);toast(T.ic+' '+b.n,r);}fix(P);save();render();showBizD(i);});
    const rows=b.m.slice(-24);requestAnimationFrame(()=>drawBars(B.querySelector('#bzCv'),rows,[['rev','#5aa2f0','ventas'],['net',v=>v>=0?'#3ccf8e':'#f0565d','utilidad']],v=>fmt(v)));});}
// el panel de la provincia abre el selector nuevo
{const _pa=provAction;provAction=function(rid,k){if(k==='biz'){showBizNew(rid);return;}return _pa(rid,k);};}
{const _sa=showAssets;showAssets=function(){_sa();if(!P)return;const b=$('sheetIn');b.querySelectorAll('.sect').forEach(s=>{if(s.textContent==='Tu negocio'){let el=s.nextElementSibling;while(el&&!el.classList.contains('sect')){const nx=el.nextElementSibling;el.remove();el=nx;}s.remove();}});
  const x=document.createElement('button');x.className='item';x.innerHTML=`<span><div class="t">🏪 Mis empresas (${bzList(P).length})</div><div class="s">Estado de resultados, precios, personal, sucursales, préstamos, vender u abrir más</div></span>`;x.onclick=showBiz;const h3=b.querySelector('h3');if(h3&&h3.nextElementSibling)h3.nextElementSibling.after(x);else b.prepend(x);};}
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');const first=b.querySelector('.item');const x=document.createElement('button');x.className='item';
  x.innerHTML='<span><div class="t">🏪 Mis empresas</div><div class="s">Tus negocios: ventas, costos, utilidades y decisiones</div></span>';x.onclick=showBiz;if(first)b.insertBefore(x,first);else b.append(x);};})();

/* ----- mapa de recursos ----- */
MODES_MAP.res={n:'Recursos naturales',ic:'⛏️',mix:.75};
if(typeof LEG!=='undefined')LEG.res=Object.values(RES_CAT).map(([n,c])=>[c,n]).concat([['#3a3f47','sin yacimientos']]);
(function(){const mm=document.querySelector('.mmodes');if(!mm)return;const x=document.createElement('button');x.dataset.mm='res';x.title='Recursos naturales';x.textContent='⛏️';x.onclick=()=>setMapMode('res');mm.appendChild(x);})();
const RCOL={ene:[70,74,84],met:[217,130,43],pre:[232,197,71],agr:[95,174,79]};
{const _pc=provColor;provColor=function(id){if(MMODE!=='res')return _pc(id);const d=DEP[id];if(!d)return [58,63,71];let best=null,bv=0,tot=0;for(const k in d){const v=d[k]*resVal(k);tot+=v;if(v>bv){bv=v;best=k;}}
  const c=RCOL[RES0[best][5]];const f=clamp(.55+Math.log10(1+tot/1e8)*.15,.55,1.1);return c.map(v=>Math.min(255,Math.round(v*f)));};}
{const _rs=renderSel;renderSel=function(){_rs();if(!G||!G.sel||!DEP)return;const d=DEP[G.sel];const box=$('selInfo');const mem=[...box.querySelectorAll('.mem')].find(x=>/Provincia:/.test(x.textContent));
  const mine=P?bzList(P).filter(b=>b.r===G.sel):[];let h='';if(d)h+=`<div class="mem">Recursos: ${Object.keys(d).sort((a,b)=>d[b]*resVal(b)-d[a]*resVal(a)).map(k=>`${RES0[k][1]} ${RES0[k][0]} (${fmtN(d[k]*resVal(k))}/año)`).join(' · ')}</div>`;
  if(mine.length)h+=`<div class="mem">Tus empresas aquí: ${mine.map(b=>bzT(b).ic+' '+b.n).join(', ')}</div>`;if(h&&mem)mem.insertAdjacentHTML('afterend',h);};}

/* ----- Bolsa: materias primas y bonos ----- */
MKTABS.splice(3,0,['cm','Materias'],['bd','Bonos']);
const RSEL={k:'oil',q:100};
MKTAB_FN.cm=[()=>{ensureV14();const b=P.bk;const k=RSEL.k,o=G.rs[k],R=RES0[k];const ch=m=>o.h.length>m?o.p/o.h[o.h.length-1-m]-1:0;
  let h=`<div class="chips">${Object.keys(RES0).map(q=>`<button data-rk="${q}" class="${q===k?'on':''}">${RES0[q][1]} ${RES0[q][0]}</button>`).join('')}</div>`;
  h+=`<div class="ixc"><div class="h"><b>${R[1]} ${R[0]}</b>${pctC(ch(1))}</div><div class="h"><span class="lv">${rsFmt(k,o.p)}</span><span style="font-size:12px;color:var(--mut)">12 meses ${pctC(ch(12))}</span></div></div>`+chartBox('rsCv');
  resNat();const prod=Object.entries(RESN.d).filter(([n,x])=>x[k]).map(([n,x])=>[n,x[k]]).sort((a,b)=>b[1]-a[1]).slice(0,8);const S=RESN.S[k]||1;
  h+=`<div class="sect">Mayores productores</div><table class="tbl"><tr><th>País</th><th>Producción</th><th>% del mundo</th></tr>${prod.map(([n,v])=>{const N=G.nations[n];return `<tr><td>${flag(n,13)} ${N.name}${warsOf(n).length?' ⚔️':''}${N.ban&&N.ban[k]?' 🚫':''}</td><td>${resQty(k,v)}</td><td>${(v/S*100).toFixed(1)} %</td></tr>`;}).join('')}</table>
    <div class="hint"><span>⚔️ en guerra (produce menos) · 🚫 prohíbe exportar.</span> <span>El precio sube cuando falta oferta (guerras, territorio ocupado, prohibiciones), cae cuando la economía mundial se frena, y el oro sube con el miedo.</span></div>`;
  const ps=b.cm[k];h+=`<div class="tbox"><b>Invertir en ${R0n(k)}</b>${ps?`<div class="hint">Tienes ${resQty(k,ps.q)} · costo ${rsFmt(k,ps.c)} · vale ${fmt(toInt(ps.q*o.p,'USD'))} (${((o.p/ps.c-1)*100).toFixed(1)} %)</div>`:''}
    <div class="tin"><label>${resPl(k).replace(/^./,q=>q.toUpperCase())}</label><input id="rsQ" type="number" min="1" value="${RSEL.q}"><button id="rsMax">Máx.</button></div><div class="est" id="rsE"></div>
    <div class="mpb"><button id="rsB" class="on">Comprar</button><button id="rsS" ${ps?'':'disabled'}>Vender</button></div><div class="hint">Diferencial de compra-venta 0.5 % · almacenaje ${k==='gold'?'0.25':'1'} % al año.</div></div>`;
  return h;},b=>{b.querySelectorAll('[data-rk]').forEach(x=>x.onclick=()=>{RSEL.k=x.dataset.rk;showMarket('cm');});const k=RSEL.k,o=G.rs[k];
  const C=o.h.slice(-120).map((v,i,a)=>({o:i?a[i-1]:v,h:v,l:v,c:v,v:0}));requestAnimationFrame(()=>drawChart(b.querySelector('#rsCv'),C,{ty:'l',fp:v=>'US$'+lvF(v),label:(c,i)=>`${dBack('m',C.length-1-i)} · ${rsFmt(k,c.c)}`}));
  const qI=b.querySelector('#rsQ');const est=()=>{RSEL.q=Math.max(0,+qI.value||0);b.querySelector('#rsE').textContent=`${RSEL.q.toLocaleString('es-MX')} × ${rsFmt(k,o.p)} = ${fmt(toInt(RSEL.q*o.p,'USD'))} · tienes ${fmt(P.dinero)}`;};qI.oninput=est;est();
  b.querySelector('#rsMax').onclick=()=>{qI.value=Math.max(0,Math.floor(P.dinero/toInt(o.p*1.005,'USD')));est();};
  const go=buy=>{const r=cmTrade(k,Math.floor(+qI.value||0),buy);if(r.err){toast('⚠️',r.err);return;}log(r.ok,'good');sfx('coin');save();render();showMarket('cm');};b.querySelector('#rsB').onclick=()=>go(true);b.querySelector('#rsS').onclick=()=>go(false);}];
const BSEL={a:.1};
MKTAB_FN.bd=[()=>{ensureV14();const me=natOf(P).id;const L=[...new Set([me].concat(BOND_N))].filter(id=>G.nations[id]&&G.nations[id].alive);const b=P.bk;
  let h=`<div class="hint">Bonos de gobierno a 10 años: pagan intereses cada mes en la moneda del país y devuelven el capital al vencer. Su precio baja si suben las tasas del país (duración ~7 años) y pueden sufrir una quita si el país cae en moratoria (deuda alta + crisis).</div>`;
  if(b.bd.length)h+=`<div class="sect">Tus bonos</div>`+b.bd.map((z,i)=>{const n=G.nations[z.nid];const v=toInt(z.f*bondPx(z),z.cur);return `<div class="stk"><div class="nm"><b>${flag(z.nid,13)} ${n.name} ${z.y.toFixed(2)} %</b><span>vence ${z.mat} · ${G.cx[z.cur].nm} · precio ${(bondPx(z)*100).toFixed(1)}</span></div><div class="px">${fmt(v)}<br><button class="btn" data-bs="${i}" style="padding:3px 8px;font-size:11px">Vender</button></div></div>`;}).join('');
  h+=`<div class="sect">Comprar</div><div class="seg">${[[.05,'5 %'],[.1,'10 %'],[.25,'25 %'],[.5,'50 %']].map(([v,t])=>`<button data-ba="${v}" class="${BSEL.a===v?'on':''}">${t} de tu dinero</button>`).join('')}</div>
    <table class="tbl"><tr><th>País</th><th>Rendimiento</th><th>Deuda/PIB</th><th></th></tr>${L.map(id=>{const n=G.nations[id];ensureEco(n);const y=bondY(n);return `<tr><td>${flag(id,13)} ${n.name}<br><span style="color:var(--mut);font-size:11px">${n.cur}${n.dft&&G.year-n.dft<6?' · moratoria '+n.dft:''}</span></td><td>${y.toFixed(2)} %</td><td>${Math.round(n.debtR*100)} %</td><td><button class="btn" data-bb="${id}" style="padding:4px 8px;font-size:11.5px" ${P.dinero>0?'':'disabled'}>Comprar</button></td></tr>`;}).join('')}</table>`;
  return h;},b=>{b.querySelectorAll('[data-ba]').forEach(x=>x.onclick=()=>{BSEL.a=+x.dataset.ba;showMarket('bd');});
  b.querySelectorAll('[data-bb]').forEach(x=>x.onclick=()=>{const r=bondBuy(x.dataset.bb,Math.max(0,P.dinero)*BSEL.a);if(r.err){toast('⚠️',r.err);return;}log(r.ok,'good');sfx('coin');save();render();showMarket('bd');});
  b.querySelectorAll('[data-bs]').forEach(x=>x.onclick=()=>{const r=bondSell(+x.dataset.bs);if(r.ok)log(r.ok);save();render();showMarket('bd');});}];
// la cartera muestra materias primas y bonos
{const _pf=MKTAB_FN.pf[0];MKTAB_FN.pf[0]=()=>{let h=_pf();const b=P.bk;const cm=Object.keys(b.cm||{}),bd=b.bd||[];if(cm.length||bd.length)h+=`<div class="sect">Materias primas y bonos</div>`+cm.map(k=>`<div class="stk"><div class="nm"><b>${RES0[k][1]} ${RES0[k][0]}</b><span>${resQty(k,b.cm[k].q)}</span></div><div class="px">${fmt(toInt(b.cm[k].q*G.rs[k].p,'USD'))}</div></div>`).join('')+
  bd.map(z=>`<div class="stk"><div class="nm"><b>Bono ${G.nations[z.nid].name} ${z.y.toFixed(2)} %</b><span>vence ${z.mat}</span></div><div class="px">${fmt(toInt(z.f*bondPx(z),z.cur))}</div></div>`).join('');return h;};}

/* ----- recursos del país en País → Economía ----- */
function rzHTML(n){resNat();const d=RESN.d[n.id]||{};const ks=Object.keys(d).filter(k=>d[k]>0).sort((a,b)=>resValue(n.id,b)-resValue(n.id,a));let h=`<div class="sect">⛏️ Recursos estratégicos</div>`;
  if(!ks.length)return h+`<div class="hint">${n.name} no tiene producción relevante de petróleo, gas, minerales ni granos de exportación.</div>`;
  const tot=ks.reduce((s,k)=>s+resValue(n.id,k),0);
  h+=`<table class="tbl"><tr><th>Recurso</th><th>Producción/año</th><th>Mundo</th><th>Valor</th></tr>${ks.map(k=>{const R=RES0[k];return `<tr><td>${R[1]} ${R[0]}${n.ban&&n.ban[k]?' <span>🚫</span>':''}</td><td>${resQty(k,d[k])}</td><td>${(d[k]/(RESN.S[k]||1)*100).toFixed(1)} %</td><td>${fmtN(resValue(n.id,k))}</td></tr>`;}).join('')}</table>
    <div class="hint"><span>Valor total ${fmtN(tot)} al año = ${(tot/Math.max(1,n.gdp)*100).toFixed(1)} % del PIB.</span> <span>${n.nz?'Sector nacionalizado: regalías del 35 %.':'Regalías al Estado: 10 % del valor.'}</span>${P.ruler&&natOf(P)===n&&n._roy?` <span>El año pasado entraron ${fmtN(n._roy)} al tesoro.</span>`:''} <span>Cuando suben los precios, la economía crece más; cuando caen, se frena.</span></div>`; /* v1.7i: frases en <span> separados para que cada una se traduzca (plantillas en tpl.tsv, frases fijas en tr6_b6.tsv) */
  if(!(P.ruler&&natOf(P)===n))return h;const act=P.nat>0&&!blockedTurn();
  h+=`<button class="mpa" data-rz="nz" ${act?'':'disabled'}><b>${n.nz?'Reprivatizar el petróleo y la minería':'Nacionalizar el petróleo y la minería'}</b><span>${n.nz?'Vendes concesiones: vuelve la inversión y las regalías bajan a 10 %.':'Regalías de 10 % → 35 %; menos inversión (−0.3 % de crecimiento al año) y las empresas del sector caen en bolsa. Como México con el petróleo en 1938 o Bolivia con el gas en 2006.'}</span></button>`;
  h+=`<div class="hint" style="margin-top:6px">Prohibir exportaciones (usa una acción): sube el precio mundial y abastece tu mercado, pero pierdes divisas.</div><div class="mpb">${ks.map(k=>`<button data-rb="${k}" class="${n.ban&&n.ban[k]?'on':''}" ${act?'':'disabled'}>${RES0[k][1]} ${n.ban&&n.ban[k]?'Permitir':'Prohibir'}</button>`).join('')}</div>`;
  return h;}
function rzBind(b,n){const again=()=>{save();render();if(VIEW.v==='pa'&&VIEW.tab==='eco')renderView();else showEconomy();};
  b.querySelectorAll('[data-rz]').forEach(x=>x.onclick=()=>{useNat({t:n.nz?'Reprivatizar':'Nacionalizar',vote:1,fn:()=>rzNation(n,!n.nz)});again();});
  b.querySelectorAll('[data-rb]').forEach(x=>x.onclick=()=>{const k=x.dataset.rb;useNat({t:'Exportaciones',fn:()=>rzBan(n,k,!(n.ban&&n.ban[k]))});again();});}
{const _se=showEconomy;showEconomy=function(){if(!P||!G){_se();return;}ensureV14();const n=natOf(P);withAppend(rzHTML(n),b=>rzBind(b,n),_se);};}
/* ----- columna de Bolsa: materias primas ----- */
{const _mc=mkColumnHTML;mkColumnHTML=function(f){const h=_mc(f);if(!G.rs)return h;const ks=['oil','gas','gold','copper','wheat','corn','coffee'];const ch=(o,m)=>o.h.length>m?o.p/o.h[o.h.length-1-m]-1:0;
  const t=`<div class="sect">Materias primas</div><table class="tbl"><tr><th></th><th>Precio (US$)</th><th>Mes</th><th>Año</th></tr>${ks.map(k=>{const o=G.rs[k];return `<tr><td>${RES0[k][1]} ${RES0[k][0]}</td><td>${lvF(o.p)}</td><td>${pctC(ch(o,1))}</td><td>${pctC(ch(o,12))}</td></tr>`;}).join('')}</table>`;
  return h.replace('<button class="btn gold" id="nwMk"',t+'<button class="btn gold" id="nwMk"');};}
/* ----- guía ----- */
GUIA.splice(4,0,['🏪 Empresas, recursos e inversiones',`<b>Mis empresas (Más → 🏪):</b> 28 giros, de un puesto de comida a una fábrica, una mina o un pozo petrolero. Cada mes la empresa vende según la demanda (población, economía, turismo, tasas, reputación, precio y mercadotecnia), paga insumos (que siguen al precio del trigo, maíz, café, petróleo, acero, cobre u oro), nómina con prestaciones, renta, intereses e impuestos reales del país; lo que reparte llega a tu dinero.<ul>
<li><b>Decisiones:</b> precio, calidad, sueldos, mercadotecnia, reparto, empleados, sucursales, préstamos, aportar o retirar caja, vender, cerrar o salir a bolsa.</li><li><b>Estado de resultados</b> del último mes, de 12 meses y del año anterior, con gráfica de ventas y utilidad y consejos según lo que pasa.</li>
<li><b>Quiebra:</b> si las deudas superan lo que vale la empresa, cierra.</li></ul>
<b>Recursos (mapa ⛏️):</b> 14 materias primas con la producción real de cada país repartida en sus provincias según el terreno. Los precios suben si falta oferta (guerras, ocupación, prohibiciones de exportar) y caen cuando la economía mundial se frena; el oro sube con el miedo. Cambian el crecimiento de los países exportadores, la inflación mundial, las acciones de energía y minería y los costos de tus empresas. Conquistar provincias con yacimientos te da su producción.<br>
<b>Inversiones (📈 Bolsa):</b> fondos indexados, materias primas (con almacenaje) y bonos de gobierno a 10 años (intereses mensuales, riesgo de tasas y de moratoria).<br><b>Si gobiernas:</b> nacionalizar o reprivatizar el petróleo y la minería y prohibir exportaciones (País → Economía).`]);
