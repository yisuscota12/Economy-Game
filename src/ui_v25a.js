/* ===== v2.5a — la app se juega solo en horizontal: aviso «Gira el teléfono» en vertical =====
   Solo interfaz: no toca reglas, guardado (imperioVida_v3), worker ni IndexedDB, ni claves de imperioCfg.
   Se carga al final (después de ui_v24c.js). Con el teléfono en vertical (y en pantallas de hasta 1024 px de ancho)
   cubre la app con un aviso; al girar, desaparece y el juego sigue donde estaba (el mapa se redibuja solo).
   El código de la vista vertical antigua (html.v3m / body.land en modo vertical, etc.) queda sin uso y se retira en una
   versión posterior, con cuidado (ver RETOMAR_SESION.md, pendiente A). */
(function(){
  try {
    if (document.getElementById('gireAviso')) return;
    var st = document.createElement('style');
    st.id = 'gireAvisoCss';
    st.textContent =
      '#gireAviso{display:none;position:fixed;inset:0;z-index:2147483000;background:var(--bg,#0b0f16);color:var(--ink,#e9eef5);' +
      'align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px;text-align:center;' +
      'font-family:system-ui,-apple-system,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}' +
      '@media (orientation:portrait) and (max-width:1024px){#gireAviso{display:flex}}' +
      '#gireAviso .gi-ic{font-size:64px;line-height:1;animation:gireRot 2.4s ease-in-out infinite}' +
      '#gireAviso .gi-t{font-size:20px;font-weight:800;margin:0}' +
      '#gireAviso .gi-s{font-size:14px;opacity:.75;margin:0;max-width:300px;line-height:1.4}' +
      '@keyframes gireRot{0%,20%{transform:rotate(0)}50%,70%{transform:rotate(-90deg)}100%{transform:rotate(0)}}' +
      '@media (prefers-reduced-motion:reduce){#gireAviso .gi-ic{animation:none}}';
    document.head.appendChild(st);
    var d = document.createElement('div');
    d.id = 'gireAviso';
    d.setAttribute('role', 'alert');
    d.setAttribute('aria-live', 'polite');
    d.innerHTML = '<div class="gi-ic" aria-hidden="true">📱</div>' +
      '<p class="gi-t">Gira el teléfono</p>' +
      '<p class="gi-s">ECONOMY se juega en horizontal.</p>';
    var add = function(){ if (document.body && !document.getElementById('gireAviso')) document.body.appendChild(d); };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  } catch (e) {}
})();
