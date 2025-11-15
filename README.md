PCWL — Run locally (frontend + Django backend)

This repository already contains both the frontend (`frontend/public` → `app.js`, `styles.css`, assets/data) and the Django backend (`backend/`). Use the provided scripts to set up a Python virtual environment, apply database migrations, and run a local development server that serves the frontend and the API on the same origin.

Quick start (macOS/Linux/WSL)
- Prerequisites:
  - Python 3.11 recommended (Django 3.2.x is not compatible with Python 3.13+).
  - git, bash, and SQLite3 (usually preinstalled).
- Steps:
  1) From the repo root, create the virtual environment and install deps:
     bash tools/setup.sh
  2) Apply database migrations:
     ./tools/migrate.sh
  3) Start the local server (serves UI + API at http://127.0.0.1:8000):
     ./tools/run.sh
  4) Open the app in a browser:
     http://127.0.0.1:8000/

Notes
- Do not open index.html via the file:// protocol. Open the app through the Django dev server URL so the browser considers API calls same‑origin, CSRF cookies are available, and session auth works.
- The dev server also exposes helpful pages:
  - Home: /
  - Create account: /create-account/
  - API base: /api/

Windows options
- Option A (recommended): Use Windows Subsystem for Linux (WSL)
  - Install WSL and a Linux distribution (e.g., Ubuntu)
  - In WSL terminal, run the same Quick start commands above.
- Option B (native PowerShell, manual):
  1) Install Python 3.11 from python.org.
  2) Create and activate a venv:
     py -3.11 -m venv .venv
     .\.venv\Scripts\Activate.ps1
  3) Install deps:
     python -m pip install -r requirements.txt
  4) Run migrations and server:
     cd backend
     python manage.py migrate
     python manage.py runserver 127.0.0.1:8000
  5) Open http://127.0.0.1:8000/

Troubleshooting
- Python 3.13 error (cgi removed):
  - If scripts detect Python 3.13+, they will ask you to switch to 3.11.
  - Fix:
    rm -rf .venv && PYTHON=python3.11 ./tools/setup.sh
- Django not installed / permission denied on scripts:
  - Run setup with bash explicitly and/or make scripts executable:
    bash tools/setup.sh
    chmod +x tools/*.sh
- Migrations pending / database not ready:
  - Run:
    ./tools/migrate.sh
  - The run script also applies migrations automatically before launching.
- 403 errors on POST endpoints in the browser:
  - Always access the app via http://127.0.0.1:8000/ (not file://). The frontend includes CSRF headers for unsafe methods, and the server issues the csrftoken cookie for the same origin.

How frontend and backend are "merged" locally
- The Django app (backend/pcwl_backend/urls.py) serves templates from backend/templates/ (home.html, create-account.html, etc.) and mounts the game API at /api/.
- Static files (`frontend/public/app.js`, `styles.css`, `data/`, etc.) are served in development by Django’s staticfiles. You get one origin (127.0.0.1:8000) for both UI and API, which avoids CORS/CSRF issues.

Useful scripts
- tools/setup.sh — creates .venv and installs requirements with a compatible Python.
- tools/migrate.sh — applies database migrations using the venv.
- tools/run.sh — applies migrations and starts the dev server at HOST:PORT (env vars supported: HOST=0.0.0.0 PORT=8001).

Environment variables
- HOST and PORT for tools/run.sh (defaults: 127.0.0.1:8000):
  HOST=0.0.0.0 PORT=8001 ./tools/run.sh

That’s it — with the server running, open the app at http://127.0.0.1:8000/ and sign in or create an account. If you run into any blockers, see the Troubleshooting section above.
