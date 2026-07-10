from django.contrib import admin
from .models import Hospital, PoliceStation


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "is_active")


@admin.register(PoliceStation)
class PoliceStationAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "is_active")
