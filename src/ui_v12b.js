/* ===== v1.2b: ventana de diálogo — persona, memoria, opciones con probabilidad y dado visible ===== */
(function(){const st=document.createElement('style');st.textContent=`
.dlg .cat{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;padding:3px 8px;border-radius:999px;border:1px solid currentColor;margin-bottom:8px}
.dlg .who{display:flex;gap:12px;align-items:center;margin:4px 0 10px;padding:10px;border:1px solid #243244;border-radius:12px;background:#0f1722}
.dlg .who b{display:block;font-size:15px}.dlg .who small{display:block;font-size:12px;opacity:.75;margin-top:2px}
.dlg .bar{height:6px;border-radius:6px;background:#1e2a3a;margin-top:5px;overflow:hidden;width:150px}.dlg .bar i{display:block;height:100%;border-radius:6px}
.dlg .txt{font-size:15.5px;line-height:1.5;margin:6px 0 12px}.dlg .txt small{display:block;opacity:.7;font-size:12px;margin-top:6px}
.dlg .luck{margin-top:8px;padding:8px 10px;border-radius:10px;background:#0f1f17;border:1px dashed #3ccf8e;font-size:13px}.dlg.bad .luck{background:#24110f;border-color:#ff5a5a}
.dlg .opt{display:block;width:100%;text-align:left}.dlg .opt .ck{display:block;font-size:12px;margin-top:3px;opacity:.9}.dlg .opt[disabled]{opacity:.45}
.dlg .dice{font-size:44px;font-weight:900;text-align:center;margin:8px 0 2px;font-variant-numeric:tabular-nums}.dlg .dres{text-align:center;font-weight:800;margin-bottom:8px}
.dlg .fx{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.dlg .fx span{font-size:12.5px;padding:4px 8px;border-radius:8px;background:#162130;border:1px solid #2b3a4e}`;document.head.appendChild(st);})();
const DCAT={familia:['#b38cff','FAMILIA'],amigos:['#5aa9ff','AMIGOS'],trabajo:['#f2a33a','TRABAJO'],negocio:['#3ccf8e','NEGOCIO'],'inversión':['#3ccf8e','INVERSIÓN'],'política':['#ff8a3d','POLÍTICA'],gobierno:['#f2c14e','GOBIERNO'],salud:['#ff6b8b','SALUD'],suerte:['#3ccf8e','🍀 SUERTE'],'mala suerte':['#ff5a5a','⚠️ MALA SUERTE']};
const ROL={jefe:'Tu jefe',colega:'Compañero de trabajo',contacto:'Contacto',empresario:'Empresario',proveedor:'Proveedor',inspector:'Inspector',rival:'Rival político',sindical:'Líder sindical',ministro:'Gabinete',embajador:'Embajador'};
function whoHTML(p,x){if(!x)return '';const known=(x.hist&&x.hist.length>=2)||(x.rel||0)>=70;const rol=x.rol?ROL[x.rol]||x.rol:x===p.partner?'Pareja':(p.children||[]).includes(x)?(x.sex==='F'?'Hija':'Hijo'):x.role||((p.siblings||[]).includes(x)?(x.sex==='F'?'Hermana':'Hermano'):(x.k==='amigo'?'Amistad':''));
  const rel=Math.round(x.rel==null?50:x.rel),col=rel>=65?'#3ccf8e':rel>=40?'#f2c14e':'#ff5a5a';
  return `<div class="who">${face(x,52)}<div><b>${x.name}</b><small>${rol}${x.age?' · '+x.age+' años':''} · ${known&&x.tr?'rasgo: '+x.tr:'rasgo: aún no lo conoces'}</small>
   <div class="bar"><i style="width:${rel}%;background:${col}"></i></div><small>Relación ${rel}/100${x.fav>0?` · 🤝 te debe ${x.fav}`:x.fav<0?` · 🤝 le debes ${-x.fav}`:''}${x.ren>0?` · 😠 rencor ${x.ren}`:''}${x.hist&&x.hist.length?` · recuerda: «${x.hist[x.hist.length-1].t}»`:''}</small></div></div>`;}
function showDialog(){const p=P;const V=dlgNode(p);if(!V){render();return;}const D=p.dlg;const m=$('modal');const key=D.id+'|'+D.node+'|'+(D.res?1:0);if(m.classList.contains('on')&&m._dk===key)return;
  const [cc,cn]=DCAT[V.cat]||['#9aa7b6',String(V.cat||'').toUpperCase()];
  let h=`<div class="dlg${V.cat==='mala suerte'?' bad':''}"><span class="cat" style="color:${cc}">${cn}</span><h2 style="margin:0 0 4px">${V.d.title||''}</h2><div style="font-size:12px;opacity:.65">${dateStr()}</div>${whoHTML(p,V.x)}`;
  if(!D.res){h+=`<div class="txt">${V.txt}</div>`+V.opts.map(o=>`<button class="opt" data-i="${o.i}" ${o.ok?'':'disabled'}>${o.t}${o.k?`<span class="ck">🎲 ${o.pct} % de éxito · ${STAT_N[o.k[0]]} ${Math.round(statV(p,o.k[0]))} vs ${Math.round(o.k[1]-(o.k[2]||0))}</span>`:''}${o.ok?'':`<span class="ck">🔒 ${o.lock}</span>`}</button>`).join('');}
  else{const r=D.res;h+=(r.roll!=null?`<div class="dice" id="dDice">🎲 --</div><div class="dres" id="dRes" style="visibility:hidden;color:${r.succ?'#3ccf8e':'#ff5a5a'}">${r.succ?'Éxito':'Fallo'} · sacaste ${r.roll}, necesitabas ${r.pct} o menos</div>`:'')+
    `<div class="txt">${r.t||''}</div>${r.fx&&r.fx.length?`<div class="fx">${r.fx.map(f=>`<span>${f}</span>`).join('')}</div>`:''}<button class="btn gold" id="dGo" style="width:100%;padding:12px">${r.to?'Seguir':'Continuar'}</button>`;}
  showModal(h+'</div>',b=>{m._dk=key;b.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{const r=dlgChoose(+x.dataset.i);if(!r)return;save();sfx(r.succ?'good':'bad');showDialog();});
    const g=b.querySelector('#dGo');if(g)g.onclick=()=>{dlgNext();m._dk=null;save();if(P.dlg)showDialog();else{hideModal();render();}};
    const dd=b.querySelector('#dDice');if(dd){let k=0;const fin=D.res.roll;const iv=setInterval(()=>{k++;dd.textContent='🎲 '+(k<12?RI(1,100):fin);if(k>=12){clearInterval(iv);const rr=b.querySelector('#dRes');if(rr)rr.style.visibility='visible';}},55);}});}
{const _bt=blockedTurn;blockedTurn=function(){if(P&&P.dlg){showDialog();return true;}return _bt();};}
// ajuste: frecuencia de diálogos
{const _ss=showSettings;showSettings=function(){_ss();const b=$('sheetIn');const x=document.createElement('button');x.className='item';const L={baja:'baja (~4 al año)',normal:'normal (~8 al año)',alta:'alta (~14 al año)'};
  x.innerHTML=`<span><div class="t">Diálogos con causa: ${L[CFG.dlg||'normal']}</div><div class="s">Cuántas conversaciones y situaciones interrumpen el reloj. Las causas (tu vida, tu país, tu historia con cada persona) deciden cuáles aparecen.</div></span>`;
  x.onclick=()=>{CFG.dlg={baja:'normal',normal:'alta',alta:'baja'}[CFG.dlg||'normal'];saveCfg();showSettings();};const f=b.querySelector('.item');if(f)b.insertBefore(x,f);else b.append(x);};}
