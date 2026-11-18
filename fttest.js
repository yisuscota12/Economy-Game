// Prueba de la v1.6c (fútbol): node fttest.js years=12 c=MEX pos=6 age=15
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,data_v16,engine_v16,data_v16b,engine_v16b,data_v16c,engine_v16c'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,fcStart,fcFans,fcFama,U,toInt,fmt,actCost,ftEnsure,ftTable,ftCN,ftNm,fbTrain,fbAccept,fbNego,fbNegoPct,fbClubOK,fbVal,fbRenew,fbTrial,fbTalk,fbBigStart,fbMoment,fbMomentOpts,fbPen,fbOf,FT_POS,FT_ROLE,DLG,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
const A=ctx.A;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||12),nid=args.c||'MEX';const out={errores:[],mundo:[],carrera:[],finales:[]};
A.G=A.newWorld('realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(x=>A.G.regions[x].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
A.P=A.newPlayer({first:'Prueba',surname:'Gol',sex:'M',r:rs[0],age:0});A.P.age=+(args.age||15);A.G.day=0;A.ensureV14();A.P.s.salud=85;
let t0=Date.now();A.ftEnsure();out.ms_crear=Date.now()-t0;const W=A.G.ft;out.clubes=Object.keys(W.C).length;out.estrellas=Object.keys(W.S).length;out.ligas=Object.values(W.L).map(L=>`${L.n} (${L.cl.length})`).join(' · ');
if(args.nojug!=='1'){const r=A.fcStart(A.P,'futbol');out.inicio=r.slice(0,260);if(args.pos){const fb=A.fbOf(A.P);fb.pos=+args.pos;}}
t0=Date.now();
for(let y=0;y<Y;y++){const fb=A.fbOf(A.P);let ft=120;const act=(t,fn)=>{const c=A.actCost(t);if(ft<c)return null;ft-=c;try{return fn();}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);}};
  if(fb){if(!fb.cl)act('⭐ Prueba',()=>A.fbTrial(A.P));for(let i=0;i<12;i++){const foc=fb.pos===0?[6,5,2][i%3]:[3,1,0,2,5,4][i%6];if(!act('⭐ Entrenar',()=>A.fbTrain(A.P,foc)))break;}}
  for(let m=0;m<12;m++){try{A.ensureClock();A.clockAdvance(30.4,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' '));y=Y;break;}
    const f2=A.fbOf(A.P);if(f2){if(f2.ren)A.fbRenew(A.P,true);if(f2.off.length){let b=-1,bv=0;f2.off.forEach((o,i)=>{const c=A.G.ft.C[o.cl];const v=c.r*1e6+o.sal+(o.role==='tit'?5e6:0);if(c.r>A.fbOf(A.P).ovr-6&&v>bv&&A.fbClubOK(A.P,o).ok){bv=v;b=i;}});if(b>=0&&(!f2.cl||A.G.ft.C[f2.off[b].cl].r>=(A.G.ft.C[f2.cl]?A.G.ft.C[f2.cl].r:0)+1||f2.role==='sup')){const r=A.fbAccept(A.P,b);out.carrera.push(A.G.year+' '+r.slice(0,110));}}
      if(f2.lastFinal&&!f2.lastFinal.seen){f2.lastFinal.seen=1;out.finales.push(`${A.G.year} ${f2.lastFinal.label}: ${A.ftCN(f2.lastFinal.r.w)||A.ftNm(f2.lastFinal.r.w)} ${f2.lastFinal.r.s}${f2.lastFinal.r.t||''}`);}}
    A.P.event=null;A.P.dlg=null;A.P.alive=true;A.P.prison=null;if(A.P.s.salud<40)A.P.s.salud=60;}
  const fb2=A.fbOf(A.P);if(fb2){const c=W.C[fb2.cl];out.carrera.push(`${A.G.year} ${A.P.age}a ${A.FT_POS[fb2.pos][0]} media ${fb2.ovr} (pot ${fb2.pt}) ${c?c.n+' r'+c.r:'sin club'} ${fb2.role} · temp ${fb2.sy.y}: ${fb2.sy.pj} PJ ${fb2.sy.g} G ${fb2.sy.a} A calif ${(fb2.sy.rt/Math.max(1,fb2.sy.pj)).toFixed(2)} · sel ${fb2.nt.caps}/${fb2.nt.g} · valor US$${(A.fbVal(A.P)/1e6).toFixed(1)}M · sueldo ${fb2.con?(fb2.con.sal/1e3).toFixed(0)+'k':'-'} · fans ${Math.round(A.fcFans(A.P.fc)).toLocaleString()} · trofeos ${fb2.tro.length}`);}}
out.ms_sim=Date.now()-t0;
const H=W.hist;for(const lid of ['GBR1','ESP1','MEX1','BRA1']){const h=H.lg[lid]||[];out.mundo.push(lid+': '+h.map(x=>x.y+(x.t?x.t[0]:'')+' '+A.ftCN(x.c)).join(', '));}
out.mundo.push('UEFA: '+(H.cont.UEFA||[]).map(x=>x.y+' '+A.ftCN(x.c)+' '+x.s).join(', '));out.mundo.push('AME: '+(H.cont.AME||[]).map(x=>x.y+' '+A.ftCN(x.c)).join(', '));
out.mundo.push('Mundial: '+H.wc.map(x=>`${x.y} ${A.ftNm(x.c)} ${x.s} ${A.ftNm(x.ru)} (sede ${x.host.map(A.ftNm).join('/')})`).join(' | '));out.mundo.push('Continentales: '+Object.entries(H.ct).map(([k,v])=>k+': '+v.map(x=>x.y+' '+A.ftNm(x.c)).join(',')).join(' | '));
out.mundo.push('Balón Dorado: '+H.bd.map(x=>x.y+' '+x.top[0][0]+(x.top[0][3]?'(TÚ)':'')).join(', '));out.mundo.push('Mundial de Clubes: '+H.cwc.map(x=>x.y+' '+A.ftCN(x.c)).join(', '));
const L=W.L.GBR1;out.tabla=A.ftTable(L).slice(0,5).map(c=>A.ftCN(c)+' '+L.tb[c].join(','));
// goles por partido y localía en 2 temporadas
let g=0,n=0,dr=0;for(const lid in W.L){const L2=W.L[lid];for(const c in L2.tb){const t=L2.tb[c];g+=t[4];n+=t[0];dr+=t[2];}}out.partidos={goles_por_partido:(2*g/Math.max(1,n)).toFixed(2),empates:(dr/Math.max(1,n)*100).toFixed(0)+'%'};
out.tamano_KB=Math.round(JSON.stringify(W).length/1024);out.ev=W.ev.slice(-5).map(e=>e.y+' '+e.t);out.dialogos=A.DLG.filter(d=>/^fb_/.test(d.id)).length;
console.log(JSON.stringify(out,null,1));
