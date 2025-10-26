from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    FriendDetailView,
    FriendListView,
    FriendRequestDetailView,
    FriendRequestListView,
    FriendSearchView,
    LeaderboardView,
    PlayerViewSet,
    SessionCurrentView,
    SessionLoginView,
    SessionLogoutView,
    migration_status,
    health,
)

router = DefaultRouter()
router.register("players", PlayerViewSet, basename="player")

urlpatterns = [
    path("health/", health, name="api-health"),
    path("migrations/status/", migration_status, name="migration-status"),
    path("auth/token/", obtain_auth_token, name="api-token"),
    path("session/login/", SessionLoginView.as_view(), name="session-login"),
    path("session/logout/", SessionLogoutView.as_view(), name="session-logout"),
    path("session/", SessionCurrentView.as_view(), name="session-current"),
    path("friends/", FriendListView.as_view(), name="friend-list"),
    path("friends/search/", FriendSearchView.as_view(), name="friend-search"),
    path("friends/<str:username>/", FriendDetailView.as_view(), name="friend-detail"),
    path("friend-requests/", FriendRequestListView.as_view(), name="friend-request-list"),
    path("friend-requests/<int:pk>/", FriendRequestDetailView.as_view(), name="friend-request-detail"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard-api"),
    path("", include(router.urls)),
]
