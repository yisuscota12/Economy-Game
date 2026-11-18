/* ===== v1.0: flechas de frente — avance de cada ejército en marcha (curva + punta de flecha) ===== */
function drawFrontArrows(g,u){if(!G||!G.armies||!G.armies.length)return;const me=cmdNat()||(P&&P.alive?natOf(P).id:null);let n=0;
  const list=G.armies.filter(a=>!a.sea&&a.path&&a.path.length&&armyVisible(a)).sort((a,b)=>(b.o===me)-(a.o===me)||b.n-a.n);
  for(const a of list){if(n>=45)break;const ally=me&&a.o!==me&&typeof friendlyCtrl==='function'&&(G.nations[me].allies||[]).includes(a.o);const host=me&&hostile(me,a.o);
    if(!(a.o===me||ally||host||warsOf(a.o).length))continue;n++;
    const col=a.o===me?'#f2c14e':host?'#ff4d4d':ally?'#6fb6ff':(()=>{const c=rgbOf(G.nations[a.o].color);return `rgb(${c.map(v=>Math.min(255,Math.round(v*1.25+30)))})`;})();
    const pts=[armyPos(a).slice()].concat(a.path.slice(0,3).map(r=>RG[r].c));if(pts.length<2)continue;
    // acorta el final para que la punta no tape el destino
    const L=pts.length,e=pts[L-1],p=pts[L-2],dx=e[0]-p[0],dy=e[1]-p[1],dl=Math.hypot(dx,dy)||1,hl=Math.min(9*u,dl*.45),cut=Math.min(4*u,dl*.25);
    const end=[e[0]-dx/dl*cut,e[1]-dy/dl*cut],base=[end[0]-dx/dl*hl,end[1]-dy/dl*hl];pts[L-1]=base;
    // curva Catmull-Rom → Bézier
    let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
      const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;}
    const w=(a.n>1e5?4.6:a.n>2e4?3.8:3)*u;
    el('path',{d,fill:'none',stroke:'rgba(8,12,18,.8)','stroke-width':w+2.6*u,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.85},g);
    el('path',{d,fill:'none',stroke:col,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round',opacity:.9},g);
    const nx=-dy/dl,ny=dx/dl,hw=w*1.25+2.5*u;
    el('polygon',{points:`${end[0]},${end[1]} ${base[0]+nx*hw},${base[1]+ny*hw} ${base[0]-nx*hw},${base[1]-ny*hw}`,fill:col,stroke:'rgba(8,12,18,.85)','stroke-width':1.2*u,'stroke-linejoin':'round'},g);}}
