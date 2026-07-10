from django.urls import path
from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("create/", views.CreateNotificationView.as_view(), name="notification-create"),
    path("<int:pk>/read/", views.MarkNotificationReadView.as_view(), name="notification-read"),
    path("mark-all-read/", views.MarkAllReadView.as_view(), name="notification-mark-all-read"),
]
