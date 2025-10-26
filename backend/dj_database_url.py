"""
Minimal fallback implementation of dj_database_url.parse used for local tests.

The real dependency normally comes from pip, but our environments may not have
it installed. This lightweight version only handles the schemes our project
needs (SQLite and Postgres) and mirrors the return structure expected by
Django's DATABASES setting.
"""

from urllib.parse import unquote, urlparse

__all__ = ["parse"]


def _apply_common_options(config, conn_max_age=0, ssl_require=False):
    if conn_max_age:
        config["CONN_MAX_AGE"] = conn_max_age
    if ssl_require:
        options = config.setdefault("OPTIONS", {})
        options["sslmode"] = options.get("sslmode", "require")
    return config


def parse(url, conn_max_age=0, ssl_require=False):
    if not url or not isinstance(url, str):
        raise ValueError("Database URL must be a non-empty string.")

    parsed = urlparse(url)
    scheme = (parsed.scheme or "").lower()

    if scheme in {"postgres", "postgresql", "postgresql+psycopg2"}:
        config = {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed.path[1:]) if parsed.path else "",
            "USER": unquote(parsed.username or "") if parsed.username else "",
            "PASSWORD": unquote(parsed.password or "") if parsed.password else "",
            "HOST": parsed.hostname or "",
            "PORT": str(parsed.port) if parsed.port else "",
        }
        return _apply_common_options(config, conn_max_age, ssl_require)

    if scheme == "sqlite":
        name = parsed.path
        if parsed.netloc and parsed.netloc != "localhost":
            name = f"//{parsed.netloc}{parsed.path}"
        config = {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": name or ":memory:",
        }
        return _apply_common_options(config, conn_max_age, ssl_require)

    raise ValueError(f"Unsupported database scheme '{scheme}'.")
