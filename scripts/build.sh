#!/usr/bin/env bash
set -euo pipefail

# Sarau Secreto — Build Pipeline
# Gera o bundle de produção do frontend.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "→ Gerando Prisma Client..."
cd "$ROOT_DIR/packages/api"
npx prisma generate > /dev/null 2>&1

echo "→ Build do frontend..."
cd "$ROOT_DIR"
npx vite build

echo "✓ Build completo. Output em $ROOT_DIR/dist/"
