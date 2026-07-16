#!/bin/bash
# post-sync.sh — Regenera db-embed + rebuild (bar-embed é manual/committado)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "🔄 post-sync: regenerando db-embed..."

# 1. Regenera db-embed.ts do banco SQLite (apenas se banco existir e tiver dados)
DB_PATH="$ROOT/packages/api/prisma/dev.db"
if [ -f "$DB_PATH" ] && [ "$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM Event;' 2>/dev/null || echo 0)" -gt 0 ]; then
  bash "$ROOT/scripts/preprocess-db.sh"
else
  echo "⚠️  Banco SQLite sem dados — mantendo db-embed.ts existente (git)"
fi

# 2. bar-embed.ts NÃO é regenerado automaticamente.
#    Edições manuais ou via script yuzer-embed-sync.py são commitadas diretamente.
#    O backup Yuzer (preprocess-bar-backup.py) está desatualizado desde Maio/2026.
echo "⏭️  bar-embed: mantendo versão commitada (não regenera do backup)"

# 3. Rebuild da dist
echo "🏗️  post-sync: rebuild da dist..."
cd "$ROOT"
npx vite build 2>&1 | tail -10

echo "✅ post-sync: completo."
