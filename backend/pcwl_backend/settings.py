"""
Django settings for the PCWL backend.

This configuration keeps the existing static frontend under the project root
while enabling future backend work (REST API, multiplayer features, etc.).
"""

import os
from pathlib import Path
from urllib.parse import quote_plus

from django.core.exceptions import ImproperlyConfigured

try:
    import dj_database_url  # type: ignore
except ModuleNotFoundError:  # pragma: no cover - fallback for local dev only
    from backend import dj_database_url  # type: ignore

try:
    import whitenoise  # type: ignore  # noqa: F401
    HAS_WHITENOISE = True
except ModuleNotFoundError:  # pragma: no cover - optional in local dev
    HAS_WHITENOISE = False


def env_list(name, default=None):
    """Small helper to parse comma separated environment variables."""
    value = os.environ.get(name, "")
    if not value:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


def is_truthy(value: str) -> bool:
    return str(value or "").lower() in {"1", "true", "yes", "on"}


def first_env(*names, default=""):
    for name in names:
        value = os.environ.get(name)
        if value not in (None, ""):
            return value
    return default


def _normalize_path(value: str, default: str = "/") -> str:
    if not value:
        return default
    if not value.startswith("/"):
        return f"/{value}"
    return value


def _normalize_prefix(value: str, default: str = "/") -> str:
    normalized = _normalize_path(value, default=default)
    if not normalized.endswith("/"):
        normalized = f"{normalized}/"
    return normalized

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent
FRONTEND_DIR = REPO_ROOT / "frontend"

# Security
IS_RAILWAY = any(
    os.environ.get(name)
    for name in ("RAILWAY_ENVIRONMENT", "RAILWAY_SERVICE_ID", "RAILWAY_PUBLIC_DOMAIN")
)
DEBUG = is_truthy(os.environ.get("DJANGO_DEBUG", "false" if IS_RAILWAY else "true"))
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-change-me"
    else:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.")

default_allowed_hosts = ["localhost", "127.0.0.1"]
railway_public_domain = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip()
if railway_public_domain:
    default_allowed_hosts.append(railway_public_domain)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", default_allowed_hosts)

default_csrf_origins = []
if railway_public_domain:
    default_csrf_origins.append(f"https://{railway_public_domain}")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", default_csrf_origins)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
DEFAULT_CONTENT_SECURITY_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' https://apis.google.com; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: blob:; "
    "font-src 'self' data:; "
    "connect-src 'self' http://localhost:* http://127.0.0.1:*; "
    "worker-src 'self' blob:; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "frame-ancestors 'self'; "
    "frame-src https://apis.google.com;"
)
CONTENT_SECURITY_POLICY = os.environ.get("DJANGO_CONTENT_SECURITY_POLICY", DEFAULT_CONTENT_SECURITY_POLICY)
PASSWORD_RESET_TIMEOUT = int(os.environ.get("DJANGO_PASSWORD_RESET_TIMEOUT", "3600"))
EMAIL_HOST = first_env("DJANGO_EMAIL_HOST", "EMAIL_HOST", "MAIL_HOST", default="localhost")
EMAIL_PORT = int(first_env("DJANGO_EMAIL_PORT", "EMAIL_PORT", "MAIL_PORT", default="25"))
EMAIL_HOST_USER = first_env("DJANGO_EMAIL_HOST_USER", "EMAIL_HOST_USER", "MAIL_USERNAME", default="")
EMAIL_HOST_PASSWORD = first_env("DJANGO_EMAIL_HOST_PASSWORD", "EMAIL_HOST_PASSWORD", "MAIL_PASSWORD", default="")
EMAIL_USE_TLS = is_truthy(first_env("DJANGO_EMAIL_USE_TLS", "EMAIL_USE_TLS", "MAIL_USE_TLS", default="false"))
EMAIL_USE_SSL = is_truthy(first_env("DJANGO_EMAIL_USE_SSL", "EMAIL_USE_SSL", "MAIL_USE_SSL", default="false"))
EMAIL_CONFIGURED = any(
    os.environ.get(name) not in (None, "")
    for name in (
        "DJANGO_EMAIL_HOST",
        "EMAIL_HOST",
        "MAIL_HOST",
        "DJANGO_EMAIL_HOST_USER",
        "EMAIL_HOST_USER",
        "MAIL_USERNAME",
        "DJANGO_EMAIL_HOST_PASSWORD",
        "EMAIL_HOST_PASSWORD",
        "MAIL_PASSWORD",
        "DJANGO_EMAIL_USE_TLS",
        "EMAIL_USE_TLS",
        "MAIL_USE_TLS",
        "DJANGO_EMAIL_USE_SSL",
        "EMAIL_USE_SSL",
        "MAIL_USE_SSL",
        "DJANGO_EMAIL_PORT",
        "EMAIL_PORT",
        "MAIL_PORT",
    )
)
EMAIL_BACKEND = os.environ.get(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend" if EMAIL_CONFIGURED else "django.core.mail.backends.console.EmailBackend",
)
DEFAULT_FROM_EMAIL = first_env("DJANGO_DEFAULT_FROM_EMAIL", "DEFAULT_FROM_EMAIL", "MAIL_FROM", default="noreply@pcwl.local")

# Applications
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "channels",
    "rest_framework",
    "rest_framework.authtoken",
    "game",
]

# Middleware / request pipeline
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
]

if HAS_WHITENOISE:
    MIDDLEWARE.append("whitenoise.middleware.WhiteNoiseMiddleware")

MIDDLEWARE.append("pcwl_backend.middleware.ContentSecurityPolicyMiddleware")

MIDDLEWARE += [
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "pcwl_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "pcwl_backend.context_processors.app_metadata",
            ],
        },
    },
]

WSGI_APPLICATION = "pcwl_backend.wsgi.application"
ASGI_APPLICATION = "pcwl_backend.asgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

db_url = os.environ.get("DATABASE_URL")

if not db_url and os.environ.get("PGHOST"):
    pg_user = os.environ.get("PGUSER", "")
    pg_pass = os.environ.get("PGPASSWORD", "")
    pg_host = os.environ.get("PGHOST")
    pg_port = os.environ.get("PGPORT", "5432")
    pg_db = os.environ.get("PGDATABASE", pg_user or "postgres")
    auth = ""
    if pg_user:
        auth = quote_plus(pg_user)
        if pg_pass:
            auth = f"{auth}:{quote_plus(pg_pass)}"
        auth = f"{auth}@"
    db_url = f"postgresql://{auth}{pg_host}:{pg_port}/{pg_db}"

if db_url:
    DATABASES["default"] = dj_database_url.parse(
        db_url,
        conn_max_age=int(os.environ.get("DJANGO_DB_CONN_MAX_AGE", "60")),
        ssl_require=not DEBUG,
    )

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static assets
STATIC_URL = "/static/"
STATICFILES_DIRS = []
STATIC_ROOT = Path(os.environ.get("DJANGO_STATIC_ROOT", REPO_ROOT / "_pcwl_staticfiles")).resolve()
if HAS_WHITENOISE:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
else:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# REST framework defaults
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

APP_VERSION = os.environ.get("PCWL_APP_VERSION", "v0.20")
APP_SNAPSHOT = os.environ.get("PCWL_APP_SNAPSHOT", "app.js dev")
API_BASE_URL = _normalize_prefix(os.environ.get("PCWL_API_BASE_URL", "/api"))
FRONTEND_HOME_PATH = _normalize_path(os.environ.get("PCWL_FRONTEND_HOME_PATH", "/"))
FRONTEND_LEADERBOARD_PATH = _normalize_path(
    os.environ.get("PCWL_FRONTEND_LEADERBOARD_PATH", "/leaderboard.html")
)
FRONTEND_CREATE_ACCOUNT_PATH = _normalize_path(
    os.environ.get("PCWL_FRONTEND_CREATE_ACCOUNT_PATH", "/create-account.html")
)
FRONTEND_STATIC_URL = _normalize_prefix(os.environ.get("PCWL_FRONTEND_STATIC_URL", "/"))

# ASGI / Channels
REDIS_URL = os.environ.get("REDIS_URL")
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer" if REDIS_URL else "channels.layers.InMemoryChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]} if REDIS_URL else {},
    }
}
