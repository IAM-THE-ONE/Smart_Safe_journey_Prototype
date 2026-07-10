from datetime import datetime, timedelta
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from tourists.models import TouristProfile
from incidents.models import Incident, SOSAlert
from geofencing.models import Zone, ZoneAlert

User = get_user_model()


class AdminDashboardView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return Response({
            "registered_tourists": User.objects.filter(role="tourist").count(),
            "active_trips": TouristProfile.objects.filter(is_on_trip=True).count(),
            "incidents_today": Incident.objects.filter(created_at__gte=today_start).count(),
            "pending_cases": Incident.objects.exclude(status__in=["resolved", "closed"]).count(),
            "high_risk_alerts": ZoneAlert.objects.filter(is_read=False).count(),
            "police_online": User.objects.filter(role="police", is_online=True).count(),
            "active_sos": SOSAlert.objects.filter(is_active=True).count(),
            "total_zones": Zone.objects.filter(is_active=True).count(),
            "recent_incidents": list(Incident.objects.order_by("-created_at")[:5].values(
                "ticket_id", "title", "severity", "status", "created_at"
            )),
            "incident_by_type": list(Incident.objects.values("category__name")
                .annotate(count=Count("id")).order_by("-count")),
            "monthly_reports": list(Incident.objects
                .filter(created_at__gte=now - timedelta(days=30))
                .extra({"date": "date(created_at)"})
                .values("date").annotate(count=Count("id")).order_by("date")),
        })


class PoliceDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "assigned_incidents": Incident.objects.filter(assigned_to=user).count(),
            "resolved_incidents": Incident.objects.filter(assigned_to=user, status="resolved").count(),
            "pending_incidents": Incident.objects.filter(
                assigned_to=user
            ).exclude(status__in=["resolved", "closed"]).count(),
            "nearby_sos": SOSAlert.objects.filter(is_active=True).count(),
            "my_cases": list(Incident.objects.filter(assigned_to=user).values(
                "ticket_id", "title", "severity", "status", "created_at"
            ).order_by("-created_at")[:10]),
        })


class TourismDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "total_tourists": User.objects.filter(role="tourist").count(),
            "active_trips": TouristProfile.objects.filter(is_on_trip=True).count(),
            "pending_verifications": User.objects.filter(role="tourist", digital_id__status="pending").count(),
            "total_incidents": Incident.objects.count(),
            "tourist_growth": list(User.objects.filter(role="tourist", date_joined__gte=timezone.now() - timedelta(days=30))
                .extra({"date": "date(date_joined)"})
                .values("date").annotate(count=Count("id")).order_by("date")),
            "recent_tourists": list(User.objects.filter(role="tourist").values(
                "id", "username", "first_name", "last_name", "date_joined"
            ).order_by("-date_joined")[:10]),
        })


class TouristDashboardView(views.APIView):
    def get(self, request):
        profile = TouristProfile.objects.filter(user=request.user).first()
        incidents = Incident.objects.filter(reporter=request.user)
        sos = SOSAlert.objects.filter(tourist=request.user)
        alerts = ZoneAlert.objects.filter(tourist=request.user, is_read=False)
        return Response({
            "on_trip": profile.is_on_trip if profile else False,
            "total_incidents": incidents.count(),
            "open_incidents": incidents.exclude(status__in=["resolved", "closed"]).count(),
            "total_sos": sos.count(),
            "unread_alerts": alerts.count(),
            "safety_score": self.calculate_safety_score(request.user),
            "current_trip": self.get_current_trip(profile),
            "recent_incidents": list(incidents.order_by("-created_at")[:5].values(
                "ticket_id", "title", "severity", "status", "created_at"
            )),
        })

    def calculate_safety_score(self, user):
        score = 85
        alerts = ZoneAlert.objects.filter(tourist=user)
        if alerts.filter(is_read=False).exists():
            score -= 10
        incidents = Incident.objects.filter(reporter=user)
        if incidents.filter(severity="critical").exists():
            score -= 15
        elif incidents.filter(severity="high").exists():
            score -= 10
        return max(0, min(100, score))

    def get_current_trip(self, profile):
        if not profile or not profile.is_on_trip:
            return None
        return {
            "destination": profile.destination,
            "start_date": profile.trip_start_date,
            "end_date": profile.trip_end_date,
        }
