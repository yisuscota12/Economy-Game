"""Reproyecta un ráster mundial (lat/lon) a Robinson con la misma extensión que el mapa de IDs."""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw
from pyproj import Transformer
import shapefile
Image.MAX_IMAGE_PIXELS = None
src_path, out_path = sys.argv[1], sys.argv[2]
gj = json.load(open("raw/prov_robin.json")); W = 4096; XMAX = 17005833.33
def rings(g): return [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
ys = [pt[1] for f in gj["features"] if f["geometry"] for poly in rings(f["geometry"]) for ring in poly for pt in ring]
YMAX, YMIN = max(ys) + 150000, min(ys) - 150000
S = W / (2 * XMAX); H = int(math.ceil((YMAX - YMIN) * S))
src = np.array(Image.open(src_path).convert("RGB")); SH, SW = src.shape[:2]
inv = Transformer.from_crs("+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m", "EPSG:4326", always_xy=True)
tr = Transformer.from_crs("EPSG:4326", "+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m", always_xy=True)
rel = np.zeros((H, W, 3), np.uint8); gx = (np.arange(W) + 0.5) / S - XMAX
with np.errstate(all="ignore"):
  for y0 in range(0, H, 256):
    y1 = min(H, y0 + 256); gy = YMAX - (np.arange(y0, y1) + 0.5) / S
    X, Y = np.meshgrid(gx, gy); lon, lat = inv.transform(X, Y)
    bad = ~np.isfinite(lon) | (np.abs(lon) > 180); lon = np.where(bad, 0, lon); lat = np.where(bad, 0, lat)
    fx = (lon + 180) / 360 * SW - 0.5; fy = (90 - lat) / 180 * SH - 0.5
    x0 = np.clip(np.floor(fx).astype(int), 0, SW - 2); yy = np.clip(np.floor(fy).astype(int), 0, SH - 2)
    ax = np.clip(fx - x0, 0, 1)[..., None]; ay = np.clip(fy - yy, 0, 1)[..., None]
    c = src[yy, x0] * (1 - ax) * (1 - ay) + src[yy, x0 + 1] * ax * (1 - ay) + src[yy + 1, x0] * (1 - ax) * ay + src[yy + 1, x0 + 1] * ax * ay
    c[bad] = (8, 20, 34); rel[y0:y1] = c.astype(np.uint8)
px = lambda x, y: ((x + XMAX) * S, (YMAX - y) * S)
ri = Image.fromarray(rel); rd = ImageDraw.Draw(ri)
rv = shapefile.Reader("raw/rivers/ne_10m_rivers_lake_centerlines.shp"); rf = [f[0] for f in rv.fields[1:]]
for sr in rv.iterShapeRecords():
    rec = dict(zip(rf, sr.record))
    if rec.get("scalerank", 9) > 5 or rec.get("featurecla", "") not in ("River", "Lake Centerline"): continue
    pts = sr.shape.points; parts = list(sr.shape.parts) + [len(pts)]
    for a, b in zip(parts[:-1], parts[1:]):
        xs, ys_ = tr.transform([p[0] for p in pts[a:b]], [p[1] for p in pts[a:b]])
        rd.line([px(x, y) for x, y in zip(xs, ys_)], fill=(52, 98, 150), width=2 if rec["scalerank"] <= 2 else 1)
if out_path.endswith(".webp"): ri.save(out_path, quality=82, method=6)
else: Image.fromarray(rel).save(out_path)
print(out_path, ri.size)
