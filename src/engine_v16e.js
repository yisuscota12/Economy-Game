/* ===== v1.7p (v1.6e del plan): vida de las carreras comunes — motor =====
   Todo empleo común (p.job) recibe un lugar de trabajo en p.job.w: nombre, tamaño, formal o informal, sindicato, puesto en el escalafón del oficio
   (OFI), desempeño, habilidad, estrés, horas, antigüedad, compañeros con rasgo y relación, un rival, vacantes, ofertas, certificación, vacaciones,
   advertencias, historial de sueldo (nominal y real) y de evaluaciones. El jefe es el NPC «jefe» del motor de diálogo (p.npcs.jefe).
   Mes laboral (jbMonth): sube la habilidad, cambia el estrés, el desempeño se mueve hacia su objetivo (con causas visibles), accidentes según el riesgo
   del oficio, vacantes reales (alguien se jubila, renuncia, lo despiden o la empresa crece), ofertas de la competencia y evaluación cada 6 meses.
   Fin de año (jbYear): aguinaldo o pagas extra por ley, contrato colectivo si hay sindicato, vacaciones nuevas e historial.
   Reloj propio: w.yy/w.mi (meses procesados en el año); en el avance rápido ageUp completa los meses que falten (trampa 1 de CONTEXTO_IA.md).
   El reloj del juego se detiene con evaluación, vacante, oferta o despido (JB_NOTE); en el avance rápido o sin pantalla se decide solo (jbAuto). */
const jbAuto=()=>CB_AUTO||(typeof FF_ON!=='undefined'&&FF_ON);
var JB_NOTE=null;
const JB_INF={'Campesino':1.5,'Albañil':1.4,'Mesero':1.3,'Mesero (medio tiempo)':1.4,'Vendedor':1.1,'Obrero':.7,'Oficinista':.5,'Servidor público':0,'Policía':0,'Técnico':.8,'Profesor':.2,'Programador':.4,'Ingeniero':.3,'Abogado':.5,'Médico':.2};
function jbOfi(p){return (p&&p.job&&OFI[p.job.name])||OFI0;}
function jbLey(p){const id=natOf(p).id,n0=N0[id]||{};return Object.assign({},LEY0[n0.inc]||LEY0['Upper middle income'],LEY[id]||{});}
function jbInformal(p){const n=N0[natOf(p).id];const pc=n&&n.pop?n.gdp/n.pop:10000;return clamp(.95-.2*Math.log(Math.max(1,pc/1000)),.04,.85);}
function jbBoss(p){p.npcs=p.npcs||{};if(!p.npcs.jefe)p.npcs.jefe=mkNPC(p,'jefe');return p.npcs.jefe;}
function jbPI(p){return isReal()?(natOf(p).price||1):1;}
function jbWP(p,F){const c=cultOf(natOf(p).id),rg=RG[p.r];return pick(F.wp).replace('{S}',rndSur(c)).replace('{C}',rg?rg.nm:natOf(p).name);}
const JB_VAC0=10; /* v1.7p: donde la ley no obliga (EE. UU.), las empresas suelen dar unos 10 días pagados (BLS) */
function jbVacDays(p,w){const L=jbLey(p),y=Math.floor((w?w.ant:0)/12);return (L.vac||JB_VAC0)+(L.vx?Math.min(8,L.vx*y)+(y>5?2*Math.floor((y-5)/5):0):0);}
// crea el lugar de trabajo (o uno nuevo al cambiar de empleo); o: {rk, sz, fm, nm}
function jbNew(p,o){o=o||{};const F=jbOfi(p),L=jbLey(p),c=cultOf(natOf(p).id);const sz=o.sz!=null?o.sz:pick(F.sz);
  const fm=o.fm!=null?o.fm:(chance(jbInformal(p)*(JB_INF[p.job.name]!=null?JB_INF[p.job.name]:1)*[1.3,.7,.25][sz])?0:1);
  const un=fm&&chance(Math.min(.95,L.sin/100*F.un*(1+sz*.5)*2))?1:0;
  p.npcs=p.npcs||{};p.npcs.jefe=mkNPC(p,'jefe');p.npcs.colega=mkNPC(p,'colega');
  const n=RI(JB_SZ[sz][1][0],JB_SZ[sz][1][1]),tr=Object.keys(JB_TR);const cw=[];
  for(let i=0;i<n;i++){const sx=i===0?p.npcs.colega.sex:pick(['M','F']);cw.push({n:i===0?p.npcs.colega.name:rndFirst(sx,c)+' '+rndSur(c),sx,tr:pick(tr),rel:RI(40,62),s:RI(35,75),rv:0});}
  if(cw.length>1){const r=cw[RI(1,cw.length-1)];r.rv=1;r.s=RI(48,78);r.rel=RI(30,48);}
  const sk0=clamp(25+p.s.inteligencia*.3+(p.edu.degree?10:0),10,70);
  p.job.w={nm:o.nm||jbWP(p,F),sz,fm,un,af:0,rk:o.rk||0,pf:52,sk:sk0,es:18,h:0,ant:0,ev:0,wr:0,va:null,off:null,cc:0,ct:o.ct||0,vd:jbVacDays(p,null),rq:-99,
    cw,t:0,yy:o.yy!=null?o.yy:G.year,mi:o.mi!=null?o.mi:monthOfDay(G.day),y0:G.year,pr0:jbPI(p),hist:[],evs:[]};
  p.jbh=p.jbh||[];p.jbh.push({y0:G.year,y1:null,o:p.job.name,nm:p.job.w.nm,rk:p.job.w.rk});if(p.jbh.length>30)p.jbh.shift();
  return p.job.w;}
function jbEnsure(p){if(!p)return null;if(p.job&&!p.job.w){jbClose(p);jbNew(p);}else if(!p.job)jbClose(p);return p.job&&p.job.w;}
function jbClose(p){const h=p.jbh&&p.jbh[p.jbh.length-1];if(h&&h.y1==null&&(!p.job||!p.job.w||h.nm!==p.job.w.nm))h.y1=G.year;}
function jbRank(p){const w=p.job&&p.job.w,F=jbOfi(p);return w?F.rk[Math.min(w.rk,F.rk.length-1)][0]:'';}
// desempeño: objetivo con sus causas visibles (el valor real se mueve 25 % hacia él cada mes)
function jbTarget(p){const w=p.job.w,b=jbBoss(p);const parts=[['Habilidad en el oficio',(w.sk-50)*.45],['Horas que trabajas',w.h*11],['Relación con tu jefe',(b.rel-50)*.22],
  ['Certificación',w.ct?6:0],['Antigüedad',Math.min(8,w.ant/12*1.5)],['Estrés',-Math.max(0,w.es-60)*.55],['Salud',-Math.max(0,50-p.s.salud)*.4]];
  return {v:clamp(48+parts.reduce((s,x)=>s+x[1],0),0,100),parts};}
function jbMonth(p){const j=p.job;if(!j||!j.w||p.prison||p.ruler)return;const w=j.w,F=jbOfi(p);w.t++;p.jbt=(p.jbt||0)+1;w.ant++;w.ev++;const b=jbBoss(p);
  const hm=w.h===1?1.35:w.h===-1?.6:1;w.sk=clamp(w.sk+1.1*(1-w.sk/100)*hm*(.7+p.s.inteligencia/200),0,100);
  const sh=F.tu==='noche'||F.tu==='rotativo'?.8:0;w.es=clamp(w.es+2.2*F.st*(w.h===1?2:w.h===-1?.45:1)+sh+F.rs*.4+(w.cc?1.2:0)-(1.6+p.s.felicidad/60),0,100);
  w.pf=clamp(w.pf+(jbTarget(p).v-w.pf)*.25+gz()*3,0,100);
  if(w.es>85){p.s.salud-=1.5;p.s.felicidad-=2;if(!w.bo){w.bo=1;log('🔥 Estás al borde del agotamiento (burnout): baja tus horas o toma vacaciones.','bad');}}else if(w.es<70)w.bo=0;
  if(F.rs>=2&&chance(.002*F.rs*(w.h===1?1.6:1)*(w.es>70?1.5:1))){p.s.salud-=RI(8,20);log(F.rs>=3?'🚑 Sufres un accidente de trabajo. Te recuperas, pero te quedan secuelas.':'🩹 Te lastimas en el trabajo.','bad');}
  if(w.cc){w.cc--;if(!w.cc){w.ct=1;log(`🎓 Terminas: ${F.cert[0]}.`,'good');}}
  b.rel=clamp(b.rel+(w.pf-55)*.03+(w.h===1?.3:w.h===-1?-.4:0),0,100);w.cw.forEach(c=>{c.rel=clamp(c.rel+(50-c.rel)*.02,0,100);c.s=clamp(c.s+R(-.3,.5),0,100);});
  if(w.off){w.off.m--;if(w.off.m<=0){if(jbAuto()&&w.off.up>=.15)jbOfferAccept(p);else{w.off=null;}}}
  if(w.va){w.va.m--;if(jbAuto()&&!w.va.ap&&jbVacProb(p)>=40)jbApply(p);else if(w.va&&w.va.m<=0)jbVacClose(p);}
  else if(w.rk<F.rk.length-1&&chance(.035*[.6,1,1.5][w.sz]))jbVacOpen(p);
  if(p.job&&p.job.w===w&&!w.off&&w.ant>=6&&chance(.012+(w.pf>70?.02:0)+(w.sk>70?.01:0)))jbOffer(p);
  if(p.job&&p.job.w===w&&w.ev>=6)jbEval(p);}
function jbEval(p){const w=p.job.w,pay=jobPay(p);w.ev=0;const sc=Math.round(w.pf);let r,fx=0,bo=0;
  if(sc>=80){r='e';fx=R(.015,.025); /* v1.7p: el sueldo base ya sigue a precios y prosperidad; esto es solo la prima real por mérito */bo=pay/12;p.dinero+=bo;}else if(sc>=65){r='b';fx=R(.005,.012);}else if(sc>=50)r='r';else{r='m';w.wr++;}
  if(r==='e'||r==='b')w.wr=Math.max(0,w.wr-1);if(fx)p.job.bonus=(p.job.bonus||1)*(1+fx);
  const f=(fx*100).toFixed(1);w.evs.push({y:G.year,sc,r,fx:fx?+f:0});if(w.evs.length>24)w.evs.shift();
  if(sc<25||(w.wr>=2&&sc<50)){jbFire(p,'ev');return;}
  log(r==='e'?`📋 Evaluación semestral: ${sc}/100, excelente. Bono de ${fmt(bo)} y aumento de ${f} %.`:r==='b'?`📋 Evaluación semestral: ${sc}/100, buena. Aumento de ${f} %.`:r==='r'?`📋 Evaluación semestral: ${sc}/100, regular. Sin aumento.`:`📋 Evaluación semestral: ${sc}/100, baja. Recibes una advertencia por escrito (${w.wr} de 2).`,r==='m'?'bad':r==='r'?'':'good');
  if(!jbAuto())JB_NOTE=JB_NOTE||'ev';}
function jbFire(p,why){const w=p.job.w,L=jbLey(p),pay=jobPay(p),y=w.ant/12;const sev=w.fm?pay*(L.i0+L.iy*y)/365:0;p.dinero+=sev;const nm=w.nm;jbClose(p);p.job=null;
  log(!w.fm?`📄 Te despiden de ${nm}. Como el empleo era informal, no recibes indemnización.`:sev>0?`📄 Te despiden de ${nm}. Recibes ${fmt(sev)} de indemnización (ley de tu país: ${L.i0} días más ${L.iy} por año trabajado).`:`📄 Te despiden de ${nm}. La ley de tu país no obliga a pagar indemnización.`,'bad');
  p.s.felicidad-=8;if(!jbAuto())JB_NOTE='fi';}
function jbVacOpen(p){const w=p.job.w,F=jbOfi(p);const why=RI(0,3);w.va={m:2,why,ap:0};const pos=F.rk[w.rk+1][0];
  log([`📢 Vacante de ${pos} en ${w.nm}: alguien se jubila.`,`📢 Vacante de ${pos} en ${w.nm}: alguien renuncia.`,`📢 Vacante de ${pos} en ${w.nm}: despiden a alguien.`,`📢 Vacante de ${pos} en ${w.nm}: la empresa crece.`][why],'good');
  if(!jbAuto())JB_NOTE=JB_NOTE||'va';}
function jbVacProb(p){const w=p.job.w,F=jbOfi(p),b=jbBoss(p);if(!w.va)return 0;if(F.cr!=null&&w.rk+1>=F.cr&&!w.ct)return 0;const r=w.cw.find(c=>c.rv);
  return Math.round(clamp(22+(w.pf-50)*.9+Math.min(15,w.ant/12*3)+(w.ct?8:0)+(b.rel-50)*.3-(r?(r.s-50)*.5:0)+(typeof G.dif==='string'?(G.dif==='f'?8:G.dif==='d'?-8:0):0),5,92));}
function jbApply(p){const w=p.job.w,F=jbOfi(p);if(!w.va||w.va.ap)return 'Ya te postulaste.';const pr=jbVacProb(p);if(!pr)return `Para ese puesto necesitas: ${F.cert[0]}.`;w.va.ap=1;const pos=F.rk[w.rk+1][0];const r=w.cw.find(c=>c.rv);
  if(chance(pr/100)){w.rk++;w.pf=clamp(w.pf-6,0,100);w.va=null;if(r)r.rel=clamp(r.rel-10,0,100);const h=p.jbh[p.jbh.length-1];if(h)h.rk=Math.max(h.rk,w.rk);const msg=`🎉 Te ascienden a ${pos}. Tu sueldo pasa a ${fmt(jobPay(p))} al año.`;log(msg,'good');return msg;}
  w.va=null;if(r&&chance(.4)){const b=jbBoss(p);b.name=r.n;b.sex=r.sx;b.rel=r.rel;b.hist=[];w.cw.splice(w.cw.indexOf(r),1);const o=w.cw.filter((c,i)=>i>0);if(o.length){const z=pick(o);z.rv=1;z.rel=Math.min(z.rel,45);}
    const msg=`La vacante de ${pos} se la dan a ${r.n}, tu rival. Ahora es tu jefe.`;log(msg,'bad');return msg;}
  const msg=`La vacante de ${pos} se la dan a otra persona.`;log(msg,'bad');return msg;}
function jbVacClose(p){const w=p.job.w,F=jbOfi(p);const pos=F.rk[w.rk+1][0];w.va=null;log(`La vacante de ${pos} se cubre con alguien de fuera.`);}
function jbOffer(p){const w=p.job.w,F=jbOfi(p);const up=+(R(.08,.2)).toFixed(2);w.off={nm:jbWP(p,F),up,sz:pick(F.sz),fm:chance(jbInformal(p)*(JB_INF[p.job.name]!=null?JB_INF[p.job.name]:1))?0:1,m:2};
  log(`📨 ${w.off.nm} te ofrece trabajo como ${jbRank(p)} con ${Math.round(up*100)} % más de sueldo.`,'good');if(!jbAuto())JB_NOTE=JB_NOTE||'of';}
function jbOfferAccept(p){const w=p.job.w,o=w.off;if(!o)return '';const rk=w.rk,ct=w.ct;jbClose(p);p.job.bonus=(p.job.bonus||1)*(1+o.up);delete p.job.w;jbNew(p,{rk,ct,sz:o.sz,fm:o.fm,nm:o.nm,yy:w.yy,mi:w.mi});
  const msg=`Aceptas. Empiezas en ${o.nm} como ${jbRank(p)} con un sueldo de ${fmt(jobPay(p))} al año.`;log(msg,'good');return msg;}
function jbOfferUse(p){const w=p.job.w,o=w.off,b=jbBoss(p);if(!o)return '';w.off=null;if(chance(clamp(.25+(w.pf-50)/100+(b.rel-50)/150,.08,.8))){const up=+(o.up/2).toFixed(2);p.job.bonus=(p.job.bonus||1)*(1+up);b.rel=clamp(b.rel-4,0,100);
    const msg=`Tu jefe no quiere perderte: te sube el sueldo ${Math.round(up*100)} %.`;log(msg,'good');return msg;}b.rel=clamp(b.rel-10,0,100);const msg='A tu jefe no le gusta la presión. No hay aumento y la relación se enfría.';log(msg,'bad');return msg;}
function jbRaiseProb(p){const w=p.job.w,b=jbBoss(p);return Math.round(clamp(20+(w.pf-50)*.9+(b.rel-50)*.6+(w.off?18:0)+Math.min(10,w.ant/12*2),5,90));}
function jbRaise(p){const w=p.job.w,b=jbBoss(p);if(w.t-w.rq<12)return 'Ya pediste aumento hace poco: espera un año.';w.rq=w.t;const pr=jbRaiseProb(p);
  if(chance(pr/100)){const up=R(.02,.04);p.job.bonus=(p.job.bonus||1)*(1+up);const msg=`Tu jefe acepta: tu sueldo sube ${Math.round(up*100)} %.`;log(msg,'good');return msg;}
  b.rel=clamp(b.rel-5,0,100);const msg='Tu jefe dice que no por ahora.';log(msg);return msg;}
function jbCert(p){const w=p.job.w,F=jbOfi(p);if(!F.cert||w.ct||w.cc)return '';const c=F.cert[1]*U(p);if(p.dinero<c)return `Te faltan ${fmt(c-p.dinero)}.`;p.dinero-=c;w.cc=F.cert[2];
  const msg=`Empiezas: ${F.cert[0]}. Dura ${F.cert[2]} meses y cuesta ${fmt(c)}.`;log(msg);return msg;}
function jbVac(p){const w=p.job.w;const d=Math.min(7,w.vd);if(d<=0)return 'Ya no te quedan días de vacaciones este año.';w.vd-=d;p.ft=(p.ft||0)+d;w.es=clamp(w.es-28,0,100);p.s.felicidad+=4;
  const msg=w.fm?`Tomas ${d} días de vacaciones pagadas. Vuelves descansado.`:`Te tomas ${d} días sin goce de sueldo (en un empleo informal no hay vacaciones pagadas).`;if(!w.fm)p.dinero-=jobPay(p)*d/365;log(msg,'good');return msg;}
function jbJoin(p){const w=p.job.w;if(!w.un)return '';w.af=w.af?0:1;const msg=w.af?'Te afilias al sindicato. La cuota es de 1 % de tu sueldo.':'Dejas el sindicato.';log(msg);return msg;}
function jbMix(p,i){const w=p.job.w,c=w.cw[i];if(!c)return '';const d={amable:7,ambicioso:3,chismoso:4,trabajador:5,flojo:5,mentor:6}[c.tr]||5;c.rel=clamp(c.rel+d+(c.rv?-2:0),0,100);w.es=clamp(w.es-4,0,100);
  if(c.tr==='mentor'){w.sk=clamp(w.sk+1.5,0,100);}const msg=c.tr==='mentor'?`Comes con ${c.n}. Te comparte trucos del oficio.`:c.tr==='chismoso'?`Comes con ${c.n}. Te pone al día de todos los chismes.`:`Comes con ${c.n}. Se llevan mejor.`;log(msg);return msg;}
function jbSearch(p){const w=p.job.w;if(w.off)return 'Ya tienes una oferta sobre la mesa.';if(chance(.25+(w.sk>60?.15:0)+(w.pf>65?.1:0))){jbOffer(p);JB_NOTE=null;return `${w.off.nm} te ofrece trabajo como ${jbRank(p)} con ${Math.round(w.off.up*100)} % más de sueldo.`;}const msg='Mandas solicitudes, pero por ahora nadie te llama.';log(msg);return msg;}
function jbYear(p){const w=p.job.w,L=jbLey(p),pay=jobPay(p);const mo=Math.min(12,w.ant);
  if(w.fm&&L.b13){const a=pay*L.b13/365*mo/12;p.dinero+=a;log(L.b13>=60?`🎄 Pagas extra por ley: recibes ${fmt(a)} (${L.b13} días de sueldo al año).`:`🎄 Aguinaldo: recibes ${fmt(a)} (${L.b13} días de sueldo, por ley).`,'good');}
  if(w.af)p.dinero-=pay*.01;
  if(w.un){const up=R(.3,1.5)/100; /* el salario base ya sigue a la inflación: el contrato colectivo suma una prima real */p.job.bonus=(p.job.bonus||1)*(1+up);log(`🤝 El sindicato firma el contrato colectivo: aumento general de ${(up*100).toFixed(1)} %.`,'good');}
  w.vd=jbVacDays(p,w);w.hist.push({y:G.year,rk:w.rk,pay:Math.round(jobPay(p)),pi:jbPI(p)});if(w.hist.length>60)w.hist.shift();
  const h=p.jbh[p.jbh.length-1];if(h)h.rk=Math.max(h.rk,w.rk);}
// enganches: sueldo según el puesto y las horas extra; título; mes; fin de año; reloj
{const _jp=jobPay;jobPay=function(p,j){j=j||p.job;let v=_jp(p,j);const w=j&&j.w;if(!w||!OFI)return v;const F=OFI[j.name]||OFI0;v*=F.rk[Math.min(w.rk,F.rk.length-1)][1];
  if(w.h===1){const L=jbLey(p);v*=1+8/L.h*(w.fm?L.ot:.6);}return v;};}
{const _ct=careerTitle;careerTitle=function(p){const t=_ct(p);if(p&&p.job&&p.job.w&&t===p.job.name)return jbRank(p);return t;};}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{const p=P;if(!G||!p||!p.alive)return;jbEnsure(p);const w=p.job&&p.job.w;if(!w)return;if(w.yy!==G.year){w.yy=G.year;w.mi=0;}if(w.mi<12){w.mi++;jbMonth(p);}}catch(e){if(typeof console!=='undefined')console.error('empleo mes',e);}};}
{const _au=ageUp;ageUp=function(){const p=P;if(G&&p&&p.alive&&!p.event){try{jbEnsure(p);const w=p.job&&p.job.w;if(w){if(w.yy!==G.year){w.yy=G.year;w.mi=0;}while(w.mi<12&&p.job&&p.job.w===w){w.mi++;jbMonth(p);}if(p.job&&p.job.w===w)jbYear(p);}}catch(e){if(typeof console!=='undefined')console.error('empleo año',e);}}_au();};}
{const _ca=clockAdvance;clockAdvance=function(n,opt){const p=P;if(!p||!p.job||jbAuto()||n<=7)return _ca(n,opt);JB_NOTE=null;let done=0,rep=[],months=0;
  while(done<n){const m=monthOfDay(G.day);const k=Math.max(1,Math.min(n-done,MCUM[m+1]-G.day));const r=_ca(k,opt);done+=r.done;rep.push(...r.rep);months+=r.months;
    if(r.stop)return {done,rep,stop:r.stop,months};if(JB_NOTE)return {done,rep,stop:'oferta',months};if(!r.done||!P.alive)break;}return {done,rep,stop:null,months};};}
ACT_COST.unshift([/^💼 Convivir/,2],[/^💼 Pedir aumento/,1],[/^💼 Buscar empleo/,4],[/^💼 Postularte/,1],[/^💼 Certificación/,2],[/^💼 Vacaciones/,0],[/^💼 Sindicato/,0],[/^💼 Oferta/,0]);
// diálogos con causa del trabajo
const jbOn=p=>!!(p&&p.job&&p.job.w&&!p.ruler&&!p.prison);
D_({id:'jb_turno',cat:'trabajo',title:'Cambio de turno',cool:240,npc:p=>jbOn(p)?npc(p,'colega'):null,
 w:p=>jbOn(p)?(['noche','rotativo'].includes(jbOfi(p).tu)?.9:.35):0,
 N:{a:{t:(p,n,c,x)=>`${x.name} te detiene en el pasillo: «¿Me cubres el turno del sábado? Tengo un compromiso familiar y no lo puedo mover».`,
  o:[{t:'Cubrirlo',ok:{r:'Pierdes tu sábado, pero te lo agradece de verdad. Ahora te debe una.',fx:{ft:-2,rel:8,fav:1}}},
   {t:'Negarte con amabilidad',ok:{r:'Lo entiende, aunque se le nota la decepción.',fx:{rel:-2}}},
   {t:'Aceptar a cambio de que te cubra un día después',k:['carisma',45],ok:{r:'Trato hecho: cambian días y los dos quedan contentos.',fx:{rel:4}},ko:{r:'Le parece que estás cobrando el favor y se va molesto.',fx:{rel:-5}}}]}}});
D_({id:'jb_recorte',cat:'trabajo',title:'Rumores de recorte',cool:500,npc:p=>jbOn(p)?npc(p,'jefe'):null,
 w:p=>{if(!jbOn(p))return 0;const n=natOf(p);return (n.rec?1.2:0)+(p.job.w.pf<50?.5:0)+(p.job.w.sz===0?.2:0);},
 N:{a:{t:(p,n,c,x)=>`Corre el rumor de que en ${p.job.w.nm} habrá recorte de personal. ${x.name}, tu jefe, está más serio que de costumbre.`,
  o:[{t:'Ofrecerte a trabajar horas extra',ok:{r:'Tu jefe toma nota de tu disposición. Trabajarás más, pero te ven como indispensable.',go:p=>{const w=p.job&&p.job.w;if(w){w.h=1;w.pf=clamp(w.pf+6,0,100);}},fx:{rel:5}}},
   {t:'Hablar con tu jefe para saber dónde estás',k:['carisma',50],ok:{r:'Te confirma que tu puesto no está en riesgo. Respiras.',fx:{rel:4,s:{felicidad:3}}},ko:{r:'Esquiva la pregunta. Te quedas con la duda y con más estrés.',go:p=>{const w=p.job&&p.job.w;if(w)w.es=clamp(w.es+10,0,100);}}},
   {t:'Mandar solicitudes a otras empresas por si acaso',ok:{r:'Actualizas tu currículum y mandas solicitudes.',go:p=>{const w=p.job&&p.job.w;if(w&&!w.off&&chance(.45))jbOffer(p);}}}]}}});
D_({id:'jb_trato',cat:'trabajo',title:'Trato humillante',cool:600,npc:p=>jbOn(p)?npc(p,'jefe'):null,
 w:p=>jbOn(p)&&jbBoss(p).rel<35?1.1:0,
 N:{a:{t:(p,n,c,x)=>`En plena junta, ${x.name} se burla de tu trabajo frente a todos. No es la primera vez.`,
  o:[{t:'Aguantarte',ok:{r:'Te tragas el coraje. El estrés se acumula.',go:p=>{const w=p.job&&p.job.w;if(w)w.es=clamp(w.es+10,0,100);},fx:{s:{felicidad:-4}}}},
   {t:'Hablar con tu jefe en privado',k:['carisma',52],ok:{r:'Le dices con calma que eso no está bien. Se disculpa a medias, pero no vuelve a pasar.',fx:{rel:6}},ko:{r:'Se pone a la defensiva y te dice que no aguantas nada.',fx:{rel:-6}}},
   {t:'Reportarlo a recursos humanos con pruebas',k:['inteligencia',50],ok:{r:'Recursos humanos abre una investigación y le llaman la atención. Tus compañeros te respetan más.',fx:{rel:-8,s:{influencia:3}}},ko:{r:'Sin pruebas suficientes, el reporte no prospera y tu jefe se entera.',fx:{rel:-15}}},
   {t:'Acudir al sindicato',req:p=>!!(p.job&&p.job.w&&p.job.w.un),lock:'No hay sindicato en tu trabajo',ok:{r:'El delegado sindical habla con la empresa. El trato mejora.',fx:{rel:-3,s:{felicidad:3}}}}]}}});
D_({id:'jb_chisme',cat:'trabajo',title:'Chisme en la oficina',cool:360,npc:p=>jbOn(p)?npc(p,'colega'):null,
 w:p=>jbOn(p)&&p.job.w.cw.some(c=>c.tr==='chismoso')?.7:0,
 N:{a:{t:(p,n,c,x)=>`${x.name} te cuenta que alguien anda diciendo que te vas a ir de la empresa. Varios ya lo creen.`,
  o:[{t:'Desmentirlo delante de todos',k:['carisma',45],ok:{r:'Lo aclaras con buen humor y el chisme se apaga.',fx:{s:{influencia:2}}},ko:{r:'Se nota que te afectó y el chisme crece.',fx:{s:{felicidad:-3}}}},
   {t:'Ignorarlo',ok:{r:'En unas semanas nadie se acuerda.',fx:{}}},
   {t:'Averiguar quién lo empezó',k:['inteligencia',45],ok:{r:'Descubres que fue alguien del área de al lado. Le dejas claro que lo sabes.',fx:{rel:3}},ko:{r:'Preguntas de más y ahora el chisme eres tú.',fx:{rel:-3}}}]}}});
D_({id:'jb_proyecto',cat:'trabajo',title:'Proyecto urgente',cool:300,npc:p=>jbOn(p)?npc(p,'jefe'):null,
 w:p=>jbOn(p)&&(jbBoss(p).rel>=55||p.job.w.pf>=65)?.8:0,
 N:{a:{t:(p,n,c,x)=>`${x.name} te llama a su oficina: «Tenemos un proyecto urgente para el viernes y quiero que lo lleves tú».`,
  o:[{t:'Aceptarlo',ok:{r:'Trabajas hasta tarde toda la semana, pero lo entregas a tiempo. Tu jefe queda impresionado.',go:p=>{const w=p.job&&p.job.w;if(w){w.pf=clamp(w.pf+8,0,100);w.es=clamp(w.es+14,0,100);}},fx:{rel:8,ft:-3}}},
   {t:'Aceptarlo si te asignan apoyo',k:['carisma',48],ok:{r:'Te dan a alguien del equipo. Sale bien y sin desvelarte tanto.',go:p=>{const w=p.job&&p.job.w;if(w){w.pf=clamp(w.pf+5,0,100);w.es=clamp(w.es+5,0,100);}},fx:{rel:5}},ko:{r:'No hay gente disponible. Lo sacas solo y a marchas forzadas.',go:p=>{const w=p.job&&p.job.w;if(w){w.pf=clamp(w.pf+4,0,100);w.es=clamp(w.es+16,0,100);}}}},
   {t:'Rechazarlo con argumentos',k:['inteligencia',50],ok:{r:'Le explicas que hoy no podrías hacerlo bien. Lo entiende y se lo da a otro.',fx:{rel:-2}},ko:{r:'Le suena a excusa.',fx:{rel:-8}}}]}}});
