/* ===== v1.6b: datos del mundo del box y las artes marciales mixtas =====
   Divisiones y límites reales (libras), estilos, organismos y ligas ficticios inspirados en los reales, promotoras, recintos, torneos amateur y narración por rounds. */
// divisiones: [nombre, límite en libras] — los límites son los oficiales del box profesional y de las MMA (reglas unificadas)
const CB_DIV={box:[['Mínimo',105],['Minimosca',108],['Mosca',112],['Supermosca',115],['Gallo',118],['Supergallo',122],['Pluma',126],['Superpluma',130],['Ligero',135],['Superligero',140],['Wélter',147],['Superwélter',154],['Mediano',160],['Supermediano',168],['Semicompleto',175],['Crucero',200],['Completo',0]],
  mma:[['Paja',115],['Mosca',125],['Gallo',135],['Pluma',145],['Ligero',155],['Wélter',170],['Mediano',185],['Semipesado',205],['Pesado',265]]};
// divisiones activas por deporte y sexo (las femeninas más pobladas en el mundo real)
const CB_DIVS={box:{M:[...Array(17).keys()],F:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]},mma:{M:[0,1,2,3,4,5,6,7,8].slice(1),F:[0,1,2,3]}};
const cbKg=lb=>lb?Math.round(lb*.4536*10)/10:0;
// atributos: box [pegada, velocidad, defensa, resistencia, quijada, técnica]; MMA agrega [lucha, sumisiones]
const CB_AT={box:['Pegada','Velocidad','Defensa','Resistencia','Quijada','Técnica'],mma:['Pegada','Velocidad','Defensa','Resistencia','Quijada','Técnica','Lucha','Sumisiones']};
const CB_ATI={box:['👊','⚡','🛡️','🫁','🦴','🧠'],mma:['👊','⚡','🛡️','🫁','🦴','🧠','🤼','🥋']};
// estilos: nombre, descripción, multiplicadores de atributos, volumen de golpes, fracción de jabs, plan natural
const CB_ST={box:[
  {n:'Fajador',d:'Presiona sin descanso, corta el ring y trabaja el cuerpo en corto. Necesita mucha resistencia y buena quijada.',t:[1,.95,.85,1.15,1.1,.95],out:1.25,jab:.33,pl:'pres'},
  {n:'Estilista',d:'Boxea a distancia con el jab y las piernas; acumula puntos y evita el castigo.',t:[.85,1.12,1.15,1,.9,1.1],out:.95,jab:.55,pl:'dist'},
  {n:'Contragolpeador',d:'Espera el error del rival y responde con precisión. Lee muy bien la pelea.',t:[.95,1.05,1.15,.95,.95,1.15],out:.82,jab:.4,pl:'cont'},
  {n:'Pegador',d:'Busca el nocaut con golpes de poder. Peligroso en cualquier round, aunque se cansa.',t:[1.25,.9,.85,.9,1,.9],out:.9,jab:.3,pl:'ko'},
  {n:'Boxeador-pegador',d:'Combina técnica y poder: puede boxear a distancia o pelear en corto.',t:[1.08,1.05,1,1,1,1.05],out:1,jab:.42,pl:'eq'}],
 mma:[
  {n:'Striker',d:'Pelea de pie con boxeo y patadas; evita el suelo.',t:[1.1,1.1,1,.95,1,1,.75,.7],out:1.1,pl:'pie'},
  {n:'Luchador',d:'Lucha olímpica: derriba, controla contra la reja y castiga en el suelo.',t:[.95,.95,.9,1.15,1.05,1,1.3,.9],out:.9,pl:'derr'},
  {n:'Grappler',d:'Jiu-jitsu brasileño: lleva la pelea al suelo para buscar sumisiones.',t:[.85,.95,.9,1,.95,1.05,1,1.35],out:.85,pl:'sub'},
  {n:'Muay thai',d:'Codos, rodillas, patadas bajas y clinch: castigo constante de pie.',t:[1.15,1,.95,1,1,1,.8,.75],out:1.15,pl:'pie'},
  {n:'Sambista',d:'Sambo: derribos, control y llaves de pierna; muy duro físicamente.',t:[1,.95,.9,1.1,1.05,1,1.2,1.15],out:.95,pl:'derr'},
  {n:'Todoterreno',d:'Completo en todas las áreas: se adapta al rival.',t:[1,1,1,1,1,1,1,1],out:1,pl:'eq'}]};
// "los estilos hacen las peleas": ventaja de un estilo sobre otro (se suma a la efectividad)
const CB_MATCH={box:[[0,.06,-.05,-.06,0],[-.06,0,.03,.06,0],[.05,-.03,0,.03,0],[.06,-.06,-.03,0,0],[0,0,0,0,0]],
  mma:[[0,-.05,.04,0,-.04,0],[.05,0,-.03,.05,0,0],[-.04,.03,0,.03,0,0],[0,-.05,-.03,0,-.04,0],[.04,0,0,.04,0,0],[0,0,0,0,0,0]]};
// planes de pelea (también son las instrucciones de la esquina)
const CB_PLAN={box:{pres:{n:'Presión constante',out:1.22,acc:.96,dr:1.25,def:.9,pw:1},dist:{n:'Boxear a distancia',out:.95,acc:1.07,dr:.9,def:1.12,pw:.9,jab:.12},cont:{n:'Contragolpear',out:.8,acc:1.15,dr:.85,def:1.15,pw:1.05},
  ko:{n:'Buscar el nocaut',out:1.05,acc:.92,dr:1.2,def:.85,pw:1.28},eq:{n:'Equilibrado',out:1,acc:1,dr:1,def:1,pw:1},cuida:{n:'Cuidarte y sobrevivir',out:.75,acc:1,dr:.75,def:1.25,pw:.85}},
 mma:{pie:{n:'Pelear de pie',out:1.12,acc:1,dr:1,def:1.05,pw:1.05,td:.3},derr:{n:'Derribar y controlar',out:.85,acc:1,dr:1.15,def:1,pw:.95,td:2},sub:{n:'Buscar la sumisión',out:.8,acc:1,dr:1.05,def:.95,pw:.9,td:1.5,sb:1.6},
  reja:{n:'Desgastar contra la reja',out:1,acc:.98,dr:1.2,def:1,pw:1,td:1.1,cl:1.4},eq:{n:'Equilibrado',out:1,acc:1,dr:1,def:1,pw:1,td:1},ko:{n:'Buscar el nocaut',out:1.1,acc:.93,dr:1.2,def:.85,pw:1.3,td:.2},cuida:{n:'Cuidarte y sobrevivir',out:.75,acc:1,dr:.8,def:1.25,pw:.85,td:.4}}};
const CB_CORNER={box:[['sigue','Sigue el plan'],['pres','Sube la presión'],['dist','Boxea, no te enganches'],['cont','Espera y contragolpea'],['ko','¡Ve por el nocaut!'],['cuida','Cuídate: sobrevive el round']],
  mma:[['sigue','Sigue el plan'],['derr','Derríbalo'],['pie','Mantente de pie'],['sub','Busca la sumisión'],['ko','¡Ve por el nocaut!'],['cuida','Cuídate: sobrevive el round']]};
// organismos de box (ficticios, inspirados en los cuatro grandes) y ligas de MMA
const CB_ORG=[['CMP','Consejo Mundial de Pugilismo','#2e9e4f'],['AGB','Asociación Global de Boxeo','#c9a227'],['FIP','Federación Internacional de Pugilismo','#c0392b'],['OMR','Organización Mundial del Ring','#2a6fdb']];
const CB_LG=[['LMC','Liga Mundial de Combate','#d64545'],['AGP','Arena Global de Peleas','#7a5cff'],['CR','Circuito regional','#3aa17e']];
// promotoras de box: [nombre, país sede, nivel 0 global / 1 nacional, factor de bolsas]
const CB_PROM=[['Rango Alto Promociones','USA',0,1.3],['Golpe Maestro Sports','GBR',0,1.25],['Corona Dorada Promotions','USA',0,1.2],['Campeones Premier','USA',0,1.15],['Reina Promotions','GBR',0,1.1],
  ['Sol Naciente Boxing','JPN',1,1],['Promociones del Pacífico','MEX',1,1],['Estepa Boxing','KAZ',1,.95],['Tigre Asiático Promotions','PHL',1,.9],['Sotavento Box','ARG',1,.9]];
// recintos por nivel (0 local, 1 nacional, 2 internacional)
const CB_VEN2=[['Coliseo del Desierto','Las Vegas','USA'],['Arena Garden','Nueva York','USA'],['Estadio Real','Riad','SAU'],['Arena Támesis','Londres','GBR'],['Súper Arena','Tokio','JPN'],['Arena Azteca','Ciudad de México','MEX'],['Domo del Golfo','Abu Dabi','ARE'],['Arena Bahía','Manila','PHL']];
// torneos amateur: [nombre, nivel de rivales, rondas, requisito]
const CB_AMT={box:[['Torneo Guantes de Plata (local)',[22,45],3,''],['Campeonato nacional amateur',[38,64],4,'nac'],['Campeonato continental',[52,74],4,'cont'],['Campeonato mundial amateur',[58,82],5,'mund'],['Juegos Olímpicos',[62,86],5,'olim']],
  mma:[['Torneo amateur de MMA (local)',[22,45],3,''],['Campeonato nacional amateur de MMA',[38,64],3,'nac'],['Abierto de jiu-jitsu',[35,70],4,'bjj'],['Campeonato mundial amateur de MMA',[55,80],4,'mund']]};
// apodos
const CB_AP=['El Toro','El Huracán','Dinamita','El Martillo','El Tanque','El Bombardero','La Cobra','El Halcón','El Relámpago','El Terremoto','El Profesor','El Fantasma','El Matador','El Gladiador','El Tigre','El Lobo','El Demoledor','El Zurdo','El Ciclón','El Rayo',
  'El Diamante','El Guerrero','El Monstruo','El Maestro','El Látigo','La Máquina','El Samurái','El Vikingo','El Oso','El Escorpión','El Titán','La Roca','El Cóndor','El Jaguar','El Puma','El Chacal','El Pitbull','El Chamaco','El Niño de Oro','El Asesino Silencioso'];
const CB_APF=['La Pantera','La Cobra','La Reina','La Dama de Hierro','La Leona','La Fiera','La Tormenta','La Gata','La Princesa Guerrera','La Bala','La Jaguar','La Víbora','La Centella','La Imparable'];
// peso de cada país en el box y en las MMA profesionales (aproximado a la cantidad de peleadores clasificados)
const CB_NAT={box:{MEX:14,USA:14,GBR:9,JPN:6,PHL:5,KAZ:3,UKR:4,ARG:4,CUB:3,RUS:4,THA:4,VEN:3,COL:3,NIC:3,DOM:3,GHA:2,NGA:2,UZB:3,CHN:2,AUS:3,IRL:2,FRA:2,ESP:2,DEU:2,ITA:2,PAN:2,ZAF:2,CAN:2,POL:2,KOR:1,AZE:1,ARM:1,CMR:1,NZL:1,PRY:1,ECU:1,PER:1,BRA:1},
  mma:{USA:22,BRA:12,RUS:9,GBR:4,IRL:2,POL:4,AUS:4,NZL:2,MEX:4,CAN:3,CHN:3,KAZ:2,GEO:3,NGA:2,CMR:1,JPN:3,KOR:2,SWE:2,FRA:3,NLD:2,ESP:1,DEU:2,UKR:2,ARM:1,AZE:1,UZB:1,PER:1,ARG:1,CHE:1,KGZ:1,TJK:1,THA:1,PHL:1}};
const CB_LIGHT={JPN:2.5,PHL:2,THA:2.5,MEX:1.5,NIC:2,CHN:1.5,KOR:1.5,VEN:1.4,COL:1.3},CB_HEAVY={GBR:2,USA:1.5,UKR:2,RUS:1.8,NGA:2.5,CUB:1.8,DEU:1.5,POL:1.5,NZL:1.5,CMR:1.5,AUS:1.3,BRA:1.3};
// narración de rounds ({a} ataca a {b})
const CB_TX={box:{jab:['{a} controla la distancia con el jab.','{a} trabaja el jab y mantiene lejos a {b}.','El jab de {a} marca el ritmo del round.'],
  pow:['{a} conecta un recto de derecha limpio.','Gancho de izquierda de {a} que sacude a {b}.','{a} castiga el cuerpo con ganchos al hígado.','Uppercut de {a} en la corta distancia.','{a} suelta una combinación de cuatro golpes que entra completa.'],
  pres:['{a} acorrala a {b} contra las cuerdas.','{a} corta el ring y no deja respirar a {b}.'],def:['{a} esquiva con movimientos de cintura y hace fallar a {b}.','{b} no encuentra el blanco: {a} se mueve con inteligencia.'],
  cont:['{a} espera y contragolpea en cada intercambio.','{b} entra y {a} lo recibe con un contragolpe preciso.'],even:['Round muy parejo, intercambios en el centro del ring.','Round de estudio: mucho amago y poco contacto.'],
  hurt:['{b} está tocado y se abraza para ganar tiempo.','A {b} se le doblan las piernas: ¡está lastimado!'],tired:['{b} baja las manos: se nota el cansancio.','{b} respira por la boca; el ritmo le está pasando factura.'],
  kd:['un gancho de izquierda','una derecha al mentón','un gancho al hígado','un uppercut','un volado de derecha'],cut:['Se abre una cortada sobre la ceja de {b}.','{b} sangra de la nariz tras los golpes de {a}.'],hb:'Choque de cabezas: se abre una cortada en {b}.'},
 mma:{jab:['{a} conecta una combinación de boxeo y sale del rango.','{a} mantiene la distancia con el jab y patadas al cuerpo.'],pow:['Patada a la cabeza de {a} que pasa rozando.','Rodillazo de {a} en el clinch.','Patada baja de {a} que castiga la pierna de {b}.','Codazo de {a} en la corta distancia.','{a} conecta un cruzado limpio.'],
  td:['{a} derriba a {b} con un derribo a dos piernas.','{a} levanta a {b} y lo azota contra la lona.','{a} derriba a {b} en el clinch contra la reja.'],tdd:['{b} defiende el derribo contra la reja.','{b} se suelta y vuelve a ponerse de pie.'],
  gp:['{a} controla desde la montada y castiga con golpes en el suelo.','{a} trabaja desde la media guardia con codos cortos.'],sub:['mataleón','guillotina','llave de brazo','triángulo','kimura','estrangulación de brazo'],subx:'{b} escapa de un intento de {s} de {a}.',
  even:['Round de estudio: mucho movimiento y poco contacto.','Intercambios parejos en el centro del octágono.'],hurt:['{b} está tocado y busca el clinch.','A {b} le pesan las piernas tras el castigo.'],tired:['{b} se ve agotado: baja el ritmo.'],kd:['un gancho de izquierda','una patada a la cabeza','un rodillazo','un recto de derecha'],cut:['Se abre una cortada en la ceja de {b}.'],hb:'Choque de cabezas: cortada en {b}.'}};
// nombres de métodos de victoria
const CB_M={KO:'nocaut',TKO:'nocaut técnico',RTD:'nocaut técnico (la esquina detiene la pelea)',DOC:'nocaut técnico (el médico detiene la pelea por cortada)',SUB:'sumisión',DU:'decisión unánime',DD:'decisión dividida',DM:'decisión mayoritaria',DT:'decisión técnica',EMP:'empate',ET:'empate técnico',DQ:'descalificación'};
