# ECONOMY — historial del trabajo (rama `claude/busy-goldberg-g55ljm`)

Registro de lo hecho en la sesión del 24 de noviembre de 2026. El detalle técnico de cada versión
está en `CONTEXTO_IA.md` (secciones 3, 7, 9 y 10); este archivo es el resumen cronológico.

## Commits de la sesión (de más antiguo a más reciente)

| Commit | Versión | Qué hace |
|---|---|---|
| `b7cc684` | — | Quita la línea obsoleta «v1.6e — siguiente» de `CONTEXTO_IA.md`. |
| `43e1ffd` | v2.2e | La interfaz pixel adopta la paleta y el tratamiento de la prueba 3 (ciudad isométrica): losas, barra de navegación tipo calle, pestañas activas con luz cálida. Solo CSS bajo `html[data-px=p2]`. |
| `5d4096f` | v2.3a | Fase 5, parte 1: ecosistema, agua dulce, tierra cultivable y alimentos por provincia; escasez de 14 recursos por país; efectos pequeños en sectores, PIB y felicidad. |
| `ecf78ab` | v2.2f | Interfaz horizontal: riel izquierdo vertical, botones de 44 px, burbujas de acciones que se despliegan, ficha de provincia más clara. |
| `2b0d23d` | v2.3b | Fase 5, parte 2: flora y fauna por provincia (35 íconos propios nuevos), proyectos de agua y alimentos (desalinizadora, riego, invernaderos, presa), ríos en azul en el modo 🌿. |
| `8e27427` | v2.3c | Fase 5, parte 3: reforestación, área protegida, tratamiento de aguas, contaminación de empresas, sequía en granjas y ranchos, avance «Tecnología del agua». |
| `a2cc7ac` | v2.3d | Horizontal con mapa a pantalla completa; reloj, Personaje, País y noticias como burbujas; bolsa solo en su pestaña; activos elegibles en Ajustes; botón «Ciudad». |
| `0c04aca` | v2.3e | Pestañas más simples; riel izquierdo plegable; pantalla completa en horizontal (metas de app web); mapa con umbral de 7 px, zoom en los dedos, inercia y sensibilidad en Ajustes. |
| `26d332b` | — (textos) | Traducción de los textos nuevos de v2.3a a v2.3e a los 13 idiomas (422 claves; sin cambiar claves existentes). |

## Decisiones tomadas por el dueño

- Estilo pixel: **prueba 3** (ciudad isométrica), aplicada a toda la interfaz pixel en v2.2e.
- Fase 5 (naturaleza y recursos) se hizo en tres partes (v2.3a, v2.3b, v2.3c).
- Trabajo de interfaz en horizontal (iPhone 11) como prioridad; vertical sin cambios de diseño.
- Las pruebas visuales las hace el dueño en iPhone 11 y Toshiba (no se abren navegadores).

## Balance (simulación con `nat23test.js`)

- v2.3a: PIB mundial +0.2 % (dentro del ruido de ±0.36 %).
- v2.3b: PIB +0.16 %, recesiones −0.8 %, crisis +4.6 % (dentro del ruido).
- v2.3c: 60 semillas en dos tandas. La primera (semillas 1–30) dio PIB −0.64 %, fuera del ruido de +0.15 %; la segunda (31–60) dio +0.79 %. Con 60 semillas: +0.07 %, dentro del ruido. **Pendiente de vigilar** si el PIB mundial sale fuera del ruido en pruebas más largas.

## Pendientes

### Interfaz (se arreglará más adelante, según el dueño)
- Probar en iPhone 11 horizontal: burbujas, riel, mapa y pestañas (v2.3d y v2.3e).
- Recorrido guiado (`ui_v11`) y Guía (`ui_v15`): señalan elementos que en horizontal están ocultos o en otro lugar.
- Decidir si el riel se pliega solo al abrir un panel y si la vista vertical también usa el riel plegable.
- Botones del mapa (zoom y modos) siguen en 32–40 px en algunos casos.
- Varias barras de acciones apiladas en la ficha de provincia: se pueden unir en una.
- Revisar que las etiquetas del riel quepan en idiomas largos (alemán, ruso, etc.).

### Traducción
- Revisión por nativos de: nombres de especies en zh, ja, ko, ar, hi; «Suave / Ágil» y «Con / Sin inercia»; tono de hindi y árabe.
- Corregir «personas» en zh, ja y ko (traducción antigua mala); cambia la clave en el código.
- Dirección del árabe en los textos nuevos.

### Ruta del juego (siguiente)
- **Fase 6: Logística** (estimado 12–16 h). Pendiente de planificar con el dueño.
- **Fase 7: Política y mundo** (estimado 28–36 h).
- Pendientes menores de la fase 5: que la IA pague obras con su presupuesto; que la sequía afecte a las empresas agrícolas de la bolsa; ríos y lagos con nombre cuando haya datos de Natural Earth; avances científicos adicionales; íconos propios para 🚰 y 🔬; que la contaminación afecte a las empresas de la IA del mercado.

## Enlaces

- Versión privada más reciente (v2.3e con traducciones): https://claude.ai/artifact/MMZHCZr9b5PfN4REmE6ds6
- Documentación técnica: `CONTEXTO_IA.md`
