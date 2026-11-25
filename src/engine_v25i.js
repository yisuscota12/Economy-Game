/* ===== v2.5i — fase 6, parte 2 (segunda parte): obras de logística y cierres de puertos y aduanas (pendiente F) =====
   Obras que cambian los envíos de la red de la v2.4a (lgFlows) en sus dos extremos (provincia de origen f.a y de destino f.b):
   1) 🏢 Agencia de comercio (BLD.agcom, hasta 3 niveles, cualquier provincia): por nivel y extremo, flete ×(1 − 0.015) y
      probabilidad de retraso ×(1 − 0.025).
   2) 🛃 Aduana (BLD.aduana, hasta 2 niveles, provincias con costa o con frontera con otro país): solo en envíos internacionales;
      por nivel y extremo, flete ×(1 + 0.01) y retraso ×(1 + 0.02) (los controles tardan), pero pérdida ×(1 − 0.08)
      (menos contrabando y decomisos).
   3) ⚓ Puerto (BLD.puerto de la v0.4, ya existía y la IA lo construye): en envíos marítimos, por nivel y extremo,
      flete ×(1 − 0.02) y retraso ×(1 − 0.03).
   4) ✈️ Aeropuerto (BLD.aero de la v2.4c): en envíos aéreos, solo los niveles que construye el jugador (x.b.aero, no el nivel
      base de los datos, para que el mundo sin obras del jugador no cambie): flete ×(1 − 0.015) y retraso ×(1 − 0.025) por nivel y extremo.
   Topes por envío: flete y retraso entre 0.9 y 1.1; pérdida entre 0.85 y 1. El flete entra en lgNat (copia de engine_v24a.js con el
   factor lgObF(f).c): salud de Comercio minorista e Industria («nlog») y flete de los insumos importados de tus empresas. Retraso y
   pérdida entran en lgMonth (copia de engine_v25h.js, con los bloqueos BQ) multiplicando pd y pl.
   5) Cierres de un mes (además de los bloqueos de la v2.5h): cada mes, cada provincia de costa que es extremo de un envío marítimo
      cierra su puerto con probabilidad 1 % (h21('cpu|'+r+'|'+t)), y cada provincia que es extremo de un envío internacional cierra su
      aduana con probabilidad 0.8 % (h21('cad|'+r+'|'+t)). Los envíos afectados (marítimos o internacionales con extremo ahí) ese mes:
      retraso ×2, pérdida ×1.5 y flete ×1.08. Aviso en el registro (máximo 2 por mes) si tienes envíos afectados. Los cierres se
      calculan de nuevo a partir del mes y de los flujos (nada se guarda: al cargar la partida salen iguales).
   Agencia y aduana son obras solo del jugador: NO enumerables en BLD (aiBuild elige con Object.keys(BLD), trampa 98).
   Azar: solo h21. Si lgNat o lgMonth cambian en engine_v24a.js / engine_v25h.js, hay que copiarlas de nuevo aquí.
   Todos los factores son tentativos: SIN calibrar con simulación. Se carga al final de engine. */
(function(){
  if(typeof lgMonth!=='function'||typeof lgNat!=='function'||typeof h21!=='function'||typeof BLD==='undefined')return;
  Object.defineProperty(BLD,'agcom',{value:{n:'Agencia de comercio',ic:'🏢',c:.025,max:3,d:'Envíos más baratos y puntuales desde y hacia esta provincia'},enumerable:false,writable:true,configurable:true});
  Object.defineProperty(BLD,'aduana',{value:{n:'Aduana',ic:'🛃',c:.03,max:2,d:'Envíos internacionales con más controles: algo más lentos y caros, pero se pierden menos'},enumerable:false,writable:true,configurable:true});
})();

/* ---------- dónde se puede construir ---------- */
function lgFront(r){const g=RG[r],x=G&&G.regions[r];if(!g||!x)return false;if(g.co)return true;return (g.adj||[]).some(a=>G.regions[a]&&G.regions[a].o!==x.o);}
function lgObCan(r,k){const x=G&&G.regions[r];if(!x||!BLD[k])return {ok:false,why:''};if(bl(r,k)>=BLD[k].max)return {ok:false,why:`Ya tiene el nivel más alto (${BLD[k].max}).`};
  if(k==='aduana'&&!lgFront(r))return {ok:false,why:'Una aduana necesita costa o frontera con otro país.'};return {ok:true,why:''};}
(function(){if(typeof canBuild!=='function'||typeof build!=='function')return;
  const _cb=canBuild;canBuild=function(r,k){if(k==='agcom'||k==='aduana')return lgObCan(r,k).ok;return _cb(r,k);};
  const _b=build;build=function(r,k){const o=_b(r,k);if(k==='agcom'||k==='aduana'||k==='puerto'||k==='aero'){try{LGC.nt=-1;}catch(e){}}return o;};})();

/* ---------- factores de las obras sobre un envío ---------- */
function lgObF(f){let c=1,d=1,l=1;const intl=f.na!==f.nb;
  for(const r of [f.a,f.b]){const x=G.regions[r];const b=x&&x.b;if(!b)continue;
    const ag=b.agcom||0;if(ag){c*=1-.015*ag;d*=1-.025*ag;}
    if(intl){const ad=b.aduana||0;if(ad){c*=1+.01*ad;d*=1+.02*ad;l*=1-.08*ad;}}
    if(f.m==='mar'){const pu=b.puerto||0;if(pu){c*=1-.02*pu;d*=1-.03*pu;}}
    else if(f.m==='aer'){const ae=b.aero||0;if(ae){c*=1-.015*ae;d*=1-.025*ae;}}}
  return {c:clamp(c,.9,1.1),d:clamp(d,.9,1.1),l:clamp(l,.85,1)};}

/* ---------- cierres de puertos y aduanas (un mes; deterministas con h21) ---------- */
const LGCZ={t:null,F:null,pu:null,ad:null};
function lgCz(t){const F=lgFlows();if(LGCZ.t===t&&LGCZ.F===F)return LGCZ;const pu={},ad={},seenP={},seenA={};
  for(const f of F){const intl=f.na!==f.nb;for(const r of [f.a,f.b]){
    if(f.m==='mar'&&!seenP[r]){seenP[r]=1;if(RG[r]&&RG[r].co&&h21('cpu|'+r+'|'+t)<.01)pu[r]=1;}
    if(intl&&!seenA[r]){seenA[r]=1;if(h21('cad|'+r+'|'+t)<.008)ad[r]=1;}}}
  LGCZ.t=t;LGCZ.F=F;LGCZ.pu=pu;LGCZ.ad=ad;return LGCZ;}
function lgCzHit(f,Z){const intl=f.na!==f.nb;let h=null;for(const r of [f.a,f.b]){if(f.m==='mar'&&Z.pu[r])return ['pu',r];if(intl&&Z.ad[r])h=['ad',r];}return h;}

/* ---------- flete: copia de lgNat (engine_v24a.js) con las obras y los cierres ---------- */
(function(){if(typeof lgNat!=='function'||typeof lgMonth!=='function'||typeof lgFlows!=='function')return;
lgNat=function(nid){const C=lgCache();const t=G.lg?G.lg.t:0;if(C.nt!==t){C.nt=t;C.nat={};}if(C.nat[nid])return C.nat[nid];lgFlows();const n=G.nations[nid];
  const em=(G.lg&&G.lg.em)||{ter:1,mar:1,aer:1};const war=!!(n&&warsOf(nid).length);let sv=0,sd=0,st=0,s0=0,nI=0;const I=[];let Z=null;try{Z=lgCz(t);}catch(e){Z=null;}
  (C.byN[nid]||[]).forEach(f=>{if(f.nb!==nid||f.dom)return;const c=lgCarrier(f);let ob=1;try{ob=lgObF(f).c*(Z&&lgCzHit(f,Z)?1.08:1);}catch(e){ob=1;}
    const cf=(em[f.m]||1)/Math.max(.5,c.e)*(war?LG_WAR:1)*ob;sv+=f.v;sd+=f.v*(cf-1);st+=f.v*f.tc0*cf;s0+=f.v*f.tc0;nI++;I.push(f);});
  let dep=0;try{let a=0,q=0;lgRes(nid).forEach(e=>{const v=resVal(e.k);a+=Math.max(0,e.need-e.pr)*v;q+=e.need*v;});dep=q>0?clamp(a/q,0,1):0;}catch(e){}
  const D=sv?sd/sv:0;const o={nid,n:nI,I,dep,D,tc:sv?st/sv:0,tc0:sv?s0/sv:0,war,v:sv,sc:Math.round(clamp(50-250*D,0,100))};C.nat[nid]=o;return o;};

/* ---------- retrasos y pérdidas: copia de lgMonth (engine_v25h.js) con las obras y los cierres ---------- */
lgMonth=function(t){const L=lgEnsure();const F=lgFlows();L.t=(L.t||0)+1;const dl=[];const em={ter:[0,0],mar:[0,0],aer:[0,0]};const Y=G.year;const BQ={};const me0=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;for(const m of ['ter','mar','aer']){const on=h21('bq|'+m+'|'+t)<.03;BQ[m]=on?3:1;if(on&&me0&&F.some(f=>f.m===m&&(f.na===me0||f.nb===me0))){try{log(`🚧 Bloqueo en la ruta ${({ter:'terrestre',mar:'marítima',aer:'aérea'})[m]}: los envíos por esa vía se retrasan o se pierden más este mes.`,'bad');}catch(e){}}}
  let Z=null;try{Z=lgCz(L.t);}catch(e){Z=null;}const czLog={};let czN=0;const PM=lgPMap();
  const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const warN={};const isW=id=>warN[id]!=null?warN[id]:(warN[id]=warsOf(id).length>0);
  const nc={};for(const f of F){const c=lgCarrier(f);if(!c.p)nc[c.id]=(nc[c.id]||0)+1;}
  for(const f of F){const c=lgCarrier(f);const w=isW(f.na)||isW(f.nb)?1.8:1;const sc=(1+2*Math.max(0,1-c.e))*w*BQ[f.m];
    let ob={c:1,d:1,l:1},hz=null;try{ob=lgObF(f);hz=Z?lgCzHit(f,Z):null;}catch(e){}const zd=hz?2:1,zl=hz?1.5:1;
    if(hz&&me0&&czN<2&&(f.na===me0||f.nb===me0||PM[f.id])){const kz=hz[0]+'|'+hz[1];if(!czLog[kz]){czLog[kz]=1;czN++;
      try{log(hz[0]==='pu'?`⚓ Cierre del puerto de ${RG[hz[1]].nm} este mes: tus envíos marítimos por ahí se retrasan o se pierden más.`:`🛃 Cierre de la aduana de ${RG[hz[1]].nm} este mes: tus envíos internacionales por ahí se retrasan o se pierden más.`,'bad');}catch(e){}}}
    const pl=.005*sc*ob.l*zl,pd=.035*sc*ob.d*zd;const u=h21(f.id+'|'+t+'|lg');
    const ev=u<pl?2:u<pl+pd?1:0;
    if(c.p){const b=c.b;const g=lgBiz(b);const m=b.m&&b.m[b.m.length-1];const rv=m?m.rev:0;
      if(ev===2){g.y.ls++;b.cash=Math.max(0,(b.cash||0)-.03*rv);b.rep=clamp((b.rep||50)-1.5,0,100);if(b.lg.lw!==t){b.lg.lw=t;try{log(`📦 ${b.n} pierde un envío de ${lgGood(f.k)} en la ruta ${RG[f.a].nm} → ${RG[f.b].nm}: pagas el seguro y baja tu reputación.`,'bad');}catch(e){}}}
      else if(ev===1){g.y.dl++;b.rep=clamp((b.rep||50)-.3,0,100);}else g.y.ok++;}
    else{const a=L.ai[c.id];if(a){if(a.y!==Y){a.y=Y;a.ok=0;a.dl=0;a.ls=0;}const q=1/(nc[c.id]||1);if(ev===2){a.ls++;a.e-=.3*q;}else if(ev===1){a.dl++;a.e-=.08*q;}else a.ok++;}}
    if(ev){dl.push([f.id,ev]);if(me&&(f.na===me||f.nb===me)&&(ev===2||c.p))L.ev.push([t,f.id,ev,c.id]);}}
  for(const id in L.ai){const a=L.ai[id];a.e=clamp(a.e+(1.07-a.e)*.06+(h21(id+'|'+t+'|e')-.5)*.02,.6,1.25);const m=LGA[id]&&LGA[id][2];if(m){em[m][0]+=a.e;em[m][1]++;}}
  for(const m in em)L.em[m]=em[m][1]?em[m][0]/em[m][1]:1;
  L.dl=dl.slice(0,60);if(L.ev.length>14)L.ev.splice(0,L.ev.length-14);};
})();
