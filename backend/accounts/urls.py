from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("firebase/", views.FirebaseAuthView.as_view(), name="auth-firebase"),
    path("google-login/", views.GoogleLoginView.as_view(), name="auth-google-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("me/", views.UserDetailView.as_view(), name="auth-me"),
    path("change-password/", views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("forgot-password/", views.ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password/<int:user_id>/<str:token>/", views.ResetPasswordView.as_view(), name="auth-reset-password"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("police/", views.PoliceListView.as_view(), name="auth-police-list"),
    path("online-status/", views.UpdateOnlineStatusView.as_view(), name="auth-online-status"),
]
