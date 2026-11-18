"""v1.0 — Divide provincias enormes (>250 mil km²) en piezas tácticas.
Usa distritos reales admin-2 (geoBoundaries) cuando hay; si no, cortes Voronoi con ruido.
Entrada: raw_v09/ (datos de la v0.9) y dl/<ISO>.geojson. Salida: raw/map2.json, raw/id.png, raw/cities.json, raw/split.json
Uso: python3 split.py <dir_geojson>
"""
import json, math, sys, re
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from pyproj import Transformer

DL = sys.argv[1] if len(sys.argv) > 1 else '../../dl'
SRC = 'raw_v09'
THRESH = 250_000      # km² a partir de los cuales se divide
TARGET = 190_000      # km² por pieza (aprox.)
rng = np.random.default_rng(11)

M = json.load(open(f'{SRC}/map2.json')); R = M['regions']; W, H = M['W'], M['H']
CITIES = json.load(open(f'{SRC}/cities.json'))
im = np.asarray(Image.open(f'{SRC}/id.png').convert('RGB'))
IDM = im[..., 0].astype(np.int32) + im[..., 1].astype(np.int32) * 256
I2R = {v['i']: k for k, v in R.items()}

# --- proyección (Robinson, misma extensión que el mapa) ---
F = json.load(open(f'{SRC}/latfit.json')); LA = np.array(F['lat']); YP = np.array(F['ypx'])
XMAX = 17005833.33; S = W / (2 * XMAX)
ROB = '+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +over'
tr = Transformer.from_crs('EPSG:4326', ROB, always_xy=True)
_, y0s = tr.transform(np.zeros_like(LA), LA)
YMAX = float(np.median(YP / S + y0s)) + 2.83 / S          # calibrado con Tokio, CDMX y Moscú
lat_of_y = lambda y: np.interp(y, YP[::-1], LA[::-1])
# km² por píxel en cada fila (Robinson es pseudocilíndrica: depende solo de la latitud)
inv = Transformer.from_crs(ROB, 'EPSG:4326', always_xy=True)
rows = np.arange(H) + 0.5
lon_a, lat_a = inv.transform(np.zeros(H), YMAX - (rows - .5) / S)
lon_b, lat_b = inv.transform(np.full(H, 1 / S), YMAX - (rows + .5) / S)
RAD = math.pi / 180; RE = 6371.0
KM2 = np.abs(np.radians(lon_b - lon_a) * RE * RE * (np.sin(lat_a * RAD) - np.sin(lat_b * RAD)))
KM2 = np.nan_to_num(KM2, nan=0.0)

def proj(coords):
    a = np.asarray(coords, float)
    lon = a[:, 0].copy()
    if lon.max() - lon.min() > 180: lon[lon < 0] += 360          # anillos que cruzan el antimeridiano
    x, y = tr.transform(lon, a[:, 1])
    return list(zip(((np.asarray(x) + XMAX) * S).tolist(), ((YMAX - np.asarray(y)) * S).tolist()))

def raster_country(iso):
    try: g = json.load(open(f'{DL}/{iso}.geojson'))
    except Exception: return None, []
    img = Image.new('I', (W, H), 0); d = ImageDraw.Draw(img); names = ['']
    for f in g['features']:
        geo = f['geometry']
        if not geo: continue
        polys = [geo['coordinates']] if geo['type'] == 'Polygon' else geo['coordinates']
        names.append(f['properties'].get('shapeName') or '')
        k = len(names) - 1
        for poly in polys:
            for j, ring in enumerate(poly):
                if len(ring) < 3: continue
                pts = proj(ring)
                d.polygon(pts, fill=(k if j == 0 else 0))
                if any(p[0] > W for p in pts):  # parte al otro lado del antimeridiano
                    d.polygon([(p[0] - W * 1.0, p[1]) for p in pts], fill=(k if j == 0 else 0))
    return np.asarray(img, np.int32), names

def noise_field(h, w, amp, sigma):
    a = ndimage.gaussian_filter(rng.standard_normal((h, w)), sigma)
    return a / (a.std() + 1e-9) * amp

def kmeans(P, wts, k, it=40):
    """k-means ponderado y determinista (k-means++ con semilla fija)."""
    n = len(P); k = min(k, n)
    c = [P[int(np.argmax(wts))]]
    for _ in range(1, k):
        d = np.min(((P[:, None, :] - np.array(c)[None]) ** 2).sum(-1), 1) * wts
        c.append(P[int(np.argmax(d))])
    c = np.array(c, float)
    for _ in range(it):
        lab = np.argmin(((P[:, None, :] - c[None]) ** 2).sum(-1), 1)
        for j in range(k):
            m = lab == j
            if m.any(): c[j] = (P[m] * wts[m, None]).sum(0) / wts[m].sum()
    return lab, c

def balanced(P, wts, k, it=25):
    """Agrupa puntos ponderados en k grupos de área parecida (k-means con penalización por tamaño)."""
    lab, c = kmeans(P, wts, k)
    tgt = wts.sum() / k; scale = np.ones(len(c))
    for _ in range(it):
        d = np.sqrt(((P[:, None, :] - c[None]) ** 2).sum(-1)) * scale[None]
        lab = np.argmin(d, 1)
        for j in range(len(c)):
            m = lab == j
            if m.any():
                c[j] = (P[m] * wts[m, None]).sum(0) / wts[m].sum()
                scale[j] *= (wts[m].sum() / tgt) ** 0.12
    return lab

DIRS = [(0, 'Central')]
def direction(dx, dy):
    ang = math.degrees(math.atan2(-dy, dx)) % 360
    return ['Oriental', 'Nororiental', 'Septentrional', 'Noroccidental', 'Occidental', 'Suroccidental', 'Meridional', 'Suroriental'][int(((ang + 22.5) % 360) // 45)]

SUFX = re.compile(r"\s*(municipal district|district|rayon|raion|ulus|okrug|region|county|census area|borough|municipality|shire|regional|prefecture|governorate|urban|city|\*)\s*$", re.I)
def clean_unit(n, iso=''):
    if not n: return None
    n = re.sub(r'[\u200b-\u200f\u2060\ufeff]', '', n).strip()
    if re.search(r'[^\x00-\u024f\u1e00-\u1eff \'-]', n): return None          # solo alfabeto latino
    if re.search(r'\d|No\.|--|/|Unorganized|Unorganised|Unincorporated|Division|Subdivision|Area \w$', n): return None
    for _ in range(2): n = SUFX.sub('', n).strip()
    n = n.split(' Dolgano')[0]
    if iso == 'RUS':
        n = re.sub(r'(skiy|sky|skii|skoy)$', 'ski', n); n = n.replace('Kh', 'J').replace('kh', 'j')
    if iso == 'CHN': n = re.sub(r'(?<=[a-z])(xian|shi|qi)$', '', n)
    n = re.sub(r'\s+(Autonomous|National)$', '', n)
    n = n.split(' Dolgano')[0]
    if len(n) < 3 or len(n) > 22: return None
    return n

# nombres geográficos (Natural Earth: islas, penínsulas, cordilleras, desiertos, mesetas…)
import shapefile
GEO = Image.new('I', (W, H), 0); gd = ImageDraw.Draw(GEO); GEON = ['']
try:
    _r = shapefile.Reader(f'{DL}/ne_10m_geography_regions_polys.shp'); _f = [x[0] for x in _r.fields[1:]]
    feats = []
    for sr in _r.iterShapeRecords():
        rec = dict(zip(_f, sr.record)); shp = sr.shape
        if rec['FEATURECLA'] in ('Continent',) or not shp.points: continue
        bb = shp.bbox; feats.append(((bb[2] - bb[0]) * (bb[3] - bb[1]), rec, shp))
    for _, rec, shp in sorted(feats, key=lambda t: -t[0]):
        nm = (rec.get('NAME_ES') or rec.get('NAME') or '').strip()
        if nm.isupper(): nm = ' '.join(w if w.lower() in ('de','del','la','las','los','y') else w.capitalize() for w in nm.lower().split())
        nm = nm[:1].upper() + nm[1:]
        if not nm or len(nm) > 26 or nm in ('Selvas', 'Groenlandia', 'Siberia'): continue
        GEON.append(nm); k = len(GEON) - 1
        pts = shp.points; parts = list(shp.parts) + [len(pts)]
        for a, b in zip(parts[:-1], parts[1:]):
            if b - a >= 3: gd.polygon(proj(pts[a:b]), fill=k)
except Exception as e: print('sin nombres geográficos:', e)
GEO = np.asarray(GEO, np.int32)
def geo_names(m, y0, x0, fmin):
    g = GEO[y0:y0 + m.shape[0], x0:x0 + m.shape[1]][m]; n = len(g)
    if not n: return []
    c = np.bincount(g[g > 0]) if (g > 0).any() else np.array([0])
    return [GEON[k] for k in np.argsort(-c) if k > 0 and c[k] >= fmin * n][:4]

R['DNK5']['nm'] = 'Noreste de Groenlandia'; R['DNK5']['mem'] = ['Noreste de Groenlandia']
parents = sorted([k for k, v in R.items() if v['area'] > THRESH], key=lambda k: R[k]['i'])
print('provincias a dividir:', len(parents))
newIDM = IDM.copy(); N0 = M['N']; nextI = N0 + 1; CNT = [0]
pieces = {}   # parent rid -> list of dict(rid,i,mask_idx...)
cache = {}
used_names = set(v['nm'] for v in R.values())
# limpia ciudades duplicadas (mismo nombre y país, población parecida: geocodificación errónea)
nat_of_i = {v['i']: v['n'] for v in R.values()}
best = {}
for c in CITIES:
    k = (c[3], nat_of_i.get(c[5]))
    if k not in best or c[2] > best[k][2]: best[k] = c
drop = [c for c in CITIES if best[(c[3], nat_of_i.get(c[5]))] is not c and c[2] > 0.7 * best[(c[3], nat_of_i.get(c[5]))][2]]
drop += [c for c in CITIES if c[3] == 'Crato' and c[0] < 1400]
print('ciudades eliminadas:', [(c[3], c[2]) for c in drop])
CITIES = [c for c in CITIES if c not in drop]
cities_by_i = {}
for c in CITIES: cities_by_i.setdefault(c[5], []).append(c)

for prid in parents:
    pr = R[prid]; iso = pr['n']; pi = pr['i']
    x0, y0, x1, y1 = pr['bb']; x0 = max(0, x0 - 2); y0 = max(0, y0 - 2); x1 = min(W - 1, x1 + 2); y1 = min(H - 1, y1 + 2)
    sub = IDM[y0:y1 + 1, x0:x1 + 1]; mask = sub == pi
    if mask.sum() < 50: continue
    if iso not in cache: cache[iso] = raster_country(iso)
    lab_full, unames = cache[iso]
    hh, ww = mask.shape
    wrow = KM2[y0:y1 + 1][:, None] * np.ones((1, ww))
    if lab_full is not None:
        L = np.where(mask, lab_full[y0:y1 + 1, x0:x1 + 1], 0)
        if (L > 0).any():
            _, ind = ndimage.distance_transform_edt(L == 0, return_indices=True)
            L = np.where(mask, L[ind[0], ind[1]], 0)
    else:
        L = mask.astype(np.int32)
    valid = set()
    if lab_full is not None:
        if 'cnt' not in cache: cache['cnt'] = {}
        if iso not in cache['cnt']: cache['cnt'][iso] = np.bincount(lab_full.ravel())
        inside = np.bincount(np.where(mask, lab_full[y0:y1 + 1, x0:x1 + 1], 0).ravel(), minlength=len(cache['cnt'][iso]))
        tot = cache['cnt'][iso]
        valid = {u for u in range(1, len(inside)) if inside[u] and inside[u] >= 0.5 * tot[u]}
    if lab_full is None or not (L > 0).any(): L = mask.astype(np.int32); unames = ['', pr['nm']]
    area_scale = pr['area'] / max(1e-9, (wrow * mask).sum())
    k = max(2, int(round(pr['area'] / TARGET)))
    yy, xx = np.nonzero(mask)
    wpx = wrow[yy, xx] * area_scale
    # coordenadas deformadas con ruido suave → fronteras orgánicas en los cortes artificiales
    nx = noise_field(hh, ww, 7.0, 9.0); ny = noise_field(hh, ww, 7.0, 9.0)
    PW = np.stack([xx + nx[yy, xx], yy + ny[yy, xx]], 1)
    ul = L[yy, xx]
    # unidades: (id de unidad, sub-corte) → partir las unidades demasiado grandes
    units = {}
    for u in np.unique(ul):
        m = ul == u; a = wpx[m].sum()
        units[(int(u), 0)] = (np.nonzero(m)[0], a)
    def split_unit(key, parts):
        idx, a = units.pop(key)
        lab, _ = kmeans(PW[idx], wpx[idx], parts)
        for j in range(lab.max() + 1):
            s = idx[lab == j]
            if len(s): CNT[0] += 1; units[(key[0], CNT[0])] = (s, wpx[s].sum())
    for key in list(units):
        idx, a = units[key]
        if a > 1.5 * TARGET and len(idx) > 30: split_unit(key, int(round(a / TARGET)))
    while len(units) < k:
        key = max(units, key=lambda q: units[q][1])
        if len(units[key][0]) < 30: break
        split_unit(key, 2)
    keys = list(units)
    if len(keys) < 2: continue
    k = min(k, len(keys))
    UP = np.array([(PW[units[q][0]] * wpx[units[q][0], None]).sum(0) / units[q][1] for q in keys])
    UA = np.array([units[q][1] for q in keys])
    glab = balanced(UP, UA, k)
    G = np.full(mask.shape, -1, np.int32)
    for q, g in zip(keys, glab): G[yy[units[q][0]], xx[units[q][0]]] = g
    # contigüidad: los trozos sueltos que tocan otro grupo se pasan a ese grupo
    for _ in range(6):
        changed = False
        for g in range(k):
            cc, n = ndimage.label(G == g)
            if n <= 1: continue
            sizes = ndimage.sum(np.ones_like(cc), cc, range(1, n + 1)); keep = int(np.argmax(sizes)) + 1
            for c_ in range(1, n + 1):
                if c_ == keep: continue
                comp = cc == c_; ring = ndimage.binary_dilation(comp) & ~comp & (G >= 0) & (G != g)
                if not ring.any(): continue
                tgt = np.bincount(G[ring]).argmax(); G[comp] = tgt; changed = True
        if not changed: break
    # grupos diminutos (<30% de la meta) se funden con su vecino más pequeño
    for _ in range(k):
        gs = [g for g in np.unique(G[G >= 0])]
        ar = {g: wpx[G[yy, xx] == g].sum() for g in gs}
        small = [g for g in gs if ar[g] < 0.3 * TARGET]
        if not small or len(gs) <= 2: break
        g = min(small, key=lambda q: ar[q]); comp = G == g
        ring = ndimage.binary_dilation(comp, iterations=2) & ~comp & (G >= 0)
        if not ring.any(): break
        nb = np.unique(G[ring]); tgt = min(nb, key=lambda q: ar[q]); G[comp] = tgt
    gs = [int(g) for g in np.unique(G[G >= 0])]
    if len(gs) < 2: continue
    # población: 35% por área, 65% por ciudades dentro de cada pieza
    cs = cities_by_i.get(pi, [])
    info = []
    for g in gs:
        m = G == g; py, px_ = np.nonzero(m)
        a = (wrow[m] * area_scale).sum()
        dt = ndimage.distance_transform_edt(np.pad(m, 1))[1:-1, 1:-1]
        cy_, cx_ = py.mean(), px_.mean()
        score = dt - 0.04 * np.hypot(np.arange(ww)[None, :] - cx_, np.arange(hh)[:, None] - cy_)
        score[~m] = -1e9; ly, lx = np.unravel_index(int(np.argmax(score)), score.shape)
        mycs = [c for c in cs if 0 <= int(c[1]) - y0 < hh and 0 <= int(c[0]) - x0 < ww and G[int(c[1]) - y0, int(c[0]) - x0] == g]
        uin = [q for q, gg in zip(keys, glab) if gg == g]
        uarea = {}
        for q in keys:
            sel = G[yy[units[q][0]], xx[units[q][0]]] == g
            if sel.any(): uarea[q[0]] = uarea.get(q[0], 0) + wpx[units[q][0]][sel].sum()
        info.append(dict(g=g, m=m, area=a, c=[int(lx + x0), int(ly + y0)], cities=sorted(mycs, key=lambda c: -c[2]),
                         cpop=sum(c[2] for c in mycs), units=sorted(uarea, key=lambda u: -uarea[u]), cen=(cx_ + x0, cy_ + y0),
                         bb=[int(px_.min() + x0), int(py.min() + y0), int(px_.max() + x0), int(py.max() + y0)], a=int(m.sum())))
    totA = sum(p['area'] for p in info); totC = sum(p['cpop'] for p in info)
    for p in info:
        sh = p['area'] / totA * (0.35 if totC else 1) + (0.65 * p['cpop'] / totC if totC else 0)
        p['share'] = sh
    info.sort(key=lambda p: -p['share'])
    # nombres: la pieza más poblada conserva el nombre; las demás, ciudad principal → distrito real → punto cardinal
    pcx, pcy = np.mean([p['cen'][0] for p in info]), np.mean([p['cen'][1] for p in info])
    for j, p in enumerate(info):
        if j == 0: p['nm'] = pr['nm']; p['rid'] = prid; p['i'] = pi; continue
        nm = None
        for c in p['cities']:
            if c[2] >= 25_000 and c[3] not in used_names: nm = c[3]; break
        if not nm:
            for gn in geo_names(p['m'], y0, x0, 0.3):
                if gn not in used_names: nm = gn; break
        vu = [cn for cn in (clean_unit(unames[u], iso) for u in p['units'] if u in valid and u < len(unames)) if cn]
        if not nm:
            for cn in vu:
                if cn not in used_names and cn != pr['nm']: nm = cn; break
        if not nm:
            for c in p['cities']:
                if c[2] >= 2_000 and c[3] not in used_names: nm = c[3]; break
        if not nm:
            for gn in geo_names(p['m'], y0, x0, 0.1):
                if gn not in used_names: nm = gn; break
        if not nm:
            dr = direction(p['cen'][0] - pcx, p['cen'][1] - pcy)
            for base in [f"{pr['nm']} {dr}"] + [f'{u} {dr}' for u in vu]:
                if base not in used_names: nm = base; break
            q = 2
            while not nm or nm in used_names: nm = f"{pr['nm']} {dr} {q}"; q += 1
        used_names.add(nm); p['nm'] = nm
        p['rid'] = prid + 'bcdefghijklmnopqrstuvwxyz'[j - 1] if j <= 25 else f'{prid}_{j}'
        p['i'] = nextI; nextI += 1
    for p in info:
        sub_new = newIDM[y0:y1 + 1, x0:x1 + 1]; sub_new[p['m']] = p['i']
        p['mem'] = [p['nm']]
    pieces[prid] = info
    print(prid, pr['nm'], round(pr['area'] / 1000), 'mil km² →', len(info), [p['nm'] for p in info])

# ---------- reconstruye regiones ----------
NEW = {k: dict(v) for k, v in R.items()}
child = {}
for prid, info in pieces.items():
    pr = R[prid]
    for p in info:
        r = {'i': p['i'], 'c': p['c'], 'a': p['a'], 'bb': p['bb'], 'n': pr['n'], 'nm': p['nm'], 'mem': p['mem'],
             'area': int(round(p['area'])), 'pop': pr['pop'] * p['share'], 'wp': (pr['wp'] * p['share'] if pr.get('wp') else pr.get('wp')),
             'cap': 0, 'adj': []}
        if 'co' in pr: pass
        NEW[p['rid']] = r; child[p['rid']] = prid
    # capital: la pieza que contiene la capital nacional; si no, la más poblada
    if pr.get('cap'):
        capc = [c for c in cities_by_i.get(pr['i'], []) if c[4] == 2]
        tgt = info[0]['rid']
        if capc:
            c = capc[0]; ii = newIDM[int(c[1]), int(c[0])]
            for p in info:
                if p['i'] == ii: tgt = p['rid']
        NEW[tgt]['cap'] = 1
# adyacencia por ráster (4 vecinos) para provincias afectadas
pairs = set()
for a, b in ((newIDM[:, :-1], newIDM[:, 1:]), (newIDM[:-1, :], newIDM[1:, :])):
    m = (a != b) & (a > 0) & (b > 0)
    for u, v in np.unique(np.stack([a[m], b[m]], 1), axis=0): pairs.add((int(u), int(v))); pairs.add((int(v), int(u)))
I2N = {v['i']: k for k, v in NEW.items()}
radj = {}
for u, v in pairs: radj.setdefault(I2N[u], set()).add(I2N[v])
coast = set()
for a, b in ((newIDM[:, :-1], newIDM[:, 1:]), (newIDM[:-1, :], newIDM[1:, :])):
    m = (a == 0) & (b > 0); coast.update(np.unique(b[m]).tolist()); m = (b == 0) & (a > 0); coast.update(np.unique(a[m]).tolist())
fam = {}
for prid, info in pieces.items(): fam[prid] = [p['rid'] for p in info]
def nearest(cands, pt):
    return min(cands, key=lambda r: (NEW[r]['c'][0] - pt[0]) ** 2 + (NEW[r]['c'][1] - pt[1]) ** 2)
affected = set(child)
for prid in pieces:
    for nb in R[prid]['adj']: affected.update(fam.get(nb, [nb]))
for rid in affected:
    r = NEW[rid]; old = R[child.get(rid, rid)]['adj'] if child.get(rid, rid) in R else []
    s = set(x for x in radj.get(rid, set()) if x != rid)
    # vecinos originales sin contacto en el ráster (islas, estrechos): se conservan con la pieza más cercana
    for nb in old:
        cands = fam.get(nb, [nb])
        if not any(c in s for c in cands):
            if rid in child:   # solo la pieza más cercana hereda el vínculo
                me = nearest(fam[child[rid]], NEW[nearest(cands, r['c'])]['c'])
                if me == rid: s.add(nearest(cands, r['c']))
            else: s.add(nearest(cands, r['c']))
    r['adj'] = sorted(s)
# simetría
for rid in list(NEW):
    for nb in NEW[rid]['adj']:
        if rid not in NEW[nb]['adj']: NEW[nb]['adj'] = sorted(set(NEW[nb]['adj']) | {rid})
for rid in child:
    if NEW[rid]['i'] in coast: NEW[rid]['co'] = 1
    else: NEW[rid].pop('co', None)
# enlaces marítimos: pasan a la pieza costera más cercana al otro extremo
sea = set()
for s in M['sea']:
    a, b = s.split('|')
    A = fam.get(a, [a]); B = fam.get(b, [b])
    if len(A) > 1: A = [x for x in A if NEW[x].get('co')] or A; a = nearest(A, NEW[nearest(B, R[a]['c'])]['c'])
    if len(B) > 1: B = [x for x in B if NEW[x].get('co')] or B; b = nearest(B, NEW[a]['c'])
    sea.add('|'.join(sorted([a, b])))
M2 = {'W': W, 'H': H, 'N': nextI - 1, 'regions': {k: NEW[k] for k in sorted(NEW)}, 'sea': sorted(sea)}
json.dump(M2, open('raw/map2.json', 'w'), ensure_ascii=False, separators=(',', ':'))
# ciudades → índice de provincia nuevo
for c in CITIES:
    if I2R.get(c[5]) in pieces:
        ii = int(newIDM[min(H - 1, int(round(c[1]))), min(W - 1, int(round(c[0])))])
        fam_i = [p['i'] for p in pieces[I2R[c[5]]]]
        if ii not in fam_i: ii = NEW[nearest(fam[I2R[c[5]]], (c[0], c[1]))]['i']
        c[5] = ii
json.dump(CITIES, open('raw/cities.json', 'w'), ensure_ascii=False, separators=(',', ':'))
out = np.zeros((H, W, 3), np.uint8); out[..., 0] = newIDM & 255; out[..., 1] = newIDM >> 8
np.save('/tmp/newidm.npy', newIDM)
Image.fromarray(out).save('raw/id.png', optimize=True)
json.dump({p: [q['rid'] for q in info] for p, info in pieces.items()}, open('raw/split.json', 'w'), ensure_ascii=False)
print('provincias:', len(R), '→', len(NEW), 'N =', nextI - 1)
