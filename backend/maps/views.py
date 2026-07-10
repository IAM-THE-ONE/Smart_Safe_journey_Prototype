from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from tourists.models import TouristProfile, LiveLocation
from incidents.models import Incident
from geofencing.models import Zone
from accounts.serializers import UserSerializer
from tourists.serializers import TouristSimpleSerializer
from incidents.serializers import IncidentSerializer
from geofencing.serializers import ZoneSerializer

User = get_user_model()


class MapDataView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tourists_qs = TouristProfile.objects.filter(is_on_trip=True, share_live_location=True).select_related("user")
        tourists_data = []
        for t in tourists_qs:
            if t.user.last_latitude and t.user.last_longitude:
                tourists_data.append({
                    "id": t.id,
                    "name": t.user.get_full_name() or t.user.username,
                    "latitude": t.user.last_latitude,
                    "longitude": t.user.last_longitude,
                    "photo": t.user.photo.url if t.user.photo else None,
                    "destination": t.destination,
                    "safety_score": self.get_safety_score(t.user),
                })

        police_qs = User.objects.filter(role="police", is_online=True)
        police_data = [{
            "id": p.id,
            "name": p.get_full_name() or p.username,
            "latitude": p.last_latitude,
            "longitude": p.last_longitude,
            "phone": p.phone,
        } for p in police_qs if p.last_latitude and p.last_longitude]

        incidents_qs = Incident.objects.exclude(status="closed")
        incidents_data = [{
            "id": inc.id,
            "ticket_id": inc.ticket_id,
            "title": inc.title,
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "severity": inc.severity,
            "status": inc.status,
        } for inc in incidents_qs]

        zones_qs = Zone.objects.filter(is_active=True)
        zones_data = [{
            "id": z.id,
            "name": z.name,
            "zone_type": z.zone_type,
            "latitude": z.latitude,
            "longitude": z.longitude,
            "radius": z.radius,
        } for z in zones_qs]

        return Response({
            "tourists": tourists_data,
            "police": police_data,
            "incidents": incidents_data,
            "zones": zones_data,
        })

    def get_safety_score(self, user):
        from geopy.distance import distance
        score = 85
        incidents = Incident.objects.exclude(status="closed")
        for inc in incidents:
            if user.last_latitude and user.last_longitude:
                dist = distance((user.last_latitude, user.last_longitude), (inc.latitude, inc.longitude)).km
                if dist < 1:
                    score -= 10 if inc.severity in ("high", "critical") else 5
        return max(0, min(100, score))


class NearbyPlacesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = float(request.query_params.get("latitude", 0))
        lng = float(request.query_params.get("longitude", 0))
        place_type = request.query_params.get("type", "all")

        results = {"police_stations": [], "hospitals": []}

        if place_type in ("all", "police"):
            police = User.objects.filter(role="police", is_online=True)
            from geopy.distance import distance
            for p in police:
                if p.last_latitude and p.last_longitude:
                    dist = distance((lat, lng), (p.last_latitude, p.last_longitude)).km
                    if dist <= 10:
                        results["police_stations"].append({
                            "id": p.id,
                            "name": p.get_full_name() or p.username,
                            "latitude": p.last_latitude,
                            "longitude": p.last_longitude,
                            "phone": p.phone,
                            "distance_km": round(dist, 2),
                        })
            results["police_stations"].sort(key=lambda x: x["distance_km"])

        if place_type in ("all", "hospital"):
            from .models import Hospital
            hospitals = Hospital.objects.filter(is_active=True)
            from geopy.distance import distance
            for h in hospitals:
                dist = distance((lat, lng), (h.latitude, h.longitude)).km
                if dist <= 10:
                    results["hospitals"].append({
                        "id": h.id,
                        "name": h.name,
                        "address": h.address,
                        "latitude": h.latitude,
                        "longitude": h.longitude,
                        "phone": h.phone,
                        "distance_km": round(dist, 2),
                    })
            results["hospitals"].sort(key=lambda x: x["distance_km"])

        return Response(results)


class SearchView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get("q", "").lower()
        if not q:
            return Response({"error": "Search query required"}, status=status.HTTP_400_BAD_REQUEST)

        results = {}

        tourists_qs = User.objects.filter(role="tourist")
        results["tourists"] = [{
            "id": u.id,
            "name": u.get_full_name() or u.username,
            "email": u.email,
            "role": "tourist",
        } for u in tourists_qs if q in u.get_full_name().lower() or q in u.username.lower() or q in u.email.lower()]

        incidents = Incident.objects.all()
        results["incidents"] = [{
            "id": inc.id,
            "ticket_id": inc.ticket_id,
            "title": inc.title,
            "status": inc.status,
            "severity": inc.severity,
        } for inc in incidents if q in inc.title.lower() or q in inc.ticket_id.lower()]

        zones = Zone.objects.filter(is_active=True)
        results["zones"] = [{
            "id": z.id,
            "name": z.name,
            "zone_type": z.zone_type,
        } for z in zones if q in z.name.lower()]

        return Response(results)
