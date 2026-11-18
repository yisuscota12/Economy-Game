# v1.7k (B6 parte 2): prueba de la narrativa traducida.  python3 herramientas/pw_b6p2.py imperio.html <idiomas…> [--vivo]
# A) Cada texto traducido de b6p2/ (bloques con traducción) pasa por la capa I18.T en el navegador:
#    frases fijas (D) → debe salir exactamente la traducción; plantillas (T) → se llenan con números («123», «45»…) y debe salir la plantilla traducida
#    con esos números (sin español). Así se comprueba el diccionario por hash, el índice de plantillas y el orden de los marcadores.
# B) Frases reales con valores que se traducen dentro de la plantilla (países, monedas con artículo, bancos centrales, «A y B»): se imprimen para revisarlas.
# C) Rendimiento: 3,000 textos sin traducir (eventos, diálogos, fama, motor) por la capa; ms por texto.
# D) --vivo: partida como gobernante, 4 años de avance con mercados; noticias y registro con detector de español.
import asyncio,os,sys,re,glob,json
from playwright.async_api import async_playwright
H=os.path.dirname(os.path.abspath(__file__));I=os.path.join(H,'i18n','b6p2')
URL='file://'+os.path.abspath(sys.argv[1]);LS=[a for a in sys.argv[2:] if not a.startswith('--')];VIVO='--vivo' in sys.argv
ES={};K={};B={}
for f in glob.glob(I+'/*_es.tsv'):
    b=os.path.basename(f)[:-7]
    for l in open(f,encoding='utf8'):
        p=l.rstrip('\n').split('\t')
        if len(p)==3:ES[p[0]]=p[2].replace('\\n','\n');K[p[0]]=p[1];B[p[0]]=b
EX=set(l.split('\t')[0] for l in open(I+'/excluir.tsv',encoding='utf8') if re.match(r'[0-9a-f]{6}\t',l))
def trs(L):
    o={}
    for f in glob.glob(I+f'/*_{L}.tsv'):
        for l in open(f,encoding='utf8'):
            p=l.rstrip('\n').split('\t')
            if len(p)==2 and p[0] in ES and p[0] not in EX:o[p[0]]=p[1].replace('\\n','\n')
    return o
NUM=['123','45','678','9','2468','31','57','86','12','64']
REAL=["◆ La Reserva Federal sube su tasa 0.75 puntos, a 4.50 %. Las bolsas lo resienten.",
"El banco central del peso uruguayo baja su tasa 1.00 puntos, a 8.25 %. Las bolsas lo celebran.",
"◆ México: el peso mexicano pasa a flotación administrada.",
"Argentina: el peso argentino queda fijo contra el dólar estadounidense (1,200 por unidad).",
"Crisis cambiaria en Reino Unido: tras un ataque especulativo, la libra esterlina se devalúa 12 % (0.79 → 0.88 por dólar) y pasa a flotar.",
"Reforma monetaria: el emisor quita 3 ceros a su moneda; nace el nuevo bolívar venezolano. Cada nuevo bolívar venezolano equivale a 1,000 unidades de la moneda anterior.",
"Grecia adopta el euro como miembro de la zona euro. La dracma deja de circular.",
"Alemania adopta la nueva moneda de Alemania como moneda propia. El euro deja de circular.",
"Devuelves la autonomía al Banco de Japón: vuelve a fijar las tasas con su regla (inflación y crecimiento).",
"Devuelves la autonomía a Banxico: vuelve a fijar las tasas con su regla (inflación y crecimiento).",
"Salir del euro y crear moneda propia",
"S&P 500: caída fuerte por el estallido de una guerra en Estados Unidos.",
"Petróleo sube 12 % en el mes por la caída de la oferta (guerra en Rusia, 12 % del mundo; prohibición de exportar en China, 5 % del mundo): US$84 por barril.",
"Abres puesto de comida en Jalisco: inviertes $50,000 en local y equipo y $10,000 de capital de trabajo (crédito bancario de $20,000).",
"Venta: 100 acciones de Señal América a $12.30 (comisión $5.00).",
"Banco Austral de Chile vende US$2.5 mil M de reservas para fortalecer el peso chileno.",
"El Banco Central Europeo vende US$12 mil M de reservas para fortalecer el euro.",
"Naces en Jalisco, México, en 2026. Tus padres: Juan Pérez y María López. Modo Realista.",
"Generación 2: continúas como Ana López, de 31 años. Heredas el poder.",
"Quiebra Banco del Volga: Rusia interviene el banco.",
"Un banco internacional necesita un capital mínimo de $5,000,000.",
"Crisis bancaria en Italia: el gobierno rescata a los bancos con el 4 % del PIB.",
"Guerra con Perú: tu país ganó 7 de 12 meses de combate. Moral 64 %.",
"Brasil declara la guerra a Argentina.",
"Revolución en Cuba: el nuevo régimen es socialismo.",
"Tus acciones están bloqueadas 45 días de bolsa más (periodo de bloqueo de la salida a bolsa).",
"Los bancos chicos pagan más, pero quiebran más; el seguro de depósitos de tu país cubre hasta $250,000 (hoy está desactivado) por banco.",
"📈 Bolsa"]
SPW=r"\b(el|la|los|las|del|que|para|por|tu|tus|con|una|sus|sube|baja|cae|años|días|moneda|bolsa|banco)\b|[ñáéíóú¿¡]"
async def run(b,L):
    T=trs(L);pg=await b.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(2500)
    cases=[]
    for i,tr in T.items():
        es=ES[i]
        if K[i]=='D':cases.append([i,es,tr])
        else:
            f=lambda s:re.sub(r'\{(\d)\}',lambda m:NUM[int(m.group(1))],s)
            cases.append([i,f(es),f(tr)])
    r=await pg.evaluate("C=>C.map(([i,a,e])=>[i,a,e,I18.T(a)])",cases)
    norm=lambda s:re.sub(r'\s+',' ',s.replace('\u2066','').replace('\u2069','').replace('\u00a0',' ')).strip()
    bad=[x for x in r if norm(x[3])!=norm(x[2])]
    # diferencias aceptables: pospro de plural/cifras CJK y elisiones que la capa aplica después de traducir
    hard=[x for x in bad if x[3]==x[1]]
    print(f"{L}: A) {len(r)} textos · iguales a la traducción {len(r)-len(bad)} · distintos {len(bad)} (sin traducir {len(hard)}) · errores {errs[:2]}")
    for x in hard:print('   ✗ sin traducir',B[x[0]],x[0],'|',x[1][:120])
    for x in bad[:int(os.environ.get('NDIF','8'))]:print('   ≠',B[x[0]],x[0],'|',x[1][:70],'→',x[3][:int(os.environ.get('NW','90'))],'| esperado:',x[2][:int(os.environ.get('NW','90'))])
    out=await pg.evaluate("R=>R.map(s=>I18.T(s))",REAL)
    sp=[o for o,a in zip(out,REAL) if o==a or re.search(SPW,o,re.I) and L not in('pt','it','fr')]
    print(f"   B) {len(REAL)} frases reales · sin traducir {sum(1 for o,a in zip(out,REAL) if o==a)}")
    if os.environ.get('VER'):
        for o in out:print('     ',o)
    U=[ES[i] for i in ES if B[i] in('eventos','dialogos','fama','motor')][:3000]
    ms=await pg.evaluate("U=>{const t0=performance.now();U.forEach(s=>I18.T(s+' '));return (performance.now()-t0)/U.length}",U)
    print(f"   C) {len(U)} textos sin traducir: {ms:.3f} ms por texto")
    await pg.close()
    return len(hard)
async def vivo(b,L):
    pg=await b.new_page(viewport={'width':414,'height':896});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(f"localStorage.setItem('imperioCfg',JSON.stringify({{lastLvl:'m',tut:1,help:1,lang:'{L}'}}))")
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("()=>{const m=document.querySelector('#modal');const sp=m.querySelector('#sP');sp.value='ARG';sp.onchange&&sp.onchange();m.querySelector('#sA').value='30';document.querySelector('#sGo').click();}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{dlgRoll=function(){return 0};P.event=null;P.dlg=null;hideModal();P.ruler=true;try{ensureV13();ensureV14();}catch(e){}}")
    for _ in range(4):
        await pg.evaluate("()=>{P.event=null;P.dlg=null;hideModal();try{advanceUnit('a');}catch(e){}}");await pg.wait_for_timeout(2500)
    r=await pg.evaluate("""()=>{const a=[];(G.nw||[]).slice(-120).forEach(x=>a.push(x.t));(G.mk&&G.mk.ev||[]).slice(-60).forEach(x=>a.push(x.t));P.log.slice(-80).forEach(x=>a.push(x.t));
      const u=[...new Set(a)];return u.map(s=>[s,I18.T(s)]);}""")
    es=[x for x in r if x[0]==x[1] and re.search(r'[a-záéíóúñ]{3}',x[0],re.I)]
    print(f"   D) vivo: {len(r)} noticias/registro · siguen en español {len(es)} · errores {errs[:2]}")
    for x in es[:int(os.environ.get('NES','12'))]:print('     es:',x[0][:130])
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'])
        for L in LS:
            await run(b,L)
            if VIVO:await vivo(b,L)
        await b.close()
asyncio.run(main())
