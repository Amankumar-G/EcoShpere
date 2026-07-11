#!/bin/bash
# dev.sh — Start Odoo dev environment in tmux
# Usage:
#   ./dev.sh          → start docker db + server + client (dev mode)
#   ./dev.sh setup    → run setup only (install/migrate/generate), no start
#   ./dev.sh stop     → kill the tmux session

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
SESSION="odoo"

# ── Colors ──────────────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${G}▶${NC} $1"; }
warn() { echo -e "${Y}!${NC} $1"; }
err()  { echo -e "${R}✗${NC} $1"; }

# ── Helpers ──────────────────────────────────────────────────────────────────
check_deps() {
  for cmd in tmux pnpm docker; do
    if ! command -v "$cmd" &>/dev/null; then
      err "Required command not found: $cmd"
      exit 1
    fi
  done
}

ensure_docker_up() {
  log "Ensuring Docker containers are up..."
  cd "$ROOT_DIR"
  docker compose -f docker-compose.yml up -d

  log "Waiting for containers to be healthy..."
  local retries=30
  while [ $retries -gt 0 ]; do
    local not_ready unhealthy
    not_ready=$(docker compose -f docker-compose.yml ps --format json 2>/dev/null \
      | grep -c '"Health":"starting"' || true)
    unhealthy=$(docker compose -f docker-compose.yml ps --format json 2>/dev/null \
      | grep -c '"Health":"unhealthy"' || true)

    if [ "$not_ready" -eq 0 ] && [ "$unhealthy" -eq 0 ]; then
      log "Docker containers are ready."
      return
    fi
    sleep 2
    retries=$((retries - 1))
  done

  warn "Docker containers did not report healthy in time — continuing anyway."
}

# ── Setup: install / prisma generate ─────────────────────────────────────────
do_setup() {
  ensure_docker_up

  if [ ! -d "$SERVER_DIR/node_modules" ]; then
    log "Installing server deps..."
    (cd "$SERVER_DIR" && pnpm install)
  fi
  log "Running prisma generate..."
  (cd "$SERVER_DIR" && pnpm orm:sync)

  if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    log "Installing client deps..."
    (cd "$CLIENT_DIR" && pnpm install)
  fi

  log "Setup complete."
}

# ── Stop existing session ────────────────────────────────────────────────────
do_stop() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux kill-session -t "$SESSION"
    log "Killed tmux session '$SESSION'."
  else
    warn "No session '$SESSION' running."
  fi
}

# ── Start tmux session ───────────────────────────────────────────────────────
do_start() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    warn "Session '$SESSION' already running — killing it first."
    tmux kill-session -t "$SESSION"
  fi

  ensure_docker_up

  log "Starting tmux session '$SESSION'..."
  tmux new-session -d -s "$SESSION" -n "server" -x 220 -y 50
  tmux send-keys -t "$SESSION:server" "cd $SERVER_DIR && pnpm start:dev" Enter

  tmux new-window -t "$SESSION" -n "client"
  tmux send-keys -t "$SESSION:client" "cd $CLIENT_DIR && pnpm dev" Enter

  tmux select-window -t "$SESSION:server"

  log "Session '$SESSION' started."
  echo ""
  echo "  Windows:  server (0)  |  client (1)"
  echo "  Switch:   Ctrl+b then window number"
  echo "  Detach:   Ctrl+b d"
  echo "  Stop:     ./dev.sh stop"
  echo ""

  tmux attach-session -t "$SESSION"
}

# ── Entry point ───────────────────────────────────────────────────────────────
check_deps

MODE="${1:-start}"

case "$MODE" in
  setup)
    do_setup
    ;;
  stop)
    do_stop
    ;;
  start|"")
    do_start
    ;;
  *)
    echo "Usage: $0 [setup|stop|start]"
    exit 1
    ;;
esac
