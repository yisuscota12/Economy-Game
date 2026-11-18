# v1.7m (B6 parte 2, diálogos): recorre en pantalla cada diálogo de DLG (engine_v12b.js) y comprueba la traducción.
#   python3 herramientas/pw_b6p2_dialogos.py imperio.html <idiomas…>
# Por idioma: partida en Argentina (se fija la edad en 35, con empleo, negocio, pareja, 2 hijos, hermana, padres, amigo, jefe, rival y
# P.ruler en los diálogos de categoría «gobierno»). Para cada diálogo se recorren sus nodos a lo ancho (hasta 4 pasos):
#  1) en cada nodo: showDialog(), se espera a la capa y se lee el modal; cuenta como «español» el texto del nodo o de un
#     botón que sigue idéntico al original y la capa no lo traduce (las traducciones idénticas al español no cuentan).
#  2) para cada opción, dos veces (dado forzado a éxito y a fallo con Math.random si la opción tiene tirada): se elige, se muestra la
#     pantalla de resultado y se revisa el texto del resultado, los efectos y la línea del registro «💬 …».
# Los diálogos cuyo arranque necesita datos que la partida no tiene (npc ausente o excepción) se cuentan aparte.
import asyncio,os,sys,re,glob
from playwright.async_api import async_playwright
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src')
# solo los diálogos de engine_v12b.js (bloque «dialogos»); los de box, fútbol y fama son de la v1.7n
IDS=re.findall(r"D_\(\{id:'([a-z0-9_]+)'",open(R+'/engine_v12b.js',encoding='utf8').read())
URL='file://'+os.path.abspath(sys.argv[1]);LS=[a for a in sys.argv[2:] if not a.startswith('--')];NES=int(os.environ.get('NES','15'))
JS=r"""async([IG,IG2])=>{
 const IGR=IG.map(x=>new RegExp(x));const same=s=>IGR.some(r=>r.test(s));
 const W=()=>new Promise(r=>setTimeout(r,0));const L=/[a-záéíóúñ]{3}/i;const strip=s=>String(s||'').replace(/<[^>]+>/g,'').trim();
 const es=s=>{s=strip(s);if(!s||same(s)||I18.T(s)!==s)return false;return L.test(s.replace(/[A-ZÁÉÍÓÚÑ][A-Za-záéíóúñü]*/g,''));};
 dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();
 const mk=(k,role,name,sex,age)=>({k,role,name,sex,age,rel:60,alive:true,id:Math.random()});
 P.ppl=P.ppl||[];P.ppl.push(mk('padre','Madre','María','F',62),mk('padre','Padre','Juan','M',64),mk('amigo','Amigo','Carla','F',36),mk('jefe','Jefe','Raúl','M',50),mk('rival','Rival','Diego','M',38));
 const kd=(name,sex,age)=>({name,sex,age,rel:60,alive:true});
 P.children=(P.children||[]).concat([kd('Lucía','F',12),kd('Tomás','M',16)]);P.siblings=(P.siblings||[]).concat([kd('Paula','F',33)]);
 if(!P.partner)P.partner=Object.assign(kd('Sofía','F',34),{s:{}});
 P.age=35;P.parents=[Object.assign(kd('Juan','M',72),{role:'Padre'}),Object.assign(kd('María','F',70),{role:'Madre'})];P.ppl.push(Object.assign(mk('amigo','Amigo','Andrés','M',40),{fav:2}),Object.assign(mk('amigo','Amigo','Elena','F',41),{ren:3,renWhy:'no fuiste a su boda'}));
 P.money=Math.max(P.money||0,200000);try{P.job=P.job||{name:'Oficinista',o:'4',k:1,bonus:1};P.career=P.career||{};P.career.years=5;}catch(e){}
 try{if(!P.biz)P.biz={lvl:1,type:0,luck:1,r:P.r};}catch(e){}
 const base0=JSON.stringify(P);P.ruler=true;const baseR=JSON.stringify(P);P=JSON.parse(base0);let base=base0;
 const IDS=new Set(IG2);
 const MR=Math.random;let force=null;const setF=f=>{force=f;Math.random=f==null?MR:(f===1?()=>0:()=>0.99999);};
 const realLog=log;let line=null;
 const out={n:0,start:0,skip:[],nodes:0,res:0,esNode:[],esRes:[],errs:[]};
 // arranca d y repite el camino de opciones [[i,forz],…]; devuelve false si no se pudo
 const replay=(d,path)=>{P=JSON.parse(base);P.dlg=null;setF(null);if(!startDialog(P,d,{py:.05,roll:40}))return false;
   for(const [i,f] of path){setF(f);const r=dlgChoose(i);setF(null);if(!r)return false;dlgNext();if(!P.dlg)return false;}return true;};
 for(const d of DLG){if(!IDS.has(d.id))continue;out.n++;base=d.cat==='gobierno'?baseR:base0;
   let ok=false;try{ok=replay(d,[]);}catch(x){out.skip.push(d.id+' ('+x.message.slice(0,40)+')');continue;}
   if(!ok){out.skip.push(d.id);continue;}out.start++;
   const Q=[[]],seen=new Set();
   while(Q.length){const path=Q.shift();
     try{if(!replay(d,path))continue;}catch(x){out.errs.push(d.id+' '+x.message);continue;}
     const node=P.dlg.node;if(seen.has(node))continue;seen.add(node);out.nodes++;
     let V;try{V=dlgNode(P);}catch(x){out.errs.push(d.id+'/'+node+': '+x.message);continue;}
     try{showDialog();}catch(x){out.errs.push(d.id+'/'+node+' show: '+x.message);continue;}
     await W();await W();
     const txt=(document.querySelector('#modal')||{}).innerText||'';
     const bad=[V.txt,d.title,...V.opts.map(o=>o.t),...V.opts.filter(o=>!o.ok).map(o=>o.lock)].filter(s=>es(s)&&txt.includes(strip(s)));
     if(bad.length)out.esNode.push([d.id+'/'+node,strip(bad[0])]);
     hideModal();
     for(const o of V.opts){if(!o.ok)continue;
       for(const f of (o.k?[1,100]:[null])){
         try{if(!replay(d,path))continue;}catch(x){continue;}
         let r;line=null;log=(t)=>{line=t;realLog(t);};
         try{setF(f);r=dlgChoose(o.i);setF(null);}catch(x){setF(null);log=realLog;out.errs.push(d.id+'/'+node+'#'+o.i+': '+x.message);continue;}
         log=realLog;if(!r)continue;out.res++;
         try{showDialog();}catch(x){out.errs.push(d.id+'/'+node+'#'+o.i+' res: '+x.message);}
         await W();await W();const rt=(document.querySelector('#modal')||{}).innerText||'';hideModal();
         const cand=[r.t,...(r.fx||[]),line?line.replace(/^💬\s*/,''):null].filter(s=>s&&es(s));
         const shown=cand.find(s=>rt.includes(strip(s))||s===line||(line&&line.includes(strip(s))));
         if(cand.length)out.esRes.push([d.id+'/'+node+'#'+o.i+(f?'/'+(f===1?'ok':'ko'):''),strip(shown||cand[0])]);
         if(r.to&&!seen.has(r.to)&&path.length<4)Q.push(path.concat([[o.i,f]]));
       }}
   }
 }
 setF(null);P=JSON.parse(base0);P.dlg=null;return out;}"""
def iguales(L):
    I=os.path.join(os.path.dirname(os.path.abspath(__file__)),'i18n','b6p2');ES={}
    for f in glob.glob(I+'/*_es.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==3:ES[p[0]]=p[2]
    o=[]
    for f in glob.glob(I+f'/*_{L}.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==2 and p[0] in ES and ES[p[0]]==p[1]:o.append('^'+re.escape(p[1]).replace('\\{0\\}','.+').replace('\\{1\\}','.+')+'$')
    return o
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();m.querySelector('#sA').value='35';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    o=await pg.evaluate(JS,[iguales(L),IDS])
    print(f"{L}: {o['n']} diálogos · iniciados {o['start']} · sin datos {len(o['skip'])} · nodos {o['nodes']} · resultados {o['res']} · nodos con español {len(o['esNode'])} · resultados con español {len(o['esRes'])} · errores JS {len(o['errs'])+len(errs)}")
    for x in o['esNode'][:NES]:print('   nodo:',x[0],'|',x[1][:110])
    for x in o['esRes'][:NES]:print('   resultado:',x[0],'|',x[1][:110])
    for x in (o['errs']+errs)[:6]:print('   error:',x[:140])
    if o['skip']:print('   sin datos:',' '.join(o['skip'][:20]))
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for L in LS:await run(b,L)
        await b.close()
asyncio.run(main())
