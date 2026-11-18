/* ===== v1.7a: ranuras de guardado, temas visuales, vista vertical u horizontal y dificultad =====
   Guardado: la partida en curso se sigue guardando sola (clave imperioVida_v3). Además hay 10 ranuras en IndexedDB, comprimidas con gzip
   (~6 veces menos espacio que en localStorage, donde 10 partidas de ~700 KB no cabrían). La ranura activa se actualiza sola cada año,
   al salir de la app y al tocar «Guardar ahora». Exportar e importar como texto para pasar partidas entre dispositivos. */
const SLOTS_MAX=10; // límite de ranuras; más adelante se podrá ligar a un paquete de pago
const SL={db:null,meta:[],busy:0};
try{SL.meta=JSON.parse(localStorage.getItem('imperioSlots')||'[]')||[];}catch(e){SL.meta=[];}
if(CFG.slot==null)CFG.slot=0;
const slMetaSave=()=>{try{localStorage.setItem('imperioSlots',JSON.stringify(SL.meta));}catch(e){}slDB().then(db=>{const t=db.transaction('slots','readwrite');t.objectStore('slots').put(JSON.stringify(SL.meta),'meta');}).catch(()=>{});};
// respaldo: si la lista de ranuras desapareció de la memoria rápida del navegador, se recupera de IndexedDB
setTimeout(()=>{if(SL.meta.some(Boolean))return;slDB().then(db=>new Promise(ok=>{const r=db.transaction('slots','readonly').objectStore('slots').get('meta');r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);})).then(v=>{if(!v)return;const m=JSON.parse(v);if(!Array.isArray(m)||!m.some(Boolean))return;SL.meta=m;slMetaSave();
  toast('💾 Partidas recuperadas',`Se recuperaron ${m.filter(Boolean).length} partida(s) guardada(s). Ábrelas en 💾 Partidas.`);const md=$('modal');if(md&&md.classList.contains('on')&&md.querySelector('#sGo')&&!md.querySelector('#sLd'))showStart(!(P&&P.alive));}).catch(()=>{});},800);
function slDB(){return new Promise((ok,ko)=>{if(SL.db)return ok(SL.db);if(!window.indexedDB)return ko('sin IndexedDB');const r=indexedDB.open('imperioDB',1);r.onupgradeneeded=()=>{r.result.createObjectStore('slots');};r.onsuccess=()=>{SL.db=r.result;ok(SL.db);};r.onerror=()=>ko(r.error);});}
async function slZip(str){if(typeof CompressionStream==='undefined')return new Blob([str]);const s=new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));return await new Response(s).blob();}
async function slUnzip(blob){const head=new Uint8Array(await blob.slice(0,2).arrayBuffer());if(head[0]===0x1f&&head[1]===0x8b&&typeof DecompressionStream!=='undefined'){return await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text();}return await blob.text();}
async function slPut(i,blob){try{const db=await slDB();await new Promise((ok,ko)=>{const t=db.transaction('slots','readwrite');t.objectStore('slots').put(blob,i);t.oncomplete=ok;t.onerror=()=>ko(t.error);});}catch(e){const b64=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.readAsDataURL(blob);});localStorage.setItem('imperioSlot_'+i,b64);}}
async function slGet(i){try{const db=await slDB();const b=await new Promise((ok,ko)=>{const t=db.transaction('slots','readonly');const r=t.objectStore('slots').get(i);r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error);});if(b)return b;}catch(e){}
  const s=localStorage.getItem('imperioSlot_'+i);if(!s)return null;return await (await fetch(s)).blob();}
async function slDel(i){try{const db=await slDB();await new Promise(ok=>{const t=db.transaction('slots','readwrite');t.objectStore('slots').delete(i);t.oncomplete=ok;t.onerror=ok;});}catch(e){}try{localStorage.removeItem('imperioSlot_'+i);}catch(e){}}
const slPayload=()=>{const pl=Object.assign({},P);delete pl._paper;return JSON.stringify({G:packG(G),P:pl,v:VERSION});};
function slDesc(){const n=P&&natOf(P);return {nm:P?fullName(P):'—',age:P?P.age:0,nat:n?n.id:'',natN:n?n.name:'',y:G?G.year:0,mode:G?G.mode:'',dif:G?G.dif||'m':'m',alive:P?!!P.alive:false,car:P&&P.fc?(FC[P.fc.k]||{}).n||'':P&&P.job?P.job.t||'':'',t:Date.now()};}
// los guardados van en fila: uno no pisa al otro
function slSave(i,name,quiet){const run=()=>slSave1(i,name,quiet);SL.q=(SL.q||Promise.resolve()).then(run,run);return SL.q;}
const slGid=()=>{if(G&&!G.gid)G.gid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);return G?G.gid:null;};
async function slSave1(i,name,quiet){if(!G||!P)return false;SL.busy=1;try{const str=slPayload();const blob=await slZip(str);await slPut(i,blob);
    const old=SL.meta[i]||{};SL.meta[i]=Object.assign(slDesc(),{n:name||old.n||('Partida '+(i+1)),kb:Math.round(blob.size/1024),gid:slGid()});slMetaSave();if(!quiet)toast('💾 Guardado',`Ranura ${i+1}: ${SL.meta[i].n} (${SL.meta[i].kb} KB).`);return true;}
  catch(e){toast('⚠️ No se pudo guardar',String(e&&e.message||e).slice(0,120));return false;}finally{SL.busy=0;}}
async function slLoad(i,q){const b=await slGet(i);if(!b){toast('⚠️','Esa ranura está vacía.');return false;}try{const d=JSON.parse(await slUnzip(b));if(!d||!d.G||!d.P)throw new Error('archivo dañado');
    if(P&&G&&CFG.slot!==i&&slMine())await slSave(CFG.slot,null,true); // primero se guarda la partida en curso en su ranura
    G=unpackG(d.G);P=d.P;invalidate();migrateP(P);natTotals();CFG.slot=i;saveCfg();saveNow();SHK.stack=[];closeSheet();hideModal();if(G.sel)try{centerOn(G.sel,600);}catch(e){}render();if(!q)toast('📂 Partida cargada',`${SL.meta[i]?SL.meta[i].n:'Ranura '+(i+1)}: ${fullName(P)}, ${G.year}.`);return true;}
  catch(e){toast('⚠️ No se pudo cargar',String(e&&e.message||e).slice(0,120));return false;}}
// si el guardado rápido falla (memoria del navegador llena), la partida se guarda en su ranura y se avisa una vez
{const _sn=saveNow;saveNow=function(){_sn();try{if(!G||!P)return;if(!localStorage.getItem(SAVE_KEY)){if(!SL.warned){SL.warned=1;toast('⚠️ Memoria del navegador llena','La partida se guarda en su ranura de 💾 Partidas. Borra ranuras que no uses si el aviso sigue.');}if(SL.meta[CFG.slot]||CFG.slot>=0)slSave(Math.max(0,CFG.slot),null,true);}}catch(e){}};}
const slFirstFree=()=>{for(let i=0;i<SLOTS_MAX;i++)if(!SL.meta[i])return i;return -1;};
// autoguardado de la ranura activa: al cambiar de año y al salir o cambiar de app
// (solo si la ranura activa es de esta misma partida: al empezar una partida nueva no se pisa la anterior)
const slMine=()=>{const m=SL.meta[CFG.slot];return !!(m&&G&&(!m.gid||m.gid===slGid()));};
{let lastY=null,lastG=null;const _r=render;render=function(){_r();try{const g=G?slGid():null;if(G&&P&&g===lastG&&lastY!==null&&G.year!==lastY&&slMine())slSave(CFG.slot,null,true);lastY=G?G.year:null;lastG=g;}catch(e){}};}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&G&&P&&slMine()){try{saveNow();}catch(e){}slSave(CFG.slot,null,true);}});
// migración: la partida que ya existía pasa a la ranura 1
setTimeout(()=>{if(!SL.meta.some(Boolean)&&G&&P){slSave(0,'Mi partida',true);CFG.slot=0;saveCfg();}},1500);

function showSlots(){const cur=CFG.slot;const row=i=>{const m=SL.meta[i];const on=i===cur&&!!m;
    return `<div class="wkc"${on?' style="border-color:var(--gold)"':''}><div class="h"><b>${i+1}. ${m?m.n:'Vacía'}${on?' · <span style="color:var(--gold)">en juego</span>':''}</b><span>${m?new Date(m.t).toLocaleDateString('es-MX',{day:'numeric',month:'short'})+' '+new Date(m.t).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):''}</span></div>
     ${m?`<div class="tx" style="font-size:12px;color:var(--mut);margin-top:3px">${m.nat?flag(m.nat,11)+' ':''}${m.nm}, ${m.age} años${m.alive?'':' (fallecido)'} · ${m.y} · ${MODES[m.mode]||''} · ${(DIFS[m.dif]||DIFS.m).ic} ${(DIFS[m.dif]||DIFS.m).n}${m.car?' · '+m.car:''} · ${m.kb} KB</div>`:''}
     <div class="bt" style="margin-top:6px">${m&&!on?`<button class="g" data-sl="load" data-i="${i}">📂 Cargar</button>`:''}${P?`<button data-sl="save" data-i="${i}">${on?'💾 Guardar ahora':m?'Sobrescribir con la actual':'💾 Guardar aquí'}</button>`:''}${m?`<button data-sl="ren" data-i="${i}">✏️</button><button data-sl="exp" data-i="${i}">📤</button><button data-sl="del" data-i="${i}">🗑️</button>`:''}</div></div>`;};
  openSheetRaw(`<h3>💾 Partidas guardadas</h3><div class="hint" style="margin-bottom:8px">${SLOTS_MAX} ranuras. La partida en juego se guarda sola en su ranura cada año y al salir de la app. 📤 copia una partida como texto para pasarla a otro dispositivo; para traerla, usa «Importar».</div>
    ${[...Array(SLOTS_MAX).keys()].map(row).join('')}
    <div class="sect">Importar</div><textarea id="slIn" rows="3" style="width:100%;background:var(--card2);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:8px;font-size:12px" placeholder="Pega aquí el texto de una partida exportada"></textarea>
    <div class="bt"><button data-sl="imp">📥 Importar en la primera ranura libre</button></div>`,b=>{
    b.querySelectorAll('[data-sl]').forEach(x=>x.onclick=async()=>{const a=x.dataset.sl,i=+x.dataset.i;
      if(a==='load'){askText(`¿Cargar «${SL.meta[i].n}»? La partida en juego se guarda antes en su ranura.`,null,()=>slLoad(i),'Cargar');}
      else if(a==='save'){if(SL.meta[i]&&i!==cur)askText(`¿Sobrescribir «${SL.meta[i].n}» con la partida en juego?`,null,async()=>{await slSave(i,null);CFG.slot=i;saveCfg();showSlots();},'Sobrescribir');else{await slSave(i,null);CFG.slot=i;saveCfg();showSlots();}}
      else if(a==='ren'){askText('Nombre de la partida',SL.meta[i].n,v=>{SL.meta[i].n=clean(String(v||'').trim()).slice(0,30)||SL.meta[i].n;slMetaSave();showSlots();},'Guardar');}
      else if(a==='del'){askText(`¿Borrar «${SL.meta[i].n}»? No se puede deshacer.`,null,async()=>{await slDel(i);SL.meta[i]=null;slMetaSave();showSlots();},'Borrar');}
      else if(a==='exp'){const bl=await slGet(i);if(!bl)return;const z=await slZip(await slUnzip(bl));const b64=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.readAsDataURL(z);});const txt='IMPERIO1:'+b64;
        try{await navigator.clipboard.writeText(txt);toast('📤 Copiado',`La partida (${Math.round(txt.length/1024)} KB de texto) está en el portapapeles.`);}catch(e){b.querySelector('#slIn').value=txt;toast('📤','No se pudo copiar solo: el texto quedó en el cuadro de Importar; cópialo de ahí.');}}
      else if(a==='imp'){const v=b.querySelector('#slIn').value.trim();const k=slFirstFree();if(k<0){toast('⚠️','No hay ranuras libres: borra una primero.');return;}
        try{const b64=v.replace(/^IMPERIO1:/,'');const bin=atob(b64);const u=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)u[j]=bin.charCodeAt(j);const blob=new Blob([u]);const d=JSON.parse(await slUnzip(blob));if(!d.G||!d.P)throw 0;
          await slPut(k,blob);const n=d.P.first+' '+(d.P.surname||'');SL.meta[k]={n:'Importada: '+n,nm:n,age:d.P.age,nat:'',y:d.G.year,mode:d.G.mode,dif:d.G.dif||'m',alive:!!d.P.alive,car:'',t:Date.now(),kb:Math.round(blob.size/1024)};slMetaSave();toast('📥 Importada',`Quedó en la ranura ${k+1}.`);showSlots();}
        catch(e){toast('⚠️','Ese texto no es una partida válida.');}}});});}

/* ===================== TEMAS ===================== */
const THEMES={noche:['🌙 Noche','El tema original: oscuro y sobrio'],deportivo:['🏟️ Deportivo','Azul marino y dorado, como los simuladores deportivos'],claro:['🏢 Corporativo','Claro, limpio, para leer mucho'],
  amigable:['🌤️ Amigable','Cálido y redondeado'],retro:['💾 Retro','Monitor verde de los 80'],medieval:['🏰 Medieval','Pergamino y tinta'],neon:['🌆 Dinámico','Neón sobre negro']};
(function(){const st=document.createElement('style');st.textContent=`
:root{--well:#0f1722;--ink2:#cbd5e1;--line2:#283243;--glass:rgba(16,24,36,.96);--rad:12px}
html[data-theme=deportivo]{--bg:#0a1a36;--card:#10244a;--card2:#163059;--line:#28477a;--ink:#eef3fb;--mut:#9db0cf;--gold:#f6b93b;--teal:#36c5d6;--well:#0c1f42;--ink2:#d4def0;--line2:#2c4c80;--glass:rgba(14,32,66,.96)}
html[data-theme=claro]{--bg:#eef2f7;--card:#ffffff;--card2:#f4f6fa;--line:#d6dde7;--ink:#172033;--mut:#5c6a7e;--gold:#b7791f;--teal:#1f8f84;--red:#c53030;--green:#2f855a;--blue:#2b6cb0;--well:#eef2f7;--ink2:#2d3748;--line2:#cbd5e0;--glass:rgba(255,255,255,.96)}
html[data-theme=amigable]{--bg:#fff6ec;--card:#ffffff;--card2:#fff0e0;--line:#f0d8c0;--ink:#3b2a1e;--mut:#8b6d58;--gold:#e0781b;--teal:#2a9d8f;--red:#d1495b;--green:#3a9d5d;--blue:#3a7bd5;--well:#fff3e6;--ink2:#4a3626;--line2:#ecd2b8;--glass:rgba(255,255,255,.96);--rad:18px}
html[data-theme=retro]{--bg:#040904;--card:#081208;--card2:#0d1c0d;--line:#1e4a1e;--ink:#b6f7ae;--mut:#5fae58;--gold:#ffcc33;--teal:#4be0c0;--red:#ff5d5d;--green:#7dff6e;--blue:#6ec3ff;--well:#061006;--ink2:#a4e89c;--line2:#1b401b;--glass:rgba(6,16,6,.96);--rad:2px}
html[data-theme=medieval]{--bg:#e8dbbd;--card:#f4ead2;--card2:#ecdfbf;--line:#c4ab7c;--ink:#3a2814;--mut:#6e5638;--gold:#8f5a0f;--teal:#3d6b5a;--red:#8e1f1f;--green:#3f6b2a;--blue:#2c4f7c;--well:#efe2c4;--ink2:#4a3620;--line2:#c9b183;--glass:rgba(244,234,210,.97);--rad:6px}
html[data-theme=neon]{--bg:#09051a;--card:#120b28;--card2:#1a1036;--line:#3a2470;--ink:#f3edff;--mut:#a897d4;--gold:#ff3ea5;--teal:#22e1ff;--red:#ff4d6d;--green:#3dffb0;--blue:#22e1ff;--well:#0d0820;--ink2:#e2d8ff;--line2:#3c2775;--glass:rgba(18,11,40,.96)}
html[data-theme=retro] body,html[data-theme=retro] button,html[data-theme=retro] input,html[data-theme=retro] select{font-family:"Courier New",ui-monospace,monospace!important}
html[data-theme=medieval] body,html[data-theme=medieval] button,html[data-theme=medieval] input,html[data-theme=medieval] select{font-family:Georgia,"Times New Roman",serif!important}
html[data-theme=amigable] body,html[data-theme=amigable] button{font-family:"Trebuchet MS","Segoe UI Rounded",system-ui,sans-serif!important}
html[data-theme=claro] .bottom,html[data-theme=amigable] .bottom,html[data-theme=medieval] .bottom{box-shadow:0 -4px 14px rgba(0,0,0,.12)}
html[data-theme=claro] .overlay,html[data-theme=amigable] .overlay,html[data-theme=medieval] .overlay{background:rgba(30,30,40,.28)}
.card,.sheet,.modal,.item,.wkc,.opt{border-radius:var(--rad)}
html[data-theme=medieval] h2,html[data-theme=medieval] h3{letter-spacing:.04em}
html[data-theme=retro] .card,html[data-theme=retro] .sheet{box-shadow:0 0 0 1px #1e4a1e,0 0 18px rgba(80,255,80,.08)}
html[data-theme=neon] .btn.gold,html[data-theme=neon] #ageBtn{box-shadow:0 0 14px rgba(255,62,165,.55)}
/* piezas que tenían colores oscuros fijos y deben seguir el tema */
.nav{background:var(--card)!important;background-image:none!important;color:var(--ink)!important}
.nav.on{background:var(--well)!important;color:var(--gold)!important}
#clk .in{background:var(--glass)!important;border-color:var(--line2)!important}
#clk button{color:var(--mut)!important}#clk button.on{background:var(--gold)!important;color:#fff!important}
html[data-theme=noche] #clk button.on,html[data-theme=deportivo] #clk button.on,html[data-theme=retro] #clk button.on{color:#1a1405!important}
#clk .ci{color:var(--ink2)!important}
html[data-theme=claro] #clk .ci,html[data-theme=amigable] #clk .ci,html[data-theme=medieval] #clk .ci{text-shadow:none!important}
#topCard,#topCard .name,#topCard b{color:#eef2f7}#topCard .sub,#topCard small{color:#c9d3df}
.bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.bt button{flex:1 1 auto;border:1px solid var(--line2);background:var(--card2);color:var(--ink);border-radius:9px;padding:7px 8px;font-size:12.5px}
.bt button.g{border-color:var(--gold);color:var(--gold);font-weight:800}.bt button:disabled{opacity:.4}
html[data-theme=claro] .who,html[data-theme=amigable] .who,html[data-theme=medieval] .who{color:var(--ink)}
/* ===== vista horizontal: mapa grande a la izquierda y paneles a la derecha ===== */
body.land .app{max-width:none;display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,34vw);grid-auto-rows:min-content;column-gap:10px;align-items:start;padding:8px 10px calc(var(--navh) + 10px)}
body.land .app>*{grid-column:2}
body.land .app>.mapcard{grid-column:1;grid-row:1 / span 30;position:sticky;top:8px;margin:0}
body.land #mapWrap{width:100%!important;max-width:none!important;aspect-ratio:auto!important;height:calc(100vh - var(--navh) - 34px)}
body.land #map,body.land #lc,body.land #glc,body.land #mapOv{aspect-ratio:auto!important;width:100%!important;height:100%!important}
body.land .bottom{padding:4px 10px calc(4px + env(safe-area-inset-bottom))}
body.land .bottom .in{grid-template-columns:repeat(5,minmax(0,112px));justify-content:center;gap:6px}
body.land #clk{flex-direction:row!important;gap:10px!important;margin:0 0 4px!important}
body.land .nav{flex-direction:row;justify-content:center;gap:5px;padding:6px 4px;font-size:12px}
body.land #ageBtn{padding:9px 4px;font-size:14px;border-radius:12px}
body.land .sheet{left:auto;right:0;top:0;width:min(460px,42vw);max-height:none;border-radius:16px 0 0 16px;transform:translateX(105%);border-left:1px solid var(--line)}
body.land .sheet.on{transform:translateX(0)}
body.land .overlay{background:transparent}
body.land .bottom .in{max-width:760px}
`;document.head.appendChild(st);})();
function applyTheme(){const t=THEMES[CFG.theme]?CFG.theme:'noche';document.documentElement.dataset.theme=t;const mc=document.querySelector('meta[name=theme-color]');if(mc)mc.content=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();}
function applyOrient(){try{const mc=document.getElementById('mapWrap');if(mc&&mc.closest('.card'))mc.closest('.card').classList.add('mapcard');}catch(e){}const o=CFG.orient||'auto';const wide=innerWidth>innerHeight&&innerWidth>=700;const land=o==='h'?innerWidth>=600:o==='v'?false:wide;if(document.body.classList.contains('land')!==land){document.body.classList.toggle('land',land);try{if(typeof resizeMap==='function')resizeMap();else dispatchEvent(new Event('resize'));}catch(e){}}}
applyTheme();applyOrient();addEventListener('resize',()=>{clearTimeout(applyOrient._t);applyOrient._t=setTimeout(applyOrient,150);});addEventListener('orientationchange',()=>setTimeout(applyOrient,300));

/* ===================== Ajustes: apariencia, vista y dificultad ===================== */
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const box=document.createElement('div');
  const dif=(G&&G.dif)||'m';
  box.innerHTML=`<div class="sect">🎨 Tema</div><div class="chips">${Object.entries(THEMES).map(([k,v])=>`<button data-th="${k}" class="${(CFG.theme||'noche')===k?'on':''}" title="${v[1]}">${v[0]}</button>`).join('')}</div>
   <div class="sect">📱 Vista</div><div class="seg">${[['auto','Automática','según cómo sostengas el teléfono'],['v','Vertical','siempre una columna'],['h','Horizontal','mapa grande y paneles a un lado']].map(([k,n,d])=>`<button data-or="${k}" class="${(CFG.orient||'auto')===k?'on':''}">${n}<br><small>${d}</small></button>`).join('')}</div>
   ${G?`<div class="sect">🎯 Dificultad de esta partida</div><div class="seg">${Object.entries(DIFS).map(([k,v])=>`<button data-df="${k}" class="${dif===k?'on':''}">${v.ic} ${v.n}</button>`).join('')}</div><div class="hint">${DIFS[dif].d}</div>`:''}
   <div class="sect">💾 Partidas</div><button class="item" id="cfSl"><span><div class="t">💾 Partidas guardadas</div><div class="s">Ranura en juego: ${CFG.slot+1}${SL.meta[CFG.slot]?' · '+SL.meta[CFG.slot].n:''}</div></span></button>`;
  const h=b.querySelector('h3');(h&&h.nextSibling?b.insertBefore(box,h.nextSibling):b.appendChild(box));
  box.querySelectorAll('[data-th]').forEach(x=>x.onclick=()=>{CFG.theme=x.dataset.th;saveCfg();applyTheme();showSettings();});
  box.querySelectorAll('[data-or]').forEach(x=>x.onclick=()=>{CFG.orient=x.dataset.or;saveCfg();applyOrient();showSettings();});
  box.querySelectorAll('[data-df]').forEach(x=>x.onclick=()=>{G.dif=x.dataset.df;if(G.dif==='f'){CFG.help=1;saveCfg();}save();showSettings();toast(DIFS[G.dif].ic+' Dificultad: '+DIFS[G.dif].n,DIFS[G.dif].d);});
  box.querySelector('#cfSl').onclick=showSlots;};}
// menú Más: acceso directo a Partidas
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');const first=b.querySelector('.item');const x=document.createElement('button');x.className='item';
  x.innerHTML=`<span><div class="t">💾 Partidas guardadas</div><div class="s">${SLOTS_MAX} ranuras · en juego: ${CFG.slot+1}${SL.meta[CFG.slot]?' · '+SL.meta[CFG.slot].n:''}</div></span>`;x.onclick=showSlots;if(first)first.parentNode.insertBefore(x,first);else b.appendChild(x);};})();
// pantalla de inicio: dificultad, ranura y cargar
{const _st=showStart;showStart=function(fresh,keepWorld){_st(fresh,keepWorld);const m=$('modal');if(!m||!m.classList.contains('on'))return;const go=m.querySelector('#sGo');if(!go)return;
  const box=document.createElement('div');let dif=(G&&keepWorld&&G.dif)||CFG.lastDif||'m';const free=slFirstFree();let slot=fresh&&!P?Math.max(0,CFG.slot):(free>=0?free:CFG.slot);
  const any=SL.meta.some(Boolean);
  box.innerHTML=`<div class="sect">Dificultad</div><div class="modes difs">${Object.entries(DIFS).map(([k,v])=>`<button class="mode df${k===dif?' on':''}" data-d="${k}"><b>${v.ic} ${v.n}</b><span>${v.d}</span></button>`).join('')}</div>
   <label class="f">Guardar en la ranura</label><select id="sSl">${[...Array(SLOTS_MAX).keys()].map(i=>`<option value="${i}" ${i===slot?'selected':''}>${i+1}. ${SL.meta[i]?SL.meta[i].n+' (se sobrescribe)':'Vacía'}</option>`).join('')}</select>`;
  go.parentNode.insertBefore(box,go);
  if(any){const lb=document.createElement('button');lb.className='opt';lb.id='sLd';lb.textContent='📂 Cargar una partida guardada';const c=m.querySelector('#sC');(c?c.after(lb):m.querySelector('h2').nextElementSibling.after(lb));lb.onclick=()=>{hideModal();showSlots();};}
  box.querySelectorAll('.df').forEach(x=>x.onclick=()=>{dif=x.dataset.d;box.querySelectorAll('.df').forEach(y=>y.classList.toggle('on',y===x));});
  const prevGo=go.onclick;go.onclick=async(ev)=>{const k=+box.querySelector('#sSl').value;if(P&&G&&slMine()&&P.alive)await slSave(CFG.slot,null,true);CFG.slot=-1;prevGo(ev);if(!G||!P)return;G.gid=null;slGid();G.dif=dif;CFG.lastDif=dif;CFG.slot=k;saveCfg();if(dif==='f'){CFG.help=1;saveCfg();}save();
    slSave(k,`${P.first} ${P.surname||''}`.trim(),true);};};}
GUIA.splice(0,0,['💾 Partidas, dificultad, temas y vista',`<ul><li><b>Partidas:</b> ${SLOTS_MAX} ranuras (Más → 💾 Partidas guardadas). La partida en juego se guarda sola en su ranura cada año y al salir de la app; «Guardar ahora» fuerza el guardado. 📤 copia una partida como texto para pasarla a otro teléfono o computadora.</li>
<li><b>Dificultad:</b> 🌱 Fácil (+12 puntos en cada tirada, +15 % de ingresos, −10 % de gastos, menos guerras contra tu país, ayudas encendidas), ⚖️ Medio (calibrado con datos reales) y 🔥 Difícil (−10 puntos, −10 % de ingresos, +10 % de gastos, IA más agresiva). Se cambia en Ajustes.</li>
<li><b>Temas:</b> Noche, Deportivo, Corporativo, Amigable, Retro, Medieval y Dinámico (Ajustes → Tema).</li>
<li><b>Vista:</b> automática (al girar el teléfono se usa el diseño horizontal: mapa grande a la izquierda y las pantallas a la derecha), siempre vertical o siempre horizontal.</li></ul>`]);

shWrapAll(); // las pantallas nuevas también recuerdan su posición

/* v1.7g: recuperación. Si al abrir el juego falta la partida principal (imperioVida_v3) pero la ranura activa
   tiene una copia, se carga esa copia en lugar de mostrar la pantalla de inicio. Se pierde como mucho lo jugado
   desde el último guardado de la ranura (cada año y al salir de la app). Visto en pruebas: tras recargar,
   a veces la clave principal ya no estaba en localStorage aunque las ranuras sí. */
setTimeout(async()=>{try{
  if(P||localStorage.getItem(SAVE_KEY))return;const i=CFG.slot;if(i==null||i<0)return;
  const b=await slGet(i);if(!b||P)return;
  if(await slLoad(i,true)){SL.recovered=i+1;const m=SL.meta[i];
    const w=m&&m.t?new Date(m.t).toLocaleDateString('es-MX',{day:'numeric',month:'short'})+' '+new Date(m.t).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):'';
    toast('♻️ Partida recuperada',w?`Se recuperó desde la ranura ${i+1} (guardada el ${w}).`:`Partida recuperada desde la ranura ${i+1}.`);}
}catch(e){}},400);
