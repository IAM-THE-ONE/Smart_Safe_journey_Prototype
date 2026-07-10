from django.db import models
from django.conf import settings


class Zone(models.Model):
    class ZoneType(models.TextChoices):
        SAFE = "safe", "Safe Zone"
        RESTRICTED = "restricted", "Restricted Zone"
        HIGH_RISK = "high_risk", "High Risk Zone"

    name = models.CharField(max_length=200)
    zone_type = models.CharField(max_length=20, choices=ZoneType.choices)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(default=500, help_text="Radius in meters")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_zones")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "zones"

    def __str__(self):
        return f"{self.get_zone_type_display()} - {self.name}"


class ZoneAlert(models.Model):
    tourist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="zone_alerts")
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="alerts")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "zone_alerts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alert: {self.tourist.get_full_name()} in {self.zone.name}"
