/* v1.9b — fase 2 de la ruta 9d, parte 2 (motor): provincia de los clubes de fútbol.
   Error viejo (trampa 44): ftCities buscaba la provincia de cada ciudad en CITIES[i][5], que no es un id de provincia, así que los clubes de los
   países con lista de ciudades (FT_CITY) se creaban con rg:null y la ficha del lugar los encontraba por el nombre de la ciudad.
   Ahora la provincia de cada ciudad viene precalculada del mapa de identificadores (CITY_RG, raw/city_rg.json, herramientas/city_rg.py),
   y las ciudades de FT_CITY que no están en CITIES (Getafe, Leverkusen, Lanús…) se resuelven por nombre de provincia o con una tabla corta.
   Las partidas viejas se migran solas al primer ftEnsure: cada club con rg:null recibe la provincia de la ciudad que lleva en el nombre.
   Los nombres de los clubes y el azar del mundo nuevo no cambian (solo se llena rg). */
let CRI_=null;
function cityRid(i){if(typeof CITY_RG==='undefined'||!CITY_RG)return null;if(!CRI_){CRI_=[];for(const k in RG)CRI_[RG[k].i]=k;}const v=CITY_RG[i];return v?CRI_[v]||null:null;}
// ciudades de FT_CITY que no aparecen en CITIES (o que se confunden con otra provincia): provincia a mano
const FT_CRG={Burnley:'GBR34',Preston:'GBR34',Watford:'GBR55',Villarreal:'ESP18',Elche:'ESP20',Getafe:'ESP50','Leganés':'ESP50',Girona:'ESP7',
  Empoli:'ITA71',Sassuolo:'ITA83',Reggio:'ITA82',Gelsenkirchen:'DEU7','Mönchengladbach':'DEU7',Leverkusen:'DEU7',Wolfsburgo:'DEU6',Bochum:'DEU7',
  Heidenheim:'DEU8',Kaiserslautern:'DEU3',Sinsheim:'DEU8',Darmstadt:'DEU11',Paderborn:'DEU7',Lens:'FRA43','Le Havre':'FRA41',Guingamp:'FRA36',
  Clermont:'FRA75',Sochaux:'FRA20',Laval:'FRA65',Rodez:'FRA59',Pau:'FRA13','Guimarães':'PRT8',Vizela:'PRT8','Famalicão':'PRT8',Barcelos:'PRT8',
  Chaves:'PRT7',Arouca:'PRT16',Estoril:'PRT12',Penafiel:'PRT17',Moreira:'PRT8',Alkmaar:'NLD9',Enschede:'NLD3',Heerenveen:'NLD10',Nimega:'NLD4',
  Breda:'NLD7',Tilburgo:'NLD7',Sittard:'NLD5',Almere:'NLD14',Deventer:'NLD3',Volendam:'NLD9',Waalwijk:'NLD7',Guarulhos:'BRA23',Avellaneda:'ARG17',
  'Lanús':'ARG17',Banfield:'ARG17',Quilmes:'ARG17','Sarandí':'ARG17','Florencio Varela':'ARG17',Victoria:'ARG17',Liniers:'ARG17',Minneapolis:'USA5',
  Detroit:'USA6','Jamis Mushait':'SAU5','Al Jubail':'SAU1','Al Hasa':'SAU1b','Al Khobar':'SAU1',Unaiza:'SAU11','Al Kharj':'SAU10'};
const FTCR_={};
const ftNK=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// provincia de cada ciudad de la lista FT_CITY de un país (se calcula una vez por país)
function ftCityRegs(nid){if(FTCR_[nid])return FTCR_[nid];const o={};if(!FT_CITY[nid])return FTCR_[nid]=o;
  const cs=[];if(typeof CITIES!=='undefined')for(let i=0;i<CITIES.length;i++){const r=cityRid(i);if(r&&RG[r].n===nid)cs.push([ftNK(CITIES[i][3]),r]);}
  const regs=Object.keys(RG).filter(k=>RG[k].n===nid).map(k=>[k,ftNK(RG[k].nm),(RG[k].mem||[]).map(ftNK)]);
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  for(const n of FT_CITY[nid].split(',')){const q=ftNK(n);let r=FT_CRG[n]&&RG[FT_CRG[n]]?FT_CRG[n]:null,f;
    if(!r&&(f=regs.find(x=>x[1]===q)))r=f[0];                                  // provincia que se llama igual (Mánchester, Querétaro)
    if(!r&&(f=cs.find(c=>c[0]===q)))r=f[1];                                     // misma ciudad (el punto de la ciudad en el mapa)
    if(!r&&(f=cs.find(c=>c[0].startsWith(q+' '))))r=f[1];                       // «Puebla de Zaragoza», «Newcastle upon Tyne»
    if(!r&&(f=regs.find(x=>x[1]===q||x[2].includes(q))))r=f[0];                // provincia con ese nombre (Querétaro, Lugo, Derby)
    if(!r){const rx=new RegExp('(^| )'+esc(q)+'( |$)');if((f=cs.find(c=>rx.test(c[0]))))r=f[1];}   // «Kingston upon Hull»
    if(!r&&(f=regs.find(x=>x[1].includes(q)||x[2].some(y=>y.includes(q)))))r=f[0];
    o[n]=r||null;}
  return FTCR_[nid]=o;}
{const _fc=ftCities;ftCities=function(nid){const L=_fc(nid);if(!FT_CITY[nid])return L;const o=ftCityRegs(nid);return L.map(x=>[x[0],x[1]||o[x[0]]||null]);};}
// migración: clubes sin provincia (partidas creadas antes de la v1.9b, o rivales extranjeros de las copas) → la de la ciudad de su nombre
function ftRgFix(W){if(!W||!W.C||W.rg19)return;W.rg19=1;const cache={};
  for(const id in W.C){const c=W.C[id];if(c.rg||!c.c)continue;const L=cache[c.c]||(cache[c.c]=ftCities(c.c).filter(x=>x[1]).sort((a,b)=>b[0].length-a[0].length));
    const f=L.find(x=>c.n.indexOf(x[0])>=0);if(f)c.rg=f[1];}}
{const _e=ftEnsure;ftEnsure=function(){const W=_e();if(W&&!W.rg19)ftRgFix(W);return W;};}
