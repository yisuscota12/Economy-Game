/* v1.7n: noticias de la cinta: se traducen antes de recortarlas (recortadas, la capa ya no reconoce la plantilla). */
function trCut(t,n){if(typeof I18!=='undefined'&&I18)t=I18.T(t);return t.length>n?t.slice(0,n-3)+'…':t;}
/* ===== v1.2a: reloj (Día · Semana · Mes · Año · 5 años), modos, portal de noticias e imágenes propias ===== */
(function(){const st=document.createElement('style');st.textContent=`
#clk{position:fixed;left:0;right:0;bottom:calc(84px + env(safe-area-inset-bottom));z-index:30;display:flex;justify-content:center;pointer-events:none}
#clk .in{pointer-events:auto;display:flex;gap:4px;background:rgba(12,18,26,.92);border:1px solid #2b3a4e;border-radius:999px;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.35)}
#clk button{border:0;background:transparent;color:#aab6c5;font-size:12px;font-weight:700;padding:6px 10px;border-radius:999px}#clk button.on{background:#f2c14e;color:#1a1405}
#ffBtn{display:none!important}body:has(.sheet.on) #clk,body:has(.modal.on) #clk{display:none}body::after{content:'';display:block;height:52px}
body.gmvida #viewTabs button[data-v="pa"]{display:none}
#tick{margin:6px 0 0;border:1px solid #243244;border-radius:10px;background:#0d151f;overflow:hidden;white-space:nowrap;font-size:12.5px;color:#d7dee8;cursor:pointer;position:relative;height:28px}
#tick .lb{position:absolute;left:0;top:0;bottom:0;z-index:2;background:#b3261e;color:#fff;font-weight:800;padding:6px 8px;font-size:11px;letter-spacing:.06em}
#tick .rl{display:inline-block;padding:6px 0 0 100%;animation:tk 38s linear infinite}#tick .rl span{margin-right:34px}#tick .rl b{margin-right:6px}
@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-100%)}}@media (prefers-reduced-motion:reduce){#tick .rl{animation:none;padding-left:90px}}
.nwh{display:flex;align-items:center;gap:10px;margin-bottom:4px}.nwh .mast{font-family:Georgia,serif;font-size:21px;font-weight:700}.nwh small{display:block;font-size:11px;opacity:.7;font-family:system-ui}
.nwt{display:flex;gap:6px;margin:8px 0}.nwt button{flex:1;border:1px solid #334155;background:#0f1722;color:#cbd5e1;border-radius:10px;padding:8px 4px;font-size:13px;font-weight:700}.nwt button.on{border-color:#f2c14e;color:#f2c14e}
.nwi{display:flex;gap:10px;padding:10px 4px;border-bottom:1px solid #1e2a3a}.nwi .cat{width:4px;border-radius:4px;flex:none}.nwi .tx{flex:1;font-size:14px;line-height:1.38}.nwi .dt{font-size:11px;opacity:.65;margin-bottom:2px}
.nwi .tg{font-size:10.5px;font-weight:800;letter-spacing:.05em;margin-right:6px}.nwi img{width:40px;height:40px;border-radius:8px;object-fit:cover;flex:none}
.formal .nwi .tx{font-family:Georgia,"Times New Roman",serif}
.crs{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #243244;border-radius:12px;margin:8px 0;background:#0f1722}.crs .pv{width:52px;height:52px;border-radius:10px;background:#1a2433;display:flex;align-items:center;justify-content:center;font-size:22px;overflow:hidden;flex:none}
.crs .pv img{width:100%;height:100%;object-fit:cover}.crs .tt{flex:1}.crs .tt b{display:block}.crs .tt span{font-size:12px;opacity:.7}.crs button{border:1px solid #334155;background:#121b27;color:#e2e8f0;border-radius:8px;padding:6px 9px;font-size:12px;margin-left:4px}
.fimg{position:relative;display:inline-block}.fimg i{position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-style:normal;font-size:14px}
textarea.bk{width:100%;height:120px;background:#0b1118;color:#cbd5e1;border:1px solid #334155;border-radius:8px;font-size:11px}`;document.head.appendChild(st);})();

/* ----- reloj ----- */
const TUN={d:['Día','DÍA'],s:['Semana','SEMANA'],m:['Mes','MES'],a:['Año','AÑO'],'5':['5 años','5 AÑOS']};const TUO=['d','s','m','a','5'];
if(!CFG.tu)CFG.tu='a';
(function(){const c=document.createElement('div');c.id='clk';c.innerHTML='<div class="in">'+TUO.map(k=>`<button data-u="${k}">${TUN[k][0]}</button>`).join('')+'</div>';document.body.appendChild(c);
  c.querySelectorAll('button').forEach(b=>b.onclick=()=>{CFG.tu=b.dataset.u;saveCfg();clockUI();});})();
function clockUI(){if(!P||!G)return;if(P.ft==null){ensureFt(P);syncActs(P);}document.querySelectorAll('#clk button').forEach(b=>b.classList.toggle('on',b.dataset.u===CFG.tu));
  const ab=$('ageBtn');if(P.alive)ab.textContent=(G&&G.clkRem&&G.clkRem.u===CFG.tu)?'▶ '+G.clkRem.n+' d':'+1 '+TUN[CFG.tu][1];ab.style.fontSize=CFG.tu==='s'||CFG.tu==='5'?'14px':'';
  document.body.classList.toggle('gmvida',gmode()==='vida');if(gmode()==='vida'&&VIEW.v==='pa'){VIEW.v='pj';try{renderView();}catch(e){}}
  tickerUI();}
function advanceUnit(u){if(!P)return;if(!P.alive){showDeath();return;}if(typeof FF_ON!=='undefined'&&FF_ON)return;if(blockedTurn()){render();return;}
  if(u==='5'){fastForward(5);return;}ensureClock();const mando=mandoActive();if(mando)ANIM.prev=snapPositions();const m=monthOfDay(G.day);
  let n=u==='d'?1:u==='s'?7:u==='m'?MCUM[m+1]-MCUM[m]:365; // v1.6d2: un mes o un año completo desde la fecha actual (antes saltaba al día 1 del mes o al 1 de enero)
  // si el avance anterior se pausó por una decisión, este toque completa lo que faltaba (la fecha conserva su secuencia)
  const pend=G.clkRem&&G.clkRem.u===u&&G.clkRem.n>0?G.clkRem.n:0;if(pend)n=pend;G.clkRem=null;const y0=G.year;
  const res=clockAdvance(n,{auto:u==='a',pauseBig:u==='a'});
  if((u==='m'||u==='a'||u==='s')&&res.done<n&&res.stop&&res.stop!=='muerte'&&P.alive){G.clkRem={u,n:n-res.done};setTimeout(()=>toast('⏸️ Pausa',(u==='a'?`El año se detuvo para una decisión. Faltan ${n-res.done} día(s): vuelve a tocar el botón para completarlo.`:u==='m'?`El mes se detuvo para una decisión. Faltan ${n-res.done} día(s): vuelve a tocar el botón para completarlo.`:`La semana se detuvo para una decisión. Faltan ${n-res.done} día(s): vuelve a tocar el botón para completarlo.`)),400);}
  if(res.months&&typeof MO!=='undefined')MO.rep=res.rep.filter(x=>x.big).slice(-4);if(MO&&MO.sel&&!armyById(MO.sel))MO.sel=null;
  save();if(G.year!==y0||P.event)sfx(P.event?'bad':'year');render();pulseConquests();if(res.months&&mando)animateMonth(res.rep.filter(x=>x.big));
  if(res.stop==='aviso'){const x=res.rep.filter(x=>x.big&&STOP_RX.test(x.t)).pop();if(x)toast('⏸️ Pausa automática',x.t);}}
$('ageBtn').onclick=()=>advanceUnit(CFG.tu);
{const _r=render;render=function(){_r();try{clockUI();}catch(e){}};}

/* ----- portal de noticias ----- */
const NWC={war:['#ff5a5a','GUERRA'],eco:['#3ccf8e','ECONOMÍA'],pol:['#f2a33a','POLÍTICA'],dip:['#5aa9ff','DIPLOMACIA'],gen:['#9aa7b6','SOCIEDAD']};
const NEG_RX=/contrajo|recesi|crisis|quiebra|desplom|cae |caída|derrota|muere|pierde/i;
function nwDate(x){const m=monthOfDay(x.d||0);return `${(x.d||0)-MCUM[m]+1} ${MES[m].toLowerCase()} ${x.y}`;}
function nwColor(x){return x.k==='eco'&&NEG_RX.test(x.t)?'#ff8a3d':NWC[x.k][0];}
function nwFilter(sc){const A=(G.nw||[]).slice().reverse();const me=natOf(P).id;
  if(sc==='int')return A.filter(x=>x.s==='int');if(sc==='nac')return A.filter(x=>x.s==='nac');
  if(sc==='reg')return A.filter(x=>x.s==='prov'&&(x.r===P.r||(RG[P.r]&&RG[P.r].adj.includes(x.r))));return A.filter(x=>x.s==='prov');}
function nwImg(x){if(!P)return '';const yk=yoKey();if(IMG[yk]&&x.t.includes(fullName(P)))return `<img src="${IMG[yk]}" alt="">`;if(IMG.logo&&P.biz&&/negocio|empresa|sucursal/i.test(x.t)&&x.t.includes(P.surname))return `<img src="${IMG.logo}" alt="">`;return '';}
function showNews(tab){if(!P||!G)return;const formal=VIEW.v==='pa';const tabs=formal?[['int','Internacional'],['nac','Nacional'],['prov','Provincias']]:[['reg','Regional'],['nac','Nacional'],['int','Internacional']];
  tab=tab||tabs[0][0];const L=nwFilter(tab).slice(0,90);const pr=RG[P.r]?RG[P.r].nm:'';
  const head=formal?`<div class="nwh"><div style="font-size:26px">🌐</div><div class="mast">Agencia Internacional de Noticias<small>Boletín oficial · ${dateStr()}</small></div></div>`
    :`<div class="nwh"><div style="font-size:26px">📰</div><div class="mast">El Diario de ${pr}<small>Edición regional · ${dateStr()}</small></div></div>`;
  const body=L.length?L.map(x=>`<div class="nwi"><div class="cat" style="background:${nwColor(x)}"></div>${nwImg(x)}<div class="tx"><div class="dt"><span class="tg" style="color:${nwColor(x)}">${NWC[x.k][1]}</span>${nwDate(x)}${x.s==='prov'&&RG[x.r]?' · '+RG[x.r].nm:''}</div>${x.t}</div></div>`).join('')
    :`<div class="hint">Sin noticias en esta sección todavía. Avanza el reloj: la simulación genera las notas a partir de lo que ocurre.</div>`;
  openSheet(`<div class="${formal?'formal':''}">${head}<div class="nwt">${tabs.map(([k,n])=>`<button data-t="${k}" class="${k===tab?'on':''}">${n}</button>`).join('')}</div>${body}</div>`,b=>b.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>showNews(x.dataset.t)));}
function tickerUI(){let t=$('tick');if(!t){const vt=$('viewTabs');if(!vt)return;t=document.createElement('div');t.id='tick';vt.parentNode.insertBefore(t,vt.nextSibling);t.onclick=()=>showNews();}
  const formal=VIEW.v==='pa';const L=(G.nw||[]).slice(-40).reverse().filter(x=>formal?x.s!=='prov'||RG[x.r]&&RG[x.r].n===natOf(P).id:true).slice(0,7);
  const k=L.map(x=>x.t).join('|')+formal;if(t._k===k)return;t._k=k;
  t.innerHTML=`<div class="lb">${formal?'AGENCIA':'NOTICIAS'}</div><div class="rl">${L.length?L.map(x=>`<span><b style="color:${nwColor(x)}">●</b>${trCut(x.t,140)}</span>`).join(''):'<span>Toca para abrir el portal de noticias.</span>'}</div>`;}

/* ----- imágenes propias (IndexedDB; reducidas a 256 px) ----- */
const IMG={};const IMGDB={db:null};const FLAG0={};
function idbOpen(){return new Promise((res,rej)=>{try{const r=indexedDB.open('imperioImg',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});}
(async function(){try{const db=await idbOpen();IMGDB.db=db;const rq=db.transaction('img').objectStore('img').openCursor();
  rq.onsuccess=()=>{const c=rq.result;if(c){IMG[c.key]=c.value;c.continue();}else{applyImgs();try{if(P)render();}catch(e){}}};}catch(e){}})();
function imgPut(k,v){IMG[k]=v;try{IMGDB.db.transaction('img','readwrite').objectStore('img').put(v,k);}catch(e){toast('⚠️ Imagen','Tu navegador no permite guardar imágenes: se usará solo en esta sesión.');}applyImgs();}
function imgDel(k){delete IMG[k];try{IMGDB.db.transaction('img','readwrite').objectStore('img').delete(k);}catch(e){}applyImgs();}
const yoKey=()=>P?'yo:'+P.first+'|'+P.surname+'|'+(P.gen||1):'';
function applyImgs(){try{$('pAv')._k=null;}catch(e){}if(typeof FLAG==='undefined')return;for(const k in FLAG0){FLAG[k]=FLAG0[k];delete FLAG0[k];}
  for(const k in IMG)if(k.startsWith('flag:')){const n=k.slice(5);if(!(n in FLAG0))FLAG0[n]=FLAG[n];FLAG[n]=IMG[k];}}
{const _f=face;face=function(x,size,o){const k=x===P?yoKey():(x&&x.name?'per:'+x.name:null);if(k&&IMG[k]){o=o||{};
  return `<span class="fimg" style="width:${size}px;height:${size}px"><img src="${IMG[k]}" alt="" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:50%;${o.dead?'filter:grayscale(1);':''}">${o.crown?'<i>👑</i>':''}</span>`;}return _f(x,size,o);};}
function compressImg(file,alpha){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(fr.error);fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('img'));im.onload=()=>{
  const s=Math.min(1,256/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  let u=c.toDataURL('image/webp',.85);if(!u.startsWith('data:image/webp'))u=alpha?c.toDataURL('image/png'):c.toDataURL('image/jpeg',.85);res(u);};im.src=fr.result;};fr.readAsDataURL(file);});}
function pickImg(key,alpha){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async()=>{const f=i.files&&i.files[0];if(!f)return;try{imgPut(key,await compressImg(f,alpha));save();render();showCreations();}catch(e){toast('⚠️ Imagen','No se pudo leer esa imagen.');}};i.click();}
function showCreations(){if(!P)return;const n=natOf(P),sur=P.surname;const slots=[[yoKey(),'Tu retrato',fullName(P),'👤',0]];
  if(P.partner)slots.push(['per:'+P.partner.name,'Retrato de tu pareja',P.partner.name,'💞',0]);(P.children||[]).forEach(c=>slots.push(['per:'+c.name,`Retrato de ${c.name}`,`${c.sex==='F'?'Hija':'Hijo'} · ${c.age} años`,'🧒',0]));
  slots.push(['flag:'+n.id,`Bandera de ${n.name}`,'Se usa en los paneles, el ranking y las noticias de tu partida','🏳️',1],['logo','Logo de tu negocio','Aparece en las noticias de tu empresa','🏪',1],['escudo:'+sur,`Escudo de la Casa ${sur}`,'Aparece en Dinastía y herencia','🛡️',1]);
  openSheet(`<h3>🎨 Mis creaciones</h3><div class="hint">Importa imágenes desde tu teléfono o computadora. Se reducen a 256 px (~15 KB) y se guardan en este navegador, separadas de la partida.</div>`+
    slots.map(([k,t,s,ic,a],i)=>`<div class="crs"><div class="pv">${IMG[k]?`<img src="${IMG[k]}" alt="">`:ic}</div><div class="tt"><b>${t}</b><span>${s}</span></div><button data-i="${i}">${IMG[k]?'Cambiar':'Importar'}</button>${IMG[k]?`<button data-x="${i}">Quitar</button>`:''}</div>`).join('')+
    `<div class="sect">Copia de seguridad</div><div class="hint">Tus imágenes viven en este navegador. Copia el texto para llevarlas a otro equipo y pégalo ahí.</div><button class="item" id="cbE"><span><div class="t">📤 Exportar (copiar texto)</div></span></button><button class="item" id="cbI"><span><div class="t">📥 Importar (pegar texto)</div></span></button><div id="cbBox"></div>`,b=>{
    b.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{const s=slots[+x.dataset.i];pickImg(s[0],s[4]);});
    b.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{imgDel(slots[+x.dataset.x][0]);save();render();showCreations();});
    b.querySelector('#cbE').onclick=async()=>{const t=JSON.stringify(IMG);b.querySelector('#cbBox').innerHTML=`<textarea class="bk" readonly>${t.replace(/</g,'&lt;')}</textarea>`;try{await navigator.clipboard.writeText(t);toast('📋 Copiado',`${Object.keys(IMG).length} imágenes (${Math.round(t.length/1024)} KB).`);}catch(e){toast('📋','Selecciona y copia el texto.');}};
    b.querySelector('#cbI').onclick=()=>{const box=b.querySelector('#cbBox');box.innerHTML='<textarea class="bk" placeholder="Pega aquí tu copia de seguridad"></textarea><button class="btn gold" id="cbOk" style="width:100%;margin-top:6px">Importar</button>';
      box.querySelector('#cbOk').onclick=()=>{try{const o=JSON.parse(box.querySelector('textarea').value);let k=0;for(const x in o)if(typeof o[x]==='string'&&o[x].startsWith('data:image/')){imgPut(x,o[x]);k++;}toast('📥 Listo',`${k} imágenes importadas.`);render();showCreations();}catch(e){toast('⚠️','El texto no es una copia válida.');}};};});}
// escudo en la hoja de Dinastía
{const _sd=showDynasty;showDynasty=function(){_sd();const k='escudo:'+P.surname,h=$('sheetIn').querySelector('h3');if(h&&IMG[k])h.insertAdjacentHTML('afterbegin',`<img src="${IMG[k]}" alt="" style="width:34px;height:34px;object-fit:contain;vertical-align:middle;margin-right:6px">`);};}

/* ----- entradas en Más ----- */
(function(){const prev=$('nMore').onclick;$('nMore').onclick=()=>{prev();const b=$('sheetIn');const first=b.querySelector('.item');
  const mk=(t,s,fn)=>{const x=document.createElement('button');x.className='item';x.innerHTML=`<span><div class="t">${t}</div><div class="s">${s}</div></span>`;x.onclick=fn;return x;};
  const a=mk('📰 Noticias','Portal regional, nacional e internacional',()=>showNews()),c=mk('🎨 Mis creaciones','Importa retratos, bandera, logo y escudo',showCreations);
  if(first){b.insertBefore(a,first);b.insertBefore(c,first);}else b.append(a,c);};})();
