#!/usr/bin/env bash
# sympla-aggregate-import.sh — Fetch aggregated data from Sympla internal API
# and import soldCount, totalRevenue, capacity into the database.
#
# Part of the sarau-sympla-full-sync pipeline.
# Called by cron after sympla-full-sync.sh.
#
# Exit codes:
#   0 - Success
#   2 - Session expired (cookies invalid)
#   3 - Critical error

set -euo pipefail

API_DIR="/home/ser/sistema-sarau-secreto/app/packages/api"
COOKIE_FILE="/tmp/sympla-cookies.txt"
AGG_JSON="/tmp/sympla-events-agg.json"
TIMESTAMP_FILE="/tmp/last-sympla-aggregate-sync.txt"
START_TS=$(date +%s)

echo "[SYMPLA-AGGREGATE] Starting at $(date)"

# ── Helper: fetch a page from Sympla internal API ──
sync_with_curl() {
  local page=$1
  curl -s "https://organizador.sympla.com.br/ajax/meus-eventos?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page=${page}" \
    -H "X-Requested-With: XMLHttpRequest" \
    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
    -b "$COOKIE_FILE"
}

# ── Step 1: Test cookies ──
if [ ! -f "$COOKIE_FILE" ]; then
  echo "[SYMPLA-AGGREGATE] ERROR: Cookie file $COOKIE_FILE not found"
  exit 2
fi

echo "[SYMPLA-AGGREGATE] Testing cookies..."
TEST=$(sync_with_curl 1)
TEST_COUNT=$(echo "$TEST" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('events',[])))" 2>/dev/null || echo "0")

if [ "$TEST_COUNT" -eq 0 ]; then
  echo "[SYMPLA-AGGREGATE] ERROR: Session expired — cookies invalid"
  echo "[SYMPLA-AGGREGATE] Run browser automation to refresh session, then retry"
  echo "SYMPLA_SESSION_EXPIRED"
  exit 2
fi

echo "[SYMPLA-AGGREGATE] Cookies OK — $TEST_COUNT events on page 1"

# ── Step 2: Fetch both pages ──
echo "[SYMPLA-AGGREGATE] Fetching page 1..."
P1=$(sync_with_curl 1)

echo "[SYMPLA-AGGREGATE] Fetching page 2..."
P2=$(sync_with_curl 2)

# Validate page 2
P2_COUNT=$(echo "$P2" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('events',[])))" 2>/dev/null || echo "0")
echo "[SYMPLA-AGGREGATE] Page 2: $P2_COUNT events"

# ── Step 3: Save raw JSON for logging / debugging ──
# Merge both pages into a combined JSON file
python3 -c "
import json, sys
p1 = json.loads(sys.argv[1])
p2 = json.loads(sys.argv[2])
all_events = p1.get('events', []) + p2.get('events', [])
# Filter out test event
real_events = [e for e in all_events if e.get('NAME','').lower() != 'teste']
with open('$AGG_JSON', 'w') as f:
    json.dump(real_events, f, ensure_ascii=False, indent=2)
print(f'Saved {len(real_events)} real events to {sys.argv[3]}')
" "$P1" "$P2" "$AGG_JSON"

# ── Step 4: Import into DB ──
cd "$API_DIR"
echo "[SYMPLA-AGGREGATE] Importing into database..."
python3 scripts/sympla-aggregate-import.py --json "$AGG_JSON"

IMPORT_EXIT=$?
if [ $IMPORT_EXIT -ne 0 ] && [ $IMPORT_EXIT -ne 1 ]; then
  # Exit 1 from Python script is just partial failure (some events not found)
  # Other exits are critical
  echo "[SYMPLA-AGGREGATE] ERROR: Import failed with exit code $IMPORT_EXIT"
  exit 3
fi

# ── Step 5: Save timestamp ──
date -Iseconds > "$TIMESTAMP_FILE"
echo "[SYMPLA-AGGREGATE] Sync timestamp saved to $TIMESTAMP_FILE"

DURATION=$(( $(date +%s) - START_TS ))
echo "[SYMPLA-AGGREGATE] Completed in ${DURATION}s at $(date)"
exit 0
