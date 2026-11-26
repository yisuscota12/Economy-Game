// Prueba de la v2.6b (ranking con vectores, solo lectura): node rk26test.js [years=2] [mode=realista] [seed=7] [c=USA,CHN,URY,CRI]
// Carga el motor (lista de build.js) y src/ui_v26b.js con vm (sin pantalla: el módulo omite el CSS y no hay rankTab).
// Revisa 5 países (grande, pequeños y uno en guerra): tendencias finitas (sin NaN), barras entre 0 y 1, y que leer
// no cambia el orden de ranking() ni el estado de los países. Prueba las dos fuentes: estimada (sin foto) y foto anual.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
const Y=+(args.years||2),mode=args.mode||'realista';let s0=+(args.seed||7);
const files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),
  CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),
  console,Math:Object.create(Math),JSON,Object,Array,Set,Map,String,Number,isFinite,Float32Array,Float64Array,Int16Array,Int32Array,Uint8Array,Uint16Array,Date};
ctx.Math.random=()=>{s0=(s0*1103515245+12345)%2147483648;return s0/2147483648;};
vm.createContext(ctx);vm.runInContext(files.concat(['src/ui_v26b.js']).map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);const X=ctx.X;
X(`G=newWorld('${mode}');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='MEX').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
X(`P=newPlayer({first:'Prueba',surname:'Ranking',sex:'F',r:'${rs[0]}',age:0});P.age=30;G.day=0;ensureV14();dlgRoll=function(){return 0};`);
const adv=m=>{for(let i=0;i<m;i++)X(`ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;P.alive=true;P.age=30;P.s.salud=90;`);};
adv(Y*12);
let warNid=X(`(G.wars[0]&&G.nations[G.wars[0].a].alive)?G.wars[0].a:null`);if(!warNid){X(`declareWar('RUS','UKR')`);warNid='UKR';}
const C=(args.c||'USA,CHN,URY,CRI').split(',').concat([warNid]);const err=[];
function check(tag){const ordA=X(`JSON.stringify(ranking().map(x=>x.id))`);const st=X(`JSON.stringify(G.nations)`);
  const R=X(`rk26Data()`);const ordB=X(`JSON.stringify(ranking().map(x=>x.id))`);const st2=X(`JSON.stringify(G.nations)`);
  if(ordA!==ordB)err.push(tag+': el orden del ranking cambió al leer');if(st!==st2)err.push(tag+': la lectura cambió los países');
  if(JSON.stringify(R.rows.map(r=>r.id))!==ordA)err.push(tag+': las filas no siguen el orden de ranking()');
  console.log(`\n[${tag}] fuente: ${R.src==='snap'?'foto anual en memoria (desde '+R.y0+')':'estimada (n.g y popG)'} · ${R.rows.length} países`);
  C.forEach(id=>{const r=R.rows.find(x=>x.id===id);if(!r){console.log(id,'no está vivo');return;}
    for(const k of ['s','gdp','pop','pw']){const b=r.bar[k];if(!(b>=0&&b<=1))err.push(`${tag} ${id}: barra ${k}=${b}`);const t=r.tr[k];
      if(t.k!=='n'&&!isFinite(t.c))err.push(`${tag} ${id}: tendencia ${k} no finita`);if(t.c!=null&&!isFinite(t.c))err.push(`${tag} ${id}: NaN en ${k}`);}
    const f=t=>t.k==='n'?'sin dato':({u:'▲',d:'▼',e:'▶'}[t.k])+(t.c*100).toFixed(2)+'%'+(t.est?'*':'');
    console.log(`${('#'+r.pos).padStart(4)} ${id}${id===warNid?' (en guerra)':''} · pts ${r.s.toFixed(1)} ${f(r.tr.s)} barra ${r.bar.s.toFixed(3)} · PIB ${f(r.tr.gdp)} barra ${r.bar.gdp.toFixed(3)} · pobl ${f(r.tr.pop)} barra ${r.bar.pop.toFixed(3)} · poder ${r.pw.toFixed(1)} ${f(r.tr.pw)} barra ${r.bar.pw.toFixed(3)}`);});
  const nan=R.rows.some(r=>['s','gdp','pop','pw'].some(k=>!(r.bar[k]>=0&&r.bar[k]<=1)||(r.tr[k].c!=null&&!isFinite(r.tr[k].c))));if(nan)err.push(tag+': algún país (de todos) con NaN o barra fuera de 0..1');}
X('RK26S=null');check('sin foto');
adv(12);check('con foto');
console.log('\nerrores:',err.length?err:'ninguno');process.exit(err.length?1:0);
