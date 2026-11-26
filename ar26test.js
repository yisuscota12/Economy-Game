// Prueba de la v2.6a (ejércitos: divisiones y armamento, vista derivada): node ar26test.js [years=2] [mode=realista] [seed=7] [c=USA,MEX,URY,CRI]
// Carga todo el motor (lista de build.js) con vm, avanza unos años, declara una guerra si no hay ninguna y revisa 5 países:
// grande, mediano, pequeño, sin ejército y uno en guerra. Comprueba que los efectivos por tipo suman el total, que no hay NaN
// y que ar26Of no cambia la simulación (el estado del país es idéntico antes y después de leerlo).
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
const Y=+(args.years||2),mode=args.mode||'realista';let s0=+(args.seed||7);
const files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),
  CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),
  console,Math:Object.create(Math),JSON,Object,Array,Set,Map,String,Number,isFinite,Float32Array,Float64Array,Int16Array,Int32Array,Uint8Array,Uint16Array,Date};
ctx.Math.random=()=>{s0=(s0*1103515245+12345)%2147483648;return s0/2147483648;};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);const X=ctx.X;
X(`G=newWorld('${mode}');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='MEX').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
X(`P=newPlayer({first:'Prueba',surname:'Armas',sex:'F',r:'${rs[0]}',age:0});P.age=30;G.day=0;ensureV14();dlgRoll=function(){return 0};`);
for(let m=0;m<Y*12;m++)X(`ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;P.alive=true;P.age=30;P.s.salud=90;`);
let warNid=X(`(G.wars[0]&&G.nations[G.wars[0].a].alive)?G.wars[0].a:null`);
if(!warNid){X(`declareWar('RUS','UKR')`);warNid='UKR';}
// un país en guerra con ejércitos en el mapa (como en el modo Mando)
X(`if(typeof spawnArmies==='function'&&!armiesOf('${warNid}').length){G.armies=G.armies||[];if(G.aid==null)G.aid=1;spawnArmies('${warNid}',G.wars.find(w=>w.a==='${warNid}'||w.b==='${warNid}')[ '${warNid}'===G.wars.find(w=>w.a==='${warNid}'||w.b==='${warNid}').a?'b':'a']);}`);
const L=(args.c||'USA,MEX,URY,CRI').split(',').concat([warNid]);const err=[];
const fk=n=>n>=1e6?(n/1e6).toFixed(2)+' M':n>=1e3?(n/1e3).toFixed(1)+' mil':String(n);
L.forEach(id=>{const before=X(`JSON.stringify(G.nations['${id}'])`);const r=X(`ar26Of('${id}')`);const r2=X(`ar26Of('${id}')`);const after=X(`JSON.stringify(G.nations['${id}'])`);
  if(before!==after)err.push(id+': ar26Of cambió el país');if(r!==r2)err.push(id+': la caché no se usó');
  if(r.dead){console.log(id,'desaparecido');return;}
  const sum=r.tipos.reduce((s,t)=>s+t.ef,0);if(sum!==r.total)err.push(`${id}: suma ${sum} ≠ total ${r.total}`);
  const bad=JSON.stringify(r,(k,v)=>typeof v==='number'&&!isFinite(v)?'NaN!':v);if(/NaN!/.test(bad)||/null/.test(bad))err.push(id+': NaN o null');
  const sh=r.tipos.reduce((s,t)=>s+t.share,0);if(Math.abs(sh-1)>1e-9)err.push(id+': reparto suma '+sh);
  console.log(`\n${id} ${X(`G.nations['${id}'].name`)} · nivel ${r.lvl} (${r.nivel}, ${r.score.toFixed(2)}) · activos ${fk(r.total)} (${(r.actPct*100).toFixed(2)} % pobl.) · ${r.div} divisiones · reservistas ${fk(r.res)} (${(r.resPct*100).toFixed(2)} %) · presupuesto ${(r.bud/1e9).toFixed(2)} mil M US$ (${(r.budPct*100).toFixed(2)} % PIB${r.est?', estimado':''})${r.sinFA?' · SIN FUERZAS ARMADAS':''}${r.guerra?' · EN GUERRA con '+r.wars.join(','):''}${r.enArmas?' · ejércitos en el mapa':''}${r.costa?'':' · sin costa'}`);
  r.tipos.forEach(t=>console.log(`  ${t.n.padEnd(20)} ${String(t.div).padStart(4)}${t.menor?'*':' '} ${fk(t.ef).padStart(10)}  ${(t.share*100).toFixed(1).padStart(5)} %  ${t.eq}`));
  console.log(`  suma ${sum} = total ${r.total}`);});
// la caché se invalida al cambiar la fuerza
const a=X(`ar26Of('MEX').total`);X(`G.nations.MEX.army+=5`);const b=X(`ar26Of('MEX').total`);X(`G.nations.MEX.army-=5`);if(a===b)err.push('la caché no se invalidó al cambiar army');
console.log('\nerrores:',err.length?err:'ninguno');process.exit(err.length?1:0);
