#!/bin/bash
# post-sync.sh — Apenas rebuild da dist (embeds mantidos manualmente)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "🏗️  post-sync: rebuild da dist..."
cd "$ROOT"
npx vite build 2>&1 | tail -15
echo "✅ post-sync: completo. Dist atualizada."
