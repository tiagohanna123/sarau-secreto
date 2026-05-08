#!/usr/bin/env bash
set -euo pipefail

# Deploy Script — Sarau Secreto
#
# Usage:
#   bash scripts/deploy.sh               # Deploy frontend (Cloudflare Pages)
#   bash scripts/deploy.sh --api         # Deploy API (requires SSH_HOST env)
#   bash scripts/deploy.sh --full        # Frontend + API

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

deploy_frontend() {
  echo "→ Build do frontend..."
  cd "$ROOT_DIR"
  npx vite build

  echo "→ Deploy para Cloudflare Pages..."
  npx wrangler pages deploy dist/ --project-name=sarau-secreto

  echo "✓ Frontend publicado!"
}

deploy_api() {
  if [ -z "${SSH_HOST:-}" ]; then
    echo "! SSH_HOST não definida. API não foi deployada."
    echo "  Configure SSH_HOST e rode:"
    echo "    rsync -az --delete $ROOT_DIR/packages/api/ user@host:/app/api/"
    echo "    ssh user@host 'cd /app/api && npm install && npx prisma generate && pm2 restart sarau-api'"
    return
  fi

  echo "→ Deploy da API via rsync..."
  rsync -az --delete \
    --exclude 'node_modules' \
    --exclude 'dev.db' \
    --exclude '.env' \
    "$ROOT_DIR/packages/api/" "$SSH_HOST:/app/sarau-api/"

  ssh "$SSH_HOST" 'cd /app/sarau-api && npm install && npx prisma generate && pm2 restart sarau-api || pm2 start npm --name sarau-api -- start'

  echo "✓ API publicada!"
}

case "${1:-frontend}" in
  --api|-a) deploy_api ;;
  --full|-f) deploy_frontend; deploy_api ;;
  *) deploy_frontend ;;
esac
