// Arcos de frontera (topología compartida) en coordenadas del mapa: binario compacto
const fs=require('fs');
const topo=JSON.parse(fs.readFileSync('raw/prov_t3%.json'));const obj=Object.values(topo.objects)[0];
const M=JSON.parse(fs.readFileSync('raw/map2.json'));
const gj=JSON.parse(fs.readFileSync('raw/prov_robin.json'));
let ymax=-Infinity;const walkP=c=>{if(typeof c[0]==='number'){if(c[1]>ymax)ymax=c[1];}else c.forEach(walkP);};gj.features.forEach(f=>f.geometry&&walkP(f.geometry.coordinates));
const XMAX=17005833.33,W=4096,S=W/(2*XMAX),YMAX=ymax+150000;
const [sx,sy]=topo.transform.scale,[tx,ty]=topo.transform.translate;
// dueños de cada arco
const own=topo.arcs.map(()=>[]);
const walk=(a,idx)=>{if(Array.isArray(a))a.forEach(x=>walk(x,idx));else{const k=a<0?~a:a;if(!own[k].includes(idx))own[k].push(idx);}};
obj.geometries.forEach(g=>{const r=M.regions[g.properties.rid];if(!r||!g.arcs)return;walk(g.arcs,r.i);});
const A=[],B=[],N=[],pts=[];let skipped=0;
topo.arcs.forEach((arc,k)=>{const o=own[k];if(!o.length){skipped++;return;}
  let x=0,y=0;const p=arc.map(([dx,dy])=>{x+=dx;y+=dy;const X=x*sx+tx,Y=y*sy+ty;return [(X+XMAX)*S,(YMAX-Y)*S];});
  // quita puntos repetidos tras cuantizar a 1/16 px
  const q=[];p.forEach(([a,b])=>{const qa=Math.round(a*16),qb=Math.round(b*16);const l=q[q.length-1];if(!l||l[0]!==qa||l[1]!==qb)q.push([qa,qb]);});
  if(q.length<2){skipped++;return;}
  A.push(o[0]);B.push(o[1]||0);N.push(q.length);q.forEach(v=>pts.push(Math.max(0,Math.min(65535,v[0])),Math.max(0,Math.min(65535,v[1]))));});
const nA=A.length,head=new Uint32Array([nA,pts.length/2]);
const buf=Buffer.concat([Buffer.from(head.buffer),Buffer.from(new Uint16Array(A).buffer),Buffer.from(new Uint16Array(B).buffer),Buffer.from(new Uint32Array(N).buffer),Buffer.from(new Uint16Array(pts).buffer)]);
fs.writeFileSync('raw/borders_lo.bin',buf);
console.log('arcos',nA,'puntos',pts.length/2,'omitidos',skipped,'bytes',buf.length,'costa',B.filter(b=>!b).length);
