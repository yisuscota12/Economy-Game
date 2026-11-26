/* ===== v2.6b: ranking de países con vectores (valor, tendencia y barra relativa al líder) =====
   Solo interfaz y solo lectura: no cambia la simulación, el puntaje, el guardado ni el orden de ranking().
   Tendencia de cada estadística (PIB, población, poder militar y puntaje):
   1) Foto en memoria tomada justo antes de la simulación anual (envoltura de simWorld). No se guarda en la partida:
      se pierde al recargar y vale solo para el mismo mundo (G).
   2) Sin foto (partida recién cargada): PIB con n.g (crecimiento del último año que ya guarda el país), población con
      popG() (determinista), puntaje reconstruido con esos dos valores; todo marcado como estimado. Poder militar: sin dato.
   Umbral de «estable»: 1 %. Modo ligero (html.v4lt): solo flechas, sin barras. */
(function(){if(typeof document==='undefined')return;const st=document.createElement('style');st.id='st26b';st.textContent=`
.item.rk26r{display:grid;grid-template-columns:minmax(118px,1.1fr) repeat(4,minmax(78px,1fr));gap:4px 10px;align-items:center;padding:7px 10px}
.rk26r .t{font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rk26r .s{font-size:11px;line-height:1.25}
.rk26c{display:flex;flex-direction:column;min-width:0;line-height:1.2}
.rk26c small{font-size:10px;color:var(--mut);white-space:nowrap}
.rk26c b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.rk26a{font-style:normal;font-size:10.5px;font-weight:700;margin-left:3px;white-space:nowrap}
.rk26a.u{color:var(--teal,#3ccf8e)}.rk26a.d{color:var(--red,#f0565d)}.rk26a.e,.rk26a.n{color:var(--mut)}
.rk26b{display:block;height:4px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:3px}
.rk26b i{display:block;height:100%;background:var(--teal,#3ccf8e);transform-origin:left;animation:rk26in .5s cubic-bezier(.2,.8,.2,1) both}
.rk26b.s i{background:var(--gold)}
@keyframes rk26in{from{transform:scaleX(0)}to{transform:none}}
.rk26more{width:100%;margin:2px 0 8px}
.rk26n{font-size:11px;color:var(--mut);margin:-2px 0 8px}
@media (max-width:620px){.item.rk26r{grid-template-columns:repeat(4,minmax(0,1fr))}.rk26r>.rk26h{grid-column:1/-1}}
@media (prefers-reduced-motion:reduce){.rk26b i{animation:none}}
html.v4lt .rk26b{display:none}`;document.head.appendChild(st);})();

// Foto en memoria (no va al guardado)
var RK26S=null;
function rk26Pw(id){try{const v=power(id);return isFinite(v)?v:0;}catch(e){return 0;}}
function rk26Score(A,gdp,pop,pw){const mg=Math.max(1e-9,...A.map(gdp)),mp=Math.max(1e-9,...A.map(pop)),mw=Math.max(1e-9,...A.map(pw));const o={};
  A.forEach(n=>{o[n.id]=40*gdp(n)/mg+30*pop(n)/mp+30*pw(n)/mw;});return o;}
function rk26Snap(){try{if(!G||!G.nations)return null;const A=Object.values(G.nations).filter(n=>n.alive);const pw={};A.forEach(n=>pw[n.id]=rk26Pw(n.id));
  const sc=rk26Score(A,n=>n.gdp,n=>n.pop,n=>pw[n.id]);const d={};A.forEach(n=>{d[n.id]={gdp:n.gdp,pop:n.pop,pw:pw[n.id],s:sc[n.id]};});return {G,y:G.year,d};}catch(e){return null;}}
(function(){if(typeof simWorld!=='function')return;const _sw26=simWorld;simWorld=function(){const s=rk26Snap();const r=_sw26.apply(this,arguments);if(s)RK26S=s;return r;};})();

// Cambio relativo → flecha. k: 'u' sube, 'd' baja, 'e' estable, 'n' sin dato
function rk26Tr(now,prev,est){if(!isFinite(now)||!isFinite(prev)||prev<=0)return {k:'n',c:null,est:!!est};const c=now/prev-1;if(!isFinite(c))return {k:'n',c:null,est:!!est};
  return {k:Math.abs(c)<.01?'e':c>0?'u':'d',c,est:!!est};}
// Datos de todos los países vivos, en el mismo orden que ranking() (no lo reordena ni lo modifica)
function rk26Data(){const L=ranking();const A=L.map(x=>G.nations[x.id]).filter(Boolean);if(!A.length)return {L,rows:[],src:'none'};
  const pw={};A.forEach(n=>pw[n.id]=rk26Pw(n.id));
  const mg=Math.max(1e-9,...A.map(n=>n.gdp)),mp=Math.max(1e-9,...A.map(n=>n.pop)),mw=Math.max(1e-9,...A.map(n=>pw[n.id])),ms=Math.max(1e-9,...L.map(x=>x.s));
  const snap=RK26S&&RK26S.G===G?RK26S:null;let est=null;
  if(!snap){const g={},p={};A.forEach(n=>{const gr=isFinite(n.g)?n.g:null;g[n.id]=gr==null?null:n.gdp/Math.max(.05,1+gr/100);
      let pg=null;try{const d=typeof N0!=='undefined'?N0[n.id]:null;if(d&&typeof popG==='function'){const v=popG(n,d);if(isFinite(v))pg=v;}}catch(e){}
      p[n.id]=pg==null?null:n.pop/Math.max(.05,1+pg/100);});
    const sc=A.every(n=>g[n.id]!=null&&p[n.id]!=null)?rk26Score(A,n=>g[n.id],n=>p[n.id],n=>pw[n.id]):null;est={g,p,sc};}
  const c01=v=>Math.max(0,Math.min(1,isFinite(v)?v:0));
  const rows=L.map((x,i)=>{const n=G.nations[x.id];if(!n)return null;const o=snap&&snap.d[x.id];
    const tr=snap?{gdp:rk26Tr(n.gdp,o&&o.gdp),pop:rk26Tr(n.pop,o&&o.pop),pw:rk26Tr(pw[x.id],o&&o.pw),s:rk26Tr(x.s,o&&o.s)}
      :{gdp:rk26Tr(n.gdp,est.g[x.id],1),pop:rk26Tr(n.pop,est.p[x.id],1),pw:{k:'n',c:null,est:false},s:est.sc?rk26Tr(x.s,est.sc[x.id],1):{k:'n',c:null,est:false}};
    return {id:x.id,pos:i+1,gdp:n.gdp,pop:n.pop,pw:pw[x.id],s:x.s,bar:{gdp:c01(n.gdp/mg),pop:c01(n.pop/mp),pw:c01(pw[x.id]/mw),s:c01(x.s/ms)},tr};}).filter(Boolean);
  return {L,rows,src:snap?'snap':'est',y0:snap?snap.y:null};}

function rk26Arrow(t){const ar={u:'▲',d:'▼',e:'▶',n:'·'}[t.k];
  const pc=t.c==null?'':(t.c>=0?'+':'−')+Math.abs(t.c*100).toFixed(Math.abs(t.c)<.1?1:0)+' %';
  const tl=t.k==='n'?'Sin dato de tendencia':t.k==='e'?`Estable (${pc})`:(t.k==='u'?'Sube ':'Baja ')+pc;
  return `<i class="rk26a ${t.k}" title="${tl}${t.est?' (estimado)':''} frente al año anterior">${ar}${t.k==='n'?'':' '+pc}${t.est&&t.k!=='n'?'*':''}</i>`;}
function rk26Cell(lab,val,t,bar,cls){return `<span class="rk26c"><small>${lab}</small><b data-noi18n>${val}${rk26Arrow(t)}</b><span class="rk26b${cls?' '+cls:''}"><i style="width:${(bar*100).toFixed(1)}%"></i></span></span>`;}
function rk26Row(r,me){const N=G.nations[r.id];const war=typeof warsOf==='function'&&warsOf(r.id).length;
  return `<div class="item rk26r${r.id===me?' mine':''}" data-rk="${r.pos}"><span class="rk26h"><div class="t">${r.pos}. ${flag(r.id,12)} ${N.name}</div>`+
    `<div class="s">${war?'<span class="pill war">en guerra</span>':''}</div></span>`+
    rk26Cell('Puntaje',Math.round(r.s)+' pts',r.tr.s,r.bar.s,'s')+rk26Cell('PIB',fmtN(r.gdp),r.tr.gdp,r.bar.gdp)+
    rk26Cell('Población',fmtPop(r.pop),r.tr.pop,r.bar.pop)+rk26Cell('Poder militar',String(Math.round(r.pw)),r.tr.pw,r.bar.pw)+`</div>`;}

(function(){if(typeof rankTab!=='function')return;const _rk26=rankTab;rankTab=function(b,n){_rk26(b,n);try{
  const D=rk26Data();if(!D.rows.length)return;const me=n.id;const TOP=20;
  b.querySelectorAll('.item').forEach(x=>x.remove());
  const box=document.createElement('div');box.className='rk26';
  const note=D.src==='snap'?`Flechas: cambio desde ${D.y0} (verde sube, rojo baja, gris estable ±1 %). Barras: valor frente al líder.`
    :'Flechas con * estimadas con el crecimiento del último año; el poder militar se verá al pasar el próximo año. Barras: valor frente al líder.';
  const paint=all=>{const R=all?D.rows:D.rows.slice(0,TOP);const mine=D.rows.find(r=>r.id===me);
    box.innerHTML=`<div class="rk26n">${note}</div>`+R.map(r=>rk26Row(r,me)).join('')+
      (!all&&mine&&mine.pos>TOP?rk26Row(mine,me):'')+
      (!all&&D.rows.length>TOP?`<button type="button" class="btn rk26more">Ver más (${D.rows.length-TOP} países)</button>`:'');
    box.querySelectorAll('.item').forEach(it=>{const k=+it.dataset.rk;if(k>=1&&k<=3)it.classList.add('rk'+k);});
    const bt=box.querySelector('.rk26more');if(bt)bt.onclick=()=>paint(true);};
  paint(false);b.appendChild(box);}catch(e){}};})();
