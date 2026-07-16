#!/usr/bin/env python3
"""Generate functions/data/eventos.ts from src/lib/db-embed.ts — with proper dedup"""
import json, re
from datetime import datetime

with open('../src/lib/db-embed.ts', 'r') as f:
    text = f.read()

# Find events array
events_start = text.index('"events"') + len('"events"')
events_start = text.index('[', events_start)
depth = 0
events_end = events_start
for i in range(events_start, len(text)):
    if text[i] == '[': depth += 1
    elif text[i] == ']':
        depth -= 1
        if depth == 0:
            events_end = i + 1
            break
events_json = text[events_start:events_end]
events = json.loads(events_json)

# Find tickets
tickets_start = text.index('"tickets"') + len('"tickets"')
tickets_start = text.index('{', tickets_start)
depth = 0
tickets_end = tickets_start
for i in range(tickets_start, len(text)):
    if text[i] == '{': depth += 1
    elif text[i] == '}':
        depth -= 1
        if depth == 0:
            tickets_end = i + 1
            break
tickets_json = text[tickets_start:tickets_end]
tickets = json.loads(tickets_json)

def normalize_date(d):
    """Convert any date format to YYYY-MM-DD string"""
    if isinstance(d, (int, float)):
        return datetime.fromtimestamp(d / 1000).strftime('%Y-%m-%d')
    s = str(d).strip().split('T')[0].split(' ')[0]
    if len(s) == 10 and s[4] == '-' and s[7] == '-':
        return s
    if len(s) == 13 and s.isdigit():
        return datetime.fromtimestamp(int(s) / 1000).strftime('%Y-%m-%d')
    return s[:10]

# For dedup: prefer events WITH data (soldCount not null)
# Group by normalized date + title, keep the richest one
from collections import defaultdict
groups = defaultdict(list)
for e in events:
    nd = normalize_date(e['date'])
    title = e['title'].strip().lower()
    groups[(nd, title)].append(e)

clean = []
removed = 0
for key, evs in groups.items():
    # Prefer the one with soldCount data
    with_data = [e for e in evs if e.get('soldCount') is not None]
    without_data = [e for e in evs if e.get('soldCount') is None]
    
    if with_data:
        clean.append(with_data[0])
        removed += len(with_data) - 1 + len(without_data)
    else:
        clean.append(evs[0])
        removed += len(evs) - 1

print(f"Eventos brutos: {len(events)}")
print(f"Eventos limpos: {len(clean)}")
print(f"Removidos: {removed}")

# Build TICKETS
tickets_out = {}
for e in clean:
    sc = e.get('soldCount')
    tr = e.get('totalRevenue')
    if sc is not None and tr is not None:
        tickets_out[e['id']] = {"count": sc, "revenue": tr}
    elif e['id'] in tickets:
        tickets_out[e['id']] = tickets[e['id']]

# Also add tickets for events that were in the original tickets but not in clean events
# (e.g., the "s" prefix events from old embed that had ticket data)
for tid, t in tickets.items():
    if tid not in tickets_out:
        # Check if this ID corresponds to a removed duplicate
        tid_clean = tid.replace('sympla-', '')
        # Find event with numeric ID matching this ticket
        for e in clean:
            if e['id'] == tid_clean or e['id'] == tid:
                tickets_out[e['id']] = t
                break

print(f"Tickets: {len(tickets_out)}")

# Generate output
lines = ['// Dados embarcados para Cloudflare Pages Functions',
         '// Auto-gerado de src/lib/db-embed.ts',
         '',
         'export const EVENTOS = [']
for i, e in enumerate(clean):
    comma = ',' if i < len(clean) - 1 else ''
    nd = normalize_date(e['date'])
    line = (f'  {{"id":{json.dumps(e["id"])},"title":{json.dumps(e["title"])},'
            f'"date":{json.dumps(nd)},"symplaEventId":{json.dumps(e.get("symplaEventId") or "")},'
            f'"soldCount":{json.dumps(e.get("soldCount"))},'
            f'"totalRevenue":{json.dumps(e.get("totalRevenue"))},'
            f'"capacity":{json.dumps(e.get("capacity"))},'
            f'"status":{json.dumps(e.get("status") or "completed")}}}{comma}')
    lines.append(line)
lines.append(']')
lines.append('')
lines.append('export const TICKETS = {')
for i, (eid, t) in enumerate(tickets_out.items()):
    comma = ',' if i < len(tickets_out) - 1 else ''
    lines.append(f'  {json.dumps(eid)}:{{"count":{t["count"]},"revenue":{t["revenue"]}}}{comma}')
lines.append('}')
lines.append('')

out = '\n'.join(lines)
with open('../functions/data/eventos.ts', 'w') as f:
    f.write(out)

print(f"Escrito: {len(clean)} eventos, {len(tickets_out)} tickets, {len(out)} bytes")

# Verify
print(f"\nAmostra (primeiros 3, ultimos 3):")
for e in clean[:3]:
    print(f"  {normalize_date(e['date'])} | {e['title'][:40]} | ingressos={e.get('soldCount')}")
print("  ...")
for e in clean[-3:]:
    print(f"  {normalize_date(e['date'])} | {e['title'][:40]} | ingressos={e.get('soldCount')}")
