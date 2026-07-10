from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_online", "is_active")
    list_filter = ("role", "is_active", "is_online")
    fieldsets = UserAdmin.fieldsets + (
        ("SafeVoyage Fields", {"fields": ("role", "phone", "photo", "firebase_uid", "is_online", "last_latitude", "last_longitude")}),
    )
