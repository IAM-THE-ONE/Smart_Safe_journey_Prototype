from django.urls import path
from . import views

urlpatterns = [
    path("categories/", views.IncidentCategoryListView.as_view(), name="incident-categories"),
    path("categories/manage/", views.IncidentCategoryListCreateView.as_view(), name="manage-categories"),
    path("", views.IncidentListCreateView.as_view(), name="incident-list"),
    path("nearby/", views.NearByIncidentsView.as_view(), name="incident-nearby"),
    path("<int:pk>/", views.IncidentDetailView.as_view(), name="incident-detail"),
    path("<int:pk>/update-status/", views.IncidentUpdateStatusView.as_view(), name="incident-update-status"),
    path("sos/", views.SOSCreateView.as_view(), name="sos-create"),
    path("sos/list/", views.SOSListView.as_view(), name="sos-list"),
    path("sos/<int:pk>/respond/", views.SOSRespondView.as_view(), name="sos-respond"),
]
