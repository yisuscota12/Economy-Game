// v1.9b: contraste WCAG de cada tema (lee DS_PAL de src/ui_v19b.js).  node herramientas/contraste.js
// Texto normal: ≥ 4.5:1 (AA). Se mide cada color de texto sobre --bg, --card y --card2 (el peor de los tres) y el texto de --act sobre --act.
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../src/ui_v19b.js','utf8');
const pal=eval('('+src.split('const DS_PAL=')[1].split('};\n')[0]+'})');
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const CR=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
let ok=true;console.log('tema'.padEnd(10),['ink','ink2','mut','gold','teal','red','green','blue','act'].map(x=>x.padStart(6)).join(''));
for(const [k,t] of Object.entries(pal)){const row=[];for(const f of ['ink','ink2','mut','gold','teal','red','green','blue']){const v=Math.min(CR(t[f],t.bg),CR(t[f],t.card),CR(t[f],t.card2));row.push(v);}
  row.push(CR(t.actInk,t.act));const bad=row.some(v=>v<4.5);if(bad)ok=false;console.log(k.padEnd(10),row.map(v=>v.toFixed(2).padStart(6)).join(''),bad?'  ✗':'  ✓ AA');}
process.exit(ok?0:1);
