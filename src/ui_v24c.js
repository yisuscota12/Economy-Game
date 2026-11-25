/* ===================== v2.4c: fase 6 de la ruta 9d (logística), parte 2 — interfaz =====================
   - 🚚 Logística → pestaña nueva «🌊 Pasos y obras»: estado de los 6 estrechos y canales (abierto, cerrado con su causa y los meses
     que faltan, piratería), cuántas rutas de la red y de tu país pasan por cada uno, huelgas portuarias activas, avisos recientes y
     las obras de logística de tu país (terminal de contenedores y aeropuerto de carga) en las provincias con más carga, con botón
     Construir (tesoro si gobiernas; si no, inversión privada que rinde un poco, como las obras de la v2.3b).
   - En cada ruta marítima de la red: por qué pasos va y si da la vuelta o está bloqueada.
   - Mapa (capa 🚢): los pasos cerrados se marcan con un círculo rojo y los de piratería con uno naranja (también en el modo ligero).
   Textos solo en español (traducción pendiente, como la v2.4a y la v2.4b). */

(function(){const st=document.createElement('style');st.id='st24c';st.textContent=`
.lgck{display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid var(--line);border-radius:12px;background:var(--card2);margin:5px 0}
.lgck .i{font-size:20px;width:26px;text-align:center}.lgck .t{font-size:13.5px}.lgck .s{font-size:12px;color:var(--mut)}
.lgck.cl{border-color:var(--red)}.lgck.pi{border-color:#f08a4b}.lgck b.ok{color:var(--green,#3fb950)}.lgck b.dn{color:var(--red)}.lgck b.wn{color:#f08a4b}
.lgrt .s.lgsea{font-size:11.5px}`;document.head.appendChild(st);})();

const lgCkSt=k=>{const e=G.lg&&G.lg.ck&&G.lg.ck[k];return e&&e.e>lgNowT()?e:null;};
const lgMes=n=>n+' '+(n===1?'mes':'meses');
function lgCkRow(k,U){const C=LG_CK[k];const e=lgCkSt(k);const left=e?e.e-lgNowT():0;const u=U[k];
  const st=!e?`<b class="ok">Abierto</b>`:e.c==='pir'?`<b class="wn">🏴‍☠️ Piratería</b> · <span>faltan</span> ${lgMes(left)}`:`<b class="dn">⛔ Cerrado</b>: <span>${LG_CKC[e.c]}</span> · <span>faltan</span> ${lgMes(left)}`;
  return `<div class="lgck${e?(e.c==='pir'?' pi':' cl'):''}"><span class="i">${C.ic}</span><span style="flex:1"><div class="t"><b>${C.n}</b> ${C.g.map(id=>G.nations[id]?flag(id,12):'').join('')}</div>
    <div class="s">${st}</div><div class="s"><span>Rutas de la red que pasan</span> <b>${u.n}</b> · <b>${fmtN(u.v)}</b> <span>al año</span>${u.me?` · <span>de tu país</span> <b>${u.me}</b>`:''}</div></span></div>`;}
function lgObHTML(nid){const S=lgObSites(nid);const rule=playerRules(nid);let h='';
  for(const k of NT_LGK){const J=NT_PJ[k];const L=S[k]||[];if(!L.length)continue;
    h+=L.map(([r,v])=>{const e=ntPjOf(r,k),lv=e?e.l:0,left=ntPjLeft(r,k);const c=ntPjCan(r,k);const pay=ntPjPay(r,k);const why=!c.ok?c.why:!pay.ok?pay.why:'';
      const cost=pay.by==='p'?fmt(pay.loc):fmtN(ntPjCost(r,k));const who=e&&e.b?{g:'tu gobierno',p:'tú',ia:'el gobierno'}[e.b]:'';
      return `<div class="ntpj"><div class="ntph"><span class="ntpi">${J.ic}</span><div><b>${J.n}</b> · <span data-noi18n>${RG[r].nm}</span><small><span>Nivel</span> ${lv}/${J.max}${left?` · 🏗️ <span>en construcción: faltan</span> ${lgMes(left)}`:''}${who&&(lv||left)?` · <span>Pagado por:</span> ${who}`:''} · <span>carga de la red</span> <b>${fmtN(v)}</b></small></div><button class="btn" data-lgob="${r}|${k}"${why?' disabled':''}>Construir</button></div>
       <div class="ntpd">${J.d}</div><div class="ntpc"><span>Costo</span> <b>${cost}</b> · <span>Tarda</span> <b>${lgMes(J.m)}</b>${why&&!left?` · <span class="ntpw">${why}</span>`:''}</div></div>`;}).join('');}
  return h?`<div class="ntpjs">${h}</div><div class="hint">${rule?'<span>Si gobiernas, la obra la paga el tesoro.</span>':'<span>Sin gobernar puedes pagarla como inversión privada (concesión): rinde cerca del 5 % al año por tarifas cuando funciona.</span>'} <span>El efecto se mide contra los puertos y aeropuertos del resto del mundo: si todos mejoran, nadie gana ventaja.</span></div>`
    :`<div class="hint"><span>Tu país no tiene rutas marítimas ni aéreas en la red este año.</span></div>`;}
function showLogiPas(){const n=natOf(P);LGV.tab='pas';const U=lgCkUse();
  let h=`<h3>🚚 Logística</h3><div class="ntabs">${[['red','Red de tu país'],['emp','Transportistas'],['pas','🌊 Pasos y obras']].map(([k,t])=>`<button data-lgt="${k}" class="${k==='pas'?'on':''}">${t}</button>`).join('')}</div>`;
  h+=`<div class="sect">🌊 <span>Estrechos y canales</span></div>`+LG_CKK.map(k=>lgCkRow(k,U)).join('');
  h+=`<div class="hint"><span>Si un paso se cierra, los barcos dan la vuelta (cabo de Buena Esperanza, cabo de Hornos o el estrecho de la Sonda) y el flete sube; si no hay otra salida (golfo Pérsico sin Ormuz, mar Negro sin el Bósforo), la carga queda bloqueada.</span> <span>Se cierran por guerra del país que custodia el paso, por accidentes, por sequía o por tensión militar; con piratería siguen abiertos, pero se pierden más envíos.</span></div>`;
  const hs=Object.entries((G.lg&&G.lg.hs)||{}).filter(([id,e])=>e.e>lgNowT()&&G.nations[id]);
  if(hs.length)h+=`<div class="sect">⚓ <span>Huelgas portuarias</span></div>`+hs.map(([id,e])=>`<div class="lgev">${flag(id,12)} <b>${G.nations[id].name}</b> · <span>faltan</span> ${lgMes(e.e-lgNowT())}${id===n.id?' · <b class="dn">tu país</b>':''}</div>`).join('');
  const nw=((G.lg&&G.lg.nw)||[]).slice().reverse().slice(0,8);
  if(nw.length)h+=`<div class="sect">📋 <span>Avisos recientes</span></div>`+nw.map(([t,ty,k,c,d])=>{const yr=Math.floor((t-1)/12);
    if(ty==='hs')return G.nations[k]?`<div class="lgev">${yr} · ⚓ <b class="wn">Huelga portuaria</b> · ${G.nations[k].name} · ${lgMes(d)}</div>`:'';
    const C=LG_CK[k];if(!C)return '';return `<div class="lgev">${yr} · ${C.ic} <b class="${ty==='ab'?'':ty==='pi'?'wn':'dn'}">${ty==='ab'?'Reabre':ty==='pi'?'Piratería':'Cierre'}</b> · ${C.n}${ty==='ce'?` · <span>${LG_CKC[c]}</span>`:''}${d?' · '+lgMes(d):''}</div>`;}).join('');
  h+=`<div class="sect">🏗️ <span>Obras de logística de</span> ${flag(n.id,14)} <span>${n.name}</span></div>`+lgObHTML(n.id);
  openSheetRaw(h,B=>{B.querySelectorAll('[data-lgt]').forEach(x=>x.onclick=()=>showLogi(x.dataset.lgt));
    B.querySelectorAll('[data-lgob]').forEach(x=>x.onclick=()=>{const [r,k]=x.dataset.lgob.split('|');const J=NT_PJ[k];const p=ntPjPay(r,k);
      askText(`${J.ic} ¿${J.n} en ${RG[r].nm}? <small>${p.by==='p'?fmt(p.loc):fmtN(p.usd)} · ${lgMes(J.m)}</small>`,null,()=>{const m=ntPjBuild(r,k);log(m,'good');try{sfx('coin');}catch(e){}save();render();showLogi('pas');},'Construir');});
    try{v21bLrn('Logística','Flete','Paso marítimo');}catch(e){}});}
{const _s=showLogi;showLogi=function(tab){if(!P||!G)return;if(tab)LGV.tab=tab;if(LGV.tab==='pas'){lgEnsure();lgFlows();return showLogiPas();}
  const r=_s(tab);try{const nt=$('sheetIn')&&$('sheetIn').querySelector('.ntabs');if(nt&&!nt.querySelector('[data-lgt="pas"]')){const b=document.createElement('button');b.dataset.lgt='pas';b.textContent='🌊 Pasos y obras';b.onclick=()=>showLogi('pas');nt.append(b);}}catch(e){}return r;};}

/* ---------- en cada ruta marítima: por dónde pasa ---------- */
{const _r=lgFlowRow;lgFlowRow=function(f,mineId){let h=_r(f,mineId);try{if(f.m!=='mar')return h;const s=lgRouteSea(f);if(!s.ck.length&&!s.bl)return h;
  const nm=s.ck.map(k=>LG_CK[k].n.replace(/^(Canal|Estrecho) de(l)? /,'')).join(', ');const shut=s.ck.filter(k=>{const e=lgCkSt(k);return e&&e.c!=='pir';});const pir=s.ck.filter(k=>{const e=lgCkSt(k);return e&&e.c==='pir';});
  const tag=s.bl?' · <b class="dn">⛔ bloqueada: no hay otra salida</b>':shut.length?` · <b class="wn">⛔ da la vuelta (+${Math.round((s.k-1)*100)} % de flete)</b>`:pir.length?' · <b class="wn">🏴‍☠️ piratería</b>':'';
  const line=`<div class="s lgsea">🌊 <span>por</span> ${nm}${tag}</div>`;const i=h.lastIndexOf('</span></button>');if(i>=0)h=h.slice(0,i)+line+h.slice(i);}catch(e){}return h;};}

/* ---------- mapa: pasos cerrados o con piratería ---------- */
{const _d=lgDraw;lgDraw=function(now,still){_d(now,still);try{if(!lgOn()||!G||!G.lg||!G.lg.ck||!mapReady)return;const act=LG_CKK.filter(k=>lgCkSt(k));if(!act.length)return;
  const c=lgCv();if(!c)return;const x=c.getContext('2d');const dpr=mapDpr();const kk=c.width/vb.w;const R=clamp(7*dpr*Math.pow(1200/vb.w,.3),5*dpr,16*dpr);
  const pulse=still?1:.75+.25*Math.sin(now/260);x.globalAlpha=1;
  act.forEach(k=>{const C=LG_CK[k],e=lgCkSt(k);for(const s of [0,-MW,MW]){const X=(C.x+s-vb.x)*kk,Y=(C.y-vb.y)*kk;if(X<-R||X>c.width+R||Y<-R||Y>c.height+R)continue;
    const col=e.c==='pir'?'#f08a4b':'#e74c3c';x.beginPath();x.arc(X,Y,R*pulse,0,6.2832);x.fillStyle=col+'55';x.fill();x.lineWidth=1.8*dpr;x.strokeStyle=col;x.stroke();
    if(e.c!=='pir'){const q=R*.45;x.beginPath();x.moveTo(X-q,Y-q);x.lineTo(X+q,Y+q);x.moveTo(X+q,Y-q);x.lineTo(X-q,Y+q);x.stroke();}
    else{x.beginPath();x.arc(X,Y,R*.28,0,6.2832);x.fillStyle=col;x.fill();}}});}catch(e){}};}

/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
(function(){const c=GLC.indexOf('Naturaleza y recursos');GLOS.push(
 ['Paso marítimo','Estrecho o canal por donde pasa mucho comercio (Suez, Panamá, Ormuz, Malaca). Si se cierra, los barcos rodean continentes: tardan más y el flete sube.',['paso marítimo','pasos marítimos','estrecho','estrechos'],c>=0?c:0]);})();
(function(){const H=['Pasos y obras','🌊 Pasos y obras','Una parte grande del comercio pasa por unos pocos estrechos y canales. Cuando uno se cierra, el barco no se detiene: da la vuelta, gasta más combustible y llega tarde.',
  'Cada ruta marítima pasa por los pasos que hay entre las dos cuencas. Cerrado: la ruta rodea y el flete sube hasta +60 % (sin otra salida, ×1.8). Piratería: el paso sigue abierto, pero cuesta más y se pierden más envíos. Huelga portuaria: +25 % de flete en lo que entra o sale por mar de ese país. Una terminal de contenedores baja 5 % el flete marítimo por nivel y un aeropuerto de carga 6 % el aéreo, comparados con la media del mundo.'];
  HELP.unshift(H);HELP_RX.unshift(new RegExp('^'+H[0],'i'));
  const g=GUIA.find(x=>/^🚚 Logística/.test(x[0]));if(g)g[1]=g[1].replace(/<\/ul>$/,'<li><b>🌊 Pasos y obras</b> (en 🚚 Logística): el estado de Suez, Panamá, el Bósforo, Ormuz, Malaca y Bab el-Mandeb; si uno se cierra, los barcos dan la vuelta y sube el flete. Ahí también construyes una 🏗️ terminal de contenedores o un 🛫 aeropuerto de carga para abaratar el flete de tu país. En el mapa, un círculo rojo marca un paso cerrado y uno naranja, piratería.</li></ul>');})();
SABIAS.push(
 ['En marzo de 2021 el portacontenedores Ever Given encalló en el canal de Suez y lo bloqueó seis días; cientos de barcos quedaron esperando.','Autoridad del Canal de Suez','geo'],
 ['Por el estrecho de Ormuz pasa cerca de una quinta parte del petróleo que se consume en el mundo.','U.S. Energy Information Administration (EIA)','eco'],
 ['En 2023 una sequía bajó el lago Gatún y el canal de Panamá tuvo que limitar el número de barcos que cruzaban cada día.','Autoridad del Canal de Panamá','geo']);
