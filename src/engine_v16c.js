/* ===== v1.6c: el mundo del fútbol =====
   12 ligas simuladas (y la de tu país si no está), con clubes ficticios en ciudades reales, temporadas europeas, de año calendario y Apertura/Clausura con liguilla,
   ascensos y descensos, copas nacionales, dos copas continentales de clubes, Mundial de Clubes, Mundial de 48 selecciones, torneos continentales de selecciones,
   estrellas con goles, fichajes de la IA y Balón Dorado. Luego, la carrera del futbolista. */
const ftPois=l=>{const L=Math.exp(-Math.min(l,12));let k=0,p=1;do{k++;p*=Math.random();}while(p>L);return k-1;};
const FTW=()=>G.ft;
function ftConf(n){if(FT_CONMEBOL.includes(n))return 'CONMEBOL';if(FT_OFC.includes(n))return 'OFC';if(FT_CAFN.includes(n))return 'CAF';const w=N0[n]||{};const r=w.reg||'';
  if(/Europe/.test(r))return ['UZB','TJK','KGZ','TKM'].includes(n)?'AFC':'UEFA';if(/Latin|North America/.test(r))return 'CONCACAF';if(/Sub-Saharan/.test(r))return 'CAF';return 'AFC';}
function ftNTbase(n){if(FT_NT[n]!=null)return FT_NT[n];const w=N0[n]||{};const pop=(w.pop||1e6)/1e6;return clamp(Math.round(44+6*Math.log10(Math.max(.3,pop))+3*Math.log10(Math.max(1,(w.gdp||1e9)/1e9))/1.5),35,64);}
const ftNT=n=>{const W=FTW();return W&&W.NT[n]!=null?W.NT[n]:ftNTbase(n);};
const ftNm=n=>{const x=G.nations[n];return x?x.name:n;};
// ciudades de un país (de las ciudades del mapa; sin pantalla, de las provincias)
function ftCities(nid){if(FT_CITY[nid]){const idx={};if(typeof CITIES!=='undefined')CITIES.forEach(c=>{if(RG[c[5]]&&RG[c[5]].n===nid&&!idx[c[3]])idx[c[3]]=c[5];});return FT_CITY[nid].split(',').map(n=>[n,idx[n]||null]);}
  let L=[];if(typeof CITIES!=='undefined')L=CITIES.filter(c=>RG[c[5]]&&RG[c[5]].n===nid).sort((a,b)=>b[2]-a[2]).map(c=>[c[3],c[5]]);
  if(L.length<8)L=L.concat(regionsOf(nid).slice().sort((a,b)=>G.regions[b].pop-G.regions[a].pop).map(r=>[RG[r].nm,r]));const seen={};return L.map(x=>[x[0].replace(/^(Estado|Provincia|Departamento|Región|Distrito) de /,''),x[1]]).filter(x=>!seen[x[0]]&&(seen[x[0]]=1));}
function ftClubNames(nid,n,lang){const P=FT_NM[lang]||FT_NM.xx;const cs=ftCities(nid);if(!cs.length)return [...Array(n)].map((_,i)=>[`Club ${i+1}`,null]);const m=Math.max(1,Math.min(cs.length,Math.ceil(n*.8)));const out=[],used={};
  for(let k=0;out.length<n&&k<n*10;k++){const c=cs[k%m];const nm=P[(k*5+Math.floor(k/m)*3+c[0].length)%P.length].replace('{c}',c[0]);if(used[nm])continue;used[nm]=1;out.push([nm,c[1]]);}while(out.length<n)out.push([`Deportivo ${out.length+1}`,null]);return out;}
const FT_COLS=['#c8102e','#034694','#ffffff','#fdb913','#000000','#6cabdd','#00843d','#7a263a','#ff6b00','#5b2b82','#1b458f','#d71920','#009ee0','#132257','#ffcd00','#e30613'];
function ftNewClub(W,nm,rg,nid,lid,r,rich){const id='c'+(W.nx++);const fa=+(Math.exp((r-60)/7)*rich*.5).toFixed(2);
  W.C[id]={i:id,n:nm,c:nid,l:lid,r:+r.toFixed(1),rg,b:+(Math.exp((r-55)/8)*rich*6).toFixed(1),fa,st:Math.round((15+Math.max(0,r-55)*1.8)*(.7+rich*.3))*1000,col:[pick(FT_COLS),pick(FT_COLS)],tr:[]};return W.C[id];}
// alineación de un calendario: cuántas jornadas se juegan en cada mes
const FT_MON={eu:[7,8,9,10,11,0,1,2,3,4],cal:[1,2,3,4,5,6,7,8,9,10],mxA:[6,7,8,9],mxC:[0,1,2,3]};const FT_WGT=[3,4,4,4,5,4,4,3,4,3];
function ftAlloc(f,nmd){const ms=FT_MON[f];const w=ms.map((_,i)=>FT_WGT[i%FT_WGT.length]);const s=w.reduce((a,b)=>a+b,0);const out={};let acc=0,done=0;
  ms.forEach((m,i)=>{acc+=w[i]/s*nmd;const k=Math.round(acc)-done;out[m]=(out[m]||0)+k;done+=k;});return out;}
function ftNewLeague(W,def,tier,home){const [nid,name,f,n1,n2,rng,rich,lang0]=def;const n=tier===1?n1:n2;const lid=nid+tier;const lang=lang0||FT_LANG[cultOf(nid)]||'xx';
  const L={rng:tier===1?rng:[rng[0]-9,rng[0]+3],i:lid,n:tier===1?name:(FT_2N[nid]||'Segunda división de '+ftNm(nid)),c:nid,t:tier,f,cl:[],tb:{},md:0,nmd:f==='mx'?n-1:2*(n-1),ph:'off',rich,ord:[],res:[],home:!!home};
  W.L[lid]=L;return L;}
function ftNew(){const W={v:1,nx:1,L:{},C:{},S:{},NT:{},K:{},hist:{lg:{},cup:{},cont:{},cwc:[],wc:[],ct:{},bd:[],gb:[]},ev:[],cy:G.year-1,cm:6,quiet:1};G.ft=W;
  for(const n in G.nations)W.NT[n]=ftNTbase(n);
  for(const def of FT_LG){if(!G.nations[def[0]])continue;ftBuildLeagues(W,def);}
  // copa continental de América: clubes de los países sudamericanos que no se simulan
  for(const [nid,cnt] of [['COL',2],['URY',2],['CHL',1],['ECU',1],['PER',1],['PRY',1]]){if(!G.nations[nid])continue;const nms=ftClubNames(nid,cnt,'es');nms.forEach(([nm,rg])=>ftNewClub(W,nm,rg,nid,null,R(62,72),.3));}
  return W;}
function ftBuildLeagues(W,def,home){const [nid,,f,n1,n2,rng,rich,lang0]=def;const lang=lang0||FT_LANG[cultOf(nid)]||'xx';const L1=ftNewLeague(W,def,1,home);const names=ftClubNames(nid,n1+(n2||0),lang);
  for(let i=0;i<n1;i++){const r=rng[0]+(rng[1]-rng[0])*Math.pow(1-i/(n1-1),1.6)+R(-1.5,1.5);const c=ftNewClub(W,names[i][0],names[i][1],nid,L1.i,r,rich);L1.cl.push(c.i);ftStars(W,c,2);}
  if(n2){const L2=ftNewLeague(W,def,2,home);for(let i=0;i<n2;i++){const r=rng[0]-9+(rng[0]-rng[0]*.82)*Math.pow(1-i/(n2-1),1.3)+R(-1.5,1.5);const nm=names[n1+i]||[`Deportivo ${i+1}`,null];const c=ftNewClub(W,nm[0],nm[1],nid,L2.i,r,rich*.25);L2.cl.push(c.i);}L1.dn=L2.i;L2.up=L1.i;}
  return L1;}
// la liga de tu país, si no se simula (se crea al empezar una carrera de fútbol)
function ftEnsureHome(nid){const W=FTW();if(Object.values(W.L).some(L=>L.c===nid&&L.t===1))return;const nt=ftNT(nid);const hi=clamp(nt-4,52,74),lo=hi-16;
  const L1=ftBuildLeagues(W,[nid,`Liga de ${ftNm(nid)}`,'cal',16,0,[lo,hi],clamp(.15+(N0[nid]?Math.log10((N0[nid].gdp||1e10)/1e10)*.1:0),.1,.5),null],true);
  // arranca su temporada como si llevara los meses ya jugados
  if(W.cm>=1&&W.cm<=10){ftSeasonStart(L1);const ms=FT_MON.cal;for(const m of ms){if(m>=W.cm)break;ftPlayMonth(L1,m);}}}

/* ----- estrellas ----- */
function ftStarNat(lg){if(chance(lg==='SAU'?.2:.6))return lg;const o={BRA:14,ARG:12,FRA:12,ESP:10,PRT:7,ENG:0,GBR:8,DEU:7,ITA:6,NLD:6,BEL:5,HRV:3,URY:4,COL:4,SEN:3,NGA:3,CIV:3,MAR:4,JPN:3,KOR:2,USA:2,MEX:2,NOR:3,DNK:3,SRB:2,POL:2,EGY:2,DZA:2,GHA:2,CMR:2,ECU:2,CHE:2,AUT:2,TUR:2,UKR:2,SWE:2,GEO:1};for(const k in o)if(!G.nations[k])delete o[k];return wpick(o);}
function ftStars(W,c,n,young){for(let i=0;i<n;i++){const nid=ftStarNat(c.c);const cu=cultOf(nid);const po=pick([0,1,1,2,3,4,4,5,5,6,6]);const g=young?RI(18,21):RI(20,33);
  const r=clamp(c.r+R(1,8)-(young?6:0),45,95);const id='s'+(W.nx++);FT_SC=null;W.S[id]={i:id,n:rndFirst('M',cu)+' '+rndSur(cu),c:nid,po,r:+r.toFixed(1),pt:+clamp(r+(g<24?R(2,12):0),r,96).toFixed(1),g,cl:c.i,gl:0,as:0,pj:0,tg:0,cap:0};}}
// índice de estrellas por club (v1.6d: antes se recorrían todas las estrellas en cada partido; era lo más lento de cada mes)
var FT_SC=null;const ftStarsOf=cid=>{const W=FTW();if(!FT_SC||FT_SC.W!==W){const ix={};for(const id in W.S){const s=W.S[id];(ix[s.cl]=ix[s.cl]||[]).push(s);}FT_SC={W,ix};}return FT_SC.ix[cid]||[];};

/* ----- partidos ----- */
function ftR(cid){const W=FTW();const c=W.C[cid];if(!c)return 60;let r=c.r;const p=P,fb=p&&p.fc&&p.fc.fb;if(fb&&fb.cl===cid&&fb.role!=='juv'&&!p.fc.inj){r+=(fb.ovr-c.r)*.09*({tit:1,rot:.55,sup:.2}[fb.role]||0);}return r;}
var FT_COMP='';
function ftPlay(h,a,neu,rh,ra){rh=rh!=null?rh:ftR(h);ra=ra!=null?ra:ftR(a);const d=(rh-ra)/26;const x=ftPois(1.32*Math.exp(d+(neu?0:.12))),y=ftPois(1.1*Math.exp(-d-(neu?0:.05)));
  const W=FTW();if(W&&!W.quiet){const k=W.tk&&(h===W.tk||a===W.tk)?W.tk:W.tn&&(h===W.tn||a===W.tn)?W.tn:null;if(k)(W.mr=W.mr||[]).push(h===k?[x,y,a,FT_COMP,1,k===W.tn?1:0]:[y,x,h,FT_COMP,0,k===W.tn?1:0]);}return [x,y];}
function ftPens(rh,ra){let a=0,b=0;for(let i=0;i<5;i++){if(chance(.76+(rh-ra)/400))a++;if(chance(.76+(ra-rh)/400))b++;}while(a===b){if(chance(.75))a++;if(chance(.75))b++;}return [a,b];}
// partido de eliminación: prórroga y penales si hace falta → {w,l,s:'2-1', p:'(4-3 pen.)'}
function ftKO(h,a,rh,ra,neu){let [x,y]=ftPlay(h,a,neu,rh,ra);let tag='';if(x===y){const [ex,ey]=ftPlay(h,a,neu,rh,ra);x+=Math.round(ex/3);y+=Math.round(ey/3);if(x!==y)tag=' (t. e.)';}
  if(x===y){const [pa,pb]=ftPens(rh!=null?rh:ftR(h),ra!=null?ra:ftR(a));const hw=pa>pb;return {w:hw?h:a,l:hw?a:h,s:`${x}-${y}`,t:` (${hw?pa:pb}-${hw?pb:pa} pen.)`};}return {w:x>y?h:a,l:x>y?a:h,s:x>y?`${x}-${y}`:`${y}-${x}`,t:tag};}
function ftTie(h,a){// eliminatoria de ida y vuelta (sin gol de visitante)
  const [a1,b1]=ftPlay(h,a);const [b2,a2]=ftPlay(a,h);let A=a1+a2,B=b1+b2,t='';if(A===B){const [ex,ey]=ftPlay(a,h);B+=Math.round(ex/3);A+=Math.round(ey/3);if(A!==B)t=' (t. e.)';}
  if(A===B){const [pa,pb]=ftPens(ftR(h),ftR(a));const hw=pa>pb;return {w:hw?h:a,l:hw?a:h,s:`${A}-${B}`,t:` (${hw?pa:pb}-${hw?pb:pa} pen.)`};}return {w:A>B?h:a,l:A>B?a:h,s:A>B?`${A}-${B}`:`${B}-${A}`,t};}
function ftNews(t,nids,big){const W=FTW();W.ev.push({y:W.cy,m:W.cm,t});if(W.ev.length>80)W.ev.shift();if(W.quiet||typeof archiveNews!=='function'||!P)return;const me=natOf(P).id;
  if(nids&&nids.includes(me))archiveNews(t,'news','nac');else if(big)archiveNews(t,'news','int');}
const ftCN=cid=>{const c=FTW().C[cid];return c?c.n:'?';};

/* ----- ligas: calendario, tabla, liguilla ----- */
function ftSeasonStart(L){const W=FTW();L.tb={};L.cl.forEach(c=>L.tb[c]=[0,0,0,0,0,0,0]);L.md=0;L.ord=L.cl.slice().sort(()=>Math.random()-.5);L.ph='reg';L.res=[];L.lig=null;L.y=W.cy;L.alloc=null;L.last=[];
  if(L.f==='mx')L.tor=W.cm<=5?'Clausura':'Apertura';}
function ftPair(L,md){const a=L.ord,n=a.length,half=n-1;const r=md%half;const sw=md>=half;const rot=a.slice(1);for(let i=0;i<r;i++)rot.unshift(rot.pop());const arr=[a[0]].concat(rot);const out=[];
  for(let i=0;i<n/2;i++){let h=arr[i],v=arr[n-1-i];if((i===0&&r%2)||(i>0&&i%2))[h,v]=[v,h];if(sw)[h,v]=[v,h];out.push([h,v]);}return out;}
function ftMatchday(L){FT_COMP=L.n;const res=[];for(const [h,a] of ftPair(L,L.md)){const [x,y]=ftPlay(h,a);const T=L.tb;const th=T[h],ta=T[a];th[0]++;ta[0]++;th[4]+=x;th[5]+=y;ta[4]+=y;ta[5]+=x;
    if(x>y){th[1]++;ta[3]++;th[6]+=3;}else if(x<y){ta[1]++;th[3]++;ta[6]+=3;}else{th[2]++;ta[2]++;th[6]++;ta[6]++;}res.push([h,a,x,y]);ftStarGoals(h,x);ftStarGoals(a,y);}
  L.md++;L.res=res;if(L.home||(P&&P.fc&&P.fc.fb&&L.cl.includes(P.fc.fb.cl)))L.last=(L.last||[]).concat([res]).slice(-6);return res;}
function ftTable(L){return L.cl.slice().sort((x,y)=>{const a=L.tb[x]||[0,0,0,0,0,0,0],b=L.tb[y]||[0,0,0,0,0,0,0];return b[6]-a[6]||(b[4]-b[5])-(a[4]-a[5])||b[4]-a[4];});}
function ftStarGoals(cid,g){if(!g)return;const S=ftStarsOf(cid);if(!S.length)return;for(let i=0;i<g;i++){const w=S.map(s=>(FT_GA[s.po][0]+.04)*Math.pow(s.r/70,2));const sum=w.reduce((a,b)=>a+b,0)+.9;let k=Math.random()*sum;for(let j=0;j<S.length;j++){k-=w[j];if(k<=0){S[j].gl++;S[j].tg++;break;}}}
  S.forEach(s=>s.pj++);}
function ftPlayMonth(L,m){if(L.ph!=='reg')return;const al=L.alloc||(L.alloc=ftAlloc(L.f==='mx'?(m<=5?'mxC':'mxA'):L.f,L.nmd));const k=al[m]||0;for(let i=0;i<k&&L.md<L.nmd;i++)ftMatchday(L);
  if(L.md>=L.nmd){if(L.f==='mx'){L.ph='lig';ftLigStart(L);}else ftSeasonEnd(L);}}
function ftLigStart(L){const T=ftTable(L).slice(0,8);L.lig={r:0,t:T,res:[]};}
function ftLigRound(L){const g=L.lig;if(!g)return;FT_COMP=`Liguilla (${L.tor})`;const T=g.t;if(T.length===2){const r=ftFinal('lig:'+L.i,T[0],T[1],false,`Final del ${L.tor} de la ${L.n}`);if(r)ftLigApply(L.i,r);return;}
  const nx=[],res=[];for(let i=0;i<T.length/2;i++){const h=T[i],a=T[T.length-1-i];// en la liguilla, si empatan en el global, avanza el mejor sembrado
    const [a1,b1]=ftPlay(a,h);const [b2,a2]=ftPlay(h,a);const A=a1+a2,B=b1+b2;const w=B>=A?h:a;nx.push(w);res.push(`${ftCN(h)} ${B}-${A} ${ftCN(a)}`);}
  nx.sort((x,y)=>T.indexOf(x)-T.indexOf(y));g.t=nx;g.r++;g.res.push(res);}
function ftLigApply(lid,r){const W=FTW(),L=W.L[lid];if(!L)return;const ch=r.w;(W.hist.lg[lid]=W.hist.lg[lid]||[]).push({y:W.cy,t:L.tor,c:ch,s:r.s+(r.t||'')});W.C[ch].tr.push({y:W.cy,t:`${L.n} (${L.tor})`});
  ftNews(`${ftCN(ch)} es campeón del ${L.tor} de la ${L.n} al vencer ${r.s+(r.t||'')} a ${ftCN(r.l)} en la final.`,[L.c],false);ftSeasonEnd(L,true);}
function ftSeasonEnd(L,done){const W=FTW();L.ph='off';L.alloc=null;const T=ftTable(L);L.fin=T.slice();
  if(!done){(W.hist.lg[L.i]=W.hist.lg[L.i]||[]).push({y:W.cy,c:T[0],pts:L.tb[T[0]][6]});W.C[T[0]].tr.push({y:W.cy,t:L.n});ftNews(`${ftCN(T[0])} gana la ${L.n} (${L.f==='eu'?(W.cy-1)+'-'+String(W.cy).slice(2):W.cy}) con ${L.tb[T[0]][6]} puntos.`,[L.c],L.t===1&&['GBR','ESP','ITA','DEU'].includes(L.c));}
  // ascensos y descensos (3 y 3)
  if(L.dn&&W.L[L.dn]&&W.L[L.dn].ph==='off'&&W.L[L.dn].fin)ftSwap(L,W.L[L.dn]);if(L.up&&W.L[L.up]&&W.L[L.up].ph==='off'&&W.L[L.up].fin&&W.L[L.up].y===L.y)ftSwap(W.L[L.up],L);
  // dinero y fuerza: los clubes regresan hacia lo que su presupuesto puede pagar
  T.forEach((cid,i)=>{const c=W.C[cid];const bonus=(1-i/T.length)*L.rich*(L.t===1?8:2);c.b=+(c.b*.9+bonus+.5).toFixed(1);});}
function ftSwap(L1,L2){if(L1._sw===L1.y&&L2._sw===L2.y)return;const W=FTW();const d=ftTable(L1).slice(-3),u=(L2.fin||ftTable(L2)).slice(0,3);L1._sw=L1.y;L2._sw=L2.y;
  L1.cl=L1.cl.filter(c=>!d.includes(c)).concat(u);L2.cl=L2.cl.filter(c=>!u.includes(c)).concat(d);d.forEach(c=>W.C[c].l=L2.i);u.forEach(c=>W.C[c].l=L1.i);
  u.forEach(c=>{if(!ftStarsOf(c).length)ftStars(W,W.C[c],1);});ftNews(`Ascienden a la ${L1.n}: ${u.map(ftCN).join(', ')}. Descienden: ${d.map(ftCN).join(', ')}.`,[L1.c],false);}

/* ----- copas de eliminación (nacionales) ----- */
const FT_CUPM={eu:[9,11,0,1,2,3,4],cal:[3,5,7,8,9,10]};
function ftCupStart(nid){const W=FTW();const Ls=Object.values(W.L).filter(L=>L.c===nid&&L.f!=='mx');if(!Ls.length)return;const T=[].concat(...Ls.map(L=>L.cl));if(T.length<8)return;
  const f=Ls[0].f;W.K['cup:'+nid]={k:'cup',c:nid,n:nid==='GBR'?'Copa de Inglaterra':nid==='USA'?'Copa Abierta de EE. UU.':`Copa de ${ftNm(nid)}`,t:T.sort(()=>Math.random()-.5),m:FT_CUPM[f==='eu'?'eu':'cal'],r:0,res:[],y:W.cy};}
function ftCupRound(K){if(K.done)return;FT_COMP=K.n;let T=K.t;const n2=1<<Math.floor(Math.log2(T.length));const nx=[],res=[];
  if(T.length===2){const r=ftFinal('cup:'+K.c,T[0],T[1],false,`Final de la ${K.n}`);if(r)ftCupApply('cup:'+K.c,r);return;}
  if(T.length>n2){const extra=T.length-n2;const sorted=T.slice().sort((a,b)=>ftR(a)-ftR(b));const play=sorted.slice(0,extra*2),bye=sorted.slice(extra*2);for(let i=0;i<play.length;i+=2){const r=ftKO(play[i],play[i+1]);nx.push(r.w);}T=bye.concat(nx);K.t=T.sort(()=>Math.random()-.5);K.r++;return;}
  for(let i=0;i<T.length;i+=2){const r=ftKO(T[i],T[i+1]);nx.push(r.w);res.push(`${ftCN(r.w)} ${r.s}${r.t} ${ftCN(r.l)}`);}K.t=nx;K.r++;K.res=res;}
function ftCupApply(key,r){const W=FTW();const K=W.K[key];if(!K)return;K.done=1;K.ch=r.w;(W.hist.cup[key]=W.hist.cup[key]||[]).push({y:W.cy,c:r.w});W.C[r.w].tr.push({y:W.cy,t:K.n});ftNews(`${ftCN(r.w)} gana la ${K.n}: ${r.s+(r.t||'')} a ${ftCN(r.l)}.`,[K.c],false);}

/* ----- copas continentales de clubes: 8 grupos de 4 + eliminatorias de ida y vuelta + final ----- */
const FT_CONT={UEFA:{q:{GBR:5,ESP:5,ITA:5,DEU:5,FRA:5,PRT:4,NLD:3},gm:[8,8,9,9,10,11],ko:[[1,2],[3,3],[4,4]],fin:4},AME:{q:{BRA:8,ARG:7,MEX:5,USA:4,COL:2,URY:2,CHL:1,ECU:1,PER:1,PRY:1},gm:[2,3,3,4,4,5],ko:[[6,7],[8,8],[9,9]],fin:10}};
function ftContStart(k){const W=FTW();const D=FT_CONT[k];const T=[];for(const nid in D.q){const L=Object.values(W.L).find(L=>L.c===nid&&L.t===1);let src=L?(L.fin||ftTable(L)):Object.values(W.C).filter(c=>c.c===nid&&!c.l).sort((a,b)=>b.r-a.r).map(c=>c.i);T.push(...src.slice(0,D.q[nid]));}
  while(T.length<32){const x=Object.values(W.C).filter(c=>!T.includes(c.i)&&W.L[c.l]&&W.L[c.l].t===1&&(k==='UEFA'?FT_CONT.UEFA.q[c.c]:FT_CONT.AME.q[c.c])).sort((a,b)=>b.r-a.r)[0];if(!x)break;T.push(x.i);}
  if(T.length<32)return;const pots=T.slice().sort((a,b)=>W.C[b].r-W.C[a].r);const G8=[[],[],[],[],[],[],[],[]];for(let p=0;p<4;p++){const pot=pots.slice(p*8,p*8+8).sort(()=>Math.random()-.5);
    pot.forEach(c=>{let g=G8.findIndex(x=>x.length===p&&!x.some(y=>W.C[y].c===W.C[c].c));if(g<0)g=G8.findIndex(x=>x.length===p);G8[g].push(c);});}
  W.K['cont:'+k]={k:'cont',ck:k,n:FT_CUPN[k],g:G8.map(g=>({t:g,tb:Object.fromEntries(g.map(c=>[c,[0,0,0,0,0,0,0]]))})),md:0,st:'g',ko:null,y:W.cy,res:[]};}
const FT_GRR=[[0,1,2,3],[0,2,1,3],[0,3,1,2],[1,0,3,2],[2,0,3,1],[3,0,2,1]];
function ftGroupMD(grp,md,neu){const t=grp.t;const P2=FT_GRR[md%6];const res=[];for(let i=0;i<4;i+=2){const h=t[P2[i]],a=t[P2[i+1]];if(!h||!a)continue;const [x,y]=neu?ftPlayN(h,a):ftPlay(h,a);const th=grp.tb[h],ta=grp.tb[a];
  th[0]++;ta[0]++;th[4]+=x;th[5]+=y;ta[4]+=y;ta[5]+=x;if(x>y){th[1]++;ta[3]++;th[6]+=3;}else if(x<y){ta[1]++;th[3]++;ta[6]+=3;}else{th[2]++;ta[2]++;th[6]++;ta[6]++;}res.push([h,a,x,y]);}grp.last=res;return res;}
const ftGT=grp=>grp.t.slice().sort((x,y)=>{const a=grp.tb[x],b=grp.tb[y];return b[6]-a[6]||(b[4]-b[5])-(a[4]-a[5])||b[4]-a[4];});
function ftContMonth(K,m){const D=FT_CONT[K.ck];FT_COMP=K.n;
  if(K.st==='g'){const k=D.gm.filter(x=>x===m).length;for(let i=0;i<k&&K.md<6;i++){K.g.forEach(g=>ftGroupMD(g,K.md));K.md++;}
    if(K.md>=6){const W1=K.g.map(g=>ftGT(g)[0]),W2=K.g.map(g=>ftGT(g)[1]);const pr=[];for(let i=0;i<8;i++)pr.push([W2[(i+1)%8],W1[i]]);K.ko=pr;K.st='ko';K.kr=0;
      ftNews(`${K.n}: terminan los grupos. Avanzan ${W1.map(ftCN).slice(0,4).join(', ')} y otros 12 clubes.`,[...new Set(W1.concat(W2).map(c=>FTW().C[c].c))],false);}return;}
  if(K.st==='ko'){if(K.kr<3&&D.ko[K.kr][1]===m){const nx=[],res=[];for(const [h,a] of K.ko){const r=ftTie(h,a);nx.push(r.w);res.push(`${ftCN(r.w)} ${r.s}${r.t} ${ftCN(r.l)} (global)`);}K.res.push(res);K.kr++;
      if(nx.length===2){K.st='f';K.fin=nx;}else{K.ko=[];for(let i=0;i<nx.length;i+=2)K.ko.push([nx[i],nx[i+1]]);}}if(K.st!=='f')return;}
  if(K.st==='f'&&m===D.fin){const r=ftFinal('cont:'+K.ck,K.fin[0],K.fin[1],false,`Final de la ${K.n}`,true);if(r)ftContApply('cont:'+K.ck,r);}}
function ftContApply(key,r){const W=FTW();const K=W.K[key];if(!K)return;K.st='done';K.ch=r.w;(W.hist.cont[K.ck]=W.hist.cont[K.ck]||[]).push({y:W.cy,c:r.w,ru:r.l,s:r.s+(r.t||'')});W.C[r.w].tr.push({y:W.cy,t:K.n});
  const c=W.C[r.w];c.r=Math.min(95,c.r+1);c.b=+(c.b+25*(K.ck==='UEFA'?1:.3)).toFixed(1);ftNews(`¡${ftCN(r.w)} (${ftNm(W.C[r.w].c)}) gana la ${K.n}! Vence ${r.s+(r.t||'')} a ${ftCN(r.l)} en la final.`,[W.C[r.w].c,W.C[r.l].c],true);}
// Mundial de Clubes (diciembre): campeones continentales + dos invitados
function ftCWC(){const W=FTW();const eu=(W.hist.cont.UEFA||[]).slice(-1)[0],am=(W.hist.cont.AME||[]).slice(-1)[0];if(!eu||!am||eu.y<W.cy-1)return;const ot=FT_OTHER.slice().sort(()=>Math.random()-.5).slice(0,2);
  const ids=ot.map(([n,nid,r])=>{let c=Object.values(W.C).find(x=>x.n===n);if(!c)c=ftNewClub(W,n,null,nid,null,r,.4);return c.i;});const s1=ftKO(eu.c,ids[0],null,null,true),s2=ftKO(am.c,ids[1],null,null,true);
  W.K.cwc={k:'cwc',n:'Mundial de Clubes',sf:[`${ftCN(s1.w)} ${s1.s}${s1.t} ${ftCN(s1.l)}`,`${ftCN(s2.w)} ${s2.s}${s2.t} ${ftCN(s2.l)}`],y:W.cy};const r=ftFinal('cwc',s1.w,s2.w,false,'Final del Mundial de Clubes',true);if(r)ftCWCApply('cwc',r);}
function ftCWCApply(key,r){const W=FTW();W.hist.cwc.push({y:W.cy,c:r.w,ru:r.l});W.C[r.w].tr.push({y:W.cy,t:'Mundial de Clubes'});if(W.K.cwc)W.K.cwc.ch=r.w;ftNews(`${ftCN(r.w)} es campeón del Mundial de Clubes: ${r.s+(r.t||'')} a ${ftCN(r.l)}.`,[W.C[r.w].c],true);}

/* ----- selecciones: Mundial de 48 y torneos continentales ----- */
function ftNtR(n){let r=ftNT(n);const p=P,fb=p&&p.fc&&p.fc.fb;if(fb&&fb.call&&natOf(p).id===n&&!p.fc.inj)r+=Math.max(0,fb.ovr-r)*.1+.5;return r;}
function ftPlayN(a,b,host){const ra=ftNtR(a)+(host&&host.includes(a)?3:0),rb=ftNtR(b)+(host&&host.includes(b)?3:0);return ftPlay(a,b,true,ra,rb);}
function ftKON(a,b,host){const ra=ftNtR(a)+(host&&host.includes(a)?3:0),rb=ftNtR(b)+(host&&host.includes(b)?3:0);return ftKO(a,b,ra,rb,true);}
function ftWCHost(y){if(FT_HOST[y])return FT_HOST[y].filter(n=>G.nations[n]);const L=Object.keys(G.nations).filter(n=>G.nations[n].alive!==false&&(N0[n]&&N0[n].pop>2e7)).sort((a,b)=>(N0[b].gdp||0)-(N0[a].gdp||0)).slice(0,25);return [pick(L)];}
function ftQualify(conf,n,ex){const L=Object.keys(G.nations).filter(x=>G.nations[x].alive!==false&&ftConf(x)===conf&&!ex.includes(x));return L.map(x=>[x,ftNT(x)+gz()*4]).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0]);}
function ftWCField(y){const host=ftWCHost(y);const F=host.slice();const hc={};host.forEach(h=>{const c=ftConf(h);hc[c]=(hc[c]||0)+1;});
  for(const c in FT_WCS){if(c==='PO')continue;F.push(...ftQualify(c,FT_WCS[c]-(hc[c]||0),F));}
  const po=['CONCACAF','AFC','CAF','CONMEBOL','OFC'].flatMap(c=>ftQualify(c,2,F)).map(x=>[x,ftNT(x)+gz()*5]).sort((a,b)=>b[1]-a[1]).slice(0,48-F.length).map(x=>x[0]);F.push(...po);return {y,host,t:F.slice(0,48)};}
// torneo de selecciones genérico: grupos de 4 (junio), mejores terceros, eliminación directa (julio)
function ftNatStart(key,name,teams,ng,b3,host,y){const W=FTW();const pots=teams.slice().sort((a,b)=>ftNT(b)-ftNT(a));const G0=[...Array(ng)].map(()=>[]);(host||[]).forEach((h,i)=>{if(teams.includes(h)&&i<ng)G0[i].push(h);});
  for(const t of pots){if(G0.some(g=>g.includes(t)))continue;const p=Math.min(...G0.map(g=>g.length));const opts=G0.filter(g=>g.length===p);const sc=opts.filter(g=>!g.some(x=>ftConf(x)===ftConf(t)&&ftConf(t)!=='UEFA'));(sc.length?pick(sc):pick(opts)).push(t);}
  W.K[key]={k:'nat',n:name,y,host:host||[],g:G0.map(g=>({t:g,tb:Object.fromEntries(g.map(c=>[c,[0,0,0,0,0,0,0]]))})),b3,st:'g',res:[]};
  ftNews(host&&host.length?`Arranca ${name} (${y}) en ${host.map(ftNm).join(', ')}: ${teams.length} selecciones.`:`Arranca ${name} (${y}): ${teams.length} selecciones.`,teams,key==='wc');}
function ftNatMonth(key,m){const W=FTW(),K=W.K[key];if(!K||K.st==='done')return;FT_COMP=K.n;
  if(K.st==='g'&&m===5){for(let md=0;md<3;md++)K.g.forEach(g=>{const t=g.t,P2=FT_GRR[md];for(let i=0;i<4;i+=2){const h=t[P2[i]],a=t[P2[i+1]];const [x,y]=ftPlayN(h,a,K.host);const th=g.tb[h],ta=g.tb[a];
      th[0]++;ta[0]++;th[4]+=x;th[5]+=y;ta[4]+=y;ta[5]+=x;if(x>y){th[1]++;ta[3]++;th[6]+=3;}else if(x<y){ta[1]++;th[3]++;ta[6]+=3;}else{th[2]++;ta[2]++;th[6]++;ta[6]++;}K.res.push([h,a,x,y]);}});
    const q=[];const thirds=[];K.g.forEach(g=>{const T=ftGT(g);q.push(T[0],T[1]);thirds.push([T[2],g.tb[T[2]]]);});thirds.sort((a,b)=>b[1][6]-a[1][6]||(b[1][4]-b[1][5])-(a[1][4]-a[1][5]));q.push(...thirds.slice(0,K.b3).map(x=>x[0]));
    // cruces: los mejores contra los peores
    const S=q.slice().sort((a,b)=>{const A=K.g.find(g=>g.t.includes(a)).tb[a],B=K.g.find(g=>g.t.includes(b)).tb[b];return B[6]-A[6]||(B[4]-B[5])-(A[4]-A[5]);});const ko=[];for(let i=0;i<S.length/2;i++)ko.push(S[i],S[S.length-1-i]);
    K.ko=ko;K.st='ko';K.kres=[];const me=P?natOf(P).id:null;if(me&&K.g.some(g=>g.t.includes(me)))ftNews(`${K.n}: ${ftNm(me)} ${q.includes(me)?'avanza a la fase eliminatoria':'queda eliminado en la fase de grupos'}.`,[me],false);return;}
  if(K.st==='ko'&&m===6){let T=K.ko;while(T.length>2){const nx=[],res=[];for(let i=0;i<T.length;i+=2){const r=ftKON(T[i],T[i+1],K.host);nx.push(r.w);res.push(`${ftNm(r.w)} ${r.s}${r.t} ${ftNm(r.l)}`);}K.kres.push(res);T=nx;}
    K.ko=T;K.st='f';const r=ftFinal(key,T[0],T[1],true,`Final de ${K.n}`,true);if(r)ftNatApply(key,r);}}
function ftNatApply(key,r){const W=FTW(),K=W.K[key];if(!K)return;K.st='done';K.ch=r.w;K.ru=r.l;K.fs=r.s+(r.t||'');if(key==='wc')W.hist.wc.push({y:K.y,c:r.w,ru:r.l,host:K.host,s:K.fs});else (W.hist.ct[K.n]=W.hist.ct[K.n]||[]).push({y:K.y,c:r.w,ru:r.l});
  W.NT[r.w]=Math.min(95,(W.NT[r.w]||ftNTbase(r.w))+1);ftNews(`¡${ftNm(r.w).toUpperCase()} CAMPEÓN DE ${K.n.toUpperCase()} ${K.y}! Vence ${K.fs} a ${ftNm(r.l)} en la final.`,[r.w,r.l],key==='wc');}

/* ----- finales: si juega tu club o tu selección (y tú), la final se juega en pantalla ----- */
function ftFinal(comp,a,b,nat,label,neu){const p=P,fb=p&&p.fc&&p.fc.fb;const mine=fb&&!p.fc.inj&&((nat&&fb.call&&natOf(p).id===a||nat&&fb.call&&natOf(p).id===b)||(!nat&&(fb.cl===a||fb.cl===b)&&fb.role!=='juv'));
  const ff=typeof FF_ON!=='undefined'&&FF_ON;if(mine&&!CB_AUTO&&!ff&&!FTW().quiet){fb.big={comp,a,b,nat:!!nat,label,neu:!!neu,mine:nat?(natOf(p).id===a?'a':'b'):(fb.cl===a?'a':'b')};return null;}
  const r=nat?ftKON(a,b,(FTW().K[comp]||{}).host):ftKO(a,b,null,null,neu);if(mine)fbFinalStats(p,r,nat,label);return r;}
const FT_APPLY={lig:(k,r)=>ftLigApply(k.split(':')[1],r),cup:(k,r)=>ftCupApply(k,r),cont:(k,r)=>ftContApply(k,r),cwc:(k,r)=>ftCWCApply(k,r)};
function ftApplyFinal(comp,r){const t=comp.split(':')[0];if(FT_APPLY[t])FT_APPLY[t](comp,r);else ftNatApply(comp,r);}

/* ----- el mes del mundo del fútbol ----- */
function ftMonthWorld(){const W=FTW();FT_SC=null;const m=W.cm,y=W.cy;
  for(const L of Object.values(W.L)){const f=L.f;
    if(f==='eu'&&m===7)ftSeasonStart(L);if(f==='cal'&&m===1)ftSeasonStart(L);if(f==='mx'&&(m===0||m===6))ftSeasonStart(L);
    if(L.ph==='reg')ftPlayMonth(L,m);else if(L.ph==='lig'){if(m===4||m===10){ftLigRound(L);ftLigRound(L);if(m===4)ftLigRound(L);}else if(m===11)ftLigRound(L);}}
  // copas nacionales
  const ctry=[...new Set(Object.values(W.L).map(L=>L.c))];for(const c of ctry){const L=Object.values(W.L).find(x=>x.c===c&&x.t===1);if(!L||L.f==='mx')continue;const sm=L.f==='eu'?8:2;if(m===sm)ftCupStart(c);const K=W.K['cup:'+c];if(K&&!K.done&&K.m.includes(m))ftCupRound(K);}
  // copas continentales
  if(m===7)ftContStart('UEFA');if(m===1)ftContStart('AME');for(const k of ['UEFA','AME']){const K=W.K['cont:'+k];if(K&&K.st!=='done')ftContMonth(K,m);}
  if(m===11)ftCWC();
  // selecciones
  if(m===10&&y%4===1){const F=ftWCField(y+1);W.wcF=F;const me=P?natOf(P).id:null;ftNews((`Eliminatorias: quedan definidas las 48 selecciones del Mundial ${y+1}.`+(me?(F.t.includes(me)?` ${ftNm(me)} ¡clasifica!`:` ${ftNm(me)} se queda fuera.`):'')),me?[me]:[],true);}
  if(m===5){if(y%4===2){const F=W.wcF&&W.wcF.y===y?W.wcF:ftWCField(y);ftNatStart('wc','la Copa del Mundo',F.t,12,8,F.host,y);}
    FT_CT.forEach(([n,conf,cnt,ng,b3,rem,cyc],i)=>{if(y%cyc===rem&&!(y%4===2)){let T=ftQualify(conf,cnt,[]);if(T.length<cnt)T=T.concat(ftQualify('CONCACAF',cnt-T.length,T));if(T.length>=ng*4)ftNatStart('ct'+i,n,T.slice(0,ng*4),ng,b3,[T[RI(0,Math.min(5,T.length-1))]],y);}});}
  if(m===5||m===6)for(const k in W.K)if(W.K[k].k==='nat')ftNatMonth(k,m);
  // fichajes de la IA (verano)
  if(m===7)ftAITransfers();
  // Balón Dorado (octubre) y fin de año
  if(m===9)ftBallon();
  if(m===11)ftYear();
  // avanza el calendario del mundo
  W.cm++;if(W.cm>11){W.cm=0;W.cy++;}}
function ftAITransfers(){const W=FTW();const S=Object.values(W.S).filter(s=>s.r>=80&&s.g<=30).sort((a,b)=>b.r-a.r);let n=0;
  for(const s of S){const c=W.C[s.cl];if(!c||n>=6)continue;if(s.r<c.r+3||!chance(.3))continue;const T=Object.values(W.C).filter(x=>x.l&&W.L[x.l]&&W.L[x.l].t===1&&x.r>c.r+2&&x.b>c.b).sort((a,b)=>b.r-a.r).slice(0,6);if(!T.length)continue;const to=pick(T);
    const fee=Math.round(.3*Math.exp((s.r-60)*.2)*(s.g<26?1.2:1)*10)/10;FT_SC=null;s.cl=to.i;to.b=+(to.b-fee*.3).toFixed(1);c.b=+(c.b+fee*.5).toFixed(1);n++;ftNews(`Fichaje: ${s.n} (${ftNm(s.c)}) deja ${c.n} y firma con ${to.n} por US$${fee} M.`,[s.c,c.c,to.c],s.r>=86);}}
function ftBallon(){const W=FTW();const C=[];for(const s of Object.values(W.S)){const c=W.C[s.cl];const tr=c?c.tr.filter(t=>t.y>=W.cy-1).length:0;C.push({n:s.n,c:s.c,cl:c?c.n:'',sc:s.r+s.gl*.18+tr*3+(W.hist.wc.slice(-1)[0]&&W.hist.wc.slice(-1)[0].y===W.cy&&W.hist.wc.slice(-1)[0].c===s.c?6:0)+gz()*1.5,me:0});}
  const p=P,fb=p&&p.fc&&p.fc.fb;if(fb&&fb.cl){const c=W.C[fb.cl];const tr=(fb.tro||[]).filter(t=>t.y>=W.cy-1).length;C.push({n:fullName(p),c:natOf(p).id,cl:c?c.n:'',sc:fb.ovr+(fb.sy?fb.sy.g:0)*.18+tr*3+((fb.sy&&fb.sy.rt/Math.max(1,fb.sy.pj))-6.8)*4+gz()*1.5,me:1});}
  C.sort((a,b)=>b.sc-a.sc);const top=C.slice(0,10);W.hist.bd.push({y:W.cy,top:top.map(x=>[x.n,x.c,x.cl,x.me])});if(W.hist.bd.length>40)W.hist.bd.shift();
  ftNews(`Balón Dorado ${W.cy}: ${top[0].n} (${ftNm(top[0].c)}, ${top[0].cl}). Segundo: ${top[1].n}; tercero: ${top[2].n}.`,[top[0].c],true);
  const i=top.findIndex(x=>x.me);if(i>=0&&p&&p.fc){if(i===0){p.fc.aw.push({y:W.cy,t:'Balón Dorado'});fcBump(p,.6);(fb.tro=fb.tro||[]).push({y:W.cy,t:'🏆 Balón Dorado'});log('🏆 ¡GANAS EL BALÓN DORADO al mejor jugador del mundo!','big');}else log(`Quedas ${i+1}.º en la votación del Balón Dorado.`,'good');}}
function ftYear(){const W=FTW();FT_SC=null;// estrellas: envejecen, crecen o declinan, se retiran y llegan jóvenes
  for(const id in W.S){const s=W.S[id];s.g++;if(s.g<26)s.r+=(s.pt-s.r)*.25;else if(s.g>30)s.r-=R(.5,2.5)*(s.g>33?1.6:1);s.r=+clamp(s.r,40,96).toFixed(1);s.gl=0;s.as=0;s.pj=0;
    if(s.g>=38||(s.g>=34&&chance(.3))){const c=W.C[s.cl];delete W.S[id];FT_SC=null;if(c)ftStars(W,c,1,true);}}
  for(const n in W.NT)W.NT[n]=+(W.NT[n]+(ftNTbase(n)-W.NT[n])*.12+gz()*.8).toFixed(1);
  // clubes: la fuerza sigue al presupuesto (con ruido)
  for(const L of Object.values(W.L)){const T=L.cl.map(c=>W.C[c]).sort((a,b)=>b.b-a.b);const rng=L.rng||[48,64];const lo=rng[0],hi=rng[1];
    T.forEach((c,i)=>{const tgt=lo+(hi-lo)*Math.pow(1-i/Math.max(1,T.length-1),1.5);c.r=+clamp(c.r+(tgt-c.r)*.2+gz()*1.2,40,95).toFixed(1);c.fa=+(c.fa*.92+Math.exp((c.r-60)/7)*L.rich*.5*.08).toFixed(2);});}
  for(const k in W.K){const K=W.K[k];if((K.done||K.st==='done'||K.k==='cwc')&&K.y<W.cy)delete W.K[k];}}
function ftEnsure(){if(!G)return null;if(!G.ft){ftNew();const W=FTW();const tgtY=G.year,tgtM=typeof monthOfDay==='function'?monthOfDay(G.day||0):0;let k=0;while((W.cy<tgtY||(W.cy===tgtY&&W.cm<tgtM))&&k++<40)ftMonthWorld();W.quiet=0;}return G.ft;}

/* ===================== LA CARRERA DEL FUTBOLISTA ===================== */
const fbOf=p=>p&&p.fc&&p.fc.k==='futbol'?p.fc.fb:null;
function fbOvr(fb){const w=FT_POS[fb.pos][2];let s=0;for(let k=0;k<7;k++)s+=fb.at[k]*w[k];return Math.round(clamp(s,1,99));}
function fbClubR(fb){const c=fb.cl&&FTW().C[fb.cl];return c?c.r:45;}
function fbLeague(fb){const c=fb.cl&&FTW().C[fb.cl];return c&&c.l?FTW().L[c.l]:null;}
// valor de mercado (aproximado al de los portales de traspasos): media, edad, liga y años de contrato
function fbVal(p){const fb=fbOf(p);const o=fb.ovr;let v=o<55?2e4*Math.exp((o-40)*.15):3e5*Math.exp((o-60)*.2);const a=p.age;v*=a<=21?1.4:a<=26?1.2:a<=29?1:a<=31?.7:.4;
  const L=fbLeague(fb);v*=L?.6+.4*L.rich:.5;const yl=fb.con?fb.con.y1-FTW().cy:0;v*=yl<1?.55:yl<2?.8:1;if(fb.pt>o+8&&a<=21)v*=1.25;return Math.round(v/1e4)*1e4;}
function fbSalFor(p,c){const L=c.l&&FTW().L[c.l];return Math.max(L?L.rich*2.4e4:1.2e4,Math.round(fbVal(p)*.11*(.6+.4*(L?L.rich:.3))/1000)*1000);}
function fbInit(p){const f=p.fc;ftEnsure();ftEnsureHome(natOf(p).id);const pos=+wpick({0:1,1:2,2:1.5,3:1.2,4:2,5:1.5,6:2});const w=FT_POS[pos][2];
  const at=[...Array(7)].map((_,k)=>k===6?(pos===0?clamp(Math.round(f.sk+8+R(-3,3)),5,99):RI(8,20)):clamp(Math.round(f.sk+R(-5,5)+(w[k]>=.2?6:0)),5,99));
  f.fb={pos,at,ovr:0,pt:+clamp(52+(f.tal-.7)*60+R(-6,8),50,97).toFixed(1),cl:null,role:'juv',con:null,sy:{y:FTW().cy,pj:0,min:0,g:0,a:0,cs:0,rt:0},car:[],nt:{caps:0,g:0},call:0,form:0,trust:50,off:[],tro:[],num:RI(2,30),big:null,live:null,loan:null,req:0,yel:0};
  const fb=f.fb;fb.ovr=fbOvr(fb);f.sk=fb.ovr;fbPlace(p,true);return fb;}
// coloca al jugador en un club de su país según su nivel (fuerzas básicas o primer equipo)
function fbPlace(p,first){const fb=fbOf(p),W=FTW();const nid=natOf(p).id;const Cs=Object.values(W.C).filter(c=>c.c===nid&&c.l).sort((a,b)=>a.r-b.r);if(!Cs.length)return;
  const local=Cs.filter(c=>c.rg===p.r);let c;
  if(p.age<17){c=(local.length?local:Cs).filter(x=>x.r<=fb.ovr+30).pop()||Cs[0];fb.cl=c.i;fb.role='juv';fb.con=null;fb.youth=1;return `Entras a las fuerzas básicas de ${c.n}.`;}
  c=Cs.filter(x=>x.r<=fb.ovr+5).pop();if(!c){fb.cl=null;fb.role='juv';return 'Ningún club profesional te firma todavía: entrena y pide una prueba.';}
  fbSign(p,c.i,0,fbSalFor(p,c),RI(1,3),fb.ovr>=c.r+2?'tit':fb.ovr>=c.r-3?'rot':'sup');return `Firmas tu primer contrato profesional con ${c.n}.`;}
function fbSign(p,cid,fee,sal,yrs,role){const fb=fbOf(p),W=FTW(),c=W.C[cid];const old=fb.cl;fb.cl=cid;fb.role=role||'rot';fb.youth=0;fb.trust=55;
  fb.con={y0:W.cy,y1:W.cy+yrs,sal:Math.round(sal),cl:Math.round(Math.max(fbVal(p)*2.5,sal*8)/1e5)*1e5,fee:fee||0};fb.loan=null;fb.off=[];fb.num=RI(2,30);
  if(fee&&old&&W.C[old])W.C[old].b=+(W.C[old].b+fee/1e6*.9).toFixed(1);if(fee)c.b=+(c.b-fee/1e6).toFixed(1);return c;}
function fbRoleCalc(p){const fb=fbOf(p);if(!fb.cl||fb.role==='juv'&&fb.youth)return fb.role;const d=fb.ovr+(fb.trust-50)/10+fb.form*1.5-fbClubR(fb);return d>=2?'tit':d>=-3?'rot':'sup';}
/* ----- entrenamiento y charla con el entrenador ----- */
function fbTrain(p,i){const f=p.fc,fb=fbOf(p);if(f.trY!==G.year){f.trY=G.year;f.trN=0;}const cr=fbClubR(fb);const eff=.8+clamp((cr-55)/60,0,.6);
  const lvl=fb.ovr<45?1.4:fb.ovr<60?1:fb.ovr<72?.6:fb.ovr<82?.32:.15;const base=.75*eff*f.tal*(1+p.s.salud/120)*lvl*(p.age<17?.85:1)/(1+.12*f.trN++);
  for(let k=0;k<7;k++){const m=(k===i?1.7:k===6&&fb.pos!==0?0:.35)*clamp((100-fb.at[k])/40,.08,1);fb.at[k]=clamp(fb.at[k]+base*m,0,99);}fb.ovr=fbOvr(fb);f.sk=fb.ovr;p.s.salud=clamp(p.s.salud+1,0,100);
  if(chance(.015*(p.age>30?1.5:1))){f.inj=RI(1,2);return `Te lesionas en el entrenamiento extra: ${f.inj} mes(es) fuera.`;}return `Entrenas ${FT_AT[i].toLowerCase()}: ${FT_AT[i]} ${Math.round(fb.at[i])} · media ${fb.ovr}.`;}
function fbTalk(p){const fb=fbOf(p);if(!fb.cl)return {t:'No tienes club.'};const pct=chkPct(p,'carisma',50,(fb.form*5)+(fb.sy.pj?((fb.sy.rt/fb.sy.pj)-6.6)*15:0));const roll=RI(1,100);
  if(roll<=pct){fb.trust=clamp(fb.trust+12,0,100);fb.role=fbRoleCalc(p);return {t:`El entrenador te escucha: «Te veo bien, vas a tener más minutos.» Confianza ${Math.round(fb.trust)}. Rol: ${FT_ROLE[fb.role].toLowerCase()}.`,roll,pct};}
  fb.trust=clamp(fb.trust-6,0,100);return {t:`«Aquí juega el que mejor entrena.» No le gustó que fueras a reclamar. Confianza ${Math.round(fb.trust)}.`,roll,pct};}
function fbTrial(p){const fb=fbOf(p),W=FTW();const nid=natOf(p).id;const Cs=Object.values(W.C).filter(c=>c.c===nid&&c.l).sort((a,b)=>a.r-b.r);const c=Cs.filter(x=>x.r<=fb.ovr+8).pop()||Cs[0];if(!c)return 'No hay clubes en tu país.';
  const pr=clamp(.5+(fb.ovr-c.r)/14,.05,.9);if(!chance(pr))return `Te pruebas en ${c.n}, pero no te firman (probabilidad ${Math.round(pr*100)} %). Mejora tu media y vuelve a intentarlo.`;
  fbSign(p,c.i,0,fbSalFor(p,c),RI(1,2),'sup');return `¡${c.n} te firma tras la prueba! Contrato de ${fb.con.y1-fb.con.y0} año(s), ${fmt(toInt(fb.con.sal,'USD'))} al año.`;}
/* ----- el mes del jugador: partidos, minutos, goles, calificación ----- */
function fbMonthP(p){const fb=fbOf(p),f=p.fc,W=FTW();if(!fb)return;const mr=W.mr||[];W.mr=[];const m=(W.cm+11)%12;// mes que acaba de jugarse
  // sueldo
  if(fb.con&&fb.cl){p.dinero+=fcNet(p,fb.con.sal/12);f.earn+=fb.con.sal/12;}
  // partidos del club y de la selección
  let mins=0;const c=W.C[fb.cl];const cr=c?c.r:50;
  for(const [gf,ga,opp,comp,home,nat] of mr){if(f.inj)break;let mn=0;if(nat){if(!fb.call)continue;mn=fb.ovr>=ftNT(natOf(p).id)+1?RI(70,90):chance(.55)?RI(15,60):0;}
    else{if(fb.role==='juv')continue;const pr={tit:.93,rot:.62,sup:.3}[fb.role];if(!chance(pr))continue;mn=fb.role==='tit'?RI(70,90):fb.role==='rot'?RI(30,80):RI(5,30);}if(!mn)continue;
    const ref=nat?ftNT(natOf(p).id):cr;const q=Math.pow(clamp(fb.ovr/Math.max(40,ref),.6,1.6),1.5);const g=Math.min(gf,ftPois(FT_GA[fb.pos][0]*mn/90*q*(.5+gf/2.8)));const as=Math.min(gf-g,ftPois(FT_GA[fb.pos][1]*mn/90*q*(.5+gf/2.8)));
    const cs=ga===0&&mn>=60&&fb.pos<=3;const rt=clamp(6.3+(fb.ovr-ref)/12+(gf>ga?.4:gf<ga?-.4:0)+g*.8+as*.5+(cs?(fb.pos===0?.8:.4):0)-(fb.pos===0?ga*.25:0)+gz()*.45,3,10);
    if(nat){fb.nt.caps++;fb.nt.g+=g;}else{const S=fb.sy;S.pj++;S.min+=mn;S.g+=g;S.a+=as;S.cs+=cs?1:0;S.rt+=rt;}
    fb.form=clamp(fb.form*.7+(rt-6.7)*.6,-3,3);fb.trust=clamp(fb.trust+(rt-6.6)*2,0,100);mins+=mn;if(chance(.012*(fb.at[5]<50?1.5:1)*(p.age>31?1.4:1))){f.inj=RI(1,3);log(`🤕 Te lesionas en un partido (${comp}): ${f.inj} mes(es) fuera.`,'bad');}}
  // desarrollo: los jóvenes crecen más si juegan; desde los 30 bajan velocidad y físico
  const minF=clamp(mins/360,0,1);if(p.age<=23&&fb.ovr<fb.pt){const gro=(fb.pt-fb.ovr)*.012*(.35+minF)*(fb.role==='juv'?.8:1);const w=FT_POS[fb.pos][2];for(let k=0;k<7;k++)if(k!==6||fb.pos===0)fb.at[k]=clamp(fb.at[k]+gro*(.5+w[k]*3),0,99);}
  if(p.age>=30){const k=p.age>=33?2:1;fb.at[0]=clamp(fb.at[0]-.12*k,5,99);fb.at[5]=clamp(fb.at[5]-.08*k,5,99);}
  fb.ovr=fbOvr(fb);f.sk=fb.ovr;
  // debut desde las fuerzas básicas
  if(fb.role==='juv'&&fb.cl&&p.age>=16&&fb.ovr>=cr-9&&chance(.35)){fb.youth=0;fb.role='sup';const cc=W.C[fb.cl];fbSign(p,fb.cl,0,fbSalFor(p,cc),3,'sup');log(`⚽ ¡Debutas con el primer equipo de ${cc.n}! Firmas tu primer contrato profesional.`,'big');}
  else if(fb.cl&&!fb.youth)fb.role=fbRoleCalc(p);
  // selección: convocatorias en fechas FIFA (marzo, junio, septiembre, octubre, noviembre)
  const nt=ftNT(natOf(p).id);if([2,5,8,9,10].includes(m)){const was=fb.call;fb.call=p.age>=17&&fb.cl&&fb.role!=='juv'&&fb.ovr>=nt-5+gz()*1.5?1:0;if(fb.call&&!was)log(`🇺🇳 Te convocan a la selección de ${natOf(p).name}.`,'good');if(fb.call&&m!==5){fb.nt.caps++;if(chance(FT_GA[fb.pos][0]*1.2))fb.nt.g++;}}
  W.tk=fb.cl;W.tn=fb.call?natOf(p).id:null;
  // ventanas de fichajes: ofertas al cerrar mayo, junio y diciembre
  fb.off=fb.off.filter(o=>o.dl>absDay()&&W.C[o.cl]);if([4,5,11].includes(m)&&p.age>=16)fbOffersGen(p);
  if(fb.con&&m===5&&W.cy>=fb.con.y1){if(fb.loan){const back=fb.loan;fb.loan=null;fb.cl=back.from;fb.con=back.con;log(`Termina tu préstamo: regresas a ${W.C[fb.cl].n}.`);}else{log(`Termina tu contrato con ${W.C[fb.cl]?W.C[fb.cl].n:'tu club'}: eres agente libre.`,'big');fb.cl=null;fb.con=null;fb.role='juv';fbOffersGen(p,true);}}
  if(fb.con&&!fb.loan&&[4,11].includes(m)&&fb.con.y1-W.cy<=1&&fb.role!=='sup'&&!fb.ren)fbRenewOffer(p);
  // temporada nueva: guarda la anterior
  const L=fbLeague(fb);if(L){const k=fbSeasonKey(L);if(!fb.sk2){fb.sk2=k;fb.sy.y=fbSeasonLabel(L);}if(k!==fb.sk2&&L.ph==='reg'&&L.md<=6){if(fb.sy.pj)fb.car.push(Object.assign({cl:W.C[fb.cl]?W.C[fb.cl].n:'',lg:L.n},fb.sy));fb.sy={y:fbSeasonLabel(L),pj:0,min:0,g:0,a:0,cs:0,rt:0};fb.sk2=k;if(fb.car.length>30)fb.car.shift();}
    if(L.ph==='off'&&L.fin&&!fb.aw2&&fb.sk2===k)fbSeasonAwards(p,L);if(L.ph==='reg')fb.aw2=0;}
  fbFansMonth(p);}
const fbSeasonKey=L=>L.i+':'+L.y;const fbSeasonLabel=L=>L.f==='eu'?`${L.y}-${String(L.y+1).slice(2)}`:String(L.y);
function fbFansMonth(p){const f=p.fc,fb=fbOf(p),W=FTW();const c=fb.cl&&W.C[fb.cl];let tgt=c?c.fa*1e6*({tit:.08,rot:.03,sup:.01,juv:.0015}[fb.role]||0)*Math.pow(clamp(fb.ovr/Math.max(40,c.r),.6,1.4),4):500;
  tgt+=fb.nt.caps*1.2e4+(fb.tro||[]).length*4e4;tgt*=f.img/70;const d=(tgt-fcFans(f))*.06;if(d>0){const sh=fb.call?[.2,.5,.3]:c&&FTW().L[c.l]&&FTW().L[c.l].rich>1?[.25,.4,.35]:[.5,.45,.05];f.fans.loc+=d*sh[0];f.fans.nac+=d*sh[1];f.fans.int+=d*sh[2];}}
function fbSeasonAwards(p,L){const fb=fbOf(p),W=FTW(),f=p.fc;fb.aw2=1;const S=fb.sy;if(!S.pj)return;const avg=S.rt/S.pj;const stars=Object.values(W.S).filter(s=>L.cl.includes(s.cl));
  const topG=stars.reduce((m,s)=>Math.max(m,s.gl),0);if(S.g>topG&&S.g>=8){f.aw.push({y:W.cy,t:`Campeón de goleo de la ${L.n}`});fb.tro.push({y:W.cy,t:`👟 Campeón de goleo (${S.g} goles)`});fcBump(p,.15);log(`👟 ¡Eres el campeón de goleo de la ${L.n} con ${S.g} goles!`,'big');}
  if(avg>=7.25&&S.pj>=L.nmd*.55&&chance(clamp((avg-7.1)*2.5,0,.9))){f.aw.push({y:W.cy,t:`Mejor jugador de la ${L.n}`});fb.tro.push({y:W.cy,t:'⭐ Mejor jugador de la liga'});fcBump(p,.2);log(`⭐ Te eligen mejor jugador de la ${L.n} (calificación media ${avg.toFixed(2)}).`,'big');}
  if(p.age<=21&&avg>=7&&S.pj>=15&&chance(.5)){fb.tro.push({y:W.cy,t:'🌟 Mejor jugador joven'});f.aw.push({y:W.cy,t:'Premio al mejor jugador joven'});}}
function fbTrophy(cid,name,nat){const p=P,fb=fbOf(p);if(!fb)return;const mine=nat?fb.call&&natOf(p).id===cid:fb.cl===cid&&fb.role!=='juv';if(!mine)return;fb.tro.push({y:FTW().cy,t:'🏆 '+name});p.fc.aw.push({y:FTW().cy,t:name});fcBump(p,nat?.5:.12);log(`🏆 ¡Campeón: ${name}!`,'big');}
function fbFinalStats(p,r,nat,label){const fb=fbOf(p);fb.lastFinal={label,r};}
/* ----- fichajes: ofertas, negociación, préstamos, renovaciones ----- */
function fbOffersGen(p,free){const fb=fbOf(p),W=FTW();if(p.age<16)return;const v=fbVal(p);const sy=fb.sy;const perf=sy.pj?clamp((sy.rt/sy.pj-6.4)*.5,0,.6):0;
  const home=natOf(p).id;const Cs=Object.values(W.C).filter(c=>c.l&&c.i!==fb.cl&&c.r>=fb.ovr-7&&c.r<=fb.ovr+4&&(free||c.b*1e6*.35>=v*.8)&&(c.c===home||fb.ovr>=70||chance(.15)));if(!Cs.length)return;const n=Math.min(3,Math.floor(R(0,1.4)+perf*3+(free?1.5:0)+(fb.req?1:0)));
  for(let i=0;i<n;i++){const c=pick(Cs);if(fb.off.some(o=>o.cl===c.i))continue;const fee=free||!fb.con?0:Math.round(v*R(.8,1.15)*(c.r>fbClubR(fb)+5?1.2:1)/1e5)*1e5;const sal=Math.round(fbSalFor(p,c)*R(.9,1.25)/1e3)*1e3;
    fb.off.push({cl:c.i,fee,sal,yrs:RI(2,5),role:fb.ovr>=c.r+2?'tit':fb.ovr>=c.r-3?'rot':'sup',dl:absDay()+45,ng:0});}
  // préstamo para jóvenes que no juegan
  if(p.age<=21&&fb.cl&&(fb.role==='sup'||fb.role==='juv')&&!fb.youth&&chance(.6)){const hm=natOf(p).id;let L=Object.values(W.C).filter(c=>c.l&&c.i!==fb.cl&&c.r<=fb.ovr+1&&c.r>=fb.ovr-8&&c.c===hm);if(!L.length)L=Object.values(W.C).filter(c=>c.l&&c.i!==fb.cl&&c.r<=fb.ovr+1&&c.r>=fb.ovr-8);if(L.length){const c=pick(L);fb.off.push({cl:c.i,fee:0,sal:fb.con?fb.con.sal:fbSalFor(p,c),yrs:1,role:'tit',dl:absDay()+45,ng:0,loan:1});}}
  if(fb.off.length)log(`📨 Tienes ${fb.off.length} oferta(s) de fichaje. Revísalas en ⭐ Tu carrera → Fichajes.`,'good');}
// tu club acepta vender si la oferta llega a la cláusula o a su valor (más fácil si pediste salir)
function fbClubOK(p,o){const fb=fbOf(p);if(!fb.con||o.loan||!o.fee)return {ok:true,t:''};if(o.fee>=fb.con.cl)return {ok:true,t:'La oferta paga tu cláusula de rescisión: tu club no puede negarse.'};
  const v=fbVal(p);const need=v*(fb.req?.75:.95)*(fb.role==='tit'?1.08:1);return o.fee>=need?{ok:true,t:'Tu club acepta la oferta.'}:{ok:false,t:`Tu club la rechaza: pide al menos ${fmt(toInt(Math.round(need/1e5)*1e5,'USD'))}.`};}
function fbNegoPct(p,i,ask){const fb=fbOf(p),o=fb.off[i];if(!o)return 0;const ag=(AGENT[p.fc.ag][2]-1)*.3;const form=fb.form*.04;let b=.42+ag+form-o.ng*.15;if(ask===2)b-=.22;if(ask===3)b+=.05;return clamp(Math.round(b*100),3,92);}
function fbNego(p,i,ask){const fb=fbOf(p),o=fb.off[i];if(!o)return {t:''};if(o.last)return {t:'Es su última oferta: tómala o déjala.'};const pct=fbNegoPct(p,i,ask);const roll=RI(1,100),ok=roll<=pct;o.ng++;let t;
  if(ok){if(ask===1)o.sal=Math.round(o.sal*1.15/1e3)*1e3;if(ask===2)o.sal=Math.round(o.sal*1.35/1e3)*1e3;if(ask===3)o.role='tit';t=`✅ Aceptan: ${ask<=2?`el sueldo sube a ${fmt(toInt(o.sal,'USD'))} al año`:'te prometen ser titular'}.`;}
  else if(chance(.4+o.ng*.1)){fb.off.splice(i,1);t='❌ El club se retira de la negociación.';}else{o.last=true;t='⚠️ No aceptan. Es su última oferta.';}return {t,roll,pct,ok};}
function fbAccept(p,i){const fb=fbOf(p),W=FTW(),o=fb.off[i];if(!o)return '';const ck=fbClubOK(p,o);if(!ck.ok)return ck.t;const old=fb.cl&&W.C[fb.cl];const c=W.C[o.cl];
  if(o.loan){const back={from:fb.cl,con:fb.con};fbSign(p,o.cl,0,o.sal,1,o.role);fb.loan=back;fb.con.y1=W.cy+1;log(`🔁 Te vas a préstamo a ${c.n} por un año.`,'good');return `Te vas cedido a ${c.n}: jugarás más minutos y volverás a ${old?old.n:'tu club'} en un año.`;}
  fbSign(p,o.cl,o.fee,o.sal,o.yrs,o.role);fb.req=0;fb.ren=0;if(o.fee)ftNews(`Fichaje: ${fullName(p)} deja ${old?old.n:'su club'} y firma con ${c.n} por ${fmtN(o.fee)}.`,[natOf(p).id,c.c],o.fee>4e7);
  return (o.fee?`${ck.t} Firmas con ${c.n} por ${o.yrs} años: ${fmt(toInt(o.sal,'USD'))} al año, traspaso de ${fmt(toInt(o.fee,'USD'))}. Rol prometido: ${FT_ROLE[o.role].toLowerCase()}.`:`${ck.t} Firmas con ${c.n} por ${o.yrs} años: ${fmt(toInt(o.sal,'USD'))} al año. Rol prometido: ${FT_ROLE[o.role].toLowerCase()}.`);}
function fbRequest(p){const fb=fbOf(p);if(!fb.con||fb.loan)return 'No puedes pedir salir ahora.';fb.req=1;fb.trust=clamp(fb.trust-15,0,100);for(const k in p.fc.fans)p.fc.fans[k]*=.97;fbOffersGen(p);
  return 'Le pides al club que te deje salir. La afición no lo toma bien y el entrenador te tiene menos confianza, pero tu club escuchará ofertas más bajas.';}
function fbRenewOffer(p){const fb=fbOf(p),W=FTW();fb.ren={sal:Math.round(Math.max(fb.con.sal*1.15,fbSalFor(p,W.C[fb.cl]))/1e3)*1e3,yrs:RI(2,4),dl:absDay()+60};log(`📝 ${W.C[fb.cl].n} te ofrece renovar: ${fmt(toInt(fb.ren.sal,'USD'))} al año por ${fb.ren.yrs} años.`,'good');}
function fbRenew(p,ok){const fb=fbOf(p),W=FTW();const r=fb.ren;if(!r)return '';fb.ren=null;if(!ok){fb.trust=clamp(fb.trust-5,0,100);return 'Rechazas la renovación. Si nadie te ficha, al terminar el contrato quedarás libre (y podrás irte sin costo de traspaso).';}
  fb.con.sal=r.sal;fb.con.y1=W.cy+r.yrs;fb.con.cl=Math.round(Math.max(fbVal(p)*2.5,r.sal*8)/1e5)*1e5;fb.trust=clamp(fb.trust+5,0,100);return `Renuevas hasta ${fb.con.y1}: ${fmt(toInt(r.sal,'USD'))} al año.`;}
function fbChangePos(p,pos){const fb=fbOf(p);if(p.age>21&&fb.cl&&!fb.youth)return 'A esta edad ya no puedes cambiar de posición.';fb.pos=pos;fb.ovr=fbOvr(fb);p.fc.sk=fb.ovr;return `Ahora juegas de ${FT_POS[pos][1].toLowerCase()}. Tu media en esa posición: ${fb.ovr}.`;}

/* ----- final en pantalla: momentos clave con decisión ----- */
const FB_MIN=[11,26,39,57,70,83];
function fbBigStart(p){const fb=fbOf(p);const B=fb.big;if(!B)return null;const rA=B.nat?ftNtR(B.a):ftR(B.a),rB=B.nat?ftNtR(B.b):ftR(B.b);
  fb.live={sa:0,sb:0,rA,rB,i:0,min:0,log:[],et:0,pen:null,end:null,yel:0,red:0,g:0,as:0,me:B.mine};fbBg(fb.live,FB_MIN[0]);fb.live.min=FB_MIN[0];return fb.live;}
function fbBg(S,dt){// goles del resto del equipo en un tramo de minutos (tu parte la decides tú)
  const d=clamp((S.rA-S.rB)/26,-.8,.8);const la=1.25*Math.exp(d)*dt/90*(S.me==='a'?.82:1)*(S.red&&S.me==='a'?.6:1),lb=1.05*Math.exp(-d)*dt/90*(S.me==='b'?.82:1)*(S.red&&S.me==='b'?.6:1);const x=ftPois(la),y=ftPois(lb);S.sa+=x;S.sb+=y;
  for(let i=0;i<x;i++)S.log.push((S.me==='a'?`⚽ Gol de tu equipo (minuto ${Math.min(S.min+RI(1,Math.max(1,dt)),S.et?120:90)}).`:`⚽ Gol del rival (minuto ${Math.min(S.min+RI(1,Math.max(1,dt)),S.et?120:90)}).`));for(let i=0;i<y;i++)S.log.push((S.me==='b'?`⚽ Gol de tu equipo (minuto ${Math.min(S.min+RI(1,Math.max(1,dt)),S.et?120:90)}).`:`⚽ Gol del rival (minuto ${Math.min(S.min+RI(1,Math.max(1,dt)),S.et?120:90)}).`));}
function fbMomentKind(fb){return fb.pos===0?'gk':fb.pos<=3?'def':'att';}
function fbMomentOpts(p){const fb=fbOf(p),S=fb.live;const oppR=S.me==='a'?S.rB:S.rA;const a=fb.at;const k=fbMomentKind(fb);
  if(k==='att')return [['tir','Tirar a puerta',clamp(.2+(a[3]-oppR*.85)/110,.08,.55)],['pas','Pasar al compañero desmarcado',clamp(.16+(a[2]-oppR*.8)/130,.08,.45)],['reg','Regatear y definir',clamp(.13+((a[1]+a[0])/2-oppR*.85)/100,.07,.5)]];
  if(k==='def')return [['ent','Entrar fuerte al balón',clamp(.5+(a[4]-oppR*.8)/80,.2,.88)],['tmp','Temporizar y cerrar el espacio',clamp(.62+(a[4]-oppR*.85)/110,.3,.9)],['fal','Falta táctica (tarjeta amarilla)',.97]];
  return [['ach','Achicar y salir al mano a mano',clamp(.46+(a[6]-oppR*.8)/85,.2,.85)],['esp','Esperar en la línea',clamp(.4+(a[6]-oppR*.8)/80,.15,.8)],['tir2','Lanzarte al primer palo',clamp(.35+(a[6]-oppR*.8)/70,.1,.75)]];}
function fbMomentText(p){const fb=fbOf(p),k=fbMomentKind(fb);const S=fb.live;const m=S.et?[95,108,117][S.i-6]||118:FB_MIN[S.i];
  return k==='att'?pick([`Minuto ${m}: recibes de espaldas en tres cuartos, giras y quedas de frente al área.`,`Minuto ${m}: contragolpe; conduces por la banda con un compañero entrando por el centro.`,`Minuto ${m}: el balón te cae en el borde del área tras un rebote.`])
   :k==='def'?pick([`Minuto ${m}: el delantero rival encara en velocidad y te queda solo a ti.`,`Minuto ${m}: pase filtrado a la espalda de tu línea; llegas a cerrar.`,`Minuto ${m}: contragolpe rival, tres contra dos.`])
   :pick([`Minuto ${m}: un delantero queda solo frente a ti.`,`Minuto ${m}: disparo potente desde fuera del área.`,`Minuto ${m}: centro rasante al área chica.`]);}
function fbMoment(p,ch){const fb=fbOf(p),S=fb.live;if(!S||S.end)return null;const opts=fbMomentOpts(p);const o=opts.find(x=>x[0]===ch)||opts[0];const k=fbMomentKind(fb);const roll=Math.random();const ok=roll<o[2];let t;const mine=S.me;
  const goalMe=()=>{if(mine==='a')S.sa++;else S.sb++;},goalOpp=()=>{if(mine==='a')S.sb++;else S.sa++;};
  if(k==='att'){if(ok){goalMe();if(ch==='pas'){S.as++;t='¡Asistencia perfecta! Tu compañero solo la empuja: ¡GOL!';}else{S.g++;t=ch==='reg'?'¡Dejas a dos rivales en el camino y la cruzas: GOL!':'¡Disparo colocado al ángulo: GOL!';}}
    else{t=ch==='reg'?'Te quitan el balón y viene el contragolpe...':ch==='tir'?'El portero rival vuela y la saca.':'El pase se queda corto y la defensa corta.';if(ch==='reg'&&chance(.28)){goalOpp();t+=' ¡y te anotan!';}}}
  else if(k==='def'){if(ok){t=ch==='fal'?'Cortas la jugada con falta: tarjeta amarilla.':ch==='ent'?'¡Barrida limpia! Recuperas el balón.':'Cierras el espacio y el atacante pierde el balón.';if(ch==='fal'){S.yel++;if(S.yel>=2){S.red=1;t+=' ¡Segunda amarilla: te expulsan! Tu equipo se queda con diez.';}}}
    else{const pen=ch==='ent'&&chance(.3);if(pen||chance(.45)){goalOpp();t=pen?'Llegas tarde y derribas al delantero en el área: penal... y gol del rival.':'Te gana la espalda y define: gol del rival.';}else t='Te superan, pero el disparo se va desviado.';}}
  else{if(ok)t='¡Atajadón! Sacas el balón con una mano.';else{if(chance(.75)){goalOpp();t='No llegas: gol del rival.';}else t='No llegas, pero el balón pega en el poste.';}}
  S.log.push(t);S.i++;fbAdvance(p);return {t,ok,pct:Math.round(o[2]*100)};}
function fbAdvance(p){const fb=fbOf(p),S=fb.live;const B=fb.big;const tot=S.et?9:6;const nextMin=S.et?[95,108,117,120][S.i-6]||120:S.i<6?FB_MIN[S.i]:90;fbBg(S,Math.max(0,nextMin-S.min));S.min=nextMin;if(S.red&&S.i<(S.et?9:6)){S.i=S.et?9:6;fbBg(S,(S.et?120:90)-S.min);S.min=S.et?120:90;}
  if(S.i>=tot||S.min>=(S.et?120:90)){if(S.sa!==S.sb){fbBigEnd(p);return;}if(!S.et){S.et=1;S.min=90;S.i=6;S.log.push('Empate al final de los 90 minutos: ¡tiempo extra!');fbBg(S,5);S.min=95;if(S.red){fbBg(S,25);S.min=120;S.i=9;if(S.sa!==S.sb){fbBigEnd(p);return;}S.pen={a:0,b:0};S.log.push('Empate tras el tiempo extra: ¡penales!');}return;}S.pen={a:0,b:0,k:0,mine:null};S.log.push('Empate tras el tiempo extra: ¡penales!');}}
function fbPen(p,side){const fb=fbOf(p),S=fb.live;const P2=S.pen;if(!P2||S.end)return null;const gk=fb.pos===0;let t;
  // tu tiro (o tu atajada si eres portero), luego el resto de la tanda
  const dive=()=>{const r=Math.random();return r<.45?'izq':r<.55?'cen':'der';};
  if(!gk){const d=dive();const sc=d!==side?chance(.86+fb.at[3]/1000):chance(.35);if(S.me==='a')P2.a+=sc?1:0;else P2.b+=sc?1:0;t=sc?(side==='izq'?'Pateas al lado izquierdo: ¡GOL!':side==='der'?'Pateas al lado derecho: ¡GOL!':'Pateas al centro: ¡GOL!'):(d==='izq'?'El portero adivina (izquierda): ¡te lo ataja!':d==='der'?'El portero adivina (derecha): ¡te lo ataja!':'El portero adivina (centro): ¡te lo ataja!');}
  else{const r=Math.random();const shot=r<.42?'izq':r<.58?'cen':'der';const sv=shot===side&&chance(.6+fb.at[6]/400);if(S.me==='a')P2.b+=sv?0:1;else P2.a+=sv?0:1;t=sv?(side==='izq'?'¡Te lanzas a la izquierda y atajas el penal!':side==='der'?'¡Te lanzas a la derecha y atajas el penal!':'¡Te lanzas a la mitad y atajas el penal!'):(shot==='izq'?'El tiro va a la izquierda: gol.':shot==='der'?'El tiro va a la derecha: gol.':'El tiro va al centro: gol.');}
  // resto de los cobros
  for(let i=0;i<4;i++){P2.a+=chance(.76)?1:0;P2.b+=chance(.76)?1:0;}if(gk){if(S.me==='a')P2.a+=chance(.76)?1:0;else P2.b+=chance(.76)?1:0;}else{if(S.me==='a')P2.b+=chance(.76)?1:0;else P2.a+=chance(.76)?1:0;}
  while(P2.a===P2.b){P2.a+=chance(.74)?1:0;P2.b+=chance(.74)?1:0;}S.log.push(t,`Tanda de penales: ${P2.a}-${P2.b}.`);fbBigEnd(p);return {t};}
function fbBigEnd(p){const fb=fbOf(p),S=fb.live,B=fb.big;let w,l,tg='';if(S.pen){w=S.pen.a>S.pen.b?B.a:B.b;tg=` (${Math.max(S.pen.a,S.pen.b)}-${Math.min(S.pen.a,S.pen.b)} pen.)`;}else w=S.sa>S.sb?B.a:B.b;if(S.et&&!S.pen)tg=' (t. e.)';l=w===B.a?B.b:B.a;
  const r={w,l,s:`${Math.max(S.sa,S.sb)}-${Math.min(S.sa,S.sb)}`,t:tg};S.end=r;const myWin=(w===B.a&&B.mine==='a')||(w===B.b&&B.mine==='b');const rt=clamp(6.5+S.g*1+S.as*.6+(myWin?.5:-.4)-(S.red?1.5:0),3,10);
  if(B.nat){fb.nt.caps++;fb.nt.g+=S.g;}else{fb.sy.pj++;fb.sy.min+=S.et?120:90;fb.sy.rt+=rt;fb.sy.g+=S.g;fb.sy.a+=S.as;}
  fb.lastFinal={label:B.label,r,myWin};ftApplyFinal(B.comp,r);fb.big=null;fcAddFans(p,myWin?80:40,myWin?2:.5);return r;}
function fbAutoBig(p){const fb=fbOf(p);if(!fb||!fb.big)return;const B=fb.big;const r=B.nat?ftKON(B.a,B.b,(FTW().K[B.comp]||{}).host):ftKO(B.a,B.b,null,null,B.neu);fb.big=null;fb.live=null;ftApplyFinal(B.comp,r);}

/* ----- integración ----- */
{const _fs=fcStart;fcStart=function(p,k){const r=_fs(p,k);if(k==='futbol'){const fb=fbInit(p);const c=fb.cl&&FTW().C[fb.cl];return r+(` Juegas de ${FT_POS[fb.pos][1].toLowerCase()} (media ${fb.ovr}).`+(c?(fb.role==='juv'?` Entras a las fuerzas básicas de ${c.n}.`:` Firmas con ${c.n}.`):' Aún no tienes club: pide una prueba.'));}return r;};}
fcSeasonMonth=function(p){};fcFootballYear=function(p){};
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(G&&P){const W=ftEnsure();if(W){const fb=fbOf(P);W.tk=fb?fb.cl:null;W.tn=fb&&fb.call?natOf(P).id:null;ftMonthWorld();if(fb&&P.alive){fbMonthP(P);const ff=typeof FF_ON!=='undefined'&&FF_ON;if(fb.big&&(CB_AUTO||ff))fbAutoBig(P);}}}}catch(e){if(typeof console!=='undefined')console.error('fútbol mes',e);}};}
{const _ca=clockAdvance;clockAdvance=function(n,opt){const fb=fbOf(P);if(fb&&fb.big){if(CB_AUTO||(typeof FF_ON!=='undefined'&&FF_ON))fbAutoBig(P);else return {done:0,rep:[],stop:'final',months:0};}
  const ff=typeof FF_ON!=='undefined'&&FF_ON;
  // el reloj avanza mes a mes y se detiene si llega una oferta de fichaje o de renovación (para que no se venza sin verla)
  if(fb&&!CB_AUTO&&!ff&&n>7){const o0=fb.off.length,r0=fb.ren?1:0;let done=0,rep=[],months=0;while(done<n){const m=monthOfDay(G.day);const k=Math.max(1,Math.min(n-done,MCUM[m+1]-G.day));const r=_ca(k,opt);done+=r.done;rep.push(...r.rep);months+=r.months;
      const f2=fbOf(P);if(r.stop||!f2)return {done,rep,stop:r.stop,months};if(f2.big)return {done,rep,stop:'final',months};if(f2.off.length>o0||(f2.ren?1:0)>r0){FB_NOTE=1;return {done,rep,stop:'oferta',months};}if(!r.done||!P.alive)break;}return {done,rep,stop:null,months};}
  const r=_ca(n,opt);const fb2=fbOf(P);if(fb2&&fb2.big&&!r.stop)r.stop='final';return r;};}
var FB_NOTE=0;
ACT_COST.unshift([/^⭐ Prueba/,10],[/^⭐ Hablar con el entrenador/,2],[/^⭐ Pedir salir/,3]);
// trofeos: avisa al jugador si su club o su selección gana
{const a=ftCupApply;ftCupApply=function(k,r){a(k,r);const K=FTW().K[k];if(K)fbTrophy(r.w,K.n);};}
{const a=ftContApply;ftContApply=function(k,r){a(k,r);const K=FTW().K[k];if(K)fbTrophy(r.w,K.n);};}
{const a=ftCWCApply;ftCWCApply=function(k,r){a(k,r);fbTrophy(r.w,'Mundial de Clubes');};}
{const a=ftNatApply;ftNatApply=function(k,r){a(k,r);const K=FTW().K[k];if(K)fbTrophy(r.w,K.n==='la Copa del Mundo'?'Copa del Mundo':K.n,true);};}
{const a=ftLigApply;ftLigApply=function(lid,r){a(lid,r);const L=FTW().L[lid];if(L)fbTrophy(r.w,`${L.n} (${L.tor})`);};}
{const a=ftSeasonEnd;ftSeasonEnd=function(L,done){const ch=!done&&ftTable(L)[0];a(L,done);if(ch)fbTrophy(ch,L.n);};}

/* ----- diálogos con causa del fútbol ----- */
D_({id:'fb_banca',cat:'deporte',title:'Sin minutos',cool:240,npc:p=>{const fb=fbOf(p);return fb&&fb.cl?npc(p,'entrenador'):null;},
 w:p=>{const fb=fbOf(p);return fb&&fb.cl&&!fb.youth&&fb.role==='sup'&&p.age>=18?1.3:0;},
 N:{a:{t:(p,n,c,x)=>`Llevas semanas en la banca de ${FTW().C[fbOf(p).cl].n}. ${x.name}, el entrenador, pasa a tu lado sin mirarte. Tu media es ${fbOf(p).ovr} y la del equipo ronda ${Math.round(fbClubR(fbOf(p)))}.`,
  o:[{t:'Entrenar el doble y esperar tu oportunidad',ok:{r:'Te quedas después de cada entrenamiento. El cuerpo técnico lo nota.',go:p=>{const fb=fbOf(p);fb.trust=clamp(fb.trust+8,0,100);}}},
   {t:'Pedirle explicaciones',k:['carisma',52],ok:{r:'Te explica qué necesita de ti y te promete minutos.',go:p=>{const fb=fbOf(p);fb.trust=clamp(fb.trust+12,0,100);}},ko:{r:'Lo toma como una falta de respeto.',go:p=>{const fb=fbOf(p);fb.trust=clamp(fb.trust-10,0,100);}}},
   {t:'Pedirle a tu representante que busque un préstamo',ok:{r:'Tu representante empieza a mover tu nombre con otros clubes.',go:p=>{const fb=fbOf(p);fb.req=1;fbOffersGen(p);}}}]}}});
D_({id:'fb_fiesta',cat:'deporte',title:'La noche antes del partido',cool:300,npc:p=>fbOf(p)?npc(p,'colega'):null,
 w:p=>{const fb=fbOf(p);return fb&&fb.cl&&!fb.youth&&p.age>=18&&p.age<=30?.7:0;},
 N:{a:{t:(p,n,c,x)=>`${x.name}, compañero del equipo, te escribe: «Hay fiesta en un club exclusivo. Mañana jugamos, pero es temprano... ¿vienes?»`,
  o:[{t:'Quedarte a descansar',ok:{r:'Duermes ocho horas. Al día siguiente te sientes ligero.',go:p=>{const fb=fbOf(p);fb.form=clamp(fb.form+.5,-3,3);},fx:{rel:-2}}},
   {t:'Ir un rato y regresar temprano',k:['salud',45],ok:{r:'Te diviertes y llegas a dormir a buena hora.',fx:{rel:5,s:{felicidad:3}}},ko:{r:'Se te pasa la hora. Juegas mal y el entrenador lo nota.',go:p=>{const fb=fbOf(p);fb.form=clamp(fb.form-1,-3,3);fb.trust=clamp(fb.trust-6,0,100);}}},
   {t:'Ir hasta que cierren',ok:{r:'Alguien sube fotos tuyas a las 4 de la mañana.',go:p=>{const fb=fbOf(p);fb.trust=clamp(fb.trust-12,0,100);if(fcFama(p.fc)>=30)fcScandal(p,'unas fotos de fiesta la víspera de un partido');},fx:{rel:6,s:{felicidad:4}}}}]}}});
D_({id:'fb_capitan',cat:'deporte',title:'El gafete de capitán',cool:900,npc:p=>fbOf(p)?npc(p,'entrenador'):null,
 w:p=>{const fb=fbOf(p);return fb&&fb.cl&&fb.role==='tit'&&p.age>=25&&fb.trust>70&&!fb.cap?1:0;},
 N:{a:{t:(p,n,c,x)=>`El entrenador te llama a su oficina: «Quiero que seas el capitán de ${FTW().C[fbOf(p).cl].n}. El vestidor te respeta.»`,
  o:[{t:'Aceptar con orgullo',ok:{r:'Te pones el gafete. Ahora eres la voz del equipo dentro y fuera de la cancha.',go:p=>{const fb=fbOf(p);fb.cap=1;fb.trust=clamp(fb.trust+10,0,100);p.fc.img=clamp(p.fc.img+5,0,100);},fx:{s:{influencia:4}}}},
   {t:'Rechazar: prefieres concentrarte en tu juego',ok:{r:'El entrenador respeta tu decisión.'}}]}}});
D_({id:'fb_apuestas',cat:'deporte',title:'Un mensaje desconocido',cool:900,npc:p=>fbOf(p)?npc(p,'contacto'):null,
 w:p=>{const fb=fbOf(p);return fb&&fb.cl&&!fb.youth&&fbClubR(fb)<66?.6:0;},
 N:{a:{t:(p,n,c,x)=>`Un número desconocido te escribe: «Te pagamos ${fmt(toInt(30000,'USD'))} si te sacan una tarjeta amarilla antes del minuto 20 el sábado. Nadie lo va a notar.» Así empiezan muchos casos de amaño de partidos.`,
  o:[{t:'Ignorar y bloquear el número',ok:{r:'Bloqueas el número. Nada más pasa.'}},{t:'Reportarlo a la federación',ok:{r:'La unidad de integridad abre una investigación y te agradece. Tu nombre sale limpio en la prensa.',go:p=>{p.fc.img=clamp(p.fc.img+6,0,100);}}},
   {t:'Aceptar',ok:{r:'Te sacan la amarilla y recibes el dinero. Pero las casas de apuestas detectan movimientos raros...',go:p=>{p.dinero+=toInt(30000,'USD');if(chance(.35)){p.fc.inj=Math.max(p.fc.inj||0,10);fcScandal(p,'una investigación por amaño de partidos (suspensión de 10 meses)');}}}}]}}});
