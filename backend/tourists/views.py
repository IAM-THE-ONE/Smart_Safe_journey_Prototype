import io
import qrcode
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import TouristProfile, DigitalTouristID, EmergencyContact, TripHistory, LiveLocation
from .serializers import (
    TouristProfileSerializer, TouristProfileUpdateSerializer, DigitalTouristIDSerializer,
    EmergencyContactSerializer, TripHistorySerializer, LiveLocationSerializer,
    QRVerifySerializer, TouristSimpleSerializer,
)
from accounts.permissions import IsTourist, IsPoliceOrTourismDept
from accounts.models import User


class TouristProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TouristProfileSerializer

    def get_object(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        return profile


class UpdateTouristProfileView(generics.UpdateAPIView):
    serializer_class = TouristProfileUpdateSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        return profile


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer

    def get_queryset(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        return EmergencyContact.objects.filter(tourist=profile)

    def perform_create(self, serializer):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        serializer.save(tourist=profile)


class EmergencyContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmergencyContactSerializer

    def get_queryset(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        return EmergencyContact.objects.filter(tourist=profile)


class DigitalTouristIDView(generics.RetrieveAPIView):
    serializer_class = DigitalTouristIDSerializer

    def get_object(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        digital_id, _ = DigitalTouristID.objects.get_or_create(tourist=profile)
        return digital_id


class GenerateQRView(views.APIView):
    def get(self, request):
        profile, _ = TouristProfile.objects.get_or_create(user=request.user)
        digital_id, _ = DigitalTouristID.objects.get_or_create(tourist=profile)
        qr_data = f"safevoyage://verify?id={digital_id.unique_id}"
        img = qrcode.make(qr_data)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return HttpResponse(buffer, content_type="image/png")


class VerifyQRView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsPoliceOrTourismDept]

    def post(self, request):
        serializer = QRVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            digital_id = DigitalTouristID.objects.get(unique_id=serializer.validated_data["unique_id"])
            digital_id.is_verified = True
            digital_id.verified_by = request.user
            digital_id.verified_at = timezone.now()
            digital_id.save()
            return Response(DigitalTouristIDSerializer(digital_id).data)
        except DigitalTouristID.DoesNotExist:
            return Response({"error": "Invalid tourist ID"}, status=status.HTTP_404_NOT_FOUND)


class TripHistoryListView(generics.ListCreateAPIView):
    serializer_class = TripHistorySerializer

    def get_queryset(self):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        return TripHistory.objects.filter(tourist=profile)

    def perform_create(self, serializer):
        profile, _ = TouristProfile.objects.get_or_create(user=self.request.user)
        serializer.save(tourist=profile)


class LiveLocationView(views.APIView):
    def post(self, request):
        profile, _ = TouristProfile.objects.get_or_create(user=request.user)
        serializer = LiveLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(tourist=profile)
        user = request.user
        user.last_latitude = serializer.validated_data["latitude"]
        user.last_longitude = serializer.validated_data["longitude"]
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AllTouristsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TouristSimpleSerializer

    def get_queryset(self):
        return TouristProfile.objects.select_related("user").all()


class TouristDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TouristProfileSerializer
    queryset = TouristProfile.objects.select_related("user").all()


class NearbyTouristsView(generics.ListAPIView):
    serializer_class = TouristSimpleSerializer

    def get_queryset(self):
        lat = float(self.request.query_params.get("latitude", 0))
        lng = float(self.request.query_params.get("longitude", 0))
        radius = float(self.request.query_params.get("radius", 1))
        from geopy.distance import distance
        profiles = TouristProfile.objects.filter(is_on_trip=True, share_live_location=True)
        nearby = []
        for p in profiles.select_related("user"):
            if p.user.last_latitude and p.user.last_longitude:
                dist = distance((lat, lng), (p.user.last_latitude, p.user.last_longitude)).km
                if dist <= radius:
                    nearby.append(p.id)
        return TouristProfile.objects.filter(id__in=nearby).select_related("user")
