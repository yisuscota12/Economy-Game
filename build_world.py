"""Combina mapa + datos reales en raw/world.json (lo que se incrusta en el juego)."""
import csv, json, math
from collections import defaultdict

wb = json.load(open("raw/wb.json"))
wbc = json.load(open("raw/wb_countries.json"))
debt = json.load(open("raw/imf_debt.json"))
M = json.load(open("raw/map2.json"))
names = {r["ADM0_A3"]: r["NAME_ES"] for r in csv.DictReader(open("raw/a0names.csv"))}
NAME_FIX = {"SSD": "Sudán del Sur", "XKX": "Kosovo", "PSE": "Palestina", "ESH": "Sáhara Occidental", "COD": "RD del Congo",
            "COG": "Congo", "USA": "Estados Unidos", "GBR": "Reino Unido", "CZE": "Chequia", "MKD": "Macedonia del Norte",
            "CIV": "Costa de Marfil", "SWZ": "Esuatini", "TLS": "Timor Oriental", "MMR": "Birmania (Myanmar)", "BIH": "Bosnia y Herzegovina", "TWN": "Taiwán", "KOR": "Corea del Sur", "PRK": "Corea del Norte", "RUS": "Rusia", "CHN": "China"}
def v(k, iso):
    x = wb.get(k, {}).get(iso)
    return x[0] if x else None
def y(k, iso):
    x = wb.get(k, {}).get(iso)
    return x[1] if x else None

# Valores estimados para países sin serie en el Banco Mundial (marcados como estimados en el juego)
MANUAL = {
    "TWN": dict(pop=23.4e6, gdp=7.9e11, infl=2.2, unemp=3.4, milx=16.5e9, milp=169000, stab=0.75, le=80.2, lem=77.0, lef=83.6, tax=12.0, lend=2.5, gdpg=4.3, popg=-0.1, cbr=5.8, cdr=8.5),
    "PRK": dict(pop=26.4e6, gdp=2.8e10, infl=5.0, unemp=3.0, milx=4.0e9, milp=1280000, stab=0.4, le=73.6, lem=70.0, lef=77.0, tax=0, lend=10, gdpg=1.5, popg=0.3, cbr=13, cdr=9.5),
    "ERI": dict(pop=3.7e6, gdp=2.3e9, infl=6.0, unemp=6.0, milx=1.5e8, milp=200000, stab=-0.6, le=67.4, lem=65.0, lef=69.8, tax=0, lend=10, gdpg=2.5, popg=1.7, cbr=28, cdr=6.5),
    "ESH": dict(pop=6.0e5, gdp=9.0e8, infl=2.0, unemp=12.0, milx=2.0e7, milp=6000, stab=-0.3, le=71, lem=69, lef=73, tax=0, lend=10, gdpg=2.0, popg=1.8, cbr=19, cdr=5),
}
INCOME_LEND = {"High income": 5.5, "Upper middle income": 9.0, "Lower middle income": 12.5, "Low income": 16.0}

# ===== Mortalidad OMS (nMx 2023) =====
AG = ["00-01", "01-04", "05-09", "10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85PLUS"]
mort = defaultdict(lambda: {"M": [None] * 19, "F": [None] * 19, "y": 0})
for r in json.load(open("raw/who_nmx.json")):
    if r["SpatialDimType"] != "COUNTRY" or r["Dim1"] == "SEX_BTSX": continue
    iso, yr = r["SpatialDim"], r["TimeDim"]
    m = mort[iso]
    if yr < m["y"]: continue
    if yr > m["y"]:
        m["M"], m["F"], m["y"] = [None] * 19, [None] * 19, yr
    s = "M" if r["Dim1"] == "SEX_MLE" else "F"
    m[s][AG.index(r["Dim2"].replace("AGEGROUP_YEARS", ""))] = float("%.4g" % r["NumericValue"])
WORLD_M = {"M": [], "F": []}
for s in "MF":
    for i in range(19):
        vals = sorted(m[s][i] for m in mort.values() if m[s][i] is not None)
        WORLD_M[s].append(vals[len(vals) // 2])

# ===== Salarios OIT por ocupación (ISCO-08, USD, total ambos sexos) =====
ilo = defaultdict(lambda: defaultdict(dict))  # iso -> year -> occ -> value
for r in csv.DictReader(open("raw/ilo_ocu.csv")):
    if r["SEX"] != "SEX_T" or r["CUR"] != "CUR_TYPE_USD" or not r["OCU"].startswith("OCU_ISCO08_"): continue
    try: val = float(r["OBS_VALUE"])
    except: continue
    ilo[r["REF_AREA"]][int(r["TIME_PERIOD"])][r["OCU"][11:]] = val
OCC = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
wages, wsrc = {}, {}
for iso, years in ilo.items():
    good = [yy for yy, d in years.items() if all(o in d for o in ["TOTAL", "1", "2", "5", "9"]) and yy >= 2016]
    if not good: continue
    yy = max(good); d = years[yy]
    wages[iso] = {o: round(d[o] * 12) for o in OCC + ["TOTAL"] if o in d}
    wsrc[iso] = yy
# proporciones típicas (mediana mundial) para completar huecos
ratio = {o: sorted(w[o] / w["TOTAL"] for w in wages.values() if o in w)[len([w for w in wages.values() if o in w]) // 2] for o in OCC}
# salario medio vs PIB per cápita (para países sin datos OIT)
fac = sorted(w["TOTAL"] / v("gdppc", iso) for iso, w in wages.items() if v("gdppc", iso))
FAC = fac[len(fac) // 2]

TERMS = {  # años de mandato, regla de reelección: no (nunca), alt (no consecutiva), max2 (2 periodos), ilim
    "MEX": (6, "no"), "GTM": (4, "no"), "PRY": (5, "no"), "COL": (4, "no"), "HND": (4, "no"), "KOR": (5, "no"), "PHL": (6, "no"),
    "CRI": (4, "alt"), "PAN": (5, "alt"), "CHL": (4, "alt"), "PER": (5, "alt"), "URY": (5, "alt"),
    "USA": (4, "max2"), "BRA": (4, "max2"), "ARG": (4, "max2"), "ECU": (4, "max2"), "BOL": (5, "max2"), "DOM": (4, "max2"),
    "RUS": (6, "max2"), "FRA": (5, "max2"), "IDN": (5, "max2"), "TUR": (5, "max2"), "ZAF": (5, "max2"), "NGA": (4, "max2"),
    "KEN": (5, "max2"), "EGY": (6, "max2"), "IRN": (4, "max2"), "POL": (5, "max2"), "UKR": (5, "max2"), "CUB": (5, "max2"),
    "PRT": (5, "max2"), "GHA": (4, "max2"), "SEN": (5, "max2"), "TZA": (5, "max2"), "ETH": (5, "ilim"), "COD": (5, "max2"),
    "SLV": (6, "ilim"), "VEN": (6, "ilim"), "NIC": (6, "ilim"), "GBR": (5, "ilim"), "DEU": (4, "ilim"), "JPN": (4, "ilim"),
    "CAN": (4, "ilim"), "AUS": (3, "ilim"), "NZL": (3, "ilim"), "ESP": (4, "ilim"), "ITA": (5, "ilim"), "CHN": (5, "ilim"),
    "IND": (5, "ilim"), "PAK": (5, "ilim"), "BGD": (5, "ilim"), "ISR": (4, "ilim"), "GRC": (4, "ilim"), "SWE": (4, "ilim"),
    "NOR": (4, "ilim"), "NLD": (4, "ilim"), "BEL": (5, "ilim"), "VNM": (5, "ilim"), "THA": (4, "ilim"), "MYS": (5, "ilim"),
    "SAU": (5, "ilim"), "MAR": (5, "ilim"), "DZA": (5, "max2"), "TUN": (5, "max2"), "KAZ": (7, "no"), "UZB": (7, "max2"),
    "IRL": (5, "ilim"), "AUT": (5, "ilim"), "CHE": (4, "ilim"), "FIN": (4, "ilim"), "DNK": (4, "ilim"), "HUN": (4, "ilim"),
    "ROU": (5, "max2"), "CZE": (4, "ilim"), "SRB": (5, "max2"), "BLR": (5, "max2"), "TWN": (4, "max2"), "PRK": (5, "ilim"),
}
# grupos culturales para generar nombres
CULT = {}
for iso in ["MEX", "GTM", "HND", "SLV", "NIC", "CRI", "PAN", "CUB", "DOM", "COL", "VEN", "ECU", "PER", "BOL", "CHL", "ARG", "URY", "PRY", "ESP", "GNQ"]: CULT[iso] = "hisp"
for iso in ["BRA", "PRT", "AGO", "MOZ", "GNB", "TLS", "CPV"]: CULT[iso] = "luso"
for iso in ["USA", "GBR", "CAN", "AUS", "NZL", "IRL", "JAM", "TTO", "BHS", "BLZ", "GUY"]: CULT[iso] = "angl"
for iso in ["FRA", "BEL", "CHE", "LUX", "HTI", "MDG", "SEN", "CIV", "MLI", "BFA", "NER", "GIN", "BEN", "TGO", "CMR", "GAB", "COG", "COD", "TCD", "CAF", "BDI", "RWA", "DJI", "MRT"]: CULT[iso] = "fran"
for iso in ["DEU", "AUT", "NLD", "DNK", "SWE", "NOR", "FIN", "ISL"]: CULT[iso] = "germ"
for iso in ["ITA"]: CULT[iso] = "ital"
for iso in ["RUS", "UKR", "BLR", "POL", "CZE", "SVK", "BGR", "SRB", "HRV", "SVN", "BIH", "MNE", "MKD", "LTU", "LVA", "EST", "MDA", "ROU", "HUN", "GEO", "ARM", "KAZ", "KGZ", "XKX", "ALB", "GRC", "CYP"]: CULT[iso] = "esla"
for iso in ["SAU", "ARE", "QAT", "KWT", "OMN", "YEM", "IRQ", "SYR", "JOR", "LBN", "PSE", "EGY", "LBY", "TUN", "DZA", "MAR", "ESH", "SDN", "SOM", "BHR"]: CULT[iso] = "arab"
for iso in ["TUR", "AZE", "TKM", "UZB", "TJK"]: CULT[iso] = "turc"
for iso in ["IRN", "AFG", "PAK"]: CULT[iso] = "pers"
for iso in ["CHN", "TWN", "SGP", "MNG"]: CULT[iso] = "chin"
for iso in ["JPN"]: CULT[iso] = "japo"
for iso in ["KOR", "PRK"]: CULT[iso] = "core"
for iso in ["IND", "NPL", "BGD", "LKA", "BTN"]: CULT[iso] = "indi"
for iso in ["IDN", "MYS", "PHL", "THA", "VNM", "KHM", "LAO", "MMR", "PNG", "FJI", "SLB", "VUT"]: CULT[iso] = "seas"
for iso in ["ISR"]: CULT[iso] = "hebr"

nations = {}
for rid, r in M["regions"].items():
    nations.setdefault(r["n"], []).append(rid)
out = {}
for iso, rids in sorted(nations.items()):
    man = MANUAL.get(iso, {})
    g = lambda k: v(k, iso) if v(k, iso) is not None else man.get(k)
    pop, gdp = g("pop"), g("gdp")
    inc = wbc.get(iso, {}).get("income") or ("High income" if iso == "TWN" else "Low income")
    stab = g("stab"); stab = 50 if stab is None else round((stab + 2.5) / 5 * 100)
    w = wages.get(iso)
    if w:
        full = {o: w.get(o) or round(w["TOTAL"] * ratio[o]) for o in OCC}; full["T"] = w["TOTAL"]; src = f"OIT {wsrc[iso]}"
    else:
        tot = (gdp / pop) * FAC
        full = {o: round(tot * ratio[o]) for o in OCC}; full["T"] = round(tot); src = "estimado (PIB per cápita × proporciones OIT)"
    mo = mort.get(iso)
    mt = {"M": mo["M"], "F": mo["F"], "y": mo["y"]} if mo and None not in mo["M"] else {"M": WORLD_M["M"], "F": WORLD_M["F"], "y": 0}
    lend = g("lend")
    if lend is None or lend > 60 or lend < 1: lend = INCOME_LEND.get(inc, 12)
    d = debt.get(iso)
    term = TERMS.get(iso, (5, "max2"))
    out[iso] = {
        "nm": NAME_FIX.get(iso) or names.get(iso) or wbc.get(iso, {}).get("name", iso),
        "pop": round(pop), "gdp": round(gdp), "infl": round(g("infl") if g("infl") is not None else 4, 1),
        "unemp": round(g("unemp") if g("unemp") is not None else 6, 1), "milx": round(g("milx") or gdp * 0.012),
        "milp": round(g("milp") or pop * 0.003), "stab": stab, "le": round(g("le") or 70, 1),
        "lem": round(g("lem") or 68, 1), "lef": round(g("lef") or 73, 1), "tax": round(g("tax") or 15, 1),
        "lend": round(lend, 1), "debt": round(d[0]) if d else None, "gdpg": round(g("gdpg") if g("gdpg") is not None else 2.5, 1),
        "popg": round(g("popg") if g("popg") is not None else 1, 2), "cbr": round(g("cbr") or 15, 1), "cdr": round(g("cdr") or 8, 1),
        "homi": round(g("homi") or 5, 1), "gini": g("gini"), "inc": inc, "reg": wbc.get(iso, {}).get("region", ""),
        "w": full, "wsrc": src, "mort": mt, "term": term[0], "rule": term[1], "cult": CULT.get(iso, "afri" if wbc.get(iso, {}).get("region", "").startswith("Sub") else "angl"),
        "est": iso in MANUAL, "yr": y("gdp", iso) or 2024,
    }
json.dump({"nations": out}, open("raw/world.json", "w"), ensure_ascii=False)
print("naciones", len(out), "con salarios OIT", sum(1 for o in out.values() if o["wsrc"].startswith("OIT")),
      "con mortalidad OMS", sum(1 for o in out.values() if o["mort"]["y"]))
print("ratios", {k: round(x, 2) for k, x in ratio.items()}, "FAC", round(FAC, 2))
for iso in ["MEX", "USA", "CHN", "GTM", "DEU", "TWN", "PRK"]:
    o = out[iso]; print(iso, o["nm"], o["pop"], o["gdp"], o["w"], o["wsrc"], o["mort"]["y"], o["stab"], o["lend"], o["cult"])
print(sorted(k for k, o in out.items() if not o["mort"]["y"]))
