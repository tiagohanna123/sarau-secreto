#!/bin/bash
# post-sync.sh — Regenera ambos os embeds após import/sync + rebuild
# Uso: bash scripts/post-sync.sh
# Chamado automaticamente após cada sync do Sympla ou importação de bar
# NOTA: NÃO chama npm run build (evita recursão infinita com o próprio build script)
#
# Fluxo:
#   preprocess-db.sh + preprocess-bar-backup.py -> embeds atualizados
#   gerar-embeds.py -> sobrescreve com dados do SQLite (se banco tiver registros)
#   rebuild da dist

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "🔄 post-sync: regenerando embeds..."

# 1. Regenera db-embed.ts do banco SQLite (apenas se banco existir e tiver dados)
DB_PATH="$ROOT/packages/api/prisma/dev.db"
if [ -f "$DB_PATH" ] && [ "$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM Event;' 2>/dev/null || echo 0)" -gt 0 ]; then
  bash "$ROOT/scripts/preprocess-db.sh"
else
  echo "⚠️  Banco SQLite sem dados — mantendo db-embed.ts existente (git)"
fi

# 2. Regenera bar-embed.ts do backup Yuzer (fonte principal de dados de bar)
BACKUP_DIR="$HOME/sarau-yuzer-backup"
if [ -d "$BACKUP_DIR" ]; then
  python3 "$ROOT/scripts/preprocess-bar-backup.py"
  echo "✅ bar-embed regenerado do backup Yuzer"
else
  echo "⚠️  Backup Yuzer não encontrado em $BACKUP_DIR — mantendo bar-embed.ts existente"
fi

# 2b. Sobrescreve com dados AO VIVO do Yuzer (cobre eventos recentes que o backup nao tem)
echo "🔄 yuzer-embed-sync: buscando dados vivos..."
python3 "$ROOT/../scripts/yuzer-embed-sync.py" 2>&1 || echo "⚠️  yuzer-embed-sync falhou (proxima execucao tentara de novo)"

# 3. Atualiza embeds do banco SQLite (apenas se banco tiver registros)
if [ -f "$DB_PATH" ] && [ "$(sqlite3 "$DB_PATH" 'SELECT COUNT(*) FROM BarSale;' 2>/dev/null || echo 0)" -gt 0 ]; then
  python3 /home/ser/.hermes/scripts/gerar-embeds.py 2>&1
else
  echo "⚠️  Banco SQLite sem BarSale — gerar-embeds.py não será executado"
fi

# 4. Rebuild automático da dist com dados atualizados
echo "🏗️  post-sync: rebuild da dist..."
cd "$ROOT"
npx vite build 2>&1 | tail -10

echo "✅ post-sync: completo. Embeds + dist atualizados."
