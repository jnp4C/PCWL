from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from django.db import transaction
from django.utils import timezone

from .models import (
    CheckIn,
    DistrictContributionStat,
    DistrictEngagement,
    Party,
    PartyInvitation,
    PartyMembership,
    Player,
    PlayerPartyBond,
)

POINTS_PER_CHECKIN = 10
CHARGE_ATTACK_MULTIPLIER = 3
MAX_HISTORY_ENTRIES = 50
DEFAULT_PARTY_DURATION = timedelta(hours=3)

COOLDOWN_KEYS = {
    "attack": "attack",
    "defend": "defend",
    "charge": "charge",
}

COOLDOWN_DURATIONS_MS = {
    "attack": 3 * 60 * 1000,
    "defend_local": 3 * 60 * 1000,
    "defend_remote": 10 * 60 * 1000,
    "charge": 2 * 60 * 1000,
}

PARTY_ATTACK_BONUS_PER_PLAYER = Decimal("2")
PARTY_CONTRIBUTION_DISTRICT_PER_PLAYER = Decimal("2.5")
PARTY_CONTRIBUTION_PLAYER_MULTIPLIER = Decimal("5")
MAX_PARTY_MEMBERS = 4


@dataclass
class CheckInResult:
    player: Player
    checkin: CheckIn
    points_awarded: int


class CooldownActive(Exception):
    """Raised when a requested action is still on cooldown."""


class PartyError(Exception):
    """Base error for party-management issues."""


class PartyInviteError(PartyError):
    """Raised when party invitations cannot be processed."""


def _now_ms() -> int:
    return int(timezone.now().timestamp() * 1000)


def _normalise_district_code(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _normalise_district_name(value: Optional[str]) -> Optional[str]:
    if value is None:
        return ""
    text = str(value).strip()
    return text[:120]


def _ensure_dict(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    return {}


def _end_party(party: Party, when: Optional[timezone.datetime] = None) -> None:
    """Mark a party as ended and release all active memberships."""
    when = when or timezone.now()
    if party.status == Party.Status.ENDED:
        return
    PartyMembership.objects.filter(party=party, left_at__isnull=True).update(left_at=when)
    party.status = Party.Status.ENDED
    party.ended_at = when
    party.save(update_fields=["status", "ended_at", "updated_at"])
    party.invitations.filter(status=PartyInvitation.Status.PENDING).update(
        status=PartyInvitation.Status.CANCELLED,
        responded_at=when,
    )


def _get_active_party_membership(player: Player, lock: bool = False) -> Optional[PartyMembership]:
    """Return the player's active party membership or None when none/expired."""
    qs = PartyMembership.objects.select_related("party").filter(player=player, left_at__isnull=True)
    if lock:
        qs = qs.select_for_update()
    membership = qs.first()
    if not membership:
        return None
    party = membership.party
    if not party.is_active():
        _end_party(party)
        return None
    return membership


def _ensure_no_active_party(player: Player) -> None:
    if _get_active_party_membership(player, lock=True):
        raise PartyError("Player is already in an active party.")


def create_party(leader: Player, duration: timedelta = DEFAULT_PARTY_DURATION) -> Party:
    """Start a new party for the leader."""
    now = timezone.now()
    expires_at = now + duration
    with transaction.atomic():
        _ensure_no_active_party(leader)
        party = Party.objects.create(
            leader=leader,
            expires_at=expires_at,
        )
        PartyMembership.objects.create(party=party, player=leader, is_leader=True, joined_at=now)
        return party


def invite_player_to_party(leader: Player, target: Player) -> PartyInvitation:
    """Send a party invitation to a friend."""
    now = timezone.now()
    with transaction.atomic():
        membership = _get_active_party_membership(leader, lock=True)
        if not membership or not membership.is_leader:
            raise PartyError("Only party leaders can invite players.")
        party = membership.party
        if not party.is_active():
            raise PartyError("Party is no longer active.")
        active_count = party.memberships.filter(left_at__isnull=True).count()
        if active_count >= MAX_PARTY_MEMBERS:
            raise PartyError("Party is already full.")
        if _get_active_party_membership(target, lock=True):
            raise PartyError("Player is already in a different party.")
        invite, created = PartyInvitation.objects.get_or_create(
            party=party,
            from_player=leader,
            to_player=target,
            defaults={"created_at": now},
        )
        if not created and invite.status != PartyInvitation.Status.PENDING:
            raise PartyInviteError("Player already responded to this invitation.")
        invite.status = PartyInvitation.Status.PENDING
        invite.created_at = now
        invite.responded_at = None
        invite.save(update_fields=["status", "created_at", "responded_at"])
        return invite


def respond_to_party_invitation(invitation: PartyInvitation, player: Player, accept: bool) -> PartyInvitation:
    """Accept or decline a party invitation."""
    with transaction.atomic():
        invitation = (
            PartyInvitation.objects.select_for_update()
            .select_related("party", "to_player")
            .get(pk=invitation.pk)
        )
        if invitation.to_player_id != player.id:
            raise PartyInviteError("Invitation does not belong to this player.")
        if invitation.status != PartyInvitation.Status.PENDING:
            raise PartyInviteError("Invitation has already been processed.")
        if accept:
            membership = _get_active_party_membership(player, lock=True)
            if membership:
                raise PartyError("Player is already in another party.")
            party = invitation.party
            if not party.is_active():
                _end_party(party)
                raise PartyInviteError("Party is no longer active.")
            active_count = party.memberships.filter(left_at__isnull=True).count()
            if active_count >= MAX_PARTY_MEMBERS:
                raise PartyInviteError("Party is already full.")
            PartyMembership.objects.create(
                party=party,
                player=player,
                joined_at=timezone.now(),
            )
            invitation.status = PartyInvitation.Status.ACCEPTED
        else:
            invitation.status = PartyInvitation.Status.DECLINED
        invitation.responded_at = timezone.now()
        invitation.save(update_fields=["status", "responded_at"])
        return invitation


def leave_party(player: Player) -> None:
    """Leave the current party; leaders disband the party."""
    with transaction.atomic():
        membership = _get_active_party_membership(player, lock=True)
        if not membership:
            return
        party = membership.party
        now = timezone.now()
        membership.left_at = now
        membership.save(update_fields=["left_at"])
        if membership.is_leader:
            _end_party(party, when=now)
        else:
            if not party.memberships.filter(left_at__isnull=True).exists():
                _end_party(party, when=now)


def get_active_party(player: Player) -> Optional[Party]:
    membership = _get_active_party_membership(player)
    return membership.party if membership else None


def _resolve_party_context(
    player: Player,
    district_code: Optional[str],
) -> Dict[str, Any]:
    """Return details about the player's current party, if any."""
    membership = _get_active_party_membership(player)
    if not membership:
        return {
            "party": None,
            "members": [],
            "size": 0,
            "has_home_member": False,
            "code": "",
        }
    party = membership.party
    active_memberships = (
        PartyMembership.objects.select_related("player")
        .filter(party=party, left_at__isnull=True)
        .order_by("joined_at")
    )
    members = [m.player for m in active_memberships]
    size = len(members)
    normalized_code = _normalise_district_code(district_code)
    home_members: List[Player] = []
    if normalized_code:
        for member in members:
            home_code = _normalise_district_code(member.home_district_code)
            if home_code and home_code == normalized_code:
                home_members.append(member)
    return {
        "party": party,
        "members": members,
        "size": size,
        "has_home_member": bool(home_members),
        "home_members": home_members,
        "code": party.code,
    }

def _is_on_cooldown(player: Player, key: str, now_ms: Optional[int] = None) -> bool:
    now = now_ms or _now_ms()
    cooldowns = _ensure_dict(player.cooldowns)
    deadline = cooldowns.get(key)
    if deadline is None:
        return False
    try:
        deadline_int = int(deadline)
    except (TypeError, ValueError):
        return False
    return deadline_int > now


def _update_cooldown(player: Player, key: str, duration_ms: int, mode: Optional[str] = None, now_ms: Optional[int] = None) -> None:
    now = now_ms or _now_ms()
    cooldowns = _ensure_dict(player.cooldowns)
    cooldown_details = _ensure_dict(player.cooldown_details)
    deadline = now + duration_ms
    cooldowns[key] = deadline
    detail: Dict[str, Any] = {
        "duration": duration_ms,
        "startedAt": now,
    }
    if mode:
        detail["mode"] = mode
    cooldown_details[key] = detail
    player.cooldowns = cooldowns
    player.cooldown_details = cooldown_details


def _append_history_entry(player: Player, *, checkin: CheckIn, mode: str, precision: Optional[str], multiplier: Decimal, now_ms: int) -> None:
    history = player.checkin_history if isinstance(player.checkin_history, list) else []
    entry = {
        "timestamp": now_ms,
        "districtId": checkin.district_code,
        "districtName": checkin.district_name,
        "type": checkin.action,
        "multiplier": float(multiplier),
        "ranged": mode == CheckIn.Mode.RANGED,
        "melee": mode == CheckIn.Mode.LOCAL,
        "cooldownType": COOLDOWN_KEYS["defend"] if checkin.action == CheckIn.Action.DEFEND else COOLDOWN_KEYS["attack"],
        "cooldownMode": mode,
        "points": checkin.points_awarded,
        "districtPoints": checkin.district_points_delta,
        "partySize": checkin.party_size_snapshot,
        "partyMultiplier": float(checkin.party_multiplier_snapshot),
        "partyContribution": checkin.is_party_contribution,
    }
    if precision:
        entry["precision"] = precision
    if checkin.party_code:
        entry["partyCode"] = checkin.party_code
    player.checkin_history = [entry] + history[: MAX_HISTORY_ENTRIES - 1]


def _update_ratios(player: Player) -> None:
    if not player.checkins:
        player.attack_ratio = Decimal("0")
        player.defend_ratio = Decimal("0")
        return
    attack_ratio = Decimal(player.attack_points) / Decimal(player.checkins)
    defend_ratio = Decimal(player.defend_points) / Decimal(player.checkins)
    player.attack_ratio = attack_ratio.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    player.defend_ratio = defend_ratio.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def start_charge(player: Player) -> Player:
    with transaction.atomic():
        locked = Player.objects.select_for_update().get(pk=player.pk)
        now_ms = _now_ms()
        if _is_on_cooldown(locked, COOLDOWN_KEYS["charge"], now_ms):
            raise CooldownActive("Charge cooldown is still active.")
        locked.next_checkin_multiplier = CHARGE_ATTACK_MULTIPLIER
        _update_cooldown(locked, COOLDOWN_KEYS["charge"], COOLDOWN_DURATIONS_MS["charge"], now_ms=now_ms)
        locked.save(
            update_fields=[
                "next_checkin_multiplier",
                "cooldowns",
                "cooldown_details",
                "updated_at",
            ]
        )
        return locked


def _record_attack_engagement(
    *,
    home_code: Optional[str],
    home_name: Optional[str],
    target_code: Optional[str],
    target_name: Optional[str],
    points_awarded: int,
    party_code: Optional[str],
    occurred_at,
) -> None:
    if not home_code or not target_code or points_awarded <= 0:
        return
    home = str(home_code).strip()
    target = str(target_code).strip()
    if not home or not target:
        return
    metadata: Dict[str, Any]
    engagement = (
        DistrictEngagement.objects.select_for_update()
        .filter(home_district_code=home, target_district_code=target)
        .first()
    )
    is_new = False
    if engagement is None:
        engagement = DistrictEngagement(
            home_district_code=home,
            target_district_code=target,
        )
        metadata = {}
        is_new = True
    else:
        metadata = _ensure_dict(engagement.metadata)
    engagement.home_district_name = home_name or engagement.home_district_name
    engagement.target_district_name = target_name or engagement.target_district_name
    engagement.attack_points_total += max(points_awarded, 0)
    engagement.attack_checkins += 1
    if party_code:
        engagement.party_attack_checkins += 1
        metadata["last_party_code"] = party_code
    engagement.metadata = metadata
    engagement.last_attack_at = occurred_at
    if is_new:
        engagement.save()
    else:
        engagement.save(
            update_fields=[
                "home_district_name",
                "target_district_name",
                "attack_points_total",
                "attack_checkins",
                "party_attack_checkins",
                "metadata",
                "last_attack_at",
                "updated_at",
            ]
        )


def _record_contribution_stats(
    *,
    district_code: Optional[str],
    supporter: Player,
    contribution_points: int,
    when,
) -> None:
    district = _normalise_district_code(district_code)
    if not district or contribution_points <= 0:
        return
    stat = (
        DistrictContributionStat.objects.select_for_update()
        .filter(district_code=district, supporter=supporter)
        .first()
    )
    if stat is None:
        stat = DistrictContributionStat(district_code=district, supporter=supporter)
    stat.contribution_points += contribution_points
    stat.contribution_checkins += 1
    stat.last_contribution_at = when
    if stat.pk:
        stat.save(
            update_fields=[
                "contribution_points",
                "contribution_checkins",
                "last_contribution_at",
                "updated_at",
            ]
        )
    else:
        stat.save()


def _update_party_bonds(
    actor: Player,
    other_members: List[Player],
    attack_points: int,
    contribution_points: int,
    when,
) -> None:
    if not other_members:
        return
    attack_points = max(0, attack_points)
    contribution_points = max(0, contribution_points)
    for partner in other_members:
        for primary, secondary in ((actor, partner), (partner, actor)):
            bond = (
                PlayerPartyBond.objects.select_for_update()
                .filter(player=primary, partner=secondary)
                .first()
            )
            if bond is None:
                bond = PlayerPartyBond(player=primary, partner=secondary)
            bond.shared_checkins += 1
            bond.shared_attack_points += attack_points
            bond.shared_contribution_points += contribution_points
            bond.last_shared_at = when
            if bond.pk:
                bond.save(
                    update_fields=[
                        "shared_checkins",
                        "shared_attack_points",
                        "shared_contribution_points",
                        "last_shared_at",
                        "updated_at",
                    ]
                )
            else:
                bond.save()


def apply_checkin(
    player: Player,
    *,
    district_code: Optional[str],
    district_name: Optional[str],
    mode: str,
    precision: Optional[str] = None,
    coordinates: Optional[Dict[str, float]] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> CheckInResult:
    with transaction.atomic():
        locked = Player.objects.select_for_update().get(pk=player.pk)
        code = _normalise_district_code(district_code)
        name = _normalise_district_name(district_name)
        if not code:
            raise ValueError("District code is required.")

        now = timezone.now()
        now_ms = _now_ms()

        home_code = _normalise_district_code(locked.home_district_code)
        action = CheckIn.Action.DEFEND if home_code and code == home_code else CheckIn.Action.ATTACK

        if mode not in {CheckIn.Mode.LOCAL, CheckIn.Mode.REMOTE, CheckIn.Mode.RANGED}:
            raise ValueError("Unsupported mode.")
        if mode == CheckIn.Mode.REMOTE and action != CheckIn.Action.DEFEND:
            raise ValueError("Remote mode is only valid for defending your home district.")
        if mode == CheckIn.Mode.RANGED and action != CheckIn.Action.ATTACK:
            raise ValueError("Ranged mode is only available when attacking other districts.")

        if _is_on_cooldown(locked, COOLDOWN_KEYS["charge"], now_ms):
            locked.next_checkin_multiplier = max(locked.next_checkin_multiplier, 1)

        party_context = _resolve_party_context(locked, code)
        party = party_context["party"]
        party_members: List[Player] = party_context["members"]
        party_size = party_context["size"] if party else 0
        party_code_value = party_context["code"] if party else ""
        has_home_member = party_context["has_home_member"]
        home_members: List[Player] = party_context.get("home_members", [])

        if party and has_home_member:
            action = CheckIn.Action.DEFEND

        if action == CheckIn.Action.ATTACK and _is_on_cooldown(locked, COOLDOWN_KEYS["attack"], now_ms):
            raise CooldownActive("Attack cooldown is still active.")
        if action == CheckIn.Action.DEFEND and _is_on_cooldown(locked, COOLDOWN_KEYS["defend"], now_ms):
            raise CooldownActive("Defend cooldown is still active.")

        charge_multiplier = Decimal(max(1, locked.next_checkin_multiplier or 1))

        party_multiplier_player = Decimal("1")
        party_multiplier_district = Decimal("1")
        is_party_contribution = False
        if party and party_size > 0:
            size_decimal = Decimal(party_size)
            if has_home_member:
                party_multiplier_district = PARTY_CONTRIBUTION_DISTRICT_PER_PLAYER * size_decimal
                party_multiplier_player = party_multiplier_district * PARTY_CONTRIBUTION_PLAYER_MULTIPLIER
                is_party_contribution = True
                action = CheckIn.Action.DEFEND
            else:
                party_multiplier_district = PARTY_ATTACK_BONUS_PER_PLAYER * size_decimal
                party_multiplier_player = party_multiplier_district

        local_bonus = Decimal(1)
        if mode == CheckIn.Mode.LOCAL and precision == "precise":
            if action == CheckIn.Action.ATTACK or is_party_contribution:
                local_bonus = Decimal(2)

        effective_multiplier = charge_multiplier * local_bonus
        base_points_decimal = Decimal(POINTS_PER_CHECKIN)
        total_player_multiplier = effective_multiplier * party_multiplier_player
        total_district_multiplier = effective_multiplier * party_multiplier_district

        player_points_decimal = base_points_decimal * total_player_multiplier
        district_points_decimal = base_points_decimal * total_district_multiplier

        points_awarded = int(player_points_decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        district_points_delta = int(district_points_decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        if action == CheckIn.Action.ATTACK:
            district_points_delta = -abs(district_points_delta)
        else:
            district_points_delta = abs(district_points_delta)
        if points_awarded <= 0:
            points_awarded = 1

        payload_meta = metadata.copy() if isinstance(metadata, dict) else {}
        payload_meta["precision"] = precision
        if coordinates and {"lng", "lat"} <= set(coordinates.keys()):
            try:
                lng = float(coordinates["lng"])
                lat = float(coordinates["lat"])
                payload_meta["coordinates"] = {"lng": lng, "lat": lat}
            except (TypeError, ValueError):
                pass

        if party:
            payload_meta.setdefault("party", {})["size"] = party_size
            payload_meta.setdefault("party", {})["code"] = party_code_value
            payload_meta["party"]["contribution"] = is_party_contribution

        party_value = party_code_value
        home_snapshot_code = home_code or ""
        home_snapshot_name = locked.home_district_name or locked.home_district or ""
        base_points_value = POINTS_PER_CHECKIN
        total_player_multiplier = total_player_multiplier.quantize(Decimal("0.01"))
        party_multiplier_snapshot = party_multiplier_player.quantize(Decimal("0.01"))

        checkin = CheckIn.objects.create(
            player=locked,
            occurred_at=now,
            district_code=code or "",
            district_name=name or "",
            action=action,
            mode=mode,
            multiplier=total_player_multiplier,
            base_points=base_points_value,
            points_awarded=points_awarded,
            district_points_delta=district_points_delta,
            party_size_snapshot=party_size if party else 1,
            party_multiplier_snapshot=party_multiplier_snapshot,
            home_district_code_snapshot=home_snapshot_code,
            home_district_name_snapshot=home_snapshot_name,
            party_code=party_value,
            is_party_contribution=is_party_contribution,
            metadata=payload_meta,
        )

        locked.score += points_awarded
        locked.checkins += 1
        if action == CheckIn.Action.ATTACK:
            locked.attack_points += points_awarded
        else:
            locked.defend_points += points_awarded

        locked.next_checkin_multiplier = 1

        cooldown_key = COOLDOWN_KEYS["defend"] if action == CheckIn.Action.DEFEND else COOLDOWN_KEYS["attack"]
        if action == CheckIn.Action.DEFEND and mode == CheckIn.Mode.REMOTE:
            duration = COOLDOWN_DURATIONS_MS["defend_remote"]
        elif action == CheckIn.Action.DEFEND:
            duration = COOLDOWN_DURATIONS_MS["defend_local"]
        else:
            duration = COOLDOWN_DURATIONS_MS["attack"]
        _update_cooldown(locked, cooldown_key, duration, mode=mode, now_ms=now_ms)

        if coordinates and {"lng", "lat"} <= set(coordinates.keys()):
            try:
                lng = float(coordinates["lng"])
                lat = float(coordinates["lat"])
                locked.last_known_location = {
                    "lng": lng,
                    "lat": lat,
                    "districtId": code,
                    "districtName": name,
                    "timestamp": now_ms,
                    "source": payload_meta.get("source") or ("geolocated" if precision == "precise" else "profile"),
                }
            except (TypeError, ValueError):
                pass
        elif action == CheckIn.Action.DEFEND and mode == CheckIn.Mode.REMOTE:
            locked.last_known_location = locked.last_known_location or {
                "districtId": code,
                "districtName": name,
                "timestamp": now_ms,
                "source": "home-remote",
            }

        _append_history_entry(
            locked,
            checkin=checkin,
            mode=mode,
            precision=precision,
            multiplier=total_player_multiplier,
            now_ms=now_ms,
        )
        _update_ratios(locked)

        if is_party_contribution and party:
            other_home_members = [member for member in home_members if member.id != locked.id]
            if other_home_members:
                _record_contribution_stats(
                    district_code=code,
                    supporter=locked,
                    contribution_points=district_points_delta,
                    when=now,
                )

        if party and party_size > 1:
            other_party_members = [member for member in party_members if member.id != locked.id]
            _update_party_bonds(
                locked,
                other_party_members,
                attack_points=abs(district_points_delta) if action == CheckIn.Action.ATTACK else 0,
                contribution_points=district_points_delta if is_party_contribution else 0,
                when=now,
            )

        if action == CheckIn.Action.ATTACK:
            _record_attack_engagement(
                home_code=home_snapshot_code,
                home_name=home_snapshot_name,
                target_code=code,
                target_name=name,
                points_awarded=abs(district_points_delta),
                party_code=party_value or None,
                occurred_at=now,
            )

        locked.save(
            update_fields=[
                "score",
                "checkins",
                "attack_points",
                "defend_points",
                "attack_ratio",
                "defend_ratio",
                "next_checkin_multiplier",
                "cooldowns",
                "cooldown_details",
                "checkin_history",
                "last_known_location",
                "updated_at",
            ]
        )

        return CheckInResult(player=locked, checkin=checkin, points_awarded=points_awarded)
