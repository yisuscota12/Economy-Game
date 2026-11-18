/* ===== v1.9a (fase 2 de la ruta 9d, parte 1) — interfaz =====
   1) Nombre provisional del juego: ECONOMY (una constante; las claves de guardado no cambian, así las partidas siguen).
   2) Portada al abrir el juego, con 4 estilos para elegir (Noche, Planeta, Mercados, Atlas); fondo dibujado en un canvas
      con la imagen de relieve que ya trae el juego (0 KB extra).
   3) El mapa como estrella: al tocar una provincia o una ciudad aparece una burbuja con lo esencial y los botones para actuar
      desde ahí; «📋 Ficha» abre la ficha del lugar (Provincia, País, Ciudades) con explicaciones opcionales.
   4) ✏️ dentro de las fichas (club, empresa de bolsa, tu empresa, país).
   5) Avance automático que anticipa: barra del mes y aviso de lo próximo.  6) Indicador 👥 de vida social junto al reloj. */
const GAME_NAME='ECONOMY';

/* ---------- 1) nombre ---------- */
try{document.title=GAME_NAME+' — v'+VERSION;}catch(e){}
try{if(typeof TOUR!=='undefined'&&TOUR[0])TOUR[0][1]='Bienvenido a '+GAME_NAME;}catch(e){}
function v19Name(){const m=$('modal');const h=m&&m.classList.contains('on')&&m.querySelector('h2');if(!h||!h.querySelector('small'))return;const t=h.firstChild;if(t&&t.nodeType===3)t.nodeValue=GAME_NAME+' ';}

/* ---------- 2) portada ---------- */
const COVERS={noche:['🌃','Noche'],planeta:['🌍','Planeta'],mercados:['📈','Mercados'],atlas:['🗺️','Atlas']};
const CV={on:false,raf:0,img:null,base:null,bs:'',prev:false,from:false,tick:null};
const cvStyle=()=>COVERS[CFG.cover]?CFG.cover:'noche';
// las pruebas automáticas (Playwright) no ven la portada salvo que la pidan (CFG.covTest): así la batería vieja sigue igual
function cvSkip(){try{return !!navigator.webdriver&&!CFG.covTest;}catch(e){return false;}}
function cvLogo(){let used=false;const g=`<svg class="cv-glb" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="41"/><ellipse cx="50" cy="50" rx="17" ry="41"><animate attributeName="rx" values="41;2;41" dur="7s" repeatCount="indefinite"/></ellipse><ellipse cx="50" cy="50" rx="30" ry="41"><animate attributeName="rx" values="2;41;2" dur="7s" repeatCount="indefinite"/></ellipse><path d="M9 50h82M16 30h68M16 70h68"/></svg>`;
  return GAME_NAME.split('').map((ch,i)=>{if(ch==='O'&&!used){used=true;return `<b style="--i:${i}">${g}</b>`;}return `<span style="--i:${i}">${ch===' '?'&nbsp;':ch}</span>`;}).join('');}
function cvTicker(){try{const L=Object.values(EXCH0).slice(0,18);const it=L.map(e=>{const ch=(Math.random()*4-1.6);return `<span>${e.ix} <b class="${ch>=0?'up':'dn'}">${ch>=0?'▲':'▼'} ${Math.abs(ch).toFixed(2)} %</b></span>`;}).join('');return `<div class="cv-tick" data-noi18n><div>${it}${it}</div></div>`;}catch(e){return '';}}
function coverHTML(){const s=cvStyle();const has=!!(P&&P.alive&&G);const any=typeof SL!=='undefined'&&SL.meta&&SL.meta.some(Boolean);let cont='';
  if(has){const n=natOf(P);cont=`<button class="cv-cont" id="cvGo">${face(P,48)}<span class="cv-ct"><b>${CV.prev?'Volver al juego':'Continuar partida'}</b><small>${fullName(P)} · ${P.age} años · ${n.name} · ${G.year}</small></span><i>▶</i></button>`;}
  return `<canvas id="cvC" aria-hidden="true"></canvas><div class="cv-shade"></div>${s==='mercados'?cvTicker():''}${s==='atlas'?cvRose():''}
  <div class="cv-in"><div class="cv-mid"><h1 class="cv-logo" data-noi18n aria-label="${GAME_NAME}">${cvLogo()}</h1><div class="cv-tag">Vive, invierte y gobierna en el mundo real de 2026.</div></div>
   <div class="cv-act">${cont}
    <button class="cv-b ${has?'':'gold'}" id="cvNew">${has?'＋ Nueva partida':'▶ Empezar una vida'}</button>
    ${any?'<button class="cv-b" id="cvSl">📂 Partidas guardadas</button>':''}
    <div class="cv-row"><div class="cv-lang">${langSel('cvLang')}</div><button class="cv-b sm" id="cvCr">ⓘ Créditos del juego</button></div>
    <div class="cv-sty"><span class="cv-sl">Estilo de portada</span><div class="cv-chips">${Object.entries(COVERS).map(([k,v])=>`<button data-cvs="${k}" class="${k===s?'on':''}">${v[0]} <span>${v[1]}</span></button>`).join('')}</div></div>
    <div class="cv-foot"><span class="cv-ld" id="cvLd">${typeof mapReady!=='undefined'&&mapReady?'':'Cargando el mapa…'}</span><span class="cv-ver" data-noi18n>v${VERSION}</span></div></div></div>
  <div class="cv-cr" id="cvCrB"><h2>Créditos del juego</h2>
   <p><b>Datos del mundo</b><br><span>Natural Earth (fronteras, carreteras, relieve), geoBoundaries (distritos), Wikidata (población), Banco Mundial, FMI, OIT, OMS, SIPRI, EIA, IEA, USGS, FAO, WGC y WNA.</span></p>
   <p><b>Íconos</b><br><span>Tabler Icons (licencia MIT) e íconos propios.</span></p>
   <p><b>Ficción</b><br><span>Empresas, clubes, ligas comerciales, organismos, promotoras, premios y marcas son ficticios, inspirados en los reales. Países, ciudades y datos son reales.</span></p>
   <button class="cv-b" id="cvCrX">↩ Volver</button></div>`;}
function cvRose(){return `<svg class="cv-rose" viewBox="-50 -50 100 100" aria-hidden="true"><circle r="44" fill="none" stroke="currentColor" stroke-width="1.2"/><circle r="36" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="2 3"/>
  <g class="cv-ndl"><path d="M0-42L6 0L0 42L-6 0Z" fill="currentColor" opacity=".85"/><path d="M-42 0L0-5L42 0L0 5Z" fill="currentColor" opacity=".45"/></g><text y="-46" text-anchor="middle" font-size="9" font-family="Georgia,serif" fill="currentColor">N</text></svg>`;}
function coverShow(prev){if(typeof autoStop==='function'&&typeof AUTO!=='undefined'&&AUTO.on)autoStop();let c=$('cover');if(!c){c=document.createElement('div');c.id='cover';document.body.appendChild(c);}
  CV.prev=!!prev;c.className='cv-'+cvStyle();c.innerHTML=coverHTML();CV.on=true;document.body.classList.add('cvon');requestAnimationFrame(()=>c.classList.add('on'));coverBind(c);cvStart();
  clearInterval(CV.tick);CV.tick=setInterval(()=>{const l=$('cvLd');if(l&&typeof mapReady!=='undefined'&&mapReady&&l.textContent){l.textContent='';}if(!CV.on)clearInterval(CV.tick);},400);}
function coverHide(){CV.on=false;cancelAnimationFrame(CV.raf);clearTimeout(CV.to);clearInterval(CV.tick);const c=$('cover');document.body.classList.remove('cvon');if(c){c.classList.remove('on');setTimeout(()=>{if(!CV.on&&c.parentNode){c.remove();}},320);}CV.base=null;CV.bs='';}
function coverBind(c){const go=c.querySelector('#cvGo');if(go)go.onclick=()=>{coverHide();hideModal();render();};
  c.querySelector('#cvNew').onclick=()=>{coverHide();CV.from=true;showStart(true);};
  const sl=c.querySelector('#cvSl');if(sl)sl.onclick=()=>{coverHide();showSlots();};
  langBind(c.querySelector('#cvLang'));
  c.querySelector('#cvCr').onclick=()=>c.classList.add('cr');c.querySelector('#cvCrX').onclick=()=>c.classList.remove('cr');
  c.querySelectorAll('[data-cvs]').forEach(b=>b.onclick=()=>{CFG.cover=b.dataset.cvs;saveCfg();coverShow(CV.prev);});}
// arranque: la primera llamada a showStart (al abrir el juego) muestra la portada en lugar del formulario
{const _st=showStart;let first=true;showStart=function(f,k){if(first){first=false;if(!cvSkip()){coverShow(false);return;}}
  _st(f,k);v19Name();const m=$('modal');if(CV.from&&m&&m.classList.contains('on')&&m.querySelector('#sGo')&&!m.querySelector('#sCv')){const b=document.createElement('button');b.className='opt';b.id='sCv';b.textContent='↩ Volver a la portada';
    const h=m.querySelector('h2');(h?h.after(b):m.prepend(b));b.onclick=()=>{hideModal();coverShow(false);};}CV.from=false;};}
// si se cierra una pantalla y no hay partida (p. ej. Partidas guardadas sin cargar ninguna), vuelve la portada
{const _cs=closeSheet;closeSheet=function(){_cs();setTimeout(()=>{if(!P&&!modalOn()&&!sheetIsOpen()&&!CV.on&&!cvSkip())coverShow(false);},350);};}
// una partida recuperada desde la ranura al abrir (v1.7g) actualiza el botón «Continuar»
{const _sl=slLoad;slLoad=async function(...a){const r=await _sl(...a);if(r&&CV.on){coverShow(CV.prev);}return r;};}
// Ajustes → portada
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';x.id='cfCover';const s=COVERS[cvStyle()];
  x.innerHTML=`<span><div class="t">🖼️ Portada</div><div class="s">${s[0]} <span>${s[1]}</span> · <span>Toca para verla y cambiar el estilo.</span></div></span>`;x.onclick=()=>{closeSheet();coverShow(true);};b.appendChild(x);};}

/* fondo de la portada: la imagen de relieve recoloreada una sola vez por estilo (base) y, en cada cuadro, paneo lento + capa animada */
// v2.2b estilo pixel: la portada se dibuja a 1 pixel por cada 3 px CSS (dpr .5 para trazos y luces) y se agranda sin suavizar
function cvStart(){cancelAnimationFrame(CV.raf);clearTimeout(CV.to);const c=$('cvC');if(!c)return;const pf=typeof pxOn==='function'&&pxOn()?3:0;const dpr=pf?.5:Math.min(1.5,window.devicePixelRatio||1);
  const W=Math.max(2,Math.round(pf?innerWidth/pf:innerWidth*dpr)),H=Math.max(2,Math.round(pf?innerHeight/pf:innerHeight*dpr));c.width=W;c.height=H;Object.assign(CV,{W,H,dpr,pf,s:cvStyle(),t0:performance.now()});
  cvImg().then(img=>{if(!CV.on||!img)return;try{cvBase(img);cvPrep();cvLoop();}catch(e){console.warn('portada',e);}});}
function cvImg(){if(CV.img)return Promise.resolve(CV.img);return new Promise(ok=>{const im=new Image();im.onload=()=>{CV.img=im;ok(im);};im.onerror=()=>ok(null);im.src=REL_IMG;});}
function cvBase(img){const s=CV.s,key=s+'|'+CV.H+'|'+(CV.pf||0);if(CV.base&&CV.bs===key)return;const BH=Math.round(Math.min(900,CV.H*1.08)),BW=Math.round(BH*img.width/img.height);
  const b=document.createElement('canvas');b.width=BW;b.height=BH;const x=b.getContext('2d');x.drawImage(img,0,0,BW,BH);
  if(s!=='planeta'){const d=x.getImageData(0,0,BW,BH),a=d.data;
    for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],bl=a[i+2];const L=(r*.3+g*.59+bl*.11)/255;const bg=r+g+bl<75;const w=!bg&&bl>r+16&&bl>=g-8;
      if(s==='noche'){if(bg){a[i]=3;a[i+1]=6;a[i+2]=14;}else if(w){a[i]=5+L*10;a[i+1]=10+L*16;a[i+2]=22+L*26;}else{a[i]=14+L*44;a[i+1]=18+L*46;a[i+2]=30+L*50;}}
      else if(s==='mercados'){if(bg){a[i]=2;a[i+1]=5;a[i+2]=6;}else if(w){a[i]=3;a[i+1]=8+L*8;a[i+2]=9+L*8;}else{a[i]=6+L*18;a[i+1]=22+L*58;a[i+2]=16+L*30;}}
      else{if(bg){a[i]=214;a[i+1]=198;a[i+2]=160;}else if(w){a[i]=222-L*22;a[i+1]=208-L*20;a[i+2]=170-L*18;}else{a[i]=118+L*92;a[i+1]=92+L*80;a[i+2]=52+L*56;}}}
    x.putImageData(d,0,0);}
  if(CV.pf)cvDither(x,BW,BH);
  CV.base=b;CV.bs=key;}
// tramado ordenado 4×4 (Bayer) a 6 niveles por canal: el fondo de la portada queda con paleta corta y textura retro
const CV_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function cvDither(x,w,h){const d=x.getImageData(0,0,w,h),a=d.data,q=5;for(let y=0;y<h;y++)for(let i=0;i<w;i++){const k=(y*w+i)*4,t=(CV_BAYER[(y&3)*4+(i&3)]+.5)/16;
    for(let c=0;c<3;c++)a[k+c]=Math.min(255,Math.floor(a[k+c]/255*q+t)*255/q);}x.putImageData(d,0,0);}
// ciudades (luces y rutas), velas de la bolsa y rutas de navegación del atlas
function cvPrep(){const C=(typeof CITIES!=='undefined'?CITIES:[]).slice().sort((a,b)=>b[2]-a[2]);CV.lights=C.slice(0,420).map(c=>[c[0]/4096,c[1]/1755,Math.log10(Math.max(1e4,c[2]))-4,Math.random()*6.28]);
  const big=C.slice(0,48);let sd=7;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};CV.arcs=[];
  for(let k=0;k<16&&big.length>1;k++){const a=big[Math.floor(rnd()*big.length)],b=big[Math.floor(rnd()*big.length)];if(a===b)continue;const dx=Math.abs(a[0]-b[0]);if(dx<180||dx>1900)continue;CV.arcs.push([a[0]/4096,a[1]/1755,b[0]/4096,b[1]/1755,rnd()]);}
  const sp=document.createElement('canvas');sp.width=sp.height=32;const g=sp.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);
  const col=CV.s==='planeta'?'255,214,140':'255,206,120';gr.addColorStop(0,`rgba(${col},1)`);gr.addColorStop(.25,`rgba(${col},.55)`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(0,0,32,32);CV.spr=sp;
  let v=100;CV.cand=[];for(let i=0;i<90;i++){const o=v;v=Math.max(20,v*(1+(Math.random()-.47)*.05));CV.cand.push([o,v,Math.max(o,v)*(1+Math.random()*.015),Math.min(o,v)*(1-Math.random()*.015)]);}
  // empieza centrada en tu país, si hay partida
  CV.ph=0;try{if(P&&RG[P.r])CV.fx=RG[P.r].c[0]/4096;else CV.fx=.25;}catch(e){CV.fx=.25;}}
const cvReduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}};
function cvLoop(){let last=0;const step=t=>{if(!CV.on)return;if(document.hidden){CV.to=setTimeout(()=>{CV.raf=requestAnimationFrame(step);},500);return;}
    if(t-last>=32){last=t;try{cvFrame(t);}catch(e){console.warn(e);CV.on&&cancelAnimationFrame(CV.raf);return;}}
    if(!cvReduced())CV.raf=requestAnimationFrame(step);};CV.raf=requestAnimationFrame(step);}
function cvFrame(t){const c=$('cvC');if(!c||!CV.base)return;const x=c.getContext('2d'),W=CV.W,H=CV.H,s=CV.s,b=CV.base;const T=(t-CV.t0)/1000;x.imageSmoothingEnabled=!CV.pf;
  const dh=H*1.06,dw=b.width*dh/b.height;let dx;
  if(dw>W){const span=dw-W;const c0=clamp(CV.fx*dw-W/2,0,span);const ph=Math.asin(clamp(c0/span*2-1,-1,1));dx=-span*(.5+.5*Math.sin(ph+T*2*Math.PI/90));}else dx=(W-dw)/2;
  const dy=(H-dh)/2;x.globalCompositeOperation='source-over';x.globalAlpha=1;x.drawImage(b,dx,dy,dw,dh);
  const P2=(u,v)=>[dx+u*dw,dy+v*dh];const dpr=CV.dpr;
  // día y noche (Planeta): el sol avanza de este a oeste; la noche oscurece y enciende las luces
  let night=null;if(s==='planeta'){const sun=((-T/60)%1+1)%1;night=u=>{let d=Math.abs(((u-sun)%1+1.5)%1-.5);return clamp((d-.17)/.12,0,1);};
    const g=x.createLinearGradient(0,0,W,0);for(let i=0;i<=10;i++){const u=(i/10*W-dx)/dw;g.addColorStop(i/10,`rgba(2,6,22,${(night(u)*.72).toFixed(3)})`);}x.fillStyle=g;x.fillRect(0,0,W,H);}
  if(s==='noche'||s==='planeta'){x.globalCompositeOperation='lighter';for(const L of CV.lights){const [px,py]=P2(L[0],L[1]);if(px<-20||px>W+20)continue;let a=.55+.45*Math.sin(T*1.7+L[3]);if(night)a*=night(L[0]);if(a<.03)continue;
      const r=(3+L[2]*3.2)*dpr*(s==='planeta'?.8:1);x.globalAlpha=a*(s==='planeta'?.75:.9);x.drawImage(CV.spr,px-r,py-r,r*2,r*2);}x.globalAlpha=1;x.globalCompositeOperation='source-over';}
  if(s==='noche'){x.lineWidth=1.1*dpr;for(const A of CV.arcs){const [ax,ay]=P2(A[0],A[1]),[bx,by]=P2(A[2],A[3]);if(Math.max(ax,bx)<-50||Math.min(ax,bx)>W+50)continue;const mx=(ax+bx)/2,my=Math.min(ay,by)-Math.abs(bx-ax)*.28;
      x.strokeStyle='rgba(242,193,78,.16)';x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo(mx,my,bx,by);x.stroke();
      const k=((T/7+A[4])%1),q=1-k;const px=q*q*ax+2*q*k*mx+k*k*bx,py=q*q*ay+2*q*k*my+k*k*by;x.globalCompositeOperation='lighter';x.globalAlpha=.95;const r=5*dpr;x.drawImage(CV.spr,px-r,py-r,r*2,r*2);x.globalAlpha=1;x.globalCompositeOperation='source-over';}}
  if(s==='mercados'){const n=CV.cand.length,cw=Math.max(7*dpr,W/46),off=(T*cw*.6)%cw,top=H*.44,hh=H*.2;if(T*0.6-(CV.lastC||0)>=1){CV.lastC=Math.floor(T*0.6);const o=CV.cand[n-1][1];const v=Math.max(20,o*(1+(Math.random()-.47)*.05));CV.cand.push([o,v,Math.max(o,v)*1.01,Math.min(o,v)*.99]);CV.cand.shift();}
    const vis=CV.cand.slice(-Math.ceil(W/cw)-2);const hi=Math.max(...vis.map(z=>z[2])),lo=Math.min(...vis.map(z=>z[3]));const Y=v=>top+hh-(v-lo)/(hi-lo||1)*hh;
    x.strokeStyle='rgba(60,207,142,.08)';x.lineWidth=1;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(0,top+hh*i/4);x.lineTo(W,top+hh*i/4);x.stroke();}
    vis.forEach((z,i)=>{const cx=W-(vis.length-i)*cw+off;const up=z[1]>=z[0];x.strokeStyle=x.fillStyle=up?'rgba(60,207,142,.55)':'rgba(255,90,95,.5)';x.beginPath();x.moveTo(cx+cw*.35,Y(z[2]));x.lineTo(cx+cw*.35,Y(z[3]));x.stroke();
      const y1=Y(Math.max(z[0],z[1])),y2=Y(Math.min(z[0],z[1]));x.fillRect(cx,y1,cw*.7,Math.max(1,y2-y1));});
    x.strokeStyle='rgba(242,193,78,.55)';x.lineWidth=1.6*dpr;x.beginPath();vis.forEach((z,i)=>{const j=Math.max(0,i-7),seg=vis.slice(j,i+1);const m=seg.reduce((a,q)=>a+q[1],0)/seg.length;const cx=W-(vis.length-i)*cw+off+cw*.35;i?x.lineTo(cx,Y(m)):x.moveTo(cx,Y(m));});x.stroke();}
  if(s==='atlas'){x.strokeStyle='rgba(90,60,30,.18)';x.lineWidth=dpr;for(let i=1;i<6;i++){const y=dy+dh*i/6;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}for(let i=1;i<12;i++){const xx=dx+dw*i/12;if(xx<0||xx>W)continue;x.beginPath();x.moveTo(xx,0);x.lineTo(xx,H);x.stroke();}
    x.setLineDash([5*dpr,5*dpr]);x.lineDashOffset=-T*14*dpr;x.strokeStyle='rgba(122,40,28,.45)';x.lineWidth=1.4*dpr;for(const A of CV.arcs.slice(0,10)){const [ax,ay]=P2(A[0],A[1]),[bx,by]=P2(A[2],A[3]);if(Math.max(ax,bx)<-50||Math.min(ax,bx)>W+50)continue;
      x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo((ax+bx)/2,Math.min(ay,by)-Math.abs(bx-ax)*.18,bx,by);x.stroke();}x.setLineDash([]);
    x.fillStyle='rgba(122,40,28,.7)';for(const L of CV.lights.slice(0,60)){const [px,py]=P2(L[0],L[1]);if(px<0||px>W)continue;x.beginPath();x.arc(px,py,1.6*dpr,0,6.29);x.fill();}}}
window.addEventListener('resize',()=>{if(CV.on){clearTimeout(CV.rz);CV.rz=setTimeout(()=>{if(CV.on)cvStart();},200);}});

/* ---------- 3) el mapa como estrella: burbuja al tocar y ficha del lugar ---------- */
const PL={rid:null,city:null,tab:'pr',lt:0};
const mpopOn=()=>CFG.mpop!==0;
function cityAt(cx,cy){if(typeof CITIES==='undefined'||!mapReady)return -1;const w=$('mapWrap'),b=w.getBoundingClientRect();const u=upp();
  const minPop=u>3?5e6:u>1.6?1.5e6:u>.9?4e5:u>.6?1.2e5:u>.38?3.5e4:0,cap=u<.6?120:u<1?70:45;let shown=0,best=-1,bd=1e9;
  for(let i=0;i<CITIES.length&&shown<cap;i++){const c=CITIES[i];if(c[2]<minPop&&!(c[4]===2&&u<4))continue;if(c[0]<vb.x||c[0]>vb.x+vb.w||c[1]<vb.y||c[1]>vb.y+vb.h)continue;shown++;
    const sx=b.left+(c[0]-vb.x)/vb.w*b.width,sy=b.top+(c[1]-vb.y)/vb.h*b.height;const d=Math.hypot(sx-cx,sy-cy);if(d<bd){bd=d;best=i;}}
  return bd<=20?best:-1;}
// provincia de cada ciudad, leída del mapa de identificadores (el campo 5 de CITIES no es un id de provincia)
const CREG={a:null,by:null};
function cityReg(i){if(!CREG.a){if(typeof decodeIds==='function')decodeIds();if(!IDS)return null;CREG.a=new Array(CITIES.length);CREG.by={};
    for(let j=0;j<CITIES.length;j++){const c=CITIES[j];const mx=Math.floor(c[0]),my=Math.floor(c[1]);let k=(mx>=0&&my>=0&&mx<MW&&my<MH)?IDS[my*MW+mx]:0;
      for(let d=1;d<=4&&!k;d++)for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){const x=mx+dx,y=my+dy;if(x>=0&&y>=0&&x<MW&&y<MH&&IDS[y*MW+x]){k=IDS[y*MW+x];break;}}
      const r=k?IDX2RID[k]:null;CREG.a[j]=r;if(r)(CREG.by[r]=CREG.by[r]||[]).push(j);}}
  return CREG.a[i];}
function citiesOf(rid){cityReg(0);return CREG.by&&CREG.by[rid]||[];}
// botones que ya dibuja la ficha de abajo del mapa (#selInfo): la burbuja y la ficha los «tocan» por ti, así hacen exactamente lo mismo
const PL_KEY=[['[data-ar="mv"]','🎯'],['[data-pa="move"]','🏠'],['[data-pa="inv"]','💼'],['[data-pa="biz"]','🌮'],['[data-pa="build"]','🏗️'],['[data-na="dip"]','🤝'],['[data-na="peace"]','🕊️'],['[data-na="war"]','⚔️']];
function plSplit(t){t=String(t||'').trim();const m=t.match(/^(\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*)\s*(.*)$/u);return m?[m[1],m[2]]:['',t];}
function plLegacy(){const box=$('selInfo');if(!box)return [];return [...box.querySelectorAll('button')].filter(b=>!b.closest('.plfx'));}
function plPress(sel,i){const box=$('selInfo');const L=sel?[...box.querySelectorAll(sel)]:plLegacy();const b=sel?L[0]:L[i];if(b&&!b.disabled){mpopHide();b.click();return true;}return false;}
function mpopHide(){const p=document.querySelector('#mapWrap .mpop');if(p)p.remove();}
function mpopTap(cx,cy){if(!mpopOn()||!G||!P||!G.sel||!RG[G.sel]||modalOn()||CV.on)return;const id=pickAt(cx,cy);const ci=cityAt(cx,cy);if((!id||!RG[id])&&ci<0){mpopHide();return;}
  if(ci>=0){const r=cityReg(ci);if(r&&RG[r]&&G.regions[r]&&r!==G.sel){G.sel=r;requestDraw();drawOverlay();renderSel();}}
  PL.city=ci>=0?ci:null;PL.rid=G.sel;mpopShow(cx,cy);}
function mpopHTML(rid,ci){const r=G.regions[rid],rd=RG[rid],nat=G.nations[r.o];ensureProv(r);const c=ci!=null?CITIES[ci]:null;const pc=r.pop>0?r.gdp/r.pop:0;
  let h=`<div class="mph">${flag(nat.id,13)}<div class="mpn"><b>${c?c[3]:rd.nm}</b><small>${c?`<span>${rd.nm}</span> · `:''}<span>${nat.name}</span></small></div><button class="mpx" data-mp="x" aria-label="Cerrar">✕</button></div>`;
  const chip=(ic,v,lab,col)=>`<span class="mpc"${col?` style="color:${col}"`:''}>${ic} <b>${v}</b>${lab?` <small>${lab}</small>`:''}</span>`;
  h+='<div class="mpcs">'+(c?chip('👥',fmtPop(c[2]),'habitantes')+(c[4]===2?chip('★','Capital del país',''):''):chip('👥',fmtPop(r.pop),'')+chip('💰',fmtN(pc),'por persona')+chip('😊',Math.round(r.hap),'','rgb('+ramp(r.hap/100)+')'))+'</div>';
  const tags=[];if(P.r===rid)tags.push('📍 Vives aquí');if(G.occ&&G.occ[rid])tags.push('⚑ Ocupada');if(warsOf&&warsOf(r.o).length)tags.push('⚔️ En guerra');
  if(tags.length)h+=`<div class="mpt">${tags.map(t=>`<span>${t}</span>`).join('')}</div>`;
  const acts=[['📋','Ficha','plc']];const box=$('selInfo');
  for(const [sel,ic] of PL_KEY){if(acts.length>=4)break;const b=box&&box.querySelector(sel);if(!b||b.disabled)continue;const [i2,t]=plSplit(b.textContent);acts.push([i2||ic,t.replace(/ ·.*$/,''),sel]);}
  if(c&&acts.length<4&&plClubs(rid,c[3]).length)acts.push(['⚽','Clubes','cl']);
  if(acts.length<4)acts.push(['🔍','Acercar','zm']);
  h+=`<div class="mpa">${acts.map(a=>`<button data-mp="${a[2].replace(/"/g,'&quot;')}"><i>${a[0]}</i><span>${a[1]}</span></button>`).join('')}</div>`;
  return h;}
function mpopShow(cx,cy){mpopHide();const w=$('mapWrap');if(!w)return;const b=w.getBoundingClientRect();const p=document.createElement('div');p.className='mpop';p.innerHTML=mpopHTML(PL.rid,PL.city);w.appendChild(p);
  const pw=p.offsetWidth,ph=p.offsetHeight;let x=cx-b.left-pw/2,y=cy-b.top-ph-16,below=false;x=clamp(x,6,b.width-pw-6);if(y<6){y=cy-b.top+16;below=true;}if(y+ph>b.height-4)y=Math.max(4,b.height-ph-4);
  p.style.left=x+'px';p.style.top=y+'px';p.style.setProperty('--ax',clamp(cx-b.left-x,14,pw-14)+'px');p.classList.toggle('below',below);requestAnimationFrame(()=>p.classList.add('on'));
  p.addEventListener('pointerdown',e=>e.stopPropagation());p.addEventListener('pointerup',e=>e.stopPropagation());
  p.querySelectorAll('[data-mp]').forEach(x=>x.onclick=e=>{e.stopPropagation();const k=x.dataset.mp;const rid=PL.rid;
    if(k==='x'){mpopHide();return;}if(k==='plc'){mpopHide();showPlace(rid,PL.city!=null?'ci':'pr');return;}
    if(k==='cl'){mpopHide();PL.tab='ci';showPlace(rid,'ci');return;}
    if(k==='zm'){mpopHide();const c=PL.city!=null?CITIES[PL.city]:RG[rid].c;const cx2=c[0],cy2=c[1];const nw=clamp(vb.w*.45,ZMIN,MW*1.1),nh=nw*w.clientHeight/w.clientWidth;tweenVB(cx2-nw/2,cy2-nh/2,nw,300);return;}
    plPress(k);});}
// recuerda dónde tocaste el mapa (el mapa ya cambió la provincia elegida cuando llega aquí)
(function(){const w=$('mapWrap');if(!w)return;let d=null,n=0,ord=false;
  w.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom,.mmodes,.mleg,.mpop'))return;n++;if(n===1){d={x:e.clientX,y:e.clientY,t:performance.now()};ord=!!(typeof MO!=='undefined'&&MO&&MO.ord);}else{d=null;mpopHide();}});
  w.addEventListener('pointermove',e=>{if(d&&Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)>6){d=null;mpopHide();}});
  const up=e=>{n=Math.max(0,n-1);if(!d){return;}const tap=d;d=null;if(e.type!=='pointerup'||performance.now()-tap.t>650||ord)return;
    const now=performance.now();if(now-PL.lt<300){PL.lt=0;mpopHide();return;}PL.lt=now;const X=e.clientX,Y=e.clientY;setTimeout(()=>mpopTap(X,Y),0);};
  w.addEventListener('pointerup',up);w.addEventListener('pointercancel',up);w.addEventListener('wheel',()=>mpopHide(),{passive:true});})();
// la burbuja se cierra al cambiar de vista, abrir una pantalla o redibujar con otra provincia
{const _os=openSheetRaw;openSheetRaw=function(h,b){mpopHide();return _os(h,b);};}
{const _sm=showModal;showModal=function(h,b){mpopHide();return _sm(h,b);};}
// la ficha de abajo del mapa: botón para abrir la ficha completa
{const _rs=renderSel;renderSel=function(){_rs();try{const box=$('selInfo');if(!box||!G||!G.sel||!RG[G.sel]||!P)return;const d=document.createElement('div');d.className='mini-actions plfx';
  d.innerHTML='<button class="btn" data-plf="1">📋 Ficha del lugar</button>';box.appendChild(d);d.querySelector('button').onclick=()=>showPlace(G.sel,'pr');}catch(e){}};}

function plClubs(rid,city){try{const W=G.ft;if(!W||!W.C)return [];const nid=RG[rid].n;const names=city?[city]:citiesOf(rid).map(i=>CITIES[i][3]);if(!names.length)return [];return Object.values(W.C).filter(c=>c.c===nid&&(c.rg===rid||names.some(n=>c.n.indexOf(n)>=0))).slice(0,12);}catch(e){return [];}}
const PL_EXP={pob:['Población','Personas que viven aquí, según censos y estimaciones recientes.','Más población es más mercado para tus negocios, más votos y más impuestos para el gobierno.'],
 pib:['PIB','Valor de todo lo que se produce aquí en un año (producto interno bruto).','Mueve sueldos, ventas de tus negocios e ingresos del gobierno; crece o cae cada año.'],
 ppc:['PIB por persona','El PIB dividido entre la población: la medida más usada del nivel de vida medio.','Define los sueldos y precios de la zona: un negocio rinde más donde es alto, pero cuesta más abrirlo.'],
 den:['Densidad','Habitantes por kilómetro cuadrado: indica qué tan urbana o rural es la zona.','Las zonas densas concentran clientes y empleo; las poco densas, tierra y recursos.'],
 hap:['Felicidad','Satisfacción de la población; en el mundo real se mide con encuestas como el Informe Mundial de la Felicidad.','Con felicidad baja aumentan protestas, rebeliones y la pérdida de apoyo del gobierno.'],
 dev:['Desarrollo','Infraestructura, servicios y capital humano acumulados (del 0 al 10).','Sube la producción de la provincia y su crecimiento; el gobierno puede invertir para subirlo.'],
 cre:['Crecimiento','Cambio anual del PIB de la provincia.','Las inversiones rinden más donde la economía crece.'],
 ter:['Terreno','Relieve y clima: montañas, selvas y desiertos son difíciles de conquistar y de abastecer.','Multiplica la defensa en una guerra y afecta la producción.'],
 nuc:['Núcleo','Una provincia es núcleo cuando su población se identifica con el país que la gobierna.','Si no es núcleo: −20 de felicidad y la mitad de impuestos hasta asimilarla.'],
 rec:['Recursos','Yacimientos y cultivos estratégicos según los datos de producción reales del país.','Su valor sale de los precios mundiales: guerras y crisis los mueven.']};
function plExp(k){const e=PL_EXP[k];return e?`<div class="ple"><b>${e[0]}</b><span>${e[1]}</span> <span>${e[2]}</span></div>`:'';}
function plTile(k,lab,val,sub,col){return `<div class="plt" data-k="${k}"><small>${lab}</small><b${col?` style="color:${col}"`:''}>${val}</b>${sub?`<i>${sub}</i>`:''}</div>`;}
function showPlace(rid,tab){if(!G||!P)return;rid=rid||PL.rid||G.sel;if(!RG[rid]||!G.regions[rid])return;if(tab)PL.tab=tab;if(PL.rid!==rid&&tab!=='ci')PL.city=null;PL.rid=rid;
  if(G.sel!==rid){G.sel=rid;try{renderSel();requestDraw();drawOverlay();}catch(e){}}
  const r=G.regions[rid],rd=RG[rid],nat=G.nations[r.o];ensureProv(r);const me=natOf(P).id;const ex=!!CFG.pexp;
  const cs=citiesOf(rid).map(i=>[CITIES[i],i]).sort((a,b)=>b[0][2]-a[0][2]);
  const tags=[];if(P.r===rid)tags.push('📍 Vives aquí');tags.push(r.o===me?'🏠 Tu país':'🌐 Extranjero');if(G.occ&&G.occ[rid])tags.push('⚑ <span>Ocupada por '+G.nations[G.occ[rid]].name+'</span>');if(warsOf(r.o).length)tags.push('⚔️ En guerra');
  let h=`<div class="plh">${flag(nat.id,26)}<div class="pln"><h3>${rd.nm}</h3><small><span>${nat.name}</span>${r.o!==r.w0?` · <span>antes ${N0[r.w0].nm}</span>`:''}</small></div><button class="plx${ex?' on':''}" id="plE" aria-pressed="${ex}">ⓘ <span>Explicar</span></button></div>
   <div class="mpt">${tags.map(t=>`<span>${t}</span>`).join('')}</div>
   <div class="ntabs pltabs">${[['pr','Provincia'],['pa','País'],['ci',`Ciudades (${cs.length})`]].map(([k,t])=>`<button data-plt="${k}" class="${PL.tab===k?'on':''}">${t}</button>`).join('')}</div>`;
  const t=PL.tab;
  if(t==='pr'){const pc=r.pop>0?r.gdp/r.pop:0;const dn=r.pop/Math.max(1,rd.area);const core=isCore(rid,r.o);
    h+=`<div class="plg">${plTile('pob','Población',fmtPop(r.pop))+plTile('pib','PIB',fmtN(r.gdp),'(est.)')+plTile('ppc','PIB por persona',fmtN(pc))+plTile('den','Densidad',Math.round(dn).toLocaleString(LOC||'es-MX'),'hab./km²')+
      plTile('hap','Felicidad',Math.round(r.hap),'','rgb('+ramp(r.hap/100)+')')+plTile('dev','Desarrollo',r.dev.toFixed(1),'/10')+plTile('cre','Crecimiento',pct((r.gl||0)*100))+plTile('ter','Terreno','×'+terrDef(rid).toFixed(2),'multiplicador de defensa')+plTile('nuc','Núcleo',core?'Sí':'No','',core?'':'var(--red)')}</div>`;
    h+=`<div class="hint">⛰️ ${terrName(rid)} · ${rd.area.toLocaleString(LOC||'es-MX')} km²</div>`;
    const d=typeof DEP!=='undefined'&&DEP?DEP[rid]:null;if(d&&Object.keys(d).length)h+=`<div class="sect">Recursos</div><div class="plr">${Object.keys(d).sort((a,b)=>d[b]*resVal(b)-d[a]*resVal(a)).map(k=>`<span class="pill">${RES0[k][1]} <span>${RES0[k][0]}</span> · ${fmtN(d[k]*resVal(k))}/año</span>`).join(' ')}</div>`;
    const bi=bldIcons(rid);if(bi)h+=`<div class="hint">🏗️ <span>Edificios</span>: ${bi}</div>`;
    const mine=[];(P.inv||[]).filter(v=>v.r===rid).forEach(v=>mine.push(INV[v.t].n+' '+fmt(v.val)));try{bzList(P).filter(b=>b.r===rid).forEach(b=>mine.push(bzT(b).ic+' '+b.n));}catch(e){}
    if(mine.length)h+=`<div class="sect">Tus intereses aquí</div><div class="hint">${mine.map(x=>`<span>${x}</span>`).join(' · ')}</div>`;
    if(ex)h+=`<div class="sect">¿Qué significa?</div><div class="plex">${['pob','pib','ppc','den','hap','dev','cre','ter','nuc'].concat(d?['rec']:[]).map(plExp).join('')}</div>`;
    const L=plLegacy().filter(b=>!b.dataset.plf);h+=`<div class="sect">Acciones aquí</div><div class="pla">${L.map((b,i)=>{const [ic,tx]=plSplit(b.textContent);return `<button data-pli="${i}" ${b.disabled?'disabled':''}><i>${ic||'▸'}</i><span>${tx}</span></button>`;}).join('')}
      <button data-plz="1"><i>🔍</i><span>Ver en el mapa</span></button></div>`;}
  if(t==='pa'){const exs=(typeof EXN!=='undefined'&&EXN[nat.id])||[];const lg=G.ft&&G.ft.L&&G.ft.L[nat.id+'1'];
    h+=`<div class="hint plnf">${natFacts(nat,false)}</div>`;
    if(ex)h+=`<div class="plex">${plExp('ppc')}<div class="ple"><b>Estabilidad</b><span>Qué tan firme es el gobierno frente a protestas, golpes y rebeliones.</span> <span>Con estabilidad baja hay más crisis, huelgas y cambios de gobierno.</span></div></div>`;
    h+=`<div class="pla">${nat.id===me?`<button data-plv="pa"><i>🏛️</i><span>Ver tu país</span></button>`:''}${P.ruler&&nat.id!==me&&nat.alive?`<button data-pld="1"><i>🤝</i><span>Diplomacia</span></button>`:''}
      ${exs.map(k=>`<button data-plb="${k}"><i>📈</i><span>${EXCH0[k].nm}</span></button>`).join('')}${lg?`<button data-plg="${nat.id}1"><i>⚽</i><span>${lg.n}</span></button>`:''}
      <button data-ren="nat:${nat.id}"><i>✏️</i><span>Cambiar nombre</span></button></div>`;}
  if(t==='ci'){const sel=PL.city!=null?CITIES[PL.city]:null;
    if(sel&&cityReg(PL.city)===rid){const rank=CITIES.filter((c,j)=>c[2]>sel[2]&&cityReg(j)&&RG[cityReg(j)].n===RG[rid].n).length+1;const cl=plClubs(rid,sel[3]);
      h+=`<div class="plcy"><div class="plh"><div class="pln"><h4>🏙️ ${sel[3]}</h4><small>${sel[4]===2?'<span>★ Capital del país</span> · ':''}<span>Ciudad n.º ${rank} del país</span></small></div></div>
       <div class="plg">${plTile('cpob','Habitantes',fmtPop(sel[2]))+plTile('cpr','De la provincia',pct(Math.min(100,sel[2]/Math.max(1,r.pop)*100)))}</div>
       ${ex?`<div class="plex"><div class="ple"><b>Habitantes</b><span>Población de la ciudad o de su zona metropolitana, según el censo más reciente disponible.</span> <span>Las ciudades grandes concentran empleo formal, clientes y clubes; la vida cuesta más.</span></div></div>`:''}
       ${cl.length?`<div class="sect">Clubes de fútbol</div>`+cl.map(c=>`<button class="item" data-plc="${c.i}"><span><div class="t">⚽ ${c.n}</div><div class="s">${G.ft.L[c.l]?G.ft.L[c.l].n:''}</div></span></button>`).join(''):''}
       <div class="pla"><button data-plcz="${PL.city}"><i>🔍</i><span>Ver en el mapa</span></button>${(()=>{const b=$('selInfo')&&$('selInfo').querySelector('[data-pa="move"]');return b&&!b.disabled?`<button data-pls='[data-pa="move"]'><i>🏠</i><span>Mudarte aquí</span></button>`:'';})()}</div></div>`;}
    h+=cs.length?cs.slice(0,40).map(([c,i])=>`<button class="item${PL.city===i?' on':''}" data-pcy="${i}"><span><div class="t">${c[4]===2?'★ ':''}${c[3]}</div><div class="s">${fmtPop(c[2])} <span>habitantes</span></div></span>›</button>`).join(''):'<div class="hint">No hay ciudades registradas en esta provincia.</div>';
    const all=plClubs(rid);if(!sel&&all.length)h+=`<div class="sect">Clubes de fútbol</div>`+all.map(c=>`<button class="item" data-plc="${c.i}"><span><div class="t">⚽ ${c.n}</div><div class="s">${G.ft.L[c.l]?G.ft.L[c.l].n:''}</div></span></button>`).join('');}
  openSheetRaw(h,b=>{b.querySelector('#plE').onclick=()=>{CFG.pexp=CFG.pexp?0:1;saveCfg();showPlace(rid);};
    b.querySelectorAll('[data-plt]').forEach(x=>x.onclick=()=>{PL.tab=x.dataset.plt;if(PL.tab!=='ci')PL.city=null;showPlace(rid);});
    b.querySelectorAll('[data-pli]').forEach(x=>x.onclick=()=>{const L=plLegacy().filter(y=>!y.dataset.plf);const y=L[+x.dataset.pli];if(y&&!y.disabled){if(y.dataset.ar==='mv')closeSheet();y.click();}});
    b.querySelectorAll('[data-pls]').forEach(x=>x.onclick=()=>plPress(x.dataset.pls));
    b.querySelectorAll('[data-plz]').forEach(x=>x.onclick=()=>{closeSheet();centerOn(rid,Math.min(vb.w,700),1);});
    b.querySelectorAll('[data-plcz]').forEach(x=>x.onclick=()=>{const c=CITIES[+x.dataset.plcz];closeSheet();const w=$('mapWrap');const nw=Math.min(vb.w,260),nh=nw*w.clientHeight/w.clientWidth;tweenVB(c[0]-nw/2,c[1]-nh/2,nw,320);});
    b.querySelectorAll('[data-pcy]').forEach(x=>x.onclick=()=>{PL.city=+x.dataset.pcy;showPlace(rid,'ci');});
    b.querySelectorAll('[data-plc]').forEach(x=>x.onclick=()=>ftClubCard(x.dataset.plc));
    b.querySelectorAll('[data-plv]').forEach(x=>x.onclick=()=>{closeSheet();setView('pa');});
    b.querySelectorAll('[data-pld]').forEach(x=>x.onclick=()=>showNationDip(nat.id));
    b.querySelectorAll('[data-plb]').forEach(x=>x.onclick=()=>{MKV.ex=x.dataset.plb;showMarket('mk');});
    b.querySelectorAll('[data-plg]').forEach(x=>x.onclick=()=>{FBV.lg=x.dataset.plg;showFTWorld('lg');});
    renBind(b,()=>showPlace(rid));});}

/* ---------- 4) ✏️ dentro de las fichas ---------- */
function renBtn(k){return `<button class="renb" data-ren="${k}" title="Cambiar nombre" aria-label="Cambiar nombre">✏️</button>`;}
function renAsk(k,after){const o=renObj(k);const cur=o&&o.g()||'';askText('Nuevo nombre',cur,v=>{if(v&&v!==cur&&renSet(k,v)){if(k.startsWith('gbk:'))renGbkMk(k,v);save();render();toast('✏️ Renombrado',v);}after&&after();},'Cambiar');}
function renBind(root,after){root.querySelectorAll('[data-ren]').forEach(b=>b.onclick=e=>{e.stopPropagation();renAsk(b.dataset.ren,after);});}
function renPut(root,sel,k,after){try{const h=root&&root.querySelector(sel);if(!h||h.querySelector('.renb'))return;h.insertAdjacentHTML('beforeend',' '+renBtn(k));renBind(h,after);}catch(e){}}
{const _cc=ftClubCard;ftClubCard=function(cid){const r=_cc(cid);renPut($('modal'),'.cbh h3','club:'+cid,()=>ftClubCard(cid));return r;};}
{const _sk=showStock;showStock=function(id){const r=_sk(id);renPut($('sheetIn'),'h3','mk:'+id,()=>showStock(id));return r;};}
{const _bd=showBizD;showBizD=function(i){const r=_bd(i);const b=bzList(P)[i];if(b)renPut($('sheetIn'),'h3','biz:'+i,()=>showBizD(i));return r;};}

/* ---------- 5) avance automático que anticipa: barra del mes y lo próximo ---------- */
function monthFrac(){ensureClock();const m=monthOfDay(G.day);const a=MCUM[m],b=MCUM[m+1]||365;return clamp((G.day-a)/Math.max(1,b-a),0,1);}
function nextUp(){if(!P||!G||!P.alive)return null;const L=[];const now=absDay();const m=monthOfDay(G.day);const eom=(MCUM[m+1]||365)-G.day;
  try{const c=cbC(P);if(c&&c.fight)L.push(['🥊','Pelea',Math.max(0,c.fight.dt-now)]);}catch(e){}
  try{const fb=fbOf(P);if(fb&&fb.big)L.push(['🏆','Final',0]);}catch(e){}
  try{const fm=fmOf(P);if(fm&&fm.gig)L.push(['🎟️','Función',0]);if(fm&&fm.gala)L.push(['🏆','Premios',0]);}catch(e){}
  try{const w=P.job&&P.job.w;if(w&&w.ev!=null)L.push(['📋','Evaluación de desempeño',Math.max(0,eom+Math.max(0,5-w.ev)*30)]);}catch(e){}
  try{if(P.dq&&P.dq.length){const e=Math.min(...P.dq.map(x=>x.exp));L.push(['💬','Vence una conversación',Math.max(0,e-now)]);}}catch(e){}
  try{const n=natOf(P);if(n.gov==='democracia'&&n.nextElec===G.year)L.push(['🗳️','Elecciones',365-G.day]);}catch(e){}
  L.push(['🎆','Año nuevo',365-G.day]);L.sort((a,b)=>a[2]-b[2]);return L[0][2]<=45?L[0]:['📅','Cierre de mes',eom];}
function mnxUI(){let el=$('mnx');if(!el){el=document.createElement('div');el.id='mnx';el.innerHTML='<i></i><span></span>';document.body.appendChild(el);el.onclick=()=>{if(typeof autoToggle==='function')autoToggle();};}
  const on=typeof AUTO!=='undefined'&&AUTO.on&&P&&P.alive&&!CV.on;el.classList.toggle('on',!!on);if(!on)return;
  el.querySelector('i').style.width=(monthFrac()*100).toFixed(1)+'%';const n=nextUp();const sp=el.querySelector('span');
  const txt=n?`${n[0]} <span>${n[1]}</span>: <span>${n[2]<=0?'hoy':n[2]===1?'en 1 día':'en '+n[2]+' días'}</span>`:'';if(sp._t!==txt){sp._t=txt;sp.innerHTML=`<span>Próximo</span> · ${txt}`;}}
{const _cu=clockUI;clockUI=function(){_cu();try{mnxUI();vsUI();}catch(e){}};}
{const _au=autoUI;autoUI=function(){_au();try{mnxUI();}catch(e){}};}

/* ---------- 6) indicador 👥 de vida social junto al reloj ---------- */
function vsUI(){const ap=document.querySelector('#clk .ap');if(!ap)return;let b=$('vsB');
  if(!b){b=document.createElement('button');b.type='button';b.id='vsB';b.title='Tu vida social';b.setAttribute('aria-label','Tu vida social');b.onclick=e=>{e.stopPropagation();showInbox();};ap.insertBefore(b,ap.firstChild);}
  if(!P||!P.alive||P.age<6){b.style.display='none';return;}b.style.display='';const s=socialNow(P);const k=s.avg==null?'n':s.e>=.1?'g':(s.e<=-.1||s.R>=3)?'r':'a';
  if(b._k!==k){b._k=k;b.className='vs'+k;b.textContent='👥';b.title=k==='g'?'Tu vida social: buena':k==='a'?'Tu vida social: estable':k==='r'?'Tu vida social: tensa':'Tu vida social: sin relaciones cercanas';b.setAttribute('aria-label',b.title);}}

/* ---------- estilos ---------- */
(function(){const st=document.createElement('style');st.textContent=`
#cover{position:fixed;inset:0;z-index:80;overflow:hidden;background:#04070d;color:#eef3f8;opacity:0;transition:opacity .3s ease;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
#cover.on{opacity:1}body.cvon #toast.on{z-index:95}body.cvon{overflow:hidden}
#cvC{position:absolute;inset:0;width:100%;height:100%;display:block}
.cv-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(3,6,12,.55) 0%,rgba(3,6,12,0) 28%,rgba(3,6,12,0) 50%,rgba(3,6,12,.82) 78%,rgba(3,6,12,.94) 100%)}
.cv-logo{direction:ltr}.cv-in{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:calc(env(safe-area-inset-top) + 9vh) 18px calc(env(safe-area-inset-bottom) + 14px);max-width:560px;margin:0 auto;overflow-y:auto}
.cv-mid{text-align:center}
.cv-logo{margin:0;font-size:clamp(40px,12.5vw,76px);font-weight:900;letter-spacing:.14em;line-height:1;display:flex;justify-content:center;align-items:center;padding-left:.14em;
 background:linear-gradient(180deg,#fff7dd 0%,#f2c14e 55%,#b9852a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 14px rgba(0,0,0,.55))}
.cv-logo span,.cv-logo b{display:inline-block;animation:cvIn .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*70ms + 120ms)}
.cv-glb{width:.86em;height:.86em;fill:none;stroke:#f2c14e;stroke-width:6.5;vertical-align:-.04em;margin:0 .02em;filter:drop-shadow(0 0 8px rgba(242,193,78,.45))}
@keyframes cvIn{from{opacity:0;transform:translateY(-.35em) scale(.9)}to{opacity:1;transform:none}}
.cv-tag{margin-top:12px;font-size:15px;color:#d9e2ec;text-shadow:0 1px 6px rgba(0,0,0,.8);animation:cvIn .8s .7s both}
.cv-act{display:grid;gap:9px;animation:cvIn .7s .5s both}
.cv-cont{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px 14px;border-radius:16px;border:1px solid rgba(242,193,78,.75);background:linear-gradient(135deg,rgba(242,193,78,.95),rgba(214,150,40,.95));color:#1b1204;box-shadow:0 8px 26px rgba(0,0,0,.45)}
.cv-cont .face{border-radius:50%;flex:0 0 auto;background:rgba(255,255,255,.35)}.cv-ct{flex:1;min-width:0}.cv-ct b{display:block;font-size:17px}.cv-ct small{display:block;font-size:12.5px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cv-cont i{font-style:normal;font-size:20px}
.cv-b{width:100%;padding:13px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(10,16,26,.66);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#eef3f8;font-weight:700;font-size:15.5px}
.cv-b.gold{background:linear-gradient(135deg,#f2c14e,#d49a2a);color:#1b1204;border-color:#f2c14e}.cv-b.sm{width:auto;flex:0 0 auto;padding:10px 12px;font-size:13px;align-self:flex-end}
.cv-b:active,.cv-cont:active{transform:scale(.98)}
.cv-row{display:flex;gap:8px;align-items:flex-end}.cv-lang{flex:1}.cv-lang .f{color:#c9d3df;font-size:12px}.cv-lang select{width:100%;padding:9px;border-radius:12px;background:rgba(10,16,26,.7);color:#eef3f8;border:1px solid rgba(255,255,255,.18)}
.cv-sty{margin-top:2px}.cv-sl{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aeb9c6;margin-bottom:5px}
.cv-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.cv-chips button{flex:0 0 auto;padding:7px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(10,16,26,.6);color:#dfe7ef;font-size:13px;font-weight:600}
.cv-chips button.on{border-color:#f2c14e;color:#f2c14e;box-shadow:0 0 0 1px #f2c14e inset}
.cv-foot{display:flex;justify-content:space-between;font-size:11.5px;color:#9aa7b6}.cv-ld{animation:cvBl 1.2s ease-in-out infinite}@keyframes cvBl{50%{opacity:.4}}
.cv-cr{position:absolute;inset:0;z-index:2;display:none;padding:calc(env(safe-area-inset-top) + 24px) 20px 24px;overflow:auto;background:rgba(4,8,14,.94);font-size:14px;line-height:1.45}
#cover.cr .cv-cr{display:block}.cv-cr h2{margin:0 0 12px}.cv-cr p{margin:0 0 14px;color:#cdd6e0}.cv-cr b{color:#f2c14e}
.cv-tick{position:absolute;left:0;right:0;top:env(safe-area-inset-top);height:26px;overflow:hidden;background:rgba(0,0,0,.55);border-bottom:1px solid rgba(60,207,142,.35);font:12px ui-monospace,Menlo,monospace;color:#cfe;white-space:nowrap;z-index:1}
.cv-tick>div{display:inline-block;padding-top:5px;animation:cvTk 60s linear infinite}.cv-tick span{margin:0 16px}.cv-tick .up{color:#3ccf8e}.cv-tick .dn{color:#ff6b6b}@keyframes cvTk{to{transform:translateX(-50%)}}
.cv-mercados .cv-logo{background:linear-gradient(180deg,#e9fff4,#3ccf8e 60%,#1a8c5a);-webkit-background-clip:text;background-clip:text;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.1em}
.cv-mercados .cv-glb{stroke:#3ccf8e;filter:drop-shadow(0 0 8px rgba(60,207,142,.5))}.cv-mercados .cv-cont{background:linear-gradient(135deg,#3ccf8e,#1f9d66);border-color:#3ccf8e;color:#03140c}
.cv-mercados .cv-b.gold{background:linear-gradient(135deg,#3ccf8e,#1f9d66);border-color:#3ccf8e;color:#03140c}.cv-mercados .cv-chips button.on{border-color:#3ccf8e;color:#3ccf8e;box-shadow:0 0 0 1px #3ccf8e inset}
.cv-planeta .cv-logo{background:linear-gradient(180deg,#ffffff,#cfe8ff 60%,#7fb7ea);-webkit-background-clip:text;background-clip:text}.cv-planeta .cv-glb{stroke:#cfe8ff;filter:drop-shadow(0 0 10px rgba(127,183,234,.6))}
.cv-planeta .cv-shade{background:linear-gradient(180deg,rgba(2,8,20,.5) 0%,rgba(2,8,20,0) 30%,rgba(2,8,20,0) 48%,rgba(2,8,20,.8) 76%,rgba(2,8,20,.94) 100%)}
.cv-atlas{color:#2b1d0e}.cv-atlas .cv-shade{background:radial-gradient(ellipse at 50% 42%,rgba(0,0,0,0) 45%,rgba(60,36,12,.45) 100%),linear-gradient(180deg,rgba(240,226,190,0) 50%,rgba(236,220,182,.88) 80%,rgba(232,214,174,.96) 100%)}
.cv-atlas .cv-logo{font-family:Georgia,'Times New Roman',serif;font-weight:700;letter-spacing:.12em;background:linear-gradient(180deg,#6b3a14,#3a1f08);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 rgba(255,240,200,.7))}
.cv-atlas .cv-glb{stroke:#6b3a14;filter:none}.cv-atlas .cv-tag{color:#3a2610;text-shadow:0 1px 0 rgba(255,245,215,.8);font-family:Georgia,serif;font-style:italic}
.cv-atlas .cv-b{background:rgba(248,238,212,.86);color:#3a2610;border-color:rgba(107,58,20,.45)}.cv-atlas .cv-b.gold,.cv-atlas .cv-cont{background:linear-gradient(135deg,#8a2e14,#5e1c0a);color:#fbecc9;border-color:#5e1c0a}
.cv-atlas .cv-lang .f,.cv-atlas .cv-sl,.cv-atlas .cv-foot{color:#5a4024}.cv-atlas .cv-lang select{background:rgba(248,238,212,.9);color:#3a2610;border-color:rgba(107,58,20,.45)}
.cv-atlas .cv-chips button{background:rgba(248,238,212,.85);color:#3a2610;border-color:rgba(107,58,20,.4)}.cv-atlas .cv-chips button.on{border-color:#8a2e14;color:#8a2e14;box-shadow:0 0 0 1px #8a2e14 inset}
.cv-rose{position:absolute;right:16px;top:calc(env(safe-area-inset-top) + 14px);width:74px;height:74px;color:#6b3a14;opacity:.75;z-index:1}.cv-ndl{animation:cvRo 14s ease-in-out infinite alternate;transform-origin:0 0}@keyframes cvRo{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}
@media (orientation:landscape) and (min-width:700px){.cv-in{max-width:none;flex-direction:row;align-items:center;padding:24px 4vw}.cv-mid{flex:1;text-align:left}.cv-logo{justify-content:flex-start}.cv-act{width:min(420px,42vw)}}
@media (prefers-reduced-motion:reduce){.cv-logo span,.cv-logo b,.cv-tag,.cv-act{animation:none}.cv-tick>div,.cv-ndl{animation:none}}
/* burbuja del mapa */
.mpop{position:absolute;z-index:6;width:min(300px,calc(100% - 12px));background:var(--glass,rgba(13,20,29,.96));border:1px solid var(--line,#2b3a4e);border-radius:14px;padding:9px 10px 8px;box-shadow:0 10px 28px rgba(0,0,0,.5);
 opacity:0;transform:translateY(6px) scale(.97);transform-origin:var(--ax) 100%;transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1);color:var(--ink,#e8eef6)}
.mpop.on{opacity:1;transform:none}.mpop.below{transform-origin:var(--ax) 0}
.mpop::after{content:'';position:absolute;left:var(--ax);bottom:-7px;width:12px;height:12px;margin-left:-6px;background:inherit;border-right:1px solid var(--line,#2b3a4e);border-bottom:1px solid var(--line,#2b3a4e);transform:rotate(45deg)}
.mpop.below::after{bottom:auto;top:-7px;transform:rotate(225deg)}
.mph{display:flex;align-items:center;gap:7px}.mpn{flex:1;min-width:0;line-height:1.2}.mpn b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mpn small{color:var(--mut);font-size:11.5px}
.mpx{border:none;background:none;color:var(--mut);font-size:15px;padding:2px 4px}
.mpcs{display:flex;flex-wrap:wrap;gap:4px 10px;margin:6px 0 4px;font-size:12.5px}.mpc b{font-weight:800}.mpc small{color:var(--mut)}
.mpt{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 4px}.mpt span{font-size:11px;padding:2px 7px;border-radius:999px;background:var(--card2);border:1px solid var(--line);color:var(--ink2,#cbd5e1)}
.mpa{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:5px}.mpa button,.pla button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 3px 6px;border-radius:11px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font-size:11px;font-weight:600;line-height:1.15;min-height:52px}
.mpa button i,.pla button i{font-style:normal;font-size:19px;line-height:1.1}.mpa button span,.pla button span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.mpa button:first-child{border-color:var(--gold);color:var(--gold)}.mpa button:active,.pla button:active{transform:scale(.95)}.pla button:disabled{opacity:.42}
body.mapfull.mpopon #selInfo{display:none}
/* ficha del lugar */
.plh{display:flex;align-items:center;gap:10px}.pln{flex:1;min-width:0}.pln h3,.pln h4{margin:0}.pln small{color:var(--mut);font-size:12.5px}
.plx{border:1px solid var(--line);background:var(--card2);color:var(--ink);border-radius:999px;padding:6px 10px;font-size:12.5px;font-weight:700;white-space:nowrap}.plx.on{border-color:var(--teal);color:var(--teal)}
.pltabs{margin:8px 0 8px}.plg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 8px}
.plt{background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:7px 8px;min-width:0}.plt small{display:block;color:var(--mut);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.plt b{font-size:15px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.plt i{font-style:normal;font-size:10.5px;color:var(--mut)}
.pla{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:6px;margin:6px 0 10px}
.plex{display:grid;gap:6px;margin:4px 0 10px}.ple{font-size:12.5px;line-height:1.4;background:rgba(60,207,142,.06);border-left:3px solid var(--teal);border-radius:6px;padding:6px 9px;color:var(--ink2,#cbd5e1)}.ple b{display:block;color:var(--ink);font-size:12.5px}
.plr{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}.plnf{line-height:1.55}
.plcy{border:1px solid var(--gold);border-radius:12px;padding:9px 10px;margin-bottom:10px;background:rgba(242,193,78,.05)}
.item.on{border-color:var(--gold)}
.renb{border:1px solid var(--line);background:var(--card2);border-radius:8px;padding:1px 6px;font-size:13px;vertical-align:2px;margin-left:4px;cursor:pointer}
/* barra del mes y lo próximo (solo con el avance automático) */
#mnx{position:fixed;left:10px;bottom:calc(var(--navh) + 8px);z-index:12;max-width:calc(100% - 150px);height:26px;border-radius:999px;overflow:hidden;background:var(--glass,rgba(12,18,26,.92));border:1px solid var(--line2,#2b3a4e);
 display:flex;align-items:center;font-size:12px;font-weight:600;color:var(--ink,#e8eef6);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .2s,transform .2s}
#mnx.on{opacity:1;transform:none;pointer-events:auto}#mnx>i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(60,207,142,.28),rgba(60,207,142,.45));transition:width .35s linear}
#mnx>span{position:relative;padding:0 11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}body.mapfull #mnx{bottom:calc(var(--navh) + 8px)}
/* 👥 vida social */
#clk .ap #vsB{position:relative;min-width:30px;padding:0 6px!important}#clk .ap #vsB::after{content:'';position:absolute;right:3px;top:3px;width:7px;height:7px;border-radius:50%;background:#7b8794;box-shadow:0 0 0 1.5px var(--glass,#0c121a)}
#clk .ap #vsB.vsg::after{background:#3ccf8e}#clk .ap #vsB.vsa::after{background:#f2c14e}#clk .ap #vsB.vsr::after{background:#ff5a5f}`;document.head.appendChild(st);})();
document.body.classList.toggle('mpopon',mpopOn());
// Ajustes: burbuja del mapa
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const x=document.createElement('button');x.className='item';x.id='cfMpop';const on=mpopOn();
  x.innerHTML=`<span><div class="t">${on?'🗺️ Burbuja al tocar el mapa: activada':'🗺️ Burbuja al tocar el mapa: desactivada'}</div><div class="s">${on?'Al tocar una provincia o ciudad aparece su información con botones para actuar desde ahí.':'Al tocar el mapa solo se actualiza la ficha de abajo, como antes de la v1.9a.'}</div></span>`;
  x.onclick=()=>{CFG.mpop=on?0:1;saveCfg();document.body.classList.toggle('mpopon',mpopOn());if(!mpopOn())mpopHide();showSettings();};b.appendChild(x);};}

/* ---------- ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Ficha del lugar','📋 Ficha del lugar','Cada provincia tiene su propia economía: el PIB por persona de Nuevo León es más del triple que el de Chiapas, aunque sean del mismo país. Por eso dónde vives, inviertes o abres un negocio cambia el resultado.','Toca cualquier provincia o ciudad del mapa: la burbuja muestra lo esencial y los botones para actuar desde ahí. «📋 Ficha» abre todo: provincia, país y ciudades. «ⓘ Explicar» agrega qué significa cada dato.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 GUIA.splice(Math.min(1,GUIA.length),0,['🗺️ El mapa: burbuja y ficha del lugar',`<b>Toca el mapa:</b> al tocar una provincia aparece una burbuja con su población, su PIB por persona y su felicidad, más los botones para actuar desde ahí (mudarte, invertir, abrir un negocio, construir, mover tu ejército o hacer diplomacia, según tu situación). Si tocas el nombre de una ciudad, la burbuja es de esa ciudad.
<ul><li><b>📋 Ficha:</b> pestañas Provincia (datos, recursos, edificios, tus intereses y todas las acciones), País (gobierno, economía, su bolsa y su liga) y Ciudades (habitantes y clubes).</li>
<li><b>ⓘ Explicar:</b> agrega debajo de los datos qué significa cada uno en el mundo real y en el juego. Se queda encendido hasta que lo apagues.</li>
<li><b>✏️:</b> en la ficha de un país, un club, una empresa de bolsa o tu empresa puedes cambiarle el nombre ahí mismo.</li>
<li><b>Avance automático:</b> mientras corre, una barra muestra cuánto falta para cerrar el mes y qué viene (pelea, final, evaluación, una conversación por vencer, elecciones o año nuevo). Tócala para pausar.</li>
<li><b>👥 junto al reloj:</b> el punto de color resume tu vida social (verde buena, ámbar estable, rojo tensa). Tócalo para ver tus conversaciones pendientes.</li></ul>`]);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v19a',e);}}
try{shWrapAll();}catch(e){}
