from typing import Any, Dict, List, Set

from rest_framework import serializers

from .models import FriendLink, FriendRequest, Player


class PlayerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    checkin_history = serializers.JSONField(required=False)
    cooldowns = serializers.JSONField(required=False)
    cooldown_details = serializers.JSONField(required=False)

    MAX_CHECKIN_HISTORY = 50
    VALID_COOLDOWN_TYPES: Set[str] = {"attack", "defend", "charge"}
    VALID_COOLDOWN_MODES: Set[str] = {"local", "remote", "ranged"}

    class Meta:
        model = Player
        fields = [
            "id",
            "username",
            "display_name",
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
            "password",
        ]
        extra_kwargs = {
            "last_known_location": {"required": False, "allow_null": True},
            "password": {"write_only": True},
            "home_district_code": {"required": False, "allow_blank": True},
            "home_district_name": {"required": False, "allow_blank": True},
            "attack_points": {"required": False},
            "defend_points": {"required": False},
            "checkin_history": {"required": False},
            "cooldowns": {"required": False},
            "cooldown_details": {"required": False},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        player = super().create(validated_data)
        if "checkin_history" in validated_data:
            player.checkins = len(player.checkin_history or [])
        if "home_district_name" in validated_data and validated_data.get("home_district_name"):
            player.home_district = player.home_district_name
        player.ensure_auth_user(password=password)
        if "checkin_history" in validated_data or "home_district_name" in validated_data:
            update_fields: List[str] = []
            if "checkin_history" in validated_data:
                update_fields.append("checkins")
            if "home_district_name" in validated_data:
                update_fields.append("home_district")
            if update_fields:
                player.save(update_fields=update_fields)
        return player

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        history_provided = "checkin_history" in validated_data
        home_name_provided = "home_district_name" in validated_data
        player = super().update(instance, validated_data)
        if password:
            player.ensure_auth_user(password=password)
        update_fields: List[str] = []
        if history_provided:
            player.checkins = len(player.checkin_history or [])
            update_fields.append("checkins")
        if home_name_provided:
            player.home_district = player.home_district_name or ""
            update_fields.append("home_district")
        if update_fields:
            player.save(update_fields=update_fields)
        return player

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


class FriendLinkSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="friend.username", read_only=True)
    display_name = serializers.SerializerMethodField()
    score = serializers.IntegerField(source="friend.score", read_only=True)
    attack_points = serializers.IntegerField(source="friend.attack_points", read_only=True)
    defend_points = serializers.IntegerField(source="friend.defend_points", read_only=True)
    attack_ratio = serializers.DecimalField(
        source="friend.attack_ratio", max_digits=5, decimal_places=2, read_only=True
    )
    defend_ratio = serializers.DecimalField(
        source="friend.defend_ratio", max_digits=5, decimal_places=2, read_only=True
    )
    checkins = serializers.IntegerField(source="friend.checkins", read_only=True)
    checkin_counts = serializers.SerializerMethodField()
    recent_checkins = serializers.SerializerMethodField()

    class Meta:
        model = FriendLink
        fields = [
            "id",
            "username",
            "display_name",
            "score",
            "attack_points",
            "defend_points",
            "attack_ratio",
            "defend_ratio",
            "checkins",
            "checkin_counts",
            "recent_checkins",
            "is_favorite",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "username",
            "display_name",
            "score",
            "attack_points",
            "defend_points",
            "attack_ratio",
            "defend_ratio",
            "checkins",
            "checkin_counts",
            "recent_checkins",
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


class FriendFavoriteSerializer(serializers.Serializer):
    is_favorite = serializers.BooleanField()


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
