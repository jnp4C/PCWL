"""Context processors for exposing app metadata to templates."""

from django.conf import settings


def app_metadata(request):
    """Inject build metadata so templates can surface version details."""
    return {
        "APP_VERSION": getattr(settings, "APP_VERSION", "dev"),
        "APP_SNAPSHOT": getattr(settings, "APP_SNAPSHOT", "app.js"),
    }
