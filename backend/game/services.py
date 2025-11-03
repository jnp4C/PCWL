import re
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import (
    CheckIn,
    District,
    DistrictContributionStat,
    DistrictEngagement,
    Party,
    PartyInvitation,
    PartyMembership,
    Player,
    PlayerDistrictContribution,
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
PARTY_NAME_MIN_LENGTH = 3
PARTY_NAME_MAX_LENGTH = 48


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


def _normalise_party_name(value: Optional[str]) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    if len(text) < PARTY_NAME_MIN_LENGTH:
        raise PartyError(f"Party name must be at least {PARTY_NAME_MIN_LENGTH} characters.")
    if len(text) > PARTY_NAME_MAX_LENGTH:
        raise PartyError(f"Party name must be at most {PARTY_NAME_MAX_LENGTH} characters.")
    return text


def _get_or_create_district_record(code: Optional[str], name: Optional[str]) -> Optional[District]:
    """Ensure a District row exists for the given identifiers."""
    normalised_code = _normalise_district_code(code)
    if not normalised_code:
        return None
    desired_name = _normalise_district_name(name) or f"District {normalised_code}"
    district, created = District.objects.get_or_create(
        code=normalised_code,
        defaults={
            "name": desired_name,
            "is_active": True,
        },
    )
    updates = {}
    if desired_name and district.name != desired_name:
        updates["name"] = desired_name
    if not district.is_active:
        updates["is_active"] = True
    if updates:
        for field, value in updates.items():
            setattr(district, field, value)
        district.save(update_fields=[*updates.keys(), "updated_at"])
    return district


def _apply_district_activity(
    code: Optional[str],
    name: Optional[str],
    points_delta: int,
    *,
    occurred_at: Optional[timezone.datetime] = None,
) -> None:
    """Persist aggregate district strength counters from a new check-in event."""
    if points_delta is None:
        return
    district = _get_or_create_district_record(code, name)
    if district is None:
        return
    when = occurred_at or timezone.now()
    defended_delta = max(points_delta, 0)
    attacked_delta = abs(points_delta) if points_delta < 0 else 0
    District.objects.filter(pk=district.pk).update(
        current_strength=F("current_strength") + points_delta,
        defended_points_total=F("defended_points_total") + defended_delta,
        attacked_points_total=F("attacked_points_total") + attacked_delta,
        checkin_total=F("checkin_total") + 1,
        last_activity_at=when,
        updated_at=when,
    )


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


def create_party(
    leader: Player,
    *,
    name: Optional[str] = None,
    duration: timedelta = DEFAULT_PARTY_DURATION,
) -> Party:
    """Start a new party for the leader."""
    now = timezone.now()
    expires_at = now + duration
    normalised_name = ""
    if name is not None:
        normalised_name = _normalise_party_name(name)
    with transaction.atomic():
        _ensure_no_active_party(leader)
        party = Party.objects.create(
            leader=leader,
            expires_at=expires_at,
            name=normalised_name,
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


def set_party_name(player: Player, name: Optional[str]) -> Party:
    """Allow the active party leader to set or update the party name."""
    with transaction.atomic():
        membership = _get_active_party_membership(player, lock=True)
        if not membership or not membership.is_leader:
            raise PartyError("Only the party leader can name the party.")
        party = membership.party
        if not party.is_active():
            raise PartyError("Party is no longer active.")
        normalised_name = _normalise_party_name(name)
        if not normalised_name:
            raise PartyError("Party name cannot be empty.")
        if party.name == normalised_name:
            return party
        party.name = normalised_name
        party.save(update_fields=["name", "updated_at"])
        return party


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


def _member_inferred_district(member: Player, party_code: Optional[str] = None) -> Optional[str]:
    """Infer a member's current district code.

    Priority:
    1) member.last_known_location["districtId"]
    2) Latest CheckIn with this party_code (if provided)
    3) Latest CheckIn overall
    """
    try:
        lk = member.last_known_location or {}
        code = lk.get("districtId") if isinstance(lk, dict) else None
        code = _normalise_district_code(code)
        if code:
            return code
    except Exception:
        pass

    qs = CheckIn.objects.filter(player=member).order_by("-occurred_at")
    if party_code:
        with_party = qs.filter(party_code=party_code).first()
        if with_party and with_party.district_code:
            return _normalise_district_code(with_party.district_code)
    any_ci = qs.first()
    if any_ci and any_ci.district_code:
        return _normalise_district_code(any_ci.district_code)
    return None


def _determine_party_active_district(party: Party, members: Optional[List[Player]] = None) -> Dict[str, Any]:
    """Compute the party's active district based on majority presence.

    Returns a dict: {"code": str|None, "name": str|None, "count": int}
    Active if count >= 2. Name is a best-effort from members' last_known_location.
    """
    if party is None:
        return {"code": None, "name": None, "count": 0}

    if members is None:
        active_memberships = (
            PartyMembership.objects.select_related("player")
            .filter(party=party, left_at__isnull=True)
            .order_by("joined_at")
        )
        members = [m.player for m in active_memberships]

    counts: Dict[str, int] = {}
    names: Dict[str, str] = {}
    recency: Dict[str, Any] = {}

    for m in members or []:
        code = _member_inferred_district(m, party.code)
        if not code:
            continue
        counts[code] = counts.get(code, 0) + 1
        # prefer last_known_location name if matches
        lk = m.last_known_location or {}
        if isinstance(lk, dict) and _normalise_district_code(lk.get("districtId")) == code:
            name = _normalise_district_name(lk.get("districtName"))
            if name:
                names[code] = names.get(code) or name
            ts = lk.get("timestamp")
            if ts is not None:
                try:
                    recency[code] = max(int(ts), recency.get(code, 0))
                except (TypeError, ValueError):
                    pass

    if not counts:
        return {"code": None, "name": None, "count": 0}

    # pick max count; if tie, pick most recent timestamp
    best_code = None
    best_count = -1
    for code, cnt in counts.items():
        if cnt > best_count:
            best_code = code
            best_count = cnt
        elif cnt == best_count:
            prev_ts = recency.get(best_code, 0)
            cur_ts = recency.get(code, 0)
            if cur_ts > prev_ts:
                best_code = code
                best_count = cnt

    if best_count < 2:
        return {"code": None, "name": None, "count": best_count}

    name = names.get(best_code) or ""
    return {"code": best_code, "name": name, "count": best_count}


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


def _update_player_district_contribution(
    player: Player,
    *,
    district_code: Optional[str],
    district_name: Optional[str],
    action: str,
    points_delta: int,
    home_snapshot_code: Optional[str],
    home_snapshot_name: Optional[str],
    occurred_at: timezone.datetime,
) -> None:
    """Persist per-district contribution totals for the player."""
    if action == CheckIn.Action.DEFEND:
        code = _normalise_district_code(home_snapshot_code) or _normalise_district_code(district_code)
        name = _normalise_district_name(home_snapshot_name) or _normalise_district_name(district_name)
    else:
        code = _normalise_district_code(district_code)
        name = _normalise_district_name(district_name)
    district = _get_or_create_district_record(code, name)
    if district is None:
        return

    contribution, _ = PlayerDistrictContribution.objects.get_or_create(
        player=player,
        district=district,
        defaults={"last_activity_at": occurred_at},
    )
    updated_fields: List[str] = []
    if action == CheckIn.Action.DEFEND:
        points = max(points_delta, 0)
        if points:
            contribution.defend_points_total += points
            updated_fields.append("defend_points_total")
        contribution.defend_checkins += 1
        updated_fields.append("defend_checkins")
    else:
        points = abs(points_delta)
        if points:
            contribution.attack_points_total += points
            updated_fields.append("attack_points_total")
        contribution.attack_checkins += 1
        updated_fields.append("attack_checkins")
    contribution.last_activity_at = occurred_at
    updated_fields.append("last_activity_at")
    contribution.save(update_fields=[*updated_fields, "updated_at"])


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
        _get_or_create_district_record(code, name)

        now = timezone.now()
        now_ms = _now_ms()

        home_code = _normalise_district_code(locked.home_district_code)
        home_ref_changed = False
        home_district_obj = None
        if home_code:
            existing_home_ref_id = getattr(locked.home_district_ref, "id", None)
            home_district_obj = _get_or_create_district_record(
                home_code,
                locked.home_district_name or locked.home_district,
            )
            if home_district_obj and existing_home_ref_id != home_district_obj.id:
                locked.home_district_ref = home_district_obj
                home_ref_changed = True
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
        party_code_value = party_context["code"] if party else ""
        # Determine active district by majority presence (>=2) among members
        active_info = _determine_party_active_district(party, party_members) if party else {"code": None, "name": None, "count": 0}
        active_code = active_info.get("code")
        active_count = int(active_info.get("count") or 0)
        initiator_in_active = bool(active_code and code and active_code.lower() == code.lower())

        # For home-member contribution logic, consider only members in the active district
        def _members_in_active(members: List[Player]) -> List[Player]:
            result: List[Player] = []
            if not members or not active_code:
                return result
            for m in members:
                m_code = _member_inferred_district(m, party_code_value)
                if m_code and m_code.lower() == active_code.lower():
                    result.append(m)
            return result

        members_in_active: List[Player] = _members_in_active(party_members) if party else []
        party_size = len(members_in_active) if (party and initiator_in_active) else 0
        # Compute has_home_member within the active district only
        has_home_member = False
        home_members: List[Player] = []
        if party and initiator_in_active and active_code:
            for m in members_in_active:
                m_home = _normalise_district_code(m.home_district_code)
                if m_home and m_home.lower() == active_code.lower():
                    has_home_member = True
                    home_members.append(m)

        if party and initiator_in_active and has_home_member:
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

        district_points_delta = int(district_points_decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        if action == CheckIn.Action.ATTACK:
            district_points_delta = -abs(district_points_delta)
        else:
            district_points_delta = abs(district_points_delta)

        total_district_delta = district_points_delta
        total_damage_abs = abs(total_district_delta)
        participant_count = 1
        share_points: List[int] = [total_damage_abs]
        if party and initiator_in_active and party_size > 1:
            participant_count = party_size
            base_share, remainder = divmod(total_damage_abs, participant_count)
            share_points = [base_share] * participant_count
            for index in range(remainder):
                share_points[index] += 1
        else:
            share_points = [total_damage_abs]
        signed_share_points = (
            [-value for value in share_points] if total_district_delta < 0 else list(share_points)
        )

        points_awarded = share_points[0] if share_points else total_damage_abs
        district_points_delta = signed_share_points[0] if signed_share_points else total_district_delta
        if points_awarded <= 0 and total_damage_abs > 0:
            points_awarded = 1

        if base_points_decimal > 0:
            total_player_multiplier = (
                Decimal(points_awarded) / base_points_decimal
            ).quantize(Decimal("0.01"))
            total_district_multiplier = (
                Decimal(abs(district_points_delta)) / base_points_decimal
            ).quantize(Decimal("0.01"))
        else:
            total_player_multiplier = Decimal("0")
            total_district_multiplier = Decimal("0")

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
            payload_meta.setdefault("party", {})["size"] = participant_count
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
            party_size_snapshot=participant_count,
            party_multiplier_snapshot=party_multiplier_snapshot,
            home_district_code_snapshot=home_snapshot_code,
            home_district_name_snapshot=home_snapshot_name,
            party_code=party_value,
            is_party_contribution=is_party_contribution,
            metadata=payload_meta,
        )

        _apply_district_activity(code, name, district_points_delta, occurred_at=now)

        _update_player_district_contribution(
            locked,
            district_code=code,
            district_name=name,
            action=action,
            points_delta=district_points_delta,
            home_snapshot_code=home_snapshot_code,
            home_snapshot_name=home_snapshot_name,
            occurred_at=now,
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
                points_awarded=total_damage_abs,
                party_code=party_value or None,
                occurred_at=now,
            )

        player_update_fields = [
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
        if home_ref_changed:
            player_update_fields.append("home_district_ref")
        locked.save(update_fields=player_update_fields)

        # Party synchronized check-ins: propagate only within the party's active district (majority)
        if party and initiator_in_active and active_count >= 2 and party_size > 1:
            # Determine the action taken by the initiator to mirror for others
            initiator_action = action
            # Determine cooldown duration based on action/mode used by initiator
            if initiator_action == CheckIn.Action.DEFEND and mode == CheckIn.Mode.REMOTE:
                others_duration = COOLDOWN_DURATIONS_MS["defend_remote"]
            elif initiator_action == CheckIn.Action.DEFEND:
                others_duration = COOLDOWN_DURATIONS_MS["defend_local"]
            else:
                others_duration = COOLDOWN_DURATIONS_MS["attack"]

            # Eligible members: those in the computed active district (excluding initiator)
            same_district_members: List[Player] = []
            for member in members_in_active:
                if member.id == locked.id:
                    continue
                same_district_members.append(member)

            if same_district_members:
                # Precompute shared values for all others
                others_base_points = base_points_value
                party_mult_player_dec = party_multiplier_player
                others_is_contribution = bool(is_party_contribution)
                party_code_for_others = party_value
                home_code_snapshot = home_snapshot_code
                home_name_snapshot = home_snapshot_name
                participant_shares = share_points[1:]
                participant_signed_shares = signed_share_points[1:]

                for member_index, member in enumerate(same_district_members):
                    # Lock each member row for update to avoid races
                    m_locked = Player.objects.select_for_update().get(pk=member.pk)
                    m_now_ms = now_ms
                    share_value = participant_shares[member_index] if member_index < len(participant_shares) else 0
                    share_signed = participant_signed_shares[member_index] if member_index < len(participant_signed_shares) else 0
                    if share_value <= 0:
                        share_value = 0
                    if others_base_points > 0:
                        m_total_player_multiplier = (
                            Decimal(share_value) / Decimal(others_base_points)
                        ).quantize(Decimal("0.01")) if share_value else Decimal("0")
                    else:
                        m_total_player_multiplier = Decimal("0")
                    m_player_points = share_value
                    m_district_points = share_signed

                    # Create CheckIn for the member
                    m_checkin = CheckIn.objects.create(
                        player=m_locked,
                        occurred_at=now,
                        district_code=code or "",
                        district_name=name or "",
                        action=initiator_action,
                        mode=mode,  # keep model mode consistent; UI uses cooldown_details.mode='party' for labeling
                        multiplier=m_total_player_multiplier,
                        base_points=others_base_points,
                        points_awarded=m_player_points,
                        district_points_delta=m_district_points,
                        party_size_snapshot=participant_count,
                        party_multiplier_snapshot=party_mult_player_dec.quantize(Decimal("0.01")),
                        home_district_code_snapshot=home_code_snapshot,
                        home_district_name_snapshot=home_name_snapshot,
                        party_code=party_code_for_others,
                        is_party_contribution=others_is_contribution,
                        metadata={
                            "source": "party",
                            "triggeredBy": locked.username,
                            "synchronized": True,
                        },
                    )

                    _apply_district_activity(code, name, m_district_points, occurred_at=now)

                    # Update member stats and cooldown; do NOT consume their charge
                    m_locked.score += m_player_points
                    m_locked.checkins += 1
                    if initiator_action == CheckIn.Action.ATTACK:
                        m_locked.attack_points += m_player_points
                    else:
                        m_locked.defend_points += m_player_points

                    # Set/refresh the appropriate cooldown with mode 'party'
                    m_cooldown_key = COOLDOWN_KEYS["defend"] if initiator_action == CheckIn.Action.DEFEND else COOLDOWN_KEYS["attack"]
                    _update_cooldown(m_locked, m_cooldown_key, others_duration, mode="party", now_ms=m_now_ms)

                    # Append a history entry for the member
                    _append_history_entry(
                        m_locked,
                        checkin=m_checkin,
                        mode="party",
                        precision=None,
                        multiplier=m_total_player_multiplier,
                        now_ms=m_now_ms,
                    )
                    _update_ratios(m_locked)

                    if initiator_action == CheckIn.Action.DEFEND and m_player_points > 0:
                        _update_player_district_contribution(
                            m_locked,
                            district_code=code,
                            district_name=name,
                            action=initiator_action,
                            points_delta=m_district_points,
                            home_snapshot_code=home_code_snapshot,
                            home_snapshot_name=home_name_snapshot,
                            occurred_at=now,
                        )

                    # Persist member updates
                    m_locked.save(
                        update_fields=[
                            "score",
                            "checkins",
                            "attack_points",
                            "defend_points",
                            "attack_ratio",
                            "defend_ratio",
                            "cooldowns",
                            "cooldown_details",
                            "checkin_history",
                            "updated_at",
                        ]
                    )

        return CheckInResult(player=locked, checkin=checkin, points_awarded=points_awarded)
