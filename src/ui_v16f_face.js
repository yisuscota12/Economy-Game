/* ===== v1.7q (v1.6f): retratos mejorados =====
   Mismo contrato que face() de la v0.4: viewBox 0 0 100 100, círculo de fondo, hombros 'M30 86 Q50 76 70 86 L76 100 L24 100 Z', cuello <rect x="44" …>
   (ui_v06.js mete la ropa por oficio justo antes de ese cuello y los sombreros al final), opciones mood, dead, bg, shirt ('none' = sin camisa), crown.
   Nuevo: mandíbula y orejas, sombra lateral, ojos con iris por población, párpados, cejas que siguen el ánimo, nariz, labios y dientes al sonreír,
   8 peinados de hombre y 8 de mujer (capa de atrás y de adelante), barba incompleta, bigote, candado y barba completa, entradas y calvicie con la edad,
   canas graduales, arrugas por edad, pecas, aretes y 3 tipos de lentes. Sin <defs> ni identificadores: se puede repetir en la misma pantalla.
   v2.2b: clase px2 (retrato chico, bloques de 2 px) o px3 (grande, bloques de 3 px) para el estilo pixel (filtros en ui_v16f_gx.js). */
const FACE2_IRIS={afri:['#3b2416','#2a180e'],indi:['#3b2416','#4a2e1a'],chin:['#2a1a10','#3b2416'],japo:['#2a1a10','#3b2416'],core:['#2a1a10','#3b2416'],seas:['#3b2416','#2a1a10'],
  arab:['#3b2416','#5a3a1e','#4b5a2a'],pers:['#3b2416','#5a3a1e','#4b6a3a'],turc:['#4a2e1a','#5a3a1e','#4b6a3a'],hisp:['#3b2416','#5a3a1e','#6b4a1e'],luso:['#3b2416','#5a3a1e','#4b6a3a'],
  angl:['#3d6ea8','#4b7a4a','#5a3a1e','#6a8aa8'],germ:['#3d6ea8','#6a8aa8','#4b7a4a','#5a3a1e'],esla:['#6a8aa8','#3d6ea8','#4b7a4a','#5a3a1e'],fran:['#5a3a1e','#3d6ea8','#4b7a4a'],ital:['#5a3a1e','#4b7a4a','#3b2416'],hebr:['#5a3a1e','#4b7a4a','#3b2416']};
function face2Shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return '#'+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1);}
function faceV2(x,size,o){o=o||{};const name=x.name||(x.first+' '+x.surname)||'x',sd=hsh(name),age=x.age||0,sex=x.sex||'M',c=x.c||x.cult||(typeof P!=='undefined'&&P&&P.cult)||'hisp';
  const R=k=>(hsh(name+'|'+k)%1000)/1000;
  const sk=(SKIN[c]||SKIN.hisp)[sd%4],skD=face2Shade(sk,-.16),skDD=face2Shade(sk,-.32),skL=face2Shade(sk,.18);
  const darkHair=['afri','indi','chin','japo','core','arab','pers','turc','seas','hisp','luso'].includes(c);
  let hc=HAIR[darkHair?(sd>>>3)%3:(sd>>>3)%7];
  const gray=age<45?0:Math.min(1,(age-45)/30+R('gr')*.25);if(gray>.15)hc=gray>.85?'#e4e4e4':gray>.5?'#a8a8a8':face2Shade(hc,.25+gray*.35);
  const hcD=face2Shade(hc,-.28);
  const mood=o.mood!=null?o.mood:60,dead=o.dead,baby=age<3,kid=age<13,teen=age>=13&&age<18,old=age>=60,F=sex==='F';
  const ir=(FACE2_IRIS[c]||FACE2_IRIS.hisp);const iris=ir[(sd>>>4)%ir.length];
  const hy=baby?50:48; /* centro de la cabeza */
  const rx=baby?24:kid?21.5:F?19.5:20.5,ry=baby?24:kid?23:25;
  const jaw=F?3:kid?2:5+((sd>>>9)%3); /* mandíbula: más ancha en hombres */
  const hsM=(sd>>>5)%8,hsF=(sd>>>6)%8;
  let s=`<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="face${dead?' dead':''}${size<56?' px2':' px3'}"><circle cx="50" cy="50" r="49" fill="${o.bg||'#22303f'}"/>`;
  /* --- pelo de atrás (largo) --- */
  const backHair=()=>{if(baby)return '';
    if(F){switch(hsF){
      case 0:return `<path d="M27 46 Q22 74 26 90 L74 90 Q78 74 73 46 Z" fill="${hcD}"/>`; /* lacio largo */
      case 1:return `<path d="M27 44 Q25 64 30 70 L70 70 Q75 64 73 44 Z" fill="${hcD}"/>`; /* bob */
      case 2:return `<path d="M64 30 Q84 40 78 72 Q74 62 68 56 Z" fill="${hcD}"/>`; /* cola de caballo */
      case 3:return `<circle cx="50" cy="20" r="9" fill="${hcD}"/>`; /* chongo */
      case 4:return `<path d="M24 46 Q16 70 24 86 Q30 92 36 86 L64 86 Q70 92 76 86 Q84 70 76 46 Z" fill="${hcD}"/>`; /* rizado */
      case 5:return ''; /* pixie */
      case 6:return `<path d="M27 46 Q20 66 25 80 Q28 90 34 92 L66 92 Q72 90 75 80 Q80 66 73 46 Z" fill="${hcD}"/>`; /* ondulado */
      default:return `<path d="M28 50 Q26 72 30 92 L36 92 Q34 72 34 52 Z M72 50 Q74 72 70 92 L64 92 Q66 72 66 52 Z" fill="${hcD}"/>`;}} /* trenzas */
    return hsM===6?`<path d="M28 44 Q25 62 30 72 L70 72 Q75 62 72 44 Z" fill="${hcD}"/>`:'';};
  s+=backHair();
  /* --- hombros y cuello --- */
  s+=`<path d="M30 86 Q50 ${baby?80:76} 70 86 L76 100 L24 100 Z" fill="${o.shirt||['#3d6ea8','#a8443d','#3d8a5a','#7a5aa8','#c08a2a','#2f6f6a','#8a3a5a'][sd%7]}"/>`;
  s+=`<rect x="44" y="${baby?66:68}" width="12" height="12" fill="${sk}"/><path d="M44 ${baby?70:72} Q50 ${baby?75:77} 56 ${baby?70:72} V${baby?66:68} H44Z" fill="${skD}" opacity=".7"/>`;
  /* --- orejas --- */
  if(!baby||true){const ey0=hy+1;s+=`<ellipse cx="${50-rx+.5}" cy="${ey0}" rx="3.6" ry="5.2" fill="${sk}"/><ellipse cx="${50+rx-.5}" cy="${ey0}" rx="3.6" ry="5.2" fill="${sk}"/><path d="M${50-rx-.6} ${ey0-2} q1.5 2 0 4M${50+rx+.6} ${ey0-2} q-1.5 2 0 4" stroke="${skD}" stroke-width="1.1" fill="none"/>`;
    if(F&&age>=12&&R('ear')<.55){const ec=R('ec')<.5?'#f2c14e':'#d8dde3';s+=`<circle cx="${50-rx}" cy="${ey0+5}" r="1.4" fill="${ec}"/><circle cx="${50+rx}" cy="${ey0+5}" r="1.4" fill="${ec}"/>`;}}
  /* --- cabeza con mandíbula --- */
  const top=hy-ry,bot=hy+ry;
  s+=`<path d="M${50-rx} ${hy-2} Q${50-rx} ${top} 50 ${top} Q${50+rx} ${top} ${50+rx} ${hy-2} Q${50+rx} ${hy+ry*.55} ${50+rx-jaw} ${hy+ry*.78} Q${54} ${bot+1} 50 ${bot+1} Q${46} ${bot+1} ${50-rx+jaw} ${hy+ry*.78} Q${50-rx} ${hy+ry*.55} ${50-rx} ${hy-2}Z" fill="${sk}"/>`;
  /* sombra lateral y luz */
  s+=`<path d="M${50+rx*.35} ${top+3} Q${50+rx+1} ${hy-4} ${50+rx} ${hy+4} Q${50+rx-1} ${hy+ry*.6} ${50+rx-jaw} ${hy+ry*.78} Q${54} ${bot} 50 ${bot+1} Q${50+rx*.7} ${hy+ry*.4} ${50+rx*.55} ${hy} Q${50+rx*.5} ${top+10} ${50+rx*.35} ${top+3}Z" fill="${skD}" opacity=".45"/>`;
  s+=`<ellipse cx="${50-rx*.42}" cy="${hy-ry*.42}" rx="${rx*.32}" ry="${ry*.2}" fill="${skL}" opacity=".35"/>`;
  /* --- pecas y rubor --- */
  if(!baby&&['angl','germ','esla','fran'].includes(c)&&R('pec')<.3){for(let i=0;i<7;i++){const px=40+R('px'+i)*20,py=hy+6+R('py'+i)*5;s+=`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r=".7" fill="${skDD}" opacity=".55"/>`;}}
  if(kid||F&&!old)s+=`<ellipse cx="${50-rx*.55}" cy="${hy+9}" rx="4.2" ry="2.6" fill="#e66" opacity="${kid?.28:.16}"/><ellipse cx="${50+rx*.55}" cy="${hy+9}" rx="4.2" ry="2.6" fill="#e66" opacity="${kid?.28:.16}"/>`;
  /* --- ojos --- */
  const ey=baby?hy+1:hy-1,ex=baby?8:F?8.2:8.6,er=baby?3.6:kid?3.3:F?3.1:2.8,angry=mood<25,sad=mood<45&&!angry,happy=mood>72;
  const eye=cx=>{let e=`<ellipse cx="${cx}" cy="${ey}" rx="${er+1.4}" ry="${happy?er*.7:er+.4}" fill="#f6f3ee"/><circle cx="${cx}" cy="${ey+.2}" r="${er*.78}" fill="${iris}"/><circle cx="${cx}" cy="${ey+.2}" r="${er*.4}" fill="#0d0d0d"/><circle cx="${cx-er*.3}" cy="${ey-er*.3}" r="${er*.22}" fill="#fff"/>`;
    e+=`<path d="M${cx-er-1.6} ${ey-(happy?.2:.6)} Q${cx} ${ey-er-(happy?.8:1.8)} ${cx+er+1.6} ${ey-(happy?.2:.6)}" stroke="${skDD}" stroke-width="${F&&!kid?1.5:1}" fill="none" stroke-linecap="round"/>`;
    if(F&&age>=14)e+=`<path d="M${cx+(cx<50?-er-1.4:er+1.4)} ${ey-.8} l${cx<50?-1.6:1.6} -1.2" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round"/>`;
    if(old)e+=`<path d="M${cx-er-1.2} ${ey+er+.6} Q${cx} ${ey+er+2} ${cx+er+1.2} ${ey+er+.6}" stroke="${skDD}" stroke-width=".7" fill="none" opacity=".6"/>`;
    return e;};
  s+=eye(50-ex)+eye(50+ex);
  /* --- cejas según ánimo --- */
  if(!baby){const bc=gray>.85?'#c8c8c8':hcD,bw=F?1.6:2.4,by=ey-er-4.2;const tilt=angry?2.4:sad?-1.8:0;
    s+=`<path d="M${50-ex-5} ${by+(sad?1.2:0)} Q${50-ex} ${by-1.8} ${50-ex+4.5} ${by+tilt}M${50+ex-4.5} ${by+tilt} Q${50+ex} ${by-1.8} ${50+ex+5} ${by+(sad?1.2:0)}" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;}
  /* --- nariz --- */
  const ny=hy+(baby?7:6.5);s+=baby?`<ellipse cx="50" cy="${ny}" rx="2" ry="1.3" fill="${skD}"/>`:`<path d="M50.6 ${ey+2} Q52.4 ${ny-1} 53 ${ny+1.2} Q51 ${ny+2.6} 48.6 ${ny+1.6}" stroke="${skDD}" stroke-width="1.15" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="50.5" cy="${ny+2.4}" rx="3.2" ry="1" fill="${skD}" opacity=".5"/>`;
  /* --- boca --- */
  const my=hy+(baby?13:14.2),lip=F&&age>=14?face2Shade('#c0504d',(sd>>>7)%2?-.1:.08):face2Shade(sk,-.38);
  if(mood>80&&!baby)s+=`<path d="M${43} ${my} Q50 ${my+7.5} ${57} ${my} Z" fill="#5a1a14"/><path d="M${44} ${my+.3} Q50 ${my+2.6} ${56} ${my+.3} L56 ${my+.4} Q50 ${my+3.6} 44 ${my+.4}Z" fill="#fff"/><path d="M43 ${my} Q50 ${my+7.5} 57 ${my}" stroke="${lip}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  else{const d=mood>62?`M43.5 ${my} Q50 ${my+5} 56.5 ${my}`:mood>40?`M44.5 ${my+1} Q50 ${my+2.6} 55.5 ${my+1}`:mood>22?`M44.5 ${my+2.2} Q50 ${my} 55.5 ${my+2.2}`:`M44 ${my+3} Q50 ${my-1.4} 56 ${my+3}`;
    s+=`<path d="${d}" stroke="${lip}" stroke-width="${F&&age>=14?2.6:2}" fill="none" stroke-linecap="round"/>`;}
  /* --- arrugas --- */
  if(age>=40){const op=Math.min(.38,(age-40)/80+.1);s+=`<path d="M${50-ex-4} ${hy-ry*.62} Q50 ${hy-ry*.68} ${50+ex+4} ${hy-ry*.62}" stroke="#000" stroke-opacity="${op*.8}" stroke-width=".9" fill="none"/>`;
    if(age>=55)s+=`<path d="M${50-ex-3} ${hy-ry*.52} Q50 ${hy-ry*.57} ${50+ex+3} ${hy-ry*.52}M${44.5} ${ny+1} Q${43} ${my-1} ${44} ${my+3}M${55.5} ${ny+1} Q${57} ${my-1} ${56} ${my+3}" stroke="#000" stroke-opacity="${op}" stroke-width=".9" fill="none"/>`;
    if(age>=68)s+=`<path d="M${50-ex-er-3} ${ey-1} l-2.2 -1.2M${50-ex-er-3} ${ey+1} l-2.4 .6M${50+ex+er+3} ${ey-1} l2.2 -1.2M${50+ex+er+3} ${ey+1} l2.4 .6" stroke="#000" stroke-opacity="${op}" stroke-width=".8" fill="none"/>`;}
  /* --- vello facial --- */
  if(!F&&age>=17){const b=(sd>>>8)%6,bcol=gray>.6?face2Shade(hc,.1):hc;
    if(b===1||age<20&&b<3)s+=`<path d="M${50-rx+jaw-1} ${hy+ry*.5} Q${50-rx+jaw+1} ${bot-1} 50 ${bot+1} Q${50+rx-jaw-1} ${bot-1} ${50+rx-jaw+1} ${hy+ry*.5} Q50 ${hy+ry*.95} ${50-rx+jaw-1} ${hy+ry*.5}Z" fill="${bcol}" opacity=".3"/>`;
    else if(b===2)s+=`<path d="M43 ${my-2.4} Q50 ${my-5.4} 57 ${my-2.4} Q56 ${my-.6} 50 ${my-2} Q44 ${my-.6} 43 ${my-2.4}Z" fill="${bcol}"/>`;
    else if(b===3)s+=`<path d="M43 ${my-2.4} Q50 ${my-5.4} 57 ${my-2.4} Q56 ${my-.6} 50 ${my-2} Q44 ${my-.6} 43 ${my-2.4}Z M45 ${my+3} Q50 ${my+11} 55 ${my+3} Q54 ${my+6.5} 50 ${my+6.5} Q46 ${my+6.5} 45 ${my+3}Z" fill="${bcol}"/>`;
    else if(b===4)s+=`<path d="M${50-rx+.5} ${hy+1} Q${50-rx+1} ${bot+1} 50 ${bot+3} Q${50+rx-1} ${bot+1} ${50+rx-.5} ${hy+1} Q${50+rx-3} ${hy+ry*.62} 57 ${my-1} Q50 ${my-3.2} 43 ${my-1} Q${50-rx+3} ${hy+ry*.62} ${50-rx+.5} ${hy+1}Z M45 ${my+1.4} Q50 ${my+4} 55 ${my+1.4} Q50 ${my+2.4} 45 ${my+1.4}Z" fill="${bcol}"/>`;}
  /* --- pelo de adelante --- */
  const bald=!F&&age>=40&&(sd>>>12)%3===0,rec=!F&&age>=35&&!bald&&(sd>>>13)%3===0;
  if(baby)s+=`<path d="M45 ${top+2} Q50 ${top-5} 55 ${top+2} Q52 ${top} 50 ${top+3} Q48 ${top} 45 ${top+2}Z" fill="${hc}"/>`;
  else if(bald)s+=`<path d="M${50-rx} ${hy-1} Q${50-rx-.5} ${hy-9} ${50-rx+3} ${hy-12} L${50-rx+4} ${hy-2}Z M${50+rx} ${hy-1} Q${50+rx+.5} ${hy-9} ${50+rx-3} ${hy-12} L${50+rx-4} ${hy-2}Z" fill="${hc}"/><ellipse cx="${50-rx*.3}" cy="${top+5}" rx="5" ry="2.4" fill="#fff" opacity=".18"/>`;
  else{const T=top,L=50-rx,Rr=50+rx;let h='';
    if(F){switch(hsF){
      case 0:case 6:h=`M${L-1.5} ${hy+6} Q${L-3} ${T-3} 50 ${T-3.5} Q${Rr+3} ${T-3} ${Rr+1.5} ${hy+6} Q${Rr-2} ${T+9} ${54} ${T+8} Q${44} ${T+10} ${L+3} ${hy}Z`;break;
      case 1:h=`M${L-2} ${hy+10} Q${L-4} ${T-3} 50 ${T-3.5} Q${Rr+4} ${T-3} ${Rr+2} ${hy+10} L${Rr-1} ${hy+10} Q${Rr-2} ${T+10} 50 ${T+11} Q${L+2} ${T+10} ${L+1} ${hy+10}Z`;break;
      case 2:case 3:h=`M${L-1} ${hy-2} Q${L-2} ${T-3} 50 ${T-3} Q${Rr+2} ${T-3} ${Rr+1} ${hy-2} Q${Rr-3} ${T+5} 50 ${T+5.5} Q${L+3} ${T+5} ${L-1} ${hy-2}Z`;break;
      case 4:h=`M${L-3} ${hy+4} Q${L-6} ${T-5} 50 ${T-5} Q${Rr+6} ${T-5} ${Rr+3} ${hy+4} Q${Rr} ${T+9} ${56} ${T+7} Q${50} ${T+11} ${44} ${T+7} Q${L} ${T+9} ${L-3} ${hy+4}Z`;break;
      case 5:h=`M${L-1} ${hy-3} Q${L-2} ${T-3} 52 ${T-3} Q${Rr+2} ${T-2} ${Rr+.5} ${hy-4} Q${Rr-4} ${T+4} ${46} ${T+8} Q${L+2} ${T+9} ${L-1} ${hy-3}Z`;break;
      default:h=`M${L-1} ${hy} Q${L-2} ${T-3} 50 ${T-3} Q${Rr+2} ${T-3} ${Rr+1} ${hy} Q${Rr-3} ${T+6} 51 ${T+6} L49 ${T+6} Q${L+3} ${T+6} ${L-1} ${hy}Z`;}}
    else{const r0=rec?4:0;switch(hsM){
      case 0:h=`M${L-.5} ${hy-3} Q${L-1.5} ${T-2} 50 ${T-2.5} Q${Rr+1.5} ${T-2} ${Rr+.5} ${hy-3} Q${Rr-2} ${T+5+r0} 50 ${T+6+r0} Q${L+2} ${T+5+r0} ${L-.5} ${hy-3}Z`;break; /* corto */
      case 1:h=`M${L} ${hy-5} Q${L-.5} ${T-.5} 50 ${T-1} Q${Rr+.5} ${T-.5} ${Rr} ${hy-5} Q${Rr-1} ${T+3+r0} 50 ${T+3.5+r0} Q${L+1} ${T+3+r0} ${L} ${hy-5}Z`;break; /* rapado */
      case 2:h=`M${L-.5} ${hy-2} Q${L-2} ${T-3} 46 ${T-3} Q${Rr+2} ${T-3} ${Rr+.5} ${hy-3} Q${Rr-2} ${T+7} ${44} ${T+5+r0} Q${L+2} ${T+7} ${L-.5} ${hy-2}Z`;break; /* raya al lado */
      case 3:h=`M${L-.5} ${hy-3} Q${L-2} ${T-4} 48 ${T-6} Q${Rr+3} ${T-5} ${Rr+.5} ${hy-3} Q${Rr-2} ${T+5} 50 ${T+4+r0} Q${L+2} ${T+6} ${L-.5} ${hy-3}Z`;break; /* copete */
      case 4:h=`M${L-3} ${hy-1} Q${L-5} ${T-7} 50 ${T-7} Q${Rr+5} ${T-7} ${Rr+3} ${hy-1} Q${Rr-1} ${T+6} 50 ${T+6} Q${L+1} ${T+6} ${L-3} ${hy-1}Z`;break; /* afro/rizado */
      case 5:h=`M${L-.5} ${hy-4} Q${L-1} ${T-2} 50 ${T-2} Q${Rr+1} ${T-2} ${Rr+.5} ${hy-4} L${Rr-2} ${T+5+r0} L${57} ${T+3+r0} L${53} ${T+6+r0} L${48} ${T+3+r0} L${44} ${T+6+r0} L${L+2} ${T+5+r0}Z`;break; /* despeinado */
      case 6:h=`M${L-1.5} ${hy+2} Q${L-3} ${T-3} 50 ${T-3} Q${Rr+3} ${T-3} ${Rr+1.5} ${hy+2} Q${Rr-2} ${T+8} 50 ${T+8} Q${L+2} ${T+8} ${L-1.5} ${hy+2}Z`;break; /* largo */
      default:h=`M${L-.5} ${hy-3} Q${L-1.5} ${T-2.5} 50 ${T-3} Q${Rr+1.5} ${T-2.5} ${Rr+.5} ${hy-3} Q${Rr-2} ${T+3+r0} ${58} ${T+6+r0} Q50 ${T+4+r0} ${42} ${T+6+r0} Q${L+2} ${T+3+r0} ${L-.5} ${hy-3}Z`;}} /* ondulado */
    s+=`<path d="${h}" fill="${hc}"/><path d="${h}" fill="none" stroke="${hcD}" stroke-width=".8" opacity=".6"/>`;
    if(!F&&hsM===4||F&&hsF===4){for(let i=0;i<11;i++){const a=Math.PI*(1.04+i*.092),cx=50+Math.cos(a)*(rx+2.2),cy=hy-3+Math.sin(a)*(ry+2.2);s+=`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.4" fill="${hc}"/>`;}}}
  /* --- lentes --- */
  if(age>=14&&(sd>>>10)%5===0||old&&(sd>>>10)%3===0){const g=(sd>>>11)%3,gc=g===2?'#7a4a1a':'#1e1e1e';
    s+=g===1?`<rect x="${50-ex-5}" y="${ey-3.6}" width="10" height="7" rx="2" fill="#9fd0ff" fill-opacity=".12" stroke="${gc}" stroke-width="1.5"/><rect x="${50+ex-5}" y="${ey-3.6}" width="10" height="7" rx="2" fill="#9fd0ff" fill-opacity=".12" stroke="${gc}" stroke-width="1.5"/>`
      :`<circle cx="${50-ex}" cy="${ey}" r="5.3" fill="#9fd0ff" fill-opacity=".12" stroke="${gc}" stroke-width="${g===2?1.8:1.4}"/><circle cx="${50+ex}" cy="${ey}" r="5.3" fill="#9fd0ff" fill-opacity=".12" stroke="${gc}" stroke-width="${g===2?1.8:1.4}"/>`;
    s+=`<path d="M${50-ex+5} ${ey-.5} Q50 ${ey-2} ${50+ex-5} ${ey-.5}M${50-ex-5.2} ${ey-1} L${50-rx} ${ey-2}M${50+ex+5.2} ${ey-1} L${50+rx} ${ey-2}" stroke="${gc}" stroke-width="1.2" fill="none"/>`;}
  if(o.crown)s+=`<path d="M34 ${top+1} L38 ${top-11} L44 ${top-3} L50 ${top-13} L56 ${top-3} L62 ${top-11} L66 ${top+1} Z" fill="#f2c14e" stroke="#7a5a10" stroke-width="1"/><circle cx="50" cy="${top-6}" r="1.6" fill="#c0392b"/>`;
  return s+'</svg>';}
