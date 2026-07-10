import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class TouristProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tourist_profile")
    nationality = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    passport_number = models.CharField(max_length=50, blank=True)
    passport_image = models.ImageField(upload_to="documents/", blank=True, null=True)
    aadhaar_number = models.CharField(max_length=20, blank=True)
    aadhaar_image = models.ImageField(upload_to="documents/", blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    emergency_contact_relation = models.CharField(max_length=100, blank=True)
    emergency_contact_email = models.EmailField(blank=True)
    destination = models.CharField(max_length=200, blank=True)
    trip_start_date = models.DateField(null=True, blank=True)
    trip_end_date = models.DateField(null=True, blank=True)
    is_on_trip = models.BooleanField(default=False)
    share_live_location = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tourist_profiles"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.destination}"


class DigitalTouristID(models.Model):
    tourist = models.OneToOneField(TouristProfile, on_delete=models.CASCADE, related_name="digital_id")
    unique_id = models.CharField(max_length=20, unique=True, editable=False)
    qr_code = models.ImageField(upload_to="qr_codes/", blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_ids")
    verified_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="pending", choices=[
        ("pending", "Pending"),
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("expired", "Expired"),
    ])
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "digital_tourist_ids"

    def save(self, *args, **kwargs):
        if not self.unique_id:
            self.unique_id = f"ST{uuid.uuid4().hex[:8].upper()}"
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=365)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ID: {self.unique_id} - {self.tourist.user.get_full_name()}"


class EmergencyContact(models.Model):
    tourist = models.ForeignKey(TouristProfile, on_delete=models.CASCADE, related_name="emergency_contacts")
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    relation = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "emergency_contacts"

    def __str__(self):
        return f"{self.name} ({self.relation})"


class TripHistory(models.Model):
    tourist = models.ForeignKey(TouristProfile, on_delete=models.CASCADE, related_name="trip_history")
    destination = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    safety_score = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "trip_history"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.tourist.user.get_full_name()} - {self.destination} ({self.start_date} to {self.end_date})"


class LiveLocation(models.Model):
    tourist = models.ForeignKey(TouristProfile, on_delete=models.CASCADE, related_name="live_locations")
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "live_locations"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.tourist.user.get_full_name()} at ({self.latitude}, {self.longitude})"
