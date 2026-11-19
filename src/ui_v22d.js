/* ---------- v2.2d — Prueba 3 de estilo pixel: ciudad en pixel isométrico (tipo TheoTown), generada por código ----------
   Cierra las 3 pruebas de la dirección de arte (sección 9e): 1) filtro pixel del mapa (v2.2a), 2) interfaz pixel integral (v2.2b–v2.2c),
   3) esta vista de ciudad. No toca el motor ni el guardado de la partida: solo LEE la provincia (población, PIB por persona, felicidad,
   desarrollo y terreno TRN) y dibuja un barrio con semilla fija, así la misma provincia siempre se ve igual.
   · Se abre con «🏙️ Ciudad pixel» en la ficha de abajo del mapa (#selInfo). Ajustes → «🏙️ Vista ciudad pixel (prueba 3)» la oculta (CFG.px3=0).
   · Dibujo: Canvas 2D a baja resolución (sin suavizado), escalado entero en píxeles del equipo con image-rendering:pixelated → nítido en iPhone 11.
   · Capas precalculadas (suelo, edificios, luces) y animación ligera (autos, humo, agua) a ~10 cuadros por segundo.
     Con el mapa ligero (Toshiba), «reducir movimiento» o Animaciones = No se dibuja una sola imagen fija.
   · Sin imágenes ni licencias de terceros: todo son rectángulos de 1 px con una paleta reducida.
   · Veredicto del dueño (19 nov 2026, Fase 5): la Prueba 3 queda APROBADA como base oficial del modo isométrico.
     Textos traducidos en b6p2/v22d_<idioma>.tsv (incluye los de Ajustes de la v2.2c en ui_v19b.js). Si cambias un texto en español,
     cambia su id SHA-1 y vuelve a salir en español: actualiza v22d_es.tsv, sus 13 traducciones y corre build_i18n.py. */
const CTY={T:12,H:6,raf:0,to:0,st:null,night:false,var:0};
const CTY_PAL={
  gr:{'':['#5f9a3e','#548b37'],d:['#d6b46c','#c9a55d'],f:['#7ea66a','#709a5d'],s:['#3f8a35','#367a2e'],w:['#e9eef3','#d7dee8']},
  road:'#55555f',roadE:'#47474f',line:'#d9cf74',walk:'#8d8a86',water:['#2c6aa8','#3b80c4','#5a9ad6'],
  wall:['#cdbb9e','#b9a68b','#dacdb2','#a3b4c6','#c79270','#aaa9b8','#d6a77a','#9bb39a'],
  roof:['#a8473b','#8e3b32','#6b6f7c','#4f6b88','#9a6b3f'],glass:['#5b86b0','#6e9fc9','#4a6f96','#7fa7c0'],
  tin:['#8c8f94','#7a6f62','#a07a50','#6e8a8c'],ind:'#8a8f8a',chim:'#6b5e55',tree:['#2f7a34','#3d9440','#246529'],trunk:'#6b4a2f',
  sky:{d:['#8fc3e8','#a9d3ef'],n:['#141a38','#1d2550']},win:'#3a4658',lit:['#ffe08a','#ffd166','#fff2b8'],
  car:['#d94b3d','#e8c547','#3f7fd1','#f1f1f1','#2f2f35','#4fb06a']};
function ctyHex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function ctyShade(h,f){const c=ctyHex(h);return 'rgb('+c.map(v=>Math.max(0,Math.min(255,Math.round(v*f)))).join(',')+')';}
function ctyRng(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return function(){h=Math.imul(h^(h>>>15),h|1);h^=h+Math.imul(h^(h>>>7),h|61);return((h^(h>>>14))>>>0)/4294967296;};}
function ctyAnim(){try{if(typeof mapMode!=='undefined'&&mapMode==='lite')return false;if(CFG.dsa==='off')return false;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return false;}catch(e){}return true;}
/* datos del barrio a partir de la provincia (y de la ciudad, si se tocó una) */
function ctyInfo(rid,ci){const r=G.regions[rid],rd=RG[rid];try{ensureProv(r);}catch(e){}const c=ci!=null&&typeof CITIES!=='undefined'?CITIES[ci]:null;
  const t=typeof TRN==='function'?TRN(rid):[0,'',0,0];const pop=Math.max(1e3,c?c[2]:(r.pop||0)*.35);const pc=r.pop>0?r.gdp/r.pop:1000;
  let win=false;try{win=typeof isWinter==='function'&&isWinter(rid);}catch(e){}
  return {name:c?c[3]:rd.nm,pop,pc,hap:r.hap==null?50:r.hap,dev:r.dev||1,elev:t[0]||0,clim:t[1]||'',river:!!t[2],win,cap:!!(c&&c[4]===2),seed:rid+':'+(ci==null?'p':ci)};}
/* rejilla: 0 suelo · 1 calle · 2 agua · 3 puente · 4 parque · 5 casa · 6 vivienda humilde · 7 edificio · 8 torre · 9 fábrica · 10 plaza */
function ctyGen(I,vr){const rnd=ctyRng(I.seed+'#'+vr);const N=Math.max(10,Math.min(20,Math.round(3.2*Math.log10(I.pop)-6)));
  const rich=Math.max(0,Math.min(1,Math.log10(Math.max(300,I.pc)/800)/2.1)),big=Math.max(0,Math.min(1,(Math.log10(I.pop)-4)/2.8));
  const park=.04+I.hap/100*.14,g=[],hg=[],cl=[];const c=(N-1)/2,step=rich>.5?4:5;
  const rj=I.river?Math.floor(N*(.25+rnd()*.5)):-1,ix=Math.floor(rnd()*2)*(N-4);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i;const d=Math.hypot(i-c,j-c)/(c*1.42);let t=0,h=0;
    const road=(i%step===2)||(j%step===2);const rv=rj>=0&&Math.abs(j-(rj+Math.round(Math.sin(i*.55)*1.2)))<1;
    if(rv)t=road?3:2;else if(road)t=1;
    else if(Math.abs(i-c)<1.1&&Math.abs(j-c)<1.1)t=10;
    else if(i>=ix&&i<ix+4&&j>=N-5&&rnd()<.75)t=9;
    else if(rnd()<park)t=4;
    else{const p=.97-d*(.55-big*.3);if(rnd()<p){const core=(1-d)*(.4+big*.6)+rnd()*.25;
      if(rich>.35&&core>1-.4*rich)t=8;else if(core>.5)t=7;else t=rich<.3&&rnd()<.6-rich?6:5;}}
    if(t===8)h=Math.round(18+rnd()*(16+30*big*rich));else if(t===7)h=Math.round(8+rnd()*(6+10*big));else if(t===5)h=4+Math.floor(rnd()*3);
    else if(t===6)h=3+Math.floor(rnd()*2);else if(t===9)h=7+Math.floor(rnd()*4);
    g[k]=t;hg[k]=h;cl[k]=Math.floor(rnd()*997);}
  return {N,g,hg,cl,rich,big,rnd};}
/* primitivas pixel: rombo de suelo y caja isométrica con columnas de 1 px */
function ctyDia(x,sx,sy,col,T,H){x.fillStyle=col;for(let r=0;r<H;r++){const hw=(r<H/2?r+1:H-r)*2;x.fillRect(sx-hw,sy+r,hw*2,1);}}
function ctyBox(x,sx,sy,h,base,T,H,inset){const w=T/2-inset,oy=sy+inset/2;
  x.fillStyle=ctyShade(base,.82);for(let i=0;i<w;i++){const yb=oy+(H-inset)/2+Math.floor(i/2);x.fillRect(sx-w+i,yb-h,1,h+1);}
  x.fillStyle=ctyShade(base,.64);for(let i=0;i<w;i++){const yb=oy+H-inset-1-Math.floor(i/2);x.fillRect(sx+i,yb-h,1,h+1);}
  const tH=H-inset;x.fillStyle=ctyShade(base,1.1);for(let r=0;r<tH;r++){const hw=Math.min(w,(r<tH/2?r+1:tH-r)*2);x.fillRect(sx-hw,oy-h+r,hw*2,1);}}
/* ventanas en las dos caras: devuelve sus posiciones para la capa de luces nocturnas */
function ctyWins(x,sx,sy,h,T,H,inset,rnd,out,gap){const w=T/2-inset,oy=sy+inset/2;x.fillStyle=CTY_PAL.win;
  for(let i=1;i<w-1;i+=2)for(let y=3;y<h-1;y+=gap){const yl=oy+(H-inset)/2+Math.floor(i/2)-h+y;x.fillRect(sx-w+i,yl,1,1);if(rnd()<.45)out.push([sx-w+i,yl]);
    const yr=oy+H-inset-1-Math.floor(i/2)-h+y;x.fillRect(sx+i,yr,1,1);if(rnd()<.45)out.push([sx+i,yr]);}}
function ctyBuild(I,vr){const T=CTY.T,H=CTY.H,M=ctyGen(I,vr),N=M.N,rnd=M.rnd;let mh=12;for(const h of M.hg)mh=Math.max(mh,h);
  const W=N*T+8,Hh=N*H+mh+16,ox=W/2,oy=mh+10;const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];};
  const [cg,xg]=mk(),[cb,xb]=mk();const lights=[],chim=[],roads=[],water=[];
  const clim=I.win&&(I.clim==='f'||I.elev===2)?'w':(CTY_PAL.gr[I.clim]?I.clim:'');const gc=CTY_PAL.gr[clim];
  const at=(i,j)=>[ox+(i-j)*T/2,oy+(i+j)*H/2];
  for(let s=0;s<=2*(N-1);s++)for(let i=Math.max(0,s-N+1);i<=Math.min(N-1,s);i++){const j=s-i,k=j*N+i,t=M.g[k],h=M.hg[k],v=M.cl[k];const [sx,sy]=at(i,j);
    const ground=(i+j)%2?gc[0]:gc[1];
    if(t===1||t===3){ctyDia(xg,sx,sy,t===3?CTY_PAL.water[0]:CTY_PAL.walk,T,H);ctyDia(xg,sx,sy+1,t===3?'#7a6a58':CTY_PAL.road,T,H-2);
      const alongI=(j%((M.rich>.5)?4:5)===2);if(v%2===0&&t===1){xg.fillStyle=CTY_PAL.line;xg.fillRect(sx-1,sy+H/2,2,1);}roads.push([i,j,alongI]);if(t===3)water.push([sx,sy]);continue;}
    if(t===2){ctyDia(xg,sx,sy,CTY_PAL.water[(i+j)%2],T,H);water.push([sx,sy]);continue;}
    ctyDia(xg,sx,sy,ground,T,H);
    if(t===10){ctyDia(xg,sx,sy+1,'#b9b2a4',T,H-2);xb.fillStyle=CTY_PAL.water[2];xb.fillRect(sx-2,sy+H/2-1,4,2);xb.fillStyle='#e9e4d8';xb.fillRect(sx-1,sy+H/2-4,2,3);
      if(I.cap){xb.fillStyle='#e9e4d8';xb.fillRect(sx,sy-10,1,10);xb.fillStyle='#d94b3d';xb.fillRect(sx+1,sy-10,3,2);}continue;}
    if(t===4){for(let q=0;q<2+v%2;q++){const tx=sx-3+((v>>q)%7),ty=sy+1+((v>>(q+2))%3);xb.fillStyle=CTY_PAL.trunk;xb.fillRect(tx,ty,1,2);
      xb.fillStyle=CTY_PAL.tree[(v+q)%3];xb.fillRect(tx-1,ty-3,3,3);xb.fillRect(tx,ty-4,1,1);}continue;}
    if(t===5||t===6){const pal=t===6?CTY_PAL.tin:CTY_PAL.wall,base=pal[v%pal.length];ctyBox(xb,sx,sy,h,base,T,H,2);
      const rf=t===6?CTY_PAL.tin[(v>>2)%4]:CTY_PAL.roof[(v>>2)%CTY_PAL.roof.length];ctyDia(xb,sx,sy+1-h,rf,T-4,H-2);
      if(t===5){xb.fillStyle=ctyShade(rf,.8);xb.fillRect(sx-2,sy-h,4,1);}xb.fillStyle=CTY_PAL.win;xb.fillRect(sx-3,sy+H/2-h+3,1,1);if(rnd()<.5)lights.push([sx-3,sy+H/2-h+3]);continue;}
    if(t===7){const base=CTY_PAL.wall[v%CTY_PAL.wall.length];ctyBox(xb,sx,sy,h,base,T,H,0);ctyWins(xb,sx,sy,h,T,H,0,rnd,lights,3);
      xb.fillStyle=ctyShade(base,.7);xb.fillRect(sx-1,sy-h+1,2,1);continue;}
    if(t===8){const base=CTY_PAL.glass[v%CTY_PAL.glass.length];ctyBox(xb,sx,sy,h,base,T,H,0);ctyWins(xb,sx,sy,h,T,H,0,rnd,lights,2);
      xb.fillStyle='#d9e3ec';xb.fillRect(sx,sy-h-5,1,5);lights.push([sx,sy-h-5,1]);continue;}
    if(t===9){ctyBox(xb,sx,sy,h,CTY_PAL.ind,T,H,0);xb.fillStyle='#6f746f';for(let q=-4;q<4;q+=3)xb.fillRect(sx+q,sy-h+1,2,1);
      xb.fillStyle=CTY_PAL.chim;xb.fillRect(sx+2,sy-h-6,2,7);chim.push([sx+2,sy-h-7]);continue;}}
  /* autos: recorren las calles a lo largo de i o de j */
  const cars=[];const nc=Math.min(28,Math.round(roads.length*(.12+M.big*.2)));
  for(let q=0;q<nc&&roads.length;q++){const r=roads[Math.floor(rnd()*roads.length)];cars.push({i:r[0],j:r[1],ax:r[2]?'i':'j',p:rnd()*N,v:(.012+rnd()*.02)*(rnd()<.5?-1:1),c:CTY_PAL.car[q%CTY_PAL.car.length]});}
  return {I,M,N,W,Hh,ox,oy,cg,cb,lights,chim,cars,water,at,f:0};}
/* cielo con tramado 2×2 (se dibuja una vez por día/noche y se reutiliza) */
function ctySky(S,n){const k=n?'n':'d';if(S.sky&&S.sky[k])return S.sky[k];S.sky=S.sky||{};const c=document.createElement('canvas');c.width=S.W;c.height=S.Hh;
  const x=c.getContext('2d'),sk=CTY_PAL.sky[k];x.fillStyle=sk[0];x.fillRect(0,0,S.W,S.Hh);x.fillStyle=sk[1];
  for(let y=Math.floor(S.Hh*.45);y<S.Hh;y++)for(let i=(y%2);i<S.W;i+=(y>S.Hh*.6?1:2))x.fillRect(i,y,1,1);return S.sky[k]=c;}
/* un cuadro: suelo → autos → edificios → (noche) velo + luces → humo */
function ctyFrame(){const c=$('ctyC'),S=CTY.st;if(!c||!S){ctyStop();return;}const x=c.getContext('2d');x.imageSmoothingEnabled=false;const n=CTY.night,f=S.f++;
  x.drawImage(ctySky(S,n),0,0);
  x.drawImage(S.cg,0,0);
  x.fillStyle=CTY_PAL.water[2];for(const [sx,sy] of S.water){const o=Math.floor(f/3)%4;x.fillRect(sx-4+o*2,sy+2+(o%2),2,1);}
  for(const k of S.cars){if(ctyAnim()){k.p+=k.v;if(k.p<0)k.p+=S.N;if(k.p>=S.N)k.p-=S.N;}
    const ii=k.ax==='i'?k.p:k.i,jj=k.ax==='j'?k.p:k.j;const [sx,sy]=S.at(ii,jj);const px=Math.round(sx)+(k.v>0?1:-1),py=Math.round(sy+CTY.H/2);
    x.fillStyle=k.c;x.fillRect(px-1,py-1,3,2);x.fillStyle='#1d1d22';x.fillRect(px-1,py,1,1);x.fillRect(px+1,py,1,1);}
  x.drawImage(S.cb,0,0);
  if(n){x.fillStyle='rgba(14,20,58,.55)';x.fillRect(0,0,S.W,S.Hh);
    for(let q=0;q<S.lights.length;q++){const L=S.lights[q];if(L[2]){if((f>>2)%2)continue;x.fillStyle='#ff4a3d';}else x.fillStyle=CTY_PAL.lit[q%3];x.fillRect(L[0],L[1],1,1);}
    x.fillStyle='#fff2b8';for(const k of S.cars){const ii=k.ax==='i'?k.p:k.i,jj=k.ax==='j'?k.p:k.j;const [sx,sy]=S.at(ii,jj);x.fillRect(Math.round(sx)+(k.v>0?2:-2),Math.round(sy+CTY.H/2)-1,1,1);}}
  x.fillStyle=n?'rgba(150,150,170,.7)':'rgba(220,220,220,.85)';
  for(const [cx,cy] of S.chim)for(let q=0;q<4;q++){const t=(f+q*5)%20;x.fillRect(cx+Math.floor(t/5),cy-t,2-(t>12?1:0),1);}
  if(ctyAnim())CTY.to=setTimeout(()=>{CTY.raf=requestAnimationFrame(ctyFrame);},100);}
function ctyStop(){clearTimeout(CTY.to);cancelAnimationFrame(CTY.raf);CTY.to=0;CTY.raf=0;}
/* escala entera en píxeles del equipo: cada pixel del dibujo mide k px físicos (nítido, sin medios píxeles) */
function ctyFit(){const c=$('ctyC'),S=CTY.st;if(!c||!S)return;const box=c.parentElement,dpr=window.devicePixelRatio||1;
  const avail=Math.max(200,(box.clientWidth||300))*dpr;const k=Math.max(2,Math.floor(avail/S.W));c.style.width=(S.W*k/dpr)+'px';c.style.height=(S.Hh*k/dpr)+'px';}
function ctyKind(I){const rich=Math.log10(Math.max(300,I.pc)/800)/2.1;return rich>.6?'rascacielos y avenidas':rich>.3?'edificios de departamentos y casas':'casas y viviendas humildes';}
function ctyShow(rid,ci){if(!G||!P||!rid||!RG[rid]||!G.regions[rid])return;ctyStop();const I=ctyInfo(rid,ci);
  const draw=()=>{CTY.st=ctyBuild(I,CTY.var);const c=$('ctyC');if(!c)return;c.width=CTY.st.W;c.height=CTY.st.Hh;ctyFit();ctyStop();ctyFrame();};
  showModal(`<h2>🏙️ <span data-noi18n>${I.name}</span></h2><div class="s" style="opacity:.8;margin-bottom:6px">Vista ciudad · pixel isométrico</div>
    <div class="ctyBox"><canvas id="ctyC" role="img" aria-label="Ciudad en pixel art"></canvas></div>
    <div class="s" style="margin:6px 0">👥 <b>${fmtPop(I.pop)}</b> · 💰 <b>${fmtN(I.pc)}</b> <span>por persona</span> · 😊 <b>${Math.round(I.hap)}</b><br><span>Se ve: ${ctyKind(I)}${I.river?', río':''}.</span> <span>Más ingreso → edificios más altos, más felicidad → más parques, más población → barrio más grande.</span></div>
    <div class="mini-actions"><button class="btn" id="ctyN">${CTY.night?'☀️ Día':'🌙 Noche'}</button><button class="btn" id="ctyV">🔄 Otro barrio</button><button class="btn" id="ctyX">Cerrar</button></div>
    <div class="s" style="opacity:.7;margin-top:6px"><span>Se genera con código desde los datos de la provincia.</span> <span>Todavía no se juega aquí.</span></div>`,
    m=>{m.querySelector('#ctyX').onclick=()=>{ctyStop();hideModal();};
      m.querySelector('#ctyN').onclick=e=>{CTY.night=!CTY.night;e.currentTarget.textContent=CTY.night?'☀️ Día':'🌙 Noche';ctyStop();ctyFrame();};
      m.querySelector('#ctyV').onclick=()=>{CTY.var=(CTY.var+1)%9;draw();};});
  requestAnimationFrame(draw);}
window.addEventListener('resize',()=>{try{if($('ctyC'))ctyFit();}catch(e){}});
document.addEventListener('visibilitychange',()=>{try{if(document.hidden)ctyStop();else if($('ctyC')&&CTY.st){ctyStop();ctyFrame();}}catch(e){}});
{const _hm=hideModal;hideModal=function(){ctyStop();return _hm.apply(this,arguments);};}
/* botón en la ficha de abajo del mapa (junto a «📋 Ficha del lugar») */
{const _rs=renderSel;renderSel=function(){_rs();try{if(CFG.px3===0)return;const box=$('selInfo');if(!box||!G||!G.sel||!RG[G.sel]||!P)return;
  let d=box.querySelector('.plfx');if(!d){d=document.createElement('div');d.className='mini-actions plfx';box.appendChild(d);}
  const b=document.createElement('button');b.className='btn';b.textContent='🏙️ Ciudad pixel';b.onclick=()=>{const ci=PL&&PL.rid===G.sel?PL.city:null;
    const cs=ci==null&&typeof citiesOf==='function'?citiesOf(G.sel):[];let best=ci;if(best==null&&cs.length)best=cs.reduce((a,i)=>CITIES[i][2]>CITIES[a][2]?i:a,cs[0]);ctyShow(G.sel,best);};
  d.appendChild(b);}catch(e){}};}
/* Ajustes: mostrar u ocultar el botón de la prueba 3 */
{const _ss=showSettings;showSettings=function(){_ss();try{const b=$('sheetIn');if(!b||b.querySelector('[data-px3]'))return;const on=CFG.px3!==0;
  const x=document.createElement('div');x.className='item';x.style.display='block';
  x.innerHTML=`<div class="t">🏙️ Vista ciudad pixel</div><div class="s"><span>Barrio en pixel isométrico generado con los datos de cada provincia.</span> <span>Se abre con «🏙️ Ciudad pixel» debajo del mapa.</span></div><div class="chips" style="margin-top:6px"><button data-px3="1" class="${on?'on':''}">Mostrar</button><button data-px3="0" class="${on?'':'on'}">Ocultar</button></div>`;
  const ref=b.querySelector('#cfPxUI')||b.querySelector('#sMfx');(ref?ref.after(x):b.appendChild(x));
  x.querySelectorAll('[data-px3]').forEach(y=>y.onclick=()=>{CFG.px3=+y.dataset.px3;saveCfg();try{renderSel();}catch(e){}showSettings();});}catch(e){console.warn('v22d ajustes',e);}};}
