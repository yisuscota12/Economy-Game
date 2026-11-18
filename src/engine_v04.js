/* ===== v0.4: provincias, inversiones, negocio, personas, escuela, bienes, ambiciones, logros, periódico ===== */
/* ----- edificios por provincia ----- */
const BLD={
 carr:{n:'Carreteras',ic:'🛣️',c:.035,max:3,d:'+0.5 % de crecimiento al año por nivel'},
 fab:{n:'Zona industrial',ic:'🏭',c:.05,max:3,d:'+0.7 % de crecimiento por nivel y más empleo'},
 esc:{n:'Escuelas y universidad',ic:'🏫',c:.03,max:3,d:'+Inteligencia para quien vive ahí; +0.3 % de crecimiento'},
 hosp:{n:'Hospitales',ic:'🏥',c:.035,max:3,d:'−8 % de mortalidad por nivel para quien vive ahí; +estabilidad'},
 puerto:{n:'Puerto',ic:'⚓',c:.045,max:2,d:'+0.6 % de crecimiento por comercio (solo costa)',coast:1},
 fort:{n:'Fortaleza',ic:'🏰',c:.04,max:3,d:'Cada nivel da 30 % de probabilidad de resistir un ataque'}
};
const bl=(r,k)=>{const x=G.regions[r];return (x&&x.b&&x.b[k])||0;};
const bldTotal=r=>{const x=G.regions[r];return x&&x.b?Object.values(x.b).reduce((s,v)=>s+v,0):0;};
const bldCost=(r,k)=>G.regions[r].gdp*BLD[k].c*(1+bl(r,k)*.6);
const provBonus=r=>{const x=G.regions[r];if(!x)return 0;let b=x.b?(.5*(x.b.carr||0)+.7*(x.b.fab||0)+.3*(x.b.esc||0)+.6*(x.b.puerto||0)+.4*(x.b.taller||0))/100:0;if(typeof provBonus9==='function')b+=provBonus9(r,x);return b;};
function canBuild(r,k){return bl(r,k)<BLD[k].max&&(!BLD[k].coast||RG[r].co);}
function build(r,k){const x=G.regions[r];x.b=x.b||{};x.b[k]=(x.b[k]||0)+1;if(k==='hosp'||k==='esc')G.nations[x.o].stab=clamp(G.nations[x.o].stab+.5,0,100);}
function aiBuild(n){if(playerRules(n.id)||!chance(.35))return;const rs=regionsOf(n.id);if(!rs.length)return;const r=pick(rs);const k=pick(Object.keys(BLD));if(canBuild(r,k))build(r,k);}
function treasuryIncome(n){return n.gdp*.006*(isReal()?clamp(N0[n.id].tax/15,.5,1.6):1);}

/* ----- inversiones personales y negocio propio ----- */
const INV={neg:{n:'Negocio local (socio)',d:'Rinde según la economía de la provincia; 4 % de riesgo anual de quiebra'},inm:{n:'Propiedad / terreno',d:'Se revaloriza con la provincia y deja 3 % de renta al año'}};
const BIZT=[{n:'Puesto de comida',ic:'🌮'},{n:'Tienda de abarrotes',ic:'🛒'},{n:'Taller mecánico',ic:'🔧'},{n:'Empresa de software',ic:'💻'}];
const BIZL=['Pequeño','Local establecido','Cadena regional','Corporativo nacional'];
const BIZR=[.55,1.5,4.5,14],BIZUP=[0,2.2,11,45];
function invest(p,r,t,amt){p.dinero-=amt;p.inv.push({r,t,amt,val:amt,y:G.year});}
function sellInv(p,i){const v=p.inv[i];const k=v.t==='inm'?.95:.8;p.dinero+=v.val*k;p.inv.splice(i,1);return v.val*k;}
function bizRevenue(p){const b=p.biz;if(!b)return 0;const reg=G.regions[b.r];return U(p)*BIZR[b.lvl]*(b.luck||1)*(1+((reg&&reg.gl)||.02)*4);}
function onTransfer(rid,from,to){
  if(!P||!P.alive)return;
  P.inv=P.inv.filter(v=>{if(v.r!==rid)return true;if(chance(.3)){log(`El nuevo gobierno de ${G.nations[to].name} expropia tu inversión en ${RG[rid].nm} (${fmt(v.val)}).`,'bad');return false;}return true;});
  if(P.biz&&P.biz.r===rid&&chance(.25)){log(`Tu negocio en ${RG[rid].nm} es expropiado tras la conquista.`,'bad');P.biz=null;}
}
/* ----- bienes ----- */
const CARS=[{n:'Auto usado',k:.45,h:1},{n:'Sedán nuevo',k:1.4,h:2,ap:1},{n:'Camioneta de lujo',k:5,h:4,ap:3},{n:'Deportivo',k:14,h:6,ap:5}];
/* ----- personas con memoria ----- */
let PID=1;
function newPerson(k,p,o){const c=o&&o.c||cultOf(natOf(p).id);const sex=o&&o.sex||(chance(.5)?'M':'F');
  return {id:'n'+(Date.now()%1e6)+'_'+(PID++),k,name:rndFirst(sex,c)+' '+rndSur(c),sex,age:o&&o.age!=null?o.age:Math.max(0,p.age+RI(-2,2)),rel:o&&o.rel||RI(45,70),c,iy:0,mem:[]};}
const KIND={amigo:'Amigo',rival:'Rival',jefe:'Jefe',maestro:'Maestro',mentor:'Mentor'};
function allPeople(p){const a=[];
  p.parents.forEach(x=>x.alive&&a.push({ref:x,k:x.role==='Madre'?'madre':'padre'}));
  if(p.partner)a.push({ref:p.partner,k:'pareja'});
  p.children.forEach(x=>a.push({ref:x,k:'hijo'}));
  p.siblings.forEach(x=>a.push({ref:x,k:'hermano'}));
  p.ppl.forEach(x=>a.push({ref:x,k:x.k}));return a;}
function interactions(p,it){const x=it.ref,k=it.k,T=U(p),done=x.iy===G.year;const a=[];
  const add=(t,s,can,fn)=>a.push({t,s,can:can&&!done&&!p.prison,fn});
  x.rel=x.rel==null?60:x.rel;
  add('Conversar','+Relación',true,()=>{x.rel+=RI(3,7);return `Platicas un buen rato con ${x.name}.`;});
  add('Pasar tiempo juntos','+Relación, +Felicidad',true,()=>{x.rel+=RI(6,11);p.s.felicidad+=2;return `Pasas la tarde con ${x.name}.`;});
  add(`Hacer un regalo (${fmt(.05*T)})`,'+Relación',p.age>=10,()=>{p.dinero-=.05*T;x.rel+=RI(9,15);return `A ${x.name} le encanta tu regalo.`;});
  if((k==='padre'||k==='madre')&&p.age<35)add('Pedir dinero','Si la relación es buena',true,()=>{if(x.rel>55&&chance(.7)){const m=R(.1,.5)*T;p.dinero+=m;x.rel-=4;return `${x.name} te da ${fmt(m)}.`;}x.rel-=6;return `${x.name} se niega.`;});
  if(k==='amigo'||k==='mentor')add('Pedir un favor','Contactos: +Influencia (relación 70+)',p.age>=16,()=>{if(x.rel>=70){p.s.influencia+=RI(3,6);x.rel-=5;return `${x.name} te presenta a gente importante.`;}x.rel-=3;return `${x.name} no puede ayudarte ahora.`;});
  if(k==='rival'){add('Hacer las paces','Puede volverse amigo',true,()=>{if(chance(.35+x.rel/200)){x.k='amigo';x.rel=55;return `Haces las paces con ${x.name}. Ahora es tu amigo.`;}x.rel-=3;return `${x.name} rechaza la tregua.`;});
    add('Exhibirlo en público','+Influencia, puede salir mal',p.age>=14,()=>{if(chance(.55)){p.s.influencia+=RI(3,6);x.rel-=15;return `Dejas en ridículo a ${x.name}.`;}p.s.influencia-=4;return `${x.name} te devuelve el golpe.`;});}
  if(k==='jefe')add('Pedir aumento','Relación 60+',!!p.job||!!p.career.track,()=>{if(x.rel>=60&&chance(.55)){if(p.job)p.job.bonus=(p.job.bonus||1)*1.12;else p.career.years+=1;x.rel-=5;return `${x.name} aprueba tu aumento.`;}x.rel-=8;return `${x.name} dice que no.`;});
  if(k==='pareja'||k==='hijo'||k==='hermano'||k==='padre'||k==='madre'||k==='amigo')add('Discutir','−Relación',true,()=>{x.rel-=RI(8,14);if(chance(.3)){p.s.felicidad+=3;return `Le dices sus verdades a ${x.name}. Te desahogas.`;}p.s.felicidad-=3;return `Discutes feo con ${x.name}.`;});
  if(k==='amigo')add('Dejar de hablarle','Termina la amistad',true,()=>{p.ppl=p.ppl.filter(y=>y!==x);return `Te alejas de ${x.name}.`;});
  a.forEach(o=>{const f=o.fn;o.fn=()=>{const r=f();x.iy=G.year;x.rel=clamp(Math.round(x.rel),0,100);fix(p);return r;};});
  return a;}

/* ----- escuela ----- */
const CLUBS={deportes:{n:'Deportes',d:'+Salud, +Apariencia'},debate:{n:'Debate',d:'+Influencia, +Inteligencia'},musica:{n:'Música',d:'+Felicidad'},ciencias:{n:'Ciencias',d:'+Inteligencia'}};
function uniAdmit(p){const g=p.sch?p.sch.g:7;return clamp((g-5)/4+p.s.inteligencia/220,.08,.97);}
function schoolYear(p){
  if(p.age<6||p.age>17||!p.sch)return;
  const tgt=4.5+p.s.inteligencia/22+(p._studied?1:0)+(p.sch.club==='ciencias'?.3:0)+R(-.9,.9);
  p.sch.g=clamp(Math.round((p.sch.g*.5+tgt*.5)*10)/10,5,10);p._studied=false;
  const c=p.sch.club;if(c==='deportes'){p.s.salud+=1;p.s.apariencia+=1;}else if(c==='debate'){p.s.influencia+=1;p.s.inteligencia+=.5;}else if(c==='musica')p.s.felicidad+=2;else if(c==='ciencias')p.s.inteligencia+=1;
  if(p.age===12)log(`Terminas la primaria con promedio de ${p.sch.g}.`,'good');
  if(p.age===15)log(`Terminas la secundaria con promedio de ${p.sch.g}.`,'good');
  if(p.age===17){p.sch.fin=p.sch.g;if(p.sch.g>=9)p.sch.beca=1;log((p.sch.beca?`Terminas la preparatoria con promedio de ${p.sch.g} y ganas una beca universitaria.`:`Terminas la preparatoria con promedio de ${p.sch.g}.`),'good');}
}

/* ----- ambiciones y logros ----- */
const AMB={poder:{n:'Poder',d:'Gobernar tu país',ok:p=>p.ruler},riqueza:{n:'Riqueza',d:'Patrimonio de 100 salarios medios',ok:p=>netWorth(p)>=100*U(p)},
 familia:{n:'Familia',d:'Casarte y tener 3 hijos',ok:p=>p.married&&p.children.length>=3},saber:{n:'Conocimiento',d:'Dos títulos o Inteligencia 95',ok:p=>(p.edu.degrees||[]).length>=2||p.s.inteligencia>=95},
 imperio:{n:'Imperio',d:'Anexar 10 provincias como gobernante',ok:p=>(p.annexed||0)>=10}};
const ACH=[
 ['millonario','Millonario','Patrimonio de 1 millón de dólares',p=>netWorth(p)>=1e6],
 ['presidente','Jefe de Estado','Gobernar un país',p=>p.ruler],
 ['dictador','Mano de hierro','Gobernar como dictador',p=>p.ruler&&natOf(p).gov==='dictadura'],
 ['general','General','Llegar a General',p=>p.career.track==='militar'&&p.career.rank===6],
 ['magnate','Magnate','Llegar a Magnate',p=>p.career.track==='negocios'&&p.career.rank===4],
 ['conquistador','Conquistador','Anexar 10 provincias',p=>(p.annexed||0)>=10],
 ['obras','Constructor','Construir 10 edificios en provincias',p=>(p.built||0)>=10],
 ['inversionista','Inversionista','Tener 5 inversiones a la vez',p=>p.inv.length>=5],
 ['empresario','Del puesto a la cadena','Llevar tu negocio a cadena regional',p=>p.biz&&p.biz.lvl>=2],
 ['honores','Cuadro de honor','Terminar la prepa con 9.5 o más',p=>p.sch&&p.sch.fin>=9.5],
 ['familia','Familia numerosa','Tener 4 hijos',p=>p.children.length>=4],
 ['centenario','Centenario','Llegar a los 100 años',p=>p.age>=100],
 ['emigrante','Emigrante','Vivir en otro país',p=>regOf(p).w0!==p.born],
 ['popular','Alma de la fiesta','Tener 5 amigos con relación de 80+',p=>p.ppl.filter(x=>x.k==='amigo'&&x.rel>=80).length>=5],
 ['dinastia','Dinastía','Llegar a la 3.ª generación',p=>p.gen>=3]];
function checkAch(p){G.ach=G.ach||{};ACH.forEach(([id,n,d,ok])=>{if(!p.ach.includes(id)&&ok(p)){p.ach.push(id);G.ach[id]=1;log(`🏅 Logro: ${n} — ${d}.`,'big');}});
  if(p.amb&&!p.ambOk&&AMB[p.amb].ok(p)){p.ambOk=G.year;p.s.felicidad+=15;log(`⭐ Cumpliste tu ambición: ${AMB[p.amb].n}.`,'big');}}
const legacy=p=>Math.round(p.ach.length*10+Math.max(0,Math.log10(Math.max(1,netWorth(p)/U(p))))*12+p.children.length*4+(p.ruler?25:0)+(p.ambOk?20:0)+(p.annexed||0)*2);

/* ----- migración de partidas v0.3 ----- */
function migrateP(p){if(!p)return;p.inv=p.inv||[];p.ppl=p.ppl||[];p.assets=p.assets||[];p.ach=p.ach||[];p.sch=p.sch||{g:7,club:null};p.born=p.born||regOf(p).w0;if(p.biz===undefined)p.biz=null;p.edu.degrees=p.edu.degrees||(p.edu.degree?[p.edu.degree]:[]);}

/* ----- turno anual de los sistemas nuevos ----- */
function yearV04(p){
  const real=isReal(),T=U(p);
  schoolYear(p);
  if(p.age>=6&&p.age<=25)p.s.inteligencia+=bl(p.r,'esc')*R(0,.7);
  // inversiones
  p.inv.forEach(v=>{const reg=G.regions[v.r];const g=(reg&&reg.gl)||.02;
    if(v.t==='neg'){v.val*=1+g*1.5+R(-.09,.17);if(chance(.04)){v.val*=.25;log(`El negocio en el que invertiste en ${RG[v.r].nm} quiebra. Tu parte vale ${fmt(v.val)}.`,'bad');}}
    else{v.val*=1+g+(real?G.nations[reg.o].infl/100:0)+R(-.03,.04);p.dinero+=v.val*.03;}});
  // negocio propio
  if(p.biz){p.biz.luck=clamp((p.biz.luck||1)*R(.85,1.18),.4,1.8);const rev=bizRevenue(p);const net=rev*(real?.8:1);p.dinero+=net;p.biz.last=net;
    if(p.biz.luck<.5&&chance(.25)){log(`Tu ${BIZT[p.biz.t].n.toLowerCase()} cierra por pérdidas.`,'bad');p.biz=null;}}
  // bienes
  p.assets.forEach(a=>{a.val*=.88;p.s.felicidad+=CARS[a.ci].h*.3;});
  // personas
  p.ppl.forEach(x=>{x.age++;x.rel+=R(-4,1.5);});
  p.ppl=p.ppl.filter(x=>{if(x.age>60&&chance(.004*Math.pow(1.09,x.age-60))){log(`Muere ${x.name}, tu ${KIND[x.k].toLowerCase()}, a los ${x.age} años.`,'bad');p.s.felicidad-=x.rel>60?8:2;return false;}
    if(x.k==='amigo'&&x.rel<15){log(`Pierdes contacto con ${x.name}.`);return false;}return true;});
  p.ppl.forEach(x=>x.rel=clamp(Math.round(x.rel),0,100));
  if(p.job&&!p.ppl.some(x=>x.k==='jefe'))p.ppl.push(newPerson('jefe',p,{age:p.age+RI(5,20)}));
  if(!p.job&&!p.career.track)p.ppl=p.ppl.filter(x=>x.k!=='jefe');
  checkAch(p);
}
/* ----- periódico del año ----- */
function makePaper(p,yearLog,yearNews){
  const me=natOf(p).name;
  const ns=new Set(yearNews);const pers=yearLog.filter(l=>(l.c==='big'||l.c==='good'||l.c==='bad')&&!ns.has(l.t)).map(l=>l.t);
  const nat=yearNews.filter(t=>t.includes(me));const world=yearNews.filter(t=>!t.includes(me));
  const imp=pers.some(t=>/Logro|ambición|gobiernas|Ascenso|Naces|Te gradúas|conquist|Muere tu|prisión|bancarrota|elección|guerra/i.test(t))||nat.length>0||world.some(t=>/guerra|desaparece|Golpe|pandemia/i.test(t));
  return {imp,y:G.year,pers:pers.slice(-3),nat:nat.slice(0,3),world:world.slice(0,3)};
}
/* ----- eventos nuevos ----- */
const isMexCult=p=>cultOf(natOf(p).id)==='hisp';
EV.push(
 {id:'ambicion',prio:1,pr:1,when:p=>p.age>=16&&p.age<=19&&!p.amb,text:p=>'Ya casi eres adulto. ¿Qué quieres lograr en la vida?',
  opts:p=>Object.entries(AMB).map(([k,a])=>({t:`${a.n}: ${a.d}`,go:p=>{p.amb=k;return `Tu ambición: ${a.n}.`;}}))},
 {id:'amigo_nuevo',pr:1.4,when:p=>p.age>=6&&p.age<=55&&p.ppl.filter(x=>x.k==='amigo').length<6,text:p=>{p._np=newPerson('amigo',p);return (p.age<18?`${p._np.name} quiere ser tu amigo en la escuela.`:`${p._np.name} quiere ser tu amigo.`);},
  opts:p=>[{t:'Hacerse amigos',go:p=>{p.ppl.push(p._np);return `Ahora ${p._np.name} es tu amigo.`;}},{t:'No te interesa',go:p=>'Prefieres tu espacio.'}]},
 {id:'rival_nuevo',pr:.7,when:p=>p.age>=10&&!p.ppl.some(x=>x.k==='rival'),text:p=>{p._np=newPerson('rival',p,{rel:RI(15,30)});return `${p._np.name} empieza a competir contigo en todo.`;},
  opts:p=>[{t:'Aceptar el reto',go:p=>{p.ppl.push(p._np);p.s.influencia+=2;return `${p._np.name} es ahora tu rival.`;}},{t:'Tratar de hacerte su amigo',go:p=>{if(chance(.5)){p._np.k='amigo';p._np.rel=50;p.ppl.push(p._np);return 'Terminan siendo amigos.';}p.ppl.push(p._np);return 'No funciona: te ve como rival.';}}]},
 {id:'maestro',pr:.8,when:p=>p.age>=9&&p.age<=17&&!p.ppl.some(x=>x.k==='maestro'),text:p=>{p._np=newPerson('maestro',p,{age:RI(30,55),rel:60});return `${p._np.name}, tu maestro, ve potencial en ti.`;},
  opts:p=>[{t:'Pedirle consejo',go:p=>{p.ppl.push(p._np);p.s.inteligencia+=3;return 'Sus consejos te abren la mente.';}},{t:'Ignorarlo',go:p=>'Sigues a tu ritmo.'}]},
 {id:'examen',pr:1,when:p=>p.age>=8&&p.age<=17,text:p=>'Mañana hay examen final y no has estudiado.',
  opts:p=>[{t:'Desvelarte estudiando',go:p=>{p.sch.g=clamp(p.sch.g+.4,5,10);p.s.salud-=1;return 'Sacas buena calificación.';}},{t:'Copiar',go:p=>{if(chance(.3)){p.sch.g=clamp(p.sch.g-.8,5,10);p.s.felicidad-=5;return 'Te cachan copiando: te reprueban.';}p.sch.g=clamp(p.sch.g+.2,5,10);return 'Nadie se da cuenta.';}},{t:'Confiar en tu suerte',go:p=>{if(chance(p.s.inteligencia/110)){return 'Pasas de panzazo.';}p.sch.g=clamp(p.sch.g-.4,5,10);return 'Repruebas.';}}]},
 {id:'feria_ciencias',pr:.8,when:p=>p.age>=11&&p.age<=17,text:p=>'Hay una feria de ciencias en tu escuela.',
  opts:p=>[{t:'Presentar un proyecto',go:p=>{if(chance(p.s.inteligencia/120+.1)){p.s.inteligencia+=3;p.s.influencia+=2;return '¡Ganas el primer lugar!';}p.s.inteligencia+=1;return 'No ganas, pero aprendes mucho.';}},{t:'Solo ir a ver',go:p=>'Ves proyectos increíbles.'}]},
 {id:'muertos',pr:.9,when:p=>isMexCult(p)&&p.age>=4,text:p=>'Llega el Día de Muertos. Tu familia arma el altar.',
  opts:p=>[{t:'Poner el altar con tus seres queridos',go:p=>{p.s.felicidad+=5;p.parents.forEach(x=>x.alive&&(x.rel+=3));return 'Cempasúchil, pan de muerto y recuerdos. Un día especial.';}},{t:'Ir al desfile',go:p=>{p.s.felicidad+=4;p.s.apariencia+=1;return 'Te maquillas de catrina y disfrutas el desfile.';}}]},
 {id:'posada',pr:.8,when:p=>isMexCult(p)&&p.age>=5,text:p=>'Te invitan a una posada navideña en la colonia.',
  opts:p=>[{t:'Ir y romper la piñata',go:p=>{p.s.felicidad+=4;if(chance(.4)&&p.ppl.filter(x=>x.k==='amigo').length<6){const f=newPerson('amigo',p);p.ppl.push(f);return `Conoces a ${f.name}. Se hacen amigos.`;}return 'Ponche, tamales y villancicos.';}},{t:'Quedarte en casa',go:p=>'Prefieres descansar.'}]},
 {id:'quince',prio:1,pr:1,when:p=>isMexCult(p)&&p.sex==='F'&&p.age===15,text:p=>'Cumples 15 años. Tu familia quiere hacerte una fiesta de XV años.',
  opts:p=>[{t:`Fiesta grande (${fmt(.6*U(p))})`,go:p=>{p.dinero-=.6*U(p);p.parents.forEach(x=>x.alive&&(x.rel+=6));p.s.felicidad+=10;p.s.influencia+=3;return '¡Una fiesta inolvidable con chambelanes y vals!';}},{t:'Mejor un viaje',go:p=>{p.s.felicidad+=8;p.s.inteligencia+=2;return 'Prefieres conocer otro lugar. Un gran viaje familiar.';}}]},
 {id:'mundial',prio:1,pr:1,when:p=>G.year===2027&&['MEX','USA','CAN'].includes(natOf(p).id),text:p=>`El Mundial 2026 se jugó en ${natOf(p).name}. Tu familia aún habla del partido al que fueron.`,
  opts:p=>[{t:'Guardar el boleto de recuerdo',go:p=>{p.s.felicidad+=4;return 'Un recuerdo para toda la vida.';}}]},
 {id:'remesas',pr:.7,when:p=>['MEX','GTM','HND','SLV','NIC','DOM','COL','ECU','PER','HTI','JAM'].includes(regOf(p).w0)&&p.age>=10&&p.age<=40,text:p=>{const c=pick(['tu tío','tu prima','tu hermano mayor','un primo']);p._who=c;return {'tu tío':'Tu tío, que trabaja en Estados Unidos, manda dinero a la familia.','tu prima':'Tu prima, que trabaja en Estados Unidos, manda dinero a la familia.','tu hermano mayor':'Tu hermano mayor, que trabaja en Estados Unidos, manda dinero a la familia.','un primo':'Un primo que trabaja en Estados Unidos manda dinero a la familia.'}[c];},
  opts:p=>[{t:'Ahorrarlo',go:p=>{const m=.15*U(p);p.dinero+=m;return `Ahorras ${fmt(m)}.`;}},{t:'Invertirlo en la casa',go:p=>{p.s.felicidad+=4;return 'Arreglan la casa de la familia.';}}]},
 {id:'tianguis',pr:.7,when:p=>isMexCult(p)&&p.age>=18&&!p.biz,text:p=>'Un amigo vende su puesto en el tianguis. Te lo deja barato.',
  opts:p=>[{t:`Comprarlo (${fmt(.25*U(p))})`,go:p=>{p.dinero-=.25*U(p);p.biz={t:0,lvl:0,r:p.r,luck:1,y:G.year};return 'Ahora tienes tu propio puesto. ¡A vender!';}},{t:'No, gracias',go:p=>'Lo piensas, pero no.'}]},
 {id:'amigo_trabajo',prio:1,pr:.5,gap:5,when:p=>p.age>=18&&!p.job&&!p.career.track&&!p.edu.uni&&!p.ruler&&!p.prison&&p.ppl.some(x=>x.k==='amigo'&&x.rel>=70),
  text:p=>{const f=p.ppl.filter(x=>x.k==='amigo'&&x.rel>=70).sort((a,b)=>b.rel-a.rel)[0];p._f=f;return `${f.name} te recomienda para un trabajo de oficina en su empresa.`;},
  opts:p=>[{t:'Aceptar',go:p=>{p.job={name:'Oficinista',o:'4',k:1,bonus:1.1};p._f.rel+=5;return `Gracias a ${p._f.name}, consigues trabajo.`;}},{t:'Rechazar',go:p=>'Prefieres buscar por tu cuenta.'}]},
 {id:'amigo_presta',prio:1,pr:.5,gap:6,when:p=>p.dinero<-.3*U(p)&&p.ppl.some(x=>(x.k==='amigo'||x.k==='mentor')&&x.rel>=72),
  text:p=>{const f=p.ppl.filter(x=>x.rel>=72&&(x.k==='amigo'||x.k==='mentor'))[0];p._f=f;return `${f.name} sabe que estás en aprietos y te ofrece un préstamo sin intereses.`;},
  opts:p=>[{t:'Aceptar',go:p=>{const m=.6*U(p);p.dinero+=m;p._f.rel-=3;return `${p._f.name} te presta ${fmt(m)}.`;}},{t:'Por orgullo, no',go:p=>{p.s.felicidad-=2;return 'Prefieres arreglártelas solo.';}}]},
 {id:'rival_sabotaje',pr:1,when:p=>p.ppl.some(x=>x.k==='rival'&&x.rel<25)&&(p.career.track||p.biz),text:p=>{const r=p.ppl.find(x=>x.k==='rival'&&x.rel<25);p._f=r;return `Tu rival ${r.name} difunde rumores para hundirte.`;},
  opts:p=>[{t:'Desmentirlo con pruebas',go:p=>{if(chance(.5+p.s.inteligencia/300)){p.s.influencia+=4;p._f.rel-=5;return 'Lo desmientes y quedas mejor parado.';}p.s.influencia-=6;return 'Nadie te cree.';}},{t:'Ignorarlo',go:p=>{p.s.influencia-=3;if(p.biz)p.biz.luck*=.9;return 'Los rumores te cuestan algo de reputación.';}}]},
 {id:'jefe_tension',pr:1,when:p=>p.ppl.some(x=>x.k==='jefe'&&x.rel<25)&&p.job,text:p=>{const j=p.ppl.find(x=>x.k==='jefe');p._f=j;return `Tu jefe, ${j.name}, te tiene en la mira.`;},
  opts:p=>[{t:'Esforzarte el doble',go:p=>{p._f.rel+=12;p.s.salud-=2;return 'Mejoras tu relación con tu jefe.';}},{t:'Buscar otro trabajo',go:p=>{if(chance(.5)){p.job.bonus=(p.job.bonus||1)*1.1;p.ppl=p.ppl.filter(x=>x!==p._f);return 'Encuentras otro empleo un poco mejor pagado.';}return 'No encuentras nada mejor.';}},{t:'Encararlo',go:p=>{if(chance(.4)){p.job=null;return 'Te despiden.';}p._f.rel+=8;return 'Aclaran las cosas.';}}]},
 {id:'boda_amigo',pr:.8,when:p=>p.age>=22&&p.age<=50&&p.ppl.some(x=>x.k==='amigo'),text:p=>{const f=pick(p.ppl.filter(x=>x.k==='amigo'));p._f=f;return `${f.name} se casa y te invita como padrino.`;},
  opts:p=>[{t:`Aceptar (${fmt(.08*U(p))})`,go:p=>{p.dinero-=.08*U(p);p._f.rel+=12;p.s.felicidad+=4;return 'Una boda muy divertida.';}},{t:'Ir solo como invitado',go:p=>{p._f.rel+=3;return 'Disfrutas la fiesta.';}}]},
 {id:'nieto',pr:1,when:p=>p.children.some(c=>c.age>=24)&&p.age>=45,text:p=>{const c=pick(p.children.filter(c=>c.age>=24));p._c=c;return (p.sex==='F'?`${c.name} te da la noticia: ¡vas a ser abuela!`:`${c.name} te da la noticia: ¡vas a ser abuelo!`);},
  opts:p=>[{t:'Celebrar en familia',go:p=>{p.s.felicidad+=10;p._c.rel=(p._c.rel||60)+8;p.grand=(p.grand||0)+1;return 'Nace tu nieto.';}}]},
 {id:'cripto',pr:.6,when:p=>p.age>=20&&p.dinero>.5*U(p),text:p=>'Todos hablan de una criptomoneda que se dispara.',
  opts:p=>[{t:'Meter 20 % de tus ahorros',go:p=>{const x=p.dinero*.2;if(chance(.4)){p.dinero+=x*R(.5,3);return 'Vendes a tiempo y ganas bien.';}p.dinero-=x*R(.6,.95);return 'Se desploma. Pierdes casi todo lo que metiste.';}},{t:'No caer en la moda',go:p=>'Sigues con tus ahorros tranquilos.'}]},
 {id:'piramide',pr:.5,when:p=>p.age>=25&&p.dinero>U(p),text:p=>'Un conocido te ofrece "duplicar tu dinero en 6 meses".',
  opts:p=>[{t:'Invertir',go:p=>{const x=p.dinero*.3;p.dinero-=x;return `Era un fraude piramidal. Pierdes ${fmt(x)}.`;}},{t:'Desconfiar',go:p=>{p.s.inteligencia+=1;return 'Meses después, el esquema se cae. Te salvaste.';}}]},
 {id:'choque',pr:1,when:p=>p.assets.length>0,text:p=>'Un conductor se pasa el alto y choca tu auto.',
  opts:p=>[{t:'Arreglarlo con el seguro',go:p=>{p.dinero-=.05*U(p);return 'Pagas el deducible y queda como nuevo.';}},{t:'Pelear en la calle',go:p=>{if(chance(.3)){p.s.salud-=8;return 'La discusión termina en golpes.';}p.dinero+=.1*U(p);return 'El otro conductor te paga en efectivo.';}}]},
 {id:'oferta_negocio',pr:1,when:p=>p.biz&&p.biz.lvl>=1,text:p=>{p._o=bizRevenue(p)*R(2.5,5);return `Una empresa grande quiere comprar tu negocio por ${fmt(p._o)}.`;},
  opts:p=>[{t:'Vender',go:p=>{p.dinero+=p._o;p.biz=null;p.s.felicidad+=5;return 'Vendes tu negocio y cobras una buena suma.';}},{t:'No está en venta',go:p=>{p.s.influencia+=2;return 'Decides seguir creciendo.';}}]},
 {id:'huelga',pr:.7,when:p=>p.job&&p.job.o!=='2',text:p=>'Tus compañeros convocan a huelga por mejores salarios.',
  opts:p=>[{t:'Unirte',go:p=>{if(chance(.55)){p.job.bonus=(p.job.bonus||1)*1.1;return 'La huelga gana: suben los salarios 10 %.';}if(chance(.3)){p.job=null;return 'La empresa despide a los huelguistas.';}return 'No consiguen nada.';}},{t:'Seguir trabajando',go:p=>{const j=p.ppl.find(x=>x.k==='jefe');if(j)j.rel+=8;return 'Tu jefe lo nota.';}}]},
 {id:'voluntario',pr:.6,when:p=>p.age>=15,text:p=>'Buscan voluntarios para reforestar un cerro.',
  opts:p=>[{t:'Ir el fin de semana',go:p=>{p.s.felicidad+=4;p.s.salud+=2;p.s.influencia+=1;return 'Plantas 50 árboles.';}},{t:'No tienes tiempo',go:p=>'Será la próxima.'}]},
 {id:'idioma',pr:.6,when:p=>p.age>=14&&p.age<=50,text:p=>'Te ofrecen un curso intensivo de inglés.',
  opts:p=>[{t:`Tomarlo (${fmt(.06*U(p))})`,go:p=>{p.dinero-=.06*U(p);p.s.inteligencia+=3;if(p.job)p.job.bonus=(p.job.bonus||1)*1.04;return 'Mejoras tu inglés: te abre puertas.';}},{t:'Después',go:p=>'Lo dejas para después.'}]},
 {id:'maraton',pr:.5,when:p=>p.age>=18&&p.age<=65&&p.s.salud>=55,text:p=>'Hay un maratón en tu ciudad.',
  opts:p=>[{t:'Correrlo',go:p=>{if(chance(p.s.salud/120)){p.s.salud+=4;p.s.felicidad+=6;return '¡Lo terminas!';}p.s.salud-=3;return 'Te lesionas en el km 30.';}},{t:'Ir a animar',go:p=>{p.s.felicidad+=2;return 'Gran ambiente.';}}]},
 {id:'padres_cuidado',pr:1,when:p=>p.age>=35&&p.parents.some(x=>x.alive&&x.age>=72),text:p=>{const x=p.parents.find(x=>x.alive&&x.age>=72);p._f=x;return x.role==='Madre'?`Tu madre, ${x.name}, ya necesita cuidados.`:`Tu padre, ${x.name}, ya necesita cuidados.`;},
  opts:p=>[{t:'Llevarlo a vivir contigo',go:p=>{p._f.rel+=12;p.s.felicidad-=2;return 'La familia se une más.';}},{t:`Pagar una cuidadora (${fmt(.3*U(p))}/año)`,go:p=>{p.dinero-=.3*U(p);p._f.rel+=4;return 'Contratas una cuidadora.';}},{t:'Que se encarguen tus hermanos',go:p=>{p._f.rel-=12;return 'Te reclaman en la familia.';}}]},
 {id:'hijo_uni',pr:1,when:p=>p.children.some(c=>c.age===18),text:p=>{const c=p.children.find(c=>c.age===18);p._c=c;return `${c.name} quiere ir a la universidad y te pide apoyo.`;},
  opts:p=>[{t:`Pagarle la carrera (${fmt(1.2*U(p))})`,go:p=>{p.dinero-=1.2*U(p);p._c.rel=(p._c.rel||60)+12;p._c.edu=1;return `${p._c.name} entra a la universidad.`;}},{t:'Que trabaje y estudie',go:p=>{p._c.rel=(p._c.rel||60)-5;return `${p._c.name} tendrá que esforzarse el doble.`;}}]},
 {id:'reunion',pr:.6,when:p=>p.age>=30&&p.age<=70,text:p=>'Te invitan a la reunión de exalumnos.',
  opts:p=>[{t:'Ir',go:p=>{if(chance(.5)&&p.ppl.filter(x=>x.k==='amigo').length<6){const f=newPerson('amigo',p,{age:p.age,rel:65});p.ppl.push(f);return `Retomas la amistad con ${f.name}.`;}p.s.felicidad+=3;return 'Recuerdas viejos tiempos.';}},{t:'No ir',go:p=>'Te da flojera.'}]},
 {id:'mentor',pr:.6,when:p=>p.age>=20&&p.age<=35&&(p.career.track||p.biz)&&!p.ppl.some(x=>x.k==='mentor'),text:p=>{p._np=newPerson('mentor',p,{age:p.age+RI(20,35),rel:62});return `${p._np.name}, alguien con mucha experiencia, se ofrece a ser tu mentor.`;},
  opts:p=>[{t:'Aceptar',go:p=>{p.ppl.push(p._np);p.s.influencia+=3;p.s.inteligencia+=2;return 'Aprendes de alguien que ya recorrió el camino.';}},{t:'Ir por tu cuenta',go:p=>'Prefieres aprender solo.'}]},
 {id:'inauguracion',pr:1,when:p=>p.ruler&&regionsOf(natOf(p).id).some(r=>bldTotal(r)>0),text:p=>{const r=pick(regionsOf(natOf(p).id).filter(r=>bldTotal(r)>0));p._r=r;return `Te invitan a inaugurar las obras en ${RG[r].nm}.`;},
  opts:p=>[{t:'Ir con la prensa',go:p=>{natOf(p).approval+=3;p.s.influencia+=3;return 'La inauguración sale en todos los noticieros.';}},{t:'Mandar a un ministro',go:p=>'Sigues con la agenda.'}]},
 {id:'onu',pr:.7,when:p=>p.ruler,text:p=>'Te invitan a dar un discurso en la Asamblea de las Naciones.',
  opts:p=>[{t:'Discurso conciliador',go:p=>{natOf(p).stab+=2;p.s.influencia+=3;return 'Tu discurso es aplaudido.';}},{t:'Discurso desafiante',go:p=>{natOf(p).approval+=4;if(isReal())natOf(p).sanc=Math.max(natOf(p).sanc,chance(.3)?2:0);return 'En casa te aplauden; afuera, no tanto.';}}]},
 {id:'escandalo_min',pr:.8,when:p=>p.ruler,text:p=>'Un ministro de tu gabinete aparece en un escándalo de corrupción.',
  opts:p=>[{t:'Destituirlo de inmediato',go:p=>{natOf(p).approval+=3;return 'Actúas rápido y la gente lo aprecia.';}},{t:'Defenderlo',go:p=>{natOf(p).approval-=6;p.s.influencia+=2;return 'Tu gabinete te es leal, pero la opinión pública no.';}}]},
 {id:'desastre_prov',pr:.6,when:p=>p.inv.length>0,text:p=>{const v=pick(p.inv);p._v=v;return `Inundaciones en ${RG[v.r].nm} afectan tu inversión ahí.`;},
  opts:p=>[{t:'Reconstruir (inyectar capital)',go:p=>{const c=p._v.val*.1;p.dinero-=c;return `Pones ${fmt(c)} para reconstruir.`;}},{t:'Aceptar la pérdida',go:p=>{p._v.val*=.8;return 'Tu inversión pierde 20 % de su valor.';}}]}
);
