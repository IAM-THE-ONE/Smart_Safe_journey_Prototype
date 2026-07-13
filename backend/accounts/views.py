from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import os
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import requests as http_requests
from .serializers import (
    RegisterSerializer, UserSerializer, LoginSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer, FirebaseAuthSerializer,
    GoogleAuthSerializer,
)

token_generator = PasswordResetTokenGenerator()

# Initialize Firebase Admin SDK
firebase_app = None
_firebase_creds_path = os.path.join(settings.BASE_DIR, settings.FIREBASE_CREDENTIALS)
if os.path.exists(_firebase_creds_path):
    try:
        import firebase_admin
        cred = firebase_admin.credentials.Certificate(_firebase_creds_path)
        firebase_app = firebase_admin.initialize_app(cred)
    except Exception:
        pass

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.filter(username=email).first()
        if not user or not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        tokens = get_tokens_for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": tokens,
        })


class FirebaseAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = FirebaseAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if firebase_app is None:
            return Response({"error": "Firebase not configured. Add serviceAccountKey.json to firebase/ directory."},
                            status=status.HTTP_501_NOT_IMPLEMENTED)
        try:
            import firebase_admin.auth
            decoded = firebase_admin.auth.verify_id_token(serializer.validated_data["id_token"], app=firebase_app)
            email = decoded.get("email", "")
            firebase_uid = decoded.get("uid", "")
            name = decoded.get("name", "")
            photo = decoded.get("picture", "")
            user, created = User.objects.get_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    "username": firebase_uid[:30],
                    "email": email,
                    "first_name": name or "",
                    "email_verified": True,
                },
            )
            if created and photo:
                user.photo = photo
                user.save()
            tokens = get_tokens_for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens,
                "created": created,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data["access_token"]
        try:
            resp = http_requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10,
            )
            if resp.status_code != 200:
                return Response(
                    {"error": f"Google API error: {resp.status_code} {resp.text[:200]}"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            info = resp.json()
            email = info.get("email", "")
            name = info.get("name", "")
            picture = info.get("picture", "")
            google_uid = info.get("sub", "")
            if not email:
                return Response({"error": "Email not available from Google"}, status=status.HTTP_400_BAD_REQUEST)
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0][:30] or google_uid[:30],
                    "first_name": name or "",
                    "email_verified": True,
                },
            )
            tokens = get_tokens_for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens,
                "created": created,
            })
        except Exception as e:
            return Response({"error": f"Google login error: {e}"}, status=status.HTTP_401_UNAUTHORIZED)


class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"error": "Wrong password"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"message": "Password updated successfully"})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email not found"}, status=status.HTTP_404_NOT_FOUND)

        token = token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.pk}/{token}"

        email_sent = False
        if settings.EMAIL_HOST_USER:
            try:
                send_mail(
                    subject="SafeVoyage - Password Reset Request",
                    message=(
                        f"Hello {user.get_full_name() or user.username},\n\n"
                        f"You requested a password reset. Click the link below to reset your password:\n\n"
                        f"{reset_url}\n\n"
                        f"If you didn't request this, you can safely ignore this email.\n\n"
                        f"SafeVoyage Team"
                    ),
                    html_message=(
                        f"<h2>SafeVoyage - Password Reset</h2>"
                        f"<p>Hello {user.get_full_name() or user.username},</p>"
                        f"<p>You requested a password reset. Click the button below to reset your password:</p>"
                        f'<p style="text-align:center;margin:30px 0;">'
                        f'<a href="{reset_url}" '
                        f'style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;'
                        f'text-decoration:none;font-weight:600;display:inline-block;">Reset Password</a>'
                        f"</p>"
                        f"<p>If you didn't request this, you can safely ignore this email.</p>"
                        f"<p>SafeVoyage Team</p>"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                email_sent = True
            except Exception:
                pass

        return Response({
            "message": "Password reset link sent to your email" if email_sent
                       else "Email not configured. Use reset link below for development.",
            "reset_url": reset_url,
        })


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, user_id, token):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_404_NOT_FOUND)

        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired reset link"}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        if not new_password or len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successful"})


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"message": "Logged out successfully"})


class PoliceListView(generics.ListAPIView):
    queryset = User.objects.filter(role="police", is_active=True)
    serializer_class = UserSerializer


class UpdateOnlineStatusView(APIView):
    def post(self, request):
        user = request.user
        user.is_online = request.data.get("is_online", False)
        user.last_latitude = request.data.get("latitude", user.last_latitude)
        user.last_longitude = request.data.get("longitude", user.last_longitude)
        user.save()
        return Response({"message": "Status updated"})
