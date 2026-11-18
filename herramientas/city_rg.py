# Genera raw/city_rg.json: provincia (RG[k].i) de cada ciudad de raw/cities.json, leída de raw/id.png (misma regla que cityReg de ui_v19a.js).
import json,sys
from PIL import Image
D=sys.argv[1].rstrip('/')+'/'
m=json.load(open(D+'raw/map2.json'));C=json.load(open(D+'raw/cities.json'))
im=Image.open(D+'raw/id.png').convert('RGBA');W,H=im.size;px=im.load()
assert (W,H)==(m['W'],m['H']),(W,H,m['W'],m['H'])
valid={r['i'] for r in m['regions'].values()}
def idat(x,y):
    if 0<=x<W and 0<=y<H:
        p=px[x,y];return p[0]|(p[1]<<8)
    return 0
out=[];miss=0
for c in C:
    mx,my=int(c[0]//1),int(c[1]//1);k=idat(mx,my)
    d=1
    while not k and d<=4:
        for dx,dy in ((d,0),(-d,0),(0,d),(0,-d)):
            k=idat(mx+dx,my+dy)
            if k:break
        d+=1
    if k not in valid:k=0
    if not k:miss+=1
    out.append(k)
json.dump(out,open(D+'raw/city_rg.json','w'),separators=(',',':'))
print(len(out),'ciudades,',miss,'sin provincia')
