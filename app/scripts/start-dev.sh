#!/usr/bin/env bash
# start-dev.sh — Inicia Sarau Secreto com API + Frontend
# Uso: ./scripts/start-dev.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR"

API_PORT=3002
VITE_PORT=5173
API_DIR="$SCRIPT_DIR/packages/api"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

echo "🚀 Sarau Secreto — Development Server"
echo "========================================"

# ── Mata processos antigos nas portas ──
kill_port() {
  local pid
  pid=$(lsof -t -i ":$1" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    echo "📡 Porta $1 ocupada por PID $pid — matando..."
    kill "$pid" 2>/dev/null || true
    sleep 1
  fi
}

kill_port $API_PORT
kill_port $VITE_PORT

# ── Gera embed data (opcional, silencioso) ──
if [ -f "$SCRIPT_DIR/scripts/preprocess-db.sh" ]; then
  echo "📦 Regenerando embed data..."
  bash "$SCRIPT_DIR/scripts/preprocess-db.sh" 2>/dev/null || echo "   (preprocess falhou — continuando)"
fi

# ── API Backend ──
echo "📡 Iniciando API na porta $API_PORT..."
cd "$API_DIR"
npx tsx src/index.ts > "$LOG_DIR/api.log" 2>&1 &
API_PID=$!
echo "$API_PID" > /tmp/sarau-api.pid

# Aguarda API ficar online
for i in $(seq 1 15); do
  if curl -s "http://localhost:$API_PORT/api/auth/me" > /dev/null 2>&1 || \
     curl -s "http://localhost:$API_PORT/" > /dev/null 2>&1; then
    echo "✅ API online (PID $API_PID)"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "⚠️  API não respondeu — veja logs/api.log"
  fi
  sleep 1
done

# ── Frontend (Vite) ──
echo "🖥️  Iniciando Frontend na porta $VITE_PORT..."
cd "$SCRIPT_DIR"
npx vite --host > "$LOG_DIR/vite.log" 2>&1 &
VITE_PID=$!
echo "$VITE_PID" > /tmp/sarau-vite.pid

echo ""
echo "✅ Sarau Secreto rodando:"
echo "   Frontend: http://localhost:$VITE_PORT"
echo "   API:      http://localhost:$API_PORT"
echo "   Logs:     $LOG_DIR/"
echo ""
echo "📝 Para parar: kill \$(cat /tmp/sarau-api.pid) \$(cat /tmp/sarau-vite.pid)"
echo "========================================"

# Espera os processos (Ctrl+C para parar ambos)
wait
