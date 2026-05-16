import math
import re
from urllib.parse import urlparse
from typing import Any, Dict, List, Optional, Set, Tuple

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.utils import timezone
from rest_framework import serializers

from .models import CheckIn, District, FriendLink, FriendRequest, Player
from .services import (
    _normalise_district_code,
    _refresh_streak_state,
    _streak_effective_days,
    _streak_multiplier,
    get_active_party,
)


DEFAULT_MAP_MARKER_COLOR = "#6366f1"
HEX_COLOR_PATTERN = re.compile(r"^#(?:[0-9a-fA-F]{6})$")


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ["code", "name", "is_active"]


class PlayerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    checkin_history = serializers.JSONField(read_only=True)
    cooldowns = serializers.JSONField(read_only=True)
    cooldown_details = serializers.JSONField(read_only=True)

    MAX_CHECKIN_HISTORY = 50
    VALID_COOLDOWN_TYPES: Set[str] = {"attack", "defend", "charge"}
    VALID_COOLDOWN_MODES: Set[str] = {"local", "remote", "ranged"}

    class Meta:
        model = Player
        fields = [
            "id",
            "username",
            "display_name",
            "profile_image_url",
            "profile_bio",
            "district_ip_address",
            "map_marker_color",
            "score",
            "checkins",
            "home_district",
            "home_district_code",
            "home_district_name",
            "last_known_location",
            "attack_ratio",
            "defend_ratio",
            "attack_points",
            "defend_points",
            "is_active",
            "checkin_history",
            "cooldowns",
            "cooldown_details",
            "created_at",
            "updated_at",
            "email",
            "password",
            "next_checkin_multiplier",
            "preferred_party_name",
            "streak_days",
            "streak_last_day",
            "streak_progress_date",
            "streak_day_attack_done",
            "streak_day_defend_done",
            "streak_multiplier",
        ]
        extra_kwargs = {
            "last_known_location": {"required": False, "allow_null": True},
            "email": {"write_only": True, "required": False},
            "password": {"write_only": True},
            "home_district_code": {"required": False, "allow_blank": True},
            "home_district_name": {"required": False, "allow_blank": True},
            "home_district": {"read_only": True},
            "attack_points": {"read_only": True},
            "defend_points": {"read_only": True},
            "checkin_history": {"read_only": True},
            "cooldowns": {"read_only": True},
            "cooldown_details": {"read_only": True},
            "profile_image_url": {"required": False, "allow_blank": True},
            "map_marker_color": {"required": False, "allow_blank": True},
            "profile_bio": {"required": False, "allow_blank": True},
            "district_ip_address": {"read_only": True},
            "score": {"read_only": True},
            "checkins": {"read_only": True},
            "attack_ratio": {"read_only": True},
            "defend_ratio": {"read_only": True},
            "next_checkin_multiplier": {"read_only": True},
            "preferred_party_name": {"read_only": True},
            "streak_days": {"read_only": True},
            "streak_last_day": {"read_only": True},
            "streak_progress_date": {"read_only": True},
            "streak_day_attack_done": {"read_only": True},
            "streak_day_defend_done": {"read_only": True},
            "streak_multiplier": {"read_only": True},
        }
    streak_multiplier = serializers.SerializerMethodField()

    def get_streak_multiplier(self, obj: Player):
        today = timezone.localdate()
        days = _streak_effective_days(obj, today)
        return float(_streak_multiplier(days))

    def create(self, validated_data):
        email = validated_data.pop("email", "")
        password = validated_data.pop("password", None)
        validated_data, resolved_district = self._apply_district_defaults(validated_data)
        player = super().create(validated_data)
        player.ensure_auth_user(password=password, email=email, is_active=False)
        if resolved_district:
            player.assign_home_district(resolved_district, save=True)
        elif player.home_district_name:
            player.home_district = player.home_district_name
            player.save(update_fields=["home_district", "updated_at"])
        return player

    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        password = validated_data.pop("password", None)
        validated_data, resolved_district = self._apply_district_defaults(validated_data)
        player = super().update(instance, validated_data)
        if password or email is not None:
            player.ensure_auth_user(password=password, email=email)
        if resolved_district:
            # assign_home_district saves the player
            player.assign_home_district(resolved_district, save=True)
        elif "home_district_name" in validated_data:
            player.home_district = player.home_district_name or ""
            player.save(update_fields=["home_district", "updated_at"])
        return player

    def validate_email(self, value: Any) -> str:
        email = str(value or "").strip().lower()
        if not email:
            raise serializers.ValidationError("Email is required.")
        try:
            validate_email(email)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
        UserModel = get_user_model()
        user_qs = UserModel.objects.filter(email__iexact=email)
        current_user_id = None
        if self.instance is not None and getattr(self.instance, "user_id", None):
            current_user_id = self.instance.user_id
        if current_user_id:
            user_qs = user_qs.exclude(pk=current_user_id)
        if user_qs.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_password(self, value: Any) -> str:
        password = str(value or "")
        if not password:
            raise serializers.ValidationError("Password is required.")
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return password

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if self.instance is not None and "email" in attrs:
            raise serializers.ValidationError({"email": ["Email changes are not supported yet."]})
        if self.instance is None and not attrs.get("email"):
            raise serializers.ValidationError({"email": ["Email is required."]})
        if self.instance is None and not attrs.get("password"):
            raise serializers.ValidationError({"password": ["Password is required."]})
        if self.instance is None and not attrs.get("home_district_code"):
            raise serializers.ValidationError({"home_district_code": ["Home district is required."]})
        return attrs

    def to_representation(self, instance):
        # Ensure home district fields are populated in responses even if legacy data was incomplete.
        self._ensure_home_district(instance)
        self._ensure_district_ip(instance)
        try:
            _refresh_streak_state(instance, save=True)
        except Exception:
            pass
        return super().to_representation(instance)

    def _ensure_home_district(self, instance: Player) -> None:
        """Attach/repair the home district FK so responses stay consistent."""
        if not instance:
            return
        if instance.home_district_ref:
            # Backfill any missing text fields from the FK.
            if not instance.home_district_code:
                instance.home_district_code = instance.home_district_ref.code
            if not instance.home_district_name:
                instance.home_district_name = instance.home_district_ref.name
            if not instance.home_district:
                instance.home_district = instance.home_district_ref.name
            return

        code = _normalise_district_code(instance.home_district_code)
        if not code:
            return
        name = (instance.home_district_name or instance.home_district or "").strip() or f"District {code}"
        district, _ = District.objects.get_or_create(
            code=code,
            defaults={"name": name, "is_active": True},
        )
        if district:
            instance.assign_home_district(district, save=True)

    def _ensure_district_ip(self, instance: Player) -> None:
        """Generate a district IP if missing for legacy players."""
        if not instance or instance.district_ip_address:
            return
        try:
            instance.district_ip_address = instance._generate_district_ip()
            instance.save(update_fields=["district_ip_address", "updated_at"])
        except Exception:
            pass

    def validate_home_district_code(self, value: Any) -> str:
        if value in (None, ""):
            return ""
        code = str(value).strip()
        normalized = _normalise_district_code(code)
        return normalized or ""

    def _apply_district_defaults(self, validated_data: Dict[str, Any]) -> Tuple[Dict[str, Any], Optional[District]]:
        data = dict(validated_data)
        code = data.get("home_district_code")
        name = data.get("home_district_name")
        resolved_district: Optional[District] = None
        if isinstance(code, str):
            code = _normalise_district_code(code) or ""
            data["home_district_code"] = code
        if isinstance(name, str):
            name = name.strip()
            data["home_district_name"] = name
        if code:
            district = District.objects.filter(code=code).first()
            if district is None:
                district = District.objects.create(
                    code=code,
                    name=name or f"District {code}",
                    is_active=True,
                )
            else:
                updates = {}
                if name and district.name != name:
                    updates["name"] = name
                if not district.is_active:
                    updates["is_active"] = True
                if updates:
                    for field, value in updates.items():
                        setattr(district, field, value)
                    district.save(update_fields=[*updates.keys(), "updated_at"])
            resolved_district = district
            if not name:
                data["home_district_name"] = district.name
        if data.get("home_district_name"):
            data.setdefault("home_district", data["home_district_name"])
        elif "home_district_name" in data:
            data["home_district"] = ""
        return data, resolved_district

    def validate_checkin_history(self, value: Any) -> List[Dict[str, Any]]:
        if value in (None, ""):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("Check-in history must be a list.")

        sanitized: List[Dict[str, Any]] = []
        for raw in value[: self.MAX_CHECKIN_HISTORY]:
            if not isinstance(raw, dict):
                continue
            timestamp = raw.get("timestamp")
            try:
                timestamp_int = int(timestamp)
            except (TypeError, ValueError):
                continue

            district_id_raw = raw.get("districtId")
            district_id = str(district_id_raw).strip() if district_id_raw is not None else None
            district_name_raw = raw.get("districtName")
            district_name = str(district_name_raw).strip() if district_name_raw else None
            checkin_type = str(raw.get("type", "")).strip().lower()
            if checkin_type not in {"attack", "defend"}:
                continue

            multiplier = raw.get("multiplier", 1)
            try:
                multiplier_value = float(multiplier)
            except (TypeError, ValueError):
                multiplier_value = 1.0

            entry: Dict[str, Any] = {
                "timestamp": timestamp_int,
                "districtId": district_id,
                "districtName": district_name,
                "type": checkin_type,
                "multiplier": multiplier_value,
                "ranged": bool(raw.get("ranged")),
                "melee": bool(raw.get("melee")),
            }
            triggered_by = raw.get("triggeredBy")
            if isinstance(triggered_by, str) and triggered_by.strip():
                entry["triggeredBy"] = triggered_by.strip()

            cooldown_type_raw = raw.get("cooldownType")
            if isinstance(cooldown_type_raw, str):
                normalized_type = cooldown_type_raw.strip().lower()
                if normalized_type in self.VALID_COOLDOWN_TYPES:
                    entry["cooldownType"] = normalized_type
            cooldown_mode_raw = raw.get("cooldownMode")
            if isinstance(cooldown_mode_raw, str):
                normalized_mode = cooldown_mode_raw.strip().lower()
                if normalized_mode in self.VALID_COOLDOWN_MODES:
                    entry["cooldownMode"] = normalized_mode

            sanitized.append(entry)

        return sanitized

    def validate_cooldowns(self, value: Any) -> Dict[str, int]:
        if value in (None, ""):
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Cooldowns must be an object.")
        sanitized: Dict[str, int] = {}
        for raw_key, raw_value in value.items():
            if raw_key is None:
                continue
            key = str(raw_key).strip().lower()
            if key not in self.VALID_COOLDOWN_TYPES:
                continue
            try:
                deadline = int(raw_value)
            except (TypeError, ValueError):
                continue
            if deadline > 0:
                sanitized[key] = deadline
        return sanitized

    def validate_cooldown_details(self, value: Any) -> Dict[str, Dict[str, Any]]:
        if value in (None, ""):
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("Cooldown details must be an object.")

        sanitized: Dict[str, Dict[str, Any]] = {}
        for raw_key, raw_detail in value.items():
            if raw_key is None:
                continue
            key = str(raw_key).strip().lower()
            if key not in self.VALID_COOLDOWN_TYPES:
                continue
            if not isinstance(raw_detail, dict):
                continue

            detail: Dict[str, Any] = {}
            mode_raw = raw_detail.get("mode")
            if isinstance(mode_raw, str):
                normalized_mode = mode_raw.strip().lower()
                if normalized_mode in self.VALID_COOLDOWN_MODES:
                    detail["mode"] = normalized_mode

            duration_raw = raw_detail.get("duration")
            try:
                duration = int(duration_raw)
            except (TypeError, ValueError):
                duration = None
            if duration is not None and duration > 0:
                detail["duration"] = duration

            started_at_raw = raw_detail.get("startedAt")
            try:
                started_at = int(started_at_raw)
            except (TypeError, ValueError):
                started_at = None
            if started_at is not None and started_at > 0:
                detail["startedAt"] = started_at

            if detail:
                sanitized[key] = detail

        return sanitized

    def validate_map_marker_color(self, value: Any) -> str:
        if value in (None, ""):
            return DEFAULT_MAP_MARKER_COLOR
        if not isinstance(value, str):
            raise serializers.ValidationError("Map marker color must be a string.")
        trimmed = value.strip()
        if not trimmed:
            return DEFAULT_MAP_MARKER_COLOR
        if not HEX_COLOR_PATTERN.match(trimmed):
            raise serializers.ValidationError("Map marker color must be a hex color like #ff0000.")
        return trimmed.lower()

    def validate_profile_image_url(self, value: Any) -> str:
        if value in (None, ""):
            return ""
        if not isinstance(value, str):
            raise serializers.ValidationError("Profile image must be a string.")
        trimmed = value.strip()
        if not trimmed:
            return ""
        if trimmed.startswith("data:image/"):
            lowered = trimmed.lower()
            if not (lowered.startswith("data:image/jpeg") or lowered.startswith("data:image/png")):
                raise serializers.ValidationError("Profile image data URL must be a PNG or JPG.")
            if ";base64," not in trimmed:
                raise serializers.ValidationError("Profile image data URL must be base64 encoded.")
            if len(trimmed) > 200000:
                raise serializers.ValidationError("Profile image data URL is too large.")
            return trimmed
        if trimmed.startswith("http://") or trimmed.startswith("https://"):
            parsed = urlparse(trimmed)
            path = (parsed.path or "").lower()
            if not (path.endswith(".jpg") or path.endswith(".jpeg") or path.endswith(".png")):
                raise serializers.ValidationError("Profile image URL must end with .jpg or .png.")
            return trimmed
        raise serializers.ValidationError("Profile image must be a http(s) URL or data:image URL.")

    def validate_last_known_location(self, value: Any) -> Optional[Dict[str, Any]]:
        if value in (None, ""):
            return None
        if not isinstance(value, dict):
            raise serializers.ValidationError("Last known location must be an object.")
        try:
            lng = float(value.get("lng"))
            lat = float(value.get("lat"))
        except (TypeError, ValueError):
            raise serializers.ValidationError("Last known location requires numeric lng and lat.")
        if not (math.isfinite(lng) and math.isfinite(lat)):
            raise serializers.ValidationError("Last known location coordinates must be finite.")
        if not (-180 <= lng <= 180 and -90 <= lat <= 90):
            raise serializers.ValidationError("Last known location coordinates are out of range.")

        payload: Dict[str, Any] = {"lng": lng, "lat": lat}
        district_id_raw = value.get("districtId")
        if district_id_raw not in (None, ""):
            payload["districtId"] = str(district_id_raw).strip()[:64]
        district_name_raw = value.get("districtName")
        if district_name_raw not in (None, ""):
            payload["districtName"] = str(district_name_raw).strip()[:120]
        timestamp_raw = value.get("timestamp")
        if timestamp_raw not in (None, ""):
            try:
                timestamp = int(timestamp_raw)
            except (TypeError, ValueError):
                timestamp = None
            if timestamp and timestamp > 0:
                payload["timestamp"] = timestamp
        source_raw = value.get("source")
        if isinstance(source_raw, str) and source_raw.strip():
            payload["source"] = source_raw.strip()[:32]
        return payload


class FriendLinkSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="friend.username", read_only=True)
    display_name = serializers.SerializerMethodField()
    home_district = serializers.CharField(source="friend.home_district", read_only=True)
    home_district_code = serializers.CharField(source="friend.home_district_code", read_only=True)
    home_district_name = serializers.CharField(source="friend.home_district_name", read_only=True)
    score = serializers.IntegerField(source="friend.score", read_only=True)
    attack_points = serializers.IntegerField(source="friend.attack_points", read_only=True)
    defend_points = serializers.IntegerField(source="friend.defend_points", read_only=True)
    attack_ratio = serializers.DecimalField(
        source="friend.attack_ratio", max_digits=5, decimal_places=2, read_only=True
    )
    defend_ratio = serializers.DecimalField(
        source="friend.defend_ratio", max_digits=5, decimal_places=2, read_only=True
    )
    streak_days = serializers.IntegerField(source="friend.streak_days", read_only=True)
    streak_multiplier = serializers.FloatField(source="friend.streak_multiplier", read_only=True)
    checkins = serializers.IntegerField(source="friend.checkins", read_only=True)
    profile_bio = serializers.CharField(source="friend.profile_bio", read_only=True)
    profile_image_url = serializers.CharField(source="friend.profile_image_url", read_only=True)
    checkin_counts = serializers.SerializerMethodField()
    recent_checkins = serializers.SerializerMethodField()
    last_known_location = serializers.SerializerMethodField()
    map_marker_color = serializers.SerializerMethodField()
    active_party = serializers.SerializerMethodField()
    top_other_party = serializers.SerializerMethodField()

    class Meta:
        model = FriendLink
        fields = [
            "id",
            "username",
            "display_name",
            "home_district",
            "home_district_code",
            "home_district_name",
            "score",
            "attack_points",
            "defend_points",
            "attack_ratio",
            "defend_ratio",
            "checkins",
            "profile_bio",
            "profile_image_url",
            "checkin_counts",
            "recent_checkins",
            "last_known_location",
            "map_marker_color",
            "active_party",
            "top_other_party",
            "streak_days",
            "streak_multiplier",
            "is_favorite",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "display_name",
            "home_district",
            "home_district_code",
            "home_district_name",
            "score",
            "attack_points",
            "defend_points",
            "attack_ratio",
            "defend_ratio",
            "checkins",
            "profile_bio",
            "profile_image_url",
            "checkin_counts",
            "recent_checkins",
            "last_known_location",
            "map_marker_color",
            "active_party",
            "top_other_party",
            "streak_days",
            "streak_multiplier",
            "created_at",
            "updated_at",
        ]

    def get_display_name(self, obj: FriendLink) -> str:
        friend = obj.friend
        if friend and friend.display_name:
            return friend.display_name
        return ""

    def get_checkin_counts(self, obj: FriendLink) -> Dict[str, int]:
        history = obj.friend.checkin_history or []
        if not isinstance(history, list):
            return {"attack": 0, "defend": 0}
        attack = 0
        defend = 0
        for raw in history:
            if not isinstance(raw, dict):
                continue
            checkin_type = str(raw.get("type", "")).strip().lower()
            if checkin_type == "attack":
                attack += 1
            elif checkin_type == "defend":
                defend += 1
        return {"attack": attack, "defend": defend}

    def get_recent_checkins(self, obj: FriendLink) -> List[Dict[str, Any]]:
        history = obj.friend.checkin_history or []
        if not isinstance(history, list):
            return []
        recent: List[Dict[str, Any]] = []
        for raw in history[: PlayerSerializer.MAX_CHECKIN_HISTORY]:
            if not isinstance(raw, dict):
                continue
            entry = {
                "timestamp": raw.get("timestamp"),
                "districtId": raw.get("districtId"),
                "districtName": raw.get("districtName"),
                "type": raw.get("type"),
                "multiplier": raw.get("multiplier"),
                "ranged": bool(raw.get("ranged")),
                "melee": bool(raw.get("melee")),
            }
            cooldown_type = raw.get("cooldownType")
            if isinstance(cooldown_type, str):
                entry["cooldownType"] = cooldown_type
            cooldown_mode = raw.get("cooldownMode")
            if isinstance(cooldown_mode, str):
                entry["cooldownMode"] = cooldown_mode
            recent.append(entry)
            if len(recent) >= 10:
                break
        return recent

    def get_last_known_location(self, obj: FriendLink) -> Optional[Dict[str, Any]]:
        data = getattr(obj.friend, "last_known_location", None)
        if not isinstance(data, dict):
            return None
        try:
            lng = float(data.get("lng"))
            lat = float(data.get("lat"))
        except (TypeError, ValueError):
            return None
        if not (math.isfinite(lng) and math.isfinite(lat)):
            return None

        district_id_raw = data.get("districtId")
        district_id = str(district_id_raw).strip() if district_id_raw else None
        district_name_raw = data.get("districtName")
        district_name = str(district_name_raw).strip() if district_name_raw else None

        timestamp_raw = data.get("timestamp")
        try:
            timestamp = int(timestamp_raw)
        except (TypeError, ValueError):
            timestamp = None

        payload: Dict[str, Any] = {
            "lng": lng,
            "lat": lat,
        }
        if district_id:
            payload["districtId"] = district_id
        if district_name:
            payload["districtName"] = district_name
        if timestamp:
            payload["timestamp"] = timestamp
        return payload

    def get_map_marker_color(self, obj: FriendLink) -> str:
        color_raw = getattr(obj.friend, "map_marker_color", "") or ""
        color = color_raw.strip() if isinstance(color_raw, str) else ""
        if not color:
            return DEFAULT_MAP_MARKER_COLOR
        if not HEX_COLOR_PATTERN.match(color):
            return DEFAULT_MAP_MARKER_COLOR
        return color.lower()

    def get_active_party(self, obj: FriendLink) -> Optional[Dict[str, Any]]:
        previews: Dict[int, Dict[str, Any]] = self.context.get("party_previews", {})
        friend_id = obj.friend_id
        if friend_id is None:
            return None
        return previews.get(friend_id)

    def get_top_other_party(self, obj: FriendLink) -> Optional[Dict[str, Any]]:
        mapping: Dict[int, Dict[str, Any]] = self.context.get("top_other_party_map") or {}
        if not mapping or obj.friend_id is None:
            return None
        data = mapping.get(obj.friend_id)
        if not data:
            return None
        return {
            "code": data.get("code") or "",
            "name": data.get("name") or "",
            "leader": data.get("leader") or "",
            "prestige_points": int(data.get("prestige_points") or 0),
            "last_active_at": data.get("last_active_at"),
        }


class FriendFavoriteSerializer(serializers.Serializer):
    is_favorite = serializers.BooleanField()


class CoordinatesSerializer(serializers.Serializer):
    lng = serializers.FloatField()
    lat = serializers.FloatField()


class CheckInRequestSerializer(serializers.Serializer):
    MODE_CHOICES = [choice[0] for choice in CheckIn.Mode.choices]
    PRECISION_CHOICES = ("precise", "fallback")
    SOURCE_CHOICES = (
        "geolocated",
        "map",
        "profile",
        "cached",
        "home-remote",
        "home-fallback",
        "manual",
        "ranged",
    )

    district_code = serializers.CharField(max_length=64)
    district_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    mode = serializers.ChoiceField(choices=MODE_CHOICES)
    precision = serializers.ChoiceField(
        choices=PRECISION_CHOICES,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    source = serializers.ChoiceField(choices=SOURCE_CHOICES, required=False, allow_blank=True)
    coordinates = CoordinatesSerializer(required=False)
    metadata = serializers.DictField(required=False)
    party_code = serializers.CharField(required=False, allow_blank=True, max_length=64)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        mode = attrs.get("mode")
        precision = attrs.get("precision")
        if mode != CheckIn.Mode.LOCAL and precision:
            attrs["precision"] = None
        return attrs


class CheckInSerializer(serializers.ModelSerializer):
    precision = serializers.SerializerMethodField()
    coordinates = serializers.SerializerMethodField()

    class Meta:
        model = CheckIn
        fields = [
            "id",
            "occurred_at",
            "district_code",
            "district_name",
            "action",
            "mode",
            "multiplier",
            "base_points",
            "points_awarded",
            "home_district_code_snapshot",
            "home_district_name_snapshot",
            "party_code",
            "precision",
            "coordinates",
        ]

    def get_precision(self, obj: CheckIn) -> Optional[str]:
        metadata = obj.metadata if isinstance(obj.metadata, dict) else {}
        precision = metadata.get("precision")
        if isinstance(precision, str) and precision:
            return precision
        return None

    def get_coordinates(self, obj: CheckIn) -> Optional[Dict[str, float]]:
        if not self.context.get("include_coordinates", False):
            return None
        metadata = obj.metadata if isinstance(obj.metadata, dict) else {}
        coords = metadata.get("coordinates")
        if not isinstance(coords, dict):
            return None
        try:
            lng = float(coords.get("lng"))
            lat = float(coords.get("lat"))
        except (TypeError, ValueError):
            return None
        if not (math.isfinite(lng) and math.isfinite(lat)):
            return None
        return {"lng": lng, "lat": lat}


class FriendRequestSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    initiated_by_you = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = [
            "id",
            "username",
            "display_name",
            "status",
            "initiated_by_you",
            "created_at",
        ]
        read_only_fields = fields

    def _resolve_other_player(self, obj: FriendRequest) -> Player:
        current: Player = self.context.get("current_player")
        if current and obj.to_player_id == current.id:
            return obj.from_player
        return obj.to_player

    def get_username(self, obj: FriendRequest) -> str:
        other = self._resolve_other_player(obj)
        return other.username if other else ""

    def get_display_name(self, obj: FriendRequest) -> str:
        other = self._resolve_other_player(obj)
        if other and other.display_name:
            return other.display_name
        return ""

    def get_initiated_by_you(self, obj: FriendRequest) -> bool:
        current: Player = self.context.get("current_player")
        return bool(current and obj.from_player_id == current.id)


class PartyAffinitySerializer(serializers.Serializer):
    encounters = serializers.IntegerField()
    last_encounter_at = serializers.IntegerField(allow_null=True)


class PartyPreviewSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField(allow_blank=True)
    leader = serializers.CharField(allow_blank=True)
    size = serializers.IntegerField()
    seconds_remaining = serializers.IntegerField(allow_null=True)
    expires_at = serializers.IntegerField(allow_null=True)
    is_leader = serializers.BooleanField()
    is_full = serializers.BooleanField()
    can_request = serializers.BooleanField()
    join_status = serializers.CharField()
    members = serializers.ListField(child=serializers.CharField(), required=False)
    leader_location_name = serializers.CharField(allow_blank=True, required=False)
    attack_multiplier = serializers.FloatField(required=False)
    contribution_multiplier = serializers.FloatField(required=False)


class BubbleMutualSerializer(serializers.Serializer):
    username = serializers.CharField()
    display_name = serializers.CharField(allow_blank=True)


class BubbleSuggestionSerializer(serializers.Serializer):
    username = serializers.CharField()
    display_name = serializers.CharField(allow_blank=True)
    home_district_name = serializers.CharField(allow_blank=True)
    home_district_code = serializers.CharField(allow_blank=True)
    mutual_friend_count = serializers.IntegerField()
    mutual_friends = BubbleMutualSerializer(many=True)
    party_affinity = PartyAffinitySerializer(allow_null=True)
    active_party = PartyPreviewSerializer(allow_null=True)


class PlayerSearchResultSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    incoming_request = serializers.SerializerMethodField()
    outgoing_request = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "id",
            "username",
            "display_name",
            "score",
            "attack_points",
            "defend_points",
            "checkins",
            "is_friend",
            "incoming_request",
            "outgoing_request",
        ]
        read_only_fields = fields

    def get_is_friend(self, obj: Player) -> bool:
        friend_ids: Set[int] = self.context.get("friend_ids", set())
        return obj.id in friend_ids

    def get_incoming_request(self, obj: Player) -> bool:
        incoming_ids: Set[int] = self.context.get("incoming_request_ids", set())
        return obj.id in incoming_ids

    def get_outgoing_request(self, obj: Player) -> bool:
        outgoing_ids: Set[int] = self.context.get("outgoing_request_ids", set())
        return obj.id in outgoing_ids


class PlayerPublicProfileSerializer(serializers.ModelSerializer):
    is_friend = serializers.SerializerMethodField()
    is_self = serializers.SerializerMethodField()
    streak_multiplier = serializers.SerializerMethodField()
    party_name = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "username",
            "display_name",
            "profile_bio",
            "profile_image_url",
            "map_marker_color",
            "score",
            "home_district",
            "home_district_name",
            "party_name",
            "streak_days",
            "streak_multiplier",
            "is_friend",
            "is_self",
        ]
        read_only_fields = fields

    def get_is_friend(self, obj: Player) -> bool:
        viewer: Optional[Player] = self.context.get("viewer")
        if not viewer or not viewer.id or not obj.id or viewer.id == obj.id:
            return False
        return FriendLink.objects.filter(player_id=viewer.id, friend_id=obj.id).exists()

    def get_is_self(self, obj: Player) -> bool:
        viewer: Optional[Player] = self.context.get("viewer")
        return bool(viewer and obj and viewer.id == obj.id)

    def get_streak_multiplier(self, obj: Player) -> float:
        today = timezone.localdate()
        days = _streak_effective_days(obj, today)
        return float(_streak_multiplier(days))

    def get_party_name(self, obj: Player) -> str:
        party = get_active_party(obj)
        if party and party.name:
            return party.name
        if party and party.code:
            return f"Party {party.code}"
        return (obj.preferred_party_name or "").strip()
