// Prueba de la v1.7r (etapa C: box y MMA a fondo): node cb17test.js years=14 k=box c=MEX age=15 [neg=1]
// Carrera con bloques de entrenamiento, sesiones especiales, escuelas y estilos; amateur completo; y, con neg=1, gimnasio y promotora propios.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,data_v16,engine_v16,data_v16b,engine_v16b,data_v17r,engine_v17r'.split(',');
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);
const X=ctx.X;const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||14),nid=args.c||'MEX',k=args.k||'box',neg=+(args.neg||0);
const out={errores:[],linea:[],amateur:{},escuela:{},negocios:[]};const E=(t,f)=>{try{return f();}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);return null;}};
X(`G=newWorld('realista');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='${nid}').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
X(`P=newPlayer({first:'Prueba',surname:'Golpes',sex:'M',r:'${rs[2]}',age:0});P.age=${+(args.age||15)};G.day=0;ensureV14();P.s.salud=85;P.dinero=U(P)*3;fcStart(P,'${k}');`);
const c=X('P.fc.cb');let inj=0,fatS=0,fatN=0,blk=0,ses=0;
for(let y=0;y<Y;y++){let ft=120;const act=(t,fn)=>{const cst=X('actCost')(t);if(ft<cst)return null;ft-=cst;return E(t,fn);};
  for(let g=c.gyms.length-1;g>c.gym;g--){if(!X('cbGymReq')(X('P'),c.gyms[g])&&X('P.dinero')>X('cbGymCost')(X('P'),c.gyms[g])*3+X('U(P)')*2){X('cbSetGym')(X('P'),g);break;}}
  if(!c.pro){const T=X('CB_AMT')[k];for(let t=0;t<T.length;t++)if(!X('cbAmReq')(X('P'),t))act('⭐ Torneo',()=>X('cbTourney')(X('P'),t));
    if(X('P.age')>=19&&(c.am.w>=12||X('P.age')>=20))out.linea.push(X('G.year')+' '+X('cbGoPro')(X('P')).slice(0,50));}
  if(c.pro&&c.po&&c.po.length){const best=c.po.reduce((b,o,i)=>o.t<c.po[b].t?i:b,0);X('cbSignProm')(X('P'),best);}
  for(let i=0;i<14&&ft>0;i++){if(X('P.fc.inj'))break;
    if(c.fat>60){act('⭐ Bloque',()=>X('cbBlock')(X('P'),X('CB_BLK')[k].length-1,1));blk++;continue;}
    const L=X('CB_BLK')[k];const j=c.fight?(c.fight.cp&&c.fight.cp.s?L.length-2:L.findIndex(b=>b[6]==='s')):i%(L.length-2);const r=args.pol==='train'?act('⭐ Entrenar',()=>X('cbTrain')(X('P'),[0,1,2,3,5,6,7][i%(k==='mma'?7:5)])):act('⭐ Bloque',()=>X('cbBlock')(X('P'),j,i%5===4?2:1));if(r){blk++;if(/lesionas/.test(r))inj++;}
    fatS+=c.fat;fatN++;
    if(c.fight&&!c.fight.vid&&!X('cbSesReq')(X('P'),'vid')){act('⭐ Sesión: Análisis de video del rival',()=>X('cbSession')(X('P'),'vid'));ses++;}
    if(!X('cbSesReq')(X('P'),'ley')&&X('P.dinero')>X('U(P)')*2){act('⭐ Sesión: Clínica con una leyenda de tu escuela',()=>X('cbSession')(X('P'),'ley'));ses++;}
    if(!c.pro&&i%2===0)act('⭐ Pelea amateur',()=>X('cbAmFight')(X('P')));
    if(c.pro&&!c.fight){if(!c.offers.length)act('⭐ Buscar pelea',()=>X('cbSeek')(X('P')));if(c.offers[0]){X('P').ft=ft;E('accept',()=>X('cbAccept')(X('P'),0));ft=X('P.ft');}}}
  // estilo: adopta el de mayor afinidad si llega a 60
  const sa=c.sa;let bj=c.st;sa.forEach((v,j)=>{if(v>sa[bj]+8)bj=j;});if(bj!==c.st&&!X('cbStyleReq')(X('P'),bj))out.linea.push(X('G.year')+' '+X('cbAdoptStyle')(X('P'),bj).slice(0,70));
  if(neg){const p=X('P');if(!p.cbo||!p.cbo.g){if(p.dinero>X('U(P)')*4)out.negocios.push(X('G.year')+' '+E('og',()=>X('cbOGOpen')(p,0,null)));}
    if(p.cbo&&p.cbo.g){const g=p.cbo.g;while(g.co.length<X('CB_OG')[g.t][5]&&g.cand.length)E('hire',()=>X('cbOGHire')(p,0));if(g.F.length<3){E('scout',()=>X('cbOGScout')(p));for(const id of g.sc.slice())E('sign',()=>X('cbOGSign')(p,id));}
      if(y===3)c.og=1;}
    if(y>=4&&(!p.cbo||!p.cbo.pr)&&p.dinero>X('U(P)')*6)out.negocios.push(X('G.year')+' '+E('op',()=>X('cbOPOpen')(p)));
    if(p.cbo&&p.cbo.pr){const pr=p.cbo.pr;pr.auto=1;const C=X('cbOPCands')(p);for(const f of C.slice(0,4)){if(pr.F.length>=4)break;E('opsign',()=>X('cbOPSign')(p,f.i));}if(pr.ty!==X('G.year'))E('tv',()=>X('cbOPTV')(p));}}
  for(let m=0;m<12;m++){X('ensureClock()');if(c.pro&&!c.fight&&c.offers.length){X('P').ft=Math.max(X('P.ft')||0,30);E('acc',()=>X('cbAccept')(X('P'),0));}
    E('mes',()=>X('clockAdvance')(30.4,{}));X('P.event=null;P.dlg=null;P.alive=true;P.prison=null;if(P.s.salud<40)P.s.salud=60;');}
  const f=X('P.fc');out.linea.push(`${X('G.year')} ${X('P.age')}a niv ${f.sk.toFixed(0)} [${c.at.map(v=>Math.round(v)).join(',')}] ${c.pro?`pro ${c.w}-${c.l}-${c.dr} #${f.rk}`:`am ${c.am.w}-${c.am.l} pts ${c.am.pt} rk ${X('cbAmRank')(c)}${X('cbSelOn')(c)?' SEL':''}`} fat ${Math.round(c.fat)} esc ${JSON.stringify(c.sm)} estilo ${c.st} afin [${c.sa.map(Math.round)}] $ ${Math.round(X('P.dinero')/X('U(P)')*10)/10}×U`);
  if(neg&&X('P.cbo')){const p=X('P');const g=p.cbo.g,pr=p.cbo.pr;if(g){const h=g.h.slice(-12);out.negocios.push(`${X('G.year')} gym t${g.t} socios ${g.mem} rep ${g.rep} entren ${g.co.length} peleadores ${g.F.length} neto12m ${Math.round(h.reduce((s,x)=>s+x[2]-x[3],0)/X('U(P)')*100)/100}×U`);}
    if(pr){out.negocios.push(`${X('G.year')} prom lv${pr.lv} tv${pr.tv} rep ${pr.rep} peleadores ${pr.F.length} funciones ${pr.h.length} últimas ${pr.h.slice(-3).map(e=>Math.round(e.net/1000)+'k$ asist '+e.att).join(' | ')}`);}}}
out.amateur={record:`${c.am.w}-${c.am.l}`,h:c.am.h.length,medallas:c.am.md.map(m=>m.y+' '+m.m+' '+m.t),beca:Math.round(c.am.bec)};
out.carrera=c.cs;out.bloques=blk;out.sesiones=ses;out.lesiones_bloque=inj;out.fatiga_prom=Math.round(fatS/Math.max(1,fatN));out.peleas=c.hist.slice(-8).map(h=>`${h.y} ${h.r} ${h.o} ${h.m} US$${Math.round(h.$)}`);
out.guardado_KB={cb:Math.round(JSON.stringify(c).length/1024*10)/10,cbo:X('P.cbo')?Math.round(JSON.stringify(X('P.cbo')).length/1024*10)/10:0};
console.log(JSON.stringify(out,null,1));
