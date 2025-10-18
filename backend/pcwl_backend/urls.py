"""Root URL configuration for the PCWL backend."""

from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path
from django.views.generic import RedirectView, TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("game.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("create-account/", TemplateView.as_view(template_name="create-account.html"), name="create-account"),
    path("leaderboard/", TemplateView.as_view(template_name="leaderboard.html"), name="leaderboard"),
    path("index.html", RedirectView.as_view(pattern_name="home", permanent=False)),
    path("create-account.html", RedirectView.as_view(pattern_name="create-account", permanent=False)),
    path("leaderboard.html", RedirectView.as_view(pattern_name="leaderboard", permanent=False)),
]

urlpatterns += staticfiles_urlpatterns()
