// Prueba de economía: PIB mundial, ranking y crecimiento por grupo de ingreso (sin intervención del jugador).
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,newPlayer,ageUp,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||50),mode=args.mode||'realista';
A.G=A.newWorld(mode);const r=Object.keys(A.G.regions).find(k=>A.G.regions[k].o==='ISL');A.P=A.newPlayer({first:'T',surname:'S',sex:'M',r,age:20});
const snap=()=>{const N=Object.values(A.G.nations).filter(n=>n.alive);const g=N.reduce((s,n)=>s+n.gdp,0),p=N.reduce((s,n)=>s+n.pop,0);return {g,p,N:N.map(n=>({id:n.id,g:n.gdp,p:n.pop}))};};
const s0=snap();const pc0={};s0.N.forEach(n=>pc0[n.id]=n.g/n.p);const marks={};
for(let y=1;y<=Y;y++){A.P.s.salud=100;A.P.alive=true;A.P.event=null;try{A.ageUp();}catch(e){console.log('ERR',e.message);break;}if([10,25,50,100].includes(y))marks[y]=snap();}
const out={};for(const y in marks){const s=marks[y];out['año '+y]={PIB_mundo_CAGR:((Math.pow(s.g/s0.g,1/y)-1)*100).toFixed(2)+'%',pob_CAGR:((Math.pow(s.p/s0.p,1/y)-1)*100).toFixed(2)+'%',
  top10:s.N.sort((a,b)=>b.g-a.g).slice(0,10).map(n=>n.id).join(' ')};
  const grp={rico:[],medio:[],pobre:[]};s.N.forEach(n=>{const p0=pc0[n.id];if(!p0)return;const c=Math.pow((n.g/n.p)/p0,1/y)-1;(p0>30000?grp.rico:p0>5000?grp.medio:grp.pobre).push(c);});
  for(const k in grp){const a=grp[k].sort((x,y)=>x-y);out['año '+y]['pc_'+k]=(a[Math.floor(a.length/2)]*100).toFixed(2)+'%';}}
console.log('top10 inicial',s0.N.sort((a,b)=>b.g-a.g).slice(0,10).map(n=>n.id).join(' '));console.log(JSON.stringify(out,null,1));
