# v1.7j (B5b): recorre la vista País como gobernante (7 pestañas + cada botón de cada pestaña + hojas de recursos, reservas, banca y guerra)
# en español y en otro idioma con la misma semilla, y lista los textos idénticos (/tmp/ruler_same_<idioma><modo>.json)
# y los que mezclan español (/tmp/ruler_sp_<idioma><modo>.json). Modo f = Rápido, r = Realista (más acciones y aprobación).
# Uso: python3 -I herramientas/pw_gobernante_diff.py imperio.html ja r   (~3 min por corrida; lo que queda deben ser nombres propios)
import asyncio,sys,os,json
from playwright.async_api import async_playwright
URL='file://'+os.path.abspath(sys.argv[1]);L=sys.argv[2];MODE=sys.argv[3] if len(sys.argv)>3 else 'f'
SEED="""(()=>{let s=12345;Math.random=function(){s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();"""
GRAB="""()=>{const o=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE)$/.test(p.nodeName))continue;const v=n.nodeValue.trim();if(v.length>=3&&/[A-Za-zÁ-úñ]{3}/.test(v))o.push(v);}return o;}"""
TABS=['res','prov','arm','eco','dip','war','rank']
async def run(p,lang):
    b=await p.chromium.launch(args=['--no-sandbox'])
    pg=await b.new_page(viewport={'width':414,'height':896},locale='es-MX')
    await pg.add_init_script(SEED+f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{lang}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='MEX';sp.onchange&&sp.onchange();m.querySelector('#sA').value='40';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.ruler=true;P.nat=5;if('"+MODE+"'==='r')G.mode='realista';ensureV13();ensureV14();window.confirm=()=>false;render();}");await pg.wait_for_timeout(400)
    R={}
    for t in TABS:
        await pg.evaluate(f"()=>{{closeSheet();hideModal();setView('pa');setTab('{t}');render();}}");await pg.wait_for_timeout(400)
        R['tab_'+t]=await pg.evaluate(GRAB)
        n=await pg.evaluate("()=>[...document.querySelectorAll('#natBody button, #natTop button')].length")
        for i in range(min(n,40)):
            await pg.evaluate(f"()=>{{closeSheet();hideModal();setView('pa');setTab('{t}');render();}}");await pg.wait_for_timeout(150)
            try:
                lab=await pg.evaluate(f"()=>{{const B=[...document.querySelectorAll('#natBody button, #natTop button')];const x=B[{i}];if(!x)return null;const l=x.textContent.trim().slice(0,30);if(/Nueva|Retirar|Declarar|guerra|Abdic|Golpe|Renunc/i.test(x.dataset.k||'')) return null;x.click();return l;}}")
                await pg.wait_for_timeout(300)
                if lab is not None:R[f'{t}_{i}']=await pg.evaluate(GRAB)
            except Exception as e:pass
    for nm,js in [('rz',"openSheet('<h3>x</h3>'+rzHTML(natOf(P)));"),('rv',"openSheet('<h3>x</h3>'+rvHTML(natOf(P)));"),('bk',"openSheet('<h3>x</h3>'+bnkHTML(natOf(P)));"),('wl',"showWarLogV();")]:
        try:
            await pg.evaluate(f"()=>{{closeSheet();hideModal();{js}}}");await pg.wait_for_timeout(400);R[nm]=await pg.evaluate(GRAB)
        except Exception as e:print('ERR',nm,str(e)[:80])
    await b.close();return R
async def main():
    async with async_playwright() as p:
        ES=await run(p,'es');X=await run(p,L)
    same=set()
    for k in ES:
        same|=set(ES[k])&set(X.get(k,[]))
    json.dump(sorted(same),open('/tmp/ruler_same_'+L+MODE+'.json','w'),ensure_ascii=False,indent=0)
    import re
    sp=re.compile(r'\b(los|las|del|para|por|tus|años|días|también|está|según|una|con|de|la|el|y|en|que|tu|se|al|sin|más)\b|[ñáéíóú¿¡]',re.I)
    allx=set()
    for k in X: allx|=set(X[k])
    spx=sorted(t for t in allx if sp.search(t) and t not in same)
    json.dump(spx,open('/tmp/ruler_sp_'+L+MODE+'.json','w'),ensure_ascii=False,indent=0)
    print(len(ES),'pantallas ·',len(same),'iguales ·',len(spx),'con español mezclado')
asyncio.run(main())
