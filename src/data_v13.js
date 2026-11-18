/* ===== v1.3: datos de monedas, bancos centrales, bolsas y empresas =====
   Tipos de cambio: unidades por 1 dólar a inicios de 2026 (aproximados; bancos centrales y mercado).
   Régimen: flot = flotación libre · adm = flotación administrada · fijo:XXX = tipo fijo contra XXX · caja:XXX = caja de conversión · (las uniones usan la moneda del ancla).
   Tasa = tasa de política monetaria aproximada a inicios de 2026 (si falta, se estima con inflación y tasa de préstamos). vol = volatilidad real anual. */
const CUR0={
USD:['$','dólar estadounidense',1,'flot',0,3.6],EUR:['€','euro',.857,'flot',.07,2.0],GBP:['£','libra esterlina',.745,'flot',.08,3.75],JPY:['¥','yen',156,'flot',.09,.75],CHF:['Fr.','franco suizo',.80,'flot',.07,0],
CNY:['¥','yuan renminbi',7.05,'adm',.04,1.4],CAD:['$','dólar canadiense',1.38,'flot',.06,2.25],AUD:['$','dólar australiano',1.50,'flot',.09,3.6],NZD:['$','dólar neozelandés',1.74,'flot',.09,2.25],
SEK:['kr','corona sueca',9.3,'flot',.08,1.75],NOK:['kr','corona noruega',10.1,'flot',.09,4.0],DKK:['kr','corona danesa',6.40,'fijo:EUR',.01,1.6],ISK:['kr','corona islandesa',126,'flot',.10,7.25],
PLN:['zł','esloti',3.62,'flot',.08,4.0],CZK:['Kč','corona checa',20.8,'flot',.07,3.5],HUF:['Ft','forinto',330,'flot',.10,6.5],RON:['lei','leu rumano',4.36,'adm',.05,6.5],
MXN:['$','peso mexicano',18.2,'flot',.11,7.0],BRL:['R$','real brasileño',5.4,'flot',.14,15.0],ARS:['$','peso argentino',1450,'adm',.25,30],CLP:['$','peso chileno',920,'flot',.11,4.5],
COP:['$','peso colombiano',3800,'flot',.12,9.25],PEN:['S/','sol',3.37,'adm',.06,4.25],UYU:['$','peso uruguayo',39.5,'flot',.09,8.0],PYG:['₲','guaraní',7100,'adm',.07,6.0],BOB:['Bs','boliviano',6.96,'fijo:USD',.02],
VES:['Bs.','bolívar',300,'adm',.35],CRC:['₡','colón costarricense',500,'adm',.06],DOP:['RD$','peso dominicano',63.5,'adm',.05],GTQ:['Q','quetzal',7.66,'adm',.02],HNL:['L','lempira',26.3,'adm',.03],
NIO:['C$','córdoba',36.6,'fijo:USD',.01],CUP:['$','peso cubano',120,'adm',.30],HTG:['G','gourde',131,'flot',.10],JMD:['$','dólar jamaiquino',160,'flot',.06],TTD:['$','dólar de Trinidad y Tobago',6.78,'adm',.02],
BSD:['$','dólar bahameño',1,'fijo:USD',0],BZD:['$','dólar beliceño',2,'fijo:USD',0],GYD:['$','dólar guyanés',209,'fijo:USD',.01],SRD:['$','dólar surinamés',38.5,'flot',.15],
RUB:['₽','rublo',80,'flot',.16,16.5],TRY:['₺','lira turca',43,'adm',.15,38],UAH:['₴','grivna',42,'adm',.10,15.5],BYN:['Br','rublo bielorruso',2.95,'adm',.10],KZT:['₸','tenge',510,'flot',.12,18],
UZS:["so'm",'som uzbeko',12000,'adm',.07],KGS:['с','som kirguís',87.4,'adm',.05],TJS:['SM','somoni',9.3,'adm',.06],TMT:['m','manat turcomano',3.5,'fijo:USD',.01],AZN:['₼','manat azerí',1.7,'fijo:USD',.02],
AMD:['֏','dram',385,'flot',.07],GEL:['₾','lari',2.7,'flot',.07],MDL:['L','leu moldavo',17,'flot',.07],ALL:['L','lek',83,'flot',.07],MKD:['ден','denar',52.8,'fijo:EUR',.01],RSD:['дин','dinar serbio',100.5,'adm',.02],
BAM:['KM','marco convertible',1.676,'caja:EUR',0],
INR:['₹','rupia india',90,'flot',.06,5.25],PKR:['Rs','rupia pakistaní',281,'adm',.10,11],BDT:['৳','taka',122,'adm',.07,10],LKR:['Rs','rupia de Sri Lanka',305,'flot',.10,7.75],NPR:['Rs','rupia nepalí',144,'fijo:INR',.01],
BTN:['Nu.','ngultrum',90,'fijo:INR',0],MVR:['Rf','rufiyaa',15.42,'fijo:USD',.01],AFN:['؋','afgani',66,'adm',.10],IRR:['﷼','rial iraní',1150000,'adm',.30],IQD:['ع.د','dinar iraquí',1310,'fijo:USD',.03],
KRW:['₩','won surcoreano',1450,'flot',.09,2.5],KPW:['₩','won norcoreano',8000,'adm',.20],TWD:['NT$','nuevo dólar taiwanés',31.5,'adm',.05,2.0],IDR:['Rp','rupia indonesia',16700,'flot',.08,4.75],
THB:['฿','baht',31.5,'flot',.07,1.25],PHP:['₱','peso filipino',59,'flot',.06,4.5],MYR:['RM','ringgit',4.1,'flot',.07,2.75],VND:['₫','dong',26300,'adm',.03,4.5],SGD:['$','dólar de Singapur',1.29,'adm',.04,1.5],
KHR:['៛','riel',4010,'adm',.02],LAK:['₭','kip',21700,'adm',.10],MMK:['K','kyat',2100,'adm',.20],MNT:['₮','tugrik',3600,'flot',.08],
SAR:['﷼','riyal saudí',3.75,'fijo:USD',0,4.5],AED:['د.إ','dírham emiratí',3.6725,'fijo:USD',0,3.65],QAR:['ر.ق','riyal catarí',3.64,'fijo:USD',0],KWD:['KD','dinar kuwaití',.307,'adm',.02],
BHD:['BD','dinar bareiní',.376,'fijo:USD',0],OMR:['ر.ع','rial omaní',.3845,'fijo:USD',0],JOD:['JD','dinar jordano',.709,'fijo:USD',0],ILS:['₪','nuevo séquel',3.2,'flot',.09,4.25],
LBP:['L£','libra libanesa',89500,'fijo:USD',.05],SYP:['£S','libra siria',110,'adm',.25],YER:['﷼','rial yemení',1600,'adm',.25],EGP:['E£','libra egipcia',47.5,'flot',.14,21],
LYD:['LD','dinar libio',5.45,'adm',.08],TND:['DT','dinar tunecino',2.92,'adm',.05],DZD:['دج','dinar argelino',130,'adm',.05],MAD:['DH','dírham marroquí',9.2,'adm',.04],MRU:['UM','uguiya',39.8,'adm',.05],
NGN:['₦','naira',1450,'flot',.18,27],GHS:['₵','cedi',11,'flot',.15,18],XOF:['CFA','franco CFA (BCEAO)',562.3,'caja:EUR',0,3.25],XAF:['FCFA','franco CFA (BEAC)',562.3,'caja:EUR',0,4.5],
GMD:['D','dalasi',72,'flot',.08],GNF:['FG','franco guineano',8700,'adm',.05],SLE:['Le','leone',22.8,'flot',.12],LRD:['$','dólar liberiano',180,'flot',.06],CVE:['$','escudo caboverdiano',94.5,'fijo:EUR',0],
ETB:['Br','birr',155,'flot',.15],KES:['KSh','chelín keniano',129,'flot',.06,9.25],UGX:['USh','chelín ugandés',3600,'flot',.06],TZS:['TSh','chelín tanzano',2450,'flot',.07],RWF:['FRw','franco ruandés',1450,'flot',.05],
BIF:['FBu','franco burundés',2970,'adm',.15],SOS:['Sh','chelín somalí',571,'adm',.08],DJF:['Fdj','franco yibutiano',177.7,'caja:USD',0],ERN:['Nfk','nakfa',15,'fijo:USD',.02],SDG:['ج.س','libra sudanesa',2600,'flot',.30],
SSP:['£','libra sursudanesa',4600,'flot',.30],CDF:['FC','franco congoleño',2200,'flot',.12],AOA:['Kz','kwanza',915,'flot',.12],ZMW:['K','kwacha zambiano',23,'flot',.15],MWK:['MK','kwacha malauí',1750,'adm',.20],
MZN:['MT','metical',63.9,'adm',.03],ZWG:['ZiG','zig (oro de Zimbabue)',26.5,'adm',.25],BWP:['P','pula',13.5,'adm',.05],NAD:['$','dólar namibio',16.8,'fijo:ZAR',0],LSL:['L','loti',16.8,'fijo:ZAR',0],
SZL:['L','lilangeni',16.8,'fijo:ZAR',0],ZAR:['R','rand',16.8,'flot',.14,6.75],MGA:['Ar','ariary',4500,'flot',.07],MUR:['Rs','rupia mauriciana',46,'adm',.04],KMF:['CF','franco comorense',421,'fijo:EUR',0],
FJD:['$','dólar fiyiano',2.27,'adm',.04],PGK:['K','kina',4.2,'adm',.04],SBD:['$','dólar de las Islas Salomón',8.2,'adm',.04],VUV:['VT','vatu',120,'adm',.05]};
// país → moneda (zona euro 2026 incluye a Bulgaria desde el 1 de enero; Montenegro y Kosovo usan el euro sin ser miembros; Panamá, Ecuador, El Salvador y Timor Oriental usan el dólar)
const NCUR=(()=>{const m={};const set=(c,l)=>l.split(' ').forEach(x=>m[x]=c);
  set('EUR','AUT BEL BGR HRV CYP EST FIN FRA DEU GRC IRL ITA LVA LTU LUX MLT NLD PRT SVK SVN ESP MNE XKX');set('USD','USA ECU SLV PAN TLS');
  set('XOF','BEN BFA CIV GNB MLI NER SEN TGO');set('XAF','CMR CAF TCD COG GNQ GAB');set('ILS','ISR PSE');set('MAD','MAR ESH');
  Object.assign(m,{AFG:'AFN',AGO:'AOA',ALB:'ALL',ARE:'AED',ARG:'ARS',ARM:'AMD',AUS:'AUD',AZE:'AZN',BDI:'BIF',BGD:'BDT',BHR:'BHD',BHS:'BSD',BIH:'BAM',BLR:'BYN',BLZ:'BZD',BOL:'BOB',BRA:'BRL',BTN:'BTN',BWA:'BWP',
  CAN:'CAD',CHE:'CHF',CHL:'CLP',CHN:'CNY',COD:'CDF',COL:'COP',COM:'KMF',CPV:'CVE',CRI:'CRC',CUB:'CUP',CZE:'CZK',DJI:'DJF',DNK:'DKK',DOM:'DOP',DZA:'DZD',EGY:'EGP',ERI:'ERN',ETH:'ETB',FJI:'FJD',GBR:'GBP',GEO:'GEL',
  GHA:'GHS',GIN:'GNF',GMB:'GMD',GTM:'GTQ',GUY:'GYD',HND:'HNL',HTI:'HTG',HUN:'HUF',IDN:'IDR',IND:'INR',IRN:'IRR',IRQ:'IQD',ISL:'ISK',JAM:'JMD',JOR:'JOD',JPN:'JPY',KAZ:'KZT',KEN:'KES',KGZ:'KGS',KHM:'KHR',KOR:'KRW',
  KWT:'KWD',LAO:'LAK',LBN:'LBP',LBR:'LRD',LBY:'LYD',LKA:'LKR',LSO:'LSL',MDA:'MDL',MDG:'MGA',MDV:'MVR',MEX:'MXN',MKD:'MKD',MMR:'MMK',MNG:'MNT',MOZ:'MZN',MRT:'MRU',MUS:'MUR',MWI:'MWK',MYS:'MYR',NAM:'NAD',NGA:'NGN',
  NIC:'NIO',NOR:'NOK',NPL:'NPR',NZL:'NZD',OMN:'OMR',PAK:'PKR',PER:'PEN',PHL:'PHP',PNG:'PGK',POL:'PLN',PRK:'KPW',PRY:'PYG',QAT:'QAR',ROU:'RON',RUS:'RUB',RWA:'RWF',SAU:'SAR',SDN:'SDG',SGP:'SGD',SLB:'SBD',SLE:'SLE',
  SOM:'SOS',SRB:'RSD',SSD:'SSP',SUR:'SRD',SWE:'SEK',SWZ:'SZL',SYR:'SYP',THA:'THB',TJK:'TJS',TKM:'TMT',TTO:'TTD',TUN:'TND',TUR:'TRY',TWN:'TWD',TZA:'TZS',UGA:'UGX',UKR:'UAH',URY:'UYU',UZB:'UZS',VEN:'VES',VNM:'VND',
  VUT:'VUV',YEM:'YER',ZAF:'ZAR',ZMB:'ZMW',ZWE:'ZWG'});return m;})();
// inflación anual a fines de 2025 donde el dato del Banco Mundial es de un año con hiperinflación ya superada (Argentina: 211 % en 2024 → ~31 % en 2025)
const INFL26={ARG:31};
// reformas reales anunciadas: Irán aprobó en 2025 quitar cuatro ceros al rial (transición de varios años)
const CUR_SCHED=[{y:2028,c:'IRR',k:'redenom',f:1e4,nm:'nuevo rial'}];
// candidatos al euro (miembros de la UE con moneda propia) y criterios de Maastricht simplificados
const EU_IN=['CZE','HUN','POL','ROU','SWE','DNK'];
// referencias históricas que se muestran al proponer una reforma
const REF_HIST={redenom:'México quitó tres ceros en 1993 (nuevo peso), Turquía seis en 2005, Brasil cambió al real en 1994 y Sierra Leona quitó tres ceros en 2022.',
  usd:'Ecuador se dolarizó en 2000 tras una crisis bancaria; El Salvador en 2001. La inflación converge a la de EE. UU., pero pierdes la política monetaria.',
  eur:'Croacia adoptó el euro en 2023 y Bulgaria en 2026, tras cumplir inflación, déficit, deuda y dos años de tipo de cambio estable.',
  fijo:'Hong Kong (caja de conversión desde 1983) y Arabia Saudita (3.75 por dólar desde 1986) mantienen tipos fijos. México en 1994, Tailandia en 1997 y Argentina en 2002 sufrieron devaluaciones cuando el tipo fijo dejó de ser creíble.',
  print:'Financiar el gasto imprimiendo dinero llevó a hiperinflaciones en Alemania (1923), Zimbabue (2008) y Venezuela (2016-2021).'};

/* ----- bolsas: país, moneda, índice principal (nivel aproximado a inicios de 2026), volatilidad anual, índices secundarios ----- */
const EXCH0={
 US:{nm:'Wall Street (NYSE · Nasdaq)',n:'USA',ix:'S&P 500',lv:6900,vol:.16,sub:[['Nasdaq-100',25300,1.2],['Dow Jones Industrial',48000,.9]]},
 MX:{nm:'Bolsa Mexicana de Valores',n:'MEX',ix:'S&P/BMV IPC',lv:64500,vol:.17},BR:{nm:'B3 (São Paulo)',n:'BRA',ix:'Ibovespa',lv:160000,vol:.22},
 AR:{nm:'BYMA (Buenos Aires)',n:'ARG',ix:'S&P Merval',lv:3000000,vol:.40},CL:{nm:'Bolsa de Santiago',n:'CHL',ix:'S&P IPSA',lv:10000,vol:.17},CO:{nm:'Bolsa de Valores de Colombia',n:'COL',ix:'MSCI COLCAP',lv:2000,vol:.20},
 CA:{nm:'Bolsa de Toronto',n:'CAN',ix:'S&P/TSX Compuesto',lv:31000,vol:.13},UK:{nm:'Bolsa de Londres',n:'GBR',ix:'FTSE 100',lv:10000,vol:.13},
 DE:{nm:'Bolsa de Fráncfort (Xetra)',n:'DEU',ix:'DAX',lv:24500,vol:.18},FR:{nm:'Euronext París',n:'FRA',ix:'CAC 40',lv:8200,vol:.17},NL:{nm:'Euronext Ámsterdam',n:'NLD',ix:'AEX',lv:950,vol:.17},
 CH:{nm:'SIX Swiss Exchange',n:'CHE',ix:'SMI',lv:13200,vol:.13},ES:{nm:'Bolsa de Madrid',n:'ESP',ix:'IBEX 35',lv:17000,vol:.18},IT:{nm:'Borsa Italiana',n:'ITA',ix:'FTSE MIB',lv:44000,vol:.20},
 SE:{nm:'Nasdaq Estocolmo',n:'SWE',ix:'OMX Stockholm 30',lv:2800,vol:.17},PL:{nm:'Bolsa de Varsovia',n:'POL',ix:'WIG20',lv:3000,vol:.20},
 JP:{nm:'Bolsa de Tokio',n:'JPN',ix:'Nikkei 225',lv:50000,vol:.20},CN:{nm:'Bolsas de Shanghái y Shenzhen',n:'CHN',ix:'SSE Compuesto',lv:4000,vol:.22},HK:{nm:'Bolsa de Hong Kong',n:'CHN',cur:'HKD',ix:'Hang Seng',lv:26000,vol:.24},
 TW:{nm:'Bolsa de Taiwán',n:'TWN',ix:'TAIEX',lv:28000,vol:.20},KR:{nm:'Bolsa de Corea',n:'KOR',ix:'KOSPI',lv:4200,vol:.22},IN:{nm:'Bolsa Nacional de la India',n:'IND',ix:'Nifty 50',lv:26000,vol:.16},
 ID:{nm:'Bolsa de Indonesia',n:'IDN',ix:'IDX Compuesto',lv:8500,vol:.17},SG:{nm:'Bolsa de Singapur',n:'SGP',ix:'Straits Times',lv:4600,vol:.12},AU:{nm:'Bolsa de Australia',n:'AUS',ix:'S&P/ASX 200',lv:8700,vol:.14},
 SA:{nm:'Tadawul (Riad)',n:'SAU',ix:'TASI',lv:10500,vol:.17},IL:{nm:'Bolsa de Tel Aviv',n:'ISR',ix:'TA-35',lv:3500,vol:.17},TR:{nm:'Borsa Istanbul',n:'TUR',ix:'BIST 100',lv:11000,vol:.30},
 RU:{nm:'Bolsa de Moscú',n:'RUS',ix:'Índice MOEX',lv:2700,vol:.25},ZA:{nm:'Bolsa de Johannesburgo',n:'ZAF',ix:'FTSE/JSE Top 40',lv:100000,vol:.18},
 NG:{nm:'Bolsa de Nigeria',n:'NGA',ix:'NGX All-Share',lv:150000,vol:.20},EG:{nm:'Bolsa de Egipto',n:'EGY',ix:'EGX 30',lv:40000,vol:.24}};
// el dólar de Hong Kong tiene caja de conversión desde 1983 (7.75–7.85 por dólar)
CUR0.HKD=['HK$','dólar de Hong Kong',7.78,'caja:USD',0,4.0];

/* ----- empresas ficticias inspiradas en compañías reales -----
   [clave, nombre, bolsa, sector, precio en moneda local, capitalización (mil M de US$), P/U, dividendo %, beta, volatilidad propia] */
const CO0=[
 ['ORCD','Orchard Devices','US','tec',270,4000,34,.4,1.1,.22],['BLWN','Bluewin Software','US','tec',480,3600,34,.7,1.0,.22],['VRDC','Verdant Chips','US','semi',185,4500,45,.02,1.7,.4],
 ['RVST','Riverstore','US','ecom',230,2450,32,0,1.2,.3],['SRCH','Searchly','US','tec',310,3700,28,.3,1.05,.28],['FLNK','Facelink','US','tec',650,1650,26,.3,1.25,.33],
 ['VOLT','Voltara Motors','US','auto',440,1450,180,0,2.0,.55],['ATBK','Atlas Trust Bancorp','US','fin',320,870,15.5,1.9,1.1,.22],['BRKL','Berkline Holdings','US','fin',500,1080,22,0,.8,.15],
 ['VMRT','ValueMart','US','retail',112,900,38,.9,.6,.18],['PNTH','PetroNorth','US','ener',118,500,17,3.4,.8,.22],['AEGS','Aegis Aerospace','US','def',480,112,22,2.8,.5,.2],
 ['SKYF','SkyForge Aircraft','US','trans',215,165,60,0,1.3,.32],['HHLT','Hearth & Health','US','salud',205,495,19,2.5,.5,.15],['FZCO','Fizzco','US','cons',70,300,23,2.9,.55,.14],
 ['PAYV','Payvia','US','fin',345,660,32,.7,.95,.2],['STAR','Starlit Studios','US','medios',112,202,18,.9,1.15,.27],['STRM','Streamly','US','medios',95,400,40,0,1.3,.35],
 ['MSUR','MercadoSur','US','ecom',2000,100,50,0,1.4,.38],
 ['SAMX','Señal América','MX','tel',19.5,62,22,2.3,.8,.25],['SMAS','Supermás de México','MX','retail',58,55,21,3,.7,.22],['GFNO','Grupo Fomento del Norte','MX','cons',175,33,20,2.5,.75,.22],
 ['MPAC','Minera del Pacífico','MX','min',130,55,14,4,1.1,.28],['BREG','Banco Regiomontano','MX','fin',165,25,9,7,1,.25],['CSRA','Cementos Sierra','MX','inm',17,13,13,.5,1.2,.32],
 ['POSI','Panificadora Osito','MX','cons',57,13,22,1.5,.7,.24],['AGOL','Aeropuertos del Golfo','MX','trans',440,12,22,4,.9,.24],
 ['PATL','Petróleo Atlântico','BR','ener',31,75,5,10,1,.3],['MGER','Minerais Gerais','BR','min',60,50,7,8,1,.28],['IPEB','Banco Ipê','BR','fin',40,70,10,6,.9,.24],
 ['CTRP','Cervejaria Tropical','BR','cons',13,37,15,6,.6,.2],['CNDR','Condor Aeronáutica','BR','def',75,10,25,.3,1,.33],
 ['YSUR','Yacimientos del Sur','AR','ener',52000,16,9,0,1.3,.45],['BPAM','Banco Pampa','AR','fin',7500,9,7,2,1.4,.48],['TAUS','Transportadora Austral','AR','serv',7000,4,10,3,1.1,.42],
 ['LAND','Litio Andino','CL','min',55000,15,25,3,1.2,.4],['GCOR','Grupo Cordillera','CL','retail',2300,6,15,3,.8,.25],['BACH','Banco Austral de Chile','CL','fin',140,15,10,6,.8,.2],
 ['PAND','Petro Andina','CO','ener',2100,23,7,12,1,.3],['BCAF','Banco Cafetero','CO','fin',55000,13,8,6,.9,.28],
 ['RMBK','Royal Maple Bank','CA','fin',215,220,15,3.2,.85,.17],['SFRT','Storefront Commerce','CA','ecom',220,210,90,0,1.6,.45],['NRAL','Northern Rail','CA','trans',135,60,18,2.6,.8,.18],
 ['LGLD','Laurentian Gold','CA','min',120,70,20,1,.7,.35],
 ['TIDE','Tidewater Energy','UK','ener',27.5,210,13,4,.7,.22],['HRBR','Harbourline Bank','UK','fin',11.5,260,10,5,.9,.22],['ASTV','Astravita Pharma','UK','salud',135,280,30,2.2,.5,.2],
 ['UGDS','Unigoods','UK','cons',45,150,20,3.5,.5,.16],['BRDF','Britannic Defence','UK','def',19,75,28,1.8,.6,.26],
 ['DTWK','Datenwerk','DE','tec',210,290,38,1.2,1.1,.26],['RHWK','Rheinwerk Industrie','DE','ind',235,210,21,2.2,1.1,.24],['AVLK','Autovolk','DE','auto',95,55,5,6,1.2,.3],
 ['ALSV','Allsicher Versicherung','DE','fin',365,165,13,4.5,.8,.18],['RSTD','Rheinstahl Defence','DE','def',1700,90,70,.5,1,.45],
 ['MLUM','Maison Lumière','FR','lujo',620,360,26,2.1,1.2,.26],['TTLS','Totalis Énergies','FR','ener',56,140,9,6,.7,.2],['AERC','Aérocontinental','FR','trans',205,190,32,1.2,1.2,.26],
 ['BPAR','Belle Paris','FR','cons',370,230,33,1.9,.8,.2],['LTHO','Lithoptics','NL','semi',1000,450,38,.7,1.4,.33],
 ['ALPM','Alpenmilch','CH','cons',80,230,19,3.8,.4,.17],['GOTP','Gotthard Pharma','CH','salud',300,290,17,3.2,.5,.18],['BZRS','Bank Zürichsee','CH','fin',32,120,17,2,1.1,.26],
 ['MATL','Moda Atlántica','ES','retail',52,190,28,3.2,.9,.22],['BCAN','Banco Cantábrico','ES','fin',9,155,10,3,1.2,.26],['IBLZ','Iberluz','ES','serv',18,135,19,3.5,.6,.18],
 ['RCOR','Rosso Corsa','IT','lujo',360,75,45,.8,.9,.28],['ENPO','Enerpo','IT','ener',15.5,57,9,6.5,.8,.2],
 ['NVGN','Nordvagn','SE','ind',290,60,13,4,1.1,.26],['NTEL','Nordtel','SE','tel',90,32,16,3,.9,.28],['BWIS','Bank Wisła','PL','fin',80,27,9,7,1,.25],
 ['SKRA','Sakura Motors','JP','auto',3000,290,9,3,.9,.24],['KAZE','Kaze Electronics','JP','tec',4300,170,22,.5,1.1,.28],['MBFG','Mitsuboshi Financial','JP','fin',2300,180,14,3,1.1,.26],
 ['KTSN','Kitsune Games','JP','medios',12500,105,40,1.5,.9,.32],['HNDR','Hinode Retail','JP','retail',55000,110,40,.9,1,.28],
 ['GZBJ','Licores de Guizhou','CN','cons',1450,255,20,3.5,.9,.26],['BIPC','Banco Industrial del Pueblo','CN','fin',7.5,330,7,4.5,.6,.18],['DRCL','Dragon Cell Energy','CN','ind',380,240,25,1,1.3,.38],
 ['PNGH','Penguin Holdings','HK','tec',620,730,22,.8,1.1,.32],['JADE','Jade Market Group','HK','ecom',150,360,18,1,1.3,.4],['YZEV','Yangtze EV','HK','auto',100,115,20,1,1.3,.4],
 ['ORAS','Orient Assurance','HK','fin',78,105,15,2.5,1,.28],['FSMC','Formosa Semiconductor','TW','semi',1450,1200,24,1.3,1.2,.3],
 ['HNBT','Hanbit Electronics','KR','semi',110000,500,20,1.3,1.2,.32],['SLMM','Seoul Memory','KR','semi',600000,300,12,.4,1.5,.45],['HSMT','Hanseong Motors','KR','auto',240000,40,5,5,1,.3],
 ['GNGA','Ganga Industries','IN','ener',1550,235,25,.4,.9,.22],['INDC','Indus Consultancy','IN','tec',3200,130,23,3.5,.6,.22],['DCNB','Deccan Bank','IN','fin',1000,170,20,1.2,.8,.2],
 ['HIMM','Himalaya Motors','IN','auto',3500,50,28,.7,1,.28],['BNUS','Bank Nusantara','ID','fin',8500,63,17,3,.8,.25],['MRLB','Merlion Bank','SG','fin',55,120,14,5,.7,.18],
 ['SCMN','Southern Cross Mining','AU','min',44,145,14,4.5,1,.25],['WTLB','Wattle Bank','AU','fin',160,175,28,3,.8,.2],
 ['ARCR','Arabian Crude','SA','ener',24,1550,16,6.5,.5,.18],['ALNB','Al Nakheel Bank','SA','fin',95,100,17,3,.7,.2],['NGDF','Negev Defence','IL','def',1600,22,40,.6,.8,.3],
 ['BSPH','Bosphorus Holding','TR','ind',190,12,8,3,1.1,.38],['THYW','Alas Turcas','TR','trans',300,10,4,0,1.2,.4],
 ['VOLG','Banco del Volga','RU','fin',300,80,4,11,1,.3],['SBGZ','Gas de Siberia','RU','ener',125,37,4,0,1,.32],
 ['KPMD','Kaapstad Media','ZA','tec',1150,50,15,.5,1.1,.3],['HVGL','Highveld Gold','ZA','min',400,28,15,2,.8,.45],
 ['LGCM','Cementos de Lagos','NG','inm',600,7,20,4,.7,.35],['NCBK','Banco Comercial del Nilo','EG','fin',105,7,6,4,1,.35]];
/* sectores: nombre, crecimiento extra de utilidades (%/año), sensibilidad a tasas, a la guerra, a la recesión */
const SECT={tec:['Tecnología',4,-1,-.3,-1],semi:['Semiconductores',6,-1.2,-.5,-1.3],ecom:['Comercio electrónico',4,-1,-.3,-1],fin:['Bancos y finanzas',0,.5,-.4,-1.2],
 ener:['Energía y petróleo',-1,0,.8,-.8],min:['Minería',0,-.2,.3,-1.2],cons:['Consumo básico',0,-.3,-.1,.3],retail:['Comercio minorista',.5,-.4,-.3,-.4],lujo:['Lujo',1,-.6,-.6,-1.3],
 auto:['Automotriz',-1,-.6,-.4,-1.5],salud:['Salud y farmacéuticas',1,-.3,0,.4],tel:['Telecomunicaciones',-1,-.5,-.1,.1],ind:['Industria',0,-.4,0,-1.1],def:['Defensa y aeroespacial',1,-.2,1.6,0],
 inm:['Construcción y cemento',0,-1,-.3,-1.2],serv:['Servicios públicos',-.5,-.8,-.2,.3],trans:['Transporte y aerolíneas',0,-.4,-1.2,-1.3],medios:['Medios y entretenimiento',2,-.6,-.3,-.7]};
