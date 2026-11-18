// Prueba de balance de guerra: pares de países, meses hasta la capitulación o la paz (IA contra IA).
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files=(process.env.FILES||'engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16').split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,newPlayer,declareWar,monthTick,syncMando,warsOf,regionsOf,occShare,exOf,capitalOf,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const N=+(args.n||8),mode=args.mode||'realista';
const pairs=(args.pairs||'USA-MEX,CHN-VNM,RUS-KAZ,DEU-POL,IND-PAK,BRA-ARG,FRA-DEU,TUR-IRN').split(',');const out={};
for(const pr of pairs){const [a,b]=pr.split('-');const res=[];
  for(let i=0;i<N;i++){A.G=A.newWorld(mode);const r=Object.keys(A.G.regions).find(k=>A.G.regions[k].o==='ISL');A.P=A.newPlayer({first:'T',surname:'S',sex:'M',r,age:30});
    A.declareWar(a,b);A.syncMando();let m=0,end='sigue';const w0=A.G.wars.find(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));
    for(;m<48;m++){if(A.G.month>=12)A.G.month=0;try{A.monthTick(true);}catch(e){end='ERR '+e.message;break;}
      if(!A.G.wars.includes(w0)){end=w0.win?(w0.win===a?'gana '+a:'gana '+b):'paz';break;}}
    res.push([m+1,end,Math.round(A.occShare(b)*100)]);}
  const ms=res.map(x=>x[0]).sort((x,y)=>x-y);out[pr]={mediana_meses:ms[Math.floor(ms.length/2)],resultados:res.map(x=>x[1]+'@'+x[0]+'('+x[2]+'%)').join(' ')};}
console.log(JSON.stringify(out,null,1));
