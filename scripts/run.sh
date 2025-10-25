#!/usr/bin/env bash
# Start the PCWL Django backend locally (manual run helper).
#
# Usage (from repo root):
#   ./scripts/run.sh                 # activate venv (if present), migrate, runserver 127.0.0.1:8000
#   HOST=0.0.0.0 PORT=8001 ./scripts/run.sh   # bind to a custom host/port
#   PYTHON=python3.11 ./scripts/run.sh        # use a specific Python (for checks)
#
# Notes:
# - If you see "Django is not installed", run: ./scripts/setup.sh
# - If migrations are pending or DB is missing, this script will run ./scripts/migrate.sh automatically.
# - Press Ctrl+C to stop the server.

set -euo pipefail

REPO_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
cd "$REPO_ROOT"

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}
PY_BIN=${PYTHON:-python3}

# If a venv exists at .venv, activate it to ensure dependencies are available.
if [[ -d "$REPO_ROOT/.venv" && -f "$REPO_ROOT/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1090
  . "$REPO_ROOT/.venv/bin/activate"
  PY_BIN=python
fi

# Guard against incompatible Python versions (Django 3.2.x requires < 3.13)
PY_VER_STR=$("$PY_BIN" -c 'import sys; print("%d.%d"%sys.version_info[:2])' 2>/dev/null || echo "0.0")
PY_MAJOR=${PY_VER_STR%%.*}
PY_MINOR=${PY_VER_STR#*.}
if [[ "$PY_MAJOR" -ge 3 && "$PY_MINOR" -ge 13 ]]; then
  echo "[PCWL run] ERROR: Detected Python $PY_VER_STR which is incompatible with Django 3.2.x (stdlib cgi module removed)." >&2
  echo "[PCWL run] Fix: Recreate the virtualenv with Python 3.11 (recommended):" >&2
  echo "            rm -rf .venv && PYTHON=python3.11 ./scripts/setup.sh" >&2
  exit 1
fi

# Quick sanity check for Django
if ! "$PY_BIN" -c "import django" >/dev/null 2>&1; then
  echo "[PCWL run] ERROR: Django is not installed for '$PY_BIN'." >&2
  echo "[PCWL run] Run ./scripts/setup.sh first, then re-run this script." >&2
  echo "[PCWL run] If you see 'permission denied', use: bash scripts/setup.sh" >&2
  echo "[PCWL run] Or make scripts executable once: chmod +x scripts/*.sh" >&2
  exit 1
fi

# Ensure DB schema is up-to-date
if [[ -x "$REPO_ROOT/scripts/migrate.sh" ]]; then
  "$REPO_ROOT/scripts/migrate.sh"
else
  bash "$REPO_ROOT/scripts/migrate.sh"
fi

# Start the dev server
cd "$REPO_ROOT/backend"
echo "[PCWL run] Starting Django dev server at http://$HOST:$PORT/ (Ctrl+C to stop)"
exec $PY_BIN manage.py runserver "$HOST:$PORT"
