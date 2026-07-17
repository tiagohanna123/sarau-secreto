#!/usr/bin/env bash
# sync-autonomo.sh — Sync completo + atualizacao de embeds + deploy
# Executado por cron a cada 4h
set -euo pipefail
cd /home/ser/sistema-sarau-secreto
LOG="/tmp/sarau-sync-$(date +%Y%m%d-%H%M).log"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Iniciando..." | tee "$LOG"

# 1. Buscar Yuzer e atualizar bar-embed.ts
echo "[sync] Yuzer sync via script Python..." | tee -a "$LOG"
python3 /home/ser/sistema-sarau-secreto/scripts/yuzer-embed-sync.py 2>&1 | tee -a "$LOG"

# 2. Commitar mudancas no git (se houver)
echo "[sync] Git status..." | tee -a "$LOG"
cd /home/ser/sistema-sarau-secreto
if ! git diff --quiet; then
  git add -A
  git commit -m "sync autonomo $(date +%Y-%m-%d-%H:%M)" 2>&1 | tee -a "$LOG"
  git pull --rebase origin main 2>&1 | tee -a "$LOG"
  git push origin main 2>&1 | tee -a "$LOG"
  echo "[sync] Deploy acionado via push." | tee -a "$LOG"
else
  echo "[sync] Nenhuma alteracao para deploy." | tee -a "$LOG"
fi

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Concluido." | tee -a "$LOG"
