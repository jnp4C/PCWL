from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models


class Player(models.Model):
    """Basic player profile used for future multiplayer logic."""

    username = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    profile_image_url = models.URLField(blank=True, default="")
    map_marker_color = models.CharField(
        max_length=16,
        blank=True,
        default="#6366f1",
        help_text="Hex color (e.g. #ff0000) used to render the player's map marker.",
    )
    score = models.PositiveIntegerField(default=0)
    checkins = models.PositiveIntegerField(default=0)
    home_district = models.CharField(max_length=120, blank=True)
    attack_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    defend_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    attack_points = models.PositiveIntegerField(default=0)
    defend_points = models.PositiveIntegerField(default=0)
    home_district_code = models.CharField(max_length=64, blank=True)
    home_district_name = models.CharField(max_length=120, blank=True)
    checkin_history = models.JSONField(default=list, blank=True)
    cooldowns = models.JSONField(default=dict, blank=True)
    cooldown_details = models.JSONField(default=dict, blank=True)
    last_known_location = models.JSONField(
        null=True,
        blank=True,
        default=None,
        help_text="Last confirmed location payload from the client (lng/lat, district metadata, timestamp).",
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="player_profile",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-score", "username"]

    def __str__(self):
        return self.username

    def ensure_auth_user(self, password=None):
        """
        Make sure this player is backed by a Django auth user.
        Optionally sets/updates the password if provided.
        """
        UserModel = get_user_model()
        user = self.user

        if user is None:
            try:
                user = UserModel.objects.get(username=self.username)
            except UserModel.DoesNotExist:
                user = UserModel.objects.create_user(
                    username=self.username,
                    password=password or UserModel.objects.make_random_password(),
                )
            self.user = user
            self.save(update_fields=["user"])

        if password:
            user.set_password(password)
            user.save(update_fields=["password"])
        return user


class FriendLink(models.Model):
    """Directional friend relationship between two players."""

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="friend_links",
    )
    friend = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="reverse_friend_links",
    )
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player", "friend"],
                name="unique_friend_link",
            ),
            models.CheckConstraint(
                check=~models.Q(player=models.F("friend")),
                name="prevent_self_friendship",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.player.username} -> {self.friend.username}"


class FriendRequest(models.Model):
    """Pending friend relationship that requires approval."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        CANCELLED = "cancelled", "Cancelled"

    from_player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="sent_friend_requests",
    )
    to_player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="received_friend_requests",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["from_player", "to_player"],
                condition=models.Q(status="pending"),
                name="unique_pending_friend_request",
            ),
            models.CheckConstraint(
                check=~models.Q(from_player=models.F("to_player")),
                name="prevent_self_friend_request",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.from_player.username} -> {self.to_player.username} ({self.status})"
