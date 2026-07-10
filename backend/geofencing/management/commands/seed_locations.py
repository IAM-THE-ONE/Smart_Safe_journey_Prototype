from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from tourists.models import TouristProfile
from incidents.models import Incident, IncidentCategory
import random

User = get_user_model()

LOCATIONS = {
    "mumbai": {"lat": 19.0760, "lng": 72.8777},
    "delhi": {"lat": 28.7041, "lng": 77.1025},
    "bangalore": {"lat": 12.9716, "lng": 77.5946},
    "kolkata": {"lat": 22.5726, "lng": 88.3639},
    "chennai": {"lat": 13.0827, "lng": 80.2707},
    "jaipur": {"lat": 26.9124, "lng": 75.7873},
    "goa": {"lat": 15.4909, "lng": 73.8278},
    "hyderabad": {"lat": 17.3850, "lng": 78.4867},
}

SAMPLE_INCIDENTS = [
    {"title": "Chain snatching near market", "description": "Reported chain snatching incident near main market area", "severity": "high", "city": "mumbai"},
    {"title": "Suspicious bag found at station", "description": "Unattended bag reported at railway station", "severity": "critical", "city": "delhi"},
    {"title": "Road accident near junction", "description": "Minor road accident, no casualties", "severity": "moderate", "city": "bangalore"},
    {"title": "Pickpocketing in bus", "description": "Multiple pickpocketing complaints on city bus", "severity": "moderate", "city": "kolkata"},
    {"title": "Street light out in park", "description": "Street lights not working in public park", "severity": "low", "city": "chennai"},
    {"title": "Missing tourist reported", "description": "Tourist last seen near heritage site", "severity": "high", "city": "jaipur"},
    {"title": "Night club disturbance", "description": "Loud noise complaint after midnight", "severity": "low", "city": "goa"},
    {"title": "Traffic signal malfunction", "description": "Traffic signal not working at main intersection", "severity": "moderate", "city": "hyderabad"},
]

class Command(BaseCommand):
    help = "Seed live locations for demo users and sample incidents"

    def handle(self, *args, **options):
        admin = User.objects.filter(role="admin").first()
        police = list(User.objects.filter(role="police"))
        tourists = list(User.objects.filter(role="tourist"))
        tourism = list(User.objects.filter(role="tourism_dept"))

        self.stdout.write("Updating user locations...")

        cities = list(LOCATIONS.values())
        random.shuffle(cities)

        for i, p in enumerate(police):
            loc = cities[i % len(cities)]
            offset_lat = random.uniform(-0.02, 0.02)
            offset_lng = random.uniform(-0.02, 0.02)
            p.last_latitude = loc["lat"] + offset_lat
            p.last_longitude = loc["lng"] + offset_lng
            p.is_online = True
            p.save()
            self.stdout.write(f"  Police: {p.username} at {p.last_latitude:.4f}, {p.last_longitude:.4f}")

        for i, t in enumerate(tourists):
            loc = cities[(i + len(police)) % len(cities)]
            offset_lat = random.uniform(-0.015, 0.015)
            offset_lng = random.uniform(-0.015, 0.015)
            t.last_latitude = loc["lat"] + offset_lat
            t.last_longitude = loc["lng"] + offset_lng
            t.save()
            profile, _ = TouristProfile.objects.get_or_create(user=t)
            profile.is_on_trip = True
            profile.share_live_location = True
            profile.destination = list(LOCATIONS.keys())[(i + len(police)) % len(cities)].title()
            profile.save()
            self.stdout.write(f"  Tourist: {t.username} at {t.last_latitude:.4f}, {t.last_longitude:.4f}")

        for t_user in tourism:
            t_user.is_online = True
            t_user.save()

        if admin:
            admin.is_online = True
            admin.save()

        self.stdout.write("\nCreating sample incidents...")
        category, _ = IncidentCategory.objects.get_or_create(name="General", defaults={"icon": "alert"})

        for inc_data in SAMPLE_INCIDENTS:
            loc = LOCATIONS[inc_data["city"]]
            offset_lat = random.uniform(-0.01, 0.01)
            offset_lng = random.uniform(-0.01, 0.01)
            reporter = random.choice(tourists) if tourists else admin
            Incident.objects.get_or_create(
                title=inc_data["title"],
                defaults={
                    "description": inc_data["description"],
                    "severity": inc_data["severity"],
                    "latitude": loc["lat"] + offset_lat,
                    "longitude": loc["lng"] + offset_lng,
                    "reporter": reporter,
                    "category": category,
                    "address": f"Near {inc_data['city'].title()} City Center",
                }
            )
            self.stdout.write(f"  Incident: {inc_data['title']}")

        self.stdout.write(self.style.SUCCESS("\nDone! Locations and incidents seeded."))
