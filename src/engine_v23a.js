/* ===================== v2.3a: fase 5 de la ruta 9d (naturaleza y recursos), parte 1 — motor =====================
   Todo se DERIVA de datos que ya existen (terreno TRN: relieve, clima, río grande y latitud; superficie y población de cada
   provincia; desarrollo; guerra; precios de G.rs; yacimientos DEP/RESN). No se guarda nada nuevo en la partida y no usa
   Math.random (sequías con h21: el mismo año da la misma sequía al recargar y las pruebas con semilla no cambian su azar).
   - Bioma de cada provincia (10), agua dulce renovable (lluvia que escurre + aporte de un río grande), tierra cultivable y
     alimentos producidos (personas que alimenta según rendimiento por desarrollo y agua para riego).
   - Tres medidores 0–100 con causas visibles, en provincia y país: 🌿 salud del ecosistema, 💧 agua dulce (umbral de
     Falkenmark: 1,700 m³ por persona al año = estrés), 🌾 seguridad alimentaria (autosuficiencia + capacidad de importar).
   - Escasez aproximada de cada recurso de RES0 por país: producción frente a un consumo estimado (peso en el PIB y en la
     población mundial).
   - Efectos (pequeños y que regresan a la media):
     · salud de los sectores (envoltorio de shCtx/shTerms): Consumo básico ← dependencia de alimentos importados × precio
       mundial de los granos y sequías; Servicios públicos ← sequías y estrés hídrico que empeora con la población;
       Industria ← dependencia de energía importada × precio del petróleo.
     · PIB de la provincia (envoltorio de provBonus9): la sequía resta parte de la producción agrícola el año que pega y se
       recupera el 90 % al año siguiente; con estrés hídrico que empeora (más población, misma agua) hasta −0.28 puntos al año.
     · felicidad de la provincia (envoltorio de provYear): −3 × severidad de la sequía; −hasta 2 en países que dependen de
       alimentos importados cuando los granos se disparan. */

const NT_BIO={ // [nombre, ícono, escurrimiento (mm/año), fracción cultivable, salud base del ecosistema, prob. de sequía local]
  selva:['Selva tropical','🌴',1100,.09,78,.02],sabana:['Sabana','🌾',260,.24,70,.08],desierto:['Desierto','🏜️',12,.008,62,.08],
  estepa:['Estepa','🌬️',55,.10,66,.08],subtrop:['Bosque subtropical','🌳',330,.26,64,.07],pradera:['Pradera','🌱',190,.42,62,.05],
  templado:['Bosque templado','🍂',380,.22,66,.04],taiga:['Taiga','🌲',300,.035,82,.02],tundra:['Tundra','❄️',160,0,84,.01],montana:['Montaña','🏔️',300,.10,76,.04]};
const NT_RIV=300;      // mm equivalentes que aporta un río grande (agua que viene de aguas arriba)
const NT_K=1.12;        // ajuste global de la autosuficiencia (calibrado: el mundo produce ~1.1 veces lo que come)
function ntBioK(t,rid){const c=t[1],al=Math.abs(t[3]||0);if(c==='s')return 'selva';if(c==='d')return al<33?'desierto':'estepa';if(c==='f')return al>=62?'tundra':'taiga';
  if(t[0]===2)return 'montana';if(rid&&ntArid(rid,al))return 'estepa';if(al<20)return 'sabana';if(al<36)return 'subtrop';return t[0]===0?'pradera':'templado';}
// semiárido: rodeado de desierto, o una provincia enorme del interior en la franja seca de los trópicos (15°–33°)
function ntArid(rid,al){const g=RG[rid];if(!g)return false;const A=(g.adj||[]).filter(a=>TERR&&TERR[a]);if(A.length&&A.filter(a=>TERR[a][1]==='d').length/A.length>=.4)return true;return (g.area||0)>4e5&&al>=15&&al<=33;}
/* base fija de cada provincia (se calcula una vez): bioma, agua de lluvia y de río (km³/año), tierra cultivable (km²), rendimiento relativo.
   Densidad base (población de los datos): donde vive más gente se cultiva una parte mayor de la tierra y con más intensidad. */
const NTB={};
function ntBase(rid){let b=NTB[rid];if(b)return b;const t=TRN(rid),k=ntBioK(t,rid),B=NT_BIO[k],g=RG[rid]||{},a=Math.max(1,g.area||1);
  const riv=t[2]?1:0;const ro=B[2]*(g.co&&k!=='desierto'&&k!=='estepa'?1.3:1);const Wr=a*ro*1e-6,Wv=riv?a*NT_RIV*1e-6:0;
  const x=G&&G.regions&&G.regions[rid];const dn=Math.max(.1,((x&&x.p0)||g.pop||g.wp||1)/a);
  let fp=B[3]*[1,.75,.45][t[0]||0];if(riv)fp=k==='desierto'||k==='estepa'?fp+.12:fp*1.35;
  const u=clamp(Math.sqrt(dn/40),.25,1);const fr=Math.min(.8,fp*(1+.45*Math.max(0,Math.log10(dn/60))))*u;
  const wf=clamp(.45+.55*Math.min(1,(B[2]+(riv?NT_RIV:0))/350),.45,1);const yi=clamp(Math.pow(dn/120,.3),.6,2.4)*wf;
  b=NTB[rid]={k,a,riv,Wr,Wv,ar:a*fr,fr,fp,wf,yi};return b;}
const ntWSr=w=>50+56*Math.log10(Math.max(1,w)/1700);           // puntaje del agua (sin tope): 1,700 m³/persona = 50
const ntFSr=s=>60+35*Math.log2(Math.max(.01,s));                 // puntaje de la autosuficiencia: 1 = 60, 2 = 95, 0.5 = 25
const ntYield=dev=>230+110*clamp(dev==null?3:dev,0,10);  // personas que alimenta un km² cultivable
/* ---------- sequías: deterministas por provincia y año (h21) ---------- */
const NTD={g:null,y:{}};
function ntDrought(rid,Y){if(NTD.g!==G){NTD.g=G;NTD.y={};}let M=NTD.y[Y];if(!M){for(const k in NTD.y)if(Math.abs(k-Y)>2)delete NTD.y[k];M=NTD.y[Y]={};}
  let v=M[rid];if(v==null)v=M[rid]=ntDrought0(rid,Y);return v;}
function ntDrought0(rid,Y){const b=ntBase(rid);const nb=RG[rid]?RG[rid].n:rid;const hr=h21(rid+'|'+Y+'|sq');const nat=h21(nb+'|'+Y+'|sqN')<.07;
  if(!(hr<(nat?.65:NT_BIO[b.k][5])))return 0;let s=.35+.65*h21(rid+'|'+Y+'|sv');if(b.riv)s*=.7;return Math.round(s*100)/100;}
// intensidad esperada de sequía (probabilidad × severidad media): los efectos se miden contra lo normal del lugar, así un año sin
// sequía es un año de lluvias normales (un poco mejor que el promedio) y a la larga los efectos se cancelan
function ntExpD(rid){const b=ntBase(rid);return (.07*.65+.93*NT_BIO[b.k][5])*.675*(b.riv?.7:1);}
const ntMonthKey=()=>G.year*12+monthOfDay(G.day||0);
/* caché por año (el motor: población, PIB y sequías cambian al cerrar el año); la interfaz pide datos del mes con ntFresh() */
const NTC={g:null,y:-1,t:-1,p:{},n:{},s:{},w:{}};
function ntCache(){if(NTC.g!==G||NTC.y!==G.year){NTC.g=G;NTC.y=G.year;NTC.t=ntMonthKey();NTC.p={};NTC.n={};NTC.s={};NTC.w={};}return NTC;}
function ntFresh(){if(NTC.g===G&&NTC.t!==ntMonthKey())NTC.g=null;return ntCache();}
const ntDev=x=>x.dev!=null?x.dev:devFromPc(x.gdp/Math.max(1,x.pop));
function ntWar(C,nid){let v=C.w[nid];if(v==null)v=C.w[nid]=warsOf(nid).length>0;return v;}
const ntAgSh=pc=>clamp(.30*Math.pow(Math.max(200,pc)/1000,-.6),.008,.4);   // peso de la agricultura en el PIB según la riqueza
const ntPush=(L,k,v)=>{if(L&&(v>=.5||v<=-.5))L.push([k,v]);return v;};
/* ---------- provincia ---------- */
function ntProv(rid,Y){const C=ntCache();if(Y==null&&C.p[rid])return C.p[rid];const x=G.regions[rid];if(!x)return null;const b=ntBase(rid);const dv=ntDev(x);
  const yr=Y==null?G.year:Y;const sq=ntDrought(rid,yr);const pop=Math.max(1,x.pop),p0=Math.max(1,x.p0||x.pop);const n=G.nations[x.o];
  const occ=!!(G.occ&&G.occ[rid]),war=!!(n&&ntWar(C,n.id));
  const W=(b.Wr+b.Wv)*(1-.35*sq);                                    // km³/año que se renuevan este año
  const fed=b.ar*ntYield(dv)*b.yi*(1-.45*sq)*(occ?.6:war?.9:1);   // personas que alimenta
  const o={rid,k:b.k,b,sq,pop,p0,W,wpc:W*1e9/pop,fed,ss:fed/pop,occ,war};
  // 🌿 salud del ecosistema
  {const L=[];const B=NT_BIO[b.k];let v=B[4];const dn=pop/b.a,gd=x.gdp/b.a;
    v+=ntPush(L,'dens',-clamp(9*Math.log10(Math.max(1,dn)/15),0,30));
    v+=ntPush(L,'ind',-clamp(5*Math.log10(Math.max(1,gd)/2e5),0,14));
    v+=ntPush(L,'agro',-clamp(b.fr*30,0,10));
    if(b.riv)v+=ntPush(L,'rio',3);
    v+=ntPush(L,'reg',clamp((dv-5)*1.6,-4,6));
    if(occ)v+=ntPush(L,'ocup',-12);else if(war)v+=ntPush(L,'guerra',-4);
    if(sq)v+=ntPush(L,'sequia',-10*sq);
    o.eco={v:Math.round(clamp(v,3,97)),L,base:B[4]};}
  if(Y==null)C.p[rid]=o;return o;}
/* ---------- país ---------- */
function ntNat(nid){const C=ntCache();if(C.n[nid])return C.n[nid];const n=G.nations[nid];if(!n)return null;const rs=regionsOf(nid);
  let W=0,Wr=0,Wv=0,W0=0,pop=0,p0=0,fed=0,ar=0,area=0,eco=0,dpop=0,dsev=0,nd=0,dex=0;const dr=[];
  rs.forEach(r=>{const o=ntProv(r);if(!o)return;const b=o.b;W+=o.W;Wr+=b.Wr;Wv+=b.Wv;W0+=b.Wr+b.Wv;pop+=o.pop;p0+=o.p0;fed+=o.fed;ar+=b.ar;area+=b.a;eco+=o.eco.v*b.a;dex+=ntExpD(r)*o.pop;
    if(o.sq){dpop+=o.pop;dsev+=o.sq*o.pop;nd++;dr.push(r);}});
  pop=Math.max(1,pop);p0=Math.max(1,p0);
  // autosuficiencia: la tierra por persona pesa con raíz cuadrada (comercio interno, riego e intensificación la comprimen); crece la población → baja
  const ss=NT_K*Math.sqrt(fed/p0)*p0/pop;const fk=fed>0?ss*pop/fed:0;
  const N={nid,W,W0,Wr,Wv,pop,p0,fed:ss*pop,fr:fed,fk,ar,area,wpc:W*1e9/pop,wpc0:W0*1e9/p0,ss,eco:area?Math.round(eco/area):50,
    dsh:dpop/pop,dsev:dpop?dsev/dpop:0,di:dsev/pop,dx:dex/pop,nd,dr,nr:rs.length};
  C.n[nid]=N;return N;}
/* ---------- medidores (0–100) con causas ---------- */
function ntWater(rid){const o=ntProv(rid);if(!o)return null;const x=G.regions[rid];const N=ntNat(x.o);const L=[];const b=o.b;
  const cp=ntWSr(b.Wr*1e9/o.p0)-50,rp=ntWSr((b.Wr+b.Wv)*1e9/o.p0)-ntWSr(b.Wr*1e9/o.p0);
  let v=50+ntPush(L,'clima',.4*cp)+(b.riv?ntPush(L,'rio',.4*rp):0)+ntPush(L,'pais',.6*(ntWSr(N.wpc0)-50));
  v+=ntPush(L,'pob',ntWSr(N.wpc0*N.p0/N.pop)-ntWSr(N.wpc0));
  v+=ntPush(L,'infra',clamp((ntDev(x)-4)*2,-6,8));
  if(o.sq)v+=ntPush(L,'sequia',-12*o.sq);if(o.occ)v+=ntPush(L,'ocup',-6);
  return {v:Math.round(clamp(v,2,98)),L};}
function ntWaterN(nid){const N=ntNat(nid);const n=G.nations[nid];const L=[];const pc=n.gdp/Math.max(1,n.pop);
  let v=50+ntPush(L,'clima',ntWSr(N.Wr*1e9/N.p0)-50)+ntPush(L,'rio',ntWSr(N.W0*1e9/N.p0)-ntWSr(N.Wr*1e9/N.p0));
  v+=ntPush(L,'pob',ntWSr(N.wpc0*N.p0/N.pop)-ntWSr(N.wpc0));
  v+=ntPush(L,'infra',clamp((devFromPc(pc)-4)*2,-6,8));
  if(N.dsh)v+=ntPush(L,'sequia',-12*N.dsh*N.dsev);
  return {v:Math.round(clamp(v,2,98)),L};}
// precio contra su tendencia (media geométrica de los últimos 5 años): solo los choques cuentan, no la inflación de largo plazo
function ntPxDev(k){const o=G.rs&&G.rs[k];if(!o||!o.h||!o.h.length)return 0;const C=ntCache();const key='px'+k+'|'+ntMonthKey();if(C.s[key]!=null)return C.s[key];
  const h=o.h,n=Math.min(60,h.length);let s=0;for(let i=h.length-n;i<h.length;i++)s+=Math.log(h[i]);return C.s[key]=Math.log(o.p)-s/n;}
function ntFoodPx(){const ks=['wheat','corn','rice','soy'].filter(k=>G.rs&&G.rs[k]);if(!ks.length)return 0;return ks.reduce((s,k)=>s+ntPxDev(k),0)/ks.length;}
function ntFoodN(nid){const N=ntNat(nid);const n=G.nations[nid];const L=[];const pc=n.gdp/Math.max(1,n.pop);const ss=N.ss;
  let v=60+ntPush(L,'auto',clamp(ntFSr(ss)-60,-50,30));
  const imp=ss<1?clamp(10*Math.log10(pc/4000),-8,14)*(1-Math.max(.3,ss)):0;v+=ntPush(L,'imp',imp);
  const fp=ntFoodPx();if(ss<1)v+=ntPush(L,'precio',-clamp(fp*60,-6,10)*(1-ss));
  if(N.dsh)v+=ntPush(L,'sequia',-15*N.dsh*N.dsev);
  if(warsOf(nid).length)v+=ntPush(L,'guerra',-5);
  return {v:Math.round(clamp(v,2,98)),L};}
function ntFood(rid){const o=ntProv(rid);if(!o)return null;const x=G.regions[rid];const F=ntFoodN(x.o);const L=F.L.map(([k,v])=>[k,v*.6]);
  ntPush(L,'local',clamp(ntFSr(clamp(o.ss*ntNat(x.o).fk,.05,10))-60,-40,30)*.4);if(o.sq)ntPush(L,'sequia2',-8*o.sq);const v=60+L.reduce((s,e)=>s+e[1],0);
  return {v:Math.round(clamp(v,2,98)),L:L.filter(e=>e[1]>=.5||e[1]<=-.5)};}
function ntEcoN(nid){const N=ntNat(nid);const L=[];const rs=regionsOf(nid);const acc={};
  rs.forEach(r=>{const o=ntProv(r);if(!o)return;o.eco.L.forEach(([k,v])=>acc[k]=(acc[k]||0)+v*o.b.a);});
  let base=0;rs.forEach(r=>{const o=ntProv(r);if(o)base+=o.eco.base*o.b.a;});base=N.area?base/N.area:60;
  for(const k in acc)ntPush(L,k,acc[k]/Math.max(1,N.area));return {v:N.eco,L,base};}
/* ---------- escasez de recursos por país: producción frente a un consumo estimado ---------- */
function ntWorldShare(nid){const C=ntCache();if(!C.s.w){let g=0,p=0;for(const id in G.nations){const m=G.nations[id];if(m.alive){g+=m.gdp;p+=m.pop;}}C.s.w=[g||1,p||1];}
  const n=G.nations[nid];return [n.gdp/C.s.w[0],n.pop/C.s.w[1]];}
function ntRes(nid){const C=ntCache();if(C.s[nid])return C.s[nid];const d=resNat()[nid]||{};const [gs,ps]=ntWorldShare(nid);const L=[];
  for(const k in RES0){const R=RES0[k];const S=(RESN.S&&RESN.S[k])||RESW0[k];const sh=R[5]==='agr'?.6*ps+.4*gs:.75*gs+.25*ps;const need=S*sh;const pr=d[k]||0;
    const r=need>0?pr/need:0;L.push({k,pr,need,r,st:r>=1.25?3:r>=.8?2:r>=.2?1:0});}
  C.s[nid]=L;return L;}
const NT_RST=['Escaso','Depende de importaciones','Autosuficiente','Exporta'];
function ntEnergyDep(nid){const L=ntRes(nid).filter(e=>['oil','gas','coal'].includes(e.k));let p=0,q=0;L.forEach(e=>{const v=resVal(e.k);p+=e.pr*v;q+=e.need*v;});return q>0?clamp(1-p/q,0,1):0;}
/* ---------- efectos en la salud de los sectores (cada mes) ---------- */
function ntSect(n){const N=ntNat(n.id);if(!N)return null;const o={};const fp=ntFoodPx();const ss=N.ss;
  const dep=clamp(1-ss,0,1),ex=clamp(ss-1,0,1.5);
  o.ali=-dep*clamp(fp*30,-8,8)+ex*clamp(fp*10,-4,4);
  o.seq=-10*(N.di-N.dx);
  const dw=ntWSr(N.wpc0*N.p0/N.pop)-ntWSr(N.wpc0);o.agua=N.wpc0<5000?clamp(dw*.3,-6,0):0;
  o.seqa=-8*(N.di-N.dx);
  o.ene=-ntEnergyDep(n.id)*clamp(10*ntPxDev('oil'),-6,6);
  return o;}
{const _c=shCtx;shCtx=function(n){const c=_c(n);try{c.nt=ntSect(n);}catch(e){c.nt=null;}return c;};}
{const _t=shTerms;shTerms=function(c,R,k,L){let t=_t(c,R,k,L);const z=c&&c.nt;if(!z)return t;let v;
  if(k==='cons'){v=z.ali;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nali',v]);}v=z.seq;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nseq',v]);}}
  else if(k==='serv'){v=z.agua;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nagua',v]);}v=z.seqa;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nseq',v]);}}
  else if(k==='ind'){v=z.ene;if(v>=.5||v<=-.5){t+=v;if(L)L.push(['nene',v]);}}
  return t;};}
/* ---------- PIB de la provincia: sequía (con rebote) y estrés hídrico que empeora (al cerrar el año) ---------- */
function ntLoss(rid,x,Y){const s=ntDrought(rid,Y);if(!s)return 0;return ntAgSh(x.gdp/Math.max(1,x.pop))*s*.2;}
function ntGdpTerm(rid,x){const Y=G.year-1;let b=-ntLoss(rid,x,Y)+.9*ntLoss(rid,x,Y-1);
  const N=ntNat(x.o);if(N&&N.wpc<1700){const w=Math.log(N.pop/N.p0);if(w>0)b-=clamp(w,0,.7)*.004;}
  return b;}
{const _pb=provBonus9;provBonus9=function(r,x){const b=_pb(r,x);try{return b+ntGdpTerm(r,x);}catch(e){return b;}};}
/* ---------- felicidad: sequía y alimentos caros donde se importan ---------- */
{const _py=provYear;provYear=function(){_py();try{ntYear();}catch(e){}};}
function ntYear(){const Y=G.year-1;const fp=ntFoodPx();const me=P&&P.alive?natOf(P).id:null;const cnt={};
  for(const r in G.regions){const x=G.regions[r];const n=G.nations[x.o];if(!n||!n.alive)continue;const s=ntDrought(r,Y);let d=0;
    d-=3*(s-ntExpD(r));if(s)cnt[x.o]=(cnt[x.o]||0)+1;
    if(fp>.1){const N=ntNat(x.o);if(N&&N.ss<1)d-=clamp((fp-.1)*8,0,2)*(1-N.ss);}
    if(d)x.hap=clamp(x.hap+d,0,100);}
  if(me&&cnt[me]){const N=regionsOf(me).length;if(cnt[me]>=Math.max(2,N*.15))pushNews(`🌵 Sequía en ${cnt[me]} de ${N} provincias de ${G.nations[me].name} en ${Y}: menos cosechas, agua racionada y la felicidad baja.`,'bad');}}
