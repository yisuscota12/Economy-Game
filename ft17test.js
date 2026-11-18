// Prueba de la v1.7s (etapa D: fútbol mánager): node ft17test.js years=10 c=MEX [own=compra|funda] [club=GBR1] [jug=1] [base=1]
// Mundo con DT y estilos, mercado de fichajes y valores; con own=compra el jugador compra un club (o lo funda con own=funda) y lo maneja con una política simple.
// base=1 corre el mundo sin los módulos de la v1.7s (para comparar goles y empates).
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
let files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);if(args.base==='1')files=files.filter(f=>!/v17s/.test(f));
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);
const X=ctx.X;const Y=+(args.years||10),nid=args.c||'MEX',own=args.own||'';const out={errores:[],mundo:{},dueno:[],linea:[]};const E=(t,f)=>{try{return f();}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);return null;}};
X(`G=newWorld('realista');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='${nid}').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
X(`P=newPlayer({first:'Prueba',surname:'Dueño',sex:'M',r:'${rs[0]}',age:0});P.age=${args.jug?15:35};G.day=0;ensureV14();P.s.salud=85;P.s.inteligencia=70;`);
X(`ftEnsure()`);if(args.jug)X(`fcStart(P,'futbol')`);
const v17=!!X('typeof ftcMonth==="function"');
if(v17&&own){X(`P.dinero=toInt(${args.money||5e9},'USD')`);
  if(own==='compra'){const lid=args.club||'GBR1';const r=E('compra',()=>X(`(()=>{const L=G.ft.L['${lid}'];const T=L.cl.slice().sort((a,b)=>G.ft.C[a].r-G.ft.C[b].r);return ftcBuy(P,T[${+(args.idx||Math.floor(10))}]);})()`));out.dueno.push(r);}
  else{const r=E('funda',()=>X(`ftcFound(P,'Club Prueba F. C.',['#c8102e','#ffffff'])`));out.dueno.push(r);}}
let g0=0;const t0=Date.now();
for(let y=0;y<Y;y++){for(let m=0;m<12;m++){E('mes',()=>{X('ensureClock();clockAdvance(30.4,{})');});X('P.event=null;P.dlg=null;P.alive=true;P.prison=null;if(P.s.salud<40)P.s.salud=60;');
    if(v17&&own&&X('!!P.ftc'))E('política',()=>X(`(()=>{const o=P.ftc,W=G.ft,c=W.C[o.c];const L=W.L[c.l];
      if(o.caja<0)ftcInject(P,-o.caja+2e6);
      // obras para la licencia y mejoras
      if(!o.pm&&!o.bd){const LL=L||ftcLowest(c.c);const need=LL?ftcLicMin(LL):0;if(c.st<need){const i=c.st+5000>=need?1:c.st+10000>=need?2:3;const k=ftcStCost(c,FTC_STX[i][0])*1.02;if(o.caja<k)ftcInject(P,k-o.caja);ftcBuild(P,'st',i);}else if(o.cen<1){const k=FTC_CEN[1][1]*1e6;if(o.caja<k)ftcInject(P,k-o.caja);ftcBuild(P,'cen');}else if(o.cen<3&&o.caja>ftcRev(c).t*.5)ftcBuild(P,'cen');}
      if(o.aca<2&&o.caja>ftcRev(c).t*.4)ftcBuild(P,'aca');
      if(!c.l&&LL0()&&LL0().t===1&&!o.fran){const f=ftcFranCost(c);if(o.caja<f)ftcInject(P,f-o.caja);ftcFran(P);}
      function LL0(){return ftcLowest(c.c);}
      if(${args.wk!=null?+args.wk:-1}>=0)o.wk=${args.wk!=null?+args.wk:-1};
      // fichajes en la ventana: una figura si alcanza
      if(ftWinOpen()&&o.caja>ftcRev(c).t*.3){const L2=ftcMktList(c,'al').filter(s=>s.r>=c.r+2&&ftcFee(s,c)<o.caja*.5);if(L2.length&&Math.random()<.3)ftcBuyStar(P,L2[0].i);}
      while(o.bids.length)ftcBidAns(0,o.bids[0].fee>ftSV(G.ft.S[o.bids[0].s])*1.1);
      return 1;})()`));}
  if(v17&&own&&X('!!P.ftc'))out.dueno.push(X(`(()=>{const o=P.ftc,W=G.ft,c=W.C[o.c];const L=W.L[c.l];const h=o.h.slice(-12);const s=k=>Math.round(h.reduce((a,x)=>a+x[k],0)/1e6);
     return \`\${G.year} \${c.n} \${L?L.n:'regional'} pos \${L?ftPosIdx(c)+1:'-'} r\${c.r} DT \${(W.D[c.dt]||{}).n} (\${ftCSty(c)}) · caja \${Math.round(o.caja/1e6)}M · 12m: ingresos \${s(2)}M (boletos \${s(4)}, tv \${s(5)}, com \${s(6)}, premios \${s(7)}, ventas \${s(8)}) gastos \${s(3)}M (sueldos \${s(9)}, op \${s(10)}, compras \${s(11)}) · estadio \${c.st} asist \${o.att} · ánimo \${Math.round(o.mood)} · cen \${o.cen} aca \${o.aca} · figuras \${ftStarsOf(c.i).length} · valor \${Math.round(ftcVal(c)/1e6)}M · obj \${(o.obh.slice(-1)[0]||{}).k||'-'}:\${(o.obh.slice(-1)[0]||{}).ok}\`;})()`));
  if(args.jug&&X('!!fbOf(P)'))out.linea.push(X(`(()=>{const fb=fbOf(P);const c=G.ft.C[fb.cl];return \`\${G.year} \${P.age}a media \${fb.ovr} \${c?c.n+' r'+c.r:''} \${fb.role}\`+(typeof fbFitV==='function'?\` encaje \${fbFitV(P)} DT \${c&&G.ft.D[c.dt]?G.ft.D[c.dt].n+' '+ftCSty(c):''}\`:'');})()`));}
out.ms=Date.now()-t0;if(own)out.registro=X(`P.log.filter(l=>/[📋⏳🎉🏗️🏟️🏋️🌱📨⚖️🎯✅❌💸⚠️📉🏆]/u.test(l.t)).slice(-30).map(l=>l.y+' '+l.t)`);const W=X('G.ft');
let g=0,n=0,dr=0;for(const lid in W.L){const L2=W.L[lid];for(const c in L2.tb){const t=L2.tb[c];g+=t[4];n+=t[0];dr+=t[2];}}out.mundo.partidos={goles:(2*g/Math.max(1,n)).toFixed(2),empates:(dr/Math.max(1,n)*100).toFixed(1)+'%',n};
if(v17){const DT=Object.values(W.D);out.mundo.dt={total:DT.length,libres:DT.filter(d=>!d.cl).length,estilos:DT.filter(d=>d.cl).reduce((a,d)=>(a[d.s]=(a[d.s]||0)+1,a),{})};
  out.mundo.modelos=Object.values(W.C).reduce((a,c)=>(a[c.mo]=(a[c.mo]||0)+1,a),{});out.mundo.fichajes=W.mk.length;out.mundo.ult=W.mk.slice(-8).map(x=>`${x[0]}/${x[1]+1} ${x[2]} r${x[6]} ${x[10]}→${x[11]} ${x[9]}M`);
  out.mundo.destituciones=W.ev.filter(e=>/destituye|no renueva|deja .* y se convierte/.test(e.t)).length+' (en las últimas 80 noticias)';out.mundo.noticias=W.ev.filter(e=>/destituye|no renueva|se convierte|retiro de su entrenador/.test(e.t)).slice(-4).map(e=>e.y+' '+e.t);
  // valores por liga
  out.mundo.ligas=X(`Object.values(G.ft.L).filter(L=>L.t===1||L.c==='GBR').map(L=>{const cs=L.cl.map(x=>G.ft.C[x]);const rv=cs.map(c=>ftcRev(c).t);const vs=cs.map(c=>ftcVal(c));const S=Object.values(G.ft.S).filter(s=>L.cl.includes(s.cl));return L.i+' ingresos '+Math.round(Math.min(...rv)/1e6)+'-'+Math.round(Math.max(...rv)/1e6)+'M valor '+Math.round(Math.min(...vs)/1e6)+'-'+Math.round(Math.max(...vs)/1e6)+'M · figura máx '+(S.length?Math.round(Math.max(...S.map(ftSV))/1e6):0)+'M sueldo máx '+(S.length?(Math.max(...S.map(s=>ftSW(s)))/1e6).toFixed(1):0)+'M'})`);
  // efecto del estilo: puntos por partido de cada estilo en primera división
  const st={};for(const L of Object.values(W.L)){if(L.t!==1)continue;for(const cid in L.tb){const c=W.C[cid];const d=W.D[c.dt];if(!d)continue;const t=L.tb[cid];const e=st[d.s]=st[d.s]||[0,0];e[0]+=t[6];e[1]+=t[0];}}out.mundo.ppp_estilo=Object.fromEntries(Object.entries(st).map(([k,v])=>[k,(v[0]/Math.max(1,v[1])).toFixed(2)]));}
out.tamano_KB=Math.round(JSON.stringify(W).length/1024);out.ptamano_KB=Math.round(JSON.stringify(X('P')).length/1024);
console.log(JSON.stringify(out,null,1));
