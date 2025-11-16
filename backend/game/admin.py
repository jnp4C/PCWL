from django import forms
from django.contrib import admin

from .models import (
    District,
    Party,
    PartyInvitation,
    PartyJoinRequest,
    PartyMembership,
    Player,
    PlayerDistrictContribution,
)


class PlayerAdminForm(forms.ModelForm):
    home_district_code = forms.ModelChoiceField(
        label="Home district",
        queryset=District.objects.order_by("name", "code"),
        required=False,
        to_field_name="code",
        empty_label="(unset)",
    )

    class Meta:
        model = Player
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        field = self.fields.get("home_district_code")
        if field:
            widget = field.widget
            # Disable the add/change related buttons; districts are managed in their own admin.
            for attr in ("can_add_related", "can_change_related", "can_delete_related"):
                if hasattr(widget, attr):
                    setattr(widget, attr, False)
        if self.instance and self.instance.pk:
            initial = None
            if self.instance.home_district_ref_id:
                initial = self.instance.home_district_ref
            elif self.instance.home_district_code:
                initial = District.objects.filter(code=self.instance.home_district_code).first()
            if initial:
                self.fields["home_district_code"].initial = initial

    def clean_home_district_code(self):
        district = self.cleaned_data.get("home_district_code")
        if not district:
            self.instance.home_district_name = ""
            self.instance.home_district = ""
            self.instance.home_district_ref = None
            return ""
        self.instance.home_district_name = district.name
        self.instance.home_district = district.name
        self.instance.home_district_ref = district
        return district.code

    def save(self, commit=True):
        instance = super().save(commit=False)
        district_obj = None
        district_code = self.cleaned_data.get("home_district_code")
        if district_code:
            district_obj = (
                district_code
                if isinstance(district_code, District)
                else District.objects.filter(code=district_code).first()
            )
        instance.assign_home_district(district_obj, save=False)
        if commit:
            instance.save()
            self.save_m2m()
        return instance


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "name",
        "current_strength",
        "defended_points_total",
        "attacked_points_total",
        "checkin_total",
        "base_strength",
        "is_active",
        "updated_at",
    )
    list_filter = ("is_active",)
    search_fields = ("code", "name")
    ordering = ("name", "code")


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    form = PlayerAdminForm
    list_display = ("username", "display_name", "score", "checkins", "home_district_ref", "is_active")
    search_fields = ("username", "display_name", "home_district", "home_district_code")
    list_filter = ("is_active", "home_district_ref")


@admin.register(PlayerDistrictContribution)
class PlayerDistrictContributionAdmin(admin.ModelAdmin):
    list_display = (
        "player",
        "district",
        "defend_points_total",
        "attack_points_total",
        "defend_checkins",
        "attack_checkins",
        "last_activity_at",
    )
    list_filter = ("district",)
    search_fields = ("player__username", "district__code", "district__name")


@admin.register(Party)
class PartyAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "leader", "status", "expires_at", "created_at")
    list_filter = ("status",)
    search_fields = ("code", "name", "leader__username")
    ordering = ("-created_at",)


@admin.register(PartyMembership)
class PartyMembershipAdmin(admin.ModelAdmin):
    list_display = ("party", "player", "is_leader", "joined_at", "left_at")
    list_filter = ("is_leader", "joined_at")
    search_fields = ("party__code", "party__name", "player__username")


@admin.register(PartyInvitation)
class PartyInvitationAdmin(admin.ModelAdmin):
    list_display = ("party", "from_player", "to_player", "status", "created_at", "responded_at")
    list_filter = ("status",)
    search_fields = ("party__code", "party__name", "from_player__username", "to_player__username")


@admin.register(PartyJoinRequest)
class PartyJoinRequestAdmin(admin.ModelAdmin):
    list_display = ("party", "from_player", "status", "created_at", "responded_at")
    list_filter = ("status",)
    search_fields = ("party__code", "party__name", "from_player__username")
