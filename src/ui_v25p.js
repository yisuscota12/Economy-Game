/* ===== v2.5p — mapa: rutas de barcos y aviones visibles y envíos de todas las empresas de logística =====
   Solo interfaz (dibujo en el lienzo #lgc de la v2.4a): no toca reglas, motor, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Por qué no se veían: la capa de la v2.4a (lgPick) dibujaba como mucho 80 puntos (20 en el modo ligero) y ordenaba los envíos con un
   peso enorme para tus empresas y tu país, así que casi todo el cupo se iba en los envíos por tierra de tu propio país y los de las otras
   empresas (sobre todo los marítimos entre otros países) nunca entraban. Además las rutas eran un trazo sólido de 1 px al 17 % de
   opacidad, los puntos llevaban el color del transportista (no el del modo: un barco y un camión se veían igual) y cada ruta marítima
   nueva solo se calculaba de a una por cuadro y las que no cabían se saltaban.
   Ahora:
   a) Rutas marítimas (puerto a puerto, por el océano) y aéreas como líneas punteadas: marcadas en el modo de mapa «Logística»
      (pestaña de la burbuja del mapa) y tenues en el mapa normal; las terrestres, trazo fino continuo.
   b) Cada envío es un punto que avanza por su ruta según el día del mes actual (sin azar: la fase sale del identificador de la ruta);
      al avanzar el tiempo el punto se desliza hasta su nueva posición. Color por modo: 🚢 mar azul, 🚚 tierra ámbar, ✈️ aire lila.
   c) Envíos de todas las empresas de logística (la IA y las tuyas); los tuyos con aro dorado y su ruta en dorado.
   Límite: como mucho 300 puntos; en el modo ligero (mapMode 'lite' / html.v4lt) solo las rutas, sin puntos ni animación. */
(function(){
  if(typeof lgDraw!=='function'||typeof lgPathOf!=='function'||typeof lgFlows!=='function'||typeof LGD!=='object')return;
  const COL={mar:'#38bdf8',ter:'#f5a524',aer:'#d4a8ff'},GOLD='#f2c14e',MAXD=300;
  const S5={tm:null,from:0,t0:0,g:null,dec:0,tr:{},trF:null};
  const isLite=()=>{try{return mapMode!=='gl'||document.documentElement.classList.contains('v4lt');}catch(e){return true;}};
  // «modo de logística»: la pestaña Logística de la burbuja del mapa (v2.4b) elegida para el tipo de mapa actual
  const logMode=()=>{try{return typeof V4==='object'&&V4&&V4.cat==='log'&&V4.cm===(typeof MMODE!=='undefined'?MMODE:'pol');}catch(e){return false;}};
  // tiempo del juego en meses (año·12 + mes + fracción del mes según el día)
  function tmNow(){const d=G.day||0;const m=typeof monthOfDay==='function'?monthOfDay(d):Math.min(11,G.month||0);const a=MCUM[m],b=MCUM[m+1]||365;
    return G.year*12+m+Math.min(1,Math.max(0,(d-a)/Math.max(1,b-a)));}
  function tmAt(now){const k=Math.min(1,Math.max(0,(now-S5.t0)/2200));const e=1-Math.pow(1-k,3);return S5.from+(S5.tm-S5.from)*e;}
  // al cambiar el día o el mes el punto se desliza hasta su nueva posición (como mucho un mes de recorrido por deslizamiento)
  function tmShown(now){const t=tmNow();if(S5.g!==G||S5.tm==null||Math.abs(t-S5.tm)>36){S5.g=G;S5.tm=t;S5.from=t;S5.t0=now;return t;}
    if(t!==S5.tm){const cur=tmAt(now);S5.from=Math.max(cur,t-1);if(t<S5.from)S5.from=t;S5.tm=t;S5.t0=now;}return tmAt(now);}
  // duración del viaje en meses (según el largo de la ruta en el mapa y el modo)
  const tripM=(f,o)=>f.m==='mar'?clamp(o.len/1100,.4,1.6):f.m==='aer'?clamp(o.len/9000,.08,.25):clamp(o.len/700,.15,.7);
  // el mapa de identificadores (agua) hace falta para trazar las rutas por el mar: se decodifica en un momento libre
  function needIds(){if(S5.dec||LGD.sea)return;if(typeof IDS==='undefined'||IDS||typeof decodeIds!=='function')return;S5.dec=1;
    (window.requestIdleCallback||setTimeout)(()=>{try{decodeIds();}catch(e){}LGD.P={};try{lgKick();}catch(e){}});}
  function pick(budget){const F=lgFlows();if(LGD.F!==F){LGD.F=F;LGD.P={};LGD.q=[];}const out=[];const ready=lgSeaReady();if(S5.trF!==LGD.P){S5.trF=LGD.P;S5.tr={};}
    for(const f of F){let o=LGD.P[f.id];
      // ruta marítima por el océano: se calcula una sola vez (si no hay camino por agua queda el arco de respaldo)
      if(f.m==='mar'&&ready&&(!o||o.fb)&&!S5.tr[f.id]){if(budget<=0){LGD.q.push(1);if(!o)continue;}else{budget--;S5.tr[f.id]=1;o=lgPathOf(f);}}
      else if(!o)o=lgPathOf(f);
      if(o&&lgVisible(o))out.push([f,o]);}
    return out;}
  function draw(now,still){const c=lgCv();if(!c)return;const w=$('mapWrap');const dpr=mapDpr();const cw=Math.round(w.clientWidth*dpr),ch=Math.round(w.clientHeight*dpr);
    if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}
    const x=c.getContext('2d');x.clearRect(0,0,cw,ch);if(!lgOn()||!G||!G.lg||!mapReady)return;LGD.q=[];needIds();
    const lite=isLite(),strong=logMode();const L=pick(lite?1:2);if(!L.length)return;
    const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const pm=lgPMap();const k=cw/vb.w;const sx=X=>(X-vb.x)*k,sy=Y=>(Y-vb.y)*k;
    const DL={};(G.lg.dl||[]).forEach(([id,e])=>DL[id]=e);
    // ---- rutas: agrupadas por estilo (pocas llamadas a stroke) ----
    const grp={};const addR=(key,o)=>{(grp[key]||(grp[key]=[])).push(o);};
    for(const [f,o] of L){const mine=!!pm[f.id];addR((mine?'p':f.id===LGD.hi?'h':'n')+f.m,o);}
    const path=o=>{for(const s of [0,-MW,MW]){if(!(o.bb[2]+s>=vb.x&&o.bb[0]+s<=vb.x+vb.w))continue;const p=o.pts;x.moveTo(sx(p[0][0]+s),sy(p[0][1]));for(let i=1;i<p.length;i++)x.lineTo(sx(p[i][0]+s),sy(p[i][1]));}};
    x.save();x.lineCap='round';x.lineJoin='round';
    const AL=strong?{mar:.75,aer:.6,ter:.4}:{mar:.32,aer:.26,ter:.13};
    const DS={mar:[6,5],aer:[2,5],ter:[]};const off=(!lite&&strong)?-(now/90)%11:0;
    for(const key in grp){const t=key[0],m=key.slice(1);x.strokeStyle=t==='p'?GOLD:COL[m];x.globalAlpha=t==='h'?.9:t==='p'?Math.min(1,AL[m]+.3):AL[m];
      x.lineWidth=Math.max(1,dpr*(t==='p'?2:strong?1.5:1.05));x.setLineDash(DS[m].map(v=>v*dpr));x.lineDashOffset=off*dpr;x.beginPath();grp[key].forEach(path);x.stroke();}
    x.setLineDash([]);x.restore();
    if(lite){if(LGD.hi&&now-LGD.hiT>9000)LGD.hi=null;return;}
    // ---- envíos: puntos que avanzan según el mes (los tuyos primero, luego tu país, luego por valor) ----
    const tm=tmShown(now);
    const R=L.map(([f,o])=>[(pm[f.id]?3e15:0)+(f.id===LGD.hi?1e15:0)+(me&&(f.na===me||f.nb===me)?2e12:0)+f.v,f,o]).sort((a,b)=>b[0]-a[0]);
    const N=new Array(R.length).fill(0);let n=0;for(let i=0;i<R.length&&n<MAXD;i++){if(DL[R[i][1].id]===2)continue;N[i]=1;n++;}
    for(let pass=0;pass<2&&n<MAXD;pass++)for(let i=0;i<R.length&&n<MAXD;i++){const f=R[i][1];if(!N[i])continue;const want=f.v>5e10?3:f.v>1e10?2:1;if(N[i]<want){N[i]++;n++;}}
    const r=clamp(2.6*dpr*Math.pow(1200/vb.w,.25),1.7*dpr,4.2*dpr);const pulse=.5+.5*Math.sin(now/420);
    const dots={mar:[],ter:[],aer:[]},mineD=[],late=[],lost=[];
    const at=(o,u)=>{const p=lgAt(o,u);let X=sx(lgMod(p[0]));const Y=sy(p[1]);if(X<-10||X>cw+10){const a=sx(lgMod(p[0])-MW),b=sx(lgMod(p[0])+MW);X=a>=-10&&a<=cw+10?a:b;}
      return X<-10||X>cw+10||Y<-10||Y>ch+10?null:[X,Y];};
    for(let i=0;i<R.length;i++){const [,f,o]=R[i];const e=DL[f.id]||0;
      if(e===2){const q=at(o,.5);if(q)lost.push(q);}
      if(!N[i])continue;const D=tripM(f,o)*(e===1?1.6:1);const ph=h21(f.id);
      for(let j=0;j<N[i];j++){let u=(tm/D+ph+j/N[i])%1;if(u<0)u+=1;const q=at(o,u);if(!q)continue;(dots[f.m]||dots.ter).push(q);if(pm[f.id])mineD.push(q);if(e===1)late.push(q);}}
    x.save();x.globalAlpha=1;
    // estela suave de los barcos (barato: un círculo grande y transparente por barco)
    if(dots.mar.length){x.fillStyle=COL.mar;x.globalAlpha=.16+.1*pulse;x.beginPath();dots.mar.forEach(([X,Y])=>{x.moveTo(X+r*2.1,Y);x.arc(X,Y,r*2.1,0,6.2832);});x.fill();x.globalAlpha=1;}
    for(const m of ['ter','mar','aer']){const A=dots[m];if(!A.length)continue;x.beginPath();A.forEach(([X,Y])=>{x.moveTo(X+r,Y);x.arc(X,Y,r,0,6.2832);});
      x.fillStyle=COL[m];x.fill();x.lineWidth=Math.max(1,dpr*.8);x.strokeStyle='rgba(8,12,18,.85)';x.stroke();}
    if(late.length){x.beginPath();late.forEach(([X,Y])=>{x.moveTo(X+r+1,Y);x.arc(X,Y,r+1,0,6.2832);});x.lineWidth=Math.max(1,dpr*1.1);x.strokeStyle='#f08a4b';x.stroke();}
    if(mineD.length){const rr=r+1.6*dpr;x.beginPath();mineD.forEach(([X,Y])=>{x.moveTo(X+rr,Y);x.arc(X,Y,rr,0,6.2832);});x.lineWidth=Math.max(1.2,dpr*1.5);x.strokeStyle=GOLD;x.stroke();}
    if(lost.length){x.strokeStyle='#e74c3c';x.lineWidth=1.6*dpr;const s=r*1.2;x.beginPath();lost.forEach(([X,Y])=>{x.moveTo(X-s,Y-s);x.lineTo(X+s,Y+s);x.moveTo(X+s,Y-s);x.lineTo(X-s,Y+s);});x.stroke();}
    x.restore();
    if(LGD.hi&&now-LGD.hiT>9000)LGD.hi=null;}
  // reemplaza el dibujo de la v2.4a; las rutas aéreas de pasajeros (v2.4c) siguen encima, salvo en el modo ligero
  lgDraw=function(now,still){try{draw(now,still);}catch(e){console.warn('v25p envíos',e);}if(!isLite()){try{if(typeof aeDraw==='function')aeDraw(now,still);}catch(e){}}};
  // al elegir la pestaña Logística de la burbuja se redibuja al momento con las rutas marcadas
  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-v4cat]');if(b)setTimeout(()=>{try{if(isLite())lgDraw(performance.now(),true);else lgKick();}catch(err){}},0);},true);
})();
