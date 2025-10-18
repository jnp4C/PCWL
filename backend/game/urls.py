from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PlayerViewSet, SessionCurrentView, SessionLoginView, SessionLogoutView, health

router = DefaultRouter()
router.register("players", PlayerViewSet, basename="player")

urlpatterns = [
    path("health/", health, name="api-health"),
    path("session/login/", SessionLoginView.as_view(), name="session-login"),
    path("session/logout/", SessionLogoutView.as_view(), name="session-logout"),
    path("session/", SessionCurrentView.as_view(), name="session-current"),
    path("", include(router.urls)),
]
