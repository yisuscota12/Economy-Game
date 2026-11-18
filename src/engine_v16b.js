/* ===== v1.6b: el mundo del box y las MMA =====
   Peleadores generados por división (nacionalidad, estilo, atributos, récord, potencial, promotora), cuatro organismos de box y tres ligas de MMA con campeones,
   simulación mensual del mundo (peleas, títulos, unificaciones, retiros, prospectos), y la carrera del jugador: amateur y torneos, profesional, gimnasios,
   promotoras, ofertas y negociación de bolsas, carteleras, pelea por rounds con jueces, estadísticas, suspensiones médicas y daño acumulado. */
var CB_AUTO=typeof document==='undefined';var CB_DF={box:.92,mma:1.1,kd:28,kdb:7,mkd:19,mkdb:4,sub:1.6}; // sin pantalla (pruebas) las peleas se resuelven solas
const cbSp=p=>p&&p.fc&&(p.fc.k==='box'||p.fc.k==='mma')?p.fc.k:null;
const cbC=p=>p&&p.fc&&p.fc.cb;
const cbNA=sp=>CB_AT[sp].length;
const wpick=o=>{let s=0;for(const k in o)s+=o[k];let r=Math.random()*s;for(const k in o){r-=o[k];if(r<=0)return k;}return Object.keys(o)[0];};
const cbNm=id=>{const n=G.nations[id];return n?n.name:id;};
const cbSur=f=>{const a=(f.n||'').split(' ');return a.length>1?a.slice(1).join(' '):a[0];};
const cbDivN=(sp,d)=>CB_DIV[sp][d][0];
const cbLim=(sp,d)=>{const l=CB_DIV[sp][d][1];return l?`${l} lb (${cbKg(l)} kg)`:'sin límite';};
const cbKey=(b,d)=>b+'-'+d;
const cbNow=()=>Math.max(absDay(),G.cb&&G.cb.t||0); // reloj del mundo de los golpes (sigue avanzando en el avance rápido)

/* ----- generación del mundo ----- */
function cbNatPick(sp,d,home){const o=Object.assign({},CB_NAT[sp]);for(const k in o){if(!G.nations[k]){delete o[k];continue;}if(sp==='box'){if(d<6&&CB_LIGHT[k])o[k]*=CB_LIGHT[k];if(d<6&&CB_HEAVY[k])o[k]*=.35;if(d>=13&&CB_HEAVY[k])o[k]*=CB_HEAVY[k];if(d>=13&&CB_LIGHT[k])o[k]*=.3;}}
  if(home&&G.nations[home])o[home]=(o[home]||0)+6;return wpick(o);}
function cbAttrs(sp,st,r){return CB_ST[sp][st].t.map(m=>clamp(Math.round(r*m+R(-6,6)),15,99));}
// q: 0 = élite … 1 = fondo de la división; null = prospecto recién llegado
function cbGen(W,d,home,q,o){o=o||{};const sp=W.sp,sx=W.sx;const nid=o.c||cbNatPick(sp,d,home);const c=cultOf(nid);
  const r=o.r!=null?o.r:q==null?R(40,56):clamp(93-q*44+R(-5,5),40,96);const age=o.g||(q==null?RI(19,23):clamp(Math.round(24+(1-q)*6+R(-4,5)),20,38));
  const st=RI(0,CB_ST[sp].length-1);const at=cbAttrs(sp,st,r);const nf=o.nf!=null?o.nf:q==null?RI(3,9):RI(10,44);
  const wr=o.wr!=null?o.wr:q==null?R(.82,1):clamp(.62+(1-q)*.33+R(-.08,.06),.3,1);let w=Math.round(nf*wr),dr=chance(.3)?RI(0,2):0,l=Math.max(0,nf-w-dr);
  const ko=Math.round(w*clamp(at[0]/120+R(-.1,.1),.15,.9));
  const lg=sp==='mma'?(o.lg!=null?o.lg:q==null?2:q<.42?0:q<.75?1:2):0;
  let pr=-1;if(sp==='box'){if(q!=null&&q<.55&&chance(.75))pr=RI(0,4);else{const nat=CB_PROM.findIndex(x=>x[1]===nid&&x[2]===1);pr=nat>=0&&chance(.6)?nat:chance(.5)?RI(0,9):-1;}}
  const id='f'+(W.nx++);const fans=Math.round(Math.pow(10,2+(r-40)/12+R(-.5,.6))*(sx==='F'?.5:1));
  W.F[id]={i:id,n:rndFirst(sx,c)+' '+rndSur(c),ap:chance(.5)?pick(sx==='F'?CB_APF:CB_AP):'',c:nid,g:age,s:st,d,r:+r.toFixed(1),pt:+(o.pt||clamp(r+(age<27?R(0,14):0),r,97)).toFixed(1),at,w,l,dr,ko,
    e:Math.round(o.e||600+r*10+R(-40,40)),pr,lg,lf:cbNow()-RI(0,150),hy:fans,jm:o.jm?1:0};return W.F[id];}
function cbNew(sp,sx,home){const W={v:1,sp,sx,F:{},nx:1,ch:{},ev:[],y0:G.year,mand:{}};const D=CB_DIVS[sp][sx];
  for(const d of D){const n=sx==='F'?(sp==='mma'?20:14):(sp==='mma'?24:22);for(let i=0;i<n;i++)cbGen(W,d,home,i/n);}
  // campeones iniciales: el mejor puede tener varios cinturones (unificado); los demás se reparten entre los mejores
  for(const d of D){const L=Object.values(W.F).filter(f=>f.d===d).sort((a,b)=>b.r-a.r);
    if(sp==='box'){for(let b=0;b<4;b++){const k=b===0||chance(.35)?0:Math.min(L.length-1,RI(1,4));W.ch[cbKey(b,d)]=L[k].i;}}
    else for(let lg=0;lg<3;lg++){const M=L.filter(f=>f.lg===lg);if(M.length)W.ch[cbKey(lg,d)]=M[0].i;}}
  return W;}
function cbEnsureWorld(p){const sp=cbSp(p);if(!sp)return null;const sx=p.sex==='F'?'F':'M';if(!G.cb||G.cb.sp!==sp||G.cb.sx!==sx)G.cb=cbNew(sp,sx,natOf(p).id);return G.cb;}

/* ----- peleadores y rankings ----- */
function cbMe(p){p=p||P;const f=p.fc,c=f.cb;return {i:'P',n:fullName(p),ap:c.ap||'',c:natOf(p).id,g:p.age,s:c.st,d:c.d,r:f.sk,at:cbAtEff(p),w:c.w,l:c.l,dr:c.dr,ko:c.ko,e:c.e,pr:c.prom&&c.prom.i!=null?c.prom.i:-1,lg:c.lg,lf:c.lf||0,hy:fcFans(f),me:1};}
function cbF(id){if(id==='P')return P&&cbC(P)?cbMe(P):null;return G.cb&&G.cb.F[id]||null;}
function cbPw(f){const a=f.at,sp=G.cb?G.cb.sp:'box';const ag=f.g<23?.97:f.g>34?1-(f.g-34)*.015:1;
  return (sp==='box'?a[0]*.2+a[1]*.19+a[2]*.19+a[3]*.13+a[4]*.13+a[5]*.16:a[0]*.13+a[1]*.11+a[2]*.11+a[3]*.12+a[4]*.1+a[5]*.11+a[6]*.16+a[7]*.16)*ag;}
function cbList(d,lg){const W=G.cb;const L=Object.values(W.F).filter(f=>f.d===d&&(W.sp!=='mma'||lg==null||f.lg===lg));const p=P;const c=cbC(p);
  if(c&&c.pro&&cbSp(p)===W.sp&&c.d===d&&(W.sp!=='mma'||lg==null||c.lg===lg))L.push(cbMe(p));return L;}
const cbHash=(s,b)=>{let h=b*7919;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return ((h>>>0)%1000)/1000;};
const cbScore=(f,b)=>{const n=f.w+f.l+(f.dr||0);return f.e*.5+(600+f.r*10)*.5+Math.min(60,f.w*2)-Math.max(0,8-n)*25+(b>=0&&G.cb.sp==='box'?(cbHash(f.i,b)-.5)*70:0)-(cbNow()-(f.lf||0)>420?120:0)-(f.jm?400:0);};
// ranking de un organismo (box) o liga (MMA); b = −1: ranking mundial consolidado
function cbRank(d,b){const W=G.cb;const lg=W.sp==='mma'?(b<0?null:b):null;const ch=b>=0?W.ch[cbKey(b,d)]:null;
  return cbList(d,lg).filter(f=>f.i!==ch).sort((x,y)=>cbScore(y,b)-cbScore(x,b)).map(f=>f.i);}
function cbPos(id,d,b){const L=cbRank(d,b==null?-1:b);const i=L.indexOf(id);return i<0?null:i+1;}
function cbBelts(id){const W=G.cb;if(!W)return [];const out=[];for(const k in W.ch)if(W.ch[k]===id)out.push(+k.split('-')[0]);return out;}
function cbBeltsD(id,d){const W=G.cb;const out=[];const n=W.sp==='box'?4:3;for(let b=0;b<n;b++)if(W.ch[cbKey(b,d)]===id)out.push(b);return out;}
const cbOrgN=b=>G.cb.sp==='box'?CB_ORG[b][0]:CB_LG[b][0];
function cbRec(f){return `${f.w}-${f.l}${f.dr?'-'+f.dr:''}`;}
function cbStyleMod(a,b){const M=CB_MATCH[G.cb.sp];return (M[a.s]||[])[b.s]||0;}

/* ----- pelea rápida (el resto del mundo) ----- */
function cbElo(a,b,res){const K=32;const ea=1/(1+Math.pow(10,(b.e-a.e)/400));const sa=res==='a'?1:res==='b'?0:.5;const fin=res!=='d'&&/KO|TKO|SUB|RTD/.test(cbElo.m||'')?1.25:1;
  const dA=K*fin*(sa-ea);return [Math.round(dA),Math.round(-dA)];}
function cbQuick(A,B){const sp=G.cb.sp;const d=cbPw(A)-cbPw(B)+cbStyleMod(A,B)*60;const pa=1/(1+Math.exp(-d/5.5));
  if(chance(.025))return {w:null,m:'EMP',rd:0};const aw=chance(pa);const W=aw?A:B,L=aw?B:A;const mx=sp==='box'?(A.jm||B.jm?8:12):3;
  let pf=sp==='box'?clamp(.3+(W.at[0]-L.at[4])/110+Math.abs(d)/60,.1,.85):clamp(.35+Math.abs(d)/55+(Math.max(W.at[0]-L.at[4],W.at[7]-L.at[7])/150),.15,.85);
  if(chance(pf)){const sub=sp==='mma'&&W.at[7]>W.at[0]&&chance(.6);return {w:aw?'a':'b',m:sub?'SUB':chance(.55)?'KO':'TKO',rd:RI(1,mx)};}
  return {w:aw?'a':'b',m:Math.abs(d)>4?'DU':chance(.6)?'DU':chance(.6)?'DD':'DM',rd:mx};}
// aplica un resultado del mundo (no del jugador): récords, elo, fama, cinturones en juego
function cbApply(A,B,r,bodies){const W=G.cb;cbElo.m=r.m;const [da,db]=cbElo(A,B,r.w||'d');if(A.i!=='P'){A.e+=da;A.lf=cbNow();}if(B.i!=='P'){B.e+=db;B.lf=cbNow();}
  const fin=/KO|TKO|SUB|RTD/.test(r.m);
  if(!r.w){if(A.i!=='P')A.dr++;if(B.i!=='P')B.dr++;}else{const X=r.w==='a'?A:B,Y=r.w==='a'?B:A;if(X.i!=='P'){X.w++;if(fin)X.ko++;X.hy=Math.round(X.hy*(fin?1.12:1.06));}if(Y.i!=='P'){Y.l++;Y.hy=Math.round(Y.hy*.93);}
    if(bodies&&bodies.length)for(const b of bodies){const k=cbKey(b,A.d);if(W.ch[k]===Y.i||W.ch[k]==null){W.ch[k]=X.i;if(X.i!=='P')X.hy=Math.round(X.hy*1.4);}}}
  return r;}
function cbNews(t,nids,big){const W=G.cb;W.ev.push({y:G.year,d:G.day||0,t});if(W.ev.length>60)W.ev.shift();if(typeof archiveNews!=='function'||!P)return;const me=natOf(P).id;
  if(nids.includes(me))archiveNews(t,'news','nac');else if(big)archiveNews(t,'news','int');}
function cbResTxt(X,Y,r){return r.w?(/KO|TKO|SUB|RTD/.test(r.m)?`${X.n} (${cbNm(X.c)}) vence a ${Y.n} por ${CB_M[r.m]} en el round ${r.rd}`:`${X.n} (${cbNm(X.c)}) vence a ${Y.n} por ${CB_M[r.m]}`):`${X.n} y ${Y.n} empatan`;}

/* ----- el mundo, mes a mes ----- */
function cbWorldMonth(){const W=G.cb;if(!W)return;const sp=W.sp;const pd=cbC(P)&&cbSp(P)===sp?P.fc.cb.d:-1;W.t=Math.max(absDay(),(W.t||absDay()-30)+30.4);const now=W.t;
  for(const d of CB_DIVS[sp][W.sx]){const nb=sp==='box'?4:3;
    // defensas de título (los cinturones del jugador se defienden en su carrera, no aquí)
    for(let b=0;b<nb;b++){const k=cbKey(b,d);const cid=W.ch[k];if(!cid||cid==='P')continue;const C=W.F[cid];if(!C){delete W.ch[k];continue;}if(now-C.lf<150||!chance(.3))continue;
      const bs=cbBeltsD(cid,d);let opp=null,unif=false;
      if(sp==='box'&&chance(.12)){const oc=[0,1,2,3].map(x=>W.ch[cbKey(x,d)]).filter(x=>x&&x!==cid&&x!=='P'&&W.F[x]&&now-W.F[x].lf>90);if(oc.length){opp=W.F[oc[0]];unif=true;}}
      if(!opp){const L=cbRank(d,b).filter(x=>x!=='P'&&W.F[x]&&now-W.F[x].lf>75&&cbBeltsD(x,d).length===0);if(!L.length)continue;opp=W.F[L[chance(.6)?0:RI(0,Math.min(4,L.length-1))]];}
      const at=unif?bs.concat(cbBeltsD(opp.i,d)):bs;const r=cbQuick(C,opp);cbApply(C,opp,r,at);
      const X=r.w==='b'?opp:C,Y=r.w==='b'?C:opp;const orgs=at.map(cbOrgN).join(', ');
      cbNews(r.w==='b'?(at.length>1?`¡Nuevo campeón! ${cbResTxt(X,Y,r)} y se queda con los cinturones ${orgs} de peso ${cbDivN(sp,d).toLowerCase()}.`:`¡Nuevo campeón! ${cbResTxt(X,Y,r)} y se queda con el cinturón ${orgs} de peso ${cbDivN(sp,d).toLowerCase()}.`):(unif?`Unificación: ${cbResTxt(X,Y,r)} y retiene ${orgs} de peso ${cbDivN(sp,d).toLowerCase()}.`:`${cbResTxt(X,Y,r)} y retiene ${orgs} de peso ${cbDivN(sp,d).toLowerCase()}.`),[X.c,Y.c],r.w==='b'&&(d===pd||unif));}
    // carteleras normales: rivales cercanos en el ranking
    const L=cbRank(d,-1).filter(x=>x!=='P');for(let i=0;i<L.length;i++){const A=W.F[L[i]];if(!A||now-A.lf<90||!chance(.22))continue;
      // peleas de preparación contra rivales sin clasificar: así se construyen los récords invictos de los prospectos
      if(!A.jm&&((A.w+A.l<15&&chance(.6))||chance(.3))){A.lf=now;if(chance(.93)){A.w++;if(chance(.55+A.at[0]/400))A.ko++;A.e+=4;}else{A.l++;A.e-=25;}continue;}
      const cand=(chance(.7)?L.slice(i+1,i+9):L.slice(Math.max(0,i-4),i)).filter(x=>x!==A.i&&W.F[x]&&now-W.F[x].lf>=90&&(sp!=='mma'||W.F[x].lg===A.lg));if(!cand.length)continue;const B=W.F[pick(cand)];
      const r=cbQuick(A,B);cbApply(A,B,r,null);const X=r.w==='b'?B:A,Y=r.w==='b'?A:B;if(i<6&&(d===pd))cbNews(`${cbDivN(sp,d)}: ${cbResTxt(X,Y,r)}.`,[X.c,Y.c],false);}}
  // títulos vacantes
  for(const d of CB_DIVS[sp][W.sx]){const nb=sp==='box'?4:3;for(let b=0;b<nb;b++){const k=cbKey(b,d);if(W.ch[k])continue;const L=cbRank(d,b).filter(x=>x!=='P');if(L.length<2)continue;const A=W.F[L[0]],B=W.F[L[1]];const r=cbQuick(A,B);cbApply(A,B,r,[b]);
    const X=r.w==='b'?B:A,Y=r.w==='b'?A:B;if(!W.ch[k])W.ch[k]=X.i;cbNews(`Título vacante ${cbOrgN(b)} de peso ${cbDivN(sp,d).toLowerCase()}: ${cbResTxt(X,Y,r)} y es el nuevo campeón.`,[X.c,Y.c],d===pd);}}}
function cbWorldYear(){const W=G.cb;if(!W)return;const sp=W.sp;
  for(const id in W.F){const f=W.F[id];f.g++;if(f.g<28)f.r+=(f.pt-f.r)*.3;else if(f.g>32)f.r-=R(.5,3)*(f.g>35?2:1);f.r=+clamp(f.r,25,97).toFixed(1);
    const base=CB_ST[sp][f.s].t;f.at=f.at.map((v,i)=>clamp(Math.round(v+(f.r*base[i]-v)*.5),15,99));
    const ref=P&&cbC(P)&&((P.fc.cb.fight&&P.fc.cb.fight.o===id)||P.fc.cb.offers.some(o=>o.o===id)||P.fc.cb.rm===id);if(ref)continue;
    const ret=(f.jm&&cbNow()-f.lf>300)||f.g>=40||(f.g>=35&&chance(.22))||(f.r<44&&f.g>27&&chance(.3))||(f.l-f.w>8&&chance(.5))||(f.jm&&f.g>36);
    if(ret){for(const k in W.ch)if(W.ch[k]===id)delete W.ch[k];if(!f.jm&&f.w>=25)cbNews(`Se retira ${f.n} (${cbNm(f.c)}) con récord de ${cbRec(f)} y ${f.ko} nocauts.`,[f.c],false);delete W.F[id];}}
  // prospectos: mantienen poblada cada división
  for(const d of CB_DIVS[sp][W.sx]){const n=Object.values(W.F).filter(f=>f.d===d&&!f.jm).length;const tgt=W.sx==='F'?(sp==='mma'?20:14):(sp==='mma'?24:22);for(let i=n;i<tgt+1;i++)cbGen(W,d,P?natOf(P).id:null,null,{pt:58+37*Math.pow(Math.random(),1.3)});}
  // MMA: ascensos y cortes entre ligas
  if(sp==='mma')for(const f of Object.values(W.F)){if(f.lg>0&&f.r>(f.lg===2?64:74)&&chance(.4)){for(const k in W.ch)if(W.ch[k]===f.i)delete W.ch[k];f.lg--;}else if(f.lg<2&&f.r<(f.lg===0?62:52)&&f.g>29&&chance(.35)){for(const k in W.ch)if(W.ch[k]===f.i)delete W.ch[k];f.lg++;}}}

/* ===================== LA CARRERA DEL JUGADOR ===================== */
function cbDefDiv(sp,sx){return sp==='box'?(sx==='F'?RI(2,8):RI(6,12)):(sx==='F'?RI(0,3):RI(3,6));}
function cbInit(p){const sp=cbSp(p);if(!sp)return;const f=p.fc;cbEnsureWorld(p);const sx=p.sex==='F'?'F':'M';
  const st=RI(0,CB_ST[sp].length-1);const at=CB_ST[sp][st].t.map(m=>clamp(Math.round(f.sk*m+R(-3,3)),5,99));at[4]=clamp(Math.round(52+gz()*11),25,88); // la quijada es casi toda natural
  f.cb={st,d:cbDefDiv(sp,sx),at,am:{w:0,l:0,ko:0,md:[],ty:{},nat:0},pro:false,w:0,l:0,dr:0,ko:0,e:900,lg:2,prom:null,po:[],gym:0,gyms:null,chem:.85,fight:null,offers:[],hist:[],dmg:0,susp:0,lf:0,ap:'',mand:0,dope:0,fix:0,rm:null,callout:0};
  // migración de la v1.6: si ya peleabas, eres profesional
  if(f.rec&&f.rec[0]+f.rec[1]>0){Object.assign(f.cb,{pro:true,w:f.rec[0],l:f.rec[1],ko:f.rec[2],e:Math.round(900+Math.max(0,99-(f.rk||90))*6)});}
  cbGymsGen(p);cbSync(p);}
function cbEnsure(p){if(!cbSp(p))return null;if(!p.fc.cb)cbInit(p);cbEnsureWorld(p);if(!p.fc.cb.gyms)cbGymsGen(p);return p.fc.cb;}
function cbSync(p){const f=p.fc,c=f.cb;f.sk=+(c.at.reduce((s,v)=>s+v,0)/c.at.length).toFixed(1);if(G.cb&&c.pro){const pos=cbPos('P',c.d,G.cb.sp==='mma'?c.lg:-1);f.rk=cbBelts('P').length?1:pos||99;}else f.rk=99;
  f.rec=[c.w,c.l,c.ko];}
// atributos efectivos: el daño acumulado erosiona la quijada; el dopaje los infla
function cbAtEff(p){const c=p.fc.cb;return c.at.map((v,i)=>clamp(Math.round(v-(i===4?c.dmg*.5:0)+(c.dope&&(i===0||i===3)?5:0)),5,99));}

/* ----- gimnasios ----- */
const CB_GT=[['Comunitario',0,.7,.3],['De barrio',.25,1,.5],['Profesional',1.2,1.35,.7],['Alto rendimiento',4,1.6,.85],['Campamento de élite',0,1.8,1]]; // nombre, costo anual (salarios medios), eficacia, sparring
function cbGymsGen(p){const c=p.fc.cb,sp=cbSp(p);const n=natOf(p);const city=RG[p.r].nm,cap=RG[capitalOf(n.id)]?RG[capitalOf(n.id)].nm:city;const cu=cultOf(n.id);
  const coach=()=>{const sx=chance(.85)?'M':'F';return {name:rndFirst(sx,cu)+' '+rndSur(cu),sex:sx,age:RI(38,70),tr:pick(['honesto','leal','generoso','ambicioso','codicioso','rencoroso'])};};
  const box=sp==='box';const ex=box?[['Campamento de altura en las montañas de California','USA'],['Gimnasio histórico de la Ciudad de México','MEX'],['Academia de box de Sheffield','GBR']]:[['Academia Cumbre de Albuquerque','USA'],['Equipo Jaguar de Río de Janeiro','BRA'],['Centro de lucha de Majachkalá','RUS']];
  const e=pick(ex);const sp2=box?[0,1,2,3,5]:[0,2,5,6,7];
  c.gyms=[{nm:`Gimnasio comunitario de ${city}`,t:0,co:coach(),spec:pick(sp2)},{nm:`${box?'Box':'MMA'} ${rndSur(cu)} (${city})`,t:1,co:coach(),spec:pick(sp2)},{nm:`${pick(['Club','Academia','Team'])} ${pick(['Titanes','Leones','Puño de Hierro','Guerreros','Fénix','Cobras','Halcones'])} (${city})`,t:2,co:coach(),spec:pick(sp2)},
    {nm:`Centro de Alto Rendimiento de ${cap}`,t:3,co:coach(),spec:pick(sp2)},{nm:e[0],t:4,co:Object.assign(coach(),{name:rndFirst('M',cultOf(e[1]))+' '+rndSur(cultOf(e[1]))}),spec:pick(sp2),abroad:e[1]}];}
function cbGym(p){const c=p.fc.cb;return c.gyms[c.gym]||c.gyms[0];}
function cbGymCost(p,g){return g.t===4?toInt(1.2e5,'USD'):Math.round(CB_GT[g.t][1]*U(p));}
function cbGymReq(p,g){const c=p.fc.cb;if(g.t===3&&!(p.fc.sk>=42||c.am.nat||c.am.md.length))return 'Pide nivel 42 o una medalla nacional.';if(g.t===4&&!(p.fc.sk>=58||(c.pro&&p.fc.rk<=30)))return 'Pide nivel 58 o estar en el top 30 mundial.';
  if(p.dinero<cbGymCost(p,g)/4)return `Necesitas al menos ${fmt(cbGymCost(p,g)/4)} para la inscripción.`;return '';}
function cbSetGym(p,i){const c=p.fc.cb,g=c.gyms[i];const rq=cbGymReq(p,g);if(rq)return rq;if(i===c.gym)return 'Ya entrenas ahí.';c.gym=i;c.chem=.85;p.fc.coach=Math.min(3,g.t);
  return `Te cambias a ${g.nm}. Tu entrenador ahora es ${g.co.name}. La química con el nuevo equipo tarda meses en construirse (rendimiento ×${c.chem}).`;}

/* ----- entrenamiento ----- */
function cbTrain(p,i){const f=p.fc,c=f.cb,sp=cbSp(p);const g=cbGym(p);if(f.trY!==G.year){f.trY=G.year;f.trN=0;}
  const lvl=f.sk<40?1.4:f.sk<55?1:f.sk<70?.62:f.sk<82?.32:.14;const base=.75*CB_GT[g.t][2]*c.chem*f.tal*(1+p.s.salud/120)*lvl*(p.age<18?.85:1)/(1+.12*f.trN++);
  const n=cbNA(sp);const sp1=g.spec===i?1.3:1;for(let k=0;k<n;k++){const m=(k===i?(k===4?.6:1.7*sp1):k===4?.12:.42*(g.spec===k?1.2:1))*clamp((100-c.at[k])/40,.08,1);c.at[k]=clamp(c.at[k]+base*m,0,99);}
  p.s.salud=clamp(p.s.salud+1,0,100);cbSync(p);
  if(chance(.022*(g.t<1?1.6:1)*(p.age>32?1.4:1))){f.inj=RI(1,3);return `Te lesionas entrenando: ${f.inj} mes(es) fuera. (Un gimnasio mejor cuida más la carga de trabajo.)`;}
  return `Entrenas ${CB_AT[sp][i].toLowerCase()} en ${g.nm}: ${CB_AT[sp][i]} ${Math.round(c.at[i])} · nivel general ${f.sk.toFixed(1)}.`;}
function cbSpar(p){const f=p.fc,c=f.cb,sp=cbSp(p);const g=cbGym(p);const q=CB_GT[g.t][3];const gain=(.35+q*.5)*f.tal*(f.sk<50?1:f.sk<70?.55:.3);
  c.at[5]=clamp(c.at[5]+gain*clamp((100-c.at[5])/40,.08,1),0,99);c.at[2]=clamp(c.at[2]+gain*.6*clamp((100-c.at[2])/40,.08,1),0,99);if(sp==='mma'){c.at[6]=clamp(c.at[6]+gain*.4,0,99);c.at[7]=clamp(c.at[7]+gain*.4,0,99);}c.dmg+=.15;cbSync(p);
  if(chance(.03)){f.inj=1;return 'Una lesión menor en el sparring te deja un mes fuera.';}
  return (q>=.85?`Haces sparring con peleadores profesionales de primer nivel: tu técnica sube a ${Math.round(c.at[5])} y tu defensa a ${Math.round(c.at[2])}.`:q>=.6?`Haces sparring con profesionales del gimnasio: tu técnica sube a ${Math.round(c.at[5])} y tu defensa a ${Math.round(c.at[2])}.`:`Haces sparring con compañeros del gimnasio: tu técnica sube a ${Math.round(c.at[5])} y tu defensa a ${Math.round(c.at[2])}.`);}

/* ----- amateur ----- */
const cbMyPw=p=>cbPw(cbMe(p));
function cbAmFight(p){const c=p.fc.cb,sp=cbSp(p);if(c.pro)return 'Ya eres profesional.';const me=cbMyPw(p);const opp=clamp(me+R(-12,10),15,80);const pw=clamp(.5+(me-opp)/22,.04,.96);const cu=cultOf(natOf(p).id);const nm=rndFirst(p.sex==='F'?'F':'M',cu)+' '+rndSur(cu);
  const win=chance(pw);const ko=win&&chance(sp==='box'?.18:.35);if(win){c.am.w++;if(ko)c.am.ko++;}else c.am.l++;c.at[5]=clamp(c.at[5]+.2*(p.fc.sk<60?1:.4),0,99);c.dmg+=.05;fcAddFans(p,win?40:20,.25);cbSync(p);
  return ((r_,pp_)=>win?(ko?(sp==='box'?`Pelea amateur contra ${nm}: ¡ganas por RSC (el réferi detiene el combate)! (probabilidad ${pp_} %). Récord amateur ${r_}.`:`Pelea amateur contra ${nm}: ¡ganas por sumisión! (probabilidad ${pp_} %). Récord amateur ${r_}.`):`Pelea amateur contra ${nm}: ganas por decisión (probabilidad ${pp_} %). Récord amateur ${r_}.`):`Pelea amateur contra ${nm}: pierdes por decisión (probabilidad ${pp_} %). Récord amateur ${r_}.`)(`${c.am.w}-${c.am.l}`,Math.round(pw*100));}
function cbAmReq(p,k){const c=p.fc.cb,sp=cbSp(p);const T=CB_AMT[sp][k];if(c.pro)return 'Solo para amateurs.';if(c.am.ty[k]===G.year)return 'Ya participaste este año.';
  if(T[3]==='nac'&&c.am.w<4)return 'Pide 4 victorias amateur.';if(T[3]==='cont'&&!(c.am.nat>=G.year-1))return 'Pide ser campeón nacional (este año o el anterior).';
  if(T[3]==='mund'&&sp==='box'&&G.year%2===0)return 'El mundial amateur es en años impares.';if(T[3]==='mund'&&!(c.am.nat>=G.year-1))return 'Pide ser campeón nacional.';
  if(T[3]==='olim'&&G.year%4!==0)return `Los próximos Juegos Olímpicos son en ${G.year+(4-G.year%4)}.`;if(T[3]==='olim'&&!(c.am.nat>=G.year-1||c.am.md.some(m=>m.y>=G.year-2&&/continental|mundial/i.test(m.t))))return 'Pide título nacional o medalla continental/mundial reciente (clasificatorio).';
  return '';}
function cbTourney(p,k){const c=p.fc.cb,sp=cbSp(p);const rq=cbAmReq(p,k);if(rq)return rq;const T=CB_AMT[sp][k];c.am.ty[k]=G.year;const me=cbMyPw(p);const n=T[2];const rn=['Final','Semifinal','Cuartos de final','Octavos de final','Dieciseisavos'];const out=[];let res=0;
  for(let i=0;i<n;i++){const opp=T[1][0]+(T[1][1]-T[1][0])*i/Math.max(1,n-1)+R(-5,5);const nid=k<2?natOf(p).id:cbNatPick(sp,c.d,null);const cu=cultOf(nid);const nm=rndFirst(p.sex==='F'?'F':'M',cu)+' '+rndSur(cu);
    const pw=clamp(.5+(me-opp)/22,.03,.97);const win=chance(pw);const who=k>=2?`${nm} (${cbNm(nid)})`:nm;out.push((win?`${rn[n-1-i]}: vences a ${who}`:`${rn[n-1-i]}: pierdes ante ${who}`)+` · ${Math.round(pw*100)} %`);
    if(win){c.am.w++;res=i+1;}else{c.am.l++;break;}}
  c.at[5]=clamp(c.at[5]+.5*(p.fc.sk<65?1:.4),0,99);cbSync(p);let md='';
  if(res===n)md='oro';else if(res===n-1)md='plata';else if(res===n-2&&sp==='box'&&n>=4)md='bronce';
  if(md){c.am.md.push({y:G.year,t:T[0],m:md});if(T[3]==='nac'&&md==='oro')c.am.nat=G.year;const big=[.05,.12,.25,.45,1][k]*(md==='oro'?1:md==='plata'?.6:.4);fcBump(p,big);p.fc.aw.push({y:G.year,t:`${md==='oro'?'🥇':md==='plata'?'🥈':'🥉'} ${T[0]}`});
    if(k>=3)mkNews(`${fullName(p)} gana la medalla de ${md} en ${T[0].toLowerCase()} para ${natOf(p).name}.`,k===4||md==='oro');}
  return `${T[0]}:\n${out.join('\n')}\n${md?`🏅 ¡Medalla de ${md}!`:'Te quedas sin medalla.'}`;}
function cbGoPro(p){const c=p.fc.cb;if(c.pro)return 'Ya eres profesional.';if(p.age<18)return 'Debes tener 18 años para debutar como profesional.';c.pro=true;
  const bon=c.am.md.reduce((s,m)=>s+({oro:1,plata:.65,bronce:.45}[m.m]||0)*(/Olímp/.test(m.t)?220:/mundial/i.test(m.t)?150:/continental/i.test(m.t)?80:/nacional/i.test(m.t)?30:8),0);
  c.e=Math.round(900+Math.min(260,bon+Math.min(80,c.am.w*2)));c.lg=2;c.lf=absDay();cbPromOffers(p,true);cbSync(p);
  return (c.am.md.length?`Debutas como profesional. Tu historial amateur (${c.am.w}-${c.am.l}, ${c.am.md.length} medalla(s)) define cuánto interés despiertas en las promotoras. Revisa las ofertas de contrato.`:`Debutas como profesional. Tu historial amateur (${c.am.w}-${c.am.l}) define cuánto interés despiertas en las promotoras. Revisa las ofertas de contrato.`);}

/* ----- promotoras y ligas ----- */
function cbPromOffers(p,force){const c=p.fc.cb,sp=cbSp(p);const n=natOf(p);const cu=cultOf(n.id);c.po=[];const fans=fcFans(p.fc);const md=c.am.md;
  const olim=md.some(m=>/Olímp/.test(m.t)),mund=md.some(m=>/mundial/i.test(m.t));const rk=p.fc.rk||99;
  if(sp==='box'){c.po.push({nm:`Promociones ${rndSur(cu)}`,i:-1,t:2,yrs:2,fpy:3,min:1500,bono:1000});
    if(c.e>=1040||c.am.nat||fans>2e4||rk<=40){const j=CB_PROM.findIndex(x=>x[1]===n.id&&x[2]===1);c.po.push({nm:j>=0?CB_PROM[j][0]:`${n.name} Box Promociones`,i:j,t:1,yrs:3,fpy:3,min:6000,bono:Math.round(R(8e3,2.5e4))});}
    if(c.e>=1150||olim||mund||fans>3e5||rk<=20){const j=RI(0,4);c.po.push({nm:CB_PROM[j][0],i:j,t:0,yrs:RI(3,5),fpy:3,min:olim?6e4:2.5e4,bono:Math.round((olim?R(6e5,1.5e6):mund?R(2e5,5e5):R(5e4,2e5))*(p.sex==='F'?.4:1))});}}
  else{const w=c.w,streak=c.hist.slice(-4).every(h=>h.r==='W')&&c.hist.length>=3;
    c.po.push({nm:`Liga nacional de MMA de ${n.name}`,i:2,lg:2,t:2,yrs:2,fpy:3,min:800,bono:0});
    if((c.lg===2&&(streak||cbBelts('P').length))||w>=6||mund)c.po.push({nm:CB_LG[1][1],i:1,lg:1,t:1,yrs:2,fpy:3,min:5000,bono:5000});
    if((c.lg<=1&&(streak||cbBelts('P').length))||(w>=10&&c.l<=1)||fans>2e5)c.po.push({nm:CB_LG[0][1],i:0,lg:0,t:0,yrs:2,fpy:3,min:12000,bono:0});}
  if(!force&&c.prom)c.po=c.po.filter(o=>o.t<c.prom.t);
  return c.po.length;}
function cbSignProm(p,i){const c=p.fc.cb,sp=cbSp(p);const o=c.po[i];if(!o)return '';let x='';if(c.prom&&G.year-c.prom.y0<c.prom.yrs){const pen=Math.round(c.prom.min*c.prom.fpy*(c.prom.yrs-(G.year-c.prom.y0))*.5);p.dinero-=toInt(pen,'USD');x=` Rompes tu contrato anterior: pagas ${fmt(toInt(pen,'USD'))} de penalización.`;}
  c.prom=Object.assign({},o,{y0:G.year});c.po=[];if(sp==='mma'){if(c.lg!==o.lg)for(const k in G.cb.ch)if(G.cb.ch[k]==='P')delete G.cb.ch[k];c.lg=o.lg;}if(o.bono){p.dinero+=fcNet(p,o.bono);p.fc.earn+=o.bono;}
  c.offers=[];cbSync(p);return ((o.bono?`Firmas con ${o.nm} por ${o.yrs} años: ${o.fpy} peleas al año garantizadas, bolsa mínima de ${fmt(toInt(o.min,'USD'))} y bono por firma de ${fmt(toInt(o.bono,'USD'))}.`:`Firmas con ${o.nm} por ${o.yrs} años: ${o.fpy} peleas al año garantizadas, bolsa mínima de ${fmt(toInt(o.min,'USD'))}.`)+x);}

/* ----- valor de mercado y bolsas ----- */
function cbMV(f){const W=G.cb;const pos=cbPos(f.i,f.d,W.sp==='mma'?f.lg:-1)||40;const champ=cbBeltsD(f.i,f.d).length;
  let base=champ?1.2e6*(1+.3*(champ-1)):pos<=1?9e5:pos<=5?5e5:pos<=10?2.2e5:pos<=15?1.1e5:pos<=25?4e4:1.2e4;
  if(f.me&&!champ&&(pos>15||f.w<8))base=2000+1200*f.w;if(!f.me&&f.jm)base=2500;
  if(W.sp==='mma'){const L=f.lg||0;base=champ?[5e5,6e4,8e3][L]*(1+.3*(champ-1)):f.jm?[8e3,2500,700][L]:f.me&&(pos>8||f.w<5)?[12e3,4e3,700][L]+[1500,500,150][L]*f.w:pos<=1?[3e5,4e4,5e3][L]:pos<=5?[1.5e5,2.5e4,3e3][L]:[4e4,1e4,1500][L];}
  const dv=W.sp==='box'?(f.d<6?.35:f.d<10?.7:f.d===16?2.5:1):(f.d>=8?1.4:f.d<=1?.6:1);const fanV=Math.pow(Math.max(1,f.hy),.85)*1.2;return (base*dv+fanV)*(W.sx==='F'?.4:1);}
function cbRounds(p,kind){const c=p.fc.cb;if(cbSp(p)==='mma')return kind===3?5:3;if(kind===3)return 12;const n=c.w+c.l+c.dr;return n<4?4:n<8?6:n<12?8:kind>=2?12:10;}
const CB_POS=['Preliminar','Semifondo','Pelea estelar'];
function cbMkOffer(p,kind,free,oid){const c=p.fc.cb,W=G.cb,sp=W.sp;const me=cbMe(p);const L=cbRank(c.d,sp==='mma'?c.lg:-1);const pos=L.indexOf('P');const n=c.w+c.l+c.dr;let opp=oid&&W.F[oid]||null,bodies=[];
  const myB=cbBelts('P');if(kind===3&&!opp&&myB.length){const L=cbRank(c.d,myB[0]).filter(x=>x!=='P'&&W.F[x]&&!W.F[x].jm);if(L.length){opp=W.F[L[RI(0,Math.min(2,L.length-1))]];bodies=myB.slice();}}
  if(kind===3&&!opp){const nb=sp==='box'?4:3;const cand=[];for(let b=0;b<nb;b++){if(sp==='mma'&&b!==c.lg)continue;const ch=W.ch[cbKey(b,c.d)];if(!ch||ch==='P')continue;const pb=cbPos('P',c.d,b);const minW=sp==='box'?12:[6,4,3][c.lg];if(pb&&pb<=(sp==='box'?5:3)&&c.w>=minW)cand.push([b,ch,pb]);}
    if(!cand.length)kind=2;else{cand.sort((a,b)=>a[2]-b[2]);const [b,ch]=cand[0];opp=W.F[ch];bodies=cbBeltsD(ch,c.d);}}
  if(!opp&&c.rm&&W.F[c.rm]&&chance(.6)){opp=W.F[c.rm];c.rm=null;kind=Math.max(kind,1);}
  if(!opp&&(n<6||kind===0)&&(n<6||chance(.5))){opp=cbGen(W,c.d,natOf(p).id,null,{r:clamp(p.fc.sk-R(4,18),25,70),nf:RI(10,35),wr:R(.3,.55),g:RI(24,36),jm:1,e:R(850,960),c:chance(.7)?natOf(p).id:null,lg:c.lg});}
  if(!opp){const lo=kind===0?pos+3:kind===1?pos-3:pos-12,hi=kind===0?pos+15:kind===1?pos+3:pos-3;const cand=L.slice(Math.max(0,lo),Math.max(0,hi)+1).filter(x=>x!=='P'&&W.F[x]&&!W.F[x].jm);
    if(!cand.length)return null;opp=W.F[pick(cand)];}
  if(cbBeltsD(opp.i,c.d).length&&kind!==3)return null;if(oid&&kind===3)bodies=cbBelts('P'); // los campeones solo arriesgan el cinturón
  const mvM=cbMV(me),mvO=cbMV(opp);const aside=mvM>=mvO;const rd=cbRounds(p,kind);const prT=c.prom?c.prom.t:3;
  const vt=kind===3&&bodies.length||(mvM+mvO)>6e5?2:(mvM+mvO)>6e4||prT<=1?1:0;const ps=aside?(rd>=10?2:1):(rd>=10?1:0);
  const rf={3:.55,4:.5,5:1.15,6:.7,8:.85,10:1,12:1.2}[rd]||1;const pf=[1.25,1,.9,.7][prT];const prf=c.prom&&c.prom.i>=0&&sp==='box'?CB_PROM[c.prom.i][3]/1.15:1;
  let $=(aside?mvM:Math.max(mvM*.85,mvO*(kind===3?.2:.3)))*rf*pf*prf*R(.88,1.1)*(free?.7:1);if(c.prom)$=Math.max($,c.prom.min);$=Math.round($/100)*100;
  const cap=sp==='box'?RG[p.r].nm:RG[p.r].nm;const ven=vt===2?pick(CB_VEN2).slice():vt===1?[`Arena ${RG[capitalOf(natOf(p).id)]?RG[capitalOf(natOf(p).id)].nm:cap}`,natOf(p).name]:[pick(['Arena','Auditorio municipal','Palenque','Gimnasio municipal'])+' de '+cap,cap];
  const prn=c.prom?c.prom.nm:free?'Promotor independiente':'—';
  return {o:opp.i,k:kind,rd,vt,ps,ven,$,ppv:0,t:bodies,pr:prn,dt:absDay()+RI(42,84),dl:absDay()+21,ng:0,last:false,aside};}
function cbKindPick(p){const c=p.fc.cb;const n=c.w+c.l+c.dr;if(n<6)return 0;const r=Math.random();const pos=p.fc.rk||99;if(cbBelts('P').length)return r<.8?3:1;
  if(pos<=6&&(c.callout===G.year||chance(.3))){return 3;}return r<.3?0:r<.75?1:2;}
function cbOffersGen(p,n,free){const c=p.fc.cb;let k=0;for(let i=0;i<n*3&&k<n;i++){const o=cbMkOffer(p,cbKindPick(p),free);if(o&&!c.offers.some(x=>x.o===o.o)){c.offers.push(o);k++;}}if(c.offers.length>4)c.offers=c.offers.slice(-4);return k;}
function cbCanFight(p){const f=p.fc,c=f.cb;if(p.prison)return 'Estás en prisión.';if(!c.pro)return 'Primero debuta como profesional.';if(f.inj)return `Estás lesionado: faltan ${f.inj} mes(es).`;
  if(c.susp>absDay())return `Suspensión médica: faltan ${c.susp-absDay()} días.`;if(c.ban>absDay())return `Suspendido por dopaje hasta ${Math.floor(c.ban/365)}.`;if(c.fight)return 'Ya tienes una pelea programada.';
  if(cbSp(p)==='mma'&&!c.prom)return 'En las MMA necesitas contrato con una liga para pelear. Revisa tus ofertas de contrato.';return '';}
function cbSeek(p){const c=p.fc.cb;const blk=cbCanFight(p);if(blk)return blk;const k=cbOffersGen(p,c.prom?2:1,!c.prom);
  return k?(c.prom?`${c.prom.nm} te consigue ${k} oferta(s) de pelea. Revísalas en la pestaña Ofertas.`:`Llamas a promotores independientes y consigues ${k} oferta(s) de pelea. Revísalas en la pestaña Ofertas.`):'Nadie quiere pelear contigo este mes. Intenta más adelante o sube en el ranking.';}

/* ----- negociación de la bolsa ----- */
// ask: 1 = +15 %, 2 = +35 %, 3 = porcentaje del PPV, 4 = cláusula de revancha, 5 = más tiempo de campamento
function cbNegoPct(p,i,ask){const c=p.fc.cb,o=c.offers[i];if(!o)return 0;const me=cbMe(p),op=cbF(o.o);if(!op)return 0;const lev=Math.log2(clamp(cbMV(me)/Math.max(1,cbMV(op)),.2,6));
  const ag=(AGENT[p.fc.ag][2]-1)*.25;const same=c.prom&&op.pr===c.prom.i?.08:0;
  let b=.36+.2*lev+ag+same-o.ng*.14-(o.k===3&&!o.aside?.1:0);
  if(ask===2)b-=.25;if(ask===3){if(fcFans(p.fc)<8e5)return 0;b-=.15;}if(ask===4)b+=.05;if(ask===5)b+=.2;return clamp(Math.round(b*100),3,92);}
function cbNego(p,i,ask){const c=p.fc.cb,o=c.offers[i];if(!o)return {t:''};if(o.last)return {t:'El promotor ya dio su última oferta: tómala o déjala.'};const pct=cbNegoPct(p,i,ask);if(!pct)return {t:'No tienes el público suficiente para pedir parte del pago por evento (PPV).'};
  const roll=RI(1,100),ok=roll<=pct;o.ng++;let t;
  if(ok){if(ask===1)o.$=Math.round(o.$*1.15/100)*100;if(ask===2)o.$=Math.round(o.$*1.35/100)*100;if(ask===3)o.ppv=+(R(.25,.5)*(o.aside?1:.6)).toFixed(2);if(ask===4)o.rmc=1;if(ask===5)o.dt+=21;
    t=`✅ Aceptan: ${ask<=2?`la bolsa sube a ${fmt(toInt(o.$,'USD'))}`:ask===3?`te dan ${Math.round(o.ppv*100)} % de las ganancias del pago por evento`:ask===4?'incluyen cláusula de revancha si pierdes':'la pelea se mueve tres semanas: más campamento'}.`;}
  else if(chance(.45+o.ng*.1)){c.offers.splice(i,1);t='❌ El otro lado se levanta de la mesa: la oferta se cae.';}else{o.last=true;t='⚠️ No aceptan. Es su última oferta: tómala o déjala.';}
  return {t,roll,pct,ok};}
function cbPPVEst(p,o){const op=cbF(o.o);const buys=(fcFans(p.fc)+(op?op.hy:0))*.012*(1+(o.hy||0)*.25);return {buys:Math.round(buys),rev:buys*35*(o.ppv||0)};}
function cbAccept(p,i){const c=p.fc.cb,o=c.offers[i];if(!o)return '';const blk=cbCanFight(p);if(blk)return blk;const op=cbF(o.o);
  ensureFt(p);const cost=actCost('⭐ Campamento');const paid=Math.min(cost,p.ft);p.ft-=paid;syncActs(p);o.cq=+(paid/cost).toFixed(2);o.team={cut:0,pf:0,nut:0};o.hy=0;
  // cartelera: otras peleas de la noche
  const W=G.cb;const pool=Object.values(W.F).filter(f=>!f.jm&&f.i!==o.o&&cbNow()-f.lf>60&&(W.sp!=='mma'||f.lg===c.lg));const card=[];
  for(let k=0;k<4&&pool.length>1;k++){const a=pool.splice(RI(0,pool.length-1),1)[0];const near=pool.filter(f=>f.d===a.d);if(!near.length)continue;const b=near[RI(0,near.length-1)];pool.splice(pool.indexOf(b),1);card.push([a.i,b.i]);}
  o.card=card;o.ev=(o.vt===2?pick(['Noche de Campeones','Choque de Titanes','Gloria o Nada','Guerra en el Ring','La Revancha del Siglo']):o.vt===1?pick(['Noche de Box','Viernes de Golpes','Furia en la Arena','Sábado de Combate']):pick(['Función de box','Velada de golpes','Noche de prospectos']))+(G.cb.sp==='mma'?` · ${c.prom?c.prom.nm:'MMA'}`:'');
  c.fight=o;c.offers=[];const d=o.dt-absDay();
  return ((G.cb.sp==='mma'?`Firmas la pelea contra ${op.n} (${cbRec(op)}): ${o.rd} rounds, ${CB_POS[o.ps].toLowerCase()} en ${o.ven[0]}, ${o.ven[1]}, dentro de ${d} días. Bolsa ${fmt(toInt(o.$,'USD'))} + ${fmt(toInt(o.$,'USD'))} si ganas.`:`Firmas la pelea contra ${op.n} (${cbRec(op)}): ${o.rd} rounds, ${CB_POS[o.ps].toLowerCase()} en ${o.ven[0]}, ${o.ven[1]}, dentro de ${d} días. Bolsa ${fmt(toInt(o.$,'USD'))}.`)+(o.cq<1?` ⚠️ No tienes tiempo libre suficiente: campamento al ${Math.round(o.cq*100)} %.`:''));}
const CB_TEAM={cut:['Cutman (cortes)',1500],pf:['Preparador físico',4000],nut:['Nutriólogo (corte de peso)',2500]};
function cbTeamCost(o,k){return Math.round(CB_TEAM[k][1]*(o.vt===2?4:o.vt===1?2:1));}

/* ----- semana de la pelea: rueda de prensa y pesaje ----- */
function cbPress(p,ch){const c=p.fc.cb,o=c.fight;if(!o||o.press)return {t:''};o.press=1;const f=p.fc;let t,roll=null,pct=null;
  if(ch===0){f.img=clamp(f.img+3,0,100);t='Hablas con respeto de tu rival. La prensa te describe como un deportista serio. Imagen +3.';}
  else if(ch===1){o.hy+=1;t='Dices con calma que vas a ganar y explicas por qué. Los titulares hablan de tu confianza. Expectativa +1.';}
  else if(ch===2){pct=chkPct(p,'carisma',52);roll=RI(1,100);if(roll<=pct){o.hy+=2;fcAddFans(p,55,.5);t='Tus provocaciones se vuelven virales: todo el mundo quiere ver la pelea. Expectativa +2.';}else{o.hy+=1;f.img=clamp(f.img-8,0,100);t='La provocación cae mal: te acusan de irrespetuoso. Expectativa +1, imagen −8.';}}
  else{o.hy+=3;const fine=Math.round(o.$*.07);o.fine=(o.fine||0)+fine;t=`El careo termina en empujones y la seguridad os separa. Expectativa +3, pero la comisión te multa con ${fmt(toInt(fine,'USD'))}.`;if(chance(.3))t+=' '+fcScandal(p,'una pelea en el careo de la rueda de prensa');}
  return {t,roll,pct};}
function cbWeighRisk(p){const c=p.fc.cb,o=c.fight;return clamp(.05+(c.dDown===G.year?.18:0)+(p.age>32?.04:0)-(o.team.nut?.07:0)-o.cq*.03,0,.4);}
function cbWeigh(p,ch){const c=p.fc.cb,o=c.fight,sp=cbSp(p);const lim=CB_DIV[sp][c.d][1];
  if(ch==null){if(o.wt)return o.wt;if(!lim||!chance(cbWeighRisk(p))){o.wt={ok:1,t:(lim?`Das el peso sin problemas: ${cbKg(lim-R(.2,1))} kg (límite ${cbKg(lim)} kg).`:'Das el peso sin problemas.')};return o.wt;}o.wt={ok:0,t:`En la báscula marcas ${cbKg(lim+R(.6,2.5))} kg: ¡te pasaste del límite de ${cbKg(lim)} kg! Te quedan dos horas.`};return o.wt;}
  if(ch===0){o.wt={ok:1,cut:1,t:'Pasas dos horas en el sauna y con ropa térmica: das el peso, pero llegas deshidratado (menos resistencia y quijada en la pelea).'};}
  else{o.wt={ok:1,miss:1,t:o.t.length?'Aceptas la multa: 20 % de tu bolsa pasa a tu rival. El título no está en juego para ti: si ganas, el cinturón queda vacante.':'Aceptas la multa: 20 % de tu bolsa pasa a tu rival.'};}return o.wt;}

/* ===================== PELEA POR ROUNDS ===================== */
const cbPlanAI=(f,sp)=>CB_ST[sp][f.s].pl;
function cbSide(f,home,o){const sp=G.cb.sp;return {i:f.i,n:f.n,ap:f.ap||'',c:f.c,s:f.s,at:f.at.slice(),hp:100,sta:100,cut:0,kd:0,kdR:0,pl:cbPlanAI(f,sp),home:f.c===home?1:0,rec:cbRec(f)};}
function cbJudges(home){const out=[];for(let j=0;j<3;j++){const nid=chance(.4)?home:pick(['USA','GBR','MEX','JPN','PHL','ESP','CAN','AUS','ARG','ZAF','THA','FRA']);const cu=cultOf(nid);
  out.push({n:rndFirst(chance(.7)?'M':'F',cu)+' '+rndSur(cu),c:nid,agg:+R(.6,1.4).toFixed(2),cl:+R(.8,1.2).toFixed(2),hb:nid===home?.6:0});}return out;}
function cbSetup(p){const c=p.fc.cb,o=c.fight,sp=cbSp(p);const op=cbF(o.o);const me=cbMe(p);const home=o.vt===2&&o.ven[2]?o.ven[2]:natOf(p).id;
  const A=cbSide(me,home),B=cbSide(op,home);A.pl=c.plan||A.pl;A.sta=70+30*o.cq+(o.team.pf?5:0);A.at=A.at.map(v=>Math.round(v*(.94+.06*o.cq)));if(o.wt&&o.wt.cut){A.sta-=20;A.at[4]-=6;}
  if(o.fixed)A.fix=1;
  return {sp,f:[A,B],rd:0,mx:o.rd,j:cbJudges(home),sc:[[],[],[]],st:[],tx:[],end:null,home,t:o.t.slice(),cut:o.team.cut?1:0};}
const cbFill=(s,X,Y,extra)=>s.replace('{a}',X.n.split(' ').slice(-1)[0]).replace('{b}',Y.n.split(' ').slice(-1)[0]).replace('{s}',extra||'');
function cbEndF(S,w,m,rd){S.end={w,m,rd};}
function cbRound(S,corner){if(S.end)return S;const sp=S.sp,P0=CB_PLAN[sp];const A=S.f[0],B=S.f[1];const r=++S.rd;const tx=[];const st=[{th:0,ln:0,pth:0,pln:0,kd:0,td:0,tda:0,ctl:0,sa:0},{th:0,ln:0,pth:0,pln:0,kd:0,td:0,tda:0,ctl:0,sa:0}];
  if(corner&&corner!=='sigue')A.pl=corner;
  // la IA cambia de plan si va perdiendo en la segunda mitad
  if(r>S.mx/2){const cs=cbCards(S);const behind=cs.filter(x=>x[1]<x[0]).length>=2;if(behind)B.pl=B.hp>40?'ko':B.pl;}
  if(A.fix&&r>=Math.ceil(S.mx/2)){cbEndF(S,'b',sp==='box'?'KO':'TKO',r);S.tx.push({r,l:[`${A.n.split(' ').slice(-1)[0]} cae en el round ${r} tras un golpe que pocos vieron...`]});S.st.push(st);return S;}
  const dmg=[0,0];let ctl=0;
  const sides=[[A,B,0],[B,A,1]];
  for(const [X,Y,k] of sides){const PL=P0[X.pl]||P0.eq,PY=P0[Y.pl]||P0.eq,ST=CB_ST[sp][X.s];const fat=.55+.45*X.sta/100,hurt=X.hp<35?.85:1;
    const spd=X.at[1]*fat*hurt,pow=X.at[0]*(.7+.3*fat),iq=X.at[5];const yDef=Y.at[2]*(.6+.4*Y.sta/100)*(Y.hp<35?.8:1)*PY.def;const mt=CB_MATCH[sp][X.s][Y.s];
    let acc=(1+((spd*.5+iq*.5)-yDef)/110+mt)*PL.acc;if(X.pl==='cont'&&(Y.pl==='pres'||Y.pl==='ko'))acc*=1.1;if(X.pl==='pres'&&Y.pl==='dist'&&X.sta>60)acc*=1.05;
    if(sp==='box'){const thrown=Math.round(48*ST.out*PL.out*(.6+.4*X.sta/100)*R(.85,1.15)*(X.hp<25?.8:1));const jf=clamp(ST.jab+(PL.jab||0),.15,.7);const tj=Math.round(thrown*jf),tp=thrown-tj;
      const lj=Math.round(tj*clamp(.24*acc,.06,.5)*R(.85,1.15)),lp=Math.round(tp*clamp(.31*acc,.08,.58)*R(.85,1.15));
      dmg[k]=(lp+lj*.25)*(pow/70)*PL.pw*R(.75,1.25)*CB_DF.box*(1.2-Y.at[4]/250);Object.assign(st[k],{th:thrown,ln:lj+lp,pth:tp,pln:lp});X.sta=clamp(X.sta-(5+thrown/14*PL.dr-X.at[3]/30),5,100);}
    else{// MMA: derribos, control, golpes significativos, sumisiones
      const tda=Math.round((PL.td||1)*(X.at[6]/60)*R(.3,1.5)*(X.sta>30?1:.5));let tdl=0;for(let t=0;t<tda;t++)if(chance(clamp(.3+(X.at[6]-Y.at[6]*.75-Y.at[2]*.25)/100,.05,.85)))tdl++;
      const ct=Math.min(270-ctl,Math.round(tdl*R(50,140)*Math.sqrt(X.at[6]/Math.max(20,Y.at[6]))*(PL.cl||1)));ctl+=Math.max(0,ct);const stand=1-ctl/300;
      const thrown=Math.round(34*ST.out*PL.out*stand*(.6+.4*X.sta/100)*R(.85,1.15));const ln=Math.round(thrown*clamp(.42*acc,.12,.7)*R(.85,1.15));
      const gp=ct/60*X.at[0]*.05;dmg[k]=ln*(pow/70)*PL.pw*R(.75,1.25)*CB_DF.mma*(1.2-Y.at[4]/250)+gp;Object.assign(st[k],{th:thrown,ln,pth:thrown,pln:ln,td:tdl,tda,ctl:Math.max(0,ct)});
      X.sta=clamp(X.sta-(6+thrown/16*PL.dr+tda*1.5-X.at[3]/30),5,100);if(tdl)Y.sta=clamp(Y.sta-tdl*2.5,5,100);
      // sumisión
      if(ct>30){const att=chance(.35*(PL.sb||1)*(X.at[7]/60)*CB_DF.sub)?1:0;if(att){st[k].sa++;const s=pick(CB_TX.mma.sub);const pf=clamp(.05+(X.at[7]-Y.at[7]*.8)/160,.01,.4)*(Y.sta<35?1.4:1);
        if(chance(pf)){tx.push((/llave|kimura|guillotina|estrangulación/.test(s)?`¡${cbFill('{a}',X,Y)} aplica una ${s} y ${cbFill('{b}',X,Y)} se rinde!`:`¡${cbFill('{a}',X,Y)} aplica un ${s} y ${cbFill('{b}',X,Y)} se rinde!`));cbEndF(S,k===0?'a':'b','SUB',r);S.subN=s;}
        else tx.push(cbFill(CB_TX.mma.subx,X,Y,s));}}
      if(tdl)tx.push(cbFill(pick(CB_TX.mma.td),X,Y));else if(tda&&chance(.5))tx.push(cbFill(pick(CB_TX.mma.tdd),X,Y));}}
  // daño, caídas y nocauts
  if(!S.end)for(const [X,Y,k] of sides){const d=dmg[k];Y.hp-=d;if(S.end)break;const pkd=clamp((d-(sp==='box'?CB_DF.kdb:CB_DF.mkdb))/(sp==='box'?CB_DF.kd:CB_DF.mkd)+(45-Y.hp)/140,0,.55)*(1.35-Y.at[4]/100)*(X.at[0]/75);let n=0;
    while(n<3&&chance(pkd*(n?.5:1))){n++;Y.kd++;Y.kdR++;Y.hp-=5;st[k].kd++;tx.push(`¡CAÍDA! ${cbFill('{a}',X,Y)} manda a la lona a ${cbFill('{b}',X,Y)} con ${pick(CB_TX[sp].kd)}.`);
      if(sp==='mma'){if(chance(clamp(.45+(35-Y.hp)/80,.2,.9))){cbEndF(S,k===0?'a':'b','TKO',r);tx.push(`${cbFill('{a}',X,Y)} remata en el suelo y el réferi detiene la pelea.`);break;}continue;}
      const up=clamp(.35+Y.at[4]/180+Y.hp/220-Y.kdR*.12,.04,.97);if(!chance(up)||Y.hp<=0){cbEndF(S,k===0?'a':'b','KO',r);tx.push(`${cbFill('{b}',X,Y)} no se levanta antes de la cuenta de diez. ¡NOCAUT!`);break;}else tx.push(`${cbFill('{b}',X,Y)} se levanta a la cuenta de ${RI(6,9)}.`);}
    if(S.end)break;if(n>=3&&sp==='box'){cbEndF(S,k===0?'a':'b','TKO',r);tx.push('Tres caídas en el round: el réferi termina la pelea.');break;}
    if(Y.hp<=0||(Y.hp<14&&chance(.45))){cbEndF(S,k===0?'a':'b','TKO',r);tx.push(`${cbFill('{b}',X,Y)} ya no se defiende y el réferi detiene la pelea.`);break;}}
  // cortadas (con cutman crecen menos)
  if(!S.end)for(const [X,Y,k] of sides){const hb=chance(.015+(X.s===0&&sp==='box'?.01:0));if(hb||chance(.03+st[k].pln/450)){const grow=(k===0?(S.cut?.6:1):1)*R(.6,1.3);Y.cut+=grow;if(hb)Y.hb=1;if(Y.cut<grow+.01)tx.push(hb?cbFill(CB_TX[sp].hb,X,Y):cbFill(pick(CB_TX[sp].cut),X,Y));}
    if(Y.cut>=3&&chance(.5)){if(Y.hb){if(r>=4){cbEndF(S,'dec','DT',r);tx.push(`El médico revisa la cortada de ${cbFill('{b}',X,Y)} (choque de cabezas) y detiene la pelea: se va a las tarjetas.`);}else{cbEndF(S,null,'ET',r);tx.push('El médico detiene la pelea por una cortada accidental antes del cuarto round: empate técnico.');}}
      else{cbEndF(S,k===0?'a':'b','DOC',r);tx.push(`El médico revisa la cortada de ${cbFill('{b}',X,Y)} y detiene la pelea.`);}break;}}
  // narración del round
  const dom=(st[0].pln*1.4+st[0].ln*.6+st[0].kd*8+st[0].ctl/30)-(st[1].pln*1.4+st[1].ln*.6+st[1].kd*8+st[1].ctl/30);const W2=dom>=0?A:B,L2=dom>=0?B:A;const T=CB_TX[sp];
  if(!S.end){const pl=W2.pl;const lines=[];if(Math.abs(dom)<4)lines.push(pick(T.even));else{lines.push(cbFill(pick(pl==='dist'||pl==='pie'?T.jab:pl==='pres'||pl==='reja'?(T.pres||T.pow):pl==='cont'?(T.cont||T.pow):T.pow),W2,L2));if(chance(.6))lines.push(cbFill(pick(T.pow),W2,L2));}
    if(L2.hp<40&&chance(.6))lines.push(cbFill(pick(T.hurt),W2,L2));if(L2.sta<35&&chance(.5))lines.push(cbFill(pick(T.tired),W2,L2));if(sp==='mma'&&ctl>90)lines.push(cbFill(pick(T.gp),st[0].ctl>=st[1].ctl?A:B,st[0].ctl>=st[1].ctl?B:A));tx.unshift(...lines.slice(0,2));}
  S.tx.push({r,l:tx});S.st.push(st);
  // tarjetas de los jueces (sistema de 10 puntos)
  for(let j=0;j<3;j++){const J=S.j[j];const sc=k=>st[k].pln*1.4*J.cl+(st[k].ln-st[k].pln)*.6+st[k].th*.04*J.agg+st[k].ctl/40+st[k].td*1.2+st[k].sa*1.5+(S.f[k].home?J.hb:0)+gz()*1.2-st[1-k].kd*9;
    const a=sc(0),b=sc(1);let pa=10,pb=10;if(Math.abs(a-b)<(sp==='box'?.6:.3)&&chance(sp==='box'?.35:.12)){}else if(a>b)pb=9;else pa=9;pa-=st[1].kd;pb-=st[0].kd;
    if(sp==='mma'&&Math.abs(a-b)>14){if(a>b)pb=Math.min(pb,8);else pa=Math.min(pa,8);}S.sc[j].push([Math.max(6,pa),Math.max(6,pb)]);}
  // descanso: recuperación; la esquina puede detener la pelea
  if(!S.end){for(const X of [A,B]){X.hp=Math.min(100,X.hp+2+X.at[3]/40);X.sta=Math.min(100,X.sta+4+X.at[3]/25);X.kdR=Math.max(0,X.kdR-1);}
    for(const [X,Y,k] of sides)if(Y.hp<16&&r<S.mx&&chance(.35)){cbEndF(S,k===0?'a':'b','RTD',r);S.tx[S.tx.length-1].l.push(`La esquina de ${cbFill('{b}',X,Y)} no lo deja salir al round ${r+1}.`);break;}
    if(!S.end&&r>=S.mx)cbEndF(S,'dec',null,r);}
  if(S.end&&S.end.w==='dec')cbDecide(S);return S;}
function cbCards(S){return S.sc.map(rs=>rs.reduce((t,x)=>[t[0]+x[0],t[1]+x[1]],[0,0]));}
function cbDecide(S){const cs=cbCards(S);const va=cs.filter(x=>x[0]>x[1]).length,vb=cs.filter(x=>x[1]>x[0]).length,vd=3-va-vb;const tech=S.end.m==='DT';let w=null,m;
  if(va===3||vb===3){w=va===3?'a':'b';m='DU';}else if(va===2||vb===2){w=va===2?'a':'b';m=vd===1?'DM':'DD';}else{m='EMP';}if(tech&&w)m='DT';S.end={w,m,rd:S.rd};return S;}
function cbSimAll(S){let k=0;while(!S.end&&k++<20)cbRound(S,null);return S;}
// totales de estadísticas
function cbTotals(S){const T=[{th:0,ln:0,pth:0,pln:0,kd:0,td:0,tda:0,ctl:0,sa:0},{th:0,ln:0,pth:0,pln:0,kd:0,td:0,tda:0,ctl:0,sa:0}];for(const st of S.st)for(let k=0;k<2;k++)for(const x in T[k])T[k][x]+=st[k][x]||0;return T;}

/* ----- después de la pelea: dinero, récord, ranking, cinturones, fans, daño ----- */
function cbFinish(p,S){const f=p.fc,c=f.cb,o=c.fight,W=G.cb,sp=W.sp;const op=W.F[o.o];const e=S.end;const win=e.w==='a',loss=e.w==='b';const fin=/KO|TKO|SUB|RTD|DOC/.test(e.m);const out=[];
  // récord y elo
  const me=cbMe(p);cbElo.m=e.m;const [da,db]=cbElo(me,op,win?'a':loss?'b':'d');c.e+=da;if(op){op.e+=db;op.lf=cbNow();}c.lf=absDay();
  if(win){c.w++;if(fin)c.ko++;if(op)op.l++;}else if(loss){c.l++;if(op){op.w++;if(fin)op.ko++;}}else{c.dr++;if(op)op.dr++;}
  // cinturones
  let titleTxt='';if(o.t.length){const missed=o.wt&&o.wt.miss;const mine=o.t.filter(b=>W.ch[cbKey(b,c.d)]==='P');const nm=o.t.map(cbOrgN).join(', ');
    if(win&&!missed&&mine.length===o.t.length){f.aw.push({y:G.year,t:`Defensa exitosa ${nm} (${cbDivN(sp,c.d).toLowerCase()})`});fcBump(p,.15);titleTxt=`🏆 ¡Retienes tu título ${nm}!`;}
    else if(win&&!missed){for(const b of o.t)W.ch[cbKey(b,c.d)]='P';f.belt=G.year;f.aw.push({y:G.year,t:`Campeón mundial ${nm} (${cbDivN(sp,c.d).toLowerCase()})`});fcBump(p,.7);titleTxt=(o.t.length>1?`🏆 ¡Unificas el título ${nm} de peso ${cbDivN(sp,c.d).toLowerCase()}!`:`🏆 ¡Ganas el título ${nm} de peso ${cbDivN(sp,c.d).toLowerCase()}!`);
      mkNews(`¡${fullName(p)} (${natOf(p).name}) es campeón mundial ${nm} de peso ${cbDivN(sp,c.d).toLowerCase()} al vencer a ${op?op.n:'su rival'} por ${CB_M[e.m]}!`,true);}
    else if(win&&missed){for(const b of o.t)if(W.ch[cbKey(b,c.d)]!=='P')delete W.ch[cbKey(b,c.d)];titleTxt='Ganas, pero como no diste el peso el cinturón queda vacante.';}
    else if(loss&&op){for(const b of o.t)W.ch[cbKey(b,c.d)]=op.i;titleTxt=mine.length?`${op.n} te quita el cinturón ${nm}.`:`${op.n} retiene el cinturón ${nm}.`;}}
  // dinero
  const purse=o.$*(o.wt&&o.wt.miss?.8:1);let gross=purse+(sp==='mma'&&win?o.$:0);const ppv=o.ppv?cbPPVEst(p,o).rev:0;gross+=ppv;
  const bonus=sp==='mma'&&c.lg<=1&&(fin&&win&&chance(.5)||chance(.12))?[5e4,2.5e4][c.lg]:0;gross+=bonus;
  const g=cbGym(p);const trainer=g.t>=1?purse*.1:0;const team=['cut','pf','nut'].reduce((s,k)=>s+(o.team[k]?cbTeamCost(o,k):0),0);const sanc=o.t.length&&sp==='box'?purse*.03:0;const fine=o.fine||0;
  const net=gross-trainer-team-sanc-fine;p.dinero+=fcNet(p,Math.max(0,net));if(net<0)p.dinero+=toInt(net,'USD');f.earn+=gross;
  // fans e imagen
  const q=win?clamp(55+(fin?25:10)+(da>20?10:0),30,100):35;const add=fcAddFans(p,q,[.6,1.2,2.5][o.vt]*[.6,.85,1.2][o.ps]*(win?1:.3)*(fin?1.5:1)*(1+(o.hy||0)*.15));if(loss&&fin)for(const k in f.fans)f.fans[k]*=.96;f.act=Math.min(4,f.act+1.5);
  // daño y salud
  const A=S.f[0];const hit=(100-Math.max(0,A.hp))/40+A.kd*.6+(loss&&fin?1.2:0);c.dmg=+(c.dmg+hit*(sp==='mma'?.8:1)).toFixed(2);p.s.salud=clamp(p.s.salud-Math.round(hit*2.5),0,100);
  const susp=loss&&e.m==='KO'?RI(60,90):loss&&fin?RI(30,60):A.hp<40?30:A.kd?21:0;if(susp)c.susp=absDay()+susp;if(chance(.06+hit*.02))f.inj=RI(1,4);
  // experiencia
  c.at[5]=clamp(c.at[5]+(win?.4:.6)*(c.at[5]<75?1:.5),0,99);
  // dopaje: control antidopaje
  let dope='';if(c.dope&&chance(.25)){c.ban=absDay()+RI(365,730);for(const k in W.ch)if(W.ch[k]==='P')delete W.ch[k];if(win){c.w--;c.ko-=fin?1:0;}c.dope=0;dope=' '+fcScandal(p,'un resultado positivo en el control antidopaje (sustancias prohibidas)')+' Te suspenden y la victoria se anula.';}
  if(c.fix){c.fix=0;if(chance(.25)){c.ban=absDay()+RI(365,1095);dope+=' '+fcScandal(p,'una investigación por haber arreglado una pelea');}}
  const res={w:e.w,m:e.m,rd:e.rd,opp:op?op.n:'',oc:op?op.c:'',gross,purse,ppv,bonus,trainer,team,sanc,fine,net,add,susp,da,titleTxt,dope,hit};
  c.hist.push({y:G.year,o:op?op.n:'',oc:op?op.c:'',r:win?'W':loss?'L':'D',m:e.m,rd:e.rd,t:o.t.length?o.t.map(cbOrgN).join('/'):'',$:gross,ven:o.ven[1]});if(c.hist.length>40)c.hist.shift();
  if(o.rmc&&loss&&op)c.rm=op.i;
  // resto de la cartelera
  res.card=(o.card||[]).map(([a,b])=>{const X=W.F[a],Y=W.F[b];if(!X||!Y)return null;const r=cbQuick(X,Y);cbApply(X,Y,r,null);const ww=r.w==='b'?Y:X,ll=r.w==='b'?X:Y;return cbResTxt(ww,ll,r);}).filter(Boolean);
  if(fcFama(f)>=30||o.t.length)archiveNews(`${o.ev}: ${win?fullName(p)+' vence a '+(op?op.n:'')+' por '+CB_M[e.m]:loss?(op?op.n:'')+' vence a '+fullName(p)+' por '+CB_M[e.m]:fullName(p)+' y '+(op?op.n:'')+' empatan'} en ${o.ven[0]}, ${o.ven[1]}.`,'news',o.t.length?'int':'nac');
  c.fight=null;c.live=null;c.lastRes=res;c.mand=0;f.act=Math.min(4,f.act+1);cbSync(p);
  log(((win?(fin?`🥊 Ganas contra ${res.opp} por ${CB_M[e.m]} en el round ${e.rd}.`:`🥊 Ganas contra ${res.opp} por ${CB_M[e.m]}.`):loss?(fin?`🥊 Pierdes contra ${res.opp} por ${CB_M[e.m]} en el round ${e.rd}.`:`🥊 Pierdes contra ${res.opp} por ${CB_M[e.m]}.`):(fin?`🥊 Empatas contra ${res.opp} por ${CB_M[e.m]} en el round ${e.rd}.`:`🥊 Empatas contra ${res.opp} por ${CB_M[e.m]}.`))+` Bolsa neta ${fmt(toInt(Math.max(0,net),'USD'))}.`+(c.dr?` Récord ${c.w}-${c.l}-${c.dr}.`:` Récord ${c.w}-${c.l}.`)),win?'good':'bad');
  return res;}
function cbAutoFight(p){const c=cbC(p);if(!c||!c.fight)return null;if(!c.fight.wt)cbWeigh(p);if(c.fight.wt&&!c.fight.wt.ok)cbWeigh(p,0);const S=c.live||cbSetup(p);cbSimAll(S);return cbFinish(p,S);}
function cbPostTalk(p,ch){const c=p.fc.cb,r=c.lastRes;if(!r||r.talk)return '';r.talk=1;
  if(ch===0){p.fc.img=clamp(p.fc.img+2,0,100);return 'Agradeces a tu equipo y a tu rival. Imagen +2.';}
  if(ch===1){c.callout=G.year;fcAddFans(p,50,.3);return 'Tomas el micrófono y retas al campeón frente a todo el público. Tu promotora buscará una pelea por el título.';}
  if(ch===2){const W=G.cb;const id=Object.keys(W.F).find(k=>W.F[k].n===r.opp);if(id)c.rm=id;return 'Pides la revancha de inmediato. Tu promotora intentará cerrarla.';}return '';}

/* ----- cambios de división, vacantes y retiro ----- */
function cbMoveDiv(p,dir){const c=p.fc.cb,sp=cbSp(p);const D=CB_DIVS[sp][p.sex==='F'?'F':'M'];const i=D.indexOf(c.d)+dir;if(i<0||i>=D.length)return 'No hay otra división en esa dirección.';if(c.fight)return 'Tienes una pelea programada.';
  const bs=cbBelts('P');for(const k in G.cb.ch)if(G.cb.ch[k]==='P')delete G.cb.ch[k];c.d=D[i];if(dir<0)c.dDown=G.year;c.offers=[];
  if(dir>0){c.at[0]=clamp(c.at[0]+1.5,0,99);c.at[1]=clamp(c.at[1]-1.5,0,99);}else{c.at[1]=clamp(c.at[1]+1,0,99);c.at[3]=clamp(c.at[3]-1.5,0,99);}cbSync(p);
  return (dir>0?`Subes a peso ${cbDivN(sp,c.d).toLowerCase()} (${cbLim(sp,c.d)}).`:`Bajas a peso ${cbDivN(sp,c.d).toLowerCase()} (${cbLim(sp,c.d)}).`)+`${bs.length?' Dejas vacantes tus cinturones.':''} ${dir>0?'Ganas algo de pegada, pierdes algo de velocidad; los rivales pegan más fuerte.':'Ganas velocidad, pero el corte de peso será más duro (riesgo de no dar el peso).'}`;}

/* ----- mes y año del jugador ----- */
function cbMonthP(p){const c=cbEnsure(p);if(!c)return;const f=p.fc;const g=cbGym(p);if(g.t===4)p.dinero-=cbGymCost(p,g)/12;c.chem=Math.min(1.1,c.chem+.025);
  c.offers=c.offers.filter(o=>o.dl>absDay());
  // ofertas automáticas de tu promotora (o de independientes, con menos frecuencia)
  if(c.pro&&!cbCanFight(p)&&c.offers.length<2){const pr=c.prom?c.prom.fpy/12*1.5:cbSp(p)==='mma'?0:.1;if(chance(pr)&&cbOffersGen(p,1,!c.prom))log('📨 Tienes una nueva oferta de pelea. Revísala en ⭐ Tu carrera → Ofertas.','good');}
  // defensa obligatoria: el campeón debe enfrentar al retador obligatorio o pierde el cinturón
  const bs=cbBelts('P');if(bs.length&&!c.fight&&absDay()-c.lf>200){c.mand=(c.mand||0)+1;if(c.mand===1){const b=bs[0];const L=cbRank(c.d,b).filter(x=>x!=='P'&&G.cb.F[x]&&!G.cb.F[x].jm);
      if(L.length){const m=cbMkOffer(p,3,false,L[0]);if(m){m.mand=1;m.dl=absDay()+60;c.offers.unshift(m);log(`📨 El ${cbOrgN(b)} ordena tu defensa obligatoria contra ${G.cb.F[L[0]].n}.`,'big');}}}
    else if(c.mand>=4){const b=bs[0];delete G.cb.ch[cbKey(b,c.d)];c.mand=0;log(`El ${cbOrgN(b)} te retira el cinturón por no hacer tu defensa obligatoria.`,'bad');if(fcFama(f)>=30)mkNews(`El ${cbOrgN(b)} despoja a ${fullName(p)} de su título por no enfrentar al retador obligatorio.`,true);}}
  else if(!bs.length)c.mand=0;
  if(typeof FF_ON!=='undefined'&&FF_ON){if(c.susp>absDay())c.susp=Math.max(absDay(),c.susp-30);cbAutoManage(p);}
  // pelea vencida sin haberse jugado (avance rápido): se resuelve sola
  if(c.fight){c.fight.mo=(c.fight.mo||0)+1;const ff=typeof FF_ON!=='undefined'&&FF_ON;if(absDay()>c.fight.dt+1||(ff&&c.fight.mo>=2))cbAutoFight(p);}
  cbSync(p);}
function cbYearP(p){const c=cbEnsure(p);if(!c)return;const sp=cbSp(p);
  if(p.age>31){const k=p.age>35?2:1;const dec=[.3,R(1,2.5),.5,R(.5,2),R(.5,1.5),-.3,.6,.2];c.at=c.at.map((v,i)=>clamp(v-(dec[i]||0)*k,5,99));}
  if(c.prom&&G.year-c.prom.y0>=c.prom.yrs){log(`Termina tu contrato con ${c.prom.nm}.`);c.prom=null;}
  if(c.pro&&(!c.prom||chance(.5)))if(cbPromOffers(p,false))log('📨 Hay promotoras interesadas en firmarte. Revisa ⭐ Tu carrera → Promotora.','good');
  if(c.dope)c.dope=Math.max(0,c.dope-1);cbSync(p);}
// fans: si eres peleador, tu público depende de tu lugar en el ranking, tus títulos y tu récord
fcRankMonth=function(p){const f=p.fc,c=f.cb;if(!c){const tgt=1e7*Math.pow(f.rk||99,-1.5)*(f.img/70);const d=(tgt-fcFans(f))*.05;if(d>0)f.fans.loc+=d*.8;return;}
  const pos=c.pro?f.rk:99;const dv=G.cb&&G.cb.sp==='box'?(c.d<6?.5:c.d<10?.8:c.d===16?2:1):1;let tgt=c.pro?(pos<=15?3e6*Math.pow(pos,-1.2)*dv:3e3+1.5e3*c.w+800*c.ko):300+60*Math.min(c.am.w,80)+c.am.md.filter(m=>m.y>=G.year-4).reduce((s,m)=>s+(/Olímp/.test(m.t)?1.5e5:/mundial/i.test(m.t)?3e4:/continental/i.test(m.t)?1e4:/nacional/i.test(m.t)?3e3:/jiu/i.test(m.t)?1500:500)*({oro:1,plata:.6,bronce:.4}[m.m]||0),0);
  if(cbBelts('P').length)tgt*=2.5;tgt*=(f.img/70)*(G.cb&&G.cb.sp==='mma'?.8*[1,.25,.05][c.lg]:1)*(p.sex==='F'?.4:1);const sh=pos<=10?[.15,.35,.5]:pos<=40?[.4,.45,.15]:[.8,.18,.02];const d=(tgt-fcFans(f))*.05;if(d>0){f.fans.loc+=d*sh[0];f.fans.nac+=d*sh[1];f.fans.int+=d*sh[2];}};

/* ----- integración con el reloj, el mes, el año y la carrera de fama ----- */
{const _fs=fcStart;fcStart=function(p,k){const r=_fs(p,k);if(k==='box'||k==='mma'){cbInit(p);return r+` Empiezas como amateur en peso ${cbDivN(k,p.fc.cb.d).toLowerCase()} (${cbLim(k,p.fc.cb.d)}), estilo ${CB_ST[k][p.fc.cb.st].n.toLowerCase()}. Entrena en tu gimnasio, pelea como amateur y debuta como profesional desde los 18 años.`;}return r;};}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(G.cb)cbWorldMonth();if(P&&P.alive&&cbSp(P))cbMonthP(P);}catch(e){if(typeof console!=='undefined')console.error('cb mes',e);}};}
{const _au=ageUp;ageUp=function(){const q=P;_au();try{if(G.cb)cbWorldYear();if(q&&q===P&&q.alive&&cbSp(q))cbYearP(q);}catch(e){if(typeof console!=='undefined')console.error('cb año',e);}};}
{const _fr=fcRetire;fcRetire=function(p){if(cbC(p)){for(const k in (G.cb||{}).ch||{})if(G.cb.ch[k]==='P')delete G.cb.ch[k];}return _fr(p);};}
const cbDue=()=>{const c=cbC(P);return !!(P&&P.alive&&c&&c.fight&&absDay()>=c.fight.dt);};
// el reloj se detiene el día de la pelea (sin pantalla o en avance rápido, se pelea sola)
{const _ca=clockAdvance;clockAdvance=function(n,opt){const c=cbC(P);if(cbDue()){if(CB_AUTO||(typeof FF_ON!=='undefined'&&FF_ON))cbAutoFight(P);else return {done:0,rep:[],stop:'pelea',months:0};}
  if(c&&c.fight&&!CB_AUTO){const k=c.fight.dt-absDay();if(k>0&&k<n){const r=_ca(k,opt);if(!r.stop&&cbDue())r.stop='pelea';return r;}}
  // sin pelea programada, el reloj avanza mes a mes y se detiene cuando llega una oferta (de pelea o de contrato)
  const ff=typeof FF_ON!=='undefined'&&FF_ON;if(c&&c.pro&&!c.fight&&!CB_AUTO&&!ff&&n>7){const o0=c.offers.length,p0=(c.po||[]).length;let done=0,rep=[],months=0;
    while(done<n){const m=monthOfDay(G.day);const k=Math.max(1,Math.min(n-done,MCUM[m+1]-G.day));const r=_ca(k,opt);done+=r.done;rep.push(...r.rep);months+=r.months;if(r.stop)return {done,rep,stop:r.stop,months};
      if(c.offers.length>o0||(c.po||[]).length>p0){CB_NOTE=1;return {done,rep,stop:'oferta',months};}if(!r.done||!P.alive)break;}return {done,rep,stop:null,months};}
  return _ca(n,opt);};}
var CB_NOTE=0;
// en el avance rápido (5 años) tu equipo maneja la carrera: firma la mejor promotora y acepta la pelea más conveniente
function cbAutoManage(p){const c=cbC(p);if(!c||!c.pro)return;if(c.po&&c.po.length&&(!c.prom||c.po.some(o=>o.t<c.prom.t))){let b=0;c.po.forEach((o,i)=>{if(o.t<c.po[b].t)b=i;});cbSignProm(p,b);}
  if(!c.fight&&c.offers.length&&!cbCanFight(p)){const me=cbMe(p);let b=-1,bv=0;c.offers.forEach((o,i)=>{const op=cbF(o.o);if(!op)return;const pr=1/(1+Math.exp(-(cbPw(me)-cbPw(op))/5.5));const v=pr>.42?o.$*(.5+pr):0;if(v>bv){bv=v;b=i;}});if(b>=0)cbAccept(p,b);}}
ACT_COST.unshift([/^⭐ Campamento/,45],[/^⭐ Sparring/,8],[/^⭐ Pelea amateur/,8],[/^⭐ Torneo/,14],[/^⭐ Buscar pelea/,5],[/^⭐ Buscar promotora/,5]);

/* ----- diálogos con causa del mundo de los golpes ----- */
D_({id:'cb_arreglo',cat:'deporte',title:'Una oferta en el estacionamiento',cool:900,npc:p=>npc(p,'promotor'),
 w:p=>{const c=cbC(p);return c&&c.pro&&c.fight&&!c.fight.t.length&&c.fight.$<4e4&&!c.fix?1.2:0;},
 N:{a:{t:(p,n,c,x)=>`Después de entrenar, ${x.name} te espera junto a tu coche. «Hay gente que apostó fuerte en tu próxima pelea. Si te dejas caer en la segunda mitad, te llevas ${fmt(toInt(Math.round(cbC(p).fight.$*3),'USD'))} en efectivo. Nadie se entera.»`,
  o:[{t:'Rechazar sin dudar',ok:{r:'«Tú sabrás.» Se va molesto. Tu conciencia y tu carrera siguen limpias.',fx:{s:{felicidad:2}}}},
   {t:'Denunciarlo ante la comisión',k:['carisma',50],ok:{r:'La comisión abre una investigación y la prensa te aplaude por tu honestidad.',fx:{s:{influencia:3}},go:p=>{p.fc.img=clamp(p.fc.img+8,0,100);}},ko:{r:'Sin pruebas, la denuncia no prospera y ahora tienes enemigos peligrosos.',fx:{s:{felicidad:-4}}}},
   {t:'Aceptar el dinero',ok:{r:'Te entregan un sobre. En la pelea tendrás que caer en la segunda mitad. Si alguien investiga, tu carrera termina.',go:p=>{const c=cbC(p);c.fix=1;c.fight.fixed=1;p.dinero+=toInt(Math.round(c.fight.$*3),'USD');}}}]}}});
D_({id:'cb_dopaje',cat:'deporte',title:'Un atajo químico',cool:700,npc:p=>npc(p,'preparador'),
 w:p=>{const c=cbC(p);if(!c||!c.pro||c.dope||c.ban>absDay())return 0;const L=c.hist.slice(-3);return (L.filter(h=>h.r==='L').length>=2?1.5:0)+(p.fc.rk<=25?.6:0);},
 N:{a:{t:(p,n,c,x)=>`${x.name}, un preparador que conociste en el gimnasio, baja la voz: «Tengo algo que te da más fuerza y te recupera el doble. Los controles casi nunca lo detectan.» En el mundo real, los controles por sorpresa (como los de agencias antidopaje voluntarias) atrapan a muchos.`,
  o:[{t:'Rechazar: quieres ganar limpio',ok:{r:'Te alejas. Tu cuerpo y tu nombre siguen limpios.',fx:{s:{felicidad:1}}}},
   {t:'Aceptar las sustancias',ok:{r:'Durante un año tendrás +5 de pegada y resistencia. En cada pelea hay 25 % de que el control te atrape: suspensión, multa y pérdida de títulos.',go:p=>{cbC(p).dope=1;},fx:{s:{salud:-3}}}}]}}});
D_({id:'cb_reto',cat:'deporte',title:'Te retan en redes',cool:300,npc:p=>npc(p,'rival'),
 w:p=>{const c=cbC(p);return c&&c.pro&&p.fc.rk<=40?.9:0;},
 N:{a:{t:(p,n,c,x)=>`${x.name}, un peleador de tu división, publica un video burlándose de ti: «Está protegido por su promotora. Que me enfrente si se atreve.» Ya tiene miles de reproducciones.`,
  o:[{t:'Responder con elegancia',ok:{r:'Tu respuesta tranquila se comparte por su madurez.',go:p=>{p.fc.img=clamp(p.fc.img+3,0,100);fcAddFans(p,40,.2);}}},
   {t:'Responder con todo',k:['carisma',48],ok:{r:'Tu respuesta se vuelve viral y la gente pide la pelea.',go:p=>{fcAddFans(p,60,.6);cbC(p).callout=G.year;}},ko:{r:'Te pasas de la raya y te llueven críticas.',go:p=>{p.fc.img=clamp(p.fc.img-7,0,100);}}},
   {t:'Ignorarlo',ok:{r:'El tema se apaga en unos días.'}}]}}});
D_({id:'cb_dano',cat:'deporte',title:'Tu entrenador está preocupado',cool:500,npc:p=>{const c=cbC(p);return c?Object.assign(npc(p,'entrenador'),{name:cbGym(p).co.name}):null;},
 w:p=>{const c=cbC(p);return c&&c.dmg>14?1+(c.dmg-14)/8:0;},
 N:{a:{t:(p,n,c,x)=>`${x.name} cierra la puerta del vestidor. «Llevas ${cbC(p).w+cbC(p).l} peleas como profesional y muchos golpes encima. Te tardas más en contestar, te mareas en el sparring. El daño cerebral por golpes se acumula y no se cura.» Tu daño acumulado: ${cbC(p).dmg.toFixed(1)}.`,
  o:[{t:'Hacerte estudios neurológicos',ok:p=>({r:cbC(p).dmg>22?'Los estudios muestran daño. El médico recomienda retirarte pronto.':'Los estudios salen dentro de lo normal, pero hay que cuidarse: menos sparring fuerte.',fx:{$:-Math.round(U(p)*.1)}})},
   {t:'Menos sparring y peleas más espaciadas',ok:{r:'Ajustas tu preparación: el daño crecerá más lento.',go:p=>{cbC(p).dmg=Math.max(0,cbC(p).dmg-1.5);}}},
   {t:'«Estoy bien, sigamos»',ok:{r:'Tu entrenador asiente en silencio, pero no está convencido.',fx:{rel:-6}}}]}}});
D_({id:'cb_campeon_sparring',cat:'deporte',title:'Invitación a un campamento',cool:600,npc:p=>npc(p,'contacto'),
 w:p=>{const c=cbC(p);return c&&c.pro&&p.fc.sk>=50&&p.fc.rk>8&&p.fc.rk<=60&&!c.fight?.8:0;},
 N:{a:{t:(p,n,c,x)=>{const W=G.cb,cid=W.ch[cbKey(0,cbC(p).d)];const C=cid&&W.F[cid];c.cn=C?C.n:'el campeón';return `${x.name} te llama: el campamento de ${c.cn} necesita un sparring de tu estilo durante seis semanas. Pagan bien y aprenderías de los mejores, pero el sparring con un campeón duele.`;},
  o:[{t:'Aceptar',ok:{r:'Seis semanas de guerra en el gimnasio: aprendes muchísimo y haces contactos.',go:p=>{const c=cbC(p);c.at[5]=clamp(c.at[5]+3,0,99);c.at[2]=clamp(c.at[2]+2,0,99);c.dmg+=.6;cbSync(p);p.dinero+=toInt(8000,'USD');},fx:{ft:-20}}},
   {t:'Rechazar: te concentras en tu carrera',ok:{r:'Sigues con tu propia preparación.'}}]}}});
D_({id:'cb_familia_retiro',cat:'familia',title:'«¿Hasta cuándo?»',cool:700,npc:p=>p.partner,
 w:p=>{const c=cbC(p);return c&&p.partner&&(c.dmg>18||p.age>35)?1.2:0;},
 N:{a:{t:(p,n,c,x)=>`${fn1(x)} te mira después de tu última pelea. «Cada vez que subes al ring siento que te voy a perder. Ya demostraste lo que tenías que demostrar.»`,
  o:[{t:'Prometer que esta será la última etapa',ok:{r:'Se abrazan. Te quita un peso de encima.',fx:{rel:8,s:{felicidad:3}}}},
   {t:'Explicarle que aún te queda por lograr',k:['carisma',45],ok:{r:'Te entiende y te apoya, aunque le cueste.',fx:{rel:2}},ko:{r:'No te entiende y la tensión crece en casa.',fx:{rel:-8}}}]}}});
