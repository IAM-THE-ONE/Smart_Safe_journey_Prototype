from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.utils import timezone
from .models import Incident, IncidentCategory, SOSAlert
from .serializers import (
    IncidentSerializer, IncidentCreateSerializer, IncidentUpdateSerializer,
    IncidentCategorySerializer, SOSAlertSerializer, SOSCreateSerializer,
)
from accounts.permissions import IsTourist


class IncidentCategoryListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = IncidentCategory.objects.filter(is_active=True)
    serializer_class = IncidentCategorySerializer


class IncidentListCreateView(generics.ListCreateAPIView):
    serializer_class = IncidentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "tourist":
            return Incident.objects.filter(reporter=user)
        return Incident.objects.all()

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class IncidentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = IncidentSerializer
    queryset = Incident.objects.all()

    def perform_update(self, serializer):
        if serializer.validated_data.get("status") == "resolved":
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()


class IncidentUpdateStatusView(generics.UpdateAPIView):
    serializer_class = IncidentUpdateSerializer
    queryset = Incident.objects.all()

    def perform_update(self, serializer):
        if serializer.validated_data.get("status") in ("resolved", "closed"):
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()


class IncidentCategoryListCreateView(generics.ListCreateAPIView):
    queryset = IncidentCategory.objects.all()
    serializer_class = IncidentCategorySerializer


class SOSCreateView(views.APIView):
    def post(self, request):
        serializer = SOSCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sos = SOSAlert.objects.create(
            tourist=request.user,
            latitude=serializer.validated_data["latitude"],
            longitude=serializer.validated_data["longitude"],
            message=serializer.validated_data.get("message", ""),
        )
        return Response(SOSAlertSerializer(sos).data, status=status.HTTP_201_CREATED)


class SOSListView(generics.ListAPIView):
    serializer_class = SOSAlertSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "tourist":
            return SOSAlert.objects.filter(tourist=user)
        return SOSAlert.objects.filter(is_active=True)


class SOSRespondView(generics.UpdateAPIView):
    queryset = SOSAlert.objects.filter(is_active=True)
    serializer_class = SOSAlertSerializer

    def perform_update(self, serializer):
        serializer.save(responded_by=self.request.user, responded_at=timezone.now(), is_active=False)


class NearByIncidentsView(generics.ListAPIView):
    serializer_class = IncidentSerializer

    def get_queryset(self):
        lat = float(self.request.query_params.get("latitude", 0))
        lng = float(self.request.query_params.get("longitude", 0))
        radius = float(self.request.query_params.get("radius", 5))
        from geopy.distance import distance
        incidents = Incident.objects.exclude(status="closed")
        nearby = []
        for inc in incidents:
            dist = distance((lat, lng), (inc.latitude, inc.longitude)).km
            if dist <= radius:
                nearby.append(inc.id)
        return Incident.objects.filter(id__in=nearby)
