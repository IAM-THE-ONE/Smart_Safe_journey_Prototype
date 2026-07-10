from rest_framework import generics, status, views
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        unread_count = queryset.filter(is_read=False).count()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "unread_count": unread_count,
            "notifications": serializer.data,
        })


class MarkNotificationReadView(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def perform_update(self, serializer):
        serializer.save(is_read=True)


class MarkAllReadView(views.APIView):
    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read"})


class CreateNotificationView(views.APIView):
    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipients = User.objects.filter(role=request.data.get("role", "")) if request.data.get("role") else User.objects.all()
        notifications = []
        for recipient in recipients:
            notifications.append(Notification(
                recipient=recipient,
                notification_type=serializer.validated_data["notification_type"],
                title=serializer.validated_data["title"],
                message=serializer.validated_data["message"],
            ))
        Notification.objects.bulk_create(notifications)
        return Response({"message": f"Notifications sent to {len(notifications)} users"}, status=status.HTTP_201_CREATED)
