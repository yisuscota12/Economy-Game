// Prueba del motor de diálogo: vidas completas avanzando mes a mes; elige opciones al azar entre las disponibles.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,dlgNode,dlgChoose,dlgNext,resolveEvent,setupLeader,ensureClock,MCUM,monthOfDay,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v},DLG};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const N=+(args.n||6),Y=+(args.years||40);
const cnt={},errs=[];let tot=0,yrs=0;const t0=Date.now();
for(let i=0;i<N;i++){A.G=A.newWorld(args.mode||'realista');A.ensureIdeoAll();const ids=['MEX','USA','DEU','IND','NGA','BRA'];const nid=ids[i%ids.length];
  const r=Object.keys(A.G.regions).find(k=>A.G.regions[k].o===nid);A.P=A.newPlayer({first:'T',surname:'S'+i,sex:i%2?'F':'M',r,age:18});A.G.day=0;
  if(args.lider&&i%2===0){A.G.gm='lider';A.setupLeader(A.P);}
  A.P.partner={name:'Pareja X',rel:50,sex:'F',age:20};A.P.ppl.push({name:'Amigo Uno',k:'amigo',rel:70});A.P.siblings=[{name:'Hermano Dos',sex:'M',age:25}];A.P.job={name:'Oficinista',o:'4',k:1,bonus:1};A.P.career.years=3;A.P.biz=i%3===0?{lvl:1,type:0,luck:1}:null;
  const y0=A.G.year;
  for(let s=0;s<Y*12&&A.P.alive;s++){A.ensureClock();const m=A.monthOfDay(A.G.day);try{A.clockAdvance(A.MCUM[m+1]-A.G.day,{});}catch(e){errs.push('adv '+e.message);break;}
    let k=0;while(A.P.dlg&&k++<10){const V=A.dlgNode(A.P);if(!V)break;const av=V.opts.filter(o=>o.ok);if(!av.length){A.P.dlg=null;break;}const o=av[Math.floor(Math.random()*av.length)];
      if(!A.P.dlg.res)cnt[V.d.id]=(cnt[V.d.id]||0)+(A.P.dlg.node===V.d.start||A.P.dlg.node==='a'?1:0);try{A.dlgChoose(o.i);A.dlgNext();}catch(e){errs.push(V.d.id+' '+e.message);A.P.dlg=null;}}
    if(A.P.event){try{A.resolveEvent(0);}catch(e){A.P.event=null;}}}
  yrs+=A.G.year-y0;}
for(const k in cnt)tot+=cnt[k];
console.log(JSON.stringify({segundos:((Date.now()-t0)/1000).toFixed(1),años:yrs,dialogosPorAño:(tot/Math.max(1,yrs)).toFixed(2),errores:errs.slice(0,8),nunca:A.DLG.map(d=>d.id).filter(id=>!cnt[id]),conteo:cnt},null,0));
