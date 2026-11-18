// Prueba de la v1.4 (empresas y recursos): node bztest.js years=5 c=MEX mode=realista
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,bzOpen,bzList,bzValue,bzOpenCost,bzU,BZ,DEP,RES0,RESP,RESW0,resNat,fmt,netWorth,cmTrade,bondBuy,bzOpenCost,declareWar,U,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||5),nid=args.c||'MEX';
A.G=A.newWorld(args.mode||'realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(k=>A.G.regions[k].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
A.P=A.newPlayer({first:'T',surname:'Prueba',sex:'M',r:rs[0],age:30});A.G.day=0;A.P.edu.degree='Economía';A.ensureV14();
const out={errores:[],empresas:[]};
// depósitos del país
const dep={};rs.forEach(r=>{for(const k in (A.DEP[r]||{}))(dep[k]=dep[k]||[]).push(ctx.MAP.regions[r].nm);});out.yacimientos=Object.fromEntries(Object.entries(dep).map(([k,v])=>[k,v.slice(0,4).join(', ')]));
const types=A.BZ.map(t=>t.k);const res={};
for(const k of types){A.P.dinero=1e9;A.P.biz=null;A.P.bzx=[];let r=rs[0];const T=A.BZ.find(t=>t.k===k);
  if(T.out==='met')r=rs.find(x=>A.DEP[x]&&Object.keys(A.DEP[x]).some(q=>['iron','copper','gold','lith','ree','uran','coal'].includes(q)));if(T.out==='ene')r=rs.find(x=>A.DEP[x]&&(A.DEP[x].oil||A.DEP[x].gas));
  if(!r){res[k]='sin yacimiento';continue;}const msg=A.bzOpen(A.P,k,r,false);if(!A.P.biz){res[k]='no abre: '+msg;continue;}res[k]={cap:A.bzOpenCost(k,r).cap};}
// simula todas a la vez con el mismo mundo: las guardamos en bzx (máx. 5 en juego, aquí sin límite)
A.P.biz=null;A.P.bzx=[];for(const k of types){if(typeof res[k]!=='object')continue;const T=A.BZ.find(t=>t.k===k);let r=rs[0];if(T.out==='met')r=rs.find(x=>A.DEP[x]&&Object.keys(A.DEP[x]).some(q=>['iron','copper','gold','lith','ree','uran','coal'].includes(q)));if(T.out==='ene')r=rs.find(x=>A.DEP[x]&&(A.DEP[x].oil||A.DEP[x].gas));
  const save=A.P.bzx;A.P.bzx=[];A.P.biz={};A.P.dinero=1e9;A.bzOpen(A.P,k,r,false);const b=A.P.bzx[0];A.P.bzx=save.concat([b]);A.P.biz=null;}
const p0={};for(const k in A.G.rs)p0[k]=A.G.rs[k].p;
for(let s=0;s<Y*12;s++){A.ensureClock();try{A.clockAdvance(31,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n')[1]);break;}A.P.event=null;A.P.dlg=null;A.P.alive=true;A.P.age=30;}
const Uv=A.bzU(rs[0]);
A.P.bzx.forEach(b=>{const L=b.ya.slice(-1)[0]||{};const T=A.BZ.find(t=>t.k===b.k);const cap=A.bzOpenCost(b.k,b.r).cap;out.empresas.push(`${T.ic} ${T.n.padEnd(24)} ventas ${(L.rev/Uv).toFixed(1)}U · utilidad ${(L.net/Uv).toFixed(2)}U · margen ${(L.net/L.rev*100||0).toFixed(0)}% · ROI ${(L.net/cap*100).toFixed(0)}% · rep ${Math.round(b.rep)} · deuda ${(b.debt/Uv).toFixed(1)}U · suc ${b.br} · uso ${Math.round((b.m.slice(-1)[0]||{}).util*100)}% · repartido ${(L.paid/Uv).toFixed(2)}U`);});
out.quiebras=A.P.log.filter(l=>/quiebra/.test(l.t)).map(l=>l.t.slice(0,80));
out.precios=Object.fromEntries(Object.keys(A.G.rs).map(k=>[k,`${p0[k].toFixed(1)} → ${A.G.rs[k].p.toFixed(1)}`]));
out.noticias=(A.G.mk.ev||[]).filter(e=>/sube|cae|prohíbe/.test(e.t)&&!/resultados/.test(e.t)).slice(-6).map(e=>e.y+' '+e.t.slice(0,120));
console.log(JSON.stringify(out,null,1));
