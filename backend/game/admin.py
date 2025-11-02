from django import forms
from django.contrib import admin

from .models import District, Player


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
        if self.instance and self.instance.pk and self.instance.home_district_code:
            try:
                self.fields["home_district_code"].initial = District.objects.get(code=self.instance.home_district_code)
            except District.DoesNotExist:
                self.fields["home_district_code"].initial = None

    def clean_home_district_code(self):
        district = self.cleaned_data.get("home_district_code")
        if not district:
            self.instance.home_district_name = ""
            self.instance.home_district = ""
            return ""
        self.instance.home_district_name = district.name
        self.instance.home_district = district.name
        return district.code


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("code", "name")
    ordering = ("name", "code")


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    form = PlayerAdminForm
    list_display = ("username", "display_name", "score", "checkins", "home_district", "is_active")
    search_fields = ("username", "display_name", "home_district")
    list_filter = ("is_active",)
