/* ===================== v2.4c: fase 2 de la lista del dueño (economía) — interfaz =====================
   - ✈️ Aeropuertos en «Obras» de la provincia (nivel base de los datos + lo que construyas, hasta 3) y pestaña «✈️ Red aérea» en 🚚 Logística
     (aeropuertos de tu país, conectividad, rutas con pasajeros, tránsito en horas contra días por tierra o mar, flete aéreo que sigue al
     petróleo). Las rutas aéreas se dibujan en la capa de envíos (#lgc) con el mismo estilo de la v2.4a: arco punteado y aviones pequeños.
   - 🏛️ Secretaría de inversiones: empresas estatales de tu país (fundar, invertir, recortar, presupuesto, privatizar, sacar a bolsa, cerrar).
   - 🏖️ Secretaría de turismo: llegadas y gasto por país y provincia, atractivos, campaña, visado, tasa, áreas protegidas y aeropuertos.
   - Bolsa: cada empresa muestra qué parte del PIB de su país representa.
   Botones en País → Economía y en País → Gabinete. Textos solo en español (traducción pendiente). */

Object.assign(SH_CL,{naer:'Carga aérea y petróleo',est:'Empresas estatales'});
(function(){const st=document.createElement('style');st.id='st24c';st.textContent=`
.secd{border:1px solid var(--line);border-radius:12px;padding:9px 10px;margin:6px 0;background:var(--card2,rgba(255,255,255,.03))}
.secd.qb{border-color:var(--red)}.secd .t{font-size:14px}.secd .s{font-size:12px;color:var(--mut);margin-top:2px}
.secd .ac{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.secd .ac .btn{font-size:12px;padding:6px 9px;flex:1 1 auto}
.tuch{display:inline-block;font-size:11.5px;border:1px solid var(--line);border-radius:10px;padding:1px 7px;margin:2px 3px 0 0;color:var(--mut)}
.v24cb{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}.v24cb .btn{flex:1 1 45%}`;document.head.appendChild(st);})();
const seBtn=(a,id,t,dis)=>`<button class="btn" data-sea="${a}" data-id="${id}" ${dis?'disabled':''}>${t}</button>`;
const fmtM=v=>v>=1e6?(v/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M':fmtK(v);

/* ---------- ✈️ aeropuertos en «Obras» ---------- */
function aeBuildDo(r){const n=natOf(P);const x=G.regions[r];if(!P.ruler||!x||x.o!==n.id)return 'Solo quien gobierna construye en provincias de su país.';const ok=aeCan(r);if(!ok.ok)return ok.why;const c=aeCost(r);
  if((n.treas||0)<c)return `El tesoro no alcanza (${fmtN(c)}).`;n.treas-=c;build(r,'aero');P.built=(P.built||0)+1;try{sfx('coin');}catch(e){}return `Construyes ✈️ un aeropuerto en ${RG[r].nm}: ahora es de nivel ${aeLvl(r)}.`;}
{const _sb=showBuild;showBuild=function(rid,...a){const r=_sb(rid,...a);try{aeBuildOpt(rid);}catch(e){console.warn('v24c obras',e);}return r;};}
function aeBuildOpt(rid){const B=$('sheetIn');if(!B||B.querySelector('#aeob'))return;const n=natOf(P);const l=aeLvl(rid),ok=aeCan(rid),c=aeCost(rid),b0=aeBase(rid);
  const can=ok.ok&&P.ruler&&G.regions[rid].o===n.id&&(n.treas||0)>=c;const d=document.createElement('div');d.id='aeob';
  d.innerHTML=`<button class="item" ${can?'':'disabled'}><span><div class="t">✈️ <span>Aeropuerto</span> ${l?`(<span>nivel</span> ${l} → ${l+1})`:''}</div><div class="s">${ok.ok?`${BLD.aero.d} · ${fmtN(c)}`:ok.why}${b0?` · <span>nivel de partida</span> ${b0}`:''}</div></span></button>`;
  B.append(d);d.querySelector('button').onclick=()=>{const t=aeBuildDo(rid);log(t,'good');save();render();showBuild(rid);};}

/* ---------- 🚚 Logística → ✈️ Red aérea ---------- */
{const _sl=showLogi;showLogi=function(tab){if(tab==='aer'||(tab==null&&LGV.tab==='aer')){LGV.tab='aer';aeLogi();return;}const r=_sl(tab);try{aeTabBtn();}catch(e){}return r;};}
function aeTabBtn(){const B=$('sheetIn');const t=B&&B.querySelector('.ntabs');if(!t||t.querySelector('[data-aet]'))return;const b=document.createElement('button');b.dataset.aet='1';b.textContent='✈️ Red aérea';b.onclick=()=>showLogi('aer');t.append(b);}
const aeRtName=f=>`${RG[f.a].nm} → ${RG[f.b].nm}`;
function aeRouteRow(f){const h=aeHours(f.d);const fl=G.nations[f.na],fl2=G.nations[f.nb];
  return `<button class="item lgrt" data-aer="${f.id}"><span style="flex:1"><div class="t">✈️ <b data-noi18n>${aeRtName(f)}</b> ${flag(f.na,11)}${f.na!==f.nb?flag(f.nb,11):''}</div>
   <div class="s"><b>${fmtM(f.pax)}</b> <span>pasajeros al año</span> · <span>vuelo</span> <b>${h.toFixed(1)} h</b> · <span>flete</span> <b>${lgPct(aeTc(f.d))}</b></div>
   <div class="s"><span class="lgdot" style="background:${lgCCol(f.c)}"></span><span data-noi18n>${lgCName(f.c)}</span>${f.dom?' · <span>nacional</span>':''}</div></span></button>`;}
function aeLogi(){if(!P||!G)return;lgEnsure();const n=natOf(P);const R=aeRoutes();const mine=R.filter(f=>f.na===n.id||f.nb===n.id).sort((a,b)=>b.pax-a.pax);
  const ap=regionsOf(n.id).filter(r=>aeLvl(r)).sort((a,b)=>aeLvl(b)-aeLvl(a)||G.regions[b].pop-G.regions[a].pop);const rel=aeRel(n.id),od=aeOilDev();
  const far=mine.length?mine.reduce((a,f)=>f.d>a.d?f:a,mine[0]):null;
  let h=`<h3>🚚 Logística</h3><div class="ntabs">${[['red','Red de tu país'],['emp','Transportistas'],['aer','✈️ Red aérea']].map(([k,t])=>`<button data-lgt="${k}" class="${k==='aer'?'on':''}">${t}</button>`).join('')}</div>`;
  h+=`<div class="sect">${flag(n.id,14)} <span>${n.name}</span></div>`+v19Tiles([['Aeropuertos',String(ap.length),ap.length?`<span>el mayor de nivel</span> ${aeLvl(ap[0])}`:'ninguno'],
    ['Conectividad aérea',Math.round(rel*100)+' %','100 % = aeropuertos de partida'],['Rutas aéreas',String(mine.length),`${fmtM(mine.reduce((s,f)=>s+f.pax,0))} <span>pasajeros al año</span>`],
    ['Petróleo contra su tendencia',pctV(Math.exp(od)-1),'encarece o abarata el vuelo'],['Flete aéreo (1,500 px)',lgPct(aeTc(1500)),`<span>barco</span> ${lgPct(lgTcBase('mar',1500))} · <span>camión</span> ${lgPct(lgTcBase('ter',1500))}`],
    far?['Tránsito a '+RG[far.b===far.a?far.a:(far.na===n.id?far.b:far.a)].nm,`${aeHours(far.d).toFixed(1)} h`,`<span>barco</span> ~${Math.round(aeSeaDays(far.d))} <span>días</span> · <span>tierra</span> ~${Math.round(aeLandDays(far.d))} <span>días</span>`]:null],2);
  try{const S=['retail','lujo'].map(k=>[k,shParts(n,k).filter(([c])=>c==='naer')]).filter(e=>e[1].length);
    if(S.length)h+=`<div class="sect">🏭 <span>Lo que el avión mueve en la economía</span></div>`+S.map(([k,L])=>`<div class="v21sr v21sx"><div class="h"><span>${SECT[k][0]}</span><span>${shBar(shOf(n.id,k))} <b>${Math.round(shOf(n.id,k))}</b></span></div><div class="v21cs">${L.map(([c,v])=>`<span class="v21cz"><span>${SH_CL[c]}</span> <b class="${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('')}</div></div>`).join('');}catch(e){}
  h+=`<div class="hint"><span>El avión es el modo más rápido (horas en vez de días o semanas) y el más caro: su costo sigue al precio del petróleo.</span> <span>Trae lo perecedero y lo de mucho valor (flores, fruta fresca, medicinas, joyas): si el petróleo sube, eso se encarece en tu país (Comercio minorista y Lujo); más aeropuertos lo abaratan y atraen turistas.</span> <span>Las cafeterías, restaurantes, hoteles, joyerías, farmacias y clínicas pagan un poco más por sus insumos sensibles al tiempo.</span></div>`;
  if(ap.length)h+=`<div class="sect">✈️ <span>Aeropuertos de tu país</span></div>`+ap.slice(0,8).map(r=>{const c=aeCan(r);const cost=aeCost(r);const b0=aeBase(r),bt=bl(r,'aero');
    return `<div class="secd"><div class="t">✈️ <b data-noi18n>${RG[r].nm}</b> · <span>nivel</span> <b>${aeLvl(r)}</b>${bt?` <small>(${b0} + ${bt} <span>construido(s)</span>)</small>`:''}</div><div class="s">${tuStatic(r).cn?`<span>ciudad principal</span> <span data-noi18n>${tuStatic(r).cn}</span> · `:''}<span>población</span> ${fmtK(G.regions[r].pop)}</div>
     ${P.ruler&&c.ok?`<div class="ac"><button class="btn" data-aeb="${r}" ${(n.treas||0)>=cost?'':'disabled'}>➕ <span>Ampliar</span> · ${fmtN(cost)}</button></div>`:''}</div>`;}).join('');
  if(P.ruler){const cand=regionsOf(n.id).filter(r=>!aeLvl(r)&&aeCan(r).ok).sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,4);
    if(cand.length)h+=`<div class="sect">🏗️ <span>Dónde puede haber un aeropuerto nuevo</span></div>`+cand.map(r=>`<button class="item" data-aeb="${r}" ${(n.treas||0)>=aeCost(r)?'':'disabled'}><span><div class="t">✈️ <b data-noi18n>${RG[r].nm}</b></div><div class="s"><span>población</span> ${fmtK(G.regions[r].pop)} · ${fmtN(aeCost(r))}</div></span></button>`).join('');}
  if(mine.length)h+=`<div class="sect">🛫 <span>Rutas de tu país</span></div>`+mine.slice(0,12).map(aeRouteRow).join('');
  h+=`<div class="sect">🌐 <span>Rutas con más pasajeros del mundo</span></div>`+R.slice().sort((a,b)=>b.pax-a.pax).slice(0,8).map(aeRouteRow).join('');
  openSheetRaw(h,B=>{B.querySelectorAll('[data-lgt]').forEach(x=>x.onclick=()=>showLogi(x.dataset.lgt));
    B.querySelectorAll('[data-aer]').forEach(x=>x.onclick=()=>{const f=aeRoutes().find(z=>z.id===x.dataset.aer);if(!f)return;closeSheet();lgFocus(f);});
    B.querySelectorAll('[data-aeb]').forEach(x=>x.onclick=()=>{const t=aeBuildDo(x.dataset.aeb);toast('✈️',t);log(t,'good');save();render();aeLogi();});
    try{v21bLrn('Logística','Flete');}catch(e){}});}

/* ---------- capa del mapa: rutas aéreas (mismo lienzo y estilo que los envíos de la v2.4a) ---------- */
{const _d=lgDraw;lgDraw=function(now,still){const r=_d(now,still);try{aeDraw(now,still);}catch(e){}return r;};}
function aeDraw(now,still){const c=LGD.cv;if(!c||!lgOn()||!G||!G.lg||!mapReady)return;const x=c.getContext('2d');const lite=mapMode!=='gl';const dpr=mapDpr();const cw=c.width,ch=c.height;const k=cw/vb.w;
  const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const R=aeRoutes().map(f=>[(f.id===LGD.hi?1e15:0)+(me&&(f.na===me||f.nb===me)?1e12:0)+f.pax,f]).sort((a,b)=>b[0]-a[0]);
  const out=[];for(const [,f] of R){if(out.length>=(lite?8:30))break;const o=lgPathOf(f);if(lgVisible(o))out.push([f,o]);}if(!out.length)return;
  const sx=X=>(X-vb.x)*k,sy=Y=>(Y-vb.y)*k;x.save();x.lineCap='round';x.setLineDash([3*dpr,5*dpr]);x.lineWidth=Math.max(1,dpr*.8);
  for(const [f,o] of out){x.strokeStyle=lgCCol(f.c);x.globalAlpha=f.id===LGD.hi?.6:.2;x.beginPath();for(const s of [0,-MW,MW]){if(!(o.bb[2]+s>=vb.x&&o.bb[0]+s<=vb.x+vb.w))continue;o.pts.forEach((p,i)=>{const X=sx(p[0]+s),Y=sy(p[1]);if(i)x.lineTo(X,Y);else x.moveTo(X,Y);});}x.stroke();}
  x.setLineDash([]);x.globalAlpha=1;const r=clamp(2.4*dpr*Math.pow(1200/vb.w,.25),1.5*dpr,3.6*dpr);const t=(still?0:now)/1000;
  for(const [f,o] of out){const per=Math.max(10,o.len/(LG_M.aer.sp/60)*.5);const ph=h21(f.id);const u=still?ph:((t/per)+ph)%1;const p=lgAt(o,u),q=lgAt(o,Math.min(1,u+.01));
    let X=sx(lgMod(p[0]));const Y=sy(p[1]);if(X<-10||X>cw+10){const a=sx(lgMod(p[0])-MW),b=sx(lgMod(p[0])+MW);X=a>=-10&&a<=cw+10?a:b;}if(X<-10||X>cw+10||Y<-10||Y>ch+10)continue;
    const ang=Math.atan2(q[1]-p[1],q[0]-p[0]);x.save();x.translate(X,Y);x.rotate(ang);x.beginPath();x.moveTo(r*1.6,0);x.lineTo(-r,r*.95);x.lineTo(-r*.45,0);x.lineTo(-r,-r*.95);x.closePath();
    x.fillStyle='#f4f8ff';x.fill();x.lineWidth=Math.max(1,dpr*.8);x.strokeStyle=lgCCol(f.c);x.stroke();x.restore();}
  x.restore();}

/* ---------- 🏛️ Secretaría de inversiones (empresas estatales) ---------- */
function seCardHTML(e,rule){const T=BZ[BZK[e.k]];const c=seCalc(e);const last=(e.h||[])[e.h.length-1];const res=last?last[2]:(c?c.res:0);const rev=last?last[1]:(c?c.rev:0);const emp=e.emp||(c?c.emp:0);
  const m=rev?res/rev:(c?c.m:0);const st=e.mk&&G.mk&&G.mk.C[e.mk];
  return `<div class="secd${e.qb?' qb':''}"><div class="t">${T.ic} <b data-noi18n>${clean(e.nm)}</b>${st?` <small>📈 ${e.mk}</small>`:''}${e.qb?' <b class="dn">⚠️ <span>En quiebra</span></b>':''}</div>
   <div class="s">${T.n} · <span data-noi18n>${RG[e.r]?RG[e.r].nm:'—'}</span> · <span>desde</span> ${e.y0}</div>
   <div class="s"><span>Capital</span> <b>${fmtN(e.cap)}</b> · <span>ventas</span> <b>${fmtN(rev)}</b> · <span>resultado</span> <b class="${res>=0?'up':'dn'}">${res>=0?'+':'−'}${fmtN(Math.abs(res))}</b> (${(m*100).toFixed(1)} %)</div>
   <div class="s"><span>Empleo</span> <b>${fmtK(emp)}</b> · <span>eficiencia</span> <b>${Math.round(e.ef*100)} %</b> · <span>presupuesto</span> <b>${SE_BUD[e.bud||0][0]}</b> (${fmtN(e.cap*SE_BUD[e.bud||0][1])} <span>al año</span>)</div>
   ${rule?`<div class="ac">${seBtn('inv',e.id,'💰 <span>Invertir</span>')}${seBtn('cut',e.id,'✂️ <span>Recortar</span>',e.cut===G.year)}${seBtn('bud',e.id,'📊 <span>Presupuesto</span>')}${seBtn('priv',e.id,'🤝 <span>Privatizar</span>')}${!e.mk&&EXN[e.n]?seBtn('ipo',e.id,'📈 <span>Sacar a bolsa</span>',!(c&&c.m>0)):''}${e.qb?seBtn('cls',e.id,'🚪 <span>Cerrar</span>'):''}</div>`:''}</div>`;}
function showSE(){if(!P||!G)return;const S=seEnsure();const n=natOf(P);const rule=playerRules(n.id);const L=S.L.filter(e=>e.n===n.id);const t=(S.t&&S.t[n.id])||[0,0,0,0,0];
  const emp=L.reduce((s,e)=>s+(e.emp||0),0),rev=L.reduce((s,e)=>s+(e.rev||0),0),cap=L.reduce((s,e)=>s+e.cap,0),bud=L.reduce((s,e)=>s+e.cap*SE_BUD[e.bud||0][1],0),ga=L.reduce((s,e)=>s+(e.gA||0),0);
  let h=`<h3>🏛️ <span>Secretaría de inversiones</span></h3><div class="hint"><span>Las empresas estatales son del gobierno: el tesoro pone el capital y un presupuesto anual, y recibe su resultado (si gana, suma; si pierde, resta).</span> <span>Dan empleo y mueven la salud de su sector y el PIB de su provincia.</span></div>`;
  h+=v19Tiles([['Empresas estatales',String(L.length),`${fmtN(cap)} <span>de capital</span>`],['Empleo',fmtK(emp),'personas'],['Ventas del año',fmtN(rev),''],
    ['Al tesoro el año pasado',(t[0]>=0?'+':'−')+fmtN(Math.abs(t[0])),'resultado − presupuesto',t[0]>=0?'var(--teal)':'var(--red)'],['Presupuesto anual',fmtN(bud),'inversión y mantenimiento'],
    ['Aporte al PIB',(ga/Math.max(1,n.gdp)*100).toFixed(2)+' %','valor agregado nuevo']],2);
  try{const S2=[];new Set(L.map(e=>BZ[BZK[e.k]].sec)).forEach(k=>{const z=shParts(n,k).filter(([c])=>c==='est');if(z.length)S2.push([k,z[0][1]]);});
    if(S2.length)h+=`<div class="hint">🏭 <span>Efecto en la salud de los sectores:</span> ${S2.map(([k,v])=>`<span class="tuch">${SECT[k][0]} <b class="${v>=0?'up':'dn'}">${v>=0?'+':'−'}${Math.abs(v).toFixed(1)}</b></span>`).join('')}</div>`;}catch(e){}
  if(L.length)h+=`<div class="sect">🏛️ <span>Empresas de tu país</span></div>`+L.map(e=>seCardHTML(e,rule)).join('');else h+=`<div class="hint">${n.name} <span>no tiene empresas estatales.</span></div>`;
  if(rule)h+=`<button class="btn gold" id="seNew" style="width:100%">➕ <span>Fundar una empresa estatal</span></button><div class="hint"><span>Fundar, privatizar, sacar a bolsa o cerrar usa una acción de gobierno; invertir, recortar y el presupuesto no.</span> <span>Con 2 años de pérdidas grandes (margen bajo −5 %) entra en quiebra: si no la rescatas, a los 2 años se cierra.</span></div>`;
  else h+=`<div class="hint">Solo quien gobierna decide sobre las empresas estatales.</div>`;
  const W=S.L.filter(e=>e.n!==n.id&&G.nations[e.n]).sort((a,b)=>(b.rev||0)-(a.rev||0)).slice(0,8);
  if(W.length)h+=`<div class="sect">🌐 <span>Empresas estatales grandes del mundo</span></div>`+W.map(e=>{const T=BZ[BZK[e.k]];return `<div class="lgev">${flag(e.n,11)} ${T.ic} <b data-noi18n>${clean(e.nm)}</b> · <span>ventas</span> ${fmtN(e.rev||0)} · <span>resultado</span> <b class="${(e.res||0)>=0?'up':'dn'}">${(e.res||0)>=0?'+':'−'}${fmtN(Math.abs(e.res||0))}</b></div>`;}).join('');
  openSheetRaw(h,B=>{const nb=B.querySelector('#seNew');if(nb)nb.onclick=()=>seFoundPick();
    B.querySelectorAll('[data-sea]').forEach(x=>x.onclick=()=>{const e=G.se.L.find(z=>z.id===x.dataset.id);if(!e)return;const a=x.dataset.sea;
      const done=t=>{if(t){toast('🏛️',t);log(t,'good');}save();render();showSE();};
      if(a==='inv')done(seInvest(e));else if(a==='cut')done(seCut(e));
      else if(a==='bud')openSheetRaw(`<h3>📊 <span>Presupuesto de</span> <span data-noi18n>${clean(e.nm)}</span></h3><div class="hint"><span>Sale del tesoro cada año. El 70 % se vuelve capital; con presupuesto alto la eficiencia sube, con bajo baja.</span></div>`+
        SE_BUD.map(([nm,f,d],i)=>`<button class="item" data-bl="${i}" ${(e.bud||0)===i?'disabled':''}><span><div class="t">${nm}</div><div class="s">${fmtN(e.cap*f)} <span>al año</span> · <span>eficiencia</span> ${d>=0?'+':'−'}${Math.abs(Math.round(d*100))} <span>al año</span></div></span></button>`).join(''),
        b=>b.querySelectorAll('[data-bl]').forEach(y=>y.onclick=()=>done(seBudget(e,+y.dataset.bl))));
      else if(a==='priv'){const v=seValue(e);const T=BZ[BZK[e.k]];const rv1=bzRv(T,e.r)*bzU(e.r);const capL=toInt(e.cap,'USD');const br=clamp(Math.round(capL/Math.max(1,T.K*rv1)),1,T.mx);const fr=Math.min(1,br*T.K*rv1/Math.max(1,capL));const pr=toInt(v*fr,'USD');
        openSheetRaw(`<h3>🤝 <span>Privatizar</span> <span data-noi18n>${clean(e.nm)}</span></h3><div class="hint"><span>Valor estimado</span> <b>${fmtN(v)}</b> (<span>según su capital y su margen</span>). <span>Usa una acción de gobierno.</span></div>
          <button class="item" data-pv="x"><span><div class="t">🏢 <span>Vender a un grupo privado</span></div><div class="s">+${fmtN(v*.9)} <span>al tesoro; la empresa y sus empleos siguen</span></div></span></button>
          <button class="item" data-pv="p" ${P.dinero>=pr?'':'disabled'}><span><div class="t">⭐ <span>Comprarla tú</span></div><div class="s"><span>Pagas</span> ${fmt(pr)}${fr<1?` <span>por la parte que tu empresa puede operar</span> (${br} <span>sucursal(es)</span>)`:''} · <span>pasa a Mis empresas</span></div></span></button>`,
          b=>b.querySelectorAll('[data-pv]').forEach(y=>y.onclick=()=>{closeSheet();useNat({t:'Privatización',fn:()=>sePriv(e,y.dataset.pv)});showSE();}));}
      else if(a==='ipo'){useNat({t:'Salida a bolsa',fn:()=>seIPO(e)});showSE();}
      else if(a==='cls'){useNat({t:'Cierre',fn:()=>seClose(e)});showSE();}});
    try{v21bLrn('Empresa estatal');}catch(e){}});}
function seFoundPick(){const n=natOf(P);const S=seEnsure();const have=new Set(S.L.filter(e=>e.n===n.id).map(e=>e.k));
  const L=BZ.map(T=>{const err=have.has(T.k)?'Ya tienes una de este giro.':seCan(n.id,T.k);const r=err?null:seProv(n.id,T.k);return [T,err||(r?null:'No hay una provincia adecuada.'),r];});
  openSheetRaw(`<h3>➕ <span>Fundar una empresa estatal</span></h3><div class="hint"><span>Tesoro:</span> <b>${fmtN(n.treas||0)}</b>. <span>Elige el giro; después, el tamaño.</span></div>`+
    L.map(([T,err,r],i)=>`<button class="item" data-fg="${i}" ${err?'disabled':''}><span><div class="t">${T.ic} ${T.n}</div><div class="s">${err||`<span>en</span> <span data-noi18n>${RG[r].nm}</span> · <span>desde</span> ${fmtN(n.gdp*SE_SZ[0][1])}`}</div></span></button>`).join(''),
    B=>B.querySelectorAll('[data-fg]').forEach(x=>x.onclick=()=>{const T=L[+x.dataset.fg][0];
      openSheetRaw(`<h3>${T.ic} ${T.n}</h3><div class="hint"><span>Capital inicial del tesoro</span> (<span>tesoro</span> ${fmtN(n.treas||0)}). <span>Usa una acción de gobierno.</span></div>`+
        SE_SZ.map(([nm,f],i)=>`<button class="item" data-sz="${i}" ${(n.treas||0)>=n.gdp*f&&P.nat>0?'':'disabled'}><span><div class="t">${nm}</div><div class="s">${fmtN(n.gdp*f)} · ${(f*100).toFixed(2)} % <span>del PIB</span></div></span></button>`).join(''),
        b=>b.querySelectorAll('[data-sz]').forEach(y=>y.onclick=()=>{closeSheet();useNat({t:'Empresa estatal',fn:()=>seFound(n.id,T.k,+y.dataset.sz)});showSE();}));}));}

/* ---------- 🏖️ Secretaría de turismo ---------- */
function tuRank(nid){const L=[];for(const id in G.nations)if(G.nations[id].alive)L.push([id,tuNat(id).arr]);L.sort((a,b)=>b[1]-a[1]);return [L.findIndex(z=>z[0]===nid)+1,L.length,L];}
function tuChips(e){const t=e.at,s=t.s;const C=[];if(s.cn&&s.city>.3)C.push(`🏙️ <span data-noi18n>${s.cn}</span>`);if(s.cap)C.push('🏛️ <span>capital</span>');if(s.beach>=.8)C.push('🏖️ <span>playa</span>');else if(s.beach)C.push('🌊 <span>costa</span>');
  if(typeof NT_BIO!=='undefined'&&NT_BIO[s.bk]&&s.nat>=.3)C.push(`${NT_BIO[s.bk][1]} ${NT_BIO[s.bk][0]}`);if(t.air)C.push(`✈️ <span>nivel</span> ${aeLvl(e.r)}`);if(t.pr)C.push('🏞️ <span>área protegida</span>');if(t.rf)C.push('🌳 <span>reforestación</span>');
  return C.map(c=>`<span class="tuch">${c}</span>`).join('');}
function showTU(){if(!P||!G)return;const n=natOf(P);const o=tuNat(n.id);const rule=playerRules(n.id);const T=(G.tu&&G.tu[n.id])||{v:1,t:0};const [rk,rn,RL]=tuRank(n.id);const R0=TU_REAL[n.id];
  let h=`<h3>🏖️ <span>Secretaría de turismo</span></h3>`+v19Tiles([['Llegadas al año',fmtM(o.arr),'turistas internacionales'],['Gasto de los turistas',fmtN(o.rec),'al año'],
    ['Peso en la economía',(o.rec/Math.max(1,n.gdp)*100).toFixed(1)+' %','del PIB'],['Gasto por visitante',fmtN(o.sp),''],['Lugar en el mundo',`${rk} / ${rn}`,'por llegadas'],
    ['Efecto de las políticas',tuPct(o.po.all-1),'campaña, visado, tasa, aeropuertos y áreas protegidas',o.po.all>=1?'var(--teal)':'var(--red)']],2);
  h+=`<div class="hint">${R0?`📊 <span>Dato real (aprox.):</span> <b>${R0[0]} M</b> <span>de llegadas y</span> <b>US$${R0[1]} mil M</b> <span>en 2019</span> (${TU_SRC}).`:`📊 <span>Sin dato real en la tabla: llegadas estimadas por población, ingreso y costa.</span>`} <span>Crecen con la economía del mundo; la guerra (−55 %), las sanciones y la inestabilidad las bajan.</span></div>`;
  h+=`<div class="sect">📍 <span>Provincias que más turistas reciben</span></div>`+o.L.slice(0,8).map(e=>`<div class="secd"><div class="t"><b data-noi18n>${RG[e.r].nm}</b> · <b>${fmtM(e.a)}</b> <span>llegadas</span> · ${fmtN(e.rec)}</div><div class="s">${tuChips(e)}</div></div>`).join('');
  const po=o.po;h+=`<div class="sect">🧭 <span>Políticas</span></div>`+v19Tiles([['📣 Campaña',po.camp>1?'+12 %':'—',po.camp>1?`<span>hasta</span> ${n.dv.tur0}`:'sin campaña'],['🛂 Visado',TU_VISA[T.v][0],tuPct(po.visa-1)],
    ['💵 Tasa turística',TU_TAX[T.t][0],T.t?`${tuPct(po.tax-1)} · <span>al tesoro</span> ${fmtN(o.rec*TU_TAX[T.t][2])}`:''],['✈️ Aeropuertos',tuPct(po.air-1),'conectividad'],['🏞️ Áreas protegidas',String(po.k),tuPct(po.prot-1)]],2);
  if(rule){const can=P.nat>0&&!blockedTurn();const cc=n.gdp*.03/100;
    h+=`<div class="secd"><div class="t">📣 <span>Campaña de promoción internacional</span></div><div class="s"><span>+12 % de llegadas por 3 años</span> · ${fmtN(cc)}</div><div class="ac"><button class="btn" id="tuCamp" ${can&&po.camp===1&&(n.treas||0)>=cc?'':'disabled'}>${po.camp>1?'<span>En marcha</span>':'📣 <span>Lanzar</span>'}</button></div></div>`;
    h+=`<div class="secd"><div class="t">🛂 <span>Visado para turistas</span></div><div class="s"><span>Libre: más llegadas. Estricto: menos llegadas y +0.5 de estabilidad al año.</span></div><div class="seg">${TU_VISA.map(([nm,f],i)=>`<button data-tuv="${i}" class="${T.v===i?'on':''}" ${can&&T.v!==i?'':'disabled'}>${nm} ${tuPct(f-1)}</button>`).join('')}</div></div>`;
    h+=`<div class="secd"><div class="t">💵 <span>Tasa turística</span></div><div class="s"><span>Lo que cobra al tesoro contra los turistas que espanta.</span></div><div class="seg">${TU_TAX.map(([nm,f,x],i)=>`<button data-tut="${i}" class="${T.t===i?'on':''}" ${can&&T.t!==i?'':'disabled'}>${nm}${x?' '+Math.round(x*1000)/10+' %':''}</button>`).join('')}</div></div>`;
    const pa=o.L.filter(e=>{try{return ntPjCan(e.r,'aprot').ok;}catch(q){return false;}}).slice(0,3);
    if(pa.length)h+=`<div class="sect">🏞️ <span>Áreas protegidas (atraen turistas y cuidan el ecosistema)</span></div>`+pa.map(e=>`<button class="item" data-tup="${e.r}" ${can&&(n.treas||0)>=ntPjCost(e.r,'aprot')?'':'disabled'}><span><div class="t">🏞️ <b data-noi18n>${RG[e.r].nm}</b></div><div class="s">${fmtN(ntPjCost(e.r,'aprot'))} · <span>tarda</span> ${NT_PJ.aprot.m} <span>meses</span></div></span></button>`).join('');
    const pb=o.L.filter(e=>aeCan(e.r).ok).slice(0,3);
    if(pb.length)h+=`<div class="sect">✈️ <span>Aeropuertos en las provincias más visitadas</span></div>`+pb.map(e=>`<button class="item" data-tua="${e.r}" ${(n.treas||0)>=aeCost(e.r)?'':'disabled'}><span><div class="t">✈️ <b data-noi18n>${RG[e.r].nm}</b> · <span>nivel</span> ${aeLvl(e.r)} → ${aeLvl(e.r)+1}</div><div class="s">${fmtN(aeCost(e.r))}</div></span></button>`).join('');}
  else h+=`<div class="hint">Solo quien gobierna decide las políticas de turismo.</div>`;
  const B2=bzList(P).filter(b=>b.v14&&G.regions[b.r]&&(bzT(b).d==='tour'||b.k==='taxis'));
  if(B2.length)h+=`<div class="sect">⭐ <span>Tus empresas que viven del turismo</span></div>`+B2.map(b=>{const f=bzT(b).d==='tour'?tuProvF(b.r)*tuEcoR(b.r):tuBizF(b);return `<div class="lgev">${bzT(b).ic} <b data-noi18n>${clean(b.n)}</b> · <span data-noi18n>${RG[b.r].nm}</span> · <span>demanda por turismo</span> <b class="${f>=1?'up':'dn'}">${pctV(f-1)}</b></div>`;}).join('');
  h+=`<div class="sect">🌐 <span>Países con más turistas</span></div>`+RL.slice(0,10).map(([id,a],i)=>`<div class="lgev">${i+1}. ${flag(id,11)} <span>${G.nations[id].name}</span> · <b>${fmtM(a)}</b></div>`).join('');
  h+=`<div class="hint"><span>Cada provincia atrae según su ciudad más grande, si es capital, su costa, su naturaleza, su aeropuerto y sus áreas protegidas o bosques reforestados.</span> <span>El gasto de los turistas mueve tus hoteles, bares, joyerías y taxis: más en las provincias que viven del turismo.</span></div>`;
  openSheetRaw(h,B=>{const go=(t,fn)=>{useNat({t,fn});TUS.v++;showTU();};
    const c=B.querySelector('#tuCamp');if(c)c.onclick=()=>go('Campaña turística',()=>{tuEnsure(n.id);return minDirective(n,'tur',0,true);});
    B.querySelectorAll('[data-tuv]').forEach(x=>x.onclick=()=>go('Visado',()=>tuSet(n.id,'v',+x.dataset.tuv)));
    B.querySelectorAll('[data-tut]').forEach(x=>x.onclick=()=>go('Tasa turística',()=>tuSet(n.id,'t',+x.dataset.tut)));
    B.querySelectorAll('[data-tup]').forEach(x=>x.onclick=()=>go('Área protegida',()=>{tuEnsure(n.id);return ntPjBuild(x.dataset.tup,'aprot');}));
    B.querySelectorAll('[data-tua]').forEach(x=>x.onclick=()=>{const t=aeBuildDo(x.dataset.tua);toast('✈️',t);log(t,'good');TUS.v++;save();render();showTU();});
    try{v21bLrn('Turismo');}catch(e){}});}

/* ---------- botones: País → Economía y País → Gabinete ---------- */
function v24cBtns(){const n=natOf(P);const S=seEnsure();const L=S.L.filter(e=>e.n===n.id);const t=(S.t&&S.t[n.id])||[0];const o=tuNat(n.id);
  return `<div class="sect">🏛️ <span>Estado empresario y turismo</span></div>`+v19Tiles([['Empresas estatales',String(L.length),L.length?`${t[0]>=0?'+':'−'}${fmtN(Math.abs(t[0]))} <span>al tesoro</span>`:''],['Turistas al año',fmtM(o.arr),fmtN(o.rec)]],2)+
   `<div class="v24cb"><button class="btn" data-v24c="se">🏛️ <span>Inversiones</span></button><button class="btn" data-v24c="tu">🏖️ <span>Turismo</span></button></div>`;}
function v24cBind(d){d.querySelectorAll('[data-v24c]').forEach(x=>x.onclick=()=>x.dataset.v24c==='se'?showSE():showTU());}
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(P&&G&&VIEW.v==='pa'&&(VIEW.tab==='eco'||VIEW.tab==='gab')){const body=$('natBody');if(body&&!body.querySelector('#v24cpa')){
  const d=document.createElement('div');d.id='v24cpa';d.innerHTML=v24cBtns();body.append(d);v24cBind(d);}}}catch(e){console.warn('v24c país',e);}return r;};}

/* ---------- bolsa: qué parte del PIB representa cada empresa ---------- */
{const _ss=showStock;showStock=function(id,...a){const r=_ss(id,...a);try{mrStock(id);}catch(e){console.warn('v24c bolsa',e);}return r;};showStock._shk=1;}
function mrStock(id){const B=$('sheetIn');if(!B||B.querySelector('#mrst'))return;const q=mrRep(id);if(!q)return;const c=G.mk.C[id];const nm=G.nations[q.nid]?G.nations[q.nid].name:q.nid;
  const e=c.se&&G.se?G.se.L.find(z=>z.id===c.se):null;const d=document.createElement('div');d.id='mrst';
  d.innerHTML=`<div class="sect">🌐 <span>Lo que representa en la economía</span></div>`+v19Tiles([['Del PIB de '+nm,(q.rep*100).toFixed(1)+' %',`${q.n} <span>empresa(s) de su sector</span>`],['Su sector',(q.sec*100).toFixed(1)+' %',SECT[c.sec][0]+' · <span>del PIB</span>'],
    ['Empresas en la bolsa',String(q.N),`<span>cubren</span> ${Math.round(q.cov*100)} % <span>del PIB por sector</span>`]],2)+
   `<div class="hint">${e?`🏛️ <span>Empresa estatal: el Estado conserva el 70 % y su utilidad sigue la de</span> <span data-noi18n>${clean(e.nm)}</span>. `:''}<span>Cada empresa que cotiza representa su sector en el PIB de su país; su utilidad sube cuando la salud de su sector está sobre 50 y baja cuando está debajo.</span></div>`;B.append(d);}

/* ---------- glosario, ⓘ, Guía y «¿Sabías que…?» ---------- */
(function(){const c=GLC.indexOf('Economía del país');GLOS.push(
 ['Empresa estatal','Empresa cuyo dueño es el gobierno. Su ganancia entra al tesoro y su pérdida la paga el tesoro; puede venderse a privados (privatizar) o salir a la bolsa.',['empresa estatal','empresas estatales','paraestatal'],c>=0?c:0],
 ['Privatizar','Vender una empresa del Estado a dueños privados. El gobierno recibe dinero una vez y deja de recibir (o de pagar) su resultado cada año.',['privatizar','privatización','privatiza'],c>=0?c:0],
 ['Turismo internacional','Visitantes que llegan de otro país y gastan en hoteles, restaurantes, transporte y compras: para la economía es como una exportación.',['turismo','turistas'],c>=0?c:0]);})();
(function(){const H=[
 ['Secretaría de inversiones','🏛️ Secretaría de inversiones','Muchos países tienen empresas del Estado en petróleo, electricidad, bancos de fomento o transporte. Pueden dar empleo y servicios estratégicos, pero si pierden dinero lo paga el tesoro.','El tesoro pone el capital (0.03 %, 0.1 % o 0.3 % del PIB) y un presupuesto anual (0 %, 3 % o 6 % del capital; el 70 % se vuelve capital y mueve la eficiencia). Ventas = capital ÷ intensidad de capital del giro × demanda (salud del sector y prosperidad de la provincia) × √eficiencia. El resultado va al tesoro. Mueve la salud de su sector (centrado en la rentabilidad), el empleo y el PIB de su provincia (valor agregado × 0.5). Con 2 años de margen bajo −5 % entra en quiebra.'],
 ['Secretaría de turismo','🏖️ Secretaría de turismo','En 2019 llegaron cerca de 1,460 millones de turistas internacionales en el mundo y gastaron alrededor de 1.5 billones de dólares (OMT). Francia, España y EE. UU. reciben más visitantes; EE. UU. es el que más ingresa.','Llegadas = dato de 2019 (aprox.) × crecimiento del mundo × políticas × condiciones (guerra, sanciones, estabilidad). Se reparten por provincia según sus atractivos (ciudad, capital, costa, naturaleza, aeropuerto, área protegida). Tus hoteles, bares y joyerías venden según la intensidad turística de su provincia contra su país (0.8–1.3) y las políticas (0.85–1.2).'],
 ['Red aérea','✈️ Red aérea','El avión mueve menos del 1 % del peso del comercio mundial, pero cerca de un tercio de su valor: lo urgente, lo perecedero y lo caro. El combustible es una de sus mayores costos.','Aeropuertos base en capitales y ciudades de 1 millón o más (nivel 1–3) y los que construyas. Rutas por gravedad (población × ingreso ÷ distancia). Flete aéreo = 10 % + 4 % por distancia, × precio del petróleo contra su tendencia. Más conectividad que la de partida abarata lo importado en Comercio minorista y Lujo y atrae turistas.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🏛️ Estado empresario y turismo',`<b>El gobierno también puede ser empresario y vender el país al mundo.</b>
<ul><li><b>🏛️ Inversiones</b> (País → Economía o Gabinete): funda empresas estatales de cualquier giro que tu país pueda sostener, ponles presupuesto, invierte, recorta, privatízalas (a un grupo privado o a ti) o sácalas a la bolsa. Su resultado entra o sale del tesoro.</li>
<li><b>🏖️ Turismo</b>: cuántos turistas llegan a tu país y a cada provincia, cuánto gastan y por qué vienen. Lanza una campaña, cambia el visado o la tasa turística, declara áreas protegidas y construye aeropuertos.</li>
<li><b>✈️ Red aérea</b> (🚚 Logística): aeropuertos, rutas con pasajeros y el costo del avión, que sube con el petróleo. En el mapa, las rutas aéreas son arcos punteados con aviones.</li>
<li><b>📈 Bolsa:</b> cada país tiene más o menos empresas en bolsa según su PIB, y cada una representa una parte de su economía.</li></ul>`];
 const gi=GUIA.findIndex(g=>/^🚚 Logística/.test(g[0]));GUIA.splice(gi>=0?gi+1:GUIA.length,0,T);})();
SABIAS.push(
 ['Francia es el país que más turistas internacionales recibe (unos 89 millones en 2019), pero EE. UU. es el que más ingresa por turismo.','OMT, Barómetro del Turismo Mundial','eco'],
 ['El transporte aéreo lleva menos del 1 % del volumen del comercio mundial, pero alrededor de un tercio de su valor.','IATA','eco']);
if(typeof shWrapAll==='function')shWrapAll();
