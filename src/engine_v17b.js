/* ===== v1.7b: reloj de 12 horas (a. m. / p. m.) con día y noche =====
   G.min: minutos del día (0–1439). Cada acción toma unas horas del día (además de sus días de tiempo libre, que siguen siendo el presupuesto anual);
   si pasa la medianoche, el mundo avanza un día. Franjas: madrugada (0–5), mañana (6–11), tarde (12–18) y noche (19–23).
   Algunas acciones solo existen a ciertas horas (el médico de día, la vida nocturna de noche, correr al amanecer) y otras rinden distinto.
   Desvelarse (pasar la medianoche sin dormir) cuesta salud y ánimo; dormir lleva el reloj a las 7:00 a. m. y recupera. */
const FRANJAS=[['madrugada','🌌',0,6],['mañana','🌅',6,12],['tarde','☀️',12,19],['noche','🌙',19,24]];
function hourOf(){return Math.floor(((G&&G.min)||0)/60);}
function franjaOf(h){h=h==null?hourOf():h;return FRANJAS.find(f=>h>=f[2]&&h<f[3])||FRANJAS[1];}
const isNight=h=>{h=h==null?hourOf():h;return h>=19||h<6;};
function hhmm(min,short){min=((min||0)%1440+1440)%1440;const h=Math.floor(min/60),m=min%60;const h12=h%12||12;return `${h12}:${String(m).padStart(2,'0')}${short?(h<12?'a':'p'):(h<12?' a. m.':' p. m.')}`;}
{const _ec=ensureClock;ensureClock=function(){_ec();if(G&&G.min==null)G.min=8*60;};}
// duración en horas de cada acción (por texto, como el costo en días)
const ACT_HRS=[[/^😴/,0],[/Vacaciones/i,0],[/Estudiar|curso|Universidad|Posgrado|Maestr|Diplomado/i,4],[/Leer|libro/i,2],[/gimnasio|Entrenar|ejercicio|Correr/i,2],[/familia/i,3],[/contactos/i,3],[/pareja/i,3],
  [/Salir de noche/i,4],[/médico/i,2],[/horas extra/i,4],[/campaña/i,5],[/hijo/i,1],[/^⭐ Practicar/,3],[/^⭐ Sesión/,4],[/^⭐ Presentación/,4],[/^⭐ Audición/,3],[/^⭐ Convivir/,3],[/^⭐ Gira/,0],[/^⭐ Lanzar/,2],[/^⭐/,2]];
function actHrs(t){t=t||'';for(const [rx,h] of ACT_HRS)if(rx.test(t))return h;return 2;}
// avanzar horas: al cruzar la medianoche pasa un día completo del mundo (meses, eventos y todo lo demás)
function clockHours(h,o){o=o||{};ensureClock();let m=G.min+Math.round(h*60);let days=0;while(m>=1440){m-=1440;days++;}G.min=m;let res={done:0,rep:[],stop:null,months:0};
  if(days){const r=clockAdvance(days,{auto:false,pauseBig:false});res=r;if(!o.sleep&&P&&P.alive){P._desv=(P._desv||0)+1;const k=Math.min(3,P._desv);P.s.salud=clamp(P.s.salud-k,0,100);P.s.felicidad=clamp(P.s.felicidad-k,0,100);
      log(`🥱 Te desvelas (${hhmm(G.min)}): −${k} salud y −${k} felicidad. Dormir lo recupera.`,'bad');}}
  return res;}
function sleepNow(p){let dh=((7*60-G.min)%1440+1440)%1440/60;if(dh<1)dh=1;const full=dh>=7;clockHours(dh,{sleep:true});p._desv=0;
  p.s.salud=clamp(p.s.salud+(full?2:1),0,100);p.s.felicidad=clamp(p.s.felicidad+(full?1:0),0,100);
  return `Duermes ${Math.round(dh)} h y despiertas a las ${hhmm(G.min)}${full?' descansado: +2 salud.':': dormiste poco, +1 salud.'}`;}
// acciones nuevas y reglas por franja
{const _pa=personalActions;personalActions=function(){const a=_pa();const p=P,h=hourOf(),T=U(p);const fr=franjaOf(h);
  const win=(t,from,to,note)=>{const it=a.find(x=>x.t.startsWith(t));if(!it)return;const ok=from<to?h>=from&&h<to:h>=from||h<to;if(!ok){it.can=false;it.s=(it.s||'')+` · 🔒 ${note||`de ${hhmm(from*60)} a ${hhmm(to*60)}`}`;}};
  win('Ir al médico',8,19,'consultorios de 8:00 a. m. a 7:00 p. m.');win('Hacer contactos',8,23);win('Hacer campaña',8,21);
  const bp=a.find(x=>x.t==='Buscar pareja');if(bp&&isNight(h))bp.s+=' · 🌙 de noche hay más gente buscando';
  const st=a.find(x=>x.t==='Estudiar');if(st&&(h>=23||h<5))st.s+=' · de madrugada cuesta más concentrarse';
  // dormir: siempre disponible
  if(h>=20||h<7)a.unshift({t:'😴 Dormir',s:`Hasta las 7:00 a. m. · recupera del desvelo${p._desv?` (llevas ${p._desv} noche(s) sin dormir)`:''}`,can:true,fn:()=>sleepNow(p)});
  else a.unshift({t:'😴 Tomar una siesta',s:'1 h 30 min · +1 Felicidad · para dormir de verdad espera a las 8:00 p. m.',can:true,fn:()=>{clockHours(1.5,{sleep:true});p.s.felicidad=clamp(p.s.felicidad+1,0,100);return `Una siesta corta. Despiertas a las ${hhmm(G.min)}.`;}});
  if(p.age>=12)a.push({t:'Correr al amanecer',s:'+Salud, +Felicidad · solo de 5:00 a 9:00 a. m.',can:h>=5&&h<9&&!p.prison,fn:()=>{p.s.salud+=RI(2,3);p.s.felicidad+=RI(1,2);return 'Corres con la ciudad todavía en silencio.';}});
  if(p.age>=18&&!p.prison){const c=0.02*T;a.push({t:`Salir de noche (${fmt(c)})`,s:'+Felicidad; puedes conocer gente · de 7:00 p. m. a 3:00 a. m.',can:(h>=19||h<3)&&p.dinero>=c,fn:()=>{p.dinero-=c;p.s.felicidad+=RI(3,6);const out=[];
      if(!p.partner&&chance(.12+p.s.apariencia/400)){const s=p.sex==='M'?'F':'M';const cu=cultOf(natOf(p).id);p.partner={name:rndFirst(s,cu)+' '+rndSur(cu),sex:s,rel:RI(50,75)};out.push(`Conoces a ${p.partner.name} y se quedan platicando hasta tarde.`);}
      else if(chance(.3)){p.s.influencia+=RI(1,2);out.push('Haces un par de contactos útiles.');}
      const risk=(typeof difOf==='function'?difOf().cost:1)*.08;if(chance(risk)){const l=c*RI(2,6);p.dinero-=l;out.push(`Al regresar te roban la cartera: pierdes ${fmt(l)}.`);}else if(chance(.1)){p.s.salud-=2;out.push('Amaneces con resaca: −2 salud.');}
      return 'Sales de noche. '+(out.join(' ')||'Bailas, ríes y llegas tarde a casa.');}});}
  a.forEach(x=>{const hh=actHrs(x.t);if(hh)x.s=(x.s||'')+` · 🕗 ${hh} h`;});
  return a;};}
ACT_COST.unshift([/^😴/,0],[/Correr al amanecer/,4],[/Salir de noche/,5]);
{const _ac=actCost;actCost=function(t){return /^😴/.test(t||'')?0:_ac(t);};}
