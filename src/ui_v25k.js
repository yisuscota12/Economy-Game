/* ===== v2.5k — fase 3 de la ruta (pendiente C): cada ciudad del mapa con su silueta pixel =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3; en imperioCfg solo el campo opcional CFG.cpx), worker ni IndexedDB.
   · Al acercar el mapa (upp < .6), encima de cada ciudad con nombre visible se dibuja una silueta pixel pequeña (32×26), al estilo
     TheoTown / Plague Inc. Se genera con código y semilla fija (h21 con el nombre y el índice: nada de Math.random), así la misma
     ciudad siempre se ve igual. Base: las primitivas de la vista isométrica de ui_v22d.js, aplanadas a un perfil frontal.
   · Qué la identifica: tamaño (CITIES[i][2]) → cuántos edificios y qué tan alto el skyline; riqueza de la provincia (PIB por
     persona) → torres de vidrio o casas bajas; capital (CITIES[i][4]===2, o la mayor ciudad de una provincia RG[r].cap) → cúpula
     con bandera al centro; costa (RG[r].co) → agua, muelle y, en ciudades grandes, grúa de puerto; bioma (ntBase(r).k) → montañas
     con nieve, dunas, selva, pinos, acacia o colinas detrás, y techos a dos aguas en clima frío o cúpulas bajas en el desierto;
     más de 5 millones → una aguja muy alta.
   · Paleta reducida de 6 colores tomada de las variables del tema (--ink o --card2, --mut, --gold, --teal, --blue) más un contorno oscuro.
     Si cambia el tema se regenera. Cada silueta se hace una vez (canvas → PNG en memoria) y se reutiliza.
   · Escala entera: cada pixel del dibujo mide 1 o 2 px CSS (× devicePixelRatio) con image-rendering:pixelated → nítido en iPhone 11.
   · Modo ligero (mapMode 'lite' / html.v4lt, Toshiba): no se dibuja nada. Ajustes → «🏙️ Siluetas de ciudades» (CFG.cpx=0 las oculta).
   Se carga después de ui_v25j.js. */
(function(){
  if(typeof drawOverlay!=='function'||typeof CITIES==='undefined'||typeof h21!=='function')return;
  const SW=32,SH=26,CPX={c:new Map(),th:''};
  function cpxOn(){try{if(typeof CFG!=='undefined'&&CFG&&CFG.cpx===0)return false;if(typeof mapMode!=='undefined'&&mapMode==='lite')return false;
    if(document.documentElement.classList.contains('v4lt'))return false;}catch(e){return false;}return true;}
  function hexOf(v,d){v=String(v||'').trim();if(/^#[0-9a-f]{6}$/i.test(v))return v;if(/^#[0-9a-f]{3}$/i.test(v))return '#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];return d;}
  function rgbOf(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  function lum(h){const c=rgbOf(h);return (.299*c[0]+.587*c[1]+.114*c[2])/255;}
  /* índices: 0 vacío · 1 contorno · 2 fachada clara · 3 sombra/relieve · 4 dorado (ventanas, cúpula, dunas) · 5 verde azulado (árboles) · 6 agua */
  function cpxPal(){const cs=getComputedStyle(document.documentElement),g=k=>cs.getPropertyValue(k);
    const ink=hexOf(g('--ink'),'#e8edf4'),card=hexOf(g('--card2'),'#1b2330');
    return [null,'#0b1118',lum(ink)>=lum(card)?ink:card,hexOf(g('--mut'),'#8d98a8'),hexOf(g('--gold'),'#f2c14e'),hexOf(g('--teal'),'#3fb6a8'),hexOf(g('--blue'),'#5aa2f0')];}
  /* datos de la ciudad que eligen la silueta */
  function cpxInfo(i){const c=CITIES[i];let r=null;try{r=typeof cityReg==='function'?cityReg(i):(typeof cityRid==='function'?cityRid(i):null);}catch(e){}
    const rd=r&&RG[r]?RG[r]:null;let bio='templado';try{if(r&&typeof ntBase==='function')bio=ntBase(r).k||bio;}catch(e){}
    let pc=2000;try{const x=G&&G.regions&&r?G.regions[r]:null;if(x&&x.pop>0)pc=x.gdp/x.pop;}catch(e){}
    let cap=c[4]===2;if(!cap&&rd&&rd.cap&&typeof citiesOf==='function'){try{const cs=citiesOf(r);cap=cs.length>0&&cs.reduce((a,j)=>CITIES[j][2]>CITIES[a][2]?j:a,cs[0])===i;}catch(e){}}
    const cl=x=>Math.max(0,Math.min(1,x));
    return {name:c[3],pop:c[2],cap,co:!!(rd&&rd.co),bio,rich:cl(Math.log10(Math.max(300,pc)/800)/2.1),big:cl((Math.log10(Math.max(1e3,c[2]))-4)/3),seed:'cpx:'+c[3]+':'+i};}
  /* generador determinista: rejilla de índices de paleta */
  function cpxGrid(I){let n=0;const R=()=>h21(I.seed+'#'+(n++));const g=new Uint8Array(SW*SH),f=new Uint8Array(SW*SH);let FR=0;
    const set=(x,y,v)=>{x|=0;y|=0;if(x>=1&&y>=1&&x<SW-1&&y<SH-1){g[y*SW+x]=v;f[y*SW+x]=FR;}};
    const rect=(x,y,w,h,v)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)set(x+i,y+j,v);};
    const gy=SH-2;const wl=I.co?7:0,wR=R()<.5;const lx0=I.co&&!wR?1+wl:1,lx1=I.co&&wR?SW-1-wl:SW-1;
    const cold=I.bio==='taiga'||I.bio==='tundra'||I.bio==='montana'||I.bio==='templado'||I.bio==='pradera',dry=I.bio==='desierto'||I.bio==='estepa';
    /* 1) relieve de fondo */
    const peak=(cx,h,v,snow)=>{for(let d=0;d<h;d++){const y=gy-h+d,hw=Math.floor(d*.9);for(let x=cx-hw;x<=cx+hw;x++)set(x,y,snow&&d<Math.max(2,h/4)?2:v);}};
    const blob=(cx,cy,r,v)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.6)set(cx+x,cy+y,v);};
    if(I.bio==='montana'){const k=2+(R()<.5?1:0);for(let q=0;q<k;q++)peak(lx0+3+Math.floor(R()*(lx1-lx0-6)),9+Math.floor(R()*7),3,true);}
    else if(I.bio==='tundra'){for(let x=lx0;x<lx1;x++){const h=2+Math.round(1.5+1.5*Math.sin(x*.35+R()*.2));rect(x,gy-h,1,h,2);}}
    else if(I.bio==='taiga'){for(let q=0;q<6;q++){const cx=lx0+1+Math.floor(R()*(lx1-lx0-2)),h=5+Math.floor(R()*3);for(let d=0;d<h;d++){const hw=Math.floor(d/2);rect(cx-hw,gy-h+d,hw*2+1,1,5);}}}
    else if(I.bio==='selva'){for(let q=0;q<7;q++)blob(lx0+2+Math.floor(R()*(lx1-lx0-4)),gy-4-Math.floor(R()*3),2+Math.floor(R()*2),5);}
    else if(I.bio==='subtrop'){for(let q=0;q<4;q++)blob(lx0+2+Math.floor(R()*(lx1-lx0-4)),gy-3-Math.floor(R()*2),2,5);}
    else if(I.bio==='sabana'){const cx=lx0+3+Math.floor(R()*(lx1-lx0-8));rect(cx+2,gy-6,1,6,3);rect(cx,gy-7,6,2,5);rect(cx+1,gy-8,4,1,5);}
    else if(I.bio==='desierto'){const ph=R()*6;for(let x=lx0;x<lx1;x++){const h=Math.max(1,Math.round(2+2*Math.sin(x*.42+ph)));rect(x,gy-h,1,h,4);}}
    else if(I.bio==='estepa'){const ph=R()*6;for(let x=lx0;x<lx1;x++){const h=Math.max(1,Math.round(1.5+1.2*Math.sin(x*.3+ph)));rect(x,gy-h,1,h,3);}}
    else{const cx=lx0+Math.floor(R()*(lx1-lx0)),h=3+Math.floor(R()*3);for(let x=lx0;x<lx1;x++){const d=Math.abs(x-cx)/((lx1-lx0)*.6);const hh=Math.round(h*(1-d*d));if(hh>0)rect(x,gy-hh,1,hh,3);}}
    /* 2) suelo */
    rect(lx0,gy,lx1-lx0,1,3);
    /* 3) edificios: más y más altos con la población; torres si además es rica; perfil con el punto alto al centro */
    const nb=3+Math.round(I.big*6),maxH=Math.min(SH-6,5+Math.round(15*I.big*(.35+.65*I.rich))),Lw=lx1-lx0-2;const S=[];let tw=0;
    for(let q=0;q<nb;q++){const w=I.rich>.35&&I.big>.35&&R()<.55?3+(R()<.5?1:0):4+Math.floor(R()*2);const gap=R()<.35?1:0;if(tw+w>Lw)break;S.push({w,gap});tw+=w+gap;}
    if(I.cap){S.splice(Math.floor(S.length/2),0,{w:7,gap:0,cap:true});tw+=7;while(tw>Lw&&S.length>1){const z=S.findIndex(s=>!s.cap);if(z<0)break;tw-=S[z].w+S[z].gap;S.splice(z,1);}}
    FR=1;let x=lx0+1+Math.max(0,Math.floor((Lw-tw)/2));const mid=x+tw/2,half=Math.max(1,tw/2);let tallX=-1,tallH=0;
    S.forEach((s,q)=>{const p=1-Math.min(1,Math.abs(x+s.w/2-mid)/half);
      if(s.cap){rect(x,gy-5,7,5,2);for(let c=0;c<7;c+=2)set(x+c,gy-3,3);const cx=x+3;blob(cx,gy-6,2,4);rect(cx-3,gy-6,7,1,3);set(cx,gy-9,1);set(cx,gy-10,1);set(cx,gy-11,1);rect(cx+1,gy-11,2,1,5);}
      else{let h=Math.max(3,Math.round(3+(maxH-3)*p*(.55+.45*R())));const fill=q%2?3:2,win=4;
        if(h>=11&&I.rich>.35&&s.w<=4){/* torre de vidrio con ventanas en columnas */rect(x,gy-h,s.w,h,2);for(let y=gy-h+2;y<gy-1;y+=2)for(let i=1;i<s.w;i+=2)set(x+i,y,R()<.7?win:3);
          if(h>tallH){tallH=h;tallX=x+Math.floor(s.w/2);}}
        else if(h>=6){/* bloque de departamentos */rect(x,gy-h,s.w,h,fill);for(let y=gy-h+2;y<gy-1;y+=2)for(let i=1;i<s.w-1;i+=2)if(R()<.45)set(x+i,y,win);
          if(dry)set(x+(q%2?0:s.w-1),gy-h-1,fill);}
        else{/* casas: techo a dos aguas en clima frío, cúpula baja en el desierto, plano en el trópico */h=Math.min(h,3+Math.floor(R()*2));rect(x,gy-h,s.w,h,fill);set(x+1,gy-2,win);
          if(cold){for(let d=1;d<=Math.ceil(s.w/2);d++)rect(x+d-1,gy-h-d,s.w-2*(d-1),1,3);}else if(dry){rect(x+1,gy-h-1,s.w-2,1,fill);}}
      }
      x+=s.w+s.gap;});
    /* antena o aguja en la torre más alta; megaciudad (>5 millones): aguja muy alta */
    if(tallX>=0){const sp=I.pop>=5e6?Math.min(gy-tallH-2,6):2;for(let d=1;d<=sp;d++)set(tallX,gy-tallH-d,d===sp?4:3);}
    /* 4) costa: agua, olas, muelle y grúa de puerto en ciudades grandes */
    if(I.co){const wx0=wR?SW-1-wl:1;rect(wx0,gy-1,wl,2,6);for(let i=0;i<wl;i++)if((i+n)%3===0)set(wx0+i,gy-1,2);
      const ed=wR?wx0:wx0+wl-1,dir=wR?1:-1;for(let i=0;i<wl-2;i++)set(ed+dir*i,gy-2,3);for(let i=1;i<wl-2;i+=2)set(ed+dir*i,gy-1,1);
      if(I.pop>=1e6){const cx=wR?wx0-1:wx0+wl;rect(cx,gy-9,1,8,3);for(let i=0;i<5;i++)set(cx+dir*i,gy-9,3);set(cx+dir*4,gy-8,1);set(cx+dir*4,gy-7,4);}}
    /* 5) contorno oscuro: primero separa edificios, muelle y grúa del relieve de fondo (sin tocar suelo ni agua);
       luego 1 px alrededor de todo (aspecto de calcomanía, se lee sobre cualquier terreno) */
    for(let y=1;y<gy;y++)for(let x2=1;x2<SW-1;x2++){const p=y*SW+x2;if(f[p]||!g[p])continue;if(f[p-1]||f[p+1]||f[p-SW]||(y+1<gy&&f[p+SW]))g[p]=1;}
    const o=g.slice();for(let y=0;y<SH;y++)for(let x2=0;x2<SW;x2++){if(o[y*SW+x2])continue;
      if((x2>0&&o[y*SW+x2-1])||(x2<SW-1&&o[y*SW+x2+1])||(y>0&&o[(y-1)*SW+x2])||(y<SH-1&&o[(y+1)*SW+x2]))g[y*SW+x2]=1;}
    return g;}
  function cpxURL(i,pal){const k=i;let u=CPX.c.get(k);if(u)return u;if(CPX.c.size>600)CPX.c.clear();
    const g=cpxGrid(cpxInfo(i)),cv=document.createElement('canvas');cv.width=SW;cv.height=SH;const x=cv.getContext('2d'),im=x.createImageData(SW,SH),P8=pal.map(h=>h?rgbOf(h):null);
    for(let p=0;p<g.length;p++){const c=P8[g[p]];if(!c)continue;im.data[p*4]=c[0];im.data[p*4+1]=c[1];im.data[p*4+2]=c[2];im.data[p*4+3]=255;}
    x.putImageData(im,0,0);u=cv.toDataURL('image/png');CPX.c.set(k,u);return u;}
  window.cpxURL=cpxURL;window.cpxInfo=cpxInfo;
  /* sobre el mapa: solo al acercar y solo en ciudades cuyo nombre ya se dibujó (mismo filtro y tope que map.js) */
  function cpxDraw(){if(!cpxOn()||!G)return;const ov=$('mapOv');if(!ov)return;const u=upp();if(!(u<.6))return;
    const pal=cpxPal(),th=pal.join();if(th!==CPX.th){CPX.th=th;CPX.c.clear();}
    const lab=new Set();ov.querySelectorAll('text').forEach(t=>lab.add(t.textContent));
    const x0=vb.x,x1=vb.x+vb.w,y0=vb.y,y1=vb.y+vb.h,k=u<.22?2:1,w=SW*k*u,h=SH*k*u;const cand=[];
    for(let i=0;i<CITIES.length;i++){const c=CITIES[i];if(c[0]<x0||c[0]>x1||c[1]<y0||c[1]>y1+h)continue;if(!lab.has(c[3]))continue;cand.push(i);}
    if(!cand.length)return;cand.sort((a,b)=>CITIES[b][2]-CITIES[a][2]);
    const gr=el('g',{'class':'cpx'});ov.insertBefore(gr,ov.children[4]||null);const boxes=[];let shown=0;
    for(const i of cand){if(shown>=28)break;const c=CITIES[i],bx=c[0]-w/2,by=c[1]-7*u-h;
      if(boxes.some(b=>bx<b[0]+b[2]&&b[0]<bx+w&&by<b[1]+b[3]&&b[1]<by+h))continue;boxes.push([bx,by,w,h]);shown++;
      const url=cpxURL(i,pal);const im=el('image',{x:bx.toFixed(2),y:by.toFixed(2),width:w.toFixed(2),height:h.toFixed(2),preserveAspectRatio:'none',
        style:'image-rendering:-webkit-optimize-contrast;image-rendering:crisp-edges;image-rendering:pixelated'},gr);
      im.setAttribute('href',url);try{im.setAttributeNS(XL,'xlink:href',url);}catch(e){}}}
  const _do=drawOverlay;drawOverlay=function(){const r=_do.apply(this,arguments);try{cpxDraw();}catch(e){console.warn('v25k siluetas',e);}return r;};
  /* Ajustes: mostrar u ocultar las siluetas */
  if(typeof showSettings==='function'){const _ss=showSettings;showSettings=function(){const r=_ss.apply(this,arguments);try{const b=$('sheetIn');if(!b||b.querySelector('[data-cpx]'))return r;const on=CFG.cpx!==0;
    const d=document.createElement('div');d.className='item';d.style.display='block';
    d.innerHTML=`<div class="t">🏙️ Siluetas de ciudades en el mapa</div><div class="s">Al acercar el mapa, cada ciudad muestra su silueta pixel (rascacielos, cúpula de la capital, puerto, montañas, dunas…) generada con sus datos. Con el mapa ligero no se dibujan.</div><div class="chips" style="margin-top:6px"><button data-cpx="1" class="${on?'on':''}">Mostrar</button><button data-cpx="0" class="${on?'':'on'}">Ocultar</button></div>`;
    const ref=b.querySelector('[data-px3]');const it=ref&&ref.closest('.item');(it?it.after(d):b.appendChild(d));
    d.querySelectorAll('[data-cpx]').forEach(y=>y.onclick=()=>{CFG.cpx=+y.dataset.cpx;saveCfg();try{drawOverlay();}catch(e){}showSettings();});}catch(e){console.warn('v25k ajustes',e);}return r;};}
})();
