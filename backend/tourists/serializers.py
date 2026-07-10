from rest_framework import serializers
from .models import TouristProfile, DigitalTouristID, EmergencyContact, TripHistory, LiveLocation
from accounts.serializers import UserSerializer


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = "__all__"


class TouristProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)

    class Meta:
        model = TouristProfile
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at")


class TouristProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TouristProfile
        exclude = ("user",)


class DigitalTouristIDSerializer(serializers.ModelSerializer):
    tourist_name = serializers.CharField(source="tourist.user.get_full_name", read_only=True)
    nationality = serializers.CharField(source="tourist.nationality", read_only=True)
    photo = serializers.ImageField(source="tourist.user.photo", read_only=True)
    emergency_contact = serializers.CharField(source="tourist.emergency_contact_name", read_only=True)
    destination = serializers.CharField(source="tourist.destination", read_only=True)

    class Meta:
        model = DigitalTouristID
        fields = "__all__"


class TripHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TripHistory
        fields = "__all__"
        read_only_fields = ("tourist",)


class LiveLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveLocation
        fields = "__all__"
        read_only_fields = ("tourist", "timestamp")


class QRVerifySerializer(serializers.Serializer):
    unique_id = serializers.CharField()


class TouristSimpleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TouristProfile
        fields = ("id", "user", "nationality", "destination", "is_on_trip", "share_live_location")
