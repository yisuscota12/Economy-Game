// Ensambla imperio.html: estilos + cuerpo + datos + motor + UI
const fs = require('fs');
const css = fs.readFileSync('src/style.css', 'utf8').replace('</style>', `
#mapWrap{aspect-ratio:16/11;max-height:62vh}
#mapWrap canvas{position:absolute;inset:0;width:100%;height:100%;display:none;image-rendering:pixelated}
#mapOv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;font-family:system-ui,sans-serif}
.zoom{z-index:2}
body.mapfull #mapWrap{position:fixed;left:0;right:0;top:0;bottom:84px;z-index:15;border-radius:0;aspect-ratio:auto;max-height:none}
body.mapfull #selInfo{position:fixed;left:8px;right:8px;bottom:92px;z-index:16;max-height:30vh;overflow:auto;background:rgba(17,24,33,.94);border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin:0}
body.mapfull .bottom{z-index:17}
.top{align-items:center}.av{flex:0 0 54px;margin-right:10px}.face{display:block;border-radius:50%}.face.dead{filter:grayscale(1) brightness(.8)}
.flag{vertical-align:-2px;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.mmodes{position:absolute;top:8px;right:8px;left:8px;z-index:3;display:flex;gap:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
.mmodes button{width:32px;height:32px;border-radius:9px;border:1px solid var(--line);background:rgba(13,20,29,.82);font-size:15px;padding:0}
.mmodes button.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
body.mapfull .mmodes{top:calc(58px + env(safe-area-inset-top));max-width:none}
.mleg{position:absolute;right:8px;bottom:8px;z-index:3;background:rgba(13,20,29,.85);border:1px solid var(--line);border-radius:9px;padding:5px 8px;font-size:11px;color:var(--mut);display:none;min-width:130px}
.lg-bar{height:7px;border-radius:4px;margin:3px 0;background:linear-gradient(90deg,#c0392b,#e67e22,#f1c40f,#78be3c,#27a060)}.lg-lab{display:flex;justify-content:space-between}
.ff{position:fixed;right:12px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:12;border:1px solid var(--line);background:rgba(17,24,33,.94);color:var(--ink);border-radius:20px;padding:7px 12px;font-weight:700;font-size:13px}
.ff:disabled{opacity:.4}body.mapfull .ff{display:none}
.item.per{display:flex;align-items:center;gap:10px}.item.per>span:nth-child(2){flex:1}
.rb{display:inline-block;width:64px;height:7px;border-radius:4px;background:#2a3644;overflow:hidden;vertical-align:middle}.rb i{display:block;height:100%}
.pp{display:flex;gap:12px;align-items:center;margin-bottom:8px}.pp h2,.pp h3{margin:0 0 4px}
.achs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.ach{background:#2b2410;border:1px solid #7a5a10;color:#f2c14e;border-radius:12px;padding:3px 9px;font-size:12px}
.paper{background:#f3ecd9;color:#1d1a14;border-radius:10px;padding:12px 14px;margin-bottom:10px;font-family:Georgia,'Times New Roman',serif}
.np-mast{font-weight:900;font-size:19px;letter-spacing:.5px;text-align:center;border-bottom:3px double #1d1a14;padding-bottom:6px}
.np-date{text-align:center;font-size:11.5px;color:#5a5240;margin:4px 0 8px;border-bottom:1px solid #b8ad90;padding-bottom:5px}
.np-lead{display:flex;gap:10px;align-items:flex-start}.np-lead>div{flex:1}
.np-sec{margin:6px 0 8px}.np-k{font-size:10.5px;font-weight:700;letter-spacing:1.2px;color:#8a2e14;font-family:system-ui,sans-serif}
.np-h{font-size:16px;font-weight:700;line-height:1.25;margin:2px 0}.np-s{font-size:13px;color:#3a3428;line-height:1.3;margin-top:3px}
body.mapfull .zoom{top:calc(8px + env(safe-area-inset-top));bottom:auto;left:8px}
body.mapfull .zoom button{width:40px;height:40px}
.mode-chip{color:var(--teal);border-color:var(--teal)}
.mem{color:var(--mut);font-size:12px;margin:2px 0}
.src{color:var(--mut);font-size:12.5px}
.stat.wide{grid-column:1/-1;border-top:1px solid var(--line);padding-top:6px}
.stat .lab .neg,.neg{color:var(--red)}
.modes{display:grid;gap:8px}
.mode{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card2)}
.mode b{display:block;font-size:16px}.mode span{color:var(--mut);font-size:12.5px}
.mode.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.modal h2 small{color:var(--mut);font-size:12px;font-weight:600}
.fin{border:1px solid var(--line);border-radius:10px;padding:4px 10px;margin-bottom:10px;background:var(--card2)}
.frow{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.frow:last-child{border-bottom:none}.frow span:last-child{text-align:right;color:var(--ink);white-space:nowrap}.frow span:first-child{color:var(--mut)}
.fin.stack .frow{display:block}.fin.stack .frow span{display:block;text-align:left!important;white-space:normal!important}.fin.stack .frow span:last-child{font-size:12.5px;color:var(--teal)}
.topc{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(17,24,33,.35),rgba(17,24,33,.85))}#stageBg{position:absolute;inset:0;z-index:0}#stageBg .stage{width:100%;height:100%;display:block;opacity:.6}
.topc .top{position:relative;z-index:1}.topc .who .name,.topc .money .v{text-shadow:0 1px 3px rgba(0,0,0,.8)}.topc .sub{color:#d6dee8;text-shadow:0 1px 2px rgba(0,0,0,.8)}
.ico{vertical-align:-3px}.stat .lab .ico{vertical-align:-2px}
.evh{display:flex;align-items:center;gap:10px;margin-bottom:4px}.evh h2{margin:0}.evi{display:inline-flex;width:42px;height:42px;border-radius:50%;border:2px solid;align-items:center;justify-content:center;background:rgba(255,255,255,.04)}
.evt{font-size:16px;line-height:1.4}
.nav{background:linear-gradient(180deg,#1b2633,#141c26)}.nav .ic{color:#cfd8e3}
.stat .bar i{transition:width .6s cubic-bezier(.2,.8,.2,1)}
#pYear.flash{animation:yflash .8s ease}@keyframes yflash{0%{color:#f2c14e;transform:scale(1.25)}100%{transform:scale(1)}}
.lg.new{animation:lgin .45s ease both}@keyframes lgin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.modal.on{animation:mdin .28s cubic-bezier(.2,.8,.2,1)}@keyframes mdin{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}to{opacity:1}}
.paper{animation:papin .5s cubic-bezier(.2,.8,.2,1)}@keyframes papin{from{opacity:0;transform:rotate(-3deg) scale(.9)}to{opacity:1;transform:none}}
.sheet{transition:transform .28s cubic-bezier(.2,.8,.2,1)}
#ageBtn:active{transform:scale(.94)}#ageBtn{transition:transform .12s}
.frow.tot span{font-weight:700;color:var(--ink)!important}
.sect{position:sticky;top:-14px;background:var(--card);padding:4px 0;z-index:1}
</style>`).replace('<style>', '<style>\n');
const body = fs.readFileSync('src/body.html', 'utf8');
const map = JSON.parse(fs.readFileSync('raw/map2.json'));
// recorta campos no usados por el juego
for (const id in map.regions) { const r = map.regions[id]; r.pop = Math.round(r.pop); }
const world = JSON.parse(fs.readFileSync('raw/world.json'));
const engine = ['src/engine.js','src/engine_v04.js','src/events_v05.js','src/events_v06.js','src/engine_v07.js','src/engine_v08.js','src/events_v08.js','src/engine_v09.js','src/engine_v10.js','src/engine_v11.js','src/engine_v12.js','src/engine_v12b.js','src/data_v13.js','src/engine_v13.js','src/data_v14.js','src/engine_v14.js','src/data_v15.js','src/engine_v15.js','src/data_v15b.js','src/engine_v15b.js','src/data_v16.js','src/engine_v16.js','src/data_v16b.js','src/engine_v16b.js','src/data_v16c.js','src/engine_v16c.js','src/data_v16d.js','src/engine_v16d.js','src/engine_v17a.js','src/engine_v17b.js','src/data_v16e.js','src/engine_v16e.js','src/data_v17r.js','src/engine_v17r.js','src/data_v17s.js','src/engine_v17s.js','src/data_v18a.js','src/engine_v18a.js','src/engine_v18b.js','src/engine_v19b.js','src/engine_v21a.js','src/engine_v21b.js','src/engine_v21c.js','src/engine_v23a.js','src/engine_v23b.js','src/engine_v23c.js','src/engine_v24a.js','src/engine_v24c.js','src/engine_v25a.js','src/engine_v25b.js','src/engine_v25c.js','src/engine_v25d.js','src/engine_v25e.js','src/engine_v25h.js','src/engine_v25i.js','src/engine_v25l.js','src/engine_v26a.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const ui0 = fs.readFileSync('src/ui.js', 'utf8'); const cut = ui0.indexOf('\n', ui0.indexOf('const $=')) + 1;
const ui1 = ui0.slice(0, cut) + fs.readFileSync('src/map.js', 'utf8') + '\n' + ui0.slice(cut); const ic = ui1.indexOf('const hadSave=');
const ui = ui1.slice(0, ic) + fs.readFileSync('src/ui_v04.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v06.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v07.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v08.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v09.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v10.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v11.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v12.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v12b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v13.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v14.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v15.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v15b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16c.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16d.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v17a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v17b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16e.js', 'utf8') + '\n' + fs.readFileSync('src/data_i18n.js', 'utf8') + '\n' + fs.readFileSync('src/ui_i18n.js', 'utf8') + '\n' + fs.readFileSync('src/ivi_font.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16f.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16f_face.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v16f_gx.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v17r.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v17s.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v18a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v18b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v19a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v19b.js', 'utf8') + '\n' + fs.readFileSync('src/lot_anim.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v19c.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v19d.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v20a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v20b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v21a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v21b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v21c.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v22d.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v23a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v23b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v23c.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v22f.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v23d.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v23e.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v24a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v24b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v24c.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25a.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25b.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25g.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25f.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25i.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25j.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25n.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25k.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25o.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25p.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v25q.js', 'utf8') + '\n' + fs.readFileSync('src/ui_v26a.js', 'utf8') + '\n' + ui1.slice(ic);
const b64 = f => fs.readFileSync(f).toString('base64');
let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>ECONOMY — v2.4c</title>
${css}
</head>
<body>
${body}
<script>
/* Datos: Natural Earth (fronteras), Banco Mundial, FMI, OIT, OMS, SIPRI. Foto "Mundo 2026". */
const MAP=${JSON.stringify(map)};
const WORLD=${JSON.stringify(world)};
const ID_PNG='data:image/png;base64,${b64('raw/id.png')}';
const REL_IMG='data:image/webp;base64,${b64('raw/terrain2.webp')}';
const BORDERS_B64='${b64('raw/borders.bin')}';
const BORDERS_LO_B64='${b64('raw/borders_lo.bin')}';
const ROADS_B64='${b64('raw/roads.bin')}';
const COAST_PNG='data:image/png;base64,${b64('raw/coast.png')}';
const CITIES=${fs.readFileSync('raw/cities.json','utf8')};
const CITY_RG=${fs.readFileSync('raw/city_rg.json','utf8')};
const TERR=${fs.readFileSync('raw/terr.json','utf8')};
const SPLIT=${fs.readFileSync('raw/split.json','utf8')};
const FLAG_PNG='data:image/png;base64,${b64('raw/flags.png')}';
const FLAGS=${fs.readFileSync('raw/flags.json','utf8')};
</script>
<script>
${engine}
</script>
<!--LIBS-->
<script>
${ui}
</script>
</body>
</html>
`;
// v1.7a: los colores fijos más usados se convierten en variables de tema (con el color original de respaldo)
{const W=['0f1722','0e141c','121b27','0b1118','16202d','1a2433','1d2532','1e2a3a'],I=['cbd5e1','e2e8f0','d7dee8','aab6c5','9fb3cc'],L=['334155','243244','1e2a3a','2b3a4e','1d2532'];let k=0;
  html=html.replace(/(background(?:-color)?:\s?)#([0-9a-fA-F]{6})\b/g,(m,p,h)=>W.includes(h.toLowerCase())?(k++,`${p}var(--well,#${h})`):m)
    .replace(/([^-a-z]color:\s?)#([0-9a-fA-F]{6})\b/g,(m,p,h)=>I.includes(h.toLowerCase())?(k++,`${p}var(--ink2,#${h})`):h.toLowerCase()==='f2c14e'?(k++,`${p}var(--gold,#${h})`):m)
    .replace(/(border(?:-[a-z]+)?:\s?[0-9.]+px solid )#([0-9a-fA-F]{6})\b/g,(m,p,h)=>L.includes(h.toLowerCase())?(k++,`${p}var(--line2,#${h})`):m)
    .replace(/background:rgba\(16,24,36,\.96\)/g,()=>(k++,'background:var(--glass)'));
  console.log('colores convertidos a tema:',k);}
// v1.7q: la fuente de íconos «IVI» va primero en todas las listas de fuentes (CSS y estilos escritos en el código). Su @font-face solo cubre los emoji
// (unicode-range sin el espacio), así que no cambia métricas ni altura de línea: el resto del texto sigue en la fuente del sistema.
{let k=0;html=html.replace(/font-family:\s*(?!IVI|inherit|initial|unset|var\()/g,m=>(k++,m+'IVI,')).replace(/(font:\s*(?:(?:italic|bold|normal|[1-9]00)\s+)*[\d.]+px(?:\/[\d.a-z]+)?\s+)(?!IVI)/g,m=>(k++,m+'IVI,'));
  console.log('listas de fuentes con IVI:',k);}
// v1.9b: librerías de terceros (sin tocar por los reemplazos de arriba): GSAP 3.15.1 (licencia estándar de GSAP, gratis también para uso comercial)
// v1.9c: lottie-web 5.13.0 «light» (solo SVG, MIT) para las animaciones de los momentos clave
{const libs=['src/lib/gsap.min.js','src/lib/lottie_light.min.js'].map(f=>'<script>\n'+fs.readFileSync(f,'utf8')+'\n</script>').join('\n');html=html.replace('<!--LIBS-->',()=>libs);}
fs.writeFileSync('imperio.html', html);
console.log('imperio.html', (html.length / 1024).toFixed(0), 'KB');
