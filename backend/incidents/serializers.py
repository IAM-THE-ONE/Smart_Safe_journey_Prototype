from rest_framework import serializers
from .models import Incident, IncidentCategory, SOSAlert
from accounts.serializers import UserSimpleSerializer


class IncidentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentCategory
        fields = "__all__"


class IncidentSerializer(serializers.ModelSerializer):
    reporter_details = UserSimpleSerializer(source="reporter", read_only=True)
    assigned_to_details = UserSimpleSerializer(source="assigned_to", read_only=True)

    class Meta:
        model = Incident
        fields = "__all__"
        read_only_fields = ("ticket_id", "reporter", "created_at", "updated_at")


class IncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        exclude = ("reporter", "assigned_to", "resolved_at", "resolution_notes")


class IncidentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ("status", "assigned_to", "resolution_notes", "severity")


class SOSAlertSerializer(serializers.ModelSerializer):
    tourist_details = UserSimpleSerializer(source="tourist", read_only=True)

    class Meta:
        model = SOSAlert
        fields = "__all__"
        read_only_fields = ("tourist", "created_at")


class SOSCreateSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    message = serializers.CharField(required=False, allow_blank=True)
