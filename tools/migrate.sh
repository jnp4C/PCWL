#!/usr/bin/env bash
# Apply Django database migrations for the PCWL backend.
# Usage:
#   ./tools/migrate.sh           # migrate using current venv / python on PATH
#   PYTHON=python3 ./tools/migrate.sh
#   VENV=.venv ./tools/migrate.sh  # optional: activate a venv before running
#
# Notes:
# - Expects to be run from the repository root.
# - Uses SQLite by default (see backend/pcwl_backend/settings.py).
# - If running first time, run: ./tools/setup.sh
#
set -euo pipefail

REPO_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
cd "$REPO_ROOT"

# Activate explicitly provided VENV if set
if [[ -n "${VENV:-}" && -d "$VENV" ]]; then
  if [[ -f "$VENV/bin/activate" ]]; then
    # shellcheck disable=SC1090
    . "$VENV/bin/activate"
  fi
fi

# If no explicit VENV, but a local .venv exists, activate it automatically
if [[ -z "${VENV:-}" && -f "$REPO_ROOT/.venv/bin/activate" ]]; then
  # shellcheck disable=SC1090
  . "$REPO_ROOT/.venv/bin/activate"
fi

# Choose python interpreter preference order:
# 1) PYTHON env var if provided
# 2) "python" from the (possibly activated) virtualenv
# 3) fallback to python3 on PATH
if [[ -n "${PYTHON:-}" ]]; then
  PYTHON_BIN="$PYTHON"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN=python
else
  PYTHON_BIN=python3
fi

# Guard against incompatible Python versions (Django 3.2.x requires < 3.13)
PY_VER_STR=$("$PYTHON_BIN" -c 'import sys; print("%d.%d"%sys.version_info[:2])' 2>/dev/null || echo "0.0")
PY_MAJOR=${PY_VER_STR%%.*}
PY_MINOR=${PY_VER_STR#*.}
if [[ "$PY_MAJOR" -ge 3 && "$PY_MINOR" -ge 13 ]]; then
  echo "[PCWL] ERROR: Detected Python $PY_VER_STR which is incompatible with Django 3.2.x (python cgi module removed in 3.13)." >&2
  echo "[PCWL] Fix: Recreate the virtualenv with Python 3.11 (recommended):" >&2
  echo "       rm -rf .venv && PYTHON=python3.11 ./tools/setup.sh" >&2
  echo "       Then re-run: ./tools/migrate.sh" >&2
  exit 1
fi

# Quick check to ensure Django is available
if ! "$PYTHON_BIN" -c "import django" >/dev/null 2>&1; then
  echo "[PCWL] ERROR: Django is not installed for '$PYTHON_BIN'." >&2
  echo "[PCWL] Hint: run ./tools/setup.sh to create a virtualenv and install requirements, then retry." >&2
  echo "[PCWL]       If you see 'permission denied', run: bash tools/setup.sh" >&2
  echo "[PCWL]       Or make scripts executable once: chmod +x tools/*.sh" >&2
  exit 1
fi

echo "[PCWL] Running migrations..."
cd backend

# Create DB and tables if needed, then apply app migrations (including authtoken)
$PYTHON_BIN manage.py migrate --noinput

echo "[PCWL] Migrations applied successfully."
