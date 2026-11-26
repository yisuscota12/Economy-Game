// Prueba de la v2.6c (programas nucleares): node nk26test.js [years=10] [seed=7] [mode=realista]
// Carga el motor (lista de build.js) con vm y revisa: estado inicial (9 potencias, TNP, reactores), que un país con capacidad alta
// pueda iniciar la rama civil y (fuera del TNP) la militar, que uno sin capacidad no pueda, que el tratado bloquee la militar a un
// firmante, que el gobierno del jugador pague del tesoro, que la detección mensual sea determinista (dos corridas con la misma
// semilla dan el mismo estado) y que no salga NaN en 10 años.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
const Y=+(args.years||10),mode=args.mode||'realista',SEED=+(args.seed||7);
const files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);
const DATA={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),
  CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json'))};
const SRC=files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};';
function boot(seed){let s0=seed;const ctx=Object.assign({},DATA,{console,Math:Object.create(Math),JSON,Object,Array,Set,Map,String,Number,isFinite,Float32Array,Float64Array,Int16Array,Int32Array,Uint8Array,Uint16Array,Date});
  ctx.Math.random=()=>{s0=(s0*1103515245+12345)%2147483648;return s0/2147483648;};vm.createContext(ctx);vm.runInContext(SRC,ctx);const X=ctx.X;
  X(`G=newWorld('${mode}');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='AUS').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
  X(`P=newPlayer({first:'Prueba',surname:'Nuclear',sex:'F',r:'${rs[0]}',age:0});P.age=30;G.day=0;ensureV14();dlgRoll=function(){return 0};`);return X;}
const month=X=>X(`ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;P.alive=true;P.age=30;P.s.salud=90;`);
const err=[];const ok=(c,m)=>{if(!c)err.push(m);};
let X=boot(SEED);
// estado inicial
ok(X(`NUKE.size`)===9,'NUKE inicial ≠ 9');ok(X(`nkOf('USA').m`)===5&&X(`nkOf('IND').npt`)===false&&X(`nkOf('MEX').npt`)===true,'estado inicial TNP/arsenal');
ok(X(`nkOf('FRA').c`)===4&&X(`nkOf('FRA').nr`)>40,'Francia sin reactores');ok(X(`nkOf('TUR').c`)===3,'Turquía no está construyendo');
console.log('capacidad K:',['USA','DEU','AUS','MEX','IRN','SAU','BRA','PAK','PRK','URY','HTI','TCD'].map(k=>k+' '+Math.round(X(`nkK('${k}')`))).join(' · '));
console.log('energía (rebaja %):',['FRA','USA','KOR','MEX','ARG'].map(k=>k+' '+X(`nkEner('${k}')`).toFixed(2)).join(' · '));
// capacidad alta: Australia (uranio propio, sin reactores)
const civA=X(`nkCan('AUS','c',1)`);ok(civA.ok,'AUS no puede iniciar la civil: '+civA.why.join('; '));
const milA=X(`nkCan('AUS','m',1)`);ok(!milA.ok&&milA.why.some(w=>/Proliferación/.test(w)),'el TNP no bloquea la militar de AUS');
X(`nkOf('AUS').npt=false`);const milB=X(`nkCan('AUS','m',1)`);ok(milB.ok,'AUS fuera del TNP no puede iniciar la militar: '+milB.why.join('; '));X(`nkOf('AUS').npt=true`);
// sin capacidad
['HTI','TCD'].forEach(k=>{if(!X(`G.nations['${k}']&&G.nations['${k}'].alive`))return;ok(!X(`nkCan('${k}','c',1)`).ok,k+' sin capacidad puede iniciar la civil');});
// el gobierno del jugador: reglas y tesoro
X(`P.ruler=true;P.career={track:'politica',rank:9,years:1};G.nations.AUS.treas=1e12;`);
ok(X(`nkStart('MEX','c')`).err,'el jugador decidió por otro país');
const st=X(`nkStart('AUS','m')`);ok(st.err&&/Proliferación/.test(st.err),'Australia (TNP) pudo iniciar la militar');
const sc=X(`nkStart('AUS','c')`);ok(sc.ok,'Australia no pudo iniciar la civil: '+(sc.err||''));
ok(X(`nkNPT('AUS',false)`).ok,'no pudo salir del TNP');ok(X(`G.nations.AUS.sanc`)>=3,'salir del TNP sin sanciones');
const sm=X(`nkStart('AUS','m')`);ok(sm.ok,'Australia fuera del TNP no pudo iniciar la militar: '+(sm.err||''));
ok(X(`nkSetPriv('AUS',true)`).ok,'no pudo permitir privados');
const t0=X(`G.nations.AUS.treas`);
// corrida larga
const nanScan=X=>X(`(()=>{let b=0;const chk=v=>{if(typeof v==='number'&&!isFinite(v))b++;};for(const id in G.nk.P){const e=G.nk.P[id];for(const k in e)chk(e[k]);}
  for(const id in G.nations){const n=G.nations[id];if(!n.alive)continue;[n.gdp,n.pop,n.stab,n.sanc,nkK(id),nkEner(id),nkCost(id,'c',3).tot].forEach(chk);}return b;})()`);
for(let m=0;m<Y*12;m++){month(X);X(`P.ruler=true;G.nations.AUS.treas=Math.max(G.nations.AUS.treas,1e12);`);}
ok(X(`G.nations.AUS.treas`)!==t0,'el tesoro no pagó nada');
const mx=X(`nkOf('AUS')`);console.log('AUS tras',Y,'años:',JSON.stringify(mx));
ok(mx.c>=2,'la civil de Australia no avanzó');ok(mx.m>=2||mx.det>0,'la militar de Australia no avanzó ni fue detectada');
ok(nanScan(X)===0,'hay NaN en el estado nuclear');
const sum=X(`(()=>{const P0=G.nk.P;const o={armados:[],militares:[],civiles_operando:0,construyendo:[],fuera_tnp:[],detectados:[]};
  for(const id in P0){const e=P0[id];if(!G.nations[id]||!G.nations[id].alive)continue;if(e.m===5)o.armados.push(id);else if(e.m)o.militares.push(id+':'+e.m);if(e.c===4)o.civiles_operando++;else if(e.c)o.construyendo.push(id+':'+e.c);
  if(!e.npt)o.fuera_tnp.push(id);if(e.det)o.detectados.push(id+'×'+e.det);}o.NUKE=[...NUKE].join(',');return o;})()`);
console.log('mundo:',JSON.stringify(sum));
// determinismo: misma semilla, mismo estado (incluida la detección mensual)
const det=()=>{const Z=boot(SEED);Z(`nkOf('AUS').npt=false;nkOf('AUS').m=2;nkOf('AUS').c=2;nkOf('BRA').npt=false;nkOf('BRA').m=1;`);for(let m=0;m<36;m++)month(Z);return Z(`JSON.stringify([G.nk.P.AUS,G.nk.P.BRA])`);};
const d1=det(),d2=det();ok(d1===d2,'la detección no es determinista');console.log('determinismo (AUS, BRA tras 3 años):',d1);
// la probabilidad mensual sale de h21 (sin Math.random)
const r1=X(`nkRoll('d|AUS|2030|5')`),r2=X(`nkRoll('d|AUS|2030|5')`);ok(r1===r2,'nkRoll no es estable');
console.log('\nerrores:',err.length?err:'ninguno');process.exit(err.length?1:0);
