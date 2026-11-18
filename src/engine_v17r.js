/* ===== v1.7r (etapa C del plan): box y MMA a fondo — motor =====
   Escuelas con dominio que se gana entrenando (efectos en el entrenamiento y en la pelea), estilos que se adquieren, bloques de entrenamiento con fatiga
   y riesgo de lesión, campamento por bloques, sesiones especiales, récord amateur completo (historial, puntos, ranking nacional, selección y beca),
   estadísticas de carrera, bolsas según el mercado de cada país, subasta de bolsa en las defensas obligatorias, gimnasio propio y promotora propia. */
const cbSchL=sp=>CB_SCH[sp]||[];
const cbSchK=(sp,k)=>cbSchL(sp).find(s=>s.k===k)||null;
function cbSchOfNat(sp,nid,seed){const L=cbSchL(sp);const s=L.find(x=>x.c.includes(nid));if(s)return s.k;const o=CB_SCH0[sp];let t=0;for(const k in o)t+=o[k];
  let r=cbHash(String(seed||nid),3)*t;for(const k in o){r-=o[k];if(r<=0)return k;}return Object.keys(o)[0];}
const cbSchF=f=>cbSchOfNat(G.cb.sp,f.c,f.i);
function cbMkt(sp,nid){const n=G.nations[nid];if(!n)return .5;const pc=n.gdp/Math.max(1,n.pop);return clamp(Math.pow(pc/75000,.55),.15,1.05)*((CB_MKT[sp]||{})[nid]||1);}
const cbUSDl=v=>fmt(toInt(v,'USD'));
const cbDim=v=>clamp((100-v)/40,.08,1);

/* ----- estado nuevo de la carrera (y migración de partidas anteriores) ----- */
function cbR17(p){const c=p.fc&&p.fc.cb;if(!c)return null;const sp=cbSp(p);if(c.v17)return c;c.v17=1;const nid=natOf(p).id;
  c.sm=c.sm||{};const hs=cbSchOfNat(sp,nid,fullName(p));if(c.sm[hs]==null)c.sm[hs]=20;
  if(!c.sa){c.sa=CB_ST[sp].map((s,i)=>i===c.st?70:RI(8,22));}
  c.fat=c.fat||0;c.ses=c.ses||{};c.cs=c.cs||{f:0,rd:0,th:0,ln:0,pth:0,pln:0,kd:0,kdr:0,td:0,tda:0,ctl:0,sa:0,rth:0,rln:0};
  const am=c.am;am.h=am.h||[];am.pt=am.pt||Math.min(160,am.w*3+am.md.length*12);am.sel=am.sel||0;am.bec=am.bec||0;
  cbGyms17(p);return c;}
function cbGyms17(p){const c=p.fc.cb,sp=cbSp(p);if(!c.gyms)return;const nid=natOf(p).id;const hs=cbSchOfNat(sp,nid,fullName(p));
  for(const g of c.gyms)if(!g.sch)g.sch=g.abroad?(CB_GYMX0[g.nm]||cbSchOfNat(sp,g.abroad,g.nm)):hs;
  for(const [nm,cc,sk] of CB_GYMX[sp]||[]){if(c.gyms.some(g=>g.nm===nm))continue;const cu=cultOf(cc);
    c.gyms.push({nm,t:4,co:{name:rndFirst('M',cu)+' '+rndSur(cu),sex:'M',age:RI(40,66),tr:pick(['honesto','leal','generoso','ambicioso'])},spec:pick(sp==='box'?[0,1,2,3,5]:[0,2,5,6,7]),abroad:cc,sch:sk});}}
{const _e=cbEnsure;cbEnsure=function(p){const c=_e(p);if(c)cbR17(p);return c;};}
{const _i=cbInit;cbInit=function(p){_i(p);cbR17(p);};}
const cbSmv=(c,k)=>(c.sm&&c.sm[k])||0;
// la escuela del gimnasio donde entrenas (si entrenas en tu propio gimnasio, la suya)
function cbGymSch(p){const g=cbGym(p);return g&&g.sch||cbSchOfNat(cbSp(p),natOf(p).id,fullName(p));}
// multiplicador por atributo al entrenar: fatiga × escuela del gimnasio (más fuerte cuanto más dominio tienes) × selección nacional × entrenadores de tu gimnasio
function cbTrMult(p){const c=p.fc.cb,sp=cbSp(p);const S=cbSchK(sp,cbGymSch(p));const m=cbSmv(c,S?S.k:'')/100;const ff=1-clamp(c.fat||0,0,100)/200;
  const sel=!c.pro&&cbSelOn(c)&&cbGym(p).t<3?1.12:1;const own=cbOwnTrain(p)?cbOGCoachQ(p):0;const ob=own?1+(own-55)/220:1;
  return CB_AT[sp].map((_,i)=>ff*(S?1+(S.tr[i]-1)*(.5+.5*m):1)*sel*ob);}
function cbSmAdd(p,k,v){const c=p.fc.cb;if(!k)return;const x=c.sm[k]||0;c.sm[k]=+Math.min(100,x+v*(1-x/115)).toFixed(1);}
// afinidad con cada estilo: crece al entrenar lo que ese estilo necesita, con la escuela que lo enseña y al pelear con su plan
function cbSaAdd(p,d){const c=p.fc.cb,sp=cbSp(p);const S=cbSchK(sp,cbGymSch(p));
  CB_ST[sp].forEach((s,j)=>{let a=0;for(let i=0;i<d.length;i++)a+=d[i]*(s.t[i]-1)*6;if(S&&S.st.includes(j))a+=.35;c.sa[j]=+clamp((c.sa[j]||0)+a,0,100).toFixed(1);});
  c.sa[c.st]=Math.max(c.sa[c.st],50);}
// aplica el multiplicador a lo que acaba de subir un entrenamiento (envuelve cbTrain, cbSpar y los bloques)
function cbScaleGain(p,before,mul,extra){const c=p.fc.cb;const d=c.at.map((v,i)=>v-before[i]);c.at=c.at.map((v,i)=>clamp(before[i]+d[i]*mul[i]*(extra||1),0,99));cbSync(p);return c.at.map((v,i)=>v-before[i]);}
function cbFatInj(p,k){const c=p.fc.cb,f=p.fc;if(f.inj)return '';const ch=.006*k*(c.fat/30)*(p.age>32?1.4:1);if(c.fat>45&&chance(ch)){f.inj=RI(1,2);return f.inj===1?' La fatiga acumulada te cobra factura: te lesionas y quedas fuera un mes.':` La fatiga acumulada te cobra factura: te lesionas y quedas fuera ${f.inj} meses.`;}return '';}
{const _t=cbTrain;cbTrain=function(p,i){const c=cbR17(p)||p.fc.cb;const b=c.at.slice();const r=_t(p,i);if(p.fc.inj&&/lesionas/.test(r))return r;
  const d=cbScaleGain(p,b,cbTrMult(p));c.fat=clamp((c.fat||0)+7,0,100);cbSmAdd(p,cbGymSch(p),.6);cbSaAdd(p,d);return r+cbFatInj(p,1);};}
{const _s=cbSpar;cbSpar=function(p){const c=cbR17(p)||p.fc.cb;const b=c.at.slice();const r=_s(p);if(p.fc.inj&&/lesión/.test(r))return r;
  const d=cbScaleGain(p,b,cbTrMult(p));c.fat=clamp((c.fat||0)+9,0,100);cbSmAdd(p,cbGymSch(p),.6);cbSaAdd(p,d);return r+cbFatInj(p,1.3);};}

/* ----- bloques de entrenamiento ----- */
const cbBlkL=sp=>CB_BLK[sp]||[];
function cbBlkPreview(p,j,it){const c=p.fc.cb,f=p.fc,sp=cbSp(p);const B=cbBlkL(sp)[j];const g=cbGym(p);const I=CB_INT[it];
  const lvl=f.sk<40?1.4:f.sk<55?1:f.sk<70?.62:f.sk<82?.32:.14;const nY=f.trY===G.year?f.trN||0:0;
  const base=.75*CB_GT[g.t][2]*c.chem*f.tal*(1+p.s.salud/120)*lvl*(p.age<18?.85:1)/(1+.12*nY);const mul=cbTrMult(p);
  const gain=B[3].map((w,i)=>base*w*1.5*I[1]*mul[i]*cbDim(c.at[i])*(i===4?.35:1));
  const fat=B[4]<0?B[4]:B[4]*I[2];const inj=B[4]<0?0:.02*B[5]*I[3]*(1+(c.fat||0)/40)*(p.age>32?1.4:1)*(g.t<1?1.4:1);
  return {gain,fat,inj:clamp(inj,0,.5),B,I};}
function cbBlock(p,j,it){const c=cbR17(p),f=p.fc,sp=cbSp(p);const x=cbBlkPreview(p,j,it);const B=x.B;
  if(f.trY!==G.year){f.trY=G.year;f.trN=0;}f.trN++;
  c.at=c.at.map((v,i)=>clamp(v+x.gain[i],0,99));cbSync(p);c.fat=clamp((c.fat||0)+x.fat,0,100);cbSmAdd(p,cbGymSch(p),B[6]==='a'?.4:1.6);if(B[6]!=='a')cbSaAdd(p,x.gain);
  if(B[0]==='spa'||B[0]==='mix')c.dmg=+(c.dmg+.25*x.I[1]).toFixed(2);p.s.salud=clamp(p.s.salud+(B[0]==='rec'?3:B[0]==='car'?1:0),0,100);
  if(c.fight){const o=c.fight;o.cp=o.cp||{f:0,t:0,s:0,a:0,l:''};o.cp[B[6]]++;o.cp.l=B[6];if(B[0]==='pes')o.pw=Math.min(2,(o.pw||0)+1);}
  let inj='';if(chance(x.inj)){f.inj=it===2?RI(1,3):RI(1,2);inj=f.inj===1?' Te lesionas durante el bloque: quedas fuera un mes.':` Te lesionas durante el bloque: quedas fuera ${f.inj} meses.`;}
  return `Completas el bloque «${B[1]}» con intensidad ${x.I[0].toLowerCase()}. Fatiga ${Math.round(c.fat)}/100.`+inj;}
// calificación del campamento de la pelea programada (0–5)
function cbCampScore(o){const cp=o&&o.cp;if(!cp)return 0;return (cp.f?1:0)+(cp.t?1:0)+(cp.s?1:0)+(cp.l==='a'?1:0)+((cp.f+cp.t+cp.s+cp.a)>=4?1:0);}

/* ----- sesiones especiales ----- */
const cbSesK=k=>CB_SES.find(s=>s[0]===k);
function cbSesCost(p,k){const S=cbSesK(k),c=p.fc.cb;let u=S[3];if(k==='vid'&&c.fight)u*=[1,2.5,6][c.fight.vt]||1;return toInt(u*Math.max(.4,cbMkt(cbSp(p),natOf(p).id)),'USD');}
function cbSesReq(p,k){const S=cbSesK(k),c=p.fc.cb,sp=cbSp(p);if(!S)return '—';if(S[6]&&S[6]!==sp)return '—';
  if(k==='vid'&&!c.fight)return 'Necesitas una pelea programada.';if(k==='vid'&&c.fight.vid)return 'Ya estudiaste a este rival.';
  if(k==='spp'&&!c.pro)return 'Solo para profesionales.';if(k==='psi'&&c.psi)return 'Ya la tomaste para tu próxima pelea.';if(k==='nut'&&c.nut)return 'Ya la tomaste para tu próxima pelea.';
  const last=(c.ses||{})[k];if(S[5]&&last&&cbNow()-last<S[5])return `Disponible en ${Math.ceil(S[5]-(cbNow()-last))} días.`;
  if(p.dinero<cbSesCost(p,k))return `Cuesta ${fmt(cbSesCost(p,k))}.`;return '';}
function cbSession(p,k){const c=cbR17(p),f=p.fc,sp=cbSp(p);const rq=cbSesReq(p,k);if(rq)return rq;const cost=cbSesCost(p,k);p.dinero-=cost;c.ses[k]=cbNow();const up=(i,v)=>{c.at[i]=clamp(c.at[i]+v*cbDim(c.at[i])*f.tal,0,99);};let t;
  if(k==='vid'){c.fight.vid=1;t='Estudias horas de video con tu entrenador: ya conoces sus atributos exactos y sus hábitos. En la pelea tu plan estará hecho para él.';}
  else if(k==='ley'){const S=cbSchK(sp,cbGymSch(p));cbSmAdd(p,S?S.k:'',9);up(5,1.2);t=`Una semana con un excampeón de la ${S?S.n.toLowerCase():'escuela'}: tu dominio de la escuela sube a ${Math.round(cbSmv(c,S?S.k:''))}/100.`;}
  else if(k==='alt'){up(3,2.6);c.fat=clamp(c.fat+12,0,100);if(c.fight)c.fight.alt=1;t='Tres semanas en altura: tu resistencia sube y, si tienes pelea programada, llegarás con más gas.';}
  else if(k==='fis'){c.fat=Math.max(0,c.fat-40);if(f.inj)f.inj=Math.max(0,f.inj-1);t=f.inj?`Fisioterapia y recuperación: tu fatiga baja a ${Math.round(c.fat)}/100.`:`Fisioterapia y recuperación: tu fatiga baja a ${Math.round(c.fat)}/100 y tu cuerpo está listo para cargar más.`;}
  else if(k==='psi'){c.psi=1;t='Trabajas la concentración y el manejo de la presión: en tu próxima pelea tendrás más temple (quijada y técnica +2).';}
  else if(k==='nut'){c.nut=1;t='Plan de peso medido semana a semana: el riesgo de no dar el peso en tu próxima pelea baja mucho.';}
  else if(k==='spp'){up(5,2);up(2,1.2);c.dmg=+(c.dmg+.4).toFixed(2);c.fat=clamp(c.fat+10,0,100);t='Rounds con un contendiente del top 15: tu técnica y tu defensa suben, aunque te llevas golpes.';}
  else if(k==='oli'){up(6,2.5);cbSmAdd(p,'usw',3);cbSmAdd(p,'dag',3);t='Una semana con luchadores olímpicos: tus derribos y tu control mejoran.';}
  else if(k==='bjn'){up(7,2.5);cbSmAdd(p,'bjj',5);t='Clases privadas de jiu-jitsu: tus sumisiones y escapes mejoran.';}
  cbSync(p);return t+` Pagas ${fmt(cost)}.`;}
{const _w=cbWeighRisk;cbWeighRisk=function(p){const c=p.fc.cb,o=c.fight;return clamp(_w(p)-((o&&o.pw)||0)*.04-(c.nut?.08:0),0,.4);};}

/* ----- estilos ----- */
function cbStyleReq(p,j){const c=cbR17(p);if(j===c.st)return 'Es tu estilo actual.';if(c.fight)return 'Tienes una pelea programada.';if((c.sa[j]||0)<60)return `Pide afinidad de 60 (tienes ${Math.round(c.sa[j]||0)}).`;return '';}
function cbAdoptStyle(p,j){const c=cbR17(p),sp=cbSp(p);const rq=cbStyleReq(p,j);if(rq)return rq;const old=CB_ST[sp][c.st].n;c.st=j;c.plan=null;c.adapt=2;
  return `Cambias tu estilo de ${old.toLowerCase()} a ${CB_ST[sp][j].n.toLowerCase()}. Durante dos meses todavía te estarás adaptando (técnica −3 en la pelea).`;}
// estilo secundario: si tienes 70 o más con otro estilo, peleas como híbrido (+2 de técnica)
function cbHybrid(c){let b=-1,v=0;(c.sa||[]).forEach((x,i)=>{if(i!==c.st&&x>=70&&x>v){v=x;b=i;}});return b;}

/* ----- efectos de escuela y estilo en la pelea ----- */
function cbSchDelta(sp,k,m){const S=cbSchK(sp,k);return S?S.fd.map(v=>v*m):null;}
function cbPlayerDelta(p){const c=p.fc.cb,sp=cbSp(p);const n=cbNA(sp);const out=new Array(n).fill(0);const L=Object.entries(c.sm||{}).filter(([k,v])=>cbSchK(sp,k)&&v>0).sort((a,b)=>b[1]-a[1]).slice(0,2);
  L.forEach(([k,v],j)=>{const d=cbSchDelta(sp,k,v/100*(j?.5:1));d.forEach((x,i)=>out[i]+=x);});
  if(cbHybrid(c)>=0)out[5]+=2;if(c.adapt)out[5]-=3;if(c.psi){out[4]+=2;out[5]+=2;}return out;}
const cbAiM=f=>clamp((f.r-40)/55,0,.85);
{const _su=cbSetup;cbSetup=function(p){const S=_su(p);try{const c=p.fc.cb,o=c.fight,sp=S.sp;const A=S.f[0],B=S.f[1];const op=cbF(o.o);
  const dA=cbPlayerDelta(p);A.at=A.at.map((v,i)=>clamp(Math.round(v+dA[i]),1,99));
  if(op){const dB=cbSchDelta(sp,cbSchF(op),cbAiM(op))||[];B.at=B.at.map((v,i)=>clamp(Math.round(v+(dB[i]||0)),1,99));}
  const cs=cbCampScore(o);A.sta=clamp(A.sta+cs*1.6+(o.alt?4:0)-Math.max(0,(c.fat||0)-70)*.3,40,100);if(cs>=4)A.at[5]=Math.min(99,A.at[5]+2);
  if(o.vid&&op){A.at[5]=Math.min(99,A.at[5]+3);if((CB_MATCH[sp][CB_ST[sp].findIndex(s=>s.pl===A.pl)]||[])[op.s]>0)A.at[5]=Math.min(99,A.at[5]+2);}
  const sA=cbSchK(sp,Object.entries(c.sm||{}).sort((a,b)=>b[1]-a[1])[0]?.[0]),sB=op?cbSchK(sp,cbSchF(op)):null;
  S.cu=[sA&&sA.cu?cbSmv(c,sA.k)/100:0,sB&&sB.cu?cbAiM(op):0];S.sch=[sA?sA.k:'',sB?sB.k:''];S.cs=cs;}catch(e){if(typeof console!=='undefined')console.error('cb17 setup',e);}return S;};}
// golpes al cuerpo (escuela mexicana) y patadas bajas (kickboxing holandés, muay thai): cada golpe de poder conectado desgasta un poco más al rival
{const _r=cbRound;cbRound=function(S,corner){const n0=S.st.length;const r=_r(S,corner);try{if(S.cu&&S.st.length>n0&&!S.end){const st=S.st[S.st.length-1];
  for(let k=0;k<2;k++)if(S.cu[k]){const Y=S.f[1-k];const d=S.cu[k]*st[k].pln*.09;Y.sta=clamp(Y.sta-d,5,100);st[k].bd=Math.round(d*10)/10;}}}catch(e){}return r;};}

/* ----- después de la pelea: estadísticas de carrera, afinidad con el plan, consumo de sesiones ----- */
{const _f=cbFinish;cbFinish=function(p,S){const c=cbR17(p)||p.fc.cb;let T=null;try{T=cbTotals(S);}catch(e){}const r=_f(p,S);try{if(T){const s=c.cs;s.f++;s.rd+=S.rd;
    for(const k of ['th','ln','pth','pln','kd','td','tda','ctl','sa'])s[k]+=T[0][k]||0;s.kdr+=T[1].kd||0;s.rth+=T[1].th||0;s.rln+=T[1].ln||0;}
  const sp=S.sp;const pl=S.f[0].pl;CB_ST[sp].forEach((st,j)=>{if(st.pl===pl)c.sa[j]=Math.min(100,(c.sa[j]||0)+2.5);});
  c.psi=0;c.nut=0;const g=p.cbo&&p.cbo.g;if(g&&cbOwnTrain(p))g.rep=clamp(g.rep+(r.w==='a'?2:.5)+(r.titleTxt&&r.w==='a'?8:0),0,100);}catch(e){if(typeof console!=='undefined')console.error('cb17 fin',e);}return r;};}

/* ===================== AMATEUR COMPLETO ===================== */
const CB_AMPT={'':3,nac:6,cont:10,bjj:5,mund:15,olim:25,inv:9};
const CB_AMBIG={'':.05,nac:.12,cont:.25,bjj:.1,mund:.45,olim:1,inv:.2};
CB_AMT.box.push(['Torneo internacional por invitación',[48,72],4,'inv']);CB_AMT.mma.push(['Torneo internacional por invitación',[45,70],3,'inv']);
const cbSelOn=c=>c.am&&c.am.sel>=G.year-1;
function cbAmRank(c){return clamp(Math.round(1+70*Math.exp(-(c.am.pt||0)/40)),1,70);}
function cbAmBonus(p){const c=p.fc.cb,sp=cbSp(p);let b=0;for(const [k,v] of Object.entries(c.sm||{})){const S=cbSchK(sp,k);if(S)b=Math.max(b,S.am*v/100*5);}return b;}
function cbAmLog(c,a){c.am.h.push(a);if(c.am.h.length>80)c.am.h.shift();}
function cbAmSelCheck(p){const c=p.fc.cb;if(c.pro)return;if(c.am.nat>=G.year-1||cbAmRank(c)<=2){if(c.am.sel!==G.year){const nw=c.am.sel<G.year-1;c.am.sel=G.year;if(nw)log(`🏅 Te convocan a la selección nacional amateur de ${natOf(p).name}: beca mensual, concentraciones con los mejores y acceso a torneos internacionales.`,'big');}}}
cbAmFight=function(p){const c=p.fc.cb,sp=cbSp(p);if(c.pro)return 'Ya eres profesional.';cbR17(p);const me=cbMyPw(p)+cbAmBonus(p);const opp=clamp(cbMyPw(p)+R(-12,10),15,80);const pw=clamp(.5+(me-opp)/22,.04,.96);const nid=natOf(p).id;const cu=cultOf(nid);const nm=rndFirst(p.sex==='F'?'F':'M',cu)+' '+rndSur(cu);
  const win=chance(pw);const ko=win&&chance(sp==='box'?.18:.35);if(win){c.am.w++;if(ko)c.am.ko++;c.am.pt+=2;}else{c.am.l++;c.am.pt=Math.max(0,c.am.pt-1);}c.at[5]=clamp(c.at[5]+.2*(p.fc.sk<60?1:.4),0,99);c.dmg+=.05;fcAddFans(p,win?40:20,.25);cbSync(p);
  cbAmLog(c,[G.year,nm,nid,win?'W':'L',ko?(sp==='box'?'RSC':'SUB'):'DEC',-1,Math.round(pw*100)]);cbAmSelCheck(p);
  return ((r_,pp_)=>win?(ko?(sp==='box'?`Pelea amateur contra ${nm}: ¡ganas por RSC (el réferi detiene el combate)! (probabilidad ${pp_} %). Récord amateur ${r_}.`:`Pelea amateur contra ${nm}: ¡ganas por sumisión! (probabilidad ${pp_} %). Récord amateur ${r_}.`):`Pelea amateur contra ${nm}: ganas por decisión (probabilidad ${pp_} %). Récord amateur ${r_}.`):`Pelea amateur contra ${nm}: pierdes por decisión (probabilidad ${pp_} %). Récord amateur ${r_}.`)(`${c.am.w}-${c.am.l}`,Math.round(pw*100));};
{const _q=cbAmReq;cbAmReq=function(p,k){const c=p.fc.cb,sp=cbSp(p);const T=CB_AMT[sp][k];if(!T)return '—';cbR17(p);
  if(T[3]==='inv'){if(c.pro)return 'Solo para amateurs.';if(c.am.ty[k]===G.year)return 'Ya participaste este año.';if(!cbSelOn(c))return 'Solo para la selección nacional.';return '';}
  const r=_q(p,k);if(r&&cbSelOn(c)&&/campeón nacional|título nacional/.test(r))return '';return r;};}
cbTourney=function(p,k){const c=p.fc.cb,sp=cbSp(p);const rq=cbAmReq(p,k);if(rq)return rq;cbR17(p);const T=CB_AMT[sp][k];c.am.ty[k]=G.year;const me=cbMyPw(p)+cbAmBonus(p);const n=T[2];const rn=['Final','Semifinal','Cuartos de final','Octavos de final','Dieciseisavos'];const out=[];let res=0;const loc=T[3]===''||T[3]==='nac';
  for(let i=0;i<n;i++){const opp=T[1][0]+(T[1][1]-T[1][0])*i/Math.max(1,n-1)+R(-5,5);const nid=loc?natOf(p).id:cbNatPick(sp,c.d,null);const cu=cultOf(nid);const nm=rndFirst(p.sex==='F'?'F':'M',cu)+' '+rndSur(cu);
    const pw=clamp(.5+(me-opp)/22,.03,.97);const win=chance(pw);const who=!loc?`${nm} (${cbNm(nid)})`:nm;out.push((win?`${rn[n-1-i]}: vences a ${who}`:`${rn[n-1-i]}: pierdes ante ${who}`)+` · ${Math.round(pw*100)} %`);
    const ko=win&&chance(sp==='box'?.15:.3);cbAmLog(c,[G.year,nm,nid,win?'W':'L',ko?(sp==='box'?'RSC':'SUB'):'DEC',k,Math.round(pw*100)]);
    if(win){c.am.w++;if(ko)c.am.ko++;res=i+1;c.am.pt+=CB_AMPT[T[3]]||3;}else{c.am.l++;break;}}
  c.at[5]=clamp(c.at[5]+.5*(p.fc.sk<65?1:.4),0,99);cbSync(p);let md='';
  if(res===n)md='oro';else if(res===n-1)md='plata';else if(res===n-2&&sp==='box'&&n>=4)md='bronce';
  if(md){c.am.md.push({y:G.year,t:T[0],m:md});c.am.pt+=Math.round((CB_AMPT[T[3]]||3)*(md==='oro'?3:md==='plata'?2:1.2));if(T[3]==='nac'&&md==='oro')c.am.nat=G.year;const big=(CB_AMBIG[T[3]]||.05)*(md==='oro'?1:md==='plata'?.6:.4);fcBump(p,big);p.fc.aw.push({y:G.year,t:`${md==='oro'?'🥇':md==='plata'?'🥈':'🥉'} ${T[0]}`});
    if(T[3]==='mund'||T[3]==='olim')mkNews(`${fullName(p)} gana la medalla de ${md} en ${T[0].toLowerCase()} para ${natOf(p).name}.`,T[3]==='olim'||md==='oro');}
  cbAmSelCheck(p);
  return `${T[0]}:\n${out.join('\n')}\n${md?`🏅 ¡Medalla de ${md}!`:'Te quedas sin medalla.'}`;};

/* ===================== BOLSAS SEGÚN EL MERCADO ===================== */
// Funciones locales y nacionales se pagan según el mercado del país (PIB por persona y cultura del deporte); las internacionales no cambian.
{const _m=cbMkOffer;cbMkOffer=function(p,kind,free,oid){const o=_m(p,kind,free,oid);if(!o)return o;try{const c=p.fc.cb;if(o.vt<2){const f=cbMkt(cbSp(p),natOf(p).id);o.mk=+f.toFixed(2);
    o.$=Math.round(Math.max(o.$*f,c.prom?c.prom.min:0,cbSp(p)==='mma'?200:300)/100)*100;}}catch(e){}return o;};}
{const _po=cbPromOffers;cbPromOffers=function(p,force){const n=_po(p,force);try{const c=p.fc.cb;const f=cbMkt(cbSp(p),natOf(p).id);for(const o of c.po||[])if(o.t>=1&&!o.mk){o.mk=1;o.min=Math.round(Math.max(200,o.min*f)/100)*100;o.bono=Math.round(o.bono*f/100)*100;}}catch(e){}return n;};}
// subasta de bolsa: si el campeón y el retador obligatorio no se ponen de acuerdo, el organismo subasta la pelea y reparte 75/25 a favor del campeón
function cbPurseBid(p,o,share){const op=cbF(o.o);if(!op)return;const me=cbMe(p);const bid=(cbMV(me)+cbMV(op))*R(.85,1.35);o.bid=Math.round(bid/1000)*1000;o.sh=share;o.$=Math.round(o.bid*share/100)*100;o.last=true;}
function cbMandMonth(p){const c=p.fc.cb,sp=cbSp(p);if(!c.pro||sp!=='box')return;
  for(const o of c.offers)if(o.mand&&!o.bid)cbPurseBid(p,o,.75);
  // retador obligatorio: si eres el número 1 de un organismo, te toca pelear por su cinturón
  if(c.fight||c.offers.some(o=>o.mand)||cbBelts('P').length||cbCanFight(p))return;
  for(let b=0;b<4;b++){const ch=G.cb.ch[cbKey(b,c.d)];if(!ch||ch==='P'||!G.cb.F[ch])continue;if(cbPos('P',c.d,b)!==1||!chance(.22))continue;
    const m=cbMkOffer(p,3,false,ch);if(!m)continue;m.t=cbBeltsD(ch,c.d);if(!m.t.length)continue;m.mand=1;m.chal=1;m.dl=absDay()+45;cbPurseBid(p,m,.25);c.offers.unshift(m);
    log(`📨 El ${cbOrgN(b)} ordena la pelea obligatoria por su título contra ${G.cb.F[ch].n}. Hubo subasta de bolsa: ${cbUSDl(m.bid)}, y al retador le toca 25 %.`,'big');CB_NOTE=1;break;}}

/* ===================== MES Y AÑO DEL PELEADOR ===================== */
function cbMonth17(p){const c=cbR17(p);if(!c)return;c.fat=Math.max(0,(c.fat||0)-20);if(c.adapt)c.adapt--;
  if(!c.pro&&cbSelOn(c)){const b=U(p)*.25/12;p.dinero+=b;c.am.bec=(c.am.bec||0)+b;}cbMandMonth(p);}
function cbYear17(p){const c=cbR17(p);if(!c)return;c.am.pt=Math.round((c.am.pt||0)*.72);cbAmSelCheck(p);
  // la escuela se oxida si no la practicas: el dominio de las escuelas que no entrenas baja poco a poco
  const k0=cbGymSch(p);for(const k in c.sm)if(k!==k0)c.sm[k]=Math.max(0,+(c.sm[k]-2).toFixed(1));}

/* ===================== GIMNASIO PROPIO ===================== */
const cbOwnTrain=p=>!!(p.fc&&p.fc.cb&&p.fc.cb.og&&p.cbo&&p.cbo.g&&p.cbo.g.sp===cbSp(p));
function cbOGCoachQ(p){const g=p.cbo&&p.cbo.g;if(!g||!g.co.length)return 45;return Math.max(...g.co.map(x=>x.q));}
{const _g=cbGym;cbGym=function(p){if(cbOwnTrain(p)){const g=p.cbo.g;const b=g.co.length?g.co.reduce((a,x)=>x.q>a.q?x:a):null;
    return {nm:g.nm,t:CB_OG[g.t][7],co:{name:b?b.n:fullName(p),sex:'M',age:40,tr:'leal'},spec:g.spec==null?5:g.spec,sch:g.sch,own:1};}return _g(p);};}
function cbOGCands(p){const g=p.cbo.g;const cu=cultOf(natOf(p).id);const sp=g.sp;const L=cbSchL(sp);
  g.cand=[0,1,2].map(i=>{const q=Math.round(clamp(40+g.t*10+R(-8,22)+(i===2?8:0),35,95));const sk=i===0?g.sch:pick(L).k;const forn=sk!==cbSchOfNat(sp,natOf(p).id,'x')&&i>0;const c2=forn?(cbSchK(sp,sk).c[0]):natOf(p).id;
    return {n:rndFirst(chance(.85)?'M':'F',cultOf(c2))+' '+rndSur(cultOf(c2)),q,sch:sk,c:c2,sal:+(.025*Math.pow(q/50,2)*(forn?1.4:1)).toFixed(4)};});}
function cbOGOpen(p,t,sk){const sp=G.cb&&G.cb.sp;if(!sp)return 'Primero necesitas estar en el mundo del box o de las MMA.';p.cbo=p.cbo||{};if(p.cbo.g)return 'Ya tienes un gimnasio.';
  const cost=CB_OG[t][1]*U(p);if(p.dinero<cost)return `Abrir un ${CB_OG[t][0].toLowerCase()} cuesta ${fmt(cost)}.`;p.dinero-=cost;const city=RG[p.r].nm;
  const nm=sp==='box'?`${pick(['Club de Box','Gimnasio','Academia de Box'])} ${pick(CB_PRN)} (${city})`:`${pick(['Academia de MMA','Centro de Combate','Team'])} ${pick(CB_PRN)} (${city})`;
  p.cbo.g={sp,nm,t,sch:sk||cbSchOfNat(sp,natOf(p).id,fullName(p)),r:p.r,y0:G.year,mem:Math.round(CB_OG[t][3]*.15),fm:1,co:[],eq:0,F:[],rep:Math.round(clamp(15+(p.fc?fcFama(p.fc)/3:0),10,60)),h:[],ps:0,inv:cost,spec:5,sc:[]};
  cbOGCands(p);return `Abres ${p.cbo.g.nm}: ${CB_OG[t][0].toLowerCase()} de la ${cbSchK(sp,p.cbo.g.sch).n.toLowerCase()}. Contrata entrenadores para atraer socios.`;}
function cbOGHire(p,i){const g=p.cbo.g;const x=g.cand&&g.cand[i];if(!x)return '';if(g.co.length>=CB_OG[g.t][5])return `Tu ${CB_OG[g.t][0].toLowerCase()} admite ${CB_OG[g.t][5]} entrenador(es).`;g.co.push(x);g.cand.splice(i,1);
  return `Contratas a ${x.n} (calidad ${x.q}, ${cbSchK(g.sp,x.sch).n.toLowerCase()}) por ${fmt(x.sal*U(p))} al mes.`;}
function cbOGFire(p,i){const g=p.cbo.g;const x=g.co[i];if(!x)return '';g.co.splice(i,1);const sev=x.sal*U(p)*2;p.dinero-=sev;return `Despides a ${x.n}. Liquidación: ${fmt(sev)}.`;}
function cbOGUp(p){const g=p.cbo.g;if(g.t>=2)return 'Ya tienes el nivel más alto.';const cost=(CB_OG[g.t+1][1]-CB_OG[g.t][1]*.5)*U(p);if(p.dinero<cost)return `Ampliar cuesta ${fmt(cost)}.`;p.dinero-=cost;g.t++;g.inv+=cost;
  return `Amplías tu gimnasio a ${CB_OG[g.t][0].toLowerCase()}: más socios, más entrenadores y más peleadores.`;}
function cbOGEq(p){const g=p.cbo.g;if(g.eq>=3)return 'Tu equipo ya es de primer nivel.';const cost=[.5,1.5,4][g.eq]*(g.t+1)*U(p);if(p.dinero<cost)return `Mejorar el equipo cuesta ${fmt(cost)}.`;p.dinero-=cost;g.eq++;g.inv+=cost*.5;
  return `Equipo nuevo: ahora es ${CB_OGEQ[g.eq].toLowerCase()}. Atrae más socios y mejora el entrenamiento.`;}
function cbOGClose(p){const g=p.cbo.g;if(!g)return '';const v=g.inv*.4;p.dinero+=v;for(const id of g.F){const f=G.cb&&G.cb.F[id];if(f)f.gy=0;}if(P.fc&&P.fc.cb)P.fc.cb.og=0;p.cbo.g=null;return `Vendes tu gimnasio por ${fmt(v)}.`;}
function cbOGScout(p){const g=p.cbo.g;const W=G.cb;if(!W||W.sp!==g.sp)return '';if(g.F.length>=CB_OG[g.t][6])return 'Tu gimnasio ya no tiene lugar para más peleadores.';
  const D=CB_DIVS[W.sp][W.sx];const nid=natOf(p).id;g.sc=[];for(let i=0;i<2;i++){const f=cbGen(W,pick(D),nid,null,{c:nid,pt:clamp(55+g.rep/3+R(0,22)+(cbOGCoachQ(p)-55)/4,50,97)});g.sc.push(f.i);}
  return `Recorres torneos amateur y gimnasios de la zona: encuentras ${g.sc.length} prospectos que podrían firmar con tu gimnasio.`;}
function cbOGSign(p,id){const g=p.cbo.g;const f=G.cb&&G.cb.F[id];if(!f)return '';if(g.F.length>=CB_OG[g.t][6])return 'Tu gimnasio ya no tiene lugar para más peleadores.';f.gy=1;g.F.push(id);g.sc=g.sc.filter(x=>x!==id);g.rep=clamp(g.rep+1,0,100);
  return `${f.n} se une a tu gimnasio. Te deja 10 % de sus bolsas y sube con la calidad de tus entrenadores.`;}
function cbOGDemand(p){const g=p.cbo.g;const T=CB_OG[g.t];const coachF=g.co.length?1:.35;return T[3]*clamp(.2+g.rep/110+g.eq*.06,.1,1)*Math.pow(g.fm,-1.3)*coachF;}
function cbOGMonth(p){const g=p.cbo&&p.cbo.g;if(!g)return;const W=G.cb;const live=W&&W.sp===g.sp;if(live)g.F=g.F.filter(id=>W.F[id]);
  const T=CB_OG[g.t];const u=U(p);g.mem=Math.max(0,Math.round(g.mem+(cbOGDemand(p)-g.mem)*.2));
  const inc=g.mem*T[4]*g.fm*u+(live?toInt(g.ps||0,'USD'):0);g.ps=0;const cost=T[2]*u+g.co.reduce((s,x)=>s+x.sal*u,0)+g.eq*.01*u;
  p.dinero+=inc-cost;g.h.push([G.year,monthOfDay(G.day||0),Math.round(inc),Math.round(cost)]);if(g.h.length>24)g.h.shift();
  const cq=g.co.length?g.co.reduce((s,x)=>s+x.q,0)/g.co.length:30;g.rep=+clamp(g.rep+(20+cq/4+g.eq*3-g.rep)*.03,0,100).toFixed(1);
  if(monthOfDay(G.day||0)%4===0||!g.cand||!g.cand.length)cbOGCands(p);
  const L=g.h.slice(-3);if(L.length===3&&L.every(x=>x[2]<x[3])&&!g.warn){g.warn=1;log(`⚠️ ${g.nm} lleva tres meses perdiendo dinero. Revisa la cuota, los entrenadores y el equipo.`,'bad');}else if(inc>=cost)g.warn=0;}
function cbOGYear(){const p=P;const g=p&&p.cbo&&p.cbo.g;const W=G.cb;if(!g||!W||W.sp!==g.sp)return;const q=cbOGCoachQ(p);
  for(const id of g.F){const f=W.F[id];if(!f)continue;f.pt=+Math.min(97,f.pt+(q-50)/25+(g.eq*.3)).toFixed(1);}}
// 10 % de las bolsas de tus peleadores (y reputación por sus victorias y títulos)
{const _a=cbApply;cbApply=function(A,B,r,bodies){const res=_a(A,B,r,bodies);try{const g=P&&P.cbo&&P.cbo.g;if(g&&G.cb&&G.cb.sp===g.sp){for(const X of [A,B]){if(X.i==='P'||!X.gy)continue;
    const won=(r.w==='a'&&X===A)||(r.w==='b'&&X===B);g.ps=(g.ps||0)+.1*cbOPVal(X)*.7*(X.c===g.c0||!g.c0?cbMkt(G.cb.sp,X.c):1)*(won?1.1:.85);if(won){g.rep=clamp(g.rep+(bodies&&bodies.length?6:.6),0,100);}}}
  const pr=P&&P.cbo&&P.cbo.pr;if(pr&&G.cb&&G.cb.sp===pr.sp)for(const X of [A,B]){if(X.i==='P'||!X.mp)continue;const won=(r.w==='a'&&X===A)||(r.w==='b'&&X===B);if(won&&bodies&&bodies.length)pr.rep=clamp(pr.rep+8,0,100);}}catch(e){}return res;};}

/* ===================== PROMOTORA PROPIA ===================== */
function cbOPOpen(p){const sp=G.cb&&G.cb.sp;if(!sp)return 'Primero necesitas estar en el mundo del box o de las MMA.';p.cbo=p.cbo||{};if(p.cbo.pr)return 'Ya tienes una promotora.';
  const cost=CB_OP[0][1]*U(p);if(p.dinero<cost)return `Registrar una promotora cuesta ${fmt(cost)} (licencia, seguro, capital inicial).`;p.dinero-=cost;
  const nm=sp==='box'?`${pick(CB_PRN)} Promociones`:`Campeonato ${pick(CB_PRN)} de MMA`;
  p.cbo.pr={sp,nm,lv:0,tv:0,tk:1,rep:Math.round(clamp(12+(p.fc?fcFama(p.fc)/3:0),10,55)),F:[],h:[],last:-999,ty:0,auto:0,inv:cost,c:natOf(p).id};
  return `Registras ${p.cbo.pr.nm} ante la comisión de ${natOf(p).name}. Firma peleadores y organiza tu primera función.`;}
function cbOPMax(pr){return [6,12,20][pr.lv];}
// valor de un peleador para una promotora: los clasificados valen su valor de mercado; los demás, según su récord (bolsas de club)
function cbOPVal(f){const W=G.cb;const pos=cbPos(f.i,f.d,W.sp==='mma'?f.lg:-1)||99;if(pos<=25&&f.w>=8)return cbMV(f);return (1200+400*f.w)*(W.sx==='F'?.4:1)*(W.sp==='mma'?.6:1)+Math.pow(Math.max(1,f.hy),.8)*.3;}
const CB_OPCAP=[2e4,2.5e5,1e12];
function cbOPCands(p){const pr=p.cbo.pr;const W=G.cb;if(!W||W.sp!==pr.sp)return [];const nid=natOf(p).id;
  const L=Object.values(W.F).filter(f=>!f.jm&&!f.mp&&!cbBelts(f.i).length&&(W.sp==='mma'?f.lg===2||(pr.lv>=1&&f.lg===1):f.pr<0||(pr.lv>=1&&CB_PROM[f.pr]&&CB_PROM[f.pr][2]===1)));
  const V=L.map(f=>[f,cbOPVal(f)]).filter(x=>x[1]<=CB_OPCAP[pr.lv]);
  return V.sort((a,b)=>(b[0].c===nid)-(a[0].c===nid)||b[1]-a[1]).slice(0,12).map(x=>x[0]);}
function cbOPSignCost(f){const W=G.cb;const buy=W.sp==='box'&&f.pr>=0?1.5:W.sp==='mma'&&f.lg===1?1.5:1;return .25*cbOPVal(f)*buy;}
function cbOPSign(p,id){const pr=p.cbo.pr;const f=G.cb.F[id];if(!f)return '';if(pr.F.length>=cbOPMax(pr))return `Una ${CB_OP[pr.lv][0].toLowerCase()} puede tener ${cbOPMax(pr)} peleadores.`;
  const cost=toInt(cbOPSignCost(f),'USD');if(p.dinero<cost)return `El bono por firma es de ${fmt(cost)}.`;p.dinero-=cost;f.mp=1;f.pr=-1;if(G.cb.sp==='mma')f.lg=2;
  pr.F.push({i:id,min:Math.round(cbOPPurse(f,true,pr)*.8/100)*100,y1:G.year+3});return `${f.n} (${cbRec(f)}) firma por 3 años. Bono ${fmt(cost)}; bolsa mínima ${cbUSDl(pr.F[pr.F.length-1].min)} por pelea.`;}
function cbOPRelease(p,id){const pr=p.cbo.pr;const f=G.cb&&G.cb.F[id];pr.F=pr.F.filter(x=>x.i!==id);if(f){f.mp=0;}return f?`Liberas a ${f.n} de su contrato.`:'';}
function cbOPUp(p){const pr=p.cbo.pr;if(pr.lv>=2)return 'Ya eres una promotora internacional.';const T=CB_OP[pr.lv+1];if(pr.rep<T[2])return `Pide reputación ${T[2]} (tienes ${Math.round(pr.rep)}).`;const cost=T[1]*U(p);if(p.dinero<cost)return `Cuesta ${fmt(cost)}.`;
  p.dinero-=cost;pr.lv++;pr.inv+=cost;return `${pr.nm} ahora es una ${T[0].toLowerCase()}: recintos más grandes, más peleadores y mejores contratos de televisión.`;}
function cbOPTVPct(pr){if(pr.tv>=3)return 0;if(pr.tv>=pr.lv+1)return 0;return clamp(Math.round((.7-pr.tv*.18+pr.rep/200)*100),5,92);}
function cbOPTV(p){const pr=p.cbo.pr;if(pr.ty===G.year)return {t:'Ya negociaste con las televisoras este año.'};const pct=cbOPTVPct(pr);if(!pct)return {t:pr.tv>=3?'Ya tienes el mejor contrato de televisión.':'Para un contrato mayor necesitas subir de nivel tu promotora.'};
  pr.ty=G.year;const roll=RI(1,100),ok=roll<=pct;if(ok)pr.tv++;return {t:ok?`Cierras el contrato: ${CB_TV[pr.tv][0].toLowerCase()}. Cada función cobrará más derechos de transmisión.`:'Las televisoras no ven suficiente audiencia todavía. Intenta el próximo año.',roll,pct,ok};}
// el rival para un peleador de tu promotora: cercano en el ranking, libre y que no sea de tu promotora; si no hay, un peleador de relleno
function cbOPOpp(f,title){const W=G.cb;const now=cbNow();if(title!=null&&title>=0){const ch=W.ch[cbKey(title,f.d)];if(ch&&ch!=='P'&&W.F[ch]&&!W.F[ch].mp)return W.F[ch];return null;}
  const L=cbRank(f.d,W.sp==='mma'?f.lg:-1);const i=L.indexOf(f.i);const C=L.filter((x,j)=>x!=='P'&&x!==f.i&&W.F[x]&&!W.F[x].mp&&!W.F[x].jm&&now-W.F[x].lf>45&&!cbBelts(x).length&&Math.abs(j-(i<0?L.length:i))<=7&&(cbOPVal(W.F[x])<=CB_OPCAP[(P.cbo&&P.cbo.pr?P.cbo.pr.lv:2)]*1.2));
  if(C.length)return W.F[pick(C)];return cbGen(W,f.d,f.c,null,{r:clamp(f.r-R(6,16),25,70),nf:RI(10,30),wr:R(.35,.55),g:RI(25,35),jm:1,e:R(850,960),lg:f.lg});}
function cbOPTitleOpts(f){const W=G.cb;const out=[];const nb=W.sp==='box'?4:3;for(let b=0;b<nb;b++){if(W.sp==='mma'&&b!==f.lg)continue;const ch=W.ch[cbKey(b,f.d)];if(!ch||ch==='P'||!W.F[ch]||W.F[ch].mp)continue;const pos=cbPos(f.i,f.d,b);if(pos&&pos<=3)out.push(b);}return out;}
// bolsa que paga tu promotora: valor del peleador × rounds (estelar 0.9, preliminar 0.55) × mercado del país en funciones locales y nacionales
function cbOPPurse(f,main,pr){const mk=pr.lv<2?cbMkt(G.cb.sp,pr.c):1;return Math.max(G.cb.sp==='mma'?200:300,(f.jm?2500*(G.cb.sx==='F'?.4:1):cbOPVal(f))*(main?.9:.55)*mk);}
function cbOPPlan(p,mi,title,tk){const pr=p.cbo.pr;const W=G.cb;const cs=pr.F.map(x=>W.F[x.i]).filter(Boolean);const M=W.F[(pr.F[mi]||{}).i];if(!M)return null;const now=cbNow();
  if(now-M.lf<45)return {err:`${M.n} peleó hace poco: necesita al menos 45 días entre peleas.`};
  const O=cbOPOpp(M,title);if(!O)return {err:'No hay rival disponible para esa pelea.'};const mk=cbMkt(W.sp,pr.c);const tt=title!=null&&title>=0;
  const und=cs.filter(f=>f!==M&&now-f.lf>45).slice(0,3).map(f=>[f,cbOPOpp(f,null)]);
  const T=CB_OP[pr.lv];const price=T[6]*CB_TK[tk][1]*Math.sqrt(mk);const hy=[600,2500,6000][pr.lv]+pr.rep*25+(M.hy+O.hy)*.05+und.reduce((s,[a,b])=>s+(a.hy+b.hy)*.01,0)+(tt?T[3]*.3:0);
  const att=Math.round(Math.min(T[3],hy*Math.pow(CB_TK[tk][1],-1.4)));const tix=att*price;const tv=CB_TV[pr.tv][1]*mk*(.4+pr.rep/100)*(tt?1.5:1);
  const ppvOn=pr.lv===2&&(cbMV(M)+cbMV(O))>6e5;const buys=ppvOn?Math.round((M.hy+O.hy)*.012*(1+pr.rep/200)):0;const ppv=buys*40*.5;const spn=4000*(pr.lv+1)*(.5+pr.rep/60)*Math.sqrt(mk);
  const mine=x=>{const c=pr.F.find(y=>y.i===x.i);return Math.max(c?c.min:0,cbOPPurse(x,x===M,pr));};const purM=mine(M),purO=tt?cbMV(O)*1.1:cbOPPurse(O,true,pr)*.85;
  const purU=und.reduce((s,[a,b])=>s+mine(a)+cbOPPurse(b,false,pr)*.85,0);const ven=T[4]*mk,prod=T[5]*mk;const sanc=tt?(purM+purO)*.03:0;
  const inc=tix+tv+ppv+spn,cost=purM+purO+purU+ven+prod+sanc;
  return {M,O,und,title,tk,price,att,cap:T[3],tix,tv,ppv,buys,spn,purM,purO,purU,ven,prod,sanc,inc,cost,net:inc-cost};}
function cbOPEvent(p,mi,title,tk,X0){const pr=p.cbo.pr;const W=G.cb;if(cbNow()-pr.last<28)return {err:'Organizas como máximo una función al mes.'};const X=X0&&X0.M&&W.F[X0.M.i]&&W.F[X0.O.i]?X0:cbOPPlan(p,mi,title,tk);if(!X||X.err)return X||{err:''};
  const bodies=title!=null&&title>=0?cbBeltsD(X.O.i,X.M.d):null;const res=[];const fight=(a,b,bd)=>{const r=cbQuick(a,b);cbApply(a,b,r,bd);const w=r.w==='b'?b:a,l=r.w==='b'?a:b;res.push({t:cbResTxt(w,l,r),mine:(r.w==='a'),w:r.w});return r;};
  for(const [a,b] of X.und)fight(a,b,null);const rm=fight(X.M,X.O,bodies);
  const ev=`${pick(['Noche de','Furia de','Gloria de','Guerra de'])} ${pick(CB_PRN)}`;const net=X.net;p.dinero+=toInt(net,'USD');pr.last=cbNow();
  const wins=res.filter(r=>r.mine).length;const tWin=bodies&&bodies.length&&rm.w==='a';pr.rep=+clamp(pr.rep+X.att/X.cap*3+wins*1.2+(tWin?10:0)-(net<0?2:0)-(res.length-wins)*.5,0,100).toFixed(1);
  pr.h.push({y:G.year,ev,mt:res[res.length-1].t,att:X.att,cap:X.cap,inc:Math.round(X.inc),cost:Math.round(X.cost),net:Math.round(net)});if(pr.h.length>20)pr.h.shift();
  const nn=`${pr.nm} presenta «${ev}»: ${res[res.length-1].t}.`;if(tWin)mkNews(nn,true);else archiveNews(nn,'news','nac');
  return {X,res,ev,net,tWin};}
function cbOPMonth(p){const pr=p.cbo&&p.cbo.pr;if(!pr)return;const W=G.cb;if(!W||W.sp!==pr.sp)return;const now=cbNow();
  pr.F=pr.F.filter(x=>{const f=W.F[x.i];if(!f){return false;}if(x.y1<G.year){f.mp=0;log(`Termina el contrato de ${f.n} con ${pr.nm}.`);return false;}if(now-f.lf>270){f.mp=0;log(`${f.n} deja ${pr.nm}: lleva más de nueve meses sin pelear.`,'bad');pr.rep=clamp(pr.rep-3,0,100);return false;}return true;});
  const ff=typeof FF_ON!=='undefined'&&FF_ON;if((pr.auto||ff)&&now-pr.last>=58&&pr.F.length){let b=-1,bv=-1e18;pr.F.forEach((x,i)=>{const f=W.F[x.i];if(!f||now-f.lf<45)return;const pl=cbOPPlan(p,i,null,pr.tk);if(pl&&!pl.err&&pl.net>bv){bv=pl.net;b=i;}});
    if(b>=0&&bv>-(CB_OP[pr.lv][4]*cbMkt(W.sp,pr.c)*.3)){const r=cbOPEvent(p,b,null,pr.tk);if(r&&!r.err)log(`🎟️ ${pr.nm}: «${r.ev}». ${r.res[r.res.length-1].t}. Resultado de la función: ${cbUSDl(r.net)}.`,r.net>=0?'good':'bad');}}}
function cbOPRenew(p,id){const pr=p.cbo.pr;const x=pr.F.find(y=>y.i===id);const f=G.cb.F[id];if(!x||!f)return '';const cost=toInt(cbOPVal(f)*.15,'USD');if(p.dinero<cost)return `Renovar cuesta ${fmt(cost)}.`;
  p.dinero-=cost;x.y1=G.year+3;x.min=Math.round(Math.max(x.min,cbOPPurse(f,true,pr)*.8)/100)*100;return `Renuevas a ${f.n} por 3 años más (bolsa mínima ${cbUSDl(x.min)}).`;}
function cbOPClose(p){const pr=p.cbo.pr;if(!pr)return '';for(const x of pr.F){const f=G.cb&&G.cb.F[x.i];if(f)f.mp=0;}const v=pr.inv*.3*(.5+pr.rep/100);p.dinero+=v;p.cbo.pr=null;return `Vendes ${pr.nm} por ${fmt(v)}.`;}

/* ----- integración con el reloj ----- */
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(P&&P.alive){if(cbSp(P)&&P.fc.cb)cbMonth17(P);if(P.cbo&&G.cb){cbOGMonth(P);cbOPMonth(P);}}}catch(e){if(typeof console!=='undefined')console.error('cb17 mes',e);}};}
{const _au=ageUp;ageUp=function(){const q=P;_au();try{if(q&&q===P&&q.alive){if(cbSp(q)&&q.fc.cb)cbYear17(q);if(q.cbo&&G.cb)cbOGYear();}}catch(e){if(typeof console!=='undefined')console.error('cb17 año',e);}};}
// en el avance rápido tu equipo también hace bloques de entrenamiento (no gasta tu dinero en sesiones)
{const _am=cbAutoManage;cbAutoManage=function(p){_am(p);try{const c=cbR17(p);if(c&&!p.fc.inj&&c.fat<45&&chance(.5)){const L=cbBlkL(cbSp(p));const j=c.fight?(c.fight.cp&&c.fight.cp.s?L.length-2:L.findIndex(b=>b[6]==='s')):RI(0,L.length-3);cbBlock(p,j,1);}}catch(e){}};}
ACT_COST.unshift([/^⭐ Bloque/,20],[/^⭐ Buscar talento/,5],[/^⭐ Función/,6]);
for(const S of CB_SES)ACT_COST.unshift([new RegExp('^⭐ Sesión: '+S[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),S[4]]);

/* ----- diálogos con causa ----- */
D_({id:'cb_fatiga',cat:'deporte',title:'«Estás sobreentrenado»',cool:300,npc:p=>{const c=cbC(p);return c?Object.assign(npc(p,'entrenador'),{name:cbGym(p).co.name}):null;},
 w:p=>{const c=cbC(p);return c&&c.fat>72?1+(c.fat-72)/15:0;},
 N:{a:{t:(p,n,c,x)=>`${x.name} te detiene a mitad del entrenamiento. «Llevas semanas cargando sin descansar. Tu fatiga está en ${Math.round(cbC(p).fat)}. Así es como llegan las lesiones y las peleas sin piernas.»`,
  o:[{t:'Tomar una semana de descanso',ok:{r:'Descansas de verdad. Vuelves con las piernas frescas.',go:p=>{cbC(p).fat=Math.max(0,cbC(p).fat-30);},fx:{ft:-7,s:{felicidad:2}}}},
   {t:'«Un poco más, ya casi es la pelea»',k:['salud',55],ok:{r:'Tu cuerpo aguanta, esta vez.',fx:{rel:-2}},ko:{r:'Un tirón en la espalda: un mes fuera.',go:p=>{p.fc.inj=Math.max(p.fc.inj||0,1);},fx:{rel:-3}}}]}}});
D_({id:'cb_seleccion',cat:'deporte',title:'La concentración de la selección',cool:400,npc:p=>npc(p,'entrenador'),
 w:p=>{const c=cbC(p);return c&&!c.pro&&cbSelOn(c)?.9:0;},
 N:{a:{t:(p,n,c,x)=>`${x.name}, entrenador de la selección nacional, te llama a una concentración de tres semanas antes del próximo torneo internacional. Es un honor, pero tendrás que dejar tu gimnasio y tu vida por un tiempo.`,
  o:[{t:'Ir a la concentración',ok:{r:'Tres semanas con los mejores de tu país: subes de nivel y te ganas el respeto del cuerpo técnico.',go:p=>{const c=cbC(p);c.at[5]=clamp(c.at[5]+1.5,0,99);c.at[3]=clamp(c.at[3]+1,0,99);c.am.pt+=4;cbSync(p);},fx:{ft:-20}}},
   {t:'Excusarte: tienes otros compromisos',ok:{r:'El cuerpo técnico toma nota. Tus puntos en el ranking bajan.',go:p=>{cbC(p).am.pt=Math.max(0,cbC(p).am.pt-6);}}}]}}});
D_({id:'cb_tu_peleador',cat:'deporte',title:'Un peleador de tu gimnasio quiere irse',cool:500,npc:p=>npc(p,'rival'),
 w:p=>{const g=p.cbo&&p.cbo.g;if(!g||!G.cb||G.cb.sp!==g.sp)return 0;const f=g.F.map(i=>G.cb.F[i]).find(f=>f&&f.r>70);return f?.7:0;},
 N:{a:{t:(p,n,c,x)=>{const g=p.cbo.g;const f=g.F.map(i=>G.cb.F[i]).filter(f=>f&&f.r>70).sort((a,b)=>b.r-a.r)[0];c.fid=f.i;c.fn=f.n;return `${f.n} (${cbRec(f)}) toca la puerta de tu oficina. «Me buscó un gimnasio grande. Me ofrecen mejores sparrings y un entrenador de nombre. Te debo mucho, pero tengo que pensar en mi carrera.»`;},
  o:[{t:'Ofrecerle un mejor trato (menos comisión)',ok:{r:'Se queda contigo. Tu comisión baja, pero tu gimnasio conserva a su estrella.',go:p=>{p.cbo.g.rep=clamp(p.cbo.g.rep+2,0,100);}}},
   {t:'Convencerlo con el proyecto del gimnasio',k:['carisma',55],ok:{r:'Le muestras lo que vienen construyendo juntos. Se queda.',go:p=>{p.cbo.g.rep=clamp(p.cbo.g.rep+3,0,100);}},ko:{r:'No lo convences: se va y tu gimnasio pierde prestigio.',go:(p,n,c)=>{const g=p.cbo.g;g.F=g.F.filter(i=>i!==c.fid);const f=G.cb.F[c.fid];if(f)f.gy=0;g.rep=clamp(g.rep-6,0,100);}}},
   {t:'Dejarlo ir con tu bendición',ok:{r:'Se despiden con un abrazo. Otros jóvenes del barrio ven cómo tratas a los tuyos.',go:(p,n,c)=>{const g=p.cbo.g;g.F=g.F.filter(i=>i!==c.fid);const f=G.cb.F[c.fid];if(f)f.gy=0;g.rep=clamp(g.rep+1,0,100);}}}]}}});

// acceso a tus negocios del box o de las MMA aunque ya no pelees
{const _co=careerOptions;careerOptions=function(){const a=_co();try{const p=P;if(p&&p.cbo&&(p.cbo.g||p.cbo.pr)&&!cbSp(p))a.push({sec:'Fama y espectáculo',t:'🥊 Tus negocios del combate',s:[p.cbo.g?p.cbo.g.nm:'',p.cbo.pr?p.cbo.pr.nm:''].filter(Boolean).join(' · '),can:true,fn:()=>{if(typeof showCBO==='function'&&typeof setTimeout!=='undefined')setTimeout(()=>showCBO(),0);return null;}});}catch(e){}return a;};}
