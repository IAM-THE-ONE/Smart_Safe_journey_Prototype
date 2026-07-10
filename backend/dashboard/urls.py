from django.urls import path
from . import views

urlpatterns = [
    path("admin/", views.AdminDashboardView.as_view(), name="dashboard-admin"),
    path("police/", views.PoliceDashboardView.as_view(), name="dashboard-police"),
    path("tourism/", views.TourismDashboardView.as_view(), name="dashboard-tourism"),
    path("tourist/", views.TouristDashboardView.as_view(), name="dashboard-tourist"),
]
