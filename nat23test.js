// Prueba de la v2.3a (naturaleza y recursos, parte 1): node nat23test.js [years=10] [seeds=1,2,3,4] [c=MEX] [mode=realista] [base=1]
// Modelo (biomas, agua, alimentos, ecosistema, escasez de recursos), rango de los medidores, tiempo y BALANCE contra la versión sin la
// v2.3a (base=1 quita engine_v23a.js): PIB mundial, crecimiento, recesiones y crisis bancarias nuevas, salud de los sectores
// (Consumo básico, Servicios públicos, Industria y la media ponderada por empleo, que es lo que decide despidos y contrataciones en la
// v2.1c), felicidad mundial y personas desempleadas en la red del jugador. Sin base=1 corre las dos y muestra la diferencia.
// v2.3b: quita=v23b compara la v2.3a contra la v2.3a + v2.3b (por omisión quita=v23 quita las dos); muestra también proyectos de agua y
// alimentos terminados en el mundo y especies en riesgo.
// v2.3c: quita=v23c compara la v2.3b contra la v2.3c (conservación, contaminación, sequía en granjas, avance); quita=zzzz no quita nada
// (las dos corridas son la versión actual: sirve para medir el ruido A/A). Muestra también la contaminación de empresas.
// v2.4a: quita=v24a compara la v2.3c contra la v2.4a (logística); muestra flujos por modo, el término «nlog» en Comercio minorista y la eficiencia de los transportistas.
// v2.4c: quita=v24c compara la v2.4a/b contra la v2.4c (red aérea, empresas estatales, turismo, bolsa según el PIB); muestra aeropuertos y rutas, estatales de la
//        IA, términos «naer» y «est» visibles, empresas que cotizan y llegadas de turistas.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
const QUITA=new RegExp(args.quita||'v23');   // v2.3b: quita=v23b compara contra la v2.3a (sin quita: contra la versión sin naturaleza)
const Y=+(args.years||10),nid=args.c||'MEX',mode=args.mode||'realista';const seeds=(args.seeds||'1,2,3,4').split(',').map(Number);
const all=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);
const DATA={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json'))};
function run(seed,withNat){const files=withNat?all:all.filter(f=>!QUITA.test(f));
  const ctx=Object.assign({},DATA,{console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite,Float32Array,Float64Array,Int16Array,Int32Array,Uint8Array,Date});
  vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);const X=ctx.X;
  let s0=seed;ctx.Math=Object.create(Math);ctx.Math.random=()=>{s0=(s0*1103515245+12345)%2147483648;return s0/2147483648;};X('Math=this.Math');
  X(`G=newWorld('${mode}');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='${nid}').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
  X(`P=newPlayer({first:'Prueba',surname:'Natura',sex:'F',r:'${rs[0]}',age:0});P.age=30;G.day=0;ensureV14();dlgRoll=function(){return 0};`);
  const gdp0=X(`Object.values(G.nations).filter(n=>n.alive).reduce((s,n)=>s+n.gdp,0)`);
  const st={rec:0,crb:0,tm:[]};const prev={};const prc={};
  for(let y=0;y<Y;y++){for(let m=0;m<12;m++){const t=Date.now();X(`ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;P.alive=true;P.age=30;P.s.salud=90;`);st.tm.push(Date.now()-t);
      const S=X(`Object.values(G.nations).filter(n=>n.alive).map(n=>[n.id,n.bk&&n.bk.cr>0?1:0,n.rec>0?1:0])`);
      S.forEach(([id,c,r])=>{if(c&&!prev[id])st.crb++;prev[id]=c;if(r&&!prc[id])st.rec++;prc[id]=r;});}}
  const o=X(`(()=>{const N=Object.values(G.nations).filter(n=>n.alive);const g=N.reduce((s,n)=>s+n.gdp,0);const p=N.reduce((s,n)=>s+n.pop,0);
    const sec=k=>{let s=0,w=0;N.forEach(n=>{if(!G.sh||!G.sh.h[n.id])return;s+=shOf(n.id,k)*n.gdp;w+=n.gdp;});return w?s/w:50;};
    let emp=0;HZ_EMP.forEach(([k,w])=>{if(k!=='gob')emp+=w*sec(k);});emp/=HZ_EMP.filter(e=>e[0]!=='gob').reduce((s,e)=>s+e[1],0);
    let hp=0,hw=0;for(const r in G.regions){const x=G.regions[r];if(x.hap==null)continue;hp+=x.hap*x.pop;hw+=x.pop;}
    const ppl=(typeof hzPeople==='function'?hzPeople(P):[]).map(([x])=>hzEc(P,x)).filter(e=>e&&e.e>=0);
    return {g,p,cons:sec('cons'),serv:sec('serv'),ind:sec('ind'),emp,hap:hp/hw,des:ppl.filter(e=>e.e===0).length,ppl:ppl.length};})()`);
  o.cagr=(Math.pow(o.g/gdp0,1/Y)-1)*100;o.rec=st.rec;o.crb=st.crb;st.tm.sort((a,b)=>a-b);o.ms=st.tm[st.tm.length>>1];
  if(withNat)o.nat=X(`(()=>{const A=[],W=[],F=[],E=[];for(const r in G.regions){A.push(ntProv(r).eco.v);W.push(ntWater(r).v);F.push(ntFood(r).v);}
    const q=a=>{a.sort((x,y)=>x-y);return [a[0],a[a.length>>2],a[a.length>>1],a[(a.length*3)>>2],a[a.length-1]].join('/');};
    const n=G.nations['${nid}'];const N=ntNat('${nid}');let t0=Date.now();NTC.g=null;for(const r in G.regions)ntProv(r);const tP=Date.now()-t0;
    return {ecosistema:q(A),agua:q(W),alimentos:q(F),pais:{agua:ntWaterN('${nid}').v,alimentos:ntFoodN('${nid}').v,ecosistema:ntEcoN('${nid}').v,m3_persona:Math.round(N.wpc),autosuf:+N.ss.toFixed(2),sequia:N.nd+'/'+N.nr},
      causas_cons:shParts(n,'cons').map(([k,v])=>k+' '+v.toFixed(1)).join(', '),causas_serv:shParts(n,'serv').map(([k,v])=>k+' '+v.toFixed(1)).join(', '),
      proyectos:typeof ntPjTick==='function'?(()=>{const c={hechos:0,obra:0,nat:{},n:0};for(const r in G.np||{})for(const k in G.np[r]){const e=G.np[r][k];c.hechos+=e.l;if(e.q)c.obra++;c.nat[k]=(c.nat[k]||0)+e.l;}return JSON.stringify(c);})():'-',
      especies:typeof ntSpecies==='function'?(()=>{let t=0,r1=0,r2=0;for(const r in G.regions){const L=ntSpecies(r);L.forEach(s=>{t++;if(s.st===1)r1++;if(s.st===2)r2++;});}return t+' (riesgo '+r1+', peligro '+r2+')';})():'-',
      contaminacion:typeof ntCont==='function'?(()=>{let n=0,s=0;for(const r in G.regions){const c=ntProv(r).cont;if(c&&c.raw<=-.5){n++;s+=c.v;}}return n+' provincias, media '+(n?(s/n).toFixed(2):0);})():'-',
      logistica:typeof lgFlows==='function'?(()=>{const F=lgFlows();const by={};F.forEach(f=>{const k=f.m+(f.dom?'_interno':'');by[k]=(by[k]||0)+1;});
        const T=Object.values(G.nations).filter(n=>n.alive).map(n=>lgSect(n)).filter(Boolean).map(z=>z.r);const vis=T.filter(v=>v>=.5||v<=-.5);
        const E=Object.values(G.lg.ai).map(a=>a.e);let dl=0,ls=0;Object.values(G.lg.ai).forEach(a=>{dl+=a.dl;ls+=a.ls;});
        return {flujos:by,paises_con_termino:vis.length+' de '+T.length,termino_min_media_max:[Math.min(...T),T.reduce((a,b)=>a+b,0)/Math.max(1,T.length),Math.max(...T)].map(v=>+v.toFixed(2)).join(' / '),
          eficiencia_ia:Math.min(...E).toFixed(2)+'–'+Math.max(...E).toFixed(2),retrasos_perdidas_ultimo_anio:dl+' / '+ls,mes:G.lg.t};})():'-',
      v24c:typeof seEnsure==='function'?(()=>{const S=seEnsure();const N=Object.values(G.nations).filter(n=>n.alive);let na=0,es=0;N.forEach(n=>{['retail','lujo'].forEach(k=>{if(shParts(n,k).some(z=>z[0]==='naer'))na++;});SH_K.forEach(k=>{if(shParts(n,k).some(z=>z[0]==='est'))es++;});});
        let co=0,rp=0,dead=0;for(const id in G.mk.C){const c=G.mk.C[id];if(c.ix)continue;co++;if(c.rp)rp++;if(c.dead)dead++;}let ta=0;N.forEach(n=>ta+=tuNat(n.id).arr);const R=aeRoutes();
        return {aeropuertos:Object.keys(aeBaseAll()).length,rutas_aereas:R.length,estatales_ia:S.L.length,estatales_ventas_mm:Math.round(S.L.reduce((a,e)=>a+(e.rev||0),0)/1e9),en_quiebra:S.L.filter(e=>e.qb).length,
          naer_visible:na,est_visible:es,cotizan:co+' ('+rp+' nuevas, '+dead+' quebradas)',turistas_millones:Math.round(ta/1e6)};})():'-',
      escasez:ntRes('${nid}').filter(e=>e.pr>0||e.st<2).map(e=>e.k+':'+NT_RST[e.st]).join(' '),ms_3422_prov:tP,nan:A.concat(W,F).filter(v=>!isFinite(v)).length};})()`);
  return o;}
const R={con:[],sin:[]};const f2=v=>+v.toFixed(2);
for(const s of seeds){R.sin.push(run(s,false));if(args.base!=='1')R.con.push(run(s,true));}
const avg=(L,k)=>L.reduce((s,o)=>s+o[k],0)/L.length;const sum=(L,k)=>L.reduce((s,o)=>s+o[k],0);
const res=L=>({crec_mundial_anual:f2(avg(L,'cagr'))+' %',pib_mundial_billones:f2(avg(L,'g')/1e12),recesiones_nuevas:sum(L,'rec'),crisis_bancarias_nuevas:sum(L,'crb'),
  salud_consumo_basico:f2(avg(L,'cons')),salud_servicios_publicos:f2(avg(L,'serv')),salud_industria:f2(avg(L,'ind')),salud_ponderada_empleo:f2(avg(L,'emp')),
  felicidad_mundial:f2(avg(L,'hap')),desempleados_red:sum(L,'des')+' de '+sum(L,'ppl'),mes_ms_mediana:avg(L,'ms')});
const out={semillas:seeds.join(','),anios:Y,quita:QUITA.source,sin:res(R.sin)};
if(R.con.length){out.con=res(R.con);out.diferencia={pib_mundial:f2((avg(R.con,'g')/avg(R.sin,'g')-1)*100)+' %',por_semilla:R.con.map((o,i)=>f2((o.g/R.sin[i].g-1)*100)+' %').join(' ')};out.naturaleza=R.con[0].nat;}
console.log(JSON.stringify(out,null,1));
