# v1.9c: animaciones Lottie propias para los momentos clave (logro, ascenso, victoria).
# Se generan con código (no se descargan): las figuras centrales son los mismos íconos del set «Juego» de la fuente IVI
# (game-icons.net, CC BY 3.0) convertidos a trazos de Lottie, más rayos, anillo, destellos y confeti dibujados aquí.
# Los rellenos con nombre «A» toman el color de acento del tema al reproducirse (ui_v19c.js), así combinan con los 7 temas.
# Uso:  python3 herramientas/lottie/build_lottie.py      → src/lot_anim.js (no editar a mano)
# Requiere lo mismo que herramientas/iconos/build_iconos.py (skia-python, fonttools).
import os, sys, json, math, random
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'herramientas', 'iconos'))
import skia
import build_iconos as BI

FR, OP, W = 30, 60, 220            # 30 cuadros por segundo, 2 s, lienzo de 220 × 220
C = W / 2
ACC = [0.949, 0.757, 0.306, 1]     # acento por omisión (#f2c14e); se reemplaza por el del tema
CONF = [[0.18, 0.71, 0.66, 1], [0.27, 0.55, 0.93, 1], [0.35, 0.78, 0.42, 1], [0.97, 0.79, 0.25, 1], [0.62, 0.43, 0.88, 1], [0.95, 0.55, 0.22, 1]]

def st(v): return {'a': 0, 'k': v}
def kf(*keys, dims=None):
    """keys: (t, valor[, (ox,oy,ix,iy)]) — curva por omisión: salida suave."""
    out = []
    for n, k in enumerate(keys):
        t, v = k[0], k[1]; e = k[2] if len(k) > 2 else (.33, 0, .2, 1)
        v = v if isinstance(v, list) else [v]; d = len(v)
        o = {'t': t, 's': v}
        if n < len(keys) - 1: o['o'] = {'x': [e[0]] * d, 'y': [e[1]] * d}; o['i'] = {'x': [e[2]] * d, 'y': [e[3]] * d}
        out.append(o)
    return {'a': 1, 'k': out}
def tr(): return {'ty': 'tr', 'p': st([0, 0]), 'a': st([0, 0]), 's': st([100, 100]), 'r': st(0), 'o': st(100), 'sk': st(0), 'sa': st(0)}
def fill(c, o=100, nm=''): return {'ty': 'fl', 'nm': nm, 'c': st(c), 'o': st(o) if not isinstance(o, dict) else o, 'r': 1}
def stroke(c, w, o=100, nm=''): return {'ty': 'st', 'nm': nm, 'c': st(c), 'o': st(o) if not isinstance(o, dict) else o, 'w': st(w) if not isinstance(w, dict) else w, 'lc': 2, 'lj': 2}
def grp(items, nm='g'): return {'ty': 'gr', 'nm': nm, 'it': items + [tr()]}
def shp(v, i=None, o=None, c=True):
    z = [[0, 0]] * len(v)
    return {'ty': 'sh', 'ks': st({'c': c, 'v': v, 'i': i or z, 'o': o or z})}
def layer(nm, shapes, ind, p=None, s=None, r=None, o=None, ip=0, op=OP):
    return {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': nm, 'sr': 1, 'ao': 0, 'ip': ip, 'op': op, 'st': 0, 'bm': 0,
            'ks': {'o': o or st(100), 'r': r or st(0), 'p': p or st([C, C, 0]), 'a': st([0, 0, 0]), 's': s or st([100, 100, 100])}, 'shapes': shapes}

def icon_shapes(name, size):
    """Ícono de game-icons (o propio) → trazos de Lottie centrados en (0,0) con lado «size»."""
    path = BI.svg_path(BI.src_file(name)); k = size / 24.0; res = []
    for c in BI.contours(path):
        it = skia.Path.Iter(c, False); v = []; ii = []; oo = []; P = lambda q: [round((q.x() - 12) * k, 1), round((q.y() - 12) * k, 1)]
        def seg_cubic(p0, c1, c2, p1):
            oo[-1] = [round(c1[0] - p0[0], 1), round(c1[1] - p0[1], 1)]; v.append(p1); ii.append([round(c2[0] - p1[0], 1), round(c2[1] - p1[1], 1)]); oo.append([0, 0])
        while True:
            vb, pts = it.next()
            if vb == skia.Path.kDone_Verb: break
            if vb == skia.Path.kMove_Verb: v.append(P(pts[0])); ii.append([0, 0]); oo.append([0, 0])
            elif vb == skia.Path.kLine_Verb: v.append(P(pts[1])); ii.append([0, 0]); oo.append([0, 0])
            elif vb == skia.Path.kQuad_Verb:
                p0, q1, p1 = P(pts[0]), P(pts[1]), P(pts[2]); c1 = [p0[0] + 2 / 3 * (q1[0] - p0[0]), p0[1] + 2 / 3 * (q1[1] - p0[1])]; c2 = [p1[0] + 2 / 3 * (q1[0] - p1[0]), p1[1] + 2 / 3 * (q1[1] - p1[1])]
                seg_cubic(p0, c1, c2, p1)
            elif vb == skia.Path.kConic_Verb:
                q = skia.Path.ConvertConicToQuads(pts[0], pts[1], pts[2], it.conicWeight(), 2)
                for j in range(1, len(q), 2):
                    p0, q1, p1 = P(q[j - 1]), P(q[j]), P(q[j + 1]); c1 = [p0[0] + 2 / 3 * (q1[0] - p0[0]), p0[1] + 2 / 3 * (q1[1] - p0[1])]; c2 = [p1[0] + 2 / 3 * (q1[0] - p1[0]), p1[1] + 2 / 3 * (q1[1] - p1[1])]
                    seg_cubic(p0, c1, c2, p1)
            elif vb == skia.Path.kCubic_Verb: seg_cubic(P(pts[0]), P(pts[1]), P(pts[2]), P(pts[3]))
        if len(v) > 1 and abs(v[-1][0] - v[0][0]) < .01 and abs(v[-1][1] - v[0][1]) < .01:   # el último punto repite el primero
            ii[0] = ii[-1]; v.pop(); ii.pop(); oo.pop()
        res.append(shp(v, ii, oo))
    return res

def rays(n, r0, r1, half):
    out = []
    for j in range(n):
        a = 2 * math.pi * j / n; b1, b2 = a - half, a + half
        out.append(shp([[round(r0 * math.cos(a), 2), round(r0 * math.sin(a), 2)], [round(r1 * math.cos(b1), 2), round(r1 * math.sin(b1), 2)], [round(r1 * math.cos(b2), 2), round(r1 * math.sin(b2), 2)]]))
    return out

def sparkle(sz):
    a, b = sz, sz * .28
    return shp([[0, -a], [b, -b], [a, 0], [b, b], [0, a], [-b, b], [-a, 0], [-b, -b]])

def common(L, ind0, rays_n=14):
    """rayos que giran + anillo que se expande + destellos alrededor"""
    ind = ind0
    L.append(layer('rayos', [grp(rays(rays_n, 18, 104, .085) + [fill(ACC, 100, 'A')])], ind, s=kf((0, [0, 0, 100]), (12, [100, 100, 100])),
                   r=kf((0, 0, (.2, 0, .8, 1)), (OP, 50)), o=kf((0, 0), (6, 55), (34, 40), (54, 0)))); ind += 1
    L.append(layer('anillo', [grp([{'ty': 'el', 'p': st([0, 0]), 's': kf((3, [30, 30]), (26, [196, 196])), 'd': 1}, stroke(ACC, kf((3, 9), (26, 1)), kf((3, 95), (26, 0)), 'A')])], ind)); ind += 1
    rnd = random.Random(7)
    for j in range(7):
        ang = -math.pi / 2 + 2 * math.pi * j / 7 + rnd.uniform(-.25, .25); d = rnd.uniform(70, 92); t0 = 10 + j * 3
        L.append(layer(f'destello{j}', [grp([sparkle(rnd.uniform(7, 11)), fill([1, 1, 1, 1], 100), stroke(ACC, 1.5, 100, 'A')])], ind,
                       p=st([round(C + d * math.cos(ang), 1), round(C + d * math.sin(ang), 1), 0]), s=kf((t0, [0, 0, 100]), (t0 + 7, [100, 100, 100]), (t0 + 16, [0, 0, 100])),
                       r=kf((t0, 0), (t0 + 16, 90)), ip=t0, op=t0 + 17)); ind += 1
    return ind

def pop_icon(L, ind, name, size, nm):
    sh = icon_shapes(name, size)
    sc = kf((3, [0, 0, 100], (.3, 0, .3, 1.4)), (13, [116, 116, 100], (.4, 0, .5, 1)), (19, [95, 95, 100]), (25, [100, 100, 100]))
    rt = kf((3, -14), (14, 7), (22, 0))
    # sin capa de sombra (duplicaba el trazo del ícono): el contorno oscuro y el halo de ui_v19c.js ya lo separan del fondo
    L.append(layer(nm, [grp(sh + [stroke([0, 0, 0, 1], 2.2, 35), fill(ACC, 100, 'A')])], ind, s=sc, r=rt)); ind += 1
    return ind

def rnd(o):
    """redondea para que el JSON pese menos: 1 decimal en coordenadas y ángulos, 3 en colores y curvas (valores entre −1 y 1)"""
    if isinstance(o, float): return round(o, 3) if abs(o) <= 1 else round(o, 1)
    if isinstance(o, list): return [rnd(x) for x in o]
    if isinstance(o, dict): return {k: rnd(v) for k, v in o.items()}
    return o

def anim(nm, layers):
    layers = list(reversed(layers))   # en Lottie la primera capa queda encima
    for i, l in enumerate(layers): l['ind'] = i + 1
    return rnd({'v': '5.7.4', 'fr': FR, 'ip': 0, 'op': OP, 'w': W, 'h': W, 'nm': nm, 'ddd': 0, 'assets': [], 'layers': layers})

def logro():
    L = []; ind = common(L, 1); pop_icon(L, ind, 'gi:medal', 112, 'medalla'); return anim('logro', L)

def ascenso():
    L = []; ind = common(L, 1, 10)
    chev = lambda: shp([[-38, 14], [0, -20], [38, 14], [38, 30], [0, -4], [-38, 30]])
    for j in range(3):
        y = 34 - j * 30; t0 = 3 + j * 5
        L.append(layer(f'galon{j}', [grp([chev(), stroke([0, 0, 0, 1], 2.2, 35), fill(ACC, 100, 'A')])], ind,
                       p=kf((t0, [C, C + y + 46, 0], (.2, 0, .2, 1)), (t0 + 13, [C, C + y - 8, 0], (.4, 0, .6, 1)), (t0 + 20, [C, C + y, 0]), (OP, [C, C + y - 6, 0])),
                       o=kf((t0, 0), (t0 + 6, 100)), s=kf((t0, [70, 70, 100]), (t0 + 13, [108, 108, 100]), (t0 + 20, [100, 100, 100])))); ind += 1
    return anim('ascenso', L)

def victoria():
    L = []; ind = common(L, 1, 16); rnd = random.Random(11)
    for j in range(22):
        ang = rnd.uniform(0, 2 * math.pi); d = rnd.uniform(58, 104); t0 = 5 + rnd.randint(0, 5)
        x1, y1 = C + d * math.cos(ang), C + d * math.sin(ang) - 12; col = CONF[j % len(CONF)]; w, h = rnd.choice([(6, 11), (5, 9), (7, 7)])
        L.append(layer(f'confeti{j}', [grp([{'ty': 'rc', 'p': st([0, 0]), 's': st([w, h]), 'r': st(1.5)}, fill(col, 100)])], ind,
                       p=kf((t0, [C, C, 0], (.1, .6, .3, 1)), (t0 + 16, [round(x1, 1), round(y1, 1), 0], (.5, 0, .7, 1)), (OP, [round(x1 + rnd.uniform(-12, 12), 1), round(y1 + rnd.uniform(34, 60), 1), 0])),
                       r=kf((t0, rnd.uniform(0, 90)), (OP, rnd.uniform(240, 720) * rnd.choice([-1, 1]))), s=kf((t0, [0, 0, 100]), (t0 + 6, [100, 100, 100])),
                       o=kf((t0, 100), (48, 100), (OP, 0)), ip=t0)); ind += 1
    pop_icon(L, ind, 'gi:laurel-crown', 118, 'laureles'); return anim('victoria', L)

def main():
    A = {'logro': logro(), 'ascenso': ascenso(), 'victoria': victoria()}
    js = ('/* v1.9c — generado por herramientas/lottie/build_lottie.py; no editar a mano.\n'
          '   Animaciones Lottie propias (logro, ascenso, victoria). Figuras: íconos de game-icons.net (CC BY 3.0) del set «Juego». */\n'
          'const LOT_ANIM=' + json.dumps(A, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'src', 'lot_anim.js'), 'w', encoding='utf8').write(js)
    for k, v in A.items(): print(k, len(json.dumps(v, separators=(',', ':'))), 'B,', len(v['layers']), 'capas')

if __name__ == '__main__': main()
