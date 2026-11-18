/* ===== v1.8b (cierre de la fase 1 de la ruta 9d: rendimiento) — interfaz =====
   Medido con la CPU frenada ×4 (≈ la laptop Toshiba): lo que trababa la pantalla al avanzar el tiempo no era la simulación del mundo,
   sino el trabajo alrededor: guardar (empaquetar + JSON + localStorage ~105 ms de un jalón, y otra vez para la ranura al cerrar el año),
   el registro (se rehacía entero en cada redibujo, ~17 ms), el mapa (~30 ms en cada redibujo) y «+1 año» (12 cierres de mes seguidos).
   1) Web Worker de guardado: el JSON, la compresión gzip y la escritura de la ranura en IndexedDB se hacen en otro hilo.
   2) Troceo cooperativo: «+1 año» avanza mes por mes cediendo la pantalla entre cada mes (la fecha corre y puedes detenerlo);
      el avance automático redibuja después de pintar; el mapa se actualiza en el cuadro siguiente al redibujo (y una sola vez por ráfaga).
   3) Registro incremental: solo se agregan las líneas nuevas. */

const afterPaint=fn=>{let d=0;const go=()=>{if(d)return;d=1;try{fn();}catch(e){console.error(e);}};requestAnimationFrame(()=>setTimeout(go,0));setTimeout(go,250);};
// cada trabajo pendiente en su propia tarea: dos callbacks de requestIdleCallback pueden caer en el mismo periodo libre
const onIdle=(fn,to)=>{if(typeof requestIdleCallback==='function')requestIdleCallback(()=>fn(),{timeout:to||1200});else setTimeout(fn,30);};
const nextPaint=()=>new Promise(r=>afterPaint(r));

/* ---------- 3) registro incremental ---------- */
// Antes: cuando el registro llegaba a su tope, cada línea nueva desplazaba la primera y eso obligaba a rehacer las 120 líneas.
// Ahora se busca la última línea ya dibujada (por identidad, desde el final) y solo se agregan las que siguen.
renderLog=function(p){const lg=$('log');if(!lg||!p)return;const L=p.log||[];const row=x=>`<div class="lg ${x.c==='age'?'age':x.c}">${x.t}</div>`;
  let k=-1;if(LG.p===p&&LG.last){for(let i=L.length-1,j=Math.max(0,L.length-400);i>=j;i--){if(L[i]===LG.last){k=i;break;}}}
  if(k<0||L.length-1-k>120){lg.innerHTML=L.slice(-120).map(row).join('');}
  else if(k<L.length-1){lg.insertAdjacentHTML('beforeend',L.slice(k+1).map(x=>row(x).replace('class="lg','class="lg new')).join(''));let n=lg.childElementCount;while(n-->160)lg.firstElementChild.remove();}
  else{LG.n=L.length;return;}
  LG.p=p;LG.last=L.length?L[L.length-1]:null;LG.ref=L.length?L[0]:null;LG.n=L.length;lg.scrollTop=lg.scrollHeight;};

/* ---------- 2a) el mapa se actualiza en el cuadro siguiente al redibujo ---------- */
// Dentro de render() el mapa (colores de 3,422 provincias, fronteras, nombres, ciudades y ejércitos) se pide para después de pintar,
// así el panel y el mapa no caen en el mismo cuadro, y varias llamadas seguidas se juntan en una sola actualización.
const MAPQ={def:0,on:0};
{const _rm=refreshMap;refreshMap=function(){if(MAPQ.def){if(!MAPQ.on){MAPQ.on=1;afterPaint(()=>{MAPQ.on=0;_rm();});}return;}MAPQ.on=0;_rm();};}
{const _r=render;render=function(){MAPQ.def++;try{return _r.apply(this,arguments);}finally{MAPQ.def--;}};}

/* ---------- 1) Web Worker de guardado ---------- */
// El hilo principal solo empaqueta la partida (packG) y la entrega al worker (copia estructurada); el worker hace el JSON
// (y, para la ranura, la compresión gzip y la escritura en IndexedDB). La escritura en localStorage sigue en el hilo principal
// (el worker no tiene localStorage) y se hace en un momento libre. Si el worker no existe, falla o tarda más de 15 s, todo vuelve
// al guardado de siempre. Al salir de la app el guardado es inmediato (como antes).
const SWK_SRC=`let db=null;
function idb(){return new Promise((ok,ko)=>{if(db)return ok(db);const r=indexedDB.open('imperioDB',1);r.onupgradeneeded=()=>{r.result.createObjectStore('slots');};r.onsuccess=()=>{db=r.result;ok(db);};r.onerror=()=>ko(r.error);});}
async function gz(s){if(typeof CompressionStream==='undefined')return new Blob([s]);return await new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).blob();}
onmessage=async e=>{const m=e.data;
  if(m.op==='ping'){postMessage({op:'pong',seq:m.seq,cs:typeof CompressionStream!=='undefined',idb:typeof indexedDB!=='undefined'});return;}
  const t0=performance.now();let s;try{s=JSON.stringify(m.d);}catch(err){postMessage({op:'err',seq:m.seq,e:String(err&&err.message||err)});return;}
  const out={op:'ok',seq:m.seq};if(m.ls)out.s=s;
  if(m.slot!=null){const ss=s.slice(0,-1)+',"v":'+JSON.stringify(m.v)+'}';let blob;try{blob=await gz(ss);}catch(err){blob=new Blob([ss]);}out.kb=Math.round(blob.size/1024);
    try{const d=await idb();await new Promise((ok,ko)=>{const t=d.transaction('slots','readwrite');t.objectStore('slots').put(blob,m.slot);t.oncomplete=ok;t.onerror=()=>ko(t.error);t.onabort=()=>ko(t.error);});out.put=1;}
    catch(err){out.put=0;out.blob=blob;}}
  out.ms=performance.now()-t0;postMessage(out);};`;
const SWK={w:null,ok:false,seq:0,applied:0,cb:{},inflight:0,why:'',n:0,ms:0};
const swkOn=()=>CFG.swk!==0;
function swkDown(why){SWK.ok=false;SWK.why=String(why||'');try{if(SWK.w)SWK.w.terminate();}catch(e){}SWK.w=null;const cb=SWK.cb;SWK.cb={};SWK.inflight=0;for(const k in cb){try{cb[k]({op:'err',e:'worker'});}catch(e){}}}
function swkInit(){if(SWK.w||!swkOn())return;if(typeof Worker==='undefined'||typeof Blob==='undefined'){SWK.why='sin Worker';return;}
  try{const url=URL.createObjectURL(new Blob([SWK_SRC],{type:'text/javascript'}));const w=new Worker(url);SWK.w=w;
    w.onmessage=e=>{const r=e.data||{};const f=SWK.cb[r.seq];delete SWK.cb[r.seq];if(r.op!=='pong')SWK.inflight=Math.max(0,SWK.inflight-1);if(f)f(r);};
    w.onerror=ev=>{try{ev.preventDefault();}catch(e){}swkDown('error');};
    const s=++SWK.seq;SWK.cb[s]=r=>{if(SWK.w===w){SWK.ok=true;SWK.why='';SWK.cs=!!r.cs;}};w.postMessage({op:'ping',seq:s});
    setTimeout(()=>{if(SWK.w===w&&!SWK.ok)swkDown('sin respuesta');},5000);}
  catch(e){swkDown(e&&e.message||e);}}
function swkSend(msg){return new Promise(ok=>{if(!SWK.ok||!SWK.w){ok({op:'err',e:'off'});return;}const s=msg.seq||(msg.seq=++SWK.seq);SWK.cb[s]=ok;SWK.inflight++;
  try{SWK.w.postMessage(msg);}catch(e){delete SWK.cb[s];SWK.inflight=Math.max(0,SWK.inflight-1);ok({op:'err',e:String(e&&e.message||e)});return;}
  setTimeout(()=>{if(SWK.cb[s]){delete SWK.cb[s];swkDown('lento');ok({op:'err',e:'timeout'});}},15000);});}
// lo mismo que guarda saveNow: {G: packG(G), P sin _paper}
const swkData=()=>{const pl=Object.assign({},P);delete pl._paper;return {G:packG(G),P:pl};};
// cada guardado lleva un número; una respuesta del worker solo se escribe si no hubo un guardado más nuevo después
{const _sn=saveNow;saveNow=function(){SWK.applied=++SWK.seq;return _sn.apply(this,arguments);};}
function swkApplyLs(seq,s){if(seq<=SWK.applied||typeof s!=='string')return;SWK.applied=seq;let ok=true;try{localStorage.setItem(SAVE_KEY,s);}catch(e){ok=false;}if(!ok)saveNow();}
function saveBg(){saveT=0;if(!G||!P)return;if(!SWK.ok){saveNow();return;}
  const seq=++SWK.seq;let d;try{d=swkData();}catch(e){saveNow();return;}
  swkSend({op:'save',seq,d,ls:1}).then(r=>{SWK.n++;if(r.ms)SWK.ms=r.ms;if(r.op!=='ok'){if(seq>SWK.applied)saveNow();return;}setTimeout(()=>onIdle(()=>swkApplyLs(seq,r.s),800),0);});}
// save() sigue igual (espera 0.6 s para juntar cambios) pero termina en el worker
{const _s=save;save=function(){const had=saveT;_s.apply(this,arguments);if(!had&&saveT&&SWK.ok){clearTimeout(saveT);saveT=setTimeout(()=>onIdle(saveBg,1500),600);}};}
// al salir de la app: si hay un guardado en camino, se guarda ya en el hilo principal (la respuesta tardía se descarta)
document.addEventListener('visibilitychange',()=>{if(document.hidden&&SWK.inflight>0&&G&&P){try{saveNow();}catch(e){}}});
window.addEventListener('pagehide',()=>{if(SWK.inflight>0&&G&&P){try{saveNow();}catch(e){}}});
// ranuras: el mismo paquete sirve para la ranura y, si estaba pendiente, para el guardado rápido (al cerrar el año se hacía dos veces)
{const _sl1=slSave1;slSave1=async function(i,name,quiet){if(!G||!P)return false;if(!SWK.ok)return _sl1(i,name,quiet);
  SL.busy=1;let r=null,seq=0,withLs=false,desc=null;
  try{withLs=!!saveT;if(withLs){clearTimeout(saveT);saveT=0;}seq=++SWK.seq;desc=slDesc();const d=swkData();r=await swkSend({op:'save',seq,d,ls:withLs?1:0,slot:i,v:VERSION});}
  catch(e){r={op:'err',e:String(e&&e.message||e)};}
  if(!r||r.op!=='ok'){SL.busy=0;if(withLs&&seq>SWK.applied)saveNow();return _sl1(i,name,quiet);}
  try{SWK.n++;if(r.ms)SWK.ms=r.ms;if(withLs)setTimeout(()=>onIdle(()=>swkApplyLs(seq,r.s),800),0);if(!r.put)await slPut(i,r.blob);
    const old=SL.meta[i]||{};SL.meta[i]=Object.assign(desc,{n:name||old.n||('Partida '+(i+1)),kb:r.kb,gid:slGid()});slMetaSave();
    if(!quiet)toast('💾 Guardado',`Ranura ${i+1}: ${SL.meta[i].n} (${SL.meta[i].kb} KB).`);return true;}
  catch(e){toast('⚠️ No se pudo guardar',String(e&&e.message||e).slice(0,120));return false;}finally{SL.busy=0;}};}
setTimeout(swkInit,1200);

/* ---------- 2b) «+1 año» mes por mes, sin congelar la pantalla ---------- */
// Cada mes es un trozo (clockAdvance hasta el fin del mes); entre trozos se cede la pantalla (la fecha corre en el reloj).
// El último trozo lo hace el botón de siempre (con G.clkRem), así que el resumen, la reapertura de tu pantalla, el guardado
// y el redibujo final son los mismos que antes. Tocar el botón mientras corre lo detiene al cerrar el mes en curso.
const CLK={busy:0,stop:0};
const clkPlain=()=>P&&P.alive&&!mandoActive()&&!(typeof cbDue==='function'&&cbDue())&&!(typeof fmOf==='function'&&(f=>f&&(f.gig||f.gala))(fmOf(P)))&&!(typeof fbOf==='function'&&(f=>f&&f.big)(fbOf(P)));
function clkBusyUI(on){const ab=$('ageBtn');if(!ab)return;ab.classList.toggle('clkbusy',!!on);if(on){ab.textContent='⏸';ab.disabled=false;}}
async function advanceYearSteps(){
  if(!P||!P.alive||(typeof FF_ON!=='undefined'&&FF_ON)||blockedTurn()||!clkPlain())return advanceUnit('a');
  ensureClock();const pend=G.clkRem&&G.clkRem.u==='a'&&G.clkRem.n>0?G.clkRem.n:0;let left=pend||365;
  // un año que cabe en un mes (o lo que falta de uno pausado) no necesita trozos
  if(left<=MCUM[monthOfDay(G.day)+1]-G.day)return advanceUnit('a');
  CLK.busy=1;CLK.stop=0;G.clkRem=null;const a=SHK.adv;const y0=G.year;const big=[];let res=null,stop=null;
  try{clkBusyUI(1);
    while(true){const chunk=Math.min(left,MCUM[monthOfDay(G.day)+1]-G.day);if(left-chunk<=0)break; // el último trozo va al botón de siempre
      res=clockAdvance(chunk,{auto:true,pauseBig:true});left-=res.done;big.push(...res.rep.filter(x=>x.big));
      if(res.stop||res.done<chunk||!P.alive){stop=res.stop||'decision';break;}
      if(CLK.stop){stop='usuario';break;}
      try{clockUI();}catch(e){}clkBusyUI(1);await nextPaint();
      if(CLK.stop){stop='usuario';break;}}
  }catch(e){console.error(e);stop=stop||'error';}
  CLK.busy=0;clkBusyUI(0);
  if(!stop){G.clkRem={u:'a',n:left};advanceUnit('a');if(typeof MO!=='undefined'&&MO&&big.length)MO.rep=big.concat(MO.rep||[]).filter(x=>x&&x.big).slice(-4);return;}
  // detenido antes del último mes: lo mismo que hace el botón de siempre cuando se pausa
  SHK.adv=null;
  if(left>0&&stop!=='muerte'&&P.alive){G.clkRem={u:'a',n:left};setTimeout(()=>toast('⏸️ Pausa',stop==='usuario'?`Avance detenido. Faltan ${left} día(s): vuelve a tocar el botón para completarlo.`:`El año se detuvo para una decisión. Faltan ${left} día(s): vuelve a tocar el botón para completarlo.`),400);}
  if(typeof MO!=='undefined'&&MO){MO.rep=big.slice(-4);if(MO.sel&&!armyById(MO.sel))MO.sel=null;}
  save();if(G.year!==y0||P.event)sfx(P.event?'bad':'year');render();pulseConquests();
  if(stop==='aviso'){const x=big.filter(x=>STOP_RX.test(x.t)).pop();if(x)toast('⏸️ Pausa automática',x.t);}
  if(a){setTimeout(()=>shReopen(a),140);v18Lost(a);}}
$('ageBtn').onclick=()=>{if(CLK.busy){CLK.stop=1;return;}if(CFG.tu==='a')advanceYearSteps();else advanceUnit(CFG.tu);};
// mientras corre el año por meses no arrancan el avance automático ni el avance de 5 años
{const _as=autoStart;autoStart=function(){if(CLK.busy)return;return _as.apply(this,arguments);};}
{const _ff=fastForward;fastForward=function(n){if(CLK.busy)return;return _ff.apply(this,arguments);};}
{const _cu=clockUI;clockUI=function(){_cu.apply(this,arguments);if(CLK.busy)clkBusyUI(1);};}

/* ---------- 2c) avance automático: el redibujo del cierre de mes va después de pintar ---------- */
// Igual que en la v1.8a, pero al cerrar un mes (sin pausa) el reloj se actualiza de inmediato y el redibujo completo
// (panel, registro, mapa) se hace en el cuadro siguiente: la simulación del mes y el dibujo ya no caen en el mismo bloque.
autoTick=function(){AUTO.t=null;if(!AUTO.on)return;
  if(!P||!P.alive||document.hidden||modalOn()||(typeof FF_ON!=='undefined'&&FF_ON)){autoStop();if(P&&!P.alive)render();return;}
  if(blockedTurn()){autoStop();render();return;}
  const [ms,n]=AUTO_SP[autoSp()];const t0=performance.now();let res,mando=false;
  try{ensureClock();mando=mandoActive();if(mando)ANIM.prev=snapPositions();
    res=clockAdvance(n,{pauseBig:true});
    if(res.months){if(typeof MO!=='undefined'&&MO){MO.rep=res.rep.filter(x=>x.big).slice(-4);if(MO.sel&&!armyById(MO.sel))MO.sel=null;}save();}
    const halt=res.stop||P.event||P.dlg||!P.alive;
    if(res.months&&!halt){AUTO.last=performance.now();try{clockUI();}catch(e){}const rep=res.rep.filter(x=>x.big);
      afterPaint(()=>{if(!P)return;render();pulseConquests();if(mando)animateMonth(rep);});}
    else if(halt||res.months||performance.now()-AUTO.last>950){AUTO.last=performance.now();render();if(res.months){pulseConquests();if(mando)animateMonth(res.rep.filter(x=>x.big));}}
    else{clockUI();}
  }catch(e){console.error(e);autoStop();return;}
  if(res.stop||P.event||P.dlg||!P.alive){autoStop();if(res.stop==='aviso'){const x=res.rep.filter(x=>x.big&&STOP_RX.test(x.t)).pop();if(x)toast('⏸️ Pausa automática',x.t);}save();return;}
  AUTO.t=setTimeout(autoTick,Math.max(60,ms-(performance.now()-t0)));};

/* ---------- ajuste: guardado en segundo plano ---------- */
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';const on=swkOn();
  const st=!on?'La partida se guarda en el hilo principal, como antes de la v1.8b.':SWK.ok?'La partida se prepara y se comprime en otro hilo para que la pantalla no se trabe al guardar.':'No disponible en este navegador: se usa el guardado de siempre.';
  x.innerHTML=`<span><div class="t">${on?'⚙️ Guardado en segundo plano: activado':'⚙️ Guardado en segundo plano: desactivado'}</div><div class="s">${st}</div></span>`;
  x.onclick=()=>{CFG.swk=on?0:1;saveCfg();if(CFG.swk===0)swkDown('apagado');else{SWK.why='';swkInit();}setTimeout(showSettings,on?0:400);};
  const f=[...b.querySelectorAll('.item')].find(el=>/Conversaciones que pueden esperar/.test(el.textContent));if(f)f.after(x);else b.append(x);};}
try{shWrapAll();}catch(e){}

(function(){const st=document.createElement('style');st.textContent=`#ageBtn.clkbusy{animation:clkbusy 1s ease-in-out infinite}
@keyframes clkbusy{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
@media (prefers-reduced-motion:reduce){#ageBtn.clkbusy{animation:none}}`;document.head.appendChild(st);})();
