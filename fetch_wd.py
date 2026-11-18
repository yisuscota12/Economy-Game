"""Población real de cada provincia desde Wikidata (P1082, dato más reciente)."""
import csv, json, urllib.request, urllib.parse, time
ids = sorted({r["wikidataid"] for r in csv.DictReader(open("raw/a1_wd.csv")) if r["wikidataid"].startswith("Q")})
out = {}
for k in range(0, len(ids), 300):
    vals = " ".join("wd:" + q for q in ids[k:k + 300])
    q = f"SELECT ?i ?pop ?date WHERE {{ VALUES ?i {{{vals}}} ?i p:P1082 ?st. ?st ps:P1082 ?pop. OPTIONAL {{?st pq:P585 ?date}} }}"
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q})
    req = urllib.request.Request(url, headers={"Accept": "application/sparql-results+json", "User-Agent": "ImperioDeUnaVida/0.3 (juego educativo)"})
    for t in range(4):
        try:
            data = json.loads(urllib.request.urlopen(req, timeout=90).read()); break
        except Exception as e:
            time.sleep(3)
    for b in data["results"]["bindings"]:
        qid = b["i"]["value"].rsplit("/", 1)[1]; pop = float(b["pop"]["value"]); d = b.get("date", {}).get("value", "0000")[:10]
        if qid not in out or d > out[qid][1]: out[qid] = (pop, d)
json.dump(out, open("raw/wd_pop.json", "w"))
print("ids", len(ids), "con población", len(out))
