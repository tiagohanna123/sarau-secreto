#!/usr/bin/env python3
"""Generate functions/data/eventos.ts from src/lib/db-embed.ts"""
import json, re

with open('../src/lib/db-embed.ts', 'r') as f:
    text = f.read()

# Extract the events JSON array - find between "events": [ and ],
# This is tricky with nested braces. Let's use a simpler approach.
# Find the JSON structure
events_start = text.index('"events"') + len('"events"')
events_start = text.index('[', events_start)

# Count braces to find end of events array
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

print(f"Eventos: {len(events)}")
print(f"Tickets: {len(tickets)}")

# Clean events - remove duplicates with "s" prefix symplaEventId
# Keep the ones with numeric symplaEventId when there's a duplicate date
seen = set()
clean_events = []
dups = 0
for e in events:
    eid = e['id']
    sid = e.get('symplaEventId') or ''
    # Create a dedup key based on date + title
    dt = str(e['date'])[:10]
    title = e['title'].strip().lower()
    key = f"{dt}|{title}"
    
    if key in seen:
        dups += 1
        continue
    seen.add(key)
    clean_events.append(e)

print(f"Limpos (sem duplicatas): {len(clean_events)}")
print(f"Duplicatas removidas: {dups}")

# Build TICKETS map - use the event id as key
tickets_out = {}
for e in clean_events:
    eid = e['id']
    sc = e.get('soldCount')
    tr = e.get('totalRevenue')
    if sc is not None and tr is not None:
        tickets_out[eid] = {"count": sc, "revenue": tr}
    elif eid in tickets:
        tickets_out[eid] = tickets[eid]

print(f"Tickets gerados: {len(tickets_out)}")

# Generate the output file
lines = []
lines.append('// Dados embarcados para Cloudflare Pages Functions')
lines.append('// Auto-gerado de src/lib/db-embed.ts')
lines.append('')
lines.append('export const EVENTOS = [')
for i, e in enumerate(clean_events):
    comma = ',' if i < len(clean_events) - 1 else ''
    eid = json.dumps(e['id'])
    title = json.dumps(e['title'])
    date = json.dumps(str(e['date']))
    sid = json.dumps(e.get('symplaEventId') or '')
    sc = e.get('soldCount')
    tr = e.get('totalRevenue')
    cap = e.get('capacity')
    status = json.dumps(e.get('status') or 'completed')
    line = f'  {{"id":{eid},"title":{title},"date":{date},"symplaEventId":{sid},"soldCount":{sc},"totalRevenue":{tr},"capacity":{cap},"status":{status}}}{comma}'
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

print(f"\nArquivo escrito: {len(clean_events)} eventos, {len(tickets_out)} tickets")
print(f"Tamanho: {len(out)} bytes")
