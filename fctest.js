// Prueba de la v1.6 (carreras de fama): node fctest.js years=15 c=MEX
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,FC,COACH,AGENT,FTIT,fcStart,fcTrain,fcWork,fcShow,fcSocial,fcFight,fcTitle,fcSign,fcSponsor,fcCharity,fcFans,fcFama,fcOdds,fcTier,actCost,careerOptions,U,toInt,fmt,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||15),nid=args.c||'MEX';const out={errores:[],carreras:{}};
const ks=args.k?args.k.split(','):Object.keys(A.FC);
for(const k of ks){A.G=A.newWorld('realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(x=>A.G.regions[x].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
  A.P=A.newPlayer({first:'T',surname:'Prueba',sex:'M',r:rs[+(args.ri||3)],age:18});A.G.day=0;A.ensureV14();A.P.s.apariencia=60;A.P.s.inteligencia=60;A.P.s.salud=80;A.P.dinero=A.U(A.P)*2;
  A.fcStart(A.P,k);const f=A.P.fc;const C=A.FC[k];const hist=[];let msgs=[];
  for(let y=0;y<Y;y++){
    // presupuesto de tiempo: 120 días (tiempo completo: costos a la mitad)
    let ft=120;const act=(t,fn)=>{const c=A.actCost(t);if(ft<c)return false;ft-=c;const r=fn();if(r&&/Escándalo|CAMPEÓN|éxito|Ganas el/.test(r))msgs.push(y+': '+r.slice(0,110));return true;};
    if(y===2&&f.coach===0)f.coach=1;if(y>=4&&A.P.dinero>A.U(A.P)*4)f.coach=2;if(A.fcTier(f)>=2&&!f.ag)f.ag=1;if(A.fcTier(f)>=3)f.ag=2;
    if(f.off&&f.off.length&&!f.ct){act('x',()=>A.fcSign(A.P,0));}
    act('⭐ Patrocinio',()=>A.fcSponsor(A.P));
    for(let i=0;i<40&&ft>0;i++){
      if(C.sp===2){if(!act('⭐ Entrenar',()=>A.fcTrain(A.P)))break;if(f.inj)continue;if(f.rk<=3)act('⭐ Pelea por el título',()=>A.fcTitle(A.P));else act('⭐ Pelea',()=>A.fcFight(A.P,A.fcOdds(A.P,2)>.62?2:A.fcOdds(A.P,1)>.55?1:0));}
      else if(C.sp===1){if(!act('⭐ Entrenar',()=>A.fcTrain(A.P)))break;act('⭐ Redes',()=>A.fcSocial(A.P,false));}
      else{if(i%3===0){if(!act('⭐ Entrenar',()=>A.fcTrain(A.P)))break;}else if(i%5===4&&A.P.dinero>A.toInt(2e4,'USD')){act('⭐ Obra grande',()=>A.fcWork(A.P,1));}else if(!act('⭐ Obra',()=>A.fcWork(A.P,0)))break;
        const v=f.fans.int>8e4?2:f.fans.nac>4e3?1:0;act(['⭐ Show local','⭐ Show nacional','⭐ Show internacional'][v],()=>A.fcShow(A.P,v));act('⭐ Redes',()=>A.fcSocial(A.P,false));}}
    for(let m=0;m<12;m++){A.ensureClock();try{A.clockAdvance(30.4,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n')[1]);y=Y;break;}A.P.event=null;A.P.dlg=null;A.P.alive=true;A.P.prison=null;if(A.P.s.salud<40)A.P.s.salud=60;}
    if(!A.P.fc){out.errores.push('fc perdido');break;}
    hist.push(`${A.P.age}a niv ${f.sk.toFixed(0)} fans ${Math.round(A.fcFans(f)).toLocaleString()} (L${Math.round(f.fans.loc/1e3)}k N${Math.round(f.fans.nac/1e3)}k I${Math.round(f.fans.int/1e3)}k) fama ${A.fcFama(f)} ${A.FTIT[A.fcTier(f)]} · ingreso ${(f.earnY/A.toInt(1,'USD')/1e3).toFixed(0)}k US$ · ${(f.earnY/A.U(A.P)).toFixed(1)}U${C.sp===2?` · ${f.rec.join('-')} #${f.rk}`:''}${C.sp===1?' · lvl'+f.lvl:''}${f.ct?' · contrato':''}`);}
  out.carreras[k]={trayectoria:hist.filter((_,i)=>i%3===2||i===hist.length-1),premios:f.aw.map(a=>a.y+' '+a.t),escandalos:f.sc,eventos:msgs.slice(0,6)};}
console.log(JSON.stringify(out,null,1));
