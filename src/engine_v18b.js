/* ===== v1.8b (cierre de la fase 1 de la ruta 9d: rendimiento) — motor =====
   Capitales precalculadas: capProv() buscaba la capital de cada país recorriendo las 3,422 provincias la primera vez que se pedía
   (la revisión de naciones formables del cierre de año pide ~80 países: ~170 ms con la CPU frenada ×4, en el primer cierre de cada sesión).
   Ahora un solo recorrido del mapa al cargar llena la misma caché (CAPP) con el mismo resultado: la primera provincia capital de cada país. */
(function(){if(typeof CAPP==='undefined'||typeof RG==='undefined')return;for(const r of Object.keys(RG)){const x=RG[r];if(x&&x.cap&&CAPP[x.n]===undefined)CAPP[x.n]=r;}})();
