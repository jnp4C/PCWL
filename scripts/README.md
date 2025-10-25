PCWL backend scripts quick start

This folder contains helper scripts to set up your local environment, apply Django migrations, and run the development server. All commands below are intended to be executed from the repository root (…/PCWL).

If you see: ERROR: Django is not installed for 'python3'
- Run the setup script to create a virtual environment and install dependencies, then apply migrations.
  - macOS/Linux:
    - bash scripts/setup.sh && bash scripts/migrate.sh
  - If you prefer to fix file permissions and run directly next time:
    - chmod +x scripts/*.sh && ./scripts/setup.sh && ./scripts/migrate.sh

Most common commands
- First time setup (creates .venv and installs requirements):
  - bash scripts/setup.sh
- Apply database migrations:
  - bash scripts/migrate.sh
    - Note: migrate.sh auto-activates the local .venv if present, or you can pass VENV=/path/to/venv and/or PYTHON=...
- Start the dev server (ensures migrations first):
  - bash scripts/run.sh
  - Optional custom host/port: HOST=0.0.0.0 PORT=8001 bash scripts/run.sh

Manual alternatives (no helper scripts)
- macOS/Linux:
  - python3 -m venv .venv
  - . .venv/bin/activate
  - cd backend
  - python manage.py migrate --noinput
  - python manage.py runserver
- Windows PowerShell:
  - python -m venv .venv
  - .\.venv\Scripts\Activate.ps1
  - cd backend
  - python manage.py migrate --noinput
  - python manage.py runserver
- Windows CMD:
  - python -m venv .venv
  - .\.venv\Scripts\activate.bat
  - cd backend
  - python manage.py migrate --noinput
  - python manage.py runserver

Choosing a specific Python version
- You can set which Python executable to use via the PYTHON environment variable:
  - PYTHON=python3.11 bash scripts/setup.sh
  - PYTHON=python3.11 bash scripts/migrate.sh
  - PYTHON=python3.11 HOST=127.0.0.1 PORT=8000 bash scripts/run.sh

Troubleshooting
- Permission denied running scripts (zsh/bash):
  - Run via bash explicitly: bash scripts/setup.sh (and similarly for migrate/run)
  - Or grant execute permission once: chmod +x scripts/*.sh
- No module named 'django':
  - You are likely outside the virtualenv. Run: bash scripts/setup.sh, then bash scripts/migrate.sh
- SQLite is locked / migrations stuck:
  - Stop any running dev server and re-run migrations.
  - As a last resort (wipes local data): rm backend/db.sqlite3 and then run bash scripts/migrate.sh
- Verify migrations applied:
  - cd backend && . ../.venv/bin/activate && python manage.py showmigrations

What the scripts do
- setup.sh: Creates .venv (if missing), upgrades pip, installs requirements.txt.
- migrate.sh: Verifies Django is importable for the chosen PYTHON, prints helpful hints if not, and runs manage.py migrate.
- run.sh: Activates .venv if found, ensures migrations are applied, then starts the Django dev server.

After setup, your usual cycle is:
1) bash scripts/run.sh  # start the server at http://127.0.0.1:8000/
2) Develop. The backend auto-reloads on changes.
3) (Optional) Run tests: cd backend && . ../.venv/bin/activate && python manage.py test
