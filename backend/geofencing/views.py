from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import Zone, ZoneAlert
from .serializers import ZoneSerializer, ZoneAlertSerializer
from accounts.permissions import IsAdminOrTourismDept


class ZoneListCreateView(generics.ListCreateAPIView):
    serializer_class = ZoneSerializer

    def get_queryset(self):
        queryset = Zone.objects.filter(is_active=True)
        zone_type = self.request.query_params.get("zone_type")
        if zone_type:
            queryset = queryset.filter(zone_type=zone_type)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer


class CheckZoneView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        lat = request.data.get("latitude")
        lng = request.data.get("longitude")
        from geopy.distance import distance
        zones = Zone.objects.filter(is_active=True)
        alerts = []
        for zone in zones:
            dist = distance((lat, lng), (zone.latitude, zone.longitude)).m
            if dist <= zone.radius:
                alerts.append({
                    "zone": ZoneSerializer(zone).data,
                    "distance_meters": dist,
                })
        return Response(alerts)


class ZoneAlertListView(generics.ListAPIView):
    serializer_class = ZoneAlertSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "tourist":
            return ZoneAlert.objects.filter(tourist=user)
        return ZoneAlert.objects.all()


class MarkAlertReadView(generics.UpdateAPIView):
    queryset = ZoneAlert.objects.all()
    serializer_class = ZoneAlertSerializer

    def perform_update(self, serializer):
        serializer.save(is_read=True)
