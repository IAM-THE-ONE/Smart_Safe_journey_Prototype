import json
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.conf import settings
from incidents.models import Incident
from tourists.models import TouristProfile


class RiskAnalysisView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lat = request.data.get("latitude")
        lng = request.data.get("longitude")
        if not lat or not lng:
            return Response({"error": "Latitude and longitude required"}, status=status.HTTP_400_BAD_REQUEST)

        analysis = self.analyze_risk(lat, lng, request.user)
        return Response(analysis)

    def analyze_risk(self, lat, lng, user):
        from geopy.distance import distance
        nearby_incidents = Incident.objects.exclude(status="closed")
        risk_score = 25
        risk_factors = []

        for inc in nearby_incidents:
            dist = distance((lat, lng), (inc.latitude, inc.longitude)).km
            if dist < 1:
                risk_factors.append(f"Nearby incident: {inc.title} ({inc.severity}) - {dist:.2f}km away")
                if inc.severity == "critical":
                    risk_score += 25
                elif inc.severity == "high":
                    risk_score += 15
                elif inc.severity == "moderate":
                    risk_score += 8
                else:
                    risk_score += 3

        from geofencing.models import Zone
        zones = Zone.objects.filter(is_active=True)
        for zone in zones:
            dist = distance((lat, lng), (zone.latitude, zone.longitude)).m
            if dist <= zone.radius:
                risk_factors.append(f"Inside {zone.get_zone_type_display()}: {zone.name}")
                if zone.zone_type == "high_risk":
                    risk_score += 30
                elif zone.zone_type == "restricted":
                    risk_score += 20
                elif zone.zone_type == "safe":
                    risk_score -= 15

        risk_score = max(0, min(100, risk_score))

        if risk_score < 30:
            level = "safe"
            recommendation = "Area appears safe. Continue with normal precautions."
        elif risk_score < 50:
            level = "moderate"
            recommendation = "Exercise caution. Stay aware of your surroundings."
        elif risk_score < 75:
            level = "danger"
            recommendation = "High risk area detected. Consider leaving the area immediately."
        else:
            level = "critical"
            recommendation = "CRITICAL: Emergency situation detected. Seek help immediately."

        ai_explanation = self.get_ai_insights(lat, lng, risk_factors)

        return {
            "safety_score": 100 - risk_score,
            "risk_level": level,
            "risk_factors": risk_factors,
            "recommendation": recommendation,
            "ai_explanation": ai_explanation,
        }

    def get_ai_insights(self, lat, lng, factors):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return "AI insights unavailable (API key not configured). Based on data analysis, risk factors have been identified."

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-pro")
            prompt = f"""Analyze safety for location ({lat}, {lng}). Risk factors: {json.dumps(factors)}.
            Provide brief safety advice for a tourist at this location. Keep it under 100 words."""
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"AI analysis unavailable: {str(e)}"


class SafetyTipView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "tips": [
                "Always keep emergency contacts saved in your phone and the app.",
                "Share your live location with trusted contacts while traveling.",
                "Avoid visiting high-risk zones, especially after dark.",
                "Keep your Digital Tourist ID accessible at all times.",
                "Familiarize yourself with nearby police stations and hospitals.",
                "Use the SOS button immediately if you feel unsafe.",
                "Check SafeVoyage AI safety scores before visiting new areas.",
                "Keep your documents uploaded and verified on the platform.",
            ]
        })


class AIAssistantView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question = request.data.get("question", "")
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response({
                "answer": "AI assistant is not configured. Please set up the GEMINI_API_KEY environment variable.",
                "suggestions": [
                    "Contact local authorities for immediate help.",
                    "Visit the nearest police station.",
                    "Call emergency services."
                ]
            })

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-pro")
            prompt = f"""You are SafeVoyage AI, a tourism safety assistant. 
            Answer this tourist's question concisely and helpfully: {question}
            Focus on safety, travel tips, and practical advice."""
            response = model.generate_content(prompt)
            return Response({
                "answer": response.text,
                "suggestions": self.get_suggestions(question),
            })
        except Exception as e:
            return Response({
                "answer": f"I'm unable to process your request right now. Please try again later.",
                "suggestions": self.get_suggestions(question),
            })

    def get_suggestions(self, question):
        q = question.lower()
        if "police" in q or "station" in q:
            return ["Use the map to find nearby police stations", "Call 100 for emergency", "Use SOS for immediate help"]
        if "hospital" in q or "medical" in q:
            return ["Use the map to find nearby hospitals", "Call 102 for ambulance", "Use SOS for medical emergency"]
        if "passport" in q or "document" in q or "lost" in q:
            return ["Report to nearest police station", "Contact your embassy", "Use the app to report lost documents"]
        if "safe" in q or "area" in q or "risk" in q:
            return ["Check the safety score for your location", "View risk zones on the map", "Follow AI safety recommendations"]
        return ["Check the help center for more information", "Contact tourism department", "Use SOS for emergencies"]


class IncidentSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        incident_id = request.data.get("incident_id")
        if not incident_id:
            return Response({"error": "incident_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            incident = Incident.objects.get(id=incident_id)
        except Incident.DoesNotExist:
            return Response({"error": "Incident not found"}, status=status.HTTP_404_NOT_FOUND)

        api_key = settings.GEMINI_API_KEY
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-pro")
                prompt = f"Summarize this incident report concisely: {incident.title} - {incident.description}. Severity: {incident.severity}. Provide a brief analysis."
                response = model.generate_content(prompt)
                return Response({"summary": response.text})
            except Exception:
                pass

        return Response({
            "summary": f"Incident {incident.ticket_id}: {incident.title} ({incident.severity}). Reported on {incident.created_at.date()}. Status: {incident.status}."
        })
