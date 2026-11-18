/* ===== v0.4: retratos, periódico, sonido, personas, provincias, bienes, ajustes ===== */
let CFG={snd:1,paper:'imp',ff:'imp'};try{Object.assign(CFG,JSON.parse(localStorage.getItem('imperioCfg')||'{}'));}catch(e){}
const saveCfg=()=>{try{localStorage.setItem('imperioCfg',JSON.stringify(CFG));}catch(e){}};
/* ----- retratos procedurales ----- */
function hsh(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
const SKIN={hisp:['#c98d62','#d9a57a','#a96d46','#e4b994'],luso:['#c98d62','#8a5a3a','#e4b994','#a96d46'],angl:['#f2d3b8','#e8bf9e','#f7e0cc','#c99a74'],germ:['#f4dac6','#efcdb2','#f8e6d6','#e3b896'],ital:['#e9c2a0','#ddb08a','#f0d0b2','#c99a74'],
 fran:['#f2d3b8','#6b4429','#e8bf9e','#4a2e1c'],esla:['#f4dac6','#efcdb2','#e9c4a6','#f8e6d6'],arab:['#d7a77e','#c49065','#e6bc95','#a87652'],turc:['#e2b48c','#d9a57a','#c98d62','#efc7a3'],pers:['#dcae86','#c99a74','#e6bc95','#b98660'],
 chin:['#f1d2b2','#e9c39f','#f5dcc0','#dcb48e'],japo:['#f3d8bd','#ecc9a8','#f6e0c9','#e3bc97'],core:['#f3d8bd','#ecc9a8','#f6e0c9','#e3bc97'],indi:['#b07a52','#9a6642','#c48c62','#7f5133'],seas:['#d2a07a','#c08a62','#ddb08a','#a8764f'],
 afri:['#6b4429','#4a2e1c','#7d5233','#3a2416'],hebr:['#e9c2a0','#ddb08a','#f0d0b2','#c99a74']};
const HAIR=['#2b1d14','#1b1410','#4a3020','#6b4a2a','#a0703a','#d8b56a','#8a2e14'];
function face(x,size,o){if(typeof faceV2==='function')return faceV2(x,size,o); /* v1.7q: retratos nuevos en ui_v16f_face.js */o=o||{};const name=x.name||(x.first+' '+x.surname)||'x',sd=hsh(name),age=x.age||0,sex=x.sex||'M',c=x.c||x.cult||(P&&P.cult)||'hisp';
  const sk=(SKIN[c]||SKIN.hisp)[sd%4];const dark=['afri','indi','chin','japo','core','arab','pers','turc','seas','hisp','luso'].includes(c);
  let hc=HAIR[dark?(sd>>3)%3:(sd>>3)%7];if(age>=55)hc=age>=72?'#e6e6e6':'#9a9a9a';
  const mood=o.mood!=null?o.mood:60,dead=o.dead,baby=age<3,kid=age<13,old=age>=60;
  const hs=(sd>>5)%3;const long=sex==='F'&&!baby;const beard=sex==='M'&&age>=20&&(sd>>8)%3===0;const glasses=age>=14&&(sd>>10)%5===0;
  const my=mood>66?'M38 66 Q50 76 62 66':mood>40?'M40 68 Q50 72 60 68':'M40 71 Q50 64 60 71';
  let s=`<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="face${dead?' dead':''}"><circle cx="50" cy="50" r="49" fill="${o.bg||'#22303f'}"/>`;
  if(long)s+=`<path d="M22 50 Q20 ${hs===2?96:84} 34 ${hs===2?98:88} L66 ${hs===2?98:88} Q80 ${hs===2?96:84} 78 50 Z" fill="${hc}"/>`;
  s+=`<path d="M30 86 Q50 ${baby?80:76} 70 86 L76 100 L24 100 Z" fill="${o.shirt||['#3d6ea8','#a8443d','#3d8a5a','#7a5aa8','#c08a2a'][sd%5]}"/>`;
  s+=`<rect x="44" y="${baby?66:68}" width="12" height="12" fill="${sk}"/>`;
  s+=`<ellipse cx="50" cy="${baby?50:48}" rx="${baby?24:kid?21:20}" ry="${baby?24:kid?23:25}" fill="${sk}"/>`;
  if(!baby){s+=hs===0?`<path d="M29 44 Q30 20 50 20 Q70 20 71 44 Q66 30 50 30 Q36 30 29 44Z" fill="${hc}"/>`:hs===1?`<path d="M29 46 Q28 18 52 19 Q74 22 71 46 Q68 34 58 31 Q46 37 29 46Z" fill="${hc}"/>`:`<path d="M28 48 Q26 16 50 18 Q74 16 72 48 L68 40 Q60 28 50 29 Q38 28 32 40Z" fill="${hc}"/>`;
    if(sex==='M'&&age>=45&&(sd>>12)%3===0)s=s.replace(/<path d="M29 4[46][^>]*>/,'');}
  else s+=`<path d="M46 27 Q50 21 54 27" stroke="${hc}" stroke-width="2.5" fill="none"/>`;
  const ey=baby?50:47;s+=`<circle cx="42" cy="${ey}" r="${baby?3.2:2.6}" fill="#1a1a1a"/><circle cx="58" cy="${ey}" r="${baby?3.2:2.6}" fill="#1a1a1a"/>`;
  if(!baby)s+=`<path d="M37 ${ey-6} L46 ${ey-7}M54 ${ey-7} L63 ${ey-6}" stroke="${hc==='#e6e6e6'?'#bbb':hc}" stroke-width="2" stroke-linecap="round"/>`;
  if(kid)s+=`<circle cx="37" cy="58" r="4" fill="#e88" opacity=".35"/><circle cx="63" cy="58" r="4" fill="#e88" opacity=".35"/>`;
  if(glasses)s+=`<circle cx="42" cy="${ey}" r="6" fill="none" stroke="#222" stroke-width="1.6"/><circle cx="58" cy="${ey}" r="6" fill="none" stroke="#222" stroke-width="1.6"/><path d="M48 ${ey}H52" stroke="#222" stroke-width="1.6"/>`;
  if(beard)s+=`<path d="M31 56 Q33 78 50 80 Q67 78 69 56 Q62 70 50 70 Q38 70 31 56Z" fill="${hc}" opacity=".9"/>`;
  s+=`<path d="${my}" stroke="#5a2a1a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  if(old)s+=`<path d="M35 39 Q42 37 47 39M53 39 Q58 37 65 39M36 60 Q38 64 40 66M64 60 Q62 64 60 66" stroke="#000" stroke-opacity=".22" stroke-width="1.2" fill="none"/>`;
  if(o.crown)s+=`<path d="M34 22 L38 10 L44 18 L50 8 L56 18 L62 10 L66 22 Z" fill="#f2c14e" stroke="#7a5a10" stroke-width="1"/>`;
  return s+'</svg>';}
/* ----- banderas ----- */
const FLAG={};let flagImg=null;
function loadFlags(){return loadImg(FLAG_PNG).then(im=>{flagImg=im;const c=document.createElement('canvas');c.width=FLAGS.w;c.height=FLAGS.h;const x=c.getContext('2d');
  for(const n in FLAGS.idx){const k=FLAGS.idx[n];x.clearRect(0,0,c.width,c.height);x.drawImage(im,(k%FLAGS.cols)*FLAGS.w,Math.floor(k/FLAGS.cols)*FLAGS.h,FLAGS.w,FLAGS.h,0,0,FLAGS.w,FLAGS.h);FLAG[n]=c.toDataURL();}});}
const flag=(n,h)=>FLAG[n]?`<img class="flag" src="${FLAG[n]}" style="height:${h||14}px" alt="">`:'';
/* ----- sonido (síntesis, sin archivos) ----- */
const SND={ctx:null,mus:null,state:''};
function ac(){if(!SND.ctx){try{SND.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx;}
function tone(f,t,d,type,v){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(v||.06,c.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);o.connect(g).connect(c.destination);o.start(c.currentTime+t);o.stop(c.currentTime+t+d+.05);}
function sfx(k){if(!CFG.snd)return;try{({click:()=>tone(660,0,.06,'triangle',.04),year:()=>{tone(523,0,.25,'sine',.05);tone(784,.08,.35,'sine',.04);},
  good:()=>[523,659,784,1046].forEach((f,i)=>tone(f,i*.07,.3,'triangle',.05)),bad:()=>{tone(220,0,.5,'sawtooth',.03);tone(207,.12,.6,'sawtooth',.03);},
  war:()=>[0,.18,.36].forEach(t=>tone(70,t,.25,'square',.07)),coin:()=>{tone(988,0,.08,'square',.03);tone(1319,.07,.2,'square',.03);},
  paper:()=>{tone(300,0,.08,'triangle',.03);tone(450,.05,.1,'triangle',.03);}})[k]();}catch(e){}}
function musicTick(){if(!CFG.snd||!SND.ctx||document.hidden)return;const st=!P||!P.alive?'paz':atWar(P)?'guerra':P.ruler?'poder':'paz';
  const ch={paz:[[262,330,392],[220,262,330],[175,220,262],[196,247,294]],guerra:[[147,175,220],[131,165,196],[147,175,220],[110,131,165]],poder:[[196,247,294],[262,330,392],[220,277,330],[294,370,440]]}[st];
  SND.i=((SND.i||0)+1)%4;ch[SND.i].forEach((f,j)=>tone(f,j*.04,3.6,'sine',.012));if(st==='guerra')[0,.5,1].forEach(t=>tone(60,t,.2,'square',.02));}
setInterval(musicTick,4000);
document.addEventListener('pointerdown',()=>{if(CFG.snd)ac();},{once:false,passive:true});
document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('click');},true);
/* ----- periódico ----- */
function showPaper(){const pp=P._paper;const n=natOf(P);const sec=(t,arr)=>arr.length?`<div class="np-sec"><div class="np-k">${t}</div><div class="np-h">${arr[0]}</div>${arr.slice(1).map(x=>`<div class="np-s">${x}</div>`).join('')}</div>`:'';
  showModal(`<div class="paper"><div class="np-mast">${flag(n.id,16)} LA GACETA DE ${n.name.toUpperCase()}</div><div class="np-date">Edición anual · ${pp.y} · ${RG[P.r].nm}</div>
   <div class="np-lead">${face(P,58,{mood:P.s.felicidad,crown:P.ruler})}<div>${sec('TU VIDA',pp.pers.length?pp.pers:[`${fullName(P)} cumple ${P.age} años.`])}</div></div>
   ${sec('NACIONAL',pp.nat)}${sec('MUNDO',pp.world)}</div><button class="opt" id="npOk">Continuar</button>`,m=>{m.querySelector('#npOk').onclick=()=>{P._paper=null;render();};});sfx('paper');}
const paperDue=()=>P&&P.alive&&P._paper&&CFG.paper!=='nunca'&&(CFG.paper==='siempre'||P._paper.imp);
/* ----- personas ----- */
function relBar(v){return `<span class="rb"><i style="width:${clamp(v||0,0,100)}%;background:${v>=60?'#47c26b':v>=30?'#f2c14e':'#f0565d'}"></i></span>`;}
const KLAB={padre:'Padre',madre:'Madre',pareja:'Pareja',hijo:'Hijo/a',hermano:'Hermano/a',amigo:'Amigo',rival:'Rival',jefe:'Jefe',maestro:'Maestro',mentor:'Mentor'};
function showPeople(){const p=P;const all=allPeople(p);const grp=[['Familia',['padre','madre','hermano']],['Pareja e hijos',['pareja','hijo']],['Amigos y mentores',['amigo','mentor','maestro']],['Rivales',['rival']],['Trabajo',['jefe']]];
  let h=`<h3>Personas</h3><div class="hint"><span>Toca a alguien para interactuar (una vez al año por persona).</span> <span>Las relaciones altas abren favores, préstamos y trabajos, y los rivales pueden sabotearte.</span></div>`;
  grp.forEach(([t,ks])=>{const xs=all.filter(x=>ks.includes(x.k));if(!xs.length)return;h+=`<div class="sect">${t}</div>`+xs.map(x=>{const i=all.indexOf(x),r=x.ref;
    return `<button class="item per" data-i="${i}">${face({name:r.name,age:r.age,sex:r.sex||(x.k==='madre'?'F':x.k==='padre'?'M':'M'),c:r.c||p.cult},40,{mood:r.rel})}<span><div class="t">${r.name}</div><div class="s">${KLAB[x.k]}${r.age!=null?' · '+r.age+' años':''}${r.iy===G.year?' · ya interactuaron este año':''}</div></span>${relBar(r.rel)}</button>`;}).join('');});
  if(!all.length)h+='<div class="hint">Aún no conoces a nadie.</div>';
  openSheet(h,b=>b.querySelectorAll('.item.per').forEach(el=>el.onclick=()=>showPerson(all[+el.dataset.i])));}
function showPerson(it){const r=it.ref,acts=interactions(P,it);
  openSheet(`<div class="pp">${face({name:r.name,age:r.age,sex:r.sex,c:r.c||P.cult},72,{mood:r.rel})}<div><h3>${r.name}</h3><div class="hint">${KLAB[it.k]}${r.age!=null?' · '+r.age+' años':''}<br>Relación ${r.rel} ${relBar(r.rel)}</div></div></div>`+listHTML(acts)+`<button class="btn" id="pBack" style="width:100%;margin-top:8px">← Personas</button>`,
   b=>{b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{const t=acts[+el.dataset.i].fn();if(t)log(t);save();render();showPerson(it);});b.querySelector('#pBack').onclick=showPeople;});}
/* ----- provincias: invertir, negocio, mudarse, construir ----- */
function provActionsHTML(rid){const p=P;if(!p||!p.alive||p.event)return '';const own=G.regions[rid].o,me=natOf(p).id;let h='<div class="mini-actions">';
  if(p.age>=18&&!p.prison&&p.dinero>0)h+=`<button class="btn" data-pa="inv">💼 Invertir</button>`;
  if(p.age>=18&&!p.prison&&!p.biz)h+=`<button class="btn" data-pa="biz">🌮 Abrir negocio</button>`;
  if(rid!==p.r&&p.age>=18&&!p.prison&&!p.ruler)h+=`<button class="btn" data-pa="move">🏠 Mudarte aquí</button>`;
  if(p.ruler&&own===me)h+=`<button class="btn gold" data-pa="build">🏗️ Construir</button>`;
  return h+'</div>';}
function provAction(rid,k){const p=P,T=U(p),rd=RG[rid];
  if(k==='inv'){const opts=[];[['neg'],['inm']].forEach(([t])=>[.1,.25,.5].forEach(f=>{const a=Math.max(0,p.dinero*f);opts.push({sec:INV[t].n,t:`Invertir ${fmt(a)} (${Math.round(f*100)} % de tu dinero)`,s:INV[t].d,can:a>0,fn:()=>{invest(p,rid,t,a);sfx('coin');return `Inviertes ${fmt(a)} en ${INV[t].n.toLowerCase()} en ${rd.nm}.`;}});}));
    openSheet(`<h3>Invertir en ${rd.nm}</h3><div class="hint">Crecimiento de la provincia: ${pct(((G.regions[rid].gl)||.02)*100)} al año · ${G.nations[G.regions[rid].o].name}${warsOf(G.regions[rid].o).length?' · <span class="pill war">país en guerra: riesgo de expropiación</span>':''}</div>`+listHTML(opts,'sec'),b=>b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{const r=opts[+el.dataset.i].fn();log(r,'good');fix(p);save();closeSheet();render();}));}
  if(k==='biz'){const c=.4*T;const opts=BIZT.map((b,i)=>({t:`${b.ic} ${b.n}`,s:`Inversión inicial ${fmt(c)} · gana ~${fmt(U(p)*BIZR[0])}/año al empezar; crece si inviertes`,can:p.dinero>=c,fn:()=>{p.dinero-=c;p.biz={t:i,lvl:0,r:rid,luck:1,y:G.year};sfx('coin');return `Abres tu ${b.n.toLowerCase()} en ${rd.nm}.`;}}));
    openSheet(`<h3>Abrir negocio en ${rd.nm}</h3><div class="hint">Tu negocio rinde según la economía de la provincia y la suerte del año. Lo administras en Más → Bienes y negocios.</div>`+listHTML(opts),b=>b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{log(opts[+el.dataset.i].fn(),'good');save();closeSheet();render();}));}
  if(k==='move'){const same=G.regions[rid].o===natOf(p).id;const c=same?.15*T:.5*T;const d=G.nations[G.regions[rid].o],cur=natOf(p);const visa=same?1:clamp(.9-(gdppc(d)/gdppc(cur)-1)*.15,.25,.95);
    const opts=[{t:same?`Mudarte a ${rd.nm} (${fmt(c)})`:`Emigrar a ${d.name} (${fmt(c)})`,s:same?'Mudanza dentro del país':`Probabilidad de visa ${Math.round(visa*100)} % · pierdes tu empleo`,can:p.dinero>=c||!isReal(),fn:()=>{p.dinero-=c;if(!chance(visa))return `Te niegan la visa para ${d.name}.`;p.r=rid;G.sel=rid;if(!same){p.job=null;if(p.career.track!=='negocios')p.career={track:null,rank:0,years:0};}p.ppl=p.ppl.filter(x=>x.k!=='jefe');p.s.felicidad+=same?2:-4;return `Te mudas a ${rd.nm}, ${d.name}.`;}}];
    openSheet(`<h3>Mudarte</h3>`+listHTML(opts),b=>b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{log(opts[+el.dataset.i].fn(),'big');save();closeSheet();render();}));}
  if(k==='build')showBuild(rid);}
function showBuild(rid){const n=natOf(P),rd=RG[rid];const opts=Object.entries(BLD).map(([k,b])=>{const c=bldCost(rid,k),lv=bl(rid,k);
  return {t:`${b.ic} ${b.n} ${lv?'(nivel '+lv+' → '+(lv+1)+')':''}`,s:`${b.d} · ${fmtN(c)}`,can:canBuild(rid,k)&&(n.treas||0)>=c,fn:()=>{n.treas-=c;build(rid,k);P.built=(P.built||0)+1;sfx('coin');return `Construyes ${b.n.toLowerCase()} en ${rd.nm}.`;}};});
  openSheet(`<h3>Obras en ${rd.nm}</h3><div class="hint">Tesoro nacional: <b>${fmtN(n.treas||0)}</b> (recibe ${fmtN(treasuryIncome(n))} al año). Edificios aquí: ${bldIcons(rid)||'ninguno'}</div>`+listHTML(opts),
   b=>b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{log(opts[+el.dataset.i].fn(),'good');save();render();showBuild(rid);}));}
const bldIcons=r=>{const x=G.regions[r];return x&&x.b?Object.entries(x.b).filter(([k,v])=>v).map(([k,v])=>BLD[k].ic+(v>1?'×'+v:'')).join(' '):'';};
/* ----- bienes y negocios ----- */
function showAssets(){const p=P,T=U(p),real=isReal();const items=[];
  if(p.biz){const b=p.biz,tp=BIZT[b.t];items.push({sec:'Tu negocio',t:`${tp.ic} ${tp.n} · ${BIZL[b.lvl]}`,s:`En ${RG[b.r].nm} · ganancia último año ${fmt(b.last||0)} · suerte ${Math.round((b.luck||1)*100)} %`,can:false});
    if(b.lvl<3)items.push({sec:'Tu negocio',t:`Expandir a ${BIZL[b.lvl+1]} (${fmt(BIZUP[b.lvl+1]*T)})`,s:`Ganancia esperada ~${fmt(T*BIZR[b.lvl+1])}/año`,can:p.dinero>=BIZUP[b.lvl+1]*T,fn:()=>{p.dinero-=BIZUP[b.lvl+1]*T;b.lvl++;sfx('good');return `Tu negocio crece: ahora es ${BIZL[b.lvl].toLowerCase()}.`;}});
    items.push({sec:'Tu negocio',t:`Vender el negocio (${fmt((b.last||bizRevenue(p))*3)})`,s:'Tres años de ganancias',can:true,fn:()=>{const v=(b.last||bizRevenue(p))*3;p.dinero+=v;p.biz=null;return `Vendes tu negocio por ${fmt(v)}.`;}});}
  p.inv.forEach((v,i)=>items.push({sec:'Inversiones',t:`${INV[v.t].n} en ${RG[v.r].nm}`,s:`Invertiste ${fmt(v.amt)} en ${v.y} · vale ${fmt(v.val)} (${v.val>=v.amt?'+':''}${Math.round((v.val/v.amt-1)*100)} %) · toca para vender`,can:true,fn:()=>{const x=sellInv(p,i);sfx('coin');return `Vendes tu inversión por ${fmt(x)}.`;}}));
  if(!p.inv.length)items.push({sec:'Inversiones',t:'Sin inversiones',s:'Toca una provincia del mapa → Invertir',can:false});
  p.assets.forEach((a,i)=>items.push({sec:'Autos',t:`🚗 ${CARS[a.ci].n}`,s:`Vale ${fmt(a.val)} · toca para vender`,can:true,fn:()=>{p.dinero+=a.val*.9;p.assets.splice(i,1);return `Vendes tu ${CARS[a.ci].n.toLowerCase()}.`;}}));
  CARS.forEach((c,i)=>items.push({sec:'Comprar auto',t:`${c.n} (${fmt(c.k*T)})`,s:(c.ap?'+Felicidad, +Apariencia · se deprecia 12 % al año':'+Felicidad · se deprecia 12 % al año'),can:p.age>=18&&p.dinero>=c.k*T&&p.assets.length<3,fn:()=>{p.dinero-=c.k*T;p.assets.push({ci:i,val:c.k*T,y:G.year});p.s.felicidad+=c.h;p.s.apariencia+=c.ap||0;sfx('coin');return `Compras un ${c.n.toLowerCase()}.`;}}));
  if(!real){if(!p.house)items.push({sec:'Vivienda',t:`Comprar casa de contado (${fmt(5*T)})`,s:'Ya no pagas renta: bajan tus gastos',can:p.age>=18&&p.dinero>=5*T,fn:()=>{p.dinero-=5*T;p.house={val:5*T,y:G.year};p.s.felicidad+=8;return 'Compras tu casa.';}});
    else items.push({sec:'Vivienda',t:`Vender tu casa (${fmt(p.house.val)})`,s:'',can:true,fn:()=>{p.dinero+=p.house.val;p.house=null;return 'Vendes tu casa.';}});}
  else items.push({sec:'Vivienda',t:p.house?`🏠 Tu casa vale ${fmt(p.house.val)}`:'Comprar casa con hipoteca',s:'En Más → Finanzas y préstamos',can:false});
  openSheet(`<h3>Bienes y negocios</h3><div class="hint">Patrimonio neto: <b>${fmt(netWorth(p))}</b></div>`+listHTML(items,'sec'),b=>b.querySelectorAll('.item[data-i]').forEach(el=>el.onclick=()=>{const it=items[+el.dataset.i];if(!it.fn)return;log(it.fn());fix(p);save();render();showAssets();}));}
/* ----- ajustes ----- */
function showSettings(){openSheet(`<h3>Ajustes</h3>
  <button class="item" id="sSnd"><span><div class="t">Sonido y música: ${CFG.snd?'encendido':'apagado'}</div><div class="s">Generados por el juego, sin descargas</div></span></button>
  <button class="item" id="sFf"><span><div class="t">Avance rápido (⏩): ${CFG.ff==='todo'?'se detiene en todos los eventos':'decide al azar lo menor y se detiene en lo importante'}</div><div class="s">Toca para cambiar</div></span></button>
  <button class="item" id="sPap"><span><div class="t">Periódico del año: ${{imp:'solo años importantes',siempre:'siempre',nunca:'nunca'}[CFG.paper]}</div><div class="s">Toca para cambiar</div></span></button>
  <button class="item" id="sMfx"><span><div class="t">Efectos del mapa: ${CFG.mfx===0?'apagados':'encendidos'}</div><div class="s">Agua con oleaje en la costa, borde de color en cada país y textura. Apágalos si el mapa va lento</div></span></button>
  <button class="item" id="sRoad"><span><div class="t">Carreteras en el mapa: ${CFG.road===0?'ocultas':'visibles al acercar'}</div><div class="s">Red real de autopistas y carreteras (Natural Earth)</div></span></button>`,b=>{
  b.querySelector('#sMfx').onclick=()=>{CFG.mfx=CFG.mfx===0?1:0;saveCfg();refreshMap();showSettings();};
  b.querySelector('#sRoad').onclick=()=>{CFG.road=CFG.road===0?1:0;saveCfg();refreshMap();showSettings();};
  b.querySelector('#sSnd').onclick=()=>{CFG.snd=CFG.snd?0:1;saveCfg();if(CFG.snd)ac();showSettings();};
  b.querySelector('#sFf').onclick=()=>{CFG.ff=CFG.ff==='todo'?'imp':'todo';saveCfg();showSettings();};
  b.querySelector('#sPap').onclick=()=>{CFG.paper={imp:'siempre',siempre:'nunca',nunca:'imp'}[CFG.paper];saveCfg();showSettings();};});}
/* ----- avanzar varios años ----- */
function fastForward(n){if(!P||!P.alive||P.event)return;let last=null;for(let i=0;i<n;i++){ageUp();if(P._paper&&P._paper.imp)last=P._paper;
    if(P.event&&CFG.ff!=='todo'){const e=EV.find(x=>x.id===P.event.id);if(e&&!e.prio&&P.event.id!=='diagnostico'){resolveEvent(Math.floor(Math.random()*P.event.opts.length),'Avance rápido');if(P._dx&&P.alive)setEvent(P,EV.find(x=>x.id==='diagnostico'));}}
    if(!P.alive||P.event)break;}P._paper=P.event||!P.alive?null:last;save();sfx('year');render();pulseConquests();}
