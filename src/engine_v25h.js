/* ===== v2.5h — fase 6, parte 2 (primera parte): bloqueos de rutas de envíos (pendiente F) =====
   Cada mes, con probabilidad 3 % por vía (terrestre, marítima o aérea), hay un bloqueo: los envíos de esa vía
   pierden y se retrasan tres veces más ese mes (el factor BQ entra en el mismo cálculo de lgMonth). Avisa en el registro
   si tienes envíos por esa vía. Usa h21 (nada de Math.random). lgMonth se copia de engine_v24a.js con esos dos cambios:
   si cambia allí, hay que copiarla de nuevo. Sin calibrar con simulación todavía. Se carga al final de engine. */
(function(){
  if(typeof lgMonth!=='function'||typeof h21!=='function')return;
lgMonth=function(t){const L=lgEnsure();const F=lgFlows();L.t=(L.t||0)+1;const dl=[];const em={ter:[0,0],mar:[0,0],aer:[0,0]};const Y=G.year;const BQ={};const me0=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;for(const m of ['ter','mar','aer']){const on=h21('bq|'+m+'|'+t)<.03;BQ[m]=on?3:1;if(on&&me0&&F.some(f=>f.m===m&&(f.na===me0||f.nb===me0))){try{log(`🚧 Bloqueo en la ruta ${({ter:'terrestre',mar:'marítima',aer:'aérea'})[m]}: los envíos por esa vía se retrasan o se pierden más este mes.`,'bad');}catch(e){}}}
  const me=P&&P.alive&&G.regions[P.r]?natOf(P).id:null;const warN={};const isW=id=>warN[id]!=null?warN[id]:(warN[id]=warsOf(id).length>0);
  const nc={};for(const f of F){const c=lgCarrier(f);if(!c.p)nc[c.id]=(nc[c.id]||0)+1;}
  for(const f of F){const c=lgCarrier(f);const w=isW(f.na)||isW(f.nb)?1.8:1;const sc=(1+2*Math.max(0,1-c.e))*w*BQ[f.m];const pl=.005*sc,pd=.035*sc;const u=h21(f.id+'|'+t+'|lg');
    const ev=u<pl?2:u<pl+pd?1:0;
    if(c.p){const b=c.b;const g=lgBiz(b);const m=b.m&&b.m[b.m.length-1];const rv=m?m.rev:0;
      if(ev===2){g.y.ls++;b.cash=Math.max(0,(b.cash||0)-.03*rv);b.rep=clamp((b.rep||50)-1.5,0,100);if(b.lg.lw!==t){b.lg.lw=t;try{log(`📦 ${b.n} pierde un envío de ${lgGood(f.k)} en la ruta ${RG[f.a].nm} → ${RG[f.b].nm}: pagas el seguro y baja tu reputación.`,'bad');}catch(e){}}}
      else if(ev===1){g.y.dl++;b.rep=clamp((b.rep||50)-.3,0,100);}else g.y.ok++;}
    else{const a=L.ai[c.id];if(a){if(a.y!==Y){a.y=Y;a.ok=0;a.dl=0;a.ls=0;}const q=1/(nc[c.id]||1);if(ev===2){a.ls++;a.e-=.3*q;}else if(ev===1){a.dl++;a.e-=.08*q;}else a.ok++;}}
    if(ev){dl.push([f.id,ev]);if(me&&(f.na===me||f.nb===me)&&(ev===2||c.p))L.ev.push([t,f.id,ev,c.id]);}}
  for(const id in L.ai){const a=L.ai[id];a.e=clamp(a.e+(1.07-a.e)*.06+(h21(id+'|'+t+'|e')-.5)*.02,.6,1.25);const m=LGA[id]&&LGA[id][2];if(m){em[m][0]+=a.e;em[m][1]++;}}
  for(const m in em)L.em[m]=em[m][1]?em[m][0]/em[m][1]:1;
  L.dl=dl.slice(0,60);if(L.ev.length>14)L.ev.splice(0,L.ev.length-14);}
})();
