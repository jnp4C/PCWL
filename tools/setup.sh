#!/usr/bin/env bash
# PCWL local setup script
# - Creates/repairs a virtualenv at .venv (or VENV=...)
# - Installs requirements.txt using a Python version compatible with Django 3.2.x
#
# Usage (from repo root):
#   bash tools/setup.sh                # auto-picks python3.11/3.10/3.9
#   PYTHON=python3.11 bash tools/setup.sh
#   VENV=.venv-alt bash tools/setup.sh
#
set -euo pipefail

REPO_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
cd "$REPO_ROOT"

VENV_DIR=${VENV:-"$REPO_ROOT/.venv"}

# Select a Python interpreter compatible with Django 3.2.x (< 3.13)
if [[ -n "${PYTHON:-}" ]]; then
  PY_BIN="$PYTHON"
elif command -v python3.11 >/dev/null 2>&1; then
  PY_BIN=python3.11
elif command -v python3.10 >/dev/null 2>&1; then
  PY_BIN=python3.10
elif command -v python3.9 >/dev/null 2>&1; then
  PY_BIN=python3.9
elif command -v python3 >/dev/null 2>&1; then
  PY_BIN=python3
else
  echo "[PCWL setup] ERROR: No suitable Python 3 interpreter found. Install Python 3.11 (recommended)." >&2
  echo "[PCWL setup] macOS (Homebrew): brew install python@3.11" >&2
  exit 1
fi

if ! command -v "$PY_BIN" >/dev/null 2>&1; then
  echo "[PCWL setup] ERROR: '$PY_BIN' not found on PATH. Set PYTHON= or install Python 3." >&2
  exit 1
fi

PY_VER_STR=$("$PY_BIN" -c 'import sys; print("%d.%d"%sys.version_info[:2])' 2>/dev/null || echo "0.0")
PY_MAJOR=${PY_VER_STR%%.*}
PY_MINOR=${PY_VER_STR#*.}

# If selected interpreter is >= 3.13, try to switch to a compatible one automatically
if [[ "$PY_MAJOR" -ge 3 && "$PY_MINOR" -ge 13 ]]; then
  echo "[PCWL setup] Detected Python $PY_VER_STR. Django 3.2.x is not compatible with Python >= 3.13 (cgi module removed)." >&2
  for CAND in python3.11 python3.10 python3.9; do
    if command -v "$CAND" >/dev/null 2>&1; then
      PY_BIN="$CAND"
      PY_VER_STR=$("$PY_BIN" -c 'import sys; print("%d.%d"%sys.version_info[:2])')
      echo "[PCWL setup] Switching to $PY_BIN ($PY_VER_STR)." >&2
      break
    fi
  done
  PY_MAJOR=${PY_VER_STR%%.*}
  PY_MINOR=${PY_VER_STR#*.}
  if [[ "$PY_MAJOR" -ge 3 && "$PY_MINOR" -ge 13 ]]; then
    echo "[PCWL setup] ERROR: Still using Python $PY_VER_STR. Please install python3.11 and re-run:" >&2
    echo "               brew install python@3.11" >&2
    echo "               PYTHON=python3.11 bash tools/setup.sh" >&2
    exit 1
  fi
fi

# If a venv exists but is incompatible (>= 3.13), recreate it
if [[ -d "$VENV_DIR" && -x "$VENV_DIR/bin/python" ]]; then
  VENV_VER_STR=$("$VENV_DIR/bin/python" -c 'import sys; print("%d.%d"%sys.version_info[:2])' 2>/dev/null || echo "0.0")
  VENV_MAJOR=${VENV_VER_STR%%.*}
  VENV_MINOR=${VENV_VER_STR#*.}
  if [[ "$VENV_MAJOR" -ge 3 && "$VENV_MINOR" -ge 13 ]]; then
    echo "[PCWL setup] Existing virtualenv uses Python $VENV_VER_STR which is incompatible with this project." >&2
    echo "[PCWL setup] Recreating virtualenv at $VENV_DIR using $PY_BIN ($PY_VER_STR)..." >&2
    rm -rf "$VENV_DIR"
  fi
fi

# Create venv if missing
if [[ ! -d "$VENV_DIR" ]]; then
  echo "[PCWL setup] Creating virtual environment at $VENV_DIR with $PY_BIN ($PY_VER_STR) ..."
  "$PY_BIN" -m venv "$VENV_DIR"
fi

# Activate venv
# shellcheck disable=SC1090
. "$VENV_DIR/bin/activate"

# Upgrade pip and install requirements
echo "[PCWL setup] Installing dependencies from requirements.txt ..."
python -m pip install --upgrade pip >/dev/null
python -m pip install -r "$REPO_ROOT/requirements.txt"

echo "[PCWL setup] Done. Virtual environment is ready: $VENV_DIR"
echo "[PCWL setup] Next steps:"
echo "  1) Apply migrations:     ./tools/migrate.sh"
echo "  2) Start dev server:     cd backend && . ../.venv/bin/activate && python manage.py runserver"
echo "  3) Run test suite:       cd backend && . ../.venv/bin/activate && python manage.py test"
