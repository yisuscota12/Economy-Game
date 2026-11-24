/*ENGINE_START*/
// Imperio de una Vida v0.2 — motor (sin DOM). Requiere MAP y WORLD definidos antes.
const VERSION='2.3b';
const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const chance=p=>Math.random()<p;
const clean=t=>String(t).replace(/[<>&"'`]/g,'');
function fmt(v){if(!isFinite(v))v=0;const a=Math.abs(v),s=v<0?'-$':'$';
  if(a>=1e12)return s+(a/1e12).toLocaleString('es-MX',{maximumFractionDigits:1})+' billones';
  if(a>=1e9)return s+(a/1e9).toLocaleString('es-MX',{maximumFractionDigits:1})+' mil M';
  if(a>=1e7)return s+(a/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M';
  return s+Math.round(a).toLocaleString('es-MX');}
const fmtPop=v=>v>=1e9?(v/1e9).toLocaleString('es-MX',{maximumFractionDigits:2})+' mil M':v>=1e6?(v/1e6).toLocaleString('es-MX',{maximumFractionDigits:1})+' M':Math.round(v).toLocaleString('es-MX');
const pct=v=>(Math.round(v*10)/10).toLocaleString('es-MX')+' %';

const RG=MAP.regions, N0=WORLD.nations;
const MODES={rapido:'Rápido',realista:'Realista'};
const isReal=()=>G.mode==='realista';

/* ===== NOMBRES POR CULTURA ===== */
const NAMES={
 hisp:{M:['Jesús','Carlos','Luis','Miguel','José','Diego','Andrés','Javier','Ricardo','Fernando','Emiliano','Santiago','Mateo','Héctor','Raúl','Adrián','Tomás','Iván'],F:['María','Sofía','Valeria','Camila','Fernanda','Lucía','Daniela','Regina','Ximena','Paula','Renata','Elena','Natalia','Gabriela','Carmen','Mariana'],S:['García','Hernández','López','Martínez','González','Rodríguez','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz','Morales','Reyes','Ortiz','Castillo','Vargas','Mendoza','Ruiz','Aguilar','Félix','Valenzuela','Leyva']},
 luso:{M:['João','Pedro','Lucas','Gabriel','Rafael','Mateus','Gustavo','Felipe','Bruno','Thiago'],F:['Ana','Beatriz','Larissa','Juliana','Camila','Mariana','Letícia','Fernanda','Bruna','Isabela'],S:['Silva','Santos','Oliveira','Souza','Pereira','Costa','Ferreira','Almeida','Carvalho','Ribeiro','Lima','Gomes']},
 angl:{M:['James','John','Michael','David','William','Daniel','Matthew','Ethan','Ryan','Jack','Oliver','Noah'],F:['Emily','Sarah','Jessica','Olivia','Emma','Grace','Hannah','Chloe','Megan','Lily','Amelia','Ava'],S:['Smith','Johnson','Brown','Taylor','Wilson','Davies','Evans','Thomas','Walker','Wright','Clark','Hall','Young','Hughes']},
 fran:{M:['Jean','Pierre','Louis','Nicolas','Antoine','Hugo','Lucas','Mamadou','Moussa','Ibrahima','Thomas','Julien'],F:['Marie','Camille','Léa','Chloé','Manon','Inès','Aminata','Fatou','Awa','Sophie','Claire','Julie'],S:['Martin','Bernard','Dubois','Durand','Lefèvre','Moreau','Diallo','Traoré','Koné','Ndiaye','Mbeki','Laurent','Girard']},
 germ:{M:['Lukas','Jonas','Felix','Maximilian','Paul','Erik','Lars','Nils','Johan','Henrik','Leon','Finn'],F:['Anna','Lena','Emma','Mia','Hanna','Sofie','Ingrid','Freja','Astrid','Klara','Lea','Marie'],S:['Müller','Schmidt','Schneider','Fischer','Weber','Becker','Hansen','Johansson','Nielsen','Andersen','de Vries','Jansen','Virtanen','Berg']},
 ital:{M:['Marco','Luca','Giuseppe','Francesco','Alessandro','Matteo','Lorenzo','Andrea','Davide','Simone'],F:['Giulia','Francesca','Chiara','Sara','Martina','Alessia','Elisa','Valentina','Federica','Giorgia'],S:['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo']},
 esla:{M:['Ivan','Dmitri','Alexei','Sergei','Mikhail','Nikolai','Andrei','Piotr','Tomasz','Marek','Luka','Stefan','Georgi','Arman'],F:['Anastasia','Olga','Natalia','Irina','Ekaterina','Anna','Zofia','Katarzyna','Milena','Ana','Elena','Nino'],S:['Ivanov','Petrov','Smirnov','Kuznetsov','Popov','Kowalski','Nowak','Novák','Horvat','Jovanović','Popescu','Nagy','Melnyk','Beridze']},
 arab:{M:['Mohamed','Ahmed','Ali','Omar','Youssef','Hassan','Khaled','Karim','Mahmoud','Tariq','Samir','Said'],F:['Fatima','Aisha','Mariam','Layla','Noor','Salma','Huda','Yasmin','Rania','Amira','Zainab','Leila'],S:['Al-Masri','Haddad','Khalil','Nasser','Saleh','Hamdan','Mansour','Aziz','Rahman','Farouk','Bakr','Qasim']},
 turc:{M:['Mehmet','Mustafa','Ahmet','Emre','Murat','Burak','Rustam','Timur','Aziz','Rashid'],F:['Ayşe','Elif','Zeynep','Fatma','Emine','Merve','Dilnoza','Gulnara','Madina','Aylin'],S:['Yılmaz','Kaya','Demir','Şahin','Çelik','Aliyev','Karimov','Rahimov','Öztürk','Arslan']},
 pers:{M:['Reza','Ali','Hossein','Mehdi','Amir','Ahmad','Imran','Bilal','Farhad','Dariush'],F:['Zahra','Fatemeh','Maryam','Sara','Ayesha','Shirin','Parisa','Nazanin','Hina','Sana'],S:['Hosseini','Mohammadi','Rezaei','Karimi','Ahmadi','Khan','Hussain','Qureshi','Jafari','Ahmadzai']},
 chin:{M:['Wei','Jun','Hao','Lei','Ming','Jian','Chen','Yong','Bo','Tao','Bat','Ganbold'],F:['Li','Mei','Xiu','Fang','Yan','Jing','Ling','Hui','Na','Ying','Oyun','Sarnai'],S:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Lin','Tan']},
 japo:{M:['Haruto','Sota','Yuto','Ren','Takumi','Kenji','Hiroshi','Daiki','Riku','Kaito'],F:['Yui','Aoi','Hina','Sakura','Yuna','Mio','Rin','Haruka','Emi','Nanami'],S:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato']},
 core:{M:['Min-jun','Seo-jun','Ji-ho','Hyun-woo','Joon-young','Dong-hyun','Sung-min','Tae-yang'],F:['Seo-yeon','Ji-woo','Min-seo','Ha-eun','Soo-ah','Ji-min','Yuna','Eun-ji'],S:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim']},
 indi:{M:['Aarav','Arjun','Rahul','Vikram','Rohan','Amit','Sanjay','Ravi','Karan','Anil','Rajesh','Tenzin'],F:['Priya','Ananya','Diya','Kavya','Pooja','Neha','Aisha','Sunita','Meera','Lakshmi','Riya','Pema'],S:['Sharma','Patel','Singh','Kumar','Gupta','Reddy','Iyer','Das','Rahman','Perera','Shrestha','Chowdhury']},
 seas:{M:['Budi','Agus','Rizal','Nguyen','Minh','Somchai','Arif','Jose','Mark','Hafiz','Thant','Sok'],F:['Siti','Dewi','Putri','Linh','Mai','Ploy','Nurul','Maria','Angel','Aye','Sreymom','Ratna'],S:['Santoso','Wijaya','Nguyen','Tran','Pham','Chaiyaporn','Abdullah','Reyes','Santos','Bautista','Win','Sok']},
 afri:{M:['Kwame','Chinedu','Oluwaseun','Tendai','Thabo','Abebe','Juma','Musa','Emeka','Kofi','Baraka','Sipho'],F:['Amara','Ngozi','Chiamaka','Zanele','Wanjiru','Abena','Thandiwe','Nia','Imani','Adaeze','Makena','Lindiwe'],S:['Okafor','Adeyemi','Mensah','Mwangi','Ndlovu','Kamau','Okoye','Banda','Tshabalala','Owusu','Bekele','Moyo']},
 hebr:{M:['Noam','Ariel','Yosef','Daniel','Itai','Eitan','Omer','Amit'],F:['Noa','Tamar','Maya','Yael','Shira','Talia','Avigail','Michal'],S:['Cohen','Levi','Mizrahi','Peretz','Biton','Friedman','Katz','Azoulay']}
};
const cultOf=nid=>(N0[nid]&&NAMES[N0[nid].cult])?N0[nid].cult:'hisp';
const rndFirst=(sex,c)=>pick(NAMES[c||'hisp'][sex==='F'?'F':'M']);
const rndSur=c=>pick(NAMES[c||'hisp'].S);
const rndName=nid=>{const c=cultOf(nid);return rndFirst(chance(.5)?'M':'F',c)+' '+rndSur(c);};

/* ===== CARRERAS (sueldos = múltiplos de salarios reales OIT del país) ===== */
const TRACKS={
 politica:{name:'Política',ranks:['Activista','Regidor','Diputado','Senador','Ministro'],k:[0.5,2,4,5,6],base:'T',yrs:[2,3,3,4],inf:[18,32,46,58],int:[40,45,50,55],bonus:'Derecho'},
 militar:{name:'Militar',ranks:['Recluta','Cabo','Sargento','Teniente','Capitán','Coronel','General'],k:[0.6,0.8,1,1.3,1.7,2.3,3.5],base:'0',yrs:[1,2,2,3,3,4],inf:[0,8,15,25,35,46],int:[0,0,30,40,45,50],bonus:'Academia Militar'},
 negocios:{name:'Negocios',ranks:['Empleado','Gerente','Emprendedor','Empresario','Magnate'],k:[1,1,1,1,1],base:'biz',yrs:[2,3,3,4],inf:[0,8,18,32],int:[35,45,50,55],money:[0,0,3,30],bonus:'Economía'}
};
const BIZ=[['4',1],['1',1],['T',[0.3,4]],['T',[3,10]],['T',[20,80]]];
const JOBS=[
 {name:'Mesero',o:'5',k:1},{name:'Obrero',o:'8',k:1},{name:'Vendedor',o:'5',k:1},{name:'Albañil',o:'7',k:1},{name:'Campesino',o:'6',k:1},
 {name:'Oficinista',o:'4',k:1},{name:'Policía',o:'5',k:1.15,req:{salud:50}},{name:'Técnico',o:'3',k:1,req:{inteligencia:50}},
 {name:'Profesor',o:'2',k:0.8,req:{degree:'*'}},{name:'Programador',o:'2',k:1.1,req:{inteligencia:60}},
 {name:'Ingeniero',o:'2',k:1.15,req:{degree:'Ingeniería'}},{name:'Abogado',o:'2',k:1.3,req:{degree:'Derecho'}},{name:'Médico',o:'2',k:1.6,req:{degree:'Medicina'}}];
const MAJORS=[{n:'Derecho',y:4,int:45},{n:'Economía',y:4,int:45},{n:'Ingeniería',y:4,int:55},{n:'Medicina',y:6,int:60},{n:'Academia Militar',y:4,int:40}];
const RULE_TXT={no:'sin reelección',alt:'reelección no consecutiva',max2:'máximo 2 periodos seguidos',ilim:'reelección sin límite'};

/* ===== ENFERMEDADES (modo Realista) ===== */
const COND={
 hta:{n:'Hipertensión',h:1.2,ht:1.04,cost:0.03,inc:a=>a<35?0:0.008+0.0016*(a-35)},
 diab:{n:'Diabetes tipo 2',h:1.4,ht:1.12,cost:0.07,inc:a=>a<30?0:0.0015+0.00025*(a-30)},
 card:{n:'Enfermedad del corazón',h:1.9,ht:1.3,cost:0.2,inc:a=>a<45?0:0.0015*Math.exp((a-45)/14)},
 canc:{n:'Cáncer',h:5,ht:1.8,cost:1.2,inc:a=>a<35?0.0003:0.0015*Math.exp((a-40)/15)}
};

let G=null,P=null;
const news=[];
let CACHE={};
const invalidate=()=>{CACHE={};};

/* ===== MUNDO ===== */
const armyIdx=milx=>clamp(100*Math.pow(Math.max(milx,1e6)/1e12,0.4),1.5,100);
const ecoIdx=gdp=>clamp(100*Math.pow(Math.max(gdp,1e8)/3e13,0.35),1,100);
const milxOf=army=>1e12*Math.pow(army/100,2.5);
function newWorld(mode){
  const nations={},regions={},byN={};
  for(const rid in RG)(byN[RG[rid].n]||(byN[RG[rid].n]=[])).push(rid);
  const ids=Object.keys(N0).filter(id=>byN[id]);
  ids.forEach((id,i)=>{const d=N0[id];
    nations[id]={id,name:d.nm,color:`hsl(${Math.round((i*137.508)%360)} ${48+(i%3)*8}% ${44+((i*7)%4)*4}%)`,
      army:armyIdx(d.milx),stab:d.stab,stab0:d.stab,allies:[],gov:'democracia',leader:rndName(id),alive:true,
      infl:d.infl,price:1,g:d.gdpg,rate:d.lend,approval:RI(35,60),congress:RI(35,60),
      nextElec:2026+RI(1,d.term),term:d.term,rule:d.rule,gdp:d.gdp,pop:d.pop,trade:0,sanc:0,rec:0};
    const rs=byN[id];const pw=r=>Math.pow(RG[r].pop,.75);const cp=rs.reduce((s,r)=>s+pw(r),0),ar=rs.reduce((s,r)=>s+RG[r].area,0)||1;
    // población real (Wikidata) donde existe; el resto se estima por ciudades y superficie
    const est=r=>cp>0?0.55*pw(r)/cp+0.45*RG[r].area/ar:RG[r].area/ar;
    const known=rs.filter(r=>RG[r].wp>0),unk=rs.filter(r=>!(RG[r].wp>0));
    let kw=known.reduce((s,r)=>s+RG[r].wp,0)/d.pop;const ue=unk.reduce((s,r)=>s+est(r),0);
    const room=unk.length?Math.max(Math.min(ue,0.5),0.02*unk.length):0;const kf=kw>0?(unk.length?Math.min(1,(1-room)/kw):1/kw):0;
    rs.forEach(r=>{const sh=Math.max(2e-5,RG[r].wp>0?RG[r].wp/d.pop*kf:(ue>0?est(r)/ue*(known.length?Math.max(0,1-kw*kf):1):0));
      regions[r]={o:id,w0:id,gdp:d.gdp*sh,pop:d.pop*sh,g0:d.gdp*sh,p0:d.pop*sh};});
  });
  return {ver:3,mode:mode||'rapido',nations,regions,wars:[],year:2026,conquest:null,sel:null};
}
let BASE=null;function regionBase(){if(!BASE){const w=newWorld('rapido');BASE={};for(const r in w.regions)BASE[r]=[w.regions[r].g0,w.regions[r].p0];}return BASE;}
function packG(g){const R={};for(const id in g.regions){const r=g.regions[id];const a=[r.o,Math.round(r.gdp),Math.round(r.pop)];const x={};if(r.hap!=null)x.h=Math.round(r.hap);if(r.dev!=null)x.d=Math.round(r.dev*10);if(r.cores)x.c=r.cores;if(r.hb)x.hb=r.hb;if(r.gwu)x.gw=r.gwu;if(r.plY)x.pl=r.plY;const ex=Object.keys(x).length>0;
  if(r.cq!=null||r.b||ex)a.push(r.cq==null?0:r.cq);if(r.b||ex)a.push(r.b||0);if(ex)a.push(x);R[id]=a;}
  const o={};for(const k in g)if(k!=='regions'&&k[0]!=='_')o[k]=g[k];o.R=R;o._ov=g._ov;return o;}
function unpackG(o){if(!o.R)return o;const B=regionBase();const g={};for(const k in o)if(k!=='R')g[k]=o[k];g.regions={};
  for(const id in o.R){const a=o.R[id];const b=B[id]||[a[1],a[2]];g.regions[id]={o:a[0],w0:RG[id]?RG[id].n:a[0],gdp:a[1],pop:a[2],g0:b[0],p0:b[1]};if(a[3])g.regions[id].cq=a[3];if(a[4])g.regions[id].b=a[4];const x=a[5];if(x){const q=g.regions[id];if(x.h!=null)q.hap=x.h;if(x.d!=null)q.dev=x.d/10;if(x.c)q.cores=x.c;if(x.hb)q.hb=x.hb;if(x.gw)q.gwu=x.gw;if(x.pl)q.plY=x.pl;}}
  if(typeof migrateSplit==='function')migrateSplit(g);
  return g;}
function ownMap(){if(!CACHE.own){const m={};for(const id in G.regions){const o=G.regions[id].o;(m[o]||(m[o]=[])).push(id);}CACHE.own=m;}return CACHE.own;}
const regionsOf=nid=>ownMap()[nid]||[];
function neighborsOf(nid){CACHE.nb=CACHE.nb||{};if(CACHE.nb[nid])return CACHE.nb[nid];const s=new Set();
  regionsOf(nid).forEach(r=>RG[r].adj.forEach(a=>{const o=G.regions[a]&&G.regions[a].o;if(o&&o!==nid)s.add(o);}));return CACHE.nb[nid]=[...s];}
function natTotals(){const t={};for(const id in G.regions){const r=G.regions[id];const x=t[r.o]||(t[r.o]={gdp:0,pop:0});x.gdp+=r.gdp;x.pop+=r.pop;}
  for(const id in G.nations){const n=G.nations[id];const x=t[id];if(x){n.gdp=x.gdp;n.pop=x.pop;}}}
const natOf=p=>G.nations[G.regions[p.r].o];
const regOf=p=>G.regions[p.r];
const eco=n=>ecoIdx(n.gdp);
const gdppc=n=>n.gdp/Math.max(n.pop,1);
const power=nid=>{const n=G.nations[nid];return n.army*(0.85+0.15*Math.min(2,eco(n)/50));};
const warsOf=nid=>G.wars.filter(w=>w.a===nid||w.b===nid);
const warBetween=(a,b)=>G.wars.find(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));
const enemyIn=(w,nid)=>w.a===nid?w.b:w.a;
const playerRules=nid=>P&&P.alive&&P.ruler&&natOf(P).id===nid;
const fullName=p=>p.first+' '+p.surname;
function pushNews(t,cls){news.push({t,cls:cls||'news'});}
function capitalOf(nid){const C=CACHE.cap||(CACHE.cap={});if(C[nid]!==undefined)return C[nid];const rs=regionsOf(nid);return C[nid]=rs.find(r=>RG[r].cap&&RG[r].n===nid)||rs.slice().sort((a,b)=>G.regions[b].pop-G.regions[a].pop)[0];}
function shockGDP(nid,f){regionsOf(nid).forEach(r=>{G.regions[r].gdp*=f;});const n=G.nations[nid];if(n)n.gdp*=f;}

/* ===== ECONOMÍA PERSONAL ===== */
const prosp=r=>(r.p0>0&&r.pop>0&&r.g0>0)?(r.gdp/r.pop)/(r.g0/r.p0):1;
const priceOf=p=>isReal()?natOf(p).price:1;
function W(p,occ){const r=regOf(p);const d=N0[r.w0];return (d.w[occ]||d.w.T)*prosp(r)*priceOf(p);}
const U=p=>W(p,'T'); // salario medio anual de tu región (OIT)
function bizRoll(p){const b=BIZ[p.career.rank];p.bizK=Array.isArray(b[1])?R(b[1][0],b[1][1]):b[1];}
function trackPay(p){const c=p.career,T=TRACKS[c.track];
  if(c.track==='negocios'){const b=BIZ[c.rank];if(p.bizK==null)bizRoll(p);return W(p,b[0])*p.bizK;}
  return W(p,T.base)*T.k[c.rank];}
function jobPay(p,j){j=j||p.job;return W(p,j.o)*j.k*(j.bonus||1);}
function grossIncome(p){
  if(p.prison)return 0;const n=natOf(p);
  if(p.ruler)return U(p)*(n.gov==='dictadura'?25:8);
  if(p.career.track)return trackPay(p);
  if(p.job)return jobPay(p);
  if(p.pension)return p.pension*U(p);
  return 0;}
function taxOf(p,inc){if(!isReal()||inc<=0)return 0;const t=clamp(N0[regOf(p).w0].tax*1.5,6,30)/100,T=U(p);
  const br=[[0.5*T,0.3],[1.5*T,1],[4*T,1.5],[Infinity,2]];let tax=0,prev=0;
  for(const [lim,k] of br){if(inc>prev){tax+=(Math.min(inc,lim)-prev)*t*k;}prev=lim;}return tax;}
function livingCost(p){
  if(p.age<18||(p.age<23&&p.edu.uni))return 0;
  const W9=W(p,'9'),gi=grossIncome(p);let c=gi>0?0.55*W9+0.22*gi:(isReal()?0.3*W9:0); // sin ingresos: vives con tu familia
  if(p.house)c-=0.2*W9;
  c+=p.children.filter(k=>k.age<22).length*0.18*W9;
  if(p.partner)c+=0.12*W9;
  if(isReal())p.cond.forEach(x=>{if(x.t)c+=COND[x.k].cost*U(p)*(x.pub?0.25:1);});
  if(p.prison)c=0;
  return c;}
function debtPay(p){return p.debts.reduce((s,d)=>s+Math.min(d.pay,d.bal*(1+d.rate)),0);}
function netIncome(p){const g=grossIncome(p);return g-taxOf(p,g)-livingCost(p)-(isReal()?debtPay(p):0);}
function annuity(P0,r,n){return r===0?P0/n:P0*r/(1-Math.pow(1+r,-n));}
function netWorth(p){return p.dinero+(p.house?p.house.val:0)-p.debts.reduce((s,d)=>s+d.bal,0)+(p.inv||[]).reduce((s,v)=>s+v.val,0)+(p.assets||[]).reduce((s,a)=>s+a.val,0)+(p.biz?(p.biz.last||0)*3:0);}

/* ===== PERSONAJE ===== */
function newPlayer(o){
  const cult=cultOf(G.regions[o.r].w0);
  const p={first:o.first,surname:o.surname,sex:o.sex,age:0,r:o.r,alive:true,cult,
    s:{salud:RI(70,95),felicidad:RI(60,90),inteligencia:RI(20,75),apariencia:RI(20,90),influencia:0},
    dinero:0,career:{track:null,rank:0,years:0},job:null,pension:0,edu:{uni:null,uniYears:0,degree:null},
    parents:[{name:rndFirst('M',cult)+' '+o.surname,role:'Padre',age:RI(24,36),alive:true,rel:RI(55,90)},{name:rndFirst('F',cult)+' '+rndSur(cult),role:'Madre',age:RI(22,34),alive:true,rel:RI(60,95)}],
    siblings:[],partner:null,married:false,children:[],ruler:false,rulerYears:0,terms:0,lastTermEnd:-99,actions:3,nat:2,gen:o.gen||1,log:[],event:null,seen:{},deathCause:null,startYear:G.year,
    cond:[],debts:[],house:null,late:0,bankrupt:0,corrupt:0,prison:0,bizK:null,inv:[],biz:null,ppl:[],sch:{g:7,club:null},assets:[],amb:null,ach:[],born:G.regions[o.r].w0,annexed:0,built:0};p.edu.degrees=[];
  if(o.age>=18){p.age=18;p.s.inteligencia=clamp(p.s.inteligencia+10,0,100);p.dinero=0.3*U(p);p.parents.forEach(x=>x.age+=18);}
  return p;
}
function log(t,c){P.log.push({y:G.year,a:P.age,t,c:c||''});if(P.log.length>400)P.log.splice(0,P.log.length-400);}
function fix(p){for(const k in p.s)p.s[k]=Math.round(clamp(p.s[k],0,100));if(!isFinite(p.dinero))p.dinero=0;}
function careerTitle(p){if(p.ruler&&typeof rulerTitle==='function')return rulerTitle(p,natOf(p));
  const n=natOf(p);
  if(p.prison)return p.sex==='F'?'En prisión':'En prisión';
  if(p.ruler)return n.gov==='dictadura'?(p.sex==='F'?'Dictadora':'Dictador'):(p.sex==='F'?'Presidenta':'Presidente');
  if(p.edu.uni)return `Estudiante de ${p.edu.uni}`;
  if(p.career.track)return TRACKS[p.career.track].ranks[p.career.rank];
  if(p.job)return p.job.name;
  if(p.age<6)return p.age<2?'Bebé':(p.sex==='F'?'Niña':'Niño');
  if(p.age<18)return 'Estudiante';
  if(p.pension)return p.sex==='F'?'Jubilada':'Jubilado';
  return p.sex==='F'?'Desempleada':'Desempleado';
}
function clearPower(p,why){
  if(p.ruler){p.ruler=false;p.lastTermEnd=G.year;natOf(p).leader=rndName(natOf(p).id);if(why)log(why,'bad');}
  if(p.career.track==='politica'||p.career.track==='militar')p.career={track:null,rank:0,years:0};
}
function becomeRuler(p,gov){const n=natOf(p);p.ruler=true;p.rulerYears=0;p.terms=(G.year-p.lastTermEnd<=1&&gov==='democracia')?p.terms+1:1;n.gov=gov;n.leader=fullName(p);p.career={track:null,rank:0,years:0};p.job=null;p.s.influencia=clamp(p.s.influencia+10,0,100);
  if(gov==='democracia'){n.nextElec=G.year+n.term;n.congress=clamp(n.approval+R(-8,12),20,80);}
  log(`Ahora gobiernas ${n.name} como ${careerTitle(p)}.`,'big');}
function moveTo(p,nid){const r=capitalOf(nid);if(!r)return;p.r=r;G.sel=r;clearPower(p);}
function canRun(p){const n=natOf(p);if(!isReal())return true;
  if(n.rule==='no')return p.terms===0&&!p.ruler;
  if(n.rule==='alt')return !(p.ruler||G.year-p.lastTermEnd<=1);
  if(n.rule==='max2')return !(p.ruler&&p.terms>=2);
  return true;}

/* ===== MUNDO: SIMULACIÓN ===== */
function batchSize(w,lose){const n0=lose===w.a?w.na0:w.nb0;return clamp(Math.round((n0||regionsOf(lose).length)/(isReal()?6:4)),1,12);}
function annex(win,lose,silent,k){
  const W_=G.nations[win],L=G.nations[lose];k=k||1;
  const wr=new Set(regionsOf(win));const cap=capitalOf(lose);const taken=[];
  for(let i=0;i<k;i++){
    const lr=regionsOf(lose);if(!lr.length)break;
    let cand=lr.filter(r=>RG[r].adj.some(a=>wr.has(a)));if(!cand.length)cand=lr;
    cand.sort((x,y)=>(x===cap)-(y===cap)||G.regions[y].pop-G.regions[x].pop);
    const rid=cand[0];if(bl(rid,'fort')&&chance(.3*bl(rid,'fort'))){if(G.regions[rid].b.fort>0&&chance(.3))G.regions[rid].b.fort--;continue;}
    transfer(rid,win);wr.add(rid);taken.push(rid);if(playerRules(win))P.annexed=(P.annexed||0)+1;
    L.stab=clamp(L.stab-(rid===cap?12:1.5),0,100);
  }
  if(!taken.length)return taken;
  W_.stab=clamp(W_.stab+2,0,100);
  if(!silent)pushNews((taken.length>1?`${W_.name} conquistó ${taken.length} provincias de ${L.name}, entre ellas ${RG[taken[0]].nm}.`:`${W_.name} conquistó ${RG[taken[0]].nm} (antes de ${L.name}).`));
  checkGone(lose);return taken;
}
function transfer(rid,to){const r=G.regions[rid];const from=r.o,A=G.nations[from],B=G.nations[to];A.gdp-=r.gdp;A.pop-=r.pop;r.o=to;G._ov=(G._ov||0)+1;r.gdp*=0.9;r.pop*=0.985;B.gdp+=r.gdp;B.pop+=r.pop;r.cq=G.year;if(G.occ)delete G.occ[rid];invalidate();onTransfer(rid,from,to);
  if(P&&P.alive&&P.r===rid)G.conquest={from:G.nations[from].name,to};}
function checkGone(lose){const L=G.nations[lose];if(!regionsOf(lose).length&&L.alive){L.alive=false;G.wars=G.wars.filter(w=>w.a!==lose&&w.b!==lose);CACHE.wk=null;CACHE.fr=null;Object.values(G.nations).forEach(n=>n.allies=n.allies.filter(a=>a!==lose));pushNews(`${L.name} desaparece del mapa.`,'bad');if(typeof onGone==='function')onGone(lose);}}
function allyPower(nid,w){const foe=enemyIn(w,nid);return (typeof friendsOf==='function'&&G.dip?[...friendsOf(nid)].filter(x=>x!==nid):G.nations[nid].allies).filter(a=>G.nations[a].alive&&a!==foe).reduce((s,a)=>s+power(a),0);}
function battleYear(w){ // modo Rápido: una batalla por año
  const A=G.nations[w.a],B=G.nations[w.b];if(!A.alive||!B.alive)return;
  const pa=power(w.a)*R(.75,1.25)+allyPower(w.a,w)*.3,pb=power(w.b)*1.15*R(.75,1.25)+allyPower(w.b,w)*.3;
  const d=R(40,70);
  if(pa>=pb){w.score+=d;B.army-=R(2,5);A.army-=R(.5,2);B.stab-=3;}else{w.score-=d;A.army-=R(2,5);B.army-=R(.5,2);A.stab-=3;}
  A.army=Math.max(1.5,A.army);B.army=Math.max(1.5,B.army);w.years++;
  if(w.score>=100){annex(w.a,w.b,false,batchSize(w,w.b));w.score-=100;}else if(w.score<=-100){annex(w.b,w.a,false,batchSize(w,w.a));w.score+=100;}
}
function battleMonths(w){ // modo Realista: 12 meses con abastecimiento, moral y desgaste
  const A=G.nations[w.a],B=G.nations[w.b];if(!A.alive||!B.alive)return;
  w.ma=w.ma||1;w.mb=w.mb||1;let wonA=0,taken=[];
  for(let m=0;m<12;m++){
    if(!G.nations[w.a].alive||!G.nations[w.b].alive||!G.wars.includes(w))break;
    const supA=clamp(0.55+0.45*eco(A)/(eco(A)+eco(B))+(A.stab-50)/300-A.sanc*0.08,.3,1.2);
    const supB=clamp(0.55+0.45*eco(B)/(eco(A)+eco(B))+(B.stab-50)/300-B.sanc*0.08,.3,1.2);
    const sa=power(w.a)*w.ma*supA*R(.8,1.2)+allyPower(w.a,w)*.25,sb=power(w.b)*1.15*w.mb*supB*R(.8,1.2)+allyPower(w.b,w)*.25;
    const x=(sa-sb)/(sa+sb);w.score+=x*12;
    if(x>0){wonA++;w.ma=clamp(w.ma+.03,.4,1.3);w.mb=clamp(w.mb-.04,.4,1.3);}else{w.ma=clamp(w.ma-.04,.4,1.3);w.mb=clamp(w.mb+.03,.4,1.3);}
    A.army=Math.max(1.5,A.army-R(.05,.25)*(x<0?1.6:1));B.army=Math.max(1.5,B.army-R(.05,.25)*(x>0?1.6:1));
    A.stab-=.25;B.stab-=.25;
    if(w.score>=100){annex(w.a,w.b,true,batchSize(w,w.b)).forEach(()=>taken.push([w.a,w.b]));w.score-=100;}else if(w.score<=-100){annex(w.b,w.a,true,batchSize(w,w.a)).forEach(()=>taken.push([w.b,w.a]));w.score+=100;}
  }
  w.years++;A.stab=clamp(A.stab,0,100);B.stab=clamp(B.stab,0,100);
  const mine=P&&P.alive&&(natOf(P).id===w.a||natOf(P).id===w.b);
  if(mine){const me=natOf(P).id,won=me===w.a?wonA:12-wonA;pushNews(`Guerra con ${G.nations[enemyIn(w,me)].name}: tu país ganó ${won} de 12 meses de combate. Moral ${Math.round((me===w.a?w.ma:w.mb)*100)} %.`,won>=6?'good':'bad');}
  const cnt={};taken.forEach(([a])=>cnt[a]=(cnt[a]||0)+1);
  for(const a in cnt){const b=a===w.a?w.b:w.a;pushNews(`${G.nations[a].name} tomó ${cnt[a]} provincia(s) de ${G.nations[b].name} este año.`);}
}
function declareWar(a,b){if(warBetween(a,b))return;CACHE.wk=null;CACHE.fr=null;G.wars.push({a,b,score:0,years:0,ma:1,mb:1,na0:regionsOf(a).length,nb0:regionsOf(b).length});G.nations[a].allies=G.nations[a].allies.filter(x=>x!==b);G.nations[b].allies=G.nations[b].allies.filter(x=>x!==a);
  pushNews(`${G.nations[a].name} declara la guerra a ${G.nations[b].name}.`,'bad');
  if(isReal()&&G.nations[a].gdp<G.nations[b].gdp*3&&chance(.5)){G.nations[a].sanc=Math.max(G.nations[a].sanc,RI(3,6));pushNews(`Varios países imponen sanciones comerciales a ${G.nations[a].name}.`);}
  if(typeof onWarDeclared==='function')onWarDeclared(a,b);}
function makePeace(w,quiet){G.wars=G.wars.filter(x=>x!==w);CACHE.wk=null;if(w.mando&&typeof onPeace==='function')onPeace(w);if(!quiet)pushNews(`Paz entre ${G.nations[w.a].name} y ${G.nations[w.b].name}.`,'good');}
function simWorld(){
  natTotals();
  const alive=Object.values(G.nations).filter(n=>n.alive);
  const real=isReal();
  alive.forEach(n=>{
    const d=N0[n.id];const war=warsOf(n.id).length>0;
    // crecimiento económico real
    let g=typeof econG==='function'?econG(n,d):0.5*clamp(d.gdpg,-2,7)+0.5*2.2+R(-1.6,1.6);
    if(real){if(n.rec>0){g-=R(2.5,5.5);n.rec--;}else if(chance(.07)){n.rec=RI(1,2);if(P&&P.alive&&natOf(P).id===n.id)pushNews(`Recesión en ${n.name}: la economía se contrae.`,'bad');}}
    if(war)g-=R(1,3);if(n.sanc>0){g-=2;n.sanc--;}if(n.trade>0){g+=0.8;n.trade--;}
    if(n.stab<25)g-=1.2;
    if(typeof ecoBonus==='function')g+=ecoBonus(n);
    const pg=typeof popG==='function'?popG(n,d):clamp(d.popg,-1,4);n.g=g+pg;const f=1+g/100,pf=1+pg/100;
    let sg=0,sp=0;regionsOf(n.id).forEach(r=>{const x=G.regions[r];const b=provBonus(r);x.gl=g/100+b;x.gdp*=f*pf*(1+b);x.pop*=pf*(typeof provPop9==='function'?provPop9(x):1);sg+=x.gdp;sp+=x.pop;});n.gdp=sg;n.pop=sp;
    aiBuild(n);if(playerRules(n.id)){if(typeof budgetYear==='function')budgetYear(n);else n.treas=(n.treas||0)+treasuryIncome(n);}
    // inflación (solo Realista)
    if(real){const anchor=clamp(d.infl,0.5,30);n.infl=clamp(n.infl*0.6+anchor*0.4+R(-1.5,1.5)+(war?2:0)+(n.rec>0?-1:0),-2,200);n.price*=1+n.infl/100;}
    n.stab=clamp(n.stab+(war?-2:0)+(n.stab0-n.stab)*.06+R(-2,2),0,100);
    if(n.army>eco(n)*1.3)n.army-=0.6;else if(!war&&n.army<armyIdx(d.milx)*0.9&&!playerRules(n.id))n.army+=0.6;
    // elecciones de IA
    if(n.nextElec<=G.year&&n.gov==='democracia'){n.nextElec=G.year+n.term;if(!playerRules(n.id)&&!(P&&P.alive&&natOf(P).id===n.id&&P.career.track==='politica'))if(chance(.5))n.leader=rndName(n.id);}
  });
  // convergencia de regiones anexadas hacia el nivel del nuevo dueño
  for(const id in G.regions){const r=G.regions[id];if(r.o!==r.w0){const own=G.nations[r.o];const d=(gdppc(own)*r.pop-r.gdp)*0.03;r.gdp+=d;own.gdp+=d;}}
  if(typeof worldMonths==='function')worldMonths();else [...G.wars].forEach(w=>{if(w.mando)return;(real?battleMonths:battleYear)(w);});
  [...G.wars].forEach(w=>{
    if(!G.wars.includes(w))return;if(playerRules(w.a)||playerRules(w.b))return;
    const lowArmy=Math.min(G.nations[w.a].army,G.nations[w.b].army)<3;
    if(chance(lowArmy?.5:.08+.05*w.years)){if(w.mando){mandoAIPeace(w);return;}if(Math.abs(w.score)>=50){const win=w.score>0?w.a:w.b,lo=win===w.a?w.b:w.a;annex(win,lo,false,Math.ceil(batchSize(w,lo)/2));}if(G.wars.includes(w))makePeace(w);}
  });
  alive.forEach(n=>{
    if(!n.alive||playerRules(n.id)||warsOf(n.id).length)return;
    for(const m of neighborsOf(n.id)){
      if(n.allies.includes(m)||warBetween(n.id,m)||!G.nations[m].alive)continue;if(typeof aiMayAttack==='function'&&!aiMayAttack(n.id,m))continue;
      if(power(n.id)>=2*power(m)&&chance(n.stab<35?.002:.0008)){declareWar(n.id,m);break;}
    }
  });
  alive.forEach(n=>{
    if(!n.alive)return;if(P&&P.alive&&natOf(P).id===n.id)return;
    if(n.stab<15&&chance(.05)){n.gov='dictadura';n.leader=rndName(n.id);n.stab+=15;pushNews(`Golpe de Estado en ${n.name}: ${n.leader} toma el poder.`,'bad');}
    else if(n.gov==='dictadura'&&n.stab>55&&chance(.03)){n.gov='democracia';n.leader=rndName(n.id);n.nextElec=G.year+n.term;pushNews(`${n.name} vuelve a la democracia.`,'good');}
  });
  natTotals();
}

/* ===== EVENTOS ===== */
const atWar=p=>warsOf(natOf(p).id).length>0;
const inSet=(p,arr)=>arr.includes(regOf(p).w0);
const SISMO=['MEX','JPN','CHL','PER','ECU','COL','IDN','PHL','TUR','IRN','NPL','CHN','ITA','GRC','GTM','SLV','NIC','CRI','NZL','PAK','AFG','TWN','USA','HTI','MMR'];
const HURACAN=['MEX','USA','CUB','DOM','HTI','JAM','HND','NIC','GTM','BLZ','BHS','PHL','JPN','CHN','TWN','VNM','BGD','IND','MMR','MOZ','MDG','KOR'];
const SEQUIA=['AUS','ESP','MAR','DZA','IRN','AFG','SYR','IRQ','MEX','ARG','BRA','IND','PAK','ETH','SOM','KEN','SDN','NER','MLI','TCD','ZAF','ZWE','ZMB','MWI','MOZ','MDG','AGO','NAM','BWA'];
const EV=[
 {id:'conquista',prio:1,pr:1,when:p=>!!G.conquest,
  text:p=>`${G.nations[G.conquest.to].name} conquistó tu provincia (${RG[p.r].nm}). ${G.conquest.from} ya no gobierna donde vives.`,
  opts:p=>[{t:'Aceptar el nuevo gobierno',go:p=>{clearPower(p,'Pierdes tu cargo.');G.conquest=null;p.s.felicidad-=10;return 'Aceptas el nuevo gobierno y sigues con tu vida.';}},
   {t:'Unirte a la resistencia',go:p=>{G.conquest=null;clearPower(p);if(chance(.25)){p.s.salud-=40;return 'Te hieren gravemente en una emboscada.';}p.s.influencia+=12;return 'Te vuelves una figura de la resistencia.';}},
   {t:'Exiliarte a un país vecino',go:p=>{const t=pick(neighborsOf(natOf(p).id).filter(x=>!warBetween(x,natOf(p).id)&&G.nations[x].alive))||null;G.conquest=null;if(!t)return 'No encuentras a dónde huir.';moveTo(p,t);p.s.felicidad-=12;return `Te exilias en ${G.nations[t].name}.`;}}]},
 {id:'juicio',prio:1,pr:1,gap:3,when:p=>isReal()&&p.corrupt>0&&!p.prison&&(natOf(p).gov==='democracia'||!p.ruler)&&chance(clamp(.05*p.corrupt*(p.ruler?.6:1),0,.5)),
  text:p=>`La fiscalía abre un juicio por corrupción en tu contra (${p.corrupt} caso(s) en tu historial).`,
  opts:p=>[{t:`Contratar abogados (${fmt(2*U(p))})`,go:p=>{p.dinero-=2*U(p);if(chance(clamp(.45+p.s.influencia/250,.3,.85))){p.corrupt=Math.max(0,p.corrupt-1);p.s.influencia-=5;return 'Te absuelven por falta de pruebas.';}return sentence(p);}},
   {t:'Negociar con la fiscalía',go:p=>{p.dinero-=1.5*U(p);p.corrupt=0;clearPower(p);p.job=null;p.career={track:null,rank:0,years:0};p.s.influencia-=20;return 'Pagas una multa, devuelves dinero y quedas inhabilitado para cargos públicos.';}},
   {t:'Huir del país',go:p=>{const t=pick(Object.values(G.nations).filter(n=>n.alive&&n.id!==natOf(p).id&&!neighborsOf(natOf(p).id).includes(n.id)));if(!t||chance(.3))return 'Te detienen en el aeropuerto. '+sentence(p);moveTo(p,t.id);p.corrupt=0;p.job=null;p.career={track:null,rank:0,years:0};p.s.felicidad-=15;return `Huyes a ${t.name}. Allá empiezas de cero.`;}}]},
 {id:'reclutamiento',prio:1,pr:.35,gap:5,when:p=>atWar(p)&&p.age>=18&&p.age<=40&&p.career.track!=='militar'&&!p.ruler&&!p.prison,
  text:p=>`${natOf(p).name} está en guerra y llega una carta de reclutamiento a tu nombre.`,
  opts:p=>[{t:'Presentarte al frente',go:p=>{p.career={track:'militar',rank:0,years:0};p.job=null;p.edu.uni=null;p.s.salud-=5;p.s.influencia+=3;return 'Te unes al ejército como Recluta.';}},
   {t:'Huir del país',go:p=>{const n=natOf(p);const t=pick(neighborsOf(n.id).filter(x=>!warBetween(x,n.id)&&G.nations[x].alive));if(!t){p.s.felicidad-=10;return 'Intentas huir pero cierran las fronteras.';}moveTo(p,t);p.s.felicidad-=15;p.s.influencia-=10;return `Huyes a ${G.nations[t].name}.`;}}]},
 {id:'eleccion',prio:1,pr:1,when:p=>!p.ruler&&!p.prison&&p.career.track==='politica'&&p.career.rank>=3&&natOf(p).gov==='democracia'&&(isReal()?natOf(p).nextElec===G.year+1&&canRun(p):G.year%6===0),
  text:p=>{const c=Math.round(candChance(p)*100);return `Elecciones en ${natOf(p).name}. Tu partido te ofrece la candidatura.`+(isReal()?` Encuesta: ${c} % de intención de voto a tu favor. Mandato de ${natOf(p).term} años, ${RULE_TXT[natOf(p).rule]}.`:'');},
  opts:p=>[{t:`Postularte (campaña ${fmt(3*U(p))})`,go:p=>{p.dinero-=3*U(p);const c=candChance(p);if(chance(c)){becomeRuler(p,'democracia');return `¡Ganas la elección! (${Math.round(c*100)} % de probabilidad a favor).`;}p.s.influencia-=5;return 'Pierdes la elección por poco.';}},
   {t:'No esta vez',go:p=>'Decides esperar a la próxima elección.'}]},
 {id:'reeleccion',prio:1,pr:1,when:p=>p.ruler&&natOf(p).gov==='democracia'&&(isReal()?natOf(p).nextElec<=G.year+1:G.year%6===0)&&p.rulerYears>=2,
  text:p=>{const n=natOf(p);const e_=Math.round(n.stab);return !isReal()?`Termina tu mandato. Estabilidad ${e_}/100.`:canRunAgain(p)?`Termina tu mandato. Estabilidad ${e_}/100, aprobación ${Math.round(n.approval)} %. Regla del país: ${RULE_TXT[n.rule]}.`:`Termina tu mandato. Estabilidad ${e_}/100, aprobación ${Math.round(n.approval)} %. Regla del país: ${RULE_TXT[n.rule]} — no puedes reelegirte.`;},
  opts:p=>[...(canRunAgain(p)?[{t:'Buscar la reelección',go:p=>{const n=natOf(p);const c=isReal()?clamp(n.approval/100*1.15-0.05,.05,.92):clamp((n.stab*.6+p.s.influencia*.4)/100,.05,.9);if(chance(c)){p.terms++;p.rulerYears=0;n.nextElec=G.year+(isReal()?n.term:6);n.congress=clamp(n.approval+R(-8,10),20,80);return `Te reeligen (${Math.round(c*100)} % a favor).`;}p.ruler=false;p.lastTermEnd=G.year;n.leader=rndName(n.id);n.nextElec=G.year+n.term;p.career={track:'politica',rank:3,years:0};return 'Pierdes la reelección y vuelves al Senado.';}}]:[]),
   {t:'Cancelar las elecciones',go:p=>{const n=natOf(p);n.gov='dictadura';n.stab-=20;p.s.influencia+=5;if(isReal()){n.sanc=Math.max(n.sanc,RI(3,8));}return 'Cancelas las elecciones. Ahora gobiernas como dictador.'+(isReal()?' Otros países te sancionan.':'');}},
   {t:'Entregar el poder',go:p=>{const n=natOf(p);p.ruler=false;p.lastTermEnd=G.year;n.leader=rndName(n.id);n.nextElec=G.year+n.term;p.career={track:'politica',rank:3,years:0};p.s.felicidad+=10;return 'Entregas el poder pacíficamente.';}}]},
 {id:'golpe_pais',prio:1,pr:.25,gap:6,when:p=>natOf(p).stab<25&&!p.ruler,
  text:p=>`Los militares intentan un golpe de Estado en ${natOf(p).name}.`,
  opts:p=>[{t:'Apoyar al gobierno',go:p=>{const n=natOf(p);if(chance(.6)){n.gov='dictadura';n.leader=rndName(n.id);n.stab+=15;p.s.influencia-=12;if(p.career.track==='politica')p.career.rank=Math.max(0,p.career.rank-2);return 'El golpe triunfa y te persiguen por apoyar al gobierno.';}n.stab+=10;p.s.influencia+=8;return 'El golpe fracasa; tu lealtad se recuerda.';}},
   {t:'Apoyar el golpe',go:p=>{const n=natOf(p);if(chance(.6)){n.gov='dictadura';n.leader=rndName(n.id);n.stab+=15;p.s.influencia+=10;return 'El golpe triunfa y el nuevo régimen te premia.';}p.s.influencia-=15;p.s.felicidad-=10;return 'El golpe fracasa y quedas marcado.';}},
   {t:'Mantenerte al margen',go:p=>{const n=natOf(p);if(chance(.6)){n.gov='dictadura';n.leader=rndName(n.id);n.stab+=15;}return 'Observas desde casa.';}}]},
 {id:'conspiracion',prio:1,pr:.12,gap:4,when:p=>p.ruler,text:p=>'Tus asesores detectan una conspiración dentro del gabinete.',
  opts:p=>[{t:'Purgar al gabinete',go:p=>{natOf(p).stab-=5;p.s.influencia+=5;return 'Destituyes a los conspiradores.';}},
   {t:'Negociar con ellos',go:p=>{if(chance(.2)){clearPower(p,'Te destituyen.');return 'La negociación fracasa y te quitan el poder.';}natOf(p).stab+=3;return 'Llegas a un acuerdo.';}}]},
 {id:'atentado',prio:1,pr:.06,gap:5,when:p=>p.ruler,text:p=>'Intento de asesinato durante un desfile.',
  opts:p=>[{t:'Seguir con el desfile',go:p=>{if(chance(.12)){p.s.salud=0;p.deathCause='en un atentado';return 'El atentado tiene éxito.';}p.s.influencia+=6;return 'Sobrevives y el pueblo te admira.';}},
   {t:'Cancelar y refugiarte',go:p=>{p.s.influencia-=3;return 'Cancelas todo y quedas a salvo.';}}]},
 {id:'rebelion',prio:1,pr:.3,gap:3,when:p=>p.ruler&&natOf(p).gov==='dictadura'&&natOf(p).stab<25,text:p=>'Estalla una rebelión armada contra tu régimen.',
  opts:p=>[{t:'Reprimir la rebelión',go:p=>{const n=natOf(p);n.army-=3;n.stab-=3;if(chance(.3)){clearPower(p,'Los rebeldes toman el palacio.');return 'Pierdes el poder.';}return 'Sofocas la rebelión.';}},
   {t:'Negociar reformas',go:p=>{natOf(p).stab+=12;p.s.influencia-=10;return 'Las reformas calman las calles.';}}]},
 {id:'oferta_paz',prio:1,pr:.25,gap:2,when:p=>p.ruler&&warsOf(natOf(p).id).some(w=>w.years>=3),
  text:p=>{const w=warsOf(natOf(p).id).find(w=>w.years>=3);return `${G.nations[enemyIn(w,natOf(p).id)].name} propone un alto al fuego.`;},
  opts:p=>[{t:'Aceptar la paz',go:p=>{const w=warsOf(natOf(p).id).find(w=>w.years>=3);if(w)makePeace(w);natOf(p).stab+=5;return 'Firmas la paz.';}},
   {t:'Seguir la guerra',go:p=>'Rechazas la propuesta.'}]},
 {id:'bancarrota',prio:1,pr:1,when:p=>isReal()&&p.late>=2,text:p=>`Llevas ${p.late} años sin poder pagar tus deudas (${fmt(p.debts.reduce((s,d)=>s+d.bal,0)+Math.max(0,-p.dinero))}). Los acreedores te demandan.`,
  opts:p=>[{t:'Declararte en bancarrota',go:p=>{const h=p.house?' Pierdes tu casa.':'';p.house=null;p.debts=[];p.dinero=0;p.late=0;p.bankrupt=7;p.s.felicidad-=15;p.s.influencia-=10;return 'Un juez liquida tus deudas.'+h+' No podrás pedir préstamos en 7 años.';}},
   {t:'Vender todo lo que tienes',go:p=>{if(p.house){p.dinero+=p.house.val*0.9;p.house=null;}payDebts(p);p.late=p.debts.length?1:0;p.s.felicidad-=8;return p.debts.length?'Vendes todo, pero aún debes dinero.':'Vendes todo y quedas sin deudas.';}}]},
 {id:'diagnostico',prio:1,pr:1,when:p=>isReal()&&!!p._dx,text:p=>`El médico te diagnostica: ${COND[p._dx].n}.`,
  opts:p=>{const k=p._dx,c=COND[k];const pubOk={'High income':.92,'Upper middle income':.72,'Lower middle income':.5,'Low income':.3}[N0[regOf(p).w0].inc]||.5;
   return [{t:`Tratamiento privado (${fmt(c.cost*U(p))}/año)`,go:p=>{p.cond.push({k,t:1,pub:0,y:G.year});p._dx=null;p.s.felicidad-=3;return 'Empiezas tratamiento con un especialista.';}},
    {t:'Sistema público de salud',go:p=>{p._dx=null;if(chance(pubOk)){p.cond.push({k,t:1,pub:1,y:G.year});return 'Te atienden en el sistema público.';}p.cond.push({k,t:0,pub:1,y:G.year});p.s.felicidad-=6;return 'La lista de espera es larga: por ahora no recibes tratamiento.';}},
    {t:'Ignorarlo',go:p=>{p.cond.push({k,t:0,pub:0,y:G.year});p._dx=null;return 'Decides no tratarte.';}}];}},
 {id:'sismo',pr:.5,when:p=>inSet(p,SISMO)&&p.age>=3,text:p=>`Un sismo fuerte sacude ${RG[p.r].nm}.`,
  opts:p=>[{t:'Ayudar en el rescate',go:p=>{p.s.influencia+=4;p.s.felicidad+=2;shockGDP(natOf(p).id,.995);if(chance(.15)){p.s.salud-=12;return 'Ayudas a rescatar vecinos, pero te lesionas.';}return 'Ayudas a rescatar a tus vecinos.';}},
   {t:'Proteger tu casa',go:p=>{shockGDP(natOf(p).id,.995);if(p.house&&chance(.3)){const l=p.house.val*.15;p.house.val-=l;return `Tu casa sufre daños por ${fmt(l)}.`;}return 'Tu familia sale ilesa.';}}]},
 {id:'huracan',pr:.5,when:p=>inSet(p,HURACAN)&&p.age>=3,text:p=>`Un huracán toca tierra cerca de ${RG[p.r].nm}.`,
  opts:p=>[{t:'Evacuar a tiempo',go:p=>{p.dinero-=0.05*U(p);return 'Evacúas con tu familia. Todos a salvo.';}},
   {t:'Quedarte a resguardar tus cosas',go:p=>{if(chance(.2)){p.s.salud-=12;return 'El agua inunda la casa y sales herido.';}return 'Pasa la tormenta sin daños mayores.';}}]},
 {id:'sequia',pr:.4,when:p=>inSet(p,SEQUIA)&&p.age>=12,text:p=>`Sequía severa en ${natOf(p).name}: suben los precios de los alimentos.`,
  opts:p=>[{t:'Recortar gastos',go:p=>{p.s.felicidad-=3;shockGDP(natOf(p).id,.99);return 'Ajustas tu presupuesto.';}},{t:'Comprar reservas de comida',go:p=>{p.dinero-=0.06*U(p);shockGDP(natOf(p).id,.99);return 'Llenas la despensa por si acaso.';}}]},
 {id:'pandemia',pr:.12,when:p=>p.age>=2&&(!G.pand||G.year-G.pand>30),text:p=>'Una nueva pandemia se extiende por el mundo.',
  opts:p=>[{t:'Encerrarte y vacunarte',go:p=>{G.pand=G.year;Object.values(G.nations).forEach(n=>n.alive&&shockGDP(n.id,.97));p.s.felicidad-=6;return 'Pasas meses encerrado, pero sano.';}},
   {t:'Seguir tu vida normal',go:p=>{G.pand=G.year;Object.values(G.nations).forEach(n=>n.alive&&shockGDP(n.id,.97));if(chance(.3)){p.s.salud-=p.age>60?30:12;return 'Te contagias y la pasas mal.';}return 'Tienes suerte y no te contagias.';}}]},
 {id:'mascota',pr:1,when:p=>p.age>=5&&p.age<=14,text:p=>'Encuentras un perrito abandonado en la calle.',
  opts:p=>[{t:'Adoptarlo',go:p=>{p.s.felicidad+=8;return 'Lo llamas Capitán. Es tu mejor amigo.';}},{t:'Dejarlo',go:p=>{p.s.felicidad-=2;return 'Te quedas pensando en él.';}}]},
 {id:'bully',pr:1,when:p=>p.age>=8&&p.age<=16,text:p=>'Un compañero te molesta en la escuela.',
  opts:p=>[{t:'Enfrentarlo',go:p=>{if(chance(.5)){p.s.salud-=5;return 'Pierdes la pelea.';}p.s.influencia+=3;p.s.felicidad+=3;return 'Lo pones en su lugar. Te respetan.';}},
   {t:'Avisar al maestro',go:p=>{p.s.inteligencia+=1;return 'El maestro lo castiga.';}},{t:'Ignorarlo',go:p=>{p.s.felicidad-=4;return 'Sigue molestándote.';}}]},
 {id:'oratoria',pr:1,when:p=>p.age>=10&&p.age<=17,text:p=>'Te invitan a un concurso de oratoria.',
  opts:p=>[{t:'Participar',go:p=>{if(chance(p.s.inteligencia/120+.15)){p.s.influencia+=5;p.s.felicidad+=5;return '¡Ganas el concurso!';}p.s.felicidad-=3;return 'Te pones nervioso y pierdes.';}},{t:'No ir',go:p=>'Prefieres quedarte en casa.'}]},
 {id:'fiesta',pr:1,when:p=>p.age>=14&&p.age<=25,text:p=>'Te invitan a una fiesta el fin de semana.',
  opts:p=>[{t:'Ir a la fiesta',go:p=>{p.s.felicidad+=5;p.s.influencia+=1;if(chance(.15)){p.s.salud-=5;return 'Te diviertes, pero terminas lastimado.';}return 'Conoces gente nueva.';}},{t:'Quedarte a estudiar',go:p=>{p.s.inteligencia+=2;return 'Estudias toda la noche.';}}]},
 {id:'equipo',pr:1,when:p=>p.age>=10&&p.age<=18,text:p=>'El entrenador te invita al equipo de fútbol.',
  opts:p=>[{t:'Aceptar',go:p=>{p.s.salud+=5;p.s.apariencia+=2;return 'Entrenas tres veces por semana.';}},{t:'Rechazar',go:p=>'No es lo tuyo.'}]},
 {id:'loteria',pr:.7,when:p=>p.age>=18,text:p=>`Un vendedor te ofrece un billete de lotería por ${fmt(0.003*U(p))}.`,
  opts:p=>[{t:'Comprarlo',go:p=>{p.dinero-=0.003*U(p);if(chance(.02)){const g=8*U(p);p.dinero+=g;p.s.felicidad+=15;return `¡Ganas ${fmt(g)}!`;}return 'No ganas nada.';}},{t:'No, gracias',go:p=>'Sigues tu camino.'}]},
 {id:'cansancio',pr:1,when:p=>p.age>=30,text:p=>'Te sientes muy cansado desde hace semanas.',
  opts:p=>[{t:`Ir al médico (${fmt(0.08*U(p))})`,go:p=>{p.dinero-=0.08*U(p);p.s.salud+=6;if(isReal())checkup(p);return 'El médico te revisa y te receta descanso.';}},{t:'Ignorarlo',go:p=>{if(chance(.3)){p.s.salud-=9;return 'Era algo serio y empeora.';}return 'Se te pasa solo.';}}]},
 {id:'prestamo',pr:1,when:p=>p.age>=20,text:p=>`Un amigo te pide prestados ${fmt(0.3*U(p))}.`,
  opts:p=>[{t:'Prestarle',go:p=>{const x=0.3*U(p);p.dinero-=x;p.s.felicidad+=2;if(chance(.5)){p.dinero+=x;return 'Te paga a tiempo.';}return 'Nunca te paga.';}},{t:'Negarte',go:p=>{p.s.felicidad-=2;return 'Se molesta contigo.';}}]},
 {id:'asalto',pr:1,when:p=>p.age>=16&&(natOf(p).stab<45||N0[regOf(p).w0].homi>15),text:p=>'Te asaltan camino a casa.',
  opts:p=>[{t:'Entregar todo',go:p=>{const l=Math.min(Math.max(p.dinero,0)*.05,0.4*U(p));p.dinero-=l;p.s.felicidad-=5;return `Pierdes ${fmt(l)}.`;}},
   {t:'Resistirte',go:p=>{if(chance(.3)){p.s.salud-=20;return 'Sales herido.';}p.s.influencia+=2;return 'Logras escapar.';}}]},
 {id:'boda',pr:1,when:p=>p.partner&&!p.married&&p.partner.rel>60,text:p=>`${p.partner.name} quiere casarse contigo.`,
  opts:p=>[{t:`Casarse (${fmt(0.8*U(p))})`,go:p=>{p.married=true;p.dinero-=0.8*U(p);p.s.felicidad+=10;p.partner.rel+=10;return '¡Te casas!';}},{t:'Todavía no',go:p=>{p.partner.rel-=15;return 'Se pone triste.';}}]},
 {id:'ruptura',pr:1,when:p=>p.partner&&p.partner.rel<30,text:p=>`${p.partner.name} quiere terminar la relación.`,
  opts:p=>[{t:'Luchar por la relación',go:p=>{if(chance(.5)){p.partner.rel=50;return 'Se dan otra oportunidad.';}const n=p.partner.name;p.partner=null;p.married=false;p.s.felicidad-=10;return `${n} se va de todos modos.`;}},
   {t:'Aceptar',go:p=>{const n=p.partner.name;p.partner=null;p.married=false;p.s.felicidad-=8;return `Terminas con ${n}.`;}}]},
 {id:'extranjero',pr:.8,when:p=>p.age>=22&&p.age<=45&&!p.ruler&&!p.prison,text:p=>{const me=natOf(p);const c=Object.values(G.nations).filter(n=>n.alive&&n.id!==me.id&&!warsOf(n.id).length&&gdppc(n)>gdppc(me)*1.4);p._dest=c.length?pick(c).id:null;return p._dest?`Te ofrecen trabajo en ${G.nations[p._dest].name} (ingreso medio ${fmt(N0[p._dest]?N0[p._dest].w.T:0)} al año).`:'Te ofrecen un viaje de negocios.';},
  opts:p=>[{t:'Mudarte',go:p=>{if(!p._dest)return 'La oferta se cae.';moveTo(p,p._dest);p.s.felicidad+=3;if(p.job)p.job.bonus=1;return `Te mudas a ${natOf(p).name}.`;}},{t:'Quedarte',go:p=>'Prefieres quedarte en casa.'}]},
 {id:'crisis40',pr:1,when:p=>p.age>=40&&p.age<=50,text:p=>'Tienes la crisis de los 40.',
  opts:p=>[{t:`Comprar un auto deportivo (${fmt(4*U(p))})`,go:p=>{p.dinero-=4*U(p);p.s.felicidad+=10;return 'Te sientes joven otra vez.';}},
   {t:'Ir a terapia',go:p=>{p.dinero-=0.15*U(p);p.s.felicidad+=6;return 'Hablar te ayuda.';}},{t:'Ignorarla',go:p=>{p.s.felicidad-=4;return 'Pasa, pero cuesta.';}}]},
 {id:'soborno',pr:1,when:p=>p.career.track==='politica'&&p.career.rank>=1,text:p=>`Un empresario te ofrece ${fmt(5*U(p))} por votar a favor de su proyecto.`,
  opts:p=>[{t:'Aceptar',go:p=>{p.dinero+=5*U(p);if(isReal()){p.corrupt++;return 'Aceptas el dinero. Nadie se entera… por ahora.';}if(chance(.25)){p.s.influencia-=25;p.career.rank=Math.max(0,p.career.rank-1);return 'Se descubre el soborno: escándalo y pierdes tu puesto.';}return 'Nadie se entera.';}},
   {t:'Rechazar',go:p=>{p.s.influencia+=3;return 'Tu reputación de honestidad crece.';}}]},
 {id:'periodista',pr:1,when:p=>(p.career.track==='politica'||p.career.track==='negocios')&&p.career.rank>=2,text:p=>'Un periodista investiga tu pasado.',
  opts:p=>[{t:`Pagar para callarlo (${fmt(2*U(p))})`,go:p=>{p.dinero-=2*U(p);if(isReal())p.corrupt++;if(chance(.3)){p.s.influencia-=15;return 'Publica todo, incluido el intento de soborno.';}return 'La nota nunca sale.';}},
   {t:'Dar una entrevista honesta',go:p=>{if(chance((p.s.apariencia+p.s.influencia)/200)){p.s.influencia+=6;return 'La entrevista te hace más popular.';}p.s.influencia-=6;return 'La entrevista sale mal.';}}]},
 {id:'rival',pr:1,when:p=>p.career.track==='politica',text:p=>'Un rival político te ataca en redes sociales.',
  opts:p=>[{t:'Responderle',go:p=>{if(chance(.5)){p.s.influencia+=4;return 'Tu respuesta se hace viral.';}p.s.influencia-=4;return 'Te sale mal.';}},{t:'Ignorarlo',go:p=>'La polémica se apaga sola.'}]},
 {id:'asalto_militar',pr:1.5,when:p=>p.career.track==='militar'&&atWar(p),text:p=>'Te ordenan encabezar un asalto a posiciones enemigas.',
  opts:p=>[{t:'Ir al frente',go:p=>{if(chance(.6)){p.s.influencia+=8;p.career.years+=1;return 'El asalto es un éxito y te condecoran.';}p.s.salud-=25;return 'Caes herido.';}},
   {t:'Pedir refuerzos',go:p=>{if(chance(.5)){p.s.influencia-=3;return 'Tus superiores dudan de ti.';}return 'Llegan los refuerzos y todo sale bien.';}}]},
 {id:'comida_calle',pr:1,when:p=>p.career.track==='negocios'&&p.career.rank>=2&&p.dinero>U(p),text:p=>'Te proponen invertir en una cadena de puestos de comida callejera.',
  opts:p=>[{t:'Invertir 30 % de tu dinero',go:p=>{const x=p.dinero*.3;if(chance(.55)){p.dinero+=x*1.2;return `¡La cadena despega! Ganas ${fmt(x*1.2)}.`;}p.dinero-=x;return `La cadena cierra. Pierdes ${fmt(x)}.`;}},{t:'No invertir',go:p=>'Prefieres no arriesgar.'}]},
 {id:'mas_resp',pr:1,when:p=>!!p.job,text:p=>'Tu jefe te ofrece más responsabilidad a cambio de más horas.',
  opts:p=>[{t:'Aceptar',go:p=>{p.job.bonus=(p.job.bonus||1)*1.2;p.s.felicidad-=4;return 'Tu sueldo sube 20 %.';}},{t:'Rechazar',go:p=>'Prefieres tu tiempo libre.'}]},
 {id:'auge',pr:.5,when:p=>true,text:p=>`Descubren grandes yacimientos de litio en ${natOf(p).name}.`,
  opts:p=>[{t:'¡Qué buena noticia!',go:p=>{shockGDP(natOf(p).id,1.03);return 'La economía del país crece 3 %.';}}]},
 {id:'crisis_eco',pr:.6,when:p=>p.age>=18,text:p=>`Crisis económica en ${natOf(p).name}: despidos masivos.`,
  opts:p=>[{t:'Aguantar',go:p=>{shockGDP(natOf(p).id,.97);if(p.dinero>0)p.dinero*=.9;if(p.job&&chance(.25)){p.job=null;return 'Te despiden y pierdes el 10 % de tus ahorros.';}return 'Pierdes el 10 % de tus ahorros.';}},
   {t:'Emprender un negocio',go:p=>{shockGDP(natOf(p).id,.97);if(p.ruler)return 'Como gobernante, lanzas un plan de rescate.';p.career={track:'negocios',rank:2,years:0};p.bizK=null;p.job=null;return 'Te vuelves Emprendedor.';}}]},
 {id:'protestas',pr:1,when:p=>natOf(p).stab<40&&p.age>=15&&!p.ruler,text:p=>'Hay protestas masivas en las calles.',
  opts:p=>[{t:'Unirte',go:p=>{p.s.influencia+=5;natOf(p).stab-=2;if(chance(.2)){p.s.salud-=10;return 'La policía dispersa la marcha y sales lastimado.';}return 'Tu voz se escucha.';}},{t:'Quedarte en casa',go:p=>'Ves todo por televisión.'}]},
 {id:'cumbre',pr:1,when:p=>p.ruler,text:p=>'Te invitan a una cumbre internacional.',
  opts:p=>[{t:'Asistir',go:p=>{const n=natOf(p);const c=Object.values(G.nations).filter(x=>x.alive&&x.id!==n.id&&!n.allies.includes(x.id)&&!warBetween(x.id,n.id));if(c.length&&chance(.35)){const t=pick(c);n.allies.push(t.id);t.allies.push(n.id);return `Firmas una alianza con ${t.name}.`;}p.s.influencia+=3;return 'Ganas prestigio internacional.';}},
   {t:'Enviar a un ministro',go:p=>'Te quedas atendiendo asuntos internos.'}]},
 {id:'comercio',pr:.8,when:p=>p.ruler&&isReal(),text:p=>{const n=natOf(p);const c=Object.values(G.nations).filter(x=>x.alive&&x.id!==n.id&&!warBetween(x.id,n.id)).sort((a,b)=>b.gdp-a.gdp).slice(0,12);p._tp=pick(c).id;return `${G.nations[p._tp].name} propone un tratado de libre comercio.`;},
  opts:p=>[{t:'Firmarlo',go:p=>{const n=natOf(p);n.trade=10;n.approval-=3;return 'El tratado impulsa las exportaciones (+0.8 % de crecimiento al año durante 10 años). Algunos sectores protestan.';}},{t:'Rechazarlo',go:p=>{natOf(p).approval+=2;return 'Proteges a la industria nacional.';}}]}
];
function sentence(p){const y=RI(2,8);p.prison=y;p.corrupt=0;clearPower(p);p.job=null;p.career={track:null,rank:0,years:0};p.s.felicidad-=20;p.s.influencia-=25;return `Te declaran culpable: ${y} años de prisión.`;}
function candChance(p){const n=natOf(p);let c=(p.s.influencia*.55+p.s.apariencia*.15+p.s.felicidad*.1+(p.career.rank===4?10:0)+(n.stab-50)*.2)/100;if(isReal())c=c*0.8+(p.corrupt?-.05*p.corrupt:0);if(p.ppl&&p.ppl.some(x=>x.k==='rival'&&x.rel<25))c-=.04;return clamp(c,.05,.85);}
function canRunAgain(p){const n=natOf(p);if(!isReal())return true;if(n.rule==='no'||n.rule==='alt')return false;if(n.rule==='max2')return p.terms<2;return true;}
function payDebts(p){p.debts.forEach(d=>{const x=Math.min(Math.max(p.dinero,0),d.bal);d.bal-=x;p.dinero-=x;});p.debts=p.debts.filter(d=>d.bal>1);}
function checkup(p){for(const k in COND){if(p.cond.some(c=>c.k===k))continue;if(chance(COND[k].inc(p.age)*3)){p._dx=k;return true;}}return false;}
function pickEvent(p){
  const n=natOf(p);
  const ok=e=>!(e.gap&&p.seen[e.id]&&G.year-p.seen[e.id]<e.gap)&&!(!e.prio&&p.seen[e.id]&&G.year-p.seen[e.id]<6)&&e.when(p,n);
  for(const e of EV.filter(e=>e.prio))if(ok(e)&&chance(e.pr))return e;
  if(p.age<4||!chance(p.age<12?.5:.75)||p.prison)return null;
  const pool=EV.filter(e=>!e.prio&&ok(e));if(!pool.length)return null;
  let tot=pool.reduce((s,e)=>s+e.pr,0),r=Math.random()*tot;
  for(const e of pool){r-=e.pr;if(r<=0)return e;}return pool[0];
}
function setEvent(p,e){p.seen[e.id]=G.year;const text=e.text(p,natOf(p));p.event={id:e.id,text,opts:e.opts(p).map(o=>o.t)};}
function resolveEvent(i,by){
  const p=P,e=EV.find(x=>x.id===p.event.id);const o=e.opts(p)[i];
  const r=o.go(p,natOf(p));log((by?by+' decidió: ':'')+o.t+' → '+r,by?'gift':'');p.event=null;fix(p);flushNews();
  if(p.s.salud<=0)die(p.deathCause||'por problemas de salud');
  return r;
}
function flushNews(){while(news.length){const x=news.shift();if(G){(G._news=G._news||[]).push(x.t);}if(P)log(x.t,x.cls);}}

/* ===== MORTALIDAD ===== */
const AGE_IDX=a=>a<1?0:a<5?1:Math.min(18,1+Math.floor(a/5));
const expSalud=a=>a<20?80:a<40?80-(a-20)*.4:a<60?72-(a-40)*.85:a<75?55-(a-60)*.8:43;
function mortQ(p){
  const d=N0[regOf(p).w0];
  const nmx=d.mort[p.sex==='F'?'F':'M'][AGE_IDX(p.age)]*(1-.08*bl(p.r,'hosp'));
  if(isReal()){
    let hm=Math.exp(clamp(expSalud(p.age)-p.s.salud,-18,60)/28)*CAL(p.age);
    p.cond.forEach(c=>{hm*=c.t?COND[c.k].ht:COND[c.k].h;});
    return Math.min(.95,1-Math.exp(-nmx*hm));
  }
  if(p.s.salud<=0)return 1;
  return Math.min(.6,1-Math.exp(-nmx*(1+Math.max(0,35-p.s.salud)/30)));
}
// la tabla OMS ya incluye muertes por enfermedades crónicas: se descuenta su efecto promedio
const CAL=a=>a<15?1:a<30?0.8:a<75?0.62:a<85?0.72:0.9;

/* ===== TURNO ===== */
function ageUp(){
  const p=P;if(!p||!p.alive||p.event)return;
  G.year++;p.age++;const li=p.log.length;G._news=[];log(`${p.age} años · ${G.year}`,'age');
  const real=isReal(),n=natOf(p);
  // salud y ánimo
  if(real){if(p.age<=40)p.s.salud+=R(-1,1);else if(p.age<=60)p.s.salud-=R(0,1.8);else if(p.age<=75)p.s.salud-=R(.5,2.1);else p.s.salud-=R(0,2);}
  else{if(p.age<=40)p.s.salud+=R(-1,1);else if(p.age<=60)p.s.salud-=R(0,2);else if(p.age<=75)p.s.salud-=R(.5,2.2);else p.s.salud-=R(.8,2.6);}
  p.s.felicidad+=(60-p.s.felicidad)*.05+R(-3,3);
  if(atWar(p))p.s.felicidad-=2;
  if(!p.ruler&&p.career.track!=='politica'&&p.career.track!=='militar'&&p.s.influencia>10)p.s.influencia-=1;
  // prisión
  if(p.prison){p.prison--;p.s.felicidad-=4;p.s.salud-=R(0,2);if(!p.prison)log('Sales de prisión.','good');}
  // escuela
  if(p.age===6)log('Empiezas la escuela primaria.');
  if(p.age>=6&&p.age<=17)p.s.inteligencia+=RI(0,2);
  if(p.age===18&&!p.edu.uni)log('Terminas la preparatoria. Ya puedes ir a la universidad o trabajar (menú Carrera).','good');
  if(p.edu.uni){p.edu.uniYears++;p.s.inteligencia+=RI(1,3);const mj=MAJORS.find(x=>x.n===p.edu.uni);
    if(real&&p.age>=18&&!(p.sch&&p.sch.beca))p.dinero-=0.08*U(p);
    if(p.edu.uniYears>=mj.y){p.edu.degree=p.edu.uni;(p.edu.degrees=p.edu.degrees||[]).push(p.edu.uni);p.edu.uni=null;log(`Te gradúas en ${p.edu.degree}.`,'good');
      if(p.edu.degree==='Academia Militar'){p.career={track:'militar',rank:3,years:0};log('Entras al ejército como Teniente.','good');}}}
  // dinero
  if(p.career.track==='negocios')bizRoll(p);
  if(real){
    const g=grossIncome(p),tax=taxOf(p,g),liv=livingCost(p);
    if(p.dinero>0)p.dinero*=1+Math.max(0,n.rate*0.45)/100; // rendimiento de ahorros
    p.dinero+=g-tax-liv;
    if(p.dinero<0)p.dinero*=1+(n.rate+12)/100; // saldo negativo = tarjeta de crédito
    // préstamos
    let owed=0;p.debts.forEach(d=>{d.bal*=1+d.rate;const pay=Math.min(d.pay,d.bal);if(p.dinero>=pay||p.dinero+0.5*U(p)>=pay){p.dinero-=pay;d.bal-=pay;}else{owed++;}d.years--;});
    p.debts=p.debts.filter(d=>d.bal>1);
    const card=p.dinero<-1.5*U(p);
    if(owed||card){p.late++;log(owed?`No alcanzas a pagar ${owed} préstamo(s). Llevas ${p.late} año(s) de atraso.`:`Tu tarjeta de crédito está al límite (${fmt(p.dinero)}). Llevas ${p.late} año(s) sin poder pagarla.`,'bad');}else if(p.late)p.late=0;
    if(p.house){p.house.val*=1+(n.infl+R(-2,4))/100;p.s.felicidad+=1;}
    if(p.bankrupt)p.bankrupt--;
    if(p.job&&p.job.bonus){/* aumentos ligados a la inflación ya van en el índice de precios */}
    if(tax>0&&p.age>=18&&G.year%5===0)log(`Pagaste ${fmt(tax)} de impuestos este año.`);
  }else{
    p.dinero+=grossIncome(p)-livingCost(p);
    if(p.dinero<-3*U(p)&&chance(.3)){p.s.felicidad-=8;log('Tus deudas te quitan el sueño.','bad');}
  }
  yearV04(p);
  // carrera
  const c=p.career;
  if(c.track){const T=TRACKS[c.track];c.years+=1+(c.track==='militar'&&atWar(p)?1:0);
    if(c.rank<T.ranks.length-1&&c.years>=T.yrs[c.rank]&&p.s.influencia>=T.inf[c.rank]&&p.s.inteligencia>=T.int[c.rank]&&(!T.money||p.dinero>=T.money[c.rank]*U(p))){
      if(chance(.55+(p.edu.degree===T.bonus?.2:0))){c.rank++;c.years=0;p.s.influencia+=5;if(c.track==='negocios')bizRoll(p);log(`¡Ascenso! Ahora eres ${T.ranks[c.rank]}.`,'good');}}
    if(c.track==='militar'&&atWar(p)){p.s.salud-=R(0,6);const q=.03*(c.rank<=2?1.5:c.rank>=5?.3:1);if(chance(q)){p.s.salud=0;p.deathCause='en combate';}}}
  if(p.ruler){p.rulerYears++;if(real){const g=n.g||2;const tgt=50+(g-2)*4+(n.stab-50)*.35-(atWar(p)?6:0)-(n.infl>10?(n.infl-10)*.8:0)+p.s.influencia*.1-(n.sanc?4:0);n.approval=clamp(n.approval+(tgt-n.approval)*.4+R(-4,4),3,95);}}
  // enfermedades (Realista)
  if(real&&p.age>=18&&!p._dx){for(const k in COND){if(p.cond.some(x=>x.k===k))continue;const pr=COND[k].inc(p.age)*Math.exp((expSalud(p.age)-p.s.salud)/30);if(chance(pr)){p._dx=k;break;}}}
  if(real)p.cond=p.cond.filter(x=>{if(x.k==='canc'&&x.t&&G.year-x.y>=2&&chance(.5)){log('Los médicos confirman que el cáncer está en remisión.','good');return false;}return true;});
  // familia
  p.parents.forEach(x=>{if(!x.alive)return;x.age++;x.rel+=R(-2,1);if(chance(parentQ(p,x))){x.alive=false;log(x.role==='Madre'?`Muere tu madre, ${x.name}, a los ${x.age} años.`:`Muere tu padre, ${x.name}, a los ${x.age} años.`,'bad');p.s.felicidad-=12;if(p.age>=18){const h=R(0.3,6)*U(p);p.dinero+=h;log(`Heredas ${fmt(h)}.`);}}});
  p.siblings.forEach(x=>x.age++);p.children.forEach(x=>x.age++);
  if(p.partner){p.partner.rel=clamp(p.partner.rel+R(-4,2),0,100);}
  // mundo
  simWorld();if(typeof yearV07==='function')yearV07(p);if(typeof yearV08==='function')yearV08(p);if(typeof yearV09==='function')yearV09(p);flushNews();
  fix(p);
  // muerte
  if(p.s.salud<=0||chance(mortQ(p))){die(p.deathCause||(p.age>70?'de vejez':'por problemas de salud'));return;}
  const e=pickEvent(p);if(e)setEvent(p,e);
  p._paper=makePaper(p,p.log.slice(li),G._news||[]);
  p.actions=p.prison?1:3;p.nat=2;p.dip=Math.min(6,(p.dip||0)+3);G.month=0;
}
function parentQ(p,x){const d=N0[regOf(p).w0],sx=x.role==='Madre'?'F':'M';if(isReal())return 1-Math.exp(-d.mort[sx][AGE_IDX(x.age)]);
  const le=sx==='F'?d.lef:d.lem,a=x.age+(77-le);return a<40?0.0008:Math.min(.6,0.0008*Math.pow(1.095,a-40));}
function die(cause){const p=P;p.alive=false;p.event=null;log(`Mueres ${cause} a los ${p.age} años.`,'bad');if(p.ruler)natOf(p).leader=rndName(natOf(p).id);}
function heir0(p){return [...p.children].sort((a,b)=>b.age-a.age)[0]||null;}
function continueAsHeir0(){
  const old=P,h=heir(old);if(!h)return false;
  const np=newPlayer({first:h.name,surname:old.surname,sex:h.sex,r:old.r,age:0,gen:old.gen+1});
  np.age=h.age;np.s.inteligencia=clamp(Math.round((old.s.inteligencia+np.s.inteligencia)/2+Math.min(np.age,18)*.5),0,100);
  const estate=Math.max(0,netWorth(old));np.dinero=estate*.5;np.s.influencia=Math.round(old.s.influencia*.3);
  np.parents=[{name:fullName(old),role:old.sex==='F'?'Madre':'Padre',age:old.age,alive:false,rel:80}];
  if(old.partner)np.parents.push({name:old.partner.name,role:old.sex==='F'?'Padre':'Madre',age:old.age-RI(-3,3),alive:true,rel:70});
  np.siblings=old.children.filter(c=>c!==h).map(c=>({name:c.name,sex:c.sex,age:c.age}));
  if(old.ruler&&natOf(old).gov==='dictadura'&&h.age>=18){np.ruler=true;np.rulerYears=0;np.terms=1;natOf(old).leader=fullName(np);}
  np.log=old.log.slice(-40);P=np;
  log(`Generación ${np.gen}: continúas como ${fullName(np)}, de ${np.age} años.`+(np.ruler?' Heredas el poder.':''),'big');
  return true;
}

/* ===== ACCIONES ===== */
function personalActions(){
  const p=P,a=[],T=U(p),real=isReal();
  const add=(t,s,can,fn)=>a.push({t,s,can:can&&!(p.prison&&!/Estudiar|Leer|gimnasio/.test(t)),fn});
  add('Estudiar','+Inteligencia'+(p.age<=17?', mejores calificaciones':''),p.age>=6,()=>{p.s.inteligencia+=RI(2,5);p.s.felicidad-=1;p._studied=true;return 'Estudias duro.';});
  add('Leer un libro','+Inteligencia, +Felicidad',p.age>=7,()=>{p.s.inteligencia+=RI(1,3);p.s.felicidad+=1;return 'Lees un buen libro.';});
  add('Ir al gimnasio','+Salud, +Apariencia',p.age>=12,()=>{p.s.salud+=RI(2,4);p.s.apariencia+=RI(1,3);return 'Entrenas en el gimnasio.';});
  add('Tiempo con la familia','+Felicidad',true,()=>{p.s.felicidad+=RI(3,6);p.parents.forEach(x=>x.alive&&(x.rel=clamp(x.rel+4,0,100)));if(p.partner)p.partner.rel+=4;return 'Pasas tiempo con tu familia.';});
  add('Hacer contactos','+Influencia',p.age>=16,()=>{p.s.influencia+=RI(2,4);return 'Conoces gente importante.';});
  add('Buscar pareja','Depende de tu apariencia',p.age>=16&&!p.partner,()=>{if(chance(.25+p.s.apariencia/160)){const s=p.sex==='M'?'F':'M';const c=cultOf(natOf(p).id);p.partner={name:rndFirst(s,c)+' '+rndSur(c),sex:s,rel:RI(55,80)};p.s.felicidad+=6;return `Empiezas a salir con ${p.partner.name}.`;}p.s.felicidad-=2;return 'No encuentras a nadie esta vez.';});
  add('Tener un hijo','Con tu pareja',!!p.partner&&p.age>=18&&p.age<=(p.sex==='F'?44:60),()=>{const f=clamp(N0[regOf(p).w0].cbr/20,.6,1.4);const ma=p.sex==='F'?p.age:(p.age-RI(0,6));if(chance(clamp((ma<35?.6:ma<40?.4:.2)*f,.1,.85))){const s=chance(.51)?'M':'F';const c={name:rndFirst(s,p.cult),sex:s,age:0};p.children.push(c);p.s.felicidad+=8;return (s==='F'?`¡Nace tu hija ${c.name}!`:`¡Nace tu hijo ${c.name}!`);}return 'Este año no hubo embarazo.';});
  add(`Vacaciones (${fmt(0.25*T)})`,'+Felicidad',p.age>=18,()=>{p.dinero-=0.25*T;p.s.felicidad+=RI(6,10);return 'Te vas de vacaciones.';});
  add(`Ir al médico (${fmt(0.08*T)})`,real?'+Salud · chequeo preventivo':'+Salud',true,()=>{p.dinero-=0.08*T;p.s.salud+=p.s.salud<50?RI(5,10):RI(1,4);if(real&&p.age>=25&&checkup(p))return 'El chequeo detecta algo. Tendrás que decidir qué hacer.';return 'Te haces un chequeo.';});
  add('Trabajar horas extra','+Dinero, −Salud',!!(p.job||p.career.track),()=>{const x=grossIncome(p)*.15;p.dinero+=x;p.s.salud-=2;p.career.years+=.5;return `Ganas ${fmt(x)} extra.`;});
  if(p.career.track==='politica')add(`Hacer campaña (${fmt(0.3*T)})`,'+Influencia',true,()=>{p.dinero-=0.3*T;p.s.influencia+=RI(3,6);return 'Recorres colonias y das discursos.';});
  return a;
}
function financeOptions(){ // solo Realista
  const p=P,n=natOf(p),T=U(p),a=[],inc=grossIncome(p);
  const add=(sec,t,s,can,fn)=>a.push({sec,t,s,can,fn});
  const lr=(n.rate+6)/100,hr=Math.max(2,n.rate+1)/100;
  const amt=Math.max(inc,0.5*T);
  add('Préstamos',`Préstamo personal de ${fmt(amt)}`,`Tasa ${pct(lr*100)} anual · 5 años · pago ${fmt(annuity(amt,lr,5))}/año`,p.age>=18&&!p.bankrupt&&inc>0&&p.debts.length<3,()=>{p.debts.push({type:'Préstamo personal',bal:amt,rate:lr,pay:annuity(amt,lr,5),years:5});p.dinero+=amt;return `El banco te presta ${fmt(amt)}.`;});
  const price=5*T*R(0.9,1.1),down=price*.2;
  if(!p.house)add('Vivienda',`Comprar casa con hipoteca (${fmt(price)})`,`Enganche ${fmt(down)} · tasa ${pct(hr*100)} · 20 años · pago ${fmt(annuity(price-down,hr,20))}/año`,p.age>=21&&!p.bankrupt&&p.dinero>=down&&inc>0.6*T,()=>{p.dinero-=down;p.house={val:price,y:G.year};p.debts.push({type:'Hipoteca',bal:price-down,rate:hr,pay:annuity(price-down,hr,20),years:20});p.s.felicidad+=8;return 'Compras tu casa. Ya no pagas renta.';});
  else add('Vivienda',`Vender tu casa (${fmt(p.house.val)})`,'Liquida primero la hipoteca',true,()=>{p.dinero+=p.house.val*.95;p.house=null;const h=p.debts.find(d=>d.type==='Hipoteca');if(h){p.dinero-=h.bal;p.debts=p.debts.filter(d=>d!==h);}p.s.felicidad-=4;return 'Vendes tu casa.';});
  p.debts.forEach((d,i)=>add('Tus deudas',`Liquidar ${/^Crédito /.test(d.type)?d.type:d.type.toLowerCase()} (${fmt(d.bal)})`,`Tasa ${pct(d.rate*100)} · pago ${fmt(d.pay)}/año`,p.dinero>=d.bal,()=>{p.dinero-=d.bal;p.debts.splice(i,1);p.late=0;return `Liquidas tu ${d.type.toLowerCase()}.`;}));
  return a;
}
function careerOptions(){
  const p=P,a=[],T=U(p);const busy=p.ruler||p.career.track||p.job||p.edu.uni||p.prison;
  const add=(sec,t,s,can,fn,act)=>a.push({sec,t,s,can,fn,act});
  if(!busy&&p.age>=18){
    MAJORS.forEach(mj=>add('Universidad',mj.n,`${mj.y} años · Inteligencia ${mj.int}+ · examen de admisión (${Math.round(uniAdmit(p)*100)} %)`+(isReal()&&!(p.sch&&p.sch.beca)?` · colegiatura ${fmt(0.08*T)}/año`:'')+(p.sch&&p.sch.beca?' · con beca':''),p.age<=40&&p.s.inteligencia>=mj.int&&!(p.edu.degrees||[]).includes(mj.n)&&p.uniTry!==G.year,()=>{p.uniTry=G.year;if(!chance(uniAdmit(p)))return `No pasas el examen de admisión de ${mj.n}. Puedes intentarlo el próximo año.`;p.edu.uni=mj.n;p.edu.uniYears=0;return `¡Pasas el examen! Entras a estudiar ${mj.n}.`;}));
    add('Carreras hacia el poder','Entrar a la política','Activista · Inteligencia 40+',p.s.inteligencia>=40,()=>{p.career={track:'politica',rank:0,years:0};return 'Te unes a un partido como Activista.';});
    add('Carreras hacia el poder','Alistarte en el ejército',`Recluta · ${fmt(TRACKS.militar.k[0]*W(p,'0'))}/año · Salud 50+`,p.s.salud>=50,()=>{p.career={track:'militar',rank:0,years:0};return 'Te alistas como Recluta.';});
    add('Carreras hacia el poder','Empezar en negocios',`Empleado · ${fmt(W(p,'4'))}/año`,true,()=>{p.career={track:'negocios',rank:0,years:0};p.bizK=null;return 'Consigues un puesto de Empleado.';});
    const ue=N0[regOf(p).w0].unemp/100;
    JOBS.forEach(j=>{const rq=j.req||{};const ok=(!rq.degree||(rq.degree==='*'?!!p.edu.degree:p.edu.degree===rq.degree))&&(!rq.inteligencia||p.s.inteligencia>=rq.inteligencia)&&(!rq.salud||p.s.salud>=rq.salud);
      const req=rq.degree?(rq.degree==='*'?'Título universitario':`Título de ${rq.degree}`):rq.inteligencia?'Inteligencia '+rq.inteligencia+'+':rq.salud?'Salud '+rq.salud+'+':'Sin requisitos';
      add('Empleos',j.name,`${fmt(W(p,j.o)*j.k)}/año · ${req}`,ok,()=>{if(chance(clamp(.85-ue*(isReal()?2.5:1),.3,.9))){p.job={name:j.name,o:j.o,k:j.k,bonus:1};return `Te contratan como ${j.name}.`;}return (isReal()?`No te contratan como ${j.name} (desempleo en el país: ${pct(ue*100)}).`:`No te contratan como ${j.name}.`);});});
  }
  if(p.age>=10&&p.age<=17&&p.sch)Object.entries(CLUBS).forEach(([k,c])=>add('Club escolar',`${p.sch.club===k?'✓ ':''}${c.n}`,c.d,p.sch.club!==k,()=>{p.sch.club=k;return `Te unes al club de ${c.n}.`;}));
  if(!busy&&p.age>=16&&p.age<18)add('Empleos','Trabajo de medio tiempo','Mesero',true,()=>{p.job={name:'Mesero (medio tiempo)',o:'5',k:0.5,bonus:1};return 'Consigues trabajo de medio tiempo.';});
  if(p.career.track==='militar'&&p.career.rank===6&&!p.ruler)
    add('Poder','Dar un golpe de Estado',`Probabilidad ~${Math.round(clamp((p.s.influencia*.6+(100-natOf(p).stab)*.4)/100*.8,.05,.85)*100)} %`,true,()=>{const n=natOf(p);const c=clamp((p.s.influencia*.6+(100-n.stab)*.4)/100*.8,.05,.85);
      if(chance(c)){becomeRuler(p,'dictadura');n.stab-=15;if(isReal())n.sanc=Math.max(n.sanc,RI(3,8));return 'El golpe triunfa.';}p.career={track:null,rank:0,years:0};p.s.influencia=0;p.s.felicidad-=30;if(chance(.4)){p.s.salud=0;p.deathCause='tras un golpe fallido';return 'El golpe fracasa.';}if(isReal())return 'El golpe fracasa. '+sentence(p);return 'El golpe fracasa: te dan de baja y caes en desgracia.';},true);
  if(p.career.track==='negocios'&&p.career.rank===4){
    add('Poder',`Comprar influencia (${fmt(15*T)})`,'+10 Influencia',p.dinero>=15*T,()=>{p.dinero-=15*T;p.s.influencia+=10;return 'Financias fundaciones y medios.';},true);
    add('Poder',`Saltar a la política (${fmt(60*T)})`,'Senador directo · Influencia 55+',p.dinero>=60*T&&p.s.influencia>=55,()=>{p.dinero-=60*T;p.career={track:'politica',rank:3,years:0};return 'Tu partido te da un escaño de Senador.';},true);
  }
  if((p.career.track||p.job)&&!p.prison)add('Tu trabajo','Renunciar','Quedas sin empleo',true,()=>{const t=careerTitle(p);p.career={track:null,rank:0,years:0};p.job=null;return `Renuncias a tu puesto de ${t}.`;});
  if(p.edu.uni)add('Tu trabajo','Abandonar la universidad','',true,()=>{const u=p.edu.uni;p.edu.uni=null;return `Abandonas ${u}.`;});
  if(p.age>=(isReal()?62:60)&&(p.career.track||p.job)&&!p.ruler)add('Tu trabajo','Jubilarte','Pensión del 40 % de tu sueldo',true,()=>{p.pension=grossIncome(p)*.4/U(p);p.career={track:null,rank:0,years:0};p.job=null;return 'Te jubilas.';});
  if(p.ruler)add('Poder','Renunciar al poder','Dejas de gobernar',true,()=>{clearPower(p);return 'Renuncias al poder.';});
  return a;
}
function natActions(){
  const p=P,n=natOf(p),a=[],real=isReal();const add=(t,s,can,fn,vote)=>a.push({t,s,can,fn,vote});
  add('Invertir en infraestructura','+Crecimiento económico',true,()=>{shockGDP(n.id,1+R(1.5,3)/100);n.stab+=1;return 'Lanzas un plan de infraestructura.';},1);
  add('Reforzar el ejército',`+Ejército · gasto militar ${fmtN(milxOf(n.army))}`,true,()=>{n.army=Math.min(100,n.army+R(2,5));shockGDP(n.id,.995);return 'Compras equipo y entrenas tropas.';},1);
  add('Reformas sociales','+Estabilidad',true,()=>{n.stab+=R(6,10);shockGDP(n.id,.997);if(real)n.approval+=3;return 'Aprobación de reformas sociales.';},1);
  add('Propaganda','+Influencia, +Estabilidad',true,()=>{p.s.influencia+=5;n.stab+=2;if(real)n.approval+=2;return 'Campaña de propaganda nacional.';},0);
  if(real){
    add('Bajar impuestos','+Aprobación, −Economía a largo plazo',true,()=>{n.approval+=6;shockGDP(n.id,.995);return 'Bajas los impuestos. La gente lo celebra.';},1);
    add('Plan antiinflación','−Inflación, −Crecimiento',n.infl>4,()=>{n.infl=Math.max(1,n.infl*.6);shockGDP(n.id,.99);return 'El banco central sube tasas; la inflación cede.';},0);
    add('Desviar fondos públicos',`+${fmt(3*U(p))} para ti · riesgo de juicio`,true,()=>{p.dinero+=3*U(p);p.corrupt++;n.approval-=2;return 'Desvías fondos a cuentas a tu nombre.';},0);
  }
  return a;
}
function peaceBudget(w,me){const s=w.a===me?w.score:-w.score;const foe=enemyIn(w,me);return clamp(Math.round(s/25)+w.years+Math.round(batchSize(w,foe)/2),1,25);}
function claimable(me,foe,chosen){const mine=new Set([...regionsOf(me),...chosen]);return regionsOf(foe).filter(r=>!chosen.includes(r)&&RG[r].adj.some(a=>mine.has(a)));}
function congressVote(n){return clamp(.3+n.congress/100*.8,.25,.95);}
/*ENGINE_END*/
