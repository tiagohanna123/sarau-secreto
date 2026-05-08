#!/usr/bin/env bash
# Full Sympla sync with browser fallback
# Tries curl+cookies first; if session expired, uses browser automation to re-login
set -euo pipefail

API_DIR="/home/ser/sistema-sarau-secreto/app/packages/api"
COOKIE_FILE="/tmp/sympla-cookies.txt"
JSON_FILE="/tmp/sympla-events.json"
START_TS=$(date +%s)

echo "[SYMPLA-SYNC] Starting at $(date)"

sync_with_curl() {
  local page=$1
  curl -s "https://organizador.sympla.com.br/ajax/meus-eventos?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page=${page}" \
    -H "X-Requested-With: XMLHttpRequest" \
    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
    -b "$COOKIE_FILE"
}

# Clean up old events file
rm -f "$JSON_FILE"

# Step 1: Try curl with existing cookies
if [ -f "$COOKIE_FILE" ]; then
  echo "[SYMPLA-SYNC] Trying curl with existing cookies..."
  P1=$(sync_with_curl 1)
  P2=$(sync_with_curl 2)
  
  # Validate response
  P1_VALID=$(echo "$P1" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('events',[])))" 2>/dev/null || echo "0")
  
  if [ "$P1_VALID" -gt 0 ]; then
    echo "[SYMPLA-SYNC] Curl OK — ${P1_VALID} events on page 1"
  else
    echo "[SYMPLA-SYNC] Session expired, need browser fallback"
    P1=""
    P2=""
  fi
fi

# Step 2: Browser fallback if curl failed
if [ -z "${P1:-}" ]; then
  echo "[SYMPLA-SYNC] Browser fallback not implemented in standalone script."
  echo "[SYMPLA-SYNC] Marking demand for Hermes agent to refresh session."
  echo "SYMPLA_SESSION_EXPIRED"
  exit 2
fi

# Step 3: Process and save events
python3 -c "
import json, sys
p1 = json.loads(sys.argv[1])
p2 = json.loads(sys.argv[2])
all_events = p1.get('events', []) + p2.get('events', [])
# Filter out 'teste' event
real_events = [e for e in all_events if e.get('NAME','').lower() != 'teste']
with open('$JSON_FILE', 'w') as f:
    json.dump([{
        'id': int(e['EVENT_ID']),
        'nome': e['NAME'],
        'data': e['START_DATE'],
        'cidade': e.get('CITY', ''),
        'status': e.get('STATUS', ''),
        'vendidos': int(e.get('INDICATOR', {}).get('sold', 0)),
        'capacidade': int(e.get('INDICATOR', {}).get('total', 0))
    } for e in real_events], f, ensure_ascii=False)
print(f'Saved {len(real_events)} real events (from {len(all_events)} total)')
" "$P1" "$P2"

# Step 4: Import metadata into DB
cd "$API_DIR"
python3 scripts/sympla-full-import.py

# Step 5: Import aggregated data (soldCount, totalRevenue)
echo ""
echo "[SYMPLA-SYNC] Running aggregate import..."
bash scripts/sympla-aggregate-import.sh
AGG_EXIT=$?
if [ $AGG_EXIT -ne 0 ]; then
  echo "[SYMPLA-SYNC] WARNING: Aggregate import finished with exit code $AGG_EXIT"
fi

DURATION=$(( $(date +%s) - START_TS ))
echo ""
echo "[SYMPLA-SYNC] Completed in ${DURATION}s at $(date)"
