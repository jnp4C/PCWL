PCWL — frontend + API split
=================================

The Django backend now exposes only `/api/` + `/admin/`. All frontend HTML/JS/CSS lives in `frontend/public` and is served by Nginx with no-cache headers, while Nginx proxies API/admin/WebSocket traffic to the ASGI server (Daphne).

Quick start (Docker)
- `docker build -t pcwl .`
- `docker run -p 8080:8080 pcwl`
- Open http://localhost:8080/ (frontend) — API is still at `/api/`

Local dev without Docker
- Create the venv and install deps: `bash tools/setup.sh`
- Install Nginx (`brew install nginx` on macOS, `apt install nginx` on Debian/Ubuntu).
- Run the combined stack (Nginx + Gunicorn): `./scripts/start.sh` (honours `PORT`/`BACKEND_PORT`).
- Open the app at http://127.0.0.1:8080/ (or your chosen `PORT`).
- Backend-only dev: `./tools/run.sh` still starts `manage.py runserver` for the API; serve `frontend/public/` separately (e.g., `python -m http.server --directory frontend/public 8081`) and keep API calls pointed at `http://127.0.0.1:8000/api`.

Frontend/backend contract
- Backend routes:
  - `/api/pages/home/` — returns app metadata (version/snapshot, static + link URLs) and sets a CSRF cookie for the static pages.
  - `/api/pages/leaderboard/` — same metadata plus the leaderboard payload.
  - `/api/leaderboard/` and the rest of the existing game API stay intact.
- Frontend pages:
  - `frontend/public/index.html`, `create-account.html`, `leaderboard.html` (plus JS in `frontend/public/js/`); served by Nginx with `try_files $uri $uri.html /index.html`.
  - Config is bootstrapped via `js/page-config.js` so the static pages learn API/static URLs and version info from the backend.
- Static assets:
  - Django `collectstatic` now targets only admin/static assets (`STATICFILES_DIRS` excludes the frontend). Nginx serves them from `/static/`.
  - Frontend assets come directly from `frontend/public` (also copied to `/var/www/frontend` in the Docker image).

Useful scripts
- `tools/setup.sh` — create .venv and install Python requirements.
- `tools/migrate.sh` — apply database migrations.
- `tools/run.sh` — run Django dev server for API-only work.
- `scripts/start.sh` — production-style entrypoint (migrate, collectstatic, sync frontend, start Daphne + Nginx).

Real-time district chat (Channels)
- WebSocket endpoint: `/ws/districts/<code>/cyber/` (ASGI via Daphne/Channels).
- Channel layer uses Redis when `REDIS_URL` is set; otherwise falls back to in-memory (single-worker only).
- District chat is gated to authenticated users whose home district matches the room code.

Troubleshooting
- Python 3.13 is unsupported by Django 3.2.x — use Python 3.11 (the scripts will warn you).
- If static pages cannot reach the API, confirm Nginx is running and proxying `/api/` to `BACKEND_PORT` (default 8000).
- New cookies (including CSRF) come from `/api/pages/home/` or `/api/pages/leaderboard/`; hit those once if you see CSRF errors during account creation.
- If verification or reset emails only appear in logs, set `DJANGO_EMAIL_HOST`, `DJANGO_EMAIL_PORT`, `DJANGO_EMAIL_HOST_USER`, `DJANGO_EMAIL_HOST_PASSWORD`, and `DJANGO_EMAIL_USE_TLS` in Railway.
