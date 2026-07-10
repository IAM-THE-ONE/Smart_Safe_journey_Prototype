from django.contrib import admin
from .models import Zone, ZoneAlert


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ("name", "zone_type", "is_active", "created_by", "created_at")
    list_filter = ("zone_type", "is_active")


@admin.register(ZoneAlert)
class ZoneAlertAdmin(admin.ModelAdmin):
    list_display = ("tourist", "zone", "is_read", "created_at")
    list_filter = ("is_read",)
