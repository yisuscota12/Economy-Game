/* ===== v2.6a: ejércitos por país — divisiones, armamento y personal (vista derivada, solo lectura) =====
   No cambia la simulación: no toca PIB, guerra, balance ni el guardado. Todo sale de datos que ya existen:
   - N0[id].milx (gasto militar, SIPRI) y N0[id].milp (personal militar activo, Banco Mundial)
   - n.army (índice de fuerza 1.5–100), soldiersOf(id) (tropas en campaña si hay ejércitos en el mapa), n.mp (reserva movilizable)
   - n.gdp, n.pop (PIB por persona), n.tech.m (tecnología militar 0–10), NUKE (potencias nucleares), costa de las provincias (RG[r].co)
   Fórmulas (documentadas aquí, sin azar):
   - Efectivos activos: si el país tiene ejércitos en el mapa, soldiersOf/0.6 (fieldOf = 60 % del activo en campaña);
     si no, milp × n.army / armyIdx(milx) (la misma escala que usa fieldOf).
   - Nivel de armamento (1–5): 1 + 4 × (0.3·A + 0.3·B + 0.4·C) + 0.05 × tecnología militar + 0.5 si es potencia nuclear, con
     A = gasto por soldado en escala log (10 mil → 0, ~630 mil US$ → 1), B = PIB por persona en escala log (~800 → 0, ~80 mil US$ → 1)
     y C = gasto militar total en escala log (100 millones → 0, 100 mil millones US$ → 1): comprar armas de punta exige volumen.
   - Reparto por tipo: interpolación lineal entre el reparto de un ejército básico (nivel 1) y uno de punta (nivel 5);
     sin costa no hay flota (su parte pasa al resto). Redondeo por restos mayores: la suma de efectivos es exactamente el total.
   - Divisiones = efectivos del tipo / tamaño típico de su división (redondeo); con menos de media división quedan «unidades menores».
   - Reservistas: n.mp (reserva movilizable del motor) o, si aún no existe, la mitad de mpCap(n).
   - Presupuesto: milx × (n.army / armyIdx(milx))^2.5 (la inversa de armyIdx, igual que milxOf); sin datos, % del PIB por nivel (2–6 %) y se marca «estimado».
   Caché por país: se recalcula solo si cambia G.year, la fuerza (army), las tropas en campaña o las guerras. */
const AR26_TIPOS=[
  {k:'inf',n:'Infantería',u:'división',sz:12000,a:.60,b:.22},
  {k:'mec',n:'Mecanizada',u:'división',sz:11000,a:.06,b:.20},
  {k:'blind',n:'Blindada',u:'división',sz:9500,a:.04,b:.10},
  {k:'art',n:'Artillería',u:'división',sz:7000,a:.10,b:.09},
  {k:'avi',n:'Aviación',u:'ala aérea',sz:6000,a:.06,b:.18},
  {k:'nav',n:'Naval (flota)',u:'grupo naval',sz:8000,a:.08,b:.14},
  {k:'aa',n:'Antiaérea y misiles',u:'división',sz:5000,a:.06,b:.07}];
const AR26_NIVEL=['Básico','Limitado','Intermedio','Avanzado','De punta'];
/* equipo típico por tipo y nivel (1 → 5) */
const AR26_EQ={
  inf:['Fusil de asalto antiguo, ametralladoras y camiones','Fusil de asalto, morteros ligeros y lanzacohetes portátiles','Fusil con visor, chaleco antibalas y vehículos ligeros','Fusil modular con visión nocturna, misiles antitanque y radios cifradas','Soldado conectado: visión térmica, drones de mano y misiles «dispara y olvida»'],
  mec:['Camiones y blindados de ruedas antiguos','Transportes blindados de personal (tipo BTR o M113)','Vehículos de combate de infantería con cañón de 30 mm','Vehículos de combate modernos con misiles antitanque','Vehículos de nueva generación con protección activa y drones'],
  blind:['Tanques ligeros y de posguerra','Tanques de 2.ª generación (tipo T-55 o T-62)','Tanque principal de 3.ª generación (tipo T-72 o M60 mejorado)','Tanque principal moderno (tipo Leopard 2, T-90 o M1 Abrams)','Tanque de nueva generación con protección activa y red de combate'],
  art:['Obuses remolcados y morteros','Obuses de 122–155 mm y lanzacohetes sencillos','Artillería autopropulsada y lanzacohetes múltiples','Artillería autopropulsada con radar de contrabatería y munición guiada','Cohetes de precisión de largo alcance y drones de ataque'],
  avi:['Aviones de entrenamiento armados y helicópteros de transporte','Cazas de 3.ª generación (tipo MiG-21 o F-5) y helicópteros','Cazas de 4.ª generación (tipo MiG-29 o F-16) y helicópteros de ataque','Cazas de generación 4.5, aviones cisterna y drones armados','Cazas furtivos de 5.ª generación, alerta temprana y bombarderos'],
  nav:['Lanchas y patrulleros costeros','Patrulleros oceánicos y corbetas','Fragatas, corbetas lanzamisiles y submarinos diésel','Destructores y fragatas con misiles, submarinos modernos','Portaaviones, destructores antimisiles y submarinos nucleares'],
  aa:['Cañones antiaéreos y misiles portátiles','Misiles portátiles y baterías antiguas (tipo SA-2 o SA-3)','Sistemas de medio alcance y radares de vigilancia','Defensa en capas de largo alcance (tipo S-300 o Patriot)','Escudo antimisiles balísticos y defensa contra drones']};
/* países sin fuerzas armadas (la seguridad la llevan la policía y los guardacostas) */
const AR26_SINFA=new Set(['CRI','ISL','PAN','MUS','SLB','WSM','GRD','DMA','LCA','VCT','KIR','TUV','MHL','FSM','PLW','AND','LIE','MCO','VAT','NRU']);
const AR26_EQSINFA={inf:'Policía y unidades especiales de seguridad (armas ligeras)',nav:'Guardacostas: patrulleros y lanchas rápidas'};
const AR26C={};
function ar26Base(nid){const d=N0[nid];if(d&&d.milx)return d;try{const c=capitalOf(nid);const w=c&&G.regions[c]&&G.regions[c].w0;return w&&N0[w]?N0[w]:null;}catch(e){return null;}}
/* sin salida al mar y sin marina real, aunque el mapa marque costa por un lago (los del Caspio y Bolivia sí tienen marina) */
const AR26_INTERIOR=new Set(['TCD','ETH','KGZ','MNG','SSD','UZB','ZMB']);
function ar26Costa(nid){if(AR26_INTERIOR.has(nid))return false;try{return regionsOf(nid).some(r=>RG[r]&&RG[r].co);}catch(e){return true;}}
function ar26Calc(nid){const n=G.nations[nid];if(!n||!n.alive)return {nid,dead:true,total:0,tipos:[]};
  const d=ar26Base(nid);const sold=typeof soldiersOf==='function'?soldiersOf(nid):0;const enArmas=sold>0;
  const a0=d?Math.max(1.5,armyIdx(d.milx)):Math.max(1.5,n.army);
  const total=Math.max(0,Math.round(enArmas?sold/.6:(d?d.milp:20000/.6)*n.army/a0));
  const ps=d?d.milx/Math.max(1000,d.milp):20000;const pc=gdppc(n);
  const mx=d?d.milx:n.gdp*.02;const A=clamp((Math.log10(Math.max(1,ps))-4)/1.8,0,1),B=clamp((Math.log10(Math.max(1,pc))-2.9)/2,0,1),C=clamp((Math.log10(Math.max(1,mx))-8)/3,0,1);
  const tm=(n.tech&&n.tech.m)||0;const nuc=typeof NUKE!=='undefined'&&NUKE.has(nid);
  const sinFA=AR26_SINFA.has(nid);
  let score=clamp(1+4*(.3*A+.3*B+.4*C)+.05*tm+(nuc?.5:0),1,5);if(sinFA)score=Math.min(score,2);
  const lvl=clamp(Math.round(score),1,5);const t=(score-1)/4;const costa=ar26Costa(nid);
  let sh=AR26_TIPOS.map(T=>sinFA?(T.k==='inf'?(costa?.85:1):T.k==='nav'&&costa?.15:0):(T.k==='nav'&&!costa?0:T.a*(1-t)+T.b*t));
  const ss=sh.reduce((s,x)=>s+x,0)||1;sh=sh.map(x=>x/ss);
  // restos mayores: los efectivos por tipo suman exactamente el total
  const raw=sh.map(x=>x*total);const p=raw.map(Math.floor);let left=total-p.reduce((s,x)=>s+x,0);
  raw.map((x,i)=>[x-p[i],i]).sort((x,y)=>y[0]-x[0]||x[1]-y[1]).forEach(([,i])=>{if(left>0){p[i]++;left--;}});
  const tipos=AR26_TIPOS.map((T,i)=>{const dv=sinFA?0:Math.round(p[i]/T.sz);
    return {k:T.k,n:sinFA&&T.k==='inf'?'Seguridad pública':sinFA&&T.k==='nav'?'Guardacostas':T.n,u:T.u,ef:p[i],div:dv,menor:p[i]>0&&dv===0,share:sh[i],
      eq:sinFA?(AR26_EQSINFA[T.k]||''):AR26_EQ[T.k][lvl-1],lvl};});
  const res=Math.max(0,Math.round(n.mp!=null?n.mp:(typeof mpCap==='function'?mpCap(n)*.5:n.pop*.006)));
  let bud,est=false;if(d&&d.milx&&N0[nid]===d)bud=d.milx*Math.pow(n.army/a0,2.5);else{bud=n.gdp*(lvl+1)/100;est=true;}
  if(!isFinite(bud)||bud<0){bud=n.gdp*(lvl+1)/100;est=true;}
  const wars=(typeof warsOf==='function'?warsOf(nid):[]).map(w=>w.a===nid?w.b:w.a);
  return {nid,dead:false,total,tipos,div:tipos.reduce((s,x)=>s+x.div,0),lvl,score,nivel:AR26_NIVEL[lvl-1],sinFA,costa,nuc,
    res,resPct:n.pop>0?res/n.pop:0,actPct:n.pop>0?total/n.pop:0,bud,budPct:n.gdp>0?bud/n.gdp:0,est,enArmas,wars,guerra:wars.length>0};}
/* lectura con caché: recalcula solo si cambia el año, la fuerza, las tropas en campaña o las guerras */
function ar26Of(nid){if(!G||!G.nations)return null;const n=G.nations[nid];if(!n)return null;
  const sold=typeof soldiersOf==='function'?Math.round(soldiersOf(nid)):0;const nw=typeof warsOf==='function'?warsOf(nid).length:0;
  const key=G.year+'|'+(n.alive?1:0)+'|'+Math.round((n.army||0)*100)+'|'+sold+'|'+nw+'|'+Math.floor(((n.tech&&n.tech.m)||0)*2);
  const c=AR26C[nid];if(c&&c.key===key)return c.v;const v=ar26Calc(nid);AR26C[nid]={key,v};return v;}
