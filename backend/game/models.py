from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models


class Player(models.Model):
    """Basic player profile used for future multiplayer logic."""

    username = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100, blank=True)
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
