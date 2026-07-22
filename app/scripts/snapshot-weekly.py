#!/usr/bin/env python3
"""Snapshot semanal do overview do Sarau Secreto.

Usado por cron job Hermes: coleta /api/insights/overview e salva
um snapshot com timestamp para consulta histórica.

Uso:
  python3 scripts/snapshot-weekly.py [--url URL]

Exemplo:
  python3 scripts/snapshot-weekly.py --url https://sarau-gestao.pages.dev
"""

import json
import os
import sys
from datetime import datetime
from urllib.request import urlopen, Request

SNAPSHOT_DIR = os.path.expanduser("~/.hermes/snapshots/sarau")
DEFAULT_URL = "https://58127ff9.sarau-gestao.pages.dev"

def fetch_overview(url: str) -> dict:
    req = Request(f"{url}/api/insights/overview", headers={"User-Agent": "Hermes-Snapshot/1.0"})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def save_snapshot(data: dict, base_url: str):
    os.makedirs(SNAPSHOT_DIR, exist_ok=True)
    now = datetime.utcnow()
    filename = f"snapshot-{now.strftime('%Y-%m-%d')}.json"
    path = os.path.join(SNAPSHOT_DIR, filename)

    snapshot = {
        "timestamp": now.isoformat() + "Z",
        "base_url": base_url,
        "aggregates": data.get("aggregates", {}),
        "event_count": len(data.get("events", [])),
    }

    with open(path, "w") as f:
        json.dump(snapshot, f, indent=2, ensure_ascii=False)

    # Save latest as well
    latest_path = os.path.join(SNAPSHOT_DIR, "latest.json")
    with open(latest_path, "w") as f:
        json.dump(snapshot, f, indent=2, ensure_ascii=False)

    agg = snapshot["aggregates"]
    events = agg.get("totalEvents", 0)
    revenue = agg.get("totalRevenue", 0)
    tickets = agg.get("totalTickets", 0)

    print(f"Snapshot salvo: {filename}")
    print(f"  Eventos: {events}")
    print(f"  Receita total: R$ {revenue:,.2f}" if isinstance(revenue, (int, float)) else f"  Receita total: {revenue}")
    print(f"  Ingressos: {tickets}")
    print(f"  Caminho: {path}")
    return path


if __name__ == "__main__":
    url = DEFAULT_URL
    if "--url" in sys.argv:
        idx = sys.argv.index("--url") + 1
        if idx < len(sys.argv):
            url = sys.argv[idx].rstrip("/")

    data = fetch_overview(url)
    path = save_snapshot(data, url)
    print(f"\nSnapshot semanal concluido. Path: {path}")
