from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, Optional, Tuple

from django.db import transaction
from django.utils import timezone

from .models import CheckIn, Player

POINTS_PER_CHECKIN = 10
CHARGE_ATTACK_MULTIPLIER = 3
MAX_HISTORY_ENTRIES = 50

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


@dataclass
class CheckInResult:
    player: Player
    checkin: CheckIn
    points_awarded: int


class CooldownActive(Exception):
    """Raised when a requested action is still on cooldown."""


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
    }
    if precision:
        entry["precision"] = precision
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

        if action == CheckIn.Action.ATTACK and _is_on_cooldown(locked, COOLDOWN_KEYS["attack"], now_ms):
            raise CooldownActive("Attack cooldown is still active.")
        if action == CheckIn.Action.DEFEND and _is_on_cooldown(locked, COOLDOWN_KEYS["defend"], now_ms):
            raise CooldownActive("Defend cooldown is still active.")

        charge_multiplier = max(1, locked.next_checkin_multiplier or 1)
        local_bonus = 1
        if action == CheckIn.Action.ATTACK and mode == CheckIn.Mode.LOCAL and precision == "precise":
            local_bonus = 2
        effective_multiplier = Decimal(charge_multiplier * local_bonus)

        points_awarded = int(POINTS_PER_CHECKIN * effective_multiplier)
        base_points = POINTS_PER_CHECKIN

        payload_meta = metadata.copy() if isinstance(metadata, dict) else {}
        payload_meta["precision"] = precision
        if coordinates and {"lng", "lat"} <= set(coordinates.keys()):
            try:
                lng = float(coordinates["lng"])
                lat = float(coordinates["lat"])
                payload_meta["coordinates"] = {"lng": lng, "lat": lat}
            except (TypeError, ValueError):
                pass

        checkin = CheckIn.objects.create(
            player=locked,
            occurred_at=now,
            district_code=code or "",
            district_name=name or "",
            action=action,
            mode=mode,
            multiplier=effective_multiplier,
            base_points=base_points,
            points_awarded=points_awarded,
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
            multiplier=effective_multiplier,
            now_ms=now_ms,
        )
        _update_ratios(locked)

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
