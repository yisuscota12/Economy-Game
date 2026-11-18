/* ===================== v2.0b: fase 3 de la ruta 9d, parte 2 — Medio y Realista educativos =====================
   - Realista: «🔎 Por qué» en Finanzas (impuestos por tramos con tasa marginal y efectiva, precios y poder de compra desde que empezaste,
     tasa de referencia y tasa real de cada cuenta y crédito) y, cada año, «📊» en el historial: la inflación y lo que más pesó, tu ingreso
     contra los precios, impuestos con tasa efectiva, rendimiento real de tus cuentas y costo real de tus créditos, y por qué el banco
     central movió su tasa.
   - Medio: resumen del año (los mismos textos del Fácil), «Por qué» corto en Finanzas y glosario subrayado por omisión.
   - Todos los niveles: «💡 ¿Sabías que…?» plegable en ~20 pantallas (y en las pestañas de la vista País) con 30 datos nuevos y su fuente;
     glosario de 42 términos por categorías y con buscador; interruptores en Ajustes → 🎓 Aprender.
   - Fácil: tarjetas de primera vez también en gobierno y guerra (hojas y pestañas de la vista País) y 9 retos cortos con su logro.
   - Fin de vida: «📚 Lo que aprendiste en esta vida»: decisiones clave, conceptos que usaste (tocar = definición), cifras y un consejo.
   El estado va en G.ed (ajustes por partida: ys resumen, gl subrayado, sb rotación de datos) y P.lrn (por vida: d decisiones, c conceptos,
   k estado conocido, rt retos, p0/w0 referencia de precios e ingreso, tx impuestos, yw años con ingreso, mx patrimonio máximo, neg, net1). */

const V20B={st:{},vc:null};
function edEnsure(){if(!G)return null;if(!G.ed)G.ed={ys:1,gl:null,sb:{}};G.ed.sb=G.ed.sb||{};return G.ed;}
function lrnEnsure(p){p=p||P;if(!p)return null;if(!p.lrn)p.lrn={d:[],c:{},k:{},rt:{},tx:0,yw:0,mx:0,neg:0};const L=p.lrn;L.d=L.d||[];L.c=L.c||{};L.k=L.k||{};L.rt=L.rt||{};return L;}
function sbOn(){return CFG.sbs!==0;}
function glsOn(){if(!G||!P)return false;const e=edEnsure();if(e.gl!=null)return !!e.gl;const k=lvlOf();return k==='f'||k==='m';}
function ysOn(){const e=edEnsure();return !!(e&&e.ys);}
const v20bQuiet=()=>typeof FF_ON!=='undefined'&&FF_ON;
const sgnP=v=>(v>=0?'+':'−')+pct(Math.abs(v));
const capF=s=>String(s||'').replace(/^./,q=>q.toUpperCase());
const realR=(nom,inf)=>((1+nom/100)/(1+inf/100)-1)*100;

/* ---------- 1) 30 datos nuevos para «¿Sabías que…?» (temas nuevos: imp, gob, gue, tra, fam) ---------- */
SABIAS.push(
 ['La Reserva Federal de Estados Unidos y el Banco Central Europeo buscan una inflación de 2 % a mediano plazo.','Reserva Federal; Banco Central Europeo','fin'],
 ['El Banco de México tiene como meta una inflación de 3 %, con un margen de un punto arriba o abajo.','Banco de México','fin'],
 ['En junio de 2022 la inflación de Estados Unidos llegó a 9.1 %, la más alta en unos 40 años.','Oficina de Estadísticas Laborales de EE. UU.','fin'],
 ['Japón mantuvo tasas de interés negativas de 2016 a 2024.','Banco de Japón','fin'],
 ['A inicios de los ochenta, la Reserva Federal subió su tasa a cerca de 20 % para frenar una inflación de casi 15 %.','Reserva Federal','fin'],
 ['Con 7 % de interés compuesto al año, un ahorro se duplica en unos 10 años: 72 entre la tasa da los años (regla del 72).','Regla del 72','fin'],
 ['En Estados Unidos el seguro de depósitos cubre hasta 250,000 dólares por persona y por banco.','FDIC','fin'],
 ['En México, el IPAB protege los depósitos hasta 400,000 UDIS por persona y por banco: unos 3 millones de pesos.','IPAB','fin'],
 ['En México el impuesto sobre la renta de las personas sube por tramos hasta una tasa de 35 %.','SAT, Ley del ISR','imp'],
 ['México recauda en impuestos alrededor del 17 % de su PIB, la proporción más baja de la OCDE.','OCDE, 2024','imp'],
 ['Los países de la OCDE recaudan en promedio cerca de un tercio de su PIB en impuestos.','OCDE, 2024','imp'],
 ['Emiratos Árabes Unidos no cobra impuesto sobre la renta a las personas.','Gobierno de los Emiratos Árabes Unidos','imp'],
 ['El IVA general en México es de 16 %.','SAT','imp'],
 ['La ONU tiene 193 Estados miembros.','ONU','gob'],
 ['Nueva Zelanda fue en 1893 el primer país autónomo en dar el voto a las mujeres.','Gobierno de Nueva Zelanda','gob'],
 ['En México el presidente gobierna un solo periodo de 6 años, sin reelección.','Constitución de México, art. 83','gob'],
 ['La deuda pública de Japón supera dos veces el tamaño de su economía, la más alta entre los países ricos.','FMI, 2024','gob'],
 ['La Constitución de Estados Unidos, de 1787, es la constitución escrita más antigua que sigue vigente.','Archivos Nacionales de EE. UU.','gob'],
 ['El gasto militar mundial llegó a unos 2.7 billones de dólares en 2024, un récord.','SIPRI, 2025','gue'],
 ['Estados Unidos concentra cerca del 37 % del gasto militar del mundo.','SIPRI, 2025','gue'],
 ['Costa Rica abolió su ejército en 1948.','Gobierno de Costa Rica','gue'],
 ['Nueve países tienen armas nucleares.','SIPRI','gue'],
 ['Desde 1945 ningún arma nuclear se ha usado en una guerra.','ONU','gue'],
 ['Cerca de 6 de cada 10 trabajadores del mundo están en la economía informal.','OIT','tra'],
 ['En México, más de la mitad de las personas ocupadas trabaja en la informalidad.','INEGI, ENOE','tra'],
 ['En México el aguinaldo mínimo por ley es de 15 días de salario.','Ley Federal del Trabajo, art. 87','tra'],
 ['Cerca de 2 de cada 10 empresas nuevas en Estados Unidos cierran antes de cumplir un año.','Oficina de Estadísticas Laborales de EE. UU.','eco'],
 ['El Mundial 2026 es el primero con 48 selecciones y tres países sede.','FIFA','dep'],
 ['El boxeo es deporte olímpico desde 1904; solo faltó en Estocolmo 1912.','COI','dep'],
 ['El streaming genera cerca de dos tercios de los ingresos mundiales de la música grabada.','IFPI, 2025','fam']);

/* ---------- 2) «¿Sabías que…?» en cada pantalla (todos los niveles) ---------- */
const SB_SCR=[
 ['bk',/^🏦 Bancos y fondos/,['fin']],
 ['mk',/^📈 /,['fin']],
 ['biz',/^🏪 Mis empresas|^Abrir negocio en/,['eco']],
 ['svc',/^🧑‍💼 Servicios/,['eco','tra']],
 ['fin',/^Finanzas/,()=>isReal()?['imp','fin']:['fin','eco']],
 ['act',/^Acciones/,['pob']],
 ['car',/^Carrera|^💼 Tu empleo/,['tra']],
 ['bn',/^Bienes y negocios/,['eco']],
 ['ppl',/^Personas|^Familia/,['pob']],
 ['amb',/^Ambición y logros/,['pob']],
 ['arm',/^(<img[^>]*>\s*)?Ejércitos de/,['gue']],
 ['dip',/^🤝 Diplomacia/,['gob']],
 ['war',/^📜 Parte de guerra/,['gue']],
 ['eco',/^📊 Economía de/,['imp','eco']],
 ['ideo',/^Cambiar de sistema de gobierno/,['gob']],
 ['paz',/^Conferencia de paz/,['gue']],
 ['sec',/^\S+ (Secretaría|Directivas) de/,['gob']],
 ['ft',/^⚽/,['dep']],['cb',/^🥊/,['dep']],
 ['pais',/^<img class="flag"/,['geo','gob']]];
const SB_TAB={res:['gob','geo'],prov:['geo','nat'],arm:['gue'],eco:['imp','eco'],dip:['gob'],war:['gue'],rank:['eco','geo'],gab:['gob']};
function h3Text(h){if(typeof h!=='string')return null;const i=h.indexOf('<h3');if(i<0||i>400)return null;const j=h.indexOf('>',i);return h.slice(j+1,j+220);}
function sbScr(h){const t=h3Text(h);if(t==null)return null;
  if(P&&P.fc&&typeof FC!=='undefined'&&FC[P.fc.k]&&t.startsWith(FC[P.fc.k].ic+' '+FC[P.fc.k].n))return ['fc',/box|mma|futbol/.test(P.fc.k)?['dep']:['fam']];
  for(const [k,rx,th] of SB_SCR)if(rx.test(t))return [k,typeof th==='function'?th():th];return null;}
function sbPick(key,th,step){const e=edEnsure();const L=[];SABIAS.forEach((f,i)=>{if(th.includes(f[2]))L.push(i);});if(!L.length)return -1;
  let c=e.sb[key];const now=Date.now();if(c==null)c=(key.length*7+(G.year||0))%L.length;else if(step||now-(V20B.st[key]||0)>15000)c++;
  e.sb[key]=c%L.length;V20B.st[key]=now;return L[e.sb[key]];}
function sbInner(i){const f=SABIAS[i];return `<span>${f[0]}</span> <small><span>Fuente:</span> <span>${f[1]}</span></small>`;}
function sbEl(key,th){const i=sbPick(key,th,false);if(i<0)return null;const d=document.createElement('details');d.className='sbx';d.dataset.k=key;if(CFG.sbc!==1)d.open=true;
  d.innerHTML=`<summary><span>💡 </span><span>¿Sabías que…?</span></summary><div class="sbt" role="button">${sbInner(i)}</div>`;
  d.addEventListener('toggle',()=>{const v=d.open?0:1;if(CFG.sbc!==v){CFG.sbc=v;saveCfg();}});
  d.querySelector('.sbt').onclick=ev=>{ev.stopPropagation();const j=sbPick(key,th,true);if(j>=0)d.querySelector('.sbt').innerHTML=sbInner(j);};return d;}
function sbPut(root,key,th,top){if(!root||!sbOn()||!G||!P)return;if(root.querySelector('.sbx'))return;const el=sbEl(key,th);if(!el)return;
  if(top){root.insertBefore(el,root.firstChild);return;}const h3=root.querySelector('h3');if(h3)h3.after(el);else root.insertBefore(el,root.firstChild);}

/* ---------- 3) Fácil: tarjetas de primera vez en gobierno y guerra ---------- */
const EZ_TXT={
 res:['gob','Resumen de tu país: PIB (el tamaño de su economía), crecimiento, estabilidad, deuda y relaciones. Si gobiernas, aquí cambias el sistema de gobierno y formas naciones nuevas.'],
 prov:['geo','Cada provincia tiene población, riqueza, felicidad y desarrollo. Invertir y construir edificios las hace crecer; las ocupadas o muy infelices pueden rebelarse.'],
 arm:['gue','Tus ejércitos: soldados, calidad (sube con el gasto por soldado), moral y abasto. En guerra el tiempo corre mes a mes: mueves tropas, combates y sitias provincias. Cada soldado de más cuesta dinero del tesoro.'],
 ecoN:['imp','El presupuesto reparte el dinero del país entre ejército, investigación, bienestar y más. Impuestos altos recaudan más, pero restan crecimiento y aprobación; si gastas más de lo que entra, la deuda sube.'],
 dip:['gob','La opinión de cada país hacia ti depende de su ideología, la historia reciente y tus acciones. Alianzas y pactos te protegen, y los aliados entran a tus guerras con sus ejércitos. Tienes pocas acciones diplomáticas por año: úsalas donde más importan.'],
 parte:['gue','El parte resume la guerra: provincias ocupadas, bajas y cansancio de cada bando. Un país capitula si pierde más de la mitad de su población o se agota; antes de eso, la paz se negocia.'],
 rank:['eco','El ranking ordena a los países por su puntaje: 40 % economía (PIB), 30 % población y 30 % poder militar. Aquí ves tu lugar y quién va adelante.'],
 gab:['gob','El gabinete: las secretarías del gobierno, cada una con su titular. Un titular capaz mejora los resultados de su área; las directivas cambian sus prioridades a cambio de un costo.'],
 ideo:['gob','El sistema de gobierno cambia cuánto crece tu país, cuánto investiga, cuántos reclutas tiene y cuánto recauda. Cambiarlo cuesta estabilidad y solo se puede cada 4 años.'],
 paz:['gue','En la conferencia de paz gastas puntos de paz: cada provincia cuesta 1, liberar un país 1 y las reparaciones 2. Si el enemigo capituló, puedes tomar todo lo que ocupas.']};
(function(){const add=[['arm',/^(<img[^>]*>\s*)?Ejércitos de/],['dip',/^🤝 Diplomacia/],['parte',/^📜 Parte de guerra/],['ecoN',/^📊 Economía de/],['ideo',/^Cambiar de sistema de gobierno/],['paz',/^Conferencia de paz/],['gab',/^\S+ (Secretaría|Directivas) de/]]
  .map(([k,rx])=>[k,rx,EZ_TXT[k][0],EZ_TXT[k][1]]);const i=EZ_SCR.findIndex(e=>e[0]==='pais');EZ_SCR.splice(i>=0?i:EZ_SCR.length,0,...add);})();
const EZ_TABK={res:'res',prov:'prov',arm:'arm',eco:'ecoN',dip:'dip',war:'parte',rank:'rank',gab:'gab'};
function ezCardHTML(txt,th,id){const f=ezSabias(th);return `<div class="ezc" id="${id}"><div class="ezh"><span>🌱 Primera vez aquí</span><button class="ezx" data-ezok aria-label="Entendido">✕</button></div><p>${txt}</p>${f?`<div class="ezsb"><span>💡 </span><span>¿Sabías que…?</span> <span>${f[0]}</span> <small><span>Fuente:</span> <span>${f[1]}</span></small></div>`:''}<button class="btn" data-ezok>Entendido</button></div>`;}
function ezTabCard(body,tab){if(!ezOn())return false;const z=ezEnsure();const k=EZ_TABK[tab];if(!k||!z.tips||!EZ_TXT[k]){V20B.vc=null;return false;}
  if(z.seen[k]&&V20B.vc!==k){return false;}z.seen[k]=1;V20B.vc=k;const w=document.createElement('div');w.innerHTML=ezCardHTML(EZ_TXT[k][1],EZ_TXT[k][0],'ezcv');const c=w.firstChild;body.insertBefore(c,body.firstChild);
  c.querySelectorAll('[data-ezok]').forEach(x=>x.onclick=ev=>{ev.stopPropagation();V20B.vc=null;c.remove();save();});return true;}

/* ---------- 4) glosario ampliado: 42 términos por categoría + buscador ---------- */
const GLC=['Tu dinero','Bancos y crédito','Inversiones','Empresas','Economía del país','Gobierno e impuestos','Comercio y divisas'];
{const cat={'Inflación':4,'PIB':4,'PIB por persona':4,'Salario medio':0,'Tasa de interés':1,'Seguro de depósitos':1,'Acción (bolsa)':2,'Dividendo':2,'Diversificar':2,'Utilidad':3,'Patrimonio':0,'Historial crediticio':1,'Impuestos':5,'Quiebra':3};
 GLOS.forEach(g=>{g[3]=cat[g[0]]!=null?cat[g[0]]:0;});}
GLOS.push(
 ['Poder adquisitivo','Lo que puedes comprar con tu dinero. Si los precios suben más que tu ingreso, tu poder adquisitivo baja aunque ganes más.',['poder adquisitivo','poder de compra'],0],
 ['Interés compuesto','Ganar intereses sobre los intereses ya ganados. Con 7 % al año, un ahorro se duplica en unos 10 años; con una deuda funciona igual, pero en tu contra.',['interés compuesto'],0],
 ['Índice de precios','Número que sigue el costo de una canasta de bienes y servicios. Si pasa de 1.00 a 1.10, los precios subieron 10 %.',['índice de precios'],0],
 ['Tasa real','La tasa de interés menos la inflación. Es lo que de verdad gana tu ahorro, o te cuesta tu deuda, en poder de compra.',['tasa real'],1],
 ['Banco central','Institución que emite la moneda de un país y fija su tasa de referencia para mantener la inflación baja y estable, como el Banco de México o la Reserva Federal.',['banco central'],1],
 ['Tasa de referencia','La tasa que fija el banco central. Subirla encarece el crédito y frena la inflación; bajarla abarata el crédito y anima la economía.',['tasa de referencia'],1],
 ['Crédito','Dinero que un banco te presta a cambio de devolverlo con intereses en pagos periódicos.',['crédito','créditos','préstamo','préstamos'],1],
 ['Fondo de inversión','Dinero de muchas personas que un gestor invierte en muchas acciones o bonos: diversificas sin elegir una por una.',['fondo de inversión','fondos de inversión'],2],
 ['Bono','Un préstamo que le haces a un gobierno o a una empresa: te paga un interés fijo y te devuelve el dinero al vencer.',['bono','bonos'],2],
 ['Rendimiento','Lo que gana una inversión en un periodo, en % de lo invertido: intereses, dividendos y cambio de precio.',['rendimiento'],2],
 ['Venta en corto','Apostar a que un precio baja: vendes acciones prestadas y las recompras después. Si el precio sube, la pérdida no tiene límite.',['venta en corto','en corto'],2],
 ['Margen','Comprar con dinero prestado por la casa de bolsa. Multiplica las ganancias y también las pérdidas.',['margen'],2],
 ['Ganancia de capital','Lo que ganas al vender algo más caro de lo que lo compraste. En muchos países paga impuesto.',['ganancia de capital','ganancias de capital','ganancias de bolsa'],2],
 ['Salida a bolsa','Cuando una empresa vende acciones al público por primera vez para conseguir dinero y crecer.',['salida a bolsa'],3],
 ['Recesión','Cuando la economía de un país se contrae en vez de crecer: suben el desempleo y las quiebras.',['recesión'],4],
 ['Deflación','Baja general de los precios. Parece buena noticia, pero suele venir con menos ventas, menos empleo y deudas más pesadas.',['deflación'],4],
 ['Hiperinflación','Inflación descontrolada, de 50 % o más al mes: la moneda pierde su valor en semanas.',['hiperinflación'],4],
 ['Tasa marginal','El porcentaje de impuesto que se cobra sobre el último peso que ganas: el de tu tramo más alto.',['tasa marginal'],5],
 ['Tasa efectiva','Todo lo que pagas de impuestos dividido entre todo tu ingreso. En un impuesto por tramos siempre es menor que la tasa marginal.',['tasa efectiva'],5],
 ['Impuesto progresivo','Impuesto por tramos: cada tramo de ingreso paga una tasa mayor, pero solo sobre la parte que cae en ese tramo.',['impuesto progresivo','por tramos'],5],
 ['Deuda pública','Lo que debe el gobierno. Se mide en % del PIB; si crece demasiado, los intereses se comen el presupuesto y los mercados dudan de que pueda pagar.',['deuda pública'],5],
 ['Déficit','Cuando el gobierno gasta en un año más de lo que recauda. Se cubre con deuda o imprimiendo dinero.',['déficit'],5],
 ['Presupuesto','El plan de gastos del gobierno para el año: cuánto va al ejército, a la educación, a la salud y a lo demás.',['presupuesto'],5],
 ['Tipo de cambio','Cuántas unidades de tu moneda cuesta un dólar u otra moneda.',['tipo de cambio','tipos de cambio'],6],
 ['Devaluación','Cuando tu moneda pierde valor frente a otras: lo importado se encarece y lo que exportas se abarata para otros países.',['devaluación','depreciación'],6],
 ['Reservas internacionales','Divisas y oro que guarda el banco central para pagar importaciones y deudas y para defender su moneda.',['reservas internacionales'],6],
 ['Sanciones','Castigos comerciales de otros países: menos comercio y menos crecimiento para el país sancionado.',['sanciones'],6],
 ['Tratado comercial','Acuerdo entre países para comerciar con menos barreras: suele subir el crecimiento de ambos.',['tratado comercial','tratados comerciales'],6]);
V20.gt=null;
showGlossary=function(){let h=`<h3>📖 Glosario</h3><div class="hint">Términos de economía, finanzas y gobierno que usa el juego. Puedes verlos subrayados en las pantallas (Ajustes → 🎓 Aprender): toca uno para leer su definición.</div>
  <input class="glq" id="glq" type="search" autocomplete="off" placeholder="Buscar un término"><div class="glsl">`;
  GLC.forEach((c,ci)=>{const L=GLOS.map((g,i)=>[g,i]).filter(([g])=>(g[3]||0)===ci);if(!L.length)return;h+=`<div class="sect glc" data-c="${ci}">${c}</div>`;L.forEach(([g,i])=>{h+=`<div class="glsi" data-c="${ci}" data-g="${i}"><b>${g[0]}</b><p>${g[1]}</p></div>`;});});
  h+=`<div class="hint glno" style="display:none">Ningún término coincide.</div></div>`;
  openSheet(h,b=>{const q=b.querySelector('#glq');if(!q)return;q.oninput=()=>{const s=q.value.trim().toLocaleLowerCase();let any=0;const vis={};
    b.querySelectorAll('.glsi').forEach(x=>{const ok=!s||x.textContent.toLocaleLowerCase().includes(s);x.style.display=ok?'':'none';if(ok){any=1;vis[x.dataset.c]=1;}});
    b.querySelectorAll('.glc').forEach(x=>x.style.display=vis[x.dataset.c]?'':'none');const no=b.querySelector('.glno');if(no)no.style.display=any?'none':'';};});};
const GLS_SCR2=/^(🏦 Bancos y fondos|📈 |🏪 Mis empresas|🧑‍💼 Servicios|Finanzas|Bienes y negocios|<img class="flag"|📊 Economía de|🤝 Diplomacia)/;
glsMark=function(root,h){if(!root||!glsOn())return;const t=h3Text(h);if(t==null||!GLS_SCR2.test(t))return;glsRoot(root);};
function glsRoot(root){if(!root||root.querySelector('.gls'))return;
  const terms=glsTerms(),used=new Set();const cjk=typeof LANG!=='undefined'&&/^(zh|ja|ko)$/.test(LANG);
  const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const e=n.parentElement;if(!e||e.closest('button,a,input,select,textarea,h3,.ib,.gls,.ezc,.sbx,label,summary'))return NodeFilter.FILTER_REJECT;return n.nodeValue.trim().length>3?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[];let n;while((n=W.nextNode())&&nodes.length<400)nodes.push(n);let cnt=0;
  for(const nd of nodes){if(cnt>=5)break;const tx=nd.nodeValue,lo=tx.toLocaleLowerCase();
    for(const [v,gi] of terms){if(used.has(gi))continue;const vl=v.toLocaleLowerCase();let k=lo.indexOf(vl);
      while(k>=0&&!cjk){const a=k?lo[k-1]:' ',b=lo[k+vl.length]||' ';if(!/[\p{L}\p{N}]/u.test(a)&&!/[\p{L}\p{N}]/u.test(b))break;k=lo.indexOf(vl,k+1);}
      if(k<0)continue;used.add(gi);cnt++;const sp=document.createElement('span');sp.className='gls';sp.dataset.g=gi;sp.setAttribute('data-noi18n','');sp.setAttribute('role','button');sp.textContent=tx.slice(k,k+v.length);
      const rest=nd.splitText(k);rest.nodeValue=rest.nodeValue.slice(v.length);rest.parentNode.insertBefore(sp,rest);
      sp.onclick=ev=>{ev.stopPropagation();const g=GLOS[+sp.dataset.g];toast('📖 '+g[0],g[1]);};break;}}}

/* ---------- 5) Finanzas → «🔎 Por qué» ---------- */
function taxBr(p){const t=clamp(N0[regOf(p).w0].tax*1.5,6,30)/100,T=U(p);return [[0,.5*T,t*.3],[.5*T,1.5*T,t],[1.5*T,4*T,t*1.5],[4*T,Infinity,t*2]];}
function taxMarg(p,g){const B=taxBr(p);for(const [a,b,r] of B)if(g<=b)return r*100;return B[3][2]*100;}
function accAvg(p){let v=0,s=0;for(const id in p.acc||{}){const a=p.acc[id];if(!(a>0))continue;const b=bkInfo(id);if(!b)continue;v+=a;s+=a*depRate(b);}return v>0?[s/v,v]:[0,0];}
function debtAvg(p){let v=0,s=0;(p.debts||[]).forEach(d=>{if(d.bal>0){v+=d.bal;s+=d.bal*(d.rate||0)*100;}});return v>0?[s/v,v]:[0,0];}
function cbTgt(n){const x=cxOf(n);const mm=typeof cxMembers==='function'?cxMembers(n.cur):[n];const adv=mm.length&&mm.reduce((s,m)=>s+gdppc(m),0)/mm.length>25000;return adv?2:3.5;}
function finWhyHTML(p){const real=isReal(),n=natOf(p),g=grossIncome(p),liv=livingCost(p);let h=`<div class="sect">🔎 Por qué</div><div class="why">`;
  if(!real){const net=g-liv;
    if(g>0)h+=net>=0?`<p><span>Ahorras ${pct(net/g*100)} de tu ingreso.</span></p>`:`<p><span>Gastas ${pct(-net/g*100)} más de lo que ganas.</span></p>`;
    const sav=p.dinero+accValue(p);if(liv>0&&sav>0)h+=`<p><span>Tus ahorros cubren ${Math.round(sav/(liv/12))} meses de gastos.</span></p>`;
    return h+`<p class="mut"><span>En este nivel no hay impuestos ni inflación.</span> <span>En Realista sí: aquí verías cuánto pagas por tramos y cómo los precios cambian lo que puedes comprar.</span></p></div>`;}
  // impuestos por tramos
  h+=`<div class="whyh">🧾 <span>Impuestos por tramos</span></div>`;
  if(g<=0)h+=`<p><span>Sin ingresos este año no pagas impuesto sobre la renta.</span></p>`;
  else{const B=taxBr(p),tax=taxOf(p,g);h+=`<div class="fin">`+B.map(([a,b,r],i)=>{const part=Math.max(0,Math.min(g,b)-a),cur=g>a&&g<=b;
      const lab=i===0?`<span>Hasta ${fmt(b)}</span>`:b===Infinity?`<span>Más de ${fmt(a)}</span>`:`${fmt(a)} – ${fmt(b)}`;
      return `<div class="frow${cur?' cur':''}"><span>${lab}</span><span>${pct(r*100)} → ${fmt(part*r)}</span></div>`;}).join('')+`</div>`;
    h+=`<p><span>Tasa efectiva: ${pct(tax/g*100)}</span> · <span>tasa marginal: ${pct(taxMarg(p,g))}</span></p><p><span>Cada tasa se cobra solo sobre la parte de tu ingreso que cae en su tramo. Por eso tu tasa efectiva es menor que la marginal, y ganar más nunca te deja con menos dinero.</span></p>`;}
  // precios y poder de compra
  const L=lrnEnsure(p);h+=`<div class="whyh">🛒 <span>Precios y poder de compra</span></div><p><span>Inflación de ${n.name} este año: ${pct(n.infl)}.</span></p>`;
  const p0=L.p0&&L.p0.n===n.id?L.p0:null;
  if(p0&&G.year>p0.y){const ra=n.price/p0.pr;h+=`<p><span>Desde ${p0.y}, los precios subieron ${pct((ra-1)*100)}: con el mismo dinero compras ${pct((1-1/ra)*100)} menos.</span></p>`;
    const w0=L.w0&&L.w0.n===n.id?L.w0:null;if(w0&&w0.g>0&&g>0&&G.year>w0.y){const rw=n.price/w0.pr;h+=`<p><span>Desde ${w0.y} tu ingreso cambió ${sgnP((g/w0.g-1)*100)}; en poder de compra, ${sgnP(((g/w0.g)/rw-1)*100)}.</span></p>`;}}
  else h+=`<p><span>Si tu ingreso sube menos que la inflación, puedes comprar menos que el año pasado aunque ganes más.</span></p>`;
  // tasas reales
  const x=cxOf(n),rr=realR(x.pr,n.infl);
  h+=`<div class="whyh">🏦 <span>Tasas de interés reales</span></div><div class="fin"><div class="frow"><span>${capF(cbName(n.cur))}</span><span>${pct(x.pr)} (<span>real ${sgnP(rr)}</span>)</span></div>`;
  for(const id in p.acc||{}){if(!(p.acc[id]>0))continue;const b=bkInfo(id);if(!b)continue;const r=depRate(b);h+=`<div class="frow"><span>${b.nm}</span><span>${pct(r)} (<span>real ${sgnP(realR(r,n.infl))}</span>)</span></div>`;}
  (p.debts||[]).forEach(d=>{if(!(d.bal>0))return;const r=(d.rate||0)*100;h+=`<div class="frow"><span>${d.type}</span><span>${pct(r)} (<span>real ${sgnP(realR(r,n.infl))}</span>)</span></div>`;});
  h+=`</div><p><span>Tasa real ≈ tasa nominal − inflación: es lo que de verdad gana tu ahorro, o te cuesta tu deuda, en poder de compra.</span> <span>${rr>=0?'Con tasa real positiva, ahorrar rinde y el crédito caro enfría la economía y los precios.':'Con tasa real negativa, ahorrar pierde poder de compra y pedir prestado sale barato: eso empuja el consumo y los precios.'}</span></p>`;
  return h+`</div>`;}
function finWhyPut(b){if(!b||b.querySelector('.why'))return;const f=b.querySelector('.fin');const w=document.createElement('div');w.innerHTML=finWhyHTML(P);const frag=document.createDocumentFragment();while(w.firstChild)frag.appendChild(w.firstChild);
  if(f)f.after(frag);else b.appendChild(frag);}

/* ---------- 6) hojas: dato por pantalla, «Por qué», glosario en Medio/Realista ---------- */
{const _or=openSheetRaw;openSheetRaw=function(h,bd){const r=_or(h,bd);try{if(G&&P&&typeof h==='string'){const b=$('sheetIn');const s=sbScr(h);
      if(s&&s[0]==='fin')finWhyPut(b);
      if(s&&!b.querySelector('#ezc'))sbPut(b,s[0],s[1]);
      if(!ezOn()&&glsOn())setTimeout(()=>{try{glsMark($('sheetIn'),h);}catch(x){}},40);}}catch(x){console.warn('v20b hoja',x);}return r;};}
/* pestañas de la vista País: tarjeta de primera vez (Fácil) o dato del tema; glosario en Resumen y Economía */
{const _rv=renderView;renderView=function(...a){const r=_rv(...a);try{if(G&&P&&VIEW.v==='pa'){const body=$('natBody');const t=VIEW.tab;
      const card=ezTabCard(body,t);if(!card&&SB_TAB[t])sbPut(body,'v_'+t,SB_TAB[t],true);
      if((t==='res'||t==='eco')&&glsOn())setTimeout(()=>{try{glsRoot($('natBody'));}catch(x){}},40);}else V20B.vc=null;}catch(x){console.warn('v20b vista',x);}return r;};}

/* ---------- 7) Fácil: retos cortos con su logro ---------- */
const EZ_RET=[
 ['cuenta','🏦','Abre tu primera cuenta de banco',p=>accValue(p)>0,null,'bk','Tasa de interés'],
 ['empleo','💼','Consigue tu primer empleo',p=>!!p.job||!!(p.career&&p.career.track),null,'car','Salario medio'],
 ['ahorro','💰','Ahorra un año de salario',p=>p.dinero+accValue(p)>=U(p),p=>(p.dinero+accValue(p))/U(p),'bk','Patrimonio'],
 ['neto','📘','Termina un año ganando más de lo que gastas',p=>!!(p.lrn&&p.lrn.net1),null,'fin','Patrimonio'],
 ['fondo','📈','Invierte en un fondo',p=>(typeof mfValue==='function'?mfValue(p):0)>0,null,'mf','Fondo de inversión'],
 ['casa','🏠','Compra tu casa',p=>!!p.house,null,'bn','Patrimonio'],
 ['empresa','🏪','Abre tu primera empresa',p=>bzList(p).length>0,null,'biz','Utilidad'],
 ['div3','🧺','Ten acciones de 3 empresas distintas',p=>ezPosN(p)>=3,p=>ezPosN(p)/3,'mk','Diversificar'],
 ['pat5','🏆','Junta un patrimonio de 5 años de salario',p=>netWorth(p)>=5*U(p),p=>netWorth(p)/(5*U(p)),'bk','Interés compuesto']];
function ezPosN(p){return p.bk&&p.bk.pos?Object.keys(p.bk.pos).filter(k=>{const o=p.bk.pos[k];return o&&o.q>0;}).length:0;}
function ezRetOn(){if(!ezOn())return false;const z=ezEnsure();return z.ret!==0;}
function ezRetCheck(quiet){const p=P;if(!p||!p.alive||!ezOn()||p.age<18)return;const L=lrnEnsure(p);
  for(const [id,ic,t,ok,,,cpt] of EZ_RET){if(L.rt[id]!=null)continue;let v=false;try{v=ok(p);}catch(e){}if(!v)continue;L.rt[id]=p.age;if(cpt)L.c[cpt]=L.c[cpt]||G.year;
    log(`🎯 Reto cumplido: ${t}.`,'big');p.s.felicidad=clamp(p.s.felicidad+2,0,100);if(!quiet)toast('🎯 Reto cumplido',t);}}
function ezRetNext(){const p=P;if(!p||p.age<18)return null;const L=lrnEnsure(p);return EZ_RET.find(r=>L.rt[r[0]]==null)||null;}
{const _g=ezGo;ezGo=function(k){if(k==='mk')showMarket('mk');else if(k==='bn')showAssets();else if(k==='fin')showFinance();else _g(k);};}
function ezRetPaint(){let el=$('ezRet');const on=ezRetOn()&&P&&P.alive&&!P.ruler;const r=on?ezRetNext():null;if(!r){if(el)el.style.display='none';return;}
  if(!el){const a=$('ezTip')||$('topCard');if(!a)return;el=document.createElement('div');el.id='ezRet';a.after(el);}
  else if($('ezTip')&&el.previousElementSibling!==$('ezTip'))$('ezTip').after(el);
  const L=lrnEnsure(P);const done=EZ_RET.filter(x=>L.rt[x[0]]!=null).length;let pr=null;try{pr=r[4]?clamp(r[4](P),0,1):null;}catch(e){}
  const key=r[0]+'|'+done+'|'+(pr==null?'':Math.round(pr*20));
  if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=`<button class="ezgo"><span class="ezl">🎯 Reto:</span> <span>${r[1]} </span><span>${r[2]}</span>${pr!=null?`<i class="rtb"><b style="width:${Math.round(pr*100)}%"></b></i>`:''}</button><span class="rtc">${done}/${EZ_RET.length}</span>`;
    el.querySelector('.ezgo').onclick=()=>ezGo(r[5]);}
  el.style.display='';}
{const _sa=showAch;showAch=function(){_sa();try{const p=P;if(!p)return;const L=lrnEnsure(p);const any=Object.keys(L.rt).length;if(!ezOn()&&!any)return;const b=$('sheetIn');if(!b||b.querySelector('#v20rt'))return;
  const d=document.createElement('div');d.id='v20rt';d.innerHTML=`<div class="sect">🎯 Retos</div>`+EZ_RET.map(([id,ic,t])=>{const a=L.rt[id];return `<div class="item"><span><div class="t">${a!=null?'🏅':'⬜'} <span>${t}</span></div>${a!=null?`<div class="s"><span>A los ${a} años</span></div>`:''}</span></div>`;}).join('');
  const s=b.querySelector('.sect');if(s)s.before(d);else b.appendChild(d);}catch(e){console.warn('v20b retos',e);}};}
(function(){try{LOT_RX[2][1]=new RegExp(LOT_RX[2][1].source+'|^🎯 Reto cumplido');}catch(e){}})();

/* ---------- 8) lo que aprendes en la vida: decisiones clave y conceptos ---------- */
const LRN_T={job:'A los {0} años: consigues tu primer empleo ({1}).',track:'A los {0} años: entras a la carrera de {1}.',uni:'A los {0} años: entras a la universidad ({1}).',
 grad:'A los {0} años: te gradúas de la universidad.',partner:'A los {0} años: formas pareja.',kid:'A los {0} años: nace tu primer hijo.',acc:'A los {0} años: abres tu primera cuenta de banco.',
 debt:'A los {0} años: pides tu primer crédito.',house:'A los {0} años: compras tu casa.',biz:'A los {0} años: abres tu primera empresa.',stock:'A los {0} años: compras tus primeras acciones.',
 fund:'A los {0} años: inviertes en tu primer fondo.',fame:'A los {0} años: empiezas tu carrera de fama.',move:'A los {0} años: te mudas a {1}.',ruler:'A los {0} años: llegas a gobernar {1}.',
 war:'A los {0} años: tu país entra en guerra.',bankrupt:'A los {0} años: caes en bancarrota.'};
const LRN_C={acc:['Tasa de interés','Seguro de depósitos'],debt:['Crédito','Historial crediticio','Interés compuesto'],stock:['Acción (bolsa)','Dividendo'],fund:['Fondo de inversión','Diversificar'],
 biz:['Utilidad'],house:['Patrimonio'],job:['Salario medio'],ruler:['PIB','Presupuesto','Deuda pública'],bankrupt:['Quiebra'],war:['Presupuesto']};
function lrnTrack(p){if(!p||!G)return;const L=lrnEnsure(p),K=L.k;const add=(k,a)=>{if(K[k])return;K[k]=1;if(L.d.length<16)L.d.push([p.age,k,a==null?null:a]);(LRN_C[k]||[]).forEach(c=>{L.c[c]=L.c[c]||G.year;});};
  try{if(p.job)add('job',p.job.name);
    if(p.career&&p.career.track){const T=typeof TRACKS!=='undefined'&&TRACKS[p.career.track];add('track',T&&T.name?T.name:p.career.track);}
    if(p.edu&&p.edu.uni)add('uni',p.edu.uni);if(p.edu&&(p.edu.degrees||[]).length&&K.uni)add('grad');
    if(p.partner)add('partner');if((p.children||[]).length)add('kid');if(accValue(p)>0)add('acc');if((p.debts||[]).some(d=>d.bal>0))add('debt');
    if(p.house)add('house');if(bzList(p).length)add('biz');if(ezPosN(p)>0)add('stock');if(typeof mfValue==='function'&&mfValue(p)>0)add('fund');if(p.fc)add('fame');
    if(p.ruler)add('ruler',natOf(p).name);if(atWar(p))add('war');if(p.bankrupt)add('bankrupt');
    const w=regOf(p).w0;if(K.home==null)K.home=w;else if(K.home!==w&&!K.mv){K.mv=1;K.home=w;if(L.d.length<16)L.d.push([p.age,'move',natOf(p).name]);}
    const nw=netWorth(p);if(nw>L.mx)L.mx=nw;}catch(e){console.warn('v20b lrn',e);}}
function lrnRefs(p){if(!p||p.age<18)return;const L=lrnEnsure(p),n=natOf(p);
  if(!L.p0||L.p0.n!==n.id)L.p0={n:n.id,y:G.year,pr:n.price||1};
  const g=grossIncome(p);if(g>0&&(!L.w0||L.w0.n!==n.id))L.w0={n:n.id,y:G.year,pr:n.price||1,g};}

/* ---------- 9) cada año: Medio y Realista (Fácil ya tiene el suyo en la v2.0a) ---------- */
function v20bSnap(p){const n=natOf(p),x=cxOf(n),inc=grossIncome(p),rs=G.rs;const fd=rs?['wheat','corn','rice'].reduce((s,k)=>s+(rs[k]?rs[k].p:0),0):0;
  return {n:n.id,inc,liv:livingCost(p),tax:taxOf(p,inc),nw:netWorth(p),price:n.price||1,infl:n.infl||0,pr:x.pr,cur:n.cur,fx:x.fx||1,oil:rs&&rs.oil?rs.oil.p:0,fd,war:atWar(p),rec:(n.rec||0)>0,mpr:n.mpr||0,acc:accAvg(p),debt:debtAvg(p),lvl:lvlOf()};}
function v20bCause(S,n){const x=cxOf(n),i0=S.infl,i1=n.infl,rs=G.rs;
  if(S.mpr>0)return `el gobierno imprime dinero (${S.mpr} % del PIB al año) y hay más dinero para los mismos bienes`;
  const fx=x.fx/S.fx-1;if(n.cur!=='USD'&&fx>.1)return `tu moneda perdió ${pct(fx/(1+fx)*100)} de su valor frente al dólar y lo importado se encarece`;
  if(S.war)return 'la guerra encarece los alimentos y el combustible';
  const oil=S.oil&&rs&&rs.oil?rs.oil.p/S.oil-1:0;if(oil>.15)return `el petróleo subió ${pct(oil*100)} y encarece el transporte y la producción`;
  const fd=S.fd&&rs?['wheat','corn','rice'].reduce((s,k)=>s+(rs[k]?rs[k].p:0),0)/S.fd-1:0;if(fd>.1)return `los alimentos subieron ${pct(fd*100)} en el mercado mundial`;
  const rr=S.pr-i0;if(rr>2&&i1<i0)return `la tasa del banco central (${pct(S.pr)}) está por encima de la inflación y frena el crédito y el consumo`;
  if(rr<-1&&i1>i0)return `la tasa del banco central (${pct(S.pr)}) está por debajo de la inflación y el crédito barato empuja el consumo`;
  if(S.rec&&i1<i0)return 'la recesión bajó la demanda';
  return 'los precios vuelven a su ritmo habitual de los últimos años';}
function v20bYear(p,S){const L=lrnEnsure(p);const real=isReal();
  if(real&&S.tax>0){L.tx+=S.tax;L.c['Impuestos']=L.c['Impuestos']||G.year;L.c['Tasa marginal']=L.c['Tasa marginal']||G.year;}
  if(real&&p.age>=19){L.c['Inflación']=L.c['Inflación']||G.year;L.c['Poder adquisitivo']=L.c['Poder adquisitivo']||G.year;}
  if(S.inc>0)L.yw++;if(p.age>=19){if(S.inc>0&&S.inc>S.liv)L.net1=1;if(S.inc>0&&S.inc<S.liv)L.neg++;}
  lrnTrack(p);lrnRefs(p);if(S.lvl==='f'){ezRetCheck(v20bQuiet());return;}
  if(v20bQuiet()||!p.alive||p.age<19||!ysOn())return;
  const nw1=netWorth(p);const e=edEnsure();const nw0=e.nw!=null&&e.nwy===G.year-1?e.nw:S.nw;e.nw=nw1;e.nwy=G.year;
  log(`📘 Tu año en números: ingresos de ${fmt(S.inc)} y gastos de vida de ${fmt(S.liv)}; tu patrimonio pasó de ${fmt(nw0)} a ${fmt(nw1)}.`,'news');
  const d=nw1-nw0,net=S.inc-S.liv-S.tax,u=U(p);
  if(S.inc>0&&S.inc-S.liv<0)log('📘 Gastaste más de lo que ganaste: tus ahorros cubrieron la diferencia.','news');
  else if(d>Math.max(net,0)*1.5+.2*u)log('📘 Tu patrimonio creció más que tu sueldo neto: tus cuentas, inversiones o empresas también te dieron dinero.','news');
  else if(d<Math.min(net,0)-.2*u)log('📘 Tu patrimonio bajó más que por tus gastos: alguna inversión, empresa o compra perdió valor.','news');
  if(!real)return;const n=natOf(p);if(n.id!==S.n)return;
  log(`📊 Inflación en ${n.name}: ${pct(n.infl)} (el año pasado, ${pct(S.infl)}). Lo que más pesó: ${v20bCause(S,n)}.`,'news');
  const g1=grossIncome(p);if(S.inc>0&&g1>0){const ri=g1/S.inc,rp=(n.price||1)/S.price;log(`📊 Tu ingreso cambió ${sgnP((ri-1)*100)} y los precios ${sgnP((rp-1)*100)}: en poder de compra, ${sgnP((ri/rp-1)*100)}.`,'news');}
  if(S.tax>0)log(`📊 Impuestos del año: ${fmt(S.tax)}, una tasa efectiva de ${pct(S.tax/S.inc*100)}; tu tramo más alto cobra ${pct(taxMarg(p,S.inc))}, pero solo sobre la parte del ingreso que lo pasa.`,'news');
  if(S.acc[1]>0)log(`📊 Tus cuentas rindieron en promedio ${pct(S.acc[0])} y la inflación fue ${pct(n.infl)}: rendimiento real de ${sgnP(realR(S.acc[0],n.infl))}.`,'news');
  if(S.debt[1]>0)log(`📊 Tus créditos cuestan en promedio ${pct(S.debt[0])} al año; descontando la inflación, ${sgnP(realR(S.debt[0],n.infl))} real.`,'news');
  const x=cxOf(n);if(n.cur===S.cur&&Math.abs(x.pr-S.pr)>=.25&&!(typeof cxPlayer==='function'&&cxPlayer(n.cur))){const who=capF(cbName(n.cur)),a=pct(S.pr),b=pct(x.pr),pi=x.pi!=null?x.pi:n.infl,tg=cbTgt(n);
    if(x.reg==='fijo'||x.reg==='caja')log(`🏦 ${who} movió su tasa de ${a} a ${b} para sostener su tipo de cambio fijo.`,'news');
    else if(x.pr>S.pr&&pi>tg)log(`🏦 ${who} subió su tasa de ${a} a ${b} porque la inflación (${pct(pi)}) está arriba de su meta (${pct(tg)}): los créditos nuevos salen más caros y las cuentas pagan más.`,'news');
    else if(x.pr<S.pr&&pi<=tg+1)log(`🏦 ${who} bajó su tasa de ${a} a ${b} porque la inflación (${pct(pi)}) está cerca de su meta (${pct(tg)}): el crédito se abarata y las cuentas pagan menos.`,'news');
    else log(`🏦 ${who} movió su tasa de ${a} a ${b}.`,'news');}}
{const _au=ageUp;ageUp=function(){const p=P;let S=null;try{if(p&&p.alive&&!p.event&&G)S=v20bSnap(p);}catch(e){}
  _au();try{if(S&&p===P)v20bYear(p,S);}catch(e){console.warn('v20b año',e);}};}

/* ---------- 10) fin de vida: «📚 Lo que aprendiste en esta vida» ---------- */
function lrnTip(p){const L=lrnEnsure(p),K=L.k;
  if(!K.acc)return 'Abrir una cuenta desde joven deja trabajar al interés compuesto.';
  if(L.neg>=3)return 'Gastar menos de lo que ganas, aunque sea poco, es la base de cualquier patrimonio.';
  if(!K.fund&&!K.stock)return 'Invertir una parte de tus ahorros en un fondo diversificado suele rendir más que la inflación a largo plazo.';
  if(!K.biz)return 'Emprender es arriesgado, pero una empresa bien manejada puede darte más que un sueldo.';
  return 'Prueba otro país u otro nivel: las mismas decisiones dan resultados distintos según la economía.';}
function lrnHTML(p){const L=lrnEnsure(p);const fill=(t,a)=>t.replace(/\{(\d)\}/g,(m,i)=>a[+i]!=null?a[+i]:'');
  let h=`<details class="lrnb" open><summary>📚 <span>Lo que aprendiste en esta vida</span></summary>`;
  if(L.d.length)h+=`<div class="lrnh">Decisiones clave</div><ul class="lrnd">`+L.d.map(([a,k,x])=>LRN_T[k]?`<li>${fill(LRN_T[k],[a,x])}</li>`:'').join('')+`</ul>`;
  const C=Object.keys(L.c).filter(c=>GLOS.some(g=>g[0]===c)).sort((a,b)=>L.c[a]-L.c[b]);
  if(C.length)h+=`<div class="lrnh">Conceptos que usaste</div><div class="lrnc">`+C.map(c=>`<button class="chip" data-gl="${GLOS.findIndex(g=>g[0]===c)}">${c}</button>`).join('')+`</div>`;
  h+=`<div class="lrns"><div><span>Años con ingresos: ${L.yw}</span></div><div><span>Patrimonio más alto: ${fmt(Math.max(L.mx,netWorth(p)))}</span></div>`;
  if(isReal()&&L.tx>0)h+=`<div><span>Impuestos pagados en tu vida: ${fmt(L.tx)}</span></div>`;
  const n=natOf(p);if(isReal()&&L.p0&&L.p0.n===n.id&&G.year>L.p0.y){const ra=(n.price||1)/L.p0.pr;h+=`<div><span>Los precios se multiplicaron ×${ra.toFixed(1)} durante tu vida adulta.</span></div>`;}
  const rd=Object.keys(L.rt).length;if(rd||lvlOf()==='f')h+=`<div><span>Retos cumplidos: ${rd} de ${EZ_RET.length}</span></div>`;
  h+=`</div><p class="lrnt"><span>💡 Para tu próxima vida:</span> <span>${lrnTip(p)}</span></p></details>`;return h;}
{const _sd=showDeath;showDeath=function(){try{if(P)lrnTrack(P);}catch(e){}_sd();try{const m=$('modal');if(!m||!P||m.querySelector('.lrnb'))return;const w=document.createElement('div');w.innerHTML=lrnHTML(P);const el=w.firstChild;
    const b=m.querySelector('button.opt');if(b)b.before(el);else m.appendChild(el);
    el.querySelectorAll('[data-gl]').forEach(x=>x.onclick=ev=>{ev.stopPropagation();const g=GLOS[+x.dataset.gl];if(g)toast('📖 '+g[0],g[1]);});}catch(e){console.warn('v20b fin',e);}};}

/* ---------- 11) render: retos; Ajustes → 🎓 Aprender ---------- */
{const _r=render;render=function(...a){const r=_r(...a);try{if(G&&P){if(ezOn())ezRetCheck(v20bQuiet());ezRetPaint();}}catch(e){}return r;};}
{const _ss=showSettings;showSettings=function(){_ss();try{v20bSettings();}catch(e){console.warn('v20b ajustes',e);}};}
function v20bSettings(){const b=$('sheetIn');if(!b||!G||!P)return;const box=$('v20cf');if(!box||box.querySelector('#v20bl'))return;const lv=lvlOf(),e=edEnsure();const yn=v=>v?'Sí':'No';
  const d=document.createElement('div');d.id='v20bl';
  d.innerHTML=`<div class="sect">🎓 Aprender</div>
   <button class="item" data-v2="sbs"><span><div class="t">💡 ¿Sabías que…? en cada pantalla</div><div class="s"><span>${yn(sbOn())}</span> · <span>Un dato real con su fuente arriba de cada pantalla.</span></div></span></button>
   <button class="item" data-v2="gl"><span><div class="t">📖 Términos subrayados</div><div class="s"><span>${yn(glsOn())}</span> · <span>Toca un término para ver qué significa.</span></div></span></button>
   ${lv!=='f'?`<button class="item" data-v2="ys"><span><div class="t">📘 Resumen del año</div><div class="s"><span>${yn(ysOn())}</span> · <span>${isReal()?'En el historial: tu año en números, la inflación y su causa, impuestos y tasas reales.':'En el historial: ingresos, gastos y cómo cambió tu patrimonio.'}</span></div></span></button>`:''}
   ${lv==='f'?`<button class="item" data-v2="ret"><span><div class="t">🎯 Retos</div><div class="s"><span>${yn(ezRetOn())}</span> · <span>Metas cortas con su logro arriba del mapa.</span></div></span></button>`:''}`;
  const c=box.querySelector('.v20lvc');const z=lv==='f'?box.querySelector('[data-ez]'):null;if(z)z.before(d);else if(c)c.after(d);else box.appendChild(d);
  d.querySelectorAll('[data-v2]').forEach(x=>x.onclick=()=>{const k=x.dataset.v2;if(k==='sbs'){CFG.sbs=sbOn()?0:1;saveCfg();}else if(k==='gl')e.gl=glsOn()?0:1;else if(k==='ys')e.ys=ysOn()?0:1;else if(k==='ret'){const z=ezEnsure();z.ret=z.ret===0?1:0;}save();render();showSettings();});}

/* ---------- 12) ayuda ⓘ y Guía ---------- */
(function(){const H=[
 ['Por qué','🔎 Por qué','Entender de dónde sale cada cifra (cuánto se lleva cada tramo de impuestos, cuánto suben los precios, cuánto rinde de verdad tu dinero) es lo que separa una decisión informada de una apuesta.','En Realista: impuestos por tramos con tu tasa marginal y efectiva, precios y poder de compra desde que empezaste a trabajar, y la tasa real de la tasa de referencia, tus cuentas y tus créditos. En Medio: cuánto ahorras y cuántos meses te duran tus ahorros.'],
 ['Retos','🎯 Retos','Las metas cortas y concretas son más fáciles de cumplir que una meta grande y lejana: cada paso cumplido da información y motivación para el siguiente.','En Fácil, arriba del mapa aparece el siguiente reto (abrir una cuenta, ahorrar un año de salario, diversificar…). Al cumplirlo ganas su logro y un poco de felicidad. Se pueden apagar en Ajustes → 🎓 Aprender.']];
 for(let i=H.length-1;i>=0;i--){HELP.unshift(H[i]);HELP_RX.unshift(new RegExp('^'+H[i][0],'i'));}
 const T=['🎓 Aprender en cada nivel',`<b>En todos los niveles se aprende algo real</b>, con más o menos detalle:
<ul><li><b>💡 ¿Sabías que…?</b> arriba de cada pantalla (dinero, carrera, país, gobierno, guerra, deportes): un dato real con su fuente. Toca el dato para ver otro; toca el título para plegarlo.</li>
<li><b>📖 Glosario</b> (Más): 42 términos por categoría y con buscador. En Fácil y Medio aparecen subrayados en las pantallas; en Realista se encienden en Ajustes.</li>
<li><b>⚖️ Medio:</b> cada año, «Tu año en números» con la causa de lo que pasó con tu patrimonio; en Finanzas, «🔎 Por qué» con cuánto ahorras.</li>
<li><b>🎓 Realista:</b> además, la inflación del año y lo que más pesó, tu ingreso contra los precios, impuestos con tasa efectiva, el rendimiento real de tus cuentas y el costo real de tus créditos, y por qué el banco central movió su tasa. En Finanzas, «🔎 Por qué» con los tramos de impuestos y las tasas reales.</li>
<li><b>🌱 Fácil:</b> tarjetas de primera vez también en gobierno y guerra, y <b>🎯 retos</b> cortos con su logro.</li>
<li><b>📚 Al morir:</b> las decisiones clave de tu vida, los conceptos que usaste (tócalos para ver su definición) y un consejo para la próxima.</li></ul>
Todo se apaga o se enciende en Ajustes → 🎓 Aprender.`];
 const gi=GUIA.findIndex(g=>/^🌱 Niveles/.test(g[0]));GUIA.splice(gi>=0?gi+1:0,0,T);})();
if(typeof I18!=='undefined'&&I18&&typeof I18B!=='undefined'&&typeof LANG!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  GUIA.forEach(g=>{g[1]=t(g[1]);});HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6 v20b',e);}}

(function(){const st=document.createElement('style');st.id='v20bcss';st.textContent=`
details.sbx{background:var(--card2);border:1px solid var(--line);border-inline-start:3px solid var(--teal);border-radius:10px;margin:6px 0 10px;padding:4px 10px}
details.sbx>summary{cursor:pointer;font-size:12.5px;font-weight:700;color:var(--teal);padding:3px 0;list-style-position:inside}
details.sbx .sbt{font-size:12.5px;line-height:1.42;color:var(--ink);padding:2px 0 4px;cursor:pointer}
details.sbx .sbt small{display:block;color:var(--mut);margin-top:2px}
.why p{margin:4px 0 8px;font-size:13.5px;line-height:1.45}.why p.mut{color:var(--mut);font-size:12.5px}
.why .whyh{font-weight:700;font-size:13.5px;margin:10px 0 4px;color:var(--gold)}
.why .frow.cur span{color:var(--gold)!important;font-weight:700}
#ezRet{display:flex;align-items:center;gap:6px;background:var(--card2);border:1px solid var(--line);border-inline-start:3px solid var(--gold);border-radius:10px;margin:6px 0 0;padding:2px 8px}
#ezRet .ezgo{flex:1;background:none;border:0;color:inherit;text-align:start;font:inherit;font-size:13px;padding:6px 0;cursor:pointer;line-height:1.35}
#ezRet .ezl{color:var(--gold);font-weight:700}#ezRet .rtc{font-size:12px;color:var(--mut);white-space:nowrap}
#ezRet .rtb{display:block;height:5px;border-radius:3px;background:var(--line);margin-top:4px;overflow:hidden}#ezRet .rtb b{display:block;height:100%;background:var(--act)}
.glq{width:100%;box-sizing:border-box;margin:4px 0 6px;padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font:inherit;font-size:14px}
details.lrnb{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:8px 12px;margin:8px 0 10px;text-align:start}
details.lrnb>summary{cursor:pointer;font-weight:700;font-size:14px;color:var(--gold)}
.lrnb .lrnh{font-weight:700;font-size:12.5px;color:var(--mut);margin:8px 0 4px;text-transform:uppercase;letter-spacing:.4px}
.lrnb .lrnd{margin:0;padding-inline-start:18px;font-size:13px;line-height:1.45}
.lrnb .lrnc{display:flex;flex-wrap:wrap;gap:6px}.lrnb .lrnc .chip{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:14px;padding:4px 10px;font:inherit;font-size:12.5px;cursor:pointer;text-decoration:underline dotted;text-decoration-color:var(--act);text-underline-offset:3px}
.lrnb .lrns{font-size:13px;margin-top:8px;line-height:1.5}.lrnb .lrnt{font-size:13px;margin:8px 0 2px;line-height:1.45}.lrnb .lrnt span:first-child{color:var(--gold);font-weight:700}
`;document.head.appendChild(st);})();
