from rest_framework import serializers
from .models import Zone, ZoneAlert


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")


class ZoneAlertSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source="zone.name", read_only=True)
    zone_type = serializers.CharField(source="zone.zone_type", read_only=True)

    class Meta:
        model = ZoneAlert
        fields = "__all__"
