# terr.json: por provincia [relieve 0 llano/1 colinas/2 montaña, clima ''/d desierto/s selva/f frío, río 0/1, latitud]
import json, sys, numpy as np
from PIL import Image
from scipy import ndimage
D=sys.argv[1]
M=json.load(open(D+'/raw/map2.json'));R=M['regions']
F=json.load(open(D+'/raw/latfit.json'));LA=np.array(F['lat']);YP=np.array(F['ypx'])
lat_of=lambda y:float(np.interp(y,YP[::-1],LA[::-1]))
t=np.asarray(Image.open(D+'/raw/terrain2.webp').convert('RGB')).astype(np.float32)
i=np.asarray(Image.open(D+'/raw/id.png').convert('RGB'));idm=i[:,:,0].astype(np.int32)+i[:,:,1].astype(np.int32)*256
r,g,b=t[...,0],t[...,1],t[...,2]
river=(np.abs(r-58)<30)&(np.abs(g-108)<30)&(np.abs(b-160)<35)&(b>r+55)
riv_d=ndimage.binary_dilation(river,iterations=2)
L=t.mean(-1);Lr=np.where(riv_d,ndimage.median_filter(L,7),L)
m1=ndimage.uniform_filter(Lr,5);m2=ndimage.uniform_filter(Lr*Lr,5);sd=np.sqrt(np.maximum(m2-m1*m1,0))
green=g-(r+b)/2
N=int(idm.max())+1;lab=idm.ravel();cnt=np.bincount(lab,minlength=N).astype(float)
mean=lambda a:np.bincount(lab,weights=a.ravel(),minlength=N)/np.maximum(cnt,1)
sdm=mean(sd);Lm=mean(L);gm=mean(green);rv=np.bincount(lab,weights=river.ravel().astype(float),minlength=N)
out={};stat={'t':[0,0,0],'c':{},'rv':0}
for rid,x in R.items():
  k=x['i'];lat=lat_of(x['c'][1]);s=sdm[k]
  tt=2 if s>=30 else 1 if s>=16 else 0
  c=''
  if abs(lat)>=58 or (Lm[k]>215 and gm[k]<6 and abs(lat)>=45):c='f'
  elif gm[k]<11 and Lm[k]>200 and abs(lat)<45:c='d'
  elif gm[k]>29 and Lm[k]<172 and abs(lat)<24:c='s'
  river_=1 if rv[k]>=max(12,cnt[k]*.008) else 0
  out[rid]=[tt,c,river_,round(lat)]
  stat['t'][tt]+=1;stat['c'][c]=stat['c'].get(c,0)+1;stat['rv']+=river_
json.dump(out,open(D+'/raw/terr.json','w'),separators=(',',':'))
print(stat)
for rid in ['NPL1','CHE1','BOL1','AFG1','NLD1','UKR1','EGY1','DZA1','BRA1','COD1','RUS1','CAN1','MEX9','PER1','ARG1','IND1','DEU1','USA5','USA44','CHN1','SAU1','IDN1','FIN1','MEX1','MEX20','COL1']:
  if rid in R:print(rid,R[rid]['nm'],out[rid],round(sdm[R[rid]['i']],1))
