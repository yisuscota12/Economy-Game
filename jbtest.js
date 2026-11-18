// Prueba de la v1.7p (v1.6e del plan, vida de las carreras comunes): node jbtest.js years=15 c=MEX k=Obrero,Médico,Programador age=22
// Simula una carrera con política automática (horas normales, extra si hay vacante, se postula si la probabilidad es ≥40 %, acepta ofertas de +15 %,
// pide aumento cada 6 meses con probabilidad ≥45 %, se certifica si puede, vacaciones cuando el estrés pasa de 60) y resume puestos, sueldo nominal y real,
// evaluaciones, despidos, ofertas y ascensos. ff=1: además corre un avance rápido de 5 años con ageUp (sin cierres de mes) para revisar el reloj propio.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/';
const files='engine,engine_v04,events_v05,events_v06,engine_v07,engine_v08,events_v08,engine_v09,engine_v10,engine_v11,engine_v12,engine_v12b,data_v13,engine_v13,data_v14,engine_v14,data_v15,engine_v15,data_v15b,engine_v15b,data_v16,engine_v16,data_v16b,engine_v16b,data_v16c,engine_v16c,data_v16d,engine_v16d,engine_v17a,engine_v17b,data_v16e,engine_v16e'.split(',');
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.split('=')));const Y=+(args.years||15);
function run(k,nid){const ctx={MAP:JSON.parse(fs.readFileSync(D+'raw/map2.json')),WORLD:JSON.parse(fs.readFileSync(D+'raw/world.json')),TERR:JSON.parse(fs.readFileSync(D+'raw/terr.json')),SPLIT:JSON.parse(fs.readFileSync(D+'raw/split.json')),CITIES:JSON.parse(fs.readFileSync(D+'raw/cities.json')),CITY_RG:JSON.parse(fs.readFileSync(D+'raw/city_rg.json')),console,Math,JSON,Object,Array,Set,Map,String,Number,isFinite};
 vm.createContext(ctx);vm.runInContext(files.map(f=>fs.readFileSync(D+'src/'+f+'.js','utf8')).join('\n')+'\n;this.A={newWorld,ensureIdeoAll,newPlayer,clockAdvance,ensureClock,ensureV14,U,fmt,jobPay,careerTitle,jbEnsure,jbRank,jbVacProb,jbApply,jbOfferAccept,jbRaise,jbRaiseProb,jbCert,jbVac,jbLey,jbOfi,jbInformal,ageUp,OFI,DLG,get G(){return G},set G(v){G=v},get P(){return P},set P(v){P=v}};',ctx);
 const A=ctx.A;const out={oficio:k,pais:nid,errores:[],anios:[],notas:[]};
 A.G=A.newWorld('realista');A.ensureIdeoAll();const rs=Object.keys(A.G.regions).filter(x=>A.G.regions[x].o===nid).sort((a,b)=>A.G.regions[b].pop-A.G.regions[a].pop);
 A.P=A.newPlayer({first:'Prueba',surname:'Empleo',sex:'F',r:rs[0],age:0});A.P.age=+(args.age||22);A.G.day=0;A.ensureV14();A.P.s.salud=85;A.P.s.inteligencia=65;A.P.edu.degree=['Médico'].includes(k)?'Medicina':['Abogado'].includes(k)?'Derecho':['Ingeniero'].includes(k)?'Ingeniería':null;
 const O=A.OFI[k];A.P.job={name:k,o:{Mesero:'5',Obrero:'8',Vendedor:'5',Albañil:'7',Campesino:'6',Oficinista:'4',Policía:'5',Técnico:'3',Profesor:'2',Programador:'2',Ingeniero:'2',Abogado:'2',Médico:'2','Servidor público':'4'}[k]||'4',k:1,bonus:1};
 const w0=A.jbEnsure(A.P);const L=A.jbLey(A.P);out.inicio=`${A.jbRank(A.P)} en ${w0.nm} · ${['pequeña','mediana','grande'][w0.sz]} · ${w0.fm?'formal':'informal'}${w0.un?' · sindicato':''} · ${w0.cw.length} compañeros · sueldo ${A.fmt(A.jobPay(A.P))}`;
 out.ley=`jornada ${L.h} h · extra ×${L.ot} · vacaciones ${L.vac} d · aguinaldo ${L.b13} d · indemnización ${L.i0}+${L.iy}/año · sindicatos ${L.sin} % · informal ${Math.round(A.jbInformal(A.P)*100)} %`;
 let fired=0,offers=0,ascensos=0,evs=0;const n0=A.P.log.length;const t0=Date.now();const pay0=A.jobPay(A.P);
 for(let y=0;y<Y;y++){for(let m=0;m<12;m++){const p=A.P;
   if(!p.job){p.job={name:k,o:'4',k:1,bonus:1};A.jbEnsure(p);out.notas.push(A.G.year+' recontratada en '+p.job.w.nm);}
   const w=p.job.w;try{
   w.h=w.va?1:w.es>70?-1:0;
   if(w.va&&!w.va.ap&&A.jbVacProb(p)>=40){const r=A.jbApply(p);if(/ascienden/.test(r))ascensos++;out.notas.push(A.G.year+' '+r.slice(0,90));}
   if(w.off){offers++;if(w.off.up>=.15){out.notas.push(A.G.year+' '+A.jbOfferAccept(p).slice(0,100));}else w.off=null;}
   if(p.job&&p.job.w===w&&w.t-w.rq>=12&&A.jbRaiseProb(p)>=45)A.jbRaise(p);
   if(p.job&&O.cert&&!w.ct&&!w.cc&&p.dinero>O.cert[1]*A.U(p)*1.5)A.jbCert(p);
   if(p.job&&w.es>60&&w.vd>0)A.jbVac(p);
   A.ensureClock();A.clockAdvance(30.4,{});}catch(e){out.errores.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' '));y=Y;break;}
   p.event=null;p.dlg=null;p.alive=true;p.prison=null;if(p.s.salud<45)p.s.salud=65;}
  const p=A.P,w=p.job&&p.job.w;if(w){const e=w.evs[w.evs.length-1];out.anios.push(`${A.G.year} ${p.age}a ${A.jbRank(p)} · ${A.fmt(A.jobPay(p))} · desempeño ${Math.round(w.pf)} · habilidad ${Math.round(w.sk)} · estrés ${Math.round(w.es)} · jefe ${Math.round(p.npcs.jefe.rel)}${e?' · últ. evaluación '+e.sc:''}`);}}
 const L2=A.P.log.slice(n0).map(l=>l.t);fired=L2.filter(t=>/Te despiden/.test(t)).length;evs=L2.filter(t=>/Evaluación semestral/.test(t)).length;
 out.resumen=`${Y} años en ${Date.now()-t0} ms · evaluaciones ${evs} · despidos ${fired} · ofertas ${offers} · ascensos ${ascensos} · sueldo inicial ${A.fmt(pay0)} → final ${A.P.job?A.fmt(A.jobPay(A.P)):'sin empleo'}`;
 out.registro=L2.filter(t=>/Aguinaldo|Pagas extra|contrato colectivo|Vacante|accidente|lastimas|burnout|Te despiden/.test(t)).slice(0,8);
 if(args.ff){const p=A.P;if(!p.job){p.job={name:k,o:'4',k:1,bonus:1};A.jbEnsure(p);}const t1=p.jbt||0,y1=A.G.year,l1=p.log.length;for(let i=0;i<5;i++){A.ageUp();p.event=null;p.dlg=null;if(!p.job){p.job={name:k,o:'4',k:1,bonus:1};A.jbEnsure(p);}}
  out.avanceRapido=`5 años con ageUp: meses trabajados ${(p.jbt||0)-t1} (esperado 60) · evaluaciones ${p.log.slice(l1).filter(l=>/Evaluación semestral/.test(l.t)).length} (esperado ~10) · año ${y1}→${A.G.year}`;}
 out.dialogos=A.DLG.filter(d=>/^jb_/.test(d.id)).map(d=>d.id+':'+(d.w(A.P)||0).toFixed(1)).join(' ');out.tamanoEmpleo=A.P.job?JSON.stringify(A.P.job).length+' bytes':'—';
 return out;}
for(const nid of (args.c||'MEX').split(','))for(const k of (args.k||'Obrero').split(','))console.log(JSON.stringify(run(k,nid),null,1));
