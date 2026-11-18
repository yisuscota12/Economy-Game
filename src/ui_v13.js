/* ===== v1.3: Bolsa de valores (velas, medias, volumen, órdenes, cortos, margen, OPI), monedas y banco central, columna de Bolsa ===== */
(function(){const st=document.createElement('style');st.textContent=`
.mkt{display:flex;gap:5px;margin:6px 0 8px;overflow-x:auto;scrollbar-width:none}.mkt button{flex:1 0 auto;border:1px solid #334155;background:#0f1722;color:#cbd5e1;border-radius:10px;padding:8px 2px;font-size:12.5px;font-weight:700}.mkt button.on{border-color:var(--gold);color:var(--gold)}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}.chips button{flex:none;border:1px solid var(--line);background:var(--card2);border-radius:999px;padding:5px 10px;font-size:12px;white-space:nowrap}.chips button.on{border-color:var(--gold);color:var(--gold)}
.ixc{border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--card2);margin:8px 0}.ixc .h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.ixc .h b{font-size:15px}.ixc .lv{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums}
.up{color:#3ccf8e}.dn{color:#f0565d}.chg{font-weight:700;font-variant-numeric:tabular-nums}
.cv{position:relative;width:100%;margin:6px 0}.cv canvas{width:100%;display:block;touch-action:none}.cv .tip{position:absolute;left:6px;top:4px;font-size:11px;color:#cbd5e1;background:rgba(10,15,22,.85);border-radius:6px;padding:2px 6px;pointer-events:none;font-variant-numeric:tabular-nums}
.tfs{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px}.tfs button{border:1px solid var(--line);background:#0f1722;border-radius:8px;padding:4px 8px;font-size:11.5px;color:#aab6c5}.tfs button.on{border-color:var(--gold);color:var(--gold)}
.lg2{display:flex;gap:10px;font-size:11px;color:var(--mut);margin:2px 0}.lg2 i{display:inline-block;width:12px;height:3px;border-radius:2px;vertical-align:middle;margin-right:4px}
.stk{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1px solid var(--line);background:var(--card2);border-radius:10px;padding:8px 10px;margin:5px 0}
.stk .nm{flex:1;min-width:0}.stk .nm b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stk .nm span{font-size:11.5px;color:var(--mut)}.stk .px{text-align:right;font-variant-numeric:tabular-nums;font-size:13px}.stk svg{flex:none}
.kv{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:12.5px;margin:6px 0}.kv div{display:flex;justify-content:space-between;gap:6px;border-bottom:1px solid #1e2a3a;padding:3px 0}.kv span{color:var(--mut)}.kv b{font-weight:600;text-align:right;font-variant-numeric:tabular-nums}
.seg{display:flex;gap:4px;margin:6px 0}.seg button{flex:1;border:1px solid var(--line);background:#0f1722;border-radius:8px;padding:7px 2px;font-size:12.5px;font-weight:700;color:#cbd5e1}.seg button.on{background:var(--gold);color:#1a1405;border-color:var(--gold)}.seg button.on.sell{background:#f0565d;border-color:#f0565d;color:#fff}.seg button:disabled{opacity:.35}
.tin{display:flex;gap:6px;align-items:center;margin:6px 0}.tin label{font-size:12px;color:var(--mut);width:70px}.tin input{flex:1;min-width:0;background:#0b1118;color:var(--ink);border:1px solid #334155;border-radius:8px;padding:8px;font:inherit;font-variant-numeric:tabular-nums}
.tin button{border:1px solid var(--line);background:var(--card2);border-radius:8px;padding:7px 8px;font-size:12px}
.est{font-size:12.5px;color:var(--mut);margin:4px 0 8px}.tbox{border:1px solid var(--line);border-radius:12px;padding:8px 10px;background:#111925;margin:8px 0}
.mpb{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.mpb button{border:1px solid var(--line);background:var(--card2);border-radius:9px;padding:7px 10px;font-size:12.5px}.mpb button.on{border-color:var(--gold);color:var(--gold)}.mpb button:disabled{opacity:.4}
.mpa{display:block;width:100%;text-align:left;border:1px solid var(--line);background:var(--card2);border-radius:10px;padding:9px 11px;margin:5px 0}.mpa b{display:block;font-size:13.5px}.mpa span{display:block;color:var(--mut);font-size:12px;line-height:1.35}.mpa:disabled{opacity:.42}
.crit{font-size:12px;margin:2px 0}.tbl{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums}.tbl td,.tbl th{padding:5px 4px;border-bottom:1px solid #1e2a3a;text-align:right}.tbl td:first-child,.tbl th:first-child{text-align:left}.tbl th{color:var(--mut);font-weight:600;font-size:11px}
#pCur{font-size:11px;color:var(--mut);font-weight:700;letter-spacing:.04em}`;document.head.appendChild(st);})();
if(CFG.curv)CURV=CFG.curv;

/* ----- utilidades ----- */
const MKV={tab:'mk',ex:null,id:null,tf:'6m',ty:'c',side:'b',ot:'mkt',q:10,px:''};
const TF={'1m':['h',22,'1 mes',[[20,'#f2c14e','Media 20 días']]],'6m':['h',126,'6 meses',[[20,'#f2c14e','Media 20 días'],[50,'#5aa2f0','Media 50 días']]],'1a':['w',52,'1 año',[[10,'#f2c14e','Media 10 semanas'],[30,'#5aa2f0','Media 30 semanas']]],
  '5a':['m',60,'5 años',[[12,'#f2c14e','Media 12 meses']]],'max':['m',999,'Máx.',[[12,'#f2c14e','Media 12 meses'],[36,'#5aa2f0','Media 36 meses']]]};
const pctC=v=>`<span class="chg ${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v*100).toFixed(2)} %</span>`;
const lvF=v=>v.toLocaleString('es-MX',{maximumFractionDigits:v<100?2:0});
function homeEx(){const n=natOf(P);return (EXN[n.id]||['US'])[0];}
function dBack(tf,k){if(tf==='m'){let m=(G.mk.doy?monthOfDay(Math.min(364,G.mk.doy)):0)-k,y=G.year;while(m<0){m+=12;y--;}return `${MES[m]} ${y}`;}
  const days=tf==='w'?k*7:Math.round(k*365/252);let y=G.year,d=(G.day||0)-days;while(d<0){d+=365;y--;}const m=monthOfDay(Math.min(364,d));return `${d-MCUM[m]+1} ${MES[m].toLowerCase()} ${y}`;}
function spark(arr,w,h){const a=arr.slice(-30);if(a.length<2)return '';const mn=Math.min(...a),mx=Math.max(...a),r=mx-mn||1;const pts=a.map((v,i)=>`${(i/(a.length-1)*w).toFixed(1)},${(h-2-(v-mn)/r*(h-4)).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${a[a.length-1]>=a[0]?'#3ccf8e':'#f0565d'}" stroke-width="1.6"/></svg>`;}
/* ----- gráfica de velas / línea con medias móviles y volumen ----- */
function drawChart(wrap,C,o){const cv=wrap.querySelector('canvas'),tip=wrap.querySelector('.tip');const dpr=Math.min(2,window.devicePixelRatio||1);const W=wrap.clientWidth||320,H=o.vol?250:190;
  cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const padR=58,pH=o.vol?190:H-14,vT=pH+8,vH=H-vT-4;const n=C.length;if(!n){g.fillStyle='#8d98a8';g.font='12px system-ui';g.fillText('Sin datos todavía: avanza el reloj.',10,30);return;}
  const closes=C.map(c=>c.c);const mas=(o.ma||[]).map(([k,col])=>[mkMA(closes,k),col]);
  let lo=Infinity,hi=-Infinity;C.forEach(c=>{lo=Math.min(lo,o.ty==='l'?c.c:c.l);hi=Math.max(hi,o.ty==='l'?c.c:c.h);});mas.forEach(([m])=>m.forEach(v=>{if(v!=null){lo=Math.min(lo,v);hi=Math.max(hi,v);}}));
  const pad=(hi-lo)*.06||hi*.02;lo-=pad;hi+=pad;const X=i=>(i+.5)*(W-padR)/n,Y=v=>6+(hi-v)/(hi-lo)*(pH-12),bw=Math.max(1,(W-padR)/n*.7);
  function base(){g.clearRect(0,0,W,H);g.strokeStyle='#1e2a3a';g.lineWidth=1;g.fillStyle='#8d98a8';g.font='10.5px system-ui';g.textAlign='left';
    for(let k=0;k<=4;k++){const v=lo+(hi-lo)*k/4,y=Y(v);g.beginPath();g.moveTo(0,y);g.lineTo(W-padR,y);g.stroke();g.fillText(o.fp(v),W-padR+4,y+3);}
    if(o.ty==='l'){const up=closes[n-1]>=closes[0];g.beginPath();C.forEach((c,i)=>i?g.lineTo(X(i),Y(c.c)):g.moveTo(X(i),Y(c.c)));g.strokeStyle=up?'#3ccf8e':'#f0565d';g.lineWidth=1.8;g.stroke();
      g.lineTo(X(n-1),pH);g.lineTo(X(0),pH);g.closePath();const gr=g.createLinearGradient(0,0,0,pH);gr.addColorStop(0,up?'rgba(60,207,142,.25)':'rgba(240,86,93,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fill();}
    else C.forEach((c,i)=>{const up=c.c>=c.o,col=up?'#3ccf8e':'#f0565d';g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1;g.beginPath();g.moveTo(X(i),Y(c.h));g.lineTo(X(i),Y(c.l));g.stroke();
      const y1=Y(Math.max(c.o,c.c)),y2=Y(Math.min(c.o,c.c));g.fillRect(X(i)-bw/2,y1,bw,Math.max(1,y2-y1));});
    mas.forEach(([m,col])=>{g.beginPath();let st=false;m.forEach((v,i)=>{if(v==null)return;if(!st){g.moveTo(X(i),Y(v));st=true;}else g.lineTo(X(i),Y(v));});g.strokeStyle=col;g.lineWidth=1.3;g.stroke();});
    if(o.vol){const vm=Math.max(...C.map(c=>c.v))||1;C.forEach((c,i)=>{g.fillStyle=c.c>=c.o?'rgba(60,207,142,.45)':'rgba(240,86,93,.45)';const h=c.v/vm*vH;g.fillRect(X(i)-bw/2,vT+vH-h,bw,h);});
      g.fillStyle='#8d98a8';g.fillText('Volumen',W-padR+4,vT+10);}
    const last=closes[n-1];g.fillStyle='#f2c14e';g.fillRect(W-padR+1,Y(last)-8,padR-2,16);g.fillStyle='#1a1405';g.font='bold 10.5px system-ui';g.fillText(o.fp(last),W-padR+4,Y(last)+4);}
  base();tip.textContent=o.label(C[n-1],n-1);
  const mv=e=>{const r=cv.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;const i=clamp(Math.floor(x/((W-padR)/n)),0,n-1);base();
    g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([3,3]);g.beginPath();g.moveTo(X(i),0);g.lineTo(X(i),H);g.stroke();g.setLineDash([]);tip.textContent=o.label(C[i],i);};
  cv.onpointermove=mv;cv.onpointerdown=mv;cv.onpointerleave=()=>{base();tip.textContent=o.label(C[n-1],n-1);};}
function chartBox(id){return `<div class="cv" id="${id}"><canvas></canvas><div class="tip"></div></div>`;}
function seriesChart(wrap,id,tf,ty,cur,isIx){const [a,n,,ma]=TF[tf];const C=mkCandles(id,a,n);const fp=v=>isIx?lvF(v):fmtPx(v,cur).replace(/\s/g,' ');
  drawChart(wrap,C,{ty,ma,vol:!isIx,fp,label:(c,i)=>`${dBack(a,C.length-1-i)} · A ${fp(c.o)} · M ${fp(c.h)} · m ${fp(c.l)} · C ${fp(c.c)}${isIx?'':' · Vol '+fmtK(c.v)}`});}

/* ----- hoja principal de la Bolsa ----- */
function showMarket(tab){if(!P||!G)return;ensureV13();bkEnsure(P);if(tab)MKV.tab=tab;if(!MKV.ex)MKV.ex=homeEx();const t=MKV.tab;
  const tabs=MKTABS;
  let h=`<h3>📈 Bolsa de valores <small style="color:var(--mut);font-size:12px">${dateStr()}${G.mk.cr?' · <span class="dn">mercados en pánico</span>':''}</small></h3><div class="mkt">${tabs.map(([k,n])=>`<button data-tb="${k}" class="${k===t?'on':''}">${n}</button>`).join('')}</div>`;
  const F=MKTAB_FN[t]||MKTAB_FN.mk;h+=F[0]();
  openSheetRaw(h,b=>{b.querySelectorAll('[data-tb]').forEach(x=>x.onclick=()=>showMarket(x.dataset.tb));F[1](b);});}
const MKTABS=[['mk','Mercados'],['pf','Cartera'],['or','Órdenes'],['fx','Divisas']];const MKTAB_FN={mk:[()=>mkTabHTML(),b=>mkTabBind(b)],pf:[()=>pfTabHTML(),b=>pfTabBind(b)],or:[()=>orTabHTML(),b=>orTabBind(b)],fx:[()=>fxTabHTML(),b=>fxTabBind(b)]};
function mkTabHTML(){const M=G.mk,k=MKV.ex,x=M.X[k],e=EXCH0[k];const cur=x.cur;
  const chips=Object.keys(EXCH0).map(q=>`<button data-ex="${q}" class="${q===k?'on':''}">${flag(EXCH0[q].n,14)} ${EXCH0[q].ix}</button>`).join('');
  const ixRow=(nm,id,s)=>`<div class="ixc" data-ix="${id}"><div class="h"><b>${nm}</b>${pctC(mkChg(id,1))}</div><div class="h"><span class="lv">${lvF(s.lv)}</span><span style="font-size:12px;color:var(--mut)">5 días ${pctC(mkChg(id,5))} · año ${pctC(mkYtd(id))}</span></div></div>`;
  let h=`<div class="chips">${chips}</div><div class="hint" style="margin-top:6px">${e.nm} · precios en ${G.cx[cur].nm} (${cur})${EXCH0[k].n!==natOf(P).id?` · tu moneda: ${cxOf(homeN()).nm}`:''}</div>`;
  h+=ixRow(e.ix,k,x)+chartBox('ixCv')+`<div class="tfs">${Object.keys(TF).map(q=>`<button data-tf="${q}" class="${q===MKV.tf?'on':''}">${TF[q][2]}</button>`).join('')}<button data-ty="1" style="margin-left:auto">${MKV.ty==='c'?'Velas':'Línea'}</button></div>`;
  (e.sub||[]).forEach((s,i)=>h+=ixRow(s[0],k+':'+i,x.sub[i]));
  const L=Object.keys(M.C).filter(id=>M.C[id].x===k&&!M.C[id].dead&&!M.C[id].ix);const FI=Object.keys(M.C).filter(id=>M.C[id].x===k&&M.C[id].ix);
  if(FI.length)h+=`<div class="sect">Fondos indexados</div>`+FI.map(id=>{const c=M.C[id],ps=P.bk.pos[id];return `<button class="stk" data-co="${id}">${gxLogo(c.nm,c.sec,30)}<div class="nm"><b>📊 ${c.nm}</b><span>${id} · replica el índice · dividendo ${c.dy} %${ps?` · tienes ${ps.q.toLocaleString('es-MX')}`:''}</span></div>${spark(c.h,64,26)}<div class="px">${fmtPx(c.p,cur)}<br>${pctC(mkChg(id,1))}</div></button>`;}).join('');
  h+=`<div class="sect">Empresas (${L.length})</div>`+L.map(id=>{const c=M.C[id],ps=P.bk.pos[id];return `<button class="stk" data-co="${id}">${gxLogo(c.nm,c.sec,30)}<div class="nm"><b>${c.pl!=null?'⭐ ':''}${c.nm}</b><span>${id} · ${SECT[c.sec][0]}${ps?` · tienes ${ps.q.toLocaleString('es-MX')}`:''}</span></div>${spark(c.h,64,26)}<div class="px">${fmtPx(c.p,cur)}<br>${pctC(mkChg(id,1))}</div></button>`;}).join('');
  return h+`<div class="hint">Las empresas son ficticias, inspiradas en compañías reales. Los índices y bolsas son reales (niveles aproximados de inicios de 2026). Los precios se mueven por el crecimiento y la inflación del país, las tasas, guerras, recesiones, resultados trimestrales y el ánimo del mercado.</div>`;}
function mkTabBind(b){b.querySelectorAll('[data-ex]').forEach(x=>x.onclick=()=>{MKV.ex=x.dataset.ex;showMarket();});b.querySelectorAll('[data-co]').forEach(x=>x.onclick=()=>showStock(x.dataset.co));
  b.querySelectorAll('[data-tf]').forEach(x=>x.onclick=()=>{MKV.tf=x.dataset.tf;showMarket();});const ty=b.querySelector('[data-ty]');if(ty)ty.onclick=()=>{MKV.ty=MKV.ty==='c'?'l':'c';showMarket();};
  b.querySelectorAll('[data-ix]').forEach(x=>x.onclick=()=>{MKV.ixSel=x.dataset.ix;const w=b.querySelector('#ixCv');seriesChart(w,MKV.ixSel,MKV.tf,MKV.ty,'',true);});
  const w=b.querySelector('#ixCv');const sel=MKV.ixSel&&MKV.ixSel.split(':')[0]===MKV.ex?MKV.ixSel:MKV.ex;requestAnimationFrame(()=>seriesChart(w,sel,MKV.tf,MKV.ty,'',true));}

/* ----- ficha de una empresa: gráfica y operar ----- */
function showStock(id){MKV.id=id;const M=G.mk,c=M.C[id];if(!c)return showMarket('mk');const cur=coCur(id),hc=cxOf(homeN());const b=P.bk,ps=b.pos[id];const e=EXCH0[c.x];
  const y52=c.w.slice(-52).concat(c.h.slice(-5));const hi=Math.max(...y52),lo=Math.min(...y52);const capUSD=c.p*c.sh/fxOf(cur);const avgV=mkCandles(id,'h',20).reduce((s,x)=>s+x.v,0)/20;
  const foreign=cur!==homeN().cur;let h=`<button class="btn" id="bkBack" style="margin-bottom:6px">← ${e.ix}</button><div style="display:flex;gap:10px;align-items:center">${gxLogo(c.nm,c.sec,40)}<h3 style="margin:2px 0">${c.pl!=null?'⭐ ':''}${c.nm} <small style="color:var(--mut);font-size:12px">${id} · ${e.nm}</small></h3></div>
    <div class="ixc"><div class="h"><span class="lv">${fmtPx(c.p,cur)}</span>${pctC(mkChg(id,1))}</div><div class="h" style="font-size:12px;color:var(--mut)"><span>${SECT[c.sec][0]}</span><span>${foreign?'≈ '+fmt(toInt(c.p,cur))+' en tu moneda':''}</span></div></div>`;
  h+=chartBox('stCv')+`<div class="lg2">${TF[MKV.tf][3].map(([k,col,nm])=>`<span><i style="background:${col}"></i>${nm}</span>`).join('')}</div><div class="tfs">${Object.keys(TF).map(q=>`<button data-tf="${q}" class="${q===MKV.tf?'on':''}">${TF[q][2]}</button>`).join('')}<button data-ty="1" style="margin-left:auto">${MKV.ty==='c'?'Velas':'Línea'}</button></div>`;
  const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;
  h+=`<div class="kv">${(c.ix?kv('Replica',c.ix.includes(':')?EXCH0[c.x].sub[+c.ix.split(':')[1]][0]:EXCH0[c.x].ix)+kv('Comisión anual','0.1 %'):kv('Capitalización',fmtN(capUSD))+kv('Precio/utilidad',(c.p/c.eps).toFixed(1)))+kv('Dividendo',c.dy?c.dy.toFixed(1)+' %':'no paga')+(c.ix?'':kv('Beta',c.b.toFixed(2)))+kv('Máx. 52 sem.',fmtPx(hi,cur))+kv('Mín. 52 sem.',fmtPx(lo,cur))+kv('Volumen medio',fmtK(avgV))+kv('Semana / año',`${(mkChg(id,5)*100).toFixed(1)} % / ${(mkYtd(id)*100).toFixed(1)} %`)}</div>`;
  if(ps){const val=Math.abs(ps.q)*c.p,pl=(c.p-ps.c)*ps.q;h+=`<div class="tbox"><b>Tu posición</b>${ps.q<0?' <span class="pill war">en corto</span>':''}${ps.lk>M.t?` <span class="pill">bloqueada ${ps.lk-M.t} días</span>`:''}<div class="kv">${kv('Acciones',ps.q.toLocaleString('es-MX'))+kv('Costo promedio',fmtPx(ps.c,cur))+kv('Valor',fmt(toInt(val,cur)))+kv('Ganancia',`<span class="${pl>=0?'up':'dn'}">${fmt(toInt(pl,cur))} (${((c.p/ps.c-1)*(ps.q<0?-1:1)*100).toFixed(1)} %)</span>`)}</div></div>`;}
  const sides=[['b','Comprar'],['s','Vender'],['ss','Corto'],['bc','Recomprar']];if(!MKV.side||(MKV.side==='bc'&&!(ps&&ps.q<0)))MKV.side='b';
  const canS={b:!(ps&&ps.q<0),s:!!(ps&&ps.q>0),ss:b.mg&&!(ps&&ps.q>0),bc:!!(ps&&ps.q<0)};
  h+=`<div class="tbox"><b>Operar</b><div class="seg" id="sSide">${sides.map(([k,n])=>`<button data-sd="${k}" class="${MKV.side===k?'on'+(k==='s'||k==='ss'?' sell':''):''}" ${canS[k]?'':'disabled'}>${n}</button>`).join('')}</div>
    <div class="seg" id="sOt">${[['mkt','Mercado'],['lim','Límite'],['stop','Stop']].map(([k,n])=>`<button data-ot="${k}" class="${MKV.ot===k?'on':''}">${n}</button>`).join('')}</div>
    <div class="tin"><label>Acciones</label><input id="tQ" type="number" min="1" step="1" inputmode="numeric" value="${MKV.q}"><button id="tMax">Máx.</button></div>
    ${MKV.ot!=='mkt'?`<div class="tin"><label>Precio ${MKV.ot==='lim'?'límite':'stop'}</label><input id="tPx" type="number" step="any" inputmode="decimal" value="${MKV.px||rp(c.p*(MKV.ot==='lim'?(MKV.side==='b'||MKV.side==='bc'?.97:1.03):(MKV.side==='b'||MKV.side==='bc'?1.03:.95)))}"></div>`:''}
    <div class="est" id="tEst"></div><button class="btn gold" id="tGo" style="width:100%">Enviar orden</button>
    <div class="hint" style="margin-top:6px">${MKV.ot==='lim'?'Límite: se ejecuta solo si el precio llega a tu nivel o mejor.':MKV.ot==='stop'?'Stop: se dispara al tocar tu nivel (para cortar pérdidas o entrar en una ruptura). Puede ejecutarse peor si el precio abre con salto.':'Mercado: se ejecuta ya, al precio actual.'} Comisión 0.1 % (mínimo US$1)${foreign?' + 0.25 % por cambio de moneda':''}.${b.mg?'':' Para vender en corto activa la cuenta de margen en Cartera.'}</div></div>`;
  openSheetRaw(h,B=>{B.querySelector('#bkBack').onclick=()=>{MKV.ex=c.x;showMarket('mk');};
    B.querySelectorAll('[data-tf]').forEach(x=>x.onclick=()=>{MKV.tf=x.dataset.tf;showStock(id);});B.querySelector('[data-ty]').onclick=()=>{MKV.ty=MKV.ty==='c'?'l':'c';showStock(id);};
    B.querySelectorAll('[data-sd]').forEach(x=>x.onclick=()=>{MKV.side=x.dataset.sd;MKV.px='';showStock(id);});B.querySelectorAll('[data-ot]').forEach(x=>x.onclick=()=>{MKV.ot=x.dataset.ot;MKV.px='';showStock(id);});
    const qI=B.querySelector('#tQ'),pI=B.querySelector('#tPx');const est=()=>{const q=Math.max(0,Math.floor(+qI.value||0));MKV.q=q;if(pI)MKV.px=pI.value;const px=pI?(+pI.value||c.p):c.p;const g=toInt(q*px,cur);
      B.querySelector('#tEst').innerHTML=`${q.toLocaleString('es-MX')} × ${fmtPx(px,cur)} = <b>${fmt(g)}</b> + comisión ${fmt(q?bkFee(id,g):0)} · tienes ${fmt(P.dinero)}${b.mg?` · capital de margen ${fmt(Math.max(0,bkVals().E))}`:''}`;};
    qI.oninput=est;if(pI)pI.oninput=est;est();
    B.querySelector('#tMax').onclick=()=>{const px=pI?(+pI.value||c.p):c.p;let q=0;if(MKV.side==='s')q=ps&&ps.q>0?ps.q:0;else if(MKV.side==='bc')q=ps&&ps.q<0?-ps.q:0;
      else{const V=bkVals();const room=b.mg?Math.max(0,2*V.E-(V.L+V.S)):Math.max(0,P.dinero);q=Math.floor(room/(toInt(px,cur)*1.0035));}qI.value=q;est();};
    requestAnimationFrame(()=>seriesChart(B.querySelector('#stCv'),id,MKV.tf,MKV.ty,cur,false));
    B.querySelector('#tGo').onclick=()=>{const q=Math.floor(+qI.value||0);if(q<=0){toast('📈 Bolsa','Escribe cuántas acciones.');return;}const r=bkTrade(id,MKV.side,q,MKV.ot,pI?+pI.value:null);
      if(r.err){toast('⚠️ Orden rechazada',r.err);return;}log('📈 '+r.ok,'good');sfx('coin');fix(P);save();render();MKV.px='';showStock(id);toast('📈 Listo',r.ok);};});}

/* ----- cartera ----- */
function pfTabHTML(){const b=P.bk,M=G.mk,V=bkVals();const ids=Object.keys(b.pos);const req=.25*V.L+.3*V.S;
  const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;let tot=0;ids.forEach(id=>{const ps=b.pos[id],c=M.C[id];tot+=toInt((c.p-ps.c)*ps.q,coCur(id));});
  let h=`<div class="kv">${kv('Efectivo',fmt(P.dinero))+kv('Acciones (largo)',fmt(V.L))+kv('Cortos',fmt(V.S))+kv('Préstamo de margen',fmt(b.loan))+kv('Capital',fmt(V.E))+kv('Ganancia abierta',`<span class="${tot>=0?'up':'dn'}">${fmt(tot)}</span>`)+(b.mg?kv('Mantenimiento',fmt(req)):'')+(b.mg?kv('Poder de compra',fmt(Math.max(0,2*V.E-(V.L+V.S)))):'')}</div>`;
  h+=`<div class="mpb"><button id="pfMg" class="${b.mg?'on':''}">${b.mg?'✓ Cuenta de margen activa':'Activar cuenta de margen'}</button>${b.loan>0?`<button id="pfPay" ${P.dinero>0?'':'disabled'}>Pagar préstamo (${fmt(Math.min(b.loan,Math.max(0,P.dinero)))})</button>`:''}</div>
    <div class="hint">Margen: el corredor te presta hasta la mitad de lo que compras (interés: tasa ${cbDe(homeN().cur)} + 3 puntos) y te permite vender en corto. Si tu capital cae por debajo del 25 % de tus acciones (30 % en cortos), te vende posiciones automáticamente (llamada de margen).</div>`;
  h+=`<div class="sect">Posiciones (${ids.length})</div>`+(ids.length?ids.map(id=>{const ps=b.pos[id],c=M.C[id],cur=coCur(id);const v=toInt(Math.abs(ps.q)*c.p,cur),pl=toInt((c.p-ps.c)*ps.q,cur);
    return `<button class="stk" data-co="${id}">${gxLogo(c.nm,c.sec,30)}<div class="nm"><b>${c.pl!=null?'⭐ ':''}${c.nm}${ps.q<0?' (corto)':''}</b><span>${ps.q.toLocaleString('es-MX')} acc. · costo ${fmtPx(ps.c,cur)} · ${fmtPx(c.p,cur)}</span></div><div class="px">${fmt(v)}<br><span class="chg ${pl>=0?'up':'dn'}">${pl>=0?'+':''}${fmt(pl)}</span></div></button>`;}).join(''):'<div class="hint">Aún no tienes acciones. Elige una empresa en Mercados.</div>');
  const I=P.biz&&!P.biz.pub?ipoInfo(P):null;
  if(I){h+=`<div class="sect">Salida a bolsa (OPI) de tu negocio</div><div class="tbox"><b>${BIZT[P.biz.t||0].ic} ${BIZT[P.biz.t||0].n}</b><div class="hint">Valor estimado: <b>${fmt(I.val)}</b> (${I.pe.toFixed(1)} veces la utilidad anual) · cotizaría en ${EXCH0[I.ex].nm}.<br>
    ${I.ok?'Vendes una parte al público y cobras ya; conservas el resto (bloqueo de 6 meses). Desde entonces solo te quedas con tu parte de las utilidades, y el precio de la acción seguirá a tus resultados.':'Requisitos: negocio de nivel 3 o más (empresa grande) con utilidades el último año y tener 18 años.'}</div>
    ${I.ok?`<div class="mpb">${[.2,.3,.4].map(f=>`<button data-ipo="${f}">Vender ${f*100} % → ${fmt(I.val*f*.93)}</button>`).join('')}</div>`:''}</div>`;}
  if(P.biz&&P.biz.pub)h+=`<div class="hint">⭐ Tu empresa cotiza en bolsa: tienes ${Math.round((P.biz.own||0)*100)} % de las acciones.</div>`;
  return h;}
function pfTabBind(b){b.querySelectorAll('[data-co]').forEach(x=>x.onclick=()=>showStock(x.dataset.co));
  b.querySelector('#pfMg').onclick=()=>{const k=P.bk;if(k.mg){const V=bkVals();if(k.loan>0||V.S>0){toast('⚠️ Margen','Primero paga el préstamo y cierra tus cortos.');return;}k.mg=false;}else{if(P.age<21){toast('⚠️ Margen','El corredor exige 21 años para una cuenta de margen.');return;}k.mg=true;log('Abres una cuenta de margen en tu casa de bolsa.');}save();showMarket('pf');};
  const pay=b.querySelector('#pfPay');if(pay)pay.onclick=()=>{const a=Math.min(P.bk.loan,Math.max(0,P.dinero));P.dinero-=a;P.bk.loan-=a;log(`Pagas ${fmt(a)} de tu préstamo de margen.`);save();render();showMarket('pf');};
  b.querySelectorAll('[data-ipo]').forEach(x=>x.onclick=()=>{const r=ipoDo(+x.dataset.ipo);log(r,'big');sfx('coin');save();render();showMarket('pf');toast('🔔 Salida a bolsa',r);});}
/* ----- órdenes ----- */
function orTabHTML(){const b=P.bk,M=G.mk;const sd={b:'Comprar',s:'Vender',ss:'Corto',bc:'Recomprar'};
  let h=`<div class="sect">Órdenes abiertas</div>`+(b.ord.length?b.ord.map((o,i)=>{const c=M.C[o.id];return `<div class="stk"><div class="nm"><b>${sd[o.s]} ${o.q.toLocaleString('es-MX')} · ${c?c.nm:o.id}</b><span>${o.ty==='lim'?'Límite':'Stop'} a ${fmtPx(o.px,coCur(o.id))} · actual ${c?fmtPx(c.p,coCur(o.id)):'—'} · vence en ${Math.max(0,90-(M.t-o.t0))} días</span></div><button class="btn" data-cx="${i}">Cancelar</button></div>`;}).join(''):'<div class="hint">No tienes órdenes pendientes.</div>');
  h+=`<div class="sect">Últimas operaciones</div>`+(b.tr.length?`<table class="tbl"><tr><th>Fecha</th><th>Operación</th><th>Acciones</th><th>Precio</th></tr>${b.tr.slice(0,20).map(t=>{const m=monthOfDay(Math.min(364,t.d||0));return `<tr><td>${(t.d||0)-MCUM[m]+1} ${MES[m].toLowerCase()} ${t.y}</td><td>${sd[t.s]} ${M.C[t.id]?M.C[t.id].nm:t.id}</td><td>${t.q.toLocaleString('es-MX')}</td><td>${M.C[t.id]?fmtPx(t.px,coCur(t.id)):rp(t.px)}</td></tr>`;}).join('')}</table>`:'<div class="hint">Sin operaciones todavía.</div>');
  return h;}
function orTabBind(b){b.querySelectorAll('[data-cx]').forEach(x=>x.onclick=()=>{P.bk.ord.splice(+x.dataset.cx,1);save();showMarket('or');});}
/* ----- monedas ----- */
const FXL=['USD','EUR','GBP','JPY','CNY','CAD','CHF','MXN','BRL','ARS','CLP','COP','INR','KRW','RUB','TRY','ZAR','NGN','EGP'];
function fxChg(c,m){const x=G.cx[c];if(c==='USD')return 0;const h=x.h;if(h.length<2)return 0;return h[h.length-1]/h[Math.max(0,h.length-1-m)]-1;}
function regTxt(x){return x.reg==='flot'?'flotación libre':x.reg==='adm'?'flotación administrada':x.reg==='fijo'?`fijo contra ${elC(G.cx[x.anc].nm)} (${rp(x.peg)})`:x.reg==='caja'?`caja de conversión (${G.cx[x.anc].nm})`:x.reg;}
function curCardHTML(n){const x=cxOf(n),c=n.cur;const real=isReal();const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;const shared=cxMembers(c).length>1;
  return `<div class="tbox"><b>${x.sym} ${x.nm} (${c})</b>${shared?` <span class="pill">moneda compartida</span>`:''}<div class="kv">${kv('1 dólar =',c==='USD'?'1':fmtPx(x.fx,c))+kv('Cambio 12 meses',c==='USD'?'—':`<span class="${fxChg(c,12)>0?'dn':'up'}">${fxChg(c,12)>0?'se deprecia ':'se aprecia '}${Math.abs(fxChg(c,12)*100).toFixed(1)} %</span>`)+
    kv('Régimen',regTxt(x))+kv('Tasa de referencia',x.pr.toFixed(2)+' %')+kv('Inflación',real?pct(n.infl):'— (Rápido)')+kv('Banco central',(x.iss===n.id?(n.cbA?'autónomo':'bajo control del gobierno'):cbName(c)))+
    kv('Impresión de dinero',mpLabel(n.mpr||0))+kv('Controles de capital',n.cc?'sí':'no')+(x.mis!=null&&x.anc?kv('Desvío del tipo fijo',`${x.mis>0?'sobrevaluada':'subvaluada'} ${Math.abs(x.mis*100).toFixed(0)} %`):'')}</div>
    ${x.rd.length?`<div class="hint">Reformas: ${x.rd.map(r=>`${r.y}: quita ${r.z} ceros (antes ${r.a})`).join(' · ')}</div>`:''}</div>`;}
function fxTabHTML(){const n=homeN();let h=`<div class="sect">Tu moneda</div>`+curCardHTML(n)+chartBox('fxCv')+`<div class="hint">Unidades de ${cxOf(n).nm} por dólar, cierre de cada mes. Sube = tu moneda se debilita.</div>`;
  const L=[...new Set([n.cur].concat(FXL))].filter(c=>G.cx[c]&&!G.cx[c].dead);
  h+=`<div class="sect">Divisas del mundo</div><table class="tbl"><tr><th>Moneda</th><th>Por dólar</th><th>1 mes</th><th>12 meses</th><th>Tasa</th></tr>${L.map(c=>{const x=G.cx[c];const a=fxChg(c,1),b=fxChg(c,12);
    return `<tr><td>${c} <span style="color:var(--mut);font-size:11px">${x.nm}</span></td><td>${c==='USD'?'1':lvF(x.fx)}</td><td class="${a>0?'dn':'up'}">${c==='USD'?'—':(a*100).toFixed(1)+' %'}</td><td class="${b>0?'dn':'up'}">${c==='USD'?'—':(b*100).toFixed(1)+' %'}</td><td>${x.pr.toFixed(2)} %</td></tr>`;}).join('')}</table>
    <div class="hint">El tipo de cambio sigue la paridad de poder de compra (inflación de cada país contra la de EE. UU.) más un desvío que mueven las tasas de interés, la impresión de dinero, guerras, sanciones, golpes de Estado y crisis. Los tipos fijos pueden romperse con un ataque especulativo.</div>`;
  return h;}
function fxTabBind(b){const n=homeN(),x=cxOf(n);const w=b.querySelector('#fxCv');const h=x.h.length?x.h:[x.fx];const C=h.map((v,i)=>({o:i?h[i-1]:v,h:v,l:v,c:v,v:0}));
  requestAnimationFrame(()=>drawChart(w,C,{ty:'l',fp:v=>lvF(v),label:(c,i)=>`${dBack('m',C.length-1-i)} · ${lvF(c.c)} ${n.cur} por dólar`}));}

/* ----- moneda y banco central en la vista País (Economía) ----- */
function mpHTML(n){const x=cxOf(n);const busy=!P.ruler||blockedTurn();const act=P.ruler&&P.nat>0&&!busy;let h=`<div class="sect">💱 Moneda y banco central</div>`+curCardHTML(n)+chartBox('mpCv');
  if(!P.ruler)return h+`<div class="hint">La política monetaria la deciden el gobierno y ${cbName(n.cur)}.</div>`;
  const iss=mpIssuer(n),A=(k,t,s,ok)=>`<button class="mpa" data-mp="${k}" ${ok?'':'disabled'}><b>${t}</b><span>${s}</span></button>`;
  if(iss){h+=`<div class="mpb"><button data-mp="auto" class="${n.cbA?'on':''}">${n.cbA?'✓ Banco central autónomo':'Devolver la autonomía al banco central'}</button>${n.cbA?'<button data-mp="ctl">Tomar el control de la tasa</button>':''}</div>`;
    if(!n.cbA&&x.reg!=='fijo'&&x.reg!=='caja')h+=`<div class="hint">Tasa de referencia: <b>${x.pr.toFixed(2)} %</b> · <span>inflación ${isReal()?pct(n.infl):'—'}.</span> <span>Una tasa real (tasa − inflación) cerca de 1 % es neutral.</span></div><div class="mpb">${[-1,-.25,.25,1].map(d=>`<button data-rt="${d}">${d>0?'+':''}${d}</button>`).join('')}</div>`;
    else if(n.cbA)h+=`<div class="hint">El banco central sube la tasa cuando la inflación pasa de su meta y la baja cuando la economía se enfría (regla de Taylor).</div>`;}
  else h+=`<div class="hint">Usas una moneda que no emites: la tasa la fija ${cbName(n.cur)}.</div>`;
  h+=`<div class="hint">Las reformas usan una acción de gobierno (te quedan ${P.nat}).</div>`;
  if(iss){const R=[['flot','Dejar flotar la moneda','El mercado fija el precio y absorbe los choques; tú conservas la tasa.'],['adm','Flotación administrada','El banco central suaviza los movimientos.'],['fijo:USD','Fijar al dólar',REF_HIST.fijo],['fijo:EUR','Fijar al euro (MTC II, paso previo al euro)','Dos años fijo al euro es un requisito para entrar a la zona euro.'],['caja:USD','Caja de conversión al dólar','Cada billete respaldado por dólares: muy creíble, pero sin política monetaria. Requiere un tesoro del 5 % del PIB.']];
    h+=R.filter(([k])=>{const [r,a]=k.split(':');return !(x.reg===r&&(x.anc||null)===(a||null));}).map(([k,t,s])=>A('rg:'+k,t,s,act)).join('');
    h+=`<div class="hint" style="margin-top:8px">Imprimir dinero para el gobierno (señoreaje): ${REF_HIST.print}</div><div class="mpb">${[0,1,3,6,10].map(v=>`<button data-pr="${v}" class="${(n.mpr||0)===v?'on':''}" ${busy?'disabled':''}>${v?v+' % del PIB':'No imprimir'}</button>`).join('')}</div>`;
    if(x.fx>=1000){const z=Math.floor(Math.log10(x.fx))-1;h+=A('rd:3','Quitar tres ceros a la moneda',`1 nuevo = 1,000 antiguos. ${REF_HIST.redenom}`,act);if(z>3)h+=A('rd:'+z,`Quitar ${z} ceros`,`Deja el dólar en ~${lvF(x.fx/Math.pow(10,z))} unidades.`,act);}
    if(isReal()&&n.infl>=40)h+=A('stab','Plan de estabilización con nueva moneda','Fin de la emisión, banco central autónomo, tasa +8 y, si hace falta, quitar ceros. Funciona como el Plan Real de Brasil (1994): baja la inflación en 3 años a costa de una recesión.',act);}
  if(n.cur!=='USD')h+=A('usd','Dolarizar la economía',REF_HIST.usd,act);
  if(EU_IN.includes(n.id)&&n.cur!=='EUR'){const L=euroWhy(n),ok=L.every(q=>q[0]);h+=A('eur','Adoptar el euro',(ok?'Cumples los criterios. ':'Criterios: ')+REF_HIST.eur,act&&ok)+`<div class="hint">${L.map(([o,t])=>`<div class="crit">${o?'✅':'❌'} ${t}</div>`).join('')}</div>`;}
  if(!iss&&n.id!=='USA')h+=A('exit',FEM_RX.test(x.nm)?`Salir de la ${x.nm} y crear moneda propia`:`Salir del ${x.nm} y crear moneda propia`,'Recuperas tasa y tipo de cambio, pero la transición provoca fuga de capitales, recesión y una devaluación inicial.',act);
  h+=A('cc',n.cc?'Levantar los controles de capital':'Imponer controles de capital',n.cc?'Más inversión y crecimiento; vuelves a quedar expuesto a fugas de capital.':'Frena fugas y ataques especulativos, pero resta crecimiento y prohíbe comprar acciones extranjeras (como el “cepo” argentino).',act);
  return h;}
function mpBind(b,n){const w=b.querySelector('#mpCv');if(w){const x=cxOf(n);const h=x.h.length?x.h:[x.fx];const C=h.map((v,i)=>({o:i?h[i-1]:v,h:v,l:v,c:v,v:0}));requestAnimationFrame(()=>drawChart(w,C,{ty:'l',fp:v=>lvF(v),label:(c,i)=>`${dBack('m',C.length-1-i)} · ${lvF(c.c)} ${n.cur} por dólar`}));}
  const again=()=>{save();render();if(VIEW.v==='pa'&&VIEW.tab==='eco')renderView();else showEconomy();};
  const nat=(t,fn,vote)=>{useNat({t,vote,fn});again();};
  b.querySelectorAll('[data-mp]').forEach(el=>el.onclick=()=>{const k=el.dataset.mp;
    if(k==='auto'){if(!n.cbA)log(mpAuto(n,true),'good');again();return;}if(k==='ctl'){log(mpAuto(n,false),'bad');again();return;}
    if(k.startsWith('rg:')){const [,r,a]=k.split(':');nat('Cambiar el régimen cambiario',()=>mpRegime(n,r,a));return;}
    if(k.startsWith('rd:')){const z=+k.slice(3);askText(`Nombre de la moneda nueva (borra para conservar “${cxOf(n).nm}”)`,nuevoC(cxOf(n).nm),nm=>nat('Quitar ceros a la moneda',()=>mpRedenom(n,z,nm||null)),'Quitar ceros');return;}
    if(k==='stab'){nat('Plan de estabilización',()=>mpStabilize(n),1);return;}
    if(k==='usd'){askText('¿Dolarizar? Es muy difícil de revertir.',null,()=>nat('Dolarizar la economía',()=>mpAdopt(n,'USD'),1),'Dolarizar');return;}
    if(k==='eur'){nat('Adoptar el euro',()=>mpAdopt(n,'EUR'),1);return;}
    if(k==='exit'){const oc=OLD_CUR[n.id];askText('¿Cómo se llamará tu moneda?',oc?oc[2]:'peso '+n.name.toLowerCase(),nm=>nat('Crear moneda propia',()=>mpExit(n,nm||null,oc?oc[1]:null),1),'Crear moneda');return;}
    if(k==='cc'){nat(n.cc?'Levantar controles de capital':'Imponer controles de capital',()=>mpCC(n,!n.cc));return;}});
  b.querySelectorAll('[data-rt]').forEach(el=>el.onclick=()=>{log(mpRate(n,+el.dataset.rt));again();});
  b.querySelectorAll('[data-pr]').forEach(el=>el.onclick=()=>{log(mpPrint(n,+el.dataset.pr),+el.dataset.pr?'bad':'');again();});}
function askText(title,def,cb,ok){showModal(`<h2>${title}</h2>${def!=null?`<input id="akT" maxlength="30" value="${clean(def)}" style="width:100%;margin:8px 0;padding:10px;border-radius:10px;border:1px solid #334155;background:#0b1118;color:var(--ink);font:inherit">`:''}<div style="display:flex;gap:8px;margin-top:10px"><button class="btn" id="akN" style="flex:1">Cancelar</button><button class="btn gold" id="akY" style="flex:1">${ok||'Aceptar'}</button></div>`,m=>{
  m.querySelector('#akN').onclick=()=>hideModal();m.querySelector('#akY').onclick=()=>{const i=m.querySelector('#akT');hideModal();cb(i?clean(i.value).slice(0,30):'');};});}
function withAppend(extra,bindX,fn){const o=openSheet;openSheet=function(h,bd){openSheet=o;o(h+extra,el=>{if(bd)bd(el);bindX(el);});};try{fn();}finally{openSheet=o;}}
{const _se=showEconomy;showEconomy=function(){if(!P||!G){_se();return;}ensureV13();const n=natOf(P);withAppend(mpHTML(n),b=>mpBind(b,n),_se);};}

/* ----- columna de Bolsa en el portal de noticias ----- */
function mkColumnHTML(formal){const M=G.mk,home=homeN();const xs=[...new Set([homeEx(),'US','UK','DE','JP','CN','BR','IN'])];
  let h=`<div class="nwh"><div style="font-size:26px">📈</div><div class="mast">${formal?'Mercados y finanzas':'La columna de la Bolsa'}<small>Cierre del ${dateStr()}</small></div></div>`;
  h+=`<table class="tbl"><tr><th>Índice</th><th>Nivel</th><th>Día</th><th>Semana</th><th>Año</th></tr>${xs.map(k=>`<tr><td>${flag(EXCH0[k].n,13)} ${EXCH0[k].ix}</td><td>${lvF(M.X[k].lv)}</td><td>${pctC(mkChg(k,1))}</td><td>${pctC(mkChg(k,5))}</td><td>${pctC(mkYtd(k))}</td></tr>`).join('')}</table>`;
  const evi=e=>`<div class="nwi"><div class="cat" style="background:${e.k==='e'?'#5aa2f0':NEG_RX.test(e.t)||/cae|devalú|pánico|quiebra/.test(e.t)?'#f0565d':'#3ccf8e'}"></div><div class="tx"><div class="dt">${nwDate(e)}</div>${e.t}</div></div>`;
  const ev=M.ev.filter(e=>e.k!=='e').slice(-8).reverse(),er=M.ev.filter(e=>e.k==='e').slice(-5).reverse();
  h+=`<div class="sect">Lo que movió a los mercados</div>`+(ev.length?ev.map(evi).join(''):'<div class="hint">Sin sobresaltos: los precios siguieron al crecimiento, la inflación y las tasas de cada país.</div>');
  if(er.length)h+=`<div class="sect">Resultados de empresas</div>`+er.map(evi).join('');
  const all=Object.keys(M.C).filter(id=>!M.C[id].dead).map(id=>[id,mkChg(id,5)]).sort((a,b)=>b[1]-a[1]);
  const row=([id,v])=>`<tr><td>${M.C[id].nm} <span style="color:var(--mut);font-size:11px">${EXCH0[M.C[id].x].ix}</span></td><td>${pctC(v)}</td></tr>`;
  h+=`<div class="sect">Las que más subieron en la semana</div><table class="tbl">${all.slice(0,5).map(row).join('')}</table><div class="sect">Las que más cayeron</div><table class="tbl">${all.slice(-5).reverse().map(row).join('')}</table>`;
  const cs=[...new Set([home.cur,'USD','EUR'])];h+=`<div class="sect">Tasas y divisas</div><table class="tbl"><tr><th>Moneda</th><th>Por dólar</th><th>Mes</th><th>Tasa</th></tr>${cs.map(c=>{const x=G.cx[c];const a=fxChg(c,1);return `<tr><td>${x.nm} <span style="color:var(--mut);font-size:11px">${cbName(c)}</span></td><td>${c==='USD'?'1':lvF(x.fx)}</td><td class="${a>0?'dn':'up'}">${c==='USD'?'—':(a*100).toFixed(1)+' %'}</td><td>${x.pr.toFixed(2)} %</td></tr>`;}).join('')}</table>`;
  return h+`<button class="btn gold" id="nwMk" style="width:100%;margin-top:10px">Abrir la Bolsa</button>`;}
{const _sn=showNews;showNews=function(tab){if(!P||!G)return;ensureV13();const formal=VIEW.v==='pa';
  if(tab==='mk'){_sn(formal?'int':'reg');const b=$('sheetIn');const nwt=b.querySelector('.nwt');const tabsH=nwt?nwt.outerHTML:'';
    b.innerHTML=`<div class="${formal?'formal':''}">${tabsH}${mkColumnHTML(formal)}</div>`;b.querySelectorAll('.nwt [data-t]').forEach(x=>{x.classList.toggle('on',x.dataset.t==='mk');x.onclick=()=>showNews(x.dataset.t);});
    const nt=b.querySelector('.nwt');if(nt&&!nt.querySelector('[data-t="mk"]')){const x=document.createElement('button');x.dataset.t='mk';x.className='on';x.textContent='Bolsa';nt.appendChild(x);}
    b.querySelector('#nwMk').onclick=()=>showMarket('mk');return;}
  _sn(tab);const nt=$('sheetIn').querySelector('.nwt');if(nt&&!nt.querySelector('[data-t="mk"]')){const x=document.createElement('button');x.dataset.t='mk';x.textContent='Bolsa';x.onclick=()=>showNews('mk');nt.appendChild(x);}};}

/* ----- integración: Más, Ajustes, Finanzas, Bienes, dinero arriba ----- */
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');const first=b.querySelector('.item');
  const mk=(t,s,fn)=>{const x=document.createElement('button');x.className='item';x.innerHTML=`<span><div class="t">${t}</div><div class="s">${s}</div></span>`;x.onclick=fn;return x;};
  const a=mk('📈 Bolsa de valores','32 bolsas reales, velas, órdenes, cortos y margen',()=>showMarket('mk')),c=mk('💱 Monedas','Tu moneda, tipos de cambio y bancos centrales',()=>showMarket('fx'));
  if(first){b.insertBefore(a,first);b.insertBefore(c,first);}else b.append(a,c);};})();
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');const x=document.createElement('button');x.className='item';
  x.innerHTML=`<span><div class="t">Mostrar mi dinero en: ${CURV==='usd'?'dólares (US$)':'la moneda de mi país'}</div><div class="s">El PIB y el tesoro siempre se muestran en dólares de 2026</div></span>`;
  x.onclick=()=>{CURV=CURV==='usd'?'loc':'usd';CFG.curv=CURV;saveCfg();render();showSettings();};b.appendChild(x);};}
{const _sf=showFinance;showFinance=function(){_sf();if(!G||!G.cx)return;const n=homeN(),x=cxOf(n);const b=$('sheetIn');const d=document.createElement('div');
  d.innerHTML=`<div class="hint"><span>💱 Tu dinero está en ${x.nm} (${n.cur}): 1 dólar = ${n.cur==='USD'?'1':fmtPx(x.fx,n.cur)}.</span> <span>Tasa ${cbDe(n.cur)}: ${x.pr.toFixed(2)} %.</span>${P.bk&&Object.keys(P.bk.pos).length?` <span>Cuenta de bolsa: ${fmt(bkVals().L-bkVals().S-P.bk.loan)} en acciones netas.</span>`:''}</div><button class="item" id="fnMk"><span><div class="t">📈 Bolsa de valores</div><div class="s">Compra y vende acciones de 32 bolsas del mundo</div></span></button>`;
  const h3=b.querySelector('h3');if(h3)h3.after(d);else b.prepend(d);d.querySelector('#fnMk').onclick=()=>showMarket('mk');};}
{const _sa=showAssets;showAssets=function(){_sa();const b=$('sheetIn');if(P.biz&&P.biz.pub){b.querySelectorAll('.item').forEach(el=>{const t=el.querySelector('.t');if(t&&/^Vender el negocio/.test(t.textContent)){el.disabled=true;const s=el.querySelector('.s');if(s)s.textContent='Tu empresa cotiza en bolsa: vende tus acciones desde 📈 Bolsa → Cartera.';}});}
  else if(P.biz&&ipoInfo(P)){const I=ipoInfo(P);const x=document.createElement('button');x.className='item';x.disabled=!I.ok;x.innerHTML=`<span><div class="t">🔔 Sacar tu negocio a la bolsa</div><div class="s">${I.ok?`Vale ~${fmt(I.val)}: vende una parte al público`:'Disponible cuando tu negocio sea empresa grande (nivel 3)'}</div></span>`;x.onclick=()=>showMarket('pf');b.appendChild(x);}};}
{const _r=render;render=function(){if(G&&P)try{ensureV13();curSync(P);}catch(e){}_r();try{const m=$('pMoney');if(!m)return;let el=$('pCur');if(!el){el=document.createElement('div');el.id='pCur';m.after(el);}
  const n=G.nations[P._cur]||natOf(P);el.textContent=CURV==='usd'?'US$':n.cur;el.title=CURV==='usd'?'dólares':cxOf(n).nm;}catch(e){}};}
/* ----- guía: tema nuevo ----- */
GUIA.splice(3,0,['📈 Bolsa, monedas y banco central',`<b>Bolsa (Más → 📈 Bolsa de valores):</b> 32 bolsas reales con sus índices (S&P 500, IPC, Ibovespa, DAX, Nikkei…) y más de 100 empresas ficticias inspiradas en compañías reales. Los precios avanzan día a día con el reloj; al saltar años, lo lejano se simula por semanas y los últimos seis meses día por día.<ul>
<li><b>Por qué se mueven:</b> crecimiento e inflación del país, tasas del banco central, guerras, recesiones, sanciones, golpes de Estado, crisis cambiarias, resultados trimestrales de cada empresa y el ánimo del mercado (si las valuaciones se inflan, sube el riesgo de un crac).</li>
<li><b>Gráficas:</b> velas o línea de 1 mes a 20 años, medias móviles y volumen. Toca la gráfica para ver apertura, máximo, mínimo y cierre.</li>
<li><b>Órdenes:</b> a mercado, límite (precio máximo de compra o mínimo de venta) y stop (para cortar pérdidas). Vencen en 90 días de bolsa. Comisión 0.1 % (+0.25 % si cambias de moneda).</li>
<li><b>Margen y cortos:</b> con cuenta de margen (21 años) te prestan hasta la mitad de lo que compras y puedes vender en corto. Si tu capital cae del 25 % (30 % en cortos), hay llamada de margen y el corredor vende por ti.</li>
<li><b>Dividendos e impuestos:</b> los dividendos se cobran cada trimestre; en Realista pagas impuesto a las ganancias de bolsa según tu país (México 10 %, EE. UU. 15 %, Suiza 0 %…).</li>
<li><b>Salida a bolsa:</b> si tu negocio es empresa grande con utilidades, puedes vender 20–40 % al público (Bienes o Bolsa → Cartera). Su precio sigue a tus resultados; desde entonces solo cobras tu parte de las utilidades.</li></ul>
<b>Monedas:</b> tu dinero está en la moneda de tu país (Ajustes permite verlo en dólares). El tipo de cambio sigue la inflación de cada país frente a la de EE. UU. más un desvío que mueven tasas, impresión de dinero y crisis. Al emigrar o si tu país es anexado, tus ahorros se convierten al tipo del día. Los tipos fijos pueden sufrir ataques especulativos; las monedas con mucha inflación acaban quitando ceros o cambiando de nombre (Irán tiene programado quitar cuatro ceros en 2028).<br>
<b>Si gobiernas (País → Economía):</b> banco central autónomo o bajo tu control, tasa de referencia, régimen cambiario (flotar, fijo, caja de conversión), imprimir dinero, quitar ceros, plan de estabilización, dolarizar, adoptar el euro (si eres de la UE y cumples los criterios), salir de una unión monetaria y controles de capital.`]);
