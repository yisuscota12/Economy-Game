/* ===== v1.2b: motor de diálogo lógico =====
   Los diálogos ocurren por causas (estado de tu vida, de tu país y de tu historia con cada persona), no por sorteo plano.
   Cada persona recuerda: relación (rel), favores (fav: + te debe, − le debes), rencor (ren) e historial (hist).
   Las opciones con prueba muestran su probabilidad; el dado es visible. El azar puro vive aparte: Suerte / Mala suerte, con probabilidades reales. */
const absDay=()=>G.year*365+(G.day||0);
const RASG_NPC={honesto:'honesto',leal:'leal',generoso:'generoso',ambicioso:'ambicioso',codicioso:'codicioso',rencoroso:'rencoroso'};
const PAY_RATE={honesto:.88,generoso:.8,leal:.78,ambicioso:.55,rencoroso:.42,codicioso:.3};
function mkNPC(p,rol){const c=p.cult||cultOf(natOf(p).id),sx=pick(['M','F']);return {name:rndFirst(sx,c)+' '+rndSur(c),sex:sx,age:clamp(p.age+RI(-8,15),20,75),rol,rel:RI(40,60),tr:pick(Object.keys(RASG_NPC)),fav:0,ren:0,hist:[]};}
function npc(p,rol){p.npcs=p.npcs||{};if(!p.npcs[rol])p.npcs[rol]=mkNPC(p,rol);return p.npcs[rol];}
function npcTrait(x){if(!x.tr)x.tr=pick(Object.keys(RASG_NPC));return x.tr;}
// referencia serializable a una persona (para guardar el diálogo a medias)
function nref(p,x){if(!x)return null;if(x===p.partner)return {k:'pa'};let i=(p.children||[]).indexOf(x);if(i>=0)return {k:'ch',n:x.name};i=(p.parents||[]).indexOf(x);if(i>=0)return {k:'pr',n:x.name};
  i=(p.siblings||[]).indexOf(x);if(i>=0)return {k:'sb',n:x.name};i=(p.ppl||[]).indexOf(x);if(i>=0)return {k:'pp',n:x.name};for(const r in (p.npcs||{}))if(p.npcs[r]===x)return {k:'np',n:r};return null;}
function nget(p,r){if(!r)return null;if(r.k==='pa')return p.partner;const L={ch:p.children,pr:p.parents,sb:p.siblings,pp:p.ppl}[r.k];if(L)return (L||[]).find(x=>x.name===r.n)||null;if(r.k==='np')return (p.npcs||{})[r.n]||null;return null;}
function dPeople(p){return [p.partner,...(p.children||[]),...(p.parents||[]).filter(x=>x.alive!==false),...(p.siblings||[]),...(p.ppl||[]),...Object.values(p.npcs||{})].filter(Boolean);}
const fn1=x=>(x&&x.name||'').split(' ')[0];
const ao=(x,a,o)=>x&&x.sex==='F'?a:o;
const employed=p=>p.age>=18&&!p.ruler&&!!(p.job||(p.career&&p.career.track&&p.career.track!=='negocios'));
const hasBiz=p=>!!(p.biz);
const inPolitics=p=>p.ruler||(p.career&&p.career.track==='politica')||p.cab;
// pruebas de habilidad
const STAT_N={inteligencia:'Inteligencia',carisma:'Carisma',salud:'Salud',influencia:'Influencia',apariencia:'Apariencia',felicidad:'Ánimo'};
function statV(p,s){return s==='carisma'?p.s.apariencia*.45+p.s.felicidad*.3+p.s.influencia*.25:p.s[s];}
function chkPct(p,s,dc,b){return clamp(Math.round(50+(statV(p,s)+(b||0)-dc)*2.5),5,95);}
// efectos y resumen visible
const sgn=v=>(v>0?'+':'')+Math.round(v);
const SIC={salud:'❤️‍🩹',felicidad:'🙂',inteligencia:'🧠',apariencia:'✨',influencia:'📣'};
function dfx(p,e,c){const out=[];if(!e)return out;const x=c.npc;
  if(e.s)for(const k in e.s){p.s[k]=clamp(p.s[k]+e.s[k],0,100);out.push(`${SIC[k]||''} ${STAT_N[k]||k} ${sgn(e.s[k])}`);}
  if(e.$){p.dinero+=e.$;out.push(`💰 ${e.$>0?'+':'−'}${fmt(Math.abs(e.$))}`);}
  if(e.ft){ensureFt(p);p.ft=clamp(p.ft+e.ft,0,FTY(p));syncActs(p);out.push(`⏳ ${sgn(e.ft)} días libres`);}
  if(x&&e.rel){x.rel=clamp((x.rel==null?50:x.rel)+e.rel,0,100);out.push(`${e.rel>0?'💚':'💔'} ${fn1(x)} ${sgn(e.rel)}`);}
  if(x&&e.fav){x.fav=(x.fav||0)+e.fav;out.push(e.fav>0?(e.fav>1?`🤝 ${fn1(x)} te debe ${e.fav} favores`:`🤝 ${fn1(x)} te debe un favor`):`🤝 Saldas o debes un favor a ${fn1(x)}`);}
  if(x&&e.ren){x.ren=Math.max(0,(x.ren||0)+e.ren);out.push(e.ren>0?`😠 ${fn1(x)} te guarda rencor`:`🕊️ ${fn1(x)} te guarda menos rencor`);}
  if(e.nat){const n=natOf(p);for(const k in e.nat){if(k==='treas')n.treas=(n.treas||0)+e.nat[k];else n[k]=k==='stab'||k==='approval'?clamp(n[k]+e.nat[k],0,100):n[k]+e.nat[k];}
    out.push('🏛️ '+Object.entries(e.nat).map(([k,v])=>({stab:'Estabilidad',approval:'Aprobación',treas:'Tesoro',infl:'Inflación'}[k]||k)+' '+(k==='treas'?(v>0?'+':'−')+fmt(Math.abs(v)):sgn(v))).join(', '));}
  if(e.th){p.th=p.th||{};p.th[e.th[0]]=Object.assign({t:absDay()},e.th[1]||{});}
  if(e.thx){p.th=p.th||{};delete p.th[e.thx];}
  if(x&&e.h){(x.hist=x.hist||[]).push({y:G.year,t:e.h});if(x.hist.length>8)x.hist.shift();}
  if(e.log)log(e.log,e.lc||'');return out;}

/* ----- disparadores ----- */
const DLG=[];const DLG_RATE={baja:4,normal:8,alta:14};
const dlgRate=()=>{try{return DLG_RATE[CFG.dlg]||8;}catch(e){return 8;}};
function onCool(p,d){p.dseen=p.dseen||{};const t=p.dseen[d.id];return t!=null&&absDay()-t<(d.cool||365);}
function startDialog(p,d,c0){const n=natOf(p);const x=d.npc?d.npc(p,n):null;if(d.npc&&!x)return false;p.dseen=p.dseen||{};p.dseen[d.id]=absDay();
  const c=Object.assign({},c0||{});if(d.init)d.init(p,n,c,x);p.dlg={id:d.id,node:d.start||'a',ref:nref(p,x),c,res:null};return true;}
function dlgRoll(days){const p=P;if(!p||!p.alive||p.dlg||p.event||p.age<5||(G.calls&&G.calls.length)||G.offer)return 0;const n=natOf(p);
  // 1) suerte y mala suerte: probabilidad anual real, convertida al periodo
  for(const d of DLG){if(!d.luck||onCool(p,d))continue;let py=0;try{py=d.luck(p,n)||0;}catch(e){}if(py<=0)continue;const pr=1-Math.pow(1-py,days/365);
    if(Math.random()<pr){const roll=RI(1,100);if(startDialog(p,d,{py,roll}))return RI(1,days);}}
  // 2) diálogos con causa: el peso de las causas sube o baja la frecuencia
  const L=[];let S=0;for(const d of DLG){if(d.luck||onCool(p,d))continue;let w=0;try{w=d.w(p,n)||0;}catch(e){w=0;}if(w>0){L.push([d,w]);S+=w;}}
  if(!S)return 0;const lam=dlgRate()/365*Math.min(2.5,.5+S/6);const pr=1-Math.exp(-lam*days);if(Math.random()>=pr)return 0;
  let k=Math.random()*S,ch=L[0][0];for(const [d,w] of L){k-=w;if(k<=0){ch=d;break;}}
  if(!startDialog(p,ch))return 0;return clamp(Math.ceil(-Math.log(1-Math.random()*pr)/lam),1,days);}
// nodo actual (texto y opciones evaluadas)
function dlgNode(p){const D=p.dlg;if(!D)return null;const d=DLG.find(x=>x.id===D.id);if(!d){p.dlg=null;return null;}const n=natOf(p),x=nget(p,D.ref);const c=D.c;c.npc=x;
  const N=d.N[D.node];if(!N){p.dlg=null;return null;}const txt=typeof N.t==='function'?N.t(p,n,c,x):N.t;
  const opts=(N.o||[]).map((o,i)=>{const ok=!o.req||o.req(p,n,c,x);const k=o.k?(typeof o.k==='function'?o.k(p,n,c,x):o.k):null;
    return {i,t:typeof o.t==='function'?o.t(p,n,c,x):o.t,ok,lock:ok?null:(typeof o.lock==='function'?o.lock(p,n,c,x):o.lock||'No disponible'),k,pct:k?chkPct(p,k[0],k[1],k[2]):null};});
  return {d,N,txt,opts,x,c,luck:!!d.luck,cat:d.cat};}
// elegir opción → efectos + siguiente nodo
function dlgChoose(i){const p=P,V=dlgNode(p);if(!V)return null;const o=V.N.o[i];const vo=V.opts[i];if(!vo||!vo.ok)return null;const n=natOf(p),c=V.c,x=V.x;
  let roll=null,succ=true;if(vo.k){roll=RI(1,100);succ=roll<=vo.pct;}
  let r=succ?(o.ok||o):(o.ko||o);if(typeof r==='function')r=r(p,n,c,x);if(typeof r.fx==='function')r.fx=r.fx(p,n,c,x);
  const fx=dfx(p,r.fx,c);const text=typeof r.r==='function'?r.r(p,n,c,x):r.r;let to=typeof r.to==='function'?r.to(p,n,c,x):r.to;
  if(r.go)r.go(p,n,c,x);delete c.npc;fix(p);flushNews();
  p.dlg.res={t:text||'',fx,roll,pct:vo.pct,succ,stat:vo.k?vo.k[0]:null,to:to||null};log(`💬 ${V.d.title||''}: ${vo.t} → ${text||''}`.replace(/<[^>]+>/g,''),succ?'':'bad');
  if(p.s.salud<=0)die(p.deathCause||'por problemas de salud');return p.dlg.res;}
function dlgNext(){const p=P;if(!p.dlg)return;const to=p.dlg.res&&p.dlg.res.to;if(to&&p.alive){p.dlg.node=to;p.dlg.res=null;}else p.dlg=null;}
// el reloj se detiene ante un diálogo
{const _ca=clockAdvance;clockAdvance=function(n,opt){const p=P;if(p&&p.dlg)return {done:0,rep:[],stop:'decision',months:0};return _ca(n,opt);};}

/* ======================= BIBLIOTECA DE DIÁLOGOS ======================= */
const Ux=(p,k)=>Math.round(U(p)*k);
const kidOf=p=>(p.children||[]).filter(c=>c.age>=6&&c.age<=17).sort((a,b)=>(a.st?a.st.int:50)-(b.st?b.st.int:50))[0]||null;
const parentOld=p=>(p.parents||[]).filter(x=>x.alive!==false&&x.age>=68).sort((a,b)=>b.age-a.age)[0]||null;
const friendOf=p=>(p.ppl||[]).filter(x=>x.k==='amigo'&&x.rel>=55).sort((a,b)=>b.rel-a.rel)[0]||null;
const sibOf=p=>(p.siblings||[]).filter(x=>x.age>=18)[0]||null;
const owesYou=p=>dPeople(p).filter(x=>(x.fav||0)>=1).sort((a,b)=>b.fav-a.fav)[0]||null;
const grudge=p=>dPeople(p).filter(x=>(x.ren||0)>=2).sort((a,b)=>b.ren-a.ren)[0]||null;
const thAge=(p,k)=>p.th&&p.th[k]?absDay()-p.th[k].t:-1;
const D_=d=>DLG.push(d);

/* ---------- FAMILIA ---------- */
D_({id:'pareja_tension',cat:'familia',title:'Tu pareja',cool:200,npc:p=>p.partner,
 w:p=>p.partner?((p.partner.rel<55?2:0)+(p.dinero<0?1.5:0)+((p.ft||0)<15?1:0)+((p.partner.ren||0)>0?1:0)):0,
 N:{a:{t:(p,n,c,x)=>(ao(x,`${fn1(x)} te espera despierta.`,`${fn1(x)} te espera despierto.`)+' «Casi no te veo, y cuando estás, estás en otra parte.» '+(p.dinero<0?'Las deudas pesan en la casa. ':'')+`La relación está en ${Math.round(x.rel)}/100.`),
  o:[{t:'Escuchar sin interrumpir',k:['carisma',45],ok:{r:'Te escucha y se relaja. Hablan hasta tarde.',fx:{rel:10,s:{felicidad:3},h:'Una noche de escuchar'}},ko:{r:'Lo intentas, pero te defiendes a mitad de frase.',fx:{rel:2}}},
   {t:p=>`Proponer un fin de semana juntos (${fmt(Ux(p,.03))})`,req:p=>p.dinero>=Ux(p,.03),lock:'No te alcanza el dinero',ok:p=>({r:'Dos días sin teléfono. Vuelven más unidos.',fx:{$:-Ux(p,.03),ft:-3,rel:12,s:{felicidad:5},h:'Fin de semana juntos'}})},
   {t:'Explicar que trabajas por la familia',k:['inteligencia',55],ok:{r:'Entiende tus razones, aunque te pide más presencia.',fx:{rel:4}},ko:(p,n,c,x)=>({r:'Suena a excusa. La conversación se enfría.',fx:{rel:-8,ren:1,h:'«Siempre una excusa»'},to:x.rel<38?'b':null})}]},
  b:{t:(p,n,c,x)=>`Días después, ${fn1(x)} lo dice claro: «Necesitamos ayuda… o separarnos».`,
  o:[{t:p=>`Ir a terapia de pareja (${fmt(Ux(p,.05))})`,req:p=>p.dinero>=Ux(p,.05),lock:'No te alcanza el dinero',ok:p=>({r:'Las sesiones duelen, pero funcionan.',fx:{$:-Ux(p,.05),ft:-6,rel:15,ren:-1,h:'Terapia de pareja'}})},
   {t:'Pedir tiempo para pensarlo',ok:{r:'Acepta, pero la distancia crece.',fx:{rel:-3}}},
   {t:'Separarse',ok:{r:'Se separan. La casa queda en silencio.',fx:{s:{felicidad:-12}},go:p=>{log(`Te separas de ${p.partner.name}.`,'bad');p.exes=(p.exes||[]).concat([p.partner.name]);p.partner=null;}}}]}}});

D_({id:'hijo_escuela',cat:'familia',title:'Tus hijos',cool:240,npc:kidOf,
 w:p=>{const k=kidOf(p);return k?1+((k.st&&k.st.int<45)?1.5:0)+(p.ft<20?.5:0):0;},
 N:{a:{t:(p,n,c,x)=>`${fn1(x)} (${x.age} años) llega con la boleta: reprobó matemáticas. ${x.st&&x.st.int<45?'No es la primera vez.':'Te sorprende.'}`,
  o:[{t:(p,n,c,x)=>`Sentarte a estudiar con ${fn1(x)} cada semana`,req:p=>(p.ft||0)>=10,lock:'Necesitas 10 días libres',ok:(p,n,c,x)=>({r:`${fn1(x)} mejora poco a poco. Lo nota en sus notas y en cómo te mira.`,fx:{ft:-10,rel:8,h:'Estudiaron juntos'},go:()=>{if(x.st)x.st.int=clamp(x.st.int+3,0,100);}})},
   {t:p=>`Contratar un tutor (${fmt(Ux(p,.04))})`,req:p=>p.dinero>=Ux(p,.04),lock:'No te alcanza el dinero',ok:(p,n,c,x)=>({r:'El tutor es bueno. Sube su promedio.',fx:{$:-Ux(p,.04),rel:2},go:()=>{if(x.st)x.st.int=clamp(x.st.int+4,0,100);}})},
   {t:'Regañarle y quitarle el teléfono',k:['carisma',60],ok:(p,n,c,x)=>({r:'Lo toma en serio. Mejora un poco.',fx:{rel:-2},go:()=>{if(x.st)x.st.int=clamp(x.st.int+1,0,100);}}),ko:{r:'Se encierra en su cuarto. No te habla en días.',fx:{rel:-10,ren:1,h:'El regaño'}}},
   {t:'Restarle importancia',ok:(p,n,c,x)=>({r:ao(x,'Se siente comprendida, pero nada cambia en la escuela.','Se siente comprendido, pero nada cambia en la escuela.'),fx:{rel:3},go:()=>{if(x.st)x.st.int=clamp(x.st.int-1,0,100);}})}]}}});

D_({id:'padre_salud',cat:'familia',title:'Tus padres',cool:500,npc:parentOld,
 w:p=>{const x=parentOld(p);return x?1+(x.age-68)/8:0;},
 init:(p,n,c)=>{c.cost=Ux(p,.15);c.le=N0[natOf(p).id]?N0[natOf(p).id].le:72;},
 N:{a:{t:(p,n,c,x)=>(x.role==='Madre'?`Te llama tu madre, ${fn1(x)} (${x.age} años): el médico encontró algo y quiere estudios en un hospital privado (${fmt(c.cost)}). En el sistema público la espera es de meses.`:`Te llama tu padre, ${fn1(x)} (${x.age} años): el médico encontró algo y quiere estudios en un hospital privado (${fmt(c.cost)}). En el sistema público la espera es de meses.`),
  o:[{t:(p,n,c)=>`Pagar todo (${fmt(c.cost)})`,req:(p,n,c)=>p.dinero>=c.cost,lock:'No te alcanza el dinero',ok:(p,n,c)=>({r:'Detectan el problema a tiempo. Tu familia no lo olvida.',fx:{$:-c.cost,rel:15,fav:1,s:{felicidad:3},h:'Pagaste sus estudios'}})},
   {t:'Dividir el gasto con tus hermanos',req:p=>(p.siblings||[]).length>0,lock:'No tienes hermanos',ok:(p,n,c)=>({r:'Entre todos lo pagan. Se acercan como familia.',fx:{$:-Math.round(c.cost/((p.siblings||[]).length+1)),rel:8,h:'La familia unida'}})},
   {t:'Pedirle que espere al sistema público',ok:(p,n,c)=>({r:'Lo acepta sin quejarse. Tú te quedas con la duda.',fx:{rel:-4,th:['padre_espera',{n:nref(p,c.npc)}]}})}]}}});

D_({id:'padre_espera_res',cat:'familia',title:'Tus padres',cool:9999,npc:p=>p.th&&p.th.padre_espera?nget(p,p.th.padre_espera.n):null,
 w:p=>thAge(p,'padre_espera')>=90?6:0,
 init:(p,n,c)=>{const le=N0[n.id]?N0[n.id].le:72;c.ok=chance(clamp((le-55)/30,.25,.85));},
 N:{a:{t:(p,n,c,x)=>c.ok?`Tras ${Math.round(thAge(p,'padre_espera')/30)} meses de espera, ${fn1(x)} por fin tiene sus estudios. Era tratable: llegó a tiempo. (La probabilidad dependía de la calidad del sistema de salud de ${n.name}: esperanza de vida ${N0[n.id]?N0[n.id].le:'—'} años.)`
   :`La espera fue demasiado larga. Cuando atienden a ${fn1(x)}, el tratamiento ya es más agresivo. Te reprocha en silencio.`,
  o:[{t:'Visitarle más seguido',ok:(p,n,c)=>({r:'Pasan tiempo juntos.',fx:{ft:-5,rel:8,s:{felicidad:2},thx:'padre_espera'}})},
   {t:'Seguir con tu vida',ok:(p,n,c)=>({r:c.ok?'Todo vuelve a la normalidad.':'La culpa te acompaña un tiempo.',fx:{s:{felicidad:c.ok?0:-6},thx:'padre_espera'}})}]}}});

D_({id:'hermano_prestamo',cat:'familia',title:'Tus hermanos',cool:600,npc:sibOf,
 w:p=>sibOf(p)&&p.dinero>Ux(p,.3)?1.2:0,init:(p,n,c,x)=>{c.amt=Ux(p,.2);x.rel=x.rel==null?60:x.rel;npcTrait(x);},
 N:{a:{t:(p,n,c,x)=>ao(x,`${fn1(x)}, tu hermana, te pide ${fmt(c.amt)} prestados para arrancar un negocio. Promete pagarte en un año.`,`${fn1(x)}, tu hermano, te pide ${fmt(c.amt)} prestados para arrancar un negocio. Promete pagarte en un año.`),
  o:[{t:'Prestarle',ok:(p,n,c,x)=>({r:'Te abraza. «No te vas a arrepentir.»',fx:{$:-c.amt,rel:6,fav:1,th:['prestamo',{n:nref(p,x),amt:c.amt}],h:'Le prestaste dinero'}})},
   {t:'Pedir ver su plan de negocio',k:['inteligencia',50],ok:(p,n,c,x)=>({r:'Lo revisan juntos.',to:'b'}),ko:{r:'No entiendes bien los números y te quedas con la duda.',to:'b'}},
   {t:'Negarte con tacto',k:['carisma',50],ok:{r:'Lo entiende. No pasa a más.',fx:{rel:-2}},ko:{r:'Se ofende. «Para los extraños sí tienes.»',fx:{rel:-8,ren:1,h:'No le prestaste'}}}]},
  b:{t:(p,n,c,x)=>{const good=['honesto','leal','generoso'].includes(x.tr);c.good=good;return good?`El plan es sólido: clientes identificados, costos realistas. Rasgo de ${fn1(x)}: ${x.tr}.`:`El plan tiene huecos: ventas infladas y ningún colchón. Rasgo de ${fn1(x)}: ${x.tr}.`;},
  o:[{t:'Prestarle de todos modos',ok:(p,n,c,x)=>({r:'Hecho. Ahora toca esperar.',fx:{$:-c.amt,rel:6,fav:1,th:['prestamo',{n:nref(p,x),amt:c.amt}]}})},
   {t:'Prestarle la mitad y asesorarle',ok:(p,n,c,x)=>({r:'Acepta tu ayuda. Ajustan el plan juntos.',fx:{$:-Math.round(c.amt/2),ft:-4,rel:8,th:['prestamo',{n:nref(p,x),amt:Math.round(c.amt/2),help:1}]}})},
   {t:'No prestarle',ok:(p,n,c)=>({r:c.good?'Lo lamenta; el plan era bueno.':'Le explicas los huecos. A regañadientes, lo reconoce.',fx:{rel:c.good?-6:-1}})}]}}});

D_({id:'prestamo_cobro',cat:'familia',title:'El préstamo',cool:9999,npc:p=>p.th&&p.th.prestamo?nget(p,p.th.prestamo.n):null,
 w:p=>thAge(p,'prestamo')>=330?6:0,
 init:(p,n,c,x)=>{const T=p.th.prestamo;c.amt=T.amt;const un=(N0[n.id]&&N0[n.id].unemp)||6;c.pr=clamp((PAY_RATE[npcTrait(x)]||.6)+(T.help?.1:0)-un/100,.1,.95);c.pays=chance(c.pr);},
 N:{a:{t:(p,n,c,x)=>`Pasó un año desde que le prestaste ${fmt(c.amt)} a ${fn1(x)}. `+(c.pays?'Llega con un sobre: te paga completo y con un 5 % extra.':'Te pide más tiempo: el negocio no despega.')+` <small>(Rasgo de ${fn1(x)}: ${x.tr}. Desempleo en ${n.name}: ${(N0[n.id]&&N0[n.id].unemp)||'—'} %. Probabilidad de pago: ${Math.round(c.pr*100)} %.)</small>`,
  o:[{t:'Aceptar',req:(p,n,c)=>c.pays,lock:'',ok:(p,n,c)=>({r:'Cuentas claras, amistades largas.',fx:{$:Math.round(c.amt*1.05),fav:-1,rel:6,thx:'prestamo',h:'Pagó su deuda'}})},
   {t:'Darle seis meses más',req:(p,n,c)=>!c.pays,ok:(p,n,c,x)=>({r:'Agradece la paciencia.',fx:{rel:5},go:()=>{p.th.prestamo.t=absDay()-150;}})},
   {t:'Exigir el pago',req:(p,n,c)=>!c.pays,k:['carisma',55],ok:(p,n,c)=>({r:'Vende lo que puede y te paga la mitad.',fx:{$:Math.round(c.amt/2),rel:-8,ren:1,thx:'prestamo',h:'Le exigiste el pago'}}),ko:{r:'Discuten fuerte. No te paga.',fx:{rel:-14,ren:2,thx:'prestamo',h:'Discusión por dinero'}}},
   {t:'Perdonar la deuda',req:(p,n,c)=>!c.pays,ok:{r:'Se le quiebra la voz. No lo olvidará.',fx:{rel:15,fav:2,thx:'prestamo',h:'Le perdonaste la deuda'}}}]}}});

/* ---------- AMIGOS Y REDES ---------- */
D_({id:'amigo_desempleo',cat:'amigos',title:'Tus amigos',cool:400,npc:friendOf,
 w:(p,n)=>friendOf(p)?(.8+((N0[n.id]&&N0[n.id].unemp)||5)/8+(n.g<0?1:0)):0,init:(p,n,c,x)=>npcTrait(x),
 N:{a:{t:(p,n,c,x)=>(n.g<0?`${fn1(x)} perdió su trabajo (la economía de ${n.name} está en recesión). Te llama para pedir ayuda.`:`${fn1(x)} perdió su trabajo. Te llama para pedir ayuda.`),
  o:[{t:'Recomendarle en tu trabajo',req:p=>employed(p)&&p.s.influencia>=20,lock:'Necesitas empleo e influencia 20+',ok:(p,n,c,x)=>({r:'Le dan una entrevista. Queda a prueba.',fx:{rel:10,fav:1,th:['recomendado',{n:nref(p,x)}],h:'Le recomendaste'}})},
   {t:p=>`Prestarle para la renta (${fmt(Ux(p,.05))})`,req:p=>p.dinero>=Ux(p,.05),lock:'No te alcanza',ok:p=>({r:'Respira aliviado. Promete devolverlo.',fx:{$:-Ux(p,.05),rel:6,fav:1}})},
   {t:'Ayudarle con su CV y contactos',req:p=>(p.ft||0)>=5,lock:'Necesitas 5 días libres',ok:{r:'Pulen su perfil y le presentas a dos personas.',fx:{ft:-5,rel:8,fav:1,h:'Le ayudaste a buscar trabajo'}}},
   {t:'«Ahora no puedo»',ok:{r:'Lo entiende… pero lo recuerda.',fx:{rel:-6}}}]}}});

D_({id:'recomendado_res',cat:'trabajo',title:'Tu recomendación',cool:9999,npc:p=>p.th&&p.th.recomendado?nget(p,p.th.recomendado.n):null,w:p=>thAge(p,'recomendado')>=120?6:0,
 init:(p,n,c,x)=>{c.good=['honesto','leal','generoso','ambicioso'].includes(npcTrait(x));},
 N:{a:{t:(p,n,c,x)=>c.good?`${fn1(x)} resultó excelente en el trabajo. Tu jefe te lo agradece: «Tienes buen ojo».`:`${fn1(x)} (${x.tr}) no duró: llegaba tarde y discutió con un cliente. Tu jefe te mira distinto.`,
  o:[{t:'Entendido',ok:(p,n,c)=>c.good?{r:'Tu palabra vale más en la empresa.',fx:{s:{influencia:4},thx:'recomendado'}}:{r:'Aprendes a recomendar con cuidado.',fx:{s:{influencia:-3},rel:-4,thx:'recomendado'}}}]}}});

D_({id:'cobrar_favor',cat:'amigos',title:'Un favor pendiente',cool:300,npc:owesYou,
 w:p=>owesYou(p)?(p.age>=18&&!p.job&&!p.ruler?2:0)+(p.dinero<0?1.5:0)+(inPolitics(p)?1:0)+.3:0,
 N:{a:{t:(p,n,c,x)=>((x.fav>1?`${fn1(x)} te debe ${x.fav} favores.`:`${fn1(x)} te debe un favor.`)+' '+(!p.job&&p.age>=18&&!p.ruler?'Estás sin empleo. ':p.dinero<0?'Estás corto de dinero. ':'')+'¿Se lo recuerdas?'),
  o:[{t:'Pedirle una recomendación profesional',ok:{r:'Mueve sus contactos por ti: te abre puertas.',fx:{fav:-1,s:{influencia:5},h:'Cobraste un favor'}}},
   {t:p=>`Pedirle dinero prestado (${fmt(Ux(p,.06))})`,ok:p=>({r:'Te lo presta sin preguntas.',fx:{$:Ux(p,.06),fav:-1}})},
   {t:'Pedirle apoyo político',req:inPolitics,lock:'Solo si estás en política',ok:(p,n)=>({r:'Habla bien de ti en su círculo.',fx:{fav:-1,s:{influencia:6},nat:p.ruler?{approval:1}:undefined}})},
   {t:'Guardar el favor para después',ok:{r:'Un favor guardado es poder.'}}]}}});

D_({id:'rencor',cat:'amigos',title:'Un rencor',cool:330,npc:grudge,w:p=>{const g=grudge(p);return g?Math.min(2,g.ren*.45):0;},
 N:{a:{t:(p,n,c,x)=>((x.hist&&x.hist.length?`Te enteras de que ${fn1(x)} anda contando cosas de ti desde aquello de «${x.hist[x.hist.length-1].t}».`:`Te enteras de que ${fn1(x)} anda contando cosas de ti.`)+` Rencor: ${'😠'.repeat(Math.min(4,x.ren))}.`),
  o:[{t:'Hablarle en privado',k:['carisma',55],ok:{r:'Se dicen todo. Algo se destraba.',fx:{ren:-2,rel:6,h:'Hicieron las paces'}},ko:{r:'Termina peor: ahora lo dice en voz alta.',fx:{ren:1,s:{influencia:-2}}}},
   {t:'Responder públicamente',k:['influencia',50],ok:{r:'Tu versión convence más.',fx:{s:{influencia:3},ren:1}},ko:{r:'Parece pleito de vecindad. Pierdes imagen.',fx:{s:{influencia:-4},ren:1}}},
   {t:p=>`Un regalo y una disculpa (${fmt(Ux(p,.02))})`,req:p=>p.dinero>=Ux(p,.02),lock:'No te alcanza',ok:p=>({r:'Lo acepta. El hielo se derrite.',fx:{$:-Ux(p,.02),ren:-1,rel:5}})},
   {t:'Ignorarlo',ok:{r:'El rumor sigue su curso.',fx:{s:{influencia:-2}}}}]}}});

D_({id:'cena_elite',cat:'amigos',title:'Una invitación',cool:300,npc:p=>npc(p,'contacto'),w:p=>p.age>=20&&(p.s.influencia>=45||(typeof fama==='function'&&fama(p)>=40)||p.dinero>Ux(p,10))?1.4:0,
 N:{a:{t:(p,n,c,x)=>`Te invitan a una cena privada con empresarios y políticos. Te sientan junto a ${x.name}, ${x.age} años, del mundo empresarial.`,
  o:[{t:'Conversar y caer bien',k:['carisma',50],ok:{r:'Intercambian teléfonos. Te invita a otra reunión.',fx:{ft:-1,rel:12,s:{influencia:3},h:'La cena'}},ko:{r:'Plática cortés, nada más.',fx:{ft:-1,rel:2}}},
   {t:'Hablar de negocios',k:['inteligencia',55],ok:(p,n,c,x)=>({r:`${fn1(x)} se interesa: «Tengo algo en lo que podrías entrar».`,fx:{ft:-1,rel:8,th:['oportunidad',{n:nref(p,x)}]}}),ko:{r:'Te ve con prisa. Cambia de tema.',fx:{ft:-1,rel:-2}}},
   {t:'No ir',ok:{r:'Te quedas en casa.'}}]}}});

D_({id:'oportunidad',cat:'inversión',title:'Una oportunidad',cool:9999,npc:p=>p.th&&p.th.oportunidad?nget(p,p.th.oportunidad.n):null,w:p=>thAge(p,'oportunidad')>=30?5:0,
 init:(p,n,c,x)=>{c.amt=Math.max(Ux(p,.5),Math.round(Math.max(0,p.dinero)*.25));npcTrait(x);},
 N:{a:{t:(p,n,c,x)=>`${fn1(x)} te ofrece entrar en un desarrollo inmobiliario: ${fmt(c.amt)}, retorno esperado de 25 % en dos años. «Solo para amigos.»`,
  o:[{t:'Pedir los papeles y revisarlos',k:['inteligencia',55],ok:(p,n,c,x)=>({r:['honesto','leal','generoso'].includes(x.tr)?'Los papeles están en orden: permisos, terreno, constructora.':'Hay cosas raras: el terreno no está a nombre de la empresa.',to:'b'}),ko:{r:'Son muchas hojas. No te queda claro.',to:'b'}},
   {t:'Entrar sin revisar',req:(p,n,c)=>p.dinero>=c.amt,lock:'No te alcanza',ok:(p,n,c,x)=>({r:'Firmas. Ahora a esperar.',fx:{$:-c.amt,th:['inversion',{n:nref(p,x),amt:c.amt}],thx:'oportunidad'}})},
   {t:'Declinar',ok:{r:'Le agradeces. Quedan en buenos términos.',fx:{thx:'oportunidad'}}}]},
  b:{t:'¿Entras?',o:[{t:'Entrar',req:(p,n,c)=>p.dinero>=c.amt,lock:'No te alcanza',ok:(p,n,c,x)=>({r:'Firmas.',fx:{$:-c.amt,th:['inversion',{n:nref(p,x),amt:c.amt}],thx:'oportunidad'}})},{t:'Declinar',ok:{r:'Mejor no.',fx:{thx:'oportunidad'}}}]}}});

D_({id:'inversion_res',cat:'inversión',title:'Tu inversión',cool:9999,npc:p=>p.th&&p.th.inversion?nget(p,p.th.inversion.n):null,w:p=>thAge(p,'inversion')>=700?6:0,
 init:(p,n,c,x)=>{const T=p.th.inversion;c.amt=T.amt;const good=['honesto','leal','generoso'].includes(npcTrait(x));c.m=good?clamp(1.25+n.g/50+R(-.1,.1),.9,1.5):(chance(.35)?1.1:R(0,.35));},
 N:{a:{t:(p,n,c,x)=>c.m>=1?`El desarrollo se vendió. Recibes ${fmt(c.amt*c.m)} (${Math.round((c.m-1)*100)} % de ganancia). ${fn1(x)} cumplió.`:`El proyecto se cayó: permisos irregulares. Recuperas ${fmt(c.amt*c.m)} de ${fmt(c.amt)}. ${fn1(x)} (${x.tr}) dejó de contestar.`,
  o:[{t:'Continuar',ok:(p,n,c)=>({r:c.m>=1?'Buen negocio.':'Lección cara.',fx:{$:Math.round(c.amt*c.m),rel:c.m>=1?8:-25,ren:c.m>=1?0:0,s:{felicidad:c.m>=1?4:-6},thx:'inversion',h:c.m>=1?'La inversión salió bien':'La inversión fallida'}})}]}}});

/* ---------- TRABAJO ---------- */
D_({id:'jefe_extra',cat:'trabajo',title:'Tu jefe',cool:330,npc:p=>employed(p)?npc(p,'jefe'):null,w:(p,n)=>employed(p)?1+(n.g<0?1:0):0,
 N:{a:{t:(p,n,c,x)=>(ao(x,`${x.name}, tu jefa, te pide quedarte los fines de semana de este mes. Sin pago extra.`,`${x.name}, tu jefe, te pide quedarte los fines de semana de este mes. Sin pago extra.`)+(n.g<0?' «Con la recesión, no hay presupuesto.»':'')),
  o:[{t:'Aceptar',ok:{r:'Lo nota. Te ve como alguien confiable.',fx:{ft:-12,s:{felicidad:-4},rel:10,h:'Trabajaste los fines de semana'},go:p=>{p.th=p.th||{};p.th.meritos={t:absDay(),c:((p.th.meritos&&p.th.meritos.c)||0)+1};}}},
   {t:'Negociar pago o días libres',k:['carisma',55],ok:p=>({r:'Acepta pagarte doble. Respeta que sepas negociar.',fx:{ft:-12,$:Ux(p,.03),rel:3}}),ko:{r:'«Es temporal, no lo hagas difícil.» Se molesta.',fx:{rel:-6}}},
   {t:'Negarte',ok:(p,n,c,x)=>({r:x.tr==='rencoroso'?'No dice nada. Pero lo anota.':'Lo acepta de mala gana.',fx:{rel:-10,ren:x.tr==='rencoroso'?1:0,h:'Te negaste'}})}]}}});

D_({id:'ascenso',cat:'trabajo',title:'Entrevista de ascenso',cool:500,npc:p=>npc(p,'jefe'),w:p=>employed(p)&&(p.career?(p.career.years||0):0)>=2?1+((p.th&&p.th.meritos&&p.th.meritos.c)||0)*.6+(p.s.inteligencia>60?.5:0):0,
 init:(p,n,c)=>{c.pts=(p.th&&p.th.meritos&&p.th.meritos.c)?1:0;},
 N:{a:{t:(p,n,c,x)=>(`Se abre una gerencia. Entrevista con el comité, presidido por ${x.name}. Primera pregunta: «¿Cuál sería tu primer cambio?»`+(c.pts?' (Tus fines de semana extra cuentan a tu favor.)':'')),
  o:[{t:'Reducir costos con datos',k:['inteligencia',55],ok:(p,n,c)=>({r:'Les gusta el enfoque.',to:'b',go:()=>{c.pts++;}}),ko:{r:'Tus cifras no cuadran del todo.',to:'b'}},
   {t:'Motivar y ordenar al equipo',k:['carisma',55],ok:(p,n,c)=>({r:'Transmites liderazgo.',to:'b',go:()=>{c.pts++;}}),ko:{r:'Suena a discurso aprendido.',to:'b'}},
   {t:'«Lo que la dirección decida»',ok:{r:'Respuesta segura, sin brillo.',to:'b'}}]},
  b:{t:'Segunda pregunta: «¿Cuál es tu expectativa de sueldo?»',
  o:[{t:'+10 %, razonable',ok:{r:'Asienten.',to:'c'}},
   {t:'+25 %, con datos del mercado',k:['inteligencia',60],ok:(p,n,c)=>({r:'Traes estudios de sueldos. Los convences.',to:'c',go:()=>{c.pts++;c.big=1;}}),ko:(p,n,c)=>({r:'Les parece desmedido.',to:'c',go:()=>{c.pts--;}})},
   {t:'«Lo que ustedes ofrezcan»',ok:{r:'Anotan algo.',to:'c'}}]},
  c:{t:(p,n,c)=>c.pts>=2?'Una semana después, te llaman: el puesto es tuyo.':'Una semana después: eligieron a otra persona. Te dan retroalimentación por escrito.',
  o:[{t:'Continuar',ok:(p,n,c)=>c.pts>=2?{r:'Ascenso.',fx:{s:{influencia:5,felicidad:6},$:Ux(p,c.big?.25:.1),rel:5,log:c.big?'Ascenso a gerente con el sueldo que pediste.':'Ascenso a gerente.',lc:'good'},go:p=>{if(p.career)p.career.rank=(p.career.rank||0)+1;if(p.job&&p.job.k)p.job.k*=c.big?1.25:1.1;if(p.th)delete p.th.meritos;}}:{r:'Lees la retroalimentación: te falta experiencia en presupuesto.',fx:{s:{felicidad:-4,inteligencia:1}}}}]}}});

D_({id:'credito_robado',cat:'trabajo',title:'En la oficina',cool:400,npc:p=>employed(p)?npc(p,'colega'):null,w:p=>employed(p)?.6:0,
 N:{a:{t:(p,n,c,x)=>`${x.name} presentó tu proyecto como suyo frente a la dirección.`,
  o:[{t:'Mostrar tus correos y versiones al jefe',k:['inteligencia',45],ok:{r:'La evidencia es clara. Te dan el crédito.',fx:{s:{influencia:4},ren:2,h:'Lo expusiste'},go:p=>{const j=npc(p,'jefe');j.rel=clamp(j.rel+5,0,100);}},ko:{r:'Tu evidencia es débil. Parece envidia.',fx:{s:{influencia:-2},ren:1}}},
   {t:'Confrontarle a solas',k:['carisma',50],ok:{r:'Se disculpa y te da el crédito en la próxima junta.',fx:{rel:4}},ko:{r:'Lo niega en tu cara.',fx:{rel:-8,ren:1}}},
   {t:'Proponer trabajar juntos el siguiente',ok:{r:'Acepta. Ahora te debe una.',fx:{rel:8,fav:1}}},
   {t:'Dejarlo pasar',ok:{r:'Te tragas el coraje.',fx:{s:{felicidad:-3}}}}]}}});

D_({id:'soborno',cat:'política',title:'Una oferta',cool:500,npc:p=>npc(p,'empresario'),w:(p,n)=>(inPolitics(p)||(p.career&&p.career.track==='militar'))?1+(100-n.stab)/60:0,
 init:(p,n,c)=>{c.amt=Ux(p,p.ruler?6:1.5);},
 N:{a:{t:(p,n,c,x)=>`Un empresario, ${x.name}, te ofrece ${fmt(c.amt)} «por agilizar un permiso». Nadie más lo sabe.`,
  o:[{t:'Aceptar',ok:(p,n,c)=>({r:'El sobre cambia de manos.',fx:{$:c.amt,rel:10,fav:-1,th:['soborno',{amt:c.amt}],h:'Aceptaste su dinero'}})},
   {t:'Rechazar',ok:{r:'Se va sonriendo. «Usted se lo pierde.»',fx:{rel:-10,ren:1,s:{felicidad:2},h:'Lo rechazaste'}}},
   {t:'Denunciarlo con pruebas',k:['inteligencia',50],ok:(p,n)=>({r:'Graba la conversación. La fiscalía actúa.',fx:{s:{influencia:6},ren:3,nat:p.ruler?{approval:2}:undefined,h:'Lo denunciaste'}}),ko:{r:'Sin pruebas suficientes. Ahora tienes un enemigo.',fx:{ren:2}}}]}}});

D_({id:'soborno_inv',cat:'política',title:'La fiscalía',cool:9999,npc:null,w:(p,n)=>thAge(p,'soborno')>=180?(.4+n.stab/100)*2:0,
 init:(p,n,c)=>{c.amt=p.th.soborno.amt;c.cost=Ux(p,.6);},
 N:{a:{t:(p,n,c)=>(n.stab>60?`La fiscalía abre una investigación por el permiso de hace meses. (En ${n.name}, con estabilidad ${Math.round(n.stab)}, las instituciones funcionan: el riesgo es alto.)`:`La fiscalía abre una investigación por el permiso de hace meses. (En ${n.name}, con estabilidad ${Math.round(n.stab)}, las instituciones son débiles: hay margen para negociar.)`),
  o:[{t:(p,n,c)=>`Contratar un buen abogado (${fmt(c.cost)})`,req:(p,n,c)=>p.dinero>=c.cost,lock:'No te alcanza',k:['inteligencia',50],ok:(p,n,c)=>({r:'Tecnicismos procesales. El caso se archiva.',fx:{$:-c.cost,thx:'soborno'}}),ko:(p,n,c)=>({r:'Te vinculan a proceso: dos años de prisión.',fx:{$:-c.cost,s:{influencia:-15,felicidad:-15},thx:'soborno',log:'Te condenan por cohecho.',lc:'bad'},go:p=>{p.prison=2;}})},
   {t:'Cooperar como testigo',ok:{r:'Entregas al empresario. Evitas la cárcel, no el escándalo.',fx:{s:{influencia:-10},thx:'soborno'}}},
   {t:(p,n,c)=>`Pagar para que el expediente «se pierda» (${fmt(c.amt)})`,req:(p,n,c)=>p.dinero>=c.amt,lock:'No te alcanza',k:(p,n)=>['influencia',40+n.stab*.5],ok:(p,n,c)=>({r:'El expediente desaparece.',fx:{$:-c.amt,thx:'soborno'}}),ko:(p,n,c)=>({r:'El fiscal no se deja: suma otro delito.',fx:{$:-c.amt,s:{influencia:-20},thx:'soborno',log:'Te condenan por cohecho y obstrucción.',lc:'bad'},go:p=>{p.prison=4;}})}]}}});

/* ---------- NEGOCIO ---------- */
D_({id:'proveedor',cat:'negocio',title:'Tu negocio',cool:300,npc:p=>hasBiz(p)?npc(p,'proveedor'):null,w:(p,n)=>hasBiz(p)?1+Math.max(0,n.infl-3)/4:0,
 init:(p,n,c)=>{c.up=Math.round(clamp(8+n.infl*1.5,8,40));},
 N:{a:{t:(p,n,c,x)=>(n.infl>5?`${x.name}, tu proveedor principal, sube precios ${c.up} % (la inflación en ${n.name} va en ${n.infl.toFixed(1)} %).`:`${x.name}, tu proveedor principal, sube precios ${c.up} %.`),
  o:[{t:'Aceptar el aumento',ok:p=>({r:'Tu margen se adelgaza este año.',fx:{$:-Ux(p,.04)}})},
   {t:'Negociar volumen y plazo',k:['carisma',50],ok:p=>({r:'Lo dejan en la mitad a cambio de pedidos fijos.',fx:{$:-Ux(p,.015),rel:5}}),ko:p=>({r:'No cede.',fx:{$:-Ux(p,.04),rel:-3}})},
   {t:'Buscar otro proveedor',req:p=>(p.ft||0)>=7,lock:'Necesitas 7 días libres',k:['inteligencia',45],ok:p=>({r:'Encuentras uno más barato y confiable.',fx:{ft:-7,$:Ux(p,.01),rel:-10}}),ko:p=>({r:'El nuevo falla en la primera entrega.',fx:{ft:-7,$:-Ux(p,.05),rel:-10}})}]}}});

D_({id:'inspeccion',cat:'negocio',title:'Inspección',cool:400,npc:p=>hasBiz(p)?npc(p,'inspector'):null,w:p=>hasBiz(p)?1:0,
 N:{a:{t:(p,n,c,x)=>ao(x,'Llega una inspectora sanitaria: encuentra detalles en la bodega y en las fechas de caducidad.','Llega un inspector sanitario: encuentra detalles en la bodega y en las fechas de caducidad.'),
  o:[{t:p=>`Corregir todo (${fmt(Ux(p,.05))})`,ok:p=>({r:'Pasas la reinspección sin problemas.',fx:{$:-Ux(p,.05),s:{felicidad:-1}}})},
   {t:p=>`Ofrecerle «una ayuda» (${fmt(Ux(p,.01))})`,ok:(p,n)=>{const s=chance(clamp(.75-n.stab/150,.2,.7));return s?{r:'Firma y se va.',fx:{$:-Ux(p,.01),th:['soborno',{amt:Ux(p,.01)}]}}:{r:'No acepta: el sobre lo empeora. Multa doble y queda en tu expediente.',fx:{$:-Ux(p,.12),s:{influencia:-3}}};}},
   {t:'Impugnar con tu documentación',k:['inteligencia',55],ok:{r:'Demuestras que todo estaba en regla.',fx:{s:{influencia:1}}},ko:p=>({r:'Pierdes la impugnación y pagas multa.',fx:{$:-Ux(p,.08)}})}]}}});

/* ---------- POLÍTICA Y GOBIERNO ---------- */
D_({id:'debate',cat:'política',title:'Debate televisado',cool:700,npc:p=>npc(p,'rival'),w:(p,n)=>(inPolitics(p)&&n.gov==='democracia'&&n.nextElec&&n.nextElec-G.year<=1)?3:(p.career&&p.career.track==='politica'&&(p.career.rank||0)>=2?.8:0),
 init:(p,n,c)=>{c.pts=0;},
 N:{a:{t:(p,n,c,x)=>(n.g<0?`Debate televisado contra ${x.name}. Primera pregunta: la economía (${n.name} está en recesión: ${n.g.toFixed(1)} %).`:`Debate televisado contra ${x.name}. Primera pregunta: la economía (crecimiento de ${n.g.toFixed(1)} %, inflación de ${n.infl.toFixed(1)} %).`),
  o:[{t:'Propuesta concreta con cifras',k:['inteligencia',55],ok:(p,n,c)=>({r:'Claro y creíble.',to:'b',go:()=>{c.pts++;}}),ko:{r:'Te enredas con los números.',to:'b'}},
   {t:'Mensaje emotivo sobre las familias',k:['carisma',55],ok:(p,n,c)=>({r:'Conectas con la gente.',to:'b',go:()=>{c.pts++;}}),ko:{r:'Suena hueco.',to:'b'}}]},
  b:{t:(p,n,c,x)=>`${fn1(x)} te ataca: «${p.ruler?'Su gobierno prometió y no cumplió':'No tiene experiencia para gobernar'}».`,
  o:[{t:'Contraatacar con su historial',k:['carisma',55],ok:(p,n,c)=>({r:'Lo dejas sin respuesta.',to:'c',go:()=>{c.pts++;}}),ko:(p,n,c)=>({r:'Parece pleito. Ambos pierden.',to:'c',go:()=>{c.pts--;}})},
   {t:'Responder con calma y datos',k:['inteligencia',50],ok:(p,n,c)=>({r:'Se ve presidencial.',to:'c',go:()=>{c.pts++;}}),ko:{r:'Correcto, pero aburrido.',to:'c'}},
   {t:'Ignorarlo y volver a tu propuesta',ok:{r:'Neutral.',to:'c'}}]},
  c:{t:(p,n,c)=>(c.pts>=2?'Las encuestas de salida te dan como ganador claro del debate.':c.pts===1?'Las encuestas de salida te dan un empate técnico.':'Las encuestas de salida te dan como perdedor del debate.'),
  o:[{t:'Continuar',ok:(p,n,c)=>({r:'',fx:{s:{influencia:c.pts>=2?6:c.pts===1?1:-4},nat:p.ruler?{approval:c.pts>=2?3:c.pts===1?0:-3}:undefined,ren:c.pts>=2?1:0}})}]}}});

D_({id:'sindicato',cat:'gobierno',title:'Huelga general',cool:600,npc:p=>p.ruler?npc(p,'sindical'):null,w:(p,n)=>p.ruler?.6+Math.max(0,n.infl-4)/3+(n.approval<40?.8:0):0,
 N:{a:{t:(p,n,c,x)=>(n.infl>5?`${x.name}, líder sindical, exige un aumento de 12 % para el sector público (la inflación va en ${n.infl.toFixed(1)} %). Amenaza con huelga general.`:`${x.name}, líder sindical, exige un aumento de 12 % para el sector público. Amenaza con huelga general.`),
  o:[{t:'Conceder el 12 %',ok:(p,n)=>({r:'Se evita la huelga. El gasto público sube.',fx:{rel:12,nat:{stab:3,approval:2,treas:-Math.round(n.gdp*.003),infl:.3}}})},
   {t:'Negociar 6 % y bonos de productividad',k:['carisma',55],ok:(p,n)=>({r:'Acuerdo firmado.',fx:{rel:5,nat:{stab:2,treas:-Math.round(n.gdp*.0015)}}}),ko:(p,n)=>({r:'Rompen la mesa. Huelga de una semana.',fx:{rel:-10,ren:1,nat:{stab:-3,approval:-2}},go:()=>shockGDP(n.id,.997)})},
   {t:'Rechazar y aplicar la ley',ok:(p,n)=>({r:'Huelga general. El país se detiene diez días.',fx:{rel:-20,ren:2,nat:{stab:-5,approval:-3}},go:()=>shockGDP(n.id,.994)})}]}}});

D_({id:'filtracion',cat:'gobierno',title:'Una filtración',cool:600,npc:p=>p.ruler?npc(p,'ministro'):null,w:p=>p.ruler?.8:0,
 N:{a:{t:(p,n,c,x)=>`Un documento interno de tu gobierno aparece en la prensa. Todo apunta a ${x.name}, de tu gabinete.`,
  o:[{t:'Destituirle de inmediato',ok:{r:'Mensaje de firmeza. Pierdes un operador.',fx:{rel:-30,ren:2,nat:{approval:2,stab:-1}}}},
   {t:'Investigar antes de actuar',k:['inteligencia',55],ok:{r:'Fue otro funcionario. Proteges a la persona correcta.',fx:{rel:15,fav:1,nat:{stab:1}}},ko:{r:'La investigación se alarga y la prensa te come vivo.',fx:{nat:{approval:-3}}}},
   {t:'Encubrir',ok:{r:'Por ahora nadie pregunta más.',fx:{fav:1,th:['encubrimiento',{}]}}}]}}});

D_({id:'encubrimiento',cat:'gobierno',title:'El encubrimiento',cool:9999,npc:null,w:(p,n)=>p.ruler&&thAge(p,'encubrimiento')>=200?1+n.stab/80:0,
 N:{a:{t:'Un periódico publica que encubriste la filtración. La oposición pide comparecencia.',
  o:[{t:'Asumir el error en conferencia',k:['carisma',55],ok:{r:'La honestidad baja la presión.',fx:{nat:{approval:-1},thx:'encubrimiento'}},ko:{r:'No convences.',fx:{nat:{approval:-5,stab:-2},thx:'encubrimiento'}}},
   {t:'Negarlo todo',ok:(p,n)=>chance(clamp(.7-n.stab/120,.15,.6))?{r:'La nota se diluye.',fx:{thx:'encubrimiento'}}:{r:'Aparecen más pruebas. Escándalo nacional.',fx:{nat:{approval:-9,stab:-4},thx:'encubrimiento'}}}]}}});

D_({id:'acuerdo_secreto',cat:'gobierno',title:'Una propuesta discreta',cool:800,npc:p=>p.ruler?npc(p,'embajador'):null,w:p=>p.ruler?.6:0,
 init:(p,n,c)=>{const big=Object.values(G.nations).filter(o=>o.alive&&o.id!==n.id).sort((a,b)=>b.gdp-a.gdp).slice(0,6);c.o=pick(big).id;},
 N:{a:{t:(p,n,c,x)=>`${x.name}, embajador de ${G.nations[c.o].name}, propone en privado: inversión de ${fmtN(n.gdp*.004)} a cambio de que ${n.name} vote con ellos en la ONU durante cinco años.`,
  o:[{t:'Aceptar',ok:(p,n,c)=>({r:'Llega la inversión. Tu política exterior queda atada.',fx:{rel:15,nat:{treas:Math.round(n.gdp*.004)},th:['acuerdo',{o:c.o}]},go:()=>{const o=G.nations[c.o];if(o&&o.op)o.op[n.id]=(o.op[n.id]||0)+20;}})},
   {t:'Negociar sin compromisos de voto',k:['carisma',60],ok:(p,n)=>({r:'Consigues la mitad de la inversión sin ataduras.',fx:{rel:5,nat:{treas:Math.round(n.gdp*.002)}}}),ko:{r:'Se retiran ofendidos.',fx:{rel:-15,ren:1}}},
   {t:'Rechazar',ok:{r:'Mantienes la independencia.',fx:{rel:-8,nat:{approval:1}}}}]}}});

/* ---------- SALUD Y ÁNIMO ---------- */
D_({id:'agotamiento',cat:'salud',title:'Tu cuerpo avisa',cool:200,npc:null,w:p=>p.age>=16&&((p.ft||0)<12&&p.s.felicidad<50?2:0)+(p.s.salud<40?1.5:0),
 N:{a:{t:p=>`Llevas semanas sin descansar. Duermes mal y te cuesta concentrarte. (Tiempo libre: ${Math.floor(p.ft||0)} días, ánimo ${Math.round(p.s.felicidad)}.)`,
  o:[{t:p=>`Tomar una semana de descanso real (${fmt(Ux(p,.02))})`,ok:p=>({r:'Vuelves con otra cara.',fx:{$:-Ux(p,.02),s:{felicidad:8,salud:3}}})},
   {t:p=>`Ir a terapia (${fmt(Ux(p,.04))})`,req:p=>p.dinero>=Ux(p,.04),lock:'No te alcanza',ok:p=>({r:'Pones nombre a lo que sientes. Ayuda.',fx:{$:-Ux(p,.04),s:{felicidad:6,inteligencia:1}}})},
   {t:'Seguir adelante',k:['salud',60],ok:{r:'Aguantas. Por ahora.',fx:{s:{felicidad:-2}}},ko:{r:'Te enfermas y pasas una semana en cama.',fx:{s:{salud:-6,felicidad:-4},ft:-7}}}]}}});

/* ---------- SUERTE Y MALA SUERTE (probabilidad real) ---------- */
const luckTxt=(c)=>`<div class="luck">🎲 Probabilidad en tu situación: <b>${c.py>=.01?(c.py*100).toFixed(1)+' % al año':'1 en '+Math.round(1/c.py).toLocaleString('es-MX')+' al año'}</b> · dado: ${c.roll}/100</div>`;
D_({id:'asalto',cat:'mala suerte',title:'Mala suerte',cool:365,npc:null,luck:(p,n)=>p.age>=14?clamp(.01+((N0[n.id]&&N0[n.id].homi)||5)*.0035,.01,.2):0,
 N:{a:{t:(p,n,c)=>`Te asaltan al salir de una tienda.`+luckTxt(c)+`<small>Indicador: ${(N0[n.id]&&N0[n.id].homi)||'—'} homicidios por 100 mil hab. en ${n.name}.</small>`,
  o:[{t:'Entregar todo sin resistirte',ok:p=>({r:'Pierdes la cartera y el teléfono. Estás a salvo.',fx:{$:-Math.min(Math.max(0,p.dinero)*.03,Ux(p,.05)),s:{felicidad:-5}}})},
   {t:'Resistirte (arriesgado: casi siempre es mejor entregar)',k:['salud',88],ok:{r:'Logras zafarte y huir.',fx:{s:{felicidad:-3}}},ko:{r:'Te golpean. Terminas en urgencias.',fx:{s:{salud:-15,felicidad:-8}}}}]}}});
D_({id:'billete',cat:'suerte',title:'Suerte',cool:365,npc:null,luck:p=>p.age>=6?.02:0,init:(p,n,c)=>{c.amt=Ux(p,.01);},
 N:{a:{t:(p,n,c)=>`Encuentras ${fmt(c.amt)} tirados en la calle. No hay nadie cerca.`+luckTxt(c),
  o:[{t:'Quedártelos',ok:(p,n,c)=>({r:'Día de suerte.',fx:{$:c.amt,s:{felicidad:2}}})},{t:'Entregarlos a la policía',ok:{r:'El policía te mira raro. Te sientes bien.',fx:{s:{felicidad:3}}}}]}}});
D_({id:'herencia_lejana',cat:'suerte',title:'Suerte',cool:9999,npc:null,luck:p=>p.age>=18?.004:0,init:(p,n,c)=>{c.amt=Ux(p,R(1,4));},
 N:{a:{t:(p,n,c)=>`Un notario te llama: un tío lejano que apenas recuerdas te dejó ${fmt(c.amt)}.`+luckTxt(c),
  o:[{t:'Aceptar la herencia',ok:(p,n,c)=>({r:'Firmas los papeles.',fx:{$:Math.round(c.amt*(1-((typeof INH!=='undefined'&&INH[n.id])?INH[n.id][1]*.5:0))),s:{felicidad:5}}})}]}}});
D_({id:'accidente',cat:'mala suerte',title:'Mala suerte',cool:730,npc:null,luck:(p,n)=>p.age>=16?.004+(N0[n.id]&&N0[n.id].stab<40?.002:0):0,
 N:{a:{t:(p,n,c)=>`Un conductor distraído te impacta en un cruce.`+luckTxt(c),
  o:[{t:'Ir al hospital público',ok:{r:'Te atienden tras horas de espera. Fractura en el brazo.',fx:{s:{salud:-10,felicidad:-5},ft:-20}}},
   {t:p=>`Ir a un hospital privado (${fmt(Ux(p,.2))})`,req:p=>p.dinero>=Ux(p,.2),lock:'No te alcanza',ok:p=>({r:'Atención inmediata. Recuperación rápida.',fx:{$:-Ux(p,.2),s:{salud:-5},ft:-8}})}]}}});
D_({id:'rifa',cat:'suerte',title:'Suerte',cool:730,npc:null,luck:p=>p.age>=18?.01:0,init:(p,n,c)=>{c.amt=Ux(p,R(.2,.8));},
 N:{a:{t:(p,n,c)=>`Ganas la rifa de tu colonia: ${fmt(c.amt)} en efectivo.`+luckTxt(c),o:[{t:'¡Cobrar!',ok:(p,n,c)=>({r:'Celebras con los vecinos.',fx:{$:c.amt,s:{felicidad:4}}})}]}}});
D_({id:'cliente_grande',cat:'suerte',title:'Golpe de suerte',cool:730,npc:null,luck:p=>hasBiz(p)?.03:0,init:(p,n,c)=>{c.amt=Ux(p,R(.3,1.2));},
 N:{a:{t:(p,n,c)=>`Una empresa grande descubre tu negocio por una reseña y te hace un pedido enorme: ${fmt(c.amt)} de ganancia.`+luckTxt(c),
  o:[{t:'Aceptar y contratar temporales',ok:(p,n,c)=>({r:'Cumples a tiempo. Te vuelven a llamar.',fx:{$:c.amt,ft:-6,s:{felicidad:4}}})},{t:'Aceptar y hacerlo tú',k:['salud',55],ok:(p,n,c)=>({r:'Lo sacas: mucho cansancio, pero feliz.',fx:{$:Math.round(c.amt*1.2),ft:-15}}),ko:(p,n,c)=>({r:'Entregas tarde. Te pagan menos.',fx:{$:Math.round(c.amt*.5),ft:-15,s:{salud:-4}}})}]}}});
