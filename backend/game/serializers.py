from typing import Any, Dict, List

from rest_framework import serializers

from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    checkin_history = serializers.JSONField(required=False)

    MAX_CHECKIN_HISTORY = 50

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

            sanitized.append(
                {
                    "timestamp": timestamp_int,
                    "districtId": district_id,
                    "districtName": district_name,
                    "type": checkin_type,
                    "multiplier": multiplier_value,
                    "ranged": bool(raw.get("ranged")),
                    "melee": bool(raw.get("melee")),
                }
            )

        return sanitized
