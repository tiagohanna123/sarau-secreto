#!/usr/bin/env bash
# full-auto-sync.sh — Pipeline completo: Yuzer sync -> functions/data -> build -> deploy
# Executado por cron. Nao depende de Git provider.
set -euo pipefail
LOG="/tmp/sarau-full-sync-$(date +%Y%m%d-%H%M).log"
PROJ="/home/ser/sistema-sarau-secreto"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Iniciando pipeline completo" | tee "$LOG"

# 1. Buscar Yuzer e atualizar bar-embed.ts
echo "[sync] 1/5 Yuzer sync via Python..." | tee -a "$LOG"
python3 "$PROJ/scripts/yuzer-embed-sync.py" 2>&1 | tee -a "$LOG"

# 2. Sincronizar functions/data/bar.ts com dados recentes do Yuzer
# O bar-embed.ts tem eventBarRevenue com chaves de DATA (ex: "2026-07-16")
# O functions/data/bar.ts tem BAR_REVENUE_MAP com chaves de ID (ex: "sympla-3500838")
# E BAR_EVENTOS com array de eventos com data e revenue
# Essa etapa atualiza BAR_EVENTOS com dados frescos do Yuzer
echo "[sync] 2/5 Atualizando functions/data/bar.ts com dados Yuzer..." | tee -a "$LOG"
python3 -c "
import json, re
from pathlib import Path
from datetime import datetime, timedelta

PROJ = Path('$PROJ')
BAR_EMBED_PATH = PROJ / 'app/src/lib/bar-embed.ts'
FUNCS_BAR_PATH = PROJ / 'app/functions/data/bar.ts'

# 1. Ler Yuzer events do bar-embed.ts
embed_text = BAR_EMBED_PATH.read_text()

# Extrair array eventos
m = re.search(r'\"eventos\":\s*\[(.+?)\]\s*,', embed_text, re.DOTALL)
if not m:
    print('ERRO: event array not found in bar-embed.ts')
    exit(0)

# Parse each event object - extract start date and revenue
import ast
events_text = '[' + m.group(1) + ']'
try:
    yuzer_events = json.loads(events_text)
except:
    # Try parsing with single quotes fix
    events_text_clean = events_text.replace(\"'\", '\"')
    try:
        yuzer_events = json.loads(events_text_clean)
    except:
        print('ERRO: could not parse Yuzer events JSON')
        exit(0)

# Build date->revenue map
yuzer_rev = {}
yuzer_detail = {}
for ev in yuzer_events:
    start = ev.get('start', '')[:10]
    if start:
        yuzer_rev[start] = ev.get('revenue', 0)
        yuzer_detail[start] = ev

print(f'  Yuzer: {len(yuzer_events)} eventos, datas: {sorted(yuzer_rev.keys())[-3:]} ...')

# 2. Ler functions/data/bar.ts atual
funcs_text = FUNCS_BAR_PATH.read_text()

# Encontrar e parsear BAR_EVENTOS array
m2 = re.search(r'export const BAR_EVENTOS = \[(.*?)\]', funcs_text, re.DOTALL)
if not m2:
    print('ERRO: BAR_EVENTOS not found')
    exit(0)

# Parse current events
events_raw = '[' + m2.group(1) + ']'
try:
    current_events = json.loads(events_raw)
except:
    # Limpar trailing commas e tentar de novo
    import re as re2
    cleaned = re2.sub(r',\s*\}', '}', events_raw)
    cleaned = re2.sub(r',\s*\]', ']', cleaned)
    try:
        current_events = json.loads(cleaned)
    except:
        print('ERRO: could not parse BAR_EVENTOS')
        exit(0)

# Build date lookup for current events
current_by_date = {}
for ce in current_events:
    d = ce.get('start', '')[:10]
    if d:
        current_by_date[d] = ce

# Merge: update existing dates, add new ones
updated_count = 0
added_count = 0

# Build new BAR_EVENTOS
new_events = []
seen_dates = set()

# Preserve existing events in order, updating when Yuzer has data
for ce in current_events:
    d = ce.get('start', '')[:10]
    if d and d in yuzer_rev:
        # Update revenue from Yuzer
        ye = yuzer_detail[d]
        ce['revenue'] = ye.get('revenue', ce.get('revenue', 0))
        ce['orders'] = ye.get('orders', ce.get('orders', 0))
        # Add products if Yuzer has them
        if ye.get('produtos') and len(ye['produtos']) > 0:
            ce['products'] = ye['produtos']
        updated_count += 1
    new_events.append(ce)
    if d:
        seen_dates.add(d)

# Add new Yuzer events not in BAR_EVENTOS
for d in sorted(yuzer_rev.keys()):
    if d not in seen_dates:
        ye = yuzer_detail[d]
        new_ev = {
            'start': d + 'T20:00:00.000Z',
            'end': d + 'T23:59:00.000Z',
            'title': f'Yuzer Event ({d})',
            'revenue': ye.get('revenue', 0),
            'orders': ye.get('orders', 0),
            'products': ye.get('produtos', [])
        }
        new_events.append(new_ev)
        added_count += 1

print(f'  Atualizados: {updated_count}, adicionados: {added_count}')

# Write new BAR_EVENTOS
events_json = json.dumps(new_events, ensure_ascii=False)
# Get the indentation right - 1 tab indent like original
events_formatted = json.dumps(new_events, ensure_ascii=False, indent=2)
events_formatted = events_formatted.replace('\\n', '\n')
# Replace BAR_EVENTOS
new_funcs = funcs_text[:m2.start()] + 'export const BAR_EVENTOS = ' + events_formatted + funcs_text[m2.end():]

# 3. Update BAR_REVENUE_MAP: add date-keyed entries from Yuzer
m3 = re.search(r'export const BAR_REVENUE_MAP = \{(.*?)\s*\}', new_funcs, re.DOTALL)
if m3:
    map_body = m3.group(1)
    # Parse existing
    existing = {}
    for line in map_body.split('\n'):
        line = line.rstrip(',').strip()
        if not line:
            continue
        mm = re.match(r'\"([^\"]+)\"\s*:\s*(null|\{[^}]*\})', line)
        if mm:
            existing[mm.group(1)] = mm.group(2)
    
    # Add/update date entries from Yuzer
    for d in sorted(yuzer_rev.keys()):
        ye = yuzer_detail[d]
        rev = ye.get('revenue', 0)
        orders = ye.get('orders', 0)
        ticket = round(rev / orders, 2) if orders > 0 else 0
        entry = '{\"revenue\": %d, \"transactions\": %d, \"perCapita\": %.2f}' % (rev, orders, ticket)
        existing[d] = entry
    
    # Rebuild
    revenue_lines = []
    for k in sorted(existing.keys()):
        revenue_lines.append('    \"%s\": %s' % (k, existing[k]))
    new_rev_map = 'export const BAR_REVENUE_MAP = {\n' + ',\n'.join(revenue_lines) + '\n  }'
    new_funcs = new_funcs[:m3.start()] + new_rev_map + new_funcs[m3.end():]

FUNCS_BAR_PATH.write_text(new_funcs)
print('  functions/data/bar.ts atualizado!')
" 2>&1 | tee -a "$LOG"

# 3. Build
echo "[sync] 3/5 Build (npm run build)..." | tee -a "$LOG"
cd "$PROJ/app"
npm run build 2>&1 | tail -10 | tee -a "$LOG"

# 4. Git commit + push
echo "[sync] 4/5 Git commit..." | tee -a "$LOG"
cd "$PROJ"
if ! git diff --quiet; then
  git add -A
  git commit -m "auto-sync $(date +%Y-%m-%d-%H:%M) — Yuzer + build" 2>&1 | tee -a "$LOG"
  git pull --rebase origin main 2>&1 | tee -a "$LOG" || true
  git push origin main 2>&1 | tee -a "$LOG" || true
  echo "[sync] Git commit + push OK" | tee -a "$LOG"
else
  echo "[sync] Sem alteracoes para commitar" | tee -a "$LOG"
fi

# 5. Deploy via wrangler
echo "[sync] 5/5 Deploy via wrangler..." | tee -a "$LOG"
cd "$PROJ/app"
npx wrangler pages deploy dist --project-name sarau-gestao --branch main 2>&1 | tee -a "$LOG"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Pipeline completo!" | tee -a "$LOG"
