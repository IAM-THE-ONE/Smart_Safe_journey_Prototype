from django.urls import path
from . import views

urlpatterns = [
    path("zones/", views.ZoneListCreateView.as_view(), name="zone-list"),
    path("zones/<int:pk>/", views.ZoneDetailView.as_view(), name="zone-detail"),
    path("check/", views.CheckZoneView.as_view(), name="zone-check"),
    path("alerts/", views.ZoneAlertListView.as_view(), name="zone-alerts"),
    path("alerts/<int:pk>/read/", views.MarkAlertReadView.as_view(), name="zone-alert-read"),
]
