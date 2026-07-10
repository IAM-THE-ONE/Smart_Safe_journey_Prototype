from django.urls import path
from . import views

urlpatterns = [
    path("incidents/", views.GenerateIncidentReportView.as_view(), name="report-incidents"),
    path("tourists/", views.GenerateTouristReportView.as_view(), name="report-tourists"),
    path("monthly/", views.MonthlyAnalyticsView.as_view(), name="report-monthly"),
    path("safety/", views.SafetyReportView.as_view(), name="report-safety"),
]
