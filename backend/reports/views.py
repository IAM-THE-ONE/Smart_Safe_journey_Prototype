import csv
import io
from datetime import datetime, timedelta
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from incidents.models import Incident
from tourists.models import TouristProfile

User = get_user_model()


class GenerateIncidentReportView(views.APIView):
    def get(self, request):
        format = request.query_params.get("format", "csv")
        incidents = Incident.objects.all().order_by("-created_at")

        if format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = "attachment; filename=incident_report.csv"
            writer = csv.writer(response)
            writer.writerow(["Ticket ID", "Title", "Category", "Severity", "Status", "Reporter", "Date", "Location"])
            for inc in incidents:
                writer.writerow([inc.ticket_id, inc.title, inc.category, inc.severity, inc.status, str(inc.reporter), inc.created_at.date(), f"{inc.latitude},{inc.longitude}"])
            return response

        return Response({"count": incidents.count(), "incidents": list(incidents.values("ticket_id", "title", "severity", "status", "created_at"))})


class GenerateTouristReportView(views.APIView):
    def get(self, request):
        format = request.query_params.get("format", "csv")
        tourists = User.objects.filter(role="tourist").select_related("tourist_profile")

        if format == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = "attachment; filename=tourist_report.csv"
            writer = csv.writer(response)
            writer.writerow(["Name", "Email", "Phone", "Nationality", "Destination", "On Trip", "Joined Date"])
            for t in tourists:
                profile = getattr(t, "tourist_profile", None)
                writer.writerow([
                    t.get_full_name(), t.email, t.phone,
                    profile.nationality if profile else "",
                    profile.destination if profile else "",
                    "Yes" if profile and profile.is_on_trip else "No",
                    t.date_joined.date(),
                ])
            return response

        return Response({"count": tourists.count()})


class MonthlyAnalyticsView(views.APIView):
    def get(self, request):
        now = timezone.now()
        start_date = now - timedelta(days=30)
        incidents = Incident.objects.filter(created_at__gte=start_date)
        return Response({
            "total_incidents": incidents.count(),
            "by_status": {
                "reported": incidents.filter(status="reported").count(),
                "in_progress": incidents.filter(status="in_progress").count(),
                "resolved": incidents.filter(status="resolved").count(),
                "closed": incidents.filter(status="closed").count(),
            },
            "by_severity": {
                "low": incidents.filter(severity="low").count(),
                "moderate": incidents.filter(severity="moderate").count(),
                "high": incidents.filter(severity="high").count(),
                "critical": incidents.filter(severity="critical").count(),
            },
            "active_tourists": TouristProfile.objects.filter(is_on_trip=True).count(),
            "new_registrations": User.objects.filter(role="tourist", date_joined__gte=start_date).count(),
        })


class SafetyReportView(views.APIView):
    def get(self, request):
        from geofencing.models import Zone
        zones = Zone.objects.filter(is_active=True)
        return Response({
            "safe_zones": zones.filter(zone_type="safe").count(),
            "restricted_zones": zones.filter(zone_type="restricted").count(),
            "high_risk_zones": zones.filter(zone_type="high_risk").count(),
            "total_alerts": sum(z.alerts.count() for z in zones),
            "zones": list(zones.values("name", "zone_type", "latitude", "longitude")),
        })
