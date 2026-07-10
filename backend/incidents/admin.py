from django.contrib import admin
from .models import Incident, IncidentCategory, SOSAlert


@admin.register(IncidentCategory)
class IncidentCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("ticket_id", "title", "category", "severity", "status", "reporter", "created_at")
    list_filter = ("status", "severity", "category")


@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ("tourist", "latitude", "longitude", "is_active", "created_at")
    list_filter = ("is_active",)
