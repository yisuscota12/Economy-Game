"""Descarga datos reales por país: Banco Mundial, FMI (deuda), OMS (tablas de vida)."""
import json, urllib.request, concurrent.futures as cf, os, sys

OUT = os.path.join(os.path.dirname(__file__), "raw")
WB = {
    "gdp": "NY.GDP.MKTP.CD",          # PIB USD corrientes
    "gdppc": "NY.GDP.PCAP.CD",        # PIB per cápita USD
    "pop": "SP.POP.TOTL",             # población
    "infl": "FP.CPI.TOTL.ZG",         # inflación anual %
    "unemp": "SL.UEM.TOTL.ZS",        # desempleo % (OIT modelado)
    "milx": "MS.MIL.XPND.CD",         # gasto militar USD (SIPRI)
    "milp": "MS.MIL.TOTL.P1",         # personal de fuerzas armadas
    "stab": "GOV_WGI_PV.EST",                 # estabilidad política (WGI) -2.5..2.5
    "le": "SP.DYN.LE00.IN",           # esperanza de vida
    "lem": "SP.DYN.LE00.MA.IN",
    "lef": "SP.DYN.LE00.FE.IN",
    "cbr": "SP.DYN.CBRT.IN",          # natalidad por 1000
    "tfr": "SP.DYN.TFRT.IN",          # fecundidad
    "old": "SP.POP.65UP.TO.ZS",       # % 65+
    "tax": "GC.TAX.TOTL.GD.ZS",       # recaudación % PIB
    "lend": "FR.INR.LEND",            # tasa de préstamos %
    "area": "AG.LND.TOTL.K2",         # superficie km2
    "gini": "SI.POV.GINI",
}

def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                return r.read()
        except Exception as e:
            err = e
    raise err

def wb(key, code):
    url = f"https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&per_page=20000&date=2014:2025"
    if code.startswith("GOV_WGI"):
        url += "&source=3"
    data = json.loads(get(url))
    rows = data[1] or []
    best = {}
    for r in rows:
        iso = r["countryiso3code"] or NAME2ISO.get(r["country"]["value"])
        if not iso or r["value"] is None:
            continue
        y = int(r["date"])
        if iso not in best or y > best[iso][1]:
            best[iso] = (r["value"], y)
    return key, best

NAME2ISO = {}
def main():
    cs = json.loads(get("https://api.worldbank.org/v2/country?format=json&per_page=400"))[1]
    for c in cs:
        NAME2ISO[c["name"]] = c["id"]
    json.dump({c["id"]: {"name": c["name"], "region": c["region"]["value"], "income": c["incomeLevel"]["value"]} for c in cs}, open(os.path.join(OUT, "wb_countries.json"), "w"))
    res = {}
    with cf.ThreadPoolExecutor(8) as ex:
        for key, best in ex.map(lambda kv: wb(*kv), WB.items()):
            res[key] = best
            print(key, len(best), file=sys.stderr)
    json.dump(res, open(os.path.join(OUT, "wb.json"), "w"))

    imf = json.loads(get("https://www.imf.org/external/datamapper/api/v1/GGXWDG_NGDP"))
    debt = {}
    for iso, ser in imf["values"]["GGXWDG_NGDP"].items():
        for y in ("2025", "2024", "2023"):
            if y in ser and ser[y] is not None:
                debt[iso] = (ser[y], int(y)); break
    json.dump(debt, open(os.path.join(OUT, "imf_debt.json"), "w"))
    print("imf debt", len(debt), file=sys.stderr)

    who = json.loads(get("https://ghoapi.azureedge.net/api/LIFE_0000000029"))["value"]
    json.dump(who, open(os.path.join(OUT, "who_nmx.json"), "w"))
    print("who rows", len(who), file=sys.stderr)

main()
