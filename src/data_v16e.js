/* ===== v1.7p (v1.6e del plan): vida de las carreras comunes — datos =====
   OFI[nombre del empleo] = oficio: sector, escalafón [puesto, multiplicador de sueldo], certificación, turno, riesgo, estrés base, presencia sindical
   del sector, plantillas de nombre del lugar de trabajo y tamaños posibles. LEY[país] = condiciones laborales aproximadas a 2025–2026
   (cr: desde qué puesto se exige la certificación; jornada legal semanal, pago de horas extra, vacaciones mínimas, aguinaldo o pagas extra en días, indemnización por despido injustificado
   en días base + días por año, afiliación sindical %). Lo que no está en LEY usa los valores típicos de su grupo de ingreso (LEY0). */
const OFI={
 'Mesero':{sec:'Restaurantes',rk:[['Mesero',1],['Capitán de meseros',1.3],['Gerente de piso',1.8]],cert:['Curso de servicio y vinos',.08,2],tu:'noche',rs:1,st:1.1,un:.6,wp:['Restaurante {S}','Café {C}','Mariscos {S}','Fonda La Esquina de {C}'],sz:[0,0,1]},
 'Mesero (medio tiempo)':{sec:'Restaurantes',rk:[['Mesero de medio tiempo',1],['Mesero',1.6]],cert:null,tu:'noche',rs:1,st:.8,un:.4,wp:['Restaurante {S}','Café {C}'],sz:[0,0,1]},
 'Obrero':{sec:'Manufactura',rk:[['Operario',1],['Operario calificado',1.25],['Supervisor de línea',1.6],['Jefe de planta',2.4]],cert:['Certificación de montacargas y seguridad industrial',.1,3],tu:'rotativo',rs:2,st:1.2,un:1.6,wp:['Manufacturas {C}','Planta {S} y Asociados','Ensambladora {S}'],sz:[1,2,2]},
 'Vendedor':{sec:'Comercio',rk:[['Vendedor',1],['Vendedor senior',1.25],['Jefe de tienda',1.7],['Gerente regional',2.6]],cert:['Diplomado en ventas',.1,3],tu:'mixto',rs:0,st:1,un:.6,wp:['Tiendas {S}','Comercial {C}','Almacenes {S}'],sz:[0,1,2]},
 'Albañil':{sec:'Construcción',rk:[['Peón',.85],['Albañil',1],['Oficial',1.25],['Maestro de obra',1.8]],cert:['Certificado de competencia en construcción',.06,2],tu:'dia',rs:3,st:1.1,un:.9,wp:['Constructora {S}','Obras {C}','Edificaciones {S}'],sz:[0,1,1]},
 'Campesino':{sec:'Campo',rk:[['Jornalero',.85],['Campesino',1],['Productor',1.4],['Productor con tierras propias',2.2]],cert:['Curso de riego y agricultura de precisión',.05,2],tu:'dia',rs:2,st:.9,un:.5,wp:['Rancho {S}','Granja {S}','Huertas {S}'],sz:[0,0,1]},
 'Oficinista':{sec:'Servicios',rk:[['Auxiliar administrativo',.9],['Oficinista',1],['Coordinador de área',1.4],['Jefe de oficina',2]],cert:['Certificación en paquetería de oficina y contabilidad',.06,2],tu:'dia',rs:0,st:1,un:.7,wp:['Corporativo {S}','Servicios Administrativos {C}','Despacho {S}'],sz:[0,1,2]},
 'Servidor público':{sec:'Gobierno',rk:[['Auxiliar',.9],['Servidor público',1],['Jefe de departamento',1.5],['Director de área',2.2]],cert:['Diplomado en administración pública',.08,3],tu:'dia',rs:0,st:.9,un:2,wp:['Ayuntamiento de {C}','Oficina estatal de {C}','Delegación {C}'],sz:[1,2,2]},
 'Policía':{sec:'Seguridad pública',rk:[['Policía',1],['Policía primero',1.2],['Suboficial',1.45],['Inspector',1.9],['Comisario',2.8]],cert:['Curso de la academia de policía',.04,3],cr:2,tu:'rotativo',rs:3,st:1.4,un:1.2,wp:['Policía municipal de {C}','Policía estatal de {C}'],sz:[1,2,2]},
 'Técnico':{sec:'Mantenimiento',rk:[['Técnico',1],['Técnico especialista',1.3],['Jefe técnico',1.8]],cert:['Certificación técnica especializada',.1,3],tu:'mixto',rs:1,st:1,un:1,wp:['Servicios Técnicos {S}','Mantenimiento {C}','Talleres {S}'],sz:[0,1,2]},
 'Profesor':{sec:'Educación',rk:[['Profesor interino',.9],['Profesor de base',1.1],['Coordinador académico',1.45],['Director de escuela',1.9]],cert:['Maestría en educación',.5,24],tu:'dia',rs:0,st:1.15,un:2,wp:['Escuela Primaria {S}','Secundaria Técnica de {C}','Colegio {S}'],sz:[1,1,2]},
 'Programador':{sec:'Tecnología',rk:[['Programador junior',.85],['Programador',1.1],['Programador senior',1.5],['Líder técnico',2],['Arquitecto de software',2.6]],cert:['Certificación en la nube',.12,3],tu:'mixto',rs:0,st:1.15,un:.2,wp:['{S} Software','Soluciones Digitales {C}','Nube {S}'],sz:[0,1,2]},
 'Ingeniero':{sec:'Ingeniería',rk:[['Ingeniero junior',.9],['Ingeniero',1.1],['Ingeniero senior',1.5],['Gerente de ingeniería',2.2]],cert:['Certificación en gestión de proyectos',.15,4],tu:'dia',rs:1,st:1.15,un:.5,wp:['Ingeniería {S}','Consultores {C}','Proyectos Industriales {S}'],sz:[1,1,2]},
 'Abogado':{sec:'Servicios legales',rk:[['Pasante',.7],['Abogado asociado',1.1],['Abogado senior',1.6],['Socio del despacho',3]],cert:['Maestría en derecho',.6,24],cr:3,tu:'dia',rs:0,st:1.3,un:.1,wp:['{S} y Asociados','Bufete {S}','Despacho Jurídico {C}'],sz:[0,1,1]},
 'Médico':{sec:'Salud',rk:[['Médico general',1],['Médico especialista',1.7],['Subjefe de servicio',2],['Jefe de servicio',2.4]],cert:['Especialidad médica (residencia)',.3,48],cr:1,tu:'rotativo',rs:1,st:1.4,un:1.3,wp:['Hospital General de {C}','Clínica {S}','Centro Médico {C}'],sz:[1,2,2]}
};
const OFI0={sec:'Servicios',rk:[['Auxiliar',.9],['Encargado',1.1],['Supervisor',1.5],['Gerente',2.1]],cert:['Curso de capacitación',.06,2],tu:'dia',rs:1,st:1,un:.8,wp:['Empresa {S}','Grupo {C}'],sz:[0,1,2]};
const JB_SZ=[['pequeña',[4,6]],['mediana',[6,8]],['grande',[8,8]]]; // tamaño del lugar de trabajo y cuántos compañeros ves
const JB_TU={dia:'Diurno',noche:'Nocturno',mixto:'Mixto',rotativo:'Rotativo (cambia cada semana)'};
const JB_RS=['Bajo','Medio','Alto','Muy alto'];
const JB_HRS=[['Lo mínimo',-1],['Lo normal',0],['Horas extra',1]];
// rasgos de compañeros: efecto en la relación al convivir y qué hacen
const JB_TR={amable:'amable',ambicioso:'ambicioso',chismoso:'chismoso',trabajador:'trabajador',flojo:'flojo',mentor:'mentor'};
// leyes laborales aproximadas (2025–2026). h: horas legales por semana; ot: pago de la hora extra; vac: días de vacaciones el primer año;
// b13: aguinaldo o pagas extra en días de sueldo; i0/iy: indemnización por despido injustificado (días base / días por año); sin: % de afiliación sindical
const LEY={
 MEX:{h:48,ot:2,vac:12,b13:15,i0:90,iy:20,sin:12,vx:2},USA:{h:40,ot:1.5,vac:0,b13:0,i0:0,iy:0,sin:10},CAN:{h:40,ot:1.5,vac:10,b13:0,i0:0,iy:7,sin:29},
 BRA:{h:44,ot:1.5,vac:30,b13:30,i0:30,iy:12,sin:9},ARG:{h:48,ot:1.5,vac:14,b13:30,i0:0,iy:30,sin:25},COL:{h:42,ot:1.25,vac:15,b13:30,i0:30,iy:20,sin:5},
 CHL:{h:42,ot:1.5,vac:15,b13:0,i0:0,iy:30,sin:17},PER:{h:48,ot:1.25,vac:30,b13:60,i0:0,iy:45,sin:5},ESP:{h:40,ot:1,vac:22,b13:60,i0:0,iy:33,sin:13},
 FRA:{h:35,ot:1.25,vac:25,b13:0,i0:0,iy:8,sin:9},DEU:{h:40,ot:1,vac:20,b13:0,i0:0,iy:15,sin:16},ITA:{h:40,ot:1.15,vac:20,b13:30,i0:0,iy:30,sin:33},
 GBR:{h:48,ot:1,vac:28,b13:0,i0:0,iy:7,sin:22},PRT:{h:40,ot:1.25,vac:22,b13:60,i0:0,iy:14,sin:15},NLD:{h:40,ot:1,vac:20,b13:0,i0:0,iy:10,sin:15},
 SWE:{h:40,ot:1.5,vac:25,b13:0,i0:0,iy:0,sin:65},NOR:{h:40,ot:1.4,vac:25,b13:0,i0:0,iy:0,sin:50},DNK:{h:37,ot:1.5,vac:25,b13:0,i0:0,iy:0,sin:67},FIN:{h:40,ot:1.5,vac:25,b13:0,i0:0,iy:0,sin:58},
 POL:{h:40,ot:1.5,vac:20,b13:0,i0:0,iy:10,sin:13},RUS:{h:40,ot:1.5,vac:28,b13:0,i0:30,iy:0,sin:27},TUR:{h:45,ot:1.5,vac:14,b13:0,i0:0,iy:30,sin:9},
 JPN:{h:40,ot:1.25,vac:10,b13:0,i0:30,iy:0,sin:16},CHN:{h:40,ot:1.5,vac:5,b13:0,i0:0,iy:30,sin:44},KOR:{h:40,ot:1.5,vac:15,b13:0,i0:0,iy:30,sin:13},
 IND:{h:48,ot:2,vac:15,b13:0,i0:0,iy:15,sin:12},IDN:{h:40,ot:1.5,vac:12,b13:30,i0:0,iy:30,sin:7},PHL:{h:48,ot:1.25,vac:5,b13:30,i0:0,iy:30,sin:8},
 VNM:{h:48,ot:1.5,vac:12,b13:0,i0:0,iy:15,sin:30},THA:{h:48,ot:1.5,vac:6,b13:0,i0:0,iy:20,sin:3},AUS:{h:38,ot:1.5,vac:20,b13:0,i0:0,iy:10,sin:13},
 ZAF:{h:45,ot:1.5,vac:15,b13:0,i0:0,iy:7,sin:25},NGA:{h:40,ot:1.5,vac:6,b13:0,i0:0,iy:15,sin:10},EGY:{h:48,ot:1.35,vac:21,b13:0,i0:0,iy:60,sin:15},
 SAU:{h:48,ot:1.5,vac:21,b13:0,i0:0,iy:15,sin:0},ARE:{h:48,ot:1.25,vac:30,b13:0,i0:0,iy:21,sin:0},ISR:{h:42,ot:1.25,vac:12,b13:0,i0:0,iy:30,sin:25},
 VEN:{h:40,ot:1.5,vac:15,b13:30,i0:0,iy:30,sin:20},ECU:{h:40,ot:1.5,vac:15,b13:30,i0:90,iy:30,sin:3},GTM:{h:44,ot:1.5,vac:15,b13:60,i0:0,iy:30,sin:3},
 CUB:{h:44,ot:1,vac:30,b13:0,i0:0,iy:0,sin:70},BOL:{h:48,ot:2,vac:15,b13:30,i0:0,iy:30,sin:20},URY:{h:44,ot:2,vac:20,b13:30,i0:0,iy:30,sin:30},
 PRY:{h:48,ot:1.5,vac:12,b13:30,i0:0,iy:15,sin:5},CRI:{h:48,ot:1.5,vac:14,b13:30,i0:0,iy:20,sin:8},DOM:{h:44,ot:1.35,vac:14,b13:30,i0:0,iy:21,sin:5},PAN:{h:48,ot:1.25,vac:30,b13:30,i0:0,iy:24,sin:10}
};
const LEY0={'Low income':{h:48,ot:1.5,vac:12,b13:0,i0:0,iy:15,sin:8},'Lower middle income':{h:48,ot:1.5,vac:14,b13:0,i0:0,iy:15,sin:10},
 'Upper middle income':{h:44,ot:1.5,vac:15,b13:15,i0:0,iy:20,sin:15},'High income':{h:40,ot:1.5,vac:20,b13:0,i0:0,iy:15,sin:20}};
