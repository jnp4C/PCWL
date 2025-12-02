#!/usr/bin/env bash
# Start Nginx (frontend) + Gunicorn (API) for PCWL.

set -euo pipefail

APP_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." &> /dev/null && pwd )"
cd "$APP_ROOT"

PORT="${PORT:-8080}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
STATIC_ROOT="${DJANGO_STATIC_ROOT:-/var/www/static}"
FRONTEND_ROOT="${FRONTEND_ROOT:-/var/www/frontend}"

export PORT BACKEND_PORT

mkdir -p "$STATIC_ROOT" "$FRONTEND_ROOT"

python backend/manage.py migrate --noinput
python backend/manage.py collectstatic --noinput

rsync -a frontend/public/ "$FRONTEND_ROOT"/

envsubst '$PORT $BACKEND_PORT' < deploy/nginx.conf.template > /etc/nginx/conf.d/default.conf

gunicorn pcwl_backend.wsgi:application \
daphne pcwl_backend.asgi:application \
  --chdir backend \
  --bind "0.0.0.0" \
  --port "${BACKEND_PORT}" \
  --access-log "-" \
  --proxy-headers &
DAPHNE_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

terminate() {
  kill -TERM "$DAPHNE_PID" "$NGINX_PID" 2>/dev/null || true
}

trap terminate TERM INT

wait -n "$DAPHNE_PID" "$NGINX_PID"
EXIT_CODE=$?
terminate
exit "$EXIT_CODE"
