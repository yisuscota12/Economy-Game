# RETOMAR ECONOMY EN OTRA SESIÓN

Documento de traspaso. Léelo completo antes de tocar código. Complementa a `CONTEXTO_IA.md` (reglas, arquitectura, trampas) y a `HISTORIAL_TRABAJO.md` (commits y balance). No repitas trabajo que ya está en la rama.

## 1. Estado al cierre (25 de noviembre de 2026, ~05:00 UTC)

- **Rama de trabajo:** `claude/busy-goldberg-g55ljm` (empuja aquí; no crear PR salvo que el dueño lo pida).
- **Último commit de funcionalidad:** `7f3bb63` (v2.4c). Antes: `15fcab3` (v2.4b), `60563f7` (v2.4a).
- **Versión que ve el dueño:** v2.4c. Tamaño de `imperio.html` ~12.7 MB (límite 16 MB). El archivo nunca va al repo (está en `.gitignore`).
- **Link privado de prueba (se actualiza con `Artifact publish` al mismo `url`):** https://claude.ai/artifact/MMZHCZr9b5PfN4REmE6ds6
  - Publicarlo solo con el `file_path` de `imperio.html` tras `node build.js`. El dueño pidió siempre el link actualizado tras cada entrega.
- **Verificación:** nadie abre navegadores (`CLAUDE.md`). El dueño prueba en iPhone 11 (Safari, horizontal) y, para el modo ligero, en la Toshiba. Todo lo visual está sin verificar en pantalla.

## 2. Cómo trabajar (reglas del dueño y del repo)

- **Idioma:** español con el dueño, siempre. Textos del juego: en español salvo que la tarea sea de traducción.
- **Modelos (regla acordada):** el coordinador (la sesión principal) puede ser Haiku; delega con el parámetro `model` del Agent tool:
  - **Opus:** motor (`engine_*`), arquitectura multi-módulo, fases de economía y rediseños grandes de interfaz.
  - **Sonnet:** CSS, textos, traducciones y ajustes puntuales.
  - **Haiku:** tareas triviales.
  - El dueño puede cambiar el modelo de la sesión con `/model`; los subagentes usan su propio `model`.
- **Límite de uso:** el plan tiene un límite de 5 horas. Si un agente Opus se corta por eso, se reanuda con `SendMessage` al mismo agente (ya pasó dos veces). No es compra de crédito.
- **Commits:** sin ningún identificador de modelo en el mensaje. Termina con `Claude-Session: https://claude.ai/code/session_01CUM1xRbauQim1JgfaTya9m` (la sesión anterior; en la nueva, usar la de la nueva sesión).
- **No commitear a medias:** el stop hook pide commit cuando hay cambios sin confirmar. Si hay un agente escribiendo, esperar a que termine y que él haga el commit.
- **Build obligatorio:** `node build.js` antes de entregar. Sin errores de sintaxis y `imperio.html` < 16 MB.
- **No tocar sin pedir:** `ui_v18b.js` (Worker de guardado e IndexedDB), las claves `imperioVida_v3` e `imperioCfg` (solo añadir campos opcionales), y no convertir `function nombre(){}` a `const`.
- **Trabajo de traducción:** sí se pueden leer `src/data_i18n.js` y `herramientas/i18n/`. Flujo en `CONTEXTO_IA.md` §7 y el commit `26d332b` como ejemplo.

## 3. Decisiones del dueño (no reabrir)

- **Estilo pixel elegido:** prueba 3 (ciudad isométrica), aplicada a toda la interfaz pixel (v2.2e).
- **Vista vertical: ELIMINADA PARA SIEMPRE.** La app se juega solo en horizontal. Ya no hay fase 4 de vista vertical.
- **Fase 4 (vista vertical): ELIMINADA** de la lista.
- **«Elimina esta acción»:** se interpretó como la vista vertical (el dueño confirmó al decir «elimina la vista vertical para siempre»).
- **Fase 5 (naturaleza y recursos): HECHA** en v2.3a–c.
- **Traducciones de nuevos textos:** se hacen en bloque, con Sonnet, por versión.

## 4. Lo hecho (resumen por versión)

| Versión | Qué quedó |
|---|---|
| v2.2e | Interfaz pixel con la paleta y losas de la prueba 3 |
| v2.2f | Horizontal: riel izquierdo, botones de 44 px, burbujas de acciones, ficha de provincia |
| v2.3a | Ecosistema, agua, tierra, alimentos y escasez por provincia y país |
| v2.3b | Flora y fauna (35 íconos propios), proyectos de agua/alimentos, ríos en azul en 🌿 |
| v2.3c | Reforestación, área protegida, tratamiento de agua, contaminación, sequía, avance «Tecnología del agua» |
| v2.3d | Mapa a pantalla completa, burbujas superiores (reloj, Personaje, País, noticias), bolsa solo en su pestaña |
| v2.3e | Pestañas más simples, riel plegable, pantalla completa, manejo del mapa (umbral 7 px, inercia, sensibilidad) |
| traducciones v2.3a–e | 422 claves en 13 idiomas |
| v2.4a | Logística terrestre/marítima: empresas de transporte, red de envíos, capa de envíos en Canvas, pantalla 🚚 |
| v2.4b | Ficha de ciudad sin scroll, riel de gotas, barra de submenús con «Atrás», acciones de ciudad en el mapa por tipo de mapa |
| v2.4c | Logística aérea (aeropuertos, rutas por gravedad, pestaña ✈️ Red aérea), empresas estatales, turismo por provincia y políticas, bolsa según PIB (178 empresas) |

## 5. Pendientes, en orden recomendado

### A. Quitar la vista vertical (decisión firme)
- Hacer que la app sea solo horizontal. Decidir con el dueño qué ve en vertical: un aviso «Gira el teléfono» (recomendado) o una pantalla de bloqueo.
- Retirar el código de la vista vertical que ya no se use (con cuidado: `html.rail`, `body.land`, `v3m`, `ui_v22f.js`, `ui_v23d.js`, `ui_v23e.js` tienen lógica de horizontal/vertical).
- Modelo: **Opus** (toca layout y varios módulos).

### B. Rediseño de las gotas (glass líquido) en TODA la interfaz
- Pedido del dueño: gotas «más reales, más transparentes, más fluidas, más rápidas», aplicado a toda la interfaz (riel, submenús, burbujas superiores, barra de submenús, botones, pestañas).
- Referencia visual que dio: burbujas/gotas de agua que se multiplican, con relieve 3D tipo glass líquido. El botón activo resaltado y sus submenús brotando como gotas unidas.
- Cuidados: rendimiento en iPhone 11 (evitar `backdrop-filter` pesado; probar con `will-change` y transform/opacity) y modo ligero sin efectos caros (Toshiba).
- Modelo: **Opus** (multi-módulo: `ui_v24b.js` riel y submenús, `ui_v23d.js`, `ui_v23e.js`, `ui_v22f.js`, CSS).

### C. Fase 3: ciudades en pixel
- Cada ciudad del mapa con su silueta pixel característica (lo que la identifica: skyline, edificios típicos, relieve), al estilo TheoTown/Plague Inc.
- Generado por código (sin arte de terceros), con paleta reducida y datos de la ciudad. Reutilizar `ui_v22d.js` (vista isométrica de provincia) como base.
- Modelo: **Opus** para la lógica; **Sonnet** para ajustes visuales.

### D. Traducciones pendientes
- v2.4a: unos 80 textos.
- v2.4b: textos de la ficha de ciudad, riel y submenús.
- v2.4c: unos 150 textos (aérea, estatales, turismo, bolsa).
- v2.3e y anteriores: ya traducidos (commit `26d332b`).
- Método: como el commit `26d332b`. Modelo: **Sonnet**.
- Ojo: el agrupado de «Más» en `ui_v24b.js` reconoce opciones por emoji y palabras en español; en otro idioma, si no encuentra 2 grupos, las gotas se vuelven las primeras opciones.

### E. Pendientes de v2.4c (economía)
- IA: que construya aeropuertos y use su tesoro con las estatales (hoy no, para proteger el balance).
- Turismo interno (hoy solo turismo internacional).
- Carga aérea del jugador para rutas de pasajeros.
- Estatales: que su empleo llegue a la red de personas del jugador.
- Bolsa: recalcular el número de empresas si un país crece mucho (hoy es fijo).
- Datos reales de aeropuertos y rutas marítimas, cuando haya red.

### F. Pendientes de v2.4a y v2.4b (interfaz y logística)
- Naviera en venta puede salir tierra adentro (la venta no revisa costa).
- Fase 6 parte 2: agencias de comercio, aduanas, puertos y aeropuertos como obras, bloqueos y eventos de envíos.
- Íconos de línea propios para 🚢, ✈️ y las demás gotas (hoy son emoji que dibuja IVI).
- Métricas en más pantallas (Salud, Familia, carreras especiales) e historial de varios meses en la ficha de empresa.

### G. Interfaz heredada de v2.3d/e/4b
- Recorrido guiado (`ui_v11`) y Guía (`ui_v15`): señalan elementos que en horizontal están ocultos o movidos.
- Botones del mapa (zoom y modos) siguen en 32–40 px en algunos casos.
- Varias barras de acciones apiladas en la ficha de provincia (se pueden unir).
- Decidir si el riel se pliega solo al abrir un panel.
- Revisar que las etiquetas del riel quepan en idiomas largos (alemán, ruso, etc.).

### H. Retroalimentación del dueño
- Pedir al dueño que pruebe v2.4c en iPhone 11 horizontal y que diga qué ve. Lo que el dueño no ha podido probar aún: casi todo lo de v2.3d en adelante.

## 6. Qué no hacer en la nueva sesión

- No abrir navegadores ni servidores para verificar.
- No publicar artifacts sin que el dueño lo pida o sin cambios que probar (el dueño pidió el link actualizado tras cada entrega).
- No crear PR sin pedirlo.
- No usar `Math.random` en la simulación (usar `h21`).
- No subir `imperio.html`.

## 7. Cómo arrancar la nueva sesión

1. Clonar/usar el repo `yisuscota12/Economy-Game` y hacer checkout de `claude/busy-goldberg-g55ljm`.
2. Leer este archivo, luego `CONTEXTO_IA.md` (secciones 5, 7, 9 y 10 solo las necesarias), y `HISTORIAL_TRABAJO.md`.
3. Confirmar el estado con `git log --oneline -5` y `git status`.
4. Empezar por A (vista vertical) y B (gotas), que son las peticiones más recientes del dueño.
5. Al terminar cada parte: `node build.js`, commit, push, y publicar el link actualizado.

## 8. Estado final (26 de noviembre de 2026, rama `claude/busy-goldberg-g55ljm`, commit 4e513d7)

Todo lo de la lista original está hecho en código, salvo lo que depende de ver el juego en pantalla o de una revisión humana.

- **A (vista vertical):** cubierta por el aviso «Gira el teléfono» (`ui_v25a.js`). El código vertical se conserva sin uso, a petición del dueño.
- **B (gotas de cristal):** riel, submenús, burbujas, pestañas y barras (`ui_v25b.js`); riel unido con periodos y plegado (`ui_v25o.js`). Falta verlo en el iPhone 11.
- **C (ciudades en pixel):** `ui_v25k.js`. Falta verlo en pantalla.
- **D (traducciones):** textos de v2.4 y v2.5 en los 13 idiomas (`b6p2/v24_*.tsv`, `v25_*.tsv`). Falta revisión de un hablante nativo, sobre todo alemán y ruso.
- **E (economía):** turismo interno, carga aérea, estatales en la red de personas, bolsa según PIB, navieras con costa, IA con aeropuertos y estatales (`engine_v25a` a `v25l`). Todos dentro del ruido de las pruebas de balance, sin calibrar en partida.
- **F (logística y fase 6):** bloqueos, agencias, aduanas, puertos, cierres, íconos de línea y métricas (salud, familia, fama, box y MMA).
- **G (interfaz heredada):** recorrido guiado corregido (`ui_v25g.js`). La Guía (`showGuide`) no señala elementos; el pendiente del traspaso sobre `ui_v15.js` era un error (ese archivo es el ticker de mercado).

**Pendientes:** probar todo en iPhone 11 y Toshiba; lista de nombres para la portada (no está en el repositorio); revisión de traducciones; y el cambio de `build.js` que se perdió antes de v2.5b (no se recupera).

**No tocar sin pedir:** `ui_v18b.js`, las claves `imperioVida_v3` e `imperioCfg` (solo campos opcionales), y no convertir `function nombre(){}` en `const`.

## 9. Actualización (27 de noviembre de 2026)

Desde la sección 8 se añadieron: v2.5m–v2.5q (textos de v2.5 en 13 idiomas, métricas de box y MMA, rutas de barcos y envíos en el mapa, pantalla de elegir vida, riel unido y portada Facetas), v2.6a (ejércitos), v2.6b (ranking con vectores), v2.6c (programas nucleares) y v2.6d (textos de v2.6 en 13 idiomas).

**Decisiones abiertas:**
- Programas nucleares: quedan **apagados** (`NUKE_SYS.on=false` en `src/engine_v26c.js`). Las crisis bancarias suben en una tanda de balance. Decidir si se activan.
- Lista de nombres para la portada: no está en el repositorio.
- Supuestos de ejércitos, ranking y nuclear: revisar con el dueño.

**Pendientes:** probar todo en iPhone 11 y Toshiba; revisión de traducciones por hablantes nativos; calibrar en partida los efectos de v2.5 (la IA sube su deuda sin bajarla sola).
