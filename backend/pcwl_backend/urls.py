"""Root URL configuration for the PCWL backend."""

from django.contrib import admin
from django.contrib.staticfiles.storage import staticfiles_storage
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.http import Http404, HttpResponse
from django.urls import include, path
from django.views.decorators.cache import never_cache
from django.views.generic import RedirectView, TemplateView


@never_cache
def service_worker(request):
    try:
        with staticfiles_storage.open("service-worker.js") as sw_file:
            content = sw_file.read()
    except FileNotFoundError as exc:
        raise Http404("Service worker not found.") from exc
    response = HttpResponse(content, content_type="application/javascript")
    response["Cache-Control"] = "no-cache"
    return response


@never_cache
def web_manifest(request):
    try:
        with staticfiles_storage.open("manifest.webmanifest.json") as manifest_file:
            content = manifest_file.read()
    except FileNotFoundError as exc:
        raise Http404("Manifest not found.") from exc
    response = HttpResponse(content, content_type="application/manifest+json")
    response["Cache-Control"] = "no-cache"
    return response

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("game.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("create-account/", TemplateView.as_view(template_name="create-account.html"), name="create-account"),
    path("leaderboard/", TemplateView.as_view(template_name="leaderboard.html"), name="leaderboard"),
    path("index.html", RedirectView.as_view(pattern_name="home", permanent=False)),
    path("create-account.html", RedirectView.as_view(pattern_name="create-account", permanent=False)),
    path("leaderboard.html", RedirectView.as_view(pattern_name="leaderboard", permanent=False)),
    path("service-worker.js", service_worker, name="service-worker"),
    path("manifest.webmanifest.json", web_manifest, name="web-manifest"),
]

urlpatterns += staticfiles_urlpatterns()
