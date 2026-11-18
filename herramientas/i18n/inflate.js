/* v1.7p: descompresor deflate «raw» (RFC 1951), síncrono y sin dependencias. Lo usa data_i18n.js para abrir solo el diccionario del idioma activo.
   inflateRaw(src: Uint8Array, n: tamaño de salida) → Uint8Array. Decodificación canónica de Huffman como en «puff» de zlib. */
function inflateRaw(s,n){const o=new Uint8Array(n);let op=0,ip=0,bb=0,bn=0;
  const bits=k=>{while(bn<k){bb|=s[ip++]<<bn;bn+=8;}const v=bb&((1<<k)-1);bb>>>=k;bn-=k;return v;};
  const mk=(L,N)=>{const c=new Uint16Array(16),f=new Uint16Array(16),y=new Uint16Array(N);for(let i=0;i<N;i++)c[L[i]]++;c[0]=0;for(let i=1;i<16;i++)f[i]=f[i-1]+c[i-1];for(let i=0;i<N;i++)if(L[i])y[f[L[i]]++]=i;return [c,y];};
  const dec=t=>{let code=0,first=0,idx=0;const c=t[0];for(let l=1;l<16;l++){code|=bits(1);const k=c[l];if(code-k<first)return t[1][idx+code-first];idx+=k;first+=k;first<<=1;code<<=1;}throw new Error('inflate: código inválido');};
  const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  let FL=null,FD=null;
  for(let last=0;!last;){last=bits(1);const ty=bits(2);
    if(ty===0){bb=0;bn=0;const len=s[ip]|s[ip+1]<<8;ip+=4;o.set(s.subarray(ip,ip+len),op);ip+=len;op+=len;continue;}
    let lt,dt;
    if(ty===1){if(!FL){const L=new Uint8Array(288);L.fill(8,0,144);L.fill(9,144,256);L.fill(7,256,280);L.fill(8,280,288);FL=mk(L,288);FD=mk(new Uint8Array(30).fill(5),30);}lt=FL;dt=FD;}
    else if(ty===2){const nl=bits(5)+257,nd=bits(5)+1,nc=bits(4)+4;const ORD=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];const CL=new Uint8Array(19);for(let i=0;i<nc;i++)CL[ORD[i]]=bits(3);const ct=mk(CL,19);
      const L=new Uint8Array(nl+nd);for(let i=0;i<nl+nd;){const y=dec(ct);if(y<16)L[i++]=y;else{let r,v=0;if(y===16){v=L[i-1];r=3+bits(2);}else if(y===17)r=3+bits(3);else r=11+bits(7);while(r--)L[i++]=v;}}
      lt=mk(L.subarray(0,nl),nl);dt=mk(L.subarray(nl),nd);}
    else throw new Error('inflate: bloque inválido');
    for(;;){const y=dec(lt);if(y<256)o[op++]=y;else if(y===256)break;else{const a=y-257,len=LB[a]+bits(LE[a]),d=dec(dt),dist=DB[d]+bits(DE[d]);for(let k=0;k<len;k++,op++)o[op]=o[op-dist];}}}
  return o;}
if(typeof module!=='undefined')module.exports={inflateRaw};
