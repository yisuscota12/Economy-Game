// v1.8a: prueba sin pantalla de los diálogos (separación, repetición, bandeja y vida social). Carga el motor completo según build.js.
// node dq18test.js n=6 years=30 [abre=0.7] [base=1]   (abre = fracción de conversaciones pendientes que el jugador atiende; base=1 sin la v1.8a)
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));
let files=fs.readFileSync(D+'build.js','utf8').split('\n').find(l=>l.startsWith('const engine')).match(/src\/[a-z0-9_]+\.js/g);if(args.base==='1')files=files.filter(f=>!/v18a/.test(f));
const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite,Date,performance:{now:()=>Date.now()}};
vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+f,'utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,dlgNode,dlgChoose,dlgNext,resolveEvent,ensureClock,MCUM,monthOfDay,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v},DLG,dqOpen:typeof dqOpen!=="undefined"?dqOpen:null,socialNow:typeof socialNow!=="undefined"?socialNow:null};',ctx);
const A=ctx.A;const N=+(args.n||6),Y=+(args.years||30),OPEN=args.abre!=null?+args.abre:.7;
const RC={};const cnt={},cat={},errs=[];let yrs=0,started=0,deferred=0,opened=0,gone=0,expired=0,happ=[],soc=[],gaps=[],repeat3=0;const t0=Date.now();
for(let i=0;i<N;i++){A.G=A.newWorld(args.mode||'realista');A.ensureIdeoAll();const ids=['MEX','USA','DEU','IND','NGA','BRA'];const nid=ids[i%ids.length];
  const r=Object.keys(A.G.regions).find(k=>A.G.regions[k].o===nid);A.P=A.newPlayer({first:'T',surname:'S'+i,sex:i%2?'F':'M',r,age:18});A.G.day=0;
  A.P.partner={name:'Pareja X',rel:50,sex:'F',age:20};A.P.ppl.push({name:'Amigo Uno',k:'amigo',rel:70});A.P.siblings=[{name:'Hermano Dos',sex:'M',age:25}];A.P.job={name:'Oficinista',o:'4',k:1,bonus:1};A.P.career.years=3;A.P.biz=i%3===0?{lvl:1,type:0,luck:1}:null;
  const y0=A.G.year;let last=null;const seen={};
  const play=()=>{let k=0;while(A.P.dlg&&k++<10){const V=A.dlgNode(A.P);if(!V)break;const av=V.opts.filter(o=>o.ok);if(!av.length){A.P.dlg=null;break;}const o=av[Math.floor(Math.random()*av.length)];
      if(!A.P.dlg.res&&(A.P.dlg.node===V.d.start||A.P.dlg.node==='a')){cnt[V.d.id]=(cnt[V.d.id]||0)+1;cat[V.d.cat]=(cat[V.d.cat]||0)+1;started++;const now=A.G.year*365+A.G.day;if(last!=null)gaps.push(now-last);last=now;
        (seen[V.d.id]=seen[V.d.id]||[]).push(now);if(seen[V.d.id].filter(t=>now-t<1095).length>=3)repeat3++;}
      try{A.dlgChoose(o.i);A.dlgNext();}catch(e){errs.push(V.d.id+' '+e.message);A.P.dlg=null;}}};
  for(let s=0;s<Y*12&&A.P.alive;s++){A.ensureClock();const m=A.monthOfDay(A.G.day);const q0=(A.P.dq||[]).length;
    try{A.clockAdvance(A.MCUM[m+1]-A.G.day,{});}catch(e){errs.push('adv '+e.message);break;}
    play();if(A.P.event){try{A.resolveEvent(0);}catch(e){A.P.event=null;}}
    // conversaciones pendientes: el jugador atiende una parte; el resto vence sola
    if(A.dqOpen&&A.P.dq&&A.P.dq.length){deferred+=Math.max(0,A.P.dq.length-q0);for(let j=A.P.dq.length-1;j>=0;j--){if(Math.random()<OPEN/2){const r=A.dqOpen(j);RC[r]=(RC[r]||0)+1;if(r==='ok'){opened++;play();}else if(r==='gone')gone++;}}}
    if(s%12===11){happ.push(A.P.s.felicidad);if(A.socialNow)soc.push(A.socialNow(A.P).e);}}
  expired+=(A.P.log||[]).filter(l=>/^💬 (No atendiste|Dejaste pasar)/.test(l.t)).length;
  yrs+=A.G.year-y0;}
const avg=a=>a.length?(a.reduce((s,x)=>s+x,0)/a.length):0;gaps.sort((a,b)=>a-b);
console.log(JSON.stringify({segundos:((Date.now()-t0)/1000).toFixed(1),años:yrs,dialogosPorAño:(started/Math.max(1,yrs)).toFixed(2),aBandejaPorAño:(deferred/Math.max(1,yrs)).toFixed(2),atendidasDeBandeja:opened,yaNoAplicaban:gone,vencidas:expired,
  separacionMinimaDias:gaps[0],separacionMediana:gaps[Math.floor(gaps.length/2)],repetidas3en3años:repeat3,animoMedio:avg(happ).toFixed(1),efectoSocialMedioMes:avg(soc).toFixed(2),porCategoria:cat,abrir:RC,errores:errs.slice(0,8),nunca:A.DLG.map(d=>d.id).filter(id=>!cnt[id]).length},null,0));
