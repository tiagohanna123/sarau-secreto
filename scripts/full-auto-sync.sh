#!/usr/bin/env bash
# full-auto-sync.sh — Pipeline completo: Yuzer sync -> build -> deploy
# Executado por cron. O yuzer-embed-sync.py ja atualiza bar-embed.ts E functions/data/bar.ts
set -euo pipefail
LOG="/tmp/sarau-full-sync-$(date +%Y%m%d-%H%M).log"
PROJ="/home/ser/sistema-sarau-secreto"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Iniciando pipeline completo" | tee "$LOG"

# 1. Yuzer sync (atualiza bar-embed.ts + functions/data/bar.ts)
echo "[sync] 1/4 Yuzer sync via Python..." | tee -a "$LOG"
python3 "$PROJ/scripts/yuzer-embed-sync.py" 2>&1 | tee -a "$LOG"

# 2. Build
echo "[sync] 2/4 Build (npm run build)..." | tee -a "$LOG"
cd "$PROJ/app"
npm run build 2>&1 | tail -10 | tee -a "$LOG"

# 3. Git commit + push
echo "[sync] 3/4 Git commit..." | tee -a "$LOG"
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

# 4. Deploy via wrangler
echo "[sync] 4/4 Deploy via wrangler..." | tee -a "$LOG"
cd "$PROJ/app"
npx wrangler pages deploy dist --project-name sarau-gestao --branch main 2>&1 | tee -a "$LOG"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Pipeline completo!" | tee -a "$LOG"
