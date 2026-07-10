from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        TOURIST = "tourist", "Tourist"
        POLICE = "police", "Police Officer"
        TOURISM_DEPT = "tourism_dept", "Tourism Department"
        ADMIN = "admin", "Administrator"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TOURIST)
    phone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)
    firebase_uid = models.CharField(max_length=128, blank=True)
    is_online = models.BooleanField(default=False)
    last_latitude = models.FloatField(null=True, blank=True)
    last_longitude = models.FloatField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
