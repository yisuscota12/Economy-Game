/* ===== v1.6d: el mundo de las demás carreras de fama (música, actuación, creador de contenido, modelaje, comedia, escritura, cocina y DJ) =====
   Un mundo por carrera (se crea al empezarla y se simula 24 meses hacia atrás): colegas y rivales con nombre, país, estilo, nivel, público y compañía;
   compañías ficticias por tamaño; obras con ciclo de vida que compiten en una lista mensual; ranking; premios anuales con ceremonia.
   Carrera del jugador: 5 atributos, proyectos por sesiones, lanzamiento con promoción, crítica y público, regalías con anticipo recuperable,
   contratos con negociación, presentaciones y giras con momentos de decisión, relaciones con colegas, estadísticas y diálogos con causa.
   Reloj propio (G.fm.t, G.fm.cy, G.fm.cm): no depende de absDay(), que se congela en el avance rápido. */
const fmOf=p=>p&&p.fc&&FM[p.fc.k]?(p.fc.fm||null):null;
function fmG(){if(!G.fm)G.fm={v:1,t:0,cy:G.year,cm:typeof monthOfDay==='function'?monthOfDay(G.day||0):0,W:{}};return G.fm;}
const fmW=k=>G&&G.fm?G.fm.W[k]:null;
const fmAuto=()=>CB_AUTO||(typeof FF_ON!=='undefined'&&FF_ON);
const fmFansFor=sk=>Math.pow(10,2.6+clamp((sk-30)/65,0,1)*5.4); // público que corresponde a un nivel: 30 → 400; 95 → 100 millones
const fmOvr=(fm,D)=>+D.w.reduce((s,w,i)=>s+w*fm.at[i],0).toFixed(1);
const fmQf=q=>Math.exp((q-60)/30);
function fmTitle(D){const t=pick(D.ti).replace('{A2}',pick(FM_A).toLowerCase()).replace('{A}',pick(FM_A)).replace('{B}',pick(FM_B)).replace(/ y (h?i)/i,' e $1');return t[0].toUpperCase()+t.slice(1);}
function fmNews(W,t,nids,big){W.ev.push({y:G.fm.cy,m:G.fm.cm,t});if(W.ev.length>40)W.ev.shift();if(W.quiet||typeof archiveNews!=='function'||!P)return;
  const cur=P.fc&&P.fc.k===W.k;if(!cur)return;const me=natOf(P).id;if(nids&&nids.includes(me))archiveNews(t,'news','nac');else if(big)archiveNews(t,'news','int');}
const fmAN=(W,id)=>id==='me'?(P?fullName(P):'Tú'):(W.A[id]?W.A[id].n:'—');

/* ----- creación del mundo ----- */
function fmNewArtist(W,D,nid,sk,young){const cu=cultOf(nid);const sx=chance(W.k==='modelo'?.72:.45)?'F':'M';const g=young?RI(D.age[0],D.age[0]+6):RI(D.age[0]+4,D.age[2]+8);const id='a'+(W.nx++);
  const a={i:id,n:rndFirst(sx,cu)+' '+rndSur(cu),c:nid,x:sx,st:RI(0,D.st.length-1),sk:+sk.toFixed(1),pt:+clamp(sk+(young?R(5,24):R(0,4)),sk,97).toFixed(1),g,F:Math.round(fmFansFor(sk)*R(.5,1.6)),co:null,
    y0:G.fm.cy-(young?RI(0,2):RI(4,Math.max(5,g-D.age[0]))),h:0,n1:0,aw:0,hot:0};
  const t=clamp((sk<50?0:sk<65?1:sk<80?2:3)+(chance(.2)?-1:0),0,3);const Cs=Object.values(W.C).filter(c=>c.t===t);if(Cs.length&&chance(.85))a.co=pick(Cs).i;W.A[id]=a;return a;}
function fmNewWorld(k,home){const D=FM[k],M=fmG();const W={k,nx:1,A:{},C:{},K:[],top:[],rk:[],hist:{aw:[],rk:[]},ev:[],quiet:1,home,n1:null};M.W[k]=W;
  const big=['USA','GBR','FRA','JPN','DEU','ESP','KOR'].filter(n=>G.nations[n]);
  D.co[1].forEach((L,t)=>L.forEach(nm=>{const id='c'+(W.nx++);W.C[id]={i:id,n:nm,t,c:t<2&&G.nations[home]?home:(pick(big)||home),r:Math.round(38+t*16+R(-5,5))};}));
  const nat=Object.assign({},D.nat);for(const n in nat)if(!G.nations[n])delete nat[n];const N=48;
  for(let i=0;i<N;i++)fmNewArtist(W,D,wpick(nat),clamp(42+54*Math.pow(1-i/N,1.2)+R(-3,3),30,96));
  const w=N0[home]||{};const cap=clamp(58+Math.log10(Math.max(1,(w.pop||1e6)/1e6))*9,55,88);for(let i=0;i<12;i++)fmNewArtist(W,D,home,clamp(30+(cap-30)*Math.pow(1-i/12,1.3)+R(-3,3),28,92),i>7);
  // historia previa: 24 meses de lanzamientos, listas y una entrega de premios
  let y=M.cy,m=M.cm;for(let i=0;i<24;i++){m--;if(m<0){m=11;y--;}}for(let i=0;i<24;i++){fmMonthWorld(W,y,m,null);m++;if(m>11){m=0;y++;}}
  W.quiet=0;return W;}
function fmWorldEnsure(k,home){fmG();return G.fm.W[k]||fmNewWorld(k,home);}

/* ----- el mes del mundo: lanzamientos, lista, público, ranking, premios y fin de año ----- */
function fmBase(D,F,tier,sz,q){return (Math.pow(Math.max(1,F),.85)*(D.aud?1.2:1)+(tier==null?300:FM_REACH[tier]*(D.aud?1.5:1)))*sz*fmQf(q);}
function fmMonthWorld(W,y,m,p){const D=FM[W.k];const fm=p?fmOf(p):null;
  for(const id in W.A){const a=W.A[id];if(chance(D.rel*(a.sk>72?1.25:1))){const ty=+wpick({0:.6,1:.25,2:.15});const q=clamp(a.sk*R(.62,1.2)+gz()*3,5,99);const c=a.co&&W.C[a.co];
      W.K.push({i:'w'+(W.nx++),a:id,t:fmTitle(D),ty,q:Math.round(q),m:0,b:Math.round(fmBase(D,a.F,c?c.t:null,D.wk[ty][4],q)*R(.6,1.5)*(chance(.05)?2.5:1)*(c?1+c.t*.15:1)),v:0,tot:0,pk:99,ps:0,y});}
    a.hot=(a.hot||0)*.9;const tgt=fmFansFor(a.sk)*(1+a.hot);a.F=Math.max(50,Math.round(a.F+(tgt-a.F)*.045+a.F*gz()*.01));}
  fmChart(W,p,D);fmRank(W,p);
  if(m===D.aw[1])fmAwards(W,y,p);
  if(m===11)fmYearWorld(W,y,p);}
function fmChart(W,p,D){const fm=p&&p.fc&&p.fc.k===W.k?fmOf(p):null;const all=W.K.concat(fm?fm.cat.filter(w=>w.m<=30):[]);
  for(const w of all){w.v=Math.round(w.b*D.unit[1]*Math.pow(D.wk[w.ty][5],w.m)*(w.m===0?.7:1));w.tot+=w.v;}
  all.sort((a,b)=>b.v-a.v);all.forEach((w,i)=>{w.pp=w.ps||0;w.ps=i+1;if(i+1<(w.pk||99))w.pk=i+1;
    if(i<10&&!w.hit){w.hit=1;const a=W.A[w.a];if(a){a.h++;a.hot=(a.hot||0)+.3;}}});
  W.top=all.slice(0,20).map(w=>[w.t,fmAN(W,w.a),w.a,w.v,w.pp,w.m,w.ty,w.i]);
  const t1=all[0];if(t1&&t1.i!==W.n1){W.n1=t1.i;if(t1.a==='me'){if(!t1.n1){t1.n1=1;fm.st8.n1++;fcBump(p,.12);const s=`¡«${t1.t}», de ${fullName(p)}, llega al número 1 de ${D.ch}!`;log('🥇 '+s,'big');fmNews(W,s,[natOf(p).id],fcFama(p.fc)>=40);}}
    else{const a=W.A[t1.a];if(a){a.n1++;fmNews(W,`«${t1.t}», de ${a.n} (${G.nations[a.c]?G.nations[a.c].name:a.c}), es el nuevo número 1 de ${D.ch}.`,[a.c],a.F>3e7&&chance(.3));}}}
  all.forEach(w=>w.m++);W.K=W.K.filter(w=>w.m<=13||w.ps<=30);}
function fmRank(W,p){const cur=p&&p.fc&&p.fc.k===W.k&&fmOf(p);const L=Object.values(W.A).map(a=>[a.i,a.F]);if(cur)L.push(['me',fcFans(p.fc)]);L.sort((a,b)=>b[1]-a[1]);W.rk=L.slice(0,30).map(x=>x[0]);
  if(cur){const i=L.findIndex(x=>x[0]==='me');const last=L[L.length-1];let r=i+1;if(i===L.length-1){const prev=L[L.length-2]||last;r=Math.min(9999,L.length+Math.round(60*Math.log10(Math.max(1,prev[1]/Math.max(1,last[1])))));}
    const fm=cur;fm.rk=r;if(r<fm.st8.bestRk)fm.st8.bestRk=r;}}
function fmYearWorld(W,y,p){const D=FM[W.k];for(const id in W.A){const a=W.A[id];a.g++;if(a.g<D.age[2]-2)a.sk+=(a.pt-a.sk)*.3;else if(a.g>D.age[2])a.sk-=R(.3,1.6);a.sk=+clamp(a.sk+gz()*.6,25,97).toFixed(1);
    if(a.g>=D.age[1]||(a.g>D.age[2]+5&&chance(.12))||(a.sk<34&&chance(.3))){if(a.F>2e7)fmNews(W,`${a.n} anuncia su retiro tras una carrera con ${a.aw} premio(s) y ${a.n1} número(s) 1.`,[a.c],a.F>6e7);
      const nid=a.c;delete W.A[id];W.K=W.K.filter(w=>w.a!==id);const pt=clamp(42+54*Math.pow(Math.random(),1.2)+R(-3,3),34,96);const na=fmNewArtist(W,D,nid,Math.max(28,pt-R(8,25)),true);na.pt=+pt.toFixed(1);}}
  W.hist.rk.push({y,t:W.rk.slice(0,5).map(id=>fmAN(W,id))});if(W.hist.rk.length>20)W.hist.rk.shift();}
/* premios: cinco nominados por categoría (obras de los últimos 12 meses, revelación y figura del año) */
function fmAwards(W,y,p){const D=FM[W.k];const cur=p&&p.fc&&p.fc.k===W.k&&fmOf(p);const fm=cur||null;const cats=[];
  for(const [cn,sel] of D.aw[2]){let C=[];
    if(typeof sel==='number'){W.K.filter(w=>w.ty===sel&&w.m<=12).forEach(w=>C.push([fmAN(W,w.a),w.t,0,w.q+Math.log10(w.tot+10)*3+gz()*3,w.a]));
      if(fm)fm.cat.filter(w=>w.ty===sel&&w.m<=12&&w.pk<=40).forEach(w=>C.push([fullName(p),w.t,1,w.q+Math.log10(w.tot+10)*3+gz()*3,'me']));}
    else if(sel==='new'){Object.values(W.A).filter(a=>y-a.y0<=3).forEach(a=>C.push([a.n,'',0,a.sk+Math.log10(a.F)*4+gz()*3,a.i]));if(fm&&y-p.fc.y0<=3&&fm.cat.length&&fcFama(p.fc)>=24)C.push([fullName(p),'',1,p.fc.sk+Math.log10(Math.max(10,fcFans(p.fc)))*4+gz()*3,'me']);}
    else{Object.values(W.A).forEach(a=>C.push([a.n,'',0,Math.log10(a.F)*10+a.hot*8+a.sk*.3+gz()*2,a.i]));if(fm&&fm.cat.some(w=>w.m<=12)&&fcFama(p.fc)>=45)C.push([fullName(p),'',1,Math.log10(Math.max(10,fcFans(p.fc)))*10+fm.cat.filter(w=>w.m<=12&&w.hit).length*2.5+p.fc.sk*.3+gz()*2,'me']);}
    C.sort((a,b)=>b[3]-a[3]);const noms=[],seen={};for(const c of C){if(seen[c[4]]&&typeof sel!=='number')continue;if(typeof sel==='number'&&(seen[c[4]]||0)>=2)continue;seen[c[4]]=(seen[c[4]]||0)+1;noms.push(c);if(noms.length>=5)break;}
    if(!noms.length)continue;let wi=0,best=-1e9;noms.forEach((c,i)=>{const s=c[3]+gz()*4;if(s>best){best=s;wi=i;}});cats.push({n:cn,noms:noms.map(c=>[c[0],c[1],c[2]]),w:wi,ids:noms.map(c=>c[4])});}
  const rec={y,c:cats.map(c=>[c.n,c.noms[c.w][0],c.noms[c.w][1],c.noms[c.w][2]])};W.hist.aw.push(rec);if(W.hist.aw.length>15)W.hist.aw.shift();
  cats.forEach(c=>{const a=W.A[c.ids[c.w]];if(a){a.aw++;a.hot=(a.hot||0)+.25;}});const main=cats[cats.length-1];
  if(main)fmNews(W,`${D.aw[0]} (${y}): ${main.noms[main.w][0]} gana «${main.n}».`,[],true);
  if(!fm)return;const mine=cats.filter(c=>c.noms.some(n=>n[2]));if(D.stars)fmStars(p,W);if(!mine.length)return;fm.st8.nom+=mine.length;
  const gala={y,cats:cats.map(c=>({n:c.n,noms:c.noms,w:c.w})),st:0};
  if(fmAuto()||W.quiet){fm.gala=gala;fmGalaEnd(p,0,0);}else{fm.gala=gala;log(`🎟️ Estás nominado en ${mine.length} categoría(s) de ${D.aw[0]}. Esta noche es la ceremonia.`,'big');}}
function fmStars(p,W){const fm=fmOf(p);const best=fm.cat.filter(w=>w.ty===0&&w.m<=14).reduce((m,w)=>Math.max(m,w.q),0);const sc=best*.8+(fm.svc||50)*.2;const s=sc>=86?3:sc>=77?2:sc>=67?1:0;
  if(s!==fm.stars){const up=s>fm.stars;fm.stars=s;const t=s?(up?(s===1?`La Guía Gourmet otorga ${'⭐'.repeat(s)} estrella a la cocina de ${fullName(p)}.`:`La Guía Gourmet otorga ${'⭐'.repeat(s)} estrellas a la cocina de ${fullName(p)}.`):(s===1?`La Guía Gourmet reduce a ${'⭐'.repeat(s)} estrella a la cocina de ${fullName(p)}.`:`La Guía Gourmet reduce a ${'⭐'.repeat(s)} estrellas a la cocina de ${fullName(p)}.`)):`La Guía Gourmet retira las estrellas a la cocina de ${fullName(p)}.`;
    log((up?'⭐ ':'')+t,up?'big':'bad');fmNews(W,t,[natOf(p).id],s>=2);if(up){p.fc.aw.push({y:G.fm.cy,t:(s===1?`${s} estrella de la Guía Gourmet`:`${s} estrellas de la Guía Gourmet`)});fcBump(p,.2*s);}}}
function fmGalaEnd(p,carpet,speech){const fm=fmOf(p),f=p.fc,D=FM[f.k];const g=fm.gala;if(!g)return null;const out=[];let wins=0;
  if(carpet===1){fcAddFans(p,70,.6);if(chance(.12)){f.img=clamp(f.img-5,0,100);out.push('Tu atuendo divide opiniones: mala prensa al día siguiente.');}else out.push('Tu llegada es de lo más comentado de la alfombra.');}else if(carpet===0){f.img=clamp(f.img+2,0,100);}
  g.cats.forEach(c=>{const me=c.noms[c.w][2];if(me){wins++;f.aw.push({y:g.y,t:`${D.aw[0]}: ${c.n}`});fcBump(p,c===g.cats[g.cats.length-1]?.4:.25);}});
  if(wins){if(speech===1){if(chance(.3)){f.img=clamp(f.img-8,0,100);out.push('Tu discurso político incomoda a patrocinadores y a parte del público.');}else{fcBump(p,.08);out.push('Tu discurso sobre una causa se vuelve tendencia.');}}
    else if(speech===2){if(RI(1,100)<=chkPct(p,'carisma',50)){fcBump(p,.05);out.push('Tu discurso con humor es el momento más compartido de la noche.');}else out.push('Tu chiste no cae bien en la sala, pero nadie lo recordará mañana.');}
    else{f.img=clamp(f.img+4,0,100);out.push('Agradeces a tu equipo: un discurso breve y elegante.');}
    const s=wins>1?`${fullName(p)} gana ${wins} ${D.aw[0]} (varias categorías).`:`${fullName(p)} gana ${wins} ${D.aw[0]}.`;log('🏆 ¡'+s.replace(/\.$/,'')+'!','big');if(fcFama(f)>=35)fmNews(fmW(f.k),s,[natOf(p).id],fcFama(f)>=55);}
  else{f.img=clamp(f.img+1,0,100);log(`Te vas de ${D.aw[0]} sin premio, pero la nominación ya suma prestigio.`,'good');fcAddFans(p,55,.3);}
  fm.lastGala={y:g.y,wins,out,cats:g.cats};fm.gala=null;return fm.lastGala;}

/* ===================== LA CARRERA DEL JUGADOR ===================== */
function fmInit(p){const f=p.fc,D=FM[f.k];const at=D.w.map(()=>clamp(Math.round(f.sk+R(-5,5)),5,99));
  f.fm={at,st:RI(0,D.st.length-1),co:null,off:[],proj:null,cat:[],tour:null,gig:null,gala:null,rel:{},st8:{u:0,rev:0,sh:0,att:0,n1:0,t10:0,nom:0,bestRk:9999,w:0},fh:[],ih:[],seq:1,stars:0,rk:9999,svc:50};
  const fm=f.fm;f.sk=fmOvr(fm,D);const W=fmWorldEnsure(f.k,natOf(p).id);
  // partidas de la v1.6: las obras y el contrato anteriores pasan al sistema nuevo
  (f.works||[]).slice(-12).forEach(w=>{const ty=/álbum|película|libro|especial|EP|gran producción|programa|pasarela/i.test(w.t)?1:0;fm.cat.push({i:'m'+(fm.seq++),a:'me',t:fmTitle(D),ty,q:w.q,m:31,b:0,v:0,tot:0,pk:99,ps:0,y:w.y,cr:w.q,pu:w.q,rv:0,h:[],sh:.7,old:1});});f.works=[];
  if(f.ct){const t=clamp(f.ct.l||0,0,2);const c=Object.values(W.C).find(c=>c.t===t)||Object.values(W.C)[0];fm.co={id:c.i,roy:f.ct.roy||.18,yrs:f.ct.yrs||2,m0:G.fm.t-12*clamp(G.year-(f.ct.y||G.year),0,5),rec:0,del:0,ctl:0};f.ct=null;}
  f.off=[];fmRank(W,p);return fm;}
function fmCo(p){const fm=fmOf(p);const W=fmW(p.fc.k);return fm&&fm.co&&W?W.C[fm.co.id]:null;}
/* ----- entrenamiento por atributo ----- */
function fmTrain(p,i){const f=p.fc,fm=fmOf(p),D=FM[f.k];if(f.trY!==G.year){f.trY=G.year;f.trN=0;}const o=fmOvr(fm,D);const lvl=o<45?1.4:o<60?1:o<72?.6:o<82?.34:.17;
  const base=.8*(.55+.3*COACH[f.coach][2])*f.tal*(1+p.s[FC[f.k].at]/130)*lvl/(1+.12*f.trN++);
  for(let k=0;k<fm.at.length;k++){const m=(k===i?2.8:.6)*clamp((100-fm.at[k])/40,.08,1);fm.at[k]=clamp(fm.at[k]+base*m,0,99);}f.sk=fmOvr(fm,D);
  return `Practicas ${D.at[i].toLowerCase()} (${COACH[f.coach][0].toLowerCase()}): ${D.at[i]} ${Math.round(fm.at[i])} · nivel ${f.sk.toFixed(1)}.`;}
/* ----- proyectos: empezar (o audicionar), sesiones de trabajo y lanzamiento ----- */
function fmMaxTier(p){const s=fcFama(p.fc);return (s<22?0:s<40?1:s<58?2:3);}
function fmAudPct(p,wi){const f=p.fc,fm=fmOf(p),D=FM[f.k];const sz=D.wk[wi][4];return clamp(Math.round((.24+f.sk/170+fcFama(f)/230+(AGENT[f.ag][2]-1)*.25-sz*.045+(fm.co?.15:0))*100),4,93);}
function fmBudOK(p,wi,bl){const fm=fmOf(p),D=FM[p.fc.k];const c=fmCo(p);const cost=toInt(D.wk[wi][3][bl],'USD');if(c)return bl<=Math.max(1,c.t)?{ok:true,by:'co',cost}:{ok:false,t:`${c.n} no financia producciones de ese tamaño`};return p.dinero>=cost?{ok:true,by:'me',cost}:{ok:false,t:`necesitas ${fmt(cost)}`};}
function fmProjStart(p,wi,bl,feat){const f=p.fc,fm=fmOf(p),D=FM[f.k],W=fmW(f.k);if(fm.proj)return {t:'Ya tienes un proyecto en marcha: termínalo o cancélalo.'};const wk=D.wk[wi];
  if(D.aud){const pct=fmAudPct(p,wi),roll=RI(1,100);if(roll>pct)return {t:`No te eligen para ${wk[1].toLowerCase()}. Mejora tu nivel, tu fama o consigue representación: abren puertas.`,roll,pct,ok:false};
    const c=fmCo(p)||pick(Object.values(W.C).filter(c=>c.t<=fmMaxTier(p)));const fee=D.fee[wi]*Math.pow(1+fcFama(f)/14,2.2)*[.8,1,1.3,1.7][c.t]*R(.85,1.2);p.dinero+=fcNet(p,fee);f.earn+=fee;fm.st8.rev+=fee;
    fm.proj={wi,bl:Math.min(2,c.t),co:c.i,n:0,qs:0,t:fmTitle(D),feat:null,fee};f.act=Math.min(4,f.act+1);
    return {t:`¡Te eligen! ${wk[1]} en «${fm.proj.t}» (${c.n}). Honorarios: ${fmt(toInt(fee,'USD'))}. Ahora toca trabajar: ${wk[2]} sesiones.`,roll,pct,ok:true};}
  const b=fmBudOK(p,wi,bl);if(!b.ok)return {t:`No puedes producirlo: ${b.t}.`};if(b.by==='me')p.dinero-=b.cost;else fm.co.rec+=D.wk[wi][3][bl];
  if(feat&&(!W.A[feat]||(fm.rel[feat]||0)<25))feat=null;
  fm.proj={wi,bl,co:fm.co?fm.co.id:null,n:0,qs:0,t:fmTitle(D),feat:feat||null};
  return {t:(`Empiezas «${fm.proj.t}» (${wk[1].toLowerCase()}, producción ${FM_BUD[bl].toLowerCase()}).`+(b.by==='co'?` ${fmCo(p).n} adelanta el presupuesto (se recupera de tus regalías).`:b.cost?` Inviertes ${fmt(b.cost)}.`:'')+(feat?` Colabora ${W.A[feat].n}.`:'')+` Son ${wk[2]} sesiones de trabajo.`)};}
function fmProjWork(p){const f=p.fc,fm=fmOf(p),D=FM[f.k];const pr=fm.proj;if(!pr)return 'No tienes un proyecto en marcha.';const wk=D.wk[pr.wi];if(pr.n>=wk[2])return 'El proyecto ya está terminado: lánzalo.';
  if(pr.blk){pr.blk=0;return 'Sesión perdida: sigues bloqueado. La siguiente saldrá mejor.';}
  const q=clamp((fm.at[wk[6][0]]*.6+fm.at[wk[6][1]]*.4)*(.68+Math.random()*.5)*(1+COACH[f.coach][2]*.02),3,99);pr.qs+=q;pr.n++;f.act=Math.min(4,f.act+.5);fmLearn(p,wk[6],.22);
  return `Sesión ${pr.n} de ${wk[2]} de «${pr.t}»: ${q>=80?'sale material brillante':q>=60?'buen avance':q>=40?'avance irregular':'un día para olvidar'} (calidad de la sesión ${Math.round(q)}; promedio ${Math.round(pr.qs/pr.n)}).${pr.n>=wk[2]?' ¡Terminado! Ya puedes lanzarlo.':''}`;}
function fmLearn(p,idx,g){const f=p.fc,fm=fmOf(p),D=FM[f.k];const o=f.sk;const lvl=o<45?1.4:o<60?1:o<72?.6:o<82?.34:.17;for(const k of idx)fm.at[k]=clamp(fm.at[k]+g*f.tal*lvl*clamp((100-fm.at[k])/40,.08,1),0,99);f.sk=fmOvr(fm,D);} // se aprende haciendo: cada sesión y cada presentación suman un poco
function fmProjCancel(p){const fm=fmOf(p);if(!fm.proj)return '';const t=fm.proj.t;fm.proj=null;return `Cancelas «${t}». Lo invertido no se recupera.`;}
function fmPromoCost(p,i){const D=FM[p.fc.k],pr=fmOf(p).proj;return toInt(FM_PROMO[i][1]*(D.wk[pr.wi][3][1]||3e3),'USD');}
function fmRelease(p,promo){const f=p.fc,fm=fmOf(p),D=FM[f.k],W=fmW(f.k);const pr=fm.proj;if(!pr)return 'No hay nada que lanzar.';const wk=D.wk[pr.wi];if(pr.n<wk[2])return `Faltan ${wk[2]-pr.n} sesión(es).`;
  const c=pr.co&&W.C[pr.co];if(D.aud)promo=c?c.t:0;const pc=D.aud?0:fmPromoCost(p,promo);const byCo=!!(fm.co&&c&&promo<=Math.max(1,c.t));if(pc&&!byCo&&pc>p.dinero)return `Necesitas ${fmt(pc)} para esa promoción.`;
  if(pc){if(byCo)fm.co.rec+=FM_PROMO[promo][1]*(wk[3][1]||3e3);else p.dinero-=pc;}
  const A=pr.feat&&W.A[pr.feat];const q=clamp(pr.qs/pr.n*[1,1.05,1.1][pr.bl]*(A?1.05:1)*(fm.co&&fm.co.ctl?1.04:1),3,99);
  const cr=Math.round(clamp(q+gz()*7,1,100)),pu=Math.round(clamp(q*.6+fm.at[4]*.35+gz()*8+promo*2,1,100));
  let b=fmBase(D,fcFans(f),c?c.t:null,wk[4],q*.75+pu*.25)*FM_PROMO[promo][2]*R(.7,1.4)*(chance(.04+pu/900)?2.5:1);if(A)b+=Math.pow(A.F,.85)*.3*wk[4]*fmQf(q);
  const sh=D.aud?+(.004+fcFama(f)/12000).toFixed(4):fm.co?fm.co.roy:.7;
  const w={i:'m'+(fm.seq++),a:'me',t:pr.t,ty:pr.wi,q:Math.round(q),m:0,b:Math.round(b),v:0,tot:0,pk:99,ps:0,y:G.fm.cy,cr,pu,rv:0,h:[],sh,co:fm.co?fm.co.id:null,ft:A?A.n:''};fm.cat.push(w);if(fm.cat.length>60)fm.cat.splice(0,fm.cat.length-60);
  const hit=q>(wk[4]>=2?86:80);const add=fcAddFans(p,q,(wk[4]>=2?2:1)*(hit?2.5:1));fm.proj=null;fm.st8.w++;f.act=Math.min(4,f.act+1.5);if(fm.co&&fm.co.del>0)fm.co.del--;if(A){fm.rel[pr.feat]=clamp((fm.rel[pr.feat]||0)+10,-100,100);A.hot=(A.hot||0)+.1;}
  if(q<14&&chance(.12))return fcScandal(p,'acusaciones de plagio en tu trabajo más reciente');
  const crt=cr>=85?'la crítica lo aclama':cr>=70?'buenas reseñas':cr>=50?'reseñas mixtas':'la crítica lo destroza';const put=pu>=85?'el público lo adora':pu>=65?'gusta al público':pu>=45?'recepción tibia':'pasa sin pena ni gloria';
  return (`Lanzas «${w.t}» (${wk[1].toLowerCase()}): ${crt} (${cr}/100) y ${put} (${pu}/100). +${fmtK(add)} ${D.fan}. `+(D.aud?`Participas con ${(sh*100).toFixed(1)} % de las ganancias.`:fm.co?(fm.co.rec>0?`Regalías: ${Math.round(sh*100)} % (primero se recupera el anticipo: faltan ${fmt(toInt(fm.co.rec,'USD'))}).`:`Regalías: ${Math.round(sh*100)} %.`):'Como independiente te quedas 70 % de lo que genere.'));}
/* ----- contratos: ofertas, negociación con dado, firma y rescisión ----- */
function fmOffersGen(p,force){const f=p.fc,fm=fmOf(p),W=fmW(f.k);const M=G.fm;fm.off=fm.off.filter(o=>o.dl>M.t&&W.C[o.co]);if(fm.co||f.img<35)return 0;const fama=fcFama(f);if(fama<12)return 0;
  const hot=fm.cat.some(w=>w.m<=4&&w.hit);if(!chance(force?.75:.1+(f.ag>=1?.06:0)+(hot?.25:0)))return 0;const mt=fmMaxTier(p);const n=1+(f.ag>=2&&chance(.5)?1:0);let k=0;
  for(let i=0;i<n;i++){const t=clamp(mt-(chance(.45)?1:0)+(f.ag>=3&&chance(.25)?1:0),0,3);const Cs=Object.values(W.C).filter(c=>c.t===t&&!fm.off.some(o=>o.co===c.i));if(!Cs.length)continue;const c=pick(Cs);const yrs=RI(FM_YRS[t][0],FM_YRS[t][1]);
    fm.off.push({co:c.i,adv:Math.round((3e3+Math.pow(fcFans(f),.85)*FM_ADV[t]*2)*R(.7,1.3)/100)*100,roy:+(FM_ROY[t]+R(-.02,.02)).toFixed(3),yrs,del:yrs+RI(0,yrs),ctl:0,dl:M.t+2,ng:0});k++;}
  if(k)log(`📨 Tienes ${k} oferta(s) de contrato. Revísalas en ⭐ Tu carrera → Industria.`,'good');return k;}
function fmNegoPct(p,i,ask){const fm=fmOf(p),o=fm.off[i];if(!o)return 0;let b=.42+(AGENT[p.fc.ag][2]-1)*.35+(fm.cat.some(w=>w.m<=6&&w.hit)?.1:0)-o.ng*.15;if(ask===2)b-=.12;if(ask===3)b+=.05;if(ask===4)b-=.05;return clamp(Math.round(b*100),3,92);}
function fmNego(p,i,ask){const fm=fmOf(p),o=fm.off[i];if(!o)return {t:''};if(o.last)return {t:'Es su última oferta: tómala o déjala.'};const pct=fmNegoPct(p,i,ask),roll=RI(1,100),ok=roll<=pct;o.ng++;let t;
  if(ok){if(ask===1)o.adv=Math.round(o.adv*1.2/100)*100;if(ask===2)o.roy=+(o.roy+.03).toFixed(3);if(ask===3)o.yrs=Math.max(1,o.yrs-1);if(ask===4)o.ctl=1;
    t='✅ Aceptan: '+(ask===1?`el anticipo sube a ${fmt(toInt(o.adv,'USD'))}`:ask===2?`las regalías suben a ${Math.round(o.roy*100)} %`:ask===3?`el contrato baja a ${o.yrs} año(s)`:'conservas el control creativo')+'.';}
  else if(chance(.35+o.ng*.1)){fm.off.splice(i,1);t='❌ La compañía se retira de la negociación.';}else{o.last=true;t='⚠️ No aceptan. Es su última oferta.';}return {t,roll,pct,ok};}
function fmSign(p,i){const f=p.fc,fm=fmOf(p),W=fmW(f.k),o=fm.off[i];if(!o)return '';const c=W.C[o.co];fm.co={id:o.co,roy:o.roy,yrs:o.yrs,m0:G.fm.t,rec:o.adv,del:o.del,ctl:o.ctl};p.dinero+=fcNet(p,o.adv);f.earn+=o.adv;fm.st8.rev+=o.adv;fm.off=[];
  return (o.ctl?`Firmas con ${c.n} por ${o.yrs} año(s): anticipo de ${fmt(toInt(o.adv,'USD'))} (recuperable de tus regalías), ${Math.round(o.roy*100)} % de regalías, ${o.del} obra(s) comprometida(s), con control creativo.`:`Firmas con ${c.n} por ${o.yrs} año(s): anticipo de ${fmt(toInt(o.adv,'USD'))} (recuperable de tus regalías), ${Math.round(o.roy*100)} % de regalías, ${o.del} obra(s) comprometida(s).`);}
function fmBreakCost(p){const fm=fmOf(p);return fm.co?fm.co.rec*1.2+3e3:0;}
function fmBreak(p){const fm=fmOf(p),c=fmCo(p);if(!fm.co)return '';const cost=toInt(fmBreakCost(p),'USD');if(p.dinero<cost)return `Rescindir cuesta ${fmt(cost)} (anticipo sin recuperar más penalización) y no te alcanza.`;p.dinero-=cost;fm.co=null;p.fc.img=clamp(p.fc.img-3,0,100);
  return `Rescindes tu contrato con ${c?c.n:'la compañía'}: pagas ${fmt(cost)}. Vuelves a ser independiente.`;}
/* ----- presentaciones con momentos de decisión ----- */
const fmCap=(D,v)=>Math.round(Math.max(30+v*20,FM_VEN[v][1]*D.vc[0]));
function fmGigPool(p,v){const f=p.fc.fans;return v===0?f.loc*.15+40:v===1?(f.loc+f.nac*.3)*.1:v===2?(f.nac+f.loc)*.06:(f.nac+f.int*.05)*.05;}
function fmGigCan(p,v){const f=p.fc;const have=v===0?f.fans.loc+50:v===1?f.fans.loc+f.fans.nac:fcFans(f);return have>=FM_VEN[v][2]?'':`necesitas ${fmtK(FM_VEN[v][2])} ${FM[f.k].fan}`;}
function fmGigStart(p,v,tour){const fm=fmOf(p),D=FM[p.fc.k];const ms=[...Array(D.mom.length).keys()].sort(()=>Math.random()-.5).slice(0,4).sort((a,b)=>a===0?-1:b===0?1:a===D.mom.length-1?1:b===D.mom.length-1?-1:a-b);
  fm.gig={v,sc:50,i:0,ms,log:[],tour:tour||null};return fm.gig;}
function fmGigOpts(p){const fm=fmOf(p),D=FM[p.fc.k],g=fm.gig;const M=D.mom[g.ms[g.i]];return {t:M[0],o:M[1].map(([n,a,dif,gain])=>[n,clamp(.5+(fm.at[a]-dif)/55,.06,.95),gain,a])};}
function fmGigMoment(p,oi){const fm=fmOf(p),g=fm.gig;if(!g||g.end)return null;const O=fmGigOpts(p);const o=O.o[oi]||O.o[0];const ok=Math.random()<o[1];g.sc=clamp(g.sc+(ok?o[2]:-o[2]*.55),0,100);
  const t=ok?pick(['Sale perfecto: el público responde.','Funciona mejor de lo que esperabas.','Lo logras y se nota en la sala.']):pick(['No sale como querías.','Se nota el tropiezo.','El público lo percibe y la energía baja.']);
  g.log.push(`${o[0]} → ${t}`);g.i++;fmLearn(p,[o[3]],.12);if(g.i>=g.ms.length)fmGigEnd(p);return {ok,pct:Math.round(o[1]*100),t,gain:o[2]};}
function fmGigEnd(p){const f=p.fc,fm=fmOf(p),D=FM[f.k],g=fm.gig;const v=g.v;const price=FM_VEN[v][3],vn=D.vn[v];let pool=g.tour?g.tour.pool:fmGigPool(p,v);const att=Math.round(Math.min(fmCap(D,v),pool)*(.55+g.sc/170));
  const gross=att*price*D.vc[1],net=gross*[.5,.42,.38,.35][v];p.dinero+=fcNet(p,net);f.earn+=net;fm.st8.rev+=net;fm.st8.sh++;fm.st8.att+=att;if(D.stars)fm.svc=Math.round((fm.svc||50)*.5+g.sc*.5);
  const add=fcAddFans(p,g.sc*.95,.3+v*.2+(g.sc>=80?.4:0));p.s.salud=clamp(p.s.salud-v*1.5,0,100);f.act=Math.min(4,f.act+1);if(g.sc<25&&fcFama(f)>=30)f.img=clamp(f.img-4,0,100);
  const rv=g.sc>=82?'una noche legendaria':g.sc>=64?'una gran noche':g.sc>=45?'una presentación correcta':g.sc>=28?'una noche floja':'un desastre que circulará en redes';
  g.end={att,net,add,rv,city:g.tour?g.tour.city:null};if(g.tour&&fm.tour){fm.tour.tot+=net;fm.tour.att+=att;fm.tour.res.push([g.tour.city,att,Math.round(g.sc)]);fm.tour.i++;}
  log((g.tour?`${D.sh[0]} en ${g.tour.city} (${vn}): ${rv}.`:`${D.sh[0]} (${vn}): ${rv}.`)+` ${fmtK(att)} asistentes, utilidad ${fmt(toInt(net,'USD'))} · +${fmtK(add)} ${D.fan}.`,g.sc>=64?'good':'');if(g.tour&&fm.tour&&fm.tour.i>=fm.tour.d.length)fmTourEnd(p);return g.end;}
function fmGigAuto(p){const fm=fmOf(p);let k=0;while(fm.gig&&!fm.gig.end&&k++<8)fmGigMoment(p,0);const e=fm.gig&&fm.gig.end;fm.gig=null;return e;}
function fmGig(p,v){const er=fmGigCan(p,v);if(er)return 'No puedes presentarte ahí: '+er+'.';if(p.s.salud<30&&chance(.4)){p.s.salud=clamp(p.s.salud+5,0,100);return fcScandal(p,'cancelar de último minuto por agotamiento');}fmGigStart(p,v);if(fmAuto()){fmGigAuto(p);return null;}return null;}
/* ----- giras ----- */
function fmTourCan(p,sc){const f=p.fc,fm=fmOf(p);if(fm.tour)return 'ya estás de gira';if(fcFans(f)<FM_TOUR[sc][2])return `necesitas ${fmtK(FM_TOUR[sc][2])} ${FM[f.k].fan}`;if(sc>=2&&f.fans.int<FM_TOUR[sc][2]*.2)return 'necesitas más público fuera de tu país';return '';}
function fmTourCities(p,sc){const home=natOf(p).id;const n=FM_TOUR[sc][1];let L=[];const loc=typeof ftCities==='function'?ftCities(home).map(c=>[c[0],home]):[];
  if(sc<=1){L=loc.slice(0,n);let k=2;while(L.length<n&&loc.length){L.push([loc[(L.length)%loc.length][0]+` (fecha ${k})`,home]);if(L.length%loc.length===0)k++;}}
  else{const ct=FM_CONT[home]!=null?FM_CONT[home]:(/Europe/.test((N0[home]||{}).reg||'')?1:/Latin|North America/.test((N0[home]||{}).reg||'')?0:/Africa|Middle/.test((N0[home]||{}).reg||'')?2:3);
    const pool=FM_WCITY.filter(c=>G.nations[c[1]]&&(sc===3||FM_CONT[c[1]]===ct));L=loc.slice(0,sc===3?3:4).concat(pool.filter(c=>c[1]!==home).sort(()=>Math.random()-.5)).slice(0,n);}
  if(!L.length)L=[[RG[p.r].nm,home]];return L;}
function fmTourStart(p,sc){const f=p.fc,fm=fmOf(p),D=FM[f.k];const er=fmTourCan(p,sc);if(er)return 'No puedes salir de gira: '+er+'.';const d=fmTourCities(p,sc);
  fm.tour={sc,d,i:0,res:[],tot:0,att:0,key:d.length-1,y:G.fm.cy};f.act=4;return `Arranca: ${D.sh[1].toLowerCase()} (${FM_TOUR[sc][0].toLowerCase()}), ${d.length} fechas (${d.slice(0,4).map(x=>x[0]).join(', ')+(d.length>4?'…':'')}). Se juegan unas 4 por mes y la última se vive en pantalla.`;}
function fmTourDate(p,auto){const f=p.fc,fm=fmOf(p),T=fm.tour;const [city,nid]=T.d[T.i];const home=natOf(p).id;let pool=nid===home?(f.fans.nac+f.fans.loc)*R(.04,.1):f.fans.int*R(.004,.012);let v=FM_TOUR[T.sc][3];while(v>0&&fmCap(FM[f.k],v)>pool*1.6)v--;
  if(T.i===T.key&&!auto){fmGigStart(p,v,{city,pool});return true;}
  const sc=clamp(50+(f.sk-55)*.6+gz()*11,5,98);const att=Math.round(Math.min(fmCap(FM[f.k],v),pool)*(.55+sc/170));const net=att*FM_VEN[v][3]*FM[f.k].vc[1]*[.5,.42,.38,.35][v];p.dinero+=fcNet(p,net);f.earn+=net;fm.st8.rev+=net;fm.st8.sh++;fm.st8.att+=att;
  T.tot+=net;T.att+=att;T.res.push([city,att,Math.round(sc)]);fcAddFans(p,sc*.9,.25+v*.12);T.i++;return false;}
function fmTourMonth(p){const f=p.fc,fm=fmOf(p),D=FM[f.k],T=fm.tour;if(!T||fm.gig)return;if(f.inj){return;}let n=0;while(T.i<T.d.length&&n<4){if(fmTourDate(p,fmAuto()))return;n++;}
  f.act=4;p.s.salud=clamp(p.s.salud-2,0,100);if(T.i>=T.d.length)fmTourEnd(p);}
function fmTourEnd(p){const f=p.fc,fm=fmOf(p),D=FM[f.k],T=fm.tour;if(!T)return;fcBump(p,.03+T.sc*.03);const s=`Termina: ${D.sh[1].toLowerCase()} (${FM_TOUR[T.sc][0].toLowerCase()}), ${T.d.length} fechas, ${fmtK(T.att)} asistentes y ${fmt(toInt(T.tot,'USD'))} de utilidad.`;log('🎟️ '+s,'big');
  if(T.sc>=2&&fcFama(f)>=45)fmNews(fmW(f.k),`${fullName(p)} cierra una gira ${FM_TOUR[T.sc][0].toLowerCase()} con ${fmtK(T.att)} asistentes.`,[natOf(p).id],T.sc===3);fm.lastTour={sc:T.sc,n:T.d.length,att:T.att,tot:T.tot,y:T.y,res:T.res.slice(-22)};fm.tour=null;}
/* ----- colegas: convivir, colaborar y rivalidades ----- */
function fmMeet(p,aid){const fm=fmOf(p),A=fmW(p.fc.k).A[aid];if(!A)return '';const far=Math.log10(Math.max(10,A.F))-Math.log10(Math.max(10,fcFans(p.fc)));const pct=clamp(chkPct(p,'carisma',45+far*9),5,95),roll=RI(1,100);
  if(roll<=pct){fm.rel[aid]=clamp((fm.rel[aid]||0)+RI(9,16),-100,100);return {t:`Convives con ${A.n}: hay buena química. Relación ${fm.rel[aid]}. Con 25 o más puedes invitarle a colaborar.`,roll,pct,ok:true};}
  fm.rel[aid]=clamp((fm.rel[aid]||0)-2,-100,100);return {t:`${A.n} es amable, pero su equipo te despacha rápido. Las figuras grandes cuidan con quién se juntan.`,roll,pct,ok:false};}
function fmFeud(p,aid){const f=p.fc,fm=fmOf(p),A=fmW(f.k).A[aid];if(!A)return '';fm.rel[aid]=clamp((fm.rel[aid]||0)-35,-100,100);f.img=clamp(f.img-4,0,100);const add=fcSplit(p,Math.min(A.F*.004,fcFans(f)*.08)+200);
  if(chance(.12))return fcScandal(p,`un pleito público con ${A.n} que se salió de control`);return (A.x==='F'?`Lanzas una indirecta pública contra ${A.n}. Las redes arden: +${fmtK(add)} ${FM[f.k].fan}, pero tu imagen baja y ella no lo olvidará.`:`Lanzas una indirecta pública contra ${A.n}. Las redes arden: +${fmtK(add)} ${FM[f.k].fan}, pero tu imagen baja y él no lo olvidará.`);}
/* ----- el mes del jugador ----- */
function fmMonthP(p){const f=p.fc,fm=fmOf(p),D=FM[f.k],W=fmW(f.k),M=G.fm;
  const cur=FL(p,'fama')||0;if(f.lastF!=null&&cur>f.lastF+.5)fcBump(p,(cur-f.lastF)*.04);
  const decay=f.act>.5?.995:.98;for(const k in f.fans)f.fans[k]*=decay;const act=clamp(f.act,0,1);f.act=Math.max(0,f.act-.34);if(f.inj)f.inj=Math.max(0,f.inj-1);
  // regalías del catálogo: lo que generó cada obra este mes × tu porcentaje; con disquera, primero se recupera el anticipo
  let roy=0,units=0,bp=99;for(const w of fm.cat){if(w.old||w.m>31)continue;const gross=w.v*D.unit[2]*D.cal;let mine=gross*w.sh;units+=w.v;
    if(fm.co&&w.co===fm.co.id&&fm.co.rec>0){const k=Math.min(mine,fm.co.rec);fm.co.rec-=k;mine-=k;}w.rv+=mine;roy+=mine;w.h.push(w.v);if(w.h.length>18)w.h.shift();
    if(w.ps&&w.ps<=10&&!w.t10){w.t10=1;fm.st8.t10++;fcBump(p,.05);log(`📈 «${w.t}» entra al top 10 de ${D.ch} (puesto ${w.ps}).`,'good');}
    if(w.ps&&w.ps<bp&&w.m<=30)bp=w.ps;}
  if(bp<=20)fcSplit(p,fcFans(f)*.012*(21-bp)/20+50); // estar en la lista atrae público nuevo (solo cuenta tu mejor posición)
  // techo: el público no se sostiene muy por encima de lo que tu nivel justifica
  {const top=fmFansFor(f.sk)*6;const F=fcFans(f);if(F>top){const k=(top+(F-top)*.5)/F;for(const x in f.fans)f.fans[x]*=k;}}
  // catálogo antiguo: una cola larga pequeña
  const tail=fcFans(f)*FC[f.k].usd/12*.06*(.5+f.img/200);roy+=tail;p.dinero+=fcNet(p,roy);f.earn+=roy;fm.st8.rev+=roy;fm.st8.u+=units;fm.mRoy=roy;
  // el público se acerca poco a poco a lo que corresponde a tu nivel, si sigues activo
  const tgt=fmFansFor(f.sk)*(f.img/70);const d=(tgt-fcFans(f))*.02*act;if(d>0)fcSplit(p,d);
  const fee=COACH[f.coach][1]*U(p)/12;if(fee)p.dinero-=fee;f.lastF=fcFama(f);FL(p,'fama',f.lastF);if(f.img<65)f.img+=.4;
  fmTourMonth(p);
  if(fm.co&&M.t-fm.co.m0>=fm.co.yrs*12){const c=fmCo(p);log(((c?`Termina tu contrato con ${c.n}.`:'Termina tu contrato con la compañía.')+(fm.co.rec>0?' El anticipo que no se recuperó lo absorbe la compañía.':'')+(fm.co.del>0?` Quedaste a deber ${fm.co.del} obra(s): tu reputación con las compañías baja.`:'')));if(fm.co.del>0)f.img=clamp(f.img-3,0,100);fm.co=null;}
  const n0=fm.off.length;fmOffersGen(p);if(fmAuto()&&fm.off.length&&!fm.co){let b=0;fm.off.forEach((o,i)=>{if(o.adv>fm.off[b].adv)b=i;});log(fmSign(p,b),'good');}else if(fm.off.length>n0)FM_NOTE=1;
  // avance rápido: tu equipo mantiene la carrera en marcha
  if(typeof FF_ON!=='undefined'&&FF_ON&&p.alive&&!p.prison)fmTeamMonth(p);
  fm.fh.push(Math.round(fcFans(f)));if(fm.fh.length>60)fm.fh.shift();
  if(M.cm===11){fm.ih.push([M.cy,Math.round(f.earn)]);if(fm.ih.length>25)fm.ih.shift();}}
function fmTeamMonth(p){const f=p.fc,fm=fmOf(p),D=FM[f.k];if(f.inj)return;const t=G.fm.t;
  if(t%3===0){fmTrain(p,t/3%fm.at.length|0);}
  if(!fm.proj&&t%4===1){const wi=t%8===1?1:0;const bl=fmBudOK(p,wi,1).ok?1:0;const r=fmProjStart(p,wi,bl);if(fm.proj){const n=D.wk[wi][2];for(let i=0;i<n;i++)fmProjWork(p);}}
  else if(fm.proj&&fm.proj.n>=D.wk[fm.proj.wi][2]){const pr=fmPromoCost(p,1)<p.dinero*.2?1:0;log(fmRelease(p,pr));}
  else if(fm.proj){for(let i=0;i<8&&fm.proj.n<D.wk[fm.proj.wi][2];i++)fmProjWork(p);}
  if(!fm.tour&&t%12===6){for(let sc=3;sc>=0;sc--)if(!fmTourCan(p,sc)){log(fmTourStart(p,sc));break;}}}

/* ----- integración ----- */
var FM_NOTE=0;
{const _fs=fcStart;fcStart=function(p,k){const r=_fs(p,k);if(FM[k]){const fm=fmInit(p);const D=FM[k];return r.replace(/ Abre Carrera.*$/,'')+(fm.rk>=9999?` Tu estilo: ${D.st[fm.st].toLowerCase()}. Nivel ${p.fc.sk.toFixed(0)}; puesto fuera de lista en «${D.rk}». Abre Carrera → ⭐ Tu carrera para manejarla.`:` Tu estilo: ${D.st[fm.st].toLowerCase()}. Nivel ${p.fc.sk.toFixed(0)}; puesto #${fm.rk} en «${D.rk}». Abre Carrera → ⭐ Tu carrera para manejarla.`);}return r;};}
{const _fo=fcOffers;fcOffers=function(p){if(p.fc&&FM[p.fc.k]){p.fc.off=[];return;}return _fo(p);};}
{const _fm=fcMonth;fcMonth=function(p){if(p.fc&&FM[p.fc.k]){if(!p.fc.fm)fmInit(p);return;}return _fm(p);};} // el mes de estas carreras lo lleva fmMonthP (abajo)
{const _sc=fcScandal;fcScandal=function(p,cause){const r=_sc(p,cause);const fm=fmOf(p);if(fm&&fm.co&&chance(.25)){const c=fmCo(p);fm.co=null;return r+` ${c?c.n:'Tu compañía'} aplica la cláusula de moralidad y rescinde tu contrato.`;}return r;};}
{const _me=mkMonthEnd;mkMonthEnd=function(){_me();try{if(!G||!P)return;const M=fmG();if(P.fc&&FM[P.fc.k]&&!P.fc.fm)fmInit(P);const fm=P.alive?fmOf(P):null;
    for(const k in M.W)fmMonthWorld(M.W[k],M.cy,M.cm,fm&&P.fc.k===k?P:null);
    if(fm){fmMonthP(P);if(fmAuto()){if(fm.gig)fmGigAuto(P);if(fm.tour&&fm.tour.i>=fm.tour.d.length)fmTourEnd(P);}}
    M.t++;M.cm++;if(M.cm>11){M.cm=0;M.cy++;}}catch(e){if(typeof console!=='undefined')console.error('fama mes',e);}};}
// el reloj se detiene cuando hay una presentación o una ceremonia pendiente y cuando llega una oferta de contrato
{const _ca=clockAdvance;clockAdvance=function(n,opt){const fm=fmOf(P);
  if(fm&&(fm.gig||fm.gala)){if(fmAuto()){if(fm.gig)fmGigAuto(P);if(fm.gala)fmGalaEnd(P,0,0);}else return {done:0,rep:[],stop:'show',months:0};}
  if(fm&&!fmAuto()&&n>7){const o0=fm.off.length;let done=0,rep=[],months=0;while(done<n){const m=monthOfDay(G.day);const k=Math.max(1,Math.min(n-done,MCUM[m+1]-G.day));const r=_ca(k,opt);done+=r.done;rep.push(...r.rep);months+=r.months;
      const f2=fmOf(P);if(r.stop||!f2)return {done,rep,stop:r.stop,months};if(f2.gig||f2.gala)return {done,rep,stop:'show',months};if(f2.off.length>o0){FM_NOTE=1;return {done,rep,stop:'oferta',months};}if(!r.done||!P.alive)break;}return {done,rep,stop:null,months};}
  const r=_ca(n,opt);const f2=fmOf(P);if(f2&&(f2.gig||f2.gala)&&!r.stop)r.stop='show';return r;};}
ACT_COST.unshift([/^⭐ Practicar/,18],[/^⭐ Sesión/,10],[/^⭐ Audición/,4],[/^⭐ Proyecto/,2],[/^⭐ Lanzar/,3],[/^⭐ Presentación 0/,3],[/^⭐ Presentación 1/,5],[/^⭐ Presentación 2/,8],[/^⭐ Presentación 3/,12],
  [/^⭐ Gira 0/,10],[/^⭐ Gira 1/,22],[/^⭐ Gira 2/,36],[/^⭐ Gira 3/,55],[/^⭐ Convivir/,3],[/^⭐ Indirecta/,1],[/^⭐ Tocar puertas/,6]);
// los bancos cuentan tus ingresos de fama (con descuento, por ser variables) al calcular cuánto te prestan
{const _lm=loanMax;loanMax=function(p,b){let v=_lm(p,b);if(p.fc){const inc=Math.max(p.fc.earnY||0,p.fc.earn||0);if(inc>0){const cs=csOf(p);v+=toInt(inc,'USD')*.6*(cs>=750?4:cs>=680?3:cs>=600?2:1);}}return Math.max(0,v);};}

/* ----- diálogos con causa ----- */
const fmNear=p=>{const W=fmW(p.fc.k);if(!W)return null;const F=fcFans(p.fc);const L=Object.values(W.A).sort((a,b)=>Math.abs(Math.log(a.F/Math.max(1,F)))-Math.abs(Math.log(b.F/Math.max(1,F))));return L[0]||null;};
const fmLast=p=>{const fm=fmOf(p);return fm?fm.cat.filter(w=>!w.old).slice(-1)[0]:null;};
D_({id:'fm_bloqueo',cat:'fama',title:'Bloqueo creativo',cool:300,npc:p=>fmOf(p)?npc(p,'colega'):null,
 w:p=>{const fm=fmOf(p);return fm&&fm.proj&&fm.proj.n>=1&&fm.proj.n<FM[p.fc.k].wk[fm.proj.wi][2]&&fm.proj.qs/fm.proj.n<p.fc.sk*.92?1.6:0;},
 N:{a:{t:(p,n,c,x)=>`Llevas días frente a «${fmOf(p).proj.t}» y nada de lo que haces te convence. ${x.name}, que ya pasó por esto, te dice: «El bloqueo no se rompe empujando más fuerte».`,
  o:[{t:'Forzarte a trabajar de todos modos',ok:{r:'Avanzas, pero sabes que lo de hoy no es tu mejor trabajo. La próxima sesión se perderá.',go:p=>{const pr=fmOf(p).proj;if(pr)pr.blk=1;}}},
   {t:'Tomarte unos días fuera para despejarte',ok:{r:'Vuelves con la cabeza limpia y dos ideas nuevas.',go:p=>{const pr=fmOf(p).proj;if(pr&&pr.n){pr.qs+=6*pr.n;}},fx:{ft:-4,s:{felicidad:4}}}},
   {t:'Pedirle que revise el material contigo',k:['carisma',48],ok:{r:'Encuentra lo que tú ya no veías. El proyecto mejora.',go:p=>{const pr=fmOf(p).proj;if(pr&&pr.n){pr.qs+=9*pr.n;}},fx:{rel:6,fav:-1}},ko:{r:'Está ocupado con lo suyo y lo toma como un abuso de confianza.',fx:{rel:-6}}}]}}});
D_({id:'fm_plagio',cat:'fama',title:'Acusación de plagio',cool:900,npc:p=>fmOf(p)?npc(p,'contacto'):null,
 w:p=>{const w=fmLast(p);return w&&w.m<=5&&w.hit&&fcFama(p.fc)>=30?.9:0;},
 N:{a:{t:(p,n,c,x)=>`Un despacho de abogados te notifica: alguien afirma que «${fmLast(p).t}» copia una obra suya y exige ${fmt(toInt(Math.max(5e3,fmLast(p).rv*.5),'USD'))}. En la industria, los éxitos atraen demandas: algunas son legítimas y otras buscan un arreglo rápido.`,
  o:[{t:'Pagar un arreglo confidencial',ok:{r:'Firmas el arreglo. Nadie se entera y sigues adelante.',go:p=>{p.dinero-=toInt(Math.max(5e3,fmLast(p).rv*.5),'USD');}}},
   {t:'Ir a juicio y defender tu obra',k:['inteligencia',55],ok:{r:'El peritaje demuestra que las obras solo comparten elementos comunes del género. Ganas y tu nombre queda limpio.',go:p=>{p.fc.img=clamp(p.fc.img+5,0,100);p.dinero-=toInt(4e3,'USD');}},ko:{r:'El juez ve similitudes sustanciales. Pagas daños y costas.',go:p=>{p.dinero-=toInt(Math.max(8e3,fmLast(p).rv*.9),'USD');fcScandal(p,'una sentencia por plagio');}}},
   {t:'Ofrecerle crédito y un porcentaje de la obra',ok:{r:'Acepta figurar como coautor. Cedes una parte de tus regalías de esa obra.',go:p=>{const w=fmLast(p);w.sh=+(w.sh*.7).toFixed(4);}}}]}}});
D_({id:'fm_colab',cat:'fama',title:'Propuesta de colaboración',cool:420,npc:p=>fmOf(p)&&fmNear(p)?npc(p,'colega'):null,
 w:p=>{const fm=fmOf(p);return fm&&!fm.proj&&fm.cat.length&&fcFama(p.fc)>=15?.9:0;},
 N:{a:{t:(p,n,c,x)=>{const A=fmNear(p);return `${A.n} (${FM[p.fc.k].st[A.st].toLowerCase()}, ${fmtK(A.F)} ${FM[p.fc.k].fan}) te escribe: «Me gusta lo que haces. ¿Hacemos algo juntos?» Una colaboración suma los públicos de ambos, pero también reparte el crédito.`;},
  o:[{t:'Aceptar: empezar un proyecto juntos',ok:{r:'Quedan de verse la próxima semana. La colaboración queda lista para tu siguiente proyecto.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=Math.max(40,(fm.rel[A.i]||0)+25);fm.inv=A.i;}}},
   {t:'Agradecer y dejarlo para después',ok:{r:'Lo entiende. La puerta queda abierta.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=(fm.rel[A.i]||0)+5;}}},
   {t:'Rechazar: no quieres que te asocien con su estilo',ok:{r:'No le cae bien. Se lo contará a otros.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=(fm.rel[A.i]||0)-20;}}}]}}});
D_({id:'fm_regalias',cat:'fama',title:'El estado de cuenta',cool:500,npc:p=>fmOf(p)&&fmOf(p).co?npc(p,'empresario'):null,
 w:p=>{const fm=fmOf(p);return fm&&fm.co&&fm.co.rec>0&&G.fm.t-fm.co.m0>=8?1.1:0;},
 N:{a:{t:(p,n,c,x)=>`Llega tu estado de regalías de ${fmCo(p).n}: después de meses de trabajo, el saldo a tu favor es cero. ${x.name}, de la compañía, lo explica: «Seguimos recuperando el anticipo y los costos de producción y promoción. Faltan ${fmt(toInt(fmOf(p).co.rec,'USD'))}». Así funcionan casi todos los contratos: no cobras regalías hasta recuperar.`,
  o:[{t:'Pedir una auditoría de las cuentas',k:['inteligencia',52],ok:{r:'La auditoría encuentra cargos mal aplicados. Te reducen el saldo pendiente.',go:p=>{const co=fmOf(p).co;if(co)co.rec*=.6;}},ko:{r:'Las cuentas están en orden y la auditoría la pagas tú.',go:p=>{p.dinero-=toInt(2500,'USD');},fx:{rel:-5}}},
   {t:'Renegociar: mejores regalías a cambio de un año más',k:['carisma',55],ok:{r:'Aceptan: +3 puntos de regalías y un año más de contrato.',go:p=>{const co=fmOf(p).co;if(co){co.roy=+(co.roy+.03).toFixed(3);co.yrs++;}}},ko:{r:'«El contrato es el contrato.»',fx:{rel:-3}}},
   {t:'Aceptarlo y concentrarte en el siguiente lanzamiento',ok:{r:'Entiendes el juego: el anticipo fue tu pago por adelantado.'}}]}}});
D_({id:'fm_critica',cat:'fama',title:'Una crítica demoledora',cool:400,npc:p=>fmOf(p)?npc(p,'contacto'):null,
 w:p=>{const w=fmLast(p);return w&&w.m<=3&&w.cr<45?1.5:0;},
 N:{a:{t:(p,n,c,x)=>`La reseña más leída del mes sobre «${fmLast(p).t}» se titula «Un paso en falso». Le pone ${fmLast(p).cr} de 100 y todo el medio la está compartiendo.`,
  o:[{t:'No responder y dejar que el trabajo hable',ok:{r:'En dos semanas nadie habla de la reseña.',fx:{s:{felicidad:-3}}}},
   {t:'Responderle en redes',k:['carisma',58],ok:{r:'Tu respuesta, con humor, cae bien: hasta el crítico la comparte.',go:p=>{fcAddFans(p,60,.4);}},ko:{r:'Suenas a mal perdedor. La discusión dura días.',go:p=>{p.fc.img=clamp(p.fc.img-6,0,100);}}},
   {t:'Invitar al crítico a ver tu proceso de trabajo',k:['inteligencia',55],ok:{r:'Publica una segunda nota, más matizada. Tu imagen mejora.',go:p=>{p.fc.img=clamp(p.fc.img+5,0,100);}},ko:{r:'Rechaza la invitación: «No me dedico a las relaciones públicas».'}}]}}});
D_({id:'fm_patrocinio',cat:'fama',title:'Un patrocinio polémico',cool:700,npc:p=>fmOf(p)?npc(p,'empresario'):null,
 w:p=>fmOf(p)&&fcFama(p.fc)>=38&&p.fc.img>=45?.8:0,
 N:{a:{t:(p,n,c,x)=>`${x.name} representa a una casa de apuestas en línea que quiere tu imagen: ${fmt(toInt(Math.pow(fcFans(p.fc),.85)*3,'USD'))} por un año. Paga el triple que una marca normal porque muchas figuras se niegan: parte de tu público lo verá mal.`,
  o:[{t:'Aceptar el dinero',ok:{r:'Firmas. El depósito llega esa semana; los comentarios también.',go:p=>{const v=Math.pow(fcFans(p.fc),.85)*3;p.dinero+=fcNet(p,v);p.fc.earn+=v;p.fc.img=clamp(p.fc.img-12,0,100);if(chance(.2))fcScandal(p,'promover apuestas entre un público joven');}}},
   {t:'Rechazar y decirlo públicamente',ok:{r:'Tu postura se comparte mucho. Otras marcas toman nota.',go:p=>{p.fc.img=clamp(p.fc.img+7,0,100);fcAddFans(p,55,.3);},fx:{rel:-8}}},
   {t:'Rechazar con discreción',ok:{r:'Agradeces y dejas la puerta abierta a otro tipo de marca.'}}]}}});
D_({id:'fm_rival',cat:'fama',title:'Una indirecta en público',cool:500,npc:p=>fmOf(p)&&fmNear(p)?npc(p,'rival'):null,
 w:p=>{const fm=fmOf(p);return fm&&fcFama(p.fc)>=25&&fm.rk<200?.8:0;},
 N:{a:{t:(p,n,c,x)=>{const A=fmNear(p);return `En una entrevista, ${A.n} suelta sin decir tu nombre: «Hay gente que confunde la fama con el talento». Todos entienden que habla de ti. Las rivalidades venden, pero también desgastan.`;},
  o:[{t:'Ignorarlo',ok:{r:'No le das combustible. El tema muere solo.',go:p=>{p.fc.img=clamp(p.fc.img+2,0,100);}}},
   {t:'Contestarle con una indirecta mejor',k:['carisma',52],ok:{r:'Tu respuesta se vuelve tendencia. El público toma partido... y el tuyo crece.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=(fm.rel[A.i]||0)-25;fcAddFans(p,70,.6);}},ko:{r:'Tu respuesta suena forzada y te llueven burlas.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=(fm.rel[A.i]||0)-25;p.fc.img=clamp(p.fc.img-5,0,100);}}},
   {t:'Escribirle en privado para aclararlo',k:['carisma',45],ok:{r:'Resulta que su equipo le había llevado chismes. Terminan en buenos términos.',go:p=>{const A=fmNear(p),fm=fmOf(p);fm.rel[A.i]=(fm.rel[A.i]||0)+20;}},ko:{r:'Te deja en visto.'}}]}}});
D_({id:'fm_agotamiento',cat:'fama',title:'El cuerpo pasa la factura',cool:500,npc:p=>fmOf(p)?npc(p,'colega'):null,
 w:p=>{const fm=fmOf(p);return fm&&fm.tour&&p.s.salud<55?2:0;},
 N:{a:{t:(p,n,c,x)=>`Vas a la mitad de la gira y llevas semanas durmiendo en aviones y camerinos. ${x.name} te ve pálido antes de salir: «Así no llegas al final». Cancelar fechas cuesta dinero y enoja al público; seguir puede costarte la salud.`,
  o:[{t:'Seguir como si nada',k:['salud',50],ok:{r:'Aguantas. Nadie nota nada.'},ko:{r:'Te desvaneces tras bambalinas. Un mes fuera por prescripción médica.',go:p=>{p.fc.inj=Math.max(p.fc.inj||0,1);p.s.salud=clamp(p.s.salud-8,0,100);}}},
   {t:'Posponer una semana de fechas',ok:{r:'Descansas. Parte del público se molesta, pero vuelves entero.',go:p=>{p.fc.img=clamp(p.fc.img-3,0,100);},fx:{s:{salud:10}}}},
   {t:'Contratar un médico y un preparador para la gira',ok:{r:'Con rutina, comida y sueño ordenados, terminas la gira mejor de lo que la empezaste.',go:p=>{p.dinero-=toInt(6e3,'USD');},fx:{s:{salud:7}}}}]}}});
