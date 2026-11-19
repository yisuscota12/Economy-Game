# CLAUDE.md — reglas permanentes para ECONOMY

## Contexto y ahorro de tokens
- Antes de editar código, lee **solo las secciones relevantes** de `CONTEXTO_IA.md`. Por ejemplo, la sección **9e** para arte e interfaz, la 5 para la arquitectura, la 7 para construir y probar, y la 9 para las trampas conocidas.
- **Prohibido leer** los archivos masivos de datos (`src/data_*`) y los 14 diccionarios de idiomas (`src/data_i18n.js`, `herramientas/i18n/…`), **salvo que la tarea trate explícitamente de traducción o de balance numérico**.
- Busca con `grep` y lee rangos de líneas concretos en lugar de archivos completos.

## Arquitectura y compilación
- `node build.js` concatena unos 60 módulos de `src/` en un solo archivo, `imperio.html`. **No subas `imperio.html` al repositorio**: está en `.gitignore` y GitHub Pages lo genera al publicar `main`.
- **Ejecuta siempre `node build.js` antes de entregar.** Así validas la sintaxis y compruebas que `imperio.html` pese **menos de 16 MB**.
- No rompas el Web Worker de guardado ni IndexedDB (`ui_v18b.js`), y no cambies las claves `imperioVida_v3` ni `imperioCfg`.
- Patrón central: cada versión **envuelve** funciones anteriores declaradas con `function nombre(){}`. No las conviertas a `const`.

## Hardware objetivo
- **iPhone 11 (Safari iOS)** es el dispositivo mínimo. Lo que importa ahí es que el toque sea fluido y que todo se vea nítido.
- **Laptop Toshiba (Windows, Celeron, 4 GB)**: solo sirve como banco de pruebas del **modo ligero** (mapa en Canvas 2D, sin partículas ni efectos caros). No es el objetivo de cada efecto.

## Entrega
- No pidas subir `imperio.html` como artifact.
- Al final de cada entrega indica el **nombre exacto de la rama** y la **lista de archivos modificados**.

## 5. Optimización Quirúrgica de Costos y Modelos
- **Prohibido abrir navegadores (Chrome/Playwright/Puppeteer):** Nunca levantes servidores ni navegadores headless para hacer pruebas visuales o multi-idioma; la verificación termina en cuanto `node build.js` compila sin errores y pesa menos de 16 MB.
- **Selección adaptativa de modelo:** Resuelve ediciones de CSS, UI, textos y ajustes puntuales directamente con el modelo estándar rápido (Sonnet). Escala a un subagente de razonamiento profundo (Opus) únicamente cuando la tarea exija refactorizar lógica compleja del motor (`engine_*`) o arquitectura multi-módulo.
