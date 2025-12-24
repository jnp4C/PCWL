import re
from typing import Any, Dict, List, Optional

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from .models import District, DistrictChatMessage, Player
from .services import (
    _are_direct_friends,
    _ensure_player_district_ip,
    _normalise_district_code,
    get_chat_effective_state,
    get_chat_vote_period,
)


class DistrictChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer providing a per-district chatroom inside the cyber activity panel.

    Only authenticated players whose home district or last known location matches the room code may join.
    Messages are persisted so new joiners receive the recent history.
    """

    max_message_length = 500
    history_limit = 30

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.district: Optional[District] = None
        self.player: Optional[Player] = None
        self.group_name: str = ""
        self.room_type: str = DistrictChatMessage.Room.MAIN
        self.period_start: Optional[timezone.datetime] = None

    async def connect(self):
        code = self.scope.get("url_route", {}).get("kwargs", {}).get("code")
        normalized_code = _normalise_district_code(code)
        user = self.scope.get("user")
        if not normalized_code or user is None or not getattr(user, "is_authenticated", False):
            await self.close(code=4401)
            return

        player = await self._get_or_create_player(user)
        if player is None:
            await self.close(code=4403)
            return

        home_code = _normalise_district_code(getattr(player, "home_district_code", None))
        last_known = getattr(player, "last_known_location", None) or {}
        last_known_code = _normalise_district_code(
            last_known.get("districtId")
            or last_known.get("district_id")
            or last_known.get("districtCode")
            or last_known.get("district_code")
        )
        is_home = normalized_code == home_code
        is_current = normalized_code == last_known_code
        if normalized_code not in {home_code, last_known_code}:
            # Allow home district or last known location to join the room.
            await self.close(code=4403)
            return

        district = await self._get_district(normalized_code)
        if district is None:
            await self.close(code=4404)
            return

        period = get_chat_vote_period(timezone.now())
        self.period_start = period.get("start")
        self.player = player
        self.district = district
        allow_visitors = await sync_to_async(get_chat_effective_state)(district)
        if not is_home and is_current and not allow_visitors:
            self.room_type = DistrictChatMessage.Room.VISITORS
        else:
            self.room_type = DistrictChatMessage.Room.MAIN
        self.group_name = self._build_group_name(normalized_code, self.room_type)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        history = await self._get_recent_history()
        if history:
            await self.send_json({"type": "chat.history", "messages": history})
        await self.send_json(
            {
                "type": "chat.status",
                "status": "connected",
                "room": self.room_type,
                "state": "open" if allow_visitors else "closed",
            }
        )

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content: Dict[str, Any], **kwargs):
        if not self.player or not self.district:
            await self.close(code=4401)
            return

        text = (content.get("message") or "").strip()
        if not text:
            return
        if len(text) > self.max_message_length:
            text = text[: self.max_message_length]

        message = await self._persist_message(text)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.broadcast", "message_id": message.id},
        )

    async def chat_broadcast(self, event: Dict[str, Any]):
        message_id = event.get("message_id")
        if not message_id:
            return
        message = await self._get_message(message_id)
        if not message:
            return
        payload = await self._serialize_message(message)
        await self.send_json({"type": "chat.message", **payload})

    def _build_group_name(self, code: str, room: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9_-]", "-", code or "").lower() or "unknown"
        suffix = "visitors" if room == DistrictChatMessage.Room.VISITORS else "main"
        return f"district_chat_{slug}_{suffix}"

    @sync_to_async
    def _get_district(self, code: str) -> Optional[District]:
        return District.objects.filter(code__iexact=code).first()

    @sync_to_async
    def _get_or_create_player(self, user) -> Optional[Player]:
        try:
            player = getattr(user, "player_profile", None) or Player.objects.filter(user=user).first()
            if player is None:
                player, _ = Player.objects.get_or_create(username=user.username)
            if player.user_id is None:
                player.user = user
                player.save(update_fields=["user"])
            return player
        except Exception:
            return None

    @sync_to_async
    def _persist_message(self, text: str) -> DistrictChatMessage:
        assert self.player is not None
        assert self.district is not None
        if self.period_start:
            DistrictChatMessage.objects.filter(
                district=self.district,
                sent_at__lt=self.period_start,
            ).delete()
        display_name = (self.player.display_name or "").strip() or self.player.username
        # Ensure the synthetic district IP is available for chat display.
        try:
            _ensure_player_district_ip(self.player)
        except Exception:
            # Non-fatal; fallback will rely on username.
            pass
        return DistrictChatMessage.objects.create(
            district=self.district,
            sender=self.player,
            username=self.player.username,
            display_name=display_name,
            text=text,
            room=self.room_type,
            sent_at=timezone.now(),
        )

    async def _get_recent_history(self) -> List[Dict[str, Any]]:
        assert self.district is not None
        messages = await self._get_recent_history_records()
        serialized: List[Dict[str, Any]] = []
        for msg in reversed(messages):  # send oldest first
            serialized.append(await self._serialize_message(msg))
        return serialized

    @sync_to_async
    def _get_recent_history_records(self) -> List[DistrictChatMessage]:
        assert self.district is not None
        qs = DistrictChatMessage.objects.filter(district=self.district, room=self.room_type)
        if self.period_start:
            qs = qs.filter(sent_at__gte=self.period_start)
        return list(qs.select_related("sender").order_by("-sent_at")[: max(1, self.history_limit)])

    @sync_to_async
    def _get_message(self, message_id: int) -> Optional[DistrictChatMessage]:
        return (
            DistrictChatMessage.objects.select_related("sender")
            .filter(id=message_id)
            .first()
        )

    async def _serialize_message(self, message: DistrictChatMessage) -> Dict[str, Any]:
        district_ip = ""
        sender = getattr(message, "sender", None)
        if sender:
            try:
                district_ip = _ensure_player_district_ip(sender)
            except Exception:
                district_ip = sender.district_ip_address or ""
        payload = {
            "id": message.id,
            "district_ip": district_ip or "",
            "message": message.text,
            "sent_at": message.sent_at.isoformat(),
        }
        if await self._can_reveal_sender(sender):
            payload["username"] = message.username
            payload["display_name"] = message.display_name or message.username
        return payload

    @sync_to_async
    def _can_reveal_sender(self, sender: Optional[Player]) -> bool:
        if not sender or not self.player:
            return False
        return _are_direct_friends(self.player, sender)
