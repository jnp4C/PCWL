from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string


class District(models.Model):
    """Authoritative list of districts players can align with."""

    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=120)
    base_strength = models.IntegerField(
        default=2000,
        help_text="Baseline strength score used when computing district leaderboards.",
    )
    current_strength = models.IntegerField(
        default=0,
        help_text="Live strength score after applying all attack and defend activity.",
    )
    defended_points_total = models.PositiveIntegerField(
        default=0,
        help_text="Cumulative defend points contributed to this district.",
    )
    attacked_points_total = models.PositiveIntegerField(
        default=0,
        help_text="Cumulative attack points dealt against this district.",
    )
    checkin_total = models.PositiveIntegerField(
        default=0,
        help_text="Total number of check-ins recorded for this district.",
    )
    last_activity_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name", "code"]

    def __str__(self):
        return f"{self.name} ({self.code})" if self.name else self.code

    def save(self, *args, **kwargs):
        if self.pk is None and self.base_strength and self.current_strength == 0:
            self.current_strength = self.base_strength
        super().save(*args, **kwargs)


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
    district_ip_address = models.CharField(
        max_length=32,
        blank=True,
        default="",
        help_text="Synthetic IP derived from home district code to support cyber mechanics.",
    )
    profile_bio = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Short public bio/message shown on the player's profile (<= 50 chars).",
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
    home_district_ref = models.ForeignKey(
        District,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="players",
    )
    checkin_history = models.JSONField(default=list, blank=True)
    cooldowns = models.JSONField(default=dict, blank=True)
    cooldown_details = models.JSONField(default=dict, blank=True)
    last_known_location = models.JSONField(
        null=True,
        blank=True,
        default=None,
        help_text="Last confirmed location payload from the client (lng/lat, district metadata, timestamp).",
    )
    streak_days = models.PositiveIntegerField(default=0)
    streak_last_day = models.DateField(null=True, blank=True)
    streak_progress_date = models.DateField(null=True, blank=True)
    streak_day_attack_done = models.BooleanField(default=False)
    streak_day_defend_done = models.BooleanField(default=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="player_profile",
        null=True,
        blank=True,
    )
    next_checkin_multiplier = models.PositiveIntegerField(default=1)
    preferred_party_name = models.CharField(max_length=48, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-score", "username"]

    def __str__(self):
        return self.username

    def _sync_home_fields(self) -> None:
        """Keep home district code/name/ref in sync if any are provided."""
        try:
            from .services import _normalise_district_code  # local import to avoid circular
        except Exception:
            _normalise_district_code = lambda value: value  # type: ignore

        if self.home_district_ref:
            # Prioritise the FK; backfill code/name if missing.
            if not self.home_district_code:
                self.home_district_code = self.home_district_ref.code
            if not self.home_district_name:
                self.home_district_name = self.home_district_ref.name
            if not self.home_district:
                self.home_district = self.home_district_ref.name
            return
        # No FK: try to resolve by code to avoid dangling text-only codes.
        if self.home_district_code and not self.home_district_ref_id:
            code = _normalise_district_code(self.home_district_code) or self.home_district_code
            district = District.objects.filter(code=code).first()
            if district is None:
                name = (self.home_district_name or self.home_district or "").strip() or f"District {code}"
                district = District.objects.create(code=code, name=name, is_active=True)
            self.home_district_ref = district
            if not self.home_district_code:
                self.home_district_code = district.code
            if not self.home_district_name:
                self.home_district_name = district.name
            if not self.home_district:
                self.home_district = district.name

    def save(self, *args, **kwargs):
        if not self.district_ip_address:
            self.district_ip_address = self._generate_district_ip()
        self._sync_home_fields()
        super().save(*args, **kwargs)

    def _generate_district_ip(self) -> str:
        """
        Generate a pseudo IP address namespaced to the home district code.
        Uses the first 3 digits of the home district code (or 100 fallback) as the prefix.
        Ensures a deterministic-ish but unique value per player by mixing in the PK or username.
        """
        import random
        import re

        # Extract a 3-digit prefix from the home district code, fallback to 100
        digits = re.sub(r"[^0-9]", "", self.home_district_code or "")
        prefix = (digits[:3] or "100").ljust(3, "0")
        try:
            prefix_int = max(1, min(223, int(prefix)))  # keep within unicast range
        except ValueError:
            prefix_int = 100

        # Salt with username/PK to reduce collisions; keep it simple and reproducible enough.
        salt = abs(hash(self.username or f"player-{random.randint(0, 9999)}")) % 65535

        for _ in range(5):
            octet2 = (salt // 256) % 255
            octet3 = (salt % 255 + random.randint(0, 254)) % 255
            octet4 = random.randint(10, 250)
            candidate = f"{prefix_int}.{octet2}.{octet3}.{octet4}"
            if not Player.objects.filter(district_ip_address=candidate).exists():
                return candidate
        # Fallback: let DB enforce uniqueness; still return last candidate.
        return candidate

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

    def assign_home_district(self, district: Optional["District"], save: bool = True):
        """Synchronise home district fields with the given District record."""
        if district is None:
            self.home_district_ref = None
            self.home_district_code = ""
            self.home_district_name = ""
            self.home_district = ""
            self.district_ip_address = ""
        else:
            self.home_district_ref = district
            self.home_district_code = district.code
            self.home_district_name = district.name
            self.home_district = district.name
            if not self.district_ip_address:
                self.district_ip_address = self._generate_district_ip()
        if save:
            update_fields = [
                "home_district_ref",
                "home_district_code",
                "home_district_name",
                "home_district",
                "district_ip_address",
                "updated_at",
            ]
            self.save(update_fields=update_fields)


class CheckIn(models.Model):
    """Authoritative log of player scoring events."""

    class Action(models.TextChoices):
        ATTACK = "attack", "Attack"
        DEFEND = "defend", "Defend"

    class Mode(models.TextChoices):
        LOCAL = "local", "Local"
        REMOTE = "remote", "Remote"
        RANGED = "ranged", "Ranged"

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="checkin_events",
    )
    occurred_at = models.DateTimeField(default=timezone.now)
    district_code = models.CharField(max_length=64, blank=True)
    district_name = models.CharField(max_length=120, blank=True)
    action = models.CharField(max_length=16, choices=Action.choices)
    mode = models.CharField(max_length=16, choices=Mode.choices)
    multiplier = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    base_points = models.PositiveIntegerField(default=10)
    points_awarded = models.IntegerField()
    district_points_delta = models.IntegerField(default=0)
    party = models.ForeignKey(
        "Party",
        on_delete=models.SET_NULL,
        related_name="checkins",
        null=True,
        blank=True,
    )
    party_size_snapshot = models.PositiveIntegerField(default=1)
    party_multiplier_snapshot = models.DecimalField(max_digits=8, decimal_places=2, default=1)
    home_district_code_snapshot = models.CharField(max_length=64, blank=True)
    home_district_name_snapshot = models.CharField(max_length=120, blank=True)
    party_code = models.CharField(max_length=64, blank=True)
    is_party_contribution = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["party_code"], name="checkin_party_code_idx"),
            models.Index(fields=["party"], name="checkin_party_idx"),
            models.Index(fields=["player", "occurred_at"], name="checkin_player_time_idx"),
            models.Index(fields=["district_code"], name="checkin_district_idx"),
        ]

    def __str__(self):
        return f"{self.player.username} {self.action} {self.district_code or '?'} ({self.points_awarded} pts)"


class DistrictDdosEntry(models.Model):
    """Tracks active DDoS contributions against a district."""

    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="active_ddos_entries",
    )
    attacker = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="ddos_attacks",
    )
    attacker_home_district = models.ForeignKey(
        District,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="outgoing_ddos_entries",
    )
    attacker_ip = models.CharField(max_length=32, blank=True, default="")
    started_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    ended_by_player = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ended_ddos_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["district", "expires_at"]),
            models.Index(fields=["attacker", "expires_at"]),
        ]

    def is_active(self, now=None) -> bool:
        now = now or timezone.now()
        return self.ended_at is None and self.expires_at > now

    def __str__(self):
        return f"DDoS {self.attacker_ip or self.attacker_id} -> {self.district.code}"


class DistrictWormEntry(models.Model):
    """Tracks active Worm disruption attempts against a district."""

    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="active_worm_entries",
    )
    attacker = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="worm_attacks",
    )
    attacker_home_district = models.ForeignKey(
        District,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="outgoing_worm_entries",
    )
    attacker_ip = models.CharField(max_length=32, blank=True, default="")
    started_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    ended_by_player = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ended_worm_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["district", "expires_at"]),
            models.Index(fields=["attacker", "expires_at"]),
        ]

    def is_active(self, now=None) -> bool:
        now = now or timezone.now()
        return self.ended_at is None and self.expires_at > now

    def __str__(self):
        return f"Worm {self.attacker_ip or self.attacker_id} -> {self.district.code}"


class DistrictEngagement(models.Model):
    """Aggregated attack focus from one home district toward another."""

    home_district_code = models.CharField(max_length=64)
    home_district_name = models.CharField(max_length=120, blank=True)
    target_district_code = models.CharField(max_length=64)
    target_district_name = models.CharField(max_length=120, blank=True)
    attack_points_total = models.PositiveIntegerField(default=0)
    attack_checkins = models.PositiveIntegerField(default=0)
    party_attack_checkins = models.PositiveIntegerField(default=0)
    last_attack_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["home_district_code", "target_district_code"],
                name="unique_home_target_engagement",
            )
        ]
        ordering = ["home_district_code", "-attack_points_total", "target_district_code"]

    def __str__(self):
        return f"{self.home_district_code or '?'} -> {self.target_district_code or '?'} ({self.attack_points_total} pts)"


class PlayerDistrictContribution(models.Model):
    """Aggregated contribution totals a player has provided to each district."""

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="district_totals",
    )
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="player_totals",
    )
    defend_points_total = models.PositiveIntegerField(default=0)
    attack_points_total = models.PositiveIntegerField(default=0)
    defend_checkins = models.PositiveIntegerField(default=0)
    attack_checkins = models.PositiveIntegerField(default=0)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player", "district"],
                name="unique_player_district_contribution",
            )
        ]
        ordering = ["-defend_points_total", "player__username"]

    def __str__(self):
        return f"{self.player.username} -> {self.district.code} (+{self.defend_points_total} / -{self.attack_points_total})"


class DistrictChatMessage(models.Model):
    """Chat messages scoped to a district's cyber activity window."""

    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="chat_messages",
    )
    sender = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_chat_messages",
    )
    username = models.CharField(max_length=50)
    display_name = models.CharField(max_length=100, blank=True)
    text = models.CharField(max_length=500)
    sent_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-sent_at", "-id"]
        indexes = [
            models.Index(fields=["district", "-sent_at"], name="district_chat_time_idx"),
            models.Index(fields=["district", "id"], name="district_chat_id_idx"),
        ]

    def __str__(self):
        return f"{self.username} -> {self.district.code}: {self.text[:32]}..."


class Party(models.Model):
    """Temporary squad of players coordinating attacks/defences."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"

    code = models.CharField(max_length=64, unique=True, editable=False)
    name = models.CharField(max_length=64, blank=True, default="")
    leader = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="led_parties",
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    expires_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    last_active_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["leader"], name="party_leader_idx"),
            models.Index(fields=["status"], name="party_status_idx"),
        ]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = get_random_string(16)
        super().save(*args, **kwargs)

    def mark_ended(self, when=None):
        when = when or timezone.now()
        if self.status != self.Status.ENDED:
            self.status = self.Status.ENDED
            self.ended_at = when
            self.save(update_fields=["status", "ended_at", "updated_at"])
            self.join_requests.filter(status=PartyJoinRequest.Status.PENDING).update(  # type: ignore[name-defined]
                status=PartyJoinRequest.Status.CANCELLED,
                responded_at=when,
            )

    def is_active(self):
        if self.status != self.Status.ACTIVE:
            return False
        if self.expires_at and self.expires_at <= timezone.now():
            return False
        return True

    def __str__(self):
        base = f"Party {self.code}"
        if self.name:
            base = f"{self.name} ({self.code})"
        return f"{base} (leader={self.leader.username})"


class PartyMembership(models.Model):
    """Link between players and their party participation history."""

    party = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="party_memberships",
    )
    is_leader = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["joined_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["player"],
                condition=models.Q(left_at__isnull=True),
                name="unique_active_party_membership",
            )
        ]
        indexes = [
            models.Index(fields=["party", "left_at"], name="party_mem_left_idx"),
            models.Index(fields=["player"], name="party_mem_player_idx"),
        ]

    def __str__(self):
        return f"{self.player.username} in {self.party.code}"


class PartyInvitation(models.Model):
    """Players must accept an invitation to join a party."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        CANCELLED = "cancelled", "Cancelled"

    party = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    from_player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="sent_party_invitations",
    )
    to_player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="received_party_invitations",
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["party", "to_player"],
                condition=models.Q(status="pending"),
                name="unique_pending_party_invite",
            )
        ]
        indexes = [
            models.Index(fields=["party", "status"], name="party_invite_status_idx"),
            models.Index(fields=["to_player"], name="party_invite_target_idx"),
        ]

    def __str__(self):
        return f"Invite {self.party.code} -> {self.to_player.username} ({self.status})"


class PartyJoinRequest(models.Model):
    """Friend-initiated request to join an existing party."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        CANCELLED = "cancelled", "Cancelled"

    party = models.ForeignKey(
        Party,
        on_delete=models.CASCADE,
        related_name="join_requests",
    )
    from_player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="party_join_requests",
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["party", "from_player"],
                condition=models.Q(status="pending"),
                name="unique_active_party_join_request",
            )
        ]
        indexes = [
            models.Index(fields=["party", "status"], name="party_join_status_idx"),
            models.Index(fields=["from_player"], name="party_join_from_idx"),
        ]

    def __str__(self):
        return f"JoinRequest {self.from_player.username} -> {self.party.code} ({self.status})"


class DistrictContributionStat(models.Model):
    """Aggregate how much a player helped defend a particular home district."""

    district_code = models.CharField(max_length=64)
    supporter = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="district_support_stats",
    )
    contribution_points = models.PositiveIntegerField(default=0)
    contribution_checkins = models.PositiveIntegerField(default=0)
    last_contribution_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["district_code", "supporter"],
                name="unique_district_supporter_stat",
            )
        ]
        ordering = ["-contribution_points"]

    def __str__(self):
        return f"{self.supporter.username} -> {self.district_code} ({self.contribution_points} pts)"


class DistrictPartyStat(models.Model):
    """Track how much prestige each party has amassed within a district."""

    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="party_stats",
    )
    party = models.ForeignKey(
        "Party",
        on_delete=models.CASCADE,
        related_name="district_stats",
    )
    prestige_points = models.PositiveBigIntegerField(default=0)
    last_activity_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("district", "party")
        indexes = [
            models.Index(fields=["district"], name="district_partystat_dist_idx"),
            models.Index(fields=["party"], name="district_partystat_party_idx"),
            models.Index(fields=["last_activity_at"], name="district_partystat_act_idx"),
        ]

    def __str__(self):
        party_code = self.party.code if self.party_id and self.party else None
        district_code = self.district.code if self.district_id else None
        return f"{party_code or 'Party'} in {district_code or 'District'} ({self.prestige_points} pts)"


class PlayerPartyBond(models.Model):
    """Tracks how frequently two players squad together."""

    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="party_bonds",
    )
    partner = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="partner_party_bonds",
    )
    shared_checkins = models.PositiveIntegerField(default=0)
    shared_attack_points = models.PositiveIntegerField(default=0)
    shared_contribution_points = models.PositiveIntegerField(default=0)
    last_shared_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player", "partner"],
                name="unique_party_bond",
            ),
            models.CheckConstraint(
                check=~models.Q(player=models.F("partner")),
                name="prevent_self_party_bond",
            ),
        ]
        ordering = ["-shared_checkins", "partner__username"]

    def __str__(self):
        return f"{self.player.username} ❤ {self.partner.username} ({self.shared_checkins} check-ins)"


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
