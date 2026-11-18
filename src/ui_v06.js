/* ===== v0.6 etapa 2: iconos propios, ropa según trabajo, ilustraciones por etapa ===== */
const IC={
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
 brief:'<path d="M9 4h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2zm0 3h6V6H9v1zM2 12h20"/>',
 col:'<path d="M12 2 2 7v2h20V7L12 2zM4 11v7M8 11v7M12 11v7M16 11v7M20 11v7M2 20h20v2H2z"/>',
 crown:'<path d="M3 18 2 7l5 4 5-7 5 7 5-4-1 11H3zm0 2h18v2H3z"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 heart:'<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
 brain:'<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V3H9zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V3h1z"/>',
 star:'<path d="m12 2 3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z"/>',
 mega:'<path d="M3 10v4h4l6 4V6L7 10H3zm13-2a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6v2M12 16v2"/>',
 sword:'<path d="M14.5 3H21v6.5L10 20.5l-2-2L4.5 22 2 19.5 5.5 16l-2-2L14.5 3z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M14 20c0-2.5 1.5-4.5 3.5-4.5S21 17.5 21 20"/>',
 cap:'<path d="M2 9 12 4l10 5-10 5L2 9zm4 2v5c2 2 10 2 12 0v-5M22 9v6"/>',
 cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
 home:'<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>',
 mtn:'<path d="M2 20 9 7l4 7 3-4 6 10z"/>',
 up:'<path d="M3 17 9 11l4 4 8-8M15 7h6v6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'};
const ico=(k,s,c)=>`<svg class="ico" viewBox="0 0 24 24" width="${s||20}" height="${s||20}" fill="${['menu','smile','globe','people','cap','coin','mega'].includes(k)?'none':(c||'currentColor')}" stroke="${['menu','smile','globe','people','cap','coin','mega','brief','col'].includes(k)?(c||'currentColor'):'none'}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
/* ----- ropa según lo que hace la persona ----- */
function outfitOf(p){if(!p||p.age==null)return null;if(!p.alive&&p.alive!==undefined)return null;
  if(p.prison)return 'preso';if(p.ruler)return natOf(p).gov==='dictadura'?'dictador':'presidente';if(p.age<3)return 'bebe';if(p.age<13)return 'nino';
  if(p.edu&&p.edu.uni)return 'uni';if(p.age<18)return 'teen';const c=p.career||{};
  if(c.track==='militar')return c.rank>=5?'general':'militar';if(c.track==='politica')return 'traje';if(c.track==='negocios')return c.rank>=2?'traje':'oficina';
  const j=p.job&&p.job.name||'';if(/Médico/.test(j))return 'medico';if(/Policía/.test(j))return 'policia';if(/Obrero|Albañil|Técnico/.test(j))return 'obrero';
  if(/Mesero/.test(j))return 'mesero';if(/Programador|Ingeniero/.test(j))return 'sudadera';if(/Campesino/.test(j))return 'campo';if(/Abogado|Oficinista|Servidor|Profesor/.test(j))return 'oficina';
  if(p.pension)return 'jubilado';if(p.biz)return 'delantal';return null;}
function outfitSVG(o,sd){const T='M30 86 Q50 76 70 86 L76 100 L24 100 Z';switch(o){
  case 'traje':case 'presidente':return `<path d="${T}" fill="#1f2a3a"/><path d="M44 80 L50 92 L56 80 Z" fill="#f2f2f2"/><path d="M49 82 L51 82 L52 94 L50 97 L48 94 Z" fill="${['#b03030','#2f5fa8','#7a2f8a'][sd%3]}"/>`+(o==='presidente'?`<path d="M30 86 L70 100 L64 100 L28 90 Z" fill="#c9a23a" opacity=".95"/><path d="M30 86 L44 91 L42 94 L29 89Z" fill="#2e7d32"/>`:'');
  case 'militar':case 'general':case 'dictador':return `<path d="${T}" fill="#4b5a2a"/><path d="M42 80 L50 88 L58 80" stroke="#35401c" stroke-width="2" fill="none"/>`+(o!=='militar'?`<circle cx="36" cy="90" r="2" fill="#f2c14e"/><circle cx="64" cy="90" r="2" fill="#f2c14e"/><path d="M33 94h7M60 94h7" stroke="#b03030" stroke-width="2"/>`:`<rect x="58" y="88" width="7" height="4" fill="#2f3a18"/>`);
  case 'medico':return `<path d="${T}" fill="#f4f6f8"/><path d="M44 80 L50 92 L56 80 Z" fill="#7fb3d5"/><path d="M40 84 Q38 96 46 96 Q52 96 50 90" stroke="#333" stroke-width="1.6" fill="none"/><circle cx="50" cy="90" r="1.8" fill="#888"/>`;
  case 'policia':return `<path d="${T}" fill="#1e3a6e"/><path d="M58 88 l3-2 3 2-1 4h-4z" fill="#f2c14e"/>`;
  case 'obrero':return `<path d="${T}" fill="#e67e22"/><path d="M36 86 L40 100M64 86 L60 100" stroke="#f4e04d" stroke-width="2.5"/>`;
  case 'mesero':return `<path d="${T}" fill="#f4f6f8"/><path d="M44 81 l6 3 6-3 -6 3z M44 80 L50 84 L44 88Z M56 80 L50 84 L56 88Z" fill="#111"/><path d="M38 92 h24 v8 h-24z" fill="#222"/>`;
  case 'sudadera':return `<path d="${T}" fill="#5d6b7a"/><path d="M40 82 Q50 90 60 82" stroke="#47525e" stroke-width="2" fill="none"/><path d="M46 86v7M54 86v7" stroke="#eee" stroke-width="1.2"/>`;
  case 'campo':return `<path d="${T}" fill="#a8452c"/><path d="M30 92h40M30 97h40M40 86v14M50 84v16M60 86v14" stroke="#7a2e1b" stroke-width="1.2"/>`;
  case 'oficina':return `<path d="${T}" fill="#dfe8f2"/><path d="M44 80 L50 88 L56 80" stroke="#9fb3c8" stroke-width="2" fill="none"/>`;
  case 'jubilado':return `<path d="${T}" fill="#c8b48a"/><path d="M50 82v18" stroke="#9e8a60" stroke-width="1.5"/><circle cx="50" cy="88" r="1" fill="#6b5a38"/><circle cx="50" cy="94" r="1" fill="#6b5a38"/>`;
  case 'delantal':return `<path d="${T}" fill="#3d6ea8"/><path d="M40 86 h20 v14 h-20z" fill="#f2f2f2"/>`;
  case 'preso':return `<path d="${T}" fill="#e8742a"/>`;
  case 'uni':case 'teen':return `<path d="${T}" fill="${['#3d6ea8','#a8443d','#3d8a5a','#7a5aa8','#c08a2a'][sd%5]}"/><path d="M34 86 L38 100" stroke="#333" stroke-width="3"/>`;
  case 'bebe':return `<path d="${T}" fill="#bfe0f5"/>`;default:return '';}}
function hatSVG(o,hc){switch(o){
  case 'obrero':return `<path d="M27 38 Q28 18 50 18 Q72 18 73 38 Z" fill="#f4c20d"/><rect x="24" y="36" width="52" height="5" rx="2" fill="#d9a800"/>`;
  case 'dictador':case 'general':return `<path d="M28 34 Q30 16 50 16 Q70 16 72 34 Z" fill="#4b5a2a"/><rect x="24" y="32" width="52" height="6" rx="3" fill="#2f3a18"/><circle cx="50" cy="25" r="3" fill="#f2c14e"/>`;
  case 'policia':return `<path d="M30 34 Q32 20 50 20 Q68 20 70 34 Z" fill="#1e3a6e"/><rect x="27" y="32" width="46" height="5" rx="2" fill="#0f1f3d"/><circle cx="50" cy="27" r="2.5" fill="#f2c14e"/>`;
  case 'campo':return `<ellipse cx="50" cy="32" rx="34" ry="6" fill="#d9b86a"/><path d="M34 32 Q36 16 50 16 Q64 16 66 32Z" fill="#e6c87a"/><path d="M35 28h30" stroke="#a5762a" stroke-width="2"/>`;
  case 'medico':return '';default:return '';}}
/* parchea face(): ropa y sombreros */
const _faceBase=face;
face=function(x,size,o){o=o||{};const out=o.outfit!==undefined?o.outfit:(x&&x.career!==undefined?outfitOf(x):null);if(!out)return _faceBase(x,size,o);
  const sd=hsh(x.name||(x.first+' '+x.surname)||'x');let s=_faceBase(x,size,Object.assign({},o,{shirt:'none'}));
  const hc=null;const i=s.indexOf('<rect x="44"');const cl=s.lastIndexOf('</svg>');
  return s.slice(0,i)+outfitSVG(out,sd)+s.slice(i,cl)+hatSVG(out,hc)+'</svg>';};
/* ----- ilustración por etapa de vida (fondo de la tarjeta) ----- */
function stageOf(p){if(!p.alive)return 'fin';if(p.prison)return 'prision';if(atWar(p)&&p.career.track==='militar')return 'guerra';if(p.ruler)return 'palacio';if(p.age<5)return 'cuna';if(p.age<18)return 'escuela';if(p.edu.uni)return 'uni';if(p.pension||p.age>=68)return 'retiro';return 'ciudad';}
function stageArt(st){const W=400,H=90;let g='';const r=(n,a,b)=>a+(hsh(st+n)%1000)/1000*(b-a);
  switch(st){
  case 'cuna':g=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27304d"/><stop offset="1" stop-color="#3a2f4d"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg)"/>`+[...Array(14)].map((_,i)=>`<path d="m${r('x'+i,10,390)} ${r('y'+i,8,70)} l2 5 5 0-4 3 2 5-5-3-5 3 2-5-4-3 5 0z" fill="#f6e7a8" opacity=".55"/>`).join('')+`<circle cx="340" cy="26" r="14" fill="#f6e7a8" opacity=".7"/><circle cx="346" cy="22" r="13" fill="#2b3150"/>`;break;
  case 'escuela':g=`<rect width="${W}" height="${H}" fill="#1f3a2e"/><rect x="18" y="12" width="230" height="58" rx="3" fill="#2d5240" stroke="#8a6a3a" stroke-width="4"/><path d="M40 34h60M40 46h90M140 30l20 20M160 30l-20 20M190 40a12 12 0 1 0 1 0" stroke="#e8f0e8" stroke-width="2" fill="none" opacity=".7"/><rect x="290" y="30" width="60" height="45" fill="#c0392b" opacity=".8"/><path d="M285 30l35-18 35 18" fill="#8e2a20" opacity=".8"/>`;break;
  case 'uni':g=`<rect width="${W}" height="${H}" fill="#2a2f45"/><path d="M220 75V30l70-18 70 18v45z" fill="#3c4466"/>`+[0,1,2,3,4].map(i=>`<rect x="${232+i*24}" y="34" width="8" height="41" fill="#59628a"/>`).join('')+`<path d="M40 50l40-16 40 16-40 16z" fill="#1b1f30"/><path d="M60 58v10c10 6 30 6 40 0V58" stroke="#1b1f30" stroke-width="4" fill="none"/>`;break;
  case 'ciudad':g=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3b5a"/><stop offset="1" stop-color="#e08a5a"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg)"/>`+[...Array(16)].map((_,i)=>{const w=r('w'+i,16,30),h=r('h'+i,25,75),x=i*25;return `<rect x="${x}" y="${H-h}" width="${w}" height="${h}" fill="#14243a" opacity=".85"/>`+[...Array(4)].map((_,j)=>`<rect x="${x+4}" y="${H-h+6+j*12}" width="4" height="4" fill="#f6d27a" opacity="${(i+j)%3?.15:.8}"/>`).join('');}).join('');break;
  case 'palacio':g=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f0e"/><stop offset="1" stop-color="#5a4318"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg)"/><path d="M200 28l100-20 100 20z" fill="#c9a23a" opacity=".7"/><rect x="200" y="28" width="200" height="6" fill="#c9a23a" opacity=".7"/>`+[0,1,2,3,4,5].map(i=>`<rect x="${210+i*32}" y="36" width="10" height="54" fill="#d8c27a" opacity=".55"/>`).join('');break;
  case 'guerra':g=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a14"/><stop offset="1" stop-color="#7a3a1a"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg)"/>`+[...Array(8)].map((_,i)=>`<circle cx="${r('cx'+i,180,400)}" cy="${r('cy'+i,20,70)}" r="${r('r'+i,10,26)}" fill="#2a1a16" opacity=".5"/>`).join('')+`<path d="M0 80 Q100 60 200 78 T400 74 V90H0z" fill="#1a100c"/>`;break;
  case 'retiro':g=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a35a"/><stop offset="1" stop-color="#8a4a6a"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg)"/><circle cx="320" cy="70" r="26" fill="#ffd27a" opacity=".85"/><path d="M0 72 Q120 60 240 74 T400 70 V90H0z" fill="#3a2a40"/>`;break;
  case 'prision':g=`<rect width="${W}" height="${H}" fill="#2a2d33"/>`+[...Array(14)].map((_,i)=>`<rect x="${210+i*14}" y="0" width="5" height="${H}" fill="#555b66"/>`).join('');break;
  case 'fin':g=`<rect width="${W}" height="${H}" fill="#1a1d22"/>`;break;}
  return `<svg class="stage" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${g}</svg>`;}
/* ----- iconos en la barra inferior y en las estadísticas ----- */
(function(){const set=(id,k)=>{const e=$(id);if(e)e.querySelector('.ic').innerHTML=ico(k,22);};set('nAct','bolt');set('nCar','brief');set('nNat','col');set('nMore','menu');
  const mm={pol:'col',ter:'globe',ric:'coin',pob:'people',est:'smile',des:'home',mil:'mtn',dip:'globe',hap:'smile',core:'star',ideo:'crown',dev:'up'};document.querySelectorAll('.mmodes button').forEach(b=>b.innerHTML=ico(mm[b.dataset.mm]||'star',17));})();
const STAT_IC={salud:'heart',felicidad:'smile',inteligencia:'brain',apariencia:'star',influencia:'mega'};
function evIcon(id,text){const t=id+' '+text;if(/guerra|militar|frente|espia|reclut|golpe|rebel|atentado|bonos|refugi/i.test(t))return ['sword','#f0565d'];if(/eleccion|presid|ministro|gobierno|onu|cumbre|congreso|naci|poder/i.test(t))return ['crown','#f2c14e'];
  if(/diagn|salud|médic|dentista|hospital|terapia|enferm|lesion|varicela|insomnio|dieta|fumar/i.test(t))return ['cross','#47c26b'];if(/dinero|negocio|invert|loter|cripto|herencia|bolsa|préstamo|prestamo|presta|usura|mordida|deuda|bancarrota/i.test(t))return ['coin','#3fb6a8'];
  if(/escuela|examen|universidad|olimpiada|feria|maestro|graduac|beca|orienta/i.test(t))return ['cap','#5aa2f0'];if(/amigo|boda|pareja|hijo|herman|padre|madre|nieto|familia|rival|suegro|aniversario/i.test(t))return ['people','#e07ad8'];
  if(/sismo|huracan|sequia|pandemia|mundo|viaje|intercambio|mochilero/i.test(t))return ['globe','#5aa2f0'];return ['star','#f2c14e'];}
