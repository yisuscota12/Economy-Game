/* ===== v1.8a — motor (fase 1 de la ruta 9d) ===== */

/* ---------- divisa de visualización (CURV) ----------
   'loc' = moneda de tu país (tu dinero) y dólares para las cifras nacionales; 'usd' = todo en dólares;
   un código ('EUR', 'JPY'…) = todo lo que se muestra en dinero —tu dinero y las cifras nacionales— en esa moneda, sin importar tu país.
   Solo cambia cómo se muestra: los ahorros siguen en la moneda de tu país (curSync, impuestos y precios no cambian).
   Si la moneda elegida desaparece (reforma, euro), se vuelve a la de tu país. */
function curView(){return CURV&&CURV!=='loc'&&CURV!=='usd'&&G&&G.cx&&G.cx[CURV]?CURV:null;}
{const _f=fmt;fmt=function(v){const c=curView();if(!c||!P)return _f(v);const n=G.nations[P._cur]||natOf(P);if(!n||!n.D)return _f(v);return fmtC(v*usdPerInt(n)*fxOf(c),c);};}
{const _n=fmtN;fmtN=function(v){const c=curView();if(!c)return _n(v);return fmtC((isFinite(v)?v:0)*fxOf(c),c);};}

/* ---------- renombrar casi todo ----------
   G.ren[clave] = nombre nuevo; G.ren0[clave] = nombre original (para restaurar). Clave = «categoría:id».
   Objetos que viven en la partida (países, empresas de bolsa, tus empresas, tu banco, clubes, compañías de espectáculo) se cambian en su lugar;
   tablas fijas del juego (secretarías, ligas, organismos, promotoras, bancos globales) se sobrescriben al cargar cada partida (renApply).
   Un nombre cambiado no se traduce: se muestra tal como lo escribiste. */
const REN_FIX={ // tablas fijas: [arreglo, índice → get/set]
  min:{L:()=>MINS,g:(x)=>x.n,s:(x,v)=>{x.n=v;}},
  lg:{L:()=>FT_LG,g:x=>x[1],s:(x,v)=>{x[1]=v;}},
  org:{L:()=>CB_ORG,g:x=>x[1],s:(x,v)=>{x[1]=v;}},
  cblg:{L:()=>CB_LG,g:x=>x[1],s:(x,v)=>{x[1]=v;}},
  prom:{L:()=>CB_PROM,g:x=>x[0],s:(x,v)=>{x[0]=v;}},
  gbk:{L:()=>GBANKS,g:x=>x[1],s:(x,v)=>{x[1]=v;}}};
const REN_ORIG={};for(const c in REN_FIX)REN_ORIG[c]=REN_FIX[c].L().map(x=>REN_FIX[c].g(x));
const REN={g:null};
function renApply(){if(!G)return;for(const c in REN_FIX){const F=REN_FIX[c],L=F.L();L.forEach((x,i)=>F.s(x,REN_ORIG[c][i]));}
  const R=G.ren||{};for(const k in R){const [c,id]=k.split(/:(.*)/);const F=REN_FIX[c];if(F){const x=F.L()[+id];if(x)F.s(x,R[k]);}}REN.g=G;}
// objeto de la partida para cada clave (o null)
function renObj(k){const i=k.indexOf(':'),c=k.slice(0,i),id=k.slice(i+1);try{
  if(c==='nat'){const n=G.nations[id];return n?{g:()=>n.name,s:v=>{n.name=v;}}:null;}
  if(c==='mk'){const x=G.mk&&G.mk.C[id];return x?{g:()=>x.nm,s:v=>{x.nm=v;}}:null;}
  if(c==='biz'){const b=id==='0'?P.biz:(P.bzx||[])[+id-1];return b?{g:()=>b.n,s:v=>{b.n=v;}}:null;}
  if(c==='own'){const b=P.bank;return b?{g:()=>b.nm,s:v=>{b.nm=v;}}:null;}
  if(c==='club'){const x=G.ft&&G.ft.C[id];return x?{g:()=>x.n,s:v=>{x.n=v;}}:null;}
  if(c==='fmco'){const [kk,ci]=id.split('|');const W=G.fm&&G.fm.W&&G.fm.W[kk];const x=W&&W.C[ci];return x?{g:()=>x.n,s:v=>{x.n=v;}}:null;}
  if(c==='bank')return {g:()=>(G.ren||{})[k]||null,s:()=>{}};
  const F=REN_FIX[c];if(F){const x=F.L()[+id];return x?{g:()=>F.g(x),s:v=>F.s(x,v)}:null;}}catch(e){}return null;}
function renSet(k,v){v=String(v||'').trim().slice(0,30);const o=renObj(k);if(!o||!v)return false;G.ren=G.ren||{};G.ren0=G.ren0||{};
  const cur=o.g();if(!(k in G.ren0))G.ren0[k]=k.startsWith('bank:')?(REN.bn&&REN.bn[k])||cur:cur;
  if(v===G.ren0[k]){return renReset(k);}G.ren[k]=v;o.s(v);return true;}
function renReset(k){const o=renObj(k);if(!G.ren0||!(k in G.ren0))return false;if(o)o.s(G.ren0[k]);delete G.ren[k];delete G.ren0[k];return true;}
// bancos generados al vuelo (cajas, regionales, nacionales y los que cotizan) llevan el nombre nuevo en la lista
{const _bl=bankList;bankList=function(p){const L=_bl(p);const R=G&&G.ren;REN.bn=REN.bn||{};L.forEach(b=>{const k='bank:'+b.id;if(!R||!R[k])REN.bn[k]=b.nm;else b.nm=R[k];});return L;};}

/* ---------- diálogos menos repetitivos, menos invasivos y con impacto ----------
   1) Separación mínima entre diálogos con causa (45 % del intervalo medio según la frecuencia elegida: normal ≈ 20 días);
      la suerte y la mala suerte siguen con su probabilidad real, pero no antes de 5 días tras otro diálogo.
   2) Menos repetición: el peso causal de un diálogo baja ×0.7 por cada vez que salió en los últimos 3 años, y ×0.4 si su categoría salió hace menos de 45 días.
   3) Bandeja: los diálogos que pueden esperar (familia, amigos, trabajo, negocio, inversión, fama) ya no detienen el reloj:
      quedan pendientes hasta 30 días (botón 💬 en el reloj; máximo 4). Al llegar el plazo, la conversación aparece sola y puedes atenderla o ignorarla;
      ignorarla tiene consecuencia: la persona lo toma a mal (−6 de relación) o la oportunidad se pierde. En el avance de 5 años, las pendientes vencen solas.
      Política, gobierno, salud, deporte, suerte y mala suerte siguen interrumpiendo (son urgentes o dependen de la fecha).
   4) Impacto: tu vida social (relación media con pareja, hijos, padres, hermanos y amistades, y los rencores) mueve tu ánimo cada mes. */
const DQ_CAT=new Set(['familia','amigos','trabajo','negocio','inversión','fama']);const DQ_DAYS=30,DQ_MAX=4;let DQ_NOTE=null;
const dqOn=()=>{try{return CFG.dbx!==0;}catch(e){return true;}};
function dVar(p,d){const now=absDay();const h=((p.dh||{})[d.id]||[]).filter(t=>now-t<1095);let f=Math.pow(.7,h.length);const lc=p.dcat&&p.dcat[d.cat];if(lc!=null&&now-lc<45)f*=.4;return f;}
function dWrapW(d){if(!d||d.luck||d._v18||typeof d.w!=='function')return;const w0=d.w;d.w=function(p,n){const w=w0.call(this,p,n);return w>0?w*dVar(p,d):w;};d._v18=1;}
DLG.forEach(dWrapW);
{const _sd=startDialog;startDialog=function(p,d,c0){const ok=_sd(p,d,c0);if(ok&&!d.luck){const now=absDay();p.dh=p.dh||{};const h=(p.dh[d.id]=p.dh[d.id]||[]);h.push(now);if(h.length>6)h.shift();p.dcat=p.dcat||{};p.dcat[d.cat]=now;}if(ok)p.dLast=absDay();return ok;};}
function dLuckOnly(days){const p=P,n=natOf(p);for(const d of DLG){if(!d.luck||onCool(p,d))continue;let py=0;try{py=d.luck(p,n)||0;}catch(e){}if(py<=0)continue;const pr=1-Math.pow(1-py,days/365);
  if(Math.random()<pr){const roll=RI(1,100);if(startDialog(p,d,{py,roll}))return RI(1,days);}}return 0;}
{const _dr=dlgRoll;dlgRoll=function(days){const p=P;if(!p||!p.alive||p.dlg||p.event||p.age<5||(G.calls&&G.calls.length)||G.offer)return 0;
  // una conversación pendiente que llega a su plazo ya no espera: aparece ese día (con la opción de ignorarla)
  const due=dqDue(p,days);if(due)return due;
  const since=absDay()-(p.dLast==null?-1e9:p.dLast);if(since<365/dlgRate()*.45)return since<5?0:dLuckOnly(days);
  const k=_dr(days);const D=p.dlg;if(k&&D&&dqOn()&&!D.res&&(p.dq||[]).length<DQ_MAX){const d=DLG.find(x=>x.id===D.id);if(d&&!d.luck&&DQ_CAT.has(d.cat)&&D.node===(d.start||'a')){
    p.dq=p.dq||[];const t=absDay()+k;const c=Object.assign({},D.c);delete c.npc;p.dq.push({id:D.id,node:D.node,ref:D.ref,c,cat:d.cat,t,exp:t+DQ_DAYS});p.dlg=null;DQ_NOTE=d.title||'';return k;}}
  return k;};}
function dqDue(p,days){if(!p.dq||!p.dq.length)return 0;const now=absDay();let it=null;for(const x of p.dq)if(x.exp<now+days&&(!it||x.exp<it.exp))it=x;if(!it)return 0;
  p.dq.splice(p.dq.indexOf(it),1);const d=DLG.find(x=>x.id===it.id);if(!d||(it.ref&&!nget(p,it.ref)))return 0;let w=0;try{w=d.w(p,natOf(p));}catch(e){w=0;}if(!(w>0))return 0;
  p.dlg={id:it.id,node:it.node,ref:it.ref,c:it.c,res:null,q:{t:it.t,exp:it.exp,cat:it.cat},due:1};return clamp(it.exp-now,1,days);}
// ignorar una conversación (o dejarla vencer en el avance de 5 años): la persona lo toma a mal o la oportunidad se pierde
function dqExpire(p,it){const i=(p.dq||[]).indexOf(it);if(i>=0)p.dq.splice(i,1);const d=DLG.find(x=>x.id===it.id);const x=nget(p,it.ref);
  if(x&&x.alive!==false){x.rel=clamp((x.rel==null?50:x.rel)-6,0,100);if(npcTrait(x)==='rencoroso')x.ren=(x.ren||0)+1;(x.hist=x.hist||[]).push({y:G.year,t:'no le respondiste'});if(x.hist.length>8)x.hist.shift();
    log(`💬 No atendiste a tiempo a ${x.name}, que lo tomó a mal.`,'bad');}
  else log(`💬 Dejaste pasar una conversación: «${d&&d.title||''}». La oportunidad se perdió.`,'');}
function dqTick(){const p=P;if(!p||!p.alive||!p.dq||!p.dq.length)return;const now=absDay();p.dq.slice().forEach(it=>{if(it.exp<=now)dqExpire(p,it);});}
// el diálogo abierto vuelve a la bandeja (si no ha vencido) o se ignora con su consecuencia
function dqLater(){const p=P,D=p.dlg;if(!D||!D.q||D.res)return false;if(D.due){dqExpire(p,{id:D.id,ref:D.ref});}else{const c=Object.assign({},D.c);delete c.npc;(p.dq=p.dq||[]).push({id:D.id,node:D.node,ref:D.ref,c,cat:D.q.cat,t:D.q.t,exp:D.q.exp});}p.dlg=null;return true;}
// abrir una conversación pendiente (si la causa ya pasó, se descarta)
function dqOpen(i){const p=P;const it=(p.dq||[])[i];if(!it||p.dlg||p.event)return 'busy';p.dq.splice(i,1);const d=DLG.find(x=>x.id===it.id);if(!d)return 'gone';
  if(it.ref&&!nget(p,it.ref))return 'gone';let w=1;try{const n=natOf(p);p._dqOpen=1;w=d.w(p,n);}catch(e){w=0;}p._dqOpen=0;if(!(w>0))return 'gone';
  p.dlg={id:it.id,node:it.node,ref:it.ref,c:it.c,res:null,q:{t:it.t,exp:it.exp,cat:it.cat}};return 'ok';}
// vida social: cada mes mueve el ánimo según tus relaciones cercanas y los rencores
function socialNow(p){let S=0,W=0,R=0;const add=(x,w)=>{if(!x||x.alive===false)return;S+=(x.rel==null?50:x.rel)*w;W+=w;};add(p.partner,2);(p.children||[]).slice(0,3).forEach(x=>add(x,1));(p.parents||[]).forEach(x=>add(x,1));
  (p.siblings||[]).forEach(x=>add(x,.5));(p.ppl||[]).filter(x=>x.k==='amigo').slice(0,4).forEach(x=>add(x,.5));dPeople(p).forEach(x=>{R+=x.ren||0;});
  const avg=W?S/W:null;let e=avg==null?(p.age>=18?-.3:0):clamp((avg-60)/25,-1,1)*.5;if(R>=3)e-=.2;return {avg,e:Math.round(e*100)/100,R,W};}
function socialMonth(p){if(!p||!p.alive||p.age<6)return;const s=socialNow(p);p.s.felicidad=clamp(p.s.felicidad+s.e,0,100);p.vsx=s.e;p._vsm=(p._vsy===G.year?(p._vsm||0):monthOfDay(Math.max(0,(G.day||1)-1)))+1;p._vsy=G.year;}
{const _mt=monthTick;monthTick=function(a){const r=_mt(a);try{socialMonth(P);}catch(e){}return r;};}
// el avance de 5 años cierra años sin meses: se aplican los meses que falten
{const _ag=ageUp;ageUp=function(){const p=P;try{if(p&&p.alive){const done=p._vsy===G.year?(p._vsm||0):0;for(let i=done;i<12;i++)socialMonth(p);}dqTick();}catch(e){}const r=_ag();if(p){p._vsm=0;p._vsy=G.year;}return r;};}

// un diálogo guardado cuya causa ya no existe (por ejemplo, perdiste el empleo) no debe romper la ventana: se descarta
{const _dn=dlgNode;dlgNode=function(p){try{return _dn(p);}catch(e){if(p)p.dlg=null;return null;}};}
