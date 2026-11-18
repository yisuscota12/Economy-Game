# v1.7i (B6). Verifica que la Guía y las burbujas ⓘ se muestran en pantalla tal como están traducidas (la capa de nodos no las altera)
# y que no queda español. Uso: python3 herramientas/pw_b6.py imperio.html en pt fr …
import asyncio,sys,os,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1])
JS="""async()=>{const tick=()=>new Promise(r=>setTimeout(r,0));const N=s=>s.replace(/\\uFE0F/g,'').replace(/\\s+/g,' ').trim(); /* v1.7q: con íconos vectoriales se quita el selector U+FE0F en pantalla (ui_v16f.js); no es una alteración del texto */
 const plain=h=>{const d=document.createElement('div');d.innerHTML=h;return N(d.textContent);};
 const bad=[];closeSheet();hideModal();showGuide();await tick();await tick();
 const gb=[...document.querySelectorAll('#sheetIn .guia .gb')];
 gb.forEach((e,i)=>{const exp=plain(GUIA[i][1]),got=N(e.textContent);if(exp!==got)bad.push(['guia',i,exp.slice(0,90),got.slice(0,90)]);});
 closeSheet();let nh=0;
 for(let i=0;i<HELP.length;i++){hlpShow(i,null);await tick();await tick();const d=document.getElementById('hlp');
   const pw=d.querySelector('p.w'),pg=d.querySelector('p.g');const bw=pw.querySelector('b'),bg=pg.querySelector('b');
   const gw=N(pw.textContent.slice(bw.textContent.length)),gg=N(pg.textContent.slice(bg.textContent.length));
   const ew=plain(HELP[i][2]),eg=plain(HELP[i][3]);nh++;
   if(gw!==ew)bad.push(['help-w',i,ew.slice(0,90),gw.slice(0,90)]);if(gg!==eg)bad.push(['help-g',i,eg.slice(0,90),gg.slice(0,90)]);
   if(i<3)bad.push(['label',i,bw.textContent,bg.textContent]);}
 hlpHide();
 const sp=/\\b(los|las|del|para|por|tus|años|días|también|está|según)\\b|[ñ¿¡]/i;
 const OK={pt:['para','por'],it:['del','per'],id:['para'],fr:[],tr:[]}[LANG]||[];const es=[];const chk=(k,i,t)=>{const m=t.match(new RegExp(sp.source,'gi'));const mm=(m||[]).filter(w=>!OK.includes(w.toLowerCase()));if(mm.length)es.push([k,i,mm.slice(0,4).join(','),t.slice(Math.max(0,t.search(mm[0])-30),t.search(mm[0])+30)]);};GUIA.forEach((g,i)=>chk('guia',i,plain(g[1])));HELP.forEach((h,i)=>chk('help',i,plain(h[2])+' '+plain(h[3])));
 return {n:gb.length,nh,bad,es};}"""
async def run(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896},locale='es-MX');errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');m.querySelector('#sP').value='MEX';m.querySelector('#sA').value='18';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();render();}")
    r=await pg.evaluate(JS)
    lab=[x for x in r['bad'] if x[0]=='label'];bad=[x for x in r['bad'] if x[0]!='label']
    print(f"{L}: guía {r['n']} temas · ⓘ {r['nh']} · alterados {len(bad)} · con español {len(r['es'])} · etiquetas {lab[0][2]!r} / {lab[0][3]!r} · errores {errs[:3]}")
    for x in bad[:6]:print('   ',x)
    for x in r['es'][:6]:print('   es?',x)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        for L in sys.argv[2:]:await run(b,L)
        await b.close()
asyncio.run(main())
