from django.urls import path
from . import views

urlpatterns = [
    path("data/", views.MapDataView.as_view(), name="map-data"),
    path("nearby/", views.NearbyPlacesView.as_view(), name="nearby-places"),
    path("search/", views.SearchView.as_view(), name="map-search"),
]
