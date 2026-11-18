// Prueba de la v1.6b (box y MMA): node cbtest.js years=14 k=box sex=M c=MEX
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,data_v16,engine_v16,data_v16b,engine_v16b,data_v17r,engine_v17r'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,fcStart,fcFans,fcFama,fcTier,FTIT,actCost,U,toInt,fmt,cbTrain,cbSpar,cbAmFight,cbTourney,cbAmReq,cbGoPro,cbSignProm,cbSeek,cbAccept,cbNego,cbNegoPct,cbSetup,cbRound,cbFinish,cbCards,cbTotals,cbRank,cbBelts,cbPos,cbF,cbMV,cbSetGym,cbGymReq,cbPress,cbWeigh,cbAutoFight,cbRec,cbDivN,CB_AMT,CB_ORG,CB_LG,CB_DIVS,CB_AT,DLG,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||14),nid=args.c||'MEX',k=args.k||'box',sx=args.sex||'M';const out={errores:[],trayectoria:[],peleas:[],mundo:{}};
A.G=A.newWorld('realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(x=>A.G.regions[x].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
A.P=A.newPlayer({first:'Prueba',surname:'Golpes',sex:sx,r:rs[2],age:0});A.P.age=+(args.age||15);A.G.day=0;A.ensureV14();A.P.s.salud=85;A.P.dinero=A.U(A.P)*3;A.P.fc&&0;
const t0=Date.now();const msg=A.fcStart(A.P,k);const f=A.P.fc,c=f.cb;out.inicio=msg.slice(0,200);
let fights=0;
for(let y=0;y<Y;y++){let ft=120;const act=(t,fn)=>{const cst=A.actCost(t);if(ft<cst)return null;ft-=cst;A.P.ft=Math.max(0,(A.P.ft||0));try{return fn();}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);return null;}};
  // gimnasio: sube de nivel cuando puede pagarlo
  for(let g=4;g>c.gym;g--){if(!A.cbGymReq(A.P,c.gyms[g])&&A.P.dinero>A.U(A.P)*4){A.cbSetGym(A.P,g);break;}}
  if(!c.pro){for(let t=0;t<A.CB_AMT[k].length;t++)if(!A.cbAmReq(A.P,t)){const r=act('⭐ Torneo',()=>A.cbTourney(A.P,t));if(r&&/Medalla/.test(r))out.trayectoria.push(`${A.G.year} ${r.split('\n').pop()} ${r.split(':')[0]}`);}
    if(A.P.age>=19&&(c.am.w>=12||A.P.age>=20))out.trayectoria.push(A.G.year+' '+A.cbGoPro(A.P).slice(0,60));}
  if(c.pro&&c.po&&c.po.length){const best=c.po.reduce((b,o,i)=>o.t<c.po[b].t?i:b,0);out.trayectoria.push(A.G.year+' '+A.cbSignProm(A.P,best).slice(0,90));}
  for(let i=0;i<30&&ft>0;i++){const foc=[0,1,2,3,5,6,7][i%(k==='mma'?7:5)];if(!act('⭐ Entrenar',()=>A.cbTrain(A.P,foc)))break;if(i%3===2)act('⭐ Sparring',()=>A.cbSpar(A.P));if(!c.pro&&i%2===0)act('⭐ Pelea amateur',()=>A.cbAmFight(A.P));
    if(c.pro&&!c.fight){if(!c.offers.length)act('⭐ Buscar pelea',()=>A.cbSeek(A.P));if(c.offers.length){const j=0;const pct=A.cbNegoPct(A.P,j,1);if(pct>55){const r=A.cbNego(A.P,j,1);if(r.t&&/❌/.test(r.t))continue;}if(c.offers[0]){A.P.ft=ft;const r=A.cbAccept(A.P,0);ft=A.P.ft;}}}}
  for(let m=0;m<12;m++){A.ensureClock();if(c.pro&&!c.fight&&c.offers.length&&!A.cbAmReq){}if(c.pro&&!c.fight&&c.offers.length){A.P.ft=Math.max(A.P.ft||0,30);A.cbAccept(A.P,0);}const before=c.hist.length;try{A.P.ft=Math.max(A.P.ft,0);A.clockAdvance(30.4,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' '));y=Y;break;}
    if(c.hist.length>before){fights++;const h=c.hist[c.hist.length-1];if(out.peleas.length<60)out.peleas.push(`${A.G.year} ${h.r} vs ${h.o} (${h.oc}) ${h.m} r${h.rd} ${h.t} US$${Math.round(h.$/1e3)}k`);}
    A.P.event=null;A.P.dlg=null;A.P.alive=true;A.P.prison=null;if(A.P.s.salud<40)A.P.s.salud=60;}
  const W=A.G.cb;out.trayectoria.push(`${A.G.year} ${A.P.age}a niv ${f.sk.toFixed(0)} [${c.at.map(v=>Math.round(v)).join(',')}] ${c.pro?`pro ${c.w}-${c.l}-${c.dr} (${c.ko} KO) elo ${c.e} #${f.rk}`:`amateur ${c.am.w}-${c.am.l}`} cint ${A.cbBelts('P').map(b=>b).join('/')||'-'} fans ${Math.round(A.fcFans(f)).toLocaleString()} fama ${A.fcFama(f)} ingreso ${(f.earnY/A.toInt(1,'USD')/1e3).toFixed(0)}k US$ dmg ${c.dmg.toFixed(1)} gym ${c.gym} ${c.prom?c.prom.nm:''}`);}
const W=A.G.cb;out.mundo={peleadores:Object.keys(W.F).length,jornaleros:Object.values(W.F).filter(x=>x.jm).length,campeones:Object.keys(W.ch).length,eventos:W.ev.slice(-6).map(e=>e.y+' '+e.t),tamaño_KB:Math.round(JSON.stringify(W).length/1024),ms:Date.now()-t0};
const d=c.d;out.mundo.ranking=A.cbRank(d,-1).slice(0,10).map(id=>{const x=A.cbF(id);return `${x.n} ${x.c} ${A.cbRec(x)} e${x.e} r${Math.round(x.r)}`;});
// prueba de una pelea por rounds completa
try{if(!c.fight){c.pro=true;A.cbSeek(A.P);if(c.offers.length)A.cbAccept(A.P,0);}if(c.fight){A.cbPress(A.P,2);A.cbWeigh(A.P);const S=A.cbSetup(A.P);while(!S.end)A.cbRound(S,S.rd%3===1?(k==='box'?'pres':'derr'):'sigue');const T=A.cbTotals(S);
  out.pelea_detalle={fin:S.end,tarjetas:A.cbCards(S),golpes:T.map(t=>`${t.ln}/${t.th} kd${t.kd} td${t.td}/${t.tda} ctl${t.ctl}`),rounds:S.tx.slice(0,3).map(x=>x.r+': '+x.l.join(' | '))};const r=A.cbFinish(A.P,S);out.pelea_detalle.pago={bruto:Math.round(r.gross),neto:Math.round(r.net),susp:r.susp,card:r.card.slice(0,2)};}}catch(e){out.errores.push('pelea: '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' '));}
// estadística de métodos en 300 peleas simuladas por rounds entre peleadores del mundo
try{const ids=Object.keys(W.F).filter(i=>!W.F[i].jm);const M={};let rds=0;for(let i=0;i<300;i++){const a=W.F[ids[i%ids.length]],b=W.F[ids[(i*7+3)%ids.length]];if(a===b)continue;
  const S={sp:W.sp,f:[ctx.cbSide?0:0],rd:0};const s=vm.runInContext(`(function(a,b){const S={sp:G.cb.sp,f:[cbSide(a,'X'),cbSide(b,'X')],rd:0,mx:G.cb.sp==='box'?12:3,j:cbJudges('X'),sc:[[],[],[]],st:[],tx:[],end:null,t:[],cut:0};cbSimAll(S);return S.end;})`,ctx)(a,b);M[s.m]=(M[s.m]||0)+1;rds+=s.rd;}
  out.metodos=M;out.rounds_prom=(rds/300).toFixed(1);}catch(e){out.errores.push('metodos: '+e.message+' '+(e.stack||'').split('\n')[1]);}
out.dialogos=A.DLG.filter(d=>/^cb_/.test(d.id)).length;
console.log(JSON.stringify(out,null,1));
