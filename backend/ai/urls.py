from django.urls import path
from . import views

urlpatterns = [
    path("risk-analysis/", views.RiskAnalysisView.as_view(), name="risk-analysis"),
    path("safety-tips/", views.SafetyTipView.as_view(), name="safety-tips"),
    path("chatbot/", views.AIAssistantView.as_view(), name="ai-chatbot"),
    path("incident-summary/", views.IncidentSummaryView.as_view(), name="incident-summary"),
]
