#!/usr/bin/env python3
"""
sympla-aggregate-import.py — Import aggregated data (soldCount, totalRevenue, capacity) 
from Sympla internal API into the SQLite database.

Usage:
  python3 scripts/sympla-aggregate-import.py                    # uses /tmp/sympla-events-agg.json
  python3 scripts/sympla-aggregate-import.py --json /path/file  # custom JSON path
  python3 scripts/sympla-aggregate-import.py --fetch             # fetch from API directly
  python3 scripts/sympla-aggregate-import.py --fetch --page1 <json> --page2 <json>  # raw page data

The JSON format expected (from organizador.sympla.com.br/ajax/meus-eventos):
  { "events": [
      {
        "EVENT_ID": 123456,
        "NAME": "Event Name",
        "START_DATE": "16/04/2026",
        "CITY": "Brasilia",
        "STATUS": "Encerrado",
        "INDICATOR": { "sold": "675", "total": "792" },
        "INDICATOR_TOOLTIP": "TOTAL VENDIDO<br/>Online: R$ 35.431,71",
        "USER_ID": 6416739,
        "SHARED": true
      },
      ...
    ]
  }
"""

import json
import re
import sys
import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prisma", "dev.db")
DEFAULT_JSON = "/tmp/sympla-events-agg.json"

# Regex to extract revenue from INDICATOR_TOOLTIP
# Matches patterns like: R$ 35.431,71 or R$ 1.234,56
REVENUE_RE = re.compile(r'R\$\s*([\d.]+\,\d{2})')


def parse_brl(value_str: str) -> float:
    """Convert Brazilian currency string like '35.431,71' to float 35431.71"""
    # Remove dots (thousands separator), replace comma with dot
    cleaned = value_str.replace('.', '').replace(',', '.')
    return float(cleaned)


def parse_revenue(tooltip: str) -> float:
    """Extract total revenue from INDICATOR_TOOLTIP string.
    Example: 'TOTAL VENDIDO<br/>Online: R$ 35.431,71'
    """
    if not tooltip:
        return 0.0
    match = REVENUE_RE.search(tooltip)
    if match:
        return parse_brl(match.group(1))
    return 0.0


def fetch_from_api(cookie_file: str = "/tmp/sympla-cookies.txt",
                   page1_json: str = None,
                   page2_json: str = None) -> list:
    """Fetch events from Sympla internal API using cookies.
    
    If page1_json and page2_json are provided, parse them directly.
    Otherwise, fetch with curl.
    """
    import subprocess

    if page1_json and page2_json:
        try:
            p1 = json.loads(page1_json)
            p2 = json.loads(page2_json)
        except json.JSONDecodeError as e:
            print(f"[AGGREGATE] ERROR: Invalid JSON input: {e}")
            sys.exit(3)
    else:
        # Fetch via curl
        try:
            cmd = [
                "curl", "-s",
                "https://organizador.sympla.com.br/ajax/meus-eventos"
                "?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page=1",
                "-H", "X-Requested-With: XMLHttpRequest",
                "-H", "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                "-b", cookie_file
            ]
            p1_raw = subprocess.check_output(cmd, timeout=30).decode('utf-8')
            p1 = json.loads(p1_raw)

            cmd[6] = cmd[6].replace("page=1", "page=2")
            p2_raw = subprocess.check_output(cmd, timeout=30).decode('utf-8')
            p2 = json.loads(p2_raw)
        except subprocess.TimeoutExpired:
            print("[AGGREGATE] ERROR: Curl timeout")
            sys.exit(3)
        except subprocess.CalledProcessError as e:
            print(f"[AGGREGATE] ERROR: Curl failed: {e}")
            sys.exit(3)
        except json.JSONDecodeError as e:
            print(f"[AGGREGATE] ERROR: Invalid JSON from API: {e}")
            sys.exit(3)

    events = p1.get('events', []) + p2.get('events', [])
    
    # Validate we got events
    if not events:
        print("[AGGREGATE] ERROR: No events returned from API — session may be expired")
        sys.exit(2)

    print(f"[AGGREGATE] Fetched {len(events)} events from API (p1={len(p1.get('events',[]))}, p2={len(p2.get('events',[]))})")
    return events


def process_events(events: list, dry_run: bool = False) -> dict:
    """Process all events and update the database.
    
    Returns stats dict with:
      - updated: count of events updated
      - not_found: list of events that couldn't be matched
      - total_revenue: sum of all revenue
      - events_with_sold: count of events that have soldCount > 0
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Pre-fetch all existing events for matching
    cur.execute("SELECT id, title, date, symplaEventId FROM Event")
    existing_events = cur.fetchall()
    
    # Build lookup maps
    by_sympla_id = {}
    by_title_date = {}
    for ev in existing_events:
        if ev["symplaEventId"]:
            by_sympla_id[ev["symplaEventId"]] = ev
        # Normalize title for matching
        title_key = ev["title"].strip().lower()
        # date can be int (unix ms) or ISO string
        date_val = ev["date"]
        if isinstance(date_val, (int, float)):
            date_str = datetime.fromtimestamp(date_val / 1000).strftime("%Y-%m-%d")
        elif isinstance(date_val, str):
            date_str = date_val[:10]
        else:
            date_str = str(date_val)[:10]
        by_title_date[f"{title_key}|{date_str}"] = ev

    updated = 0
    not_found = []
    total_revenue_sum = 0.0
    events_with_sold = 0

    for ev in events:
        sympla_id = str(ev.get("EVENT_ID", ""))
        name = ev.get("NAME", "")
        start_date = ev.get("START_DATE", "")
        user_id = str(ev.get("USER_ID", "")) if ev.get("USER_ID") else None
        
        # Parse indicators
        indicator = ev.get("INDICATOR", {})
        sold_str = indicator.get("sold", "0")
        capacity_str = indicator.get("total", "0")
        
        try:
            sold_count = int(sold_str) if sold_str else 0
        except (ValueError, TypeError):
            sold_count = 0
        
        try:
            capacity = int(capacity_str) if capacity_str else 0
        except (ValueError, TypeError):
            capacity = 0
        
        # Parse revenue from tooltip
        tooltip = ev.get("INDICATOR_TOOLTIP", "")
        revenue = parse_revenue(tooltip)
        
        # Skip test event
        if name.lower() == "teste":
            continue

        # Find the existing DB event
        db_event = None
        
        # 1. Try matching by symplaEventId
        if sympla_id and sympla_id in by_sympla_id:
            db_event = by_sympla_id[sympla_id]
        
        # 2. Try matching by name + date
        if db_event is None:
            # Parse date to ISO for matching
            try:
                parts = start_date.split('/')
                date_iso = f"{parts[2]}-{parts[1]}-{parts[0]}"
            except (IndexError, ValueError):
                date_iso = None
            
            if date_iso:
                title_key = name.strip().lower()
                match_key = f"{title_key}|{date_iso}"
                if match_key in by_title_date:
                    db_event = by_title_date[match_key]
                    # Also update symplaEventId if it was missing
                    if not db_event["symplaEventId"]:
                        cur.execute(
                            "UPDATE Event SET \"symplaEventId\" = ? WHERE id = ?",
                            (sympla_id, db_event["id"])
                        )

        # 3. Try matching by title only (fuzzy)
        if db_event is None:
            title_lower = name.strip().lower()
            for key, e in by_title_date.items():
                if e_key := key.split('|')[0]:
                    # Check if title is contained or similar
                    if title_lower in e_key or e_key in title_lower:
                        db_event = e
                        break

        if db_event is None:
            not_found.append(f"symplaId={sympla_id} name={name} date={start_date}")
            print(f"[AGGREGATE] WARNING: Event not found in DB: {name} (symplaId={sympla_id})")
            continue

        # Update the event with aggregated data
        if dry_run:
            print(f"[AGGREGATE] DRY-RUN: Would update {name}: sold={sold_count}, capacity={capacity}, revenue={revenue:.2f}, userId={user_id}")
        else:
            cur.execute("""
                UPDATE Event SET
                    "capacity" = ?,
                    "soldCount" = ?,
                    "totalRevenue" = ?,
                    "symplaUserId" = ?,
                    "updatedAt" = datetime('now')
                WHERE id = ?
            """, (capacity, sold_count, revenue, user_id, db_event["id"]))

        updated += 1
        total_revenue_sum += revenue
        if sold_count > 0:
            events_with_sold += 1

    if not dry_run:
        conn.commit()
    
    conn.close()
    
    return {
        "updated": updated,
        "not_found": not_found,
        "total_revenue": total_revenue_sum,
        "events_with_sold": events_with_sold,
    }


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Import aggregated Sympla data")
    parser.add_argument("--json", help=f"Path to JSON file (default: {DEFAULT_JSON})")
    parser.add_argument("--fetch", action="store_true", help="Fetch from API directly instead of reading JSON file")
    parser.add_argument("--page1", help="Raw JSON from page 1 (used with --fetch)")
    parser.add_argument("--page2", help="Raw JSON from page 2 (used with --fetch)")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to DB, just print what would happen")
    parser.add_argument("--cookie", default="/tmp/sympla-cookies.txt", help="Cookie file path")
    
    args = parser.parse_args()
    
    events = None
    
    if args.fetch:
        # Fetch directly from API
        events = fetch_from_api(args.cookie, args.page1, args.page2)
    elif args.json:
        # Read from JSON file
        json_path = args.json
        print(f"[AGGREGATE] Reading from {json_path}...")
        with open(json_path) as f:
            combined = json.load(f)
        # The file could be a list of events or have 'events' key
        if isinstance(combined, dict) and 'events' in combined:
            events = combined['events']
        elif isinstance(combined, list):
            events = combined
        else:
            print(f"[AGGREGATE] ERROR: Unknown JSON format in {json_path}")
            sys.exit(3)
        print(f"[AGGREGATE] Loaded {len(events)} events from file")
    else:
        # Default: try /tmp/sympla-events-agg.json
        if os.path.exists(DEFAULT_JSON):
            print(f"[AGGREGATE] Reading from {DEFAULT_JSON}...")
            with open(DEFAULT_JSON) as f:
                events = json.load(f)
            if isinstance(events, dict) and 'events' in events:
                events = events['events']
            print(f"[AGGREGATE] Loaded {len(events)} events")
        elif os.path.exists("/tmp/sympla-events.json"):
            print(f"[AGGREGATE] Reading from /tmp/sympla-events.json...")
            with open("/tmp/sympla-events.json") as f:
                events = json.load(f)
            print(f"[AGGREGATE] Loaded {len(events)} events")
        else:
            print(f"[AGGREGATE] No JSON file found, fetching from API...")
            events = fetch_from_api(args.cookie)
    
    if not events:
        print("[AGGREGATE] No events to process")
        sys.exit(0)
    
    print(f"[AGGREGATE] Processing {len(events)} events...")
    stats = process_events(events, dry_run=args.dry_run)
    
    print(f"\n{'='*60}")
    print(f"  Aggregate Import Results")
    print(f"{'='*60}")
    print(f"  Total de eventos atualizados: {stats['updated']}")
    print(f"  Eventos com soldCount:        {stats['events_with_sold']}")
    print(f"  Receita total agregada:        R$ {stats['total_revenue']:,.2f}")
    
    if stats['not_found']:
        print(f"  Eventos que falharam:         {len(stats['not_found'])}")
        for e in stats['not_found'][:10]:
            print(f"    - {e}")
        if len(stats['not_found']) > 10:
            print(f"    ... e mais {len(stats['not_found'])-10}")
    else:
        print(f"  Eventos que falharam:         0")
    
    print(f"{'='*60}")
    
    if stats['not_found']:
        sys.exit(0)  # Non-critical, just report
    

if __name__ == "__main__":
    main()
