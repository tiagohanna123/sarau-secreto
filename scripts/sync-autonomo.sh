#!/usr/bin/env bash
# sync-autonomo.sh — Sync completo + atualizacao de embeds + deploy
# Executado por cron a cada 4h
# NOTA: git pipeado via cat para evitar crash do RTK (rust panic ao slicear banner)
set -euo pipefail
cd /home/ser/sistema-sarau-secreto
LOG="/tmp/sarau-sync-$(date +%Y%m%d-%H%M).log"

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Iniciando..." | tee "$LOG"

# 0. Verificar token Yuzer antes de rodar
if [ -f .env ]; then
  source .env 2>/dev/null || true
fi
if [ -n "${YUZER_JWT:-}" ]; then
  # Verifica se o JWT expirou (checa exp payload)
  JWT_EXP=$(echo "$YUZER_JWT" | cut -d. -f2 2>/dev/null | python3 -c "import sys,base64,json; d=json.loads(base64.urlsafe_b64decode(sys.stdin.read().ljust(4*((len(sys.stdin.read())//4)+1)%4) if len(sys.stdin.read())%4 else sys.stdin.read()+'===')); print(d.get('exp',0))" 2>/dev/null || echo "0")
  NOW=$(date +%s)
  if [ "$JWT_EXP" -lt "$NOW" ] 2>/dev/null; then
    echo "[sync] AVISO: YUZER_JWT expirado desde $(date -d @$JWT_EXP '+%Y-%m-%d %H:%M' 2>/dev/null || echo 'data desconhecida'). Renove manualmente." | tee -a "$LOG"
  fi
fi

# 1. Buscar Yuzer e atualizar bar-embed.ts
echo "[sync] Yuzer sync via script Python..." | tee -a "$LOG"
python3 /home/ser/sistema-sarau-secreto/scripts/yuzer-embed-sync.py 2>&1 | tee -a "$LOG"

# 2. Commitar mudancas no git (se houver)
echo "[sync] Git status..." | tee -a "$LOG"
cd /home/ser/sistema-sarau-secreto
if ! git diff --quiet; then
  git add -A
  # Pipe via cat para evitar crash do RTK shell (que morre com signal 6 pos-commit)
  # RTK crash mascara: git commit exit 134, mas o commit foi bem-sucedido antes do crash
  git commit -m "sync autonomo $(date +%Y-%m-%d-%H:%M)" 2>&1 | cat | tee -a "$LOG" || true
  GIT_PAGER=cat git pull --rebase origin main 2>&1 | cat | tee -a "$LOG" || true
  git push origin main 2>&1 | cat | tee -a "$LOG" || true
  echo "[sync] Deploy acionado via push." | tee -a "$LOG"
else
  echo "[sync] Nenhuma alteracao para deploy." | tee -a "$LOG"
fi

echo "[sync] $(date -u +%Y-%m-%dT%H:%M:%SZ) — Concluido." | tee -a "$LOG"
