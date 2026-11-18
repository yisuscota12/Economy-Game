/* ===== v1.6c: datos del mundo del fútbol =====
   Ligas simuladas (formato, divisiones, número de clubes, rango de fuerza, riqueza), patrones de nombres de club por idioma (clubes ficticios en ciudades reales),
   fuerza aproximada de las selecciones (inspirada en el ranking mundial 2025), confederaciones, sedes del Mundial, posiciones, atributos y calendario. */
// [país, nombre de la liga, formato (eu: agosto–mayo · cal: año calendario · mx: Apertura y Clausura con liguilla), clubes 1.ª, clubes 2.ª (0 = sin 2.ª simulada), fuerza mín–máx de 1.ª, riqueza, idioma de nombres]
const FT_LG=[['GBR','Liga Premier inglesa','eu',20,20,[70,90],1.7,'en'],['ESP','Primera División de España','eu',20,20,[67,90],1.25,'es'],['ITA','Serie A italiana','eu',20,20,[67,88],1.1,'it'],
  ['DEU','Bundesliga alemana','eu',18,18,[66,89],1.15,'de'],['FRA','Ligue 1 francesa','eu',18,18,[64,86],.95,'fr'],['PRT','Primeira Liga portuguesa','eu',18,0,[58,82],.6,'pt'],['NLD','Eredivisie neerlandesa','eu',18,0,[58,80],.6,'nl'],
  ['BRA','Brasileirão','cal',20,20,[62,80],.55,'pt'],['ARG','Liga Profesional argentina','cal',20,0,[60,78],.35,'es'],['MEX','Liga MX','mx',18,0,[58,77],.5,'es'],['USA','Major League Soccer','cal',20,0,[57,74],.7,'en'],['SAU','Liga Profesional saudí','eu',18,0,[55,78],1,'ar']];
const FT_2N={GBR:'Championship',ESP:'Segunda División',ITA:'Serie B',DEU:'2. Bundesliga',FRA:'Ligue 2',BRA:'Série B'};
// nombres de club: {c} = ciudad real del país
const FT_NM={es:['Real {c}','Atlético {c}','Deportivo {c}','Club {c}','Racing de {c}','Sporting {c}','Unión {c}','Independiente de {c}','Estudiantes de {c}','{c} F. C.','Tigres de {c}','Pumas de {c}','Rayados de {c}','Gimnasia de {c}','Ciclón de {c}'],
  en:['{c} United','{c} City','{c} Rovers','{c} Athletic','{c} Town','{c} Wanderers','{c} Albion','{c} F. C.','{c} S. C.','{c} Rangers'],it:['A. C. {c}','{c} Calcio','Inter {c}','U. S. {c}','Sporting {c}','Virtus {c}'],
  de:['F. C. {c}','{c} 04','S. V. {c}','Borussia {c}','Eintracht {c}','V. f. B. {c}','Fortuna {c}','Union {c}'],fr:['Olympique de {c}','A. S. {c}','F. C. {c}','Stade {c}','Racing {c}','{c} S. C.'],
  pt:['Sporting {c}','{c} F. C.','Esporte Clube {c}','Atlético {c}','Clube {c}','Vitória {c}','Grêmio {c}','Internacional de {c}','Botafogo de {c}'],nl:['{c} F. C.','Ajax {c}','P. S. V. {c}','Sparta {c}','Vitesse {c}','Go Ahead {c}'],
  ar:['Al-Ittihad {c}','Al-Nasr {c}','Al-Hilal {c}','Al-Ahli {c}','Al-Shabab {c}','{c} F. C.'],xx:['{c} F. C.','Deportivo {c}','Atlético {c}','Club {c}','Unión {c}','Real {c}']};
const FT_LANG={hisp:'es',angl:'en',ital:'it',germ:'de',fran:'fr',luso:'pt',arab:'ar'};
// fuerza de las selecciones (0–100), aproximada al ranking de 2025; el resto se calcula por población y PIB
const FT_NT={ESP:89,ARG:88,FRA:88,ENG:87,GBR:87,BRA:86,PRT:85,NLD:84,DEU:84,BEL:82,ITA:82,HRV:81,URY:80,COL:80,MAR:80,JPN:79,CHE:79,DNK:79,AUT:78,USA:77,MEX:77,SEN:77,ECU:77,TUR:77,NOR:77,KOR:76,UKR:76,CIV:76,IRN:75,SRB:75,POL:75,SWE:75,CAN:75,NGA:75,EGY:75,DZA:75,
  AUS:74,CZE:74,HUN:74,PRY:74,GRC:74,RUS:74,CMR:73,MLI:73,VEN:73,ROU:73,SVK:73,COD:73,TUN:72,GHA:72,CHL:72,PAN:72,UZB:72,IRL:72,SVN:72,GEO:72,ZAF:72,PER:71,SAU:71,BFA:71,QAT:70,IRQ:70,JOR:70,CRI:70,BIH:70,ALB:70,
  JAM:69,FIN:69,ISR:69,CPV:69,GIN:69,ARE:68,ISL:68,MKD:68,HND:67,GAB:67,BOL:66,KAZ:66,AGO:66,ZMB:66,CHN:65,SLV:64,NZL:64,UGA:64,BEN:64,BHR:64,OMN:64,GTM:63,BLR:63,THA:63,VNM:63,SYR:63,PSE:63,HTI:63,LBY:63,MNE:68,XKX:66,
  IDN:62,KEN:62,TTO:62,TJK:61,MYS:60,KWT:60,LBN:60,KGZ:60,PRK:60,SDN:60,DOM:58,NIC:58,IND:55,PHL:55,CUB:55};
const FT_CONMEBOL=['ARG','BRA','URY','PRY','CHL','BOL','PER','ECU','COL','VEN'],FT_OFC=['NZL','PNG','FJI','SLB','VUT'],FT_CAFN=['EGY','LBY','TUN','DZA','MAR','ESH','SDN'];
const FT_CONF={UEFA:'UEFA (Europa)',CONMEBOL:'CONMEBOL (Sudamérica)',CONCACAF:'CONCACAF (Norte, Centroamérica y Caribe)',CAF:'CAF (África)',AFC:'AFC (Asia)',OFC:'OFC (Oceanía)'};
// plazas en el Mundial de 48 (desde 2026) y sedes conocidas
const FT_WCS={UEFA:16,CAF:9,AFC:8,CONMEBOL:6,CONCACAF:6,OFC:1,PO:2};
const FT_HOST={2026:['USA','MEX','CAN'],2030:['ESP','PRT','MAR'],2034:['SAU']};
// torneos continentales de selecciones: [nombre, confederación, equipos, grupos, mejores terceros, años: resto de dividir entre el ciclo, ciclo]
const FT_CT=[['Eurocopa','UEFA',24,6,4,0,4],['Copa América','CONMEBOL',16,4,0,0,4],['Copa de Oro','CONCACAF',16,4,0,1,2],['Copa Africana de Naciones','CAF',24,6,4,3,4],['Copa Asiática','AFC',24,6,4,3,4]];
// posiciones y atributos del futbolista
const FT_AT=['Velocidad','Técnica','Pase','Tiro','Defensa','Físico','Portería'];
const FT_ATI=['⚡','🎩','🎯','🥅','🛡️','💪','🧤'];
const FT_POS=[['POR','Portero',[0,.05,.1,0,.05,.15,.65],[0,0,0,0,0,0,0]],['DFC','Defensa central',[.1,.05,.1,0,.5,.25,0]],['LAT','Lateral',[.25,.12,.18,.03,.3,.12,0]],['MCD','Mediocampista defensivo',[.08,.14,.25,.05,.3,.18,0]],
  ['MC','Mediocampista',[.1,.25,.3,.12,.1,.13,0]],['EXT','Extremo',[.3,.3,.15,.18,.02,.05,0]],['DEL','Delantero',[.18,.2,.07,.4,.0,.15,0]]];
// goles y asistencias esperados por 90 minutos según la posición (aproximados a las grandes ligas)
const FT_GA=[[0,.01],[.04,.03],[.05,.12],[.07,.1],[.14,.18],[.3,.25],[.55,.15]];
const FT_ROLE={juv:'Juvenil (fuerzas básicas)',sup:'Suplente',rot:'Rotación',tit:'Titular'};
// patrocinadores de selección y sedes neutrales de finales continentales
const FT_CUPN={UEFA:'Liga de Campeones de Europa',AME:'Copa de Campeones de América'};
const FT_OTHER=[['Al-Sadd Doha','QAT',70],['Ulsan Hyundai','KOR',68],['Urawa Reds','JPN',69],['Al-Ahly El Cairo','EGY',71],['Mamelodi Sundowns','ZAF',69],['Espérance de Túnez','TUN',67],['Auckland City','NZL',55],['Wydad Casablanca','MAR',68]];
// ciudades reales donde viven los clubes ficticios de cada liga simulada
const FT_CITY={GBR:'Londres,Mánchester,Liverpool,Birmingham,Leeds,Newcastle,Sheffield,Bristol,Nottingham,Leicester,Southampton,Brighton,Portsmouth,Norwich,Coventry,Derby,Stoke,Sunderland,Middlesbrough,Ipswich,Bournemouth,Wolverhampton,Burnley,Blackburn,Hull,Plymouth,Reading,Watford,Swansea,Cardiff,Preston,Oxford,Luton,Bolton,Wigan,Cambridge,Exeter,York,Bradford',
 ESP:'Madrid,Barcelona,Valencia,Sevilla,Bilbao,San Sebastián,Villarreal,Vigo,Málaga,Zaragoza,Gijón,Oviedo,Pamplona,Valladolid,Palma,Las Palmas,Santander,La Coruña,Granada,Cádiz,Almería,Elche,Alicante,Getafe,Leganés,Huesca,Tenerife,Córdoba,Murcia,Burgos,Albacete,Vitoria,Girona,Castellón,Lugo,Salamanca,Mérida,Huelva,Jaén,Logroño',
 ITA:'Milán,Roma,Turín,Nápoles,Florencia,Bérgamo,Bolonia,Génova,Verona,Udine,Bari,Palermo,Cagliari,Parma,Lecce,Empoli,Salerno,Cremona,Venecia,Monza,Sassuolo,Frosinone,Como,Pisa,Módena,Brescia,Perugia,Catania,Ascoli,Reggio,Spezia,Ferrara,Padua,Trieste,Livorno,Siena,Pescara,Ancona,Vicenza,Tarento',
 DEU:'Múnich,Dortmund,Berlín,Hamburgo,Colonia,Fráncfort,Stuttgart,Leipzig,Bremen,Gelsenkirchen,Mönchengladbach,Leverkusen,Wolfsburgo,Friburgo,Hannover,Núremberg,Maguncia,Augsburgo,Bochum,Heidenheim,Kaiserslautern,Düsseldorf,Karlsruhe,Sinsheim,Darmstadt,Kiel,Rostock,Magdeburgo,Paderborn,Bielefeld,Brunswick,Dresde,Fürth,Münster,Ulm,Essen',
 FRA:'París,Marsella,Lyon,Lille,Mónaco,Niza,Rennes,Lens,Nantes,Burdeos,Toulouse,Montpellier,Estrasburgo,Reims,Brest,Saint-Étienne,Lorient,Metz,Le Havre,Auxerre,Angers,Caen,Grenoble,Bastia,Ajaccio,Guingamp,Amiens,Dijon,Troyes,Clermont,Nancy,Sochaux,Laval,Rodez,Annecy,Pau',
 PRT:'Lisboa,Oporto,Braga,Guimarães,Coímbra,Funchal,Faro,Aveiro,Setúbal,Vizela,Famalicão,Barcelos,Chaves,Arouca,Estoril,Portimão,Leiria,Viseu,Penafiel,Moreira',
 NLD:'Ámsterdam,Róterdam,Eindhoven,La Haya,Utrecht,Alkmaar,Arnhem,Enschede,Groninga,Heerenveen,Nimega,Breda,Tilburgo,Zwolle,Sittard,Almere,Deventer,Volendam,Waalwijk,Maastricht',
 BRA:'São Paulo,Río de Janeiro,Belo Horizonte,Porto Alegre,Curitiba,Salvador,Recife,Fortaleza,Goiânia,Florianópolis,Campinas,Santos,Belém,Manaos,Natal,Cuiabá,Bragança,Sorocaba,Juiz de Fora,Ribeirão Preto,Londrina,Maceió,João Pessoa,Vitória,Joinville,Caxias do Sul,Chapecó,Criciúma,Novo Hamburgo,Volta Redonda,Uberlândia,Aracaju,Teresina,São Luís,Campo Grande,Pelotas,Santo André,Guarulhos',
 ARG:'Buenos Aires,Avellaneda,La Plata,Rosario,Córdoba,Mendoza,Santa Fe,Tucumán,Mar del Plata,Bahía Blanca,Lanús,Banfield,Quilmes,San Juan,Salta,Paraná,Rafaela,Junín,Sarandí,Florencio Varela,Victoria,Liniers,Santiago del Estero',
 MEX:'Ciudad de México,Guadalajara,Monterrey,Puebla,Toluca,Querétaro,León,Tijuana,Pachuca,Torreón,San Luis Potosí,Aguascalientes,Mazatlán,Ciudad Juárez,Morelia,Cancún,Veracruz,Mérida,Culiacán,Hermosillo,Chihuahua,Zacatecas,Oaxaca,Celaya,Los Mochis,Saltillo,Durango,Acapulco',
 USA:'Los Ángeles,Nueva York,Chicago,Houston,Dallas,Atlanta,Seattle,Miami,Filadelfia,Boston,Denver,Portland,Kansas City,Salt Lake City,Columbus,Cincinnati,Nashville,Orlando,Charlotte,San José,Austin,San Diego,Minneapolis,San Luis,Washington,Detroit,Las Vegas,Phoenix,Sacramento,Tampa',
 SAU:'Riad,Yeda,Dammam,La Meca,Medina,Taif,Abha,Buraida,Jamis Mushait,Al Jubail,Tabuk,Hail,Najrán,Jizán,Al Hasa,Al Khobar,Unaiza,Al Kharj,Yanbu,Sakaka',
 COL:'Bogotá,Medellín,Cali,Barranquilla',URY:'Montevideo,Montevideo',CHL:'Santiago',ECU:'Guayaquil,Quito',PER:'Lima',PRY:'Asunción'};
