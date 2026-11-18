/* ===== v1.7b: reloj de 12 horas en pantalla, botón «Hora», día y noche en el mapa y en la escena ===== */
(function(){const st=document.createElement('style');st.textContent=`
#mapWrap .dnv,#topCard .dnv{position:absolute;inset:0;pointer-events:none;transition:background 1.2s,opacity 1.2s;z-index:2}
#topCard{position:relative;overflow:hidden}#topCard .dnv{z-index:0;border-radius:inherit}#topCard>*:not(.dnv):not(#stageBg){position:relative;z-index:1}
.dnv.fr-madrugada{background:linear-gradient(180deg,rgba(4,8,30,.62),rgba(8,14,44,.48))}
.dnv.fr-noche{background:linear-gradient(180deg,rgba(10,18,60,.5),rgba(16,26,70,.34))}
.dnv.fr-alba{background:linear-gradient(180deg,rgba(255,160,90,.18),rgba(255,210,150,.06))}
.dnv.fr-ocaso{background:linear-gradient(180deg,rgba(255,110,60,.22),rgba(120,40,90,.12))}
.dnv.fr-dia{background:transparent}
#topCard .dnv.fr-noche::after,#topCard .dnv.fr-madrugada::after{content:'';position:absolute;inset:0;background-image:radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 38% 12%,#fff,transparent),radial-gradient(1.5px 1.5px at 66% 28%,#fff,transparent),radial-gradient(1px 1px at 84% 10%,#fff,transparent),radial-gradient(1px 1px at 52% 40%,#cfe,transparent);opacity:.7}
#clk .ci .hr{font-weight:700;color:var(--ink)}`;document.head.appendChild(st);})();
// botón «Hora» en el selector de unidades
TUN.h=['Hora','HORA'];TUO.unshift('h');
(function(){const c=$('clk')&&$('clk').querySelector('.in');if(!c)return;const b=document.createElement('button');b.dataset.u='h';b.textContent='Hora';c.insertBefore(b,c.firstChild);b.onclick=()=>{CFG.tu='h';saveCfg();clockUI();};})();
{const _au=advanceUnit;advanceUnit=function(u){if(u!=='h')return _au(u);if(!P||!P.alive||blockedTurn()){render();return;}ensureClock();clockHours(1);save();render();};}
// cada acción toma horas del día
{const _ua=useAct;useAct=function(fn,t){if(!P){return _ua(fn,t);}const ft0=P.ft,n0=P.log?P.log.length:0,h0=hourOf();_ua(fn,t);try{const did=P.ft<ft0||(P.log&&P.log.length>n0&&/^😴/.test(t||''));
    if(did&&P.alive){const hh=actHrs(t);if(t==='Estudiar'&&(h0>=23||h0<5)){P.s.inteligencia=Math.max(0,P.s.inteligencia-1);}if(hh){const r=clockHours(hh);if(r&&r.months)render();}save();try{clockInfo();dayNight();}catch(e){}}}catch(e){}};}
function dayNight(){if(!G)return;const h=hourOf();const k=h<5||h>=21?(h<5?'madrugada':'noche'):h<7?'alba':h>=18?'ocaso':h>=19?'noche':'dia';
  ['mapWrap','topCard'].forEach(id=>{const w=$(id);if(!w)return;let d=w.querySelector(':scope>.dnv');if(!d){d=document.createElement('div');d.className='dnv';w.appendChild(d);}const c='dnv fr-'+(k==='noche'||k==='madrugada'?k:k);if(d.className!==c)d.className=c;});}
{const _ci=clockInfo;clockInfo=function(){_ci();const el=$('clkInfo');if(!el||!G)return;ensureClock();const f=franjaOf();el.innerHTML=el.innerHTML.replace(/(📅 <b>[^<]*<\/b>)/,`$1 · ${f[1]} <span class="hr">${hhmm(G.min)}</span>`);};}
{const _r=render;render=function(){_r();try{dayNight();}catch(e){}};}
{const _cu=clockUI;clockUI=function(){_cu();try{if(CFG.tu==='h'&&P&&P.alive&&!(G.clkRem&&G.clkRem.u==='h')){const ab=$('ageBtn');if(!/PELEAR|FUNCIÓN|PREMIOS/.test(ab.textContent))ab.textContent='+1 HORA';}}catch(e){}};}
GUIA.splice(1,0,['🕗 Reloj de 12 horas, día y noche',`<ul><li>El mundo corre por horas: la hora aparece junto a la fecha (a. m. / p. m.) y el mapa y tu escena se oscurecen de noche.</li>
<li>Cada acción muestra dos costos: ⏳ días de tu tiempo libre del año (la constancia que exige ese hábito) y 🕗 las horas que toma hoy. Si una acción cruza la medianoche, el mundo avanza un día.</li>
<li><b>Por franja:</b> 🌅 de 5 a 9 a. m. puedes correr al amanecer; el médico atiende de 8 a. m. a 7 p. m.; 🌙 de 7 p. m. a 3 a. m. puedes salir de noche (diversión, contactos, pareja… y algún riesgo); buscar pareja rinde más de noche; estudiar de madrugada cuesta concentración.</li>
<li><b>Dormir:</b> desde las 8 p. m. puedes dormir hasta las 7 a. m. Si pasas la medianoche despierto te desvelas: pierdes salud y ánimo cada noche seguida hasta que duermas. De día solo hay siesta.</li>
<li>Con la unidad <b>Hora</b> el reloj avanza de hora en hora; Día, Semana, Mes y Año conservan la hora actual.</li></ul>`]);
(function(){const prev=$('nAct').onclick;$('nAct').onclick=()=>{prev();try{document.querySelectorAll('#sheetIn .item .s').forEach(e=>{if(/^⏳ 0 días · /.test(e.textContent))e.textContent=e.textContent.replace(/^⏳ 0 días · /,'');});}catch(e){}};})();
