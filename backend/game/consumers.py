import re
from typing import Any, Dict, List, Optional

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from .models import District, DistrictChatMessage, Player
from .services import _normalise_district_code, _ensure_player_district_ip


class DistrictChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer providing a per-district chatroom inside the cyber activity panel.

    Only authenticated players whose home district matches the room code may join.
    Messages are persisted so new joiners receive the recent history.
    """

    max_message_length = 500
    history_limit = 30

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.district: Optional[District] = None
        self.player: Optional[Player] = None
        self.group_name: str = ""

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
        if home_code != normalized_code:
            # Restrict chat visibility to home district members, matching the cyber feed rules.
            await self.close(code=4403)
            return

        district = await self._get_district(normalized_code)
        if district is None:
            await self.close(code=4404)
            return

        self.player = player
        self.district = district
        self.group_name = self._build_group_name(normalized_code)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        history = await self._get_recent_history()
        if history:
            await self.send_json({"type": "chat.history", "messages": history})
        await self.send_json({"type": "chat.status", "status": "connected"})

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
        payload = self._serialize_message(message)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.broadcast", "payload": payload},
        )

    async def chat_broadcast(self, event: Dict[str, Any]):
        payload = event.get("payload")
        if payload:
            await self.send_json({"type": "chat.message", **payload})

    def _build_group_name(self, code: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9_-]", "-", code or "").lower() or "unknown"
        return f"district_chat_{slug}"

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
            sent_at=timezone.now(),
        )

    @sync_to_async
    def _get_recent_history(self) -> List[Dict[str, Any]]:
        assert self.district is not None
        messages = (
            DistrictChatMessage.objects.filter(district=self.district)
            .order_by("-sent_at")[: max(1, self.history_limit)]
        )
        serialized = [self._serialize_message(msg) for msg in messages]
        serialized.reverse()  # send oldest first
        return serialized

    def _serialize_message(self, message: DistrictChatMessage) -> Dict[str, Any]:
        district_ip = ""
        sender = getattr(message, "sender", None)
        if sender:
            try:
                district_ip = _ensure_player_district_ip(sender)
            except Exception:
                district_ip = sender.district_ip_address or ""
        return {
            "id": message.id,
            "username": message.username,
            "display_name": message.display_name or message.username,
            "district_ip": district_ip or "",
            "message": message.text,
            "sent_at": message.sent_at.isoformat(),
        }
