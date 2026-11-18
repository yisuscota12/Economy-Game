/* ===== v1.7r (etapa C del plan): box y MMA a fondo — interfaz =====
   Pestañas nuevas Escuela y Negocios en el panel del peleador; bloques de entrenamiento y sesiones especiales en Entrenar; récord amateur completo
   y estadísticas de carrera en Trayectoria; radar comparativo en ofertas, ficha y pelea programada; estadísticas en vivo y gráfica por round en la
   noche de pelea; gimnasio propio y promotora propia (también después del retiro, desde el menú Carrera). */
(function(){const st=document.createElement('style');st.textContent=`
.cb7bar{height:8px;border-radius:5px;background:#0e141c;overflow:hidden;margin:3px 0 2px}.cb7bar i{display:block;height:100%;border-radius:5px}
.cb7g{display:grid;grid-template-columns:1fr auto;gap:2px 8px;font-size:12.5px;align-items:center}
.cb7card{border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:6px 0;background:var(--card2)}
.cb7card h4{margin:0 0 4px;font-size:14px}.cb7card .s{color:var(--mut);font-size:12px}
.cb7lv{margin:6px 0}.cb7lv summary{cursor:pointer;font-weight:800;font-size:13px;padding:4px 0}
.cb7lv table{width:100%;border-collapse:collapse;font-size:12px;font-variant-numeric:tabular-nums}.cb7lv td{padding:2px 4px;border-bottom:1px solid #1f2b3a}.cb7lv td:nth-child(2),.cb7lv td:nth-child(3){text-align:center;font-weight:700}
.cb7lv td:nth-child(2){color:#5fa8ff}.cb7lv td:nth-child(3){color:#ff7b6b}
.cb7rad{display:flex;flex-direction:column;align-items:center}.cb7leg{font-size:11px;color:var(--mut);text-align:center}.cb7leg b.a{color:#5fa8ff}.cb7leg b.b{color:#ff7b6b}
.cb7chk{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}.cb7chk span{font-size:11.5px;border:1px solid var(--line);border-radius:10px;padding:2px 7px}.cb7chk span.ok{border-color:#3ccf8e;color:#3ccf8e}
.cb7am td{font-size:11.5px}
`;document.head.appendChild(st);})();
const CB7={int:1,osch:null,mi:0,ttl:-1,tk:1,plan:null};

/* ----- gráficos ----- */
function cbRadar2(labels,a,b,o){o=o||{};const n=labels.length;if(n<3)return '';const S=o.size||190,cx=S/2,cy=S/2+2,R=S/2-32;
  const pt=(i,v)=>{const g=-Math.PI/2+i*2*Math.PI/n,r=R*clamp(v/100,0,1);return [cx+Math.cos(g)*r,cy+Math.sin(g)*r];};const P=v=>v.map((x,i)=>pt(i,x).map(q=>q.toFixed(1)).join(',')).join(' ');
  let g='';for(const f of [.25,.5,.75,1])g+=`<polygon points="${P(labels.map(()=>100*f))}" fill="none" stroke="rgba(255,255,255,${f===1?.22:.1})"/>`;
  g+=labels.map((_,i)=>{const [x,y]=pt(i,100);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.1)"/>`;}).join('');
  if(b)g+=`<polygon points="${P(b)}" fill="#ef6b5b" fill-opacity=".2" stroke="#ef6b5b" stroke-width="1.8" stroke-linejoin="round"${o.est?' stroke-dasharray="4 3"':''}/>`;
  g+=`<polygon points="${P(a)}" fill="#3b82f6" fill-opacity=".25" stroke="#5fa8ff" stroke-width="2" stroke-linejoin="round"/>`;
  g+=labels.map((l,i)=>{const t=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(t)*(R+10),y=cy+Math.sin(t)*(R+10);const an=Math.abs(Math.cos(t))<.3?'middle':Math.cos(t)>0?'start':'end';const dy=Math.sin(t)>.3?9:Math.sin(t)<-.3?-3:3.5;
    return `<text x="${x.toFixed(1)}" y="${(y+dy).toFixed(1)}" text-anchor="${an}" font-size="10" fill="var(--mut,#9fb3cc)">${l}</text><text x="${x.toFixed(1)}" y="${(y+dy+11).toFixed(1)}" text-anchor="${an}" font-size="10" font-weight="800"><tspan fill="#5fa8ff">${Math.round(a[i])}</tspan>${b?`<tspan fill="#9fb3cc"> · </tspan><tspan fill="#ff7b6b">${Math.round(b[i])}</tspan>`:''}</text>`;}).join('');
  return `<div class="cb7rad"><svg viewBox="0 0 ${S} ${S+8}" width="${S}" height="${S+8}" style="overflow:visible">${g}</svg>${o.leg?`<div class="cb7leg">${o.leg}</div>`:''}</div>`;}
function cbRadarVs(p,op,exact){const sp=cbSp(p);const me=cbAtEff(p);const ob=op.at.map(v=>exact?v:Math.round(v/5)*5);
  return cbRadar2(CB_AT[sp],me,ob,{est:!exact,leg:exact?'Azul: tú. Rojo: tu rival (datos exactos del análisis de video).':'Azul: tú. Rojo: tu rival (estimado por video, redondeado a 5).'});}
// barras por round: golpes conectados (o significativos) de cada lado; las caídas se marcan con un punto
function cbRoundsChart(S){const n=S.st.length;if(!n)return '';const mx=Math.max(8,...S.st.map(s=>Math.max(s[0].ln,s[1].ln)));const W=320,H=96,bw=Math.min(12,(W-24)/n/2.6);
  let g=`<line x1="14" y1="${H-14}" x2="${W-4}" y2="${H-14}" stroke="rgba(255,255,255,.2)"/>`;
  S.st.forEach((s,i)=>{const x=18+i*(W-24)/n;const h0=(H-26)*s[0].ln/mx,h1=(H-26)*s[1].ln/mx;
    g+=`<rect x="${x.toFixed(1)}" y="${(H-14-h0).toFixed(1)}" width="${bw.toFixed(1)}" height="${h0.toFixed(1)}" rx="1.5" fill="#5fa8ff"/><rect x="${(x+bw+1).toFixed(1)}" y="${(H-14-h1).toFixed(1)}" width="${bw.toFixed(1)}" height="${h1.toFixed(1)}" rx="1.5" fill="#ff7b6b"/>`;
    if(s[0].kd)g+=`<circle cx="${(x+bw/2).toFixed(1)}" cy="${(H-18-h0-4).toFixed(1)}" r="2.6" fill="#f2c14e"/>`;if(s[1].kd)g+=`<circle cx="${(x+bw*1.5+1).toFixed(1)}" cy="${(H-18-h1-4).toFixed(1)}" r="2.6" fill="#f2c14e"/>`;
    g+=`<text x="${(x+bw).toFixed(1)}" y="${H-3}" text-anchor="middle" font-size="9" fill="var(--mut,#9fb3cc)">${i+1}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:360px;display:block;margin:2px auto">${g}</svg>`;}
function cbLiveHTML(S,open){const sp=S.sp;const T=cbTotals(S);const pc=(a,b)=>Math.round(a/Math.max(1,b)*100)+' %';const r=(l,a,b)=>`<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
  const bd=k=>S.st.reduce((s,x)=>s+(x[k].bd||0),0);let rows='';
  if(sp==='box')rows=r('Golpes conectados',T[0].ln+'/'+T[0].th,T[1].ln+'/'+T[1].th)+r('Efectividad',pc(T[0].ln,T[0].th),pc(T[1].ln,T[1].th))+r('Golpes de poder',T[0].pln+'/'+T[0].pth,T[1].pln+'/'+T[1].pth)+r('Jabs',(T[0].ln-T[0].pln)+'/'+(T[0].th-T[0].pth),(T[1].ln-T[1].pln)+'/'+(T[1].th-T[1].pth))+r('Caídas provocadas',T[0].kd,T[1].kd);
  else rows=r('Golpes significativos',T[0].ln+'/'+T[0].th,T[1].ln+'/'+T[1].th)+r('Efectividad',pc(T[0].ln,T[0].th),pc(T[1].ln,T[1].th))+r('Derribos',T[0].td+'/'+T[0].tda,T[1].td+'/'+T[1].tda)+r('Tiempo de control',Math.floor(T[0].ctl/60)+':'+String(T[0].ctl%60).padStart(2,'0'),Math.floor(T[1].ctl/60)+':'+String(T[1].ctl%60).padStart(2,'0'))+r('Intentos de sumisión',T[0].sa,T[1].sa)+r('Caídas provocadas',T[0].kd,T[1].kd);
  if(bd(0)||bd(1))rows+=r(sp==='box'?'Desgaste por golpes al cuerpo':'Desgaste por patadas bajas',Math.round(bd(0)),Math.round(bd(1)));
  const A=S.f[0],B=S.f[1];
  return `<details class="cb7lv"${open?' open':''}><summary>📊 Estadísticas en vivo</summary><table><tr><td></td><td>${cbSur({n:A.n})}</td><td>${cbSur(B)}</td></tr>${rows}</table>
   <div class="cb7leg"><span>${sp==='box'?'Golpes conectados por round':'Golpes significativos por round'}</span> <b class="a">■</b> <span>${cbSur({n:A.n})}</span> <b class="b">■</b> <span>${cbSur(B)}</span> <b style="color:#f2c14e">●</b> <span>caída</span></div>${cbRoundsChart(S)}
   <details class="cb7lv"><summary>📊 Radar de la pelea</summary>${cbRadar2(CB_AT[sp],A.at,B.at,{leg:'Atributos en la pelea (con escuela, estilo, campamento y cansancio inicial).'})}</details></details>`;}

/* ----- noche de pelea: estadísticas en vivo y gráfica por round ----- */
{const _r=cbRoundUI;cbRoundUI=function(){_r();try{const c=cbC(P),S=c&&c.live;const m=document.querySelector('#modal .dlg.fn');if(S&&m&&S.rd>0){const cor=m.querySelector('.cor');if(cor)cor.insertAdjacentHTML('beforebegin',cbLiveHTML(S,true));}}catch(e){console.warn('cb17 round',e);}};}
{const _r=cbResultUI;cbResultUI=function(){const c=cbC(P),S=c&&c.live;_r();try{const m=document.querySelector('#modal .dlg.fn');const fin=m&&m.querySelector('.fin');if(S&&fin&&fin.previousElementSibling){
    const sp=S.sp;fin.previousElementSibling.insertAdjacentHTML('beforebegin',`<div class="cb7leg"><span>${sp==='box'?'Golpes conectados por round':'Golpes significativos por round'}</span> <b class="a">■</b> <span>tú</span> <b class="b">■</b> <span>${cbSur(S.f[1])}</span> <b style="color:#f2c14e">●</b> <span>caída</span></div>${cbRoundsChart(S)}<details class="cb7lv"><summary>📊 Radar de la pelea</summary>${cbRadar2(CB_AT[sp],S.f[0].at,S.f[1].at,{leg:'Atributos en la pelea (con escuela, estilo, campamento y cansancio inicial).'})}</details>`);}}catch(e){console.warn('cb17 res',e);}};}
// en el plan de pelea: lo que aporta el campamento, el análisis de video y tu escuela
{const _n=cbNight;cbNight=function(){_n();try{const c=cbC(P),o=c&&c.fight;const m=document.querySelector('#modal .dlg');if(!o||!m||o.step!=='plan'||c.live)return;const op=cbF(o.o);if(!op)return;const t=m.querySelector('.txt');if(!t)return;
  t.insertAdjacentHTML('afterend',cbCampHTML(P,o)+cbRadarVs(P,op,!!o.vid));}catch(e){console.warn('cb17 plan',e);}};}

/* ----- campamento, ofertas, ficha ----- */
function cbCampHTML(p,o){const cp=o.cp||{f:0,t:0,s:0,a:0,l:''};const cs=cbCampScore(o);const c=p.fc.cb;const ok=(b,t)=>`<span class="${b?'ok':''}"><b>${b?'✅':'⬜'}</b> ${t}</span>`;
  return `<div class="cb7card"><h4>🎯 Campamento por bloques · ${cs}/5</h4><div class="cb7chk">${ok(cp.f,'Físico')}${ok(cp.t,'Técnica')}${ok(cp.s,'Sparring')}${ok(cp.l==='a','Afinamiento al final')}${ok((cp.f+cp.t+cp.s+cp.a)>=4,'4 bloques o más')}</div>
   <div class="s"><span>Cada punto suma energía al empezar la pelea; con 4 o más también técnica.</span> <span>${o.vid?'Análisis de video hecho.':'Sin análisis de video.'}</span>${c.psi?' <span>Psicólogo: listo.</span>':''}${c.nut?' <span>Plan de peso: listo.</span>':''}${o.pw?` <span>Corte de peso controlado: ${o.pw}.</span>`:''}${o.alt?' <span>Campamento en altura.</span>':''}</div></div>`;}
{const _f=cbFightCard;cbFightCard=function(p){const h=_f(p);try{const o=p.fc.cb.fight;const op=o&&cbF(o.o);if(!op)return h;return h+cbCampHTML(p,o)+`<details class="cb7lv"><summary>📊 Comparar en radar</summary>${cbRadarVs(p,op,!!o.vid)}</details>`;}catch(e){return h;}};}
{const _o=cbOfferHTML;cbOfferHTML=function(p,o,i){const h=_o(p,o,i);try{const op=cbF(o.o);if(!op)return h;let x='';
    if(o.bid)x+=`<div class="hint" style="margin:4px 0 0;color:#f2c14e">⚖️ Subasta de bolsa: ${cbUSD(o.bid)} · te toca ${Math.round(o.sh*100)} %. El resultado de una subasta no se negocia.</div>`;
    if(o.mk&&o.mk!==1)x+=`<div class="hint" style="margin:2px 0 0;font-size:11.5px">Mercado de ${natOf(p).name}: las bolsas de las funciones locales y nacionales pagan ×${o.mk.toFixed(2)} frente a EE. UU.</div>`;
    x+=`<details class="cb7lv"><summary>📊 Comparar en radar</summary>${cbRadarVs(p,op,false)}</details>`;return h.replace(/<\/div>\s*$/,x+'</div>');}catch(e){return h;}};}
{const _fc=cbFighterCard;cbFighterCard=function(id){_fc(id);try{if(id==='P'||!cbC(P))return;const x=cbF(id);const m=document.querySelector('#modal');const at=m&&m.querySelector('.atb');if(!x||!at)return;const o=P.fc.cb.fight;
    const sk=cbSchK(G.cb.sp,cbSchF(x));at.insertAdjacentHTML('afterend',(sk?`<div class="hint">Escuela: <b>${sk.n}</b></div>`:'')+cbRadarVs(P,x,!!(o&&o.o===id&&o.vid)));}catch(e){console.warn('cb17 ficha',e);}};}

/* ----- panel del peleador: pestañas nuevas e inserciones ----- */
const CB7TABS=[['esc','Escuela'],['neg','Negocios']];
{const _s=showCB;showCB=function(tab){if(tab)CBV.tab=tab;const t=CBV.tab;const mine=CB7TABS.some(x=>x[0]===t);if(mine)CBV.tab='__x';let r;try{r=_s();}finally{CBV.tab=t;}
  try{const b=$('sheetIn');const p=P;const c=p&&p.fc&&p.fc.cb;if(!b||!c)return r;cbR17(p);const nt=b.querySelector('.ntabs');
    if(nt&&!nt.querySelector('[data-t7]')){nt.insertAdjacentHTML('beforeend',CB7TABS.map(([k,n])=>`<button data-t7="${k}" class="${t===k?'on':''}">${n}</button>`).join(''));
      nt.querySelectorAll('[data-t7]').forEach(x=>x.onclick=()=>{CBV.tab=x.dataset.t7;showCB();});if(mine)nt.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('on'));}
    if(mine){while(nt&&nt.nextSibling)nt.nextSibling.remove();nt.insertAdjacentHTML('afterend',t==='esc'?cbEscHTML(p):cboHTML(p));if(t==='esc')cbEscBind(b);else cboBind(b,()=>showCB());}
    else if(t==='ent')cbEntInsert(b,p);else if(t==='tra')cbTraInsert(b,p);else if(t==='pel')cbPelInsert(b,p);}catch(e){console.warn('cb17 panel',e);}return r;};showCB._shk=1;}
const cb7it=(code,s,ok,lab,lock)=>`<button class="item" data-x7="${code}" ${ok?'':'disabled'}><span><div class="t">${lab}</div><div class="s">${s}${!ok&&lock?` · 🔒 ${lock}`:''}</div></span></button>`;
const cb7can=t=>!(P.fc&&fcCanAct(P))&&!P.event&&canAfford(t);
function cb7days(t){const k=actCost(t);return k===1?`⏳ ${k} día`:`⏳ ${k} días`;}
function cbFatHTML(c){const f=Math.round(c.fat||0);const col=f>70?'#ff5a5a':f>45?'#f2a33a':'#3ccf8e';return `<div class="cb7g"><span>Fatiga</span><b style="color:${col}">${f}/100</b></div><div class="cb7bar"><i style="width:${f}%;background:${col}"></i></div><div class="hint" style="margin:0 0 6px;font-size:11.5px">La fatiga baja 20 puntos al mes. Arriba de 45 sube el riesgo de lesión; también reduce lo que ganas al entrenar (×${(1-f/200).toFixed(2)}).</div>`;}
function cbPelInsert(b,p){const c=p.fc.cb,sp=cbSp(p);const kv=b.querySelector('.kv');if(!kv)return;const S=cbSchK(sp,cbGymSch(p));const hy=cbHybrid(c);
  kv.insertAdjacentHTML('afterend',`<div class="cb7card">${cbFatHTML(c)}<div class="cb7g"><span>Escuela de tu gimnasio</span><b>${S?S.n:'—'}</b><span>Dominio</span><b>${Math.round(cbSmv(c,S?S.k:''))}/100</b><span>Estilo</span><b>${CB_ST[sp][c.st].n}${hy>=0?' + '+CB_ST[sp][hy].n:''}</b></div></div>`);}
function cbEntInsert(b,p){const c=p.fc.cb,sp=cbSp(p);const nt=b.querySelector('.ntabs');let sec=nt;while(sec&&!(sec.classList&&sec.classList.contains('sect')))sec=sec.nextElementSibling;if(!sec)return;
  let h=`<div class="sect">Bloques de entrenamiento</div>`+cbFatHTML(c)+`<div class="seg">${CB_INT.map((x,i)=>`<button data-i7="${i}" class="${CB7.int===i?'on':''}">${x[0]}</button>`).join('')}</div>
   <div class="hint" style="font-size:11.5px">Un bloque son dos semanas de trabajo enfocado en varias cualidades a la vez. Ligera: ×0.7 de ganancia, la mitad de fatiga y menos de la mitad del riesgo. Dura: ×1.3 de ganancia, ×1.7 de fatiga y el doble de riesgo.${c.fight?' Los bloques que hagas ahora cuentan para el campamento de tu pelea.':''}</div>`;
  if(c.fight)h+=cbCampHTML(p,c.fight);
  h+=cbBlkL(sp).map((B,j)=>{const x=cbBlkPreview(p,j,CB7.int);const top=x.gain.map((v,i)=>[v,i]).filter(z=>z[0]>.05).sort((a,b)=>b[0]-a[0]).slice(0,3).map(([v,i])=>`${CB_ATI[sp][i]} +${v.toFixed(1)}`).join(' ');
    const fat=x.fat<0?`fatiga ${Math.round(x.fat)}`:`fatiga +${Math.round(x.fat)}`;return cb7it('bk'+j,`${cb7days('⭐ Bloque')} · ${top?top+' · ':''}${fat}${x.inj>0?` · lesión ${Math.max(1,Math.round(x.inj*100))} %`:''} · ${B[2]}`,cb7can('⭐ Bloque'),`🏋️ ${B[1]}`);}).join('');
  h+=`<div class="sect">Sesiones especiales</div>`+CB_SES.filter(S=>!S[6]||S[6]===sp).map(S=>{const rq=cbSesReq(P,S[0]);const t='⭐ Sesión: '+S[1];return cb7it('se'+S[0],`${cb7days(t)} · ${fmt(cbSesCost(p,S[0]))} · ${S[2]}`,cb7can(t)&&!rq,`🎓 ${S[1]}`,rq);}).join('');
  sec.insertAdjacentHTML('beforebegin',h);
  b.querySelectorAll('[data-i7]').forEach(x=>x.onclick=()=>{CB7.int=+x.dataset.i7;showCB();});
  b.querySelectorAll('[data-x7^="bk"]').forEach(x=>x.onclick=()=>{const j=+x.dataset.x7.slice(2);cbDo('⭐ Bloque',()=>cbBlock(P,j,CB7.int),'ent');});
  b.querySelectorAll('[data-x7^="se"]').forEach(x=>x.onclick=()=>{const k=x.dataset.x7.slice(2);const S=cbSesK(k);cbDo('⭐ Sesión: '+S[1],()=>cbSession(P,k),'ent');});}
function cbTraInsert(b,p){const c=p.fc.cb,sp=cbSp(p);const am=c.am;let h='';const s=c.cs;
  if(s&&s.f){const pc=(a,b2)=>Math.round(a/Math.max(1,b2)*100)+' %';const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;
    h+=`<div class="sect">Estadísticas de carrera</div><div class="kv">${kv('Peleas registradas',String(s.f))+kv('Rounds peleados',String(s.rd))+kv(sp==='box'?'Golpes conectados':'Golpes significativos',`${fmtK(s.ln)}/${fmtK(s.th)}`)+kv('Efectividad',pc(s.ln,s.th))+
      kv('Golpes recibidos',`${fmtK(s.rln)}/${fmtK(s.rth)}`)+kv('Defensa (golpes evitados)',pc(s.rth-s.rln,s.rth))+(sp==='box'?kv('Golpes de poder',`${fmtK(s.pln)}/${fmtK(s.pth)}`):kv('Derribos',`${s.td}/${s.tda}`)+kv('Tiempo de control',Math.floor(s.ctl/60)+' min')+kv('Intentos de sumisión',String(s.sa)))+
      kv('Caídas provocadas',String(s.kd))+kv('Caídas recibidas',String(s.kdr))+kv('Golpes por round',(s.th/Math.max(1,s.rd)).toFixed(1))}</div>`;}
  if(am&&(am.w+am.l)){const rk=c.pro?'':` · ranking nacional #${cbAmRank(c)} · ${am.pt} puntos${cbSelOn(c)?' · selección nacional':''}`;
    const byY={};for(const x of am.h){const y=x[0];byY[y]=byY[y]||[0,0,0];byY[y][x[3]==='W'?0:1]++;if(x[3]==='W'&&x[4]!=='DEC')byY[y][2]++;}
    const ko=am.h.filter(x=>x[3]==='W'&&x[4]!=='DEC').length,dec=am.h.filter(x=>x[3]==='W'&&x[4]==='DEC').length;
    h+=`<div class="sect">Récord amateur completo</div><div class="hint">${am.w}-${am.l} (${Math.round(am.w/Math.max(1,am.w+am.l)*100)} % de victorias)${rk}${am.bec?` · beca recibida ${fmt(am.bec)}`:''}<br>${sp==='box'?`Victorias registradas: ${ko} por RSC y ${dec} por decisión.`:`Victorias registradas: ${ko} por sumisión o detención y ${dec} por decisión.`}</div>`;
    const ys=Object.keys(byY).sort();if(ys.length)h+=`<table class="rkt cb7am"><tr><td></td><td>Año</td><td class="r">G-P</td><td class="r">Antes del límite</td></tr>${ys.reverse().map(y=>`<tr><td></td><td>${y}</td><td class="r">${byY[y][0]}-${byY[y][1]}</td><td class="r">${byY[y][2]}</td></tr>`).join('')}</table>`;
    if(am.h.length)h+=`<details class="cb7lv"><summary>Últimos combates amateur</summary><table class="rkt cb7am">${am.h.slice(-15).reverse().map(x=>`<tr><td style="color:${x[3]==='W'?'#3ccf8e':'#ff5a5a'}">${x[3]==='W'?'G':'P'}</td><td>${flag(x[2],11)} ${x[1]}<div style="font-size:11px;color:var(--mut)">${x[0]} · ${x[5]>=0&&CB_AMT[sp][x[5]]?CB_AMT[sp][x[5]][0]:'Pelea amateur'} · ${x[4]==='RSC'?'RSC':x[4]==='SUB'?'sumisión':'decisión'}</div></td><td class="r" colspan="2">${x[6]} %</td></tr>`).join('')}</table></details>`;}
  if(!h)return;const rt=b.querySelector('#fcRet');if(rt)rt.insertAdjacentHTML('beforebegin',h);else b.insertAdjacentHTML('beforeend',h);}

/* ----- pestaña Escuela: escuelas, dominio y estilos ----- */
function cbEscHTML(p){const c=cbR17(p),sp=cbSp(p);const gs=cbGymSch(p);const d=cbPlayerDelta(p);let h='';
  h+=`<div class="hint">Cada gimnasio enseña una escuela. Entrenar ahí sube tu dominio de esa escuela (0–100): cambia cuánto sube cada atributo al entrenar y te da ventajas en la pelea. Tus dos escuelas con más dominio cuentan (la segunda a la mitad). Las que no practicas bajan 2 puntos al año.</div>`;
  const fx=d.map((v,i)=>[v,i]).filter(z=>Math.abs(z[0])>=.5).map(([v,i])=>`${CB_ATI[sp][i]} ${v>0?'+':''}${Math.round(v*10)/10}`).join(' ');
  h+=`<div class="cb7card"><div class="cb7g"><span>Hoy en la pelea</span><b>${fx||'—'}</b></div></div><div class="sect">Escuelas</div>`;
  h+=cbSchL(sp).map(S=>{const m=cbSmv(c,S.k);const tr=S.tr.map((v,i)=>[v,i]).filter(z=>z[0]>1.03).sort((a,b)=>b[0]-a[0]).map(([v,i])=>`${CB_ATI[sp][i]} ×${v.toFixed(2)}`).join(' ');
    const fd=S.fd.map((v,i)=>[v,i]).filter(z=>z[0]>0).map(([v,i])=>`${CB_ATI[sp][i]} +${v}`).join(' ');
    return `<div class="cb7card"><h4>${S.k===gs?'🏠 ':''}${S.n}</h4><div class="s">${S.d}</div><div class="cb7g" style="margin-top:4px"><span>Dominio</span><b>${Math.round(m)}/100</b></div><div class="cb7bar"><i style="width:${m}%;background:#f2c14e"></i></div>
     <div class="s">Entrenamiento: ${tr||'—'} · con dominio 100 en la pelea: ${fd}${S.cu?(sp==='box'?' · golpes al cuerpo que desgastan':' · patadas bajas que desgastan'):''}${S.am?` · ventaja amateur +${Math.round(S.am*5)}`:''}</div>
     <div class="s"><span>Estilos que favorece</span>: ${S.st.map(j=>`<span>${CB_ST[sp][j].n}</span>`).join(', ')}${S.k===gs?' · <span>La enseña tu gimnasio.</span>':''}</div></div>`;}).join('');
  h+=`<div class="hint">Para aprender otra escuela cambia de gimnasio (Trayectoria → Gimnasios: hay academias de cada escuela en el extranjero) o toma una clínica con una leyenda en Entrenar.</div>`;
  const hy=cbHybrid(c);h+=`<div class="sect">Estilos</div><div class="hint">Tu estilo decide tu volumen de golpes, tu plan natural y las ventajas contra otros estilos. La afinidad con cada estilo sube al entrenar lo que ese estilo necesita, con una escuela que lo enseña y al pelear con su plan. Con 60 puedes adoptarlo; con 70 en un segundo estilo peleas como híbrido (técnica +2).${hy>=0?` Ahora eres híbrido: ${CB_ST[sp][c.st].n.toLowerCase()} + ${CB_ST[sp][hy].n.toLowerCase()}.`:''}</div>`;
  h+=CB_ST[sp].map((s,j)=>{const a=Math.round(c.sa[j]||0);const rq=cbStyleReq(p,j);const M=CB_MATCH[sp][j]||[];const good=M.map((v,k)=>v>0?CB_ST[sp][k].n:null).filter(Boolean),bad=M.map((v,k)=>v<0?CB_ST[sp][k].n:null).filter(Boolean);
    return `<div class="cb7card"><h4>${j===c.st?'✅ ':''}${s.n}</h4><div class="s">${s.d}</div><div class="cb7g" style="margin-top:4px"><span>Afinidad</span><b>${a}/100</b></div><div class="cb7bar"><i style="width:${a}%;background:${a>=60?'#3ccf8e':'#5fa8ff'}"></i></div>
     <div class="s">Plan natural: ${CB_PLAN[sp][s.pl]?CB_PLAN[sp][s.pl].n.toLowerCase():'—'}</div>${good.length?`<div class="s"><span>Ventaja contra</span>: ${good.map(x=>`<span>${x}</span>`).join(', ')}</div>`:''}${bad.length?`<div class="s"><span>Sufre contra</span>: ${bad.map(x=>`<span>${x}</span>`).join(', ')}</div>`:''}
     ${j===c.st?'':`<button class="btn" data-st7="${j}" ${rq?'disabled':''} style="width:100%;margin-top:6px;padding:8px">Adoptar este estilo${rq?` · 🔒 ${rq}`:''}</button>`}</div>`;}).join('');
  return h;}
function cbEscBind(b){b.querySelectorAll('[data-st7]').forEach(x=>x.onclick=()=>askText('¿Cambiar de estilo?',null,()=>{const r=cbAdoptStyle(P,+x.dataset.st7);log(r,'good');toast('🥊',r);save();render();showCB();},'Sí, cambiar'));}

/* ----- negocios: gimnasio propio y promotora propia ----- */
function cbNetChart(h){if(!h||!h.length)return '';const v=h.map(x=>x[2]-x[3]);const mx=Math.max(1,...v.map(Math.abs));const W=Math.max(140,h.length*14+10),H=70,z=H/2;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W*1.8}px;display:block;margin:2px auto"><line x1="4" y1="${z}" x2="${W-2}" y2="${z}" stroke="rgba(255,255,255,.2)"/>${v.map((x,i)=>{const hh=Math.abs(x)/mx*(z-6);return `<rect x="${6+i*14}" y="${(x>=0?z-hh:z).toFixed(1)}" width="10" height="${Math.max(1,hh).toFixed(1)}" rx="1.5" fill="${x>=0?'#3ccf8e':'#ff5a5a'}"/>`;}).join('')}</svg>`;}
function cboHTML(p){const W=G.cb;const sp=W&&W.sp;const o=p.cbo||{};const g=o.g,pr=o.pr;const kv=(a,v)=>`<div><span>${a}</span><b>${v}</b></div>`;const u=U(p);let h='';
  h+=`<div class="sect">Gimnasio propio</div>`;
  if(!g){if(!sp)return h+'<div class="hint">Necesitas una carrera de box o MMA para abrir un negocio del combate.</div>';CB7.osch=CB7.osch||cbSchOfNat(sp,natOf(p).id,fullName(p));
    h+=`<div class="hint">Tu propio gimnasio: cobras cuotas a los socios, contratas entrenadores, firmas peleadores que te dejan 10 % de sus bolsas y puedes entrenar ahí. Escoge la escuela que va a enseñar:</div><div class="chips" style="margin-bottom:6px">${cbSchL(sp).map(S=>`<button data-os7="${S.k}" class="${CB7.osch===S.k?'on':''}">${S.n}</button>`).join('')}</div>`;
    h+=CB_OG.map((T,t)=>{const cost=T[1]*u;return cb7it('og'+t,`${fmt(cost)} · renta ${fmt(T[2]*u)} al mes · hasta ${T[3]} socios, ${T[5]} entrenador(es) y ${T[6]} peleadores`,p.dinero>=cost,`🏢 Abrir: ${T[0]}`,`Necesitas ${fmt(cost)}`);}).join('');}
  else{const T=CB_OG[g.t];const live=W&&W.sp===g.sp;const last=g.h[g.h.length-1]||[0,0,0,0];const y12=g.h.slice(-12).reduce((s,x)=>s+x[2]-x[3],0);
    h+=`<div class="cb7card"><h4>🏢 ${g.nm}</h4><div class="kv">${kv('Nivel',T[0])+kv('Escuela',cbSchK(g.sp,g.sch).n)+kv('Socios',`${g.mem} de ${T[3]} (demanda ${Math.round(cbOGDemand(p))})`)+kv('Cuota mensual',fmt(T[4]*g.fm*u))+kv('Reputación',Math.round(g.rep)+'/100')+kv('Equipo',CB_OGEQ[g.eq])+
      kv('Ingresos del último mes',fmt(last[2]))+kv('Gastos del último mes',fmt(last[3]))+kv('Resultado de 12 meses',`<span style="color:${y12>=0?'#3ccf8e':'#ff5a5a'}">${fmt(y12)}</span>`)}</div>${cbNetChart(g.h)}</div>`;
    h+=`<div class="seg">${[['.7','Cuota barata'],['1','Cuota normal'],['1.4','Cuota cara']].map(([v,n])=>`<button data-fm7="${v}" class="${Math.abs(g.fm-+v)<.01?'on':''}">${n}</button>`).join('')}</div>`;
    if(p.fc&&p.fc.cb&&cbSp(p)===g.sp)h+=cb7it('ogt',P.fc.cb.og?'Entrenas con tus entrenadores y tu escuela; tus victorias suben la reputación del gimnasio':'Cambia tu lugar de entrenamiento a tu gimnasio',true,P.fc.cb.og?'✅ Entrenas en tu gimnasio':'🥊 Entrenar en tu gimnasio');
    h+=`<div class="sect">Entrenadores (${g.co.length}/${T[5]})</div>`+(g.co.length?g.co.map((x,i)=>cb7it('ogf'+i,`calidad ${x.q} · ${cbSchK(g.sp,x.sch).n} · ${fmt(x.sal*u)} al mes · toca para despedir (2 meses de liquidación)`,true,`👤 ${x.n}`)).join(''):'<div class="hint">Sin entrenadores casi nadie se inscribe.</div>');
    h+=`<div class="hint" style="font-size:11.5px">Candidatos (cambian cada 4 meses):</div>`+(g.cand||[]).map((x,i)=>cb7it('ogh'+i,`calidad ${x.q} · ${cbSchK(g.sp,x.sch).n} · ${fmt(x.sal*u)} al mes`,g.co.length<T[5],`➕ Contratar a ${x.n}`,'Sin lugar')).join('');
    h+=`<div class="sect">Peleadores del gimnasio (${g.F.length}/${T[6]})</div>`;
    if(live){h+=g.F.map(id=>{const f=W.F[id];if(!f)return '';const pos=cbPos(id,f.d,W.sp==='mma'?f.lg:-1);return `<button class="item" data-fid7="${id}"><span><div class="t">${flag(f.c)} ${f.n}</div><div class="s">${cbRec(f)} · ${cbDivN(W.sp,f.d)} · ${pos&&!f.jm?'#'+pos:'sin clasificar'} · nivel ${Math.round(f.r)} → potencial ${Math.round(f.pt)}</div></span></button>`;}).join('');
      h+=cb7it('ogs',`${cb7days('⭐ Buscar talento')} · recorres torneos amateur y gimnasios de la zona`,cb7can('⭐ Buscar talento')&&g.F.length<T[6],'🔎 Buscar talento',g.F.length>=T[6]?'Sin lugar':'');
      h+=(g.sc||[]).map(id=>{const f=W.F[id];if(!f)return '';return cb7it('ogk'+id,`${cbRec(f)} · ${cbDivN(W.sp,f.d)} · ${f.g} años · potencial estimado ${Math.round(f.pt/5)*5}`,g.F.length<T[6],`✍️ Firmar a ${f.n}`,'Sin lugar');}).join('');}
    else h+='<div class="hint">Tus peleadores pertenecen a otro deporte que ya no sigues.</div>';
    h+=`<div class="sect">Inversiones</div>`+(g.t<2?cb7it('ogu',`${fmt((CB_OG[g.t+1][1]-T[1]*.5)*u)} · más socios, entrenadores y peleadores`,true,`⬆️ Ampliar a ${CB_OG[g.t+1][0].toLowerCase()}`):'')+(g.eq<3?cb7it('oge',`${fmt([.5,1.5,4][g.eq]*(g.t+1)*u)} · más socios y mejor entrenamiento`,true,`🛠️ Mejorar el equipo a ${CB_OGEQ[g.eq+1].toLowerCase()}`):'')+cb7it('ogx',`Recuperas ${fmt(g.inv*.4)} (40 % de lo invertido)`,true,'💰 Vender el gimnasio');}
  h+=`<div class="sect">Promotora propia</div>`;
  if(!pr){if(!sp)return h;const cost=CB_OP[0][1]*u;h+=`<div class="hint">Tu propia promotora: firmas peleadores, armas carteleras, vendes boletos y derechos de televisión y pagas las bolsas. Empieza local; con reputación crece a nacional e internacional.</div>`+cb7it('opo',`${fmt(cost)} · licencia ante la comisión, seguro y capital inicial`,p.dinero>=cost,'🎟️ Registrar una promotora',`Necesitas ${fmt(cost)}`);}
  else{const T=CB_OP[pr.lv];const live=W&&W.sp===pr.sp;const tvp=cbOPTVPct(pr);const y=pr.h.slice(-6).reduce((s,e)=>s+e.net,0);
    h+=`<div class="cb7card"><h4>🎟️ ${pr.nm}</h4><div class="kv">${kv('Nivel',T[0])+kv('Reputación',Math.round(pr.rep)+'/100')+kv('Televisión',CB_TV[pr.tv][0])+kv('Peleadores',`${pr.F.length}/${cbOPMax(pr)}`)+kv('Funciones',String(pr.h.length))+kv('Resultado de las últimas 6',`<span style="color:${y>=0?'#3ccf8e':'#ff5a5a'}">${cbUSD(y)}</span>`)}</div></div>`;
    if(live){const ok=cbNow()-pr.last>=28&&pr.F.length;h+=cb7it('ope',ok?`${cb7days('⭐ Función')} · eliges la pelea estelar, el precio de los boletos y ves la proyección`:pr.F.length?'Una función al mes como máximo':'Primero firma peleadores',ok&&cb7can('⭐ Función'),'📅 Organizar una función',pr.F.length?'Espera al próximo mes':'Sin peleadores');
      h+=cb7it('opt',pr.ty===G.year?'Ya negociaste este año':tvp?`Probabilidad ${tvp} % · una vez al año`:pr.tv>=3?'Ya tienes el mejor contrato':'Sube de nivel para un contrato mayor',pr.ty!==G.year&&tvp>0,'📺 Negociar con las televisoras');
      h+=cb7it('opa',pr.auto?'Tu equipo organiza una función cada dos meses si no pierde mucho dinero':'Organizas tú cada función',true,pr.auto?'✅ Funciones automáticas':'⬜ Funciones automáticas');
      if(pr.lv<2){const N=CB_OP[pr.lv+1];h+=cb7it('opu',`${fmt(N[1]*u)} · pide reputación ${N[2]} · recintos de ${fmtK(N[3])} personas`,pr.rep>=N[2]&&p.dinero>=N[1]*u,`⬆️ Convertirte en ${N[0].toLowerCase()}`,pr.rep<N[2]?`Reputación ${Math.round(pr.rep)}/${N[2]}`:`Necesitas ${fmt(N[1]*u)}`);}
      h+=`<div class="sect">Tus peleadores</div>`+(pr.F.length?pr.F.map(x=>{const f=W.F[x.i];if(!f)return '';const pos=cbPos(x.i,f.d,W.sp==='mma'?f.lg:-1);return `<div class="cb7card"><b>${flag(f.c)} ${f.n}</b> <small style="color:var(--mut)">${cbRec(f)} · ${cbDivN(W.sp,f.d)} · ${pos&&pos<=40?'#'+pos:'sin clasificar'}</small><div class="s">Contrato hasta ${x.y1} · bolsa mínima ${cbUSD(x.min)} · última pelea hace ${Math.round((cbNow()-f.lf)/30)} meses</div>
        <div class="bt"><button data-ofid="${x.i}">Ficha</button>${x.y1<=G.year?`<button data-orn="${x.i}">Renovar · ${fmt(toInt(cbOPVal(f)*.15,'USD'))}</button>`:''}<button data-orl="${x.i}">Rescindir</button></div></div>`;}).join(''):'<div class="hint">Todavía no tienes peleadores.</div>');
      const C=cbOPCands(p);if(pr.F.length<cbOPMax(pr)&&C.length)h+=`<div class="sect">Peleadores disponibles</div>`+C.slice(0,8).map(f=>{const cost=toInt(cbOPSignCost(f),'USD');return cb7it('ops'+f.i,`${cbRec(f)} · ${cbDivN(W.sp,f.d)} · ${cbNm(f.c)} · bono por firma ${fmt(cost)}`,p.dinero>=cost,`✍️ ${f.n}`,`Necesitas ${fmt(cost)}`);}).join('');
      if(pr.h.length)h+=`<div class="sect">Funciones anteriores</div><table class="rkt">${pr.h.slice().reverse().map(e=>`<tr><td></td><td>${e.y} · «${e.ev}»<div style="font-size:11px;color:var(--mut)">${e.mt} · ${fmtK(e.att)} de ${fmtK(e.cap)} lugares</div></td><td class="r" colspan="2" style="color:${e.net>=0?'#3ccf8e':'#ff5a5a'}">${cbUSD(e.net)}</td></tr>`).join('')}</table>`;}
    else h+='<div class="hint">Tus peleadores pertenecen a otro deporte que ya no sigues.</div>';
    h+=cb7it('opx',`Recuperas ${fmt(pr.inv*.3*(.5+pr.rep/100))}`,true,'💰 Vender la promotora');}
  return h;}
function cboBind(b,re){const R7=(r,ic)=>{if(r){log(r);toast(ic||'🏢',r);}save();render();re();};
  b.querySelectorAll('[data-os7]').forEach(x=>x.onclick=()=>{CB7.osch=x.dataset.os7;re();});
  b.querySelectorAll('[data-fm7]').forEach(x=>x.onclick=()=>{P.cbo.g.fm=+x.dataset.fm7;save();re();});
  b.querySelectorAll('[data-fid7],[data-ofid]').forEach(x=>x.onclick=()=>cbFighterCard(x.dataset.fid7||x.dataset.ofid));
  b.querySelectorAll('[data-orn]').forEach(x=>x.onclick=()=>R7(cbOPRenew(P,x.dataset.orn),'✍️'));
  b.querySelectorAll('[data-orl]').forEach(x=>x.onclick=()=>askText('¿Rescindir el contrato de este peleador?',null,()=>R7(cbOPRelease(P,x.dataset.orl)),'Rescindir'));
  b.querySelectorAll('[data-x7]').forEach(x=>x.onclick=()=>{const a=x.dataset.x7;
    if(/^og\d$/.test(a))R7(cbOGOpen(P,+a.slice(2),CB7.osch));else if(a==='ogt'){P.fc.cb.og=P.fc.cb.og?0:1;R7(P.fc.cb.og?'Ahora entrenas en tu propio gimnasio.':'Vuelves a entrenar en tu gimnasio anterior.');}
    else if(/^ogf/.test(a))askText('¿Despedir a este entrenador?',null,()=>R7(cbOGFire(P,+a.slice(3))),'Despedir');else if(/^ogh/.test(a))R7(cbOGHire(P,+a.slice(3)),'👤');
    else if(a==='ogs'){useAct(()=>cbOGScout(P),'⭐ Buscar talento');save();render();re();}else if(/^ogk/.test(a))R7(cbOGSign(P,a.slice(3)),'✍️');
    else if(a==='ogu')R7(cbOGUp(P));else if(a==='oge')R7(cbOGEq(P));else if(a==='ogx')askText('¿Vender tu gimnasio?',null,()=>R7(cbOGClose(P)),'Vender');
    else if(a==='opo')R7(cbOPOpen(P),'🎟️');else if(a==='opa'){P.cbo.pr.auto=P.cbo.pr.auto?0:1;save();re();}else if(a==='opu')R7(cbOPUp(P),'🎟️');
    else if(a==='opx')askText('¿Vender tu promotora?',null,()=>R7(cbOPClose(P)),'Vender');else if(/^ops/.test(a))R7(cbOPSign(P,a.slice(3)),'✍️');
    else if(a==='opt'){const r=cbOPTV(P);if(r.roll==null){toast('📺',r.t);re();return;}
      showModal(`<h2>📺 Televisoras</h2><div class="dlg"><div class="dice" id="tvD">🎲 --</div><div class="dres" id="tvR" style="visibility:hidden;color:${r.ok?'#3ccf8e':'#ff5a5a'}">${r.ok?'Éxito':'Fallo'} · sacaste ${r.roll}, necesitabas ${r.pct} o menos</div><div class="txt">${r.t}</div><button class="btn gold" id="tvOk" style="width:100%;padding:12px">Continuar</button></div>`,m=>{let k=0;const iv=setInterval(()=>{k++;m.querySelector('#tvD').textContent='🎲 '+(k<10?RI(1,100):r.roll);if(k>=10){clearInterval(iv);m.querySelector('#tvR').style.visibility='visible';}},70);
        m.querySelector('#tvOk').onclick=()=>{clearInterval(iv);hideModal();log(r.t);save();re();};});}
    else if(a==='ope'){CB7.mi=0;CB7.ttl=-1;CB7.tk=P.cbo.pr.tk||1;CB7.plan=null;cbOPModal(re);}});}
function cbOPModal(re){const p=P,pr=p.cbo.pr,W=G.cb;const F=pr.F.map(x=>W.F[x.i]);if(CB7.mi>=F.length)CB7.mi=0;const M=F[CB7.mi];if(!M){re();return;}
  const tts=cbOPTitleOpts(M);if(!tts.includes(CB7.ttl))CB7.ttl=-1;
  if(!CB7.plan||CB7.plan._k!==`${CB7.mi}|${CB7.ttl}|${CB7.tk}`){const X=cbOPPlan(p,CB7.mi,CB7.ttl,CB7.tk);if(X)X._k=`${CB7.mi}|${CB7.ttl}|${CB7.tk}`;CB7.plan=X;}const X=CB7.plan;
  const row=(a,v,neg)=>`<div class="frow"><span>${a}</span><span class="${neg?'neg':''}">${neg?'−':''}${cbUSD(Math.abs(v))}</span></div>`;
  let h=`<h2>📅 Nueva función</h2><div class="hint">Pelea estelar:</div><div class="chips" style="margin-bottom:6px">${F.map((f,i)=>f?`<button data-m7="${i}" class="${CB7.mi===i?'on':''}">${cbSur(f)}</button>`:'').join('')}</div>`;
  if(tts.length)h+=`<div class="chips" style="margin-bottom:6px"><button data-tt7="-1" class="${CB7.ttl<0?'on':''}">Sin título</button>${tts.map(b=>`<button data-tt7="${b}" class="${CB7.ttl===b?'on':''}">Título ${cbOrgN(b)}</button>`).join('')}</div>`;
  h+=`<div class="seg">${CB_TK.map((t,i)=>`<button data-tk7="${i}" class="${CB7.tk===i?'on':''}">${t[0]}</button>`).join('')}</div>`;
  if(!X||X.err)h+=`<div class="hint" style="color:var(--red)">${X?X.err:'—'}</div>`;
  else{h+=`<div class="ofr"><div class="tp">${cbFace(X.M,36)}<div style="flex:1"><b>${flag(X.M.c)} ${X.M.n}</b> <small>${cbRec(X.M)}</small><div class="s" style="font-size:12px;color:var(--mut)">vs ${flag(X.O.c)} ${X.O.n} (${cbRec(X.O)})${X.O.jm?' · rival de relleno':''}</div></div><div style="text-align:right"><b>${Math.round(cbOdds(X.M,X.O)*100)} %</b><div style="font-size:10.5px;color:var(--mut)">de ganar</div></div></div>
     ${X.und.length?`<div class="hint" style="margin:4px 0 0;font-size:11.5px">Preliminares: ${X.und.map(([a,b])=>`${cbSur(a)} vs ${cbSur(b)}`).join(' · ')}</div>`:''}</div>
     <div class="sect" style="position:static">Proyección</div><div class="fin">${row('Boletos ('+fmtK(X.att)+' de '+fmtK(X.cap)+' a '+cbUSD(X.price)+')',X.tix)+(X.tv?row('Derechos de televisión',X.tv):'')+(X.ppv?row('Pago por evento ('+fmtK(X.buys)+' compras)',X.ppv):'')+row('Patrocinio',X.spn)+
     row('Bolsa estelar (tu peleador)',X.purM,1)+row('Bolsa del rival',X.purO,1)+(X.purU?row('Bolsas de las preliminares',X.purU,1):'')+row('Renta del recinto',X.ven,1)+row('Producción y seguridad',X.prod,1)+(X.sanc?row('Cuota del organismo (3 %)',X.sanc,1):'')}
     <div class="frow tot"><span>Resultado estimado</span><span class="${X.net<0?'neg':''}">${X.net<0?'−':''}${cbUSD(Math.abs(X.net))}</span></div></div>`;}
  h+=`<div style="display:flex;gap:8px"><button class="btn" id="opC" style="flex:1;padding:12px">Cancelar</button><button class="btn gold" id="opG" style="flex:1;padding:12px" ${!X||X.err?'disabled':''}>🔔 Presentar la función</button></div>`;
  showModal(h,m=>{m.querySelectorAll('[data-m7]').forEach(x=>x.onclick=()=>{CB7.mi=+x.dataset.m7;CB7.ttl=-1;cbOPModal(re);});m.querySelectorAll('[data-tt7]').forEach(x=>x.onclick=()=>{CB7.ttl=+x.dataset.tt7;cbOPModal(re);});
    m.querySelectorAll('[data-tk7]').forEach(x=>x.onclick=()=>{CB7.tk=+x.dataset.tk7;pr.tk=CB7.tk;cbOPModal(re);});m.querySelector('#opC').onclick=()=>{hideModal();re();};
    m.querySelector('#opG').onclick=()=>{let R=null;useAct(()=>{R=cbOPEvent(P,CB7.mi,CB7.ttl,CB7.tk,CB7.plan);return R&&!R.err?`🎟️ ${pr.nm} presenta «${R.ev}»: ${R.res[R.res.length-1].t}. Resultado: ${cbUSD(R.net)}.`:(R?R.err:'');},'⭐ Función');CB7.plan=null;save();render();
      if(!R||R.err){hideModal();re();return;}showModal(`<h2>🎟️ «${R.ev}»</h2><div class="hint" style="font-size:13.5px;line-height:1.6">${R.res.map((r,i)=>`${i===R.res.length-1?'<b>':''}${r.t}${i===R.res.length-1?'</b>':''}`).join('<br>')}</div>
        ${R.tWin?'<div class="hint" style="color:#f2c14e;font-weight:800">🏆 ¡Tu peleador es campeón mundial!</div>':''}<div class="fin"><div class="frow"><span>Asistencia</span><span>${fmtK(R.X.att)} / ${fmtK(R.X.cap)}</span></div><div class="frow"><span>Ingresos</span><span>${cbUSD(R.X.inc)}</span></div><div class="frow"><span>Gastos</span><span class="neg">−${cbUSD(R.X.cost)}</span></div><div class="frow tot"><span>Resultado</span><span class="${R.net<0?'neg':''}">${R.net<0?'−':''}${cbUSD(Math.abs(R.net))}</span></div></div>
        <button class="btn gold" id="opK" style="width:100%;padding:12px">Continuar</button>`,m2=>m2.querySelector('#opK').onclick=()=>{hideModal();re();});sfx(R.net>=0?'good':'bad');};});}
function showCBO(){if(!P||!P.cbo){toast('🥊','No tienes negocios del combate.');return;}openSheetRaw(`<h3>🥊 Tus negocios del combate</h3>`+cboHTML(P),b=>cboBind(b,()=>showCBO()));}

/* ----- ayuda ⓘ y Guía ----- */
(function(){const H=[
 ['Bloques de entrenamiento','Bloques de entrenamiento','Los entrenadores dividen la preparación en bloques de una a tres semanas con un objetivo (fuerza, acondicionamiento, técnica, sparring) y la afinan antes de la pelea. Entrenar sin descanso lleva al sobreentrenamiento: menos rendimiento y más lesiones.','Cada bloque sube varias cualidades a la vez y suma fatiga. La intensidad cambia la ganancia, la fatiga y el riesgo de lesión, que ves antes de hacerlo. Si tienes pelea programada, los bloques cuentan para el campamento.'],
 ['Fatiga','Fatiga','La fatiga acumulada se mide con la carga de entrenamiento, la variabilidad del pulso y el sueño. Si no se recupera, aparecen el sobreentrenamiento y las lesiones.','Baja 20 puntos al mes y mucho con «Descanso activo» o fisioterapia. Arriba de 45 sube el riesgo de lesión y reduce lo que ganas al entrenar; arriba de 70 llegas con menos energía a la pelea.'],
 ['Sesiones especiales','Sesiones especiales','Los equipos profesionales contratan especialistas: analistas de video, fisiólogos, nutriólogos, psicólogos deportivos y sparrings pagados. Los campamentos en altura (como los de Big Bear en California o los del Estado de México) buscan más glóbulos rojos.','Cada sesión cuesta dinero y días, y tiene un tiempo de espera. El análisis de video revela los atributos exactos de tu rival y suma técnica si tu plan es bueno contra su estilo.'],
 ['Campamento por bloques','Campamento','Un campamento típico dura de 6 a 12 semanas: base física, técnica, sparring específico contra el estilo del rival y afinamiento con corte de peso al final.','La calificación va de 0 a 5: un bloque físico, uno técnico, uno de sparring, terminar con afinamiento (corte de peso o descanso) y 4 bloques o más. Cada punto suma energía al empezar la pelea.'],
 ['Escuelas','Escuelas de box y MMA','Cada país desarrolla una forma de pelear: la mexicana con presión y golpes al cuerpo, la cubana con defensa y juego de piernas, la soviética con fundamentos y jab; en MMA, la lucha de Daguestán, el jiu-jitsu brasileño, el kickboxing holandés y el muay thai.','Tu gimnasio enseña una escuela. El dominio (0–100) cambia cuánto sube cada atributo al entrenar y da ventajas en la pelea. Los rivales del mundo también tienen la escuela de su país.'],
 ['Estilos','Estilos','Un estilo no es fijo: muchos peleadores cambian con los años o según el entrenador. Los más completos combinan dos estilos.','La afinidad sube al entrenar lo que el estilo necesita, con una escuela que lo enseña y al pelear con su plan. Con 60 lo puedes adoptar (dos meses de adaptación); con 70 en un segundo estilo eres híbrido.'],
 ['Récord amateur completo','Box amateur','El box amateur olímpico se pelea a 3 rounds con puntuación de 10 puntos por round. Las federaciones nacionales llevan rankings y forman selecciones que reciben becas y concentraciones.','Cada combate queda registrado. Los puntos del ranking nacional salen de tus victorias y medallas y bajan cada año; con el campeonato nacional o el top 2 entras a la selección: beca mensual y acceso a torneos internacionales.'],
 ['Estadísticas de carrera','Estadísticas de golpes','Empresas especializadas cuentan los golpes de cada pelea en vivo (lanzados, conectados, de poder, jabs). En las MMA se registran golpes significativos, derribos y tiempo de control.','Se suman todas tus peleas profesionales. En la noche de pelea las ves round por round con una gráfica de barras y un radar de atributos.'],
 ['Gimnasio propio','Gimnasio propio','Un gimnasio de box vive de las cuotas mensuales de sus socios; los entrenadores de peleadores profesionales suelen cobrar alrededor de 10 % de las bolsas.','Los socios dependen de la reputación, la cuota, el equipo y de tener entrenadores. Firmas prospectos que te dejan 10 % de sus bolsas y mejoran con la calidad de tus entrenadores.'],
 ['Promotora propia','Promotora','Las promotoras pagan las bolsas y cobran boletos, derechos de televisión, pago por evento y patrocinios. Muchas funciones locales apenas salen tablas: el negocio está en desarrollar peleadores y en la televisión.','Antes de cada función ves la proyección. La reputación sube con funciones llenas, victorias y títulos, y abre los niveles nacional e internacional y mejores contratos de televisión.'],
 ['kv:Subasta de bolsa','Subasta de bolsa','Cuando el campeón y su retador obligatorio no se ponen de acuerdo, el organismo abre una subasta entre promotoras: gana la oferta más alta y la bolsa se reparte según el reglamento, a menudo 70/30 o 75/25 a favor del campeón.','En este juego el reparto es 75/25. El resultado de una subasta no se negocia.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0].replace(/^kv:/,''),'i'));}
 const gi=GUIA.findIndex(g=>/Box y MMA/.test(g[0]));GUIA.splice(gi>=0?gi+1:GUIA.length,0,['🥋 Box y MMA a fondo',`<b>Escuelas:</b> cada gimnasio enseña una (mexicana, estadounidense, cubana, soviética, británica, filipina; en MMA, Daguestán, jiu-jitsu brasileño, kickboxing holandés, muay thai y lucha universitaria). El dominio sube al entrenar y da ventajas en la pelea.
<ul><li><b>Estilos:</b> se adquieren con afinidad; con 60 puedes cambiar y con 70 en un segundo estilo eres híbrido.</li>
<li><b>Bloques y fatiga:</b> bloques de dos semanas con intensidad ligera, normal o dura; la fatiga baja 20 al mes y arriba de 45 aumenta el riesgo de lesión.</li>
<li><b>Campamento:</b> antes de una pelea combina bloques físico, técnico y de sparring, y termina con afinamiento. Suma sesiones especiales como el análisis de video del rival.</li>
<li><b>Amateur:</b> cada combate se registra; con puntos o con el campeonato nacional entras a la selección (beca y torneos internacionales).</li>
<li><b>Bolsas:</b> las funciones locales y nacionales pagan según el mercado de cada país; las defensas obligatorias pueden ir a subasta (75/25).</li>
<li><b>Negocios:</b> gimnasio propio (socios, entrenadores, peleadores) y promotora propia (carteleras, boletos, televisión). Siguen funcionando después de tu retiro desde el menú Carrera.</li></ul>`]);})();
// los temas y burbujas de este módulo se agregan después de ui_i18n.js: se traducen aquí con el mismo diccionario B6 (los que ya están traducidos no cambian)
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v17r',e);}}
