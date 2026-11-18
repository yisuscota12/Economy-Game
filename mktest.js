// Prueba de la v1.3 (bolsa y monedas): node mktest.js n=4 years=30 mode=realista
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,engine_v16'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,packG,unpackG,ensureClock,ensureV13,MCUM,monthOfDay,fmt,fmtN,bkTrade,bkEnsure,bkVals,ipoDo,ipoInfo,natAdopt,cxRedenom,natNewCur,cxSetRegime,cxSetRate,ageUp,netWorth,EXCH0,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v},setCurv:v=>CURV=v};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const N=+(args.n||3),Y=+(args.years||30),mode=args.mode||'realista';
const out={errores:[],indices:{},fx:{},reformas:[],cracs:0,eventos:0,saveKB:[],seg:0,operaciones:[]};const t0=Date.now();const ret={};const dd={};
for(let i=0;i<N;i++){A.G=A.newWorld(mode);A.ensureIdeoAll();const nid=['MEX','USA','ARG','DEU'][i%4];const r=Object.keys(A.G.regions).find(k=>A.G.regions[k].o===nid);
  A.P=A.newPlayer({first:'T',surname:'Pérez',sex:'M',r,age:25});A.G.day=0;A.ensureV13();A.P.dinero=200000;A.P.biz={t:3,lvl:3,r,luck:1,y:2026,last:50000};
  const lv0={};for(const k in A.G.mk.X)lv0[k]=A.G.mk.X[k].lv;const fx0={};for(const c of ['MXN','ARS','TRY','VES','EUR','JPY','BRL','IRR'])fx0[c]=A.G.cx[c].fx;const peak={};
  if(i===0){out.operaciones.push(A.fmt(A.P.dinero));A.bkEnsure(A.P);A.P.bk.mg=true;
    out.operaciones.push(JSON.stringify(A.bkTrade('VRDC','b',200,'mkt')));out.operaciones.push(JSON.stringify(A.bkTrade('SAMX','b',3000,'mkt')));out.operaciones.push(JSON.stringify(A.bkTrade('VOLT','ss',50,'mkt')));
    out.operaciones.push(JSON.stringify(A.bkTrade('ORCD','b',100,'lim',A.G.mk.C.ORCD.p*.95)));out.operaciones.push(JSON.stringify(A.bkTrade('VOLG','b',10,'mkt')));
    out.operaciones.push(A.ipoDo(.25));}
  for(let s=0;s<Y*12&&A.P.alive;s++){A.ensureClock();const m=A.monthOfDay(A.G.day);try{A.clockAdvance(A.MCUM[m+1]-A.G.day,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n')[1]);break;}
    A.P.dlg=null;if(A.P.event){try{require('vm');const k=A.P.event.id;ctx.__k=k;vm.runInContext('resolveEvent(0)',ctx);}catch(e){out.errores.push('ev '+e.message);A.P.event=null;}}
    for(const k in A.G.mk.X){const v=A.G.mk.X[k].lv;peak[k]=Math.max(peak[k]||0,v);dd[k]=Math.min(dd[k]||0,v/peak[k]-1);}
    if(!A.P.alive){A.P.alive=true;A.P.age=40;}}
  const yrs=A.G.year-2026;for(const k in lv0){(ret[k]=ret[k]||[]).push(Math.pow(A.G.mk.X[k].lv/lv0[k],1/yrs)-1);}
  for(const c in fx0)(out.fx[c]=out.fx[c]||[]).push(`${fx0[c]}→${A.G.cx[c].fx.toPrecision(4)} ${A.G.cx[c].nm}`);
  out.cracs+=A.G.mk.ev.filter(e=>/Crac/.test(e.t)).length;out.reformas.push(...(A.G.nw||[]).filter(x=>/Reforma monetaria|adopta el|Crisis cambiaria|estabilización/.test(x.t)).map(x=>x.y+': '+x.t.slice(0,140)));
  out.saveKB.push(Math.round(JSON.stringify({G:A.packG(A.G),P:A.P}).length/1024));
  if(i===0){out.cuenta={dinero:A.fmt(A.P.dinero),pos:Object.keys(A.P.bk.pos).map(k=>k+':'+A.P.bk.pos[k].q),loan:A.fmt(A.P.bk.loan),patrimonio:A.fmt(A.netWorth(A.P)),biz:A.P.biz&&A.P.biz.pub,tr:A.P.bk.tr.length,log:A.P.log.filter(l=>/bolsa|margen|Orden|Impuesto a las ganancias|Dividendos|Cambio de moneda|moneda/.test(l.t)).slice(-6).map(l=>l.t)};}
  const nan=Object.values(A.G.mk.C).filter(c=>!isFinite(c.p)).length+Object.values(A.G.cx).filter(c=>!isFinite(c.fx)).length;if(nan)out.errores.push('NaN '+nan);}
for(const k in ret)out.indices[k]=`${(ret[k].reduce((a,b)=>a+b,0)/ret[k].length*100).toFixed(1)} %/año · peor caída ${(dd[k]*100).toFixed(0)} %`;
out.seg=((Date.now()-t0)/1000).toFixed(1);console.log(JSON.stringify(out,null,1));
// ida y vuelta del guardado compacto
{const g=A.G;const s=JSON.stringify(A.packG(g));const g2=A.unpackG(JSON.parse(s));let mx=0;for(const k in g.mk.C){const a=g.mk.C[k].h,b=g2.mk.C[k].h;for(let i=0;i<a.length;i++)mx=Math.max(mx,Math.abs(b[i]/a[i]-1));}
 console.log('guardado: error máximo de precio',(mx*100).toFixed(4),'% · tamaño',Math.round(s.length/1024),'KB');}
