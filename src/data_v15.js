/* ===== v1.5a: reservas internacionales, servicios contratables, empleadores de finanzas ===== */
// Reservas de divisas (miles de millones de US$, sin oro), oro (toneladas) y petróleo estratégico (millones de barriles), aproximado 2025 (FMI, Consejo Mundial del Oro, AIE)
const RSV0={CHN:[3300,2290,1000],JPN:[1230,846,470],CHE:[900,1040,0],IND:[600,880,39],RUS:[450,2333,0],TWN:[590,424,0],SAU:[440,323,0],KOR:[410,104,100],SGP:[380,230,0],BRA:[340,130,0],
 MEX:[240,120,0],ISR:[220,0,0],THA:[230,235,0],ARE:[230,75,0],POL:[210,515,0],CZE:[150,50,0],IDN:[150,80,0],CAN:[115,0,0],GBR:[110,310,30],MYS:[120,39,0],PHL:[100,160,0],DNK:[100,67,0],
 IRQ:[100,160,0],IRN:[100,320,0],TUR:[90,620,0],VNM:[85,0,0],PER:[80,35,0],NOR:[80,0,0],LBY:[85,147,0],DZA:[70,174,0],ROU:[70,104,0],AUS:[60,80,0],FRA:[60,2437,100],COL:[60,3,0],ZAF:[55,125,0],
 ITA:[50,2452,60],SWE:[50,126,0],QAT:[50,110,0],KWT:[50,79,0],DEU:[40,3350,90],USA:[40,8133,400],EGY:[45,127,0],HUN:[45,110,0],CHL:[45,0,0],UKR:[45,25,0],ARG:[40,62,0],NGA:[40,22,0],
 ESP:[30,282,60],NLD:[20,612,0],AUT:[15,280,0],BEL:[15,227,0],PRT:[10,383,0],GRC:[10,114,0],KAZ:[25,290,0],UZB:[15,360,0],PAK:[15,65,0],BGD:[25,15,0],VEN:[5,161,0],SRB:[25,45,0],BGR:[40,41,0],FIN:[15,49,0],
 OMN:[18,0,0],BHR:[5,0,0],JOR:[20,70,0],MAR:[37,22,0],KEN:[9,0,0],GHA:[9,30,0],AGO:[15,0,0],CRI:[14,0,0],DOM:[14,0,0],GTM:[22,7,0],URY:[17,0,0],PRY:[10,8,0],BOL:[2,20,0],ECU:[8,0,0]};
/* ----- servicios que puedes contratar: costo anual en salarios medios locales (básico, profesional, élite) ----- */
const SVC=[
 {k:'seguridad',n:'Seguridad privada',ic:'🛡️',c:[.5,2,8],d:'Vigilancia en casa y negocio: reduce robos, asaltos y extorsiones',v:[.3,.6,.85]},
 {k:'escoltas',n:'Escoltas armados',ic:'🕴️',c:[2,6,20],d:'Te acompañan a todas partes: reduce secuestros y atentados',v:[.5,.8,.95]},
 {k:'chofer',n:'Chofer',ic:'🚘',c:[.5,1,2],d:'Ganas tiempo libre en los traslados y bajas el riesgo en el camino',v:[.05,.08,.1]},
 {k:'asistente',n:'Asistente personal',ic:'📋',c:[.6,1.2,3],d:'Agenda, trámites y pendientes: tus acciones toman menos días',v:[.1,.15,.25]},
 {k:'contador',n:'Contador',ic:'🧾',c:[.2,.6,2],d:'Planeación fiscal legal: pagas menos impuesto sobre la renta',v:[.05,.1,.15]},
 {k:'abogado',n:'Abogado',ic:'⚖️',c:[.3,1,4],d:'Mejores probabilidades en juicios, demandas e investigaciones',v:[.1,.2,.35]},
 {k:'asesor',n:'Asesor financiero',ic:'💼',c:[.2,.6,2],d:'Coloca tus ahorros en mejores instrumentos (más rendimiento) y te alerta de riesgos de margen',v:[.1,.2,.3]},
 {k:'entrenador',n:'Entrenador personal',ic:'🏋️',c:[.2,.5,1.5],d:'+Salud y +apariencia cada año',v:[1,2,3]},
 {k:'nutriologo',n:'Nutriólogo',ic:'🥗',c:[.15,.4,1],d:'+Salud cada año',v:[1,1.5,2]},
 {k:'chef',n:'Chef privado',ic:'👨‍🍳',c:[.5,1.5,4],d:'+Salud y +felicidad cada año',v:[1,2,3]},
 {k:'domestico',n:'Personal doméstico',ic:'🧹',c:[.3,.8,2],d:'+Felicidad y menos tiempo en tareas de la casa',v:[.04,.06,.1]},
 {k:'publicista',n:'Relaciones públicas',ic:'📣',c:[.5,2,6],d:'+Influencia cada año y escándalos menos dañinos',v:[1,2,4]}];
const SVCK={};SVC.forEach((s,i)=>SVCK[s.k]=i);const SVT=['Básico','Profesional','Élite'];
// empleadores de la carrera de finanzas (ficticios); además, los bancos que cotizan en tu bolsa
const FUNDS0=['Monolith Asset Management','Pathway Funds','Northstar Capital','Bridgeview Partners','Halcyon Investment Group','Meridian Global Advisors'];
