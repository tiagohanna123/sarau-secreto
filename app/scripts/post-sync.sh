#!/bin/bash
# post-sync.sh — Regenera ambos os embeds após import/sync + rebuild
# Uso: bash scripts/post-sync.sh
# Chamado automaticamente após cada sync do Sympla ou importação de bar
# NOTA: NÃO chama npm run build (evita recursão infinita com o próprio build script)

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "🔄 post-sync: regenerando embeds..."

# 1. Regenera db-embed.ts do banco SQLite (skip se não existir — CI não tem DB)
if [ -f "$ROOT/packages/api/prisma/dev.db" ]; then
  bash "$ROOT/scripts/preprocess-db.sh"
else
  echo "⚠️  Banco SQLite não encontrado — usando db-embed.ts existente (git)"
fi

# 2. Regenera bar-embed.ts do backup Yuzer (skip se não existir)
if [ -d "$ROOT/../../sarau-yuzer-backup" ]; then
  python3 "$ROOT/scripts/preprocess-bar-backup.py"
else
  echo "⚠️  Backup Yuzer não encontrado — usando bar-embed.ts existente (git)"
fi

# 3. Rebuild automático da dist com dados atualizados
echo "🏗️  post-sync: rebuild da dist..."
cd "$ROOT"
npx tsc -b --noCheck 2>&1 | tail -5
npx vite build 2>&1 | tail -10

echo "✅ post-sync: completo. Embeds + dist atualizados."
