/* ===== v1.7c: idiomas (v1.7d: francés, alemán e italiano; v1.7e: ruso, turco e indonesio; v1.7f: chino, japonés y coreano) =====
   El juego está escrito en español; para otros idiomas, una capa traduce lo que aparece en pantalla (texto, opciones, placeholder, title, aria-label)
   con los diccionarios de data_i18n.js. Reglas, en orden:
   1) frase completa; 2) la frase sin íconos ni puntuación al principio o al final; 3) partes separadas por « · » o « | »;
   4) partes separadas por números (si todas las palabras se traducen: «⏳ 20 días» → «⏳ 20 days»); 5) fechas «8 ene 2026» con el formato del idioma.
   Países: nombres desde los datos de idioma del propio navegador (Intl.DisplayNames), en cualquier idioma, sin diccionario.
   Lo que no está en el diccionario (por ahora, la narrativa: eventos, diálogos, noticias y registro) se queda en español.
   Con español activo esta capa no hace nada (cero costo).
   v1.7k (B6 parte 2, narrativa): orden actual en tr(): frase (I18N, luego diccionario por hash I18X) → fechas → partes separadas por «; » → (v1.7l) partes «opción → resultado» →
   plantillas (con índice por palabra fija) → varias oraciones (agrupa oraciones seguidas hasta encontrar traducción) → « · » / « | » → listas con comas
   → «etiqueta: valor» → partes separadas por números. Dentro de una plantilla, un valor con artículo español («el peso mexicano», «a la Reserva Federal»)
   se arma con el artículo del idioma (art), y «A y B» entre nombres usa la conjunción del idioma. */
const LANGS=[['es','Español','🇲🇽'],['en','English','🇺🇸'],['pt','Português','🇧🇷'],['fr','Français','🇫🇷'],['de','Deutsch','🇩🇪'],['it','Italiano','🇮🇹'],['ru','Русский','🇷🇺'],['tr','Türkçe','🇹🇷'],['id','Bahasa Indonesia','🇮🇩'],['zh','中文（简体）','🇨🇳'],['ja','日本語','🇯🇵'],['ko','한국어','🇰🇷'],['ar','العربية','🇸🇦'],['hi','हिन्दी','🇮🇳']];
const LANGS_SOON='';
const LANG_SOONW={es:'Próximamente',en:'Coming soon',pt:'Em breve',fr:'Bientôt',de:'Demnächst',it:'Prossimamente',ru:'Скоро',tr:'Yakında',id:'Segera hadir',zh:'即将推出',ja:'近日公開',ko:'곧 출시',ar:'قريبًا',hi:'जल्द आ रहा है'};
if(!CFG.lang){const nl=(navigator.language||'es').slice(0,2).toLowerCase();CFG.lang=LANGS.some(l=>l[0]===nl)?nl:'es';saveCfg();}
const LANG=LANGS.some(l=>l[0]===CFG.lang)?CFG.lang:'es';
document.documentElement.lang=LANG==='zh'?'zh-Hans':LANG;
/* v1.7g: árabe de derecha a izquierda. Las reglas fijas left/right del CSS se invierten aquí; canvas (mapa, gráficas) y cintas de noticias/cotizaciones se quedan de izquierda a derecha. */
if(LANG==='ar'){document.documentElement.dir='rtl';const st=document.createElement('style');st.id='rtlcss';st.textContent='html[dir=rtl] .money,html[dir=rtl] .prow .hv{text-align:left}html[dir=rtl] .item,html[dir=rtl] .modal .opt{text-align:right}html[dir=rtl] .lg .a{margin-right:0;margin-left:6px}html[dir=rtl] .pill{margin-left:0;margin-right:4px}html[dir=rtl] .mlk{margin-right:0;margin-left:7px}html[dir=rtl] .mlk i{margin-right:0;margin-left:3px}html[dir=rtl] [style*="text-align:left"]{text-align:right!important}html[dir=rtl] [style*="text-align:right"]{text-align:left!important}html[dir=rtl] [style*="margin-left:auto"]{margin-left:0!important;margin-right:auto!important}html[dir=rtl] [style*="float:right"]{float:left!important}html[dir=rtl] #hlp .x{right:auto;left:8px}html[dir=rtl] canvas,html[dir=rtl] #tick,html[dir=rtl] #mtick,html[dir=rtl] .atb .bg{direction:ltr}html[dir=rtl] #tick .rl span,html[dir=rtl] #mtick span{unicode-bidi:plaintext}html[dir=rtl] ul,html[dir=rtl] ol{padding-left:0;padding-right:18px}html[dir=rtl] .guia p,html[dir=rtl] .guia li,html[dir=rtl] #hlp p,html[dir=rtl] .hint{unicode-bidi:plaintext}';document.head.appendChild(st);}
/* v1.7g: locale para Intl: árabe con dígitos occidentales (los mismos que usa el resto del juego). */
const LOC=LANG==='ar'?'ar-u-nu-latn':LANG; // v1.7f: el idioma correcto hace que el teléfono elija la variante de los caracteres CJK (japonés ≠ chino)
if(LANG!=='es'&&typeof i18Load==='function'){try{i18Load(LANG);}catch(e){console.warn('i18Load',e);}} /* v1.7p: diccionarios comprimidos; solo se abre el idioma activo */
const I18=(function(){if(LANG==='es')return null;const D=Object.assign({},I18N[LANG]||{});
  // países: nombre español → nombre en el idioma (datos del navegador)
  try{const dn=new Intl.DisplayNames([LANG],{type:'region'});const W=(typeof WORLD!=='undefined'&&WORLD.nations)||{};for(const id in W){const i2=ISO2[id];if(!i2)continue;const n=dn.of(i2);if(n&&n!==i2){D[W[id].nm]=n;D[W[id].nm.toUpperCase()]=n.toUpperCase();}}}catch(e){}
  /* v1.7j: monedas («peso mexicano» → «Mexican Peso»), también desde los datos de idioma del navegador */
  try{const dc=new Intl.DisplayNames([LANG],{type:'currency'});if(typeof CUR0!=='undefined')for(const c in CUR0){const nm=CUR0[c][1],v=dc.of(c);if(v&&v!==c&&D[nm]==null)D[nm]=v;}
    /* v1.7k: monedas anteriores al euro y a la dolarización (OLD_CUR: «marco alemán» → DEM) */
    if(typeof OLD_CUR!=='undefined')for(const k in OLD_CUR){const [c,,nm]=OLD_CUR[k],v=dc.of(c);if(v&&v!==c&&D[nm]==null)D[nm]=v;}}catch(e){}
  const MES={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  const fD=new Intl.DateTimeFormat(LOC,{day:'numeric',month:'short',year:'numeric'});
  const fMY=new Intl.DateTimeFormat(LOC,{month:'short',year:'numeric'});
  const fDH=new Intl.DateTimeFormat(LOC,{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); // «10 nov 05:47 p. m.» (ranuras)
  // variantes en minúscula (para frases como «Practicar composición») y plantillas con {0}, {1}…
  for(const k of Object.keys(D)){const v=D[k];if(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]/.test(k)){const lk=k[0].toLowerCase()+k.slice(1);if(D[lk]==null)D[lk]=(LANG==='de'||!/^\p{Lu}/u.test(v))?v:v[0].toLocaleLowerCase(LANG)+v.slice(1);} /* v1.7f: también sin mayúsculas (chino, japonés, coreano) */}
  const esc=t=>t.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
  const TP=((typeof I18T!=='undefined'&&I18T[LANG])||[]).map(([es,o])=>{const ord=[];const rx=new RegExp('^'+esc(es).replace(/\{(\d)\}/g,(m,n)=>{ord.push(+n);return '(.+?)';})+'$');return [rx,ord,o,es.replace(/\{\d\}/g,'').length,es];}).sort((a,b)=>b[3]-a[3]);
  /* v1.7k: índice de plantillas por palabra fija. Cada plantilla se guarda bajo la palabra fija menos frecuente de su texto que no toque un {n}
     (así la palabra aparece completa en cualquier texto que la plantilla reconozca); un texto solo prueba las plantillas de sus propias palabras,
     más las pocas que no tienen palabra fija segura (TPG). Con ~1,000 plantillas, un texto sin traducción prueba ~5–40 en vez de todas. */
  const WRX=/[\p{L}\p{M}]+/gu;
  const safeW=es=>{const out=[];const seg=es.split(/(\{\d\})/);seg.forEach((sg,i)=>{if(i%2)return;const ws=[...sg.matchAll(WRX)];ws.forEach(w=>{const a=w.index,b=a+w[0].length;if(a===0&&i>0)return;if(b===sg.length&&i<seg.length-1)return;out.push(w[0]);});});return out;};
  const TPX=new Map(),TPG=[];{const fq=new Map();const sw=TP.map(t=>{const ws=[...new Set(safeW(t[4]))];ws.forEach(w=>fq.set(w,(fq.get(w)||0)+1));return ws;});
    TP.forEach((t,i)=>{t[5]=i;const ws=sw[i];if(!ws.length){TPG.push(t);return;}let b=ws[0];ws.forEach(w=>{if(fq.get(w)<fq.get(b))b=w;});let a=TPX.get(b);if(!a)TPX.set(b,a=[]);a.push(t);});}
  const cands=x=>{const S=new Set(x.match(WRX)||[]);const o=TPG.slice();S.forEach(w=>{const a=TPX.get(w);if(a)for(const t of a)o.push(t);});return o.length>1?o.sort((a,b)=>a[5]-b[5]):o;};
  /* v1.7k: diccionario de narrativa por hash (I18X): por idioma, una cadena JSON {FNV-1a del español exacto en base 36 + «.» + longitud en base 36: traducción}.
     Solo se parsea el idioma activo. La longitud en la clave baja la probabilidad de que un texto cualquiera (no traducido) choque con una clave. */
  let X=null;try{if(typeof I18X!=='undefined'&&I18X[LANG])X=JSON.parse(I18X[LANG]);}catch(e){console.warn('I18X',e);}
  const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36)+'.'+s.length.toString(36);};
  const lowF=v=>(LANG==='de'||!/^\p{Lu}/u.test(v))?v:v[0].toLocaleLowerCase(LANG)+v.slice(1);
  function xget(s){if(!X)return null;let r=X[hk(s)];if(r!=null)return r;if(/^[a-záéíóúñ]/.test(s)){r=X[hk(s[0].toUpperCase()+s.slice(1))];if(r!=null)return lowF(r);}return null;}
  const COLON=LANG==='fr'?' : ':(LANG==='zh'||LANG==='ja')?'：':': ';const cache=new Map();const LET=/[A-Za-zÁÉÍÓÚÑÜáéíóúñü]/;
  function core(s){if(D[s]!=null)return D[s];const h=xget(s);if(h!=null)return h;
    if(s.length>2&&/^[A-ZÁÉÍÓÚÑÜ ]+$/.test(s)){const c=s[0]+s.slice(1).toLowerCase();const v=D[c]!=null?D[c]:xget(c);if(v!=null)return v.toLocaleUpperCase(LANG);} /* v1.7k: etiquetas en mayúsculas («ECONOMÍA», «GUERRA» del portal de noticias) */
    const m=s.match(/^([^A-Za-zÁÉÍÓÚÑÜáéíóúñü¿¡]*)(.*?)([\s.:,;!?»)(…·]*)$/);if(m&&m[2]&&(m[1]||m[3])){for(let k=m[3].length;k>=0;k--){const key=m[2]+m[3].slice(0,k);if(D[key]!=null)return m[1]+D[key]+m[3].slice(k);const h2=xget(key);if(h2!=null)return m[1]+h2+m[3].slice(k);if(key.length>2&&/^[A-ZÁÉÍÓÚÑÜ ]+$/.test(key)){const c=key[0]+key.slice(1).toLowerCase();const v=D[c]!=null?D[c]:xget(c);if(v!=null)return m[1]+v.toLocaleUpperCase(LANG)+m[3].slice(k);}}} /* v1.7m: también mayúsculas con ícono delante («⚠️ MALA SUERTE», «🍀 SUERTE» de los diálogos) */
    /* v1.7n: inicial en otra caja. El motor pone en minúscula datos que el diccionario tiene con mayúscula («gira regional», «sencillo», «arena»): se busca
       con mayúscula y se baja la inicial de la traducción (salvo en alemán y si la traducción empieza con sigla). Al revés, frases de 2+ palabras con
       mayúscula inicial («Una noche floja») se buscan en minúscula; no se aplica a una sola palabra para no traducir nombres propios («Luna», «Paz»). */
    if(/^[a-záéíóúñü]/.test(s)){const c=s[0].toUpperCase()+s.slice(1);const v=D[c]!=null?D[c]:xget(c);if(v!=null)return LANG==='de'||!/^.\p{Ll}/u.test(v)?v:v[0].toLocaleLowerCase(LANG)+v.slice(1);}
    else if(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñü]* \S/.test(s)){const c=s[0].toLowerCase()+s.slice(1);const v=D[c]!=null?D[c]:xget(c);if(v!=null)return v[0].toLocaleUpperCase(LANG)+v.slice(1);}
    return null;}
  /* v1.7k: «A y B» entre nombres propios dentro de una plantilla («Tus padres: Ana López y Luis Pérez») usa la conjunción del idioma. */
  const AND={en:' and ',pt:' e ',fr:' et ',de:' und ',it:' e ',ru:' и ',tr:' ve ',id:' dan ',zh:'和',ja:'と',ko:' 및 ',ar:' و',hi:' और '}[LANG]||' y ';
  const YRX=/^(\p{Lu}[^,;:·]*?) y (\p{Lu}[^,;:·]*)$/u;
  /* v1.7k: francés e italiano: elisión solo donde la plantilla pone un artículo justo delante de un {n} cuyo valor empieza con vocal
     («du {0}» + «euro» → «de l'euro»; «il {0}» → «l'euro»). No toca el resto del texto. */
  const ELM=LANG==='fr'?{'le':"l'",'la':"l'",'du':"de l'",'au':"à l'",'de la':"de l'",'à la':"à l'",'de':"d'",'que':"qu'"}:LANG==='it'?{'il':"l'",'lo':"l'",'la':"l'",'del':"dell'",'dello':"dell'",'della':"dell'",'al':"all'",'allo':"all'",'alla':"all'",'dal':"dall'",'dalla':"dall'",'nel':"nell'",'nella':"nell'"}:null;
  const ELRX=/(^|[\s(«"“])(de la|à la|du|au|le|la|de|que|il|lo|del|dello|della|al|allo|alla|dal|dalla|nel|nella) \{(\d)\}/gi;
  function fill(o,val){if(ELM)o=o.replace(ELRX,(m,pre,a,n)=>{const v=val[n],e=ELM[a.toLowerCase()];if(e==null||v==null||!/^[aeiouyàâäéèêëîïôöûùü]/i.test(v))return m;return pre+(a[0]!==a[0].toLowerCase()?e[0].toUpperCase()+e.slice(1):e)+'{'+n+'}';});
    return o.replace(/\{(\d)\}/g,(q,n)=>val[n]!=null?val[n]:q);}
  /* v1.7k: valores con artículo español dentro de una plantilla («el peso mexicano», «de la libra esterlina», «a la Reserva Federal»): si el resto se traduce
     (monedas por Intl, bancos centrales, etc.), se arma con el artículo del idioma según el género español (inglés the; portugués, francés e italiano
     con su artículo y elisión). En alemán y en idiomas sin artículo queda el nombre solo (las plantillas de esos idiomas ya lo prevén). */
  const ARTX=/^(El|La|el|la|Del|del|De la|de la|Al|al|A la|a la|de|a) (.+)$/;
  /* Género: en portugués, francés e italiano se decide por el sustantivo ya traducido (FEMX), no por el español: «el Banco de Japón» → «la Banque du Japon». */
  const ARTF={el:'d',la:'d',del:'o','de la':'o',al:'t','a la':'t',de:'O',a:'T'};
  const ARTM={en:{d:['the ','the '],o:['of the ','of the '],t:['to the ','to the '],O:['of ','of '],T:['to ','to ']},
    pt:{d:['o ','a '],o:['do ','da '],t:['ao ','à '],O:['de ','de '],T:['a ','a ']},
    fr:{d:['le ','la '],o:['du ','de la '],t:['au ','à la '],O:['de ','de '],T:['à ','à ']},
    it:{d:['il ','la '],o:['del ','della '],t:['al ','alla '],O:['di ','di '],T:['a ','a ']}}[LANG]||null;
  const FEMX={pt:/^(nova |reserva|autoridade|moeda|libra|rupia|lira|coroa|grívnia|kuna|peseta|dracma|marca|crise|bolsa)/i,fr:/^(nouvelle |banque|réserve|autorité|monnaie|livre|roupie|lire|couronne|hryvnia|kuna|peseta|drachme|crise|bourse|zone)/i,it:/^(nuova |banca|riserva|autorità|moneta|sterlina|rupia|lira|corona|grivnia|kuna|peseta|dracma|crisi|borsa|zona)/i}[LANG];
  function art(a,r){const f=ARTF[a.toLowerCase()];let pre='';if(ARTM&&f){const g=FEMX?(FEMX.test(r)?1:0):(/^la|^de la|^a la/i.test(a)?1:0);pre=ARTM[f][g];}
    if(pre&&ELM&&/^[aeiouyàâäéèêëîïôöûùü]/i.test(r)){const e=ELM[pre.trim()];if(e!=null)pre=e;}let o=pre+r;if(a[0]!==a[0].toLowerCase()&&o)o=o[0].toLocaleUpperCase(LANG)+o.slice(1);return o;}
  /* v1.7n: una plantilla sin punto final también sirve para el mismo texto con punto («Aceptan: las regalías suben a 16 %.»); el punto se pone a la usanza del idioma. */
  const FSTOP={zh:'。',ja:'。',hi:'।'}[LANG]||'.';
  function tpl(x){const r=tpl0(x);if(r!=null||!/[^.]\.$/.test(x))return r;const r2=tpl0(x.slice(0,-1));return r2==null?null:(/[.。।!?！？]$/.test(r2)?r2:r2+FSTOP);}
  function tpl0(x,semi){if(/ [·|] /.test(x))return null;const r0=tpl1(x,semi);if(r0!=null||!/\d mil\b/.test(x))return r0;return tpl1(x.replace(/(\d) mil\b(?! M\b)/g,'$1\u00a0mil'),semi);} /* v1.7n: si no hay plantilla, «9 mil» se prueba como un solo hueco (las plantillas con «mil» propio, como «100 mil hab.», van primero) */
  function tpl1(x,semi){for(const [rx,ord,o] of cands(x)){if(semi&&!rx.source.includes(';'))continue;const mm=x.match(rx);if(!mm)continue;const val={};let bad=0;ord.forEach((n,i)=>{let c=mm[i+1];if(/[a-záéíóúñ0-9)»]{2}[.!?] [¿¡A-ZÁÉÍÓÚÑ]/.test(c))bad=1; /* v1.7n: un hueco no abarca dos oraciones */if(/[A-Za-zÁ-úñ]/.test(c)){let t=T(c),aok=0;if(t===c){const ld=c.match(/^[^A-Za-zÁ-úñ¿¡]*/)[0],cc=c.slice(ld.length);const yy=cc.match(YRX);if(yy)t=ld+T(yy[1])+AND+T(yy[2]);if(t===c){const am=cc.match(ARTX);if(am){const r2=T(am[2]);if(r2!==am[2]||/^\p{Lu}/u.test(am[2])||core(am[2])!=null){t=ld+art(am[1],r2);aok=1;}}}}if(t===c&&!aok&&/^[a-záéíóúñ]/.test(c)&&core(c)==null)bad=1; /* v1.7o: «de Banxico» en francés o portugués queda igual al español y es correcto (aok) */val[n]=t;}else val[n]=c;});if(bad)continue;return fill(o,val);}return null;}
// v1.7e: plural ruso. «2 лет» → «2 года», «21 лет» → «21 год», «5 день» → «5 дней»; decimales en genitivo singular («1.5 года»); los años de 4 cifras («2026 года») no se tocan.
  const RUF=[['год','года','лет'],['день','дня','дней'],['месяц','месяца','месяцев'],['неделя','недели','недель'],['час','часа','часов']];
  const RUW={};RUF.forEach((f,i)=>f.forEach(w=>RUW[w]=i));
  const RURX=/(\d+)([.,]\d+)?([\s\u00a0\u202f])(лет|года|год|дней|дня|день|месяцев|месяца|месяц|недель|недели|неделя|часов|часа|час)(?![а-яё])/g;
  function ruPl(s){return s.replace(RURX,(m,a,b,sp,w)=>{if(!b&&a.length===4&&+a>=1000)return m;let f;if(b&&b.length!==4)f=1;else{const n=+(b?b.slice(1):a),d=n%10,h=n%100;f=(d===1&&h!==11)?0:(d>=2&&d<=4&&(h<12||h>14))?1:2;}return a+(b||'')+sp+RUF[RUW[w]][f];});}
  // v1.7f: en chino, japonés y coreano el número va pegado a la unidad («5年», «5년»), no «5 年».
  const CJK=LANG==='zh'||LANG==='ja'||LANG==='ko';const CJKRX=/(\d)[ \u00a0\u202f](?=[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af])/g;
  // v1.7f: cifras grandes al estilo CJK (unidades de 10⁴ y 10⁸): «85.7十亿» → «857亿», «6.2百万» → «620万», «37.7십억» → «377억».
  const CJK8={zh:'亿',ja:'億',ko:'억'}[LANG],CJK4={zh:'万',ja:'万',ko:'만'}[LANG];
  const cjkR=x=>{const v=x>=100?Math.round(x):Math.round(x*10)/10;return v.toLocaleString('en-US');};
  function cjkNum(s){return s.replace(/(\d[\d,]*(?:\.\d+)?)(十亿|十億|십억)/g,(m,n)=>cjkR(+n.replace(/,/g,'')*10)+CJK8).replace(/(\d[\d,]*(?:\.\d+)?)(百万|백만)/g,(m,n)=>{const v=+n.replace(/,/g,'')*100;return v>=1e4?cjkR(v/1e4)+CJK8:cjkR(v)+CJK4;}).replace(/(\d[\d,]*(?:\.\d+)?)(千|천)/g,(m,n)=>{const v=+n.replace(/,/g,'');return v>=10?cjkR(v/10)+CJK4:m;});} /* v1.7i: «205千» → «20.5万», «205천» → «20.5만»; v1.7j: «584百万» → «5.8億» (antes «58,400万») */
  /* v1.7g: plural árabe (ICU): 1 → «سنة واحدة», 2 → dual «سنتان», 3–10 → plural, 11+ → singular; centenas según n%100. */
  const ARF=[['سنة','سنتان','سنوات','سنة واحدة'],['يوم','يومان','أيام','يوم واحد'],['شهر','شهران','أشهر','شهر واحد'],['أسبوع','أسبوعان','أسابيع','أسبوع واحد'],['ساعة','ساعتان','ساعات','ساعة واحدة'],['دقيقة','دقيقتان','دقائق','دقيقة واحدة'],['عام','عامان','أعوام','عام واحد']];
  const ARW={};ARF.forEach((f,i)=>f.slice(0,3).forEach(w=>ARW[w]=i));
  const ARRX=new RegExp('(^|[^\\d.,+−-])(\\d[\\d,]*(?:\\.\\d+)?) ('+Object.keys(ARW).sort((a,b)=>b.length-a.length).join('|')+')(?![\\u0600-\\u06FF])','g');
  function arPl(s){return s.replace(ARRX,(m,pre,a,w)=>{const F=ARF[ARW[w]];if(/\./.test(a))return pre+a+' '+F[0];const n=+a.replace(/,/g,''),h=n%100;if(n===1)return pre+F[3];if(n===2)return pre+F[1];return pre+a+' '+((h>=3&&h<=10)?F[2]:F[0]);});}
  /* v1.7g: hindi: «1 महीने» → «1 महीना» (directo, sin posposición detrás). */
  const HIRX=/(^|[^\d.,])1 (महीने|हफ़्ते|घंटे)(?!\s*(?:में|से|का|के|की|को|तक|पहले|बाद|पर))/g,HIS={'महीने':'महीना','हफ़्ते':'हफ़्ता','घंटे':'घंटा'};
  function hiPl(s){return s.replace(HIRX,(m,pre,w)=>pre+'1 '+HIS[w]);}
  const DSUF={en:'d',pt:'d',fr:'j',de:'T',it:'g',ru:'д',tr:'g',id:'h',zh:'天',ja:'日',ko:'일',ar:' ي',hi:' दि'}[LANG]||'d'; /* v1.7g: insignia de días libres «120d» */
  const ARN=/^(\s*)([+−-]?[\d.,]+\s?%|[+−-][\d.,]+)(\s*)$/; /* v1.7g: en árabe, «+0.11 %» y «−5.18» van aislados de izquierda a derecha (signo delante, % detrás) */
  function T(s){if(LANG==='ar'&&s&&ARN.test(s))return s.replace(ARN,'$1\u2066$2\u2069$3');if(!s||!LET.test(s))return s;if(/^\d+d$/.test(s))return s.slice(0,-1)+DSUF;const c=cache.get(s);if(c!==undefined)return c;let r=tr(PENRX.test(s)?penFix(s):s);if(LANG==='ru'&&r!==s)r=ruPl(r);if(LANG==='ar'&&r!==s)r=arPl(r).replace(/لـال/g,'لل');if(LANG==='hi'&&r!==s)r=hiPl(r);if(CJK&&r!==s)r=cjkNum(r.replace(CJKRX,'$1'));if(cache.size>30000)cache.clear();cache.set(s,r);return r;}
  /* v1.7n: «(4-3 pen.)» y «(t. e.)» de los marcadores de fútbol se cambian por la abreviatura del idioma aunque el resto de la línea sean nombres propios. */
  const PENRX=/\d+-\d+ pen\.\)|\(t\. e\.\)/;function penFix(s){return s.replace(/(\d+-\d+) pen\.\)/g,(m,a)=>a+' '+(core('pen.')||'pen.')+')').replace(/\(t\. e\.\)/g,()=>'('+(core('t. e.')||'t. e.')+')');}
  function tr(s){const lead=s.match(/^\s*/)[0],trail=s.match(/\s*$/)[0];const x=s.trim();if(!x)return s;let r=core(x);
    if(r==null){const d=x.match(/^(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic) (\d{4})$/i);if(d)r=fMY.format(new Date(+d[2],MES[d[1].toLowerCase()],1));} /* v1.7g: «Ene 2026» (gráfica de la moneda) */
    if(r==null){const d=x.match(/^(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic) (\d{4})$/i);if(d)r=fD.format(new Date(+d[3],MES[d[2].toLowerCase()],+d[1]));}
    if(r==null){const d=x.match(/^(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.? (\d{1,2}):(\d{2})\s?([ap])\.\s?m\.$/i);if(d){let h=+d[3]%12;if(d[5].toLowerCase()==='p')h+=12;r=fDH.format(new Date(2000,MES[d[2].toLowerCase()],+d[1],h,+d[4]));}}
    /* v1.7k: partes separadas por «; » («guerra en Rusia, 12 % del mundo; prohibición de exportar en China, 5 % del mundo»): solo si todas se traducen. Va antes de las plantillas: una plantilla con «{0} … {1}» podría tragarse el «; » y dejar la segunda parte en español. */
    /* v1.7n: antes del corte, una plantilla que trae su propio «; » («Tu estilo: {0}. Nivel {1}; puesto #{2}…», «Balón Dorado… Segundo: {4}; tercero: {5}.») se prueba entera. */
    if(r==null&&/; /.test(x)){const t=tpl0(x,1);if(t!=null)r=t;}
    if(r==null&&/; /.test(x)&&!/ [·|] /.test(x)){const P=x.split('; ');let ok=1;const o=P.map(p=>{const t=T(p);if(t===p&&LET.test(p))ok=0;return t;});if(ok)r=o.join(LANG==='zh'||LANG==='ja'?'；':'; ');}
    /* v1.7l: línea del registro «opción → resultado» (resolveEvent): cada lado se traduce solo; solo si ambos se traducen (un lado idéntico cuenta si está en el diccionario o una plantilla lo reconoce: «No» en inglés, «Ir ($…)» en portugués, «Comprarlo ({0})» en italiano). En árabe la flecha apunta a la izquierda. Solo si los dos lados tienen letras («Investigación militar: nivel 2 → 3» sigue por «etiqueta: valor»). */
    if(r==null&&/ → /.test(x)&&!/ [·|] /.test(x)){const P=x.split(' → ');let ok=P.every(p=>LET.test(p))?1:0;const o=P.map(p=>{const t=T(p);if(t===p&&LET.test(p)&&core(p)==null&&tpl(p)==null&&core(p.replace(/\s*(\([^)]*\)|[$\d.,%\s]+)$/,''))==null)ok=0;return t;});if(ok)r=o.join(LANG==='ar'?' ← ':' → ');}
    if(r==null){const t=tpl(x);if(t!=null)r=t;else{const m2=x.match(/^([^A-Za-zÁ-úñ¿¡]+)(.+)$/);if(m2){const t2=tpl(m2[2]);if(t2!=null)r=m2[1]+t2;else{const m3=x.match(/^([^A-Za-zÁ-úñ¿¡«]+)(«.+)$/);if(m3){const t3=tpl(m3[2]);if(t3!=null)r=m3[1]+t3;}}}}} /* v1.7n: prefijo «· » delante de un título entre comillas */
    /* v1.7k: varias oraciones en un mismo texto («Firmas la paz con X. X queda como tu vasallo.»): si el texto completo no tiene plantilla,
       se traduce por grupos de oraciones seguidas, del grupo más largo al más corto (un grupo de varias oraciones solo por frase o plantilla completa; una oración sola por todas las reglas). Solo se acepta si todo el texto quedó traducido; si una parte queda en español, el texto queda completo en español. */
    if(r==null&&/[.!?»)] (?=[¿¡«A-ZÁÉÍÓÚÑ⚠💥🏆])/u.test(x)&&!/ [·|] /.test(x)){const P=x.split(/(?<=[.!?»)])(?<!(?:^|[\s(])[A-ZÁÉÍÓÚ]{1,3}\.) (?=[¿¡«A-ZÁÉÍÓÚÑ⚠💥🏆])/u);if(P.length>1&&P.length<=12){const o=[];let i=0,ok=1;while(i<P.length&&ok){let done=0;for(let j=P.length-(i===0?1:0);j>i;j--){const g=P.slice(i,j).join(' ');if(!LET.test(g)){o.push(g);i=j;done=1;break;}const t=j-i>1?(core(g)||tpl(g)):T(g);if(t!=null&&t!==g){o.push(t);i=j;done=1;break;}}if(!done)ok=0;}if(ok)r=o.join(LANG==='zh'||LANG==='ja'?'':' ');}}
    if(r==null&&/ [·|] /.test(x)){const P=x.split(/( [·|] )/);let any=0;const o=P.map(p=>{if(/^ [·|] $/.test(p))return p;const t=T(p);if(t!==p)any=1;return t;});if(any)r=o.join('');}
    if(r==null&&/, /.test(x)&&x.split(', ').every(p=>p.split(' ').length<=4)){const P=x.split(', ');let any=0;let ok=1;const o=P.map(p=>{const t=core(p)||tpl(p);if(t!=null){any=1;return t;}if(!/^[A-ZÁÉÍÓÚÑ]/.test(p))ok=0;return p;});if(any&&ok)r=o.join(', ');}
    if(r==null&&/^[^:]{2,40}: [^:]+$/.test(x)){const [a1,b1]=x.split(': ');const ta=T(a1),tb=T(b1);if((ta!==a1||tb!==b1)&&(tb!==b1||!LET.test(b1)||/^[A-ZÁÉÍÓÚÑ]/.test(b1)||core(b1)!=null))r=ta+COLON+tb;} /* v1.7n: vale también un valor cuya traducción es idéntica («regional» en inglés) */
    /* v1.7m: «etiqueta: valor» cuyo valor trae otros «: » («Mala suerte: Resistirte (arriesgado: casi siempre es mejor entregar)», título del diálogo + opción): se corta en el primero y solo se acepta si los dos lados se traducen. */
    if(r==null&&/^[^:]{2,40}: .*: /.test(x)){const k=x.indexOf(': ');const a1=x.slice(0,k),b1=x.slice(k+2);const ta=T(a1),tb=T(b1);if(ta!==a1&&tb!==b1)r=ta+COLON+tb;}
    if(r==null&&/\d/.test(x)){const P=x.split(/((?:US)?[$€£¥]?[+\-−]?[$€£¥]?\d[\d.,:%/×]*\s*(?:[MKk]\b|%|mil\b(?! M\b))?\s*)/);let ok=1,any=0;const o=P.map((p,i)=>{if(i%2){if(/\d\s?mil\b/.test(p)){any=1;return p.replace(/\bmil\b/,core('mil')||'mil');}return p;}if(!p||!LET.test(p))return p;const lp=p.match(/^\s*/)[0],tp=p.match(/\s*$/)[0];const t=core(p.trim());if(t==null){ok=0;return p;}any=1;return lp+t+tp;});if(ok&&any)r=o.join('');}
    return r==null?s:lead+r+trail;}
  return {T,D};})();
/* v1.7i (B6, parte 1): Guía (GUIA[i][1]) y cuerpo de las burbujas ⓘ (HELP[i][2] y [3]) traducidos. I18B[idioma] es una cadena JSON {FNV-1a del español en base 36: traducción}
   generada por build_i18n.py desde herramientas/i18n/b6/; solo se parsea la del idioma activo. Lo que no tenga traducción se queda en español. */
if(I18&&typeof I18B!=='undefined'&&I18B[LANG]){try{const B=JSON.parse(I18B[LANG]);const hk=s=>{let x=0x811c9dc5;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,0x01000193)>>>0;}return x.toString(36);};const t=s=>(typeof s==='string'&&B[hk(s)])||s;
  if(typeof GUIA!=='undefined')GUIA.forEach(g=>{g[1]=t(g[1]);});if(typeof HELP!=='undefined')HELP.forEach(e=>{e[2]=t(e[2]);e[3]=t(e[3]);});}catch(e){console.warn('B6',e);}}
function trText(n){const v=n.nodeValue;if(!v||v.length>600||n.__t===v)return;const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)||(p.closest&&p.closest('[data-noi18n]')))return;let r;if(p.nodeName==='TH'&&v.trim().length<7){const k='th:'+v.trim(),t=I18.T(k);r=t!==k?t:I18.T(v);}else r=I18.T(v);n.__t=r;if(r!==v)n.nodeValue=r;} /* v1.7n: abreviaturas de encabezado de tabla («PJ», «G», «E»…) solo dentro de <th>, con clave «th:…» */
function trEl(e){for(const a of ['placeholder','title','aria-label']){const v=e.getAttribute&&e.getAttribute(a);if(v&&e['__t_'+a]!==v){const r=I18.T(v);e['__t_'+a]=r;if(r!==v)e.setAttribute(a,r);}}}
function trTree(root){if(!root)return;if(root.nodeType===3){trText(root);return;}if(root.nodeType!==1)return;if(/^(SCRIPT|STYLE)$/.test(root.nodeName))return;trEl(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;while((n=w.nextNode())){if(n.nodeType===3)trText(n);else trEl(n);}}
if(I18){const Q=new Set();let pend=0;const flush=()=>{pend=0;const L=[...Q];Q.clear();L.forEach(trTree);};
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')Q.add(m.target);else if(m.type==='attributes')Q.add(m.target);else m.addedNodes.forEach(n=>Q.add(n));}if(!pend){pend=1;Promise.resolve().then(flush);}})
    .observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
  trTree(document.body);
  // la hora en el formato del idioma (8:00 AM, 8:00, …)
  const fH=new Intl.DateTimeFormat(LOC,{hour:'numeric',minute:'2-digit'});
  if(typeof hhmm==='function'){const _h=hhmm;hhmm=function(min,short){if(short)return _h(min,short);min=((min||0)%1440+1440)%1440;return fH.format(new Date(2000,0,1,Math.floor(min/60),min%60));};}
  if(typeof toast==='function'){const _t=toast;toast=function(a,b){return _t(I18.T(String(a==null?'':a)),I18.T(String(b==null?'':b)));};}}
/* ----- selector de idioma: Ajustes y pantalla de inicio ----- */
function langSel(id){return `<label class="f" for="${id}">🌐 Idioma · Language</label><select id="${id}" data-noi18n>${LANGS.map(([k,n,f])=>`<option value="${k}" ${LANG===k?'selected':''}>${f} ${n}</option>`).join('')}</select>${LANGS_SOON?`<div class="hint" data-noi18n style="margin-top:4px">${LANG_SOONW[LANG]||LANG_SOONW.en}: ${LANGS_SOON}</div>`:''}`;}
function langBind(el){if(!el)return;el.onchange=()=>{CFG.lang=el.value;saveCfg();try{if(G&&P)saveNow();}catch(e){}location.reload();};}
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');if(!b)return;const d=document.createElement('div');d.innerHTML=langSel('cfgLang');const h=b.querySelector('h3');h&&h.nextSibling?b.insertBefore(d,h.nextSibling):b.appendChild(d);langBind(d.querySelector('#cfgLang'));if(I18)trTree(d);};}
{const _st=showStart;showStart=function(f,k){_st(f,k);const m=$('modal');if(!m||!m.classList.contains('on'))return;const h=m.querySelector('h2');if(!h)return;const d=document.createElement('div');d.style.margin='6px 0 8px';d.innerHTML=langSel('stLang');(h.nextElementSibling?m.insertBefore(d,h.nextElementSibling.nextSibling):m.appendChild(d));langBind(d.querySelector('#stLang'));};}
if(typeof shWrapAll==='function')shWrapAll();
