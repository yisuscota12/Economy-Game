"""Terreno final: colores naturales (NE2) + sombreado marcado (SR) + mar con profundidad (OB) + ríos."""
import numpy as np, json, math
from PIL import Image, ImageDraw, ImageFilter
import shapefile
from pyproj import Transformer
ne2=np.array(Image.open('raw/ne2_p.png')).astype(np.float32)
sr=np.array(Image.open('raw/sr_p.png').convert('L')).astype(np.float32)/255
ob=np.array(Image.open('raw/ob_p.png')).astype(np.float32)
i=np.array(Image.open('raw/id.png'));idm=i[:,:,0].astype(np.int32)+i[:,:,1].astype(np.int32)*256
land=idm>0
flat=np.median(sr[land]);print('nivel plano',flat)
# sombreado más marcado en tierra
k=np.clip(1+1.15*(sr-flat),0.45,1.35)[...,None]
out=ne2.copy();out[land]=np.clip(ne2[land]*k[land],0,255)
# mar: fondo oceánico con profundidad (OB) mezclado con el azul de NE2, más oscuro en lo profundo
sea=~land
obl=ob.mean(-1)
deep=np.clip((200-obl)/140,0,1)[...,None]
seac=ob*0.75+ne2*0.25
seac=seac*(1-0.35*deep)
# brillo costero: mar a pocos píxeles de tierra
lm=Image.fromarray((land*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
glow=np.array(lm).astype(np.float32)/255
seac=seac+np.array([30,45,40])*glow[...,None]
out[sea]=np.clip(seac[sea],0,255)
img=Image.fromarray(out.astype(np.uint8))
# ríos
gj=json.load(open("raw/prov_robin.json"));W=4096;XMAX=17005833.33
def rings(g): return [g["coordinates"]] if g["type"]=="Polygon" else g["coordinates"]
ys=[pt[1] for f in gj["features"] if f["geometry"] for poly in rings(f["geometry"]) for ring in poly for pt in ring]
YMAX=max(ys)+150000;S=W/(2*XMAX);px=lambda x,y:((x+XMAX)*S,(YMAX-y)*S)
tr=Transformer.from_crs("EPSG:4326","+proj=robin +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m",always_xy=True)
rd=ImageDraw.Draw(img);rv=shapefile.Reader("raw/rivers/ne_10m_rivers_lake_centerlines.shp");rf=[f[0] for f in rv.fields[1:]]
for s in rv.iterShapeRecords():
    rec=dict(zip(rf,s.record))
    if rec.get("scalerank",9)>6 or rec.get("featurecla","") not in ("River","Lake Centerline"):continue
    pts=s.shape.points;parts=list(s.shape.parts)+[len(pts)]
    for a,b in zip(parts[:-1],parts[1:]):
        xs,ys_=tr.transform([p[0] for p in pts[a:b]],[p[1] for p in pts[a:b]])
        rd.line([px(x,y) for x,y in zip(xs,ys_)],fill=(58,108,160),width=2 if rec["scalerank"]<=3 else 1)
img.save('raw/terrain2.webp',quality=84,method=6)
img.crop((500,300,1700,1000)).save('prev_t2.png')
print('ok')
