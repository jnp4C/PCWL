from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from datetime import timedelta
from typing import Any, Dict, List, Optional, Set

from django.db.models import Case, Count, F, Q, Sum, When
from django.db.models.functions import Coalesce
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
from rest_framework.exceptions import NotAuthenticated, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    CheckIn,
    District,
    DistrictContributionStat,
    DistrictEngagement,
    FriendLink,
    FriendRequest,
    Party,
    PartyInvitation,
    PartyJoinRequest,
    PartyMembership,
    Player,
    PlayerPartyBond,
)
from .serializers import (
    BubbleSuggestionSerializer,
    CheckInRequestSerializer,
    CheckInSerializer,
    DistrictSerializer,
    FriendFavoriteSerializer,
    FriendLinkSerializer,
    FriendRequestSerializer,
    PlayerSearchResultSerializer,
    PlayerSerializer,
)
from .services import (
    CooldownActive,
    apply_checkin,
    create_party,
    get_active_party,
    invite_player_to_party,
    leave_party,
    set_party_name,
    request_party_join,
    respond_to_party_join_request,
    PartyError,
    PartyInviteError,
    MAX_PARTY_MEMBERS,
    PARTY_ATTACK_BONUS_PER_PLAYER,
    PARTY_CONTRIBUTION_DISTRICT_PER_PLAYER,
    PARTY_CONTRIBUTION_PLAYER_MULTIPLIER,
    _normalise_district_code,
    respond_to_party_invitation,
    start_charge,
)


DISTRICT_BASE_SCORE = 2000
DISTRICT_SECURE_THRESHOLD = 200
DISTRICT_RECENT_THRESHOLD = 100


def _classify_district_state(defended, attacked, threshold=DISTRICT_SECURE_THRESHOLD):
    defended = defended or 0
    attacked = attacked or 0
    net = defended - attacked
    if net >= threshold:
        return "secure"
    if net <= -threshold:
        return "overrun"
    return "contested"


def _clean_district_code(value: Optional[str]) -> Optional[str]:
    return _normalise_district_code(value)


def _serialize_party_member(player: Player, *, is_leader: bool, is_self: bool) -> Dict[str, Any]:
    return {
        "username": player.username,
        "display_name": player.display_name or "",
        "home_district_code": player.home_district_code or "",
        "home_district_name": player.home_district_name or player.home_district or "",
        "is_leader": is_leader,
        "is_self": is_self,
    }


def _build_party_preview_for_viewer(
    party: Party,
    leader_id: int,
    viewer: Player,
    *,
    member_count: int,
    viewer_party_id: Optional[int],
    pending_join_party_ids: Set[int],
    pending_invite_party_ids: Set[int],
    is_requestable: bool,
) -> Dict[str, Any]:
    now = timezone.now()
    seconds_remaining = None
    expires_at_ts = None
    if party.expires_at:
        seconds_remaining = max(0, int((party.expires_at - now).total_seconds()))
        expires_at_ts = int(party.expires_at.timestamp())

    join_status = "available"
    can_request = True
    if leader_id == viewer.id:
        join_status = "self"
        can_request = False
    elif viewer_party_id == party.id:
        join_status = "already_member"
        can_request = False
    elif viewer_party_id and viewer_party_id != party.id:
        join_status = "viewer_in_party"
        can_request = False
    elif member_count >= MAX_PARTY_MEMBERS:
        join_status = "full"
        can_request = False
    elif party.id in pending_join_party_ids:
        join_status = "pending"
        can_request = False
    elif party.id in pending_invite_party_ids:
        join_status = "invited"
        can_request = False
    elif not is_requestable:
        join_status = "not_friend"
        can_request = False

    return {
        "code": party.code,
        "name": party.name or "",
        "leader": party.leader.username if party.leader_id else "",
        "size": member_count,
        "seconds_remaining": seconds_remaining,
        "expires_at": expires_at_ts,
        "is_leader": True,
        "is_full": member_count >= MAX_PARTY_MEMBERS,
        "can_request": can_request,
        "join_status": join_status,
    }


def _gather_party_previews(
    viewer: Player,
    candidate_ids: Set[int],
    *,
    requestable_ids: Optional[Set[int]] = None,
) -> Dict[int, Dict[str, Any]]:
    if not candidate_ids:
        return {}
    requestable_ids = requestable_ids or set()
    leader_memberships = (
        PartyMembership.objects.select_related("party", "party__leader")
        .filter(player_id__in=candidate_ids, is_leader=True, left_at__isnull=True)
    )
    party_ids = {membership.party_id for membership in leader_memberships if membership.party_id}
    if not party_ids:
        return {}

    member_counts = {
        row["party_id"]: row["total"]
        for row in (
            PartyMembership.objects.filter(party_id__in=party_ids, left_at__isnull=True)
            .values("party_id")
            .annotate(total=Count("id"))
        )
    }
    pending_join_party_ids = {
        jr.party_id
        for jr in PartyJoinRequest.objects.filter(
            from_player=viewer,
            party_id__in=party_ids,
            status=PartyJoinRequest.Status.PENDING,
        )
    }
    pending_invite_party_ids = {
        inv.party_id
        for inv in PartyInvitation.objects.filter(
            to_player=viewer,
            party_id__in=party_ids,
            status=PartyInvitation.Status.PENDING,
        )
    }
    viewer_membership = (
        PartyMembership.objects.select_related("party")
        .filter(player=viewer, left_at__isnull=True)
        .first()
    )
    viewer_party_id = viewer_membership.party_id if viewer_membership else None

    previews: Dict[int, Dict[str, Any]] = {}
    for membership in leader_memberships:
        party = membership.party
        if not party or party.leader_id != membership.player_id:
            continue
        member_count = member_counts.get(party.id, 1)
        is_requestable = membership.player_id in requestable_ids
        previews[membership.player_id] = _build_party_preview_for_viewer(
            party,
            membership.player_id,
            viewer,
            member_count=member_count,
            viewer_party_id=viewer_party_id,
            pending_join_party_ids=pending_join_party_ids,
            pending_invite_party_ids=pending_invite_party_ids,
            is_requestable=is_requestable,
        )
    return previews


def _build_party_payload(party: Party, player: Player) -> Optional[Dict[str, Any]]:
    memberships = (
        PartyMembership.objects.select_related("player")
        .filter(party=party, left_at__isnull=True)
        .order_by("joined_at")
    )
    if not memberships:
        return None
    now = timezone.now()
    members_payload = []
    member_players = []
    size = 0
    player_is_leader = False
    for membership in memberships:
        member = membership.player
        member_players.append(member)
        size += 1
        if member.id == player.id and membership.is_leader:
            player_is_leader = True
        members_payload.append(
            _serialize_party_member(
                member,
                is_leader=membership.is_leader,
                is_self=member.id == player.id,
            )
        )

    # Determine active district by majority presence among members (>= 2)
    try:
        from .services import _determine_party_active_district
    except Exception:
        _determine_party_active_district = None  # type: ignore
    active_district_code = None
    active_district_name = None
    active_district_count = 0
    if _determine_party_active_district is not None:
        active_info = _determine_party_active_district(party, member_players)
        if isinstance(active_info, dict):
            active_district_code = active_info.get("code") or None
            active_district_name = active_info.get("name") or None
            try:
                active_district_count = int(active_info.get("count") or 0)
            except (TypeError, ValueError):
                active_district_count = 0

    seconds_remaining = None
    if party.expires_at:
        seconds_remaining = max(0, int((party.expires_at - now).total_seconds()))

    party_checkins = CheckIn.objects.filter(party_code=party.code)
    attack_agg = party_checkins.filter(action=CheckIn.Action.ATTACK).aggregate(
        total=Coalesce(Sum(-F("district_points_delta")), 0),
        count=Count("id"),
    )
    contribution_agg = party_checkins.filter(is_party_contribution=True).aggregate(
        total=Coalesce(Sum("district_points_delta"), 0),
        count=Count("id"),
    )
    attack_points = int(attack_agg.get("total") or 0)
    contribution_points = int(contribution_agg.get("total") or 0)
    attack_checkins = attack_agg.get("count", 0)
    contribution_checkins = contribution_agg.get("count", 0)

    focus = "balanced"
    if attack_points > contribution_points:
        focus = "aggressive"
    elif contribution_points > attack_points:
        focus = "defensive"

    attack_multiplier = float(PARTY_ATTACK_BONUS_PER_PLAYER * size)
    contribution_multiplier = float(PARTY_CONTRIBUTION_DISTRICT_PER_PLAYER * size)
    player_contribution_multiplier = contribution_multiplier * float(PARTY_CONTRIBUTION_PLAYER_MULTIPLIER)

    return {
        "code": party.code,
        "name": party.name or "",
        "leader": party.leader.username,
        "created_at": party.created_at,
        "expires_at": party.expires_at,
        "seconds_remaining": seconds_remaining,
        "size": size,
        "attack_multiplier": attack_multiplier,
        "contribution_multiplier": contribution_multiplier,
        "player_contribution_multiplier": player_contribution_multiplier,
        "attack_points": attack_points,
        "contribution_points": contribution_points,
        "attack_checkins": attack_checkins,
        "contribution_checkins": contribution_checkins,
        "focus": focus,
        "members": members_payload,
        "is_leader": player_is_leader,
        # Active district majority info for frontend UX
        "active_district_code": active_district_code or "",
        "active_district_name": active_district_name or "",
        "active_district_count": active_district_count,
    }


def _build_party_insights(player: Player) -> Dict[str, Any]:
    best_partner = None
    bond = (
        PlayerPartyBond.objects.select_related("partner")
        .filter(player=player)
        .order_by("-shared_checkins", "-shared_contribution_points", "-shared_attack_points")
        .first()
    )
    if bond:
        partner = bond.partner
        best_partner = {
            "username": partner.username,
            "display_name": partner.display_name or "",
            "shared_checkins": bond.shared_checkins,
            "shared_attack_points": bond.shared_attack_points,
            "shared_contribution_points": bond.shared_contribution_points,
            "last_shared_at": bond.last_shared_at,
        }

    top_contributors = []
    home_code = _clean_district_code(player.home_district_code)
    if home_code:
        contribution_stats = (
            DistrictContributionStat.objects.select_related("supporter")
            .filter(district_code=home_code)
            .order_by("-contribution_points")[:5]
        )
        for stat in contribution_stats:
            supporter = stat.supporter
            if supporter.id == player.id:
                continue
            top_contributors.append(
                {
                    "username": supporter.username,
                    "display_name": supporter.display_name or "",
                    "points": stat.contribution_points,
                    "checkins": stat.contribution_checkins,
                    "last_contribution_at": stat.last_contribution_at,
                }
            )

    return {
        "best_partner": best_partner,
        "top_contributors": top_contributors,
    }


def _serialize_party_invitation(invitation: PartyInvitation) -> Dict[str, Any]:
    return {
        "id": invitation.id,
        "party_code": invitation.party.code,
        "party_name": invitation.party.name or "",
        "from_username": invitation.from_player.username,
        "to_username": invitation.to_player.username,
        "status": invitation.status,
        "created_at": invitation.created_at,
        "responded_at": invitation.responded_at,
        "party_expires_at": invitation.party.expires_at,
    }


def _serialize_party_join_request(join_request: PartyJoinRequest) -> Dict[str, Any]:
    from_player = join_request.from_player
    return {
        "id": join_request.id,
        "party_code": join_request.party.code,
        "party_name": join_request.party.name or "",
        "from_username": from_player.username,
        "display_name": from_player.display_name or "",
        "status": join_request.status,
        "created_at": join_request.created_at,
        "responded_at": join_request.responded_at,
    }


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
                            "action": "run ./tools/migrate.sh or python manage.py migrate",
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
            else:
                return Response(
                    {
                        "detail": "Server database is not up to date. Please apply migrations.",
                        "action": "run ./tools/migrate.sh or python manage.py migrate",
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
                            "action": "run ./tools/migrate.sh or python manage.py migrate",
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
            else:
                return Response(
                    {
                        "authenticated": False,
                        "detail": "Server database is not up to date. Please apply migrations.",
                        "action": "run ./tools/migrate.sh or python manage.py migrate",
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        data = PlayerSerializer(player, context={"request": request}).data if player else None

        party_payload = None
        incoming_invites: List[Dict[str, Any]] = []
        outgoing_invites: List[Dict[str, Any]] = []
        insights = {"best_partner": None, "top_contributors": []}
        join_requests: List[Dict[str, Any]] = []
        if player:
            party = get_active_party(player)
            if party:
                party_payload = _build_party_payload(party, player)
                if party_payload and party_payload.get("is_leader"):
                    join_requests = [
                        _serialize_party_join_request(request_obj)
                        for request_obj in PartyJoinRequest.objects.select_related("from_player")
                        .filter(party=party, status=PartyJoinRequest.Status.PENDING)
                        .order_by("-created_at")
                    ]
                    party_payload["join_requests"] = join_requests
                    outgoing_invites = [
                        _serialize_party_invitation(invitation)
                        for invitation in PartyInvitation.objects.select_related("to_player")
                        .filter(party=party, status=PartyInvitation.Status.PENDING)
                        .order_by("-created_at")
                    ]
            else:
                if party_payload is not None and "join_requests" not in party_payload:
                    party_payload["join_requests"] = []
            insights = _build_party_insights(player)
            incoming_invites = [
                _serialize_party_invitation(invitation)
                for invitation in PartyInvitation.objects.select_related("from_player", "party")
                .filter(to_player=player, status=PartyInvitation.Status.PENDING)
                .order_by("-created_at")
            ]

        return Response(
            {
                "authenticated": True,
                "player": data,
                "party": party_payload,
                "party_invitations": {
                    "incoming": incoming_invites,
                    "outgoing": outgoing_invites,
                },
                "party_insights": insights,
            },
            status=status.HTTP_200_OK,
        )


class DistrictCatalogView(APIView):
    """Expose the authoritative district catalog for clients and admins."""

    permission_classes = [AllowAny]

    def get(self, request):
        queryset = District.objects.all()
        include_inactive = request.query_params.get("include_inactive")
        if not include_inactive:
            queryset = queryset.filter(is_active=True)
        search_term = request.query_params.get("q")
        if search_term:
            queryset = queryset.filter(Q(name__icontains=search_term) | Q(code__icontains=search_term))
        queryset = queryset.order_by("name", "code")
        serialized = DistrictSerializer(queryset, many=True, context={"request": request})
        payload = {
            "count": len(serialized.data),
            "districts": serialized.data,
        }
        return Response(payload, status=status.HTTP_200_OK)


class ChargeAttackView(PlayerScopedAPIView):
    """Begin charging an attack or defend multiplier."""

    def post(self, request):
        player = self.get_current_player(request)
        try:
            updated_player = start_charge(player)
        except CooldownActive as exc:
            # Return a more appropriate status for rate-limited/cooldown state
            return Response({"detail": str(exc)}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        serialized = PlayerSerializer(updated_player, context={"request": request})
        return Response({"player": serialized.data}, status=status.HTTP_200_OK)


class CheckInView(PlayerScopedAPIView):
    """Record an attack or defend action and return the updated player state."""

    def post(self, request):
        serializer = CheckInRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        player = self.get_current_player(request)
        payload = serializer.validated_data.copy()
        metadata = payload.pop("metadata", {}) or {}
        source = payload.pop("source", None)
        payload.pop("party_code", None)
        if source:
            metadata["source"] = source
        try:
            result = apply_checkin(player, metadata=metadata or None, **payload)
        except CooldownActive as exc:
            # Use 429 Too Many Requests to indicate active cooldown rather than a generic 400
            return Response({"detail": str(exc)}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        except ValueError as exc:
            raise ValidationError({"detail": str(exc)})
        player_data = PlayerSerializer(result.player, context={"request": request}).data
        checkin_data = CheckInSerializer(result.checkin).data
        response = {
            "player": player_data,
            "checkin": checkin_data,
        }
        return Response(response, status=status.HTTP_201_CREATED)


class PartyView(PlayerScopedAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        player = self.get_current_player(request)
        party = get_active_party(player)
        party_payload = _build_party_payload(party, player) if party else None
        insights = _build_party_insights(player)
        join_requests: List[Dict[str, Any]] = []
        if party and party_payload:
            if party_payload.get("is_leader"):
                join_requests = [
                    _serialize_party_join_request(request_obj)
                    for request_obj in PartyJoinRequest.objects.select_related("from_player")
                    .filter(party=party, status=PartyJoinRequest.Status.PENDING)
                    .order_by("-created_at")
                ]
            party_payload["join_requests"] = join_requests
        incoming = [
            _serialize_party_invitation(invitation)
            for invitation in PartyInvitation.objects.select_related("from_player", "party")
            .filter(to_player=player, status=PartyInvitation.Status.PENDING)
            .order_by("-created_at")
        ]
        outgoing: List[Dict[str, Any]] = []
        if party and party_payload and party_payload.get("is_leader"):
            outgoing = [
                _serialize_party_invitation(invitation)
                for invitation in PartyInvitation.objects.select_related("to_player")
                .filter(party=party, status=PartyInvitation.Status.PENDING)
                .order_by("-created_at")
            ]
        return Response(
            {
                "party": party_payload,
                "incoming_invitations": incoming,
                "outgoing_invitations": outgoing,
                "insights": insights,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        player = self.get_current_player(request)
        name = request.data.get("name") if hasattr(request, "data") else None
        try:
            party = create_party(player, name=name)
        except PartyError as exc:
            raise ValidationError({"detail": str(exc)})
        payload = _build_party_payload(party, player)
        if payload is not None and "join_requests" not in payload:
            payload["join_requests"] = []
        return Response({"party": payload}, status=status.HTTP_201_CREATED)

    def patch(self, request):
        player = self.get_current_player(request)
        name = request.data.get("name") if hasattr(request, "data") else None
        try:
            party = set_party_name(player, name)
        except PartyError as exc:
            raise ValidationError({"detail": str(exc)})
        payload = _build_party_payload(party, player)
        if payload is not None and "join_requests" not in payload:
            payload["join_requests"] = []
        return Response({"party": payload}, status=status.HTTP_200_OK)

    def delete(self, request):
        player = self.get_current_player(request)
        leave_party(player)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PartyInviteView(PlayerScopedAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        player = self.get_current_player(request)
        username = str(request.data.get("username", "")).strip()
        if not username:
            raise ValidationError({"detail": "Username is required."})
        target = Player.objects.filter(username__iexact=username).first()
        if target is None:
            return Response({"detail": "Player not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            invitation = invite_player_to_party(player, target)
        except (PartyError, PartyInviteError) as exc:
            raise ValidationError({"detail": str(exc)})
        return Response({"invitation": _serialize_party_invitation(invitation)}, status=status.HTTP_201_CREATED)


class PartyInvitationDetailView(PlayerScopedAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        player = self.get_current_player(request)
        action = str(request.data.get("action", "")).strip().lower()
        try:
            invitation = PartyInvitation.objects.select_related("party", "from_player", "to_player").get(pk=pk)
        except PartyInvitation.DoesNotExist:
            return Response({"detail": "Invitation not found."}, status=status.HTTP_404_NOT_FOUND)

        if action not in {"accept", "decline"}:
            raise ValidationError({"detail": "Unsupported action."})
        try:
            invitation = respond_to_party_invitation(invitation, player, accept=action == "accept")
        except (PartyError, PartyInviteError) as exc:
            raise ValidationError({"detail": str(exc)})
        return Response({"invitation": _serialize_party_invitation(invitation)}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        player = self.get_current_player(request)
        try:
            invitation = PartyInvitation.objects.select_related("party", "from_player").get(pk=pk)
        except PartyInvitation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if invitation.status != PartyInvitation.Status.PENDING:
            return Response(status=status.HTTP_204_NO_CONTENT)
        party = invitation.party
        if invitation.from_player_id != player.id and party.leader_id != player.id:
            raise ValidationError({"detail": "You do not have permission to cancel this invitation."})
        invitation.status = PartyInvitation.Status.CANCELLED
        invitation.responded_at = timezone.now()
        invitation.save(update_fields=["status", "responded_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class PartyJoinRequestView(PlayerScopedAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        player = self.get_current_player(request)
        username = str(request.data.get("username", "")).strip()
        if not username:
            raise ValidationError({"detail": "Username is required."})
        target = Player.objects.filter(username__iexact=username).first()
        if target is None:
            return Response({"detail": "Player not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            join_request = request_party_join(player, target)
        except (PartyError, PartyInviteError) as exc:
            raise ValidationError({"detail": str(exc)})
        payload = _serialize_party_join_request(join_request)
        return Response({"join_request": payload}, status=status.HTTP_201_CREATED)


class PartyJoinRequestDetailView(PlayerScopedAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        player = self.get_current_player(request)
        action = str(request.data.get("action", "")).strip().lower()
        if action not in {"accept", "decline"}:
            raise ValidationError({"detail": "Unsupported action."})
        try:
            join_request = PartyJoinRequest.objects.select_related("party", "from_player").get(pk=pk)
        except PartyJoinRequest.DoesNotExist:
            return Response({"detail": "Join request not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            join_request = respond_to_party_join_request(join_request, player, accept=action == "accept")
        except (PartyError, PartyInviteError) as exc:
            raise ValidationError({"detail": str(exc)})
        payload = _serialize_party_join_request(join_request)
        return Response({"join_request": payload}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        player = self.get_current_player(request)
        try:
            join_request = PartyJoinRequest.objects.select_related("party", "from_player").get(pk=pk)
        except PartyJoinRequest.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if join_request.party.leader_id != player.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if join_request.status != PartyJoinRequest.Status.PENDING:
            return Response(status=status.HTTP_204_NO_CONTENT)
        join_request.status = PartyJoinRequest.Status.DECLINED
        join_request.responded_at = timezone.now()
        join_request.save(update_fields=["status", "responded_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class DistrictActivityView(APIView):
    """Expose aggregated attack/defend metrics for a specific district."""

    permission_classes = [AllowAny]

    def get(self, request, code):
        district_code = str(code or "").strip()
        if not district_code:
            return Response({"detail": "District code is required."}, status=status.HTTP_400_BAD_REQUEST)

        window_param = request.query_params.get("window")
        try:
            window_hours = int(window_param) if window_param is not None else 24
        except (TypeError, ValueError):
            window_hours = 24
        window_hours = max(1, min(window_hours, 168))

        cutoff = timezone.now() - timedelta(hours=window_hours)
        base_qs = CheckIn.objects.filter(district_code__iexact=district_code)
        totals = base_qs.aggregate(
            defended=Coalesce(
                Sum(
                    Case(
                        When(action=CheckIn.Action.DEFEND, then=F("district_points_delta")),
                        default=0,
                    )
                ),
                0,
            ),
            attacked=Coalesce(
                Sum(
                    Case(
                        When(action=CheckIn.Action.ATTACK, then=-F("district_points_delta")),
                        default=0,
                    )
                ),
                0,
            ),
        )
        recent_totals = base_qs.filter(occurred_at__gte=cutoff).aggregate(
            defended=Coalesce(
                Sum(
                    Case(
                        When(action=CheckIn.Action.DEFEND, then=F("district_points_delta")),
                        default=0,
                    )
                ),
                0,
            ),
            attacked=Coalesce(
                Sum(
                    Case(
                        When(action=CheckIn.Action.ATTACK, then=-F("district_points_delta")),
                        default=0,
                    )
                ),
                0,
            ),
        )

        district_name = (
            base_qs.exclude(district_name="")
            .values_list("district_name", flat=True)
            .first()
        )
        if not district_name:
            engagement_name = (
                DistrictEngagement.objects.filter(target_district_code__iexact=district_code)
                .exclude(target_district_name="")
                .values_list("target_district_name", flat=True)
                .first()
            )
            district_name = engagement_name or f"District {district_code}"

        defended_total = int(totals.get("defended") or 0)
        attacked_total = int(totals.get("attacked") or 0)
        defended_recent = int(recent_totals.get("defended") or 0)
        attacked_recent = int(recent_totals.get("attacked") or 0)

        top_attackers = list(
            base_qs.filter(action=CheckIn.Action.ATTACK)
            .values("home_district_code_snapshot", "home_district_name_snapshot")
            .annotate(points=Sum("points_awarded"), checkins=Count("id"))
            .order_by("-points", "-checkins")[:5]
        )
        for entry in top_attackers:
            entry["home_district_code"] = entry.pop("home_district_code_snapshot") or ""
            name = entry.pop("home_district_name_snapshot") or ""
            code_value = entry["home_district_code"]
            entry["home_district_name"] = name or (f"District {code_value}" if code_value else "")

        top_defenders = list(
            base_qs.filter(action=CheckIn.Action.DEFEND)
            .values("home_district_code_snapshot", "home_district_name_snapshot")
            .annotate(points=Sum("points_awarded"), checkins=Count("id"))
            .order_by("-points", "-checkins")[:5]
        )
        for entry in top_defenders:
            entry["home_district_code"] = entry.pop("home_district_code_snapshot") or ""
            name = entry.pop("home_district_name_snapshot") or ""
            code_value = entry["home_district_code"]
            entry["home_district_name"] = name or (f"District {code_value}" if code_value else "")

        engagement_rows = list(
            DistrictEngagement.objects.filter(target_district_code__iexact=district_code)
            .order_by("-attack_points_total")[:5]
            .values(
                "home_district_code",
                "home_district_name",
                "target_district_code",
                "target_district_name",
                "attack_points_total",
                "attack_checkins",
                "party_attack_checkins",
                "last_attack_at",
            )
        )
        for row in engagement_rows:
            if not row.get("home_district_name") and row.get("home_district_code"):
                row["home_district_name"] = f"District {row['home_district_code']}"

        recent_checkins = base_qs.order_by("-occurred_at")[:10]
        serialized_checkins = CheckInSerializer(recent_checkins, many=True).data

        top_contributors = []
        contribution_stats = (
            DistrictContributionStat.objects.select_related("supporter")
            .filter(district_code__iexact=district_code)
            .order_by("-contribution_points")[:5]
        )
        for stat in contribution_stats:
            supporter = stat.supporter
            top_contributors.append(
                {
                    "username": supporter.username,
                    "display_name": supporter.display_name or "",
                    "points": stat.contribution_points,
                    "checkins": stat.contribution_checkins,
                    "last_contribution_at": stat.last_contribution_at,
                }
            )

        response_data = {
            "district": {
                "code": district_code,
                "name": district_name,
            },
            "window_hours": window_hours,
            "status": _classify_district_state(defended_total, attacked_total, DISTRICT_SECURE_THRESHOLD),
            "recent_status": _classify_district_state(
                defended_recent,
                attacked_recent,
                DISTRICT_RECENT_THRESHOLD,
            ),
            "totals": {
                "defended": defended_total,
                "attacked": attacked_total,
                "net": defended_total - attacked_total,
            },
            "recent_totals": {
                "defended": defended_recent,
                "attacked": attacked_recent,
                "net": defended_recent - attacked_recent,
                "cutoff": cutoff,
            },
            "top_attackers": top_attackers,
            "top_defenders": top_defenders,
            "rival_engagements": engagement_rows,
            "top_contributors": top_contributors,
            "recent_checkins": serialized_checkins,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class DistrictStrategyView(APIView):
    """Summaries of how home districts focus their attacks across the map."""

    permission_classes = [AllowAny]

    def get(self, request):
        per_home_param = request.query_params.get("per_home")
        try:
            per_home_limit = int(per_home_param) if per_home_param is not None else 3
        except (TypeError, ValueError):
            per_home_limit = 3
        per_home_limit = max(1, min(per_home_limit, 5))

        home_map: Dict[str, Dict[str, Any]] = {}
        engagements = DistrictEngagement.objects.exclude(home_district_code="").order_by(
            "home_district_code", "-attack_points_total"
        )
        for engagement in engagements:
            home_code = engagement.home_district_code or ""
            if not home_code:
                continue
            home_entry = home_map.setdefault(
                home_code,
                {
                    "home_district_code": home_code,
                    "home_district_name": engagement.home_district_name or f"District {home_code}",
                    "total_points": 0,
                    "total_checkins": 0,
                    "targets": [],
                },
            )
            home_entry["total_points"] += engagement.attack_points_total
            home_entry["total_checkins"] += engagement.attack_checkins
            home_entry["targets"].append(
                {
                    "target_district_code": engagement.target_district_code,
                    "target_district_name": engagement.target_district_name
                    or f"District {engagement.target_district_code}",
                    "attack_points_total": engagement.attack_points_total,
                    "attack_checkins": engagement.attack_checkins,
                    "party_attack_checkins": engagement.party_attack_checkins,
                    "last_attack_at": engagement.last_attack_at,
                }
            )

        homes_payload = []
        for entry in home_map.values():
            targets = sorted(
                entry["targets"],
                key=lambda item: (item["attack_points_total"], item["attack_checkins"]),
                reverse=True,
            )
            top_targets = targets[:per_home_limit]
            homes_payload.append(
                {
                    "home_district_code": entry["home_district_code"],
                    "home_district_name": entry["home_district_name"],
                    "total_points": entry["total_points"],
                    "total_checkins": entry["total_checkins"],
                    "primary_target": top_targets[0] if top_targets else None,
                    "top_targets": top_targets,
                }
            )

        global_top_targets = list(
            DistrictEngagement.objects.exclude(target_district_code="")
            .order_by("-attack_points_total")[:10]
            .values(
                "home_district_code",
                "home_district_name",
                "target_district_code",
                "target_district_name",
                "attack_points_total",
                "attack_checkins",
                "party_attack_checkins",
                "last_attack_at",
            )
        )
        for item in global_top_targets:
            if not item.get("home_district_name") and item.get("home_district_code"):
                item["home_district_name"] = f"District {item['home_district_code']}"
            if not item.get("target_district_name") and item.get("target_district_code"):
                item["target_district_name"] = f"District {item['target_district_code']}"

        homes_payload.sort(key=lambda item: (item["total_points"], item["total_checkins"]), reverse=True)

        return Response(
            {
                "generated_at": timezone.now(),
                "per_home_limit": per_home_limit,
                "homes": homes_payload,
                "global_top_targets": global_top_targets,
            },
            status=status.HTTP_200_OK,
        )


class FriendListView(PlayerScopedAPIView):
    """List or add friends for the authenticated player."""

    def get(self, request):
        player = self.get_current_player(request)
        friend_links = (
            FriendLink.objects.select_related("friend")
            .filter(player=player)
            .order_by("-is_favorite", "friend__username")
        )
        friend_ids: Set[int] = {link.friend_id for link in friend_links if link.friend_id}
        party_previews = _gather_party_previews(player, friend_ids, requestable_ids=friend_ids)
        serializer = FriendLinkSerializer(
            friend_links,
            many=True,
            context={
                "request": request,
                "current_player": player,
                "party_previews": party_previews,
            },
        )
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


class FriendBubbleView(PlayerScopedAPIView):
    """Suggest friends-of-friends, prioritising party teammates."""

    MAX_RESULTS = 30

    def _format_direct_friend_suggestions(
        self,
        links: List[FriendLink],
        party_previews: Dict[int, Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        suggestions: List[Dict[str, Any]] = []
        for link in links[: self.MAX_RESULTS]:
            friend = link.friend
            if friend is None:
                continue
            suggestions.append(
                {
                    "username": friend.username,
                    "display_name": friend.display_name or "",
                    "home_district_name": friend.home_district_name or friend.home_district or "",
                    "home_district_code": friend.home_district_code or "",
                    "mutual_friend_count": 0,
                    "mutual_friends": [],
                    "party_affinity": None,
                    "active_party": party_previews.get(friend.id),
                }
            )
        return suggestions

    def get(self, request):
        player = self.get_current_player(request)

        direct_links = list(
            FriendLink.objects.select_related("friend")
            .filter(player=player, friend__is_active=True)
        )
        direct_friend_map = {
            link.friend_id: link.friend
            for link in direct_links
            if link.friend_id and link.friend is not None
        }
        direct_friend_ids = set(direct_friend_map.keys())
        if not direct_friend_ids:
            fallback = self._format_direct_friend_suggestions(direct_links, {})
            serializer = BubbleSuggestionSerializer(fallback, many=True)
            return Response({"bubble": serializer.data, "source": "friends"}, status=status.HTTP_200_OK)

        candidate_links = (
            FriendLink.objects.select_related("player", "friend")
            .filter(player_id__in=direct_friend_ids, friend__is_active=True)
            .exclude(friend_id=player.id)
            .exclude(friend_id__in=direct_friend_ids)
        )

        candidate_map: Dict[int, Dict[str, Any]] = {}
        for link in candidate_links:
            candidate = link.friend
            if candidate is None:
                continue
            entry = candidate_map.get(candidate.id)
            if entry is None:
                entry = {
                    "player": candidate,
                    "mutual_friend_ids": set(),
                    "latest_link_at": link.updated_at,
                }
                candidate_map[candidate.id] = entry
            entry["mutual_friend_ids"].add(link.player_id)
            latest = entry.get("latest_link_at")
            if latest is None or (link.updated_at and link.updated_at > latest):
                entry["latest_link_at"] = link.updated_at

        all_candidate_ids: Set[int] = set(candidate_map.keys()) | direct_friend_ids
        party_previews = _gather_party_previews(player, all_candidate_ids, requestable_ids=direct_friend_ids)

        if not candidate_map:
            fallback = self._format_direct_friend_suggestions(direct_links, party_previews)
            serializer = BubbleSuggestionSerializer(fallback, many=True)
            return Response({"bubble": serializer.data, "source": "friends"}, status=status.HTTP_200_OK)

        candidate_ids = list(candidate_map.keys())
        bonds = {
            bond.partner_id: bond
            for bond in PlayerPartyBond.objects.filter(player=player, partner_id__in=candidate_ids)
        }

        suggestions: List[Dict[str, Any]] = []
        for candidate_id, data in candidate_map.items():
            candidate: Player = data["player"]  # type: ignore[assignment]
            mutual_friend_ids: Set[int] = data["mutual_friend_ids"]  # type: ignore[assignment]
            if not mutual_friend_ids:
                continue

            mutual_friends_payload: List[Dict[str, str]] = []
            for mutual_id in sorted(mutual_friend_ids):
                mutual_player = direct_friend_map.get(mutual_id)
                if not mutual_player:
                    continue
                mutual_friends_payload.append(
                    {
                        "username": mutual_player.username,
                        "display_name": mutual_player.display_name or "",
                    }
                )

            if not mutual_friends_payload:
                continue

            bond = bonds.get(candidate_id)
            encounters = int(bond.shared_checkins) if bond else 0
            last_encounter_ms: Optional[int] = None
            if bond and bond.last_shared_at:
                last_encounter_ms = int(bond.last_shared_at.timestamp() * 1000)

            latest_link_at = data.get("latest_link_at")
            latest_link_ts = 0
            if latest_link_at is not None:
                try:
                    latest_link_ts = int(latest_link_at.timestamp())
                except Exception:
                    latest_link_ts = 0

            suggestions.append(
                {
                    "username": candidate.username,
                    "display_name": candidate.display_name or "",
                    "home_district_name": candidate.home_district_name or "",
                    "home_district_code": candidate.home_district_code or "",
                    "mutual_friend_count": len(mutual_friends_payload),
                    "mutual_friends": mutual_friends_payload,
                    "party_affinity": (
                        {
                            "encounters": encounters,
                            "last_encounter_at": last_encounter_ms,
                        }
                        if encounters > 0
                        else None
                    ),
                    "active_party": party_previews.get(candidate_id),
                    "_sort": {
                        "party_encounters": encounters,
                        "party_last_ts": last_encounter_ms or 0,
                        "mutual_count": len(mutual_friends_payload),
                        "link_ts": latest_link_ts,
                    },
                }
            )

        if not suggestions:
            fallback = self._format_direct_friend_suggestions(direct_links, party_previews)
            serializer = BubbleSuggestionSerializer(fallback, many=True)
            return Response({"bubble": serializer.data, "source": "friends"}, status=status.HTTP_200_OK)

        def sort_key(item: Dict[str, Any]):
            meta = item["_sort"]
            username_value = item.get("username")
            username_key = username_value.lower() if isinstance(username_value, str) else ""
            return (
                -meta["party_encounters"],
                -meta["mutual_count"],
                -meta["party_last_ts"],
                -meta["link_ts"],
                username_key,
            )

        ordered = sorted(suggestions, key=sort_key)[: self.MAX_RESULTS]
        for entry in ordered:
            entry.pop("_sort", None)

        serializer = BubbleSuggestionSerializer(ordered, many=True)
        return Response({"bubble": serializer.data}, status=status.HTTP_200_OK)


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


def _build_player_leaderboard(limit=100):
    queryset = (
        Player.objects.filter(is_active=True)
        .order_by("-score", "-attack_points", "-defend_points", "username")
    )
    if limit and limit > 0:
        queryset = queryset[:limit]

    payload: List[Dict[str, Any]] = []
    for index, player in enumerate(queryset, start=1):
        payload.append(
            {
                "username": player.username,
                "display_name": player.display_name or "",
                "score": player.score,
                "attack_points": player.attack_points,
                "defend_points": player.defend_points,
                "checkins": player.checkins,
                "home_district_code": player.home_district_code,
                "home_district_name": player.home_district_name,
                "rank": index,
            }
        )
    return payload


def _build_district_leaderboard(limit: Optional[int] = None):
    now = timezone.now()
    recent_cutoff = now - timedelta(hours=24)
    recent_rows = CheckIn.objects.filter(district_code__isnull=False, occurred_at__gte=recent_cutoff).values(
        "district_code"
    )
    recent_rows = recent_rows.annotate(
        defended=Coalesce(
            Sum(
                Case(
                    When(action=CheckIn.Action.DEFEND, then=F("district_points_delta")),
                    default=0,
                )
            ),
            0,
        ),
        attacked=Coalesce(
            Sum(
                Case(
                    When(action=CheckIn.Action.ATTACK, then=-F("district_points_delta")),
                    default=0,
                )
            ),
            0,
        ),
    )
    recent_map = {}
    for row in recent_rows:
        key = (row.get("district_code") or "").strip()
        if key:
            recent_map[key] = row

    districts = []
    base_queryset = District.objects.filter(
        Q(is_active=True)
        | Q(checkin_total__gt=0)
        | Q(defended_points_total__gt=0)
        | Q(attacked_points_total__gt=0)
    )
    district_map = {district.code: district for district in base_queryset if district.code}
    district_codes: Set[str] = set(district_map.keys())
    district_codes.update(recent_map.keys())

    if not district_codes:
        return []

    missing_codes = {code for code in district_codes if code not in district_map}
    missing_totals = {}
    if missing_codes:
        total_rows = (
            CheckIn.objects.filter(district_code__in=missing_codes)
            .values("district_code", "district_name")
            .annotate(
                defended=Coalesce(
                    Sum(
                        Case(
                            When(action=CheckIn.Action.DEFEND, then=F("district_points_delta")),
                            default=0,
                        )
                    ),
                    0,
                ),
                attacked=Coalesce(
                    Sum(
                        Case(
                            When(action=CheckIn.Action.ATTACK, then=-F("district_points_delta")),
                            default=0,
                        )
                    ),
                    0,
                ),
                checkins=Count("id"),
            )
        )
        for row in total_rows:
            code = (row.get("district_code") or "").strip()
            if code:
                missing_totals[code] = row

    player_counts_map = {
        row["home_district_code"]: row["total"]
        for row in (
            Player.objects.filter(home_district_code__in=district_codes, is_active=True)
            .values("home_district_code")
            .annotate(total=Count("id"))
        )
    }

    for district_code in district_codes:
        district_obj = district_map.get(district_code)
        fallback_row = missing_totals.get(district_code, {})
        base_strength = getattr(district_obj, "base_strength", DISTRICT_BASE_SCORE)
        if district_obj:
            defended = int(getattr(district_obj, "defended_points_total", 0) or 0)
            attacked = int(getattr(district_obj, "attacked_points_total", 0) or 0)
            checkins_total = int(getattr(district_obj, "checkin_total", 0) or 0)
            strength = getattr(district_obj, "current_strength", None)
        else:
            defended = int(fallback_row.get("defended") or 0)
            attacked = int(fallback_row.get("attacked") or 0)
            checkins_total = int(fallback_row.get("checkins") or (defended + attacked))
            strength = None
        if strength is None:
            strength = base_strength + defended - attacked
        change = strength - base_strength
        name = ""
        if district_obj and district_obj.name:
            name = district_obj.name
        elif fallback_row.get("district_name"):
            name = (fallback_row.get("district_name") or "").strip()
        if not name:
            name = f"District {district_code}"
        recent_row = recent_map.get(district_code, {})
        recent_defended = int(recent_row.get("defended") or 0)
        recent_attacked = int(recent_row.get("attacked") or 0)
        recent_change = recent_defended - recent_attacked
        status = _classify_district_state(defended, attacked, DISTRICT_SECURE_THRESHOLD)
        recent_status = _classify_district_state(
            recent_defended,
            recent_attacked,
            DISTRICT_RECENT_THRESHOLD,
        )

        districts.append(
            {
                "id": district_code,
                "name": name,
                "base_strength": base_strength,
                "score": strength,
                "strength": strength,
                "change": change,
                "defended": defended,
                "attacked": attacked,
                "checkins": checkins_total,
                "assigned_players": int(player_counts_map.get(district_code, 0)),
                "status": status,
                "recent_change": recent_change,
                "recent_status": recent_status,
                "recent_defended": recent_defended,
                "recent_attacked": recent_attacked,
            }
        )
    districts_by_score = sorted(
        districts,
        key=lambda item: (-item["score"], -item["defended"], item["name"]),
    )

    for index, item in enumerate(districts_by_score, start=1):
        item["rank"] = index

    if limit is None:
        return districts_by_score

    if limit <= 0:
        return []

    loss_limit = min(10, max(0, limit // 5))
    supplemental_losses: List[Dict[str, Any]] = []
    if loss_limit > 0:
        losses_sorted = sorted(
            districts,
            key=lambda item: (item["score"], item["change"], item["name"]),
        )
        for loss in losses_sorted:
            if loss["change"] >= 0:
                continue
            if loss["rank"] <= limit:
                continue
            supplemental_losses.append(loss)
            if len(supplemental_losses) >= loss_limit:
                break

    primary_count = max(0, limit - len(supplemental_losses))
    primary_slice = districts_by_score[:primary_count]

    combined: List[Dict[str, Any]] = []
    seen_ids: Set[str] = set()
    for item in primary_slice:
        combined.append(item)
        seen_ids.add(item["id"])
    for item in supplemental_losses:
        if item["id"] in seen_ids:
            continue
        combined.append(item)
        seen_ids.add(item["id"])

    if len(combined) < limit:
        for item in districts_by_score[primary_count:]:
            if item["id"] in seen_ids:
                continue
            combined.append(item)
            seen_ids.add(item["id"])
            if len(combined) >= limit:
                break

    return combined


class LeaderboardView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        data = {
            "players": _build_player_leaderboard(),
            "districts": _build_district_leaderboard(),
        }
        return Response(data, status=status.HTTP_200_OK)


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
                "action": "run ./tools/setup.sh (first time), then ./tools/migrate.sh or python manage.py migrate",
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
