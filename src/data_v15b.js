/* ===== v1.5b: bancos, fondos de inversión y secretarías de Estado ===== */
/* niveles de banco: margen sobre la tasa de referencia para depósitos y créditos, probabilidad anual de quiebra, saldo mínimo (salarios medios), apalancamiento máximo, activos (US$) para subir de nivel */
const BTIER={local:{n:'Local (caja popular)',dep:-1,loan:8,fail:.01,min:0,lev:10,up:1e9},regional:{n:'Regional',dep:-1.5,loan:6.5,fail:.005,min:0,lev:11,up:1e10},nacional:{n:'Nacional',dep:-2.5,loan:5,fail:.002,min:0,lev:12,up:1e11},
 internacional:{n:'Internacional',dep:-2.8,loan:4.5,fail:.001,min:5,lev:13,up:5e11},mega:{n:'MEGA banco',dep:-3,loan:4,fail:.0005,min:20,lev:14,up:3e12},giga:{n:'GIGA banco',dep:-3.2,loan:3.5,fail:.0002,min:50,lev:15,up:Infinity},
 privada:{n:'Banca privada',dep:-1.8,loan:3,fail:.0005,min:500,lev:12,up:Infinity}};
const BTO=['local','regional','nacional','internacional','mega','giga'];
// bancos globales (ficticios, algunos cotizan en la bolsa del juego): [clave, nombre, nivel, país, clave en bolsa]
const GBANKS=[['ATB','Atlas Trust Bancorp','giga','USA','ATBK'],['BIP','Banco Industrial del Pueblo','giga','CHN','BIPC'],['PCB','Pacific Continental Bank','giga','USA',null],['DAB','Dragon Agricultural Bank','giga','CHN',null],
 ['HRB','Harbourline Bank','mega','GBR','HRBR'],['MBF','Mitsuboshi Financial','mega','JPN','MBFG'],['BCN','Banco Cantábrico','mega','ESP','BCAN'],['RMB','Royal Maple Bank','mega','CAN','RMBK'],['BLU','Banque Lumière','mega','FRA',null],['RKB','Rheinische Kreditbank','mega','DEU',null],
 ['BZS','Bank Zürichsee','privada','CHE','BZRS'],['GVA','Genève Private Partners','privada','CHE',null],
 ['IPE','Banco Ipê','internacional','BRA','IPEB'],['MRL','Merlion Bank','internacional','SGP','MRLB'],['DCN','Deccan Bank','internacional','IND','DCNB'],['NKH','Al Nakheel Bank','internacional','SAU','ALNB'],['WTL','Wattle Bank','internacional','AUS','WTLB'],['ORS','Orient Assurance Bank','internacional','CHN','ORAS']];
// fondos de inversión que ofrecen los bancos: mezcla de activos (como la mesa de operaciones), comisión anual, inversión mínima (salarios medios)
const MFUNDS=[{k:'mmf',n:'Fondo de dinero (deuda de corto plazo)',w:null,fee:.4,min:0,d:'Rinde la tasa de referencia de tu país menos comisión; casi sin riesgo'},
 {k:'cons',n:'Fondo conservador',w:{BUS:60,gold:10,US:30},fee:.8,min:0,d:'Bonos y algo de acciones'},{k:'bal',n:'Fondo balanceado',w:{US:40,DE:15,EM:15,BUS:25,gold:5},fee:1,min:0,d:'Mitad acciones, mitad bonos'},
 {k:'agr',n:'Fondo de crecimiento',w:{US:50,EM:30,JP:10,copper:10},fee:1.3,min:1,d:'Acciones del mundo: más rendimiento y más caídas'},{k:'cmd',n:'Fondo de materias primas',w:{oil:35,gold:35,copper:30},fee:1.2,min:1,d:'Petróleo, oro y cobre'},
 {k:'hedge',n:'Fondo de cobertura (hedge fund)',w:{oil:20,gold:20,JPY:-30,EM:30,US:30,BUS:30},fee:2,perf:20,min:100,d:'Estrategia macro con apalancamiento; cobra 2 % y 20 % de ganancias'}];
/* ----- secretarías de Estado: clave, nombre, icono, qué mejora y directivas (costo en % del PIB del tesoro) ----- */
const MINS=[
 {k:'hac',n:'Hacienda',ic:'💰',d:'Recaudación y control del gasto',dir:[['Combate a la evasión fiscal',.1,'+8 % de recaudación por 3 años; −2 de aprobación'],['Reforma fiscal progresiva',.05,'+5 % de recaudación; −3 aprobación entre los más ricos']]},
 {k:'eco',n:'Economía',ic:'📈',d:'Crecimiento, inversión y comercio',dir:[['Atraer inversión extranjera',.15,'+0.4 % de crecimiento por 3 años'],['Apoyo a pequeñas empresas',.1,'+0.2 % de crecimiento y +felicidad']]},
 {k:'ene',n:'Energía',ic:'⚡',d:'Petróleo, gas, electricidad y minería',dir:[['Licitar campos petroleros y minas',.05,'+10 % de producción de recursos por 5 años'],['Transición a energías limpias',.2,'+felicidad, −dependencia del petróleo']]},
 {k:'def',n:'Defensa Nacional',ic:'🎖️',d:'Fuerzas armadas',dir:[['Modernizar el equipo militar',.3,'+5 % de calidad del ejército'],['Reclutamiento voluntario',.1,'+tropas sin bajar la aprobación']]},
 {k:'rex',n:'Relaciones Exteriores',ic:'🌐',d:'Diplomacia, tratados y comercio exterior',dir:[['Gira diplomática',.02,'+10 de opinión con tus vecinos'],['Tratados de libre comercio',.05,'+0.3 % de crecimiento por 3 años']]},
 {k:'gob',n:'Gobernación (Interior)',ic:'🏛️',d:'Estabilidad interna, elecciones y conflictos',dir:[['Diálogo con la oposición',.01,'+6 de estabilidad'],['Descentralización',.05,'+felicidad en provincias, −1 de estabilidad']]},
 {k:'seg',n:'Seguridad',ic:'🚓',d:'Policía y combate al crimen',dir:[['Operativo contra el crimen organizado',.15,'−25 % de delitos por 3 años; +aprobación'],['Profesionalizar a la policía',.2,'−15 % de delitos permanente']]},
 {k:'edu',n:'Educación',ic:'🎓',d:'Escuelas, universidades y ciencia',dir:[['Programa nacional de becas',.15,'+desarrollo y +investigación'],['Universidades públicas nuevas',.3,'+0.5 de desarrollo en las provincias más pobres']]},
 {k:'sal',n:'Salud',ic:'🏥',d:'Hospitales y salud pública',dir:[['Campaña de vacunación',.05,'+felicidad y menos mortalidad'],['Hospitales nuevos',.3,'+felicidad en las provincias más pobladas']]},
 {k:'inf',n:'Infraestructura',ic:'🛣️',d:'Carreteras, puertos y comunicaciones',dir:[['Programa de carreteras',.3,'+desarrollo y +0.2 % de crecimiento'],['Red de internet rural',.1,'+desarrollo en provincias rurales']]},
 {k:'agr',n:'Agricultura',ic:'🌾',d:'Campo y alimentos',dir:[['Subsidios al campo',.1,'+10 % de producción agrícola y +felicidad rural'],['Riego tecnificado',.15,'+15 % de producción agrícola por 5 años']]},
 {k:'tra',n:'Trabajo',ic:'👷',d:'Empleo y salarios',dir:[['Aumento al salario mínimo',.02,'+felicidad; −0.1 % de crecimiento'],['Capacitación para el empleo',.08,'+0.1 % de crecimiento y +felicidad']]},
 {k:'tur',n:'Turismo',ic:'🏖️',d:'Promoción turística',dir:[['Campaña turística internacional',.03,'+20 % de turistas (hoteles, bares, joyerías) por 3 años']]},
 {k:'amb',n:'Medio Ambiente',ic:'🌳',d:'Recursos naturales y contaminación',dir:[['Reforestación nacional',.05,'+felicidad; menos desastres'],['Normas ambientales estrictas',.02,'+felicidad; −0.1 % de crecimiento']]}];
const MINK={};MINS.forEach((m,i)=>MINK[m.k]=i);
const GOBR=['Analista','Jefe de departamento','Director de área','Director general','Subsecretario','Secretario'];
