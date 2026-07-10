from django.urls import path
from . import views

urlpatterns = [
    path("profile/", views.TouristProfileView.as_view(), name="tourist-profile"),
    path("profile/update/", views.UpdateTouristProfileView.as_view(), name="tourist-profile-update"),
    path("emergency-contacts/", views.EmergencyContactListCreateView.as_view(), name="emergency-contacts"),
    path("emergency-contacts/<int:pk>/", views.EmergencyContactDetailView.as_view(), name="emergency-contact-detail"),
    path("digital-id/", views.DigitalTouristIDView.as_view(), name="digital-id"),
    path("generate-qr/", views.GenerateQRView.as_view(), name="generate-qr"),
    path("verify-qr/", views.VerifyQRView.as_view(), name="verify-qr"),
    path("trip-history/", views.TripHistoryListView.as_view(), name="trip-history"),
    path("live-location/", views.LiveLocationView.as_view(), name="live-location"),
    path("all/", views.AllTouristsListView.as_view(), name="all-tourists"),
    path("<int:pk>/", views.TouristDetailView.as_view(), name="tourist-detail"),
    path("nearby/", views.NearbyTouristsView.as_view(), name="nearby-tourists"),
]
