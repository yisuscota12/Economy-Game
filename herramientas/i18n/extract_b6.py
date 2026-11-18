# v1.7i (B6, parte 1): saca de imperio.html (ya construido, en español) los textos largos que no pasan por la capa de nodos:
# el HTML de cada tema de la Guía (GUIA[i][1]) y los dos textos de cada burbuja ⓘ (HELP[i][2] «en el mundo real» y HELP[i][3] «en el juego»).
# Escribe b6/b6_es.tsv: «id<TAB>texto». id = primeros 6 hex del SHA-1 del texto exacto (no se desalinea si se agregan o reordenan entradas).
# Los saltos de línea del HTML se guardan como «\n» literal. Uso: node build.js && python3 herramientas/i18n/extract_b6.py
# Después: traducir las líneas nuevas en b6/b6_<idioma>*.tsv (mismo id) y correr build_i18n.py.
import asyncio,os,hashlib
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(H))
URL='file://'+os.path.join(ROOT,'imperio.html')
def hid(s):return hashlib.sha1(s.encode('utf8')).hexdigest()[:6]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(locale='es-MX')
        await pg.add_init_script("localStorage.setItem('imperioCfg',JSON.stringify({tut:1,help:1,lang:'es'}))")
        await pg.goto(URL);await pg.wait_for_timeout(2500)
        d=await pg.evaluate("()=>({g:GUIA.map(g=>g[1]),h:HELP.map(h=>[h[2],h[3]])})")
        await b.close()
    S=d['g']+[x for h in d['h'] for x in h]
    U=list(dict.fromkeys(S));ids=[hid(s) for s in U]
    assert len(set(ids))==len(ids),'colisión de id: usar más caracteres del hash'
    os.makedirs(H+'/b6',exist_ok=True)
    with open(H+'/b6/b6_es.tsv','w',encoding='utf8') as f:
        for i,s in zip(ids,U):f.write(i+'\t'+s.replace('\t',' ').replace('\n','\\n')+'\n')
    print(len(d['g']),'temas de la Guía,',len(d['h']),'burbujas →',len(U),'textos únicos')
asyncio.run(main())
