"""Mapa de IDs de provincia + fondo de relieve (Robinson), adyacencias y enlaces marítimos."""
import json, math, csv
import numpy as np
from PIL import Image, ImageDraw
from pyproj import Transformer
import shapefile  # pyshp
Image.MAX_IMAGE_PIXELS = None

W = 4096
gj = json.load(open("raw/prov_robin.json"))
prov = {p["rid"]: p for p in json.load(open("raw/provinces.json"))}
feats = [f for f in gj["features"] if f["geometry"] and f["properties"]["rid"] in prov]
XMAX = 17005833.33
def rings(g):
    return [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
ys = [pt[1] for f in feats for poly in rings(f["geometry"]) for ring in poly for pt in ring]
YMAX, YMIN = max(ys) + 150000, min(ys) - 150000
S = W / (2 * XMAX); H = int(math.ceil((YMAX - YMIN) * S))
px = lambda x, y: ((x + XMAX) * S, (YMAX - y) * S)
print("tamaño", W, H)

# ---------- mapa de IDs ----------
ids = sorted(prov)  # índice estable
IDX = {rid: i + 1 for i, rid in enumerate(ids)}
def area(f):
    return prov[f["properties"]["rid"]]["area"]
img = Image.new("RGB", (W, H), (0, 0, 0)); dr = ImageDraw.Draw(img)
for f in sorted(feats, key=lambda f: -area(f)):
    k = IDX[f["properties"]["rid"]]; col = (k & 255, k >> 8, 0)
    for poly in rings(f["geometry"]):
        dr.polygon([px(*p) for p in poly[0]], fill=col)
        for hole in poly[1:]:
            dr.polygon([px(*p) for p in hole], fill=(0, 0, 0))
# los huecos pueden ser otra provincia (enclaves): se redibujan las provincias pequeñas encima
for f in sorted(feats, key=lambda f: -area(f)):
    if area(f) > 20000: continue
    k = IDX[f["properties"]["rid"]]; col = (k & 255, k >> 8, 0)
    for poly in rings(f["geometry"]):
        dr.polygon([px(*p) for p in poly[0]], fill=col)
tr = Transformer.from_crs("EPSG:4326", "+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m", always_xy=True)
lk = shapefile.Reader("raw/lakes/ne_10m_lakes.shp")
fields = [f[0] for f in lk.fields[1:]]
nl = 0
for sr in lk.iterShapeRecords():
    rec = dict(zip(fields, sr.record))
    if rec.get("scalerank", 9) > 3: continue
    pts = sr.shape.points; parts = list(sr.shape.parts) + [len(pts)]
    for a, b in zip(parts[:-1], parts[1:]):
        xs, ys_ = tr.transform([p[0] for p in pts[a:b]], [p[1] for p in pts[a:b]])
        dr.polygon([px(x, y) for x, y in zip(xs, ys_)], fill=(0, 0, 0)); nl += 1
arr = np.array(img); idm = arr[:, :, 0].astype(np.int32) + arr[:, :, 1].astype(np.int32) * 256
# garantiza al menos un píxel por provincia (islas diminutas)
present = set(np.unique(idm).tolist())
miss = 0
for f in feats:
    rid = f["properties"]["rid"]; k = IDX[rid]
    if k in present: continue
    big = max(rings(f["geometry"]), key=lambda poly: len(poly[0]))[0]
    cx = sum(p[0] for p in big) / len(big); cy = sum(p[1] for p in big) / len(big)
    x, y = px(cx, cy); x, y = int(x), int(y)
    idm[max(0, y - 1):y + 1, max(0, x - 1):x + 1] = k; miss += 1
print("lagos", nl, "provincias forzadas a 2x2 px", miss)
out = np.zeros((H, W, 3), np.uint8); out[:, :, 0] = idm & 255; out[:, :, 1] = idm >> 8
Image.fromarray(out).save("raw/id.png", optimize=True)

# estadísticas por provincia
ys_i, xs_i = np.nonzero(idm)
vals = idm[ys_i, xs_i]
cnt = np.bincount(vals, minlength=len(ids) + 1)
sx = np.bincount(vals, weights=xs_i, minlength=len(ids) + 1); sy = np.bincount(vals, weights=ys_i, minlength=len(ids) + 1)
order = np.argsort(vals, kind="stable"); v_s = vals[order]; x_s = xs_i[order]; y_s = ys_i[order]
starts = np.searchsorted(v_s, np.arange(len(ids) + 2))
px_info = {}
for rid in ids:
    k = IDX[rid]; a, b = starts[k], starts[k + 1]
    if b <= a: continue
    xx, yy = x_s[a:b], y_s[a:b]
    # punto interior: el píxel más cercano al centroide
    cx, cy = sx[k] / cnt[k], sy[k] / cnt[k]
    j = int(np.argmin((xx - cx) ** 2 + (yy - cy) ** 2))
    px_info[rid] = {"i": k, "c": [int(xx[j]), int(yy[j])], "a": int(cnt[k]), "bb": [int(xx.min()), int(yy.min()), int(xx.max()), int(yy.max())]}

# ---------- relieve proyectado ----------
src = np.array(Image.open("raw/relief/NE1_50M_SR_W/NE1_50M_SR_W.tif").convert("RGB"))
SH, SW = src.shape[:2]
inv = Transformer.from_crs("+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m", "EPSG:4326", always_xy=True)
rel = np.zeros((H, W, 3), np.uint8)
gx = (np.arange(W) + 0.5) / S - XMAX
for y0 in range(0, H, 256):
    y1 = min(H, y0 + 256)
    gy = YMAX - (np.arange(y0, y1) + 0.5) / S
    X, Y = np.meshgrid(gx, gy)
    lon, lat = inv.transform(X, Y)
    bad = ~np.isfinite(lon) | (np.abs(lon) > 180)
    lon = np.nan_to_num(lon); lat = np.nan_to_num(lat)
    fx = (lon + 180) / 360 * SW - 0.5; fy = (90 - lat) / 180 * SH - 0.5
    x0 = np.clip(np.floor(fx).astype(int), 0, SW - 2); y0_ = np.clip(np.floor(fy).astype(int), 0, SH - 2)
    ax = np.clip(fx - x0, 0, 1)[..., None]; ay = np.clip(fy - y0_, 0, 1)[..., None]
    c = (src[y0_, x0] * (1 - ax) * (1 - ay) + src[y0_, x0 + 1] * ax * (1 - ay) + src[y0_ + 1, x0] * (1 - ax) * ay + src[y0_ + 1, x0 + 1] * ax * ay)
    c[bad] = (8, 20, 34)
    rel[y0:y1] = c.astype(np.uint8)
# ríos principales
ri = Image.fromarray(rel); rd = ImageDraw.Draw(ri)
rv = shapefile.Reader("raw/rivers/ne_10m_rivers_lake_centerlines.shp"); rf = [f[0] for f in rv.fields[1:]]
nr = 0
for sr in rv.iterShapeRecords():
    rec = dict(zip(rf, sr.record))
    if rec.get("scalerank", 9) > 5 or rec.get("featurecla", "") not in ("River", "Lake Centerline"): continue
    pts = sr.shape.points; parts = list(sr.shape.parts) + [len(pts)]
    wdt = 2 if rec["scalerank"] <= 2 else 1
    for a, b in zip(parts[:-1], parts[1:]):
        xs, ys_ = tr.transform([p[0] for p in pts[a:b]], [p[1] for p in pts[a:b]])
        rd.line([px(x, y) for x, y in zip(xs, ys_)], fill=(70, 120, 170), width=wdt); nr += 1
print("ríos", nr)
ri.save("raw/relief.webp", quality=80, method=6)
ri.resize((W // 4, H // 4)).save("raw/relief_small.png")

# ---------- adyacencia (terrestre por unidades originales + píxeles) ----------
adj = {rid: set() for rid in px_info}
A1 = json.load(open("raw/a1_adj.json"))
amap = {r["adm1_code"]: r["rid"] for r in csv.DictReader(open("raw/assign_p.csv"))}
for a, ns in A1.items():
    if a not in amap: continue
    for b in ns:
        if b in amap and amap[a] != amap[b] and amap[a] in adj and amap[b] in adj:
            adj[amap[a]].add(amap[b]); adj[amap[b]].add(amap[a])
# vecinos por contacto de píxeles (corrige huecos de topología)
inv_idx = {v: k for k, v in IDX.items()}
for dy, dx in ((0, 1), (1, 0)):
    a = idm[: H - dy, : W - dx]; b = idm[dy:, dx:]
    m = (a != b) & (a > 0) & (b > 0)
    pairs = np.unique(np.stack([a[m], b[m]], 1), axis=0)
    for p, q in pairs:
        ra, rb = inv_idx[int(p)], inv_idx[int(q)]
        if ra in adj and rb in adj: adj[ra].add(rb); adj[rb].add(ra)
# enlaces marítimos: costas a menos de ~220 km
NEAR = 220 * W / 34000
coast = {}
sea = (idm == 0)
border = np.zeros_like(sea)
border[:-1] |= sea[1:]; border[1:] |= sea[:-1]; border[:, :-1] |= sea[:, 1:]; border[:, 1:] |= sea[:, :-1]
cy_, cx_ = np.nonzero(border & ~sea)
cv = idm[cy_, cx_]
o = np.argsort(cv, kind="stable"); cv, cx_, cy_ = cv[o], cx_[o], cy_[o]
st = np.searchsorted(cv, np.arange(len(ids) + 2))
for rid, inf in px_info.items():
    k = inf["i"]; a, b = st[k], st[k + 1]
    if b > a:
        step = max(1, (b - a) // 120)
        coast[rid] = np.stack([cx_[a:b:step], cy_[a:b:step]], 1).astype(np.float32)
rids = list(coast)
bbs = np.array([px_info[r]["bb"] for r in rids], np.float32)
sea_links = set()
def comps():
    seen, cs = set(), []
    for r in px_info:
        if r in seen: continue
        st_, c = [r], []; seen.add(r)
        while st_:
            x = st_.pop(); c.append(x)
            for y in adj[x]:
                if y not in seen: seen.add(y); st_.append(y)
        cs.append(c)
    return cs
cs = comps(); comp = {}
for i, c in enumerate(cs):
    for r in c: comp[r] = i
def mind(a, b):
    pa, pb = coast[a], coast[b]
    d = ((pa[:, None, :] - pb[None, :, :]) ** 2).sum(-1)
    return float(np.sqrt(d.min()))
for i, a in enumerate(rids):
    ba = bbs[i]
    gxx = np.maximum(0, np.maximum(ba[0] - bbs[:, 2], bbs[:, 0] - ba[2])); gyy = np.maximum(0, np.maximum(ba[1] - bbs[:, 3], bbs[:, 1] - ba[3]))
    for j in np.nonzero(np.hypot(gxx, gyy) < NEAR)[0]:
        if j <= i: continue
        b = rids[j]
        if comp[a] == comp[b] or b in adj[a]: continue
        if mind(a, b) < NEAR:
            adj[a].add(b); adj[b].add(a); sea_links.add("|".join(sorted([a, b])))
cs = comps()
while len(cs) > 1:
    cs.sort(key=len, reverse=True); main = cs[0]
    mainc = [r for r in main if r in coast]; mp = np.concatenate([coast[r][::4] for r in mainc]); owner = np.concatenate([[k] * len(coast[r][::4]) for k, r in enumerate(mainc)])
    best = (1e9, None, None)
    for c in cs[1:]:
        for r in c:
            if r not in coast: continue
            q = coast[r][::max(1, len(coast[r]) // 20)]; d = ((q[:, None, :] - mp[None, :, :]) ** 2).sum(-1)
            k = int(d.argmin()); dd = float(np.sqrt(d.flat[k]))
            if dd < best[0]: best = (dd, r, mainc[owner[k % len(mp)]])
    if not best[1]:
        r = cs[1][0]; best = (0, r, main[0])
    a, b = best[1], best[2]
    adj[a].add(b); adj[b].add(a); sea_links.add("|".join(sorted([a, b]))); cs = comps()

regions = {}
for rid, inf in px_info.items():
    p = prov[rid]
    regions[rid] = {"i": inf["i"], "c": inf["c"], "a": inf["a"], "bb": inf["bb"], "n": p["nid"], "nm": p["name"],
                    "mem": p["members"][:12], "area": p["area"], "pop": round(p["cpop"]), "wp": round(p["wpop"]) if p["wpop"] else 0, "cap": 1 if p["cap"] else 0, "adj": sorted(adj[rid])}
json.dump({"W": W, "H": H, "N": len(ids), "regions": regions, "sea": sorted(sea_links)}, open("raw/map2.json", "w"), ensure_ascii=False)
print("provincias en mapa", len(regions), "de", len(prov), "enlaces marítimos", len(sea_links), "sin vecinos", sum(1 for r in regions.values() if not r["adj"]))
