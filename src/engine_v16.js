/* ===== v1.6: carreras de fama (música, actuación, fútbol, box, MMA, creador, modelo, comedia, escritura, cocina, DJ): fans por territorio, equipo, contratos, escándalos con causa, premios, torneos y entrenamiento ===== */
/* catálogo: atributo clave, US$ por fan al año (ventas, regalías, reproducciones y publicidad que deja cada seguidor), alcance digital (qué tan rápido cruzas fronteras), premio, obras y presentaciones */
const FC={
 musica:{n:'Música',ic:'🎤',at:'apariencia',usd:1.2,web:.06,aw:'Premio Gramófono de Oro',obra:['Grabar un sencillo','Grabar un álbum'],show:'Concierto',sp:0},
 actuacion:{n:'Actuación',ic:'🎬',at:'apariencia',usd:1.5,web:.04,aw:'Estatuilla Dorada',obra:['Audicionar para una serie','Audicionar para una película'],show:'Obra de teatro',sp:0},
 futbol:{n:'Fútbol',ic:'⚽',at:'salud',usd:.6,web:.05,aw:'Balón Dorado',obra:[],show:'',sp:1},
 box:{n:'Box',ic:'🥊',at:'salud',usd:.8,web:.05,aw:'Cinturón mundial',obra:[],show:'',sp:2},
 mma:{n:'Artes marciales mixtas',ic:'🤼',at:'salud',usd:.8,web:.06,aw:'Cinturón mundial',obra:[],show:'',sp:2},
 creador:{n:'Creador de contenido',ic:'📱',at:'inteligencia',usd:.5,web:.25,aw:'Premio Creador del Año',obra:['Publicar un video','Hacer un video de gran producción'],show:'Encuentro con fans',sp:0},
 modelo:{n:'Modelaje',ic:'📸',at:'apariencia',usd:1,web:.1,aw:'Portada del Año',obra:['Sesión de fotos editorial','Casting de pasarela'],show:'Desfile',sp:0},
 comedia:{n:'Comedia',ic:'😂',at:'inteligencia',usd:1,web:.05,aw:'Premio Carcajada',obra:['Escribir una rutina nueva','Grabar un especial de comedia'],show:'Show de comedia',sp:0},
 escritor:{n:'Escritura',ic:'✍️',at:'inteligencia',usd:2,web:.04,aw:'Premio Pluma de Oro',obra:['Escribir columnas y cuentos','Escribir un libro'],show:'Presentación de libro',sp:0},
 chef:{n:'Cocina',ic:'👨‍🍳',at:'inteligencia',usd:.9,web:.05,aw:'Estrellas de la Guía Gourmet',obra:['Crear platillos nuevos','Grabar un programa de cocina'],show:'Cena de autor',sp:0},
 dj:{n:'DJ y producción',ic:'🎧',at:'inteligencia',usd:1,web:.15,aw:'Top 100 DJs del mundo',obra:['Producir un track','Producir un EP'],show:'Set en club',sp:0}};
// equipo: entrenador (calidad-precio: costo anual en salarios medios, eficacia) y agente (comisión, alcance)
const COACH=[['Gratis (centro comunitario)',0,.6],['Regular',.3,1],['Profesional',1.5,1.7],['Élite',6,2.4]],AGENT=[['Sin agente',0,1],['Agente local',.10,1.15],['Agencia nacional',.15,1.4],['Agencia internacional',.20,1.8]];
const FTIT=['Desconocido','Promesa','Figura local','Figura nacional','Estrella','Estrella internacional','Leyenda'];
const FUT_TEAMS=['Club amateur','Equipo de segunda división','Equipo de primera división','Club grande de la liga','Club gigante de Europa'];
const FUT_SAL=[3e3,2.5e4,1.5e5,1.2e6,8e6],FUT_FANS=[2e3,4e4,6e5,6e6,6e7];
function fcFans(f){return f.fans.loc+f.fans.nac+f.fans.int;}
function fcFama(f){const t=fcFans(f);return clamp(Math.round(Math.log10(Math.max(1,t))*14-28),0,100);}
function fcTier(f){const s=fcFama(f);return s<15?0:s<30?1:s<45?2:s<60?3:s<72?4:s<85?5:6;}
function fcStart(p,k){const C=FC[k];const old=FL(p,'fama')||0;const seed=old>0?Math.pow(10,(old+28)/14):RI(20,150);
  p.fc={k,sk:clamp(8+p.s[C.at]*.2+R(0,8),5,40),tal:+R(.7,1.35).toFixed(2),fans:{loc:seed*.8,nac:seed*.18,int:seed*.02},img:65,coach:0,ag:0,ct:null,works:[],aw:[],sc:0,rec:[0,0,0],rk:C.sp===2?RI(70,95):null,lvl:0,inj:0,earn:0,earnY:0,y0:G.year,act:0,off:[],lastF:null};
  return `Empiezas tu carrera en ${C.n.toLowerCase()}. ${C.sp?'Entrena duro: el nivel se construye con años de práctica.':'Nadie te conoce todavía: crea, preséntate y construye tu público.'} Abre Carrera → ⭐ Tu carrera para manejarla.`;}
/* fans: primero en tu provincia, luego en tu país y luego en el mundo; cada nivel tiene un techo (su población).
   crecimiento = descubrimiento (calidad) + boca a boca (proporcional a los fans que ya tienes) */
function fcCaps(p){const n=natOf(p);const capL=Math.max(2e4,G.regions[p.r].pop*.25);return [capL,Math.max(capL*1.5,n.pop*.4),3e9];}
function fcSplit(p,add){const f=p.fc,C=FC[f.k];const [capL,capN,capI]=fcCaps(p);const sL=clamp(f.fans.loc/capL,0,1),sN=clamp(f.fans.nac/capN,0,1),sI=clamp(f.fans.int/capI,0,1);
  const toI=clamp(C.web+sN*1.2,0,.85)*clamp(sL*2,C.web*4,1),toN=(1-toI)*clamp(sL*1.4+C.web,.05,.95),toL=1-toI-toN;
  const dl=add*toL*(1-sL),dn=add*toN*(1-sN),di=add*toI*(1-sI);f.fans.loc+=dl;f.fans.nac+=dn;f.fans.int+=di;return dl+dn+di;}
// q = calidad de lo que hiciste; w = cuánto se comenta (boca a boca): obra 1, obra grande 2, éxito ×2.5, show .3, redes .15
function fcAddFans(p,q,w){const f=p.fc;const tot=fcFans(f);w=w==null?1:w;const wom=tot*Math.max(0,q-35)/1200*w*(1-fcFama(f)/125);
  return fcSplit(p,(q*3*Math.min(1,w+.3)+wom)*(f.ct?f.ct.boost:1)*Math.sqrt(AGENT[f.ag][2]));}
function fcBump(p,fr){const f=p.fc;return fcSplit(p,Math.max(300,fcFans(f)*fr));} // premios y campeonatos: un salto proporcional a tu público
function fcQual(p){const f=p.fc;return f.sk*(.5+Math.random())*(1+COACH[f.coach][2]*.05);}
function fcNet(p,usd){const f=p.fc;return toInt(usd*(1-AGENT[f.ag][1]),'USD');}
function fcCanAct(p){const f=p.fc;if(p.prison)return 'Estás en prisión.';if(f.inj)return `Estás lesionado: faltan ${f.inj} mes(es).`;return '';}
function fcScandal(p,cause){const f=p.fc;const pr=svcV(p,'publicista');const hit=(.12+Math.random()*.22)*(1-pr*.12);for(const k in f.fans)f.fans[k]*=1-hit;f.img=clamp(f.img-18*(1-pr*.12),0,100);f.sc++;
  let x='';if(f.ct&&chance(.3)){x=` ${f.ct.who} rescinde tu contrato.`;f.ct=null;}if(fcFama(f)>=30)mkNews(`Escándalo: ${fullName(p)} protagoniza ${cause}.`,fcFama(f)>=55);
  return (`💥 Escándalo por ${cause}: pierdes ${Math.round(hit*100)} % de tus fans y tu imagen baja a ${Math.round(f.img)}.`+(pr?' Tu equipo de relaciones públicas contiene parte del daño.':' Un publicista habría reducido el golpe.')+x);}
/* ----- acciones ----- */
function fcTrain(p){const f=p.fc;if(f.trY!==G.year){f.trY=G.year;f.trN=0;}const g=.6*COACH[f.coach][2]*f.tal*(1+p.s[FC[f.k].at]/100)*(f.sk<40?1.5:f.sk<70?1:f.sk<85?.55:.3)/(1+.15*f.trN++);f.sk=clamp(f.sk+g,0,100);if(FC[f.k].sp)p.s.salud=clamp(p.s.salud+1,0,100);
  if(FC[f.k].sp&&chance(.025*(COACH[f.coach][2]<1?1.6:1))){f.inj=RI(1,4);return `Te lesionas entrenando: ${f.inj} mes(es) fuera. (Un entrenador mejor reduce las lesiones.)`;}return `Entrenas (${COACH[f.coach][0].toLowerCase()}): tu nivel sube a ${f.sk.toFixed(1)}.`;}
const BIGC=[3e3,1.5e4,6e4,2.5e5];
function fcWork(p,i){const f=p.fc,C=FC[f.k];const big=i===1;const cost=big?toInt(BIGC[Math.min(3,fcTier(f)>>1)],'USD'):0;if(big&&p.dinero<cost)return `Necesitas ${fmt(cost)} para producirlo.`;if(big)p.dinero-=cost;
  const q=fcQual(p)*(big?1.4:1);
  if(f.k==='actuacion'||(f.k==='modelo'&&big)){const pc=clamp(.2+f.sk/160+fcFama(f)/220+(AGENT[f.ag][2]-1)*.25-(big?.12:0),.04,.9);if(!chance(pc))return (f.k==='modelo'?`No te quedas con el casting (probabilidad ${Math.round(pc*100)} %). Mejora tu nivel o consigue un agente: abren puertas.`:`No te quedas con el papel (probabilidad ${Math.round(pc*100)} %). Mejora tu nivel o consigue un agente: abren puertas.`);
    const pay=(big?2.5e4:5e3)*Math.pow(1+fcFama(f)/14,2.2);p.dinero+=fcNet(p,pay);f.earn+=pay;}
  if(q<12&&chance(.12))return fcScandal(p,'acusaciones de plagio en tu trabajo más reciente');
  const hit=q>(big?90:80);const add=fcAddFans(p,q,(big?2:1)*(hit?2.5:1));f.works.push({y:G.year,t:C.obra[i],q:Math.round(q),hit});if(f.works.length>40)f.works.shift();f.act=Math.min(4,f.act+1);
  if(chance(.015+(100-f.img)/1800))return fcScandal(p,'una declaración polémica durante la promoción');
  return (hit?`${C.obra[i]}: ¡éxito rotundo! calidad ${Math.round(q)}`:`${C.obra[i]}: calidad ${Math.round(q)}`)+(big?` · +${fmtK(add)} fans. Producción: ${fmt(cost)}.`:` · +${fmtK(add)} fans.`);}
const VEN=[['bar o foro local',30,300,8,'en tu provincia'],['arena nacional',4e3,15e3,35,'en tu país'],['gira internacional',8e4,4e5,80,'fuera de tu país']];
function fcShow(p,v){const f=p.fc,C=FC[f.k];const [nm,minF,cap,price,where]=VEN[v];const base=v===0?f.fans.loc:v===1?f.fans.nac+f.fans.loc*.3:f.fans.int;if(base<minF)return ([`Necesitas al menos ${fmtK(minF)} fans en tu provincia para llenar un bar o foro local.`,`Necesitas al menos ${fmtK(minF)} fans en tu país para llenar una arena nacional.`,`Necesitas al menos ${fmtK(minF)} fans fuera de tu país para llenar una gira internacional.`][v]);
  if(p.s.salud<30&&chance(.4)){p.s.salud=clamp(p.s.salud+5,0,100);return fcScandal(p,'cancelar de último minuto por agotamiento');}
  const q=fcQual(p);const att=Math.min(cap,base*(.02+q/3000))*R(.6,1.05);const gross=att*price;const net=gross*(v===0?.5:v===1?.4:.35);p.dinero+=fcNet(p,net);f.earn+=net;
  const add=fcAddFans(p,q,.3+v*.15);p.s.salud=clamp(p.s.salud-v*2,0,100);f.act=Math.min(4,f.act+1);
  return `${C.show} (${nm}): ${fmtK(att)} asistentes, utilidad ${fmt(toInt(net,'USD'))} después de producción y comisiones · +${fmtK(add)} fans.`;}
function fcSocial(p,risky){const f=p.fc;const q=fcQual(p)*(risky?1.2:.8);if(risky&&chance(.14+(100-f.img)/500))return fcScandal(p,'una pelea en redes sociales que se salió de control');const add=fcAddFans(p,q,risky?.4:.15);f.img=clamp(f.img+(risky?-2:1),0,100);
  return (risky?`Publicas en redes algo provocador: +${fmtK(add)} seguidores (tu imagen baja un poco).`:`Publicas en redes: +${fmtK(add)} seguidores y tu imagen mejora.`);}
function fcCharity(p){const f=p.fc;const c=Math.max(U(p)*.3,p.dinero*.02);if(p.dinero<c)return `Necesitas ${fmt(c)}.`;p.dinero-=c;f.img=clamp(f.img+8,0,100);fcAddFans(p,30,.1);return `Donas ${fmt(c)} a una causa social: tu imagen sube a ${Math.round(f.img)}.`;}
function fcSponsor(p){const f=p.fc;if(f.spY===G.year)return 'Ya firmaste el patrocinio de este año.';if(fcFama(f)<35)return 'Las marcas buscan figuras con fama de 35 o más.';if(f.img<45)return 'Tu imagen está muy dañada: ninguna marca quiere asociarse contigo.';
  const v=Math.pow(fcFans(f),.85)*2*(f.img/70);p.dinero+=fcNet(p,v);f.earn+=v;f.spY=G.year;return `Firmas el patrocinio anual de una marca: ${fmt(toInt(v,'USD'))} antes de impuestos.`;}
/* ----- peleas: box y MMA ----- */
const FIGHT_OPP=[['un rival accesible',-12,.5],['un rival de tu nivel',0,1],['un rival mejor rankeado',12,2.2]];
const fcPow=p=>{const f=p.fc;return f.sk*.75+p.s.salud*.25+COACH[f.coach][2]*3;};
const rkPow=rk=>95-rk*.6; // poder de un rival según su lugar en el ranking (el #1 ≈ 94, el #90 ≈ 41)
function fcOdds(p,o){const f=p.fc;return clamp(.5+(fcPow(p)-rkPow(clamp(f.rk-[-15,0,10][o],1,99)))/30,.05,.95);}
function fcFight(p,o){const f=p.fc;const [nm,d,mult]=FIGHT_OPP[o];const pw=clamp(fcOdds(p,o)+gz()*5/30,.05,.95);
  const purse=(1500+Math.pow(fcFans(f),.85)*1.2)*mult*(f.rk<=10?2:1);const win=chance(pw),ko=chance(.35);p.s.salud=clamp(p.s.salud-(win?RI(2,6):RI(6,14)),0,100);
  if(win){f.rec[0]++;if(ko)f.rec[2]++;f.rk=Math.max(1,f.rk-(o===2?RI(10,18):o===1?RI(5,10):RI(1,3)));fcAddFans(p,fcQual(p),(ko?1.6:1.2)*mult);}else{f.rec[1]++;f.rk=Math.min(99,f.rk+RI(3,8));if(chance(.15))f.inj=RI(2,6);}
  const pay=purse*(win?1.3:1);p.dinero+=fcNet(p,pay);f.earn+=pay;f.act=Math.min(4,f.act+1);
  return ((win?(ko?`¡Ganas por nocaut contra ${nm} (probabilidad ${Math.round(pw*100)} %)!`:`¡Ganas por decisión contra ${nm} (probabilidad ${Math.round(pw*100)} %)!`):(ko?`Pierdes por nocaut contra ${nm} (probabilidad ${Math.round(pw*100)} %)!`:`Pierdes por decisión contra ${nm} (probabilidad ${Math.round(pw*100)} %)!`))+` Bolsa ${fmt(toInt(pay,'USD'))}. Récord ${f.rec[0]}-${f.rec[1]} (${f.rec[2]} KO) · ranking mundial #${f.rk}.`+(f.inj?` Lesión: ${f.inj} mes(es).`:''));}
function fcTitle(p){const f=p.fc;if(!(f.rk<=3))return 'Necesitas estar en el top 3 del ranking para pelear por el título.';const pw=clamp(.5+(fcPow(p)-(92+gz()*5))/30,.08,.9);const purse=2e5+Math.pow(fcFans(f),.9)*2;
  p.dinero+=fcNet(p,purse);f.earn+=purse;p.s.salud=clamp(p.s.salud-RI(5,12),0,100);f.act=Math.min(4,f.act+1);
  if(chance(pw)){f.belt=G.year;f.rk=1;f.rec[0]++;f.aw.push({y:G.year,t:(f.k==='box'?'Campeón mundial de box':'Campeón mundial de MMA')});fcBump(p,.8);mkNews(`¡${fullName(p)} es campeón mundial de ${FC[f.k].n.toLowerCase()}!`,true);return `🏆 ¡CAMPEÓN MUNDIAL! Bolsa de ${fmt(toInt(purse,'USD'))}.`;}
  f.rk=RI(4,8);f.rec[1]++;return `Pierdes la pelea por el título. Bolsa de ${fmt(toInt(purse,'USD'))}. Bajas al #${f.rk}.`;}
/* ----- fútbol: equipo, temporada, torneos y selección ----- */
function fcTeam(p){const f=p.fc;return f.lvl===0?`Club amateur de ${RG[p.r].nm}`:f.lvl===4?FUT_TEAMS[4]:`${FUT_TEAMS[f.lvl]} de ${natOf(p).name}`;}
function fcSeasonMonth(p){const f=p.fc;if(f.inj)return;const tgt=FUT_FANS[f.lvl]*clamp(f.sk/70,.2,1.6)*(f.img/70);const tot=fcFans(f);const d=(tgt-tot)*.06;if(d>0){const sh=[[.9,.1,0],[.6,.38,.02],[.35,.55,.1],[.2,.5,.3],[.1,.3,.6]][f.lvl];f.fans.loc+=d*sh[0];f.fans.nac+=d*sh[1];f.fans.int+=d*sh[2];}
  if(chance(.01))f.inj=RI(1,4);}
function fcRankMonth(p){const f=p.fc;const tgt=1e7*Math.pow(f.rk,-1.5)*(f.belt&&G.year-f.belt<=1?3:1)*(f.img/70);const sh=f.rk<=10?[.15,.35,.5]:f.rk<=40?[.4,.45,.15]:[.8,.18,.02];const d=(tgt-fcFans(f))*.05;if(d>0){f.fans.loc+=d*sh[0];f.fans.nac+=d*sh[1];f.fans.int+=d*sh[2];}}
function fcFootballYear(p){const f=p.fc;const sal=FUT_SAL[f.lvl]*(.6+f.sk/120);p.dinero+=fcNet(p,sal);f.earn+=sal;
  const up=f.sk>[30,50,66,80,999][f.lvl]&&chance(.65),down=f.lvl>0&&f.sk<[0,25,42,58,70][f.lvl]&&chance(.45);if(up){f.lvl++;log(`⚽ Te ficha: ${fcTeam(p)}.`,'big');}else if(down){f.lvl--;log(`⚽ Bajas a ${fcTeam(p)}.`,'bad');}
  if(chance(clamp(.06+f.lvl*.05+f.sk/700,.03,.4))){f.aw.push({y:G.year,t:f.lvl>=2?'Campeón de liga':'Campeón de torneo regional'});fcBump(p,.1);log('🏆 Tu equipo gana el campeonato.','good');}
  if(f.sk>=72&&f.lvl>=2&&chance(.55)){f.sel=G.year;fcBump(p,.15);log(`Te convocan a la selección de ${natOf(p).name}.`,'good');if(G.year%4===2&&chance(.1)){f.aw.push({y:G.year,t:'Campeón del mundo con la selección'});fcBump(p,1.5);mkNews(`¡${natOf(p).name} campeón del mundo! ${fullName(p)}, figura del torneo.`,true);}}}
/* ----- contratos y patrocinios ----- */
const CTW={musica:['disquera independiente','disquera nacional','disquera multinacional'],actuacion:['productora local','cadena de televisión','estudio de cine'],creador:['red de creadores','plataforma de video','agencia de marcas global'],modelo:['agencia de modelos local','agencia nacional','agencia internacional'],
  comedia:['bar de comedia','productora de especiales','plataforma de streaming'],escritor:['editorial independiente','editorial nacional','editorial internacional'],chef:['grupo restaurantero','canal de cocina','cadena internacional'],dj:['club local','sello de música electrónica','festival internacional'],
  box:['promotora local','promotora nacional','promotora internacional'],mma:['liga regional','liga nacional','liga mundial de MMA'],futbol:['marca deportiva local','marca deportiva nacional','marca deportiva mundial']};
function fcOffers(p){const f=p.fc;const t=fcTier(f);f.off=[];if(t<1||f.img<35)return;const W=CTW[f.k];const lv=Math.min(2,Math.floor((t-1)/2));const n=1+(f.ag>=2?1:0)+(chance(.35)?1:0);
  for(let i=0;i<n;i++){const l=clamp(lv-(chance(.5)?1:0)+(f.ag>=2&&chance(.35)?1:0),0,2);f.off.push({who:`${pick(['Aurora','Vértice','Cóndor','Nébula','Atlas','Brío','Faro','Zenit','Ámbar','Delta'])} (${W[l]})`,l,adv:(4e3+Math.pow(fcFans(f),.9)*[.3,.8,1.5][l])*R(.7,1.3),roy:+([.12,.17,.22][l]+R(-.03,.03)).toFixed(3),yrs:RI(2,5),boost:[1.15,1.3,1.55][l]});}}
function fcSign(p,i){const f=p.fc,o=f.off[i];if(!o)return '';f.ct=Object.assign({},o,{y:G.year});p.dinero+=fcNet(p,o.adv);f.earn+=o.adv;f.off=[];
  return `Firmas con ${o.who}: anticipo de ${fmt(toInt(o.adv,'USD'))}, ${Math.round(o.roy*100)} % de regalías por ${o.yrs} años. Tu alcance se multiplica ×${o.boost}.`;}
/* ----- mes y año ----- */
function fcMonth(p){const f=p.fc;if(!f)return;const cur=FL(p,'fama')||0;if(f.lastF!=null&&cur>f.lastF+.5)fcBump(p,(cur-f.lastF)*.04); // un video viral o un evento suma fans
  const decay=f.act>.5?.992:.978;for(const k in f.fans)f.fans[k]*=decay;f.act=Math.max(0,f.act-.34);if(f.inj)f.inj=Math.max(0,f.inj-1);if(FC[f.k].sp===1)fcSeasonMonth(p);if(FC[f.k].sp===2)fcRankMonth(p);
  const share=f.ct?f.ct.boost*f.ct.roy/.2:.6;const usd=fcFans(f)*FC[f.k].usd/12*share*(.5+f.img/200)*(FC[f.k].sp===1?.4:1);p.dinero+=fcNet(p,usd);f.earn+=usd;
  const fee=COACH[f.coach][1]*U(p)/12;if(fee)p.dinero-=fee;f.lastF=fcFama(f);FL(p,'fama',f.lastF);if(f.img<65)f.img+=.4;}
function fcYear(p){const f=p.fc;if(!f)return;if(FC[f.k].sp===1)fcFootballYear(p);if(f.ct&&G.year-f.ct.y>=f.ct.yrs){log(`Termina tu contrato con ${f.ct.who}.`);f.ct=null;}fcOffers(p);if(f.off.length)log(`📨 Tienes ${f.off.length} oferta(s) de contrato. Revísalas en ⭐ Tu carrera.`,'good');
  const yw=f.works.filter(w=>w.y>=G.year-1);const best=yw.reduce((m,w)=>Math.max(m,w.q),0);const score=best*.45+f.sk*.35+fcFama(f)*.3-(f.img<40?15:0);
  if(FC[f.k].sp!==2&&FC[f.k].sp!==1&&score>68&&chance(clamp((score-68)/35,0,.75))){if(chance(.3+(score-68)/120)){f.aw.push({y:G.year,t:FC[f.k].aw});fcBump(p,.35);if(fcFama(f)>=40)mkNews(`${fullName(p)} gana el ${FC[f.k].aw}.`,true);log(`🏆 ¡Ganas el ${FC[f.k].aw}!`,'big');}else log(`Te nominan al ${FC[f.k].aw}, pero no ganas esta vez.`,'good');}
  if(FC[f.k].sp===1&&f.sk>=88&&f.lvl>=3&&chance(.12+(f.sk-88)/40)){f.aw.push({y:G.year,t:'Balón Dorado'});fcBump(p,.5);mkNews(`${fullName(p)} gana el Balón Dorado.`,true);log('🏆 ¡Ganas el Balón Dorado al mejor jugador del mundo!','big');}
  if(FC[f.k].sp&&p.age>31){f.sk=clamp(f.sk-R(1,3.5)*(p.age>35?2:1),0,100);if(p.age>=34&&chance(.3))log(`A los ${p.age} años tu cuerpo ya no responde igual. Considera el retiro.`);}
  f.earnY=f.earn;f.earn=0;}
function fcRetire(p){const f=p.fc;const t=FTIT[fcTier(f)];p.fcPast=(p.fcPast||[]).concat([{k:f.k,y0:f.y0,y1:G.year,fans:Math.round(fcFans(f)),aw:f.aw.length,t}]);FL(p,'fama',fcFama(f));p.fc=null;return `Te retiras de ${FC[f.k].n.toLowerCase()} como ${t.toLowerCase()}. Tu fama se irá apagando poco a poco, pero seguirás recibiendo algo de regalías e invitaciones.`;}
/* ----- integración ----- */
{const _fy=famaYear;famaYear=function(p){if(p&&p.fc)return;return _fy(p);};}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();if(P&&P.alive&&P.fc)fcMonth(P);};}
{const _au=ageUp;ageUp=function(){const q=P;_au();if(q&&q===P&&q.alive&&q.fc)fcYear(q);};}
// dedicarte de tiempo completo (sin otro empleo ni escuela) reduce a la mitad el tiempo de cada actividad
const fcFull=p=>p&&p.fc&&!p.job&&!p.career.track&&!p.edu.uni&&!p.ruler;
{const _ac=actCost;actCost=function(t){const c=_ac(t);return /^⭐/.test(t||'')&&fcFull(P)?Math.max(1,Math.round(c/2)):c;};}
ACT_COST.unshift([/^⭐ Entrenar/,20],[/^⭐ Obra grande/,45],[/^⭐ Obra/,15],[/^⭐ Show local/,4],[/^⭐ Show nacional/,12],[/^⭐ Show internacional/,40],[/^⭐ Redes/,2],[/^⭐ Pelea por el título/,90],[/^⭐ Pelea/,60],[/^⭐ Causa/,3],[/^⭐ Patrocinio/,5]);
{const _co=careerOptions;careerOptions=function(){const p=P,a=_co();if(p.age>=12&&!p.prison&&!p.ruler){
  if(p.fc)a.push({sec:'Fama y espectáculo',t:`⭐ Tu carrera: ${FC[p.fc.k].n} · ${FTIT[fcTier(p.fc)]}`,s:`${fmtK(fcFans(p.fc))} fans · nivel ${Math.round(p.fc.sk)} · toca para abrir el panel`,can:true,fn:()=>{if(typeof showFame==='function'&&typeof setTimeout!=='undefined')setTimeout(()=>showFame(),0);return null;}});
  Object.entries(FC).forEach(([k,c])=>{if(p.fc&&p.fc.k===k)return;const minA=c.sp?12:14;
    a.push({sec:'Fama y espectáculo',t:p.fc?`${c.ic} Cambiar a ${c.n.toLowerCase()}`:`${c.ic} Empezar en ${c.n.toLowerCase()}`,s:((c.sp?(c.sp===2?'Entrenamiento, peleas, ranking y título mundial':'Entrenamiento, fichajes, campeonatos y selección'):`Obras, presentaciones, contratos y el ${c.aw}`)+` · cuenta tu ${c.at}`+(p.fc?' · cambiar te deja ~30 % de tus fans':'')+(c.sp?' · hasta 32 años':'')),can:p.age>=minA&&!(c.sp&&p.age>32),
      fn:()=>{if(p.fc){for(const x in p.fc.fans)p.fc.fans[x]*=.3;FL(p,'fama',fcFama(p.fc));}return fcStart(p,k);}});});}return a;};}
