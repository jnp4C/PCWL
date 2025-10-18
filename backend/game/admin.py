from django.contrib import admin

from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("username", "display_name", "score", "checkins", "home_district", "is_active")
    search_fields = ("username", "display_name", "home_district")
    list_filter = ("is_active",)
