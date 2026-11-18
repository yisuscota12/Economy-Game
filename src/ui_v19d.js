/* ===== v1.9d (fase 2 de la ruta 9d, parte 4: cierra la fase) — interfaz =====
   1) Partículas propias en Canvas 2D (sin librerías; en vez de PixiJS): monedas al ganar mucho dinero de golpe, confeti, estrellas y
      chispas que acompañan las animaciones Lottie de logro/ascenso/victoria, y chispas con humo en las batallas que se ven en el mapa.
      Ajustes → ✨ Partículas (Automático / Sí / No); en automático siguen las mismas reglas que Lottie (Toshiba: apagadas solas).
      Usan su propio generador de azar: nunca tocan Math.random (la simulación y las pruebas con semilla quedan iguales).
   2) Sonido: el sintetizador de la v0.4 (WebAudio, sin archivos) pasa por un bus maestro con volumen (Bajo / Medio / Alto) y un
      compresor; la música se puede apagar aparte; se desbloquea también con touchend/click (iPhone) y al volver a la app; sonidos
      nuevos: abrir pantalla, aviso, logro, ascenso, victoria, monedas y derrota.
   3) Mover arrastrando: mantén presionado (0.3 s) el marcador de tu ejército en el mapa y arrástralo a la provincia destino; una línea
      y una etiqueta con el nombre muestran a dónde va; al soltar se da la misma orden que «Mover» (onMapPick con MO.ord).
   4) Estilo nuevo en Bancos (Cuentas), Mis empresas (resumen y detalle), Servicios y Mesa de operaciones / tu fondo. */

/* ---------- utilidades ---------- */
const V19R=(()=>{let s=(Date.now()^0x9e3779b9)>>>0;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};})();   // azar solo para efectos
const v19Rn=(a,b)=>a+(b-a)*V19R();
function v19ScrPos(rid){try{const c=RG[rid]&&RG[rid].c;const w=$('mapWrap');if(!c||!w)return null;const b=w.getBoundingClientRect();const x=b.left+(c[0]-vb.x)/vb.w*b.width,y=b.top+(c[1]-vb.y)/vb.h*b.height;
  if(x<b.left||x>b.right||y<b.top||y>b.bottom||!b.width)return null;return [x,y];}catch(e){return null;}}

/* ---------- 1) partículas ---------- */
if(CFG.pfx===undefined)CFG.pfx='auto';
const PFX={cv:null,cx:null,L:[],raf:0,dpr:1,t:0,n:0,last:''};
const PFX_MAX=180,PFX_CONF=['#2eb5a8','#4590ee','#5ac76b','#f7c940','#9e6ee0','#f28c38'];
function pfxOn(){const m=CFG.pfx||'auto';if(m==='off')return false;if(m==='on')return true;
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}
  try{if(typeof mapMode!=='undefined'&&mapMode&&mapMode!=='gl')return false;if(CFG.mfx===0)return false;}catch(e){}
  return (navigator.hardwareConcurrency||4)>2;}
function pfxSize(){const c=PFX.cv;if(!c)return;const d=Math.min(2,window.devicePixelRatio||1);PFX.dpr=d;c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);}
function pfxCv(){if(!PFX.cv||!PFX.cv.isConnected){const c=document.createElement('canvas');c.id='pfx';c.setAttribute('aria-hidden','true');document.body.appendChild(c);PFX.cv=c;PFX.cx=c.getContext('2d');pfxSize();}
  PFX.cv.style.display='block';return PFX.cx;}
addEventListener('resize',()=>{if(PFX.cv)pfxSize();});
// tipos: coin (moneda que gira), conf (confeti), star (estrella de 4 puntas), spark (chispa), smoke (humo)
function pfxAdd(p){if(PFX.L.length>=PFX_MAX)return;PFX.L.push(Object.assign({age:0,rot:0,vr:0,g:0,drag:1,sz:6,life:60,a:1},p));}
function pfxBurst(kind,x,y,n,o){if(!pfxOn()||!(x>=0)||!(y>=0))return 0;pfxCv();o=o||{};let k=0;
  for(let i=0;i<n&&PFX.L.length<PFX_MAX;i++,k++){
    if(kind==='coin'){const an=v19Rn(-2.5,-.64),sp=v19Rn(3.5,7.5);pfxAdd({k:'coin',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,g:.26,drag:.995,sz:v19Rn(5,7.5),life:v19Rn(55,80),rot:v19Rn(0,6.3),vr:v19Rn(.15,.35)});}
    else if(kind==='conf'){const W=innerWidth;pfxAdd({k:'conf',x:o.rain?v19Rn(0,W):x,y:o.rain?v19Rn(-60,-5):y,vx:o.rain?v19Rn(-1,1):v19Rn(-6,6),vy:o.rain?v19Rn(1.5,3.5):v19Rn(-9,-2),g:o.rain?.04:.16,drag:.985,sz:v19Rn(4,6.5),life:o.rain?v19Rn(110,160):v19Rn(70,100),rot:v19Rn(0,6.3),vr:v19Rn(-.3,.3),c:PFX_CONF[i%PFX_CONF.length],sw:v19Rn(0,6.3)});}
    else if(kind==='star'){const an=v19Rn(0,6.3),sp=v19Rn(1.5,4.5);pfxAdd({k:'star',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-(o.up?2:0),g:o.up?-.03:.02,drag:.96,sz:v19Rn(4,8),life:v19Rn(40,65),rot:v19Rn(0,1.6),vr:v19Rn(-.08,.08),c:o.c});}
    else if(kind==='spark'){const an=v19Rn(0,6.3),sp=v19Rn(2.5,6.5);pfxAdd({k:'spark',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-1,g:.12,drag:.93,sz:v19Rn(1.2,2.2),life:v19Rn(18,32)});}
    else if(kind==='smoke'){pfxAdd({k:'smoke',x:x+v19Rn(-6,6),y:y+v19Rn(-4,4),vx:v19Rn(-.4,.4),vy:v19Rn(-.9,-.3),g:0,drag:.98,sz:v19Rn(5,9),life:v19Rn(45,70)});}}
  PFX.n+=k;PFX.last=kind;if(!PFX.raf){PFX.t=performance.now();PFX.raf=requestAnimationFrame(pfxStep);}return k;}
function pfxStar(c,s){c.beginPath();for(let i=0;i<8;i++){const r=i%2?s*.38:s,a=i*Math.PI/4-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();}
function pfxStep(now){const c=PFX.cx,cv=PFX.cv;if(!c||!cv){PFX.raf=0;return;}const dt=Math.min(3,Math.max(.5,(now-PFX.t)/16.67));PFX.t=now;const d=PFX.dpr;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.setTransform(d,0,0,d,0,0);const H=innerHeight+40;
  PFX.L=PFX.L.filter(p=>{p.age+=dt;if(p.age>=p.life||p.y>H)return false;p.vx*=Math.pow(p.drag,dt);p.vy=p.vy*Math.pow(p.drag,dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    const q=p.age/p.life,fade=q>.7?1-(q-.7)/.3:1;c.save();c.translate(p.x,p.y);
    if(p.k==='coin'){const sx=Math.abs(Math.cos(p.rot))*.85+.15;c.scale(sx,1);c.globalAlpha=fade;c.fillStyle='#b8860b';c.beginPath();c.arc(0,0,p.sz,0,6.283);c.fill();c.fillStyle='#f6c945';c.beginPath();c.arc(0,0,p.sz*.78,0,6.283);c.fill();
      c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(-p.sz*.25,-p.sz*.3,p.sz*.22,0,6.283);c.fill();}
    else if(p.k==='conf'){p.sw+=.12*dt;c.rotate(p.rot);c.scale(1,Math.abs(Math.cos(p.sw))*.8+.2);c.globalAlpha=fade;c.fillStyle=p.c;c.fillRect(-p.sz/2,-p.sz*.8,p.sz,p.sz*1.6);}
    else if(p.k==='star'){c.rotate(p.rot);const s=p.sz*(q<.25?q/.25:1);c.globalAlpha=fade;c.fillStyle=p.c||'#fff6c9';pfxStar(c,s);c.fill();c.strokeStyle='rgba(242,193,78,.9)';c.lineWidth=1;c.stroke();}
    else if(p.k==='spark'){c.globalCompositeOperation='lighter';c.globalAlpha=fade;c.strokeStyle=q<.4?'#fff1b0':'#ff8a3d';c.lineWidth=p.sz;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(-p.vx*2.2,-p.vy*2.2);c.stroke();}
    else if(p.k==='smoke'){const s=p.sz*(1+q*1.6);c.globalAlpha=.35*(1-q);c.fillStyle='#8c8c8c';c.beginPath();c.arc(0,0,s,0,6.283);c.fill();}
    c.restore();return true;});
  if(PFX.L.length)PFX.raf=requestAnimationFrame(pfxStep);else{PFX.raf=0;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);cv.style.display='none';}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){PFX.L=[];}});
// efectos por momento
function pfxMoment(name){const el=$('lotfx');let x=innerWidth/2,y=innerHeight*.34;if(el){const b=el.getBoundingClientRect();x=b.left+b.width/2;y=b.top+b.height/2;}
  if(name==='victoria'){pfxBurst('conf',x,y,46);pfxBurst('conf',x,y,36,{rain:1});}
  else if(name==='logro'){pfxBurst('star',x,y,22);}
  else if(name==='ascenso'){pfxBurst('star',x,y+30,20,{up:1});pfxBurst('spark',x,y+40,10);}}
function pfxCoinsAt(el){if(!el)return;const b=el.getBoundingClientRect();if(!b.width)return;pfxBurst('coin',b.left+b.width/2,b.top+b.height/2,16);}

/* ---------- 2) sonido: bus maestro, volumen, música aparte, sonidos nuevos ---------- */
if(CFG.vol===undefined)CFG.vol=2;if(CFG.mus===undefined)CFG.mus=1;
const SND_VOL=[0,.45,.8,1.25];
function sndBus(){const c=SND.ctx;if(!c)return null;if(!SND.g){try{SND.cmp=c.createDynamicsCompressor();SND.cmp.threshold.value=-14;SND.cmp.knee.value=12;SND.cmp.ratio.value=4;SND.cmp.connect(c.destination);
  SND.g=c.createGain();SND.g.connect(SND.cmp);SND.mg=c.createGain();SND.mg.connect(SND.g);}catch(e){return null;}}
  SND.g.gain.value=SND_VOL[CFG.vol]||SND_VOL[2];SND.mg.gain.value=CFG.mus?1:0;return SND.g;}
// tone() de la v0.4 pasa por el bus (los acordes de la música duran 3.6 s y el bombo de guerra es de 60 Hz: así se reconocen y van al bus de música)
tone=function(f,t,d,type,v){const c=ac();if(!c)return;const bus=sndBus();if(!bus)return;const mus=d>=3||(f===60&&type==='square'&&v===.02);if(mus&&!CFG.mus)return;
  const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(v||.06,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);
  o.connect(g).connect(mus?SND.mg:bus);o.start(c.currentTime+t);o.stop(c.currentTime+t+d+.05);SND.n=(SND.n||0)+1;};
function sndNoise(t,d,f0,f1,v){const c=ac();if(!c||!sndBus())return;if(!SND.nb){const n=c.sampleRate*.5|0;const b=c.createBuffer(1,n,c.sampleRate);const ch=b.getChannelData(0);for(let i=0;i<n;i++)ch[i]=V19R()*2-1;SND.nb=b;}
  const s=c.createBufferSource();s.buffer=SND.nb;const fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=.9;fl.frequency.setValueAtTime(f0,c.currentTime+t);fl.frequency.exponentialRampToValueAtTime(f1,c.currentTime+t+d);
  const g=c.createGain();g.gain.setValueAtTime(v,c.currentTime+t);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);s.connect(fl).connect(g).connect(SND.g);s.start(c.currentTime+t);s.stop(c.currentTime+t+d+.02);SND.n=(SND.n||0)+1;}
const SFX2={open:()=>sndNoise(0,.16,500,2200,.05),notify:()=>{tone(1046.5,0,.14,'sine',.05);tone(1318.5,.09,.2,'sine',.05);},
  logro:()=>[523,659,784,1046].forEach((f,i)=>tone(f,i*.07,.3,'triangle',.06)),
  ascenso:()=>{[392,494,587,784].forEach((f,i)=>tone(f,i*.06,.22,'triangle',.05));[523,659,784].forEach(f=>tone(f,.3,.6,'triangle',.035));},
  victoria:()=>{[392,523,659,784].forEach((f,i)=>tone(f,i*.1,.18,'sawtooth',.025));[523,659,784,1046].forEach(f=>tone(f,.42,.9,'triangle',.045));sndNoise(.42,.5,3000,6000,.02);},
  monedas:()=>{tone(988,0,.08,'square',.03);tone(1319,.07,.2,'square',.03);tone(1568,.16,.22,'square',.022);},mal:()=>{tone(392,0,.2,'triangle',.05);tone(311,.16,.36,'triangle',.05);}};
const SNDL={};
function sfx2(k){if(!CFG.snd)return;const now=performance.now();if(now-(SNDL[k]||0)<(k==='open'?120:350))return;SNDL[k]=now;try{(SFX2[k]||(()=>sfx(k)))();SND.last=k;}catch(e){}}
// desbloqueo en iPhone: el audio solo arranca dentro de un gesto completo (touchend/click), no en pointerdown
['touchend','click','keydown'].forEach(t=>document.addEventListener(t,()=>{if(CFG.snd){const c=ac();if(c)sndBus();}},{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{try{if(!SND.ctx)return;if(document.hidden)SND.ctx.suspend();else if(CFG.snd)SND.ctx.resume();}catch(e){}});
// ganchos: abrir pantalla, avisos, derrotas
{const _or=openSheetRaw;openSheetRaw=function(h,b){const was=typeof sheetIsOpen==='function'&&sheetIsOpen();const r=_or(v19dXform(h),b);if(!was)sfx2('open');return r;};}
{const _to=toast;toast=function(u,r){sfx2('notify');return _to(u,r);};}
const SND_BAD=/^🥊 Pierdes contra|Pierdes la elección|te despide|Te despiden|quiebra y pierdes/;
{const _lg=log;log=function(t,c){const r=_lg(t,c);try{if(!(typeof FF_ON!=='undefined'&&FF_ON)&&SND_BAD.test(String(t)))sfx2('mal');}catch(e){}return r;};}
// momentos clave: sonido y partículas aunque Lottie esté apagado (lotFlush de la v1.9c se reemplaza completo)
lotFlush=function(){const k=LOTX.best;LOTX.best=0;if(!k)return;try{if(document.hidden)return;}catch(e){}
  if(performance.now()-LOTX.last<2400&&k<=LOTX.lastK)return;const name=LOT_K[k];
  if(lotOn())lotPlay(name);else{LOTX.last=performance.now();LOTX.lastK=k;}
  sfx2(name);pfxMoment(name);};
// dinero: monedas y sonido cuando entra de golpe una cantidad grande (≥ 10 % de lo que tenías y ≥ $1,000; máximo una vez cada 4 s)
const V19M={t:0};
{const _tm=tweenMoney;tweenMoney=function(el,v){const from=el&&el._v;const r=_tm(el,v);try{if(el&&el.id==='pMoney'&&from!=null&&!(typeof FF_ON!=='undefined'&&FF_ON)){const d=v-from;
  if(d>=1000&&d>=Math.abs(from)*.1&&performance.now()-V19M.t>4000){V19M.t=performance.now();pfxCoinsAt(el);sfx2('monedas');}}}catch(e){}return r;};}
// batallas del mes que se ven en el mapa: chispas y humo
{const _am=animateMonth;animateMonth=function(rep){const r=_am(rep);try{(ANIM.fx||[]).filter(f=>f.c==='#ff6a3d').slice(0,4).forEach(f=>{const p=v19ScrPos(f.r);if(p){pfxBurst('spark',p[0],p[1],12);pfxBurst('smoke',p[0],p[1],4);}});}catch(e){}return r;};}

/* ---------- 3) mover arrastrando ---------- */
const DRG={on:false,a:null,x0:0,y0:0,pid:null,tm:0,rid:null,drop:0,n:0};
function drgArmyAt(cx,cy){try{if(!G||!G.armies||!P||!P.alive||!hasCommand(P)||blockedTurn()||(MO&&MO.ord))return null;const me=cmdNat();if(!me)return null;let best=null,bd=1e9;
  for(const a of G.armies){if(a.o!==me||a.sea||a.train>0||!armyVisible(a))continue;const p=v19ScrPos(a.r);if(!p)continue;const dx=cx-p[0],dy=cy-(p[1]-14);if(Math.abs(dx)<26&&dy>-18&&dy<14){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=a;}}}
  if(!best)return null;const sel=armyById(MO.sel);if(sel&&sel.r===best.r&&sel.o===me&&!sel.sea&&!(sel.train>0))return sel;
  return G.armies.filter(a=>a.r===best.r&&a.o===me&&!a.sea&&!(a.train>0)).reduce((m,a)=>a.n>m.n?a:m,best);}catch(e){return null;}}
function drgUI(){let d=$('drgL');if(!d){d=document.createElement('div');d.id='drgL';d.setAttribute('aria-hidden','true');d.innerHTML='<svg><line/><circle r="7"/></svg><div class="drgT"></div>';document.body.appendChild(d);}return d;}
function drgStart(){const a=DRG.a;if(!a||!armyById(a.id))return;DRG.on=true;DRG.n++;MO.sel=a.id;try{mpopHide();}catch(e){}try{renderSel();drawOverlay();}catch(e){}
  const d=drgUI();d.classList.add('on');drgMove(DRG.x0,DRG.y0);if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}}
function drgMove(x,y){const d=$('drgL');const p=v19ScrPos(DRG.a.r);if(!d||!p)return;const ln=d.querySelector('line'),ci=d.querySelector('circle'),t=d.querySelector('.drgT');
  ln.setAttribute('x1',p[0]);ln.setAttribute('y1',p[1]-14);ln.setAttribute('x2',x);ln.setAttribute('y2',y);ci.setAttribute('cx',x);ci.setAttribute('cy',y);
  const w=$('mapWrap').getBoundingClientRect();const inside=x>=w.left&&x<=w.right&&y>=w.top&&y<=w.bottom;const id=inside?pickAt(x,y):null;DRG.rid=id&&RG[id]?id:null;
  const near=Math.hypot(x-DRG.x0,y-DRG.y0)<20;const ok=!near&&DRG.rid&&DRG.rid!==DRG.a.r;d.classList.toggle('no',!ok);t.textContent=ok?'➡️ '+RG[DRG.rid].nm:(near||DRG.rid===DRG.a.r?'↩️ '+RG[DRG.a.r].nm:'✖');
  t.style.left=Math.min(innerWidth-8,Math.max(8,x))+'px';t.style.top=Math.max(8,y-46)+'px';}
function drgEnd(){DRG.on=false;DRG.a=null;DRG.pid=null;const d=$('drgL');if(d)d.classList.remove('on','no');}
(function(){const w=$('mapWrap');if(!w)return;
  const cancelMap=e=>{try{w.dispatchEvent(new PointerEvent('pointercancel',{pointerId:e.pointerId,bubbles:true}));}catch(_){}};
  // en el documento y en fase de captura: corre antes que los manejadores del mapa en cualquier navegador (Safari incluido)
  const D=document;
  D.addEventListener('pointerdown',e=>{if(!e.target.closest||!e.target.closest('#mapWrap'))return;if(DRG.on||e.button>0||e.target.closest('.zoom,.mmodes,.mleg,.mpop,.mpordh'))return;if(DRG.pid!=null){clearTimeout(DRG.tm);DRG.pid=null;DRG.a=null;return;}   // segundo dedo: es pellizco
    const a=drgArmyAt(e.clientX,e.clientY);if(!a)return;DRG.pid=e.pointerId;DRG.a=a;DRG.x0=e.clientX;DRG.y0=e.clientY;clearTimeout(DRG.tm);DRG.tm=setTimeout(drgStart,300);},true);
  D.addEventListener('pointermove',e=>{if(e.pointerId!==DRG.pid)return;if(!DRG.on){if(Math.abs(e.clientX-DRG.x0)+Math.abs(e.clientY-DRG.y0)>6){clearTimeout(DRG.tm);DRG.pid=null;DRG.a=null;}return;}
    e.stopImmediatePropagation();e.preventDefault();drgMove(e.clientX,e.clientY);},true);
  D.addEventListener('pointerup',e=>{if(e.pointerId!==DRG.pid)return;clearTimeout(DRG.tm);if(!DRG.on){DRG.pid=null;DRG.a=null;return;}
    e.stopImmediatePropagation();cancelMap(e);const a=DRG.a,near=Math.hypot(e.clientX-DRG.x0,e.clientY-DRG.y0)<20,rid=near?null:DRG.rid;drgEnd();DRG.drop=performance.now();   // soltar cerca de donde empezó = cancelar
    if(a&&rid&&rid!==a.r){MO.ord=a.id;onMapPick(rid);DRG.last={a:a.id,to:rid};}else{try{render();}catch(_){}}},true);
  D.addEventListener('pointercancel',e=>{if(e.pointerId!==DRG.pid||!e.isTrusted)return;clearTimeout(DRG.tm);drgEnd();},true);
  w.addEventListener('contextmenu',e=>{if(DRG.on||DRG.pid!=null)e.preventDefault();});})();
// después de soltar no se abre la burbuja en la provincia destino
{const _ms=mpopShow;mpopShow=function(cx,cy){if(DRG.on||performance.now()-DRG.drop<600)return;return _ms(cx,cy);};}

/* ---------- 4) estilo nuevo: Bancos, Mis empresas, Servicios, Mesa ---------- */
showBanks=v19Mark(showBanks,'bk');showBiz=v19Mark(showBiz,'biz');showBizD=v19Mark(showBizD,'bizd');showServices=v19Mark(showServices,'svc');showDesk=v19Mark(showDesk,'desk');
// reemplaza el <div class="hint"> cuyo texto empieza con «pre» (hasta su </div>)
function v19RepHintStart(h,pre,rep){const j=h.indexOf('<div class="hint">'+pre);if(j<0)return h;let d=0,k=-1;const re=/<div\b|<\/div>/g;re.lastIndex=j;let m;
  while((m=re.exec(h))){d+=m[0]==='</div>'?-1:1;if(d===0){k=m.index+6;break;}}return k<0?h:h.slice(0,j)+rep+h.slice(k);}
function v19dXform(h){const s=V19S.scr;if(!s||!P||!G||h.indexOf('data-v19d')>=0)return h;try{
  if(s==='bk'){const di=bnkEnsure(natOf(P)).di;return v19RepHintStart(h,'Efectivo ',`<div data-v19d="1">`+v19Tiles([['Efectivo',fmt(P.dinero)],['En bancos',fmt(accValue(P))],['Seguro de depósitos',di?fmt(25*U(P)):'—',di?'por banco':'hoy está desactivado',di?'':'var(--red)']])+
    `<div class="hint"><span>Los bancos chicos pagan más, pero quiebran más.</span></div></div>`);}
  if(s==='biz'){const L=bzList(P).filter(b=>b.v14);if(!L.length)return h;let rev=0,net=0,val=0;L.forEach(b=>{const m=b.m[b.m.length-1]||{rev:0,net:0};rev+=m.rev||0;net+=m.net||0;val+=bzValue(b);});
    const t=`<div data-v19d="1">`+v19Tiles([['Empresas',`${L.length} / ${MAXBZ}`],['Ventas al mes',fmt(rev)],['Utilidad al mes',fmt(net),'',net<0?'var(--red)':'var(--green)'],['Valor estimado',fmt(val)]],2)+`</div>`;
    const i=h.indexOf('</div>',h.indexOf('<div class="hint">'));return i<0?h:h.slice(0,i+6)+t+h.slice(i+6);}
  if(s==='bizd'||s==='desk')return h.replace('<div class="kv">','<div class="kv kvt" data-v19d="1">');
  if(s==='svc'){const tot=Object.keys(P.svc||{}).reduce((a,k)=>a+svcCost(P,k,P.svc[k]),0);const cr=crimeRisk(P);const lv=cr>1.5?'alto':cr>.5?'medio':'bajo';
    return v19RepHintStart(h,'<span>Costo total',`<div data-v19d="1">`+v19Tiles([['Costo total',fmt(tot),'al año, se descuenta cada mes'],['Riesgo de secuestro',lv,'según tu patrimonio y los homicidios del país',cr>1.5?'var(--red)':cr>.5?'var(--gold)':'var(--green)']],2)+
      `<div class="hint"><span>Los precios siguen a los sueldos de tu país.</span></div></div>`);}
  }catch(e){console.warn('v19dXform',e);}return h;}

/* gráficas vacías: el aviso «…: avanza el reloj.» se dibuja en el lienzo con fillText y la capa de idiomas no lo veía */
try{if(typeof LANG!=='undefined'&&LANG!=='es'&&typeof I18!=='undefined'&&I18){const _ft=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText=function(t,...r){if(typeof t==='string'&&t.length>20&&t.indexOf('avanza el reloj')>0){try{t=I18.T(t);}catch(e){}}return _ft.call(this,t,...r);};}}catch(e){}

/* ---------- Ajustes ---------- */
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b||b.querySelector('[data-pfx]'))return;
  const m=CFG.pfx||'auto',lab={auto:'Automático',on:'Sí',off:'No'};
  const x=document.createElement('div');x.className='item';x.style.display='block';x.id='cfPfx';
  x.innerHTML=`<div class="t">✨ Partículas</div><div class="s"><span>Monedas, confeti, estrellas y chispas de batalla dibujadas por el juego.</span> <span>En automático se apagan con «reducir movimiento», el mapa ligero o un equipo de 2 núcleos.</span></div><div class="chips" style="margin-top:6px">${['auto','on','off'].map(k=>`<button data-pfx="${k}" class="${m===k?'on':''}">${lab[k]}</button>`).join('')}<button data-pfxp="1">▶️ Probar</button></div><div class="s" style="margin-top:4px">${pfxOn()?'Ahora: encendidas':'Ahora: apagadas'}</div>`;
  const ref=$('cfLot');(ref?ref.after(x):b.appendChild(x));
  x.querySelectorAll('[data-pfx]').forEach(y=>y.onclick=()=>{CFG.pfx=y.dataset.pfx;saveCfg();showSettings();});
  x.querySelector('[data-pfxp]').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();pfxBurst('coin',r.left+r.width/2,r.top,14);pfxBurst('conf',innerWidth/2,innerHeight*.3,30);};
  // sonido: reemplaza el botón de la v0.4 («Sonido y música: …») por volumen + música
  const old=b.querySelector('#sSnd');const sv=CFG.snd?(CFG.vol||2):0;const vl=[['0','Apagado'],['1','Bajo'],['2','Medio'],['3','Alto']];
  const s=document.createElement('div');s.className='item';s.style.display='block';s.id='cfSnd';
  s.innerHTML=`<div class="t">🔊 Sonido</div><div class="s"><span>Efectos y música generados por el juego, sin descargas.</span> <span>En iPhone suena después de tu primer toque y respeta el volumen del teléfono.</span></div>
   <div class="seg" style="margin-top:6px">${vl.map(([k,l])=>`<button data-vol="${k}" class="${String(sv)===k?'on':''}">${l}</button>`).join('')}</div>
   <div class="chips" style="margin-top:6px"><button data-mus="1" class="${CFG.mus?'on':''}">🎵 Música: ${CFG.mus?'sí':'no'}</button><button data-sndp="1" ${CFG.snd?'':'disabled'}>▶️ Probar</button></div>`;
  if(old)old.replaceWith(s);else x.after(s);
  s.querySelectorAll('[data-vol]').forEach(y=>y.onclick=()=>{const v=+y.dataset.vol;if(v){CFG.snd=1;CFG.vol=v;ac();sndBus();}else CFG.snd=0;saveCfg();showSettings();if(v)setTimeout(()=>sfx2('notify'),60);});
  s.querySelector('[data-mus]').onclick=()=>{CFG.mus=CFG.mus?0:1;saveCfg();sndBus();showSettings();};
  s.querySelector('[data-sndp]').onclick=()=>{ac();sndBus();const L=['logro','ascenso','victoria','monedas'];SND.p=((SND.p||0)+1)%L.length;sfx2(L[SND.p]);};}catch(e){console.warn('ajustes v19d',e);}};}

/* ---------- ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Partículas','✨ Partículas','Los efectos de partículas (monedas, confeti, chispas) son una forma barata de dar «jugo» a un juego: el jugador siente que sus acciones tienen peso. Se dibujan en un lienzo aparte y solo mientras hay algo que mostrar, para no gastar batería.','Monedas cuando entra mucho dinero de golpe, confeti y estrellas en los logros, ascensos y victorias, y chispas con humo en las batallas que se ven en el mapa. En automático se apagan en equipos lentos.'],
 ['Sonido','🔊 Sonido','Todos los sonidos y la música se generan en el momento con osciladores y ruido filtrado (síntesis), como en las consolas antiguas: no hay archivos de audio que descargar.','Elige el volumen (Bajo, Medio o Alto) o apágalo, y la música aparte. En iPhone el sonido empieza después de tu primer toque, porque Safari no deja sonar una página antes.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const gi=GUIA.findIndex(g=>/^🪖/.test(g[0]));const T=['✋ Mover arrastrando',`<b>Arrastra tus ejércitos:</b> mantén presionado el marcador de tu ejército en el mapa (un instante, hasta que aparece la línea) y, sin soltar, llévalo a la provincia destino. Una etiqueta muestra el nombre de la provincia; al soltar recibe la misma orden que «🎯 Mover».
<ul><li><b>Cancelar:</b> suelta sobre la misma provincia o fuera del mapa.</li><li><b>Mover el mapa:</b> si arrastras de inmediato (sin mantener), el mapa se desplaza como siempre; con dos dedos haces zoom.</li>
<li><b>Sonido y efectos:</b> en Ajustes eliges volumen (o apagado), música y partículas (monedas, confeti, chispas de batalla).</li></ul>`];
 GUIA.splice(gi>=0?gi+1:Math.min(2,GUIA.length),0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v19d',e);}}

(function(){const st=document.createElement('style');st.id='v19dcss';st.textContent=`
#pfx{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9985;display:none}
#drgL{position:fixed;inset:0;pointer-events:none;z-index:9980;display:none}#drgL.on{display:block}
#drgL svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
#drgL line{stroke:var(--act);stroke-width:3;stroke-dasharray:7 5;stroke-linecap:round;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}
#drgL circle{fill:color-mix(in srgb,var(--act) 35%,transparent);stroke:var(--act);stroke-width:2.5}
#drgL.no line,#drgL.no circle{stroke:var(--mut)}#drgL.no circle{fill:transparent}
.drgT{position:absolute;transform:translateX(-50%);white-space:nowrap;background:var(--glass);border:1px solid var(--sel-line);color:var(--ink);border-radius:var(--r-p,999px);padding:4px 11px;font-size:13px;font-weight:700;box-shadow:var(--sh-2)}
#drgL.no .drgT{color:var(--mut);border-color:var(--line)}
/* Bancos */
.bnk .h{align-items:flex-start}.bnk .h b{min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:4px;line-height:1.25}
.bnk .h>span{white-space:nowrap;font-size:17px;font-weight:800;color:var(--gold);font-variant-numeric:tabular-nums}
.tier{white-space:nowrap;margin-left:0;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.bnk .mpb button,.svc .mpb button{min-height:36px}
/* Mis empresas / Mesa: datos como tarjetas */
.kv.kvt{grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}
.kv.kvt>div{flex-direction:column;justify-content:flex-start;align-items:flex-start;gap:1px;border:1px solid var(--line);background:var(--card2);border-radius:11px;padding:7px 9px;min-width:0}
.kv.kvt span{font-size:11px;line-height:1.25}.kv.kvt b{text-align:start;font-size:15px;font-weight:700;color:var(--ink);overflow-wrap:anywhere}
.kv.kvt b .up{color:var(--green)}.kv.kvt b .dn{color:var(--red)}.kv.kvt b span{font-size:inherit;font-weight:inherit}
.bzc{border-radius:var(--r-m,12px)}.bzc .h b{font-size:15.5px}.bzc .chg{font-weight:800;white-space:nowrap}
.svc{border-radius:var(--r-m,12px)}.svc .ic{font-size:24px;width:30px;text-align:center}
`;document.head.appendChild(st);})();
try{if(typeof shWrapAll==='function')shWrapAll();}catch(e){}
