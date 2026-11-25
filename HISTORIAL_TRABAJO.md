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
| `60563f7` | v2.4a | Fase 6, parte 1: empresas de transporte (terrestre, 🚢 naviera, ✈️ carga aérea) con flota, rutas y costo operativo; 20 transportistas de la IA; red de envíos anual; capa 🚢 Envíos en el mapa (lienzo propio, sin librerías); pantalla 🚚 Logística; flete de las importaciones como efecto pequeño. Textos solo en español. |
| (este commit) | v2.4b | Interfaz horizontal, fase 1 de la lista del dueño: ficha de ciudad sin desplazarse (secundario en subpestañas, acciones abajo); botón de envíos con icono vectorial en la ficha; riel de gotas de cristal por categoría con submenús que brotan; barra de submenús de cristal con atrás de 2 pasos, métricas con su tiempo y filas que se arrastran; burbuja del mapa con acciones según el tipo de mapa. Textos nuevos solo en español. |

## Sesión del 25 de noviembre de 2026 (GitHub, issue #1, rama `claude/issue-1-20261125-0310`)

| Commit | Versión | Qué hace |
|---|---|---|
| (12 commits de arriba) | v2.2e–v2.4b | Se trajo la rama `claude/busy-goldberg-g55ljm` a esta rama (avance rápido, sin conflictos) para que el PR los lleve a `main`. |
| (este commit) | v2.4c | Fase 6, parte 2: 🌊 estrechos y canales (Suez, Panamá, Bósforo, Ormuz, Malaca, Bab el-Mandeb) que se cierran por guerra, accidente, sequía o tensión, o tienen piratería; huelgas portuarias; 🏗️ terminal de contenedores y 🛫 aeropuerto de carga como obras; pestaña «🌊 Pasos y obras» en 🚚 Logística; pasos cerrados en el mapa. Textos solo en español. |

## Decisiones tomadas por el dueño

- Estilo pixel: **prueba 3** (ciudad isométrica), aplicada a toda la interfaz pixel en v2.2e.
- Fase 5 (naturaleza y recursos) se hizo en tres partes (v2.3a, v2.3b, v2.3c).
- Trabajo de interfaz en horizontal (iPhone 11) como prioridad; vertical sin cambios de diseño.
- Las pruebas visuales las hace el dueño en iPhone 11 y Toshiba (no se abren navegadores).

## Balance (simulación con `nat23test.js`)

- v2.3a: PIB mundial +0.2 % (dentro del ruido de ±0.36 %).
- v2.3b: PIB +0.16 %, recesiones −0.8 %, crisis +4.6 % (dentro del ruido).
- v2.4a: 60 semillas. La primera versión dio PIB −0.45 % (A/A −0.06 %): fuera del ruido; se corrigió (no llenar la caché de la naturaleza en `ageUp`, sin baja en bolsa). Final: PIB +0.03 % (A/A +0.37 %), recesiones −0.2 %, crisis +1.0 %, salud ponderada −0.66 (A/A +0.66), felicidad −0.03: dentro del ruido.
- v2.4c (`quita=v24c`, base = v2.4b, 10 años, México, Realista). Primera versión, 40 semillas: PIB mundial 147.20 → 147.36 billones (+0.10 %; tandas de 5 entre −2.9 % y +1.7 %), recesiones +1.5 %, crisis +4.8 %, salud ponderada −0.15, felicidad −0.10. Ahí se vio que los eventos caían en los mismos meses en todas las partidas (h21 sin sal; el mundo inicial es igual siempre) y que había huelgas en países con «costa» de lago: se corrigió (sal por partida y huelgas solo en países con rutas marítimas). Versión final, 20 semillas: PIB 147.72 → 147.19 (−0.36 %; tandas +1.08, +0.35, −0.85, −1.97 %; la desviación por semilla es ~2.3 %, error de la media ~0.5 %), recesiones 2,791 → 2,827 (+1.3 %), crisis 502 → 487 (−3.0 %), salud ponderada 44.92 → 45.57, felicidad 48.46 → 48.51, mes 68.3 → 70.1 ms. Dentro del ruido. En 10 años, la primera semilla tuvo 1 cierre, 2 olas de piratería y ~5 huelgas; el término «nlog» se ve en 14–26 de ~50 países (antes 0–15).
- v2.3c: 60 semillas en dos tandas. La primera (semillas 1–30) dio PIB −0.64 %, fuera del ruido de +0.15 %; la segunda (31–60) dio +0.79 %. Con 60 semillas: +0.07 %, dentro del ruido. **Pendiente de vigilar** si el PIB mundial sale fuera del ruido en pruebas más largas.

## Pendientes

### Interfaz (se arreglará más adelante, según el dueño)
- Probar en iPhone 11 horizontal: burbujas, riel, mapa y pestañas (v2.3d y v2.3e) y lo de la v2.4b (ficha de ciudad sin desplazarse, gotas del riel, barra de submenús, burbuja del mapa por tipo).
- Recorrido guiado (`ui_v11`) y Guía (`ui_v15`): señalan elementos que en horizontal están ocultos o en otro lugar.
- Decidir si el riel se pliega solo al abrir un panel y si la vista vertical también usa el riel plegable.
- Botones del mapa (zoom y modos) siguen en 32–40 px en algunos casos.
- Varias barras de acciones apiladas en la ficha de provincia: se pueden unir en una.
- Revisar que las etiquetas del riel quepan en idiomas largos (alemán, ruso, etc.).

### Traducción
- Revisión por nativos de: nombres de especies en zh, ja, ko, ar, hi; «Suave / Ágil» y «Con / Sin inercia»; tono de hindi y árabe.
- Corregir «personas» en zh, ja y ko (traducción antigua mala); cambia la clave en el código.
- Dirección del árabe en los textos nuevos.

### Traducción (v2.4a, v2.4b y v2.4c)
- Traducir los textos nuevos de la v2.4c (lista en `CONTEXTO_IA.md`, sección 10, «v2.4c»).
- Traducir los textos nuevos de la v2.4b (lista en `CONTEXTO_IA.md`, sección 9e, «v2.4b»).
- Traducir los ≈ 80 textos nuevos de la v2.4a a los 13 idiomas (lista en `CONTEXTO_IA.md`, sección 10, «v2.4a»).

### Ruta del juego (siguiente)
- **Fase 6: Logística**: parte 1 hecha en v2.4a y parte 2 en v2.4c (estrechos y canales, huelgas, terminal de contenedores y aeropuerto de carga). Queda para una parte 3: agencias y organizaciones de comercio, aduanas y aranceles, rutas que traza el jugador. Probar en iPhone 11 y Toshiba la capa 🚢 y la pantalla 🚚.
- **Fase 7: Política y mundo** (estimado 28–36 h).
- Pendientes menores de la fase 5: que la IA pague obras con su presupuesto; que la sequía afecte a las empresas agrícolas de la bolsa; ríos y lagos con nombre cuando haya datos de Natural Earth; avances científicos adicionales; íconos propios para 🚰 y 🔬; que la contaminación afecte a las empresas de la IA del mercado.

## Enlaces

- Versión privada más reciente (v2.3e con traducciones): https://claude.ai/artifact/MMZHCZr9b5PfN4REmE6ds6
- Documentación técnica: `CONTEXTO_IA.md`
