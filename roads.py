"""v1.0 — Carreteras reales (Natural Earth 10m roads) en coordenadas del mapa → raw/roads.bin
Mismo formato que borders.bin: A = tipo (4 autopista, 5 carretera), B = 0. Uso: python3 roads.py <dir_con_ne_10m_roads>"""
import json, sys, numpy as np, shapefile
from pyproj import Transformer
DL = sys.argv[1]
F = json.load(open('raw_v09/latfit.json')); LA = np.array(F['lat']); YP = np.array(F['ypx'])
XMAX = 17005833.33; S = 4096 / (2 * XMAX); ROB = '+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m'
tr = Transformer.from_crs('EPSG:4326', ROB, always_xy=True)
_, y0s = tr.transform(np.zeros_like(LA), LA); YMAX = float(np.median(YP / S + y0s)) + 2.83 / S
def dp(p, tol):
    if len(p) < 3: return p
    keep = np.zeros(len(p), bool); keep[0] = keep[-1] = True; st = [(0, len(p) - 1)]
    while st:
        i, j = st.pop(); a, b = p[i], p[j]; seg = p[i + 1:j]
        if not len(seg): continue
        d = b - a; L = np.hypot(*d)
        dist = np.abs(d[0] * (seg[:, 1] - a[1]) - d[1] * (seg[:, 0] - a[0])) / L if L > 0 else np.hypot(*(seg - a).T)
        k = int(np.argmax(dist))
        if dist[k] > tol: keep[i + 1 + k] = True; st += [(i, i + 1 + k), (i + 1 + k, j)]
    return p[keep]
r = shapefile.Reader(f'{DL}/ne_10m_roads.shp'); f = [x[0] for x in r.fields[1:]]
MAXR = int(sys.argv[2]) if len(sys.argv) > 2 else 7
A, N, pts = [], [], []
for sr in r.iterShapeRecords():
    rec = dict(zip(f, sr.record))
    if rec['featurecla'] != 'Road' or rec['scalerank'] > MAXR: continue
    major = rec['type'] in ('Major Highway', 'Beltway') or rec['expressway'] == 1
    P = sr.shape.points; parts = list(sr.shape.parts) + [len(P)]
    for a, b in zip(parts[:-1], parts[1:]):
        if b - a < 2: continue
        x, y = tr.transform([q[0] for q in P[a:b]], [q[1] for q in P[a:b]])
        p = np.stack([(np.array(x) + XMAX) * S, (YMAX - np.array(y)) * S], 1)
        p = p[np.all(np.isfinite(p), 1)]
        if len(p) < 2: continue
        p = dp(p, 0.45)
        q = np.clip(np.round(p * 16), 0, 65535).astype(np.int64)
        k = np.ones(len(q), bool); k[1:] = np.any(q[1:] != q[:-1], 1); q = q[k]
        if len(q) < 2: continue
        A.append(4 if major else 5); N.append(len(q)); pts.append(q)
P = np.concatenate(pts).astype(np.uint16)
buf = np.array([len(A), len(P)], np.uint32).tobytes() + np.array(A, np.uint16).tobytes() + np.zeros(len(A), np.uint16).tobytes() + np.array(N, np.uint32).tobytes() + P.tobytes()
open('raw/roads.bin', 'wb').write(buf)
print('carreteras', len(A), 'autopistas', A.count(4), 'puntos', len(P), 'bytes', len(buf))
