# v1.7q (v1.6f del plan): fuente de íconos vectoriales «IVI».
# Lee iconos.tsv (emoji → ícono), convierte cada SVG de trazo a contorno relleno (skia), une las piezas,
# arma una fuente CFF (WOFF2) cuyos caracteres son los mismos emoji del juego y la escribe en src/ivi_font.js.
# Uso:  python3 herramientas/iconos/build_iconos.py [--preview carpeta]
# Requiere: pip install --break-system-packages skia-python fonttools brotli
# Íconos: Tabler Icons (MIT, ver tabler/LICENSE) + propios/ (dibujados para el juego).
# v1.9c: segundo set «Juego» (columna 4 de iconos.tsv; vacía = igual que la columna 2) con game-icons.net (CC BY 3.0; SVG usados en gameicons/,
#        autor de cada uno en gameicons/autores.json) → misma fuente IVI con otro dibujo (IVJ_B64); ui_v19c.js elige el set (Ajustes → Íconos).
import os, sys, re, base64, shutil, json
import xml.etree.ElementTree as ET
import skia
from fontTools.svgLib.path import parse_path
from fontTools.pens.basePen import BasePen
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, '..', '..'))
TAB_NM = os.environ.get('TABLER', '/home/claude/work/icons/node_modules/@tabler/icons/icons')  # solo para copiar SVG nuevos
TAB = os.path.join(H, 'tabler')
SW = 2.0          # grosor del trazo (en la cuadrícula de 24)
S, X0, Y0, ADV = 44, 62, -175, 1180
GI_K = 21.0      # v1.9c: tamaño de un ícono de game-icons dentro de la cuadrícula de 24 (los rellenos pesan más que el contorno de Tabler)   # 24 unidades → 1056 de 1000 (un poco más grande que el texto, como un emoji); de -0.175 em a 0.88 em

class SkPen(BasePen):
    def __init__(s): super().__init__(None); s.p = skia.Path()
    def _moveTo(s, a): s.p.moveTo(*a)
    def _lineTo(s, a): s.p.lineTo(*a)
    def _curveToOne(s, a, b, c): s.p.cubicTo(*a, *b, *c)
    def _qCurveToOne(s, a, b): s.p.quadTo(*a, *b)
    def _closePath(s): s.p.close()

def stroke(p):
    pt = skia.Paint(Style=skia.Paint.kStroke_Style, StrokeWidth=SW, StrokeCap=skia.Paint.kRound_Cap, StrokeJoin=skia.Paint.kRound_Join)
    d = skia.Path(); pt.getFillPath(p, d); return d

GI_JSON = os.environ.get('GI_JSON', '/home/claude/work/libs/node_modules/@iconify-json/game-icons/icons.json')  # solo para copiar SVG nuevos
GI = os.path.join(H, 'gameicons')
GI_AUT = os.path.join(H, 'gameicons', 'autores.json')   # nombre → autor (carpeta del repositorio github.com/game-icons/icons)

def svg_path(fn):
    t = ET.parse(fn).getroot(); ns = '{http://www.w3.org/2000/svg}'
    vb = [float(v) for v in (t.get('viewBox') or '0 0 24 24').split()]
    root_fill = t.get('fill', 'black') != 'none'
    out = skia.Path(); cuts = []
    for el in t.iter():
        tag = el.tag.replace(ns, '')
        if tag not in ('path', 'circle', 'rect', 'line', 'ellipse', 'polyline', 'polygon'): continue
        if el.get('stroke') == 'none' and el.get('fill') == 'none': continue
        pen = SkPen(); p = pen.p; f = float
        if tag == 'path': parse_path(el.get('d'), pen)
        elif tag == 'circle': p.addCircle(f(el.get('cx')), f(el.get('cy')), f(el.get('r')))
        elif tag == 'ellipse':
            cx, cy, rx, ry = f(el.get('cx')), f(el.get('cy')), f(el.get('rx')), f(el.get('ry')); p.addOval(skia.Rect(cx - rx, cy - ry, cx + rx, cy + ry))
        elif tag == 'rect':
            x, y, w, h = f(el.get('x', 0)), f(el.get('y', 0)), f(el.get('width')), f(el.get('height')); rx = f(el.get('rx', 0))
            p.addRoundRect(skia.Rect(x, y, x + w, y + h), rx, rx)
        elif tag == 'line': p.moveTo(f(el.get('x1')), f(el.get('y1'))); p.lineTo(f(el.get('x2')), f(el.get('y2')))
        elif tag in ('polyline', 'polygon'):
            pts = [f(v) for v in re.split(r'[\s,]+', el.get('points').strip())]
            p.moveTo(pts[0], pts[1])
            for i in range(2, len(pts), 2): p.lineTo(pts[i], pts[i + 1])
            if tag == 'polygon': p.close()
        filled = (el.get('fill') not in (None, 'none')) if el.get('fill') is not None else (root_fill and el.get('stroke') is None)
        if el.get('stroke') == 'none': filled = True
        q = p if filled else stroke(p)
        if 'cut' in (el.get('class') or ''): cuts.append(q); continue
        r = skia.Op(out, q, skia.PathOp.kUnion_PathOp); out = r if r is not None else out
    for c in cuts:
        r = skia.Op(out, c, skia.PathOp.kDifference_PathOp); out = r if r is not None else out
    if vb[2] != 24:   # v1.9c: game-icons (512×512, relleno con «Has Padding»): se resuelve el relleno real y se lleva a 21 de las 24 unidades, centrado
        out.setFillType(skia.PathFillType.kWinding); r = skia.Simplify(out); out = r if r is not None else out
        k = GI_K / vb[2]; m = skia.Matrix(); m.setScaleTranslate(k, k, (24 - GI_K) / 2 - vb[0] * k, (24 - GI_K) / 2 - vb[1] * k); out.transform(m)
    return orient(out)

def contours(path):
    """Separa un trazo en contornos (cada uno un skia.Path cerrado)."""
    res = []; cur = None; it = skia.Path.Iter(path, False)
    while True:
        v, pts = it.next()
        if v == skia.Path.kDone_Verb: break
        if v == skia.Path.kMove_Verb:
            if cur is not None: res.append(cur)
            cur = skia.Path(); cur.moveTo(pts[0])
        elif v == skia.Path.kLine_Verb: cur.lineTo(pts[1])
        elif v == skia.Path.kQuad_Verb: cur.quadTo(pts[1], pts[2])
        elif v == skia.Path.kConic_Verb: cur.conicTo(pts[1], pts[2], it.conicWeight())
        elif v == skia.Path.kCubic_Verb: cur.cubicTo(pts[1], pts[2], pts[3])
        elif v == skia.Path.kClose_Verb: cur.close()
    if cur is not None: res.append(cur)
    return [c for c in res if c.countPoints() > 2]

def area(c):
    pts = c.getPoints(c.countPoints()); a = 0
    for i in range(len(pts)):
        p, q = pts[i], pts[(i + 1) % len(pts)]; a += p.x() * q.y() - q.x() * p.y()
    return a / 2

def orient(path):
    """Orientación coherente para relleno «nonzero»: contornos exteriores en un sentido y huecos en el otro, según cuántos contornos los rodean."""
    cs = contours(path); out = skia.Path()
    for i, c in enumerate(cs):
        b = c.computeTightBounds(); x, y = b.centerX(), b.centerY()
        pts = c.getPoints(c.countPoints()); px, py = pts[0].x(), pts[0].y()
        depth = 0
        for j, d in enumerate(cs):
            if i == j: continue
            db = d.computeTightBounds()
            if db.width() * db.height() <= b.width() * b.height(): continue
            d2 = skia.Path(d); d2.setFillType(skia.PathFillType.kWinding)
            if d2.contains(px, py) or d2.contains(x, y) and d2.contains(px + .01, py + .01): depth += 1
        want_pos = depth % 2 == 0
        if (area(c) > 0) == want_pos: out.addPath(c)
        else: out.reverseAddPath(c)
    return out

def draw(path, pen):
    it = skia.Path.Iter(path, False)
    T = lambda q: (round(q.x() * S + X0), round((24 - q.y()) * S + Y0))
    while True:
        v, pts = it.next()
        if v == skia.Path.kDone_Verb: break
        if v == skia.Path.kMove_Verb: pen.moveTo(T(pts[0]))
        elif v == skia.Path.kLine_Verb: pen.lineTo(T(pts[1]))
        elif v == skia.Path.kQuad_Verb: pen.qCurveTo(T(pts[1]), T(pts[2]))
        elif v == skia.Path.kConic_Verb:
            q = skia.Path.ConvertConicToQuads(pts[0], pts[1], pts[2], it.conicWeight(), 2)
            for i in range(1, len(q), 2): pen.qCurveTo(T(q[i]), T(q[i + 1]))
        elif v == skia.Path.kCubic_Verb: pen.curveTo(T(pts[1]), T(pts[2]), T(pts[3]))
        elif v == skia.Path.kClose_Verb: pen.closePath()

def src_file(src):
    k, n = src.split(':')
    if k == 'my': return os.path.join(H, 'propios', n + '.svg')
    if k == 'gi':
        loc = os.path.join(GI, n + '.svg')
        if not os.path.exists(loc):
            os.makedirs(GI, exist_ok=True); d = json.load(open(GI_JSON, encoding='utf8'))['icons'][n]['body'].replace('fill="currentColor"', 'fill="black"')
            open(loc, 'w', encoding='utf8').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{d}</svg>\n')
        return loc
    sub = 'outline' if k == 'tb' else 'filled'
    loc = os.path.join(TAB, sub, n + '.svg')
    if not os.path.exists(loc):
        os.makedirs(os.path.dirname(loc), exist_ok=True)
        shutil.copy(os.path.join(TAB_NM, sub, n + '.svg'), loc)
    return loc

def font(rows, pick, out_name):
    """Arma una fuente (WOFF2) con los mismos caracteres para cualquier set; pick(fila) → fuente del ícono."""
    glyphs = {}; cmap = {}; ligs = []; srcglyph = {}
    def gname(src):
        if src not in srcglyph:
            n = 'i%03d' % len(srcglyph); srcglyph[src] = n; glyphs[n] = svg_path(src_file(src))
        return srcglyph[src]
    seqs = []
    for r in rows:
        e = r[0]; cps = [ord(c) for c in e if ord(c) not in (0xFE0F, 0xFE0E)]
        g = gname(pick(r))
        if len(cps) == 1:
            if cps[0] in cmap: print('repetido', e); continue
            cmap[cps[0]] = g
        else: seqs.append((e, cps, g))
    for e, cps, g in seqs:
        parts = [c for c in cps if c != 0x200D]
        for c in parts:
            if c not in cmap: raise SystemExit(f'La secuencia {e} necesita un ícono para U+{c:04X} (agrega una fila)')
        comp = []
        for c in cps: comp.append('zw' if c == 0x200D else cmap[c])
        ligs.append((comp, g))
        if any(ord(ch) == 0xFE0F for ch in e):  # variante con FE0F (sin quitar en pantalla)
            comp2 = []
            for ch in e:
                o = ord(ch); comp2.append('zw' if o in (0x200D, 0xFE0F) else cmap[o])
            if comp2 != comp: ligs.append((comp2, g))
    names = ['.notdef', 'zw'] + sorted(glyphs)
    fb = FontBuilder(1000, isTTF=False); fb.setupGlyphOrder(names)
    full = {0xFE0F: 'zw', 0xFE0E: 'zw', 0x200D: 'zw'}; full.update(cmap)
    uvs = [(cp, 0xFE0F, g) for cp, g in cmap.items()] + [(cp, 0xFE0E, g) for cp, g in cmap.items()]
    fb.setupCharacterMap(full, uvs=uvs)
    cs = {}; adv = {}
    for n in names:
        a = 0 if n == 'zw' else ADV
        pen = T2CharStringPen(a, None)
        if n in glyphs: draw(glyphs[n], pen)
        cs[n] = pen.getCharString(); adv[n] = (a, 0)
    fam = 'IVI'
    fb.setupCFF(fam, {'FullName': fam}, cs, {})
    fb.setupHorizontalMetrics(adv)
    fb.setupHorizontalHeader(ascent=900, descent=-250)
    fb.setupNameTable({'familyName': fam, 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-250, usWinAscent=900, usWinDescent=250)
    fb.setupPost()
    seen = set(); fea = 'languagesystem DFLT dflt;\nfeature ccmp {\n'
    for comp, g in sorted(ligs, key=lambda x: -len(x[0])):
        k = ' '.join(comp)
        if k in seen: continue
        seen.add(k); fea += f'  sub {k} by {g};\n'
    fea += '} ccmp;\n'
    addOpenTypeFeaturesFromString(fb.font, fea)
    fb.font.flavor = 'woff2'
    out = os.path.join(H, out_name); fb.save(out)
    b = base64.b64encode(open(out, 'rb').read()).decode()
    print(f'{out_name}: {len(glyphs)} íconos, {len(cmap)} caracteres, {len(seen)} ligaduras, woff2 {os.path.getsize(out)} B, base64 {len(b)} B')
    return b, full

def main():
    rows = []
    for l in open(os.path.join(H, 'iconos.tsv'), encoding='utf8'):
        if l.startswith('#') or not l.strip(): continue
        e, src, nota, jg = (l.rstrip('\n').split('\t') + ['', ''])[:4]
        rows.append((e, src, nota, jg or src))
    if not os.path.exists(os.path.join(TAB, 'LICENSE')) and os.path.exists(os.path.join(TAB_NM, '..', 'LICENSE')):
        os.makedirs(TAB, exist_ok=True); shutil.copy(os.path.join(TAB_NM, '..', 'LICENSE'), os.path.join(TAB, 'LICENSE'))
    b, full = font(rows, lambda r: r[1], 'ivi.woff2')            # set «Línea» (v1.7q): Tabler + propios
    bj, fullj = font(rows, lambda r: r[3], 'ivi_juego.woff2')    # set «Juego» (v1.9c): game-icons.net + propios
    assert sorted(full) == sorted(fullj)
    # créditos de game-icons.net (CC BY 3.0): autor de cada ícono usado
    aut = json.load(open(GI_AUT, encoding='utf8')) if os.path.exists(GI_AUT) else {}
    used = sorted({r[3][3:] for r in rows if r[3].startswith('gi:')} | {f[:-4] for f in os.listdir(GI) if f.endswith('.svg')})   # + los de las animaciones (herramientas/lottie)
    nomb = {'delapouite': 'Delapouite', 'lorc': 'Lorc', 'skoll': 'Skoll', 'caro-asercion': 'Caro Asercion', 'viscious-speed': 'Viscious Speed', 'sbed': 'Sbed',
            'aussiesim': 'Aussiesim', 'darkzaitzev': 'DarkZaitzev', 'cathelineau': 'Cathelineau', 'quoting': 'Quoting', 'faithtoken': 'Faithtoken',
            'lord-berandas': 'Lord Berandas', 'willdabeast': 'Willdabeast', 'priorblue': 'PriorBlue', 'carl-olsen': 'Carl Olsen', 'felbrigg': 'Felbrigg',
            'lucasms': 'Lucas', 'john-redman': 'John Redman', 'zeromancer': 'Zeromancer', 'heavenly-dog': 'HeavenlyDog', 'various-artists': 'varios autores'}
    cnt = {}
    for n in used:
        a = aut.get(n, '?'); cnt[a] = cnt.get(a, 0) + 1
    if '?' in cnt: raise SystemExit('Falta el autor de algún ícono de game-icons: ' + ', '.join(n for n in used if n not in aut))
    autores = [nomb.get(a, a) for a, _ in sorted(cnt.items(), key=lambda x: -x[1])]
    cps = sorted(full)
    rng = []; i = 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1: j += 1
        rng.append(f'U+{cps[i]:X}' if i == j else f'U+{cps[i]:X}-{cps[j]:X}'); i = j + 1
    vs = sorted({ord(e[0]) for e, s, n, jg in rows if '\ufe0f' in e and len([c for c in e if c not in '\ufe0f\u200d']) == 1})
    js = ('/* v1.7q/v1.9c — generado por herramientas/iconos/build_iconos.py; no editar a mano.\n'
          '   Fuente «IVI»: íconos vectoriales en el lugar de los emoji del juego. Set «Línea» (IVI_B64): Tabler Icons (MIT, © 2020-2026 Paweł Kuna; licencia en herramientas/iconos/tabler/LICENSE) y propios.\n'
          '   Set «Juego» (IVJ_B64, v1.9c): game-icons.net (CC BY 3.0, https://game-icons.net; autores en IVJ_AUT) y propios. */\n'
          f"const IVI_B64='{b}';\nconst IVJ_B64='{bj}';\nconst IVJ_AUT={json.dumps(autores, ensure_ascii=False)};\nconst IVJ_N={len(used)};\nconst IVI_UR='{','.join(rng)}';\n"
          f"const IVI_VS=new RegExp('([{''.join(chr(c) for c in vs)}])\\uFE0F','g');\n")
    open(os.path.join(ROOT, 'src', 'ivi_font.js'), 'w', encoding='utf8').write(js)
    json.dump({e: s for e, s, n, jg in rows}, open(os.path.join(H, 'mapa.json'), 'w', encoding='utf8'), ensure_ascii=False)
    json.dump({e: jg for e, s, n, jg in rows}, open(os.path.join(H, 'mapa_juego.json'), 'w', encoding='utf8'), ensure_ascii=False)
    print('game-icons usados:', len(used), '· autores:', ', '.join(f'{nomb.get(a, a)} {c}' for a, c in sorted(cnt.items(), key=lambda x: -x[1])))
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]; os.makedirs(d, exist_ok=True)
        cells = ''.join(f'<div class=c><span class=i>{e}</span><span class="i j">{e}</span><small>{n}<br>{jg}</small></div>' for e, s, n, jg in rows)
        open(os.path.join(d, 'iconos.html'), 'w', encoding='utf8').write(f'''<html><head><meta charset="utf-8"><style>@font-face{{font-family:IVI;src:url(data:font/woff2;base64,{b});unicode-range:{','.join(rng)}}}
@font-face{{font-family:IVJ;src:url(data:font/woff2;base64,{bj});unicode-range:{','.join(rng)}}}
body{{background:#141c26;color:#e8eef5;font:14px system-ui;margin:8px}}.g{{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}}.c{{border:1px solid #2b3a4e;border-radius:8px;padding:4px;text-align:center}}
.i{{font:30px IVI,system-ui;display:inline-block;color:#9fb3cc;margin:0 3px}}.i.j{{font-family:IVJ,system-ui;color:#f2c14e}}small{{display:block;font-size:9px;color:#8aa;overflow:hidden;white-space:nowrap}}</style></head><body><div class=g>{cells}</div></body></html>''')

if __name__ == '__main__': main()
