#!/usr/bin/env python3
"""Regenera functions/data/bar.ts limpo com dados do Yuzer + db-embed"""
import json, re
from pathlib import Path

PROJ = Path("/home/ser/sistema-sarau-secreto")
BAR_EMBED = PROJ / "app/src/lib/bar-embed.ts"
DB_EMBED = PROJ / "app/src/lib/db-embed.ts"
OUT = PROJ / "app/functions/data/bar.ts"

def extract_ts_json(text):
    start = text.index('= {')
    pos = start + 2
    depth = 1
    while pos < len(text) and depth > 0:
        if text[pos] == '{': depth += 1
        elif text[pos] == '}': depth -= 1
        pos += 1
    return json.loads(text[start+2:pos])

# Parse bar-embed.ts
be_text = re.sub(r'^//.*?\n', '', BAR_EMBED.read_text(), flags=re.MULTILINE)
be_text = re.sub(r'^import.*?;\n', '', be_text, flags=re.MULTILINE)
be_data = extract_ts_json(be_text)
eventos = be_data["eventos"]
eventBarRevenue = be_data["eventBarRevenue"]

# Parse db-embed.ts (key is 'events', not 'eventos')
db_text = re.sub(r'^//.*?\n', '', DB_EMBED.read_text(), flags=re.MULTILINE)
db_text = re.sub(r'^import.*?;\n', '', db_text, flags=re.MULTILINE)
db_data = extract_ts_json(db_text)
db_events = db_data.get("events", [])

date_to_event = {ev.get("date", "")[:10]: ev for ev in db_events if ev.get("date")}

# Build BAR_EVENTOS
bar_eventos = []
for ev in eventos:
    s = ev["start"]
    title = date_to_event.get(s, {}).get("title", f"Evento {s}")
    prods = [{"name": p["name"], "qty": int(p["qty"]), "revenue": round(p["total"])} for p in ev.get("produtos", [])]
    bar_eventos.append({
        "start": f"{s}T20:00:00.000Z",
        "end": f"{ev['end']}T23:59:00.000Z",
        "title": title,
        "revenue": round(ev["revenue"]),
        "orders": ev["orders"],
        "products": prods,
    })

# Build BAR_REVENUE_MAP
rev_map = {}
for ev in db_events:
    eid = ev.get("id")
    d = ev.get("date", "")[:10]
    sid = ev.get("symplaEventId")
    rev_data = None

    if d in eventBarRevenue and eventBarRevenue[d] is not None:
        r = eventBarRevenue[d]
        rev_data = {"revenue": round(r["revenue"]), "transactions": r["transactions"], "perCapita": r["perCapita"]}
    elif sid and f"sympla-{sid}" in eventBarRevenue and eventBarRevenue[f"sympla-{sid}"] is not None:
        r = eventBarRevenue[f"sympla-{sid}"]
        rev_data = {"revenue": round(r["revenue"]), "transactions": r["transactions"], "perCapita": r["perCapita"]}

    if rev_data and eid:
        rev_map[eid] = rev_data
    if rev_data and sid:
        rev_map[f"sympla-{sid}"] = rev_data

for d, data in eventBarRevenue.items():
    if data is not None and not d.startswith("sympla-"):
        rev_map[d] = {"revenue": round(data["revenue"]), "transactions": data["transactions"], "perCapita": data["perCapita"]}

# Generate TS
lines = ["// Dados de bar para Pages Functions — auto-generated", ""]
lines.append("export const BAR_EVENTOS = [")
for i, be in enumerate(bar_eventos):
    sep = "," if i < len(bar_eventos) - 1 else ""
    prods_str = json.dumps(be["products"], ensure_ascii=False)
    title_str = json.dumps(be["title"], ensure_ascii=False)
    lines.append(f'  {{"start":"{be["start"]}","end":"{be["end"]}","title":{title_str},"revenue":{be["revenue"]},"orders":{be["orders"]},"products":{prods_str}}}{sep}')
lines.append("];")

lines.append("")
lines.append("export const BAR_REVENUE_MAP: Record<string, { revenue: number; transactions: number; perCapita: number } | null> = {")
keys = sorted(rev_map.keys(), key=lambda k: (not k.startswith("sympla-"), not k.startswith("20"), k))
for i, k in enumerate(keys):
    sep = "," if i < len(keys) - 1 else ""
    v = rev_map[k]
    lines.append(f'  "{k}": {{"revenue": {v["revenue"]}, "transactions": {v["transactions"]}, "perCapita": {v["perCapita"]}}}{sep}')
lines.append("};")

OUT.write_text("\n".join(lines) + "\n")

print(f"BAR_EVENTOS: {len(bar_eventos)} eventos")
print(f"BAR_REVENUE_MAP: {len(rev_map)} entries")
for k in ['cm842b46dd96f70', 'sympla-3500838', '2026-07-16', '2026-07-09']:
    v = rev_map.get(k)
    print(f"  {k}: {v}")
