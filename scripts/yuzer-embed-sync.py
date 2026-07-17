#!/usr/bin/env python3
"""
yuzer-embed-sync.py — Busca Yuzer e atualiza bar-embed.ts com dados vivos.
"""

import json, re, os, sys, subprocess
from datetime import datetime, timezone
from collections import defaultdict
from pathlib import Path

PROJECT = Path("/home/ser/sistema-sarau-secreto")
APP_LIB = PROJECT / "app/src/lib"
BAR_EMBED = APP_LIB / "bar-embed.ts"
YUZER_API = "https://api.eagle.yuzer.com.br/api"

def get_token(key):
    """Read token from ~/sistema-sarau-secreto/.env or environment."""
    env_path = Path.home() / "sistema-sarau-secreto/.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith(key + "="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get(key, "")

YUZER_JWT = get_token("YUZER_JWT") or get_token("YUZER_TOKEN") or ""

def yuzer_post(path, body):
    url = f"{YUZER_API}{path}"
    cmd = ["curl", "-s", "-X", "POST", url,
           "-H", "Content-Type: application/json",
           "-H", f"Authorization: Bearer {YUZER_JWT}",
           "-d", json.dumps(body)]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if result.returncode != 0:
        print(f"  curl error (exit {result.returncode})")
        return {}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"  JSON decode error on page {body.get('page', '?')}")
        return {}

def fetch_all_orders():
    all_orders = []
    page = 1
    total_pages = 999
    while page <= total_pages:
        data = yuzer_post("/orders/search", {
            "from": "2023-11-01T00:00:00.000Z",
            "to": "2026-12-31T23:59:59.000Z",
            "page": page, "perPage": 5000,
            "sort": "desc", "sortColumn": "createdAt", "status": "PAID",
        })
        items = data.get("content", [])
        all_orders.extend(items)
        total_pages = data.get("totalPages", 1)
        print(f"  Page {page}/{total_pages}: {len(items)} orders")
        if page >= total_pages:
            break
        page += 1
    return all_orders

def cluster_events(orders):
    date_set = set()
    for o in orders:
        d = o.get("createdAt", "")[:10]
        if d: date_set.add(d)
    dates = sorted(date_set)
    if not dates: return []

    clusters = [[dates[0]]]
    for i in range(1, len(dates)):
        prev = datetime.strptime(clusters[-1][-1], "%Y-%m-%d")
        curr = datetime.strptime(dates[i], "%Y-%m-%d")
        if (curr - prev).days <= 2:
            clusters[-1].append(dates[i])
        else:
            clusters.append([dates[i]])

    events = []
    for cl in clusters:
        paid = [o for o in orders if o.get("createdAt","")[:10] in cl and o.get("paymentStatus")=="PAID"]
        rev = sum(o.get("cart",{}).get("total",o.get("total",0)) or 0 for o in paid)
        prod_map = defaultdict(lambda:{"qty":0,"total":0.0})
        for o in paid:
            for p in o.get("cart",{}).get("products",[]):
                n = p.get("name","?"); q = p.get("quantity",0) or 0; t = p.get("total",p.get("grossTotal",0)) or 0
                prod_map[n]["qty"] += q; prod_map[n]["total"] += t
        prods = [{"name":n,"qty":v["qty"],"total":v["total"],"pct":round(v["total"]/rev*100,1) if rev>0 else 0}
                 for n,v in sorted(prod_map.items(), key=lambda x:-x[1]["total"])[:50]]
        itens = sum(v["qty"] for v in prod_map.values())
        events.append({"start":cl[0],"end":cl[-1],"days":len(cl),"orders":len(paid),
                       "revenue":rev,"ticketMedio":round(rev/len(paid),2) if paid else 0,
                       "itensVendidos":itens,"produtos":prods})
    return events

def main():
    if not YUZER_JWT:
        print("ERRO: YUZER_JWT nao definido. Configure YUZER_JWT ou YUZER_TOKEN no .env")
        sys.exit(1)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Yuzer Embed Sync")
    print("1. Buscando orders...")
    orders = fetch_all_orders()
    print(f"   Total: {len(orders)} orders")

    print("2. Clusterizando eventos...")
    events = cluster_events(orders)
    print(f"   {len(events)} eventos")
    for e in events:
        print(f"     {e['start']} -> {e['end']}: R$ {e['revenue']:,.2f} ({e['orders']} ord)")

    existing_rev = {}
    if BAR_EMBED.exists():
        txt = BAR_EMBED.read_text()
        m = re.search(r'"eventBarRevenue":\s*\{([^}]+)\}\s*,\s*"mensais"', txt, re.DOTALL)
        if m:
            for k, v in re.findall(r'"([^"]+)"\s*:\s*(\{[^}]*\}|null)', m.group(1)):
                existing_rev[k] = v

    date_entries = {}
    for e in events:
        date_entries[e["start"]] = {"revenue":round(e["revenue"],2),"transactions":e["orders"],"perCapita":e["ticketMedio"]}

    final_rev = {}
    for k, v in existing_rev.items():
        if k.startswith("sympla-"): final_rev[k] = v
    for k, v in sorted(date_entries.items(), reverse=True):
        final_rev[k] = v

    known_defaults = {
        "sympla-3420938": {"revenue": 15072.0, "transactions": 276, "perCapita": 54.61},
        "sympla-3457402": {"revenue": 43138.0, "transactions": 750, "perCapita": 57.52},
        "sympla-3474070": {"revenue": 8562.0, "transactions": 172, "perCapita": 49.78},
        "sympla-3477015": None,
        "sympla-3492296": {"revenue": 22433.0, "transactions": 534, "perCapita": 42.01},
        "sympla-3500838": None,
    }
    for k, default_v in known_defaults.items():
        if k not in final_rev:
            api_v = date_entries.get(k.replace("sympla-", ""))
            if api_v is not None:
                final_rev[k] = api_v
            elif k in existing_rev and existing_rev[k] != "null":
                final_rev[k] = existing_rev[k]
            else:
                final_rev[k] = default_v

    month_map = defaultdict(lambda:{"e":set(),"o":0,"r":0.0})
    for e in events:
        m = e["start"][:7]
        month_map[m]["e"].add(e["start"])
        month_map[m]["o"] += e["orders"]
        month_map[m]["r"] += e["revenue"]
    meses_n = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    mensais = []
    for mes,v in sorted(month_map.items()):
        _,mm = mes.split("-")
        lbl = f"{meses_n[int(mm)-1]}/{mes[2:]}"
        tm = round(v["r"]/v["o"],2) if v["o"]>0 else 0
        mensais.append({"mes":mes,"label":lbl,"eventos":len(v["e"]),"orders":v["o"],
                        "revenue":round(v["r"],2),"ticketMedio":tm})

    pm = defaultdict(lambda:{"q":0,"t":0.0})
    for e in events:
        for p in e["produtos"]:
            pm[p["name"]]["q"] += p["qty"]
            pm[p["name"]]["t"] += p["total"]
    total_r = sum(e["revenue"] for e in events)
    mix = [{"name":n,"qty":v["q"],"total":round(v["t"],2),"pct":round(v["t"]/total_r*100,1) if total_r>0 else 0}
           for n,v in sorted(pm.items(), key=lambda x:-x[1]["t"])[:50]]

    cat_rules = [(re.compile(r'VINHO|UVITA|CARMEN|MALBEC|CABERNET|MERLOT|ROSE',re.I),'Vinho'),
                 (re.compile(r'CERVEJA|HEINEKEN|SPATEN|STELLA|BUDWEISER',re.I),'Cerveja'),
                 (re.compile(r'ÁGUA|AGUA|COCA|REFRIG|SUCO|GATORADE',re.I),'NaoAlcoolico'),
                 (re.compile(r'ESPUMANTE|CHAMP|PROSECCO',re.I),'Espumante'),
                 (re.compile(r'VODKA|WHISKY|GIN|DRINK|ENERGÉTICO|RED BULL',re.I),'Destilados'),
                 (re.compile(r'CAFÉ|BROWNIE|BATATA|CHOCOLATE|SNACK',re.I),'Comida')]
    cm = defaultdict(lambda:{"t":0.0,"q":0})
    for p in mix:
        found=False
        for rule,cat in cat_rules:
            if rule.search(p["name"]): cm[cat]["t"]+=p["total"]; cm[cat]["q"]+=p["qty"]; found=True; break
        if not found: cm["Outros"]["t"]+=p["total"]; cm["Outros"]["q"]+=p["qty"]
    cats = [{"name":n,"total":round(v["t"],2),"qty":v["q"],"pct":round(v["t"]/total_r*100,1) if total_r>0 else 0}
            for n,v in sorted(cm.items(), key=lambda x:-x[1]["t"])]

    total_ord = sum(e["orders"] for e in events)
    total_it = sum(e["itensVendidos"] for e in events)
    tm_geral = round(total_r/total_ord,2) if total_ord>0 else 0

    lines = ["// Auto-generated by yuzer-embed-sync.py",
             f"// {len(events)} eventos, R$ {total_r:,.2f}",
             "", "import type { BarHistoryData } from './use-bar-data'",
             "", "export const BAR_EMBED: BarHistoryData = {",
             f'  "source": "backup",', f'  "totalEvents": {len(events)},',
             f'  "totalRevenue": {total_r},', f'  "totalOrders": {total_ord},',
             f'  "totalItens": {total_it},', f'  "ticketMedioBar": {tm_geral},', f'  "ticketMedioGeral": {tm_geral},',
             '  "eventos": [']
    for i,e in enumerate(sorted(events, key=lambda x:x["start"])):
        sep = "," if i < len(events)-1 else ""
        lines.append(f'    {{"start": "{e["start"]}", "end": "{e["end"]}", "days": {e["days"]}, "orders": {e["orders"]}, "revenue": {e["revenue"]}, "ticketMedio": {e["ticketMedio"]}, "itensVendidos": {e["itensVendidos"]}, "produtos": {json.dumps(e["produtos"][:50])}, "metodosPagamento": []}}{sep}')
    lines.append('  ],')

    lines.append('  "eventBarRevenue": {')
    items = list(final_rev.items())
    for i,(k,v) in enumerate(items):
        sep = "," if i < len(items)-1 else ""
        if v is None:
            lines.append(f'    "{k}": null{sep}')
        elif isinstance(v,dict):
            lines.append(f'    "{k}": {{"revenue": {v["revenue"]}, "transactions": {v["transactions"]}, "perCapita": {v["perCapita"]}}}{sep}')
    lines.append('  },')

    lines.append('  "mensais": [')
    for i,m in enumerate(mensais):
        sep = "," if i < len(mensais)-1 else ""
        lines.append(f'    {{"mes": "{m["mes"]}", "label": "{m["label"]}", "eventos": {m["eventos"]}, "orders": {m["orders"]}, "revenue": {m["revenue"]}, "ticketMedio": {m["ticketMedio"]}}}{sep}')
    lines.append('  ],')

    lines.append('  "produtoMix": [')
    for i,p in enumerate(mix):
        sep = "," if i < len(mix)-1 else ""
        lines.append(f'    {{"name": {json.dumps(p["name"])}, "qty": {p["qty"]}, "total": {p["total"]}, "pct": {p["pct"]}}}{sep}')
    lines.append('  ],')
    lines.append('  "metodosPagamento": [],')
    lines.append('  "categorias": [')
    for i,c in enumerate(cats):
        sep = "," if i < len(cats)-1 else ""
        lines.append(f'    {{"name": "{c["name"]}", "total": {c["total"]}, "qty": {c["qty"]}, "pct": {c["pct"]}}}{sep}')
    lines.append('  ]')
    lines.append('}')

    BAR_EMBED.write_text("\n".join(lines)+"\n")
    print(f"\n3. Escrito: bar-embed.ts ({len(events)} eventos, R$ {total_r:,.2f})")

    # 4. Regenerar functions/data/bar.ts via script dedicado (limpo, sem corromper)
    REGEN_SCRIPT = PROJECT / "scripts/regenerate-bar-ts.py"
    if REGEN_SCRIPT.exists():
        import subprocess as sp
        result = sp.run(["python3", str(REGEN_SCRIPT)], capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"4. Regenerated: functions/data/bar.ts via {REGEN_SCRIPT.name}")
            for line in result.stdout.strip().split("\n"):
                print(f"   {line}")
        else:
            print(f"4. ERRO: regenerate-bar-ts.py falhou (exit {result.returncode})")
            if result.stderr: print(f"   stderr: {result.stderr[:500]}")

if __name__ == "__main__":
    main()
