#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
#  sympla-sync-complete.sh — Complete Sympla Sync Orchestrator
# ════════════════════════════════════════════════════════════════════
#
#  Orchestrates the full sync pipeline:
#    1. Browser automation login (if needed)
#    2. Internal API fetch + DB import
#    3. Public API orders sync (for accessible events)
#
#  Designed to be run via cron every 6 hours.
#
#  Usage:
#    bash scripts/sympla-sync-complete.sh          # Full pipeline
#    bash scripts/sympla-sync-complete.sh --status  # Show last sync status
#    bash scripts/sympla-sync-complete.sh --force   # Force fresh browser login
#
# ════════════════════════════════════════════════════════════════════

set -euo pipefail

API_DIR="/home/ser/sistema-sarau-secreto/app/packages/api"
COOKIE_FILE="/tmp/sympla-cookies.txt"
SYNC_SCRIPT="$API_DIR/scripts/sympla-browser-sync.py"
TICKET_SYNC_SCRIPT="$API_DIR/scripts/sympla-sync.ts"
LOCK_FILE="/tmp/sympla-sync.lock"
START_TS=$(date +%s)

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     SYMPLA FULL SYNC — $(date '+%Y-%m-%d %H:%M:%S')                ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Help / Status flags ──
if [[ "${1:-}" == "--help" ]]; then
    echo "Usage: bash scripts/sympla-sync-complete.sh [--status] [--force]"
    echo ""
    echo "  (no args)   Run full sync pipeline"
    echo "  --status    Show last sync status from DB and timestamps"
    echo "  --force     Force fresh browser login (ignore cached cookies)"
    echo "  --help      Show this help"
    exit 0
fi

if [[ "${1:-}" == "--status" ]]; then
    echo -e "${CYAN}📊 Last Sync Status${NC}"
    echo "──────────────────────────────────────"
    if [ -f "/tmp/last-sympla-browser-sync.txt" ]; then
        echo -e "  Last browser sync: $(cat /tmp/last-sympla-browser-sync.txt)"
    else
        echo -e "  Last browser sync: ${YELLOW}never${NC}"
    fi
    if [ -f "$COOKIE_FILE" ]; then
        echo -e "  Cookies:           ${GREEN}exist${NC} ($(wc -l < "$COOKIE_FILE") lines)"
        # Check cookie age
        AGE=$(( $(date +%s) - $(stat -c %Y "$COOKIE_FILE") ))
        AGE_HOURS=$(( AGE / 3600 ))
        if [ $AGE_HOURS -gt 24 ]; then
            echo -e "  Cookie age:        ${YELLOW}${AGE_HOURS}h (may be expired)${NC}"
        else
            echo -e "  Cookie age:        ${GREEN}${AGE_HOURS}h${NC}"
        fi
    else
        echo -e "  Cookies:           ${RED}not found${NC}"
    fi
    echo ""
    
    # Show DB stats
    cd "$API_DIR"
    if [ -f "prisma/dev.db" ]; then
        echo -e "${CYAN}📈 Database Stats${NC}"
        echo "──────────────────────────────────────"
        python3 -c "
import sqlite3
conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM Event')
events = cur.fetchone()[0]
cur.execute(\"SELECT COUNT(*) FROM Event WHERE symplaEventId IS NOT NULL AND symplaEventId != ''\")
with_sympla = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM Ticket')
tickets = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM SymplaSync')
syncs = cur.fetchone()[0]
cur.execute('SELECT status, COUNT(*) FROM SymplaSync GROUP BY status')
sync_statuses = cur.fetchall()
print(f'  Total eventos:        {events}')
print(f'  Com symplaEventId:    {with_sympla}')
print(f'  Total tickets:        {tickets}')
print(f'  Sincronizações:       {syncs}')
for s, c in sync_statuses:
    print(f'    - {s}: {c}')
conn.close()
" 2>/dev/null || echo -e "  ${RED}Could not query DB${NC}"
    fi
    echo ""
    echo -e "${YELLOW}💡 Run without flags to trigger a sync:${NC}"
    echo "   bash scripts/sympla-sync-complete.sh"
    exit 0
fi

# ── Lock file (prevent concurrent runs) ──
if [ -f "$LOCK_FILE" ]; then
    LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") ))
    if [ $LOCK_AGE -lt 3600 ]; then
        echo -e "${YELLOW}⚠️  Lock file exists (${LOCK_AGE}s old) — another sync may be running${NC}"
        echo "   If stuck, remove with: rm -f $LOCK_FILE"
        exit 1
    else
        echo -e "${YELLOW}⚠️  Removing stale lock file (${LOCK_AGE}s old)${NC}"
        rm -f "$LOCK_FILE"
    fi
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# ── Step 1: Browser Automation (Python Playwright) ──
echo -e "${CYAN}┌─ Step 1/4: Browser Login & Event Fetch ─────────────────────┐${NC}"
echo ""

PYTHON="/home/ser/projetos/hermes-autonomo/.venv/bin/python3"
if [ ! -x "$PYTHON" ]; then
    PYTHON="python3"
fi

SYNC_ARGS=""
if [[ "${1:-}" == "--force" ]]; then
    echo -e "${YELLOW}  Force mode: deleting existing cookies${NC}"
    rm -f "$COOKIE_FILE"
    SYNC_ARGS=""
fi

echo -e "  Running: $PYTHON $SYNC_SCRIPT $SYNC_ARGS"
echo ""

if ! $PYTHON "$SYNC_SCRIPT" $SYNC_ARGS; then
    EXIT_CODE=$?
    echo -e "${RED}❌ Browser sync failed with exit code $EXIT_CODE${NC}"
    echo ""
    echo -e "${YELLOW}  Possible issues:${NC}"
    echo "    - Invalid credentials"
    echo "    - CAPTCHA challenge (run with --visible to debug)"
    echo "    - Network issues"
    echo ""
    echo -e "${YELLOW}  Debug: python3 scripts/sympla-browser-sync.py --visible${NC}"
    rm -f "$LOCK_FILE"
    exit $EXIT_CODE
fi

echo ""
echo -e "${GREEN}  ✅ Step 1 complete${NC}"
echo ""

# ── Step 2: Public API Sync for accessible events ──
echo -e "${CYAN}┌─ Step 2/4: Public API Sync (orders) ─────────────────────────┐${NC}"
echo ""

cd "$API_DIR"

# Check if we have events that the public API can access
# The browser sync script already handled the internal API events
# Now sync orders for events accessible via public API

if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo -e "  Running: npx tsx scripts/sympla-sync.ts"
echo ""

if npx tsx scripts/sympla-sync.ts; then
    echo -e "${GREEN}  ✅ Public API sync completed${NC}"
else
    echo -e "${YELLOW}  ⚠️  Public API sync had issues (some events may not be accessible)${NC}"
fi

echo ""

# ── Step 3: Aggregate Data Import (internal API) ──
# Note: The Python script already imports aggregated data directly.
# But we run this as a secondary pass to ensure completeness.
echo -e "${CYAN}┌─ Step 3/4: Aggregate Data Import ────────────────────────────┐${NC}"
echo ""

if [ -f "/tmp/sympla-events-agg.json" ]; then
    echo -e "  Running: python3 scripts/sympla-aggregate-import.py"
    echo ""
    if $PYTHON scripts/sympla-aggregate-import.py 2>&1; then
        echo -e "${GREEN}  ✅ Aggregate import completed${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Aggregate import had warnings (check above)${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  No aggregate data file found at /tmp/sympla-events-agg.json${NC}"
fi

echo ""

# ── Step 4: Summary ──
DURATION=$(( $(date +%s) - START_TS ))

echo -e "${CYAN}┌─ Summary ────────────────────────────────────────────────────┐${NC}"
echo ""

# Count stats from DB
cd "$API_DIR"
python3 -c "
import sqlite3
conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM Event')
events = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM Ticket')
tickets = cur.fetchone()[0]
cur.execute(\"SELECT COUNT(*) FROM Event WHERE symplaEventId IS NOT NULL AND symplaEventId != ''\")
with_sympla = cur.fetchone()[0]
cur.execute(\"SELECT COUNT(*) FROM Event WHERE soldCount IS NOT NULL\")
with_sold = cur.fetchone()[0]
conn.close()
print(f'    Eventos no banco:       {events}')
print(f'    Com symplaEventId:      {with_sympla}')
print(f'    Com dados de venda:     {with_sold}')
print(f'    Tickets:                {tickets}')
"

echo ""
echo -e "${GREEN}  ✅ Full sync completed in ${DURATION}s${NC}"
echo -e "${CYAN}└────────────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "  📝 Log: /tmp/sympla-browser-sync.py.log (if available)"
echo -e "  🍪 Cookies: $COOKIE_FILE"
echo -e "  📅 Next auto-sync: ~6 hours"

# Clean up old screenshots (keep last 3)
ls -t /tmp/sympla-*.png 2>/dev/null | tail -n +4 | xargs rm -f 2>/dev/null || true
