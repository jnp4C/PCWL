FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=pcwl_backend.settings \
    PORT=8080 \
    DJANGO_STATIC_ROOT=/var/www/static

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    nodejs \
    npm \
    nginx \
    rsync \
    gettext-base \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN cd frontend && npm install && npm run build

RUN python backend/manage.py collectstatic --noinput

RUN rm -f /etc/nginx/sites-enabled/default

RUN mkdir -p /var/www/frontend && rsync -a frontend/public/ /var/www/frontend/

EXPOSE 8080

CMD ["./scripts/start.sh"]
