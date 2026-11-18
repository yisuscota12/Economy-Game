/* ===== v1.7s (etapa D del plan): fútbol mánager — motor =====
   1. Cada club tiene un entrenador (DT) con estilo táctico y calidad: el choque de estilos y la calidad del DT mueven poco la fuerza de cada partido
      (la tabla de estilos es antisimétrica, así que el promedio de goles y empates no cambia). Los DT se destituyen por malos resultados, se retiran,
      se los llevan clubes más grandes y llegan nuevos (algunos son exfiguras). Encaje táctico del futbolista con el estilo de su DT.
   2. Modelos de negocio (comprador, vendedor, de cantera, equilibrado), valores y sueldos por liga y un mercado de fichajes con dos ventanas.
   3. Ser dueño de un club (P.ftc, aparte de la carrera: sigue después del retiro): comprarlo o fundarlo, estadio, centro de entrenamiento, academia,
      permisos de obra, licencia de la liga, masa salarial, boletos, fichajes, ofertas por tus figuras, DT o dirigirlo tú (licencias de entrenador en P.ftl),
      finanzas mes a mes y objetivos de la temporada. */
const FT_TNORM=.99;
const ftcU=v=>fmt(toInt(v,'USD'));
const ftStyK=k=>FT_STY.find(s=>s[0]===k)||FT_STY[5];
const ftStyN=k=>ftStyK(k)[1];
function ftRc(c){const W=FTW();const L=c&&c.l&&W.L[c.l];return L?(L.t===1?L.rich:L.rich*.5):.15;}
const ftWinOpen=()=>{const m=FTW().cm;return (m>=5&&m<=7)||m===0;};
const ftcMine=cid=>!!(typeof P!=='undefined'&&P&&P.ftc&&P.ftc.c===cid);
const ftCSty=c=>{const d=c&&c.dt&&FTW().D[c.dt];return d?d.s:'equ';};
function ftDTq(d){return d.me?(P&&P.ftl?P.ftl.q:45):d.q;}

/* ----- entrenadores ----- */
function ftStyPick(r){const t=clamp((r-55)/30,0,1);return wpick({pos:.8+2.2*t,pre:.8+1.7*t,con:2-t,blo:2.5-2.2*t,dir:2-1.5*t,equ:2});}
function ftDTNew(W,nat,q,g,s,nm){const id='d'+(W.nx++);const cu=cultOf(nat);W.D[id]={i:id,n:nm||(rndFirst('M',cu)+' '+rndSur(cu)),c:nat,s:s||ftStyPick(q),q:+clamp(q,35,95).toFixed(1),g:g||RI(38,62),cl:null,y0:W.cy,m:0,w:0,e:0,l:0,h:[]};return W.D[id];}
function ftDTNat(c){return chance(.7)||!G.nations?c.c:ftStarNat(c.c);}
function ftDTSal(d,c){return Math.round(2.5e5*Math.exp((ftDTq(d)-60)*.1)*(.6+.4*ftRc(c))/1e3)*1e3;}
function ftDTB(c){const W=FTW();const d=c.dt&&W.D[c.dt];if(!d)return -1;return clamp((ftDTq(d)-c.r)*.06,-1.8,1.8)-(1-(c.af==null?1:c.af))*4;}
function ftDTRec(c,gf,ga){const d=c.dt&&FTW().D[c.dt];if(!d)return;if(gf>ga)d.w++;else if(gf<ga)d.l++;else d.e++;}
function ftDTLeave(d){const W=FTW();const c=d.cl&&W.C[d.cl];if(c&&c.dt===d.i){d.h.push([c.n,d.y0,W.cy,d.w,d.e,d.l]);if(d.h.length>5)d.h.shift();c.dt=null;}d.cl=null;d.m=0;d.w=d.e=d.l=0;}
// pone a d como DT de c; si d trabajaba en otro club, ese club contrata a alguien de la bolsa
function ftDTSet(c,d){const W=FTW();const old=c.dt&&W.D[c.dt];const prevS=old?old.s:null;if(old){ftDTLeave(old);if(old.me)delete W.D[old.i];}
  let oc=null;if(d.cl&&W.C[d.cl]&&d.cl!==c.i){oc=W.C[d.cl];ftDTLeave(d);}
  d.cl=c.i;d.y0=W.cy;d.m=0;d.w=d.e=d.l=0;c.dt=d.i;c.af=prevS&&prevS!==d.s?.6:Math.min(c.af==null?1:c.af,.92);delete c.dts;
  if(oc&&!oc.dt)ftDTSet(oc,ftDTPick(oc));
  const fb=typeof fbOf==='function'&&P?fbOf(P):null;if(fb&&fb.cl===c.i&&!W.quiet)fbNewDT(P,d);return d;}
function ftDTPick(c){const W=FTW();const rc=ftRc(c);const cap=c.r+5+rc*3;let best=null,bs=-1e9;
  for(const id in W.D){const d=W.D[id];if(d.cl||d.me||d.q>cap)continue;const s=d.q+R(-3,3);if(s>bs){bs=s;best=d;}}
  if(!best||best.q<c.r-12)best=ftDTNew(W,ftDTNat(c),c.r-R(1,7));return best;}
function ftDTEnsure(W){for(const id in W.C){const c=W.C[id];if(!c.dt||!W.D[c.dt]){c.dt=null;const d=ftDTNew(W,ftDTNat(c),c.r+gz()*4);d.cl=c.i;d.y0=W.cy-RI(0,4);c.dt=d.i;c.af=1;}if(!c.mo)c.mo=c.l?'equ':'ven';}}
function ftDTPool(W){let free=0;for(const id in W.D)if(!W.D[id].cl&&!W.D[id].me)free++;const tgt=Math.max(30,Math.round(Object.keys(W.C).length*.15));
  while(free<tgt){ftDTNew(W,ftStarNat(pick(Object.values(W.L)).c),R(46,76),RI(36,50));free++;}}
function ftDTSack(c,end){const W=FTW();const d=W.D[c.dt];if(!d||d.me)return;const nd=ftDTPick(c);const pj=d.w+d.e+d.l;
  if(end)ftNews(`${c.n} no renueva a su entrenador, ${d.n}, tras una mala temporada. Su reemplazo: ${nd.n} (${ftStyN(nd.s)}).`,[c.c,d.c],c.r>=82);
  else ftNews(`${c.n} destituye a su entrenador, ${d.n}, después de ${pj} partidos por los malos resultados. Su reemplazo: ${nd.n} (${ftStyN(nd.s)}).`,[c.c,d.c],c.r>=82);
  ftDTSet(c,nd);c.sk=W.cy;}
function ftExpIdx(c){const W=FTW();const L=W.L[c.l];if(!L)return 0;let k=0;for(const x of L.cl)if(x!==c.i&&W.C[x].r>c.r)k++;return k;}
function ftPosIdx(c){const W=FTW();const L=W.L[c.l];if(!L)return 0;const T=L.ph==='off'&&L.fin?L.fin:ftTable(L);const i=T.indexOf(c.i);return i<0?ftExpIdx(c):i;}
function ftDTMonth(W){for(const id in W.C){const c=W.C[id];if(c.af!=null&&c.af<1)c.af=Math.min(1,c.af+.07);const d=c.dt&&W.D[c.dt];if(d)d.m++;}
  for(const L of Object.values(W.L)){if(L.ph!=='reg'||L.md<L.nmd*.3||L.md>=L.nmd-2)continue;const T=ftTable(L),n=T.length;
    T.forEach((cid,i)=>{const c=W.C[cid];if(ftcMine(cid)||c.sk===W.cy)return;const p=(i-ftExpIdx(c))/n;if(p>.3&&chance(.04+(p-.3)*.4))ftDTSack(c,false);});}}
function ftDTSeasonEnd(L){const W=FTW();const T=L.fin||ftTable(L),n=T.length;
  T.forEach((cid,i)=>{const c=W.C[cid];const d=c&&W.D[c.dt];if(!d)return;const p=(i-ftExpIdx(c))/n;if(!d.me)d.q=+clamp(d.q+clamp(-p*2.5,-1.5,1.5),35,95).toFixed(1);
    if(ftcMine(cid)||d.me||c.sk===W.cy)return;const rel=L.dn&&i>=n-3;if((rel&&chance(.55))||(p>.25&&chance(.4)))ftDTSack(c,true);});}
// verano: los clubes grandes con un DT por debajo de su nivel se llevan al DT que destaca en un club más chico
function ftDTSummer(W){const Cs=Object.values(W.C).filter(c=>c.l&&!ftcMine(c.i)).sort((a,b)=>b.r-a.r);let n=0;
  for(const c of Cs){if(n>=4)break;const d=W.D[c.dt];if(!d||d.me||d.q>=c.r-3||!chance(.2))continue;
    let best=null;for(const id in W.D){const x=W.D[id];const oc=x.cl&&W.C[x.cl];if(!oc||x.me||ftcMine(oc.i)||oc.r>=c.r-4||x.q<c.r-2||x.q>c.r+6)continue;if(!best||x.q>best.q)best=x;}
    if(!best)continue;const oc=W.C[best.cl];ftNews(`${best.n} deja ${oc.n} y se convierte en el nuevo entrenador de ${c.n} (${ftStyN(best.s)}).`,[c.c,oc.c],c.r>=82);ftDTSet(c,best);n++;}}
function ftDTYear(W,gone){for(const id of Object.keys(W.D)){const d=W.D[id];if(d.me)continue;d.g++;if(d.g>62)d.q=+(d.q-.4).toFixed(1);else if(d.g<45)d.q=+Math.min(95,d.q+R(0,1)).toFixed(1);
    if(!d.cl){if((d.g>=66&&chance(.35))||d.g>=72)delete W.D[id];continue;}
    if((d.g>=68&&chance(.25))||d.g>=73){const c=W.C[d.cl];if(c&&!ftcMine(c.i)){const nd=ftDTPick(c);if(c.r>=75)ftNews(`${c.n} anuncia el retiro de su entrenador, ${d.n}. Su reemplazo: ${nd.n} (${ftStyN(nd.s)}).`,[c.c],false);ftDTSet(c,nd);delete W.D[id];}}}
  (gone||[]).forEach(s=>{if(s.r>=78&&chance(.3))ftDTNew(W,s.c,52+(s.r-78)*.8+R(-4,6),s.g+1,null,s.n);});ftDTPool(W);}

/* ----- partidos: estilo y DT ----- */
ftPlay=function(h,a,neu,rh,ra){rh=rh!=null?rh:ftR(h);ra=ra!=null?ra:ftR(a);const W=FTW();let tf=1;const ch=W&&W.D&&W.C[h],ca=ch&&W.C[a];
  if(ch&&ca){const sh=ftCSty(ch),sa=ftCSty(ca);const mu=(FT_MU[sh+sa]||0)-(FT_MU[sa+sh]||0);rh+=mu+ftDTB(ch);ra+=-mu+ftDTB(ca);tf=Math.sqrt(ftStyK(sh)[4]*ftStyK(sa)[4])/FT_TNORM;}
  const d=(rh-ra)/26;const x=ftPois(tf*1.32*Math.exp(d+(neu?0:.12))),y=ftPois(tf*1.1*Math.exp(-d-(neu?0:.05)));
  if(ch&&ca){ftDTRec(ch,x,y);ftDTRec(ca,y,x);const o=P&&P.ftc;if(o&&(h===o.c||a===o.c))ftcMatch(o,h===o.c,h===o.c?x:y,h===o.c?y:x);}
  if(W&&!W.quiet){const k=W.tk&&(h===W.tk||a===W.tk)?W.tk:W.tn&&(h===W.tn||a===W.tn)?W.tn:null;if(k)(W.mr=W.mr||[]).push(h===k?[x,y,a,FT_COMP,1,k===W.tn?1:0]:[y,x,h,FT_COMP,0,k===W.tn?1:0]);}return [x,y];};

/* ----- valores, sueldos y modelos de negocio ----- */
function ftSV(s){const c=FTW().C[s.cl];const r=s.r;let v=r<55?2e4*Math.exp((r-40)*.15):r<88?3e5*Math.exp((r-60)*.2):3e5*Math.exp(5.6+(r-88)*.1);const a=s.g;v*=a<=21?1.4:a<=26?1.2:a<=29?1:a<=31?.7:.4;v*=.6+.4*ftRc(c);if(s.pt>r+8&&a<=21)v*=1.25;return Math.round(v/1e4)*1e4;}
function ftSW(s,c){c=c||FTW().C[s.cl];const rc=ftRc(c);return Math.max(rc*2.4e4+1.2e4,Math.round(ftSV(s)*.11*(.6+.4*rc)/1e3)*1e3);}
function ftMoInit(W){for(const L of Object.values(W.L)){const T=L.cl.map(x=>W.C[x]).sort((a,b)=>b.b-a.b);const n=T.length;
    T.forEach((c,i)=>{if(c.moI||ftcMine(c.i))return;c.moI=1;const top=L.rich>=1?.3:L.rich>=.9?.2:.15;
      c.mo=i<n*top?(L.rich>=.6||L.t===2?'com':'ven'):chance(.32)?'can':chance(L.rich>=1?.3:.45)?'ven':'equ';});}
  for(const c of Object.values(W.C))if(!c.l){c.mo='ven';c.moI=1;}}
// mercado de fichajes de la IA (reemplaza al de la v1.6c): dos tandas en verano y una chica en invierno
function ftXfer(s,from,to,fee){const W=FTW();FT_SC=null;s.cl=to.i;to.b=+(to.b-fee/1e6*.35).toFixed(1);from.b=+(from.b+fee/1e6*.5).toFixed(1);
  if(!ftcMine(to.i))to.r=+clamp(to.r+clamp((s.r-to.r)*.06,0,.6),40,95).toFixed(1);if(!ftcMine(from.i))from.r=+clamp(from.r-clamp((s.r-from.r)*.06,0,.6),40,95).toFixed(1);
  (W.mk=W.mk||[]).push([W.cy,W.cm,s.n,s.c,s.po,s.g,Math.round(s.r),from.i,to.i,+(fee/1e6).toFixed(1),from.n,to.n]);if(W.mk.length>90)W.mk.shift();
  ftNews(`Fichaje: ${s.n} (${ftNm(s.c)}) deja ${from.n} y firma con ${to.n} por US$${+(fee/1e6).toFixed(1)} M.`,[s.c,from.c,to.c],s.r>=86);}
function ftBuyers(c,s,fee){const W=FTW();return Object.values(W.C).filter(x=>x.l&&W.L[x.l]&&x.i!==c.i&&!ftcMine(x.i)&&(x.r>=c.r+1||(s.g>=29&&(x.c==='SAU'||x.c==='USA')))&&s.r>=x.r-5&&x.b*1e6*.6>=fee&&ftStarsOf(x.i).length<6);}
function ftMarket(nmax){const W=FTW();FT_SC=null;const S=Object.values(W.S).filter(s=>s.r>=70&&s.g<=32&&!ftcMine(s.cl)).sort((a,b)=>b.r-a.r);let n=0;
  for(const s of S){if(n>=nmax)break;const c=W.C[s.cl];if(!c)continue;const mo=FT_MO[c.mo]||FT_MO.equ;const out=s.r-c.r;let pw=mo[3]+out/25+(s.g>=29?.05:0);if(out<-2)pw*=.3;
    if(!chance(clamp(pw,0,.85)*.35))continue;const fee=Math.round(ftSV(s)*mo[2]*R(.9,1.15)/1e5)*1e5;const T=ftBuyers(c,s,fee);if(!T.length)continue;
    const w={};T.forEach(x=>{w[x.i]=(FT_MO[x.mo]||FT_MO.equ)[4]*Math.pow(x.r/70,4)*(x.c===c.c?1.3:1);});ftXfer(s,c,W.C[wpick(w)],fee);n++;}}
ftAITransfers=function(){ftMarket(8);};

/* ===================== TU CLUB ===================== */
function ftcLowest(nid){const Ls=Object.values(FTW().L).filter(L=>L.c===nid);return Ls.sort((a,b)=>b.t-a.t)[0]||null;}
function ftTVBase(c){const W=FTW();const L=c.l&&W.L[c.l];if(!L)return 0;const t=FT_TV[L.c];return (t?t[L.t-1]:(L.t===1?.4+6*L.rich:.2+L.rich))*1e6;}
function ftcPrice(c,lv){const rc=ftRc(c);return (22+rc*35)*(.7+.3*clamp((c.r-50)/30,0,1))*FTC_PR[lv][1];}
function ftcDem(c,mood,lv){const rc=ftRc(c);return (10+Math.max(0,c.r-52)*1.7+Math.sqrt(Math.max(0,c.fa))*6)*(.65+rc*.3)*1000*(.6+.8*mood/100)*FTC_PR[lv][2];}
function ftcHome(c){const L=FTW().L[c.l];return L?L.nmd/2+2:14;}
function ftcRev(c,o){o=o||{};const W=FTW();const mood=o.mood!=null?o.mood:55,lv=o.pr!=null?o.pr:1;const L=W.L[c.l];const n=L?L.cl.length:1;const pos=o.pos!=null?o.pos:ftExpIdx(c);
  const att=Math.min(c.st,ftcDem(c,mood,lv));const tk=att*ftcPrice(c,lv)*ftcHome(c);const tv=ftTVBase(c)*(.75+.5*(1-pos/Math.max(1,n-1)));const rc=ftRc(c);
  const co=(c.fa*1e6*(1.2+1.8*rc)+3e6*rc)*(.8+.4*mood/100);return {tk,tv,co,att,t:tk+tv+co};}
function ftcVal(c){const r=ftcRev(c);const rc=ftRc(c);const sv=ftStarsOf(c.i).reduce((a,s)=>a+ftSV(s),0);const o=ftcMine(c.i)?P.ftc:null;
  return Math.max(2e5,Math.round((r.t*(.8+Math.max(0,c.r-62)*.1)*(.6+.4*rc)+c.st*800*(.5+rc)+sv*.4+(o?o.fx*.5:0))/1e5)*1e5);}
function ftcAsk(c){return Math.round(ftcVal(c)*(1.05+Math.max(0,c.r-75)*.015)/1e5)*1e5;}
var FTC_LC={};function ftcLgWB(L){const W=FTW();const k=L.i+'|'+(W.cy*12+W.cm);if(FTC_LC[L.i]&&FTC_LC[L.i][0]===k)return FTC_LC[L.i][1];
  const cs=L.cl.map(x=>W.C[x]).filter(c=>c&&!ftcMine(c.i));const v=cs.reduce((a,c)=>a+ftcRev(c).t*.55,0)/Math.max(1,cs.length);FTC_LC[L.i]=[k,v];return v;}
function ftcBase(o,c){const W=FTW();const L=W.L[c.l];if(L)return ftcLgWB(L)*.8*FTC_WK[o.wk][1];const LL=ftcLowest(c.c);return (LL?ftcLgWB(LL)*.15:2e5)*.8*FTC_WK[o.wk][1];}
function ftcStarW(c){return ftStarsOf(c.i).reduce((a,s)=>a+ftSW(s,c),0);}
function ftcDTSal(c){const d=c.dt&&FTW().D[c.dt];return !d||d.me?0:(c.dts||ftDTSal(d,c));}
function ftcWages(o,c){return ftcBase(o,c)+ftcStarW(c)+ftcDTSal(c);}
function ftcOps(o,c,rev){const rc=ftRc(c);const k=(.4+.6*rc)*1e6;return (c.l?.16*rev+c.st*30*(.5+rc):c.st*6+.1*rev)+FTC_CEN[o.cen][2]*k+FTC_ACA[o.aca][2]*k;}
// fuerza objetivo: la masa salarial te coloca en la tabla de gasto de tu liga (la misma regla que siguen los clubes de la IA con su presupuesto)
function ftcTgt(o,c){const W=FTW();const L=W.L[c.l];const sp=ftcBase(o,c)+ftcStarW(c);let t;
  if(L){const ot=L.cl.filter(x=>x!==c.i).map(x=>ftcRev(W.C[x]).t*.44+ftcStarW(W.C[x])).sort((a,b)=>b-a);let i=ot.findIndex(v=>sp>v);if(i<0)i=ot.length;const n=L.cl.length;const rg=L.rng||[48,64];
    t=rg[0]+(rg[1]-rg[0])*Math.pow(1-i/Math.max(1,n-1),1.5);if(i===0&&ot.length)t+=clamp(Math.log(sp/ot[0])*4,0,4);if(i===ot.length&&ot.length)t-=clamp(Math.log(ot[ot.length-1]/Math.max(1,sp))*4,0,6);}
  else{const LL=ftcLowest(c.c);const ref=LL?ftcLgWB(LL)*.15:2e5;t=40+12*clamp(sp/ref,0,1.4);}
  return t+o.cen*.5;}
function ftcLicMin(L){return L.t===1?Math.round((8000+L.rich*6000)/500)*500:Math.round((4000+L.rich*3000)/500)*500;}
function ftcLicOK(c,L){const o=P&&P.ftc;return c.st>=ftcLicMin(L)&&(L.t!==1||(o&&o.cen>=1));}
function ftcLicTxt(c,L){let t='';if(c.st<ftcLicMin(L))t+=` Falta un estadio de ${fmtK(ftcLicMin(L))} lugares.`;if(L.t===1&&P.ftc.cen<1)t+=' Falta un centro de entrenamiento.';return t;}
function ftcNew(c,y0){return {c:c.i,y0:y0||G.year,inv:0,fx:0,caja:0,wk:2,pr:1,cen:0,aca:0,mood:55,boost:0,h:[],cur:{vt:0,cp:0},trn:c.tr.length,bids:[],reg:0,hm:0,pts:0,pj:0,ob:null,obh:[],so:null,pm:null,bd:null,rg:null};}
const ftcRow=()=>({tk:0,tv:0,co:0,pz:0,vt:0,sa:0,op:0,cp:0});
function ftcMatch(o,home,gf,ga){if(home)o.hm++;o.pj++;o.pts+=gf>ga?3:gf===ga?1:0;}
function ftcPrize(t){if(/Liga de Campeones|Copa de Campeones/.test(t))return 30e6;if(/Mundial de Clubes/.test(t))return 15e6;if(/Copa/.test(t))return 2e6;return 5e6;}
function ftcWkNear(c){const W=FTW();const L=W.L[c.l];if(!L)return 2;const want=ftcRev(c).t*.55;const base=ftcLgWB(L);let bi=2,bd=1e9;FTC_WK.forEach((w,i)=>{const d=Math.abs(Math.log(want/(base*w[1])));if(d<bd){bd=d;bi=i;}});return bi;}
function ftcObj(c,L){const n=L.cl.length,e=ftExpIdx(c);const z={GBR:4,ESP:4,ITA:4,DEU:4,FRA:3,PRT:3,NLD:2,BRA:6,ARG:5}[L.c]||3;
  if(L.t===2)return e<=2?'asc':e<n/2?'med':L.dn?'sal':'ult';return e===0?'tit':e<z?'top':e<n/2?'med':L.dn?'sal':'ult';}
function ftcObjOK(k,i,L){const n=L.cl.length;const z={GBR:4,ESP:4,ITA:4,DEU:4,FRA:3,PRT:3,NLD:2,BRA:6,ARG:5}[L.c]||3;return k==='tit'?i===0:k==='top'?i<z:k==='asc'?i<3:k==='med'?i<n/2:i<n-3;}

/* ----- el mes de tu club ----- */
function ftcMonth(){const p=P;const o=p&&p.ftc;if(!o)return;const W=FTW();const c=W.C[o.c];if(!c){p.ftc=null;return;}const L=W.L[c.l];const rc=ftRc(c);const m=(W.cm+11)%12;
  // liga regional (club fundado que todavía no entra a la liga)
  if(!L){o.rg=o.rg||{pj:0,w:0,e:0,l:0,gf:0,ga:0};const k=m%2?1:2;for(let i=0;i<k;i++){const d=(c.r+ftDTB(c)-R(40,49))/26;const x=ftPois(1.25*Math.exp(d)),y=ftPois(1.15*Math.exp(-d));const g=o.rg;g.pj++;g.gf+=x;g.ga+=y;if(x>y)g.w++;else if(x<y)g.l++;else g.e++;if(i===0)o.hm++;o.pj++;o.pts+=x>y?3:x===y?1:0;}o.reg++;}
  const pos=L?ftPosIdx(c):0;const R0=ftcRev(c,{mood:o.mood,pr:o.pr,pos});const row=ftcRow();
  const att=Math.min(c.st,ftcDem(c,o.mood,o.pr));row.tk=o.hm*att*ftcPrice(c,o.pr);o.att=Math.round(att);row.tv=R0.tv/12;row.co=R0.co/12;
  if(c.tr.length>o.trn){for(const t of c.tr.slice(o.trn)){const z=ftcPrize(t.t)*(.4+.6*rc);row.pz+=z;log(`🏆 ¡${c.n} gana: ${t.t}! Premio para el club: ${ftcU(z)}.`,'big');o.boost+=15;if(p.s)p.s.felicidad=clamp((p.s.felicidad||50)+6,0,100);}o.trn=c.tr.length;}
  row.sa=ftcWages(o,c)/12;row.op=ftcOps(o,c,R0.t)/12;row.vt=o.cur.vt;row.cp=o.cur.cp;o.cur={vt:0,cp:0};
  o.caja+=row.tk+row.tv+row.co+row.pz-row.sa-row.op;const inc=row.tk+row.tv+row.co+row.pz+row.vt,cost=row.sa+row.op+row.cp;
  o.h.push([W.cy,m,Math.round(inc),Math.round(cost),Math.round(row.tk),Math.round(row.tv),Math.round(row.co),Math.round(row.pz),Math.round(row.vt),Math.round(row.sa),Math.round(row.op),Math.round(row.cp)]);if(o.h.length>24)o.h.shift();
  // fuerza, presupuesto visible para la IA y ánimo de la afición
  c.r=+clamp(c.r+(ftcTgt(o,c)-c.r)*.05+gz()*.1,38,95).toFixed(1);c.b=+(R0.t/1e6).toFixed(1);
  const n=L?L.cl.length:1;const pr=L&&L.ph!=='off'?(pos-ftExpIdx(c))/n:0;const ppg=o.pj?o.pts/o.pj:1.35;
  const tg=clamp(50-pr*70+(ppg-1.35)*14+FTC_PR[o.pr][3]+o.boost,5,100);o.mood=+clamp(o.mood+(tg-o.mood)*.3,5,100).toFixed(1);o.boost*=.75;o.hm=0;o.pj=0;o.pts=0;
  // tú como DT
  const d=W.D[c.dt];if(d&&d.me&&p.ftl){p.ftl.xp++;p.ftl.q=+Math.min(FTL[p.ftl.lv][3],p.ftl.q+.2+(ppg>1.6?.12:0)).toFixed(2);}
  // permisos y obras
  const mi=W.cy*12+W.cm;
  if(o.pm&&mi>=o.pm.t){const x=o.pm;o.pm=null;if(chance(.85)){o.bd={k:x.k,v:x.v,t:mi+x.mo,cost:x.cost};o.caja-=x.cost;o.fx+=x.cost;o.cur.cp+=x.cost;log(`🏗️ El ayuntamiento aprueba el permiso: empieza la obra (${x.mo} meses).`,'good');}
    else log('🏗️ El ayuntamiento rechaza el permiso de obra. Puedes volver a solicitarlo.','bad');}
  if(o.bd&&mi>=o.bd.t){const x=o.bd;o.bd=null;if(x.k==='st'){c.st+=x.v;log(`🏟️ Termina la ampliación: tu estadio ya tiene ${fmtK(c.st)} lugares.`,'good');}else{o.cen=x.v;log(`🏋️ Abre tu nuevo centro de entrenamiento: ${FTC_CEN[x.v][0].toLowerCase()}.`,'good');}}
  // ofertas de otros clubes por tus figuras (solo con la ventana abierta)
  if(ftWinOpen()){if(o.bids.length<4)for(const s of ftStarsOf(c.i)){if(s.r<70||!chance(.18)||o.bids.some(b=>b.s===s.i))continue;const fee=Math.round(ftSV(s)*R(.85,1.25)/1e5)*1e5;const T=ftBuyers(c,s,fee).filter(x=>x.r>=c.r-3);if(!T.length)continue;
      const to=pick(T);o.bids.push({s:s.i,cl:to.i,fee});log(`📨 ${to.n} ofrece ${ftcU(fee)} por ${s.n}. Revisa ⚽ Tu club → Mercado.`,'good');}}
  else o.bids=[];
  if((CB_AUTO||(typeof FF_ON!=='undefined'&&FF_ON))&&o.bids.length){for(const b of o.bids.slice()){const s=W.S[b.s];if(s&&b.fee>=ftSV(s)*1.2)ftcBidAns(o.bids.indexOf(b),true);}}
  // números rojos: el dueño cubre la caja; si no puede, el club entra en administración
  if(o.caja<0){const need=-o.caja,loc=toInt(need,'USD');if(p.dinero>=loc){p.dinero-=loc;o.caja=0;o.inv+=need;o.cvs=(o.cvs||0)+loc;if(mi-(o.cvm||-99)>=3){log(`💵 Pones ${fmt(o.cvs)} de tu bolsillo para cubrir los números rojos de ${c.n}.`,'bad');o.cvs=0;o.cvm=mi;}}
    else if(o.caja<-Math.max(2e6,R0.t*.25)){const v=ftcVal(c)*.5+o.caja;const got=Math.max(0,v);p.dinero+=toInt(got,'USD');log(`⚖️ ${c.n} entra en administración por sus deudas y se vende a un nuevo dueño. Recibes ${fmt(toInt(got,'USD'))}.`,'bad');ftNews(`${c.n} entra en administración y cambia de dueño.`,[c.c],false);ftcRelease(c);}
    else if(!o.warn){o.warn=1;log(`⚠️ ${c.n} está en números rojos y no tienes con qué cubrirlos. Vende figuras, baja la masa salarial o aporta capital.`,'bad');}}else o.warn=0;}
function ftcRelease(c){const W=FTW();c.own=0;const d=c.dt&&W.D[c.dt];if(!d||d.me){if(d){ftDTLeave(d);delete W.D[d.i];}ftDTSet(c,ftDTPick(c));}if(P)P.ftc=null;}
// temporada: objetivo al empezar y evaluación al terminar
function ftcSeasonStart(L){const o=P&&P.ftc;if(!o||!L.cl.includes(o.c))return;const c=FTW().C[o.c];const k=ftcObj(c,L);o.ob={k,y:L.y,L:L.i};log(`🎯 Objetivo de la temporada para ${c.n}: ${FTC_OB[k].toLowerCase()}.`);}
function ftcSeasonEnd(L){const o=P&&P.ftc;if(!o)return;const W=FTW();const c=W.C[o.c];if(!c)return;
  if(L.cl.includes(o.c)&&o.ob&&o.ob.L===L.i){const i=(L.fin||ftTable(L)).indexOf(o.c);const ok=ftcObjOK(o.ob.k,i,L);o.obh.push({y:o.ob.y,k:o.ob.k,ok:ok?1:0,i:i+1,L:L.n});if(o.obh.length>12)o.obh.shift();
    if(ok){o.boost+=12;if(P.s)P.s.felicidad=clamp((P.s.felicidad||50)+5,0,100);log(`✅ ${c.n} cumple el objetivo de la temporada (${FTC_OB[o.ob.k].toLowerCase()}): termina en el lugar ${i+1}.`,'good');}
    else{o.boost-=12;log(`❌ ${c.n} no cumple el objetivo de la temporada (${FTC_OB[o.ob.k].toLowerCase()}): termina en el lugar ${i+1}.`,'bad');}o.ob=null;
    if(L.t===1&&!ftcLicOK(c,L)){const f=ftcRev(c).t*.02;o.caja-=f;log(`⚖️ La liga multa a ${c.n} con ${ftcU(f)} por no cumplir la licencia.`+ftcLicTxt(c,L),'bad');}}
  // club fundado: entra a la liga más baja de su país al terminar la temporada
  if(!c.l&&L.c===c.c&&L===ftcLowest(c.c)){if(o.reg<6){log(`⏳ ${c.n} necesita al menos seis meses en la liga regional antes de pedir su ingreso a la ${L.n}.`);return;}
    if(!ftcLicOK(c,L)){log(`📋 ${c.n} no obtiene la licencia de la ${L.n}.`+ftcLicTxt(c,L),'bad');return;}if(L.t===1&&!o.fran){log(`📋 Para entrar a la ${L.n} necesitas comprar una plaza (franquicia).`);return;}
    const T=L.fin||ftTable(L);const x=T[T.length-1];const xc=W.C[x];L.cl=L.cl.filter(id=>id!==x).concat(c.i);if(xc){xc.l=null;xc.mo='ven';}c.l=L.i;o.reg=0;o.rg=null;o.fran=0;
    ftNews(`${c.n} ingresa a la ${L.n} y ocupa la plaza de ${xc?xc.n:'?'}, que baja a las categorías regionales.`,[c.c],false);log(`🎉 ¡${c.n} entra a la ${L.n}!`,'big');}}
// ascenso con licencia: si tu club no cumple, sube el siguiente
ftSwap=function(L1,L2){if(L1._sw===L1.y&&L2._sw===L2.y)return;const W=FTW();const d=ftTable(L1).slice(-3);const src=L2.fin||ftTable(L2);const u=[];
  for(const c of src){if(u.length>=3)break;if(ftcMine(c)&&!ftcLicOK(W.C[c],L1)){log(`📋 ${W.C[c].n} termina en zona de ascenso, pero no obtiene la licencia de la ${L1.n}. Sube el siguiente.`+ftcLicTxt(W.C[c],L1),'bad');continue;}u.push(c);}
  L1._sw=L1.y;L2._sw=L2.y;L1.cl=L1.cl.filter(c=>!d.includes(c)).concat(u);L2.cl=L2.cl.filter(c=>!u.includes(c)).concat(d);d.forEach(c=>W.C[c].l=L2.i);u.forEach(c=>W.C[c].l=L1.i);
  u.forEach(c=>{if(!ftStarsOf(c).length)ftStars(W,W.C[c],1);});ftNews(`Ascienden a la ${L1.n}: ${u.map(ftCN).join(', ')}. Descienden: ${d.map(ftCN).join(', ')}.`,[L1.c],false);
  const o=P&&P.ftc;if(o){if(u.includes(o.c))log(`🎉 ¡${W.C[o.c].n} asciende a la ${L1.n}!`,'big');if(d.includes(o.c))log(`⬇️ ${W.C[o.c].n} desciende a la ${L2.n}.`,'bad');}};

/* ----- acciones del dueño ----- */
function ftcCanOwn(p){if(!p||p.age<18)return 'Necesitas ser mayor de edad.';if(fbOf(p))return 'Las reglas no permiten que un futbolista en activo sea dueño de un club.';return '';}
function ftcBuy(p,cid){const e=ftcCanOwn(p);if(e)return e;if(p.ftc)return 'Ya eres dueño de un club.';const W=FTW();const c=W.C[cid];if(!c||!c.l)return '';const price=ftcAsk(c),loc=toInt(price,'USD');if(p.dinero<loc)return `Comprar ${c.n} cuesta ${fmt(loc)}.`;
  p.dinero-=loc;const o=ftcNew(c);o.inv=price;o.wk=ftcWkNear(c);o.caja=ftcRev(c).t*.06;o.cen=clamp(Math.round((c.r-52)/8),0,5);o.aca=clamp(Math.round((c.r-54)/9),0,4);p.ftc=o;c.own=1;
  ftNews(`${fullName(p)} compra ${c.n} por ${fmtN(price)}.`,[c.c,natOf(p).id],price>=5e8);return `Compras ${c.n} por ${fmt(loc)}. Ahora decides la masa salarial, los fichajes, las obras y quién dirige al equipo.`;}
function ftcFoundCost(nid){const L=ftcLowest(nid);const rc=L?(L.t===1?L.rich:L.rich*.5):.2;const base=(L?ftcLgWB(L)*.15:2e5)*.8;return {reg:Math.round(2e5*(.4+.6*rc)/1e4)*1e4,cap:Math.round(base*1.1/1e4)*1e4};}
function ftcFound(p,nm,col){const e=ftcCanOwn(p);if(e)return e;if(p.ftc)return 'Ya eres dueño de un club.';const W=ftEnsure();const nid=natOf(p).id;ftEnsureHome(nid);const k=ftcFoundCost(nid);const loc=toInt(k.reg+k.cap,'USD');
  if(p.dinero<loc)return `Fundar un club cuesta ${fmt(loc)}.`;nm=String(nm||'').trim().slice(0,30);if(!nm)return '';if(Object.values(W.C).some(c=>c.n===nm))return 'Ya existe un club con ese nombre.';p.dinero-=loc;
  const id='c'+(W.nx++);const c=W.C[id]={i:id,n:nm,c:nid,l:null,r:44,rg:p.r,b:.3,fa:.01,st:3000,col:col||[pick(FT_COLS),pick(FT_COLS)],tr:[],own:1,mo:'equ',moI:1,af:1};
  const d=ftDTNew(W,nid,R(44,50),RI(35,55));ftDTSet(c,d);const o=ftcNew(c);o.inv=k.reg+k.cap;o.caja=k.cap;o.reg=0;o.f=1;p.ftc=o;const L=ftcLowest(nid);
  return `Fundas ${nm}. Juega en la liga regional y renta un campo municipal de ${fmtK(c.st)} lugares.`+(L?` Para entrar a la ${L.n} necesitas seis meses de competencia y un estadio de ${fmtK(ftcLicMin(L))} lugares.`:'');}
function ftcFranCost(c){const L=ftcLowest(c.c);if(!L)return 0;const v=L.cl.map(x=>ftcVal(FTW().C[x])).sort((a,b)=>a-b);return Math.round(v[Math.floor(v.length/2)]*.35/1e5)*1e5;}
function ftcFran(p){const o=p.ftc,W=FTW(),c=W.C[o.c];const f=ftcFranCost(c);if(o.fran)return 'Ya compraste la plaza.';if(o.caja<f)return `La plaza cuesta ${ftcU(f)} y tu club solo tiene ${ftcU(o.caja)} en caja.`;o.caja-=f;o.fx+=f;o.cur.cp+=f;o.fran=1;
  return `Compras una plaza en la ${ftcLowest(c.c).n} por ${ftcU(f)}. Entrarás al terminar la temporada si cumples la licencia.`;}
function ftcSellClub(p){const o=p.ftc;if(!o)return '';const W=FTW(),c=W.C[o.c];const v=(c.l?ftcVal(c)*R(.92,1.05):o.inv*.5)+o.caja;const loc=toInt(Math.max(0,v),'USD');p.dinero+=loc;
  ftNews(`${fullName(p)} vende ${c.n}.`,[c.c],false);ftcRelease(c);return `Vendes ${c.n}. Recibes ${fmt(loc)} (incluye la caja del club).`;}
function ftcInject(p,usd){const o=p.ftc;const loc=toInt(usd,'USD');if(p.dinero<loc)return `No tienes ${fmt(loc)}.`;p.dinero-=loc;o.caja+=usd;o.inv+=usd;return `Aportas ${fmt(loc)} a la caja del club.`;}
function ftcWithdraw(p,usd){const o=p.ftc;if(o.caja<usd)return 'La caja del club no alcanza.';o.caja-=usd;o.inv-=usd;p.dinero+=toInt(usd,'USD');o.boost-=usd>ftcRev(FTW().C[o.c]).t*.1?4:0;return `Retiras ${fmt(toInt(usd,'USD'))} de la caja del club.`;}
// obras: estadio (siempre con permiso), centro de entrenamiento (permiso desde la ciudad deportiva) y academia
function ftcStCost(c,v){const rc=ftRc(c);return Math.round(v*(2500+3500*rc)/1e4)*1e4;}
function ftcBuild(p,k,i){const o=p.ftc,W=FTW(),c=W.C[o.c];if(o.pm||o.bd)return 'Ya tienes una obra en marcha.';const rc=ftRc(c);const mi=W.cy*12+W.cm;
  if(k==='st'){const [v,mo]=FTC_STX[i];if(c.st+v>100000)return 'El estadio no puede pasar de 100 mil lugares.';const cost=ftcStCost(c,v);if(o.caja<cost*1.01)return `La obra cuesta ${ftcU(cost)} y el permiso ${ftcU(cost*.01)}.`;
    o.caja-=cost*.01;o.cur.cp+=cost*.01;o.pm={k:'st',v,mo,cost,t:mi+RI(2,4)};return `Solicitas el permiso de obra para ampliar el estadio en ${fmtK(v)} lugares. El ayuntamiento responde en 2 a 4 meses.`;}
  if(k==='cen'){const lv=o.cen+1;if(lv>=FTC_CEN.length)return 'Ya tienes el mejor centro.';const cost=FTC_CEN[lv][1]*1e6*(.4+.6*rc);if(o.caja<cost)return `Cuesta ${ftcU(cost)}.`;
    if(FTC_CEN[lv][3]){o.caja-=cost*.01;o.cur.cp+=cost*.01;o.pm={k:'cen',v:lv,mo:6+lv,cost,t:mi+RI(2,4)};return `Solicitas el permiso para construir ${FTC_CEN[lv][0].toLowerCase()}. El ayuntamiento responde en 2 a 4 meses.`;}
    o.bd={k:'cen',v:lv,t:mi+3,cost};o.caja-=cost;o.fx+=cost;o.cur.cp+=cost;return `Empieza la obra: ${FTC_CEN[lv][0].toLowerCase()} (3 meses).`;}
  if(k==='aca'){const lv=o.aca+1;if(lv>=FTC_ACA.length)return 'Ya tienes la mejor academia.';const cost=FTC_ACA[lv][1]*1e6*(.4+.6*rc);if(o.caja<cost)return `Cuesta ${ftcU(cost)}.`;o.caja-=cost;o.fx+=cost;o.cur.cp+=cost;o.aca=lv;
    return `Abres tu ${FTC_ACA[lv][0].toLowerCase()}: cada año pueden salir juveniles con más potencial.`;}
  return '';}
// fichajes del dueño
function ftcFee(s,c){const W=FTW();const sc=W.C[s.cl];return Math.round(ftSV(s)*(FT_MO[sc&&sc.mo]||FT_MO.equ)[2]*(1+Math.max(0,s.r-c.r)/40)/1e5)*1e5;}
function ftcMktList(c,f){const W=FTW();return Object.values(W.S).filter(s=>s.cl!==c.i&&W.C[s.cl]&&(!f||(f==='al'?s.r<=c.r+12:true))).sort((a,b)=>b.r-a.r);}
function ftcBuyStar(p,sid){const o=p.ftc,W=FTW(),c=W.C[o.c],s=W.S[sid];if(!s||s.cl===c.i)return '';if(!ftWinOpen())return 'El mercado está cerrado: abre en junio y en enero.';if(s.r>c.r+12)return `A ${s.n} no le interesa tu proyecto: tu club está muy por debajo de su nivel.`;
  if(ftStarsOf(c.i).length>=10)return 'Tu plantel ya tiene diez figuras.';const fee=ftcFee(s,c);if(o.caja<fee)return `El traspaso cuesta ${ftcU(fee)} y tu club tiene ${ftcU(o.caja)} en caja.`;
  const from=W.C[s.cl];o.caja-=fee;o.cur.cp+=fee;const r0=c.r;ftXfer(s,from,c,fee);c.r=+clamp(r0+clamp((s.r-r0)*.12,0,1.5),38,95).toFixed(1);o.boost+=s.r>=c.r?6:2;
  return `${s.n} firma con ${c.n}: traspaso de ${ftcU(fee)} y sueldo de ${ftcU(ftSW(s,c))} al año.`;}
function ftcSellAsk(p,sid){const o=p.ftc,W=FTW(),c=W.C[o.c],s=W.S[sid];if(!s||s.cl!==c.i)return {t:''};if(!ftWinOpen())return {t:'El mercado está cerrado: abre en junio y en enero.'};
  const fee=Math.round(ftSV(s)*R(.88,1.08)/1e5)*1e5;const T=ftBuyers(c,s,fee).concat(Object.values(W.C).filter(x=>x.l&&x.i!==c.i&&x.r>=s.r-8&&x.b*1e6*.6>=fee&&!ftcMine(x.i)));
  if(!T.length)return {t:`Ningún club ofrece lo que vale ${s.n} por ahora.`};const to=pick(T);o.so={s:sid,cl:to.i,fee};return {to,fee,s};}
function ftcSellDo(p,ok){const o=p.ftc,W=FTW(),c=W.C[o.c];const x=o.so;o.so=null;if(!x||!ok)return '';const s=W.S[x.s],to=W.C[x.cl];if(!s||!to||s.cl!==c.i)return '';
  o.caja+=x.fee;o.cur.vt+=x.fee;const r0=c.r;ftXfer(s,c,to,x.fee);c.r=+clamp(r0-clamp((s.r-r0)*.12,0,1.5),38,95).toFixed(1);o.boost-=s.r>=r0?6:2;return `Vendes a ${s.n} a ${to.n} por ${ftcU(x.fee)}.`;}
function ftcBidAns(i,ok){const p=P,o=p.ftc,W=FTW(),c=W.C[o.c];const b=o.bids[i];if(!b)return '';o.bids.splice(i,1);const s=W.S[b.s],to=W.C[b.cl];if(!s||!to||s.cl!==c.i)return '';
  if(!ok)return `Rechazas la oferta de ${to.n} por ${s.n}.`;o.caja+=b.fee;o.cur.vt+=b.fee;const r0=c.r;ftXfer(s,c,to,b.fee);c.r=+clamp(r0-clamp((s.r-r0)*.12,0,1.5),38,95).toFixed(1);o.boost-=s.r>=r0?6:2;
  return `Aceptas: ${s.n} se va a ${to.n} por ${ftcU(b.fee)}.`;}
// entrenador del club
function ftcDTAsk(d,c){return Math.round(ftDTSal(d,c)*(1+Math.max(0,d.q-c.r-4)*.08)/1e3)*1e3;}
function ftcDTComp(d){const W=FTW();const oc=d.cl&&W.C[d.cl];return oc?ftDTSal(d,oc):0;}
function ftcDTCands(c){const W=FTW();const D=Object.values(W.D).filter(d=>!d.me&&d.cl!==c.i&&d.q<=c.r+18);
  return D.filter(d=>!d.cl).sort((a,b)=>b.q-a.q).slice(0,6).concat(D.filter(d=>d.cl&&W.C[d.cl]&&d.q>=c.r-4).sort((a,b)=>b.q-a.q).slice(0,5));}
function ftcHireDT(p,did){const o=p.ftc,W=FTW(),c=W.C[o.c],d=W.D[did];if(!d||d.cl===c.i)return '';const cur=W.D[c.dt];const sev=cur&&!cur.me?ftcDTSal(c)*.5:0;const comp=ftcDTComp(d);
  if(o.caja<sev+comp)return `Necesitas ${ftcU(sev+comp)} en caja (liquidación del DT actual e indemnización).`;const ask=ftcDTAsk(d,c);const from=d.cl&&W.C[d.cl];o.caja-=sev+comp;o.cur.cp+=sev+comp;
  if(from)ftNews(`${d.n} deja ${from.n} y se convierte en el nuevo entrenador de ${c.n} (${ftStyN(d.s)}).`,[c.c,from.c],false);ftDTSet(c,d);c.dts=ask;
  return `${d.n} es el nuevo entrenador de ${c.n}: ${ftStyN(d.s).toLowerCase()}, sueldo de ${ftcU(ask)} al año.`;}
function ftcSelf(p,sty){const o=p.ftc,W=FTW(),c=W.C[o.c];ftlEnsure(p);const need=ftcLicNeed(c);if(p.ftl.lv<need)return `Para dirigir a ${c.n} necesitas la ${FTL[need][0]}.`;
  const cur=W.D[c.dt];if(cur&&cur.me){if(sty&&cur.s!==sty){cur.s=sty;c.af=Math.min(c.af==null?1:c.af,.75);return `Cambias el estilo de juego a ${ftStyN(sty).toLowerCase()}. El plantel necesita unos meses para adaptarse.`;}return '';}
  const sev=cur?ftcDTSal(c)*.5:0;if(o.caja<sev)return `La liquidación del DT actual cuesta ${ftcU(sev)}.`;o.caja-=sev;W.D.dme&&ftDTLeave(W.D.dme);
  const d=W.D.dme={i:'dme',n:fullName(p),c:natOf(p).id,s:sty||(cur?cur.s:'equ'),q:0,g:p.age,cl:null,y0:W.cy,m:0,w:0,e:0,l:0,h:[],me:1};ftDTSet(c,d);return `Tomas el banquillo de ${c.n}. Tu fuerza como DT: ${Math.round(p.ftl.q)}.`;}
function ftcLicNeed(c){const L=FTW().L[c.l];return !L?2:L.t===1?4:3;}
// licencias de entrenador (sobreviven a vender el club)
function ftlEnsure(p){if(!p.ftl)p.ftl={lv:0,y:0,q:0,xp:0};const f=p.ftl;const ex=(p.fcPast||[]).some(x=>x.k==='futbol')||!!fbOf(p);const base=38+(ex?6:0)+((p.s&&p.s.inteligencia||50)-50)/10+f.lv*3;if(f.q<base)f.q=+Math.min(FTL[f.lv][3],base).toFixed(2);return f;}
const ftlEx=p=>(p.fcPast||[]).some(x=>x.k==='futbol')||!!fbOf(p);
function ftlLabel(p,lv){return ftlEx(p)?FTL[lv][2].replace('⭐ Curso:','⭐ Curso exprés:'):FTL[lv][2];}
function ftlReq(p,lv){const f=ftlEnsure(p);if(f.lv>=lv)return 'Ya la tienes';if(f.lv<lv-1)return `Antes necesitas la ${FTL[lv-1][0]}`;if(p.age<18)return 'Desde los 18 años';
  if(lv>=3&&G.year-f.y<1)return 'Un año después de la anterior';if(p.dinero<toInt(FTL[lv][1],'USD'))return `Cuesta ${fmt(toInt(FTL[lv][1],'USD'))}`;return '';}
function ftlCourse(p,lv){const e=ftlReq(p,lv);if(e)return e;const f=p.ftl;p.dinero-=toInt(FTL[lv][1],'USD');f.lv=lv;f.y=G.year;f.q=+Math.min(FTL[lv][3],f.q+3).toFixed(2);ftlEnsure(p);
  return `Apruebas el curso y obtienes la ${FTL[lv][0]}. Tu fuerza como DT: ${Math.round(f.q)} (máximo ${FTL[lv][3]} con esta licencia).`;}
ACT_COST.unshift([/^⭐ Curso exprés: Licencia C/,5],[/^⭐ Curso exprés: Licencia B/,8],[/^⭐ Curso exprés: Licencia A/,12],[/^⭐ Curso exprés: Licencia Pro/,18],
  [/^⭐ Curso: Licencia C/,10],[/^⭐ Curso: Licencia B/,15],[/^⭐ Curso: Licencia A/,25],[/^⭐ Curso: Licencia Pro/,35]);

/* ----- el futbolista y el estilo de su DT ----- */
function fbFitV(p){const fb=fbOf(p);if(!fb||!fb.cl||fb.pos===0)return 0;const W=FTW();const c=W.C[fb.cl];if(!c||!W.D)return 0;const w=ftStyK(ftCSty(c))[5];const at=fb.at.slice(0,6);const m=at.reduce((a,b)=>a+b,0)/6;let v=0;for(let k=0;k<6;k++)v+=w[k]*(at[k]-m);return +clamp(v/4,-3,3).toFixed(1);}
function fbFitN(v){return v>=1.5?'Ideal':v>=.5?'Bueno':v>-.5?'Normal':v>-1.5?'Regular':'Malo';}
fbRoleCalc=function(p){const fb=fbOf(p);if(!fb.cl||fb.role==='juv'&&fb.youth)return fb.role;const d=fb.ovr+(fb.trust-50)/10+fb.form*1.5-fbClubR(fb)+fbFitV(p)*.8;return d>=2?'tit':d>=-3?'rot':'sup';};
function fbNewDT(p,d){const fb=fbOf(p);const c=FTW().C[fb.cl];const v=fbFitV(p);fb.trust=clamp(50+v*6+(fb.role==='tit'?5:0),25,80);
  log(`👤 ${c.n} tiene nuevo entrenador: ${d.n} (${ftStyN(d.s)}). Tu encaje con su estilo: ${fbFitN(v).toLowerCase()}. La confianza del DT empieza de cero.`,v>=.5?'good':v<=-.5?'bad':'');}

/* ----- integración con el mundo del fútbol ----- */
function ftR17(W){if(!W||W.v17s)return;W.v17s=1;W.D=W.D||{};W.mk=W.mk||[];W.s0=Object.keys(W.S).length;ftDTEnsure(W);ftMoInit(W);ftDTPool(W);}
{const _e=ftEnsure;ftEnsure=function(){const W=_e();if(W&&!W.v17s)ftR17(W);return W;};}
{const _mw=ftMonthWorld;ftMonthWorld=function(){const W=FTW();if(!W.v17s)ftR17(W);ftDTEnsure(W);const m=W.cm;if(m===6){ftMarket(8);ftDTSummer(W);}if(m===0)ftMarket(5);
  _mw();try{ftDTMonth(W);if(P&&P.ftc)ftcMonth();}catch(e){if(typeof console!=='undefined')console.error('ft17 mes',e);}};}
{const _ss=ftSeasonStart;ftSeasonStart=function(L){_ss(L);try{if(FTW().v17s)ftcSeasonStart(L);}catch(e){}};}
{const _se=ftSeasonEnd;ftSeasonEnd=function(L,done){_se(L,done);try{if(FTW().v17s){ftDTSeasonEnd(L);ftcSeasonEnd(L);}}catch(e){if(typeof console!=='undefined')console.error('ft17 fin',e);}};}
var FTC_ACAC=0;
{const _st=ftStars;ftStars=function(W,c,n,young){if(c&&ftcMine(c.i)&&!FTC_ACAC)return;const k0=W.nx;_st(W,c,n,young);if(young&&c&&c.mo==='can'){for(let k=k0;k<W.nx;k++){const s=W.S['s'+k];if(s)s.pt=+Math.min(96,s.pt+4).toFixed(1);}}};}
{const _y=ftYear;ftYear=function(){const W=FTW();const o=P&&P.ftc;const c=o&&W.C[o.c];const r0=c?c.r:0;const old=Object.values(W.S).filter(s=>s.g>=33).map(s=>({i:s.i,n:s.n,c:s.c,r:s.r,g:s.g}));
  _y();try{if(c)c.r=r0;if(W.v17s){const gone=old.filter(s=>!W.S[s.i]);ftDTYear(W,gone);
      // los clubes de cantera sacan juveniles; algunos clubes cambian de modelo
      if(Object.keys(W.S).length<(W.s0||450)*1.1)for(const x of Object.values(W.C))if(x.mo==='can'&&x.l&&!ftcMine(x.i)&&ftStarsOf(x.i).length<4&&chance(.25))ftStars(W,x,1,true);
      if(chance(.5)){const L=pick(Object.values(W.L));const x=W.C[pick(L.cl)];if(x&&!ftcMine(x.i))x.moI=0;ftMoInit(W);}
      if(c&&o.aca&&chance(.25+.13*o.aca)){FTC_ACAC=1;const k0=W.nx;ftStars(W,c,1,true);FTC_ACAC=0;const s=W.S['s'+k0]||Object.values(W.S).find(x=>x.cl===c.i&&x.g<=19&&!x.ac);
        if(s){s.ac=1;s.g=RI(17,19);s.r=+clamp(c.r-9+o.aca*1.5+R(-2,2),40,90).toFixed(1);s.pt=+clamp(s.r+8+o.aca*2.5+R(0,6),s.r,96).toFixed(1);log(`🌱 Tu academia promueve a ${s.n} (${s.g} años, ${FT_POS[s.po][1].toLowerCase()}, potencial ${fbStarsTxt(s.pt)}).`,'good');}}}}
  catch(e){if(typeof console!=='undefined')console.error('ft17 año',e);}};}
const fbStarsTxt=pt=>{const n=pt>=88?5:pt>=80?4:pt>=72?3:pt>=64?2:1;return '★'.repeat(n)+'☆'.repeat(5-n);};
// avance rápido: si eres dueño de un club, el mundo del fútbol completa los meses que falten antes del cierre de año
{const _au=ageUp;ageUp=function(){const q=P;_au();try{if(q&&q===P&&q.ftc&&G.ft){const W=G.ft;let k=0;while((W.cy<G.year||(W.cy===G.year&&W.cm<monthOfDay(G.day||0)))&&k++<24){W.tk=null;W.tn=null;ftMonthWorld();}}}catch(e){if(typeof console!=='undefined')console.error('ft17 ff',e);}};}
{const _co=careerOptions;careerOptions=function(){const a=_co();try{const p=P;if(p&&p.alive&&(p.ftc||p.age>=18)){const o=p.ftc;const c=o&&G.ft&&G.ft.C[o.c];
  a.push({sec:'Tu negocio',t:o?'⚽ Tu club de fútbol':'⚽ Ser dueño de un club de fútbol',s:c?c.n:'Compra un club o funda uno · licencias de entrenador',can:true,fn:()=>{if(typeof showFTC==='function'&&typeof setTimeout!=='undefined')setTimeout(()=>showFTC(),0);return null;}});}}catch(e){}return a;};}
