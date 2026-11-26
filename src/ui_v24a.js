/* ===================== v2.4a: fase 6 de la ruta 9d (logística), parte 1 — interfaz =====================
   - Capa «🚢 Envíos» en el mapa: puntos pequeños que avanzan por la ruta (terrestre, marítima o aérea) con el color del transportista,
     dibujados en un lienzo propio (#lgc) encima del mapa y debajo de las etiquetas, sin librerías. WebGL: ~22 cuadros por segundo,
     hasta 80 puntos, solo mientras el mapa se ve; modo ligero: imagen fija (hasta 20 puntos, sin animación). Se apaga con el botón 🚢
     de la burbuja de capas (CFG.lgv = 0). Las rutas marítimas se trazan una vez (campo de distancias sobre una rejilla de agua de 4 px sacada del
     mapa de identificadores, con los canales de Suez y Panamá y los estrechos del Bósforo y Bab el-Mandeb abiertos a mano).
   - 🚚 Logística: pantalla con la red de tu país (eficiencia, flete de las importaciones, envíos y retrasos) y los transportistas
     (los de la IA, los de la bolsa y los tuyos). Botones en Mis empresas y en País → Economía.
   - Ficha de tu empresa de transporte: flota, rutas (tomar o dejar), costo operativo y envíos del año; en cualquier empresa con
     insumos importados, el flete que pagan. Ficha de bolsa de los transportistas que cotizan: su red.
   Textos solo en español (traducción pendiente, ver CONTEXTO_IA.md). */

Object.assign(SH_CL,{nlog:'Flete de las importaciones'});
(function(){const st=document.createElement('style');st.id='st24a';st.textContent=`
#lgc{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block}
.mmodes button.lgt{opacity:.55}.mmodes button.lgt.lgon{opacity:1;border-color:var(--teal);box-shadow:inset 0 -2px 0 var(--teal)}
.lgrt{display:flex;align-items:center;gap:8px}.lgrt .t{font-size:13.5px}.lgrt .s{font-size:12px;color:var(--mut)}
.lgrt.mine{border-color:var(--gold)}.lgdot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;vertical-align:0;box-shadow:0 0 0 1px rgba(0,0,0,.5)}
.lgev{font-size:12.5px;color:var(--mut);padding:3px 0;border-bottom:1px solid var(--line)}.lgev:last-child{border-bottom:none}
.lgev b.dn{color:var(--red)}.lgev b.wn{color:#f08a4b}`;document.head.appendChild(st);})();

/* ---------- textos comunes ---------- */
const lgRtName=f=>`${RG[f.a].nm} → ${RG[f.b].nm}`;
const lgPct=v=>(v*100).toFixed(1)+' %';
function lgCName(id){if(!id)return '—';if(id[0]==='P'&&P){const b=bzList(P).find(z=>z.lg&&z.lg.id===id);return b?clean(b.n):'—';}const a=LGA[id];return a?a[1]:'—';}
function lgCCol(id){if(id&&id[0]==='P')return LG_PC;const a=LGA[id];return a?a[4]:'#9fb3c8';}
function lgFlowRow(f,mineId){const c=lgCarrier(f);const M=LG_M[f.m];const ev=(G.lg&&G.lg.dl||[]).find(z=>z[0]===f.id);const n=lgNat(f.nb);
  const fr=f.dom?f.tc0:f.tc0*((G.lg.em[f.m]||1)/Math.max(.5,c.e))*(n&&n.war?LG_WAR:1);
  return `<button class="item lgrt${c.id===mineId?' mine':''}" data-lgr="${f.id}"><span style="flex:1"><div class="t">${M.ic} <b data-noi18n>${lgRtName(f)}</b></div>
   <div class="s"><span>${f.k==='food'?'🌾 Alimentos':RES0[f.k][1]+' '+RES0[f.k][0]}</span> · <b>${fmtN(f.v)}</b> <span>al año</span> · <span>flete</span> <b>${lgPct(fr)}</b></div>
   <div class="s"><span class="lgdot" style="background:${lgCCol(c.id)}"></span><span data-noi18n>${lgCName(c.id)}</span>${ev?` · <b class="${ev[1]===2?'dn':'wn'}">${ev[1]===2?'📦 Envío perdido este mes':'⏳ Retraso este mes'}</b>`:''}</div></span></button>`;}

/* ---------- ficha de tu empresa ---------- */
function lgBizHTML(b){const m=lgMode(b);const T=bzT(b);let h='';
  if(m){const g=lgBiz(b);const M=LG_M[m];const last=b.m[b.m.length-1];const op=last?last.cogs+last.pay+last.rent:0;const y=g.y;const tot=y.ok+y.dl+y.ls;
    h+=`<div class="sect" id="lgbd">🚚 <span>Logística de tu empresa</span></div>`+
     v19Tiles([['Flota',`${lgFleet(b)} ${M.u}`,`${b.br} sucursal(es)`],['Rutas',`${g.rt.length} / ${lgSlots(b)}`,g.au?'asignación automática':'elegidas por ti'],
       ['Costo operativo',fmt(op),'al mes (combustible, sueldos y renta)'],['Eficiencia',Math.round(lgEffBiz(b)*100)+' %','sube con la reputación'],
       ['Envíos a tiempo',tot?Math.round(y.ok/tot*100)+' %':'—',`${y.ok} de ${tot} este año`],['Retrasos y pérdidas',`${y.dl} · ${y.ls}`,'restan reputación y caja']],2);
    const f=last&&last.lgf;if(f)h+=`<div class="hint"><span>Efecto de tus rutas en la demanda</span> <b class="${f>=1?'up':'dn'}">${pctV(f-1)}</b>. <span>Con todas tus rutas cubiertas y envíos grandes vendes más; sin rutas, menos.</span></div>`;
    const C=lgCand(b);h+=`<div class="sect">🗺️ <span>Rutas que puede cubrir</span></div>`;
    if(!C.length)h+=`<div class="hint">No hay envíos ${M.n.toLowerCase()}s que salgan o lleguen a ${G.nations[G.regions[b.r].o].name} este año.</div>`;
    else h+=C.map(fl=>lgFlowRow(fl,g.id)).join('')+`<div class="hint"><span>Toca una ruta para tomarla o dejarla.</span> <span>Cada sucursal cubre una ruta (hasta 8).</span></div>`+(g.au?'':`<button class="btn" id="lgau" style="width:100%">🔄 <span>Asignar rutas automáticamente</span></button>`);}
  const fr=(()=>{try{return lgImpFreight(b);}catch(e){return 0;}})();
  if(fr&&(T.in||[]).length){const n=lgNat(G.regions[b.r].o);h+=`<div class="hint">🚚 <span>Flete de tus insumos importados:</span> <b>${lgPct(n.tc)}</b> <span>del valor (normal</span> <b>${lgPct(n.tc0)}</b>) → <span>costo de insumos</span> <b class="${fr>0?'dn':'up'}">${pctV(fr)}</b></div>`;}
  return h;}
{const _sd=showBizD;showBizD=function(i,...a){const r=_sd(i,...a);try{lgBizD(i);}catch(e){console.warn('v24a empresa',e);}return r;};showBizD._shk=1;}
function lgBizD(i){const B=$('sheetIn');const b=bzList(P)[i];if(!B||!b||!b.v14||B.querySelector('#lgbx'))return;const h=lgBizHTML(b);if(!h)return;
  const d=document.createElement('div');d.id='lgbx';d.innerHTML=h;const e=B.querySelector('#hzbd')||B.querySelector('#v21e');if(e)e.before(d);else{const t=B.querySelector('table.ist');if(t)t.before(d);else B.append(d);}
  d.querySelectorAll('[data-lgr]').forEach(x=>x.onclick=()=>{const t=lgToggle(b,x.dataset.lgr);if(t)toast('🚚',t);save();showBizD(i);});
  const au=d.querySelector('#lgau');if(au)au.onclick=()=>{lgAuto(b);save();showBizD(i);};}

/* ---------- 🚚 Logística ---------- */
const LGV={tab:'red'};
function showLogi(tab){if(!P||!G)return;lgEnsure();lgFlows();if(tab)LGV.tab=tab;const T=LGV.tab;const n=natOf(P);const o=lgNat(n.id);
  let h=`<h3>🚚 Logística</h3><div class="ntabs">${[['red','Red de tu país'],['emp','Transportistas']].map(([k,t])=>`<button data-lgt="${k}" class="${T===k?'on':''}">${t}</button>`).join('')}</div>`;
  if(T==='red'){const F=(LGC.byN[n.id]||[]).slice().sort((a,b)=>b.v-a.v);const imp=F.filter(f=>f.nb===n.id&&!f.dom),exp=F.filter(f=>f.na===n.id&&!f.dom),dom=F.filter(f=>f.dom);
    h+=`<div class="sect">${flag(n.id,14)} <span>${n.name}</span></div>`+v19Tiles([['Eficiencia de la red',o.n?o.sc+'/100':'—',o.n?'50 = normal':'sin importaciones en la red',o.n?shCol(o.sc):''],
      ['Flete de las importaciones',o.n?lgPct(o.tc):'—',o.n?'normal '+lgPct(o.tc0):''],['Dependencia de importaciones',Math.round(o.dep*100)+' %','de lo que consume en recursos'],
      ['Envíos',`${imp.length} · ${exp.length} · ${dom.length}`,'llegan · salen · internos']],2);
    try{const S=['retail','ind'].map(k=>[k,shParts(n,k).filter(([c])=>c==='nlog')]).filter(e=>e[1].length);
      if(S.length)h+=`<div class="sect">🏭 <span>Lo que el transporte mueve en la economía</span></div>`+S.map(([k,L])=>`<div class="v21sr v21sx"><div class="h"><span>${SECT[k][0]}</span><span>${shBar(shOf(n.id,k))} <b>${Math.round(shOf(n.id,k))}</b></span></div><div class="v21cs">${L.map(([c,v])=>`<span class="v21cz"><span>${SH_CL[c]}</span> <b class="${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('')}</div></div>`).join('');}catch(e){}
    h+=`<div class="hint"><span>El flete encarece lo que tu país importa: depende de la distancia, del modo (el barco es el más barato por tonelada y el avión el más caro), de qué tan eficientes son sus transportistas comparados con la media del mundo y de la guerra.</span> <span>Si sube, bajan un poco la salud del Comercio minorista y de la Industria.</span></div>`;
    const ev=(G.lg.ev||[]).slice().reverse();if(ev.length)h+=`<div class="sect">📋 <span>Avisos recientes</span></div>`+ev.slice(0,8).map(([t,id,e,c])=>{const f=lgFlowById(id);if(!f)return '';return `<div class="lgev"><b class="${e===2?'dn':'wn'}">${e===2?'📦 Perdido':'⏳ Retraso'}</b> · <span data-noi18n>${lgRtName(f)}</span> · <span data-noi18n>${lgCName(c)}</span></div>`;}).join('');
    if(imp.length)h+=`<div class="sect">⬇️ <span>Lo que llega</span></div>`+imp.slice(0,10).map(f=>lgFlowRow(f)).join('');
    if(exp.length)h+=`<div class="sect">⬆️ <span>Lo que sale</span></div>`+exp.slice(0,8).map(f=>lgFlowRow(f)).join('');
    if(dom.length)h+=`<div class="sect">🔁 <span>Envíos internos de alimentos</span></div>`+dom.slice(0,6).map(f=>lgFlowRow(f)).join('');
    if(!F.length)h+=`<div class="hint">Este año ningún envío grande de la red sale ni llega a ${n.name}.</div>`;}
  else{const F=lgFlows();const cnt={},val={};F.forEach(f=>{const c=lgCarrier(f);cnt[c.id]=(cnt[c.id]||0)+1;val[c.id]=(val[c.id]||0)+f.v;});
    const mine=bzList(P).map((b,i)=>[b,i]).filter(([b])=>lgMode(b));
    if(mine.length)h+=`<div class="sect">⭐ <span>Tus empresas de transporte</span></div>`+mine.map(([b,i])=>{const g=lgBiz(b);const M=LG_M[lgMode(b)];return `<button class="item" data-lgb="${i}"><span style="flex:1"><div class="t">${M.ic} <b data-noi18n>${clean(b.n)}</b></div><div class="s"><span>${lgFleet(b)} ${M.u}</span> · <span>rutas</span> <b>${g.rt.length}/${lgSlots(b)}</b> · <span>eficiencia</span> <b>${Math.round(lgEffBiz(b)*100)} %</b> · <span>retrasos y pérdidas</span> <b>${g.y.dl} · ${g.y.ls}</b></div></span>›</button>`;}).join('');
    ['ter','mar','aer'].forEach(m=>{const M=LG_M[m];h+=`<div class="sect">${M.ic} <span>${M.n}</span> · <span>eficiencia media</span> <b>${Math.round((G.lg.em[m]||1)*100)} %</b></div>`;
      h+=LG_AI.filter(a=>a[2]===m).sort((a,b)=>(val[b[0]]||0)-(val[a[0]]||0)).map(a=>{const s=G.lg.ai[a[0]];const st=a[5]&&G.mk&&G.mk.C[a[5]]&&!G.mk.C[a[5]].dead;
        return `<button class="item" ${st?`data-lgs="${a[5]}"`:''}><span style="flex:1"><div class="t"><span class="lgdot" style="background:${a[4]}"></span><b data-noi18n>${a[1]}</b> ${flag(a[3],12)}${st?` <small>📈 ${a[5]}</small>`:''}</div>
         <div class="s"><span>rutas</span> <b>${cnt[a[0]]||0}</b> · <b>${fmtN(val[a[0]]||0)}</b> <span>al año</span> · <span>eficiencia</span> <b>${Math.round(s.e*100)} %</b> · <span>retrasos y pérdidas</span> <b>${s.dl} · ${s.ls}</b></div></span>${st?'›':''}</button>`;}).join('');});
    h+=`<div class="hint"><span>Los transportistas de la IA pierden eficiencia con cada envío retrasado o perdido y la recuperan poco a poco.</span> <span>Funda una empresa de transporte (🚚 Transporte de carga, 🚢 Naviera o ✈️ Carga aérea) desde Mis empresas o compra una en Empresas en venta.</span></div>`;}
  openSheetRaw(h,B=>{B.querySelectorAll('[data-lgt]').forEach(x=>x.onclick=()=>showLogi(x.dataset.lgt));
    B.querySelectorAll('[data-lgb]').forEach(x=>x.onclick=()=>showBizD(+x.dataset.lgb));B.querySelectorAll('[data-lgs]').forEach(x=>x.onclick=()=>showStock(x.dataset.lgs));
    B.querySelectorAll('[data-lgr]').forEach(x=>x.onclick=()=>{const f=lgFlowById(x.dataset.lgr);if(!f)return;closeSheet();lgFocus(f);});
    try{v21bLrn('Logística','Flete');}catch(e){}});}
function lgFocus(f){const p=RG[f.a].c,q=RG[f.b].c;let dx=q[0]-p[0];if(Math.abs(dx)>MW/2)dx-=Math.sign(dx)*MW;const w=clamp(Math.max(Math.abs(dx),Math.abs(q[1]-p[1])*1.6)*1.5,260,MW);
  if(!lgOn()){CFG.lgv=1;saveCfg();lgBtn();}const cx=p[0]+dx/2,cy=(p[1]+q[1])/2;try{const h=w*wrap().clientHeight/Math.max(1,wrap().clientWidth);tweenVB(cx-w/2,cy-h/2,w);}catch(e){}LGD.hi=f.id;LGD.hiT=performance.now();lgKick();}

/* ---------- botones: Mis empresas, País → Economía, ficha de bolsa ---------- */
{const _sb=showBiz;showBiz=function(...a){const r=_sb(...a);try{const B=$('sheetIn');if(B&&P&&!B.querySelector('#lgbz')){const x=document.createElement('button');x.className='btn';x.id='lgbz';x.style.width='100%';
  x.innerHTML='🚚 <span>Logística</span>';x.onclick=()=>showLogi();const a2=B.querySelector('#v21ba');if(a2)a2.append(x);else{const nb=B.querySelector('#bzNew');if(nb)nb.before(x);else B.append(x);}}}catch(e){console.warn('v24a empresas',e);}return r;};showBiz._shk=1;}
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(VIEW.v==='pa'&&VIEW.tab==='eco'){const body=$('natBody');if(body&&!body.querySelector('#lgpa')){const n=natOf(P);const o=lgNat(n.id);
  const d=document.createElement('div');d.id='lgpa';d.innerHTML=`<div class="sect">🚚 <span>Logística</span></div>`+v19Tiles([['Eficiencia de la red',o.n?o.sc+'/100':'—','',o.n?shCol(o.sc):''],['Flete de las importaciones',o.n?lgPct(o.tc):'—',o.n?'normal '+lgPct(o.tc0):'']],2)+
   `<button class="btn" style="width:100%">🚚 <span>Logística</span></button>`;body.append(d);d.querySelector('button').onclick=()=>showLogi('red');}}}catch(e){console.warn('v24a país',e);}return r;};}
{const _ss=showStock;showStock=function(id,...a){const r=_ss(id,...a);try{lgStock(id);}catch(e){console.warn('v24a bolsa',e);}return r;};showStock._shk=1;}
function lgStock(id){const B=$('sheetIn');if(!B||B.querySelector('#lgst'))return;const a=LG_AI.find(z=>z[5]===id);if(!a||!G.lg)return;const s=G.lg.ai[a[0]];const F=lgFlows().filter(f=>lgCarrier(f).id===a[0]);
  const d=document.createElement('div');d.id='lgst';d.innerHTML=`<div class="sect">🚚 <span>Red logística</span> · ${LG_M[a[2]].ic} <span>${LG_M[a[2]].n}</span></div>`+
   v19Tiles([['Rutas',String(F.length)],['Carga al año',fmtN(F.reduce((t,f)=>t+f.v,0))],['Eficiencia',Math.round(s.e*100)+' %',`media ${Math.round((G.lg.em[a[2]]||1)*100)} %`],['Retrasos y pérdidas',`${s.dl} · ${s.ls}`,'este año']],2)+
   `<div class="hint">Cada envío retrasado o perdido le resta eficiencia; la recupera poco a poco.</div><button class="btn" style="width:100%">🚚 <span>Logística</span></button>`;B.append(d);d.querySelector('button').onclick=()=>showLogi('emp');}

/* ---------- capa de envíos en el mapa ---------- */
const LGD={cv:null,raf:0,last:0,P:{},F:null,sea:null,seaTry:0,q:[],qt:0,hi:null,hiT:0};
function lgOn(){try{return CFG.lgv!==0;}catch(e){return true;}}
function lgCv(){if(LGD.cv&&LGD.cv.isConnected)return LGD.cv;const w=$('mapWrap');if(!w)return null;const c=document.createElement('canvas');c.id='lgc';const ov=$('mapOv');if(ov&&ov.parentNode===w)w.insertBefore(c,ov);else w.appendChild(c);LGD.cv=c;return c;}
function lgBtn(){const b=document.querySelector('.mmodes button.lgt');if(!b)return;const on=lgOn();b.classList.toggle('lgon',on);b.setAttribute('aria-pressed',on?'true':'false');b.title=on?'Envíos (tocar para ocultar)':'Envíos (tocar para mostrar)';}
(function(){const mm=document.querySelector('.mmodes');if(!mm||mm.querySelector('.lgt'))return;const x=document.createElement('button');x.className='lgt';x.textContent='🚢';
  x.onclick=e=>{e.stopPropagation();CFG.lgv=lgOn()?0:1;saveCfg();lgBtn();lgKick();};const lt=mm.querySelector('.v3lt');if(lt)mm.insertBefore(x,lt);else mm.appendChild(x);lgBtn();})();
// rejilla de agua (4 px) sacada del mapa de identificadores + canales y estrechos abiertos a mano
const LG_SS=4,LG_CAN=[[2399.2,618,2403.5,640],[2350.4,486,2350.4,500],[1143,900,1148,910],[2526,842,2548,864]];
function lgSea(){if(LGD.sea)return LGD.sea;if(typeof IDS==='undefined'||!IDS)return null;const S=LG_SS,GW=Math.ceil(MW/S),GH=Math.ceil(MH/S),g=new Uint8Array(GW*GH);
  const at=(x,y)=>{x=x<0?0:x>=MW?MW-1:x|0;y=y<0?0:y>=MH?MH-1:y|0;return IDS[y*MW+x]===0?1:0;};
  for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const x0=i*S,y0=j*S;g[j*GW+i]=at(x0+S/2,y0+S/2)||at(x0,y0)+at(x0+S-1,y0)+at(x0,y0+S-1)+at(x0+S-1,y0+S-1)>=2?1:0;}
  LG_CAN.forEach(([ax,ay,bx,by])=>{const n=Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))/S*2)+2;for(let t=0;t<=n;t++){const x=ax+(bx-ax)*t/n,y=ay+(by-ay)*t/n;g[((y/S)|0)*GW+((x/S)|0)]=1;}});
  // componentes de agua: la ruta solo sale y llega al océano principal (los lagos junto a una capital no sirven de puerto)
  const lab=new Int32Array(GW*GH).fill(-1);let best=-1,bn=0,nl=0;const q=new Int32Array(GW*GH);
  for(let s=0;s<g.length;s++){if(!g[s]||lab[s]>=0)continue;let h=0,t=0;q[t++]=s;lab[s]=nl;
    while(h<t){const u=q[h++],ui=u%GW,uj=(u/GW)|0;for(let dj=-1;dj<=1;dj++){const vj=uj+dj;if(vj<0||vj>=GH)continue;for(let di=-1;di<=1;di++){const v=vj*GW+(ui+di+GW)%GW;if(g[v]&&lab[v]<0){lab[v]=nl;q[t++]=v;}}}}
    if(t>bn){bn=t;best=nl;}nl++;}
  for(let s=0;s<g.length;s++)if(g[s]&&lab[s]!==best)g[s]=0;
  LGD.sea={g,GW,GH};return LGD.sea;}
function lgSeaReady(){if(LGD.sea)return true;if(!LGD.seaQ&&typeof IDS!=='undefined'&&IDS){LGD.seaQ=1;(window.requestIdleCallback||setTimeout)(()=>{try{lgSea();}catch(e){}LGD.P={};lgKick();});}return false;}
function lgNear(S,x,y){const i0=(x/LG_SS)|0,j0=(y/LG_SS)|0;for(let r=0;r<28;r++)for(let j=j0-r;j<=j0+r;j++)for(let i=i0-r;i<=i0+r;i++){if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r)continue;if(j<0||j>=S.GH)continue;const ii=(i+S.GW)%S.GW;if(S.g[j*S.GW+ii])return [ii,j];}return null;}
// campo de distancias desde el destino (BFS sobre el océano, 8 vecinos) y bajada desde el origen: siempre encuentra la ruta si existe
function lgSeaRoute(S,s,t){const GW=S.GW,GH=S.GH,N=GW*GH,ti=t[1]*GW+t[0],si=s[1]*GW+s[0];const D=new Uint16Array(N);const q=new Int32Array(N);let h=0,e=0;D[ti]=1;q[e++]=ti;
  while(h<e){const u=q[h++];if(u===si)break;const ui=u%GW,uj=(u/GW)|0,du=D[u]+1;for(let dj=-1;dj<=1;dj++){const vj=uj+dj;if(vj<0||vj>=GH)continue;const r=vj*GW;for(let di=-1;di<=1;di++){const v=r+(ui+di+GW)%GW;if(S.g[v]&&!D[v]){D[v]=du;q[e++]=v;}}}}
  if(!D[si])return null;const L=[si];let u=si,n=0;while(u!==ti&&n++<20000){const ui=u%GW,uj=(u/GW)|0;let bv=-1,bd=D[u],bh=1e9;
    for(let dj=-1;dj<=1;dj++){const vj=uj+dj;if(vj<0||vj>=GH)continue;for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const vi=(ui+di+GW)%GW,v=vj*GW+vi;const d=D[v];if(!d||d>bd)continue;
      let dx=Math.abs(vi-t[0]);dx=Math.min(dx,GW-dx);const hh=Math.hypot(dx,vj-t[1]);if(d<bd||hh<bh){bd=d;bh=hh;bv=v;}}}
    if(bv<0||D[bv]>=D[u])break;u=bv;L.push(u);}return u===ti?L:null;}
function lgCurve(p,q,k,n){const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,dx=q[0]-p[0],dy=q[1]-p[1];const cx=mx-dy*k,cy=my+dx*k;const L=[];for(let i=0;i<=n;i++){const t=i/n,a=(1-t)*(1-t),b=2*t*(1-t),c=t*t;L.push([a*p[0]+b*cx+c*q[0],a*p[1]+b*cy+c*q[1]]);}return L;}
function lgPathOf(f){let o=LGD.P[f.id];if(o&&!(o.fb&&LGD.sea))return o;const p=RG[f.a].c.slice(),q=RG[f.b].c.slice();if(Math.abs(q[0]-p[0])>MW/2)q[0]+=q[0]>p[0]?-MW:MW;let pts=null,fb=0;
  if(f.m==='mar'){const S=LGD.sea;if(S){const s=lgNear(S,p[0],p[1]),t=lgNear(S,RG[f.b].c[0],RG[f.b].c[1]);const L=s&&t?lgSeaRoute(S,s,t):null;
      if(L){pts=[p];let px=p[0];for(let i=0;i<L.length;i+=5){const k=L[i];let x=(k%S.GW)*LG_SS+LG_SS/2;const y=((k/S.GW)|0)*LG_SS+LG_SS/2;while(x-px>MW/2)x-=MW;while(px-x>MW/2)x+=MW;px=x;pts.push([x,y]);}
        let qx=RG[f.b].c[0];while(qx-px>MW/2)qx-=MW;while(px-qx>MW/2)qx+=MW;pts.push([qx,RG[f.b].c[1]]);}}
    if(!pts){pts=lgCurve(p,q,.12,16);fb=1;}}
  else pts=lgCurve(p,q,f.m==='aer'?.18:.06,f.m==='aer'?18:10);
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach(([x,y])=>{if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;});o={pts,cum,len:cum[cum.length-1]||1,bb:[x0,y0,x1,y1],fb};LGD.P[f.id]=o;return o;}
function lgAt(o,t){const d=t*o.len,c=o.cum;let lo=0,hi=c.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<=d)lo=m;else hi=m;}const a=o.pts[lo],b=o.pts[hi]||a,s=c[hi]-c[lo]||1,u=(d-c[lo])/s;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];}
const lgMod=x=>((x%MW)+MW)%MW;
function lgVisible(o){const x0=vb.x,x1=vb.x+vb.w,y0=vb.y,y1=vb.y+vb.h;if(o.bb[3]<y0||o.bb[1]>y1)return false;for(const s of [0,-MW,MW])if(o.bb[2]+s>=x0&&o.bb[0]+s<=x1)return true;return false;}
function lgPick(max){if(!G||!G.lg)return [];const F=lgFlows();if(LGD.F!==F){LGD.F=F;LGD.P={};LGD.q=[];}const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const pm=lgPMap();
  const L=[];for(const f of F){const pr=(pm[f.id]?3e14:0)+(me&&(f.na===me||f.nb===me)?1e13:0)+(f.id===LGD.hi?1e15:0)+f.v;L.push([pr,f]);}L.sort((a,b)=>b[0]-a[0]);
  const out=[];let dots=0;let budget=1;for(const [,f] of L){if(dots>=max)break;if(f.m==='mar'&&(!LGD.P[f.id]||LGD.P[f.id].fb)&&lgSeaReady()){if(budget<=0){LGD.q.push(1);continue;}budget--;}const o=lgPathOf(f);if(!lgVisible(o))continue;
    const n=f.v>5e10?3:f.v>1e10?2:1;out.push([f,o,n]);dots+=n;}return out;}
function lgDraw(now,still){const c=lgCv();if(!c)return;const w=$('mapWrap');const dpr=mapDpr();const cw=Math.round(w.clientWidth*dpr),ch=Math.round(w.clientHeight*dpr);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}
  const x=c.getContext('2d');x.clearRect(0,0,cw,ch);if(!lgOn()||!G||!G.lg||!mapReady)return;LGD.q=[];
  const lite=mapMode!=='gl';const L=lgPick(lite?20:80);const k=cw/vb.w;const DL={};(G.lg.dl||[]).forEach(([id,e])=>DL[id]=e);
  const sx=X=>(X-vb.x)*k,sy=Y=>(Y-vb.y)*k;x.lineCap='round';x.lineJoin='round';
  // rutas: trazo tenue
  x.lineWidth=Math.max(1,dpr*.9);for(const [f,o] of L){const col=lgCCol(lgCarrier(f).id);x.strokeStyle=col;x.globalAlpha=f.id===LGD.hi?.55:.17;x.beginPath();
    for(const s of [0,-MW,MW]){if(!(o.bb[2]+s>=vb.x&&o.bb[0]+s<=vb.x+vb.w))continue;o.pts.forEach((p,i)=>{const X=sx(p[0]+s),Y=sy(p[1]);if(i)x.lineTo(X,Y);else x.moveTo(X,Y);});}x.stroke();}
  // envíos: puntos que avanzan (fijos en el modo ligero)
  x.globalAlpha=1;const r=clamp(2.6*dpr*Math.pow(1200/vb.w,.25),1.6*dpr,4*dpr);const t=(still?0:now)/1000;
  for(const [f,o,n] of L){const c2=lgCCol(lgCarrier(f).id);const e=DL[f.id]||0;const sp=(LG_M[f.m].sp/60)*(e===1?.5:1);const per=Math.max(25,o.len/sp*1.2);const ph=h21(f.id);
    for(let i=0;i<n;i++){if(e===2&&i===0)continue;const u=((t/per)+ph+i/n)%1;const p=lgAt(o,still?(ph+i/n)%1:u);const X=sx(lgMod(p[0])),Y=sy(p[1]);
      let X2=X;if(X<-10||X>cw+10){const a=sx(lgMod(p[0])-MW),b=sx(lgMod(p[0])+MW);X2=a>=-10&&a<=cw+10?a:b;}if(X2<-10||X2>cw+10||Y<-10||Y>ch+10)continue;
      x.beginPath();x.arc(X2,Y,r,0,6.2832);x.fillStyle=c2;x.fill();x.lineWidth=Math.max(1,dpr*.8);x.strokeStyle=e===1?'#f08a4b':'rgba(8,12,18,.85)';x.stroke();}
    if(e===2){const p=lgAt(o,.5);const X=sx(lgMod(p[0])),Y=sy(p[1]);if(X>=0&&X<=cw&&Y>=0&&Y<=ch){x.strokeStyle='#e74c3c';x.lineWidth=1.6*dpr;const s=r*1.2;x.beginPath();x.moveTo(X-s,Y-s);x.lineTo(X+s,Y+s);x.moveTo(X+s,Y-s);x.lineTo(X-s,Y+s);x.stroke();}}}
  if(LGD.hi&&now-LGD.hiT>9000)LGD.hi=null;}
function lgActive(){if(!lgOn()||!mapReady||!G||document.hidden)return false;const w=$('mapWrap');return !!(w&&w.clientWidth>0&&w.offsetParent!==null);}
function lgLoop(now){LGD.raf=0;if(!lgActive()){const c=LGD.cv;if(c&&!lgOn()){c.getContext('2d').clearRect(0,0,c.width,c.height);}return;}
  if(mapMode==='gl'){if(now-LGD.last>=45){LGD.last=now;lgDraw(now,false);}LGD.raf=requestAnimationFrame(lgLoop);}
  else{lgDraw(now,true);if(LGD.q.length&&!LGD.qt)LGD.qt=setTimeout(()=>{LGD.qt=0;lgKick();},400);}}
function lgKick(){if(LGD.raf)return;LGD.raf=requestAnimationFrame(lgLoop);}
// en WebGL se redibuja con cada cuadro del mapa (así no se despega al arrastrar); en el ligero, con cada redibujo
{const _d=drawGL;drawGL=function(...a){const r=_d.apply(this,a);try{if(lgOn()&&G&&G.lg){LGD.last=performance.now();lgDraw(LGD.last,false);lgKick();}}catch(e){}return r;};}
{const _d=drawLite;drawLite=function(...a){const r=_d.apply(this,a);try{if(G&&G.lg)lgDraw(performance.now(),true);}catch(e){}return r;};}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)lgKick();});
{const _r=render;render=function(...a){const r=_r(...a);try{lgBtn();lgKick();}catch(e){}return r;};}

/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
(function(){const c=GLC.indexOf('Naturaleza y recursos');GLOS.push(
 ['Logística','Todo lo que hace falta para que un bien llegue de donde se produce a donde se usa: transporte, almacenes, puertos, aduanas y la información que los coordina.',['logística'],c>=0?c:0],
 ['Flete','Lo que cuesta transportar una carga. Se suma al precio de lo que se importa: por eso un mismo bien cuesta más lejos de donde se produce.',['flete','fletes'],c>=0?c:0]);})();
(function(){const H=[
 ['Logística de tu empresa','🚚 Logística de tu empresa','Una empresa de transporte vende capacidad: camiones, buques o aviones que mueven carga de otros. Gana más cuando su flota va llena y sus envíos llegan a tiempo; los retrasos y las pérdidas cuestan clientes y seguros.','Flota = sucursales × unidades (12 camiones, 2 buques o 1 avión por sucursal); cada sucursal cubre una ruta de la red (hasta 8). Con todas tus rutas cubiertas la demanda sube hasta +12 %; sin rutas baja 8 %. Cada mes cada ruta puede retrasarse (~3.5 %) o perder el envío (~0.5 %; más con baja reputación o guerra): un retraso resta 0.3 de reputación; una pérdida, 1.5 y el 3 % de las ventas del mes.'],
 ['Logística','🚚 Logística','Cerca del 80 % del comercio mundial por volumen viaja en barco; el avión mueve poco peso pero mucho valor. El flete se suma al precio de todo lo que se importa.','Cada año los países que exportan un recurso abastecen a los que lo importan, y las provincias con cosechas de sobra a las que no se alimentan solas. El flete de las importaciones depende de la distancia, del modo, de la eficiencia de los transportistas contra la media del mundo y de la guerra; si sube, baja un poco la salud del Comercio minorista y de la Industria del país.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🚚 Logística',`<b>Los bienes viajan: de los países que los producen a los que los necesitan.</b>
<ul><li><b>🗺️ Mapa:</b> el botón 🚢 de las capas muestra los envíos como puntos que avanzan por tierra, por mar o por aire, con el color de su transportista (los tuyos en dorado). Tócalo otra vez para ocultarlos.</li>
<li><b>🚚 Logística</b> (Mis empresas o País → Economía): la eficiencia de la red de tu país, el flete de lo que importa, lo que llega y lo que sale, y los transportistas del mundo.</li>
<li><b>Tu empresa de transporte:</b> funda un 🚚 Transporte de carga, una 🚢 Naviera (en la costa) o una ✈️ Carga aérea, o compra una en Empresas en venta. En su ficha eliges sus rutas y ves su flota, su costo operativo y sus envíos a tiempo, retrasados o perdidos.</li>
<li><b>Precios:</b> si los transportistas de tu país son menos eficientes que la media o hay guerra, el flete sube y encarece lo importado (también los insumos de tus empresas).</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🌿 Naturaleza y recursos/.test(g[0]));GUIA.splice(gi>=0?gi+1:GUIA.length,0,T);})();
SABIAS.push(
 ['Cerca del 80 % del comercio mundial de mercancías, medido por volumen, viaja por mar.','UNCTAD, Review of Maritime Transport','eco'],
 ['El canal de Suez ahorra a un barco entre Asia y Europa unos 7,000 km frente a rodear África por el cabo de Buena Esperanza.','Autoridad del Canal de Suez','geo']);
if(typeof shWrapAll==='function')shWrapAll();
