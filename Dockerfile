FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

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
    nginx \
    rsync \
    gettext-base \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy built frontend assets from builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

RUN python backend/manage.py collectstatic --noinput

RUN rm -f /etc/nginx/sites-enabled/default

RUN mkdir -p /var/www/frontend && if [ -d "frontend/dist" ]; then rsync -a frontend/dist/ /var/www/frontend/; else rsync -a frontend/public/ /var/www/frontend/; fi

EXPOSE 8080

CMD ["./scripts/start.sh"]
