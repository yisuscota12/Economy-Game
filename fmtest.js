// Prueba de la v1.6d (resto de las carreras de fama): node fmtest.js years=12 c=MEX k=musica,chef age=17
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,data_v16,engine_v16,data_v16b,engine_v16b,data_v16c,engine_v16c,data_v16d,engine_v16d,engine_v17a,engine_v17b'.split(',');
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||12),nid=args.c||'MEX';
function run(k){const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
 vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,fcStart,fcFans,fcFama,fcTier,FTIT,U,toInt,fmt,actCost,FM,FM_TOUR,fmOf,fmW,fmTrain,fmProjStart,fmProjWork,fmRelease,fmPromoCost,fmBudOK,fmOffersGen,fmNego,fmNegoPct,fmSign,fmGig,fmGigCan,fmTourStart,fmTourCan,fmMeet,fmFeud,fmGigStart,fmGigMoment,fmGigOpts,fmCo,loanMax,bankList,DLG,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
 const A=ctx.A;const out={k,errores:[],carrera:[],notas:[]};
 A.G=A.newWorld('realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(x=>A.G.regions[x].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
 A.P=A.newPlayer({first:'Prueba',surname:'Fama',sex:'M',r:rs[0],age:0});A.P.age=+(args.age||17);A.G.day=0;A.ensureV14();A.P.s.salud=85;A.P.s.inteligencia=70;A.P.s.apariencia=70;
 let t0=Date.now();out.inicio=A.fcStart(A.P,k).slice(0,200);out.ms_crear=Date.now()-t0;const Dk=A.FM[k];const W=A.fmW(k);out.mundo=`${Object.keys(W.A).length} ${Dk.ent[1].toLowerCase()}, ${Object.keys(W.C).length} compañías, ${W.K.length} obras en lista`;
 const P=()=>A.P,fm=()=>A.fmOf(A.P);t0=Date.now();
 for(let y=0;y<Y;y++){let ft=A.P.job?120:240;const act=(t,fn)=>{const c=A.actCost(t);if(ft<c)return null;ft-=c;try{const r=fn();return r==null?true:r;}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);return null;}};
  if(y>=1&&A.P.fc.coach<2&&A.P.dinero>A.U(A.P))A.P.fc.coach=2;if(A.fcTier(A.P.fc)>=1&&A.P.fc.ag<1)A.P.fc.ag=1;if(A.fcTier(A.P.fc)>=3)A.P.fc.ag=2;
  for(let i=0;i<3;i++)act('⭐ Practicar',()=>A.fmTrain(A.P,(y+i)%5));
  for(let m=0;m<12;m++){const F=fm();
   if(F&&m%3===0&&!F.proj){const wi=m===0?1:0;let bl=2;while(bl>0&&!A.fmBudOK(A.P,wi,bl).ok)bl--;if(A.fmBudOK(A.P,wi,bl).ok||Dk.aud){const r=act(Dk.aud?'⭐ Audición':'⭐ Proyecto',()=>A.fmProjStart(A.P,wi,bl));if(y<2&&r&&r.t)out.notas.push(r.t.slice(0,150));}}
   if(F&&F.proj){while(F.proj.n<Dk.wk[F.proj.wi][2]&&act('⭐ Sesión',()=>A.fmProjWork(A.P)));if(F.proj.n>=Dk.wk[F.proj.wi][2]){let pr=2;while(pr>0&&A.fmPromoCost(A.P,pr)>A.P.dinero*.3)pr--;const r=act('⭐ Lanzar',()=>A.fmRelease(A.P,pr));if(r&&y<3)out.notas.push(String(r).slice(0,230));}}
   if(F&&m%4===2&&!F.tour){for(let v=3;v>=0;v--)if(!A.fmGigCan(A.P,v)){act('⭐ Presentación '+v,()=>A.fmGig(A.P,v));break;}}
   if(F&&m===5&&!F.tour){for(let sc=3;sc>=0;sc--)if(!A.fmTourCan(A.P,sc)){const r=act('⭐ Gira '+sc,()=>A.fmTourStart(A.P,sc));if(r)out.notas.push(A.G.year+' '+String(r).slice(0,120));break;}}
   if(F&&F.off.length){if(A.fmNegoPct(A.P,0,1)>45)A.fmNego(A.P,0,1);if(F.off.length){const r=A.fmSign(A.P,0);out.notas.push(A.G.year+' '+r.slice(0,160));}}
   try{A.ensureClock();A.clockAdvance(30.4,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' '));y=Y;break;}
   A.P.event=null;A.P.dlg=null;A.P.alive=true;A.P.prison=null;if(A.P.s.salud<45)A.P.s.salud=65;if(!A.P.fc){out.errores.push('sin carrera');y=Y;break;}}
  const F=fm();if(!F)break;const f=A.P.fc;const c=A.fmCo(A.P);
  out.carrera.push(`${A.G.year} ${A.P.age}a nivel ${f.sk.toFixed(1)} · ${A.FTIT[A.fcTier(f)]} fama ${A.fcFama(f)} · fans ${Math.round(f.fans.loc).toLocaleString()}/${Math.round(f.fans.nac).toLocaleString()}/${Math.round(f.fans.int).toLocaleString()} · puesto #${F.rk} · ingreso US$${Math.round(f.earnY||0).toLocaleString()} · obras ${F.st8.w} (top10 ${F.st8.t10}, n.º1 ${F.st8.n1}) · shows ${F.st8.sh} · nom ${F.st8.nom} premios ${f.aw.length} · ${c?c.n+' (falta recuperar '+Math.round(F.co.rec)+')':'independiente'}${Dk.stars?' · estrellas '+F.stars:''} · dinero ${A.fmt(A.P.dinero)}`);}
 out.ms_sim=Date.now()-t0;const F=fm();
 if(F){out.catalogo=F.cat.slice(-4).map(w=>`${w.y} «${w.t}» ${Dk.wk[w.ty][1]} q${w.q} crít ${w.cr} púb ${w.pu} pico #${w.pk} total ${Math.round(w.tot).toLocaleString()} ${Dk.unit[0]} · te dejó US$${Math.round(w.rv).toLocaleString()}`);
  out.premios=A.P.fc.aw.map(a=>a.y+' '+a.t).slice(-8);out.ultimaGira=F.lastTour?`${A.FM_TOUR[F.lastTour.sc][0]} ${F.lastTour.n} fechas, ${F.lastTour.att.toLocaleString()} asistentes, US$${Math.round(F.lastTour.tot).toLocaleString()}`:'—';
  // presentación con decisiones
  A.fmGigStart(A.P,0);const O=A.fmGigOpts(A.P);out.momento=O.t+' → '+O.o.map(o=>`${o[0]} (${Math.round(o[1]*100)} %)`).join(' | ');let k2=0;while(F.gig&&!F.gig.end&&k2++<6)A.fmGigMoment(A.P,k2%3);out.show=F.gig.end?`${F.gig.end.rv}, ${F.gig.end.att} asistentes`:'?';F.gig=null;
  const a0=Object.values(W.A)[3];const r=A.fmMeet(A.P,a0.i);out.convivir=r.t.slice(0,90);out.prestamo=A.fmt(A.loanMax(A.P,A.bankList(A.P)[2]));}
 const W2=A.fmW(k);out.lista=W2.top.slice(0,5).map((t,i)=>`${i+1}. «${t[0]}» ${t[1]} ${Math.round(t[3]).toLocaleString()}`);out.ranking=W2.rk.slice(0,5).map(id=>id==='me'?'TÚ':W2.A[id].n+' '+Math.round(W2.A[id].F/1e6)+'M');
 out.premiosMundo=W2.hist.aw.slice(-2).map(h=>h.y+': '+h.c.map(c=>c[0]+' → '+c[1]+(c[3]?' (TÚ)':'')).join('; '));out.noticias=W2.ev.slice(-3).map(e=>e.y+' '+e.t);out.tamano_KB=Math.round(JSON.stringify(A.G.fm).length/1024)+' mundo + '+Math.round(JSON.stringify(A.P.fc).length/1024)+' carrera';
 out.mundoFinal='nivel>80: '+Object.values(W2.A).filter(a=>a.sk>80).length+' · >65: '+Object.values(W2.A).filter(a=>a.sk>65).length+' · edad media '+Math.round(Object.values(W2.A).reduce((s,a)=>s+a.g,0)/Object.keys(W2.A).length);out.dialogos=A.DLG.filter(d=>/^fm_/.test(d.id)).length;return out;}
for(const k of (args.k||'musica').split(','))console.log(JSON.stringify(run(k),null,1));
