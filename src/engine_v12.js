/* ===== v1.2a: reloj con temporalidades, tiempo libre, modos de juego y archivo de noticias ===== */
const MCUM=[0,31,59,90,120,151,181,212,243,273,304,334,365];
function ensureClock(){if(!G)return;if(G.day==null)G.day=MCUM[Math.min(11,G.month||0)];}
function monthOfDay(d){let m=0;while(m<11&&d>=MCUM[m+1])m++;return m;}
function dateStr(){ensureClock();const m=monthOfDay(G.day);return `${G.day-MCUM[m]+1} ${MES[m].toLowerCase()} ${G.year}`;}

/* ----- tiempo libre: las acciones cuestan días; se recupera con el paso del tiempo ----- */
const FTY=p=>p.prison?40:120;
function ensureFt(p){if(p&&p.ft==null)p.ft=(p.actions!=null?p.actions:3)*40;}
function syncActs(p){ensureFt(p);p.actions=p.ft>=5?Math.max(1,Math.floor(p.ft/30)):0;}
const ACT_COST=[[/Estudiar|curso|Universidad|Posgrado|Maestr|Diplomado/i,30],[/Leer|libro/i,7],[/gimnasio|Entrenar|ejercicio|deporte|Yoga|Medita/i,20],[/familia|amigos|Salir|fiesta|Cita|Visitar/i,5],[/pareja/i,10],
  [/contactos|Networking/i,10],[/hijo/i,15],[/horas extra/i,30],[/Campaña|Postular|Golpe|Poder|Conspir|Mitin|Candidat/i,45],[/Viaj|Vacacion/i,14],[/médic|Doctor|Terapia|Hospital/i,3],
  [/Empleos|Solicitar|Renunciar|aumento|Tu trabajo|Ascenso/i,7],[/Club/i,20],[/Invertir|negocio|Negocio/i,10],[/Préstamo|Vivienda|deudas|Comprar|Vender/i,3]];
function actCost(t){t=t||'';for(const [rx,c] of ACT_COST)if(rx.test(t))return c;return 15;}
function canAfford(t){if(!P)return false;ensureFt(P);return P.ft>=actCost(t);}
// rendimientos decrecientes: repetir la misma acción en el año rinde menos
const DIMR=[1,.6,.35,.2,.12];
function actDim(p,t){p._acted=p._acted||{};const k=p._acted[t]||0;p._acted[t]=k+1;return DIMR[Math.min(k,DIMR.length-1)];}
function regenFt(p,days){ensureFt(p);p.ft=Math.min(FTY(p),p.ft+FTY(p)*days/365);syncActs(p);}

/* ----- avance del reloj: día, semana, mes, año; el mundo pesado se calcula al cerrar cada mes y año ----- */
const STOP_RX=/declara la guerra|te declara|capitula|invade|movilización general|golpe|crac/i;
function clockAdvance(n,opt){opt=opt||{};ensureClock();const rep=[];let done=0,stop=null,months=0;
  while(done<n){if(!P.alive){stop='muerte';break;}if(P.event||P.dlg||G.offer||(G.calls&&G.calls.length)){stop='decision';break;}
    const m=monthOfDay(G.day),nb=MCUM[m+1];let step=Math.min(n-done,nb-G.day);
    if(step>0&&typeof dlgRoll==='function'&&!opt.noDlg){const k=dlgRoll(step);if(k)step=Math.min(step,k);}
    if(step>0){regenFt(P,step);G.day+=step;done+=step;if(typeof dayHook==='function')dayHook(step);}
    if(G.day>=nb){const r=monthTick(!!opt.auto);months++;rep.push(...r.rep);if(typeof monthHook==='function')monthHook(r);
      r.rep.filter(x=>x.big).forEach(x=>archiveNews(x.t,x.c||'news'));
      if(G.day>=365||r.yearEnd){G.day=365;if(P.alive&&!G.offer&&!(G.calls&&G.calls.length)){ageUp();syncMando();}else{stop='decision';break;}}
      if(opt.pauseBig&&r.rep.some(x=>x.big&&STOP_RX.test(x.t))){stop='aviso';break;}}}
  return {done,rep,stop,months};}

/* el año cierra el reloj; si el año pasa sin avanzar por días (⏩), se recupera el tiempo libre que faltaba */
{const _age=ageUp;ageUp=function(){ensureClock();const p=P;const miss=Math.max(0,365-(G.day||0));const y0=G.year;
  _age();if(G.year===y0)return;if(p&&p.alive){p._acted={};regenFt(p,miss);}G.day=0;if(typeof yearReports==='function')yearReports(y0);};}

/* ----- modos de juego: Híbrido (todo), Vida (solo persona: el país lo maneja la IA), Líder (empiezas gobernando) ----- */
const GMODES={hib:{n:'Híbrido',d:'Empiezas como persona y puedes llegar a gobernar. Las dos vistas en la misma partida.'},vida:{n:'Vida',d:'Solo tu vida: estudios, trabajo, familia, fama y dinero. El país lo dirige la IA; tu techo político es el gabinete.'},lider:{n:'Líder',d:'Empiezas como jefe de Estado del país que elijas y juegas la geopolítica y la geoeconomía. Al morir te sucede tu heredero o el siguiente líder.'}};
const gmode=()=>(G&&G.gm)||'hib';
{const _br=becomeRuler;becomeRuler=function(p,gov){if(gmode()==='vida'){p.cab=true;p.s.influencia=clamp(p.s.influencia+12,0,100);
    log((p.sex==='F'?`Llegas a la cima de la política: te nombran secretaria de Gobierno de ${natOf(p).name}. (Modo Vida: el país lo dirige la IA.)`:`Llegas a la cima de la política: te nombran secretario de Gobierno de ${natOf(p).name}. (Modo Vida: el país lo dirige la IA.)`),'big');return;}
  return _br(p,gov);};}
function setupLeader(p){const n=natOf(p);p.age=RI(46,60);p.s.inteligencia=Math.max(p.s.inteligencia,RI(62,80));p.s.influencia=RI(65,85);p.s.salud=RI(70,90);
  const want=pick(['Derecho','Economía']),mj=MAJORS.find(x=>x.n===want);p.edu.degree=mj.n;p.edu.degrees=[mj.n];p.dinero=U(p)*RI(20,60);
  const c=p.cult||cultOf(n.id);p.partner={name:rndFirst(p.sex==='M'?'F':'M',c)+' '+rndSur(c),rel:RI(55,85),sex:p.sex==='M'?'F':'M',age:p.age-RI(-2,6)};
  p.children=[];const k=RI(1,3);for(let i=0;i<k;i++){const sx=pick(['M','F']);p.children.push({name:rndFirst(sx,c),sex:sx,age:RI(8,26)});}
  p.career={track:'politica',rank:9,years:22};becomeRuler(p,n.gov==='democracia'?'democracia':'dictadura');p.rulerYears=RI(0,3);
  log((p.sex==='F'?`Eres la jefe de Estado de ${n.name}. Tienes ${p.age} años.`:`Eres el jefe de Estado de ${n.name}. Tienes ${p.age} años.`),'big');}
function continueAsLeader(){const old=P,n=natOf(old);const r=capitalOf(n.id)||old.r;const c=cultOf(n.id);const sx=pick(['M','F']);
  const np=newPlayer({first:rndFirst(sx,c),surname:rndSur(c),sex:sx,r,age:18,gen:(old.gen||1)});np.log=old.log.slice(-30);P=np;setupLeader(np);
  if(old.dyn)np.dyn={name:'Casa '+np.surname,prest:0,tree:[],law:'igual'};log(`Sucesión en ${n.name}: ${fullName(np)} asume el gobierno.`,'big');return true;}

/* ----- archivo de noticias con alcance (internacional / nacional / provincial) y categoría ----- */
const NW_CAT=[['war',/guerra|batalla|invad|capitula|ataque|ejército|asedi|ocupa|guerrilla|rebel|moviliza|bombarde/i],['eco',/PIB|econom|inflaci|crec|recesi|bolsa|banco|deuda|FMI|comercio|embargo|impuesto|desempleo|sueldo|salario|tasa/i],
  ['pol',/elecci|gobiern|golpe|presiden|ley|congreso|reforma|dictad|democracia|parlamento|primer ministr|aprobaci|votos|régimen|independ/i],['dip',/alianza|tratado|paz|embajad|acuerdo|cumbre|ultimátum|insult|regalo|garant/i]];
function nwCat(t){for(const [k,rx] of NW_CAT)if(rx.test(t))return k;return 'gen';}
let NW_PROV=null;
function archiveNews(t,cls,sc,r){if(!G||!t)return;ensureClock();const A=G.nw||(G.nw=[]);if(A.length&&A[A.length-1].t===t)return;
  const me=P&&P.alive?natOf(P):null;let s=sc||'int',nid=null;
  if(!sc&&me){if(t.includes(me.name)){s='nac';nid=me.id;}
    if(!NW_PROV||NW_PROV.k!==me.id){NW_PROV={k:me.id,L:regionsOf(me.id).map(x=>[x,RG[x].nm]).filter(x=>x[1].length>=5)};}
    const hit=NW_PROV.L.find(x=>t.includes(x[1]));if(hit){s='prov';r=hit[0];}}
  const late=(G.day||0)>=365;A.push({y:late?G.year-1:G.year,d:late?364:(G.day||0),t,c:cls||'news',s,k:nwCat(t),r:r||null,n:nid});if(A.length>600)A.splice(0,A.length-600);}
{const _fl=flushNews;flushNews=function(){news.forEach(x=>archiveNews(x.t,x.cls));_fl();};}
// reportes lógicos de fin de año, a partir de los datos de la simulación (sin texto de relleno)
const pctS=v=>(v>=0?'+':'')+v.toFixed(1)+' %';
function yearReports(y0){const p=P;if(!p||!p.alive)return;const n=natOf(p);const N=Object.values(G.nations).filter(x=>x.alive);
  const wg=N.reduce((s,x)=>s+x.gdp,0);const prev=G._wgdp||wg;G._wgdp=wg;const wgr=(wg/prev-1)*100;
  const by=N.filter(x=>x.gdp>3e10).sort((a,b)=>b.g-a.g);
  if(G._wgdp!==wg||prev!==wg)archiveNews((wgr>=0?`Economía mundial ${y0}: el producto global creció ${Math.abs(wgr).toFixed(1)} %. Mayor crecimiento: ${by.slice(0,3).map(x=>`${x.name} (${pctS(x.g)})`).join(', ')}. Mayor contracción: ${by.slice(-2).map(x=>`${x.name} (${pctS(x.g)})`).join(', ')}.`:`Economía mundial ${y0}: el producto global se contrajo ${Math.abs(wgr).toFixed(1)} %. Mayor crecimiento: ${by.slice(0,3).map(x=>`${x.name} (${pctS(x.g)})`).join(', ')}. Mayor contracción: ${by.slice(-2).map(x=>`${x.name} (${pctS(x.g)})`).join(', ')}.`),'news','int');
  const wars=(G.wars||[]).length;if(wars)archiveNews((wars===1?`Panorama de seguridad ${y0}: ${wars} conflicto armado activo en el mundo.`:`Panorama de seguridad ${y0}: ${wars} conflictos armados activos en el mundo.`),'news','int');
  archiveNews((n.g>=0?`${n.name} — balance ${y0}: la economía creció ${Math.abs(n.g).toFixed(1)} %, inflación de ${n.infl.toFixed(1)} %, tasa de referencia en ${n.rate.toFixed(1)} %. Aprobación del gobierno: ${Math.round(n.approval)} %; estabilidad: ${Math.round(n.stab)}.`:`${n.name} — balance ${y0}: la economía se contrajo ${Math.abs(n.g).toFixed(1)} %, inflación de ${n.infl.toFixed(1)} %, tasa de referencia en ${n.rate.toFixed(1)} %. Aprobación del gobierno: ${Math.round(n.approval)} %; estabilidad: ${Math.round(n.stab)}.`),'news','nac');
  const r=p.r,x=G.regions[r];if(x&&RG[r]){const pc=x.gdp/Math.max(1,x.pop);archiveNews(((x.hap!=null&&x.dev!=null?`${RG[r].nm}: ${fmtPop(x.pop)} habitantes, PIB por persona de ${fmtN(pc)}, felicidad ${Math.round(x.hap)}, desarrollo ${(+x.dev).toFixed(1)}.`:x.hap!=null?`${RG[r].nm}: ${fmtPop(x.pop)} habitantes, PIB por persona de ${fmtN(pc)}, felicidad ${Math.round(x.hap)}.`:x.dev!=null?`${RG[r].nm}: ${fmtPop(x.pop)} habitantes, PIB por persona de ${fmtN(pc)}, desarrollo ${(+x.dev).toFixed(1)}.`:`${RG[r].nm}: ${fmtPop(x.pop)} habitantes, PIB por persona de ${fmtN(pc)}.`)+(x.o!==n.id?` La provincia está bajo control de ${G.nations[x.o].name}.`:'')),'news','prov',r);}}
