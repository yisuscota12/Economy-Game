"""v1.0 — Rehace borders.bin y borders_lo.bin tras dividir provincias.
Los arcos originales que tocan una provincia dividida se cortan donde cambia la pieza vecina;
las fronteras internas nuevas se trazan del mapa de IDs, se suavizan (Chaikin) y se simplifican (Douglas-Peucker).
Uso: python3 borders_v10.py   (lee raw_v09/borders*.bin, raw/id.png, raw/map2.json, raw/split.json)"""
import json, numpy as np
from PIL import Image
from collections import defaultdict

im = np.asarray(Image.open('raw/id.png').convert('RGB')); IDM = im[..., 0].astype(np.int32) + im[..., 1].astype(np.int32) * 256
H, W = IDM.shape
M = json.load(open('raw/map2.json')); R = M['regions']; SP = json.load(open('raw/split.json'))
FAM = {}      # índice del padre -> conjunto de índices de las piezas
for p, kids in SP.items(): FAM[R[p]['i']] = set(R[k]['i'] for k in kids)
OF = {}       # índice de pieza -> índice del padre
for p, s in FAM.items():
    for k in s: OF[k] = p

def read(fn):
    b = open(fn, 'rb').read(); nA, nP = np.frombuffer(b, np.uint32, 2, 0); o = 8
    A = np.frombuffer(b, np.uint16, nA, o); o += nA * 2; B = np.frombuffer(b, np.uint16, nA, o); o += nA * 2
    N = np.frombuffer(b, np.uint32, nA, o); o += nA * 4; P = np.frombuffer(b, np.uint16, nP * 2, o).reshape(-1, 2)
    arcs = []; s = 0
    for i in range(nA): arcs.append((int(A[i]), int(B[i]), P[s:s + N[i]].astype(np.float64) / 16)); s += N[i]
    return arcs

def write(fn, arcs):
    A, B, N, pts = [], [], [], []
    for a, b, p in arcs:
        q = np.clip(np.round(p * 16), 0, 65535).astype(np.int64)
        keep = np.ones(len(q), bool); keep[1:] = np.any(q[1:] != q[:-1], 1); q = q[keep]
        if len(q) < 2: continue
        A.append(a); B.append(b); N.append(len(q)); pts.append(q)
    P = np.concatenate(pts).astype(np.uint16)
    buf = np.array([len(A), len(P)], np.uint32).tobytes() + np.array(A, np.uint16).tobytes() + np.array(B, np.uint16).tobytes() + np.array(N, np.uint32).tobytes() + P.tobytes()
    open(fn, 'wb').write(buf); return len(A), len(P), len(buf)

def kid_at(x, y, fam):
    xi, yi = int(x), int(y)
    for r in (1, 2, 4, 7):
        y0, y1, x0, x1 = max(0, yi - r), min(H, yi + r + 1), max(0, xi - r), min(W, xi + r + 1)
        w = IDM[y0:y1, x0:x1].ravel(); w = w[np.isin(w, list(fam))]
        if len(w): return int(np.bincount(w).argmax())
    return None

def split_arc(a, b, p):
    la = [a] * len(p); lb = [b] * len(p)
    for side, lab in ((a, la), (b, lb)):
        if side not in FAM: continue
        prev = None
        for j, (x, y) in enumerate(p):
            k = kid_at(x, y, FAM[side]); k = k if k is not None else prev
            lab[j] = k; prev = k
        first = next((v for v in lab if v is not None), side)
        for j in range(len(lab)):
            if lab[j] is None: lab[j] = first
        # suaviza: corridas de 1–2 puntos adoptan la etiqueta vecina
        for j in range(1, len(lab) - 1):
            if lab[j - 1] == lab[j + 1] != lab[j]: lab[j] = lab[j - 1]
    out = []; s = 0
    for j in range(1, len(p) + 1):
        if j == len(p) or (la[j], lb[j]) != (la[s], lb[s]):
            e = min(j, len(p) - 1)
            seg = p[s:e + 1]
            if len(seg) >= 2: out.append((la[s], lb[s], seg))
            s = j
    return out

def chaikin(p, it=2, closed=False):
    for _ in range(it):
        if len(p) < 3: return p
        q = [p[0]] if not closed else []
        for i in range(len(p) - 1):
            a, b = p[i], p[i + 1]; q.append(a * .75 + b * .25); q.append(a * .25 + b * .75)
        if not closed: q.append(p[-1])
        p = np.array(q)
    return p

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

def internal_chains():
    segs = defaultdict(list)          # (u,v) -> lista de segmentos ((x,y),(x,y))
    fam_any = np.isin(IDM, list(OF))
    # verticales: entre (y,x) y (y,x+1)
    a, b = IDM[:, :-1], IDM[:, 1:]; m = (a != b) & fam_any[:, :-1] & fam_any[:, 1:]
    for y, x in zip(*np.nonzero(m)):
        u, v = int(a[y, x]), int(b[y, x])
        if OF[u] != OF[v]: continue
        segs[(min(u, v), max(u, v))].append(((x + 1, y), (x + 1, y + 1)))
    a, b = IDM[:-1, :], IDM[1:, :]; m = (a != b) & fam_any[:-1, :] & fam_any[1:, :]
    for y, x in zip(*np.nonzero(m)):
        u, v = int(a[y, x]), int(b[y, x])
        if OF[u] != OF[v]: continue
        segs[(min(u, v), max(u, v))].append(((x, y + 1), (x + 1, y + 1)))
    deg_all = defaultdict(int)
    for ss in segs.values():
        for p, q in ss: deg_all[p] += 1; deg_all[q] += 1
    chains = []
    for key, ss in segs.items():
        adj = defaultdict(list)
        for i, (p, q) in enumerate(ss): adj[p].append((q, i)); adj[q].append((p, i))
        used = np.zeros(len(ss), bool)
        def walk(start):
            path = [start]; cur = start
            while True:
                nxt = [(q, i) for q, i in adj[cur] if not used[i]]
                if not nxt: break
                q, i = nxt[0]; used[i] = True; path.append(q); cur = q
                if len(adj[cur]) != 2 or deg_all[cur] > 2: break
            return path
        ends = [p for p in adj if len(adj[p]) != 2 or deg_all[p] > 2]
        for e in ends:
            while any(not used[i] for _, i in adj[e]): chains.append((key, np.array(walk(e), float), False))
        for p in list(adj):
            if any(not used[i] for _, i in adj[p]): chains.append((key, np.array(walk(p), float), True))
    return chains

chains = internal_chains()
print('fronteras internas nuevas:', len(chains))
for fn, tol, it in (('borders', 0.35, 2), ('borders_lo', 1.1, 2)):
    arcs = read(f'raw_v09/{fn}.bin'); out = []; ns = 0
    for a, b, p in arcs:
        if a in FAM or b in FAM: out += split_arc(a, b, p); ns += 1
        else: out.append((a, b, p))
    for (u, v), p, closed in chains:
        q = chaikin(p, it, closed); q = dp(q, tol)
        if closed and len(q) and np.any(q[0] != q[-1]): q = np.vstack([q, q[:1]])
        out.append((u, v, q))
    print(fn, 'arcos cortados', ns, '→', write(f'raw/{fn}.bin', out))
