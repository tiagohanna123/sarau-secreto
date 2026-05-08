#!/usr/bin/env bash
set -euo pipefail

# Yuzer Auto-Sync — wrapper for cron
# Persiste vendas do Yuzer Eagle no banco SQLite
#
# Usage:
#   bash scripts/yuzer-sync.sh
#   (cron-friendly: logs to stdout, exits with code)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$ROOT_DIR/packages/api"

cd "$API_DIR"
DATABASE_URL="file:$(pwd)/prisma/dev.db" npx tsx scripts/yuzer-auto-sync.ts 2>&1
