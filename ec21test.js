// Prueba de la v2.1b (economía conectada, parte 2): node ec21test.js years=10 c=MEX [mode=realista|rapido] [n=6] [base=1]
// Salud de los sectores (rango, causas, cadena), aporte al PIB de tus empresas, quiebras en cadena, integración vertical, venta negociada,
// mercado en otros países, núcleo del mundo de la IA (tiempo) y balance: PIB mundial, crecimiento, inflación y quiebras de bolsa.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
let files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);if(args.base==='1')files=files.filter(f=>!/v21b/.test(f));
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite,Float32Array,Int16Array,Uint8Array,performance};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.X=function(s){return eval(s);};',ctx);
const X=ctx.X;const Y=+(args.years||10),nid=args.c||'MEX',mode=args.mode||'realista';const v21=args.base!=='1';const out={errores:[]};
const E=(t,f)=>{try{return f();}catch(e){out.errores.push(t+': '+e.message+' '+(e.stack||'').split('\n')[1]);return null;}};
let s0=+(args.seed||7);ctx.Math=Object.create(Math);ctx.Math.random=()=>{s0=(s0*1103515245+12345)%2147483648;return s0/2147483648;};X('Math=this.Math');
X(`G=newWorld('${mode}');ensureIdeoAll();`);const rs=X(`Object.keys(G.regions).filter(x=>G.regions[x].o==='${nid}').sort((a,b)=>G.regions[b].pop-G.regions[a].pop)`);
X(`P=newPlayer({first:'Prueba',surname:'Dueño',sex:'M',r:'${rs[0]}',age:0});P.age=35;G.day=0;ensureV14();P.edu.degree='Economía';P.dinero=5e4*U(P);dlgRoll=function(){return 0};`);
const gdp0=X(`Object.values(G.nations).filter(n=>n.alive).reduce((s,n)=>s+n.gdp,0)`);const p0=X(`G.regions['${rs[0]}'].gdp`);
// empresas del jugador: un restaurante, una granja (insumos del restaurante) y una fábrica
E('abrir',()=>X(`['restaurante','granja','fabrica','software'].forEach(k=>bzOpen(P,k,'${rs[0]}',false));bzList(P).forEach(b=>{for(let i=0;i<3;i++)bzBranch(P,b,1);bzStaff(P,b,bzT(b).st*b.br-b.st);});bzList(P).map(b=>b.n)`));
const dead0=X(`Object.values(G.mk.C).filter(c=>c.dead).length`);let tMon=[];
for(let y=0;y<Y;y++){for(let m=0;m<12;m++){const t=Date.now();E('mes '+y+'/'+m,()=>X(`ensureClock();clockAdvance(31,{});P.event=null;P.dlg=null;P.alive=true;P.age=35;`));tMon.push(Date.now()-t);}}
const R=E('resultado',()=>X(`(()=>{const o={};const S=G.sh;if(!S)return {sin_v21b:1};const all=[];for(const id in S.h)S.h[id].forEach(v=>all.push(v));all.sort((a,b)=>a-b);
  o.salud={n:all.length,min:all[0],p10:all[Math.floor(all.length*.1)],mediana:all[Math.floor(all.length/2)],p90:all[Math.floor(all.length*.9)],max:all[all.length-1],nan:all.filter(v=>!isFinite(v)).length};
  const n=G.nations['${nid}'];o.pais=SH_K.map(k=>k+' '+Math.round(shOf('${nid}',k))).join(' · ');o.causas_ind=shParts(n,'ind').map(([k,v])=>k+' '+v.toFixed(1)).join(', ');
  o.empresas=bzList(P).map(b=>{const E=bzEco(b);return {n:b.n,va:Math.round(E.va/U(P)*10)/10+'U',mult:E.mult.toFixed(2),empleos:E.jobs+'+'+E.jInd,imp:Math.round(E.taxes/U(P)*10)/10+'U',pib_prov:(E.shP*100).toFixed(3)+' %',pib_pais:(E.shN*100).toFixed(4)+' %',gA:Math.round(b.gA||0),shf:b.m.length?b.m[b.m.length-1].shf:null,vi:b.m.length?Math.round((b.m[b.m.length-1].vi||0)/U(P)*1000)/1000:null};});
  o.lx=Object.keys(G.lx||{}).length;return o;})()`));
Object.assign(out,R||{});
// núcleo del mundo de la IA
E('nucleo',()=>{const t0=Date.now();X('V21F=wmwFeat();V21K=wmwComp(V21F.F,V21F.N,SH_K.length,SH_K)');const t1=Date.now();X('V21I=wmwInputs()');const t2=Date.now();let r;for(let i=0;i<20;i++)r=X('wmwKernel(V21K,V21I.own,V21I.h,V21I.lx,V21I.N,V21I.S)');const t3=Date.now();
  const a=Array.from(r.act).sort((x,y)=>x-y);out.nucleo={comp_ms:t1-t0,entradas_ms:t2-t1,nucleo_ms:(t3-t2)/20,act_min:a[0].toFixed(1),act_med:a[a.length>>1].toFixed(1),act_max:a[a.length-1].toFixed(1)};});
// quiebra en cadena y cierre
E('quiebra',()=>{const r=X(`(()=>{const b=bzList(P).find(z=>z.k==='software');const x=G.regions[b.r];const bk=bnkEnsure(G.nations[x.o]);const h0=bk.h,g0=x.gdp,hp=x.hap,gA=b.gA;b.debt=b.assets*5+1e9;bzBankrupt(P,b);
  return {quebro:!bzList(P).includes(b),banco:+(bk.h-h0).toFixed(2),pib_prov:Math.round(x.gdp-g0),gA:Math.round(gA||0),felicidad:+(x.hap-hp).toFixed(2),choque:G.lx[b.r]?G.lx[b.r][0].toFixed(3):null,fin:G.sh.x['${nid}']};})()`);out.quiebra=r;});
// venta negociada
E('venta',()=>{const r=X(`(()=>{const b=bzList(P).find(z=>z.k==='fabrica');const S=bzsEnsure(P,b);const o={salud:S.h,ofertas:S.L.map(x=>x.k+' '+Math.round(x.px/U(P))+'U'),valor:Math.round(bzValue(b)/U(P))+'U',prob:[0,1,2].map(j=>bzsChance(S.L[0],j,S.h)).join('/')};
  const d0=P.dinero;const _r=Math.random;Math.random=()=>.9999;const x1=bzsDo(P,b,0,2);Math.random=_r;o.rechazo=x1.ok===false;const x2=bzsDo(P,b,0,0);o.vendida=x2.ok&&!bzList(P).includes(b)&&P.dinero>d0;o.texto=x2.t.slice(0,90);return o;})()`);out.venta=r;});
// mercado de otro país
E('extranjero',()=>{const r=X(`(()=>{const L=bzmCountries(P);const nid=L.find(x=>x!=='${nid}');const M=bzmMk(P,nid);const o={paises:L.slice(0,6).join(','),pais:nid,ofertas:M.L.length,casa_intacta:!G.bzm||G.bzm.n==='${nid}'};
  const of=M.L[0];of.urg=true;of.neg=0;P.dinero=1e15;const n0=bzList(P).length;let k=null;for(let i=0;i<8&&!k;i++){of.neg=0;const x=bzmOffer(P,of.id,2,false);if(x.ok)k=x;}o.compra=!!k&&bzList(P).length===n0+1;o.tramites=k?/extranjera/.test(k.t):null;
  const b=bzList(P)[bzList(P).length-1];o.region_extranjera=G.regions[b.r].o===nid;o.gA=Math.round(b.gA||0);o.kb_mercado=Math.round(JSON.stringify(M).length/1024);['DEU','JPN','CHN','FRA'].forEach(k=>bzmMk(P,k));o.mercados_guardados=Object.keys(G.bzmx).length;o.kb_sh=Math.round(JSON.stringify(G.sh).length/1024);return o;})()`);out.extranjero=r;});
// balance mundial
E('balance',()=>{const g1=X(`Object.values(G.nations).filter(n=>n.alive).reduce((s,n)=>s+n.gdp,0)`);out.balance={crec_mundial_anual:((Math.pow(g1/gdp0,1/Y)-1)*100).toFixed(2)+' %',pib_prov_cambio:((X(`G.regions['${rs[0]}'].gdp`)/p0-1)*100).toFixed(1)+' %',
  quiebras_bolsa:X(`Object.values(G.mk.C).filter(c=>c.dead).length`)-dead0,inflacion_pais:X(`G.nations['${nid}'].infl`),bancos_salud:X(`(()=>{const v=Object.values(G.nations).filter(n=>n.alive&&n.bk).map(n=>n.bk.h).sort((a,b)=>a-b);return v.length?[Math.round(v[0]),Math.round(v[v.length>>1]),Math.round(v[v.length-1])].join('/'):''})()`),
  crisis_bancarias:X(`Object.values(G.nations).filter(n=>n.alive&&n.bk&&n.bk.cr>0).length`),mes_ms:(()=>{tMon.sort((a,b)=>a-b);return tMon[tMon.length>>1]+' / '+tMon[tMon.length-1];})()};});
console.log(JSON.stringify(out,null,1));
