/* ===== v0.5: +100 eventos (historias encadenadas con banderas p.fl) ===== */
const FL=(p,k,v)=>{p.fl=p.fl||{};if(v===undefined)return p.fl[k];p.fl[k]=v;};
function E(id,pr,when,text,opts,x){EV.push(Object.assign({id,pr,when,text:typeof text==='function'?text:()=>text,opts:p=>opts(p).map(([t,go])=>({t,go}))},x||{}));}
const age=(p,a,b)=>p.age>=a&&p.age<=b;
const kid=p=>p.children.length?pick(p.children):null;
const cu=p=>cultOf(natOf(p).id),inN=(p,arr)=>arr.includes(natOf(p).id);
const sib=(p,s)=>{const c=cultOf(regOf(p).w0);const k={name:rndFirst(s,c),sex:s,age:0,rel:70};p.siblings.push(k);return k;};

/* ----- infancia ----- */
E('primer_dia',1,p=>p.age===6,'Primer día de primaria. Todos se ven nerviosos.',p=>[
 ['Presentarte con alguien',p=>{if(p.ppl.filter(x=>x.k==='amigo').length<6){const f=newPerson('amigo',p,{age:6,rel:65});p.ppl.push(f);return `Te haces amigo de ${f.name}.`;}return 'Haces amigos rápido.';}],
 ['Quedarte callado',p=>{p.s.felicidad-=2;return 'El primer día se te hace eterno.';}]]);
E('dibujo',1,p=>age(p,5,9),'Hay un concurso de dibujo en la escuela.',p=>[
 ['Dibujar a tu familia',p=>{if(chance(.35)){p.s.felicidad+=6;return '¡Tu dibujo gana y lo cuelgan en la entrada!';}p.s.felicidad+=2;return 'No ganas, pero tu mamá lo pega en el refri.';}],
 ['Dibujar un dragón',p=>{p.s.inteligencia+=1;return 'Tus compañeros quedan impresionados.';}]]);
E('hermanito',.8,p=>age(p,2,10)&&p.parents.every(x=>x.alive)&&p.parents.some(x=>x.role==='Madre'&&x.age<42),'¡Tus papás te dan la noticia: vas a tener un hermanito!',p=>[
 ['¡Qué emoción!',p=>{const s=chance(.5)?'M':'F';const k=sib(p,s);p.s.felicidad+=4;return (s==='F'?`Nace tu hermanita ${k.name}.`:`Nace tu hermanito ${k.name}.`);}],
 ['Ponerte celoso',p=>{const s=chance(.5)?'M':'F';const k=sib(p,s);k.rel=50;p.s.felicidad-=3;return `Nace ${k.name}. Te cuesta compartir la atención.`;}]]);
E('bici',1,p=>age(p,5,10),'Tu papá quiere enseñarte a andar en bicicleta.',p=>[
 ['Intentarlo sin rueditas',p=>{if(chance(.3)){p.s.salud-=3;return 'Te caes y te raspas la rodilla, pero aprendes.';}p.s.felicidad+=5;return '¡Ya sabes andar en bici!';}],
 ['Mejor otro día',p=>'Lo dejas para después.']]);
E('perdido',.7,p=>age(p,4,8),'Te separas de tu mamá en el mercado y no la encuentras.',p=>[
 ['Pedir ayuda a un policía',p=>{p.s.inteligencia+=1;return 'Te ayudan a encontrarla. Gran susto.';}],
 ['Buscarla tú solo',p=>{if(chance(.5)){p.s.felicidad-=4;return 'Lloras un buen rato hasta que te encuentra.';}return 'La encuentras en el puesto de frutas.';}]]);
E('diente',.8,p=>age(p,6,8),'Se te cae un diente de leche.',p=>[
 [cu(p)==='hisp'?'Dejarlo para el Ratón Pérez':'Dejarlo bajo la almohada',p=>{p.dinero+=5;p.s.felicidad+=3;return 'Amaneces con una moneda bajo la almohada.';}],
 ['Guardarlo en un frasco',p=>'Lo guardas como recuerdo.']]);
E('consola',1,p=>age(p,8,13),'Todos tus amigos tienen la nueva consola de videojuegos.',p=>[
 ['Pedírsela a tus papás',p=>{const pa=p.parents.find(x=>x.alive);if(pa&&pa.rel>65&&chance(.6)){p.s.felicidad+=6;return '¡Te la regalan de cumpleaños!';}p.s.felicidad-=3;return 'Te dicen que no hay dinero para eso.';}],
 ['Ahorrar tu domingo',p=>{p.s.inteligencia+=1;return 'Aprendes a ahorrar. En unos meses te la compras.';}]]);
E('varicela',.8,p=>age(p,2,10),'Te da varicela y te pica todo.',p=>[
 ['Aguantarte sin rascar',p=>{p.s.salud-=2;return 'Una semana en cama, pero sin marcas.';}],
 ['Rascarte',p=>{p.s.apariencia-=3;return 'Te quedan algunas marcas.';}]]);
E('mudanza_fam',.6,p=>age(p,5,14)&&regionsOf(natOf(p).id).length>1,'Tus papás consiguen trabajo en otra ciudad y se mudan.',p=>[
 ['Despedirte de tus amigos',p=>{const rs=regionsOf(natOf(p).id).filter(r=>r!==p.r);const r=rs.sort((a,b)=>G.regions[b].pop-G.regions[a].pop)[RI(0,Math.min(4,rs.length-1))];p.r=r;G.sel=r;p.ppl=p.ppl.filter(x=>x.rel>=70||x.k!=='amigo');p.s.felicidad-=4;return `Te mudas a ${RG[r].nm}.`;}]]);
E('perro_vecino',.7,p=>age(p,5,12),'El perro del vecino te persigue en la calle.',p=>[
 ['Correr',p=>{if(chance(.3)){p.s.salud-=3;return 'Te alcanza y te muerde el pantalón.';}return 'Llegas a casa con el corazón a mil.';}],
 ['Quedarte quieto',p=>{p.s.inteligencia+=1;return 'El perro se aburre y se va.';}]]);
/* ----- adolescencia ----- */
E('banda',1,p=>age(p,13,17)&&!FL(p,'banda'),'Unos amigos quieren formar una banda de rock y te invitan.',p=>[
 ['Unirte como vocalista',p=>{FL(p,'banda',1);p.s.felicidad+=5;p.s.apariencia+=1;return 'Ensayan en la cochera todos los sábados.';}],
 ['Tocar la batería',p=>{FL(p,'banda',1);p.s.felicidad+=4;return 'Los vecinos no están contentos, pero tú sí.';}],
 ['No es lo tuyo',p=>'Prefieres escuchar música.']]);
E('banda_tocada',1.5,p=>FL(p,'banda')===1&&age(p,15,26),'Tu banda consigue su primera tocada en un bar.',p=>[
 ['Dar todo en el escenario',p=>{if(chance(.45+p.s.apariencia/400)){FL(p,'banda',2);p.s.influencia+=4;p.s.felicidad+=6;return '¡El público pide otra! Empiezan a llamarlos de otros lugares.';}FL(p,'banda',-1);return 'Nadie les hace caso. La banda se desintegra.';}],
 ['Ponerte nervioso y cancelar',p=>{FL(p,'banda',-1);return 'La banda se separa.';}]]);
E('banda_disquera',1.5,p=>FL(p,'banda')===2&&age(p,18,32),'Una disquera independiente quiere firmar a tu banda.',p=>[
 ['Firmar el contrato',p=>{FL(p,'banda',3);if(chance(.4)){const m=R(3,15)*U(p);p.dinero+=m;p.s.influencia+=12;p.s.felicidad+=10;return `Su canción suena en la radio. Ganas ${fmt(m)}.`;}p.dinero+=.5*U(p);return 'El disco no vende mucho, pero cumples un sueño.';}],
 ['Dejar la música y estudiar',p=>{FL(p,'banda',-1);p.s.inteligencia+=2;return 'Guardas la guitarra en el clóset.';}]]);
E('olimpiada',.8,p=>age(p,12,17)&&p.s.inteligencia>=55,'Te invitan a la olimpiada de matemáticas.',p=>[
 ['Prepararte en serio',p=>{if(chance(p.s.inteligencia/140)){p.s.inteligencia+=4;p.s.influencia+=3;if(p.sch)p.sch.g=clamp(p.sch.g+.3,5,10);return '¡Medalla de plata nacional!';}p.s.inteligencia+=2;return 'No ganas, pero aprendes muchísimo.';}],
 ['No participar',p=>'Prefieres no presionarte.']]);
E('viral',.7,p=>age(p,13,30),'Un video tuyo se vuelve viral en redes.',p=>[
 ['Aprovechar la fama',p=>{p.s.influencia+=6;p.s.felicidad+=4;if(chance(.25)){p.dinero+=.3*U(p);return 'Te llegan patrocinios.';}return 'Ganas miles de seguidores.';}],
 ['Borrarlo',p=>{p.s.felicidad-=2;return 'Prefieres la privacidad.';}]]);
E('verano',1,p=>age(p,14,17),'Puedes trabajar este verano.',p=>[
 ['Ayudar en un negocio familiar',p=>{p.dinero+=.06*U(p);p.s.inteligencia+=1;return 'Ganas tu primer dinero.';}],
 ['Vacaciones con la familia',p=>{p.s.felicidad+=5;return 'Un verano inolvidable.';}]]);
E('graduacion',1,p=>p.age===17,'Llega la fiesta de graduación de la prepa.',p=>[
 [`Ir a lo grande (${fmt(.05*U(p))})`,p=>{p.dinero-=.05*U(p);p.s.felicidad+=6;p.ppl.forEach(x=>x.k==='amigo'&&(x.rel+=5));return 'Bailas toda la noche con tus amigos.';}],
 ['Ir sencillo',p=>{p.s.felicidad+=3;return 'Te diviertes sin gastar mucho.';}]]);
E('orientacion',1,p=>p.age===16,'La orientadora vocacional te aplica un test.',p=>[
 ['Tomarlo en serio',p=>{p.s.inteligencia+=2;const top=p.s.inteligencia>=60?'Medicina o Ingeniería':p.s.influencia>=20?'Derecho':'Economía';return `El test dice que tienes perfil para ${top}.`;}],
 ['Contestar al azar',p=>'El resultado dice que deberías ser astronauta.']]);
E('intercambio',.6,p=>age(p,15,17)&&p.s.inteligencia>=50,'Puedes ir de intercambio un semestre al extranjero.',p=>[
 [`Ir (${fmt(.4*U(p))})`,p=>{p.dinero-=.4*U(p);p.s.inteligencia+=4;p.s.felicidad+=5;if(p.ppl.length<10){const c=pick(['angl','germ','fran','japo']);const f=newPerson('amigo',p,{c,age:p.age,rel:70});p.ppl.push(f);return `Aprendes otro idioma y te haces amigo de ${f.name}.`;}return 'Aprendes otro idioma.';}],
 ['Quedarte',p=>'Te quedas con tu familia.']]);
E('seleccion',1,p=>age(p,14,18)&&(p.s.salud>=75||(p.sch&&p.sch.club==='deportes'))&&!FL(p,'atleta'),'Te seleccionan para el equipo estatal de tu deporte.',p=>[
 ['Entrenar duro',p=>{FL(p,'atleta',1);p.s.salud+=4;p.s.apariencia+=2;return 'Entrenas todos los días. Eres de los mejores.';}],
 ['Priorizar la escuela',p=>{p.s.inteligencia+=2;return 'Prefieres tus estudios.';}]]);
E('beca_deportiva',1.5,p=>FL(p,'atleta')===1&&age(p,17,19),'Una universidad te ofrece beca deportiva completa.',p=>[
 ['Aceptarla',p=>{FL(p,'atleta',2);p.sch.beca=1;p.sch.g=Math.max(p.sch.g,8);p.s.felicidad+=6;return 'Estudiarás gratis mientras compitas.';}],
 ['Intentar ser profesional',p=>{if(chance(.12)){p.dinero+=10*U(p);p.s.influencia+=12;return '¡Firmas con un equipo profesional!';}p.s.felicidad-=6;return 'No logras entrar a ningún equipo.';}]]);
E('bully_testigo',1,p=>age(p,11,16),'Ves que unos compañeros molestan a un chico más chico.',p=>[
 ['Defenderlo',p=>{p.s.influencia+=3;if(chance(.3)){p.s.salud-=3;return 'Te llevas un empujón, pero ganas un amigo leal.';}const f=newPerson('amigo',p,{rel:80});p.ppl.push(f);return `${f.name} te agradece para siempre.`;}],
 ['Avisar a un maestro',p=>{p.s.inteligencia+=1;return 'Los suspenden.';}],
 ['No meterte',p=>{p.s.felicidad-=3;return 'Te quedas con un mal sabor de boca.';}]]);
E('escapada',1,p=>age(p,14,17),'Tus amigos se van a una fiesta y tus papás no te dieron permiso.',p=>[
 ['Escaparte',p=>{if(chance(.4)){p.parents.forEach(x=>x.alive&&(x.rel-=10));return 'Te cachan. Castigado un mes.';}p.s.felicidad+=5;return 'Nadie se entera. Gran noche.';}],
 ['Obedecer',p=>{p.parents.forEach(x=>x.alive&&(x.rel+=3));return 'Tus papás valoran tu madurez.';}]]);
E('cigarro',1,p=>age(p,14,24)&&!FL(p,'fuma'),'Te ofrecen un cigarro en una reunión.',p=>[
 ['Probarlo',p=>{if(chance(.45)){FL(p,'fuma',1);p.s.salud-=2;return 'Te empieza a gustar. Ahora fumas de vez en cuando.';}return 'Toses tanto que no lo vuelves a intentar.';}],
 ['Rechazarlo',p=>{FL(p,'fuma',-1);return 'No te interesa.';}]]);
/* ----- adulto joven ----- */
E('roomies',1,p=>age(p,18,28)&&!p.partner,'Unos amigos buscan con quién compartir departamento.',p=>[
 ['Mudarte con ellos',p=>{p.s.felicidad+=4;p.dinero+=.05*U(p);return 'Ahorras en renta y te diviertes.';}],
 ['Vivir solo',p=>{p.s.felicidad+=1;return 'Prefieres tu espacio.';}]]);
E('mochilero',.8,p=>age(p,19,30),'Te proponen un viaje de mochilero por varios países.',p=>[
 [`Ir 2 meses (${fmt(.25*U(p))})`,p=>{p.dinero-=.25*U(p);p.s.felicidad+=8;p.s.inteligencia+=2;return 'Conoces culturas, comida y gente increíble.';}],
 ['Seguir trabajando',p=>'Será para otra ocasión.']]);
E('tatuaje',.7,p=>age(p,18,40),'Llevas tiempo pensando en hacerte un tatuaje.',p=>[
 ['Hacértelo',p=>{p.s.felicidad+=3;if(chance(.2)){p.s.felicidad-=6;return 'Te arrepientes del diseño.';}return 'Te encanta cómo quedó.';}],
 ['No',p=>'Mejor no.']]);
E('startup',.7,p=>age(p,20,38)&&!FL(p,'startup'),'Un amigo programador te invita a fundar una startup.',p=>[
 [`Entrar como socio (${fmt(.5*U(p))})`,p=>{p.dinero-=.5*U(p);FL(p,'startup',G.year);return 'Trabajan de noche desde una cochera.';}],
 ['No arriesgar',p=>{FL(p,'startup',-1);return 'Prefieres un empleo seguro.';}]]);
E('startup_ronda',2,p=>FL(p,'startup')>0&&G.year-FL(p,'startup')>=2,'La startup busca inversionistas. Es el momento de la verdad.',p=>[
 ['Presentar ante los inversionistas',p=>{FL(p,'startup',-2);const r=Math.random();if(r<.15){const m=R(40,200)*U(p);p.dinero+=m;p.s.influencia+=15;return `¡Levantan capital y luego venden la empresa! Te tocan ${fmt(m)}.`;}if(r<.45){p.dinero+=2*U(p);return 'Consiguen una ronda pequeña; vendes tu parte con ganancia.';}p.s.felicidad-=6;return 'Nadie invierte. La startup cierra.';}],
 ['Vender tu parte ya',p=>{FL(p,'startup',-2);p.dinero+=.8*U(p);return 'Vendes tu parte a tu socio.';}]]);
E('posgrado',.7,p=>age(p,23,40)&&(p.edu.degrees||[]).length>0&&!FL(p,'posgrado'),'Te aceptan en una maestría.',p=>[
 [`Estudiarla (${fmt(.6*U(p))})`,p=>{p.dinero-=.6*U(p);FL(p,'posgrado',1);p.s.inteligencia+=5;if(p.job)p.job.bonus=(p.job.bonus||1)*1.15;return 'Dos años intensos. Tu sueldo sube 15 %.';}],
 ['No es el momento',p=>'Lo dejas para después.']]);
E('plaza',.7,p=>age(p,22,45)&&!p.ruler&&!p.prison,'Abren un examen para una plaza en el gobierno.',p=>[
 ['Presentarlo',p=>{if(chance(p.s.inteligencia/120)){p.job={name:'Servidor público',o:'4',k:1.25,bonus:1};p.career={track:null,rank:0,years:0};return 'Ganas la plaza: empleo estable y con prestaciones.';}return 'No alcanzas el puntaje.';}],
 ['No te interesa',p=>'Sigues en lo tuyo.']]);
E('capital',.6,p=>age(p,20,32)&&p.r!==capitalOf(natOf(p).id),'Te ofrecen mudarte a la capital por una oportunidad.',p=>[
 ['Mudarte',p=>{const r=capitalOf(natOf(p).id);p.r=r;G.sel=r;p.s.influencia+=3;if(p.job)p.job.bonus=(p.job.bonus||1)*1.1;return `Te mudas a ${RG[r].nm}.`;}],
 ['Quedarte en tu tierra',p=>{p.s.felicidad+=2;return 'Prefieres estar cerca de tu familia.';}]]);
/* ----- trabajo y carrera ----- */
E('jefe_nuevo',.8,p=>!!p.job,'Llega un jefe nuevo a tu área.',p=>[
 ['Presentarte bien',p=>{p.ppl=p.ppl.filter(x=>x.k!=='jefe');const j=newPerson('jefe',p,{age:p.age+RI(3,15),rel:62});p.ppl.push(j);return `${j.name} parece buena persona.`;}],
 ['Esperar a ver',p=>{p.ppl=p.ppl.filter(x=>x.k!=='jefe');const j=newPerson('jefe',p,{age:p.age+RI(3,15),rel:45});p.ppl.push(j);return `${j.name} no te conoce todavía.`;}]]);
E('home_office',.7,p=>!!p.job&&age(p,22,60),'Tu empresa permite trabajar desde casa.',p=>[
 ['Trabajar desde casa',p=>{p.s.felicidad+=4;p.s.salud-=1;return 'Ahorras horas de tráfico.';}],
 ['Ir a la oficina',p=>{p.s.influencia+=2;return 'Te ven más y eso cuenta.';}]]);
E('burnout',.8,p=>(p.job||p.career.track)&&age(p,25,60),'Llevas meses agotado y sin ganas de nada.',p=>[
 ['Tomar vacaciones',p=>{p.s.felicidad+=6;p.s.salud+=3;return 'Desconectas y vuelves con energía.';}],
 ['Aguantar',p=>{p.s.salud-=5;p.s.felicidad-=6;return 'Terminas enfermándote.';}]]);
E('competencia',.8,p=>!!p.job,'La competencia te ofrece trabajo con mejor sueldo.',p=>[
 ['Aceptar',p=>{p.job.bonus=(p.job.bonus||1)*1.18;p.ppl=p.ppl.filter(x=>x.k!=='jefe');return 'Tu sueldo sube 18 %.';}],
 ['Usarlo para negociar',p=>{if(chance(.5)){p.job.bonus=(p.job.bonus||1)*1.1;return 'Tu jefe te iguala parte de la oferta.';}const j=p.ppl.find(x=>x.k==='jefe');if(j)j.rel-=10;return 'A tu jefe no le gusta la presión.';}],
 ['Quedarte por lealtad',p=>{const j=p.ppl.find(x=>x.k==='jefe');if(j)j.rel+=8;return 'Tu jefe lo valora.';}]]);
E('error',.7,p=>!!p.job,'Cometes un error grave en el trabajo.',p=>[
 ['Reconocerlo',p=>{const j=p.ppl.find(x=>x.k==='jefe');if(j)j.rel+=3;return 'Te regañan, pero aprecian tu honestidad.';}],
 ['Echarle la culpa a otro',p=>{if(chance(.4)){p.job=null;return 'Se descubre. Te despiden.';}return 'Nadie se da cuenta.';}]]);
E('premio',.6,p=>!!p.job&&age(p,25,64),'Te nominan a empleado del año.',p=>[
 ['Dar un discurso',p=>{p.s.influencia+=3;p.job.bonus=(p.job.bonus||1)*1.05;return 'Recibes un bono y aplausos.';}]]);
E('automatizacion',.7,p=>!!p.job&&G.year>=2028&&['4','8','9','5'].includes(p.job.o),'Tu empresa va a automatizar tu puesto con inteligencia artificial.',p=>[
 [`Capacitarte en tecnología (${fmt(.15*U(p))})`,p=>{p.dinero-=.15*U(p);p.s.inteligencia+=3;p.job={name:'Técnico',o:'3',k:1,bonus:1};return 'Te reconviertes en técnico.';}],
 ['Esperar lo mejor',p=>{if(chance(.5)){p.job=null;return 'Te liquidan.';}return 'Por ahora conservas tu puesto.';}]]);
E('mordida',1,p=>!!p.biz,'Un inspector dice que tu negocio "tiene irregularidades" y pide una mordida.',p=>[
 [`Pagar (${fmt(.05*U(p))})`,p=>{p.dinero-=.05*U(p);if(isReal())p.corrupt++;return 'El inspector se va contento.';}],
 ['Negarte y denunciarlo',p=>{if(chance(.5)){p.biz.luck*=.85;return 'Te clausuran unos días.';}p.s.influencia+=3;return 'Lo suspenden. Te vuelves ejemplo en la zona.';}]]);
E('competidor',1,p=>!!p.biz,'Abren un negocio igual al tuyo justo enfrente.',p=>[
 ['Bajar precios',p=>{p.biz.luck*=.95;return 'Mantienes a tus clientes, ganando menos.';}],
 ['Mejorar la calidad',p=>{p.dinero-=.1*U(p);p.biz.luck=Math.min(1.8,p.biz.luck*1.1);return 'Tus clientes notan la diferencia.';}]]);
E('resena',.8,p=>!!p.biz,'Un influencer recomienda tu negocio.',p=>[
 ['Aprovechar con promociones',p=>{p.biz.luck=Math.min(1.8,p.biz.luck*1.2);p.s.influencia+=2;return 'Filas en la puerta toda la semana.';}]]);
E('socio',.7,p=>p.biz&&p.biz.lvl>=1,'Alguien quiere entrar como socio con capital fresco.',p=>[
 ['Aceptar al socio',p=>{p.dinero+=2*U(p);p.biz.luck*=.95;return 'Recibes capital, pero ahora compartes ganancias.';}],
 ['Seguir solo',p=>'Prefieres mantener el control.']]);
E('mision_paz',1,p=>p.career.track==='militar'&&!atWar(p),'Te ofrecen ir a una misión de paz internacional.',p=>[
 ['Ir',p=>{p.s.influencia+=6;p.career.years+=1;p.dinero+=.5*U(p);if(chance(.08)){p.s.salud-=20;return 'Una emboscada te deja herido.';}return 'Vuelves con honores y experiencia.';}],
 ['Quedarte en casa',p=>'Sigues en tu base.']]);
E('elite',.8,p=>p.career.track==='militar'&&p.s.salud>=60,'Te invitan a un curso de fuerzas especiales.',p=>[
 ['Aceptar',p=>{if(chance(p.s.salud/120)){p.s.influencia+=5;p.career.years+=1;return 'Lo terminas entre los mejores.';}p.s.salud-=6;return 'Te lesionas y no lo terminas.';}],
 ['Rechazar',p=>'No es para ti.']]);
E('debate',1,p=>p.career.track==='politica'&&p.career.rank>=2,'Debate televisado contra tus rivales.',p=>[
 ['Atacar sus propuestas',p=>{if(chance(.5)){p.s.influencia+=6;return 'Ganas el debate según las encuestas.';}p.s.influencia-=4;return 'Te ven agresivo.';}],
 ['Presentar tus ideas',p=>{if(chance(p.s.inteligencia/120)){p.s.influencia+=5;return 'Convences con tus propuestas.';}return 'Pasas desapercibido.';}]]);
E('alianza_partido',.7,p=>p.career.track==='politica'&&p.career.rank>=1,'Otro partido propone una alianza electoral.',p=>[
 ['Aceptar',p=>{p.s.influencia+=5;return 'Sumas votos, aunque algunos te llaman traidor.';}],
 ['Ir solos',p=>{p.s.felicidad+=2;return 'Tus bases aplauden tu coherencia.';}]]);
E('hijo_escandalo',.6,p=>p.career.track==='politica'&&p.children.some(c=>c.age>=16),'Uno de tus hijos aparece en una foto polémica en redes.',p=>[
 ['Defenderlo públicamente',p=>{const c=kid(p);c.rel=(c.rel||60)+10;p.s.influencia-=3;return 'Tu familia te lo agradece.';}],
 ['Pedir disculpas',p=>{const c=kid(p);c.rel=(c.rel||60)-8;p.s.influencia+=1;return 'Controlas el daño.';}]]);
/* ----- familia y relaciones ----- */
E('aniversario',1,p=>p.married,'Es tu aniversario de bodas.',p=>[
 [`Cena especial (${fmt(.04*U(p))})`,p=>{p.dinero-=.04*U(p);p.partner.rel+=8;return 'Una noche perfecta.';}],
 ['Se te olvida',p=>{p.partner.rel-=12;return 'Problemas en casa.';}]]);
E('suegros',.8,p=>p.married,'Tus suegros vienen a quedarse un mes.',p=>[
 ['Recibirlos con gusto',p=>{p.partner.rel+=6;p.s.felicidad-=2;return 'Tu pareja te lo agradece.';}],
 ['Poner límites',p=>{p.partner.rel-=6;p.s.felicidad+=2;return 'Se quedan solo una semana.';}]]);
E('hijo_escuela',1,p=>p.children.some(c=>c.age>=8&&c.age<=16),p=>{const c=pick(p.children.filter(c=>c.age>=8&&c.age<=16));p._c=c;return `Te llaman de la escuela: ${c.name} va mal en calificaciones.`;},p=>[
 ['Ayudarle con las tareas',p=>{p._c.rel=(p._c.rel||60)+8;p.s.felicidad-=1;return 'Mejora sus calificaciones.';}],
 [`Pagar un tutor (${fmt(.08*U(p))})`,p=>{p.dinero-=.08*U(p);return 'El tutor ayuda mucho.';}],
 ['Regañarlo',p=>{p._c.rel=(p._c.rel||60)-10;return 'Se pone a la defensiva.';}]]);
E('hijo_talento',.8,p=>p.children.some(c=>c.age>=6&&c.age<=14),p=>{const c=pick(p.children.filter(c=>c.age>=6&&c.age<=14));p._c=c;return `${c.name} tiene talento para la música.`;},p=>[
 [`Inscribirlo a clases (${fmt(.06*U(p))})`,p=>{p.dinero-=.06*U(p);p._c.rel=(p._c.rel||60)+8;return 'Practica todos los días.';}],
 ['Que se enfoque en la escuela',p=>{p._c.rel=(p._c.rel||60)-4;return 'Se pone triste, pero obedece.';}]]);
E('rebelde',1,p=>p.children.some(c=>c.age>=14&&c.age<=17),p=>{const c=pick(p.children.filter(c=>c.age>=14&&c.age<=17));p._c=c;return `${c.name} está en plena adolescencia y ya no te hace caso.`;},p=>[
 ['Hablar con calma',p=>{p._c.rel=(p._c.rel||60)+6;return 'Poco a poco se abre contigo.';}],
 ['Castigarlo',p=>{p._c.rel=(p._c.rel||60)-10;return 'Se encierra en su cuarto.';}]]);
E('hijo_boda',1,p=>p.children.some(c=>c.age>=24&&c.age<=40&&!c.wed),p=>{const c=pick(p.children.filter(c=>c.age>=24&&c.age<=40&&!c.wed));p._c=c;return `¡${c.name} se casa!`;},p=>[
 [`Pagar la fiesta (${fmt(.8*U(p))})`,p=>{p.dinero-=.8*U(p);p._c.wed=1;p._c.rel=(p._c.rel||60)+12;p.s.felicidad+=6;return 'Una boda inolvidable.';}],
 ['Ayudar con algo',p=>{p.dinero-=.2*U(p);p._c.wed=1;p._c.rel=(p._c.rel||60)+4;return 'Celebran en familia.';}]]);
E('hijo_extranjero',.7,p=>p.children.some(c=>c.age>=18&&c.age<=28),p=>{const c=pick(p.children.filter(c=>c.age>=18&&c.age<=28));p._c=c;return `${c.name} quiere irse a trabajar al extranjero.`;},p=>[
 ['Apoyarlo',p=>{p._c.rel=(p._c.rel||60)+8;p.s.felicidad-=3;return 'Lo despides en el aeropuerto con lágrimas.';}],
 ['Pedirle que se quede',p=>{if(chance(.5)){p._c.rel=(p._c.rel||60)-6;return 'Se queda, pero resentido.';}p._c.rel=(p._c.rel||60)-12;return 'Se va de todos modos.';}]]);
E('hermano_presta',1,p=>p.siblings.some(s=>s.age>=20)&&p.dinero>.3*U(p),p=>{const s=pick(p.siblings.filter(s=>s.age>=20));p._s=s;return `Tu hermano ${s.name} necesita dinero para un negocio.`;},p=>[
 [`Prestarle ${fmt(.3*U(p))}`,p=>{p.dinero-=.3*U(p);p._s.rel=(p._s.rel||60)+10;if(chance(.5)){p.dinero+=.35*U(p);return 'Te paga con intereses.';}return 'Nunca te paga, pero queda agradecido.';}],
 ['Decirle que no',p=>{p._s.rel=(p._s.rel||60)-10;return 'Se molesta contigo.';}]]);
E('reconciliar',1,p=>p.parents.some(x=>x.alive&&x.rel<35)&&p.age>=18,p=>{const x=p.parents.find(x=>x.alive&&x.rel<35);p._x=x;return x.role==='Madre'?'Llevas tiempo distanciado de tu madre.':'Llevas tiempo distanciado de tu padre.';},p=>[
 ['Buscarlo para hablar',p=>{p._x.rel+=20;p.s.felicidad+=5;return 'Hacen las paces. Te quitas un peso de encima.';}],
 ['Dejar las cosas así',p=>{p.s.felicidad-=2;return 'La distancia sigue.';}]]);
E('adoptar',.5,p=>p.partner&&age(p,30,50)&&p.children.length<2,'Tu pareja y tú hablan de adoptar.',p=>[
 ['Adoptar',p=>{const s=chance(.5)?'M':'F';const c={name:rndFirst(s,p.cult),sex:s,age:RI(1,8)};p.children.push(c);p.s.felicidad+=10;return `Adoptan a ${c.name}, de ${c.age} años.`;}],
 ['No por ahora',p=>'Lo siguen platicando.']]);
E('crisis_pareja',1,p=>p.partner&&p.partner.rel>=25&&p.partner.rel<50,p=>`Tu relación con ${p.partner.name} pasa por un mal momento.`,p=>[
 [`Ir a terapia de pareja (${fmt(.06*U(p))})`,p=>{p.dinero-=.06*U(p);p.partner.rel+=15;return 'Aprenden a comunicarse mejor.';}],
 ['Un viaje juntos',p=>{p.dinero-=.15*U(p);p.partner.rel+=10;return 'Recuperan la chispa.';}],
 ['Darse un tiempo',p=>{p.partner.rel-=5;return 'La relación queda en pausa.';}]]);
E('amigo_enfermo',1,p=>p.ppl.some(x=>x.k==='amigo'&&x.age>=40),p=>{const f=pick(p.ppl.filter(x=>x.k==='amigo'&&x.age>=40));p._f=f;return `${f.name} está en el hospital.`;},p=>[
 ['Visitarlo',p=>{p._f.rel+=12;return 'Tu visita le alegra el día.';}],
 ['Mandar un mensaje',p=>{p._f.rel+=2;return 'Te agradece el mensaje.';}]]);
E('amigo_inversion',.8,p=>p.ppl.some(x=>x.k==='amigo'&&x.rel>=60)&&p.dinero>U(p),p=>{const f=pick(p.ppl.filter(x=>x.k==='amigo'&&x.rel>=60));p._f=f;return `${f.name} te propone invertir juntos en un local.`;},p=>[
 [`Invertir ${fmt(.5*U(p))}`,p=>{invest(p,p.r,'neg',.5*U(p));p._f.rel+=6;return 'Ahora son socios.';}],
 ['Mejor no mezclar amistad y dinero',p=>'Tu amigo lo entiende.']]);
E('viejo_amor',.6,p=>!p.partner&&age(p,28,60),'Te reencuentras con alguien de tu pasado.',p=>[
 ['Invitarle un café',p=>{if(chance(.5)){const s=p.sex==='M'?'F':'M';const c=cultOf(natOf(p).id);p.partner={name:rndFirst(s,c)+' '+rndSur(c),sex:s,rel:70};p.s.felicidad+=8;return `Vuelven a salir. ${p.partner.name} y tú son pareja.`;}return 'Fue bonito recordar, nada más.';}],
 ['Saludar de lejos',p=>'Sigues tu camino.']]);
E('mascota_adulta',.7,p=>age(p,20,70)&&!FL(p,'mascota'),'En un refugio buscan hogar para un gato.',p=>[
 ['Adoptarlo',p=>{FL(p,'mascota',G.year);p.s.felicidad+=6;return 'Llega Michi a tu vida.';}],
 ['No puedes ahora',p=>'Quizá más adelante.']]);
E('mascota_vieja',1.5,p=>FL(p,'mascota')>0&&G.year-FL(p,'mascota')>=14,'Tu mascota ya está muy viejita.',p=>[
 ['Acompañarla hasta el final',p=>{FL(p,'mascota',-1);p.s.felicidad-=8;return 'Se despide en paz, en tus brazos.';}]]);
/* ----- dinero ----- */
E('herencia_tio',.5,p=>age(p,25,70),'Un tío lejano fallece y te deja algo en su testamento.',p=>[
 ['Aceptar la herencia',p=>{const m=R(.3,4)*U(p);p.dinero+=m;return `Recibes ${fmt(m)}.`;}],
 ['Cedérsela a tus primos',p=>{p.s.felicidad+=3;return 'Tus primos te lo agradecen mucho.';}]]);
E('multa',1,p=>p.assets.length>0,'Te para un agente de tránsito.',p=>[
 [`Pagar la multa (${fmt(.02*U(p))})`,p=>{p.dinero-=.02*U(p);return 'Pagas y sigues.';}],
 ['Ofrecer "arreglarse ahí"',p=>{if(chance(.3)){p.dinero-=.06*U(p);return 'Era un operativo anticorrupción. Multa doble.';}p.dinero-=.01*U(p);if(isReal())p.corrupt+=.2;return 'Te deja ir.';}]]);
E('robo_casa',.7,p=>!!p.house,'Entran a robar a tu casa mientras estabas de viaje.',p=>[
 ['Reportarlo al seguro',p=>{p.dinero-=.05*U(p);return 'El seguro cubre casi todo.';}],
 ['Poner alarma y rejas',p=>{p.dinero-=.12*U(p);p.s.felicidad+=1;return 'Ahora duermes tranquilo.';}]]);
E('seguro_medico',.7,p=>age(p,25,60)&&!FL(p,'seguro'),'Te ofrecen un seguro de gastos médicos.',p=>[
 [`Contratarlo (${fmt(.04*U(p))}/año)`,p=>{FL(p,'seguro',1);p.dinero-=.04*U(p);p.s.felicidad+=2;return 'Tienes cobertura médica privada.';}],
 ['No',p=>'Prefieres arriesgarte.']]);
E('bolsa',.8,p=>age(p,22,75)&&p.dinero>2*U(p),'Un asesor te recomienda invertir en un fondo indexado de la bolsa.',p=>[
 ['Invertir 30 % a largo plazo',p=>{const x=p.dinero*.3;p.dinero-=x;p.dinero+=x*R(.85,1.35);return 'Tu inversión crece con el mercado.';}],
 ['Mantener el dinero en el banco',p=>'Prefieres la seguridad.']]);
E('usura',1,p=>p.dinero<-.5*U(p)&&p.age>=18,'Un prestamista ofrece dinero rápido, sin papeles, con interés altísimo.',p=>[
 ['Aceptar',p=>{p.dinero+=.5*U(p);if(chance(.5)){p.dinero-=1.2*U(p);p.s.felicidad-=8;return 'Los intereses te ahogan. Pagas más del doble.';}return 'Logras pagarlo a tiempo, de milagro.';}],
 ['Rechazar',p=>{p.s.inteligencia+=1;return 'Buscas otra salida.';}]]);
E('casa_oferta',.6,p=>!!p.house,'Te ofrecen comprar tu casa 30 % arriba de su valor.',p=>[
 ['Vender',p=>{p.dinero+=p.house.val*1.3;const h=p.debts.find(d=>d.type==='Hipoteca');if(h){p.dinero-=h.bal;p.debts=p.debts.filter(d=>d!==h);}p.house=null;return 'Vendes con buena ganancia.';}],
 ['No vender',p=>'Es tu hogar.']]);
/* ----- salud ----- */
E('dieta',1,p=>age(p,25,65),'El médico te recomienda cambiar tu alimentación.',p=>[
 ['Comer mejor',p=>{p.s.salud+=4;p.s.felicidad-=1;return 'Te sientes con más energía.';}],
 ['Seguir igual',p=>{p.s.salud-=2;return 'Tus análisis no mejoran.';}]]);
E('dejar_fumar',1.5,p=>FL(p,'fuma')===1&&p.age>=25,'Tu médico te pide dejar de fumar.',p=>[
 ['Dejarlo de una vez',p=>{if(chance(.5)){FL(p,'fuma',-1);p.s.salud+=6;return 'Lo logras. Respiras mejor.';}return 'Recaes a las semanas.';}],
 ['Seguir fumando',p=>{p.s.salud-=4;return 'Tus pulmones lo resienten.';}]]);
E('lesion',.8,p=>age(p,18,55)&&p.s.salud>=60,'Te lesionas la rodilla jugando fútbol.',p=>[
 [`Ir al fisioterapeuta (${fmt(.05*U(p))})`,p=>{p.dinero-=.05*U(p);return 'Te recuperas bien.';}],
 ['Esperar a que sane solo',p=>{p.s.salud-=5;return 'Te queda una molestia permanente.';}]]);
E('terapia',1.5,p=>p.s.felicidad<40&&p.age>=16,'Te sientes triste desde hace semanas.',p=>[
 [`Ir a terapia (${fmt(.08*U(p))})`,p=>{p.dinero-=.08*U(p);p.s.felicidad+=10;return 'Hablar con un profesional te ayuda mucho.';}],
 ['Hablar con un amigo',p=>{const f=p.ppl.find(x=>x.k==='amigo'&&x.rel>=50);if(f){f.rel+=5;p.s.felicidad+=6;return `${f.name} te escucha y te apoya.`;}p.s.felicidad+=2;return 'Te desahogas un poco.';}],
 ['Guardártelo',p=>{p.s.felicidad-=3;return 'Sigues cargando con eso.';}]]);
E('insomnio',.8,p=>age(p,30,65),'Llevas semanas sin dormir bien.',p=>[
 ['Dejar el celular de noche',p=>{p.s.salud+=3;p.s.felicidad+=2;return 'Vuelves a dormir como bebé.';}],
 ['Tomar mucho café',p=>{p.s.salud-=3;return 'Rindes en el día, pero te pasa factura.';}]]);
E('dentista',.8,p=>p.age>=12,'Te duele una muela.',p=>[
 [`Ir al dentista (${fmt(.03*U(p))})`,p=>{p.dinero-=.03*U(p);p.s.apariencia+=1;return 'Te la arreglan a tiempo.';}],
 ['Aguantarte',p=>{p.s.salud-=3;p.s.apariencia-=2;return 'Terminan sacándote la muela.';}]]);
/* ----- poder ----- */
E('gestion_desastre',1,p=>p.ruler&&inSet(p,HURACAN.concat(SISMO)),'Un desastre natural golpea a tu país. Todos te miran.',p=>[
 ['Ir a la zona del desastre',p=>{const n=natOf(p);n.approval+=6;n.stab+=3;shockGDP(n.id,.995);return 'Tu presencia da confianza a la gente.';}],
 ['Coordinar desde el palacio',p=>{natOf(p).approval-=4;shockGDP(natOf(p).id,.995);return 'Te critican por no presentarte.';}]]);
E('crisis_deuda',.8,p=>p.ruler&&isReal()&&(N0[natOf(p).id].debt||0)>70,'Los mercados dudan de que tu país pueda pagar su deuda pública.',p=>[
 ['Recortar el gasto',p=>{const n=natOf(p);n.approval-=8;n.stab-=3;shockGDP(n.id,.99);return 'Los mercados se calman, la gente protesta.';}],
 ['Pedir rescate internacional',p=>{const n=natOf(p);n.approval-=4;n.treas=(n.treas||0)+n.gdp*.01;return 'Recibes un préstamo con condiciones estrictas.';}],
 ['Imprimir dinero',p=>{const n=natOf(p);n.infl+=8;return 'La inflación se dispara.';}]]);
E('huelga_nacional',.8,p=>p.ruler,'Los sindicatos convocan a una huelga nacional.',p=>[
 ['Negociar aumentos',p=>{const n=natOf(p);n.approval+=4;n.infl+=1;return 'Se levanta la huelga.';}],
 ['Mano dura',p=>{const n=natOf(p);n.stab-=6;n.approval-=5;p.s.influencia+=2;return 'La huelga se rompe, el país queda dividido.';}]]);
E('visita_estado',.8,p=>p.ruler,'El líder de una potencia viene de visita oficial.',p=>[
 ['Banquete de gala',p=>{p.s.influencia+=4;natOf(p).trade=Math.max(natOf(p).trade||0,3);return 'Firman acuerdos comerciales.';}],
 ['Reunión breve y fría',p=>{natOf(p).approval+=2;return 'Tus seguidores aplauden tu independencia.';}]]);
E('olimpiadas',.4,p=>p.ruler&&ecoIdx(natOf(p).gdp)>40,'Tu país puede ser sede de los Juegos Olímpicos.',p=>[
 ['Postularse',p=>{const n=natOf(p);shockGDP(n.id,.993);n.approval+=5;p.s.influencia+=6;return 'Ganan la sede. Orgullo nacional, aunque cuesta caro.';}],
 ['No gastar en eso',p=>'Inviertes el dinero en otras cosas.']]);
E('extender_mandato',.6,p=>p.ruler&&natOf(p).gov==='democracia'&&p.rulerYears>=2,'Tus aliados proponen cambiar la constitución para extender tu mandato.',p=>[
 ['Impulsar la reforma',p=>{const n=natOf(p);if(chance(n.congress/110)){n.nextElec+=2;n.stab-=5;n.approval-=4;return 'El congreso la aprueba: gobernarás dos años más.';}n.approval-=6;return 'El congreso la rechaza. Escándalo.';}],
 ['Respetar la constitución',p=>{natOf(p).approval+=4;return 'Ganas respeto dentro y fuera.';}]]);
E('crimen_org',1,p=>p.ruler&&N0[natOf(p).id].homi>12,'El crimen organizado controla parte del territorio.',p=>[
 ['Estrategia de inteligencia',p=>{const n=natOf(p);n.stab+=3;shockGDP(n.id,.998);return 'Golpes certeros a las finanzas criminales.';}],
 ['Despliegue militar masivo',p=>{const n=natOf(p);n.stab+=R(-4,6);n.army-=1;return 'Resultados mixtos.';}],
 ['Programas sociales en zonas afectadas',p=>{const n=natOf(p);n.approval+=3;shockGDP(n.id,.997);return 'Efecto lento, pero la gente lo agradece.';}]]);
E('periodista_critico',1,p=>p.ruler,'Un periodista publica una investigación muy dura contra tu gobierno.',p=>[
 ['Responder con datos',p=>{if(chance(.5)){natOf(p).approval+=3;return 'Ganas la discusión pública.';}natOf(p).approval-=3;return 'Los datos no convencen.';}],
 ['Presionar al medio',p=>{const n=natOf(p);n.approval-=5;if(isReal())n.sanc=Math.max(n.sanc,0);p.s.influencia+=2;return 'El medio se calla. Organizaciones internacionales te critican.';}]]);
E('sucesor',1,p=>p.ruler&&p.age>=65,'Tu salud ya no es la de antes. ¿Quién te sucederá?',p=>[
 ['Preparar a tu hijo mayor',p=>{if(p.children.length){natOf(p).stab-=3;return 'Lo nombras tu heredero político.';}return 'No tienes hijos. Eliges a un ministro leal.';}],
 ['Dejar que decidan las urnas',p=>{natOf(p).approval+=5;natOf(p).stab+=3;return 'Prometes una transición democrática.';}]]);
E('espia',1,p=>p.ruler&&atWar(p),'Tu servicio de inteligencia captura a un espía enemigo.',p=>[
 ['Interrogarlo',p=>{const w=warsOf(natOf(p).id)[0];if(w){if(w.a===natOf(p).id)w.score+=15;else w.score-=15;}return 'Obtienes información valiosa del frente.';}],
 ['Canjearlo por prisioneros',p=>{natOf(p).approval+=3;return 'Vuelven soldados a casa.';}]]);
/* ----- guerra (civil) ----- */
E('refugiados',1,p=>p.age>=18&&neighborsOf(natOf(p).id).some(n=>warsOf(n).length)&&!atWar(p),'Llegan refugiados de un país vecino en guerra.',p=>[
 ['Ayudar en un albergue',p=>{p.s.felicidad+=4;p.s.influencia+=2;return 'Ayudas a familias que lo perdieron todo.';}],
 ['Donar dinero',p=>{p.dinero-=.03*U(p);p.s.felicidad+=2;return 'Tu donativo llega a quien lo necesita.';}],
 ['No involucrarte',p=>'Sigues con tu rutina.']]);
E('racionamiento',1,p=>atWar(p)&&p.age>=10,'Por la guerra, hay racionamiento de gasolina y alimentos.',p=>[
 ['Compartir con los vecinos',p=>{p.s.felicidad+=2;p.s.influencia+=1;return 'La colonia se une.';}],
 ['Comprar en el mercado negro',p=>{p.dinero-=.08*U(p);if(isReal()&&chance(.2))p.corrupt+=.5;return 'No te falta nada, pero pagas el triple.';}]]);
E('bonos',.8,p=>atWar(p)&&p.age>=18&&p.dinero>.5*U(p),'El gobierno vende bonos de guerra.',p=>[
 [`Comprar ${fmt(.3*U(p))}`,p=>{p.dinero-=.3*U(p);const w=warsOf(natOf(p).id)[0];if(w){if(w.a===natOf(p).id)w.score+=3;else w.score-=3;}if(chance(.6)){p.dinero+=.4*U(p);return 'Al terminar, te los pagan con intereses.';}return 'El gobierno nunca los paga completos.';}],
 ['No',p=>'Prefieres guardar tu dinero.']]);
E('veteranos',.8,p=>p.age>=40&&(FL(p,'veterano')||p.career.track==='militar'),'Te invitan a la reunión anual de veteranos.',p=>[
 ['Ir',p=>{p.s.felicidad+=4;p.s.influencia+=2;FL(p,'veterano',1);return 'Recuerdan a los que ya no están.';}]]);
/* ----- culturas del mundo ----- */
E('hanami',1,p=>cu(p)==='japo'&&p.age>=4,'Florecen los cerezos. Todo el país sale a los parques.',p=>[['Picnic bajo los cerezos',p=>{p.s.felicidad+=5;return 'Un día tranquilo y hermoso.';}]]);
E('ramadan',1,p=>['arab','turc','pers'].includes(cu(p))&&p.age>=8,'Llega el Ramadán. Tu familia se reúne cada noche para el iftar.',p=>[['Compartir con la familia',p=>{p.s.felicidad+=4;p.parents.forEach(x=>x.alive&&(x.rel+=4));return 'Cenas largas con toda la familia.';}],['Invitar a tus vecinos',p=>{p.s.influencia+=2;return 'Tus vecinos se sienten en casa.';}]]);
E('oktoberfest',1,p=>cu(p)==='germ'&&p.age>=18,'Llegan las fiestas de otoño en tu ciudad.',p=>[['Ir con tus amigos',p=>{p.s.felicidad+=5;p.ppl.forEach(x=>x.k==='amigo'&&(x.rel+=3));return 'Música, comida y risas.';}],['Quedarte en casa',p=>'Prefieres un fin de semana tranquilo.']]);
E('carnaval',1,p=>cu(p)==='luso'&&p.age>=6,'¡Llega el Carnaval!',p=>[['Desfilar con una escuela de samba',p=>{p.s.felicidad+=7;p.s.salud+=1;return 'Bailas hasta el amanecer.';}],['Verlo por TV',p=>'Lo disfrutas desde el sillón.']]);
E('diwali',1,p=>cu(p)==='indi'&&p.age>=4,'Es Diwali, el festival de las luces.',p=>[['Encender lámparas con tu familia',p=>{p.s.felicidad+=5;p.parents.forEach(x=>x.alive&&(x.rel+=3));return 'La casa brilla toda la noche.';}]]);
E('ano_chino',1,p=>cu(p)==='chin'&&p.age>=4,'Año Nuevo Lunar: toda la familia viaja a casa de los abuelos.',p=>[['Viajar a casa',p=>{p.s.felicidad+=5;p.dinero-=.02*U(p);return 'Sobres rojos, dumplings y fuegos artificiales.';}],['Quedarte trabajando',p=>{p.dinero+=.03*U(p);p.s.felicidad-=3;return 'Ganas extra, pero extrañas a tu familia.';}]]);
E('accion_gracias',1,p=>inN(p,['USA','CAN'])&&p.age>=4,'Cena de Acción de Gracias con toda la familia.',p=>[['Cocinar el pavo',p=>{p.s.felicidad+=4;p.parents.forEach(x=>x.alive&&(x.rel+=3));return 'El pavo queda perfecto.';}],['Evitar las discusiones políticas',p=>{p.s.felicidad+=2;return 'Una cena en paz, por fin.';}]]);
E('final_liga',1,p=>['hisp','luso','ital','fran','germ','angl'].includes(cu(p))&&p.age>=8,'Tu equipo llega a la final del campeonato.',p=>[['Ir al estadio',p=>{p.dinero-=.02*U(p);if(chance(.5)){p.s.felicidad+=7;return '¡Campeones! Festejas en la calle.';}p.s.felicidad-=3;return 'Pierden en penales.';}],['Verlo con amigos',p=>{p.s.felicidad+=3;return 'Gritas cada jugada.';}]]);
E('lluvias',1,p=>cu(p)==='afri'&&p.age>=8,'Las lluvias llegan a tiempo y la cosecha es buena en tu región.',p=>[['Celebrar con la comunidad',p=>{p.s.felicidad+=5;shockGDP(natOf(p).id,1.003);return 'Fiesta en el pueblo.';}],['Guardar parte de la cosecha',p=>{p.dinero+=.05*U(p);return 'Previsor: vendes cuando sube el precio.';}]]);
E('banya',1,p=>cu(p)==='esla'&&p.age>=16,'Tus amigos te invitan a la sauna tradicional del fin de semana.',p=>[['Ir',p=>{p.s.salud+=3;p.s.felicidad+=3;return 'Sales como nuevo.';}]]);
E('asado',1,p=>inN(p,['ARG','URY','PRY','CHL'])&&p.age>=6,'Domingo de asado familiar.',p=>[['Hacerte cargo de la parrilla',p=>{p.s.felicidad+=5;p.s.influencia+=1;return 'Todos aplauden al asador.';}],['Llegar a comer',p=>{p.s.felicidad+=3;return 'Comes hasta no poder más.';}]]);
E('grito',1,p=>natOf(p).id==='MEX'&&p.age>=4,'Noche del 15 de septiembre: el Grito de Independencia.',p=>[['Ir a la plaza',p=>{p.s.felicidad+=5;return '¡Viva México! Pozole y cohetes.';}],['Fiesta en casa',p=>{p.s.felicidad+=4;p.parents.forEach(x=>x.alive&&(x.rel+=2));return 'Pozole, tostadas y la familia reunida.';}]]);
E('lucha_libre',.8,p=>natOf(p).id==='MEX'&&age(p,6,60),'Te invitan a la lucha libre en la arena.',p=>[['Ir y gritarle al rudo',p=>{p.s.felicidad+=5;return '¡Ganan los técnicos!';}],['No ir',p=>'Te lo cuentan después.']]);
E('peregrinacion',.6,p=>cu(p)==='hisp'&&p.age>=10,'Tu familia quiere ir en peregrinación el 12 de diciembre.',p=>[['Ir con ellos',p=>{p.s.felicidad+=3;p.parents.forEach(x=>x.alive&&(x.rel+=5));return 'Una caminata larga, pero llena de significado para tu familia.';}],['Quedarte',p=>{p.parents.forEach(x=>x.alive&&(x.rel-=2));return 'Tu familia va sin ti.';}]]);
E('rosca',.8,p=>cu(p)==='hisp'&&p.age>=5,'Partida de rosca de Reyes en casa.',p=>[['Partir tu pedazo',p=>{if(chance(.25)){p.s.felicidad+=2;return '¡Te sale el muñequito! Te toca invitar los tamales.';}p.s.felicidad+=2;return 'Chocolate caliente y rosca.';}]]);
E('temblor_simulacro',.6,p=>inSet(p,SISMO)&&p.age>=6,'Hay simulacro de sismo en tu escuela o trabajo.',p=>[['Participar en serio',p=>{p.s.inteligencia+=1;FL(p,'preparado',1);return 'Aprendes las rutas de evacuación.';}],['Ignorarlo',p=>'Sigues en lo tuyo.']]);
