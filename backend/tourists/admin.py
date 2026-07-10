from django.contrib import admin
from .models import TouristProfile, DigitalTouristID, EmergencyContact, TripHistory, LiveLocation


@admin.register(TouristProfile)
class TouristProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "nationality", "destination", "is_on_trip")
    list_filter = ("is_on_trip", "nationality")


@admin.register(DigitalTouristID)
class DigitalTouristIDAdmin(admin.ModelAdmin):
    list_display = ("unique_id", "tourist", "status", "is_verified", "issued_at")
    list_filter = ("status", "is_verified")


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ("name", "tourist", "phone", "relation", "is_primary")


@admin.register(TripHistory)
class TripHistoryAdmin(admin.ModelAdmin):
    list_display = ("tourist", "destination", "start_date", "end_date", "risk_level")


@admin.register(LiveLocation)
class LiveLocationAdmin(admin.ModelAdmin):
    list_display = ("tourist", "latitude", "longitude", "timestamp")
