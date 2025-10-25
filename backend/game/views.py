from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import Q
from django.db import DatabaseError
from django.db.utils import OperationalError
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db import connections, DEFAULT_DB_ALIAS
from django.db.migrations.executor import MigrationExecutor
from django.core.management import call_command
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FriendLink, FriendRequest, Player
from .serializers import (
    FriendFavoriteSerializer,
    FriendLinkSerializer,
    FriendRequestSerializer,
    PlayerSearchResultSerializer,
    PlayerSerializer,
)


def _auto_migrate_if_allowed():
    """Attempt to auto-apply migrations in development if enabled.

    Controlled by settings:
    - DEBUG must be True
    - AUTO_MIGRATE_ON_RUNSERVER (default True) or AUTO_MIGRATE_ON_ERROR (default True) must be True
    """
    try:
        if not getattr(settings, "DEBUG", False):
            return False
        if not (getattr(settings, "AUTO_MIGRATE_ON_ERROR", True) or getattr(settings, "AUTO_MIGRATE_ON_RUNSERVER", True)):
            return False
        call_command("migrate", interactive=False, verbosity=0)
        return True
    except Exception:
        return False


class PlayerViewSet(viewsets.ModelViewSet):
    """CRUD endpoints for player data; extend with custom logic as multiplayer evolves."""

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Player.objects.none()
        player = getattr(user, "player_profile", None)
        if player is not None:
            return Player.objects.filter(pk=player.pk)
        player = Player.objects.filter(user=user).first()
        if player is None:
            return Player.objects.none()
        return Player.objects.filter(pk=player.pk)


def ensure_mutual_friend_links(primary: Player, secondary: Player) -> FriendLink:
    """Ensure reciprocal FriendLink entries exist."""

    link, _ = FriendLink.objects.get_or_create(player=primary, friend=secondary)
    FriendLink.objects.get_or_create(player=secondary, friend=primary)
    return link


def accept_friend_request(request_obj: "FriendRequest") -> FriendLink:
    """Accept a pending friend request and establish friend links."""

    with transaction.atomic():
        link = ensure_mutual_friend_links(request_obj.to_player, request_obj.from_player)
        if request_obj.status != FriendRequest.Status.ACCEPTED:
            request_obj.status = FriendRequest.Status.ACCEPTED
            request_obj.responded_at = timezone.now()
            request_obj.save(update_fields=["status", "responded_at", "updated_at"])
    return link

class PlayerScopedAPIView(APIView):
    """Helper mixin to ensure we operate on the authenticated player's profile."""

    permission_classes = [IsAuthenticated]

    def get_current_player(self, request):
        user = request.user
        if not user.is_authenticated:
            raise NotAuthenticated("Authentication required.")
        try:
            player = getattr(user, "player_profile", None)
            if player is None:
                player = Player.objects.filter(user=user).first()
            if player is None:
                player, _ = Player.objects.get_or_create(username=user.username)
                if player.user_id != user.id:
                    player.user = user
                    player.save(update_fields=["user"])
            return player
        except (OperationalError, DatabaseError):
            # Surface a clear error up the stack; callers can handle and return 503.
            raise


@method_decorator(csrf_exempt, name="dispatch")
class SessionLoginView(APIView):
    """Establish a session-backed login and return the authenticated player's profile."""

    permission_classes = [AllowAny]
    authentication_classes = []  # Avoid DRF SessionAuthentication CSRF checks on login

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        password = request.data.get("password") or ""
        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        try:
            player = getattr(user, "player_profile", None)
            if player is None:
                with transaction.atomic():
                    player, _ = Player.objects.get_or_create(username=user.username)
                    if player.user_id != user.id:
                        player.user = user
                        player.save(update_fields=["user"])
        except (OperationalError, DatabaseError):
            # Try to self-heal in development by applying migrations, then retry once.
            if _auto_migrate_if_allowed():
                try:
                    player = getattr(user, "player_profile", None)
                    if player is None:
                        with transaction.atomic():
                            player, _ = Player.objects.get_or_create(username=user.username)
                            if player.user_id != user.id:
                                player.user = user
                                player.save(update_fields=["user"])
                except (OperationalError, DatabaseError):
                    return Response(
                        {
                            "detail": "Database is not ready. Please apply migrations.",
                            "action": "run ./scripts/migrate.sh or python manage.py migrate",
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
            else:
                return Response(
                    {
                        "detail": "Server database is not up to date. Please apply migrations.",
                        "action": "run ./scripts/migrate.sh or python manage.py migrate",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        serializer = PlayerSerializer(player, context={"request": request})
        return Response({"player": serializer.data}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name="dispatch")
class SessionLogoutView(APIView):
    """Terminate the current session."""

    permission_classes = [AllowAny]
    authentication_classes = []  # Avoid SessionAuthentication CSRF checks on logout

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionCurrentView(APIView):
    """Return the authenticated player's profile if a session exists."""

    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"authenticated": False}, status=status.HTTP_200_OK)
        try:
            player = getattr(request.user, "player_profile", None)
            if player is None:
                player = Player.objects.filter(username=request.user.username).first()
                if player and player.user_id != request.user.id:
                    player.user = request.user
                    player.save(update_fields=["user"])
        except (OperationalError, DatabaseError):
            # Try to auto-migrate in dev and retry once
            if _auto_migrate_if_allowed():
                try:
                    player = getattr(request.user, "player_profile", None)
                    if player is None:
                        player = Player.objects.filter(username=request.user.username).first()
                        if player and player.user_id != request.user.id:
                            player.user = request.user
                            player.save(update_fields=["user"])
                except (OperationalError, DatabaseError):
                    return Response(
                        {
                            "authenticated": False,
                            "detail": "Database is not ready. Please apply migrations.",
                            "action": "run ./scripts/migrate.sh or python manage.py migrate",
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
            else:
                return Response(
                    {
                        "authenticated": False,
                        "detail": "Server database is not up to date. Please apply migrations.",
                        "action": "run ./scripts/migrate.sh or python manage.py migrate",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        data = PlayerSerializer(player, context={"request": request}).data if player else None
        return Response({"authenticated": True, "player": data}, status=status.HTTP_200_OK)


class FriendListView(PlayerScopedAPIView):
    """List or add friends for the authenticated player."""

    def get(self, request):
        player = self.get_current_player(request)
        friend_links = (
            FriendLink.objects.select_related("friend")
            .filter(player=player)
            .order_by("-is_favorite", "friend__username")
        )
        serializer = FriendLinkSerializer(friend_links, many=True, context={"request": request})
        return Response({"friends": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        player = self.get_current_player(request)
        username = str(request.data.get("username", "")).strip()
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
        if username.lower() == player.username.lower():
            return Response({"detail": "You cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)

        friend = Player.objects.filter(username__iexact=username).first()
        if friend is None:
            return Response({"detail": "Player not found."}, status=status.HTTP_404_NOT_FOUND)

        existing = FriendLink.objects.filter(player=player, friend=friend).first()
        if existing:
            serializer = FriendLinkSerializer(existing, context={"request": request})
            return Response({"friend": serializer.data}, status=status.HTTP_200_OK)

        incoming_request = (
            FriendRequest.objects.select_related("from_player", "to_player")
            .filter(from_player=friend, to_player=player, status=FriendRequest.Status.PENDING)
            .first()
        )
        if incoming_request:
            link = accept_friend_request(incoming_request)
            friend_data = FriendLinkSerializer(link, context={"request": request}).data
            request_data = FriendRequestSerializer(
                incoming_request,
                context={"request": request, "current_player": player},
            ).data
            return Response({"friend": friend_data, "friend_request": request_data}, status=status.HTTP_200_OK)

        outgoing_request = (
            FriendRequest.objects.select_related("from_player", "to_player")
            .filter(from_player=player, to_player=friend, status=FriendRequest.Status.PENDING)
            .first()
        )
        if outgoing_request:
            request_data = FriendRequestSerializer(
                outgoing_request,
                context={"request": request, "current_player": player},
            ).data
            return Response({"friend_request": request_data}, status=status.HTTP_200_OK)

        friend_request = FriendRequest.objects.create(from_player=player, to_player=friend)
        request_data = FriendRequestSerializer(
            friend_request,
            context={"request": request, "current_player": player},
        ).data
        return Response({"friend_request": request_data}, status=status.HTTP_201_CREATED)


class FriendDetailView(PlayerScopedAPIView):
    """Update or remove a specific friend relationship."""

    def patch(self, request, username):
        player = self.get_current_player(request)
        friend = Player.objects.filter(username__iexact=username).first()
        if friend is None:
            return Response({"detail": "Player not found."}, status=status.HTTP_404_NOT_FOUND)

        link = FriendLink.objects.filter(player=player, friend=friend).first()
        if link is None:
            return Response({"detail": "Friend relationship not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = FriendFavoriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_favorite = serializer.validated_data["is_favorite"]
        if link.is_favorite != is_favorite:
            link.is_favorite = is_favorite
            link.save(update_fields=["is_favorite", "updated_at"])

        data = FriendLinkSerializer(link, context={"request": request}).data
        return Response(data, status=status.HTTP_200_OK)

    def delete(self, request, username):
        player = self.get_current_player(request)
        friend = Player.objects.filter(username__iexact=username).first()
        if friend is None:
            return Response(status=status.HTTP_204_NO_CONTENT)

        with transaction.atomic():
            FriendLink.objects.filter(player=player, friend=friend).delete()
            FriendLink.objects.filter(player=friend, friend=player).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class FriendSearchView(PlayerScopedAPIView):
    """Search for players by username or display name."""

    def get(self, request):
        player = self.get_current_player(request)
        query = str(request.query_params.get("q", "")).strip()
        if len(query) < 1:
            return Response({"results": []}, status=status.HTTP_200_OK)

        friend_ids = set(
            FriendLink.objects.filter(player=player).values_list("friend_id", flat=True)
        )
        incoming_request_ids = set(
            FriendRequest.objects.filter(
                to_player=player, status=FriendRequest.Status.PENDING
            ).values_list("from_player_id", flat=True)
        )
        outgoing_request_ids = set(
            FriendRequest.objects.filter(
                from_player=player, status=FriendRequest.Status.PENDING
            ).values_list("to_player_id", flat=True)
        )

        matches = (
            Player.objects.filter(
                Q(username__icontains=query) | Q(display_name__icontains=query)
            )
            .exclude(pk=player.pk)
            .order_by("username")[:20]
        )

        serializer = PlayerSearchResultSerializer(
            matches,
            many=True,
            context={
                "request": request,
                "friend_ids": friend_ids,
                "incoming_request_ids": incoming_request_ids,
                "outgoing_request_ids": outgoing_request_ids,
            },
        )
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)


class FriendRequestListView(PlayerScopedAPIView):
    """List pending friend requests for the authenticated player."""

    def get(self, request):
        player = self.get_current_player(request)
        serializer_context = {"request": request, "current_player": player}
        incoming = FriendRequest.objects.filter(
            to_player=player, status=FriendRequest.Status.PENDING
        ).select_related("from_player")
        outgoing = FriendRequest.objects.filter(
            from_player=player, status=FriendRequest.Status.PENDING
        ).select_related("to_player")
        data = {
            "incoming": FriendRequestSerializer(incoming, many=True, context=serializer_context).data,
            "outgoing": FriendRequestSerializer(outgoing, many=True, context=serializer_context).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class FriendRequestDetailView(PlayerScopedAPIView):
    """Allow players to accept, decline, or cancel friend requests."""

    def patch(self, request, pk):
        player = self.get_current_player(request)
        action = str(request.data.get("action", "")).strip().lower()
        if action not in {"accept", "decline", "cancel"}:
            return Response({"detail": "Unsupported action."}, status=status.HTTP_400_BAD_REQUEST)

        friend_request = (
            FriendRequest.objects.select_related("from_player", "to_player")
            .filter(pk=pk, status=FriendRequest.Status.PENDING)
            .first()
        )
        if friend_request is None:
            return Response({"detail": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

        if action in {"accept", "decline"} and friend_request.to_player_id != player.id:
            return Response(
                {"detail": "You do not have permission to respond to this request."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if action == "cancel" and friend_request.from_player_id != player.id:
            return Response(
                {"detail": "You do not have permission to cancel this request."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer_context = {"request": request, "current_player": player}
        if action == "accept":
            link = accept_friend_request(friend_request)
            friend_data = FriendLinkSerializer(link, context={"request": request}).data
            request_data = FriendRequestSerializer(friend_request, context=serializer_context).data
            return Response({"friend": friend_data, "friend_request": request_data}, status=status.HTTP_200_OK)

        friend_request.status = (
            FriendRequest.Status.DECLINED if action == "decline" else FriendRequest.Status.CANCELLED
        )
        friend_request.responded_at = timezone.now()
        friend_request.save(update_fields=["status", "responded_at", "updated_at"])
        request_data = FriendRequestSerializer(friend_request, context=serializer_context).data
        return Response({"friend_request": request_data}, status=status.HTTP_200_OK)


def _get_pending_migrations(db_alias=DEFAULT_DB_ALIAS):
    try:
        connection = connections[db_alias]
        connection.prepare_database()
        executor = MigrationExecutor(connection)
        targets = executor.loader.graph.leaf_nodes()
        plan = executor.migration_plan(targets)
        # plan is a list of tuples (Migration, backwards)
        pending = []
        for migration, backwards in plan:
            if not backwards:
                pending.append(f"{migration.app_label}.{migration.name}")
        return pending
    except Exception as exc:
        # Propagate for callers that want to turn this into 503
        raise exc


@api_view(["GET"])
def migration_status(request):
    """Return migration application status to help local setup/ops.

    Response:
    - 200 { pending: false, unapplied: [] } when all migrations are applied
    - 200 { pending: true, unapplied: [..] } when unapplied migrations exist
    - 503 with detail/action when DB cannot be inspected
    """
    try:
        unapplied = _get_pending_migrations()
    except (OperationalError, DatabaseError):
        return Response(
            {
                "detail": "Database unavailable or not initialized. Please apply migrations.",
                "action": "run ./scripts/setup.sh (first time), then ./scripts/migrate.sh or python manage.py migrate",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    return Response({"pending": bool(unapplied), "unapplied": unapplied}, status=status.HTTP_200_OK)


@api_view(["GET"])
def health(request):
    """Lightweight readiness probe for monitoring."""
    # Keep backward-compatible minimal payload
    payload = {"status": "ok"}
    # In debug, include a hint about migrations
    try:
        unapplied = _get_pending_migrations()
        if unapplied:
            payload["db"] = "pending"
        else:
            payload["db"] = "ok"
    except Exception:
        payload["db"] = "unknown"
    return Response(payload, status=200)
