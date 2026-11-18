/* ===== v1.4: recursos estratégicos, catálogo de negocios e impuestos a empresas =====
   Producción anual aproximada 2023–2025 (EIA, IEA, USGS, FAO, World Gold Council, Asociación Nuclear Mundial). Precios aproximados de inicios de 2026.
   [nombre, icono, unidad de precio, precio US$, volatilidad anual, categoría, terreno, factor (unidad de la tabla → unidad de precio), unidad de la tabla, producción por país] */
const RES0={
 oil:['Petróleo','🛢️','barril',65,.32,'ene','oil',365e3,'mil barriles diarios',
  'USA:13200,SAU:9000,RUS:9500,CAN:4900,IRQ:4300,CHN:4200,ARE:3300,IRN:3300,BRA:3400,KWT:2500,KAZ:1800,NOR:1800,MEX:1600,NGA:1400,QAT:1300,LBY:1300,AGO:1100,DZA:1000,OMN:1000,VEN:950,COL:760,ARG:750,GBR:700,GUY:650,AZE:600,IND:600,IDN:580,EGY:550,MYS:550,ECU:470,AUS:300,COG:270,GAB:200,TKM:200,VNM:200,THA:200,SSD:150,GHA:140,TCD:120,GNQ:90,SYR:90,SDN:60,TTO:60,CMR:60,YEM:50,PER:40,BOL:30,TUN:30,BRN:100'],
 gas:['Gas natural','🔥','millón de BTU',8,.40,'ene','oil',35.3e6,'miles de millones de m³',
  'USA:1030,RUS:590,IRN:250,CHN:240,CAN:190,QAT:180,AUS:150,NOR:120,SAU:115,DZA:100,TKM:80,MYS:70,ARE:60,EGY:57,IDN:55,UZB:47,ARG:48,NGA:45,OMN:40,AZE:37,IND:35,GBR:32,MEX:30,KAZ:30,PAK:30,THA:30,TTO:27,BRA:25,ISR:25,VNM:9,VEN:20,KWT:18,MMR:15,PER:13,BOL:12,LBY:12,IRQ:10,NLD:10,MOZ:6'],
 coal:['Carbón','⚫','tonelada',110,.30,'ene','coal',1e6,'millones de toneladas',
  'CHN:4700,IND:1000,IDN:830,USA:520,AUS:460,RUS:430,ZAF:230,KAZ:115,DEU:100,POL:100,TUR:90,MNG:80,COL:55,VNM:50,CAN:45,SRB:35,CZE:30,BGR:25,UKR:20,MOZ:15,ROU:15,PAK:15,THA:15,BIH:15,LAO:15,PHL:15,GRC:10,UZB:5,ZWE:5,BWA:3'],
 iron:['Mineral de hierro','🧲','tonelada',100,.25,'met','min',1e6,'millones de toneladas',
  'AUS:950,BRA:440,CHN:280,IND:280,RUS:90,IRN:90,ZAF:65,CAN:65,KAZ:60,USA:48,UKR:40,SWE:30,CHL:18,PER:18,TUR:15,MRT:13,MEX:12,MNG:10,SLE:10,LBR:5,MYS:5,VNM:5'],
 copper:['Cobre','🟠','tonelada',10500,.22,'met','min',1e3,'miles de toneladas',
  'CHL:5300,COD:3300,PER:2600,CHN:1800,USA:1100,RUS:930,IDN:900,ZMB:820,AUS:800,MEX:750,KAZ:740,CAN:500,POL:390,IRN:350,BRA:350,MNG:300,LAO:150,SRB:150,UZB:150,ARM:100,BGR:100,ECU:100,ERI:80,ZAF:50,PHL:50'],
 lith:['Litio','🔋','tonelada de carbonato',10500,.45,'met','lith',1e3,'miles de toneladas de carbonato equivalente',
  'AUS:470,CHL:260,CHN:175,ZWE:117,ARG:96,BRA:53,CAN:21,NAM:16,USA:5,PRT:2'],
 gold:['Oro','🥇','onza',4000,.16,'pre','min',32150.7,'toneladas',
  'CHN:380,RUS:310,AUS:290,CAN:200,USA:160,IDN:140,KAZ:130,MEX:130,GHA:130,UZB:110,PER:100,ZAF:100,SDN:80,BRA:70,MLI:70,BFA:60,TZA:60,COL:60,GIN:60,PNG:50,ARG:50,COD:40,CIV:40,CHL:35,PHL:30,ZWE:30,TUR:30,BOL:30,DOM:30,KGZ:25,MNG:25,SUR:25,NIC:20,GUY:15,EGY:15,MRT:15,SEN:15,ECU:10,ETH:10,SAU:10,CMR:10,LBR:8,NER:5'],
 ree:['Tierras raras','🧪','tonelada de óxidos',25000,.30,'met','min',1e3,'miles de toneladas de óxidos',
  'CHN:270,USA:45,MMR:31,AUS:13,THA:13,NGA:13,IND:3,RUS:2.5,MDG:2,VNM:.3'],
 uran:['Uranio','☢️','libra de U₃O₈',75,.25,'ene','min',2599,'toneladas de uranio',
  'KAZ:21000,CAN:12000,NAM:7300,AUS:4600,UZB:4000,RUS:2500,NER:1000,CHN:1700,IND:600,UKR:500,USA:700,ZAF:200'],
 wheat:['Trigo','🌾','tonelada',230,.22,'agr','grain',1e6,'millones de toneladas',
  'CHN:140,IND:113,RUS:92,USA:50,CAN:35,AUS:35,FRA:30,PAK:28,UKR:22,DEU:22,TUR:20,ARG:18,GBR:14,KAZ:13,IRN:12,POL:12,ROU:10,EGY:9,BRA:8,ESP:7,ITA:7,UZB:6,IRQ:6,ETH:6,BGR:6,HUN:5,CZE:5,AFG:4,MAR:3,DZA:3,MEX:3,NPL:2,SYR:2,CHL:1.4,BGD:1'],
 corn:['Maíz','🌽','tonelada',190,.20,'agr','grain',1e6,'millones de toneladas',
  'USA:390,CHN:290,BRA:120,ARG:50,IND:38,UKR:27,MEX:23,ZAF:15,CAN:15,IDN:15,RUS:14,FRA:13,NGA:12,ETH:10,ROU:9,PAK:9,PHL:8,EGY:7,TUR:7,SRB:7,TZA:7,HUN:6,PRY:5,ITA:5,THA:5,VNM:4,MWI:3,KEN:3,ZMB:3'],
 soy:['Soya','🫘','tonelada',400,.18,'agr','grain',1e6,'millones de toneladas',
  'BRA:165,USA:118,ARG:50,CHN:20,IND:12,PRY:10,CAN:7,RUS:7,UKR:5,BOL:3,URY:3,ZAF:2'],
 rice:['Arroz','🍚','tonelada',450,.15,'agr','rice',1e6,'millones de toneladas',
  'CHN:145,IND:140,BGD:39,IDN:35,VNM:27,THA:20,MMR:12,PHL:12,PAK:9,JPN:7,BRA:7,USA:7,KHM:7,NGA:5,NPL:4,EGY:4,KOR:3.7,LKA:3,MDG:3,LAO:2'],
 coffee:['Café','☕','tonelada',8000,.30,'agr','coffee',1e3,'miles de toneladas',
  'BRA:3600,VNM:1800,COL:750,IDN:650,ETH:500,UGA:400,HND:380,IND:350,PER:250,MEX:230,GTM:220,NIC:160,LAO:150,CRI:80,TZA:60,KEN:50,PNG:50,CIV:50,SLV:40,ECU:30,VEN:30,CMR:30']};
const RES_CAT={ene:['Energía','#5a5f6a'],met:['Metales','#d9822b'],pre:['Metales preciosos','#e8c547'],agr:['Agricultura','#5fae4f']};
// impuesto sobre la renta de empresas (tasa general aproximada 2025; el resto: 25 %)
const CIT={MEX:30,USA:25,CAN:26,BRA:34,ARG:35,CHL:27,COL:35,PER:29.5,GBR:25,DEU:30,FRA:25,ESP:25,ITA:24,NLD:25.8,CHE:15,SWE:20.6,NOR:22,POL:19,RUS:25,TUR:25,CHN:25,JPN:30,KOR:24,IND:25,IDN:22,AUS:30,ZAF:27,NGA:30,EGY:22.5,SAU:20,ARE:9,IRL:12.5,HUN:9,SGP:17,ISR:23,VEN:34,ECU:25,URY:25,PRY:10,BOL:25,GTM:25,CRI:30,DOM:27,PAN:25,HND:25,SLV:30,NIC:30,CUB:35,QAT:10,KWT:15,BHR:0,OMN:15};

/* ----- tipos de negocio -----
   k: clave · n: nombre · ic: icono · sec: sector bursátil · gm: margen bruto · L: nómina / ventas · rs: renta y servicios / ventas · K: inversión / ventas anuales
   st: empleados por sucursal · oc: ocupación (grupo OIT para el sueldo) · in: insumos [recurso, peso en el costo] · roy: regalías al Estado / ventas
   Las ventas de una sucursal se derivan del personal: st × sueldo de la ocupación × 1.3 (prestaciones) / L, así cuadran en cualquier país.
   out: recurso que produce · d: qué mueve la demanda (pop consumo local · tour turismo · b2b economía · tech tecnología · ex exportación) · ed: estudios requeridos · mx: sucursales máximas · rc: resiste recesiones (1) o sufre (−1) */
const BZ=[
 {k:'comida',n:'Puesto de comida',ic:'🌮',sec:'cons',gm:0.55,L:0.25,rs:0.06,K:0.15,st:2,oc:'5',in:[['corn',.15],['wheat',.1]],d:'pop',mx:12,rc:1},
 {k:'abarrotes',n:'Tienda de abarrotes',ic:'🛒',sec:'retail',gm:0.24,L:0.1,rs:0.05,K:0.25,st:2,oc:'5',in:[['wheat',.05],['corn',.05]],d:'pop',mx:15,rc:1},
 {k:'taller',n:'Taller mecánico',ic:'🔧',sec:'auto',gm:0.55,L:0.3,rs:0.06,K:0.3,st:3,oc:'7',in:[['oil',.1]],d:'pop',mx:10,rc:0},
 {k:'software',n:'Empresa de software',ic:'💻',sec:'tec',gm:0.85,L:0.5,rs:0.05,K:0.3,st:5,oc:'2',in:[],d:'tech',ed:1,mx:10,rc:-1},
 {k:'restaurante',n:'Restaurante',ic:'🍽️',sec:'cons',gm:0.65,L:0.35,rs:0.1,K:0.4,st:6,oc:'5',in:[['wheat',.08],['rice',.06],['corn',.06]],d:'pop',mx:20,rc:-1},
 {k:'cafeteria',n:'Cafetería',ic:'☕',sec:'cons',gm:0.7,L:0.32,rs:0.12,K:0.35,st:3,oc:'5',in:[['coffee',.3]],d:'pop',mx:30,rc:0},
 {k:'panaderia',n:'Panadería',ic:'🥖',sec:'cons',gm:0.6,L:0.3,rs:0.08,K:0.3,st:3,oc:'7',in:[['wheat',.35]],d:'pop',mx:20,rc:1},
 {k:'bar',n:'Bar',ic:'🍻',sec:'cons',gm:0.72,L:0.33,rs:0.12,K:0.35,st:5,oc:'5',in:[['corn',.05],['wheat',.05]],d:'tour',mx:12,rc:-1},
 {k:'farmacia',n:'Farmacia',ic:'💊',sec:'salud',gm:0.28,L:0.1,rs:0.05,K:0.25,st:3,oc:'3',in:[],d:'pop',mx:30,rc:1},
 {k:'gimnasio',n:'Gimnasio',ic:'🏋️',sec:'cons',gm:0.85,L:0.3,rs:0.2,K:1.0,st:4,oc:'5',in:[],d:'pop',mx:20,rc:-1},
 {k:'ropa',n:'Tienda de ropa',ic:'👕',sec:'retail',gm:0.5,L:0.18,rs:0.12,K:0.3,st:3,oc:'5',in:[],d:'pop',mx:25,rc:-1},
 {k:'joyeria',n:'Joyería',ic:'💍',sec:'lujo',gm:0.45,L:0.12,rs:0.08,K:0.5,st:3,oc:'7',in:[['gold',.6]],d:'tour',mx:10,rc:-1},
 {k:'ecommerce',n:'Tienda en línea',ic:'📦',sec:'ecom',gm:0.32,L:0.1,rs:0.03,K:0.2,st:3,oc:'4',in:[['oil',.08]],d:'nat',mx:8,rc:0},
 {k:'agencia',n:'Agencia de marketing',ic:'📣',sec:'medios',gm:0.78,L:0.5,rs:0.06,K:0.2,st:5,oc:'2',in:[],d:'b2b',mx:8,rc:-1},
 {k:'videojuegos',n:'Estudio de videojuegos',ic:'🎮',sec:'medios',gm:0.85,L:0.55,rs:0.05,K:0.5,st:8,oc:'2',in:[],d:'tech',ed:1,mx:6,rc:0,hit:1},
 {k:'transporte',n:'Transporte de carga',ic:'🚚',sec:'trans',gm:0.45,L:0.25,rs:0.03,K:0.8,st:8,oc:'8',in:[['oil',.55]],d:'b2b',mx:15,rc:-1},
 {k:'taxis',n:'Flota de taxis',ic:'🚕',sec:'trans',gm:0.45,L:0.25,rs:0.02,K:0.6,st:5,oc:'8',in:[['oil',.45]],d:'pop',mx:20,rc:0},
 {k:'hotel',n:'Hotel',ic:'🏨',sec:'cons',gm:0.78,L:0.3,rs:0.05,K:2.0,st:15,oc:'5',in:[],d:'tour',mx:10,rc:-1},
 {k:'clinica',n:'Clínica médica',ic:'🩺',sec:'salud',gm:0.7,L:0.4,rs:0.06,K:0.8,st:8,oc:'2',in:[],d:'pop',ed:1,mx:10,rc:1},
 {k:'escuela',n:'Escuela privada',ic:'🏫',sec:'serv',gm:0.75,L:0.45,rs:0.05,K:1.2,st:10,oc:'2',in:[],d:'pop',ed:1,mx:8,rc:1},
 {k:'constructora',n:'Constructora',ic:'🏗️',sec:'inm',gm:0.25,L:0.1,rs:0.02,K:0.3,st:12,oc:'7',in:[['iron',.25],['copper',.05]],d:'b2b',mx:10,rc:-1,rate:1},
 {k:'inmobiliaria',n:'Inmobiliaria de renta',ic:'🏘️',sec:'inm',gm:0.92,L:0.03,rs:0.05,K:12,st:1,oc:'4',in:[],d:'pop',mx:20,rc:0,re:1},
 {k:'fabrica',n:'Fábrica',ic:'🏭',sec:'ind',gm:0.36,L:0.12,rs:0.03,K:1.0,st:40,oc:'8',in:[['iron',.3],['copper',.1],['oil',.1]],d:'b2b',mx:8,rc:-1},
 {k:'financiera',n:'Financiera (préstamos)',ic:'🏦',sec:'fin',gm:0.8,L:0.22,rs:0.05,K:4,st:6,oc:'4',in:[],d:'b2b',ed:1,mx:10,rc:-1,rate:1,fin:1},
 {k:'granja',n:'Granja agrícola',ic:'🌾',sec:'cons',gm:0.63,L:0.25,rs:0.05,K:1.5,st:6,oc:'6',in:[['oil',.1]],out:'agr',d:'ex',mx:12,rc:0},
 {k:'rancho',n:'Rancho ganadero',ic:'🐄',sec:'cons',gm:0.45,L:0.2,rs:0.03,K:1.2,st:5,oc:'6',in:[['corn',.35]],d:'pop',mx:10,rc:1},
 {k:'mina',n:'Mina',ic:'⛏️',sec:'min',gm:0.6,L:0.2,rs:0.03,K:2.0,st:30,oc:'8',in:[['oil',.12]],out:'met',d:'ex',mx:5,rc:0,roy:.05},
 {k:'petrolera',n:'Pozo petrolero',ic:'🛢️',sec:'ener',gm:0.7,L:0.1,rs:0.03,K:2.5,st:20,oc:'8',in:[],out:'ene',d:'ex',mx:5,rc:0,roy:.15}];
const BZK={};BZ.forEach((b,i)=>BZK[b.k]=i);
// los cuatro tipos de la v0.4 equivalen a estos
const BZ_OLD=['comida','abarrotes','taller','software'];
