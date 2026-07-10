from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        TRIP_ALERT = "trip_alert", "Trip Alert"
        GEO_ALERT = "geo_alert", "Geo-fencing Alert"
        WEATHER_ALERT = "weather_alert", "Weather Alert"
        SOS_ALERT = "sos_alert", "SOS Alert"
        INCIDENT_UPDATE = "incident_update", "Incident Update"
        ADMIN_ANNOUNCEMENT = "admin_announcement", "Admin Announcement"
        SAFETY_TIP = "safety_tip", "Safety Tip"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.title}"
