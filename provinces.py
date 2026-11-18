"""Agrupa provincias (admin-1) en regiones jugables y elige las naciones del juego."""
import csv, json, math, random
from collections import defaultdict

random.seed(7)
wb = json.load(open("raw/wb.json"))
val = lambda k, iso: (wb[k].get(iso) or [None])[0]

SOV = {"AU1": "AUS", "CH1": "CHN", "CU1": "CUB", "DN1": "DNK", "FI1": "FIN", "FR1": "FRA", "GB1": "GBR",
       "IS1": "ISR", "KA1": "KAZ", "NL1": "NLD", "NZ1": "NZL", "US1": "USA"}
# adm0_a3 -> clave de nación (ISO3 del Banco Mundial)
FIX = {"SDS": "SSD", "KOS": "XKX", "SOL": "SOM", "CYN": "CYP", "SAH": "ESH", "PSX": "PSE", "ALD": "FIN",
       "KAB": "KAZ", "HKG": "CHN", "MAC": "CHN", "GRL": "DNK", "PRI": "USA", "NCL": "FRA", "USG": None,
       "ROU": "ROU", "SAU": "SAU", "TWN": "TWN"}
DROP_DEP = True
a0 = {}
for r in csv.DictReader(open("raw/a0.csv")):
    a, s, i, t, n = r["x"].split("|")
    a0[a] = (s, i, t, n)

def nation_of(adm0):
    if adm0 in FIX:
        return FIX[adm0]
    s, i, t, n = a0.get(adm0, (adm0, adm0, "", ""))
    if s in SOV:
        return SOV[s] if adm0 == SOV[s] else None
    if t in ("Dependency", "Lease", "Disputed", "Indeterminate"):
        return None
    return adm0

rows = list(csv.DictReader(open("raw/a1_attrs.csv")))
WD = {r["adm1_code"]: r["wikidataid"] for r in csv.DictReader(open("raw/a1_wd.csv"))}
WDP = json.load(open("raw/wd_pop.json"))
POP = {}
for x in csv.DictReader(open("raw/a1_pop.csv")):
    caps = [c for c in json.loads(x["cap"] or "[]") if c]
    POP[x["adm1_code"]] = (float(x["pop"] or 0), caps[0] if caps else "")
SPECIAL = {"TWN", "PSE", "XKX", "ESH", "PRK", "ERI"}
by_nat = defaultdict(list)
for r in rows:
    nid = nation_of(r["adm0_a3"])
    if not nid:
        continue
    r["nid"] = nid
    r["pop"], r["cap"] = POP.get(r["adm1_code"], (0, ""))
    r["A"] = float(r["A"]); r["cx"] = float(r["cx"]); r["cy"] = float(r["cy"])
    nm = r["name_es"] or r["name"] or "Islas menores"
    if r["iso_3166_2"] == "MX-DIF": nm = "Ciudad de México"
    if r["iso_3166_2"] == "MX-MEX": nm = "Estado de México"
    r["nm"] = nm.replace("Estado de ", "") if r["nid"] == "MEX" and nm.startswith("Estado de V") else nm
    by_nat[nid].append(r)

def keep(nid):
    if nid in SPECIAL: return True
    pop, area = val("pop", nid), val("area", nid)
    if pop is None or val("gdp", nid) is None: return False
    return pop >= 500_000 or (area or 0) >= 10_000

nations = {k: v for k, v in by_nat.items() if keep(k)}


ADJ = json.load(open("raw/a1_adj.json"))
MIN_A = 1500
prov = []; assign = {}
for nid, units in sorted(nations.items()):
    by = {u["adm1_code"]: u for u in units}
    grp = {c: c for c in by}                      # unidad -> grupo
    members = {c: [c] for c in by}
    area = {c: by[c]["A"] for c in by}
    def nbrs(g):
        s = set()
        for c in members[g]:
            for x in ADJ.get(c, []):
                if x in by and grp[x] != g: s.add(grp[x])
        return s
    changed = True
    while changed:
        changed = False
        for g in sorted(list(members), key=lambda g: area[g]):
            if g not in members or area[g] >= MIN_A: continue
            nb = nbrs(g)
            if not nb: continue
            t = min(nb, key=lambda x: area[x])
            for c in members[g]: grp[c] = t
            members[t] += members.pop(g); area[t] += area.pop(g); changed = True
    for g, cs in members.items():
        us = sorted((by[c] for c in cs), key=lambda u: (not u["cap"], -(u["pop"] + u["A"] * 2)))
        names = [u["nm"] for u in us]
        pid = f"{nid}{len([p for p in prov if p['nid'] == nid]) + 1}"
        A = sum(u["A"] for u in us)
        prov.append({"rid": pid, "nid": nid, "name": names[0], "members": names, "area": round(A),
                     "cpop": sum(u["pop"] for u in us), "cap": next((u["cap"] for u in us if u["cap"]), ""),
                     "wpop": (sum(WDP[WD[u["adm1_code"]]][0] for u in us) if all(WD.get(u["adm1_code"]) in WDP for u in us) else None)})
        for u in us: assign[u["adm1_code"]] = pid

with open("raw/assign_p.csv", "w") as f:
    f.write("adm1_code,rid\n")
    for k, v in assign.items(): f.write(f"{k},{v}\n")
json.dump(prov, open("raw/provinces.json", "w"), ensure_ascii=False)
from collections import Counter
cnt = Counter(p["nid"] for p in prov)
print("naciones", len(nations), "provincias", len(prov), "fusionadas de", len(assign), "con población real", sum(1 for p in prov if p["wpop"]))
print("más provincias:", cnt.most_common(12))
print("MEX", [p["name"] for p in prov if p["nid"] == "MEX"])
print("GBR", len([p for p in prov if p["nid"] == "GBR"]), [p["name"] for p in prov if p["nid"] == "GBR"][:15])
