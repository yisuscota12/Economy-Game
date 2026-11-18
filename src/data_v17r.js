/* ===== v1.7r (etapa C del plan): box y MMA a fondo — tablas =====
   Escuelas reales (técnica, países, efectos en entrenamiento y pelea), bloques de entrenamiento, sesiones especiales, gimnasios de cada escuela en el extranjero,
   factor de mercado de las bolsas por país, niveles del gimnasio propio y de la promotora propia. */

// Escuelas. tr = multiplicador de lo que sube cada atributo al entrenar con esa escuela; fd = puntos en la pelea con dominio 100 (el dominio escala todo);
// st = estilos que la escuela favorece (índices de CB_ST); am = ventaja en el box amateur (puntos por golpe limpio); cu = desgaste extra al rival por golpes al cuerpo o patadas bajas.
const CB_SCH={
 box:[
  {k:'mex',n:'Escuela mexicana',c:['MEX'],d:'Presión, trabajo al cuerpo, gancho al hígado, quijada y corazón. Se pelea en corto y se gana en los rounds finales.',tr:[1.04,.96,.95,1.1,1.08,1],fd:[1,0,0,2,3,1],st:[0,3],am:0,cu:1},
  {k:'usa',n:'Escuela estadounidense',c:['USA','PRI','CAN'],d:'Velocidad, atletismo y defensa de hombro (la guardia «Philly shell»): contragolpe, combinaciones rápidas y mucho juego de piernas.',tr:[1,1.1,1.06,1,1,1.02],fd:[0,3,3,0,0,1],st:[2,4],am:.2,cu:0},
  {k:'cub',n:'Escuela cubana',c:['CUB'],d:'La escuela amateur más exitosa: juego de piernas, ritmo, defensa y golpear sin ser golpeado. Domina el sistema de puntos.',tr:[.95,1.05,1.12,1,.95,1.08],fd:[0,1,4,0,0,2],st:[1,2],am:1,cu:0},
  {k:'sov',n:'Escuela soviética',c:['RUS','KAZ','UKR','UZB','BLR','ARM','AZE','GEO','KGZ','TJK','MDA','LTU','LVA','EST'],d:'Fundamentos rigurosos, jab, distancia y condición física; un sistema de entrenadores formados por el Estado que sigue vivo en Europa del Este y Asia Central.',tr:[1,1,1.05,1.1,1,1.08],fd:[0,0,2,3,0,2],st:[1,4],am:.7,cu:0},
  {k:'gbr',n:'Escuela británica',c:['GBR','IRL'],d:'Guardia erguida, jab recto y movilidad, con una larga tradición de clubes amateur. Se gana con distancia y orden.',tr:[1,1.05,1.05,1,1,1.05],fd:[0,1,2,1,0,2],st:[1,4],am:.5,cu:0},
  {k:'phl',n:'Escuela filipina',c:['PHL','THA','IDN','JPN','KOR'],d:'Velocidad de manos, ángulos, volumen y agresividad; muchos zurdos y peleas de ritmo alto en las divisiones ligeras.',tr:[1.02,1.12,.95,1.05,1,1],fd:[1,3,0,1,0,1],st:[0,4],am:.3,cu:0}],
 mma:[
  {k:'dag',n:'Escuela de Daguestán',c:['RUS','KAZ','AZE','UZB','KGZ','TJK','GEO','ARM'],d:'Lucha libre y sambo desde la infancia: derribos en cadena, control asfixiante desde arriba y un cardio enorme.',tr:[.95,.95,1,1.12,1,1,1.2,1.05],fd:[0,0,0,3,0,0,4,1],st:[1,4],am:.5,cu:0},
  {k:'bjj',n:'Jiu-jitsu brasileño',c:['BRA','PRT'],d:'El juego de suelo: guardia, pases, raspados y sumisiones. Cualquier caída se convierte en una amenaza.',tr:[.9,.95,1,1,1,1.05,1.05,1.25],fd:[0,0,1,0,0,1,1,5],st:[2,5],am:.3,cu:0},
  {k:'ned',n:'Kickboxing holandés',c:['NLD','BEL','SUR','DEU'],d:'Combinaciones de puños que terminan en patada baja, presión constante y mucha potencia de pie.',tr:[1.12,1.05,1,1.05,1,1.02,.9,.9],fd:[3,1,1,1,0,1,0,0],st:[0,3],am:.2,cu:1},
  {k:'tha',n:'Muay thai tailandés',c:['THA','KHM','LAO','MMR'],d:'El arte de las ocho extremidades: puños, codos, rodillas y patadas, con un clinch que castiga sin parar.',tr:[1.1,1,1,1.05,1.05,1.02,.9,.9],fd:[2,0,1,1,2,1,0,0],st:[3,0],am:.2,cu:1},
  {k:'usw',n:'Lucha universitaria estadounidense',c:['USA','CAN','MEX'],d:'Derribos explosivos, control contra la reja y castigo desde arriba; la base de muchos campeones de MMA.',tr:[1,1,1,1.08,1,1,1.18,.98],fd:[0,1,0,2,0,0,4,0],st:[1,4],am:.4,cu:0}]};
// escuela por defecto de los países que no aparecen arriba (ponderada)
const CB_SCH0={box:{usa:.3,gbr:.18,sov:.14,mex:.18,cub:.06,phl:.14},mma:{usw:.32,bjj:.24,ned:.14,tha:.1,dag:.2}};
// gimnasios de cada escuela en el extranjero (se agregan a la lista de gimnasios): nombre, país, escuela
const CB_GYMX={
 box:[['Gimnasio de entrenadores cubanos en Miami','USA','cub'],['Base de entrenamiento de Almatý','KAZ','sov'],['Gimnasio de box de Manila','PHL','phl']],
 mma:[['Gimnasio de kickboxing de Ámsterdam','NLD','ned'],['Campamento de muay thai en Phuket','THA','tha']]};
// escuela de los gimnasios del extranjero que ya existían (v1.6b)
const CB_GYMX0={'Campamento de altura en las montañas de California':'usa','Gimnasio histórico de la Ciudad de México':'mex','Academia de box de Sheffield':'gbr','Academia Cumbre de Albuquerque':'usw','Equipo Jaguar de Río de Janeiro':'bjj','Centro de lucha de Majachkalá':'dag'};

// Bloques de entrenamiento: clave, nombre, descripción, peso por atributo, fatiga, riesgo de lesión (×), tipo para el campamento
// tipos: f = físico, t = técnico, s = sparring, a = afinamiento (peso o descanso)
const CB_BLK={
 box:[
  ['fue','Fuerza y potencia','Pesas, balón medicinal y golpes al costal pesado.',[1.5,.2,.1,.45,.15,.1],14,1,'f'],
  ['car','Acondicionamiento','Carrera, intervalos, cuerda y circuitos: el gas para los rounds finales.',[.1,.3,.1,1.7,.1,.1],12,.8,'f'],
  ['tec','Técnica y combinaciones','Manoplas, sombra y repetición de combinaciones con el entrenador.',[.2,.4,.4,.1,0,1.5],6,.5,'t'],
  ['def','Defensa y esquivas','Esquivas, bloqueos, salidas de las cuerdas y contragolpe.',[0,.4,1.5,.1,.1,.45],7,.6,'t'],
  ['vel','Velocidad y reflejos','Pera loca, reacción, pliometría y juego de piernas.',[.2,1.5,.4,.2,0,.3],9,.8,'t'],
  ['spa','Sparring intenso','Rounds duros con compañeros de tu peso: técnica bajo presión.',[.3,.3,.75,.5,.1,1],18,1.5,'s'],
  ['pes','Corte de peso controlado','Dieta y cardio para llegar al límite sin deshidratarte.',[0,.1,0,.6,0,0],10,.4,'a'],
  ['rec','Descanso activo','Movilidad, sueño y trabajo ligero: quita fatiga.',[0,0,0,0,0,0],-35,0,'a']],
 mma:[
  ['fue','Fuerza y potencia','Pesas, trineo y potencia de cadera para golpes y derribos.',[1.4,.2,.1,.45,.15,.1,.4,.1],14,1,'f'],
  ['car','Acondicionamiento','Intervalos, circuitos y lucha con cambios de ritmo.',[.1,.3,.1,1.7,.1,.1,.2,.1],12,.8,'f'],
  ['gol','Golpeo y patadas','Manoplas, combinaciones de puños y patadas, defensa de pie.',[.4,.4,.45,.1,0,1.1,0,0],8,.7,'t'],
  ['luc','Lucha y derribos','Entradas, defensa del derribo y control contra la reja.',[.1,.1,.2,.4,0,.2,1.6,.2],12,1.1,'t'],
  ['sue','Jiu-jitsu y sumisiones','Guardia, pases, escapes y llaves.',[0,0,.2,.2,0,.3,.4,1.6],8,.8,'t'],
  ['mix','MMA integrado','Transiciones entre pie, reja y suelo: el juego completo.',[.3,.3,.3,.3,.05,.6,.5,.5],15,1.2,'s'],
  ['pes','Corte de peso controlado','Dieta y cardio para llegar al límite sin deshidratarte.',[0,.1,0,.6,0,0,0,0],10,.4,'a'],
  ['rec','Descanso activo','Movilidad, sueño y trabajo ligero: quita fatiga.',[0,0,0,0,0,0,0,0],-35,0,'a']]};
// intensidad: nombre, × ganancia, × fatiga, × riesgo de lesión
const CB_INT=[['Ligera',.7,.5,.45],['Normal',1,1,1],['Dura',1.3,1.7,2.1]];

// Sesiones especiales: clave, nombre, descripción, costo en US$ (se ajusta por el nivel de la pelea si aplica), días, días de espera, solo deporte (opcional)
const CB_SES=[
 ['vid','Análisis de video del rival','Estudias sus peleas con tu entrenador: ves sus atributos exactos y entras con un plan hecho para él.',800,4,0,''],
 ['ley','Clínica con una leyenda de tu escuela','Una semana con un excampeón formado en tu escuela: dominio de la escuela y técnica.',3000,7,180,''],
 ['alt','Campamento en altura','Tres semanas entrenando a más de 2,000 metros: el cuerpo produce más glóbulos rojos.',6000,20,240,''],
 ['fis','Fisioterapia y recuperación','Masaje, crioterapia y fisioterapia: baja mucho la fatiga y acorta lesiones.',1200,3,30,''],
 ['psi','Psicólogo deportivo','Manejo de la presión, visualización y concentración para tu próxima pelea.',1500,3,60,''],
 ['nut','Nutriólogo y fisiólogo','Plan de corte de peso medido: baja mucho el riesgo de no dar el peso.',2000,2,60,''],
 ['spp','Sparring pagado con un contendiente','Rounds con alguien del top 15 de tu división: aprendes mucho y duele.',5000,6,90,''],
 ['oli','Lucha con luchadores olímpicos','Una semana con luchadores de nivel internacional: derribos y control.',3500,7,120,'mma'],
 ['bjn','Clases privadas con cinturón negro','Clases uno a uno de jiu-jitsu: sumisiones y escapes.',2500,6,90,'mma']];

// Factor de mercado de las bolsas por país (funciones locales y nacionales). Base: PIB por persona; la cultura del box o de las MMA lo sube.
const CB_MKT={box:{MEX:1.25,PHL:1.3,GBR:1.12,PRI:1.3,ARG:1.2,THA:1.2,KAZ:1.2,JPN:1.05,USA:1,IRL:1.1,AUS:1,UKR:1.1,NIC:1.2,PAN:1.15,COL:1.1,VEN:1.1,DOM:1.15,ZAF:1.1,GHA:1.2,UZB:1.15,CUB:.8,SAU:1.4,ARE:1.3},
 mma:{BRA:1.3,USA:1,RUS:1.2,THA:1.1,NLD:1.1,POL:1.25,GBR:1,IRL:1.15,AUS:1.05,KAZ:1.1,MEX:1.05,JPN:1.1,KOR:1.05,CHN:1.05,FRA:1.05,ARE:1.3,SAU:1.3,CAN:1}};

// Gimnasio propio: nombre, apertura (× salario medio anual), renta mensual (×), socios máximos, cuota mensual de referencia (×), entrenadores, peleadores, nivel para entrenar
const CB_OG=[['Gimnasio de barrio',2.5,.05,60,.005,1,4,1],['Gimnasio profesional',8,.15,160,.009,3,8,2],['Centro de alto rendimiento',25,.42,320,.02,5,14,3]];
const CB_OGEQ=['Básico','Bueno','Profesional','De primer nivel'];
// Promotora propia: nombre del nivel, costo (× salario medio anual), reputación mínima, aforo, renta del recinto (US$), producción (US$), precio base del boleto (US$)
const CB_OP=[['Promotora local',4,0,2500,5000,3000,15],['Promotora nacional',15,40,10000,40000,30000,35],['Promotora internacional',60,70,20000,300000,250000,90]];
const CB_TV=[['Sin televisión',0],['Transmisión local por internet',15000],['Canal nacional',150000],['Cadena internacional',1000000]]; // derechos por función en US$ (× mercado × reputación)
const CB_TK=[['Barato',.65],['Normal',1],['Caro',1.6]];
const CB_PRN=['Golpe','Furia','Corona','Titán','Tormenta','Leyenda','Puño','Fénix','Arena','Campeones'];
