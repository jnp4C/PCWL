PCWL — frontend + API split
=================================

The Django backend now exposes only `/api/` + `/admin/`. All frontend HTML/JS/CSS lives in `frontend/public` and is served by Nginx with no-cache headers, while Nginx proxies API/admin requests to Gunicorn.

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
- React frontend:
  - Lives in `frontend/src` (Vite + React + Redux Toolkit). Generic CRUD thunks and slices exist for players, districts, party, friends, session, and leaderboard to keep API state consistent.
  - Build with `npm install && npm run build` (Node 18+ recommended). Outputs to `frontend/dist` which Nginx serves. `__APP_VERSION__` is injected from `git describe --tags` when available (fallback to `dev`).
  - Static assets (manifest/icons/data) remain under `frontend/public/` and are copied to the build output.
- Static assets:
  - Django `collectstatic` now targets only admin/static assets (`STATICFILES_DIRS` excludes the frontend). Nginx serves them from `/static/`.
  - Frontend assets come from the built `frontend/dist` (or `frontend/public` as a fallback when no build is present).

Useful scripts
- `tools/setup.sh` — create .venv and install Python requirements.
- `tools/migrate.sh` — apply database migrations.
- `tools/run.sh` — run Django dev server for API-only work.
- `frontend: npm install && npm run dev` — start the React dev server (proxy API at `/api`).
- `frontend: npm run build` — build the React bundle to `frontend/dist`.
- `scripts/start.sh` — production-style entrypoint (migrate, collectstatic, sync frontend build, start Gunicorn + Nginx).

Troubleshooting
- Python 3.13 is unsupported by Django 3.2.x — use Python 3.11 (the scripts will warn you).
- If static pages cannot reach the API, confirm Nginx is running and proxying `/api/` to `BACKEND_PORT` (default 8000).
- New cookies (including CSRF) come from `/api/pages/home/` or `/api/pages/leaderboard/`; hit those once if you see CSRF errors during account creation.
