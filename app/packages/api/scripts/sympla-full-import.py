#!/usr/bin/env python3
"""Import all Sympla events from JSON file into SQLite database.
Usage: python3 scripts/sympla-full-import.py [--json /tmp/sympla-events.json]
"""

import json
import sqlite3
import re
import sys
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prisma", "dev.db")
JSON_PATH = sys.argv[2] if len(sys.argv) > 2 else "/tmp/sympla-events.json"

def slugify(name, date_str):
    """Generate slug: nome-evento-YYYY-MM-DD"""
    name_slug = re.sub(r'[^\w\s-]', '', name.lower())
    name_slug = re.sub(r'[-\s]+', '-', name_slug).strip('-')
    try:
        parts = date_str.split('/')
        date_part = f"{parts[2]}-{parts[1]}-{parts[0]}"
    except:
        date_part = "unknown-date"
    return f"{name_slug}-{date_part}"[:100]

def parse_date(date_str):
    try:
        parts = date_str.split('/')
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    except:
        return None

def main():
    with open(JSON_PATH) as f:
        events = json.load(f)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    created = 0
    updated = 0
    ignored = 0
    
    for ev in events:
        nome = ev["nome"]
        sympla_id = str(ev["id"])
        cidade = ev.get("cidade", "")
        capacity = ev.get("capacidade", 0) or 0
        vendidos = ev.get("vendidos", 0) or 0
        
        # Ignore test event
        if nome.lower() == "teste":
            ignored += 1
            continue
        
        date_iso = parse_date(ev["data"])
        if not date_iso:
            ignored += 1
            continue
        
        slug = slugify(nome, ev["data"]) + "-" + sympla_id
        
        # Check if event exists by symplaEventId
        cur.execute("SELECT id, title, slug, date, capacity, status FROM Event WHERE symplaEventId = ?", (sympla_id,))
        existing = cur.fetchone()
        
        # Use status based on capacity
        status = "published" if capacity > 0 else "draft"
        
        if existing:
            cur.execute("""
                UPDATE Event 
                SET title = ?, slug = ?, date = ?, location = ?, capacity = ?, status = ?, updatedAt = datetime('now')
                WHERE symplaEventId = ?
            """, (nome, slug, date_iso, cidade, capacity, status, sympla_id))
            updated += 1
        else:
            cur.execute("""
                INSERT INTO Event (id, title, slug, description, date, location, capacity, symplaEventId, status, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (
                sympla_id,  # Use sympla_id as the primary key
                nome,
                slug,
                None,
                date_iso,
                cidade,
                capacity,
                sympla_id,
                status
            ))
            created += 1
    
    conn.commit()
    conn.close()
    
    msg = f"Import OK — {created} criados, {updated} atualizados, {ignored} ignorados"
    print(msg)
    return msg

if __name__ == "__main__":
    result = main()
    print(result)
