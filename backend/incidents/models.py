import uuid
from django.db import models
from django.conf import settings


class IncidentCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "incident_categories"
        verbose_name_plural = "Incident Categories"

    def __str__(self):
        return self.name


class Incident(models.Model):
    class Status(models.TextChoices):
        REPORTED = "reported", "Reported"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        IN_PROGRESS = "in_progress", "In Progress"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MODERATE = "moderate", "Moderate"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    ticket_id = models.CharField(max_length=20, unique=True, editable=False)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reported_incidents")
    category = models.ForeignKey(IncidentCategory, on_delete=models.SET_NULL, null=True, related_name="incidents")
    title = models.CharField(max_length=200)
    description = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.CharField(max_length=500, blank=True)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MODERATE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REPORTED)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_incidents")
    photo = models.ImageField(upload_to="incident_images/", blank=True, null=True)
    video = models.FileField(upload_to="incident_videos/", blank=True, null=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "incidents"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            self.ticket_id = f"INC{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_id} - {self.title}"


class SOSAlert(models.Model):
    tourist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sos_alerts")
    latitude = models.FloatField()
    longitude = models.FloatField()
    message = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    responded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="sos_responses")
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sos_alerts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"SOS from {self.tourist.get_full_name()} at {self.created_at}"
