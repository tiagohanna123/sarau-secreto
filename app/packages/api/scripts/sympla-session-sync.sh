#!/usr/bin/env bash
# Full Sympla sync via session cookies (no browser needed)
# Saves events to /tmp/sympla-events.json and imports to DB
set -euo pipefail

API_DIR="/home/ser/sistema-sarau-secreto/app/packages/api"
COOKIE_FILE="/tmp/sympla-cookies.txt"
JSON_FILE="/tmp/sympla-events.json"

# If cookies don't exist or are expired, we need to abort
if [ ! -f "$COOKIE_FILE" ]; then
  echo "SYMPLA_COOKIES_MISSING"
  exit 1
fi

fetch_page() {
  local page=$1
  curl -s "https://organizador.sympla.com.br/ajax/meus-eventos?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page=${page}" \
    -H "X-Requested-With: XMLHttpRequest" \
    -H "User-Agent: Mozilla/5.0" \
    -b "$COOKIE_FILE"
}

# Fetch page 1 and 2
P1=$(fetch_page 1)
P2=$(fetch_page 2)

# Check if pages are valid JSON
echo "$P1" | python3 -c "import json,sys; d=json.load(sys.stdin); assert len(d.get('events',[])) > 0" 2>/dev/null || {
  echo "SYMPLA_SESSION_EXPIRED"
  exit 2
}

# Merge and save
python3 -c "
import json, sys
p1 = json.loads(sys.argv[1])
p2 = json.loads(sys.argv[2])
all_events = p1.get('events', []) + p2.get('events', [])
with open('$JSON_FILE', 'w') as f:
    json.dump([{
        'id': int(e['EVENT_ID']),
        'nome': e['NAME'],
        'data': e['START_DATE'],
        'cidade': e.get('CITY', ''),
        'status': e.get('STATUS', ''),
        'vendidos': int(e.get('INDICATOR', {}).get('sold', 0)),
        'capacidade': int(e.get('INDICATOR', {}).get('total', 0))
    } for e in all_events], f, ensure_ascii=False)
print(f'Saved {len(all_events)} events')
" "$P1" "$P2"

# Import into DB
cd "$API_DIR"
python3 scripts/sympla-full-import.py
