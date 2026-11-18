/* ===== MAPA: WebGL con mapa de IDs de provincia; respaldo Canvas 2D (modo ligero) ===== */
const MW=MAP.W,MH=MAP.H,SVGNS='http://www.w3.org/2000/svg';
let vb={x:0,y:0,w:MW,h:MH};const ZMIN=100;
const mapFx=()=>{try{return CFG.mfx!==0;}catch(e){return true;}};const mapRoads=()=>{try{return CFG.road!==0;}catch(e){return true;}};
let IDS=null,ID_IMG=null,mapReady=false,mapMode=null,gl=null,GLX={},LITE={},raf=0;
const IDX2RID=[];for(const id in RG)IDX2RID[RG[id].i]=id;
const LUTW=128,LUTH=Math.ceil((MAP.N+1)/LUTW);
const wrap=()=>$('mapWrap');
const upp=()=>vb.w/Math.max(100,wrap().clientWidth);
function el(tag,attrs,parent){const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src;});}
const RGBC={};
function rgbOf(hsl){if(RGBC[hsl])return RGBC[hsl];const m=hsl.match(/([\d.]+)\D+([\d.]+)%\D+([\d.]+)%/);let h=+m[1]/360,s=+m[2]/100,l=+m[3]/100;
  const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};return RGBC[hsl]=[f(0),f(8),f(4)];}
function liteWanted(){try{return localStorage.getItem('imperioLite')==='1';}catch(e){return false;}}

async function initMap(){
  const [idImg,relImg,coastImg]=await Promise.all([loadImg(ID_PNG),loadImg(REL_IMG),typeof COAST_PNG!=='undefined'?loadImg(COAST_PNG).catch(()=>null):null,loadFlags()]);GLX.coastImg=coastImg;
  ID_IMG=idImg;
  let ok=false;if(!liteWanted()){try{ok=initGL(idImg,relImg);}catch(e){ok=false;}}
  if(ok)mapMode='gl';else{initLite(relImg);mapMode='lite';}
  mapReady=true;fitCanvas();refreshMap();
  setTimeout(()=>{(window.requestIdleCallback||setTimeout)(decodeIds);},1200);
}
/* ----- WebGL ----- */
const VS='attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D uId,uRel,uLut,uOwn,uCoast;uniform float uFx;uniform vec2 uTex,uLutN,uView;uniform vec4 uVB;uniform float uSel,uMe,uDetail,uMix,uVec,uPulse;varying vec2 v;
float idAt(vec2 m){if(m.x<0.||m.y<0.||m.x>=uTex.x||m.y>=uTex.y)return 0.;vec4 c=texture2D(uId,(floor(m)+.5)/uTex);return floor(c.r*255.+.5)+floor(c.g*255.+.5)*256.;}
vec2 lc(float i){return (vec2(mod(i,${LUTW}.),floor(i/${LUTW}.))+.5)/uLutN;}
vec4 lut(float i){return texture2D(uLut,lc(i));}
vec4 own(float i){return texture2D(uOwn,lc(i));}
float hsh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vnz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1.,0.)),f.x),mix(hsh(i+vec2(0.,1.)),hsh(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 m=uVB.xy+v*uVB.zw;float px=uVB.z/uView.x;vec3 rel=texture2D(uRel,clamp(m,vec2(0.),uTex)/uTex).rgb;
 if(m.x<0.||m.x>=uTex.x||m.y<0.||m.y>=uTex.y){gl_FragColor=vec4(.03,.08,.13,1.);return;}
 float id=idAt(m);
 if(id<.5){float n=max(max(idAt(m+vec2(px,0.)),idAt(m-vec2(px,0.))),max(idAt(m+vec2(0.,px)),idAt(m-vec2(0.,px))));
  vec3 c=rel*.92;
  if(uFx>.5){float d=(texture2D(uCoast,m/uTex).r*255.-1.)/5.;float sh=exp(-d/5.);
   c=mix(c,c*vec3(.78,1.08,1.16)+vec3(.03,.09,.11),.6*sh);c*=mix(1.,.78,smoothstep(8.,48.,d));
   float lw=max(px*1.2,.35),fa=clamp(1.6-px,0.,1.);
   float rp=(1.-smoothstep(0.,lw,abs(d-2.6)))*.30+(1.-smoothstep(0.,lw,abs(d-6.5)))*.18+(1.-smoothstep(0.,lw,abs(d-12.)))*.10;
   c=mix(c,vec3(.80,.92,.97),rp*fa);c+=(vnz(m*.18)-.5)*.035;}
  if(n>.5)c=mix(c,vec3(.04,.06,.09),.55);gl_FragColor=vec4(c,1.);return;}
 vec4 o=lut(id);vec4 ow=own(id);float lum=dot(rel,vec3(.3,.59,.11));
 vec3 c=mix(rel,o.rgb*(.5+.75*lum),uMix);
 float prov=0.,nat=0.,sel=0.,me=0.;
 bool need=uVec<.5||id==uSel||id==uMe;
 if(need)for(int k=0;k<8;k++){vec2 d=k==0?vec2(1.,0.):k==1?vec2(-1.,0.):k==2?vec2(0.,1.):k==3?vec2(0.,-1.):k==4?vec2(2.,0.):k==5?vec2(-2.,0.):k==6?vec2(0.,2.):vec2(0.,-2.);
  float n=idAt(m+d*px);if(n!=id){float w=k<4?1.:.55;if(k<4)prov=1.;
   if(n<.5)nat=max(nat,w);else if(distance(own(n).rg,ow.rg)>.002)nat=max(nat,w);
   if(k<4&&(id==uSel))sel=1.;if(id==uMe)me=max(me,w);}}
 if(uFx>.5&&uMix>.3){float rr=max(px*4.,1.3),gb=0.;
  for(int k=0;k<8;k++){float a=float(k)*.7854;float n2=idAt(m+rr*vec2(cos(a),sin(a)));if(n2<.5)gb+=.06;else if(distance(own(n2).rg,ow.rg)>.002)gb+=.125;}
  c=mix(c,o.rgb*(.42+.4*lum),clamp(gb,0.,1.)*.62*uMix);
  c*=1.+(vnz(m*.35)-.5)*.07+(hsh(floor(gl_FragCoord.xy))-.5)*.025;}
 if(o.a>.1){c=mix(c,vec3(.95,.25,.25),.2);}
 if(ow.b>.3){if(mod(floor((m.x+m.y)/(4.*px)),2.)<.5)c*=ow.b>.9?.72:.55;if(ow.b>.9)c=mix(c,vec3(1.,.86,.4),.45*uPulse);}
 if(uVec<.5){c*=mix(1.,.7,prov*uDetail);
 c=mix(c,o.a>.1?vec3(.85,.12,.12):vec3(.05,.06,.08),.78*nat);}
 if(id==uSel){c=mix(c,vec3(1.),.22);if(sel>0.)c=vec3(1.);}
 if(me>0.)c=mix(c,vec3(1.,.78,.2),me);
 gl_FragColor=vec4(c,1.);}`;
function initGL(idImg,relImg){
  const cv=$('glc');gl=cv.getContext('webgl',{antialias:false,alpha:false})||cv.getContext('experimental-webgl');if(!gl)return false;
  if(gl.getParameter(gl.MAX_TEXTURE_SIZE)<MW)return false;
  const hp=gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT);if(!hp||hp.precision<20)return false;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return false;gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  const tex=(unit,src,filter,w,h)=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    if(src instanceof Uint8Array)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,src);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);return t;};
  tex(0,idImg,gl.NEAREST);tex(1,relImg,gl.LINEAR);GLX.lutData=new Uint8Array(LUTW*LUTH*4);GLX.lut=tex(2,GLX.lutData,gl.NEAREST,LUTW,LUTH);GLX.ownData=new Uint8Array(LUTW*LUTH*4);GLX.own=tex(3,GLX.ownData,gl.NEAREST,LUTW,LUTH);if(GLX.coastImg)tex(4,GLX.coastImg,gl.LINEAR);else tex(4,new Uint8Array(4),gl.NEAREST,1,1);
  const U=n=>gl.getUniformLocation(pr,n);GLX.u={id:U('uId'),rel:U('uRel'),lut:U('uLut'),tex:U('uTex'),lutN:U('uLutN'),view:U('uView'),vb:U('uVB'),sel:U('uSel'),me:U('uMe'),det:U('uDetail'),own:U('uOwn'),mix:U('uMix'),vec:U('uVec'),pulse:U('uPulse'),coast:U('uCoast'),fx:U('uFx')};GLX.prog=pr;GLX.pLoc=loc;GLX.qbuf=b;
  gl.uniform1i(GLX.u.id,0);gl.uniform1i(GLX.u.rel,1);gl.uniform1i(GLX.u.lut,2);gl.uniform1i(GLX.u.own,3);gl.uniform1i(GLX.u.coast,4);gl.uniform2f(GLX.u.tex,MW,MH);gl.uniform2f(GLX.u.lutN,LUTW,LUTH);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();try{localStorage.setItem('imperioLite','1');}catch(_){}} ,false);
  try{initBorders();}catch(e){GLX.lines=null;}
  cv.style.display='block';$('lc').style.display='none';return true;
}
const LVS=`attribute vec4 aPQ;attribute float aS;attribute float aK;uniform vec4 uVB;uniform vec2 uView;uniform float uDpr;uniform float uDet0;uniform float uZ;varying float vS;varying float vK;varying float vW;
void main(){vec2 P=aPQ.xy/16.,Q=aPQ.zw/16.;vec2 X=abs(aS)>1.5?Q:P;vec2 d=Q-P;float L=length(d);vec2 n=L>0.?vec2(-d.y,d.x)/L:vec2(0.,1.);
 bool rd=aK>3.5;float w=rd?(aK>4.5?.75:1.25):aK>2.5?2.8:aK>1.5?1.5:aK>.5?2.5:1.;w=w*uDpr*(aK>.5&&!rd?uZ:1.)+(rd?.8:1.2);float upp=uVB.z/uView.x;vec2 m=X+n*sign(aS)*w*.5*upp;vec2 c=(m-uVB.xy)/uVB.zw;
 gl_Position=((aK<.5||aK>3.5)&&uDet0<.01)||(aK>4.5&&uDet0<.45)?vec4(2.,2.,2.,1.):vec4(c.x*2.-1.,1.-c.y*2.,0.,1.);vS=sign(aS);vK=aK;vW=w;}`;
const LFS=`precision mediump float;varying float vS;varying float vK;varying float vW;uniform float uDet;
void main(){float e=1.-smoothstep(1.-2.4/vW,1.,abs(vS));vec4 c=vK>4.5?vec4(.30,.20,.12,.42*uDet):vK>3.5?vec4(.36,.19,.08,.62*uDet):vK>2.5?vec4(.92,.16,.16,.95):vK>1.5?vec4(.04,.1,.17,.7):vK>.5?vec4(.03,.04,.06,.92):vec4(.02,.02,.02,.42*uDet);
 gl_FragColor=vec4(c.rgb,c.a*e);}`;
function initBorders(){if(typeof BORDERS_B64==='undefined')return;GLX.lines=buildLines(BORDERS_B64);if(typeof BORDERS_LO_B64!=='undefined')GLX.linesLo=buildLines(BORDERS_LO_B64);
  if(typeof ROADS_B64!=='undefined'){try{const L=GLX.roads=buildLines(ROADS_B64);for(let i=0;i<L.A.length;i++)L.kinds.fill(L.A[i],L.start[i],L.start[i+1]);gl.bindBuffer(gl.ARRAY_BUFFER,L.bK);gl.bufferSubData(gl.ARRAY_BUFFER,0,L.kinds);}catch(e){GLX.roads=null;}}}
function buildLines(B64){
  const s=atob(B64),u8=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u8[i]=s.charCodeAt(i);const bin=u8.buffer;
  const h=new Uint32Array(bin,0,2),nA=h[0],nP=h[1];let off=8;const A=new Uint16Array(bin,off,nA);off+=nA*2;const B=new Uint16Array(bin,off,nA);off+=nA*2;const N=new Uint32Array(bin,off,nA);off+=nA*4;const Pp=new Uint16Array(bin,off,nP*2);
  let nSeg=0;for(let i=0;i<nA;i++)nSeg+=N[i]-1;
  const pq=new Float32Array(nSeg*6*4),ss=new Float32Array(nSeg*6),start=new Uint32Array(nA+1);let v=0,p=0;const SD=[1,-1,2,-1,-2,2];
  for(let i=0;i<nA;i++){start[i]=v;for(let j=0;j<N[i]-1;j++){const ax=Pp[(p+j)*2],ay=Pp[(p+j)*2+1],bx=Pp[(p+j+1)*2],by=Pp[(p+j+1)*2+1];
    for(let t=0;t<6;t++){pq[v*4]=ax;pq[v*4+1]=ay;pq[v*4+2]=bx;pq[v*4+3]=by;ss[v]=SD[t];v++;}}p+=N[i];}
  start[nA]=v;
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,LVS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,LFS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
  const buf=d=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);return b;};
  const kinds=new Float32Array(v);
  return {pr,n:v,A,B,start,kinds,bPQ:buf(pq),bS:buf(ss),bK:(()=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,kinds,gl.DYNAMIC_DRAW);return b;})(),
    lPQ:gl.getAttribLocation(pr,'aPQ'),lS:gl.getAttribLocation(pr,'aS'),lK:gl.getAttribLocation(pr,'aK'),
    uVB:gl.getUniformLocation(pr,'uVB'),uView:gl.getUniformLocation(pr,'uView'),uDpr:gl.getUniformLocation(pr,'uDpr'),uDet:gl.getUniformLocation(pr,'uDet'),uDet0:gl.getUniformLocation(pr,'uDet0'),uZ:gl.getUniformLocation(pr,'uZ')};
}
function updateBorders(){[GLX.lines,GLX.linesLo].forEach(updLines);}
function updLines(L){if(!L)return;const foes=foeSet(),me=P&&P.alive?natOf(P).id:null;const key=(G._ov||0)+'|'+me+'|'+[...foes].join(',');if(L.key===key)return;L.key=key;
  for(let i=0;i<L.A.length;i++){let k=0;const b=L.B[i];if(!b)k=2;else{const oa=G.regions[IDX2RID[L.A[i]]],ob=G.regions[IDX2RID[b]];if(oa&&ob&&oa.o!==ob.o)k=(me&&((oa.o===me&&foes.has(ob.o))||(ob.o===me&&foes.has(oa.o))))?3:1;}
    L.kinds.fill(k,L.start[i],L.start[i+1]);}
  gl.bindBuffer(gl.ARRAY_BUFFER,L.bK);gl.bufferSubData(gl.ARRAY_BUFFER,0,L.kinds);}
function drawLines(det,L0){const cv=$('glc');const L=L0||((vb.w/cv.width>1.25&&GLX.linesLo)?GLX.linesLo:GLX.lines);if(!L)return;gl.useProgram(L.pr);gl.disableVertexAttribArray(GLX.pLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER,L.bPQ);gl.enableVertexAttribArray(L.lPQ);gl.vertexAttribPointer(L.lPQ,4,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,L.bS);gl.enableVertexAttribArray(L.lS);gl.vertexAttribPointer(L.lS,1,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,L.bK);gl.enableVertexAttribArray(L.lK);gl.vertexAttribPointer(L.lK,1,gl.FLOAT,false,0,0);
  gl.uniform4f(L.uVB,vb.x,vb.y,vb.w,vb.h);gl.uniform2f(L.uView,cv.width,cv.height);gl.uniform1f(L.uDpr,Math.min(2,window.devicePixelRatio||1));gl.uniform1f(L.uDet,det);gl.uniform1f(L.uDet0,det);const tpp=vb.w/cv.width;gl.uniform1f(L.uZ,clamp((7-tpp)/5,.5,1));
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,L.n);gl.disable(gl.BLEND);
  gl.disableVertexAttribArray(L.lPQ);gl.disableVertexAttribArray(L.lS);gl.disableVertexAttribArray(L.lK);
  gl.useProgram(GLX.prog);gl.bindBuffer(gl.ARRAY_BUFFER,GLX.qbuf);gl.enableVertexAttribArray(GLX.pLoc);gl.vertexAttribPointer(GLX.pLoc,2,gl.FLOAT,false,0,0);}
function foeSet(){const me=P&&P.alive&&natOf(P).id;return new Set(me?warsOf(me).map(w=>enemyIn(w,me)):[]);}
let MMODE='pol';const NIDX={};Object.keys(N0).sort().forEach((k,i)=>NIDX[k]=i+1);
const ramp=t=>{t=isFinite(t)?clamp(t,0,1):0;const a=[[192,57,43],[230,126,34],[241,196,15],[120,190,60],[39,160,96]];const x=t*4,i=Math.min(3,Math.floor(x)),f=x-i;return a[i].map((v,j)=>Math.round(v+(a[i+1][j]-v)*f));};
const MODES_MAP={pol:{n:'Política',ic:'🏳️',mix:.58},ter:{n:'Terreno',ic:'🌍',mix:0},ric:{n:'Riqueza por persona',ic:'💰',mix:.72,lo:'$500',hi:'$100 mil'},pob:{n:'Densidad de población',ic:'👥',mix:.72,lo:'1/km²',hi:'5 mil/km²'},est:{n:'Estabilidad',ic:'⚖️',mix:.72,lo:'0',hi:'100'},des:{n:'Edificios',ic:'🏗️',mix:.72,lo:'0',hi:'8+'},mil:{n:'Terreno militar',ic:'⛰️',mix:.62,lo:'llano',hi:'montaña'},dip:{n:'Diplomacia',mix:.66},hap:{n:'Felicidad',mix:.7,lo:'0',hi:'100'},core:{n:'Provincias núcleo',mix:.66},ideo:{n:'Sistema de gobierno',mix:.62},dev:{n:'Desarrollo',mix:.7,lo:'0',hi:'10'}};
function provColor(id){const x=G.regions[id];switch(MMODE){
  case 'ric':return ramp((Math.log10(Math.max(1,x.gdp/x.pop))-2.7)/2.3);
  case 'pob':return ramp(Math.log10(Math.max(1,x.pop/Math.max(1,RG[id].area)))/3.7);
  case 'est':return ramp(G.nations[x.o].stab/100);
  case 'des':return ramp(bldTotal(id)/8);
  case 'dip':return dipColor(x,id);
  case 'hap':ensureProv(x);return ramp(x.hap/100);
  case 'dev':ensureProv(x);return ramp(x.dev/10);
  case 'core':return G.occ&&G.occ[id]?[220,70,70]:isCore(id,x.o)?[80,170,100]:[235,150,60];
  case 'ideo':return IDEO[ideoOf(G.nations[x.o])].col;
  case 'mil':{const t=TRN(id);if(t[1]==='d')return [222,196,120];if(t[1]==='s')return [30,110,50];if(t[1]==='f')return [225,235,245];return [[110,175,90],[205,180,90],[140,95,60]][t[0]];}
  default:return rgbOf(G.nations[(G.occ&&G.occ[id])||x.o].color);}}
function updateLut(){const d=GLX.lutData,w=GLX.ownData,foes=foeSet();for(const id in G.regions){const k=RG[id].i,x=G.regions[id],o=x.o,c=provColor(id),j=k*4,ni=NIDX[o]||0;
  d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];d[j+3]=foes.has(o)&&MMODE==='pol'?200:0;w[j]=ni&255;w[j+1]=ni>>8;w[j+2]=x.cq!=null&&G.year-x.cq<=1?255:(G.occ&&G.occ[id]?140:0);w[j+3]=255;}
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,GLX.lut);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,LUTW,LUTH,gl.RGBA,gl.UNSIGNED_BYTE,d);
  gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,GLX.own);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,LUTW,LUTH,gl.RGBA,gl.UNSIGNED_BYTE,w);}
function setMapMode(k){MMODE=k;document.querySelectorAll('.mmodes button').forEach(b=>b.classList.toggle('on',b.dataset.mm===k));const md=MODES_MAP[k];
  $('mLeg').innerHTML=md.lo?`<span>${md.n}</span><div class="lg-bar"></div><div class="lg-lab"><span>${md.lo}</span><span>${md.hi}</span></div>`:'';$('mLeg').style.display=md.lo?'block':'none';refreshMap();}
function drawGL(){const cv=$('glc');gl.viewport(0,0,cv.width,cv.height);const u=GLX.u;
  gl.uniform2f(u.view,cv.width,cv.height);gl.uniform4f(u.vb,vb.x,vb.y,vb.w,vb.h);
  gl.uniform1f(u.mix,MODES_MAP[MMODE].mix);gl.uniform1f(u.fx,mapFx()&&GLX.coastImg?1:0);gl.uniform1f(u.pulse,PULSE.v);gl.uniform1f(u.sel,G.sel&&RG[G.sel]?RG[G.sel].i:-1);gl.uniform1f(u.me,P&&RG[P.r]?RG[P.r].i:-1);
  const tpp=vb.w/cv.width,det=clamp((2.2-tpp)/1.4,0,1);gl.uniform1f(u.det,det);gl.uniform1f(u.vec,GLX.lines?1:0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  if(GLX.roads&&mapRoads()){const rd=clamp((1.5-tpp)/.9,0,1);if(rd>0)drawLines(rd,GLX.roads);}
  if(GLX.lines)drawLines(det);}
/* ----- Canvas 2D (modo ligero, media resolución) ----- */
function decodeIds(){if(IDS||!ID_IMG)return;const c=document.createElement('canvas');c.width=MW;c.height=MH;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(ID_IMG,0,0);
  const d=x.getImageData(0,0,MW,MH).data;IDS=new Uint16Array(MW*MH);for(let i=0,j=0;i<IDS.length;i++,j+=4)IDS[i]=d[j]|(d[j+1]<<8);}
function initLite(relImg){decodeIds();
  const w=MW>>1,h=MH>>1;LITE.w=w;LITE.h=h;LITE.off=document.createElement('canvas');LITE.off.width=w;LITE.off.height=h;
  const x=LITE.off.getContext('2d');x.drawImage(relImg,0,0,w,h);LITE.rel=x.getImageData(0,0,w,h).data.slice();LITE.img=x.createImageData(w,h);
  LITE.ids=new Uint16Array(w*h);for(let y=0;y<h;y++)for(let i=0;i<w;i++)LITE.ids[y*w+i]=IDS[(y*2)*MW+i*2];
  $('glc').style.display='none';$('lc').style.display='block';
}
function composeLite(){const {w,h,ids,rel,img}=LITE,o=img.data,foes=foeSet();const col=new Uint8Array((MAP.N+1)*4),own=new Uint16Array(MAP.N+1),occ=new Uint8Array(MAP.N+1),mx=MODES_MAP[MMODE].mix;
  for(const id in G.regions){const k=RG[id].i,n=G.regions[id].o,c=provColor(id);col.set([c[0],c[1],c[2],foes.has(n)&&MMODE==='pol'?1:0],k*4);own[k]=NIDX[n]||0;if(G.occ&&G.occ[id])occ[k]=1;}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=i*4,id=ids[i];
    if(!id){const land=(x+1<w&&ids[i+1])||(y+1<h&&ids[i+w])||(x>0&&ids[i-1])||(y>0&&ids[i-w]);const f=land?.5:.95;o[j]=rel[j]*f;o[j+1]=rel[j+1]*f;o[j+2]=rel[j+2]*f;o[j+3]=255;continue;}
    const c=id*4,lum=(rel[j]*.3+rel[j+1]*.59+rel[j+2]*.11)/255,s=.5+.75*lum;
    let r=rel[j]*(1-mx)+col[c]*s*mx,g=rel[j+1]*(1-mx)+col[c+1]*s*mx,b=rel[j+2]*(1-mx)+col[c+2]*s*mx;
    if(col[c+3]){r=r*.8+242*.2;g=g*.8+64*.2;b=b*.8+64*.2;}
    if(occ[id]&&((x+y)>>1)%2===0){r*=.55;g*=.55;b*=.55;}
    const nr=x+1<w?ids[i+1]:0,nd=y+1<h?ids[i+w]:0;
    if((nr!==id&&(nr===0||own[nr]!==own[id]))||(nd!==id&&(nd===0||own[nd]!==own[id]))){r=r*.25+13*.75;g=g*.25+15*.75;b=b*.25+20*.75;}
    else if(nr!==id||nd!==id){r*=.8;g*=.8;b*=.8;}
    o[j]=r;o[j+1]=g;o[j+2]=b;o[j+3]=255;}
  LITE.off.getContext('2d').putImageData(img,0,0);}
function drawLite(){const cv=$('lc'),x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#08141f';x.fillRect(0,0,cv.width,cv.height);
  // recorta el rectángulo fuente a la imagen (Safari no acepta rectángulos fuera de rango)
  const sx0=Math.max(0,vb.x),sy0=Math.max(0,vb.y),sx1=Math.min(MW,vb.x+vb.w),sy1=Math.min(MH,vb.y+vb.h);if(sx1<=sx0||sy1<=sy0)return;
  const k=cv.width/vb.w;x.drawImage(LITE.off,sx0/2,sy0/2,(sx1-sx0)/2,(sy1-sy0)/2,(sx0-vb.x)*k,(sy0-vb.y)*k,(sx1-sx0)*k,(sy1-sy0)*k);
  // carreteras en modo ligero: solo las visibles y solo al acercar
  const tpp=vb.w/cv.width;if(typeof ROADS_B64!=='undefined'&&mapRoads()&&tpp<1.3){if(!LITE.roads)LITE.roads=decodeRoads();const minor=tpp<.9;x.lineCap='round';
    for(const pass of [4,5]){if(pass===5&&!minor)continue;x.beginPath();x.strokeStyle=pass===4?'rgba(92,48,20,.6)':'rgba(77,51,31,.4)';x.lineWidth=(pass===4?1.3:.8)*Math.min(2,window.devicePixelRatio||1);
      for(const r of LITE.roads){if(r.k!==pass||r.b[2]<vb.x||r.b[0]>vb.x+vb.w||r.b[3]<vb.y||r.b[1]>vb.y+vb.h)continue;const p=r.p;x.moveTo((p[0]-vb.x)*k,(p[1]-vb.y)*k);for(let i=2;i<p.length;i+=2)x.lineTo((p[i]-vb.x)*k,(p[i+1]-vb.y)*k);}x.stroke();}}}
function decodeRoads(){const s=atob(ROADS_B64),u8=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u8[i]=s.charCodeAt(i);const bin=u8.buffer;const h=new Uint32Array(bin,0,2),nA=h[0],nP=h[1];let off=8;
  const A=new Uint16Array(bin,off,nA);off+=nA*4;const N=new Uint32Array(bin,off,nA);off+=nA*4;const P=new Uint16Array(bin,off,nP*2);const out=[];let q=0;
  for(let i=0;i<nA;i++){const p=new Float32Array(N[i]*2);let a=1e9,b=1e9,c=-1e9,d=-1e9;for(let j=0;j<N[i];j++){const X=P[(q+j)*2]/16,Y=P[(q+j)*2+1]/16;p[j*2]=X;p[j*2+1]=Y;if(X<a)a=X;if(X>c)c=X;if(Y<b)b=Y;if(Y>d)d=Y;}q+=N[i];out.push({k:A[i],p,b:[a,b,c,d]});}return out;}
/* ----- común ----- */
function fitCanvas(){const w=wrap(),dpr=Math.min(2,window.devicePixelRatio||1);const cw=Math.round(w.clientWidth*dpr),ch=Math.round(w.clientHeight*dpr);
  ['glc','lc'].forEach(id=>{const c=$(id);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}});
  const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2;vb.h=vb.w*w.clientHeight/Math.max(1,w.clientWidth);vb.y=cy-vb.h/2;vb.x=cx-vb.w/2;}
function setVB(){vb.w=clamp(vb.w,ZMIN,MW*1.1);vb.h=vb.w*wrap().clientHeight/Math.max(1,wrap().clientWidth);
  vb.x=clamp(vb.x,-vb.w*.4,MW-vb.w*.6);vb.y=clamp(vb.y,-vb.h*.4,MH-vb.h*.6);$('mapOv').setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);requestDraw();}
const PULSE={v:0,t0:0,on:false};
function pulseConquests(){if(mapMode!=='gl'||!G)return;let any=false;for(const id in G.regions)if(G.regions[id].cq===G.year){any=true;break;}if(!any)return;PULSE.t0=performance.now();if(!PULSE.on){PULSE.on=true;requestAnimationFrame(pulseStep);}}
function pulseStep(t){const e=(t-PULSE.t0)/2600;if(e>=1){PULSE.v=0;PULSE.on=false;requestDraw();return;}PULSE.v=Math.sin(e*Math.PI*4)**2*(1-e);if(mapMode==='gl')drawGL();requestAnimationFrame(pulseStep);}
/* zoom y centrado animados */
let TW=null;function tweenVB(x,y,w,ms){const s={x:vb.x,y:vb.y,w:vb.w},t0=performance.now();ms=ms||320;const go=t=>{const e=Math.min(1,(t-t0)/ms),k=1-Math.pow(1-e,3);vb.w=s.w+(w-s.w)*k;vb.x=s.x+(x-s.x)*k;vb.y=s.y+(y-s.y)*k;setVB();if(e<1)TW=requestAnimationFrame(go);else{TW=null;drawOverlay();}};if(TW)cancelAnimationFrame(TW);TW=requestAnimationFrame(go);}
function requestDraw(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!mapReady)return;if(mapMode==='gl')drawGL();else drawLite();});}
function refreshMap(){if(!mapReady||!G)return;if(mapMode==='gl'){updateLut();updateBorders();}else composeLite();drawOverlay();setVB();}
function centerOn(id,w,anim){const r=RG[id];if(!r)return;const h=w*wrap().clientHeight/Math.max(1,wrap().clientWidth);if(anim&&mapReady){tweenVB(r.c[0]-w/2,r.c[1]-h/2,w);return;}vb.w=w;vb.h=h;vb.x=r.c[0]-w/2;vb.y=r.c[1]-vb.h/2;setVB();}
function pickAt(clientX,clientY){decodeIds();const b=wrap().getBoundingClientRect();const mx=Math.floor(vb.x+(clientX-b.left)/b.width*vb.w),my=Math.floor(vb.y+(clientY-b.top)/b.height*vb.h);
  if(!IDS||mx<0||my<0||mx>=MW||my>=MH)return null;let k=IDS[my*MW+mx];
  if(!k){const r=Math.max(2,Math.round(upp()*6));for(let d=1;d<=r&&!k;d++)for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){const x=mx+dx,y=my+dy;if(x>=0&&y>=0&&x<MW&&y<MH&&IDS[y*MW+x]){k=IDS[y*MW+x];break;}}}
  return k?IDX2RID[k]:null;}
let LBL=null,NL=null;
/* v1.0: nombres de país curvos — eje principal de las provincias del bloque más grande, curva cuadrática ajustada */
function natLabels(){const key=(G._ov||0)+'|'+G.year;if(NL&&NL.k===key)return NL.L;const own={};for(const id in G.regions){const o=G.regions[id].o;(own[o]||(own[o]=[])).push(id);}
  const L=[];for(const o in own){const n=G.nations[o];if(!n||!n.alive)continue;const rs=own[o],set=new Set(rs),seen=new Set();let best=null,bA=0;
    for(const r of rs){if(seen.has(r))continue;const comp=[],st=[r];seen.add(r);while(st.length){const x=st.pop();comp.push(x);for(const y of RG[x].adj)if(set.has(y)&&!seen.has(y)){seen.add(y);st.push(y);}}const A=comp.reduce((s,x)=>s+RG[x].a,0);if(A>bA){bA=A;best=comp;}}
    let sw=0,mx=0,my=0;for(const r of best){const w=RG[r].a,c=RG[r].c;sw+=w;mx+=w*c[0];my+=w*c[1];}mx/=sw;my/=sw;let cxx=0,cyy=0,cxy=0;
    for(const r of best){const w=RG[r].a,c=RG[r].c,dx=c[0]-mx,dy=c[1]-my,v=w*w/(4*Math.PI);cxx+=w*dx*dx+v;cyy+=w*dy*dy+v;cxy+=w*dx*dy;}cxx/=sw;cyy/=sw;cxy/=sw;
    let th=.5*Math.atan2(2*cxy,cxx-cyy);th=clamp(th,-.9,.9);const ex=Math.cos(th),ey=Math.sin(th),fx=-ey,fy=ex;
    let t0=1e9,t1=-1e9;const T=[];for(const r of best){const c=RG[r].c,dx=c[0]-mx,dy=c[1]-my,t=dx*ex+dy*ey,s_=dx*fx+dy*fy,rr=Math.sqrt(RG[r].a/Math.PI)*.85;T.push([t,s_,RG[r].a]);if(t-rr<t0)t0=t-rr;if(t+rr>t1)t1=t+rr;}
    const len=t1-t0,tm=(t0+t1)/2,wid=bA/Math.max(1,len);
    // s(t)=k0+k1 t+k2 t² por mínimos cuadrados ponderados
    let k0=0,k1=0,k2=0;if(T.length>=4){let S=[[0,0,0],[0,0,0],[0,0,0]],Y=[0,0,0];for(const [t,s_,w] of T){const v=[1,t-tm,(t-tm)*(t-tm)];for(let i=0;i<3;i++){Y[i]+=w*v[i]*s_;for(let j=0;j<3;j++)S[i][j]+=w*v[i]*v[j];}}
      const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);const D=det(S);
      if(Math.abs(D)>1e-9){const sol=[0,1,2].map(i=>det(S.map((row,ri)=>row.map((v,ci)=>ci===i?Y[ri]:v)))/D);[k0,k1,k2]=sol;}}
    const h=len*.45;k2=clamp(k2,-.32*wid/Math.max(1,h*h),.32*wid/Math.max(1,h*h));k1=clamp(k1,-.25,.25);k0=clamp(k0,-.3*wid,.3*wid);
    const pts=[];for(let i=0;i<=10;i++){const t=-h+2*h*i/10,s_=k0+k1*t+k2*t*t,T_=tm+t;pts.push([mx+T_*ex+s_*fx,my+T_*ey+s_*fy]);}
    L.push({o,pts,len:2*h,wid,A:bA,c:[mx+tm*ex+k0*fx,my+tm*ey+k0*fy]});}
  L.sort((a,b)=>b.A-a.A);NL={k:key,L};return L;}
const XL='http://www.w3.org/1999/xlink';
function drawOverlay(){
  const ov=$('mapOv');ov.innerHTML='';if(!G)return;const u=upp(),fs=11*u;
  const me=P&&natOf(P).id;const x0=vb.x,x1=vb.x+vb.w,y0=vb.y,y1=vb.y+vb.h;const inV=(x,y,m)=>x>x0-m&&x<x1+m&&y>y0-m&&y<y1+m;
  const boxes=[];const free=(x,y,w,h)=>{if(boxes.some(b=>x<b[0]+b[2]&&b[0]<x+w&&y<b[1]+b[3]&&b[1]<y+h))return false;boxes.push([x,y,w,h]);return true;};
  const placed=[];
  const defs=el('defs',{},ov),gN=el('g',{},ov),gP=el('g',{},ov),gR=el('g',{},ov),gC=el('g',{},ov);let li=0;
  // nombres de país
  const labs=natLabels().slice().sort((a,b)=>(b.o===me)-(a.o===me)||b.A-a.A);
  for(const lb of labs){const n=G.nations[lb.o];const name=n.name.split(' (')[0].toUpperCase(),nc=name.length;
    let f=Math.min(lb.wid*.42,lb.len/(nc*.78));const sc=f/u;if(sc<8.5){if(lb.o!==me)continue;f=8.5*u;}
    if(lb.len>vb.w*1.15)continue;const big=Math.min(f,64*u);const bx=lb.pts.map(p=>p[0]),by=lb.pts.map(p=>p[1]);const mnx=Math.min(...bx)-big*.5,mxx=Math.max(...bx)+big*.5,mny=Math.min(...by)-big*.6,mxy=Math.max(...by)+big*.6;
    if(mxx<x0||mnx>x1||mxy<y0||mny>y1)continue;const hr=big*.5;if(placed.some(q=>q.p.some(a=>lb.pts.some(b=>Math.abs(a[0]-b[0])<q.r+hr&&Math.abs(a[1]-b[1])<q.r+hr))))continue;placed.push({p:lb.pts,r:hr});
    f=big;const ls=clamp((lb.len*.96-nc*.68*f)/Math.max(1,nc-1),f*.04,f*1.5);const op=f/u>48?.5:f/u>28?.72:.92;
    const id='nl'+(li++);el('path',{id,d:'M'+lb.pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')},defs);
    const t=el('text',{'font-size':f.toFixed(2),'letter-spacing':ls.toFixed(2),fill:'#f8f4e8','fill-opacity':op,stroke:'rgba(10,14,22,.72)','stroke-opacity':op,'stroke-width':(f*.13).toFixed(2),'paint-order':'stroke','font-family':'Georgia,"Times New Roman",serif','font-weight':700,'dominant-baseline':'central'},gN);
    const tp=el('textPath',{href:'#'+id,startOffset:'50%','text-anchor':'middle'},t);tp.setAttributeNS(XL,'xlink:href','#'+id);tp.textContent=name;
    if(sc>=8.5&&f/u<40){const c=lb.c;boxes.push([c[0]-lb.len*.4,c[1]-f*.6,lb.len*.8,f*1.2]);}}
  // nombres de provincia: más al acercar
  if(u<1.7){const minA=u<.5?600:u<.8?1100:u<1.2?1700:2400;let k=0;const list=[];for(const id in RG){const r=RG[id];if(r.a/(u*u)<minA||!inV(r.c[0],r.c[1],0))continue;list.push(id);}
    list.sort((a,b)=>RG[b].a-RG[a].a);for(const id of list){if(k>=80)break;const c=RG[id].c,nm=RG[id].nm.length>22?RG[id].nm.slice(0,20)+'…':RG[id].nm,pf=fs*.8,tw=nm.length*pf*.52;
      if(!free(c[0]-tw/2,c[1]+fs*.55,tw,pf*1.05))continue;k++;const t=el('text',{x:c[0],y:c[1]+fs*1.25,'text-anchor':'middle','font-size':pf,'font-style':'italic','font-family':'Georgia,serif',fill:'#eef1f5','paint-order':'stroke',stroke:'rgba(8,14,22,.78)','stroke-width':fs*.2},gP);t.textContent=nm;}}
  // iconos de edificios y puertos al acercar
  if(u<1.05&&typeof BLD!=='undefined'){const ORD=['puerto','fort','fab','armeria','torre','sumi','granja','taller','biblio','hosp','esc','carr'];let k=0;
    for(const id in G.regions){const x=G.regions[id];if(!x.b||k>=90)continue;const c=RG[id].c;if(!inV(c[0],c[1],0))continue;
      const ks=Object.keys(x.b).filter(b=>x.b[b]>0&&BLD[b]).sort((a,b)=>((ORD.indexOf(a)+99)%99)-((ORD.indexOf(b)+99)%99)).slice(0,u<.6?4:3);if(!ks.length)continue;
      const isz=fs*(u<.6?1.05:.95),w=ks.length*isz*1.1+isz*.3,bx=c[0]-w/2,by=c[1]-isz*2.15;if(!free(bx,by,w,isz*1.25))continue;k++;
      el('rect',{x:bx,y:by,width:w,height:isz*1.25,rx:isz*.35,fill:'rgba(12,18,26,.62)',stroke:'rgba(242,193,78,.55)','stroke-width':u*.8},gR);
      ks.forEach((b,i)=>{const t=el('text',{x:bx+isz*.15+i*isz*1.1+isz*.55,y:by+isz*.98,'text-anchor':'middle','font-size':isz*.92},gR);t.textContent=BLD[b].ic;
        if(x.b[b]>1){const q=el('text',{x:bx+isz*.15+i*isz*1.1+isz*1.02,y:by+isz*1.18,'text-anchor':'end','font-size':isz*.45,'font-weight':800,fill:'#ffe9a8','paint-order':'stroke',stroke:'#0b1118','stroke-width':u*.6},gR);q.textContent=x.b[b];}});}}
  // ciudades: más pequeñas y más numerosas al acercar
  if(typeof CITIES!=='undefined'){const minPop=u>3?5e6:u>1.6?1.5e6:u>.9?4e5:u>.6?1.2e5:u>.38?3.5e4:0,cap=u<.6?120:u<1?70:45;let shown=0;
    for(const c of CITIES){if(shown>=cap)break;if(c[2]<minPop&&!(c[4]===2&&u<4))continue;if(!inV(c[0],c[1],0))continue;
      const cf=fs*(c[4]===2?.86:c[2]>1e6?.8:.72),tw=c[3].length*cf*.55;if(!free(c[0]+cf*.5,c[1]-cf*.6,tw,cf*1.1))continue;shown++;
      if(c[4]===2)el('path',{d:`M${c[0]} ${c[1]-cf*.62}l${cf*.18} ${cf*.4}h${cf*.42}l-${cf*.34} ${cf*.26}l${cf*.13} ${cf*.42}l-${cf*.39}-${cf*.26}l-${cf*.39} ${cf*.26}l${cf*.13}-${cf*.42}l-${cf*.34}-${cf*.26}h${cf*.42}z`,fill:'#f2c14e',stroke:'#2a1c04','stroke-width':cf*.08},gC);
      else if(c[2]>1e6)el('rect',{x:c[0]-cf*.24,y:c[1]-cf*.24,width:cf*.48,height:cf*.48,fill:'#fff',stroke:'#0b1520','stroke-width':cf*.1},gC);
      else el('circle',{cx:c[0],cy:c[1],r:cf*(c[2]>2e5?.22:.17),fill:c[4]?'#fff':'#e8edf3',stroke:'#0b1520','stroke-width':cf*.1},gC);
      const t=el('text',{x:c[0]+cf*.55,y:c[1]+cf*.32,'font-size':cf,fill:c[4]===2?'#ffe9a8':'#f1f4f8','font-weight':c[4]===2?700:c[2]>1e6?600:500,'paint-order':'stroke',stroke:'rgba(8,14,22,.85)','stroke-width':cf*.26},gC);t.textContent=c[3];}}
  if(mapMode==='lite'&&G.sel&&RG[G.sel]){const c=RG[G.sel].c;el('circle',{cx:c[0],cy:c[1],r:6*u,fill:'none',stroke:'#fff','stroke-width':2*u},ov);}
  if(P&&RG[P.r]){const c=RG[P.r].c;el('circle',{cx:c[0],cy:c[1],r:4*u,fill:'#f2c14e',stroke:'#1a1405','stroke-width':1.5*u},ov);}
  if(typeof drawArmies==='function')drawArmies(ov,u);
}
/* arrastrar, pellizcar, rueda, tocar */
(function(){const w=wrap();const pts=new Map();let down=null,moved=false,pinch=null,lastU=0;
  w.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom,.mmodes,.mleg'))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});w.setPointerCapture(e.pointerId);
    if(pts.size===1){down={x:e.clientX,y:e.clientY,vx:vb.x,vy:vb.y};moved=false;}
    else if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),w:vb.w,cx:vb.x+vb.w/2,cy:vb.y+vb.h/2};moved=true;}});
  w.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);vb.w=clamp(pinch.w*pinch.d/Math.max(d,1),ZMIN,MW*1.1);vb.h=vb.w*w.clientHeight/w.clientWidth;vb.x=pinch.cx-vb.w/2;vb.y=pinch.cy-vb.h/2;setVB();return;}
    if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;if(moved){const s=upp();vb.x=down.vx-dx*s;vb.y=down.vy-dy*s;setVB();}});
  const end=e=>{const wasPinch=!!pinch;if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
    if(!moved&&down&&e.type==='pointerup'){const now=performance.now();if(now-(w._lt||0)<300){w._lt=0;const b=w.getBoundingClientRect();const mx=vb.x+(e.clientX-b.left)/b.width*vb.w,my=vb.y+(e.clientY-b.top)/b.height*vb.h;const nw=clamp(vb.w*.5,ZMIN,MW*1.1),nh=nw*w.clientHeight/w.clientWidth;tweenVB(mx-nw/2,my-nh/2,nw,260);}w._lt=now;const id=pickAt(e.clientX,e.clientY);if(id&&G){if(typeof onMapPick==='function'&&onMapPick(id))return;G.sel=id;requestDraw();drawOverlay();renderSel();}}
    if(pts.size<2)pinch=null;if(!pts.size){down=null;if(wasPinch)drawOverlay();}};
  w.addEventListener('pointerup',end);w.addEventListener('pointercancel',end);
  let wT=0;w.addEventListener('wheel',e=>{e.preventDefault();const b=w.getBoundingClientRect(),f=e.deltaY>0?1.15:1/1.15;const mx=vb.x+(e.clientX-b.left)/b.width*vb.w,my=vb.y+(e.clientY-b.top)/b.height*vb.h;const nw=clamp(vb.w*f,ZMIN,MW*1.1),k=nw/vb.w;vb.x=mx-(mx-vb.x)*k;vb.y=my-(my-vb.y)*k;vb.w=nw;setVB();clearTimeout(wT);wT=setTimeout(drawOverlay,120);},{passive:false});
  window.addEventListener('resize',()=>{if(!mapReady)return;fitCanvas();setVB();drawOverlay();});
})();
function zoomBy(f,anim){const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2;const w=clamp(vb.w*f,ZMIN,MW*1.1),h=w*wrap().clientHeight/wrap().clientWidth;if(anim){tweenVB(cx-w/2,cy-h/2,w,240);return;}vb.w=w;vb.h=h;vb.x=cx-vb.w/2;vb.y=cy-vb.h/2;setVB();drawOverlay();}
$('zIn').onclick=()=>zoomBy(.7,1);$('zOut').onclick=()=>zoomBy(1/.7,1);
$('zReset').onclick=()=>{if(P)centerOn(P.r,1100,1);else tweenVB(0,0,MW);};
document.querySelectorAll('.mmodes button').forEach(b=>b.onclick=e=>{e.stopPropagation();setMapMode(b.dataset.mm);});
$('zFull').onclick=()=>{document.body.classList.toggle('mapfull');fitCanvas();setVB();drawOverlay();};
