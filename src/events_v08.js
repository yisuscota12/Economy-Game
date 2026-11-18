/* ===== v0.8: eventos de guerra, ocupación, vasallos, diplomacia y economía ===== */
const wOf=p=>warsOf(natOf(p).id)[0]||null;
const foeOf=p=>{const w=wOf(p);return w?enemyIn(w,natOf(p).id):null;};
const ruling=p=>p.ruler&&!p.prison;
const occHere=p=>!!(G.occ&&G.occ[p.r]&&G.occ[p.r]!==natOf(p).id);
const myEx=p=>{const w=wOf(p);return w?exOf(w,natOf(p).id):0;};
const fn_=t=>G.nations[t]?G.nations[t].name:'el enemigo';
const otherNat=p=>{const me=natOf(p).id;const L=Object.values(G.nations).filter(n=>n.alive&&n.id!==me&&!warBetween(me,n.id));return L.length?pick(L.slice().sort((a,b)=>b.gdp-a.gdp).slice(0,25)):null;};
/* ----- gobernar en guerra ----- */
E('w_bonos',1.2,p=>ruling(p)&&!!wOf(p),p=>`Hacienda advierte que la guerra contra ${fn_(foeOf(p))} vacía el tesoro. ¿Cómo la financias?`,p=>[
 ['Emitir bonos de guerra',p=>issueBonds(natOf(p))],
 ['Subir impuestos temporalmente',p=>{const n=natOf(p);n.treas=(n.treas||0)+treasuryIncome(n)*.5;n.approval-=6;n.stab-=2;return 'El tesoro respira, pero la gente protesta.';}],
 ['Recortar gasto civil',p=>{const n=natOf(p);n.treas=(n.treas||0)+treasuryIncome(n)*.3;shockGDP(n.id,.995);n.stab-=3;return 'Se cierran programas sociales para pagar la guerra.';}]],{gap:4});
E('w_prensa',1,p=>ruling(p)&&!!wOf(p)&&myEx(p)>15,'Los diarios publican cifras de bajas mucho más altas que las oficiales.',p=>[
 ['Censurar a la prensa',p=>{const n=natOf(p);n.stab+=3;if(isReal())n.approval-=4;p.s.influencia-=2;return 'Los periódicos callan, pero los rumores corren.';}],
 ['Reconocer las cifras',p=>{const n=natOf(p);if(isReal())n.approval+=2;addEx(wOf(p),n.id,5);return 'Tu honestidad gana respeto, aunque crece el desánimo.';}],
 ['Ignorarlo',p=>{if(isReal())natOf(p).approval-=2;return 'La polémica se apaga sola.';}]]);
E('w_movilizacion',.9,p=>ruling(p)&&!!wOf(p),'El Estado Mayor pide decretar la movilización general.',p=>[
 ['Decretarla',p=>{const n=natOf(p);ensureMP(n);n.mp=Math.min(mpCap(n)*1.3,n.mp+mpCap(n)*.3);n.stab-=3;p.s.felicidad-=2;return 'Miles de reservistas se presentan en los cuarteles.';}],
 ['Solo voluntarios',p=>{const n=natOf(p);ensureMP(n);n.mp+=mpCap(n)*.08;return 'Se alistan algunos voluntarios.';}]],{gap:5});
E('w_mercenarios',.7,p=>ruling(p)&&!!wOf(p)&&(natOf(p).treas||0)>0,'Una empresa militar privada ofrece 15 mil soldados profesionales.',p=>{const n=natOf(p),c=15000*perSoldier(n.id)*1.2;return [
 [`Contratarlos (${fmt(c)})`,p=>{if((n.treas||0)<c)return 'El tesoro no alcanza: la empresa se retira.';n.treas-=c;const cap=capitalOf(n.id);newArmy(n.id,cap,15000,{m:.8});syncArmyIdx(n.id);return `Llegan 15 mil mercenarios a ${RG[cap].nm}.`;}],
 ['No confiar en mercenarios',p=>'Prefieres tropas propias.']];},{gap:6});
E('w_espias',.8,p=>ruling(p)&&!!wOf(p),p=>`Tus espías consiguen los planes de ${fn_(foeOf(p))}.`,p=>[
 ['Preparar a las tropas',p=>{armiesOf(natOf(p).id).forEach(a=>a.m=Math.min(1,a.m+.12));return 'La moral de tus ejércitos sube.';}],
 ['Filtrarlos a la prensa',p=>{natOf(p).stab+=3;return 'El país se entusiasma con la noticia.';}]]);
E('w_protesta',1.3,p=>ruling(p)&&!!wOf(p)&&myEx(p)>40,'Marchas multitudinarias exigen terminar la guerra.',p=>[
 ['Dialogar con los manifestantes',p=>{const n=natOf(p);if(isReal())n.approval+=3;n.stab+=2;return 'Prometes buscar la paz. Las marchas se calman.';}],
 ['Reprimir las marchas',p=>{const n=natOf(p);n.stab-=6;if(isReal())n.approval-=8;p.corrupt+=0;return 'La represión indigna al país.';}],
 ['Ignorarlas',p=>{natOf(p).stab-=3;return 'Las protestas continúan.';}]],{gap:3});
E('w_mediacion',.9,p=>ruling(p)&&!!wOf(p)&&G.wars.includes(wOf(p)),p=>{const o=otherNat(p);p._med=o&&o.id;return `${o?o.name:'Un país neutral'} ofrece mediar una paz blanca con ${fn_(foeOf(p))}.`;},p=>[
 ['Aceptar la mediación',p=>{const w=wOf(p);if(!w)return 'La guerra ya terminó.';if(chance(.6)){makePeace(w);return 'Se firma una paz blanca: cada quien conserva lo suyo.';}return 'El enemigo rechaza la mediación.';}],
 ['Rechazarla',p=>{if(p._med)addOp(p._med,-5);return 'Decides seguir luchando.';}]],{gap:3});
E('w_fiestas',1,p=>ruling(p)&&!!wOf(p),'Las tropas piden permisos para pasar las fiestas de fin de año en casa.',p=>[
 ['Conceder permisos',p=>{armiesOf(natOf(p).id).forEach(a=>{a.m=Math.min(1,a.m+.1);a.n*=.95;});addEx(wOf(p),natOf(p).id,-6);return 'La moral sube; algunos no vuelven.';}],
 ['Negarlos',p=>{armiesOf(natOf(p).id).forEach(a=>a.m=Math.max(0,a.m-.08));return 'Las tropas se quedan, molestas.';}]],{gap:3});
E('w_abusos',.8,p=>ruling(p)&&!!wOf(p)&&Object.values(G.occ||{}).includes(natOf(p).id),'Un general tuyo es acusado de abusos contra civiles en territorio ocupado.',p=>[
 ['Juzgarlo',p=>{natOf(p).stab+=1;Object.keys(G.nations).forEach(t=>{if(G.nations[t].alive&&t!==natOf(p).id)addOp(t,2);});return 'El mundo reconoce tu respeto a las leyes de la guerra.';}],
 ['Encubrirlo',p=>{Object.keys(G.nations).forEach(t=>{if(G.nations[t].alive&&t!==natOf(p).id)addOp(t,-4);});p.corrupt++;return 'El escándalo se filtra en el extranjero.';}]]);
E('w_ayuda',.8,p=>ruling(p)&&Object.values(G.occ||{}).includes(natOf(p).id),'Falta comida en las provincias que ocupas.',p=>{const n=natOf(p),c=treasuryIncome(n)*.15;return [
 [`Enviar ayuda (${fmt(c)})`,p=>{n.treas=(n.treas||0)-c;for(const r in G.occ)if(G.occ[r]===n.id&&chance(.5))G.regions[r].pop*=1.002;n.stab+=1;return 'La ayuda calma a la población ocupada.';}],
 ['No es tu problema',p=>{for(const r in G.occ)if(G.occ[r]===n.id&&chance(.25)&&!armiesOf(n.id).some(a=>a.r===r))delete G.occ[r];return 'La guerrilla crece en las zonas ocupadas.';}]];});
E('w_aliado_pide',.8,p=>ruling(p)&&natOf(p).allies.some(a=>warsOf(a).length),p=>{const a=natOf(p).allies.find(x=>warsOf(x).length);p._al=a;return `Tu aliado ${fn_(a)} pide apoyo económico para su guerra.`;},p=>{const n=natOf(p),c=treasuryIncome(n)*.2;return [
 [`Enviar ${fmt(c)}`,p=>{n.treas=(n.treas||0)-c;if(p._al){addOp(p._al,15);G.nations[p._al].army=Math.min(100,G.nations[p._al].army+1.5);}return 'Tu aliado agradece el apoyo.';}],
 ['Solo apoyo diplomático',p=>{if(p._al)addOp(p._al,-8);return 'Tu aliado esperaba más.';}]];});
E('w_heroe',.9,p=>ruling(p)&&!!wOf(p),'Un soldado salva a su pelotón y el país lo convierte en héroe.',p=>[
 ['Condecorarlo en público',p=>{const n=natOf(p);n.stab+=3;if(isReal())n.approval+=3;return 'La ceremonia une al país.';}],
 ['Una carta privada',p=>'El soldado agradece el gesto.']],{gap:4});
E('w_desercion',1,p=>ruling(p)&&!!wOf(p)&&armiesOf(natOf(p).id).some(a=>a.m<.4),'Aumentan las deserciones en tus ejércitos.',p=>{const n=natOf(p),c=soldiersOf(n.id)*perSoldier(n.id)*.05;return [
 [`Subir la paga (${fmt(c)})`,p=>{n.treas=(n.treas||0)-c;armiesOf(n.id).forEach(a=>a.m=Math.min(1,a.m+.15));return 'La moral se recupera.';}],
 ['Endurecer la disciplina',p=>{armiesOf(n.id).forEach(a=>{a.n*=.97;a.m=Math.min(1,a.m+.05);});n.stab-=2;return 'Se frenan las deserciones a un costo.';}]];});
E('w_sabotaje',.7,p=>ruling(p)&&!!wOf(p),p=>`Saboteadores de ${fn_(foeOf(p))} dañan tu red eléctrica.`,p=>{const n=natOf(p),c=n.gdp*.002;return [
 [`Reparar de inmediato (${fmt(c)})`,p=>{n.treas=(n.treas||0)-c;return 'El servicio vuelve en días.';}],
 ['Reparar poco a poco',p=>{shockGDP(n.id,.993);n.stab-=2;return 'Los apagones golpean la economía.';}]];});
E('w_arma',.6,p=>ruling(p)&&!!wOf(p),'Tus ingenieros proponen desarrollar un sistema de armas nuevo.',p=>{const n=natOf(p);ensureEco(n);const c=researchCost(n,'m');return [
 [`Financiarlo (${fmt(c)})`,p=>{if((n.treas||0)<c)return 'El tesoro no alcanza.';return research(n,'m');}],
 ['No ahora',p=>'El proyecto se archiva.']];},{gap:6});
/* ----- General en guerra ----- */
E('g_ofensiva',1.3,p=>isGeneral(p)&&!p.ruler&&!!wOf(p),'El gobierno te ordena una ofensiva arriesgada antes de que termine el año.',p=>[
 ['Obedecer',p=>{armiesOf(natOf(p).id).forEach(a=>{a.auto=true;a.man=0;});if(chance(.55)){p.s.influencia+=6;return 'La ofensiva sorprende al enemigo. Tu prestigio crece.';}p.s.influencia-=4;return 'La ofensiva se atasca.';}],
 ['Negarte por razones tácticas',p=>{if(chance(.35)){p.career.rank=5;p.lead=null;return 'Te degradan a Coronel por insubordinación.';}p.s.influencia+=2;return 'El gobierno acepta tu criterio.';}]],{gap:3});
E('g_popular',.9,p=>isGeneral(p)&&!p.ruler&&p.s.influencia>=45,'La prensa te llama el general más popular del país. Algunos hablan de ti como presidente.',p=>[
 ['Mantener el perfil bajo',p=>{p.s.influencia+=2;return 'Tu discreción tranquiliza al gobierno.';}],
 ['Dar entrevistas',p=>{p.s.influencia+=7;natOf(p).stab-=2;return 'Tu fama crece, y también la desconfianza del gobierno.';}]],{gap:5});
E('g_rival',.8,p=>isGeneral(p)&&!!wOf(p),'Otro general reclama el mando de tu ejército principal.',p=>[
 ['Defender tu puesto ante el ministro',p=>{if(chance(.3+p.s.influencia/200)){p.s.influencia+=3;return 'Conservas el mando.';}p.s.influencia-=5;return 'Pierdes la discusión, pero conservas el rango.';}],
 ['Ceder el mando de una parte',p=>{const L=armiesOf(natOf(p).id).sort((a,b)=>b.n-a.n);if(L[0]&&L[0].n>8000)splitArmy(L[0]);return 'Divides las tropas con tu rival.';}]],{gap:4});
/* ----- vivir bajo ocupación ----- */
E('o_toque',1.4,p=>occHere(p)&&p.age>=14,p=>`Tropas de ${fn_(G.occ[p.r])} imponen toque de queda en ${RG[p.r].nm}.`,p=>[
 ['Obedecer',p=>{p.s.felicidad-=4;return 'Te encierras temprano cada noche.';}],
 ['Ayudar a la resistencia',p=>{if(chance(.2)){p.s.salud-=20;return 'Te hieren en una redada.';}p.s.influencia+=6;if(chance(.3)){delete G.occ[p.r];return 'La resistencia expulsa al ocupante de tu provincia.';}return 'Llevas mensajes de la resistencia.';}]],{gap:2});
E('o_colabora',1,p=>occHere(p)&&p.age>=18,p=>`La administración de ${fn_(G.occ[p.r])} busca funcionarios locales y paga bien.`,p=>[
 ['Aceptar el puesto',p=>{p.dinero+=1.5*U(p);p.s.influencia-=6;FL(p,'colab',G.year);return 'Ganas buen dinero, pero tus vecinos te miran distinto.';}],
 ['Negarte',p=>{p.s.influencia+=2;return 'Te niegas a servir al ocupante.';}]],{gap:4});
E('o_juicio',1.2,p=>FL(p,'colab')&&!occHere(p)&&G.year-FL(p,'colab')<=6,'Tras la liberación, investigan a quienes colaboraron con el ocupante.',p=>[
 ['Cooperar con la investigación',p=>{FL(p,'colab',0);p.s.influencia-=4;p.dinero-=U(p);return 'Pagas una multa y cierras el capítulo.';}],
 ['Negarlo todo',p=>{FL(p,'colab',0);if(chance(.35))return sentence(p);return 'No encuentran pruebas suficientes.';}]]);
E('o_huida',1,p=>occHere(p)&&p.age>=16,'Tu familia piensa huir a una provincia que siga libre.',p=>[
 ['Huir',p=>{const me=natOf(p).id;const s=regionsOf(me).filter(r=>ctrlOf(r)===me).sort((a,b)=>mapDist(a,p.r)-mapDist(b,p.r))[0];if(!s)return 'No queda ninguna provincia libre.';p.r=s;G.sel=s;p.job=null;p.s.felicidad-=6;return `Llegas a ${RG[s].nm} con lo que pudiste cargar.`;}],
 ['Quedarte',p=>{p.s.felicidad-=2;return 'Decides resistir en casa.';}]],{gap:3});
/* ----- vasallos ----- */
E('v_tributo',1,p=>ruling(p)&&vassalsOf(natOf(p).id).length>0,p=>{const v=pick(vassalsOf(natOf(p).id));p._v=v;return `${fn_(v)}, tu vasallo, pide que le bajes el tributo.`;},p=>[
 ['Aceptar',p=>{addOp(p._v,20);natOf(p).treas=(natOf(p).treas||0)-treasuryIncome(G.nations[p._v])*.1;return 'Tu vasallo agradece el gesto.';}],
 ['Negarte',p=>{addOp(p._v,-15);return 'Tu vasallo obedece de mala gana.';}]],{gap:4});
E('v_integra',.8,p=>ruling(p)&&vassalsOf(natOf(p).id).some(v=>opOf(v)>=60),p=>{const v=vassalsOf(natOf(p).id).find(x=>opOf(x)>=60);p._v=v;return `El gobierno de ${fn_(v)} propone unirse formalmente a tu país.`;},p=>[
 ['Aceptar la unión',p=>{const v=p._v,me=natOf(p).id;if(!G.nations[v]||!G.nations[v].alive)return 'Ya no es posible.';regionsOf(v).slice().forEach(r=>transfer(r,me));delete G.dip.vas[v];checkGone(v);touchDip();flushNews();return `${fn_(v)} se une a tu nación.`;}],
 ['Mantenerlo como vasallo',p=>'Prefieres conservar la relación actual.']],{gap:8});
E('v_independentistas',.8,p=>ruling(p)&&vassalsOf(natOf(p).id).length>0,p=>{const v=pick(vassalsOf(natOf(p).id));p._v=v;return `Crece un movimiento independentista en ${fn_(v)}.`;},p=>{const n=natOf(p),c=treasuryIncome(n)*.15;return [
 [`Financiar a su gobierno (${fmt(c)})`,p=>{n.treas=(n.treas||0)-c;addOp(p._v,10);return 'El gobierno vasallo se fortalece.';}],
 ['Dejar que lo resuelvan',p=>{addOp(p._v,-15);return 'El movimiento gana fuerza.';}]];},{gap:5});
E('v_señor',1,p=>ruling(p)&&!!overlordOf(natOf(p).id),p=>`${fn_(overlordOf(natOf(p).id))}, tu señor, exige tropas para sus guerras.`,p=>[
 ['Enviarlas',p=>{const n=natOf(p);n.army=Math.max(1.5,n.army*.85);return 'Tus soldados marchan bajo otra bandera.';}],
 ['Proclamar la independencia',p=>{const n=natOf(p),o=overlordOf(n.id);delete G.dip.vas[n.id];touchDip();declareWar(o,n.id);flushNews();return `${fn_(o)} te declara la guerra.`;}]],{gap:4});
/* ----- diplomacia ----- */
E('d_cumbre',.9,p=>ruling(p),'Te invitan a una cumbre internacional de jefes de Estado.',p=>[
 ['Asistir y negociar',p=>{const me=natOf(p).id;neighborsOf(me).concat(Object.keys(G.nations).slice(0,0)).forEach(t=>{if(G.nations[t].alive)addOp(t,5);});p.s.influencia+=2;return 'Mejoras la relación con tus vecinos.';}],
 ['Enviar a un ministro',p=>'Tu ausencia pasa casi desapercibida.']],{gap:4});
E('d_espias',.7,p=>ruling(p),p=>{const o=otherNat(p);p._o=o&&o.id;return `${o?o.name:'Un país'} descubre una red de espías tuya.`;},p=>[
 ['Pedir disculpas',p=>{if(p._o)addOp(p._o,-5);return 'El incidente se cierra.';}],
 ['Negarlo todo',p=>{if(p._o)addOp(p._o,-15);return 'Expulsan a tus diplomáticos.';}]],{gap:5});
E('d_refugiados',1,p=>ruling(p)&&neighborsOf(natOf(p).id).some(t=>warsOf(t).length),p=>{const t=neighborsOf(natOf(p).id).find(x=>warsOf(x).length);p._o=t;return `Miles de refugiados de la guerra en ${fn_(t)} llegan a tu frontera.`;},p=>[
 ['Acogerlos',p=>{const n=natOf(p);n.stab-=2;n.pop*=1.001;if(p._o)addOp(p._o,10);Object.keys(G.nations).forEach(t=>{if(G.nations[t].alive&&chance(.1))addOp(t,2);});return 'Abres albergues. El mundo lo reconoce.';}],
 ['Cerrar la frontera',p=>{if(p._o)addOp(p._o,-8);natOf(p).stab+=1;return 'Cierras la frontera.';}]],{gap:4});
E('d_ofrece_alianza',.9,p=>ruling(p)&&natOf(p).allies.length<3,p=>{const me=natOf(p).id;const c=neighborsOf(me).concat(Object.keys(G.nations)).filter(t=>G.nations[t]&&G.nations[t].alive&&t!==me&&!natOf(p).allies.includes(t)&&!warBetween(t,me)&&opOf(t)>0);const t=c.length?c[0]:null;p._o=t;return t?`${fn_(t)} te propone una alianza militar.`:'Nadie propone alianzas este año.';},p=>[
 ['Aceptar',p=>{const t=p._o,n=natOf(p);if(!t||!G.nations[t].alive)return 'La propuesta se cae.';n.allies.push(t);G.nations[t].allies.push(n.id);addOp(t,10);touchDip();return `Firmas la alianza con ${fn_(t)}.`;}],
 ['Rechazar',p=>{if(p._o)addOp(p._o,-5);return 'Agradeces y declinas.';}]],{gap:6});
E('d_ofrece_nap',.8,p=>ruling(p)&&neighborsOf(natOf(p).id).some(t=>!napOf(natOf(p).id,t)&&!warBetween(t,natOf(p).id)),p=>{const me=natOf(p).id;const t=neighborsOf(me).find(x=>!napOf(me,x)&&!warBetween(x,me));p._o=t;return `${fn_(t)} propone un pacto de no agresión por 10 años.`;},p=>[
 ['Firmarlo',p=>{ensureV07();G.dip.nap[pk(natOf(p).id,p._o)]=G.year+10;addOp(p._o,6);return 'Firmas el pacto.';}],
 ['Mantener las manos libres',p=>{addOp(p._o,-4);return 'Declinas la propuesta.';}]],{gap:6});
/* ----- economía nacional ----- */
E('e_prestamo',.8,p=>ruling(p)&&(ensureEco(natOf(p)),natOf(p).debtR<.9),'Un banco internacional te ofrece un préstamo barato para infraestructura.',p=>{const n=natOf(p),a=n.gdp*.008;return [
 [`Aceptar ${fmtN(a)}`,p=>{n.treas=(n.treas||0)+a;n.bonds+=a*.7;n.debtR+=a/n.gdp;return 'El dinero llega con intereses bajos.';}],
 ['Rechazarlo',p=>'Prefieres no endeudarte.']];},{gap:6});
E('e_calificacion',1.2,p=>ruling(p)&&(ensureEco(natOf(p)),natOf(p).debtR>.95),p=>`Una agencia baja la calificación de la deuda de ${natOf(p).name} (${Math.round(natOf(p).debtR*100)} % del PIB).`,p=>[
 ['Plan de austeridad',p=>{const n=natOf(p);n.debtR=Math.max(0,n.debtR-.06);shockGDP(n.id,.99);if(isReal())n.approval-=6;n.stab-=2;return 'La deuda baja, pero el ajuste duele.';}],
 ['Ignorar a la agencia',p=>{const n=natOf(p);n.rate+=1;return 'Las tasas de interés suben un punto.';}]],{gap:4});
E('e_fabrica',.9,p=>ruling(p),p=>`Una empresa extranjera quiere construir una planta enorme en ${RG[capitalOf(natOf(p).id)].nm}.`,p=>[
 ['Dar incentivos fiscales',p=>{const n=natOf(p),r=pick(regionsOf(n.id).slice().sort((a,b)=>G.regions[b].pop-G.regions[a].pop).slice(0,5));if(canBuild(r,'fab'))build(r,'fab');n.treas=(n.treas||0)-treasuryIncome(n)*.1;return `La planta se instala en ${RG[r].nm}.`;}],
 ['Exigir socios locales',p=>{if(chance(.5)){const n=natOf(p);shockGDP(n.id,1.003);return 'La empresa acepta y se asocia con empresas locales.';}return 'La empresa se va a otro país.';}]],{gap:6});
E('e_universidad',.8,p=>ruling(p),'Las universidades piden fondos para un gran programa de investigación.',p=>{const n=natOf(p);ensureEco(n);const c=researchCost(n,'c');return [
 [`Financiarlo (${fmt(c)})`,p=>{if((n.treas||0)<c)return 'El tesoro no alcanza.';return research(n,'c');}],
 ['No hay presupuesto',p=>'El programa espera mejores tiempos.']];},{gap:5});
E('e_sanciones',1,p=>ruling(p)&&natOf(p).sanc>0,'Las sanciones ahogan tu comercio exterior. Tus ministros proponen buscar socios alternativos.',p=>[
 ['Buscar nuevos socios',p=>{const me=natOf(p).id;const t=Object.values(G.nations).filter(x=>x.alive&&x.id!==me&&opOf(x.id)>-10).sort((a,b)=>b.gdp-a.gdp)[2];if(t){G.dip.tr=G.dip.tr||{};G.dip.tr[pk(me,t.id)]=G.year+10;return `Firmas un acuerdo comercial con ${t.name}.`;}return 'Nadie quiere arriesgarse.';}],
 ['Resistir',p=>{natOf(p).stab+=2;return 'Apelas al orgullo nacional.';}]],{gap:4});
E('e_auge',1,p=>ruling(p)&&tradeBonus(natOf(p).id)>.3,'Tus tratados comerciales disparan las exportaciones.',p=>[
 ['Ahorrar las ganancias',p=>{const n=natOf(p);n.treas=(n.treas||0)+treasuryIncome(n)*.3;return 'El tesoro crece.';}],
 ['Bajar impuestos',p=>{const n=natOf(p);if(isReal())n.approval+=5;return 'La gente celebra.';}]],{gap:5});
E('e_inflacion_guerra',1,p=>ruling(p)&&isReal()&&!!wOf(p),'La guerra dispara los precios de alimentos y combustible.',p=>[
 ['Controlar precios',p=>{const n=natOf(p);n.infl=Math.max(1,n.infl*.8);shockGDP(n.id,.995);return 'Los precios se contienen, aparece el mercado negro.';}],
 ['Imprimir dinero',p=>{const n=natOf(p);n.treas=(n.treas||0)+treasuryIncome(n)*.4;n.infl+=R(4,9);return 'El tesoro se llena; la inflación se dispara.';}]],{gap:4});
/* ----- ciudadanos en tiempo de guerra ----- */
E('c_racion',1.2,p=>!p.ruler&&p.age>=14&&atWar(p),'El gobierno raciona alimentos y gasolina.',p=>[
 ['Respetar el racionamiento',p=>{p.s.felicidad-=3;return 'Haces filas cada semana.';}],
 [`Comprar en el mercado negro (${fmt(.1*U(p))})`,p=>{p.dinero-=.1*U(p);if(chance(.1)&&isReal()){p.dinero-=.3*U(p);return 'Te multan por comprar en el mercado negro.';}return 'Comes mejor que tus vecinos.';}]],{gap:3});
E('c_voluntario',1,p=>!p.ruler&&p.age>=16&&atWar(p),'Buscan voluntarios para hospitales y albergues de guerra.',p=>[
 ['Ofrecerte',p=>{p.s.felicidad+=4;p.s.influencia+=3;return 'Tu trabajo voluntario se vuelve conocido en tu barrio.';}],
 ['No tienes tiempo',p=>'Sigues con tu rutina.']],{gap:4});
E('c_bonos',.9,p=>!p.ruler&&p.age>=18&&atWar(p)&&p.dinero>0,'Venden bonos de guerra en tu banco: pagan 5 % al año si el país gana.',p=>[
 [`Comprar ${fmt(Math.max(0,p.dinero*.2))}`,p=>{const a=Math.max(0,p.dinero*.2);p.dinero-=a;p.inv.push({r:capitalOf(natOf(p).id),t:'inm',amt:a,val:a,y:G.year});p.s.influencia+=1;return 'Inviertes en la causa de tu país.';}],
 ['No arriesgarte',p=>'Guardas tu dinero.']],{gap:5});
E('c_ocupas_vida',1,p=>!p.ruler&&p.age>=18&&Object.values(G.occ||{}).includes(natOf(p).id),'Tu país ocupa provincias enemigas y ofrece puestos en la administración militar.',p=>[
 ['Aceptar un puesto',p=>{p.dinero+=U(p);p.s.felicidad-=2;return 'Trabajas un año en territorio ocupado.';}],
 ['Quedarte en casa',p=>'Prefieres no involucrarte.']],{gap:5});
E('c_liberacion',1.4,p=>!!FL(p,'occd')&&!occHere(p),p=>`¡Tu provincia, ${RG[p.r].nm}, vuelve a manos de tu país!`,p=>[
 ['Celebrar en la plaza',p=>{FL(p,'occd',0);p.s.felicidad+=10;return 'Hay fiesta en las calles.';}]],{prio:1});
// marca a quien vivió bajo ocupación (para el evento de liberación)
const _yv08=yearV08;yearV08=function(p){_yv08(p);if(P&&P.alive&&occHere(P))FL(P,'occd',1);};
