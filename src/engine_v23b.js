/* ===================== v2.3b: fase 5 de la ruta 9d (naturaleza y recursos), parte 2 — motor =====================
   1) Flora y fauna: cada bioma tiene 5–6 especies (más peces de río donde hay un río grande), con nombre según la región del
      mundo (jaguar en América, leopardo en África, tigre en Asia…). No mueven la economía: su estado sale de la salud del
      ecosistema de la provincia (ntProv(r).eco). Cada especie tiene un umbral (base del bioma − 8/16/26 según qué tan sensible
      es); por debajo queda «En riesgo» y 12 puntos más abajo «En peligro», con la causa que más le resta al ecosistema entre
      sus amenazas.
   2) Proyectos de agua y alimentos (NT_PJ): desalinizadora, riego, invernaderos y presa. Mismo patrón que los edificios de
      provincia de la v0.4 (BLD: costo = PIB de la provincia × c × (1 + 0.6 × nivel), niveles con tope, requisito de costa) pero
      con tiempo de construcción y guardados aparte en G.np[provincia][clave] = {l: niveles hechos, q: mes en que termina el
      que se construye (0 = nada), b: quién lo pagó}. No se agregan a BLD: aiBuild elige con pick(Object.keys(BLD)) y cambiaría
      lo que construye la IA. Los paga el jugador (tesoro si gobierna; si no, de su dinero como inversión privada que rinde un
      poco cada año) o los gobiernos de la IA (con h21, sin tocar Math.random, solo si su agua o sus alimentos están bajo 45).
      Efecto medido en ntProv (envoltorio): agua renovable, tierra cultivable, alimentos y salud del ecosistema de la provincia;
      de ahí sale solo, como en la v2.3a, a la autosuficiencia y al agua por persona del país. */

/* ---------- región del mundo de una provincia (para el nombre de cada especie) ---------- */
const NT_OC=['AUS','NZL','PNG','FJI','SLB','VUT','NCL','WSM','TON'];
function ntZone(rid){const n=RG[rid]?RG[rid].n:'';if(NT_OC.includes(n))return 'oc';const g=(N0[n]&&N0[n].reg)||'';const lat=TRN(rid)[3]||0;
  if(/Latin|North America/.test(g))return lat<-5?'ams':'am';if(/Sub-Saharan/.test(g))return 'af';if(/Middle East/.test(g))return 'me';
  if(/Europe/.test(g))return 'eu';if(/Asia|Pacific/.test(g))return 'as';return '';}
/* ---------- flora y fauna: [ícono, nombre, a=animal|p=planta, sensibilidad 1 alta·2 media·3 baja, amenazas, variantes por región] ----------
   Variante: 'Nombre' o ['Nombre','ícono']. Regiones: am, ams (Sudamérica), af, me (Medio Oriente y norte de África), eu, as, oc. */
const NT_SP={
 selva:[['🐆','Jaguar','a',1,['agro','dens','guerra','ocup'],{af:'Leopardo',me:'Leopardo',as:'Tigre',oc:['Casuario','🦜']}],
  ['🦜','Guacamaya','a',1,['agro','dens'],{af:'Loro gris',me:'Loro gris',as:'Cálao',oc:'Ave del paraíso'}],
  ['🐒','Mono aullador','a',2,['agro','dens','guerra','ocup'],{af:'Chimpancé',me:'Chimpancé',as:'Orangután',oc:['Canguro arborícola','🦘']}],
  ['🐸','Rana venenosa','a',1,['agro','ind','sequia'],{af:'Rana arborícola',me:'Rana arborícola',as:'Rana voladora',oc:'Rana arborícola'}],
  ['🌳','Ceiba','p',2,['agro','dens'],{af:'Caoba africana',me:'Caoba africana',as:'Dipterocarpo',oc:'Dipterocarpo'}],
  ['🌺','Orquídeas','p',1,['agro','sequia','ind']]],
 sabana:[['🐘','Elefante','a',1,['agro','dens','guerra','ocup','sequia'],{am:['Oso hormiguero','🐻'],ams:['Oso hormiguero','🐻'],as:'Elefante asiático',oc:['Canguro rojo','🦘']}],
  ['🦒','Jirafa','a',2,['agro','dens','guerra'],{am:['Venado de cola blanca','🦌'],ams:['Venado de las pampas','🦌'],as:['Ciervo axis','🦌'],oc:['Dingo','🐺']}],
  ['🦁','León','a',1,['agro','dens','guerra','ocup'],{am:['Puma','🐆'],ams:['Puma','🐆'],as:'León asiático',oc:['Águila audaz','🦅']}],
  ['🌳','Acacia','p',3,['agro','sequia'],{am:'Algarrobo',ams:'Algarrobo',oc:'Eucalipto'}],
  ['🌾','Pastos altos','p',3,['agro','sequia','dens']]],
 desierto:[['🐪','Dromedario','a',3,['sequia','guerra'],{am:['Coyote','🐺'],ams:['Guanaco','🐐'],as:'Camello bactriano',oc:['Canguro rojo','🦘']}],
  ['🦊','Zorro del desierto','a',2,['dens','sequia']],
  ['🦎','Lagarto','a',3,['dens','ind'],{am:'Monstruo de Gila',oc:'Diablo espinoso',af:'Lagarto de cola espinosa',me:'Lagarto de cola espinosa'}],
  ['🦂','Escorpión','a',3,['dens']],
  ['🌵','Cactus y suculentas','p',2,['dens','agro'],{af:['Palmera datilera','🌴'],me:['Palmera datilera','🌴'],as:['Saxaúl','🌿'],eu:['Saxaúl','🌿'],oc:['Spinifex','🌾']}]],
 estepa:[['🐎','Caballo salvaje','a',2,['agro','dens','guerra'],{am:['Berrendo','🦌'],ams:['Guanaco','🐐'],af:['Gacela','🦌'],me:['Gacela','🦌'],oc:['Canguro gris','🦘']}],
  ['🦅','Águila esteparia','a',2,['ind','dens','agro'],{am:'Águila real',ams:'Cóndor',oc:'Águila audaz'}],
  ['🐿️','Marmota','a',3,['agro','dens'],{am:'Perro de las praderas',ams:'Vizcacha',af:'Jerbo',me:'Jerbo',oc:'Wombat'}],
  ['🌾','Pasto pluma','p',3,['agro','sequia']],
  ['🌿','Artemisa','p',3,['agro','dens'],{oc:'Arbusto salado'}]],
 subtrop:[['🎋','Bambú','p',2,['agro','dens'],{af:['Olivo silvestre','🌳'],me:['Olivo silvestre','🌳'],eu:['Olivo','🌳'],oc:['Eucalipto','🌳']}],
  ['🌳','Encino perenne','p',2,['agro','dens'],{as:'Alcanforero',eu:'Alcornoque',oc:'Eucalipto',ams:'Araucaria'}],
  ['🐢','Tortuga','a',1,['dens','ind','agro'],{}],
  ['🦋','Mariposas','a',1,['agro','ind'],{am:'Mariposa monarca'}],
  ['🐍','Serpientes','a',3,['dens','agro']]],
 pradera:[['🦬','Bisonte','a',1,['agro','dens'],{eu:'Bisonte europeo',af:'Ñu',me:['Gacela','🦌'],as:['Caballo de Przewalski','🐎'],ams:['Venado de las pampas','🦌'],oc:['Canguro gris','🦘']}],
  ['🐇','Liebre','a',3,['agro','dens'],{ams:'Mara patagónica'}],
  ['🐝','Abejas silvestres','a',2,['agro','ind']],
  ['🌻','Girasol silvestre','p',3,['agro','dens'],{eu:['Amapola','🌺'],as:['Amapola','🌺']}],
  ['🌾','Pastos altos','p',2,['agro','dens']]],
 templado:[['🦌','Ciervo','a',3,['dens','agro','guerra']],
  ['🐻','Oso pardo','a',1,['dens','agro','ind','guerra'],{am:'Oso negro',as:'Oso negro asiático',ams:['Huemul','🦌'],oc:['Koala','🐻']}],
  ['🦉','Búho','a',2,['dens','ind','agro']],
  ['🦊','Zorro rojo','a',3,['dens']],
  ['🌳','Roble','p',2,['agro','dens'],{ams:'Roble pellín',oc:'Eucalipto'}],
  ['🍄','Hongos del bosque','p',2,['ind','agro','sequia']]],
 taiga:[['🌲','Abeto y pino','p',2,['ind','dens','guerra']],
  ['🐺','Lobo gris','a',1,['dens','guerra','ocup']],
  ['🦌','Alce','a',2,['dens','ind']],
  ['🐆','Lince','a',1,['dens','ind','guerra']],
  ['🐻','Oso pardo','a',2,['dens','ind'],{am:'Oso negro'}]],
 tundra:[['🦌','Reno','a',2,['ind','dens'],{am:'Caribú'}],
  ['🦊','Zorro ártico','a',2,['ind','dens']],
  ['🦉','Búho nival','a',1,['ind','dens']],
  ['🌿','Musgos y líquenes','p',1,['ind','dens']],
  ['🐟','Trucha ártica','a',2,['ind','presa']]],
 montana:[['🦅','Águila real','a',2,['dens','ind'],{ams:'Cóndor andino',as:'Quebrantahuesos',af:'Quebrantahuesos'}],
  ['🐐','Cabra montés','a',2,['dens','guerra'],{am:'Borrego cimarrón',ams:'Vicuña',as:'Íbice',me:'Íbice',oc:['Ualabí de roca','🦘']}],
  ['🐆','Puma','a',1,['dens','agro','guerra'],{as:'Leopardo de las nieves',eu:'Lince',af:'Leopardo',me:'Leopardo',oc:['Equidna','🐿️']}],
  ['🌲','Pino de montaña','p',3,['dens','ind']],
  ['🌼','Flores alpinas','p',2,['dens','agro'],{eu:'Edelweiss'}]]};
const NT_SPR=['🐟','Peces de río','a',2,['presa','riego','ind','agro'],{am:'Bagre',ams:'Dorado',eu:'Trucha',as:'Carpa',af:'Tilapia',me:'Tilapia',oc:'Bacalao de Murray'}];
const NT_SPD=[0,10,20,32];   // cuánto puede bajar el ecosistema bajo la base del bioma antes de que la especie esté en riesgo
const NT_SPS=['Estable','En riesgo','En peligro'];
const NT_SPC={dens:'Ciudades y población ocupan su hábitat',ind:'Contaminación de la industria',agro:'Su hábitat se convirtió en cultivos',
  ocup:'Ocupación militar: caza y hábitat destruido',guerra:'Guerra: caza furtiva y hábitat destruido',sequia:'Sequía: falta agua y alimento',
  presa:'Una presa corta el río',riego:'Agua desviada para riego',desal:'Salmuera de la desalinización',reg:'Poca protección ambiental'};
function ntSpecies(rid){const o=ntProv(rid);if(!o)return null;const z=ntZone(rid);const E=o.eco;const base=E.base;
  const L=(NT_SP[o.k]||[]).slice();if(o.b.riv&&o.k!=='tundra')L.push(NT_SPR);
  const neg=E.L.filter(e=>e[1]<0).sort((a,b)=>a[1]-b[1]);
  return L.map(s=>{let v=s[5]&&(s[5][z]||(z==='ams'&&s[5].am)||(z==='me'&&s[5].af));let e=s[0],n=s[1];if(v){if(Array.isArray(v)){n=v[0];e=v[1];}else n=v;}
    const th=base-NT_SPD[s[3]];const m=E.v-th;const st=m>=0?0:m>=-12?1:2;let c='';
    if(st){const t=s[4];const hit=neg.find(x=>t.includes(x[0])||(x[0]==='ocup'&&t.includes('guerra')))||neg[0];c=hit?(NT_SPC[hit[0]]||''):'';}
    return {e,n,t:s[2],s:s[3],st,c,m:Math.round(m)};});}
// resumen del país: cuántas provincias tienen cada especie en riesgo y la causa más común
function ntSpeciesN(nid){const A={};let tot=0,risk=0;regionsOf(nid).forEach(r=>{const L=ntSpecies(r);if(!L)return;L.forEach(s=>{tot++;if(!s.st)return;risk++;
  const a=A[s.n]||(A[s.n]={e:s.e,n:s.n,k:0,p:0,c:{}});a.k++;if(s.st===2)a.p++;a.c[s.c]=(a.c[s.c]||0)+1;});});
  const L=Object.values(A).map(a=>{a.cc=Object.entries(a.c).sort((x,y)=>y[1]-x[1])[0][0];return a;}).sort((a,b)=>b.p-a.p||b.k-a.k);return {L,tot,risk};}

/* ---------- proyectos de agua y alimentos ---------- */
const NT_PJ={
 desal:{n:'Planta desalinizadora',ic:'🌊',c:.012,max:3,m:30,ty:'agua',d:'+35 m³ de agua por persona al año por nivel, sacada del mar: no depende de la lluvia ni de la sequía.',req:'co',r:.05},
 riego:{n:'Sistema de riego',ic:'🚿',c:.010,max:2,m:18,ty:'alim',d:'+12 % de tierra cultivable y entre 10 % y 20 % más cosechas por nivel (más donde llueve poco). Usa 4 % del agua.',req:'ar',r:.04},
 inver:{n:'Invernaderos',ic:'🌱',c:.006,max:3,m:12,ty:'alim',d:'Alimentos para 3 % más de la población por nivel, aun en años de sequía.',r:.07},
 presa:{n:'Presa y embalse',ic:'🏞️',c:.02,max:1,m:36,ty:'agua',d:'+8 % de agua, la sequía le quita la mitad de agua y +4 % de tierra cultivable con riego. Corta el río: baja la salud del ecosistema.',req:'riv',gov:1}};
const NT_PJK=Object.keys(NT_PJ);
const ntPjOf=(rid,k)=>(G.np&&G.np[rid]&&G.np[rid][k])||null;
const ntPjLv=(rid,k)=>{const e=ntPjOf(rid,k);return e?e.l:0;};
function ntPjCost(rid,k){const x=G.regions[rid];return x?x.gdp*NT_PJ[k].c*(1+ntPjLv(rid,k)*.6):0;}
// ¿se puede construir? (sin contar el dinero)
function ntPjCan(rid,k){const J=NT_PJ[k],x=G.regions[rid];if(!x)return {ok:false,why:'Provincia desconocida.'};const e=ntPjOf(rid,k);const b=ntBase(rid);
  if(e&&e.q)return {ok:false,why:'Ya está en construcción.'};if((e?e.l:0)>=J.max)return {ok:false,why:'Ya está al máximo.'};
  if(J.req==='co'&&!RG[rid].co)return {ok:false,why:'Solo en provincias con costa.'};
  if(J.req==='ar'&&b.ar<1)return {ok:false,why:'No hay tierra que se pueda cultivar.'};
  if(J.req==='riv'&&!b.riv&&TRN(rid)[0]<1)return {ok:false,why:'Necesita un río grande o un valle entre cerros.'};
  if(G.occ&&G.occ[rid])return {ok:false,why:'La provincia está ocupada.'};
  return {ok:true};}
function ntPjStart(rid,k,by,usd){G.np=G.np||{};const R=G.np[rid]||(G.np[rid]={});const e=R[k]||(R[k]={l:0,q:0});e.q=ntMonthKey()+NT_PJ[k].m;e.b=by;if(usd)e.u=Math.round((e.u||0)+usd);return e;}
const ntPjLeft=(rid,k)=>{const e=ntPjOf(rid,k);return e&&e.q?Math.max(0,e.q-ntMonthKey()):0;};
// termina los proyectos cuyo plazo ya se cumplió (cada mes y al cerrar el año; en avance rápido el mes avanza 12 por año)
function ntPjTick(){if(!G.np)return 0;const now=ntMonthKey();const me=P&&P.alive?natOf(P).id:null;let c=0;
  for(const r in G.np){const R=G.np[r];for(const k in R){const e=R[k];if(!e.q||e.q>now)continue;e.q=0;e.l++;c++;
    const x=G.regions[r];if(me&&x&&x.o===me&&RG[r])pushNews(`🏗️ Termina ${NT_PJ[k].n.toLowerCase()} en ${RG[r].nm}${NT_PJ[k].max>1?' (nivel '+e.l+')':''}: ${NT_PJ[k].ty==='agua'?'más agua dulce':'más alimentos'} para la provincia.`,'good');}}
  if(c)NTC.g=null;return c;}
/* efecto de los proyectos terminados en una provincia (se aplica a ntProv: agua, tierra, alimentos y ecosistema) */
function ntPjFx(rid,o){const R=G.np&&G.np[rid];if(!R)return null;const L=k=>(R[k]&&R[k].l)||0;const ds=L('desal'),ri=L('riego'),iv=L('inver'),pr=L('presa');
  if(!(ds||ri||iv||pr))return null;const b=o.b,W0=b.Wr+b.Wv;
  let dW=0,dF=0,dA=0;const eco=[];
  if(ds){dW+=ds*Math.max(.002,o.pop*35e-9);eco.push(['desal',-1.5*ds]);}
  if(pr){dW+=W0*(1-.35*o.sq)*.08+W0*.175*o.sq;dA+=b.ar*.04;dF+=o.fed*.04;eco.push(['presa',-6]);}
  if(ri){dW-=.04*ri*o.W;dA+=b.ar*.12*ri;dF+=o.fed*(.10+.10*clamp((1-b.wf)/.55,0,1))*ri;eco.push(['riego',-2*ri]);}
  if(iv)dF+=o.pop*.03*iv;
  return {dW,dF,dA,eco};}
{const _p=ntProv;ntProv=function(rid,Y){const o=_p(rid,Y);if(!o||o._pj)return o;o._pj=1;try{const f=ntPjFx(rid,o);if(f){
  o.W=Math.max(0,o.W+f.dW);o.wpc=o.W*1e9/o.pop;o.fed+=f.dF;o.ss=o.fed/o.pop;o.pjW=f.dW;o.pjF=f.dF;o.pjA=f.dA;
  if(f.eco.length){let d=0;f.eco.forEach(e=>{o.eco.L.push(e);d+=e[1];});o.eco.v=Math.round(clamp(o.eco.v+d,3,97));}}}catch(e){}return o;};}
{const _n=ntNat;ntNat=function(nid){const N=_n(nid);if(!N||N._pj)return N;N._pj=1;let w=0,f=0,a=0,k=0;
  regionsOf(nid).forEach(r=>{const o=ntProv(r);if(o&&(o.pjW||o.pjF||o.pjA)){w+=o.pjW||0;f+=o.pjF||0;a+=o.pjA||0;k++;}});
  N.pjW=w;N.pjF=f;N.pjA=a;N.pjN=k;N.ar+=a;return N;};}
// causa visible en el medidor de agua: lo que aportan (o gastan) los proyectos
{const _w=ntWater;ntWater=function(rid){const M=_w(rid);try{const o=ntProv(rid);if(M&&o&&o.pjW){const d=.4*(ntWSr(o.W*1e9/o.p0)-ntWSr(Math.max(1e-6,o.W-o.pjW)*1e9/o.p0));
  if(Math.abs(d)>=.5){M.L.push(['proy',d]);M.v=Math.round(clamp(M.v+d,2,98));}}}catch(e){}return M;};}
{const _w=ntWaterN;ntWaterN=function(nid){const M=_w(nid);try{const N=ntNat(nid);if(M&&N&&N.pjW){const d=ntWSr(N.W*1e9/N.p0)-ntWSr(Math.max(1e-6,N.W-N.pjW)*1e9/N.p0);
  if(Math.abs(d)>=.5){M.L.push(['proy',d]);M.v=Math.round(clamp(M.v+d,2,98));}}}catch(e){}return M;};}
/* ---------- quién construye ---------- */
// el jugador: si gobierna, con el tesoro nacional (US$); si no, con su dinero como inversión privada (la presa solo la hace el gobierno)
function ntPjPay(rid,k){const x=G.regions[rid];const n=G.nations[x.o];const me=natOf(P);if(x.o!==me.id)return {ok:false,why:'Solo en provincias de tu país.'};
  const usd=ntPjCost(rid,k);if(playerRules(me.id))return {by:'g',usd,ok:(n.treas||0)>=usd,why:'No alcanza el tesoro nacional.'};
  if(NT_PJ[k].gov)return {ok:false,why:'Solo el gobierno puede construir una presa.'};const loc=toInt(usd,'USD');return {by:'p',usd,loc,ok:P.dinero>=loc,why:'No te alcanza el dinero.'};}
function ntPjBuild(rid,k){const c=ntPjCan(rid,k);if(!c.ok)return c.why;const p=ntPjPay(rid,k);if(!p.ok)return p.why;const J=NT_PJ[k];
  if(p.by==='g'){const n=natOf(P);n.treas-=p.usd;P.built=(P.built||0)+1;}else{P.dinero-=p.loc;P.npj=P.npj||[];P.npj.push({r:rid,k,u:Math.round(p.usd),y:G.year});P.s.influencia=clamp((P.s.influencia||0)+1,0,100);}
  ntPjStart(rid,k,p.by,p.usd);return `Empieza la obra: ${J.n.toLowerCase()} en ${RG[rid].nm}. Tarda ${J.m} meses${p.by==='p'?'; es tu inversión privada y te dejará cerca del '+Math.round(J.r*100)+' % al año cuando funcione':''}.`;}
// gobiernos de la IA: con h21 (sin Math.random), 22 % de probabilidad por año si su agua o sus alimentos están bajo 45; un proyecto a la vez
function ntPjAI(){const Y=G.year;for(const id in G.nations){const n=G.nations[id];if(!n.alive||playerRules(id))continue;if(h21(id+'|'+Y+'|pj')>=.22)continue;
  const rs=regionsOf(id);if(!rs.length)continue;let w,f;try{w=ntWaterN(id).v;f=ntFoodN(id).v;}catch(e){continue;}if(w>=45&&f>=45)continue;
  if(rs.some(r=>{const R=G.np&&G.np[r];return R&&NT_PJK.some(k=>R[k]&&R[k].q);}))continue;
  const byPop=rs.slice().sort((a,b)=>G.regions[b].pop-G.regions[a].pop);let pick0=null;
  const tryK=(L,k)=>{for(const r of L)if(ntPjCan(r,k).ok)return [r,k];return null;};
  if(w<f)pick0=tryK(byPop.slice(0,8),'desal')||tryK(byPop.slice(0,8),'presa')||tryK(byPop.slice(0,4),'inver');
  else{const byAr=rs.slice().sort((a,b)=>ntBase(b).ar-ntBase(a).ar).slice(0,6);pick0=(devFromPc(n.gdp/Math.max(1,n.pop))>=5.5?tryK(byPop.slice(0,6),'inver'):null)||tryK(byAr,'riego')||tryK(byPop.slice(0,6),'inver');}
  if(pick0)ntPjStart(pick0[0],pick0[1],'ia',0);}}
// lo que rinden las inversiones privadas del jugador (agua y cosechas que se venden), al cerrar el año
function ntPjIncome(){if(!P||!P.alive||!P.npj||!P.npj.length)return;let usd=0;
  P.npj.forEach(q=>{const e=ntPjOf(q.r,q.k);if(!e||!e.l)return;usd+=q.u*NT_PJ[q.k].r;});
  if(usd>0){const loc=toInt(usd,'USD');P.dinero+=loc;try{log(`🏗️ Tus proyectos de agua y alimentos te dejan ${fmt(loc)} este año.`,'good');}catch(e){}}}
{const _py=provYear;provYear=function(){_py();try{ntPjTick();ntPjAI();ntPjIncome();}catch(e){}};}
{const _me=mkMonthEnd;mkMonthEnd=function(...a){const r=_me(...a);try{ntPjTick();}catch(e){}return r;};}
