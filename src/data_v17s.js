/* ===== v1.7s (etapa D del plan): fútbol mánager — datos =====
   Estilos tácticos de los entrenadores, modelos de negocio de los clubes, dinero de la televisión por liga, instalaciones, licencias de la liga
   y de entrenador para quien es dueño de un club. */
// estilos: [clave, nombre, descripción, formación habitual, ritmo (×goles del partido), pesos de los atributos del futbolista (velocidad, técnica, pase, tiro, defensa, físico)]
const FT_STY=[['pos','Posesión','Tener el balón, pases cortos y paciencia. Rompe los bloques bajos; sufre con la presión alta.','4-3-3',.96,[.05,.35,.4,.05,.05,.1]],
  ['pre','Presión alta','Recuperar arriba y rápido. Asfixia a los equipos de posesión; deja espacio a la espalda.','4-2-3-1',1.05,[.3,.05,.1,.05,.15,.35]],
  ['con','Contragolpe','Esperar y salir rápido. Castiga las defensas adelantadas; sufre sin el balón contra la posesión.','4-4-2',1,[.4,.1,.15,.25,.05,.05]],
  ['blo','Bloque bajo','Defender cerca del área y cerrar espacios. Neutraliza el juego directo; sufre contra la posesión paciente.','5-4-1',.9,[.05,.05,.1,.05,.45,.3]],
  ['dir','Juego directo','Balones largos y segunda jugada. Salta la presión; choca con los bloques bajos.','4-4-2',1.04,[.1,.05,.1,.3,.1,.35]],
  ['equ','Equilibrado','Sin extremos: se adapta al rival. No tiene ventajas ni desventajas claras.','4-4-2',1,[.17,.17,.17,.17,.16,.16]]];
// ventaja de un estilo sobre otro, en puntos de fuerza (la tabla es antisimétrica: en promedio no cambia los goles ni los empates)
const FT_MU={prepos:1.5,posblo:1.5,blodir:1.5,dirpre:1.5,conpre:1.5,poscon:.5,preblo:1,blocon:.5};
// modelos de negocio de los clubes: [nombre, descripción, precio al vender (×valor), ganas de vender, peso como comprador]
const FT_MO={com:['Comprador','Ficha figuras y paga traspasos altos; vende poco y caro.',1.35,.12,3],ven:['Vendedor','Compra barato, forma y vende a los grandes: vive de los traspasos.',1,.5,.4],
  can:['De cantera','Apuesta por sus juveniles: sus figuras llegan jóvenes y con más potencial.',1.15,.4,.5],equ:['Equilibrado','Compra y vende según lo que necesita.',1.1,.28,1]};
// televisión por club y temporada (millones de dólares) en 1.ª y 2.ª división; el resto de las ligas: 0.4 + 6 × riqueza
const FT_TV={GBR:[160,12],ESP:[75,7],ITA:[65,6],DEU:[60,9],FRA:[30,5],PRT:[8,1],NLD:[9,1],BRA:[25,4],ARG:[7,1],MEX:[14,1],USA:[10,1],SAU:[12,1]};
// tu club: masa salarial respecto al promedio de la liga
const FTC_WK=[['Austera',.5],['Modesta',.75],['Normal',1],['Ambiciosa',1.3],['Grande',1.7],['De galácticos',2.3]];
// precio de los boletos: [nombre, ×precio, ×demanda, efecto en el ánimo de la afición]
const FTC_PR=[['Popular',.7,1.25,6],['Normal',1,1,0],['Premium',1.35,.78,-8]];
// centro de entrenamiento: [nombre, costo (millones de dólares en una liga rica), mantenimiento al año, ¿necesita permiso?]
const FTC_CEN=[['Campo municipal',0,0,0],['Centro básico',1.5,.15,0],['Centro moderno',5,.5,0],['Ciudad deportiva',15,1.4,1],['Centro de alto rendimiento',40,3.5,1],['Centro de élite',90,7,1]];
// academia: [nombre, costo, mantenimiento al año]
const FTC_ACA=[['Sin academia',0,0],['Escuela de fútbol',1,.12],['Academia regional',4,.4],['Academia nacional',12,1.2],['Academia de élite',35,3]];
// ampliaciones del estadio: [lugares, meses de obra]
const FTC_STX=[[2000,3],[5000,5],[10000,8],[20000,14]];
// licencias de entrenador: [nombre, costo (dólares), etiqueta de la acción, fuerza máxima como DT]
const FTL=[['Sin licencia',0,'',48],['Licencia C',800,'⭐ Curso: Licencia C',55],['Licencia B',2500,'⭐ Curso: Licencia B',65],['Licencia A',7000,'⭐ Curso: Licencia A',78],['Licencia Pro',14000,'⭐ Curso: Licencia Pro',95]];
// objetivos de la temporada
const FTC_OB={tit:'Ganar la liga',top:'Clasificar a la copa continental',asc:'Ascender',med:'Terminar en la primera mitad',sal:'Evitar el descenso',ult:'No terminar en los tres últimos lugares',reg:'Ganar la liga regional'};
