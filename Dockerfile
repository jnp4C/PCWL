FROM python:3.11-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=pcwl_backend.settings \
    PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    rsync \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python backend/manage.py collectstatic --noinput

EXPOSE 8000

CMD ["bash", "-c", "python backend/manage.py migrate --noinput && gunicorn pcwl_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
