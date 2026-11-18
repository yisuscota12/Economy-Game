/* ===== v1.7q (v1.6f): gráficos vectoriales generados =====
   Todo es SVG en texto, determinista (mismo nombre → mismo dibujo) y sin imágenes: escudos de clubes (gxCrest), cinturones (gxBelt), trofeos y medallas (gxTrophy),
   vitrina de trofeos (gxVitrina), gráfica de radar (gxRadar), logos de empresas, bancos y compañías (gxLogo) y portadas de obras (gxCover).
   Nada se guarda en la partida; se cachea en memoria por nombre. Los textos visibles (siglas, iniciales) no pasan por traducción: son nombres propios. */
const GX={c:new Map()};
function gxR(seed){let s=(seed>>>0)||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return (s%100000)/100000;};}
function gxLum(hex){const n=parseInt((hex||'#888').slice(1),16);return ((n>>16)*.299+(n>>8&255)*.587+(n&255)*.114)/255;}
const gxShade=(h,k)=>face2Shade(h,k);
function gxInit(n){const w=String(n||'').replace(/[«»"'().,]/g,'').split(/\s+/).filter(x=>x&&!/^(de|del|la|las|los|el|y|of|the|da|do|dos|das|di|du|le|et|und|FC|CF|AC|SC|CD|CA|Club|Real|Atlético|Deportivo|Sporting|United|City)$/i.test(x));
  const a=w.length?w:String(n||'X').split(/\s+/);return (a.length>1?a[0][0]+a[1][0]:a[0].slice(0,2)).toUpperCase();}
function gxEsc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
/* ---------- escudos de clubes ---------- */
const GX_SH=['M3 3h34v19c0 12-8 19-17 22C11 41 3 34 3 22z','M20 2a18 21 0 1 1 0 42a18 21 0 1 1 0-42z','M3 3h34v22a17 17 0 0 1-34 0z','M20 1.5l17 6v14c0 12-7 19-17 23C10 40.5 3 33.5 3 21.5v-14z','M4 3h32l-2 24c-1 9-7 14-14 17-7-3-13-8-14-17z','M8 3h24a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5z'];
function gxCharge(k,col,r){switch(k){
  case 0:return `<path d="M20 15l2.4 5 5.4.6-4 3.7 1.1 5.3L20 27l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" fill="${col}"/>`;
  case 1:return `<circle cx="20" cy="22.5" r="6.5" fill="#fff" stroke="#111" stroke-width="1"/><path d="M20 19l2.6 1.9-1 3h-3.2l-1-3z" fill="#111"/>`;
  case 2:return `<path d="M13 27l-1-9 4.5 3.5L20 15l3.5 6.5L28 18l-1 9z" fill="${col}"/><rect x="13" y="27.5" width="14" height="2.2" fill="${col}"/>`;
  case 3:return `<path d="M14 30V19h2v2h2v-2h4v2h2v-2h2v11z" fill="${col}"/><rect x="18.5" y="25" width="3" height="5" fill="${gxShade(col,-.5)}"/>`;
  case 4:return `<path d="M11 20c3-3 6 3 9 0s6 3 9 0M11 25c3-3 6 3 9 0s6 3 9 0" stroke="${col}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  case 5:return `<path d="M22 13l-6 11h4.5l-2 9 7-12h-4.5z" fill="${col}"/>`;
  case 6:return `<path d="M10 22c4-1 6-5 10-6 2 0 3 1 4 2l4-1-2 3c0 4-4 7-9 7-3 0-5-2-7-5z" fill="${col}"/><circle cx="24.5" cy="19.5" r=".9" fill="${gxShade(col,-.6)}"/>`;
  case 7:return `<circle cx="20" cy="22.5" r="4.5" fill="${col}"/>`+[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<path d="M${(20+Math.cos(a)*6).toFixed(1)} ${(22.5+Math.sin(a)*6).toFixed(1)}L${(20+Math.cos(a)*8.5).toFixed(1)} ${(22.5+Math.sin(a)*8.5).toFixed(1)}" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/>`;}).join('');
  default:return '';}}
function gxCrestInner(c,id){const r=gxR(hsh('crest|'+c.n));let a=c.col[0],b=c.col[1];if(a===b)b=gxLum(a)>.6?'#13253f':'#ffffff';
  const sh=Math.floor(r()*GX_SH.length),pt=Math.floor(r()*10),ch=Math.floor(r()*10),rich=c.r>=80;const out=rich?'#d9b44a':gxLum(a)>.85&&gxLum(b)>.85?'#5a6472':'#0b1118';
  const P=GX_SH[sh];let g='';
  switch(pt){case 0:g=`<rect width="40" height="46" fill="${a}"/>`;break;
    case 1:g=`<rect width="40" height="46" fill="${a}"/><rect x="20" width="20" height="46" fill="${b}"/>`;break;
    case 2:g=`<rect width="40" height="46" fill="${a}"/><path d="M0 0h40L0 46z" fill="${b}"/>`;break;
    case 3:g=`<rect width="40" height="46" fill="${a}"/>`+[1,3,5,7].map(i=>`<rect x="${i*5}" width="5" height="46" fill="${b}"/>`).join('');break;
    case 4:g=`<rect width="40" height="46" fill="${a}"/>`+[1,3,5,7].map(i=>`<rect y="${i*5.75}" width="40" height="5.75" fill="${b}"/>`).join('');break;
    case 5:g=`<rect width="40" height="46" fill="${a}"/><path d="M0 26l20-12 20 12v9L20 23 0 35z" fill="${b}"/>`;break;
    case 6:g=`<rect width="40" height="46" fill="${a}"/><rect width="20" height="23" fill="${b}"/><rect x="20" y="23" width="20" height="23" fill="${b}"/>`;break;
    case 7:g=`<rect width="40" height="46" fill="${a}"/><rect y="17" width="40" height="11" fill="${b}"/>`;break;
    case 8:g=`<rect width="40" height="46" fill="${a}"/><rect x="14" width="12" height="46" fill="${b}"/>`;break;
    default:g=`<rect width="40" height="46" fill="${a}"/><rect x="16" width="8" height="46" fill="${b}"/><rect y="18" width="40" height="8" fill="${b}"/>`;}
  /* carga central sobre un disco del color de contraste para que se lea en cualquier patrón */
  const cc=gxLum(a)>.55?'#13253f':'#ffffff';let k='';
  if(ch<8)k=`<circle cx="20" cy="22.5" r="9.5" fill="${b===cc?a:b}" stroke="${out}" stroke-width=".8"/>`+gxCharge(ch,b===cc?b:cc);
  else k=`<circle cx="20" cy="22.5" r="9.5" fill="${a}" stroke="${out}" stroke-width=".8"/><text x="20" y="25.8" text-anchor="middle" font-size="9" font-weight="800" font-family="system-ui,sans-serif" fill="${gxLum(a)>.55?'#13253f':'#fff'}">${gxEsc(gxInit(c.n))}</text>`;
  const top=rich||ch>=8?'':`<text x="20" y="10.2" text-anchor="middle" font-size="6.2" font-weight="800" font-family="system-ui,sans-serif" fill="${gxLum(a)>.55?'#13253f':'#fff'}" opacity=".95">${gxEsc(gxInit(c.n))}</text>`;
  return `<clipPath id="${id}"><path d="${P}"/></clipPath><g clip-path="url(#${id})">${g}${k}${sh===1?'':top}</g><path d="${P}" fill="none" stroke="${out}" stroke-width="${rich?2.2:1.6}"/>`+(rich?`<path d="M14 0.8l1 2 2.1.2-1.6 1.4.5 2.1-2-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2zM26 0.8l1 2 2.1.2-1.6 1.4.5 2.1-2-1.1-1.9 1.1.5-2.1-1.6-1.4 2.1-.2z" fill="#d9b44a" transform="translate(0 -1)"/>`:'');}
function gxCrest(cid,sz){const W=typeof FTW==='function'&&FTW();const c=W&&W.C[cid];if(!c)return '';const k='cr|'+cid;let inn=GX.c.get(k);if(!inn){inn=gxCrestInner(c,'k'+String(cid).replace(/\W/g,''));GX.c.set(k,inn);}
  const h=sz||16;return `<svg class="gxcr" viewBox="0 -2 40 48" width="${Math.round(h*40/48)}" height="${h}" aria-hidden="true">${inn}</svg>`;}
/* ---------- cinturones ---------- */
function gxBelt(col,ab,sz,big){const d=gxShade(col,-.35),l=gxShade(col,.25),G1='#f2c14e',G2='#b8862b',G3='#fff1b8';
  if(!big)return `<svg class="gxbelt" viewBox="0 0 44 18" width="${Math.round((sz||14)*44/18)}" height="${sz||14}" aria-hidden="true"><rect x="0" y="5" width="44" height="8" rx="3" fill="${col}"/><rect x="0" y="5" width="44" height="2" rx="1" fill="${l}" opacity=".6"/><rect x="0" y="11" width="44" height="2" rx="1" fill="${d}" opacity=".7"/><rect x="5" y="4" width="6" height="10" rx="1.5" fill="${G2}"/><rect x="33" y="4" width="6" height="10" rx="1.5" fill="${G2}"/><ellipse cx="22" cy="9" rx="9.5" ry="8.2" fill="${G1}" stroke="${G2}" stroke-width="1.2"/><ellipse cx="22" cy="9" rx="5.6" ry="4.8" fill="none" stroke="${G2}" stroke-width=".9"/><ellipse cx="20" cy="6" rx="3" ry="1.5" fill="${G3}" opacity=".7"/></svg>`;
  return `<svg class="gxbelt b" viewBox="0 0 120 54" width="${sz||110}" height="${Math.round((sz||110)*54/120)}" aria-hidden="true"><path d="M0 17q60-6 120 0v20q-60-6-120 0z" fill="${col}"/><path d="M0 17q60-6 120 0v4q-60-6-120 0z" fill="${l}" opacity=".55"/><path d="M0 33q60-6 120 0v4q-60-6-120 0z" fill="${d}" opacity=".7"/>`+
    [10,24,96,110].map(x=>`<rect x="${x-6}" y="13" width="12" height="25" rx="3" fill="${G1}" stroke="${G2}" stroke-width="1.2"/><circle cx="${x}" cy="25.5" r="3.2" fill="${G2}"/>`).join('')+
    `<ellipse cx="60" cy="27" rx="25" ry="24" fill="${G1}" stroke="${G2}" stroke-width="2"/><ellipse cx="60" cy="27" rx="19" ry="18" fill="none" stroke="${G2}" stroke-width="1.2"/><path d="M41 27h38M60 9v36M47 15q13 6 26 0M47 39q13-6 26 0" stroke="${G2}" stroke-width=".8" fill="none" opacity=".75"/><rect x="45" y="21" width="30" height="12" rx="3" fill="${col}" stroke="${G2}" stroke-width="1"/><text x="60" y="30.5" text-anchor="middle" font-size="9.5" font-weight="900" font-family="system-ui,sans-serif" fill="${gxLum(col)>.6?'#111':'#fff'}">${gxEsc(ab||'')}</text><ellipse cx="52" cy="12" rx="7" ry="2.6" fill="${G3}" opacity=".7"/></svg>`;}
/* ---------- trofeos y medallas ---------- */
const GX_MET={o:['#f2c14e','#b8862b','#fff1b8'],p:['#d6dde5','#8a96a3','#ffffff'],b:['#d38a4e','#8a5426','#f3c79c']};
function gxTrophy(k,sz,m,col){const [M,D,L]=GX_MET[m||'o'];const s=sz||48;let g='';
  switch(k){
    case 'liga':g=`<path d="M14 6h20v8c0 7-4 12-10 12s-10-5-10-12z" fill="${M}"/><path d="M14 9H8v2c0 4 3 7 7 7M34 9h6v2c0 4-3 7-7 7" stroke="${M}" stroke-width="2.5" fill="none"/><rect x="21" y="26" width="6" height="6" fill="${D}"/><rect x="14" y="32" width="20" height="5" rx="1" fill="${M}"/><rect x="11" y="37" width="26" height="6" rx="1.5" fill="${D}"/><path d="M17 8h4v9c-2-1-4-4-4-9z" fill="${L}" opacity=".7"/>`;break;
    case 'copa':g=`<path d="M16 4h16l-2 12c-1 5-3 8-6 8s-5-3-6-8z" fill="${M}"/><path d="M16 7c-5 0-7 3-6 6 1 2 4 3 7 3M32 7c5 0 7 3 6 6-1 2-4 3-7 3" stroke="${M}" stroke-width="2" fill="none"/><path d="M22 24h4l1 9h-6z" fill="${D}"/><rect x="15" y="33" width="18" height="4" rx="1" fill="${M}"/><rect x="13" y="37" width="22" height="7" rx="1.5" fill="${D}"/><path d="M19 6h3l-.5 10c-1.5-1-2.5-4-2.5-10z" fill="${L}" opacity=".7"/>`;break;
    case 'conti':g=`<path d="M16 5h16c0 10-2 18-8 19-6-1-8-9-8-19z" fill="${M}"/><path d="M16 7C7 6 6 15 12 18c3 2 5 0 5 0M32 7c9-1 10 8 4 11-3 2-5 0-5 0" stroke="${M}" stroke-width="3" fill="none"/><rect x="21.5" y="24" width="5" height="8" fill="${D}"/><path d="M14 32h20l2 12H12z" fill="${D}"/><path d="M19 7h3v12c-2-2-3-6-3-12z" fill="${L}" opacity=".7"/>`;break;
    case 'mundial':g=`<circle cx="24" cy="12" r="8.5" fill="${M}"/><path d="M17 8q7 4 14 0M16 13h16M19 18q5-3 10 0" stroke="${D}" stroke-width="1" fill="none"/><path d="M16 15c-1 8 3 12 4 18h8c1-6 5-10 4-18-2 5-5 7-8 7s-6-2-8-7z" fill="${M}"/><path d="M20 21c2 4 0 8 1 12" stroke="${D}" stroke-width="1.2" fill="none"/><rect x="17" y="33" width="14" height="4" rx="1" fill="#2e7d32"/><rect x="15" y="37" width="18" height="7" rx="1.5" fill="${D}"/><ellipse cx="21" cy="9" rx="3" ry="2" fill="${L}" opacity=".7"/>`;break;
    case 'balon':g=`<circle cx="24" cy="22" r="15" fill="${M}"/><path d="M24 14l6 4.5-2.3 7h-7.4L18 18.5z" fill="${D}"/><path d="M24 14V7.5M30 18.5l6-2M27.7 25.5l3.8 5.5M20.3 25.5l-3.8 5.5M18 18.5l-6-2" stroke="${D}" stroke-width="1.4"/><ellipse cx="19" cy="14" rx="5" ry="3" fill="${L}" opacity=".7"/><rect x="16" y="39" width="16" height="5" rx="1.5" fill="${D}"/>`;break;
    case 'bota':g=`<path d="M14 6h12v14c4 1 10 3 12 6 1 2 0 4-2 4H12c-2 0-2-2-2-4z" fill="${M}"/><path d="M12 30h24" stroke="${D}" stroke-width="2"/><path d="M14 33v3M20 33v3M26 33v3M32 33v3" stroke="${D}" stroke-width="2" stroke-linecap="round"/><path d="M16 10h8M16 14h8" stroke="${D}" stroke-width="1.2"/><rect x="12" y="38" width="24" height="6" rx="1.5" fill="${D}"/>`;break;
    case 'estrella':g=`<path d="M24 3l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 30l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z" fill="${M}" stroke="${D}" stroke-width="1.2"/><path d="M24 8l2.5 6-2.5 9z" fill="${L}" opacity=".6"/><rect x="18" y="35" width="12" height="3" fill="${D}"/><rect x="14" y="38" width="20" height="6" rx="1.5" fill="${D}"/>`;break;
    case 'estatuilla':g=`<circle cx="24" cy="7.5" r="4" fill="${M}"/><path d="M19 13h10l-1 9 2 11h-12l2-11z" fill="${M}"/><path d="M19 14l-3 7M29 14l3 7" stroke="${M}" stroke-width="2.4" stroke-linecap="round"/><path d="M22 14h2v18h-3z" fill="${L}" opacity=".5"/><rect x="16" y="33" width="16" height="4" rx="1" fill="${D}"/><rect x="13" y="37" width="22" height="7" rx="1.5" fill="${col||'#1d2532'}" stroke="${D}" stroke-width="1"/>`;break;
    case 'gourmet':g=`<rect x="7" y="8" width="34" height="30" rx="4" fill="#9b1c1c"/><rect x="9" y="10" width="30" height="26" rx="3" fill="none" stroke="${M}" stroke-width="1"/>`+[0,1,2].map(i=>`<path d="M${15+i*9} 17l1.6 3.4 3.7.4-2.8 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.8-2.5 3.7-.4z" fill="${M}"/>`).join('')+`<rect x="14" y="40" width="20" height="4" rx="1" fill="${D}"/>`;break;
    case 'medalla':g=`<path d="M15 3h7l4 13h-7zM33 3h-7l-4 13h7z" fill="${col||'#c0392b'}"/><path d="M15 3h3l4 13h-3z" fill="#fff" opacity=".35"/><circle cx="24" cy="29" r="12" fill="${M}" stroke="${D}" stroke-width="1.6"/><circle cx="24" cy="29" r="8" fill="none" stroke="${D}" stroke-width="1"/><path d="M24 23.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.9-3.4 1.9.7-3.8-2.8-2.6 3.8-.5z" fill="${D}"/><ellipse cx="20" cy="24" rx="3.5" ry="2" fill="${L}" opacity=".7"/>`;break;
    default:g=`<circle cx="24" cy="22" r="14" fill="${M}"/>`;}
  return `<svg class="gxtr" viewBox="0 0 48 46" width="${s}" height="${Math.round(s*46/48)}" aria-hidden="true">${g}</svg>`;}
/* clasifica un premio por su texto (se guarda como texto en p.fc.aw y fb.tro) */
function gxAwardArt(t,k){const s=String(t||'');let m=/🥈|plata/.test(s)?'p':/🥉|bronce/.test(s)?'b':'o';
  if(/🥇|🥈|🥉|[Mm]edalla/.test(s))return gxTrophy('medalla',44,m,/Olímp/.test(s)?'#2a6fdb':/mundial/i.test(s)?'#c0392b':/continental/i.test(s)?'#2e9e4f':'#7a5cff');
  if(/Campeón mundial|Defensa exitosa|cinturón/i.test(s)){let o=null;if(typeof CB_ORG!=='undefined'){for(const x of CB_ORG.concat(CB_LG))if(s.indexOf(x[0])>=0||s.indexOf(x[1])>=0){o=x;break;}}return gxBelt(o?o[2]:'#c0392b',o?o[0]:'',70,true);}
  if(/Balón Dorado/.test(s))return gxTrophy('balon',44);if(/goleo|👟/.test(s))return gxTrophy('bota',44);
  if(/joven|🌟/.test(s))return gxTrophy('estrella',44,'p');if(/Mejor jugador|⭐/.test(s))return gxTrophy('estrella',44);
  if(/Guía Gourmet/.test(s))return gxTrophy('gourmet',44);
  if(/Mundial|del mundo con la selección/.test(s))return gxTrophy('mundial',44);
  if(/Campeones|Libertadores|Champions/.test(s))return gxTrophy('conti',44);
  if(/Copa|Eurocopa|Copa América|Copa de Oro|Africana|Asiática/.test(s))return gxTrophy('copa',44,/Eurocopa|América|Oro|Africana|Asiática/.test(s)?'o':'p');
  if(/[Ll]iga|Campeón de|Premier|Serie|Bundesliga|Primera|torneo/.test(s))return gxTrophy('liga',44);
  const D=k&&typeof FM!=='undefined'&&FM[k];return gxTrophy('estatuilla',44,'o',D&&D.col?D.col:'#1d2532');}
function gxVitrina(list,k,max){if(!list||!list.length)return '';const L=list.slice(-(max||12)).reverse();
  return `<div class="gxvit">${L.map(a=>`<div class="gxv">${gxAwardArt(a.t,k)}<b>${a.y}</b><span>${gxEsc(String(a.t))}</span></div>`).join('')}</div>`;}
/* ---------- radar ---------- */
function gxRadar(labels,vals,o){o=o||{};const n=labels.length;if(n<3)return '';const S=o.size||170,cx=S/2,cy=S/2+2,R=S/2-30,mx=o.max||100,col=o.col||'#f2c14e';
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n,r=R*Math.max(0,Math.min(1,v/mx));return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];};
  let g='';for(const f of [.25,.5,.75,1])g+=`<polygon points="${labels.map((_,i)=>pt(i,mx*f).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${f===1?'rgba(255,255,255,.03)':'none'}" stroke="rgba(255,255,255,${f===1?.22:.1})" stroke-width="1"/>`;
  g+=labels.map((_,i)=>{const [x,y]=pt(i,mx);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.1)"/>`;}).join('');
  if(o.ghost)g+=`<polygon points="${o.ghost.map((v,i)=>pt(i,v).map(q=>q.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  g+=`<polygon points="${vals.map((v,i)=>pt(i,v).map(q=>q.toFixed(1)).join(',')).join(' ')}" fill="${col}" fill-opacity=".28" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>`;
  g+=vals.map((v,i)=>{const [x,y]=pt(i,v);return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${col}"/>`;}).join('');
  g+=labels.map((l,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*(R+9),y=cy+Math.sin(a)*(R+9);const an=Math.abs(Math.cos(a))<.3?'middle':Math.cos(a)>0?'start':'end';
    return `<text x="${x.toFixed(1)}" y="${(y+(Math.sin(a)>.3?9:Math.sin(a)<-.3?-2:3.5)).toFixed(1)}" text-anchor="${an}" font-size="10" fill="var(--mut,#9fb3cc)">${gxEsc(l)}</text><text x="${x.toFixed(1)}" y="${(y+(Math.sin(a)>.3?20:Math.sin(a)<-.3?9:14.5)).toFixed(1)}" text-anchor="${an}" font-size="10" font-weight="800" fill="var(--ink,#e8eef5)">${Math.round(vals[i])}</text>`;}).join('');
  return `<div class="gxrad"><svg viewBox="0 0 ${S} ${S+4}" width="${S}" height="${S+4}" style="overflow:visible">${g}</svg>${o.legend?`<div class="hint" style="text-align:center;font-size:11px">${o.legend}</div>`:''}</div>`;}
/* ---------- logos de empresas, bancos y compañías ---------- */
const GX_SEC={tec:'#2a6fdb',semi:'#0e7490',ecom:'#e67e22',fin:'#1f8a70',ener:'#c0392b',min:'#8a6a3a',cons:'#d35400',retail:'#f39c12',lujo:'#8e6b3a',auto:'#34495e',salud:'#16a085',tel:'#7a5cff',ind:'#5d6b7a',def:'#4b5a2a',inm:'#8e44ad',serv:'#2980b9',trans:'#2c3e50',medios:'#c2185b',bank:'#1f4e79'};
function gxLogo(name,sec,sz,o){o=o||{};const k='lg|'+name+'|'+(sec||'');let inn=GX.c.get(k);if(!inn){const r=gxR(hsh('logo|'+name));const pal=['#2a6fdb','#1f8a70','#c0392b','#8e44ad','#d35400','#16a085','#2c3e50','#c2185b','#b8862b','#5d6b7a','#7a5cff','#0e7490'];
    const base=GX_SEC[sec]||pal[Math.floor(r()*pal.length)],acc=gxLum(base)>.55?'#13253f':'#ffffff',alt=gxShade(base,.35);const sh=Math.floor(r()*5),mk=Math.floor(r()*7);
    const bg=['<rect x="1" y="1" width="30" height="30" rx="8" fill="'+base+'"/>','<circle cx="16" cy="16" r="15" fill="'+base+'"/>','<path d="M16 1l13 7.5v15L16 31 3 23.5v-15z" fill="'+base+'"/>','<rect x="1" y="1" width="30" height="30" rx="2" fill="'+base+'"/>','<path d="M16 1l15 15-15 15L1 16z" fill="'+base+'"/>'][sh];
    let m='';switch(mk){case 0:case 1:case 2:m=`<text x="16" y="${mk===1?20.5:21}" text-anchor="middle" font-size="${mk===1?11:12.5}" font-weight="900" font-family="${mk===2?'Georgia,serif':'system-ui,sans-serif'}" fill="${acc}" letter-spacing="-.5">${gxEsc(mk===1?gxInit(name):gxInit(name)[0])}</text>`;break;
      case 3:m=`<path d="M9 22l5-6 4 3 5-8" stroke="${acc}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;break;
      case 4:m=`<rect x="9" y="17" width="3.5" height="6" rx="1" fill="${acc}"/><rect x="14.3" y="12" width="3.5" height="11" rx="1" fill="${acc}"/><rect x="19.6" y="9" width="3.5" height="14" rx="1" fill="${acc}"/>`;break;
      case 5:m=`<circle cx="16" cy="16" r="7" fill="none" stroke="${acc}" stroke-width="2.6"/><circle cx="16" cy="16" r="2.4" fill="${alt}"/>`;break;
      default:m=`<path d="M9 21l7-11 7 11z" fill="${acc}"/><path d="M13 21l3-5 3 5z" fill="${alt}"/>`;}
    if(sec==='bank')m=`<path d="M16 8l8 4H8z" fill="${acc}"/><path d="M10 13.5v6M14 13.5v6M18 13.5v6M22 13.5v6" stroke="${acc}" stroke-width="2"/><rect x="8" y="20.5" width="16" height="2.5" fill="${acc}"/>`;
    inn=bg+m;GX.c.set(k,inn);}
  const s=sz||28;return `<svg class="gxlg" viewBox="0 0 32 32" width="${s}" height="${s}" aria-hidden="true">${inn}</svg>`;}
/* ---------- portadas de obras (carreras de la v1.6d) ---------- */
function gxCover(w,k,sz){const key='cv|'+k+'|'+w.t+'|'+w.y;let inn=GX.c.get(key);if(!inn){const r=gxR(hsh(key));const H=Math.floor(r()*360),c1=`hsl(${H},${55+r()*25}%,${30+r()*18}%)`,c2=`hsl(${(H+40+r()*140)%360},${60+r()*20}%,${48+r()*18}%)`,c3=`hsl(${(H+180)%360},70%,${70+r()*15}%)`;
    let g=`<rect width="40" height="40" fill="${c1}"/>`;
    switch(k){
      case 'musica':g+=[0,1,2,3].map(i=>`<circle cx="${(8+r()*24).toFixed(1)}" cy="${(8+r()*24).toFixed(1)}" r="${(4+r()*12).toFixed(1)}" fill="${i%2?c2:c3}" opacity="${(.35+r()*.5).toFixed(2)}"/>`).join('')+`<circle cx="31" cy="31" r="7" fill="#111" opacity=".85"/><circle cx="31" cy="31" r="2" fill="${c3}"/>`;break;
      case 'actuacion':g+=`<rect y="22" width="40" height="18" fill="${c2}" opacity=".5"/><circle cx="${(10+r()*20).toFixed(1)}" cy="13" r="6" fill="${c3}" opacity=".85"/><path d="M0 34l7-8 5 4 6-9 7 7 5-5 10 11z" fill="#0b0f16"/><rect x="4" y="3" width="32" height="4" rx="1" fill="#fff" opacity=".85"/>`;break;
      case 'escritor':g+=`<rect x="3" y="3" width="34" height="34" fill="none" stroke="${c3}" stroke-width="1"/><rect x="8" y="8" width="24" height="3" fill="${c3}"/><rect x="11" y="13" width="18" height="2" fill="${c3}" opacity=".7"/><circle cx="20" cy="25" r="6" fill="none" stroke="${c2}" stroke-width="2"/><path d="M20 19v12M14 25h12" stroke="${c2}" stroke-width="1"/>`;break;
      case 'creador':g+=`<rect x="4" y="7" width="32" height="22" rx="4" fill="${c2}"/><path d="M17 13l8 5-8 5z" fill="#fff"/><rect x="4" y="32" width="${(10+r()*22).toFixed(0)}" height="3" rx="1.5" fill="#ff3d3d"/>`;break;
      case 'modelo':g+=`<text x="20" y="11" text-anchor="middle" font-size="9" font-weight="900" font-family="Georgia,serif" fill="#fff" letter-spacing="1">MODE</text><ellipse cx="20" cy="22" rx="5" ry="6" fill="${c3}"/><path d="M10 40c1-8 5-11 10-11s9 3 10 11z" fill="${c2}"/>`;break;
      case 'comedia':g+=`<path d="M20 0L6 40h28z" fill="${c3}" opacity=".35"/><rect x="18.5" y="18" width="3" height="16" fill="#222"/><ellipse cx="20" cy="17" rx="3.5" ry="4.5" fill="#333"/><rect x="13" y="34" width="14" height="3" rx="1" fill="#222"/>`;break;
      case 'chef':g+=`<circle cx="20" cy="20" r="15" fill="#f4f1ea"/><circle cx="20" cy="20" r="11" fill="none" stroke="#d6d0c4" stroke-width="1"/>`+[0,1,2,3,4].map(()=>`<circle cx="${(13+r()*14).toFixed(1)}" cy="${(13+r()*14).toFixed(1)}" r="${(1.8+r()*3).toFixed(1)}" fill="${['#c0392b','#27ae60','#e67e22','#8e44ad','#f1c40f'][Math.floor(r()*5)]}"/>`).join('');break;
      case 'dj':g+=[...Array(18)].map((_,i)=>{const h=4+r()*26;return `<rect x="${2+i*2.1}" y="${(20-h/2).toFixed(1)}" width="1.4" height="${h.toFixed(1)}" rx=".7" fill="${i%3?c2:c3}"/>`;}).join('');break;
      default:g+=`<circle cx="20" cy="20" r="10" fill="${c2}"/>`;}
    inn=g;GX.c.set(key,inn);}
  const s=sz||40;return `<svg class="gxcv" viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true">${inn}</svg>`;}
(function(){const st=document.createElement('style');st.textContent=`
.gxcr{vertical-align:-3px;margin-right:4px;flex:0 0 auto}.crest.b+.gxcr,.gxcr.b{vertical-align:middle}
.gxbelt{vertical-align:-3px;margin-right:3px}
.gxvit{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px;margin:6px 0 10px}
.gxv{background:linear-gradient(180deg,var(--card2,#1a2433),rgba(0,0,0,.25));border:1px solid var(--line);border-radius:10px;padding:6px 4px 5px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:96px}
.gxv b{font-size:11px;color:var(--gold)}.gxv span{font-size:10px;line-height:1.2;color:var(--mut);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gxv .gxbelt.b{margin:6px 0 4px}
.gxrad{display:flex;flex-direction:column;align-items:center;margin:2px 0 6px}
.gxlg{flex:0 0 auto;vertical-align:middle;border-radius:6px}
.stk>.gxlg{margin-right:8px}
.bnk .h b .gxlg{margin-right:6px;vertical-align:-5px}
.wkc .m .gxcv{flex:0 0 auto;border-radius:5px;box-shadow:0 2px 6px rgba(0,0,0,.45)}
.belt2{display:inline-flex;align-items:center;gap:2px;margin:2px 5px 2px 0;font-size:11px;font-weight:800;color:var(--gold)}
.ftt td .gxlg{margin-right:5px;vertical-align:-4px}
html[dir=rtl] .gxcr,html[dir=rtl] .gxbelt{margin-right:0;margin-left:4px}html[dir=rtl] .stk>.gxlg{margin-right:0;margin-left:8px}
`;document.head.appendChild(st);})();

/* ---------- dónde aparecen (envuelven las pantallas sin tocar sus textos) ---------- */
function gxInsertBefore(root,sel,html){const el=root&&root.querySelector(sel);if(!el)return false;el.insertAdjacentHTML('beforebegin',html);return true;}
function gxAfterTabs(root,html){const t=root&&root.querySelector('.ntabs');if(!t)return false;t.insertAdjacentHTML('afterend',html);return true;}
{const _s=showCB;showCB=function(...a){const r=_s.apply(this,a);try{const b=$('sheetIn'),c=P&&P.fc&&P.fc.cb;if(b&&c){const sp=cbSp(P);
  if(CBV.tab==='pel')gxInsertBefore(b,'.atb',gxRadar(CB_AT[sp],c.at.map(v=>Math.round(v)),{size:180,col:'#ef6b5b'}));
  else if(CBV.tab==='tra'&&P.fc.aw&&P.fc.aw.length)gxAfterTabs(b,`<div class="sect">Vitrina</div>`+gxVitrina(P.fc.aw,P.fc.k,12));}}catch(e){console.warn('gx cb',e);}return r;};showCB._shk=1;}
{const _s=showFB;showFB=function(...a){const r=_s.apply(this,a);try{const b=$('sheetIn'),fb=fbOf(P);if(b&&fb){
  if(FBV.tab==='jug'){const ix=FT_AT.map((n,i)=>i).filter(i=>i!==6||fb.pos===0);gxInsertBefore(b,'.atb',gxRadar(ix.map(i=>FT_AT[i]),ix.map(i=>Math.round(fb.at[i])),{size:180,col:'#3ccf8e',legend:'Línea punteada: lo que más pesa en tu posición.',ghost:ix.map(i=>Math.min(100,FT_POS[fb.pos][2][i]*100*ix.length*.9))}));}
  else if(FBV.tab==='tra'&&fb.tro&&fb.tro.length)gxAfterTabs(b,`<div class="sect">Vitrina</div>`+gxVitrina(fb.tro,'futbol',12));}}catch(e){console.warn('gx fb',e);}return r;};showFB._shk=1;}
{const _s=showFM;showFM=function(...a){const r=_s.apply(this,a);try{const b=$('sheetIn'),k=P&&P.fc&&P.fc.k,fm=typeof fmOf==='function'&&fmOf(P);if(b&&fm&&FM[k]){const D=FM[k];
  if(FMV.tab==='per')gxInsertBefore(b,'.atb',gxRadar(D.at,fm.at.map(v=>Math.round(v)),{size:180,col:'#f2c14e',legend:'Línea punteada: cuánto pesa cada atributo en tu nivel.',ghost:D.w.map(w=>Math.min(100,w*100*D.w.length*.8))}));
  else if(FMV.tab==='tra'&&P.fc.aw&&P.fc.aw.length)gxAfterTabs(b,`<div class="sect">Vitrina</div>`+gxVitrina(P.fc.aw,k,12));}}catch(e){console.warn('gx fm',e);}return r;};showFM._shk=1;}
{const _w=fmWorkCard;fmWorkCard=function(w,D){const h=_w(w,D);try{const k=P&&P.fc&&P.fc.k;return h.replace('<div class="m">','<div class="m">'+gxCover(w,k,46));}catch(e){return h;}};}
/* v1.7q: corrección — la pestaña Torneos del futbolista fallaba («reading 'cl'») si la liga recordada (FBV.lg) no existe en el mundo actual (partida nueva o liga sin club) */
{const _b=ftWorldBody;ftWorldBody=function(t){try{const W=FTW();if(W&&W.L&&!W.L[FBV.lg]){const fb=fbOf(P);const L=fb&&fbLeague(fb);FBV.lg=L&&W.L[L.i]?L.i:Object.keys(W.L)[0];}}catch(e){}return _b(t);};}
