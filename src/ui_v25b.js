/* ===== v2.5b — interfaz: gotas del riel más reales, más transparentes y más rápidas (pendiente B, primera parte) =====
   Solo interfaz (CSS): no toca reglas, guardado (imperioVida_v3 / imperioCfg), worker ni IndexedDB.
   Se carga al final (después de ui_v25a.js). Refina las gotas de ui_v24b.js (riel izquierdo y submenús que brotan)
   sin cambiar su marcado ni su JavaScript.
   - Más transparentes: el fondo de la gota deja ver el mapa; el relieve es un degradado de cristal con borde de luz.
   - Relieve 3D: brillo especular más nítido arriba a la izquierda y refracción leve abajo.
   - Más rápidas: transiciones de resorte más cortas (el mismo rebote, menos espera).
   - Burbujas superiores (reloj, Personaje, País, noticias): mismo cristal.
   - Modo ligero (html.v4lt, mapa en Canvas 2D de la Toshiba): sin desenfoque de fondo ni brillos caros.
   Desenfoque (backdrop-filter) pequeño y solo fuera del modo ligero: el iPhone 11 lo soporta con pocas gotas. */
(function(){const st=document.createElement('style');st.id='st25b';st.textContent=`
:root{--v5rim:rgba(255,255,255,.26);--v5gb:rgba(14,20,30,.42);
 --v5gr:radial-gradient(120% 110% at 30% 14%,rgba(255,255,255,.3),rgba(255,255,255,.08) 40%,rgba(255,255,255,0) 62%,rgba(0,0,0,.16) 100%);
 --v5sh:inset 0 1px 1px rgba(255,255,255,.4),inset 0 -5px 9px rgba(0,0,0,.2),inset 0 0 0 1px rgba(255,255,255,.05),0 6px 14px rgba(0,0,0,.28)}
@supports (background:color-mix(in srgb,red 50%,transparent)){:root{--v5gb:color-mix(in srgb,var(--glass,#0c121a) 42%,transparent)}}
/* botones del riel: cristal más claro y más transparente */
html.v3m body.land .bottom>.in>.nav{border:1px solid var(--v5rim)!important;background:var(--v5gr),var(--v5gb)!important;box-shadow:var(--v5sh)!important;
 transition:transform .18s cubic-bezier(.3,1.5,.5,1),box-shadow .16s ease,border-color .16s ease,background-color .16s ease}
/* brillo especular más nítido (reflejo de la gota) */
html.v3m body.land .bottom>.in>.nav::before{left:20%;top:9%;width:34%;height:19%;background:radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0))}
/* reflejo inferior suave (refracción) */
html.v3m body.land .bottom>.in>.nav::after{content:'';position:absolute;left:30%;bottom:7%;width:40%;height:12%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.22),rgba(255,255,255,0));pointer-events:none}
/* activo: brilla un poco más y crece con rebote */
html.v3m body.land .bottom>.in>.nav.on{transform:scale(1.1)}
/* submenús que brotan: más rápidos y más transparentes */
.v4d{background:var(--v5gr),var(--v5gb)!important;border:1px solid var(--v5rim)!important;box-shadow:var(--v5sh)!important;
 transition:transform .24s cubic-bezier(.3,1.5,.5,1) calc(var(--n,0) * 18ms),opacity .14s ease calc(var(--n,0) * 18ms)}
.v4d::before{left:20%;top:9%;width:32%;height:18%;background:radial-gradient(closest-side,rgba(255,255,255,.8),rgba(255,255,255,0))}
#v4dr .v4dn{background:var(--v5gb);border:1px solid var(--v5rim);transition:opacity .12s ease,transform .18s cubic-bezier(.3,1.5,.5,1)}
#v4dr.v4o .v4d,#v4dr.v4o .v4dn{opacity:1}
html.v3m body.land .bottom>.in>.nav:active,.v4d:active{transform:scale(.9)!important}
/* burbujas superiores (reloj, Personaje, País, noticias): mismo cristal que el riel */
html.v3m #v3top>.v3bb,html.v3m #v3top #tick.v3dot{border:1px solid var(--v5rim)!important;background:var(--v5gr),var(--v5gb)!important;box-shadow:var(--v5sh)!important;transition:transform .18s cubic-bezier(.3,1.5,.5,1),box-shadow .16s ease}
html.v3m #v3top>.v3bb:active{transform:scale(.92)}
/* con desenfoque (fuera del modo ligero): ligero y sin costo en el iPhone */
html:not(.v4lt) .v4d,html.v3m:not(.v4lt) body.land .bottom>.in>.nav{-webkit-backdrop-filter:blur(6px) saturate(1.6);backdrop-filter:blur(6px) saturate(1.6)}
/* modo ligero (Toshiba, mapa en Canvas 2D): sin desenfoque ni reflejos extra */
html.v4lt .v4d,html.v4lt body.land .bottom>.in>.nav{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
html.v4lt body.land .bottom>.in>.nav::after{display:none}
@media (prefers-reduced-motion:reduce){html.v3m body.land .bottom>.in>.nav,.v4d,#v4dr .v4dn{transition:none!important}}
`;document.head.appendChild(st);})();
