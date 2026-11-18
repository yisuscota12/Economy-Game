/* ===== v1.8a (fase 1 de la ruta 9d: base y comodidad) — interfaz =====
   1) El diálogo o evento que aparece al avanzar el reloj ya no te deja en el inicio: al cerrarlo vuelves a la pantalla y pestaña donde estabas.
   2) Avance automático (⏸ ×1 ×2 ×5) con pausa sola ante diálogos, eventos y decisiones.
   3) Divisa de visualización elegible.  4) Renombrar.  5) Bandeja de diálogos pendientes. */

/* ---------- 1) volver a tu pantalla tras un diálogo o evento ---------- */
// La causa: al tocar el reloj con una pantalla abierta, el avance guardaba la pantalla (SHK.adv) y la reabría a los 140 ms;
// si en ese avance salía un diálogo o un evento, la reapertura se cancelaba (había ventana encima) y nadie la recordaba.
// Ahora la pantalla queda como «tapada» (SHK.under) y se reabre al cerrar la última ventana.
function v18Lost(a){if(!a||!a.re)return;if(modalOn()||P.dlg||P.event){if(!SHK.under)SHK.under=a;}}
{const _au=advanceUnit;advanceUnit=function(u){const a=SHK.adv;_au(u);if(a&&u!=='5')v18Lost(a);};}
// lo mismo cuando una acción cruza la medianoche y en ese avance sale un diálogo
{const _ua=useAct;useAct=function(fn,t){const a=sheetIsOpen()&&SHK.re?{re:SHK.re,sc:$('sheet').scrollTop,key:SHK.key}:null;_ua(fn,t);if(a&&!sheetIsOpen())v18Lost(a);};}

/* ---------- 2) avance automático: ⏸ / ▶ con velocidades ×1, ×2, ×5 ---------- */
// ×1 = 1 día por segundo, ×2 = 2, ×5 = 5. Cada pulso avanza con clockAdvance (el mismo reloj de los botones) y solo
// redibuja todo al cerrar un mes o como mucho una vez por segundo; guarda al cerrar cada mes (save() ya espera 0.6 s).
// Se pausa solo ante diálogos, eventos, ofertas, peleas, finales, avisos importantes, al abrir una ventana o al salir de la app.
const AUTO={on:false,t:null,last:0};
const AUTO_SP={1:[1000,1],2:[500,1],5:[400,2]};
const autoSp=()=>AUTO_SP[CFG.asp]?CFG.asp:1;
function autoStop(){AUTO.on=false;if(AUTO.t){clearTimeout(AUTO.t);AUTO.t=null;}autoUI();}
function autoStart(){if(!P||!P.alive||(typeof FF_ON!=='undefined'&&FF_ON))return;if(blockedTurn()){render();return;}AUTO.on=true;if(G)G.clkRem=null;autoUI();AUTO.t=setTimeout(autoTick,250);}
function autoToggle(){if(AUTO.on)autoStop();else{autoStart();if(AUTO.on){const s=autoSp();toast('▶️ Avance automático',(s===1?'Velocidad ×1: un día por segundo.':s===2?'Velocidad ×2: dos días por segundo.':'Velocidad ×5: cinco días por segundo.')+' Se pausa solo ante diálogos, eventos y decisiones.');}}}
function autoTick(){AUTO.t=null;if(!AUTO.on)return;
  if(!P||!P.alive||document.hidden||modalOn()||(typeof FF_ON!=='undefined'&&FF_ON)){autoStop();if(P&&!P.alive)render();return;}
  if(blockedTurn()){autoStop();render();return;}
  const [ms,n]=AUTO_SP[autoSp()];const t0=performance.now();let res;
  try{ensureClock();const mando=mandoActive();if(mando)ANIM.prev=snapPositions();
    res=clockAdvance(n,{pauseBig:true});
    if(res.months){if(typeof MO!=='undefined'&&MO){MO.rep=res.rep.filter(x=>x.big).slice(-4);if(MO.sel&&!armyById(MO.sel))MO.sel=null;}save();}
    if(res.stop||res.months||performance.now()-AUTO.last>950||P.event||P.dlg){AUTO.last=performance.now();render();if(res.months){pulseConquests();if(mando)animateMonth(res.rep.filter(x=>x.big));}}
    else{clockUI();}
  }catch(e){console.error(e);autoStop();return;}
  if(res.stop||P.event||P.dlg||!P.alive){autoStop();if(res.stop==='aviso'){const x=res.rep.filter(x=>x.big&&STOP_RX.test(x.t)).pop();if(x)toast('⏸️ Pausa automática',x.t);}save();return;}
  // si el pulso tardó (cierre de mes en una laptop lenta), el siguiente espera lo que falte para no saturar
  AUTO.t=setTimeout(autoTick,Math.max(60,ms-(performance.now()-t0)));}
function autoUI(){const b=$('apB'),s=$('apS');if(!b)return;b.textContent=AUTO.on?'⏸':'▶';b.classList.toggle('run',AUTO.on);s.textContent='×'+autoSp();const c=$('clk');if(c)c.classList.toggle('auto',AUTO.on);}
(function(){const st=document.createElement('style');st.textContent=`
#clk .cirow{display:flex;align-items:center;gap:6px;max-width:100%}
#clk .ap{display:flex;gap:3px;flex:0 0 auto}
#clk .ap button{min-width:30px;height:24px;padding:0 7px!important;border-radius:999px;border:1px solid var(--line2,#2b3a4e)!important;background:var(--glass,rgba(12,18,26,.92))!important;color:var(--ink,#e8eef6)!important;font-size:12px;font-weight:800;line-height:1}
#clk .ap button.run{background:var(--teal,#3ccf8e)!important;border-color:var(--teal,#3ccf8e)!important;color:#05140d!important}
#clk.auto .ci b{animation:apPulse 1s ease-in-out infinite}@keyframes apPulse{50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){#clk.auto .ci b{animation:none}}`;document.head.appendChild(st);
  const c=$('clk'),ci=$('clkInfo');if(!c||!ci)return;const row=document.createElement('div');row.className='cirow';ci.parentNode.insertBefore(row,ci);row.appendChild(ci);
  const ap=document.createElement('div');ap.className='ap';
  ap.innerHTML='<button type="button" id="apB" title="Avance automático: toca para iniciar o pausar" aria-label="Avance automático: toca para iniciar o pausar">▶</button><button type="button" id="apS" title="Velocidad del avance automático" aria-label="Velocidad del avance automático">×1</button>';
  row.appendChild(ap);$('apB').onclick=e=>{e.stopPropagation();autoToggle();};
  $('apS').onclick=e=>{e.stopPropagation();CFG.asp={1:2,2:5,5:1}[autoSp()];saveCfg();autoUI();if(AUTO.on){clearTimeout(AUTO.t);AUTO.t=setTimeout(autoTick,AUTO_SP[autoSp()][0]);}};autoUI();})();
// tocar un botón del reloj, el 5 años, morir o empezar otra partida detiene el avance automático; salir de la app también
{const _au=advanceUnit;advanceUnit=function(u){if(AUTO.on&&(u==='5'))autoStop();return _au(u);};}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&AUTO.on)autoStop();});
{const _sm=showModal;showModal=function(h,b){if(AUTO.on)autoStop();return _sm(h,b);};}

/* ---------- 3) divisa de visualización elegible ---------- */
const CUR_TOP=['USD','EUR','GBP','JPY','CNY','CHF','CAD','INR','BRL','MXN'];
function curViewName(){const c=curView();return c?cxOf({cur:c}).nm:CURV==='usd'?'dólares':'moneda de tu país';}
function curViewHTML(){const c=curView();return c?`<span>${cxOf({cur:c}).nm}</span> (${c})`:`<span>${curViewName()}</span>`;}
function showCurView(){if(!G||!P)return;ensureV13();const home=homeN(),hc=home.cur,mine=P.dinero;
  const cur=CURV==='usd'?'usd':curView()||'loc';
  const it=(k,t,s)=>`<button class="item${k===cur?' on':''}" data-cv="${k}"><span><div class="t">${k===cur?'✅ ':''}${t}</div><div class="s">${s}</div></span></button>`;
  const line=c=>{const x=G.cx[c];if(!x)return '';const v=fmtC(mine*usdPerInt(home)*x.fx,c);return it(c,`<span>${x.nm}</span> (${c})`,c==='USD'?`Tu dinero: ${v}`:`1 dólar = ${fmtPx(x.fx,c)} · tu dinero: ${v}`);};
  const all=Object.keys(G.cx).filter(c=>!CUR_TOP.includes(c)&&c!==hc).sort((a,b)=>G.cx[a].nm.localeCompare(G.cx[b].nm,'es'));
  const top=[hc,...CUR_TOP.filter(c=>c!==hc)].filter(c=>G.cx[c]);
  openSheetRaw(`<h3>💱 Divisa para ver el dinero</h3><div class="hint"><span>Solo cambia cómo se muestran las cantidades: tus ahorros, sueldos y precios siguen en la moneda de tu país.</span> <span>Con una moneda elegida, también el PIB, el tesoro y las demás cifras nacionales se muestran en ella, al tipo de cambio del día.</span></div>
   ${it('loc','Moneda de tu país',`Tu dinero en ${cxOf(home).nm} y las cifras nacionales en dólares.`)}${it('usd','Dólares para todo','Tu dinero y las cifras nacionales en dólares estadounidenses.')}
   <div class="sect">Más usadas</div>${top.map(line).join('')}<div class="sect">Todas las monedas</div>${all.map(line).join('')}`,
   b=>b.querySelectorAll('[data-cv]').forEach(x=>x.onclick=()=>{CURV=x.dataset.cv;CFG.curv=CURV;saveCfg();render();toast('💱 '+(curView()||(CURV==='usd'?'US$':homeN().cur)),curViewName());showCurView();}));}
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;b.querySelectorAll('.item').forEach(el=>{const t=el.querySelector('.t');if(t&&/^Mostrar mi dinero en/.test(t.textContent))el.remove();});
  const x=document.createElement('button');x.className='item';x.innerHTML=`<span><div class="t">💱 Divisa para ver el dinero</div><div class="s">${curViewHTML()} · <span>Toca para elegir cualquier moneda, sin importar tu país.</span></div></span>`;x.onclick=()=>showCurView();b.appendChild(x);};}
// el código de moneda bajo tu dinero (arriba a la derecha) abre el selector
{const _r=render;render=function(){_r();try{const el=$('pCur');if(!el||!G||!P)return;const c=curView();if(c){el.textContent=c;el.title=cxOf({cur:c}).nm;}
  if(!el._cv){el._cv=1;el.style.cursor='pointer';el.setAttribute('role','button');el.setAttribute('aria-label','Toca para cambiar la divisa');el.onclick=e=>{e.stopPropagation();showCurView();};}}catch(e){}};}

/* ---------- 4) renombrar casi todo (Más → ✏️ Renombrar) ---------- */
{const _r=render;render=function(){if(G&&REN.g!==G)try{renApply();}catch(e){}_r();};}
const RENV={cat:null,q:''};
// cada categoría: título, ícono, y la lista [clave, nombre actual, detalle]
function renCats(){const p=P,L=[];const N=id=>G.nations[id]?G.nations[id].name:id;
  L.push(['nat','🌎 Países',()=>Object.keys(G.nations).filter(id=>G.nations[id].alive).sort((a,b)=>G.nations[a].name.localeCompare(G.nations[b].name,'es')).map(id=>['nat:'+id,G.nations[id].name,id===natOf(p).id?'Tu país':''])]);
  L.push(['min','🏛️ Secretarías de Estado',()=>MINS.map((m,i)=>['min:'+i,m.n,m.d])]);
  if(p.biz)L.push(['biz','🏪 Tus empresas',()=>[p.biz,...(p.bzx||[])].map((b,i)=>['biz:'+i,b.n,RG[b.r]?RG[b.r].nm:''])]);
  L.push(['bank','🏦 Bancos',()=>{try{ensureV13();}catch(e){}return bankList(p).map(b=>{if(b.id==='P:own')return ['own:x',b.nm,'Tu banco'];if(b.id.startsWith('C:'))return ['mk:'+b.id.slice(2),b.nm,'Cotiza en bolsa'];
    if(b.id.startsWith('G:')){const i=GBANKS.findIndex(g=>g[0]===b.id.slice(2));return ['gbk:'+i,b.nm,N(b.n)];}return ['bank:'+b.id,b.nm,N(b.n)];});}]);
  if(G.mk)L.push(['mk','📈 Empresas de bolsa',()=>Object.keys(G.mk.C).filter(id=>!G.mk.C[id].dead).sort((a,b)=>G.mk.C[a].nm.localeCompare(G.mk.C[b].nm,'es')).map(id=>['mk:'+id,G.mk.C[id].nm,id])]);
  if(G.ft&&G.ft.C)L.push(['club','⚽ Clubes de fútbol',()=>Object.keys(G.ft.C).map(id=>{const c=G.ft.C[id];const lg=c.l&&FT_LG.find(x=>x[0]+'1'===c.l||x[0]+'2'===c.l);return ['club:'+id,c.n,(P.ftc&&P.ftc.id===id?'Tu club · ':'')+N(c.c)];}).sort((a,b)=>a[1].localeCompare(b[1],'es'))]);
  L.push(['lg','🏆 Ligas de fútbol',()=>FT_LG.map((x,i)=>['lg:'+i,x[1],N(x[0])])]);
  L.push(['org','🥊 Organismos y ligas de combate',()=>[...CB_ORG.map((x,i)=>['org:'+i,x[1],x[0]]),...CB_LG.map((x,i)=>['cblg:'+i,x[1],x[0]])]]);
  L.push(['prom','🎟️ Promotoras de box y MMA',()=>CB_PROM.map((x,i)=>['prom:'+i,x[0],N(x[1])])]);
  if(G.fm&&G.fm.W&&Object.keys(G.fm.W).length)L.push(['fmco','🎬 Compañías de espectáculo',()=>{const out=[];for(const k in G.fm.W){const W=G.fm.W[k];for(const ci in (W.C||{}))out.push(['fmco:'+k+'|'+ci,W.C[ci].n,(FC[k]?FC[k].n:k)]);}return out.sort((a,b)=>a[1].localeCompare(b[1],'es'));}]);
  return L;}
function showRename(cat){if(!G||!P)return;if(cat!==undefined&&cat!==RENV.cat){RENV.cat=cat;RENV.q='';}const C=renCats();
  if(!RENV.cat||!C.find(c=>c[0]===RENV.cat)){RENV.cat=null;
    openSheetRaw(`<h3>✏️ Renombrar</h3><div class="hint"><span>Cambia el nombre de países, empresas, bancos, clubes, organismos y secretarías.</span> <span>Los nombres que cambies no se traducen a otros idiomas: se muestran tal como los escribas.</span></div>${C.map(c=>`<button class="item" data-rc="${c[0]}"><span><div class="t">${c[1]}</div></span><b>${c[2]().length}</b></button>`).join('')}${Object.keys(G.ren||{}).length?`<div class="hint">Nombres cambiados en esta partida: ${Object.keys(G.ren).length}</div>`:''}`,
      b=>b.querySelectorAll('[data-rc]').forEach(x=>x.onclick=()=>showRename(x.dataset.rc)));return;}
  const c=C.find(c=>c[0]===RENV.cat),all=c[2]();const q=RENV.q.toLowerCase();const F=q?all.filter(x=>(x[1]+' '+x[2]).toLowerCase().includes(q)):all;const S=F.slice(0,80);
  const row=x=>{const ch=G.ren&&G.ren[x[0]]!=null;return `<button class="item" data-rk="${x[0]}"><span><div class="t">${x[1]}</div><div class="s">${ch?`Nombre original: ${G.ren0[x[0]]}`:x[2]||''}</div></span>${ch?`<span class="rrb" role="button" data-rr="${x[0]}">↺ Restaurar</span>`:'✏️'}</button>`;};
  openSheetRaw(`<h3>✏️ ${c[1]}</h3><input id="renQ" type="search" placeholder="Buscar…" value="${clean(RENV.q)}" style="width:100%;margin:4px 0 8px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font:inherit">
    <div id="renL">${S.map(row).join('')}${F.length>S.length?`<div class="hint">Mostrando ${S.length} de ${F.length}. Escribe para buscar.</div>`:''}</div>`,b=>{
    const qi=b.querySelector('#renQ');let tm=null;qi.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>{RENV.q=qi.value;const pos=qi.selectionStart;showRename(RENV.cat);const n=$('renQ');if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(e){}}},250);};
    b.querySelectorAll('[data-rr]').forEach(x=>x.onclick=e=>{e.stopPropagation();const k=x.dataset.rr,old=G.ren[k];renReset(k);if(k.startsWith('gbk:'))renGbkMk(k,null);save();render();toast('↺ Restaurado',G.ren0&&G.ren0[k]||old);showRename(RENV.cat);});
    b.querySelectorAll('[data-rk]').forEach(x=>x.onclick=()=>{const k=x.dataset.rk,o=renObj(k);const cur=o&&o.g()||(all.find(y=>y[0]===k)||[])[1]||'';
      askText('Nuevo nombre',cur,v=>{if(!v||v===cur)return;if(renSet(k,v)){if(k.startsWith('gbk:'))renGbkMk(k,v);save();render();toast('✏️ Renombrado',v);}showRename(RENV.cat);},'Cambiar');});});}
// un banco global que cotiza también cambia de nombre en la bolsa
function renGbkMk(k,v){const g=GBANKS[+k.split(':')[1]];if(!g||!g[4])return;const mk='mk:'+g[4];if(v)renSet(mk,v);else renReset(mk);}
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');if(!b||!P)return;const x=document.createElement('button');x.className='item';
  x.innerHTML='<span><div class="t">✏️ Renombrar</div><div class="s">Países, empresas, bancos, clubes, organismos y secretarías</div></span>';x.onclick=()=>showRename(null);
  const st=[...b.querySelectorAll('.item')].find(el=>/Ajustes/.test(el.textContent));if(st)b.insertBefore(x,st);else b.append(x);};})();

(function(){const st=document.createElement('style');st.textContent=`.rrb{flex:0 0 auto;border:1px solid var(--line);background:var(--card2);border-radius:9px;padding:6px 9px;font-size:12px;color:var(--gold)}`;document.head.appendChild(st);})();
// las pantallas nuevas registran cómo reabrirse (↩ Atrás y volver tras una ventana)
try{shWrapAll();}catch(e){}

/* ---------- 5) bandeja de conversaciones (💬 en el reloj) ---------- */
function dqLeft(it){const d=it.exp-absDay();return d<=1?'Vence mañana':'Vence en '+d+' días';}
function showInbox(){if(!P)return;const p=P,L=p.dq||[];const s=socialNow(p);
  const row=(it,i)=>{const d=DLG.find(x=>x.id===it.id);const x=nget(p,it.ref);const [cc,cn]=DCAT[it.cat]||['#9aa7b6',String(it.cat||'').toUpperCase()];
    return `<button class="item per" data-dq="${i}">${x?face(x,40):'<span style="font-size:24px">💬</span>'}<span><div class="t">${d&&d.title||''}</div><div class="s"><b style="color:${cc}">${cn}</b>${x?` · ${x.name}`:''} · ${dqLeft(it)}</div></span></button>`;};
  openSheetRaw(`<h3>💬 Conversaciones pendientes</h3><div class="hint"><span>Las conversaciones que pueden esperar ya no detienen el reloj: atiéndelas cuando quieras.</span> <span>Al llegar su plazo aparecen solas.</span> <span>Si las ignoras, la persona lo toma a mal.</span></div>
    ${L.length?L.map(row).join(''):'<div class="hint">No tienes conversaciones pendientes.</div>'}
    <div class="sect">Tu vida social</div><div class="hint"><span>${s.avg==null?'No tienes a nadie cercano.':`Relaciones cercanas: ${Math.round(s.avg)}/100.`}</span>${s.R?` <span>Rencores: ${s.R}.</span>`:''} <span>${s.e>=.25?`Tu ánimo sube ${s.e.toFixed(2)} al mes (vida social buena).`:s.e>0?`Tu ánimo sube ${s.e.toFixed(2)} al mes (vida social estable).`:s.e<=-.25?`Tu ánimo baja ${Math.abs(s.e).toFixed(2)} al mes (vida social tensa).`:s.e<0?`Tu ánimo baja ${Math.abs(s.e).toFixed(2)} al mes (vida social estable).`:'Tu ánimo no cambia por tu vida social este mes.'}</span></div>`,
    b=>b.querySelectorAll('[data-dq]').forEach(x=>x.onclick=()=>{const r=dqOpen(+x.dataset.dq);if(r==='ok'){save();closeSheetKeep();showDialog();}else{if(r==='gone')toast('💬','La situación ya cambió: esta conversación ya no aplica.');save();dqUI();showInbox();}}));}
// cierra la hoja recordándola: al terminar el diálogo vuelves a la bandeja (o a donde estabas)
function closeSheetKeep(){const a=sheetIsOpen()&&SHK.re?{re:SHK.re,sc:$('sheet').scrollTop,key:SHK.key}:null;SHK.keep=null;closeSheet();if(a)SHK.under=a;}
function dqUI(){const ap=document.querySelector('#clk .ap');if(!ap)return;let b=$('dqB');const n=P&&P.alive&&P.dq?P.dq.length:0;
  if(!b){b=document.createElement('button');b.type='button';b.id='dqB';b.title='Conversaciones pendientes';b.setAttribute('aria-label','Conversaciones pendientes');b.onclick=e=>{e.stopPropagation();showInbox();};ap.insertBefore(b,ap.firstChild);}
  b.style.display=n?'':'none';b.textContent='💬 '+n;const urg=n&&P.dq.some(it=>it.exp-absDay()<=7);b.classList.toggle('urg',!!urg);}
{const _cu=clockUI;clockUI=function(){_cu();try{dqUI();}catch(e){}};}
{const _r=render;render=function(){_r();try{if(DQ_NOTE!=null&&P&&P.alive&&!modalOn()){const t=DQ_NOTE;DQ_NOTE=null;toast('💬 Conversación pendiente',(t?t+'. ':'')+'Toca 💬 junto al reloj cuando quieras atenderla.');}}catch(e){}};}
// en la ventana del diálogo: «Más tarde» (vuelve a la bandeja) o, si ya venció, «Ignorar» (con consecuencia)
{const _sd=showDialog;showDialog=function(){_sd();try{const D=P&&P.dlg;if(!D||!D.q||D.res)return;const m=$('modal');const box=m.querySelector('.dlg');if(!box||box.querySelector('.dqx'))return;
  const b=document.createElement('button');b.className='btn dqx';b.style.cssText='width:100%;margin-top:8px;opacity:.85';b.textContent=D.due?'🚫 Ignorar (lo tomará a mal)':'⏳ Más tarde';
  if(D.due){const n=document.createElement('div');n.className='dqn';n.textContent='Esta conversación esperó su plazo: ya no puede esperar más.';box.querySelector('h2').after(n);}
  b.onclick=()=>{dqLater();m._dk=null;save();hideModal();render();};box.appendChild(b);}catch(e){}};}
(function(){const st=document.createElement('style');st.textContent=`#dqB{background:var(--glass,rgba(12,18,26,.92))!important}#clk .ap #dqB.urg{border-color:#ff8a3d!important;color:#ffb27a!important}
.dlg .dqn{font-size:12px;color:#ffb27a;margin:2px 0 4px}`;document.head.appendChild(st);})();
// ajuste: diálogos que pueden esperar → bandeja (por defecto) o interrumpen el reloj como antes
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';const on=CFG.dbx!==0;
  x.innerHTML=`<span><div class="t">${on?'💬 Conversaciones que pueden esperar: a la bandeja':'💬 Conversaciones que pueden esperar: detienen el reloj'}</div><div class="s">${on?'<span>Familia, amigos, trabajo, negocios y fama esperan hasta 30 días en 💬.</span> <span>Lo urgente sigue deteniendo el reloj.</span>':'Todas las conversaciones detienen el reloj en cuanto aparecen (como antes de la v1.8a).'}</div></span>`;
  x.onclick=()=>{CFG.dbx=on?0:1;saveCfg();showSettings();};const f=[...b.querySelectorAll('.item')].find(el=>/Diálogos con causa/.test(el.textContent));if(f)f.after(x);else b.append(x);};}
try{shWrapAll();}catch(e){}

/* ---------- ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Conversaciones pendientes','💬 Conversaciones pendientes','En la vida real no todo se responde al instante: una llamada, un favor o una charla pueden esperar unos días, pero ignorarlos desgasta la relación.','Las conversaciones de familia, amigos, trabajo, negocios y fama esperan hasta 30 días sin detener el reloj. Al llegar su plazo aparecen solas; si las ignoras, la persona pierde 6 puntos de relación (y si es rencorosa, te guarda rencor).'],
 ['Tu vida social','👥 Tu vida social','El Estudio de Desarrollo Adulto de Harvard, que sigue a cientos de personas desde 1938, encontró que la calidad de las relaciones cercanas predice la felicidad y la salud mejor que el dinero o la fama.','Cada mes, la relación media con tu pareja, hijos, padres, hermanos y amistades mueve tu ánimo (hasta 0.5 puntos al mes, hacia arriba o hacia abajo). Tres o más rencores lo bajan un poco más; sin nadie cercano, también baja.'],
 ['Divisa para ver el dinero','💱 Divisa de visualización','Los organismos internacionales reportan en dólares para comparar países, pero tu poder de compra depende de la moneda en la que cobras y gastas. Un tipo de cambio convierte cantidades; no cambia lo que puedes comprar donde vives.','Solo cambia cómo se muestran las cantidades. Tus ahorros siguen en la moneda de tu país, así que en otra divisa su valor sube o baja cuando se mueve el tipo de cambio.'],
 ['Renombrar','✏️ Renombrar','Los países y las empresas sí cambian de nombre: Birmania pasó a llamarse Myanmar en 1989, Suazilandia pasó a ser Esuatini en 2018 y Turquía pidió que la llamen Türkiye en 2022; las empresas lo hacen al fusionarse o cambiar de imagen.','El nombre nuevo se ve en todo el juego (mapa, listas y noticias nuevas) y se guarda en tu partida. Puedes restaurar el original cuando quieras.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 GUIA.splice(Math.min(2,GUIA.length),0,['⏩ Avance automático, divisa, nombres y conversaciones',`<b>Avance automático:</b> junto a la fecha, ▶ pone el tiempo a correr solo y ×1, ×2 o ×5 cambia la velocidad (1, 2 o 5 días por segundo). Se detiene solo ante diálogos, eventos, ofertas, peleas, finales y noticias importantes. Los botones de Hora, Día, Semana, Mes y Año siguen funcionando igual.
<ul><li><b>Conversaciones pendientes (💬):</b> las de familia, amigos, trabajo, negocios y fama ya no te interrumpen: esperan hasta 30 días. Al llegar su plazo aparecen solas; ignorarlas tiene consecuencias.</li>
<li><b>Tu vida social:</b> tus relaciones cercanas mueven tu ánimo cada mes, así que lo que decides en cada conversación sigue contando después.</li>
<li><b>Divisa:</b> toca el código de moneda bajo tu dinero (o Ajustes) para ver todo en la moneda que quieras.</li>
<li><b>Renombrar (Más → ✏️ Renombrar):</b> países, empresas, bancos, clubes, ligas, organismos, promotoras y secretarías.</li></ul>`]);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v18a',e);}}
