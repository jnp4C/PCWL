release: python backend/manage.py migrate --noinput && python backend/manage.py collectstatic --noinput
web: gunicorn pcwl_backend.wsgi:application --chdir backend --bind 0.0.0.0:${PORT:-8000}
