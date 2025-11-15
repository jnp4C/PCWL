PCWL tooling quick start

This folder now houses every helper script used for local setup, data preparation, and development. Run them from the repository root (`…/PCWL`). For convenience, thin wrappers remain in `scripts/` so `./scripts/run.sh` still works, but the canonical commands live under `tools/`.

If you see `ERROR: Django is not installed for 'python3'`
- Run the setup script to create/repair the virtual environment, then apply migrations.
  - macOS/Linux:
    - `bash tools/setup.sh && bash tools/migrate.sh`
  - If you prefer to fix execute permissions once:
    - `chmod +x tools/*.sh && ./tools/setup.sh && ./tools/migrate.sh`

Most common commands
- First-time setup (creates `.venv` and installs requirements):
  - `bash tools/setup.sh`
- Apply database migrations:
  - `bash tools/migrate.sh`
    - `migrate.sh` auto-activates the local `.venv` if present; override with `VENV=/path/to/venv` or a custom `PYTHON=…`.
- Start the dev server (ensures migrations first):
  - `bash tools/run.sh`
  - Custom host/port: `HOST=0.0.0.0 PORT=8001 bash tools/run.sh`

Manual alternatives (no helper scripts)
- macOS/Linux:
  - `python3 -m venv .venv`
  - `. .venv/bin/activate`
  - `cd backend`
  - `python manage.py migrate --noinput`
  - `python manage.py runserver`
- Windows PowerShell:
  - `python -m venv .venv`
  - `.\.venv\Scripts\Activate.ps1`
  - `cd backend`
  - `python manage.py migrate --noinput`
  - `python manage.py runserver`
- Windows CMD:
  - `python -m venv .venv`
  - `.\.venv\Scripts\activate.bat`
  - `cd backend`
  - `python manage.py migrate --noinput`
  - `python manage.py runserver`

Choosing a specific Python version
- Set the `PYTHON` environment variable:
  - `PYTHON=python3.11 bash tools/setup.sh`
  - `PYTHON=python3.11 bash tools/migrate.sh`
  - `PYTHON=python3.11 HOST=127.0.0.1 PORT=8000 bash tools/run.sh`

Troubleshooting
- Permission denied running scripts (zsh/bash):
  - Run via bash explicitly: `bash tools/setup.sh` (same for migrate/run)
  - Or grant execute permission once: `chmod +x tools/*.sh`
- `No module named 'django'`:
  - You are likely outside the virtualenv. Run: `bash tools/setup.sh`, then `bash tools/migrate.sh`
- SQLite is locked / migrations stuck:
  - Stop any running dev server and re-run migrations.
  - As a last resort (wipes local data): `rm backend/db.sqlite3` and then `bash tools/migrate.sh`
- Verify migrations applied:
  - `cd backend && . ../.venv/bin/activate && python manage.py showmigrations`

What the scripts do
- `setup.sh`: Creates `.venv` (if missing), upgrades pip, installs `requirements.txt`.
- `migrate.sh`: Verifies Django is importable for the chosen `PYTHON`, prints hints if not, and runs `manage.py migrate`.
- `run.sh`: Activates `.venv` if found, ensures migrations are applied, then starts the Django dev server.

After setup, your usual loop is:
1. `bash tools/run.sh`  # start the server at http://127.0.0.1:8000/
2. Develop — the backend auto-reloads on changes.
3. (Optional) Run tests: `cd backend && . ../.venv/bin/activate && python manage.py test`
