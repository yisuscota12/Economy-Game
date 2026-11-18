# v2.2b — genera la fuente pixel «PX5» (5×7, dibujada a mano para ECONOMY; sin licencias de terceros)
# y la escribe como @font-face WOFF2 embebido en src/style.css, entre /* PX5:INI */ y /* PX5:FIN */.
# Uso: pip install fonttools brotli && python3 herramientas/pixel/build_pxfont.py
# Métrica: 1 pixel = 100 unidades, unitsPerEm = 800 → con font-size 16px cada pixel mide 2 px CSS (12px → 1.5 px,
# nítido en pantallas 2× como el iPhone 11). Cubre ASCII, acentos de español/portugués/francés/alemán/italiano y signos
# comunes; lo demás (cirílico, árabe, CJK, etc.) cae al siguiente tipo de letra de la pila (system-ui), carácter por carácter.
import base64, io, os, re, sys
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

PX = 100; UPM = 800; ASC = 9; DESC = 2  # filas sobre la línea base (7 de mayúscula + 2 para acentos) y bajo ella

# '#' encendido, '.' apagado; 7 filas (de arriba a la línea base) y opcionalmente 2 de descendente
G = {
' ': '.../.../.../.../.../.../...',
'A': '.###./#...#/#...#/#####/#...#/#...#/#...#', 'B': '####./#...#/#...#/####./#...#/#...#/####.',
'C': '.###./#...#/#..../#..../#..../#...#/.###.', 'D': '####./#...#/#...#/#...#/#...#/#...#/####.',
'E': '#####/#..../#..../####./#..../#..../#####', 'F': '#####/#..../#..../####./#..../#..../#....',
'G': '.###./#...#/#..../#.###/#...#/#...#/.####', 'H': '#...#/#...#/#...#/#####/#...#/#...#/#...#',
'I': '###/.#./.#./.#./.#./.#./###', 'J': '..###/...#./...#./...#./...#./#..#./.##..',
'K': '#...#/#..#./#.#../##.../#.#../#..#./#...#', 'L': '#..../#..../#..../#..../#..../#..../#####',
'M': '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', 'N': '#...#/#...#/##..#/#.#.#/#..##/#...#/#...#',
'O': '.###./#...#/#...#/#...#/#...#/#...#/.###.', 'P': '####./#...#/#...#/####./#..../#..../#....',
'Q': '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', 'R': '####./#...#/#...#/####./#.#../#..#./#...#',
'S': '.###./#...#/#..../.###./....#/#...#/.###.', 'T': '#####/..#../..#../..#../..#../..#../..#..',
'U': '#...#/#...#/#...#/#...#/#...#/#...#/.###.', 'V': '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
'W': '#...#/#...#/#...#/#.#.#/#.#.#/#.#.#/.#.#.', 'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
'Y': '#...#/#...#/.#.#./..#../..#../..#../..#..', 'Z': '#####/....#/...#./..#../.#.../#..../#####',
'0': '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', '1': '..#../.##../..#../..#../..#../..#../.###.',
'2': '.###./#...#/....#/...#./..#../.#.../#####', '3': '####./....#/....#/.###./....#/....#/####.',
'4': '...#./..##./.#.#./#..#./#####/...#./...#.', '5': '#####/#..../####./....#/....#/#...#/.###.',
'6': '.###./#..../#..../####./#...#/#...#/.###.', '7': '#####/....#/...#./..#../.#.../.#.../.#...',
'8': '.###./#...#/#...#/.###./#...#/#...#/.###.', '9': '.###./#...#/#...#/.####/....#/....#/.###.',
'a': '...../...../.###./....#/.####/#...#/.####', 'b': '#..../#..../####./#...#/#...#/#...#/####.',
'c': '...../...../.###./#...#/#..../#...#/.###.', 'd': '....#/....#/.####/#...#/#...#/#...#/.####',
'e': '...../...../.###./#...#/#####/#..../.###.', 'f': '..##/.#../.#../###./.#../.#../.#..',
'g': '...../...../.####/#...#/#...#/#...#/.####/....#/.###.', 'h': '#..../#..../#.##./##..#/#...#/#...#/#...#',
'i': '.#./.../##./.#./.#./.#./###', 'j': '...#/..../..##/...#/...#/...#/...#/#..#/.##.',
'k': '#.../#.../#..#/#.#./##../#.#./#..#', 'l': '##./.#./.#./.#./.#./.#./###',
'm': '...../...../##.#./#.#.#/#.#.#/#.#.#/#.#.#', 'n': '...../...../#.##./##..#/#...#/#...#/#...#',
'o': '...../...../.###./#...#/#...#/#...#/.###.', 'p': '...../...../####./#...#/#...#/#...#/####./#..../#....',
'q': '...../...../.####/#...#/#...#/#...#/.####/....#/....#', 'r': '...../...../#.##./##..#/#..../#..../#....',
's': '...../...../.####/#..../.###./....#/####.', 't': '.#../.#../###./.#../.#../.#.#/..#.',
'u': '...../...../#...#/#...#/#...#/#..##/.##.#', 'v': '...../...../#...#/#...#/#...#/.#.#./..#..',
'w': '...../...../#...#/#...#/#.#.#/#.#.#/.#.#.', 'x': '...../...../#...#/.#.#./..#../.#.#./#...#',
'y': '...../...../#...#/#...#/#...#/#...#/.####/....#/.###.', 'z': '...../...../#####/...#./..#../.#.../#####',
'!': '#/#/#/#/#/./#', '"': '#.#/#.#/.../.../.../.../...', '#': '.#.#./.#.#./#####/.#.#./#####/.#.#./.#.#.',
'$': '..#../.####/#.#../.###./..#.#/####./..#..', '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
'&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', "'": '#/#/./././././.',
'(': '.#/#./#./#./#./#./.#', ')': '#./.#/.#/.#/.#/.#/#.',
'*': '...../..#../#.#.#/.###./#.#.#/..#../.....', '+': '...../..#../..#../#####/..#../..#../.....',
',': '../../../../../.#/.#/#./..', '-': '..../..../..../####/..../..../....', '.': '././././././#',
'/': '....#/....#/...#./..#../.#.../#..../#....', ':': '././#/./././#',
';': '../../.#/../../.#/.#/#./..', '<': '...#/..#./.#../#.../.#../..#./...#', '=': '...../...../#####/...../#####/...../.....',
'>': '#.../.#../..#./...#/..#./.#../#...', '?': '.###./#...#/....#/...#./..#../...../..#..',
'@': '.###./#...#/#.###/#.#.#/#.###/#..../.####', '[': '###/#../#../#../#../#../###', '\\': '#..../#..../.#.../..#../...#./....#/....#',
']': '###/..#/..#/..#/..#/..#/###', '^': '..#../.#.#./#...#/...../...../...../.....', '_': '...../...../...../...../...../...../...../#####/.....',
'`': '#./.#/../../../../..', '{': '..#/.#./.#./#../.#./.#./..#', '|': '#/#/#/#/#/#/#/#/.', '}': '#../.#./.#./..#/.#./.#./#..',
'~': '...../...../.#.../#.#.#/...#./...../.....',
'¡': './#/./#/#/#/#/#/.', '¿': '..#../...../..#../.#.../#..../#...#/.###.', '°': '.#./#.#/.#./.../.../.../...',
'€': '.####/#..../####./#..../####./#..../.####', '«': '...../...../..#.#/.#.#./#.#../.#.#./..#.#', '»': '...../...../#.#../.#.#./..#.#/.#.#./#.#..',
'·': './././#/./././.', '–': '...../...../...../#####/...../...../.....', '—': '......./......./......./#######/......./......./.......',
'…': '...../...../...../...../...../...../#.#.#', '•': '.../.../###/###/###/.../...', '×': '...../#...#/.#.#./..#../.#.#./#...#/.....',
'ß': '.##../#..#./#.#../#..#./#...#/#...#/#.##.', '£': '..##./.#..#/.#.../###../.#.../.#..#/#####', '¥': '#...#/.#.#./#####/..#../#####/..#../..#..',
'ª': '.##/..#/.##/#.#/.##/.../...', 'º': '.#./#.#/#.#/.#./.../.../...', '¢': '..#../.###./#.#../#.#../#.#../.###./..#..',
'÷': '...../..#../...../#####/...../..#../.....', '±': '..#../..#../#####/..#../..#../...../#####',
}
# ñ, ã, õ: la tilde no cabe pegada a la letra en minúscula; se dibujan con el cuerpo una fila más bajo
G['ñ'] = '.##.#/#.##./...../####./#...#/#...#/#...#'
G['ã'] = '.##.#/#.##./...../.####/#...#/#..##/.##.#'
G['õ'] = '.##.#/#.##./...../.###./#...#/#...#/.###.'
G['‘'] = G['’'] = G["'"]; G['“'] = G['”'] = G['"']; G[' '] = G[' ']; G['−'] = G['-']
# acentos (2 filas sobre la letra: en minúscula ocupan las filas 0-1; en mayúscula, las dos filas extra de arriba)
AC5 = {'dot': '..#../.....', 'breve': '#...#/.###.', 'grave': '.#.../..#..', 'acute': '...#./..#..', 'circ': '..#../.#.#.', 'tilde': '.##.#/#.##.', 'diaer': '.#.#./.....', 'ring': '..#../.#.#.'}
AC3 = {'dot': '.#./...', 'breve': '#.#/.#.', 'grave': '#../.#.', 'acute': '..#/.#.', 'circ': '.#./#.#', 'tilde': '.##/##.', 'diaer': '#.#/...', 'ring': '.#./#.#'}
DOTLESS = {'i': '.../.../##./.#./.#./.#./###', 'j': '..../..../..##/...#/...#/...#/...#/#..#/.##.'}
COMP = {}
for base, marks in {'a': 'àáâãäå', 'e': 'èéêë', 'i': 'ìíîï', 'o': 'òóôõö', 'u': 'ùúûü', 'n': '  ñ', 'y': '    ÿ'}.items():
    for k, ch in zip(['grave', 'acute', 'circ', 'tilde', 'diaer', 'ring'], marks):
        if ch.strip(): COMP[ch] = (base, k)
for base, marks in {'A': 'ÀÁÂÃÄÅ', 'E': 'ÈÉÊË', 'I': 'ÌÍÎÏ', 'O': 'ÒÓÔÕÖ', 'U': 'ÙÚÛÜ', 'N': '   Ñ', 'Y': ' Ý'}.items():
    for k, ch in zip(['grave', 'acute', 'circ', 'tilde', 'diaer', 'ring'], marks):
        if ch.strip(): COMP[ch] = (base, k)
COMP.update({'ğ': ('g', 'breve'), 'Ğ': ('G', 'breve'), 'İ': ('I', 'dot'), 'ç': ('c', 'ced'), 'Ç': ('C', 'ced'), 'ş': ('s', 'ced'), 'Ş': ('S', 'ced')})  # turco y cedilla
G['ı'] = DOTLESS['i']
COMP['ñ'] = ('n', 'tilde'); COMP['Ñ'] = ('N', 'tilde'); COMP['ý'] = ('y', 'acute'); COMP['Ý'] = ('Y', 'acute')

def rows(s):
    r = s.split('/'); w = max(len(x) for x in r)
    r = [x.ljust(w, '.') for x in r]
    while len(r) < 9: r.append('.' * w)
    return r  # 9 filas: 0..6 sobre la base, 7..8 descendente

def glyph(ch):
    """devuelve (filas, y0) donde y0 es la fila (en pixeles, desde la base) de la fila superior"""
    if ch in G: return rows(G[ch]), 7
    base, k = COMP[ch]; up = base.isupper()
    if k == 'ced':  # cedilla en las filas de descendente
        b = rows(G[base]); w = len(b[0]); o = (w - 3) // 2
        b[7] = '.' * o + '.#.' + '.' * (w - o - 3); b[8] = '.' * o + '#..' + '.' * (w - o - 3)
        return b, 7
    if up:
        b = rows(G[base]); w = len(b[0]); a = (AC5 if w >= 5 else AC3)[k].split('/')
        off = (w - len(a[0])) // 2
        acc = ['.' * off + x + '.' * (w - off - len(x)) for x in a]
        return acc + b, 9
    b = rows(DOTLESS.get(base, G[base])); w = len(b[0]); a = (AC5 if w >= 5 else AC3)[k].split('/')
    off = (w - len(a[0])) // 2
    b = b[:]
    for i in range(2):
        b[i] = ''.join('#' if (j - off >= 0 and j - off < len(a[i]) and a[i][j - off] == '#') or c == '#' else '.' for j, c in enumerate(b[i]))
    return b, 7

def draw(ch):
    r, y0 = glyph(ch); pen = TTGlyphPen(None); w = len(r[0])
    for i, line in enumerate(r):
        y = (y0 - i) * PX  # borde superior de la fila
        j = 0
        while j < w:
            if line[j] == '#':
                k = j
                while k < w and line[k] == '#': k += 1
                x0, x1 = (j + .5) * PX, (k + .5) * PX  # 0.5 px de margen izquierdo
                pen.moveTo((x0, y - PX)); pen.lineTo((x0, y)); pen.lineTo((x1, y)); pen.lineTo((x1, y - PX)); pen.closePath()
                j = k
            else: j += 1
    return pen.glyph(), int((w + 1) * PX)

chars = sorted(set(G) | set(COMP), key=ord)
names = ['.notdef'] + ['u%04X' % ord(c) for c in chars]
fb = FontBuilder(UPM, isTTF=True); fb.setupGlyphOrder(names)
fb.setupCharacterMap({ord(c): 'u%04X' % ord(c) for c in chars})
glyphs = {'.notdef': TTGlyphPen(None).glyph()}; metrics = {'.notdef': (300, 0)}
for c in chars:
    g, adv = draw(c); n = 'u%04X' % ord(c); glyphs[n] = g; metrics[n] = (adv, 0)
fb.setupGlyf(glyphs)
for n in names:
    g = fb.font['glyf'][n]; g.recalcBounds(fb.font['glyf']); metrics[n] = (metrics[n][0], getattr(g, 'xMin', 0))
fb.setupHorizontalMetrics(metrics)
fb.setupHorizontalHeader(ascent=ASC * PX, descent=-DESC * PX)
fb.setupNameTable({'familyName': 'PX5', 'styleName': 'Regular'})
fb.setupOS2(version=4, sTypoAscender=ASC * PX, sTypoDescender=-DESC * PX, sTypoLineGap=0, usWinAscent=ASC * PX, usWinDescent=DESC * PX, fsSelection=0x80)
fb.setupPost()
fb.font.flavor = 'woff2'
buf = io.BytesIO(); fb.font.save(buf); data = buf.getvalue()
print('PX5: %d glifos, %d bytes WOFF2' % (len(chars), len(data)), file=sys.stderr)
if len(data) > 30 * 1024: sys.exit('la fuente pasa de 30 KB')
rule = "/* PX5:INI — fuente pixel propia (herramientas/pixel/build_pxfont.py; no editar a mano) */\n@font-face{font-family :PX5;src:url(data:font/woff2;base64,%s) format('woff2');font-display:block}\n/* PX5:FIN */" % base64.b64encode(data).decode()
p = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'style.css'); css = open(p, encoding='utf8').read()
if '/* PX5:INI' in css: css = re.sub(r'/\* PX5:INI.*?/\* PX5:FIN \*/', lambda m: rule, css, flags=re.S)
else: css = css.replace('<style>\n', '<style>\n' + rule + '\n', 1)
open(p, 'w', encoding='utf8').write(css)
